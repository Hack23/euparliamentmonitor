// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for scripts/backport-article-seo.js — body extraction,
 * rewrite idempotency, and preservation of article body / chrome.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  deriveMetadataForFile,
  extractBodyFirstProse,
  extractBodyH1,
  isGenericBodyH1,
  rewriteHtml,
  sliceArticleBody,
  truncateUpto,
} from '../../scripts/backport-article-seo.js';

/** Minimal HTML scaffold that mirrors the real file layout. */
const buildHtml = ({ title, description, body }) => `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<title>${title} | EU Parliament Monitor</title>
<meta name="description" content="${description}">
<meta name="keywords" content="European Parliament, legislative">
<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image:alt" content="${title} — AI-Disrupted Parliamentary Intelligence">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "${title}",
  "description": "${description}",
  "datePublished": "2026-02-24",
  "inLanguage": "en"
}
</script>
</head>
<body>
<article class="news-article" lang="en">
<header class="article-header">
  <div class="article-meta">
    <span class="article-type">Legislative Procedures</span>
    <span class="article-date">February 24, 2026</span>
  </div>
  <h1>${title}</h1>
  <p class="article-subtitle">${description}</p>
</header>
<div class="article-content">
${body}
</div>
</article>
</body>
</html>`;

describe('sliceArticleBody', () => {
  it('returns the slice between <article> and </article>', () => {
    const html = '<head></head><article class="x">BODY</article>trailing';
    expect(sliceArticleBody(html)).toContain('BODY');
    expect(sliceArticleBody(html)).not.toContain('trailing');
  });

  it('falls back to the entire document when no <article> tag is present', () => {
    const html = '<body>raw</body>';
    expect(sliceArticleBody(html)).toBe(html);
  });
});

describe('extractBodyH1 / extractBodyFirstProse', () => {
  it('extracts the first body H1 text with inline tags stripped', () => {
    const html = '<article><h1>The <em>Banking</em> Union Breakthrough</h1><p>Prose.</p></article>';
    expect(extractBodyH1(html)).toBe('The Banking Union Breakthrough');
  });

  it('skips header metadata spans and returns the first long body paragraph', () => {
    const html = `<article>
      <header class="article-header">
        <div class="article-meta"><span class="x">ignored meta</span></div>
        <h1>Template Title</h1>
        <p class="article-subtitle">Template subtitle that should be ignored.</p>
      </header>
      <div class="article-content">
        <section class="lede">
          <p>The European Parliament has registered more than sixty new legislative procedures since early 2026, marking a decisive acceleration of the pipeline.</p>
        </section>
      </div>
    </article>`;
    expect(extractBodyFirstProse(html)).toContain('registered more than sixty new');
  });

  it('skips paragraphs that are metadata-banner stubs', () => {
    const html = `<article>
      <div class="article-content">
        <p>Pipeline Health 0% throughput indicator for the current term under assessment window Q1 2026.</p>
        <p>The European Parliament has registered more than sixty new legislative procedures this quarter and is showing a decisive acceleration.</p>
      </div>
    </article>`;
    expect(extractBodyFirstProse(html)).toContain('registered more than sixty');
  });

  it('skips aggregator ICD-203 / Run-metadata / Purpose-banner paragraphs', () => {
    const html = `<article>
      <div class="article-content">
        <p>Composition layer: This file pulls the threads from every other intelligence artifact into a single bottom-line-up-front judgement set.</p>
        <p>BLUF (ICD-203) : Over the past 30 days the European Parliament has indexed 104 adopted-text records for 2026 and the pipeline is healthy.</p>
        <p>Purpose : Consolidated intelligence for Run 183 — Easter Recess Day 5 assessment, TA-10-2026-0099–0104 data gap analysis and recovery tracking.</p>
        <p>Run 186 contribution : T-8 countdown intelligence baseline synthesis across three operational feeds with manual triage.</p>
        <p>Date : Monday 2026-04-20 (EP Easter recess Day 8 of 13; Easter Sunday was April 5) Run ID : 191 Mode : ANALYSIS_ONLY, status: stable.</p>
        <p>The European Parliament adopted a landmark resolution on Tuesday closing a six-year debate on anti-corruption oversight in cross-border public procurement.</p>
      </div>
    </article>`;
    const first = extractBodyFirstProse(html);
    expect(first).toContain('landmark resolution');
    expect(first).not.toMatch(/Composition layer|BLUF|Purpose|Run 186|Date :/);
  });

  it('decodes HTML entities so the output is plain prose', () => {
    const html = `<article><div class="article-content"><p>The European Parliament&rsquo;s tenth term is accelerating its legislative workload, with twenty new procedures registered in early 2026.</p></div></article>`;
    expect(extractBodyFirstProse(html)).toContain('European Parliament\u2019s');
  });
});

