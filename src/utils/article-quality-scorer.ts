// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/ArticleQualityScorer
 * @description Comprehensive quality assessment engine for generated EU Parliament Monitor articles.
 *
 * Analyses HTML article content across four dimensions:
 * - **Analysis depth** — political context, coalition dynamics, historical evidence, scenarios
 * - **Stakeholder coverage** — breadth of perspectives from MEPs, Commission, civil society, etc.
 * - **Visualization quality** — SWOT, dashboard metrics, mindmap branches, deep-analysis evidence
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
 * Covers: TA-10-2026-0123, PE-123, PE-123.456, A9-0123, B9-0123, C9-0123, P9_TA(2024)0001
 * Excludes broad matches like EU-27 or EEA-32.
 */
const EP_DOC_PATTERNS: ReadonlyArray<RegExp> = [
  /\bTA-\d+-\d+-\d+\b/gu, // TA-10-2026-0001 (TA prefix + three numeric segments)
  /\bPE-\d+\.\d+\b/gu, // PE-123.456 (dotted PE reference)
  /\bPE-\d+(?!\.\d)\b/gu, // PE-123 (simple PE reference, excludes dotted)
  /\b[A-C]\d-\d+\b/gu, // A9-0123, B9-0002, C9-0003 (variable-length digits)
  /\bP\d_TA\(\d{4}\)\d+\b/gu, // P9_TA(2024)0001
];

/** CSS class selector for deep-analysis sections (extracted to avoid duplication) */
const CLASS_DEEP_ANALYSIS = 'class="deep-analysis"';

/** Pattern to extract a leading ISO date (YYYY-MM-DD) from an article identifier */
const ARTICLE_DATE_PATTERN = /^(\d{4}-\d{2}-\d{2})/u;

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
    if (decimal !== undefined) {
      const cp = parseInt(decimal, 10);
      try {
        return String.fromCodePoint(cp);
      } catch {
        return match;
      }
    }
    if (hex !== undefined) {
      const cp = parseInt(hex, 16);
      try {
        return String.fromCodePoint(cp);
      } catch {
        return match;
      }
    }
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

/** Pattern matching all class attribute values in HTML */
const CLASS_ATTR_PATTERN = /class="([^"]*)"/gu;

/**
 * Check whether any `class="…"` attribute in the HTML contains the given token
 * as an exact CSS class (whitespace-delimited). Unlike `\b` word-boundary matching,
 * this prevents false positives from hyphenated classes (e.g. `dashboard-grid` does
 * not match `dashboard`).
 *
 * @param html - HTML string to scan
 * @param token - Exact CSS class name to detect
 * @returns true if an exact class token match is found
 */
function hasExactClassToken(html: string, token: string): boolean {
  CLASS_ATTR_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CLASS_ATTR_PATTERN.exec(html)) !== null) {
    const value = match[1] ?? '';
    const classes = value.split(/\s+/);
    if (classes.includes(token)) return true;
  }
  return false;
}

/**
 * Check whether at least one keyword from a list is present in a text string.
 *
 * Uses a leading word-boundary anchor (`\b`) so that keywords like "national"
 * do not false-match inside longer words like "international", while still
 * matching inflected forms such as "citizens" for the keyword "citizen".
 *
 * @param text - Text to search (comparison is case-insensitive)
 * @param keywords - Keywords to look for
 * @returns true if any keyword is found
 */
function containsAnyKeyword(text: string, keywords: ReadonlyArray<string>): boolean {
  return keywords.some((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
    const pattern = new RegExp(`\\b${escaped}`, 'iu');
    return pattern.test(text);
  });
}

/**
 * Remove all `<script>…</script>` blocks from an HTML string, replacing each
 * with a single space.
 *
 * Uses iterative index-based scanning instead of a single-pass regex so that
 * CodeQL does not flag the pattern as an insecure HTML tag filter
 * (`js/bad-tag-filter`).
 *
 * @param html - HTML string to strip
 * @returns The HTML with script blocks replaced by spaces
 */
