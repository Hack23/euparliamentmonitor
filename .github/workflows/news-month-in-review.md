---
name: "News: EU Parliament Month in Review — Unified"
description: Generates a single PR containing analysis artifacts and the rendered month-in-review article (Stages A → B → C → D → E in one workflow).
strict: false
on:
  schedule:
    - cron: "0 10 28 * *"  # 28th of each month around 10:00 UTC
  workflow_dispatch:
    inputs:
      force_generation:
        description: Force generation even if recent analysis exists
        type: boolean
        required: false
        default: true

permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read
  discussions: read
  security-events: read

# Hard safety cap 60 min; active-work target ≤ minute 45; single safe-outputs
# create_pull_request by minute ≤ 45. Per-slug budgets in src/config/article-horizons.ts.
# See .github/workflows/README.md "Workflow timing contract" for full rationale.
timeout-minutes: 60


imports:
  - .github/agents/news-generation.agent.md
  - shared/config/news-common-settings.md
  - shared/config/news-safe-outputs-domains.md
  - shared/config/news-safe-outputs-head.md
  - uses: shared/config/news-tools.md
    with:
      slug: month-in-review
  - uses: shared/config/news-pat-pr-fallback.md
    with:
      slug: month-in-review
      workflowName: "News: EU Parliament Month in Review — Unified"
  - shared/mcp/news-mcp-servers.md
  - shared/prompts/news-unified-runtime.md
  - uses: shared/prompts/news-unified-stages.md
    with:
      slug: month-in-review

concurrency:
  group: "news-month-in-review"
  cancel-in-progress: false

# tools: inherited from shared/config/news-tools.md (parameterized by slug).

safe-outputs:
  # max-patch-size kept inline: gh-aw v0.74.1 does NOT propagate
  # safe-outputs.max-patch-size via imports (resets to default 1024).
  # 10 MB ceiling prevents legitimate analysis-only patches from being rejected.
  max-patch-size: 10240
  # threat-detection + bundle-prerequisite steps + allowed-domains are inherited
  # from shared/config/news-safe-outputs-head.md and -domains.md. Add domains
  # globally there; declare slug-specific overrides here only if needed.
  create-pull-request:
    title-prefix: "[news] "
    labels: [agentic-news, analysis-data, "type:month-in-review"]
    draft: false
    expires: 14d
    allowed-base-branches: ["main"]
    max: 1
    # Resilience knobs (per upstream reference/safe-outputs-pull-requests.md):
    if-no-changes: warn              # noop runs warn instead of erroring
    fallback-as-issue: true          # if PR creation blocked, open issue link
    auto-close-issue: false          # not issue-triggered — never auto-close
    excluded-files:                  # never commit auto-generated artifacts
      - "**/*.lock"
      - "node_modules/**"
      - ".github/workflows/*.lock.yml"
  dispatch-workflow:
    workflows: [news-translate]
    max: 1

steps:
  - name: Setup Node.js
    uses: actions/setup-node@53b83947a5a98c8d113130e565377fae1a50d02f # v6.3.0
    with:
      node-version: '26'

  - name: Install dependencies
    run: |
      npm ci --prefer-offline --no-audit

  - name: Build TypeScript
    run: |
      npm run build

  - name: Copy mermaid + chart vendor assets
    run: |
      npm run copy-vendor

  - name: Pre-fetch EP feeds (deterministic Stage A)
    run: bash scripts/prefetch-ep-feeds.sh month-in-review procedures documents events adopted-texts

# post-steps + jobs.pat-pr-fallback inherited from shared/config/news-pat-pr-fallback.md.

engine:
  id: copilot
  model: claude-sonnet-4.6
---
# 📰 EU Parliament Month in Review — Unified Workflow

## 🔖 Workflow Parameters

