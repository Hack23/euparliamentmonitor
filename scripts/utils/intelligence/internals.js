// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/Intelligence/Internals
 * @description Private helpers shared across the intelligence-index
 * submodules: prototype-pollution-safe lookup maps, slug normalisation,
 * and attribute/text escapers used by the related-articles renderer.
 *
 * Not intended for use outside `src/utils/intelligence/`.
 */
/**
 * Keys that must never be used as lookup-map indices to prevent
 * prototype-pollution attacks from untrusted article metadata.
 *
 * - `__proto__` — directly sets the prototype chain of plain objects
 * - `constructor` — can be used to reach `Object` and mutate shared prototypes
 * - `prototype` — when combined with `constructor`, enables prototype injection
 */
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
/**
 * Return `true` when `key` is safe to use as a plain-object property.
 * Rejects `__proto__`, `constructor`, and `prototype` to avoid prototype
 * pollution when indexing untrusted topic/actor/procedure strings.
 *
 * @param key - The key to validate
 * @returns `true` if the key is safe to use as an object property
 */
export function isSafeKey(key) {
    return !DANGEROUS_KEYS.has(key);
}
/**
 * Create a null-prototype object suitable for use as a lookup map.
 * Unlike `{}`, these objects have no inherited keys, providing an extra
 * layer of defence against prototype-pollution.
 *
 * @returns A fresh null-prototype Record for use as a lookup map
 */
export function createNullMap() {
    return Object.create(null);
}
/**
 * Remove an article ID from every key's list in a lookup map.
 * Cleans up empty arrays left behind.
 * Skips dangerous keys (`__proto__`, `constructor`, `prototype`) to prevent
 * prototype pollution.
 *
 * @param map - Lookup map (actor/domain/procedure → article IDs)
 * @param keys - Keys to remove the article ID from
 * @param articleId - Article ID to remove
 */
export function removeIdFromMap(map, keys, articleId) {
    for (const key of keys) {
        if (!isSafeKey(key))
            continue;
        const list = map[key];
        if (!list)
            continue;
        const filtered = list.filter((id) => id !== articleId);
        if (filtered.length === 0) {
            delete map[key];
        }
        else {
            map[key] = filtered;
        }
    }
}
/**
 * Add an article ID to every key's list in a lookup map (deduplicating).
 * Skips dangerous keys (`__proto__`, `constructor`, `prototype`) to prevent
 * prototype pollution.
 *
 * @param map - Lookup map (actor/domain/procedure → article IDs)
 * @param keys - Keys under which to register the article ID
 * @param articleId - Article ID to add
 */
export function addIdToMap(map, keys, articleId) {
    for (const key of keys) {
        if (!isSafeKey(key))
            continue;
        const existing = map[key] ?? [];
        if (!existing.includes(articleId)) {
            map[key] = [...existing, articleId];
        }
    }
}
/**
 * Convert a string to a URL-safe slug.
 *
 * Uses Unicode-aware character classes so non-Latin scripts (e.g. Arabic,
 * Hebrew, CJK) produce meaningful slugs instead of collapsing to `""`.
 * When the result would still be empty (e.g. purely punctuation input) a
 * short deterministic hash is returned as a fallback.
 *
 * @param text - Input string
 * @returns Slugified string (never empty)
 */
export function slugify(text) {
    const slug = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+/u, '')
        .replace(/-+$/u, '');
    if (slug.length > 0)
        return slug;
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
    }
    return `h${Math.abs(hash).toString(36)}`;
}
/**
 * Escape HTML attribute special characters.
 *
 * @param text - Raw text
 * @returns Escaped text safe for HTML attributes
 */
export function escapeAttr(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
/**
 * Escape HTML text content special characters.
 *
 * @param text - Raw text
 * @returns Escaped text safe for HTML text nodes
 */
export function escapeText(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
//# sourceMappingURL=internals.js.map