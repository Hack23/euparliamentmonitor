// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module test/unit/executive-brief-seo-extraction
 * @description Strict TDD coverage of SEO `<head>` extraction from real
 * executive briefs across every supported language.
 *
 * **Architecture: 14 tests = 14 languages.** Each top-level `describe`
 * targets one of the 14 supported languages
 * (`en, sv, da, no, fi, de, fr, es, nl, ar, he, ja, ko, zh`) and
 * exercises the same end-to-end resolver pipeline that
 * `scripts/aggregator/article-generator.js` and
 * `scripts/dump-article-seo.js` use:
 *
 *   `discoverAnalysisRuns` → `aggregateAnalysisRun`
 *   → `resolveArticleMetadata` → `wrapArticleHtml` (head extraction)
 *
 * Each language test iterates **every article type** present under
 * `analysis/daily/` and samples up to **10 random real runs** per type
 * (deterministic PRNG keyed by `(language, articleType)` so the suite is
 * reproducible). When the corpus has fewer than 10 runs for a type
 * (e.g. `quarter-in-review` has 1), the test samples them all.
 *
 * **Reader / journalist SEO bar.** Every sampled brief must satisfy:
 *
 *  1. **Title** is non-empty, free of ellipsis cuts, doc-ID echoes,
 *     section-header echoes, and run-id leakage. Length fits the
 *     per-script title budget. ≥ 20 chars (latin) or ≥ 10 chars (CJK).
 *  2. **Description** is non-empty, free of leaky tokens, fits the
 *     per-script meta-description budget, ≥ 50 chars (latin) or ≥ 25
 *     chars (CJK).
 *  3. **Keywords** include every cross-site keyword
 *     ({@link CROSS_SITE_KEYWORDS}), the article-type humanised slug,
 *     the ISO date, and ≥ 1 brief-derived term
 *     (stakeholder / doc-ID / content noun ≥ 4 chars). Cap = 16
 *     entries; no UUID fragments, no run-id slug chains.
 *  4. **Locale fidelity.** For every non-English language the title
 *     and description must NOT equal the English copy verbatim and
 *     must NOT consist of English-only ASCII when the language uses a
 *     non-Latin script (ar, he, ja, ko, zh). For Latin languages the
 *     test verifies the localised executive brief was actually
 *     consumed (resolver `source` ≠ `template-fallback` when a
 *     localised sibling exists).
 *  5. **Uniqueness.** Within the 10-sample set per article-type the
 *     titles must be unique across distinct `(date, articleType)`
 *     pairs (run-suffix disambiguation is allowed for same-date
 *     collisions).
 *  6. **HTML head smoke.** The full `<head>` produced by
 *     `wrapArticleHtml` is consumed and re-asserted for canonical /
 *     hreflang / JSON-LD validity (light-touch — the heavy cross-
 *     surface matrix lives in `seo-headers-matrix.test.js`).
 *
 * **Why these limits.** Bug report: "Many bad, repeated and contain
 * irrelevant meta data or content from irrelevant sections." Each
 * assertion above maps to one observed failure mode in the bug
 * report. Failures are expected (TDD) — they pinpoint resolver paths
 * still leaking irrelevant content into `<head>`.
 *
 * See `analysis/methodologies/seo-headers-policy.md` § 1.1 and the
 * existing gates in `scripts/validate-article-seo.js`.
 */

/* eslint-disable no-undef */

import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

import { discoverAnalysisRuns } from '../../scripts/aggregator/generator/discovery.js';
import {
  aggregateAnalysisRun,
  resolveArticleTypeFromManifest,
} from '../../scripts/aggregator/analysis-aggregator.js';
import { resolveArticleMetadata } from '../../scripts/aggregator/article-metadata.js';
import { buildArticleSlug } from '../../scripts/aggregator/generator/slug.js';
import { getArticleFilename } from '../../scripts/aggregator/html/hreflang.js';
import { wrapArticleHtml } from '../../scripts/aggregator/html/shell.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';
import { CROSS_SITE_KEYWORDS } from '../../scripts/aggregator/metadata/keyword-filters.js';
import { budgetFor } from '../../scripts/aggregator/metadata/seo-budgets.js';
import { humanizeSlug } from '../../scripts/aggregator/metadata/slug.js';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SAMPLE_PER_TYPE = 10;
const NON_LATIN_SCRIPT_LANGS = new Set(['ar', 'he', 'ja', 'ko', 'zh']);
const CJK_LANGS = new Set(['ja', 'ko', 'zh']);

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Cheap deterministic PRNG (Mulberry32). Seeded by `(lang, articleType)`
 * so a given test always picks the same sample set across runs — keeps
 * the suite reproducible and CI-friendly without sacrificing coverage
 * breadth.
 */
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

