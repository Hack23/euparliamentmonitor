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

  // Regression: PR #1902 succeeded but PR #1903 was created anyway because the
  // post-step gh-aw-capture-agent-patch.sh wrote /tmp/gh-aw/aw-agent-recovery.patch
  // and the recovery-patch trigger fired despite safe_outputs reporting success.
  // The downstream branch-pattern API check missed the bundle PR (salt-format
  // drift), so the fallback ran and double-published. The primary authoritative
  // guard now short-circuits the fallback when GH_AW_SAFE_OUTPUTS_RESULT=success.
  it('skips fallback when safe_outputs reported success, even if a recovery patch is present', () => {
    fs.writeFileSync(path.join(ghAwDir, 'aw-agent-recovery.patch'), 'diff --git a/x b/x\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'success',
      // When safe_outputs really succeeded the bundle path published a PR
      // and gh-aw populates created_pr_number. Required to keep this test
      // exercising the original duplicate-PR guard (PR #1902/#1903) rather
      // than the new silent-push-failure trigger.
      GH_AW_CREATED_PR_NUMBER: '1902',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('safe_outputs job reported success; fallback skipped');
  });

  it('skips fallback when safe_outputs reported success, even if a gh-aw safeoutputs patch artifact is present', () => {
    fs.writeFileSync(path.join(ghAwDir, 'aw-create-pull-request.patch'), 'diff --git a/x b/x\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'success',
      GH_AW_CREATED_PR_NUMBER: '1902',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('safe_outputs job reported success; fallback skipped');
  });

  it('skips fallback when safe_outputs reported success, even if a bundle artifact is present', () => {
    fs.writeFileSync(path.join(ghAwDir, 'aw-news-run.bundle'), 'bundle-placeholder\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'success',
      GH_AW_CREATED_PR_NUMBER: '1902',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('safe_outputs job reported success; fallback skipped');
  });

  it('bounds the embedded diffstat and guards the PR body length against GitHub\'s 65536-char limit', () => {
    // Regression guard for run #26633661094 (news-translate 2026-05-29): a
    // crash-recovery patch rescued 2083 files, so the full `git diff --stat`
    // embedded in the PR body exceeded GitHub's 65536-character limit and
    // `gh pr create` failed with "Body is too long (maximum is 65536
    // characters)". The script must (a) bound the embedded diffstat to a
    // capped width + line count, and (b) defensively truncate the assembled
    // PR body on a byte budget below 65536 before calling the gh API.
    const script = fs.readFileSync(SCRIPT, 'utf8');
    // (a) bounded diffstat: width-capped and line-capped.
    expect(script).toMatch(/git diff --cached --stat=\d+,\d+/);
    expect(script).toMatch(/STAT_MAX_LINES=\d+/);
    expect(script).toMatch(/more files omitted/);
    // (b) body-size guard applied to the same body file used by gh pr create/edit.
    expect(script).toMatch(/BODY_MAX_BYTES=\d+/);
    expect(script).toMatch(/wc -c "\$body_file"/);
    expect(script).toMatch(/head -c "\$BODY_MAX_BYTES" "\$body_file"/);
    // The byte budget must stay safely below GitHub's 65536-character ceiling.
    const budgetMatch = script.match(/BODY_MAX_BYTES=(\d+)/);
    expect(budgetMatch).not.toBeNull();
    expect(Number(budgetMatch[1])).toBeLessThan(65536);
  });

  it('is translate-aware: news-translate slug "translate-briefs" appears in the script body with the expected branch + analysis_dir', () => {
    // Regression guard for run #26005838669: the news-translate workflow
    // now imports shared/config/news-pat-pr-fallback.md, which routes
    // through this script with slug=translate-briefs. The script must
    // produce branch=news/translate-briefs-<date> (matching the
    // news-translate.md branch contract) and analysis_dir=
    // analysis/translation-runs/<date> (since news-translate has no
    // per-slug analysis/daily directory). It must also treat
    // analysis/translation-runs/* as an eligible path.
    const script = fs.readFileSync(SCRIPT, 'utf8');
    expect(script).toMatch(/translate-briefs\|translate\)/);
    expect(script).toMatch(/branch="news\/translate-briefs-\$today"/);
    expect(script).toMatch(/analysis_dir="analysis\/translation-runs\/\$today"/);
    expect(script).toMatch(
      /analysis\/daily\/\*\|news\/\*\|analysis\/translation-runs\/\*/,
    );
  });

  // Regression: PR #2290 shipped 87 unrelated HTML files because the
  // translate-briefs PAT fallback staged every dirty `news/*` file —
  // including pre-existing HTML files whose meta descriptions changed
  // after `npm run build` recompiled the SEO resolver. The translate
  // workflow never produces HTML, so news/*.html must be disallowed.
  it('excludes news/*.html from eligible files when slug is translate-briefs', () => {
    const script = fs.readFileSync(SCRIPT, 'utf8');
    // The script must contain a translate-specific HTML exclusion guard
    // that routes news/*.html and news/**/*.html to $disallowed_changed.
    expect(script).toMatch(/is_translate_slug.*true/);
    expect(script).toMatch(/news\/\*\.html\|news\/\*\*\/\*\.html/);
    expect(script).toMatch(/disallowed_changed/);
  });

  // Regression: run #26015261142 (news-committee-reports 2026-05-18) — the
  // safe_outputs job reported job-level success because creating the
  // fallback review issue succeeded, but its internal create_pull_request
  // git push failed (GraphQL signed push: "Resource not accessible by
  // integration"; subsequent `git push origin` exited 1). The PAT fallback
  // skipped because GH_AW_SAFE_OUTPUTS_RESULT=success, leaving the analysis
  // artifacts and 14 rendered news HTMLs unpublished. gh-aw now also
  // surfaces a code_push_failure_count job output that is wired into this
  // step as GH_AW_CODE_PUSH_FAILURE_COUNT — when > 0 the success short-
  // circuit must NOT trigger, and the fallback must proceed.
  it('proceeds when safe_outputs reported success but code_push_failure_count > 0 (push fell back to review issue)', () => {
    fs.writeFileSync(path.join(ghAwDir, 'aw-news-2026-05-18-committee-reports-run262.bundle'), 'bundle-placeholder\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'success',
      GH_AW_CODE_PUSH_FAILURE_COUNT: '1',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).not.toContain('safe_outputs job reported success; fallback skipped');
    expect(result.stdout).toContain('code_push_failure_count=1');
    // It must reach token resolution (proving it did not early-exit on the
    // success guard) and stop there because the test harness provides no PAT.
    expect(result.stdout).toContain('no fallback token available; fallback skipped');
  });

  it('proceeds when safe_outputs reported success but code_push_failure_count > 0 with only a safeoutputs patch', () => {
    fs.writeFileSync(path.join(ghAwDir, 'aw-create-pull-request.patch'), 'diff --git a/x b/x\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'success',
      GH_AW_CODE_PUSH_FAILURE_COUNT: '2',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).not.toContain('safe_outputs job reported success; fallback skipped');
    expect(result.stdout).toContain('code_push_failure_count=2');
    expect(result.stdout).toContain('no fallback token available; fallback skipped');
  });

  it('treats non-numeric code_push_failure_count as 0 (defensive parse)', () => {
    fs.writeFileSync(path.join(ghAwDir, 'aw-agent-recovery.patch'), 'diff --git a/x b/x\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'success',
      GH_AW_CODE_PUSH_FAILURE_COUNT: 'not-a-number',
      // Populate created_pr_number so the new silent-push-failure trigger
      // does not fire — this test exercises only the non-numeric count
      // parser, not the silent-failure path.
      GH_AW_CREATED_PR_NUMBER: '1902',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('safe_outputs job reported success; fallback skipped');
  });

  // Regression: runs #26019545674 (motions 2026-05-18) and #26017383773
  // (propositions 2026-05-18) — both runs had safe_outputs report job-level
  // success because creating the fallback review issue succeeded, but the
  // internal create_pull_request git push failed (GraphQL signed push:
  // "Resource not accessible by integration"; `git push origin` exited 1).
  // Unlike run #26015261142, gh-aw did NOT increment code_push_failure_count
  // (it treats the successful issue-fallback as a non-failure for counting),
  // so the count remained at 0 and the script took the success short-circuit.
  // The reliable signal is gh-aw's `created_pr_number` job output (wired here
  // as GH_AW_CREATED_PR_NUMBER): empty when the bundle push fell back to an
  // issue, populated when an actual PR was created. When success + count=0 +
  // empty created_pr_number + a bundle/patch artifact is on disk, the script
  // must NOT short-circuit and must proceed with the fallback.
  it('proceeds when safe_outputs reported success with empty created_pr_number and a bundle artifact (silent push failure)', () => {
    fs.writeFileSync(path.join(ghAwDir, 'aw-news-2026-05-18-motions-run261.bundle'), 'bundle-placeholder\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'success',
      GH_AW_CODE_PUSH_FAILURE_COUNT: '0',
      GH_AW_CREATED_PR_NUMBER: '',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).not.toContain('safe_outputs job reported success; fallback skipped');
    expect(result.stdout).toContain('silent bundle push failure');
    // Must reach token resolution, proving it did not early-exit on the
    // success guard. The harness provides no PAT so it stops there.
    expect(result.stdout).toContain('no fallback token available; fallback skipped');
  });

  it('proceeds when safe_outputs reported success with empty created_pr_number and a safeoutputs patch (silent push failure)', () => {
    fs.writeFileSync(path.join(ghAwDir, 'aw-create-pull-request.patch'), 'diff --git a/x b/x\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'success',
      GH_AW_CODE_PUSH_FAILURE_COUNT: '0',
      GH_AW_CREATED_PR_NUMBER: '',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).not.toContain('safe_outputs job reported success; fallback skipped');
    expect(result.stdout).toContain('silent bundle push failure');
    expect(result.stdout).toContain('no fallback token available; fallback skipped');
  });

  it('proceeds when safe_outputs reported success with empty created_pr_number and only a recovery patch (silent push failure)', () => {
    // Bundle/patch artifacts may be cleaned up before the fallback step runs;
    // the recovery patch captured by gh-aw-capture-agent-patch.sh is the
    // last-resort signal that the agent did produce work.
    fs.writeFileSync(path.join(ghAwDir, 'aw-agent-recovery.patch'), 'diff --git a/x b/x\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'success',
      GH_AW_CODE_PUSH_FAILURE_COUNT: '0',
      GH_AW_CREATED_PR_NUMBER: '',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).not.toContain('safe_outputs job reported success; fallback skipped');
    expect(result.stdout).toContain('silent bundle push failure');
    expect(result.stdout).toContain('no fallback token available; fallback skipped');
  });

  it('skips fallback when safe_outputs reported success with a populated created_pr_number (real PR created)', () => {
    // Sanity check: when created_pr_number is non-empty the bundle path did
    // publish a PR, so the fallback MUST short-circuit even if a bundle/patch
    // artifact happens to be on disk.
    fs.writeFileSync(path.join(ghAwDir, 'aw-news-2026-05-18-motions-run261.bundle'), 'bundle-placeholder\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'success',
      GH_AW_CODE_PUSH_FAILURE_COUNT: '0',
      GH_AW_CREATED_PR_NUMBER: '1934',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('safe_outputs job reported success; fallback skipped');
  });

  it('treats whitespace-only created_pr_number as empty (defensive parse)', () => {
    // GitHub Actions can render numeric outputs with leading/trailing
    // whitespace when the safe_outputs step uses core.setOutput. The script
    // must normalize this so a numerically-empty value triggers the
    // silent-push-failure path rather than skipping by accident.
    fs.writeFileSync(path.join(ghAwDir, 'aw-create-pull-request.patch'), 'diff --git a/x b/x\n');

    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'success',
      GH_AW_CODE_PUSH_FAILURE_COUNT: '0',
      GH_AW_CREATED_PR_NUMBER: '   \t\n',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).not.toContain('safe_outputs job reported success; fallback skipped');
    expect(result.stdout).toContain('silent bundle push failure');
  });

  it('still short-circuits on success when no safeoutputs/recovery artifact is on disk and created_pr_number is empty', () => {
    // Defensive: when there's no artifact to recover from, an empty
    // created_pr_number is most likely a workflow that never produced a PR
    // intentionally (e.g. detection skipped). Don't trigger the silent-push
    // path in that case — keep the standard success short-circuit.
    const result = runFallback(ghAwDir, {
      GH_AW_SAFE_OUTPUTS_RESULT: 'success',
      GH_AW_CODE_PUSH_FAILURE_COUNT: '0',
      GH_AW_CREATED_PR_NUMBER: '',
    });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('safe_outputs job reported success; fallback skipped');
  });
});
