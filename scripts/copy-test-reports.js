#!/usr/bin/env node

// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Copy Test Reports to Documentation Directory
 *
 * This script copies all test reports and coverage data to the docs/ directory
 * for inclusion in the documentation bundle.
 *
 * @module scripts/copy-test-reports
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DOCS_DIR = join(ROOT_DIR, 'docs');

/**
 * Recursively copy directory
 *
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
async function copyDirectory(src, dest) {
  try {
    // Create destination directory
    await fs.mkdir(dest, { recursive: true });

    // Read source directory
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
    // Silently skip if source doesn't exist
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Create a simple HTML index for test results
 *
 * @returns {string} HTML content
 */
function createTestResultsIndex() {
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
async function main() {
  console.log('📋 Copying test reports to documentation directory...');

  try {
    // Ensure docs directory exists
    await fs.mkdir(DOCS_DIR, { recursive: true });

    // Copy coverage report
    const coverageSrc = join(ROOT_DIR, 'coverage');
    const coverageDest = join(DOCS_DIR, 'coverage');
    console.log('  📊 Copying coverage report...');
    await copyDirectory(coverageSrc, coverageDest);
    console.log('  ✅ Coverage report copied');

    // Create test-results directory with index
    const testResultsDir = join(DOCS_DIR, 'test-results');
    await fs.mkdir(testResultsDir, { recursive: true });
    await fs.writeFile(join(testResultsDir, 'index.html'), createTestResultsIndex(), 'utf8');
    console.log('  ✅ Test results index created');

    console.log('✅ All test reports copied successfully');
  } catch (error) {
    console.error('❌ Error copying test reports:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] === __filename) {
  main();
}

export { copyDirectory };
