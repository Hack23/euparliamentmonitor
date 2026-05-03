// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Drift-guard for `analysis/templates/*.md`.
 *
 * Every template (except `README.md` and anything under `_partials/`) MUST
 * include:
 *   1. The canonical ANALYSIS-TEMPLATE-FRONTMATTER:v1 block with all required
 *      keys (artifactId, methodology, catalogRow, depthFloorBreaking,
 *      mermaidType, partialsDir).
 *   2. The canonical AI-INSTRUCTIONS:v1 block.
 *   3. The SPDX header pair.
 *
 * If this test fails, run `npm run sync:templates` to regenerate.
 *
 * The script `scripts/templates/sync-template-frontmatter.js` is responsible
 * for keeping the blocks in sync with the methodology library
 * (artifact-catalog.md + reference-quality-thresholds.json).
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TEMPLATES_DIR = path.join(REPO_ROOT, 'analysis', 'templates');
const PARTIALS_DIR = path.join(TEMPLATES_DIR, '_partials');

const FRONTMATTER_TOKEN = 'ANALYSIS-TEMPLATE-FRONTMATTER:v1';
const AI_INSTRUCTIONS_TOKEN = 'AI-INSTRUCTIONS:v1';

const REQUIRED_FRONTMATTER_KEYS = [
  'artifactId',
  'methodology',
  'catalogRow',
  'depthFloorBreaking',
  'mermaidType',
  'partialsDir',
];

const EXCLUDED_BASENAMES = new Set(['README.md']);

function listTemplateFiles() {
  return fs
    .readdirSync(TEMPLATES_DIR)
    .filter((name) => name.endsWith('.md'))
    .filter((name) => !EXCLUDED_BASENAMES.has(name))
    .sort();
}

function listPartialFiles() {
  if (!fs.existsSync(PARTIALS_DIR)) return [];
  return fs.readdirSync(PARTIALS_DIR).filter((name) => name.endsWith('.md'));
}

function extractFrontmatterBlock(content) {
  const re = new RegExp(`<!--\\s*${FRONTMATTER_TOKEN}([\\s\\S]*?)-->`);
  const match = content.match(re);
  return match ? match[1] : null;
}

describe('analysis/templates structure (drift-guard)', () => {
  const templates = listTemplateFiles();

  it('finds at least 39 templates (catalog floor)', () => {
    expect(templates.length).toBeGreaterThanOrEqual(39);
  });

  it('every template has the SPDX header pair', () => {
    const missing = [];
    // REUSE-IgnoreStart
    const spdxCopyright = 'SPDX-FileCopyrightText:';
    const spdxLicense = 'SPDX-License-Identifier:';
    // REUSE-IgnoreEnd
    for (const basename of templates) {
      const content = fs.readFileSync(path.join(TEMPLATES_DIR, basename), 'utf8');
      const reCopyright = new RegExp(`<!--\\s*${spdxCopyright}`, 'i');
      const reLicense = new RegExp(`<!--\\s*${spdxLicense}`, 'i');
      if (!reCopyright.test(content) || !reLicense.test(content)) {
        missing.push(basename);
      }
    }
    expect(missing, `Templates missing SPDX headers: ${missing.join(', ')}`).toEqual([]);
  });

  it(`every template has the canonical ${FRONTMATTER_TOKEN} block`, () => {
    const missing = [];
    for (const basename of templates) {
      const content = fs.readFileSync(path.join(TEMPLATES_DIR, basename), 'utf8');
      if (!content.includes(FRONTMATTER_TOKEN)) {
        missing.push(basename);
      }
    }
    expect(
      missing,
      `Templates missing front-matter (run \`npm run sync:templates\`): ${missing.join(', ')}`,
    ).toEqual([]);
  });

  it(`every template has the canonical ${AI_INSTRUCTIONS_TOKEN} block`, () => {
    const missing = [];
    for (const basename of templates) {
      const content = fs.readFileSync(path.join(TEMPLATES_DIR, basename), 'utf8');
      if (!content.includes(AI_INSTRUCTIONS_TOKEN)) {
        missing.push(basename);
      }
    }
    expect(
      missing,
      `Templates missing AI-instructions block (run \`npm run sync:templates\`): ${missing.join(', ')}`,
    ).toEqual([]);
  });

  it('every front-matter block contains the required keys', () => {
    const offenders = [];
    for (const basename of templates) {
      const content = fs.readFileSync(path.join(TEMPLATES_DIR, basename), 'utf8');
      const block = extractFrontmatterBlock(content);
      if (!block) continue; // covered by the previous test
      for (const key of REQUIRED_FRONTMATTER_KEYS) {
        const re = new RegExp(`(^|\\n)\\s*${key}\\s*:`);
        if (!re.test(block)) {
          offenders.push(`${basename} (missing ${key})`);
        }
      }
    }
    expect(
      offenders,
      `Front-matter blocks missing keys: ${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('every front-matter artifactId equals the file basename', () => {
    const offenders = [];
    for (const basename of templates) {
      const content = fs.readFileSync(path.join(TEMPLATES_DIR, basename), 'utf8');
      const block = extractFrontmatterBlock(content);
      if (!block) continue;
      const idMatch = block.match(/(^|\n)\s*artifactId\s*:\s*([a-z0-9-]+)/);
      const expected = basename.replace(/\.md$/, '');
      if (!idMatch || idMatch[2] !== expected) {
        offenders.push(`${basename} (got ${idMatch ? idMatch[2] : '<missing>'})`);
      }
    }
    expect(offenders, `artifactId mismatch: ${offenders.join(', ')}`).toEqual([]);
  });

  it('the _partials directory exists and contains the canonical partials', () => {
    const partials = listPartialFiles();
    const expected = [
      'README.md',
      'ai-instructions.md',
      'quality-checklist.md',
      'citation-pattern.md',
      'evidence-table.md',
      'imf-callout.md',
    ];
    for (const p of expected) {
      expect(partials, `Missing partial: ${p}`).toContain(p);
    }
  });
});
