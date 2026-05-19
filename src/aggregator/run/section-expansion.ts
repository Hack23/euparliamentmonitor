// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Run/SectionExpansion
 * @description Expands an `ArtifactSection` declaration into the concrete
 * ordered list of artifact paths drawn from the manifest/discovery set.
 */

import type { ArtifactSection } from '../artifact-order.js';

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
export function expandSectionArtifacts(
  section: ArtifactSection,
  available: Set<string>,
  consumed: Set<string>
): string[] {
  const out: string[] = [];
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
    } else if (available.has(entry) && !consumed.has(entry)) {
      out.push(entry);
      consumed.add(entry);
      if (section.id === 'executive-brief') break;
    }
  }
  return out;
}
