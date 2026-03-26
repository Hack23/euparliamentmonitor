// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Test/PoliticalRiskAssessment
 * @description Unit tests for political-risk-assessment utility functions.
 * Tests cover the ISMS-inspired Likelihood × Impact scoring framework,
 * Political Capital at Risk, Legislative Velocity Risk, Quantitative SWOT,
 * and Agent Risk Assessment Workflow generation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculatePoliticalRiskScore,
  assessPoliticalCapitalAtRisk,
  buildQuantitativeSWOT,
  assessLegislativeVelocityRisk,
  runAgentRiskAssessment,
  generateRiskAssessmentMarkdown,
  generatePoliticalRiskSummary,
  createScoredSWOTItem,
  createScoredOpportunityOrThreat,
  createRiskDriver,
} from '../../scripts/utils/political-risk-assessment.js';
import { ArticleCategory } from '../../scripts/types/index.js';

// ─── Fixture helpers ─────────────────────────────────────────────────────────

function makeProcedure(overrides = {}) {
  return {
    procedureId: 'PROC-001',
    title: 'Test Legislative Procedure',
    stage: 'committee',
    daysInCurrentStage: 90,
    predictedCompletion: '2026-06-01',
    ...overrides,
  };
}

// ─── calculatePoliticalRiskScore ─────────────────────────────────────────────

describe('calculatePoliticalRiskScore', () => {
  it('should return correct score for possible × moderate (0.5 × 3 = 1.5)', () => {
    const result = calculatePoliticalRiskScore('possible', 'moderate');
    expect(result.likelihoodValue).toBe(0.5);
    expect(result.impactValue).toBe(3);
    expect(result.riskScore).toBe(1.5);
    expect(result.riskLevel).toBe('medium');
  });

  it('should return correct score for rare × negligible (0.1 × 1 = 0.1)', () => {
    const result = calculatePoliticalRiskScore('rare', 'negligible');
    expect(result.riskScore).toBe(0.1);
    expect(result.riskLevel).toBe('low');
  });

  it('should return correct score for almost_certain × severe (0.9 × 5 = 4.5)', () => {
    const result = calculatePoliticalRiskScore('almost_certain', 'severe');
    expect(result.riskScore).toBe(4.5);
    expect(result.riskLevel).toBe('critical');
  });

  it('should return correct score for likely × major (0.7 × 4 = 2.8)', () => {
    const result = calculatePoliticalRiskScore('likely', 'major');
    expect(result.riskScore).toBe(2.8);
    expect(result.riskLevel).toBe('high');
  });

  it('should return correct score for unlikely × minor (0.3 × 2 = 0.6)', () => {
    const result = calculatePoliticalRiskScore('unlikely', 'minor');
    expect(result.riskScore).toBe(0.6);
    expect(result.riskLevel).toBe('low');
  });

  it('should map all likelihood levels to correct numeric values', () => {
    const expected = {
      rare: 0.1,
      unlikely: 0.3,
      possible: 0.5,
      likely: 0.7,
      almost_certain: 0.9,
    };
    for (const [level, value] of Object.entries(expected)) {
      const result = calculatePoliticalRiskScore(level, 'moderate');
      expect(result.likelihoodValue).toBe(value);
    }
  });

  it('should map all impact levels to correct numeric values', () => {
    const expected = {
      negligible: 1,
      minor: 2,
      moderate: 3,
      major: 4,
      severe: 5,
    };
    for (const [level, value] of Object.entries(expected)) {
      const result = calculatePoliticalRiskScore('possible', level);
      expect(result.impactValue).toBe(value);
    }
  });

  it('should correctly classify all risk level bands', () => {
    // low: score <= 1.0
    expect(calculatePoliticalRiskScore('rare', 'negligible').riskLevel).toBe('low'); // 0.1
    expect(calculatePoliticalRiskScore('unlikely', 'minor').riskLevel).toBe('low'); // 0.6
    expect(calculatePoliticalRiskScore('possible', 'minor').riskLevel).toBe('low'); // 1.0

    // medium: 1.0 < score <= 2.0
    expect(calculatePoliticalRiskScore('possible', 'moderate').riskLevel).toBe('medium'); // 1.5
    expect(calculatePoliticalRiskScore('unlikely', 'major').riskLevel).toBe('medium'); // 1.2

    // high: 2.0 < score <= 3.5
    expect(calculatePoliticalRiskScore('likely', 'major').riskLevel).toBe('high'); // 2.8

    // critical: score > 3.5
    expect(calculatePoliticalRiskScore('almost_certain', 'severe').riskLevel).toBe('critical'); // 4.5
    // likely × severe = 0.7 × 5 = 3.5 → high (boundary: score <= 3.5 is high)
    expect(calculatePoliticalRiskScore('likely', 'severe').riskLevel).toBe('high'); // 3.5
  });

  it('should include provided riskId and description', () => {
    const result = calculatePoliticalRiskScore(
      'likely',
      'major',
      'RISK-042',
      'AI Act Implementation Delay'
    );
    expect(result.riskId).toBe('RISK-042');
    expect(result.description).toBe('AI Act Implementation Delay');
  });

  it('should include evidence and mitigating factors', () => {
    const result = calculatePoliticalRiskScore(
      'possible',
      'moderate',
      'RISK-001',
      'Test',
      ['Evidence 1', 'Evidence 2'],
      ['Mitigation A']
    );
    expect(result.evidence).toEqual(['Evidence 1', 'Evidence 2']);
    expect(result.mitigatingFactors).toEqual(['Mitigation A']);
  });

  it('should default riskId to RISK-AUTO when not provided', () => {
    const result = calculatePoliticalRiskScore('rare', 'negligible');
    expect(result.riskId).toBe('RISK-AUTO');
  });

  it('should default confidence to medium when not provided', () => {
    const result = calculatePoliticalRiskScore('possible', 'moderate');
    expect(result.confidence).toBe('medium');
  });

  it('should accept high confidence level', () => {
    const result = calculatePoliticalRiskScore(
      'possible',
      'moderate',
      'RISK-001',
      '',
      [],
      [],
      'high'
    );
    expect(result.confidence).toBe('high');
  });

  it('should accept low confidence level', () => {
    const result = calculatePoliticalRiskScore(
      'possible',
      'moderate',
      'RISK-001',
      '',
      [],
      [],
      'low'
    );
    expect(result.confidence).toBe('low');
  });

  it('should return readonly evidence and mitigatingFactors arrays', () => {
    const result = calculatePoliticalRiskScore('possible', 'moderate');
    expect(Array.isArray(result.evidence)).toBe(true);
    expect(Array.isArray(result.mitigatingFactors)).toBe(true);
  });
});

