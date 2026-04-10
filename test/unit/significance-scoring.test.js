// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for utils/significance-scoring module
 */

import { describe, it, expect } from 'vitest';
import {
  scoreSignificance,
  scoreBatch,
  clampScore,
  deriveDecision,
  formatScoreMarkdown,
  formatBatchMarkdown,
  WEIGHT_PARLIAMENTARY,
  WEIGHT_POLICY,
  WEIGHT_PUBLIC_INTEREST,
  WEIGHT_URGENCY,
  WEIGHT_INSTITUTIONAL,
  THRESHOLD_PUBLISH,
  THRESHOLD_HOLD,
} from '../../scripts/utils/significance-scoring.js';

// ─── clampScore ──────────────────────────────────────────────────────────────

describe('clampScore', () => {
  it('returns 0 for negative values', () => {
    expect(clampScore(-5)).toBe(0);
  });

  it('returns 10 for values above 10', () => {
    expect(clampScore(15)).toBe(10);
  });

  it('passes through values within range', () => {
    expect(clampScore(5)).toBe(5);
    expect(clampScore(0)).toBe(0);
    expect(clampScore(10)).toBe(10);
  });

  it('returns 0 for NaN', () => {
    expect(clampScore(NaN)).toBe(0);
  });

  it('returns 0 for Infinity', () => {
    expect(clampScore(Infinity)).toBe(0);
    expect(clampScore(-Infinity)).toBe(0);
  });
});

// ─── deriveDecision ──────────────────────────────────────────────────────────

describe('deriveDecision', () => {
  it('returns "skip" for scores below hold threshold', () => {
    expect(deriveDecision(0)).toBe('skip');
    expect(deriveDecision(3.4)).toBe('skip');
  });

  it('returns "hold" for scores in hold range', () => {
    expect(deriveDecision(3.5)).toBe('hold');
    expect(deriveDecision(4.0)).toBe('hold');
    expect(deriveDecision(5.4)).toBe('hold');
  });

  it('returns "publish" for scores at or above publish threshold', () => {
    expect(deriveDecision(5.5)).toBe('publish');
    expect(deriveDecision(6.0)).toBe('publish');
    expect(deriveDecision(8.5)).toBe('publish');
    expect(deriveDecision(10)).toBe('publish');
  });
});

// ─── scoreSignificance ──────────────────────────────────────────────────────

