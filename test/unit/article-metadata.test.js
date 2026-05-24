// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/article-metadata — priority ladder,
 * leak-filter tightening, and template fallbacks across the 14 supported
 * languages.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import os from 'os';
import { tmpdir } from 'os';
import path from 'path';
import {
  buildTemplateFallback,
  deriveMonthLabel,
  deriveReportingWindowForWeekInReview,
  deriveWeekRange,
  extractArtifactHighlight,
  extractFirstH1,
  extractFirstSentence,
  extractLedeAfterHeading,
  extractPriorityFindingHighlight,
  extractStrongProseLine,
  humanizeSlug,
  isArtifactCategoryHeading,
  isGenericHeading,
  isTranslatedSiblingBrief,
  resolveArticleMetadata,
  shouldSkipDescriptionLine,
  stripArtifactCategoryAffix,
  stripInlineMarkdown,
  stripLeadingProseLabel,
  truncateDescription,
  truncateTitle,
} from '../../scripts/aggregator/article-metadata.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

describe('shouldSkipDescriptionLine — tightened leak filter', () => {
  it('still rejects the original structural openers', () => {
    expect(shouldSkipDescriptionLine('# heading')).toBe(true);
    expect(shouldSkipDescriptionLine('> blockquote')).toBe(true);
    expect(shouldSkipDescriptionLine('<!-- comment -->')).toBe(true);
    expect(shouldSkipDescriptionLine('| col | col |')).toBe(true);
  });

  it('rejects mermaid %%{init blocks and `title` directives', () => {
    expect(shouldSkipDescriptionLine('%%{init: {"theme":"dark"}}%%')).toBe(true);
    expect(shouldSkipDescriptionLine('title Political Significance Assessment')).toBe(true);
  });

  it('rejects emoji-prefixed metadata banners', () => {
    expect(
      shouldSkipDescriptionLine(
        '📋 Analysis Owner: EU Parliament Monitor | 📅 Generated: 2026-04-01'
      )
    ).toBe(true);
    expect(shouldSkipDescriptionLine('🏛 Parliamentary Term: EP10')).toBe(true);
    expect(shouldSkipDescriptionLine('📊 Confidence: High')).toBe(true);
  });

  it('rejects `Key: value` metadata rows regardless of bold/italic wrapping', () => {
    expect(shouldSkipDescriptionLine('Analysis Date: 2026-04-19 | Run: 187')).toBe(true);
    expect(shouldSkipDescriptionLine('**Analysis Date**: 2026-04-19')).toBe(true);
    expect(shouldSkipDescriptionLine('*Classification Date*: 2026-04-19')).toBe(true);
    expect(shouldSkipDescriptionLine('Window: Q1 2026')).toBe(true);
    expect(shouldSkipDescriptionLine('Series: EP10')).toBe(true);
    expect(shouldSkipDescriptionLine('Parliamentary Status: Active')).toBe(true);
  });

  it('rejects artefact preamble rows (Purpose, Reporting Window, Sources, …)', () => {
    expect(
      shouldSkipDescriptionLine(
        '**Purpose:** This artifact provides a coherent single-voice synthesis integrating all analysis streams.'
      )
    ).toBe(true);
    expect(shouldSkipDescriptionLine('**Reporting Window:** 3 April – 1 May 2026')).toBe(true);
    expect(shouldSkipDescriptionLine('Reporting Period: Q1 2026')).toBe(true);
    expect(shouldSkipDescriptionLine('Sources: EP Open Data Portal, IMF WEO')).toBe(true);
    expect(shouldSkipDescriptionLine('Source: European Parliament press service')).toBe(true);
    expect(shouldSkipDescriptionLine('Region: EU27')).toBe(true);
    expect(shouldSkipDescriptionLine('Topic: Digital Markets Act')).toBe(true);
  });

  it('rejects decorative separators', () => {
    expect(shouldSkipDescriptionLine('---')).toBe(true);
    expect(shouldSkipDescriptionLine('====')).toBe(true);
    expect(shouldSkipDescriptionLine('***')).toBe(true);
  });

  it('still accepts real prose lines', () => {
    expect(
      shouldSkipDescriptionLine(
        'The European Parliament this week closed the final gap in the banking union, adopting a landmark resolution.'
      )
    ).toBe(false);
  });
});

