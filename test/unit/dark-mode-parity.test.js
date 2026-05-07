// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @file Drift-guard for dark-mode CSS parity.
 *
 * Every CSS selector that has an explicit `html[data-theme='dark']` rule
 * (manual toggle) MUST also have a parallel rule inside a
 * `@media (prefers-color-scheme: dark) { html:not([data-theme='light']) … }`
 * block, otherwise users on a dark-OS who never touched the toggle see
 * default light styling. This test scans `styles.css` and fails if any
 * new orphan rule is introduced.
 *
 * The two intentionally-inverted theme-toggle icon selectors are
 * allow-listed below — they use `:not([data-theme='dark'])` as the
 * complement of `[data-theme='dark']`, so by design they have no
 * `prefers-color-scheme: dark` pair.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STYLES_PATH = resolve(__dirname, '../..', 'styles.css');

/**
 * Allow-list of selectors that intentionally appear under
 * `html[data-theme='dark']` without a `prefers-color-scheme: dark`
 * mirror. Each entry MUST include a justification comment.
 */
const PARITY_ALLOWLIST = new Set([
  // Theme-toggle icons toggle visibility based on the *complement* of the
  // dark theme attribute (so the light icon shows when the page is not
  // explicitly in dark mode). The system-pref pair is the inverse rule
  // earlier in the file (`html:not([data-theme='dark']) .theme-toggle__icon--light`).
  ":not([data-theme='dark']) .theme-toggle__icon--light",
  ":not([data-theme='dark']) .theme-toggle__svg--light",
]);

/** Find every `{ … }` body of a given top-level @media block. */
function findMediaBlocks(css) {
  const re = /@media \(prefers-color-scheme: dark\)\s*\{/g;
  const blocks = [];
  let m;
  while ((m = re.exec(css))) {
    const start = m.index + m[0].length;
    let depth = 1;
    let i = start;
    for (; i < css.length && depth > 0; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
    }
    blocks.push(css.slice(start, i - 1));
  }
  return blocks;
}

function normaliseSelector(sel) {
  let n = sel.trim();
  n = n.replace(/^html\s*/, '');
  n = n.replace(/^:not\(\[data-theme=.light.\]\)\s*/, '');
  n = n.replace(/^\[data-theme=.dark.\]\s*/, '');
  return n.trim();
}

function extractSelectorsFromBlock(block) {
  const out = new Set();
  const stripped = block.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /([^{}\n;][^{}]*?)\s*\{/g;
  let m;
  while ((m = re.exec(stripped))) {
    const sel = m[1].trim();
    if (!sel || sel.startsWith('@')) continue;
    for (const part of sel.split(',')) {
      const n = normaliseSelector(part);
      if (n) out.add(n);
    }
  }
  return out;
}

function extractManualDarkSelectors(css) {
  const out = new Set();
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const ruleRe = /(^|\})\s*([^{}]+?)\s*\{/g;
  let m;
  while ((m = ruleRe.exec(stripped))) {
    const sel = m[2].trim();
    // Cheap guard: rule must mention data-theme='dark'
    if (!/data-theme=.dark./.test(sel)) continue;
    for (const part of sel.split(',')) {
      if (!/data-theme=.dark./.test(part)) continue;
      const n = normaliseSelector(part);
      if (n) out.add(n);
    }
  }
  return out;
}

describe('dark-mode CSS parity', () => {
  const css = readFileSync(STYLES_PATH, 'utf8');
  const mediaSelectors = new Set();
  for (const block of findMediaBlocks(css)) {
    for (const s of extractSelectorsFromBlock(block)) mediaSelectors.add(s);
  }
  const manualSelectors = extractManualDarkSelectors(css);

  it('every html[data-theme="dark"] selector has a @media (prefers-color-scheme: dark) parity rule', () => {
    const orphans = [...manualSelectors]
      .filter((s) => !mediaSelectors.has(s))
      .filter((s) => !PARITY_ALLOWLIST.has(s))
      .sort();
    expect(orphans).toEqual([]);
  });

  it('finds at least one manual dark rule (sanity check on the parser)', () => {
    expect(manualSelectors.size).toBeGreaterThan(20);
  });

  it('finds at least one prefers-color-scheme: dark media block (sanity check on the parser)', () => {
    expect(mediaSelectors.size).toBeGreaterThan(20);
  });
});
