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
 *   { stage, remainingStages: { <stageName>: { p10Days, p50Days, p90Days, sampleSize } }, methodologyVersion }
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

/** Number of Monte-Carlo simulation iterations per stage. */
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
export const STAGES = Object.freeze(['committee', 'plenary', 'trilogue', 'adoption']);

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
 * Uses classifyEventStage on the most recent event to avoid misclassifying
 * committee events containing generic "adopted" keywords as final adoption.
 * When `asOf` is provided, only events with date ≤ asOf are considered,
 * ensuring the snapshot is internally consistent with point-in-time cuts.
 *
 * @param {object} proc - Procedure object from procedures-feed
 * @param {number|null} [asOf=null] - Optional reference timestamp (ms); events after this are ignored
 * @returns {string} One of STAGES (defaults to 'committee' if indeterminate)
 */
export function inferCurrentStage(proc, asOf) {
  const events = proc.events || proc.stages || [];
  if (!Array.isArray(events) || events.length === 0) {
    return 'committee'; // default: assume earliest stage
  }

  // Sort events by date (most recent last) and classify from latest backward
  const sorted = events
    .filter((e) => e.date || e.startDate || e.timestamp)
    .map((e) => ({
      date: new Date(e.date || e.startDate || e.timestamp),
      text: (e.title || e.description || e.type || '').toLowerCase(),
    }))
    .filter((e) => !isNaN(e.date.getTime()))
    // When asOf is provided, exclude events after the reference date
    .filter((e) => asOf == null || e.date.getTime() <= asOf)
    .sort((a, b) => a.date - b.date);

  // Walk backward from the most recent event
  for (let i = sorted.length - 1; i >= 0; i--) {
    const stage = classifyEventStage(sorted[i].text);
    if (stage) return stage;
  }

  return 'committee';
}

/**
 * Extract stage-transition durations from historical procedures.
 * Only records true stage transitions (where prevStage !== currStage) and
 * attributes the duration (time spent) to the **source** stage — i.e., the
 * time a procedure stayed in `prevStage` before advancing to `currStage`.
 *
 * Returns an object keyed by stage with arrays of { days, weight }.
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

    // Classify each event's stage, filtering out events after asOf
    const classified = sorted
      .filter((e) => e.date.getTime() <= refTime) // Point-in-time cut
      .map((e) => ({
        ...e,
        stage: classifyEventStage(e.text),
      }));

    if (classified.length < 2) continue;

    // Track stage entry: when the procedure *entered* the current stage.
    // Only emit a duration when the stage changes, using the entry timestamp
    // as the start of the interval to capture full time in stage.
    let currentStage = classified[0].stage;
    let stageEntryDate = classified[0].date;

    for (let i = 1; i < classified.length; i++) {
      const curr = classified[i];
      if (!curr.stage) continue;

      if (curr.stage === currentStage) {
        // Same stage — do not update entry date; we want the full time in stage
        continue;
      }

      // Stage changed: emit duration for the *source* stage
      const daysDiff = Math.max(1, Math.round((curr.date - stageEntryDate) / (24 * 60 * 60 * 1000)));

      // Age-weighting: events within trailing 24 months get higher weight
      const ageMs = refTime - curr.date.getTime();
      const weight = ageMs <= RECENT_WINDOW_MS ? RECENT_WEIGHT : ageMs <= 2 * RECENT_WINDOW_MS ? OLDER_WEIGHT : STALE_WEIGHT;

      // Duration is attributed to the source stage (time spent there before advancing)
      if (daysDiff > 0 && daysDiff < MAX_STAGE_DURATION_DAYS && currentStage) {
        durations[currentStage].push({ days: daysDiff, weight });
      }

      // Update tracking for the new stage
      currentStage = curr.stage;
      stageEntryDate = curr.date;
    }
  }

  // Also extract timing signals from voting records
  for (const vote of votingRecords) {
    if (!vote.date && !vote.timestamp) continue;
    const voteDate = new Date(vote.date || vote.timestamp);
    if (isNaN(voteDate.getTime())) continue;

    // Skip votes in the future relative to asOf (point-in-time snapshot)
    if (voteDate.getTime() > refTime) continue;

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
 * Priority: committee keywords checked first (to prevent "draft report adopted"
 * misclassification), then specific adoption patterns, then trilogue/plenary.
 *
 * @param {string} text - Lowercased event text
 * @returns {string|null} Stage name or null
 */