describe('stripInlineMarkdown', () => {
  it('removes link, emphasis, and inline-code syntax', () => {
    const input =
      '**Banking** Union _breakthrough_: a [landmark resolution](https://x/) with `inline code` and ~~struck~~.';
    const out = stripInlineMarkdown(input);
    expect(out).not.toMatch(/\*|_|`|~~|\[|\]\(/);
    expect(out).toContain('Banking');
    expect(out).toContain('landmark resolution');
  });

  it('preserves the visible text of images', () => {
    expect(stripInlineMarkdown('![alt text](img.png)')).toBe('alt text');
  });
});

describe('truncation helpers', () => {
  it('preserves short input', () => {
    expect(truncateDescription('short text')).toBe('short text');
    expect(truncateTitle('short title')).toBe('short title');
  });

  it('truncates on a word boundary when possible', () => {
    const long = `${'abc '.repeat(100)}`.trim();
    const truncated = truncateDescription(long);
    expect(truncated.length).toBeLessThanOrEqual(300);
    expect(truncated.endsWith('…')).toBe(true);
    expect(truncated).not.toMatch(/ab…$/); // no mid-word break
  });

  it('prefers the last sentence boundary and never emits a dangling determiner or double ellipsis', () => {
    // Reproduces the propositions/2026-05-12 description regression where
    // truncation left "…year. The……" — a dangling article followed by
    // two ellipsis glyphs.
    const prose =
      "Three landmark legislative measures reached final publication or adoption in the week of 5–12 May 2026, marking a pivotal moment in EP10's first full legislative year. The Anti-Corruption Directive entered into force on 11 May 2026.";
    const truncated = truncateDescription(prose);
    expect(truncated).not.toMatch(/……/);
    expect(truncated).not.toMatch(/\b(?:the|a|an|of|to|for|in|on|at|by|and|or|with|from)…$/i);
    expect(truncated).not.toMatch(/\b(?:the|a|an|of|to|for|in|on|at|by|and|or|with|from)$/i);
    // Cleanly clipped at the first sentence boundary, no trailing ellipsis.
    expect(truncated.endsWith('.')).toBe(true);
  });

  it('strips a pre-existing trailing ellipsis before appending its own', () => {
    // Guards against double-clip: if the input already carries an ellipsis
    // (e.g. from an upstream truncation), we must not emit "X……".
    const seeded = `${'word '.repeat(60).trim()}…`;
    const truncated = truncateDescription(seeded);
    expect(truncated).not.toMatch(/……/);
    expect(truncated.endsWith('…')).toBe(true);
  });
});

describe('extractFirstH1', () => {
  it('returns the first `# …` heading text, stripped of anchor syntax', () => {
    const md = [
      '<!-- header comment -->',
      '',
      '# Banking Union Breakthrough and Anti-Corruption Landmark',
      '',
      'Body text.',
      '',
      '## Another',
    ].join('\n');
    expect(extractFirstH1(md)).toBe('Banking Union Breakthrough and Anti-Corruption Landmark');
  });

  it('returns an empty string when no H1 exists', () => {
    expect(extractFirstH1('## only h2\n\nbody')).toBe('');
  });

  it('skips `##` and `###` lines', () => {
    expect(extractFirstH1('## sub\n### deeper\n# actual')).toBe('actual');
  });
});

describe('extractStrongProseLine', () => {
  it('returns the first prose paragraph, truncated', () => {
    const md = [
      '# Banking Union Breakthrough',
      '',
      '> Provenance note',
      '',
      '| col | col |',
      '| --- | --- |',
      '',
      'The European Parliament this week closed the final gap in the banking union with a landmark resolution that reshapes Europe anti-corruption framework for years to come.',
    ].join('\n');
    const desc = extractStrongProseLine(md);
    expect(desc).toContain('banking union');
    expect(desc.length).toBeLessThanOrEqual(300);
  });

  it('does NOT leak mermaid init blocks', () => {
    const md = [
      '# X',
      '',
      '%%{init: {"theme":"dark"}}%%',
      '',
      'The real prose paragraph that should win has substantial length and tells a story.',
    ].join('\n');
    const desc = extractStrongProseLine(md);
    expect(desc).not.toMatch(/init|theme/);
    expect(desc).toContain('real prose paragraph');
  });

  it('does NOT leak emoji-banner metadata rows', () => {
    const md = [
      '# X',
      '',
      '📋 Analysis Owner: EU Parliament Monitor | 📅 Generated: 2026-04-01 (UTC)',
      '',
      'The first real prose line carries substantive editorial content that could power a meta description.',
    ].join('\n');
    const desc = extractStrongProseLine(md);
    expect(desc).not.toMatch(/Analysis Owner|Generated/);
    expect(desc).toContain('editorial content');
  });

  it('does NOT leak `Analysis Date:` / `Run:` / `Window:` banners', () => {
    const md = [
      '# X',
      '',
      'Analysis Date: 2026-04-19 | Run: 187 | Series Run: breaking',
      '',
      'The first real prose line carries substantive editorial content about the plenary vote outcome.',
    ].join('\n');
    const desc = extractStrongProseLine(md);
    expect(desc).not.toMatch(/Analysis Date|Run: 187/);
    expect(desc).toContain('plenary vote outcome');
  });

  it('does NOT leak mermaid `title` directives', () => {
    const md = [
      '# X',
      '',
      'title Political Significance Assessment — 2026-04-10',
      '',
      'The first real prose line stays long enough to survive the 40-char minimum threshold.',
    ].join('\n');
    const desc = extractStrongProseLine(md);
    expect(desc).not.toMatch(/Political Significance Assessment/);
    expect(desc).toContain('real prose line');
  });

  it('skips mermaid fence bodies when extracting prose', () => {
    const md = [
      '# X',
      '',
      '```mermaid',
      'subgraph "📊 EP Political Intelligence Dashboard — 15 April 2026"',
      'A --> B',
      '```',
      '',
      'The first real prose line after the diagram explains the parliamentary significance in snippet-safe language.',
    ].join('\n');
    const desc = extractStrongProseLine(md);
    expect(desc).not.toMatch(/subgraph|Dashboard/);
    expect(desc).toContain('parliamentary significance');
  });

  it('returns empty when nothing qualifies', () => {
    expect(extractStrongProseLine('# only a heading')).toBe('');
  });

  it('joins consecutive hard-wrapped prose lines into a single description paragraph', () => {
    // Live-site regression (2026-05-16): briefs whose lede was hard-wrapped
    // at column ~95 returned only the first line (88 chars) from the
    // extractor, tripping the enrichment trigger and leaking the
    // "Published … · analysis run …" boilerplate into <meta description>.
    // The fix paragraph-joins consecutive non-blank, non-skip lines into
    // a single ≥140-char prose snippet.
    const md = [
      '# Executive Brief — EU Parliament Breaking News',
      '',
      "The European Parliament's April 2026 plenary session (Strasbourg, 28-30 April) delivered a",
      'dense legislative output spanning digital regulation enforcement, Ukraine war accountability,',
      'and fiscal governance activation through 2027 budget guidelines.',
      '',
      'A second paragraph that must NOT be joined into the first.',
    ].join('\n');
    const desc = extractStrongProseLine(md);
    expect(desc.length).toBeGreaterThanOrEqual(140);
    expect(desc).toContain('European Parliament');
    expect(desc).toContain('legislative output');
    expect(desc).not.toContain('second paragraph');
  });
});

describe('humanizeSlug', () => {
  it('title-cases and de-dashifies slugs', () => {
    expect(humanizeSlug('week-ahead')).toBe('Week Ahead');
    expect(humanizeSlug('breaking')).toBe('Breaking');
    expect(humanizeSlug('month_in_review')).toBe('Month In Review');
  });
});

describe('isGenericHeading', () => {
  it('rejects the default `${humanize(type)} — ${date}` form', () => {
    expect(isGenericHeading('Breaking — 2026-04-14', 'breaking', '2026-04-14')).toBe(true);
    expect(isGenericHeading('Week Ahead — 2026-04-14', 'week-ahead', '2026-04-14')).toBe(true);
  });

  it('rejects the legacy "EU Parliament <Type> — <date>" form', () => {
    expect(isGenericHeading('EU Parliament Breaking — 2026-04-14', 'breaking', '2026-04-14')).toBe(
      true
    );
  });

  it('rejects the collision-suffix "Breaking Breaking — <date>" form', () => {
    expect(isGenericHeading('Breaking Breaking — 2026-04-20', 'breaking', '2026-04-20')).toBe(true);
  });

  it('accepts any non-genuine-editorial headline', () => {
    expect(
      isGenericHeading(
        'Banking Union Breakthrough and Anti-Corruption Landmark',
        'breaking',
        '2026-04-14'
      )
    ).toBe(false);
    expect(
      isGenericHeading('Coalition Realignment After Plenary Vote', 'motions', '2026-04-20')
    ).toBe(false);
  });

  it('rejects artefact-category H1 prefixes (Synthesis Summary, Executive Brief, …)', () => {
    // These structural labels appear as the H1 of editorial artefacts but
    // must NOT leak into the article <title>.
    expect(
      isGenericHeading(
        'Synthesis Summary — EP10 Q1 2026 Motions & Resolutions',
        'motions',
        '2026-04-20'
      )
    ).toBe(true);
    expect(
      isGenericHeading(
        'Executive Brief — EU Parliament Week in Review',
        'week-in-review',
        '2026-05-09'
      )
    ).toBe(true);
    expect(isGenericHeading('Intelligence Briefing — 2026-04-20', 'breaking', '2026-04-20')).toBe(
      true
    );
    expect(
      isGenericHeading('Breaking News Analysis: Coalition Shift', 'breaking', '2026-04-20')
    ).toBe(true);
  });

  it('rejects empty headings', () => {
    expect(isGenericHeading('', 'breaking', '2026-04-14')).toBe(true);
  });

  it('rejects bare "EU Parliament <Type>" category-noun headings (post-PR-#1969 fix)', () => {
    // Live-site regression (https://euparliamentmonitor.com/news/) observed
    // 2026-05-16: executive briefs whose H1 reads
    //   `# Executive Brief — EU Parliament Breaking News`
    // had the `Executive Brief — ` prefix stripped, leaving the bare
    // category noun as the article `<title>`. Editorial content carries no
    // information when restated as the category name — flag these.
    expect(isGenericHeading('EU Parliament Breaking News', 'breaking', '2026-05-16')).toBe(true);
    expect(
      isGenericHeading('EU Parliament Committee Reports', 'committee-reports', '2026-05-15')
    ).toBe(true);
    expect(isGenericHeading('EU Parliament Motions', 'motions', '2026-05-15')).toBe(true);
    expect(isGenericHeading('EU Parliament Motions · 2026-05-15', 'motions', '2026-05-15')).toBe(
      true
    );
    expect(
      isGenericHeading('EU Parliament Legislative Propositions', 'propositions', '2026-05-15')
    ).toBe(true);
    expect(isGenericHeading('EU Parliament Election Cycle', 'election-cycle', '2026-05-14')).toBe(
      true
    );
    expect(isGenericHeading('EU Parliament Year Ahead', 'year-ahead', '2026-05-14')).toBe(true);
    expect(isGenericHeading('EU Parliament Week in Review', 'week-in-review', '2026-05-16')).toBe(
      true
    );
    expect(isGenericHeading('EP10 Election Cycle', 'election-cycle', '2026-05-13')).toBe(true);
    expect(isGenericHeading('EP Committee Reports', 'committee-reports', '2026-05-14')).toBe(true);
    expect(
      isGenericHeading('European Parliament Year in Review', 'year-in-review', '2026-05-14')
    ).toBe(true);
  });

  it('preserves date-range editorial headlines as non-generic', () => {
    // `EP Week Ahead: 19–22 May 2026` is editorial content — it specifies
    // the reporting window. Only *single-date* qualifiers (` · YYYY-MM-DD`,
    // `(May 2026)`) are stripped before the category-noun comparison.
    expect(isGenericHeading('EP Week Ahead: 19–22 May 2026', 'week-ahead', '2026-05-15')).toBe(
      false
    );
    expect(
      isGenericHeading(
        'EU Parliament Committee Activity, 6–13 May 2026',
        'committee-reports',
        '2026-05-13'
      )
    ).toBe(false);
    expect(
      isGenericHeading('Breaking News: EP April 2026 Plenary Outcomes', 'breaking', '2026-05-15')
    ).toBe(false);
  });

  it('rejects bare institutional self-references (Round 3 fix)', () => {
    // Live-site regression: executive briefs occasionally author the H1
    // as the publisher / institution name alone — `# EU Parliament`,
    // `# Hack23 AB`, `# Executive Brief`. These carry no editorial
    // information and would produce pathological `<title>EU Parliament`
    // strings if surfaced. Catch-all for the 14 known bare forms.
    expect(isGenericHeading('EU Parliament', 'breaking', '2026-05-16')).toBe(true);
    expect(isGenericHeading('European Parliament', 'committee-reports', '2026-05-15')).toBe(true);
    expect(isGenericHeading('The European Parliament', 'motions', '2026-05-15')).toBe(true);
    expect(isGenericHeading('EP', 'breaking', '2026-05-16')).toBe(true);
    expect(isGenericHeading('EP10', 'term-outlook', '2026-05-16')).toBe(true);
    expect(isGenericHeading('Hack23', 'breaking', '2026-05-16')).toBe(true);
    expect(isGenericHeading('Hack23 AB', 'breaking', '2026-05-16')).toBe(true);
    expect(isGenericHeading('Executive Brief', 'breaking', '2026-05-16')).toBe(true);
    expect(isGenericHeading('Intelligence Brief', 'breaking', '2026-05-16')).toBe(true);
    expect(isGenericHeading('Briefing', 'breaking', '2026-05-16')).toBe(true);
    // With trailing single-date qualifier — still rejected.
    expect(isGenericHeading('EU Parliament — 2026-05-15', 'breaking', '2026-05-15')).toBe(true);
    expect(isGenericHeading('Hack23 AB · 2026-05-15', 'breaking', '2026-05-15')).toBe(true);
    // BUT: institutional name + editorial qualifier IS editorial. The
    // `isBareInstitutionalHeading` gate is overridden by per-articleType
    // category-noun matching for slugged forms, and any trailing
    // editorial content escapes the bare set entirely.
    expect(
      isGenericHeading('EU Parliament Adopts AI Act Amendments', 'breaking', '2026-05-15')
    ).toBe(false);
    expect(
      isGenericHeading('European Parliament Plenary: April Outcomes', 'breaking', '2026-05-15')
    ).toBe(false);
  });
});

describe('extractFirstSentence (Round 3 fix)', () => {
  it('returns short paragraphs unchanged', () => {
    expect(extractFirstSentence('EP10 plenary held in Strasbourg.')).toBe(
      'EP10 plenary held in Strasbourg.'
    );
    expect(extractFirstSentence('')).toBe('');
  });

  it('extracts the first complete sentence past the soft-min', () => {
    // First sentence is past the 60-char soft-min and shorter than the
    // 140-char hard cap — return it as-is.
    const para =
      'The European Parliament adopted three landmark legislative texts in April. Coalitions held on AI Act amendments.';
    expect(extractFirstSentence(para)).toBe(
      'The European Parliament adopted three landmark legislative texts in April.'
    );
  });

  it('skips common abbreviations that contain a period', () => {
    // `e.g.` and `Q1.` must not terminate the sentence — search continues
    // to the real terminator.
    const para =
      'The Q1. plenary calendar (e.g. April 28–30) sets the legislative ceiling for the EP10 mid-term. Coalitions held.';
    expect(extractFirstSentence(para)).toBe(
      'The Q1. plenary calendar (e.g. April 28–30) sets the legislative ceiling for the EP10 mid-term.'
    );
  });

  it('skips all-caps single-letter initials (U.S., E.U.)', () => {
    const para =
      'The E.U. Council formally adopted the directive on 14 May 2026, marking a structural shift. Implementation begins.';
    expect(extractFirstSentence(para)).toBe(
      'The E.U. Council formally adopted the directive on 14 May 2026, marking a structural shift.'
    );
  });

  it('falls back to original paragraph when no terminator fits the window', () => {
    // No terminator in the 60-char→TITLE_MAX_LENGTH*1.5 window — return
    // the original so downstream truncateTitle can clause-break it cleanly.
    const para =
      'The European Parliament continues a sustained legislative cadence across the April 2026 Strasbourg plenary with coalition dynamics that show EPP-S&D consensus on banking-union files and a sharper split on AI Act amendments which will surface in May and June plenaries with regulatory tightening anticipated across digital and environmental policy clusters';
    const result = extractFirstSentence(para);
    expect(result).toBe(para);
  });

  it('produces grammatically complete titles when fed through truncateTitle', () => {
    const para =
      'The EP10 mid-term marks a structural shift in EU economic governance. Subsequent paragraphs cover banking union and AI Act details.';
    const sentence = extractFirstSentence(para);
    const title = truncateTitle(sentence);
    // No mid-clause ellipsis — title ends at a sentence boundary.
    expect(title.endsWith('…')).toBe(false);
    expect(title).toContain('EP10 mid-term');
  });
});

describe('deriveWeekRange / deriveMonthLabel', () => {
  it('returns the Mon–Sun week containing the supplied ISO date', () => {
    // 2026-04-24 is a Friday → week is 2026-04-20 (Mon) … 2026-04-26 (Sun)
    expect(deriveWeekRange('2026-04-24')).toEqual({ start: '2026-04-20', end: '2026-04-26' });
    // 2026-04-20 is a Monday → week starts that day
    expect(deriveWeekRange('2026-04-20')).toEqual({ start: '2026-04-20', end: '2026-04-26' });
    // 2026-04-26 is a Sunday → week still starts on 2026-04-20
    expect(deriveWeekRange('2026-04-26')).toEqual({ start: '2026-04-20', end: '2026-04-26' });
  });

  it('returns the raw date when parsing fails', () => {
    expect(deriveWeekRange('not-a-date')).toEqual({ start: 'not-a-date', end: 'not-a-date' });
  });

  it('labels the month with English name + year', () => {
    expect(deriveMonthLabel('2026-04-24')).toBe('April 2026');
    expect(deriveMonthLabel('2026-01-01')).toBe('January 2026');
  });
});

describe('deriveReportingWindowForWeekInReview — D-36 → D-8 window (ADR-006)', () => {
  const MS_PER_DAY = 86_400_000;

  it('returns start=D-36 and end=D-8 for a known date', () => {
    // 2026-04-26 - 36 days = 2026-03-21; 2026-04-26 - 8 days = 2026-04-18
    const result = deriveReportingWindowForWeekInReview('2026-04-26');
    expect(result).toEqual({ start: '2026-03-21', end: '2026-04-18' });
  });

  it('end is always 28 days after start', () => {
    const result = deriveReportingWindowForWeekInReview('2026-01-15');
    const startMs = new Date(`${result.start}T00:00:00Z`).getTime();
    const endMs = new Date(`${result.end}T00:00:00Z`).getTime();
    expect((endMs - startMs) / MS_PER_DAY).toBe(28);
  });

  it('end date is exactly 8 days before the supplied article date', () => {
    const articleDate = '2026-04-26';
    const { end } = deriveReportingWindowForWeekInReview(articleDate);
    const articleMs = new Date(`${articleDate}T00:00:00Z`).getTime();
    const endMs = new Date(`${end}T00:00:00Z`).getTime();
    expect((articleMs - endMs) / MS_PER_DAY).toBe(8);
  });

  it('returns the raw date for both start and end when parsing fails', () => {
    expect(deriveReportingWindowForWeekInReview('not-a-date')).toEqual({
      start: 'not-a-date',
      end: 'not-a-date',
    });
  });

  it('window end is strictly earlier than the article date (vote-lag safety)', () => {
    // Verifies the D-8 offset ensures no structurally vote-empty window
    const result = deriveReportingWindowForWeekInReview('2026-04-26');
    expect(result.end < '2026-04-26').toBe(true);
  });
});

describe('buildTemplateFallback — 14 langs × 8 types = last-resort coverage', () => {
  const types = [
    'breaking',
    'committee-reports',
    'motions',
    'propositions',
    'week-ahead',
    'month-ahead',
    'week-in-review',
    'month-in-review',
  ];

  for (const type of types) {
    it(`covers all 14 languages for type=${type}`, () => {
      const map = buildTemplateFallback(type, '2026-04-20', 'ENVI');
      for (const lang of ALL_LANGUAGES) {
        const entry = Object.getOwnPropertyDescriptor(map, lang)?.value;
        expect(entry).toBeDefined();
        expect(entry.title.length).toBeGreaterThan(5);
        expect(entry.subtitle.length).toBeGreaterThan(5);
      }
    });
  }

  it('yields non-English titles for non-English languages', () => {
    const map = buildTemplateFallback('breaking', '2026-04-20');
    const en = Object.getOwnPropertyDescriptor(map, 'en')?.value;
    const sv = Object.getOwnPropertyDescriptor(map, 'sv')?.value;
    const de = Object.getOwnPropertyDescriptor(map, 'de')?.value;
    expect(sv.title).not.toEqual(en.title);
    expect(de.title).not.toEqual(en.title);
    expect(sv.title).toMatch(/Senaste|Betydande/);
  });

  it('committee-reports uses the supplied committee code', () => {
    const map = buildTemplateFallback('committee-reports', '2026-04-20', 'ENVI');
    const en = Object.getOwnPropertyDescriptor(map, 'en')?.value;
    expect(en.title).toContain('ENVI');
  });

  it('unknown article types get a sensible humanised fallback', () => {
    const map = buildTemplateFallback('custom-type-x', '2026-04-20');
    const en = Object.getOwnPropertyDescriptor(map, 'en')?.value;
    expect(en.title).toContain('Custom Type X');
  });

  it('week-in-review title uses D-36→D-8 reporting window, not the calendar week', () => {
    // Article date 2026-04-26 → D-36 = 2026-03-21, D-8 = 2026-04-18
    // Calendar week of 2026-04-26 would be 2026-04-20 → 2026-04-26 (Mon–Sun)
    const map = buildTemplateFallback('week-in-review', '2026-04-26');
    const en = Object.getOwnPropertyDescriptor(map, 'en')?.value;
    expect(en.title).toContain('2026-03-21');
    expect(en.title).toContain('2026-04-18');
    // Must NOT show the calendar-week Monday
    expect(en.title).not.toContain('2026-04-20');
  });

  it('week-in-review English subtitle references last full reporting week', () => {
    const map = buildTemplateFallback('week-in-review', '2026-04-26');
    const en = Object.getOwnPropertyDescriptor(map, 'en')?.value;
    expect(en.subtitle).toMatch(/last full reporting week/i);
  });

  it('week-ahead title still uses the calendar week (not the reporting window)', () => {
    // Verifies week-ahead is unaffected by the week-in-review change
    const map = buildTemplateFallback('week-ahead', '2026-04-26');
    const en = Object.getOwnPropertyDescriptor(map, 'en')?.value;
    // Calendar week of 2026-04-26 (Sunday) is Mon 2026-04-20 → Sun 2026-04-26
    expect(en.title).toContain('2026-04-20');
    expect(en.title).toContain('2026-04-26');
  });
});

describe('resolveArticleMetadata — priority ladder', () => {
  let tmpRun;

  beforeEach(() => {
    tmpRun = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-meta-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRun, { recursive: true, force: true });
  });

  const writeArtefact = (relPath, body) => {
    const abs = path.join(tmpRun, relPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body, 'utf8');
  };

  it('Tier 1 — manifest string override wins over everything else', () => {
    writeArtefact(
      'intelligence/synthesis-summary.md',
      '# Artefact Headline\n\nArtefact prose body goes here and is long enough to qualify as a description.'
    );
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-04-20',
      markdown: '# Aggregated Heading\n\nAggregated prose.',
      runDir: tmpRun,
      manifest: {
        title: 'OPERATOR HEADLINE',
        description: 'OPERATOR DESCRIPTION THAT MEETS THE LENGTH BAR.',
      },
    });
    for (const lang of ALL_LANGUAGES) {
      const entry = Object.getOwnPropertyDescriptor(result, lang)?.value;
      expect(entry.title).toBe('OPERATOR HEADLINE');
      expect(entry.description).toContain('OPERATOR DESCRIPTION THAT MEETS THE LENGTH BAR.');
      expect(entry.description.length).toBeGreaterThanOrEqual(120);
    }
  });

  it('Tier 1 — manifest per-language object applies per language', () => {
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-04-20',
      markdown: '# Aggregated Heading\n\nAggregated prose for tier coverage of fallback path.',
      manifest: {
        title: { en: 'EN TITLE', sv: 'SV TITEL' },
      },
    });
    expect(Object.getOwnPropertyDescriptor(result, 'en')?.value.title).toBe('EN TITLE');
    expect(Object.getOwnPropertyDescriptor(result, 'sv')?.value.title).toBe('SV TITEL');
    // Languages without an explicit override must NOT inherit the English
    // value — they fall through to the localized template so every locale
    // stays in its own language.
    const de = Object.getOwnPropertyDescriptor(result, 'de')?.value.title;
    expect(de).not.toBe('EN TITLE');
    expect(de.length).toBeGreaterThan(5);
  });

  it('non-English languages use the English editorial headline verbatim when no localized brief exists', () => {
    // Per `.github/prompts/04-article-generation.md` § 6.2 priority 3:
    // when a locale has no translated `executive-brief_<lang>.md`, the
    // English brief content is used verbatim across every language (with
    // `source: "english-brief"` / `"english-editorial"` recording the
    // fall-through). The old concatenation
    // `<localized template> — <English headline>` mixed two languages in
    // one `<title>` and is now forbidden.
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-04-20',
      markdown:
        '# Banking Union Breakthrough and Anti-Corruption Landmark\n\nThe European Parliament this week closed the final gap in the banking union with a landmark resolution.',
    });
    const en = Object.getOwnPropertyDescriptor(result, 'en')?.value;
    expect(en.title).toBe('Banking Union Breakthrough and Anti-Corruption Landmark');
    expect(en.source).toBe('english-editorial');
    const sv = Object.getOwnPropertyDescriptor(result, 'sv')?.value;
    const de = Object.getOwnPropertyDescriptor(result, 'de')?.value;
    expect(sv.title).toBe('Banking Union Breakthrough and Anti-Corruption Landmark');
    expect(sv.source).toBe('english-brief');
    expect(de.title).toBe('Banking Union Breakthrough and Anti-Corruption Landmark');
    expect(de.source).toBe('english-brief');
    expect(sv.title).not.toMatch(/Senaste|Betydande/);
    for (const lang of ALL_LANGUAGES) {
      const entry = Object.getOwnPropertyDescriptor(result, lang)?.value;
      expect(entry.title.length).toBeGreaterThan(5);
      // Clean prose ledes ≥ 100 chars are now preserved verbatim (no
      // date-padding boilerplate). The fixture lede is 103 chars; the
      // assertion floor is set just below it so the test asserts the
      // new "no enrichment when description already substantive"
      // contract rather than the old "always pad to 120+" behaviour.
      expect(entry.description.length).toBeGreaterThanOrEqual(100);
      expect(entry.keywords.length).toBeGreaterThan(3);
    }
  });

  it('Tier 2 — localized executive-brief sibling wins over English editorial for that language', () => {
    writeArtefact(
      'executive-brief.md',
      '# Banking Union Breakthrough and Anti-Corruption Landmark\n\nThe European Parliament this week closed the final gap in the banking union with a landmark resolution adopted on Tuesday.'
    );
    writeArtefact(
      'executive-brief_sv.md',
      '# Bankunionsuppgörelse prövar EPP–S&D-disciplin\n\nParlamentet stängde denna vecka den sista luckan i bankunionen genom en landmärkesresolution som antogs på tisdagen och prövar EPP–S&D-disciplinen.'
    );
    writeArtefact(
      'executive-brief_de.md',
      '# Bankenunion-Deal prüft EPP–S&D-Disziplin\n\nDas Parlament schloss diese Woche die letzte Lücke in der Bankenunion mit einer wegweisenden Resolution, die am Dienstag angenommen wurde und die EPP–S&D-Disziplin auf die Probe stellt.'
    );
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-04-20',
      markdown: '# Aggregated heading\n\nAggregated prose body.',
      runDir: tmpRun,
    });
    const en = Object.getOwnPropertyDescriptor(result, 'en')?.value;
    expect(en.title).toBe('Banking Union Breakthrough and Anti-Corruption Landmark');
    expect(en.source).toBe('english-editorial');

    const sv = Object.getOwnPropertyDescriptor(result, 'sv')?.value;
    expect(sv.title).toBe('Bankunionsuppgörelse prövar EPP–S&D-disciplin');
    expect(sv.source).toBe('localized-brief');
    expect(sv.description).toContain('Parlamentet');

    const de = Object.getOwnPropertyDescriptor(result, 'de')?.value;
    expect(de.title).toBe('Bankenunion-Deal prüft EPP–S&D-Disziplin');
    expect(de.source).toBe('localized-brief');
    expect(de.description).toContain('Parlament');

    // Locales without a translated brief fall through to the English
    // brief verbatim (priority 3 from prompt § 6.2).
    const fr = Object.getOwnPropertyDescriptor(result, 'fr')?.value;
    expect(fr.title).toBe('Banking Union Breakthrough and Anti-Corruption Landmark');
    expect(fr.source).toBe('english-brief');
  });

  it('Tier 2 — extended/executive-brief_<lang>.md is honoured when the top-level translated brief is absent', () => {
    writeArtefact(
      'executive-brief.md',
      '# English Headline Story\n\nEnglish lede paragraph that is long enough to satisfy SEO heuristics.'
    );
    writeArtefact(
      'extended/executive-brief_ja.md',
      '# 銀行同盟合意がEPP・S&D規律を試す\n\n議会は今週、火曜日に採択された画期的な決議によって銀行同盟の最後のギャップを埋めた。'
    );
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-04-20',
      markdown: '# Aggregated heading\n\nAggregated prose body.',
      runDir: tmpRun,
    });
    const ja = Object.getOwnPropertyDescriptor(result, 'ja')?.value;
    expect(ja.title).toBe('銀行同盟合意がEPP・S&D規律を試す');
    expect(ja.source).toBe('localized-brief');
  });

  it('non-English languages still honour an explicit per-language manifest override', () => {
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-04-20',
      markdown:
        '# Banking Union Breakthrough\n\nThe European Parliament this week closed the final gap in the banking union with a landmark resolution.',
      manifest: {
        title: { en: 'EN Banking Union Breakthrough', sv: 'SV Bankunion-genombrott' },
        description: {
          en: 'EN description goes here with enough length.',
          sv: 'SV beskrivning kommer här med tillräcklig längd.',
        },
      },
    });
    const sv = Object.getOwnPropertyDescriptor(result, 'sv')?.value;
    expect(sv.title).toBe('SV Bankunion-genombrott');
    expect(sv.description).toContain('SV beskrivning kommer här med tillräcklig längd.');
    expect(sv.description.length).toBeGreaterThanOrEqual(120);
  });

  it('Tier 2 — first non-generic artefact H1 wins over aggregated H1', () => {
    writeArtefact(
      'intelligence/synthesis-summary.md',
      '# Banking Union Breakthrough and Anti-Corruption Landmark\n\nThe European Parliament this week closed the final gap in the banking union with a landmark resolution.'
    );
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-04-20',
      // Aggregator-default H1 — generic, should lose to the artefact H1.
      markdown: '# Breaking — 2026-04-20\n\nGeneric aggregator prose.',
      runDir: tmpRun,
    });
    const en = Object.getOwnPropertyDescriptor(result, 'en')?.value;
    expect(en.title).toBe('Banking Union Breakthrough and Anti-Corruption Landmark');
    expect(en.description).toContain('banking union');
  });

  it('Tier 3 — non-generic aggregated H1 wins when no artefact exists', () => {
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-04-20',
      markdown:
        '# Coalition Realignment After Plenary Vote\n\nThe plenary result fractures the centrist coalition and accelerates a rightward shift across committee assignments.',
    });
    const en = Object.getOwnPropertyDescriptor(result, 'en')?.value;
    expect(en.title).toBe('Coalition Realignment After Plenary Vote');
    expect(en.description).toContain('plenary result');
  });

  it('Tier 4 — strong prose wins when every heading is generic', () => {
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-04-20',
      markdown: [
        '# Breaking — 2026-04-20',
        '',
        '> provenance',
        '',
        'The plenary adopted a landmark anti-corruption resolution on Tuesday, closing a six-year debate and triggering immediate criticism from two national delegations.',
      ].join('\n'),
    });
    const en = Object.getOwnPropertyDescriptor(result, 'en')?.value;
    expect(en.title).toContain('plenary adopted');
    expect(en.description).toContain('anti-corruption');
  });

  it('Tier 5 — localized template fallback for every language when nothing else exists', () => {
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-04-20',
      markdown: '# Breaking — 2026-04-20',
    });
    const en = Object.getOwnPropertyDescriptor(result, 'en')?.value;
    const sv = Object.getOwnPropertyDescriptor(result, 'sv')?.value;
    expect(en.title).toMatch(/Breaking|Significant/);
    expect(sv.title).toMatch(/Senaste|Betydande/);
    expect(en.title).not.toBe(sv.title);
  });

  it('truncates long resolved titles and descriptions', () => {
    const longTitle = 'A'.repeat(500);
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-04-20',
      markdown: `# ${longTitle}\n\n${longTitle}`,
    });
    const en = Object.getOwnPropertyDescriptor(result, 'en')?.value;
    expect(en.title.length).toBeLessThanOrEqual(141);
    expect(en.description.length).toBeLessThanOrEqual(301);
  });

  it('never leaks internal run-ids or "analysis run" boilerplate into <meta description>', () => {
    // Live-site regression (2026-05-16): short ledes triggered the
    // enrichment path which emitted strings like
    //   "Published 2026-05-16 · analysis run breaking-run255-1778894853, with source-linked …"
    // Run-ids are internal artefact identifiers and must never reach
    // user-facing SEO snippets. Drift-guarded here across all 14 languages.
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-05-16',
      markdown: '# Breaking — 2026-05-16\n\nShort lede.',
      manifest: { runId: 'breaking-run255-1778894853' },
    });
    for (const lang of ALL_LANGUAGES) {
      const entry = Object.getOwnPropertyDescriptor(result, lang)?.value;
      expect(entry.description).not.toMatch(/analysis run/i);
      expect(entry.description).not.toMatch(
        /analyskörning|analysekørsel|analysekjøring|analyysiajo|Analyselauf|cycle d.analyse|ejecución de análisis|analyserun|تشغيل التحليل|הרצת ניתוח|分析実行|분석 실행|分析运行/
      );
      expect(entry.description).not.toMatch(/breaking-run\d+-\d{8,}/);
      expect(entry.title).not.toMatch(/analysis run/i);
      expect(entry.title).not.toMatch(/breaking-run\d+-\d{8,}/);
    }
  });

  it('covers all 14 languages with non-empty title+description in every tier', () => {
    const result = resolveArticleMetadata({
      articleType: 'motions',
      date: '2026-04-20',
      markdown: '# Motions — 2026-04-20',
    });
    for (const lang of ALL_LANGUAGES) {
      const entry = Object.getOwnPropertyDescriptor(result, lang)?.value;
      expect(entry.title.length).toBeGreaterThan(5);
      // Pure template-fallback case (no editorial content available).
      // The description after composeContextualDescription enrichment is
      // template-subtitle + date suffix + reader hint. Floor lowered to
      // 60 chars because date/run-id padding was removed from the
      // enrichment path; the reader hint alone is ~50-90 chars across
      // the 14 supported languages.
      expect(entry.description.length).toBeGreaterThanOrEqual(60);
      expect(entry.keywords.length).toBeGreaterThan(3);
    }
  });

  it('always includes Riksdagsmonitor cross-site keywords in every language', () => {
    const result = resolveArticleMetadata({
      articleType: 'motions',
      date: '2026-04-20',
      markdown: '# Motions — 2026-04-20',
    });
    for (const lang of ALL_LANGUAGES) {
      const entry = Object.getOwnPropertyDescriptor(result, lang)?.value;
      const lowered = entry.keywords.map((k) => k.toLowerCase());
      expect(lowered).toContain('riksdagsmonitor');
      expect(lowered).toContain('riksdag');
      expect(lowered).toContain('regeringen');
      expect(lowered).toContain('political intelligence');
      expect(lowered).toContain('eu parliament monitor');
    }
  });

  it('never leaks UUID hex fragments or run-id slugs into keywords', () => {
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-03-27',
      markdown:
        '# Routine inter-sessional day\n\nAnalysis run 77fc920c-3a76-4813-9db5-43a7e9acc25e returned 0 classified political actors.',
      runId: 'propositions-run261-1779431162',
    });
    for (const lang of ALL_LANGUAGES) {
      const entry = Object.getOwnPropertyDescriptor(result, lang)?.value;
      for (const kw of entry.keywords) {
        expect(kw).not.toMatch(/^[0-9a-f]{4,}$/i);
        expect(kw.toLowerCase()).not.toMatch(/run\s*propositions/);
        expect(kw.toLowerCase()).not.toMatch(/^run\d+$/);
        expect(kw.toLowerCase()).not.toMatch(/-run\d+-\d+$/);
      }
    }
  });

  it('uses Strategic Intelligence Summary subheading as title when the brief has one', () => {
    const tmpRoot = mkdtempSync(path.join(tmpdir(), 'sis-brief-'));
    try {
      const briefBody =
        '# Executive Brief — Propositions\n\n' +
        '## Strategic Intelligence Summary\n\n' +
        '### The Three-Coalition Paradox\n\n' +
        "EP10's governing coalition (EPP+S&D+Renew = 398/719) is simultaneously strong enough to pass legislation and internally divided enough to create unpredictable outcomes on key files.\n";
      writeFileSync(path.join(tmpRoot, 'executive-brief.md'), briefBody, 'utf8');
      const result = resolveArticleMetadata({
        articleType: 'propositions',
        date: '2026-05-22',
        markdown: '# Propositions — 2026-05-22\n\nAggregated body.',
        runDir: tmpRoot,
      });
      const en = Object.getOwnPropertyDescriptor(result, 'en')?.value;
      expect(en.title).toContain('Three-Coalition Paradox');
      expect(en.description).toContain("EP10's governing coalition");
    } finally {
      rmSync(tmpRoot, { recursive: true, force: true });
    }
  });

  it('uses Reader Briefing first numbered item as title when no Strategic Intelligence Summary', () => {
    const tmpRoot = mkdtempSync(path.join(tmpdir(), 'rb-brief-'));
    try {
      const briefBody =
        '# Executive Brief — Propositions\n\n' +
        '## Reader Briefing\n\n' +
        '1. **Immediate priority**: DMA enforcement — the Article 265 TFEU threat is a latent nuclear option that could reshape EP-Commission relations if activated.\n' +
        '2. **Strategic watch**: Mercosur ECJ timeline.\n';
      writeFileSync(path.join(tmpRoot, 'executive-brief.md'), briefBody, 'utf8');
      const result = resolveArticleMetadata({
        articleType: 'propositions',
        date: '2026-05-22',
        markdown: '# Propositions — 2026-05-22\n\nAggregated body.',
        runDir: tmpRoot,
      });
      const en = Object.getOwnPropertyDescriptor(result, 'en')?.value;
      expect(en.title).toContain('Immediate priority');
      expect(en.title).toContain('DMA');
    } finally {
      rmSync(tmpRoot, { recursive: true, force: true });
    }
  });
});

