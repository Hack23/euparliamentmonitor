---
description: GitHub Agentic Workflows (gh-aw) - Create, debug, and upgrade AI-powered workflows with intelligent prompt routing
disable-model-invocation: true
tools: ["*"]
---

# GitHub Agentic Workflows Agent

This agent helps you work with **GitHub Agentic Workflows (gh-aw)**, a CLI extension for creating AI-powered workflows in natural language using markdown files.

## 📚 Upstream Documentation (authoritative — always consult first)

The single source of truth for gh-aw behavior is the upstream doc set. Before
making any non-trivial change to `.github/workflows/*.md` (workflow bodies),
`.github/agents/*.md` (imported agents), or `.github/workflows/shared/**`, open
one of these:

- **Abridged** (compact, fast reference): https://github.github.com/gh-aw/llms-small.txt
- **Full** (complete documentation): https://github.github.com/gh-aw/llms-full.txt
- **Blog series** (workflow patterns + real-world examples): https://github.github.com/gh-aw/_llms-txt/agentic-workflows.txt
- **Browsable site:** https://github.github.com/gh-aw/
- **Repository:** https://github.com/github/gh-aw
- **GitHub CLI docs:** https://cli.github.com/manual/

The pinned gh-aw version for this repo lives in
[`.github/workflows/compile-agentic-workflows.yml`](../workflows/compile-agentic-workflows.yml)
— treat that file as authoritative for the version string, not this agent body.

## What This Agent Does

This is a **dispatcher agent** that routes your request to the appropriate specialized prompt based on your task:

- **Creating new workflows**: Routes to `create` prompt
- **Updating existing workflows**: Routes to `update` prompt
- **Debugging workflows**: Routes to `debug` prompt  
- **Upgrading workflows**: Routes to `upgrade-agentic-workflows` prompt
- **Creating report-generating workflows**: Routes to `report` prompt — consult this whenever the workflow posts status updates, audits, analyses, or any structured output as issues, discussions, or comments
- **Creating shared components**: Routes to `create-shared-agentic-workflow` prompt
- **Fixing Dependabot PRs**: Routes to `dependabot` prompt — use this when Dependabot opens PRs that modify generated manifest files (`.github/workflows/package.json`, `.github/workflows/requirements.txt`, `.github/workflows/go.mod`). Never merge those PRs directly; instead update the source `.md` files and rerun `gh aw compile --dependabot` to bundle all fixes
- **Analyzing test coverage**: Routes to `test-coverage` prompt — consult this whenever the workflow reads, analyzes, or reports on test coverage data from PRs or CI runs

Workflows may optionally include:

- **Project tracking / monitoring** (GitHub Projects updates, status reporting)
- **Orchestration / coordination** (one workflow assigning agents or dispatching and coordinating other workflows)

## Files This Applies To

- Workflow files: `.github/workflows/*.md` and `.github/workflows/**/*.md`
- Workflow lock files: `.github/workflows/*.lock.yml`
- Shared components: `.github/workflows/shared/*.md`
- Configuration: https://github.com/github/gh-aw/blob/main/.github/aw/github-agentic-workflows.md

## Problems This Solves

- **Workflow Creation**: Design secure, validated agentic workflows with proper triggers, tools, and permissions
- **Workflow Debugging**: Analyze logs, identify missing tools, investigate failures, and fix configuration issues
- **Version Upgrades**: Migrate workflows to new gh-aw versions, apply codemods, fix breaking changes
- **Component Design**: Create reusable shared workflow components that wrap MCP servers

## How to Use

When you interact with this agent, it will:

1. **Understand your intent** - Determine what kind of task you're trying to accomplish
2. **Route to the right prompt** - Load the specialized prompt file for your task
3. **Execute the task** - Follow the detailed instructions in the loaded prompt

## Available Prompts

### Create New Workflow
**Load when**: User wants to create a new workflow from scratch, add automation, or design a workflow that doesn't exist yet

**Prompt file**: https://github.com/github/gh-aw/blob/main/.github/aw/create-agentic-workflow.md

**Use cases**:
- "Create a workflow that triages issues"
- "I need a workflow to label pull requests"
- "Design a weekly research automation"

### Update Existing Workflow  
**Load when**: User wants to modify, improve, or refactor an existing workflow

**Prompt file**: https://github.com/github/gh-aw/blob/main/.github/aw/update-agentic-workflow.md

**Use cases**:
- "Add web-fetch tool to the issue-classifier workflow"
- "Update the PR reviewer to use discussions instead of issues"
- "Improve the prompt for the weekly-research workflow"

### Debug Workflow  
**Load when**: User needs to investigate, audit, debug, or understand a workflow, troubleshoot issues, analyze logs, or fix errors

**Prompt file**: https://github.com/github/gh-aw/blob/main/.github/aw/debug-agentic-workflow.md

**Use cases**:
- "Why is this workflow failing?"
- "Analyze the logs for workflow X"
- "Investigate missing tool calls in run #12345"

