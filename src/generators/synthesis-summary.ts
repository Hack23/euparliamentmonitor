// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/SynthesisSummary
 * @description Aggregation engine that reads per-file analysis outputs and
 * produces a synthesis summary — a single intelligence briefing consumed by
 * article generators to determine narrative direction, headline selection,
 * and publication priority.
 *
 * The synthesiser:
 * 1. Scans the analysis date directory for markdown files
 * 2. Extracts YAML frontmatter (method, confidence) from each
 * 3. Counts SWOT mentions and risk-level keywords
 * 4. Ranks findings by confidence and produces editorial recommendations
 *
 * @see analysis/templates/synthesis-summary.md
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { ConfidenceLevel } from '../types/analysis.js';
import type {
  SynthesisFinding,
  AggregatedSWOT,
  RiskOverview,
  SynthesisSummary,
} from '../types/significance.js';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Case-insensitive patterns for detecting SWOT mentions in analysis text */
const SWOT_PATTERNS: Readonly<Record<keyof AggregatedSWOT, RegExp>> = {
  strengths: /\bstrength/giu,
  weaknesses: /\bweakness/giu,
  opportunities: /\bopportunit/giu,
  threats: /\bthreat/giu,
};

/** Case-insensitive patterns for detecting risk-level mentions */
const RISK_PATTERNS: Readonly<Record<keyof RiskOverview, RegExp>> = {
  critical: /\bcritical\b/giu,
  high: /\bhigh[- ]risk\b/giu,
  medium: /\bmedium[- ]risk\b/giu,
  low: /\blow[- ]risk\b/giu,
};

/** Confidence value ordering (higher = better) */
const CONFIDENCE_RANK: Readonly<Record<ConfidenceLevel, number>> = {
  high: 3,
  medium: 2,
  low: 1,
};

/** Filename of the synthesis output itself — excluded from scanning to prevent self-contamination */
const SYNTHESIS_OUTPUT_FILENAME = 'synthesis-summary.md';

/** Subdirectory containing per-document analysis — excluded to prevent I/O bloat and skewed aggregation */
const DOCUMENTS_SUBDIR = 'documents';

// ─── Markdown sanitization ────────────────────────────────────────────────────

/**
 * Sanitize untrusted text for safe use in a Markdown table cell.
 *
 * Escapes pipe characters, backslashes, and HTML entities, then normalizes
 * whitespace to prevent table layout corruption.
 *
 * @param input - Untrusted cell text
 * @returns Sanitized text safe for Markdown table cells
 */
function sanitizeMdCell(input: string): string {
  return input
    .replace(/\\/gu, '\\\\')
    .replace(/\|/gu, '\\|')
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/[\r\n]+/gu, ' ')
    .trim();
}

// ─── Frontmatter extraction ───────────────────────────────────────────────────

/** Parsed YAML frontmatter fields relevant to synthesis */
interface ParsedFrontmatter {
  readonly method: string;
  readonly confidence: ConfidenceLevel;
  readonly date: string;
}

/**
 * Parse YAML frontmatter from a markdown file's content.
 *
 * Extracts `method`, `confidence`, and `date` fields from the `---` delimited
 * YAML block at the start of the file.  Returns null when no valid frontmatter
 * is found.
 *
 * @param content - Raw markdown content
 * @returns Parsed frontmatter or null
 */
export function parseFrontmatter(content: string): ParsedFrontmatter | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/u.exec(content);
  if (!match) return null;

  const yaml = match[1] ?? '';
  const methodMatch = /^method:\s+(\S.*)$/mu.exec(yaml);
  const confidenceMatch = /^confidence:\s+(\S.*)$/mu.exec(yaml);
  const dateMatch = /^date:\s+(\S.*)$/mu.exec(yaml);

  const method = methodMatch?.[1]?.trim() ?? 'unknown';
  const rawConf = confidenceMatch?.[1]?.trim().toLowerCase() ?? 'low';
  const confidence: ConfidenceLevel = rawConf === 'high' || rawConf === 'medium' ? rawConf : 'low';
  const date = dateMatch?.[1]?.trim() ?? '';

  return { method, confidence, date };
}

// ─── Text analysis ────────────────────────────────────────────────────────────

/**
 * Count regex pattern matches in a body of text.
 *
 * @param text - Source text to scan
 * @param pattern - RegExp with global flag
 * @returns Number of matches
 */