// ─── Input validation tests ──────────────────────────────────────────────────

describe('calculatePoliticalRiskScore - input validation', () => {
  it('should throw for invalid likelihood', () => {
    expect(() => calculatePoliticalRiskScore('invalid', 'moderate')).toThrow(
      /Invalid likelihood.*invalid/
    );
  });

  it('should throw for invalid impact', () => {
    expect(() => calculatePoliticalRiskScore('possible', 'invalid')).toThrow(
      /Invalid impact.*invalid/
    );
  });

  it('should throw for empty string likelihood', () => {
    expect(() => calculatePoliticalRiskScore('', 'moderate')).toThrow(/Invalid likelihood/);
  });

  it('should throw for empty string impact', () => {
    expect(() => calculatePoliticalRiskScore('possible', '')).toThrow(/Invalid impact/);
  });
});

describe('createScoredOpportunityOrThreat - input validation', () => {
  it('should throw for invalid likelihood', () => {
    expect(() => createScoredOpportunityOrThreat('test', 'bogus', 'moderate')).toThrow(
      /Invalid likelihood.*bogus/
    );
  });

  it('should throw for invalid impact', () => {
    expect(() => createScoredOpportunityOrThreat('test', 'possible', 'bogus')).toThrow(
      /Invalid impact.*bogus/
    );
  });
});

