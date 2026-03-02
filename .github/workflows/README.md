# GitHub Workflows Documentation

This directory contains GitHub Actions workflows for the EU Parliament Monitor project. All workflows follow Hack23 security standards with pinned action versions and harden-runner integration.

## Workflows Overview

### 🏗️ Infrastructure & Setup

#### `copilot-setup-steps.yml`
**Purpose**: Environment setup for GitHub Copilot operations

**Trigger**: 
- Workflow dispatch (manual)
- Push to `.github/workflows/copilot-setup-steps.yml`
- PR to `.github/workflows/copilot-setup-steps.yml`

**What it does**:
- Sets up Node.js 24
- Installs MCP server packages globally
- Configures Xvfb for browser-based operations
- Installs Playwright browsers
- Verifies MCP server installations

**Security**: Read-only permissions by default, escalated only when needed

---

### 📰 News Generation (Agentic Workflows)

The project uses **8 agentic workflow markdown files** (`.md`) that are compiled to `.lock.yml` files. Each workflow generates a specific type of EU Parliament news article using the European Parliament MCP server as the primary data source, with optional World Bank MCP enrichment for economic context.

#### `news-article-generator.md`
**Purpose**: Manual dispatch workflow to generate any combination of article types

**Trigger**: Workflow dispatch (manual)

**Inputs**:
- `article_types`: Comma-separated article types (default: `committee-reports,propositions,motions`)
- `languages`: Languages to generate (default: `all`)
- `force_generation`: Force generation even if recent articles exist (default: `false`)

**What it does**:
1. Establishes date context with `date -u` command
2. Queries European Parliament MCP server for data
3. Optionally enriches with World Bank economic indicators
4. Generates articles using `npx tsx src/generators/news-enhanced.ts`
5. Creates PR with generated article HTML files

**Timeout**: 120 minutes

---

#### `news-committee-reports.md`
**Purpose**: Generates EU Parliament committee reports analysis articles

**Trigger**: Scheduled daily at 04:00 UTC (Mon-Fri), workflow dispatch

**What it does**: Analyzes activity across 20 EU standing committees (ENVI, ECON, AFET, LIBE, AGRI, etc.)

**Timeout**: 60 minutes

---

#### `news-week-ahead.md`
**Purpose**: Generates week-ahead prospective articles previewing upcoming parliamentary week

**Trigger**: Scheduled Fridays at 07:00 UTC, workflow dispatch

**Timeout**: 60 minutes

---

#### `news-weekly-review.md`
**Purpose**: Generates weekly review retrospective articles analyzing past 7 days

**Trigger**: Scheduled Saturdays at 09:00 UTC, workflow dispatch

**Timeout**: 60 minutes

---

#### `news-month-ahead.md`
**Purpose**: Generates strategic month-ahead outlook articles with World Bank economic context

**Trigger**: Scheduled 1st of each month at 08:00 UTC, workflow dispatch

**Timeout**: 60 minutes

---

#### `news-monthly-review.md`
**Purpose**: Generates monthly review retrospective articles with World Bank economic context

**Trigger**: Scheduled 28th of each month at 10:00 UTC, workflow dispatch

**Timeout**: 60 minutes

---

#### `news-motions.md`
**Purpose**: Generates motions and resolutions analysis with voting records and party dynamics

**Trigger**: Scheduled daily at 06:00 UTC (Mon-Fri), workflow dispatch

**Timeout**: 60 minutes

---

#### `news-propositions.md`
**Purpose**: Generates legislative propositions analysis with World Bank economic context

**Trigger**: Scheduled daily at 05:00 UTC (Mon-Fri), workflow dispatch

**Timeout**: 60 minutes

---

**Common features across all news workflows**:
- Uses `european-parliament-mcp-server@1.0.1` as primary data source
- Mandatory date context establishment via `date -u` command
- Supports 14 languages: en, sv, da, no, fi, de, fr, es, nl, ar, he, ja, ko, zh
- HTML validation and quality checks before PR creation
- Never commits generated files (sitemap, rss, index files)
- Uses `safeoutputs___create_pull_request` for PR creation

**Security**: Read-only permissions by default, MCP data only from official EU Parliament sources

---

### 🏷️ Labeling & PR Automation

#### `labeler.yml`
**Purpose**: Automatically label PRs based on file changes

**Trigger**: 
- `pull_request_target` events (opened, synchronize, reopened, edited)

**What it does**:
1. Checks if required labels exist
2. Applies labels based on `.github/labeler.yml` configuration
3. Provides guidance if labels are missing

**Configuration**: `.github/labeler.yml` - defines label patterns

**Security**: 
- Uses `pull_request_target` for secure token access
- Harden-runner with egress audit
- Minimal permissions (read contents, write PRs)

**Labels Categories**:
- Features & Enhancements
- News & Content
- Multi-language
- UI/UX
- Infrastructure
- Code Quality
- Security
- Documentation
- Dependencies
- Testing
- Custom Agents

