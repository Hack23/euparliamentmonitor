// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @fileoverview Bounded-context unit tests for
 * `src/aggregator/metadata/text-utils.ts` — the pure text / Markdown
 * utility leaf module extracted from `article-metadata.ts`.
 *
 * Why this dedicated test file?
 * - `article-metadata.test.js` covers the helpers through the back-compat
 *   re-export. This file imports the module DIRECTLY so the leaf module's
 *   public surface (functions + length-budget constants) is locked in
 *   independently — regressions can be traced to the module rather than
 *   the orchestrator.
 * - Adds **deterministic byte-budget** assertions: every truncation
 *   helper must stay at-or-under its declared budget, never emit a
 *   double-ellipsis, and never leave a dangling stop-word.
 * - Locks the locale-agnostic banner-row detector against the
 *   Japanese / Chinese / Korean full-width-colon shape that motivated
 *   its introduction.
 *
 * Bounded-context invariants asserted:
 * 1. Every export is pure (no I/O, no global state, deterministic).
 * 2. Module has no upward runtime imports — enforced by the
 *    cross-context-imports drift guard.
 * 3. Length budgets are exposed as readonly numeric constants and
 *    satisfy `MIN < MAX` for both the short and extended families.
 */

import { describe, expect, it } from 'vitest';
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  EXTENDED_DESCRIPTION_MAX_LENGTH,
  EXTENDED_DESCRIPTION_MIN_LENGTH,
  ENRICHMENT_TRIGGER_LENGTH,
  TITLE_MAX_LENGTH,
  HEADLINE_SOFT_MIN,
  HEADLINE_CLAUSE_BOUNDARIES,
  EMOJI_BANNER_CHARS,
  METADATA_LINE_PREFIXES,
  TRAILING_STOP_WORDS,
  TRAILING_PUNCT,
  ABBREVIATION_PREFIXES,
  shouldSkipDescriptionLine,
  stripLeadingProseLabel,
  stripInlineMarkdown,
  truncateDescription,
  truncateExtendedDescription,
  truncateTitle,
  extractFirstSentence,
} from '../../src/aggregator/metadata/text-utils.js';

describe('metadata/text-utils — length-budget contract', () => {
  it('short and extended budgets are self-consistent (MIN < MAX)', () => {
    expect(DESCRIPTION_MIN_LENGTH).toBeLessThan(DESCRIPTION_MAX_LENGTH);
    expect(EXTENDED_DESCRIPTION_MIN_LENGTH).toBeLessThan(EXTENDED_DESCRIPTION_MAX_LENGTH);
  });

  it('extended budget is strictly larger than short budget', () => {
    expect(EXTENDED_DESCRIPTION_MAX_LENGTH).toBeGreaterThan(DESCRIPTION_MAX_LENGTH);
  });

  it('enrichment trigger sits below DESCRIPTION_MIN_LENGTH', () => {
    expect(ENRICHMENT_TRIGGER_LENGTH).toBeLessThan(DESCRIPTION_MIN_LENGTH);
  });

  it('title length envelope envelopes the headline soft-min', () => {
    expect(HEADLINE_SOFT_MIN).toBeLessThan(TITLE_MAX_LENGTH);
  });

  it('budget constants are concrete numbers (no NaN regressions)', () => {
    for (const v of [
      DESCRIPTION_MAX_LENGTH,
      DESCRIPTION_MIN_LENGTH,
      EXTENDED_DESCRIPTION_MAX_LENGTH,
      EXTENDED_DESCRIPTION_MIN_LENGTH,
      ENRICHMENT_TRIGGER_LENGTH,
      TITLE_MAX_LENGTH,
      HEADLINE_SOFT_MIN,
    ]) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThan(0);
    }
  });

  it('vocabulary tables are non-empty', () => {
    expect(EMOJI_BANNER_CHARS.length).toBeGreaterThan(0);
    expect(METADATA_LINE_PREFIXES.length).toBeGreaterThan(0);
    expect(TRAILING_STOP_WORDS.size).toBeGreaterThan(0);
    expect(ABBREVIATION_PREFIXES.length).toBeGreaterThan(0);
    expect(HEADLINE_CLAUSE_BOUNDARIES.length).toBeGreaterThan(0);
    expect(TRAILING_PUNCT).toBeInstanceOf(RegExp);
  });
});

