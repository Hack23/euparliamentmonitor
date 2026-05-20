// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Behavior tests for scripts/gh-aw-workflow-elapsed.sh.
 *
 * The helper is consumed by every 60-min news-* agentic workflow to compute
 * elapsed/remaining minutes and to guard slow operations against the per-slug
 * Stage C exit tripwire. A regression in this script silently breaks the
 * "always create a safe-output PR" contract by letting Stage C runs cross
 * the PR-call deadline without forcing GATE_RESULT=ANALYSIS_ONLY.
 *
 * Drift-guard layer above this: news-workflows-time-awareness.test.js
 * (asserts the file exists, is executable, and exposes all three modes).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HELPER = path.join(REPO_ROOT, 'scripts', 'gh-aw-workflow-elapsed.sh');

// Per-test isolated state file — the helper caches the fallback start epoch
// here, and stale values from previous test runs cause order-dependent
// failures in the "no start epoch provided" case.
let stateFile;
beforeEach(() => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gh-aw-elapsed-'));
  stateFile = path.join(dir, 'start-epoch');
});

function run(args, extraEnv = {}) {
  const env = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    GH_AW_WORKFLOW_START_FILE: stateFile,
    ...extraEnv,
  };
  try {
    return {
      exitCode: 0,
      stdout: execFileSync('bash', [HELPER, ...args], { env, encoding: 'utf8' }),
      stderr: '',
    };
  } catch (err) {
    return {
      exitCode: err.status ?? 1,
      stdout: err.stdout?.toString('utf8') ?? '',
      stderr: err.stderr?.toString('utf8') ?? '',
    };
  }
}

const NOW = Math.floor(Date.now() / 1000);

describe('gh-aw-workflow-elapsed.sh — env mode', () => {
  it('emits three named numeric assignments when start epoch is known', () => {
    const r = run([], { WORKFLOW_START_EPOCH: String(NOW - 90) });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toMatch(/^ELAPSED_MIN=\d+$/m);
    expect(r.stdout).toMatch(/^REMAINING_MIN=\d+$/m);
    expect(r.stdout).toMatch(/^WORKFLOW_TIMEOUT_MIN=60$/m);
  });

  it('clamps remaining to 0 when the run is already over the cap', () => {
    const r = run([], { WORKFLOW_START_EPOCH: String(NOW - 60 * 90) }); // 90 min ago
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toMatch(/^REMAINING_MIN=0$/m);
  });

  it('honors WORKFLOW_TIMEOUT_MIN override', () => {
    const r = run([], {
      WORKFLOW_START_EPOCH: String(NOW - 60),
      WORKFLOW_TIMEOUT_MIN: '30',
    });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toMatch(/^WORKFLOW_TIMEOUT_MIN=30$/m);
  });

  it('falls back to a safe lower bound when no start epoch is provided', () => {
    const r = run([], { WORKFLOW_START_EPOCH: '' });
    expect(r.exitCode).toBe(0);
    // First call: elapsed must be 0 (just initialized).
    expect(r.stdout).toMatch(/^ELAPSED_MIN=0$/m);
  });

  it('treats non-numeric WORKFLOW_START_EPOCH as missing (no crash)', () => {
    const r = run([], { WORKFLOW_START_EPOCH: 'not-a-number' });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toMatch(/^ELAPSED_MIN=0$/m);
  });
});

describe('gh-aw-workflow-elapsed.sh — status mode', () => {
  it('emits a single TIME_STATUS log line without a tripwire', () => {
    const r = run(['status', '--stage', 'B1'], {
      WORKFLOW_START_EPOCH: String(NOW - 600),
    });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toMatch(
      /^TIME_STATUS: elapsed=\d+m remaining=\d+m timeout=60m stage=B1$/m,
    );
  });

  it('includes tripwire and budget when --tripwire is given', () => {
    const r = run(['status', '--stage', 'C', '--tripwire', '36', '--name', 'stage-c-exit'], {
      WORKFLOW_START_EPOCH: String(NOW - 30 * 60),
    });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toMatch(
      /TIME_STATUS: elapsed=30m remaining=30m timeout=60m stage=C tripwire=stage-c-exit:36m budget=6m/,
    );
  });

  it('reports a negative budget when the tripwire is crossed (informational)', () => {
    const r = run(['status', '--stage', 'C', '--tripwire', '36', '--name', 'stage-c-exit'], {
      WORKFLOW_START_EPOCH: String(NOW - 45 * 60),
    });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toMatch(/budget=-?9m/);
  });
});

describe('gh-aw-workflow-elapsed.sh — guard mode', () => {
  it('exits 0 when the tripwire has not been crossed', () => {
    const r = run(['guard', '--tripwire', '36', '--name', 'stage-c-exit'], {
      WORKFLOW_START_EPOCH: String(NOW - 10 * 60),
    });
    expect(r.exitCode).toBe(0);
  });

  it('exits 1 with a TIME_TRIPWIRE_CROSSED log line when crossed', () => {
    const r = run(['guard', '--tripwire', '36', '--name', 'stage-c-exit'], {
      WORKFLOW_START_EPOCH: String(NOW - 46 * 60),
    });
    expect(r.exitCode).toBe(1);
    expect(r.stderr).toMatch(/TIME_TRIPWIRE_CROSSED: stage-c-exit/);
    expect(r.stderr).toMatch(/elapsed=46m tripwire=36m/);
  });

  it('exits 2 when --tripwire is missing (caller usage error)', () => {
    const r = run(['guard'], { WORKFLOW_START_EPOCH: String(NOW) });
    expect(r.exitCode).toBe(2);
    expect(r.stderr).toMatch(/guard mode requires --tripwire/);
  });

  it('exits 2 when --tripwire is non-numeric', () => {
    const r = run(['guard', '--tripwire', 'oops'], { WORKFLOW_START_EPOCH: String(NOW) });
    expect(r.exitCode).toBe(2);
  });

  it('exits 1 exactly at the tripwire boundary (>= semantics)', () => {
    const r = run(['guard', '--tripwire', '5', '--name', 'edge'], {
      WORKFLOW_START_EPOCH: String(NOW - 5 * 60),
    });
    expect(r.exitCode).toBe(1);
  });
});

describe('gh-aw-workflow-elapsed.sh — shell-safety', () => {
  it('uses no forbidden bash patterns (nested expansions, eval, $(cmd <file))', () => {
    const body = fs.readFileSync(HELPER, 'utf8');
    // Mirror the patterns from test/unit/workflow-shell-safety.test.js.
    expect(body).not.toMatch(/\$\{!\w+/); // indirect expansion
    expect(body).not.toMatch(/@P\}|@Q\}|@E\}|@A\}|@K\}|@a\}/); // transformations
    expect(body).not.toMatch(/^[^#]*\beval\b/m); // eval (skip comment lines)
    expect(body).not.toMatch(/\$\(\s*[a-z]+\s+<\s/); // $(cmd <file)
  });
});
