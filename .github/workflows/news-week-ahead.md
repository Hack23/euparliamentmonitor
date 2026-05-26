---
name: "News: EU Parliament Week Ahead — Unified"
description: Generates a single PR containing analysis artifacts and the rendered week-ahead article (Stages A → B → C → D → E in one workflow).
strict: false
# gh-aw v0.76+ checkout config — full-history clone for the agent job so
# `git log`, `git merge-base`, and safe-outputs diff/base computations
# do not race `git fetch --unshallow`. Shallow-clone races against
# concurrent commits to `main` were a secondary trigger for the host-side
# PAT fallback firing on otherwise-healthy runs.
checkout:
  fetch-depth: 0
on:
  schedule: weekly on friday around 7am  # fuzzy: scatters within ±1h of 07:00 UTC Fridays to avoid load spikes
  workflow_dispatch:

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
      slug: week-ahead
  - uses: shared/config/news-pat-pr-fallback.md
    with:
      slug: week-ahead
      workflowName: "News: EU Parliament Week Ahead — Unified"
  - shared/mcp/news-mcp-servers.md
  - shared/prompts/news-unified-runtime.md
  - uses: shared/prompts/news-unified-stages.md
    with:
      slug: week-ahead

concurrency:
  group: "news-week-ahead"
  cancel-in-progress: true

# tools: inherited from shared/config/news-tools.md (parameterized by slug).

safe-outputs:
  # max-patch-size kept inline: gh-aw v0.74.1 does NOT propagate
  # safe-outputs.max-patch-size via imports (resets to default 1024).
  # 10 MB ceiling prevents legitimate analysis-only patches from being rejected.
  max-patch-size: 10240
  # Explicit file ceiling — analysis + article + artifact files can reach 50+.
  max-patch-files: 100
  # Cron retries handle failures; auto-created failure issues are noise.
  report-failure-as-issue: false
  # threat-detection + bundle-prerequisite steps + allowed-domains are inherited
  # from shared/config/news-safe-outputs-head.md and -domains.md. Add domains
  # globally there; declare slug-specific overrides here only if needed.
  create-pull-request:
    # Use the org PAT so the bundle push has `workflows: write` permission.
    # The default GITHUB_TOKEN cannot push a branch whose tree differs from
    # main on ANY `.github/workflows/*` file — GitHub's pre-receive hook
    # compares the new branch's tree against main (not just the pushed
    # commits), so a stale base ref alone is enough to trigger
    # "refusing to allow a GitHub App to create or update workflow
    # .github/workflows/<other>.lock.yml without workflows permission".
    # The same token also gates the GraphQL `createCommitOnBranch` call
    # which 403s on the App token. Root cause of regression runs
    # #26019545674 (motions) and #26017383773 (propositions), both
    # 2026-05-18. The pat-pr-fallback path (PR #1903 / this PR) stays as
    # belt-and-braces; this wiring eliminates the need for it in the
    # happy path. Falls back to GITHUB_TOKEN for forks/dispatched runs
    # where the org secret isn't available.
    github-token: ${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
    title-prefix: "[news] "
    labels: [agentic-news, analysis-data, "type:week-ahead"]
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
    run: bash scripts/prefetch-ep-feeds.sh week-ahead procedures documents events

# post-steps + jobs.pat-pr-fallback inherited from shared/config/news-pat-pr-fallback.md.

engine:
  id: copilot
  model: claude-sonnet-4.6
---
# 📰 EU Parliament Week Ahead — Unified Workflow

## 🔖 Workflow Parameters

| Parameter | Value |
|-----------|-------|
| `ARTICLE_TYPE_SLUG` | `week-ahead` |
| Family | **Unified** (Stages A → B → C → D → E in one workflow) |
| Data window | next 7 days |
| Primary feeds | `get_plenary_sessions`, `get_events_feed`, `get_procedures_feed` with `timeframe: "one-week"`; mine the next plenary agenda from `data.europarl.europa.eu`. |
| Stage A budget | ≤ 4–5 min (per `article-horizons.ts`) |
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
- Mine prior-run forward statements (per `01-data-collection.md` §8) and carry ≥ 3 forward statements forward with status updates.
- Include `intelligence/scenario-forecast.md` in the analysis set; render probability-labelled scenario cards.
- **`intelligence/forward-projection.md` is mandatory** (§9.4): produce a WEP-banded probability table, structural-break tripwires, and reference-class table scoped to the 7-day horizon. Floor: 80 lines.
- **Seed synthesis from forward-statements registry** (per [`01a-data-fanout.md` §1](../prompts/01a-data-fanout.md)): read open items from `analysis/forward-statements/` before Stage B.
- **Multi-day foreseen activities fan-out** (per [`01a-data-fanout.md` §2](../prompts/01a-data-fanout.md)): call `get_meeting_foreseen_activities` for each of the 4 session days, not just day 1.
- **Monday urgency motion sweep** (per [`01a-data-fanout.md` §3](../prompts/01a-data-fanout.md)): when running on a Monday, poll `get_adopted_texts_feed` + `get_procedures_feed` for Rule 132 urgency motions.


### Stage A — Data Collection (Ref: 01, 07)

Run the canonical gateway block from `08-infrastructure.md` §4. Source
`scripts/mcp-setup.sh`, then `scripts/wb-mcp-probe.sh` and
`scripts/imf-mcp-probe.sh`. Collect EP feed data first; fall back to
direct endpoints on failure. Deep-fetch up to 10 procedures / voting
records / meeting decisions into `${ANALYSIS_DIR}/data/`. Target ≤ 4 min.

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
HORIZON_END=$(date -u -d '7 days' +%Y-%m-%d)
node scripts/aggregator/forward-statements-registry.js read \
  --status open \
  --horizon-from "$TODAY" \
  --horizon-to "$HORIZON_END" \
  > "${ANALYSIS_DIR}/data/forward-statements-open.json"
```

**Multi-day foreseen activities fan-out (mandatory — call all 4 session days):**

Determine the next plenary session start date (Monday of the next Strasbourg
session week), then call `get_meeting_foreseen_activities` for each day:
- Day 1: `sittingId: "MTG-PL-<session-monday>"`
- Day 2: `sittingId: "MTG-PL-<session-tuesday>"`
- Day 3: `sittingId: "MTG-PL-<session-wednesday>"`
- Day 4: `sittingId: "MTG-PL-<session-thursday>"`

Each call uses `limit: 20`. Save day-specific results to
`${ANALYSIS_DIR}/data/foreseen-activities-<YYYY-MM-DD>.json`.

**Monday urgency motion sweep (conditional — only when TODAY is a Monday):**

```bash
DOW=$(date -u -d "$TODAY" +%u)
if [ "$DOW" = "1" ]; then
  echo "Running urgency motion sweep for Monday $TODAY"
fi
```

When running on Monday: call `get_adopted_texts_feed` with `timeframe: "today"`
and `get_procedures_feed` with `timeframe: "today"` to capture Rule 132 urgency
motions before confirming agenda-specific predictions. Save to
`${ANALYSIS_DIR}/data/urgency-motions-${TODAY}.json`.

<!-- Date Context + Stages B → E + 🚫 Never section: imported from
     shared/prompts/news-unified-stages.md (with slug: week-ahead). -->
