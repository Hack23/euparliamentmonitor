#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/CopyTestReports
 * @description Copies test reports and coverage data to the docs/ directory
 * for inclusion in the documentation bundle. Generates comprehensive HTML
 * index pages for test results with links to all available reports.
 */
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { PROJECT_ROOT } from '../constants/config.js';
const DOCS_DIR = join(PROJECT_ROOT, 'docs');
const BUILDS_DIR = join(PROJECT_ROOT, 'builds');
const TEST_RESULTS_DIRNAME = 'test-results';
const INDEX_FILENAME = 'index.html';
const ESLINT_REPORT_BASE = 'eslint-report';
const E2E_PREFIX = 'e2e-';
const PLAYWRIGHT_REPORT_DIRNAME = 'playwright-report';
/**
 * Recursively copy directory
 *
 * @param src - Source directory
 * @param dest - Destination directory
 */
export async function copyDirectory(src, dest) {
    try {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = join(src, entry.name);
            const destPath = join(dest, entry.name);
            if (entry.isDirectory()) {
                await copyDirectory(srcPath, destPath);
            }
            else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    }
    catch (error) {
        const nodeError = error;
        if (nodeError.code === 'ENOENT') {
            console.warn(`  ⚠️  Source directory not found (skipped): ${src}`);
        }
        else {
            throw error;
        }
    }
}
/**
 * Copy a single file safely
 *
 * @param src - Source file path
 * @param dest - Destination file path
 * @returns Whether the copy succeeded
 */
