// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/SocialHandles
 * @description Backward-compatible re-export shim. The canonical
 * location is `src/constants/seo/social-handles.ts`; this file remains
 * so existing imports `from '../constants/social-handles.js'` keep
 * working through the May-2026 architecture refactor.
 *
 * New code SHOULD import from `src/constants/seo/index.js`.
 */

export {
  TWITTER_SITE_HANDLE,
  TWITTER_CREATOR_HANDLE,
  ORG_SAME_AS,
  buildTwitterAttributionTags,
} from './seo/social-handles.js';
