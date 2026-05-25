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
      
      // Coverage thresholds — raised from 80/80/75/80 per issue #1600.
      // Target: lines ≥92, branches ≥84 once all test-spine tests land.
      // Current intermediate targets (above measured baseline):
      thresholds: {
        lines: 88,
        functions: 88,
        branches: 78,
        statements: 88,
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
        // Pre-flight CLIs (library logic is covered via imports; CLI code paths are tested via integration runs)
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
        // Legacy-article HTML normaliser and responsive image generator are
        // CLI scripts run during the S3 deploy pipeline; their library logic
        // is verified end-to-end via spawnSync from unit tests, which doesn't
        // propagate v8 coverage to the parent process.
        'scripts/normalize-legacy-articles.js',
        'scripts/generate-responsive-images.js',
        // Mermaid diagram CLI scripts — exercised via spawnSync (v8 coverage
        // not propagated to parent process).
        'scripts/fix-mermaid-diagrams.js',
        'scripts/validate-mermaid-diagrams.js',
        // Asset optimization CLI scripts (run during deploy pipeline)
        'scripts/minify-assets.js',
        'scripts/optimize-css.js',
        // Exclude type definitions
        'scripts/**/*.d.ts',
        // Exclude all type-only modules (interfaces/enums, no testable logic)
        'scripts/types/**',
        // Exclude all barrel re-export index files (pure re-exports, no logic)
        'scripts/**/index.js',
        // Exclude all types.js modules (pure interface/enum definitions)
        'scripts/**/types.js',
        // Exclude language string maps (pure data/config, 500+ arrow fns across 14 languages)
        'scripts/constants/language-articles.js',
        'scripts/constants/languages.js',
        // Split-out per-article language string modules (originally in
        // language-articles.js — same pure-data rationale). Some files
        // (breaking, swot, extended-horizons) contain large 14-language
        // factor-function maps not exercised by unit tests.
        'scripts/constants/articles/**',
        // Constant data modules (pure lookups, no branching logic)
        'scripts/constants/seo/**',
        'scripts/constants/ui/**',
        'scripts/constants/world-bank/**',
        'scripts/constants/committee-indicator-map.js',
        'scripts/constants/language-ui.js',
        'scripts/constants/og-locales.js',
        'scripts/constants/social-handles.js',
        // Config modules (pure data/registry declarations)
        'scripts/config/**',
        // Aggregator bounded-context modules with no testable logic
        'scripts/aggregator/clean-artifact.js',
        'scripts/aggregator/article-html.js',
        'scripts/aggregator/reader-intelligence-guide.js',
        'scripts/aggregator/reader-guide-constants.js',
        // Reader-guide rows-types (pure type stub)
        'scripts/aggregator/reader-guide/rows-types.js',
        // Generator barrel re-exports and descriptions submodules
        'scripts/generators/political-intelligence.js',
        'scripts/generators/political-intelligence-descriptions.js',
        'scripts/generators/political-intelligence/copy.js',
        'scripts/generators/political-intelligence/copy/types.js',
        'scripts/generators/political-intelligence/descriptions/**',
        // MCP client entry-point barrels / wrappers. These are mostly thin
        // `export * from` modules; `ep-mcp-client.js` also includes side-effect
        // mixin imports that wire tool methods onto the client prototype.
        'scripts/mcp/ep-mcp-client.js',
        'scripts/mcp/ep-open-data-client.js',
        'scripts/mcp/imf-mcp-client.js',
        'scripts/mcp/mcp-connection.js',
        // MCP transport connection (tested via integration tests;
        // spawnSync doesn't propagate v8 coverage)
        'scripts/mcp/transport/connection.js',
        // Template section-builders (tested via HTML integration output)
        'scripts/templates/section-builders.js',
        // Utility stubs with no testable exports
        'scripts/utils/file-utils.js',
        'scripts/utils/intelligence-index.js',
        // Pure CLI entry-point with no exports — cannot be imported for testing
        'scripts/generators/build-info.js',
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
