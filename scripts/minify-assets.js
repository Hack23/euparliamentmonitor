#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
//
// Minifies HTML, CSS, and JS files in place using pure-Node packages so that
// the deploy pipeline never needs to pull a Docker image (compatible with the
// `egress-policy: block` harden-runner configuration in deploy-s3.yml).
//
// Run order in deploy-s3.yml:
//   1. prebuild      — generate all pages
//   2. optimize-css  — PurgeCSS drops unused selectors from styles.css
//   3. minify-assets (THIS SCRIPT) — compress the now-smaller CSS + HTML + JS
//   4. rm -rf node_modules         — clean up before S3 sync
//   5. aws s3 sync passes          — upload minified payload
//
// Must run BEFORE `rm -rf node_modules` because html-minifier-terser,
// clean-css, and terser are devDependencies.
//
// Scopes:
//   CSS  — styles.css only (the one deployed stylesheet)
//   HTML — root *.html + news/*.html (all pages shipped to S3)
//   JS   — js/**/*.js (client-side bundles; vendor files are already minified
//           by upstream build — terser is idempotent so re-minifying is safe)
//
// HTML files are processed with a concurrency cap (CONCURRENCY) to avoid
// overwhelming the event loop on the 4400+ news/*.html archive while still
// finishing in reasonable time.
//
// Exits non-zero if any file fails so the deploy halts before uploading a
// partially-minified payload.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { minify as minifyHtml } from 'html-minifier-terser';
import CleanCSS from 'clean-css';
import { minify as minifyJs } from 'terser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const CONCURRENCY = 32; // parallel HTML workers

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(before, after) {
  const saved = before - after;
  const pct = before > 0 ? ((saved / before) * 100).toFixed(1) : '0.0';
  return `${before} → ${after} B (saved ${saved} B / ${pct}%)`;
}

/** Run tasks with at most `limit` in-flight at once. */
async function pool(tasks, limit) {
  const results = [];
  const queue = [...tasks];
  async function worker() {
    let task;
    while ((task = queue.shift()) !== undefined) {
      results.push(await task());
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

let totalBefore = 0;
let totalAfter = 0;
let errors = 0;

// ─── CSS ────────────────────────────────────────────────────────────────────

const cssPath = resolve(repoRoot, 'styles.css');
{
  const src = readFileSync(cssPath, 'utf8');
  const before = Buffer.byteLength(src, 'utf8');
  const result = new CleanCSS({ level: 2 }).minify(src);
  if (result.errors && result.errors.length) {
    console.error('❌ clean-css errors in styles.css:', result.errors);
    errors++;
  } else {
    writeFileSync(cssPath, result.styles);
    const after = Buffer.byteLength(result.styles, 'utf8');
    totalBefore += before;
    totalAfter += after;
    console.log(`  styles.css  ${fmt(before, after)}`);
  }
}

// ─── HTML ────────────────────────────────────────────────────────────────────

const htmlOpts = {
  collapseWhitespace: true,
  removeComments: true,
  removeOptionalTags: false,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  minifyCSS: true,
  minifyJS: true,
  useShortDoctype: true,
};

// Collect HTML files: root *.html + news/*.html
const rootHtml = readdirSync(repoRoot)
  .filter((f) => f.endsWith('.html'))
  .map((f) => resolve(repoRoot, f));

const newsDir = resolve(repoRoot, 'news');
let newsHtml = [];
try {
  newsHtml = readdirSync(newsDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => join(newsDir, f));
} catch {
  // news/ directory may not exist in all environments
}

const allHtml = [...rootHtml, ...newsHtml];
let htmlBefore = 0;
let htmlAfter = 0;
let htmlErrors = 0;

const htmlTasks = allHtml.map((p) => async () => {
  try {
    const src = readFileSync(p, 'utf8');
    const before = Buffer.byteLength(src, 'utf8');
    const minified = await minifyHtml(src, htmlOpts);
    writeFileSync(p, minified);
    const after = Buffer.byteLength(minified, 'utf8');
    return { before, after, ok: true };
  } catch (e) {
    console.error(`❌ HTML minify failed for ${p}: ${e.message}`);
    return { before: 0, after: 0, ok: false };
  }
});

const htmlResults = await pool(htmlTasks, CONCURRENCY);
for (const r of htmlResults) {
  if (r.ok) {
    htmlBefore += r.before;
    htmlAfter += r.after;
  } else {
    htmlErrors++;
  }
}
totalBefore += htmlBefore;
totalAfter += htmlAfter;
errors += htmlErrors;
console.log(
  `  HTML: ${allHtml.length - htmlErrors} files minified  ${fmt(htmlBefore, htmlAfter)}`,
);

// ─── JS ─────────────────────────────────────────────────────────────────────

const jsDir = resolve(repoRoot, 'js');
let jsFiles = [];
function collectJs(dir) {
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        collectJs(full);
      } else if (entry.name.endsWith('.js')) {
        jsFiles.push(full);
      }
    }
  } catch {
    // js/ may not exist in test environments
  }
}
collectJs(jsDir);

let jsBefore = 0;
let jsAfter = 0;
let jsErrors = 0;

const jsTasks = jsFiles.map((p) => async () => {
  try {
    const src = readFileSync(p, 'utf8');
    const before = Buffer.byteLength(src, 'utf8');
    const result = await minifyJs(src, { compress: true, mangle: true });
    if (result.code) {
      writeFileSync(p, result.code);
      const after = Buffer.byteLength(result.code, 'utf8');
      return { before, after, ok: true };
    }
    // Terser succeeded but produced no output — log and skip (file stays as-is)
    console.warn(`⚠️  terser returned no code for ${p} — skipping`);
    return { before, after: before, ok: true };
  } catch (e) {
    console.error(`❌ JS minify failed for ${p}: ${e.message}`);
    return { before: 0, after: 0, ok: false };
  }
});

const jsResults = await pool(jsTasks, CONCURRENCY);
for (const r of jsResults) {
  if (r.ok) {
    jsBefore += r.before;
    jsAfter += r.after;
  } else {
    jsErrors++;
  }
}
totalBefore += jsBefore;
totalAfter += jsAfter;
errors += jsErrors;
console.log(
  `  JS:   ${jsFiles.length - jsErrors} files minified  ${fmt(jsBefore, jsAfter)}`,
);

// ─── summary ────────────────────────────────────────────────────────────────

const savedTotal = totalBefore - totalAfter;
const pctTotal =
  totalBefore > 0 ? ((savedTotal / totalBefore) * 100).toFixed(1) : '0.0';
console.log(
  `✅ Minification complete: ${totalBefore} → ${totalAfter} B ` +
    `(saved ${savedTotal} B / ${pctTotal}% across CSS + ${allHtml.length} HTML + ${jsFiles.length} JS)`,
);

if (errors > 0) {
  console.error(`❌ ${errors} file(s) failed to minify — aborting deploy.`);
  process.exit(1);
}
