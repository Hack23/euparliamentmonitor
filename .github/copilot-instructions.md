# GitHub Copilot Custom Instructions - EU Parliament Monitor

## 📋 Required Reading on Session Start

**ALWAYS read these files at the start of every session:**

1. **`.github/workflows/copilot-setup-steps.yml`** - Workflow configuration and permissions
2. **`.github/copilot-mcp.json`** - MCP server configuration and available tools
3. **`README.md`** - Project overview, features, and documentation links
4. **`.github/skills/`** - Skills library for security, architecture, compliance, testing
5. **`.github/agents/`** - 8 specialized agents for delegation

## 🎯 Project Overview

**EU Parliament Monitor** is a European Parliament Intelligence Platform that monitors political activity with systematic transparency. It generates multi-language news articles (14 languages) using European Parliament open data via MCP (Model Context Protocol) server integration.

- **Stack**: Node.js 24, HTML5/CSS3, Vitest, Playwright, ESLint, JSDoc
- **License**: Apache-2.0
- **Deployment**: GitHub Pages (static site)
- **Data Source**: European Parliament MCP Server (`european-parliament-mcp-server`)
- **Languages**: EN, SV, DA, NO, FI, DE, FR, ES, NL, AR, HE, JA, KO, ZH
- **Security**: ISO 27001, NIST CSF 2.0, CIS Controls v8.1, GDPR, NIS2 compliant

## 🤖 Available Agents

| Agent | Purpose |
|-------|---------|
| **news-journalist** | The Economist-style EU Parliament reporting in 14 languages |
| **data-pipeline-specialist** | European Parliament MCP server integration and data pipelines |
| **frontend-specialist** | HTML5/CSS3, WCAG 2.1 AA accessibility, responsive design |
| **quality-engineer** | Testing, HTML validation, accessibility testing, performance |
| **security-architect** | ISMS compliance, threat modeling, GDPR/NIS2 |
| **documentation-architect** | C4 models, Mermaid diagrams, API documentation |
| **devops-engineer** | GitHub Actions, CI/CD, deployment automation |
| **product-task-agent** | Issue creation, product management, ISMS tracking |

**Delegate specialized tasks to the appropriate agent.**

## 🏗️ Build & Test Commands

```bash
npm run lint          # ESLint + HTMLHint validation
npm run test          # Run unit tests (Vitest)
npm run test:coverage # Tests with coverage reporting
npm run test:e2e      # Playwright E2E tests
npm run generate-news # Generate multi-language news articles
npm run docs:generate # Generate JSDoc API docs
npm run format        # Prettier formatting
```

## 🚨 Critical Rules

### MUST Follow
1. **Security First** - Follow Secure Development Policy, no secrets in code
2. **WCAG 2.1 AA** - All content must be accessible
3. **Test Before Commit** - Run `npm run lint && npm run test` before committing
4. **Multi-Language** - Changes affecting content must consider all 14 languages
5. **ISMS Compliance** - Follow ISO 27001, NIST CSF, CIS Controls frameworks
6. **Architecture Docs** - Update ARCHITECTURE.md, SECURITY_ARCHITECTURE.md when relevant
7. **Minimal Changes** - Make surgical, focused changes only

### MUST NOT Do
1. **Never** create new markdown files unless explicitly requested
2. **Never** hard-code secrets, credentials, or API keys
3. **Never** break WCAG 2.1 AA compliance
4. **Never** skip testing before committing
5. **Never** modify workflows without careful consideration
6. **Never** use deprecated crypto (MD5, SHA-1, DES, 3DES)

## 📐 Architecture Documentation Requirements

### Required Documentation Portfolio (C4 Model)

**Current State:**
- 🏛️ `ARCHITECTURE.md` — C4 models (Context, Container, Component)
- 📊 `DATA_MODEL.md` — Data structures and relationships
- 🔄 `FLOWCHART.md` — Business process and data flows
- 📈 `STATEDIAGRAM.md` — State transitions and lifecycles
- 🧠 `MINDMAP.md` — Conceptual relationships
- 💼 `SWOT.md` — Strategic analysis
- 🏛️ `SECURITY_ARCHITECTURE.md` — Security design and controls
- 🔍 `THREAT_MODEL.md` — STRIDE threat analysis

**Future State:**
- 🚀 `FUTURE_ARCHITECTURE.md` — Evolution roadmap
- 📊 `FUTURE_DATA_MODEL.md` — Enhanced data plans
- 🔄 `FUTURE_FLOWCHART.md` — Improved workflows
- 📈 `FUTURE_STATEDIAGRAM.md` — Advanced state management
- 🧠 `FUTURE_MINDMAP.md` — Capability expansion
- 💼 `FUTURE_SWOT.md` — Future opportunities
- 🚀 `FUTURE_SECURITY_ARCHITECTURE.md` — Security improvements

