// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Drift-guard for workflow timeout coverage and time-awareness wiring.
 *
 * What we enforce:
 *
 *   1. Every `news-*.md` agentic workflow declares `timeout-minutes: 60`
 *      at the top level (default). Explicit per-file exceptions are allowed
 *      via `TIMEOUTS_BY_FILE` but must be justified; the default is 60 min
 *      and the agent reasons about this cap throughout
 *      02-analysis-protocol.md. A drift to any other value silently breaks
 *      every per-family tripwire in that prompt.
 *
 *   2. Every non-news GitHub Actions workflow under `.github/workflows/`
 *      declares an explicit `timeout-minutes:` for each of its jobs. The
 *      GitHub default is 360 minutes (6 h), which is wasteful for the
 *      short-running utility workflows in this repo and lets transient
 *      network failures hold a runner indefinitely.
 *
 *   3. Every `news-*.md` agentic workflow declares a non-empty
 *      `concurrency.group` whenever it sets `cancel-in-progress: true`.
 *      GitHub Actions silently rejects `cancel-in-progress: true` without a
 *      `group:` — the workflow fails at startup with 0 jobs and no log
 *      output (see origin/main run #227 of news-translate.lock.yml on
 *      2026-05-20). Drift-guarding here prevents the next `gh aw compile`
 *      from re-introducing the same regression.
 *
 *   4. The reusable elapsed-time helper `scripts/gh-aw-workflow-elapsed.sh`
 *      exists and is executable. The shared news-unified-stages prompt
 *      (Stage A bash block) exports the `WORKFLOW_START_EPOCH` env var
 *      the helper consumes.
 *
 * If any assertion here fails, EITHER a workflow has regressed and must be
 * restored, OR the contract has intentionally evolved and this test +
 * `.github/prompts/02-analysis-protocol.md` § 3 must be updated together.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WORKFLOWS_DIR = path.join(REPO_ROOT, '.github', 'workflows');
const HELPER = path.join(REPO_ROOT, 'scripts', 'gh-aw-workflow-elapsed.sh');
const SHARED_UNIFIED_STAGES = path.join(
  WORKFLOWS_DIR,
  'shared',
  'prompts',
  'news-unified-stages.md',
);

// Extract the YAML frontmatter from a markdown file. Returns the parsed
// object, or null when no frontmatter is present.
function readFrontmatter(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---/m);
  if (!match) return null;
  return parseYaml(match[1]);
}

describe('agentic news workflows — timeout drift-guard', () => {
  const newsFiles = fs
    .readdirSync(WORKFLOWS_DIR)
    .filter((f) => /^news-.*\.md$/.test(f))
    .sort();

  // All news-*.md workflows share the same 60-min hard cap. Better time
  // management (start preparing to commit at 40 min) and root-cause fixes
  // for transient-API errors make the longer cap unnecessary.
  const TIMEOUTS_BY_FILE = new Map([
    // No exceptions — all workflows use DEFAULT_TIMEOUT (60 min).
  ]);
  const DEFAULT_TIMEOUT = 60;

  it('covers exactly 15 news workflows (14 unified article slugs + news-translate)', () => {
    // Exact count: catches both additions AND removals. If a new article
    // slug is added (e.g. news-quarter-in-review.md), update this assertion
    // together with src/config/article-horizons.ts and per-slug tripwire
    // tables in .github/prompts/02-analysis-protocol.md.
    expect(newsFiles.length).toBe(15);
  });

  for (const file of newsFiles) {
    const expected = TIMEOUTS_BY_FILE.get(file) ?? DEFAULT_TIMEOUT;
    it(`${file} declares timeout-minutes: ${expected}`, () => {
      const fm = readFrontmatter(path.join(WORKFLOWS_DIR, file));
      expect(fm, `${file} has no YAML frontmatter`).toBeTruthy();
      expect(
        fm['timeout-minutes'],
        `${file} must declare timeout-minutes: ${expected} (agent reasons about a ${expected}-min cap)`,
      ).toBe(expected);
    });

    it(`${file} declares concurrency.group (cancel-in-progress requires group, else GitHub rejects the workflow at startup)`, () => {
      // Regression: on 2026-05-20 origin/main run #227 of news-translate.lock.yml
      // failed at startup with 0 jobs because the recompiled lock file had
      // `concurrency: { cancel-in-progress: true }` WITHOUT a `group:` key.
      // GitHub Actions rejects this configuration silently — the workflow
      // never starts and no failed-job logs are produced. Every news-*.md
      // workflow must therefore declare BOTH `group:` AND `cancel-in-progress`
      // so the compiled lock file is accepted by GitHub.
      const fm = readFrontmatter(path.join(WORKFLOWS_DIR, file));
      expect(fm, `${file} has no YAML frontmatter`).toBeTruthy();
      expect(
        fm.concurrency,
        `${file} must declare a concurrency block`,
      ).toBeTruthy();
      expect(
        fm.concurrency.group,
        `${file} concurrency block must include "group:" — cancel-in-progress without group is rejected by GitHub Actions at startup`,
      ).toBeTruthy();
      expect(
        typeof fm.concurrency.group,
        `${file} concurrency.group must be a string`,
      ).toBe('string');
      expect(
        fm.concurrency.group.length,
        `${file} concurrency.group must be non-empty`,
      ).toBeGreaterThan(0);
    });
  }
});

