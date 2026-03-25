// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Pipeline/AnalysisStage
 * @description Pre-generation analysis pipeline stage that produces structured
 * markdown analysis files from fetched EP data.
 *
 * Sits between the Transform and Generate stages:
 *   Fetch → Transform → **Analysis** → Generate → Output
 *
 * All public functions are pure (or async-pure) and produce deterministic output
 * for a given input.  File-system writes are confined to a single helper so that
 * the core logic can be tested without disk access.
 *
 * @see {@link https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md | Secure Development Policy}
 */

import fs from 'fs';
import path from 'path';
import type { ArticleCategory } from '../../types/common.js';
import type { ConfidenceLevel } from '../../types/analysis.js';

// ─── Analysis method registry ────────────────────────────────────────────────

/**
 * Supported analysis methods that can be run on fetched EP data.
 * Each method corresponds to a distinct markdown output file.
 */
export type AnalysisMethod =
  | 'data-summary'
  | 'political-classification'
  | 'risk-assessment'
  | 'stakeholder-analysis'
  | 'swot-analysis'
  | 'trend-detection'
  | 'coalition-analysis'
  | 'voting-pattern'
  | 'legislative-pipeline'
  | 'rapid-impact-assessment'
  | 'power-dynamics'
  | 'amendment-landscape'
  | 'passage-probability'
  | 'cross-party-defection'
  | 'policy-momentum'
  | 'promise-vs-delivery'
  | 'coalition-stability-index'
  | 'emerging-themes';

// ─── Options & output types ──────────────────────────────────────────────────

/**
 * Options for running the analysis stage on one article type.
 */
export interface AnalysisStageOptions {
  /** The article category being analysed */
  readonly articleType: ArticleCategory;
  /** Raw data fetched from MCP tools, keyed by tool name */
  readonly fetchedData: Readonly<Record<string, unknown>>;
  /** Root directory for analysis output (e.g. `analysis-output/`) */
  readonly outputDir: string;
  /** Which analysis methods to run */
  readonly enabledMethods: readonly AnalysisMethod[];
}

/**
 * Result of a single analysis method execution.
 */
export interface AnalysisOutput {
  /** The method that produced this output */
  readonly method: AnalysisMethod;
  /** Relative path to the written markdown file */
  readonly filePath: string;
  /** Short human-readable summary of findings */
  readonly summary: string;
  /** Confidence level of the analysis */
  readonly confidence: ConfidenceLevel;
  /** ISO 8601 timestamp of generation */
  readonly generatedAt: string;
}

// ─── Manifest types ──────────────────────────────────────────────────────────

/**
 * A directed relationship between two analysis outputs.
 */
export interface AnalysisCrossReference {
  /** Source analysis method */
  readonly from: AnalysisMethod;
  /** Target analysis method */
  readonly to: AnalysisMethod;
  /** How the source relates to the target */
  readonly relationship: 'informs' | 'validates' | 'contradicts' | 'extends';
}

/**
 * JSON manifest that inventories all analysis outputs for one article type.
 */
export interface AnalysisManifest {
  /** Manifest schema version */
  readonly version: string;
  /** ISO 8601 generation timestamp */
  readonly generatedAt: string;
  /** Article category the analyses belong to */
  readonly articleType: ArticleCategory;
  /** Individual analysis records */
  readonly analyses: readonly AnalysisOutput[];
  /** Directed relationships between analyses */
  readonly crossReferences: readonly AnalysisCrossReference[];
}

// ─── Cross-reference relationship constants ──────────────────────────────────

/** Relationship type: source analysis provides input to the target */
const REL_INFORMS: AnalysisCrossReference['relationship'] = 'informs';

/** Relationship type: source analysis confirms / validates the target */
const REL_VALIDATES: AnalysisCrossReference['relationship'] = 'validates';

/** Relationship type: source analysis extends / deepens the target */
const REL_EXTENDS: AnalysisCrossReference['relationship'] = 'extends';

// ─── Frequently-referenced analysis method names ─────────────────────────────

/** Risk assessment method name (used in multiple cross-reference rules) */
const METHOD_RISK_ASSESSMENT: AnalysisMethod = 'risk-assessment';

/** Coalition analysis method name (used in multiple cross-reference rules) */
const METHOD_COALITION_ANALYSIS: AnalysisMethod = 'coalition-analysis';

/** Stakeholder analysis method name (used in multiple cross-reference rules) */
const METHOD_STAKEHOLDER_ANALYSIS: AnalysisMethod = 'stakeholder-analysis';

// ─── Predefined cross-reference rules ────────────────────────────────────────