describe('isGenericBodyH1', () => {
  it('flags legacy template H1s as generic', () => {
    expect(
      isGenericBodyH1(
        'Legislative Procedures: European Parliament Monitor',
        'propositions',
        '2026-02-24'
      )
    ).toBe(true);
    expect(isGenericBodyH1('EU Parliament Breaking — 2026-04-14', 'breaking', '2026-04-14')).toBe(
      true
    );
  });

  it('flags the pure `<Phrase> — <ISO-date>` aggregator default form even with a run-suffixed articleType', () => {
    // Regression for "Breaking — 2026-04-20" where articleType is
    // `breaking-190`: the default humanise would produce
    // "Breaking 190 — 2026-04-20", so isGenericHeading wouldn't match
    // the raw "Breaking — 2026-04-20" H1.
    expect(isGenericBodyH1('Breaking — 2026-04-20', 'breaking-190', '2026-04-20')).toBe(true);
    expect(isGenericBodyH1('Motions - 2026-04-20', 'motions-run156', '2026-04-20')).toBe(true);
    expect(isGenericBodyH1('Week Ahead — 2026-04-20', 'week-ahead-run2', '2026-04-20')).toBe(true);
  });

  it('accepts real editorial headlines', () => {
    expect(
      isGenericBodyH1(
        'Legislative Pipeline Surge: Twenty New Procedures Filed in Early 2026',
        'propositions',
        '2026-02-26'
      )
    ).toBe(false);
  });
});

describe('truncateUpto', () => {
  it('returns the input unchanged when under the cap', () => {
    expect(truncateUpto('short', 100)).toBe('short');
  });

  it('clips on a word boundary and appends an ellipsis', () => {
    const long = 'This is a rather long sentence that would exceed the cap repeatedly'.repeat(3);
    const out = truncateUpto(long, 60);
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toMatch(/wo…$/); // doesn't break mid-word
  });
});

