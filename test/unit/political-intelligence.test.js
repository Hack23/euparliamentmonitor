// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the political-intelligence generator.
 *
 * Covers:
 * - filename helper mapping for all 14 languages
 * - icon heuristics for documents and run slugs
 * - Markdown metadata extraction (H1 title + first paragraph, with SPDX/HTML comment skip)
 * - data collection from a fixture analysis tree
 * - HTML rendering: hero, stats, cards, canonical + hreflang + JSON-LD SEO, footer cross-links
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  getPoliticalIntelligenceFilename,
  pickDocumentIcon,
  pickRunIcon,
  parseMarkdownMeta,
  collectPoliticalIntelligenceData,
  generatePoliticalIntelligenceHTML,
} from '../../scripts/generators/political-intelligence.js';
import { createTempDir, cleanupTempDir } from '../helpers/test-utils.js';

describe('political-intelligence generator', () => {
  describe('getPoliticalIntelligenceFilename', () => {
    it('returns bare filename for English', () => {
      expect(getPoliticalIntelligenceFilename('en')).toBe('political-intelligence.html');
    });

    it('returns language-suffixed filenames for all 13 non-English locales', () => {
      const langs = ['sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
      for (const lang of langs) {
        expect(getPoliticalIntelligenceFilename(lang)).toBe(`political-intelligence_${lang}.html`);
      }
    });
  });

  describe('pickDocumentIcon', () => {
    it('returns themed icons for common artifact concepts', () => {
      expect(pickDocumentIcon('readme')).toBe('📘');
      expect(pickDocumentIcon('swot-template')).toBe('🧭');
      expect(pickDocumentIcon('threat-assessment')).toBe('⚠️');
      expect(pickDocumentIcon('risk-scoring')).toBe('📊');
      expect(pickDocumentIcon('classification')).toBe('🏷️');
      expect(pickDocumentIcon('intelligence-feed')).toBe('🔍');
    });

    it('returns a neutral fallback icon for unknown stems', () => {
      expect(pickDocumentIcon('random-stem-here')).toBe('📄');
    });
  });

  describe('pickRunIcon', () => {
    it('maps run slug prefixes to recognizable icons', () => {
      expect(pickRunIcon('breaking-run190')).toBe('🚨');
      expect(pickRunIcon('week-ahead-run45')).toBe('🔭');
      expect(pickRunIcon('motions-run46')).toBe('🗳️');
      expect(pickRunIcon('committee-reports-run07')).toBe('🏛️');
      expect(pickRunIcon('translate-run03')).toBe('🌐');
    });

    it('returns a neutral icon for unknown run slugs', () => {
      expect(pickRunIcon('xyzzy')).toBe('📂');
    });
  });

  describe('parseMarkdownMeta', () => {
    let tempDir;
    beforeEach(() => {
      tempDir = createTempDir();
    });
    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('extracts H1 title and first paragraph, skipping SPDX/HTML comments', () => {
      const file = path.join(tempDir, 'sample.md');
      fs.writeFileSync(
        file,
        `<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->\n<!-- SPDX-License-Identifier: Apache-2.0 -->\n\n# Risk Scoring Methodology\n\nRisk scores combine likelihood and impact on a 1-5 scale.\n\n- bullet to skip\n`,
        'utf-8'
      );
      const meta = parseMarkdownMeta(file, 'sample');
      expect(meta.title).toBe('Risk Scoring Methodology');
      expect(meta.description).toBe('Risk scores combine likelihood and impact on a 1-5 scale.');
    });

    it('skips HTML block lines and strips inline HTML tags from the description', () => {
      // Mirrors the `analysis/methodologies/README.md` shape that was
      // leaking raw `<p align="center"><img …></p>` text into the UI.
      const file = path.join(tempDir, 'html-heavy.md');
      fs.writeFileSync(
        file,
        `<p align="center">\n  <img src="https://hack23.com/icon-192.png" alt="Logo" width="192" height="192">\n</p>\n\n<h1 align="center">📐 Title</h1>\n\n<p align="center"><strong>Real summary of the document.</strong></p>\n\nPlain paragraph follows here.\n`,
        'utf-8'
      );
      const meta = parseMarkdownMeta(file, 'html-heavy');
      // HTML block lines must not leak into the description
      expect(meta.description).not.toContain('<');
      expect(meta.description).not.toContain('&lt;');
      expect(meta.description).not.toContain('img');
      expect(meta.description).toContain('Plain paragraph follows here');
    });

    it('strips nested/recursive tag-shaped sequences (CodeQL incomplete-sanitization regression)', () => {
      // Simulates the case where stripping one tag exposes a *new* tag-shaped
      // sequence in the surrounding text. The fixed-point loop in
      // cleanAndTruncate must keep stripping until none remain, so neither
      // angle-bracket character can survive in the rendered description.
      const file = path.join(tempDir, 'nested.md');
      fs.writeFileSync(
        file,
        '# Title\n\nKeep <img <onerror=x>src=y> and < > stray brackets.\n',
        'utf-8'
      );
      const meta = parseMarkdownMeta(file, 'nested');
      expect(meta.description).not.toContain('<');
      expect(meta.description).not.toContain('>');
      expect(meta.description).not.toContain('onerror');
    });

    it('falls back to a humanized stem if no H1 is present', () => {
      const file = path.join(tempDir, 'per-artifact-catalog.md');
      fs.writeFileSync(file, 'Just some text with no heading at all.\n', 'utf-8');
      const meta = parseMarkdownMeta(file, 'per-artifact-catalog');
      expect(meta.title).toBe('Per Artifact Catalog');
    });

    it('truncates overlong descriptions cleanly at a word boundary', () => {
      const longWords = 'word '.repeat(80);
      const file = path.join(tempDir, 'long.md');
      fs.writeFileSync(file, `# Long\n\n${longWords}\n`, 'utf-8');
      const meta = parseMarkdownMeta(file, 'long');
      expect(meta.description.length).toBeLessThanOrEqual(241);
      expect(meta.description.endsWith('…')).toBe(true);
    });

    it('returns safe defaults when the file cannot be read', () => {
      const meta = parseMarkdownMeta(path.join(tempDir, 'missing.md'), 'missing-file');
      expect(meta.title).toBe('Missing File');
      expect(meta.description).toBe('');
    });
  });

  describe('collectPoliticalIntelligenceData + generatePoliticalIntelligenceHTML', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = createTempDir();
      const mk = (rel, content) => {
        const full = path.join(tempDir, rel);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf-8');
      };

      // Methodologies
      mk(
        'analysis/methodologies/README.md',
        '# Methodology Index\n\nIndex of all political analysis tradecraft guides.\n'
      );
      mk(
        'analysis/methodologies/risk-scoring.md',
        '<!-- SPDX-FileCopyrightText: 2024 Hack23 AB -->\n\n# Risk Scoring\n\nQuantitative risk framework.\n'
      );

      // Templates
      mk('analysis/templates/README.md', '# Template Catalog\n\nAll artifact templates.\n');
      mk('analysis/templates/swot-template.md', '# SWOT Template\n\nQuantitative SWOT.\n');
      mk(
        'analysis/templates/pestle-template.md',
        '# PESTLE Template\n\nPolitical/economic analysis.\n'
      );

      // Daily runs — two dates, newest first
      mk(
        'analysis/daily/2026-04-22/breaking-run1/data/agent-pre-work.md',
        '# Agent Pre-Work\n\nNotes.\n'
      );
      mk('analysis/daily/2026-04-22/breaking-run1/intelligence/swot.md', '# SWOT\n\nData.\n');
      mk(
        'analysis/daily/2026-04-21/motions-run7/intelligence/summary.md',
        '# Summary\n\nPolitical motion summary.\n'
      );
      // Empty-run directory that should be pruned
      fs.mkdirSync(path.join(tempDir, 'analysis/daily/2026-04-20/empty-run'), { recursive: true });
      // Non-date dir that should be ignored
      fs.mkdirSync(path.join(tempDir, 'analysis/daily/not-a-date'), { recursive: true });
    });

    afterEach(() => cleanupTempDir(tempDir));

    it('collects methodologies, templates, and daily runs correctly', () => {
      const data = collectPoliticalIntelligenceData(tempDir);
      expect(data.methodologies).toHaveLength(2);
      expect(data.methodologies[0].stem).toBe('README'); // README sorts first
      expect(data.methodologies[0].title).toBe('Methodology Index');
      expect(data.templates.map((d) => d.stem)).toEqual([
        'README',
        'pestle-template',
        'swot-template',
      ]);

      expect(data.dailyGroups).toHaveLength(2);
      expect(data.dailyGroups[0].date).toBe('2026-04-22'); // newest first
      expect(data.dailyGroups[1].date).toBe('2026-04-21');
      expect(data.dailyGroups[0].runs[0].slug).toBe('breaking-run1');
      expect(data.dailyGroups[0].runs[0].artifactCount).toBe(2);
      expect(data.dailyGroups[0].runs[0].icon).toBe('🚨');
      // Every artifact is collected so the UI can deep-link to each .md file
      expect(data.dailyGroups[0].runs[0].artifacts).toHaveLength(2);
      expect(data.dailyGroups[0].runs[0].artifacts.map((a) => a.shortPath).sort()).toEqual([
        'data/agent-pre-work.md',
        'intelligence/swot.md',
      ]);
      expect(data.dailyGroups[0].runs[0].artifacts[0].relPath).toContain(
        'analysis/daily/2026-04-22/breaking-run1/'
      );
    });

    it('prunes empty-run directories and non-date directories', () => {
      const data = collectPoliticalIntelligenceData(tempDir);
      const dates = data.dailyGroups.map((g) => g.date);
      expect(dates).not.toContain('2026-04-20');
      expect(dates).not.toContain('not-a-date');
    });

    it('renders a complete HTML document with canonical, hreflang alternates, JSON-LD and footer cross-links', () => {
      const data = collectPoliticalIntelligenceData(tempDir);
      const html = generatePoliticalIntelligenceHTML('sv', data);

      // Baseline structure
      expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
      expect(html).toContain('<html lang="sv"');

      // SEO: canonical + hreflang + JSON-LD
      expect(html).toContain(
        '<link rel="canonical" href="https://euparliamentmonitor.com/political-intelligence_sv.html">'
      );
      expect(html).toContain(
        '<link rel="alternate" hreflang="en" href="https://euparliamentmonitor.com/political-intelligence.html">'
      );
      expect(html).toContain(
        '<link rel="alternate" hreflang="de" href="https://euparliamentmonitor.com/political-intelligence_de.html">'
      );
      expect(html).toContain('hreflang="x-default"');
      expect(html).toContain('<script type="application/ld+json">');
      expect(html).toContain('"@type":"CollectionPage"');
      expect(html).toContain('"@type":"BreadcrumbList"');

      // SEO open-graph / twitter
      expect(html).toContain('<meta property="og:type" content="website">');
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
      expect(html).toContain('<meta name="robots" content="index, follow');

      // Content sections
      expect(html).toContain('Politisk underrättelse'); // Swedish title
      expect(html).toContain(
        'href="https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/risk-scoring.md"'
      );
      expect(html).toContain(
        'href="https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/swot-template.md"'
      );
      expect(html).toContain(
        'href="https://github.com/Hack23/euparliamentmonitor/tree/main/analysis/daily/2026-04-22/breaking-run1"'
      );
      // Per-artifact file links — every .md file in the run surfaces as a
      // deep link, so readers don't have to navigate the folder tree first.
      expect(html).toContain(
        'href="https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-04-22/breaking-run1/data/agent-pre-work.md"'
      );
      expect(html).toContain(
        'href="https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-04-22/breaking-run1/intelligence/swot.md"'
      );
      expect(html).toContain('<details class="pi-run__artifacts">');
      expect(html).toContain('pi-run__artifacts-toggle');
      // Swedish toggle label (count-interpolated)
      expect(html).toContain('Visa alla 2 artefaktfiler');

      // Non-English pages hide English source-paragraph descriptions and
      // show a localized "source materials are in English" note instead
      expect(html).not.toContain('pi-card__desc');
      expect(html).toContain('pi-source-note');
      expect(html).toContain('Källmaterialet');

      // SEO: author + publisher + og:image:alt + twitter:image
      expect(html).toContain('<meta name="author" content="Hack23 AB">');
      expect(html).toContain('<meta name="publisher" content="Hack23 AB">');
      expect(html).toContain('og:image:alt');
      expect(html).toContain('<meta name="twitter:image"');
      expect(html).toContain('<meta http-equiv="Content-Language" content="sv">');
      expect(html).toContain('"publisher":{');
      expect(html).toContain('"author":{');
      // JSON-LD ListItem must use schema.org `item` (matches sitemap/breadcrumb
      // convention) and numberOfItems must equal the number of itemListElement
      // entries (4 sections), not the document total.
      expect(html).toContain(
        '"item":"https://euparliamentmonitor.com/political-intelligence_sv.html#pi-methodologies"'
      );
      expect(html).toContain(
        '"item":"https://euparliamentmonitor.com/political-intelligence_sv.html#pi-daily"'
      );
      expect(html).not.toMatch(/"url":"[^"]*#pi-methodologies"/);
      expect(html).toContain('"numberOfItems":4');

      // Stats
      expect(html).toContain('<dd>2</dd>'); // methodologies count
      expect(html).toContain('<dd>3</dd>'); // templates count

      // Footer must point at language-specific sitemap variant with localized label
      expect(html).toContain('<a href="sitemap_sv.html">Webbplatskarta</a>');
      expect(html).toContain('<a href="index-sv.html">Hem</a>');
    });

    it('emits a valid English variant with the bare filename in canonical + JSON-LD urls', () => {
      const data = collectPoliticalIntelligenceData(tempDir);
      const html = generatePoliticalIntelligenceHTML('en', data);
      expect(html).toContain(
        '<link rel="canonical" href="https://euparliamentmonitor.com/political-intelligence.html">'
      );
      expect(html).toContain('"url":"https://euparliamentmonitor.com/political-intelligence.html"');
      expect(html).toContain('<a href="sitemap.html">Sitemap</a>');
      // English page keeps the per-card description (source is English) and
      // does NOT render the localized "source in English" note.
      expect(html).toContain('pi-card__desc');
      expect(html).not.toContain('pi-source-note');
      // Card description is a <span> (phrasing content) — NOT <p>, which
      // would be invalid nested inside <span class="pi-card__body">.
      expect(html).not.toMatch(/<p class="pi-card__desc"/);
      expect(html).toMatch(/<span class="pi-card__desc"/);
    });

    it('sets dir="rtl" for Arabic and Hebrew', () => {
      const data = collectPoliticalIntelligenceData(tempDir);
      expect(generatePoliticalIntelligenceHTML('ar', data)).toContain('dir="rtl"');
      expect(generatePoliticalIntelligenceHTML('he', data)).toContain('dir="rtl"');
      expect(generatePoliticalIntelligenceHTML('en', data)).toContain('dir="ltr"');
    });
  });
});
