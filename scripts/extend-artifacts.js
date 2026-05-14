#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module scripts/extend-artifacts
 * @description Batch artifact-extension helper for Stage B analysis runs.
 *
 * The check-then-extend pattern (write short stub → wc -l check → cat >> extend)
 * wastes 2+ LLM invocations per artifact. This script processes a batch of
 * artifact extensions in a single Node.js execution, eliminating the per-
 * artifact shell-heredoc overhead that costs ~38 invocations per run.
 *
 * Each spec entry can:
 *   - `append`  — append content to an existing file (or create it)
 *   - `create`  — create a new file (fails if it exists unless `overwrite: true`)
 *   - `prepend` — prepend content to an existing file
 *
 * The spec is read from a JSON file (--spec-file) or from stdin (--stdin).
 *
 * Input spec schema (JSON array):
 *   [
 *     {
 *       "path": "relative/or/absolute/path.md",   // required
 *       "content": "Text to write",               // required
 *       "mode": "append" | "create" | "prepend",  // optional, default: "append"
 *       "overwrite": false                        // optional, default: false
 *     },
 *     ...
 *   ]
 *
 * Output: JSON summary on stdout listing each file written, line counts, and
 *   any errors. Exits 0 when all specs were applied; exits 1 if any failed.
 *
 * Invocation:
 *   node scripts/extend-artifacts.js --spec-file /path/to/spec.json \
 *     [--base-dir analysis/daily/2026-05-14/breaking] \
 *     [--dry-run]
 *
 *   cat spec.json | node scripts/extend-artifacts.js --stdin \
 *     [--base-dir analysis/daily/2026-05-14/breaking]
 *
 * Exports (for unit testing):
 *   extendArtifact(spec, baseDir)
 *   extendArtifacts(specs, baseDir, dryRun)
 *   resolveArtifactPath(specPath, baseDir)
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a spec path against an optional base directory.
 *
 * Absolute paths are used as-is. Relative paths are joined with `baseDir`
 * (if provided) or resolved against `process.cwd()`.
 *
 * @param {string} specPath - Path from the spec entry
 * @param {string} [baseDir] - Optional base directory override
 * @returns {string} Resolved absolute path
 */
export function resolveArtifactPath(specPath, baseDir) {
  if (path.isAbsolute(specPath)) return specPath;
  const base = baseDir ?? process.cwd();
  return path.resolve(base, specPath);
}

// ---------------------------------------------------------------------------
// Single-artifact extension
// ---------------------------------------------------------------------------

/**
 * Apply a single spec entry (extend/create/prepend one artifact file).
 *
 * @param {{
 *   path: string,
 *   content: string,
 *   mode?: 'append'|'create'|'prepend',
 *   overwrite?: boolean
 * }} spec
 * @param {string} [baseDir]
 * @param {boolean} [dryRun]
 * @returns {{
 *   path: string,
 *   resolvedPath: string,
 *   mode: string,
 *   ok: boolean,
 *   linesBefore: number,
 *   linesAfter: number,
 *   bytesWritten: number,
 *   error?: string
 * }}
 */
