// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Drift-guard: catalog ↔ thresholds ↔ templates ↔ per-artifact methodology.
 *
 * For every artifact row in `analysis/methodologies/artifact-catalog.md`:
 *   1. The template referenced in column 4 (`[name.md](../templates/name.md)`)
 *      must exist in `analysis/templates/`.
 *   2. The methodology link in column 3 must point at a methodology file that
 *      exists; when the link targets `per-artifact-methodologies.md#anchor`,
 *      a matching `### anchor` section must exist there.
 *   3. The `breaking` numeric depth floor (when the row carries one) must be
 *      reflected by at least one threshold row in
 *      `reference-quality-thresholds.json` (across any article type — the
 *      catalog row is "breaking" but artifacts may legitimately use a flat
 *      cross-type floor; we only assert the artifact is *known* to the
 *      thresholds file when the catalog claims a numeric floor).
 *
 * The intent is to fail CI fast when the methodology library, the template
 * library, and the threshold registry drift apart — exactly the
 * three-way-match invariant called out in the issue brief.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const METHODS_DIR = path.join(REPO_ROOT, 'analysis', 'methodologies');
const TEMPLATES_DIR = path.join(REPO_ROOT, 'analysis', 'templates');
const CATALOG = path.join(METHODS_DIR, 'artifact-catalog.md');
const PER_ARTIFACT = path.join(METHODS_DIR, 'per-artifact-methodologies.md');
const THRESHOLDS = path.join(METHODS_DIR, 'reference-quality-thresholds.json');

/**
 * Parse catalog table rows that describe an artifact. Catalog rows look like:
 *   | `intelligence/foo.md` | purpose | [methodology link] | [template link] | floor | mermaid |
 * Header rows and decoration rows (e.g. legend tables) are filtered out.
 *
 * @returns {Array<{artifact: string, methodology: string, template: string, floorCell: string}>}
 */
function parseCatalog() {
  const text = fs.readFileSync(CATALOG, 'utf8');
  const rows = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line.startsWith('|')) continue;
    // Match an artifact row whose first column is a backticked relative path
    // ending in .md. The first capture group is the artifact path.
    const m = line.match(/^\|\s+`([a-z][a-z0-9/_-]+\.md)`\s+\|/);
    if (!m) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 5) continue;
    rows.push({
      artifact: m[1],
      // cells[0] = artifact (already captured)
      // cells[1] = purpose
      methodology: cells[2] || '',
      template: cells[3] || '',
      floorCell: cells[4] || '',
    });
  }
  return rows;
}

/** Extract `(target, anchor)` pairs from a methodology cell containing
 *  one or more markdown links of the form [label](file.md#anchor). */
function extractMethodologyLinks(cell) {
  const links = [];
  const re = /\[[^\]]+\]\(([^)#\s]+\.md)(?:#([^)\s]+))?\)/g;
  let m;
  while ((m = re.exec(cell)) !== null) {
    links.push({ file: m[1], anchor: m[2] || null });
  }
  return links;
}

/** Extract the first `(name)` from a template cell containing
 *  `[name.md](../templates/name.md)`. */
function extractTemplateName(cell) {
  const m = cell.match(/\[([^\]]+\.md)\]\(\.\.\/templates\/([^)]+\.md)\)/);
  if (!m) return null;
  return m[2];
}

