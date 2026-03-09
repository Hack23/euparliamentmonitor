// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/** Featured committees to include in committee reports */
export const FEATURED_COMMITTEES = ['ENVI', 'ECON', 'AFET', 'LIBE', 'AGRI'];
/** Sentinel value used when no real chair data is available from MCP */
export const PLACEHOLDER_CHAIR = 'N/A';
/** Sentinel value used when no real member count data is available from MCP */
export const PLACEHOLDER_MEMBERS = 0;
/**
 * Apply committee info from MCP result to the data object
 *
 * @param result - MCP tool result
 * @param data - Committee data to populate
 * @param abbreviation - Fallback abbreviation
 */
export function applyCommitteeInfo(result, data, abbreviation) {
    try {
        if (!result?.content?.[0])
            return;
        const parsed = JSON.parse(result.content[0].text);
        if (!parsed.committee)
            return;
        data.name = parsed.committee.name ?? data.name;
        data.abbreviation = parsed.committee.abbreviation ?? abbreviation;
        data.chair = parsed.committee.chair ?? PLACEHOLDER_CHAIR;
        const memberCountRaw = parsed.committee.memberCount;
        let memberCount = 0;
        if (typeof memberCountRaw === 'number' && Number.isFinite(memberCountRaw)) {
            memberCount = memberCountRaw;
        }
        else if (typeof memberCountRaw === 'string') {
            const parsedNumber = Number(memberCountRaw);
            if (Number.isFinite(parsedNumber)) {
                memberCount = parsedNumber;
            }
        }
        data.members = memberCount;
        console.log(`  ✅ Committee info: ${data.name} (${data.members} members)`);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('  ⚠️ Failed to parse committee info:', message);
    }
}
/**
 * Apply documents from MCP result to the data object
 *
 * @param result - MCP tool result
 * @param data - Committee data to populate
 */
export function applyDocuments(result, data) {
    try {
        if (!result?.content?.[0])
            return;
        const parsed = JSON.parse(result.content[0].text);
        if (!parsed.documents || parsed.documents.length === 0)
            return;
        data.documents = parsed.documents.map((d) => ({
            title: d.title ?? 'Untitled Document',
            type: d.type ?? d.documentType ?? 'Document',
            date: d.date ?? '',
        }));
        console.log(`  ✅ Fetched ${data.documents.length} documents from MCP`);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('  ⚠️ Failed to parse documents:', message);
    }
}
/**
 * Detect whether a list of committee data entries are all fallback/default placeholders.
 *
 * A committee entry is considered a placeholder when the MCP fetch produced no real
 * data — i.e. `chair` is still the sentinel `'N/A'`, `members` is 0, and the
 * `documents` list is empty. This typically happens when the MCP server is
 * unavailable and `fetchCommitteeData` returns the `defaultResult` unchanged.
 *
 * Returns `true` only when:
 * - the list is non-empty **and**
 * - every committee entry matches all three placeholder criteria.
 *
 * An empty list returns `false` so that a genuine zero-committee scenario is still
 * rendered (the caller can decide how to handle it).
 *
 * @param committees - Committee data entries to inspect
 * @returns `true` when all entries are default/placeholder data; `false` otherwise
 */
export function isPlaceholderCommitteeData(committees) {
    return (committees.length > 0 &&
        committees.every((c) => c.chair === PLACEHOLDER_CHAIR &&
            c.members === PLACEHOLDER_MEMBERS &&
            c.documents.length === 0));
}
/**
 * Apply effectiveness metrics from MCP result to the data object
 *
 * @param result - MCP tool result
 * @param data - Committee data to populate
 */
export function applyEffectiveness(result, data) {
    try {
        if (!result?.content?.[0])
            return;
        const parsed = JSON.parse(result.content[0].text);
        if (!parsed.effectiveness)
            return;
        const score = parsed.effectiveness.overallScore;
        const rank = parsed.effectiveness.rank ?? '';
        data.effectiveness =
            typeof score === 'number' && Number.isFinite(score)
                ? `Score: ${score.toFixed(1)} ${rank}`.trim()
                : null;
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('  ⚠️ Failed to parse effectiveness:', message);
    }
}
//# sourceMappingURL=committee-helpers.js.map