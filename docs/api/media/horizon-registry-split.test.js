// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

// Source-of-truth barrel (must re-export everything below).
import * as barrel from '../../scripts/config/article-horizons.js';

// Sub-modules — imported individually to assert they expose the expected
// public surface that the barrel re-exports.
import {
  ARTICLE_HORIZONS as REGISTRY_ARTICLE_HORIZONS,
} from '../../scripts/config/horizons/registry.js';
import {
  getElectoralOverlaySlugs as LOOKUP_getElectoralOverlaySlugs,
  getHorizonConfig as LOOKUP_getHorizonConfig,
  getMandatoryArtifacts as LOOKUP_getMandatoryArtifacts,
  getProspectiveSlugs as LOOKUP_getProspectiveSlugs,
} from '../../scripts/config/horizons/lookup.js';
import {
  ELECTORAL_BUDGETS,
  PROSPECTIVE_BUDGETS,
  PR_CALL_DEADLINE_BY_SLUG,
  RETROSPECTIVE_BUDGETS,
} from '../../scripts/config/horizons/stage-budgets.js';
import {
  getForwardProjectionSlugs,
  getForwardStatementsHorizonDays,
  getForwardStatementsHorizonMap,
  getScenarioMaxHorizonMonths,
} from '../../scripts/config/horizons/forward-projection.js';

describe('article-horizons split — barrel re-exports', () => {
  it('barrel re-exports ARTICLE_HORIZONS identical to registry sub-module', () => {
    expect(barrel.ARTICLE_HORIZONS).toBe(REGISTRY_ARTICLE_HORIZONS);
  });

  it('barrel re-exports every lookup helper identical to lookup sub-module', () => {
    expect(barrel.getHorizonConfig).toBe(LOOKUP_getHorizonConfig);
    expect(barrel.getProspectiveSlugs).toBe(LOOKUP_getProspectiveSlugs);
    expect(barrel.getElectoralOverlaySlugs).toBe(LOOKUP_getElectoralOverlaySlugs);
    expect(barrel.getMandatoryArtifacts).toBe(LOOKUP_getMandatoryArtifacts);
  });

  it('barrel exposes every required public symbol', () => {
    const expected = [
      'ARTICLE_HORIZONS',
      'getHorizonConfig',
      'getProspectiveSlugs',
      'getElectoralOverlaySlugs',
      'getMandatoryArtifacts',
    ];
    for (const sym of expected) {
      expect(barrel, `barrel missing export "${sym}"`).toHaveProperty(sym);
    }
  });
});

describe('article-horizons split — stage-budgets sub-module', () => {
  it('every slug in ARTICLE_HORIZONS has a PR-call deadline entry', () => {
    for (const cfg of Object.values(REGISTRY_ARTICLE_HORIZONS)) {
      expect(
        PR_CALL_DEADLINE_BY_SLUG[cfg.slug],
        `slug=${cfg.slug} missing from PR_CALL_DEADLINE_BY_SLUG`,
      ).toBeGreaterThan(0);
    }
  });

  it('PR-call deadlines fall within the 42 / 45 / 47 minute targets', () => {
    const allowed = new Set([42, 45, 47]);
    for (const [slug, deadline] of Object.entries(PR_CALL_DEADLINE_BY_SLUG)) {
      expect(allowed.has(deadline), `slug=${slug} has unexpected deadline=${deadline}`).toBe(true);
    }
  });

  it('every PR-call deadline leaves at least 13-min slack under the 60-min cap', () => {
    for (const [slug, deadline] of Object.entries(PR_CALL_DEADLINE_BY_SLUG)) {
      expect(deadline, `slug=${slug} deadline=${deadline} too tight (must be ≤47)`).toBeLessThanOrEqual(47);
    }
  });

  it('shared budget shapes have the expected stage minute floors', () => {
    expect(PROSPECTIVE_BUDGETS.A).toBe(5);
    expect(RETROSPECTIVE_BUDGETS.A).toBe(4); // 1-min lighter Stage A
    expect(ELECTORAL_BUDGETS.B).toBe(28); // extended Stage B
  });
});

describe('article-horizons split — forward-projection sub-module', () => {
  it('every electoral slug has a positive forward-statement horizon', () => {
    const electoral = LOOKUP_getElectoralOverlaySlugs();
    expect(electoral.length).toBeGreaterThan(0);
    for (const slug of electoral) {
      expect(
        getForwardStatementsHorizonDays(slug),
        `electoral slug=${slug} has zero forward-statement horizon`,
      ).toBeGreaterThan(0);
    }
  });

  it('getForwardStatementsHorizonMap returns a slug-keyed map matching the registry', () => {
    const map = getForwardStatementsHorizonMap();
    for (const cfg of Object.values(REGISTRY_ARTICLE_HORIZONS)) {
      expect(map[cfg.slug]).toBe(cfg.forwardStatementsHorizonDays);
    }
    // Frozen → mutation throws in strict mode, no-op otherwise.
    expect(Object.isFrozen(map)).toBe(true);
  });

  it('getScenarioMaxHorizonMonths agrees with the registry for every slug', () => {
    for (const cfg of Object.values(REGISTRY_ARTICLE_HORIZONS)) {
      expect(getScenarioMaxHorizonMonths(cfg.slug)).toBe(cfg.scenarioMaxHorizonMonths);
    }
  });

  it('getScenarioMaxHorizonMonths / getForwardStatementsHorizonDays return 0 for unknown slugs', () => {
    expect(getForwardStatementsHorizonDays('does-not-exist')).toBe(0);
    expect(getScenarioMaxHorizonMonths('does-not-exist')).toBe(0);
  });

  it('getForwardProjectionSlugs includes every electoral slug and excludes retrospective-only ones', () => {
    const slugs = getForwardProjectionSlugs();
    expect(slugs).toContain('week-ahead');
    expect(slugs).toContain('term-outlook');
    expect(slugs).toContain('election-cycle');
    expect(slugs).not.toContain('week-in-review');
    expect(slugs).not.toContain('month-in-review');
  });
});
