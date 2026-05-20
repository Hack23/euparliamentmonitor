// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Drift-guard: `compile-agentic-workflows.yml` must NEVER mutate generated
 * `.lock.yml` artifacts after `gh aw compile`. The lock files committed to
 * the repo must be the canonical, bit-for-bit compiler output.
 *
 * History: a "Patch safe_outputs fetch-depth for bundle compatibility" step
 * post-processed each news lock file to flip fetch-depth: 1 → 0 on the two
 * safe_outputs Checkout steps. That patch was a workaround for two failure
 * modes (bundle-apply mid-job unshallow timeout; missing prerequisite
 * commits). Both are now structurally handled by the
 * `Fetch triggering commit for bundle prerequisites` pre-step in
 * `.github/workflows/shared/config/news-safe-outputs-head.md`, which fetches
 * the exact GITHUB_SHA the bundle was built against (and unshallows on
 * demand only if that fetch fails). Removing the post-compile patcher makes
 * the lock files reproducible from `gh aw compile` alone.
 *
 * This test fails the build if a future contributor reintroduces a
 * post-compile mutation step.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const COMPILE_WORKFLOW = path.join(
  REPO_ROOT,
  '.github/workflows/compile-agentic-workflows.yml',
);

describe('compile-agentic-workflows.yml — no post-compile patching', () => {
  const body = readFileSync(COMPILE_WORKFLOW, 'utf8');

  it('contains no step that writes to .lock.yml files', () => {
    // Catches: `with open(f, 'w')` + lock-file glob; `sed -i` on *.lock.yml;
    // `python3 -c '... .write(...) ...'` against the lock-file directory.
    expect(body).not.toMatch(/\.lock\.yml['"]?\s*,\s*['"]?w/);
    expect(body).not.toMatch(/sed\s+-i[^\n]*\.lock\.yml/);
    expect(body).not.toMatch(/glob\.glob\([^)]*\.lock\.yml[^)]*\)[\s\S]{0,400}\.write\(/);
  });

  it('does not invoke a Python heredoc that writes back to lock-file content', () => {
    // Permissive guard: any python3 heredoc that references .lock.yml AND
    // writes file content (`open(..., 'w')` or `write_text` / `fp.write(`)
    // is rejected. Reading + normalising a local string copy for regex
    // matching (e.g. `text.replace('\\', '')` in the architecture-check
    // step) is allowed because it does not mutate the artifact on disk.
    const pythonBlocks = body.match(/python3\s*-\s*<<\s*['"]?PYEOF['"]?[\s\S]*?PYEOF/g) || [];
    for (const block of pythonBlocks) {
      const touchesLock = /\.lock\.yml/.test(block);
      const writesBack = /open\([^)]*,\s*['"]w/.test(block) || /\.write_text\(|fp\.write\(/.test(block);
      expect(
        touchesLock && writesBack,
        `python3 heredoc both touches .lock.yml and writes back:\n${block.slice(0, 400)}`,
      ).toBe(false);
    }
  });

  it('still has the canonical Compile step and the commit step', () => {
    // Sanity guard: the workflow's purpose is unchanged — compile, then
    // commit canonical artifacts. We are removing patching, not removing
    // the compile/commit pipeline.
    expect(body).toMatch(/gh aw compile --validate/);
    expect(body).toMatch(/git\s+add[^\n]*\.lock\.yml/);
    expect(body).toMatch(/chore: recompile agentic workflow lock files/);
  });

  it('documents WHY post-compile patching was removed', () => {
    // The removal comment must reference the shared pre-step that
    // structurally replaces the workaround, so a future contributor
    // reading the diff understands the rationale.
    expect(body).toMatch(/does NOT mutate/);
    expect(body).toMatch(/news-safe-outputs-head\.md/);
    expect(body).toMatch(/Fetch triggering commit for bundle prerequisites/);
  });
});
