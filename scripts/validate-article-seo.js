#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module scripts/validate-article-seo
 * @description Hard CI gate for resolved `<title>` / `<meta description>`
 * metadata that the deterministic article generator would emit for every
 * executive brief under `analysis/daily/`. Companion to
 * `validate-manifest-seo.js`: where that script audits the per-language
 * `(title, description)` pairs committed *in manifest.json*, this one
 * audits the **resolved output** of `resolveArticleMetadata()` — the same
 * code path used by `npm run generate-article:all`.
 *
 * Why a separate gate? `manifest.json` is the Stage-B *input* contract.
 * The Stage-D *output* contract is the resolved entry returned by
 * `resolveArticleMetadata`, which threads through editorial-highlight
 * extraction, BLUF-summary derivation, contextual title composition
 * (including `— Run N` run-qualifier for same-date/same-articleType
 * republishes), and CJK-aware length budgets. Bugs in any of those
 * downstream layers can ship a degraded `<head>` even when manifest.json
 * is clean.
 *
 * Gates applied per resolved entry (English only by default — the per-
 * language outputs are validated by `validate-manifest-seo.js`):
 *
 *   1. **title-empty**       — `entry.title` must be a non-empty string.
 *   2. **title-length**      — effective length in `[TITLE_MIN_LENGTH,
 *      TITLE_MAX_LENGTH]` after CJK 2× weighting.
 *   3. **title-ellipsis**    — must not end with `…` or `...` (mid-
 *      sentence truncation regression).
 *   4. **description-empty** — `entry.description` must be a non-empty
 *      string.
 *   5. **description-length** — effective length in `[DESCRIPTION_MIN_LENGTH,
 *      DESCRIPTION_MAX_LENGTH]` after CJK 2× weighting.
 *   6. **description-ellipsis** — must not end with `…` / `...`.
 *   7. **forbidden-prefix**  — title/description must not start with a
 *      Stage-B preamble label (`Run:`, `Purpose:`, `BLUF:`, …).
 *   8. **leaky-runid**       — title/description must not contain
 *      internal run-id tokens or "analysis run" jargon.
 *   9. **title-uniqueness**  — when ≥2 runs share the same `(date,
 *      articleType)`, their resolved titles must differ (typically via
 *      the `— Run N` qualifier produced by `composeContextualTitle`).
 *  10. **title-ellipsis-cut** — title rejected by resolver predicate
 *      `looksLikeEllipsisCut` (trailing `…` / `...`). Fires alongside
 *      `title-ellipsis` for backwards compatibility.
 *  11. **title-doc-id**      — title is a bare adopted-text doc-ID
 *      (`TA-NN-YYYY-NNNN`), never an editorial headline.
 *  12. **title-section-header** — title is a bold-prose section header
 *      from `executive-brief.md` (`Strategic significance`,
 *      `Threat Level`, `Key Assumptions Check`, …).
 *  13. **title-sentence-fragment** — title is a complete sentence
 *      (single trailing period, ≥4 words) leaked from a BLUF / lede
 *      paragraph rather than a noun-phrase headline.
 *  14. **description-leaky-section-header** — description starts with
 *      a bold-prose section header label (lead phrase before `.:`).
 *
 * Gates 10–14 ship as `severity: 'advisory'` — they are surfaced in
 * the JSON report's `totals.advisories` / `totals.byGateAdvisory` and
 * printed with a ⚠️  prefix, but they do NOT count toward the
 * fail-count or exit code. This lets the validator catch resolver
 * regressions immediately without breaking CI on legacy articles that
 * pre-date the resolver-tightening work. Promote to failure-class in a
 * follow-up once the legacy data is regenerated.
 *
 * The process exits with code 1 if any failure-class violations exist
 * (unless `--no-fail` is passed for advisory mode).
 *
 * Invocation:
 *   node scripts/validate-article-seo.js \
 *     [--repo-root <path>] \
 *     [--paths <runDir>...]      # validate specific runDirs only
 *     [--lang en]                # default 'en'
 *     [--report <path>]          # write JSON report; default stdout
 *     [--no-fail]                # exit 0 even when violations found
 *     [--quiet]                  # suppress per-run logging
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { ALL_LANGUAGES } from './constants/language-core.js';
import { discoverAnalysisRuns } from './aggregator/generator/discovery.js';
import { resolveRunSeo } from './dump-article-seo.js';
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  FORBIDDEN_PATTERNS,
  FORBIDDEN_PREFIXES,
  FORBIDDEN_SUBSTRINGS,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  detectForbiddenPrefix,
  detectLeakyRunIdOrJargon,
  effectiveTextLength,
} from './validate-manifest-seo.js';
import { aggregateByKey } from './validate-brief-translations.js';
import {
  findTitleRejectionReason,
  looksLikeSectionHeader,
} from './aggregator/metadata/title-rejection.js';

