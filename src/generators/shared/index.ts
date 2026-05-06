// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Shared
 * @description Public re-exports for the shared generators bounded context.
 * Provides branded types, escape utilities, and template helpers used by
 * all HTML/XML/RSS generation sub-contexts.
 *
 * Consumers should import from this barrel:
 * ```ts
 * import { toSafeHtml, toSafeXml, cacheBustUrl } from '../shared/index.js';
 * import type { SafeHtmlString, PageMeta, CacheBustConfig } from '../shared/index.js';
 * ```
 */

// Branded types and shared interfaces
export type {
  SafeHtmlString,
  SafeXmlString,
  AbsoluteUrl,
  RelativeFilePath,
  CacheBustConfig,
  PageMeta,
  BaseJsonLd,
  MultiLanguageGeneratorOptions,
} from './types.js';

// Escape utilities (branded-type producers)
export {
  toSafeHtml,
  toSafeXml,
  toAbsoluteUrl,
  toRelativeFilePath,
} from './html-escape.js';

// Template helpers
export {
  cacheBustUrl,
  buildHtmlOpenTag,
  buildMetaTag,
  buildOgMetaTag,
  getDirection,
  buildHreflangLink,
} from './template-helpers.js';
