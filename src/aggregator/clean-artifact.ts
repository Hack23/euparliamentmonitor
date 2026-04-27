// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/CleanArtifact
 * @description Normalise a single analysis-artifact Markdown file so it can be
 * merged into the aggregate document without producing duplicate banners,
 * competing H1 headings, or broken relative links.
 *
 * Applied transformations (in order):
 *   1. Strip leading YAML front-matter (`---\n…\n---\n`).
 *   2. Strip ISMS/owner/classification banners (emoji rows, shields.io badges,
 *      `<p align="center">` blocks, and the separator `---` that usually
 *      follows them).
 *   3. Remove the artifact's own H1; the aggregator owns the document outline.
 *   4. Demote every remaining heading by one level (H2→H3, etc.) so the
 *      aggregate has a single H1.
 *   5. Rewrite repo-relative links/images to absolute GitHub URLs so the
 *      published HTML is portable.
 *   6. Deduplicate mermaid fence bodies on a per-document basis (caller-owned
 *      state) — identical blocks are replaced with a reference comment.
 */

// Re-export GitHub URL helpers from the canonical infra module so callers
// that already imported `githubBlobUrl` / `githubRawUrl` from this file
// keep working. New code should import from `aggregator/infra/github-urls.js`.
import { blobUrl as _blobUrl, rawUrl as _rawUrl } from './infra/github-urls.js';

/**
 * Build a GitHub blob URL for a repo-relative path.
 *
 * @param relPath - Repo-relative file path
 * @returns Absolute `https://github.com/.../blob/main/...` URL
 */
export function githubBlobUrl(relPath: string): string {
  return _blobUrl(relPath);
}

/**
 * Build a `raw.githubusercontent.com` URL for a repo-relative path.
 *
 * @param relPath - Repo-relative file path
 * @returns Absolute raw-content URL
 */
export function githubRawUrl(relPath: string): string {
  return _rawUrl(relPath);
}

/** Options controlling artifact cleanup. */
export interface CleanArtifactOptions {
  /**
   * Repo-relative path of the artifact being cleaned (e.g.
   * `analysis/daily/2026-01-15/breaking-run1/intelligence/synthesis-summary.md`).
   * Used to resolve relative links/images against.
   */
  readonly artifactRelPath: string;
  /**
   * Shared set of mermaid-body hashes seen so far in the aggregate document.
   * Identical blocks are replaced with a cross-reference comment; the caller
   * owns the set so it persists across artifacts.
   */
  readonly seenMermaidHashes?: Set<string>;
}

/** Result of {@link cleanArtifact}. */
export interface CleanArtifactResult {
  /** Cleaned Markdown ready to be concatenated into the aggregate. */
  readonly markdown: string;
  /** Headings removed (for debugging/telemetry). */
  readonly strippedH1s: number;
  /** Banner/metadata lines removed. */
  readonly strippedBannerLines: number;
  /** Operational metadata preamble lines removed (e.g. **Run:** / **Window:** blocks). */
  readonly strippedMetaLines: number;
  /** Mermaid blocks deduplicated as a reference to a previous occurrence. */
  readonly dedupedMermaidBlocks: number;
}

/**
 * Strip YAML front-matter from the head of a Markdown document. Matches
 * `---\n...\n---\n` *only* at position 0 — quoted `---` dividers deeper in
 * the document are left alone.
 *
 * @param md - Raw Markdown source
 * @returns Markdown with the leading front-matter block removed
 */
export function stripFrontMatter(md: string): string {
  if (!md.startsWith('---')) return md;
  const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(md);
  return match ? md.slice(match[0].length) : md;
}

/**
 * Regex patterns identifying banner / document-owner / shields.io / center-pic
 * lines that clutter the aggregate. All are line-level patterns; the caller
 * applies them after front-matter strip.
 */
const BANNER_LINE_PATTERNS: readonly RegExp[] = [
  /^\s*<p\s+align="center">/i,
  /^\s*<\/p>\s*$/i,
  /^\s*<img\s+[^>]*hack23\.com\/icon-/i,
  /^\s*<h1\s+align="center">/i,
  /^\s*<\/h1>\s*$/i,
  /^\s*<a\s+href="#"><img\s+src="https:\/\/img\.shields\.io\//i,
  /^\s*\*\*\s*📋\s*Document Owner/i,
  /^\s*\*\*\s*🔄\s*Review Cycle/i,
  /^\s*\*\*\s*🏢\s*Owner/i,
  /^\s*<strong>\s*(?:📋|🔄|🏢)/i,
  // Standalone center-aligned block closings
  /^\s*<\/p>\s*$/,
];

