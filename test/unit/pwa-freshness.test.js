// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

describe('PWA freshness assets', () => {
  it('routes web manifests through a manifest-specific network-first fallback', () => {
    const serviceWorkerTemplate = fs.readFileSync(
      path.join(PROJECT_ROOT, 'sw.js.template'),
      'utf-8'
    );

    expect(serviceWorkerTemplate).toContain('function networkFirstManifest(request)');
    expect(serviceWorkerTemplate).toContain(
      "'Content-Type': 'application/manifest+json; charset=utf-8'"
    );
    expect(serviceWorkerTemplate).toContain("short_name: 'EU Monitor'");
    expect(serviceWorkerTemplate).toContain(
      '    } else if (/\\.webmanifest$/i.test(url.pathname)) {\n' +
        '      event.respondWith(networkFirstManifest(request));'
    );
  });

  it('resolves PWA root assets from page path rather than preload links', () => {
    const pwaRegister = fs.readFileSync(path.join(PROJECT_ROOT, 'js/pwa-register.js'), 'utf-8');

    expect(pwaRegister).toContain('function resolveRootAssetHref(file)');
    expect(pwaRegister).toContain("window.location.pathname.indexOf('/news/') === 0");
    expect(pwaRegister).not.toContain('resolvePreloadHref');
    expect(pwaRegister).not.toContain('link[rel="preload"]');
  });
});
