#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * lint-src-todos.js — Fails CI when `TODO:`, `FIXME:`, or `XXX:`
 * markers appear in `src/**\/*.ts` without a tracking issue link in
 * the canonical `(#NNNN)` form.
 *
 * Why this exists. Architecture splits and SEO follow-ups land via
 * code comments that say "deferred to follow-up". When those comments
 * lose their tracking issue we forget the work. This script makes the
 * issue link compulsory: every long-lived comment marker must be
 * grep-traceable back to a ticket.
 *
 * Allowed forms (each must include a GitHub issue number):
 *   - `TODO(#1988): defer X to follow-up PR`
 *   - `FIXME(#42): coerce Y to UTC before compare`
 *   - `XXX(#7): legacy compat — remove after 2027-Q1`
 *
 * Rejected forms (require a tracking issue, fail CI):
 *   - `TODO: defer X` — no `(#NNNN)` issue link
 *   - `FIXME handle null case` — no `(#NNNN)` issue link
 *   - `XXX(legacy)` — parenthetical present but not the `(#NNNN)` form
 *
 * Scope. Only the upper-case spellings `TODO`, `FIXME`, and `XXX`
 * followed by `:`, `(`, or whitespace are matched. Lower-case forms
 * like `// fixme later` and identifiers like `todoList` are *not*
 * flagged — they generate too many false positives across the
 * codebase and aren't the editorial markers this guard is targeting.
 *
 * Exit codes:
 *   0 — no marker, or every marker carries `(#NNNN)`
 *   1 — at least one marker is missing an issue link
 *
 * Usage:
 *   node scripts/lint-src-todos.js
 *   npm run lint:src-todos
 *
 * Allowlist:
 *   Genuine regex/string literals that *contain* `TODO:` must be
 *   exempt — see `LITERAL_ALLOWLIST` below. Keep the list short and
 *   each entry must include the file + the literal's purpose.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));

// Allowlist: regex literals or string constants that *contain* TODO/FIXME
// markers but are not themselves tracked items. Keep one-line, file-scoped.
const LITERAL_ALLOWLIST = new Set([
  'workflows/completeness-gate/constants.ts',
]);

// Match the markers when followed by a colon. Capture the surrounding
// content so the error message can include line context.
const MARKER_RE = /\b(TODO|FIXME|XXX)\b\s*(?:\(#(\d+)\))?\s*[:( ]/g;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (full.endsWith('.ts')) out.push(full);
  }
  return out;
}

export function findOffenders(files = walk(SRC)) {
  const offenders = [];
  for (const file of files) {
    const rel = file.slice(SRC.length).replaceAll('\\', '/');
    if (LITERAL_ALLOWLIST.has(rel)) continue;
    const src = readFileSync(file, 'utf8');
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Re-anchor each iteration so /g state doesn't leak between lines.
      const re = new RegExp(MARKER_RE.source, 'g');
      let m;
      while ((m = re.exec(line))) {
        const marker = m[1];
        const issueNumber = m[2];
        if (!issueNumber) {
          offenders.push({
            file: rel,
            line: i + 1,
            marker,
            text: line.trim(),
          });
        }
      }
    }
  }
  return offenders;
}

function main() {
  const offenders = findOffenders();
  if (offenders.length === 0) {
    console.log('✅ lint-src-todos: every TODO/FIXME/XXX carries a (#NNNN) issue link');
    return 0;
  }
  console.error(
    `❌ lint-src-todos: ${offenders.length} marker(s) missing a (#NNNN) issue link:`
  );
  for (const o of offenders) {
    console.error(`  ${o.file}:${o.line}  ${o.marker}: ${o.text}`);
  }
  console.error(
    '\nAdd a tracking issue and rewrite the marker as `TODO(#NNNN): …` or remove it.'
  );
  return 1;
}

// Run as CLI only when invoked directly.
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  process.exit(main());
}