/** Trailing-ellipsis detector: literal `…` or three ASCII periods. */
export const TRAILING_ELLIPSIS_RE = /(?:…|\.{3})\s*$/u;

/**
 * Detect whether a value ends with an ellipsis. Returns the matching
 * fragment for the violation message, or null when the value is clean.
 *
 * @param {string} value
 * @returns {string | null}
 */
export function detectTrailingEllipsis(value) {
  if (typeof value !== 'string') return null;
  const m = TRAILING_ELLIPSIS_RE.exec(value);
  return m ? m[0] : null;
}

/**
 * Resolve a single run through the same path as the article generator
 * and apply the SEO gates to the resolved English entry. Pushes
 * violations into the accumulator.
 *
 * @param {object} ctx
 * @param {string} ctx.runDir
 * @param {string} ctx.repoRoot
 * @param {string} ctx.lang
 * @param {Array<object>} ctx.violations
 * @returns {ReturnType<typeof resolveRunSeo> | null} The resolved
 *   record (or null if resolution threw — in which case a `resolve`
 *   gate violation has been pushed).
 */
function validateOneRun(ctx) {
  const { runDir, repoRoot, lang, violations } = ctx;
  const runDirRel = path.relative(repoRoot, runDir).split(path.sep).join('/');
  let record;
  try {
    record = resolveRunSeo({ runDir, repoRoot, lang });
  } catch (err) {
    violations.push({
      runDir: runDirRel,
      lang,
      gate: 'resolve',
      message: `resolveRunSeo failed: ${err.message}`,
    });
    return null;
  }
  const { entry } = record;
  applyFieldGates({
    runDirRel,
    lang,
    kind: 'title',
    value: entry.title,
    minLen: TITLE_MIN_LENGTH,
    maxLen: TITLE_MAX_LENGTH,
    violations,
  });
  applyFieldGates({
    runDirRel,
    lang,
    kind: 'description',
    value: entry.description,
    minLen: DESCRIPTION_MIN_LENGTH,
    maxLen: DESCRIPTION_MAX_LENGTH,
    violations,
  });
  return record;
}

/**
 * Apply the empty / length / ellipsis / forbidden-prefix / leaky-runid
 * gates to a single (kind, value) projection.
 *
 * @param {object} ctx
 * @param {string} ctx.runDirRel
 * @param {string} ctx.lang
 * @param {'title' | 'description'} ctx.kind
 * @param {string} ctx.value
 * @param {number} ctx.minLen
 * @param {number} ctx.maxLen
 * @param {Array<object>} ctx.violations
 */
function applyFieldGates(ctx) {
  const { runDirRel, lang, kind, value, minLen, maxLen, violations } = ctx;
  if (typeof value !== 'string' || value.trim().length === 0) {
    violations.push({
      runDir: runDirRel,
      lang,
      gate: `${kind}-empty`,
      message: `${kind} resolved to empty / non-string value`,
    });
    return;
  }
  const length = effectiveTextLength(value);
  if (length < minLen || length > maxLen) {
    violations.push({
      runDir: runDirRel,
      lang,
      gate: `${kind}-length`,
      message: `${kind} has effective length ${length}; expected ${minLen}–${maxLen}`,
    });
  }
  const ellipsis = detectTrailingEllipsis(value);
  if (ellipsis) {
    violations.push({
      runDir: runDirRel,
      lang,
      gate: `${kind}-ellipsis`,
      message: `${kind} ends with "${ellipsis}" — mid-sentence truncation is forbidden`,
    });
  }
  const prefix = detectForbiddenPrefix(value);
  if (prefix) {
    violations.push({
      runDir: runDirRel,
      lang,
      gate: 'forbidden-prefix',
      message: `${kind} begins with reserved Stage-B label "${prefix}"`,
    });
  }
  const leaked = detectLeakyRunIdOrJargon(value);
  if (leaked) {
    violations.push({
      runDir: runDirRel,
      lang,
      gate: 'leaky-runid',
      message: `${kind} contains internal token "${leaked}"`,
    });
  }
  applyKindSpecificRejectionGates(ctx);
}

