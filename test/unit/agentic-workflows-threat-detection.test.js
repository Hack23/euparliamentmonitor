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
const SHARED_SAFE_OUTPUTS_HEAD_FILE = path.join(
  WORKFLOWS_DIR,
  'shared',
  'config',
  'news-safe-outputs-head.md',
);
const SHARED_SAFE_OUTPUTS_DOMAINS_FILE = path.join(
  WORKFLOWS_DIR,
  'shared',
  'config',
  'news-safe-outputs-domains.md',
);
const LEGACY_NODE_ALPINE = ['node', '25-alpine'].join(':');

/**
 * Reads a workflow source and concatenates the content of every shared file it
 * imports under `imports:`. Drift-guards must look at this combined view because
 * frontmatter blocks like `threat-detection`, `allowed-domains`, and the
 * bundle-prerequisite `steps:` block were extracted out of the per-slug
 * workflows into shared `news-safe-outputs-*.md` components (Phase A1/A2 of the
 * agentic-workflow refactor).
 */
function readWorkflowWithImports(workflowPath) {
  const text = fs.readFileSync(workflowPath, 'utf8');
  const importLines = text
    .split('\n')
    .filter((line) => /^  - (shared\/|\.github\/)/.test(line))
    .map((line) => line.replace(/^  - /, '').trim());
  const importedContents = importLines.map((relPath) => {
    const normalized = relPath.startsWith('.github/')
      ? path.join(ROOT, relPath)
      : path.join(WORKFLOWS_DIR, relPath);
    try {
      return fs.readFileSync(normalized, 'utf8');
    } catch {
      return '';
    }
  });
  return text + '\n' + importedContents.join('\n');
}

