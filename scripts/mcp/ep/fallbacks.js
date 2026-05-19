// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/ep/fallbacks
 * @description Fallback payload constants for European Parliament MCP tools.
 */
/** Fallback payload for analyze_legislative_effectiveness when validation fails or tool is unavailable */
export const EFFECTIVENESS_FALLBACK = '{"effectiveness": null}';
/** Fallback payload for MEP list tools */
export const MEPS_FALLBACK = '{"meps": []}';
/** Fallback payload for document list tools */
export const DOCUMENTS_FALLBACK = '{"documents": []}';
/** Fallback payload for event list tools */
export const EVENTS_FALLBACK = '{"events": []}';
/** Fallback payload for activity list tools */
export const ACTIVITIES_FALLBACK = '{"activities": []}';
/** Fallback payload for item list tools */
export const ITEMS_FALLBACK = '{"items": []}';
/** Fallback payload for intelligence analysis tools */
export const INTELLIGENCE_FALLBACK = '{"analysis": null}';
/** Fallback payload for precomputed statistics */
export const STATS_FALLBACK = '{"stats": null}';
/** Fallback payload for single procedure event lookup */
export const PROCEDURE_EVENT_FALLBACK = '{"event": null}';
/** Fallback payload for server health status */
export const SERVER_HEALTH_FALLBACK = '{"server": null, "feeds": []}';
/** Fallback payload for adopted texts tools */
export const ADOPTED_TEXTS_FALLBACK = '{"texts": []}';
/** Canonical text used when a feed payload is unavailable without explicit detail. */
export const FEED_UNAVAILABLE_REASON = 'feed unavailable';
/**
 * Substring matched (case-insensitively) in error messages to identify the
 * EP Open Data Portal indexing lag (5–15 days between identifier publication
 * and content availability).  Must not be changed without updating tests.
 */
export const CONTENT_NOT_YET_AVAILABLE_SUBSTRING = 'document indexed but content not yet available';
//# sourceMappingURL=fallbacks.js.map