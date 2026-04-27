// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Manifest/Reader
 * @description Filesystem-aware manifest reader. Encapsulates the
 * "read manifest.json next to a run directory" pattern so callers don't
 * need to remember the JSON parse + try/catch + path-join recipe in three
 * different files.
 */

import fs from 'fs';
import path from 'path';
import type { Manifest } from './types.js';

/**
 * Result of {@link readManifest}. The `path` is always set; `manifest`
 * carries the parsed JSON when the file exists and is valid, otherwise
 * `null` (silent failure — the aggregator falls back to `articleType:
 * 'unknown'` and discovery-based file lists in that case, matching the
 * pre-refactor behaviour).
 */
export interface ReadManifestResult {
  /** Absolute path of the manifest file (whether or not it exists). */
  readonly path: string;
  /** Parsed manifest, or `null` if missing / unreadable / malformed. */
  readonly manifest: Manifest | null;
}

/**
 * Read and parse `manifest.json` from a run directory.
 *
 * Silent-failure semantics match the pre-refactor `analysis-aggregator.ts`
 * and `article-generator.ts` callers: missing files, malformed JSON, and
 * I/O errors all yield `manifest: null` rather than throwing. Callers that
 * need to distinguish "file missing" from "file malformed" can compare
 * `manifest === null` against `fs.existsSync(result.path)`.
 *
 * @param runDir - Absolute path of an analysis run directory
 * @returns {@link ReadManifestResult} with the parsed manifest or `null`
 */
export function readManifest(runDir: string): ReadManifestResult {
  const manifestPath = path.join(runDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return { path: manifestPath, manifest: null };
  }
  try {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const parsed = JSON.parse(raw) as Manifest;
    return { path: manifestPath, manifest: parsed };
  } catch {
    return { path: manifestPath, manifest: null };
  }
}

/**
 * Parse a manifest from a JSON string. Useful for backport callers that
 * already have the manifest in memory or for tests that synthesise
 * manifests without touching disk.
 *
 * @param json - Raw JSON text
 * @returns Parsed manifest, or `null` when the input is not valid JSON
 */
export function parseManifest(json: string): Manifest | null {
  try {
    return JSON.parse(json) as Manifest;
  } catch {
    return null;
  }
}
