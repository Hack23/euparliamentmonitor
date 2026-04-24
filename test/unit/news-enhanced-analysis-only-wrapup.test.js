// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Regression test for failed run
 * https://github.com/Hack23/euparliamentmonitor/actions/runs/24802174815
 *
 * When a split-family analysis workflow (`news-<type>-analysis.md`) finishes
 * Stages A + B + C and invokes the `--analysis-only` pipeline wrap-up against
 * a pre-resolved analysis directory, `news-enhanced.ts` must NOT re-fetch EP
 * feed data. The agent has already authored every artifact; the wrap-up is a
 * pure discovery + `manifest.json.history[]` merge.
 *
 * Re-fetching EP data in that path can hang the wrap-up long enough for the
 * safeoutputs MCP session to expire (~5 min keepalive), which then blocks
 * `create_pull_request` with `Streamable HTTP error: session not found` —
 * exactly the failure mode observed in the linked run.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const CLI = path.join(REPO_ROOT, 'scripts', 'generators', 'news-enhanced.js');

let tempBase;
let resolvedRunDir;

beforeEach(() => {
  tempBase = fs.mkdtempSync(path.join(os.tmpdir(), 'analysis-only-wrapup-'));
  // Simulate the stable same-day folder an agent hands to the wrap-up:
  // `analysis/daily/${DATE}/${TYPE}` with a Stage-B-authored manifest.json
  // and at least one canonical artifact subdir.
  resolvedRunDir = path.join(tempBase, 'analysis', 'daily', '2026-04-22', 'committee-reports');
  fs.mkdirSync(path.join(resolvedRunDir, 'intelligence'), { recursive: true });
  fs.writeFileSync(
    path.join(resolvedRunDir, 'intelligence', 'synthesis-summary.md'),
    '# Synthesis Summary\n\nAgent-authored artifact for wrap-up regression guard.\n'
  );
  fs.writeFileSync(
    path.join(resolvedRunDir, 'manifest.json'),
    JSON.stringify(
      {
        runId: 'committee-reports-run-pretest',
        date: '2026-04-22',
        articleType: 'committee-reports',
        methods: [
          {
            method: 'synthesis-summary',
            status: 'completed',
            outputFile: 'intelligence/synthesis-summary.md',
          },
        ],
        history: [
          {
            runId: 'committee-reports-run-pretest',
            gateResult: 'GREEN',
            startedAt: '2026-04-22T20:00:00Z',
            finishedAt: '2026-04-22T20:55:00Z',
          },
        ],
      },
      null,
      2
    )
  );
});

afterEach(() => {
  fs.rmSync(tempBase, { recursive: true, force: true });
});

