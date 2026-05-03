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
import {
  getArtifactInfo,
  getRunTypeInfo,
} from '../../scripts/generators/political-intelligence-descriptions.js';
import { getPoliticalIntelligenceSeo } from '../../scripts/generators/seo-copy.js';
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

    it('extracts H1 title and leaves description empty (curated-table drives description)', () => {
      // Rationale: first-paragraph extraction proved fragile and leaked
      // document-metadata headers + template separators into the rendered
      // cards. The generator now sources descriptions from
      // political-intelligence-descriptions.ts instead; parseMarkdownMeta
      // only needs to resolve the H1 title.
      const file = path.join(tempDir, 'sample.md');
      fs.writeFileSync(
        file,
        `<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->\n<!-- SPDX-License-Identifier: Apache-2.0 -->\n\n# Risk Scoring Methodology\n\nRisk scores combine likelihood and impact on a 1-5 scale.\n\n- bullet to skip\n`,
        'utf-8'
      );
      const meta = parseMarkdownMeta(file, 'sample');
      expect(meta.title).toBe('Risk Scoring Methodology');
      expect(meta.description).toBe('');
    });

    it('falls back to a humanized stem if no H1 is present', () => {
      const file = path.join(tempDir, 'per-artifact-catalog.md');
      fs.writeFileSync(file, 'Just some text with no heading at all.\n', 'utf-8');
      const meta = parseMarkdownMeta(file, 'per-artifact-catalog');
      expect(meta.title).toBe('Per Artifact Catalog');
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
      const seo = getPoliticalIntelligenceSeo('sv');

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
      expect(html).toContain(
        `"@type":"ListItem","position":1,"name":"${seo.breadcrumbHome}","item":"https://euparliamentmonitor.com/index-sv.html"`
      );
      expect(html).toContain(
        `<nav class="breadcrumb" aria-label="${seo.breadcrumbAriaLabel}">`
      );
      expect(html).toContain('"@type":"FAQPage","inLanguage":"en"');

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

      // All language pages now carry curated descriptions (generic
      // localized fallback applies for files not in the curated table,
      // which includes the test fixture files). The English-only
      // suppression was removed so every reader — in any language — gets
      // a meaningful summary next to each methodology/template/reference.
      expect(html).toContain('pi-card__desc');
      // The "source materials in English" note still applies because the
      // underlying MD source files and artifact paths remain in English.
      expect(html).toContain('pi-source-note');
      expect(html).toContain('Källmaterialet');

      // SEO: author + publisher + og:image:alt + twitter:image
      expect(html).toContain('<meta name="author" content="Hack23 AB">');
      expect(html).toContain('<meta name="publisher" content="Hack23 AB">');
      expect(html).toContain('og:image:alt');
      expect(html).toContain(`<meta property="og:image:alt" content="${seo.ogImageAlt}">`);
      expect(html).toContain('<meta name="twitter:image"');
      expect(html).toContain(`<meta name="twitter:image:alt" content="${seo.ogImageAlt}">`);
      expect(html).toContain('<meta http-equiv="Content-Language" content="sv">');
      // SEO: per-language keywords (Swedish page must ship Swedish terms,
      // not a hard-coded English list). This is the fix that replaces the
      // previous English-only `<meta name="keywords">` on every page.
      expect(html).toMatch(/<meta name="keywords" content="[^"]*SWOT-analys[^"]*">/);
      expect(html).toMatch(/<meta name="keywords" content="[^"]*Europaparlamentet[^"]*">/);
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

    it('renders rich, localized run cards + per-artifact cards (not bare filename links)', () => {
      const data = collectPoliticalIntelligenceData(tempDir);
      const htmlEn = generatePoliticalIntelligenceHTML('en', data);
      const htmlSv = generatePoliticalIntelligenceHTML('sv', data);
      const htmlDe = generatePoliticalIntelligenceHTML('de', data);

      // Every run card exposes a localized run-type title + description +
      // a run-id badge so the section is no longer a flat list of slugs.
      expect(htmlEn).toContain('class="pi-run__title">Breaking Analysis');
      expect(htmlEn).toContain('class="pi-run__runid"');
      expect(htmlEn).toContain('#run1');
      expect(htmlEn).toContain('class="pi-run__desc"');
      expect(htmlSv).toContain('Analys av aktuella nyheter');
      expect(htmlDe).toContain('Aktuelle Analyse');

      // Raw slug is retained as an auditable sub-label inside the meta line,
      // not as the primary heading.
      expect(htmlEn).toContain('<code>breaking-run1</code>');

      // Per-artifact cards — every .md file in the run surfaces as a
      // rich card with an icon, localized title, description and
      // filename pill (not a flat `<li><a><code>path</code></a></li>`).
      expect(htmlEn).toContain('class="pi-artifact"');
      expect(htmlEn).toContain('class="pi-artifact__link"');
      expect(htmlEn).toContain('class="pi-artifact__icon"');
      expect(htmlEn).toContain('class="pi-artifact__title"');
      expect(htmlEn).toContain('class="pi-artifact__desc"');
      expect(htmlEn).toContain('class="pi-artifact__path"');
      expect(htmlEn).toContain('<code>intelligence/swot.md</code>');

      // Non-English pages carry localized artifact titles/descriptions — no
      // raw English leakage for known templates (SWOT template is curated).
      // At minimum, each artifact card must carry non-empty pi-artifact__title
      // and pi-artifact__desc spans in the page language.
      expect(htmlSv).toContain('class="pi-artifact__title"');
      expect(htmlSv).toContain('class="pi-artifact__desc"');
      // Swedish run description from the curated RUN_TYPE_DESCRIPTIONS table
      // must appear on the Swedish page (guards against raw-English leakage).
      expect(htmlSv).toContain('Snabb analys av en enskild');
    });

    it('ships distinct localized SEO keywords for all 14 language pages', () => {
      // Regression guard: the initial implementation hard-coded English
      // keywords on every `political-intelligence_<lang>.html` page — a
      // significant SEO miss because search engines could not index the
      // page under native-language terms. Every language must now ship
      // keywords written in its own script/vocabulary.
      const data = collectPoliticalIntelligenceData(tempDir);
      const langs = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
      const keywordsByLang = new Map();
      for (const lang of langs) {
        const html = generatePoliticalIntelligenceHTML(lang, data);
        const m = html.match(/<meta name="keywords" content="([^"]+)">/);
        expect(m, `${lang} page must carry a keywords meta tag`).not.toBeNull();
        keywordsByLang.set(lang, m[1]);
      }
      // All 14 languages produce a distinct keyword list.
      const unique = new Set(keywordsByLang.values());
      expect(unique.size).toBe(14);
      // Spot-check native-script terms that prove real localization.
      expect(keywordsByLang.get('ja')).toContain('欧州議会');
      expect(keywordsByLang.get('ko')).toContain('유럽의회');
      expect(keywordsByLang.get('zh')).toContain('欧洲议会');
      expect(keywordsByLang.get('ar')).toContain('البرلمان الأوروبي');
      expect(keywordsByLang.get('he')).toContain('הפרלמנט האירופי');
      expect(keywordsByLang.get('de')).toContain('Europäisches Parlament');
      expect(keywordsByLang.get('fr')).toContain('Parlement européen');
    });

    it('emits a valid English variant with the bare filename in canonical + JSON-LD urls', () => {
      const data = collectPoliticalIntelligenceData(tempDir);
      const html = generatePoliticalIntelligenceHTML('en', data);
      expect(html).toContain(
        '<link rel="canonical" href="https://euparliamentmonitor.com/political-intelligence.html">'
      );
      expect(html).toContain('"url":"https://euparliamentmonitor.com/political-intelligence.html"');
      expect(html).toContain('<a href="sitemap.html">Sitemap</a>');
      // English page still renders the per-card description (now from
      // the curated localized table, not scraped Markdown) and does NOT
      // render the localized "source in English" note.
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

  describe('getCuratedDescription (curated per-file, per-language descriptions)', () => {
    it('returns the curated English description for a known methodology path', async () => {
      const { getCuratedDescription } = await import(
        '../../scripts/generators/political-intelligence-descriptions.js'
      );
      const desc = getCuratedDescription(
        'analysis/methodologies/ai-driven-analysis-guide.md',
        'en'
      );
      expect(desc).toContain('10-step AI-driven analysis protocol');
    });

    it('returns the localized description when a per-language overlay exists', async () => {
      const { getCuratedDescription } = await import(
        '../../scripts/generators/political-intelligence-descriptions.js'
      );
      const sv = getCuratedDescription(
        'analysis/methodologies/ai-driven-analysis-guide.md',
        'sv'
      );
      const ko = getCuratedDescription(
        'analysis/methodologies/ai-driven-analysis-guide.md',
        'ko'
      );
      // Swedish overlay uses distinctive Scandinavian tokens
      expect(sv).toMatch(/[åäö]/);
      // Korean overlay uses Hangul codepoints
      expect(ko).toMatch(/[\uac00-\ud7af]/);
    });

    it('falls back to a localized sentence (not raw English) when a non-English language overlay is missing', async () => {
      const { getCuratedDescription } = await import(
        '../../scripts/generators/political-intelligence-descriptions.js'
      );
      // Template entries intentionally ship English-only descriptions (the
      // per-file description catalog is English; per-file TITLES are fully
      // localized). On non-English pages we therefore must NEVER return the
      // raw English description — the lookup must synthesize a localized
      // sentence built from the localized title + kind word. This keeps the
      // page fully localized without requiring 49 × 14 hand-written
      // description translations.
      const nl = getCuratedDescription(
        'analysis/templates/swot-analysis.md',
        'nl',
        'SWOT Analysis Template'
      );
      // Localized kind word ('sjabloon' in Dutch) must appear.
      expect(nl.toLowerCase()).toContain('sjabloon');
      // Raw English description tokens must NOT leak through.
      expect(nl).not.toContain('Strengths');
      // English callers still receive the curated canonical description.
      const en = getCuratedDescription(
        'analysis/templates/swot-analysis.md',
        'en'
      );
      expect(en).toContain('SWOT');
      expect(en).toContain('Strengths');
    });

    it('returns a fully-localized card title for every curated methodology across all 14 languages', async () => {
      const { getCuratedTitle, hasCuratedTitle } = await import(
        '../../scripts/generators/political-intelligence-descriptions.js'
      );
      const langs = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
      const path = 'analysis/methodologies/ai-driven-analysis-guide.md';
      expect(hasCuratedTitle(path)).toBe(true);
      const titles = new Set();
      for (const lang of langs) {
        const t = getCuratedTitle(path, lang, 'H1 fallback');
        expect(typeof t).toBe('string');
        expect(t.trim().length).toBeGreaterThan(0);
        // Guard: the fallback must never surface — curated entry exists
        expect(t).not.toBe('H1 fallback');
        titles.add(t);
      }
      // We expect at least 10 distinct titles across the 14 languages
      // (scripts diverge: Latin, Arabic, Hebrew, CJK, Hangul).
      expect(titles.size).toBeGreaterThanOrEqual(10);
    });

    it('falls back to the H1 title when neither the curated title overlay nor description entry has a localized title', async () => {
      const { getCuratedTitle } = await import(
        '../../scripts/generators/political-intelligence-descriptions.js'
      );
      const t = getCuratedTitle(
        'analysis/templates/brand-new-unknown-file.md',
        'sv',
        'Brand New Unknown File'
      );
      expect(t).toBe('Brand New Unknown File');
    });

    it('returns a localized generic fallback for unmapped methodology / template files', async () => {
      const { getCuratedDescription } = await import(
        '../../scripts/generators/political-intelligence-descriptions.js'
      );
      const enFallback = getCuratedDescription(
        'analysis/methodologies/brand-new-unknown-file.md',
        'en'
      );
      expect(enFallback).toContain('methodology');
      expect(enFallback).toContain('EU Parliament Monitor');

      const svFallback = getCuratedDescription(
        'analysis/templates/brand-new-unknown-file.md',
        'sv'
      );
      expect(svFallback).toContain('mall');

      const jaFallback = getCuratedDescription(
        'analysis/reference/brand-new-unknown-file.md',
        'ja'
      );
      expect(jaFallback).toContain('参照資料');
    });

    it('never returns an empty string — every file+lang combo yields a renderable description', async () => {
      const { getCuratedDescription } = await import(
        '../../scripts/generators/political-intelligence-descriptions.js'
      );
      const langs = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
      const probe = [
        'analysis/methodologies/political-risk-methodology.md',
        'analysis/templates/risk-assessment.md',
        'analysis/reference/isms-classification-adaptation.md',
        'analysis/imf/README.md',
        'analysis/worldbank/indicator-catalog.md',
        'analysis/templates/no-such-file.md', // unmapped — must hit localized fallback
      ];
      for (const lang of langs) {
        for (const path of probe) {
          const desc = getCuratedDescription(path, lang);
          expect(desc, `${path} (${lang}) should not be empty`).toBeTruthy();
          expect(desc.length, `${path} (${lang}) should be non-trivial`).toBeGreaterThan(15);
        }
      }
    });
  });

  describe('getArtifactInfo (feed-prefix + synonym + orphan coverage)', () => {
    it('collapses every feed-prefixed artifact into a single localized per-item label', () => {
      // All 5 EP-API feed prefixes must resolve to their canonical
      // localized title in every language — so 200+ adopted-text / procedure
      // / event artifact files no longer render with raw slug titles.
      const langs = ['en', 'sv', 'de', 'fr', 'ar', 'ja', 'zh'];
      const feeds = [
        ['adoptedtexts-ta-10-2026-0001-analysis.md', /Adopted Text Analysis|Analys av antagen|angenommenen|adopté|معتمد|採択|已通过/],
        ['procedures-2026-0008-cod-analysis.md', /Legislative Procedure|lagstiftnings|Gesetzgebungs|législative|تشريعي|立法手続|立法程序/],
        ['documents-econ-working-document.md', /Committee Document|utskott|Ausschuss|commission|لجنة|委員会|委员会/],
        ['events-plenary-session-restart.md', /Parliamentary Event|parlamentarisk|parlamentarisch|parlementaire|برلمان|議会イベント|议会活动/],
        ['externaldocuments-eli-dl-doc.md', /External Document|externt|externen|externe|خارجية|外部文書|外部文件/],
      ];
      for (const [shortPath, pattern] of feeds) {
        for (const lang of langs) {
          const info = getArtifactInfo(shortPath, lang);
          expect(info.title.length, `${shortPath} ${lang} title`).toBeGreaterThan(3);
          expect(info.description.length, `${shortPath} ${lang} desc`).toBeGreaterThan(30);
        }
        // English must use the canonical English label
        const en = getArtifactInfo(shortPath, 'en');
        expect(en.title, `${shortPath} en`).toMatch(pattern);
      }
    });

    it('applies synonyms so ai-/political- variants share the curated template entry', () => {
      // `ai-swot-analysis.md` must resolve to the same curated SWOT title
      // as `swot-analysis.md` (and never to the humanized "Ai Swot Analysis")
      const aiSwot = getArtifactInfo('intelligence/ai-swot-analysis.md', 'en');
      const swot = getArtifactInfo('intelligence/swot-analysis.md', 'en');
      expect(aiSwot.title).toBe(swot.title);
      expect(aiSwot.description).toBe(swot.description);

      // `political-risk-assessment.md` must share the risk-assessment title
      const polRisk = getArtifactInfo('risk/political-risk-assessment.md', 'en');
      const risk = getArtifactInfo('risk/risk-assessment.md', 'en');
      expect(polRisk.title).toBe(risk.title);

      // `threat-landscape.md` must map to threat-analysis (not raw stem)
      const landscape = getArtifactInfo('threat/threat-landscape.md', 'sv');
      const analysis = getArtifactInfo('threat/threat-analysis.md', 'sv');
      expect(landscape.title).toBe(analysis.title);

      // `.analysis.md` compound extension must strip cleanly
      const compound = getArtifactInfo('intelligence/political-landscape.analysis.md', 'en');
      expect(compound.title).not.toMatch(/\.analysis/);
    });

    it('ships orphan artifact stems in all 14 languages', () => {
      // `agent-pre-work`, `summary`, `readme` have no template file — they
      // must still deliver non-English localized titles & descriptions.
      const langs = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
      for (const stem of ['agent-pre-work', 'summary', 'readme']) {
        for (const lang of langs) {
          const info = getArtifactInfo(`data/${stem}.md`, lang);
          expect(info.title.length, `${stem} ${lang} title`).toBeGreaterThan(2);
          expect(info.description.length, `${stem} ${lang} desc`).toBeGreaterThan(30);
        }
      }
      // Specific localized spot-checks to guard against raw-English leakage
      expect(getArtifactInfo('data/summary.md', 'sv').title).toBe('Körnings­sammanfattning');
      expect(getArtifactInfo('data/agent-pre-work.md', 'de').title).toBe('Agenten-Vorarbeit');
      expect(getArtifactInfo('data/summary.md', 'ja').title).toBe('実行サマリー');
    });

    it('falls back to the daily-artifact kind word (not "template") for unmapped stems', () => {
      // Unmapped stem — no curated template entry, no orphan entry. The
      // localized fallback sentence MUST describe the item as a daily-run
      // artifact ("artifact" in EN, "artefakt" in SV, …) — NOT as a
      // "template" — because we're rendering inside Daily Analysis Runs.
      const enDesc = getArtifactInfo('intelligence/my-brand-new-artifact.md', 'en').description;
      expect(enDesc).toMatch(/artifact/i);
      expect(enDesc).not.toMatch(/template/i);

      const svDesc = getArtifactInfo('intelligence/my-brand-new-artifact.md', 'sv').description;
      // Swedish kind word for a daily artifact is "artefakt"; for a
      // template it would be "mall". We want the former.
      expect(svDesc).toMatch(/artefakt/i);
      expect(svDesc).not.toMatch(/mall/i);
    });

    it('is immune to prototype-key lookups (__proto__, constructor)', () => {
      // `Object.prototype.hasOwnProperty.call` guards every stem-derived
      // lookup. A filename stem like `__proto__` or `constructor` must
      // NOT pick up `Object.prototype` members — it has to flow through
      // to the localized generic fallback.
      for (const pollutant of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
        const info = getArtifactInfo(`data/${pollutant}.md`, 'en');
        expect(info.title.length, `${pollutant} title`).toBeGreaterThan(0);
        expect(info.description.length, `${pollutant} desc`).toBeGreaterThan(30);
        // Must flow through to the generic artifact sentence, not crash
        // and not leak a JS built-in method body as a description.
        expect(info.description).toMatch(/artifact|template/i);
      }
    });
  });
});