/**
 * Apply the resolver-aligned title-rejection predicates from
 * `src/aggregator/metadata/title-rejection.ts`. Keeping validator and
 * resolver in lock-step ensures the same regression that the resolver
 * already rejects can never sneak through into a shipped `<title>` or
 * `<meta description>`.
 *
 * Emitted gates (deferred PR #2163 follow-up):
 *
 *   - `title-ellipsis-cut`            — trailing `…` / `...`
 *   - `title-doc-id`                  — bare `TA-NN-YYYY-NNNN` doc-ID
 *   - `title-section-header`          — bold-prose section header
 *   - `title-sentence-fragment`       — leaked complete sentence
 *   - `description-leaky-section-header` — description starts with a
 *     bold-prose section header label (`Strategic significance: …`,
 *     `Threat Level: …`, …)
 *
 * @param {object} ctx
 * @param {string} ctx.runDirRel
 * @param {string} ctx.lang
 * @param {'title' | 'description'} ctx.kind
 * @param {string} ctx.value
 * @param {Array<object>} ctx.violations
 */
/**
 * Evaluate the resolver-aligned rejection gates for a single
 * `(kind, value)` pair and return the gate names that fire. Pure,
 * dependency-free, used by both {@link applyKindSpecificRejectionGates}
 * and the unit tests to keep validator and resolver in lock-step.
 *
 * @param {'title' | 'description'} kind
 * @param {string} value
 * @returns {string[]} Zero or more gate names (e.g. `title-doc-id`,
 *   `description-leaky-section-header`).
 */
export function evaluateResolverRejectionGates(kind, value) {
  if (typeof value !== 'string' || value.length === 0) return [];
  if (kind === 'title') {
    const reason = findTitleRejectionReason(value);
    return reason ? [`title-${reason}`] : [];
  }
  if (kind === 'description' && detectDescriptionLeadSectionHeader(value)) {
    return ['description-leaky-section-header'];
  }
  return [];
}

function applyKindSpecificRejectionGates(ctx) {
  const { runDirRel, lang, kind, value, violations } = ctx;
  const gates = evaluateResolverRejectionGates(kind, value);
  for (const gate of gates) {
    violations.push({
      runDir: runDirRel,
      lang,
      gate,
      // The 5 resolver-aligned gates ship as `advisory` so the validator
      // can surface them in the report (and unit tests can lock the
      // signal) without immediately failing CI on the 25 legacy
      // articles that pre-date the resolver-tightening work. Promote to
      // failure-class in a follow-up once those runs are regenerated.
      severity: 'advisory',
      message:
        gate === 'description-leaky-section-header'
          ? `description starts with a bold-prose section header: "${value}"`
          : `title rejected by resolver predicate (${gate.slice('title-'.length)}): "${value}"`,
    });
  }
}

/**
 * `true` when a description's lead phrase (first sentence or first
 * bold-label segment) is a denylisted section header. Splits on the
 * first sentence terminator (`.`, `:`, `…`, `?`, `!`) and asks the
 * canonical {@link looksLikeSectionHeader} predicate.
 *
 * @param {string} value
 * @returns {boolean}
 */
function detectDescriptionLeadSectionHeader(value) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const m = /^([^.:!?\u2026]+)/u.exec(trimmed);
  const lead = (m ? m[1] : trimmed).trim();
  return looksLikeSectionHeader(lead);
}

/**
 * After resolving every run, detect duplicate titles within the same
 * `(date, articleType)` collision group. The `— Run N` qualifier from
 * `composeContextualTitle` is the contracted differentiator for
 * same-date/same-articleType republishes; missing it is a
 * uniqueness-gate failure.
 *
 * @param {Array<{record: ReturnType<typeof resolveRunSeo>, lang: string}>} resolvedList
 * @param {Array<object>} violations
 */