#### `setup-labels.yml`
**Purpose**: One-time workflow to create all repository labels

**Trigger**: Workflow dispatch (manual)

**Inputs**:
- `recreate_all`: Delete existing labels and recreate (default: `false`)

**What it does**:
1. Creates or updates all project labels
2. Sets consistent colors and descriptions
3. Verifies labeler configuration
4. Validates key labels exist

**Usage**: Run once when setting up the repository, or when adding new labels

**Security**: Issues and PRs write permission for label management

---

### 📦 Release Management

#### `release.yml`
**Purpose**: Automated release creation with SBOM and attestations

**Trigger**: 
- Workflow dispatch (manual)
- Push to tags matching `v*`

**Inputs**:
- `version`: Version to release (vX.Y.Z format)
- `prerelease`: Is this a pre-release? (default: `false`)

**Jobs**:
1. **Prepare**: Version management, validation, tagging
2. **Build**: Create release artifacts, generate SBOM, create attestations
3. **Release**: Draft release notes, create GitHub release

**Artifacts**:
- `euparliamentmonitor-{version}.zip` - Full project archive
- `euparliamentmonitor-{version}.spdx.json` - SBOM
- `*.intoto.jsonl` - Build and SBOM attestations

**Security**:
- SLSA Build Level 3 compliance via attestations
- SBOM generation with Anchore
- Pinned action versions
- Minimal permissions per job

**Configuration**: `.github/release-drafter.yml` - release notes template

#### `release-drafter.yml` (Configuration)
**Purpose**: Automated release notes generation

**Categories**:
- 🚀 New Features
- 🌍 EU Parliament Integration
- 🌐 Multi-language Support
- 🎨 UI/UX Improvements
- 🏗️ Infrastructure & Performance
- 🔄 Code Quality & Refactoring
- 🔒 Security & Compliance
- 📝 Documentation
- 📦 Dependencies
- 🐛 Bug Fixes
- 🧪 Test Coverage Improvements
- 🤖 Custom Agent Updates
- ⚙️ Component Updates

**Version Resolution**:
- `major`: Breaking changes
- `minor`: Features, enhancements, new integrations
- `patch`: Bugs, security, dependencies, docs (default)

---

### 🔒 Security & Compliance

#### `codeql.yml`
**Purpose**: Automated security vulnerability scanning

**Trigger**: 
- Push to main branch
- Pull requests to main
- Schedule: Weekly on Mondays at 00:00 UTC

**What it does**:
1. Initializes CodeQL with security-extended queries
2. Analyzes JavaScript/TypeScript code
3. Uploads SARIF results to GitHub Security
4. Generates security alerts for vulnerabilities

**Configuration**:
- **Languages**: javascript-typescript
- **Build Mode**: none (interpreted language)
- **Queries**: security-extended, security-and-quality
- **Ignored Paths**: news/, node_modules/, test files

**Security**:
- Security-events write permission
- Results uploaded to GitHub Security tab
- Integration with Dependabot alerts

#### `dependabot.yml` (Configuration)
**Purpose**: Automated dependency updates

**Update Schedule**:
- **npm**: Weekly on Mondays at 06:00
- **GitHub Actions**: Weekly on Mondays at 07:00

**Configuration**:
- Open up to 10 PRs at once
- Groups minor/patch updates
- Automatic labeling with `dependencies`, `javascript`, `github_actions`
- Commit message format: `build(deps): ...`
- Reviewers/Assignees: Hack23

**Security**: Enables automated security updates for vulnerabilities

---

### ✅ Test & Validation

#### `test-and-report.yml`
**Purpose**: Comprehensive PR validation and testing

**Trigger**: 
- Push to main branch
- Pull requests to main

**Jobs**:

1. **Prepare**: Environment setup, dependency installation
2. **Validation**: 
   - HTML validation with htmlhint
   - JavaScript syntax checking
   - package.json script verification
3. **Functional Tests**:
   - News generation test
   - Index generation test
   - Sitemap generation test
   - Generated HTML validation
4. **Security Check**:
   - npm audit for vulnerabilities
   - Outdated dependency check
5. **Report**: Generate summary of all test results

**Artifacts**: Test output (news/, indexes, sitemap)

**Security**: 
- Read-only permissions by default
- Write PRs for comments
- Write security-events for audit results

---

## Security Standards

All workflows follow Hack23 ISMS security requirements:

### Pinned Action Versions
Every action uses SHA256 pinning for security:
```yaml
uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
```

### Harden Runner
All workflows include StepSecurity Harden Runner:
```yaml
- name: Harden Runner
  uses: step-security/harden-runner@5ef0c079ce82195b2a36a210272d6b661572d83e # v2.14.2
  with:
    egress-policy: audit
```

### Minimal Permissions
Workflows follow principle of least privilege:
```yaml
permissions: read-all  # Default

jobs:
  specific-job:
    permissions:
      contents: read
      pull-requests: write  # Only when needed
```

