#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Generate `build-info.json` (and the runtime `sw.js` from `sw.js.template`)
 * at the project root. Called by `npm run prebuild` BEFORE the TypeScript
 * compile step, so it stays in pure JS (no tsc dependency).
 *
 * The file is published at `/build-info.json` and polled by
 * `js/pwa-register.js` to detect deploys. Schema:
 *
 *   {
 *     "buildId":    "40-char-lowercase-hex",
 *     "buildShort": "1234567",
 *     "buildTime":  "2026-04-30T12:34:56.000Z",
 *     "appVersion": "0.8.51",
 *     "releaseTag": ""           // optional, empty when no tag
 *   }
 *
 * Source precedence:
 *   1. `process.env.BUILD_ID`   — CI sets this from `${{ github.sha }}`
 *   2. `git rev-parse HEAD`     — local dev clones
 *   3. `'0'.repeat(40)`         — deterministic placeholder (never throws)
 *
 * Idempotent: rerunning produces a byte-identical file when env + repo
 * state are unchanged (ignoring BUILD_TIME drift).
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

/**
 * Resolve the build commit SHA from env, then git, then placeholder.
 *
 * @returns {string} 40-char lowercase hex string. Never throws.
 */
function resolveBuildId() {
  const fromEnv = (process.env.BUILD_ID || '').trim();
  if (/^[0-9a-f]{40}$/i.test(fromEnv)) {
    return fromEnv.toLowerCase();
  }
  try {
    const fromGit = execSync('git rev-parse HEAD', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
      cwd: PROJECT_ROOT,
    }).trim();
    if (/^[0-9a-f]{40}$/i.test(fromGit)) {
      return fromGit.toLowerCase();
    }
  } catch {
    /* git unavailable — fall through */
  }
  return '0'.repeat(40);
}

/**
 * Read the package version from `package.json` without throwing.
 *
 * @returns {string} Semver string or `'0.0.0'` fallback.
 */
function readAppVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8'));
    if (pkg && typeof pkg.version === 'string' && pkg.version.trim() !== '') {
      return pkg.version;
    }
  } catch {
    /* fall through */
  }
  return '0.0.0';
}

function main() {
  const buildId = resolveBuildId();
  const buildShort = buildId.slice(0, 7);
  const buildTime = (process.env.BUILD_TIME || '').trim() || new Date().toISOString();
  const releaseTag = (process.env.RELEASE_TAG || '').trim();
  const appVersion = readAppVersion();

  const payload = {
    buildId,
    buildShort,
    buildTime,
    appVersion,
    releaseTag,
  };

  const outPath = path.join(PROJECT_ROOT, 'build-info.json');
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  console.log(`✅ Wrote build-info.json (buildShort=${buildShort}, appVersion=${appVersion})`);

  // Render the service-worker from its template — substitutes the build id
  // into `CACHE_VERSION` so old caches are evicted on every deploy.
  const tplPath = path.join(PROJECT_ROOT, 'sw.js.template');
  const swPath = path.join(PROJECT_ROOT, 'sw.js');
  if (fs.existsSync(tplPath)) {
    const tpl = fs.readFileSync(tplPath, 'utf-8');
    const rendered = tpl.replace(/__BUILD_ID__/g, buildId).replace(/__BUILD_SHORT__/g, buildShort);
    fs.writeFileSync(swPath, rendered, 'utf-8');
    console.log(`✅ Rendered sw.js from template (CACHE_VERSION=${buildShort})`);
  } else {
    console.warn(`⚠️  sw.js.template not found at ${tplPath} — skipping sw.js render`);
  }
}

main();