describe('calculatePoliticalRiskScore - risk level boundaries', () => {
  it('should classify score of exactly 1.0 as low', () => {
    // possible (0.5) × minor (2) = 1.0
    const result = calculatePoliticalRiskScore('possible', 'minor');
    expect(result.riskScore).toBe(1.0);
    expect(result.riskLevel).toBe('low');
  });

  it('should classify score just above 1.0 as medium', () => {
    // unlikely (0.3) × major (4) = 1.2
    const result = calculatePoliticalRiskScore('unlikely', 'major');
    expect(result.riskScore).toBe(1.2);
    expect(result.riskLevel).toBe('medium');
  });

  it('should classify score of exactly 2.0 as medium', () => {
    // possible (0.5) × major (4) = 2.0
    const result = calculatePoliticalRiskScore('possible', 'major');
    expect(result.riskScore).toBe(2.0);
    expect(result.riskLevel).toBe('medium');
  });

  it('should classify score just above 2.0 as high', () => {
    // likely (0.7) × moderate (3) = 2.1
    const result = calculatePoliticalRiskScore('likely', 'moderate');
    expect(result.riskScore).toBe(2.1);
    expect(result.riskLevel).toBe('high');
  });

  it('should classify score of exactly 3.5 as high', () => {
    // likely (0.7) × severe (5) = 3.5
    const result = calculatePoliticalRiskScore('likely', 'severe');
    expect(result.riskScore).toBe(3.5);
    expect(result.riskLevel).toBe('high');
  });

  it('should classify score just above 3.5 as critical', () => {
    // almost_certain (0.9) × major (4) = 3.6
    const result = calculatePoliticalRiskScore('almost_certain', 'major');
    expect(result.riskScore).toBe(3.6);
    expect(result.riskLevel).toBe('critical');
  });
});

// ─── assessPoliticalCapitalAtRisk ────────────────────────────────────────────

describe('assessPoliticalCapitalAtRisk', () => {
  it('should calculate capital at risk from driver contributions', () => {
    const drivers = [
      createRiskDriver('Coalition strain', 'coalition_fracture', 20),
      createRiskDriver('Leadership transition', 'internal_dissent', 15),
    ];
    const result = assessPoliticalCapitalAtRisk('EPP Group', 'political_group', 82, drivers);
    // totalContribution = 35%, capitalAtRisk = 35% of 82 = 28.7
    expect(result.capitalAtRisk).toBeCloseTo(28.7, 1);
    expect(result.actor).toBe('EPP Group');
    expect(result.actorType).toBe('political_group');
    expect(result.currentCapital).toBe(82);
  });

  it('should clamp currentCapital to 0–100', () => {
    const result = assessPoliticalCapitalAtRisk('Test Actor', 'mep', 150, []);
    expect(result.currentCapital).toBe(100);

    const result2 = assessPoliticalCapitalAtRisk('Test Actor', 'mep', -10, []);
    expect(result2.currentCapital).toBe(0);
  });

  it('should return zero capitalAtRisk when there are no drivers', () => {
    const result = assessPoliticalCapitalAtRisk('Solo MEP', 'mep', 60, []);
    expect(result.capitalAtRisk).toBe(0);
  });

  it('should cap capitalAtRisk at currentCapital', () => {
    const drivers = [createRiskDriver('Massive risk', 'coalition_fracture', 200)];
    const result = assessPoliticalCapitalAtRisk('Actor', 'political_group', 80, drivers);
    expect(result.capitalAtRisk).toBeLessThanOrEqual(result.currentCapital);
  });

  it('should default to quarter timeHorizon', () => {
    const result = assessPoliticalCapitalAtRisk('Actor', 'mep', 50, []);
    expect(result.timeHorizon).toBe('quarter');
  });

  it('should accept all timeHorizon options', () => {
    for (const horizon of ['week', 'month', 'quarter', 'year']) {
      const result = assessPoliticalCapitalAtRisk('Actor', 'mep', 50, [], horizon);
      expect(result.timeHorizon).toBe(horizon);
    }
  });

  it('should default confidenceInterval to 95', () => {
    const result = assessPoliticalCapitalAtRisk('Actor', 'mep', 50, []);
    expect(result.confidenceInterval).toBe(95);
  });

  it('should include all provided risk drivers', () => {
    const drivers = [
      createRiskDriver('Driver A', 'legislative_delay', 10),
      createRiskDriver('Driver B', 'external_pressure', 25),
    ];
    const result = assessPoliticalCapitalAtRisk('Actor', 'committee', 70, drivers);
    expect(result.riskDrivers).toHaveLength(2);
    expect(result.riskDrivers[0].description).toBe('Driver A');
    expect(result.riskDrivers[1].description).toBe('Driver B');
  });
});

// ─── buildQuantitativeSWOT ───────────────────────────────────────────────────