| Parameter | Value |
|-----------|-------|
| `ARTICLE_TYPE_SLUG` | `month-in-review` |
| Family | **Unified** (Stages A → B → C → D → E in one workflow) |
| Data window | last 30 days |
| Primary feeds | `get_adopted_texts_feed`, `get_events_feed`, `get_procedures_feed` with `timeframe: "one-month"`. |
| Stage A budget | **≤ 4 min** (tighter than other workflows — 30-day data window is larger) |
| Stage B budget (2 passes) | **22–28 min — HARD CEILING per `article-horizons.ts`** (do **not** exceed the per-slug ceiling on Stage B even if Pass 2 still has shallow sections; force `GATE_RESULT=ANALYSIS_ONLY` instead) |
| Stage C budget (gate + optional Pass 3) | ≤ 4 min |
| Stage D budget | ≤ 2 min (deterministic) |
| Stage E budget (commit + single PR) | ≤ 2 min |
| **Stage C exit tripwire** | **minute 36 elapsed** (long-horizon prospective: 39; long-horizon retrospective: 38; electoral: 42) — the **decision threshold** for forcing `GATE_RESULT=ANALYSIS_ONLY` and (if late) skipping Stage D so the run can still reach the PR call. Per-slug stage ceilings live in `src/config/article-horizons.ts`; the tripwire backstops any per-stage overrun. **Note:** Stage D + E run *after* this tripwire, between the Stage C exit and the PR-call deadline. |
| **Hard PR-call deadline** | **minute ≤ 45 elapsed** (target ≤ 42) — deadline for the single safe-outputs `create_pull_request` call. Note: `engine.mcp.session-timeout` is intentionally NOT set — gh-aw v0.71.3 advertises this field but the bundled gateway image (v0.3.1) rejects it; the agent must finish within the 60-min `timeout-minutes` cap regardless. |
| Hard safety cap | 60-min `timeout-minutes` |
| PR rule | **Exactly one** `[news]` PR at end of run |


## 🎯 Article-Type Specifics

- Long-horizon stage helpers: see [`.github/prompts/10-horizon-stage-helpers.md`](../prompts/10-horizon-stage-helpers.md) for the registry-driven Stage-A/B/C contract.
- Economic context is **mandatory** and must be sourced from **IMF**. World Bank is cited for non-economic domains (governance WGI, demographics, social, environment, defence-spending). See [`.github/skills/imf-data-integration.md`](../skills/imf-data-integration.md) and [`analysis/methodologies/imf-indicator-mapping.md §8`](../../analysis/methodologies/imf-indicator-mapping.md#8-per-article-type-indicator-minimums) (`month-in-review` ≥ 2 IMF indicators).
- Cross-reference prior month-ahead predictions; produce a confirmed/refuted tally.
- Include `intelligence/historical-baseline.md` in the analysis set.


### Stage A — Data Collection (Ref: 01, 07)

Run the canonical gateway block from `08-infrastructure.md` §4. Source
`scripts/mcp-setup.sh`, then `scripts/wb-mcp-probe.sh` and
`scripts/imf-mcp-probe.sh`. Collect EP feed data first; fall back to
direct endpoints on failure. Deep-fetch up to 10 procedures / voting
records / meeting decisions into `${ANALYSIS_DIR}/data/`. Target ≤ 5 min.

```bash
source scripts/mcp-setup.sh
mkdir -p "${ANALYSIS_DIR}/data" "${ANALYSIS_DIR}/cache/imf"
scripts/imf-mcp-probe.sh > "${ANALYSIS_DIR}/cache/imf/probe-summary.json" &
IMF_PROBE_PID=$!
source scripts/wb-mcp-probe.sh
# Run EP MCP collection now while the IMF probe is still in the background.
# Wait immediately before Stage B so cache/imf is available for provenance.
wait "$IMF_PROBE_PID" || true
```

<!-- Date Context + Stages B → E + 🚫 Never section: imported from
     shared/prompts/news-unified-stages.md (with slug: month-in-review). -->
