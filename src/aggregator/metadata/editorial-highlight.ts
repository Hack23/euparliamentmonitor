// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/EditorialHighlight
 * @description Primary editorial-artefact highlight resolver. Walks the
 * canonical list of editorial artefacts inside a run directory and returns
 * the best `{headline, summary}` pair — either a non-generic H1, a named
 * priority finding, or a stripped category-affix core — for use as the
 * article `<title>` and `<meta description>`.
 *
 * Depends on {@link artifact-walker} for shared discovery helpers and
 * {@link translated-sibling} for the translated-sibling filter.
 */

import fs from 'fs';
import {
  EDITORIAL_ARTEFACT_CANDIDATES,
  safeReaddir,
  scanCandidatesForHighlight,
} from './artifact-walker.js';
import { isTranslatedSiblingBrief } from './translated-sibling.js';

/**
 * Resolver output filenames that must NEVER be walked as a source by the
 * top-level fallback scan in {@link extractArtifactHighlight}. These are
 * either the resolver's own output (`article.md`, `article-meta.json`)
 * or per-language renderings that contain transcluded metadata-banner
 * lines (`**Threat Level:** …`, `**Key Assumptions Check**: …`) that
 * `priority-finding-highlight.ts` Pattern C would falsely accept as
 * editorial headlines. See the regression catalogue documented in
 * `scripts/validate-article-seo.js` for the smoking-gun live-site
 * defects (2026-05-22 week-ahead `<title>Threat Level</title>`,
 * 2026-05-22 committee-reports `<title>Key Assumptions Check</title>`).
 *
 * Returns `true` for resolver-output filenames.
 *
 * @param filename - Bare filename (no path), e.g. `article.md`
 * @returns `true` when the file is a resolver output and must be skipped
 */
export function isResolverOutputArtefact(filename: string): boolean {
  if (!filename) return true;
  if (filename === 'article.md') return true;
  if (filename === 'article-meta.json') return true;
  if (filename === 'article-meta.jsonl') return true;
  // Per-language article renderings: `article.<lang>.md`, `article_<lang>.md`.
  if (/^article[._][a-z]{2,3}\.md$/iu.test(filename)) return true;
  // Build sidecar files emitted by the generator pipeline.
  if (filename.endsWith('.html')) return true;
  if (filename === 'render-log.json') return true;
  return false;
}

/**
 * Attempt to read the first H1 and first prose paragraph from the first
 * existing artefact under {@link EDITORIAL_ARTEFACT_CANDIDATES}. Returns
 * `null` when no candidate artefact exists.
 *
 * @param runDir - Absolute run directory path
 * @param articleType - Article type slug (used by {@link isGenericHeading})
 * @param date - ISO run date (used by {@link isGenericHeading})
 * @returns `{headline, summary}` where either field may be empty
 */
export function extractArtifactHighlight(
  runDir: string,
  articleType: string,
  date: string
): { readonly headline: string; readonly summary: string } | null {
  if (!runDir || !fs.existsSync(runDir)) return null;

  const direct = scanCandidatesForHighlight(
    runDir,
    EDITORIAL_ARTEFACT_CANDIDATES,
    articleType,
    date
  );
  if (direct.headline) return { headline: direct.headline, summary: direct.summary };

  // Top-level fallback scan — used only when none of the canonical
  // editorial artefacts produced a non-generic H1. We must NOT pick up
  // translated sibling briefs (`executive-brief_<lang>.md`,
  // `synthesis-summary_<lang>.md`, …) here, because their H1s are
  // legitimate localized headlines that the English-only
  // {@link isGenericHeading} detector cannot recognise as boilerplate.
  // Letting them through poisoned the English `<title>` and
  // `<meta description>` for the 2026-05-15 batch with Arabic content
  // from `executive-brief_ar.md`. See {@link isTranslatedSiblingBrief}
  // and the regression test in `test/unit/article-metadata.test.js`.
  const topLevel = safeReaddir(runDir).filter(
    (f) =>
      f.endsWith('.md') &&
      f !== 'manifest.json' &&
      !isTranslatedSiblingBrief(f) &&
      !isResolverOutputArtefact(f)
  );
  const fallback = scanCandidatesForHighlight(runDir, topLevel, articleType, date);
  if (fallback.headline) return { headline: fallback.headline, summary: fallback.summary };

  const summaryOnly = direct.summary || fallback.summary;
  if (summaryOnly) {
    return { headline: '', summary: summaryOnly };
  }
  return null;
}
