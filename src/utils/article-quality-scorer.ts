// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/ArticleQualityScorer
 * @description Comprehensive quality assessment engine for generated EU Parliament Monitor articles.
 *
 * Analyses HTML article content across four dimensions:
 * - **Analysis depth** — political context, coalition dynamics, historical evidence, scenarios
 * - **Stakeholder coverage** — breadth of perspectives from MEPs, Commission, civil society, etc.
 * - **Visualization quality** — SWOT, dashboard metrics, mindmap layers, deep-analysis evidence
 * - **Content integrity** — word count, evidence references, section structure
 *
 * Produces an {@link ArticleQualityReport} with a 0–100 overall score, letter grade (A–F),
 * pass/fail quality gate, and actionable recommendations.
 */

import type {
  ArticleQualityReport,
  AnalysisDepthScore,
  StakeholderCoverage,
  VisualizationQuality,
  ArticleGrade,
} from '../types/quality.js';

// ─── Scoring constants ────────────────────────────────────────────────────────

/** Weight applied to analysis depth score in overall calculation */
const WEIGHT_ANALYSIS_DEPTH = 0.25;
/** Weight applied to stakeholder balance score in overall calculation */
const WEIGHT_STAKEHOLDER = 0.2;
/** Weight applied to visualization quality score in overall calculation */
const WEIGHT_VISUALIZATION = 0.25;
/** Weight applied to word-count score in overall calculation */
const WEIGHT_WORD_COUNT = 0.15;
/** Weight applied to evidence-reference score in overall calculation */
const WEIGHT_EVIDENCE = 0.15;

/** Minimum word count to score 0 on the word-count dimension */
const WORD_COUNT_MIN = 0;
/** Word count that earns the maximum word-count dimension score */
const WORD_COUNT_MAX = 1500;

/** Evidence-reference count that earns the maximum evidence dimension score */
const EVIDENCE_MAX = 10;

/** Overall score threshold for passing the quality gate (Grade C floor) */
const QUALITY_GATE_THRESHOLD = 40;

/** Grade boundary — score >= this earns an A */
const GRADE_A_MIN = 80;
/** Grade boundary — score >= this earns a B */
const GRADE_B_MIN = 65;
/** Grade boundary — score >= this earns a C */
const GRADE_C_MIN = 40;
/** Grade boundary — score >= this earns a D */
const GRADE_D_MIN = 25;

// ─── Analysis-depth keyword sets ─────────────────────────────────────────────

/** Keywords indicating political context discussion */
const POLITICAL_CONTEXT_KEYWORDS: ReadonlyArray<string> = [
  'political',
  'coalition',
  'majority',
  'opposition',
  'parliament',
];

/** Keywords indicating coalition-dynamics analysis */
const COALITION_DYNAMICS_KEYWORDS: ReadonlyArray<string> = [
  'coalition',
  'alliance',
  'EPP',
  'S&D',
  'Renew',
  'Greens',
];

/** Keywords indicating historical context */
const HISTORICAL_CONTEXT_KEYWORDS: ReadonlyArray<string> = [
  'historically',
  'since 2019',
  'previous term',
  'compared to',
];

/** Keywords indicating evidence-based reasoning */
const EVIDENCE_BASED_KEYWORDS: ReadonlyArray<string> = [
  'according to',
  'data shows',
  'evidence suggests',
  'figures',
];

/** Keywords indicating scenario planning or projections */
const SCENARIO_PLANNING_KEYWORDS: ReadonlyArray<string> = [
  'if ',
  'could',
  'scenario',
  'projection',
  'forecast',
];

/** Keywords indicating stated confidence levels */
const CONFIDENCE_LEVEL_KEYWORDS: ReadonlyArray<string> = [
  'likely',
  'probably',
  'uncertain',
  'confidence',
];

// ─── Stakeholder detection sets ───────────────────────────────────────────────

