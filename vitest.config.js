/**
 * Vitest Configuration
 * @see https://vitest.dev/config/
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Enable globals (describe, it, expect, etc.)
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './builds/coverage',
      
      // Coverage thresholds
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      
      // Files to include in coverage - cover compiled JS from TypeScript
      include: ['scripts/**/*.js'],
      
      // Files to exclude from coverage
      exclude: [
        'node_modules/',
        'test/',
        'coverage/',
        '*.config.js',
        'eslint.config.js',
        // Exclude CLI entry point scripts (tested via integration tests)
        'scripts/generators/news-indexes.js',
        'scripts/generators/sitemap.js',
        // One-shot migration / pre-flight CLIs (library logic is covered via imports; CLI code paths are tested via integration runs)
        'scripts/utils/migrate-legacy-articles.js',
        'scripts/utils/validate-ep-api.js',
        // Exclude documentation generation scripts (utility scripts)
        'scripts/utils/generate-docs-index.js',
        'scripts/utils/copy-test-reports.js',
        // CLI-only tooling — exercised end-to-end via spawnSync from tests
        // (which doesn't propagate v8 coverage), or invoked from CI workflows
        // (copy-vendor / lint-prompts have no library surface to unit-test).
        'scripts/copy-vendor.js',
        'scripts/lint-prompts.js',
        'scripts/validate-analysis-completeness.js',
        // Exclude type definitions
        'scripts/**/*.d.ts',
        // Exclude TypeScript type-only stubs (interfaces/enums, no testable logic)
        'scripts/types/analysis.js',
        'scripts/types/generation.js',
        'scripts/types/imf.js',
        'scripts/types/index.js',
        'scripts/types/intelligence.js',
        'scripts/types/mcp.js',
        'scripts/types/parliament.js',
        'scripts/types/political-risk.js',
        'scripts/types/political-threats.js',
        'scripts/types/quality.js',
        'scripts/types/significance.js',
        'scripts/types/visualization.js',
        'scripts/types/world-bank.js',
        // Exclude language string maps (pure data/config, 500+ arrow fns across 14 languages)
        'scripts/constants/language-articles.js',
        'scripts/constants/languages.js',
        // Exclude barrel re-export entry points (no testable logic)
        'scripts/index.js',
      ],
    },
    
    // Test files pattern
    include: ['test/**/*.test.js'],
    
    // Test timeout
    testTimeout: 10000,
    
    // Setup files
    setupFiles: ['./test/setup.js'],
    
    // Mock reset
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    
    // Reporters - verbose for terminal, html for interactive report, json for machine-readable, junit for CI
    reporters: [
      'verbose',
      ['html', { outputFile: './builds/test-results/html/index.html' }],
      ['json', { outputFile: './builds/test-results/results.json' }],
      ['junit', { outputFile: './builds/test-results/junit.xml' }],
    ],
  },
});
