# 🤖 GitHub Agentic Workflows Skill

## Purpose

Enable effective use of GitHub Agentic Workflows (gh-aw) for automated development — markdown-based workflow definitions, safe outputs, sandboxed execution, and multi-engine AI agent orchestration within GitHub Actions.

## What is gh-aw?

**GitHub Agentic Workflows** is a Go-based GitHub CLI extension that:
- Lets you write **AI-powered automation in markdown** instead of complex YAML
- Compiles markdown to **GitHub Actions workflows** (`.lock.yml` files)
- Runs AI agents (Copilot, Claude, Codex) with **5-layer security guardrails**
- Supports **safe outputs** — gated write operations with constraints
- Provides **Continuous AI** — systematic, automated application of AI to software collaboration

**Repository**: https://github.com/github/gh-aw  
**Docs**: https://github.github.com/gh-aw/

## Rules

### MUST (Critical)
1. MUST write workflows as markdown files with YAML frontmatter
2. MUST compile workflows with `gh aw compile` before use
3. MUST define `safe-outputs` for any write operations
4. MUST use minimal `permissions` (read-only for agent)
5. MUST use `assign_copilot_to_issue` for issue-based automation
6. MUST track job status with `get_copilot_job_status`
7. MUST pin GitHub Actions to SHA (not tags)

### Workflow Structure

This repo's gh-aw workflows use the following frontmatter format (see `.github/workflows/news-breaking.md`):

```markdown
---
name: "News: EU Parliament Breaking News"
description: Generates EU Parliament breaking news English articles
strict: false
timeout-minutes: 60
on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch:
    inputs:
      force_generation:
        description: Force generation
        type: boolean
        default: true
permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read
  discussions: read
  security-events: read

network:
  allowed:
    - node
    - github.com
    - api.github.com
    - data.europarl.europa.eu
    - "*.europa.eu"
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
    - default

mcp-servers:
  european-parliament:
    command: npx
    args:
      - -y
      - european-parliament-mcp-server@1.1.26
    env:
      EP_REQUEST_TIMEOUT_MS: "120000"
  memory:
    command: npx
    args:
      - -y
      - "@modelcontextprotocol/server-memory"
  sequential-thinking:
    command: npx
    args:
      - -y
      - "@modelcontextprotocol/server-sequential-thinking"

tools:
  repo-memory:
    branch-name: memory/news-generation
    description: "Cross-run editorial memory for EU Parliament news generation"
    file-glob: ["memory/news-generation/*.md", "memory/news-generation/*.json"]
    max-file-size: 51200
    max-file-count: 50
    max-patch-size: 51200
    allowed-extensions: [".md", ".json"]
  github:
    toolsets:
      - all
  bash: true

safe-outputs:
  allowed-domains:
    - data.europarl.europa.eu
    - www.europarl.europa.eu
    - github.com
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
  create-pull-request:
    title-prefix: "[news] "
  add-comment:
    max: 1

engine:
  id: copilot
  model: claude-opus-4.6
---
# Workflow Title

Natural language instructions for the AI agent.
```

### Safe Output Types

The following are upstream gh-aw safe output types with their **optional** constraint fields. This repo's news workflows configure `create-pull-request` with `title-prefix: "[news] "` and `add-comment` with `max: 1` — enforcement of limits like `max_patch_size` and `protected_files` is handled by the compiled `.lock.yml` safe outputs handler config.

| Type | Optional Constraint Fields (upstream gh-aw) |
|------|----------------|
| `create-issue` | `title-prefix`, `labels`, `max`, `close-older-issues`, `expires`, `group` |
| `create-pull-request` | `title-prefix`, `labels`, `max-changed-files`, `max` |
| `add-labels` | `allowed` label list, `blocked` glob patterns |
| `add-comment` | `max` count, `hide-older-comments` |
| `create-discussion` | `category`, `title-prefix` |
| `close-issue` | `max` count, `target`, `state-reason` |

### Network Security Best Practices

The AWF (Agent Workflow Firewall) enforces domain allowlists. Follow these rules:

1. **Use ecosystem identifiers** — `node` covers npm registry domains; don't add `npmjs.org` separately
2. **Avoid broad wildcards** — `*.com`, `*.org`, `*.io` effectively disable the firewall. Use explicit domains instead
3. **Only allow what's needed** — Each workflow should only list domains it actually accesses
4. **Use `*.europa.eu`** sparingly — This repo allows it for EU institutional subdomains, but explicit domains are preferred when possible
5. **Add `default`** — This enables basic infrastructure (DNS, etc.)

**Example — EP-only workflow:**
```yaml
network:
  allowed:
    - node                        # npm ecosystem
    - github.com                  # Repository access
    - api.github.com              # GitHub API
    - data.europarl.europa.eu     # EP Open Data Portal
    - "*.europa.eu"               # EU institutional subdomains
    - hack23.com                  # Hack23 ecosystem content
    - www.hack23.com              # Hack23 website
    - riksdagsmonitor.com         # Swedish Parliament monitor
    - www.riksdagsmonitor.com     # Swedish Parliament monitor
    - euparliamentmonitor.com     # EU Parliament monitor
    - www.euparliamentmonitor.com # EU Parliament monitor
    - default                     # Basic infrastructure
```

**Example — EP + World Bank workflow:**
```yaml
network:
  allowed:
    - node
    - github.com
    - api.github.com
    - data.europarl.europa.eu
    - api.worldbank.org           # World Bank API
    - "*.europa.eu"
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
    - default
```

### 5 Security Layers

1. **Read-only token** — Agent can't modify repository
2. **Zero secrets** — Agent has no credentials
3. **AWF Firewall** — Network traffic filtered via Squid proxy allowlist
4. **Safe outputs** — Gated write operations with constraints
5. **Threat detection** — AI-powered scan blocks suspicious output