export function extendArtifact(spec, baseDir, dryRun = false) {
  if (!spec || typeof spec.path !== 'string' || typeof spec.content !== 'string') {
    return {
      path: spec?.path ?? '(missing)',
      resolvedPath: '',
      mode: 'unknown',
      ok: false,
      linesBefore: 0,
      linesAfter: 0,
      bytesWritten: 0,
      error: 'Invalid spec: path and content are required strings',
    };
  }

  const resolvedPath = resolveArtifactPath(spec.path, baseDir);
  const mode = spec.mode ?? 'append';
  const overwrite = spec.overwrite ?? false;

  // --- pre-flight ---
  let linesBefore = 0;
  let existingContent = '';

  if (fs.existsSync(resolvedPath)) {
    existingContent = fs.readFileSync(resolvedPath, 'utf8');
    linesBefore = existingContent.split('\n').length;

    if (mode === 'create' && !overwrite) {
      return {
        path: spec.path,
        resolvedPath,
        mode,
        ok: false,
        linesBefore,
        linesAfter: linesBefore,
        bytesWritten: 0,
        error: `File already exists and overwrite=false: ${resolvedPath}`,
      };
    }
  }

  // --- compute new content ---
  let newContent;
  if (mode === 'prepend') {
    // Ensure a newline separator between prepended content and existing content.
    const needsNewline = spec.content.length > 0 && !spec.content.endsWith('\n') && existingContent.length > 0;
    newContent = spec.content + (needsNewline ? '\n' : '') + existingContent;
  } else if (mode === 'create' || !fs.existsSync(resolvedPath)) {
    newContent = spec.content;
  } else {
    // append
    const needsNewline = existingContent.length > 0 && !existingContent.endsWith('\n');
    newContent = existingContent + (needsNewline ? '\n' : '') + spec.content;
  }

  const linesAfter = newContent.split('\n').length;
  const bytesWritten = Buffer.byteLength(newContent, 'utf8');

  if (!dryRun) {
    try {
      fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
      fs.writeFileSync(resolvedPath, newContent, 'utf8');
    } catch (err) {
      return {
        path: spec.path,
        resolvedPath,
        mode,
        ok: false,
        linesBefore,
        linesAfter: linesBefore,
        bytesWritten: 0,
        error: String(err),
      };
    }
  }

  return {
    path: spec.path,
    resolvedPath,
    mode,
    ok: true,
    linesBefore,
    linesAfter,
    bytesWritten,
  };
}

// ---------------------------------------------------------------------------
// Batch runner
// ---------------------------------------------------------------------------

/**
 * Apply a batch of spec entries and return a summary.
 *
 * @param {object[]} specs  - Array of spec entries
 * @param {string} [baseDir] - Optional base directory for relative paths
 * @param {boolean} [dryRun] - When true, validate but do not write files
 * @returns {{
 *   totalSpecs: number,
 *   succeeded: number,
 *   failed: number,
 *   results: object[],
 *   ok: boolean
 * }}
 */
export function extendArtifacts(specs, baseDir, dryRun = false) {
  if (!Array.isArray(specs)) {
    return {
      totalSpecs: 0,
      succeeded: 0,
      failed: 1,
      results: [{ ok: false, error: 'specs must be a JSON array' }],
      ok: false,
    };
  }

  const results = specs.map((spec) => extendArtifact(spec, baseDir, dryRun));
  const succeeded = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  return {
    totalSpecs: specs.length,
    succeeded,
    failed,
    results,
    ok: failed === 0,
  };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

/**
 * Parse minimalist `--key value` CLI args.
 *
 * @param {string[]} argv
 * @returns {Record<string, string|boolean>}
 */
/* c8 ignore start */
function parseArgs(argv) {
  const out = {};
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        out[key] = true;
        i += 1;
      } else {
        out[key] = next;
        i += 2;
      }
    } else {
      i += 1;
    }
  }
  return out;
}

/**
 * CLI main entry point.
 *
 * @param {string[]} [argv]
 * @returns {Promise<void>}
 */
export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  if (!args['spec-file'] && !args.stdin) {
    process.stderr.write(
      'Usage: node scripts/extend-artifacts.js --spec-file <path> [--base-dir <dir>] [--dry-run]\n' +
        '       cat spec.json | node scripts/extend-artifacts.js --stdin [--base-dir <dir>]\n',
    );
    process.exit(2);
  }

  const baseDir = args['base-dir'] ? String(args['base-dir']) : undefined;
  const dryRun = args['dry-run'] === true;

  let specs;
  try {
    let raw;
    if (args['spec-file']) {
      raw = fs.readFileSync(String(args['spec-file']), 'utf8');
    } else {
      // Read from stdin
      const chunks = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
      raw = Buffer.concat(chunks).toString('utf8');
    }
    specs = JSON.parse(raw);
  } catch (err) {
    process.stderr.write(`Error reading/parsing spec: ${err}\n`);
    process.exit(1);
  }

  const summary = extendArtifacts(specs, baseDir, dryRun);

  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');

  if (!summary.ok) {
    process.exit(1);
  }
}

// Standard ESM CLI guard
const isMain =
  typeof process !== 'undefined' &&
  process.argv[1] !== undefined &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/extend-artifacts.js'));

if (isMain) {
  main().catch((err) => {
    process.stderr.write(`Fatal: ${err}\n`);
    process.exit(1);
  });
}
/* c8 ignore stop */
