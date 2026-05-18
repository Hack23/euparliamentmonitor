// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Config/Horizons/ForwardProjection
 * @description Forward-statement horizon and scenario-depth helpers.
 *
 * Extracted from `src/config/article-horizons.ts` as part of Refactor 2/8
 * (issue Hack23/euparliamentmonitor#2030). These helpers derive their
 * values from the canonical registry to avoid drift — the registry remains
 * the single source of truth.
 *
 * @see analysis/methodologies/forward-projection-methodology.md
 * @see ./registry.ts
 */

import { ARTICLE_HORIZONS } from './registry.js';

/**
 * Forward-statement horizon in days for a given article slug. Returns 0
 * for unknown slugs and for purely retrospective horizons (week-in-review,
 * month-in-review, etc.).
 *
 * @param slug - article-type slug
 * @returns horizon length in days, bounded at 1825 (≈ 5 years) by the registry
 */
export function getForwardStatementsHorizonDays(slug: string): number {
  for (const cfg of Object.values(ARTICLE_HORIZONS)) {
    if (cfg.slug === slug) return cfg.forwardStatementsHorizonDays;
  }
  return 0;
}

/**
 * Scenario-forecast maximum horizon in months for a given slug. Returns 0
 * for unknown slugs.
 *
 * @param slug - article-type slug
 * @returns scenario-forecast depth in months
 */
export function getScenarioMaxHorizonMonths(slug: string): number {
  for (const cfg of Object.values(ARTICLE_HORIZONS)) {
    if (cfg.slug === slug) return cfg.scenarioMaxHorizonMonths;
  }
  return 0;
}

/**
 * Frozen per-slug map of forward-statement horizon days.
 *
 * Derived once from the registry — recompute the lazy snapshot on each call
 * so consumers always observe the registry's current state when running
 * under hot-reload or in tests that swap modules. The result is frozen to
 * prevent accidental mutation by callers.
 *
 * @returns Frozen `Record<slug, horizonDays>` mirroring the registry.
 */
export function getForwardStatementsHorizonMap(): Readonly<Record<string, number>> {
  const map: Record<string, number> = {};
  for (const cfg of Object.values(ARTICLE_HORIZONS)) {
    map[cfg.slug] = cfg.forwardStatementsHorizonDays;
  }
  return Object.freeze(map);
}

/**
 * Slugs that carry forward-statements (horizon > 0).
 *
 * @returns Frozen array of slugs with a positive forward-statement horizon.
 */
export function getForwardProjectionSlugs(): readonly string[] {
  return Object.freeze(
    Object.values(ARTICLE_HORIZONS)
      .filter((h) => h.forwardStatementsHorizonDays > 0)
      .map((h) => h.slug)
  );
}