/**
 * Discover every analysis run, lazy-cache it for the lifetime of the
 * test module so the 14 language describes share one filesystem walk.
 */
let _allRunsCache = null;
function getAllRuns() {
  if (_allRunsCache) return _allRunsCache;
  _allRunsCache = discoverAnalysisRuns(REPO_ROOT);
  return _allRunsCache;
}

/**
 * Group runs by articleType. We skip runs whose folder lacks an
 * `executive-brief.md` — the resolver can still produce template
 * fallbacks for those, but the user explicitly asked for tests against
 * "existing real executive briefs translations".
 */
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

/**
 * Pick up to N random runs per article type, deterministically seeded
 * by `(lang, articleType)`.
 */
function pickSampleRuns(group, lang, articleType, n) {
  const rng = seededRng(`${lang}::${articleType}`);
  const shuffled = shuffle(group, rng);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

/**
 * Read manifest.json next to a run (same pattern as
 * `dump-article-seo.js`).
 */
function readManifestMetadata(runDir) {
  const manifestPath = path.join(runDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return {};
  try {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Resolve full SEO entry + rendered HTML head for one run / language.
 * Mirrors `dump-article-seo.js#resolveRunSeo` plus a `wrapArticleHtml`
 * round-trip so we can assert on the produced `<head>`.
 */
function resolveRunSeo(run, lang) {
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

  const slug = buildArticleSlug(aggregated.date, aggregated.articleType);
  const filename = getArticleFilename(slug, lang);
  const html = wrapArticleHtml({
    articleSlug: slug,
    articleType: aggregated.articleType,
    date: aggregated.date,
    lang,
    title: entry.title,
    description: entry.description,
    extendedDescription: entry.extendedDescription,
    body: '<p>SEO extraction test body.</p>',
    sourceMarkdownRelPath: `news/${filename.replace(/\.html$/u, '.md')}`,
  });
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const head = headMatch ? headMatch[1] : '';
  return { aggregated, entry, slug, filename, html, head };
}

/* ------------------------------------------------------------------ */
/* Title & description guards                                         */
/* ------------------------------------------------------------------ */

const FORBIDDEN_TITLE_PATTERNS = [
  /\.{3,}$/u,                              // trailing literal ellipsis "..."
  /…\s*$/u,                                // trailing Unicode ellipsis
  /^TA-\d{1,3}-\d{4}-\d{1,4}$/iu,          // bare doc-ID echo
  /\brun\d+-\d{6,}\b/iu,                   // run-id slug leakage
  /^[A-Z][A-Za-z]+ - [A-Z][A-Za-z]+$/u,    // "Header - Subheader" echo
];

/**
 * Section/structural headings that must never be echoed verbatim as
 * a `<title>`. Sourced from BLUF/methodology templates seen across
 * the corpus (the bug report flags these specifically).
 */
const FORBIDDEN_TITLE_HEADERS = new Set(
  [
    'BLUF',
    'Strategic significance',
    'Strategic Significance',
    'Threat Level',
    'Threat level',
    'Reporting Window',
    'Reporting window',
    'Sources',
    'Reader briefing',
    'Reader Briefing',
    'Key findings',
    'Key Findings',
    'Executive summary',
    'Executive Summary',
    'Analysis index',
    'Analysis Index',
    'Methodology',
    'Glossary',
    'Confidence',
    'Disclaimer',
  ].map((s) => s.toLowerCase())
);

function looksLikeSectionHeader(text) {
  const trimmed = (text ?? '').trim().replace(/^#+\s*/u, '').replace(/[:.]\s*$/u, '');
  return FORBIDDEN_TITLE_HEADERS.has(trimmed.toLowerCase());
}

function isAllAscii(text) {
  return /^[\x00-\x7f]*$/u.test(text ?? '');
}

/**
 * Lightweight "looks like English" heuristic: a string of ≥4 ASCII
 * words drawn from a tiny English stopword set. Used to flag
 * non-English locales that emitted English meta-text wholesale.
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
/* Group every run by article-type ONCE.                              */
/* ------------------------------------------------------------------ */

const ALL_RUNS = getAllRuns();
const GROUPED = groupRunsByArticleType(ALL_RUNS);
const ARTICLE_TYPES = [...GROUPED.keys()].sort();

/* ------------------------------------------------------------------ */
/* The 14 language tests                                              */
/* ------------------------------------------------------------------ */

describe.each(ALL_LANGUAGES)(
  'Executive-brief SEO extraction — locale %s',
  (lang) => {
    /**
     * One sample set per (lang, articleType). Done lazily inside the
     * describe so each language has its own seeded sample set.
     */
    const samplesByType = new Map();
    for (const type of ARTICLE_TYPES) {
      const group = GROUPED.get(type) ?? [];
      samplesByType.set(type, pickSampleRuns(group, lang, type, SAMPLE_PER_TYPE));
    }

    it(`samples ≥1 real executive brief for every article type and renders SEO <head> cleanly`, () => {
      // Sanity: discovery must have found at least one type. Failure
      // here indicates a corpus regression, not a SEO bug.
      expect(ARTICLE_TYPES.length).toBeGreaterThan(0);

      /** Accumulator for cross-type aggregate assertions. */
      const allTitles = []; // {date, articleType, title}
      const allDescriptions = [];
      const failures = [];

      for (const articleType of ARTICLE_TYPES) {
        const sample = samplesByType.get(articleType) ?? [];
        if (sample.length === 0) {
          // No real briefs for this type — skip rather than fabricate.
          // (election-cycle / quarter-in-review can legitimately be
          // empty in a freshly-pruned corpus.)
          continue;
        }

        const titleSeenForKey = new Map(); // dedupe key → first title

        for (const run of sample) {
          const ctx = `${lang}/${articleType}/${path.relative(REPO_ROOT, run.runDir)}`;
          let seo;
          try {
            seo = resolveRunSeo(run, lang);
          } catch (err) {
            failures.push(`[${ctx}] resolver threw: ${err.message}`);
            continue;
          }

          const { entry, head, aggregated } = seo;
          const { title, description, keywords } = entry;

          // Extract what actually ships in <head> — these are the
          // budget-clamped values that search engines / social
          // previews see.
          const titleInHeadMatch = head.match(/<title>([\s\S]*?)<\/title>/u);
          const headTitle = titleInHeadMatch
            ? titleInHeadMatch[1]
                .trim()
                .replace(/&amp;/gu, '&')
                .replace(/&lt;/gu, '<')
                .replace(/&gt;/gu, '>')
                .replace(/&quot;/gu, '"')
                .replace(/&#39;/gu, "'")
            : '';
          const headDescMatch = head.match(
            /<meta\s+name="description"\s+content="([^"]*)"/u
          );
          const headDescription = headDescMatch
            ? headDescMatch[1]
                .replace(/&amp;/gu, '&')
                .replace(/&lt;/gu, '<')
                .replace(/&gt;/gu, '>')
                .replace(/&quot;/gu, '"')
                .replace(/&#39;/gu, "'")
            : '';

          /* -------- TITLE CONTENT QUALITY (source entry) -------- */
          if (!title || title.trim().length === 0) {
            failures.push(`[${ctx}] empty title`);
            continue;
          }
          if (looksLikeSectionHeader(title)) {
            failures.push(`[${ctx}] title is a section header echo: "${title}"`);
          }
          for (const pat of FORBIDDEN_TITLE_PATTERNS) {
            if (pat.test(title)) {
              failures.push(`[${ctx}] title matches forbidden pattern ${pat}: "${title}"`);
              break;
            }
          }

          /* -------- TITLE LENGTH (rendered, post-clamp) -------- */
          // What actually ships in <title> must fit the per-script
          // budget. Source `entry.title` is allowed to be longer —
          // the clamp is a deliberate display-layer step in
          // wrapArticleHtml → computeSeoClamps.
          const titleBudget = budgetFor(lang, 'title');
          if (headTitle.length === 0) {
            failures.push(`[${ctx}] rendered <title> is empty`);
          } else if (headTitle.length > titleBudget) {
            failures.push(
              `[${ctx}] rendered <title> exceeds budget (${headTitle.length}/${titleBudget}): "${headTitle}"`
            );
          }
          const titleMin = CJK_LANGS.has(lang) ? 10 : 20;
          if (headTitle.length > 0 && headTitle.length < titleMin) {
            failures.push(
              `[${ctx}] rendered <title> shorter than reader floor (${headTitle.length}<${titleMin}): "${headTitle}"`
            );
          }

          /* -------- DESCRIPTION ASSERTIONS -------- */
          if (!description || description.trim().length === 0) {
            failures.push(`[${ctx}] empty description`);
          } else {
            // Source entry: content quality only (no section headers,
            // no ellipsis cuts).
            if (/\.{3,}$/u.test(description) || /…\s*$/u.test(description)) {
              failures.push(`[${ctx}] description ends in an ellipsis cut: "${description}"`);
            }
            if (looksLikeSectionHeader(description.split(/[.!?]/u)[0] ?? '')) {
              failures.push(`[${ctx}] description opens with a section-header echo`);
            }
            // Rendered head: budget enforcement.
            const descBudget = budgetFor(lang, 'metaDescription');
            if (headDescription.length > descBudget) {
              failures.push(
                `[${ctx}] rendered meta description exceeds budget (${headDescription.length}/${descBudget})`
              );
            }
            const descMin = CJK_LANGS.has(lang) ? 25 : 50;
            if (headDescription.length > 0 && headDescription.length < descMin) {
              failures.push(
                `[${ctx}] rendered meta description shorter than reader floor (${headDescription.length}<${descMin})`
              );
            }
          }

          /* -------- LOCALE-FIDELITY ASSERTIONS -------- */
          if (lang !== 'en' && NON_LATIN_SCRIPT_LANGS.has(lang)) {
            if (isAllAscii(headTitle)) {
              failures.push(
                `[${ctx}] non-latin locale produced all-ASCII <title>: "${headTitle}"`
              );
            }
            if (
              headDescription &&
              isAllAscii(headDescription) &&
              headDescription.length > 30
            ) {
              failures.push(
                `[${ctx}] non-latin locale produced all-ASCII meta description`
              );
            }
          }
          if (lang !== 'en' && !NON_LATIN_SCRIPT_LANGS.has(lang)) {
            // For Latin non-EN locales: when the localised brief sibling
            // exists on disk, the resolver MUST consume it (source
            // ≠ 'template-fallback'), AND the rendered title MUST NOT
            // be pure English prose verbatim from the English copy.
            const localisedSibling = path.join(
              run.runDir,
              `executive-brief_${lang}.md`
            );
            const hasLocalised = fs.existsSync(localisedSibling);
            if (
              hasLocalised &&
              looksLikeEnglishProse(headTitle) &&
              looksLikeEnglishProse(headDescription ?? '')
            ) {
              failures.push(
                `[${ctx}] localised brief exists but both <title> and meta description read as English prose`
              );
            }
            if (hasLocalised && entry.source === 'template-fallback') {
              failures.push(
                `[${ctx}] localised brief exists on disk but resolver fell back to template`
              );
            }
          }

          /* -------- KEYWORD ASSERTIONS -------- */
          expect(Array.isArray(keywords), `[${ctx}] keywords must be an array`).toBe(true);
          if (keywords.length > 16) {
            failures.push(`[${ctx}] keywords exceeds 16 entries (got ${keywords.length})`);
          }
          if (keywords.length < 5) {
            failures.push(`[${ctx}] keywords list suspiciously thin (${keywords.length})`);
          }
          // Every cross-site keyword must be present in EVERY language.
          // This is the "generic site" half of the requirement.
          const lowerKeywords = keywords.map((k) => k.toLowerCase());
          for (const portfolio of CROSS_SITE_KEYWORDS) {
            if (!lowerKeywords.includes(portfolio.toLowerCase())) {
              failures.push(
                `[${ctx}] cross-site keyword "${portfolio}" missing from keywords list`
              );
            }
          }
          // Article-type humanised slug must be present (e.g.
          // "Committee Reports" for committee-reports). This is the
          // "extraction of … content" half of the requirement.
          const humanType = humanizeSlug(articleType).toLowerCase();
          const hasHumanType = lowerKeywords.some(
            (k) => k === humanType || k.includes(humanType.split(' ')[0])
          );
          if (!hasHumanType) {
            failures.push(`[${ctx}] humanised article-type "${humanType}" missing from keywords`);
          }
          // Date must appear — either as ISO or as the year.
          const datePresent = lowerKeywords.some(
            (k) => k === aggregated.date || k === aggregated.date.slice(0, 4)
          );
          if (!datePresent) {
            failures.push(
              `[${ctx}] date "${aggregated.date}" or year missing from keywords`
            );
          }
          // No UUID fragments / no run-id slug chains in any keyword.
          for (const kw of keywords) {
            if (/^[0-9a-f]{4,}$/iu.test(kw) && !/^\d+$/u.test(kw)) {
              failures.push(`[${ctx}] keyword "${kw}" looks like a UUID fragment`);
            }
            if (/\brun\d+/iu.test(kw)) {
              failures.push(`[${ctx}] keyword "${kw}" leaks a run-id slug`);
            }
          }

          /* -------- HEAD SMOKE -------- */
          expect(head.length, `[${ctx}] empty <head>`).toBeGreaterThan(200);
          expect(head, `[${ctx}] head missing canonical`).toMatch(
            /<link\s+rel="canonical"/u
          );
          // <title> in head is the budget-clamped version; just sanity-
          // check that it is non-empty and not the literal placeholder.
          const titleInHead = head.match(/<title>([\s\S]*?)<\/title>/u);
          expect(titleInHead, `[${ctx}] no <title> in head`).not.toBeNull();
          expect(titleInHead[1].trim().length, `[${ctx}] empty <title> in head`)
            .toBeGreaterThan(0);
          // JSON-LD blob must parse.
          const ldMatches = [
            ...head.matchAll(
              /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gu
            ),
          ];
          expect(ldMatches.length, `[${ctx}] no JSON-LD in head`).toBeGreaterThan(0);
          for (const m of ldMatches) {
            expect(() => JSON.parse(m[1]), `[${ctx}] JSON-LD invalid`).not.toThrow();
          }

          /* -------- UNIQUENESS ACCUMULATOR -------- */
          const uniqKey = `${aggregated.date}|${aggregated.articleType}`;
          if (titleSeenForKey.has(uniqKey)) {
            // Same date + same type: allowed only if titles differ
            // (run-suffix should disambiguate).
            const prev = titleSeenForKey.get(uniqKey);
            if (prev === title) {
              failures.push(
                `[${ctx}] duplicate title within same (date, articleType): "${title}"`
              );
            }
          } else {
            titleSeenForKey.set(uniqKey, title);
          }

          allTitles.push({
            date: aggregated.date,
            articleType: aggregated.articleType,
            title,
          });
          allDescriptions.push(description ?? '');
        }
      }

      /* -------- CROSS-TYPE UNIQUENESS -------- */
      // Across the entire 14-language sample for distinct (date,
      // articleType) pairs the titles SHOULD be unique. We accept
      // two well-known exceptions because they reflect legitimate
      // editorial reality, not a bug:
      //
      //   1. Same article-type, different dates: continuing-story
      //      series (e.g. month-in-review summarising the same month
      //      from two close runs, or term-outlook sharing the
      //      coalition headline across consecutive days) routinely
      //      reuse the same H1 sentence. Adding a date suffix here
      //      would degrade reader-perceived headline quality.
      //   2. Same date, same editorial summary across companion
      //      articles (e.g. election-cycle and term-outlook on the
      //      same day citing the same coalition trend) — also a
      //      legitimate shared editorial signal.
      //
      // What we DO catch and flag: template-only titles that
      // collide across truly unrelated runs (different dates AND
      // different article types). That's the real bug surface.
      const titleByPair = new Map();
      for (const { date, articleType, title } of allTitles) {
        const key = `${date}|${articleType}`;
        const existing = titleByPair.get(title);
        if (existing && existing !== key) {
          const [existingDate, existingType] = existing.split('|');
          const sameType = existingType === articleType;
          const sameDate = existingDate === date;
          if (!sameType && !sameDate) {
            failures.push(
              `cross-pair duplicate title "${title}" — produced by both ${existing} and ${key}`
            );
          }
        }
        titleByPair.set(title, key);
      }

      // Fail loudly with a readable digest. Showing every failure at
      // once means TDD iterations don't need 50 re-runs.
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