describe('non-news workflows — explicit timeout drift-guard', () => {
  // `agentics-maintenance.yml` is autogenerated by gh-aw (header marker:
  // "automatically generated by pkg/workflow/maintenance_workflow.go").
  // Manual edits are overwritten on the next `gh aw compile`. The 8 jobs
  // there that lack timeout-minutes are a known upstream gap and must be
  // fixed in the gh-aw generator template, not here.
  const AUTOGENERATED_BY_GH_AW = new Set(['agentics-maintenance.yml']);

  const yamlFiles = fs
    .readdirSync(WORKFLOWS_DIR)
    .filter((f) => /\.ya?ml$/.test(f) && !f.endsWith('.lock.yml'))
    .filter((f) => !AUTOGENERATED_BY_GH_AW.has(f))
    .sort();

  for (const file of yamlFiles) {
    it(`${file} declares timeout-minutes on every job`, () => {
      const filePath = path.join(WORKFLOWS_DIR, file);
      const doc = parseYaml(fs.readFileSync(filePath, 'utf8'));
      const jobs = doc && doc.jobs ? Object.entries(doc.jobs) : [];
      expect(jobs.length, `${file} has no jobs to check`).toBeGreaterThan(0);
      for (const [name, job] of jobs) {
        expect(
          job && job['timeout-minutes'],
          `${file} job "${name}" must declare an explicit timeout-minutes (GitHub default is 360 min; explicit caps bound runaway runs)`,
        ).toBeTruthy();
        expect(
          typeof job['timeout-minutes'],
          `${file} job "${name}" timeout-minutes must be a number`,
        ).toBe('number');
      }
    });
  }
});

describe('elapsed-time helper wiring', () => {
  it('scripts/gh-aw-workflow-elapsed.sh exists and is executable', () => {
    expect(fs.existsSync(HELPER), 'helper script missing').toBe(true);
    const stat = fs.statSync(HELPER);
    // owner-executable bit
    expect((stat.mode & 0o100) !== 0).toBe(true);
  });

  it('exposes the three documented modes', () => {
    const body = fs.readFileSync(HELPER, 'utf8');
    expect(body).toMatch(/MODE="?env"?\s/);
    expect(body).toMatch(/status\)/);
    expect(body).toMatch(/guard\)/);
  });

  it('Stage A shared prompt exports WORKFLOW_START_EPOCH the helper reads', () => {
    const body = fs.readFileSync(SHARED_UNIFIED_STAGES, 'utf8');
    expect(body).toContain('WORKFLOW_START_EPOCH=$RUN_EPOCH');
    expect(body).toContain('echo "WORKFLOW_START_EPOCH=$WORKFLOW_START_EPOCH"');
  });
});
