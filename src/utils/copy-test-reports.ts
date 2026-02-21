#!/usr/bin/env node

// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/CopyTestReports
 * @description Copies test reports and coverage data to the docs/ directory
 * for inclusion in the documentation bundle.
 */

import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { PROJECT_ROOT } from '../constants/config.js';

const DOCS_DIR = join(PROJECT_ROOT, 'docs');

/**
 * Recursively copy directory
 *
 * @param src - Source directory
 * @param dest - Destination directory
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  try {
    await fs.mkdir(dest, { recursive: true });

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Create a simple HTML index for test results
 *
 * @returns HTML content
 */
function createTestResultsIndex(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Results - EU Parliament Monitor</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { color: #1e3c72; }
    .info { background: #e7f3ff; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
    a { color: #667eea; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>📊 Test Results</h1>
  <div class="info">
    <p>Unit and integration test results are available in the terminal output and coverage report.</p>
    <p>For detailed test coverage metrics, see the <a href="../coverage/index.html">Coverage Report</a>.</p>
    <p>For end-to-end test results, see the <a href="../../playwright-report/index.html">E2E Test Report</a>.</p>
  </div>
  <p><a href="../index.html">← Back to Documentation Index</a></p>
</body>
</html>`;
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.log('📋 Copying test reports to documentation directory...');

  try {
    await fs.mkdir(DOCS_DIR, { recursive: true });

    const coverageSrc = join(PROJECT_ROOT, 'builds/coverage');
    const coverageDest = join(DOCS_DIR, 'coverage');
    console.log('  📊 Copying coverage report...');
    await copyDirectory(coverageSrc, coverageDest);
    console.log('  ✅ Coverage report copied');

    const apiSrc = join(PROJECT_ROOT, 'builds/api');
    const apiDest = join(DOCS_DIR, 'api');
    console.log('  📊 Copying api docs...');
    await copyDirectory(apiSrc, apiDest);
    console.log('  ✅ api docs  copied');
    
    const testResultsDir = join(DOCS_DIR, 'test-results');
    await fs.mkdir(testResultsDir, { recursive: true });
    await fs.writeFile(join(testResultsDir, 'index.html'), createTestResultsIndex(), 'utf8');
    console.log('  ✅ Test results index created');

    console.log('✅ All test reports copied successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Error copying test reports:', message);
    process.exit(1);
  }
}

// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
