#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * scripts/backport-article-seo.js
 *
 * Backport editorial title + description into every rendered
 * `news/*-<lang>.html` file. Extracts the first editorial headline and
 * first strong prose paragraph from the article body itself, then
 * rewrites only the SEO-facing regions in `<head>` (and the JSON-LD
 * NewsArticle block) so each article carries a unique, content-reflective
 * headline and description in every language variant.
 *
 * Regions rewritten (body HTML is NEVER touched):
 *   - <title>…</title>
 *   - <meta name="description"         content="…">
 *   - <meta property="og:title"        content="…">
 *   - <meta property="og:description"  content="…">
 *   - <meta property="og:image:alt"    content="…">
 *   - <meta name="twitter:title"       content="…">
 *   - <meta name="twitter:description" content="…">
 *   - JSON-LD NewsArticle.headline
 *   - JSON-LD NewsArticle.description
 *
 * Idempotent: re-running over an already-backported file is a no-op —
 * `fs.writeFileSync` is only invoked when the computed byte sequence
 * differs from the on-disk file.
 *
 * Usage:
 *   node scripts/backport-article-seo.js               # dry-run (default)
 *   node scripts/backport-article-seo.js --apply       # write changes
 *   node scripts/backport-article-seo.js --apply \
 *        --dir news --only breaking,motions            # scope to subset
 *   node scripts/backport-article-seo.js --help
 */

import fs from 'fs';
import path from 'path';
import {
  extractStrongProseLine,
  isGenericHeading,
  resolveArticleMetadata,
} from '../scripts/aggregator/article-metadata.js';
import { ALL_LANGUAGES } from '../scripts/constants/language-core.js';

/** Maximum backported `<title>` length (matches resolver TITLE_MAX_LENGTH). */
const TITLE_CAP = 140;
/** Maximum backported `<meta description>` length. */
const DESC_CAP = 300;

/** Regex to match one article-file filename. Captures slug + lang. */
const FILE_NAME_RE = /^(?<slug>\d{4}-\d{2}-\d{2}-[\w.-]+?)-(?<lang>[a-z]{2})\.html$/;

/**
 * Parse CLI arguments. Supports `--apply`, `--dry-run` (default),
 * `--dir <path>`, `--only <slug1,slug2,…>`, `--help`.
 *
 * @param {readonly string[]} argv - Argument vector (excluding node+script)
 * @returns {{apply: boolean, dir: string, only: Set<string> | null}}
 */
function parseArgs(argv) {
  const opts = { apply: false, dir: 'news', only: null };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    switch (flag) {
      case '--apply':
        opts.apply = true;
        break;
      case '--dry-run':
        opts.apply = false;
        break;
      case '--dir': {
        const value = argv[++i];
        if (!value) throw new Error('--dir expects a path');
        opts.dir = value;
        break;
      }
      case '--only': {
        const value = argv[++i];
        if (!value) throw new Error('--only expects a comma-separated list');
        opts.only = new Set(value.split(',').map((s) => s.trim()).filter(Boolean));
        break;
      }
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      // eslint-disable-next-line no-fallthrough
      default:
        throw new Error(`Unknown argument: ${flag}`);
    }
  }
  return opts;
}

/**
 * Print CLI help text to stdout and exit.
 */
function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/backport-article-seo.js [options]',
      '',
      'Options:',
      '  --apply               Write changes (default: dry-run)',
      '  --dry-run             Summarise changes without writing (default)',
      '  --dir <path>          News directory (default: news)',
      '  --only <a,b,c>        Only process files whose articleType is in the list',
      '  --help, -h            Show this help',
      '',
      'Idempotent: re-running over a backported file is a no-op.',
      '',
    ].join('\n')
  );
}

/**
 * List every `news/*-<lang>.html` file in the supplied directory.
 * Parsed filename fields are returned alongside the absolute path.
 *
 * @param {string} dir - News directory path
 * @returns {Array<{abs: string, name: string, slug: string, lang: string,
 *                   date: string, articleType: string}>}
 */
function listArticleFiles(dir) {
  const entries = fs.readdirSync(dir);
  const out = [];
  for (const name of entries) {
    if (!name.endsWith('.html')) continue;
    const match = FILE_NAME_RE.exec(name);
    if (!match || !match.groups) continue;
    const { slug, lang } = match.groups;
    if (!ALL_LANGUAGES.includes(lang)) continue;
    const dateMatch = /^(\d{4}-\d{2}-\d{2})-(.+)$/.exec(slug);
    if (!dateMatch) continue;
    out.push({
      abs: path.join(dir, name),
      name,
      slug,
      lang,
      date: dateMatch[1],
      articleType: dateMatch[2],
    });
  }
  out.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return out;
}

/** Minimal named-entity decoding map (the common cases that appear in
 * article prose). Numeric entities (`&#\d+;` and `&#x[0-9a-f]+;`) are
 * handled separately below. */
