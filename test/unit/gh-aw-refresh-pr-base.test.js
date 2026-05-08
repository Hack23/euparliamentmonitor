// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'gh-aw-refresh-pr-base.sh');

function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed in ${cwd}:\n${r.stderr || r.stdout}`);
  }
  return r.stdout.trim();
}

function runRefresh(workspace, extraEnv = {}) {
  const r = spawnSync('bash', [SCRIPT], {
    cwd: workspace,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...extraEnv,
    },
  });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

function createGitTestFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-refresh-'));
  const remote = path.join(root, 'origin.git');
  const seed = path.join(root, 'seed');
  const workspace = path.join(root, 'workspace');

  git(root, 'init', '--bare', remote, '-q');
  git(root, 'init', '-b', 'main', seed, '-q');
  git(seed, 'config', 'user.email', 't@t');
  git(seed, 'config', 'user.name', 't');
  fs.writeFileSync(path.join(seed, 'README.md'), 'base\n');
  git(seed, 'add', '.');
  git(seed, 'commit', '-qm', 'base');
  git(seed, 'remote', 'add', 'origin', remote);
  git(seed, 'push', '-q', 'origin', 'main');

  git(root, 'clone', '-q', '-b', 'main', remote, workspace);
  git(workspace, 'config', 'user.email', 't@t');
  git(workspace, 'config', 'user.name', 't');

  return { root, seed, workspace };
}

let fixture;

beforeEach(() => {
  fixture = createGitTestFixture();
});

afterEach(() => {
  fs.rmSync(fixture.root, { recursive: true, force: true });
});

describe('gh-aw-refresh-pr-base.sh', () => {
  it('rebases a clean news branch onto the latest origin/main', () => {
    const { seed, workspace } = fixture;

    git(workspace, 'checkout', '-qb', 'news/2026-05-08-term-outlook');
    fs.mkdirSync(path.join(workspace, 'analysis/daily/2026-05-08/term-outlook'), { recursive: true });
    fs.writeFileSync(
      path.join(workspace, 'analysis/daily/2026-05-08/term-outlook/article.md'),
      '# Term Outlook\n',
    );
    git(workspace, 'add', '.');
    git(workspace, 'commit', '-qm', 'agent output');

    fs.writeFileSync(path.join(seed, 'main.txt'), 'new main commit\n');
    git(seed, 'add', '.');
    git(seed, 'commit', '-qm', 'advance main');
    git(seed, 'push', '-q', 'origin', 'main');

    const result = runRefresh(workspace);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('rebased news/2026-05-08-term-outlook onto refs/remotes/origin/main');
    expect(git(workspace, 'merge-base', '--is-ancestor', 'origin/main', 'HEAD')).toBe('');
  });

  it('skips non-news branches without changing history', () => {
    const { workspace } = fixture;
    const before = git(workspace, 'rev-parse', 'HEAD');

    const result = runRefresh(workspace);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('current branch is not news/*');
    expect(git(workspace, 'rev-parse', 'HEAD')).toBe(before);
  });

  it('fails fast when the news branch has uncommitted changes', () => {
    const { workspace } = fixture;
    git(workspace, 'checkout', '-qb', 'news/dirty-output');
    fs.writeFileSync(path.join(workspace, 'dirty.md'), 'dirty\n');

    const result = runRefresh(workspace);

    expect(result.code).toBe(1);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('working tree is dirty');
  });

  it('rejects unsafe base branch names from the environment', () => {
    const { workspace } = fixture;
    git(workspace, 'checkout', '-qb', 'news/unsafe-base');

    const result = runRefresh(workspace, {
      GH_AW_PR_BASE_BRANCH: '../main',
    });

    expect(result.code).toBe(1);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('invalid base branch');
  });
});
