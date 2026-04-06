// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Pipeline/AnalysisHelpers
 * @description Shared utility functions for the analysis pipeline.
 *
 * Provides sanitization, data coercion, markdown formatting, and file I/O
 * helpers consumed by the category-specific analysis builder modules
 * (`analysis-classification.ts`, `analysis-threats.ts`, `analysis-risk.ts`,
 * `analysis-existing.ts`) and the orchestrator (`analysis-stage.ts`).
 */

import type { ConfidenceLevel } from '../../types/index.js';
import type { ClassificationInput } from '../../types/political-classification.js';
import type { ThreatAssessmentInput } from '../../types/political-threats.js';
import { atomicWrite } from '../../utils/file-utils.js';

import type { AnalysisMethod } from './analysis-stage.js';

// ─── Markdown constants ───────────────────────────────────────────────────────

/** Empty table row placeholder for 6-column tables */
export const EMPTY_TABLE_ROW_6 = '| — | — | — | — | — | — |';

// ─── Sanitization helpers ─────────────────────────────────────────────────────

/**
 * Sanitize untrusted text for safe use in a Markdown table cell.
 *
 * Escapes pipe characters, backslashes, and HTML entities, then normalizes
 * whitespace to prevent table layout corruption from external MCP data.
 *
 * @param input - Untrusted cell text
 * @returns Sanitized text safe for Markdown table cells
 */
export function sanitizeCell(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

/**
 * Sanitize a document identifier for safe use as a filesystem filename.
 *
 * Replaces characters unsafe for filenames with hyphens, collapses runs of
 * hyphens, trims, and lowercases.  When the result exceeds 80 characters,
 * a deterministic hash suffix is appended to avoid collisions between IDs
 * that share the same first 80 characters.  Falls back to a deterministic
 * hash of the input when the sanitized result is empty.
 *
 * @param id - Raw document identifier (e.g. "TA-10-2026-0094", procedure reference)
 * @returns Filesystem-safe identifier string (max 80 chars)
 */
export function sanitizeDocumentId(id: string): string {
  const full = id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-/, '')
    .replace(/-$/, '');
  if (!full) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    }
    return `anon-${Math.abs(hash).toString(36).slice(0, 12)}`;
  }
  if (full.length > 80) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    }
    return `${full.slice(0, 72)}-${Math.abs(hash).toString(36).slice(0, 7)}`;
  }
  return full;
}

// ─── Data coercion helpers ────────────────────────────────────────────────────

/** All feed array keys that contain individually-analysable documents */
export const DOCUMENT_FEED_KEYS = [
  'adoptedTexts',
  'procedures',
  'documents',
  'plenaryDocuments',
  'committeeDocuments',
  'plenarySessionDocuments',
  'externalDocuments',
  'events',
] as const;

/**
 * Extract a human-readable identifier from a raw feed item.
 *
 * Tries common EP data shapes (`docId`, `procedureId`, `id`, `eventId`,
 * `title`) and falls back to a deterministic hash of the item's JSON
 * representation for truly anonymous items, ensuring reproducibility.
 *
 * @param item - Raw feed item object
 * @returns Best-effort identifier string
 */
export function extractDocumentId(item: Record<string, unknown>): string {
  for (const key of ['docId', 'procedureId', 'id', 'eventId']) {
    const val = item[key]; // eslint-disable-line security/detect-object-injection -- keys are string literals
    if (typeof val === 'string' && val.length > 0) return val;
  }
  const title = item['title'];
  if (typeof title === 'string' && title.length > 0) {
    const repr = JSON.stringify(item);
    let hash = 0;
    for (let i = 0; i < repr.length; i++) {
      hash = ((hash << 5) - hash + repr.charCodeAt(i)) | 0;
    }
    return `${title.slice(0, 50)}-${Math.abs(hash).toString(36).slice(0, 8)}`;
  }
  const repr = JSON.stringify(item);
  let hash = 0;
  for (let i = 0; i < repr.length; i++) {
    hash = ((hash << 5) - hash + repr.charCodeAt(i)) | 0;
  }
  return `anonymous-${Math.abs(hash).toString(36)}`;
}

/**
 * Extract a human-readable title from a raw feed item.
 *
 * @param item - Raw feed item object
 * @returns Title string or fallback
 */
export function extractDocumentTitle(item: Record<string, unknown>): string {
  const title = item['title'];
  if (typeof title === 'string' && title.length > 0) return title;
  const label = item['label'] ?? item['name'] ?? item['description'];
  if (typeof label === 'string' && label.length > 0) return label;
  return 'Untitled document';
}

/**
 * Safely extract an array from fetchedData by key.
 * @param data - Raw fetched data record
 * @param key - Key to extract
 * @returns Array or empty array if missing/invalid
 */
export function safeArr(data: Record<string, unknown>, key: string): readonly unknown[] {
  const val = data[key]; // eslint-disable-line security/detect-object-injection -- key is a literal string from caller
  return Array.isArray(val) ? val : [];
}

