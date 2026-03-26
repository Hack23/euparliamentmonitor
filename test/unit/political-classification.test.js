// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Test/PoliticalClassification
 * @description Unit tests for the Political Intelligence Classification Framework.
 *
 * Covers:
 * - assessPoliticalSignificance (5-level significance from parliamentary data)
 * - buildImpactMatrix (multi-dimensional impact assessment)
 * - classifyPoliticalActors (actor taxonomy classification)
 * - analyzePoliticalForces (Porter-adapted political forces)
 * - serializeFrontmatter / writeAnalysisFile / writeAnalysisManifest (file I/O)
 * - compareSignificance / maxSignificance (significance utilities)
 * - SIGNIFICANCE_ORDER / IMPACT_ORDER (ordered constant arrays)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

import {
  assessPoliticalSignificance,
  buildImpactMatrix,
  classifyPoliticalActors,
  analyzePoliticalForces,
  serializeFrontmatter,
  writeAnalysisFile,
  writeAnalysisManifest,
  initializeAnalysisDirectory,
  compareSignificance,
  maxSignificance,
  FRAMEWORK_VERSION,
} from '../../scripts/utils/political-classification.js';

import {
  SIGNIFICANCE_ORDER,
  IMPACT_ORDER,
} from '../../scripts/types/political-classification.js';

// ─── Fixture helpers ─────────────────────────────────────────────────────────

function makeVoteRecord(overrides = {}) {
  return {
    title: 'EU Budget Vote 2026',
    date: '2026-03-26',
    result: 'Adopted',
    votes: { for: 450, against: 150, abstain: 30 },
    ...overrides,
  };
}

function makeControversialVote() {
  // Against > 35% of total
  return {
    title: 'Controversial Regulation',
    date: '2026-03-26',
    result: 'Adopted',
    votes: { for: 300, against: 250, abstain: 50 }, // 41.7% against
  };
}

function makeCoalition(overrides = {}) {
  return {
    groups: ['EPP', 'Renew'],
    cohesionScore: 0.82,
    alignmentTrend: 'strengthening',
    riskLevel: 'low',
    ...overrides,
  };
}

function makeVotingPattern(overrides = {}) {
  return {
    group: 'EPP',
    cohesion: 0.85,
    participation: 0.92,
    ...overrides,
  };
}

function makeProcedure(overrides = {}) {
  return {
    id: 'PROC-2024-001',
    title: 'Green Deal Amendment',
    stage: 'Committee',
    committee: 'ENVI',
    status: 'In progress',
    bottleneck: false,
    ...overrides,
  };
}

function makeAnomaly(overrides = {}) {
  return {
    type: 'party-defection',
    description: 'EPP members voted against group line',
    severity: 'high',
    ...overrides,
  };
}

function makeQuestion(overrides = {}) {
  return {
    author: 'MEP-12345',
    subject: 'Climate Policy',
    topic: 'Environment',
    date: '2026-03-26',
    status: 'Pending',
    type: 'oral',
    ...overrides,
  };
}

function makeDocument(overrides = {}) {
  return {
    title: 'ENVI Committee Report on Climate',
    type: 'REPORT',
    date: '2026-03-26',
    status: 'Draft',
    committee: 'ENVI',
    rapporteur: 'Jane Smith',
    ...overrides,
  };
}

// ─── SIGNIFICANCE_ORDER & IMPACT_ORDER ───────────────────────────────────────

describe('SIGNIFICANCE_ORDER', () => {
  it('contains all 5 significance levels in ascending order', () => {
    expect(SIGNIFICANCE_ORDER).toEqual(['routine', 'notable', 'significant', 'critical', 'historic']);
  });

  it('has routine as the lowest level', () => {
    expect(SIGNIFICANCE_ORDER[0]).toBe('routine');
  });

  it('has historic as the highest level', () => {
    expect(SIGNIFICANCE_ORDER[SIGNIFICANCE_ORDER.length - 1]).toBe('historic');
  });
});

describe('IMPACT_ORDER', () => {
  it('contains all 5 impact levels in ascending order', () => {
    expect(IMPACT_ORDER).toEqual(['none', 'low', 'moderate', 'high', 'critical']);
  });

  it('has none as the lowest level', () => {
    expect(IMPACT_ORDER[0]).toBe('none');
  });
});

// ─── assessPoliticalSignificance ─────────────────────────────────────────────