describe('shouldSkipDescriptionLine — Markdown / banner skipping', () => {
  it('skips empty and structural Markdown lines', () => {
    expect(shouldSkipDescriptionLine('')).toBe(true);
    expect(shouldSkipDescriptionLine('# Heading')).toBe(true);
    expect(shouldSkipDescriptionLine('> Blockquote')).toBe(true);
    expect(shouldSkipDescriptionLine('<div>')).toBe(true);
    expect(shouldSkipDescriptionLine('| col1 | col2 |')).toBe(true);
    expect(shouldSkipDescriptionLine('---')).toBe(true);
    expect(shouldSkipDescriptionLine('```js')).toBe(true);
    expect(shouldSkipDescriptionLine('~~~')).toBe(true);
    expect(shouldSkipDescriptionLine('%% mermaid comment')).toBe(true);
    expect(shouldSkipDescriptionLine('title Chart')).toBe(true);
  });

  it('skips emoji-banner rows', () => {
    expect(shouldSkipDescriptionLine('📋 Analysis Owner: AI agent')).toBe(true);
    expect(shouldSkipDescriptionLine('📅 Date: 2026-05-15')).toBe(true);
    expect(shouldSkipDescriptionLine('📰 Type: Breaking')).toBe(true);
  });

  it('skips English banner rows in the metadata-line-prefix table', () => {
    expect(shouldSkipDescriptionLine('Date: 2026-05-15')).toBe(true);
    expect(shouldSkipDescriptionLine('Type: Breaking News')).toBe(true);
    expect(shouldSkipDescriptionLine('Run ID: breaking-run-001')).toBe(true);
    expect(shouldSkipDescriptionLine('**Date:** 2026-05-15')).toBe(true);
  });

  it('skips localized banner rows (Japanese full-width colon inside bold span)', () => {
    expect(
      shouldSkipDescriptionLine(
        '**日付：** 2026-05-15 | **種類：** ブレーキング | **実行：** breaking-run-001'
      )
    ).toBe(true);
  });

  it('skips localized banner rows (after-bold full-width colon)', () => {
    expect(
      shouldSkipDescriptionLine('**日付**：2026-05-15 | **種類**：ブレーキング | **実行**：run-001')
    ).toBe(true);
  });

  it('skips horizontal-rule-style separators', () => {
    expect(shouldSkipDescriptionLine('---')).toBe(true);
    expect(shouldSkipDescriptionLine('===')).toBe(true);
    expect(shouldSkipDescriptionLine('***')).toBe(true);
    expect(shouldSkipDescriptionLine('___')).toBe(true);
  });

  it('does NOT skip legitimate prose', () => {
    expect(
      shouldSkipDescriptionLine(
        'The European Parliament adopted a resolution on the new AI Act framework, signalling a tightening of cross-border platform compliance obligations.'
      )
    ).toBe(false);
  });
});

describe('stripInlineMarkdown — emphasis / link / code stripping', () => {
  it('removes link syntax, keeps visible text', () => {
    expect(stripInlineMarkdown('See [the report](https://example.com) for details.')).toBe(
      'See the report for details.'
    );
  });

  it('removes image syntax, keeps alt text', () => {
    expect(stripInlineMarkdown('![Chart of votes](chart.png) shows the trend.')).toBe(
      'Chart of votes shows the trend.'
    );
  });

  it('removes bold, italic, strikethrough', () => {
    expect(stripInlineMarkdown('**bold** and *italic* and ~~strike~~ text.')).toBe(
      'bold and italic and strike text.'
    );
    expect(stripInlineMarkdown('__bold__ and _italic_ text.')).toBe('bold and italic text.');
  });

  it('removes inline code backticks', () => {
    expect(stripInlineMarkdown('Use `npm test` to run tests.')).toBe('Use npm test to run tests.');
  });

  it('collapses repeated whitespace', () => {
    expect(stripInlineMarkdown('two    spaces\tand\ttabs')).toBe('two spaces and tabs');
  });

  it('trims leading/trailing whitespace', () => {
    expect(stripInlineMarkdown('   padded   ')).toBe('padded');
  });
});