/** All known stakeholder categories and their keyword signals */
const STAKEHOLDER_KEYWORDS: ReadonlyArray<{ name: string; keywords: ReadonlyArray<string> }> = [
  { name: 'MEPs/Parliament', keywords: ['MEP', 'parliament', 'parliamentarian', 'deputy'] },
  {
    name: 'Commission',
    keywords: ['Commission', 'commissioner', 'European Commission'],
  },
  { name: 'Council', keywords: ['Council', 'presidency', 'member states'] },
  {
    name: 'member states/governments',
    keywords: ['government', 'national', 'member state', 'minister'],
  },
  {
    name: 'civil society/NGOs',
    keywords: ['civil society', 'NGO', 'non-governmental', 'advocacy'],
  },
  {
    name: 'industry/business',
    keywords: ['industry', 'business', 'corporate', 'sector', 'company'],
  },
  { name: 'citizens', keywords: ['citizen', 'public', 'voter', 'constituent'] },
  { name: 'media', keywords: ['media', 'press', 'journalist', 'outlet'] },
];

// ─── Placeholder / generic-phrase patterns ────────────────────────────────────

/** Patterns indicating vague or un-replaced generic phrases */
const GENERIC_PHRASE_PATTERNS: ReadonlyArray<RegExp> = [
  /various committees/iu,
  /several MEPs/iu,
  /multiple documents/iu,
  /some countries/iu,
];

// ─── EP document-reference pattern ───────────────────────────────────────────

/**
 * Patterns matching known EP document reference formats.
 * Uses separate patterns to avoid alternation complexity flagged by security/detect-unsafe-regex.
 * Covers: TA-10-2026-0123, PE-123.456, A9-0123, B9-0123, C9-0123, P9_TA(2024)0001
 * Excludes broad matches like EU-27 or EEA-32.
 */
const EP_DOC_PATTERNS: ReadonlyArray<RegExp> = [
  /\bTA-\d+-\d+/gu, // TA-10-2026-0001
  /\bPE-\d+/gu, // PE-123 or PE-123.456
  /\b[A-C]\d-\d+\b/gu, // A9-0123, B9-0002, C9-0003 (variable-length digits)
  /\bP\d_TA\(\d{4}\)\d+\b/gu, // P9_TA(2024)0001
];

/** CSS class selector for deep-analysis sections (extracted to avoid duplication) */
const CLASS_DEEP_ANALYSIS = 'class="deep-analysis"';

// ─── HTML entity map ──────────────────────────────────────────────────────────

/** Common HTML entities to decode when extracting plain text */
const HTML_ENTITY_MAP: Readonly<Record<string, string>> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

