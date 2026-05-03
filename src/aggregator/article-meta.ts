// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ArticleMeta
 * @description Deterministic emitter for `article-meta.json` — a small
 * structured sidecar written next to `article.md` in every analysis run
 * directory. Consumers (HTML SEO/structured data, news indexes, RSS) read
 * this file instead of re-parsing the article body.
 *
 * The file is a pure function of the run inputs:
 *   - `manifest.json`     → article type, date, run id, gate result
 *   - `executive-brief.md`/`synthesis-summary.md` → top finding (lead)
 *   - `intelligence/synthesis-summary.md`         → key takeaways (3–7 bullets)
 *   - `risk-scoring/risk-matrix.md` (if present)  → top risks
 *   - `intelligence/parliamentary-calendar-projection.md` /
 *     `extended/forward-indicators.md`            → key dates / what to watch
 *   - `intelligence/economic-context.md`          → IMF / WorldBank macro hook
 *
 * Same artifact bytes in → same `article-meta.json` bytes out (verified by
 * the determinism test).
 */

import fs from 'fs';
import path from 'path';
import {
  extractExecutiveLead,
  extractLeadParagraph,
  trimToLeadSentence,
} from './lead-extractor.js';
import {
  buildKeyTakeaways as _buildKeyTakeaways,
  jaccardSimilarity,
  extractStrongBullets,
  harvestCandidates,
  MAX_TAKEAWAYS,
  MIN_TAKEAWAYS,
} from './key-takeaways.js';

/** Shape of `article-meta.json`. */
export interface ArticleMeta {
  /** ISO date of the run (`YYYY-MM-DD`). */
  readonly date: string;
  /** Article type slug (e.g. `breaking`). */
  readonly articleType: string;
  /** Stable run identifier from the manifest. */
  readonly runId: string;
  /** Latest non-PENDING gate result. */
  readonly gateResult: string;
  /** Article slug used by the news pages (`<date>-<type>[-<suffix>]`). */
  readonly slug: string;
  /** Run-relative path of the canonical `article.md`. */
  readonly articlePath: string;
  /** One-sentence executive lead — the strongest finding, distilled. */
  readonly topFinding: string;
  /** 3–7 deterministic key takeaways harvested from synthesis-summary. */
  readonly keyTakeaways: readonly string[];
  /** Top political risks (artifact-driven, may be empty). */
  readonly topRisks: readonly string[];
  /** Key dated triggers / "what to watch" items. */
  readonly keyDates: readonly string[];
  /** Key actors / political groups identified by the artifacts. */
  readonly keyActors: readonly string[];
  /** Optional IMF / WorldBank macro hook surfaced as a sidebar callout. */
  readonly macroContext: string;
  /**
   * Run-relative paths of every artifact whose content fed into this meta
   * record — emitted so the HTML SEO layer can build `isBasedOn` arrays
   * without re-walking the run directory.
   */
  readonly sources: readonly string[];
}

/** Options for {@link buildArticleMeta}. */
export interface BuildArticleMetaOptions {
  /** Absolute path to the analysis run directory. */
  readonly runDir: string;
  /** Absolute path to the repository root (used for repo-relative paths). */
  readonly repoRoot: string;
  /** ISO date of the run (`YYYY-MM-DD`). */
  readonly date: string;
  /** Article type slug. */
  readonly articleType: string;
  /** Stable run identifier from the manifest. */
  readonly runId: string;
  /** Latest non-PENDING gate result. */
  readonly gateResult: string;
  /** Article slug used by the news pages. */
  readonly slug: string;
}

/** Hard cap on how many entries each list field carries. */
const MAX_LIST_ENTRIES = 8;

/** Regex matching a YYYY-MM-DD date, month-year, or Qn YYYY pattern. */
const DATE_TRIGGER_RE =
  /\b(\d{4}-\d{2}-\d{2}|Q[1-4]\s+\d{4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})\b/i;

/** Headings in economic-context artifacts that contain macro prose. */
const MACRO_PREFERRED_HEADINGS = [
  'judgement',
  'judgment',
  'imf weo',
  'imf baseline',
  'salient economic',
  'macro',
  'eurozone macro',
];

/**
 * De-duplicate candidates using Jaccard similarity, capped at `maxItems`.
 * Unlike `dedupeTakeaways` from key-takeaways.ts, this helper does
 * not impose the `MAX_TAKEAWAYS` ceiling — callers provide their own cap.
 *
 * @param candidates - Ordered list of bullet body strings
 * @param maxItems - Maximum number of de-duplicated items to return
 * @returns De-duplicated list capped at `maxItems`
 */
function dedupeItems(candidates: readonly string[], maxItems: number): string[] {
  const THRESHOLD = 0.7;
  const out: string[] = [];
  for (const candidate of candidates) {
    if (out.length >= maxItems) break;
    const isDuplicate = out.some((existing) => jaccardSimilarity(existing, candidate) >= THRESHOLD);
    if (!isDuplicate) out.push(candidate);
  }
  return out;
}

