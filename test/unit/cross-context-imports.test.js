// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Drift-guard for cross-context imports inside `src/`.
 *
 * The codebase organises business logic into bounded contexts that
 * live in sibling directories under `src/`. Each context owns its
 * public API via an `index.ts` barrel. To preserve the hexagonal-style
 * adjacency documented in ARCHITECTURE.md, cross-context imports MUST
 * go through the barrel — never reach into a sibling's internals.
 *
 * This test grep-asserts that the set of cross-context imports does
 * not grow beyond the documented baseline (KNOWN_BASELINE below).
 * Adding a new aggregator→generators or generators→aggregator import
 * fails CI immediately and forces an explicit conversation in code
 * review about whether the new coupling is appropriate.
 *
 * To clear a baseline entry: move the helper into a neutral zone
 * (`src/shared/`, `src/constants/`, `src/types/`) and remove the
 * entry from the baseline. **Never** add new entries to the baseline
 * to silence the guard — that defeats the drift-guard.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const SRC = new URL('../../src/', import.meta.url).pathname;

// Pre-existing cross-context imports (May 2026). Sorted; each entry is
// `<importer relative to src/>::<specifier>`. Driven by `src/aggregator/
// html/*.ts` needing filename helpers from the generators and by
// `src/generators/news-indexes.ts` needing the metadata resolver. Both
// will be cleaned up by the planned article-html/article-metadata
// splits documented in the SEO-headers follow-up issue.
const KNOWN_BASELINE = new Set([
  'aggregator/html/shell.ts::../../generators/political-intelligence.js',
  'aggregator/html/shell.ts::../../generators/sitemap/index.js',
  'aggregator/html/tradecraft-cards.ts::../../generators/political-intelligence-descriptions.js',
  'aggregator/html/analysis-index-cards.ts::../../generators/political-intelligence-descriptions.js',
  'generators/news-indexes/backfill.ts::../../aggregator/article-metadata.js',
  'generators/political-intelligence/html.ts::../../aggregator/infra/github-urls.js',
]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (full.endsWith('.ts')) out.push(full);
  }
  return out;
}

// Pre-compute file maps once — readdir/readFile here is cheap (<200 files).
const FILES = walk(SRC);

function importsMatching(file, predicate) {
  const src = readFileSync(file, 'utf8');
  // Matches both `from '…';` and dynamic `import('…')` specifiers.
  const re = /(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g;
  const hits = [];
  let m;
  while ((m = re.exec(src))) {
    if (predicate(m[1])) hits.push({ file: relative(SRC, file), spec: m[1] });
  }
  return hits;
}

describe('cross-context import drift-guard', () => {
  it('no NEW aggregator→generators imports beyond the documented baseline', () => {
    const hits = FILES.filter((f) => f.includes(`${SRC}aggregator/`)).flatMap((f) =>
      importsMatching(f, (spec) => /(^|\/)generators\//.test(spec))
    );
    const offenders = hits.filter((h) => !KNOWN_BASELINE.has(`${h.file}::${h.spec}`));
    expect(offenders).toEqual([]);
  });

  it('no NEW generators→aggregator imports beyond the documented baseline', () => {
    const hits = FILES.filter((f) => f.includes(`${SRC}generators/`)).flatMap((f) =>
      importsMatching(f, (spec) => /(^|\/)aggregator\//.test(spec))
    );
    const offenders = hits.filter((h) => !KNOWN_BASELINE.has(`${h.file}::${h.spec}`));
    expect(offenders).toEqual([]);
  });

  it('baseline does not silently shrink (every entry must still match a real import)', () => {
    // If you delete a cross-context import, also delete its baseline entry
    // so future regressions can't re-introduce it under cover of the existing
    // baseline.
    const aggregatorHits = new Set(
      FILES.filter((f) => f.includes(`${SRC}aggregator/`))
        .flatMap((f) => importsMatching(f, (spec) => /(^|\/)generators\//.test(spec)))
        .map((h) => `${h.file}::${h.spec}`)
    );
    const generatorHits = new Set(
      FILES.filter((f) => f.includes(`${SRC}generators/`))
        .flatMap((f) => importsMatching(f, (spec) => /(^|\/)aggregator\//.test(spec)))
        .map((h) => `${h.file}::${h.spec}`)
    );
    const allHits = new Set([...aggregatorHits, ...generatorHits]);
    const stale = [...KNOWN_BASELINE].filter((entry) => !allHits.has(entry));
    expect(stale).toEqual([]);
  });

  it('src/constants/seo/ files only reach into types / language-core / siblings', () => {
    const offenders = FILES.filter((f) => f.includes(`${SRC}constants/seo/`)).flatMap((f) =>
      importsMatching(f, (spec) => {
        if (spec.startsWith('./')) return false;
        if (spec === '../language-core.js') return false;
        if (spec.startsWith('../../types/')) return false;
        if (!spec.startsWith('.')) return false;
        return true;
      })
    );
    expect(offenders).toEqual([]);
  });

  it('src/aggregator/metadata/ leaf modules have NO upward runtime imports', () => {
    // Bounded-context rule: `metadata/` leaf modules (everything except
    // the `index.ts` barrel) MUST NOT have a *runtime* dependency on any
    // aggregator module outside their own directory. Type-only
    // re-exports (`export type ... from`) are erased at compile time and
    // are permitted because they introduce no graph coupling at runtime.
    function nonTypeImportsMatching(file, predicate) {
      const src = readFileSync(file, 'utf8');
      // Skip `import type { … } from '…'` and `export type { … } from '…'`.
      const stripped = src
        .replace(/import\s+type\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?/g, '')
        .replace(/export\s+type\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?/g, '');
      const re = /(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g;
      const hits = [];
      let m;
      while ((m = re.exec(stripped))) {
        if (predicate(m[1])) hits.push({ file: relative(SRC, file), spec: m[1] });
      }
      return hits;
    }
    const offenders = FILES.filter(
      (f) => f.includes(`${SRC}aggregator/metadata/`) && !f.endsWith('/index.ts')
    ).flatMap((f) =>
      nonTypeImportsMatching(f, (spec) => {
        if (spec.startsWith('./')) return false;
        // Forbid any upward runtime reach into the aggregator orchestrator layer.
        if (spec.startsWith('../') && !spec.startsWith('../../')) return true;
        // Allow types and constants.
        if (spec.startsWith('../../types/')) return false;
        if (spec.startsWith('../../constants/')) return false;
        if (spec.startsWith('../../utils/')) return false;
        if (!spec.startsWith('.')) return false;
        // Anything else two-dots-up that isn't an allowed neutral zone is suspect.
        return true;
      })
    );
    expect(offenders).toEqual([]);
  });

  it('legacy re-export shims contain only export-from statements', () => {
    const shims = [
      join(SRC, 'constants', 'og-locales.ts'),
      join(SRC, 'constants', 'social-handles.ts'),
    ];
    for (const shim of shims) {
      const src = readFileSync(shim, 'utf8');
      // Collapse multi-line export-from blocks into a single token so we can
      // sanity-check the body. There must be no executable statements.
      const collapsed = src.replace(/\s+/g, ' ');
      // Disallow `function`, `const … =` (other than re-exports), or any
      // statement that isn't `export … from '…'`.
      expect(collapsed).not.toMatch(/function\s+\w+\s*\(/);
      expect(collapsed).not.toMatch(/^\s*const\s+\w+\s*=/m);
      // Must contain at least one re-export.
      expect(collapsed).toMatch(/export\s*\{[^}]+\}\s*from\s*['"]\.\/seo\//);
    }
  });
});
