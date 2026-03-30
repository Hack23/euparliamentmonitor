// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Test/PoliticalThreatAssessment
 * @description Unit tests for political-threat-assessment utility functions.
 * Tests Threat Landscape framework, actor threat profiling, consequence trees,
 * legislative disruption analysis, and markdown generation.
 */

import { describe, it, expect } from 'vitest';
import {
  assessPoliticalThreats,
  buildActorThreatProfiles,
  buildConsequenceTree,
  analyzeLegislativeDisruption,
  generateThreatAssessmentMarkdown,
  ALL_THREAT_LANDSCAPE_DIMENSIONS,
} from '../../scripts/utils/political-threat-assessment.js';

// ─── Fixture helpers ────────────────────────────────────────────────────────

function makeCoalition(overrides = {}) {
  return {
    coalitionId: 'COAL-001',
    groups: ['EPP', 'Renew'],
    cohesionScore: 0.82,
    alignmentTrend: 'strengthening',
    keyVotes: 15,
    riskLevel: 'low',
    ...overrides,
  };
}

function makeAnomaly(overrides = {}) {
  return {
    anomalyId: 'ANOMALY-001',
    significance: 'high',
    description: 'EPP members voted against group line',
    affectedGroups: ['EPP', 'S&D'],
    deviationPercentage: 23.5,
    historicalContext: 'Unusual for EPP in budget votes',
    implication: 'Potential coalition fragmentation',
    ...overrides,
  };
}

function makeProcedure(overrides = {}) {
  return {
    procedureId: 'PROC-2024-001',
    title: 'Green Deal Amendment Act',
    currentStage: 'committee',
    status: 'active',
    ...overrides,
  };
}

function makeMEPInfluence(overrides = {}) {
  return {
    mepId: 'MEP-12345',
    mepName: 'Jane Doe',
    overallScore: 85,
    votingActivity: 90,
    legislativeOutput: 80,
    committeeEngagement: 75,
    rank: 'top-25%',
    ...overrides,
  };
}

function makeArticleData(overrides = {}) {
  return {
    votingRecords: [],
    coalitionData: [],
    mepInfluence: [],
    procedures: [],
    anomalies: [],
    questions: [],
    committees: [],
    feedData: {},
    ...overrides,
  };
}

// ─── ALL_THREAT_LANDSCAPE_DIMENSIONS ────────────────────────────────────────

describe('ALL_THREAT_LANDSCAPE_DIMENSIONS', () => {
  it('contains all six Threat Landscape categories', () => {
    expect(ALL_THREAT_LANDSCAPE_DIMENSIONS).toHaveLength(6);
    expect(ALL_THREAT_LANDSCAPE_DIMENSIONS).toContain('shift');
    expect(ALL_THREAT_LANDSCAPE_DIMENSIONS).toContain('transparency');
    expect(ALL_THREAT_LANDSCAPE_DIMENSIONS).toContain('reversal');
    expect(ALL_THREAT_LANDSCAPE_DIMENSIONS).toContain('institutional');
    expect(ALL_THREAT_LANDSCAPE_DIMENSIONS).toContain('delay');
    expect(ALL_THREAT_LANDSCAPE_DIMENSIONS).toContain('erosion');
  });

  it('is an array of strings', () => {
    expect(Array.isArray(ALL_THREAT_LANDSCAPE_DIMENSIONS)).toBe(true);
    expect(ALL_THREAT_LANDSCAPE_DIMENSIONS.every((category) => typeof category === 'string')).toBe(
      true
    );
  });
});

// ─── assessPoliticalThreats ──────────────────────────────────────────────────

