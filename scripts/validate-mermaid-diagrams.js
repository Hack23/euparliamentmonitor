// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module ValidateMermaidDiagrams
 * @description
 * Systematic validator for every fenced ```mermaid block under one or
 * more roots (default `analysis/`). Extracts each block, runs the real
 * Mermaid v11 parser against it (via happy-dom) and reports broken
 * diagrams with file, line, diagram type and a one-line error message.
 *
 * Designed to be deterministic, side-effect free, and fast enough to
 * run as a Vitest gate and an `npm` script:
 *
 *   node scripts/validate-mermaid-diagrams.js                # default: analysis/
 *   node scripts/validate-mermaid-diagrams.js path/to/dir    # custom root
 *   node scripts/validate-mermaid-diagrams.js --json         # JSON output
 *   node scripts/validate-mermaid-diagrams.js --quiet        # exit-code only
 *   node scripts/validate-mermaid-diagrams.js --limit 50     # cap files
 *
 * Exit code: 0 = all blocks parse, 1 = one or more blocks failed.
 *
 * The extractor mirrors the markdown-it fence rules used by the
 * aggregator pipeline (triple-backtick or triple-tilde fences of any
 * length ≥ 3, with a `mermaid` info string). Init directives (`%%{ … }%%`)
 * are intentionally **not** stripped because the canonical universal init
 * block is part of every valid diagram in this corpus.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const FENCE_OPEN = /^(\s*)(`{3,}|~{3,})\s*mermaid\s*$/i;

/**
 * Recursively walk a directory and collect every `.md` file (lexically
 * sorted at each level so the output is deterministic).
 *
 * @param {string} dir   Absolute or relative directory path
 * @param {string[]} out Accumulator (caller-owned)
 * @returns {Promise<string[]>}
 */
async function walkMarkdownFiles(dir, out) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (e) {
    if (e.code === 'ENOENT') return out;
    throw e;
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      await walkMarkdownFiles(p, out);
    } else if (e.isFile() && p.endsWith('.md')) {
      out.push(p);
    }
  }
  return out;
}

/**
 * Detect the diagram type declared by the first non-blank, non-comment,
 * non-init-directive line of a mermaid block. Returns `unknown` when no
 * recognised opener is found.
 *
 * @param {string} body Raw mermaid block body (no fences)
 * @returns {string}
 */
export function detectDiagramType(body) {
  const lines = body.split('\n');
  let inInitDirective = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') continue;
    if (inInitDirective) {
      if (line.endsWith('}}%%')) inInitDirective = false;
      continue;
    }
    if (line.startsWith('%%{')) {
      if (!line.endsWith('}}%%')) inInitDirective = true;
      continue;
    }
    if (line.startsWith('%%')) continue;
    // First content line — extract the diagram keyword.
    const m = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\b/);
    return m ? m[1] : 'unknown';
  }
  return 'unknown';
}

/**
 * Extract every ```mermaid fenced block from a Markdown document.
 *
 * Tracks the opening fence's character (` or ~) and length so an
 * inner fence using a different character or shorter length does not
 * prematurely terminate the block (matching CommonMark fence rules).
 *
 * @param {string} text Markdown source
 * @returns {{ startLine: number, body: string }[]}
 *   `startLine` is 1-based, pointing at the opening fence line itself.
 */
export function extractMermaidBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  const skipRe = /<!--\s*mermaid:skip\b[^>]*-->/i;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const m = line.match(FENCE_OPEN);
    if (m) {
      // Look back over blank lines to find a skip directive directly
      // preceding the fence (`<!-- mermaid:skip [reason] -->`).
      let skipped = false;
      for (let j = i - 1; j >= 0; j--) {
        const prev = (lines[j] ?? '').trim();
        if (prev === '') continue;
        if (skipRe.test(prev)) skipped = true;
        break;
      }
      const fence = m[2];
      const char = fence[0];
      const minLen = fence.length;
      const closeRe = new RegExp(`^\\s*${char === '`' ? '`' : '~'}{${minLen},}\\s*$`);
      const startLine = i + 1;
      i++;
      const buf = [];
      while (i < lines.length) {
        if (closeRe.test(lines[i] ?? '')) break;
        buf.push(lines[i] ?? '');
        i++;
      }
      if (!skipped) blocks.push({ startLine, body: buf.join('\n') });
    }
    i++;
  }
  return blocks;
}

let mermaidPromise = null;
/**
 * Lazily install the happy-dom globals required by the Mermaid client
 * library and return a memoised, initialised `mermaid` instance.
 *
 * Mermaid expects browser globals (`document`, `DOMParser`,
 * `XMLSerializer`, `Element.getBoundingClientRect`) even for `parse()`
 * which only validates the source — happy-dom is sufficient and
 * already a project dependency.
 *
 * @returns {Promise<import('mermaid').default>}
 */
