// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = path.join(ROOT, 'scripts', 'prefetch-ep-feeds.sh');

// Sandbox: run the script with a private GITHUB_WORKSPACE so any analysis/
// output goes into a tmp dir, not the real repo tree.
let tmpRoot;

beforeAll(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'prefetch-ep-feeds-test-'));
  // resolve-analysis-dir.sh uses git rev-parse --show-toplevel. Make tmpRoot
  // a git repo so it resolves locally instead of using the real repo root.
  spawnSync('git', ['init', '-q'], { cwd: tmpRoot });
  spawnSync('git', ['commit', '--allow-empty', '-m', 'init', '-q'], {
    cwd: tmpRoot,
    env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' },
  });
  // resolve-analysis-dir.sh script must be present in the sandbox too.
  fs.mkdirSync(path.join(tmpRoot, 'scripts'), { recursive: true });
  fs.copyFileSync(
    path.join(ROOT, 'scripts', 'resolve-analysis-dir.sh'),
    path.join(tmpRoot, 'scripts', 'resolve-analysis-dir.sh'),
  );
  fs.chmodSync(path.join(tmpRoot, 'scripts', 'resolve-analysis-dir.sh'), 0o755);
});

afterAll(() => {
  if (tmpRoot && fs.existsSync(tmpRoot)) {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

function runPrefetch(args, extraEnv = {}) {
  // Use a local copy of the script so it resolves resolve-analysis-dir.sh
  // from the same dir (script uses $(dirname -- "$0")).
  const localScript = path.join(tmpRoot, 'scripts', 'prefetch-ep-feeds.sh');
  fs.copyFileSync(SCRIPT, localScript);
  fs.chmodSync(localScript, 0o755);
  return spawnSync('bash', [localScript, ...args], {
    cwd: tmpRoot,
    env: { ...process.env, ...extraEnv },
    encoding: 'utf8',
  });
}

describe('scripts/prefetch-ep-feeds.sh', () => {
  it('exits 2 on unknown feed name (fail-fast for workflow config bugs)', () => {
    const result = runPrefetch(['propositions', 'bogus-feed']);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('unknown feed name: bogus-feed');
  });

  it('exits 2 when called with fewer than 2 args', () => {
    const result = runPrefetch(['only-slug']);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('usage:');
  });

  it('writes canonical unavailable-envelope placeholder on fetch failure', () => {
    // Observe the placeholder contract by reading the script source.
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    expect(scriptSource).toContain('"status":"unavailable"');
    expect(scriptSource).toContain('"items":[]');
    expect(scriptSource).toContain('"itemCount":0');
    expect(scriptSource).toContain('"generatedAt"');
    expect(scriptSource).toContain('"feed":"');
    expect(scriptSource).toContain('"source":"prefetch-ep-feeds.sh"');
  });

  it('uses 120s timeout for events feed and 60s default for others', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    expect(scriptSource).toMatch(/TIMEOUT_EVENTS=120/);
    expect(scriptSource).toMatch(/TIMEOUT_DEFAULT=60/);
    expect(scriptSource).toMatch(/events\)\s*printf '%s' "\$TIMEOUT_EVENTS"/);
  });

  // ---------------------------------------------------------------------------
  // Retry / backoff policy tests (source-code drift guards)
  // ---------------------------------------------------------------------------

  it('implements retry with exponential-backoff delays (5s / 15s / 45s)', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    // The fetch_with_retry function must have the three delay values in order
    expect(scriptSource).toContain('1) delay=5');
    expect(scriptSource).toContain('2) delay=15');
    // Third delay (default case) must be 45
    expect(scriptSource).toContain('*) delay=45');
  });

  it('has fetch_with_retry function that loops up to 3 retries', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    expect(scriptSource).toContain('fetch_with_retry');
    // The loop condition checks attempt <= 3
    expect(scriptSource).toContain('"$attempt" -le 3');
  });

  it('implements EP API readiness probe before fetching feeds', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    // Should have an ep_api_probe function
    expect(scriptSource).toContain('ep_api_probe');
    // Probe uses HEAD request (--head flag)
    expect(scriptSource).toContain('--head');
    // Probe checks EP_API_REACHABLE before the per-feed curl
    expect(scriptSource).toContain('EP_API_REACHABLE');
  });

  it('exits 1 when all feeds fail and zero were successfully fetched', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    // There must be an exit 1 path when FETCHED -eq 0 and PLACEHOLDERS -gt 0
    expect(scriptSource).toContain('"$FETCHED" -eq 0');
    expect(scriptSource).toContain('"$PLACEHOLDERS" -gt 0');
    expect(scriptSource).toContain('exit 1');
  });

  it('uses case statement for backoff delays (shell-safety: no array indirect expansion)', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    // Must use case/esac for delay lookup
    expect(scriptSource).toMatch(/case "\$attempt" in/);
    // Must NOT use array lookup with ${delays[$attempt]} or similar
    expect(scriptSource).not.toMatch(/\$\{delays\[/);
    expect(scriptSource).not.toMatch(/\$\{DELAYS\[/);
  });
});
