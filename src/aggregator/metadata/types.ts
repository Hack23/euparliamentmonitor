// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/Types
 * @description Strict type definitions for the metadata bounded context.
 * Covers article metadata, SEO metadata, and structured data contracts.
 */

import type { LanguageCode, LanguageMap } from '../../types/index.js';

/**
 * Per-language resolved metadata entry containing the title and
 * description that will be rendered into HTML meta tags and
 * structured data (JSON-LD).
 */
export interface PerLanguageMetadata {
  /** Language code this entry is for. */
  readonly lang: LanguageCode;
  /** Resolved title for the article in this language. */
  readonly title: string;
  /** Resolved description for the article in this language. */
  readonly description: string;
}

/**
 * Complete article metadata sidecar shape (`article-meta.json`).
 * This is a type alias for the canonical `ArticleMeta` interface
 * defined in `article-meta.ts`. Use this name when referring to the
 * sidecar contract in downstream consumers (HTML, RSS, sitemap, news
 * indexes).
 */
export type { ArticleMeta as ArticleMetaSidecar } from '../article-meta.js';

/** One resolved `(title, description)` pair for a single language. */
export interface ResolvedMetadataEntry {
  readonly title: string;
  readonly description: string;
  /**
   * Optional longer (up to ~300 chars) editorial summary lifted from
   * the language-specific executive brief BLUF paragraph. Used for
   * `og:description` and `twitter:description` so social-card previews
   * can show the full Bottom-Line-Up-Front context, while the
   * short `description` stays within Google's ~160-char snippet
   * budget. Empty string when no longer summary is available — the
   * caller should then fall back to {@link description}.
   */
  readonly extendedDescription: string;
  readonly keywords: readonly string[];
  /**
   * `"localized-brief"` when the title/description came from a translated
   * `executive-brief_<lang>.md`; `"english-brief"` when the locale fell
   * through to the English brief; `"english-editorial"` when the locale
   * used an aggregated-Markdown / artefact source; `"template"` when only
   * the localized type/date template was available. For `lang === 'en'`
   * the value is always `"english-brief"` or `"english-editorial"` or
   * `"template"` (no fall-through). Lets downstream consumers — the
   * news-index, the static-site fallback note, the manifest-SEO
   * validator — record the asymmetry called out in
   * [`.github/prompts/04-article-generation.md`](../../../.github/prompts/04-article-generation.md) § 6.2 priority 3.
   */
  readonly source:
    | 'manifest'
    | 'localized-brief'
    | 'english-brief'
    | 'english-editorial'
    | 'template';
}

/** Fully resolved metadata — one entry per supported language. */
export type ResolvedMetadata = LanguageMap<ResolvedMetadataEntry>;

/**
 * Raw manifest subset consumed by the resolver. Deliberately narrower
 * than the full `Manifest` shape (see `../manifest/types.ts`) so the
 * resolver stays usable for backport (which only has the manifest in
 * text form) and for callers that don't need the full typed structure.
 */
export interface MetadataManifest {
  readonly articleType?: string;
  readonly date?: string;
  readonly runId?: string;
  /**
   * Optional editorial-title override. `string` is applied to every
   * language; an object allows explicit per-language overrides.
   */
  readonly title?: string | Partial<Record<LanguageCode, string>>;
  /**
   * Optional editorial-description override. Same shape rules as
   * {@link title}.
   */
  readonly description?: string | Partial<Record<LanguageCode, string>>;
  /**
   * Optional committee code (e.g. `ENVI`) used by the committee-reports
   * template when the template fallback fires.
   */
  readonly committee?: string;
}

/** Inputs to `resolveArticleMetadata`. */
export interface ResolveMetadataOptions {
  /** Article type slug (e.g. `breaking`, `motions`, `week-ahead`). */
  readonly articleType: string;
  /** ISO date of the run (`YYYY-MM-DD`). */
  readonly date: string;
  /** Aggregated Markdown document body (after provenance/header). */
  readonly markdown: string;
  /** Parsed analysis manifest (may be empty for historic/backport callers). */
  readonly manifest?: MetadataManifest;
  /**
   * Absolute path to the analysis run directory so the resolver can
   * peek at individual artefact files. Omit for callers that only have
   * the aggregated Markdown (the artefact-H1 tier is then skipped).
   */
  readonly runDir?: string;
}
