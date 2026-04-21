<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📋 EU Parliament Monitor — Agentic Workflow Prompt Library

**Classification:** Public · **Owner:** Hack23 AB · **Version:** 2.0 (2026-04-21)

## Purpose

Ten focused prompt files, one bounded context each, composed by every `news-*.md`
gh-aw workflow. This replaces the 1,789-line `SHARED_PROMPT_PATTERNS.md` monolith.

## File Index

| # | File | Purpose |
|---|------|---------|
| 00 | [`00-scope-and-ground-rules.md`](00-scope-and-ground-rules.md) | Workspace scope, forbidden/allowed edits, neutrality, one-PR rule |
| 01 | [`01-data-collection.md`](01-data-collection.md) | EP MCP feeds + direct fallbacks, deep-fetch, WB/IMF context |
| 02 | [`02-analysis-protocol.md`](02-analysis-protocol.md) | Pipeline, methodologies/templates, mandatory 2-pass |
| 03 | [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md) | `validate-analysis-completeness` blocking gate |
| 04 | [`04-article-generation.md`](04-article-generation.md) | Prose-first structure, depth floors, charts, keywords/title/description |
| 05 | [`05-analysis-to-article-contract.md`](05-analysis-to-article-contract.md) | AI-First contract, AI_MARKER sentinels, per-type inputs |
| 06 | [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) | **Single-PR rule**, analysis-only fallback, noop diagnostics |
| 07 | [`07-mcp-reference.md`](07-mcp-reference.md) | EP/WB/IMF tool tables, parameter corrections, reliability matrix |
| 08 | [`08-infrastructure.md`](08-infrastructure.md) | Required frontmatter, `mcp-setup.sh`, client env vars |
| 09 | [`09-troubleshooting.md`](09-troubleshooting.md) | AWF firewall diagnostic, error→root-cause table |

## Import Order for Article Workflows (Stage A → D)

Every `news-*.md` except `news-translate.md` reads prompts in this order:

1. **00-scope** — before anything else: what you may and may not touch.
2. **08-infrastructure** — frontmatter you inherited from the workflow.
3. **Stage A — Data Collection** → [`01-data-collection.md`](01-data-collection.md) + [`07-mcp-reference.md`](07-mcp-reference.md)
4. **Stage B — Analysis (2 passes)** → [`02-analysis-protocol.md`](02-analysis-protocol.md)
5. **Stage C — Completeness Gate** → [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md)
6. **Stage D — Article (2 passes) → PR** → [`04-article-generation.md`](04-article-generation.md) + [`05-analysis-to-article-contract.md`](05-analysis-to-article-contract.md) → [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md)
7. **On error** → [`09-troubleshooting.md`](09-troubleshooting.md)

## The Single-PR Rule (summary)

> Every article-generating workflow calls `safeoutputs___create_pull_request`
> **exactly once**, at the very end of the run, after all files are written.
> The only exception is `news-translate.md`, which uses multi-call flush with
> `max-patch-size` + re-calls. Checkpoint PRs, keep-alive heartbeats, and
> progressive safe outputs are **banned** and CI-lint-enforced by
> `scripts/lint-prompts.js`.

Full rationale: [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md).

## Token Discipline

- Each prompt file ≤ 300 lines, one bounded context.
- No file repeats content from another file; cross-links only.
- Bash diagnostics live in `scripts/`, not in prompts.
- Reliability tables live in `07-mcp-reference.md` only.
