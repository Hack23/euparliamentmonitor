// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Behavioral test for `scripts/gh-aw-capture-agent-patch.sh`.
 *
 * The script's job is to bridge the safeoutputs-TTL recovery gap reported by
 * run #25028873034 (news-week-in-review): when the agent commits Stage E
 * output to a `news/*` branch and the safeoutputs `create_pull_request`
 * call later fails with `session not found`, the agent's local commits must
 * be serialised to `/tmp/gh-aw/aw-agent-recovery.patch` before the runner
 * is reaped, so the host-side `pat-pr-fallback` job can apply them on a
 * fresh `main` checkout.
 *
 * Contract verified here:
 *
 *   1. With a `news/*` branch ahead of origin/main, the script emits
 *      `aw-agent-recovery.patch` plus a `.meta` sidecar.
 *   2. The emitted patch applies cleanly via `git apply` on a fresh main
 *      checkout (matches `gh-aw-pat-pr-fallback.sh:142`).
 *   3. With no `news/*` branch ahead of origin/main, the script is a
 *      silent no-op (no patch written).
 *   4. With a pre-existing `aw-*.patch` artifact in the output dir, the
 *      script does not clobber it — gh-aw's own safeoutputs patch wins.
 *   5. With multiple `news/*` branches, the most recently committed branch
 *      is selected.
 */

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'gh-aw-capture-agent-patch.sh');

