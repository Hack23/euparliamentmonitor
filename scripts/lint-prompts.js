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
 *   1. `safeoutputs___create_pull_request` appears AT MOST ONCE. This applies
 *      uniformly to every news-*.md in the split-workflow family:
 *        - `news-<type>-analysis.md` → one analysis-only PR.
 *        - `news-<type>-article.md`  → one article PR.
 *        - Legacy monolithic `news-<type>.md` (pre-split) → one PR.
 *      `news-translate.md` is exempt.
 *   2. No forbidden phrases (case-insensitive): "checkpoint pr", "checkpoint-pr",
 *      "keep-alive", "keepalive", "keep alive", "heartbeat",
 *      "progressive safe output".
 *   3. No `safeoutputs___push_repo_memory` references.
 *   4. Analysis-awareness: news-*.md must either directly reference
 *      `analysis/methodologies/ai-driven-analysis-guide.md` and
 *      `03-analysis-completeness-gate.md`, OR import
 *      `.github/agents/news-generation.agent.md` (which provides both).
 *      `news-translate.md` is exempt.  `news-*-article.md` files are exempt
 *      from the *analysis-anchor* portion of this rule because they consume
 *      an already-produced analysis folder rather than producing Stage B
 *      artifacts themselves — they still must import the agent or reference
 *      the completeness-gate anchor so Stage-C hand-off remains explicit.
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
// news-translate does not need the analysis chain (it is a translation-only
// flush pattern with no Stage B/C/D analysis).
const EXEMPT_FROM_ANALYSIS_AWARENESS = new Set(['news-translate.md']);

// Workflows either reference these anchors directly, OR import the shared
// news-generation agent which brings them in transitively.
const ANALYSIS_ANCHOR_GUIDE = 'analysis/methodologies/ai-driven-analysis-guide.md';
const ANALYSIS_ANCHOR_GATE = '03-analysis-completeness-gate.md';
const NEWS_GENERATION_IMPORT = '.github/agents/news-generation.agent.md';

const FORBIDDEN_PHRASES = [
  /\bcheckpoint\s+pr\b/i,
  /\bcheckpoint-pr\b/i,
  /\bkeep-alive\b/i,
  /\bkeepalive\b(?!-interval)/i,
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

  // Rule 4: analysis-awareness.
  // Each news-*.md (except news-translate) must either directly reference the
  // analysis anchors or import the shared news-generation agent which carries
  // them transitively. This prevents a workflow from drifting out of the
  // Data → Analysis Artifacts → Completeness Gate → Article → PR chain.
  //
  // Refinement for split-workflow families:
  //   - `news-<type>-article.md` consumes analysis artifacts produced by the
  //     paired `news-<type>-analysis.md` workflow and does NOT run Stage B
  //     itself. It is still required to anchor the hand-off, so either the
  //     news-generation agent import OR a direct completeness-gate reference
  //     is accepted; the full Stage-B guide anchor is NOT required for it.
  if (!EXEMPT_FROM_ANALYSIS_AWARENESS.has(fileName)) {
    const isArticleWorkflow = /^news-[a-z0-9-]+-article\.md$/u.test(fileName);
    const importsNewsGen = content.includes(NEWS_GENERATION_IMPORT);
    const refsGuide = content.includes(ANALYSIS_ANCHOR_GUIDE);
    const refsGate = content.includes(ANALYSIS_ANCHOR_GATE);
    if (!importsNewsGen) {
      if (!isArticleWorkflow && !refsGuide) {
        violations.push(
          `missing analysis-awareness anchor: must either import '${NEWS_GENERATION_IMPORT}' or reference '${ANALYSIS_ANCHOR_GUIDE}'. See .github/prompts/README.md § Analysis Artifact Integration.`,
        );
      }
      if (!refsGate) {
        violations.push(
          `missing completeness-gate anchor: must either import '${NEWS_GENERATION_IMPORT}' or reference '${ANALYSIS_ANCHOR_GATE}'. See .github/prompts/README.md § Analysis Artifact Integration.`,
        );
      }
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
