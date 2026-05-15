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

  it('declares MAX_RETRIES=2 for 3 total attempts with backoff delays', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    expect(scriptSource).toMatch(/MAX_RETRIES=2/);
    expect(scriptSource).toMatch(/RETRY_DELAY_1=5/);
    expect(scriptSource).toMatch(/RETRY_DELAY_2=15/);
    expect(scriptSource).toMatch(/RETRY_DELAY_3=45/);
  });

  it('writes prefetch-status.json after the feed loop', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    expect(scriptSource).toContain('prefetch-status.json');
    expect(scriptSource).toContain('"prefetchMode"');
    expect(scriptSource).toContain('"fetched"');
    expect(scriptSource).toContain('"placeholders"');
    expect(scriptSource).toContain('"source":"prefetch-ep-feeds.sh"');
  });

  it('sets PREFETCH_DATA_MODE=green when all feeds succeed', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    expect(scriptSource).toContain('PREFETCH_DATA_MODE="green"');
  });

  it('sets PREFETCH_DATA_MODE=degraded-feeds when some feeds fail', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    expect(scriptSource).toContain('PREFETCH_DATA_MODE="degraded-feeds"');
  });

  it('sets PREFETCH_DATA_MODE=minimal when all feeds fail', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    expect(scriptSource).toContain('PREFETCH_DATA_MODE="minimal"');
  });

  it('exports PREFETCH_DATA_MODE to GITHUB_ENV', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    expect(scriptSource).toContain('PREFETCH_DATA_MODE=${PREFETCH_DATA_MODE}');
  });

  it('prints a loud DEGRADED message to stderr when all retries exhausted', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    expect(scriptSource).toContain('DEGRADED:');
    // Message must go to stderr (>&2)
    expect(scriptSource).toMatch(/DEGRADED:[^`\n]*>&2/);
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
    // The probe must be advisory only (warning on failure, but proceeds
    // with per-feed retries). A previous revision skipped all per-feed
    // fetches on a failed probe, which conflated 405 with API down.
    expect(scriptSource).toMatch(/advisory/i);
  });

  it('exits 0 with placeholders when all feeds fail (recovery contract preserved)', () => {
    // Executable test: force the EP API to be unreachable by overriding the
    // host resolution via a non-routable proxy URL. We can't trivially
    // override DNS, so instead we patch the script's EP_API constant via
    // a local copy and run it. The script must:
    //   1. exit 0 (agent must still start)
    //   2. write `status:"unavailable"` placeholder for every requested feed
    //   3. print a warning "All N feed(s) failed" to stderr
    //   4. export ANALYSIS_DIR to GITHUB_ENV (when set)
    const localScript = path.join(tmpRoot, 'scripts', 'prefetch-ep-feeds.sh');
    fs.copyFileSync(SCRIPT, localScript);
    let source = fs.readFileSync(localScript, 'utf8');
    // Redirect EP API to a guaranteed-unreachable, immediately-rejecting
    // endpoint and shrink curl timeouts so the test runs fast.
    source = source.replace(
      'EP_API="https://data.europarl.europa.eu/api/v2"',
      'EP_API="http://127.0.0.1:1/api/v2"',
    );
    source = source.replace('TIMEOUT_EVENTS=120', 'TIMEOUT_EVENTS=1');
    source = source.replace('TIMEOUT_DEFAULT=60', 'TIMEOUT_DEFAULT=1');
    // Collapse retry waits so 3 retries finish in ~0s rather than ~65s.
    source = source.replace('1) delay=5', '1) delay=0');
    source = source.replace('2) delay=15', '2) delay=0');
    source = source.replace('*) delay=45', '*) delay=0');
    fs.writeFileSync(localScript, source);
    fs.chmodSync(localScript, 0o755);

    const ghEnv = path.join(tmpRoot, 'github-env');
    fs.writeFileSync(ghEnv, '');

    // Strip GITHUB_WORKSPACE so resolve-analysis-dir.sh uses the sandbox.
    const sandboxEnv = { ...process.env, GITHUB_ENV: ghEnv };
    delete sandboxEnv.GITHUB_WORKSPACE;

    const result = spawnSync('bash', [localScript, 'breaking', 'meps', 'documents'], {
      cwd: tmpRoot,
      env: sandboxEnv,
      encoding: 'utf8',
      timeout: 60_000,
    });

    // Must exit 0 — the workflow recovery contract requires the agent to
    // start even when every feed fails (downstream uses MCP or prior-run data).
    expect(result.status, `stderr was: ${result.stderr}`).toBe(0);
    expect(result.stderr).toMatch(/All 2 feed\(s\) failed/);

    // Placeholder files must exist with status:"unavailable"
    const dataDir = path.join(tmpRoot, 'analysis', 'daily');
    const dayDirs = fs.readdirSync(dataDir);
    expect(dayDirs.length).toBeGreaterThan(0);
    const slugDir = path.join(dataDir, dayDirs[0], 'breaking', 'data');
    const mepsFile = path.join(slugDir, 'meps-feed.json');
    expect(fs.existsSync(mepsFile)).toBe(true);
    const mepsPayload = JSON.parse(fs.readFileSync(mepsFile, 'utf8'));
    expect(mepsPayload.status).toBe('unavailable');
    expect(mepsPayload.source).toBe('prefetch-ep-feeds.sh');
    expect(mepsPayload.feed).toBe('meps');

    // GITHUB_ENV must contain ANALYSIS_DIR
    const envContent = fs.readFileSync(ghEnv, 'utf8');
    expect(envContent).toMatch(/^ANALYSIS_DIR=/m);
  }, 90_000);

  it('does NOT exit non-zero on all-fail (drift guard against blocking exit-1)', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    // The all-fail branch must NOT contain `exit 1`. Drift guard against
    // reintroducing the blocking exit that conflicts with the no-continue-on-error
    // workflow contract (see test/unit/agentic-workflows-threat-detection.test.js).
    const allFailBlock = scriptSource.match(
      /"\$FETCHED" -eq 0 \] && \[ "\$PLACEHOLDERS" -gt 0[\s\S]+?fi/,
    );
    expect(allFailBlock, 'all-fail branch missing').not.toBeNull();
    expect(allFailBlock[0]).not.toMatch(/\bexit 1\b/);
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
