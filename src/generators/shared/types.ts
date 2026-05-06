// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Shared/Types
 * @description Branded types and shared interfaces for the HTML/XML/RSS
 * generation bounded contexts. Branded types prevent accidental mixing of
 * raw strings with already-escaped or validated output.
 *
 * These types are compile-time-only (erased by TypeScript) so they impose
 * zero runtime cost while catching misuse like passing unsanitized input
 * directly into an HTML template.
 */

import type { LanguageCode } from '../../types/index.js';

// ─── Branded-type infrastructure ────────────────────────────────────────────

/**
 * Phantom brand tag. The unique symbol ensures no two branded types are
 * assignable to each other even if they share the same base type.
 */
declare const __brand: unique symbol;

/**
 * A branded type wraps a base primitive with a compile-time-only tag so
 * TypeScript prevents accidental interchange. Runtime representation is
 * identical to `Base`; the brand exists only in the type system.
 */
type Brand<Base, Tag extends string> = Base & { readonly [__brand]: Tag };

// ─── HTML-safe branded types ────────────────────────────────────────────────

/**
 * A string that has been HTML-entity-escaped and is safe for interpolation
 * into an HTML document. Created via {@link toSafeHtml}.
 */
export type SafeHtmlString = Brand<string, 'SafeHtml'>;

/**
 * A string that has been XML-entity-escaped and is safe for interpolation
 * into an XML document (sitemap.xml, rss.xml). Created via {@link toSafeXml}.
 */
export type SafeXmlString = Brand<string, 'SafeXml'>;

/**
 * An absolute URL validated to start with `https://`. Prevents accidental
 * injection of `javascript:` or relative paths into `href` attributes.
 */
export type AbsoluteUrl = Brand<string, 'AbsoluteUrl'>;

/**
 * A POSIX-normalized relative file path (no leading slash, forward-slash
 * separators). Used for article output paths and sitemap entries.
 */
export type RelativeFilePath = Brand<string, 'RelativeFilePath'>;

// ─── Shared generation interfaces ───────────────────────────────────────────

/**
 * Cache-busting configuration injected into every HTML template.
 * Ensures browser and CDN caches are invalidated on each deploy.
 */
export interface CacheBustConfig {
  /** Short build hash appended as `?v=<hash>` to asset URLs */
  readonly buildShort: string;
  /** Full semantic version string (e.g. `0.8.59`) */
  readonly appVersion: string;
}

/**
 * Common page metadata shared by every generated HTML page (article,
 * sitemap, political-intelligence, news-index).
 */
export interface PageMeta {
  /** Target ISO 639-1 language code */
  readonly lang: LanguageCode;
  /** `<title>` element content */
  readonly title: string;
  /** `<meta name="description">` content */
  readonly description: string;
  /** Canonical URL of the page */
  readonly canonicalUrl: string;
  /** Text direction (`ltr` or `rtl`) */
  readonly dir: 'ltr' | 'rtl';
}

/**
 * Structured data (JSON-LD) payload shape shared across page types.
 * Each generator builds its own specialization but the base fields
 * are common.
 */
export interface BaseJsonLd {
  readonly '@context': 'https://schema.org';
  readonly '@type': string;
  readonly name: string;
  readonly url: string;
  readonly inLanguage: string;
}

/**
 * Options bag for any generator that produces multi-language output.
 * Every bounded context that emits per-language files accepts at least
 * these fields.
 */
export interface MultiLanguageGeneratorOptions {
  /** Subset of languages to generate (defaults to ALL_LANGUAGES) */
  readonly languages?: readonly LanguageCode[];
  /** Cache-busting parameters */
  readonly cacheBust: CacheBustConfig;
  /** Whether to include structured data (JSON-LD) in output */
  readonly includeStructuredData?: boolean;
}
