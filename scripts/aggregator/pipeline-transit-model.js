// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/PipelineTransitModel
 * @description Monte-Carlo helper that estimates P10/P50/P90 transit times
 * per active procedure across the four legislative pipeline stages
 * (committee → plenary → trilogue → adoption).
 *
 * Consumes stage-transition timings from `data/procedures-feed.json` and
 * `data/voting-records.json`, outputting probabilistic priors intended for
 * integration with the `legislative-pipeline-forecast.md` template once the
 * consumer wiring is complete (planned for a follow-up PR).
 *
 * Reference: analysis/methodologies/forward-projection-methodology.md §5
 *
 * Output schema per processId:
 *   { stage, p10Days, p50Days, p90Days, sampleSize, methodologyVersion }
 *
 * CLI:
 *   node scripts/aggregator/pipeline-transit-model.js \
 *     --in data/procedures-feed.json \
 *     --voting data/voting-records.json \
 *     --out cache/pipeline-transit/<runId>.json \
 *     [--seed <integer>] [--as-of <ISO date>]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Methodology version tag included in every output record. */
export const METHODOLOGY_VERSION = '1.0.0';

/** Number of Monte-Carlo simulation iterations per procedure. */
export const MC_ITERATIONS = 10_000;

/** Minimum historical sample size before base-rate fallback fires. */
export const MIN_SAMPLE_SIZE = 5;

/** Trailing window (ms) for recent-weight multiplier (24 months). */
const RECENT_WINDOW_MS = 2 * 365.25 * 24 * 60 * 60 * 1000;

/** Weight multiplier for transitions within trailing 24 months. */
const RECENT_WEIGHT = 2.0;

/** Weight multiplier for transitions 24–48 months old. */
const OLDER_WEIGHT = 1.0;

/** Weight multiplier for transitions older than 48 months. */
const STALE_WEIGHT = 0.5;

/** Maximum reasonable stage duration in days (filter outliers). */
const MAX_STAGE_DURATION_DAYS = 2000;

/** Default duration (days) for adoption-like voting records. */
const VOTING_ADOPTION_DEFAULT_DAYS = 14;

/** Default duration (days) for plenary-like voting records. */
const VOTING_PLENARY_DEFAULT_DAYS = 30;

/** Jitter half-range applied to MC samples (±20% = 0.4 total range). */
const JITTER_RANGE = 0.4;

/**
 * Tetlock-style base-rate fallback priors (days) when sample < MIN_SAMPLE_SIZE.
 * Sourced from forward-projection-methodology.md §5 and historical EP data.
 * Each entry is [P10, P50, P90].
 */
export const BASE_RATE_PRIORS = {
  committee: { p10Days: 60, p50Days: 180, p90Days: 540 },
  plenary: { p10Days: 14, p50Days: 45, p90Days: 120 },
  trilogue: { p10Days: 30, p50Days: 90, p90Days: 365 },
  adoption: { p10Days: 7, p50Days: 21, p90Days: 60 },
};

/** Ordered pipeline stages. */
export const STAGES = ['committee', 'plenary', 'trilogue', 'adoption'];

// ---------------------------------------------------------------------------
// Seeded PRNG (Mulberry32) — deterministic when --seed provided
// ---------------------------------------------------------------------------

/**
 * Mulberry32 seeded PRNG. Returns a function that produces [0,1) floats.
 *
 * @param {number} seed - Integer seed
 * @returns {() => number} Pseudo-random number generator
 */