export function classifyEventStage(text) {
  // Check committee first — "draft report adopted" is a committee event
  if (text.includes('committee') || text.includes('rapporteur') || text.includes('draft report')) {
    return 'committee';
  }
  // Adoption: specific patterns checked before generic plenary keywords
  // to correctly classify "adopted in plenary" as adoption (not plenary)
  if (
    text.includes('final adoption') ||
    text.includes('adopted in plenary') ||
    text.includes('final vote') ||
    text.includes('signature') ||
    (text.includes('adopt') && !text.includes('report adopt'))
  ) {
    return 'adoption';
  }
  if (text.includes('trilogue') || text.includes('trialogue') || text.includes('conciliation')) {
    return 'trilogue';
  }
  if (text.includes('plenary') || text.includes('first reading') || text.includes('second reading')) {
    return 'plenary';
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
 * Precomputes stage percentiles once (shared across all procedures) and
 * outputs priors for all remaining stages from currentStage onward.
 *
 * @param {object[]} procedures - Procedure objects
 * @param {object[]} votingRecords - Voting record objects
 * @param {number|null} seed - Optional seed for deterministic runs
 * @param {number|null} asOf - Optional reference timestamp (ms) for age-weighting; defaults to max date in dataset
 * @returns {Record<string, object>} Map from processId to forecast with all remaining stages
 */
export function computeTransitModel(procedures, votingRecords, seed, asOf) {
  const baseSeed = seed != null ? seed : Date.now();

  // Derive asOf from dataset if not explicitly provided
  const refTime = asOf != null ? asOf : deriveAsOfFromData(procedures, votingRecords);

  const durations = extractTransitionDurations(procedures, votingRecords, refTime);

  // Precompute stage percentiles once — shared across all procedures in each stage.
  // Uses a single RNG per stage (derived from baseSeed + stage name) so results are
  // deterministic and independent of procedure count/ordering.
  const stagePercentiles = {};
  for (const stage of STAGES) {
    const stageSeed = deriveProcedureSeed(baseSeed, `__stage__${stage}`);
    const stageRng = mulberry32(stageSeed);
    const mcResult = monteCarloStage(durations[stage], stageRng);
    if (mcResult) {
      stagePercentiles[stage] = mcResult;
    } else {
      // Base-rate fallback
      stagePercentiles[stage] = {
        p10Days: BASE_RATE_PRIORS[stage].p10Days,
        p50Days: BASE_RATE_PRIORS[stage].p50Days,
        p90Days: BASE_RATE_PRIORS[stage].p90Days,
        sampleSize: durations[stage] ? durations[stage].length : 0,
      };
    }
  }

  const output = {};

  for (let idx = 0; idx < procedures.length; idx++) {
    const proc = procedures[idx];
    const processId = proc.processId || proc.id || proc.reference || `unknown_${idx}`;
    const currentStage = inferCurrentStage(proc, refTime);
    const stageIdx = STAGES.indexOf(currentStage);

    // Build remaining stages object: priors for current stage and all downstream
    const remainingStages = {};
    for (let i = stageIdx; i < STAGES.length; i++) {
      const stage = STAGES[i];
      remainingStages[stage] = { ...stagePercentiles[stage] };
    }

    output[processId] = {
      stage: currentStage,
      remainingStages,
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
      // Normalize to 32-bit signed integer range (mulberry32 uses `seed | 0`)
      args.seed = parsed | 0;
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
