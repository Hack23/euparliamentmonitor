// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/LocalizedKeywords
 * @description Per-language SEO base keywords per article category. Editing one language no longer touches any article body strings.
 *
 * Per-language strings live together so a translator can update one language
 * for this article type without touching any other article type.
 */

import type { LanguageMap } from '../../types/index.js';
import { LOCALIZED_KEYWORDS_NORDIC } from './localized-keywords-nordic.js';
import { LOCALIZED_KEYWORDS_CENTRAL } from './localized-keywords-central.js';
import { LOCALIZED_KEYWORDS_GLOBAL } from './localized-keywords-global.js';

export const LOCALIZED_KEYWORDS: LanguageMap<Record<string, readonly string[]>> = {
  ...LOCALIZED_KEYWORDS_NORDIC,
  ...LOCALIZED_KEYWORDS_CENTRAL,
  ...LOCALIZED_KEYWORDS_GLOBAL,
};

/** Week ahead title templates per language */
