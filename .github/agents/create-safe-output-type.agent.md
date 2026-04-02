---
description: Guide for adding and configuring safe output types in gh-aw workflow markdown files
disable-model-invocation: true
---

# Safe Output Type Configuration Guide

This agent helps configure **safe output types** in GitHub Agentic Workflows (gh-aw) markdown files. Safe outputs are the gated mechanism through which AI agents communicate actions to be performed on GitHub.

## How Safe Outputs Work

1. Agent produces structured JSONL artifact describing intended actions
2. Threat detection job scans the artifact for suspicious patterns
3. Write job validates each line against workflow's `safe-outputs` constraints
4. Only permitted actions with valid constraints are executed

## Available Safe Output Types

### create-issue
```yaml
safe-outputs:
  create-issue:
    title-prefix: "[report] "     # Required prefix for issue titles
    labels: [automated, report]    # Labels to apply
    max: 1                         # Maximum issues per run
    close-older-issues: true       # Close previous issues with same prefix
```

### create-pull-request
```yaml
safe-outputs:
  create-pull-request:
    title-prefix: "[news] "        # Required prefix for PR titles
    labels: [automated, news]      # Labels to apply
    max-changed-files: 50          # Maximum files changed
```

### add-labels
```yaml
safe-outputs:
  add-labels:
    allowed: [bug, enhancement, documentation, triaged, good-first-issue]
```

### add-comment
```yaml
safe-outputs:
  add-comment:
    max: 1                         # Maximum comments per run
```

### create-discussion
```yaml
safe-outputs:
  create-discussion:
    category: "Announcements"      # Discussion category
    title-prefix: "[analysis] "    # Required prefix
```

### close-issue
```yaml
safe-outputs:
  close-issue:
    max: 5                         # Maximum issues to close per run
```

### update-project-item
```yaml
safe-outputs:
  update-project-item: {}          # Update GitHub Project fields
```

## EU Parliament Monitor Examples

### News Generation Workflow
```yaml
safe-outputs:
  create-pull-request:
    title-prefix: "[news] "
    labels: [automated, news, breaking]
    max-changed-files: 100
```

### Issue Triage Workflow
```yaml
safe-outputs:
  add-labels:
    allowed: [bug, enhancement, documentation, question, help-wanted]
  add-comment:
    max: 1
```

## Security Principles

- **Minimal permissions**: Only enable safe output types the workflow needs
- **Constrained values**: Use title prefixes, label allowlists, and max counts
- **No direct writes**: Agent never writes to GitHub directly
- **Threat scanning**: All outputs scanned before execution

## Resources

- [Safe Outputs Reference](https://github.github.com/gh-aw/reference/safe-outputs/)
- [Threat Detection](https://github.github.com/gh-aw/reference/threat-detection/)
