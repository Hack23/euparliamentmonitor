---
name: "News: EU Parliament Week in Review — Unified"
description: Generates a single PR containing analysis artifacts and the rendered week-in-review article (Stages A → B → C → D → E in one workflow).
strict: false
# Checkout (gh-aw v0.76+): shallow clone (fetch-depth: 1) for fast checkout.
# Rationale:
#   * Full-history clones (fetch-depth: 0) took 14+ min on large repos,
#     consuming ~25 % of the 60-minute budget before the agent even starts.
#   * The safe-outputs prerequisite step in shared/config/news-safe-outputs-head.md
#     fetches the triggering commit (GITHUB_SHA) on demand — this satisfies
#     bundle-apply requirements without downloading full history upfront.
#   * Real-data feeds (`analysis/**/data/**`) are gitignored and excluded
#     by safe-outputs `excluded-files`, so the working tree is compact.
#   * Mirrors the efficient checkout pattern used in riksdagsmonitor workflows.
# Per the gh-aw v0.76 schema, `checkout.fetch-depth` is honoured only
# on top-level workflow files (placing it in a shared/imported config is
# silently ignored), which is why it lives here in every news-*.md.
checkout:
  fetch-depth: 1
on:
  schedule: weekly on saturday around 9am  # fuzzy: scatters within ±1h of 09:00 UTC Saturdays to avoid load spikes
  workflow_dispatch:

permissions:
  copilot-requests: write
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
      slug: week-in-review
  - uses: shared/config/news-pat-pr-fallback.md
    with:
      slug: week-in-review
      workflowName: "News: EU Parliament Week in Review — Unified"
  - shared/mcp/news-mcp-servers.md
  - shared/prompts/news-unified-runtime.md
  - uses: shared/prompts/news-unified-stages.md
    with:
      slug: week-in-review

concurrency:
  group: "news-week-in-review"
  cancel-in-progress: true

# tools: inherited from shared/config/news-tools.md (parameterized by slug).

safe-outputs:
  # max-patch-size kept inline: gh-aw still does not propagate
  # safe-outputs.max-patch-size via imports as of v0.76 (it silently resets
  # to the gh-aw default of 1024 in the compiled lock when set in a shared
  # config). 10240 KB is the schema maximum — raw EP-API feed dumps are
  # excluded below via `excluded-files: analysis/**/data/**`, so this
  # headroom is reserved exclusively for analysis + article artifacts.
  max-patch-size: 10240
  # Explicit file ceiling raised to 2500 (schema has no upper bound). Single
  # runs typically touch ≤50 files (analysis + article + meta); 2500 gives
  # generous headroom for large analysis runs and catch-up flushes.
  max-patch-files: 200
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
    labels: [agentic-news, analysis-data, "type:week-in-review"]
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
      - "analysis/**/data/**"         # raw EP API pre-fetched feeds (meps-feed.json
                                      # can exceed 8 MB alone); analysis artifacts
                                      # are in sibling dirs and are committed
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
    run: bash scripts/prefetch-ep-feeds.sh week-in-review procedures documents events adopted-texts

# post-steps + jobs.pat-pr-fallback inherited from shared/config/news-pat-pr-fallback.md.

engine:
  id: copilot
  model: claude-opus-4.8
---
# 📰 EU Parliament Week in Review — Unified Workflow

## 🔖 Workflow Parameters

| Parameter | Value |
|-----------|-------|
| `ARTICLE_TYPE_SLUG` | `week-in-review` |
| Family | **Unified** (Stages A → B → C → D → E in one workflow) |
| Data window | **D-36 → D-8** (28-day window ending 8 days ago — captures published EP roll-call votes; see ADR-006) |
| Primary feeds | `get_adopted_texts_feed`, `get_events_feed`, `get_procedures_feed` with `timeframe: "custom"` and `startDate: "$DATE_FROM"`; if `$DATE_TO` must be enforced, filter results client-side / in analysis (never `timeframe: "one-week"`). |
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
- Cross-reference prior week-ahead predictions — confirm or refute forward statements.
- Include `intelligence/historical-baseline.md` + `risk-scoring/risk-matrix.md` in the analysis set.

### Stage A — Data Collection (Ref: 01, 07)

Run the canonical gateway block from `08-infrastructure.md` §4. Source
`scripts/mcp-setup.sh`, then `scripts/wb-mcp-probe.sh` and
`scripts/imf-mcp-probe.sh`. For EP feed tools, collect the D-36→D-8
window using `timeframe: "custom"` with `startDate: "$DATE_FROM"`,
then drop any returned items after `"$DATE_TO"` to preserve the bounded
reporting window. Use direct endpoints (e.g. `get_plenary_sessions`,
`get_voting_records`, `get_speeches`) when exact `dateFrom`/`dateTo`
filtering is required or if feed collection fails. Deep-fetch up to 10
procedures / voting records / meeting decisions into
`${ANALYSIS_DIR}/data/`. Target ≤ 4 min.

**Slug-specific D-36 → D-8 reporting window (ADR-006):**
EP roll-call votes are published 2–6 weeks after the sitting; a D-0→D-7
window is structurally vote-empty. Shifting 8 days back and widening to
28 days ensures the window always contains at least one full EP plenary
week with published voting data. Compute the custom window in addition
to the canonical exports from `shared/prompts/news-unified-stages.md`:

```bash
DATE_TO=$(date -u -d '8 days ago' +%Y-%m-%d)
DATE_FROM=$(date -u -d '36 days ago' +%Y-%m-%d)
echo "DATE_FROM=$DATE_FROM" >> "$GITHUB_ENV"
echo "DATE_TO=$DATE_TO"     >> "$GITHUB_ENV"
```

**EP voting data note**: For feed tools, never use
`timeframe: "one-week"`; use `timeframe: "custom"` +
`startDate: "$DATE_FROM"` and trim items after `"$DATE_TO"`. For
direct tools that support them, use explicit `dateFrom`/`dateTo`
parameters. The D-0→D-7 window is structurally vote-empty because EP
roll-call data is published with a 2–6 week lag. The D-36→D-8 window
(28 days, ending 8 days ago) consistently contains at least one full EP
plenary week with published roll-call votes.

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
     shared/prompts/news-unified-stages.md (with slug: week-in-review). -->
