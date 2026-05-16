// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Drift-guard test for the executive-brief translation contract.
 *
 * The `news-translate.md` workflow is the canonical orchestrator for the
 * scheduled 3×/day translation pipeline. It MUST hold a specific shape so
 * that operators, reviewers, and future agents can reason about it without
 * reading the entire 300-line workflow body.
 *
 * If any assertion here fails, EITHER the workflow has regressed and must be
 * restored, OR the contract has intentionally evolved and this test should
 * be updated together with `analysis/methodologies/executive-brief-translation-guide.md`
 * and `.github/workflows/README.md`'s "Translation cadence" section.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WORKFLOW_FILE = path.join(
  REPO_ROOT,
  '.github',
  'workflows',
  'news-translate.md',
);
const GUIDE_FILE = path.join(
  REPO_ROOT,
  'analysis',
  'methodologies',
  'executive-brief-translation-guide.md',
);
const TEMPLATE_FILE = path.join(
  REPO_ROOT,
  'analysis',
  'templates',
  'executive-brief-translation-template.md',
);
const DISCOVERY_SCRIPT = path.join(
  REPO_ROOT,
  'scripts',
  'discover-untranslated-briefs.js',
);
const VALIDATOR_SCRIPT = path.join(
  REPO_ROOT,
  'scripts',
  'validate-brief-translations.js',
);

describe('news-translate workflow contract', () => {
  let workflow;

  it('workflow file exists and is non-trivial', () => {
    expect(fs.existsSync(WORKFLOW_FILE)).toBe(true);
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    // The new contract is intentionally lean (~300 lines). The drift-guard
    // ensures we never accidentally re-bloat it back to the legacy 1.7K-line
    // HTML-translation behemoth.
    expect(workflow.length).toBeGreaterThan(2000);
    expect(workflow.length).toBeLessThan(40000);
  });

  it('runs 3×/day on cron and is workflow_dispatch-enabled', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/cron:\s*"30 6 \* \* \*"/);
    expect(workflow).toMatch(/cron:\s*"30 12 \* \* \*"/);
    expect(workflow).toMatch(/cron:\s*"30 18 \* \* \*"/);
    expect(workflow).toMatch(/workflow_dispatch:/);
  });

  it('exposes max_briefs / max_age_days / include_extended dispatch inputs', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/\bmax_briefs:/);
    expect(workflow).toMatch(/\bmax_age_days:/);
    expect(workflow).toMatch(/\binclude_extended:/);
  });

  it('keeps the 60-minute hard cap', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/^timeout-minutes:\s*60$/m);
  });

  it('uses claude-sonnet-4.6 as the engine (per approved allow-list)', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/\n  model:\s*claude-sonnet-4\.6\b/);
  });

  it('delegates discovery to scripts/discover-untranslated-briefs.js', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(
      /node scripts\/discover-untranslated-briefs\.js/,
    );
    // The queue is consumed from a deterministic temp path.
    expect(workflow).toMatch(/\/tmp\/gh-aw\/discovery\/queue\.json/);
  });

  it('runs the validator as a post-step against the produced translations', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/node scripts\/validate-brief-translations\.js/);
    expect(workflow).toMatch(/Validate brief translations/);
  });

  it('imports the shared common-settings and MCP-servers configs', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/- shared\/config\/news-common-settings\.md/);
    expect(workflow).toMatch(/- shared\/mcp\/news-mcp-servers\.md/);
  });

  it('declares safe-outputs.threat-detection continue-on-error: true', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(
      /threat-detection:\s*\n\s+continue-on-error:\s+true/,
    );
  });

  it('inlines safe-outputs.max-patch-size (does not propagate via imports)', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    // 4096 KB headroom for catch-up days with max_briefs=4.
    expect(workflow).toMatch(/max-patch-size:\s*4096\b/);
  });

  it('cites the canonical translator guide and template by basename', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toContain('executive-brief-translation-guide.md');
    expect(workflow).toContain('executive-brief-translation-template.md');
  });

  it('bans scripted-substitution shortcuts in the prompt body', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/(scripted dictionary substitution|sed.*awk|No scripted substitution)/i);
  });

  it('keys the PR branch by run date, not by run id', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/news\/translate-briefs-/);
    // Must NOT include ${RUN_ID} in the branch name (legacy regression).
    expect(workflow).not.toMatch(/news\/translate-briefs-\$\{RUN_ID\}/);
  });
});

describe('translation pipeline foundation', () => {
  it('translator guide is committed and non-trivial', () => {
    expect(fs.existsSync(GUIDE_FILE)).toBe(true);
    const guide = fs.readFileSync(GUIDE_FILE, 'utf8');
    expect(guide.length).toBeGreaterThan(5000);
    // Must enumerate FIXED TOKEN preservation rules.
    expect(guide).toContain('IMF');
    expect(guide).toContain('WEO');
    expect(guide).toContain('data-vintage=');
    expect(guide).toMatch(/TA-NN-YYYY-NNNN|TA-\d/);
  });

  it('translation template is committed and references the guide', () => {
    expect(fs.existsSync(TEMPLATE_FILE)).toBe(true);
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
    expect(template).toContain('executive-brief-translation-guide.md');
  });

  it('discovery and validator scripts exist and export their public API', () => {
    expect(fs.existsSync(DISCOVERY_SCRIPT)).toBe(true);
    expect(fs.existsSync(VALIDATOR_SCRIPT)).toBe(true);

    const discovery = fs.readFileSync(DISCOVERY_SCRIPT, 'utf8');
    expect(discovery).toMatch(/export const TARGET_LANGS\b/);
    expect(discovery).toMatch(/export function buildQueue\b/);

    const validator = fs.readFileSync(VALIDATOR_SCRIPT, 'utf8');
    expect(validator).toMatch(/export function validateTranslation\b/);
    expect(validator).toMatch(/export const LENGTH_FLOOR_RATIO\b/);
    expect(validator).toMatch(/export const FIXED_TOKEN_PATTERNS\b/);
  });

  it('package.json wires npm-run-script entries for discovery and validation', () => {
    const pkgPath = path.join(REPO_ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.scripts['discover:untranslated-briefs']).toBe(
      'node scripts/discover-untranslated-briefs.js',
    );
    expect(pkg.scripts['validate:translations']).toBe(
      'node scripts/validate-brief-translations.js',
    );
  });
});
