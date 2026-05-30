// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Constants/Seo
 * @description Bounded-context barrel for the SEO-header constants
 * shared by the four public HTML surfaces (news article, news index,
 * sitemap, political-intelligence landing).
 *
 * Public API:
 * - `OG_LOCALES`, `getOgLocale`, `buildOgLocaleTags` — BCP-47 locale
 *   mapping and tag emitters for the OpenGraph `og:locale[:alternate]`
 *   block.
 * - `ORG_SAME_AS`, `TWITTER_SITE_HANDLE`, `TWITTER_CREATOR_HANDLE`,
 *   `buildTwitterAttributionTags` — canonical publisher/handles.
 *
 * Consumers MUST import from `src/constants/seo/index.js` (this
 * barrel), not from the individual files inside `src/constants/seo/`.
 * The drift-guard unit test in `test/unit/bounded-contexts.test.js`
 * enforces this contract.
 */
export { OG_LOCALES, getOgLocale, buildOgLocaleTags } from './og-locales.js';
export { TWITTER_SITE_HANDLE, TWITTER_CREATOR_HANDLE, ORG_SAME_AS, buildTwitterAttributionTags, } from './social-handles.js';
export { SEO_CONTEXT_LABELS } from './context-labels.js';
//# sourceMappingURL=index.js.map