const NAMED_ENTITIES = new Map([
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
  ['nbsp', ' '],
  ['rsquo', '\u2019'],
  ['lsquo', '\u2018'],
  ['ldquo', '\u201C'],
  ['rdquo', '\u201D'],
  ['ndash', '\u2013'],
  ['mdash', '\u2014'],
  ['hellip', '\u2026'],
  ['laquo', '\u00AB'],
  ['raquo', '\u00BB'],
  ['eacute', '\u00E9'],
  ['Eacute', '\u00C9'],
  ['iacute', '\u00ED'],
  ['Iacute', '\u00CD'],
  ['oacute', '\u00F3'],
  ['Oacute', '\u00D3'],
  ['uacute', '\u00FA'],
  ['Uacute', '\u00DA'],
  ['aacute', '\u00E1'],
  ['Aacute', '\u00C1'],
  ['ntilde', '\u00F1'],
  ['Ntilde', '\u00D1'],
  ['agrave', '\u00E0'],
  ['egrave', '\u00E8'],
  ['uuml', '\u00FC'],
  ['Uuml', '\u00DC'],
  ['ouml', '\u00F6'],
  ['Ouml', '\u00D6'],
  ['auml', '\u00E4'],
  ['Auml', '\u00C4'],
  ['szlig', '\u00DF'],
  ['ccedil', '\u00E7'],
  ['Ccedil', '\u00C7'],
  ['copy', '\u00A9'],
  ['reg', '\u00AE'],
  ['trade', '\u2122'],
  ['euro', '\u20AC'],
  ['pound', '\u00A3'],
  ['deg', '\u00B0'],
]);

/**
 * Decode the handful of HTML entities that the article generator emits
 * in attribute values and body text so the resolver sees plain text.
 * Handles:
 *   - Named entities in {@link NAMED_ENTITIES}
 *   - Decimal numeric entities `&#\d+;`
 *   - Hex numeric entities `&#x[0-9a-f]+;`
 *
 * Unknown entities are left verbatim so we never silently swallow
 * structure we don't recognise.
 *
 * @param {string} text - Text that may contain encoded entities
 * @returns {string} Decoded text
 */
function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_m, n) => {
      const code = Number(n);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _m;
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, n) => {
      const code = parseInt(n, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _m;
    })
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (orig, name) => {
      const resolved = NAMED_ENTITIES.get(name);
      return typeof resolved === 'string' ? resolved : orig;
    });
}

/**
 * Encode text for safe inclusion in an HTML attribute value.
 *
 * @param {string} text - Raw text
 * @returns {string} Attribute-safe HTML
 */
