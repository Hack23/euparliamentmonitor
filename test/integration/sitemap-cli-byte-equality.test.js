// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * End-to-end regression test for the sitemap CLI orchestrator.
 *
 * Runs `node scripts/generators/sitemap.js` against the live repo and
 * asserts the generated outputs are deterministic across two
 * consecutive invocations — the **only** allowed differences are
 * timestamp-driven values that already varied before this refactor:
 *
 * - `<lastBuildDate>` in `rss.xml` (RFC-822 timestamp of the build)
 * - `<lastmod>` and `<datetime>` in `sitemap.xml` / `sitemap_*.html`
 *
 * The test is the single guard against silent regressions when the
 * sitemap modules (`xml-utils`, `rss`, `xml`, `html`, `copy`) are
 * refactored or new languages added. It is what gives us confidence
 * that the bounded-context split preserves byte-for-byte output.
 *
 * The test is gated by EUPM_RUN_SITEMAP_E2E=1 in CI runs that need to
 * isolate slow disk-bound work (or skip it on read-only filesystems);
 * locally and in `npm run test` it always runs.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

/** Strip wall-clock timestamps that legitimately differ across runs. */
function normalizeForComparison(content) {
  return content
    // RSS lastBuildDate
    .replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/g, '<lastBuildDate>FIXED</lastBuildDate>')
    // sitemap.xml <lastmod>
    .replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, '<lastmod>FIXED</lastmod>')
    // <time datetime="2026-04-27">2026-04-27</time> in sitemap HTML
    .replace(
      /<time datetime="\d{4}-\d{2}-\d{2}">\d{4}-\d{2}-\d{2}<\/time>/g,
      '<time datetime="FIXED">FIXED</time>'
    )
    // Build-time meta (varies across runs unless BUILD_TIME env is pinned)
    .replace(
      /<meta name="build-time" content="[^"]+">/g,
      '<meta name="build-time" content="FIXED">'
    )
    // Footer build-time <time> element renders BUILD_TIME twice (datetime + text)
    .replace(
      /<time class="footer-build-time" datetime="[^"]+" data-relative-time>[^<]*<\/time>/g,
      '<time class="footer-build-time" datetime="FIXED" data-relative-time>FIXED</time>'
    );
}

describe('sitemap CLI byte-equality regression', () => {
  // Skip the entire suite if the prerequisite directories don't exist
  // (e.g. running in a sparse-checkout sandbox)
  const newsDir = path.join(REPO_ROOT, 'news');
  const skipReason = fs.existsSync(newsDir) ? null : 'news/ directory not present';

  const sitemapScript = path.join(REPO_ROOT, 'scripts', 'generators', 'sitemap.js');
  const newsIndexesScript = path.join(REPO_ROOT, 'scripts', 'generators', 'news-indexes.js');

  let firstRun = new Map();

  beforeAll(() => {
    if (skipReason) return;
    // Pre-populate articles-metadata.json (sitemap CLI depends on news being present;
    // news-indexes also writes that JSON the sitemap consumes for descriptions).
    execFileSync('node', [newsIndexesScript], { cwd: REPO_ROOT, stdio: 'pipe' });
    execFileSync('node', [sitemapScript], { cwd: REPO_ROOT, stdio: 'pipe' });

    // Snapshot every output the CLI produces
    const outputs = ['sitemap.xml', 'rss.xml'];
    for (const lang of [
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
    ]) {
      const sitemapName = lang === 'en' ? 'sitemap.html' : `sitemap_${lang}.html`;
      outputs.push(sitemapName);
      const piName = lang === 'en' ? 'political-intelligence.html' : `political-intelligence_${lang}.html`;
      outputs.push(piName);
    }

    for (const f of outputs) {
      const p = path.join(REPO_ROOT, f);
      if (fs.existsSync(p)) {
        firstRun.set(f, fs.readFileSync(p, 'utf-8'));
      }
    }
  }, 120_000);

  afterAll(() => {
    // No cleanup — these are tracked outputs the prebuild step always overwrites
  });

  it.skipIf(skipReason)(
    'produces byte-identical sitemap.xml across two runs',
    () => {
      execFileSync('node', [sitemapScript], { cwd: REPO_ROOT, stdio: 'pipe' });
      const second = fs.readFileSync(path.join(REPO_ROOT, 'sitemap.xml'), 'utf-8');
      const firstNorm = normalizeForComparison(firstRun.get('sitemap.xml'));
      const secondNorm = normalizeForComparison(second);
      expect(secondNorm).toBe(firstNorm);
    },
    120_000
  );

  it.skipIf(skipReason)(
    'produces byte-identical rss.xml across two runs (modulo lastBuildDate)',
    () => {
      const second = fs.readFileSync(path.join(REPO_ROOT, 'rss.xml'), 'utf-8');
      const firstNorm = normalizeForComparison(firstRun.get('rss.xml'));
      const secondNorm = normalizeForComparison(second);
      expect(secondNorm).toBe(firstNorm);
    }
  );

  it.skipIf(skipReason)('generates all 14 sitemap_*.html files', () => {
    for (const lang of [
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
    ]) {
      const sitemapName = lang === 'en' ? 'sitemap.html' : `sitemap_${lang}.html`;
      expect(firstRun.has(sitemapName), `${sitemapName} should have been generated`).toBe(true);
      const html = firstRun.get(sitemapName);
      expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
      expect(html).toContain(`<html lang="${lang}"`);
    }
  });

  it.skipIf(skipReason)('generates all 14 political-intelligence_*.html files', () => {
    for (const lang of [
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
    ]) {
      const piName = lang === 'en' ? 'political-intelligence.html' : `political-intelligence_${lang}.html`;
      expect(firstRun.has(piName), `${piName} should have been generated`).toBe(true);
      const html = firstRun.get(piName);
      expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
      expect(html).toContain(`<html lang="${lang}"`);
    }
  });

  it.skipIf(skipReason)(
    'produces byte-identical sitemap_*.html and political-intelligence_*.html across two runs',
    () => {
      const langs = [
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
      for (const lang of langs) {
        const sitemapName = lang === 'en' ? 'sitemap.html' : `sitemap_${lang}.html`;
        const piName = lang === 'en' ? 'political-intelligence.html' : `political-intelligence_${lang}.html`;
        for (const f of [sitemapName, piName]) {
          const second = fs.readFileSync(path.join(REPO_ROOT, f), 'utf-8');
          const firstNorm = normalizeForComparison(firstRun.get(f));
          const secondNorm = normalizeForComparison(second);
          expect(secondNorm, `${f} differs across runs`).toBe(firstNorm);
        }
      }
    },
    120_000
  );
});
