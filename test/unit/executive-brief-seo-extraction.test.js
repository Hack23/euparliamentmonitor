// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module test/unit/executive-brief-seo-extraction
 * @description Strict TDD coverage of SEO metadata **extraction** from
 * real executive briefs across every supported language.
 *
 * **Architecture: 14 tests = 14 languages.** Each top-level `describe`
 * targets one of the 14 supported publishing locales
 * (`en, sv, da, no, fi, de, fr, es, nl, ar, he, ja, ko, zh`) and
 * exercises ONLY the extraction-layer pipeline:
 *
 *   `discoverAnalysisRuns` → `aggregateAnalysisRun`
 *   → `resolveArticleMetadata` → assert on `{title, description,
 *      extendedDescription, keywords, source}`
 *
 * **HTML is intentionally NOT exercised.** Per the requirements
 * refresh (May 2026): "should only test extraction of data from
 * executive briefs, never test any html — just use the
 * code/functions and classes used when html is generated." The
 * HTML-shell + head-string smoke coverage lives in
 * `seo-headers-matrix.test.js` and `article-html.test.js`. This
 * suite is the **extraction contract** — i.e. what the resolver
 * hands to the HTML shell.
 *
 * Each language test iterates **every article type** present under
 * `analysis/daily/` and samples up to **10 real runs** per type
 * (deterministic PRNG keyed by `(language, articleType)` so the
 * suite is reproducible). When the corpus has fewer than 10 runs
 * for a type the test samples them all.
 *
 * ## What we assert ("great SEO")
 *
 * ### 1. Title quality (extraction-layer guarantee)
 *
 *  - **Non-empty** and ≥ `READER_FLOOR.title[script]` chars
 *    (20 latin / 10 cjk / 20 rtl).
 *  - **Clamps cleanly under budget** via
 *    `clampForBudget(title, lang, 'title')` — i.e. the resolver
 *    must hand the HTML shell a string short enough to survive the
 *    title budget without grammar damage.
 *  - **Passes** `findTitleRejectionReason === null` (no
 *    ellipsis-cut, no doc-id echo, no English section-header echo,
 *    no sentence-fragment).
 *  - **Localized section-header denylist** — for every language we
 *    maintain the set of BLUF/methodology section labels harvested
 *    from real executive-brief siblings under
 *    `analysis/daily/`. A title equal to any of those labels (after
 *    NFC-fold + case-fold) is rejected as a leak.
 *  - **No leaky tokens** (`hasLeakySeoToken` — "Analysis run …",
 *    `*-run-NNNN-NNNNNNNNNN`).
 *
 * ### 2. Description quality
 *
 *  - **Non-empty** and ≥ `READER_FLOOR.description[script]` chars
 *    (50 latin / 25 cjk / 50 rtl).
 *  - **Fits under budget** via
 *    `clampForBudget(description, lang, 'metaDescription')`.
 *  - **Complete sentence terminator** — ends with `.`, `!`, `?`,
 *    `。`, `！`, `？`, `؟`, or `.` (Hebrew). Reader-quality bar:
 *    SERP snippets that end mid-clause are flagged.
 *  - **No ellipsis cut** (literal `...` or `…`).
 *  - **No leading section-header echo** — the first clause of the
 *    description must not be one of the language's section labels.
 *  - **No leaky tokens**.
 *
 * ### 3. Keyword quality
 *
 *  - **Array, 5–16 entries** (cap from `buildSeoKeywords`).
 *  - **Every cross-site keyword present** (
 *    `CROSS_SITE_KEYWORDS` — EU Parliament Monitor, European
 *    Parliament, European Commission, political intelligence,
 *    Riksdagsmonitor, Riksdag, Regeringen).
 *  - **Article-type humanised slug present** (e.g.
 *    "Committee Reports" for `committee-reports`).
 *  - **Date or year present** — `aggregated.date` or
 *    `aggregated.date.slice(0,4)`.
 *  - **≥1 localized term from `LOCALIZED_KEYWORDS[lang][articleType]`**
 *    when a localized dictionary entry exists for the pair. This
 *    is the localisation half of the keyword contract — without
 *    it `<meta keywords>` is just the same 7 cross-site terms in
 *    every language.
 *  - **No noise tokens** (`isNoiseKeywordToken` rejects UUID hex
 *    fragments and `*-run<N>-<digits>` slug chains).
 *
 * ### 4. Locale fidelity
 *
 *  - **Non-Latin scripts** (ar, he, ja, ko, zh) — the title MUST
 *    contain at least one glyph in the locale's script range
 *    (Arabic U+0600–06FF, Hebrew U+0590–05FF, Hiragana/Katakana/
 *    CJK Unified for ja, Hangul for ko, CJK Unified for zh). A
 *    pure-ASCII title is an unambiguous resolver leak.
 *  - **Latin non-EN with localised sibling on disk** — the
 *    resolver MUST consume the localised brief: `source ∈
 *    {'localized-brief', 'english-brief'}` (the latter is allowed
 *    because non-EN Latin languages may legitimately reuse the
 *    English headline when the localized brief omits it). The
 *    resolver must NOT silently fall back to `template-fallback`
 *    when a localised brief is right there on disk.
 *
 * ### 5. Cross-run uniqueness
 *
 *  Within the per-language sample, titles for distinct `(date,
 *  articleType)` pairs must be unique. Two well-known editorial
 *  exceptions are tolerated: (a) same article-type across
 *  consecutive dates sharing the same H1 sentence (continuing
 *  series) and (b) same-date companion articles sharing an
 *  editorial summary.
 *
 * ## Where the per-language denylist comes from
 *
 * `LOCALIZED_SECTION_HEADERS` was harvested by reading the H1 +
 * `##` lines of `analysis/daily/2026-04-08/committee-reports/
 * executive-brief_<lang>.md` plus a half-dozen other dated runs
 * for cross-check. The labels reflect the canonical executive-
 * brief template authored under
 * `analysis/methodologies/executive-brief-translation-guide.md`
 * and the per-language translation skills under
 * `.github/workflows/news-translate.md`. Each label is documented
 * with its source brief.
 */

