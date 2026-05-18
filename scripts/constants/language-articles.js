// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Constants/LanguageArticles
 * @description Thin re-export barrel preserving the legacy import path.
 *
 * The implementation now lives split by article type under
 * {@link Constants/Articles}. Editing one language for one article type
 * touches a single file under `src/constants/articles/`, eliminating
 * cross-type translator merge contention.
 *
 * New code should import from `../constants/articles/index.js` directly.
 */
export * from './articles/index.js';
//# sourceMappingURL=language-articles.js.map