describe('extractArtifactHighlight', () => {
  let tmpRun;

  beforeEach(() => {
    tmpRun = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-art-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRun, { recursive: true, force: true });
  });

  it('returns null for a non-existent directory', () => {
    expect(extractArtifactHighlight('/does/not/exist', 'breaking', '2026-04-20')).toBeNull();
  });

  it('skips SPDX HTML-comment headers and picks the real H1', () => {
    const dir = path.join(tmpRun, 'intelligence');
    fs.mkdirSync(dir, { recursive: true });
    // REUSE-IgnoreStart
    fs.writeFileSync(
      path.join(dir, 'synthesis-summary.md'),
      [
        '<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->',
        '<!-- SPDX-License-Identifier: Apache-2.0 -->',
        '',
        '# Coalition Realignment After Plenary Vote',
        '',
        'The quarter closes with a rightward shift across committee coalitions and a decisive anti-corruption package.',
      ].join('\n'),
      'utf8'
    );
    // REUSE-IgnoreEnd
    const result = extractArtifactHighlight(tmpRun, 'motions', '2026-04-20');
    expect(result).not.toBeNull();
    expect(result.headline).toBe('Coalition Realignment After Plenary Vote');
    expect(result.summary).toContain('rightward shift');
  });

  it('ignores an artefact whose H1 is generic', () => {
    const dir = path.join(tmpRun, 'intelligence');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'synthesis-summary.md'),
      '# Breaking — 2026-04-20\n\nGeneric prose.',
      'utf8'
    );
    expect(extractArtifactHighlight(tmpRun, 'breaking', '2026-04-20')).toBeNull();
  });

  it('prefers `executive-brief.md` over `intelligence/synthesis-summary.md`', () => {
    fs.writeFileSync(
      path.join(tmpRun, 'executive-brief.md'),
      [
        '# Coalition Realignment After Plenary Vote',
        '',
        'The plenary outcome reshapes the centrist coalition and triggers immediate cabinet reshuffles across two delegations.',
      ].join('\n'),
      'utf8'
    );
    fs.mkdirSync(path.join(tmpRun, 'intelligence'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpRun, 'intelligence', 'synthesis-summary.md'),
      [
        '# Banking Union Breakthrough',
        '',
        'Some other prose that should not win because executive-brief.md is preferred.',
      ].join('\n'),
      'utf8'
    );
    const result = extractArtifactHighlight(tmpRun, 'breaking', '2026-04-20');
    expect(result).not.toBeNull();
    expect(result.headline).toBe('Coalition Realignment After Plenary Vote');
    expect(result.summary).toContain('plenary outcome');
  });

  it('returns an empty headline (with summary) when the H1 strips to a category-noun', () => {
    fs.writeFileSync(
      path.join(tmpRun, 'executive-brief.md'),
      [
        '# Executive Brief — EU Parliament Week in Review',
        '**Reporting Window:** 3 April – 1 May 2026 (D-36→D-8, ADR-006)',
        '**Generated:** 2026-05-09 | **Confidence:** 🟡 Medium',
        '',
        '---',
        '',
        '## 60-Second Read',
        '',
        "The European Parliament's April 2026 plenary sessions produced a dense legislative harvest across three strategic fault lines: EU-US trade tensions, democratic backsliding accountability, and digital governance.",
      ].join('\n'),
      'utf8'
    );
    const result = extractArtifactHighlight(tmpRun, 'week-in-review', '2026-05-09');
    expect(result).not.toBeNull();
    // The artefact H1 (`Executive Brief — EU Parliament Week in Review`)
    // strips to the bare category-noun `EU Parliament Week in Review`,
    // which `isGenericHeading` now flags as boilerplate per the
    // category-noun whitelist (see CATEGORY_NOUN_CORES). The resolver
    // therefore declines to use it as a `<title>` and returns the
    // summary only — letting the upstream caller derive a prose-based
    // headline from the lede instead of repeating the article category.
    expect(result.headline).toBe('');
    // Summary still comes from the `## 60-Second Read` paragraph, not
    // from the `**Reporting Window:**` preamble.
    expect(result.summary).toContain('European Parliament');
    expect(result.summary).toContain('April 2026 plenary sessions');
    expect(result.summary).not.toContain('Reporting Window');
    expect(result.summary).not.toContain('Confidence');
  });
});