describe('buildQuantitativeSWOT', () => {
  it('should return a valid QuantitativeSWOT with all fields', () => {
    const strengths = [createScoredSWOTItem('Strong coalition support', 4)];
    const weaknesses = [createScoredSWOTItem('Committee backlog', 2)];
    const opportunities = [
      createScoredOpportunityOrThreat('Green Deal alignment', 'likely', 'major'),
    ];
    const threats = [createScoredOpportunityOrThreat('Lobbying pressure', 'possible', 'moderate')];

    const result = buildQuantitativeSWOT(
      'Test SWOT',
      strengths,
      weaknesses,
      opportunities,
      threats
    );

    expect(result.title).toBe('Test SWOT');
    expect(result.strengths).toHaveLength(1);
    expect(result.weaknesses).toHaveLength(1);
    expect(result.opportunities).toHaveLength(1);
    expect(result.threats).toHaveLength(1);
    expect(result.crossImpactMatrix).toBeDefined();
    expect(result.strategicPositionScore).toBeGreaterThanOrEqual(0);
    expect(result.strategicPositionScore).toBeLessThanOrEqual(10);
    expect(typeof result.overallAssessment).toBe('string');
  });

  it('should generate cross-impact matrix entries for each strength × threat', () => {
    const strengths = [
      createScoredSWOTItem('Strength A', 3),
      createScoredSWOTItem('Strength B', 4),
    ];
    const threats = [
      createScoredOpportunityOrThreat('Threat A', 'possible', 'major'),
      createScoredOpportunityOrThreat('Threat B', 'likely', 'moderate'),
    ];

    const result = buildQuantitativeSWOT(undefined, strengths, [], [], threats);
    // 2 strengths × 2 threats = 4 entries
    const strengthEntries = result.crossImpactMatrix.filter((e) => e.swotType === 'strength');
    expect(strengthEntries).toHaveLength(4);
  });

  it('should generate cross-impact matrix entries for each weakness × threat', () => {
    const weaknesses = [createScoredSWOTItem('Weakness A', 2)];
    const threats = [
      createScoredOpportunityOrThreat('Threat A', 'possible', 'major'),
      createScoredOpportunityOrThreat('Threat B', 'likely', 'moderate'),
    ];

    const result = buildQuantitativeSWOT(undefined, [], weaknesses, [], threats);
    const weaknessEntries = result.crossImpactMatrix.filter((e) => e.swotType === 'weakness');
    expect(weaknessEntries).toHaveLength(2);
  });

  it('should assign negative netEffect for strengths (mitigation)', () => {
    const strengths = [createScoredSWOTItem('Strong support', 4)];
    const threats = [createScoredOpportunityOrThreat('Risk', 'possible', 'moderate')];

    const result = buildQuantitativeSWOT(undefined, strengths, [], [], threats);
    const strengthEntry = result.crossImpactMatrix.find((e) => e.swotType === 'strength');
    expect(strengthEntry?.netEffect).toBeLessThan(0);
  });

  it('should assign positive netEffect for weaknesses (amplification)', () => {
    const weaknesses = [createScoredSWOTItem('Weak leadership', 3)];
    const threats = [createScoredOpportunityOrThreat('Risk', 'possible', 'moderate')];

    const result = buildQuantitativeSWOT(undefined, [], weaknesses, [], threats);
    const weaknessEntry = result.crossImpactMatrix.find((e) => e.swotType === 'weakness');
    expect(weaknessEntry?.netEffect).toBeGreaterThan(0);
  });

  it('should return strategic position score of 5 for empty inputs', () => {
    const result = buildQuantitativeSWOT(undefined, [], [], [], []);
    expect(result.strategicPositionScore).toBe(5);
  });

  it('should return high strategic position score when strengths dominate', () => {
    const strengths = [createScoredSWOTItem('S1', 5), createScoredSWOTItem('S2', 4)];
    const weaknesses = [createScoredSWOTItem('W1', 1)];
    const opportunities = [createScoredOpportunityOrThreat('O1', 'likely', 'major')];
    const threats = [createScoredOpportunityOrThreat('T1', 'rare', 'minor')];

    const result = buildQuantitativeSWOT(undefined, strengths, weaknesses, opportunities, threats);
    expect(result.strategicPositionScore).toBeGreaterThan(5);
  });

  it('should return overall assessment text', () => {
    const result = buildQuantitativeSWOT(undefined, [], [], [], []);
    expect(result.overallAssessment.length).toBeGreaterThan(0);
  });
});

// ─── assessLegislativeVelocityRisk ───────────────────────────────────────────

