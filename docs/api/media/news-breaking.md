---
name: "News: EU Parliament Breaking News — Unified"
description: Generates a single PR containing analysis artifacts and the rendered breaking-news article (Stages A → B → C → D → E in one workflow).
strict: false
on:
  schedule: every 6h  # fuzzy: scatters minute offset across the 6h window to avoid load spikes
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
      slug: breaking
  - uses: shared/config/news-pat-pr-fallback.md
    with:
      slug: breaking
      workflowName: "News: EU Parliament Breaking News — Unified"
  - shared/mcp/news-mcp-servers.md
  - shared/prompts/news-unified-runtime.md
  - uses: shared/prompts/news-unified-stages.md
    with:
      slug: breaking

concurrency:
  group: "news-breaking"
  cancel-in-progress: true

# tools: inherited from shared/config/news-tools.md (parameterized by slug).

safe-outputs:
  # max-patch-size kept inline: gh-aw v0.74.1 does NOT propagate
  # safe-outputs.max-patch-size via imports (resets to default 1024).
  # 10 MB ceiling prevents legitimate analysis-only patches from being rejected.
  max-patch-size: 10240
  # Explicit file ceiling — analysis + article + artifact files can reach 50+.
  max-patch-files: 2500
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
    labels: [agentic-news, analysis-data, "type:breaking"]
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
    run: bash scripts/prefetch-ep-feeds.sh breaking procedures documents committee-documents events adopted-texts meps

# post-steps + jobs.pat-pr-fallback inherited from shared/config/news-pat-pr-fallback.md.

engine:
  id: copilot
  model: claude-sonnet-4.6
---
# 📰 EU Parliament Breaking News — Unified Workflow

## 🔖 Workflow Parameters

| Parameter | Value |
|-----------|-------|
| `ARTICLE_TYPE_SLUG` | `breaking` |
| Family | **Unified** (Stages A → B → C → D → E in one workflow) |
| Data window | today (last 12 h); fallback one-week |
| Primary feeds | `get_adopted_texts_feed`, `get_events_feed`, `get_procedures_feed`, `get_meps_feed` with `timeframe: "today"`; fall back to `"one-week"` per endpoint if empty/error. |
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
- Every document/event reference MUST include its publish date. Items without a recent date are not breaking news.
- If no new developments exist today, still ship a PR marked `gateResult=ANALYSIS_ONLY` in `manifest.json.history[]` — the deterministic renderer will then emit a noop placeholder rather than a full article.
- Include `intelligence/coalition-dynamics.md` and `intelligence/mcp-reliability-audit.md` in the analysis set (per `reference-quality-thresholds.json`).

### Stage A — Data Collection (Ref: 01, 07)

Run the canonical gateway block from `08-infrastructure.md` §4. Source
`scripts/mcp-setup.sh`, then `scripts/wb-mcp-probe.sh` and
`scripts/imf-mcp-probe.sh`. Collect EP feed data first; fall back to
direct endpoints on failure. Deep-fetch up to 10 procedures / voting
records / meeting decisions into `${ANALYSIS_DIR}/data/`. Target ≤ 4 min.

<!-- Date Context + Stages B → E + 🚫 Never section: imported from
     shared/prompts/news-unified-stages.md (with slug: breaking). -->

