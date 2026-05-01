// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import {
  ARTICLE_HORIZONS,
  getElectoralOverlaySlugs,
  getHorizonConfig,
  getMandatoryArtifacts,
  getProspectiveSlugs,
} from '../../scripts/config/article-horizons.js';
import { ArticleCategory, ArticlePerspective } from '../../scripts/types/index.js';

const VALID_CRON_RE = /^(?:\S+\s+){4}\S+$/;

describe('article-horizons registry — drift guard', () => {
  it('contains a config entry for every ArticleCategory enum value', () => {
    const enumValues = Object.values(ArticleCategory);
    for (const value of enumValues) {
      expect(
        ARTICLE_HORIZONS[value],
        `Missing horizon-config entry for ArticleCategory=${value}`
      ).toBeDefined();
    }
  });

  it('every entry has a unique non-empty slug', () => {
    const slugs = new Set();
    for (const cfg of Object.values(ARTICLE_HORIZONS)) {
      expect(cfg.slug).toBeTruthy();
      expect(slugs.has(cfg.slug)).toBe(false);
      slugs.add(cfg.slug);
    }
  });

  it('every cron expression is either null or a 5-field cron', () => {
    for (const cfg of Object.values(ARTICLE_HORIZONS)) {
      const cron = cfg.cadence.cron;
      if (cron !== null) {
        expect(cron).toMatch(VALID_CRON_RE);
      }
    }
  });

  it('every entry has at least one mandatory artifact', () => {
    for (const cfg of Object.values(ARTICLE_HORIZONS)) {
      expect(cfg.mandatoryArtifacts.length).toBeGreaterThan(0);
    }
  });

  it('stage budgets sum to ≤ 45 minutes (gh-aw cap)', () => {
    for (const cfg of Object.values(ARTICLE_HORIZONS)) {
      const total =
        cfg.stageBudgets.A +
        cfg.stageBudgets.B +
        cfg.stageBudgets.C +
        cfg.stageBudgets.D +
        cfg.stageBudgets.E;
      expect(
        total,
        `Stage-budget sum for slug=${cfg.slug} is ${total} (> 45)`
      ).toBeLessThanOrEqual(45);
    }
  });

  it('every prospective horizon has direction=forward or span', () => {
    for (const cfg of Object.values(ARTICLE_HORIZONS)) {
      if (cfg.perspective === ArticlePerspective.PROSPECTIVE) {
        expect(['forward', 'span', 'point']).toContain(cfg.dataWindow.direction);
      }
    }
  });

  it('every retrospective horizon has direction=backward', () => {
    for (const cfg of Object.values(ARTICLE_HORIZONS)) {
      if (cfg.perspective === ArticlePerspective.RETROSPECTIVE) {
        expect(cfg.dataWindow.direction).toBe('backward');
      }
    }
  });

  it('electoral-overlay slugs always have ELECTORAL perspective and ≥36-month scenario', () => {
    for (const cfg of Object.values(ARTICLE_HORIZONS)) {
      if (cfg.electoralOverlay) {
        expect(cfg.perspective).toBe(ArticlePerspective.ELECTORAL);
        expect(cfg.scenarioMaxHorizonMonths).toBeGreaterThanOrEqual(36);
      }
    }
  });

  it('forwardStatementsHorizonDays is bounded at 1825 (≈ 5 years)', () => {
    for (const cfg of Object.values(ARTICLE_HORIZONS)) {
      expect(cfg.forwardStatementsHorizonDays).toBeLessThanOrEqual(1825);
      expect(cfg.forwardStatementsHorizonDays).toBeGreaterThanOrEqual(0);
    }
  });

  it('exposes the four new horizons (quarter-ahead/quarter-in-review/term-outlook/election-cycle)', () => {
    const slugs = Object.values(ARTICLE_HORIZONS).map((h) => h.slug);
    expect(slugs).toContain('quarter-ahead');
    expect(slugs).toContain('quarter-in-review');
    expect(slugs).toContain('term-outlook');
    expect(slugs).toContain('election-cycle');
    expect(slugs).toContain('year-ahead');
    expect(slugs).toContain('year-in-review');
  });

  it('getHorizonConfig() resolves slugs to the right entry', () => {
    expect(getHorizonConfig('week-ahead')?.slug).toBe('week-ahead');
    expect(getHorizonConfig('term-outlook')?.electoralOverlay).toBe(true);
    expect(getHorizonConfig('election-cycle')?.scenarioMaxHorizonMonths).toBe(60);
    expect(getHorizonConfig('quarter-ahead')?.forwardStatementsHorizonDays).toBe(180);
    expect(getHorizonConfig('does-not-exist')).toBeUndefined();
  });

  it('getProspectiveSlugs() includes all forward-looking horizons', () => {
    const prospective = getProspectiveSlugs();
    expect(prospective).toContain('week-ahead');
    expect(prospective).toContain('quarter-ahead');
    expect(prospective).toContain('year-ahead');
    expect(prospective).toContain('term-outlook');
  });

  it('getElectoralOverlaySlugs() returns exactly term-outlook + election-cycle', () => {
    const electoral = getElectoralOverlaySlugs();
    expect(electoral).toContain('term-outlook');
    expect(electoral).toContain('election-cycle');
    expect(electoral.length).toBe(2);
  });

  it('getMandatoryArtifacts() returns the same list as the registry', () => {
    const cfg = getHorizonConfig('quarter-ahead');
    expect(getMandatoryArtifacts('quarter-ahead')).toEqual(cfg?.mandatoryArtifacts);
    expect(getMandatoryArtifacts('does-not-exist')).toEqual([]);
  });
});
