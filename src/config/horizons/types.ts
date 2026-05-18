// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Config/Horizons/Types
 * @description Type definitions for the article-horizon registry.
 *
 * Extracted from `src/config/article-horizons.ts` as part of Refactor 2/8
 * (issue Hack23/euparliamentmonitor#2030). Pure types — no runtime data,
 * no helpers. Safe to import from any consumer without pulling in the
 * registry literal.
 *
 * @see ../article-horizons.ts — barrel re-exports
 * @see ./registry.ts — `ARTICLE_HORIZONS` constant
 */

import type { ArticlePerspective, TimePeriod } from '../../types/index.js';

/**
 * Direction of the data-collection window relative to the run date.
 *  - `forward` — future-facing (e.g. week-ahead, year-ahead)
 *  - `backward` — past-facing (e.g. week-in-review, year-in-review)
 *  - `span` — anchored at run date but spanning both directions
 *    (e.g. election-cycle uses ±6 months around the election week)
 *  - `point` — single point in time (e.g. breaking-news at run-time)
 */
export type DataWindowDirection = 'forward' | 'backward' | 'span' | 'point';

/**
 * Anchor a horizon's data window to.
 *  - `today` — the run date
 *  - `next-election` — the next EP-election week (constant: June 2029)
 *  - `commission-wp` — start of the current Commission Work Programme year
 *  - `term-end` — end of the current EP term
 */
export type DataWindowAnchor = 'today' | 'next-election' | 'commission-wp' | 'term-end';

/** Data-collection window for the horizon. */
export interface DataWindowConfig {
  /** Direction relative to the anchor. */
  readonly direction: DataWindowDirection;
  /** Span in days. Omitted for `point` direction. Use the larger of
   *  any spread when `direction='span'` (e.g. election-cycle: 365). */
  readonly days?: number;
  /** Anchor reference. Defaults to `today`. */
  readonly anchor?: DataWindowAnchor;
}

/** Minute ceilings for the five workflow stages.
 *
 * Stage D (deterministic render) and Stage E (commit + safe-output
 * `create_pull_request`) are included in these per-slug ceilings; they are not
 * part of the workflow-overhead buffer. The drift guard allows totals up to
 * 50 minutes so long-horizon/electoral variants have room to grow, while the
 * operational tripwires in `.github/prompts/02-analysis-protocol.md` §3 still
 * require the PR call by minute ≤45 (≤47 for electoral). The remaining time
 * under the 60-minute workflow cap is overhead/slack for sandbox setup, MCP
 * gateway boot, and GitHub Actions completion. Each workflow sets
 * `engine.mcp.session-timeout: 65m` so the safeoutputs HTTP session outlasts
 * the job cap. */
export interface StageBudgetConfig {
  /** Stage A — data collection. */
  readonly A: number;
  /** Stage B — analysis (1 + 2 pass). Single largest budget. */
  readonly B: number;
  /** Stage C — completeness gate. */
  readonly C: number;
  /** Stage D — article rendering. */
  readonly D: number;
  /** Stage E — single-PR safe-output. Should fit in ≤ 2 minutes. */
  readonly E: number;
}

/** Triggers that schedule the workflow. */
export interface CadenceConfig {
  /** Cron expression in `* * * * *` form (UTC). `null` for manual-only. */
  readonly cron: string | null;
  /** Free-text description for documentation tables. */
  readonly description: string;
  /** Auxiliary triggering events (e.g. `t-180-election`). */
  readonly triggerEvents?: readonly string[];
}

/** Single horizon configuration entry. */
export interface ArticleHorizonConfig {
  /** Article-type slug — matches `ArticleCategory` value. */
  readonly slug: string;
  /** Inherent perspective — derived from `CATEGORY_PERSPECTIVE`. */
  readonly perspective: ArticlePerspective;
  /** Time period bucket — derived from `CATEGORY_TIME_PERIOD`. May be
   *  absent for categories without a periodic scope (breaking, deep). */
  readonly timePeriod?: TimePeriod | undefined;
  /** Data-collection window relative to the run date. */
  readonly dataWindow: DataWindowConfig;
  /** Scheduling cadence. */
  readonly cadence: CadenceConfig;
  /** EP MCP tool/feed names that *must* be probed in Stage A. */
  readonly primaryFeeds: readonly string[];
  /** Mandatory analysis-artifact relative paths under `analysis/daily/<date>/<slug>/`. */
  readonly mandatoryArtifacts: readonly string[];
  /** Optional artifacts — produced when data supports them. */
  readonly optionalArtifacts: readonly string[];
  /** Stage budget. Sum should be ≤ 50 (60-min `timeout-minutes` cap with
   *  ≥ 10-min buffer for sandbox/render/PR call). */
  readonly stageBudgets: StageBudgetConfig;
  /** Scenario-forecast maximum horizon in months. */
  readonly scenarioMaxHorizonMonths: number;
  /** Number of days into the future that forward-statements registry
   *  carries open items for this horizon (week-ahead = 7, term-outlook =
   *  ~1500). Bounded at 1825 by the registry. */
  readonly forwardStatementsHorizonDays: number;
  /** When `true`, Family-D electoral artifacts are mandatory and the
   *  scenario-forecast must include an EP-election outcome branch. */
  readonly electoralOverlay: boolean;
}
