// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';
import { describe, expect, it, vi } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

function readServiceWorkerTemplate() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'sw.js.template'), 'utf-8');
}

function readPwaRegister() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'js/pwa-register.js'), 'utf-8');
}

describe('PWA freshness assets', () => {
  it('routes web manifests through a manifest-specific network-first fallback', () => {
    const serviceWorkerTemplate = readServiceWorkerTemplate();

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

  it('returns a valid manifest fallback when the manifest network request fails', async () => {
    const serviceWorkerTemplate = readServiceWorkerTemplate();
    const sandbox = {
      self: {
        location: { origin: 'https://euparliamentmonitor.com' },
        addEventListener: vi.fn(),
      },
      caches: {},
      fetch: vi.fn().mockRejectedValue(new Error('offline')),
      Request,
      Response,
      URL,
      JSON,
    };

    vm.runInNewContext(serviceWorkerTemplate, sandbox);
    const response = await sandbox.networkFirstManifest(
      new Request('https://euparliamentmonitor.com/site.webmanifest')
    );
    const manifest = await response.json();

    expect(response.ok).toBe(true);
    expect(response.headers.get('Content-Type')).toBe('application/manifest+json; charset=utf-8');
    expect(manifest).toEqual({
      name: 'EU Parliament Monitor',
      short_name: 'EU Monitor',
      start_url: '/?source=pwa',
      scope: '/',
      display: 'standalone',
      background_color: '#003399',
      theme_color: '#003399',
      icons: [],
    });
  });

  it('resolves PWA root assets from page path rather than preload links', () => {
    const pwaRegister = readPwaRegister();

    expect(pwaRegister).toContain('function resolveRootAssetHref(file)');
    expect(pwaRegister).toContain("window.location.pathname.indexOf('/news/') === 0");
    expect(pwaRegister).not.toContain('resolvePreloadHref');
    expect(pwaRegister).not.toContain('link[rel="preload"]');
  });

  it('registers the service worker with root-relative paths for root and news pages', () => {
    const registerForPath = (pathname) => {
      const registrations = [];
      let loadHandler = null;
      const sandbox = {
        window: {
          location: { pathname },
          addEventListener: (event, handler) => {
            if (event === 'load') {
              loadHandler = handler;
            }
          },
        },
        document: {
          querySelector: () => null,
          querySelectorAll: () => [],
          addEventListener: vi.fn(),
          body: { appendChild: vi.fn() },
          createElement: () => ({
            setAttribute: vi.fn(),
            appendChild: vi.fn(),
            addEventListener: vi.fn(),
          }),
          documentElement: { lang: 'en' },
          readyState: 'loading',
          visibilityState: 'visible',
        },
        navigator: {
          serviceWorker: {
            register: (url, options) => {
              registrations.push({ url, options });
              return Promise.resolve({ addEventListener: vi.fn() });
            },
            addEventListener: vi.fn(),
            controller: null,
          },
        },
        setTimeout: vi.fn(),
        setInterval: vi.fn(),
        clearInterval: vi.fn(),
        clearTimeout: vi.fn(),
        Intl,
        Date,
        isNaN,
      };

      vm.runInNewContext(readPwaRegister(), sandbox);
      loadHandler();
      return registrations[0];
    };

    expect(registerForPath('/index.html')).toEqual({
      url: './sw.js',
      options: { scope: './' },
    });
    expect(registerForPath('/news/2026-04-30-example-en.html')).toEqual({
      url: '../sw.js',
      options: { scope: '../' },
    });
  });
});
