// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Regression tests for the Mermaid vendor-bundle contract enforced by
 * `scripts/copy-vendor.js`.
 *
 * Background: in May 2026 every news article on euparliamentmonitor.com lost
 * its Mermaid diagrams. The vendor pipeline shipped mermaid as an ESM entry
 * file plus 81 chunk files under `js/vendor/mermaid/chunks/mermaid.esm.min/`;
 * after deploy, the entry returned 200 OK from CloudFront but every chunk URL
 * returned 403, breaking the dynamic-import chain.
 *
 * The fix bundles mermaid into a SINGLE self-contained ESM file via esbuild.
 * These tests pin that contract so future copy-vendor changes can't silently
 * regress to a multi-chunk layout.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..', '..');
const MERMAID_DIR = path.join(REPO_ROOT, 'js', 'vendor', 'mermaid');
const BUNDLE = path.join(MERMAID_DIR, 'mermaid.esm.min.mjs');

describe('copy-vendor mermaid bundle contract', () => {
  beforeAll(() => {
    // Ensure the bundle is up to date. copy-vendor is idempotent and the
    // canonical deploy pipeline runs it before sync; running it here in tests
    // mirrors the deploy contract exactly.
    const res = spawnSync(
      process.execPath,
      [path.join(REPO_ROOT, 'scripts', 'copy-vendor.js')],
      {
        cwd: REPO_ROOT,
        stdio: 'pipe',
        encoding: 'utf8',
      },
    );
    if (res.status !== 0) {
      throw new Error(
        `copy-vendor exited with ${res.status}\nstdout:\n${res.stdout}\nstderr:\n${res.stderr}`,
      );
    }
  }, 60_000);

  it('writes a single self-contained bundle at js/vendor/mermaid/mermaid.esm.min.mjs', () => {
    expect(fs.existsSync(BUNDLE)).toBe(true);
    const stat = fs.statSync(BUNDLE);
    // esbuild-bundled mermaid is ≈3.2 MB minified; assert a 1 MB floor to
    // catch a silent bundling regression that would ship a stub file.
    expect(stat.size).toBeGreaterThan(1_000_000);
  });

  it('does NOT ship a chunks/ subdirectory', () => {
    // The pre-incident layout produced
    // `js/vendor/mermaid/chunks/mermaid.esm.min/*.mjs` (82 files total).
    // The bundle must now be fully self-contained — no chunks, anywhere.
    const chunksDir = path.join(MERMAID_DIR, 'chunks');
    expect(fs.existsSync(chunksDir)).toBe(false);
  });

  it('contains no external module imports (no static "./chunks/" or http URLs)', () => {
    const source = fs.readFileSync(BUNDLE, 'utf8');
    // Real ESM static imports always look like `import … from "…"` /
    // `from'…'`. Match either quoting style; whitespace-tolerant.
    const importFromRe = /\bfrom\s*["']([^"']+)["']/g;
    const externalImports = [];
    let m;
    while ((m = importFromRe.exec(source)) !== null) {
      const spec = m[1];
      // The bundle still contains string-literal occurrences of the word
      // "import" inside identifiers and error messages; only real specifiers
      // (starting with ./ ../ / or a URL/bare-name) should fail this test.
      if (
        spec.startsWith('./') ||
        spec.startsWith('../') ||
        spec.startsWith('/') ||
        spec.startsWith('http://') ||
        spec.startsWith('https://') ||
        // Bare specifiers — these would mean esbuild failed to resolve a
        // node_modules dep.
        /^[a-zA-Z@]/.test(spec)
      ) {
        externalImports.push(spec);
      }
    }
    expect(externalImports).toEqual([]);
  });

  it('exports a default object with mermaid v11 API surface', async () => {
    // Smoke-test the bundle by importing it through Node's ESM loader.
    // Resolves only if every transitive import was inlined correctly.
    const mod = await import(`file://${BUNDLE}`);
    expect(mod.default).toBeDefined();
    expect(typeof mod.default.initialize).toBe('function');
    expect(typeof mod.default.run).toBe('function');
    expect(typeof mod.default.render).toBe('function');
    expect(typeof mod.default.parse).toBe('function');
  }, 30_000);

  // REUSE-IgnoreStart
  it('ships a REUSE-compliant license sidecar next to the bundle', () => {
    const license = `${BUNDLE}.license`;
    expect(fs.existsSync(license)).toBe(true);
    const text = fs.readFileSync(license, 'utf8');
    expect(text).toMatch(/SPDX-FileCopyrightText:/);
    expect(text).toMatch(/SPDX-License-Identifier:\s*MIT/);
  });
  // REUSE-IgnoreEnd
});
