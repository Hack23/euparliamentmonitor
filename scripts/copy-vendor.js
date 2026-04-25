#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Copy vendored JS libraries from `node_modules/` into `js/vendor/` so the
 * static site can serve every executable bundle from the same origin
 * (S3 + CloudFront) under the strict `script-src 'self'` CSP. No external
 * CDN is allowed (per the EU Parliament Monitor deployment contract).
 *
 * Vendored libraries:
 *   - chart.js                 → js/vendor/chart.umd.min.js
 *   - chartjs-plugin-annotation → js/vendor/chartjs-plugin-annotation.min.js
 *   - d3                        → js/vendor/d3.min.js
 *   - mermaid                   → js/vendor/mermaid/  (entry + chunks/)
 *
 * Mermaid is special: v11+ ships as code-split ESM. The entry
 * `mermaid.esm.min.mjs` does dynamic `import()` on diagram-specific chunks
 * under `dist/chunks/mermaid.esm.min/*.mjs`. To make every diagram type render
 * without external network calls, we copy the **entire mermaid `dist/`
 * directory** (filtered to the `.esm.min` flavour to keep payload small).
 *
 * Idempotent: rerunning overwrites prior copies and leaves licenses in place.
 *
 * Failure modes:
 *   - Missing chart.js / d3 / chartjs-plugin-annotation → hard error (these
 *     are pinned `devDependencies` and must always be present after `npm ci`).
 *   - Missing mermaid → soft error (logged, exit 0). Mermaid is also a pinned
 *     `devDependency`, but optional installs (e.g. `npm ci --omit=dev`) may
 *     skip it; we want the deploy to succeed without diagrams rather than fail.
 */

import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const NODE_MODULES = path.join(ROOT, 'node_modules');
const VENDOR_DIR = path.join(ROOT, 'js', 'vendor');

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function writeLicense(targetPath, copyrightText, licenseId) {
  // REUSE-compliant sidecar — see REUSE.toml for path-level annotations.
  writeFileSync(
    `${targetPath}.license`,
    `SPDX-FileCopyrightText: ${copyrightText}\nSPDX-License-Identifier: ${licenseId}\n`,
    'utf8',
  );
}

function copyOrFail(label, srcRel, dstRel, license) {
  const src = path.join(NODE_MODULES, srcRel);
  const dst = path.join(VENDOR_DIR, dstRel);
  if (!existsSync(src)) {
    process.stderr.write(`error: ${label} not installed at ${srcRel}\n`);
    process.exit(1);
  }
  ensureDir(path.dirname(dst));
  copyFileSync(src, dst);
  writeLicense(dst, license.copyright, license.spdx);
  process.stdout.write(`  ✓ ${dstRel}\n`);
}

function copyMermaid() {
  const mermaidDist = path.join(NODE_MODULES, 'mermaid', 'dist');
  const target = path.join(VENDOR_DIR, 'mermaid');
  if (!existsSync(mermaidDist)) {
    process.stdout.write(
      '  ⚠ mermaid not installed (devDependency); skipping diagram bundle.\n',
    );
    return;
  }
  ensureDir(target);

  // Copy the minified ESM entry plus its chunk directory. Skip the dev /
  // unminified flavours (`mermaid.esm.mjs`, `mermaid.core.mjs`,
  // `mermaid.js`, etc.) AND skip sourcemaps to keep the deployed payload
  // small (saves ~6 MB and 60+ HTTP requests).
  const wantedTopLevel = new Set(['mermaid.esm.min.mjs']);

  cpSync(mermaidDist, target, {
    recursive: true,
    force: true,
    filter: (src) => {
      const rel = path.relative(mermaidDist, src);
      if (rel === '') return true; // root dist dir
      // Skip sourcemaps — we deploy minified-only.
      if (src.endsWith('.map')) return false;
      const segments = rel.split(path.sep);
      const top = segments[0];
      // Always allow the chunks directory tree we need.
      if (top === 'chunks') {
        if (segments.length === 1) return true;
        const flavour = segments[1];
        return flavour === 'mermaid.esm.min';
      }
      // Top-level: only allow the minified ESM entry.
      if (segments.length === 1) {
        return wantedTopLevel.has(top);
      }
      return false;
    },
  });

  // REUSE sidecar for the entry file + flavour directory.
  const entry = path.join(target, 'mermaid.esm.min.mjs');
  if (existsSync(entry)) {
    writeLicense(entry, '2014-2026 Mermaid contributors', 'MIT');
  }
  // Also drop a license file at the chunks dir so REUSE lint passes for the
  // generated tree without us having to enumerate every chunk by name.
  const chunksDir = path.join(target, 'chunks', 'mermaid.esm.min');
  if (existsSync(chunksDir)) {
    writeFileSync(
      path.join(target, 'chunks', 'mermaid.esm.min.license'),
      'SPDX-FileCopyrightText: 2014-2026 Mermaid contributors\nSPDX-License-Identifier: MIT\n',
      'utf8',
    );
  }
  process.stdout.write(`  ✓ mermaid/ (entry + ${countMjs(target)} mjs chunks)\n`);
}

function countMjs(dir) {
  let n = 0;
  function walk(d) {
    if (!existsSync(d)) return;
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile() && entry.name.endsWith('.mjs')) n += 1;
    }
  }
  walk(dir);
  return n;
}

function main() {
  ensureDir(VENDOR_DIR);
  process.stdout.write(`Copying vendor JS libraries to ${path.relative(ROOT, VENDOR_DIR)}/\n`);

  copyOrFail(
    'chart.js',
    'chart.js/dist/chart.umd.min.js',
    'chart.umd.min.js',
    { copyright: '2014-2024 Chart.js Contributors', spdx: 'MIT' },
  );
  copyOrFail(
    'chartjs-plugin-annotation',
    'chartjs-plugin-annotation/dist/chartjs-plugin-annotation.min.js',
    'chartjs-plugin-annotation.min.js',
    { copyright: '2016-2024 chartjs-plugin-annotation contributors', spdx: 'MIT' },
  );
  copyOrFail(
    'd3',
    'd3/dist/d3.min.js',
    'd3.min.js',
    { copyright: '2010-2024 Mike Bostock', spdx: 'ISC' },
  );

  copyMermaid();

  process.stdout.write('✅ Vendor copy complete.\n');
}

main();