describe('scoreSignificance', () => {
  it('computes correct composite for all-zero input', () => {
    const result = scoreSignificance({
      title: 'Zero event',
      parliamentarySignificance: 0,
      policyImpact: 0,
      publicInterest: 0,
      temporalUrgency: 0,
      institutionalRelevance: 0,
    });
    expect(result.composite).toBe(0);
    expect(result.decision).toBe('skip');
  });

  it('computes correct composite for all-10 input', () => {
    const result = scoreSignificance({
      title: 'Max event',
      parliamentarySignificance: 10,
      policyImpact: 10,
      publicInterest: 10,
      temporalUrgency: 10,
      institutionalRelevance: 10,
    });
    expect(result.composite).toBe(10);
    expect(result.decision).toBe('publish');
  });

  it('applies correct weights', () => {
    const result = scoreSignificance({
      title: 'Weighted event',
      parliamentarySignificance: 10,
      policyImpact: 0,
      publicInterest: 0,
      temporalUrgency: 0,
      institutionalRelevance: 0,
    });
    // Only parliamentary significance contributes: 10 * 0.25 = 2.5
    expect(result.composite).toBe(2.5);
  });

  it('clamps out-of-range dimension values', () => {
    const result = scoreSignificance({
      title: 'Clamped event',
      parliamentarySignificance: -5,
      policyImpact: 20,
      publicInterest: 5,
      temporalUrgency: 5,
      institutionalRelevance: 5,
    });
    expect(result.parliamentarySignificance).toBe(0);
    expect(result.policyImpact).toBe(10);
    expect(result.publicInterest).toBe(5);
  });

  it('produces consistent results for same input', () => {
    const input = {
      title: 'Test event',
      parliamentarySignificance: 7,
      policyImpact: 8,
      publicInterest: 6,
      temporalUrgency: 5,
      institutionalRelevance: 9,
    };
    const result1 = scoreSignificance(input);
    const result2 = scoreSignificance(input);
    expect(result1.composite).toBe(result2.composite);
    expect(result1.decision).toBe(result2.decision);
  });

  it('correctly computes the calibration example from the template', () => {
    // From template: AI Act plenary vote
    // Parliamentary=9, Policy=10, Public=9, Urgency=7, CrossGroup=8
    // Expected: 2.25 + 2.50 + 1.80 + 1.05 + 1.20 = 8.80
    const result = scoreSignificance({
      title: 'AI Act final plenary vote',
      reference: 'P9_TA(2026)0089',
      parliamentarySignificance: 9,
      policyImpact: 10,
      publicInterest: 9,
      temporalUrgency: 7,
      institutionalRelevance: 8,
    });
    expect(result.composite).toBe(8.8);
    expect(result.decision).toBe('publish');
  });

  it('computes routine committee opinion correctly', () => {
    // From template calibration: Parl=3, Policy=2, Public=2, Urgency=1, CrossGroup=2
    // Expected: 0.75 + 0.50 + 0.40 + 0.15 + 0.30 = 2.10
    const result = scoreSignificance({
      title: 'Routine committee opinion',
      parliamentarySignificance: 3,
      policyImpact: 2,
      publicInterest: 2,
      temporalUrgency: 1,
      institutionalRelevance: 2,
    });
    expect(result.composite).toBe(2.1);
    expect(result.decision).toBe('skip');
  });

  it('decision is derived from rounded composite so it matches displayed value', () => {
    // The decision should always match what the user sees in composite.
    // If composite rounds to 6.00, decision should be 'publish' (threshold = 5.5).
    const result = scoreSignificance({
      title: 'Boundary event',
      parliamentarySignificance: 6,
      policyImpact: 6,
      publicInterest: 6,
      temporalUrgency: 6,
      institutionalRelevance: 6,
    });
    // composite = 6*0.25 + 6*0.25 + 6*0.20 + 6*0.15 + 6*0.15 = 6.00
    expect(result.composite).toBe(6);
    expect(result.decision).toBe('publish');
  });
});

// ─── scoreBatch ──────────────────────────────────────────────────────────────

describe('scoreBatch', () => {
  it('handles empty input array', () => {
    const result = scoreBatch([]);
    expect(result.scores).toHaveLength(0);
    expect(result.summary).toEqual({ publish: 0, hold: 0, skip: 0 });
  });

  it('scores a single event', () => {
    const result = scoreBatch([
      {
        title: 'Single event',
        parliamentarySignificance: 7,
        policyImpact: 7,
        publicInterest: 7,
        temporalUrgency: 7,
        institutionalRelevance: 7,
      },
    ]);
    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].composite).toBe(7);
    expect(result.summary.publish).toBe(1);
  });

  it('ranks events by composite descending', () => {
    const result = scoreBatch([
      {
        title: 'Low',
        parliamentarySignificance: 1,
        policyImpact: 1,
        publicInterest: 1,
        temporalUrgency: 1,
        institutionalRelevance: 1,
      },
      {
        title: 'High',
        parliamentarySignificance: 9,
        policyImpact: 9,
        publicInterest: 9,
        temporalUrgency: 9,
        institutionalRelevance: 9,
      },
    ]);
    expect(result.scores[0].composite).toBeGreaterThan(result.scores[1].composite);
  });

  it('correctly counts decisions across categories', () => {
    const result = scoreBatch([
      {
        title: 'Publish',
        parliamentarySignificance: 8,
        policyImpact: 8,
        publicInterest: 8,
        temporalUrgency: 8,
        institutionalRelevance: 8,
      },
      {
        title: 'Hold',
        parliamentarySignificance: 5,
        policyImpact: 5,
        publicInterest: 5,
        temporalUrgency: 5,
        institutionalRelevance: 5,
      },
      {
        title: 'Skip',
        parliamentarySignificance: 1,
        policyImpact: 1,
        publicInterest: 1,
        temporalUrgency: 1,
        institutionalRelevance: 1,
      },
    ]);
    expect(result.summary.publish).toBe(1);
    expect(result.summary.hold).toBe(1);
    expect(result.summary.skip).toBe(1);
  });
});

