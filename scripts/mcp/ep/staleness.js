// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/ep/staleness
 * @description Procedures-feed staleness detection for EP MCP tools.
 */
/**
 * Staleness threshold for procedures feed responses.
 * Any response where the newest dated item is earlier than this year is treated as stale.
 * See `.github/prompts/07-mcp-reference.md` §11 row #5.
 */
export const PROCEDURES_STALENESS_YEAR_THRESHOLD = 2020;
/**
 * Minimum plausible year for EP procedure dates.
 * The European Parliament was established in 1952; anything earlier is malformed.
 */
export const MIN_VALID_PROCEDURE_YEAR = 1952;
/**
 * Maximum plausible year for EP procedure dates.
 * Used as an upper sanity bound to reject obviously malformed 4-digit strings.
 */
export const MAX_VALID_PROCEDURE_YEAR = 2100;
/**
 * Extract the first valid 4-digit year from an EP procedure item.
 * Checks `dateInitiated`, then `dateLastActivity`, then the first 4 characters
 * of `reference` (e.g. `"1972/0001(SYN)"`), returning `NaN` when none found.
 *
 * @param obj - Procedure item as a plain record
 * @returns 4-digit year number, or `NaN` if no valid year field exists
 */
export function extractProcedureItemYear(obj) {
    const dateFields = [obj['dateInitiated'], obj['dateLastActivity'], obj['reference']];
    for (const field of dateFields) {
        if (typeof field !== 'string' || field.length < 4)
            continue;
        const year = Number(field.slice(0, 4));
        if (!Number.isNaN(year) &&
            year >= MIN_VALID_PROCEDURE_YEAR &&
            year <= MAX_VALID_PROCEDURE_YEAR) {
            return year;
        }
    }
    return NaN;
}
/**
 * Detect whether a procedures feed response is in a stale historical-tail mode —
 * i.e., the newest dated item is older than
 * {@link PROCEDURES_STALENESS_YEAR_THRESHOLD}.
 *
 * During parliamentary recesses the EP procedures/feed endpoint may return historical
 * archive data in ID order rather than current procedures. This function detects that
 * condition so callers can emit a `🟡 procedures-feed: recess mode` audit row instead
 * of treating the response as usable current data.
 *
 * Date extraction order per item: `dateInitiated`, then `dateLastActivity`, then
 * `reference` (first four characters). The first valid 4-digit year found in the
 * range `[1952, 2100]` is used.
 *
 * Returns `false` when the payload is `undefined`, contains no items, or has no
 * parseable years.
 *
 * @param payload - Parsed procedures feed payload
 * @returns `true` when the newest dated item is earlier than `PROCEDURES_STALENESS_YEAR_THRESHOLD`
 */
export function detectProceduresFeedStaleTail(payload) {
    if (!payload)
        return false;
    const rawItems = payload['items'] ?? payload['procedures'];
    const items = Array.isArray(rawItems) ? rawItems : [];
    if (items.length === 0)
        return false;
    const years = [];
    for (const item of items) {
        if (!item || typeof item !== 'object')
            continue;
        const year = extractProcedureItemYear(item);
        if (!Number.isNaN(year)) {
            years.push(year);
        }
    }
    if (years.length === 0)
        return false;
    return Math.max(...years) < PROCEDURES_STALENESS_YEAR_THRESHOLD;
}
//# sourceMappingURL=staleness.js.map