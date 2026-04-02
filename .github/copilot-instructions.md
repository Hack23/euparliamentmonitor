# GitHub Copilot Custom Instructions - EU Parliament Monitor

## 📋 Required Reading on Session Start

**ALWAYS read these files at the start of every session:**

1. **`.github/workflows/copilot-setup-steps.yml`** - Workflow configuration and permissions
2. **`.github/copilot-mcp.json`** - MCP server configuration and available tools
3. **`README.md`** - Project overview, features, and documentation links
4. **`.github/skills/`** - Skills library (security, architecture, compliance, testing, gh-aw)
5. **`.github/agents/`** - Specialized agents for delegation

## 🎯 Project Overview

**EU Parliament Monitor** is a European Parliament Intelligence Platform generating multi-language news articles (14 languages) using EP open data via MCP server integration, powered by GitHub Agentic Workflows.

- **Stack**: Node.js 25, TypeScript 6, HTML5/CSS3, Vitest, Playwright, ESLint
- **License**: Apache-2.0 | **Deployment**: GitHub Pages + S3 CDN
- **Data**: European Parliament MCP Server (`european-parliament-mcp-server@1.1.22`)
- **Languages**: EN, SV, DA, NO, FI, DE, FR, ES, NL, AR, HE, JA, KO, ZH
- **Agentic Workflows**: 10 gh-aw markdown workflows for automated news generation
- **Security**: ISO 27001, NIST CSF 2.0, CIS Controls v8.1, GDPR, NIS2, EU CRA

## 🤖 Available Agents

| Agent | Purpose |
|-------|---------|
| **news-journalist** | The Economist-style EU Parliament reporting in 14 languages |
| **data-pipeline-specialist** | European Parliament MCP server integration and data pipelines |
| **frontend-specialist** | HTML5/CSS3, WCAG 2.1 AA accessibility, responsive design |
| **quality-engineer** | Testing, HTML validation, accessibility testing, performance |
| **devops-engineer** | GitHub Actions, CI/CD, gh-aw workflow compilation |
| **documentation-architect** | C4 models, Mermaid diagrams, API documentation |
| **product-task-agent** | Issue creation, product management, ISMS tracking |
| **agentic-workflows** | gh-aw workflow creation, debugging, and upgrades |

**Delegate specialized tasks to the appropriate agent.**

## 🏗️ Build & Test Commands

```bash
npm run lint          # ESLint (lint TypeScript in src/)
npm run htmlhint      # HTMLHint validation (HTML files)
npm run test          # Run unit tests (Vitest)
npm run test:coverage # Tests with coverage reporting
npm run test:e2e      # Playwright E2E tests
npm run generate-news # Generate multi-language news articles
npm run docs:generate # Generate TypeDoc API docs
npm run format        # Prettier formatting
npm run build         # TypeScript compilation
```

## 🔄 GitHub Agentic Workflows (gh-aw)

This project uses **10 gh-aw markdown workflows** in `.github/workflows/*.md` for automated news generation. These are compiled to `.lock.yml` files and run AI agents (Copilot/Claude/Codex) in sandboxed GitHub Actions with safe outputs.

**Workflow files**: `news-breaking.md`, `news-weekly-review.md`, `news-monthly-review.md`, `news-week-ahead.md`, `news-month-ahead.md`, `news-committee-reports.md`, `news-motions.md`, `news-propositions.md`, `news-article-generator.md`, `news-translate.md`

**Key concepts**: Safe outputs (create-pull-request with constraints), AWF firewall (Squid proxy allowlist), 5-layer security model, JSONL artifacts, lock file compilation.

**gh-aw docs**: https://github.github.com/gh-aw/ | [Abridged](https://github.github.com/gh-aw/llms-small.txt) | [Full](https://github.github.com/gh-aw/llms-full.txt)

## 🚨 Critical Rules

### MUST Follow
1. **Security First** - Follow Secure Development Policy, no secrets in code
2. **WCAG 2.1 AA** - All content must be accessible
3. **Test Before Commit** - Run `npm run lint && npm run test` before committing
4. **Multi-Language** - Changes affecting content must consider all 14 languages
5. **ISMS Compliance** - Follow ISO 27001, NIST CSF, CIS Controls frameworks
6. **Architecture Docs** - Update ARCHITECTURE.md, SECURITY_ARCHITECTURE.md when relevant
7. **Minimal Changes** - Make surgical, focused changes only
8. **gh-aw Workflows** - Compile with `gh aw compile --validate` after editing .md workflows

### MUST NOT Do
1. **Never** hard-code secrets, credentials, or API keys
2. **Never** break WCAG 2.1 AA compliance
3. **Never** skip testing before committing
4. **Never** use deprecated crypto (MD5, SHA-1, DES, 3DES)
5. **Never** merge Dependabot PRs on gh-aw manifest files directly

## 📐 Architecture Documentation (C4 Model)

