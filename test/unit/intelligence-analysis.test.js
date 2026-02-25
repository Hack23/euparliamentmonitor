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
} from '../../scripts/utils/intelligence-analysis.js';
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
