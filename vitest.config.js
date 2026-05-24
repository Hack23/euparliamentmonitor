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
        // Mermaid validator/fixer and asset optimisers are CLI tools invoked
        // from npm scripts / CI; no library exports to unit-test.
        'scripts/fix-mermaid-diagrams.js',
        'scripts/minify-assets.js',
        'scripts/optimize-css.js',
        'scripts/validate-mermaid-diagrams.js',
        // Exclude type definitions
        'scripts/**/*.d.ts',
        // Exclude TypeScript type-only stubs (interfaces/enums, no testable logic)
        'scripts/types/analysis.js',
        'scripts/types/common.js',
        'scripts/types/generation.js',
        'scripts/types/imf.js',
        'scripts/types/index.js',
        'scripts/types/intelligence.js',
        'scripts/types/languages.js',
        'scripts/types/mcp.js',
        'scripts/types/parliament.js',
        'scripts/types/political-risk.js',
        'scripts/types/political-threats.js',
        'scripts/types/quality.js',
        'scripts/types/significance.js',
        'scripts/types/visualization.js',
        'scripts/types/world-bank.js',
        // Exclude type-only subdirectory stubs (empty export {} compiled from TS interface files)
        'scripts/types/mcp/**',
        'scripts/types/article-strings/**',
        'scripts/types/visualization/**',
        // Exclude language string maps (pure data/config, 500+ arrow fns across 14 languages)
        'scripts/constants/language-articles.js',
        'scripts/constants/languages.js',
        // Split-out per-article language string modules (originally in
        // language-articles.js — same pure-data rationale). Some files
        // (breaking, swot, extended-horizons) contain large 14-language
        // factor-function maps not exercised by unit tests.
        'scripts/constants/articles/**',
        // Exclude barrel re-export entry points (no testable logic)
        'scripts/index.js',
        // Aggregator bounded-context barrels and type-only modules
        // (pure re-exports / interface definitions — no runtime logic)
        'scripts/aggregator/article-html.js',
        'scripts/aggregator/clean-artifact.js',
        'scripts/aggregator/artifacts/index.js',
        'scripts/aggregator/artifacts/types.js',
        'scripts/aggregator/cli/index.js',
        'scripts/aggregator/content/index.js',
        'scripts/aggregator/content/types.js',
        'scripts/aggregator/manifest/index.js',
        'scripts/aggregator/manifest/types.js',
        'scripts/aggregator/markdown/index.js',
        'scripts/aggregator/metadata/artifact-highlight.js',
        'scripts/aggregator/metadata/index.js',
        'scripts/aggregator/metadata/types.js',
        'scripts/aggregator/reader-guide/rows-types.js',
        'scripts/aggregator/reader-intelligence-guide.js',
        'scripts/aggregator/run/index.js',
        'scripts/aggregator/runs/index.js',
        'scripts/aggregator/slug/index.js',
        // Config bounded-context barrels and type-only modules
        'scripts/config/article-horizons.js',
        'scripts/config/horizons/types.js',
        'scripts/config/index.js',
        // Constants barrels and re-export shims (canonical location moved to
        // seo/, ui/, world-bank/ sub-modules; these shims preserve legacy paths)
        'scripts/constants/committee-indicator-map.js',
        'scripts/constants/language-ui.js',
        'scripts/constants/og-locales.js',
        'scripts/constants/seo/index.js',
        'scripts/constants/social-handles.js',
        'scripts/constants/ui/index.js',
        'scripts/constants/world-bank/committee-map-types.js',
        // Generator bounded-context barrels (political-intelligence and
        // sitemap entries were split into sub-modules; these are thin shims)
        'scripts/generators/political-intelligence-descriptions.js',
        'scripts/generators/political-intelligence.js',
        'scripts/generators/political-intelligence/**',
        'scripts/generators/shared/**',
        'scripts/generators/sitemap/index.js',
        // MCP bounded-context barrels (top-level re-export shims over sub-modules)
        'scripts/mcp/ep-mcp-client.js',
        'scripts/mcp/ep-open-data-client.js',
        'scripts/mcp/ep-open-data/types.js',
        'scripts/mcp/imf-mcp-client.js',
        'scripts/mcp/imf/types.js',
        'scripts/mcp/mcp-connection.js',
        // Utils type-only stubs
        'scripts/utils/intelligence/types.js',
        // Barrel re-export shims — thin wrappers that only re-export from sub-modules;
        // the sub-modules themselves are covered by unit tests.
        'scripts/templates/section-builders.js',
        'scripts/utils/file-utils.js',
        'scripts/utils/intelligence-index.js',
        // Workflows bounded-context barrels and type-only stubs
        'scripts/workflows/completeness-gate/index.js',
        'scripts/workflows/completeness-gate/types.js',
        'scripts/workflows/index.js',
        'scripts/workflows/infrastructure/index.js',
        'scripts/workflows/safe-outputs/index.js',
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