function encodeAttribute(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Encode text for safe inclusion in element body (between `<title>` tags
 * or the page body). Identical to {@link encodeAttribute} for our purposes.
 *
 * @param {string} text - Raw text
 * @returns {string} HTML-body-safe form
 */
function encodeBody(text) {
  return encodeAttribute(text);
}

/**
 * Encode text for safe inclusion in a JSON string literal that lives
 * inside a `<script type="application/ld+json">` block.
 *
 * @param {string} text - Raw text
 * @returns {string} JSON-safe form
 */
function encodeJson(text) {
  return JSON.stringify(text).slice(1, -1); // drop surrounding quotes
}

/**
 * Return the slice of HTML that sits inside the first `<article>…</article>`
 * element (or the whole document when no `<article>` is present, which
 * never happens for our generated output but keeps the script robust).
 *
 * @param {string} html - Full HTML document
 * @returns {string} Article body HTML
 */
function sliceArticleBody(html) {
  const start = html.indexOf('<article');
  if (start < 0) return html;
  const end = html.indexOf('</article>', start);
  if (end < 0) return html.slice(start);
  return html.slice(start, end);
}

/**
 * Strip all HTML tags, decode entities, and collapse whitespace so the
 * remaining string can be analysed as plain prose.
 *
 * @param {string} html - HTML fragment
 * @returns {string} Plain text
 */
function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/**
 * Extract the first `<h1>` text from the article body, or an empty
 * string when none is present.
 *
 * @param {string} articleHtml - Sliced article HTML
 * @returns {string} First H1 text
 */
function extractBodyH1(articleHtml) {
  const match = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(articleHtml);
  return match ? stripTags(match[1]) : '';
}

/**
 * Regex of paragraph-prefix patterns that identify aggregator-style
 * metadata banners masquerading as prose. Such paragraphs are rejected
 * by {@link extractBodyFirstProse} / {@link extractBodySecondProse}
 * so they never leak into `<title>` or `<meta description>`.
 *
 * Covered prefixes:
 *   - Pipeline-status rows (`Pipeline Health`, `Throughput Rate`, …)
 *   - Analyst-stamp lines (`Analysis Date`, `Classification Date`, …)
 *   - Run-metadata banners (`Run : 187`, `Run 190 contribution :`, …)
 *   - ICD-203 synthesis boilerplate (`BLUF (ICD-203) :`,
 *     `Composition layer :`, `Purpose :`)
 *   - Window / Series / Date / Mode lede-tombstones
 *     (`Date : Monday 2026-04-20 …`, `Window : Q1 2026`)
 *   - End-of-file markers (`End of synthesis.`)
 */
const METADATA_PROSE_PREFIX = new RegExp(
  '^(' +
    [
      'pipeline health',
      'throughput rate',
      'gate result',
      'analysis date',
      'classification\\s*(date)?\\s*:',
      'confidence\\s*:',
      'analysis owner',
      'data sources',
      'parliamentary status',
      'parliamentary term',
      'run\\s*[:\\d]',
      'run\\s+\\d+\\s+(contribution|marks)',
      'bluf\\s*\\(icd',
      'composition layer',
      'purpose\\s*:',
      'window\\s*:',
      'series\\s*(run)?\\s*:',
      'date\\s*:\\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|\\d)',
      'mode\\s*:',
      'type\\s*:',
      'generated\\s*:',
      'end of (synthesis|analysis|briefing)',
    ].join('|') +
    ')',
  'i'
);

/**
 * Extract the first "strong" `<p>` text from the article body. A strong
 * paragraph is at least 80 characters of plain text after stripping tags
 * — enough to serve as a meta description. Paragraphs inside `<nav>`,
 * `<header class="article-header">` metadata spans, and the article-meta
 * list are skipped so the picked text is real editorial prose. Paragraphs
 * whose opening matches {@link METADATA_PROSE_PREFIX} are also skipped —
 * these are aggregator-style metadata banners that look like prose but
 * carry no editorial content.
 *
 * @param {string} articleHtml - Sliced article HTML
 * @returns {string} First strong prose paragraph, or empty string
 */
function extractBodyFirstProse(articleHtml) {
  // Skip `<header class="article-header">` blocks so we don't harvest
  // the static article subtitle or the meta-spans row.
  const withoutHeader = articleHtml.replace(
    /<header\b[^>]*class=["'][^"']*article-header[^"']*["'][^>]*>[\s\S]*?<\/header>/gi,
    ''
  );
  const withoutNav = withoutHeader.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '');

  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = re.exec(withoutNav)) !== null) {
    const text = stripTags(match[1]);
    if (text.length < 80) continue;
    if (METADATA_PROSE_PREFIX.test(text)) continue;
    return text;
  }
  return '';
}

/**
 * Derive a `{title, description}` pair for one HTML file, following this
 * priority ladder:
 *
 * 1. If a manifest.json for the run exists (aggregator cohort), use the
 *    full {@link resolveArticleMetadata} pipeline — this picks up manifest
 *    overrides and artefact H1s.
 * 2. Otherwise (legacy cohort), derive from the rendered body:
 *    - Title = non-generic `<h1>` from the body, else first sentence of
 *      the first strong prose paragraph.
 *    - Description = first strong prose paragraph (full, not the same
 *      first-sentence used for the title — so title and description
 *      carry complementary information).
 * 3. When step 2 yields nothing usable, fall back to the template tier
 *    in {@link resolveArticleMetadata}.
 *
 * @param {{abs: string, name: string, slug: string, lang: string,
 *          date: string, articleType: string}} file - Parsed article-file
 * @param {string} html - Full HTML document
 * @returns {{title: string, description: string}}
 */
function deriveMetadataForFile(file, html) {
  const articleBody = sliceArticleBody(html);
  const bodyH1 = extractBodyH1(articleBody);
  const bodyProse = extractBodyFirstProse(articleBody);
  const bodySecondaryProse = extractBodySecondProse(articleBody);

  // Try to extract committee codes from the body H1 so the template
  // fallback for `committee-reports` renders realistic abbreviations
  // (`ENVI, ECON, AFET, LIBE, AGRI`) instead of the placeholder
  // `Main Committees`. This keeps the localized template consistent
  // with the legacy format even when the manifest is missing.
  const committee = extractCommitteeCodes(bodyH1) || extractCommitteeCodes(bodyProse);

  const resolved = resolveArticleMetadata({
    articleType: file.articleType,
    date: file.date,
    markdown: buildSyntheticMarkdown(bodyH1, bodyProse),
    manifest: committee ? { committee } : undefined,
  });
  const templateEntry = pickLangEntry(resolved, file.lang);

  if (file.lang !== 'en') {
    // NON-ENGLISH files: The article body may be in a different language
    // than the file claims to be — legacy files have localized H1/chrome
    // but English body prose; aggregator PR#1404 files have English H1
    // AND English body in every language variant. We accept body content
    // only when it is plausibly in the file's language, and fall back to
    // the localized template otherwise. This guarantees every non-EN
    // variant's `<title>` / `<meta description>` is in the correct locale.
    const h1IsUsable =
      bodyH1 &&
      !isGenericBodyH1(bodyH1, file.articleType, file.date) &&
      isTextPlausiblyInLang(bodyH1, file.lang);
    const proseIsUsable = bodyProse && isTextPlausiblyInLang(bodyProse, file.lang);
    const secondaryIsUsable =
      bodySecondaryProse && isTextPlausiblyInLang(bodySecondaryProse, file.lang);

    const title = h1IsUsable ? bodyH1 : templateEntry.title;
    // Description: prefer a locale-matching prose paragraph; fall back
    // to the localized template's subtitle. When the title came from
    // the H1, try the first prose as description; otherwise use the
    // complementary second paragraph.
    const descSource = h1IsUsable ? (proseIsUsable ? bodyProse : '') : secondaryIsUsable
      ? bodySecondaryProse
      : proseIsUsable
      ? bodyProse
      : '';
    const description = descSource || templateEntry.description;

    return {
      title: truncateUpto(title, TITLE_CAP),
      description: truncateUpto(description, DESC_CAP),
    };
  }

  // ENGLISH path — mine the body freely.
  const title = chooseTitle(bodyH1, bodyProse, templateEntry.title, file);
  const titleCameFromProse =
    (!bodyH1 || isGenericBodyH1(bodyH1, file.articleType, file.date)) &&
    bodyProse &&
    title !== templateEntry.title;
  const preferredDesc = titleCameFromProse && bodySecondaryProse ? bodySecondaryProse : bodyProse;
  const description = preferredDesc
    ? truncateUpto(preferredDesc, DESC_CAP)
    : templateEntry.description;

  return {
    title: truncateUpto(title, TITLE_CAP),
    description: truncateUpto(description, DESC_CAP),
  };
}

