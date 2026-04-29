// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Infra/GithubUrls
 * @description Single source of truth for the `Hack23/euparliamentmonitor`
 * repository slug and helpers that build canonical GitHub URLs (blob, raw,
 * tree). Centralising the constants here removes the previous duplication
 * between `clean-artifact.ts` (which historically owned `githubBlobUrl` /
 * `githubRawUrl`) and `article-generator.ts` (which embedded the same slug
 * literally inside an `isBasedOn` template string).
 *
 * Every consumer should import from here; the original entry points in
 * `clean-artifact.ts` are preserved as thin re-export shims for back-compat.
 */
/** Hack23 repo slug used when building blob/raw/tree URLs. */
export const REPO_SLUG = 'Hack23/euparliamentmonitor';
/** Default branch used in generated URLs. */
export const REPO_BRANCH = 'main';
/**
 * Normalise a repo-relative path to POSIX form before embedding it in a URL.
 *
 * @param relPath - Repo-relative file path (POSIX or Windows separators)
 * @returns Same path with `\` replaced by `/`
 */
function toPosix(relPath) {
    return relPath.replace(/\\/g, '/');
}
/**
 * Build a GitHub blob URL for a repo-relative file path.
 *
 * @param relPath - Repo-relative file path
 * @returns Absolute `https://github.com/.../blob/<branch>/...` URL
 */
export function blobUrl(relPath) {
    return `https://github.com/${REPO_SLUG}/blob/${REPO_BRANCH}/${toPosix(relPath)}`;
}
/**
 * Build a `raw.githubusercontent.com` URL for a repo-relative file path.
 *
 * @param relPath - Repo-relative file path
 * @returns Absolute raw-content URL
 */
export function rawUrl(relPath) {
    return `https://raw.githubusercontent.com/${REPO_SLUG}/${REPO_BRANCH}/${toPosix(relPath)}`;
}
/**
 * Build a GitHub tree URL for a repo-relative directory path.
 *
 * @param relPath - Repo-relative directory path (no trailing slash needed)
 * @returns Absolute `https://github.com/.../tree/<branch>/...` URL
 */
export function treeUrl(relPath) {
    return `https://github.com/${REPO_SLUG}/tree/${REPO_BRANCH}/${toPosix(relPath)}`;
}
//# sourceMappingURL=github-urls.js.map