// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/ArtifactWalker
 * @description Shared editorial-artefact discovery helpers: candidate-list
 * walker, file-existence guards, lede + H1 helper composition. Extracted
 * from `artifact-highlight.ts` to keep individual file sizes under 400 LOC.
 *
 * Exported surface: `EDITORIAL_ARTEFACT_CANDIDATES` (ordered candidate list),
 * `readArtefactBody` (SPDX-aware file reader), `safeReaddir` (fault-tolerant
 * directory listing), and `scanCandidatesForHighlight` (composed walker).
 * Internal helper `probeCandidateForHighlight` is not exported so that
 * `editorial-highlight.ts` can call the walker without depending on the
 * lower-level per-file probe logic.
 */

import fs from 'fs';
import path from 'path';
import { extractFirstH1 } from './h1-extractor.js';
import { extractLedeAfterHeading, extractStrongProseLine } from './lede-extractor.js';
import {
  isGenericHeading,
  isArtifactCategoryHeading,
  stripArtifactCategoryAffix,
} from './heading-rules.js';
import { truncateTitle } from './text-utils.js';
import { extractPriorityFindingHighlight } from './priority-finding-highlight.js';

/** Ordered list of artefact filenames that typically carry the editorial H1. */
export const EDITORIAL_ARTEFACT_CANDIDATES: readonly string[] = [
  // `executive-brief.md` is the canonical Riksdagsmonitor-aligned editorial
  // artefact (see `analysis/methodologies/ai-driven-analysis-guide.md`).
  // It always carries the journalist's BLUF and a `## 60-Second Read`
  // paragraph that is the lede — preferring it over `synthesis-summary.md`
  // keeps Stage-B internal vocabulary ("Purpose: This artifact provides …")
  // out of the SEO-critical `<title>` and `<meta description>` surfaces.
  'executive-brief.md',
  'extended/executive-brief.md',
  'intelligence/synthesis-summary.md',
  'intelligence/executive-summary.md',
  'intelligence/intelligence-briefing.md',
  'executive-summary.md',
  'intelligence-briefing.md',
  'synthesis-summary.md',
  'breaking-news-analysis.md',
  'committee-activity-report.md',
  'legislative-pipeline-analysis.md',
  'weekly-outlook.md',
  'monthly-outlook.md',
  'week-in-review.md',
  'month-in-review.md',
  'motions-analysis.md',
  'propositions-analysis.md',
];

/**
 * Read an artefact file, skipping any SPDX HTML-comment header rows so the
 * first-H1 / first-prose logic is never derailed by the REUSE preamble.
 *
 * @param abs - Absolute file path
 * @returns File contents with SPDX comment lines dropped
 */
export function readArtefactBody(abs: string): string {
  let text: string;
  try {
    text = fs.readFileSync(abs, 'utf8');
  } catch {
    return '';
  }
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = (lines[i] ?? '').trim();
    if (line === '') {
      i++;
      continue;
    }
    if (line.startsWith('<!--') && line.endsWith('-->')) {
      i++;
      continue;
    }
    break;
  }
  return lines.slice(i).join('\n');
}

/**
 * `fs.readdirSync` wrapped to never throw for missing or unreadable
 * directories.
 *
 * @param dir - Absolute directory path
 * @returns Entries in {@link dir} or `[]` when unreadable
 */
export function safeReaddir(dir: string): string[] {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

/**
 * Read a single candidate artefact and classify what it can contribute
 * to the highlight resolver. Extracted from
 * {@link scanCandidatesForHighlight} to keep its cognitive complexity
 * within the SonarJS budget.
 *
 * @param runDir - Absolute run directory
 * @param rel - Run-relative artefact path
 * @param articleType - Article-type slug for {@link isGenericHeading}
 * @param date - ISO run date for {@link isGenericHeading}
 * @returns
 *   - `cleanHighlight` when the artefact has a non-generic H1 (caller may
 *     return it directly)
 *   - `strippedHeadline` when the H1 is generic but yields an editorial
 *     core after {@link stripArtifactCategoryAffix}
 *   - `summary` when the artefact carries a usable lede or strong prose
 *     line (independent of the headline outcome)
 */
function probeCandidateForHighlight(
  runDir: string,
  rel: string,
  articleType: string,
  date: string
): {
  readonly cleanHighlight?: { readonly headline: string; readonly summary: string };
  readonly strippedHeadline?: string;
  readonly summary?: string;
} {
  const abs = path.join(runDir, rel);
  if (!fs.existsSync(abs)) return {};
  const body = readArtefactBody(abs);
  const headline = extractFirstH1(body);
  const lede = extractLedeAfterHeading(body);
  const summary = lede || extractStrongProseLine(body);
  if (headline && !isGenericHeading(headline, articleType, date)) {
    return { cleanHighlight: { headline: truncateTitle(headline), summary } };
  }
  // The artefact H1 is generic boilerplate (`Executive Brief — EU Parliament
  // Breaking News`). Before falling back to a stripped category-core
  // headline, try to surface the FIRST NAMED PRIORITY FINDING from the
  // brief's `## Key Developments` / `## Priority Dossiers` /
  // `## Top Findings` block. This is the canonical Stage-B authoring
  // pattern (see `analysis/templates/executive-brief.md`) — every brief
  // lists its top dossiers as `**Name** (procedure-code, date) — paragraph`
  // or `### N. Name (committee)`. Surfacing that name produces a
  // distinctive editorial headline ("Digital Markets Act Enforcement",
  // "Ukraine War Accountability") instead of a stripped category noun.
  const priority = extractPriorityFindingHighlight(body);
  if (priority?.headline && !isArtifactCategoryHeading(priority.headline)) {
    return {
      cleanHighlight: {
        headline: truncateTitle(priority.headline),
        summary: priority.summary || summary,
      },
    };
  }
  if (headline) {
    const stripped = stripArtifactCategoryAffix(headline);
    if (stripped && !isGenericHeading(stripped, articleType, date)) {
      return { strippedHeadline: truncateTitle(stripped), summary };
    }
  }
  return { summary };
}

/**
 * Walk a list of candidate artefact paths and return the first
 * non-generic headline + summary pair, plus the first usable lede
 * summary seen along the way.
 *
 * @param runDir - Absolute run directory path
 * @param candidates - Run-relative candidate filenames to probe
 * @param articleType - Article-type slug (used by {@link isGenericHeading})
 * @param date - ISO run date (used by {@link isGenericHeading})
 * @returns `{headline, summary}` where either field may be empty
 */
export function scanCandidatesForHighlight(
  runDir: string,
  candidates: readonly string[],
  articleType: string,
  date: string
): { readonly headline: string; readonly summary: string } {
  let bestSummaryOnly = '';
  for (const rel of candidates) {
    const probe = probeCandidateForHighlight(runDir, rel, articleType, date);
    if (probe.cleanHighlight) return probe.cleanHighlight;
    if (probe.strippedHeadline) {
      return { headline: probe.strippedHeadline, summary: probe.summary ?? bestSummaryOnly };
    }
    if (!bestSummaryOnly && probe.summary) {
      bestSummaryOnly = probe.summary;
    }
  }
  return { headline: '', summary: bestSummaryOnly };
}
