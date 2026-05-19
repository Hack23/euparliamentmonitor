// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Descriptions/Types
 * @description Shared types for the curated political-intelligence
 * description / title tables. Split out of the original monolithic
 * `political-intelligence-descriptions.ts` (Refactor 8/8).
 */

import type { LanguageCode } from '../../../types/index.js';

/** Per-language text overlay keyed by 2-letter language code. */
export type TextI18n = Partial<Record<LanguageCode, string>>;

/**
 * Back-compat alias for {@link TextI18n}. Preserved so downstream
 * TypeScript consumers that import this name from
 * `euparliamentmonitor/generators/political-intelligence-descriptions`
 * keep compiling. Prefer `TextI18n` for new code.
 */
export type DescriptionI18n = TextI18n;

/** One curated entry for a methodology / template / reference file. */
export interface CuratedDescription {
  /** Canonical English title shown on the card heading and used as the
   *  fallback when a language-specific title is not provided.
   *
   *  Leave empty to keep the H1-extracted title from the source Markdown
   *  file (useful for files whose H1 already reads well as a card title). */
  readonly title?: string;
  /** Optional per-language title overrides. English fallback (or the curated
   *  `title` field) is used for missing keys. */
  readonly titleI18n?: TextI18n;
  /** Canonical English description. */
  readonly description: string;
  /** Optional per-language description overrides. English fallback is used
   *  for missing keys. */
  readonly i18n?: TextI18n;
}
