// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/MetadataUtils
 * @description Shared helpers for article metadata generation.
 */

/**
 * Return singular or plural form based on count.
 *
 * @param n - Item count
 * @param singular - Singular form
 * @param plural - Plural form
 * @returns `"N singular"` or `"N plural"`
 */
export function pl(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
