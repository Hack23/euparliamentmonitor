// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Run/Tradecraft
 * @description Tradecraft-appendix rendering plus the canonical `humanize`
 * helper used across the aggregator. Owns discovery of methodology and
 * template files referenced from every aggregated run.
 */

import fs from 'fs';
import path from 'path';
import { githubBlobUrl } from '../clean-artifact.js';
import { TRADECRAFT_SECTION_ID, TRADECRAFT_SECTION_TITLE } from '../artifact-order.js';

const TRADECRAFT_EXCLUDED_FILES = new Set([
  'analysis/methodologies/executive-brief-translation-guide.md',
  'analysis/templates/executive-brief-translation-template.md',
]);

/**
 * Discover tradecraft files (methodologies + templates) under a repo root.
 * Returned paths are repo-relative with POSIX separators and sorted
 * lexically.
 *
 * @param repoRoot - Absolute path of the repo root
 * @returns Sorted list of `analysis/methodologies/*.md` + `analysis/templates/*.md`
 */
export function discoverTradecraftFiles(repoRoot: string): string[] {
  const result: string[] = [];
  for (const sub of ['analysis/methodologies', 'analysis/templates']) {
    const dir = path.join(repoRoot, sub);
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const rel = `${sub}/${entry.name}`;
      if (entry.isFile() && entry.name.endsWith('.md') && !TRADECRAFT_EXCLUDED_FILES.has(rel)) {
        result.push(rel);
      }
    }
  }
  return result.sort();
}

/**
 * Human-friendly title derived from a file stem (kebab/snake → Title Case).
 *
 * @param stem - File stem (e.g. `synthesis-summary.md`)
 * @returns Humanised title (e.g. `Synthesis Summary`)
 */
function humanize(stem: string): string {
  return stem
    .replace(/[-_]+/g, ' ')
    .replace(/\.md$/i, '')
    .replace(/\b([a-z])/g, (_, c: string) => c.toUpperCase())
    .trim();
}

/**
 * Render the tradecraft-references appendix — one bullet per
 * methodology/template file with a GitHub blob link.
 *
 * @param files - Repo-relative paths under `analysis/methodologies/` and
 *                `analysis/templates/`
 * @returns Markdown block with two subsections (methodologies, templates)
 */
export function renderTradecraftAppendix(files: readonly string[]): string {
  const methods = files.filter((f) => f.startsWith('analysis/methodologies/'));
  const templates = files.filter((f) => f.startsWith('analysis/templates/'));
  const block: string[] = [
    `<h2 id="${TRADECRAFT_SECTION_ID}">${TRADECRAFT_SECTION_TITLE}</h2>`,
    '',
    'This article is produced under the [Hack23 AB](https://hack23.com) intelligence tradecraft library. Every methodology and artifact template applied to this run is linked below.',
    '',
    '',
  ];
  if (templates.length > 0) {
    block.push('### Artifact templates');
    block.push('');
    for (const rel of templates) {
      const stem = rel.split('/').pop()?.replace(/\.md$/i, '') ?? rel;
      block.push(`- [${humanize(stem)}](${githubBlobUrl(rel)})`);
    }
    block.push('');
  }
  if (methods.length > 0) {
    block.push('### Methodologies');
    block.push('');
    for (const rel of methods) {
      const stem = rel.split('/').pop()?.replace(/\.md$/i, '') ?? rel;
      block.push(`- [${humanize(stem)}](${githubBlobUrl(rel)})`);
    }
    block.push('');
  }
  return block.join('\n');
}

/**
 * Public re-export of the internal `humanize` helper so other aggregator
 * modules (in particular `article-html.ts`) can derive the same display
 * title from a file stem when no curated title is available. Keeping the
 * single canonical implementation here avoids duplicate humanisation
 * rules drifting across modules.
 *
 * @param stem - File stem (e.g. `electoral-cycle-methodology`)
 * @returns Humanised title (e.g. `Electoral Cycle Methodology`)
 */
export function humanizeStem(stem: string): string {
  return humanize(stem);
}
