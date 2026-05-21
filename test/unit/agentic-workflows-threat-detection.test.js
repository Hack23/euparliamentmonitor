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
  const importLines = [];
  for (const line of text.split('\n')) {
    // Short form: `  - shared/config/foo.md` or `  - .github/agents/foo.md`
    const shortMatch = line.match(/^  - (shared\/[^\s]+|\.github\/[^\s]+)$/);
    if (shortMatch) {
      importLines.push(shortMatch[1].trim());
      continue;
    }
    // Long form: `  - uses: shared/config/foo.md` (parameterized imports)
    const usesMatch = line.match(/^  - uses: (shared\/[^\s]+|\.github\/[^\s]+)$/);
    if (usesMatch) {
      importLines.push(usesMatch[1].trim());
    }
  }
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
      // Walk imports — `timeout: 180` and `startup-timeout: 180` now live in
      // .github/workflows/shared/config/news-tools.md after Phase C of the
      // agentic-workflow refactor; the per-slug workflows MUST NOT reset
      // those values, but the contract is still binding on the combined view.
      const combined = readWorkflowWithImports(path.join(WORKFLOWS_DIR, workflow));

      expect(combined, workflow).toContain('timeout: 180');
      expect(combined, workflow).toContain('startup-timeout: 180');
      expect(combined, workflow).not.toContain('repo-memory:');
      // news-translate.md intentionally uses max-continuations: 1 to prevent
      // post-flush engine timeout (run #219 regression). Article workflows
      // need higher continuations for crash recovery of complex pipelines.
      if (workflow !== 'news-translate.md') {
        expect(combined, workflow).not.toContain('max-continuations: 1');
      }
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

  it('declares only consumed workflow_dispatch inputs (no dead parameters)', () => {
    // Regression guard: the `force_generation` workflow_dispatch input was
    // declared on every article workflow but never consumed by any
    // downstream prompt, shared import, script, or env block. The pipeline
    // is unconditionally "Always-on" per `.github/prompts/02a-rerun-merge.md`
    // § 2 (re-runs never no-op, Stage D always re-renders), so there was
    // nothing for the parameter to gate. Operators clicking the
    // "Run workflow" UI and toggling it expected a skip-path that did not
    // exist. The parameter is removed from both the source `.md` and the
    // compiled `.lock.yml`; this drift-guard prevents either surface from
    // silently re-introducing it.
    //
    // If a future task genuinely needs a force/skip toggle, wire it
    // end-to-end (declare it AND consume it in a documented Stage A/B
    // bash block or a script) before re-introducing the parameter.
    const articleSources = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) =>
        name.startsWith('news-') &&
        name.endsWith('.md') &&
        name !== 'news-translate.md',
      )
      .sort();
    expect(articleSources.length).toBeGreaterThan(0);
    for (const workflow of articleSources) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');
      expect(content, workflow).not.toMatch(/^\s*force_generation:/m);
    }

    const articleLocks = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) =>
        name.startsWith('news-') &&
        name.endsWith('.lock.yml') &&
        name !== 'news-translate.lock.yml',
      )
      .sort();
    expect(articleLocks.length).toBeGreaterThan(0);
    for (const lockFile of articleLocks) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, lockFile), 'utf8');
      expect(content, lockFile).not.toMatch(/^\s*force_generation:/m);
    }

    // The election-imminent-scheduler.yml dispatcher must not pass a
    // `force_generation` input either (the receiver no longer accepts it).
    const scheduler = fs.readFileSync(
      path.join(WORKFLOWS_DIR, 'election-imminent-scheduler.yml'),
      'utf8',
    );
    expect(scheduler, 'election-imminent-scheduler.yml').not.toMatch(
      /force_generation:\s*['"]?true['"]?/,
    );
  });

  it('declares every workflow_dispatch input consumed by news-translate.md env blocks', () => {
    // Regression guard: `news-translate.md` references
    //   MAX_SOURCE_LINES: ${{ github.event.inputs.max_source_lines || '300' }}
    // in the discovery step. If `max_source_lines` is not declared as a
    // workflow_dispatch input, the GitHub Actions UI cannot override the
    // 300-line default — the env block always falls back. Every env-block
    // `github.event.inputs.X` reference MUST have a matching declared
    // input.
    const workflow = fs.readFileSync(
      path.join(WORKFLOWS_DIR, 'news-translate.md'),
      'utf8',
    );

    // Extract the workflow_dispatch inputs block.
    const dispatchMatch = workflow.match(
      /workflow_dispatch:\s*\n\s+inputs:\s*\n([\s\S]*?)\npermissions:/m,
    );
    expect(dispatchMatch, 'workflow_dispatch.inputs block must exist').not.toBeNull();
    const declaredInputs = new Set(
      Array.from(
        dispatchMatch[1].matchAll(/^\s{6}([a-z_][a-z0-9_]*):/gm),
      ).map((match) => match[1]),
    );

    // Scan the workflow for every `github.event.inputs.<name>` reference
    // and assert it is declared.
    const referencedInputs = new Set(
      Array.from(
        workflow.matchAll(/github\.event\.inputs\.([a-z_][a-z0-9_]*)/g),
      ).map((match) => match[1]),
    );

    for (const name of referencedInputs) {
      expect(
        declaredInputs.has(name),
        `news-translate.md references github.event.inputs.${name} but does not declare it in workflow_dispatch.inputs`,
      ).toBe(true);
    }

    // Specifically assert the six caller-facing knobs are declared.
    for (const required of [
      'max_briefs',
      'max_age_days',
      'include_extended',
      'mode',
      'max_source_lines',
      'target_brief',
    ]) {
      expect(
        declaredInputs.has(required),
        `news-translate.md must declare workflow_dispatch input ${required}`,
      ).toBe(true);
    }
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
    // Shared file must ALSO wire the code_push_failure_count output so the
    // fallback runs even when safe_outputs reports job-level success while
    // its internal create_pull_request push fell back to a review issue
    // (regression run #26017383773 — propositions 2026-05-18 — where the
    // bundle push failed silently because this env var was missing and
    // the script took the success short-circuit path).
    expect(sharedContent).toContain(
      'GH_AW_CODE_PUSH_FAILURE_COUNT: ${{ needs.safe_outputs.outputs.code_push_failure_count }}',
    );
    // Shared file must ALSO wire created_pr_number so the fallback can detect
    // the silent-push-failure case where safe_outputs reports success AND
    // code_push_failure_count is 0 but the bundle push fell back to a review
    // issue (gh-aw treats the issue-fallback as a non-failure for counting).
    // An empty created_pr_number with success + count=0 + a bundle/patch
    // artifact on disk is the authoritative signal — root cause of regression
    // runs #26019545674 (motions) and #26017383773 (propositions), both
    // 2026-05-18, where the bundle push failed silently and the PAT fallback
    // short-circuited because the count never went above 0.
    expect(sharedContent).toContain(
      'GH_AW_CREATED_PR_NUMBER: ${{ needs.safe_outputs.outputs.created_pr_number }}',
    );
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

  it('wires the org PAT into safe-outputs.create-pull-request for every article workflow', () => {
    // Root-cause fix for the silent-bundle-push regressions of 2026-05-18
    // (motions run #26019545674, propositions run #26017383773). The
    // safe_outputs PR-bundle push uses a GitHub App token (GITHUB_TOKEN /
    // GH_AW_GITHUB_TOKEN) by default. That token (a) cannot POST to
    // /repos/.../git/refs to create the bundle branch via the GraphQL
    // signed-push path (403 "Resource not accessible by integration"),
    // AND (b) is blocked by GitHub's `workflows: write` pre-receive hook
    // when the new branch tree differs from main on ANY
    // `.github/workflows/*` file — the hook compares full trees, not just
    // the pushed commits, so even a stale base ref (which is the common
    // case when news workflows merge concurrently) is enough to trigger
    // "refusing to allow a GitHub App to create or update workflow
    // .github/workflows/<other>.lock.yml without workflows permission".
    //
    // Fix: declare `github-token: COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN`
    // under each workflow's `safe-outputs.create-pull-request:` block so
    // gh-aw plumbs the PAT into both the GraphQL signed-push path AND the
    // `git push` fallback path. The PAT carries `workflows` scope and
    // bypasses both failure modes. The pat-pr-fallback job (PR #1902 /
    // #1903 / this PR) stays as belt-and-braces for any remaining
    // edge case.
    const articleWorkflows = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) =>
        name.startsWith('news-') &&
        name.endsWith('.md') &&
        name !== 'news-translate.md',
      )
      .sort();

    expect(articleWorkflows.length).toBeGreaterThan(0);

    for (const workflow of articleWorkflows) {
      const mdContent = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');
      // Source workflow must declare the PAT on the create-pull-request
      // block (allow GITHUB_TOKEN as a forks/dispatch fallback).
      expect(
        mdContent,
        `${workflow} must wire github-token under create-pull-request:`,
      ).toMatch(
        /create-pull-request:[\s\S]{0,2000}?github-token:\s*\$\{\{\s*secrets\.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN\s*\|\|\s*secrets\.GITHUB_TOKEN\s*\}\}/,
      );

      // Compiled lock file must propagate the PAT into both the
      // GH_AW_SAFE_OUTPUTS_HANDLER_CONFIG JSON (so the GraphQL
      // signed-push path uses it) and the Process Safe Outputs step env
      // (so the `git push` fallback inherits it as GITHUB_TOKEN).
      const lockPath = path.join(
        WORKFLOWS_DIR,
        workflow.replace(/\.md$/, '.lock.yml'),
      );
      expect(
        fs.existsSync(lockPath),
        `${workflow} must have a compiled .lock.yml`,
      ).toBe(true);
      const lockContent = fs.readFileSync(lockPath, 'utf8');
      // gh-aw v0.74.4 emits the safe-outputs handler config in TWO places
      // in the compiled lock: (1) a heredoc'd config.json that references
      // an env var via shell expansion (gh-aw picks either
      // `${GITHUB_TOKEN}` or `${COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN}`
      // depending on its env-binding heuristic — both env vars are wired
      // to the same `secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN ||
      // secrets.GITHUB_TOKEN` expression on the surrounding step), and
      // (2) the Process Safe Outputs step's GH_AW_SAFE_OUTPUTS_HANDLER_CONFIG
      // env which carries the literal `${{ secrets.* }}` expression
      // (with quotes JSON-escaped). Both must mention the PAT for the
      // token to flow into the GraphQL signed-push path AND the git push
      // fallback.
      expect(
        lockContent,
        `${path.basename(lockPath)} must wire the PAT-or-fallback expression to COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN env on the Generate Safe Outputs Config step`,
      ).toMatch(
        /COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN:\s*\$\{\{\s*secrets\.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN\s*\|\|\s*secrets\.GITHUB_TOKEN\s*\}\}/,
      );
      expect(
        lockContent,
        `${path.basename(lockPath)} must reference one of the PAT-bearing env vars under "github-token" in the safeoutputs/config.json heredoc`,
      ).toMatch(
        /"github-token":\s*"\$\{(?:COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN|GITHUB_TOKEN)\}"/,
      );
      expect(
        lockContent,
        `${path.basename(lockPath)} must embed the PAT in GH_AW_SAFE_OUTPUTS_HANDLER_CONFIG`,
      ).toMatch(
        /\\"github-token\\":\s*\\"\$\{\{\s*secrets\.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN\s*\|\|\s*secrets\.GITHUB_TOKEN\s*\}\}\\"/,
      );
    }
  });

  it('imports the shared parameterized tools component in every article workflow', () => {
    // Phase C of the agentic-workflow refactor extracted the structurally
    // identical `tools:` block (timeout / startup-timeout / github.toolsets
    // / bash / edit / web-fetch / agentic-workflows / cache-memory) out of
    // the 14 per-slug workflows into a single shared file
    // (`news-tools.md`) parameterized by `slug` (only `cache-memory.key`
    // varies between workflows). This drift-guard ensures every article
    // workflow continues to import it with a correctly-namespaced slug.
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
      'news-tools.md',
    );
    expect(fs.existsSync(sharedFile), 'news-tools.md must exist').toBe(true);
    const sharedContent = fs.readFileSync(sharedFile, 'utf8');
    // Shared file must declare the import-schema slug input.
    expect(sharedContent).toMatch(/^import-schema:/m);
    expect(sharedContent).toMatch(/^  slug:/m);
    // And the parameterized cache-memory key must reference the slug input.
    expect(sharedContent).toContain('key: news-${{ github.aw.import-inputs.slug }}-${{ github.repository_owner }}');
    // Core tool keys must remain.
    expect(sharedContent).toContain('timeout: 180');
    expect(sharedContent).toContain('startup-timeout: 180');
    expect(sharedContent).toContain('bash: true');
    expect(sharedContent).toContain('web-fetch:');

    for (const workflow of articleWorkflows) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');

      expect(content, workflow).toContain('uses: shared/config/news-tools.md');
      // And the workflow MUST NOT re-inline the tools block.
      expect(content, `${workflow} must not re-inline tools: block (lives in shared)`).not.toMatch(
        /^tools:\n  timeout: 180\n  startup-timeout: 180\n/m,
      );
      expect(content, `${workflow} must not re-inline cache-memory.key (lives in shared)`).not.toMatch(
        /^    key: news-[a-z-]+-\$\{\{ github\.repository_owner \}\}$/m,
      );
    }
  });

  it('does not re-inline the 18-line timeout-minutes scheduling rationale (Phase D)', () => {
    // Phase D of the agentic-workflow refactor compressed the 18-line
    // YAML-comment explanation above `timeout-minutes: 60` down to a
    // 3-line cross-reference to the README's "Workflow timing contract"
    // section. The long version (252 lines duplicated across 14
    // workflows) lives canonically in `.github/workflows/README.md`.
    // YAML comments do not propagate into the compiled `.lock.yml` so
    // there is no runtime risk in compressing them, but this drift-guard
    // prevents accidental re-inlining by a future author copy-pasting
    // from an old workflow.
    const articleWorkflows = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) =>
        name.startsWith('news-') &&
        name.endsWith('.md') &&
        name !== 'news-translate.md',
      )
      .sort();

    expect(articleWorkflows.length).toBeGreaterThan(0);

    for (const workflow of articleWorkflows) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');

      // The hallmark phrase from the long deprecated explanation.
      expect(content, `${workflow} must not re-inline the long timeout-minutes rationale`).not.toContain(
        'Hard safety cap = 60 minutes (`timeout-minutes: 60`)',
      );
      // The redundant "tools: inherited" multi-line comment.
      expect(content, `${workflow} must not re-inline the long tools-inherited comment`).not.toMatch(
        /^# `tools:` is inherited \(with `slug` substituted into `cache-memory\.key`\) from\n# \.github\/workflows\/shared\/config\/news-tools\.md/m,
      );
      // The redundant "post-steps + pat-pr-fallback inherited" multi-line comment.
      expect(content, `${workflow} must not re-inline the long pat-pr-fallback-inherited comment`).not.toMatch(
        /^# `post-steps:` \(agent-patch capture\) and `jobs\.pat-pr-fallback`\n# \(host-side PAT recovery\) are inherited/m,
      );

      // And the compressed comment must still be present (with the
      // README cross-reference) so readers know where the long form lives.
      expect(content, `${workflow} must keep the timing-contract cross-reference`).toContain(
        '.github/workflows/README.md "Workflow timing contract"',
      );
    }
  });

  it('threshold-cache helper script exists and is callable from workflows', () => {
    // May-2026 invocation-budget discipline: agents must call
    // scripts/cache-analysis-thresholds.sh once at Stage B start rather
    // than re-reading reference-quality-thresholds.json per artifact.
    // This drift-guard ensures the helper script exists and is referenced
    // in the shared runtime prompt so it flows into every article workflow.
    const cacheScript = path.join(ROOT, 'scripts', 'cache-analysis-thresholds.sh');
    expect(fs.existsSync(cacheScript), 'cache-analysis-thresholds.sh must exist').toBe(true);

    const scriptContent = fs.readFileSync(cacheScript, 'utf8');
    // Script must declare its canonical usage contract.
    expect(scriptContent).toContain('cache-analysis-thresholds.sh');
    // Script must write the thresholds-cache.json output.
    expect(scriptContent).toContain('thresholds-cache.json');
    // Script must use a single-quoted heredoc (shell-safety: no expansion in node script).
    expect(scriptContent).toContain("<<'NODE_EOF'");

    // The shared runtime prompt must reference the cache helper so agents
    // that import news-unified-runtime.md learn about it.
    const runtimePrompt = path.join(
      WORKFLOWS_DIR,
      'shared',
      'prompts',
      'news-unified-runtime.md',
    );
    const runtimeContent = fs.readFileSync(runtimePrompt, 'utf8');
    expect(runtimeContent, 'news-unified-runtime.md must reference cache-analysis-thresholds.sh').toContain(
      'cache-analysis-thresholds.sh',
    );
    expect(runtimeContent, 'news-unified-runtime.md must reference thresholds-cache.json').toContain(
      'thresholds-cache.json',
    );
  });

  it('prefetch-status.json data-mode contract is consistent across prefetch script and validator', () => {
    // The prefetch script must write prefetch-status.json with the
    // PREFETCH_DATA_MODE values that map to known manifest.dataMode values.
    const prefetchScript = path.join(ROOT, 'scripts', 'prefetch-ep-feeds.sh');
    const scriptContent = fs.readFileSync(prefetchScript, 'utf8');

    // Ensure all three data-mode values are present.
    // NOTE: the script emits "full" (not "green") since the round-2 fix that
    // eliminated the green→full manual translation at Stage A.
    expect(scriptContent).toContain('PREFETCH_DATA_MODE="full"');
    expect(scriptContent).toContain('PREFETCH_DATA_MODE="degraded-feeds"');
    expect(scriptContent).toContain('PREFETCH_DATA_MODE="minimal"');
    // prefetch-status.json must be written.
    expect(scriptContent).toContain('prefetch-status.json');
    // PREFETCH_DATA_MODE must be exported via GITHUB_ENV.
    expect(scriptContent).toContain('PREFETCH_DATA_MODE=${PREFETCH_DATA_MODE}');
    // Loud degraded warning to stderr after retries exhausted.
    expect(scriptContent).toMatch(/DEGRADED:[^`\n]*>&2/);

    // Validate validate-analysis-completeness.js recognises degraded-feeds.
    const validatorScript = path.join(ROOT, 'scripts', 'validate-analysis-completeness.js');
    const validatorContent = fs.readFileSync(validatorScript, 'utf8');
    expect(validatorContent).toContain("'degraded-feeds':");

    // The shared runtime prompt must document all four modes in its
    // Data-Mode Declaration table.
    const runtimePrompt = path.join(
      WORKFLOWS_DIR,
      'shared',
      'prompts',
      'news-unified-runtime.md',
    );
    const runtimeContent = fs.readFileSync(runtimePrompt, 'utf8');
    expect(runtimeContent, 'runtime prompt must document degraded-feeds mode').toContain('degraded-feeds');
    expect(runtimeContent, 'runtime prompt must document degraded-imf mode').toContain('degraded-imf');
    expect(runtimeContent, 'runtime prompt must document degraded-voting mode').toContain('degraded-voting');
    expect(runtimeContent, 'runtime prompt must document minimal mode').toContain('minimal');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 1 — Engine model allow-list
  //
  // Locks the currently-deployed engine.model per article workflow so a stray
  // edit can't quietly downgrade Opus 4.7 slugs to Sonnet or upgrade Sonnet
  // slugs to Opus (both are runtime behaviour changes).
  //
  // The allow-list reflects what is on `main` at the start of the
  // modularization PR. `year-ahead` + `year-in-review` are currently
  // `claude-sonnet-4.6` — flagged in the PR description as a potential
  // future upgrade decision.
  // ─────────────────────────────────────────────────────────────────────────
  it('locks the engine.model per workflow to the approved allow-list', () => {
    const APPROVED_MODELS = {
      'news-breaking.md': 'claude-sonnet-4.6',
      'news-committee-reports.md': 'claude-sonnet-4.6',
      'news-election-cycle.md': 'claude-opus-4.7',
      'news-month-ahead.md': 'claude-sonnet-4.6',
      'news-month-in-review.md': 'claude-sonnet-4.6',
      'news-motions.md': 'claude-sonnet-4.6',
      'news-propositions.md': 'claude-sonnet-4.6',
      'news-quarter-ahead.md': 'claude-sonnet-4.6',
      'news-quarter-in-review.md': 'claude-sonnet-4.6',
      'news-term-outlook.md': 'claude-opus-4.7',
      'news-translate.md': 'claude-sonnet-4.6',
      'news-week-ahead.md': 'claude-sonnet-4.6',
      'news-week-in-review.md': 'claude-sonnet-4.6',
      'news-year-ahead.md': 'claude-sonnet-4.6',
      'news-year-in-review.md': 'claude-sonnet-4.6',
    };
    for (const [workflow, expectedModel] of Object.entries(APPROVED_MODELS)) {
      const wfPath = path.join(WORKFLOWS_DIR, workflow);
      const content = fs.readFileSync(wfPath, 'utf8');
      // engine.model lives inside the `engine:` frontmatter block — match the
      // canonical 2-space-indent form emitted by gh-aw.
      expect(
        content,
        `${workflow} must declare engine.model: ${expectedModel}`,
      // Escape all regex metacharacters (including backslash) — CodeQL js/incomplete-sanitization.
      ).toMatch(new RegExp(`\\n  model: ${expectedModel.replace(/[\\^$.*+?()[\]{}|\-]/g, '\\$&')}\\b`));
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 2 — Stages narrative extraction to shared/prompts/news-unified-stages.md
  //
  // Every article workflow (NOT news-translate) imports the parameterized
  // shared file with `with: slug: <slug>` and must NOT re-inline the
  // extracted narrative (Date Context bash, Stage B re-run + Pass1/2 +
  // PREFLIGHT_ATTESTATION, Stage C gate + tripwire, Stage D `generate-article`,
  // Stage E SINGLE_PR_ATTESTATION + safeoutputs___create_pull_request spec,
  // 🚫 Never section).
  // ─────────────────────────────────────────────────────────────────────────
  const articleWorkflows = fs
    .readdirSync(WORKFLOWS_DIR)
    .filter((f) => f.startsWith('news-') && f.endsWith('.md') && f !== 'news-translate.md');

  it('every article workflow imports shared/prompts/news-unified-stages.md with a slug', () => {
    for (const workflow of articleWorkflows) {
      const slug = workflow.replace(/^news-/, '').replace(/\.md$/, '');
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');
      // The parameterized import must appear with the matching slug.
      expect(
        content,
        `${workflow} must import shared/prompts/news-unified-stages.md`,
      ).toMatch(/- uses: shared\/prompts\/news-unified-stages\.md/);
      // The `with: slug: <slug>` block must declare the same slug as the
      // workflow file name.
      const withBlock = new RegExp(
        `- uses: shared\\/prompts\\/news-unified-stages\\.md\\s*\\n\\s+with:\\s*\\n\\s+slug:\\s+${slug}\\b`,
      );
      expect(content, `${workflow} must pass with: slug: ${slug}`).toMatch(withBlock);
    }
  });

  it('no article workflow re-inlines the extracted Stage-narrative sentinels', () => {
    // Sentinels that should now ONLY live in shared/prompts/news-unified-stages.md.
    // Re-inlining any of these in a per-slug workflow is a Phase-2 regression.
    const BANNED_INLINE_SENTINELS = [
      'PREFLIGHT_ATTESTATION: read N/N artifacts from',
      'SINGLE_PR_ATTESTATION: about to emit the only PR',
      'STAGE_C_GATE: GREEN articleType=',
      'STAGE_C_GATE: ANALYSIS_ONLY articleType=',
      'STAGE_C_GATE: RED articleType=',
      '## 🚫 Never',
      '## 🗓️ Date Context + Stable Folder Resolution',
      'Elapsed-Time Tripwire',
    ];
    for (const workflow of articleWorkflows) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');
      for (const banned of BANNED_INLINE_SENTINELS) {
        expect(
          content,
          `${workflow} must not re-inline "${banned}" — it lives in shared/prompts/news-unified-stages.md`,
        ).not.toContain(banned);
      }
    }
  });

  it('shared/prompts/news-unified-stages.md owns the Stage-narrative sentinels exactly once', () => {
    const stagesFile = path.join(WORKFLOWS_DIR, 'shared', 'prompts', 'news-unified-stages.md');
    const stagesContent = fs.readFileSync(stagesFile, 'utf8');
    // The shared file MUST contain all the sentinels.
    const REQUIRED_SENTINELS = [
      'PREFLIGHT_ATTESTATION: read N/N artifacts from',
      'SINGLE_PR_ATTESTATION: about to emit the only PR',
      'STAGE_C_GATE: GREEN articleType=',
      '## 🚫 Never',
      '## 🗓️ Date Context + Stable Folder Resolution',
      'Elapsed-Time Tripwire',
    ];
    for (const sentinel of REQUIRED_SENTINELS) {
      expect(
        stagesContent,
        `shared/prompts/news-unified-stages.md must contain "${sentinel}"`,
      ).toContain(sentinel);
    }
    // The shared file MUST declare the slug import-schema input.
    expect(stagesContent).toMatch(/import-schema:\s*\n\s+slug:/);
    // The shared file MUST substitute slug via the gh-aw expression token.
    expect(stagesContent).toContain('${{ github.aw.import-inputs.slug }}');
  });

  it('every article workflow inlines the per-slug Workflow Parameters table + Article-Type Specifics', () => {
    for (const workflow of articleWorkflows) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');
      // These sections are slug-specific and must stay in the per-workflow body
      // even after Phase-2 extraction.
      expect(content, `${workflow} must keep its Workflow Parameters table`).toContain(
        '## 🔖 Workflow Parameters',
      );
      expect(content, `${workflow} must keep its Article-Type Specifics`).toContain(
        '## 🎯 Article-Type Specifics',
      );
      expect(content, `${workflow} must keep its Stage A heading`).toMatch(
        /### Stage A — Data Collection/,
      );
    }
  });
});
