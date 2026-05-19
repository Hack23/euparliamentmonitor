// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/Fs/AtomicWrite
 * @description Idempotent and atomic file write primitives.
 *
 * - `writeFileIfChanged` / `writeFileContent` preserve mtime when the
 *   on-disk bytes already match (idempotency contract for `aws s3 sync`).
 * - `atomicWrite` writes via a unique temp file + rename with retries,
 *   tolerating concurrent writers on Windows-like filesystems.
 * - `resolveUniqueFilePath` produces non-clobbering numeric suffixes.
 */

import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { ensureDirectoryExists } from './directory.js';

/**
 * Resolve a unique filename by appending a numeric suffix (-2, -3, …) before
 * the file extension when the file already exists.
 *
 * This prevents repeated workflow runs from overwriting previously committed
 * news articles.
 *
 * @param filepath - The preferred file path (e.g. `news/2026-04-02-breaking-en.html`)
 * @returns The original path when the file doesn't exist, or a suffixed
 *          variant (e.g. `news/2026-04-02-breaking-en-2.html`) otherwise.
 */
export function resolveUniqueFilePath(filepath: string): string {
  if (!fs.existsSync(filepath)) {
    return filepath;
  }

  const dir = path.dirname(filepath);
  const ext = path.extname(filepath);
  const base = path.basename(filepath, ext);

  let suffix = 2;
  const MAX_SUFFIX = 100;
  while (suffix <= MAX_SUFFIX) {
    const candidate = path.join(dir, `${base}-${suffix}${ext}`);
    if (!fs.existsSync(candidate)) {
      return candidate;
    }
    suffix++;
  }
  return path.join(dir, `${base}-${randomUUID().slice(0, 8)}${ext}`);
}

/**
 * Write `content` to `filepath` only if the existing on-disk bytes differ.
 *
 * Used to keep `aws s3 sync` (which compares size + mtime) from re-uploading
 * files whose content the build pipeline regenerated identically — see the
 * idempotency contract documented in `.github/workflows/deploy-s3.yml`.
 *
 * @param filepath - Output file path
 * @param content  - Desired file content (UTF-8 string or raw Buffer)
 * @returns `true` when an actual write occurred, `false` when the file
 *          already had byte-identical content and was left untouched.
 */
export function writeFileIfChanged(filepath: string, content: string | Buffer): boolean {
  const dir = path.dirname(filepath);
  ensureDirectoryExists(dir);
  const desired = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8');
  if (fs.existsSync(filepath)) {
    try {
      const existing = fs.readFileSync(filepath);
      if (existing.equals(desired)) {
        return false;
      }
    } catch {
      // Fall through to overwrite — read failures must not block deploy.
    }
  }
  fs.writeFileSync(filepath, desired);
  return true;
}

/**
 * Write content to a file with UTF-8 encoding.
 *
 * Idempotent at the byte level: if the file already exists with identical
 * content, the file is left untouched (mtime preserved). This keeps
 * `aws s3 sync` from re-uploading regenerated-but-identical files.
 *
 * @param filepath - Output file path
 * @param content - File content
 */
export function writeFileContent(filepath: string, content: string): void {
  writeFileIfChanged(filepath, content);
}

/**
 * Remove a file, ignoring ENOENT (file already deleted by another writer).
 *
 * @param filepath - Path to the file to remove
 */
function unlinkIfExists(filepath: string): void {
  try {
    fs.unlinkSync(filepath);
  } catch (err: unknown) {
    const code = err instanceof Error ? (err as NodeJS.ErrnoException).code : '';
    if (code !== 'ENOENT') {
      throw err;
    }
  }
}

/**
 * Attempt to rename `src` to `dest` with a bounded retry loop.
 *
 * On each attempt the existing destination is removed first, then
 * `renameSync` is retried.  `EEXIST`/`EPERM` failures from concurrent
 * writers are tolerated for up to `maxRetries` attempts.
 *
 * @param src - Source (temp) file path
 * @param dest - Final destination path
 * @param maxRetries - Maximum number of unlink-then-rename attempts
 */
function renameWithRetry(src: string, dest: string, maxRetries: number): void {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    unlinkIfExists(dest);
    try {
      fs.renameSync(src, dest);
      return;
    } catch (retryErr: unknown) {
      const retryCode = retryErr instanceof Error ? (retryErr as NodeJS.ErrnoException).code : '';
      if ((retryCode === 'EEXIST' || retryCode === 'EPERM') && attempt < maxRetries - 1) {
        continue;
      }
      throw retryErr;
    }
  }
}

/**
 * Best-effort removal of a temporary file.  Ignores ENOENT (the file was
 * already renamed or never created) but logs a warning for other errors
 * (e.g. EBUSY, EACCES) so operators can detect leaked temp files.
 *
 * @param tempPath - Path to the temp file to remove
 */
function cleanupTempFile(tempPath: string): void {
  try {
    fs.unlinkSync(tempPath);
  } catch (unlinkErr: unknown) {
    const errno =
      unlinkErr && typeof unlinkErr === 'object' ? (unlinkErr as NodeJS.ErrnoException) : undefined;
    if (errno?.code !== 'ENOENT') {
      const message =
        errno && typeof errno.message === 'string' ? errno.message : String(unlinkErr);
      const code = errno?.code ?? 'UNKNOWN';
      console.warn(
        `atomicWrite: failed to remove temporary file "${tempPath}" (code: ${code}): ${message}`
      );
    }
  }
}

/**
 * Write content to a file atomically.
 *
 * Writes to a uniquely-named temporary file in the same directory first, then
 * renames it to the final path. The temp filename includes the PID and a random
 * UUID so that concurrent callers targeting the same destination never collide
 * on the intermediate file. If the rename fails the temp file is cleaned up in
 * a `finally` block. On platforms where `renameSync` does not overwrite an
 * existing destination (e.g. Windows), the error is caught and the target is
 * removed before retrying the rename.
 *
 * @param filepath - Final output file path
 * @param content - File content to write
 */
export function atomicWrite(filepath: string, content: string): void {
  const dir = path.dirname(filepath);
  ensureDirectoryExists(dir);
  const uniqueSuffix = `${process.pid}-${randomUUID()}`;
  const tempPath = `${filepath}.${uniqueSuffix}.tmp`;
  try {
    fs.writeFileSync(tempPath, content, 'utf-8');
    try {
      fs.renameSync(tempPath, filepath);
    } catch (err: unknown) {
      const code = err instanceof Error ? (err as NodeJS.ErrnoException).code : '';
      if (code === 'EEXIST' || code === 'EPERM') {
        renameWithRetry(tempPath, filepath, 3);
      } else {
        throw err;
      }
    }
  } finally {
    cleanupTempFile(tempPath);
  }
}
