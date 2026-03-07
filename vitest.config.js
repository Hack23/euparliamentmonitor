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
        'scripts/generators/news-enhanced.js',
        'scripts/generators/news-indexes.js',
        'scripts/generators/sitemap.js',
        // Exclude documentation generation scripts (utility scripts)
        'scripts/utils/generate-docs-index.js',
        'scripts/utils/copy-test-reports.js',
        // Exclude CLI validation script (runs at module level, no unit test surface)
        'scripts/utils/validate-articles.js',
        // Exclude type definitions
        'scripts/**/*.d.ts',
        // Exclude TypeScript type-only stubs (interfaces/enums, no testable logic)
        'scripts/types/generation.js',
        'scripts/types/index.js',
        'scripts/types/mcp.js',
        'scripts/types/parliament.js',
        'scripts/types/visualization.js',
        'scripts/types/world-bank.js',
        // Exclude language string maps (pure data/config, 500+ arrow fns across 14 languages)
        'scripts/constants/language-articles.js',
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
    
    // Reporters
    reporters: ['verbose'],
  },
});
