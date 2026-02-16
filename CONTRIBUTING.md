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

- Never commit secrets or API keys
- Use `===` instead of `==`
- Avoid `eval()` and `new Function()`
- Validate all user inputs
- No SQL injection or XSS vulnerabilities

### Pre-commit Hooks

The project uses Husky and lint-staged to automatically:

1. Run ESLint with auto-fix on staged JavaScript files
2. Format staged files with Prettier
3. Validate HTML files with htmlhint

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
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
git commit -m "feat(news): add breaking news article type"
git commit -m "fix(mcp): handle connection timeout gracefully"
git commit -m "docs: update code standards documentation"
git commit -m "refactor(generator): reduce complexity in generateWeekAhead"
```

## Pull Request Process

### Before Submitting

1. **Run all quality checks**:

   ```bash
   npm run lint
   npm run format:check
   npm run htmlhint
   ```

2. **Test your changes**:

   ```bash
   # Generate news with your changes
   USE_EP_MCP=false npm run generate-news -- --types=week-ahead --languages=en

   # Verify output
   npm run generate-news-indexes
   npm run generate-sitemap
   ```

3. **Update documentation** if you've:
   - Added new features
   - Changed APIs or interfaces
   - Modified configuration

### PR Checklist

- [ ] Code follows the project's code standards
- [ ] All ESLint checks pass (0 errors)
- [ ] Code is formatted with Prettier
- [ ] All functions have JSDoc documentation
- [ ] No security vulnerabilities introduced
- [ ] Tests pass (if applicable)
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
├── news/                # Generated news articles
├── docs/                # Documentation
│   └── CODE_STANDARDS.md # Code quality standards
├── .husky/              # Pre-commit hooks
├── eslint.config.js     # ESLint configuration
├── .prettierrc.json     # Prettier configuration
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