/**
 * Static cross-reference rules that apply whenever both referenced methods
 * are present in a manifest.
 */
const CROSS_REFERENCE_RULES: readonly AnalysisCrossReference[] = [
  { from: METHOD_STAKEHOLDER_ANALYSIS, to: METHOD_RISK_ASSESSMENT, relationship: REL_INFORMS },
  { from: 'voting-pattern', to: METHOD_COALITION_ANALYSIS, relationship: REL_INFORMS },
  { from: 'data-summary', to: 'political-classification', relationship: REL_INFORMS },
  { from: 'trend-detection', to: METHOD_RISK_ASSESSMENT, relationship: REL_VALIDATES },
  { from: 'legislative-pipeline', to: 'passage-probability', relationship: REL_INFORMS },
  { from: METHOD_COALITION_ANALYSIS, to: 'cross-party-defection', relationship: REL_EXTENDS },
  { from: 'power-dynamics', to: METHOD_STAKEHOLDER_ANALYSIS, relationship: REL_INFORMS },
  { from: 'rapid-impact-assessment', to: METHOD_RISK_ASSESSMENT, relationship: REL_VALIDATES },
  { from: 'policy-momentum', to: 'trend-detection', relationship: REL_EXTENDS },
  { from: 'coalition-stability-index', to: METHOD_COALITION_ANALYSIS, relationship: REL_VALIDATES },
];

// ─── Folder slug mapping ─────────────────────────────────────────────────────

/**
 * Map article category enum values to their output folder name.
 *
 * @param articleType - The article category to convert
 * @returns Folder name string (kebab-case)
 */
function articleTypeToFolder(articleType: ArticleCategory): string {
  // ArticleCategory enum values are already kebab-case slugs
  return String(articleType);
}

// ─── Data inspection helpers (pure) ──────────────────────────────────────────

/**
 * Count the total number of data items across all fetched tool responses.
 * Handles arrays, objects-with-length, and primitives uniformly.
 *
 * @param fetchedData - Raw data keyed by tool name
 * @returns Total item count
 */
export function countDataItems(fetchedData: Readonly<Record<string, unknown>>): number {
  let total = 0;
  for (const value of Object.values(fetchedData)) {
    if (Array.isArray(value)) {
      total += value.length;
    } else if (value !== null && value !== undefined && typeof value === 'object') {
      const keys = Object.keys(value as Record<string, unknown>);
      total += keys.length > 0 ? keys.length : 1;
    } else if (value !== null && value !== undefined) {
      total += 1;
    }
  }
  return total;
}

/**
 * Derive a confidence level from the quantity and diversity of available data.
 *
 * @param fetchedData - Raw data keyed by tool name
 * @returns Derived confidence level
 */
export function deriveConfidence(fetchedData: Readonly<Record<string, unknown>>): ConfidenceLevel {
  const toolCount = Object.keys(fetchedData).length;
  const itemCount = countDataItems(fetchedData);

  if (toolCount >= 3 && itemCount >= 10) return 'high';
  if (toolCount >= 1 && itemCount >= 3) return 'medium';
  return 'low';
}

// ─── Markdown generation (pure) ──────────────────────────────────────────────

/**
 * Generate YAML frontmatter for an analysis markdown file.
 *
 * @param method - Analysis method name
 * @param articleType - Article category
 * @param confidence - Confidence level
 * @param generatedAt - ISO 8601 timestamp
 * @returns YAML frontmatter string (including delimiters)
 */
export function generateFrontmatter(
  method: AnalysisMethod,
  articleType: ArticleCategory,
  confidence: ConfidenceLevel,
  generatedAt: string
): string {
  return [
    '---',
    `method: "${method}"`,
    `articleType: "${String(articleType)}"`,
    `confidence: "${confidence}"`,
    `generatedAt: "${generatedAt}"`,
    `classification: "PUBLIC"`,
    '---',
  ].join('\n');
}

/**
 * Build the full markdown content for a single analysis output.
 *
 * @param method - Analysis method
 * @param articleType - Article category
 * @param fetchedData - Raw data keyed by tool name
 * @param generatedAt - ISO 8601 timestamp
 * @returns Object containing the markdown body and a short summary string
 */