describe('assessLegislativeVelocityRisk', () => {
  it('should return an empty array for empty input', () => {
    expect(assessLegislativeVelocityRisk([])).toEqual([]);
  });

  it('should skip non-object entries', () => {
    const result = assessLegislativeVelocityRisk([null, undefined, 'not-an-object', 42]);
    expect(result).toEqual([]);
  });

  it('should skip procedures without procedureId or title', () => {
    const result = assessLegislativeVelocityRisk([{ stage: 'committee' }]);
    expect(result).toEqual([]);
  });

  it('should return a velocity risk for a valid procedure', () => {
    const result = assessLegislativeVelocityRisk([makeProcedure()]);
    expect(result).toHaveLength(1);
    const [risk] = result;
    expect(risk.procedureId).toBe('PROC-001');
    expect(risk.title).toBe('Test Legislative Procedure');
    expect(risk.currentStage).toBe('committee');
    expect(risk.daysInCurrentStage).toBe(90);
  });

  it('should set higher risk for procedures well past expected duration', () => {
    const fast = makeProcedure({ daysInCurrentStage: 10 });
    const stalled = makeProcedure({ procedureId: 'PROC-002', daysInCurrentStage: 540 });
    const results = assessLegislativeVelocityRisk([fast, stalled]);
    expect(results).toHaveLength(2);
    // Stalled procedure should have higher risk score
    const stalledRisk = results.find((r) => r.procedureId === 'PROC-002');
    const fastRisk = results.find((r) => r.procedureId === 'PROC-001');
    expect(stalledRisk?.velocityRisk.riskScore).toBeGreaterThanOrEqual(
      fastRisk?.velocityRisk.riskScore
    );
  });

  it('should sort results by risk score descending', () => {
    const fast = makeProcedure({ daysInCurrentStage: 10 });
    const medium = makeProcedure({ procedureId: 'PROC-002', daysInCurrentStage: 200 });
    const stalled = makeProcedure({ procedureId: 'PROC-003', daysInCurrentStage: 500 });
    const results = assessLegislativeVelocityRisk([fast, medium, stalled]);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].velocityRisk.riskScore).toBeGreaterThanOrEqual(
        results[i + 1].velocityRisk.riskScore
      );
    }
  });

  it('should default unknown stage to committee', () => {
    const proc = makeProcedure({ stage: 'unknown_stage_xyz' });
    const [result] = assessLegislativeVelocityRisk([proc]);
    expect(result.currentStage).toBe('committee');
  });

  it('should handle missing daysInCurrentStage as 0', () => {
    const proc = { procedureId: 'PROC-X', title: 'No Days Proc' };
    const [result] = assessLegislativeVelocityRisk([proc]);
    expect(result.daysInCurrentStage).toBe(0);
  });

  it('should handle valid legislative stages', () => {
    const stages = [
      'proposal',
      'committee',
      'plenary_first',
      'trilogue',
      'plenary_second',
      'adopted',
      'stalled',
    ];
    for (const stage of stages) {
      const proc = makeProcedure({ stage });
      const [result] = assessLegislativeVelocityRisk([proc]);
      expect(result.currentStage).toBe(stage);
    }
  });

  it('should preserve predictedCompletion from input', () => {
    const [result] = assessLegislativeVelocityRisk([makeProcedure()]);
    expect(result.predictedCompletion).toBe('2026-06-01');
  });

  it('should return null predictedCompletion when not provided', () => {
    const proc = { procedureId: 'PROC-001', title: 'Test' };
    const [result] = assessLegislativeVelocityRisk([proc]);
    expect(result.predictedCompletion).toBeNull();
  });
});

// ─── runAgentRiskAssessment ──────────────────────────────────────────────────

