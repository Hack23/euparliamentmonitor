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

## ⚡ Invocation Budget Discipline (universal — apply to every article workflow)

**Background.** The Copilot CAPI enforces a **hard cap of 100 LLM
invocations per workflow session**. Run 25799686522 (`news-propositions`)
exhausted that cap with **only 2 artifacts short of completion**:
~50% of invocations were EP MCP data-gathering (`track_legislation` ×7
plus 15 other EP MCP calls); the remainder went to artifact writing,
which is 38+ files × ~1.5 invocations/file. Total budget = ~57+ ~50
= 107 > 100. See [`.github/prompts/09-troubleshooting.md`](.github/prompts/09-troubleshooting.md) §5
(run 25799686522 row) for the audit-confirmed forensics.

### Rule 1 — Pre-fetched feed data is already on disk before Stage A

Every article workflow runs `bash scripts/prefetch-ep-feeds.sh <slug> <feeds…>`
in a deterministic pre-agent step. The script writes one JSON file per feed
to `${ANALYSIS_DIR}/data/<feed>-feed.json` (with `{"items":[]}` placeholder
on fetch failure). On the agent's first Stage A bash block:

1. List `${ANALYSIS_DIR}/data/` and inventory which feed files exist.
2. **Skip the corresponding MCP call** for any feed with a non-placeholder
   file. Read the JSON directly from disk instead.
3. Only call MCP for feed endpoints **not** pre-fetched, or for deep-fetch
   tools (`track_legislation`, `get_voting_records`, `get_meeting_decisions`).

### Rule 2 — Stage A hard cap = ≤ 5 EP MCP tool calls

After accounting for pre-fetched feeds, cap total Stage A EP MCP calls
at **5**. On the 5th call, stop data collection and proceed to Stage B
immediately. Prefer ≤ 3 `track_legislation` deep-fetches and ≤ 2
supplementary feed/search calls for slugs where pre-fetched coverage is
complete.

If a 6th EP MCP call is genuinely required (e.g. a required deep-fetch that
has no pre-fetched equivalent), log an explicit acknowledged exception:
```
# INVOCATION_CAP_ACKNOWLEDGED: 6th EP MCP call required for <reason>
```
This exception must appear in `intelligence/mcp-reliability-audit.md`.

### Rule 3 — Stage B write-first with thresholds cache (no re-reads per artifact)

At the **start of Stage B** (before writing any artifact), call:

```bash
bash scripts/cache-analysis-thresholds.sh "${ANALYSIS_DIR}" "<article-type-slug>"
```

This writes `${ANALYSIS_DIR}/runs/thresholds-cache.json` — a filtered snapshot
of `analysis/methodologies/reference-quality-thresholds.json` for the active
article type. Then, for each artifact:

1. Read the thresholds from the **cache file** (`runs/thresholds-cache.json`)
   — not from `reference-quality-thresholds.json` directly.
2. Read the matching template from `analysis/templates/<artifact>.md` **once**.
3. Pre-size each artifact write to meet the floor on the **first** attempt.

**Banned patterns** (each wastes ≥ 2 invocations and is the proximate cause
of cap-exhaustion on long runs):

- Write short stub → `wc -l` → realize it's short → `cat >> file` extend.
- Repeated `wc -l` calls across artifacts to verify floors after writing.
- Re-reading `reference-quality-thresholds.json` per artifact (use the cache).

Pass 2 (deepening) MUST still happen, but it MUST be a single coherent
extension pass per artifact — never a discovery + fix loop.

## 🚦 Data-Mode Declaration (Stage A → manifest.json → Stage C)

At the end of Stage A, declare the run's data availability mode. This flows
into `manifest.json` and then into `npm run validate-analysis` (Stage C),
which auto-adjusts per-artifact line floors rather than relying on agent
self-declaration.

### Step 1 — Read prefetch-status.json

The pre-agent step wrote `${ANALYSIS_DIR}/data/prefetch-status.json` with:
```json
{
  "prefetchMode": "green|degraded-feeds|minimal",
  "fetched": N,
  "placeholders": M,
  "total": T
}
```

Read this file at Stage A start to understand EP API availability.

### Step 2 — Determine the final data mode

Combine the prefetch result with live Stage A probes:

| Condition | dataMode | Line-floor factor |
|-----------|----------|-------------------|
| All feeds fetched + IMF OK + voting OK | `full` | 1.00 |
| 1+ feeds unavailable (after 3 retries) | `degraded-feeds` | 0.80 |
| IMF data unavailable / missing | `degraded-imf` | 0.85 |
| EP roll-call data missing (0 voting records) | `degraded-voting` | 0.85 |
| Most EP feeds unavailable + IMF absent | `minimal` | 0.65 |

When multiple degradations apply simultaneously, **pick the lowest factor from
the table above and stop**. Do not compose modes — `degraded-feeds` + `degraded-imf`
resolves to `degraded-feeds` (0.80 < 0.85). Use `minimal` only when its own
trigger ("most EP feeds unavailable + IMF absent") independently applies; do
not infer `minimal` by combining two single-axis degradations.

### Step 3 — Write dataMode to manifest.json

At the end of Stage A, add `dataMode` to `manifest.json`:
```json
{
  "articleType": "<slug>",
  "dataMode": "degraded-feeds",
  ...
}
```

Stage C (`npm run validate-analysis "${ANALYSIS_DIR}"`) reads `manifest.dataMode`
and applies the corresponding factor to all per-artifact line floors automatically.
Structural checks (Mermaid diagrams, WEP bands, Admiralty grades, SAT ≥ 10) are
**never** reduced regardless of data mode.