async function copyFileSafe(src, dest) {
    try {
        await fs.copyFile(src, dest);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Check if a file or directory exists
 *
 * @param path - Path to check
 * @returns Whether the path exists
 */
async function pathExists(path) {
    try {
        await fs.access(path);
        return true;
    }
    catch {
        return false;
    }
}
/** Report file names within test-results directory */
const REPORT_FILES = {
    vitestHtml: join('html', INDEX_FILENAME),
    vitestJson: 'results.json',
    vitestJunit: 'junit.xml',
    e2eJson: `${E2E_PREFIX}results.json`,
    e2eJunit: `${E2E_PREFIX}junit.xml`,
    eslintHtml: `${ESLINT_REPORT_BASE}.html`,
    eslintJson: `${ESLINT_REPORT_BASE}.json`,
};
/**
 * Check which report files exist in the test-results directory
 *
 * @param testResultsDir - Path to test-results directory
 * @returns Map of report key to existence boolean
 */
async function checkReportFiles(testResultsDir) {
    const results = {};
    for (const [key, relativePath] of Object.entries(REPORT_FILES)) {
        results[key] = await pathExists(join(testResultsDir, relativePath));
    }
    return results;
}
/**
 * Parse vitest JSON results file for summary data
 *
 * @param filePath - Path to vitest results.json
 * @returns Summary or null if unavailable
 */
async function parseVitestSummary(filePath) {
    try {
        const raw = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(raw);
        const total = data.numTotalTests ?? 0;
        const passed = data.numPassedTests ?? 0;
        const failed = data.numFailedTests ?? 0;
        let duration = 0;
        if (Array.isArray(data.testResults)) {
            for (const r of data.testResults) {
                if (r.perfStats?.end && r.perfStats?.start) {
                    duration += r.perfStats.end - r.perfStats.start;
                }
            }
        }
        return { tests: total, passed, failed, duration: Math.round(duration) };
    }
    catch {
        return null;
    }
}
/**
 * Parse Playwright JSON results file for summary data
 *
 * @param filePath - Path to e2e-results.json
 * @returns Summary or null if unavailable
 */
async function parseE2eSummary(filePath) {
    try {
        const raw = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(raw);
        if (data.stats) {
            const passed = data.stats.expected ?? 0;
            const failed = data.stats.unexpected ?? 0;
            const flaky = data.stats.flaky ?? 0;
            return { tests: passed + failed + flaky, passed, failed };
        }
        return null;
    }
    catch {
        return null;
    }
}
/**
 * Gather report availability info for index generation
 *
 * @returns Object describing which reports are available
 */
async function gatherReportInfo() {
    const testResultsDir = join(DOCS_DIR, TEST_RESULTS_DIRNAME);
    const fileStatus = await checkReportFiles(testResultsDir);
    const info = {
        hasVitestHtml: fileStatus['vitestHtml'] ?? false,
        hasVitestJson: fileStatus['vitestJson'] ?? false,
        hasVitestJunit: fileStatus['vitestJunit'] ?? false,
        hasE2eJson: fileStatus['e2eJson'] ?? false,
        hasE2eJunit: fileStatus['e2eJunit'] ?? false,
        hasEslintHtml: fileStatus['eslintHtml'] ?? false,
        hasEslintJson: fileStatus['eslintJson'] ?? false,
        hasCoverage: await pathExists(join(DOCS_DIR, 'coverage', INDEX_FILENAME)),
        hasPlaywright: await pathExists(join(DOCS_DIR, PLAYWRIGHT_REPORT_DIRNAME, INDEX_FILENAME)),
        vitestSummary: null,
        e2eSummary: null,
    };
    if (info.hasVitestJson) {
        info.vitestSummary = await parseVitestSummary(join(testResultsDir, REPORT_FILES.vitestJson));
    }
    if (info.hasE2eJson) {
        info.e2eSummary = await parseE2eSummary(join(testResultsDir, REPORT_FILES.e2eJson));
    }
    return info;
}
/**
 * Build stat-card HTML for a test summary
 *
 * @param summary - Test summary data
 * @param isE2e - Whether this is an E2E summary
 * @returns HTML string for stat cards
 */
function buildStatCards(summary, isE2e) {
    const failedClass = summary.failed > 0 ? 'failed' : 'passed';
    const durationCard = summary.duration !== undefined
        ? `<div class="stat-card">
        <div class="stat-number">${(summary.duration / 1000).toFixed(1)}s</div>
        <div class="stat-label">Duration</div>
      </div>`
        : '';
    const totalLabel = isE2e ? 'Total E2E' : 'Total Tests';
    return `<div class="stat-card passed">
        <div class="stat-number">${summary.passed}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat-card ${failedClass}">
        <div class="stat-number">${summary.failed}</div>
        <div class="stat-label">Failed</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${summary.tests}</div>
        <div class="stat-label">${totalLabel}</div>
      </div>${durationCard}`;
}
/**
 * Create a comprehensive HTML index for test results
 *
 * @param info - Report availability information
 * @returns HTML content
 */
function createTestResultsIndex(info) {
    const currentDate = new Date().toISOString().split('T')[0] ?? '';
    const vitestStats = info.vitestSummary ? buildStatCards(info.vitestSummary, false) : '';
    const e2eStats = info.e2eSummary ? buildStatCards(info.e2eSummary, true) : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="EU Parliament Monitor - Comprehensive Test Results and Quality Reports">
  <title>Test Results - EU Parliament Monitor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }
    header {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      padding: 2.5rem 2rem;
      text-align: center;
    }
    h1 { font-size: 2.2rem; margin-bottom: 0.5rem; font-weight: 700; }
    .subtitle { font-size: 1.1rem; opacity: 0.9; }
    .last-updated { font-size: 0.85rem; opacity: 0.7; margin-top: 0.75rem; }
    main { padding: 2rem; }
    h2 { color: #1e3c72; font-size: 1.5rem; margin: 2rem 0 1rem; border-bottom: 2px solid #e9ecef; padding-bottom: 0.5rem; }
    .stats-grid {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 1rem 1.5rem;
      text-align: center;
      min-width: 100px;
      flex: 1;
    }
    .stat-card.passed { border-color: #28a745; background: #d4edda; }
    .stat-card.failed { border-color: #dc3545; background: #f8d7da; }
    .stat-number { font-size: 1.8rem; font-weight: 700; color: #1e3c72; }
    .stat-label { font-size: 0.85rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    .report-card {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 1.25rem;
      transition: all 0.3s ease;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    .report-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
      border-color: #667eea;
    }
    .report-card.unavailable {
      opacity: 0.5;
      pointer-events: none;
    }
    .report-card h3 { color: #1e3c72; font-size: 1.1rem; margin-bottom: 0.25rem; }
    .report-card .icon { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .report-card p { color: #666; font-size: 0.85rem; line-height: 1.4; }
    .badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }
    .badge-html { background: #667eea; color: white; }
    .badge-json { background: #28a745; color: white; }
    .badge-xml { background: #fd7e14; color: white; }
    .badge-vitest { background: #fcc72b; color: #333; }
    .badge-playwright { background: #2ead33; color: white; }
    .badge-eslint { background: #4b32c3; color: white; }
    footer {
      background: #f8f9fa;
      padding: 1.5rem 2rem;
      text-align: center;
      color: #666;
      border-top: 1px solid #e9ecef;
    }
    footer a { color: #667eea; text-decoration: none; }
    footer a:hover { text-decoration: underline; }
    @media (max-width: 768px) {
      body { padding: 1rem; }
      h1 { font-size: 1.8rem; }
      .reports-grid { grid-template-columns: 1fr; }
      .stats-grid { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Test Results &amp; Quality Reports</h1>
      <div class="subtitle">EU Parliament Monitor - Comprehensive Test Dashboard</div>
      <div class="last-updated">Generated: ${currentDate}</div>
    </header>

    <main>
      ${vitestStats ? `<h2>🧪 Unit &amp; Integration Tests (Vitest)</h2><div class="stats-grid">${vitestStats}</div>` : ''}

      ${e2eStats ? `<h2>🎭 End-to-End Tests (Playwright)</h2><div class="stats-grid">${e2eStats}</div>` : ''}

      <h2>📋 Interactive Reports</h2>
      <div class="reports-grid">
        <a href="html/index.html" class="report-card${info.hasVitestHtml ? '' : ' unavailable'}">
          <div class="icon">🧪</div>
          <h3>Vitest HTML Report</h3>
          <p>Interactive test explorer with detailed results for all unit and integration tests.</p>
          <span class="badge badge-vitest">Vitest</span>
          <span class="badge badge-html">HTML</span>
        </a>

        <a href="../coverage/index.html" class="report-card${info.hasCoverage ? '' : ' unavailable'}">
          <div class="icon">📊</div>
          <h3>Code Coverage Report</h3>
          <p>Line, branch, function, and statement coverage with per-file drill-down.</p>
          <span class="badge badge-vitest">Vitest V8</span>
          <span class="badge badge-html">HTML</span>
        </a>

        <a href="../playwright-report/index.html" class="report-card${info.hasPlaywright ? '' : ' unavailable'}">
          <div class="icon">🎭</div>
          <h3>Playwright E2E Report</h3>
          <p>End-to-end test results with screenshots, traces, and accessibility checks.</p>
          <span class="badge badge-playwright">Playwright</span>
          <span class="badge badge-html">HTML</span>
        </a>

        <a href="eslint-report.html" class="report-card${info.hasEslintHtml ? '' : ' unavailable'}">
          <div class="icon">🔍</div>
          <h3>ESLint Report</h3>
          <p>Static analysis results showing code quality issues, warnings, and style compliance.</p>
          <span class="badge badge-eslint">ESLint</span>
          <span class="badge badge-html">HTML</span>
        </a>
      </div>

      <h2>📁 Machine-Readable Reports</h2>
      <div class="reports-grid">
        <a href="results.json" class="report-card${info.hasVitestJson ? '' : ' unavailable'}">
          <div class="icon">📄</div>
          <h3>Vitest Results (JSON)</h3>
          <p>Machine-readable unit test results in JSON format for CI/CD integration.</p>
          <span class="badge badge-vitest">Vitest</span>
          <span class="badge badge-json">JSON</span>
        </a>

        <a href="junit.xml" class="report-card${info.hasVitestJunit ? '' : ' unavailable'}">
          <div class="icon">📄</div>
          <h3>Vitest Results (JUnit XML)</h3>
          <p>JUnit XML format for CI dashboard integration and test trend analysis.</p>
          <span class="badge badge-vitest">Vitest</span>
          <span class="badge badge-xml">XML</span>
        </a>

        <a href="e2e-results.json" class="report-card${info.hasE2eJson ? '' : ' unavailable'}">
          <div class="icon">📄</div>
          <h3>E2E Results (JSON)</h3>
          <p>Playwright end-to-end test results in JSON format with detailed timing data.</p>
          <span class="badge badge-playwright">Playwright</span>
          <span class="badge badge-json">JSON</span>
        </a>

        <a href="e2e-junit.xml" class="report-card${info.hasE2eJunit ? '' : ' unavailable'}">
          <div class="icon">📄</div>
          <h3>E2E Results (JUnit XML)</h3>
          <p>E2E test results in JUnit XML format for cross-platform CI integration.</p>
          <span class="badge badge-playwright">Playwright</span>
          <span class="badge badge-xml">XML</span>
        </a>

        <a href="eslint-report.json" class="report-card${info.hasEslintJson ? '' : ' unavailable'}">
          <div class="icon">📄</div>
          <h3>ESLint Report (JSON)</h3>
          <p>Detailed linting results in JSON format for automated quality gates.</p>
          <span class="badge badge-eslint">ESLint</span>
          <span class="badge badge-json">JSON</span>
        </a>
      </div>
    </main>

    <footer>
      <p><a href="../index.html">← Back to Documentation Index</a></p>
      <p style="margin-top: 0.5rem;">
        <strong>EU Parliament Monitor</strong> -
        European Parliament Intelligence Platform
      </p>
    </footer>
  </div>
</body>
</html>`;
}
/**
 * Main execution function
 */
async function main() {
    console.log('📋 Copying test reports to documentation directory...');
    try {
        await fs.mkdir(DOCS_DIR, { recursive: true });
        // 1. Copy coverage report (from vitest)
        const coverageSrc = join(BUILDS_DIR, 'coverage');
        const coverageDest = join(DOCS_DIR, 'coverage');
        console.log('  📊 Copying coverage report...');
        await copyDirectory(coverageSrc, coverageDest);
        console.log('  ✅ Coverage report copied');
        // 2. Copy API documentation (from typedoc)
        const apiSrc = join(BUILDS_DIR, 'api');
        const apiDest = join(DOCS_DIR, 'api');
        console.log('  📖 Copying API docs...');
        await copyDirectory(apiSrc, apiDest);
        console.log('  ✅ API docs copied');
        // 3. Copy Playwright E2E report
        const playwrightSrc = join(BUILDS_DIR, PLAYWRIGHT_REPORT_DIRNAME);
        const playwrightDest = join(DOCS_DIR, PLAYWRIGHT_REPORT_DIRNAME);
        console.log('  🎭 Copying Playwright report...');
        await copyDirectory(playwrightSrc, playwrightDest);
        console.log('  ✅ Playwright report copied');
        // 4. Copy test results directory (vitest HTML, JSON, JUnit, ESLint reports)
        const buildTestResultsDir = join(BUILDS_DIR, TEST_RESULTS_DIRNAME);
        const docsTestResultsDir = join(DOCS_DIR, TEST_RESULTS_DIRNAME);
        await fs.mkdir(docsTestResultsDir, { recursive: true });
        // 4a. Copy vitest HTML test report
        console.log('  🧪 Copying Vitest HTML report...');
        await copyDirectory(join(buildTestResultsDir, 'html'), join(docsTestResultsDir, 'html'));
        console.log('  ✅ Vitest HTML report copied');
        // 4b-4g. Copy individual report files
        const reportCopyTasks = [
            { file: REPORT_FILES.vitestJson, label: 'Vitest JSON results', icon: '📄' },
            { file: REPORT_FILES.vitestJunit, label: 'Vitest JUnit XML results', icon: '📄' },
            { file: REPORT_FILES.e2eJson, label: 'E2E JSON results', icon: '📄' },
            { file: REPORT_FILES.e2eJunit, label: 'E2E JUnit XML results', icon: '📄' },
            { file: REPORT_FILES.eslintHtml, label: 'ESLint HTML report', icon: '🔍' },
            { file: REPORT_FILES.eslintJson, label: 'ESLint JSON report', icon: '🔍' },
        ];
        for (const task of reportCopyTasks) {
            console.log(`  ${task.icon} Copying ${task.label}...`);
            if (await copyFileSafe(join(buildTestResultsDir, task.file), join(docsTestResultsDir, task.file))) {
                console.log(`  ✅ ${task.label} copied`);
            }
            else {
                console.warn(`  ⚠️  ${task.label} not found (skipped)`);
            }
        }
        // 5. Gather report info and generate comprehensive index
        console.log('  📊 Generating test results index...');
        const reportInfo = await gatherReportInfo();
        await fs.writeFile(join(docsTestResultsDir, INDEX_FILENAME), createTestResultsIndex(reportInfo), 'utf8');
        console.log('  ✅ Test results index generated');
        console.log('✅ All test reports copied successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('❌ Error copying test reports:', message);
        process.exit(1);
    }
}
// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    main();
}
//# sourceMappingURL=copy-test-reports.js.map