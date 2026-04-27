// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Data
 * @description Filesystem-scanning helpers that build the page data for
 * the political-intelligence index. Lifted out of the monolithic
 * `political-intelligence.ts` so the data-collection layer can be
 * unit-tested against fixture trees without dragging in the HTML
 * renderer or the 14-language copy table.
 *
 * Every helper here is **side-effect free** apart from `fs` reads. None
 * of the functions write files, mutate process state, or call into the
 * EP MCP — they are pure scans of `analysis/methodologies/`,
 * `analysis/templates/`, `analysis/reference/`, `analysis/imf/`,
 * `analysis/worldbank/`, and `analysis/daily/<date>/<run>/`.
 */

import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT } from '../../constants/config.js';
import { pickDocumentIcon, pickRunIcon } from './icons.js';
import { parseMarkdownMeta } from './markdown.js';
import type {
  PIDocument,
  PIDailyArtifact,
  PIDailyDateGroup,
  PIDailyRun,
  PIPageData,
} from './types.js';

/**
 * Scan the repository for all methodology and template Markdown files and
 * build the list of daily analysis runs.
 *
 * @param rootDir - Repository root (defaults to PROJECT_ROOT)
 * @returns Fully-populated {@link PIPageData}
 */
export function collectPoliticalIntelligenceData(rootDir: string = PROJECT_ROOT): PIPageData {
  const methodologies = collectDocumentList(
    path.join(rootDir, 'analysis', 'methodologies'),
    rootDir
  );
  const templates = collectDocumentList(path.join(rootDir, 'analysis', 'templates'), rootDir);
  const referenceDocs = collectReferenceDocs(rootDir);
  const dailyGroups = collectDailyGroups(path.join(rootDir, 'analysis', 'daily'), rootDir);
  return { methodologies, templates, referenceDocs, dailyGroups };
}

/**
 * Collect documentation from the auxiliary reference directories:
 * `analysis/reference/`, `analysis/imf/`, and `analysis/worldbank/`.
 *
 * Each collected file's stem is prefixed with the source directory name
 * (e.g. `imf/indicator-catalog`) so the icon picker can disambiguate and
 * readers can see the source in the PIDocument listing.
 *
 * @param rootDir - Repository root
 * @returns Merged list of reference PIDocument entries, sorted by source then name
 */
function collectReferenceDocs(rootDir: string): PIDocument[] {
  const sources = ['reference', 'imf', 'worldbank'] as const;
  const result: PIDocument[] = [];
  for (const source of sources) {
    const dir = path.join(rootDir, 'analysis', source);
    if (!fs.existsSync(dir)) continue;
    const docs = collectDocumentList(dir, rootDir);
    // Tag the stem with source so duplicates (e.g. `indicator-catalog` exists
    // in both `imf/` and `worldbank/`) sort and render distinctly.
    for (const doc of docs) {
      result.push({
        ...doc,
        stem: `${source}/${doc.stem}`,
      });
    }
  }
  // Source-group ordering: reference, imf, worldbank (preserve insertion order)
  // and within each group keep README-first alphabetical from collectDocumentList.
  return result;
}

/**
 * Collect every `.md` file in `dir` (non-recursive) and build PIDocument entries.
 *
 * @param dir - Absolute directory path to scan
 * @param rootDir - Repository root used to build relative paths
 * @returns Array of PIDocument entries sorted with README first, then alphabetical
 */
function collectDocumentList(dir: string, rootDir: string): PIDocument[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result: PIDocument[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.md')) continue;
    const fullPath = path.join(dir, entry.name);
    const stem = entry.name.replace(/\.md$/i, '');
    const { title, description } = parseMarkdownMeta(fullPath, stem);
    const relPath = path.relative(rootDir, fullPath).split(path.sep).join('/');
    result.push({
      relPath,
      stem,
      title,
      description,
      icon: pickDocumentIcon(stem),
    });
  }
  // README first, then alphabetical
  result.sort((a, b) => {
    const aReadme = /readme/i.test(a.stem);
    const bReadme = /readme/i.test(b.stem);
    if (aReadme !== bReadme) return aReadme ? -1 : 1;
    return a.stem.localeCompare(b.stem);
  });
  return result;
}

/**
 * Collect daily analysis runs grouped by date, newest date first.
 * Only directories that look like a run (contain at least one Markdown artifact)
 * are listed.
 *
 * @param dailyDir - Absolute path to the `analysis/daily` directory
 * @param rootDir - Repository root used to build relative paths
 * @returns Array of date-grouped runs, newest date first
 */
function collectDailyGroups(dailyDir: string, rootDir: string): PIDailyDateGroup[] {
  if (!fs.existsSync(dailyDir)) return [];
  const dateDirs = fs
    .readdirSync(dailyDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.name))
    .map((d) => d.name);
  // Newest first
  dateDirs.sort((a, b) => b.localeCompare(a));

  const groups: PIDailyDateGroup[] = [];
  for (const date of dateDirs) {
    const dateDir = path.join(dailyDir, date);
    const runDirs = fs
      .readdirSync(dateDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    const runs: PIDailyRun[] = [];
    for (const slug of runDirs) {
      const runDir = path.join(dateDir, slug);
      const artifacts = collectRunArtifacts(runDir, rootDir);
      if (artifacts.length === 0) continue;
      const relPath = path.relative(rootDir, runDir).split(path.sep).join('/');
      runs.push({
        slug,
        artifactCount: artifacts.length,
        relPath,
        icon: pickRunIcon(slug),
        artifacts,
      });
    }
    if (runs.length > 0) {
      groups.push({ date, runs });
    }
  }
  return groups;
}

/**
 * Recursively collect every Markdown artifact file under a run directory,
 * returning both the repo-relative path (used to build GitHub blob URLs)
 * and the run-relative short path (used for compact display).
 *
 * The caller guarantees `runDir` is a run directory such as
 * `analysis/daily/2026-04-22/breaking-run1`. Unreadable subtrees are
 * silently skipped so a single permission error can't blow up the page
 * generation for an entire date group.
 *
 * @param runDir - Absolute path to the run directory
 * @param rootDir - Repository root used to build relative paths
 * @returns Artifact entries sorted alphabetically by short path
 */
function collectRunArtifacts(runDir: string, rootDir: string): PIDailyArtifact[] {
  const artifacts: PIDailyArtifact[] = [];
  walkMarkdownFiles(runDir, (full) => {
    const relPath = path.relative(rootDir, full).split(path.sep).join('/');
    const shortPath = path.relative(runDir, full).split(path.sep).join('/');
    artifacts.push({ relPath, shortPath });
  });
  artifacts.sort((a, b) => a.shortPath.localeCompare(b.shortPath));
  return artifacts;
}

/**
 * Walk `dir` recursively and invoke `visit` for every `.md` file found.
 * Shared traversal used by {@link collectRunArtifacts}. Unreadable subtrees
 * are silently skipped.
 *
 * @param dir - Absolute directory path to walk
 * @param visit - Callback invoked with each Markdown file's absolute path
 */
function walkMarkdownFiles(dir: string, visit: (fullPath: string) => void): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkMarkdownFiles(full, visit);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      visit(full);
    }
  }
}
