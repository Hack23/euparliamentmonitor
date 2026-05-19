// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/Fs/Directory
 * @description Directory creation, atomic claim, and unique-suffix
 * resolution used by the analysis pipeline to coordinate concurrent
 * same-day runs.
 */

import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Ensure a directory exists, creating it recursively if needed
 *
 * @param dirPath - Directory path to ensure
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Attempt to atomically claim a directory by creating it non-recursively.
 *
 * @param dirPath - Directory path to claim
 * @returns `true` when the directory was created by this call, otherwise `false`
 */
function claimDir(dirPath: string): boolean {
  fs.mkdirSync(path.dirname(dirPath), { recursive: true });
  try {
    fs.mkdirSync(dirPath, { recursive: false });
    return true;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
      return false;
    }
    throw err;
  }
}

/**
 * Resolve a unique directory path by appending a numeric suffix (-2, -3, …)
 * when the preferred directory has already been claimed by a completed run.
 *
 * The base directory is treated as occupied when it contains `manifest.json`
 * (written at the end of a successful analysis run).  A directory without
 * `manifest.json` is considered available — this allows the `skipCompleted`
 * feature to resume an incomplete run in the same directory.
 *
 * Suffixed candidates (-2, -3, …) are claimed atomically via non-recursive
 * `mkdirSync`, preventing TOCTOU races when concurrent workflow runs
 * attempt to claim the same candidate.
 *
 * @param baseDir - The preferred directory path (e.g. `analysis/daily/2026-04-02/breaking`)
 * @returns The original `baseDir` when no completed run exists there, or a
 *          suffixed variant (e.g. `analysis/daily/2026-04-02/breaking-2`) otherwise.
 */
export function resolveUniqueAnalysisDir(baseDir: string): string {
  if (!fs.existsSync(path.join(baseDir, 'manifest.json'))) {
    return baseDir;
  }

  let suffix = 2;
  const MAX_SUFFIX = 100;
  while (suffix <= MAX_SUFFIX) {
    const candidate = `${baseDir}-${suffix}`;
    if (claimDir(candidate)) {
      return candidate;
    }
    suffix++;
  }

  const candidate = `${baseDir}-${randomUUID().slice(0, 8)}`;
  fs.mkdirSync(candidate, { recursive: true });
  return candidate;
}
