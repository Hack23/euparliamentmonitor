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
| 01 | [`01-data-collection.md`](01-data-collection.md) | EP MCP feeds + direct fallbacks, deep-fetch, IMF primary economic + WB non-economic |
| 02 | [`02-analysis-protocol.md`](02-analysis-protocol.md) | Pipeline, methodologies/templates, mandatory 2-pass |
| 03 | [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md) | Agent-side completeness gate over artifacts, IMF evidence, and metadata readiness |
| 04 | [`04-article-generation.md`](04-article-generation.md) | Deterministic aggregator render, `article.md`, SEO title/description/keywords contract |
| 05 | [`05-analysis-to-article-contract.md`](05-analysis-to-article-contract.md) | AI-first artifact contract and read-before-render duties |
| 06 | [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) | **Single-PR rule**, analysis-only fallback, noop diagnostics |
| 07 | [`07-mcp-reference.md`](07-mcp-reference.md) | EP / IMF (primary economic) / WB (non-economic) tool tables, parameter corrections, reliability matrix |
| 08 | [`08-infrastructure.md`](08-infrastructure.md) | Required frontmatter, `mcp-setup.sh`, client env vars |
| 09 | [`09-troubleshooting.md`](09-troubleshooting.md) | AWF firewall diagnostic, error→root-cause table |

## Import Order for Article Workflows (Stage A → D)

Every `news-*.md` except `news-translate.md` reads prompts in this order:

1. **00-scope** — before anything else: what you may and may not touch.
2. **08-infrastructure** — frontmatter you inherited from the workflow.
3. **Stage A — Data Collection** → [`01-data-collection.md`](01-data-collection.md) + [`07-mcp-reference.md`](07-mcp-reference.md)
4. **Stage B — Analysis (2 passes)** → [`02-analysis-protocol.md`](02-analysis-protocol.md)
5. **Stage C — Completeness Gate** → [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md)
6. **Stage D — Deterministic article render → PR** → [`04-article-generation.md`](04-article-generation.md) + [`05-analysis-to-article-contract.md`](05-analysis-to-article-contract.md) + [`../../Article-Generation.md`](../../Article-Generation.md) → [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md)
7. **On error** → [`09-troubleshooting.md`](09-troubleshooting.md)

## Analysis Artifact Integration

Every article-generating workflow produces deep political analysis **before**
rendering article output. The chain is:

```
Stage A · Data Collection (01-data-collection.md + 07-mcp-reference.md)
      → Stage B · Analysis Artifacts (02-analysis-protocol.md)
        authoritative protocol: analysis/methodologies/ai-driven-analysis-guide.md (10 steps)
        master artifact map:    analysis/methodologies/artifact-catalog.md
        per-artifact rules:     analysis/methodologies/per-artifact-methodologies.md
        39 templates:           analysis/templates/  (14 agentic-workflow [incl. 6 reusable framework] + 25 per-artifact)
    → Stage C · Completeness Gate (03-analysis-completeness-gate.md)
          per-artifact floors:  analysis/methodologies/reference-quality-thresholds.json
       → Stage D · Deterministic Article Render (04-article-generation.md + 05-analysis-to-article-contract.md + Article-Generation.md)
             Read-Before-Render: agent MUST read every artifact in analysis/daily/<run>/ before invoking the aggregator
             artifact → section map: 04-article-generation.md § 7.1 and Article-Generation.md § Templates and Artifact-to-Article Mapping
        → Stage E · Single PR (06-pr-and-safe-outputs.md) — one safeoutputs___create_pull_request call
```

An article that does not cite a specific `analysis/daily/<run>/…` artifact for each analytical section fails Stage C and is blocked from PR creation. `methodology-reflection.md` is the final artifact of every run (after `workflow-audit.md`).

## Upstream gh-aw documentation (authoritative)

Every change to `.github/workflows/*.md`, `.github/agents/*.md`, or `.github/prompts/*.md` should be anchored against the upstream gh-aw doc sets:

- **Abridged:** https://github.github.com/gh-aw/llms-small.txt
- **Full:** https://github.github.com/gh-aw/llms-full.txt
- **Blog series:** https://github.github.com/gh-aw/_llms-txt/agentic-workflows.txt
- **Repository:** https://github.com/github/gh-aw

The pinned gh-aw version for this repo lives in `.github/workflows/compile-agentic-workflows.yml`.

## The Single-PR Rule (summary)

> Every article-generating workflow calls `safeoutputs___create_pull_request`
> **exactly once**, at the very end of the run, after all files are written.
> The only exception is `news-translate.md`, which uses multi-call flush with
> `max-patch-size` + re-calls. Checkpoint PRs, keep-alive heartbeats, and
> progressive safe outputs are **banned** and CI-lint-enforced by
> [`scripts/lint-prompts.js`](../../scripts/lint-prompts.js).

Full rationale: [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md).

## Drift-guard Lint (`npm run lint:prompts`)

[`scripts/lint-prompts.js`](../../scripts/lint-prompts.js) enforces four
rules across every `.github/workflows/news-*.md` file (news-translate.md is
the single, fully-exempt workflow):

1. `safeoutputs___create_pull_request` appears **at most once** per workflow.
2. None of the banned phrases appear: `checkpoint pr`, `checkpoint-pr`,
   `keep-alive`, `keepalive`, `keep alive`, `heartbeat`,
   `progressive safe output` (case-insensitive).
3. No `safeoutputs___push_repo_memory` references.
4. **Analysis-awareness** — every news-*.md must either directly reference
   both `analysis/methodologies/ai-driven-analysis-guide.md` and
   `03-analysis-completeness-gate.md`, **or** import
   [`.github/agents/news-generation.agent.md`](../agents/news-generation.agent.md)
   (which provides both anchors).

**Execution surface:**

- Local: `npm run lint:prompts`
- CI: job `compile-agentic-workflows.yml` runs `node scripts/lint-prompts.js`
  before compiling `.md` → `.lock.yml`.
- Unit test: `test/unit/lint-prompts.test.js` locks the rule set against
  regressions.

## `SHARED_PROMPT_PATTERNS.md` — redirect stub

The former 1,789-line monolith has been decomposed into this 10-file library.
[`SHARED_PROMPT_PATTERNS.md`](SHARED_PROMPT_PATTERNS.md) now exists **only as
a redirect stub** mapping old sections → new files. New contributions must
land in the appropriately-numbered file above; do **not** re-expand the
monolith.

## Token Discipline

- Each prompt file ≤ 300 lines, one bounded context.
- No file repeats content from another file; cross-links only.
- Bash diagnostics live in `scripts/`, not in prompts.
- Reliability tables live in `07-mcp-reference.md` only.
