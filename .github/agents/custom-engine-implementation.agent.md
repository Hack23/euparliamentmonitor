---
description: Guide for configuring AI engines in gh-aw workflow markdown files — Copilot, Claude, Codex, and custom engines
applyTo: ".github/workflows/*.md"
disable-model-invocation: true
---

# AI Engine Configuration Guide

This agent helps configure **AI engines** in GitHub Agentic Workflows (gh-aw) markdown files. Each workflow can specify which AI engine processes its instructions.

## Available Engines

| Engine | Provider | Frontmatter | Best For |
|--------|----------|-------------|----------|
| Copilot | GitHub | `engine: { id: copilot }` (default) | General tasks, best GitHub integration |
| Claude | Anthropic | `engine: { id: copilot, model: claude-opus-4.6 }` | Complex analysis, long context, deep reasoning |
| Codex | OpenAI | `engine: { id: codex }` | Code-focused tasks, structured output |

## Engine Configuration

### Copilot (Default)
```markdown
---
engine:
  id: copilot
timeout-minutes: 10
---
# My Workflow
Instructions for the Copilot agent...
```

### Claude (via Copilot engine with model override)
```markdown
---
engine:
  id: copilot
  model: claude-opus-4.6
timeout-minutes: 15
---
# My Workflow
Instructions for Claude...
```

### Codex
```markdown
---
engine:
  id: codex
timeout-minutes: 10
---
# My Workflow
Instructions for Codex...
```

## Engine Selection Guide

| Workflow Type | Recommended Engine | Reason |
|--------------|-------------------|--------|
| Issue triage & labeling | Copilot | Fast, good GitHub integration |
| News article analysis | Claude | Deep reasoning, long context |
| Code refactoring | Codex | Code-focused, structured output |
| Documentation updates | Copilot or Claude | Both work well |
| Data analysis | Claude | Best for complex multi-step analysis |
| PR review | Copilot | Native GitHub understanding |

## EU Parliament Monitor Usage

This project's gh-aw workflows primarily use **Copilot with Claude model** (`engine: { id: copilot, model: claude-opus-4.6 }`) for news generation tasks.

### Example: News Generation
```markdown
---
engine:
  id: copilot
  model: claude-opus-4.6
timeout-minutes: 60
on:
  schedule:
    - cron: "0 */6 * * *"
permissions:
  contents: read
network:
  allowed:
    - node
    - github.com
    - api.github.com
    - data.europarl.europa.eu
    - "*.europa.eu"
    - default
mcp-servers:
  european-parliament:
    command: npx
    args:
      - -y
      - european-parliament-mcp-server@1.1.22
    env:
      EP_REQUEST_TIMEOUT_MS: "120000"
tools:
  github:
    toolsets:
      - all
  bash: true
safe-outputs:
  allowed-domains:
    - data.europarl.europa.eu
    - www.europarl.europa.eu
    - github.com
  create-pull-request: {}
  add-comment: {}
---
# EU Parliament News Generator
Analyze recent EP activity and generate articles...
```

## Engine Capabilities

All engines support:
- Reading repository files and code
- Using configured MCP server tools
- Executing bash commands (sandboxed by AWF)
- Producing safe output artifacts (JSONL)

Engine-specific features vary — check the [Engines Reference](https://github.github.com/gh-aw/reference/engines/) for details.

## Resources

- [Engines Reference](https://github.github.com/gh-aw/reference/engines/)
- [Workflow Frontmatter](https://github.github.com/gh-aw/reference/frontmatter/)
