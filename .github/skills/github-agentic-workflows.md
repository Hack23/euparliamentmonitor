# 🤖 GitHub Agentic Workflows Skill

## Purpose

Enable effective use of GitHub Agentic Workflows for automated development, including Copilot coding agent assignment, stacked PRs, sequential task chaining, and multi-agent orchestration patterns.

## Rules

### MUST (Critical)
1. MUST use `assign_copilot_to_issue` for issue-based automation
2. MUST track job status with `get_copilot_job_status`
3. MUST use `base_ref` for feature branch workflows
4. MUST provide `custom_instructions` for complex implementations
5. MUST pin GitHub Actions to SHA (not tags)

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

### Agent Selection Guide

| Task | Recommended Agent |
|------|------------------|
| News article generation | `news-journalist` |
| MCP data pipeline | `data-pipeline-specialist` |
| HTML/CSS/accessibility | `frontend-specialist` |
| Testing/validation | `quality-engineer` |
| Security/compliance | `security-architect` |
| Architecture docs | `documentation-architect` |
| CI/CD workflows | `devops-engineer` |
| Issue management | `product-task-agent` |

## Related Resources
- [GitHub Copilot Coding Agent](https://docs.github.com/en/copilot/using-github-copilot/using-copilot-coding-agent-to-work-on-tasks)
- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