function stripScriptBlocks(html: string): string {
  const OPEN = '<script';
  const CLOSE = '</script';
  let result = '';
  let pos = 0;
  const lower = html.toLowerCase();

  while (pos < html.length) {
    const openIdx = lower.indexOf(OPEN, pos);
    if (openIdx < 0) {
      result += html.slice(pos);
      break;
    }
    // Copy everything before the opening <script
    result += html.slice(pos, openIdx);
    // Find the end of the opening tag
    const openEnd = html.indexOf('>', openIdx);
    if (openEnd < 0) {
      // Malformed — no closing `>`, keep rest as-is
      result += html.slice(openIdx);
      break;
    }
    // Find the closing </script...> tag
    const closeIdx = lower.indexOf(CLOSE, openEnd + 1);
    if (closeIdx < 0) {
      // No closing tag — drop the rest
      result += ' ';
      break;
    }
    const closeEnd = html.indexOf('>', closeIdx);
    if (closeEnd < 0) {
      result += ' ';
      break;
    }
    result += ' ';
    pos = closeEnd + 1;
  }
  return result;
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
  const stripped = stripScriptBlocks(source)
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
  return decodeHtmlEntities(stripped);
}

/**
 * Tokens that identify a `<section>` element as analysis content.
 * Non-analysis sections (e.g. `article-sources`, `sitemap-section`) are excluded.
 */
const ANALYSIS_SECTION_TOKENS: ReadonlyArray<string> = [
  'analysis',
  'analysis-section',
  'deep-analysis',
  'swot-analysis',
  'dashboard',
  'mindmap-section',
  'sankey-section',
];

/** Pattern to extract the class attribute value from a single HTML tag */
const CLASS_VALUE_PATTERN = /class="([^"]*)"/iu;

/**
 * Count structural analysis sections in HTML.
 * Only counts `<section>` elements whose class attribute contains a known
 * analysis-related token, preventing inflation from non-analysis sections
 * like sources or footer wrappers.
 *
 * @param html - Raw HTML string
 * @returns Number of analysis-content sections found
 */