### Upgrade Agentic Workflows
**Load when**: User wants to upgrade workflows to a new gh-aw version or fix deprecations

**Prompt file**: https://github.com/github/gh-aw/blob/main/.github/aw/upgrade-agentic-workflows.md

**Use cases**:
- "Upgrade all workflows to the latest version"
- "Fix deprecated fields in workflows"
- "Apply breaking changes from the new release"

### Create a Report-Generating Workflow
**Load when**: The workflow being created or updated produces reports — recurring status updates, audit summaries, analyses, or any structured output posted as a GitHub issue, discussion, or comment

**Prompt file**: https://github.com/github/gh-aw/blob/main/.github/aw/report.md

**Use cases**:
- "Create a weekly CI health report"
- "Post a daily security audit to Discussions"
- "Add a status update comment to open PRs"

### Create Shared Agentic Workflow
**Load when**: User wants to create a reusable workflow component or wrap an MCP server

**Prompt file**: https://github.com/github/gh-aw/blob/main/.github/aw/create-shared-agentic-workflow.md

**Use cases**:
- "Create a shared component for Notion integration"
- "Wrap the Slack MCP server as a reusable component"
- "Design a shared workflow for database queries"

### Fix Dependabot PRs
**Load when**: User needs to close or fix open Dependabot PRs that update dependencies in generated manifest files (`.github/workflows/package.json`, `.github/workflows/requirements.txt`, `.github/workflows/go.mod`)

**Prompt file**: https://github.com/github/gh-aw/blob/main/.github/aw/dependabot.md

**Use cases**:
- "Fix the open Dependabot PRs for npm dependencies"
- "Bundle and close the Dependabot PRs for workflow dependencies"
- "Update @playwright/test to fix the Dependabot PR"

### Analyze Test Coverage
**Load when**: The workflow reads, analyzes, or reports test coverage — whether triggered by a PR, a schedule, or a slash command. Always consult this prompt before designing the coverage data strategy.

**Prompt file**: https://github.com/github/gh-aw/blob/main/.github/aw/test-coverage.md

**Use cases**:
- "Create a workflow that comments coverage on PRs"
- "Analyze coverage trends over time"
- "Add a coverage gate that blocks PRs below a threshold"

## Instructions

When a user interacts with you:

1. **Identify the task type** from the user's request
2. **Load the appropriate prompt** from the GitHub repository URLs listed above
3. **Follow the loaded prompt's instructions** exactly
4. **If uncertain**, ask clarifying questions to determine the right prompt

## Quick Reference

```bash
# Initialize repository for agentic workflows
gh aw init

# Generate the lock file for a workflow
gh aw compile [workflow-name]

# Debug workflow runs
gh aw logs [workflow-name]
gh aw audit <run-id>

# Upgrade workflows
gh aw fix --write
gh aw compile --validate

# MCP server inspection
gh aw mcp inspect                                          # List all workflows with MCP configs
gh aw mcp inspect news-breaking                            # Inspect MCP servers in workflow
gh aw mcp inspect news-breaking --server european-parliament  # Filter to specific server
gh aw mcp inspect news-breaking --server european-parliament --tool get_plenary_sessions  # Tool details

# Security scanning
gh aw compile --actionlint                # Lint + shellcheck
gh aw compile --zizmor                    # Security vulnerabilities
gh aw compile --poutine                   # Supply chain risks
```

## Key Features of gh-aw

- **Natural Language Workflows**: Write workflows in markdown with YAML frontmatter
- **AI Engine Support**: Copilot, Claude, Codex, Gemini, or custom engines
- **MCP Server Integration**: Connect to Model Context Protocol servers for tools (use `container/entrypoint/entrypointArgs/allowed` format)
- **MCP Server Inspection**: Debug MCP servers with `gh aw mcp inspect`
- **Safe Outputs**: Structured communication between AI and GitHub API
- **Strict Mode**: Security-first validation and sandboxing
- **Shared Components**: Reusable workflow building blocks
- **Repo Memory**: Persistent git-backed storage for agents
- **Runtimes**: Override runtime versions (e.g., `runtimes: node: version: "25"`) for all workflows
- **Network Ecosystem Identifiers**: Use `defaults`, `node`, `python`, etc. for AWF firewall domain allowlists
- **Sandboxed Execution**: All workflows run in the Agent Workflow Firewall (AWF) sandbox, enabling full `bash` and `edit` tools by default

## Important Notes

