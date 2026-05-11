// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test for color-coded Mermaid flow through the article
 * pipeline.
 *
 * Verifies — end-to-end, on a freshly aggregated fixture run — that:
 *
 *   1. Every distinct Mermaid block authored in an analysis artifact is
 *      preserved in the aggregated `article.md` (after dedup).
 *   2. Every Mermaid block in `article.md` is rendered into the
 *      generated HTML body fragment.
 *   3. Color tokens (`%%{init …themeVariables…}%%`, `classDef`,
 *      `style …fill:#…`, palette hexes) are preserved from the artifact
 *      source through `article.md` to the HTML body. In `article.md`
 *      preservation is byte-for-byte; in HTML the Mermaid fence body is
 *      HTML-escaped inside `<pre class="mermaid">` (e.g. `"` → `&quot;`,
 *      `>` → `&gt;`) but every hex token and color directive remains
 *      textually intact and is un-escaped client-side by the Mermaid
 *      initialiser before rendering.
 *   4. The generator wraps every Mermaid block in
 *      `<figure class="mermaid-figure" role="img" aria-label="…">` so
 *      assistive tech announces the diagram and the colour palette
 *      remains visible to colourblind / no-JS readers via the source
 *      text inside `<pre class="mermaid">`.
 *
 * The test creates an isolated tmp repo with a colour-rich artifact
 * fixture so it runs deterministically without depending on any real
 * `analysis/daily/` run.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { generateArticle } from '../../scripts/aggregator/article-generator.js';
import { renderMarkdown } from '../../scripts/aggregator/markdown-renderer.js';

/**
 * Canonical palette hexes used by the EU Parliament Monitor mermaid
 * recipes that appear in this test's fixtures. Mirrors a subset of
 * `analysis/templates/_partials/mermaid-color-palette.md` — the full
 * 9-token palette is documented there.
 */
const PALETTE = ['#1565C0', '#2E7D32', '#FF9800', '#D32F2F', '#FFC107'];

const INIT_BLOCK_FULL =
  '%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","secondaryColor":"#2E7D32","tertiaryColor":"#FF9800","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","errorBkgColor":"#D32F2F"}}}%%';

const FLOWCHART_WITH_CLASSDEF = [
  '```mermaid',
  INIT_BLOCK_FULL,
  'flowchart LR',
  '    EPP["EPP"] --> COAL["Coalition"]',
  '    SD["S&D"] --> COAL',
  '    RE["Renew"] --> COAL',
  '    GREENS["Greens"] --> SWING["Swing"]',
  '    ECR["ECR"] --> OPP["Opposition"]',
  '    classDef supporter fill:#2E7D32,color:#ffffff,stroke:#0F3F00,stroke-width:2px',
  '    classDef swing fill:#FFC107,color:#000000,stroke:#7F6000,stroke-width:2px',
  '    classDef opposition fill:#D32F2F,color:#ffffff,stroke:#7F0000,stroke-width:2px',
  '    classDef outcome fill:#1565C0,color:#ffffff,stroke:#0A3F7F,stroke-width:3px',
  '    class EPP,SD,RE supporter',
  '    class GREENS swing',
  '    class ECR opposition',
  '    class COAL,SWING,OPP outcome',
  '```',
].join('\n');

const QUADRANT_THEMED = [
  '```mermaid',
  '%%{init: {"theme":"dark","themeVariables":{"quadrant1Fill":"#1565C0","quadrant2Fill":"#2E7D32","quadrant3Fill":"#FF9800","quadrant4Fill":"#D32F2F"}}}%%',
  'quadrantChart',
  '    title Coalition vs Issue Salience',
  '    x-axis Low Salience --> High Salience',
  '    y-axis Pro --> Con',
  '    quadrant-1 Watch',
  '    quadrant-2 Mobilise',
  '    quadrant-3 Park',
  '    quadrant-4 Defend',
  '    "EPP": [0.7, 0.7]',
  '    "S&D": [0.6, 0.65]',
  '```',
].join('\n');

const TIMELINE_THEMED = [
  '```mermaid',
  '%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F"}}}%%',
  'timeline',
  '    title EP Term Arc',
  '    section EP9',
  '        2019 : von der Leyen elected',
  '        2022 : Qatargate',
  '    section EP10',
  '        2024 : New mandate',
  '```',
].join('\n');

/**
 * Build a fully self-contained isolated repo with a single analysis run
 * containing colour-coded mermaid artifacts. Returns paths needed by
 * `generateArticle`.
 */
