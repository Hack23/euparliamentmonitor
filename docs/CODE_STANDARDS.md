# Code Standards

This document outlines the code quality standards and best practices for the EU
Parliament Monitor project.

## Table of Contents

- [Overview](#overview)
- [Linting](#linting)
- [Code Formatting](#code-formatting)
- [JSDoc Documentation](#jsdoc-documentation)
- [Complexity Guidelines](#complexity-guidelines)
- [Security Standards](#security-standards)
- [Pre-commit Hooks](#pre-commit-hooks)

## Overview

The EU Parliament Monitor project maintains high code quality standards through
automated tooling and best practices. All code must pass linting, formatting,
and documentation checks before being merged.

## Linting

We use **ESLint** with multiple plugins to enforce code quality:

### Installed Plugins

- `@eslint/js` - ESLint recommended rules
- `eslint-plugin-security` - Security vulnerability detection
- `eslint-plugin-sonarjs` - Code smell and complexity detection
- `eslint-plugin-jsdoc` - JSDoc documentation validation

### Running ESLint

```bash
# Check for issues
npm run lint

# Auto-fix issues where possible
npm run lint:fix

# Generate JSON report
npm run lint:report
```

### Key Rules

#### Best Practices

- **`eqeqeq`**: Always use `===` and `!==` instead of `==` and `!=`
- **`prefer-const`**: Use `const` for variables that are never reassigned
- **`no-eval`**: Never use `eval()` or `new Function()`
- **`require-await`**: Async functions must use `await`

#### Security

- **`security/detect-unsafe-regex`**: Prevent ReDoS vulnerabilities (ERROR)
- **`security/detect-eval-with-expression`**: Prevent eval-like code (ERROR)
- **`security/detect-object-injection`**: Warn about potential object injection
  (WARNING - false positives acceptable for safe code)

#### Code Smells

- **`sonarjs/cognitive-complexity`**: Max complexity of 15 per function
- **`sonarjs/no-duplicate-string`**: Max 3 occurrences of same string literal
- **`sonarjs/no-identical-functions`**: Prevent duplicate function
  implementations
- **`sonarjs/prefer-immediate-return`**: Return directly instead of storing in
  variable

## Code Formatting

We use **Prettier** for consistent code formatting:

### Configuration

- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always required
- **Trailing Commas**: ES5 style
- **Line Ending**: LF (Unix style)

### Running Prettier

```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

## JSDoc Documentation

All exported functions must have complete JSDoc documentation.

### Required Tags

- `@param` - Every parameter with type, name, and description
- `@returns` - Return value with type and description
- `@throws` - Any exceptions that may be thrown

### Example

```javascript
/**
 * Generate complete HTML for a news article
 * @param {object} options - Article options
 * @param {string} options.title - Article title
 * @returns {string} Complete HTML document
 */
export function generateArticleHTML(options) {
  // implementation
}
```

## Complexity Guidelines

### Cognitive Complexity

**Maximum: 15 per function**

#### Reducing Complexity

1. **Extract methods**: Break large functions into smaller ones
2. **Use early returns**: Exit early instead of nesting
3. **Strategy pattern**: Use objects/maps instead of large switch statements
4. **Guard clauses**: Validate inputs at the start

## Security Standards

### Prohibited Patterns

1. **`eval()` and `new Function()`**: Never use dynamic code evaluation
2. **Unsafe regex**: Avoid catastrophic backtracking patterns
3. **Hardcoded secrets**: Never commit credentials or API keys

## Pre-commit Hooks

We use **Husky** and **lint-staged** to enforce quality gates before commits.

### Automatic Checks

On every commit, the following are automatically run on staged files:

1. **ESLint** with auto-fix
2. **Prettier** formatting
3. **htmlhint** for HTML files

## CI/CD Quality Gates

All pull requests must pass these checks:

1. **ESLint**: Zero errors (warnings acceptable)
2. **Prettier**: All code must be formatted
3. **HTML validation**: Pass htmlhint checks
4. **npm audit**: No high/critical vulnerabilities

## Quality Gates — Test Coverage & Agentic Workflows

### Coverage Thresholds (`vitest.config.js`)

| Metric | Threshold | Target |
|--------|:---------:|:------:|
| Lines | ≥ 88% | 92% |
| Functions | ≥ 88% | 92% |
| Branches | ≥ 78% | 84% |
| Statements | ≥ 88% | 92% |

### Agentic Workflow Lint Rules (`scripts/lint-prompts.js`)

Every `news-*.md` gh-aw workflow must pass the following structural assertions:

1. **Single-PR rule**: `safeoutputs___create_pull_request` appears at most once
   (`news-translate.md` exempt).
2. **Forbidden phrases**: No `checkpoint pr`, `keep-alive`, `keepalive`,
   `heartbeat`, `progressive safe output`, or references to purged modules.
3. **No push_repo_memory**: `safeoutputs___push_repo_memory` is banned
   (`news-translate.md` exempt).
4. **Analysis-awareness**: Must reference the analysis guide + completeness
   gate anchors, or import `.github/agents/news-generation.agent.md`.
5. **Canonical imports**: Must import `.github/agents/news-generation.agent.md`
   AND `shared/mcp/news-mcp-servers.md` in canonical order
   (`news-translate.md` exempt).

### Stage A→E Discipline

All article-generating workflows follow the fixed stage order:

| Stage | Purpose | Budget (standard slugs) |
|-------|---------|:-----------------------:|
| **A** | Data collection (EP MCP + IMF) | ≤ 5 min |
| **B** | Analysis (Pass 1 + Pass 2) | ≤ 22 min |
| **C** | Completeness gate | ≤ 4 min |
| **D** | Deterministic article render | ≤ 2 min |
| **E** | Single-PR safe-output | ≤ 2 min |

**Source of truth**: `src/config/article-horizons.ts` (per-slug budgets).

### Mandatory 2-Pass Improvement

- **Pass 1** (~60% of Stage B time): Write all mandatory artifacts
- **Pass 2** (~40% of Stage B time): Read-back every file, expand shallow
  sections, add evidence citations, fill placeholders, verify IMF data

---

**Last Updated**: 2026-05-03 **Version**: 2.0.0
