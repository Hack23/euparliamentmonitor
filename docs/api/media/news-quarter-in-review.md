---
name: "News: EU Parliament Quarter In Review — Unified"
description: Generates a single PR containing analysis artifacts and the rendered quarter-in-review article (Stages A → B → C → D → E in one workflow).
strict: false
on:
  schedule:
    - cron: "0 8 5 * *"  # 1st of each month around 08:00 UTC
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
      slug: quarter-in-review
  - uses: shared/config/news-pat-pr-fallback.md
    with:
      slug: quarter-in-review
      workflowName: "News: EU Parliament Quarter In Review — Unified"
  - shared/mcp/news-mcp-servers.md
  - shared/prompts/news-unified-runtime.md
  - uses: shared/prompts/news-unified-stages.md
    with:
      slug: quarter-in-review

concurrency:
  group: "news-quarter-in-review"
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
    labels: [agentic-news, analysis-data, "type:quarter-in-review"]
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
    run: bash scripts/prefetch-ep-feeds.sh quarter-in-review procedures documents events adopted-texts

# post-steps + jobs.pat-pr-fallback inherited from shared/config/news-pat-pr-fallback.md.

engine:
  id: copilot
  model: claude-sonnet-4.6
---
# 📰 EU Parliament Quarter In Review — Unified Workflow

## 🔖 Workflow Parameters

| Parameter | Value |
|-----------|-------|
| `ARTICLE_TYPE_SLUG` | `quarter-in-review` |
| Family | **Unified** (Stages A → B → C → D → E in one workflow) |
| Data window | next trailing 90 days |
| Primary feeds | `get_plenary_sessions`, `get_events_feed`, `get_procedures_feed` with `timeframe: "one-month"`; mine forward statements from prior monthly runs. |
| Stage A budget | **≤ 4 min** (tighter than other workflows — 90-day forward data window is larger) |
| Stage B budget (2 passes) | **22–28 min — HARD CEILING per `article-horizons.ts`** (do **not** exceed the per-slug ceiling on Stage B even if Pass 2 still has shallow sections; force `GATE_RESULT=ANALYSIS_ONLY` instead) |
| Stage C budget (gate + optional Pass 3) | ≤ 4 min |
| Stage D budget | ≤ 2 min (deterministic) |
| Stage E budget (commit + single PR) | ≤ 2 min |
| **Stage C exit tripwire** | **minute 38 elapsed** (standard: 36; long-horizon prospective: 39; long-horizon retrospective: 38; electoral: 42) — the **decision threshold** for forcing `GATE_RESULT=ANALYSIS_ONLY` and (if late) skipping Stage D so the run can still reach the PR call. Per-slug stage ceilings live in `src/config/article-horizons.ts`; the tripwire backstops any per-stage overrun. **Note:** Stage D + E run *after* this tripwire, between the Stage C exit and the PR-call deadline. |
| **Hard PR-call deadline** | **minute ≤ 45 elapsed** (target ≤ 42) — deadline for the single safe-outputs `create_pull_request` call. Note: `engine.mcp.session-timeout` is intentionally NOT set — gh-aw v0.71.3 advertises this field but the bundled gateway image (v0.3.1) rejects it; the agent must finish within the 60-min `timeout-minutes` cap regardless. |
| Hard safety cap | 60-min `timeout-minutes` |
| PR rule | **Exactly one** `[news]` PR at end of run |


## 🎯 Article-Type Specifics

- Economic context (**IMF only** for macro/fiscal/monetary/trade) is mandatory — quarterly retrospectives always touch macro/policy.
- Long-horizon stage helpers: see [`.github/prompts/10-horizon-stage-helpers.md`](../prompts/10-horizon-stage-helpers.md) for the registry-driven Stage-A/B/C contract.
- Roll-call publication delay: the `0 8 5 * *` schedule (5th of the month) waits for EP roll-call data publication; the data window is **D-95 → D-5** for stable analysis.
- Mandatory artifacts: `mandate-fulfilment-scorecard.md` (per group), `legislative-pipeline-forecast.md` (retrospective transit times for the trailing quarter).
- Mine prior-run forward statements (per `01-data-collection.md` §8); resolve any expired carry-forward statements per [`forward-projection-methodology.md` §6](../../analysis/methodologies/forward-projection-methodology.md#6-carry-forward--forward-statement-quality-gate).


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

**Forward-statements registry seed (mandatory):**

```bash
HORIZON_END=$(date -u -d 'trailing 90 days' +%Y-%m-%d)
node scripts/aggregator/forward-statements-registry.js read \
  --status open \
  --horizon-from "$TODAY" \
  --horizon-to "$HORIZON_END" \
  > "${ANALYSIS_DIR}/data/forward-statements-open.json"
```

**Multi-day foreseen activities fan-out (mandatory — all plenary session days in the 90-day window):**

For each upcoming plenary session in the next trailing 90 days, identify the session
start date (Monday for Strasbourg 4-day, Wednesday for Brussels 2-day mini)
and call `get_meeting_foreseen_activities` for every day:
- Full session: `MTG-PL-<Mon>`, `MTG-PL-<Tue>`, `MTG-PL-<Wed>`, `MTG-PL-<Thu>`
- Mini-session: `MTG-PL-<Wed>`, `MTG-PL-<Thu>`

Each call uses `limit: 20`. Save results per day to
`${ANALYSIS_DIR}/data/foreseen-activities-<YYYY-MM-DD>.json`.

<!-- Date Context + Stages B → E + 🚫 Never section: imported from
     shared/prompts/news-unified-stages.md (with slug: quarter-in-review). -->