describe('runAgentRiskAssessment', () => {
  function makeRisks() {
    return [
      calculatePoliticalRiskScore(
        'likely',
        'major',
        'RISK-001',
        'Risk A',
        ['Evidence A'],
        [],
        'high'
      ),
      calculatePoliticalRiskScore(
        'possible',
        'moderate',
        'RISK-002',
        'Risk B',
        [],
        ['Mitigation'],
        'medium'
      ),
    ];
  }

  function makeDrivers() {
    return [
      createRiskDriver('Coalition strain', 'coalition_fracture', 30, 'increasing'),
      createRiskDriver('External pressure', 'external_pressure', 15, 'stable'),
    ];
  }

  it('should return a workflow with all four steps', () => {
    const result = runAgentRiskAssessment(
      'ASSESS-001',
      '2026-03-26',
      ArticleCategory.WEEK_AHEAD,
      makeRisks(),
      makeDrivers(),
      ['Monitor coalition', 'Engage rapporteur']
    );
    const stepTypes = result.steps.map((s) => s.type);
    expect(stepTypes).toContain('identify');
    expect(stepTypes).toContain('analyze');
    expect(stepTypes).toContain('evaluate');
    expect(stepTypes).toContain('treat');
    expect(result.steps).toHaveLength(4);
  });

  it('should include assessment metadata', () => {
    const result = runAgentRiskAssessment(
      'ASSESS-002',
      '2026-03-26',
      ArticleCategory.BREAKING_NEWS,
      makeRisks(),
      makeDrivers(),
      []
    );
    expect(result.assessmentId).toBe('ASSESS-002');
    expect(result.date).toBe('2026-03-26');
    expect(result.articleType).toBe(ArticleCategory.BREAKING_NEWS);
  });

  it('should include identified risks in the identify step', () => {
    const risks = makeRisks();
    const result = runAgentRiskAssessment(
      'A',
      '2026-01-01',
      ArticleCategory.MOTIONS,
      risks,
      [],
      []
    );
    const identifyStep = result.steps.find((s) => s.type === 'identify');
    expect(identifyStep).toBeDefined();
    expect(identifyStep.type).toBe('identify');
    if (identifyStep.type === 'identify') {
      expect(identifyStep.risks).toHaveLength(2);
    }
  });

  it('should include risk drivers in the analyze step', () => {
    const drivers = makeDrivers();
    const result = runAgentRiskAssessment(
      'A',
      '2026-01-01',
      ArticleCategory.PROPOSITIONS,
      [],
      drivers,
      []
    );
    const analyzeStep = result.steps.find((s) => s.type === 'analyze');
    expect(analyzeStep).toBeDefined();
    if (analyzeStep?.type === 'analyze') {
      expect(analyzeStep.drivers).toHaveLength(2);
    }
  });

  it('should sort evaluate matrix by risk score descending', () => {
    const risks = [
      calculatePoliticalRiskScore('rare', 'negligible', 'LOW'),
      calculatePoliticalRiskScore('almost_certain', 'severe', 'HIGH'),
      calculatePoliticalRiskScore('possible', 'moderate', 'MED'),
    ];
    const result = runAgentRiskAssessment(
      'A',
      '2026-01-01',
      ArticleCategory.DEEP_ANALYSIS,
      risks,
      [],
      []
    );
    const evaluateStep = result.steps.find((s) => s.type === 'evaluate');
    if (evaluateStep?.type === 'evaluate') {
      const scores = evaluateStep.matrix.map((r) => r.riskScore);
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
      }
    }
  });

  it('should include mitigations in the treat step', () => {
    const mitigations = ['Action 1', 'Action 2', 'Action 3'];
    const result = runAgentRiskAssessment(
      'A',
      '2026-01-01',
      ArticleCategory.COMMITTEE_REPORTS,
      [],
      [],
      mitigations
    );
    const treatStep = result.steps.find((s) => s.type === 'treat');
    if (treatStep?.type === 'treat') {
      expect(treatStep.mitigations).toEqual(mitigations);
    }
  });

  it('should synthesise an overallRiskProfile from identified risks', () => {
    const risks = makeRisks();
    const result = runAgentRiskAssessment(
      'A',
      '2026-01-01',
      ArticleCategory.WEEK_IN_REVIEW,
      risks,
      [],
      []
    );
    expect(result.overallRiskProfile).toBeDefined();
    expect(result.overallRiskProfile.riskId).toContain('OVERALL-A');
    expect(result.overallRiskProfile.riskScore).toBeGreaterThan(0);
    // Invariant: riskScore must equal likelihoodValue × impactValue
    expect(result.overallRiskProfile.riskScore).toBeCloseTo(
      result.overallRiskProfile.likelihoodValue * result.overallRiskProfile.impactValue,
      2
    );
  });

  it('should handle an empty risks list', () => {
    const result = runAgentRiskAssessment(
      'A',
      '2026-01-01',
      ArticleCategory.WEEK_AHEAD,
      [],
      [],
      []
    );
    expect(result.overallRiskProfile.riskLevel).toBe('low');
    expect(result.overallRiskProfile.riskScore).toBe(0.1);
  });
});

