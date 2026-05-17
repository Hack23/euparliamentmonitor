// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/DateLabels
 * @description Pure date-label derivation helpers extracted from
 * `article-metadata.ts` as a leaf module in the `metadata/` bounded
 * context. Every helper takes an ISO `YYYY-MM-DD` string and returns a
 * human-friendly label (or `{start, end}` window) used by the per-article-type
 * template-fallback title generators.
 *
 * Bounded-context rules for this file:
 * - **No upward imports** — pure helpers, no dependencies on other
 *   `src/aggregator/` modules, no I/O, no globals.
 * - **Deterministic** — same input always produces same output; safe to
 *   call from property-based tests.
 * - **UTC-only** — all parsing/formatting goes through `Date` UTC accessors,
 *   never local-time `getMonth()`/`getDate()`.
 *
 * Cross-references:
 * - EP-term boundary constants follow
 *   {@link analysis/methodologies/electoral-cycle-methodology.md}.
 * - The D-36 → D-8 reporting window for `week-in-review` follows ADR-006
 *   (EP roll-call publication lag).
 */

/** Milliseconds in one UTC day — used by date-window derivation helpers. */
export const MS_PER_DAY = 86_400_000;

/**
 * EP-term boundary constants — keep these in sync with
 * {@link analysis/methodologies/electoral-cycle-methodology.md}.
 *  - EP10: 16 Jul 2024 → ~end of June 2029
 *  - EP11: ~Jul 2029 → ~Jun 2034
 */
export const EP10_START_YEAR = 2024;
export const EP10_END_YEAR = 2029;
export const EP11_END_YEAR = 2034;
/** June — EP elections are held the first week of June every 5 years. */
export const EP_ELECTION_MONTH = 6;

/**
 * Parse an ISO date string as UTC midnight. Returns `null` for malformed
 * input so callers can skip month/week derivation gracefully.
 *
 * @param iso - ISO date string (`YYYY-MM-DD`)
 * @returns Parsed `Date` or `null`
 */
export function parseIsoDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const parsed = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Format a `Date` as `YYYY-MM-DD` in UTC.
 *
 * @param d - Date object
 * @returns ISO date string
 */
export function formatIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parse an ISO date and return the `[start, end]` week range as ISO
 * strings. Week starts on Monday and ends on the following Sunday.
 *
 * @param date - ISO date string (`YYYY-MM-DD`)
 * @returns `{ start, end }` both in `YYYY-MM-DD` form
 */
export function deriveWeekRange(date: string): { readonly start: string; readonly end: string } {
  const parsed = parseIsoDate(date);
  if (!parsed) return { start: date, end: date };
  const day = parsed.getUTCDay();
  const shift = (day + 6) % 7;
  const startMs = parsed.getTime() - shift * MS_PER_DAY;
  const endMs = startMs + 6 * MS_PER_DAY;
  return { start: formatIsoDate(new Date(startMs)), end: formatIsoDate(new Date(endMs)) };
}

/**
 * Return the D-36 → D-8 reporting window for the `week-in-review`
 * article type. EP roll-call voting data is published with a 2–6 week
 * lag, so using the most-recent 7 days structurally produces a
 * vote-empty dataset. Shifting 8 days back and widening to 28 days
 * (start = D-36, end = D-8) ensures the window always contains at
 * least one full EP plenary week with published roll-call data
 * (ADR-006). Direction is consistent with the workflow's
 * `DATE_FROM` (start = D-36) → `DATE_TO` (end = D-8) variables.
 *
 * @param date - ISO article date string (`YYYY-MM-DD`) — typically TODAY
 * @returns `{ start: D-36, end: D-8 }` both as `YYYY-MM-DD` ISO strings
 */
export function deriveReportingWindowForWeekInReview(date: string): {
  readonly start: string;
  readonly end: string;
} {
  const parsed = parseIsoDate(date);
  if (!parsed) return { start: date, end: date };
  return {
    start: formatIsoDate(new Date(parsed.getTime() - 36 * MS_PER_DAY)),
    end: formatIsoDate(new Date(parsed.getTime() - 8 * MS_PER_DAY)),
  };
}

