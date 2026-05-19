// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/Articles/Metadata
 * @description Manifest history merging, gate-result reading, and
 * article-meta extraction from generated HTML.
 */

import fs from 'fs';
import path from 'path';
import { applyHorizonProfile } from '../../aggregator/manifest/manifest-writer.js';
import type { Manifest } from '../../aggregator/manifest/types.js';
import { ensureDirectoryExists } from '../fs/directory.js';
import { decodeHtmlEntities } from '../html/escape.js';

// ─── Manifest history (shared same-day folder support) ──────────────────────

/**
 * Single entry in `manifest.json.history[]` recording one run that wrote
 * artifacts into a shared same-day analysis folder.
 *
 * When the analysis workflow re-runs against the same
 * `analysis/daily/${DATE}/${TYPE}/` directory, it appends a new entry
 * instead of triggering the `-2` suffix in `resolveUniqueAnalysisDir`.
 * The article workflow reads this history to decide whether to consume or
 * skip the folder.
 */
export interface AnalysisManifestHistoryEntry {
  /** Stable identifier for this attempt (e.g. `breaking-run60-1729876543`) */
  readonly runId: string;
  /** ISO-8601 UTC timestamp when the run started */
  readonly startedAt: string;
  /** ISO-8601 UTC timestamp when the run finished (or last wrote) */
  readonly finishedAt: string;
  /** Short git SHA of the commit the run was produced against (optional) */
  readonly commit?: string;
  /** Stage-C result: GREEN | GREEN_WITH_WARNINGS | ANALYSIS_ONLY | PENDING */
  readonly gateResult: 'GREEN' | 'GREEN_WITH_WARNINGS' | 'ANALYSIS_ONLY' | 'PENDING';
  /** Relative-path list of analysis files written or refreshed during the run */
  readonly filesWritten: readonly string[];
}

/**
 * Merge a new run entry into the `history[]` array of the manifest file at
 * `manifestPath`, creating the file if it doesn't exist.
 *
 * The merge is additive: existing history entries are preserved, and the new
 * entry is appended. When `manifestPath` already has a manifest with
 * top-level fields (runId, date, articleType, etc.), those fields are left
 * untouched — only `history[]` is appended to and the top-level
 * `updatedAt` timestamp is refreshed.
 *
 * This supports the stable same-day analysis folder layout
 * (`analysis/daily/${DATE}/${TYPE}/`) where repeated analysis runs
 * overwrite/upgrade artifacts but each attempt adds a history entry.
 *
 * @param manifestPath - Absolute path to the run's manifest.json.
 * @param entry - History entry describing this run.
 */
export function mergeManifestHistory(
  manifestPath: string,
  entry: AnalysisManifestHistoryEntry
): void {
  ensureDirectoryExists(path.dirname(manifestPath));
  let manifest: Record<string, unknown> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      const raw = fs.readFileSync(manifestPath, 'utf-8');
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        manifest = parsed as Record<string, unknown>;
      }
    } catch {
      manifest = { corruptManifestRecoveredAt: new Date().toISOString() };
    }
  }

  const existingHistory = Array.isArray(manifest['history'])
    ? (manifest['history'] as AnalysisManifestHistoryEntry[])
    : [];

  manifest['history'] = [...existingHistory, entry];
  manifest['updatedAt'] = entry.finishedAt;

  const enriched = applyHorizonProfile(manifest as unknown as Manifest, { overwrite: true });
  if (enriched.horizonProfile) {
    manifest['horizonProfile'] = enriched.horizonProfile;
  } else {
    delete manifest['horizonProfile'];
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
}

/**
 * Read the `gateResult` from the most recent entry in the manifest's
 * `history[]` array.
 *
 * Used by the article workflow to decide whether to consume a committed
 * analysis folder: `GREEN` proceeds to Stage D, everything else exits noop.
 *
 * @param manifestPath - Absolute path to the run's manifest.json.
 * @returns The latest `gateResult`, or `'PENDING'` when the manifest is
 *          missing, unreadable, or contains no history entries.
 */
