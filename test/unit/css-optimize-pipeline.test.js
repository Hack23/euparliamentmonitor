// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @file Drift-guard for the deploy-time CSS optimisation pipeline.
 *
 * `.github/workflows/deploy-s3.yml` runs `npm run optimize-css` against the
 * committed `purgecss.config.cjs` to drop unused selectors from
 * `styles.css` before the dra1ex/minify-action minifier compresses the
 * remainder. If the config loses a content glob (e.g. `news/*.html`) or a
 * runtime-generated safelist class (e.g. `intel-tone-critical`) the
 * deployed stylesheet starts shipping broken — pages render with missing
 * rules and the regression is invisible until users notice. This test
 * locks in:
 *   • All required content globs are present (root pages, news archive,
 *     client-side JS that mutates classList, and template emitters).
 *   • All runtime-generated safelist classes are present (article-runtime
 *     tone coder, D3 chart wrappers, mermaid runtime, theme/active state).
 *   • The companion `scripts/optimize-css.js` runner is wired to the
 *     `npm run optimize-css` script so deploy-s3.yml's invocation
 *     resolves to a real entry point.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');
const require = createRequire(import.meta.url);

const config = require(resolve(repoRoot, 'purgecss.config.cjs'));
const packageJson = JSON.parse(
  readFileSync(resolve(repoRoot, 'package.json'), 'utf8'),
);
const deployYml = readFileSync(
  resolve(repoRoot, '.github', 'workflows', 'deploy-s3.yml'),
  'utf8',
);

describe('purgecss.config.cjs', () => {
  it('targets styles.css as the single CSS source', () => {
    expect(config.css).toEqual(['./styles.css']);
  });

  it('writes purged output back to styles.css to preserve filenames', () => {
    expect(config.output).toBe('./styles.css');
  });

  it.each([
    './*.html',
    './news/*.html',
    './js/**/*.js',
    './scripts/templates/**/*.js',
    './scripts/generators/**/*.js',
  ])('includes content glob %s', (glob) => {
    expect(config.content).toContain(glob);
  });

  it.each([
    'active',
    'is-active',
    'intel-tone-critical',
    'intel-tone-high',
    'intel-tone-medium',
    'intel-tone-low',
    'intel-tone-source',
    'article-intel-table',
    'd3-treemap-wrapper',
    'd3-network-wrapper',
    'd3-swot-chart-wrapper',
    'mermaid',
    'mermaid--error',
  ])('safelists runtime-generated class %s', (cls) => {
    expect(config.safelist.standard).toContain(cls);
  });

  it('safelists deep selectors for runtime-mutated subtrees', () => {
    const sources = config.safelist.deep.map((r) => r.source);
    expect(sources).toContain('^mermaid');
    expect(sources).toContain('^d3-');
    expect(sources).toContain('^intel-tone-');
  });

  it('greedy-safelists [data-theme=...] selectors so theme rules survive', () => {
    const sources = config.safelist.greedy.map((r) => r.source);
    expect(sources.some((s) => s.includes('data-theme='))).toBe(true);
  });
});