// ─── Constants ───────────────────────────────────────────────────────────────

describe('scoring constants', () => {
  it('weights sum to 1.0', () => {
    const totalWeight =
      WEIGHT_PARLIAMENTARY +
      WEIGHT_POLICY +
      WEIGHT_PUBLIC_INTEREST +
      WEIGHT_URGENCY +
      WEIGHT_INSTITUTIONAL;
    expect(totalWeight).toBeCloseTo(1.0, 10);
  });

  it('publish threshold is greater than hold threshold', () => {
    expect(THRESHOLD_PUBLISH).toBeGreaterThan(THRESHOLD_HOLD);
  });

  it('thresholds are within 0-10 range', () => {
    expect(THRESHOLD_PUBLISH).toBeGreaterThanOrEqual(0);
    expect(THRESHOLD_PUBLISH).toBeLessThanOrEqual(10);
    expect(THRESHOLD_HOLD).toBeGreaterThanOrEqual(0);
    expect(THRESHOLD_HOLD).toBeLessThanOrEqual(10);
  });
});

// ─── formatScoreMarkdown ─────────────────────────────────────────────────────

describe('formatScoreMarkdown', () => {
  it('includes the event title in the markdown', () => {
    const score = scoreSignificance({
      title: 'Test Event',
      parliamentarySignificance: 5,
      policyImpact: 5,
      publicInterest: 5,
      temporalUrgency: 5,
      institutionalRelevance: 5,
    });
    const md = formatScoreMarkdown(score, 'Test Event');
    expect(md).toContain('Test Event');
    expect(md).toContain('COMPOSITE SCORE');
  });

  it('includes EP reference when provided', () => {
    const score = scoreSignificance({
      title: 'Test',
      parliamentarySignificance: 5,
      policyImpact: 5,
      publicInterest: 5,
      temporalUrgency: 5,
      institutionalRelevance: 5,
    });
    const md = formatScoreMarkdown(score, 'Test', 'P9_TA(2026)001');
    expect(md).toContain('P9_TA(2026)001');
  });

  it('shows correct decision labels', () => {
    const publishScore = scoreSignificance({
      title: 'P',
      parliamentarySignificance: 8,
      policyImpact: 8,
      publicInterest: 8,
      temporalUrgency: 8,
      institutionalRelevance: 8,
    });
    expect(formatScoreMarkdown(publishScore, 'P')).toContain('Publish');

    const skipScore = scoreSignificance({
      title: 'S',
      parliamentarySignificance: 1,
      policyImpact: 1,
      publicInterest: 1,
      temporalUrgency: 1,
      institutionalRelevance: 1,
    });
    expect(formatScoreMarkdown(skipScore, 'S')).toContain('Skip');
  });

  it('sanitizes pipe and HTML characters in title and reference', () => {
    const score = scoreSignificance({
      title: 'Event | with <b>HTML</b>',
      parliamentarySignificance: 5,
      policyImpact: 5,
      publicInterest: 5,
      temporalUrgency: 5,
      institutionalRelevance: 5,
    });
    const md = formatScoreMarkdown(score, 'Event | with <b>HTML</b>', 'REF|001');
    expect(md).toContain('Event \\| with &lt;b&gt;HTML&lt;/b&gt;');
    expect(md).toContain('REF\\|001');
  });

  it('omits EP Reference row for empty-string reference', () => {
    const score = scoreSignificance({
      title: 'Test',
      parliamentarySignificance: 5,
      policyImpact: 5,
      publicInterest: 5,
      temporalUrgency: 5,
      institutionalRelevance: 5,
    });
    const md = formatScoreMarkdown(score, 'Test', '');
    expect(md).not.toContain('EP Reference');
  });
});

