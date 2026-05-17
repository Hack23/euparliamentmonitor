// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/SocialHandles
 * @description Verified social-media handles for `twitter:site` /
 * `twitter:creator` and the canonical organization sameAs list emitted
 * into JSON-LD on every generated page.
 *
 * Why this lives in one file: the OpenGraph crawler, the Twitter
 * card validator, and Google's structured-data `NewsMediaOrganization`
 * graph all expect the same handle and the same sameAs URLs. Keeping
 * them in one constant avoids drift between the four generators.
 *
 * **Empty-string semantics**: when a handle is not yet provisioned
 * the matching constant is `''` (empty string). The emit helpers
 * skip emitting an empty tag rather than producing
 * `<meta name="twitter:site" content="">`, which Twitter rejects as
 * malformed.
 */

/**
 * Twitter / X handle for the publishing organization, including the
 * leading `@`. Used for `<meta name="twitter:site">`.
 *
 * Currently empty (no verified Twitter presence as of May 2026); set
 * this to e.g. `'@hack23ab'` once the org account is verified, and
 * every generated page will start emitting the tag automatically.
 */
export const TWITTER_SITE_HANDLE = '';

/**
 * Twitter / X handle for the editorial team (defaults to the org
 * handle when no separate creator account exists). Used for
 * `<meta name="twitter:creator">`.
 */
export const TWITTER_CREATOR_HANDLE = '';

/**
 * Canonical sameAs URLs for the publishing `NewsMediaOrganization`.
 * Emitted into the JSON-LD graph on every article and landing page so
 * Google and other crawlers can verify the publisher identity across
 * its different surfaces.
 *
 * Order matters: most authoritative / most-trafficked surface first.
 */
export const ORG_SAME_AS: readonly string[] = [
  'https://github.com/Hack23',
  'https://github.com/Hack23/euparliamentmonitor',
  'https://hack23.com',
];

/**
 * Build the `twitter:site` / `twitter:creator` meta-tag block. Returns
 * an empty string when neither handle is configured so the caller can
 * safely interpolate the result without producing empty meta tags.
 *
 * @returns Newline-joined meta tags (no trailing newline) or `''`
 */
export function buildTwitterAttributionTags(): string {
  const tags: string[] = [];
  if (TWITTER_SITE_HANDLE) {
    tags.push(`  <meta name="twitter:site" content="${TWITTER_SITE_HANDLE}">`);
  }
  if (TWITTER_CREATOR_HANDLE) {
    tags.push(`  <meta name="twitter:creator" content="${TWITTER_CREATOR_HANDLE}">`);
  }
  return tags.join('\n');
}