describe('extractLedeAfterHeading', () => {
  it('returns the first prose paragraph inside a `## 60-Second Read` block', () => {
    const md = [
      '# Executive Brief — Something',
      '',
      '## 60-Second Read',
      '',
      'The plenary adopted a landmark anti-corruption resolution on Tuesday, closing a six-year debate.',
      '',
      '## BLUF',
      '',
      'Other content.',
    ].join('\n');
    expect(extractLedeAfterHeading(md)).toContain('plenary adopted a landmark');
  });

  it('returns the first prose paragraph inside a `## TL;DR` block', () => {
    const md = [
      '## TL;DR',
      '',
      'Five developments demand attention this week, including a fresh push on Digital Markets Act enforcement.',
    ].join('\n');
    expect(extractLedeAfterHeading(md)).toContain('Five developments demand attention');
  });

  it('returns empty when no lede heading exists', () => {
    const md = [
      '# Just a heading',
      '',
      'Plain prose, but no lede heading anywhere in the doc.',
    ].join('\n');
    expect(extractLedeAfterHeading(md)).toBe('');
  });

  it('skips metadata banner rows inside the lede section', () => {
    const md = [
      '## 60-Second Read',
      '',
      '**Reporting Window:** 3 April – 1 May 2026',
      '',
      'The actual lede sentence carries enough length to satisfy the prose threshold and survive truncation.',
    ].join('\n');
    const lede = extractLedeAfterHeading(md);
    expect(lede).toContain('actual lede sentence');
    expect(lede).not.toContain('Reporting Window');
  });

  it('matches a Japanese BLUF heading with full-width parentheses', () => {
    const md = [
      '# エグゼクティブ・ブリーフ — 速報',
      '**日付：** 2026-05-15 | **記事タイプ：** 速報 | **実行：** breaking-run-001',
      '',
      '## 🎯 BLUF（結論先出し）',
      '',
      '欧州議会の2026年4月28日〜30日の本会議は、六つの重要な立法・政治的行動を生み出した。それらはまとめて三つのマクロレベルの転換を示している。',
    ].join('\n');
    const lede = extractLedeAfterHeading(md);
    expect(lede).toContain('欧州議会');
    expect(lede).not.toContain('日付');
  });

  it('matches a Korean BLUF heading with em-dash gloss', () => {
    const md = [
      '## 🎯 BLUF — 핵심 결론',
      '',
      '유럽의회는 2026년 4월 28일부터 30일까지의 본회의에서 여섯 가지 중요한 입법 및 정치적 결정을 내렸으며 이는 세 가지 거시적 변화를 보여준다.',
    ].join('\n');
    expect(extractLedeAfterHeading(md)).toContain('유럽의회');
  });

  it('rejects a localized banner row even when its keys are not in the English METADATA_LINE_PREFIXES list', () => {
    // Generic banner shape — `**Key:** Value | **Key:** Value` — must be
    // rejected regardless of language. Japanese full-width colon `：` is
    // the most common variant in published briefs.
    expect(
      shouldSkipDescriptionLine(
        '**日付：** 2026-05-15 | **記事タイプ：** 速報 | **実行：** breaking-run-001'
      )
    ).toBe(true);
    expect(
      shouldSkipDescriptionLine(
        '**التاريخ:** 2026-05-15 | **النوع:** عاجل | **التشغيل:** breaking-run-001'
      )
    ).toBe(true);
    // Plain prose with one inline link must not be rejected by this rule.
    expect(
      shouldSkipDescriptionLine(
        'The European Parliament closed the final gap in the banking union with a landmark resolution adopted by the plenary on Tuesday evening.'
      )
    ).toBe(false);
  });
});

