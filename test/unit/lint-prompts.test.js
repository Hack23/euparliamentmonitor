// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const LINT_SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../scripts/lint-prompts.js',
);

function runLint(workflowsDir) {
  try {
    const stdout = execFileSync(
      process.execPath,
      [LINT_SCRIPT, '--workflows-dir', workflowsDir],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status || 1,
      stdout: (err.stdout || '').toString(),
      stderr: (err.stderr || '').toString(),
    };
  }
}

describe('scripts/lint-prompts.js', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lint-prompts-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function writeWorkflow(name, body) {
    fs.writeFileSync(path.join(tmpDir, name), body, 'utf8');
  }

  it('exits 0 when every workflow follows the single-PR rule', () => {
    writeWorkflow(
      'news-example.md',
      '# Title\n\nCall safeoutputs___create_pull_request at the end.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('0 violations');
  });

  it('exits 1 when a workflow calls create_pull_request more than once', () => {
    writeWorkflow(
      'news-bad-multi-pr.md',
      '# Title\n' +
        'Call safeoutputs___create_pull_request at min 3.\n' +
        'Call safeoutputs___create_pull_request again at min 50.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('must appear at most once');
  });

  it('flags forbidden phrases regardless of casing', () => {
    writeWorkflow(
      'news-bad-heartbeat.md',
      '# Title\nKeep-alive heartbeat via progressive safe output.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    // All three phrases surface in the report.
    expect(result.stderr.toLowerCase()).toContain('keep-alive');
    expect(result.stderr.toLowerCase()).toContain('heartbeat');
    expect(result.stderr.toLowerCase()).toContain('progressive safe output');
  });

  it('flags push_repo_memory references', () => {
    writeWorkflow(
      'news-bad-memory.md',
      '# Title\nsafeoutputs___push_repo_memory keeps the session alive.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('push_repo_memory');
  });

  it('exempts news-translate.md from every rule', () => {
    writeWorkflow(
      'news-translate.md',
      '# Title\n' +
        'Call safeoutputs___create_pull_request at min 2 as the checkpoint PR.\n' +
        'Then periodic keep-alive heartbeat via safeoutputs___push_repo_memory.\n' +
        'Final safeoutputs___create_pull_request at min 88.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(0);
  });
});
