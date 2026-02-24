# Test Suite Documentation

Comprehensive testing infrastructure for EU Parliament Monitor project.

## Overview

This test suite provides unit and integration testing with high coverage
standards for all core functionality:

- **Article HTML generation** with multi-language support
- **MCP client** connection and data retrieval
- **News index generation** for all languages
- **Sitemap generation** with proper SEO
- **Full integration** workflows including MCP, multi-language, and news
  generation

## Test Structure

```
test/
├── unit/                      # Unit tests (isolated components)
│   ├── article-template.test.js
│   ├── ep-mcp-client.test.js
│   ├── generate-news-indexes.test.js
│   └── generate-sitemap.test.js
├── integration/               # Integration tests (full workflows)
│   ├── news-generation.test.js
│   ├── mcp-integration.test.js
│   └── multi-language.test.js
├── fixtures/                  # Test data and mock data
│   └── ep-data.js
├── helpers/                   # Test utilities and helpers
│   ├── test-utils.js
│   └── mock-mcp-server.js
├── setup.js                   # Global test setup
└── README.md                  # This file
```

## Running Tests

### Quick Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI (browser interface)
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### CI/CD Integration

Tests run automatically in GitHub Actions on:

- Every push to `main`
- Every pull request
- Manual workflow dispatch

## Test Categories

### Unit Tests

#### article-template.test.js

Tests for HTML article generation:

- ✅ Valid HTML structure (DOCTYPE, meta tags, semantic HTML)
- ✅ Multi-language support (14 languages)
- ✅ RTL support (Arabic, Hebrew)
- ✅ SEO optimization (Open Graph, Twitter Cards, Schema.org)
- ✅ Accessibility (ARIA, semantic tags)
- ✅ XSS prevention and security
- ✅ Date formatting and localization
- ✅ Article metadata and sources

**Coverage Goal**: 100% (critical security paths)

#### ep-mcp-client.test.js

Tests for European Parliament MCP client:

- ✅ Connection management and retry logic
- ✅ Message handling (JSON-RPC protocol)
- ✅ Request/response flow
- ✅ Tool operations (plenary sessions, documents, questions)
- ✅ Error handling and timeouts
- ✅ Singleton client management

**Coverage Goal**: 95% (complex async paths)

#### generate-news-indexes.test.js

Tests for index page generation:

- ✅ Article filename parsing (YYYY-MM-DD-slug-lang.html)
- ✅ Article grouping by language
- ✅ Date sorting (newest first)
- ✅ Slug formatting (title case)
- ✅ Index HTML generation for all languages
- ✅ Language-specific titles and descriptions
- ✅ File operations and filtering

**Coverage Goal**: 90%

#### generate-sitemap.test.js

Tests for sitemap.xml generation:

- ✅ Valid XML structure
- ✅ URL formatting (HTTPS, proper encoding)
- ✅ Priority and changefreq settings
- ✅ Date formatting (YYYY-MM-DD)
- ✅ All language indexes (14 URLs)
- ✅ News articles inclusion
- ✅ Performance with large datasets

**Coverage Goal**: 90%

### Integration Tests

#### news-generation.test.js

Full article generation workflow:

- ✅ End-to-end article creation
- ✅ File system operations (save, update)
- ✅ Multi-language article generation
- ✅ Metadata generation alongside articles
- ✅ Content validation (sections, dates, sources)
- ✅ Placeholder content mode (MCP unavailable)
- ✅ Error recovery and resilience
- ✅ Performance benchmarks (< 100ms per article)

**Coverage Goal**: 85%

#### mcp-integration.test.js

MCP server integration and data flow:

- ✅ MCP client connection (mock server)
- ✅ Data retrieval (sessions, questions, documents, MEPs)
- ✅ Article generation from MCP data
- ✅ Fallback mode handling
- ✅ Data transformation for articles
- ✅ Request tracking and history
- ✅ Error handling (malformed responses, timeouts)
- ✅ Concurrent request handling

**Coverage Goal**: 85%

#### multi-language.test.js

Multi-language functionality:

- ✅ All 14 languages support
- ✅ Language-specific labels (type, read time, navigation)
- ✅ Date formatting per locale
- ✅ Character encoding (special chars, diacritics)
- ✅ SEO per language (Open Graph locale, structured data)
- ✅ Index generation for all languages
- ✅ Sitemap with all language URLs
- ✅ Language consistency across article
- ✅ Performance across all languages

**Coverage Goal**: 80%

## Test Coverage Requirements

### Global Thresholds

- **Lines**: ≥80%
- **Functions**: ≥80%
- **Branches**: ≥75%
- **Statements**: ≥80%

### Coverage Scope

Coverage is measured for library modules only. CLI entry point scripts are
excluded from coverage thresholds as they:

- Have no exports (pure executables)
- Are tested via integration tests
- Are validated by functional tests in GitHub Actions (`test-and-report.yml`)

**Excluded from coverage**:

- `scripts/generate-news-enhanced.js` - News generation CLI
- `scripts/generate-news-indexes.js` - Index generation CLI
- `scripts/generate-sitemap.js` - Sitemap generation CLI

**Included in coverage** (library modules):

- `scripts/article-template.js` - HTML generation functions
- `scripts/ep-mcp-client.js` - MCP client library

### Critical Paths

Security-critical paths require ≥95% coverage:

- XSS prevention and input sanitization
- HTML generation and escaping
- MCP client error handling
- File operations and path validation

## Test Fixtures

### Mock EP Data (`test/fixtures/ep-data.js`)

Realistic mock data for testing:

