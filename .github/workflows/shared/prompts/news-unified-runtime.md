---
---

<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

This workflow runs **Stages A → B → C → D → E** in a single agent session and
ships **one PR** containing both the analysis artifacts and the rendered
article(s) for the importing workflow's article type. There is no paired
article workflow — Stage D is a deterministic CLI invocation
(`npm run generate-article`), not an agent prose pass.

## 📚 Required Reading (read in this order, once per run)

1. [`.github/prompts/00-scope-and-ground-rules.md`](.github/prompts/00-scope-and-ground-rules.md) — workspace scope, forbidden/allowed edits, neutrality, **agent never writes article prose**
2. [`.github/prompts/08-infrastructure.md`](.github/prompts/08-infrastructure.md) — frontmatter, MCP gateway, stable folder layout, `--analysis-only` flag, `npm run generate-article`
3. [`.github/prompts/01-data-collection.md`](.github/prompts/01-data-collection.md) — Stage A
4. [`.github/prompts/07-mcp-reference.md`](.github/prompts/07-mcp-reference.md) — canonical tool tables
5. [`.github/prompts/02-analysis-protocol.md`](.github/prompts/02-analysis-protocol.md) — Stage B (2 passes; §2 re-run merge rule; §3 time budgets)
6. [`.github/prompts/03-analysis-completeness-gate.md`](.github/prompts/03-analysis-completeness-gate.md) — Stage C (blocking); §6b resuming a same-day folder
7. [`.github/prompts/04-article-generation.md`](.github/prompts/04-article-generation.md) — Stage D (deterministic CLI; metadata/SEO contract; agents do not author prose)
8. [`.github/prompts/05-analysis-to-article-contract.md`](.github/prompts/05-analysis-to-article-contract.md) — artifact-to-article contract and read-before-render duties
9. [`Article-Generation.md`](Article-Generation.md) — end-to-end article pipeline reference, UI/UX export contract, and `article.md` provenance
10. [`.github/prompts/06-pr-and-safe-outputs.md`](.github/prompts/06-pr-and-safe-outputs.md) — **single-PR rule**, unified-workflow PR contract
11. On error → [`.github/prompts/09-troubleshooting.md`](.github/prompts/09-troubleshooting.md)

## 🔁 Stage Order (absolute)

```
Stage A · Data Collection (per-slug budget — see article-horizons.ts)
  → Stage B · Analysis (Pass 1 + Pass 2, hard ceiling per article-horizons.ts)
    → Stage C · Completeness Gate (≤ 4 min) — BLOCKING; elapsed-time
      tripwire (per-slug) forces ANALYSIS_ONLY before Stage D
      → Stage D · Article Render (npm run generate-article — deterministic, ≤ 2 min)
        → Stage E · Single PR (≤ 2 min — by minute ≤ 45; exactly once)
```

> Per-slug minute boundaries are derived from `src/config/article-horizons.ts`
> (`stageBudgets`) and surfaced in the importing workflow's Workflow-Parameters
> table. The full table of per-family tripwires lives in
> [`.github/prompts/02-analysis-protocol.md` §3](.github/prompts/02-analysis-protocol.md#3--minimum-analysis-time).
