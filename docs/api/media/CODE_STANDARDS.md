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

---

**Last Updated**: 2026-02-16 **Version**: 1.0.0