export function mulberry32(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Derive a per-procedure seed from a base seed and a processId string.
 * Ensures output is stable regardless of input array ordering.
 *
 * @param {number} baseSeed - Global seed from CLI
 * @param {string} processId - Unique procedure identifier
 * @returns {number} Derived integer seed
 */
export function deriveProcedureSeed(baseSeed, processId) {
  let hash = baseSeed | 0;
  for (let i = 0; i < processId.length; i++) {
    hash = Math.imul(hash ^ processId.charCodeAt(i), 0x5bd1e995);
    hash ^= hash >>> 15;
  }
  return hash | 0;
}

// ---------------------------------------------------------------------------
// Data extraction helpers
// ---------------------------------------------------------------------------

/**
 * Infer the current stage of a procedure from its event timeline.
 *
 * @param {object} proc - Procedure object from procedures-feed
 * @returns {string|null} One of STAGES or null if indeterminate
 */
export function inferCurrentStage(proc) {
  const events = proc.events || proc.stages || [];
  if (!Array.isArray(events) || events.length === 0) {
    return 'committee'; // default: assume earliest stage
  }

  // Look for stage keywords in event descriptions (reverse order = latest first)
  const flatText = JSON.stringify(events).toLowerCase();
  if (flatText.includes('adoption') || flatText.includes('adopted')) return 'adoption';
  if (flatText.includes('trilogue') || flatText.includes('trialogue')) return 'trilogue';
  if (flatText.includes('plenary') || flatText.includes('first reading')) return 'plenary';
  return 'committee';
}

/**
 * Extract stage-transition durations from historical procedures.
 * Returns an object keyed by stage with arrays of { days, recencyWeight }.
 *
 * @param {object[]} procedures - Array of procedure objects
 * @param {object[]} votingRecords - Array of voting-record objects
 * @param {number} asOf - Reference timestamp (ms) for age-weighting
 * @returns {Record<string, Array<{days: number, weight: number}>>}
 */
export function extractTransitionDurations(procedures, votingRecords, asOf) {
  const durations = {
    committee: [],
    plenary: [],
    trilogue: [],
    adoption: [],
  };

  const refTime = asOf;

  for (const proc of procedures) {
    const events = proc.events || proc.stages || [];
    if (!Array.isArray(events) || events.length < 2) continue;

    // Sort events by date
    const sorted = events
      .filter((e) => e.date || e.startDate || e.timestamp)
      .map((e) => ({
        date: new Date(e.date || e.startDate || e.timestamp),
        text: (e.title || e.description || e.type || '').toLowerCase(),
      }))
      .filter((e) => !isNaN(e.date.getTime()))
      .sort((a, b) => a.date - b.date);

    if (sorted.length < 2) continue;

    // Identify stage transitions
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const daysDiff = Math.max(1, Math.round((curr.date - prev.date) / (24 * 60 * 60 * 1000)));

      // Age-weighting: events within trailing 24 months get higher weight
      const ageMs = refTime - curr.date.getTime();
      const weight = ageMs <= RECENT_WINDOW_MS ? RECENT_WEIGHT : ageMs <= 2 * RECENT_WINDOW_MS ? OLDER_WEIGHT : STALE_WEIGHT;

      // Classify transition by destination stage
      const stage = classifyEventStage(curr.text);
      if (stage && daysDiff > 0 && daysDiff < MAX_STAGE_DURATION_DAYS) {
        durations[stage].push({ days: daysDiff, weight });
      }
    }
  }

  // Also extract timing signals from voting records
  for (const vote of votingRecords) {
    if (!vote.date && !vote.timestamp) continue;
    const voteDate = new Date(vote.date || vote.timestamp);
    if (isNaN(voteDate.getTime())) continue;

    const ageMs = refTime - voteDate.getTime();
    const weight = ageMs <= RECENT_WINDOW_MS ? RECENT_WEIGHT : ageMs <= 2 * RECENT_WINDOW_MS ? OLDER_WEIGHT : STALE_WEIGHT;

    // Voting records generally correspond to plenary or adoption stage
    const text = (vote.title || vote.description || vote.type || '').toLowerCase();
    if (text.includes('final') || text.includes('adopt')) {
      durations.adoption.push({ days: VOTING_ADOPTION_DEFAULT_DAYS, weight });
    } else {
      durations.plenary.push({ days: VOTING_PLENARY_DEFAULT_DAYS, weight });
    }
  }

  return durations;
}

/**
 * Classify an event's text into a pipeline stage.
 *
 * @param {string} text - Lowercased event text
 * @returns {string|null} Stage name or null
 */
