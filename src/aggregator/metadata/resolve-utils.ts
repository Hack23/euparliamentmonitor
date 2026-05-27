// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/ResolveUtils
 * @description Low-level utility functions extracted from resolve-helpers
 * to keep each leaf module under the 600-line drift guard.
 */

import { extractFirstSentence, shouldSkipDescriptionLine, truncateTitle } from './text-utils.js';
import { findTitleRejectionReason } from './title-rejection.js';

const LEAKY_RUNID_RE = /\b[a-z][a-z-]*-run-?\d+-\d{8,}\b/iu;
/** Matches workflow run-number patterns like "Run 271" or "— Run 42" in titles. */
const RUN_NUMBER_RE = /(?:^|[\s—–\-(,;:|/])Run\s+\d+/u;
/** Word-level strip pattern for "Run N" tokens (with optional hyphenated suffix). */
const RUN_TOKEN_STRIP_RE = /\bRun\s+\d[\d-]*/giu;
/** Internal run-id slug strip (e.g. `breaking-run180-1779846371`). */
const RUNID_TOKEN_STRIP_RE = /\b[a-z][a-z-]*-run-?\d+-\d{8,}[\s,;:|/]*/giu;
/** "analysis run" phrase strip. */
const ANALYSIS_RUN_STRIP_RE = /\banalysis\s+run\s*\d*[\s,;:|/]*/giu;
/** All-caps document-reference prefix (e.g. "KJ-01: ", "SITUATION: "). */
const DOC_REF_PREFIX_RE = /^[A-Z][A-Z0-9 -]{1,40}:\s+/u;

/** Minimum title length below which a title is unusable. */
const SEO_TITLE_FLOOR = 20;

export function hasLeakySeoToken(value: string): boolean {
  if (!value) return false;
  return (
    value.toLowerCase().includes('analysis run') ||
    LEAKY_RUNID_RE.test(value) ||
    RUN_NUMBER_RE.test(value)
  );
}

/**
 * Word-level strip of leaky workflow tokens from a single line of text.
 *
 * @param value - Raw text that may contain workflow run tokens
 * @returns Cleaned text with all leaky run tokens removed
 */
export function stripLeakyRunTokens(value: string): string {
  if (!value) return '';
  let cleaned = value
    .replace(RUNID_TOKEN_STRIP_RE, '')
    .replace(RUN_TOKEN_STRIP_RE, '')
    .replace(ANALYSIS_RUN_STRIP_RE, '');
  cleaned = cleaned
    .replace(/\(\s*[,;:|/\-—–]+\s*/gu, '(')
    .replace(/\s*[,;:|/\-—–]+\s*\)/gu, ')')
    .replace(/\(\s*\)/gu, '')
    .replace(/\s*[,;:|/]\s*[,;:|/]+\s*/gu, ', ')
    .replace(/^[\s,;:|/\-—–]+/u, '')
    .replace(/[\s,;:|/\-—–]+$/u, '')
    .replace(/\s{2,}/gu, ' ')
    .trim();
  return cleaned;
}

/**
 * Sanitize a single-line title candidate by word-level stripping any
 * leaky workflow tokens.
 *
 * Salvage is only attempted when the contamination is a clean
 * prefix/suffix tag (e.g. `Run 180, 17 April 2026` → `17 April 2026`).
 * When the headline embeds the phrase `analysis run` the contamination
 * is structural (an editorial-paragraph leak embedded inside parens or
 * other punctuation) — token-level stripping would leave dangling
 * fragments like `Analysis ) | …`. In that case we refuse to salvage and
 * return the empty string so the caller falls through to the
 * summary-derived title.
 *
 * @param value - Raw title candidate that may contain run tokens
 * @returns Sanitized title with leaky tokens removed, or empty string
 *   when the contamination is too structural to safely salvage
 */
export function sanitizeTitleCandidate(value: string): string {
  if (!value) return '';
  if (/\banalysis\s+run\b/iu.test(value)) return '';
  const stripped = stripLeadingFragmentSeparator(stripLeakyRunTokens(value));
  // Strip all-caps document-reference prefixes (KJ-01:, SITUATION:, etc.)
  return stripped.replace(DOC_REF_PREFIX_RE, '');
}

/**
 * Extract a run number from a runId like `committee-reports-run47`,
 * `breaking-run188`, `committee-reports-run-47`, or a bare numeric
 * string (`"47"`). Returns the run number as a string, or `null` when
 * the runId does not carry a discriminator.
 *
 * @param runId - Raw run identifier token
 * @returns Extracted numeric portion, or `null` when absent
 */
export function extractRunNumber(runId: string): string | null {
  if (!runId) return null;
  if (/^\d+$/u.test(runId)) return runId;
  const segments = runId.split('-');
  for (let i = 0; i < segments.length; i += 1) {
    const seg = segments[i] ?? '';
    const m = /^run(\d+)$/u.exec(seg);
    if (m) return m[1] ?? null;
    if (seg === 'run') {
      const next = segments[i + 1];
      if (next && /^\d+$/u.test(next)) return next;
    }
  }
  return null;
}

function stripLeadingFragmentSeparator(value: string): string {
  return value.replace(/^[:;—–-]\s+/u, '').trim();
}

function stripLeakySentences(value: string): string {
  if (!value) return '';
  const parts = value
    .split(/(?<=[.!?])\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);
  const clean = parts.filter((part) => !hasLeakySeoToken(part));
  return (clean.length > 0 ? clean : parts).join(' ').trim();
}

export function sanitizeDescriptionCandidate(value: string): string {
  const cleaned = stripLeadingFragmentSeparator(stripLeakySentences(value));
  return cleaned && !shouldSkipDescriptionLine(cleaned) ? cleaned : '';
}

export function isUsableResolvedTitle(
  value: string,
  options?: { readonly allowFullSentence?: boolean }
): boolean {
  const cleaned = stripLeadingFragmentSeparator(value);
  if (cleaned.length < SEO_TITLE_FLOOR) return false;
  if (hasLeakySeoToken(cleaned)) return false;
  const reason = findTitleRejectionReason(cleaned);
  if (reason && !(options?.allowFullSentence && reason === 'sentence-fragment')) {
    return false;
  }
  return true;
}

export function deriveHeadlineFromSummary(summary: string): string {
  const cleaned = sanitizeDescriptionCandidate(summary);
  if (!cleaned) return '';
  return truncateTitle(extractFirstSentence(cleaned) || cleaned);
}

/**
 * No-op: run numbers must never appear in user-facing article titles.
 * Preserved for callsite backward compatibility.
 *
 * @param title - Base title (returned unchanged)
 * @param _runId - Raw run identifier token (ignored)
 * @returns The unchanged input title
 */
export function withRunQualifier(title: string, _runId: string): string {
  return title;
}

/**
 * Case-insensitive containment check after whitespace normalization.
 *
 * @param haystack - Text to search within
 * @param needle - Substring to look for
 * @returns `true` when `needle` is found within `haystack`
 */
export function containsNormalized(haystack: string, needle: string): boolean {
  const cleanHaystack = haystack.toLowerCase().replace(/\s+/g, ' ');
  const cleanNeedle = needle.toLowerCase().replace(/\s+/g, ' ');
  return cleanNeedle.length > 0 && cleanHaystack.includes(cleanNeedle);
}

/**
 * Return the first non-empty, trimmed entry from a candidate list, or
 * the empty string when every entry is blank.
 *
 * @param candidates - Ordered list of candidate strings
 * @returns First non-blank candidate, or empty string
 */
export function pickFirstNonEmpty(candidates: readonly string[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) return c.trim();
  }
  return '';
}