// ─── formatBatchMarkdown ─────────────────────────────────────────────────────

describe('formatBatchMarkdown', () => {
  it('produces a table with header and rows', () => {
    const inputs = [
      {
        title: 'Event A',
        reference: 'REF-001',
        parliamentarySignificance: 5,
        policyImpact: 5,
        publicInterest: 5,
        temporalUrgency: 5,
        institutionalRelevance: 5,
      },
    ];
    const scores = inputs.map((i) => scoreSignificance(i));
    const md = formatBatchMarkdown(inputs, scores);
    expect(md).toContain('Event A');
    expect(md).toContain('REF-001');
    expect(md).toContain('**Composite**');
  });

  it('uses dash for missing references', () => {
    const inputs = [
      {
        title: 'No Ref',
        parliamentarySignificance: 3,
        policyImpact: 3,
        publicInterest: 3,
        temporalUrgency: 3,
        institutionalRelevance: 3,
      },
    ];
    const scores = inputs.map((i) => scoreSignificance(i));
    const md = formatBatchMarkdown(inputs, scores);
    expect(md).toContain('—');
  });

  it('uses dash for empty-string references', () => {
    const inputs = [
      {
        title: 'Empty Ref',
        reference: '',
        parliamentarySignificance: 3,
        policyImpact: 3,
        publicInterest: 3,
        temporalUrgency: 3,
        institutionalRelevance: 3,
      },
    ];
    const scores = inputs.map((i) => scoreSignificance(i));
    const md = formatBatchMarkdown(inputs, scores);
    expect(md).toContain('—');
  });

  it('uses dash for whitespace-only references', () => {
    const inputs = [
      {
        title: 'Whitespace Ref',
        reference: '   ',
        parliamentarySignificance: 3,
        policyImpact: 3,
        publicInterest: 3,
        temporalUrgency: 3,
        institutionalRelevance: 3,
      },
    ];
    const scores = inputs.map((i) => scoreSignificance(i));
    const md = formatBatchMarkdown(inputs, scores);
    expect(md).toContain('—');
  });

  it('escapes pipe characters in titles and references', () => {
    const inputs = [
      {
        title: 'Event | with pipe',
        reference: 'REF|001',
        parliamentarySignificance: 5,
        policyImpact: 5,
        publicInterest: 5,
        temporalUrgency: 5,
        institutionalRelevance: 5,
      },
    ];
    const scores = inputs.map((i) => scoreSignificance(i));
    const md = formatBatchMarkdown(inputs, scores);
    expect(md).toContain('Event \\| with pipe');
    expect(md).toContain('REF\\|001');
  });

  it('escapes HTML entities in titles', () => {
    const inputs = [
      {
        title: 'Event <script>alert("xss")</script>',
        parliamentarySignificance: 5,
        policyImpact: 5,
        publicInterest: 5,
        temporalUrgency: 5,
        institutionalRelevance: 5,
      },
    ];
    const scores = inputs.map((i) => scoreSignificance(i));
    const md = formatBatchMarkdown(inputs, scores);
    expect(md).toContain('&lt;script&gt;');
  });

  it('throws when inputs and scores arrays have different lengths', () => {
    const inputs = [
      {
        title: 'Event A',
        parliamentarySignificance: 5,
        policyImpact: 5,
        publicInterest: 5,
        temporalUrgency: 5,
        institutionalRelevance: 5,
      },
      {
        title: 'Event B',
        parliamentarySignificance: 3,
        policyImpact: 3,
        publicInterest: 3,
        temporalUrgency: 3,
        institutionalRelevance: 3,
      },
    ];
    const scores = [scoreSignificance(inputs[0])];
    expect(() => formatBatchMarkdown(inputs, scores)).toThrow(
      'inputs.length (2) !== scores.length (1)'
    );
  });
});