describe('news-enhanced --analysis-only wrap-up on pre-resolved dir', () => {
  it('skips EP data fetch and completes without substantive-data error', () => {
    // Run the CLI with:
    //  - `--analysis-only` (wrap-up mode)
    //  - `--analysis-dir` pointing at the pre-resolved per-run folder
    //  - USE_EP_MCP=false so initializeMCPClient returns null immediately
    //    (matches the wrap-up env when EP MCP is unreachable or slow)
    const result = spawnSync(
      process.execPath,
      [
        CLI,
        '--types=committee-reports',
        '--analysis',
        '--analysis-methods=all',
        `--analysis-dir=${resolvedRunDir}`,
        '--analysis-only',
        '--run-id=committee-reports-run-wrapup-test',
      ],
      {
        cwd: REPO_ROOT,
        encoding: 'utf-8',
        env: {
          ...process.env,
          USE_EP_MCP: 'false',
          // Explicitly unset feed-data file so the test never picks up a
          // stray fixture via `EP_FEED_DATA_FILE`.
          EP_FEED_DATA_FILE: '',
        },
        timeout: 30_000,
      }
    );

    const combined = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
    // The CLI must complete successfully: no "substantive EP data" abort.
    expect(combined).not.toMatch(/no substantive EP data was fetched/u);
    expect(combined).not.toMatch(/Analysis aborted/u);
    // And the new short-circuit log line must be present.
    expect(combined).toMatch(/Skipping EP data fetch.*--analysis-only wrap-up/u);
    // And the process must have exited successfully.
    expect(result.status).toBe(0);
  });

  // Regression: the wrap-up used to append gateResult:'PENDING' even when the
  // existing manifest already had a GREEN stage-c entry, causing the paired
  // article workflow to exit as a no-op. The carry-forward fix in
  // runAnalysisStage must preserve GREEN through the wrap-up.
  it('carry-forward: wrap-up without --gate-result preserves GREEN from existing manifest', () => {
    // Manifest already has a GREEN stage-c entry (written by the AI).
    const manifestPath = path.join(resolvedRunDir, 'manifest.json');
    const initial = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    // Ensure our pre-written history entry shows GREEN.
    expect(initial.history[0].gateResult).toBe('GREEN');

    const result = spawnSync(
      process.execPath,
      [
        CLI,
        '--types=committee-reports',
        '--analysis',
        '--analysis-methods=all',
        `--analysis-dir=${resolvedRunDir}`,
        '--analysis-only',
        '--run-id=carry-forward-test',
        // No --gate-result flag: the code must carry forward GREEN from manifest.
      ],
      {
        cwd: REPO_ROOT,
        encoding: 'utf-8',
        env: { ...process.env, USE_EP_MCP: 'false', EP_FEED_DATA_FILE: '' },
        timeout: 30_000,
      }
    );

    expect(result.status).toBe(0);

    // The new history entry appended by the wrap-up must carry GREEN forward.
    const updated = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const wrapupEntry = updated.history.find((e) => e.runId === 'carry-forward-test');
    expect(wrapupEntry).toBeDefined();
    expect(wrapupEntry.gateResult).toBe('GREEN');
  });

  // Explicit --gate-result=GREEN forwarded from CLI must be recorded verbatim.
  it('--gate-result=GREEN is recorded in the manifest history entry', () => {
    const manifestPath = path.join(resolvedRunDir, 'manifest.json');

    const result = spawnSync(
      process.execPath,
      [
        CLI,
        '--types=committee-reports',
        '--analysis',
        '--analysis-methods=all',
        `--analysis-dir=${resolvedRunDir}`,
        '--analysis-only',
        '--gate-result=GREEN',
        '--run-id=explicit-green-test',
      ],
      {
        cwd: REPO_ROOT,
        encoding: 'utf-8',
        env: { ...process.env, USE_EP_MCP: 'false', EP_FEED_DATA_FILE: '' },
        timeout: 30_000,
      }
    );

    expect(result.status).toBe(0);

    const updated = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const entry = updated.history.find((e) => e.runId === 'explicit-green-test');
    expect(entry).toBeDefined();
    expect(entry.gateResult).toBe('GREEN');
  });

  // Explicit --gate-result=ANALYSIS_ONLY must be recorded verbatim so the
  // paired article workflow can correctly exit noop on merge.
  it('--gate-result=ANALYSIS_ONLY is recorded in the manifest history entry', () => {
    const manifestPath = path.join(resolvedRunDir, 'manifest.json');

    const result = spawnSync(
      process.execPath,
      [
        CLI,
        '--types=committee-reports',
        '--analysis',
        '--analysis-methods=all',
        `--analysis-dir=${resolvedRunDir}`,
        '--analysis-only',
        '--gate-result=ANALYSIS_ONLY',
        '--run-id=explicit-ao-test',
      ],
      {
        cwd: REPO_ROOT,
        encoding: 'utf-8',
        env: { ...process.env, USE_EP_MCP: 'false', EP_FEED_DATA_FILE: '' },
        timeout: 30_000,
      }
    );

    expect(result.status).toBe(0);

    const updated = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const entry = updated.history.find((e) => e.runId === 'explicit-ao-test');
    expect(entry).toBeDefined();
    expect(entry.gateResult).toBe('ANALYSIS_ONLY');
  });
});
