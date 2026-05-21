// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Drift-guard: assert that no TypeScript source file under `src/` exceeds
 * the 600-line acceptance gate established by the Refactor 8/8 series
 * (#2029–#2036).
 *
 * Line counting uses raw `wc -l` semantics (total newline-separated lines,
 * including blank and comment lines) to match the acceptance gate used
 * throughout the refactor series. This is intentionally stricter than the
 * ESLint `max-lines` rule (which excludes blank and comment lines) — a file
 * that passes ESLint but regresses in raw LOC can still be caught here.
 *
 * **No allowlist is accepted.** If a file fails this test it must be split.
 * The test prints a sorted offender table on failure so CI immediately shows
 * which files need action.
 *
 * Compliance references:
 * - ISO 27001 A.8.28 / A.8.32 (change management — drift prevention)
 * - NIST CSF 2.0 PR.PS-01 (baseline configuration control)
 * - CIS Controls v8.1 § 16 (application software security)
 */

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC_DIR = path.join(REPO_ROOT, 'src');

/** Maximum raw lines permitted in any single `src/**&#47;*.ts` file. */
const MAX_RAW_LINES = 600;

/**
 * Recursively walk a directory and collect all `.ts` file paths.
 *
 * @param {string} dir - Directory to walk.
 * @returns {string[]} Absolute paths to every `.ts` file found.
 */
function walkTypeScriptFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkTypeScriptFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results;
}

describe('source-file-size drift-guard (src/**/*.ts ≤ 600 raw lines)', () => {
  const tsFiles = walkTypeScriptFiles(SRC_DIR);

  it('finds TypeScript source files to check', () => {
    expect(tsFiles.length).toBeGreaterThan(0);
  });

  it('no src/**/*.ts file exceeds 600 raw lines', () => {
    const offenders = [];

    for (const filePath of tsFiles) {
      const source = fs.readFileSync(filePath, 'utf8');
      // Count raw lines using exact `wc -l` semantics: the number of newline
      // characters in the file.  For "a\nb" (no trailing newline) wc -l
      // reports 1; for "a\nb\n" it reports 2; for an empty file it reports 0.
      // Counting the '\n' matches in the source string replicates this exactly
      // without needing to special-case the trailing-newline condition.
      const rawLineCount = (source.match(/\n/g) ?? []).length;

      if (rawLineCount > MAX_RAW_LINES) {
        offenders.push({ rel: path.relative(REPO_ROOT, filePath), lines: rawLineCount });
      }
    }

    if (offenders.length > 0) {
      // Sort descending by line count for easy triage.
      offenders.sort((a, b) => b.lines - a.lines);
      const table = offenders
        .map((o) => `  ${o.lines.toString().padStart(4)} lines  ${o.rel}`)
        .join('\n');
      throw new Error(
        `${offenders.length} file(s) in src/ exceed ${MAX_RAW_LINES} raw lines ` +
          `(split each into focused sub-modules):\n\n${table}\n`,
      );
    }

    expect(offenders).toEqual([]);
  });
});