/** Unicode-range / substring signatures per language. */
const LANG_SCRIPT_RE = Object.freeze({
  ar: /[\u0600-\u06FF]/,
  he: /[\u0590-\u05FF]/,
  ja: /[\u3040-\u309F\u30A0-\u30FF]/,
  ko: /[\uAC00-\uD7AF]/,
  zh: /[\u4E00-\u9FFF]/,
});

/** Latin-script language signature characters that are uncommon in English. */
const LANG_DIACRITIC_RE = Object.freeze({
  sv: /[åäöÅÄÖ]/,
  da: /[æøåÆØÅ]/,
  no: /[æøåÆØÅ]/,
  fi: /[äöÄÖ]/,
  de: /[äöüßÄÖÜ]/,
  fr: /[àâçéèêëîïôùûüÀÂÇÉÈÊËÎÏÔÙÛÜœŒ]/,
  es: /[áéíñóúü¡¿ÁÉÍÑÓÚÜ]/,
  nl: /[áéíóúëïöüÁÉÍÓÚËÏÖÜ]/,
});

/**
 * Per-language short-word signatures that are strong enough by themselves
 * to accept a headline or sentence as "plausibly in that language" even
 * when the text has no diacritical marks.
 *
 * Matched case-insensitively with word boundaries. Values are deliberately
 * SHORT lists of very-common function words / particles that either do
 * not appear in English at all or would be vanishingly unusual. Words
 * that mean something valid in English (e.g. "for", "med", "and",
 * "with", "en", "in") are NOT included — they would false-positive on
 * English prose that happens to be rendered under a non-EN filename.
 */
const LANG_WORD_RE = Object.freeze({
  // Scandi/Germanic/Romance "parlament"/"parlement"/"parlamento" root is
  // a RELIABLE non-English signature — English spells it "parliament"
  // (with an `i` between `l` and `a`), which the regex below does NOT
  // match. Compound forms (`parlamentets`, `europaparlamentet`,
  // `parlamentarisch`) are captured by the trailing `\w*`.
  sv: /\b(och|är|att|från|genom|också|eller|mellan|europaparlament\w*|parlament\w*|europeiska|sverige|svenska|utskott\w*)\b/i,
  da: /\b(og|af|ikke|også|gennem|eller|europaparlament\w*|parlament\w*|danmark|dansk|udvalg\w*|valgperiode\w*)\b/i,
  no: /\b(og|ikke|også|gjennom|eller|europaparlament\w*|parlament\w*|norge|norsk|komite\w*|valgperiode\w*)\b/i,
  fi: /\b(ja|on|ovat|tai|mutta|myös|parlament\w*|valiokunt\w*|suomen|eurooppalainen|eurooppa|vaalikaude\w*)\b/i,
  de: /\b(und|ist|nicht|auch|durch|über|für|parlament\w*|deutschland|deutsche|europäisch\w*|ausschuss\w*|woche|monat)\b/i,
  fr: /\b(et|pour|avec|sur|dans|les|parlement\w*|européen\w*|française|france|comité|commission|semaine|mois)\b/i,
  es: /\b(el|la|los|las|con|para|por|según|parlamento\w*|europeo|europea|española|españa|comisión|comité|semana|mes)\b/i,
  nl: /\b(het|van|voor|met|door|naar|over|parlement\w*|europees|europese|nederland|commissie|comité|week|maand)\b/i,
});

