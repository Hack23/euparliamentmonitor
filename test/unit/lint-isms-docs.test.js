// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const LINT_SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../scripts/lint-isms-docs.js',
);

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

function runLint() {
  try {
    const stdout = execFileSync(process.execPath, [LINT_SCRIPT], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: REPO_ROOT,
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status || 1,
      stdout: (err.stdout || '').toString(),
      stderr: (err.stderr || '').toString(),
    };
  }
}

describe('scripts/lint-isms-docs.js', () => {
  it('exits 0 against the repository in its current refreshed state', () => {
    const result = runLint();
    if (result.code !== 0) {
      // Surface stderr to make CI failures actionable.
      console.error(result.stderr);
    }
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/OK — \d+ docs, \d+ slugs/);
  });

  it('declares the expected number of current-state ISMS docs and slugs', () => {
    const result = runLint();
    expect(result.code).toBe(0);
    // 15 ISMS docs (current-state set) and 14 article slugs (deep-analysis excluded).
    expect(result.stdout).toContain('15 docs');
    expect(result.stdout).toContain('14 slugs');
  });
});
