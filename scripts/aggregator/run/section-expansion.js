// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * Expand an `artifacts` entry from {@link ArtifactSection} into a list of
 * concrete artifact paths. Exact paths are kept as-is; directory prefixes
 * ending in `/` expand to every remaining `.md` under that directory
 * (lexical order), excluding files already claimed by higher-priority
 * sections.
 *
 * @param section - Canonical section descriptor from {@link ARTIFACT_SECTIONS}
 * @param available - Set of every known artifact path (run-relative)
 * @param consumed - Mutable set of paths already claimed by earlier sections
 * @returns Ordered list of artifact paths that belong to this section
 */
export function expandSectionArtifacts(section, available, consumed) {
    const out = [];
    for (const entry of section.artifacts) {
        if (entry.endsWith('/')) {
            const prefix = entry;
            const matching = [...available]
                .filter((p) => p.startsWith(prefix) && !consumed.has(p))
                .sort();
            for (const p of matching) {
                out.push(p);
                consumed.add(p);
            }
        }
        else if (available.has(entry) && !consumed.has(entry)) {
            out.push(entry);
            consumed.add(entry);
            if (section.id === 'executive-brief')
                break;
        }
    }
    return out;
}
//# sourceMappingURL=section-expansion.js.map