describe('deriveMetadataForFile — full pipeline', () => {
  it('replaces a generic legacy H1 with a body-derived editorial highlight', () => {
    const html = buildHtml({
      title: 'Legislative Procedures: European Parliament Monitor',
      description: 'Recent legislative proposals, procedure tracking, and pipeline status.',
      body: `
        <section class="lede">
          <p>The European Parliament has registered more than sixty new legislative procedures in early 2026, a decisive acceleration that puts the chamber on a faster legislative cadence than any recent term.</p>
        </section>`,
    });
    const meta = deriveMetadataForFile(
      { slug: '2026-02-24-propositions', articleType: 'propositions', date: '2026-02-24', lang: 'en' },
      html
    );
    expect(meta.title).toContain('registered more than sixty');
    expect(meta.description).toContain('registered more than sixty');
    // Must not contain the old generic title.
    expect(meta.title).not.toBe('Legislative Procedures: European Parliament Monitor');
  });

  it('keeps a rich editorial H1 when one already exists', () => {
    const html = buildHtml({
      title: 'Banking Union Breakthrough and Anti-Corruption Landmark',
      description: 'A landmark resolution closes the banking union gap and strengthens anti-corruption oversight.',
      body: `<p>The plenary adopted the resolution by a decisive margin on Tuesday, closing a six-year debate and triggering immediate criticism from two national delegations about implementation timelines.</p>`,
    });
    const meta = deriveMetadataForFile(
      { slug: '2026-04-14-breaking', articleType: 'breaking', date: '2026-04-14', lang: 'en' },
      html
    );
    expect(meta.title).toBe('Banking Union Breakthrough and Anti-Corruption Landmark');
  });

  it('falls back to template metadata when body has no prose', () => {
    const html = buildHtml({
      title: 'EU Parliament Breaking — 2026-04-14',
      description: 'Intelligence summary.',
      body: '<p>too short</p>',
    });
    const meta = deriveMetadataForFile(
      { slug: '2026-04-14-breaking', articleType: 'breaking', date: '2026-04-14', lang: 'en' },
      html
    );
    // Must have fallen back to the localized template tier (non-empty).
    expect(meta.title.length).toBeGreaterThan(10);
    expect(meta.description.length).toBeGreaterThan(10);
  });

  it('uses the localized template when body language does not match filename language', () => {
    // Aggregator regression case — the file is `-sv.html` but the body
    // is still rendered in English (known PR#1404 regression). The
    // backport must NOT extract the English prose into the Swedish
    // `<title>`; it must fall through to the localized template.
    const englishBody =
      '<h1>Banking Union Breakthrough and Anti-Corruption Landmark</h1>' +
      '<p>The European Parliament this week closed the final gap in the banking union with a landmark resolution adopted by the plenary on Tuesday evening.</p>';
    const html = buildHtml({
      title: 'Banking Union Breakthrough and Anti-Corruption Landmark',
      description: 'The European Parliament closed the final gap in the banking union.',
      body: englishBody,
    });
    // Note: buildHtml hard-codes `<html lang="en">`. The file is `*-sv.html`.
    const meta = deriveMetadataForFile(
      { slug: '2026-04-14-breaking', articleType: 'breaking', date: '2026-04-14', lang: 'sv' },
      html
    );
    // Must NOT contain the English editorial phrases.
    expect(meta.title).not.toContain('Banking Union Breakthrough');
    expect(meta.title).not.toContain('Anti-Corruption Landmark');
    expect(meta.description).not.toContain('banking union with a landmark');
    // Must be populated from the localized Swedish template.
    expect(meta.title.length).toBeGreaterThan(5);
    expect(meta.description.length).toBeGreaterThan(5);
  });

  it('mines the body when its `<html lang>` matches the filename language', () => {
    // Legacy cohort — body is in Swedish so we SHOULD extract from it.
    const svBody =
      '<h1>Bankunion-genombrott och antikorruptions-milstolpe</h1>' +
      '<p>Europaparlamentet slöt denna vecka den sista luckan i bankunionen med en historisk resolution antagen av plenum på tisdagskvällen.</p>';
    const html = `<!DOCTYPE html>
<html lang="sv" dir="ltr">
<head>
<title>Old title | EU Parliament Monitor</title>
<meta name="description" content="old">
<meta property="og:title" content="old">
<meta property="og:description" content="old">
<meta property="og:image:alt" content="old">
<meta name="twitter:title" content="old">
<meta name="twitter:description" content="old">
<script type="application/ld+json">{"@type":"NewsArticle","headline":"old","description":"old"}</script>
</head>
<body><article class="news-article" lang="sv"><div class="article-content">${svBody}</div></article></body>
</html>`;
    const meta = deriveMetadataForFile(
      { slug: '2026-02-24-breaking', articleType: 'breaking', date: '2026-02-24', lang: 'sv' },
      html
    );
    expect(meta.title).toContain('Bankunion-genombrott');
    expect(meta.description).toContain('Europaparlamentet');
  });
});

