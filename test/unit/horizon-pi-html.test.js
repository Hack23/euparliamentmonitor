// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Political-intelligence HTML generation tests — 6 new horizons × 14 languages
 *
 * Uses `test/fixtures/horizons/<slug>/` (the same fixtures used by the
 * aggregator snapshot tests) to build a minimal analysis tree, calls
 * `collectPoliticalIntelligenceData(tmpDir)` + `generatePoliticalIntelligenceHTML`
 * for every supported language, and asserts that each generated page
 * contains a run card for the horizon with the correct localised title.
 *
 * This replaces the need for real analysis runs to exist in `analysis/daily/`
 * just to test the PI page rendering pipeline — keeping test fixtures
 * isolated under `test/` and out of the production analysis tree.
 *
 * Test count: 14 languages × 6 horizons = 84 parameterised cases
 * (plus 14 smoke assertions = 98 total)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  collectPoliticalIntelligenceData,
  generatePoliticalIntelligenceHTML,
} from '../../scripts/generators/political-intelligence.js';
import { getRunTypeInfo } from '../../scripts/generators/political-intelligence-descriptions.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

// ─── New horizons to test ─────────────────────────────────────────────────────
const NEW_HORIZONS = [
  { slug: 'quarter-ahead',     runSlug: 'quarter-ahead-fixture' },
  { slug: 'quarter-in-review', runSlug: 'quarter-in-review-fixture' },
  { slug: 'year-ahead',        runSlug: 'year-ahead-fixture' },
  { slug: 'year-in-review',    runSlug: 'year-in-review-fixture' },
  { slug: 'term-outlook',      runSlug: 'term-outlook-fixture' },
  { slug: 'election-cycle',    runSlug: 'election-cycle-fixture' },
];

// ─── Fixture source dir ───────────────────────────────────────────────────────
const FIXTURE_ROOT = path.resolve('test/fixtures/horizons');

// ─── Build a temporary analysis tree from the horizon fixtures ───────────────
let tmpRoot;
/** Cache PI data collected once from the temp tree (reused across all tests). */
let piData;

beforeAll(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-horizons-'));

  // Create minimal analysis/methodologies/ so collectPoliticalIntelligenceData
  // does not error when scanning for tradecraft docs.
  const methodDir = path.join(tmpRoot, 'analysis', 'methodologies');
  fs.mkdirSync(methodDir, { recursive: true });
  fs.writeFileSync(path.join(methodDir, 'README.md'), '# Methodologies\n', 'utf-8');

  const tplDir = path.join(tmpRoot, 'analysis', 'templates');
  fs.mkdirSync(tplDir, { recursive: true });
  fs.writeFileSync(path.join(tplDir, 'README.md'), '# Templates\n', 'utf-8');

  // Copy each horizon fixture into analysis/daily/2026-01-15/<slug>/
  const dateDir = path.join(tmpRoot, 'analysis', 'daily', '2026-01-15');
  for (const { slug, runSlug } of NEW_HORIZONS) {
    const srcDir = path.join(FIXTURE_ROOT, slug);
    const destDir = path.join(dateDir, runSlug);
    copyDirSync(srcDir, destDir);
  }

  // Collect PI data once for all language tests
  piData = collectPoliticalIntelligenceData(tmpRoot);
});

afterAll(() => {
  if (tmpRoot) {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

/** Recursively copy a directory tree. */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ─── Smoke: PI data collection finds the 6 horizon run stubs ─────────────────
describe('collectPoliticalIntelligenceData from horizon fixtures', () => {
  it('finds the 2026-01-15 daily group', () => {
    expect(piData.dailyGroups.some((g) => g.date === '2026-01-15')).toBe(true);
  });

  it('finds exactly 6 runs (one per new horizon) in the 2026-01-15 group', () => {
    const group = piData.dailyGroups.find((g) => g.date === '2026-01-15');
    expect(group?.runs).toHaveLength(6);
  });

  it('run slugs match the 6 new horizon runSlugs', () => {
    const group = piData.dailyGroups.find((g) => g.date === '2026-01-15');
    const actualSlugs = (group?.runs ?? []).map((r) => r.slug).sort();
    const expectedSlugs = NEW_HORIZONS.map((h) => h.runSlug).sort();
    expect(actualSlugs).toEqual(expectedSlugs);
  });
});

// ─── Parameterised: 14 languages × 6 horizons ────────────────────────────────
for (const lang of ALL_LANGUAGES) {
  describe(`PI HTML generation — ${lang}`, () => {
    // Generate HTML once per language and reuse across horizon sub-tests
    let html;
    beforeAll(() => {
      html = generatePoliticalIntelligenceHTML(lang, piData);
    });

    it('generates a valid HTML document', () => {
      expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
      expect(html).toContain(`lang="${lang}"`);
    });

    for (const { slug, runSlug } of NEW_HORIZONS) {
      it(`${slug}: run card slug badge is present`, () => {
        expect(html, `slug badge "${runSlug}" should be present in ${lang} PI page`).toContain(
          runSlug
        );
      });

      it(`${slug}: run card title is the localised horizon title`, () => {
        const { title: expectedTitle } = getRunTypeInfo(runSlug, lang);
        expect(html, `localised title "${expectedTitle}" should be in ${lang} PI page`).toContain(
          expectedTitle
        );
      });

      it(`${slug}: run card link points to the GitHub tree URL`, () => {
        expect(html, `GitHub tree link for "${runSlug}" should be in ${lang} PI page`).toContain(
          `analysis/daily/2026-01-15/${runSlug}`
        );
      });
    }
  });
}
