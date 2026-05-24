// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/BriefBody
 * @description Reads the English `executive-brief.md` (or compatible
 * fallback artefacts) for a run directory and returns the SPDX-stripped
 * body so language-agnostic structural extractors
 * ({@link briefing-highlight.ts}) can probe it for `## Reader Briefing`
 * / `## Strategic Intelligence Summary` content.
 *
 * Localized brief bodies (`executive-brief_<lang>.md`) are read by the
 * upward-pointing {@link editorial-brief-resolver.ts}; that file
 * cannot import this module without breaking the leaf-module rule, so
 * the localized brief loader stays where it is and re-exports its own
 * body via the dedicated helper.
 *
 * Pure leaf module — depends only on `fs`/`path` and the SPDX-aware
 * reader from {@link artifact-walker}.
 */

import fs from 'fs';
import path from 'path';
import { readArtefactBody } from './artifact-walker.js';

/** Ordered list of artefact filenames inspected by {@link readEnglishBriefBody}. */
const BRIEF_BODY_CANDIDATES: readonly string[] = [
  'executive-brief.md',
  'extended/executive-brief.md',
  'intelligence/synthesis-summary.md',
  'intelligence/executive-summary.md',
  'intelligence/intelligence-briefing.md',
  'executive-summary.md',
  'intelligence-briefing.md',
  'synthesis-summary.md',
];

/**
 * Read the first existing English brief artefact under `runDir` and
 * return its SPDX-stripped body. Returns the empty string when none of
 * the candidate artefacts exists or the run directory is missing —
 * callers should treat the empty string as "no brief content
 * available" and fall back to their existing extraction ladder.
 *
 * @param runDir - Absolute run directory, or empty string when unavailable
 * @returns Brief body text with SPDX preamble removed
 */
export function readEnglishBriefBody(runDir: string): string {
  if (!runDir) return '';
  try {
    if (!fs.existsSync(runDir)) return '';
  } catch {
    return '';
  }
  for (const candidate of BRIEF_BODY_CANDIDATES) {
    const abs = path.join(runDir, candidate);
    try {
      if (!fs.existsSync(abs)) continue;
    } catch {
      continue;
    }
    const body = readArtefactBody(abs);
    if (body.trim().length > 0) return body;
  }
  return '';
}