// ─── generateRiskAssessmentMarkdown ──────────────────────────────────────────

describe('generateRiskAssessmentMarkdown', () => {
  function makeAssessment() {
    const risks = [
      calculatePoliticalRiskScore(
        'likely',
        'major',
        'RISK-001',
        'AI Act delay',
        ['Committee amendments > 3000'],
        ['Rapporteur leadership'],
        'high'
      ),
    ];
    return runAgentRiskAssessment(
      'ASSESS-MD-001',
      '2026-03-26',
      ArticleCategory.WEEK_AHEAD,
      risks,
      [createRiskDriver('Legislative congestion', 'legislative_delay', 40)],
      ['Expedite committee vote', 'Engage Council presidency']
    );
  }

  it('should produce a non-empty markdown string', () => {
    const md = generateRiskAssessmentMarkdown(makeAssessment());
    expect(typeof md).toBe('string');
    expect(md.length).toBeGreaterThan(0);
  });

  it('should contain YAML frontmatter', () => {
    const md = generateRiskAssessmentMarkdown(makeAssessment());
    expect(md).toContain('---');
    expect(md).toContain('title: "Political Risk Assessment"');
    expect(md).toContain('date: "2026-03-26"');
    expect(md).toContain('assessmentId: "ASSESS-MD-001"');
    expect(md).toContain('analysisType: "risk-scoring"');
  });

  it('should contain a risk heat map section', () => {
    const md = generateRiskAssessmentMarkdown(makeAssessment());
    expect(md).toContain('## Risk Heat Map');
    expect(md).toContain('Impact ↓ / Likelihood →');
  });

  it('should contain identified risks section', () => {
    const md = generateRiskAssessmentMarkdown(makeAssessment());
    expect(md).toContain('## Identified Risks');
    expect(md).toContain('RISK-001');
    expect(md).toContain('AI Act delay');
  });

  it('should contain evaluation matrix section', () => {
    const md = generateRiskAssessmentMarkdown(makeAssessment());
    expect(md).toContain('## Risk Evaluation Matrix');
  });

  it('should contain risk treatment section', () => {
    const md = generateRiskAssessmentMarkdown(makeAssessment());
    expect(md).toContain('## Risk Treatment Plan');
    expect(md).toContain('Expedite committee vote');
  });

  it('should contain recommendations section', () => {
    const md = generateRiskAssessmentMarkdown(makeAssessment());
    expect(md).toContain('## Recommendations');
    expect(md).toContain('Engage Council presidency');
  });

  it('should include heat map emoji cells', () => {
    const md = generateRiskAssessmentMarkdown(makeAssessment());
    // Should contain at least one of the heat map emojis
    const hasEmoji =
      md.includes('🟢') || md.includes('🟡') || md.includes('🟠') || md.includes('🔴');
    expect(hasEmoji).toBe(true);
  });

  it('should handle empty risks / baseline scenario', () => {
    const emptyAssessment = runAgentRiskAssessment(
      'EMPTY-001',
      '2026-01-01',
      ArticleCategory.PROPOSITIONS,
      [],
      [],
      []
    );
    const md = generateRiskAssessmentMarkdown(emptyAssessment);
    expect(md).toContain('---');
    expect(md).toContain('riskCount: { low: 0, medium: 0, high: 0, critical: 0 }');
  });
});

// ─── generatePoliticalRiskSummary ────────────────────────────────────────────

describe('generatePoliticalRiskSummary', () => {
  it('should return a valid PoliticalRiskSummary', () => {
    const risks = [
      calculatePoliticalRiskScore('likely', 'major', 'R1', 'Risk 1'),
      calculatePoliticalRiskScore('possible', 'moderate', 'R2', 'Risk 2'),
    ];
    const swot = buildQuantitativeSWOT(undefined, [], [], [], []);
    const result = generatePoliticalRiskSummary('2026-03-26', risks, [], swot, []);
    expect(result.date).toBe('2026-03-26');
    expect(result.overallRiskLevel).toBeDefined();
    expect(result.riskCount.high).toBe(1);
    expect(result.riskCount.medium).toBe(1);
    expect(result.topRisks).toHaveLength(2);
  });

  it('should return low risk and low confidence for empty risk list', () => {
    const swot = buildQuantitativeSWOT(undefined, [], [], [], []);
    const result = generatePoliticalRiskSummary('2026-03-26', [], [], swot, []);
    expect(result.overallRiskLevel).toBe('low');
    expect(result.confidence).toBe('low');
  });

  it('should take the highest risk level as overall', () => {
    const risks = [
      calculatePoliticalRiskScore('rare', 'negligible', 'R1'),
      calculatePoliticalRiskScore('almost_certain', 'severe', 'R2'),
    ];
    const swot = buildQuantitativeSWOT(undefined, [], [], [], []);
    const result = generatePoliticalRiskSummary('2026-03-26', risks, [], swot, []);
    expect(result.overallRiskLevel).toBe('critical');
  });
});

