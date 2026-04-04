---
name: gh-aw-sandbox
description: Sandboxed agent execution in GitHub Agentic Workflows — containerized environment with read-only tokens, resource isolation, and controlled tool access
tools: []
---

# Skill: Sandbox Execution for Agentic Workflows

## Overview

Every gh-aw workflow runs inside an **isolated container** within GitHub Actions. The sandbox provides resource isolation, a read-only GitHub token, and controlled tool execution — the agent can read and write files in the ephemeral workspace to generate patches and artifacts, but cannot push changes or use write permissions against the repository directly.

## Sandbox Properties

### Execution Environment
- **Container-based**: Agent runs in a dedicated Docker container
- **Read-only token**: GitHub token scoped to read-only permissions (agent cannot push or create PRs directly)
- **Writable workspace**: Agent can read/write files in the ephemeral workspace for patch generation
- **No credentials**: Write tokens and API keys are never exposed to the agent
- **Network filtered**: All outbound traffic routed through AWF (Agent Workflow Firewall)
- **Resource limited**: Wall-clock time limited via GitHub Actions `timeout-minutes`; CPU and memory constrained by the GitHub Actions runner/sandbox defaults

### What the Agent CAN Do
- Read repository files (code, docs, configs)
- Search code and read issues/PRs/discussions
- Execute bash commands within the sandbox
- Edit files in the workspace
- Call MCP server tools (as configured)
- Produce structured output artifacts (JSONL)

### What the Agent CANNOT Do
- Push code or create branches
- Create issues, PRs, or comments directly
- Access secrets or write tokens
- Make network requests to unlisted domains
- Modify the repository outside the sandbox

## How Agent Output Works

The agent communicates actions through **safe outputs** — structured JSONL artifacts:

```
Agent writes JSONL → Artifact uploaded → Threat detection scans →
  Write job reads artifact → Applies permitted actions via scoped token
```

### Example Safe Output Flow
```jsonl
{"type":"create-issue","title":"[report] Daily EP Activity","body":"...","labels":["automated"]}
{"type":"add-labels","issue_number":42,"labels":["triaged"]}
```

The write job validates each line against the workflow's `safe-outputs` constraints before executing.

## Tool Access Configuration

Tools are configured in the workflow frontmatter and determine what the agent can access:

```markdown
---
mcp-servers:
  # Custom MCP servers (separate from tools)
  european-parliament:
    command: npx
    args:
      - -y
      - european-parliament-mcp-server@1.1.25

tools:
  # GitHub tools with specific toolsets
  github:
    toolsets: [issues, repos, pull_requests]
  # Bash must be explicitly enabled
  bash: true
---
```

### Built-in Tools
| Tool | Purpose | Enabled By |
|------|---------|------------|
| `bash` | Shell command execution within sandbox | `tools: { bash: true }` in frontmatter |
| `edit` | File editing within workspace | Always available |
| `read` | File reading | Always available |

> **Note**: In this repo's workflows, `bash` is explicitly enabled via `tools: { bash: true }` in frontmatter — it is not available by default.

### GitHub Tool Subsets
| Toolset | Access |
|---------|--------|
| `issues` | Read issues, labels, milestones |
| `repos` | Read files, search code, list branches |
| `pull_requests` | Read PRs, diffs, reviews |
| `discussions` | Read discussion threads |
| `actions` | Read workflow runs, logs |
| `labels` | Read label definitions |

## Workflow Lifecycle

```
1. Trigger event (schedule, issue, PR, dispatch)
2. GitHub Actions starts runner
3. Container initialized with:
   - Read-only GitHub token
   - AWF network firewall
   - Configured MCP servers
   - Repository checkout (writable workspace for patch generation)
4. AI engine processes workflow instructions
5. Agent uses tools, reads repository, analyzes data
6. Agent produces JSONL safe output artifact
7. Container terminates
8. Threat detection job scans output
9. Write job applies permitted actions
```

## Resource Management

### Timeout Configuration
```markdown
---
timeout-minutes: 10    # Maximum execution time (default varies by engine)
---
```

### Engine-Specific Defaults
| Engine | Default Timeout | Typical Use |
|--------|----------------|-------------|
| Copilot | 10 min | Standard analysis tasks |
| Claude | 15 min | Complex analysis |
| Codex | 10 min | Code-focused tasks |

## Repo Memory

gh-aw supports **repo memory** — persistent git-backed storage that agents can read and write across runs:

```markdown
---
tools:
  repo-memory: {}
---
```

This enables agents to:
- Track progress across scheduled runs
- Store analysis results for future reference
- Maintain state between workflow executions

## EU Parliament Monitor Context

This project's gh-aw workflows use the sandbox to:
- Safely fetch EP data via the European Parliament MCP server
- Generate news articles without direct repository write access
- Create PRs through safe-output artifacts with `[news]` prefix
- Run analysis within resource and time constraints

## Debugging Sandbox Issues

### Viewing Agent Logs
```bash
gh aw logs <workflow-name>          # View recent run logs
gh aw audit <run-id>                # Detailed audit of a run
```

### Common Issues

**Agent times out**: Increase `timeout-minutes` or simplify the task

**Tool not available**: Ensure the tool is listed in the `tools:` frontmatter

**Permission denied**: Agent only has read access — use safe-outputs for writes

**MCP server error**: Check MCP server configuration and version compatibility

## Best Practices

1. **Set appropriate timeouts** — Don't over-allocate; 5-10 min handles most tasks
2. **Minimal tool access** — Only configure tools the workflow actually needs
3. **Clear instructions** — Well-written natural language instructions reduce agent confusion
4. **Test locally first** — Use `gh aw compile --validate` before pushing
5. **Monitor execution** — Review agent logs and output regularly

## Resources

- **Architecture**: https://github.github.com/gh-aw/introduction/architecture/
- **Tools Reference**: https://github.github.com/gh-aw/reference/tools/
- **Safe Outputs**: https://github.github.com/gh-aw/reference/safe-outputs/
- **Engines**: https://github.github.com/gh-aw/reference/engines/