/**
 * Cast fetchedData to ClassificationInput for the classification functions.
 * @param data - Raw fetched data record
 * @returns ClassificationInput-compatible object
 */
export function toClassificationInput(data: Record<string, unknown>): ClassificationInput {
  return data as ClassificationInput;
}

/**
 * Cast fetchedData to ThreatAssessmentInput for the threat assessment functions.
 * @param data - Raw fetched data record
 * @returns ThreatAssessmentInput-compatible object
 */
export function toThreatInput(data: Record<string, unknown>): ThreatAssessmentInput {
  return {
    votingRecords: safeArr(data, 'votingRecords'),
    coalitionData: safeArr(data, 'coalitions'),
    mepInfluence: safeArr(data, 'mepUpdates'),
    procedures: safeArr(data, 'procedures'),
    anomalies: safeArr(data, 'anomalies'),
    questions: safeArr(data, 'questions'),
  };
}

// ─── Markdown helpers ─────────────────────────────────────────────────────────

/**
 * Build a YAML-frontmatter header block for analysis markdown files.
 *
 * @param method - Analysis method identifier
 * @param date - ISO date of the analysis
 * @param confidence - Confidence level for this result
 * @returns Markdown frontmatter string
 */
export function buildMarkdownHeader(
  method: AnalysisMethod | string,
  date: string,
  confidence: ConfidenceLevel
): string {
  return `---
method: ${method}
date: ${date}
confidence: ${confidence}
generated: ${new Date().toISOString()}
---

`;
}

/**
 * Write a text file to disk.
 *
 * Used for both analysis markdown files and the analysis `manifest.json`.
 *
 * @param filePath - Absolute file path
 * @param content - File content as a UTF-8 string
 */
export function writeTextFile(filePath: string, content: string): void {
  atomicWrite(filePath, content);
}

// ─── Mermaid chart helpers ────────────────────────────────────────────────────

/**
 * Map an impact level to a numeric value for Mermaid pie charts.
 *
 * @param level - Impact level string (e.g. 'none', 'low', 'moderate', 'high', 'critical')
 * @returns Numeric value for chart rendering
 */
export function impactToNum(level: string): number {
  const map: Record<string, number> = {
    none: 5,
    low: 20,
    moderate: 45,
    high: 70,
    critical: 90,
  };
  return map[level.toLowerCase()] ?? 30;
}

/**
 * Map an impact level string to a coloured indicator emoji.
 *
 * @param level - Impact level string
 * @returns Emoji indicator
 */
export function impactIndicator(level: string): string {
  const lower = level.toLowerCase();
  return lower === 'high' || lower === 'critical' ? '🔴' : lower === 'moderate' ? '🟡' : '🟢';
}

/**
 * Return the name of the highest-impact dimension from an impact matrix.
 *
 * @param matrix - Impact matrix with five dimension levels
 * @param matrix.legislativeImpact - Legislative impact level
 * @param matrix.coalitionImpact - Coalition impact level
 * @param matrix.publicOpinionImpact - Public opinion impact level
 * @param matrix.institutionalImpact - Institutional impact level
 * @param matrix.economicImpact - Economic impact level
 * @returns Name of the dimension with the highest impact score
 */
export function highestImpactDimension(matrix: {
  legislativeImpact: string;
  coalitionImpact: string;
  publicOpinionImpact: string;
  institutionalImpact: string;
  economicImpact: string;
}): string {
  return (
    [
      { name: 'Legislative', level: matrix.legislativeImpact },
      { name: 'Coalition', level: matrix.coalitionImpact },
      { name: 'Public Opinion', level: matrix.publicOpinionImpact },
      { name: 'Institutional', level: matrix.institutionalImpact },
      { name: 'Economic', level: matrix.economicImpact },
    ].sort((a, b) => impactToNum(b.level) - impactToNum(a.level))[0]?.name ?? 'N/A'
  );
}

// ─── Substantive data check ───────────────────────────────────────────────────

/** Keys in fetchedData that count as substantive EP data */
const SUBSTANTIVE_DATA_KEYS = [
  'events',
  'procedures',
  'adoptedTexts',
  'documents',
  'votingRecords',
  'coalitions',
  'questions',
  'mepUpdates',
  'plenaryDocuments',
  'committeeDocuments',
  'plenarySessionDocuments',
  'externalDocuments',
  'declarations',
  'corporateBodies',
] as const;

/**
 * Check whether the fetched data contains any substantive EP data.
 *
 * Returns `true` when at least one data category has non-empty arrays.
 * Used to gate analysis execution — analysis should not run on empty data.
 *
 * @param data - Raw fetched data record
 * @returns true if any substantive data is present
 */
export function hasSubstantiveData(data: Record<string, unknown>): boolean {
  for (const key of SUBSTANTIVE_DATA_KEYS) {
    const arr = safeArr(data, key);
    if (arr.length > 0) return true;
  }
  return false;
}

/** Type for analysis method markdown builder functions */
export type MarkdownBuilder = (fetchedData: Record<string, unknown>, date: string) => string;