export function classifyEventStage(text) {
  if (text.includes('adopt') || text.includes('final vote') || text.includes('signature')) {
    return 'adoption';
  }
  if (text.includes('trilogue') || text.includes('trialogue') || text.includes('conciliation')) {
    return 'trilogue';
  }
  if (text.includes('plenary') || text.includes('first reading') || text.includes('second reading')) {
    return 'plenary';
  }
  if (text.includes('committee') || text.includes('rapporteur') || text.includes('draft report')) {
    return 'committee';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Monte-Carlo simulation
// ---------------------------------------------------------------------------

/**
 * Run a weighted Monte-Carlo simulation to produce P10/P50/P90 for a stage.
 *
 * @param {Array<{days: number, weight: number}>} samples - Historical durations
 * @param {() => number} rng - Seeded PRNG function
 * @returns {{p10Days: number, p50Days: number, p90Days: number, sampleSize: number}}
 */
export function monteCarloStage(samples, rng) {
  if (!samples || samples.length < MIN_SAMPLE_SIZE) {
    return null; // Caller handles base-rate fallback
  }

  // Build a weighted CDF for sampling
  const totalWeight = samples.reduce((sum, s) => sum + s.weight, 0);
  const cdf = [];
  let cumulative = 0;
  for (const s of samples) {
    cumulative += s.weight / totalWeight;
    cdf.push({ days: s.days, cdf: cumulative });
  }

  // Sort CDF by cumulative probability (should already be, but ensure)
  cdf.sort((a, b) => a.cdf - b.cdf);

  // Run MC iterations: sample from weighted distribution with jitter
  const results = [];
  for (let i = 0; i < MC_ITERATIONS; i++) {
    const u = rng();
    // Binary search over CDF for O(log n) sampling
    let lo = 0;
    let hi = cdf.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (cdf[mid].cdf < u) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    const pick = cdf[lo];
    // Add small jitter (±20%) to avoid discrete spikes
    const jitter = 1 + (rng() - 0.5) * JITTER_RANGE;
    results.push(Math.max(1, Math.round(pick.days * jitter)));
  }

  // Sort and extract percentiles
  results.sort((a, b) => a - b);
  const p10 = results[Math.floor(MC_ITERATIONS * 0.1)];
  const p50 = results[Math.floor(MC_ITERATIONS * 0.5)];
  const p90 = results[Math.floor(MC_ITERATIONS * 0.9)];

  return { p10Days: p10, p50Days: p50, p90Days: p90, sampleSize: samples.length };
}

// ---------------------------------------------------------------------------
// Main model computation
// ---------------------------------------------------------------------------

/**
 * Compute transit-time priors for all active procedures.
 * Uses per-procedure RNG derived from (seed, processId) so output is
 * stable regardless of input array ordering.
 *
 * @param {object[]} procedures - Procedure objects
 * @param {object[]} votingRecords - Voting record objects
 * @param {number|null} seed - Optional seed for deterministic runs
 * @param {number|null} asOf - Optional reference timestamp (ms) for age-weighting; defaults to max date in dataset
 * @returns {Record<string, object>} Map from processId to forecast per stage
 */
export function computeTransitModel(procedures, votingRecords, seed, asOf) {
  const baseSeed = seed != null ? seed : Date.now();

  // Derive asOf from dataset if not explicitly provided
  const refTime = asOf != null ? asOf : deriveAsOfFromData(procedures, votingRecords);

  const durations = extractTransitionDurations(procedures, votingRecords, refTime);
  const output = {};

  for (const proc of procedures) {
    const processId = proc.processId || proc.id || proc.reference || 'unknown';
    const currentStage = inferCurrentStage(proc);

    // Per-procedure RNG ensures output is independent of input ordering
    const procSeed = deriveProcedureSeed(baseSeed, processId);
    const rng = mulberry32(procSeed);

    // Compute priors for remaining stages
    const stageIdx = STAGES.indexOf(currentStage);
    const stages = {};

    for (let i = stageIdx; i < STAGES.length; i++) {
      const stage = STAGES[i];
      const samples = durations[stage];
      const mcResult = monteCarloStage(samples, rng);

      if (mcResult) {
        stages[stage] = {
          ...mcResult,
          methodologyVersion: METHODOLOGY_VERSION,
        };
      } else {
        // Base-rate fallback
        stages[stage] = {
          ...BASE_RATE_PRIORS[stage],
          sampleSize: samples ? samples.length : 0,
          methodologyVersion: METHODOLOGY_VERSION,
          fallback: true,
        };
      }
    }

    output[processId] = {
      stage: currentStage,
      p10Days: stages[currentStage].p10Days,
      p50Days: stages[currentStage].p50Days,
      p90Days: stages[currentStage].p90Days,
      sampleSize: stages[currentStage].sampleSize,
      methodologyVersion: METHODOLOGY_VERSION,
    };
  }

  return output;
}

/**
 * Derive an asOf reference timestamp from the dataset (max event/vote date).
 * Falls back to Date.now() when the dataset is empty.
 *
 * @param {object[]} procedures - Procedure objects
 * @param {object[]} votingRecords - Voting record objects
 * @returns {number} Timestamp in ms
 */
function deriveAsOfFromData(procedures, votingRecords) {
  let maxTime = 0;

  for (const proc of procedures) {
    const events = proc.events || proc.stages || [];
    if (!Array.isArray(events)) continue;
    for (const e of events) {
      const d = new Date(e.date || e.startDate || e.timestamp || 0);
      if (!isNaN(d.getTime()) && d.getTime() > maxTime) {
        maxTime = d.getTime();
      }
    }
  }

  for (const vote of votingRecords) {
    const d = new Date(vote.date || vote.timestamp || 0);
    if (!isNaN(d.getTime()) && d.getTime() > maxTime) {
      maxTime = d.getTime();
    }
  }

  return maxTime > 0 ? maxTime : Date.now();
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

/**
 * Parse CLI arguments.
 *
 * @param {string[]} argv - process.argv.slice(2)
 * @returns {{inFile: string, votingFile: string, outFile: string, seed: number|null, asOf: number|null}}
 */
export function parseArgs(argv) {
  const args = { inFile: '', votingFile: '', outFile: '', seed: null, asOf: null };

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--in' && argv[i + 1]) {
      args.inFile = argv[++i];
    } else if (argv[i] === '--voting' && argv[i + 1]) {
      args.votingFile = argv[++i];
    } else if (argv[i] === '--out' && argv[i + 1]) {
      args.outFile = argv[++i];
    } else if (argv[i] === '--seed' && argv[i + 1]) {
      const rawSeed = argv[++i];
      if (!/^-?\d+$/.test(rawSeed)) {
        process.stderr.write(`Error: --seed must be a valid integer, got "${rawSeed}"\n`);
        process.exit(1);
      }
      const parsed = parseInt(rawSeed, 10);
      if (!Number.isInteger(parsed)) {
        process.stderr.write(`Error: --seed must be a valid integer, got "${rawSeed}"\n`);
        process.exit(1);
      }
      args.seed = parsed;
    } else if (argv[i] === '--as-of' && argv[i + 1]) {
      const ts = Date.parse(argv[++i]);
      if (isNaN(ts)) {
        process.stderr.write(`Error: --as-of must be a valid ISO date, got "${argv[i]}"\n`);
        process.exit(1);
      }
      args.asOf = ts;
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      process.stdout.write(
        [
          'Usage: node scripts/aggregator/pipeline-transit-model.js [options]',
          '',
          'Options:',
          '  --in <path>       Path to procedures-feed JSON (required)',
          '  --voting <path>   Path to voting-records JSON (required)',
          '  --out <path>      Output path for transit-model JSON (required)',
          '  --seed <int>      Deterministic PRNG seed for reproducible CI runs',
          '  --as-of <date>    Reference date (ISO 8601) for age-weighting (default: max date in dataset)',
          '  --help, -h        Show this help',
          '',
        ].join('\n'),
      );
      process.exit(0);
    }
  }

  return args;
}

/**
 * CLI entry point.
 *
 * @param {string[]} argv - process.argv.slice(2)
 */
export function cli(argv) {
  const args = parseArgs(argv);

  if (!args.inFile || !args.votingFile || !args.outFile) {
    process.stderr.write(
      'Error: --in, --voting, and --out are required. Use --help for usage.\n',
    );
    process.exit(1);
  }

  // Read input files
  let procedures = [];
  let votingRecords = [];

  try {
    const rawProc = fs.readFileSync(args.inFile, 'utf8');
    const parsed = JSON.parse(rawProc);
    procedures = Array.isArray(parsed) ? parsed : parsed.items || parsed.procedures || [];
  } catch (err) {
    process.stderr.write(`Error reading procedures file: ${err.message}\n`);
    process.exit(1);
  }

  try {
    const rawVoting = fs.readFileSync(args.votingFile, 'utf8');
    const parsed = JSON.parse(rawVoting);
    votingRecords = Array.isArray(parsed) ? parsed : parsed.items || parsed.records || [];
  } catch (err) {
    process.stderr.write(`Error reading voting records file: ${err.message}\n`);
    process.exit(1);
  }

  // Compute model
  const result = computeTransitModel(procedures, votingRecords, args.seed, args.asOf);

  // Ensure output directory exists
  const outDir = path.dirname(args.outFile);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Write output
  fs.writeFileSync(args.outFile, JSON.stringify(result, null, 2) + '\n', 'utf8');
  process.stdout.write(`Transit model written to ${args.outFile} (${Object.keys(result).length} procedures)\n`);
}

// Run CLI when invoked directly
if (
  process.argv[1] &&
  (process.argv[1].endsWith('pipeline-transit-model.js') ||
    process.argv[1].endsWith('pipeline-transit-model'))
) {
  cli(process.argv.slice(2));
}
