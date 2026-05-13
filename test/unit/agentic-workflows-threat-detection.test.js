// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WORKFLOWS_DIR = path.join(ROOT, '.github', 'workflows');
const SHARED_MCP_FILE = path.join(
  WORKFLOWS_DIR,
  'shared',
  'mcp',
  'news-mcp-servers.md',
);
const LEGACY_NODE_ALPINE = ['node', '25-alpine'].join(':');

describe('agentic workflow threat detection policy', () => {
  it('keeps safe-output threat detection warning-only for every news workflow', () => {
    const workflows = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) => name.startsWith('news-') && name.endsWith('.md'))
      .sort();

    expect(workflows.length).toBeGreaterThan(0);

    for (const workflow of workflows) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');
      expect(content, workflow).toMatch(
        /^safe-outputs:\n(?:  .*\n)*?  threat-detection:\n    continue-on-error: true$/m,
      );
    }
  });

  it('fetches the triggering commit before safe-output PR bundle application', () => {
    const workflows = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) => name.startsWith('news-') && name.endsWith('.md'))
      .sort();

    expect(workflows.length).toBeGreaterThan(0);

    for (const workflow of workflows) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');
      if (!content.includes('create-pull-request:')) {
        continue;
      }

      expect(content, workflow).toContain('Fetch triggering commit for bundle prerequisites');
      expect(content, workflow).toContain('git fetch --no-tags origin "$GITHUB_SHA"');
      expect(content, workflow).toContain(
        'Repository lacks these prerequisite commits',
      );
    }
  });

  it('keeps news workflow execution aligned with the stable gh-aw posture', () => {
    const workflows = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) => name.startsWith('news-') && name.endsWith('.md'))
      .sort();

    expect(workflows.length).toBeGreaterThan(0);

    for (const workflow of workflows) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');

      expect(content, workflow).toContain('timeout: 180');
      expect(content, workflow).toContain('startup-timeout: 180');
      expect(content, workflow).not.toContain('repo-memory:');
      expect(content, workflow).not.toContain('max-continuations: 1');
    }
  });

  it('uses Node 26 Alpine for every shared MCP backend container', () => {
    const content = fs.readFileSync(SHARED_MCP_FILE, 'utf8');
    const containers = Array.from(content.matchAll(/container:\s*"([^"]+)"/gu)).map(
      (match) => match[1],
    );

    expect(containers.length).toBeGreaterThan(0);
    expect(containers).toEqual(containers.map(() => 'node:26-alpine'));
    expect(content).not.toContain(LEGACY_NODE_ALPINE);
  });

  it('keeps compiled news workflows free of repo-memory write jobs', () => {
    const lockFiles = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) => name.startsWith('news-') && name.endsWith('.lock.yml'))
      .sort();

    expect(lockFiles.length).toBeGreaterThan(0);

    for (const lockFile of lockFiles) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, lockFile), 'utf8');

      expect(content, lockFile).not.toContain('push_repo_memory');
      expect(content, lockFile).not.toContain(LEGACY_NODE_ALPINE);
    }
  });

  it('pre-fetches EP feeds via the shared script in every article workflow', () => {
    // Run 25799686522 (news-propositions) hit CAPIError 429
    // "Maximum LLM invocations exceeded (100/100)" because ~50% of
    // invocations were spent on EP MCP data-gathering. Each article
    // workflow must call scripts/prefetch-ep-feeds.sh from a pre-agent
    // step so the agent reads pre-fetched feed data from
    // ${ANALYSIS_DIR}/data/ instead of calling MCP. The shared script
    // (not inline curl) is required so we don't drift 14 copies of the
    // same fetch logic.
    const articleWorkflows = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) =>
        name.startsWith('news-') &&
        name.endsWith('.md') &&
        name !== 'news-translate.md',
      )
      .sort();

    expect(articleWorkflows.length).toBeGreaterThan(0);

    const prefetchScript = path.join(ROOT, 'scripts', 'prefetch-ep-feeds.sh');
    expect(fs.existsSync(prefetchScript), 'shared prefetch script must exist').toBe(true);

    for (const workflow of articleWorkflows) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');
      expect(content, workflow).toContain(
        'bash scripts/prefetch-ep-feeds.sh',
      );
      // Ensure no workflow re-inlined the fetch logic that should now live in the script.
      // Tolerate the legitimate Squid-allow-list trio in shared/config/news-common-settings.md,
      // which already lives outside the workflow body.
      const inlineCurlMatches = content.match(/curl[^\n]*data\.europarl\.europa\.eu/g) || [];
      expect(inlineCurlMatches.length, `${workflow} must not inline EP API curl calls`).toBe(0);

      // The prefetch step must NOT carry `continue-on-error: true`. The
      // script already handles network failures by writing an
      // unavailable-envelope placeholder and exits non-zero only on real
      // configuration bugs (e.g., unknown feed name). Masking those exits
      // would silently disable prefetch and reintroduce the 100-invocation
      // cap issue. See PR #1899 reviewer feedback.
      const prefetchStepMatch = content.match(
        /- name: Pre-fetch EP feeds[^\n]*\n((?:    [^\n]*\n)+)/,
      );
      expect(prefetchStepMatch, `${workflow} must declare the Pre-fetch EP feeds step`).not.toBeNull();
      expect(
        prefetchStepMatch[1],
        `${workflow} prefetch step must NOT set continue-on-error: true`,
      ).not.toContain('continue-on-error: true');
    }
  });
});