export function buildAnalysisMarkdown(
  method: AnalysisMethod,
  articleType: ArticleCategory,
  fetchedData: Readonly<Record<string, unknown>>,
  generatedAt: string
): { markdown: string; summary: string } {
  const confidence = deriveConfidence(fetchedData);
  const toolCount = Object.keys(fetchedData).length;
  const itemCount = countDataItems(fetchedData);
  const toolNames = Object.keys(fetchedData);

  const title = method
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const frontmatter = generateFrontmatter(method, articleType, confidence, generatedAt);

  const summary = `${toolCount} data source(s), ${itemCount} item(s), confidence: ${confidence}`;

  const sections = [
    frontmatter,
    '',
    `# ${title}`,
    '',
    `**Article Type:** ${String(articleType)}`,
    `**Generated:** ${generatedAt}`,
    `**Confidence:** ${confidence}`,
    `**Classification:** PUBLIC`,
    '',
    '## Data Sources',
    '',
    `- **Tools consulted:** ${toolCount}`,
    `- **Total items:** ${itemCount}`,
    '',
    ...toolNames.map((name) => {
      const val = fetchedData[name];
      const count = Array.isArray(val)
        ? val.length
        : val !== null && val !== undefined && typeof val === 'object'
          ? Object.keys(val as Record<string, unknown>).length
          : 1;
      return `- \`${name}\`: ${count} item(s)`;
    }),
    '',
    '## Analysis',
    '',
    `> Automated ${title.toLowerCase()} for ${String(articleType)} articles.`,
    `> This file is an intermediate build artifact consumed by the generation stage.`,
    '',
    `### Summary`,
    '',
    `${summary}`,
    '',
  ];

  return { markdown: sections.join('\n'), summary };
}

// ─── File writing helpers ────────────────────────────────────────────────────

/**
 * Ensure a directory exists, creating it recursively if needed.
 *
 * @param dirPath - Absolute path to the directory
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write a string to a file, creating parent directories as needed.
 *
 * @param filePath - Absolute path to the target file
 * @param content - File content
 */
export function writeAnalysisFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

// ─── Manifest builder (pure) ─────────────────────────────────────────────────

/**
 * Build a cross-reference manifest from a set of analysis outputs.
 *
 * Applies {@link CROSS_REFERENCE_RULES} — a cross-reference is included only
 * when both the `from` and `to` methods are present in the output set.
 *
 * @param outputs - Array of analysis outputs
 * @param articleType - Article category
 * @param generatedAt - ISO 8601 generation timestamp
 * @returns Completed analysis manifest
 */
export function buildAnalysisManifest(
  outputs: readonly AnalysisOutput[],
  articleType: ArticleCategory,
  generatedAt: string
): AnalysisManifest {
  const methods = new Set(outputs.map((o) => o.method));

  const crossReferences = CROSS_REFERENCE_RULES.filter(
    (rule) => methods.has(rule.from) && methods.has(rule.to)
  );

  return {
    version: '1.0.0',
    generatedAt,
    articleType,
    analyses: outputs,
    crossReferences,
  };
}

// ─── Main pipeline entry point ───────────────────────────────────────────────

/**
 * Run the analysis stage for a single article type.
 *
 * For each enabled method, generates a structured markdown file in
 * `<outputDir>/<articleFolder>/<method>.md` and returns an array of
 * {@link AnalysisOutput} records.
 *
 * When `fetchedData` is empty the stage returns an empty array without writing
 * any files, allowing callers to fall back gracefully.
 *
 * @param options - Stage configuration
 * @returns Array of analysis output records
 */
export async function runAnalysisStage(
  options: AnalysisStageOptions
): Promise<readonly AnalysisOutput[]> {
  const { articleType, fetchedData, outputDir, enabledMethods } = options;

  if (Object.keys(fetchedData).length === 0) {
    console.warn('⚠️ Analysis stage: no fetched data — skipping analysis');
    return [];
  }

  if (enabledMethods.length === 0) {
    return [];
  }

  const folder = articleTypeToFolder(articleType);
  const articleDir = path.join(outputDir, folder);
  const generatedAt = new Date().toISOString();
  const outputs: AnalysisOutput[] = [];

  for (const method of enabledMethods) {
    const { markdown, summary } = buildAnalysisMarkdown(
      method,
      articleType,
      fetchedData,
      generatedAt
    );

    const filePath = path.join(folder, `${method}.md`);
    const absolutePath = path.join(articleDir, `${method}.md`);

    writeAnalysisFile(absolutePath, markdown);

    outputs.push({
      method,
      filePath,
      summary,
      confidence: deriveConfidence(fetchedData),
      generatedAt,
    });
  }

  // Write the manifest
  const manifest = buildAnalysisManifest(outputs, articleType, generatedAt);
  const manifestPath = path.join(articleDir, 'manifest.json');
  writeAnalysisFile(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`✅ Analysis stage: wrote ${outputs.length} analysis file(s) to ${articleDir}`);

  return outputs;
}
