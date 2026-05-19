// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ReaderGuide/Strip
 * @description Strip an inline (AI-authored) Reader Intelligence Guide
 * section from rendered HTML so the canonical renderer-owned guide is
 * the sole instance in the article.
 */

/**
 * Strip an AI-authored Reader Intelligence Guide section from rendered HTML.
 * Looks for H2 headings with id="reader-intelligence-guide" and removes
 * everything up to the next H2 or the end of the content. This ensures
 * the canonical renderer-owned guide is the sole instance in the article.
 *
 * @param html - Rendered HTML body fragment
 * @returns HTML with any inline reader-intelligence-guide removed
 */
export function stripInlineReaderGuide(html: string): string {
  const pattern =
    /<h2[^>]*id=["']reader-intelligence-guide["'][^>]*>[\s\S]*?(?=<h2[ >]|<section[ >]|$)/gi;
  return html.replace(pattern, '');
}
