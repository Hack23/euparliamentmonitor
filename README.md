# EU Parliament Monitor

European Parliament Intelligence Platform - Monitor political activity with
systematic transparency

## Current Status

**MCP Server Integration**: The project is designed to use the
[European-Parliament-MCP-Server](https://github.com/Hack23/European-Parliament-MCP-Server)
for accessing real EU Parliament data.

- **MCP Server Status**: The MCP server is currently in development (skeleton
  implementation)
- **Fallback Mode**: News generation works with placeholder content when MCP
  server is unavailable
- **Environment Variable**: Set `USE_EP_MCP=false` to disable MCP client
  connection attempts

### When MCP Server is Ready

Once the European-Parliament-MCP-Server is fully implemented, the system will
automatically:

1. Connect to the MCP server for real-time EU Parliament data
2. Fetch plenary sessions, committee meetings, and documents
3. Generate articles with actual parliamentary information
4. Provide proper translation or content generation in each language

### Current Limitations

**Note**: The current implementation generates placeholder content in English
for all languages when MCP server is unavailable. To enable full functionality:

1. **Complete the MCP Server**: The European-Parliament-MCP-Server needs
   implementation of:
   - `get_plenary_sessions` tool
   - `search_documents` tool
   - `get_parliamentary_questions` tool
   - `get_committee_info` tool

2. **Install MCP Server**: Once ready, install the MCP server:

   ```bash
   npm install -g european-parliament-mcp-server
   # or clone and build locally
   ```

3. **Enable MCP Client**: The news generator will automatically connect when the
   server is available

EU Parliament Monitor is an automated news generation platform that monitors
European Parliament activities and generates multi-language news articles
covering:

- **Week Ahead**: Preview of upcoming parliamentary events and committee
  meetings
- **Committee Reports**: Analysis of committee activities and decisions
- **Propositions**: Government and parliamentary legislative proposals
- **Motions**: Parliamentary motions and resolutions
- **Breaking News**: Rapid-response coverage of significant developments

## Features

- 📰 **Automated News Generation**: Generate news articles about EU Parliament
  activities
- 🌍 **Multi-Language Support**: 14 languages including English, German, French,
  Spanish, Italian, and more
- 📅 **Week Ahead Coverage**: Preview upcoming parliamentary events
- 🤖 **GitHub Actions Integration**: Automated daily news generation
- 📊 **SEO Optimized**: Proper metadata, structured data, and sitemap generation
- ✅ **Code Quality**: ESLint, Prettier, and automated quality gates

## 🔒 Security Architecture

EU Parliament Monitor implements **security-by-design** with comprehensive
security controls and ISMS compliance.

### Security Documentation

- 📋 **[Security Architecture](SECURITY_ARCHITECTURE.md)** - Complete security
  implementation overview with C4 diagrams, threat model, and compliance mapping
- 🚀 **[Future Security Architecture](FUTURE_SECURITY_ARCHITECTURE.md)** -
  Security enhancement roadmap (2026-2027)
- 📊 **[Data Model](DATA_MODEL.md)** - Data structures and European Parliament
  API integration
- 📈 **[Security Flowcharts](FLOWCHART.md)** - Detailed process flows with
  security controls

### Security Posture

**Classification** (per
[ISMS Classification Framework](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md)):

- **Confidentiality**: Public (Level 1) - European Parliament open data
- **Integrity**: Medium (Level 2) - News accuracy critical for democratic
  transparency
- **Availability**: Medium (Level 2) - Daily updates expected, 24h RTO acceptable

**Key Security Controls**:

- ✅ **Minimal Attack Surface**: Static site, no databases, no server-side
  execution
- ✅ **Automated Security**: CodeQL SAST, Dependabot SCA, npm audit
- ✅ **Supply Chain Security**: SHA-pinned GitHub Actions, SBOM generation
- ✅ **Input Validation**: Multi-layer XSS prevention, HTML sanitization
- ✅ **Infrastructure Security**: GitHub-hosted ephemeral runners, HTTPS
  enforcement
- ✅ **Compliance**: ISO 27001, GDPR, NIS2, EU CRA aligned

**Security Metrics**:

- Zero known vulnerabilities (npm audit clean)
- 82%+ code coverage with security tests
- 100% dependency scanning coverage
- 0 CodeQL critical/high findings

### ISMS Alignment

This project follows
[Hack23 ISMS Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md):

- ✅ Security architecture documentation (C4 models with Mermaid)
- ✅ Threat modeling (STRIDE analysis)
- ✅ Security testing (SAST, SCA, unit tests)
- ✅ Compliance mapping (ISO 27001, GDPR, NIS2)

## 🤝 Community & Governance

EU Parliament Monitor is an open source project with transparent governance and community standards.

### Open Source Standards

- **[Contributing Guide](CONTRIBUTING.md)** - Development workflow, code standards, and contribution guidelines
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community standards based on Contributor Covenant 2.1
- **[Security Policy](SECURITY.md)** - Vulnerability disclosure and security practices
- **[Authors & Contributors](AUTHORS.md)** - Recognition of project contributors
- **[License](LICENSE)** - Apache License 2.0 full text

### Community Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community discussion
- **Security**: [security@hack23.com](mailto:security@hack23.com) for vulnerability reports
- **Conduct**: [conduct@hack23.com](mailto:conduct@hack23.com) for Code of Conduct issues

### Governance Compliance

This project adheres to:
- ✅ **OpenSSF Best Practices**: Following CII Best Practices criteria
- ✅ **ISMS Compliance**: Aligned with Hack23 ISMS policies
- ✅ **Transparent Development**: Public repository, open discussions
- ✅ **Security First**: Comprehensive security disclosure policy

## Code Quality & Testing

EU Parliament Monitor maintains high code quality standards with comprehensive
testing:

### Code Quality

- **ESLint**: Comprehensive linting with security, complexity, and documentation
  checks
- **Prettier**: Consistent code formatting across all JavaScript files
- **Pre-commit Hooks**: Automatic linting and formatting before every commit
- **CI/CD Quality Gates**: Automated checks on every pull request
- **JSDoc**: Complete documentation for all functions

**Code Standards**: See [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md) for
detailed coding guidelines.

### Testing Infrastructure

Comprehensive test suite with **Vitest** and **Playwright** covering all
functionality:

#### Unit & Integration Tests (Vitest)

- **Unit Tests**: Article generation, MCP client, index/sitemap generation
- **Integration Tests**: Full workflows, MCP integration, multi-language support
- **Coverage**: ≥80% line coverage, ≥75% branch coverage
- **Test Count**: 169+ tests covering critical paths

```bash
# Run unit & integration tests
npm test

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run with UI (browser interface)
npm run test:ui
```

#### End-to-End Tests (Playwright)

- **E2E Tests**: Complete user experience validation
- **Cross-Browser**: Chromium, Firefox, WebKit
- **Mobile Support**: Mobile Chrome, Mobile Safari
- **Accessibility**: WCAG 2.1 AA compliance with axe-core
- **Responsive Design**: Multiple viewport sizes
- **Test Count**: 60+ E2E tests covering user journeys

```bash
# Run E2E tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# View test report
npm run test:e2e:report
```

**Testing Documentation**:

- [test/README.md](test/README.md) - Unit & integration tests
- [e2e/README.md](e2e/README.md) - E2E testing guide

## Custom Agents

EU Parliament Monitor includes **8 specialized GitHub Copilot custom agents** to
streamline development:

- 🤖 **[product-task-agent](.github/agents/product-task-agent.md)** - Product
  specialist for issue creation and coordination
- 📰 **[news-journalist](.github/agents/news-journalist.md)** - The
  Economist-style European Parliament reporting
- 🎨 **[frontend-specialist](.github/agents/frontend-specialist.md)** -
  HTML5/CSS3/WCAG 2.1 AA UI/UX expert
- 🔄
  **[data-pipeline-specialist](.github/agents/data-pipeline-specialist.md)** -
  European Parliament MCP integration expert
- ⚙️ **[devops-engineer](.github/agents/devops-engineer.md)** - CI/CD and GitHub
  Actions automation
- 🔒 **[security-architect](.github/agents/security-architect.md)** - ISMS,
  GDPR, NIS2 compliance expert
- 📚 **[documentation-architect](.github/agents/documentation-architect.md)** -
  C4 models and architecture docs
- ✅ **[quality-engineer](.github/agents/quality-engineer.md)** - Testing,
  validation, and accessibility

**Usage Example**:

```bash
# Use product-task-agent to analyze repository and create improvement issues
@product-task-agent analyze the multi-language support and create issues for any gaps

# Use news-journalist to generate content
@news-journalist create a week-ahead article for the upcoming plenary session

# Use frontend-specialist for UI improvements
@frontend-specialist make the language switcher fully keyboard accessible
```

**Learn More**: See [Custom Agents Documentation](.github/agents/README.md) for
detailed agent capabilities, usage patterns, and examples.

## Languages Supported

- **EU Core**: English (en), German (de), French (fr), Spanish (es), Italian
  (it), Dutch (nl)
- **Nordic**: Swedish (sv), Danish (da), Finnish (fi)
- **Eastern Europe**: Polish (pl), Romanian (ro), Hungarian (hu)
- **Other**: Portuguese (pt), Greek (el)

## Installation

```bash
# Clone the repository
git clone https://github.com/Hack23/euparliamentmonitor.git
cd euparliamentmonitor

# Install dependencies
npm install
```

### Optional: European Parliament MCP Server

For real EU Parliament data integration, install the MCP server:

```bash
# Clone the MCP server repository
git clone https://github.com/Hack23/European-Parliament-MCP-Server.git
cd European-Parliament-MCP-Server

# Install dependencies and build
npm install
npm run build

# The server will be available at dist/index.js
# You can install it globally or reference the path
```

Configure the MCP server path in environment variables:

```bash
export EP_MCP_SERVER_PATH="/path/to/European-Parliament-MCP-Server/dist/index.js"
```

**Note**: The MCP server is currently in development. News generation works
without it using placeholder content.

## Usage

### Generate News Articles

```bash
# Generate week ahead article in English
npm run generate-news -- --types=week-ahead --languages=en

# Generate multiple article types in multiple languages
npm run generate-news -- --types=week-ahead,committee-reports --languages=en,de,fr

# Generate in all EU core languages
npm run generate-news -- --types=week-ahead --languages=eu-core

# Generate in all supported languages
npm run generate-news -- --types=week-ahead --languages=all
```

### Generate Indexes and Sitemap

```bash
# Generate language-specific index pages
npm run generate-news-indexes

# Generate sitemap.xml
npm run generate-sitemap
```

### Local Development

```bash
# Serve the site locally
npm run serve

# Open http://localhost:8080 in your browser
```

## Project Structure

```
euparliamentmonitor/
├── .github/
│   └── workflows/
│       └── news-generation.yml    # Automated news generation workflow
├── scripts/
│   ├── generate-news-enhanced.js   # Main news generation script
│   ├── generate-news-indexes.js    # Index page generator
│   ├── generate-sitemap.js         # Sitemap generator
│   └── article-template.js         # HTML template generator
├── news/                            # Generated news articles
│   └── metadata/                    # Generation metadata
├── styles.css                       # Article styling
├── index-{lang}.html               # Language-specific index pages
├── sitemap.xml                      # SEO sitemap
└── package.json                     # Project dependencies
```

## CI/CD & Automation

### GitHub Actions Workflows

The repository includes comprehensive GitHub Actions workflows for automation
and quality assurance:

#### 📰 News Generation

- **Schedule**: Runs daily at 06:00 UTC
- **Manual Trigger**: Can be triggered manually with custom parameters
- **Automatic Commit**: Commits and pushes generated articles automatically
- **Workflow**: `.github/workflows/news-generation.yml`

**Workflow Inputs:**

- `article_types`: Comma-separated list of article types (default: `week-ahead`)
- `languages`: Languages to generate (`en`, `eu-core`, `all`, or custom list)
- `force_generation`: Force generation even if recent articles exist

#### 🏷️ PR Labeling

- **Automatic**: Labels PRs based on file changes
- **Configuration**: `.github/labeler.yml`
- **Workflow**: `.github/workflows/labeler.yml`
- **Setup**: Run `.github/workflows/setup-labels.yml` once to create all labels

#### 📦 Release Management

- **Automated Release Notes**: Via Release Drafter
- **Semantic Versioning**: Based on PR labels
- **SBOM & Attestations**: Security compliance with artifact attestations
- **Workflow**: `.github/workflows/release.yml`
- **Configuration**: `.github/release-drafter.yml`

#### 🔒 Security Scanning

- **CodeQL**: Automated security analysis on push, PR, and weekly schedule
- **Dependabot**: Weekly dependency updates for npm and GitHub Actions
- **Vulnerability Scanning**: Automated npm audit in PR validation
- **Workflows**: `.github/workflows/codeql.yml`, `.github/dependabot.yml`

#### ✅ Test & Validation

- **HTML Validation**: Automated htmlhint checks
- **Functional Tests**: News generation, index, and sitemap validation
- **Security Checks**: npm audit for vulnerabilities
- **Workflow**: `.github/workflows/test-and-report.yml`

### Workflow Status Badges

[![News Generation](https://github.com/Hack23/euparliamentmonitor/actions/workflows/news-generation.yml/badge.svg)](https://github.com/Hack23/euparliamentmonitor/actions/workflows/news-generation.yml)
[![CodeQL](https://github.com/Hack23/euparliamentmonitor/actions/workflows/codeql.yml/badge.svg)](https://github.com/Hack23/euparliamentmonitor/actions/workflows/codeql.yml)
[![Test and Report](https://github.com/Hack23/euparliamentmonitor/actions/workflows/test-and-report.yml/badge.svg)](https://github.com/Hack23/euparliamentmonitor/actions/workflows/test-and-report.yml)

### Manual Release Process

To create a new release:

1. Go to **Actions** → **Release** workflow
2. Click **Run workflow**
3. Enter version (e.g., `v1.0.0`)
4. Select if pre-release
5. The workflow will:
   - Run validation and tests
   - Generate SBOM and attestations
   - Create GitHub release with artifacts
   - Update release notes automatically

### Setting Up Labels

First-time setup requires running the label creation workflow:

1. Go to **Actions** → **Setup Repository Labels**
2. Click **Run workflow**
3. Wait for completion
4. Labels will be automatically applied to future PRs

## Configuration

### Language Presets

- `en` - English only
- `eu-core` - English, German, French, Spanish, Italian, Dutch
- `nordic` - English, Swedish, Danish, Finnish
- `all` - All 14 supported languages

### Article Types

- `week-ahead` - Preview of upcoming parliamentary events
- `committee-reports` - Committee activity analysis (coming soon)
- `propositions` - Legislative proposals analysis (coming soon)
- `motions` - Parliamentary motions analysis (coming soon)
- `breaking` - Breaking news coverage (coming soon)

## Contributing

We welcome contributions from developers, journalists, translators, and security researchers!

### How to Contribute

Please read our comprehensive [Contributing Guide](CONTRIBUTING.md) for:
- Development workflow and setup instructions
- Code quality requirements and testing standards
- Pull request process and review guidelines
- Security best practices and ISMS compliance
- Multi-language contribution guidelines

### Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@hack23.com](mailto:conduct@hack23.com).

### Security

If you discover a security vulnerability, please follow our [Security Policy](SECURITY.md) for responsible disclosure. **Do not** report security issues through public GitHub issues.

### Contributors

See [AUTHORS.md](AUTHORS.md) for a list of contributors who have helped make this project possible.

## License

Copyright 2024-2026 Hack23 AB

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

See [LICENSE](LICENSE) file for full details.

## Credits

This project is based on the news generation implementation from
[Hack23/riksdagsmonitor](https://github.com/Hack23/riksdagsmonitor).

## Author

Hack23 AB - Intelligence Operations Team