async function loadMermaid() {
  if (mermaidPromise) return mermaidPromise;
  mermaidPromise = (async () => {
    const { Window } = await import('happy-dom');
    const win = new Window();
    // Only install if not already present so this stays idempotent
    // when run from inside Vitest (which provides its own DOM).
    if (typeof globalThis.window === 'undefined') globalThis.window = win;
    if (typeof globalThis.document === 'undefined') globalThis.document = win.document;
    if (typeof globalThis.DOMParser === 'undefined') globalThis.DOMParser = win.DOMParser;
    if (typeof globalThis.XMLSerializer === 'undefined') globalThis.XMLSerializer = win.XMLSerializer;
    if (typeof globalThis.HTMLElement === 'undefined') globalThis.HTMLElement = win.HTMLElement;
    if (typeof globalThis.SVGElement === 'undefined') globalThis.SVGElement = win.SVGElement;
    const mermaid = (await import('mermaid')).default;
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', suppressErrorRendering: true });
    return mermaid;
  })();
  return mermaidPromise;
}

/**
 * Parse one mermaid block. Returns `{ ok: true }` on success or
 * `{ ok: false, error }` with a single-line message and the detected
 * diagram type.
 *
 * @param {string} body  Mermaid block body (no fences)
 * @param {import('mermaid').default} mermaid Pre-loaded mermaid instance
 * @returns {Promise<{ ok: true, diagramType: string } | { ok: false, diagramType: string, error: string }>}
 */
export async function validateBlock(body, mermaid) {
  const diagramType = detectDiagramType(body);
  try {
    await mermaid.parse(body);
    return { ok: true, diagramType };
  } catch (e) {
    const msg = (e && e.message) ? String(e.message) : String(e);
    return { ok: false, diagramType, error: msg.split('\n')[0].slice(0, 240) };
  }
}

/**
 * Validate every mermaid block under one or more roots.
 *
 * @param {object} opts
 * @param {string[]} opts.roots  Directory roots (default `['analysis']`)
 * @param {number}   [opts.limit] Stop after this many files (debugging)
 * @returns {Promise<{
 *   filesScanned: number,
 *   filesWithBlocks: number,
 *   totalBlocks: number,
 *   okBlocks: number,
 *   failedBlocks: Array<{ file: string, startLine: number, diagramType: string, error: string }>,
 *   byDiagramType: Record<string, { ok: number, fail: number }>
 * }>}
 */
export async function validateRoots({ roots = ['analysis'], limit = Infinity } = {}) {
  const mermaid = await loadMermaid();
  const allFiles = [];
  for (const root of roots) await walkMarkdownFiles(root, allFiles);
  const files = limit < allFiles.length ? allFiles.slice(0, limit) : allFiles;
  const failedBlocks = [];
  const byDiagramType = {};
  let filesWithBlocks = 0;
  let totalBlocks = 0;
  let okBlocks = 0;
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8');
    const blocks = extractMermaidBlocks(text);
    if (blocks.length > 0) filesWithBlocks++;
    for (const b of blocks) {
      totalBlocks++;
      const result = await validateBlock(b.body, mermaid);
      const bucket = byDiagramType[result.diagramType] ??= { ok: 0, fail: 0 };
      if (result.ok) {
        okBlocks++;
        bucket.ok++;
      } else {
        bucket.fail++;
        failedBlocks.push({
          file: path.relative(process.cwd(), file),
          startLine: b.startLine,
          diagramType: result.diagramType,
          error: result.error,
        });
      }
    }
  }
  return {
    filesScanned: files.length,
    filesWithBlocks,
    totalBlocks,
    okBlocks,
    failedBlocks,
    byDiagramType,
  };
}

/**
 * Format a human-readable summary report.
 *
 * @param {Awaited<ReturnType<typeof validateRoots>>} report
 * @returns {string}
 */
export function formatTextReport(report) {
  const lines = [];
  lines.push(`Mermaid diagram audit`);
  lines.push(`  files scanned        : ${report.filesScanned}`);
  lines.push(`  files with mermaid   : ${report.filesWithBlocks}`);
  lines.push(`  total mermaid blocks : ${report.totalBlocks}`);
  lines.push(`  parsed OK            : ${report.okBlocks}`);
  lines.push(`  FAILED               : ${report.failedBlocks.length}`);
  lines.push('');
  lines.push('  by diagram type:');
  const types = Object.keys(report.byDiagramType).sort();
  for (const t of types) {
    const { ok, fail } = report.byDiagramType[t];
    lines.push(`    ${t.padEnd(22)} ok=${String(ok).padStart(5)}  fail=${String(fail).padStart(4)}`);
  }
  if (report.failedBlocks.length > 0) {
    lines.push('');
    lines.push('  failing blocks:');
    for (const f of report.failedBlocks) {
      lines.push(`    ${f.file}:${f.startLine}  [${f.diagramType}]  ${f.error}`);
    }
  }
  return lines.join('\n');
}

/* istanbul ignore next */
async function mainCli() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const quiet = args.includes('--quiet');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1] ?? Infinity) : Infinity;
  const roots = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--limit');
  const report = await validateRoots({ roots: roots.length ? roots : ['analysis'], limit });
  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else if (!quiet) {
    process.stdout.write(formatTextReport(report) + '\n');
  }
  process.exit(report.failedBlocks.length === 0 ? 0 : 1);
}

const isMain = (() => {
  try { return import.meta.url === `file://${process.argv[1]}` || import.meta.url === fileURLToPath(process.argv[1]); }
  catch { return false; }
})();
if (isMain) {
  mainCli().catch((e) => { console.error(e); process.exit(2); });
}
