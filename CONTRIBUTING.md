<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🤝 Contributing to EU Parliament Monitor</h1>

<p align="center">
  <strong>Code · Tests · Docs · Translations · Political Intelligence · Security</strong><br>
  <em>🇪🇺 Civic-tech for European democracy · 🛡️ Security-by-design · 🌍 14 languages · ♿ WCAG 2.1 AA</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.2-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-success?style=for-the-badge" alt="Classification"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--27-2E7D32?style=for-the-badge" alt="Effective"/></a>
</p>

<p align="center">
  <a href="https://github.com/Hack23/euparliamentmonitor/blob/main/CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/💜_Code_of_Conduct-Contributor_Covenant_2.1-7B1FA2?style=for-the-badge" alt="Code of Conduct"/></a>
  <a href="https://github.com/Hack23/euparliamentmonitor/blob/main/SECURITY.md"><img src="https://img.shields.io/badge/🛡️_Security-Policy-D32F2F?style=for-the-badge" alt="Security Policy"/></a>
  <a href="https://github.com/Hack23/ISMS-PUBLIC"><img src="https://img.shields.io/badge/🏛️_Hack23-ISMS--PUBLIC-7B1FA2?style=for-the-badge" alt="Hack23 ISMS"/></a>
  <a href="https://www.bestpractices.dev/projects/12068"><img src="https://www.bestpractices.dev/projects/12068/badge" alt="OpenSSF Best Practices"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.2 | **📅 Last Updated:** 2026-04-27 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-07-27 | **🏷️ Classification:** Public

---