describe('agentic workflow threat detection policy', () => {
  it('keeps safe-output threat detection warning-only for every news workflow', () => {
    const workflows = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) => name.startsWith('news-') && name.endsWith('.md'))
      .sort();

    expect(workflows.length).toBeGreaterThan(0);

    // The shared head file owns the contract; every news workflow imports it
    // (except news-translate, which has its own safe-outputs posture and is
    // already exempt from the import requirement).
    const sharedHead = fs.readFileSync(SHARED_SAFE_OUTPUTS_HEAD_FILE, 'utf8');
    expect(sharedHead, 'news-safe-outputs-head.md').toMatch(
      /^safe-outputs:\n(?:  .*\n)*?  threat-detection:\n    continue-on-error: true$/m,
    );

    for (const workflow of workflows) {
      const combined = readWorkflowWithImports(path.join(WORKFLOWS_DIR, workflow));
      expect(combined, workflow).toMatch(
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

    // The shared head file owns the bundle-prerequisite fetch step.
    const sharedHead = fs.readFileSync(SHARED_SAFE_OUTPUTS_HEAD_FILE, 'utf8');
    expect(sharedHead, 'news-safe-outputs-head.md').toContain('Fetch triggering commit for bundle prerequisites');
    expect(sharedHead, 'news-safe-outputs-head.md').toContain('git fetch --no-tags origin "$GITHUB_SHA"');
    expect(sharedHead, 'news-safe-outputs-head.md').toContain('Repository lacks these prerequisite commits');

    for (const workflow of workflows) {
      const combined = readWorkflowWithImports(path.join(WORKFLOWS_DIR, workflow));
      if (!combined.includes('create-pull-request:')) {
        continue;
      }

      expect(combined, workflow).toContain('Fetch triggering commit for bundle prerequisites');
      expect(combined, workflow).toContain('git fetch --no-tags origin "$GITHUB_SHA"');
      expect(combined, workflow).toContain(
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

  it('imports the shared safe-outputs head + domains components in every article workflow', () => {
    // Phase A1/A2 of the agentic-workflow refactor extracted the
    // `safe-outputs.threat-detection`, bundle-prerequisite `steps:` block, and
    // `safe-outputs.allowed-domains` allowlist out of the per-slug
    // workflows into shared `news-safe-outputs-head.md` and
    // `news-safe-outputs-domains.md` components. This drift-guard ensures
    // every article workflow continues to import both — a new workflow that
    // re-inlines those blocks would re-introduce ~70 lines of duplication
    // and break the single-source-of-truth contract.
    const articleWorkflows = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) =>
        name.startsWith('news-') &&
        name.endsWith('.md') &&
        name !== 'news-translate.md',
      )
      .sort();

    expect(articleWorkflows.length).toBeGreaterThan(0);
    expect(fs.existsSync(SHARED_SAFE_OUTPUTS_HEAD_FILE), 'news-safe-outputs-head.md must exist').toBe(true);
    expect(fs.existsSync(SHARED_SAFE_OUTPUTS_DOMAINS_FILE), 'news-safe-outputs-domains.md must exist').toBe(true);

    for (const workflow of articleWorkflows) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');

      expect(content, workflow).toContain('- shared/config/news-safe-outputs-head.md');
      expect(content, workflow).toContain('- shared/config/news-safe-outputs-domains.md');

      // And the workflow MUST NOT re-inline the now-shared blocks.
      expect(content, `${workflow} must not re-inline threat-detection (lives in shared)`).not.toMatch(
        /^  threat-detection:\n    continue-on-error: true$/m,
      );
      expect(content, `${workflow} must not re-inline allowed-domains (lives in shared)`).not.toMatch(
        /^  allowed-domains:\n    - github\b/m,
      );
      expect(content, `${workflow} must not re-inline bundle-prerequisite fetch step (lives in shared)`).not.toContain(
        '- name: Fetch triggering commit for bundle prerequisites',
      );
    }
  });

  it('imports the shared parameterized pat-pr-fallback component in every article workflow', () => {
    // Phase B of the agentic-workflow refactor extracted the structurally
    // identical `post-steps:` (agent-patch capture) + `jobs.pat-pr-fallback`
    // (host-side PAT recovery) blocks out of the 14 per-slug workflows into
    // a single parameterized shared file (`news-pat-pr-fallback.md`) using
    // gh-aw's `import-schema:` with `slug` and `workflowName` inputs.
    // This drift-guard ensures every article workflow continues to import
    // it with the correct parameters. The PAT recovery contract
    // (`scripts/gh-aw-pat-pr-fallback.sh` short-circuits on
    // GH_AW_SAFE_OUTPUTS_RESULT=success; see PR #1902/#1903 forensic history)
    // depends on the shared file flowing `${{ needs.safe_outputs.result }}`
    // into the recovery env — re-inlining the job in a single workflow
    // would either drift that contract or duplicate ~35 lines.
    const articleWorkflows = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) =>
        name.startsWith('news-') &&
        name.endsWith('.md') &&
        name !== 'news-translate.md',
      )
      .sort();

    expect(articleWorkflows.length).toBeGreaterThan(0);

    const sharedFile = path.join(
      WORKFLOWS_DIR,
      'shared',
      'config',
      'news-pat-pr-fallback.md',
    );
    expect(fs.existsSync(sharedFile), 'news-pat-pr-fallback.md must exist').toBe(true);
    const sharedContent = fs.readFileSync(sharedFile, 'utf8');
    // Shared file must wire the safe-outputs-result short-circuit env var.
    expect(sharedContent).toContain('GH_AW_SAFE_OUTPUTS_RESULT: ${{ needs.safe_outputs.result }}');
    // Shared file must declare the import-schema inputs.
    expect(sharedContent).toMatch(/^import-schema:/m);
    expect(sharedContent).toContain('slug:');
    expect(sharedContent).toContain('workflowName:');

    for (const workflow of articleWorkflows) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');

      expect(content, workflow).toContain('uses: shared/config/news-pat-pr-fallback.md');
      // The `with:` map must include both required inputs.
      expect(content, `${workflow} must pass slug input`).toMatch(/with:\n\s*slug:/);
      expect(content, `${workflow} must pass workflowName input`).toMatch(/with:\n\s*slug: [^\n]+\n\s*workflowName:/);

      // And the workflow MUST NOT re-inline the post-steps capture step or
      // the pat-pr-fallback job — those live exclusively in the shared file.
      expect(content, `${workflow} must not re-inline post-steps Capture agent recovery patch (lives in shared)`).not.toContain(
        '- name: Capture agent recovery patch',
      );
      expect(content, `${workflow} must not re-inline pat-pr-fallback job (lives in shared)`).not.toMatch(
        /^  pat-pr-fallback:\n\s*name: Host-side PAT PR fallback/m,
      );
    }
  });
});