function detectDuplicateTitles(resolvedList, violations) {
  /** @type {Map<string, Array<{record: any, lang: string}>>} */
  const groups = new Map();
  for (const item of resolvedList) {
    const key = `${item.record.date}|${item.record.articleType}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }
  for (const [key, items] of groups.entries()) {
    if (items.length < 2) continue;
    /** @type {Map<string, string[]>} */
    const byTitle = new Map();
    for (const it of items) {
      const t = it.record.entry.title;
      const bucket = byTitle.get(t);
      if (bucket) bucket.push(it.record.runDirRel);
      else byTitle.set(t, [it.record.runDirRel]);
    }
    for (const [title, dirs] of byTitle.entries()) {
      if (dirs.length < 2) continue;
      violations.push({
        runDir: dirs.join(', '),
        lang: items[0].lang,
        gate: 'title-uniqueness',
        affectedRuns: dirs,
        message:
          `${dirs.length} runs in collision group "${key}" share the ` +
          `resolved title "${title}" — composeContextualTitle must ` +
          `append a "— Run N" qualifier (or equivalent) so the per-run ` +
          `articles are distinguishable in SERPs and social cards`,
      });
    }
  }
}

/**
 * Run validation across a list of run directories.
 *
 * @param {string[]} runDirs
 * @param {string} repoRoot
 * @param {{ quiet?: boolean, lang?: string }} options
 */
export function runValidation(runDirs, repoRoot, { quiet = false, lang = 'en' } = {}) {
  const allViolations = [];
  /** @type {Array<{record: ReturnType<typeof resolveRunSeo>, lang: string}>} */
  const resolved = [];
  for (const runDir of runDirs) {
    const before = allViolations.length;
    const record = validateOneRun({ runDir, repoRoot, lang, violations: allViolations });
    const runDirRel = path.relative(repoRoot, runDir).split(path.sep).join('/');
    if (record) resolved.push({ record, lang });
    const added = allViolations.length - before;
    if (!quiet) {
      if (added > 0) {
        for (const entry of allViolations.slice(before)) {
          const prefix = entry.severity === 'advisory' ? '⚠️ ' : '❌';
          const stream = entry.severity === 'advisory' ? process.stdout : process.stderr;
          stream.write(`${prefix} ${runDirRel} [${entry.gate}] ${entry.message}\n`);
        }
      } else {
        process.stdout.write(`✅ ${runDirRel}\n`);
      }
    }
  }
  const beforeUniq = allViolations.length;
  detectDuplicateTitles(resolved, allViolations);
  if (!quiet) {
    for (const entry of allViolations.slice(beforeUniq)) {
      const prefix = entry.severity === 'advisory' ? '⚠️ ' : '❌';
      const stream = entry.severity === 'advisory' ? process.stdout : process.stderr;
      stream.write(`${prefix} ${entry.runDir} [${entry.gate}] ${entry.message}\n`);
    }
  }
  return allViolations;
}

/**
 * Parse CLI argv. Exported for unit tests.
 */
export function parseArgs(argv) {
  const opts = {
    repoRoot: process.cwd(),
    paths: [],
    lang: 'en',
    report: null,
    fail: true,
    quiet: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--repo-root':
        opts.repoRoot = argv[i + 1];
        i += 1;
        break;
      case '--paths':
        while (i + 1 < argv.length) {
          const next = argv[i + 1];
          if (next === '--') {
            i += 1;
            break;
          }
          if (next.startsWith('--')) break;
          opts.paths.push(next);
          i += 1;
        }
        break;
      case '--lang':
        opts.lang = argv[i + 1];
        i += 1;
        break;
      case '--report':
        opts.report = argv[i + 1];
        i += 1;
        break;
      case '--no-fail':
        opts.fail = false;
        break;
      case '--quiet':
        opts.quiet = true;
        break;
      case '--help':
      case '-h':
        process.stdout.write(
          'Usage: validate-article-seo.js [--repo-root <path>] ' +
            '[--paths <runDir>... [--]] [--lang <code>] [--report <path>] [--no-fail] [--quiet]\n'
        );
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          throw new Error(`Unknown flag: ${arg}`);
        }
    }
  }
  if (!ALL_LANGUAGES.includes(opts.lang)) {
    throw new Error(`Unsupported --lang "${opts.lang}"`);
  }
  return opts;
}

/** Main entry point. */
export function main(argv) {
  const opts = parseArgs(argv);
  const runDirs =
    opts.paths.length > 0
      ? opts.paths.map((p) => path.resolve(opts.repoRoot, p))
      : discoverAnalysisRuns(opts.repoRoot).map((r) => r.runDir);

  const violations = runValidation(runDirs, opts.repoRoot, {
    quiet: opts.quiet,
    lang: opts.lang,
  });
  const failingViolations = violations.filter((v) => v.severity !== 'advisory');
  const advisoryViolations = violations.filter((v) => v.severity === 'advisory');

  const report = {
    generatedAt: new Date().toISOString(),
    lang: opts.lang,
    totals: {
      runsChecked: runDirs.length,
      violations: failingViolations.length,
      advisories: advisoryViolations.length,
      byGate: aggregateByKey(failingViolations, 'gate'),
      byGateAdvisory: aggregateByKey(advisoryViolations, 'gate'),
    },
    violations,
  };

  const json = `${JSON.stringify(report, null, 2)}\n`;
  if (opts.report) {
    fs.mkdirSync(path.dirname(opts.report), { recursive: true });
    fs.writeFileSync(opts.report, json);
  } else if (!opts.quiet) {
    process.stdout.write(json);
  }

  if (failingViolations.length > 0 && opts.fail) {
    process.exit(1);
  }
  return report;
}

/* c8 ignore start */
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`validate-article-seo: ${err.message}\n`);
    process.exit(1);
  }
}
/* c8 ignore stop */

// Re-export for tests
export {
  FORBIDDEN_PATTERNS,
  FORBIDDEN_PREFIXES,
  FORBIDDEN_SUBSTRINGS,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
};