// ─── Tests for new comparative & trend scoring functions ──────────────────────

import {
  computeComparativeSignificance,
  detectSignificanceTrend,
  computeNoveltyBonus,
} from '../../scripts/utils/significance-scoring.js';

describe('computeComparativeSignificance', () => {
  const makeScore = (composite) => ({
    parliamentarySignificance: 5,
    policyImpact: 5,
    publicInterest: 5,
    temporalUrgency: 5,
    institutionalRelevance: 5,
    composite,
    decision: 'publish',
  });

  it('should rank a single item as rank 1 with percentile 100', () => {
    const target = makeScore(7.0);
    const result = computeComparativeSignificance(target, [target]);
    expect(result.rank).toBe(1);
    expect(result.total).toBe(1);
    expect(result.percentile).toBe(100);
  });

  it('should return rank 1 for the highest composite score', () => {
    const target = makeScore(9.0);
    const peers = [makeScore(9.0), makeScore(6.0), makeScore(3.0)];
    const result = computeComparativeSignificance(target, peers);
    expect(result.rank).toBe(1);
    expect(result.aboveAverage).toBe(true);
  });

  it('should return correct peer average', () => {
    const target = makeScore(5.0);
    const peers = [makeScore(5.0), makeScore(3.0), makeScore(7.0)];
    const result = computeComparativeSignificance(target, peers);
    expect(result.peerAverage).toBe(5.0);
  });

  it('should handle empty peers array', () => {
    const target = makeScore(5.0);
    const result = computeComparativeSignificance(target, []);
    expect(result.rank).toBe(1);
    expect(result.total).toBe(1);
  });

  it('should compute aboveAverage correctly when below average', () => {
    const target = makeScore(2.0);
    const peers = [makeScore(2.0), makeScore(8.0), makeScore(8.0)];
    const result = computeComparativeSignificance(target, peers);
    expect(result.aboveAverage).toBe(false);
  });
});

describe('detectSignificanceTrend', () => {
  it('should return stable with low confidence for empty array', () => {
    const result = detectSignificanceTrend([]);
    expect(result.direction).toBe('stable');
    expect(result.confidence).toBe('low');
    expect(result.dataPoints).toBe(0);
  });

  it('should return stable with low confidence for single item', () => {
    const result = detectSignificanceTrend([5.0]);
    expect(result.direction).toBe('stable');
    expect(result.confidence).toBe('low');
    expect(result.dataPoints).toBe(1);
  });

  it('should detect increasing trend', () => {
    const result = detectSignificanceTrend([1.0, 2.0, 3.0, 4.0, 5.0]);
    expect(result.direction).toBe('increasing');
    expect(result.averageChange).toBeGreaterThan(0);
    expect(result.confidence).toBe('high');
  });

  it('should detect decreasing trend', () => {
    const result = detectSignificanceTrend([5.0, 4.0, 3.0, 2.0, 1.0]);
    expect(result.direction).toBe('decreasing');
    expect(result.averageChange).toBeLessThan(0);
  });

  it('should detect stable trend for flat scores', () => {
    const result = detectSignificanceTrend([5.0, 5.0, 5.0]);
    expect(result.direction).toBe('stable');
    expect(result.averageChange).toBe(0);
    expect(result.confidence).toBe('medium');
  });

  it('should assign medium confidence for 3-4 data points', () => {
    const result = detectSignificanceTrend([1, 2, 3]);
    expect(result.confidence).toBe('medium');
  });
});

describe('computeNoveltyBonus', () => {
  it('should return 5 for a novel item', () => {
    const seen = new Set(['item-a', 'item-b']);
    expect(computeNoveltyBonus('item-c', seen)).toBe(5);
  });

  it('should return 0 for a previously seen item', () => {
    const seen = new Set(['item-a', 'item-b']);
    expect(computeNoveltyBonus('item-a', seen)).toBe(0);
  });

  it('should return 5 when the seen set is empty', () => {
    expect(computeNoveltyBonus('item-a', new Set())).toBe(5);
  });
});
