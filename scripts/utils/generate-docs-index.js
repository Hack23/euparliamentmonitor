#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/GenerateDocsIndex
 * @description Creates an index.html page in the docs/ directory that links to all
 * generated documentation and test reports.
 */
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { PROJECT_ROOT } from '../constants/config.js';
const DOCS_DIR = join(PROJECT_ROOT, 'docs');
/**
 * Generate the documentation index HTML
 *
 * @returns HTML content for the documentation index
 */
export function generateIndexHTML() {
    const currentDate = new Date().toISOString().split('T')[0];
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="EU Parliament Monitor - Technical Documentation">
  <title>EU Parliament Monitor - Documentation</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
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
      padding: 3rem 2rem;
      text-align: center;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    
    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 1rem;
    }
    
    .last-updated {
      font-size: 0.9rem;
      opacity: 0.8;
      margin-top: 1rem;
    }
    
    main {
      padding: 3rem 2rem;
    }
    
    .intro {
      font-size: 1.1rem;
      color: #555;
      margin-bottom: 2rem;
      line-height: 1.8;
      text-align: center;
    }
    
    .docs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    
    .doc-card {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    
    .doc-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      border-color: #667eea;
    }
    
    .doc-card h2 {
      color: #1e3c72;
      font-size: 1.4rem;
      margin-bottom: 0.5rem;
    }
    
    .doc-card .icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .doc-card p {
      color: #666;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    
    .badge {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }
    
    footer {
      background: #f8f9fa;
      padding: 2rem;
      text-align: center;
      color: #666;
      border-top: 1px solid #e9ecef;
    }
    
    footer a {
      color: #667eea;
      text-decoration: none;
    }
    
    footer a:hover {
      text-decoration: underline;
    }
    
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      .docs-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📚 EU Parliament Monitor</h1>
      <div class="subtitle">Technical Documentation & Reports</div>
      <div class="last-updated">Last Updated: ${currentDate}</div>
    </header>
    
    <main>
      <div class="intro">
        This documentation hub provides comprehensive technical information,
        test reports, and API documentation for the EU Parliament Monitor project.
      </div>
      
      <div class="docs-grid">
        <a href="api/index.html" class="doc-card">
          <div class="icon">📖</div>
          <h2>API Documentation</h2>
          <p>Complete JSDoc-generated API documentation for all modules, functions, and classes.</p>
          <span class="badge">JSDoc</span>
        </a>
        
        <a href="coverage/index.html" class="doc-card">
          <div class="icon">📊</div>
          <h2>Code Coverage</h2>
          <p>Interactive coverage report showing test coverage metrics for the entire codebase.</p>
          <span class="badge">Vitest</span>
        </a>
        
        <a href="test-results/index.html" class="doc-card">
          <div class="icon">✅</div>
          <h2>Unit Test Results</h2>
          <p>Detailed unit and integration test results with pass/fail status and execution times.</p>
          <span class="badge">Vitest</span>
        </a>
        
        <a href="../playwright-report/index.html" class="doc-card">
          <div class="icon">🎭</div>
          <h2>E2E Test Report</h2>
          <p>End-to-end test results from Playwright covering user workflows and accessibility.</p>
          <span class="badge">Playwright</span>
        </a>
        
        <a href="../README.md" class="doc-card">
          <div class="icon">📄</div>
          <h2>README</h2>
          <p>Project overview, installation instructions, usage guide, and contribution guidelines.</p>
          <span class="badge">Markdown</span>
        </a>
        
        <a href="../SECURITY_ARCHITECTURE.md" class="doc-card">
          <div class="icon">🔒</div>
          <h2>Security Architecture</h2>
          <p>Comprehensive security documentation including threat model and compliance mapping.</p>
          <span class="badge">ISMS</span>
        </a>
      </div>
    </main>
    
    <footer>
      <p>
        <strong>EU Parliament Monitor</strong> - 
        European Parliament Intelligence Platform<br>
        <a href="https://github.com/Hack23/euparliamentmonitor" target="_blank">
          View on GitHub
        </a>
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
    console.log('📚 Generating documentation index...');
    try {
        await fs.mkdir(DOCS_DIR, { recursive: true });
        const indexHTML = generateIndexHTML();
        const indexPath = join(DOCS_DIR, 'index.html');
        await fs.writeFile(indexPath, indexHTML, 'utf8');
        console.log(`✅ Documentation index generated: ${indexPath}`);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('❌ Error generating documentation index:', message);
        process.exit(1);
    }
}
// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    main();
}
//# sourceMappingURL=generate-docs-index.js.map