/** Pattern matching named and numeric HTML entities */
const HTML_ENTITY_PATTERN = /&(?:#(\d+)|#x([0-9a-fA-F]+)|([a-zA-Z]+));/gu;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Decode HTML entities in a string.
 * Handles named entities (&amp;, &lt;, &gt;, &quot;, &#39;, &apos;, &nbsp;)
 * and numeric references (&#123;, &#x7B;).
 *
 * @param text - Text possibly containing HTML entities
 * @returns Text with entities replaced by their character equivalents
 */
function decodeHtmlEntities(text: string): string {
  return text.replace(HTML_ENTITY_PATTERN, (match, decimal, hex, named) => {
    if (decimal !== undefined) return String.fromCharCode(parseInt(decimal, 10));
    if (hex !== undefined) return String.fromCharCode(parseInt(hex, 16));
    if (named !== undefined) {
      const key = `&${named};`;
      return HTML_ENTITY_MAP[key] ?? match;
    }
    return match;
  });
}

/**
 * Count non-overlapping occurrences of a CSS class or id string in HTML.
 *
 * @param html - HTML string to search
 * @param selector - CSS class or id token to count (e.g. `class="metric"`)
 * @returns Number of occurrences found
 */
function countOccurrences(html: string, selector: string): number {
  let count = 0;
  let index = html.indexOf(selector);
  while (index !== -1) {
    count++;
    index = html.indexOf(selector, index + 1);
  }
  return count;
}

/**
 * Check whether at least one keyword from a list is present in a text string.
 *
 * @param text - Text to search (comparison is case-insensitive)
 * @param keywords - Keywords to look for
 * @returns true if any keyword is found
 */
function containsAnyKeyword(text: string, keywords: ReadonlyArray<string>): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Extract the plain text content from the `<main>` element of an HTML string.
 * Falls back to the full document when no `<main>` is found.
 * Decodes HTML entities so keyword detection works on real article HTML.
 *
 * @param html - Raw HTML string
 * @returns Plain text stripped of tags, scripts, and HTML entities
 */
function extractPlainText(html: string): string {
  const mainMatch = /<main[^>]*>([\s\S]*?)<\/main>/u.exec(html);
  const source = mainMatch?.[1] ?? html;
  const stripped = source
    .replace(/<script[^>]*>[\s\S]*?<\/script[^>]*>/giu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
  return decodeHtmlEntities(stripped);
}

/**
 * Count the approximate number of words in an HTML document's main content.
 *
 * @param html - Raw HTML string
 * @returns Word count
 */
function countWords(html: string): number {
  const text = extractPlainText(html);
  if (!text) return 0;
  return text.split(' ').length;
}

/**
 * Count structural analysis sections in HTML.
 * Uses a Set to avoid double-counting elements that have both a `<section` tag
 * and an `analysis-section` or `deep-analysis` class on the same element.
 *
 * @param html - Raw HTML string
 * @returns Number of unique analysis sections found
 */
function countAnalysisSections(html: string): number {
  const positions = new Set<number>();

  addTagPositions(html, '<section', positions);
  addClassPositions(html, 'class="analysis-section"', positions);
  addClassPositions(html, CLASS_DEEP_ANALYSIS, positions);

  return positions.size;
}

/**
 * Add start positions of a tag or selector to the position set.
 *
 * @param html - HTML string
 * @param token - Token to search for
 * @param positions - Mutable set to add positions into
 */
function addTagPositions(html: string, token: string, positions: Set<number>): void {
  let idx = html.indexOf(token);
  while (idx !== -1) {
    positions.add(idx);
    idx = html.indexOf(token, idx + 1);
  }
}

/**
 * Add positions of class attributes, mapped to their enclosing tag start.
 *
 * @param html - HTML string
 * @param classAttr - Class attribute string to search for
 * @param positions - Mutable set to add enclosing tag positions into
 */
function addClassPositions(html: string, classAttr: string, positions: Set<number>): void {
  let idx = html.indexOf(classAttr);
  while (idx !== -1) {
    const tagStart = html.lastIndexOf('<', idx);
    if (tagStart !== -1) positions.add(tagStart);
    idx = html.indexOf(classAttr, idx + 1);
  }
}

/**
 * Count evidence and document references in HTML.
 * Detects `class="evidence"`, `data-reference`, and EP document reference codes.
 *
 * @param html - Raw HTML string
 * @returns Number of evidence references found
 */
function countEvidenceRefs(html: string): number {
  const evidenceClasses = countOccurrences(html, 'class="evidence"');
  const dataRefs = countOccurrences(html, 'data-reference');
  let epRefs = 0;
  for (const pattern of EP_DOC_PATTERNS) {
    pattern.lastIndex = 0;
    epRefs += html.match(pattern)?.length ?? 0;
  }
  return evidenceClasses + dataRefs + epRefs;
}

/**
 * Compute the mindmap depth by counting `class="mindmap-branch"` elements or
 * nested `ul > li` depth within a mindmap section.
 * Uses balanced tag matching to avoid truncating at inner closing tags.
 *
 * @param html - Raw HTML string
 * @returns Estimated mindmap depth
 */
function computeMindmapDepth(html: string): number {
  // Real mindmap HTML uses class="mindmap-branch" elements
  const branchCount = countOccurrences(html, 'class="mindmap-branch"');
  if (branchCount > 0) return branchCount;

  const sectionContent = extractMindmapSection(html);
  if (!sectionContent) return 0;

  return measureUlNestingDepth(sectionContent);
}

/**
 * Extract the full content of a mindmap container using balanced tag matching.
 *
 * @param html - Raw HTML string
 * @returns Inner HTML of the mindmap container, or empty string if not found
 */
function extractMindmapSection(html: string): string {
  // Real mindmap uses: class="mindmap-section", class="mindmap-container"
  const openPatterns = [
    /class="mindmap-section"[^>]*>/u,
    /class="mindmap-container"[^>]*>/u,
    /id="mindmap"[^>]*>/u,
  ];

  for (const pattern of openPatterns) {
    const openMatch = pattern.exec(html);
    if (!openMatch) continue;

    const startIdx = openMatch.index + openMatch[0].length;
    const content = findBalancedContent(html, startIdx);
    if (content) return content;
  }

  return '';
}

/**
 * Walk forward from a starting position to find balanced closing tag content.
 *
 * @param html - HTML string
 * @param startIdx - Position right after the opening tag
 * @returns Content between the opening and its balanced closing tag, or empty string
 */
function findBalancedContent(html: string, startIdx: number): string {
  let depth = 1;
  const closeTagPattern = /<\/?(?:div|section|article)[\s>/]/giu;
  closeTagPattern.lastIndex = startIdx;
  let tagMatch = closeTagPattern.exec(html);
  while (tagMatch) {
    if (tagMatch[0].startsWith('</')) {
      depth--;
      if (depth === 0) return html.slice(startIdx, tagMatch.index);
    } else {
      depth++;
    }
    tagMatch = closeTagPattern.exec(html);
  }
  return '';
}

/**
 * Measure the maximum `<ul>` nesting depth within a section of HTML.
 *
 * @param section - HTML section content
 * @returns Maximum nesting depth
 */
function measureUlNestingDepth(section: string): number {
  let maxDepth = 0;
  let ulDepth = 0;
  for (let i = 0; i < section.length - 3; i++) {
    if (section.slice(i, i + 3) === '<ul') {
      ulDepth++;
      if (ulDepth > maxDepth) maxDepth = ulDepth;
    } else if (section.slice(i, i + 5) === '</ul>') {
      ulDepth--;
    }
  }
  return maxDepth;
}

/**
 * Check whether generic/placeholder phrases appear in the article text.
 *
 * @param html - Raw HTML string
 * @returns true if any generic phrase pattern is detected
 */
function hasGenericPhrases(html: string): boolean {
  return GENERIC_PHRASE_PATTERNS.some((pattern) => pattern.test(html));
}

/**
 * Clamp a numeric value between 0 and 100.
 *
 * @param value - Value to clamp
 * @returns Value clamped to [0, 100]
 */
function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

// ─── Analysis depth assessment ────────────────────────────────────────────────

/**
 * Assess the analytical depth of an article by detecting keyword signals.
 *
 * @param html - Raw HTML string of the article
 * @returns Analysis depth score with per-dimension flags and composite score
 */
export function assessAnalysisDepth(html: string): AnalysisDepthScore {
  const text = extractPlainText(html);

  const politicalContextPresent = containsAnyKeyword(text, POLITICAL_CONTEXT_KEYWORDS);
  const coalitionDynamicsAnalyzed = containsAnyKeyword(text, COALITION_DYNAMICS_KEYWORDS);
  const historicalContextProvided = containsAnyKeyword(text, HISTORICAL_CONTEXT_KEYWORDS);
  const evidenceBasedConclusions = containsAnyKeyword(text, EVIDENCE_BASED_KEYWORDS);
  const scenarioPlanning = containsAnyKeyword(text, SCENARIO_PLANNING_KEYWORDS);
  const confidenceLevelsIndicated = containsAnyKeyword(text, CONFIDENCE_LEVEL_KEYWORDS);

  const dimensions = [
    politicalContextPresent,
    coalitionDynamicsAnalyzed,
    historicalContextProvided,
    evidenceBasedConclusions,
    scenarioPlanning,
    confidenceLevelsIndicated,
  ];
  const presentCount = dimensions.filter(Boolean).length;
  const score = clamp100(Math.round((presentCount / dimensions.length) * 100));

  return {
    politicalContextPresent,
    coalitionDynamicsAnalyzed,
    historicalContextProvided,
    evidenceBasedConclusions,
    scenarioPlanning,
    confidenceLevelsIndicated,
    score,
  };
}

// ─── Stakeholder coverage assessment ─────────────────────────────────────────

/**
 * Assess how many stakeholder perspectives are covered in the article text.
 *
 * @param html - Raw HTML string of the article
 * @returns Stakeholder coverage assessment with present/missing lists and scores
 */
export function assessStakeholderCoverage(html: string): StakeholderCoverage {
  const text = extractPlainText(html);

  const perspectivesPresent: string[] = [];
  const perspectivesMissing: string[] = [];

  for (const stakeholder of STAKEHOLDER_KEYWORDS) {
    if (containsAnyKeyword(text, stakeholder.keywords)) {
      perspectivesPresent.push(stakeholder.name);
    } else {
      perspectivesMissing.push(stakeholder.name);
    }
  }

  const total = STAKEHOLDER_KEYWORDS.length;
  const balanceScore = clamp100(Math.round((perspectivesPresent.length / total) * 100));

  // Reasoning quality: bonus for not using generic phrases, penalty if they are present
  const genericPenalty = hasGenericPhrases(html) ? 20 : 0;
  const baseReasoningScore = balanceScore;
  const reasoningQuality = clamp100(baseReasoningScore - genericPenalty);

  return {
    perspectivesPresent,
    perspectivesMissing,
    balanceScore,
    reasoningQuality,
  };
}

// ─── Visualization quality assessment ────────────────────────────────────────

/**
 * Assess the quality of embedded visual elements (SWOT, dashboard, mindmap, deep analysis).
 *
 * @param html - Raw HTML string of the article
 * @returns Visualization quality assessment with per-element flags and composite score
 */
export function assessVisualizationQuality(html: string): VisualizationQuality {
  // SWOT: real HTML uses class="swot-analysis" with class="swot-quadrant swot-*" elements
  const swotPresent = html.includes('class="swot-analysis"') || html.includes('id="swot-analysis"');
  // Partial match: quadrant classes include a variant suffix (e.g. "swot-quadrant swot-strengths")
  const swotDimensions =
    countOccurrences(html, 'swot-quadrant') + countOccurrences(html, 'data-dimension');

  // Dashboard: real HTML uses class="dashboard" with class="metric-card" elements
  const dashboardPresent = html.includes('class="dashboard"') || html.includes('id="dashboard"');
  const dashboardMetrics =
    countOccurrences(html, 'class="metric-card"') +
    countOccurrences(html, 'class="dashboard-metric"');
  // Trend indicators: metric-trend-up/-down/-stable classes, or arrow symbols
  const dashboardTrends =
    html.includes('class="metric-trend-') || html.includes('↑') || html.includes('↓');

  // Mindmap: real HTML uses class="mindmap-section" / class="mindmap-container"
  const mindmapPresent =
    html.includes('class="mindmap-section"') ||
    html.includes('class="mindmap-container"') ||
    html.includes('id="mindmap"');
  const mindmapDepth = mindmapPresent ? computeMindmapDepth(html) : 0;

  const deepAnalysisPresent =
    html.includes(CLASS_DEEP_ANALYSIS) || /id="[^"]*deep[^"]*"/iu.test(html);
  const deepAnalysisEvidence = deepAnalysisPresent
    ? countOccurrences(html, 'class="evidence"') + countOccurrences(html, 'data-reference')
    : 0;

  const score = computeVisualizationScore({
    swotPresent,
    swotDimensions,
    dashboardPresent,
    dashboardMetrics,
    dashboardTrends,
    mindmapPresent,
    mindmapDepth,
    deepAnalysisPresent,
    deepAnalysisEvidence,
  });

  return {
    swotPresent,
    swotDimensions,
    dashboardPresent,
    dashboardMetrics,
    dashboardTrends,
    mindmapPresent,
    mindmapDepth,
    deepAnalysisPresent,
    deepAnalysisEvidence,
    score,
  };
}

/**
 * Compute a 0–100 composite visualization score from individual element assessments.
 *
 * @param v - Visualization dimensions (without the score field)
 * @returns Composite visualization score clamped to [0, 100]
 */
function computeVisualizationScore(v: Omit<VisualizationQuality, 'score'>): number {
  let score = 0;

  // SWOT contribution (max 25 points)
  if (v.swotPresent) {
    score += 10;
    score += Math.min(15, v.swotDimensions * 5);
  }

  // Dashboard contribution (max 25 points)
  if (v.dashboardPresent) {
    score += 10;
    score += Math.min(10, v.dashboardMetrics * 2);
    if (v.dashboardTrends) score += 5;
  }

  // Mindmap contribution (max 25 points)
  if (v.mindmapPresent) {
    score += 10;
    score += Math.min(15, v.mindmapDepth * 5);
  }

  // Deep analysis contribution (max 25 points)
  if (v.deepAnalysisPresent) {
    score += 10;
    score += Math.min(15, v.deepAnalysisEvidence * 3);
  }

  return clamp100(score);
}

// ─── Overall score calculation ────────────────────────────────────────────────

/**
 * Compute the weighted overall quality score (0–100) from component scores.
 *
 * Weights:
 * - Analysis depth: 25 %
 * - Stakeholder balance: 20 %
 * - Visualization: 25 %
 * - Word count: 15 %
 * - Evidence references: 15 %
 *
 * @param depth - Analysis depth score object
 * @param coverage - Stakeholder coverage score object
 * @param viz - Visualization quality score object
 * @param wordCount - Plain-text word count of the article
 * @param evidenceRefs - Number of evidence/document references
 * @returns Overall quality score clamped to [0, 100]
 */
export function calculateOverallScore(
  depth: AnalysisDepthScore,
  coverage: StakeholderCoverage,
  viz: VisualizationQuality,
  wordCount: number,
  evidenceRefs: number
): number {
  const wordCountScore = clamp100(
    Math.round(((wordCount - WORD_COUNT_MIN) / (WORD_COUNT_MAX - WORD_COUNT_MIN)) * 100)
  );
  const evidenceScore = clamp100(Math.round((evidenceRefs / EVIDENCE_MAX) * 100));

  const overall =
    depth.score * WEIGHT_ANALYSIS_DEPTH +
    coverage.balanceScore * WEIGHT_STAKEHOLDER +
    viz.score * WEIGHT_VISUALIZATION +
    wordCountScore * WEIGHT_WORD_COUNT +
    evidenceScore * WEIGHT_EVIDENCE;

  return clamp100(Math.round(overall));
}

// ─── Grade assignment ─────────────────────────────────────────────────────────

/**
 * Convert an overall score to a letter grade.
 *
 * @param score - Overall quality score (0–100)
 * @returns Letter grade A–F
 */
function scoreToGrade(score: number): ArticleGrade {
  if (score >= GRADE_A_MIN) return 'A';
  if (score >= GRADE_B_MIN) return 'B';
  if (score >= GRADE_C_MIN) return 'C';
  if (score >= GRADE_D_MIN) return 'D';
  return 'F';
}

// ─── Recommendation generation ────────────────────────────────────────────────

/**
 * Generate actionable improvement recommendations based on a partial quality report.
 *
 * @param report - Quality report without the recommendations field
 * @returns Array of recommendation strings (may be empty for high-quality articles)
 */
export function generateRecommendations(
  report: Omit<ArticleQualityReport, 'recommendations'>
): string[] {
  const recs: string[] = [];

  addWordCountRecommendations(report, recs);
  addAnalysisDepthRecommendations(report.analysisDepth, recs);
  addStakeholderRecommendations(report.stakeholderCoverage, recs);
  addVisualizationRecommendations(report.visualizationQuality, recs);
  addEvidenceRecommendations(report, recs);

  return recs;
}

/**
 * Add word-count related recommendations.
 *
 * @param report - Partial quality report
 * @param recs - Mutable array to push recommendations into
 */
function addWordCountRecommendations(
  report: Omit<ArticleQualityReport, 'recommendations'>,
  recs: string[]
): void {
  if (report.wordCount < 500) {
    recs.push('Expand article length to at least 500 words for Grade C quality');
  } else if (report.wordCount < WORD_COUNT_MAX) {
    recs.push(
      `Increase article depth to ${WORD_COUNT_MAX} words for Grade A quality (currently ${report.wordCount})`
    );
  }
}

/**
 * Add analysis-depth recommendations.
 *
 * @param depth - Analysis depth score
 * @param recs - Mutable array to push recommendations into
 */
function addAnalysisDepthRecommendations(depth: AnalysisDepthScore, recs: string[]): void {
  if (!depth.politicalContextPresent) {
    recs.push('Add political context: discuss coalitions, majorities, and opposition dynamics');
  }
  if (!depth.coalitionDynamicsAnalyzed) {
    recs.push('Analyse coalition dynamics between EPP, S&D, Renew, and other groups');
  }
  if (!depth.historicalContextProvided) {
    recs.push('Provide historical context by comparing to previous terms or key milestones');
  }
  if (!depth.evidenceBasedConclusions) {
    recs.push('Support conclusions with data, figures, or cited evidence');
  }
  if (!depth.scenarioPlanning) {
    recs.push('Include forward-looking scenarios or projections');
  }
  if (!depth.confidenceLevelsIndicated) {
    recs.push('State confidence levels or acknowledge uncertainty in assessments');
  }
}

/**
 * Add stakeholder coverage recommendations.
 *
 * @param coverage - Stakeholder coverage assessment
 * @param recs - Mutable array to push recommendations into
 */
function addStakeholderRecommendations(coverage: StakeholderCoverage, recs: string[]): void {
  if (coverage.perspectivesMissing.length > 0) {
    recs.push(
      `Add perspectives from missing stakeholders: ${coverage.perspectivesMissing.join(', ')}`
    );
  }
  if (coverage.reasoningQuality < 60) {
    recs.push(
      'Replace generic phrases (e.g. "several MEPs", "some countries") with specific named entities'
    );
  }
}

/**
 * Add visualization quality recommendations.
 *
 * @param viz - Visualization quality assessment
 * @param recs - Mutable array to push recommendations into
 */
function addVisualizationRecommendations(viz: VisualizationQuality, recs: string[]): void {
  if (!viz.swotPresent) {
    recs.push('Add a SWOT analysis section to strengthen political assessment');
  } else if (viz.swotDimensions < 3) {
    recs.push(`Expand SWOT dimensions to at least 3 (currently ${viz.swotDimensions})`);
  }

  if (!viz.dashboardPresent) {
    recs.push('Add a data dashboard with key metrics for quantitative support');
  } else if (viz.dashboardMetrics < 5) {
    recs.push(`Add more dashboard metrics to reach 5 (currently ${viz.dashboardMetrics})`);
  }

  if (!viz.mindmapPresent) {
    recs.push('Add a mindmap to illustrate relationships and conceptual structure');
  } else if (viz.mindmapDepth < 3) {
    recs.push(`Deepen mindmap to at least 3 levels (currently ${viz.mindmapDepth})`);
  }

  if (!viz.deepAnalysisPresent) {
    recs.push('Add deep-analysis sections to provide substantive investigative content');
  } else if (viz.deepAnalysisEvidence < 3) {
    recs.push(
      `Include more evidence items in deep-analysis sections (currently ${viz.deepAnalysisEvidence})`
    );
  }
}

/**
 * Add evidence-reference recommendations.
 *
 * @param report - Partial quality report
 * @param recs - Mutable array to push recommendations into
 */
function addEvidenceRecommendations(
  report: Omit<ArticleQualityReport, 'recommendations'>,
  recs: string[]
): void {
  if (report.evidenceReferences < 3) {
    recs.push('Add at least 3 evidence references or EP document citations');
  } else if (report.evidenceReferences < 10) {
    recs.push(
      `Increase evidence references to 10 for Grade A quality (currently ${report.evidenceReferences})`
    );
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Score the quality of a generated article and produce a comprehensive report.
 *
 * This is the primary entry point for the quality assessment pipeline.
 *
 * @param html - Complete HTML string of the generated article
 * @param articleId - Unique identifier for the article (typically the filename slug)
 * @param lang - Language code of the article (e.g. `"en"`, `"de"`)
 * @param articleType - Article category string (e.g. `"week-ahead"`)
 * @returns Comprehensive quality report including grade, score and recommendations
 */
export function scoreArticleQuality(
  html: string,
  articleId: string,
  lang: string,
  articleType: string
): ArticleQualityReport {
  const wordCount = countWords(html);
  const analysisSections = countAnalysisSections(html);
  const evidenceReferences = countEvidenceRefs(html);

  const analysisDepth = assessAnalysisDepth(html);
  const stakeholderCoverage = assessStakeholderCoverage(html);
  const visualizationQuality = assessVisualizationQuality(html);

  const overallScore = calculateOverallScore(
    analysisDepth,
    stakeholderCoverage,
    visualizationQuality,
    wordCount,
    evidenceReferences
  );

  const grade = scoreToGrade(overallScore);
  const passesQualityGate = overallScore >= QUALITY_GATE_THRESHOLD;

  const date = new Date().toISOString().split('T')[0] ?? '';

  const partial: Omit<ArticleQualityReport, 'recommendations'> = {
    articleId,
    date,
    type: articleType,
    lang,
    wordCount,
    analysisSections,
    evidenceReferences,
    analysisDepth,
    stakeholderCoverage,
    visualizationQuality,
    overallScore,
    grade,
    passesQualityGate,
  };

  const recommendations = generateRecommendations(partial);

  return { ...partial, recommendations };
}