function countAnalysisSections(html: string): number {
  const SECTION_TAG = /<section\b[^>]*>/giu;
  let count = 0;
  let m: RegExpExecArray | null;
  while ((m = SECTION_TAG.exec(html)) !== null) {
    const tag = m[0];
    const cv = CLASS_VALUE_PATTERN.exec(tag);
    if (cv?.[1]) {
      const tokens = cv[1].split(/\s+/).filter(Boolean);
      if (tokens.some((t) => ANALYSIS_SECTION_TOKENS.includes(t))) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Count `<li>` elements inside containers matching the given class attribute.
 * Used to count evidence items in `<ul class="perspective-evidence"><li>…</li></ul>`
 * structures produced by the deep-analysis and stakeholder perspective generators.
 *
 * Locates each container by its class attribute, determines the enclosing element
 * tag name, finds the end of the opening tag (`>`), and extracts content up to
 * the balanced closing tag for that specific element — ensuring correct scoping
 * even when the container is a `<ul>` (which `findBalancedContent` does not track).
 *
 * @param html - HTML string to search
 * @param containerClass - Class attribute string to match (e.g. `class="perspective-evidence"`)
 * @returns Number of `<li>` children found across all matching containers
 */
function countListItemsInClass(html: string, containerClass: string): number {
  let total = 0;
  let idx = html.indexOf(containerClass);
  while (idx !== -1) {
    const content = extractContainerContent(html, idx, containerClass);
    if (content) {
      total += countOccurrences(content, '<li>');
    }
    idx = html.indexOf(containerClass, idx + 1);
  }
  return total;
}

/**
 * Extract the inner content of the HTML element whose opening tag contains the
 * attribute match at the given position. Identifies the tag name by searching
 * backwards for `<tagname`, then finds the end of the opening tag (`>`), and
 * uses balanced tag matching on that specific element to locate the matching
 * closing tag.
 *
 * @param html - Full HTML string
 * @param attrIdx - Index where the matched attribute starts within `html`
 * @param attr - The attribute string that was matched
 * @returns Inner HTML of the container, or empty string if extraction fails
 */
function extractContainerContent(html: string, attrIdx: number, attr: string): string {
  // Search backwards from the attribute to find the opening `<`
  let openBracket = attrIdx - 1;
  while (openBracket >= 0 && html[openBracket] !== '<') openBracket--;
  if (openBracket < 0) return '';

  // Extract the tag name (e.g. "ul", "div", "section")
  const tagSlice = html.slice(openBracket + 1, attrIdx).trim();
  const tagNameMatch = /^([a-z][a-z0-9]*)/iu.exec(tagSlice);
  if (!tagNameMatch) return '';
  const tagName = tagNameMatch[1];

  // Find the end of the opening tag
  const closeAngle = html.indexOf('>', attrIdx + attr.length);
  if (closeAngle < 0) return '';
  const contentStart = closeAngle + 1;

  // Balanced matching for this specific tag name
  // tagName is validated by /^([a-z][a-z0-9]*)/ — alphanumeric only, safe for RegExp
  // eslint-disable-next-line security/detect-non-literal-regexp
  const balancePattern = new RegExp(`</?${tagName}[\\s>/]`, 'giu');
  balancePattern.lastIndex = contentStart;
  let depth = 1;
  let m = balancePattern.exec(html);
  while (m) {
    if (m[0].startsWith('</')) {
      depth--;
      if (depth === 0) return html.slice(contentStart, m.index);
    } else {
      depth++;
    }
    m = balancePattern.exec(html);
  }
  return '';
}

/**
 * Count evidence and document references in HTML.
 * Detects evidence markers from the actual generator output:
 * - `<ul class="perspective-evidence"><li>…</li></ul>` — deep-analysis evidence items
 * - `class="swot-ref-evidence"` — SWOT cross-reference evidence markers
 * - `class="evidence"` — generic evidence markers (legacy / tests)
 * - `data-reference` attributes
 * - EP document reference codes (TA-, PE-, A9-, P9_TA patterns)
 *
 * Strips `<script>` blocks once up front so that JSON-LD metadata and other
 * inline scripts do not inflate any evidence counts.
 *
 * @param html - Raw HTML string
 * @returns Number of evidence references found
 */
function countEvidenceRefs(html: string): number {
  // Strip script blocks (e.g. JSON-LD) once for all evidence counting
  // to avoid inflated counts from matching substrings inside scripts.
  const htmlNoScripts = stripScriptBlocks(html);
  // Count <li> items inside perspective-evidence containers (deep-analysis generator)
  const perspectiveEvidenceItems = countListItemsInClass(
    htmlNoScripts,
    'class="perspective-evidence"'
  );
  // Count SWOT cross-reference evidence markers (swot-content generator)
  const swotRefEvidence = countOccurrences(htmlNoScripts, 'class="swot-ref-evidence"');
  // Legacy / generic evidence markers
  const evidenceClasses = countOccurrences(htmlNoScripts, 'class="evidence"');
  const dataRefs = countOccurrences(htmlNoScripts, 'data-reference');
  // EP document reference codes
  const matched = new Set<string>();
  for (const pattern of EP_DOC_PATTERNS) {
    pattern.lastIndex = 0;
    const hits = htmlNoScripts.match(pattern);
    if (hits) {
      for (const hit of hits) {
        matched.add(hit);
      }
    }
  }
  const epRefs = matched.size;
  return perspectiveEvidenceItems + swotRefEvidence + evidenceClasses + dataRefs + epRefs;
}

/**
 * Count evidence markers inside deep-analysis sections only, preventing
 * inflation from evidence markers elsewhere in the article.
 *
 * Iterates ALL matching deep-analysis sections (not just the first),
 * so articles with multiple deep-analysis blocks are fully counted.
 * Deduplicates matches across class and id patterns so that a container
 * having both `class="deep-analysis"` and `id="…deep…"` is only counted once.
 *
 * Detects:
 * - `<li>` items inside `<ul class="perspective-evidence">` — real generator output
 * - `class="swot-ref-evidence"` — SWOT cross-reference evidence
 * - `class="evidence"` — generic/legacy evidence markers
 * - `data-reference` attributes
 *
 * @param html - Raw HTML string
 * @returns Evidence count restricted to deep-analysis section(s)
 */
function countDeepAnalysisSectionEvidence(html: string): number {
  const openPatterns = [/class="deep-analysis"[^>]*>/giu, /id="[^"]*deep[^"]*"[^>]*>/giu];
  let total = 0;
  // Track matched opening-tag indices to avoid counting the same section twice
  // when it matches both the class and id patterns.
  const countedIndices = new Set<number>();
  for (const pattern of openPatterns) {
    pattern.lastIndex = 0;
    let openMatch = pattern.exec(html);
    while (openMatch) {
      if (!countedIndices.has(openMatch.index)) {
        countedIndices.add(openMatch.index);
        const startIdx = openMatch.index + openMatch[0].length;
        const sectionContent = findBalancedContent(html, startIdx);
        if (sectionContent) {
          total +=
            countListItemsInClass(sectionContent, 'class="perspective-evidence"') +
            countOccurrences(sectionContent, 'class="swot-ref-evidence"') +
            countOccurrences(sectionContent, 'class="evidence"') +
            countOccurrences(sectionContent, 'data-reference');
        }
      }
      openMatch = pattern.exec(html);
    }
  }
  return total;
}

/**
 * Compute the mindmap branch count by counting `class="mindmap-branch"` elements.
 * Falls back to counting `<li>` elements (individual nodes/branches) within the
 * mindmap section when no `mindmap-branch` classes are found, ensuring the metric
 * consistently represents branch count rather than nesting depth.
 *
 * @param html - Raw HTML string
 * @returns Number of mindmap branches detected
 */
function computeMindmapBranches(html: string): number {
  // Real mindmap HTML uses class="mindmap-branch" elements
  const branchCount = countOccurrences(html, 'class="mindmap-branch"');
  if (branchCount > 0) return branchCount;

  const sectionContent = extractMindmapSection(html);
  if (!sectionContent) return 0;

  // Count <li> elements as branch nodes — each <li> represents an individual
  // node in the mindmap tree, giving a branch count rather than nesting depth.
  return countOccurrences(sectionContent, '<li>');
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
 * Accepts either raw HTML or pre-extracted plain text. When called from
 * {@link scoreArticleQuality} the text is already extracted, avoiding
 * redundant HTML stripping.
 *
 * @param htmlOrText - Raw HTML string or pre-extracted plain text
 * @param preExtracted - If true, treat `htmlOrText` as already-extracted plain text
 * @returns Analysis depth score with per-dimension flags and composite score
 */
export function assessAnalysisDepth(htmlOrText: string, preExtracted = false): AnalysisDepthScore {
  const text = preExtracted ? htmlOrText : extractPlainText(htmlOrText);

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
 * Accepts either raw HTML or pre-extracted plain text. When called from
 * {@link scoreArticleQuality} the text is already extracted, avoiding
 * redundant HTML stripping.
 *
 * @param htmlOrText - Raw HTML string or pre-extracted plain text
 * @param preExtracted - If true, treat `htmlOrText` as already-extracted plain text
 * @returns Stakeholder coverage assessment with present/missing lists and scores
 */
export function assessStakeholderCoverage(
  htmlOrText: string,
  preExtracted = false
): StakeholderCoverage {
  const text = preExtracted ? htmlOrText : extractPlainText(htmlOrText);

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
  const genericPenalty = hasGenericPhrases(text) ? 20 : 0;
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
  // SWOT: exact class-token match supports multi-class attributes
  // (e.g. class="swot-analysis swot-multidimensional")
  const swotPresent =
    hasExactClassToken(html, 'swot-analysis') || html.includes('id="swot-analysis"');
  // Partial match: quadrant classes include a variant suffix (e.g. "swot-quadrant swot-strengths")
  const swotDimensions =
    countOccurrences(html, 'swot-quadrant') + countOccurrences(html, 'data-dimension');

  // Dashboard: exact class-token match prevents false positives from hyphenated
  // classes like "dashboard-grid", "dashboard-panel", "dashboard-chart"
  const dashboardPresent = hasExactClassToken(html, 'dashboard') || html.includes('id="dashboard"');
  const dashboardMetrics =
    countOccurrences(html, 'class="metric-card"') +
    countOccurrences(html, 'class="dashboard-metric"');
  // Trend indicators: metric-trend-up/-down/-stable classes, or arrow symbols
  const dashboardTrends =
    html.includes('class="metric-trend-') || html.includes('↑') || html.includes('↓');

  // Mindmap: exact class-token match supports multi-class attributes
  const mindmapPresent =
    hasExactClassToken(html, 'mindmap-section') ||
    hasExactClassToken(html, 'mindmap-container') ||
    html.includes('id="mindmap"');
  const mindmapBranches = mindmapPresent ? computeMindmapBranches(html) : 0;

  const deepAnalysisPresent =
    html.includes(CLASS_DEEP_ANALYSIS) || /id="[^"]*deep[^"]*"/iu.test(html);
  // Restrict evidence counting to deep-analysis section(s) only to avoid
  // inflating the metric with evidence markers elsewhere in the article.
  const deepAnalysisEvidence = deepAnalysisPresent ? countDeepAnalysisSectionEvidence(html) : 0;

  const score = computeVisualizationScore({
    swotPresent,
    swotDimensions,
    dashboardPresent,
    dashboardMetrics,
    dashboardTrends,
    mindmapPresent,
    mindmapBranches,
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
    mindmapBranches,
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
    score += Math.min(15, v.mindmapBranches * 5);
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

// ─── Non-English language adjustments ─────────────────────────────────────────

/**
 * Baseline score assigned to keyword-based analysis dimensions for non-English
 * articles, so that translated content is not systematically penalised by the
 * English-only keyword lists.
 */
const NON_ENGLISH_BASELINE = 50;

/**
 * Adjust analysis depth for non-English articles.
 *
 * English keyword lists do not apply to translated text, so we raise the
 * composite score to at least a baseline when the raw keyword scan scored low.
 * This prevents non-English articles from being systematically under-scored.
 *
 * @param depth - Raw analysis depth from keyword scanning
 * @returns Adjusted analysis depth with a baseline floor
 */
function adjustNonEnglishAnalysisDepth(depth: AnalysisDepthScore): AnalysisDepthScore {
  return {
    ...depth,
    score: Math.max(depth.score, NON_ENGLISH_BASELINE),
  };
}

/**
 * Adjust stakeholder coverage for non-English articles.
 *
 * English stakeholder keyword lists may not match translated terms, so we apply
 * a baseline floor to prevent systematically low balance and reasoning scores.
 *
 * @param coverage - Raw stakeholder coverage from keyword scanning
 * @returns Adjusted coverage with baseline floors on balance and reasoning scores
 */
function adjustNonEnglishStakeholderCoverage(coverage: StakeholderCoverage): StakeholderCoverage {
  return {
    ...coverage,
    balanceScore: Math.max(coverage.balanceScore, NON_ENGLISH_BASELINE),
    reasoningQuality: Math.max(coverage.reasoningQuality, NON_ENGLISH_BASELINE),
  };
}

// ─── Recommendation generation ────────────────────────────────────────────────

/**
 * Generate actionable improvement recommendations based on a partial quality report.
 *
 * For non-English articles, keyword-based analysis-depth and stakeholder recommendations
 * are omitted because the underlying boolean flags derive from English-only keyword
 * lists, making them unreliable for translated content.
 *
 * @param report - Quality report without the recommendations field
 * @returns Array of recommendation strings (may be empty for high-quality articles)
 */
export function generateRecommendations(
  report: Omit<ArticleQualityReport, 'recommendations'>
): string[] {
  const recs: string[] = [];
  const isEnglish = report.lang === 'en';

  addWordCountRecommendations(report, recs);
  // Only emit keyword-dependent recommendations for English articles; non-English
  // articles have baseline-adjusted scores and keyword detection is not reliable.
  if (isEnglish) {
    addAnalysisDepthRecommendations(report.analysisDepth, recs);
    addStakeholderRecommendations(report.stakeholderCoverage, recs);
  }
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
  } else if (viz.mindmapBranches < 3) {
    recs.push(`Add more mindmap branches to reach 3 (currently ${viz.mindmapBranches})`);
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
  // Extract plain text once to avoid redundant HTML stripping in sub-assessors
  const plainText = extractPlainText(html);

  const wordCount = plainText ? plainText.split(' ').length : 0;
  const analysisSections = countAnalysisSections(html);
  const evidenceReferences = countEvidenceRefs(html);

  // For non-English articles, keyword-based analysis-depth and stakeholder scoring
  // uses English keywords which may not appear in translated text. Weight structural
  // signals (visualization, word count, evidence) more heavily by treating keyword
  // dimensions as partially present when the language is not English.
  const isEnglish = lang === 'en';

  const analysisDepth = isEnglish
    ? assessAnalysisDepth(plainText, true)
    : adjustNonEnglishAnalysisDepth(assessAnalysisDepth(plainText, true));
  const stakeholderCoverage = isEnglish
    ? assessStakeholderCoverage(plainText, true)
    : adjustNonEnglishStakeholderCoverage(assessStakeholderCoverage(plainText, true));
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

  // Derive the article's date from its ID when possible (slug format: YYYY-MM-DD-…),
  // falling back to the current execution date only if the ID does not contain a date prefix.
  const dateMatch = ARTICLE_DATE_PATTERN.exec(articleId);
  const date = dateMatch?.[1] ?? new Date().toISOString().split('T')[0] ?? '';

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