/**
 * Known EP committee abbreviations. Used by {@link extractCommitteeCodes}
 * to pull the committee list out of a `committee-reports` body H1 so the
 * localized template renders the real abbreviations rather than the
 * English placeholder `Main Committees`.
 */
const COMMITTEE_CODES = new Set([
  'AFET', 'AGRI', 'BUDG', 'CONT', 'CULT', 'DEVE', 'DROI', 'ECON', 'EMPL',
  'ENVI', 'FEMM', 'IMCO', 'INTA', 'ITRE', 'JURI', 'LIBE', 'PECH', 'PETI',
  'REGI', 'SEDE', 'TRAN', 'BECA', 'INGE', 'AIDA',
]);

/**
 * Scan a chunk of text for a comma-separated sequence of 3–4 letter
 * committee abbreviations. Returns the original comma-separated list
 * when at least two valid codes appear in order, otherwise empty string.
 *
 * @param {string} text - Text (H1 or paragraph) to scan
 * @returns {string} `ENVI, ECON, AFET, LIBE, AGRI`-style list or empty
 */
export function extractCommitteeCodes(text) {
  if (!text) return '';
  const tokens = text.match(/\b[A-Z]{3,4}\b/g);
  if (!tokens) return '';
  const valid = tokens.filter((t) => COMMITTEE_CODES.has(t));
  if (valid.length < 2) return '';
  // De-duplicate while preserving first-occurrence order.
  const seen = new Set();
  const ordered = [];
  for (const v of valid) {
    if (seen.has(v)) continue;
    seen.add(v);
    ordered.push(v);
  }
  return ordered.join(', ');
}

/**
 * Decide whether a short text (headline or paragraph) is plausibly in
 * {@link lang}. For non-Latin languages, requires at least one
 * script-block character. For Latin non-English languages, requires
 * either a locale-signature diacritic or a locale-typical function word
 * (Swedish `och`, Danish `og`, German `und`, French `et`, …). English
 * text is accepted when the input is largely ASCII without non-Latin
 * script markers.
 *
 * The function is deliberately conservative — it exists only to keep
 * wrong-language content out of `<title>` / `<meta description>` during
 * backport, not to perform general language identification.
 *
 * @param {string} text - Candidate text
 * @param {string} lang - Target language code
 * @returns {boolean} Whether {@link text} is plausibly in {@link lang}
 */
export function isTextPlausiblyInLang(text, lang) {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;

  const scriptDesc = Object.getOwnPropertyDescriptor(LANG_SCRIPT_RE, lang);
  if (scriptDesc?.value) {
    // Non-Latin language — require its script.
    return scriptDesc.value.test(trimmed);
  }

  // For English, reject text dominated by non-Latin scripts.
  if (lang === 'en') {
    for (const key of Object.keys(LANG_SCRIPT_RE)) {
      const re = Object.getOwnPropertyDescriptor(LANG_SCRIPT_RE, key)?.value;
      if (re?.test(trimmed)) return false;
    }
    return true;
  }

  // Latin non-English: require either a locale-signature diacritic OR a
  // locale-typical function word. Both are deliberately built from words
  // that do NOT appear in English, so English prose rendered under a
  // non-EN filename (aggregator regression) fails both checks and is
  // rejected — forcing the resolver back to the localized template tier.
  const diacriticRe = Object.getOwnPropertyDescriptor(LANG_DIACRITIC_RE, lang)?.value;
  if (diacriticRe?.test(trimmed)) return true;
  const wordRe = Object.getOwnPropertyDescriptor(LANG_WORD_RE, lang)?.value;
  if (wordRe?.test(trimmed)) return true;
  return false;
}

/**
 * Extract the second "strong" `<p>` from the article body, used as the
 * meta description when the title was derived from the first paragraph's
 * opening sentence (see {@link deriveMetadataForFile}). Skips the same
 * header/nav regions and metadata-banner paragraphs as
 * {@link extractBodyFirstProse}.
 *
 * @param {string} articleHtml - Sliced article HTML
 * @returns {string} Second strong prose paragraph, or empty string
 */
function extractBodySecondProse(articleHtml) {
  const withoutHeader = articleHtml.replace(
    /<header\b[^>]*class=["'][^"']*article-header[^"']*["'][^>]*>[\s\S]*?<\/header>/gi,
    ''
  );
  const withoutNav = withoutHeader.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '');

  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  const hits = [];
  let match;
  while ((match = re.exec(withoutNav)) !== null) {
    const text = stripTags(match[1]);
    if (text.length < 80) continue;
    if (METADATA_PROSE_PREFIX.test(text)) continue;
    hits.push(text);
    if (hits.length >= 2) break;
  }
  return hits[1] ?? '';
}

/**
 * Build a minimal synthetic Markdown document from the body-derived
 * highlights so {@link resolveArticleMetadata} can score them against
 * the generic-heading detector and template fallbacks.
 *
 * @param {string} h1 - First body H1 (possibly empty)
 * @param {string} prose - First strong body paragraph (possibly empty)
 * @returns {string} Markdown
 */