describe('rewriteHtml — idempotency + surface coverage', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-backport-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('rewrites every SEO-facing region but leaves the body untouched', () => {
    const originalTitle = 'Legislative Procedures: European Parliament Monitor';
    const originalDesc = 'Recent legislative proposals.';
    const body = `<section class="lede"><p>${'x'.repeat(120)}</p></section>`;
    const html = buildHtml({ title: originalTitle, description: originalDesc, body });

    const newMeta = { title: 'Landmark Banking Union Resolution', description: 'A decisive plenary result reshapes the anti-corruption framework.' };
    const rewritten = rewriteHtml(html, newMeta);

    // <title>
    expect(rewritten).toContain('<title>Landmark Banking Union Resolution — EU Parliament Monitor</title>');
    // Meta tags
    expect(rewritten).toContain(`<meta name="description" content="${newMeta.description}">`);
    expect(rewritten).toContain(`<meta name="twitter:title" content="${newMeta.title}">`);
    expect(rewritten).toContain(`<meta name="twitter:description" content="${newMeta.description}">`);
    expect(rewritten).toContain(`<meta property="og:title" content="${newMeta.title}">`);
    expect(rewritten).toContain(`<meta property="og:description" content="${newMeta.description}">`);
    expect(rewritten).toContain(`<meta property="og:image:alt" content="${newMeta.title} — EU Parliament Monitor">`);
    // JSON-LD
    expect(rewritten).toContain(`"headline": "${newMeta.title}"`);
    expect(rewritten).toContain(`"description": "${newMeta.description}"`);
    // Body preserved
    expect(rewritten).toContain(body);
    expect(rewritten).toContain('<h1>Legislative Procedures: European Parliament Monitor</h1>');
  });

  it('is idempotent — rewriting twice with the same metadata produces byte-identical output', () => {
    const html = buildHtml({
      title: 'Legislative Procedures: European Parliament Monitor',
      description: 'Recent legislative proposals.',
      body: `<p>${'x'.repeat(200)}</p>`,
    });
    const meta = { title: 'New Editorial Headline', description: 'New editorial description text used across the metadata surfaces.' };
    const once = rewriteHtml(html, meta);
    const twice = rewriteHtml(once, meta);
    expect(twice).toBe(once);
  });

  it('HTML-escapes special characters in new metadata values', () => {
    const html = buildHtml({
      title: 'x',
      description: 'x',
      body: '<p>prose</p>',
    });
    const meta = {
      title: 'A&B < C > D "quoted"',
      description: "It's a long description with <angle> & ampersand.",
    };
    const rewritten = rewriteHtml(html, meta);
    expect(rewritten).toContain('A&amp;B &lt; C &gt; D &quot;quoted&quot;');
    expect(rewritten).toContain('&lt;angle&gt; &amp; ampersand');
    // JSON-LD uses JSON escaping for the double-quote in the title.
    expect(rewritten).toContain('"headline": "A&B < C > D \\"quoted\\""');
  });

  it('preserves the original <head> structure for tags we do not rewrite', () => {
    const html = buildHtml({ title: 't', description: 'd', body: '<p>x</p>' });
    const rewritten = rewriteHtml(html, { title: 'NEW', description: 'NEW DESC' });
    expect(rewritten).toContain('<meta name="keywords" content="European Parliament, legislative">');
    expect(rewritten).toContain('<meta charset="UTF-8">');
  });

  it('correctly rewrites meta tags whose existing content contains apostrophes', () => {
    // Regression for a quote-awareness bug where `[^"']*` stopped at the
    // first single quote inside a double-quoted attribute.
    const html = buildHtml({
      title: "Parliament's Legislative Procedures",
      description: "The Parliament's term is entering year two with a busy legislative agenda and measurable acceleration across committees.",
      body: '<p>x</p>',
    });
    const rewritten = rewriteHtml(html, {
      title: 'New Headline',
      description: 'New description text.',
    });
    // All metadata surfaces carry the new value…
    expect(rewritten).toContain('<meta name="description" content="New description text.">');
    expect(rewritten).toContain('<meta property="og:title" content="New Headline">');
    expect(rewritten).toContain('<meta property="og:description" content="New description text.">');
    expect(rewritten).toContain('<meta name="twitter:title" content="New Headline">');
    expect(rewritten).toContain('<meta name="twitter:description" content="New description text.">');
    // …and the old description value survives ONLY in the untouched body,
    // not in any head tag (regex is quote-aware).
    expect(rewritten).not.toMatch(
      /<meta[^>]*name="description"[^>]*content="The Parliament/
    );
    expect(rewritten).not.toMatch(
      /<meta[^>]*property="og:description"[^>]*content="The Parliament/
    );
  });
});