/**
 * Line-level matcher for a standalone horizontal rule. Used to drop the
 * `---` separator that usually follows the banner block.
 */
const HR_LINE = /^\s*---\s*$/;

/**
 * Return true when the line should be stripped as banner content.
 *
 * @param line - Single line of Markdown
 * @returns `true` if the line matches any banner pattern
 */
function isBannerLine(line: string): boolean {
  for (const p of BANNER_LINE_PATTERNS) {
    if (p.test(line)) return true;
  }
  return false;
}

/**
 * Drop banner/metadata blocks from the head of the document. Rules:
 *  - A run of banner lines (contiguous, or separated only by blank lines) is
 *    removed. A trailing `---` horizontal rule immediately after the banner
 *    run is also removed.
 *  - Stops scanning as soon as we hit a line that looks like real content
 *    (headings, prose, tables, fences) that isn't a banner or blank.
 *
 * @param md - Raw Markdown source
 * @returns `{ md, lines }` — stripped Markdown and count of removed lines
 */
export function stripBanners(md: string): { md: string; lines: number } {
  const lines = md.split('\n');
  let i = 0;
  let bannerEnd = 0;
  let stripped = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (isBannerLine(line)) {
      bannerEnd = i + 1;
      stripped++;
      i++;
      continue;
    }
    if (line.trim() === '') {
      // blank line — keep scanning for more banner lines
      i++;
      continue;
    }
    // Real content reached — but absorb a trailing HR if it immediately
    // follows a banner run.
    if (bannerEnd > 0 && HR_LINE.test(line)) {
      bannerEnd = i + 1;
      stripped++;
    }
    break;
  }
  if (bannerEnd === 0) return { md, lines: 0 };
  return { md: lines.slice(bannerEnd).join('\n').replace(/^\n+/, ''), lines: stripped };
}

// REUSE-IgnoreStart
/**
 * Matches an SPDX tag anywhere on a line, whether wrapped in HTML comments
 * (SPDX-License-Identifier line inside `<!-- ... -->`), inline markdown
 * emphasis (italic-wrapped SPDX-License-Identifier / SPDX-FileCopyrightText),
 * or written bare. Used to purge artifact-level SPDX metadata before rendering
 * so it doesn't leak into the aggregated HTML (where the REUSE tool would then
 * parse the surrounding markup as part of the SPDX expression).
 */
// REUSE-IgnoreEnd
const SPDX_TAG_LINE =
  /SPDX-(?:License-Identifier|FileCopyrightText|PackageName|PackageSupplier|PackageDownloadLocation)\b/;

// REUSE-IgnoreStart
/**
 * Remove every line containing an SPDX tag from the Markdown source. The
 * aggregated article HTML carries its own file-level SPDX header via
 * `REUSE.toml`; per-artifact tags would otherwise surface as visible footer
 * text (italic-wrapped SPDX tags rendered inside `<em>` / `</em></p>`) and
 * trip the REUSE compliance scanner, which would parse the trailing markup
 * as part of the SPDX expression.
 *
 * @param md - Raw Markdown source
 * @returns `{ md, lines }` — stripped Markdown and count of removed lines
 */
// REUSE-IgnoreEnd
export function stripSpdxTags(md: string): { md: string; lines: number } {
  const lines = md.split('\n');
  const kept: string[] = [];
  let stripped = 0;
  for (const line of lines) {
    if (SPDX_TAG_LINE.test(line)) {
      stripped++;
      continue;
    }
    kept.push(line);
  }
  return { md: kept.join('\n'), lines: stripped };
}

/**
 * Remove every H1 (`^# ` and the setext H1 form) and demote every other
 * ATX heading by one level. Setext H2 (`----` underline) stays as H2 because
 * converting it to H3 would require replacing the underline form.
 *
 * Skips changes inside fenced code blocks.
 *
 * @param md - Raw Markdown source
 * @returns `{ md, h1Count }` — transformed Markdown and number of H1s removed
 */
/**
 * Track open/close of a fenced code block. Returns the updated fence state
 * and the original line (unmodified). Centralising the state machine keeps
 * callers simple and makes cognitive complexity linear.
 *
 * @param line - Current line of Markdown
 * @param inFence - Whether the previous line was inside a fenced block
 * @param fenceMarker - Opening marker for the current fence (or `""`)
 * @returns `{ inFence, fenceMarker, matched }` reflecting the state after
 *          processing `line`; `matched` is `true` when the line itself is a
 *          fence boundary (and should therefore be passed through verbatim)
 */
