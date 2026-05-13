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
    expect(content).not.toContain('node:26-alpine');
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
      expect(content, lockFile).not.toContain('node:26-alpine');
    }
  });
});