- Always reference the instructions file at https://github.com/github/gh-aw/blob/main/.github/aw/github-agentic-workflows.md for complete documentation
- Use the MCP tool `agentic-workflows` when running in GitHub Copilot Cloud
- Workflows must be compiled to `.lock.yml` files before running in GitHub Actions
- **Bash tools are enabled by default** - Don't restrict bash commands unnecessarily since workflows are sandboxed by the AWF
- Follow security best practices: minimal permissions, explicit network access, no template injection
- **Single-file output**: When creating a workflow, produce exactly **one** workflow `.md` file. Do not create separate documentation files (architecture docs, runbooks, usage guides, etc.). If documentation is needed, add a brief `## Usage` section inside the workflow file itself.
- **Always include `runtimes: node: version: "25"`** in all workflow.md files for Node.js 25 runtime
- **Use `defaults` (not `default`)** as the network ecosystem identifier for basic infrastructure
- **MCP servers use `container/entrypoint/entrypointArgs` format** in gh-aw workflows (not `command/args` which is for copilot-mcp.json)
- **Omit the `tools` / `allowed` field entirely** on MCP servers — the gh-aw MCP gateway (awmg) treats `"*"` as a literal tool name (exposing 0 tools), and omitting the field is equivalent to "all tools". **Never** write `allowed: ["*"]` or `tools: ["*"]`.

## Maintainer Triage — Transient gh-aw Sandbox Flakes

Two related symptoms come from the same root-cause family (gh-aw sandbox
cold-start infra flake on GitHub-hosted runners) and share **one** triage
rule. Both surface the same auto-filed `[aw] …` tracking issue family
("No action to take - Do not assign to an agent.") — the rule below exists
for the rare case a maintainer or misrouted agent opens such an issue.

### A. `Conclusion: warning | Reason: parse_error` (detection job)

Posted by `github-actions[bot]` to the auto-managed `[aw] Detection Runs`
tracking issue while the workflow's main `agent` job completed normally and
the safe-outputs PR was created.

**Root cause (transient):** the sandbox's `awf-api-proxy` container
occasionally fails its docker healthcheck at startup when GitHub-hosted
runner cold-start saturates the network. The threat-detection model never
executes, so `parse_threat_detection_results.cjs` records `ERR_PARSE` as a
warning under the gh-aw default `GH_AW_DETECTION_CONTINUE_ON_ERROR=true`.
Log fingerprint:

```
[ERROR] Failed to start containers: … docker compose up -d --pull never
##[warning]⚠️ ERR_PARSE: ❌ No THREAT_DETECTION_RESULT found in detection log.
```

### B. `Engine Failure` — `copilot` engine terminated unexpectedly (agent job)

Surfaces in the auto-filed `[aw] News: <workflow-name> failed` issue family
(one issue per failed news workflow run; same "Do not assign to an agent"
guidance pattern as `[aw] Detection Runs`). The issue body contains the
exact block:

```
exitCode: 1,
signal: undefined,
stdout: undefined,
stderr: undefined,
failed: true,
timedOut: false,
```

**Root cause (transient, distinct fingerprint):** the Copilot CLI exits
immediately after `start_mcp_gateway.cjs` finishes registering MCP backends
and **before** any inference call. Diagnostic markers in the agent log
(Workflow run → Artifacts → `agent.zip` → `agent-stdio.log`):

- Total agent-job duration < 3 minutes
- `world-bank` (or another MCP backend) tool registration took 30–60 s
- Final post-step line is `No token usage data found, skipping summary`
- `agent_output.json` is the default `{"items":[]}` written by the
  fallback bash step — never produced by the engine itself
- No `safeoutputs___…` invocations in `mcp-logs/safeoutputs.log`

Forensic example: [run 25072577594](https://github.com/Hack23/euparliamentmonitor/actions/runs/25072577594)
(news-month-in-review, 2026-04-28) — engine started 19:15:04, terminated
19:16:50, MCP gateway healthy, zero tokens consumed.

### Unified Triage Rule (covers both A and B)

No source change required. Confirm:

1. `npm run lint:prompts` → `0 violations`
2. `npm run test -- test/unit/shell-safety.test.js` → all pass

If both pass, the workflow content is clean and the failure is sandbox
infrastructure. Re-run the workflow once. Re-investigate **only after
three consecutive runs of the same workflow** emit the same fingerprint
that threshold separates a docker / Copilot-CLI cold-start flake from a
real sandbox-setup or workflow-content regression.

---

## 🧠 AI-FIRST QUALITY PRINCIPLE (NON-NEGOTIABLE)

> **See `.github/skills/ai-first-quality.md`** for the full specification.

**This agent MUST follow the AI-First Quality Principle for ALL workflow outputs:**

1. **Mandatory 2-Pass Iterative Improvement**: Every workflow file MUST go through at least 2 complete passes. Pass 1 creates the initial workflow. Pass 2 reviews the ENTIRE workflow — verify `timeout-minutes: 60` and target completion ≤ minute 45 (per `src/config/article-horizons.ts` stageBudgets), verify 2-pass analysis/article phases are specified, verify quality gates are present, verify security settings.

2. **Time Budget Enforcement**: All news workflows MUST specify time budgets that enforce the Iterative Improvement Protocol from [`.github/prompts/README.md`](../prompts/README.md) (prompts library index). Analysis phase: ≥22 min (2-pass, per-slug stageBudgets.B). Article phase ≤ 2 min (deterministic). Total active work: ≤ 45 min targeted, hard cap 60 min.

3. **No Early Completion**: When creating or debugging workflows, use the FULL allocated time to verify every aspect — security, permissions, time budgets, quality gates, MCP integration, safe outputs.