function advanceFenceState(
  line: string,
  inFence: boolean,
  fenceMarker: string
): { inFence: boolean; fenceMarker: string; matched: boolean } {
  const fenceMatch = /^(\s*)(```+|~~~+)(.*)$/.exec(line);
  if (!fenceMatch || !fenceMatch[2]) return { inFence, fenceMarker, matched: false };
  const marker = fenceMatch[2];
  if (!inFence) {
    return { inFence: true, fenceMarker: marker, matched: true };
  }
  if (marker.startsWith(fenceMarker.charAt(0)) && marker.length >= fenceMarker.length) {
    return { inFence: false, fenceMarker: '', matched: true };
  }
  return { inFence, fenceMarker, matched: true };
}

/**
 * Transform one non-fence heading line: setext H1, ATX H1, or ATX H2-H6.
 * Returns the processed output plus how many source lines it consumed and
 * whether an H1 was removed.
 *
 * @param lines - All source lines (used to peek at the next line for setext)
 * @param index - Zero-based index of the line under consideration
 * @returns `{ output, consumed, h1Removed }` — `consumed` is how many lines
 *          the caller should advance by (1 for ATX; 2 for setext H1; 0 when
 *          the line is not a heading at all)
 */
function processHeadingLine(
  lines: readonly string[],
  index: number
): { output: string | null; consumed: number; h1Removed: boolean } {
  const line = lines[index] ?? '';
  // Setext H1: current line has text, next line is `===+`
  const nextLine = lines[index + 1] ?? '';
  if (/^\s*=+\s*$/.test(nextLine) && /\S/.test(line)) {
    return { output: null, consumed: 2, h1Removed: true };
  }
  const atx = /^(\s*)(#{1,6})(\s.*)$/.exec(line);
  if (!atx || !atx[2]) {
    return { output: line, consumed: 1, h1Removed: false };
  }
  const level = atx[2].length;
  if (level === 1) {
    return { output: null, consumed: 1, h1Removed: true };
  }
  const demoted = level === 6 ? '######' : '#'.repeat(level + 1);
  return {
    output: `${atx[1] ?? ''}${demoted}${atx[3] ?? ''}`,
    consumed: 1,
    h1Removed: false,
  };
}

/**
 * Remove every H1 (`^# ` and the setext H1 form) and demote every other
 * ATX heading by one level. Setext H2 (`----` underline) stays as H2 because
 * converting it to H3 would require replacing the underline form.
 *
 * Skips changes inside fenced code blocks.
 *
 * @param md - Raw Markdown source
 * @returns `{ md, h1Count }` — transformed Markdown and number of H1s removed
 */
export function demoteHeadings(md: string): { md: string; h1Count: number } {
  const lines = md.split('\n');
  const out: string[] = [];
  let inFence = false;
  let fenceMarker = '';
  let h1Count = 0;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const fence = advanceFenceState(line, inFence, fenceMarker);
    if (fence.matched || inFence) {
      inFence = fence.inFence;
      fenceMarker = fence.fenceMarker;
      out.push(line);
      i++;
      continue;
    }
    const result = processHeadingLine(lines, i);
    if (result.h1Removed) h1Count++;
    if (result.output !== null) out.push(result.output);
    i += result.consumed;
  }
  return { md: out.join('\n'), h1Count };
}

/**
 * Resolve a relative link target against the artifact's directory and
 * return an absolute GitHub URL.
 *
 * @param target - Original link target (e.g. `../templates/foo.md`)
 * @param artifactRelPath - Repo-relative path of the artifact
 * @param raw - When true, produce a raw.githubusercontent URL (for images)
 * @returns Absolute URL (or the original target for anchors/absolute links)
 */
export function resolveLink(target: string, artifactRelPath: string, raw: boolean): string {
  // Preserve absolute URLs, anchors, mailto/tel, and protocol-relative
  if (
    /^[a-z][a-z0-9+.-]*:\/\//i.test(target) ||
    target.startsWith('//') ||
    target.startsWith('#') ||
    target.startsWith('mailto:') ||
    target.startsWith('tel:') ||
    target.startsWith('data:')
  ) {
    return target;
  }
  const artifactDir = artifactRelPath.split('/').slice(0, -1).join('/');
  // Split off an optional `#fragment` or `?query` suffix for re-attachment.
  const suffixMatch = /[#?].*$/.exec(target);
  const suffix = suffixMatch ? suffixMatch[0] : '';
  const bare = suffix ? target.slice(0, -suffix.length) : target;
  const resolved = posixResolve(artifactDir, bare);
  const url = raw ? githubRawUrl(resolved) : githubBlobUrl(resolved);
  return `${url}${suffix}`;
}

/**
 * POSIX path-resolve over `/`-separated strings. Mirrors `path.posix.resolve`
 * on a virtual absolute root so we don't depend on `path` for pure string ops.
 *
 * @param baseDir - Directory portion of the base path (POSIX separators)
 * @param rel - Relative path to resolve against `baseDir`
 * @returns Resolved path with `.` / `..` segments collapsed
 */
function posixResolve(baseDir: string, rel: string): string {
  const parts = `${baseDir}/${rel}`.split('/');
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      stack.pop();
      continue;
    }
    stack.push(part);
  }
  return stack.join('/');
}