describe('parseArgs — CLI argument parsing branches', async () => {
  const { parseArgs } = await import('../../scripts/backport-article-seo.js');

  it('returns defaults when no arguments are supplied', () => {
    const opts = parseArgs([]);
    expect(opts).toEqual({ apply: false, dir: 'news', only: null });
  });

  it('--apply sets apply=true', () => {
    expect(parseArgs(['--apply'])).toMatchObject({ apply: true });
  });

  it('--dry-run resets apply to false even after --apply', () => {
    expect(parseArgs(['--apply', '--dry-run'])).toMatchObject({ apply: false });
  });

  it('--dir consumes the next positional as a path', () => {
    expect(parseArgs(['--dir', 'other-news'])).toMatchObject({ dir: 'other-news' });
  });

  it('--dir without a value throws', () => {
    expect(() => parseArgs(['--dir'])).toThrow(/--dir expects a path/);
  });

  it('--only splits comma lists into a Set and trims whitespace', () => {
    const opts = parseArgs(['--only', 'breaking, motions , week-ahead']);
    expect(opts.only).toBeInstanceOf(Set);
    expect([...opts.only]).toEqual(['breaking', 'motions', 'week-ahead']);
  });

  it('--only without a value throws', () => {
    expect(() => parseArgs(['--only'])).toThrow(/--only expects a comma-separated list/);
  });

  it('unknown flags throw with a helpful message', () => {
    expect(() => parseArgs(['--nope'])).toThrow(/Unknown argument: --nope/);
  });
});

describe('listArticleFiles — filesystem walk skip branches', async () => {
  const { listArticleFiles } = await import('../../scripts/backport-article-seo.js');
  let tmp;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'backport-list-'));
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('returns the parsed entries for well-formed filenames only', () => {
    fs.writeFileSync(path.join(tmp, '2026-01-15-breaking-en.html'), '');
    fs.writeFileSync(path.join(tmp, '2026-01-15-breaking-sv.html'), '');
    // Non-HTML → skipped
    fs.writeFileSync(path.join(tmp, 'readme.md'), '');
    // Unparseable — no ISO-date prefix → skipped
    fs.writeFileSync(path.join(tmp, 'about-en.html'), '');
    // Unknown language suffix → skipped
    fs.writeFileSync(path.join(tmp, '2026-01-15-breaking-xx.html'), '');

    const files = listArticleFiles(tmp);
    const names = files.map((f) => f.name).sort();
    expect(names).toEqual(['2026-01-15-breaking-en.html', '2026-01-15-breaking-sv.html']);
    expect(files[0]).toMatchObject({
      lang: 'en',
      date: '2026-01-15',
      articleType: 'breaking',
    });
    expect(files[1]).toMatchObject({ lang: 'sv' });
  });
});

