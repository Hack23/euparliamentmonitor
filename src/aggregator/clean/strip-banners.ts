// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Clean/StripBanners
 * @description Drop ISMS/owner/classification banners (emoji rows,
 * shields.io badges, `<p align="center">` blocks) from the head of an
 * artifact, plus the `---` separator that typically follows them.
 */

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
      i++;
      continue;
    }
    if (bannerEnd > 0 && HR_LINE.test(line)) {
      bannerEnd = i + 1;
      stripped++;
    }
    break;
  }
  if (bannerEnd === 0) return { md, lines: 0 };
  return { md: lines.slice(bannerEnd).join('\n').replace(/^\n+/, ''), lines: stripped };
}