/**
 * Rewrite `[text](relative.md)` and `![alt](img.png)` links to GitHub URLs.
 *
 * @param md - Markdown source (may contain fenced code blocks, left untouched)
 * @param artifactRelPath - Repo-relative path of the artifact
 * @returns Markdown with every non-fence-local link rewritten
 */
export function rewriteLinks(md: string, artifactRelPath: string): string {
  const lines = md.split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (/^\s*(```+|~~~+)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    lines[i] = rewriteLinksInLine(line, artifactRelPath);
  }
  return lines.join('\n');
}

/**
 * Rewrite every `[text](target)` occurrence in a single non-fenced line.
 * Uses a manual scanner instead of a global regex to avoid catastrophic
 * backtracking on nested brackets.
 *
 * @param line - One line of Markdown, outside any fenced code block
 * @param artifactRelPath - Repo-relative path of the source artifact
 * @returns Line with every local `.md` target rewritten to a GitHub URL
 */
/**
 * Attempt to parse a Markdown link starting at `line[index]`. Returns
 * `null` when no valid `[text](target)` / `![alt](target)` link is present.
 *
 * @param line - Source line being scanned
 * @param index - Zero-based index of the candidate `[` or `!`
 * @param artifactRelPath - Repo-relative path of the source artifact
 * @returns `{ replacement, nextIndex }` when a link was rewritten, else `null`
 */
function tryParseLinkAt(
  line: string,
  index: number,
  artifactRelPath: string
): { replacement: string; nextIndex: number } | null {
  const ch = line.charAt(index);
  const isImage = ch === '!' && line.charAt(index + 1) === '[';
  const isLink = ch === '[';
  if (!isImage && !isLink) return null;
  const start = isImage ? index + 1 : index;
  const closeText = findMatchingBracket(line, start);
  if (closeText === -1 || line.charAt(closeText + 1) !== '(') return null;
  const openParen = closeText + 1;
  const closeParen = findMatchingParen(line, openParen);
  if (closeParen === -1) return null;
  const label = line.slice(start, closeText + 1);
  const rawTarget = line.slice(openParen + 1, closeParen).trim();
  const { target, title } = splitTargetAndTitle(rawTarget);
  const newTarget = resolveLink(target, artifactRelPath, isImage);
  const replacement = (isImage ? '!' : '') + label + '(' + newTarget + title + ')';
  return { replacement, nextIndex: closeParen + 1 };
}

/**
 * Rewrite every `[text](target)` occurrence in a single non-fenced line.
 * Uses a manual scanner instead of a global regex to avoid catastrophic
 * backtracking on nested brackets.
 *
 * @param line - One line of Markdown, outside any fenced code block
 * @param artifactRelPath - Repo-relative path of the source artifact
 * @returns Line with every local `.md` target rewritten to a GitHub URL
 */
function rewriteLinksInLine(line: string, artifactRelPath: string): string {
  let out = '';
  let i = 0;
  while (i < line.length) {
    const parsed = tryParseLinkAt(line, i, artifactRelPath);
    if (parsed) {
      out += parsed.replacement;
      i = parsed.nextIndex;
      continue;
    }
    out += line.charAt(i);
    i++;
  }
  return out;
}

/**
 * Split a raw Markdown link target into its URL and optional `"title"`
 * suffix. Uses a linear scanner instead of a regex to avoid catastrophic
 * backtracking on pathological input.
 *
 * @param raw - Raw contents between the parentheses of a Markdown link
 * @returns `{ target, title }` where `title` is `""` when absent, or the
 *          leading whitespace + `"..."` suffix when present
 */
function splitTargetAndTitle(raw: string): { target: string; title: string } {
  let i = 0;
  while (i < raw.length && !/\s/.test(raw.charAt(i))) i++;
  if (i === raw.length) return { target: raw, title: '' };
  const target = raw.slice(0, i);
  const rest = raw.slice(i);
  // Accept only exactly-matched `"..."` title; otherwise treat whole thing
  // as part of the target so we don't silently drop content.
  const trimmed = rest.trimStart();
  if (
    trimmed.length >= 2 &&
    trimmed.charAt(0) === '"' &&
    trimmed.charAt(trimmed.length - 1) === '"'
  ) {
    return { target, title: rest };
  }
  return { target: raw, title: '' };
}

/**
 * Index of the matching `]` for a `[` at position `start`, or `-1` if none.
 *
 * @param line - Line being scanned
 * @param start - Zero-based index of the opening `[`
 * @returns Zero-based index of the matching `]`, or `-1`
 */
function findMatchingBracket(line: string, start: number): number {
  let depth = 0;
  for (let i = start; i < line.length; i++) {
    const ch = line.charAt(i);
    if (ch === '\\') {
      i++;
      continue;
    }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Index of the matching `)` for a `(` at position `start`, or `-1` if none.
 *
 * @param line - Line being scanned
 * @param start - Zero-based index of the opening `(`
 * @returns Zero-based index of the matching `)`, or `-1`
 */
function findMatchingParen(line: string, start: number): number {
  let depth = 0;
  for (let i = start; i < line.length; i++) {
    const ch = line.charAt(i);
    if (ch === '\\') {
      i++;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Deduplicate identical mermaid fence blocks by body hash. The caller owns
 * the `seen` Set so dedup state persists across artifacts in the same
 * aggregate.
 *
 * When a duplicate is found the fence is replaced with a single-line HTML
 * comment pointing at the earlier occurrence. Non-mermaid fences are left
 * untouched.
 *
 * @param md - Markdown source that may contain mermaid fences
 * @param seen - Shared set of mermaid-body hashes (caller-owned)
 * @returns `{ md, deduped }` — cleaned Markdown and count of replacements
 */
/**
 * Scan forward from `start` to find the body and closing fence of a
 * mermaid block whose opening was detected on `lines[start - 1]`.
 *
 * @param lines - Source lines
 * @param start - Index of the first body line after the opening fence
 * @returns `{ body, closeIndex }` — body lines and index of the closing
 *          fence (or `lines.length` if no closing fence is present)
 */
function scanMermaidBody(
  lines: readonly string[],
  start: number
): { body: string[]; closeIndex: number } {
  const body: string[] = [];
  let j = start;
  while (j < lines.length) {
    const candidate = lines[j] ?? '';
    if (/^\s*```+\s*$/.test(candidate)) break;
    body.push(candidate);
    j++;
  }
  return { body, closeIndex: j };
}

/**
 * Deduplicate identical mermaid fence blocks by body hash. The caller owns
 * the `seen` Set so dedup state persists across artifacts in the same
 * aggregate.
 *
 * When a duplicate is found the fence is replaced with a single-line HTML
 * comment pointing at the earlier occurrence. Non-mermaid fences are left
 * untouched.
 *
 * @param md - Markdown source that may contain mermaid fences
 * @param seen - Shared set of mermaid-body hashes (caller-owned)
 * @returns `{ md, deduped }` — cleaned Markdown and count of replacements
 */
export function dedupMermaid(md: string, seen: Set<string>): { md: string; deduped: number } {
  const lines = md.split('\n');
  const out: string[] = [];
  let deduped = 0;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (!/^\s*```+\s*mermaid\s*$/i.test(line)) {
      out.push(line);
      i++;
      continue;
    }
    const { body, closeIndex } = scanMermaidBody(lines, i + 1);
    const hash = hashString(body.join('\n').trim());
    if (seen.has(hash)) {
      out.push(
        `<!-- mermaid block deduplicated: identical to earlier occurrence (hash=${hash}) -->`
      );
      deduped++;
    } else {
      seen.add(hash);
      out.push(line);
      out.push(...body);
      if (closeIndex < lines.length) out.push(lines[closeIndex] ?? '');
    }
    i = closeIndex + 1;
  }
  return { md: out.join('\n'), deduped };
}

/**
 * 32-bit FNV-1a hash rendered as hex. Not cryptographic — used only to
 * identify identical mermaid bodies within one aggregate document. The
 * surface is entirely derived from committed repo content.
 *
 * @param input - String to hash
 * @returns 8-character lowercase hex digest
 */
function hashString(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Pattern matching an operational metadata line at the start of an artifact.
 * Examples: `**Run:** breaking-run-123`, `**Window:** 2026-04-24 00:00Z — 05:49Z`.
 * The pattern requires the line to start with `**<Word>**` followed by a colon
 * or whitespace so ordinary bold prose is not mistakenly treated as metadata.
 */
const METADATA_LINE_PATTERN = /^\*\*[A-Za-z][^*\n]*\*\*[:\s]/;

/**
 * Strip the operational metadata preamble that agent pipelines prepend to
 * artifacts. These are lines of the form `**Run:** …`, `**Window:** …`,
 * `**Methodology:** …`, etc., followed optionally by a standalone `---`
 * horizontal rule. They are agent-operational metadata that should not appear
 * in the published article.
 *
 * Algorithm:
 *  1. Skip leading blank lines (they don't count as metadata).
 *  2. If the first non-blank line does NOT match the metadata pattern, return
 *     the document unchanged (`lines: 0`).
 *  3. Otherwise consume all metadata lines and interspersed blank lines.
 *  4. If the next non-blank line is a standalone `---`, consume that too.
 *  5. Return the stripped Markdown and the count of lines removed.
 *
 * @param md - Markdown source (after banner/heading passes)
 * @returns `{ md, lines }` — stripped Markdown and number of lines removed
 */
export function stripArtifactMetadataPreamble(md: string): { md: string; lines: number } {
  const lines = md.split('\n');
  let i = 0;

  // Skip purely blank lines at the very head
  while (i < lines.length && (lines[i] ?? '').trim() === '') i++;

  // If the first real line is not a metadata line, return unchanged
  if (i >= lines.length || !METADATA_LINE_PATTERN.test(lines[i] ?? '')) {
    return { md, lines: 0 };
  }

  // Consume the metadata block (metadata lines + interspersed blank lines)
  let metaEnd = i;
  while (metaEnd < lines.length) {
    const line = lines[metaEnd] ?? '';
    if (METADATA_LINE_PATTERN.test(line) || line.trim() === '') {
      metaEnd++;
    } else {
      break;
    }
  }

  // If the next non-blank line is a standalone HR, absorb it
  let scanAhead = metaEnd;
  while (scanAhead < lines.length && (lines[scanAhead] ?? '').trim() === '') scanAhead++;
  if (scanAhead < lines.length && /^\s*---\s*$/.test(lines[scanAhead] ?? '')) {
    metaEnd = scanAhead + 1;
  }

  const removed = metaEnd;
  const stripped = lines.slice(removed).join('\n').replace(/^\n+/, '');
  return { md: stripped, lines: removed };
}

/**
 * Apply all cleanup passes and return the normalised Markdown plus
 * simple counters for telemetry/tests.
 *
 * @param source - Raw Markdown contents of the artifact file
 * @param options - Cleanup options (artifact path, shared mermaid dedup set)
 * @returns {@link CleanArtifactResult} with the normalised Markdown
 */
export function cleanArtifact(source: string, options: CleanArtifactOptions): CleanArtifactResult {
  const seen = options.seenMermaidHashes ?? new Set<string>();
  let md = stripFrontMatter(source);
  md = stripSpdxTags(md).md;
  const { md: mdAfterBanners, lines: strippedBannerLines } = stripBanners(md);
  md = mdAfterBanners;
  const { md: mdAfterHeadings, h1Count } = demoteHeadings(md);
  md = mdAfterHeadings;
  const { md: mdAfterMeta, lines: strippedMetaLines } = stripArtifactMetadataPreamble(md);
  md = mdAfterMeta;
  md = rewriteLinks(md, options.artifactRelPath);
  const { md: mdAfterMermaid, deduped } = dedupMermaid(md, seen);
  md = mdAfterMermaid;
  // Collapse excessive blank lines to at most 2 consecutive blanks
  md = md.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
  return {
    markdown: md,
    strippedH1s: h1Count,
    strippedBannerLines,
    strippedMetaLines,
    dedupedMermaidBlocks: deduped,
  };
}
