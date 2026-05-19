// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ReaderGuide/Icons
 * @description Visual icons for each reader-guide section, keyed by
 * section anchor id. Used by both the Reader Intelligence Guide rows
 * and the article-level Table of Contents so the two surfaces share a
 * single visual vocabulary.
 */

/** Visual icons for each reader guide section to improve scannability. */
const SECTION_ICONS: Readonly<Record<string, string>> = {
  'section-executive-brief': '📋',
  'section-synthesis': '🔗',
  'section-significance': '⚖️',
  'section-actors-forces': '🎭',
  'section-coalitions-voting': '🤝',
  'section-stakeholder-map': '👥',
  'section-economic-context': '💶',
  'section-risk': '⚠️',
  'section-threat': '🛡️',
  'section-scenarios': '🔮',
  'section-forward-projection': '🔭',
  'section-electoral-arc': '🗳️',
  'section-pestle-context': '🌍',
  'section-continuity': '🔁',
  'section-deep-analysis': '🔬',
  'section-documents': '📄',
  'section-extended-intel': '🧠',
  'section-mcp-reliability': '📡',
  'section-quality-reflection': '🪞',
  'section-supplementary-intelligence': '📎',
};

/**
 * Look up the visual icon for a known article section.
 *
 * Exposed so the article-level Table-of-Contents (`buildArticleToc`)
 * can render the same emoji that the Reader Intelligence Guide uses
 * for each section, keeping the two navigation surfaces visually
 * consistent. Unknown section IDs (e.g. ad-hoc `supplementary-…` or
 * appendix anchors) fall back to a generic 📎 paperclip.
 *
 * @param sectionId - Anchor id of the section (e.g. `section-risk`)
 * @returns Single emoji glyph used as a `guide-icon`
 */
export function getReaderGuideSectionIcon(sectionId: string): string {
  return SECTION_ICONS[sectionId] ?? '📎';
}
