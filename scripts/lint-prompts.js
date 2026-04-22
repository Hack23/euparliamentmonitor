#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Agentic-workflow prompt linter.
 *
 * Enforces the single-PR rule and forbidden-phrase list across every
 * `.github/workflows/news-*.md` gh-aw workflow.
 *
 * Exceptions:
 *   - `news-translate.md` uses a legitimate multi-call flush pattern and is
 *     fully exempt from all three rules.
 *
 * Rules (applied per workflow file):
 *   1. `safeoutputs___create_pull_request` appears AT MOST ONCE.
 *   2. No forbidden phrases (case-insensitive): "checkpoint pr", "checkpoint-pr",
 *      "keep-alive", "keepalive", "keep alive", "heartbeat",
 *      "progressive safe output".
 *   3. No `safeoutputs___push_repo_memory` references.
 *
 * Usage:
 *   node scripts/lint-prompts.js
 *   node scripts/lint-prompts.js --workflows-dir .github/workflows
 *
 * Exit 0 if clean; non-zero with violations listed on stderr otherwise.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();

const DEFAULT_DIR = path.join('.github', 'workflows');

const ARGS = process.argv.slice(2);
const dirIdx = ARGS.indexOf('--workflows-dir');
const WORKFLOWS_DIR = dirIdx !== -1 && ARGS[dirIdx + 1]
  ? ARGS[dirIdx + 1]
  : DEFAULT_DIR;

const ABS_DIR = path.resolve(ROOT, WORKFLOWS_DIR);

const EXEMPT_FROM_SINGLE_PR = new Set(['news-translate.md']);
const EXEMPT_FROM_PUSH_MEMORY = new Set(['news-translate.md']);
// news-translate legitimately describes its own multi-call flush cadence, so it
// is allowed to reference "checkpoint", "keep-alive", "heartbeat" etc. in
// documentation form. The single-PR rule does not apply to it.
const EXEMPT_FROM_PHRASE_CHECK = new Set(['news-translate.md']);

const FORBIDDEN_PHRASES = [
  /\bcheckpoint\s+pr\b/i,
  /\bcheckpoint-pr\b/i,
  /\bkeep-alive\b/i,
  /\bkeepalive\b/i,
  /\bkeep\s+alive\b/i,
  /\bheartbeat\b/i,
  /\bprogressive\s+safe\s+output\b/i,
];

function collectWorkflowFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.startsWith('news-') && name.endsWith('.md'))
    .sort();
}

function countOccurrences(text, needle) {
  if (!needle) return 0;
  let count = 0;
  let idx = text.indexOf(needle);
  while (idx !== -1) {
    count += 1;
    idx = text.indexOf(needle, idx + needle.length);
  }
  return count;
}

function lintFile(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];

  // Rule 1: at most one safeoutputs___create_pull_request reference.
  if (!EXEMPT_FROM_SINGLE_PR.has(fileName)) {
    const prCount = countOccurrences(content, 'safeoutputs___create_pull_request');
    if (prCount > 1) {
      violations.push(
        `references 'safeoutputs___create_pull_request' ${prCount} times — must appear at most once (single-PR rule). See .github/prompts/06-pr-and-safe-outputs.md`,
      );
    }
  }

  // Rule 2: forbidden phrases.
  if (!EXEMPT_FROM_PHRASE_CHECK.has(fileName)) {
    for (const pattern of FORBIDDEN_PHRASES) {
      const match = content.match(pattern);
      if (match) {
        // Only record the first hit per pattern to keep output concise.
        const lineNumber = content.slice(0, match.index).split('\n').length;
        violations.push(
          `line ${lineNumber}: forbidden phrase ${JSON.stringify(match[0])} matched by ${pattern.toString()} — banned by single-PR rule. See .github/prompts/06-pr-and-safe-outputs.md`,
        );
      }
    }
  }

  // Rule 3: no safeoutputs___push_repo_memory outside news-translate.md.
  if (!EXEMPT_FROM_PUSH_MEMORY.has(fileName)) {
    if (content.includes('safeoutputs___push_repo_memory')) {
      const idx = content.indexOf('safeoutputs___push_repo_memory');
      const lineNumber = content.slice(0, idx).split('\n').length;
      violations.push(
        `line ${lineNumber}: 'safeoutputs___push_repo_memory' is banned (heartbeat pattern). Remove the reference.`,
      );
    }
  }

  return violations;
}

function main() {
  const files = collectWorkflowFiles(ABS_DIR);
  if (files.length === 0) {
    console.error(`lint-prompts: no news-*.md workflows found in ${ABS_DIR}`);
    process.exit(2);
  }

  let totalViolations = 0;
  let filesWithViolations = 0;
  const report = [];
  for (const fileName of files) {
    const filePath = path.join(ABS_DIR, fileName);
    const violations = lintFile(filePath, fileName);
    if (violations.length > 0) {
      totalViolations += violations.length;
      filesWithViolations += 1;
      report.push(`\n❌ ${fileName}`);
      for (const v of violations) {
        report.push(`   - ${v}`);
      }
    }
  }

  if (totalViolations === 0) {
    console.log(`lint-prompts: ✅ ${files.length} workflow(s) checked, 0 violations`);
    process.exit(0);
  }

  console.error(
    `lint-prompts: ❌ ${totalViolations} violation(s) across ${filesWithViolations} file(s)`,
  );
  for (const line of report) {
    console.error(line);
  }
  console.error('');
  console.error('Fix: see .github/prompts/06-pr-and-safe-outputs.md — the single-PR rule.');
  process.exit(1);
}

main();