**Current**: ARCHITECTURE.md, DATA_MODEL.md, FLOWCHART.md, STATEDIAGRAM.md, MINDMAP.md, SWOT.md, SECURITY_ARCHITECTURE.md, THREAT_MODEL.md

**Future**: FUTURE_ARCHITECTURE.md, FUTURE_DATA_MODEL.md, FUTURE_FLOWCHART.md, FUTURE_STATEDIAGRAM.md, FUTURE_MINDMAP.md, FUTURE_SWOT.md, FUTURE_SECURITY_ARCHITECTURE.md

**Reference**: [Hack23 Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)

## 🔒 ISMS Compliance

All work MUST align with [Hack23 ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC):

| Framework | Version | Scope |
|-----------|---------|-------|
| ISO 27001 | 2022 | Information security management |
| NIST CSF | 2.0 | Cybersecurity framework |
| CIS Controls | v8.1 | Security best practices |
| GDPR | - | Privacy and data protection |
| NIS2 | - | Network and information security |
| EU CRA | - | Cyber resilience |

**Key policies**: [Information Security](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md), [Secure Development](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md), [Open Source](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md), [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md), [Access Control](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md), [Cryptography](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md)

## 🤖 Copilot Coding Agent Tools

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `assign_copilot_to_issue` | Assign Copilot to implement an issue | `owner`, `repo`, `issue_number`, `base_ref`, `custom_instructions` |
| `create_pull_request_with_copilot` | Create PR with Copilot | `owner`, `repo`, `title`, `body`, `base_ref`, `custom_agent` |
| `get_copilot_job_status` | Monitor Copilot progress | `owner`, `repo`, `job_id` |

### Assignment Patterns

**Basic assignment:**
```javascript
assign_copilot_to_issue({
  owner: "Hack23", repo: "euparliamentmonitor",
  issue_number: ISSUE_NUMBER
})
```

**Feature branch with custom instructions:**
```javascript
assign_copilot_to_issue({
  owner: "Hack23", repo: "euparliamentmonitor",
  issue_number: ISSUE_NUMBER,
  base_ref: "feature/branch-name",
  custom_instructions: "Follow patterns in scripts/, include tests, ensure ISMS compliance"
})
```

**PR creation with specific agent:**
```javascript
create_pull_request_with_copilot({
  owner: "Hack23", repo: "euparliamentmonitor",
  title: "PR Title", body: "Implementation details",
  base_ref: "main",
  custom_agent: "security-architect"
})
```

**Stacked PRs:**
```javascript
const pr1 = create_pull_request_with_copilot({
  owner: "Hack23", repo: "euparliamentmonitor",
  title: "Step 1: Data models", body: "Create data layer",
  base_ref: "main"
});
const pr2 = create_pull_request_with_copilot({
  owner: "Hack23", repo: "euparliamentmonitor",
  title: "Step 2: Business logic", body: "Implement services",
  base_ref: pr1.branch
});
```

## 📚 Skills Library

| Category | Skills |
|----------|--------|
| Agentic | `github-agentic-workflows`, `gh-aw-architecture`, `gh-aw-firewall`, `gh-aw-sandbox` |
| Architecture | `c4-architecture-documentation` |
| Compliance | `compliance-frameworks`, `isms-compliance` |
| Security | `security-by-design`, `threat-modeling` |
| Testing | `testing-strategy` |
| Quality | `code-quality-excellence`, `accessibility-excellence` |
| Data | `european-parliament-data`, `mcp-server-integration` |
| Integration | `mcp-gateway-configuration`, `mcp-gateway-security`, `mcp-gateway-troubleshooting` |

## 🔗 Hack23 Organization

| Repository | Purpose |
|-----------|---------|
| [European-Parliament-MCP-Server](https://github.com/Hack23/European-Parliament-MCP-Server) | EP data MCP server (TypeScript) |
| [cia](https://github.com/Hack23/cia) | Swedish Parliament intelligence (Java/Spring) |
| [ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC) | ISMS policies & documentation |
| [riksdagsmonitor](https://github.com/Hack23/riksdagsmonitor) | Swedish Parliament monitor (HTML/CSS) |
| [blacktrigram](https://github.com/Hack23/blacktrigram) | Korean martial arts game (TypeScript) |
| [cia-compliance-manager](https://github.com/Hack23/cia-compliance-manager) | CIA compliance dashboard (TypeScript) |
| [homepage](https://github.com/Hack23/homepage) | Hack23.com website (HTML/CSS) |

## 💡 Decision Framework

1. Check relevant skill in `.github/skills/`
2. Review similar patterns in the codebase
3. Consult architecture docs (ARCHITECTURE.md, SECURITY_ARCHITECTURE.md)
4. Apply security-by-design principles
5. Follow ISMS requirements
6. Only then ask for clarification

**Complete work. Ask fewer questions. Validate before committing.**