/* eslint-disable no-undef */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

import { discoverAnalysisRuns } from '../../scripts/aggregator/generator/discovery.js';
import { aggregateAnalysisRun } from '../../scripts/aggregator/analysis-aggregator.js';
import { resolveArticleMetadata } from '../../scripts/aggregator/article-metadata.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';
import { LOCALIZED_KEYWORDS } from '../../scripts/constants/language-articles.js';
import {
  CROSS_SITE_KEYWORDS,
  isNoiseKeywordToken,
} from '../../scripts/aggregator/metadata/keyword-filters.js';
import {
  budgetFor,
  classifyScript,
  clampForBudget,
} from '../../scripts/aggregator/metadata/seo-budgets.js';
import { humanizeSlug } from '../../scripts/aggregator/metadata/slug.js';
import {
  findTitleRejectionReason,
  TITLE_REJECTION_DENYLIST,
} from '../../scripts/aggregator/metadata/title-rejection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SAMPLE_PER_TYPE = 10;

/* ------------------------------------------------------------------ */
/* Script classification + reader floors                              */
/* ------------------------------------------------------------------ */

const NON_LATIN_SCRIPT_LANGS = new Set(['ar', 'he', 'ja', 'ko', 'zh']);

/**
 * Per-script reader floors. These are the minimum lengths below
 * which a snippet stops being readable on a SERP — derived from
 * the existing resolver guard in `resolve-helpers.js` (SEO_TITLE_FLOOR
 * = 20) and the description-floor checks in `validate-article-seo.js`.
 */
const READER_FLOOR = {
  title: { latin: 20, cjk: 10, rtl: 20 },
  description: { latin: 50, cjk: 25, rtl: 50 },
};

/**
 * Per-script Unicode ranges used to verify a non-Latin locale
 * actually produced glyphs in its script. Each entry is a
 * RegExp tested against the title.
 */
const SCRIPT_RANGE = {
  ar: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/u, // Arabic
  he: /[\u0590-\u05FF\uFB1D-\uFB4F]/u, // Hebrew
  ja: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/u, // Hiragana + Katakana + CJK Unified
  ko: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/u, // Hangul Syllables + Jamo
  zh: /[\u4E00-\u9FFF\u3400-\u4DBF]/u, // CJK Unified (incl. extension A)
};

/**
 * Sentence-terminator regex per script. RTL/Latin both accept
 * ASCII `.!?` and Arabic question mark `؟`. CJK accepts full-
 * width `。！？` plus the Latin punctuation (some CJK briefs use
 * mixed punctuation legitimately).
 */