Thank you for your interest in contributing to **[EU Parliament Monitor](https://euparliamentmonitor.com)** — the open-source European Parliament political-intelligence platform that publishes AI-generated, evidence-based analysis in 14 languages every day. We welcome contributions from **developers, journalists, translators, political scientists, OSINT analysts, accessibility advocates, and security researchers**.

## 📑 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Who Should Contribute](#-who-should-contribute)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Code Quality Requirements](#-code-quality-requirements)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Project Structure](#-project-structure)
- [Custom Agents](#-custom-agents)
- [ISMS Compliance](#%EF%B8%8F-isms-compliance--security-policy-alignment)
- [Hack23 Ecosystem](#-hack23-ecosystem)

## 💜 Code of Conduct

This project adheres to the [Contributor Covenant 2.1](CODE_OF_CONDUCT.md). By participating, you agree to maintain a respectful and inclusive environment. Report unacceptable behaviour to [conduct@hack23.com](mailto:conduct@hack23.com).

## 👥 Who Should Contribute

| 🎭 Role | 🎯 What you can do |
|---|---|
| 👨‍💻 **Developers** | TypeScript aggregator, MCP integrations, GitHub Actions, accessibility, performance |
| 📰 **Journalists** | Editorial style review, political analysis quality, source attribution discipline |
| 🌐 **Translators** | Improve any of the 14 languages (EN, SV, DA, NO, FI, DE, FR, ES, NL, AR, HE, JA, KO, ZH) |
| 🧠 **Political scientists / OSINT analysts** | Methodologies under [`analysis/methodologies/`](analysis/methodologies/), threat-framework refinement, ACH/SWOT/PESTLE rigor |
| ♿ **Accessibility advocates** | WCAG 2.1 AA audits, RTL improvements (Arabic, Hebrew), screen-reader testing |
| 🛡️ **Security researchers** | Responsible disclosure via [SECURITY.md](SECURITY.md) — see also [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) and [THREAT_MODEL.md](THREAT_MODEL.md) |
| 📚 **Doc authors** | Architecture docs ([ARCHITECTURE.md](ARCHITECTURE.md)), C4 diagrams, ADRs, runbooks |

## 🚀 Getting Started

### 📋 Prerequisites

- 🟢 **Node.js** ≥ 25 (the platform runtime — see [`package.json`](package.json) `engines.node`)
- 📦 **npm** ≥ 10 (ships with Node.js 25)
- 🔧 **Git**

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

## 🛠️ Development Workflow

### ▶️ Running Locally

```bash
# Render an article from analysis artifacts (manual testing)
npm run generate-article -- --run analysis/daily/2025-01-01/week-ahead

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

## ✅ Code Quality Requirements

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

## 📝 Commit Guidelines

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

## 🔀 Pull Request Process

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
   # Render an article from analysis (if applicable)
   npm run generate-article -- --run analysis/daily/YYYY-MM-DD/week-ahead

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

## 📂 Project Structure

```
euparliamentmonitor/
├── .github/              # GitHub workflows and configuration
│   ├── workflows/        # CI/CD workflows + agentic workflows (news-*.md)
│   └── agents/          # Custom GitHub Copilot agents
├── scripts/             # Compiled JavaScript from src/
│   ├── aggregator/      # Article generation aggregator
│   ├── generators/      # Index & sitemap generators
│   └── mcp/             # MCP clients
├── src/                 # TypeScript source
│   ├── aggregator/      # Analysis aggregation + article rendering
│   ├── generators/      # Sitemap, indexes, political intelligence
│   ├── mcp/             # MCP client implementations
│   ├── utils/           # Utilities (file, metadata, sanitize)
│   ├── types/           # TypeScript type definitions
│   └── constants/       # Configuration constants
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

## 🤖 Custom Agents

EU Parliament Monitor ships with a **layered agent catalog** under [`.github/agents/`](.github/agents/) — product-domain agents that own the news critical path, plus infrastructure agents that maintain workflow and CI hygiene. See [`.github/agents/README.md`](.github/agents/README.md) for the full directory and the [`.github/skills/`](.github/skills/) and [`.github/prompts/`](.github/prompts/) libraries that they share.

### 🎭 Product-domain agents (own the news critical path)

| Agent | Role |
|---|---|
| 🕵️ `@intelligence-operative` | Senior political-intelligence analyst — applies ACH, SWOT, PESTLE, OSINT tradecraft, threat framework. Owns Stage-B analysis artifacts. |
| 📰 `@news-journalist` | The Economist-style EP reporting in 14 languages. Authors editorial prose only when analysis artifacts are signed off. |
| 🔄 `@data-pipeline-specialist` | EP MCP integration (60+ tools), data quality, voting-records fallback to EP Open Data Portal. |
| 🎨 `@frontend-specialist` | HTML5/CSS3, WCAG 2.1 AA accessibility, multi-language UI, RTL support. |
| ✅ `@quality-engineer` | Vitest + Playwright, HTML validation, accessibility testing, performance benchmarking. |
| ⚙️ `@devops-engineer` | gh-aw workflow compilation, GitHub Actions, S3/CloudFront deploy, MCP gateway. |
| 📚 `@documentation-architect` | C4 models, Mermaid diagrams, ARCHITECTURE.md, ADRs. |
| 🛡️ `@security-architect` | ISMS, GDPR, NIS2, EU CRA compliance — reviews data classification of intelligence products. |
| 📋 `@product-task-agent` | Issue creation, ISMS tracking, capability-roadmap coordination. |
| 📣 `@marketing-specialist` | Privacy-first multi-language engagement, GDPR-compliant outreach. |
| 💼 `@business-development-specialist` | Strategic planning, civic-tech partnerships, sustainable transparency models. |

### 🛠️ Infrastructure agents (maintain workflows and CI hygiene)

`agentic-workflows.agent.md` · `news-generation.agent.md` · `ci-cleaner.agent.md` · `contribution-checker.agent.md` · `create-safe-output-type.agent.md` · `custom-engine-implementation.agent.md` · `grumpy-reviewer.agent.md` · `interactive-agent-designer.agent.md` · `technical-doc-writer.agent.md` · `w3c-specification-writer.agent.md`

## 🐛 Debugging

```bash
# View TypeScript compilation
npm run build:check

# Test article generation (requires existing analysis artifacts)
npm run generate-article -- --run analysis/daily/YYYY-MM-DD/article-type
```

## 🧩 Adding a new analysis template

Analysis templates live under [`analysis/templates/`](analysis/templates/README.md). Every template is the AI's contract for one artifact under `analysis/daily/<date>/<run>/…`. To add a new template:

1. **Pick the artifact name** — it must match the `analysis/daily/<run>/…` filename you want the AI to produce (e.g. `risk-cascade.md`).
2. **Add the methodology section** — open [`analysis/methodologies/per-artifact-methodologies.md`](analysis/methodologies/per-artifact-methodologies.md) and add a `### risk-cascade` section describing construction rules, required H2s, and quality signals.
3. **Add the catalog row** — append a row to [`analysis/methodologies/artifact-catalog.md`](analysis/methodologies/artifact-catalog.md) under the right group (intelligence / classification / risk-scoring / threat-assessment / extended) so the script can resolve methodology + Mermaid type.
4. **Add the depth floor** — add a key under each relevant `articleType` in [`analysis/methodologies/reference-quality-thresholds.json`](analysis/methodologies/reference-quality-thresholds.json) (the breaking floor is the one printed in the front-matter).
5. **Drop the template** — create `analysis/templates/risk-cascade.md` with the SPDX header pair, your title, and at least one section. The body can be minimal at first.
6. **Run the sync** — `npm run sync:templates`. The script injects the canonical `ANALYSIS-TEMPLATE-FRONTMATTER:v1` and `AI-INSTRUCTIONS:v1` blocks. Re-run with `--check` for CI.
7. **Reference the template** — link to it from at least one prompt under `.github/prompts/` or one agent under `.github/agents/` (otherwise [`test/unit/analysis-templates-referenced.test.js`](test/unit/analysis-templates-referenced.test.js) fails).
8. **Run the drift-guard** — `npx vitest run test/unit/template-structure.test.js`.

Shared chunks live in [`analysis/templates/_partials/`](analysis/templates/_partials/README.md) — link to them from your template instead of duplicating the citation pattern, evidence table, IMF callout, or quality checklist.

## 💻 IDE Setup

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

## ❓ Questions?

- Open an issue for bugs or feature requests
- Check [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md) for code guidelines
- Review existing code for examples
- Contact maintainers via GitHub

## 🏆 Security Badge Maintenance

### Contributing to Badge Status

When contributing, be aware of how your changes may affect security badges:

#### OpenSSF Scorecard

Your PR may affect the scorecard if it:
- Modifies GitHub Actions workflows
- Adds/removes dependencies
- Changes branch protection settings
- Adds security scanning tools

**Best Practices:**
- Pin all GitHub Actions to SHA hashes (not tags)
- Use maintained, official actions when possible
- Add security tests for new attack surfaces
- Keep dependencies up-to-date

#### REUSE Compliance

All new files must include proper license headers or be covered by `.reuse/dep5`:

**For JavaScript files:**
```javascript
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
```

**For configuration files:**
Add entries to `.reuse/dep5` following existing patterns

#### Test Coverage

New code must maintain ≥80% line coverage, ≥75% branch coverage:
- Add unit tests for new functions
- Add integration tests for new workflows
- Add E2E tests for user-facing features

#### SonarCloud Quality Gate

When SonarCloud is enabled, PRs will be checked for:
- Code coverage (target: 80%)
- Code smells and technical debt
- Security vulnerabilities
- Maintainability rating (target: A)

See [README.md - Badge Maintenance](README.md#badge-maintenance) for detailed badge status and procedures.

## 🛡️ ISMS Compliance & Security-Policy Alignment

EU Parliament Monitor operates under the [Hack23 ISMS](https://github.com/Hack23/ISMS-PUBLIC) framework. **All contributions must align with these public policies** — both in code (Secure Development Policy) and in conduct (Acceptable Use Policy).

| 🏛️ Policy | 🎯 Why it applies | 📌 What you must do |
|---|---|---|
| [🛠️ **Secure Development Policy**](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) | All code changes go through SSDLC gates | Threat-model new pipelines; pin actions to SHAs; no eval/dynamic code |
| [📋 **Information Security Policy**](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) | Integrity of analysis + confidentiality of methodology notes | Cite primary EP / IMF / World Bank sources; never leak credentials |
| [🤖 **AI Policy**](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md) | Analysis is AI-assisted and must be auditable | Apply Pass-1 + Pass-2 review; disclose assumptions and uncertainty |
| [🏷️ **Classification Policy**](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md) | Only **public** open-source material is used | No paywalled, leaked, or embargoed material in artifacts |
| [🐛 **Vulnerability Management**](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) | Severity-based remediation SLAs | Follow the [SECURITY.md](SECURITY.md) disclosure timeline |
| [🔍 **Threat Modelling Policy**](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md) | New attack surfaces require STRIDE analysis | Update [THREAT_MODEL.md](THREAT_MODEL.md) for changes that touch CIA assets |
| [🔐 **Cryptography Policy**](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md) | No deprecated algorithms (MD5, SHA-1, DES, 3DES) | Use modern crypto only; rely on platform / OIDC primitives |
| [🚒 **Incident Response Plan**](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md) | Coordinated handling of security incidents | Notify [security@hack23.com](mailto:security@hack23.com) for any suspected incident |
| [📜 **Open Source Policy**](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) | Governance, licence headers, REUSE compliance | Apache-2.0 SPDX headers on every new code file |
| [🇪🇺 **CRA Conformity Assessment**](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CRA_Conformity_Assessment_Process.md) | EU Cyber Resilience Act compliance | See [CRA-ASSESSMENT.md](CRA-ASSESSMENT.md) for the project conformity table |

### 📚 Internal docs every contributor should know

| Topic | Document |
|---|---|
| 🏛️ **Architecture** | [ARCHITECTURE.md](ARCHITECTURE.md) · [DATA_MODEL.md](DATA_MODEL.md) · [FLOWCHART.md](FLOWCHART.md) · [STATEDIAGRAM.md](STATEDIAGRAM.md) · [MINDMAP.md](MINDMAP.md) |
| 📰 **Article generation** | [Article-Generation.md](Article-Generation.md) — full Stage A→E pipeline |
| 🧠 **Analysis methodology** | [analysis/methodologies/](analysis/methodologies/) (17 methodologies) · [analysis/templates/](analysis/templates/) (51 templates) |
| 🛡️ **Security** | [SECURITY.md](SECURITY.md) · [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) · [THREAT_MODEL.md](THREAT_MODEL.md) · [CRA-ASSESSMENT.md](CRA-ASSESSMENT.md) · [CLASSIFICATION.md](CLASSIFICATION.md) |
| ⚙️ **CI/CD** | [WORKFLOWS.md](WORKFLOWS.md) · [.github/workflows/README.md](.github/workflows/README.md) · [.github/prompts/README.md](.github/prompts/README.md) |
| 🧪 **Testing** | [UnitTestPlan.md](UnitTestPlan.md) · [E2ETestPlan.md](E2ETestPlan.md) · [test/README.md](test/README.md) · [e2e/README.md](e2e/README.md) |
| 💼 **Business / lifecycle** | [SWOT.md](SWOT.md) · [BCPPlan.md](BCPPlan.md) · [End-of-Life-Strategy.md](End-of-Life-Strategy.md) · [FinancialSecurityPlan.md](FinancialSecurityPlan.md) |

---

## 🌐 Hack23 Ecosystem

EU Parliament Monitor is part of the broader **[Hack23](https://hack23.com/)** civic-tech and security portfolio. Cross-pollination is welcome — many architectural patterns and ISMS controls are shared.

| 🏛️ Project | 🎯 Focus | 🔗 Link |
|---|---|---|
| 🌐 **Hack23 Homepage** | Organisation site, ISMS hub | [hack23.com](https://hack23.com/) · [`Hack23/homepage`](https://github.com/Hack23/homepage) |
| 📜 **ISMS-PUBLIC** | Public ISO 27001 / NIST CSF / CIS / GDPR / NIS2 / EU CRA policies | [`Hack23/ISMS-PUBLIC`](https://github.com/Hack23/ISMS-PUBLIC) |
| 🔌 **European Parliament MCP Server** | TypeScript MCP server with 60+ EP open-data tools | [`Hack23/European-Parliament-MCP-Server`](https://github.com/Hack23/European-Parliament-MCP-Server) |
| 🇸🇪 **Riksdag Monitor** | Swedish Parliament monitor (sister project, foundation for this codebase) | [`Hack23/riksdagsmonitor`](https://github.com/Hack23/riksdagsmonitor) |
| 🕵️ **CIA** | Swedish Parliament intelligence platform (Java/Spring) | [`Hack23/cia`](https://github.com/Hack23/cia) |
| ✅ **CIA Compliance Manager** | CIA-triad compliance dashboard (TypeScript) | [`Hack23/cia-compliance-manager`](https://github.com/Hack23/cia-compliance-manager) |
| 🥋 **Black Trigram** | Korean martial-arts game with security focus | [`Hack23/blacktrigram`](https://github.com/Hack23/blacktrigram) |

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [**Apache License 2.0**](LICENSE) — the same licence that covers the rest of the project. All new code files must include SPDX headers:

```javascript
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
```

Configuration files without headers must be covered by entries in [`.reuse/dep5`](.reuse/dep5).

---

🙏 **Thank you for contributing to EU Parliament Monitor!** 🇪🇺

> _Maintained by **Hack23 AB — Intelligence Operations Team** under the [Hack23 ISMS](https://github.com/Hack23/ISMS-PUBLIC) framework._
