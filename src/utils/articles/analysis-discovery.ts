// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/Articles/AnalysisDiscovery
 * @description On-disk discovery of analysis-method artifacts used as a
 * fallback when manifest.json does not enumerate `methods[]` explicitly.
 */

import fs from 'fs';
import path from 'path';
import type { AnalysisFileEntry } from '../../types/index.js';

/**
 * Well-known analysis subdirectories scanned for transparency links.
 * Matches the subdirectory structure created by agentic workflows.
 */
const DISCOVERY_SUBDIRS = [
  'classification',
  'threat-assessment',
  'risk-scoring',
  'existing',
  'documents',
  'intelligence',
] as const;

/**
 * Maps canonical analysis filenames (without `.md`) to their canonical
 * analysis method IDs used by `METHOD_LABEL_MAP` in `article-template.ts`.
 *
 * Per `analysis/README.md`, some canonical filenames differ from the method
 * identifier (e.g. the `stakeholder-analysis` method produces
 * `stakeholder-impact.md`). This mapping ensures localized labels render
 * correctly in the analysis transparency section.
 */
const FILENAME_TO_METHOD: Readonly<Record<string, string>> = {
  'stakeholder-impact': 'stakeholder-analysis',
  'coalition-dynamics': 'coalition-analysis',
  'document-analysis-index': 'document-analysis',
};

/**
 * Resolve the canonical analysis method ID for a given filename (without `.md`).
 *
 * Uses the {@link FILENAME_TO_METHOD} mapping for known mismatches; falls back
 * to the filename itself when no mapping exists.
 *
 * @param baseName - Filename without extension (e.g. `stakeholder-impact`)
 * @returns Canonical method ID (e.g. `stakeholder-analysis`)
 */
function resolveCanonicalMethod(baseName: string): string {
  return FILENAME_TO_METHOD[baseName] ?? baseName;
}

/**
 * Scan a single subdirectory for .md files and add them to the entries list.
 *
 * @param subdirPath - Absolute path to the subdirectory
 * @param subdir - Subdirectory name for the output file path prefix
 * @param entries - Mutable array to push discovered entries into
 */
function scanSubdirectory(subdirPath: string, subdir: string, entries: AnalysisFileEntry[]): void {
  try {
    if (!fs.existsSync(subdirPath) || !fs.statSync(subdirPath).isDirectory()) return;
    const files = fs.readdirSync(subdirPath);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const baseName = file.replace(/\.md$/u, '');
      entries.push({
        method: resolveCanonicalMethod(baseName),
        outputFile: `${subdir}/${file}`,
      });
    }
  } catch {
    // Skip unreadable directories
  }
}

/**
 * Scan root-level .md files in the analysis directory.
 *
 * @param dirPath - Analysis directory path
 * @param entries - Mutable array to push discovered entries into
 */
function scanRootMarkdownFiles(dirPath: string, entries: AnalysisFileEntry[]): void {
  try {
    const rootFiles = fs.readdirSync(dirPath);
    for (const file of rootFiles) {
      if (!file.endsWith('.md')) continue;
      const filePath = path.join(dirPath, file);
      if (!fs.statSync(filePath).isFile()) continue;
      const baseName = file.replace(/\.md$/u, '');
      entries.push({
        method: resolveCanonicalMethod(baseName),
        outputFile: file,
      });
    }
  } catch {
    // Skip if unreadable
  }
}

/**
 * Discover analysis file entries by scanning the analysis directory on disk.
 *
 * Scans known subdirectories plus root-level `.md` files to produce a
 * complete list of {@link AnalysisFileEntry} objects suitable for the
 * article template's dynamic analysis transparency section.
 *
 * This provides a robust fallback when the manifest.json doesn't contain
 * a standard `methods[]` array (e.g. manifests written by agentic workflows
 * use a different structure).
 *
 * @param analysisDirPath - Absolute path to the analysis directory on disk
 * @returns Array of discovered analysis file entries, or empty array when directory doesn't exist
 */
export function discoverAnalysisFileEntries(analysisDirPath: string): AnalysisFileEntry[] {
  if (!fs.existsSync(analysisDirPath)) return [];

  const entries: AnalysisFileEntry[] = [];

  for (const subdir of DISCOVERY_SUBDIRS) {
    scanSubdirectory(path.join(analysisDirPath, subdir), subdir, entries);
  }

  scanRootMarkdownFiles(analysisDirPath, entries);

  return entries;
}