describe('isArtifactCategoryHeading', () => {
  it('flags the canonical artefact-category prefixes', () => {
    expect(isArtifactCategoryHeading('Executive Brief — Foo')).toBe(true);
    expect(isArtifactCategoryHeading('Synthesis Summary — Bar')).toBe(true);
    expect(isArtifactCategoryHeading('Intelligence Briefing — Baz')).toBe(true);
    expect(isArtifactCategoryHeading('Intelligence Assessment: Quux')).toBe(true);
    expect(isArtifactCategoryHeading('Committee Activity Report - Qux')).toBe(true);
  });

  it('does not flag genuine editorial headlines', () => {
    expect(isArtifactCategoryHeading('Banking Union Breakthrough')).toBe(false);
    expect(isArtifactCategoryHeading('Coalition Realignment After Plenary Vote')).toBe(false);
    expect(isArtifactCategoryHeading('')).toBe(false);
  });

  it('strips leading emoji/decoration before matching', () => {
    expect(isArtifactCategoryHeading('🔖 Executive Brief — EU Parliament Year Ahead')).toBe(true);
    expect(isArtifactCategoryHeading('📊 Synthesis Summary — Q1 2026')).toBe(true);
  });
});

describe('stripLeadingProseLabel', () => {
  it('strips a single-word all-caps label opener', () => {
    expect(
      stripLeadingProseLabel(
        'SITUATION: The European Parliament adopted 14 texts at the late-April plenary session in Strasbourg.'
      )
    ).toBe(
      'The European Parliament adopted 14 texts at the late-April plenary session in Strasbourg.'
    );
  });

  it('strips a multi-word all-caps label opener', () => {
    expect(
      stripLeadingProseLabel(
        'KEY MOTION: TA-10-2026-0160 demands stronger DMA enforcement against Big Tech gatekeepers.'
      )
    ).toBe('TA-10-2026-0160 demands stronger DMA enforcement against Big Tech gatekeepers.');
  });

  it('strips a hyphenated all-caps label opener (TIER-1, BLUF, etc.)', () => {
    expect(
      stripLeadingProseLabel(
        'TIER-1: Five legislative developments demand immediate decision-maker attention this week.'
      )
    ).toBe('Five legislative developments demand immediate decision-maker attention this week.');
    expect(
      stripLeadingProseLabel(
        'BLUF: Coalition fracture probability rises to 35% on the upcoming defence-spending vote.'
      )
    ).toBe('Coalition fracture probability rises to 35% on the upcoming defence-spending vote.');
  });

  it('returns the line unchanged when there is no all-caps opener', () => {
    const line = 'The European Parliament adopted 14 texts at the late-April plenary session.';
    expect(stripLeadingProseLabel(line)).toBe(line);
  });

  it('returns the line unchanged when the opener is too short to be a label', () => {
    // Only `OK:` — too short, would false-match an actual sentence opener.
    expect(
      stripLeadingProseLabel('OK: that decision matters and here is why it matters now.')
    ).toBe('OK: that decision matters and here is why it matters now.');
  });

  it('returns the line unchanged when the opener uses lowercase letters', () => {
    expect(
      stripLeadingProseLabel('Situation: The Parliament adopted multiple texts in the plenary.')
    ).toBe('Situation: The Parliament adopted multiple texts in the plenary.');
  });

  it('returns the line unchanged when the prose body is too short', () => {
    expect(stripLeadingProseLabel('SITUATION: too short')).toBe('SITUATION: too short');
  });

  it('handles empty input safely', () => {
    expect(stripLeadingProseLabel('')).toBe('');
  });
});

