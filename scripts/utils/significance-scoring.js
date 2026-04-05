// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
// ─── Markdown sanitization ────────────────────────────────────────────────────
/**
 * Sanitize untrusted text for safe use in a Markdown table cell.
 *
 * Escapes pipe characters, backslashes, and HTML entities, then normalizes
 * whitespace to prevent table layout corruption from external EP data.
 *
 * @param input - Untrusted cell text
 * @returns Sanitized text safe for Markdown table cells
 */
function sanitizeMdCell(input) {
    return input
        .replace(/\\/gu, '\\\\')
        .replace(/\|/gu, '\\|')
        .replace(/&/gu, '&amp;')
        .replace(/</gu, '&lt;')
        .replace(/>/gu, '&gt;')
        .replace(/[\r\n]+/gu, ' ')
        .trim();
}
/**
 * Normalize a reference string: treat empty / whitespace-only values as
 * missing so that the table cell shows a placeholder instead of blank.
 *
 * @param ref - Optional reference string
 * @returns The trimmed reference, or undefined if empty/missing
 */
function normalizeRef(ref) {
    if (!ref)
        return undefined;
    const trimmed = ref.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
// ─── Scoring constants ────────────────────────────────────────────────────────
/** Weight applied to Parliamentary Significance dimension */
export const WEIGHT_PARLIAMENTARY = 0.25;
/** Weight applied to Policy Impact dimension */
export const WEIGHT_POLICY = 0.25;
/** Weight applied to Public Interest dimension */
export const WEIGHT_PUBLIC_INTEREST = 0.2;
/** Weight applied to Temporal Urgency dimension */
export const WEIGHT_URGENCY = 0.15;
/** Weight applied to Institutional / Cross-Group Relevance dimension */
export const WEIGHT_INSTITUTIONAL = 0.15;
/** Minimum score floor (dimension and composite) */
const SCORE_MIN = 0;
/** Maximum score ceiling (dimension and composite) */
const SCORE_MAX = 10;
/** Composite score at or above which the decision is "publish" */
export const THRESHOLD_PUBLISH = 6.0;
/** Composite score at or above which the decision is "hold" (below publish) */
export const THRESHOLD_HOLD = 4.0;
// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Clamp a numeric value to the 0–10 scoring range.
 *
 * @param value - Raw numeric input
 * @returns Value clamped to [0, 10]
 */
export function clampScore(value) {
    if (!Number.isFinite(value))
        return SCORE_MIN;
    return Math.min(SCORE_MAX, Math.max(SCORE_MIN, value));
}
/**
 * Derive a publication decision from a composite score.
 *
 * @param composite - Weighted composite score (0–10)
 * @returns Publication decision
 */
export function deriveDecision(composite) {
    if (composite >= THRESHOLD_PUBLISH)
        return 'publish';
    if (composite >= THRESHOLD_HOLD)
        return 'hold';
    return 'skip';
}
// ─── Core scoring ─────────────────────────────────────────────────────────────
/**
 * Compute a composite significance score for a single event.
 *
 * All dimension values are clamped to [0, 10].  The composite is the
 * weighted average using the standard template weights.
 *
 * @param input - Dimension scores for one event
 * @returns Significance score with composite and publication decision
 */
export function scoreSignificance(input) {
    const parliamentarySignificance = clampScore(input.parliamentarySignificance);
    const policyImpact = clampScore(input.policyImpact);
    const publicInterest = clampScore(input.publicInterest);
    const temporalUrgency = clampScore(input.temporalUrgency);
    const institutionalRelevance = clampScore(input.institutionalRelevance);
    const composite = parliamentarySignificance * WEIGHT_PARLIAMENTARY +
        policyImpact * WEIGHT_POLICY +
        publicInterest * WEIGHT_PUBLIC_INTEREST +
        temporalUrgency * WEIGHT_URGENCY +
        institutionalRelevance * WEIGHT_INSTITUTIONAL;
    const roundedComposite = Math.round(composite * 100) / 100;
    return {
        parliamentarySignificance,
        policyImpact,
        publicInterest,
        temporalUrgency,
        institutionalRelevance,
        composite: roundedComposite,
        decision: deriveDecision(composite),
    };
}
/**
 * Score a batch of events and return ranked results with a summary.
 *
 * Events are scored individually then sorted by composite score descending.
 *
 * @param inputs - Array of event scoring inputs
 * @returns Batch result with ranked scores and decision summary counts
 */
export function scoreBatch(inputs) {
    const scores = inputs.map(scoreSignificance);
    // Sort by composite descending (stable sort preserves input order for ties)
    const ranked = [...scores].sort((a, b) => b.composite - a.composite);
    const summary = { publish: 0, hold: 0, skip: 0 };
    for (const s of ranked) {
        summary[s.decision]++;
    }
    return { scores: ranked, summary };
}
/**
 * Generate a markdown report for a single significance score.
 *
 * Produces a table matching the template format with dimension breakdown,
 * composite calculation, and publication decision.
 *
 * @param score - Computed significance score
 * @param title - Event title
 * @param reference - Optional EP reference identifier
 * @returns Markdown string
 */
export function formatScoreMarkdown(score, title, reference) {
    const safeTitle = sanitizeMdCell(title);
    const safeRef = normalizeRef(reference);
    const refLine = safeRef ? `| **EP Reference** | \`${sanitizeMdCell(safeRef)}\` |\n` : '';
    const decisionEmoji = score.decision === 'publish' ? '📰' : score.decision === 'hold' ? '📋' : '🗄️';
    const decisionLabel = score.decision === 'publish' ? 'Publish' : score.decision === 'hold' ? 'Hold' : 'Skip';
    return `### ${safeTitle}

| Field | Value |
|-------|-------|
| **Event** | ${safeTitle} |
${refLine}
| Dimension | Raw Score | Weight | Weighted Score |
|-----------|:---------:|:------:|:--------------:|
| Parliamentary Significance | ${score.parliamentarySignificance.toFixed(1)} | ${WEIGHT_PARLIAMENTARY} | ${(score.parliamentarySignificance * WEIGHT_PARLIAMENTARY).toFixed(2)} |
| Policy Impact | ${score.policyImpact.toFixed(1)} | ${WEIGHT_POLICY} | ${(score.policyImpact * WEIGHT_POLICY).toFixed(2)} |
| Public Interest | ${score.publicInterest.toFixed(1)} | ${WEIGHT_PUBLIC_INTEREST} | ${(score.publicInterest * WEIGHT_PUBLIC_INTEREST).toFixed(2)} |
| Temporal Urgency | ${score.temporalUrgency.toFixed(1)} | ${WEIGHT_URGENCY} | ${(score.temporalUrgency * WEIGHT_URGENCY).toFixed(2)} |
| Institutional Relevance | ${score.institutionalRelevance.toFixed(1)} | ${WEIGHT_INSTITUTIONAL} | ${(score.institutionalRelevance * WEIGHT_INSTITUTIONAL).toFixed(2)} |
| **COMPOSITE SCORE** | — | — | **${score.composite.toFixed(2)} / 10** |

**Decision:** ${decisionEmoji} **${decisionLabel}**
`;
}
/**
 * Generate a batch scoring markdown table.
 *
 * Produces the Section 2 batch table from the template format.
 * Scores must be in the same order as inputs (one score per input).
 *
 * @param inputs - Scoring inputs with titles and references
 * @param scores - Pre-computed significance scores (same order as inputs)
 * @returns Markdown table string
 */
export function formatBatchMarkdown(inputs, scores) {
    const header = '| Event | EP Reference | Parl. | Policy | Public | Urgency | Instit. | **Composite** | Decision |';
    const separator = '|-------|-------------|:-----:|:------:|:------:|:-------:|:-------:|:-------------:|----------|';
    const rows = inputs.map((input, i) => {
        const s = scores[i] ?? {
            parliamentarySignificance: 0,
            policyImpact: 0,
            publicInterest: 0,
            temporalUrgency: 0,
            institutionalRelevance: 0,
            composite: 0,
            decision: 'skip',
        };
        const decisionLabel = s.decision === 'publish' ? 'Publish' : s.decision === 'hold' ? 'Hold' : 'Skip';
        const safeTitle = sanitizeMdCell(input.title);
        const safeRef = normalizeRef(input.reference);
        return `| ${safeTitle} | ${safeRef ? sanitizeMdCell(safeRef) : '—'} | ${s.parliamentarySignificance.toFixed(1)} | ${s.policyImpact.toFixed(1)} | ${s.publicInterest.toFixed(1)} | ${s.temporalUrgency.toFixed(1)} | ${s.institutionalRelevance.toFixed(1)} | **${s.composite.toFixed(2)}** | ${decisionLabel} |`;
    });
    return [header, separator, ...rows].join('\n');
}
//# sourceMappingURL=significance-scoring.js.map