/**
 * Extract a macro-context lead from an economic-context artifact, targeting
 * IMF / Judgement headings. Falls back to the first prose paragraph after
 * skipping metadata-style preamble lines.
 *
 * @param markdown - Raw artifact Markdown
 * @returns Trimmed lead sentence, or `''`
 */
function extractMacroLeadParagraph(markdown: string): string {
  // Try to find a macro-specific preferred section first.
  const lines = markdown.split(/\r?\n/);
  let heading = '';
  let buffer: string[] = [];
  let inFence = false;

  const tryExtract = (buf: string[]): string => {
    for (const rawLine of buf) {
      const trimmed = (rawLine ?? '').trim();
      if (trimmed === '' || /^[-*+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) continue;
      if (/^(>|<|!?\[)/.test(trimmed)) continue;
      if (/^\*\*\s*[A-Za-z][^*]+:\*\*/.test(trimmed)) continue;
      if (/^\|/.test(trimmed)) continue; // skip table rows
      if (/^-{2,}$/.test(trimmed)) continue; // skip horizontal rules
      return trimmed;
    }
    return '';
  };

  for (const rawLine of lines) {
    const line = rawLine ?? '';
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      const prev = tryExtract(buffer);
      if (
        prev &&
        MACRO_PREFERRED_HEADINGS.some((h) =>
          heading
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
            .trim()
            .includes(h)
        )
      ) {
        return prev;
      }
      heading = (headingMatch[2] ?? '').trim();
      buffer = [];
      continue;
    }
    buffer.push(line);
  }
  // Flush last section.
  const lastPrev = tryExtract(buffer);
  if (
    lastPrev &&
    MACRO_PREFERRED_HEADINGS.some((h) =>
      heading
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
        .trim()
        .includes(h)
    )
  ) {
    return lastPrev;
  }
  // Final fallback: use the generic extractor result (lazy, avoids double parse in the common path).
  return extractLeadParagraph(markdown);
}

/**
 * Mine top political risks from `risk-scoring/risk-matrix.md` (or its
 * historic variants under the same directory). Falls back to the first
 * bullets in `risk-scoring/quantitative-swot.md` when the matrix is
 * absent. Returns at most {@link MAX_LIST_ENTRIES} bullets.
 *
 * @param runDir - Absolute path to the analysis run directory
 * @returns Ordered list of risk bullet bodies
 */
export function extractTopRisks(runDir: string): string[] {
  const sources = [
    'risk-scoring/risk-matrix.md',
    'risk-scoring/political-risk.md',
    'risk-scoring/quantitative-swot.md',
  ];
  for (const rel of sources) {
    const abs = path.join(runDir, rel);
    if (!fs.existsSync(abs)) continue;
    const markdown = fs.readFileSync(abs, 'utf8');
    const bullets = extractStrongBullets(markdown).slice(0, MAX_LIST_ENTRIES);
    if (bullets.length > 0) return bullets;
  }
  return [];
}

/**
 * Mine forward-looking dated items from
 * `intelligence/parliamentary-calendar-projection.md` and
 * `extended/forward-indicators.md`. Returns at most
 * {@link MAX_LIST_ENTRIES} bullets, de-duplicated across the two sources.
 *
 * @param runDir - Absolute path to the analysis run directory
 * @returns Ordered list of dated trigger bullet bodies
 */
export function extractKeyDates(runDir: string): string[] {
  const sources = [
    'intelligence/parliamentary-calendar-projection.md',
    'extended/forward-indicators.md',
    'intelligence/legislative-pipeline-forecast.md',
    'intelligence/scenario-forecast.md',
  ];
  const candidates = harvestCandidates(runDir, sources);
  // Filter for bullets that contain an explicit date trigger, then dedupe.
  const dated = candidates.filter((t) => DATE_TRIGGER_RE.test(t.body)).map((t) => t.body);
  return dedupeItems(dated, MAX_LIST_ENTRIES);
}

/**
 * Mine key actors / political groups from
 * `classification/actor-mapping.md` and `intelligence/stakeholder-map.md`.
 * Falls through to coalition-dynamics when the canonical actor map is
 * missing. Returns at most {@link MAX_LIST_ENTRIES} bullets.
 *
 * @param runDir - Absolute path to the analysis run directory
 * @returns Ordered list of actor bullet bodies
 */
export function extractKeyActors(runDir: string): string[] {
  const sources = [
    'classification/actor-mapping.md',
    'intelligence/stakeholder-map.md',
    'intelligence/coalition-dynamics.md',
  ];
  for (const rel of sources) {
    const abs = path.join(runDir, rel);
    if (!fs.existsSync(abs)) continue;
    const markdown = fs.readFileSync(abs, 'utf8');
    const bullets = extractStrongBullets(markdown).slice(0, MAX_LIST_ENTRIES);
    if (bullets.length > 0) return bullets;
  }
  return [];
}

/**
 * Resolve a one-line IMF / WorldBank macro context callout from
 * `intelligence/economic-context.md`. Returns the trimmed lead sentence
 * of the artifact, or `''` when the artifact is missing.
 *
 * @param runDir - Absolute path to the analysis run directory
 * @returns IMF-backed macro hook, or `''`
 */
export function extractMacroContext(runDir: string): string {
  const abs = path.join(runDir, 'intelligence/economic-context.md');
  if (!fs.existsSync(abs)) return '';
  const markdown = fs.readFileSync(abs, 'utf8');
  const paragraph = extractMacroLeadParagraph(markdown);
  return trimToLeadSentence(paragraph);
}

/**
 * Resolve the deterministic 3–7 key-takeaway bullets used in both the
 * Markdown article body and `article-meta.json`.
 *
 * @param runDir - Absolute path to the analysis run directory
 * @returns Ordered list of takeaway bodies (3–7 entries)
 */
export function extractKeyTakeaways(runDir: string): string[] {
  const sources: readonly string[] = [
    'intelligence/synthesis-summary.md',
    'intelligence/intelligence-assessment.md',
    'extended/executive-brief.md',
    'executive-brief.md',
  ];
  const candidates = harvestCandidates(runDir, sources);
  const bodies = candidates.map((t) => t.body);
  const selected = dedupeItems(bodies, MAX_TAKEAWAYS);
  if (selected.length < MIN_TAKEAWAYS) return [];
  return selected;
}

/**
 * Build the deterministic `ArticleMeta` record for one run. Pure function
 * of the on-disk artifacts plus the resolved manifest fields.
 *
 * @param options - Run-level metadata + absolute run directory
 * @returns Frozen, JSON-serialisable {@link ArticleMeta}
 */
export function buildArticleMeta(options: BuildArticleMetaOptions): ArticleMeta {
  const { runDir, repoRoot, date, articleType, runId, gateResult, slug } = options;
  const topFinding = extractExecutiveLead(runDir);
  const keyTakeaways = extractKeyTakeaways(runDir);
  const topRisks = extractTopRisks(runDir);
  const keyDates = extractKeyDates(runDir);
  const keyActors = extractKeyActors(runDir);
  const macroContext = extractMacroContext(runDir);
  const sources = computeSources(runDir);
  const runDirRelPath = path.relative(repoRoot, runDir).split(path.sep).join('/');
  return {
    date,
    articleType,
    runId,
    gateResult,
    slug,
    articlePath: `${runDirRelPath}/article.md`,
    topFinding,
    keyTakeaways,
    topRisks,
    keyDates,
    keyActors,
    macroContext,
    sources,
  };
}

/**
 * Compute the run-relative paths of every artifact that fed into the meta
 * record, in deterministic alphabetical order. Used as `isBasedOn` data
 * by the HTML SEO layer.
 *
 * @param runDir - Absolute path to the analysis run directory
 * @returns Sorted list of run-relative paths that exist on disk
 */
function computeSources(runDir: string): string[] {
  const candidates = [
    'executive-brief.md',
    'extended/executive-brief.md',
    'intelligence/synthesis-summary.md',
    'intelligence/intelligence-assessment.md',
    'intelligence/economic-context.md',
    'intelligence/parliamentary-calendar-projection.md',
    'intelligence/legislative-pipeline-forecast.md',
    'intelligence/scenario-forecast.md',
    'extended/forward-indicators.md',
    'risk-scoring/risk-matrix.md',
    'risk-scoring/political-risk.md',
    'risk-scoring/quantitative-swot.md',
    'classification/actor-mapping.md',
    'intelligence/stakeholder-map.md',
    'intelligence/coalition-dynamics.md',
  ];
  return candidates.filter((rel) => fs.existsSync(path.join(runDir, rel))).sort();
}

/**
 * Serialise an {@link ArticleMeta} as a stable JSON string with a trailing
 * newline. Keys are emitted in declaration order (insertion-order, matching
 * the interface layout). Determinism guarantee: same input → same bytes.
 *
 * @param meta - Article meta record
 * @returns JSON string ready to be written next to `article.md`
 */
export function serializeArticleMeta(meta: ArticleMeta): string {
  // JSON.stringify emits keys in insertion order — the {@link ArticleMeta}
  // shape declares its keys in canonical reading order, so the output is
  // already deterministic. We add a trailing newline for POSIX hygiene.
  return `${JSON.stringify(meta, null, 2)}\n`;
}

/**
 * Convenience wrapper that re-exports {@link _buildKeyTakeaways} so the
 * aggregator can import the rendered Markdown block from a single module.
 */
export { _buildKeyTakeaways as buildKeyTakeawaysMarkdown };