// ─── createScoredSWOTItem ────────────────────────────────────────────────────

describe('createScoredSWOTItem', () => {
  it('should create a ScoredSWOTItem with clamped score (0–5)', () => {
    const item = createScoredSWOTItem('Strong support', 4, ['Evidence'], 'high', 'improving');
    expect(item.description).toBe('Strong support');
    expect(item.score).toBe(4);
    expect(item.evidence).toEqual(['Evidence']);
    expect(item.confidence).toBe('high');
    expect(item.trend).toBe('improving');
  });

  it('should clamp score above 5 to 5', () => {
    const item = createScoredSWOTItem('Over-scored', 10);
    expect(item.score).toBe(5);
  });

  it('should clamp negative score to 0', () => {
    const item = createScoredSWOTItem('Under-scored', -3);
    expect(item.score).toBe(0);
  });

  it('should default evidence to empty array', () => {
    const item = createScoredSWOTItem('No evidence', 3);
    expect(item.evidence).toEqual([]);
  });

  it('should default confidence to medium', () => {
    const item = createScoredSWOTItem('Default conf', 3);
    expect(item.confidence).toBe('medium');
  });

  it('should default trend to stable', () => {
    const item = createScoredSWOTItem('Default trend', 3);
    expect(item.trend).toBe('stable');
  });
});

// ─── createScoredOpportunityOrThreat ─────────────────────────────────────────

describe('createScoredOpportunityOrThreat', () => {
  it('should calculate score as likelihood × impact', () => {
    // likely (0.7) × major (4) = 2.8
    const item = createScoredOpportunityOrThreat('Coalition opportunity', 'likely', 'major');
    expect(item.score).toBe(2.8);
  });

  it('should handle rare × negligible (0.1 × 1 = 0.1)', () => {
    const item = createScoredOpportunityOrThreat('Tiny threat', 'rare', 'negligible');
    expect(item.score).toBe(0.1);
  });

  it('should handle almost_certain × severe (0.9 × 5 = 4.5)', () => {
    const item = createScoredOpportunityOrThreat('Critical threat', 'almost_certain', 'severe');
    expect(item.score).toBe(4.5);
  });

  it('should include description and evidence', () => {
    const item = createScoredOpportunityOrThreat('Policy window', 'possible', 'moderate', [
      'Indicator A',
    ]);
    expect(item.description).toBe('Policy window');
    expect(item.evidence).toEqual(['Indicator A']);
  });
});

// ─── createRiskDriver ────────────────────────────────────────────────────────

describe('createRiskDriver', () => {
  it('should create a valid risk driver', () => {
    const driver = createRiskDriver(
      'Coalition fracture risk',
      'coalition_fracture',
      30,
      'increasing'
    );
    expect(driver.description).toBe('Coalition fracture risk');
    expect(driver.category).toBe('coalition_fracture');
    expect(driver.contribution).toBe(30);
    expect(driver.trend).toBe('increasing');
  });

  it('should clamp contribution to 0–100', () => {
    const over = createRiskDriver('Over', 'external_pressure', 150);
    expect(over.contribution).toBe(100);

    const under = createRiskDriver('Under', 'internal_dissent', -10);
    expect(under.contribution).toBe(0);
  });

  it('should default trend to stable', () => {
    const driver = createRiskDriver('Stable risk', 'legislative_delay', 20);
    expect(driver.trend).toBe('stable');
  });

  it('should accept all threat categories', () => {
    const categories = [
      'coalition_fracture',
      'legislative_delay',
      'procedural_obstruction',
      'external_pressure',
      'internal_dissent',
      'public_opposition',
      'institutional_conflict',
    ];
    for (const cat of categories) {
      const driver = createRiskDriver('Test', cat, 10);
      expect(driver.category).toBe(cat);
    }
  });
});
