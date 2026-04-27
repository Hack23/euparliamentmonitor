// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/article-metadata — priority ladder,
 * leak-filter tightening, and template fallbacks across the 14 supported
 * languages.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  buildTemplateFallback,
  deriveMonthLabel,
  deriveReportingWindowForWeekInReview,
  deriveWeekRange,
  extractArtifactHighlight,
  extractFirstH1,
  extractStrongProseLine,
  humanizeSlug,
  isGenericHeading,
  resolveArticleMetadata,
  shouldSkipDescriptionLine,
  stripInlineMarkdown,
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
      shouldSkipDescriptionLine('📋 Analysis Owner: EU Parliament Monitor | 📅 Generated: 2026-04-01')
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

  it('returns empty when nothing qualifies', () => {
    expect(extractStrongProseLine('# only a heading')).toBe('');
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
    expect(
      isGenericHeading('EU Parliament Breaking — 2026-04-14', 'breaking', '2026-04-14')
    ).toBe(true);
  });

  it('rejects the collision-suffix "Breaking Breaking — <date>" form', () => {
    expect(
      isGenericHeading('Breaking Breaking — 2026-04-20', 'breaking', '2026-04-20')
    ).toBe(true);
  });

  it('accepts any non-generic editorial headline', () => {
    expect(
      isGenericHeading(
        'Banking Union Breakthrough and Anti-Corruption Landmark',
        'breaking',
        '2026-04-14'
      )
    ).toBe(false);
    expect(
      isGenericHeading(
        'Synthesis Summary — EP10 Q1 2026 Motions & Resolutions',
        'motions',
        '2026-04-20'
      )
    ).toBe(false);
  });

  it('rejects empty headings', () => {
    expect(isGenericHeading('', 'breaking', '2026-04-14')).toBe(true);
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
      expect(entry.description).toBe('OPERATOR DESCRIPTION THAT MEETS THE LENGTH BAR.');
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

  it('non-English languages never inherit the English editorial headline', () => {
    // Simulate the aggregator case: English editorial H1 exists in the
    // aggregated Markdown, but every non-EN variant must still surface a
    // locale-appropriate title rather than the English headline.
    const result = resolveArticleMetadata({
      articleType: 'breaking',
      date: '2026-04-20',
      markdown:
        '# Banking Union Breakthrough and Anti-Corruption Landmark\n\nThe European Parliament this week closed the final gap in the banking union with a landmark resolution.',
    });
    const en = Object.getOwnPropertyDescriptor(result, 'en')?.value;
    expect(en.title).toBe('Banking Union Breakthrough and Anti-Corruption Landmark');
    for (const lang of ALL_LANGUAGES) {
      if (lang === 'en') continue;
      const entry = Object.getOwnPropertyDescriptor(result, lang)?.value;
      expect(entry.title).not.toContain('Banking Union Breakthrough');
      expect(entry.title).not.toContain('Anti-Corruption Landmark');
      expect(entry.description).not.toContain('banking union with a landmark');
      expect(entry.title.length).toBeGreaterThan(5);
      expect(entry.description.length).toBeGreaterThan(5);
    }
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
    expect(sv.description).toBe('SV beskrivning kommer här med tillräcklig längd.');
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

  it('covers all 14 languages with non-empty title+description in every tier', () => {
    const result = resolveArticleMetadata({
      articleType: 'motions',
      date: '2026-04-20',
      markdown: '# Motions — 2026-04-20',
    });
    for (const lang of ALL_LANGUAGES) {
      const entry = Object.getOwnPropertyDescriptor(result, lang)?.value;
      expect(entry.title.length).toBeGreaterThan(5);
      expect(entry.description.length).toBeGreaterThan(5);
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
        '# Master Intelligence Synthesis — EP10 Q1 2026',
        '',
        'The quarter closes with a rightward shift across committee coalitions and a decisive anti-corruption package.',
      ].join('\n'),
      'utf8'
    );
    // REUSE-IgnoreEnd
    const result = extractArtifactHighlight(tmpRun, 'motions', '2026-04-20');
    expect(result).not.toBeNull();
    expect(result.headline).toBe('Master Intelligence Synthesis — EP10 Q1 2026');
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
});