function countMatches(text: string, pattern: RegExp): number {
  // Reset lastIndex for global regexps to avoid stale state
  pattern.lastIndex = 0;
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

/**
 * Aggregate SWOT mention counts from a body of text.
 *
 * @param text - Combined analysis text
 * @returns SWOT counts
 */
export function aggregateSWOT(text: string): AggregatedSWOT {
  return {
    strengths: countMatches(text, SWOT_PATTERNS.strengths),
    weaknesses: countMatches(text, SWOT_PATTERNS.weaknesses),
    opportunities: countMatches(text, SWOT_PATTERNS.opportunities),
    threats: countMatches(text, SWOT_PATTERNS.threats),
  };
}

/**
 * Aggregate risk-level mention counts from a body of text.
 *
 * @param text - Combined analysis text
 * @returns Risk level counts
 */
export function aggregateRisks(text: string): RiskOverview {
  return {
    critical: countMatches(text, RISK_PATTERNS.critical),
    high: countMatches(text, RISK_PATTERNS.high),
    medium: countMatches(text, RISK_PATTERNS.medium),
    low: countMatches(text, RISK_PATTERNS.low),
  };
}

/**
 * Extract the first non-empty non-frontmatter heading or paragraph as a
 * one-line summary from a markdown file.
 *
 * @param content - Raw markdown content
 * @returns One-line summary string
 */
export function extractSummaryLine(content: string): string {
  // Strip frontmatter
  const body = content.replace(/^---[\s\S]*?---\s*/u, '');

  // Try first heading (# followed by at least one space and then non-space content)
  const headingMatch = /^#+\s(\S.*)$/mu.exec(body);
  if (headingMatch?.[1]) return headingMatch[1].trim();

  // Fall back to first non-empty line
  const lines = body.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && !trimmed.startsWith('|') && !trimmed.startsWith('```')) {
      return trimmed.slice(0, 200);
    }
  }

  return 'No summary available';
}

// ─── Confidence aggregation ──────────────────────────────────────────────────

/**
 * Determine the overall confidence level from a set of findings.
 *
 * Uses majority vote: whichever confidence level appears most often wins.
 *
 * @param findings - Findings with individual confidence levels
 * @returns Aggregated confidence level
 */
export function aggregateConfidence(findings: readonly SynthesisFinding[]): ConfidenceLevel {
  if (findings.length === 0) return 'low';

  const counts: Record<ConfidenceLevel, number> = { high: 0, medium: 0, low: 0 };
  for (const f of findings) {
    counts[f.confidence]++;
  }

  if (counts.high >= counts.medium && counts.high >= counts.low) return 'high';
  if (counts.medium >= counts.low) return 'medium';
  return 'low';
}

// ─── Directory scanning ──────────────────────────────────────────────────────

/**
 * Recursively find all `.md` analysis files under a directory.
 *
 * Excludes:
 * - The synthesis output file itself (prevents self-contamination on re-runs)
 * - The `documents/` subdirectory (per-document analysis can bloat I/O and skew aggregation)
 *
 * @param dir - Absolute directory path
 * @returns Array of absolute file paths
 */
export function findMarkdownFiles(dir: string): readonly string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip the documents/ subdirectory to avoid per-document analysis bloat
      if (entry.name === DOCUMENTS_SUBDIR) continue;
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Skip the synthesis output itself to prevent self-contamination
      if (entry.name === SYNTHESIS_OUTPUT_FILENAME) continue;
      results.push(fullPath);
    }
  }

  return results;
}

// ─── Editorial recommendations ───────────────────────────────────────────────

/**
 * Generate editorial recommendations based on aggregated analysis data.
 *
 * @param findings - Ranked findings
 * @param swot - Aggregated SWOT counts
 * @param risks - Risk level distribution
 * @returns Array of recommendation strings
 */
export function generateEditorialRecommendations(
  findings: readonly SynthesisFinding[],
  swot: AggregatedSWOT,
  risks: RiskOverview
): readonly string[] {
  const recommendations: string[] = [];

  if (findings.length === 0) {
    recommendations.push('No analysis files found — verify pipeline execution.');
    return recommendations;
  }

  // High-confidence findings drive lead stories
  const highConfCount = findings.filter((f) => f.confidence === 'high').length;
  if (highConfCount > 0) {
    recommendations.push(
      `${highConfCount} high-confidence finding(s) available for lead story selection.`
    );
  }

  // Risk-driven recommendations
  if (risks.critical > 0) {
    recommendations.push(
      `${risks.critical} critical-risk mention(s) detected — consider priority coverage.`
    );
  }

  // SWOT balance indicator
  const totalSwot = swot.strengths + swot.weaknesses + swot.opportunities + swot.threats;
  if (totalSwot > 0) {
    const threatRatio = swot.threats / totalSwot;
    if (threatRatio > 0.4) {
      recommendations.push(
        'Threat-heavy SWOT balance — narrative may benefit from opportunity framing.'
      );
    }
  }

  // Volume recommendation
  if (findings.length >= 10) {
    recommendations.push(
      `${findings.length} analysis files processed — consider multi-article output.`
    );
  } else if (findings.length <= 2) {
    recommendations.push(
      'Limited analysis coverage — consider consolidating into a single digest article.'
    );
  }

  return recommendations;
}

