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
 * Build metadata is resolved by `scripts/constants/config.js` so the
 * generator, TypeScript templates, and runtime metadata share one source of
 * truth for precedence, validation, and fallbacks.
 *
 * Idempotent: rerunning produces a byte-identical file when env + repo
 * state are unchanged (ignoring BUILD_TIME drift).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  APP_VERSION,
  BUILD_ID,
  BUILD_SHORT,
  BUILD_TIME,
  RELEASE_TAG,
} from '../constants/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

function main() {
  const payload = {
    buildId: BUILD_ID,
    buildShort: BUILD_SHORT,
    buildTime: BUILD_TIME,
    appVersion: APP_VERSION,
    releaseTag: RELEASE_TAG,
  };

  const outPath = path.join(PROJECT_ROOT, 'build-info.json');
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  console.log(`✅ Wrote build-info.json (buildShort=${BUILD_SHORT}, appVersion=${APP_VERSION})`);

  // Render the service-worker from its template — substitutes the build id
  // into `CACHE_VERSION` so old caches are evicted on every deploy.
  const tplPath = path.join(PROJECT_ROOT, 'sw.js.template');
  const swPath = path.join(PROJECT_ROOT, 'sw.js');
  if (fs.existsSync(tplPath)) {
    const tpl = fs.readFileSync(tplPath, 'utf-8');
    const rendered = tpl
      .replace(/__BUILD_ID__/g, BUILD_ID)
      .replace(/__BUILD_SHORT__/g, BUILD_SHORT);
    fs.writeFileSync(swPath, rendered, 'utf-8');
    console.log(`✅ Rendered sw.js from template (CACHE_VERSION=${BUILD_SHORT})`);
  } else {
    console.warn(`⚠️  sw.js.template not found at ${tplPath} — skipping sw.js render`);
  }
}

main();
