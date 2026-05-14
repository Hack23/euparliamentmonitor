// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for scripts/extend-artifacts.js
 *
 * Tests:
 * - resolveArtifactPath: absolute vs relative, baseDir override
 * - extendArtifact: append, create, prepend, overwrite, error cases
 * - extendArtifacts: batch success, partial failure, invalid input
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  resolveArtifactPath,
  extendArtifact,
  extendArtifacts,
} from '../../scripts/extend-artifacts.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'extend-artifacts-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// resolveArtifactPath
// ---------------------------------------------------------------------------

describe('resolveArtifactPath', () => {
  it('returns absolute paths unchanged', () => {
    const abs = '/tmp/some/absolute/file.md';
    expect(resolveArtifactPath(abs)).toBe(abs);
  });

  it('resolves relative paths against baseDir', () => {
    const result = resolveArtifactPath('intelligence/synthesis.md', '/base/dir');
    expect(result).toBe(path.join('/base/dir', 'intelligence/synthesis.md'));
  });

  it('resolves relative paths against cwd when no baseDir', () => {
    const result = resolveArtifactPath('some/relative/file.md');
    expect(result).toBe(path.resolve('some/relative/file.md'));
  });
});

// ---------------------------------------------------------------------------
// extendArtifact — append mode
// ---------------------------------------------------------------------------

describe('extendArtifact (append)', () => {
  it('creates file with content when it does not exist', () => {
    const filePath = path.join(tmpDir, 'new-artifact.md');
    const result = extendArtifact({ path: filePath, content: '# New\n\nContent here.' });

    expect(result.ok).toBe(true);
    expect(result.linesBefore).toBe(0);
    expect(result.linesAfter).toBeGreaterThan(0);
    expect(fs.readFileSync(filePath, 'utf8')).toBe('# New\n\nContent here.');
  });

  it('appends content to existing file', () => {
    const filePath = path.join(tmpDir, 'existing.md');
    fs.writeFileSync(filePath, '# Existing\n', 'utf8');

    const result = extendArtifact({
      path: filePath,
      content: '\n## Added Section\n\nNew content.',
    });

    expect(result.ok).toBe(true);
    expect(result.linesBefore).toBeGreaterThan(0);
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('# Existing');
    expect(content).toContain('## Added Section');
  });

  it('adds newline separator when existing file lacks trailing newline', () => {
    const filePath = path.join(tmpDir, 'no-newline.md');
    fs.writeFileSync(filePath, '# No newline at end', 'utf8');

    extendArtifact({ path: filePath, content: 'extra' });

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toBe('# No newline at end\nextra');
  });

  it('does not double-add newline when existing file ends with newline', () => {
    const filePath = path.join(tmpDir, 'with-newline.md');
    fs.writeFileSync(filePath, '# With newline\n', 'utf8');

    extendArtifact({ path: filePath, content: 'appended' });

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toBe('# With newline\nappended');
  });
});

// ---------------------------------------------------------------------------
// extendArtifact — create mode
// ---------------------------------------------------------------------------

