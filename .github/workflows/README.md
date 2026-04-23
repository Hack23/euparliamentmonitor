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
- Sets up Node.js 25
- Installs MCP server packages globally
- Configures Xvfb for browser-based operations
- Installs Playwright browsers
- Verifies MCP server installations

**Security**: Read-only permissions by default, escalated only when needed

---

### 📰 News Generation (Agentic Workflows)

The project uses **agentic workflow markdown files** (`.md`) that are compiled to `.lock.yml` files via `gh aw compile --validate`. Each news workflow generates a specific type of EU Parliament article using the European Parliament MCP server as the primary data source, with optional World Bank MCP enrichment and native IMF REST-client enrichment for economic context. (The World Bank is mounted as an MCP server; IMF data is fetched via a native TypeScript REST client — there is no IMF MCP mount in the workflow frontmatter.)

> **Split-workflow families (new canonical pattern):** each article type is
> served by **two** short workflows that each finish inside the model session
> budget. `news-<type>-analysis.md` (45-min timeout) produces a single
> analysis-only PR; when that PR merges to `main`, `news-<type>-article.md`
> (45-min timeout) runs Stage D and produces a single article PR. Analysis
> artifacts live in the deterministic folder `analysis/daily/${DATE}/${TYPE}/`
> with per-attempt history recorded in `manifest.json.history[]`. See
> [`.github/prompts/02-analysis-protocol.md`](../prompts/02-analysis-protocol.md) §2.

#### Split-family workflows (canonical, 16 files — 8 pairs)

| Analysis (`[analysis] …` PR) | Article (`[news] …` PR) | Schedule (analysis) | Trigger (article) |
|---|---|---|---|
| [`news-breaking-analysis.md`](news-breaking-analysis.md) | [`news-breaking-article.md`](news-breaking-article.md) | every 6h | merged analysis PR + manual |
| [`news-week-ahead-analysis.md`](news-week-ahead-analysis.md) | [`news-week-ahead-article.md`](news-week-ahead-article.md) | Fridays 07:00 UTC | merged analysis PR + manual |
| [`news-month-ahead-analysis.md`](news-month-ahead-analysis.md) | [`news-month-ahead-article.md`](news-month-ahead-article.md) | 1st of month 08:00 UTC | merged analysis PR + manual |
| [`news-weekly-review-analysis.md`](news-weekly-review-analysis.md) | [`news-weekly-review-article.md`](news-weekly-review-article.md) | Saturdays 09:00 UTC | merged analysis PR + manual |
| [`news-monthly-review-analysis.md`](news-monthly-review-analysis.md) | [`news-monthly-review-article.md`](news-monthly-review-article.md) | 28th of month 10:00 UTC | merged analysis PR + manual |
| [`news-committee-reports-analysis.md`](news-committee-reports-analysis.md) | [`news-committee-reports-article.md`](news-committee-reports-article.md) | Mon–Fri 04:00 UTC | merged analysis PR + manual |
| [`news-motions-analysis.md`](news-motions-analysis.md) | [`news-motions-article.md`](news-motions-article.md) | Mon–Fri 06:00 UTC | merged analysis PR + manual |
| [`news-propositions-analysis.md`](news-propositions-analysis.md) | [`news-propositions-article.md`](news-propositions-article.md) | Mon–Fri 05:00 UTC | merged analysis PR + manual |

#### Legacy monolithic workflows — removed

The eight pre-split monolithic workflows (`news-breaking.md`,
`news-week-ahead.md`, `news-month-ahead.md`, `news-weekly-review.md`,
`news-monthly-review.md`, `news-committee-reports.md`, `news-motions.md`,
`news-propositions.md`) and their `.lock.yml` files have been **deleted** from
the repository. They were superseded by the split-family pair in the table
above and disabled at the Actions UI layer (`disabled_manually`) for several
successful split-pair cycles. They are preserved in git history if a rollback
is ever required.