/** Collect the set of `### <slug>` H3 sections in per-artifact-methodologies.md. */
function loadPerArtifactSections() {
  const text = fs.readFileSync(PER_ARTIFACT, 'utf8');
  const sections = new Set();
  for (const raw of text.split(/\r?\n/)) {
    const m = raw.match(/^###\s+([a-z][a-z0-9_-]*)\s*$/i);
    if (m) sections.add(m[1].toLowerCase());
  }
  return sections;
}

/** Build a flat set of every artifact relativePath that has at least one
 *  threshold row across any article type. */
function loadThresholdArtifacts() {
  const json = JSON.parse(fs.readFileSync(THRESHOLDS, 'utf8'));
  const known = new Set();
  for (const articleType of Object.keys(json.thresholds || {})) {
    for (const relPath of Object.keys(json.thresholds[articleType] || {})) {
      known.add(relPath);
    }
  }
  return known;
}

describe('analysis/methodologies — three-way drift-guard', () => {
  const rows = parseCatalog();
  const perArtifactSections = loadPerArtifactSections();
  const thresholdArtifacts = loadThresholdArtifacts();

  it('catalog parser found a non-trivial number of artifact rows', () => {
    // Sanity floor — issue scope cites 39 core + 12 extended = 51.
    // Catalog includes a few twin entries (e.g. political-threat-landscape
    // appears in both intelligence/ and threat-assessment/), so the count is
    // a few rows above the 51 templates.
    expect(rows.length).toBeGreaterThanOrEqual(40);
  });

  it('every catalog template link resolves to a real file in analysis/templates/', () => {
    const missing = [];
    for (const row of rows) {
      const tpl = extractTemplateName(row.template);
      if (!tpl) {
        missing.push(`${row.artifact} → could not parse template cell: ${row.template}`);
        continue;
      }
      const tplPath = path.join(TEMPLATES_DIR, tpl);
      if (!fs.existsSync(tplPath)) {
        missing.push(`${row.artifact} → template ${tpl} missing from analysis/templates/`);
      }
    }
    expect(
      missing,
      `Templates referenced by artifact-catalog.md are missing on disk:\n  ${missing.join('\n  ')}`,
    ).toEqual([]);
  });

  it('every methodology link in the catalog targets a real methodology file', () => {
    const missing = [];
    for (const row of rows) {
      const links = extractMethodologyLinks(row.methodology);
      if (links.length === 0) {
        missing.push(`${row.artifact} → methodology cell has no parseable link: ${row.methodology}`);
        continue;
      }
      for (const link of links) {
        // Methodology links are sibling-relative to artifact-catalog.md
        const target = path.join(METHODS_DIR, link.file);
        if (!fs.existsSync(target)) {
          missing.push(`${row.artifact} → methodology file ${link.file} missing`);
        }
      }
    }
    expect(
      missing,
      `Methodology links in artifact-catalog.md are broken:\n  ${missing.join('\n  ')}`,
    ).toEqual([]);
  });

  it('every catalog row that links to per-artifact-methodologies.md#anchor has the matching ### section', () => {
    const missing = [];
    for (const row of rows) {
      const links = extractMethodologyLinks(row.methodology);
      for (const link of links) {
        if (link.file !== 'per-artifact-methodologies.md') continue;
        if (!link.anchor) continue;
        if (!perArtifactSections.has(link.anchor.toLowerCase())) {
          missing.push(
            `${row.artifact} → per-artifact-methodologies.md#${link.anchor} (no matching '### ${link.anchor}' section)`,
          );
        }
      }
    }
    expect(
      missing,
      `Catalog references per-artifact-methodologies.md anchors that do not exist:\n  ${missing.join('\n  ')}`,
    ).toEqual([]);
  });

  it('every catalog row with a numeric breaking depth floor has a threshold registry row', () => {
    // Skip rows that explicitly carry a flat or per-article-type-only floor.
    // The catalog encodes those as "*flat 30*" (italicised) or as
    // "See `reference-quality-thresholds.json`" prose. We only assert the
    // three-way-match for rows whose breaking-floor cell starts with a
    // pure integer (e.g. "150" or "180").
    const missing = [];
    for (const row of rows) {
      if (!/^\d+/.test(row.floorCell)) continue;
      // Catalog rows describe the artifact path under the run root. For the
      // `extended/executive-brief.md` legacy mirror the threshold registry
      // tracks the canonical `executive-brief.md` only — that's expected and
      // the catalog rows acknowledge the legacy mirror in prose, so we
      // accept either path key here.
      const candidates = [row.artifact];
      if (row.artifact.startsWith('extended/')) {
        candidates.push(row.artifact.replace(/^extended\//, ''));
      }
      const found = candidates.some((p) => thresholdArtifacts.has(p));
      if (!found) {
        missing.push(
          `${row.artifact} (catalog floor=${row.floorCell.split(' ')[0]}) → no threshold row in reference-quality-thresholds.json`,
        );
      }
    }
    expect(
      missing,
      `Catalog ↔ thresholds drift — artifacts with a numeric catalog floor must appear in reference-quality-thresholds.json:\n  ${missing.join('\n  ')}`,
    ).toEqual([]);
  });
});