describe('stripArtifactCategoryAffix', () => {
  it('strips a prefix-form category label', () => {
    expect(stripArtifactCategoryAffix('Executive Brief — EU Parliament Motions')).toBe(
      'EU Parliament Motions'
    );
    expect(stripArtifactCategoryAffix('Synthesis Summary — EP Motions & Adopted Texts')).toBe(
      'EP Motions & Adopted Texts'
    );
    expect(stripArtifactCategoryAffix('Intelligence Synthesis Summary — EP10 Year in Review')).toBe(
      'EP10 Year in Review'
    );
  });

  it('strips a suffix-form category label', () => {
    expect(stripArtifactCategoryAffix('EU Parliament Propositions — Executive Brief')).toBe(
      'EU Parliament Propositions'
    );
    expect(stripArtifactCategoryAffix('EP10 Term Outlook — Executive Brief')).toBe(
      'EP10 Term Outlook'
    );
  });

  it('strips trailing parenthesised metadata after rescuing the core', () => {
    expect(
      stripArtifactCategoryAffix('Key Legislative Developments — Deep Analysis (2026-05-08)')
    ).toBe('Key Legislative Developments');
    expect(
      stripArtifactCategoryAffix('Actor Mapping — EP10 Political Power Network (May 2026)')
    ).toBe('EP10 Political Power Network');
  });

  it('returns empty when only the category label survives', () => {
    expect(stripArtifactCategoryAffix('Executive Brief')).toBe('');
    expect(stripArtifactCategoryAffix('Synthesis Summary')).toBe('');
  });

  it('returns the heading unchanged when no category affix is present', () => {
    expect(stripArtifactCategoryAffix('Banking Union Breakthrough')).toBe(
      'Banking Union Breakthrough'
    );
    expect(stripArtifactCategoryAffix('Coalition Realignment After Plenary Vote')).toBe(
      'Coalition Realignment After Plenary Vote'
    );
  });

  it('handles colon-form separators', () => {
    expect(stripArtifactCategoryAffix('Executive Brief: EU Parliament Week Ahead')).toBe(
      'EU Parliament Week Ahead'
    );
  });

  it('handles empty input safely', () => {
    expect(stripArtifactCategoryAffix('')).toBe('');
    expect(stripArtifactCategoryAffix('   ')).toBe('');
  });

  it('falls back to empty when the rescued core is too short', () => {
    // After stripping, only `EU` remains — below the 5-char minimum.
    expect(stripArtifactCategoryAffix('EU — Executive Brief')).toBe('');
  });
});

