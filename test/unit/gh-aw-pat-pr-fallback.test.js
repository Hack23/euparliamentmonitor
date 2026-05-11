// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'gh-aw-pat-pr-fallback.sh');

function runFallback(ghAwDir, extraEnv = {}) {
  const r = spawnSync('bash', [SCRIPT], {
    encoding: 'utf8',
    env: {
      ...process.env,
      GH_AW_DIR: ghAwDir,
      GH_AW_PAT_FALLBACK_STDIO_LOG: path.join(ghAwDir, 'missing-stdio.log'),
      ...extraEnv,
    },
  });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

let ghAwDir;

beforeEach(() => {
  ghAwDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-pat-fallback-'));
});

afterEach(() => {
  fs.rmSync(ghAwDir, { recursive: true, force: true });
});

describe('gh-aw-pat-pr-fallback.sh', () => {
  it('activates for failed safe_outputs runs when a gh-aw patch artifact exists', () => {
    fs.writeFileSync(path.join(ghAwDir, 'aw-create-pull-request.patch'), 'diff --git a/x b/x\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'failure',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('no fallback token available; fallback skipped');
    expect(result.stdout).not.toContain('no recovery/failed-safeoutputs patch');
  });

  it('activates for failed safe_outputs runs when only a bundle artifact exists (bundle-only case)', () => {
    // Trigger 4: safe_outputs_failed + aw-*.bundle exists (no patch).
    // Covers the edge case where gh-aw emits only a bundle and the bundle
    // prerequisite fails due to a shallow-clone race (e.g. run #25653736742).
    fs.writeFileSync(path.join(ghAwDir, 'aw-news-2026-05-11-propositions-run251.bundle'), 'bundle-placeholder\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'failure',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('no fallback token available; fallback skipped');
    expect(result.stdout).not.toContain('no recovery/failed-safeoutputs patch/bundle artifact');
  });

  it('does not activate for patch artifacts while safe_outputs is still unknown', () => {
    fs.writeFileSync(path.join(ghAwDir, 'aw-create-pull-request.patch'), 'diff --git a/x b/x\n');

    const result = runFallback(ghAwDir);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('agent stdio log not found and no recovery/failed-safeoutputs patch or bundle');
  });

  it('does not activate for bundle artifacts while safe_outputs is still unknown', () => {
    fs.writeFileSync(path.join(ghAwDir, 'aw-news-run.bundle'), 'bundle-placeholder\n');

    const result = runFallback(ghAwDir);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('agent stdio log not found and no recovery/failed-safeoutputs patch or bundle');
  });
});