export function readLatestGateResult(
  manifestPath: string
): AnalysisManifestHistoryEntry['gateResult'] {
  if (!fs.existsSync(manifestPath)) return 'PENDING';
  try {
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return 'PENDING';
    const history = (parsed as Record<string, unknown>)['history'];
    if (!Array.isArray(history) || history.length === 0) {
      const direct = (parsed as Record<string, unknown>)['gateResult'];
      if (
        direct === 'GREEN' ||
        direct === 'GREEN_WITH_WARNINGS' ||
        direct === 'ANALYSIS_ONLY' ||
        direct === 'PENDING'
      ) {
        return direct;
      }
      return 'PENDING';
    }
    const last = history[history.length - 1] as AnalysisManifestHistoryEntry | undefined;
    const gate = last?.gateResult;
    if (
      gate === 'GREEN' ||
      gate === 'GREEN_WITH_WARNINGS' ||
      gate === 'ANALYSIS_ONLY' ||
      gate === 'PENDING'
    ) {
      return gate;
    }
    return 'PENDING';
  } catch {
    return 'PENDING';
  }
}

/**
 * Find the most-recent **resolved** (non-`PENDING`) `gateResult` in a
 * manifest's `history[]` array by searching backward from the end.
 *
 * Used by the `--analysis-only` wrap-up path to carry forward the Stage-C
 * result already written by the AI agent, so the discovery history entry
 * produced by `runAnalysisStage` preserves `GREEN` / `ANALYSIS_ONLY` instead
 * of clobbering it with the default `PENDING`.
 *
 * @param manifestPath - Absolute path to the run's manifest.json.
 * @returns The latest non-PENDING `gateResult`, or `'PENDING'` when none
 *          exists or the manifest is missing / unreadable.
 */
export function readLatestResolvedGateResult(
  manifestPath: string
): AnalysisManifestHistoryEntry['gateResult'] {
  if (!fs.existsSync(manifestPath)) return 'PENDING';
  try {
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return 'PENDING';
    const history = (parsed as Record<string, unknown>)['history'];
    if (!Array.isArray(history) || history.length === 0) {
      const direct = (parsed as Record<string, unknown>)['gateResult'];
      if (direct === 'GREEN' || direct === 'GREEN_WITH_WARNINGS' || direct === 'ANALYSIS_ONLY') {
        return direct;
      }
      return 'PENDING';
    }
    for (let i = history.length - 1; i >= 0; i--) {
      const entry = history[i] as AnalysisManifestHistoryEntry | undefined;
      const gate = entry?.gateResult;
      if (gate === 'GREEN' || gate === 'GREEN_WITH_WARNINGS' || gate === 'ANALYSIS_ONLY') {
        return gate;
      }
    }
    return 'PENDING';
  } catch {
    return 'PENDING';
  }
}

/**
 * Extract title and description from a generated article HTML file.
 * Reads the predictable template structure produced by the aggregator
 * article generator. Falls back to empty strings when the file cannot
 * be read. HTML entities from the template are decoded to produce
 * plain text.
 *
 * Title resolution order:
 *   1. `<head><title>` value with the trailing ` — EU Parliament Monitor`
 *      (or historic ` | EU Parliament Monitor`) site-suffix stripped.
 *      This is where the editorial-highlights resolver + SEO backport
 *      script write their output, so using it as the primary source
 *      surfaces the strongest headline on index cards and sitemaps.
 *   2. First body `<h1>` — fallback for files whose `<title>` was never
 *      refreshed.
 *
 * NOTE: The meta description regex relies on the template's use of
 * escapeHTML(), which converts `"` to `&quot;`. Because descriptions are
 * always stored with double-quote delimiters and inner quotes are
 * HTML-encoded, the `[^"]+` pattern safely captures the full value.
 *
 * @param filepath - Path to the article HTML file
 * @returns Object with title (from head-title, else first body h1) and
 *          description (from meta description)
 */
export function extractArticleMeta(filepath: string): { title: string; description: string } {
  let title = '';
  let description = '';
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    const headTitleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/u);
    if (headTitleMatch?.[1]) {
      const rawTitle = decodeHtmlEntities(headTitleMatch[1].trim());
      const stripped = rawTitle
        .replace(/\s*—\s*EU Parliament Monitor\s*$/u, '')
        .replace(/\s*\|\s*EU Parliament Monitor\s*$/u, '')
        .trim();
      if (stripped.length > 0) title = stripped;
    }
    if (!title) {
      const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/u);
      if (titleMatch?.[1]) {
        title = decodeHtmlEntities(titleMatch[1].trim());
      }
    }
    const descMatch = content.match(/<meta name="description" content="([^"]+)"/u);
    if (descMatch?.[1]) {
      description = decodeHtmlEntities(descMatch[1]);
    }
  } catch {
    // File not readable – return empty strings
  }
  return { title, description };
}
