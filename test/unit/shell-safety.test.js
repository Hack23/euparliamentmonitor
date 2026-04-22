// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Drift-guard test: ensure no shell script under `scripts/` contains shell
 * expansion patterns that the agent's shell-safety filter blocks.
 *
 * The filter rejects (see .github/prompts/00-scope-and-ground-rules.md §47
 * and .github/prompts/08-infrastructure.md §177-181):
 *
 *   - Nested parameter expansion — `${var#${other}}`, `${A:-${B:-}}`
 *   - Indirect expansion        — `${!var}`
 *   - Parameter transformation  — `${var@P}` (and @Q @E @A @K @a)
 *   - Nested command substitution — `$(cmd $(inner))`
 *   - Default-with-command-substitution — `${VAR:-$(cmd)}`
 *   - Input redirection inside substitution — `$(cmd < file)`
 *   - `eval`
 *
 * Comments (lines starting with `#`) are skipped since they describe the
 * patterns for readers without invoking them. The check runs on all
 * `scripts/**.sh` files recursively.
 */

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPTS_DIR = path.join(REPO_ROOT, 'scripts');

function listShellScripts(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listShellScripts(full));
    } else if (entry.isFile() && entry.name.endsWith('.sh')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Strip comments and string-literal content that only describes patterns.
 * We keep executable code (anything outside `# …` comment lines) because
 * backtick/quoted text inside a live bash command is still evaluated.
 */
function stripCommentLines(source) {
  return source
    .split('\n')
    .filter((line) => !/^\s*#/u.test(line))
    .join('\n');
}

// Each rule: regex + human description. Regex operates on executable lines.
const RULES = [
  {
    id: 'nested-parameter-expansion',
    description: 'Nested parameter expansion like `${var#${other}}` or `${A:-${B:-}}`',
    regex: /\$\{[^{}]*\$\{/u,
  },
  {
    id: 'indirect-expansion',
    description: 'Indirect expansion `${!var}`',
    regex: /\$\{![A-Za-z_]/u,
  },
  {
    id: 'parameter-transformation',
    description: 'Parameter transformation `${var@P/Q/E/A/K/a}`',
    regex: /\$\{[A-Za-z_][A-Za-z_0-9]*@[PQEAKa]\}/u,
  },
  {
    id: 'nested-command-substitution',
    description: 'Nested command substitution `$(cmd $(inner))`',
    regex: /\$\([^()]*\$\(/u,
  },
  {
    id: 'default-with-command-substitution',
    description: 'Default-with-command-substitution `${VAR:-$(cmd)}`',
    regex: /\$\{[A-Za-z_][A-Za-z_0-9]*:[-=+?]\$\(/u,
  },
  {
    id: 'eval',
    description: 'Use of `eval` builtin',
    regex: /(^|[\s;&|])eval\s/u,
  },
];

describe('shell-safety drift-guard (scripts/**.sh)', () => {
  const scripts = listShellScripts(SCRIPTS_DIR);

  it('finds at least one shell script to check', () => {
    expect(scripts.length).toBeGreaterThan(0);
  });

  for (const script of scripts) {
    const rel = path.relative(REPO_ROOT, script);
    const source = stripCommentLines(fs.readFileSync(script, 'utf8'));

    for (const rule of RULES) {
      it(`${rel} — no ${rule.id}`, () => {
        const match = source.match(rule.regex);
        if (match) {
          const lineNumber = source.slice(0, match.index).split('\n').length;
          throw new Error(
            `${rel}:${lineNumber} — ${rule.description}. ` +
              `Matched: "${match[0]}". ` +
              'See .github/prompts/00-scope-and-ground-rules.md §47 and ' +
              '.github/prompts/08-infrastructure.md §177-181.'
          );
        }
        expect(match).toBeNull();
      });
    }
  }
});
