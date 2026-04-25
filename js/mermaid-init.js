// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Same-origin Mermaid bootstrap for aggregator-rendered articles.
 *
 * Markdown artifacts render Mermaid fences as `<pre class="mermaid">` blocks.
 * This module imports the vendored ESM bundle and upgrades those blocks after
 * DOMContentLoaded without inline script, external CDN calls, or relaxed CSP.
 */
import mermaid from './vendor/mermaid.esm.min.mjs';

const darkMode =
  document.documentElement.dataset.theme === 'dark' ||
  window.matchMedia?.('(prefers-color-scheme: dark)').matches;

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'base',
  themeVariables: {
    primaryColor: darkMode ? '#1565C0' : '#E3F2FD',
    primaryTextColor: darkMode ? '#ffffff' : '#0A3F7F',
    primaryBorderColor: '#0A3F7F',
    lineColor: darkMode ? '#90CAF9' : '#1565C0',
    secondaryColor: darkMode ? '#2E7D32' : '#E8F5E9',
    secondaryTextColor: darkMode ? '#ffffff' : '#1B5E20',
    tertiaryColor: '#FF9800',
    tertiaryTextColor: '#000000',
    noteBkgColor: '#FFC107',
    noteTextColor: '#000000',
    errorBkgColor: '#D32F2F',
    fontFamily: 'Inter, Helvetica, Arial, sans-serif',
  },
});

document.addEventListener('DOMContentLoaded', () => {
  const nodes = Array.from(document.querySelectorAll('pre.mermaid'));
  if (nodes.length === 0) return;
  mermaid.run({ nodes }).catch((error) => {
    console.error('Mermaid render failed', error);
    for (const node of nodes) {
      node.classList.add('mermaid--error');
    }
  });
});
