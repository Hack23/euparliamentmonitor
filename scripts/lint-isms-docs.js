#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * ISMS documentation drift-guard linter.
 *
 * Validates that the repository's ISMS-required Markdown documents stay
 * consistent with the running system. Modeled on `scripts/lint-prompts.js`.
 *
 * Rules:
 *   1. Every current-state ISMS doc must reference at least one
 *      ISMS-PUBLIC URL (`https://github.com/Hack23/ISMS-PUBLIC/...`).
 *   2. No ISMS doc may reference removed legacy workflow files
 *      (`news-article-generator.md`, `news-<type>-analysis.md`,
 *      `news-<type>-article.md`, `news-weekly-review-analysis.md`,
 *      `news-monthly-review-analysis.md`).
 *   3. No ISMS doc may reference removed `src/aggregator/legacy-*` paths.
 *   4. Every article slug in `src/config/article-horizons.ts`
 *      (excluding `deep-analysis`) must appear at least once in
 *      `WORKFLOWS.md` AND `ARCHITECTURE.md`.
 *   5. The version badge value in `ARCHITECTURE.md`, `WORKFLOWS.md`, and
 *      `SECURITY_ARCHITECTURE.md` must equal `package.json` `version`.
 *
 * Usage:
 *   node scripts/lint-isms-docs.js
 *
 * Exit codes:
 *   0 — clean
 *   1 — violations found
 *   2 — required input file missing
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();

const CURRENT_STATE_DOCS = [
  'ARCHITECTURE.md',
  'DATA_MODEL.md',
  'FLOWCHART.md',
  'STATEDIAGRAM.md',
  'MINDMAP.md',
  'SWOT.md',
  'SECURITY_ARCHITECTURE.md',
  'THREAT_MODEL.md',
  'WORKFLOWS.md',
  'BCPPlan.md',
  'FinancialSecurityPlan.md',
  'End-of-Life-Strategy.md',
  'CRA-ASSESSMENT.md',
  'CLASSIFICATION.md',
  'docs/isms-doc-index.md',
];

const VERSION_BADGE_DOCS = [
  'ARCHITECTURE.md',
  'WORKFLOWS.md',
  'SECURITY_ARCHITECTURE.md',
];

const ISMS_PUBLIC_URL_RE = /https:\/\/github\.com\/Hack23\/ISMS-PUBLIC\/blob\/main\//;

const REMOVED_WORKFLOW_PATTERNS = [
  /news-article-generator\.md/,
  /news-[a-z-]+-analysis\.md/,
  /news-[a-z-]+-article\.md/,
];

const REMOVED_PATH_PATTERNS = [
  /scripts\/aggregator\/legacy-/,
  /src\/aggregator\/legacy-/,
];

function readFileOrFail(relPath) {
  const abs = path.resolve(ROOT, relPath);
  if (!fs.existsSync(abs)) {
    console.error(`[lint-isms-docs] missing required file: ${relPath}`);
    process.exit(2);
  }
  return fs.readFileSync(abs, 'utf8');
}

function extractSlugs() {
  const src = readFileOrFail('src/config/article-horizons.ts');
  const slugRe = /^\s*slug:\s*'([a-z][a-z0-9-]*)'/gm;
  const slugs = [];
  let m;
  while ((m = slugRe.exec(src)) !== null) {
    slugs.push(m[1]);
  }
  // `deep-analysis` is an internal-only slug — not a workflow.
  return slugs.filter((s) => s !== 'deep-analysis');
}

function extractPackageVersion() {
  const pkg = JSON.parse(readFileOrFail('package.json'));
  if (typeof pkg.version !== 'string') {
    console.error('[lint-isms-docs] package.json has no version field');
    process.exit(2);
  }
  return pkg.version;
}

function lintIsmsPublicReference(doc, content) {
  if (!ISMS_PUBLIC_URL_RE.test(content)) {
    return [`${doc}: no reference to any ISMS-PUBLIC policy URL`];
  }
  return [];
}

function lintRemovedReferences(doc, content) {
  const violations = [];
  // Strip self-references — the lint script's own description and the
  // delta audit / index legitimately enumerate retired workflow filenames
  // for documentation purposes.
  if (doc === 'docs/isms-doc-delta-2026-05.md' || doc === 'docs/isms-doc-index.md') {
    return [];
  }
  for (const re of REMOVED_WORKFLOW_PATTERNS) {
    const matches = content.match(new RegExp(re.source, 'g'));
    if (!matches) continue;
    // Filter out hits inside backticked legacy-history call-outs that
    // explicitly say "legacy" or "removed" or "deleted" within 60 chars.
    const lines = content.split('\n');
    for (const line of lines) {
      if (!re.test(line)) continue;
      if (/legacy|removed|deleted|retired|pre-split|historical/i.test(line)) continue;
      violations.push(`${doc}: references removed workflow file — "${line.trim().slice(0, 140)}"`);
    }
  }
  for (const re of REMOVED_PATH_PATTERNS) {
    if (re.test(content)) {
      violations.push(`${doc}: references removed legacy path matching ${re}`);
    }
  }
  return violations;
}

function lintSlugCoverage(slugs) {
  const violations = [];
  for (const target of ['WORKFLOWS.md', 'ARCHITECTURE.md']) {
    const content = readFileOrFail(target);
    for (const slug of slugs) {
      const slugRe = new RegExp(`\\b${slug.replace(/-/g, '[- ]')}\\b`, 'i');
      if (!slugRe.test(content)) {
        violations.push(`${target}: missing reference to article slug "${slug}"`);
      }
    }
  }
  return violations;
}

function lintVersionBadge(version) {
  const violations = [];
  const versionToken = `v${version}`;
  for (const doc of VERSION_BADGE_DOCS) {
    const content = readFileOrFail(doc);
    const header = content.split('\n').slice(0, 80).join('\n');
    if (!header.includes(versionToken)) {
      violations.push(`${doc}: header does not mention package.json release ${versionToken}`);
    }
  }
  return violations;
}

function main() {
  const slugs = extractSlugs();
  const version = extractPackageVersion();
  const violations = [];

  for (const doc of CURRENT_STATE_DOCS) {
    const content = readFileOrFail(doc);
    violations.push(...lintIsmsPublicReference(doc, content));
    violations.push(...lintRemovedReferences(doc, content));
  }

  violations.push(...lintSlugCoverage(slugs));
  violations.push(...lintVersionBadge(version));

  if (violations.length === 0) {
    console.log(
      `[lint-isms-docs] OK — ${CURRENT_STATE_DOCS.length} docs, ${slugs.length} slugs, package.json v${version}`,
    );
    process.exit(0);
  }

  console.error(`[lint-isms-docs] ${violations.length} violation(s):`);
  for (const v of violations) {
    console.error(`  - ${v}`);
  }
  process.exit(1);
}

main();