function buildFixtureRepo() {
  const isolatedRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-mermaid-pipeline-repo-'));
  const runDir = path.join(isolatedRepo, 'analysis/daily/2026-05-11/breaking');
  fs.mkdirSync(path.join(runDir, 'classification'), { recursive: true });
  fs.mkdirSync(path.join(runDir, 'intelligence'), { recursive: true });
  fs.mkdirSync(path.join(runDir, 'risk-scoring'), { recursive: true });

  // Three artifacts, each carrying a distinct color-coded mermaid block.
  fs.writeFileSync(
    path.join(runDir, 'classification/actor-mapping.md'),
    `# Actor Mapping\n\n${FLOWCHART_WITH_CLASSDEF}\n\nActors mapped above.\n`
  );
  fs.writeFileSync(
    path.join(runDir, 'intelligence/stakeholder-map.md'),
    `# Stakeholder Map\n\n${QUADRANT_THEMED}\n\nQuadrant chart above.\n`
  );
  fs.writeFileSync(
    path.join(runDir, 'risk-scoring/risk-matrix.md'),
    `# Risk Matrix\n\n${TIMELINE_THEMED}\n\nTimeline above.\n`
  );

  // Manifest that lists the three artifacts.
  fs.writeFileSync(
    path.join(runDir, 'manifest.json'),
    JSON.stringify(
      {
        articleType: 'breaking',
        date: '2026-05-11',
        runId: 'breaking-mermaid-pipeline',
        files: [
          'classification/actor-mapping.md',
          'intelligence/stakeholder-map.md',
          'risk-scoring/risk-matrix.md',
        ],
        history: [{ gateResult: 'GREEN', timestamp: '2026-05-11T00:00:00.000Z' }],
      },
      null,
      2
    )
  );

  // Methodologies and templates dirs need to exist for tradecraft scan
  fs.mkdirSync(path.join(isolatedRepo, 'analysis/methodologies'), { recursive: true });
  fs.writeFileSync(
    path.join(isolatedRepo, 'analysis/methodologies/ai-driven-analysis-guide.md'),
    '# Guide\n'
  );
  fs.mkdirSync(path.join(isolatedRepo, 'analysis/templates'), { recursive: true });

  return { isolatedRepo, runDir };
}

/** Count occurrences of a substring in a string. */
function countOccurrences(haystack, needle) {
  if (needle.length === 0) return 0;
  let n = 0;
  let i = 0;
  while ((i = haystack.indexOf(needle, i)) !== -1) {
    n++;
    i += needle.length;
  }
  return n;
}