describe('assessPoliticalThreats', () => {
  describe('with empty data', () => {
    it('returns a complete assessment with defaults', () => {
      const assessment = assessPoliticalThreats(makeArticleData());
      expect(assessment).toBeDefined();
      expect(assessment.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(assessment.overallThreatLevel).toMatch(/^(critical|high|moderate|low|none)$/);
      expect(assessment.confidence).toMatch(/^(high|medium|low)$/);
    });

    it('returns all six threat landscape dimensions', () => {
      const assessment = assessPoliticalThreats(makeArticleData());
      expect(assessment.threatDimensions).toHaveLength(6);
      const categories = assessment.threatDimensions.map((c) => c.category);
      expect(categories).toContain('shift');
      expect(categories).toContain('transparency');
      expect(categories).toContain('reversal');
      expect(categories).toContain('institutional');
      expect(categories).toContain('delay');
      expect(categories).toContain('erosion');
    });

    it('returns at least one key finding', () => {
      const assessment = assessPoliticalThreats(makeArticleData());
      expect(assessment.keyFindings.length).toBeGreaterThan(0);
    });

    it('returns at least one recommendation', () => {
      const assessment = assessPoliticalThreats(makeArticleData());
      expect(assessment.recommendations.length).toBeGreaterThan(0);
    });

    it('includes at least one consequence tree', () => {
      const assessment = assessPoliticalThreats(makeArticleData());
      expect(assessment.consequenceTrees.length).toBeGreaterThan(0);
    });

    it('includes at least one legislative disruption', () => {
      const assessment = assessPoliticalThreats(makeArticleData());
      expect(assessment.legislativeDisruptions.length).toBeGreaterThan(0);
    });

    it('has overall threat level of low with no signals', () => {
      const assessment = assessPoliticalThreats(makeArticleData());
      expect(assessment.overallThreatLevel).toBe('low');
    });
  });

  describe('with coalition data', () => {
    it('detects weak coalition cohesion as shift threat', () => {
      const data = makeArticleData({
        coalitionData: [
          makeCoalition({ cohesionScore: 0.55, riskLevel: 'high', alignmentTrend: 'weakening' }),
        ],
      });
      const assessment = assessPoliticalThreats(data);
      const shiftCat = assessment.threatDimensions.find((c) => c.category === 'shift');
      expect(shiftCat).toBeDefined();
      expect(['moderate', 'high', 'critical']).toContain(shiftCat.threatLevel);
    });

    it('generates actor profiles for coalitions', () => {
      const data = makeArticleData({
        coalitionData: [
          makeCoalition({ groups: ['EPP', 'Renew', 'S&D'], riskLevel: 'high', cohesionScore: 0.5 }),
        ],
      });
      const assessment = assessPoliticalThreats(data);
      expect(assessment.actorProfiles.length).toBeGreaterThan(0);
    });
  });

  describe('with voting anomalies', () => {
    it('elevates shift threat level with anomalies', () => {
      const data = makeArticleData({
        anomalies: [
          makeAnomaly({ significance: 'critical' }),
          makeAnomaly({ significance: 'high' }),
          makeAnomaly({ significance: 'high' }),
        ],
      });
      const assessment = assessPoliticalThreats(data);
      const shiftCat = assessment.threatDimensions.find((c) => c.category === 'shift');
      expect(['moderate', 'high', 'critical']).toContain(shiftCat.threatLevel);
    });

    it('includes anomaly count in evidence', () => {
      const data = makeArticleData({
        anomalies: [makeAnomaly(), makeAnomaly({ anomalyId: 'ANOMALY-002' })],
      });
      const assessment = assessPoliticalThreats(data);
      const shiftCat = assessment.threatDimensions.find((c) => c.category === 'shift');
      const hasAnomalyEvidence = shiftCat.evidence.some((e) => e.includes('anomal'));
      expect(hasAnomalyEvidence).toBe(true);
    });
  });

  describe('with stalled procedures', () => {
    it('elevates reversal and delay threat for stalled procedure', () => {
      const data = makeArticleData({
        procedures: [makeProcedure({ status: 'stalled', currentStage: 'committee' })],
      });
      const assessment = assessPoliticalThreats(data);
      const reversalCat = assessment.threatDimensions.find((c) => c.category === 'reversal');
      const delayCat = assessment.threatDimensions.find((c) => c.category === 'delay');
      expect(['moderate', 'high', 'critical']).toContain(reversalCat.threatLevel);
      expect(['moderate', 'high', 'critical']).toContain(delayCat.threatLevel);
    });

    it('builds a consequence tree for stalled procedure', () => {
      const data = makeArticleData({
        procedures: [makeProcedure({ status: 'stalled', procedureId: 'PROC-TEST-001' })],
      });
      const assessment = assessPoliticalThreats(data);
      const stalledTree = assessment.consequenceTrees.find((t) =>
        t.rootAction.includes('PROC-TEST-001')
      );
      expect(stalledTree).toBeDefined();
    });
  });

  describe('with high-influence MEPs', () => {
    it('generates MEP actor threat profiles', () => {
      const data = makeArticleData({
        mepInfluence: [makeMEPInfluence({ overallScore: 90, rank: 'top-25%' })],
      });
      const assessment = assessPoliticalThreats(data);
      const mepProfile = assessment.actorProfiles.find((p) => p.actorType === 'mep');
      expect(mepProfile).toBeDefined();
      expect(mepProfile.actor).toBe('Jane Doe');
    });
  });

  describe('edge cases', () => {
    it('handles null/undefined data gracefully', () => {
      expect(() => assessPoliticalThreats(null)).not.toThrow();
      expect(() => assessPoliticalThreats(undefined)).not.toThrow();
    });

    it('handles empty arrays', () => {
      const data = makeArticleData();
      const assessment = assessPoliticalThreats(data);
      expect(assessment).toBeDefined();
      expect(assessment.threatDimensions).toHaveLength(6);
    });

    it('handles malformed data without throwing', () => {
      const data = makeArticleData({
        coalitionData: [null, undefined, 'string', 42, { notACoalition: true }],
        anomalies: [null, { significance: null }, {}],
        procedures: [null, { noId: true }],
      });
      expect(() => assessPoliticalThreats(data)).not.toThrow();
    });

    it('handles non-array field values without throwing', () => {
      const data = {
        coalitionData: 'not-an-array',
        anomalies: { notAnArray: true },
        procedures: 42,
        mepInfluence: 'string-value',
        votingRecords: null,
        committees: false,
        questions: {},
      };
      expect(() => assessPoliticalThreats(data)).not.toThrow();
      const assessment = assessPoliticalThreats(data);
      expect(assessment.threatDimensions).toHaveLength(6);
    });

    it('handles non-array anomalies gracefully', () => {
      const data = {
        anomalies: 'string-not-array',
      };
      expect(() => assessPoliticalThreats(data)).not.toThrow();
      const assessment = assessPoliticalThreats(data);
      expect(assessment.overallThreatLevel).toBe('low');
    });

    it('detects shift threats from anomalies array', () => {
      const data = {
        anomalies: [
          makeAnomaly({ significance: 'critical' }),
          makeAnomaly({ significance: 'high' }),
        ],
      };
      const assessment = assessPoliticalThreats(data);
      const shiftCat = assessment.threatDimensions.find((c) => c.category === 'shift');
      expect(['moderate', 'high', 'critical']).toContain(shiftCat.threatLevel);
    });

    it('includes anomaly evidence in shift dimension', () => {
      const data = {
        anomalies: [makeAnomaly({ significance: 'critical' })],
      };
      const assessment = assessPoliticalThreats(data);
      const shiftCat = assessment.threatDimensions.find((c) => c.category === 'shift');
      const hasEvidence = shiftCat.evidence.some((e) => e.includes('anomal'));
      expect(hasEvidence).toBe(true);
    });
  });
});

// ─── buildActorThreatProfiles ────────────────────────────────────────────────

describe('buildActorThreatProfiles', () => {
  it('returns empty array for no data', () => {
    const profiles = buildActorThreatProfiles(makeArticleData());
    expect(profiles).toEqual([]);
  });

  it('builds profile for weak coalition', () => {
    const data = makeArticleData({
      coalitionData: [
        makeCoalition({ cohesionScore: 0.5, riskLevel: 'high', alignmentTrend: 'weakening' }),
      ],
    });
    const profiles = buildActorThreatProfiles(data);
    expect(profiles.length).toBeGreaterThan(0);
    expect(profiles[0].actorType).toBe('political_group');
  });

  it('builds profile for high-influence MEP', () => {
    const data = makeArticleData({
      mepInfluence: [makeMEPInfluence({ overallScore: 88, rank: 'top-25%', mepName: 'Test MEP' })],
    });
    const profiles = buildActorThreatProfiles(data);
    expect(profiles.length).toBeGreaterThan(0);
    expect(profiles.some((p) => p.actorType === 'mep')).toBe(true);
  });

  it('does not include low-influence MEPs', () => {
    const data = makeArticleData({
      mepInfluence: [makeMEPInfluence({ overallScore: 40, rank: 'bottom-50%' })],
    });
    const profiles = buildActorThreatProfiles(data);
    expect(profiles.every((p) => p.actorType !== 'mep')).toBe(true);
  });

  it('sorts profiles by threat level descending', () => {
    const data = makeArticleData({
      coalitionData: [
        makeCoalition({
          groups: ['EPP', 'Renew', 'S&D'],
          riskLevel: 'high',
          cohesionScore: 0.4,
          alignmentTrend: 'weakening',
        }),
        makeCoalition({
          groups: ['ID'],
          riskLevel: 'low',
          cohesionScore: 0.95,
          alignmentTrend: 'stable',
          coalitionId: 'COAL-002',
        }),
      ],
    });
    const profiles = buildActorThreatProfiles(data);
    if (profiles.length >= 2) {
      const threatOrder = { critical: 4, high: 3, moderate: 2, low: 1, none: 0 };
      const firstScore = threatOrder[profiles[0].overallThreatLevel];
      const lastScore = threatOrder[profiles[profiles.length - 1].overallThreatLevel];
      expect(firstScore).toBeGreaterThanOrEqual(lastScore);
    }
  });

  it('includes threatCategories for each profile', () => {
    const data = makeArticleData({
      coalitionData: [makeCoalition({ riskLevel: 'high', alignmentTrend: 'weakening' })],
    });
    const profiles = buildActorThreatProfiles(data);
    expect(profiles[0].threatCategories.length).toBeGreaterThan(0);
  });

  it('handles malformed coalition data without throwing', () => {
    const data = makeArticleData({
      coalitionData: [null, undefined, 42, { cohesionScore: 'notanumber' }],
    });
    expect(() => buildActorThreatProfiles(data)).not.toThrow();
  });
});

// ─── buildConsequenceTree ────────────────────────────────────────────────────

describe('buildConsequenceTree', () => {
  it('returns a tree with the given root action', () => {
    const tree = buildConsequenceTree('AI Act amendment rejection', makeArticleData());
    expect(tree.rootAction).toBe('AI Act amendment rejection');
  });

  it('includes immediate consequences', () => {
    const tree = buildConsequenceTree('Test action', makeArticleData());
    expect(tree.immediateConsequences.length).toBeGreaterThan(0);
  });

  it('includes secondary effects', () => {
    const tree = buildConsequenceTree('Test action', makeArticleData());
    expect(tree.secondaryEffects.length).toBeGreaterThan(0);
  });

  it('includes long-term implications', () => {
    const tree = buildConsequenceTree('Test action', makeArticleData());
    expect(tree.longTermImplications.length).toBeGreaterThan(0);
  });

  it('includes mitigating and amplifying factors', () => {
    const tree = buildConsequenceTree('Test action', makeArticleData());
    expect(tree.mitigatingFactors.length).toBeGreaterThan(0);
    expect(tree.amplifyingFactors.length).toBeGreaterThan(0);
  });

  it('validates consequence probabilities are in [0, 1]', () => {
    const tree = buildConsequenceTree(
      'Test action',
      makeArticleData({
        anomalies: [
          makeAnomaly(),
          makeAnomaly({ anomalyId: 'A2' }),
          makeAnomaly({ anomalyId: 'A3' }),
        ],
        coalitionData: [makeCoalition({ cohesionScore: 0.4 })],
      })
    );
    for (const c of [
      ...tree.immediateConsequences,
      ...tree.secondaryEffects,
      ...tree.longTermImplications,
    ]) {
      expect(c.probability).toBeGreaterThanOrEqual(0);
      expect(c.probability).toBeLessThanOrEqual(1);
    }
  });

  it('amplifies consequences with weak coalitions', () => {
    const dataWithWeakCoalition = makeArticleData({
      coalitionData: [makeCoalition({ cohesionScore: 0.4, alignmentTrend: 'weakening' })],
    });
    const treeWeak = buildConsequenceTree('Vote', dataWithWeakCoalition);
    const dataStrong = makeArticleData();
    const treeStrong = buildConsequenceTree('Vote', dataStrong);
    // With weak coalitions there should be amplifying factors
    expect(treeWeak.amplifyingFactors.some((f) => f.toLowerCase().includes('coalit'))).toBe(true);
    // With no weak coalitions, amplifying factors should be generic
    expect(treeStrong.amplifyingFactors.length).toBeGreaterThan(0);
  });

  it('handles empty action string by using default', () => {
    const tree = buildConsequenceTree('', makeArticleData());
    expect(tree.rootAction).toBe('Unknown political action');
  });

  it('handles null action by using default', () => {
    const tree = buildConsequenceTree(null, makeArticleData());
    expect(tree.rootAction).toBe('Unknown political action');
  });

  it('consequence nodes have valid impact levels', () => {
    const tree = buildConsequenceTree('Test', makeArticleData());
    const allNodes = [
      ...tree.immediateConsequences,
      ...tree.secondaryEffects,
      ...tree.longTermImplications,
    ];
    const validLevels = ['critical', 'high', 'moderate', 'low', 'none'];
    for (const node of allNodes) {
      expect(validLevels).toContain(node.impact);
    }
  });

  it('consequence nodes have valid timeframes', () => {
    const tree = buildConsequenceTree('Test', makeArticleData());
    const validTimeframes = ['immediate', 'short-term', 'medium-term', 'long-term'];
    const allNodes = [
      ...tree.immediateConsequences,
      ...tree.secondaryEffects,
      ...tree.longTermImplications,
    ];
    for (const node of allNodes) {
      expect(validTimeframes).toContain(node.timeframe);
    }
  });
});

// ─── analyzeLegislativeDisruption ────────────────────────────────────────────

describe('analyzeLegislativeDisruption', () => {
  it('returns a disruption analysis with the given procedure name', () => {
    const analysis = analyzeLegislativeDisruption('PROC-2024-001', makeArticleData());
    expect(analysis.procedure).toBe('PROC-2024-001');
  });

  it('includes disruption points for all 7 legislative stages', () => {
    const analysis = analyzeLegislativeDisruption('Test Procedure', makeArticleData());
    expect(analysis.disruptionPoints).toHaveLength(7);
  });

  it('all disruption points have valid threat categories', () => {
    const analysis = analyzeLegislativeDisruption('Test', makeArticleData());
    const validCategories = [
      'shift',
      'transparency',
      'reversal',
      'institutional',
      'delay',
      'erosion',
    ];
    for (const point of analysis.disruptionPoints) {
      expect(validCategories).toContain(point.threatCategory);
    }
  });

  it('all disruption point likelihoods are in [0, 1]', () => {
    const analysis = analyzeLegislativeDisruption('Test', makeArticleData());
    for (const point of analysis.disruptionPoints) {
      expect(point.likelihood).toBeGreaterThanOrEqual(0);
      expect(point.likelihood).toBeLessThanOrEqual(1);
    }
  });

  it('returns valid resilience level', () => {
    const analysis = analyzeLegislativeDisruption('Test', makeArticleData());
    expect(['high', 'medium', 'low']).toContain(analysis.resilience);
  });

  it('includes alternative pathways', () => {
    const analysis = analyzeLegislativeDisruption('Test', makeArticleData());
    expect(analysis.alternativePathways.length).toBeGreaterThan(0);
  });

  it('detects current stage from procedure data', () => {
    const data = makeArticleData({
      procedures: [
        makeProcedure({ procedureId: 'PROC-2024-001', currentStage: 'plenary_first_reading' }),
      ],
    });
    const analysis = analyzeLegislativeDisruption('PROC-2024-001', data);
    expect(analysis.currentStage).toBe('plenary_first_reading');
  });

  it('uses proposal as default stage when procedure not found', () => {
    const analysis = analyzeLegislativeDisruption('Unknown-Procedure', makeArticleData());
    expect(analysis.currentStage).toBe('proposal');
  });

  it('has higher likelihood at plenary stages with anomalies', () => {
    const dataWithAnomalies = makeArticleData({
      anomalies: [
        makeAnomaly(),
        makeAnomaly({ anomalyId: 'A2' }),
        makeAnomaly({ anomalyId: 'A3' }),
      ],
    });
    const analysis = analyzeLegislativeDisruption('Test', dataWithAnomalies);
    const baseAnalysis = analyzeLegislativeDisruption('Test', makeArticleData());

    const plenaryAnomaly = analysis.disruptionPoints.find(
      (p) => p.stage === 'plenary_first_reading'
    );
    const plenaryBase = baseAnalysis.disruptionPoints.find(
      (p) => p.stage === 'plenary_first_reading'
    );
    expect(plenaryAnomaly.likelihood).toBeGreaterThanOrEqual(plenaryBase.likelihood);
  });

  it('handles empty procedure name by using default', () => {
    const analysis = analyzeLegislativeDisruption('', makeArticleData());
    expect(analysis.procedure).toBe('Unknown procedure');
  });

  it('handles null procedure name gracefully', () => {
    const analysis = analyzeLegislativeDisruption(null, makeArticleData());
    expect(analysis.procedure).toBe('Unknown procedure');
  });

  it('each disruption point has countermeasures', () => {
    const analysis = analyzeLegislativeDisruption('Test', makeArticleData());
    for (const point of analysis.disruptionPoints) {
      expect(point.countermeasures.length).toBeGreaterThan(0);
    }
  });

  it('each disruption point has potential disruptors', () => {
    const analysis = analyzeLegislativeDisruption('Test', makeArticleData());
    for (const point of analysis.disruptionPoints) {
      expect(point.potentialDisruptors.length).toBeGreaterThan(0);
    }
  });

  it('adds cross-group rapporteur pathway when coalition risk detected', () => {
    const data = makeArticleData({
      coalitionData: [makeCoalition({ cohesionScore: 0.4 })],
    });
    const analysis = analyzeLegislativeDisruption('Test', data);
    const hasRapporteurPath = analysis.alternativePathways.some((p) =>
      p.toLowerCase().includes('rapporteur')
    );
    expect(hasRapporteurPath).toBe(true);
  });
});

// ─── generateThreatAssessmentMarkdown ────────────────────────────────────────

describe('generateThreatAssessmentMarkdown', () => {
  function getBaseAssessment() {
    return assessPoliticalThreats(
      makeArticleData({
        coalitionData: [makeCoalition({ cohesionScore: 0.55, riskLevel: 'high' })],
        anomalies: [makeAnomaly()],
      })
    );
  }

  it('generates a non-empty markdown string', () => {
    const md = generateThreatAssessmentMarkdown(getBaseAssessment());
    expect(typeof md).toBe('string');
    expect(md.length).toBeGreaterThan(100);
  });

  it('includes YAML frontmatter', () => {
    const md = generateThreatAssessmentMarkdown(getBaseAssessment());
    expect(md.startsWith('---')).toBe(true);
    expect(md).toContain('analysisType: "threat-assessment"');
    expect(md).toContain('methods: ["political-threat-landscape"');
  });

  it('includes threat level in frontmatter', () => {
    const assessment = getBaseAssessment();
    const md = generateThreatAssessmentMarkdown(assessment);
    expect(md).toContain(`threatLevel: "${assessment.overallThreatLevel}"`);
  });

  it('includes confidence in frontmatter', () => {
    const assessment = getBaseAssessment();
    const md = generateThreatAssessmentMarkdown(assessment);
    expect(md).toContain(`confidence: "${assessment.confidence}"`);
  });

  it('includes date in frontmatter', () => {
    const assessment = getBaseAssessment();
    const md = generateThreatAssessmentMarkdown(assessment);
    expect(md).toContain(`date: "${assessment.date}"`);
  });

  it('includes all six threat landscape dimension headings', () => {
    const md = generateThreatAssessmentMarkdown(getBaseAssessment());
    expect(md).toContain('Coalition Shifts');
    expect(md).toContain('Transparency Deficit');
    expect(md).toContain('Policy Reversal');
    expect(md).toContain('Institutional Pressure');
    expect(md).toContain('Legislative Obstruction');
    expect(md).toContain('Democratic Erosion');
  });

  it('includes Actor Threat Profiles section', () => {
    const md = generateThreatAssessmentMarkdown(getBaseAssessment());
    expect(md).toContain('## Actor Threat Profiles');
  });

  it('includes Consequence Trees section', () => {
    const md = generateThreatAssessmentMarkdown(getBaseAssessment());
    expect(md).toContain('## Consequence Trees');
  });

  it('includes Mermaid graph syntax in consequence tree', () => {
    const md = generateThreatAssessmentMarkdown(getBaseAssessment());
    expect(md).toContain('```mermaid');
    expect(md).toContain('graph TD');
  });

  it('includes Legislative Disruption Analysis section', () => {
    const md = generateThreatAssessmentMarkdown(getBaseAssessment());
    expect(md).toContain('## Legislative Disruption Analysis');
  });

  it('includes Key Findings section', () => {
    const md = generateThreatAssessmentMarkdown(getBaseAssessment());
    expect(md).toContain('## Key Findings');
  });

  it('includes Recommendations section', () => {
    const md = generateThreatAssessmentMarkdown(getBaseAssessment());
    expect(md).toContain('## Recommendations');
  });

  it('includes GDPR compliance note', () => {
    const md = generateThreatAssessmentMarkdown(getBaseAssessment());
    expect(md).toContain('GDPR-compliant');
  });

  it('generates actor table when profiles exist', () => {
    const assessment = assessPoliticalThreats(
      makeArticleData({
        coalitionData: [
          makeCoalition({ groups: ['EPP', 'Renew'], riskLevel: 'high', cohesionScore: 0.45 }),
        ],
      })
    );
    const md = generateThreatAssessmentMarkdown(assessment);
    if (assessment.actorProfiles.length > 0) {
      expect(md).toContain('| Actor |');
      expect(md).toContain('| Capability |');
    }
  });

  it('includes threat emojis for elevated threats', () => {
    const assessment = assessPoliticalThreats(
      makeArticleData({
        anomalies: [
          makeAnomaly({ significance: 'critical' }),
          makeAnomaly({ significance: 'critical', anomalyId: 'A2' }),
          makeAnomaly({ significance: 'high', anomalyId: 'A3' }),
        ],
        coalitionData: [
          makeCoalition({ cohesionScore: 0.3, riskLevel: 'high', alignmentTrend: 'weakening' }),
          makeCoalition({ cohesionScore: 0.35, riskLevel: 'high', coalitionId: 'C2' }),
          makeCoalition({ cohesionScore: 0.4, riskLevel: 'high', coalitionId: 'C3' }),
        ],
      })
    );
    const md = generateThreatAssessmentMarkdown(assessment);
    const hasEmojiThreat = md.includes('🔴') || md.includes('🟠') || md.includes('⚠️');
    expect(hasEmojiThreat).toBe(true);
  });

  it('generates valid markdown for minimal empty assessment', () => {
    const assessment = assessPoliticalThreats(makeArticleData());
    const md = generateThreatAssessmentMarkdown(assessment);
    expect(md).toContain('# Political Threat Assessment');
    expect(md).toContain('## Political Threat Landscape Analysis');
  });

  it('handles null input by generating default assessment', () => {
    const md = generateThreatAssessmentMarkdown(null);
    expect(md).toContain('# Political Threat Assessment');
    expect(md).toContain('threatLevel:');
    expect(md).toContain('confidence:');
  });

  it('handles undefined input by generating default assessment', () => {
    const md = generateThreatAssessmentMarkdown(undefined);
    expect(md).toContain('# Political Threat Assessment');
    expect(md).toContain('## Political Threat Landscape Analysis');
  });
});