// ─── Main synthesis ──────────────────────────────────────────────────────────

/**
 * Build a synthesis summary from all analysis files in a date directory.
 *
 * Scans the directory recursively for `.md` analysis files, parses their
 * frontmatter, extracts findings, aggregates SWOT and risk mentions, and
 * produces a {@link SynthesisSummary} object.
 *
 * @param dateOutputDir - Absolute path to the date-scoped analysis directory
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Synthesis summary object
 */
export function buildSynthesisSummary(dateOutputDir: string, date: string): SynthesisSummary {
  const files = findMarkdownFiles(dateOutputDir);

  const findings: SynthesisFinding[] = [];
  let combinedText = '';

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    combinedText += content + '\n';

    findings.push({
      method: frontmatter?.method ?? 'unknown',
      file: path.basename(filePath),
      confidence: frontmatter?.confidence ?? 'low',
      summary: extractSummaryLine(content),
    });
  }

  // Sort findings: high confidence first, then medium, then low.
  // The heading in the output says "Top Findings by Confidence" to match.
  findings.sort(
    (a, b) => (CONFIDENCE_RANK[b.confidence] ?? 0) - (CONFIDENCE_RANK[a.confidence] ?? 0)
  );

  const swot = aggregateSWOT(combinedText);
  const riskOverview = aggregateRisks(combinedText);
  const overallConfidence = aggregateConfidence(findings);
  const editorialRecommendations = generateEditorialRecommendations(findings, swot, riskOverview);

  return {
    synthesisId: `SYN-${date}-${randomUUID().slice(0, 8).toUpperCase()}`,
    date,
    documentsAnalyzed: files.length,
    overallConfidence,
    topFindings: findings.slice(0, 5),
    swot,
    riskOverview,
    editorialRecommendations,
  };
}

/**
 * Generate a markdown report from a synthesis summary.
 *
 * Follows the template format defined in `analysis/templates/synthesis-summary.md`.
 *
 * @param summary - Computed synthesis summary
 * @returns Markdown string
 */
export function formatSynthesisMarkdown(summary: SynthesisSummary): string {
  const findingsRows = summary.topFindings
    .map(
      (f, i) =>
        `| ${i + 1} | ${sanitizeMdCell(f.file)} | ${sanitizeMdCell(f.method)} | ${f.confidence} | ${sanitizeMdCell(f.summary.slice(0, 80))} |`
    )
    .join('\n');

  return `---
method: synthesis-summary
date: ${summary.date}
confidence: ${summary.overallConfidence}
generated: ${new Date().toISOString()}
---

# 🧩 Synthesis Summary — ${summary.date}

## 📋 Synthesis Context

| Field | Value |
|-------|-------|
| **Synthesis ID** | \`${summary.synthesisId}\` |
| **Analysis Date** | \`${summary.date}\` |
| **Documents Analyzed** | ${summary.documentsAnalyzed} |
| **Overall Confidence** | ${summary.overallConfidence.toUpperCase()} |

---

## 🏆 Top Findings by Confidence

| Rank | File | Method | Confidence | Summary |
|:----:|------|--------|:----------:|---------|
${findingsRows || '| — | — | — | — | — |'}

---

## 💪 Aggregated SWOT Summary

| Dimension | Count |
|-----------|:-----:|
| ✅ Strengths | ${summary.swot.strengths} |
| ⚠️ Weaknesses | ${summary.swot.weaknesses} |
| 🚀 Opportunities | ${summary.swot.opportunities} |
| 🔴 Threats | ${summary.swot.threats} |

---

## ⚖️ Risk Landscape Summary

| Level | Mentions |
|-------|:--------:|
| 🔴 Critical | ${summary.riskOverview.critical} |
| 🟠 High | ${summary.riskOverview.high} |
| 🟡 Medium | ${summary.riskOverview.medium} |
| 🟢 Low | ${summary.riskOverview.low} |

---

## 🎯 Editorial Recommendations

${summary.editorialRecommendations.map((r) => `- ${r}`).join('\n')}
`;
}