describe('article mermaid pipeline — color-coded diagrams flow artifacts → article.md → HTML', () => {
  let tmpRepo;
  let runDir;
  let outDir;

  beforeEach(() => {
    const fx = buildFixtureRepo();
    tmpRepo = fx.isolatedRepo;
    runDir = fx.runDir;
    outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-mermaid-pipeline-out-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('preserves every distinct mermaid block from the artifacts in article.md', () => {
    generateArticle({
      runDir,
      repoRoot: tmpRepo,
      outDir,
      markdownOnly: true,
    });
    const articleMd = fs.readFileSync(path.join(runDir, 'article.md'), 'utf8');
    const fenceCount = (articleMd.match(/^```mermaid\s*$/gm) ?? []).length;
    // Three distinct fences from three artifacts; dedup must NOT collapse
    // them because each body is unique.
    expect(fenceCount).toBe(3);
  });

  it('preserves every %%{init …themeVariables…}%% block in article.md', () => {
    generateArticle({ runDir, repoRoot: tmpRepo, outDir, markdownOnly: true });
    const articleMd = fs.readFileSync(path.join(runDir, 'article.md'), 'utf8');
    const initCount = (articleMd.match(/%%\{init:/g) ?? []).length;
    expect(initCount).toBe(3);
  });

  it('preserves every classDef and per-node style line in article.md', () => {
    generateArticle({ runDir, repoRoot: tmpRepo, outDir, markdownOnly: true });
    const articleMd = fs.readFileSync(path.join(runDir, 'article.md'), 'utf8');
    expect(articleMd).toContain('classDef supporter fill:#2E7D32');
    expect(articleMd).toContain('classDef opposition fill:#D32F2F');
    expect(articleMd).toContain('class EPP,SD,RE supporter');
    expect(articleMd).toContain('class ECR opposition');
  });

  it('every palette hex used in artifacts survives in article.md', () => {
    generateArticle({ runDir, repoRoot: tmpRepo, outDir, markdownOnly: true });
    const articleMd = fs.readFileSync(path.join(runDir, 'article.md'), 'utf8').toUpperCase();
    for (const hex of PALETTE) {
      expect(articleMd).toContain(hex);
    }
  });

  it('renders every mermaid block from article.md into the HTML body fragment', () => {
    generateArticle({ runDir, repoRoot: tmpRepo, outDir, markdownOnly: true });
    const articleMd = fs.readFileSync(path.join(runDir, 'article.md'), 'utf8');
    const articleFenceCount = (articleMd.match(/^```mermaid\s*$/gm) ?? []).length;

    const { html, mermaidCount } = renderMarkdown(articleMd);
    expect(mermaidCount).toBe(articleFenceCount);
    const figures = (html.match(/<figure class="mermaid-figure"/g) ?? []).length;
    const pres = (html.match(/<pre class="mermaid">/g) ?? []).length;
    expect(figures).toBe(articleFenceCount);
    expect(pres).toBe(articleFenceCount);
  });

  it('every palette hex in article.md is preserved in the rendered HTML', () => {
    generateArticle({ runDir, repoRoot: tmpRepo, outDir, markdownOnly: true });
    const articleMd = fs.readFileSync(path.join(runDir, 'article.md'), 'utf8');
    const { html } = renderMarkdown(articleMd);
    const upperHtml = html.toUpperCase();
    const upperMd = articleMd.toUpperCase();
    for (const hex of PALETTE) {
      // Hex MUST appear in article.md (else fixture is broken).
      expect(upperMd).toContain(hex);
      // And MUST therefore also appear in HTML at least as often as in
      // the source — markdown-it never strips hex tokens inside fences.
      expect(countOccurrences(upperHtml, hex)).toBeGreaterThanOrEqual(
        countOccurrences(upperMd, hex)
      );
    }
  });

  it('every classDef and style line in article.md is preserved in the rendered HTML', () => {
    generateArticle({ runDir, repoRoot: tmpRepo, outDir, markdownOnly: true });
    const articleMd = fs.readFileSync(path.join(runDir, 'article.md'), 'utf8');
    const { html } = renderMarkdown(articleMd);
    expect(html).toContain('classDef supporter fill:#2E7D32');
    expect(html).toContain('classDef opposition fill:#D32F2F');
    expect(html).toContain('class EPP,SD,RE supporter');
    expect(html).toContain('class ECR opposition');
  });

  it('every aria-label is unique and sequential (Mermaid diagram 1, 2, 3, …)', () => {
    generateArticle({ runDir, repoRoot: tmpRepo, outDir, markdownOnly: true });
    const articleMd = fs.readFileSync(path.join(runDir, 'article.md'), 'utf8');
    const { html, mermaidCount } = renderMarkdown(articleMd);
    for (let i = 1; i <= mermaidCount; i++) {
      expect(html).toContain(`aria-label="Mermaid diagram ${i}"`);
    }
  });
});

describe('article mermaid pipeline — real production runs (smoke check)', () => {
  /**
   * Smoke check against the most-recent committed analysis run, if the
   * `analysis/daily/` tree exists. Verifies count parity between
   * artifacts (after dedup) → article.md → en HTML for the latest
   * available run. The describe block is filtered with `it.skipIf`
   * inside each test so the suite is silently skipped on a fresh clone
   * with no `news/` HTML.
   */
  const REPO_ROOT = path.resolve('.');
  const NEWS_DIR = path.join(REPO_ROOT, 'news');
  const DAILY_DIR = path.join(REPO_ROOT, 'analysis/daily');

  /**
   * Find the most-recent {date}/{slug}/article.md that has a matching
   * news/{date}-{slug}-en.html file on disk. Returns null when no pair
   * is available.
   */
  function findLatestPair() {
    if (!fs.existsSync(DAILY_DIR) || !fs.existsSync(NEWS_DIR)) return null;
    const dates = fs
      .readdirSync(DAILY_DIR)
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort()
      .reverse();
    for (const date of dates) {
      const dateDir = path.join(DAILY_DIR, date);
      const slugs = fs.readdirSync(dateDir).filter((s) => {
        const articleMd = path.join(dateDir, s, 'article.md');
        return fs.existsSync(articleMd);
      });
      for (const slug of slugs) {
        const html = path.join(NEWS_DIR, `${date}-${slug}-en.html`);
        if (fs.existsSync(html)) {
          return {
            articleMd: path.join(dateDir, slug, 'article.md'),
            htmlEn: html,
            date,
            slug,
          };
        }
      }
    }
    return null;
  }

  const pair = findLatestPair();

  it.skipIf(!pair)(
    'mermaid count parity: article.md fences == HTML <pre class="mermaid"> blocks',
    () => {
      const articleMd = fs.readFileSync(pair.articleMd, 'utf8');
      const html = fs.readFileSync(pair.htmlEn, 'utf8');
      const articleFenceCount = (articleMd.match(/^```mermaid\s*$/gm) ?? []).length;
      const htmlPreCount = (html.match(/<pre class="mermaid">/g) ?? []).length;
      expect(htmlPreCount).toBe(articleFenceCount);
    }
  );

  it.skipIf(!pair)(
    'color-init parity: article.md %%{init blocks == HTML occurrences',
    () => {
      const articleMd = fs.readFileSync(pair.articleMd, 'utf8');
      const html = fs.readFileSync(pair.htmlEn, 'utf8');
      const mdInitCount = (articleMd.match(/%%\{init:/g) ?? []).length;
      const htmlInitCount = (html.match(/%%\{init:/g) ?? []).length;
      expect(htmlInitCount).toBe(mdInitCount);
    }
  );
});
