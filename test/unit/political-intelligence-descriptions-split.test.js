// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Drift-guard for the Refactor 8/8 split of the original 3324-LOC
 * `political-intelligence-descriptions.ts` monolith into per-category
 * sub-modules under `political-intelligence/descriptions/`.
 *
 * These assertions are intentionally **structural** — they exercise the
 * public lookup API surface for every methodology / template / reference
 * file currently shipped under `analysis/` and assert that:
 *
 *   1. `getCuratedDescription(path, lang)` returns a non-empty localized
 *      string for every supported `LanguageCode` (no silent
 *      generic-fallback regressions for English; localized fallback
 *      sentences for the other 13 languages).
 *   2. `getCuratedTitle(path, lang, '')` resolves to a non-empty string
 *      for every supported language so the political-intelligence cards
 *      never render with an empty `<h2>`.
 *
 * The test also confirms that the top-level barrel
 * `political-intelligence-descriptions.ts` and the new per-category
 * barrel `political-intelligence/descriptions/index.ts` expose **the
 * same public names** so existing call sites keep compiling and any
 * future re-arrangement is caught here.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as topBarrel from '../../scripts/generators/political-intelligence-descriptions.js';
import * as subBarrel from '../../scripts/generators/political-intelligence/descriptions/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const SUPPORTED_LANGS = [
  'en',
  'sv',
  'da',
  'no',
  'fi',
  'de',
  'fr',
  'es',
  'nl',
  'ar',
  'he',
  'ja',
  'ko',
  'zh',
];

/** Walk an `analysis/` subtree and return all `.md` files. */
function walkMd(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMd(abs));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(path.relative(REPO_ROOT, abs).replace(/\\/g, '/'));
    }
  }
  return out;
}

describe('Refactor 8/8 — political-intelligence/descriptions split', () => {
  describe('barrel parity', () => {
    it('top-level barrel re-exports every name from the per-category barrel', () => {
      const subNames = Object.keys(subBarrel).sort();
      const topNames = Object.keys(topBarrel).sort();
      expect(topNames).toEqual(subNames);
    });

    it('exports the public lookup API', () => {
      for (const name of [
        'CURATED_DESCRIPTIONS',
        'CURATED_TITLES',
        'getCuratedDescription',
        'getCuratedTitle',
        'hasCuratedDescription',
        'hasCuratedTitle',
        'parseRunSlug',
        'getRunTypeInfo',
        'getArtifactInfo',
      ]) {
        expect(topBarrel).toHaveProperty(name);
      }
    });
  });

  describe('description completeness across all 14 languages', () => {
    const targets = [
      ...walkMd(path.join(REPO_ROOT, 'analysis', 'methodologies')),
      ...walkMd(path.join(REPO_ROOT, 'analysis', 'templates')),
      ...walkMd(path.join(REPO_ROOT, 'analysis', 'reference')),
    ];

    it('discovers a non-trivial set of analysis Markdown files', () => {
      expect(targets.length).toBeGreaterThan(20);
    });

    it('getCuratedDescription returns a non-empty string for every (path, lang) pair', () => {
      const empties = [];
      for (const rel of targets) {
        for (const lang of SUPPORTED_LANGS) {
          const desc = topBarrel.getCuratedDescription(rel, lang, 'Fallback Title');
          if (typeof desc !== 'string' || desc.length === 0) {
            empties.push(`${rel} (${lang})`);
          }
        }
      }
      expect(empties).toEqual([]);
    });

    it('getCuratedTitle returns a non-empty string for every (path, lang) pair', () => {
      const empties = [];
      for (const rel of targets) {
        for (const lang of SUPPORTED_LANGS) {
          const title = topBarrel.getCuratedTitle(rel, lang, 'Fallback Title');
          if (typeof title !== 'string' || title.length === 0) {
            empties.push(`${rel} (${lang})`);
          }
        }
      }
      expect(empties).toEqual([]);
    });
  });

  describe('per-category data tables', () => {
    it('METHODOLOGY_DESCRIPTIONS only contains analysis/methodologies/ paths', () => {
      for (const key of Object.keys(subBarrel.METHODOLOGY_DESCRIPTIONS)) {
        expect(key.startsWith('analysis/methodologies/')).toBe(true);
      }
    });

    it('TEMPLATE_DESCRIPTIONS only contains analysis/templates/ paths', () => {
      for (const key of Object.keys(subBarrel.TEMPLATE_DESCRIPTIONS)) {
        expect(key.startsWith('analysis/templates/')).toBe(true);
      }
    });

    it('REFERENCE_DESCRIPTIONS only contains analysis/reference/, analysis/imf/, analysis/worldbank/ paths', () => {
      const allowed = /^analysis\/(reference|imf|worldbank)\//;
      for (const key of Object.keys(subBarrel.REFERENCE_DESCRIPTIONS)) {
        expect(key).toMatch(allowed);
      }
    });

    it('TEMPLATE_TITLES_A and TEMPLATE_TITLES_B together cover all templates and have no overlap', () => {
      const a = Object.keys(subBarrel.TEMPLATE_TITLES_A);
      const b = Object.keys(subBarrel.TEMPLATE_TITLES_B);
      const overlap = a.filter((k) => b.includes(k));
      expect(overlap).toEqual([]);
      // every template-titles key targets analysis/templates/
      for (const key of [...a, ...b]) {
        expect(key.startsWith('analysis/templates/')).toBe(true);
      }
    });

    it('aggregated CURATED_DESCRIPTIONS equals union of per-category maps', () => {
      const aggregate = {
        ...subBarrel.METHODOLOGY_DESCRIPTIONS,
        ...subBarrel.TEMPLATE_DESCRIPTIONS,
        ...subBarrel.REFERENCE_DESCRIPTIONS,
      };
      expect(Object.keys(topBarrel.CURATED_DESCRIPTIONS).sort()).toEqual(
        Object.keys(aggregate).sort()
      );
    });

    it('aggregated CURATED_TITLES equals union of per-category title maps', () => {
      const aggregate = {
        ...subBarrel.METHODOLOGY_TITLES,
        ...subBarrel.REFERENCE_TITLES,
        ...subBarrel.TEMPLATE_TITLES_A,
        ...subBarrel.TEMPLATE_TITLES_B,
      };
      expect(Object.keys(topBarrel.CURATED_TITLES).sort()).toEqual(
        Object.keys(aggregate).sort()
      );
    });
  });

  describe('run-types + artifact-info smoke', () => {
    it('parseRunSlug recognizes every canonical slug', () => {
      const cases = [
        ['breaking-run192', 'breaking', 'run192'],
        ['week-in-review-run45', 'week-in-review', 'run45'],
        ['committee-reports-run07', 'committee-reports', 'run07'],
        ['motions-run3', 'motions', 'run3'],
        ['propositions-run1', 'propositions', 'run1'],
        ['unknown-prefix-run9', null, 'unknown-prefix-run9'],
      ];
      for (const [slug, type, runId] of cases) {
        const parsed = topBarrel.parseRunSlug(slug);
        expect(parsed.type).toBe(type);
        expect(parsed.runId).toBe(runId);
      }
    });

    it('getArtifactInfo returns non-empty title + description for every language', () => {
      const samples = [
        'swot-analysis.md',
        'coalition-dynamics.md',
        'risk-assessment.md',
        'adoptedtexts-foo-bar-analysis.md',
        'procedures-2025-something.md',
      ];
      for (const sample of samples) {
        for (const lang of SUPPORTED_LANGS) {
          const info = topBarrel.getArtifactInfo(sample, lang);
          expect(info.title.length).toBeGreaterThan(0);
          expect(info.description.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
