// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `scripts/lint-src-todos.js`. The linter fails CI when
 * `TODO:`/`FIXME:`/`XXX:` markers appear in `src/**\/*.ts` without a
 * tracking issue link in the canonical `(#NNNN)` form.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findOffenders } from '../../scripts/lint-src-todos.js';

describe('lint-src-todos', () => {
  let dir;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'lint-src-todos-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('reports no offenders for clean code', () => {
    writeFileSync(join(dir, 'clean.ts'), `export const foo = 1;\n// normal comment\n`);
    const offenders = findOffenders([join(dir, 'clean.ts')]);
    expect(offenders).toEqual([]);
  });

  it('flags TODO: without an issue link', () => {
    writeFileSync(join(dir, 'dirty.ts'), `// TODO: rename foo\nexport const foo = 1;\n`);
    const offenders = findOffenders([join(dir, 'dirty.ts')]);
    expect(offenders.length).toBe(1);
    expect(offenders[0].marker).toBe('TODO');
  });

  it('flags FIXME: without an issue link', () => {
    writeFileSync(join(dir, 'broken.ts'), `// FIXME: handle the null case\nexport const x = 1;\n`);
    const offenders = findOffenders([join(dir, 'broken.ts')]);
    expect(offenders.length).toBe(1);
    expect(offenders[0].marker).toBe('FIXME');
  });

  it('flags XXX: without an issue link', () => {
    writeFileSync(join(dir, 'legacy.ts'), `// XXX: this is legacy\nexport const x = 1;\n`);
    const offenders = findOffenders([join(dir, 'legacy.ts')]);
    expect(offenders.length).toBe(1);
    expect(offenders[0].marker).toBe('XXX');
  });

  it('accepts TODO(#NNNN): with an issue link', () => {
    writeFileSync(join(dir, 'tracked.ts'), `// TODO(#1988): rename foo\nexport const x = 1;\n`);
    const offenders = findOffenders([join(dir, 'tracked.ts')]);
    expect(offenders).toEqual([]);
  });

  it('accepts FIXME(#NNNN): with an issue link', () => {
    writeFileSync(
      join(dir, 'tracked-fixme.ts'),
      `// FIXME(#42): broken under EU/Helsinki TZ\nexport const x = 1;\n`
    );
    const offenders = findOffenders([join(dir, 'tracked-fixme.ts')]);
    expect(offenders).toEqual([]);
  });

  it('does not flag regex literals that contain TODO substring', () => {
    // The linter requires word-boundary + colon, so /TODO|/, /TODO\w/, and
    // strings like "TODOLIST" do not trigger. Regex literals that *do*
    // include `TODO:` are caught by the LITERAL_ALLOWLIST mechanism in
    // the linter itself, not by this test (covered in src/workflows/
    // completeness-gate/constants.ts).
    writeFileSync(join(dir, 'regex.ts'), `const pat = /TODOLIST/;\nexport { pat };\n`);
    const offenders = findOffenders([join(dir, 'regex.ts')]);
    expect(offenders).toEqual([]);
  });

  it('reports line number for accurate locating', () => {
    writeFileSync(
      join(dir, 'multiline.ts'),
      `export const a = 1;\nexport const b = 2;\n// TODO: fix me\nexport const c = 3;\n`
    );
    const offenders = findOffenders([join(dir, 'multiline.ts')]);
    expect(offenders.length).toBe(1);
    expect(offenders[0].line).toBe(3);
  });

  it('walks nested directories and finds offenders deep in the tree', () => {
    const nested = join(dir, 'deep', 'nested', 'subdir');
    mkdirSync(nested, { recursive: true });
    writeFileSync(join(nested, 'buried.ts'), `// XXX: hidden\nexport const x = 1;\n`);
    const offenders = findOffenders([join(nested, 'buried.ts')]);
    expect(offenders.length).toBe(1);
  });
});