describe('assessPoliticalSignificance', () => {
  it('returns routine for empty data', () => {
    expect(assessPoliticalSignificance({})).toBe('routine');
  });

  it('returns routine for minimal, non-controversial data', () => {
    const data = {
      votingRecords: [makeVoteRecord()],
      procedures: [makeProcedure()],
    };
    expect(assessPoliticalSignificance(data)).toBe('routine');
  });

  it('returns a higher level when many controversial votes are present', () => {
    const data = {
      votingRecords: Array.from({ length: 8 }, () => makeControversialVote()),
      votingAnomalies: [makeAnomaly({ severity: 'critical' }), makeAnomaly({ severity: 'high' })],
      procedures: Array.from({ length: 10 }, (_, i) =>
        makeProcedure({ id: `P${i}`, bottleneck: i < 5 }),
      ),
    };
    const level = assessPoliticalSignificance(data);
    expect(SIGNIFICANCE_ORDER.indexOf(level)).toBeGreaterThanOrEqual(
      SIGNIFICANCE_ORDER.indexOf('notable'),
    );
  });

  it('considers coalition instability as a signal', () => {
    const data = {
      coalitions: [
        makeCoalition({ cohesionScore: 0.4, alignmentTrend: 'weakening', riskLevel: 'high' }),
        makeCoalition({ cohesionScore: 0.35, alignmentTrend: 'weakening', riskLevel: 'high' }),
      ],
      votingAnomalies: [makeAnomaly({ severity: 'high' })],
      votingRecords: [makeControversialVote(), makeControversialVote()],
    };
    const level = assessPoliticalSignificance(data);
    // With high-risk coalitions, anomalies, and controversial votes, expect at least notable
    expect(SIGNIFICANCE_ORDER.indexOf(level)).toBeGreaterThanOrEqual(
      SIGNIFICANCE_ORDER.indexOf('notable'),
    );
  });

  it('handles undefined sub-fields gracefully', () => {
    const data = {
      votingRecords: [{ title: 'Test', date: '2026-03-26', result: 'Adopted', votes: undefined }],
      procedures: [{ title: 'Test' }],
    };
    expect(() => assessPoliticalSignificance(data)).not.toThrow();
  });

  it('returns one of the valid 5 significance levels', () => {
    const result = assessPoliticalSignificance({
      votingRecords: [makeControversialVote()],
      coalitions: [makeCoalition()],
    });
    expect(SIGNIFICANCE_ORDER).toContain(result);
  });
});

// ─── buildImpactMatrix ────────────────────────────────────────────────────────

describe('buildImpactMatrix', () => {
  it('returns none impact for all dimensions on empty data', () => {
    const matrix = buildImpactMatrix({});
    expect(matrix.legislativeImpact).toBe('none');
    expect(matrix.coalitionImpact).toBe('none');
    expect(matrix.publicOpinionImpact).toBe('none');
    expect(matrix.institutionalImpact).toBe('none');
    expect(matrix.economicImpact).toBe('none');
    expect(matrix.overallSignificance).toBe('routine');
  });

  it('returns a valid ImpactLevel for each dimension', () => {
    const matrix = buildImpactMatrix({
      votingRecords: Array.from({ length: 8 }, () => makeVoteRecord()),
      coalitions: [makeCoalition({ cohesionScore: 0.5 })],
      questions: [makeQuestion(), makeQuestion({ type: 'oral' })],
      documents: [makeDocument()],
      procedures: [makeProcedure({ stage: 'plenary' }), makeProcedure({ title: 'EU Trade Agreement' })],
    });

    for (const dim of [
      matrix.legislativeImpact,
      matrix.coalitionImpact,
      matrix.publicOpinionImpact,
      matrix.institutionalImpact,
      matrix.economicImpact,
    ]) {
      expect(IMPACT_ORDER).toContain(dim);
    }
    expect(SIGNIFICANCE_ORDER).toContain(matrix.overallSignificance);
  });

  it('raises legislativeImpact for bottlenecked procedures', () => {
    const withBottleneck = buildImpactMatrix({
      procedures: Array.from({ length: 5 }, (_, i) =>
        makeProcedure({ id: `P${i}`, bottleneck: true }),
      ),
    });
    const withNone = buildImpactMatrix({});
    expect(IMPACT_ORDER.indexOf(withBottleneck.legislativeImpact)).toBeGreaterThan(
      IMPACT_ORDER.indexOf(withNone.legislativeImpact),
    );
  });

  it('raises coalitionImpact for low-cohesion weakening coalitions', () => {
    const matrix = buildImpactMatrix({
      coalitions: [
        makeCoalition({ cohesionScore: 0.2, alignmentTrend: 'weakening' }),
        makeCoalition({ cohesionScore: 0.3, alignmentTrend: 'weakening' }),
      ],
    });
    expect(IMPACT_ORDER.indexOf(matrix.coalitionImpact)).toBeGreaterThan(
      IMPACT_ORDER.indexOf('none'),
    );
  });

  it('raises economicImpact for economic-keyword documents and procedures', () => {
    const matrix = buildImpactMatrix({
      documents: [
        makeDocument({ title: 'Economic Policy Review', committee: 'ECON' }),
        makeDocument({ title: 'Budget Amendments 2026', committee: 'BUDG' }),
      ],
      procedures: [makeProcedure({ title: 'EU-US Trade Agreement Ratification' })],
    });
    expect(IMPACT_ORDER.indexOf(matrix.economicImpact)).toBeGreaterThan(
      IMPACT_ORDER.indexOf('none'),
    );
  });

  it('raises publicOpinionImpact for oral questions', () => {
    const matrix = buildImpactMatrix({
      questions: Array.from({ length: 6 }, () => makeQuestion({ type: 'oral' })),
    });
    expect(IMPACT_ORDER.indexOf(matrix.publicOpinionImpact)).toBeGreaterThan(
      IMPACT_ORDER.indexOf('none'),
    );
  });
});

