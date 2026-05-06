// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * Reduction factors applied to line-floor thresholds per data mode.
 * Structural checks (mermaid, WEP, Admiralty, SATs) are never reduced.
 */
export const DATA_MODE_REDUCTION = {
    full: 1.0,
    'title-only': 0.75,
    'degraded-imf': 0.85,
    'degraded-voting': 0.85,
    minimal: 0.65,
};
//# sourceMappingURL=types.js.map