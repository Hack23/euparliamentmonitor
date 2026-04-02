---
name: gh-aw-architecture
description: GitHub Agentic Workflows security architecture — 5-layer defense-in-depth model with safe outputs, sandboxed execution, and threat detection
tools: []
---

# Skill: GitHub Agentic Workflows Architecture

## Overview

**Documentation**: https://github.github.com/gh-aw/  
**Repository**: https://github.com/github/gh-aw

GitHub Agentic Workflows (gh-aw) is a Go-based GitHub CLI extension that runs AI-powered automation in GitHub Actions with strong guardrails. Workflows are written in **markdown files** and compiled to `.lock.yml` GitHub Actions workflows.

## 5-Layer Security Architecture

gh-aw implements **defense-in-depth** with five security layers:

### Layer 1: Read-Only Tokens
The AI agent receives a GitHub token scoped to **read-only permissions**. Even if compromised, it cannot push code, create PRs, or delete files directly.

### Layer 2: Zero Secrets in the Agent
The agent process **never receives write tokens, API keys, or credentials**. Secrets exist only in separate, isolated jobs that run after the agent finishes.

### Layer 3: Containerized with Network Firewall (AWF)
The agent runs inside an isolated container. The **Agent Workflow Firewall (AWF)** routes all outbound traffic through a Squid proxy enforcing an explicit domain allowlist. Traffic to unlisted destinations is dropped at the kernel level.

### Layer 4: Safe Outputs with Guardrails
The agent produces structured JSONL artifacts describing intended actions (e.g., "create issue with this title"). A **separate write job** with scoped permissions reads the artifact and applies only what the workflow permits — hard limits per operation, required prefixes, label constraints.

### Layer 5: Agentic Threat Detection
Before outputs are applied, a dedicated **threat detection job** runs an AI-powered scan checking for prompt injection, leaked credentials, and malicious code patterns. Suspicious output blocks the entire workflow.

## Execution Flow

```
GitHub Event → Agent (Sandbox: read-only token, firewall) → Proposed Output (artifact)
  → Threat Detection (AI scan) → ✓ safe → Write Job (scoped write token) → GitHub API
                                → ✗ suspicious → Blocked
```

## Workflow File Structure

Workflows are markdown files with YAML frontmatter:

```markdown
---
timeout-minutes: 5
on:
  schedule: daily
  issue_comment:
    commands: ["/report"]
permissions:
  contents: read
  issues: read
tools:
  github:
    toolsets: [issues, pull_requests]
  web-fetch: {}
safe-outputs:
  create-issue:
    title-prefix: "[report] "
    labels: [automated]
    close-older-issues: true
  add-labels:
    allowed: [bug, enhancement]
---
# My Workflow

Natural language instructions for the AI agent...
```

### Key Frontmatter Fields

| Field | Purpose |
|-------|---------|
| `on` | Triggers: `schedule`, `issue`, `issue_comment`, `pull_request`, `push`, `workflow_dispatch` |
| `permissions` | GitHub token scopes (always read-only for agent) |
| `tools` | MCP servers and tool access (github, web-fetch, filesystem) |
| `safe-outputs` | Gated write operations with constraints |
| `timeout-minutes` | Maximum execution time |
| `engine` | AI engine: `copilot` (default), `claude`, `codex`, or custom |
| `min-integrity` | Integrity filtering for public repos (default: `approved`) |

## Safe Output Types

| Type | Purpose | Key Constraints |
|------|---------|----------------|
| `create-issue` | Create GitHub issues | `title-prefix`, `labels`, `max` count, `close-older-issues` |
| `create-pull-request` | Create PRs with code changes | `title-prefix`, `labels`, `max-changed-files` |
| `add-labels` | Apply labels to issues/PRs | `allowed` label list |
| `add-comment` | Post comments | `max` count |
| `create-discussion` | Create GitHub discussions | `category`, `title-prefix` |
| `close-issue` | Close issues | `max` count |
| `update-project-item` | Update GitHub Projects | Field constraints |

## AI Engines

| Engine | Provider | Notes |
|--------|----------|-------|
| `copilot` | GitHub Copilot | Default engine, best GitHub integration |
| `claude` | Anthropic | Claude Code, strong for analysis |
| `codex` | OpenAI | Codex CLI integration |
| Custom | Any | Implement engine interface |

## CLI Commands

```bash
gh aw init                    # Initialize repository
gh aw compile [workflow]       # Compile .md to .lock.yml
gh aw compile --validate       # Validate without writing
gh aw compile --dependabot     # Bundle Dependabot fixes
gh aw fix --write             # Apply codemods for upgrades
gh aw logs [workflow]          # View workflow logs
gh aw audit <run-id>          # Audit a specific run
gh aw add-wizard <url>         # Add workflow from template
```

## Tools Available to Agents

### GitHub Tools
Configured via `tools.github.toolsets`:
- `issues` — Read/search issues
- `pull_requests` — Read PR data
- `labels` — Read label information
- `discussions` — Read discussions
- `repos` — Read repository content, search code
- `actions` — Read workflow runs and logs

### MCP Server Tools
- `web-fetch` — Fetch and parse web pages
- `web-search` — AI-powered web search
- `filesystem` — Read/write workspace files
- Custom MCP servers via `shared:` components

### Built-in Tools
- `bash` — Shell command execution (sandboxed by AWF)
- `edit` — File editing within workspace

## EU Parliament Monitor Integration

This project uses gh-aw for automated news generation workflows:

```markdown
---
on:
  schedule: daily
permissions:
  contents: read
tools:
  github:
    toolsets: [repos, issues]
  european-parliament: {}
safe-outputs:
  create-pull-request:
    title-prefix: "[news] "
    labels: [automated, news]
---
# EU Parliament News Generator
Fetch latest EP activity and generate multi-language articles...
```

## Best Practices

1. **Minimal permissions** — Only request read access the agent needs
2. **Explicit safe-outputs** — Define exact output types with constraints
3. **Title prefixes** — Use prefixes to identify automated content
4. **Domain allowlists** — Restrict network access to required domains
5. **Timeout limits** — Set appropriate timeout-minutes
6. **Single-file output** — One .md workflow file, no separate docs
7. **Compile and validate** — Always run `gh aw compile --validate`

## Resources

- **Documentation**: https://github.github.com/gh-aw/
- **Abridged docs**: https://github.github.com/gh-aw/llms-small.txt
- **Full docs**: https://github.github.com/gh-aw/llms-full.txt
- **Blog series**: https://github.github.com/gh-aw/_llms-txt/agentic-workflows.txt
- **GitHub Blog**: https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/
