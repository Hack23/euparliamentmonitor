// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
// ─── MCP Response validation ──────────────────────────────────────────────────
/**
 * Validate that an MCP tool response has the standard envelope shape:
 * `{ content: [{ text: string }] }`.
 *
 * Does **not** throw — returns a {@link ValidationResult} so callers can
 * choose their own degradation strategy.
 *
 * @param toolName - Tool name used in warning messages
 * @param data - Raw response to validate
 * @returns Validation result with any error descriptions
 */
export function validateMCPResponse(toolName, data) {
    const errors = [];
    if (data === null || data === undefined) {
        errors.push('Response is null or undefined');
        console.warn(`⚠️ MCP validation failed for ${toolName}: response is null/undefined`);
        return { valid: false, errors };
    }
    if (typeof data !== 'object' || Array.isArray(data)) {
        errors.push(`Expected object, got ${Array.isArray(data) ? 'array' : typeof data}`);
        console.warn(`⚠️ MCP validation failed for ${toolName}:`, errors.join(', '));
        return { valid: false, errors };
    }
    const response = data;
    if (!Array.isArray(response['content'])) {
        errors.push("Missing or invalid 'content' array");
    }
    else {
        const content = response['content'];
        if (content.length === 0) {
            errors.push('Empty content array');
        }
        else {
            const firstItem = content[0];
            if (typeof firstItem['text'] !== 'string') {
                errors.push("First content item is missing a 'text' string field");
            }
        }
    }
    if (errors.length > 0) {
        console.warn(`⚠️ MCP validation failed for ${toolName}:`, errors.join(', '));
    }
    return { valid: errors.length === 0, errors };
}
// ─── Data normalisation helpers ───────────────────────────────────────────────
/**
 * Normalise a date string to YYYY-MM-DD ISO 8601 format.
 * Returns the input unchanged when parsing fails.
 *
 * @param date - Raw date string
 * @returns Normalised ISO 8601 date string
 */
export function normalizeISO8601Date(date) {
    if (!date)
        return date;
    try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime()))
            return date;
        return parsed.toISOString().split('T')[0] ?? date;
    }
    catch {
        return date;
    }
}
/**
 * Sanitise a text string by collapsing internal whitespace and trimming edges.
 *
 * @param text - Raw text string
 * @returns Sanitised text string
 */
export function sanitizeText(text) {
    return text.replace(/\s+/g, ' ').trim();
}
/**
 * Validate that a country code matches the ISO 3166-1 alpha-2 pattern.
 *
 * @param code - Two-letter country code
 * @returns `true` when the code matches `[A-Z]{2}`
 */
export function isValidCountryCode(code) {
    return /^[A-Z]{2}$/.test(code);
}
/**
 * Validate that a language code matches the ISO 639-1 alpha-2 pattern.
 *
 * @param code - Two-letter language code
 * @returns `true` when the code matches `[a-z]{2}`
 */
export function isValidLanguageCode(code) {
    return /^[a-z]{2}$/.test(code);
}
//# sourceMappingURL=transform-stage.js.map