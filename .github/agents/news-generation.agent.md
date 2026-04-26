---
name: news-generation
description: Shared gh-aw agent for EU Parliament Monitor article-generating news-*.md workflows — appends the canonical Required Reading order and Stage Contract to every importing workflow prompt. MCP server mounts live in shared/mcp/news-mcp-servers.md (separate import, merged into frontmatter).
---

<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📥 Imported Agent — News Generation

This agent file is imported by every article-generating `news-*.md` gh-aw
workflow via the `imports:` field (see
[gh-aw Copilot Custom Agents reference](https://github.github.com/gh-aw/reference/copilot-custom-agents/)).
It is **not** imported by `news-translate.md` — translation uses its own
multi-call flush pattern and is exempt from the single-PR rule.

## Why an imported agent?

Per the gh-aw [Copilot Custom Agents reference](https://github.github.com/gh-aw/reference/copilot-custom-agents/)
and [Imports reference](https://github.github.com/gh-aw/reference/imports/),
the `imports:` field merges shared frontmatter and appends the body to the
workflow prompt. Only the **body** of files under `.github/agents/` is
merged into the prompt — frontmatter like `mcp-servers:` in an agent file
is **not** merged into the workflow's frontmatter (tested against
gh-aw v0.69.3, 2026-04-21). So EU Parliament Monitor splits the concerns:

- `.github/agents/news-generation.agent.md` (this file) — body-only.
  Contributes the shared Required Reading order and Stage Contract to
  every article-generating workflow prompt.
- `.github/workflows/shared/mcp/news-mcp-servers.md` — shared MCP
  component. Carries the four `mcp-servers:` mounts (European
  Parliament, World Bank, memory, sequential-thinking) in frontmatter.
  Imported as a shared component (no `on:` field), so gh-aw merges its
  `mcp-servers:` into the workflow frontmatter; any Markdown body in
  that file is also appended to the workflow prompt and is kept
  intentionally minimal.

Every article-generating news workflow imports **both**:

```yaml
imports:
  - .github/agents/news-generation.agent.md
  - shared/mcp/news-mcp-servers.md
```

`news-translate.md` does **not** import this agent — translation uses its
own multi-call flush pattern, is exempt from the single-PR rule, and
requires the MCP mounts via the shared component only.

All other frontmatter fields (`network`, `safe-outputs`, `permissions`,
`runtimes`, `steps`, `engine`, `on`, `timeout-minutes`, `concurrency`,
`tools:` for github/bash/agentic-workflows/repo-memory) stay in each
workflow because `imports:` does not merge those fields.

## Shared Required Reading (inherited by every importing workflow)

Read these files in order, once per run:

1. [`.github/prompts/00-scope-and-ground-rules.md`](../prompts/00-scope-and-ground-rules.md) — workspace scope, forbidden/allowed edits, neutrality
2. [`.github/prompts/08-infrastructure.md`](../prompts/08-infrastructure.md) — frontmatter + MCP gateway setup
3. [`.github/prompts/01-data-collection.md`](../prompts/01-data-collection.md) — Stage A
4. [`.github/prompts/07-mcp-reference.md`](../prompts/07-mcp-reference.md) — canonical EP / World Bank / IMF tool tables
5. [`.github/prompts/02-analysis-protocol.md`](../prompts/02-analysis-protocol.md) — Stage B (2 passes, ≥ 18 min)
6. [`.github/prompts/03-analysis-completeness-gate.md`](../prompts/03-analysis-completeness-gate.md) — Stage C (blocking)
7. [`.github/prompts/04-article-generation.md`](../prompts/04-article-generation.md) — Stage D (2 passes)
8. [`.github/prompts/05-analysis-to-article-contract.md`](../prompts/05-analysis-to-article-contract.md) — AI-First contract
9. [`.github/prompts/06-pr-and-safe-outputs.md`](../prompts/06-pr-and-safe-outputs.md) — **single-PR rule**
10. On error → [`.github/prompts/09-troubleshooting.md`](../prompts/09-troubleshooting.md)

## Analysis Artifacts — Canonical References (Stage B anchor)

Before Stage B begins, read these four canonical analysis docs in full. They
are the single source of truth for every artifact produced under
`analysis/daily/<YYYY-MM-DD>/<article-type-slug>/`:

1. [`analysis/methodologies/ai-driven-analysis-guide.md`](../../analysis/methodologies/ai-driven-analysis-guide.md) — the **10-step protocol** every workflow follows (Rules 1–22, Step 10.5 = `methodology-reflection.md` as final artifact)
2. [`analysis/methodologies/artifact-catalog.md`](../../analysis/methodologies/artifact-catalog.md) — master map: every artifact → methodology + template + depth floor + Mermaid type
3. [`analysis/methodologies/per-artifact-methodologies.md`](../../analysis/methodologies/per-artifact-methodologies.md) — 34 `### sections`, one per artifact type, with construction rules and quality signals
4. [`analysis/templates/README.md`](../../analysis/templates/README.md) — index of the **39 templates** (6 framework + 14 agentic-workflow + 25 per-artifact)

Per-artifact line floors live in [`reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json) and are enforced at Stage C by `npm run validate-analysis`.

**Every article PR body MUST cite the run's `analysis/daily/<date>/<slug>/manifest.json` path** so reviewers can audit the produced artifact set.

## Shared Stage Contract (inherited by every importing workflow)

Every article-generating workflow is a single unified `news-<type>.md` that
runs Stages A → B → C → D → E in one session (`timeout-minutes: 45`,
active-work budget 22–27 min before the single safe-outputs
`create_pull_request` call — must land by minute ≤ 28 to stay inside the
~28–30 min safeoutputs MCP session TTL):

```
Stage A · Data Collection (≤ 5 min)
  → Stage B · Analysis Artifacts (Pass 1 + Pass 2, ≥ 18 min)
    → Stage C · Completeness Review — BLOCKING (agent-side, Pass 2)
      → Stage D · Deterministic Article Render
        (npm run generate-article -- --run "${ANALYSIS_DIR}")
        → Stage E · Single PR call (safeoutputs___create_pull_request,
          exactly once, at end of run, by minute ≤ 28)
```

The split `news-<type>-analysis.md` + `news-<type>-article.md` families, the
manual `news-article-generator.md` helper, and `news-translate-reconciler.yml`
were removed in the April-2026 migration to the deterministic aggregator
pipeline. The unified flow is the single supported pattern for every
article-generating run; `news-translate.md` remains as the only multi-call
flush workflow and is exempt from the single-PR rule.

The workflow's own body supplies article-type-specific details: the
`ARTICLE_TYPE_SLUG`, data window, primary feed list, per-type required
analysis artifacts, and the final PR-creation call. Everything above is
identical across every article-generating workflow and lives here.

## MCP Server Hard Rules (repeat — also in `08-infrastructure.md`)

- ❌ **Never** add `tools: ["*"]` / `allowed: ["*"]` inside an `mcp-servers`
  entry — the gh-aw MCP gateway (`awmg`) treats `*` as a literal tool name.
  Omit the field entirely. (This file **does not** set `tools` on any
  server, so importing workflows inherit the correct behavior.)
- ❌ Never use `node:lts-alpine` — the compile workflow normalizes it to
  `node:25-alpine` and fails if it persists.
- ✅ `EP_REQUEST_TIMEOUT_MS: "120000"` (120 s) on `european-parliament`
  handles slow feed endpoints.
- Pinned versions: `european-parliament-mcp-server@1.2.11`,
  `worldbank-mcp@1.0.1`.