// ─── classifyPoliticalActors ──────────────────────────────────────────────────

describe('classifyPoliticalActors', () => {
  it('returns empty array for empty data', () => {
    expect(classifyPoliticalActors({})).toHaveLength(0);
  });

  it('classifies rapporteurs as individual_mep', () => {
    const actors = classifyPoliticalActors({
      documents: [makeDocument({ rapporteur: 'Jane Smith' })],
    });
    const rapporteur = actors.find((a) => a.name === 'Jane Smith');
    expect(rapporteur).toBeDefined();
    expect(rapporteur?.actorType).toBe('individual_mep');
    expect(rapporteur?.influence).toBe('high');
  });

  it('classifies committee names as eu_institution', () => {
    const actors = classifyPoliticalActors({
      documents: [makeDocument({ committee: 'ENVI', rapporteur: undefined })],
    });
    const committee = actors.find((a) => a.name === 'ENVI');
    expect(committee).toBeDefined();
    expect(committee?.actorType).toBe('eu_institution');
  });

  it('classifies voting pattern groups as political_group', () => {
    const actors = classifyPoliticalActors({
      votingPatterns: [makeVotingPattern({ group: 'EPP', cohesion: 0.9 })],
    });
    const epp = actors.find((a) => a.name === 'EPP');
    expect(epp).toBeDefined();
    expect(epp?.actorType).toBe('political_group');
    expect(epp?.influence).toBe('high');
  });

  it('classifies low-cohesion groups with low influence', () => {
    const actors = classifyPoliticalActors({
      votingPatterns: [makeVotingPattern({ group: 'SmallGroup', cohesion: 0.4 })],
    });
    const group = actors.find((a) => a.name === 'SmallGroup');
    expect(group?.influence).toBe('low');
  });

  it('classifies coalition members as political_group', () => {
    const actors = classifyPoliticalActors({
      coalitions: [makeCoalition({ groups: ['EPP', 'Renew'] })],
    });
    const names = actors.map((a) => a.name);
    expect(names).toContain('EPP');
    expect(names).toContain('Renew');
    for (const name of ['EPP', 'Renew']) {
      expect(actors.find((a) => a.name === name)?.actorType).toBe('political_group');
    }
  });

  it('classifies MEP influence scores as individual_mep', () => {
    const actors = classifyPoliticalActors({
      mepScores: [{ mepName: 'Alice Müller', overallScore: 80 }],
    });
    const alice = actors.find((a) => a.name === 'Alice Müller');
    expect(alice?.actorType).toBe('individual_mep');
    expect(alice?.influence).toBe('high');
  });

  it('deduplicates actors by name (case-insensitive)', () => {
    const actors = classifyPoliticalActors({
      votingPatterns: [makeVotingPattern({ group: 'EPP' })],
      coalitions: [makeCoalition({ groups: ['EPP', 'Renew'] })],
    });
    const eppActors = actors.filter((a) => a.name.toUpperCase() === 'EPP');
    expect(eppActors).toHaveLength(1);
  });

  it('classifies committee meetings as eu_institution', () => {
    const actors = classifyPoliticalActors({
      committees: [{ committee: 'ENVI', committeeName: 'Environment Committee', date: '2026-03-26' }],
    });
    const envi = actors.find((a) => a.name === 'Environment Committee');
    expect(envi?.actorType).toBe('eu_institution');
  });

  it('all actors have a valid position', () => {
    const actors = classifyPoliticalActors({
      votingPatterns: [makeVotingPattern()],
      documents: [makeDocument()],
    });
    for (const actor of actors) {
      expect(['supportive', 'opposed', 'neutral', 'ambiguous']).toContain(actor.position);
    }
  });
});

