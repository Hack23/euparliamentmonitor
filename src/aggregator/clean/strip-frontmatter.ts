// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Clean/StripFrontmatter
 * @description Remove YAML front-matter from the head of an artifact.
 */

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