describe('chooseTitle — tier fallback branches', async () => {
  const { chooseTitle } = await import('../../scripts/backport-article-seo.js');
  const file = { articleType: 'breaking', date: '2026-04-20' };

  it('returns the body H1 when it is non-generic', () => {
    expect(chooseTitle('Banking Union Breakthrough', '', 'Template', file)).toBe(
      'Banking Union Breakthrough'
    );
  });

  it('falls back to prose first-sentence when the H1 is generic', () => {
    const prose = 'The plenary adopted three landmark directives in a single sitting.';
    const result = chooseTitle('Breaking — 2026-04-20', prose, 'Template', file);
    expect(result).toContain('plenary adopted three landmark directives');
  });

  it('falls back to the template when neither H1 nor prose are usable', () => {
    expect(chooseTitle('Breaking — 2026-04-20', '', 'Template Title', file)).toBe(
      'Template Title'
    );
  });

  it('skips a too-short first sentence and returns the template', () => {
    // 'OK.' → sentence length < 20 → falls through to template
    expect(chooseTitle('Breaking — 2026-04-20', 'OK.', 'Tpl', file)).toBe('Tpl');
  });
});

describe('isGenericBodyH1 — legacy + date-suffix patterns', async () => {
  const { isGenericBodyH1 } = await import('../../scripts/backport-article-seo.js');

  it('flags each known legacy-era title verbatim', () => {
    const legacy = [
      'Legislative Procedures: European Parliament Monitor',
      'EU Parliament Committee Activity Report',
      'EU Parliament Breaking',
      'EU Parliament Motions',
      'Plenary Votes & Resolutions',
      'Plenary Votes and Resolutions',
    ];
    for (const t of legacy) {
      expect(isGenericBodyH1(t, 'breaking', '2026-04-20')).toBe(true);
    }
  });

  it('flags legacy templates when they carry a suffix', () => {
    expect(
      isGenericBodyH1(
        'Legislative Procedures: European Parliament Monitor — Follow-up',
        'breaking',
        '2026-04-20'
      )
    ).toBe(true);
  });

  it('flags the "<Short-Phrase> — <ISO-date>" form even for run-suffixed types', () => {
    expect(isGenericBodyH1('Breaking — 2026-04-20', 'breaking-190', '2026-04-20')).toBe(
      true
    );
    expect(isGenericBodyH1('Week In Review - 2026-04-20', 'week-in-review', '2026-04-20')).toBe(
      true
    );
  });

  it('returns false for a genuinely editorial headline', () => {
    expect(
      isGenericBodyH1(
        'Banking Union Breakthrough and Anti-Corruption Landmark',
        'breaking',
        '2026-04-20'
      )
    ).toBe(false);
  });
});

describe('extractFirstSentence — boundary + cap branches', async () => {
  const { extractFirstSentence } = await import('../../scripts/backport-article-seo.js');

  it('returns the first sentence up to the first terminator', () => {
    expect(extractFirstSentence('Hello world. Another.')).toBe('Hello world.');
  });

  it('supports ! and ? as sentence terminators', () => {
    expect(extractFirstSentence('What now? Then this.')).toBe('What now?');
  });

  it('returns the whole prose when no terminator is present and within cap', () => {
    expect(extractFirstSentence('Short prose no terminator')).toBe(
      'Short prose no terminator'
    );
  });

  it('truncates long sentences with an ellipsis at word boundary', () => {
    const long =
      'The plenary adopted a comprehensive directive that reshapes banking supervision across the twenty seven member states of the European Union definitively.';
    const out = extractFirstSentence(long);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(120);
  });
});

describe('truncateUpto — boundary branches', async () => {
  const { truncateUpto } = await import('../../scripts/backport-article-seo.js');

  it('returns unchanged text when within cap', () => {
    expect(truncateUpto('short', 60)).toBe('short');
  });

  it('trims mid-word breaks to the last space', () => {
    const out = truncateUpto('this is a long sentence that needs truncation', 20);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(20);
    // Must not end mid-word
    expect(out).toMatch(/[A-Za-z]\S*…$|[A-Za-z]…$/);
  });

  it('falls through to raw slice when no word boundary is near the cap', () => {
    // One long word: no space in range → raw slice up to cap-1 + …
    const out = truncateUpto('abcdefghijklmnopqrstuvwxyz', 10);
    expect(out.endsWith('…')).toBe(true);
  });

  it('strips trailing punctuation before the ellipsis', () => {
    expect(truncateUpto('The plenary.', 8)).toMatch(/…$/);
  });
});