describe('isTranslatedSiblingBrief — translated sibling exclusion', () => {
  it('flags every `*_<lang>.md` filename for the 14 supported languages', () => {
    // Regression guard for the bug that injected Arabic content into the
    // English homepage card for the 2026-05-15 batch: when
    // `executive-brief.md`'s H1 was generic, the top-level fallback scan
    // walked translated siblings (`executive-brief_ar.md`, …) and the
    // first non-English H1 won.
    for (const lang of ALL_LANGUAGES) {
      if (lang === 'en') continue;
      expect(isTranslatedSiblingBrief(`executive-brief_${lang}.md`)).toBe(true);
      expect(isTranslatedSiblingBrief(`synthesis-summary_${lang}.md`)).toBe(true);
    }
  });

  it('does NOT flag canonical English artefacts', () => {
    expect(isTranslatedSiblingBrief('executive-brief.md')).toBe(false);
    expect(isTranslatedSiblingBrief('synthesis-summary.md')).toBe(false);
    expect(isTranslatedSiblingBrief('coalition-dynamics.md')).toBe(false);
    expect(isTranslatedSiblingBrief('deep-analysis.md')).toBe(false);
    expect(isTranslatedSiblingBrief('article.md')).toBe(false);
  });

  it('does NOT flag filenames whose suffix happens to look like a language code but isn’t one', () => {
    // `_eu` / `_uk` are NOT in ALL_LANGUAGES (Ukrainian is not yet a
    // supported locale); they must remain English artefacts.
    expect(isTranslatedSiblingBrief('mff-overview_eu.md')).toBe(false);
    expect(isTranslatedSiblingBrief('whatever_uk.md')).toBe(false);
  });
});

describe('extractArtifactHighlight — translated-sibling exclusion (regression)', () => {
  let tmpRun;

  beforeEach(() => {
    tmpRun = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-translated-sibling-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRun, { recursive: true, force: true });
  });

  it('does NOT pick up Arabic content from `executive-brief_ar.md` when the English brief H1 is generic', () => {
    // English brief — generic boilerplate H1 (the bug trigger).
    fs.writeFileSync(
      path.join(tmpRun, 'executive-brief.md'),
      ['# Executive Brief — EU Parliament Committee Reports', '', 'Generic prose.'].join('\n'),
      'utf8'
    );
    // Translated sibling — Arabic H1 that the English-only
    // `isGenericHeading` detector cannot recognise as boilerplate.
    fs.writeFileSync(
      path.join(tmpRun, 'executive-brief_ar.md'),
      ['# الملخص التنفيذي — تقارير لجان البرلمان الأوروبي', '', 'محتوى عربي.'].join('\n'),
      'utf8'
    );
    const result = extractArtifactHighlight(tmpRun, 'committee-reports', '2026-05-15');
    // The result MUST NOT contain Arabic text — the translated sibling
    // is excluded from the fallback scan and the resolver returns the
    // safe summary-only outcome (or null).
    if (result?.headline) {
      expect(result.headline).not.toMatch(/[\u0590-\u08FF]/);
    }
    if (result?.summary) {
      expect(result.summary).not.toMatch(/[\u0590-\u08FF]/);
    }
  });
});

