// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const LINT_SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../scripts/lint-prompts.js',
);

function runLint(workflowsDir) {
  try {
    const stdout = execFileSync(
      process.execPath,
      [LINT_SCRIPT, '--workflows-dir', workflowsDir],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status || 1,
      stdout: (err.stdout || '').toString(),
      stderr: (err.stderr || '').toString(),
    };
  }
}

describe('scripts/lint-prompts.js', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lint-prompts-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function writeWorkflow(name, body) {
    fs.writeFileSync(path.join(tmpDir, name), body, 'utf8');
  }

  it('exits 0 when every workflow follows the single-PR rule', () => {
    writeWorkflow(
      'news-example.md',
      '# Title\n\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n  - shared/mcp/news-mcp-servers.md\n\n' +
        'Call safeoutputs___create_pull_request at the end.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('0 violations');
  });

  it('exits 1 when a workflow calls create_pull_request more than once', () => {
    writeWorkflow(
      'news-bad-multi-pr.md',
      '# Title\n' +
        'Call safeoutputs___create_pull_request at min 3.\n' +
        'Call safeoutputs___create_pull_request again at min 50.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('must appear at most once');
  });

  it('flags forbidden phrases regardless of casing', () => {
    writeWorkflow(
      'news-bad-heartbeat.md',
      '# Title\nKeep-alive heartbeat via progressive safe output.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    // All three phrases surface in the report.
    expect(result.stderr.toLowerCase()).toContain('keep-alive');
    expect(result.stderr.toLowerCase()).toContain('heartbeat');
    expect(result.stderr.toLowerCase()).toContain('progressive safe output');
  });

  it('flags references to modules purged in the April-2026 aggregator migration', () => {
    writeWorkflow(
      'news-bad-legacy.md',
      '# Title\n' +
        '```bash\n' +
        'npx tsx src/generators/news-enhanced.ts\n' +
        'node scripts/utils/validate-analysis-completeness.js --article-html=x\n' +
        'echo src/utils/validate-articles.ts\n' +
        'echo src/generators/strategies/motions.ts\n' +
        '```\n' +
        'The split family news-<type>-analysis.md + news-<type>-article.md is gone.\n' +
        'npm run generate-news --legacy\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    const stderr = result.stderr;
    expect(stderr).toContain('news-enhanced.ts');
    expect(stderr).toContain('validate-articles.ts');
    expect(stderr).toContain('validate-analysis-completeness.js');
    expect(stderr).toContain('src/generators/strategies/');
    expect(stderr).toContain('news-<type>-analysis.md');
    expect(stderr).toContain('news-<type>-article.md');
    expect(stderr).toContain('generate-news');
  });

  it('accepts workflows that reference the aggregator entry point and CLI', () => {
    writeWorkflow(
      'news-ok-aggregator.md',
      '# Title\nCall safeoutputs___create_pull_request once.\n' +
        'Stage D: `npm run generate-article -- --run "${ANALYSIS_DIR}"`.\n' +
        'The aggregator modules live under `src/aggregator/**` ' +
        '(artifact-order, clean-artifact, analysis-aggregator, ' +
        'markdown-renderer, article-html, article-generator).\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n  - shared/mcp/news-mcp-servers.md\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(0);
  });

  it('still allows generate-news-indexes (not a purged module)', () => {
    writeWorkflow(
      'news-ok-indexes.md',
      '# Title\nCall safeoutputs___create_pull_request once.\n' +
        'npm run generate-news-indexes is the prebuild hook.\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n  - shared/mcp/news-mcp-servers.md\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(0);
  });

  it('flags push_repo_memory references', () => {
    writeWorkflow(
      'news-bad-memory.md',
      '# Title\nsafeoutputs___push_repo_memory keeps the session alive.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('push_repo_memory');
  });

  it('exempts news-translate.md from every rule', () => {
    writeWorkflow(
      'news-translate.md',
      '# Title\n' +
        'Call safeoutputs___create_pull_request at min 2 as the checkpoint PR.\n' +
        'Then periodic keep-alive heartbeat via safeoutputs___push_repo_memory.\n' +
        'Final safeoutputs___create_pull_request at min 88.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(0);
  });

  it('flags missing analysis-awareness anchor in a news-*.md', () => {
    writeWorkflow(
      'news-no-analysis.md',
      '# Title\nCall safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('analysis-awareness');
    expect(result.stderr).toContain('completeness-gate');
  });

  it('accepts workflows that import news-generation.agent.md (transitive anchors)', () => {
    writeWorkflow(
      'news-via-import.md',
      '# Title\n' +
        'imports:\n' +
        '  - .github/agents/news-generation.agent.md\n' +
        '  - shared/mcp/news-mcp-servers.md\n' +
        'Call safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(0);
  });

  it('accepts workflows that directly reference both analysis anchors', () => {
    writeWorkflow(
      'news-direct-refs.md',
      '# Title\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n  - shared/mcp/news-mcp-servers.md\n' +
        'See analysis/methodologies/ai-driven-analysis-guide.md and 03-analysis-completeness-gate.md.\n' +
        'Call safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(0);
  });

  it('applies the single-PR rule to news-*-analysis.md', () => {
    writeWorkflow(
      'news-breaking-analysis.md',
      '# Title\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n' +
        'Call safeoutputs___create_pull_request at end.\n' +
        'Call safeoutputs___create_pull_request a second time.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('must appear at most once');
  });

  it('applies the single-PR rule to news-*-article.md', () => {
    writeWorkflow(
      'news-breaking-article.md',
      '# Title\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n' +
        'Call safeoutputs___create_pull_request at end.\n' +
        'Call safeoutputs___create_pull_request a second time.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('must appear at most once');
  });

  it('accepts a news-*-article.md that anchors only the completeness gate (no analysis guide)', () => {
    // Article workflows consume an already-produced analysis folder; they
    // do not run Stage B and therefore are not required to anchor the full
    // Stage-B guide. The completeness-gate anchor (or the shared agent
    // import) is still required so Stage-C hand-off is explicit.
    writeWorkflow(
      'news-breaking-article.md',
      '# Title\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n  - shared/mcp/news-mcp-servers.md\n' +
        'Reads analysis from main; checks 03-analysis-completeness-gate.md result.\n' +
        'Call safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(0);
  });

  it('flags a news-*-article.md that anchors neither agent nor gate', () => {
    writeWorkflow(
      'news-breaking-article.md',
      '# Title\nCall safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('completeness-gate');
  });

  // ── IMF-primary editorial policy ───────────────────────────────────
  // Workflow prompts that describe WB as substitutable for IMF on
  // economic claims are out of policy and must fail lint:prompts.

  it('flags "World Bank or IMF" economic-context phrasing', () => {
    writeWorkflow(
      'news-bad-or-gate.md',
      '# Title\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n' +
        'Economic context (World Bank or IMF) is mandatory.\n' +
        'Call safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('forbidden phrase');
    expect(result.stderr.toLowerCase()).toContain('world bank');
  });

  it('flags "IMF or World Bank" economic-context phrasing', () => {
    writeWorkflow(
      'news-bad-or-gate-reversed.md',
      '# Title\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n' +
        'Economic context citing IMF or World Bank is mandatory.\n' +
        'Call safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('forbidden phrase');
  });

  it('flags "WB/IMF" slash phrasing in an economic-context sentence', () => {
    writeWorkflow(
      'news-bad-slash.md',
      '# Title\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n' +
        'Cite economic context using WB/IMF for every macro claim.\n' +
        'Call safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('forbidden phrase');
  });

  it('still permits the bold-markdown variant "World Bank **or** IMF" detection', () => {
    // The historical bug fixture used the bold-markdown variant in
    // .github/workflows/news-month-in-review.md. The forbidden-phrase
    // regex must catch both plain and bold forms.
    writeWorkflow(
      'news-bad-bold-or-gate.md',
      '# Title\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n' +
        '- Economic context (World Bank **or** IMF) is mandatory.\n' +
        'Call safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('forbidden phrase');
  });

  it('accepts IMF-primary phrasing ("IMF (primary), WB non-economic")', () => {
    writeWorkflow(
      'news-good-imf-primary.md',
      '# Title\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n  - shared/mcp/news-mcp-servers.md\n' +
        'Economic context: IMF is the sole authoritative source. ' +
        'World Bank is for non-economic domains ' +
        '(governance WGI, demographics, defence-spending).\n' +
        'Call safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(0);
  });

  // ── Rule 5: canonical prompt import order ──────────────────────────

  it('flags a workflow missing the canonical import set', () => {
    // Missing shared/mcp/news-mcp-servers.md
    writeWorkflow(
      'news-no-mcp-import.md',
      '# Title\n' +
        'imports:\n  - .github/agents/news-generation.agent.md\n' +
        'Call safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('missing canonical import');
    expect(result.stderr).toContain('news-mcp-servers.md');
  });

  it('flags canonical imports in wrong order', () => {
    writeWorkflow(
      'news-wrong-order.md',
      '# Title\n' +
        'imports:\n' +
        '  - shared/mcp/news-mcp-servers.md\n' +
        '  - .github/agents/news-generation.agent.md\n' +
        'Call safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('out of order');
  });

  it('accepts workflows with both canonical imports in correct order', () => {
    writeWorkflow(
      'news-correct-imports.md',
      '# Title\n' +
        'imports:\n' +
        '  - .github/agents/news-generation.agent.md\n' +
        '  - shared/mcp/news-mcp-servers.md\n' +
        'Call safeoutputs___create_pull_request once.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(0);
  });

  it('exempts news-translate.md from canonical import rule', () => {
    writeWorkflow(
      'news-translate.md',
      '# Title\n' +
        'imports:\n  - shared/mcp/news-mcp-servers.md\n' +
        'Multi-call flush pattern. ' +
        'safeoutputs___create_pull_request at min 14.\n' +
        'safeoutputs___create_pull_request at min 45.\n',
    );
    const result = runLint(tmpDir);
    expect(result.code).toBe(0);
  });
});