describe('pickLangEntry — safe map lookup', async () => {
  const { pickLangEntry } = await import('../../scripts/backport-article-seo.js');

  it('returns the language-specific entry when present', () => {
    const map = { en: { title: 'EN', description: 'ED' }, sv: { title: 'SV', description: 'SD' } };
    expect(pickLangEntry(map, 'sv')).toEqual({ title: 'SV', description: 'SD' });
  });

  it('falls back to en when the requested language is absent', () => {
    const map = { en: { title: 'EN', description: 'ED' } };
    expect(pickLangEntry(map, 'fr')).toEqual({ title: 'EN', description: 'ED' });
  });

  it('returns empty strings when neither lang nor en is present', () => {
    expect(pickLangEntry({}, 'sv')).toEqual({ title: '', description: '' });
  });

  it('is immune to prototype-pollution lookup keys', () => {
    // Object.getOwnPropertyDescriptor doesn't see inherited __proto__
    expect(pickLangEntry({ en: { title: 'EN', description: '' } }, '__proto__')).toEqual({
      title: 'EN',
      description: '',
    });
  });
});

describe('decodeEntities — named + numeric branches', async () => {
  const { decodeEntities } = await import('../../scripts/backport-article-seo.js');

  it('decodes common named entities', () => {
    expect(decodeEntities('&amp;&lt;&gt;&quot;&apos;&nbsp;')).toBe('&<>"\' ');
  });

  it('decodes typographic named entities', () => {
    expect(decodeEntities('&lsquo;a&rsquo; &ldquo;b&rdquo; &mdash;&ndash;&hellip;')).toBe(
      '\u2018a\u2019 \u201Cb\u201D \u2014\u2013\u2026'
    );
  });

  it('decodes diacritic named entities', () => {
    expect(decodeEntities('caf&eacute; &uuml;ber &ntilde;oise')).toBe('café über ñoise');
  });

  it('decodes decimal numeric entities', () => {
    expect(decodeEntities('A&#8212;B')).toBe('A\u2014B');
  });

  it('decodes hex numeric entities', () => {
    expect(decodeEntities('&#x2014; and &#x2013;')).toBe('\u2014 and \u2013');
  });

  it('leaves unknown entities verbatim', () => {
    expect(decodeEntities('&notAReal;')).toBe('&notAReal;');
  });
});

describe('extractBodySecondProse — selection branches', async () => {
  const { extractBodySecondProse } = await import('../../scripts/backport-article-seo.js');

  it('returns the second paragraph of substantial prose', () => {
    const html =
      '<article><p>Short.</p>' +
      '<p>First paragraph of substantial prose that well exceeds the eighty-character minimum length gate so it is selected.</p>' +
      '<p>Second paragraph of substantial prose also well over the minimum length gate that will be returned.</p>' +
      '</article>';
    expect(extractBodySecondProse(html)).toMatch(/Second paragraph/);
  });

  it('returns empty string when fewer than two paragraphs qualify', () => {
    const html = '<article><p>Too short.</p><p>Also short.</p></article>';
    expect(extractBodySecondProse(html)).toBe('');
  });

  it('ignores paragraphs inside the article header and nav', () => {
    const html =
      '<header class="article-header"><p>Metadata banner paragraph that is definitely over eighty characters long to test the header strip.</p></header>' +
      '<nav><p>Navigation paragraph that is also over eighty characters long to test the nav strip behaviour.</p></nav>' +
      '<article>' +
      '<p>Body paragraph one of substantial prose well over the eighty-character minimum gate for inclusion.</p>' +
      '<p>Body paragraph two of substantial prose well over the eighty-character minimum gate for inclusion.</p>' +
      '</article>';
    expect(extractBodySecondProse(html)).toMatch(/Body paragraph two/);
  });
});
