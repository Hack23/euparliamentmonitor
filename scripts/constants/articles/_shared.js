// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Constants/Articles/_Shared
 * @description Internal helper constants shared across multiple per-article-type
 * modules. Not part of the public surface — re-export from the article modules
 * if a consumer outside `src/constants/articles/` ever needs them.
 *
 * AI-marker placeholders: every analysis text string in the per-article-type
 * maps points at the same `[AI_ANALYSIS_REQUIRED]` sentinel that the article
 * generator detects to force the AI agent to fill in real analysis prose.
 */
/** Sentinel marker — text the AI agent MUST replace with real analysis prose */
export const AI_ANALYSIS_MARKER = '[AI_ANALYSIS_REQUIRED]';
// ─── Breaking (BRK_*) markers ────────────────────────────────────────────────
export const BRK_WHY_ANOMALIES = AI_ANALYSIS_MARKER;
export const BRK_WHY_NORMAL = AI_ANALYSIS_MARKER;
export const BRK_NEUTRAL_REASON = AI_ANALYSIS_MARKER;
export const BRK_LEGAL_CONSEQUENCE = AI_ANALYSIS_MARKER;
export const BRK_PROC_CONSEQUENCE = AI_ANALYSIS_MARKER;
export const BRK_IMPACT_ECONOMIC = AI_ANALYSIS_MARKER;
export const BRK_IMPACT_SOCIAL = AI_ANALYSIS_MARKER;
export const BRK_IMPACT_GEO_COALITION = AI_ANALYSIS_MARKER;
export const BRK_IMPACT_GEO_NORMAL = AI_ANALYSIS_MARKER;
export const BRK_MISTAKE_DESC = AI_ANALYSIS_MARKER;
export const BRK_MISTAKE_ALT = AI_ANALYSIS_MARKER;
// ─── Committee-reports (CMT_*) markers ───────────────────────────────────────
export const CMT_WHY = AI_ANALYSIS_MARKER;
export const CMT_NO_DOCS = AI_ANALYSIS_MARKER;
export const CMT_IMPACT_POLITICAL = AI_ANALYSIS_MARKER;
export const CMT_IMPACT_LEGAL = AI_ANALYSIS_MARKER;
export const CMT_ACTION_CONSEQUENCE = AI_ANALYSIS_MARKER;
export const CMT_MISTAKE_DESC = AI_ANALYSIS_MARKER;
export const CMT_MISTAKE_ALT = AI_ANALYSIS_MARKER;
export const CMT_OUTLOOK_GOOD = AI_ANALYSIS_MARKER;
export const CMT_OUTLOOK_CONCERN = AI_ANALYSIS_MARKER;
//# sourceMappingURL=_shared.js.map