function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed in ${cwd}:\n${r.stderr || r.stdout}`);
  }
  return r.stdout;
}

function runCapture(workspace, outDir, extraEnv = {}) {
  const r = spawnSync('bash', [SCRIPT], {
    encoding: 'utf8',
    env: {
      ...process.env,
      GH_AW_AGENT_WORKSPACE: workspace,
      GH_AW_PATCH_OUT_DIR: outDir,
      ...extraEnv,
    },
  });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

function makeWorkspace() {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-capture-ws-'));
  git(ws, 'init', '-b', 'main', '-q');
  git(ws, 'config', 'user.email', 't@t');
  git(ws, 'config', 'user.name', 't');
  fs.writeFileSync(path.join(ws, 'README.md'), 'base\n');
  git(ws, 'add', '.');
  git(ws, 'commit', '-qm', 'base');
  // Simulate origin/main pointing at the base commit. The script accepts
  // this as the diff base without needing a real remote.
  git(ws, 'update-ref', 'refs/remotes/origin/main', 'HEAD');
  return ws;
}

let workspace;
let outDir;

beforeEach(() => {
  workspace = makeWorkspace();
  outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-capture-out-'));
});

afterEach(() => {
  fs.rmSync(workspace, { recursive: true, force: true });
  fs.rmSync(outDir, { recursive: true, force: true });
});

describe('gh-aw-capture-agent-patch.sh', () => {
  it('captures a recovery patch when a news/* branch is ahead of origin/main', () => {
    git(workspace, 'checkout', '-qb', 'news/2026-04-28-week-in-review');
    fs.mkdirSync(path.join(workspace, 'analysis/daily/2026-04-28/week-in-review'), { recursive: true });
    fs.writeFileSync(
      path.join(workspace, 'analysis/daily/2026-04-28/week-in-review/synthesis-summary.md'),
      '# Synthesis\n',
    );
    git(workspace, 'add', '.');
    git(workspace, 'commit', '-qm', 'agent commit');

    const result = runCapture(workspace, outDir);
    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');

    const patchPath = path.join(outDir, 'aw-agent-recovery.patch');
    const metaPath = path.join(outDir, 'aw-agent-recovery.patch.meta');
    expect(fs.existsSync(patchPath)).toBe(true);
    expect(fs.existsSync(metaPath)).toBe(true);

    const patch = fs.readFileSync(patchPath, 'utf8');
    expect(patch).toContain('analysis/daily/2026-04-28/week-in-review/synthesis-summary.md');
    expect(patch).toContain('+# Synthesis');

    const meta = fs.readFileSync(metaPath, 'utf8');
    expect(meta).toMatch(/^branch=refs\/heads\/news\/2026-04-28-week-in-review$/m);
    expect(meta).toMatch(/^commits_ahead=1$/m);
    expect(meta).toMatch(/^base_ref=refs\/remotes\/origin\/main$/m);
  });

  it('emits a patch that applies cleanly on a fresh main checkout (gh-aw-pat-pr-fallback.sh contract)', () => {
    git(workspace, 'checkout', '-qb', 'news/2026-04-28-breaking');
    fs.mkdirSync(path.join(workspace, 'analysis/daily/2026-04-28/breaking'), { recursive: true });
    fs.writeFileSync(path.join(workspace, 'analysis/daily/2026-04-28/breaking/x.md'), 'content\n');
    git(workspace, 'add', '.');
    git(workspace, 'commit', '-qm', 'agent commit');

    runCapture(workspace, outDir);
    const patchPath = path.join(outDir, 'aw-agent-recovery.patch');
    expect(fs.existsSync(patchPath)).toBe(true);

    // Simulate the host-side fallback: fresh `main` checkout, then `git apply`.
    const fresh = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-fresh-'));
    try {
      git(fresh, 'init', '-b', 'main', '-q');
      git(fresh, 'config', 'user.email', 't@t');
      git(fresh, 'config', 'user.name', 't');
      fs.writeFileSync(path.join(fresh, 'README.md'), 'base\n');
      git(fresh, 'add', '.');
      git(fresh, 'commit', '-qm', 'base');

      // This is the exact apply invocation used by the production fallback at
      // scripts/gh-aw-pat-pr-fallback.sh:142.
      execFileSync('git', ['apply', '--whitespace=nowarn', patchPath], { cwd: fresh });

      const recovered = path.join(fresh, 'analysis/daily/2026-04-28/breaking/x.md');
      expect(fs.readFileSync(recovered, 'utf8')).toBe('content\n');
    } finally {
      fs.rmSync(fresh, { recursive: true, force: true });
    }
  });

  it('is a silent no-op when no news/* branch is ahead of origin/main', () => {
    const result = runCapture(workspace, outDir);
    expect(result.code).toBe(0);
    expect(fs.readdirSync(outDir)).toEqual([]);
  });

  it('does not clobber a pre-existing aw-*.patch (gh-aw safeoutputs patch wins)', () => {
    git(workspace, 'checkout', '-qb', 'news/2026-04-28-test');
    fs.writeFileSync(path.join(workspace, 'a.txt'), 'agent\n');
    git(workspace, 'add', '.');
    git(workspace, 'commit', '-qm', 'agent commit');

    fs.writeFileSync(path.join(outDir, 'aw-create-pull-request.patch'), 'preserve-me\n');

    const result = runCapture(workspace, outDir);
    expect(result.code).toBe(0);
    expect(fs.readFileSync(path.join(outDir, 'aw-create-pull-request.patch'), 'utf8')).toBe('preserve-me\n');
    expect(fs.existsSync(path.join(outDir, 'aw-agent-recovery.patch'))).toBe(false);
  });

  it('selects the most recently committed news/* branch when several exist', () => {
    git(workspace, 'checkout', '-qb', 'news/2026-04-25-old');
    fs.writeFileSync(path.join(workspace, 'old.md'), 'old\n');
    git(workspace, 'add', '.');
    git(workspace, 'commit', '-qm', 'old');

    git(workspace, 'checkout', '-q', 'main');
    git(workspace, 'checkout', '-qb', 'news/2026-04-28-new');
    fs.writeFileSync(path.join(workspace, 'new.md'), 'new\n');
    git(workspace, 'add', '.');
    git(workspace, 'commit', '-qm', 'new');

    runCapture(workspace, outDir);
    const meta = fs.readFileSync(path.join(outDir, 'aw-agent-recovery.patch.meta'), 'utf8');
    expect(meta).toMatch(/^branch=refs\/heads\/news\/2026-04-28-new$/m);
  });
});