// ─── analyzePoliticalForces ───────────────────────────────────────────────────

describe('analyzePoliticalForces', () => {
  it('returns a complete forces analysis for empty data', () => {
    const forces = analyzePoliticalForces({});
    expect(forces).toHaveProperty('coalitionPower');
    expect(forces).toHaveProperty('oppositionPower');
    expect(forces).toHaveProperty('institutionalBarriers');
    expect(forces).toHaveProperty('publicPressure');
    expect(forces).toHaveProperty('externalInfluences');
  });

  it('all force strengths are in [0, 1]', () => {
    const forces = analyzePoliticalForces({
      votingRecords: [makeVoteRecord(), makeControversialVote()],
      coalitions: [makeCoalition()],
      procedures: [makeProcedure({ bottleneck: true })],
      questions: [makeQuestion(), makeQuestion({ type: 'oral' })],
    });
    for (const force of Object.values(forces)) {
      expect(force.strength).toBeGreaterThanOrEqual(0);
      expect(force.strength).toBeLessThanOrEqual(1);
    }
  });

  it('coalitionPower reflects average cohesion', () => {
    const highCohesion = analyzePoliticalForces({
      coalitions: [makeCoalition({ cohesionScore: 0.95 })],
    });
    const lowCohesion = analyzePoliticalForces({
      coalitions: [makeCoalition({ cohesionScore: 0.3 })],
    });
    expect(highCohesion.coalitionPower.strength).toBeGreaterThan(
      lowCohesion.coalitionPower.strength,
    );
  });

  it('coalitionPower trend is increasing when coalitions are strengthening', () => {
    const forces = analyzePoliticalForces({
      coalitions: [makeCoalition({ alignmentTrend: 'strengthening' })],
    });
    expect(forces.coalitionPower.trend).toBe('increasing');
  });

  it('coalitionPower trend is decreasing when coalitions are weakening', () => {
    const forces = analyzePoliticalForces({
      coalitions: [makeCoalition({ alignmentTrend: 'weakening' })],
    });
    expect(forces.coalitionPower.trend).toBe('decreasing');
  });

  it('oppositionPower increases with more controversial votes', () => {
    const withControversy = analyzePoliticalForces({
      votingRecords: Array.from({ length: 5 }, () => makeControversialVote()),
    });
    const withoutControversy = analyzePoliticalForces({
      votingRecords: Array.from({ length: 5 }, () => makeVoteRecord()),
    });
    expect(withControversy.oppositionPower.strength).toBeGreaterThan(
      withoutControversy.oppositionPower.strength,
    );
  });

  it('institutionalBarriers increase with bottlenecked procedures', () => {
    const withBottleneck = analyzePoliticalForces({
      procedures: Array.from({ length: 4 }, () => makeProcedure({ bottleneck: true })),
    });
    const withoutBottleneck = analyzePoliticalForces({});
    expect(withBottleneck.institutionalBarriers.strength).toBeGreaterThan(
      withoutBottleneck.institutionalBarriers.strength,
    );
  });

  it('institutionalBarriers trend is increasing for >2 bottlenecks', () => {
    const forces = analyzePoliticalForces({
      procedures: Array.from({ length: 3 }, () => makeProcedure({ bottleneck: true })),
    });
    expect(forces.institutionalBarriers.trend).toBe('increasing');
  });

  it('publicPressure increases with oral questions', () => {
    const withOral = analyzePoliticalForces({
      questions: Array.from({ length: 5 }, () => makeQuestion({ type: 'oral' })),
    });
    const withWritten = analyzePoliticalForces({
      questions: Array.from({ length: 5 }, () => makeQuestion({ type: 'written' })),
    });
    expect(withOral.publicPressure.strength).toBeGreaterThan(withWritten.publicPressure.strength);
  });

  it('externalInfluences increases with geopolitical procedures', () => {
    const withExternal = analyzePoliticalForces({
      procedures: [makeProcedure({ title: 'EU-Ukraine Trade Agreement' })],
      events: [{ title: 'NATO Summit Implications', type: 'conference', date: '2026-03-26', description: 'Impact on EU foreign policy' }],
    });
    const withoutExternal = analyzePoliticalForces({});
    expect(withExternal.externalInfluences.strength).toBeGreaterThan(
      withoutExternal.externalInfluences.strength,
    );
  });

  it('all trends are valid values', () => {
    const forces = analyzePoliticalForces({
      coalitions: [makeCoalition()],
      votingRecords: [makeControversialVote()],
    });
    for (const force of Object.values(forces)) {
      expect(['increasing', 'decreasing', 'stable']).toContain(force.trend);
    }
  });

  it('all confidence levels are valid', () => {
    const forces = analyzePoliticalForces({
      coalitions: [makeCoalition()],
      votingRecords: [makeVoteRecord()],
      questions: [makeQuestion()],
      procedures: [makeProcedure()],
    });
    for (const force of Object.values(forces)) {
      expect(['high', 'medium', 'low']).toContain(force.confidence);
    }
  });
});

