// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for utils/article-quality-scorer module
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  scoreArticleQuality,
  assessAnalysisDepth,
  assessStakeholderCoverage,
  assessVisualizationQuality,
  calculateOverallScore,
  generateRecommendations,
} from '../../scripts/utils/article-quality-scorer.js';

// ─── HTML helpers ─────────────────────────────────────────────────────────────

/** Build a minimal valid article HTML with a main content section */
function buildHtml(body = '', extra = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head><title>Test</title></head>
<body>
${extra}
<main id="main">
<article>${body}</article>
</main>
</body>
</html>`;
}

/** Generate a string of approximately n words */
function words(n) {
  return Array(n).fill('word').join(' ');
}

// ─── assessAnalysisDepth ─────────────────────────────────────────────────────

describe('assessAnalysisDepth', () => {
  it('returns all false and score=0 for empty HTML', () => {
    const result = assessAnalysisDepth('');
    expect(result.politicalContextPresent).toBe(false);
    expect(result.coalitionDynamicsAnalyzed).toBe(false);
    expect(result.historicalContextProvided).toBe(false);
    expect(result.evidenceBasedConclusions).toBe(false);
    expect(result.scenarioPlanning).toBe(false);
    expect(result.confidenceLevelsIndicated).toBe(false);
    expect(result.score).toBe(0);
  });

  it('detects political context keywords', () => {
    const html = buildHtml(
      '<p>The political coalition achieved a majority over the opposition.</p>'
    );
    const result = assessAnalysisDepth(html);
    expect(result.politicalContextPresent).toBe(true);
  });

  it('detects coalition dynamics keywords', () => {
    const html = buildHtml('<p>The EPP and S&D formed an alliance with Renew.</p>');
    const result = assessAnalysisDepth(html);
    expect(result.coalitionDynamicsAnalyzed).toBe(true);
  });

  it('detects coalition dynamics with HTML-encoded entities (S&amp;D)', () => {
    const html = buildHtml('<p>The EPP and S&amp;D formed an alliance with Renew.</p>');
    const result = assessAnalysisDepth(html);
    expect(result.coalitionDynamicsAnalyzed).toBe(true);
  });

  it('detects historical context keywords', () => {
    const html = buildHtml('<p>Historically, compared to the previous term since 2019.</p>');
    const result = assessAnalysisDepth(html);
    expect(result.historicalContextProvided).toBe(true);
  });

  it('detects evidence-based keywords', () => {
    const html = buildHtml(
      '<p>According to the data, evidence suggests the figures are rising.</p>'
    );
    const result = assessAnalysisDepth(html);
    expect(result.evidenceBasedConclusions).toBe(true);
  });

  it('detects scenario planning keywords', () => {
    const html = buildHtml(
      '<p>The scenario could lead to a projection and forecast of growth.</p>'
    );
    const result = assessAnalysisDepth(html);
    expect(result.scenarioPlanning).toBe(true);
  });

  it('detects confidence level keywords', () => {
    const html = buildHtml(
      '<p>The outcome is likely and probably uncertain with high confidence.</p>'
    );
    const result = assessAnalysisDepth(html);
    expect(result.confidenceLevelsIndicated).toBe(true);
  });

  it('returns score=100 when all dimensions are present', () => {
    const html = buildHtml(
      `<p>The political coalition achieved majority, historically compared to previous term since 2019.
      According to data, evidence suggests the EPP and S&D scenario could project forecast figures.
      The outcome is likely probably uncertain confidence alliance Renew Greens.</p>`
    );
    const result = assessAnalysisDepth(html);
    expect(result.score).toBe(100);
  });

  it('score is proportional to number of true dimensions', () => {
    // Only political context present (1 of 6 dimensions)
    const html = buildHtml('<p>The political majority in parliament.</p>');
    const result = assessAnalysisDepth(html);
    // Should be around 17% (1/6 rounded)
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(50);
  });

  it('score is clamped between 0 and 100', () => {
    const result = assessAnalysisDepth(buildHtml('<p>word</p>'));
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

// ─── assessStakeholderCoverage ────────────────────────────────────────────────

describe('assessStakeholderCoverage', () => {
  it('returns empty present list and full missing list for empty HTML', () => {
    const result = assessStakeholderCoverage('');
    expect(result.perspectivesPresent).toHaveLength(0);
    expect(result.perspectivesMissing.length).toBeGreaterThan(0);
    expect(result.balanceScore).toBe(0);
  });

  it('detects MEPs/Parliament stakeholder', () => {
    const html = buildHtml('<p>MEP John Smith addressed the parliament session.</p>');
    const result = assessStakeholderCoverage(html);
    expect(result.perspectivesPresent).toContain('MEPs/Parliament');
  });

  it('detects Commission stakeholder', () => {
    const html = buildHtml(
      '<p>The European Commission commissioner proposed a new regulation.</p>'
    );
    const result = assessStakeholderCoverage(html);
    expect(result.perspectivesPresent).toContain('Commission');
  });

  it('detects Council stakeholder', () => {
    const html = buildHtml('<p>The Council presidency reviewed the member states proposal.</p>');
    const result = assessStakeholderCoverage(html);
    expect(result.perspectivesPresent).toContain('Council');
  });

  it('detects civil society/NGOs stakeholder', () => {
    const html = buildHtml(
      '<p>Civil society NGO and non-governmental advocacy groups responded.</p>'
    );
    const result = assessStakeholderCoverage(html);
    expect(result.perspectivesPresent).toContain('civil society/NGOs');
  });

  it('detects industry/business stakeholder', () => {
    const html = buildHtml('<p>Industry business corporate sector companies reacted.</p>');
    const result = assessStakeholderCoverage(html);
    expect(result.perspectivesPresent).toContain('industry/business');
  });

  it('detects citizens stakeholder', () => {
    const html = buildHtml('<p>Citizens voters constituents public opinion mattered.</p>');
    const result = assessStakeholderCoverage(html);
    expect(result.perspectivesPresent).toContain('citizens');
  });

  it('detects media stakeholder', () => {
    const html = buildHtml('<p>Media press journalist outlet coverage was extensive.</p>');
    const result = assessStakeholderCoverage(html);
    expect(result.perspectivesPresent).toContain('media');
  });

  it('applies reasoning quality penalty for generic phrases', () => {
    const html = buildHtml('<p>MEP parliament. Several MEPs voted. Various committees met.</p>');
    const result = assessStakeholderCoverage(html);
    expect(result.reasoningQuality).toBeLessThan(result.balanceScore);
  });

  it('balanceScore is 100 when all stakeholders covered', () => {
    const html = buildHtml(
      `<p>MEP parliament commissioner Council presidency member states government national minister.
       Civil society NGO industry business citizens voters media press journalist.</p>`
    );
    const result = assessStakeholderCoverage(html);
    expect(result.balanceScore).toBe(100);
    expect(result.perspectivesMissing).toHaveLength(0);
  });

  it('scores are clamped between 0 and 100', () => {
    const result = assessStakeholderCoverage(buildHtml('<p>test</p>'));
    expect(result.balanceScore).toBeGreaterThanOrEqual(0);
    expect(result.balanceScore).toBeLessThanOrEqual(100);
    expect(result.reasoningQuality).toBeGreaterThanOrEqual(0);
    expect(result.reasoningQuality).toBeLessThanOrEqual(100);
  });
});

// ─── assessVisualizationQuality ───────────────────────────────────────────────

describe('assessVisualizationQuality', () => {
  it('returns all false/zero for empty HTML', () => {
    const result = assessVisualizationQuality('');
    expect(result.swotPresent).toBe(false);
    expect(result.swotDimensions).toBe(0);
    expect(result.dashboardPresent).toBe(false);
    expect(result.dashboardMetrics).toBe(0);
    expect(result.dashboardTrends).toBe(false);
    expect(result.mindmapPresent).toBe(false);
    expect(result.mindmapBranches).toBe(0);
    expect(result.deepAnalysisPresent).toBe(false);
    expect(result.deepAnalysisEvidence).toBe(0);
    expect(result.score).toBe(0);
  });

  it('detects SWOT by class', () => {
    const html = buildHtml('<section class="swot-analysis"><p>Strengths</p></section>');
    const result = assessVisualizationQuality(html);
    expect(result.swotPresent).toBe(true);
  });

  it('detects SWOT with multi-class attributes (e.g. swot-multidimensional)', () => {
    const html = buildHtml(
      '<section class="swot-analysis swot-multidimensional"><p>SWOT</p></section>'
    );
    const result = assessVisualizationQuality(html);
    expect(result.swotPresent).toBe(true);
  });

  it('detects SWOT by id', () => {
    const html = buildHtml('<section id="swot-analysis"><p>Analysis</p></section>');
    const result = assessVisualizationQuality(html);
    expect(result.swotPresent).toBe(true);
  });

  it('counts SWOT dimensions', () => {
    const html = buildHtml(
      `<section class="swot-analysis">
        <div class="swot-quadrant swot-strengths">S</div>
        <div class="swot-quadrant swot-weaknesses">W</div>
        <div class="swot-quadrant swot-opportunities">O</div>
        <div class="swot-quadrant swot-threats">T</div>
      </section>`
    );
    const result = assessVisualizationQuality(html);
    expect(result.swotDimensions).toBe(4);
  });

  it('detects dashboard by class', () => {
    const html = buildHtml(
      '<section class="dashboard"><div class="metric-card">42</div></section>'
    );
    const result = assessVisualizationQuality(html);
    expect(result.dashboardPresent).toBe(true);
    expect(result.dashboardMetrics).toBeGreaterThan(0);
  });

  it('detects dashboard trends via arrow symbols', () => {
    const html = buildHtml(
      '<section class="dashboard"><span class="metric-trend-up">↑ 5%</span><span class="metric-trend-down">↓ 2%</span></section>'
    );
    const result = assessVisualizationQuality(html);
    expect(result.dashboardTrends).toBe(true);
  });

  it('detects dashboard trends via class', () => {
    const html = buildHtml(
      '<section class="dashboard"><span class="metric-trend-up">rising</span></section>'
    );
    const result = assessVisualizationQuality(html);
    expect(result.dashboardTrends).toBe(true);
  });

  it('does not treat hyphenated dashboard classes as dashboardPresent', () => {
    // Only layout/child classes like dashboard-grid, dashboard-panel, dashboard-chart
    // should NOT trigger dashboardPresent — the exact "dashboard" token is required.
    const html = buildHtml(
      '<div class="dashboard-grid"><div class="dashboard-panel"><canvas class="dashboard-chart"></canvas></div></div>'
    );
    const result = assessVisualizationQuality(html);
    expect(result.dashboardPresent).toBe(false);
  });

  it('detects mindmap by class', () => {
    const html = buildHtml(
      '<section class="mindmap-section"><div class="mindmap-container"><ul><li>Node 1</li></ul></div></section>'
    );
    const result = assessVisualizationQuality(html);
    expect(result.mindmapPresent).toBe(true);
  });

  it('counts mindmap depth via mindmap-branch classes', () => {
    const html = buildHtml(
      `<section class="mindmap-section">
        <div class="mindmap-container">
          <div class="mindmap-branch">B1</div>
          <div class="mindmap-branch">B2</div>
          <div class="mindmap-branch">B3</div>
        </div>
      </section>`
    );
    const result = assessVisualizationQuality(html);
    expect(result.mindmapBranches).toBe(3);
  });

  it('counts mindmap ul nesting depth with inner divs (balanced tag matching)', () => {
    const html = buildHtml(
      `<section class="mindmap-section">
        <div class="mindmap-container">
          <ul><li>Top
            <ul><li>Mid
              <ul><li>Deep</li></ul>
            </li></ul>
          </li></ul>
        </div>
      </section>`
    );
    const result = assessVisualizationQuality(html);
    expect(result.mindmapBranches).toBe(3);
  });

  it('counts only analysis-content sections, not generic or non-analysis sections', () => {
    const html = buildHtml(
      `<section class="analysis-section"><p>Analysis A</p></section>
       <section class="deep-analysis"><p>Analysis B</p></section>
       <section><p>Plain section (no class — not counted)</p></section>
       <section class="article-sources"><p>Sources (not counted)</p></section>`
    );
    // Only the 2 sections with analysis-related classes are counted
    const report = scoreArticleQuality(html, 'test', 'en', 'week-ahead');
    expect(report.analysisSections).toBe(2);
  });

  it('detects deep analysis by class', () => {
    const html = buildHtml('<section class="deep-analysis"><p>In depth</p></section>');
    const result = assessVisualizationQuality(html);
    expect(result.deepAnalysisPresent).toBe(true);
  });

  it('detects deep analysis by id pattern', () => {
    const html = buildHtml('<section id="deep-dive"><p>Analysis</p></section>');
    const result = assessVisualizationQuality(html);
    expect(result.deepAnalysisPresent).toBe(true);
  });

  it('score is > 0 for article with all visual elements', () => {
    const html = buildHtml(`
      <section class="swot-analysis"><div class="swot-quadrant swot-s">S</div><div class="swot-quadrant swot-w">W</div><div class="swot-quadrant swot-o">O</div></section>
      <section class="dashboard"><div class="metric-card">10</div><div class="metric-card">20</div><span class="metric-trend-up">↑</span></section>
      <section class="mindmap-section"><div class="mindmap-container"><div class="mindmap-branch">B1</div><div class="mindmap-branch">B2</div><div class="mindmap-branch">B3</div></div></section>
      <section class="deep-analysis"><span class="evidence">Ref 1</span><span class="evidence">Ref 2</span></section>
    `);
    const result = assessVisualizationQuality(html);
    expect(result.score).toBeGreaterThan(50);
  });

  it('counts perspective-evidence <li> items inside deep-analysis as deepAnalysisEvidence', () => {
    const html = buildHtml(`
      <section class="deep-analysis">
        <div class="stakeholder-perspective-card">
          <ul class="perspective-evidence"><li>Evidence item 1</li><li>Evidence item 2</li></ul>
        </div>
        <div class="stakeholder-perspective-card">
          <ul class="perspective-evidence"><li>Evidence item 3</li></ul>
        </div>
      </section>
    `);
    const result = assessVisualizationQuality(html);
    expect(result.deepAnalysisPresent).toBe(true);
    expect(result.deepAnalysisEvidence).toBe(3);
  });

  it('counts swot-ref-evidence markers in SWOT sections', () => {
    const html = buildHtml(`
      <section class="swot-analysis">
        <div class="swot-quadrant swot-s">Strengths</div>
        <div class="swot-cross-references">
          <li class="swot-ref-item"><span class="swot-ref-evidence">Evidence: Item 1</span></li>
          <li class="swot-ref-item"><span class="swot-ref-evidence">Evidence: Item 2</span></li>
        </div>
      </section>
    `);
    // swot-ref-evidence markers count toward evidenceReferences (top-level)
    // Exactly 2 swot-ref-evidence markers, no other evidence sources in this HTML
    const report = scoreArticleQuality(html, 'test-swot', 'en', 'week-ahead');
    expect(report.evidenceReferences).toBe(2);
  });

  it('score is clamped between 0 and 100', () => {
    const result = assessVisualizationQuality(buildHtml('<p>test</p>'));
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

// ─── calculateOverallScore ────────────────────────────────────────────────────

describe('calculateOverallScore', () => {
  /** Build a zero-value AnalysisDepthScore */
  function zeroDepth() {
    return {
      politicalContextPresent: false,
      coalitionDynamicsAnalyzed: false,
      historicalContextProvided: false,
      evidenceBasedConclusions: false,
      scenarioPlanning: false,
      confidenceLevelsIndicated: false,
      score: 0,
    };
  }

  /** Build a zero-value StakeholderCoverage */
  function zeroCoverage() {
    return {
      perspectivesPresent: [],
      perspectivesMissing: [],
      balanceScore: 0,
      reasoningQuality: 0,
    };
  }

  /** Build a zero-value VisualizationQuality */
  function zeroViz() {
    return {
      swotPresent: false,
      swotDimensions: 0,
      dashboardPresent: false,
      dashboardMetrics: 0,
      dashboardTrends: false,
      mindmapPresent: false,
      mindmapBranches: 0,
      deepAnalysisPresent: false,
      deepAnalysisEvidence: 0,
      score: 0,
    };
  }

  it('returns 0 for all-zero inputs', () => {
    const score = calculateOverallScore(zeroDepth(), zeroCoverage(), zeroViz(), 0, 0);
    expect(score).toBe(0);
  });

  it('returns 100 for all-maximum inputs', () => {
    const depth = { ...zeroDepth(), score: 100 };
    const coverage = { ...zeroCoverage(), balanceScore: 100 };
    const viz = { ...zeroViz(), score: 100 };
    const score = calculateOverallScore(depth, coverage, viz, 1500, 10);
    expect(score).toBe(100);
  });

  it('is clamped to 0 for negative word count', () => {
    const score = calculateOverallScore(zeroDepth(), zeroCoverage(), zeroViz(), -100, 0);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('word count of 1500 contributes maximum word-count component', () => {
    const depth = { ...zeroDepth(), score: 100 };
    const coverage = { ...zeroCoverage(), balanceScore: 100 };
    const viz = { ...zeroViz(), score: 100 };
    const scoreWith1500 = calculateOverallScore(depth, coverage, viz, 1500, 10);
    const scoreWith0 = calculateOverallScore(depth, coverage, viz, 0, 10);
    expect(scoreWith1500).toBeGreaterThan(scoreWith0);
  });

  it('evidence count of 10 contributes maximum evidence component', () => {
    const score10 = calculateOverallScore(zeroDepth(), zeroCoverage(), zeroViz(), 0, 10);
    const score0 = calculateOverallScore(zeroDepth(), zeroCoverage(), zeroViz(), 0, 0);
    expect(score10).toBeGreaterThan(score0);
  });

  it('returns a number between 0 and 100', () => {
    const score = calculateOverallScore(
      { ...zeroDepth(), score: 60 },
      { ...zeroCoverage(), balanceScore: 50 },
      { ...zeroViz(), score: 40 },
      800,
      5
    );
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ─── scoreArticleQuality — full integration ───────────────────────────────────

describe('scoreArticleQuality', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a report with all required fields for empty HTML', () => {
    const report = scoreArticleQuality('', 'test-id', 'en', 'week-ahead');
    expect(report).toHaveProperty('articleId', 'test-id');
    expect(report).toHaveProperty('lang', 'en');
    expect(report).toHaveProperty('type', 'week-ahead');
    expect(report).toHaveProperty('overallScore');
    expect(report).toHaveProperty('grade');
    expect(report).toHaveProperty('passesQualityGate');
    expect(report).toHaveProperty('recommendations');
    expect(report).toHaveProperty('analysisDepth');
    expect(report).toHaveProperty('stakeholderCoverage');
    expect(report).toHaveProperty('visualizationQuality');
  });

  it('scores empty HTML as grade F with passesQualityGate=false', () => {
    const report = scoreArticleQuality('', 'empty', 'en', 'week-ahead');
    expect(report.grade).toBe('F');
    expect(report.passesQualityGate).toBe(false);
    expect(report.overallScore).toBeLessThan(25);
  });

  it('produces recommendations for empty HTML', () => {
    const report = scoreArticleQuality('', 'empty', 'en', 'week-ahead');
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it('scores minimal HTML with short text as low quality', () => {
    const html = buildHtml('<p>Short article.</p>');
    const report = scoreArticleQuality(html, 'minimal', 'en', 'week-ahead');
    expect(report.overallScore).toBeLessThanOrEqual(40);
    expect(report.wordCount).toBeLessThan(50);
  });

  it('scores rich HTML with all quality signals as C or higher', () => {
    const html = buildHtml(`
      <p>${words(1600)} The political coalition majority opposition parliament EPP S&D Renew.
      According to data, evidence suggests figures historically compared to previous term since 2019.
      The scenario could project forecast, likely probably uncertain confidence.
      MEP parliament commissioner Council member states government civil society NGO
      industry business citizens voters media press.</p>
      <section class="swot-analysis">
        <div class="swot-quadrant swot-strengths">S</div>
        <div class="swot-quadrant swot-weaknesses">W</div>
        <div class="swot-quadrant swot-opportunities">O</div>
        <div class="swot-quadrant swot-threats">T</div>
      </section>
      <section class="dashboard">
        <div class="metric-card">1</div><div class="metric-card">2</div>
        <div class="metric-card">3</div><div class="metric-card">4</div>
        <div class="metric-card">5</div>
        <span class="metric-trend-up">↑</span>
      </section>
      <section class="mindmap-section">
        <div class="mindmap-container">
          <div class="mindmap-branch">B1</div>
          <div class="mindmap-branch">B2</div>
          <div class="mindmap-branch">B3</div>
        </div>
      </section>
      <section class="deep-analysis">
        <span class="evidence">Ref 1</span>
        <span class="evidence">Ref 2</span>
        <span class="evidence">Ref 3</span>
      </section>
    `);
    const report = scoreArticleQuality(html, 'rich', 'en', 'week-ahead');
    expect(['A', 'B', 'C']).toContain(report.grade);
    expect(report.overallScore).toBeGreaterThanOrEqual(40);
    expect(report.passesQualityGate).toBe(true);
  });

  it('date field is a valid YYYY-MM-DD string', () => {
    const report = scoreArticleQuality('', 'test', 'en', 'week-ahead');
    expect(report.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('derives date from articleId when it contains a date prefix', () => {
    const report = scoreArticleQuality('', '2026-03-13-week-ahead', 'en', 'week-ahead');
    expect(report.date).toBe('2026-03-13');
  });

  it('falls back to current date when articleId has no date prefix', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
    const report = scoreArticleQuality('', 'no-date-slug', 'en', 'week-ahead');
    expect(report.date).toBe('2026-06-15');
  });

  it('articleId, lang, type are preserved from inputs', () => {
    const report = scoreArticleQuality('', 'my-id', 'fr', 'breaking');
    expect(report.articleId).toBe('my-id');
    expect(report.lang).toBe('fr');
    expect(report.type).toBe('breaking');
  });

  it('non-English articles are not penalised by English-only keyword lists', () => {
    // Content without any English analysis keywords — English scorer gets score=0,
    // but non-English scorer applies a baseline floor of 50 to compensate for the
    // fact that translated content cannot match the English keyword lists.
    const html = buildHtml(`<p>${words(800)} Zusammenfassung der politischen Lage.</p>`);
    const reportDe = scoreArticleQuality(html, 'de-test', 'de', 'week-ahead');
    const reportEn = scoreArticleQuality(html, 'en-test', 'en', 'week-ahead');
    // English analysis depth score is 0 (no keywords matched)
    expect(reportEn.analysisDepth.score).toBe(0);
    // German score is raised to at least the baseline floor
    expect(reportDe.analysisDepth.score).toBeGreaterThanOrEqual(50);
    expect(reportDe.stakeholderCoverage.balanceScore).toBeGreaterThanOrEqual(50);
  });

  it('non-English articles receive baseline floors on keyword-dependent scores', () => {
    const html = buildHtml('<p>Simple text without English keywords.</p>');
    const report = scoreArticleQuality(html, 'fr-test', 'fr', 'week-ahead');
    // The non-English baseline is 50
    expect(report.analysisDepth.score).toBeGreaterThanOrEqual(50);
    expect(report.stakeholderCoverage.balanceScore).toBeGreaterThanOrEqual(50);
  });
});

// ─── Grade boundaries ─────────────────────────────────────────────────────────

describe('grade boundaries via scoreArticleQuality', () => {
  /**
   * Build an HTML string calibrated to produce approximately the given score.
   * Uses a specific combination of signals to push the score to the target range.
   */
  function buildHtmlForScore(targetScore) {
    // A score depends on: depth(25%), stakeholder(20%), viz(25%), wordCount(15%), evidence(15%)
    // We control these dimensions to approximate target
    const needsHighScore = targetScore >= 80;
    const needsMedScore = targetScore >= 65;
    const needsLowMedScore = targetScore >= 40;

    if (needsHighScore) {
      return buildHtml(`
        <p>${words(1600)} political coalition majority EPP S&D Renew according to data evidence historically since 2019
        scenario could forecast likely probably uncertain confidence
        MEP parliament commissioner Council member states government civil society NGO
        industry business citizens voters media press journalist TA-10-2026-0001 TA-10-2026-0002 TA-10-2026-0003
        PE-123.456 A9-0001 B9-0002 C9-0003 TA-10-2026-0004 TA-10-2026-0005 TA-10-2026-0006</p>
        <section class="swot-analysis">
          <div class="swot-quadrant swot-s">S</div><div class="swot-quadrant swot-w">W</div>
          <div class="swot-quadrant swot-o">O</div><div class="swot-quadrant swot-t">T</div>
        </section>
        <section class="dashboard">
          <div class="metric-card">1</div><div class="metric-card">2</div>
          <div class="metric-card">3</div><div class="metric-card">4</div>
          <div class="metric-card">5</div><span class="metric-trend-up">↑</span>
        </section>
        <section class="mindmap-section">
          <div class="mindmap-container">
            <div class="mindmap-branch">B1</div><div class="mindmap-branch">B2</div>
            <div class="mindmap-branch">B3</div>
          </div>
        </section>
        <section class="deep-analysis">
          <span class="evidence">R1</span><span class="evidence">R2</span><span class="evidence">R3</span>
        </section>
      `);
    }
    if (needsMedScore) {
      return buildHtml(`
        <p>${words(1000)} political coalition EPP S&D according to data evidence historically since 2019
        scenario likely uncertain MEP parliament commissioner Council citizens</p>
        <section class="swot-analysis"><div class="swot-quadrant swot-s">S</div><div class="swot-quadrant swot-w">W</div></section>
        <section class="dashboard"><div class="metric-card">1</div><div class="metric-card">2</div><span class="metric-trend-up">↑</span></section>
      `);
    }
    if (needsLowMedScore) {
      return buildHtml(`
        <p>${words(500)} political parliament MEP commissioner</p>
        <section class="swot-analysis"><div class="swot-quadrant swot-s">S</div></section>
      `);
    }
    return buildHtml(`<p>${words(100)}</p>`);
  }

  it('rich content produces a high score (B or A)', () => {
    const html = buildHtmlForScore(85);
    const report = scoreArticleQuality(html, 'a-test', 'en', 'week-ahead');
    expect(['A', 'B']).toContain(report.grade);
    expect(report.overallScore).toBeGreaterThanOrEqual(40);
  });

  it('grade F is assigned for very low quality content', () => {
    const report = scoreArticleQuality('', 'f-test', 'en', 'week-ahead');
    expect(report.grade).toBe('F');
    expect(report.overallScore).toBeLessThan(25);
  });

  it('passesQualityGate is false when overallScore < 40', () => {
    const report = scoreArticleQuality('<p>short</p>', 'f-test', 'en', 'week-ahead');
    expect(report.passesQualityGate).toBe(report.overallScore >= 40);
  });

  it('passesQualityGate is true for rich content', () => {
    const html = buildHtmlForScore(85);
    const report = scoreArticleQuality(html, 'rich-test', 'en', 'week-ahead');
    if (report.overallScore >= 40) {
      expect(report.passesQualityGate).toBe(true);
    }
  });
});

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  function baseReport(overrides = {}) {
    return {
      articleId: 'test',
      date: '2025-01-01',
      type: 'week-ahead',
      lang: 'en',
      wordCount: 0,
      analysisSections: 0,
      evidenceReferences: 0,
      analysisDepth: {
        politicalContextPresent: false,
        coalitionDynamicsAnalyzed: false,
        historicalContextProvided: false,
        evidenceBasedConclusions: false,
        scenarioPlanning: false,
        confidenceLevelsIndicated: false,
        score: 0,
      },
      stakeholderCoverage: {
        perspectivesPresent: [],
        perspectivesMissing: ['MEPs/Parliament', 'Commission'],
        balanceScore: 0,
        reasoningQuality: 0,
      },
      visualizationQuality: {
        swotPresent: false,
        swotDimensions: 0,
        dashboardPresent: false,
        dashboardMetrics: 0,
        dashboardTrends: false,
        mindmapPresent: false,
        mindmapBranches: 0,
        deepAnalysisPresent: false,
        deepAnalysisEvidence: 0,
        score: 0,
      },
      overallScore: 0,
      grade: 'F',
      passesQualityGate: false,
      ...overrides,
    };
  }

  it('recommends expanding word count when below 500', () => {
    const recs = generateRecommendations(baseReport({ wordCount: 100 }));
    expect(recs.some((r) => r.includes('500 words'))).toBe(true);
  });

  it('recommends increasing word count when below 1500', () => {
    const recs = generateRecommendations(baseReport({ wordCount: 600 }));
    expect(recs.some((r) => r.includes('1500'))).toBe(true);
  });

  it('recommends adding political context when missing', () => {
    const recs = generateRecommendations(baseReport());
    expect(recs.some((r) => r.includes('political context'))).toBe(true);
  });

  it('recommends adding SWOT when missing', () => {
    const recs = generateRecommendations(baseReport());
    expect(recs.some((r) => r.includes('SWOT'))).toBe(true);
  });

  it('recommends adding dashboard when missing', () => {
    const recs = generateRecommendations(baseReport());
    expect(recs.some((r) => r.includes('dashboard'))).toBe(true);
  });

  it('recommends missing stakeholder perspectives', () => {
    const recs = generateRecommendations(baseReport());
    expect(recs.some((r) => r.includes('perspectives from missing stakeholders'))).toBe(true);
  });

  it('recommends adding evidence references when below 3', () => {
    const recs = generateRecommendations(baseReport({ evidenceReferences: 1 }));
    expect(recs.some((r) => r.includes('evidence references'))).toBe(true);
  });

  it('returns empty recommendations for a fully scored report', () => {
    const report = baseReport({
      wordCount: 1500,
      evidenceReferences: 10,
      analysisDepth: {
        politicalContextPresent: true,
        coalitionDynamicsAnalyzed: true,
        historicalContextProvided: true,
        evidenceBasedConclusions: true,
        scenarioPlanning: true,
        confidenceLevelsIndicated: true,
        score: 100,
      },
      stakeholderCoverage: {
        perspectivesPresent: ['MEPs/Parliament', 'Commission', 'Council', 'citizens', 'media'],
        perspectivesMissing: [],
        balanceScore: 100,
        reasoningQuality: 100,
      },
      visualizationQuality: {
        swotPresent: true,
        swotDimensions: 4,
        dashboardPresent: true,
        dashboardMetrics: 5,
        dashboardTrends: true,
        mindmapPresent: true,
        mindmapBranches: 3,
        deepAnalysisPresent: true,
        deepAnalysisEvidence: 10,
        score: 100,
      },
      overallScore: 100,
      grade: 'A',
      passesQualityGate: true,
    });
    const recs = generateRecommendations(report);
    expect(recs).toHaveLength(0);
  });

  it('omits keyword-based recommendations for non-English articles', () => {
    // A non-English report with no keyword-based signals should not emit
    // analysis-depth or stakeholder recommendations since they derive from
    // English-only keyword detection.
    const recs = generateRecommendations(baseReport({ lang: 'de' }));
    expect(recs.some((r) => r.includes('political context'))).toBe(false);
    expect(recs.some((r) => r.includes('coalition dynamics'))).toBe(false);
    expect(recs.some((r) => r.includes('perspectives from missing stakeholders'))).toBe(false);
    // Non-keyword recommendations (word count, visualization, evidence) should still appear
    expect(recs.some((r) => r.includes('500 words'))).toBe(true);
    expect(recs.some((r) => r.includes('SWOT'))).toBe(true);
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles HTML with only whitespace gracefully', () => {
    expect(() => scoreArticleQuality('   \n\t  ', 'ws', 'en', 'week-ahead')).not.toThrow();
  });

  it('handles very long HTML without errors', () => {
    const html = buildHtml(`<p>${words(5000)}</p>`);
    expect(() => scoreArticleQuality(html, 'long', 'en', 'week-ahead')).not.toThrow();
  });

  it('handles HTML with special characters', () => {
    const html = buildHtml('<p>Ärger über Ärger &amp; &lt;tags&gt;</p>');
    expect(() => scoreArticleQuality(html, 'special', 'de', 'week-ahead')).not.toThrow();
  });

  it('handles articles without a <main> element', () => {
    const html = '<html><body><p>No main element here.</p></body></html>';
    expect(() => scoreArticleQuality(html, 'no-main', 'en', 'week-ahead')).not.toThrow();
  });

  it('EP document references are counted (known formats TA-, PE-, A9-)', () => {
    const html = buildHtml('<p>See TA-10-2026-0001 and PE-456.789 and A9-0123 in the report.</p>');
    const report = scoreArticleQuality(html, 'ep-refs', 'en', 'week-ahead');
    expect(report.evidenceReferences).toBeGreaterThanOrEqual(3);
  });

  it('EP document ref pattern excludes generic codes like EU-27', () => {
    const html = buildHtml('<p>The EU-27 members and EEA-32 discussed the proposal.</p>');
    const report = scoreArticleQuality(html, 'no-ep-refs', 'en', 'week-ahead');
    // EU-27 and EEA-32 should NOT be counted as evidence references
    expect(report.evidenceReferences).toBe(0);
  });

  it('EP doc refs inside script blocks (JSON-LD) are not double-counted', () => {
    const html = buildHtml(
      `<p>See TA-10-2026-0001 in the report.</p>
       <script type="application/ld+json">{"keywords":"TA-10-2026-0001"}</script>`
    );
    const report = scoreArticleQuality(html, 'script-dedup', 'en', 'week-ahead');
    // TA-10-2026-0001 appears in both body and script; only the body occurrence should count
    expect(report.evidenceReferences).toBeGreaterThanOrEqual(1);
    // Should NOT be 2 (double-counted via JSON-LD)
    const htmlNoDup = buildHtml('<p>See TA-10-2026-0001 in the report.</p>');
    const reportNoDup = scoreArticleQuality(htmlNoDup, 'no-script', 'en', 'week-ahead');
    expect(report.evidenceReferences).toBe(reportNoDup.evidenceReferences);
  });

  it('PE-123.456 is not double-counted as both PE-123.456 and PE-123', () => {
    const html = buildHtml('<p>See PE-123.456 in the report.</p>');
    const report = scoreArticleQuality(html, 'pe-dedup', 'en', 'week-ahead');
    // Should count exactly 1 EP ref (the dotted form), not 2
    expect(report.evidenceReferences).toBe(1);
  });
});
