# Contributing to EU Parliament Monitor

Thank you for your interest in contributing to EU Parliament Monitor! This
document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Quality Requirements](#code-quality-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and
inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/euparliamentmonitor.git
   cd euparliamentmonitor
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running Locally

```bash
# Generate news articles (with MCP disabled for testing)
USE_EP_MCP=false npm run generate-news -- --types=week-ahead --languages=en

# Generate index pages
npm run generate-news-indexes

# Generate sitemap
npm run generate-sitemap

# Serve locally
npm run serve
```

### Code Quality Checks

Before committing, run these checks:

```bash
# Lint your code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format your code
npm run format

# Check formatting
npm run format:check

# Validate HTML
npm run htmlhint
```

## Code Quality Requirements

All contributions must meet these quality standards:

### Testing Requirements

All contributions must include appropriate tests:

#### Unit & Integration Tests (Vitest)

- **Unit Tests**: Write unit tests for new functions and modules
- **Integration Tests**: Add integration tests for new workflows
- **Coverage**: Maintain ≥80% line coverage, ≥75% branch coverage
- **Test Quality**: Follow AAA pattern (Arrange, Act, Assert)
- **No Flaky Tests**: Ensure tests are deterministic and reliable

```bash
# Run unit & integration tests
npm test

# Check coverage
npm run test:coverage

# Run specific test file
npx vitest test/unit/your-test.test.js
```

#### End-to-End Tests (Playwright)

- **E2E Tests**: Add E2E tests for user-facing features
- **Accessibility**: Ensure WCAG 2.1 AA compliance
- **Responsive Design**: Test on mobile and desktop viewports
- **Cross-Browser**: Tests run on Chromium, Firefox, and WebKit

```bash
# Run E2E tests
npm run test:e2e

# Run with UI (interactive debugging)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

**When to add E2E tests:**

- New user-facing features (navigation, forms, etc.)
- Changes to page structure or layout
- Multi-language functionality changes
- Accessibility improvements
- Responsive design changes

**Required for all code changes:**

- New functions must have unit tests
- New features must have integration tests
- User-facing features should have E2E tests
- All tests must pass before PR submission
- Coverage thresholds must be met

### ESLint

- **Zero errors** required (warnings are acceptable for false positives)
- All functions must have complete JSDoc documentation
- Code complexity must be ≤15 (cognitive complexity)
- No security vulnerabilities (eval, unsafe regex, etc.)

### Prettier

- All JavaScript files must be formatted with Prettier
- Use the project's `.prettierrc.json` configuration
- 100 character line width
- Single quotes for strings

### JSDoc Documentation

All exported functions must include:

```javascript
/**
 * Brief function description
 * @param {type} paramName - Parameter description
 * @returns {type} Return value description
 */
```

### Security

**Security Architecture**: All security changes must align with the
[Security Architecture](SECURITY_ARCHITECTURE.md) and
[ISMS Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md).

**Security Requirements**:

- Never commit secrets or API keys
- Use `===` instead of `==`
- Avoid `eval()` and `new Function()`
- Validate all user inputs (see [Security Controls](SECURITY_ARCHITECTURE.md#-security-controls))
- Prevent XSS vulnerabilities (multi-layer defense: validation, sanitization, encoding, CSP)
- No SQL injection risks (static site, no databases)
- Test security-critical paths (≥95% coverage)
- Follow threat model mitigations (see [Threat Model](SECURITY_ARCHITECTURE.md#-threat-model))

**Security Review Checklist**:

- [ ] Input validation implemented for all external data
- [ ] HTML sanitization applied (script tags, event handlers removed)
- [ ] Output encoding used (HTML entity encoding)
- [ ] No new dependencies without security scanning (npm audit)
- [ ] Security tests added for new attack surfaces
- [ ] Documentation updated (SECURITY_ARCHITECTURE.md if applicable)
- [ ] Threat model reviewed for new threats

**Security Testing**:

```bash
# Run security audit
npm audit

# Run security-focused tests
npm run test:unit -- --grep="security|xss|injection|sanitize"

# Check for vulnerable dependencies
npm audit --audit-level=moderate
```

### Pre-commit Hooks

The project uses Husky and lint-staged to automatically:

1. Run ESLint with auto-fix on staged JavaScript files
2. Format staged files with Prettier
3. Validate HTML files with htmlhint
4. Run affected tests (if configured)

These hooks run automatically on `git commit`. To bypass (not recommended):

```bash
git commit --no-verify
```

## Commit Guidelines

### Commit Message Format

Use conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests (use this for test-related commits!)
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
git commit -m "feat(news): add breaking news article type"
git commit -m "fix(mcp): handle connection timeout gracefully"
git commit -m "docs: update code standards documentation"
git commit -m "refactor(generator): reduce complexity in generateWeekAhead"
git commit -m "test: add unit tests for article template"
git commit -m "test: increase coverage for MCP client"
```

## Pull Request Process

### Before Submitting

1. **Run all quality checks**:

   ```bash
   npm run lint
   npm run format:check
   npm run htmlhint
   npm test
   npm run test:e2e
   ```

2. **Check test coverage**:

   ```bash
   npm run test:coverage
   # Ensure coverage thresholds are met
   # Lines: ≥80%, Branches: ≥75%
   ```

3. **Test your changes**:

   ```bash
   # Generate news with your changes
   USE_EP_MCP=false npm run generate-news -- --types=week-ahead --languages=en

   # Verify output
   npm run generate-news-indexes
   npm run generate-sitemap

   # Test E2E (if UI changes)
   npm run test:e2e:headed
   ```

4. **Update documentation** if you've:
   - Added new features
   - Changed APIs or interfaces
   - Modified configuration
   - Added new test files (update test/README.md or e2e/README.md)

### PR Checklist

- [ ] Code follows the project's code standards
- [ ] All ESLint checks pass (0 errors)
- [ ] Code is formatted with Prettier
- [ ] All functions have JSDoc documentation
- [ ] **All unit & integration tests pass (npm test)**
- [ ] **E2E tests pass (npm run test:e2e)** (if UI changes)
- [ ] **Test coverage meets thresholds (≥80% lines, ≥75% branches)**
- [ ] **New code has corresponding tests**
- [ ] No security vulnerabilities introduced
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventional commits format

### PR Description

Include in your PR description:

1. **What**: Brief description of the change
2. **Why**: Reason for the change
3. **How**: Technical approach used
4. **Testing**: How you tested the changes
5. **Screenshots**: For UI changes

### CI/CD Checks

Your PR must pass these automated checks:

- ✅ ESLint (zero errors)
- ✅ Prettier formatting
- ✅ HTML validation
- ✅ JavaScript syntax check
- ✅ **Unit tests**
- ✅ **Integration tests**
- ✅ **E2E tests** (runs daily and on PRs)
- ✅ **Coverage thresholds (80%/75%)**
- ✅ Security audit (npm audit)
- ✅ Functional tests

### Review Process

1. Automated checks must pass
2. At least one maintainer review required
3. All review comments must be addressed
4. PR will be merged by a maintainer

## Project Structure

```
euparliamentmonitor/
├── .github/              # GitHub workflows and configuration
│   ├── workflows/        # CI/CD workflows
│   └── agents/          # Custom GitHub Copilot agents
├── scripts/             # Core application scripts
│   ├── generate-news-enhanced.js      # News generation
│   ├── generate-news-indexes.js       # Index generation
│   ├── generate-sitemap.js            # Sitemap generation
│   ├── article-template.js            # HTML templates
│   └── ep-mcp-client.js              # MCP client
├── test/                # Unit & integration tests
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   ├── fixtures/        # Test data
│   └── helpers/         # Test utilities
├── e2e/                 # End-to-end tests
│   ├── tests/           # E2E test files
│   └── README.md        # E2E testing guide
├── news/                # Generated news articles
├── docs/                # Documentation
│   └── CODE_STANDARDS.md # Code quality standards
├── .husky/              # Pre-commit hooks
├── eslint.config.js     # ESLint configuration
├── .prettierrc.json     # Prettier configuration
├── playwright.config.js # Playwright E2E configuration
└── package.json         # Dependencies and scripts
```

## Development Tips

### Custom Agents

EU Parliament Monitor includes 8 specialized GitHub Copilot agents:

- `@product-task-agent` - Issue creation and coordination
- `@news-journalist` - Content generation
- `@frontend-specialist` - UI/UX improvements
- `@data-pipeline-specialist` - MCP integration
- `@devops-engineer` - CI/CD automation
- `@security-architect` - Security compliance
- `@documentation-architect` - Documentation
- `@quality-engineer` - Testing and validation

See [.github/agents/README.md](.github/agents/README.md) for usage.

### Debugging

```bash
# Enable verbose logging
DEBUG=* npm run generate-news

# Generate with placeholder content (no MCP)
USE_EP_MCP=false npm run generate-news
```

### IDE Setup

**VS Code Extensions**:

- ESLint
- Prettier
- HTMLHint

**VS Code Settings**:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Questions?

- Open an issue for bugs or feature requests
- Check [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md) for code guidelines
- Review existing code for examples
- Contact maintainers via GitHub

## License

By contributing, you agree that your contributions will be licensed under the
Apache-2.0 License.

---

**Thank you for contributing to EU Parliament Monitor!** 🇪🇺
