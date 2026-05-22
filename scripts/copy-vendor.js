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
 *   - mermaid                   → js/vendor/mermaid/mermaid.esm.min.mjs
 *
 * Mermaid is special: v11+ ships as a **code-split ESM bundle**. The entry
 * `mermaid.esm.min.mjs` (28 KB) statically imports 81 diagram-specific chunks
 * from `dist/chunks/mermaid.esm.min/*.mjs`. Empirically (May 2026), serving
 * those chunks through S3 + CloudFront has been unreliable — the entry returns
 * 200 OK but every chunk URL returns 403 from CloudFront, breaking every
 * article that references the loader.
 *
 * To eliminate that failure mode, we **bundle Mermaid into a single
 * self-contained ESM file at copy-vendor time using esbuild** (devDependency).
 * The output is written to the same path / filename that the loader and the
 * existing article HTML already reference (`mermaid.esm.min.mjs`), so the
 * loader (`js/mermaid-init.js`) and the generated articles continue to work
 * unchanged — only the file's content changes (3.2 MB self-contained vs.
 * 28 KB entry-plus-81-chunks).
 *
 * Idempotent: rerunning overwrites prior copies and leaves licenses in place;
 * stale `chunks/` directories from prior layouts are pruned.
 *
 * Failure modes:
 *   - Missing chart.js / d3 / chartjs-plugin-annotation → hard error (these
 *     are pinned `devDependencies` and must always be present after `npm ci`).
 *   - Missing mermaid → soft error (logged, exit 0). Mermaid is also a pinned
 *     `devDependency`, but optional installs (e.g. `npm ci --omit=dev`) may
 *     skip it; we want the deploy to succeed without diagrams rather than fail.
 *   - Bundling failure → hard error: mermaid is present but unusable, which
 *     would silently ship a broken page; fail fast at build time instead.
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import * as esbuild from 'esbuild';

const ROOT = process.cwd();
const NODE_MODULES = path.join(ROOT, 'node_modules');
const VENDOR_DIR = path.join(ROOT, 'js', 'vendor');

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

/**
 * Copy `src` → `dst` only when their bytes differ. Returns `true` when an
 * actual copy happened, `false` when the destination already had identical
 * content and was left untouched (mtime preserved). This keeps
 * `aws s3 sync` (which compares size + mtime) from re-uploading vendor
 * bundles that the prebuild step regenerated identically.
 */
function copyFileIfChanged(src, dst) {
  if (existsSync(dst)) {
    try {
      const srcStat = statSync(src);
      const dstStat = statSync(dst);
      if (srcStat.size === dstStat.size) {
        const srcBuf = readFileSync(src);
        const dstBuf = readFileSync(dst);
        if (srcBuf.equals(dstBuf)) {
          return false;
        }
      }
    } catch {
      // Fall through to copy — read failures must not block deploy.
    }
  }
  copyFileSync(src, dst);
  return true;
}

function writeIfChanged(dst, content) {
  const desired = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
  if (existsSync(dst)) {
    try {
      const existing = readFileSync(dst);
      if (existing.equals(desired)) {
        return false;
      }
    } catch {
      // Fall through to overwrite.
    }
  }
  writeFileSync(dst, desired);
  return true;
}

function writeLicense(targetPath, copyrightText, licenseId) {
  // REUSE-compliant sidecar — see REUSE.toml for path-level annotations.
  // Idempotent: don't touch the sidecar's mtime when content is unchanged.
  writeIfChanged(
    `${targetPath}.license`,
    `SPDX-FileCopyrightText: ${copyrightText}\nSPDX-License-Identifier: ${licenseId}\n`,
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
  const wrote = copyFileIfChanged(src, dst);
  writeLicense(dst, license.copyright, license.spdx);
  process.stdout.write(`  ${wrote ? '✓' : '·'} ${dstRel}${wrote ? '' : ' (unchanged)'}\n`);
}

function copyMermaid() {
  const mermaidDist = path.join(NODE_MODULES, 'mermaid', 'dist');
  const target = path.join(VENDOR_DIR, 'mermaid');
  const entryPoint = path.join(mermaidDist, 'mermaid.esm.min.mjs');
  if (!existsSync(entryPoint)) {
    process.stdout.write(
      '  ⚠ mermaid not installed (devDependency); skipping diagram bundle.\n',
    );
    return;
  }
  ensureDir(target);

  // Bundle mermaid's code-split ESM entry plus all of its dynamic-import
  // chunks into a SINGLE self-contained ESM file. esbuild follows every
  // static and dynamic `import` from the entry and inlines the transitive
  // closure, so the resulting file has no external module references —
  // exactly what the static-site origin needs.
  //
  // We write the output under the same filename the loader and existing
  // article HTML already reference (`mermaid.esm.min.mjs`), so this script
  // is the only place that changes when we switch from "entry + 81 chunks"
  // to "single bundle". The previous chunk-shipping layout (`chunks/`) is
  // pruned below.
  const outFile = path.join(target, 'mermaid.esm.min.mjs');
  try {
    esbuild.buildSync({
      entryPoints: [entryPoint],
      outfile: outFile,
      bundle: true,
      format: 'esm',
      minify: true,
      // `browser` keeps mermaid's runtime-detection paths (e.g. `document`
      // checks) intact — same target as the upstream `.esm.min.mjs` build.
      platform: 'browser',
      target: 'es2022',
      // Resolve `import.meta.url` at runtime (relative to the served bundle
      // location) rather than baking in the build-time path.
      supported: { 'import-meta': true },
      // Drop sourcemaps; the upstream bundle ships them as `.map` siblings
      // and we previously excluded those from vendor copy.
      sourcemap: false,
      legalComments: 'none',
      // Surface bundling failures fast — a broken bundle would silently ship
      // an unusable mermaid loader to every article.
      logLevel: 'silent',
    });
  } catch (err) {
    process.stderr.write(`error: mermaid bundle failed: ${err && err.message ? err.message : err}\n`);
    process.exit(1);
  }

  // Prune the obsolete chunks layout (and any other orphans) from previous
  // copy-vendor runs. The bundled file is fully self-contained, so anything
  // other than the bundle itself + its REUSE sidecar is stale.
  const wantedDstSet = new Set([outFile]);
  function isAllowedSidecar(absPath) {
    if (!absPath.endsWith('.license')) return false;
    const primary = absPath.slice(0, -'.license'.length);
    return wantedDstSet.has(primary);
  }

  function pruneOrphans(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        pruneOrphans(full);
        try {
          if (readdirSync(full).length === 0) {
            rmSync(full, { recursive: true, force: true });
          }
        } catch {
          // best-effort
        }
      } else if (entry.isFile()) {
        if (!wantedDstSet.has(full) && !isAllowedSidecar(full)) {
          rmSync(full, { force: true });
        }
      }
    }
  }
  pruneOrphans(target);

  // REUSE sidecar for the bundled file. The bundle contains code from
  // mermaid + its transitive ESM deps; mermaid's own MIT license header
  // remains intact in the dependency tree (REUSE.toml covers the vendored
  // artifact via path-level annotation; this sidecar keeps the file
  // self-documenting).
  writeLicense(outFile, '2014-2026 Mermaid contributors', 'MIT');

  const size = statSync(outFile).size;
  process.stdout.write(
    `  ✓ mermaid/mermaid.esm.min.mjs (${(size / 1024).toFixed(0)} KB self-contained bundle)\n`,
  );
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