### CLI Commands

```bash
gh aw init                     # Initialize repository
gh aw compile [workflow]        # Compile .md to .lock.yml
gh aw compile --validate        # Validate without writing
gh aw compile --dependabot      # Bundle Dependabot fixes
gh aw fix --write              # Apply codemods for upgrades
gh aw logs [workflow]           # View workflow logs
gh aw audit <run-id>           # Audit a specific run
gh aw add-wizard <url>          # Add workflow from template
```

### Copilot Coding Agent Assignment

```javascript
// Basic assignment
assign_copilot_to_issue({
  owner: "Hack23",
  repo: "euparliamentmonitor",
  issue_number: 42
})

// Advanced assignment with feature branch and instructions
assign_copilot_to_issue({
  owner: "Hack23",
  repo: "euparliamentmonitor",
  issue_number: 42,
  base_ref: "feature/mcp-integration",
  custom_instructions: `
    - Follow patterns in scripts/ep-mcp-client.js
    - Include Vitest unit tests (80%+ coverage)
    - Update DATA_MODEL.md if data schemas change
    - Ensure ISMS compliance per SECURITY_ARCHITECTURE.md
  `
})
```

### PR Creation with Custom Agent

```javascript
create_pull_request_with_copilot({
  owner: "Hack23",
  repo: "euparliamentmonitor",
  title: "Implement EP committee data visualization",
  body: "Add interactive committee membership charts",
  base_ref: "main",
  custom_agent: "frontend-specialist"
})
```

### Stacked PRs Pattern

```javascript
// Step 1: Data layer
const pr1 = create_pull_request_with_copilot({
  owner: "Hack23", repo: "euparliamentmonitor",
  title: "Step 1: Add committee data models",
  body: "Create data structures for committee information",
  base_ref: "main"
});

// Step 2: Processing (stacked on step 1)
const pr2 = create_pull_request_with_copilot({
  owner: "Hack23", repo: "euparliamentmonitor",
  title: "Step 2: Add committee data processing",
  body: "Implement data transformation pipeline",
  base_ref: pr1.branch
});

// Step 3: UI (stacked on step 2)
const pr3 = create_pull_request_with_copilot({
  owner: "Hack23", repo: "euparliamentmonitor",
  title: "Step 3: Add committee visualization",
  body: "Create responsive committee membership charts",
  base_ref: pr2.branch,
  custom_agent: "frontend-specialist"
});
```

### Job Status Tracking

```javascript
const status = get_copilot_job_status({
  owner: "Hack23",
  repo: "euparliamentmonitor",
  job_id: "abc123-def456"
});
// { status: "completed", pull_request_url: "...", duration_seconds: 180 }
// { status: "in_progress", progress: 45 }
// { status: "failed", error: "Build failed" }
```

### AI Engine Selection

| Engine | Provider | Best For |
|--------|----------|----------|
| `copilot` | GitHub | Default, best GitHub integration |
| `claude` | Anthropic | Complex analysis, long context |
| `codex` | OpenAI | Code-focused tasks |

> Note: In this repository's gh-aw workflows, `engine.id` is always set to `copilot`. To run Claude, use a Claude model via the `model` field (for example, `model: claude-opus-4.6`) rather than configuring `engine.id: claude`.

### Agent Selection Guide

| Task | Recommended Agent |
|------|------------------|
| News article generation | `news-journalist` |
| MCP data pipeline | `data-pipeline-specialist` |
| HTML/CSS/accessibility | `frontend-specialist` |
| Testing/validation | `quality-engineer` |
| Architecture docs | `documentation-architect` |
| CI/CD workflows | `devops-engineer` |
| Issue management | `product-task-agent` |

### Workflow Security Patterns

```yaml
# ✅ GOOD: Hardened workflow
permissions:
  contents: read
  
steps:
  - uses: step-security/harden-runner@SHA
    with:
      egress-policy: audit
  - uses: actions/checkout@SHA
```

## EU Parliament Monitor Workflows

This project uses gh-aw for 10 automated news workflows in `.github/workflows/*.md`:
- `news-breaking.md` — Breaking EP news
- `news-weekly-review.md` — Weekly parliament review
- `news-monthly-review.md` — Monthly parliament review
- `news-week-ahead.md` — Week ahead preview
- `news-month-ahead.md` — Month ahead preview
- `news-committee-reports.md` — Committee activity reports
- `news-motions.md` — Parliamentary motions
- `news-propositions.md` — Legislative propositions
- `news-article-generator.md` — Generic article generator
- `news-translate.md` — Multi-language translation (14 languages)

## Gallery of Workflow Patterns

From the gh-aw Agent Factory (https://github.com/github/gh-aw):
- **Issue Triage** — Auto-label and comment on new issues
- **Code Simplifier** — Daily code quality improvements
- **CI Failure Doctor** — Diagnose and fix CI failures
- **Documentation Healer** — Continuous documentation maintenance
- **Plan Command** — Break issues into sub-tasks via `/plan` comment
- **Task Miner** — Extract actionable tasks from discussions

## Related Resources
- [GitHub Agentic Workflows Documentation](https://github.github.com/gh-aw/)
- [Abridged docs (LLM-friendly)](https://github.github.com/gh-aw/llms-small.txt)
- [Full docs (LLM-friendly)](https://github.github.com/gh-aw/llms-full.txt)
- [Agent Factory blog series](https://github.github.com/gh-aw/_llms-txt/agentic-workflows.txt)
- [GitHub Blog: Agentic Workflows](https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/)
- [GitHub Copilot Coding Agent](https://docs.github.com/en/copilot/using-github-copilot/using-copilot-coding-agent-to-work-on-tasks)
- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