function buildSyntheticMarkdown(h1, prose) {
  const lines = [];
  if (h1) lines.push(`# ${h1}`);
  lines.push('');
  if (prose) lines.push(prose);
  return lines.join('\n');
}

/**
 * Choose the final title text. Prefers a non-generic body H1. When the
 * H1 is generic (e.g. legacy "Legislative Procedures: European Parliament
 * Monitor"), falls back to the first sentence of body prose — this is
 * the single biggest SEO win for legacy files.
 *
 * @param {string} bodyH1 - First H1 from the body
 * @param {string} bodyProse - First strong prose paragraph
 * @param {string} templateTitle - Template-tier fallback title
 * @param {{articleType: string, date: string}} file - Parsed file info
 * @returns {string} Final title
 */
function chooseTitle(bodyH1, bodyProse, templateTitle, file) {
  if (bodyH1 && !isGenericBodyH1(bodyH1, file.articleType, file.date)) {
    return bodyH1;
  }
  if (bodyProse) {
    const firstSentence = extractFirstSentence(bodyProse);
    if (firstSentence.length >= 20) return firstSentence;
  }
  return templateTitle;
}

/**
 * Extend {@link isGenericHeading} with a few extra patterns specific to
 * legacy-era titles (pre-aggregator pipeline) so those files get
 * replaced during backport. Also catches the pure `<Title-Case-Phrase>
 * — <ISO-date>` form that the default aggregator title emits when the
 * articleType slug has a run suffix (e.g. `breaking-190`) that
 * {@link isGenericHeading} can't directly dehumanise.
 *
 * @param {string} h1 - Plain-text H1
 * @param {string} articleType - Article type slug
 * @param {string} date - ISO date
 * @returns {boolean} `true` when the H1 is generic
 */
function isGenericBodyH1(h1, articleType, date) {
  if (isGenericHeading(h1, articleType, date)) return true;
  const normalized = h1.trim();
  const legacyTemplates = [
    'Legislative Procedures: European Parliament Monitor',
    'EU Parliament Committee Activity Report',
    'EU Parliament Breaking',
    'EU Parliament Motions',
    'Plenary Votes & Resolutions',
    'Plenary Votes and Resolutions',
  ];
  for (const t of legacyTemplates) {
    if (normalized === t || normalized.startsWith(`${t} `) || normalized.startsWith(`${t}:`)) {
      return true;
    }
  }
  // Pure `<Short-Phrase> — <ISO-date>` / `<Short-Phrase> - <ISO-date>` form
  // with at most 3 title-case words is the aggregator's default title —
  // always generic regardless of the article type slug (which may carry
  // a run-number suffix like `breaking-190` that confuses
  // isGenericHeading).
  if (/^[A-Z][A-Za-z\-]*(?: [A-Z][A-Za-z\-]*){0,2}\s*[—-]\s*\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return true;
  }
  return false;
}

/**
 * Return the first sentence of the supplied prose paragraph, capped at
 * 120 characters, avoiding mid-word breaks.
 *
 * @param {string} prose - Paragraph text
 * @returns {string} First sentence
 */
