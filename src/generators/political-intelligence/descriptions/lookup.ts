// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Descriptions/Lookup
 * @description Public resolver API for curated political-intelligence
 * descriptions and titles —
 * {@link getCuratedDescription}, {@link getCuratedTitle},
 * {@link hasCuratedDescription}, {@link hasCuratedTitle}.
 *
 * Split out of the monolithic `political-intelligence-descriptions.ts`
 * (Refactor 8/8). The data lives in `curated-descriptions.ts` /
 * `curated-titles.ts`; this module owns the lookup priority chain
 * (per-language → English canonical → localized generic fallback).
 */

import type { LanguageCode } from '../../../types/index.js';
import { CURATED_DESCRIPTIONS } from './curated-descriptions.js';
import { CURATED_TITLES } from './curated-titles.js';
import { buildGenericFallback, stripEmojiAndPunct } from './fallback.js';

/**
 * Resolve the best description for a given methodology / template / reference
 * file and language.
 *
 * Lookup priority:
 * 1. Curated per-language description (`CURATED_DESCRIPTIONS[relPath].i18n[lang]`)
 * 2. Curated English canonical description (`CURATED_DESCRIPTIONS[relPath].description`)
 *    — **only returned for English callers**; non-English callers fall
 *      through to tier 3 so readers don't see raw English on localized
 *      pages when the curated English is non-trivial.
 * 3. Localized generic fallback sentence built from the file's localized
 *    title and a localized kind word
 *
 * @param relPath  - Repository-relative file path (e.g.
 *                   `analysis/methodologies/ai-driven-analysis-guide.md`)
 * @param lang     - Target language code
 * @param fallback - H1-extracted title from the source Markdown (always
 *                   English); used as the title seed for tier 3
 * @returns A non-empty description string
 */
export function getCuratedDescription(relPath: string, lang: LanguageCode, fallback = ''): string {
  const key = relPath.replace(/\\/g, '/');

  if (!Object.prototype.hasOwnProperty.call(CURATED_DESCRIPTIONS, key)) {
    const localizedTitle = getCuratedTitle(key, lang, fallback || stripEmojiAndPunct(key));
    return buildGenericFallback(key, lang, localizedTitle);
  }

  const entry = CURATED_DESCRIPTIONS[key];
  if (entry) {
    const localized = entry.i18n?.[lang];
    if (localized) return localized;
    if (lang === 'en') return entry.description;
  }
  const localizedTitle = getCuratedTitle(key, lang, fallback || stripEmojiAndPunct(key));
  return buildGenericFallback(key, lang, localizedTitle);
}

/**
 * Whether the curated table has an explicit entry (curated English
 * description) for this path — used by tests and by the generator to detect
 * newly-added analysis files that still need a curated entry.
 *
 * @param relPath - Repository-relative file path
 * @returns `true` when the curated table contains the file
 */
export function hasCuratedDescription(relPath: string): boolean {
  return Object.prototype.hasOwnProperty.call(CURATED_DESCRIPTIONS, relPath.replace(/\\/g, '/'));
}

/**
 * Whether the curated title overlay has an explicit entry for this path.
 * Used by tests to confirm every shipped methodology/template/reference has
 * a localized title.
 *
 * @param relPath - Repository-relative file path
 * @returns `true` when {@link CURATED_TITLES} contains the file
 */
export function hasCuratedTitle(relPath: string): boolean {
  return Object.prototype.hasOwnProperty.call(CURATED_TITLES, relPath.replace(/\\/g, '/'));
}

/**
 * Resolve the best card title for a given methodology / template / reference
 * file and language.
 *
 * Lookup priority:
 * 1. Curated per-language title from {@link CURATED_TITLES} (preferred —
 *    this is where all 14-language localization is maintained)
 * 2. Curated English title from {@link CURATED_TITLES} (`.en` overlay)
 * 3. Per-entry `titleI18n[lang]` on a `CURATED_DESCRIPTIONS` entry
 *    (historic path; retained so future entries can colocate title + desc)
 * 4. Per-entry `title` on a `CURATED_DESCRIPTIONS` entry
 * 5. `fallback` — the H1-extracted title from the source Markdown
 *
 * The generator always ships `fallback` from the Markdown H1 so this
 * function is guaranteed to return a non-empty string for every file in
 * the library, even when the curated tables have no entry yet.
 *
 * @param relPath  - Repository-relative file path
 * @param lang     - Target language code
 * @param fallback - H1-extracted title from the source Markdown (English)
 * @returns A non-empty display title
 */
export function getCuratedTitle(relPath: string, lang: LanguageCode, fallback: string): string {
  const key = relPath.replace(/\\/g, '/');

  if (Object.prototype.hasOwnProperty.call(CURATED_TITLES, key)) {
    const titleEntry = CURATED_TITLES[key];
    if (titleEntry) {
      return titleEntry[lang] ?? titleEntry.en ?? fallback;
    }
  }

  if (Object.prototype.hasOwnProperty.call(CURATED_DESCRIPTIONS, key)) {
    const descEntry = CURATED_DESCRIPTIONS[key];
    if (descEntry) {
      return descEntry.titleI18n?.[lang] ?? descEntry.title ?? fallback;
    }
  }

  return fallback;
}