describe('extractPriorityFindingHighlight', () => {
  it('extracts the first bold-in-numbered-list dossier name (breaking briefs)', () => {
    // Canonical Stage-B authoring pattern documented in
    // `analysis/templates/executive-brief.md` for breaking briefs:
    // `1. **Title** (TA-…, date)\n   Paragraph …`
    const md = [
      '# Executive Brief — EU Parliament Breaking News',
      '',
      '## Key Developments (2026-04-28 to 2026-04-30)',
      '',
      '### 🔴 HIGH PRIORITY',
      '',
      "1. **Digital Markets Act Enforcement** (TA-10-2026-0160, 2026-04-30) Parliament adopted a resolution on enforcement of the Digital Markets Act, signalling growing frustration with the Commission's pace of action against designated gatekeepers.",
      '',
      "2. **Ukraine War Accountability** (TA-10-2026-0161, 2026-04-30) Parliament demanded accountability and justice for Russia's continued attacks against Ukrainian civilian infrastructure.",
    ].join('\n');
    const result = extractPriorityFindingHighlight(md);
    expect(result).not.toBeNull();
    expect(result.headline).toBe('Digital Markets Act Enforcement');
    expect(result.summary).toContain('Parliament adopted a resolution');
    expect(result.summary).not.toContain('TA-10-2026-0160');
  });

  it('extracts the first numbered subheading (committee-reports briefs)', () => {
    const md = [
      '# Executive Brief — EU Parliament Committee Reports',
      '',
      '## Priority Dossiers',
      '',
      '### 1. Clean Industrial Deal Implementation (ITRE/ENVI)',
      '',
      "The Clean Industrial Deal framework — the Commission's flagship industrial competitiveness strategy — is generating parallel committee work across ITRE.",
    ].join('\n');
    const result = extractPriorityFindingHighlight(md);
    expect(result).not.toBeNull();
    expect(result.headline).toBe('Clean Industrial Deal Implementation');
    expect(result.summary).toContain('Clean Industrial Deal framework');
  });

  it('extracts `### KJ-1: Title` tagged-heading items (motions briefs)', () => {
    const md = [
      '## 🔑 Key Judgements',
      '',
      "### KJ-1: Digital Regulation Enforcement Has Become the EP's Dominant Legislative Lever",
      '',
      'Three of the five named resolutions targeted digital platform accountability.',
    ].join('\n');
    const result = extractPriorityFindingHighlight(md);
    expect(result).not.toBeNull();
    expect(result.headline).toBe(
      "Digital Regulation Enforcement Has Become the EP's Dominant Legislative Lever"
    );
  });

  it('extracts `### Alert N — Title` word-tagged headings (propositions briefs)', () => {
    const md = [
      '## 💡 Policy Intelligence Alerts',
      '',
      '### Alert 1 — DMA Enforcement Escalation 🔴',
      '',
      'Commission expected to issue first formal non-compliance decisions in Q3 2026.',
    ].join('\n');
    const result = extractPriorityFindingHighlight(md);
    expect(result).not.toBeNull();
    expect(result.headline).toBe('DMA Enforcement Escalation');
  });

  it('extracts the first H2 `## 📌 Lead Story:` heading even without a parent priority section (motions briefs)', () => {
    const md = [
      '# Executive Brief — EU Parliament Motions',
      '',
      '## Session Statistics',
      '',
      'Stats prose.',
      '',
      '## 📌 Lead Story: Russia Accountability & Ukraine Resolution',
      '',
      "Parliament's lead resolution this session addressed Russia's continued attacks against Ukraine.",
    ].join('\n');
    const result = extractPriorityFindingHighlight(md);
    expect(result).not.toBeNull();
    expect(result.headline).toBe('Russia Accountability & Ukraine Resolution');
  });

  it('strips trailing parenthesised confidence metadata from the headline', () => {
    const md = [
      '## Key Judgements',
      '',
      '1. **EPP remains dominant broker (Highly Probable, 80%):** With 185 seats, EPP controls committee chair nominations.',
    ].join('\n');
    const result = extractPriorityFindingHighlight(md);
    expect(result).not.toBeNull();
    expect(result.headline).toBe('EPP remains dominant broker');
  });

  it('strips leading "🔴 CRITICAL — " priority decoration from the headline', () => {
    const md = [
      '## High Priority',
      '',
      '1. **🔴 CRITICAL — MFF 2028-2034 Interim Report Adopted** (April 28 — TA-10-2026-0111)',
      '   The MFF interim report passed with cross-party support.',
    ].join('\n');
    const result = extractPriorityFindingHighlight(md);
    expect(result).not.toBeNull();
    expect(result.headline).toBe('MFF 2028-2034 Interim Report Adopted');
  });

  it('rejects bold paragraph ledes longer than 110 chars (prevents runaway titles)', () => {
    const md = [
      '## 🔴 Priority Intelligence Assessment',
      '',
      '**This period captures the April 2026 Strasbourg mini-plenary (28–30 April) — one of the most consequential legislative sessions of EP Term 10 to date, delivering 14 adopted texts.**',
    ].join('\n');
    const result = extractPriorityFindingHighlight(md);
    // The 180-char bold paragraph must not be treated as a headline —
    // the resolver returns `null` so the caller falls through to the
    // next tier.
    expect(result).toBeNull();
  });

  it('rejects metadata banner bolds (`**Admiralty Grade: B/2**`, `**Reporting Window:** …`)', () => {
    const md = [
      '## 🔴 Priority Intelligence Assessment',
      '',
      '**Admiralty Grade: B/2** — Sources confirmed via EP Open Data Portal.',
      '',
      '**Reporting Window:** 3 April – 1 May 2026',
    ].join('\n');
    const result = extractPriorityFindingHighlight(md);
    expect(result).toBeNull();
  });

  it('does NOT match `### 2.1 Close to Adoption` decimal-section headings (prevents stray-digit titles)', () => {
    // Regression guard: `### 2.1 Close to Adoption` previously matched
    // Pattern B and leaked `1 Close to Adoption` (stray decimal tail)
    // into the article title. Requires explicit separator after the
    // numeric prefix now.
    const md = [
      '## Top Findings',
      '',
      '### 2.1 Close to Adoption (H1-2026, PL Presidency)',
      '',
      'Body prose.',
    ].join('\n');
    const result = extractPriorityFindingHighlight(md);
    // Either null or the headline must not start with a stray digit.
    if (result?.headline) {
      expect(result.headline).not.toMatch(/^\d/);
    }
  });

  it('strips a leading `**WEP:** ...` confidence-band line from the priority-finding summary (regression: run #26223932441)', () => {
    // Regression guard: `intelligence/synthesis-summary.md` opens each
    // Key Judgement with `**WEP: ALMOST CERTAINLY (>95%)** | Admiralty:
    // A1`. That line leaked verbatim into `<meta description>` and
    // tripped the html-article-pipeline test that forbids all-caps
    // prose-label openers (SITUATION:, BLUF:, WEP:, …).
    const md = [
      '## Key Judgements',
      '',
      '### KJ-1: AI Trade Policy Is Becoming the Dominant Battleground',
      '**WEP: ALMOST CERTAINLY (>95%)** | Admiralty: A1 (adopted text as primary evidence)',
      '',
      'The adoption of T10-0183/2026 establishes Parliament position on AI-trade instruments and signals an inflection point for EU digital trade diplomacy.',
    ].join('\n');
    const result = extractPriorityFindingHighlight(md);
    expect(result?.headline).toBe('AI Trade Policy Is Becoming the Dominant Battleground');
    expect(result?.summary ?? '').not.toMatch(/^[A-Z][A-Z0-9 -]{1,40}:\s/);
    expect(result?.summary ?? '').toContain('T10-0183/2026');
  });

  it('returns null when the body has no priority section AND no H2 story heading', () => {
    const md = [
      '# Executive Brief — Something',
      '',
      '## Reporting Window',
      '',
      'Generic prose without any priority finding.',
    ].join('\n');
    expect(extractPriorityFindingHighlight(md)).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(extractPriorityFindingHighlight('')).toBeNull();
  });
});