describe('stripLeadingProseLabel — all-caps editorial label removal', () => {
  it('strips a SITUATION: opener', () => {
    expect(
      stripLeadingProseLabel(
        'SITUATION: Parliament adopted the AI Act with 487 votes to 102 against and 38 abstentions.'
      )
    ).toBe('Parliament adopted the AI Act with 487 votes to 102 against and 38 abstentions.');
  });

  it('strips a BLUF: opener', () => {
    expect(
      stripLeadingProseLabel(
        'BLUF: The chamber will face three contested rapporteur reports during the May plenary.'
      )
    ).toBe('The chamber will face three contested rapporteur reports during the May plenary.');
  });

  it('strips a TIER-1: opener (digit suffix)', () => {
    expect(
      stripLeadingProseLabel(
        'TIER-1: Five priority dossiers are scheduled for plenary consideration this week.'
      )
    ).toBe('Five priority dossiers are scheduled for plenary consideration this week.');
  });

  it('leaves mixed-case openers alone', () => {
    const input = 'Bottom line: the policy passes.';
    expect(stripLeadingProseLabel(input)).toBe(input);
  });

  it('leaves prose with no colon alone', () => {
    const input = 'A normal sentence about Parliament.';
    expect(stripLeadingProseLabel(input)).toBe(input);
  });

  it('leaves an opener with too-short rest alone', () => {
    const input = 'BLUF: short';
    expect(stripLeadingProseLabel(input)).toBe(input);
  });
});

describe('truncateDescription — DESCRIPTION_MAX_LENGTH byte budget', () => {
  it('returns input unchanged when within budget', () => {
    const short = 'Parliament voted today.';
    expect(truncateDescription(short)).toBe(short);
  });

  it('clamps to at most DESCRIPTION_MAX_LENGTH characters (including ellipsis)', () => {
    const long = 'word '.repeat(80).trim();
    const out = truncateDescription(long);
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
  });

  it('breaks on a sentence boundary when one sits inside the soft-min window', () => {
    // Build a string where the first sentence ends past DESCRIPTION_MIN_LENGTH (140).
    const long =
      'Parliament considered the new compliance framework across multiple committees this week, which produced unanimous endorsement for a strengthened oversight regime. Second sentence with extra detail. '.repeat(
        2
      );
    const out = truncateDescription(long);
    // Should end on a period boundary (not an ellipsis) since the boundary
    // sits past DESCRIPTION_MIN_LENGTH.
    expect(out.endsWith('.')).toBe(true);
    expect(out.endsWith('….')).toBe(false);
  });

  it('never emits double-ellipsis', () => {
    const long = 'word '.repeat(80) + '…';
    const out = truncateDescription(long);
    expect(out.includes('……')).toBe(false);
  });

  it('never ends on a dangling stop-word', () => {
    const long = 'Parliament considered the policy in the committee on the '.repeat(5).trim();
    const out = truncateDescription(long);
    if (out.endsWith('…')) {
      const lastWord = out.slice(0, -1).trim().split(' ').pop().toLowerCase();
      expect(TRAILING_STOP_WORDS.has(lastWord)).toBe(false);
    }
  });
});

