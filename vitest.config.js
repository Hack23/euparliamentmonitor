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
      reportsDirectory: './coverage',
      
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
        // Exclude type definitions
        'scripts/**/*.d.ts',
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