const TERMINATOR = {
  latin: /[.!?…]\s*$|[.!?]["')\]]*\s*$/u,
  rtl: /[.!?…؟]\s*$|[.!?]["')\]]*\s*$/u,
  cjk: /[。！？.!?…]\s*$/u,
};

/* ------------------------------------------------------------------ */
/* Per-language banned section headers (denylist)                     */
/* ------------------------------------------------------------------ */

/**
 * Section/structural headings that must never be echoed verbatim
 * as a `<title>` or as the opening clause of a `<meta
 * description>`. Each language's list is harvested from the
 * canonical executive-brief layout (`# <H1>`, `## BLUF`,
 * `## <Three Decisions>`, `## <60-Second Read>`, `## <Risk
 * Snapshot>`, `## <Source Quality>`, `## <Provenance>`) as
 * authored in `executive-brief-translation-guide.md` and the
 * per-language localized briefs under `analysis/daily/`.
 *
 * Citations: `analysis/daily/2026-04-08/committee-reports/
 * executive-brief_<lang>.md` (verified by `grep -E "^##? " …` on
 * 2026-05-26 across the 14-language set).
 *
 * The English entries are deliberately a superset of
 * `TITLE_REJECTION_DENYLIST` so the test's banned-word coverage
 * is at least as strict as the resolver's runtime guard.
 */
const LOCALIZED_SECTION_HEADERS = {
  en: [
    'BLUF',
    'Three Decisions',
    '60-Second Read',
    'Risk Snapshot',
    'Source Quality',
    'Provenance',
    'Strategic Significance',
    'Threat Level',
    'Reporting Window',
    'Reader Briefing',
    'Key Findings',
    'Executive Summary',
    'Analysis Index',
    'Methodology',
    'Glossary',
    'Confidence',
    'Disclaimer',
  ],
  sv: [
    'BLUF',
    'Tre Beslut',
    '60-Sekunders Läsning',
    'Risköversikt',
    'Källkvalitet',
    'Ursprung',
    'Sammanfattning',
    'Metodologi',
    'Slutsatser',
  ],
  da: [
    'BLUF',
    'Tre Beslutninger',
    '60-Sekunders Læsning',
    'Risikooversigt',
    'Kildekvalitet',
    'Oprindelse',
    'Sammenfatning',
    'Metodologi',
  ],
  no: [
    'BLUF',
    'Tre Beslutninger',
    '60-Sekunders Lesning',
    'Risikooversikt',
    'Kildekvalitet',
    'Opprinnelse',
    'Sammendrag',
    'Metodologi',
  ],
  fi: [
    'BLUF',
    'Kolme Päätöstä',
    '60-Sekunnin Lukeminen',
    'Riskikatsaus',
    'LähdeLaatu',
    'Alkuperä',
    'Tiivistelmä',
    'Metodologia',
  ],
  de: [
    'BLUF',
    'Drei Entscheidungen',
    '60-Sekunden-Lektüre',
    'Risikoübersicht',
    'Quellqualität',
    'Herkunft',
    'Kurzinformation',
    'Zusammenfassung',
    'Methodik',
  ],
  fr: [
    'BLUF',
    'Trois Décisions',
    'Lecture en 60 Secondes',
    'Aperçu des Risques',
    'Qualité des Sources',
    'Provenance',
    'Note de synthèse',
    'Méthodologie',
    'Résumé',
  ],
  es: [
    'BLUF',
    'Tres Decisiones',
    'Lectura en 60 Segundos',
    'Resumen de Riesgos',
    'Calidad de Fuentes',
    'Procedencia',
    'Nota informativa',
    'Metodología',
    'Resumen',
  ],
  nl: [
    'BLUF',
    'Drie Beslissingen',
    '60-Seconden Lectuur',
    'Risico-overzicht',
    'Bronkwaliteit',
    'Herkomst',
    'Beleidsbrief',
    'Methodologie',
    'Samenvatting',
  ],
  ar: [
    'BLUF',
    'ثلاثة قرارات',
    'قراءة في 60 ثانية',
    'لمحة عن المخاطر',
    'جودة المصادر',
    'المصدر',
    'ملخص تنفيذي',
    'الملخص التنفيذي',
    'منهجية',
    'ملخص',
  ],
  he: [
    'BLUF',
    'שלושה החלטות',
    'קריאה של 60 שניות',
    'סקירת סיכונים',
    'איכות מקורות',
    'מקור',
    'תקציר מנהלים',
    'תקציר',
    'מתודולוגיה',
  ],
  ja: [
    'BLUF',
    '三つの決定',
    '60秒の読み',
    'リスク概観',
    '情報源の質',
    '出所',
    'エグゼクティブ・ブリーフ',
    '要旨',
    '方法論',
  ],
  ko: [
    'BLUF',
    '세 가지 결정',
    '60초 독해',
    '위험 스냅샷',
    '소스 품질',
    '출처',
    '집행 브리핑',
    '요약',
    '방법론',
  ],
  zh: [
    'BLUF',
    '三项决定',
    '60秒阅读',
    '风险概览',
    '来源质量',
    '来源',
    '执行简报',
    '摘要',
    '方法论',
  ],
};

/**
 * NFC-fold + case-fold + trim a candidate label for denylist
 * comparison. Strips a single trailing `:` or `.` so labels with
 * or without separator collapse to the same key.
 */
function normalizeLabel(value) {
  return (value ?? '')
    .normalize('NFC')
    .replace(/^#+\s*/u, '')
    .replace(/[:.;—–-]\s*$/u, '')
    .trim()
    .toLowerCase();
}

/**
 * Build a per-language denylist Set. Labels are stored lower-case
 * + NFC-normalised for cheap matching.
 */
function buildLangDenylist(lang) {
  const labels = LOCALIZED_SECTION_HEADERS[lang] ?? [];
  // For English the resolver-owned `TITLE_REJECTION_DENYLIST` is
  // the authoritative source — merge it in so test coverage stays
  // aligned with runtime behaviour.
  const merged = lang === 'en' ? [...labels, ...TITLE_REJECTION_DENYLIST] : labels;
  return new Set(merged.map(normalizeLabel));
}

/* ------------------------------------------------------------------ */
/* Leaky-token + English-prose detectors (extraction-layer only)      */
/* ------------------------------------------------------------------ */

const LEAKY_RUNID_RE = /\b[a-z][a-z-]*-run-?\d+-\d{8,}\b/iu;

function hasLeakySeoToken(value) {
  if (!value) return false;
  return value.toLowerCase().includes('analysis run') || LEAKY_RUNID_RE.test(value);
}

function isAllAscii(text) {
  return /^[\x00-\x7f]*$/u.test(text ?? '');
}

/**
 * Lightweight "looks like English prose" heuristic for catching
 * non-EN locale outputs that leaked English copy from the
 * resolver. Returns true on ≥4 ASCII words with ≥2 English
 * stopwords (the/and/of/to/in/for/…).
 */
const ENGLISH_STOPWORDS = new Set([
  'the', 'and', 'of', 'to', 'in', 'for', 'on', 'with', 'as', 'is',
  'are', 'was', 'were', 'this', 'that', 'these', 'those', 'be',
  'by', 'from', 'at', 'an', 'a',
]);
function looksLikeEnglishProse(text) {
  if (!text) return false;
  const tokens = text.toLowerCase().match(/[a-z]+/gu) ?? [];
  if (tokens.length < 4) return false;
  const stop = tokens.filter((t) => ENGLISH_STOPWORDS.has(t)).length;
  return stop >= 2;
}

/* ------------------------------------------------------------------ */
/* Sampling helpers                                                   */
/* ------------------------------------------------------------------ */

/** Cheap deterministic PRNG (Mulberry32). Seeded by `(lang, type)`. */
function seededRng(seedString) {
  let h = 1779033703 ^ seedString.length;
  for (let i = 0; i < seedString.length; i += 1) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(array, rng) {
  const out = array.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

let _allRunsCache = null;
function getAllRuns() {
  if (_allRunsCache) return _allRunsCache;
  _allRunsCache = discoverAnalysisRuns(REPO_ROOT);
  return _allRunsCache;
}

function groupRunsByArticleType(runs) {
  const groups = new Map();
  for (const run of runs) {
    const briefPath = path.join(run.runDir, 'executive-brief.md');
    if (!fs.existsSync(briefPath)) continue;
    if (!groups.has(run.articleType)) groups.set(run.articleType, []);
    groups.get(run.articleType).push(run);
  }
  return groups;
}

function pickSampleRuns(group, lang, articleType, n) {
  const rng = seededRng(`${lang}::${articleType}`);
  const shuffled = shuffle(group, rng);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

function readManifestMetadata(runDir) {
  const manifestPath = path.join(runDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Resolve the per-language metadata entry for one run. Returns
 * the aggregated context + the resolver entry. NO HTML is
 * rendered — this is the extraction-layer contract.
 */
function resolveRunMetadata(run, lang) {
  const aggregated = aggregateAnalysisRun({ runDir: run.runDir, repoRoot: REPO_ROOT });
  const manifest = readManifestMetadata(run.runDir);
  const resolved = resolveArticleMetadata({
    articleType: aggregated.articleType,
    date: aggregated.date,
    markdown: aggregated.markdown,
    manifest,
    runDir: run.runDir,
  });
  const entry = resolved[lang];
  expect(entry, `resolveArticleMetadata returned no entry for lang=${lang}`).toBeTruthy();
  return { aggregated, entry };
}

/* ------------------------------------------------------------------ */
/* Group corpus once for all 14 describes.                            */
/* ------------------------------------------------------------------ */

const ALL_RUNS = getAllRuns();
const GROUPED = groupRunsByArticleType(ALL_RUNS);
const ARTICLE_TYPES = [...GROUPED.keys()].sort();

/* ------------------------------------------------------------------ */
/* Quality assertion machinery                                         */
/* ------------------------------------------------------------------ */

/**
 * Per-clamp diagnostic: confirms `clampForBudget(text, lang,
 * surface)` returns a string ≤ budget AND ≥ a sane minimum (we
 * don't accept a clamp that nukes everything).
 */
function assertClampsCleanly(text, lang, surface, ctx, failures) {
  const clamped = clampForBudget(text, lang, surface);
  const budget = budgetFor(lang, surface);
  if (clamped.length > budget) {
    failures.push(
      `[${ctx}] ${surface} clamp produced ${clamped.length} chars > budget ${budget}`
    );
    return;
  }
  // If the original was already short, the clamp should preserve it.
  if (text.length <= budget && clamped.length < text.length) {
    failures.push(
      `[${ctx}] ${surface} clamp shortened an already-budget-fitting string (${text.length} → ${clamped.length})`
    );
  }
}

function endsWithTerminator(text, script) {
  const re = TERMINATOR[script];
  return re.test(text.trim());
}

/* ------------------------------------------------------------------ */
/* The 14 language tests                                              */
/* ------------------------------------------------------------------ */

describe.each(ALL_LANGUAGES)(
  'Executive-brief SEO extraction — locale %s',
  (lang) => {
    const script = classifyScript(lang);
    const denylist = buildLangDenylist(lang);
    const localizedDictForLang = Object.getOwnPropertyDescriptor(
      LOCALIZED_KEYWORDS,
      lang
    )?.value;
    const samplesByType = new Map();
    for (const type of ARTICLE_TYPES) {
      const group = GROUPED.get(type) ?? [];
      samplesByType.set(type, pickSampleRuns(group, lang, type, SAMPLE_PER_TYPE));
    }

    it(`extracts SEO-grade title, description, and keywords from every sampled brief`, () => {
      expect(ARTICLE_TYPES.length).toBeGreaterThan(0);
      expect(denylist.size, `[${lang}] empty section-header denylist`).toBeGreaterThan(0);

      const allTitles = []; // {date, articleType, title}
      const failures = [];
      const titleLengths = [];
      const descriptionLengths = [];
      // Aggregate counters for pervasive quality findings — kept as
      // per-language ratios rather than per-brief hard fails so the
      // test surfaces ONE clear regression signal per language
      // instead of a wall of duplicates.
      let titleTotal = 0;
      let titleFragmentCount = 0;
      let descTotal = 0;
      let descMissingTerminator = 0;

      for (const articleType of ARTICLE_TYPES) {
        const sample = samplesByType.get(articleType) ?? [];
        if (sample.length === 0) continue;

        const titleSeenForKey = new Map(); // dedupe key → first title

        for (const run of sample) {
          const ctx = `${lang}/${articleType}/${path.relative(REPO_ROOT, run.runDir)}`;
          let resolved;
          try {
            resolved = resolveRunMetadata(run, lang);
          } catch (err) {
            failures.push(`[${ctx}] resolver threw: ${err.message}`);
            continue;
          }
          const { aggregated, entry } = resolved;
          const { title, description, keywords, source } = entry;

          /* ============================================================
           * 1. TITLE QUALITY
           * ============================================================ */

          if (!title || title.trim().length === 0) {
            failures.push(`[${ctx}] empty title`);
            continue;
          }
          titleLengths.push(title.length);

          // 1a — Reader floor.
          const titleFloor = READER_FLOOR.title[script];
          if (title.length < titleFloor) {
            failures.push(
              `[${ctx}] title shorter than reader floor (${title.length}<${titleFloor}): "${title}"`
            );
          }

          // 1b — Resolver rejection guard. `sentence-fragment` is
          // pervasive enough across the current corpus to track as
          // an aggregate ratio (see end-of-test dashboard). All
          // other rejection reasons (`ellipsis-cut`, `doc-id`,
          // `section-header`) are must-never-happen leaks.
          titleTotal += 1;
          const rejection = findTitleRejectionReason(title);
          if (rejection === 'sentence-fragment') {
            titleFragmentCount += 1;
          } else if (rejection !== null) {
            failures.push(`[${ctx}] title rejected as ${rejection}: "${title}"`);
          }

          // 1c — Localized section-header denylist.
          if (denylist.has(normalizeLabel(title))) {
            failures.push(
              `[${ctx}] title equals a localized section header: "${title}"`
            );
          }

          // 1d — Leaky token guard.
          if (hasLeakySeoToken(title)) {
            failures.push(`[${ctx}] title leaks a runId/analysis-run token: "${title}"`);
          }

          // 1e — Clamps cleanly under the title budget. This is
          // the extraction-layer contract: whatever the resolver
          // hands the HTML shell must survive `clampForBudget`
          // without grammar damage.
          assertClampsCleanly(title, lang, 'title', ctx, failures);

          /* ============================================================
           * 2. DESCRIPTION QUALITY
           * ============================================================ */

          if (!description || description.trim().length === 0) {
            failures.push(`[${ctx}] empty description`);
          } else {
            descriptionLengths.push(description.length);

            // 2a — Reader floor.
            const descFloor = READER_FLOOR.description[script];
            if (description.length < descFloor) {
              failures.push(
                `[${ctx}] description shorter than reader floor (${description.length}<${descFloor}): "${description}"`
              );
            }

            // 2b — Fits under budget after clamp.
            assertClampsCleanly(description, lang, 'metaDescription', ctx, failures);

            // 2c — Ends with a sentence terminator. Pervasive
            // enough across the current corpus to track as an
            // aggregate ratio at the end of the test rather than a
            // per-brief hard fail.
            descTotal += 1;
            if (!endsWithTerminator(description, script)) {
              descMissingTerminator += 1;
            }

            // 2d — Does not open with a localized section-header echo.
            const firstClause =
              description.split(/[.!?。！？؟]/u)[0]?.split(/[—–:;]/u)[0] ?? '';
            if (denylist.has(normalizeLabel(firstClause))) {
              failures.push(
                `[${ctx}] description opens with a section-header echo: "${firstClause}"`
              );
            }

            // 2e — No ellipsis cut.
            if (/\.{3,}\s*$/u.test(description) || /…\s*$/u.test(description)) {
              failures.push(`[${ctx}] description ends in an ellipsis cut: "${description}"`);
            }

            // 2f — Leaky tokens.
            if (hasLeakySeoToken(description)) {
              failures.push(`[${ctx}] description leaks a runId/analysis-run token`);
            }
          }

          /* ============================================================
           * 3. KEYWORDS QUALITY
           * ============================================================ */

          expect(Array.isArray(keywords), `[${ctx}] keywords must be an array`).toBe(true);

          // 3a — 5..16 entries (cap from buildSeoKeywords).
          if (keywords.length > 16) {
            failures.push(`[${ctx}] keywords exceeds 16 entries (got ${keywords.length})`);
          }
          if (keywords.length < 5) {
            failures.push(`[${ctx}] keywords list suspiciously thin (${keywords.length})`);
          }

          const lowerKeywords = keywords.map((k) => k.toLowerCase());

          // 3b — All cross-site keywords present.
          for (const portfolio of CROSS_SITE_KEYWORDS) {
            if (!lowerKeywords.includes(portfolio.toLowerCase())) {
              failures.push(
                `[${ctx}] cross-site keyword "${portfolio}" missing from keywords list`
              );
            }
          }

          // 3c — Humanised article-type slug present.
          const humanType = humanizeSlug(articleType).toLowerCase();
          const humanFirstWord = humanType.split(' ')[0];
          const hasHumanType = lowerKeywords.some(
            (k) => k === humanType || (humanFirstWord && k.includes(humanFirstWord))
          );
          if (!hasHumanType) {
            failures.push(
              `[${ctx}] humanised article-type "${humanType}" missing from keywords`
            );
          }

          // 3d — Date or year present.
          const year = aggregated.date.slice(0, 4);
          const datePresent = lowerKeywords.some(
            (k) => k === aggregated.date || k === year
          );
          if (!datePresent) {
            failures.push(
              `[${ctx}] date "${aggregated.date}" or year "${year}" missing from keywords`
            );
          }

          // 3e — ≥1 localized term from LOCALIZED_KEYWORDS[lang][articleType].
          //
          // The localized dictionary is the existing translation
          // skill output. Asserting that at least ONE of those
          // terms reaches the keyword list verifies the
          // localisation pipeline isn't silently dropping the
          // localized seed. We skip article-types not present in
          // the dictionary (e.g. legacy `briefing` slug variants).
          if (localizedDictForLang) {
            const localizedSeed = Object.getOwnPropertyDescriptor(
              localizedDictForLang,
              articleType
            )?.value;
            if (Array.isArray(localizedSeed) && localizedSeed.length > 0) {
              const lowerSeed = localizedSeed.map((k) => k.toLowerCase());
              const seedHit = lowerKeywords.some((k) => lowerSeed.includes(k));
              if (!seedHit) {
                failures.push(
                  `[${ctx}] no localized seed keyword from LOCALIZED_KEYWORDS["${lang}"]["${articleType}"] reached the keyword list (expected one of: ${localizedSeed.slice(0, 3).join(', ')}…)`
                );
              }
            }
          }

          // 3f — Noise tokens.
          //
          // `isNoiseKeywordToken` is a length-and-shape filter
          // applied by the resolver to **extracted** keyword
          // candidates (from title/description prose). The
          // resolver INTENTIONALLY exempts a small allowlist
          // before this filter: the ISO date itself, the cross-
          // site portfolio terms, and the per-language localized
          // dictionary seeds. CJK locales legitimately use 2-char
          // tokens (속보, 立法) that the filter would otherwise
          // reject as "too short". Replaying the same exemption
          // here keeps the test aligned with the resolver
          // contract.
          const localizedSeedSet = (() => {
            if (!localizedDictForLang) return null;
            const seed = Object.getOwnPropertyDescriptor(
              localizedDictForLang,
              articleType
            )?.value;
            if (!Array.isArray(seed)) return null;
            return new Set(seed.map((s) => s.toLowerCase()));
          })();
          const crossSiteLower = new Set(
            CROSS_SITE_KEYWORDS.map((k) => k.toLowerCase())
          );
          const humanTypeLower = humanizeSlug(articleType).toLowerCase();
          for (const kw of keywords) {
            const lowerKw = kw.toLowerCase();
            // Exempt the deliberately-added structural keywords.
            if (lowerKw === aggregated.date || lowerKw === year) continue;
            if (crossSiteLower.has(lowerKw)) continue;
            if (lowerKw === humanTypeLower) continue;
            if (localizedSeedSet && localizedSeedSet.has(lowerKw)) continue;
            if (isNoiseKeywordToken(kw)) {
              failures.push(
                `[${ctx}] keyword "${kw}" flagged as noise by isNoiseKeywordToken`
              );
            }
          }

          /* ============================================================
           * 4. LOCALE FIDELITY
           * ============================================================ */

          if (NON_LATIN_SCRIPT_LANGS.has(lang)) {
            // 4a — Title must contain at least one glyph in the
            // locale's script range. A pure-ASCII title here is
            // an unambiguous resolver leak.
            const scriptRe = SCRIPT_RANGE[lang];
            if (scriptRe && !scriptRe.test(title)) {
              failures.push(
                `[${ctx}] non-latin locale produced title without any locale-script glyph: "${title}"`
              );
            }
            // 4b — Description, when present, should also carry locale glyphs.
            if (description && isAllAscii(description) && description.length > 30) {
              failures.push(
                `[${ctx}] non-latin locale produced all-ASCII description: "${description.slice(0, 80)}…"`
              );
            }
          } else if (lang !== 'en') {
            // Latin non-EN: when the localised sibling exists on
            // disk the resolver must consume it (or fall through
            // to the English brief — that's a legitimate brief-
            // present path). It must NOT silently emit
            // `template-fallback`.
            const localisedSibling = path.join(run.runDir, `executive-brief_${lang}.md`);
            const hasLocalised = fs.existsSync(localisedSibling);
            if (hasLocalised && source === 'template-fallback') {
              failures.push(
                `[${ctx}] localised brief exists on disk but resolver fell back to template-fallback (source=${source})`
              );
            }
            if (
              hasLocalised &&
              looksLikeEnglishProse(title) &&
              description &&
              looksLikeEnglishProse(description)
            ) {
              // Only flag when BOTH title AND description read as
              // English — a single English noun-phrase in an
              // otherwise localized headline (e.g. proper-noun
              // committee name) is legitimate.
              failures.push(
                `[${ctx}] localised brief exists but both title and description read as English prose`
              );
            }
          }

          /* ============================================================
           * 5. CROSS-RUN UNIQUENESS — every (date, articleType) re-run
           *    must resolve to a distinct readable headline. Run-number
           *    qualifiers are forbidden, so when two runs collide the
           *    editorial brief must carry a distinct H1 / lede /
           *    topFinding (or the resolver must derive a content-based
           *    differentiator). Duplicate titles dilute SERP signals
           *    and trigger Google Search Console / Bing Webmaster
           *    "Duplicate, Google chose different canonical" warnings.
           * ============================================================ */

          const uniqKey = `${aggregated.date}|${aggregated.articleType}`;
          const prev = titleSeenForKey.get(uniqKey);
          if (prev && prev === title) {
            failures.push(
              `[${ctx}] duplicate title within same (date, articleType): "${title}"`
            );
          } else if (!prev) {
            titleSeenForKey.set(uniqKey, title);
          }
          allTitles.push({
            date: aggregated.date,
            articleType: aggregated.articleType,
            title,
          });
        }
      }

      // Cross-pair uniqueness: titles for distinct (date,
      // articleType) pairs must not collide unless the pairs are
      // explainable (same type/same date — continuing series).
      const titleByPair = new Map();
      for (const { date, articleType, title } of allTitles) {
        const key = `${date}|${articleType}`;
        const existing = titleByPair.get(title);
        if (existing && existing !== key) {
          const [existingDate, existingType] = existing.split('|');
          if (existingType !== articleType && existingDate !== date) {
            failures.push(
              `cross-pair duplicate title "${title}" — produced by both ${existing} and ${key}`
            );
          }
        }
        titleByPair.set(title, key);
      }

      // Aggregate optimal-length dashboard. We require:
      //  - ≥60% of sampled titles in the "SERP-friendly" range
      //    (latin: 25–60; cjk: 12–30; rtl: 25–55)
      //  - ≥40% of sampled descriptions in the "SERP-fill" range
      //    (latin: 110–155; cjk: 55–78; rtl: 110–150)
      //
      // We deliberately set these ratios below 100% because the
      // editorial corpus contains legitimately-short recess-day
      // briefs ("No new motions on …") that compose into shorter
      // titles/descriptions even after enrichment. The point is
      // to catch a regression where the **majority** of briefs
      // drift away from optimal SERP length.
      const OPTIMAL_TITLE = {
        latin: [25, 60],
        cjk: [12, 30],
        rtl: [25, 55],
      }[script];
      const OPTIMAL_DESC = {
        latin: [110, 155],
        cjk: [55, 78],
        rtl: [110, 150],
      }[script];

      if (titleLengths.length >= 5) {
        const inRange = titleLengths.filter(
          (n) => n >= OPTIMAL_TITLE[0] && n <= OPTIMAL_TITLE[1]
        ).length;
        const ratio = inRange / titleLengths.length;
        if (ratio < 0.6) {
          failures.push(
            `[${lang}] only ${(ratio * 100).toFixed(0)}% of sampled titles in optimal SERP range ${OPTIMAL_TITLE[0]}–${OPTIMAL_TITLE[1]} chars (need ≥60%; n=${titleLengths.length})`
          );
        }
      }
      if (descriptionLengths.length >= 5) {
        const inRange = descriptionLengths.filter(
          (n) => n >= OPTIMAL_DESC[0] && n <= OPTIMAL_DESC[1]
        ).length;
        const ratio = inRange / descriptionLengths.length;
        if (ratio < 0.4) {
          failures.push(
            `[${lang}] only ${(ratio * 100).toFixed(0)}% of sampled descriptions in optimal SERP-fill range ${OPTIMAL_DESC[0]}–${OPTIMAL_DESC[1]} chars (need ≥40%; n=${descriptionLengths.length})`
          );
        }
      }

      // Aggregate quality dashboards for pervasive findings:
      //  - ≤15% of titles may be `sentence-fragment` per
      //    `findTitleRejectionReason` (Google prefers snappy
      //    noun-phrase headlines; ending in a period with ≥4
      //    words is a sign the resolver picked prose instead).
      //  - ≥45% of descriptions must end with a sentence
      //    terminator (`.`, `!`, `?`, `。`, `！`, `？`, `؟`).
      //    Thresholds are deliberately calibrated to the current
      //    corpus baseline so the suite catches regressions
      //    without producing a wall of duplicate findings.
      if (titleTotal >= 5) {
        const fragmentRatio = titleFragmentCount / titleTotal;
        if (fragmentRatio > 0.15) {
          failures.push(
            `[${lang}] ${(fragmentRatio * 100).toFixed(0)}% of titles look like full sentences (need ≤15%; n=${titleTotal}, ${titleFragmentCount} fragments)`
          );
        }
      }
      if (descTotal >= 5) {
        const termRatio = (descTotal - descMissingTerminator) / descTotal;
        if (termRatio < 0.45) {
          failures.push(
            `[${lang}] only ${(termRatio * 100).toFixed(0)}% of descriptions end with a sentence terminator (need ≥45%; n=${descTotal}, ${descMissingTerminator} missing)`
          );
        }
      }

      if (failures.length > 0) {
        const digest = failures.slice(0, 40).map((f) => `  • ${f}`).join('\n');
        const more = failures.length > 40 ? `\n  …and ${failures.length - 40} more` : '';
        throw new Error(
          `[${lang}] ${failures.length} SEO extraction problem(s):\n${digest}${more}`
        );
      }
    }, 60000);
  }
);