function extractFirstSentence(prose) {
  const match = /^([^.!?]+[.!?])(\s|$)/.exec(prose);
  const sentence = match ? match[1].trim() : prose;
  if (sentence.length <= 120) return sentence;
  const cut = sentence.slice(0, 117);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : 117)}…`;
}

/**
 * Clamp a string to `cap` characters, trimming mid-word breaks and
 * appending an ellipsis. Identical in spirit to the resolver's
 * `truncateTitle` / `truncateDescription` but parameterised so one
 * helper covers both.
 *
 * @param {string} text - Raw text
 * @param {number} cap - Maximum output length
 * @returns {string} Clamped text
 */
function truncateUpto(text, cap) {
  const trimmed = text.trim();
  if (trimmed.length <= cap) return trimmed;
  const cut = trimmed.slice(0, cap - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const safe = lastSpace > cap - 40 ? cut.slice(0, lastSpace) : cut;
  return `${safe.replace(/[.,;:—-]+$/, '')}…`;
}

/**
 * Read one entry from a {@link ResolvedMetadata}-shaped object via
 * `Object.getOwnPropertyDescriptor` to avoid ESLint object-injection
 * warnings.
 *
 * @param {object} map - Resolver output
 * @param {string} lang - Target language code
 * @returns {{title: string, description: string}}
 */
function pickLangEntry(map, lang) {
  const descriptor = Object.getOwnPropertyDescriptor(map, lang);
  if (descriptor?.value) return descriptor.value;
  const en = Object.getOwnPropertyDescriptor(map, 'en')?.value;
  return en ?? { title: '', description: '' };
}

/**
 * Rewrite the SEO-facing regions of one HTML document using the supplied
 * `{title, description}` pair. Returns the new document text; callers
 * compare it to the on-disk bytes to decide whether to write.
 *
 * @param {string} html - Original HTML document
 * @param {{title: string, description: string}} metadata - New metadata
 * @returns {string} Rewritten HTML document
 */
function rewriteHtml(html, metadata) {
  const { title, description } = metadata;
  const attrTitle = encodeAttribute(title);
  const attrDesc = encodeAttribute(description);
  const bodyTitle = encodeBody(title);
  const ogImageAlt = `${attrTitle} — EU Parliament Monitor`;

  let out = html;

  // <title>…</title>
  out = out.replace(
    /<title\b[^>]*>[\s\S]*?<\/title>/i,
    `<title>${bodyTitle} — EU Parliament Monitor</title>`
  );

  // <meta name="description"|"twitter:title"|"twitter:description">
  out = replaceNamedMeta(out, 'description', attrDesc);
  out = replaceNamedMeta(out, 'twitter:title', attrTitle);
  out = replaceNamedMeta(out, 'twitter:description', attrDesc);
  out = replaceNamedMeta(out, 'twitter:image:alt', ogImageAlt);

  // <meta property="og:title"|"og:description"|"og:image:alt">
  out = replacePropertyMeta(out, 'og:title', attrTitle);
  out = replacePropertyMeta(out, 'og:description', attrDesc);
  out = replacePropertyMeta(out, 'og:image:alt', ogImageAlt);

  // JSON-LD headline + description (within <script type="application/ld+json">)
  out = rewriteJsonLd(out, title, description);

  return out;
}

/**
 * Replace `<meta name="<name>" content="…">` in-place. When absent the
 * document is returned unchanged — we never inject new tags during
 * backport so legacy files retain their original meta-tag order.
 *
 * The `content` match is quote-aware: the content of a double-quoted
 * attribute value may contain apostrophes (e.g. `Parliament's`), so the
 * patterns distinguish `"…"` (content allows `'` and `&quot;`-encoded
 * `"`) from `'…'` (content allows `"` and `&#39;`-encoded `'`).
 *
 * @param {string} html - HTML document
 * @param {string} name - Meta `name` attribute value
 * @param {string} value - New `content` value (already HTML-encoded)
 * @returns {string} Rewritten document
 */
function replaceNamedMeta(html, name, value) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    // name=… content="…"
    new RegExp(`<meta\\s+name="${escaped}"\\s+content="[^"]*"\\s*/?>`, 'gi'),
    // name=… content='…'
    new RegExp(`<meta\\s+name='${escaped}'\\s+content='[^']*'\\s*/?>`, 'gi'),
    // content="…" name=…
    new RegExp(`<meta\\s+content="[^"]*"\\s+name="${escaped}"\\s*/?>`, 'gi'),
    // content='…' name=…
    new RegExp(`<meta\\s+content='[^']*'\\s+name='${escaped}'\\s*/?>`, 'gi'),
  ];
  let out = html;
  for (const re of patterns) {
    out = out.replace(re, `<meta name="${name}" content="${value}">`);
  }
  return out;
}

/**
 * As {@link replaceNamedMeta}, but for `<meta property="…">` tags.
 *
 * @param {string} html - HTML document
 * @param {string} property - Meta `property` attribute value
 * @param {string} value - New `content` value (already HTML-encoded)
 * @returns {string} Rewritten document
 */
function replacePropertyMeta(html, property, value) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta\\s+property="${escaped}"\\s+content="[^"]*"\\s*/?>`, 'gi'),
    new RegExp(`<meta\\s+property='${escaped}'\\s+content='[^']*'\\s*/?>`, 'gi'),
    new RegExp(`<meta\\s+content="[^"]*"\\s+property="${escaped}"\\s*/?>`, 'gi'),
    new RegExp(`<meta\\s+content='[^']*'\\s+property='${escaped}'\\s*/?>`, 'gi'),
  ];
  let out = html;
  for (const re of patterns) {
    out = out.replace(re, `<meta property="${property}" content="${value}">`);
  }
  return out;
}

/**
 * Rewrite the `headline` and `description` fields of the first JSON-LD
 * `<script type="application/ld+json">` block. Uses string-level regex
 * replacement on the raw JSON text rather than round-tripping through
 * `JSON.parse`, so any whitespace or key ordering in the original file
 * is preserved exactly outside the rewritten values.
 *
 * @param {string} html - HTML document
 * @param {string} title - New headline value (plain text)
 * @param {string} description - New description value (plain text)
 * @returns {string} Rewritten document
 */
function rewriteJsonLd(html, title, description) {
  const blockRe = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i;
  const match = blockRe.exec(html);
  if (!match) return html;
  let block = match[1];
  block = block.replace(
    /("headline"\s*:\s*)"(?:[^"\\]|\\.)*"/,
    `$1"${encodeJson(title)}"`
  );
  block = block.replace(
    /("description"\s*:\s*)"(?:[^"\\]|\\.)*"/,
    `$1"${encodeJson(description)}"`
  );
  return html.replace(
    blockRe,
    `<script type="application/ld+json">${block}</script>`
  );
}

