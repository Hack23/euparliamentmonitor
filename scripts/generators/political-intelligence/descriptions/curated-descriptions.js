// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { METHODOLOGY_DESCRIPTIONS } from './desc-methodologies.js';
import { TEMPLATE_DESCRIPTIONS } from './desc-templates.js';
import { REFERENCE_DESCRIPTIONS } from './desc-references.js';
/**
 * Curated descriptions keyed by the repository-relative file path.
 * Descriptions are concise (≤ ~220 chars), factual, and describe the
 * methodology / template's *purpose* — not its metadata block.
 *
 * Where a per-language translation is not provided, readers see the
 * English canonical description. The localized "source materials are in
 * English" note at the top of the page acknowledges this.
 */
export const CURATED_DESCRIPTIONS = {
    ...METHODOLOGY_DESCRIPTIONS,
    ...TEMPLATE_DESCRIPTIONS,
    ...REFERENCE_DESCRIPTIONS,
};
//# sourceMappingURL=curated-descriptions.js.map