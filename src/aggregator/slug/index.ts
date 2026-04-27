// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Slug
 * @description Public re-exports for the slug bounded context.
 */

export {
  buildArticleSlug,
  sanitizeRunSuffix,
  RUN_SUFFIX_MAX_LENGTH,
  DEFAULT_RUN_SUFFIX,
} from './slug.js';
