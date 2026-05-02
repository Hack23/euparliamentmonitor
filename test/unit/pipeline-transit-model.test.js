// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  mulberry32,
  deriveProcedureSeed,
  inferCurrentStage,
  extractTransitionDurations,
  classifyEventStage,
  monteCarloStage,
  computeTransitModel,
  parseArgs,
  BASE_RATE_PRIORS,
  MIN_SAMPLE_SIZE,
  STAGES,
  METHODOLOGY_VERSION,
} from '../../scripts/aggregator/pipeline-transit-model.js';

const SCRIPT_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../scripts/aggregator/pipeline-transit-model.js',
);

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

/** Create a synthetic procedure with stage events. */
function makeProcedure(id, events = []) {
  return { processId: id, events };
}

/** Generate N synthetic procedures with realistic stage transitions (deterministic). */
function generateProcedureFixture(count) {
  const rng = mulberry32(7777); // Fixed seed for deterministic fixtures
  const procedures = [];
  const baseDate = new Date('2025-01-01');

  for (let i = 0; i < count; i++) {
    const start = new Date(baseDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const committeeDays = 60 + Math.floor(rng() * 200);
    const plenaryDays = 14 + Math.floor(rng() * 60);
    const trilogueDays = 30 + Math.floor(rng() * 120);
    const adoptionDays = 7 + Math.floor(rng() * 30);

    const committeeEnd = new Date(start.getTime() + committeeDays * 86400000);
    const plenaryEnd = new Date(committeeEnd.getTime() + plenaryDays * 86400000);
    const trilogueEnd = new Date(plenaryEnd.getTime() + trilogueDays * 86400000);
    const adoptionEnd = new Date(trilogueEnd.getTime() + adoptionDays * 86400000);

    procedures.push(
      makeProcedure(`2025/${String(i + 1).padStart(4, '0')}(COD)`, [
        { date: start.toISOString(), title: 'Committee referral' },
        { date: committeeEnd.toISOString(), title: 'Committee vote - draft report adopted' },
        { date: plenaryEnd.toISOString(), title: 'Plenary first reading' },
        { date: trilogueEnd.toISOString(), title: 'Trilogue agreement reached' },
        { date: adoptionEnd.toISOString(), title: 'Final adoption by parliament' },
      ]),
    );
  }
  return procedures;
}

/** Generate synthetic voting records. */
function generateVotingRecords(count) {
  const records = [];
  const baseDate = new Date('2025-06-01');

  for (let i = 0; i < count; i++) {
    records.push({
      date: new Date(baseDate.getTime() + i * 3 * 86400000).toISOString(),
      title: i % 3 === 0 ? 'Final vote on adoption' : 'Plenary vote on amendment',
      result: { for: 400, against: 150, abstain: 30 },
    });
  }
  return records;
}

describe('pipeline-transit-model', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'transit-model-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // -------------------------------------------------------------------------
  // Unit tests: mulberry32 PRNG
  // -------------------------------------------------------------------------

  describe('mulberry32', () => {
    it('should produce deterministic output given same seed', () => {
      const rng1 = mulberry32(42);
      const rng2 = mulberry32(42);
      const seq1 = Array.from({ length: 10 }, () => rng1());
      const seq2 = Array.from({ length: 10 }, () => rng2());
      expect(seq1).toEqual(seq2);
    });

    it('should produce different output with different seeds', () => {
      const rng1 = mulberry32(42);
      const rng2 = mulberry32(99);
      const seq1 = Array.from({ length: 5 }, () => rng1());
      const seq2 = Array.from({ length: 5 }, () => rng2());
      expect(seq1).not.toEqual(seq2);
    });

    it('should produce values in [0, 1)', () => {
      const rng = mulberry32(12345);
      for (let i = 0; i < 1000; i++) {
        const val = rng();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Unit tests: classifyEventStage
  // -------------------------------------------------------------------------

  describe('classifyEventStage', () => {
    it('should classify adoption keywords', () => {
      expect(classifyEventStage('final vote in council')).toBe('adoption');
      expect(classifyEventStage('final adoption by parliament')).toBe('adoption');
      expect(classifyEventStage('adopted in plenary session')).toBe('adoption');
      expect(classifyEventStage('signature by presidents')).toBe('adoption');
    });

    it('should classify trilogue keywords', () => {
      expect(classifyEventStage('trilogue agreement')).toBe('trilogue');
      expect(classifyEventStage('conciliation phase')).toBe('trilogue');
    });

    it('should classify plenary keywords', () => {
      expect(classifyEventStage('plenary debate')).toBe('plenary');
      expect(classifyEventStage('first reading vote')).toBe('plenary');
    });

    it('should classify committee keywords', () => {
      expect(classifyEventStage('committee referral')).toBe('committee');
      expect(classifyEventStage('rapporteur appointed')).toBe('committee');
    });

    it('should return null for unclassifiable text', () => {
      expect(classifyEventStage('some random text')).toBeNull();
    });

    it('should classify "draft report adopted" as committee (not adoption)', () => {
      expect(classifyEventStage('committee vote - draft report adopted')).toBe('committee');
      expect(classifyEventStage('draft report adopted in committee')).toBe('committee');
    });

    it('should not misclassify committee events containing "adopted"', () => {
      // These are committee-stage events that happen to contain "adopted"
      expect(classifyEventStage('draft report adopted by committee')).toBe('committee');
      expect(classifyEventStage('committee adopted opinion')).toBe('committee');
    });
  });

  // -------------------------------------------------------------------------
  // Unit tests: inferCurrentStage
  // -------------------------------------------------------------------------

  describe('inferCurrentStage', () => {
    it('should default to committee for empty events', () => {
      expect(inferCurrentStage({})).toBe('committee');
      expect(inferCurrentStage({ events: [] })).toBe('committee');
    });

    it('should detect trilogue stage', () => {
      const proc = makeProcedure('test', [
        { date: '2025-01-01', title: 'Committee referral' },
        { date: '2025-06-01', title: 'Trilogue started' },
      ]);
      expect(inferCurrentStage(proc)).toBe('trilogue');
    });

    it('should detect adoption stage', () => {
      const proc = makeProcedure('test', [
        { date: '2025-01-01', title: 'Final adoption by parliament' },
      ]);
      expect(inferCurrentStage(proc)).toBe('adoption');
    });

    it('should not misclassify "draft report adopted" as adoption stage', () => {
      const proc = makeProcedure('test', [
        { date: '2025-01-01', title: 'Committee referral' },
        { date: '2025-03-15', title: 'Committee vote - draft report adopted' },
      ]);
      expect(inferCurrentStage(proc)).toBe('committee');
    });

    it('should classify based on most recent classifiable event', () => {
      const proc = makeProcedure('test', [
        { date: '2025-01-01', title: 'Committee referral' },
        { date: '2025-03-01', title: 'Draft report adopted in committee' },
        { date: '2025-06-01', title: 'Plenary first reading' },
      ]);
      expect(inferCurrentStage(proc)).toBe('plenary');
    });

    it('should respect asOf and ignore future events', () => {
      const proc = makeProcedure('test', [
        { date: '2025-01-01', title: 'Committee referral' },
        { date: '2025-03-01', title: 'Committee vote - draft report adopted' },
        { date: '2025-06-01', title: 'Plenary first reading' },
        { date: '2025-09-01', title: 'Final adoption by parliament' },
      ]);
      // Without asOf: latest event is adoption
      expect(inferCurrentStage(proc)).toBe('adoption');
      // With asOf before plenary: should be committee
      const asOfBeforePlenary = new Date('2025-04-01').getTime();
      expect(inferCurrentStage(proc, asOfBeforePlenary)).toBe('committee');
      // With asOf after plenary but before adoption: should be plenary
      const asOfBeforeAdoption = new Date('2025-07-01').getTime();
      expect(inferCurrentStage(proc, asOfBeforeAdoption)).toBe('plenary');
    });
  });

  // -------------------------------------------------------------------------
  // Unit tests: extractTransitionDurations — stage-entry tracking
  // -------------------------------------------------------------------------

  describe('extractTransitionDurations', () => {
    it('should measure full time in stage across multiple same-stage events', () => {
      // A procedure with multiple committee events before advancing to plenary.
      // The committee duration should reflect the entire time from first committee
      // event to the plenary event, not just the last committee→plenary gap.
      const proc = makeProcedure('test', [
        { date: '2025-01-01', title: 'Committee referral' },           // +0 days
        { date: '2025-02-01', title: 'Rapporteur appointed' },          // +31 days (still committee)
        { date: '2025-04-01', title: 'Committee vote - draft report adopted' }, // +90 days (still committee)
        { date: '2025-07-01', title: 'Plenary first reading' },         // +181 days (committee→plenary transition)
      ]);

      const asOf = new Date('2026-01-01').getTime();
      const durations = extractTransitionDurations([proc], [], asOf);

      // Committee should have one duration entry covering the full time:
      // from 2025-01-01 (committee entry) to 2025-07-01 (plenary = stage change) ≈ 181 days
      expect(durations.committee).toHaveLength(1);
      expect(durations.committee[0].days).toBeGreaterThanOrEqual(180);
      expect(durations.committee[0].days).toBeLessThanOrEqual(182);
    });

    it('should not record duration for same-stage transitions', () => {
      // All events are committee — no stage change, no duration recorded
      const proc = makeProcedure('test', [
        { date: '2025-01-01', title: 'Committee referral' },
        { date: '2025-02-01', title: 'Rapporteur appointed' },
        { date: '2025-03-01', title: 'Committee hearing' },
      ]);

      const asOf = new Date('2026-01-01').getTime();
      const durations = extractTransitionDurations([proc], [], asOf);

      expect(durations.committee).toHaveLength(0);
      expect(durations.plenary).toHaveLength(0);
    });

    it('should attribute duration to source stage (not destination)', () => {
      const proc = makeProcedure('test', [
        { date: '2025-01-01', title: 'Committee referral' },
        { date: '2025-04-01', title: 'Plenary first reading' },
        { date: '2025-06-01', title: 'Trilogue started' },
      ]);

      const asOf = new Date('2026-01-01').getTime();
      const durations = extractTransitionDurations([proc], [], asOf);

      // Committee→plenary: ~90 days attributed to committee
      expect(durations.committee).toHaveLength(1);
      expect(durations.committee[0].days).toBeGreaterThanOrEqual(89);
      expect(durations.committee[0].days).toBeLessThanOrEqual(91);

      // Plenary→trilogue: ~61 days attributed to plenary
      expect(durations.plenary).toHaveLength(1);
      expect(durations.plenary[0].days).toBeGreaterThanOrEqual(60);
      expect(durations.plenary[0].days).toBeLessThanOrEqual(62);

      // No durations recorded under trilogue (it's the final stage reached)
      expect(durations.trilogue).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // Unit tests: monteCarloStage
  // -------------------------------------------------------------------------

  describe('monteCarloStage', () => {
    it('should return null when samples < MIN_SAMPLE_SIZE', () => {
      const samples = [{ days: 30, weight: 1 }, { days: 45, weight: 1 }];
      const rng = mulberry32(42);
      expect(monteCarloStage(samples, rng)).toBeNull();
    });

    it('should return null for empty input', () => {
      const rng = mulberry32(42);
      expect(monteCarloStage([], rng)).toBeNull();
      expect(monteCarloStage(null, rng)).toBeNull();
    });

    it('should produce valid percentiles for sufficient samples', () => {
      const samples = Array.from({ length: 20 }, (_, i) => ({
        days: 30 + i * 5,
        weight: 1.5,
      }));
      const rng = mulberry32(42);
      const result = monteCarloStage(samples, rng);

      expect(result).not.toBeNull();
      expect(result.p10Days).toBeGreaterThan(0);
      expect(result.p50Days).toBeGreaterThanOrEqual(result.p10Days);
      expect(result.p90Days).toBeGreaterThanOrEqual(result.p50Days);
      expect(result.sampleSize).toBe(20);
    });

    it('should produce deterministic results with same seed', () => {
      const samples = Array.from({ length: 10 }, (_, i) => ({
        days: 20 + i * 10,
        weight: 2.0,
      }));

      const result1 = monteCarloStage(samples, mulberry32(123));
      const result2 = monteCarloStage(samples, mulberry32(123));

      expect(result1).toEqual(result2);
    });
  });

  // -------------------------------------------------------------------------
  // Unit tests: computeTransitModel — empty input → base-rate fallback
  // -------------------------------------------------------------------------

  describe('computeTransitModel — empty input fallback', () => {
    it('should return empty result for empty procedures array', () => {
      const result = computeTransitModel([], [], 42);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should use base-rate fallback when no historical transitions exist', () => {
      const procedures = [makeProcedure('2025/0001(COD)', [])];
      const result = computeTransitModel(procedures, [], 42);

      expect(result['2025/0001(COD)']).toBeDefined();
      const entry = result['2025/0001(COD)'];
      expect(entry.stage).toBe('committee');
      expect(entry.remainingStages).toBeDefined();
      expect(entry.remainingStages.committee).toBeDefined();
      expect(entry.remainingStages.committee.p10Days).toBe(BASE_RATE_PRIORS.committee.p10Days);
      expect(entry.remainingStages.committee.p50Days).toBe(BASE_RATE_PRIORS.committee.p50Days);
      expect(entry.remainingStages.committee.p90Days).toBe(BASE_RATE_PRIORS.committee.p90Days);
      expect(entry.methodologyVersion).toBe(METHODOLOGY_VERSION);
      expect(entry.remainingStages.committee.sampleSize).toBe(0);
    });

    it('should produce output matching documented schema', () => {
      const procedures = [makeProcedure('2025/0001(COD)', [])];
      const result = computeTransitModel(procedures, [], 42);
      const entry = result['2025/0001(COD)'];

      // Output matches documented schema: { stage, remainingStages: {...}, methodologyVersion }
      expect(Object.keys(entry).sort()).toEqual(
        ['methodologyVersion', 'remainingStages', 'stage'].sort(),
      );
      // remainingStages should contain priors for all stages from current onward
      // (this procedure defaults to committee = index 0, so all 4 stages are included)
      expect(Object.keys(entry.remainingStages).sort()).toEqual([...STAGES].sort());
      // Each stage entry has { p10Days, p50Days, p90Days, sampleSize }
      for (const stageData of Object.values(entry.remainingStages)) {
        expect(Object.keys(stageData).sort()).toEqual(
          ['p10Days', 'p50Days', 'p90Days', 'sampleSize'].sort(),
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // Unit tests: computeTransitModel — happy path with 50 procedures
  // -------------------------------------------------------------------------

  describe('computeTransitModel — happy path with 50-procedure fixture', () => {
    it('should produce valid forecasts for 50 procedures', () => {
      const procedures = generateProcedureFixture(50);
      const votingRecords = generateVotingRecords(20);
      const result = computeTransitModel(procedures, votingRecords, 42);

      expect(Object.keys(result).length).toBe(50);

      for (const [id, entry] of Object.entries(result)) {
        expect(entry.stage).toBeDefined();
        expect(STAGES).toContain(entry.stage);
        expect(entry.methodologyVersion).toBe(METHODOLOGY_VERSION);
        expect(entry.remainingStages).toBeDefined();

        // remainingStages should contain current stage onward
        const stageIdx = STAGES.indexOf(entry.stage);
        for (let i = stageIdx; i < STAGES.length; i++) {
          const stageName = STAGES[i];
          expect(entry.remainingStages[stageName]).toBeDefined();
          expect(entry.remainingStages[stageName].p10Days).toBeGreaterThan(0);
          expect(entry.remainingStages[stageName].p50Days).toBeGreaterThanOrEqual(entry.remainingStages[stageName].p10Days);
          expect(entry.remainingStages[stageName].p90Days).toBeGreaterThanOrEqual(entry.remainingStages[stageName].p50Days);
          expect(entry.remainingStages[stageName].sampleSize).toBeDefined();
        }
      }
    });

    it('should produce stage-conditional priors (different stages have different distributions)', () => {
      // Create procedures at varying stages for full coverage
      const procedures = generateProcedureFixture(50);
      // Add some procedures still in committee stage (fewer events)
      for (let i = 0; i < 10; i++) {
        procedures.push(makeProcedure(`2025/C${i}(COD)`, [
          { date: '2025-03-01', title: 'Committee referral' },
          { date: '2025-04-15', title: 'Draft report in committee' },
        ]));
      }
      const votingRecords = generateVotingRecords(20);
      const result = computeTransitModel(procedures, votingRecords, 42);

      // Procedures in committee should produce priors for all remaining stages
      const committeeEntry = result['2025/C0(COD)'];
      expect(committeeEntry).toBeDefined();
      expect(committeeEntry.stage).toBe('committee');
      expect(committeeEntry.remainingStages.committee).toBeDefined();
      expect(committeeEntry.remainingStages.plenary).toBeDefined();
      expect(committeeEntry.remainingStages.trilogue).toBeDefined();
      expect(committeeEntry.remainingStages.adoption).toBeDefined();

      // Base-rate committee P50 should be larger than base-rate adoption P50
      expect(BASE_RATE_PRIORS.committee.p50Days).toBeGreaterThan(BASE_RATE_PRIORS.adoption.p50Days);
    });
  });

  // -------------------------------------------------------------------------
  // Unit tests: seed reproducibility
  // -------------------------------------------------------------------------

  describe('seed reproducibility', () => {
    it('should produce identical output with same seed', () => {
      const procedures = generateProcedureFixture(10);
      const votingRecords = generateVotingRecords(5);

      const result1 = computeTransitModel(procedures, votingRecords, 12345);
      const result2 = computeTransitModel(procedures, votingRecords, 12345);

      expect(result1).toEqual(result2);
    });

    it('should produce different RNG sequences with different seeds', () => {
      // Assert divergence at the PRNG level (not the converged percentile level)
      const rng1 = mulberry32(111);
      const rng2 = mulberry32(222);
      const seq1 = Array.from({ length: 20 }, () => rng1());
      const seq2 = Array.from({ length: 20 }, () => rng2());
      expect(seq1).not.toEqual(seq2);

      // Also verify per-procedure seed derivation produces distinct seeds
      const s1 = deriveProcedureSeed(111, '2025/0001(COD)');
      const s2 = deriveProcedureSeed(222, '2025/0001(COD)');
      expect(s1).not.toBe(s2);
    });
  });

  // -------------------------------------------------------------------------
  // Unit tests: parseArgs
  // -------------------------------------------------------------------------

  describe('parseArgs', () => {
    it('should parse all CLI flags', () => {
      const args = parseArgs([
        '--in', 'data/proc.json',
        '--voting', 'data/votes.json',
        '--out', 'cache/out.json',
        '--seed', '42',
        '--as-of', '2026-01-15T00:00:00Z',
      ]);
      expect(args.inFile).toBe('data/proc.json');
      expect(args.votingFile).toBe('data/votes.json');
      expect(args.outFile).toBe('cache/out.json');
      expect(args.seed).toBe(42);
      expect(args.asOf).toBe(Date.parse('2026-01-15T00:00:00Z'));
    });

    it('should handle missing seed (defaults to null)', () => {
      const args = parseArgs(['--in', 'a.json', '--voting', 'b.json', '--out', 'c.json']);
      expect(args.seed).toBeNull();
      expect(args.asOf).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Unit tests: deriveProcedureSeed
  // -------------------------------------------------------------------------

  describe('deriveProcedureSeed', () => {
    it('should produce same derived seed for same inputs', () => {
      const s1 = deriveProcedureSeed(42, '2025/0001(COD)');
      const s2 = deriveProcedureSeed(42, '2025/0001(COD)');
      expect(s1).toBe(s2);
    });

    it('should produce different derived seeds for different processIds', () => {
      const s1 = deriveProcedureSeed(42, '2025/0001(COD)');
      const s2 = deriveProcedureSeed(42, '2025/0002(COD)');
      expect(s1).not.toBe(s2);
    });

    it('should produce different derived seeds for different base seeds', () => {
      const s1 = deriveProcedureSeed(42, '2025/0001(COD)');
      const s2 = deriveProcedureSeed(99, '2025/0001(COD)');
      expect(s1).not.toBe(s2);
    });
  });

  // -------------------------------------------------------------------------
  // Integration test: CLI end-to-end
  // -------------------------------------------------------------------------

  describe('CLI integration', () => {
    it('should produce valid JSON output via CLI', () => {
      const procedures = generateProcedureFixture(10);
      const votingRecords = generateVotingRecords(5);

      const procFile = path.join(tmpDir, 'procedures.json');
      const votingFile = path.join(tmpDir, 'voting.json');
      const outFile = path.join(tmpDir, 'output.json');

      fs.writeFileSync(procFile, JSON.stringify(procedures));
      fs.writeFileSync(votingFile, JSON.stringify(votingRecords));

      const result = spawnSync('node', [
        SCRIPT_PATH,
        '--in', procFile,
        '--voting', votingFile,
        '--out', outFile,
        '--seed', '42',
      ], { encoding: 'utf8' });

      expect(result.status).toBe(0);
      expect(fs.existsSync(outFile)).toBe(true);

      const output = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      expect(Object.keys(output).length).toBe(10);
    });

    it('should exit with error when required args are missing', () => {
      const result = spawnSync('node', [SCRIPT_PATH], { encoding: 'utf8' });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('--in');
    });

    it('should exit with error for invalid --seed value', () => {
      const procFile = path.join(tmpDir, 'p.json');
      const votingFile = path.join(tmpDir, 'v.json');
      fs.writeFileSync(procFile, '[]');
      fs.writeFileSync(votingFile, '[]');

      const result = spawnSync('node', [
        SCRIPT_PATH, '--in', procFile, '--voting', votingFile,
        '--out', path.join(tmpDir, 'o.json'), '--seed', 'notanumber',
      ], { encoding: 'utf8' });

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('--seed must be a valid integer');
    });

    it('should reject partially-numeric --seed values like "42abc"', () => {
      const procFile = path.join(tmpDir, 'p2.json');
      const votingFile = path.join(tmpDir, 'v2.json');
      fs.writeFileSync(procFile, '[]');
      fs.writeFileSync(votingFile, '[]');

      const result = spawnSync('node', [
        SCRIPT_PATH, '--in', procFile, '--voting', votingFile,
        '--out', path.join(tmpDir, 'o2.json'), '--seed', '42abc',
      ], { encoding: 'utf8' });

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('--seed must be a valid integer');
    });

    it('should produce reproducible output with --seed', () => {
      const procedures = generateProcedureFixture(5);
      const votingRecords = generateVotingRecords(3);

      const procFile = path.join(tmpDir, 'proc.json');
      const votingFile = path.join(tmpDir, 'votes.json');
      const outFile1 = path.join(tmpDir, 'out1.json');
      const outFile2 = path.join(tmpDir, 'out2.json');

      fs.writeFileSync(procFile, JSON.stringify(procedures));
      fs.writeFileSync(votingFile, JSON.stringify(votingRecords));

      spawnSync('node', [
        SCRIPT_PATH, '--in', procFile, '--voting', votingFile,
        '--out', outFile1, '--seed', '99',
      ]);
      spawnSync('node', [
        SCRIPT_PATH, '--in', procFile, '--voting', votingFile,
        '--out', outFile2, '--seed', '99',
      ]);

      const content1 = fs.readFileSync(outFile1, 'utf8');
      const content2 = fs.readFileSync(outFile2, 'utf8');
      expect(content1).toBe(content2);
    });

    it('should handle empty input files gracefully (base-rate fallback)', () => {
      const procFile = path.join(tmpDir, 'empty-proc.json');
      const votingFile = path.join(tmpDir, 'empty-votes.json');
      const outFile = path.join(tmpDir, 'empty-out.json');

      fs.writeFileSync(procFile, JSON.stringify([]));
      fs.writeFileSync(votingFile, JSON.stringify([]));

      const result = spawnSync('node', [
        SCRIPT_PATH, '--in', procFile, '--voting', votingFile,
        '--out', outFile, '--seed', '1',
      ], { encoding: 'utf8' });

      expect(result.status).toBe(0);
      const output = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      expect(Object.keys(output)).toHaveLength(0);
    });
  });
});
