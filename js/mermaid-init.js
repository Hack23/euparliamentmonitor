// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Same-origin Mermaid bootstrap for aggregator-rendered articles.
 *
 * Markdown artifacts render Mermaid fences as `<pre class="mermaid">` blocks
 * (see `src/aggregator/markdown-renderer.ts`). This module dynamically
 * imports the vendored ESM bundle from `js/vendor/mermaid/mermaid.esm.min.mjs`
 * (copied from the pinned `mermaid` devDependency by
 * `scripts/copy-vendor.js`), upgrades the `<pre>` blocks to `<div>` blocks
 * so Mermaid's run loop can replace them with rendered SVG, and then runs
 * Mermaid against every diagram on the page.
 *
 * Design choices:
 *
 *   1. **Dynamic `import()`** instead of a top-level `import` so that a
 *      missing or 5xx vendor bundle leaves the page usable (the raw
 *      `<pre class="mermaid">` source stays readable as a fallback) instead
 *      of throwing an unhandled module-loading error in the console.
 *
 *   2. **`<pre>` → `<div>` upgrade** matches the contract of the
 *      `riksdagsmonitor` reference implementation and is what the
 *      Mermaid v11 docs recommend; it sidesteps the `<pre>` whitespace and
 *      sizing quirks that occasionally break diagram layouts after
 *      Mermaid micro-releases.
 *
 *   3. **`requestIdleCallback` boot** keeps Mermaid out of the critical
 *      rendering path so first-paint stays fast.
 *
 *   4. **No external CDN.** Both this loader and the bundle it imports are
 *      served from S3 + CloudFront under the article origin, so the page
 *      CSP can stay at `script-src 'self'` (no `connect-src` opening for
 *      `cdn.jsdelivr.net` or `unpkg.com`).
 *
 * The bundle URL is resolved relative to *this* loader's URL via
 * `import.meta.url`, so renaming `news/` → some other directory or
 * shipping the loader from a different prefix continues to work without
 * code changes.
 */

const MERMAID_BUNDLE = new URL('./vendor/mermaid/mermaid.esm.min.mjs', import.meta.url).href;

function isDarkTheme() {
  if (document.documentElement.dataset.theme === 'dark') return true;
  if (document.documentElement.dataset.theme === 'light') return false;
  return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

async function boot() {
  const blocks = document.querySelectorAll('pre.mermaid, div.mermaid');
  if (blocks.length === 0) return;

  let mermaidModule;
  try {
    mermaidModule = await import(/* webpackIgnore: true */ MERMAID_BUNDLE);
  } catch (err) {
    console.warn('[mermaid-init] Failed to load Mermaid bundle:', err);
    for (const node of blocks) {
      node.classList.add('mermaid--error');
    }
    return;
  }

  const mermaid = mermaidModule.default || mermaidModule;
  const dark = isDarkTheme();

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    themeVariables: {
      primaryColor: dark ? '#1565C0' : '#E3F2FD',
      primaryTextColor: dark ? '#ffffff' : '#0A3F7F',
      primaryBorderColor: '#0A3F7F',
      lineColor: dark ? '#90CAF9' : '#1565C0',
      secondaryColor: dark ? '#2E7D32' : '#E8F5E9',
      secondaryTextColor: dark ? '#ffffff' : '#1B5E20',
      tertiaryColor: '#FF9800',
      tertiaryTextColor: '#000000',
      noteBkgColor: '#FFC107',
      noteTextColor: '#000000',
      errorBkgColor: '#D32F2F',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
    },
    flowchart: { useMaxWidth: true },
    sequence: { useMaxWidth: true },
  });

  // Convert `<pre class="mermaid">…</pre>` → `<div class="mermaid">…</div>`
  // because mermaid.run({nodes}) replaces the element with rendered SVG and
  // the v11 renderer is happiest when given a generic block container.
  // Pre-existing `<div class="mermaid">` nodes are accepted as-is.
  const diagramNodes = [];
  for (const node of blocks) {
    if (node.tagName === 'PRE') {
      const div = document.createElement('div');
      div.className = node.className.replace(/(^|\s)mermaid-figure(\s|$)/g, ' ').trim();
      if (!div.classList.contains('mermaid')) div.classList.add('mermaid');
      div.textContent = node.textContent || '';
      node.replaceWith(div);
      diagramNodes.push(div);
    } else {
      diagramNodes.push(node);
    }
  }

  try {
    await mermaid.run({ nodes: diagramNodes });
  } catch (err) {
    console.error('[mermaid-init] Mermaid render failed:', err);
    for (const node of diagramNodes) {
      node.classList.add('mermaid--error');
    }
  }
}

function schedule() {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(boot);
  } else {
    setTimeout(boot, 200);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', schedule, { once: true });
} else {
  schedule();
}
