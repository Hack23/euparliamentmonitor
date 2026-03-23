// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Test/IntelligenceAnalysis
 * @description Unit tests for intelligence-analysis utility functions and
 * the new buildWhatToWatchSection / buildPoliticalAlignmentSection generators.
 */

import { describe, it, expect } from 'vitest';
import {
  scoreVotingAnomaly,
  analyzeCoalitionCohesion,
  scoreMEPInfluence,
  calculateLegislativeVelocity,
  rankBySignificance,
  buildIntelligenceSection,
  buildDefaultStakeholderPerspectives,
  scoreStakeholderInfluence,
  buildStakeholderOutcomeMatrix,
  rankStakeholdersByInfluence,
  computeVotingIntensity,
  detectCoalitionShifts,
  computePolarizationIndex,
  detectVotingTrends,
  computeCrossSessionCoalitionStability,
  rankMEPInfluenceByTopic,
  buildLegislativeVelocityReport,
} from '../../scripts/utils/intelligence-analysis.js';
import { ALL_STAKEHOLDER_TYPES } from '../../scripts/types/index.js';
import {
  buildWhatToWatchSection,
  buildPoliticalAlignmentSection,
} from '../../scripts/generators/news-enhanced.js';

// ─── Fixture helpers ────────────────────────────────────────────────────────

function makeAnomaly(overrides = {}) {
  return {
    anomalyId: 'ANOMALY-001',
    significance: 'high',
    description: 'EPP members voted against group',
    affectedGroups: ['EPP', 'S&D'],
    deviationPercentage: 23.5,
    historicalContext: 'Unusual for EPP in budget votes',
    implication: 'Potential coalition fragmentation',
    ...overrides,
  };
}

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

function makeMEP(overrides = {}) {
  return {
    mepId: 'MEP-12345',
    mepName: 'Jane Doe',
    overallScore: 75.5,
    votingActivity: 80,
    legislativeOutput: 70,
    committeeEngagement: 65,
    rank: 'top-25%',
    ...overrides,
  };
}

function makeVelocity(overrides = {}) {
  return {
    procedureId: 'PROC-2024-001',
    title: 'Green Deal Amendment Act',
    stage: 'Committee',
    daysInCurrentStage: 45,
    velocityScore: 0.6,
    bottleneckRisk: 'medium',
    predictedCompletion: '2025-06-01',
    ...overrides,
  };
}

// ─── scoreVotingAnomaly ──────────────────────────────────────────────────────