### Dependency Management
- Dependabot enabled for automated updates
- Weekly schedule to minimize disruption
- Grouped updates to reduce PR volume
- Automated security updates prioritized

---

## Workflow Maintenance

### Adding New Workflows

1. Create workflow file in `.github/workflows/`
2. Pin all action versions (use SHA + tag comment)
3. Include harden-runner as first step
4. Set minimal permissions
5. Add to this README with documentation
6. Test with workflow dispatch or PR

### Updating Workflows

1. Test changes in feature branch
2. Use Dependabot or manual SHA updates
3. Verify action compatibility
4. Update documentation in this README
5. Ensure ISMS compliance maintained

### Workflow Best Practices

- **Use caching**: npm dependencies, build artifacts
- **Fail fast**: Set `fail-fast: false` only when needed
- **Timeout**: Set reasonable timeouts (360 minutes max)
- **Artifacts**: Upload test results and build outputs
- **Summaries**: Use `$GITHUB_STEP_SUMMARY` for results
- **Secrets**: Never log or expose secrets
- **Permissions**: Request only what's needed

---

## Troubleshooting

### Labeler Not Working
**Problem**: Labels not being applied to PRs

**Solution**:
1. Run `setup-labels.yml` workflow first
2. Check `.github/labeler.yml` syntax
3. Verify label names match in both files
4. Check workflow permissions include `pull-requests: write`

### Release Workflow Failing
**Problem**: Release creation fails

**Solution**:
1. Ensure semantic version format: `vX.Y.Z`
2. Check if tag already exists
3. Verify npm version command compatibility
4. Check artifact generation succeeds

### News Generation Issues
**Problem**: News articles not generated or PR not created

**Solution**:
1. Check MCP server connectivity (European Parliament API availability)
2. Verify `date -u` returns correct date context
3. Ensure `npm ci && npm run build` succeeds
4. Check `safeoutputs___create_pull_request` was called (not raw git commands)
5. Review workflow logs for MCP health gate failures
6. Never commit generated files (sitemap, rss, index files) — only article HTML

### CodeQL Analysis Failing
**Problem**: CodeQL analysis encounters errors

**Solution**:
1. Check JavaScript syntax in all .js files
2. Verify no build step required (build-mode: none)
3. Review ignored paths configuration
4. Check CodeQL query compatibility

### Dependabot PRs Not Created
**Problem**: No Dependabot PRs appearing

**Solution**:
1. Verify `.github/dependabot.yml` syntax
2. Check repository settings have Dependabot enabled
3. Ensure `package-lock.json` exists and is committed
4. Verify schedule configuration

---

## Workflow Triggers Reference

| Workflow | Push | PR | Schedule | Manual |
|----------|------|----|---------:|-------:|
| copilot-setup-steps | ✅ | ✅ | ❌ | ✅ |
| news-article-generator | ❌ | ❌ | ❌ | ✅ |
| news-committee-reports | ❌ | ❌ | ✅ Mon-Fri 04:00 | ✅ |
| news-week-ahead | ❌ | ❌ | ✅ Fri 07:00 | ✅ |
| news-weekly-review | ❌ | ❌ | ✅ Sat 09:00 | ✅ |
| news-month-ahead | ❌ | ❌ | ✅ 1st 08:00 | ✅ |
| news-monthly-review | ❌ | ❌ | ✅ 28th 10:00 | ✅ |
| news-motions | ❌ | ❌ | ✅ Mon-Fri 06:00 | ✅ |
| news-propositions | ❌ | ❌ | ✅ Mon-Fri 05:00 | ✅ |
| labeler | ❌ | ✅ | ❌ | ❌ |
| setup-labels | ❌ | ❌ | ❌ | ✅ |
| release | ✅ Tags | ❌ | ❌ | ✅ |
| codeql | ✅ main | ✅ | ✅ Weekly | ❌ |
| test-and-report | ✅ main | ✅ | ❌ | ❌ |

---

## ISMS Compliance

### ISO 27001 Controls
- **A.14.2.5** - Secure System Development Principles
- **A.14.2.8** - System Security Testing
- **A.14.2.9** - System Acceptance Testing

### NIST CSF
- **PR.DS-6** - Integrity Checking Mechanisms
- **DE.CM-4** - Malicious Code Detection
- **DE.CM-8** - Vulnerability Scans

### CIS Controls
- **16.3** - Establish a Process for Software Updates
- **16.4** - Automated Software Patch Management
- **16.11** - Leverage Vetted Modules or Services

---

## Support

For workflow issues or questions:
- **GitHub Issues**: https://github.com/Hack23/euparliamentmonitor/issues
- **Workflow Runs**: https://github.com/Hack23/euparliamentmonitor/actions
- **Security Alerts**: https://github.com/Hack23/euparliamentmonitor/security

---

**Last Updated**: 2026-03-02  
**Maintained By**: Hack23 DevOps Team
