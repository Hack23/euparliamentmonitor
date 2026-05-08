// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Phase-1 UI baseline snapshots for article rendering.
 *
 * These tests intentionally snapshot selected, stable reader-facing fragments
 * rather than whole generated documents. They give the UI/UX overhaul a
 * reviewable golden baseline for political-intelligence, article chrome, and
 * the reader-intelligence guide before visual refactors begin.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  collectPoliticalIntelligenceData,
  generatePoliticalIntelligenceHTML,
} from '../../scripts/generators/political-intelligence.js';
import { wrapArticleHtml } from '../../scripts/aggregator/article-html.js';
import { buildReaderIntelligenceGuideHtml } from '../../scripts/aggregator/reader-intelligence-guide.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';
import { ArticleCategory } from '../../scripts/types/index.js';
import { createTempDir, cleanupTempDir } from '../helpers/test-utils.js';

const GUIDE_SECTIONS = [
  { id: 'section-executive-brief', title: 'Executive Brief' },
  { id: 'section-synthesis', title: 'Synthesis Summary' },
  { id: 'section-significance', title: 'Significance Assessment' },
  { id: 'section-coalitions-voting', title: 'Coalitions and Voting' },
  { id: 'section-stakeholder-map', title: 'Stakeholder Map' },
  { id: 'section-economic-context', title: 'Economic Context' },
  { id: 'section-scenarios', title: 'Scenario Outlook' },
  { id: 'section-risk', title: 'Risk Assessment' },
];

const GUIDE_ARTIFACTS = GUIDE_SECTIONS.map((section) => ({
  runRelPath: `${section.id.replace(/^section-/, '')}.md`,
  repoRelPath: `analysis/daily/2026-01-15/breaking/${section.id.replace(/^section-/, '')}.md`,
  sectionId: section.id,
}));

function writeFile(root, relPath, content) {
  const fullPath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
}

function normaliseHtml(html) {
  return html
    .replace(/v=[a-f0-9]{7}/g, 'v=BUILD')
    .replace(/[a-f0-9]{40}/g, 'BUILD_SHA')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, 'BUILD_TIME')
    .replace(/\s+\n/g, '\n')
    .trim();
}

function matchFragment(html, pattern) {
  const match = html.match(pattern);
  if (!match) {
    throw new Error(`Expected pattern ${pattern} to match HTML, but no match was found. The UI element may have been removed.`);
  }
  return normaliseHtml(match[0]);
}

describe('article UI baseline snapshots', () => {
  describe('political-intelligence hub', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = createTempDir();
      writeFile(tempDir, 'analysis/methodologies/README.md', '# Methodology Index\n\nIndex.\n');
      writeFile(
        tempDir,
        'analysis/methodologies/risk-scoring.md',
        '# Risk Scoring\n\nQuantitative risk framework.\n'
      );
      writeFile(tempDir, 'analysis/templates/README.md', '# Template Catalog\n\nTemplates.\n');
      writeFile(tempDir, 'analysis/templates/swot-template.md', '# SWOT Template\n\nSWOT.\n');
      writeFile(
        tempDir,
        'analysis/daily/2026-04-22/breaking-run1/data/agent-pre-work.md',
        '# Agent Pre-Work\n\nNotes.\n'
      );
      writeFile(
        tempDir,
        'analysis/daily/2026-04-22/breaking-run1/intelligence/swot.md',
        '# SWOT\n\nData.\n'
      );
    });

    afterEach(() => cleanupTempDir(tempDir));

    it('matches the current political-intelligence hero, run-card, and artifact-disclosure baseline', () => {
      const html = generatePoliticalIntelligenceHTML('en', collectPoliticalIntelligenceData(tempDir));
      const baseline = {
        hero: matchFragment(
          html,
          /<section class="sitemap-hero pi-hero"[\s\S]*?<\/section>/
        ),
        runLink: matchFragment(html, /<a class="pi-run__link"[\s\S]*?<\/a>/),
        artifactDisclosure: matchFragment(
          html,
          /<details class="pi-run__artifacts"[\s\S]*?<\/details>/
        ),
      };
      expect(baseline).toMatchSnapshot();
    });
  });

  describe('article wrapper chrome', () => {
    it('matches the current article-hero baseline for every article category', () => {
      const baselines = {};
      for (const articleType of Object.values(ArticleCategory)) {
        const html = wrapArticleHtml({
          lang: 'en',
          articleSlug: `2026-01-15-${articleType}`,
          body: '<h2 id="section-synthesis">Synthesis Summary</h2><p>Body content.</p>',
          title: `Baseline ${articleType}`,
          description: `Baseline description for ${articleType}.`,
          date: '2026-01-15',
          articleType,
          toc: [
            { id: 'reader-intelligence-guide', title: 'Reader Intelligence Guide' },
            { id: 'section-synthesis', title: 'Synthesis Summary' },
            { id: 'aggregator-analysis-index', title: 'Analysis Index' },
          ],
        });
        baselines[articleType] = {
          readingProgress: matchFragment(html, /<div class="reading-progress"[\s\S]*?><\/div>/),
          topNav: matchFragment(html, /<nav class="article-top-nav"[\s\S]*?<\/nav>/),
          hero: matchFragment(html, /<header class="article-hero"[\s\S]*?<\/header>/),
          toc: matchFragment(
            html,
            /<aside class="article-toc-container"[\s\S]*?<\/aside>/
          ),
        };
      }
      expect(baselines).toMatchSnapshot();
    });
  });

  describe('reader-intelligence guide', () => {
    it('matches the current all-language guide baseline', () => {
      const baselines = {};
      for (const lang of ALL_LANGUAGES) {
        baselines[lang] = buildReaderIntelligenceGuideHtml(lang, GUIDE_SECTIONS, GUIDE_ARTIFACTS);
      }
      expect(baselines).toMatchSnapshot();
    });
  });

  /**
   * Phase-4 / Phase-5 chrome hooks.
   *
   * These live alongside the snapshot suites so any future header/footer
   * refactor that drops these CSS hooks fails fast with a meaningful
   * assertion message — without dragging the entire wrapped article HTML
   * into the snapshot file.
   */
  describe('shared site chrome hooks', () => {
    it('renders the dedicated theme-toggle slot and the footer accent heading inside the article wrapper', () => {
      const html = wrapArticleHtml({
        lang: 'en',
        articleSlug: '2026-01-15-breaking',
        body: '<p>Body.</p>',
        title: 'Hook check',
        description: 'Hook check.',
        date: '2026-01-15',
        articleType: ArticleCategory.BREAKING_NEWS,
        toc: [],
      });
      // Phase 4 — header theme toggle lives in its own slot, not inline
      // with the pill CTAs.
      expect(html).toContain('site-header__theme-toggle-slot');
      expect(html).toContain('site-header__cta-group');
      // Phase 5 — every footer section heading carries the accent class
      // that drives the editorial underline.
      expect(html).toContain('class="footer-section__heading"');
      // The four standard sections must each emit the accent heading.
      const accentCount = (html.match(/class="footer-section__heading"/g) ?? []).length;
      expect(accentCount).toBeGreaterThanOrEqual(4);
    });
  });
});
