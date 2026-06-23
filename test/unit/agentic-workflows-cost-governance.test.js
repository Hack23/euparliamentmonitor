// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WORKFLOWS_DIR = path.join(ROOT, '.github', 'workflows');

/**
 * Returns the YAML frontmatter block (between the first two `---` fences) of an
 * agentic workflow markdown source. Cost-focus caps live in the top-level
 * frontmatter, so the body is irrelevant here.
 *
 * @param {string} workflowPath - Absolute path to a `news-*.md` workflow.
 * @returns {string} The frontmatter text, or an empty string when absent.
 */
function readFrontmatter(workflowPath) {
  const text = fs.readFileSync(workflowPath, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---/u);
  return match ? match[1] : '';
}

/**
 * Lists every `news-*.md` agentic workflow source (the 14 unified article
 * workflows plus the `news-translate.md` helper).
 *
 * @returns {string[]} Sorted workflow filenames.
 */
function listNewsWorkflows() {
  return fs
    .readdirSync(WORKFLOWS_DIR)
    .filter((name) => name.startsWith('news-') && name.endsWith('.md'))
    .sort();
}

describe('agentic workflow cost governance', () => {
  it('discovers the expected set of news workflows', () => {
    const workflows = listNewsWorkflows();
    // 14 unified article workflows + news-translate.md helper.
    expect(workflows.length).toBe(15);
    expect(workflows).toContain('news-translate.md');
  });

  it('declares an explicit max-turns cap of 500 in every news workflow', () => {
    for (const workflow of listNewsWorkflows()) {
      const frontmatter = readFrontmatter(path.join(WORKFLOWS_DIR, workflow));
      // Cost-focus caps MUST be declared inline — gh-aw silently ignores
      // max-turns / max-ai-credits when set in a shared import (same caveat as
      // safe-outputs.max-patch-size). See workflows/README.md "Cost governance".
      expect(frontmatter, workflow).toMatch(/^max-turns: 500$/m);
    }
  });

  it('declares an explicit max-ai-credits ceiling of 1000 in every news workflow', () => {
    for (const workflow of listNewsWorkflows()) {
      const frontmatter = readFrontmatter(path.join(WORKFLOWS_DIR, workflow));
      expect(frontmatter, workflow).toMatch(/^max-ai-credits: 1000$/m);
    }
  });

  it('compiles the explicit caps into the agent step of every lock file', () => {
    for (const workflow of listNewsWorkflows()) {
      const lockPath = path.join(WORKFLOWS_DIR, workflow.replace(/\.md$/u, '.lock.yml'));
      const lock = fs.readFileSync(lockPath, 'utf8');
      // Agent run uses the literal caps (deterministic, no org-var indirection).
      expect(lock, workflow).toContain('GH_AW_MAX_TURNS: 500');
      expect(lock, workflow).toContain('GH_AW_MAX_AI_CREDITS: "1000"');
      expect(lock, workflow).toContain('"maxRuns":500,"maxCacheMisses":5,"maxAiCredits":1000');
      // The threat-detection sub-step keeps its own separate, smaller budget.
      expect(lock, workflow).toContain(
        "vars.GH_AW_DEFAULT_DETECTION_MAX_AI_CREDITS || '400'",
      );
    }
  });
});
