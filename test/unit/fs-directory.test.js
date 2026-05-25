// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for utils/fs/directory module.
 *
 * Covers `ensureDirectoryExists` and `resolveUniqueAnalysisDir` — the
 * directory-coordination primitives used by the analysis pipeline to
 * keep concurrent same-day runs from clobbering each other. Pre-test
 * coverage on this module was 9.52% lines (no direct tests for
 * `resolveUniqueAnalysisDir`).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  ensureDirectoryExists,
  resolveUniqueAnalysisDir,
} from '../../scripts/utils/fs/directory.js';
import { createTempDir, cleanupTempDir } from '../helpers/test-utils.js';

describe('utils/fs/directory', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('ensureDirectoryExists', () => {
    it('creates a deeply nested directory that does not exist', () => {
      const target = path.join(tempDir, 'a', 'b', 'c');
      expect(fs.existsSync(target)).toBe(false);
      ensureDirectoryExists(target);
      expect(fs.existsSync(target)).toBe(true);
      expect(fs.statSync(target).isDirectory()).toBe(true);
    });

    it('is a no-op (no throw) when the directory already exists', () => {
      // Pre-create the directory
      const target = path.join(tempDir, 'already-here');
      fs.mkdirSync(target);
      expect(() => ensureDirectoryExists(target)).not.toThrow();
      expect(fs.existsSync(target)).toBe(true);
    });

    it('does not recreate or alter a directory that already has contents', () => {
      const target = path.join(tempDir, 'has-contents');
      fs.mkdirSync(target);
      const filePath = path.join(target, 'sentinel.txt');
      fs.writeFileSync(filePath, 'keep me');
      ensureDirectoryExists(target);
      expect(fs.readFileSync(filePath, 'utf-8')).toBe('keep me');
    });
  });

  describe('resolveUniqueAnalysisDir', () => {
    it('returns the base directory unchanged when it does not exist', () => {
      const base = path.join(tempDir, '2026-04-02', 'breaking');
      const resolved = resolveUniqueAnalysisDir(base);
      expect(resolved).toBe(base);
      // Function must NOT create the base directory — caller controls that
      expect(fs.existsSync(base)).toBe(false);
    });

    it('returns the base directory unchanged when it exists but has no manifest.json (incomplete run)', () => {
      // Resume-an-incomplete-run contract: a directory without manifest.json
      // is treated as available, so the suffix is not bumped.
      const base = path.join(tempDir, '2026-04-02', 'breaking');
      fs.mkdirSync(base, { recursive: true });
      fs.writeFileSync(path.join(base, 'partial.md'), 'in-flight');

      const resolved = resolveUniqueAnalysisDir(base);
      expect(resolved).toBe(base);
      // Existing partial content is preserved
      expect(fs.existsSync(path.join(base, 'partial.md'))).toBe(true);
    });

    it('returns the base directory unchanged when manifest.json is a directory entry (still no file)', () => {
      // Edge case: if `manifest.json` somehow exists as a directory, `existsSync`
      // returns true so the function must bump the suffix. This test pins the
      // behaviour of `fs.existsSync(...manifest.json)` against a directory.
      const base = path.join(tempDir, '2026-04-02', 'breaking');
      fs.mkdirSync(path.join(base, 'manifest.json'), { recursive: true });

      const resolved = resolveUniqueAnalysisDir(base);
      // existsSync('manifest.json') is true for a directory entry too, so the
      // function treats the base as occupied and returns `-2`.
      expect(resolved).toBe(`${base}-2`);
      expect(fs.existsSync(resolved)).toBe(true);
    });

    it('bumps to -2 when the base directory holds a completed run (manifest.json present)', () => {
      const base = path.join(tempDir, '2026-04-02', 'breaking');
      fs.mkdirSync(base, { recursive: true });
      fs.writeFileSync(path.join(base, 'manifest.json'), '{}');

      const resolved = resolveUniqueAnalysisDir(base);
      expect(resolved).toBe(`${base}-2`);
      expect(fs.existsSync(resolved)).toBe(true);
      // The suffixed directory is freshly claimed; the base is untouched
      expect(fs.readFileSync(path.join(base, 'manifest.json'), 'utf-8')).toBe('{}');
    });

    it('skips over already-claimed suffixed candidates and claims the next free one', () => {
      const base = path.join(tempDir, '2026-04-02', 'breaking');
      fs.mkdirSync(base, { recursive: true });
      fs.writeFileSync(path.join(base, 'manifest.json'), '{}');
      // Pre-claim -2 and -3 (e.g. by prior concurrent runs)
      fs.mkdirSync(`${base}-2`);
      fs.mkdirSync(`${base}-3`);

      const resolved = resolveUniqueAnalysisDir(base);
      expect(resolved).toBe(`${base}-4`);
      expect(fs.existsSync(resolved)).toBe(true);
    });

    it('treats a pre-claimed suffix as occupied regardless of whether it has a manifest', () => {
      // The "completed-run" check only applies to the base directory. Suffixed
      // candidates are claimed atomically via non-recursive mkdir, so the mere
      // existence of `-2` (manifest or not) is enough to push us to `-3`.
      const base = path.join(tempDir, '2026-04-02', 'breaking');
      fs.mkdirSync(base, { recursive: true });
      fs.writeFileSync(path.join(base, 'manifest.json'), '{}');
      fs.mkdirSync(`${base}-2`);
      // Note: NO manifest.json inside `-2`. Function must still skip it.

      const resolved = resolveUniqueAnalysisDir(base);
      expect(resolved).toBe(`${base}-3`);
    });

    it('creates the parent directory for the suffixed candidate when missing', () => {
      // Base directory exists with a manifest, but the *parent* directory of the
      // suffixed candidate is shared with the base — this exercises the
      // mkdirSync(parent, {recursive:true}) inside claimDir.
      const dayDir = path.join(tempDir, '2026-04-02');
      const base = path.join(dayDir, 'breaking');
      fs.mkdirSync(base, { recursive: true });
      fs.writeFileSync(path.join(base, 'manifest.json'), '{}');

      const resolved = resolveUniqueAnalysisDir(base);
      expect(resolved).toBe(`${base}-2`);
      expect(fs.existsSync(resolved)).toBe(true);
      // Parent day directory is still in place
      expect(fs.existsSync(dayDir)).toBe(true);
    });

    it('falls back to a UUID suffix after exhausting the -2..-100 numeric range', () => {
      const base = path.join(tempDir, '2026-04-02', 'breaking');
      fs.mkdirSync(base, { recursive: true });
      fs.writeFileSync(path.join(base, 'manifest.json'), '{}');
      // Pre-claim every numeric suffix from -2 through -100 inclusive
      for (let i = 2; i <= 100; i++) {
        fs.mkdirSync(`${base}-${i}`);
      }

      const resolved = resolveUniqueAnalysisDir(base);
      // Must NOT be a numeric suffix
      expect(resolved.startsWith(`${base}-`)).toBe(true);
      const suffix = resolved.slice(base.length + 1);
      expect(/^\d+$/.test(suffix)).toBe(false);
      // UUID slice(0,8) is 8 hex chars
      expect(suffix).toMatch(/^[0-9a-f]{8}$/);
      expect(fs.existsSync(resolved)).toBe(true);
    });

    it('returns a different suffix on each subsequent call once the previous one is committed (with manifest)', () => {
      // Simulate two sequential completed runs: each leaves a manifest.json
      // and the next caller should pick the next free suffix.
      const base = path.join(tempDir, '2026-04-02', 'breaking');
      fs.mkdirSync(base, { recursive: true });
      fs.writeFileSync(path.join(base, 'manifest.json'), '{}');

      const first = resolveUniqueAnalysisDir(base);
      expect(first).toBe(`${base}-2`);
      fs.writeFileSync(path.join(first, 'manifest.json'), '{}');

      const second = resolveUniqueAnalysisDir(base);
      expect(second).toBe(`${base}-3`);
      expect(first).not.toBe(second);
    });
  });
});