describe('extendArtifact (create)', () => {
  it('creates file successfully in create mode', () => {
    const filePath = path.join(tmpDir, 'brand-new.md');
    const result = extendArtifact({
      path: filePath,
      content: '# Brand new',
      mode: 'create',
    });

    expect(result.ok).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe('# Brand new');
  });

  it('fails when file exists and overwrite=false', () => {
    const filePath = path.join(tmpDir, 'existing.md');
    fs.writeFileSync(filePath, 'original', 'utf8');

    const result = extendArtifact({
      path: filePath,
      content: 'new content',
      mode: 'create',
      overwrite: false,
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain('already exists');
    // Original file unchanged
    expect(fs.readFileSync(filePath, 'utf8')).toBe('original');
  });

  it('overwrites file when overwrite=true in create mode', () => {
    const filePath = path.join(tmpDir, 'overwrite-me.md');
    fs.writeFileSync(filePath, 'old content', 'utf8');

    const result = extendArtifact({
      path: filePath,
      content: 'new content',
      mode: 'create',
      overwrite: true,
    });

    expect(result.ok).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe('new content');
  });
});

// ---------------------------------------------------------------------------
// extendArtifact — prepend mode
// ---------------------------------------------------------------------------

describe('extendArtifact (prepend)', () => {
  it('prepends content to existing file', () => {
    const filePath = path.join(tmpDir, 'prepend-me.md');
    fs.writeFileSync(filePath, '## Section 2\n', 'utf8');

    const result = extendArtifact({
      path: filePath,
      content: '# Title\n\n',
      mode: 'prepend',
    });

    expect(result.ok).toBe(true);
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toMatch(/^# Title/);
    expect(content).toContain('## Section 2');
  });

  it('creates file with content if it does not exist', () => {
    const filePath = path.join(tmpDir, 'prepend-new.md');
    const result = extendArtifact({
      path: filePath,
      content: '# Prepended to empty',
      mode: 'prepend',
    });

    expect(result.ok).toBe(true);
    expect(fs.existsSync(filePath)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// extendArtifact — dryRun
// ---------------------------------------------------------------------------

describe('extendArtifact (dryRun)', () => {
  it('does not create file in dry-run mode', () => {
    const filePath = path.join(tmpDir, 'dry-run.md');
    const result = extendArtifact(
      { path: filePath, content: '# Dry run content' },
      undefined,
      true,
    );

    expect(result.ok).toBe(true);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('reports correct linesAfter without writing', () => {
    const filePath = path.join(tmpDir, 'dry-count.md');
    const result = extendArtifact(
      { path: filePath, content: 'Line 1\nLine 2\nLine 3' },
      undefined,
      true,
    );

    expect(result.linesAfter).toBe(3);
    expect(result.linesBefore).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// extendArtifact — error handling
// ---------------------------------------------------------------------------

describe('extendArtifact (error handling)', () => {
  it('returns error result for spec missing path', () => {
    const result = extendArtifact({ content: 'some content' });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('path and content are required');
  });

  it('returns error result for spec missing content', () => {
    const result = extendArtifact({ path: '/tmp/test.md' });
    expect(result.ok).toBe(false);
  });

  it('creates parent directories recursively', () => {
    const deepPath = path.join(tmpDir, 'a', 'b', 'c', 'deep.md');
    const result = extendArtifact({ path: deepPath, content: 'deep content' });

    expect(result.ok).toBe(true);
    expect(fs.existsSync(deepPath)).toBe(true);
  });

  it('uses baseDir for relative path resolution', () => {
    const result = extendArtifact(
      { path: 'relative/file.md', content: 'content' },
      tmpDir,
    );

    expect(result.ok).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'relative', 'file.md'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// extendArtifacts (batch)
// ---------------------------------------------------------------------------

describe('extendArtifacts', () => {
  it('processes multiple specs successfully', () => {
    const specs = [
      { path: path.join(tmpDir, 'a.md'), content: '# A' },
      { path: path.join(tmpDir, 'b.md'), content: '# B' },
      { path: path.join(tmpDir, 'c.md'), content: '# C' },
    ];

    const summary = extendArtifacts(specs);
    expect(summary.totalSpecs).toBe(3);
    expect(summary.succeeded).toBe(3);
    expect(summary.failed).toBe(0);
    expect(summary.ok).toBe(true);
  });

  it('reports partial failure and sets ok=false', () => {
    const existingFile = path.join(tmpDir, 'exists.md');
    fs.writeFileSync(existingFile, 'original', 'utf8');

    const specs = [
      { path: path.join(tmpDir, 'good.md'), content: '# Good' },
      { path: existingFile, content: '# Conflict', mode: 'create', overwrite: false },
    ];

    const summary = extendArtifacts(specs);
    expect(summary.succeeded).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.ok).toBe(false);
  });

  it('returns error result when specs is not an array', () => {
    const summary = extendArtifacts('not-an-array');
    expect(summary.ok).toBe(false);
    expect(summary.failed).toBe(1);
  });

  it('returns empty summary for empty array', () => {
    const summary = extendArtifacts([]);
    expect(summary.totalSpecs).toBe(0);
    expect(summary.succeeded).toBe(0);
    expect(summary.ok).toBe(true);
  });

  it('dry-run processes specs without creating files', () => {
    const specs = [
      { path: path.join(tmpDir, 'x.md'), content: '# X' },
      { path: path.join(tmpDir, 'y.md'), content: '# Y' },
    ];

    const summary = extendArtifacts(specs, undefined, true);
    expect(summary.ok).toBe(true);
    expect(summary.succeeded).toBe(2);
    // Files should NOT be created in dry-run
    expect(fs.existsSync(path.join(tmpDir, 'x.md'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, 'y.md'))).toBe(false);
  });

  it('uses baseDir for relative paths', () => {
    const specs = [
      { path: 'rel/file1.md', content: '# File 1' },
      { path: 'rel/file2.md', content: '# File 2' },
    ];

    const summary = extendArtifacts(specs, tmpDir);
    expect(summary.ok).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'rel', 'file1.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'rel', 'file2.md'))).toBe(true);
  });

  it('includes results array with one entry per spec', () => {
    const specs = [
      { path: path.join(tmpDir, 'result-a.md'), content: '# A' },
      { path: path.join(tmpDir, 'result-b.md'), content: '# B' },
    ];

    const summary = extendArtifacts(specs);
    expect(summary.results).toHaveLength(2);
    for (const r of summary.results) {
      expect(r).toHaveProperty('ok', true);
      expect(r).toHaveProperty('linesBefore');
      expect(r).toHaveProperty('linesAfter');
    }
  });
});
