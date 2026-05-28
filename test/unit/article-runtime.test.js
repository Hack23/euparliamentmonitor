// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { Window } from 'happy-dom';

function runRuntime(html, hash = '', sessionSeed = {}) {
  const runtimePath = path.resolve('js/article-runtime.js');
  const runtimeCode = fs.readFileSync(runtimePath, 'utf8');
  const window = new Window({ url: `https://example.test/news/example-en.html${hash}` });
  const { document } = window;
  document.body.innerHTML = html;
  for (const [key, value] of Object.entries(sessionSeed)) {
    window.sessionStorage.setItem(key, String(value));
  }
  window.requestAnimationFrame = (cb) => {
    cb();
    return 1;
  };
  window.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
  window.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  };
  const sandbox = {
    window,
    document,
    localStorage: window.localStorage,
    sessionStorage: window.sessionStorage,
    IntersectionObserver: window.IntersectionObserver,
    URL: window.URL,
    console,
    setTimeout,
    clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext(runtimeCode, sandbox);
  return window;
}

describe('article-runtime progressive disclosure', () => {
  it('auto-expands collapsed layers when loading a URL hash anchor', () => {
    const win = runRuntime(
      [
        '<aside><ol class="article-toc-list"><li><a href="#section-synthesis">Synthesis</a></li></ol></aside>',
        '<details class="article-layer-details" data-disclosure-layer="analysis" id="article-layer-analysis">',
        '<summary>Read full analysis</summary>',
        '<section><h2 id="section-synthesis">Synthesis</h2></section>',
        '</details>',
      ].join(''),
      '#section-synthesis'
    );
    const details = win.document.getElementById('article-layer-analysis');
    expect(details?.hasAttribute('open')).toBe(true);
  });

  it('persists disclosure state in sessionStorage and restores it on reload', () => {
    const html = [
      '<details class="article-layer-details" data-disclosure-layer="analysis" id="article-layer-analysis" open>',
      '<summary>Read full analysis</summary>',
      '<section><h2 id="section-synthesis">Synthesis</h2></section>',
      '</details>',
    ].join('');
    const first = runRuntime(html);
    const details = first.document.getElementById('article-layer-analysis');
    details?.removeAttribute('open');
    details?.dispatchEvent(new first.Event('toggle'));
    const key = `ep-article-disclosure:${first.location.pathname}`;
    const persisted = first.sessionStorage.getItem(key);
    expect(persisted).toContain('"analysis":false');

    const second = runRuntime(html, '', { [key]: persisted ?? '{}' });
    const restored = second.document.getElementById('article-layer-analysis');
    expect(restored?.hasAttribute('open')).toBe(false);
  });
});
