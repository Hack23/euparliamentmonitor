// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/H1Extractor
 * @description First-Markdown-H1 extractor extracted from
 * `article-metadata.ts`. Pure leaf module so artefact-highlight and
 * resolver code can depend on it without pulling in the full metadata
 * resolver.
 */

import { stripInlineMarkdown } from './text-utils.js';

/**
 * Return the first Markdown H1 (`# …`) in the supplied text, stripped of
 * the leading `#` and trailing anchor syntax. Returns an empty string when
 * no H1 is present.
 *
 * @param markdown - Markdown source
 * @returns Plain-text H1, or empty string when none found
 */
export function extractFirstH1(markdown: string): string {
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('#')) continue;
    if (!/^#\s+/.test(line)) continue;
    let text = line.replace(/^#\s+/, '').trimEnd();
    while (text.endsWith('#')) text = text.slice(0, -1).trimEnd();
    return stripInlineMarkdown(text);
  }
  return '';
}