// ─── serializeFrontmatter ─────────────────────────────────────────────────────

describe('serializeFrontmatter', () => {
  it('produces a string starting and ending with ---', () => {
    const yaml = serializeFrontmatter({
      title: 'Test Assessment',
      date: '2026-03-26',
      analysisType: 'impact-matrix',
      significance: 'significant',
      confidence: 'high',
      methods: ['impact-matrix', 'actor-mapping'],
      articleTypes: ['committee-reports'],
    });
    expect(yaml.startsWith('---')).toBe(true);
    expect(yaml.endsWith('---')).toBe(true);
  });

  it('includes title, date, analysisType, significance, confidence', () => {
    const yaml = serializeFrontmatter({
      title: 'Test Assessment',
      date: '2026-03-26',
      analysisType: 'significance-assessment',
      significance: 'critical',
      confidence: 'medium',
      methods: ['significance-assessment'],
      articleTypes: ['week-ahead'],
    });
    expect(yaml).toContain('title: "Test Assessment"');
    expect(yaml).toContain('date: "2026-03-26"');
    expect(yaml).toContain('analysisType: "significance-assessment"');
    expect(yaml).toContain('significance: "critical"');
    expect(yaml).toContain('confidence: "medium"');
  });

  it('renders methods as YAML sequences', () => {
    const yaml = serializeFrontmatter({
      title: 'T',
      date: '2026-03-26',
      analysisType: 'actor-mapping',
      significance: 'notable',
      confidence: 'low',
      methods: ['actor-mapping', 'forces-analysis'],
      articleTypes: ['propositions'],
    });
    expect(yaml).toContain('  - "actor-mapping"');
    expect(yaml).toContain('  - "forces-analysis"');
  });

  it('renders articleTypes as YAML sequences', () => {
    const yaml = serializeFrontmatter({
      title: 'T',
      date: '2026-03-26',
      analysisType: 'forces-analysis',
      significance: 'routine',
      confidence: 'low',
      methods: ['forces-analysis'],
      articleTypes: ['committee-reports', 'propositions'],
    });
    expect(yaml).toContain('  - "committee-reports"');
    expect(yaml).toContain('  - "propositions"');
  });
});

// ─── writeAnalysisFile ────────────────────────────────────────────────────────

describe('writeAnalysisFile', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-pol-class-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('writes a file with YAML frontmatter and body', () => {
    const filePath = path.join(tmpDir, 'test.md');
    const frontmatter = {
      title: 'Test',
      date: '2026-03-26',
      analysisType: /** @type {const} */ ('impact-matrix'),
      significance: /** @type {const} */ ('notable'),
      confidence: /** @type {const} */ ('high'),
      methods: /** @type {const} */ (['impact-matrix']),
      articleTypes: /** @type {const} */ (['committee-reports']),
    };
    writeAnalysisFile(filePath, frontmatter, '# Body content\n\nSome analysis.');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('---');
    expect(content).toContain('title: "Test"');
    expect(content).toContain('# Body content');
  });

  it('creates parent directories if they do not exist', () => {
    const filePath = path.join(tmpDir, 'sub', 'deep', 'analysis.md');
    const frontmatter = {
      title: 'Deep',
      date: '2026-03-26',
      analysisType: /** @type {const} */ ('actor-mapping'),
      significance: /** @type {const} */ ('routine'),
      confidence: /** @type {const} */ ('low'),
      methods: /** @type {const} */ (['actor-mapping']),
      articleTypes: /** @type {const} */ (['propositions']),
    };
    writeAnalysisFile(filePath, frontmatter, '# Analysis');
    expect(fs.existsSync(filePath)).toBe(true);
  });
});