/**
 * Return a human-friendly month label for an ISO date — English month
 * name + four-digit year (e.g. `April 2026`). The non-English template
 * generators accept this same label verbatim because they interpolate it
 * into a localized sentence rather than translating the month itself.
 *
 * @param date - ISO date string
 * @returns Month label, or the input when parsing fails
 */
export function deriveMonthLabel(date: string): string {
  const parsed = parseIsoDate(date);
  if (!parsed) return date;
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const name = monthNames[parsed.getUTCMonth()] ?? '';
  return `${name} ${parsed.getUTCFullYear()}`.trim();
}

/**
 * Return a quarter label for an ISO date — `Q<n> <YYYY>` (e.g. `Q2 2026`).
 * Used by `quarter-ahead` and `quarter-in-review` title generators.
 *
 * @param date - ISO date string
 * @returns Quarter label, or the input when parsing fails
 */
export function deriveQuarterLabel(date: string): string {
  const parsed = parseIsoDate(date);
  if (!parsed) return date;
  const quarter = Math.floor(parsed.getUTCMonth() / 3) + 1;
  return `Q${quarter} ${parsed.getUTCFullYear()}`;
}

/**
 * Return a four-digit year label for an ISO date. Used by `year-ahead`
 * and `year-in-review` title generators.
 *
 * @param date - ISO date string
 * @returns Year label, or the input when parsing fails
 */
export function deriveYearLabel(date: string): string {
  const parsed = parseIsoDate(date);
  if (!parsed) return date;
  return String(parsed.getUTCFullYear());
}

/**
 * Return the EP-term label for an ISO date — `EP10 → 2029` or `EP11 → 2034`.
 * Used by `term-outlook` title generator.
 *
 * @param date - ISO date string
 * @returns Term label, or the input when parsing fails
 */
export function deriveTermLabel(date: string): string {
  const parsed = parseIsoDate(date);
  if (!parsed) return date;
  const year = parsed.getUTCFullYear();
  const month = parsed.getUTCMonth() + 1;
  if (year < EP10_START_YEAR) return `EP9 → ${EP10_START_YEAR}`;
  if (year < EP10_END_YEAR || (year === EP10_END_YEAR && month <= EP_ELECTION_MONTH)) {
    return `EP10 → ${EP10_END_YEAR}`;
  }
  if (year < EP11_END_YEAR || (year === EP11_END_YEAR && month <= EP_ELECTION_MONTH)) {
    return `EP11 → ${EP11_END_YEAR}`;
  }
  const yearsBeyond = year - EP11_END_YEAR;
  const offset = month <= EP_ELECTION_MONTH ? 0 : 1;
  const termsBeyond = Math.floor((yearsBeyond - 1 + offset) / 5) + 1;
  const termIndex = 11 + termsBeyond;
  const termEnd = EP11_END_YEAR + 5 * termsBeyond;
  return `EP${termIndex} → ${termEnd}`;
}

/**
 * Return the election-cycle label for an ISO date — pairs the outgoing
 * and incoming EP terms with the election year (e.g. `EP10 → EP11 (2029)`).
 * Used by the `election-cycle` title generator.
 *
 * @param date - ISO date string
 * @returns Cycle label, or the input when parsing fails
 */
export function deriveElectionCycleLabel(date: string): string {
  const parsed = parseIsoDate(date);
  if (!parsed) return date;
  const year = parsed.getUTCFullYear();
  if (year <= EP10_END_YEAR) return `EP10 → EP11 (${EP10_END_YEAR})`;
  if (year <= EP11_END_YEAR) return `EP11 → EP12 (${EP11_END_YEAR})`;
  const cyclesBeyond = Math.ceil((year - EP11_END_YEAR) / 5);
  const electionYear = EP11_END_YEAR + 5 * cyclesBeyond;
  const out = 11 + cyclesBeyond;
  return `EP${out} → EP${out + 1} (${electionYear})`;
}
