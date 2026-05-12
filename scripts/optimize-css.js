#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
//
// Run PurgeCSS against the deployed CSS using the committed config in
// purgecss.config.cjs. Writes the purged result back to styles.css
// in place — keeps the existing filename so every HTML
// `<link rel="stylesheet" href="styles.css">` continues to resolve and
// no rewrite of generated pages is required.
//
// Invoked from `.github/workflows/deploy-s3.yml` after `npm run prebuild`
// (so all generated HTML pages exist) and before the
// `dra1ex/minify-action` step (which then minifies the now-smaller CSS).
//
// Logs before/after byte counts so the deploy log records the saving,
// and exits non-zero on failure so the deploy halts before publishing
// half-stripped CSS.

import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { PurgeCSS } from 'purgecss';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const configPath = resolve(repoRoot, 'purgecss.config.cjs');
const cssPath = resolve(repoRoot, 'styles.css');
const config = require(configPath);

const beforeBytes = statSync(cssPath).size;
// Capture the pre-purge CSS so we can restore it verbatim if the purge
// produces output that fails the downstream sanity floor — reading the
// file AFTER the in-place write would only recover the (broken) purged
// content.
const originalCss = readFileSync(cssPath, 'utf8');

const result = await new PurgeCSS().purge({
  content: config.content,
  css: config.css,
  safelist: config.safelist,
  variables: config.variables,
  keyframes: config.keyframes,
  fontFace: config.fontFace,
});

if (!result.length || typeof result[0].css !== 'string') {
  console.error('❌ PurgeCSS returned no result for styles.css — aborting.');
  process.exit(1);
}

const purged = result[0].css;
writeFileSync(cssPath, purged);

const afterBytes = statSync(cssPath).size;
const savedBytes = beforeBytes - afterBytes;
const savedPct = ((savedBytes / beforeBytes) * 100).toFixed(1);

console.log(
  `✅ styles.css purged: ${beforeBytes} → ${afterBytes} bytes ` +
    `(saved ${savedBytes} B / ${savedPct}%)`,
);

// Sanity floor: if the purge produces a styles.css smaller than 32 KiB,
// something has likely scanned the wrong content set (eg. globs missed
// the news/ directory). Halt instead of shipping a near-empty stylesheet.
const FLOOR_BYTES = 32 * 1024;
if (afterBytes < FLOOR_BYTES) {
  console.error(
    `❌ styles.css after purge (${afterBytes} B) is below the ${FLOOR_BYTES} B sanity ` +
      'floor — restoring the pre-purge CSS and refusing to ship a likely-broken stylesheet.',
  );
  // Restore from the in-memory capture taken BEFORE the purge so a re-run
  // from cache cannot observe the broken file.
  writeFileSync(cssPath, originalCss);
  process.exit(1);
}