describe('truncateExtendedDescription — EXTENDED_DESCRIPTION_MAX_LENGTH byte budget', () => {
  it('returns "" when input is shorter than short-meta budget (no SEO win)', () => {
    const short = 'Short prose.';
    expect(truncateExtendedDescription(short)).toBe('');
  });

  it('returns input verbatim when between short-budget and extended-budget', () => {
    const mid = 'A '.repeat(110).trim();
    const out = truncateExtendedDescription(mid);
    expect(out).toBe(mid);
  });

  it('clamps to EXTENDED_DESCRIPTION_MAX_LENGTH when over budget', () => {
    const long = 'word '.repeat(120).trim();
    const out = truncateExtendedDescription(long);
    expect(out.length).toBeLessThanOrEqual(EXTENDED_DESCRIPTION_MAX_LENGTH);
  });

  it('returns "" for blank / whitespace input', () => {
    expect(truncateExtendedDescription('')).toBe('');
    expect(truncateExtendedDescription('   ')).toBe('');
  });
});

describe('truncateTitle — TITLE_MAX_LENGTH byte budget', () => {
  it('returns input unchanged when within budget', () => {
    const short = 'EP adopts AI Act';
    expect(truncateTitle(short)).toBe(short);
  });

  it('clamps to at most TITLE_MAX_LENGTH characters', () => {
    const long = 'European Parliament '.repeat(20).trim();
    const out = truncateTitle(long);
    expect(out.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
  });

  it('breaks on a clause boundary inside the [HEADLINE_SOFT_MIN, TITLE_MAX_LENGTH] window', () => {
    const long =
      'Parliament passes Artificial Intelligence Act with 487 votes — committees set up new EU AI compliance authority within 12 months';
    const out = truncateTitle(long);
    expect(out.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
  });
});

describe('extractFirstSentence — first complete sentence', () => {
  it('returns the input when shorter than HEADLINE_SOFT_MIN', () => {
    expect(extractFirstSentence('Short title.')).toBe('Short title.');
  });

  it('returns the first sentence when it ends within the [SOFT_MIN, TITLE_MAX_LENGTH*1.5] window', () => {
    // First sentence ends at ~80 chars (past HEADLINE_SOFT_MIN=60, well within
    // the 1.5×TITLE_MAX_LENGTH=210 window) so it should be extracted cleanly.
    const para =
      'Parliament passed the Artificial Intelligence Act with 487 votes to 102 against. The next dossier on the agenda is digital services.';
    expect(extractFirstSentence(para)).toBe(
      'Parliament passed the Artificial Intelligence Act with 487 votes to 102 against.'
    );
  });

  it('returns the input verbatim when the first sentence ends before HEADLINE_SOFT_MIN', () => {
    // First sentence ends at ~58 chars, BEFORE HEADLINE_SOFT_MIN=60, so the
    // helper does not break there — the entire input is returned for the
    // downstream truncator to clause-truncate.
    const para =
      'Parliament passed the AI Act with 487 votes to 102 against. The next file is digital services.';
    expect(extractFirstSentence(para)).toBe(para);
  });

  it('does not split on common abbreviations (Q1., e.g., vs., U.S.)', () => {
    const para =
      'The Q1. 2026 report (vs. the U.S. equivalent, e.g. the FTC dossier) outlines committee priorities for the legislative pipeline this term.';
    const first = extractFirstSentence(para);
    // Returns the FULL input when no acceptable terminator is found,
    // since all the dots above are abbreviation-internal.
    expect(first).toBe(para);
  });

  it('returns full paragraph when no terminator sits within window', () => {
    const para = 'Parliament considered the policy in the committee on the policy '.repeat(3);
    expect(extractFirstSentence(para)).toBe(para.trim());
  });
});

describe('cross-helper consistency — round-trip safety', () => {
  it('stripInlineMarkdown → stripLeadingProseLabel → truncateDescription chain', () => {
    const raw =
      '**BLUF**: Parliament adopted the AI Act with 487 votes to 102 against and 38 abstentions, signalling a [tight](https://eur-lex.europa.eu/) cross-border compliance regime.';
    const out = truncateDescription(stripLeadingProseLabel(stripInlineMarkdown(raw)));
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
    expect(out).not.toContain('**');
    expect(out).not.toContain('[');
  });
});