describe('deploy pipeline wiring', () => {
  it('package.json declares purgecss as a devDependency', () => {
    expect(packageJson.devDependencies.purgecss).toBeDefined();
  });

  it('package.json wires `npm run optimize-css` to scripts/optimize-css.js', () => {
    expect(packageJson.scripts['optimize-css']).toBe(
      'node scripts/optimize-css.js',
    );
  });

  it('package.json wires `npm run minify-assets` to scripts/minify-assets.js', () => {
    expect(packageJson.scripts['minify-assets']).toBe(
      'node scripts/minify-assets.js',
    );
  });

  it('package.json declares html-minifier-terser as a devDependency (pure-Node minifier, no Docker egress needed)', () => {
    expect(packageJson.devDependencies['html-minifier-terser']).toBeDefined();
  });

  it('package.json declares clean-css as a devDependency', () => {
    expect(packageJson.devDependencies['clean-css']).toBeDefined();
  });

  it('package.json declares terser as a devDependency', () => {
    expect(packageJson.devDependencies.terser).toBeDefined();
  });

  it('deploy-s3.yml runs `npm run optimize-css` before `rm -rf node_modules`', () => {
    const optimizeIdx = deployYml.indexOf('run: npm run optimize-css');
    // Use the indented-yaml-step form to skip the same string when it
    // appears inside an explanatory comment above the run step.
    const rmIdx = deployYml.indexOf('          rm -rf node_modules');
    expect(optimizeIdx).toBeGreaterThan(0);
    expect(rmIdx).toBeGreaterThan(optimizeIdx);
  });

  it('deploy-s3.yml runs `npm run minify-assets` (no Docker egress needed)', () => {
    expect(deployYml).toContain('run: npm run minify-assets');
  });

  it('deploy-s3.yml does not use the dra1ex/minify-action Docker step (would require container-registry egress blocked by harden-runner)', () => {
    expect(deployYml).not.toContain('dra1ex/minify-action');
  });

  it('deploy-s3.yml runs `npm run minify-assets` AFTER `npm run optimize-css` (purge first, minify second)', () => {
    const optimizeIdx = deployYml.indexOf('npm run optimize-css');
    const minifyIdx = deployYml.indexOf('npm run minify-assets');
    expect(minifyIdx).toBeGreaterThan(optimizeIdx);
  });

  it('deploy-s3.yml runs `npm run minify-assets` BEFORE `rm -rf node_modules` (devDeps needed at minify time)', () => {
    const minifyIdx = deployYml.indexOf('run: npm run minify-assets');
    const rmIdx = deployYml.indexOf('          rm -rf node_modules');
    expect(rmIdx).toBeGreaterThan(minifyIdx);
  });

  it('deploy-s3.yml runs `npm run minify-assets` BEFORE the AWS sync passes', () => {
    const minifyIdx = deployYml.indexOf('npm run minify-assets');
    const syncIdx = deployYml.indexOf('aws s3 sync');
    expect(syncIdx).toBeGreaterThan(minifyIdx);
  });
});

describe('.lighthouserc.json budgets', () => {
  const lhci = JSON.parse(
    readFileSync(resolve(repoRoot, '.lighthouserc.json'), 'utf8'),
  );
  const assertions = lhci.ci.assert.assertions;

  // NOTE: unminified-css, unminified-javascript, and unused-css-rules are
  // intentionally NOT asserted here. Those audits measure the deployed
  // (minified/purged) payload, but Lighthouse CI in test-and-report.yml
  // runs against the committed source files before any deploy-time
  // transformation. Asserting them in the test runner would cause a
  // permanent false-failure. The actual minification is validated by the
  // deploy-s3.yml pipeline itself (optimize-css + minify-assets steps).

  it('targets ≥0.9 performance score (post-purge/minify floor)', () => {
    expect(assertions['categories:performance'][1].minScore).toBeGreaterThanOrEqual(0.9);
  });

  it('targets ≥0.95 accessibility score (Lighthouse showed 100)', () => {
    expect(assertions['categories:accessibility'][1].minScore).toBeGreaterThanOrEqual(0.95);
  });

  it('asserts FCP ≤ 1500ms (from 2000ms — 1.1s observed in field)', () => {
    expect(assertions['first-contentful-paint'][1].maxNumericValue).toBeLessThanOrEqual(1500);
  });

  it('asserts LCP ≤ 2500ms (from 3000ms — 1.2s observed in field)', () => {
    expect(assertions['largest-contentful-paint'][1].maxNumericValue).toBeLessThanOrEqual(2500);
  });

  it('asserts TBT ≤ 200ms (from 300ms — 30ms observed in field)', () => {
    expect(assertions['total-blocking-time'][1].maxNumericValue).toBeLessThanOrEqual(200);
  });

  it('does not assert unminified-css, unminified-javascript, or unused-css-rules (Lighthouse CI runs against source, not deployed payload)', () => {
    expect(assertions['unminified-css']).toBeUndefined();
    expect(assertions['unminified-javascript']).toBeUndefined();
    expect(assertions['unused-css-rules']).toBeUndefined();
  });
});
