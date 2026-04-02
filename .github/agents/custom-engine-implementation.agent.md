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
| Copilot | GitHub | `engine: copilot` (default) | General tasks, best GitHub integration |
| Claude | Anthropic | `engine: claude` | Complex analysis, long context, deep reasoning |
| Codex | OpenAI | `engine: codex` | Code-focused tasks, structured output |
| Custom | Any | `engine: custom` | Specialized processing |

## Engine Configuration

### Copilot (Default)
```markdown
---
engine: copilot
timeout-minutes: 10
---
# My Workflow
Instructions for the Copilot agent...
```

### Claude
```markdown
---
engine: claude
timeout-minutes: 15
---
# My Workflow
Instructions for Claude...
```

### Codex
```markdown
---
engine: codex
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

This project's gh-aw workflows primarily use the **default Copilot engine** for news generation tasks. For deep EP data analysis, consider using `engine: claude`.

### Example: News Generation
```markdown
---
engine: copilot
timeout-minutes: 15
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