/**
 * Read the current `<title>` text from a document, with site-suffix
 * stripped, for change-detection reporting.
 *
 * @param {string} html - HTML document
 * @returns {string} Existing title text
 */
function readCurrentTitle(html) {
  const match = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!match) return '';
  const raw = decodeEntities(match[1]).trim();
  return raw
    .replace(/\s*—\s*EU Parliament Monitor\s*$/, '')
    .replace(/\s*\|\s*EU Parliament Monitor\s*$/, '')
    .trim();
}

/**
 * Read the current `<meta name="description">` text from a document.
 *
 * @param {string} html - HTML document
 * @returns {string} Existing description text
 */
function readCurrentDescription(html) {
  const match = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i.exec(html);
  return match ? decodeEntities(match[1]).trim() : '';
}

/**
 * Main entry point. Iterates files, computes metadata, prints a
 * per-article diff summary, and (in apply mode) writes files whose
 * content has changed.
 *
 * @param {readonly string[]} argv - Argument vector
 * @returns {Promise<void>}
 */
async function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  const absDir = path.resolve(opts.dir);
  if (!fs.existsSync(absDir)) {
    throw new Error(`News directory does not exist: ${absDir}`);
  }

  const files = listArticleFiles(absDir);
  const filtered = opts.only
    ? files.filter((f) => opts.only.has(f.articleType))
    : files;

  const summary = { scanned: 0, changed: 0, skipped: 0, errors: 0 };
  /** @type {Map<string, {changed: number, scanned: number}>} */
  const byType = new Map();
  /** @type {Array<{name: string, before: string, after: string}>} */
  const sampleChanges = [];

  for (const file of filtered) {
    summary.scanned++;
    const bucket = byType.get(file.articleType) ?? { changed: 0, scanned: 0 };
    bucket.scanned++;
    byType.set(file.articleType, bucket);
    try {
      const original = fs.readFileSync(file.abs, 'utf8');
      const metadata = deriveMetadataForFile(file, original);
      const before = readCurrentTitle(original);
      const beforeDesc = readCurrentDescription(original);
      const rewritten = rewriteHtml(original, metadata);
      if (rewritten !== original) {
        summary.changed++;
        bucket.changed++;
        if (sampleChanges.length < 12 && before !== metadata.title) {
          sampleChanges.push({
            name: file.name,
            before: `${before} | ${beforeDesc.slice(0, 60)}…`,
            after: `${metadata.title} | ${metadata.description.slice(0, 60)}…`,
          });
        }
        if (opts.apply) fs.writeFileSync(file.abs, rewritten, 'utf8');
      } else {
        summary.skipped++;
      }
    } catch (err) {
      summary.errors++;
      process.stderr.write(`ERROR ${file.name}: ${(err && err.message) || err}\n`);
    }
  }

  process.stdout.write(`\n=== Backport ${opts.apply ? 'APPLY' : 'DRY-RUN'} ===\n`);
  process.stdout.write(
    `Scanned: ${summary.scanned}  Changed: ${summary.changed}  Unchanged: ${summary.skipped}  Errors: ${summary.errors}\n\n`
  );
  process.stdout.write('By article type:\n');
  const typeKeys = [...byType.keys()].sort();
  for (const type of typeKeys) {
    const row = byType.get(type);
    process.stdout.write(`  ${type.padEnd(20)} changed ${row.changed.toString().padStart(4)}/${row.scanned}\n`);
  }

  if (sampleChanges.length > 0) {
    process.stdout.write('\nSample diffs (up to 12):\n');
    for (const entry of sampleChanges) {
      process.stdout.write(`  ${entry.name}\n`);
      process.stdout.write(`    BEFORE: ${entry.before}\n`);
      process.stdout.write(`    AFTER : ${entry.after}\n`);
    }
  }

  if (!opts.apply && summary.changed > 0) {
    process.stdout.write('\nDRY-RUN: pass --apply to write these changes.\n');
  }
}

// Run when invoked directly (ESM-equivalent of `require.main === module`).
const invokedUrl = import.meta.url;
const argv1Url = new URL(`file://${path.resolve(process.argv[1] ?? '')}`).href;
if (invokedUrl === argv1Url) {
  main().catch((err) => {
    process.stderr.write(`fatal: ${(err && err.stack) || err}\n`);
    process.exit(1);
  });
}

export {
  chooseTitle,
  decodeEntities,
  deriveMetadataForFile,
  extractBodyFirstProse,
  extractBodyH1,
  extractBodySecondProse,
  extractFirstSentence,
  isGenericBodyH1,
  listArticleFiles,
  parseArgs,
  pickLangEntry,
  rewriteHtml,
  sliceArticleBody,
  truncateUpto,
};