- `mockPlenarySession` - Sample plenary session with agenda
- `mockParliamentaryQuestions` - Written and oral questions
- `mockDocuments` - Legislative proposals and reports
- `mockMEPs` - Member information
- `mockCommitteeMeeting` - Committee session data
- `mockArticleMetadata` - Article configuration
- `mockArticleContent` - Sample HTML content
- `mockSources` - External reference links

## Test Helpers

### test-utils.js

Common utilities:

- `createTempDir()` - Create temporary test directory
- `cleanupTempDir()` - Clean up after tests
- `validateHTML()` - Validate HTML structure
- `extractHTMLMetadata()` - Parse HTML metadata
- `containsXSSVulnerability()` - Check for XSS issues
- `mockConsole()` - Capture console output
- `wait()` - Async delay helper
- `isValidDate()` - Date validation

### mock-mcp-server.js

Mock MCP server for testing:

- `MockMCPServer` class - Full mock implementation
- `createMockMCPClient()` - Factory function
- Simulates all MCP tool operations
- Configurable failures for error testing
- Request tracking and history

## Writing Tests

### Test Structure (AAA Pattern)

```javascript
describe('Feature Name', () => {
  // Setup
  beforeEach(() => {
    // Arrange: Prepare test data and environment
  });

  // Teardown
  afterEach(() => {
    // Cleanup: Remove temp files, restore mocks
  });

  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      // Arrange: Set up test data
      const input = {
        /* test data */
      };

      // Act: Execute the code being tested
      const result = functionToTest(input);

      // Assert: Verify expected outcomes
      expect(result).toBe(expected);
    });
  });
});
```

### Best Practices

1. **Test Independence**: Each test should run independently
2. **Clear Names**: Use descriptive test names explaining what is tested
3. **Single Assertion**: Focus each test on one aspect
4. **Mock External Dependencies**: Use mocks for MCP, filesystem, etc.
5. **Test Edge Cases**: Cover boundary conditions and errors
6. **Fast Execution**: Keep unit tests < 1s, integration tests < 10s
7. **No Flaky Tests**: Ensure tests are deterministic

### Example: Unit Test

```javascript
import { describe, it, expect } from 'vitest';
import { generateArticleHTML } from '../../scripts/article-template.js';

describe('generateArticleHTML', () => {
  it('should generate valid HTML with all meta tags', () => {
    // Arrange
    const options = {
      slug: 'test-article',
      title: 'Test Article',
      subtitle: 'Test subtitle',
      date: '2025-01-15',
      type: 'prospective',
      readTime: 5,
      lang: 'en',
      content: '<p>Content</p>',
    };

    // Act
    const html = generateArticleHTML(options);

    // Assert
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<meta charset="UTF-8">');
    expect(html).toContain(`<title>${options.title}`);
  });
});
```

### Example: Integration Test

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import { createTempDir, cleanupTempDir } from '../helpers/test-utils.js';

describe('News Generation Flow', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it('should generate and save article to filesystem', () => {
    // Arrange
    const newsDir = path.join(tempDir, 'news');
    fs.mkdirSync(newsDir, { recursive: true });

    // Act
    const html = generateArticleHTML(options);
    const filepath = path.join(newsDir, 'article.html');
    fs.writeFileSync(filepath, html, 'utf-8');

    // Assert
    expect(fs.existsSync(filepath)).toBe(true);
    const content = fs.readFileSync(filepath, 'utf-8');
    expect(content).toBe(html);
  });
});
```

## Debugging Tests

### Running Single Test File

```bash
npx vitest test/unit/article-template.test.js
```

### Running Single Test

```bash
npx vitest -t "should generate valid HTML"
```

### Watch Mode with Filter

```bash
npx vitest watch test/unit/
```

### Debug with Chrome DevTools

```bash
npm run test:ui
# Opens browser interface at http://localhost:51204/__vitest__/
```

## Coverage Reports

### Viewing Coverage

After running `npm run test:coverage`:

```bash
# View in terminal
# Coverage summary is displayed automatically

# View HTML report
open coverage/index.html

# View LCOV report (for CI tools)
cat coverage/lcov.info
```

### Coverage Badges

Coverage results are exported to:

- `coverage/coverage-summary.json` - JSON summary
- `coverage/lcov.info` - LCOV format (for Codecov)
- `coverage/index.html` - Interactive HTML report

## Continuous Integration

### GitHub Actions Workflow

Tests run automatically in `.github/workflows/test-and-report.yml`:

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npm test
    - run: npm run test:coverage
    - uses: codecov/codecov-action@v4 # Upload coverage
```

### Quality Gates

All PRs must pass:

- ✅ All tests passing
- ✅ Coverage thresholds met (80%+ lines, 75%+ branches)
- ✅ No ESLint errors
- ✅ Code formatted with Prettier

## Troubleshooting

### Tests Failing Locally

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vitest cache
npx vitest --clearCache

# Run tests with verbose output
npx vitest --reporter=verbose
```

### Coverage Not Generated

```bash
# Ensure coverage is installed
npm install --save-dev @vitest/coverage-v8

# Run with coverage explicitly
npx vitest run --coverage
```

### Mock Server Issues

```bash
# Check if mock server is properly initialized
# Add debug logging in test:
console.log('Mock server connected:', mcpClient.connected);
```

## Contributing

When adding new features:

1. **Write tests first** (TDD approach)
2. **Ensure coverage** meets thresholds
3. **Update this README** if adding new test categories
4. **Run full test suite** before submitting PR

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://vitest.dev/guide/best-practices)
- [Code Coverage Guide](https://vitest.dev/guide/coverage)
- [EU Parliament Monitor Code Standards](../docs/CODE_STANDARDS.md)

---

**Last Updated**: January 2025  
**Test Framework**: Vitest 4.0+  
**Coverage Tool**: v8  
**Total Tests**: 169+  
**Current Coverage**: 80%+ (target met)
