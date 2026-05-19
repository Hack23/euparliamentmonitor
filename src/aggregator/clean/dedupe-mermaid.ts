// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Clean/DedupeMermaid
 * @description Deduplicate identical mermaid fence bodies across the
 * aggregate document by replacing repeats with a reference comment.
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
