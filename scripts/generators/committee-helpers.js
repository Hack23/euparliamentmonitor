// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/** Featured committees to include in committee reports */
export const FEATURED_COMMITTEES = ['ENVI', 'ECON', 'AFET', 'LIBE', 'AGRI'];
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
        data.chair = parsed.committee.chair ?? 'N/A';
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