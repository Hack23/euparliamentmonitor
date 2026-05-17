// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Constants/OgLocales
 * @description Backward-compatible re-export shim. The canonical
 * location is `src/constants/seo/og-locales.ts`; this file remains so
 * existing imports `from '../constants/og-locales.js'` keep working
 * through the May-2026 architecture refactor.
 *
 * New code SHOULD import from `src/constants/seo/index.js`:
 *
 * ```ts
 * import { OG_LOCALES, getOgLocale, buildOgLocaleTags } from '../constants/seo/index.js';
 * ```
 */
export { OG_LOCALES, getOgLocale, buildOgLocaleTags } from './seo/og-locales.js';
//# sourceMappingURL=og-locales.js.map