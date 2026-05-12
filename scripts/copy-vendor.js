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

import {
  copyFileSync,
  cpSync,
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
  if (!existsSync(mermaidDist)) {
    process.stdout.write(
      '  ⚠ mermaid not installed (devDependency); skipping diagram bundle.\n',
    );
    return;
  }
  ensureDir(target);

  // Per-file idempotency: walk the source tree and only copy files whose
  // bytes differ from what's already in `js/vendor/mermaid/`. Replaces the
  // earlier `rmSync` + `cpSync` approach which always touched every chunk's
  // mtime — `aws s3 sync` (size+mtime by default) then re-uploaded the
  // entire mermaid bundle on every deploy even though the bundle is byte-
  // identical until the pinned mermaid version in package.json changes.
  //
  // Filename contract preserved exactly: entry stays at
  // `js/vendor/mermaid/mermaid.esm.min.mjs` and chunks stay at
  // `js/vendor/mermaid/chunks/mermaid.esm.min/*.mjs` so every existing
  // `<script type="module" src="../js/vendor/mermaid/mermaid.esm.min.mjs">`
  // and dynamic `import()` from the entry continues to resolve.

  // Build the set of source files we want to ship (filter mirrors the
  // previous cpSync filter exactly).
  const wantedTopLevel = new Set(['mermaid.esm.min.mjs']);
  const wantedFiles = []; // { src, rel } — `rel` is relative to mermaidDist

  function shouldShip(rel) {
    if (rel.endsWith('.map')) return false;
    const segments = rel.split(path.sep);
    const top = segments[0];
    if (top === 'chunks') {
      if (segments.length === 1) return false; // directory itself, not a file
      const flavour = segments[1];
      return flavour === 'mermaid.esm.min';
    }
    if (segments.length === 1) {
      return wantedTopLevel.has(top);
    }
    return false;
  }

  function walkSource(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(mermaidDist, full);
      if (entry.isDirectory()) {
        walkSource(full);
      } else if (entry.isFile() && shouldShip(rel)) {
        wantedFiles.push({ src: full, rel });
      }
    }
  }
  walkSource(mermaidDist);

  // Copy only-if-changed.
  let copied = 0;
  let unchanged = 0;
  for (const { src, rel } of wantedFiles) {
    const dst = path.join(target, rel);
    ensureDir(path.dirname(dst));
    if (copyFileIfChanged(src, dst)) {
      copied++;
    } else {
      unchanged++;
    }
  }

  // Remove orphaned files in the destination tree that no longer have a
  // matching wanted source — this preserves the "no stale chunks from a
  // previous mermaid version" guarantee that the old `rmSync` provided,
  // without touching any current chunk's mtime.
  const wantedDstSet = new Set(
    wantedFiles.map(({ rel }) => path.join(target, rel)),
  );
  // Allow our REUSE sidecar files alongside their primary file.
  function isAllowedSidecar(absPath) {
    if (!absPath.endsWith('.license')) return false;
    const primary = absPath.slice(0, -'.license'.length);
    return wantedDstSet.has(primary);
  }
  // Also allow the chunks-dir flavour-level license sidecar we drop below.
  const flavourLicensePath = path.join(
    target,
    'chunks',
    'mermaid.esm.min.license',
  );

  function pruneOrphans(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        pruneOrphans(full);
        // Remove now-empty directories so a flavour rename leaves no shell.
        try {
          if (readdirSync(full).length === 0) {
            rmSync(full, { recursive: true, force: true });
          }
        } catch {
          // best-effort
        }
      } else if (entry.isFile()) {
        if (
          !wantedDstSet.has(full) &&
          !isAllowedSidecar(full) &&
          full !== flavourLicensePath
        ) {
          rmSync(full, { force: true });
        }
      }
    }
  }
  pruneOrphans(target);

  // REUSE sidecar for the entry file + flavour directory.
  const entry = path.join(target, 'mermaid.esm.min.mjs');
  if (existsSync(entry)) {
    writeLicense(entry, '2014-2026 Mermaid contributors', 'MIT');
  }
  // Also drop a license file at the chunks dir so REUSE lint passes for the
  // generated tree without us having to enumerate every chunk by name.
  const chunksDir = path.join(target, 'chunks', 'mermaid.esm.min');
  if (existsSync(chunksDir)) {
    writeIfChanged(
      flavourLicensePath,
      'SPDX-FileCopyrightText: 2014-2026 Mermaid contributors\nSPDX-License-Identifier: MIT\n',
    );
  }
  process.stdout.write(
    `  ✓ mermaid/ (${copied} copied, ${unchanged} unchanged; ${countMjs(target)} total mjs chunks)\n`,
  );
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