Rationale: a residual monolith (`news-motions.lock.yml`) was inadvertently
re-enabled and fired on `2026-04-23T07:10:53Z`, killing the Copilot CLI at the
90-min `timeout-minutes` while mid Pass‑2 of the article rewrite
([run 24822033271](https://github.com/Hack23/euparliamentmonitor/actions/runs/24822033271)).
Removing the files eliminates the re-enable risk and is the documented
follow-up to the split-family rollout.

#### Multi-type + translation (unchanged)

| Workflow (`.md`) | Purpose | Trigger |
|---|---|---|
| [`news-article-generator.md`](news-article-generator.md) | Manual multi-type backfill runner (documented `create-pull-request.max: 8` exception) | Workflow dispatch |
| [`news-translate.md`](news-translate.md) | 14-language translation with multi-call flush pattern (exempt from single-PR rule) | Workflow dispatch / PR hook |

A helper workflow — [`news-translate-reconciler.yml`](news-translate-reconciler.yml) — reconciles translation PRs produced by `news-translate.md`.

#### Shared-import pattern

Every article-generating `news-*.md` imports two shared files to keep the
workflow frontmatter and prompt body DRY:

```yaml
imports:
  - shared/mcp/news-mcp-servers.md        # merges `mcp-servers:` frontmatter
  - ../agents/news-generation.agent.md    # appends the canonical Required Reading + Stage Contract body
```

- [`shared/mcp/news-mcp-servers.md`](shared/mcp/news-mcp-servers.md) is a
  **frontmatter-only** workflow component; its `mcp-servers:` block is merged
  into the importing workflow's frontmatter (dedupes the EP / WB / IMF / MCP
  Gateway mounts across 9 workflows).
- [`.github/agents/news-generation.agent.md`](../agents/news-generation.agent.md)
  is **body-only** (gh-aw v0.69.3 does not merge agent-file frontmatter); the
  body is appended to every importing workflow's prompt.
- `news-translate.md` imports `shared/mcp/news-mcp-servers.md` (so its
  `mcp-servers:` frontmatter stays in lockstep with the article workflows),
  but it **does not** import `news-generation.agent.md` — it ships its own
  prompt body tuned for the 14-language multi-call flush pattern.

See [`.github/agents/news-generation.agent.md`](../agents/news-generation.agent.md)
§ "Why an imported agent?" for the tested behaviour notes, and the
[prompts library](../prompts/README.md) for the canonical Stage A → E flow.

#### Lock-file compile flow

1. Author or edit a `news-*.md` / `shared/mcp/*.md` / imported agent file.
2. Locally run `gh aw compile --validate` (the repo does **not** commit lock
   files directly from agents — see `copilot/cleanup-agentic-workflows`
   guidance).
3. CI job [`compile-agentic-workflows.yml`](compile-agentic-workflows.yml)
   re-compiles every `.md`, validates that the committed `.lock.yml` matches
   the recompile output, and runs `npm run lint:prompts` (see
   [`.github/prompts/README.md` § Drift-guard Lint](../prompts/README.md#drift-guard-lint-npm-run-lintprompts)).
4. The pinned gh-aw version lives inside `compile-agentic-workflows.yml`
   (currently v0.69.3).

Only `.lock.yml` files are executed at runtime; `.md` files are source.

#### `safeoutputs` semantics

All article-generating workflows declare:

```yaml
safe-outputs:
  create-pull-request:
    max: 1                 # default for every news-*.md
    # news-article-generator.md is the documented `max: 8` exception
    # news-translate.md uses `excluded-files:` + multi-call flush, exempt from single-PR rule
```

Key rules (enforced by [`scripts/lint-prompts.js`](../../scripts/lint-prompts.js)):

- **`safeoutputs___create_pull_request` takes a synchronous git format-patch
  snapshot AT CALL TIME.** It must therefore be called exactly once, at the
  very end of the run, after all files are written. Calling it earlier
  produces a PR with a partial working tree.
- `news-translate.md` is the single exempt workflow (multi-call flush with
  `max-patch-size` + re-calls).
- Banned phrases CI-lint-enforced: `checkpoint pr`, `keep-alive`, `heartbeat`,
  `progressive safe output`, `push_repo_memory`.

Rationale and exceptions: [`06-pr-and-safe-outputs.md`](../prompts/06-pr-and-safe-outputs.md).

#### Common features across all news workflows
- Uses `european-parliament-mcp-server@1.2.11` as primary data source
- Mandatory date context establishment via `date -u` command
- Supports 14 languages: en, sv, da, no, fi, de, fr, es, nl, ar, he, ja, ko, zh
- HTML validation and quality checks before PR creation
- Never commits generated files (sitemap, rss, index files)
- Uses `safeoutputs___create_pull_request` (called exactly once) for PR creation
- References the [prompts library index](../prompts/README.md) for shared rules, EP MCP tool reference, and the 5-stage analysis pipeline
- References [`ai-driven-analysis-guide.md`](../../analysis/methodologies/ai-driven-analysis-guide.md) for the analysis protocol (10 steps, Rules 1–22)
- References [`analysis/templates/README.md`](../../analysis/templates/README.md) for the 39-template artifact catalog
- May apply minor TypeScript/script corrections (max 20 lines) to unblock generation

**Security**: Read-only permissions by default, MCP data only from official EU Parliament / World Bank / IMF sources. Firewall policy via [`gh-aw-firewall` skill](../skills/gh-aw-firewall.md).

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

#### `e2e.yml`
**Purpose**: Playwright end-to-end browser tests (14 languages, accessibility,
visual regression) against the built static site.

**Trigger**: Push + PR to `main`; manual dispatch.

#### `reuse.yml`
**Purpose**: REUSE 3.3 compliance check (every file declares an SPDX licence
header or has a matching `.license` companion).

**Trigger**: Push + PR to `main`.

#### `scorecards.yml`
**Purpose**: OSSF Scorecard weekly supply-chain security scan — publishes
results to GitHub Security and the OSSF dashboard.

**Trigger**: Weekly schedule + push to `main`.

#### `dependency-review.yml`
**Purpose**: GitHub dependency-review action — blocks PRs that introduce
vulnerable or disallowed-licence dependencies.

**Trigger**: Pull requests.

#### `compile-agentic-workflows.yml`
**Purpose**: Recompiles every `news-*.md` → `.lock.yml` with the pinned gh-aw
version and fails the build if any committed lock file is stale. Also runs
`node scripts/lint-prompts.js` to enforce the four drift-guard rules
documented in [`.github/prompts/README.md`](../prompts/README.md).

**Trigger**: Push + PR that touches any `.github/workflows/*.md`,
`.github/agents/*.md`, `.github/prompts/*.md`, or `scripts/lint-prompts.js`.

#### `agentics-maintenance.yml`
**Purpose**: Scheduled maintenance workflow for gh-aw housekeeping (token
rotation checks, cache cleanup, upstream-version drift diagnostics).

**Trigger**: Schedule.

---

### 🚀 Deployment

#### `deploy-s3.yml`
**Purpose**: Deploy the built static site (HTML, CSS, JS, 14-language news
articles) to the production S3 / CloudFront origin.

**Trigger**: Push to `main` + manual dispatch.

**Security**: OIDC-assumed AWS role (no long-lived keys); harden-runner with
strict egress; pinned action versions.

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
| news-breaking | ❌ | ❌ | ❌ | ✅ |
| news-committee-reports | ❌ | ❌ | ✅ Mon-Fri 04:00 | ✅ |
| news-week-ahead | ❌ | ❌ | ✅ Fri 07:00 | ✅ |
| news-weekly-review | ❌ | ❌ | ✅ Sat 09:00 | ✅ |
| news-month-ahead | ❌ | ❌ | ✅ 1st 08:00 | ✅ |
| news-monthly-review | ❌ | ❌ | ✅ 28th 10:00 | ✅ |
| news-motions | ❌ | ❌ | ✅ Mon-Fri 06:00 | ✅ |
| news-propositions | ❌ | ❌ | ✅ Mon-Fri 05:00 | ✅ |
| news-translate | ❌ | ✅ | ❌ | ✅ |
| news-translate-reconciler | ❌ | ✅ | ❌ | ✅ |
| labeler | ❌ | ✅ | ❌ | ❌ |
| setup-labels | ❌ | ❌ | ❌ | ✅ |
| release | ✅ Tags | ❌ | ❌ | ✅ |
| codeql | ✅ main | ✅ | ✅ Weekly | ❌ |
| test-and-report | ✅ main | ✅ | ❌ | ❌ |
| e2e | ✅ main | ✅ | ❌ | ✅ |
| reuse | ✅ main | ✅ | ❌ | ❌ |
| scorecards | ✅ main | ❌ | ✅ Weekly | ❌ |
| dependency-review | ❌ | ✅ | ❌ | ❌ |
| compile-agentic-workflows | ✅ (path-scoped) | ✅ (path-scoped) | ❌ | ✅ |
| agentics-maintenance | ❌ | ❌ | ✅ | ✅ |
| deploy-s3 | ✅ main | ❌ | ❌ | ✅ |

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