describe('scoreVotingAnomaly', () => {
  it('should return a VotingAnomalyIntelligence for valid input', () => {
    const result = scoreVotingAnomaly(makeAnomaly());
    expect(result).not.toBeNull();
    expect(result?.anomalyId).toBe('ANOMALY-001');
    expect(result?.significance).toBe('high');
    expect(result?.description).toBe('EPP members voted against group');
    expect(result?.affectedGroups).toEqual(['EPP', 'S&D']);
    expect(result?.deviationPercentage).toBe(23.5);
    expect(result?.historicalContext).toBe('Unusual for EPP in budget votes');
    expect(result?.implication).toBe('Potential coalition fragmentation');
  });

  it('should return null for null input', () => {
    expect(scoreVotingAnomaly(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(scoreVotingAnomaly(undefined)).toBeNull();
  });

  it('should return null for non-object input', () => {
    expect(scoreVotingAnomaly('not an object')).toBeNull();
    expect(scoreVotingAnomaly(42)).toBeNull();
    expect(scoreVotingAnomaly(true)).toBeNull();
  });

  it('should return null when anomalyId is missing', () => {
    const result = scoreVotingAnomaly({ significance: 'high', description: 'test' });
    expect(result).toBeNull();
  });

  it('should fall back to id field when anomalyId is absent', () => {
    const result = scoreVotingAnomaly({ id: 'ALT-001', significance: 'medium' });
    expect(result).not.toBeNull();
    expect(result?.anomalyId).toBe('ALT-001');
  });

  it('should default significance to low for invalid values', () => {
    const result = scoreVotingAnomaly(makeAnomaly({ significance: 'extreme' }));
    expect(result?.significance).toBe('low');
  });

  it('should accept all valid significance levels', () => {
    for (const level of ['critical', 'high', 'medium', 'low']) {
      const result = scoreVotingAnomaly(makeAnomaly({ significance: level }));
      expect(result?.significance).toBe(level);
    }
  });

  it('should filter non-string entries from affectedGroups', () => {
    const result = scoreVotingAnomaly(
      makeAnomaly({ affectedGroups: ['EPP', 42, null, 'S&D', true] }),
    );
    expect(result?.affectedGroups).toEqual(['EPP', 'S&D']);
  });

  it('should return empty array when affectedGroups is missing', () => {
    const { affectedGroups: _removed, ...rest } = makeAnomaly();
    const result = scoreVotingAnomaly(rest);
    expect(result?.affectedGroups).toEqual([]);
  });

  it('should return 0 for deviationPercentage when missing or non-numeric', () => {
    const result = scoreVotingAnomaly(makeAnomaly({ deviationPercentage: 'lots' }));
    expect(result?.deviationPercentage).toBe(0);
  });
});

// ─── analyzeCoalitionCohesion ────────────────────────────────────────────────

describe('analyzeCoalitionCohesion', () => {
  it('should return a CoalitionIntelligence for valid input', () => {
    const result = analyzeCoalitionCohesion(makeCoalition());
    expect(result).not.toBeNull();
    expect(result?.coalitionId).toBe('COAL-001');
    expect(result?.groups).toEqual(['EPP', 'Renew']);
    expect(result?.cohesionScore).toBe(0.82);
    expect(result?.alignmentTrend).toBe('strengthening');
    expect(result?.keyVotes).toBe(15);
    expect(result?.riskLevel).toBe('low');
  });

  it('should return null for null input', () => {
    expect(analyzeCoalitionCohesion(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(analyzeCoalitionCohesion(undefined)).toBeNull();
  });

  it('should return null when coalition identifier is missing', () => {
    expect(analyzeCoalitionCohesion({ groups: ['EPP'] })).toBeNull();
  });

  it('should fall back to id field when coalitionId is absent', () => {
    const result = analyzeCoalitionCohesion({ id: 'C-002', groups: ['EPP'] });
    expect(result?.coalitionId).toBe('C-002');
  });

  it('should clamp cohesionScore above 1 to 1', () => {
    const result = analyzeCoalitionCohesion(makeCoalition({ cohesionScore: 1.5 }));
    expect(result?.cohesionScore).toBe(1);
  });

  it('should clamp cohesionScore below 0 to 0', () => {
    const result = analyzeCoalitionCohesion(makeCoalition({ cohesionScore: -0.1 }));
    expect(result?.cohesionScore).toBe(0);
  });

  it('should default alignmentTrend to stable for invalid values', () => {
    const result = analyzeCoalitionCohesion(makeCoalition({ alignmentTrend: 'oscillating' }));
    expect(result?.alignmentTrend).toBe('stable');
  });

  it('should accept all valid alignment trends', () => {
    for (const trend of ['strengthening', 'weakening', 'stable']) {
      const result = analyzeCoalitionCohesion(makeCoalition({ alignmentTrend: trend }));
      expect(result?.alignmentTrend).toBe(trend);
    }
  });

  it('should default riskLevel to medium for invalid values', () => {
    const result = analyzeCoalitionCohesion(makeCoalition({ riskLevel: 'extreme' }));
    expect(result?.riskLevel).toBe('medium');
  });

  it('should accept all valid risk levels', () => {
    for (const level of ['high', 'medium', 'low']) {
      const result = analyzeCoalitionCohesion(makeCoalition({ riskLevel: level }));
      expect(result?.riskLevel).toBe(level);
    }
  });

  it('should round keyVotes to the nearest integer', () => {
    const result = analyzeCoalitionCohesion(makeCoalition({ keyVotes: 7.7 }));
    expect(result?.keyVotes).toBe(8);
  });
});

// ─── scoreMEPInfluence ───────────────────────────────────────────────────────

describe('scoreMEPInfluence', () => {
  it('should return a MEPInfluenceScore for valid input', () => {
    const result = scoreMEPInfluence(makeMEP());
    expect(result).not.toBeNull();
    expect(result?.mepId).toBe('MEP-12345');
    expect(result?.mepName).toBe('Jane Doe');
    expect(result?.overallScore).toBe(75.5);
    expect(result?.votingActivity).toBe(80);
    expect(result?.legislativeOutput).toBe(70);
    expect(result?.committeeEngagement).toBe(65);
    expect(result?.rank).toBe('top-25%');
  });

  it('should return null for null input', () => {
    expect(scoreMEPInfluence(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(scoreMEPInfluence(undefined)).toBeNull();
  });

  it('should return null when mepId is missing', () => {
    expect(scoreMEPInfluence({ mepName: 'Test MEP', overallScore: 50 })).toBeNull();
  });

  it('should return null when mepName is missing', () => {
    expect(scoreMEPInfluence({ mepId: 'MEP-001', overallScore: 50 })).toBeNull();
  });

  it('should fall back to id when mepId is absent', () => {
    const result = scoreMEPInfluence({ id: 'MEP-ALT', name: 'Alt Name', overallScore: 60 });
    expect(result?.mepId).toBe('MEP-ALT');
    expect(result?.mepName).toBe('Alt Name');
  });

  it('should clamp overallScore to 0–100 range', () => {
    const high = scoreMEPInfluence(makeMEP({ overallScore: 150 }));
    expect(high?.overallScore).toBe(100);
    const low = scoreMEPInfluence(makeMEP({ overallScore: -10 }));
    expect(low?.overallScore).toBe(0);
  });

  it('should clamp sub-scores to 0–100 range', () => {
    const result = scoreMEPInfluence(
      makeMEP({ votingActivity: 200, legislativeOutput: -5, committeeEngagement: 101 }),
    );
    expect(result?.votingActivity).toBe(100);
    expect(result?.legislativeOutput).toBe(0);
    expect(result?.committeeEngagement).toBe(100);
  });

  it('should return empty string for missing rank', () => {
    const { rank: _r, ...rest } = makeMEP();
    const result = scoreMEPInfluence(rest);
    expect(result?.rank).toBe('');
  });
});

// ─── calculateLegislativeVelocity ────────────────────────────────────────────

describe('calculateLegislativeVelocity', () => {
  it('should return a LegislativeVelocity for valid input', () => {
    const result = calculateLegislativeVelocity(makeVelocity());
    expect(result).not.toBeNull();
    expect(result?.procedureId).toBe('PROC-2024-001');
    expect(result?.title).toBe('Green Deal Amendment Act');
    expect(result?.stage).toBe('Committee');
    expect(result?.daysInCurrentStage).toBe(45);
    expect(result?.velocityScore).toBe(0.6);
    expect(result?.bottleneckRisk).toBe('medium');
    expect(result?.predictedCompletion).toBe('2025-06-01');
  });

  it('should return null for null input', () => {
    expect(calculateLegislativeVelocity(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(calculateLegislativeVelocity(undefined)).toBeNull();
  });

  it('should return null when procedureId is missing', () => {
    expect(calculateLegislativeVelocity({ title: 'Test' })).toBeNull();
  });

  it('should return null when title is missing', () => {
    expect(calculateLegislativeVelocity({ procedureId: 'P-001' })).toBeNull();
  });

  it('should fall back to id field when procedureId is absent', () => {
    const result = calculateLegislativeVelocity({ id: 'P-ALT', title: 'Alt Procedure' });
    expect(result?.procedureId).toBe('P-ALT');
  });

  it('should default stage to Unknown when missing', () => {
    const result = calculateLegislativeVelocity(makeVelocity({ stage: '' }));
    expect(result?.stage).toBe('Unknown');
  });

  it('should clamp velocityScore to 0–1 range', () => {
    const high = calculateLegislativeVelocity(makeVelocity({ velocityScore: 2.5 }));
    expect(high?.velocityScore).toBe(1);
    const low = calculateLegislativeVelocity(makeVelocity({ velocityScore: -0.5 }));
    expect(low?.velocityScore).toBe(0);
  });

  it('should default bottleneckRisk to medium for invalid values', () => {
    const result = calculateLegislativeVelocity(makeVelocity({ bottleneckRisk: 'extreme' }));
    expect(result?.bottleneckRisk).toBe('medium');
  });

  it('should floor negative daysInCurrentStage to 0', () => {
    const result = calculateLegislativeVelocity(makeVelocity({ daysInCurrentStage: -10 }));
    expect(result?.daysInCurrentStage).toBe(0);
  });
});

// ─── rankBySignificance ──────────────────────────────────────────────────────

describe('rankBySignificance', () => {
  it('should return an empty array for empty input', () => {
    expect(rankBySignificance([])).toEqual([]);
  });

  it('should sort by significance level descending (critical > high > medium > low)', () => {
    const items = [
      { significance: 'low' },
      { significance: 'critical' },
      { significance: 'medium' },
      { significance: 'high' },
    ];
    const sorted = rankBySignificance(items);
    expect(sorted.map((i) => i.significance)).toEqual(['critical', 'high', 'medium', 'low']);
  });

  it('should use overallScore as tie-breaker when significance is equal', () => {
    const items = [
      { significance: 'high', overallScore: 40 },
      { significance: 'high', overallScore: 90 },
      { significance: 'high', overallScore: 60 },
    ];
    const sorted = rankBySignificance(items);
    expect(sorted.map((i) => i.overallScore)).toEqual([90, 60, 40]);
  });

  it('should use cohesionScore as tie-breaker when overallScore is absent', () => {
    const items = [
      { significance: 'medium', cohesionScore: 0.3 },
      { significance: 'medium', cohesionScore: 0.9 },
    ];
    const sorted = rankBySignificance(items);
    expect(sorted[0]?.cohesionScore).toBe(0.9);
  });

  it('should treat unknown significance as lower priority than low', () => {
    const items = [{ significance: 'unknown' }, { significance: 'low' }];
    const sorted = rankBySignificance(items);
    expect(sorted[0]?.significance).toBe('low');
  });

  it('should not mutate the original array', () => {
    const items = [{ significance: 'low' }, { significance: 'high' }];
    const original = [...items];
    rankBySignificance(items);
    expect(items).toEqual(original);
  });

  it('should handle items without significance field', () => {
    const items = [{ overallScore: 80 }, { overallScore: 60 }];
    const sorted = rankBySignificance(items);
    expect(sorted[0]?.overallScore).toBe(80);
  });
});

// ─── buildIntelligenceSection ────────────────────────────────────────────────

describe('buildIntelligenceSection', () => {
  it('should return an empty string for an empty items array', () => {
    expect(buildIntelligenceSection('Title', [], 'my-class')).toBe('');
  });

  it('should produce a section element with the provided class name', () => {
    const html = buildIntelligenceSection('Anomalies', ['Item one'], 'anomaly-list');
    expect(html).toContain('class="anomaly-list"');
    expect(html).toContain('<section');
  });

  it('should include the heading inside an h2 element', () => {
    const html = buildIntelligenceSection('My Heading', ['Alpha'], 'my-section');
    expect(html).toContain('<h2>My Heading</h2>');
  });

  it('should render each item as an li element', () => {
    const html = buildIntelligenceSection('List', ['First', 'Second', 'Third'], 'list-section');
    expect(html).toContain('<li>First</li>');
    expect(html).toContain('<li>Second</li>');
    expect(html).toContain('<li>Third</li>');
  });

  it('should escape XSS in the title', () => {
    const html = buildIntelligenceSection('<script>alert(1)</script>', ['OK'], 'cls');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should escape XSS in item text', () => {
    const html = buildIntelligenceSection('Safe Title', ['<img onerror="x">'], 'cls');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('should escape XSS in the className', () => {
    const html = buildIntelligenceSection('T', ['Item'], '"><script>bad</script>');
    expect(html).not.toContain('<script>bad</script>');
  });
});

// ─── buildWhatToWatchSection ─────────────────────────────────────────────────

describe('buildWhatToWatchSection', () => {
  const sampleProcedures = [
    { title: 'Climate Act', stage: 'Committee', bottleneck: true },
    { title: 'Budget 2025', stage: 'Plenary', bottleneck: false },
  ];

  const sampleVelocities = [
    {
      procedureId: 'P-001',
      title: 'Digital Services Act Update',
      stage: 'Plenary',
      daysInCurrentStage: 10,
      velocityScore: 0.9,
      bottleneckRisk: 'high',
      predictedCompletion: '2025-04-15',
    },
    {
      procedureId: 'P-002',
      title: 'Biodiversity Fund',
      stage: 'Committee',
      daysInCurrentStage: 30,
      velocityScore: 0.5,
      bottleneckRisk: 'low',
      predictedCompletion: '2025-07-01',
    },
  ];

  it('should return empty string when both arrays are empty', () => {
    expect(buildWhatToWatchSection([], [], 'en')).toBe('');
  });

  it('should produce a section element with class what-to-watch', () => {
    const html = buildWhatToWatchSection(sampleProcedures, sampleVelocities, 'en');
    expect(html).toContain('class="what-to-watch"');
  });

  it('should include the language code as the lang attribute', () => {
    const html = buildWhatToWatchSection(sampleProcedures, sampleVelocities, 'de');
    expect(html).toContain('lang="de"');
  });

  it('should highlight high bottleneck risk velocities', () => {
    const html = buildWhatToWatchSection([], sampleVelocities, 'en');
    expect(html).toContain('watch-high');
    expect(html).toContain('Digital Services Act Update');
    expect(html).toContain('bottleneck risk detected');
  });

  it('should include bottlenecked procedures', () => {
    const html = buildWhatToWatchSection(sampleProcedures, [], 'en');
    expect(html).toContain('watch-procedure');
    expect(html).toContain('Climate Act');
  });

  it('should include non-bottleneck velocity items', () => {
    const html = buildWhatToWatchSection([], sampleVelocities, 'en');
    expect(html).toContain('Biodiversity Fund');
    expect(html).toContain('2025-07-01');
  });

  it('should escape HTML in procedure and velocity titles (XSS prevention)', () => {
    const xssProcs = [{ title: '<script>xss</script>', stage: 'Alert', bottleneck: true }];
    const html = buildWhatToWatchSection(xssProcs, [], 'en');
    expect(html).not.toContain('<script>xss</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should return empty string when procedures are all non-bottleneck and velocities are empty', () => {
    const nonBottleneckProcs = [{ title: 'Routine Bill', stage: 'Plenary', bottleneck: false }];
    const html = buildWhatToWatchSection(nonBottleneckProcs, [], 'en');
    expect(html).toBe('');
  });
});

// ─── buildPoliticalAlignmentSection ─────────────────────────────────────────

describe('buildPoliticalAlignmentSection', () => {
  const sampleRecords = [
    {
      title: 'Climate Emergency Resolution',
      date: '2025-03-15',
      result: 'Adopted',
      votes: { for: 420, against: 120, abstain: 30 },
    },
    {
      title: 'Agricultural Subsidies Motion',
      date: '2025-03-16',
      result: 'Rejected',
      votes: { for: 200, against: 350, abstain: 20 },
    },
  ];

  const sampleCoalitions = [
    {
      coalitionId: 'COAL-A',
      groups: ['EPP', 'Renew'],
      cohesionScore: 0.78,
      alignmentTrend: 'strengthening',
      keyVotes: 12,
      riskLevel: 'low',
    },
    {
      coalitionId: 'COAL-B',
      groups: ['S&D', 'Greens/EFA'],
      cohesionScore: 0.62,
      alignmentTrend: 'weakening',
      keyVotes: 8,
      riskLevel: 'high',
    },
  ];

  it('should return empty string when both arrays are empty', () => {
    expect(buildPoliticalAlignmentSection([], [], 'en')).toBe('');
  });

  it('should produce a section element with class political-alignment', () => {
    const html = buildPoliticalAlignmentSection(sampleRecords, sampleCoalitions, 'en');
    expect(html).toContain('class="political-alignment"');
  });

  it('should include the language code as the lang attribute', () => {
    const html = buildPoliticalAlignmentSection(sampleRecords, sampleCoalitions, 'fr');
    expect(html).toContain('lang="fr"');
  });

  it('should render voting record titles and results', () => {
    const html = buildPoliticalAlignmentSection(sampleRecords, [], 'en');
    expect(html).toContain('Climate Emergency Resolution');
    expect(html).toContain('Adopted');
    expect(html).toContain('420');
    expect(html).toContain('120');
  });

  it('should render coalition groups and cohesion scores', () => {
    const html = buildPoliticalAlignmentSection([], sampleCoalitions, 'en');
    expect(html).toContain('EPP');
    expect(html).toContain('Renew');
    expect(html).toContain('78%');
    expect(html).toContain('strengthening');
  });

  it('should indicate risk level for coalitions', () => {
    const html = buildPoliticalAlignmentSection([], sampleCoalitions, 'en');
    expect(html).toContain('alignment-low');
    expect(html).toContain('alignment-high');
  });

  it('should escape HTML in voting record titles (XSS prevention)', () => {
    const xssRecords = [
      {
        title: '<script>alert("xss")</script>',
        date: '2025-01-01',
        result: 'Adopted',
        votes: { for: 100, against: 50, abstain: 0 },
      },
    ];
    const html = buildPoliticalAlignmentSection(xssRecords, [], 'en');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should escape HTML in coalition group names (XSS prevention)', () => {
    const xssCoalitions = [
      {
        coalitionId: 'C-1',
        groups: ['<img onerror="bad">'],
        cohesionScore: 0.5,
        alignmentTrend: 'stable',
        keyVotes: 3,
        riskLevel: 'medium',
      },
    ];
    const html = buildPoliticalAlignmentSection([], xssCoalitions, 'en');
    expect(html).not.toContain('<img onerror');
    expect(html).toContain('&lt;img');
  });

  it('should contain both voting records section and coalition section when both provided', () => {
    const html = buildPoliticalAlignmentSection(sampleRecords, sampleCoalitions, 'en');
    expect(html).toContain('alignment-votes');
    expect(html).toContain('alignment-coalitions');
    expect(html).toContain('Climate Emergency Resolution');
    expect(html).toContain('EPP');
  });

  it('should not contain undefined or null in output', () => {
    const html = buildPoliticalAlignmentSection(sampleRecords, sampleCoalitions, 'en');
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('null');
  });
});

// ─── buildDefaultStakeholderPerspectives ─────────────────────────────────────

describe('buildDefaultStakeholderPerspectives', () => {
  it('should return exactly 6 perspectives (one per stakeholder group)', () => {
    const result = buildDefaultStakeholderPerspectives('Test action');
    expect(result).toHaveLength(6);
  });

  it('should cover all 6 stakeholder types', () => {
    const result = buildDefaultStakeholderPerspectives('Test action');
    const types = result.map((p) => p.stakeholder);
    expect(types).toContain('political_groups');
    expect(types).toContain('civil_society');
    expect(types).toContain('industry');
    expect(types).toContain('national_govts');
    expect(types).toContain('citizens');
    expect(types).toContain('eu_institutions');
  });

  it('should set severity based on score thresholds', () => {
    const result = buildDefaultStakeholderPerspectives('Test action', {
      political_groups: 0.8,  // → high
      civil_society: 0.5,     // → medium
      industry: 0.2,          // → low
    });
    const pg = result.find((p) => p.stakeholder === 'political_groups');
    const cs = result.find((p) => p.stakeholder === 'civil_society');
    const ind = result.find((p) => p.stakeholder === 'industry');
    expect(pg?.severity).toBe('high');
    expect(cs?.severity).toBe('medium');
    expect(ind?.severity).toBe('low');
  });

  it('should set positive impact for score >= 0.6', () => {
    const result = buildDefaultStakeholderPerspectives('Vote', { political_groups: 0.9 });
    const pg = result.find((p) => p.stakeholder === 'political_groups');
    expect(pg?.impact).toBe('positive');
  });

  it('should set negative impact for score <= 0.3', () => {
    const result = buildDefaultStakeholderPerspectives('Vote', { citizens: 0.2 });
    const cit = result.find((p) => p.stakeholder === 'citizens');
    expect(cit?.impact).toBe('negative');
  });

  it('should set neutral impact for score between 0.3 and 0.6 exclusive', () => {
    const result = buildDefaultStakeholderPerspectives('Vote', { industry: 0.5 });
    const ind = result.find((p) => p.stakeholder === 'industry');
    expect(ind?.impact).toBe('neutral');
  });

  it('should include the topic in evidence', () => {
    const topic = 'Digital Markets Act vote';
    const result = buildDefaultStakeholderPerspectives(topic);
    for (const p of result) {
      expect(p.evidence).toContain(topic);
    }
  });

  it('should default to score 0.5 (medium / neutral) when no scores provided', () => {
    const result = buildDefaultStakeholderPerspectives('Default topic');
    for (const p of result) {
      expect(p.severity).toBe('medium');
      expect(p.impact).toBe('neutral');
    }
  });
});

// ─── scoreStakeholderInfluence ────────────────────────────────────────────────

describe('scoreStakeholderInfluence', () => {
  it('should return null for null input', () => {
    expect(scoreStakeholderInfluence(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(scoreStakeholderInfluence(undefined)).toBeNull();
  });

  it('should return null when stakeholder type is invalid', () => {
    expect(scoreStakeholderInfluence({ stakeholder: 'unknown_type' })).toBeNull();
  });

  it('should return null for non-object input', () => {
    expect(scoreStakeholderInfluence('string')).toBeNull();
    expect(scoreStakeholderInfluence(42)).toBeNull();
  });

  it('should parse a valid stakeholder perspective', () => {
    const raw = {
      stakeholder: 'civil_society',
      impact: 'positive',
      severity: 'high',
      reasoning: 'Improves transparency',
      evidence: ['EP press release', 'NGO statement'],
    };
    const result = scoreStakeholderInfluence(raw);
    expect(result).not.toBeNull();
    expect(result?.stakeholder).toBe('civil_society');
    expect(result?.impact).toBe('positive');
    expect(result?.severity).toBe('high');
    expect(result?.reasoning).toBe('Improves transparency');
    expect(result?.evidence).toEqual(['EP press release', 'NGO statement']);
  });

  it('should default impact to neutral for unknown impact values', () => {
    const result = scoreStakeholderInfluence({ stakeholder: 'industry', impact: 'unknown' });
    expect(result?.impact).toBe('neutral');
  });

  it('should default severity to medium for unknown severity values', () => {
    const result = scoreStakeholderInfluence({ stakeholder: 'industry', severity: 'extreme' });
    expect(result?.severity).toBe('medium');
  });

  it('should handle all 6 valid stakeholder types', () => {
    for (const t of ALL_STAKEHOLDER_TYPES) {
      const result = scoreStakeholderInfluence({ stakeholder: t });
      expect(result).not.toBeNull();
      expect(result?.stakeholder).toBe(t);
    }
  });
});

// ─── buildStakeholderOutcomeMatrix ────────────────────────────────────────────

describe('buildStakeholderOutcomeMatrix', () => {
  it('should return a matrix row with the provided action', () => {
    const result = buildStakeholderOutcomeMatrix('Vote on DMA');
    expect(result.action).toBe('Vote on DMA');
  });

  it('should default to medium confidence', () => {
    const result = buildStakeholderOutcomeMatrix('Test');
    expect(result.confidence).toBe('medium');
  });

  it('should accept a confidence override', () => {
    const result = buildStakeholderOutcomeMatrix('Test', {}, 'high');
    expect(result.confidence).toBe('high');
  });

  it('should produce outcomes for all 6 stakeholder types', () => {
    const result = buildStakeholderOutcomeMatrix('Test');
    expect(Object.keys(result.outcomes)).toHaveLength(6);
    expect(result.outcomes.political_groups).toBeDefined();
    expect(result.outcomes.civil_society).toBeDefined();
    expect(result.outcomes.industry).toBeDefined();
    expect(result.outcomes.national_govts).toBeDefined();
    expect(result.outcomes.citizens).toBeDefined();
    expect(result.outcomes.eu_institutions).toBeDefined();
  });

  it('should mark winner for score > 0.6', () => {
    const result = buildStakeholderOutcomeMatrix('Vote', { political_groups: 0.9 });
    expect(result.outcomes.political_groups).toBe('winner');
  });

  it('should mark loser for score < 0.4', () => {
    const result = buildStakeholderOutcomeMatrix('Vote', { citizens: 0.2 });
    expect(result.outcomes.citizens).toBe('loser');
  });

  it('should mark neutral for score == 0.5 (default)', () => {
    const result = buildStakeholderOutcomeMatrix('Vote');
    expect(result.outcomes.industry).toBe('neutral');
  });

  it('should use neutral outcome for missing scores', () => {
    const result = buildStakeholderOutcomeMatrix('Test', {
      political_groups: 0.8,
    });
    // civil_society has no score → defaults to 0.5 → neutral
    expect(result.outcomes.civil_society).toBe('neutral');
  });
});

// ─── rankStakeholdersByInfluence ──────────────────────────────────────────────

describe('rankStakeholdersByInfluence', () => {
  it('should return an empty array for empty input', () => {
    expect(rankStakeholdersByInfluence([])).toEqual([]);
  });

  it('should rank high-severity before medium and low', () => {
    const perspectives = [
      { stakeholder: 'citizens', impact: 'neutral', severity: 'low', reasoning: '', evidence: [] },
      { stakeholder: 'industry', impact: 'positive', severity: 'high', reasoning: '', evidence: [] },
      { stakeholder: 'civil_society', impact: 'neutral', severity: 'medium', reasoning: '', evidence: [] },
    ];
    const result = rankStakeholdersByInfluence(perspectives);
    expect(result[0]).toBe('industry');
    expect(result[1]).toBe('civil_society');
    expect(result[2]).toBe('citizens');
  });

  it('should rank negative impact before positive at the same severity', () => {
    const perspectives = [
      { stakeholder: 'national_govts', impact: 'positive', severity: 'high', reasoning: '', evidence: [] },
      { stakeholder: 'eu_institutions', impact: 'negative', severity: 'high', reasoning: '', evidence: [] },
    ];
    const result = rankStakeholdersByInfluence(perspectives);
    expect(result[0]).toBe('eu_institutions');
    expect(result[1]).toBe('national_govts');
  });

  it('should not mutate the input array', () => {
    const perspectives = [
      { stakeholder: 'citizens', impact: 'positive', severity: 'low', reasoning: '', evidence: [] },
      { stakeholder: 'industry', impact: 'negative', severity: 'high', reasoning: '', evidence: [] },
    ];
    const copy = [...perspectives];
    rankStakeholdersByInfluence(perspectives);
    expect(perspectives).toEqual(copy);
  });
});

// ─── computeVotingIntensity ──────────────────────────────────────────────────

describe('computeVotingIntensity', () => {
  it('should return null for empty records', () => {
    expect(computeVotingIntensity([])).toBeNull();
  });

  it('should compute metrics for a single decisive vote', () => {
    const records = [{ title: 'Test', date: '2025-01-10', result: 'Adopted', votes: { for: 500, against: 50, abstain: 20 } }];
    const result = computeVotingIntensity(records);
    expect(result).not.toBeNull();
    expect(result.unanimity).toBeGreaterThan(0.7);
    expect(result.polarization).toBeLessThan(0.3);
    expect(result.decisiveVoteCount).toBe(1);
    expect(result.closeVoteCount).toBe(0);
  });

  it('should detect close votes (margin < 10%)', () => {
    const records = [
      { title: 'Close vote', date: '2025-01-10', result: 'Adopted', votes: { for: 310, against: 300, abstain: 10 } },
    ];
    const result = computeVotingIntensity(records);
    expect(result).not.toBeNull();
    expect(result.closeVoteCount).toBe(1);
    expect(result.decisiveVoteCount).toBe(0);
    expect(result.polarization).toBeGreaterThan(0.8);
  });

  it('should handle multiple votes and average correctly', () => {
    const records = [
      { title: 'Decisive', date: '2025-01-10', result: 'Adopted', votes: { for: 600, against: 10, abstain: 10 } },
      { title: 'Close', date: '2025-01-11', result: 'Rejected', votes: { for: 300, against: 310, abstain: 10 } },
    ];
    const result = computeVotingIntensity(records);
    expect(result).not.toBeNull();
    expect(result.decisiveVoteCount).toBe(1);
    expect(result.closeVoteCount).toBe(1);
    expect(result.averageMargin).toBeGreaterThan(0);
  });

  it('should return null when all records have zero total votes', () => {
    const records = [
      { title: 'Empty', date: '2025-01-10', result: 'N/A', votes: { for: 0, against: 0, abstain: 0 } },
    ];
    const result = computeVotingIntensity(records);
    expect(result).toBeNull();
  });

  it('should skip zero-vote records and only count valid ones', () => {
    const records = [
      { title: 'Empty', date: '2025-01-10', result: 'N/A', votes: { for: 0, against: 0, abstain: 0 } },
      { title: 'Valid', date: '2025-01-11', result: 'Adopted', votes: { for: 500, against: 50, abstain: 20 } },
    ];
    const result = computeVotingIntensity(records);
    expect(result).not.toBeNull();
    expect(result.unanimity).toBeGreaterThan(0);
    expect(result.averageMargin).toBeGreaterThan(0);
    expect(result.closeVoteCount).toBe(0);
    expect(result.decisiveVoteCount).toBe(1);
  });

  it('should return averageMargin between 0 and 1', () => {
    const records = [
      { title: 'A', date: '2025-01-10', result: 'Adopted', votes: { for: 400, against: 200, abstain: 20 } },
      { title: 'B', date: '2025-01-11', result: 'Adopted', votes: { for: 350, against: 250, abstain: 30 } },
    ];
    const result = computeVotingIntensity(records);
    expect(result).not.toBeNull();
    expect(result.averageMargin).toBeGreaterThanOrEqual(0);
    expect(result.averageMargin).toBeLessThanOrEqual(1);
  });

  it('should include abstentions when determining unanimity largest faction', () => {
    const records = [
      {
        title: 'Abstain-dominant vote',
        date: '2025-01-12',
        result: 'Adopted',
        votes: { for: 20, against: 10, abstain: 70 },
      },
    ];
    const result = computeVotingIntensity(records);
    expect(result).not.toBeNull();
    expect(result.unanimity).toBe(0.7);
    expect(result.polarization).toBeCloseTo(0.67, 2);
    expect(result.averageMargin).toBe(0.1);
    expect(result.closeVoteCount).toBe(0);
    expect(result.decisiveVoteCount).toBe(0);
  });

  it('should not understate polarization when some records are abstain-only', () => {
    const records = [
      // Abstain-only record: no for/against, should not count toward polarization average
      { title: 'Abstain-only', date: '2025-01-12', result: 'N/A', votes: { for: 0, against: 0, abstain: 100 } },
      // Highly polarized record: perfectly split for/against
      { title: 'Split', date: '2025-01-13', result: 'Adopted', votes: { for: 50, against: 50, abstain: 0 } },
    ];
    const result = computeVotingIntensity(records);
    expect(result).not.toBeNull();
    // Polarization should be 1.0 (perfectly split) — not understated by the abstain-only record
    expect(result.polarization).toBe(1);
    // Both records are valid (non-zero total), so validCount = 2
    expect(result.unanimity).toBeCloseTo(0.75, 2); // avg of 1.0 and 0.5
  });
});

// ─── detectCoalitionShifts ───────────────────────────────────────────────────

describe('detectCoalitionShifts', () => {
  it('should return empty array when both inputs are empty', () => {
    expect(detectCoalitionShifts([], [])).toEqual([]);
  });

  it('should detect a weakening shift when cohesion drops significantly', () => {
    const current = [{ group: 'EPP', cohesion: 0.5, participation: 0.8 }];
    const baseline = [{ group: 'EPP', cohesion: 0.9, participation: 0.8 }];
    const shifts = detectCoalitionShifts(current, baseline);
    expect(shifts).toHaveLength(1);
    expect(shifts[0].group).toBe('EPP');
    expect(shifts[0].direction).toBe('weakening');
    expect(shifts[0].significance).toBe('critical');
    expect(shifts[0].cohesionDelta).toBeLessThan(0);
  });

  it('should detect a strengthening shift when cohesion rises', () => {
    const current = [{ group: 'S&D', cohesion: 0.95, participation: 0.9 }];
    const baseline = [{ group: 'S&D', cohesion: 0.7, participation: 0.85 }];
    const shifts = detectCoalitionShifts(current, baseline);
    expect(shifts).toHaveLength(1);
    expect(shifts[0].direction).toBe('strengthening');
    expect(shifts[0].significance).toBe('critical');
  });

  it('should mark stable when delta is within ±5%', () => {
    const current = [{ group: 'Renew', cohesion: 0.82, participation: 0.8 }];
    const baseline = [{ group: 'Renew', cohesion: 0.80, participation: 0.8 }];
    const shifts = detectCoalitionShifts(current, baseline);
    expect(shifts).toHaveLength(1);
    expect(shifts[0].direction).toBe('stable');
    expect(shifts[0].significance).toBe('low');
  });

  it('should use current cohesion as baseline when group not in baseline', () => {
    const current = [{ group: 'NewGroup', cohesion: 0.7, participation: 0.6 }];
    const shifts = detectCoalitionShifts(current, []);
    expect(shifts).toHaveLength(1);
    expect(shifts[0].direction).toBe('stable');
    expect(shifts[0].cohesionDelta).toBe(0);
  });

  it('should sort by significance then absolute delta', () => {
    const current = [
      { group: 'EPP', cohesion: 0.5, participation: 0.8 },
      { group: 'S&D', cohesion: 0.85, participation: 0.8 },
      { group: 'Greens', cohesion: 0.3, participation: 0.6 },
    ];
    const baseline = [
      { group: 'EPP', cohesion: 0.55, participation: 0.8 },
      { group: 'S&D', cohesion: 0.8, participation: 0.8 },
      { group: 'Greens', cohesion: 0.7, participation: 0.6 },
    ];
    const shifts = detectCoalitionShifts(current, baseline);
    expect(shifts).toHaveLength(3);
    // Greens delta -0.4 (critical) should be first
    expect(shifts[0].group).toBe('Greens');
    expect(shifts[0].significance).toBe('critical');
  });
});

// ─── computePolarizationIndex ────────────────────────────────────────────────

describe('computePolarizationIndex', () => {
  it('should return null for empty patterns', () => {
    expect(computePolarizationIndex([])).toBeNull();
  });

  it('should assess "consensus" when all groups have moderate cohesion', () => {
    const patterns = [
      { group: 'EPP', cohesion: 0.65, participation: 0.8 },
      { group: 'S&D', cohesion: 0.6, participation: 0.75 },
      { group: 'Renew', cohesion: 0.7, participation: 0.7 },
      { group: 'Greens', cohesion: 0.55, participation: 0.6 },
    ];
    const result = computePolarizationIndex(patterns);
    expect(result).not.toBeNull();
    expect(result.assessment).toBe('consensus');
    expect(result.highCohesionGroups).toHaveLength(0);
    expect(result.fragmentedGroups).toHaveLength(0);
  });

  it('should assess "highly-polarized" when most groups are extreme', () => {
    const patterns = [
      { group: 'EPP', cohesion: 0.95, participation: 0.9 },
      { group: 'S&D', cohesion: 0.3, participation: 0.6 },
      { group: 'Renew', cohesion: 0.9, participation: 0.8 },
      { group: 'Greens', cohesion: 0.4, participation: 0.5 },
    ];
    const result = computePolarizationIndex(patterns);
    expect(result).not.toBeNull();
    expect(result.assessment).toBe('highly-polarized');
    expect(result.highCohesionGroups).toContain('EPP');
    expect(result.highCohesionGroups).toContain('Renew');
    expect(result.fragmentedGroups).toContain('S&D');
    expect(result.fragmentedGroups).toContain('Greens');
  });

  it('should compute effectiveBlocs using Laakso-Taagepera style', () => {
    // Two groups with equal participation → effectiveBlocs ≈ 2
    const patterns = [
      { group: 'EPP', cohesion: 0.8, participation: 0.5 },
      { group: 'S&D', cohesion: 0.8, participation: 0.5 },
    ];
    const result = computePolarizationIndex(patterns);
    expect(result).not.toBeNull();
    expect(result.effectiveBlocs).toBeCloseTo(2, 0);
  });

  it('should return overallIndex between 0 and 1', () => {
    const patterns = [
      { group: 'A', cohesion: 0.9, participation: 0.8 },
      { group: 'B', cohesion: 0.6, participation: 0.7 },
    ];
    const result = computePolarizationIndex(patterns);
    expect(result).not.toBeNull();
    expect(result.overallIndex).toBeGreaterThanOrEqual(0);
    expect(result.overallIndex).toBeLessThanOrEqual(1);
  });

  it('should handle single group patterns', () => {
    const patterns = [{ group: 'Only', cohesion: 0.85, participation: 0.9 }];
    const result = computePolarizationIndex(patterns);
    expect(result).not.toBeNull();
    expect(result.highCohesionGroups).toContain('Only');
    expect(result.effectiveBlocs).toBe(1);
  });
});

// ─── detectVotingTrends ──────────────────────────────────────────────────────

describe('detectVotingTrends', () => {
  it('should return empty array for empty records', () => {
    expect(detectVotingTrends([])).toEqual([]);
  });

  it('should return empty array for a single record', () => {
    const records = [{ title: 'A', date: '2025-01-10', result: 'Adopted', votes: { for: 400, against: 100, abstain: 10 } }];
    expect(detectVotingTrends(records)).toEqual([]);
  });

  it('should detect adoption rate trend from multiple decided records', () => {
    const records = [
      { title: 'A', date: '2025-01-10', result: 'Adopted', votes: { for: 400, against: 100, abstain: 10 } },
      { title: 'B', date: '2025-01-11', result: 'Adopted', votes: { for: 500, against: 50, abstain: 20 } },
      { title: 'C', date: '2025-01-12', result: 'Adopted', votes: { for: 450, against: 80, abstain: 30 } },
    ];
    const trends = detectVotingTrends(records);
    expect(trends.length).toBeGreaterThan(0);
    const adoptionTrend = trends.find(t => t.trendId === 'adoption-rate');
    expect(adoptionTrend).toBeDefined();
    expect(adoptionTrend.metricValue).toBe(1); // 100% adoption rate
    expect(adoptionTrend.direction).toBe('increasing');
  });

  it('should detect increasing margins trend', () => {
    const records = [
      { title: 'A', date: '2025-01-10', result: 'Adopted', votes: { for: 310, against: 300, abstain: 10 } },
      { title: 'B', date: '2025-01-11', result: 'Adopted', votes: { for: 320, against: 290, abstain: 10 } },
      { title: 'C', date: '2025-01-12', result: 'Adopted', votes: { for: 500, against: 100, abstain: 10 } },
      { title: 'D', date: '2025-01-13', result: 'Adopted', votes: { for: 550, against: 50, abstain: 10 } },
    ];
    const trends = detectVotingTrends(records);
    const marginTrend = trends.find(t => t.trendId === 'increasing-margins');
    expect(marginTrend).toBeDefined();
    expect(marginTrend.direction).toBe('increasing');
  });

  it('should detect increasing polarization from close votes', () => {
    const records = [
      { title: 'A', date: '2025-01-10', result: 'Adopted', votes: { for: 500, against: 100, abstain: 10 } },
      { title: 'B', date: '2025-01-11', result: 'Adopted', votes: { for: 480, against: 120, abstain: 10 } },
      { title: 'C', date: '2025-01-12', result: 'Adopted', votes: { for: 310, against: 300, abstain: 10 } },
      { title: 'D', date: '2025-01-13', result: 'Rejected', votes: { for: 305, against: 310, abstain: 5 } },
    ];
    const trends = detectVotingTrends(records);
    const polTrend = trends.find(t => t.trendId === 'increasing-polarization');
    expect(polTrend).toBeDefined();
    expect(polTrend.direction).toBe('increasing');
  });

  it('should skip records with zero total votes', () => {
    const records = [
      { title: 'A', date: '2025-01-10', result: 'Adopted', votes: { for: 400, against: 100, abstain: 10 } },
      { title: 'Empty', date: '2025-01-11', result: 'N/A', votes: { for: 0, against: 0, abstain: 0 } },
      { title: 'B', date: '2025-01-12', result: 'Adopted', votes: { for: 450, against: 80, abstain: 30 } },
    ];
    const trends = detectVotingTrends(records);
    const adoptionTrend = trends.find(t => t.trendId === 'adoption-rate');
    expect(adoptionTrend).toBeDefined();
    expect(adoptionTrend.recordCount).toBe(2); // only 2 decided votes
  });

  it('should sort trends by confidence descending', () => {
    const records = [
      { title: 'A', date: '2025-01-10', result: 'Adopted', votes: { for: 400, against: 100, abstain: 10 } },
      { title: 'B', date: '2025-01-11', result: 'Adopted', votes: { for: 450, against: 80, abstain: 30 } },
      { title: 'C', date: '2025-01-12', result: 'Rejected', votes: { for: 200, against: 400, abstain: 10 } },
    ];
    const trends = detectVotingTrends(records);
    for (let i = 1; i < trends.length; i++) {
      expect(trends[i].confidence).toBeLessThanOrEqual(trends[i - 1].confidence);
    }
  });

  it('should cap confidence at 1', () => {
    const records = [
      { title: 'A', date: '2025-01-10', result: 'Adopted', votes: { for: 10, against: 600, abstain: 10 } },
      { title: 'B', date: '2025-01-11', result: 'Adopted', votes: { for: 600, against: 10, abstain: 10 } },
    ];
    const trends = detectVotingTrends(records);
    for (const t of trends) {
      expect(t.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('should sort records by date before splitting into halves', () => {
    // Provide records in reverse chronological order — earlier records have wide margins, later have close margins
    const records = [
      { title: 'D', date: '2025-01-13', result: 'Adopted', votes: { for: 310, against: 300, abstain: 10 } },
      { title: 'C', date: '2025-01-12', result: 'Adopted', votes: { for: 305, against: 310, abstain: 5 } },
      { title: 'B', date: '2025-01-11', result: 'Adopted', votes: { for: 500, against: 100, abstain: 10 } },
      { title: 'A', date: '2025-01-10', result: 'Adopted', votes: { for: 480, against: 120, abstain: 10 } },
    ];
    const trends = detectVotingTrends(records);
    // After sorting by date (A, B → first half; C, D → second half), margins narrow
    const marginTrend = trends.find(t => t.trendId === 'decreasing-margins');
    expect(marginTrend).toBeDefined();
    expect(marginTrend.direction).toBe('decreasing');
  });

  it('should skip abstain-only records in margin calculations', () => {
    const records = [
      { title: 'A', date: '2025-01-10', result: 'Adopted', votes: { for: 400, against: 100, abstain: 10 } },
      { title: 'Abstain-only', date: '2025-01-11', result: 'N/A', votes: { for: 0, against: 0, abstain: 100 } },
      { title: 'B', date: '2025-01-12', result: 'Adopted', votes: { for: 450, against: 80, abstain: 30 } },
    ];
    const trends = detectVotingTrends(records);
    const adoptionTrend = trends.find(t => t.trendId === 'adoption-rate');
    expect(adoptionTrend).toBeDefined();
    // margins.length should be 2 (abstain-only record skipped)
    expect(adoptionTrend.recordCount).toBe(2);
  });

  it('should handle records with missing or invalid dates gracefully', () => {
    const records = [
      { title: 'A', result: 'Adopted', votes: { for: 400, against: 100, abstain: 10 } },
      { title: 'B', date: '', result: 'Adopted', votes: { for: 500, against: 50, abstain: 20 } },
      { title: 'C', date: 'not-a-date', result: 'Rejected', votes: { for: 200, against: 400, abstain: 10 } },
    ];
    const trends = detectVotingTrends(records);
    // Should still produce results — all records have valid votes
    expect(trends.length).toBeGreaterThan(0);
  });

  it('should skip records with missing or malformed vote data', () => {
    const records = [
      { title: 'A', date: '2025-01-10', result: 'Adopted', votes: { for: 400, against: 100, abstain: 10 } },
      { title: 'No votes', date: '2025-01-11', result: 'Adopted' },
      { title: 'B', date: '2025-01-12', result: 'Adopted', votes: { for: 450, against: 80, abstain: 30 } },
    ];
    const trends = detectVotingTrends(records);
    const adoptionTrend = trends.find(t => t.trendId === 'adoption-rate');
    expect(adoptionTrend).toBeDefined();
    // Record without votes should be skipped, so only 2 valid records
    expect(adoptionTrend.recordCount).toBe(2);
  });
});

// ─── computeCrossSessionCoalitionStability ───────────────────────────────────

describe('computeCrossSessionCoalitionStability', () => {
  it('should return volatile report for empty patterns', () => {
    const result = computeCrossSessionCoalitionStability([]);
    expect(result.overallStability).toBe(0);
    expect(result.patternCount).toBe(0);
    expect(result.stableGroups).toEqual([]);
    expect(result.decliningGroups).toEqual([]);
    expect(result.forecast).toBe('volatile');
  });

  it('should detect stable groups (avg cohesion >= 0.7)', () => {
    const patterns = [
      { group: 'EPP', cohesion: 0.9, participation: 0.8 },
      { group: 'EPP', cohesion: 0.85, participation: 0.85 },
      { group: 'S&D', cohesion: 0.75, participation: 0.7 },
    ];
    const result = computeCrossSessionCoalitionStability(patterns);
    expect(result.stableGroups).toContain('EPP');
    expect(result.stableGroups).toContain('S&D');
    expect(result.forecast).toBe('stable');
  });

  it('should detect declining groups (avg cohesion < 0.5)', () => {
    const patterns = [
      { group: 'Greens', cohesion: 0.3, participation: 0.5 },
      { group: 'Greens', cohesion: 0.4, participation: 0.6 },
      { group: 'EPP', cohesion: 0.8, participation: 0.9 },
    ];
    const result = computeCrossSessionCoalitionStability(patterns);
    expect(result.decliningGroups).toContain('Greens');
    expect(result.stableGroups).toContain('EPP');
  });

  it('should compute overall stability as average of group averages', () => {
    const patterns = [
      { group: 'A', cohesion: 0.8, participation: 0.9 },
      { group: 'B', cohesion: 0.6, participation: 0.7 },
    ];
    const result = computeCrossSessionCoalitionStability(patterns);
    expect(result.overallStability).toBe(0.7); // (0.8+0.6)/2
  });

  it('should forecast at-risk when overall stability is between 0.5 and 0.7', () => {
    const patterns = [
      { group: 'A', cohesion: 0.6, participation: 0.8 },
      { group: 'B', cohesion: 0.5, participation: 0.7 },
    ];
    const result = computeCrossSessionCoalitionStability(patterns);
    expect(result.forecast).toBe('at-risk');
  });

  it('should forecast volatile when overall stability < 0.5', () => {
    const patterns = [
      { group: 'A', cohesion: 0.3, participation: 0.5 },
      { group: 'B', cohesion: 0.4, participation: 0.6 },
    ];
    const result = computeCrossSessionCoalitionStability(patterns);
    expect(result.forecast).toBe('volatile');
  });

  it('should aggregate multiple entries for the same group', () => {
    const patterns = [
      { group: 'EPP', cohesion: 0.9, participation: 0.9 },
      { group: 'EPP', cohesion: 0.7, participation: 0.8 },
      { group: 'EPP', cohesion: 0.8, participation: 0.85 },
    ];
    const result = computeCrossSessionCoalitionStability(patterns);
    expect(result.patternCount).toBe(3);
    expect(result.stableGroups).toContain('EPP'); // avg 0.8
    expect(result.overallStability).toBe(0.8);
  });
});

// ─── rankMEPInfluenceByTopic ─────────────────────────────────────────────────

describe('rankMEPInfluenceByTopic', () => {
  const scores = [
    { mepId: 'MEP-1', mepName: 'Alice Green', overallScore: 80, votingActivity: 70, legislativeOutput: 85, committeeEngagement: 75, rank: 'environment' },
    { mepId: 'MEP-2', mepName: 'Bob Fischer', overallScore: 90, votingActivity: 85, legislativeOutput: 90, committeeEngagement: 80, rank: 'trade' },
    { mepId: 'MEP-3', mepName: 'Eve Trade', overallScore: 60, votingActivity: 55, legislativeOutput: 65, committeeEngagement: 50, rank: 'environment' },
  ];

  it('should return empty array for empty scores', () => {
    expect(rankMEPInfluenceByTopic([], 'trade')).toEqual([]);
  });

  it('should filter by topic matching mepName', () => {
    const result = rankMEPInfluenceByTopic(scores, 'Green');
    expect(result).toHaveLength(1);
    expect(result[0].mepId).toBe('MEP-1');
  });

  it('should filter by topic matching rank (case-insensitive)', () => {
    const result = rankMEPInfluenceByTopic(scores, 'environment');
    expect(result).toHaveLength(2);
    expect(result[0].overallScore).toBeGreaterThanOrEqual(result[1].overallScore);
  });

  it('should return all scores sorted when topic is empty', () => {
    const result = rankMEPInfluenceByTopic(scores, '');
    expect(result).toHaveLength(3);
    expect(result[0].overallScore).toBe(90);
    expect(result[2].overallScore).toBe(60);
  });

  it('should return all scores sorted when no matches found', () => {
    const result = rankMEPInfluenceByTopic(scores, 'nonexistent-topic');
    expect(result).toHaveLength(3);
    expect(result[0].overallScore).toBe(90);
  });

  it('should match by mepId', () => {
    const result = rankMEPInfluenceByTopic(scores, 'mep-2');
    expect(result).toHaveLength(1);
    expect(result[0].mepId).toBe('MEP-2');
  });

  it('should sort matching results by overallScore descending', () => {
    const result = rankMEPInfluenceByTopic(scores, 'environment');
    expect(result[0].mepId).toBe('MEP-1');
    expect(result[1].mepId).toBe('MEP-3');
  });

  it('should handle whitespace-only topic as empty', () => {
    const result = rankMEPInfluenceByTopic(scores, '   ');
    expect(result).toHaveLength(3);
  });

  it('should handle null or undefined topic gracefully', () => {
    const result1 = rankMEPInfluenceByTopic(scores, null);
    expect(result1).toHaveLength(3);
    expect(result1[0].overallScore).toBeGreaterThanOrEqual(result1[1].overallScore);

    const result2 = rankMEPInfluenceByTopic(scores, undefined);
    expect(result2).toHaveLength(3);
  });
});

// ─── buildLegislativeVelocityReport ──────────────────────────────────────────

describe('buildLegislativeVelocityReport', () => {
  it('should return empty report for empty docs', () => {
    const result = buildLegislativeVelocityReport([]);
    expect(result.documentCount).toBe(0);
    expect(result.stageBreakdown).toEqual({});
    expect(result.averageDaysPerStage).toBe(0);
    expect(result.bottleneckCount).toBe(0);
    expect(result.throughputAssessment).toBe('slow');
  });

  it('should count documents by stage using status field', () => {
    const docs = [
      { title: 'A', status: 'Committee', date: '2025-01-01' },
      { title: 'B', status: 'Committee', date: '2025-01-05' },
      { title: 'C', status: 'Plenary', date: '2025-01-10' },
    ];
    const result = buildLegislativeVelocityReport(docs);
    expect(result.documentCount).toBe(3);
    expect(result.stageBreakdown['Committee']).toBe(2);
    expect(result.stageBreakdown['Plenary']).toBe(1);
  });

  it('should use type as fallback when status is missing', () => {
    const docs = [
      { title: 'A', type: 'DIRECTIVE', date: '2025-01-01' },
      { title: 'B', type: 'REGULATION', date: '2025-02-01' },
    ];
    const result = buildLegislativeVelocityReport(docs);
    expect(result.stageBreakdown['DIRECTIVE']).toBe(1);
    expect(result.stageBreakdown['REGULATION']).toBe(1);
  });

  it('should label unknown stage when both status and type missing', () => {
    const docs = [{ title: 'A' }];
    const result = buildLegislativeVelocityReport(docs);
    expect(result.stageBreakdown['Unknown']).toBe(1);
  });

  it('should detect bottleneck stages', () => {
    const docs = [
      { title: 'A', status: 'Committee', date: '2025-01-01' },
      { title: 'B', status: 'Committee', date: '2025-01-02' },
      { title: 'C', status: 'Committee', date: '2025-01-03' },
      { title: 'D', status: 'Committee', date: '2025-01-04' },
      { title: 'E', status: 'Plenary', date: '2025-03-01' },
    ];
    const result = buildLegislativeVelocityReport(docs);
    expect(result.bottleneckCount).toBeGreaterThan(0);
  });

  it('should compute average days per stage from date spread', () => {
    const docs = [
      { title: 'A', status: 'First Reading', date: '2025-01-01' },
      { title: 'B', status: 'Second Reading', date: '2025-04-01' },
    ];
    const result = buildLegislativeVelocityReport(docs);
    expect(result.averageDaysPerStage).toBeGreaterThan(0);
  });

  it('should assess fast throughput for short durations', () => {
    const docs = [
      { title: 'A', status: 'S1', date: '2025-01-01' },
      { title: 'B', status: 'S1', date: '2025-01-15' },
    ];
    const result = buildLegislativeVelocityReport(docs);
    expect(result.throughputAssessment).toBe('fast');
  });

  it('should assess slow throughput for long durations', () => {
    const docs = [
      { title: 'A', status: 'S1', date: '2024-01-01' },
      { title: 'B', status: 'S2', date: '2025-01-01' },
    ];
    const result = buildLegislativeVelocityReport(docs);
    expect(result.throughputAssessment).toBe('slow');
  });

  it('should handle documents with missing dates', () => {
    const docs = [
      { title: 'A', status: 'Draft' },
      { title: 'B', status: 'Review' },
    ];
    const result = buildLegislativeVelocityReport(docs);
    expect(result.documentCount).toBe(2);
    expect(result.averageDaysPerStage).toBe(0);
    // Insufficient date data: throughput should be 'normal' (unknown), not 'fast'
    expect(result.throughputAssessment).toBe('normal');
  });
});
