// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the AI-First fallback-template leak detector exposed by
 * `src/utils/validate-analysis-completeness.ts`.
 *
 * These tests exercise the pure scan functions directly (importing the
 * compiled module) without spawning the CLI.  They close the regression
 * documented in the Analysis-to-Article Data Contract
 * (`.github/prompts/SHARED_PROMPT_PATTERNS.md`): any article shipped with
 * script-generated stakeholder template text or unfilled `AI_MARKER`
 * sentinels must fail validation.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  scanHtmlForFallbackLeaks,
  scanArticleHtmlFiles,
  FALLBACK_TEMPLATE_PATTERNS,
} from '../../scripts/utils/validate-analysis-completeness.js';

describe('scanHtmlForFallbackLeaks', () => {
  it('returns an empty array for clean HTML', () => {
    const html =
      '<section><h2>Stakeholder Perspectives</h2>' +
      '<p>The European Commission receives an unusually concentrated mandate ' +
      'convergence across five DGs simultaneously, forcing DG TRADE, DG GROW, ' +
      'DG EMPL/REGIO and DG NEAR to act in parallel.</p></section>';
    expect(scanHtmlForFallbackLeaks(html)).toEqual([]);
  });

  it('detects the AI_MARKER sentinel', () => {
    const leaks = scanHtmlForFallbackLeaks('<p>alt=[AI_ANALYSIS_REQUIRED]</p>');
    expect(leaks.length).toBeGreaterThanOrEqual(1);
    expect(leaks[0].match).toContain('[AI_ANALYSIS_REQUIRED]');
    expect(leaks[0].offset).toBeGreaterThan(0);
  });

  it('detects the motions-run46 "voting period …" stakeholder leak', () => {
    const bad =
      '<p>This parliamentary activity on "voting period 2026-03-21–2026-04-20" ' +
      'has moderate implications for political group dynamics, affecting ' +
      'coalition-building strategies.</p>';
    const leaks = scanHtmlForFallbackLeaks(bad);
    // Should match BOTH the stakeholder sentence AND the date-range topic.
    expect(leaks.length).toBeGreaterThanOrEqual(2);
  });

  it('detects all six canonical stakeholder sentence fallbacks', () => {
    const cases = [
      'This parliamentary activity on "X" has significant implications for political group dynamics, affecting coalition-building',
      'Civil society organisations monitoring "X" face moderate impact on transparency, democratic participation',
      'Industry and business stakeholders observe limited regulatory implications from "X"',
      'National governments assess moderate impact from "X" on subsidiarity',
      'EU citizens experience significant consequences from "X"',
      'EU institutional dynamics show limited effects from "X"',
    ];
    for (const c of cases) {
      expect(scanHtmlForFallbackLeaks(c).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('detects the default-branch "Stakeholder impact assessment for ..." fallback', () => {
    const bad = 'Stakeholder impact assessment for "motion 42" indicates moderate relevance.';
    expect(scanHtmlForFallbackLeaks(bad).length).toBeGreaterThanOrEqual(1);
  });

  it('detects the Voting outcomes date-range matrix action label', () => {
    const leaks = scanHtmlForFallbackLeaks(
      '<h3>Voting outcomes 2026-03-21–2026-04-20</h3>'
    );
    expect(leaks.length).toBeGreaterThan(0);
    expect(leaks[0].match).toContain('2026-03-21');
  });

  it('detects the EP activity date-only topic fallback', () => {
    const leaks = scanHtmlForFallbackLeaks(
      '<p>Analysis topic: EP activity 2026-04-20</p>'
    );
    expect(leaks.length).toBeGreaterThan(0);
  });

  it('detects the EP breaking news date label fallback', () => {
    const leaks = scanHtmlForFallbackLeaks('EP breaking news 2026-04-20');
    expect(leaks.length).toBeGreaterThan(0);
  });

  it('does not match legitimate mentions of "voting period" without a date range', () => {
    const good =
      'During the voting period, EPP rapporteurs negotiated with S&D shadow rapporteurs to …';
    expect(scanHtmlForFallbackLeaks(good)).toEqual([]);
  });

  it('reports offset so operators can locate the leak', () => {
    const html = 'prefix prefix prefix [AI_ANALYSIS_REQUIRED] suffix';
    const [leak] = scanHtmlForFallbackLeaks(html);
    expect(leak).toBeDefined();
    expect(leak.offset).toBe(html.indexOf('[AI_ANALYSIS_REQUIRED]'));
  });

  it('detects multiple occurrences of the same pattern', () => {
    const html = '[AI_ANALYSIS_REQUIRED] then [AI_ANALYSIS_REQUIRED] again';
    const leaks = scanHtmlForFallbackLeaks(html).filter(
      (l) => l.match.includes('AI_ANALYSIS_REQUIRED')
    );
    expect(leaks.length).toBe(2);
  });

  it('exposes at least one pattern per documented fallback category', () => {
    // Sanity check — if this constant drops below the canonical floor,
    // fallback-category coverage has regressed.
    expect(FALLBACK_TEMPLATE_PATTERNS.length).toBeGreaterThanOrEqual(12);
  });
});

describe('scanArticleHtmlFiles', () => {
  it('reports missing files as synthetic leaks', () => {
    const map = scanArticleHtmlFiles(['/tmp/definitely-nonexistent-' + Date.now() + '.html']);
    expect(map.size).toBe(1);
    const [[, leaks]] = Array.from(map.entries());
    expect(leaks.length).toBe(1);
    expect(leaks[0].match).toMatch(/File not found/);
  });

  it('scans a real HTML file on disk', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-html-'));
    try {
      const goodPath = path.join(tmp, 'good.html');
      const badPath = path.join(tmp, 'bad.html');
      fs.writeFileSync(
        goodPath,
        '<article><h1>Good</h1><p>Commission DG TRADE filed the text.</p></article>',
        'utf-8'
      );
      fs.writeFileSync(
        badPath,
        '<article><p>This parliamentary activity on "voting period 2026-03-21–2026-04-20" has moderate implications for political group dynamics</p></article>',
        'utf-8'
      );
      const map = scanArticleHtmlFiles([goodPath, badPath]);
      expect(map.get(goodPath)).toEqual([]);
      expect((map.get(badPath) ?? []).length).toBeGreaterThan(0);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('preserves input path ordering as map keys', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-html-'));
    try {
      const a = path.join(tmp, 'a.html');
      const b = path.join(tmp, 'b.html');
      fs.writeFileSync(a, '<p>clean</p>', 'utf-8');
      fs.writeFileSync(b, '<p>clean</p>', 'utf-8');
      const keys = Array.from(scanArticleHtmlFiles([b, a]).keys());
      expect(keys).toEqual([b, a]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