// ─── initializeAnalysisDirectory ─────────────────────────────────────────────

describe('initializeAnalysisDirectory', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-pol-init-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates the date-stamped run directory', () => {
    const runDir = initializeAnalysisDirectory(tmpDir, '2026-03-26');
    expect(fs.existsSync(runDir)).toBe(true);
    expect(runDir).toContain('2026-03-26');
  });

  it('creates classification/ subdirectory', () => {
    const runDir = initializeAnalysisDirectory(tmpDir, '2026-03-26');
    expect(fs.existsSync(path.join(runDir, 'classification'))).toBe(true);
  });

  it('creates data/ subdirectory', () => {
    const runDir = initializeAnalysisDirectory(tmpDir, '2026-03-26');
    expect(fs.existsSync(path.join(runDir, 'data'))).toBe(true);
  });

  it('is idempotent — does not throw if directory already exists', () => {
    initializeAnalysisDirectory(tmpDir, '2026-03-26');
    expect(() => initializeAnalysisDirectory(tmpDir, '2026-03-26')).not.toThrow();
  });
});

// ─── writeAnalysisManifest ────────────────────────────────────────────────────

describe('writeAnalysisManifest', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-pol-manifest-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes manifest.json to the run directory', () => {
    writeAnalysisManifest(tmpDir, ['committee-reports'], ['impact-matrix']);
    expect(fs.existsSync(path.join(tmpDir, 'manifest.json'))).toBe(true);
  });

  it('manifest contains correct frameworkVersion', () => {
    const manifest = writeAnalysisManifest(tmpDir, ['propositions'], ['actor-mapping']);
    expect(manifest.frameworkVersion).toBe(FRAMEWORK_VERSION);
  });

  it('manifest contains the provided article types', () => {
    const manifest = writeAnalysisManifest(
      tmpDir,
      ['committee-reports', 'propositions'],
      ['impact-matrix', 'forces-analysis'],
    );
    expect(manifest.articleTypes).toContain('committee-reports');
    expect(manifest.articleTypes).toContain('propositions');
  });

  it('manifest contains the provided methods', () => {
    const manifest = writeAnalysisManifest(tmpDir, ['week-ahead'], ['forces-analysis']);
    expect(manifest.methodsUsed).toContain('forces-analysis');
  });

  it('written JSON is parseable and matches the returned manifest', () => {
    const returned = writeAnalysisManifest(tmpDir, ['week-ahead'], ['significance-assessment']);
    const written = JSON.parse(fs.readFileSync(path.join(tmpDir, 'manifest.json'), 'utf-8'));
    expect(written.frameworkVersion).toBe(returned.frameworkVersion);
    expect(written.articleTypes).toEqual(Array.from(returned.articleTypes));
  });
});

// ─── compareSignificance ──────────────────────────────────────────────────────

describe('compareSignificance', () => {
  it('returns 0 for equal levels', () => {
    expect(compareSignificance('notable', 'notable')).toBe(0);
  });

  it('returns positive when first is greater', () => {
    expect(compareSignificance('critical', 'notable')).toBeGreaterThan(0);
  });

  it('returns negative when first is lower', () => {
    expect(compareSignificance('routine', 'significant')).toBeLessThan(0);
  });

  it('historic > critical > significant > notable > routine', () => {
    expect(compareSignificance('historic', 'critical')).toBeGreaterThan(0);
    expect(compareSignificance('critical', 'significant')).toBeGreaterThan(0);
    expect(compareSignificance('significant', 'notable')).toBeGreaterThan(0);
    expect(compareSignificance('notable', 'routine')).toBeGreaterThan(0);
  });
});

// ─── maxSignificance ──────────────────────────────────────────────────────────

describe('maxSignificance', () => {
  it('returns routine for empty array', () => {
    expect(maxSignificance([])).toBe('routine');
  });

  it('returns the single element for a one-element array', () => {
    expect(maxSignificance(['significant'])).toBe('significant');
  });

  it('returns the highest level', () => {
    expect(maxSignificance(['notable', 'critical', 'significant'])).toBe('critical');
  });

  it('handles all identical values', () => {
    expect(maxSignificance(['notable', 'notable', 'notable'])).toBe('notable');
  });

  it('identifies historic as the maximum', () => {
    expect(maxSignificance(['routine', 'notable', 'historic', 'critical'])).toBe('historic');
  });
});