**Reference**: [Hack23 Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)

## 🔒 ISMS Compliance Framework

All work MUST align with [Hack23 ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC):

| Framework | Version | Scope |
|-----------|---------|-------|
| ISO 27001 | 2022 | Information security management |
| NIST CSF | 2.0 | Cybersecurity framework |
| CIS Controls | v8.1 | Security best practices |
| GDPR | - | Privacy and data protection |
| NIS2 | - | Network and information security |
| EU CRA | - | Cyber resilience |

### ISMS Policy References
- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md)
- [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md)
- [Cryptography Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md)

## 🤖 GitHub MCP Insiders - Copilot Coding Agent Tools

### Available Tools

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

**Job tracking:**
```javascript
get_copilot_job_status({ owner: "Hack23", repo: "euparliamentmonitor", job_id: "abc123" })
// Returns: { status: "completed", pull_request_url: "...", duration_seconds: 180 }
```

## 📚 Skills Library

The `.github/skills/` directory contains reusable knowledge units. Skills auto-load via GitHub Copilot. Key skill categories:

| Category | Skills | Purpose |
|----------|--------|---------|
| Architecture | `c4-architecture-documentation` | C4 models, Mermaid diagrams |
| Compliance | `compliance-frameworks`, `isms-compliance` | ISO 27001, NIST, CIS, GDPR |
| Security | `security-by-design`, `gh-aw-firewall` | Security-first development |
| Testing | `testing-strategy` | Unit, integration, E2E testing |
| Quality | `code-quality-excellence`, `accessibility-excellence` | Code quality, WCAG |
| Documentation | `documentation-standards` | Documentation requirements |
| Performance | `performance-optimization` | Performance best practices |
| Data | `european-parliament-data` | EP MCP server integration |
| Governance | `open-source-governance` | Open source policies |
| Integration | `mcp-server-integration`, `mcp-gateway-*` | MCP protocol patterns |
| Agentic | `github-agentic-workflows`, `gh-aw-*` | Agentic workflow patterns |

## 🔗 Hack23 Organization Cross-References

### Repository Ecosystem
| Repository | Purpose | Tech |
|-----------|---------|------|
| [cia](https://github.com/Hack23/cia) | Swedish Parliament intelligence | Java/Spring |
| [European-Parliament-MCP-Server](https://github.com/Hack23/European-Parliament-MCP-Server) | EP data MCP server | TypeScript |
| [riksdagsmonitor](https://github.com/Hack23/riksdagsmonitor) | Swedish Parliament monitor | HTML/CSS |
| [blacktrigram](https://github.com/Hack23/blacktrigram) | Korean martial arts game | TypeScript |
| [cia-compliance-manager](https://github.com/Hack23/cia-compliance-manager) | CIA compliance dashboard | TypeScript |
| [game](https://github.com/Hack23/game) | React/Three.js game template | TypeScript |
| [homepage](https://github.com/Hack23/homepage) | Hack23.com website | HTML/CSS |
| [lambda-in-private-vpc](https://github.com/Hack23/lambda-in-private-vpc) | AWS Lambda HA template | CloudFormation |
| [ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC) | ISMS policies & documentation | Markdown |

### Security Architecture References
- **CIA**: [SECURITY_ARCHITECTURE.md](https://github.com/Hack23/cia/blob/master/SECURITY_ARCHITECTURE.md) | [FUTURE](https://github.com/Hack23/cia/blob/master/FUTURE_SECURITY_ARCHITECTURE.md)
- **Black Trigram**: [SECURITY_ARCHITECTURE.md](https://github.com/Hack23/blacktrigram/blob/master/SECURITY_ARCHITECTURE.md) | [FUTURE](https://github.com/Hack23/blacktrigram/blob/master/FUTURE_SECURITY_ARCHITECTURE.md)
- **CIA Compliance Manager**: [SECURITY_ARCHITECTURE.md](https://github.com/Hack23/cia-compliance-manager/blob/main/SECURITY_ARCHITECTURE.md) | [FUTURE](https://github.com/Hack23/cia-compliance-manager/blob/main/FUTURE_SECURITY_ARCHITECTURE.md)
- **ISMS-PUBLIC**: [SECURITY_ARCHITECTURE.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/SECURITY_ARCHITECTURE.md)

## 💡 Decision Framework

When uncertain, use this hierarchy:
1. Check relevant skill in `.github/skills/`
2. Review similar patterns in the codebase
3. Consult architecture docs (ARCHITECTURE.md, SECURITY_ARCHITECTURE.md)
4. Apply security-by-design principles
5. Follow ISMS requirements
6. Only then ask for clarification

**Complete work. Ask fewer questions. Validate before committing.**
