// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Pipeline/AnalysisStage
 * @description Lightweight analysis discovery module.
 *
 * Provides types, constants, and a discovery function for consuming analysis
 * `.md` files that were produced by AI agentic workflows.  The heavy
 * analysis-generation pipeline (classification, threat, risk, existing
 * builders) has been removed in favour of the superior AI-driven analysis
 * produced by agentic workflows.
 *
 * This module retains the same exported types ({@link AnalysisContext},
 * {@link AnalysisManifest}, etc.) so that downstream consumers
 * (`news-enhanced.ts`, article strategies) continue to work unchanged.
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { ArticleCategory } from '../../types/index.js';
import type { ConfidenceLevel } from '../../types/index.js';
import {
  ensureDirectoryExists,
  resolveUniqueAnalysisDir,
  discoverAnalysisFileEntries,
} from '../../utils/file-utils.js';

// ─── Analysis method constants ────────────────────────────────────────────────

/**
 * Union type of all recognised analysis method identifiers.
 */
export type AnalysisMethod =
  | 'significance-classification'
  | 'significance-scoring'
  | 'impact-matrix'
  | 'actor-mapping'
  | 'forces-analysis'
  | 'political-threat-landscape'
  | 'actor-threat-profiling'
  | 'consequence-trees'
  | 'legislative-disruption'
  | 'risk-matrix'
  | 'political-capital-risk'
  | 'quantitative-swot'
  | 'legislative-velocity-risk'
  | 'agent-risk-workflow'
  | 'deep-analysis'
  | 'stakeholder-analysis'
  | 'coalition-analysis'
  | 'voting-patterns'
  | 'cross-session-intelligence'
  | 'document-analysis'
  | 'synthesis-summary';

/**
 * Default set of analysis methods (all methods).
 */
export const ALL_ANALYSIS_METHODS: readonly AnalysisMethod[] = [
  'significance-classification',
  'significance-scoring',
  'impact-matrix',
  'actor-mapping',
  'forces-analysis',
  'political-threat-landscape',
  'actor-threat-profiling',
  'consequence-trees',
  'legislative-disruption',
  'risk-matrix',
  'political-capital-risk',
  'quantitative-swot',
  'legislative-velocity-risk',
  'agent-risk-workflow',
  'deep-analysis',
  'stakeholder-analysis',
  'coalition-analysis',
  'voting-patterns',
  'cross-session-intelligence',
  'synthesis-summary',
] as const;

/**
 * Complete set of valid analysis method names that can appear in CLI
 * flags (e.g. `--analysis-methods`).
 */
export const VALID_ANALYSIS_METHODS: readonly AnalysisMethod[] = Array.from(
  new Set<AnalysisMethod>([...ALL_ANALYSIS_METHODS, 'document-analysis'])
);

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Configuration for the analysis discovery stage */
export interface AnalysisStageOptions {
  /** Article categories to analyse */
  readonly articleTypes: readonly ArticleCategory[];
  /** ISO date string (YYYY-MM-DD) for this analysis run */
  readonly date: string;
  /** Base output directory (e.g. 'analysis/daily') */
  readonly outputDir: string;
  /** Slug identifying the article type for this run */
  readonly articleTypeSlug?: string | undefined;
  /** Which methods to consider; defaults to {@link ALL_ANALYSIS_METHODS} */
  readonly enabledMethods?: readonly AnalysisMethod[];
  /** When true, skip already-completed methods from a prior run on the same date */
  readonly skipCompleted?: boolean;
  /** Emit verbose progress messages to stdout */
  readonly verbose?: boolean;
  /**
   * When true, abort if no substantive EP data is available.
   * Retained for backward compatibility with agentic workflow invocations.
   */
  readonly requireData?: boolean;
}

/** Status record written into the manifest for each method */
export interface AnalysisMethodStatus {
  readonly method: AnalysisMethod;
  readonly status: 'completed' | 'skipped' | 'failed';
  readonly outputFile: string;
  readonly confidence: ConfidenceLevel;
  readonly duration: number;
  readonly summary: string;
}

/** Metadata record written to manifest.json for each analysis run */
export interface AnalysisManifest {
  readonly runId: string;
  readonly date: string;
  readonly articleTypeSlug?: string | undefined;
  readonly startTime: string;
  readonly endTime: string;
  readonly articleTypes: readonly ArticleCategory[];
  readonly methods: readonly AnalysisMethodStatus[];
  readonly overallConfidence: ConfidenceLevel;
  readonly dataSourcesUsed: readonly string[];
  readonly documentsAnalyzed?: number;
  readonly analyzedDocumentIds?: readonly string[];
}

/** Result context passed from the analysis stage to article generation strategies */
export interface AnalysisContext {
  readonly date: string;
  readonly outputDir: string;
  readonly completedMethods: readonly AnalysisMethod[];
  readonly results: ReadonlyMap<AnalysisMethod, AnalysisMethodStatus>;
  readonly manifest: AnalysisManifest;
}

