// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/FileUtils
 * @description Stable barrel re-export of shared file/HTML/article utilities.
 *
 * The original 850-LOC `file-utils.ts` was split (issue #2032) into focused
 * sub-modules under `src/utils/fs/`, `src/utils/articles/` and
 * `src/utils/html/`. This barrel preserves every public import path used by
 * `src/` and `scripts/` so consumers do not need to be touched.
 *
 * Prefer importing directly from the targeted sub-module in new code:
 *
 * - `src/utils/fs/atomic-write.js`       — atomic & idempotent file writes
 * - `src/utils/fs/directory.js`          — directory creation / claim
 * - `src/utils/articles/filename.js`     — article filename parsing
 * - `src/utils/articles/slug.js`         — slug / date / read-time helpers
 * - `src/utils/articles/metadata.js`     — manifest history & meta extraction
 * - `src/utils/articles/analysis-discovery.js` — analysis-file discovery
 * - `src/utils/html/escape.js`           — canonical XSS-safe encoder
 * - `src/utils/html/validate.js`         — URL safety & article HTML validation
 */

export {
  getNewsArticles,
  parseArticleFilename,
  groupArticlesByLanguage,
  checkArticleExists,
} from './articles/filename.js';

export {
  formatSlug,
  formatDateForSlug,
  calculateReadTime,
  getModifiedDate,
} from './articles/slug.js';

export {
  extractArticleMeta,
  mergeManifestHistory,
  readLatestGateResult,
  readLatestResolvedGateResult,
} from './articles/metadata.js';
export type { AnalysisManifestHistoryEntry } from './articles/metadata.js';

export { discoverAnalysisFileEntries } from './articles/analysis-discovery.js';

export { ensureDirectoryExists, resolveUniqueAnalysisDir } from './fs/directory.js';

export {
  writeFileContent,
  writeFileIfChanged,
  atomicWrite,
  resolveUniqueFilePath,
} from './fs/atomic-write.js';

export { escapeHTML } from './html/escape.js';

export { isSafeURL, validateArticleHTML } from './html/validate.js';
export type { ArticleValidationResult } from './html/validate.js';
