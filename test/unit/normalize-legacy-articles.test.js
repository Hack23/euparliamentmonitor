// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for scripts/normalize-legacy-articles.js.
 *
 * The helper is invoked from `.github/workflows/deploy-s3.yml` to apply
 * legacy CSP normalisation and pin the Mermaid cache-bust query across
 * every `news/*.html`. Its load-bearing contract is **idempotency at the
 * byte level** — already-normalised files must be left untouched on disk
 * (mtime preserved) so `aws s3 sync` correctly skips them on reruns.
 *
 * The tests run the script as a child process against a synthetic
 * repository tree under a temp dir to avoid mutating the real news
 * archive (~4400 files).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const helperScript = path.join(repoRoot, 'scripts', 'normalize-legacy-articles.js');

/** Build a minimal repo skeleton (package.json + news/) under `dir`. */
function setupFakeRepo(dir, mermaidVersion = '11.15.0') {
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: 'test-fixture',
      version: '0.0.0',
      devDependencies: { mermaid: `^${mermaidVersion}` },
    }),
    'utf8',
  );
  fs.mkdirSync(path.join(dir, 'news'), { recursive: true });
  // The helper resolves the repo root via __dirname (scripts/), so place a
  // copy of the helper inside dir/scripts/ to make `dir` the resolved root.
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  fs.copyFileSync(helperScript, path.join(dir, 'scripts', 'normalize-legacy-articles.js'));
}

function writeArticle(dir, filename, body) {
  fs.writeFileSync(path.join(dir, 'news', filename), body, 'utf8');
}

function runHelper(dir) {
  return spawnSync(
    process.execPath,
    [path.join(dir, 'scripts', 'normalize-legacy-articles.js')],
    { encoding: 'utf8' },
  );
}

const LEGACY_CSP_BODY = `<!doctype html>
<html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src 'none'; script-src 'self' 'sha256-AAA' 'sha256-BBB';">
<script src="../js/mermaid-init.js?v=10.0.0"></script>
</head><body><h1>x</h1></body></html>
`;

const NORMALISED_BODY = `<!doctype html>
<html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self'; script-src 'self';">
<script src="../js/mermaid-init.js?v=11.15.0"></script>
</head><body><h1>x</h1></body></html>
`;

describe('scripts/normalize-legacy-articles.js', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'norm-legacy-'));
    setupFakeRepo(tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('rewrites legacy CSP to the current fixed policy', () => {
    writeArticle(tempDir, 'legacy.html', LEGACY_CSP_BODY);
    const result = runHelper(tempDir);
    expect(result.status).toBe(0);
    const after = fs.readFileSync(path.join(tempDir, 'news', 'legacy.html'), 'utf8');
    expect(after).toContain("default-src 'self'");
    expect(after).toContain("connect-src 'self'");
    expect(after).toContain("script-src 'self';");
    expect(after).not.toContain("'sha256-");
  });

  it('pins the Mermaid cache-bust query to the package.json devDependency version', () => {
    writeArticle(tempDir, 'legacy.html', LEGACY_CSP_BODY);
    const result = runHelper(tempDir);
    expect(result.status).toBe(0);
    const after = fs.readFileSync(path.join(tempDir, 'news', 'legacy.html'), 'utf8');
    // Filename / filepath contract: same path, same filename, only the
    // ?v=… query is rewritten to the current pinned version.
    expect(after).toContain('src="../js/mermaid-init.js?v=11.15.0"');
    expect(after).not.toContain('?v=10.0.0');
  });

  it('is idempotent: a second run on already-normalised files writes 0 bytes (mtime preserved)', async () => {
    writeArticle(tempDir, 'normalised.html', NORMALISED_BODY);
    // First run — already normalised content; should be a complete no-op.
    const first = runHelper(tempDir);
    expect(first.status).toBe(0);
    expect(first.stdout).toMatch(/0 written/);
    const mtimeBefore = fs.statSync(path.join(tempDir, 'news', 'normalised.html')).mtimeMs;
    await new Promise((r) => setTimeout(r, 50));
    const second = runHelper(tempDir);
    expect(second.status).toBe(0);
    expect(second.stdout).toMatch(/0 written/);
    const mtimeAfter = fs.statSync(path.join(tempDir, 'news', 'normalised.html')).mtimeMs;
    // mtime preservation is the load-bearing property: aws s3 sync uses
    // size+mtime by default, so the second deploy must skip this file.
    expect(mtimeAfter).toBe(mtimeBefore);
  });

  it('idempotent across reruns: normalising legacy content twice gives 1 write then 0 writes', () => {
    writeArticle(tempDir, 'legacy.html', LEGACY_CSP_BODY);
    const first = runHelper(tempDir);
    expect(first.status).toBe(0);
    expect(first.stdout).toMatch(/1 written/);
    const second = runHelper(tempDir);
    expect(second.status).toBe(0);
    expect(second.stdout).toMatch(/0 written/);
  });

  it('leaves modern article CSPs untouched', () => {
    const modern = NORMALISED_BODY.replace(
      'src="../js/mermaid-init.js?v=11.15.0"',
      'src="../js/mermaid-init.js?v=11.15.0"',
    );
    writeArticle(tempDir, 'modern.html', modern);
    const result = runHelper(tempDir);
    expect(result.status).toBe(0);
    const after = fs.readFileSync(path.join(tempDir, 'news', 'modern.html'), 'utf8');
    expect(after).toBe(modern);
  });

  it('handles articles with no Mermaid reference (CSP-only normalisation)', () => {
    const noMermaid = `<!doctype html><html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src 'none'; script-src 'self';">
</head><body><h1>x</h1></body></html>
`;
    writeArticle(tempDir, 'no-mermaid.html', noMermaid);
    const result = runHelper(tempDir);
    expect(result.status).toBe(0);
    const after = fs.readFileSync(path.join(tempDir, 'news', 'no-mermaid.html'), 'utf8');
    expect(after).toContain("default-src 'self'");
    expect(after).toContain("connect-src 'self'");
  });

  it('exits 0 when news/ directory does not exist', () => {
    fs.rmSync(path.join(tempDir, 'news'), { recursive: true, force: true });
    const result = runHelper(tempDir);
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/news\/ directory does not exist/);
  });

  it('exits 1 when mermaid version cannot be resolved from package.json', () => {
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'no-mermaid', version: '0.0.0' }),
      'utf8',
    );
    writeArticle(tempDir, 'legacy.html', LEGACY_CSP_BODY);
    const result = runHelper(tempDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/Could not resolve mermaid version/);
  });
});
