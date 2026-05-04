// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Drift-guard test: every `analysis/templates/*.md` template (except the
 * README / index) must be referenced somewhere under `.github/prompts/` or
 * `.github/agents/` — by basename (without extension) or by full relative
 * path. This prevents orphan templates and ensures every artifact is
 * discoverable by the agents that produce or consume it.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TEMPLATES_DIR = path.join(REPO_ROOT, 'analysis', 'templates');
const PROMPTS_DIR = path.join(REPO_ROOT, '.github', 'prompts');
const AGENTS_DIR = path.join(REPO_ROOT, '.github', 'agents');

const EXCLUDED_TEMPLATES = new Set([
  'README.md',
  'analysis-index.md', // exception: the index itself
]);

function listTemplateBasenames() {
  return fs
    .readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith('.md') && !EXCLUDED_TEMPLATES.has(f))
    .map((f) => path.basename(f, '.md'));
}

function readAllDocs() {
  const promptFiles = fs
    .readdirSync(PROMPTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => fs.readFileSync(path.join(PROMPTS_DIR, f), 'utf8'));

  const agentFiles = fs
    .readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => fs.readFileSync(path.join(AGENTS_DIR, f), 'utf8'));

  // Also search the prompts README index + agents README.
  return promptFiles.join('\n\n====\n\n') + '\n\n====\n\n' + agentFiles.join('\n\n====\n\n');
}

describe('analysis/templates are referenced by prompts or agents', () => {
  it('every non-index template is referenced by basename in prompts/ or agents/', () => {
    const templates = listTemplateBasenames();
    const corpus = readAllDocs();
    const missing = templates.filter((name) => !corpus.includes(name));
    expect(
      missing,
      `Unreferenced templates (add a reference in .github/prompts/ or .github/agents/): ${missing.join(', ')}`,
    ).toEqual([]);
  });

  it('template directory has at least 25 templates', () => {
    // Sanity check — if this drops, the catalog is broken.
    const templates = listTemplateBasenames();
    expect(templates.length).toBeGreaterThanOrEqual(25);
  });
});
