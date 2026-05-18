// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Drift-guard for the `src/types/` bounded-context split (Refactor 1/8).
 *
 * Asserts that:
 * 1. Every public symbol declared in the new bounded-context sub-modules
 *    (`article-strings/*.ts`, `visualization/*.ts`, `mcp/*.ts`, plus
 *    `languages.ts`, `article-category.ts`) is re-exported from the legacy
 *    barrels (`common.ts`, `visualization.ts`, `mcp.ts`).
 * 2. The single public barrel (`src/types/index.ts`) transitively re-exports
 *    every symbol the sub-modules expose, so downstream consumers
 *    importing from `../types/index.js` continue to see the full surface.
 * 3. No file under `src/types/` exceeds the 600-LOC refactor floor.
 * 4. The thin re-export barrels (`common.ts` / `visualization.ts` /
 *    `mcp.ts`) stay below 200 LOC each.
 *
 * If this test fails after editing a sub-module, the fix is almost always
 * to add the new symbol to the appropriate legacy barrel and / or
 * `index.ts` re-export block.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const TYPES_DIR = path.join(__dirname, '..', '..', 'src', 'types');

/**
 * Scan a `.ts` source file and return the set of public symbol names it
 * declares (exported interfaces, type aliases, enums, classes, const
 * declarations, and functions). Re-export blocks (`export type { … } from`)
 * are ignored because they don't introduce new symbols — they forward
 * existing ones.
 *
 * @param {string} filePath
 * @returns {Set<string>}
 */
function declaredExports(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const symbols = new Set();

  // Strip block comments so `* export ...` inside JSDoc is not picked up.
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, '');

  // Match `export interface|type|enum|class|const|function` at start of
  // line (allowing optional leading whitespace and `declare`).
  const decl =
    /^\s*export\s+(?:declare\s+)?(?:interface|type|enum|class|const|function)\s+([A-Za-z_$][\w$]*)/gm;
  let m;
  while ((m = decl.exec(stripped)) !== null) {
    const name = m[1];
    if (name) symbols.add(name);
  }
  return symbols;
}

/**
 * Scan a `.ts` source file and return the set of all symbol names that it
 * re-exports — both `export { A, B } from '…'` and
 * `export type { A, B } from '…'`. The optional `type` prefix on
 * individual specifiers (e.g. `type LanguageCode`) is stripped.
 *
 * @param {string} filePath
 * @returns {Set<string>}
 */
function reExportedSymbols(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const symbols = new Set();
  const re = /export\s+(?:type\s+)?\{([^}]+)\}\s*from\s+['"][^'"]+['"]/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const inner = m[1];
    if (!inner) continue;
    for (const part of inner.split(',')) {
      const cleaned = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0]
        ?.trim();
      if (cleaned) symbols.add(cleaned);
    }
  }
  return symbols;
}

const SUB_MODULES = [
  // common.ts sub-modules
  'languages.ts',
  'article-category.ts',
  'article-strings/propositions.ts',
  'article-strings/motions.ts',
  'article-strings/week-ahead.ts',
  'article-strings/breaking.ts',
  'article-strings/committee.ts',
  // visualization.ts sub-modules
  'visualization/swot.ts',
  'visualization/charts.ts',
  'visualization/dashboard.ts',
  'visualization/mindmap.ts',
  'visualization/voting-bloc.ts',
  // mcp.ts sub-modules
  'mcp/client.ts',
  'mcp/ep-tools.ts',
  'mcp/ep-feeds.ts',
  'mcp/reports.ts',
];

const LEGACY_BARRELS = [
  [
    'common.ts',
    [
      'languages.ts',
      'article-category.ts',
      'article-strings/propositions.ts',
      'article-strings/motions.ts',
      'article-strings/week-ahead.ts',
      'article-strings/breaking.ts',
      'article-strings/committee.ts',
    ],
  ],
  [
    'visualization.ts',
    [
      'visualization/swot.ts',
      'visualization/charts.ts',
      'visualization/dashboard.ts',
      'visualization/mindmap.ts',
      'visualization/voting-bloc.ts',
    ],
  ],
  [
    'mcp.ts',
    [
      'mcp/client.ts',
      'mcp/ep-tools.ts',
      'mcp/ep-feeds.ts',
      'mcp/reports.ts',
    ],
  ],
];

describe('types refactor 1/8 — drift-guard', () => {
  for (const [barrel, subModules] of LEGACY_BARRELS) {
    it(`legacy barrel ${barrel} re-exports every symbol from its sub-modules`, () => {
      const barrelExports = reExportedSymbols(path.join(TYPES_DIR, barrel));
      const missing = [];
      for (const sub of subModules) {
        const decls = declaredExports(path.join(TYPES_DIR, sub));
        for (const sym of decls) {
          if (!barrelExports.has(sym)) {
            missing.push(`${barrel} ← ${sub}: ${sym}`);
          }
        }
      }
      expect(missing).toEqual([]);
    });
  }

  it('types/index.ts transitively re-exports every symbol from every sub-module', () => {
    const indexExports = reExportedSymbols(path.join(TYPES_DIR, 'index.ts'));
    const missing = [];
    for (const sub of SUB_MODULES) {
      const decls = declaredExports(path.join(TYPES_DIR, sub));
      for (const sym of decls) {
        if (!indexExports.has(sym)) {
          missing.push(`index.ts ← ${sub}: ${sym}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('common.ts / visualization.ts / mcp.ts barrels stay thin (≤ 200 LOC each)', () => {
    for (const [barrel] of LEGACY_BARRELS) {
      const source = fs.readFileSync(path.join(TYPES_DIR, barrel), 'utf8');
      const loc = source.split('\n').length;
      expect(loc, `legacy barrel ${barrel} grew to ${loc} LOC — should stay ≤ 200`).toBeLessThanOrEqual(200);
    }
  });

  it('no file under src/types/ exceeds the 600-LOC refactor floor', () => {
    const offenders = [];
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          const loc = fs.readFileSync(full, 'utf8').split('\n').length;
          if (loc > 600) {
            offenders.push(`${path.relative(TYPES_DIR, full)} = ${loc} LOC`);
          }
        }
      }
    };
    walk(TYPES_DIR);
    expect(offenders).toEqual([]);
  });
});