// ─── Data checks ──────────────────────────────────────────────────────────────

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
 * Safely extract an array from fetchedData by key.
 *
 * @param data - Raw fetched data record
 * @param key - Key to extract
 * @returns Array or empty array if missing/invalid
 */
function safeArr(data: Record<string, unknown>, key: string): readonly unknown[] {
  const val = data[key]; // eslint-disable-line security/detect-object-injection
  return Array.isArray(val) ? val : [];
}

/**
 * Check whether the fetched data contains any substantive EP data.
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

// ─── Slug derivation ──────────────────────────────────────────────────────────

/**
 * Derive a filesystem-safe slug from an array of article types.
 *
 * @param articleTypes - One or more article category strings
 * @returns Sanitised, sorted, hyphen-joined slug
 */
export function deriveArticleTypeSlug(articleTypes: readonly (ArticleCategory | string)[]): string {
  if (articleTypes.length === 0) return 'default';
  const raw = [...articleTypes]
    .map((t) => t.trim().toLowerCase())
    .sort()
    .join('-');
  const sanitised = raw.replace(/[^a-z0-9-]+/gu, '-').replace(/-{2,}/gu, '-');
  const trimmed = sanitised.replace(/^-/u, '').replace(/-$/u, '');
  return trimmed.length > 0 ? trimmed : 'default';
}

// ─── Analysis discovery ───────────────────────────────────────────────────────

/**
 * Discover existing analysis files produced by AI agentic workflows and
 * return an {@link AnalysisContext} compatible with downstream consumers.
 *
 * This replaces the former `runAnalysisStage` which generated analysis
 * from scratch.  The AI agentic workflows now produce higher-quality
 * analysis directly, so this function merely discovers what exists on disk.
 *
 * When analysis files exist, a minimal `manifest.json` is written to disk
 * (if one doesn't already exist) so downstream consumers that check for
 * the manifest continue to work.
 *
 * @param fetchedData - Raw EP data (used only for the requireData check)
 * @param options - Analysis stage configuration
 * @returns Analysis context with discovered methods
 */
export async function runAnalysisStage(
  fetchedData: Record<string, unknown>,
  options: AnalysisStageOptions
): Promise<AnalysisContext> {
  const {
    articleTypes,
    date,
    outputDir,
    articleTypeSlug,
    verbose = false,
    requireData = false,
  } = options;

  if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) {
    throw new Error(`Invalid analysis date "${date}": must match YYYY-MM-DD format`);
  }

  if (!hasSubstantiveData(fetchedData)) {
    if (requireData) {
      throw new Error(
        'Analysis aborted: no substantive EP data available. ' +
          'MCP data fetch must succeed before analysis can run. ' +
          'Check MCP connection and feed data source.'
      );
    }
    if (verbose) {
      console.warn('⚠️  [analysis] No substantive EP data — analysis will be data-sparse.');
    }
  }

  const startTime = new Date().toISOString();
  const runId = randomUUID();

  const preferredDir = articleTypeSlug
    ? path.resolve(outputDir, date, articleTypeSlug)
    : path.resolve(outputDir, date);
  const dateOutputDir = resolveUniqueAnalysisDir(preferredDir);

  if (verbose) {
    console.log(`🔬 [analysis] Discovering existing analysis (runId: ${runId})`);
    console.log(`   Date: ${date}`);
    if (articleTypeSlug) console.log(`   Article type: ${articleTypeSlug}`);
    console.log(`   Output: ${dateOutputDir}`);
  }

  ensureDirectoryExists(dateOutputDir);

  // Discover analysis .md files that already exist on disk
  const discoveredEntries = discoverAnalysisFileEntries(dateOutputDir);

  // Build method status entries from discovered files
  const methods: AnalysisMethodStatus[] = discoveredEntries.map((entry) => ({
    method: entry.method as AnalysisMethod,
    status: 'completed' as const,
    outputFile: entry.outputFile,
    confidence: 'medium' as ConfidenceLevel,
    duration: 0,
    summary: `Discovered from AI-generated analysis: ${entry.outputFile}`,
  }));

  const completedMethods = methods.map((m) => m.method);

  const endTime = new Date().toISOString();
  const manifest: AnalysisManifest = {
    runId,
    date,
    articleTypeSlug,
    startTime,
    endTime,
    articleTypes,
    methods,
    overallConfidence: methods.length > 0 ? 'medium' : 'low',
    dataSourcesUsed: ['ai-agentic-workflow', 'filesystem-discovery'],
  };

  // Write manifest.json if one doesn't already exist
  const manifestPath = path.join(dateOutputDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    try {
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    } catch {
      // Non-fatal: manifest is informational
    }
  }

  if (verbose) {
    console.log(`🔬 Analysis discovery complete: ${methods.length} files found`);
  }

  return {
    date,
    outputDir: dateOutputDir,
    completedMethods,
    results: new Map(methods.map((m) => [m.method, m])),
    manifest,
  };
}
