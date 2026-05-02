---
name: "News: EU Parliament Election Cycle — Unified"
description: Generates a single PR containing analysis artifacts and the rendered election-cycle article (Stages A → B → C → D → E in one workflow).
strict: false
on:
  schedule:
    - cron: "0 8 1 12 *"  # December 1st each year around 08:00 UTC
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

# Hard safety cap = 60 minutes (`timeout-minutes: 60`). Two deadlines
# drive this workflow's schedule:
#
#   1. **Active-work target ≤ minute 45.** Stages A → E complete by
#      minute 45, leaving a 15-minute buffer under the 60-min cap for
#      sandbox setup, MCP gateway boot, deterministic article render,
#      and git push. Per-slug stage budgets live in
#      `src/config/article-horizons.ts` and are surfaced in the
#      Workflow-Parameters table below.
#
#   2. **Single safe-output `create_pull_request` call by minute ≤ 45.**
#      The MCP gateway session lifetime is set per workflow via
#      `engine.mcp.session-timeout: 55m` (gh-aw v0.71.3+) so the
#      safeoutputs HTTP session outlasts the full run — superseding the
#      previous ~28–30 min hard TTL that capped the old 45-minute
#      schedule. See `.github/prompts/02-analysis-protocol.md` §3 for
#      the per-family stage budget table and tripwires.
timeout-minutes: 60

features:
  mcp-gateway: true

sandbox:
  agent: awf
  mcp:
    port: 8080
    # `keepalive-interval` (seconds) for HTTP MCP backends — see upstream
    # reference/mcp-gateway.md §4.1.3.5. Gateway default is 1500 (25 min);
    # we override to 300 so the gateway pings each backend (european-parliament,
    # world-bank, memory, sequential-thinking) every 5 minutes. This keeps
    # backend HTTP sessions warm during the 60-minute Stage B/C/D window
    # without triggering EP-side rate limits. Setting to -1 would disable
    # pings; 0/unset would silently default to 1500 — both unsafe for
    # long-running news runs that can idle on MCP for 10+ minutes during
    # Stage B Pass 2 prose review.
    keepalive-interval: 300

imports:
  - .github/agents/news-generation.agent.md
  - shared/mcp/news-mcp-servers.md

concurrency:
  group: "news-election-cycle"
  cancel-in-progress: false

runtimes:
  node:
    version: "25"

# Network allowlist — uses ecosystem identifiers where possible (per
# upstream docs/reference/network.md §"Ecosystem Identifiers"):
#   - `defaults` — basic infrastructure (certs, JSON schema, package mirrors)
#   - `github`   — all GitHub domains (replaces explicit github.com/api.github.com)
#   - `node`     — npm/npx ecosystem (needed for MCP server boot via npx)
# Plus EP/IMF/WB data sources and Hack23 publication targets as explicit domains.
network:
  allowed:
    - defaults
    - github
    - node
    - data.europarl.europa.eu
    - dataservices.imf.org
    - api.worldbank.org
    - "*.europa.eu"
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com

# Tools — all available read/edit/web/memory tools the agent needs for a
# resilient 60-min news-generation session. See upstream reference/tools.md
# and reference/github-tools.md.
tools:
  timeout: 300            # per-tool-call cap (bash, MCP, github, edit, web-fetch)
  startup-timeout: 90     # MCP server boot (npx package install) — covers
                          # european-parliament/world-bank/memory/sequential-thinking
  github:
    # `all` enables every read toolset EXCEPT `dependabot` (per upstream
    # docs — `dependabot` requires `vulnerability-alerts: read` which we
    # do not grant; news workflows do not need supply-chain alerts).
    toolsets:
      - all
  bash: true              # AWF-sandboxed shell — required for Stage A/D scripts
  edit:                   # explicit file-edit tool (analysis artifact authoring)
  web-fetch:              # fallback fetch for EP/IMF/WB pages when MCP miss
  agentic-workflows: true # workflow introspection (audit/log analysis)
  # Cache memory — restores partial analysis & data fetched in prior runs
  # so a failed safe-outputs PR call does not lose Stage A/B work. Per
  # upstream reference/cache-memory.md, the compiler auto-injects restore
  # and save steps using a workflow-scoped key.
  cache-memory:
    key: news-election-cycle-${{ github.repository_owner }}
    retention-days: 7
    allowed-extensions: [".md", ".json", ".jsonl", ".txt", ".html"]
  repo-memory:
    branch-name: memory/news-generation
    allowed-extensions: [".md", ".json"]
    max-file-size: 51200
    max-file-count: 50
    max-patch-size: 51200

safe-outputs:
  threat-detection:
    continue-on-error: true
  # Analysis artifacts can exceed the 1024 KB default patch limit; raise to
  # 10 MB to match news-translate.md and prevent legitimate analysis-only
  # patches from being rejected (see run 24961736954 for week-in-review).
  max-patch-size: 10240
  allowed-domains:
    - github                         # ecosystem: github.com + api.github.com (least-privilege; PR creation only)
    - data.europarl.europa.eu
    - www.europarl.europa.eu
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
  create-pull-request:
    title-prefix: "[news] "
    labels: [agentic-news, analysis-data, "type:election-cycle"]
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
      node-version: '25'

  - name: Install dependencies
    run: |
      npm ci --prefer-offline --no-audit

  - name: Build TypeScript
    run: |
      npm run build

  - name: Copy mermaid + chart vendor assets
    run: |
      npm run copy-vendor

# Post-execution recovery: when the agent commits Stage E output to a local
# news/* branch but the safeoutputs MCP create_pull_request call fails with
# session not found (well-known TTL expiry — see prompts/09-troubleshooting.md),
# the agent commits live only on the agent runner filesystem and are lost
# when the runner is reaped. This post-step writes
# /tmp/gh-aw/aw-agent-recovery.patch from the news/* branch, which the
# existing Upload agent artifacts step bundles into agent.zip and the
# host-side pat-pr-fallback job applies on its fresh main checkout via
# scripts/gh-aw-pat-pr-fallback.sh aw-*.patch loop. Originated from run
# #25028873034 (week-in-review) where 35 staged files and Stage C GREEN
# were lost because no patch was serialised.
post-steps:
  - name: Capture agent recovery patch
    if: always()
    continue-on-error: true
    run: bash scripts/gh-aw-capture-agent-patch.sh

jobs:
  pat-pr-fallback:
    name: Host-side PAT PR fallback
    needs: [agent]
    if: always() && needs.agent.result != 'skipped'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          ref: ${{ github.base_ref || github.event.pull_request.base.ref || github.ref_name || github.event.repository.default_branch }}
          token: ${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
          persist-credentials: false
          fetch-depth: 1

      - name: Download agent artifact
        uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8.0.1
        with:
          name: agent
          path: /tmp/gh-aw/

      - name: Run host-side PAT PR fallback
        env:
          GH_TOKEN: ${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
          GH_AW_PAT_PR_FALLBACK_TOKEN: ${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
          GH_AW_PAT_FALLBACK_SLUG: election-cycle
          GH_AW_PAT_FALLBACK_WORKFLOW_NAME: "News: EU Parliament Election Cycle — Unified"
          GH_AW_PAT_FALLBACK_RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        run: bash scripts/gh-aw-pat-pr-fallback.sh

engine:
  id: copilot
  model: claude-sonnet-4.6
  mcp:
    # gh-aw v0.71.3+: per-workflow MCP gateway session lifetime.
    # Set to 55m so the safeoutputs HTTP session outlasts the
    # 60-minute `timeout-minutes` cap with a 5-minute margin —
    # superseding the previous ~28–30 min hard TTL that capped the
    # old 45-minute schedule. Min 5m, no upper bound; format is a
    # Go duration string (kebab-case key only).
    session-timeout: 55m
  # max-continuations: 1 tells gh-aw NOT to enable autopilot mode — when this
  # equals 1 the compiler omits --autopilot from the Copilot CLI invocation so
  # the agent runs exactly once with no restarts.  Within-session runaway
  # protection is provided by tools.timeout (per-call cap) + timeout-minutes.
  max-continuations: 1
---
# 📰 EU Parliament Election Cycle — Unified Workflow

You are the **Analysis Agent** for EU Parliament Monitor. This workflow runs
**Stages A → B → C → D → E** in a single agent session and ships **one PR**
containing both the analysis artifacts and the rendered article(s) for
this article type. There is no paired article workflow — Stage D is a
deterministic CLI invocation (`npm run generate-article`), not an agent
prose pass.

## 📚 Required Reading (read in this order, once per run)

1. [`.github/prompts/00-scope-and-ground-rules.md`](../prompts/00-scope-and-ground-rules.md) — workspace scope, forbidden/allowed edits, neutrality, **agent never writes article prose**
2. [`.github/prompts/08-infrastructure.md`](../prompts/08-infrastructure.md) — frontmatter, MCP gateway, stable folder layout, `--analysis-only` flag, `npm run generate-article`
3. [`.github/prompts/01-data-collection.md`](../prompts/01-data-collection.md) — Stage A
4. [`.github/prompts/07-mcp-reference.md`](../prompts/07-mcp-reference.md) — canonical tool tables
5. [`.github/prompts/02-analysis-protocol.md`](../prompts/02-analysis-protocol.md) — Stage B (2 passes; §2 re-run merge rule; §3 time budgets)
6. [`.github/prompts/03-analysis-completeness-gate.md`](../prompts/03-analysis-completeness-gate.md) — Stage C (blocking); §6b resuming a same-day folder
7. [`.github/prompts/04-article-generation.md`](../prompts/04-article-generation.md) — Stage D (deterministic CLI; metadata/SEO contract; agents do not author prose)
8. [`.github/prompts/05-analysis-to-article-contract.md`](../prompts/05-analysis-to-article-contract.md) — artifact-to-article contract and read-before-render duties
9. [`Article-Generation.md`](../../Article-Generation.md) — end-to-end article pipeline reference, UI/UX export contract, and `article.md` provenance
10. [`.github/prompts/06-pr-and-safe-outputs.md`](../prompts/06-pr-and-safe-outputs.md) — **single-PR rule**, unified-workflow PR contract
11. On error → [`.github/prompts/09-troubleshooting.md`](../prompts/09-troubleshooting.md)

## 🔖 Workflow Parameters

| Parameter | Value |
|-----------|-------|
| `ARTICLE_TYPE_SLUG` | `election-cycle` |
| Family | **Unified** (Stages A → B → C → D → E in one workflow) |
| Data window | next EP-election window ±6 months |
| Primary feeds | `get_plenary_sessions`, `get_events_feed`, `get_procedures_feed` with `timeframe: "one-month"`; mine forward statements from prior monthly runs. |
| Stage A budget | **≤ 4 min** (tighter than other workflows — electoral-window forward data window is larger) |
| Stage B budget (2 passes) | **22–28 min — HARD CEILING per `article-horizons.ts`** (do **not** exceed the per-slug ceiling on Stage B even if Pass 2 still has shallow sections; force `GATE_RESULT=ANALYSIS_ONLY` instead) |
| Stage C budget (gate + optional Pass 3) | ≤ 4 min |
| Stage D budget | ≤ 2 min (deterministic) |
| Stage E budget (commit + single PR) | ≤ 2 min |
| **Stage C exit tripwire** | **minute 36 elapsed** (long-horizon: 39; electoral: 42) — the **decision threshold** for forcing `GATE_RESULT=ANALYSIS_ONLY` and (if late) skipping Stage D so the run can still reach the PR call. Per-slug stage ceilings live in `src/config/article-horizons.ts`; the tripwire backstops any per-stage overrun. **Note:** Stage D + E run *after* this tripwire, between the Stage C exit and the PR-call deadline. |
| **Hard PR-call deadline** | **minute ≤ 45 elapsed** (target ≤ 42) — deadline for the single safe-outputs `create_pull_request` call. Backed by `engine.mcp.session-timeout: 55m` (gh-aw v0.71.3+) which keeps the safeoutputs HTTP session alive for the full 60-min cap. |
| Hard safety cap | 60-min `timeout-minutes` |
| PR rule | **Exactly one** `[news]` PR at end of run |

> **⏱️ MCP session lifetime (gh-aw v0.71.3+)**: This workflow sets
> `engine.mcp.session-timeout: 55m`, which keeps the safeoutputs HTTP
> session on `localhost:3001` alive for 55 minutes — outlasting the
> 60-min `timeout-minutes` cap with a 5-min margin. The previous
> ~28–30 min hard TTL (which capped the old 45-min schedule and bit
> run #24963129839) no longer applies. The Stage C exit tripwire
> still fires at the slug-specific elapsed-minute mark in
> `src/config/article-horizons.ts` so Stage D + E retain enough
> budget to land the single PR call by minute ≤ 45. See
> [`09-troubleshooting.md`](../prompts/09-troubleshooting.md) §5 for
> the historical context.

## 🎯 Article-Type Specifics

- Economic context (**IMF only** for macro/fiscal/monetary/trade) is mandatory — election-cycle articles always touch macro/policy.
- Long-horizon stage helpers: see [`.github/prompts/10-horizon-stage-helpers.md`](../prompts/10-horizon-stage-helpers.md) for the registry-driven Stage-A/B/C contract.
- **Dual-track**: produce both Track A (term retrospective) and Track B (term forecast) artifacts per [`.github/prompts/12-electoral-cycle.md`](../prompts/12-electoral-cycle.md) and [`electoral-cycle-methodology.md`](../../analysis/methodologies/electoral-cycle-methodology.md). Mandatory artifacts include `term-arc.md`, `seat-projection.md`, `mandate-fulfilment-scorecard.md`, `forward-projection.md`, `presidency-trio-context.md`, `commission-wp-alignment.md`.
- Forward-projection lens: also apply [`.github/prompts/11-forward-projection.md`](../prompts/11-forward-projection.md) during Stage B (electoral overlay extends but does not replace the forward-projection protocol).
- Schedule `0 8 1 12 *` (annual, December) plus `workflow_dispatch` for ad-hoc runs. The plan's T-180/T-90/T-30 auto-triggers from `getElectionCalendarContext()` are tracked in a follow-up PR (see methodology §5); for now, run manually around election windows.
- Mine prior-run forward statements (per `01-data-collection.md` §8); horizon window = **1825 days** (5 years).

## 🗓️ Date Context + Stable Folder Resolution (MANDATORY — first bash block)

```bash
TODAY=$(date -u +%Y-%m-%d)
LAST_WEEK=$(date -u -d '7 days ago' +%Y-%m-%d)
ELECTION_BACK=$(date -u -d 'EP-election window ±6 months ago' +%Y-%m-%d)
RUN_EPOCH=$(date -u +%s)
RUN_ID="election-cycle-run$$-$RUN_EPOCH"
# Canonical stable folder — no -run<NN> suffix. Repeated runs on the same
# date share this dir and append to manifest.json.history[].
ANALYSIS_DIR=$(scripts/resolve-analysis-dir.sh "$TODAY" election-cycle)
WORKFLOW_START_EPOCH=$RUN_EPOCH
echo "ARTICLE_TYPE_SLUG=election-cycle"                  >> "$GITHUB_ENV"
echo "TODAY=$TODAY"                               >> "$GITHUB_ENV"
echo "RUN_ID=$RUN_ID"                             >> "$GITHUB_ENV"
echo "ANALYSIS_DIR=$ANALYSIS_DIR"                 >> "$GITHUB_ENV"
echo "WORKFLOW_START_EPOCH=$WORKFLOW_START_EPOCH" >> "$GITHUB_ENV"
```

> **⚠️ DATE GUARD**: When passing `dateFrom`/`dateTo` to any MCP tool,
> always derive dates from `$TODAY` / `$LAST_WEEK` / `$ELECTION_BACK`. Never
> hard-code a year.

## 🔁 Stage Order (absolute)

```
Stage A · Data Collection (per-slug budget — see article-horizons.ts)
  → Stage B · Analysis (Pass 1 + Pass 2, hard ceiling per article-horizons.ts)
    → Stage C · Completeness Gate (≤ 4 min) — BLOCKING; elapsed-time
      tripwire (per-slug) forces ANALYSIS_ONLY before Stage D
      → Stage D · Article Render (npm run generate-article — deterministic, ≤ 2 min)
        → Stage E · Single PR (≤ 2 min — by minute ≤ 45; exactly once)
```

> Per-slug minute boundaries are derived from
> `src/config/article-horizons.ts` (`stageBudgets`) and surfaced in
> the Workflow-Parameters table above. The full table of per-family
> tripwires lives in [`.github/prompts/02-analysis-protocol.md` §3](../prompts/02-analysis-protocol.md#3--minimum-analysis-time).

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

The election-cycle horizon spans up to ±6 months around the next EP election (early June of 2029, 2034, …). Until the EP MCP `getElectionCalendarContext()` helper is available, anchor the horizon-end on a fixed `+1825 days` (~5y) window from `$TODAY` to cover the full electoral arc — this matches the registry's `forwardStatementsHorizonDays` for `ELECTION_CYCLE`.

```bash
HORIZON_END=$(date -u -d "$TODAY +1825 days" +%Y-%m-%d)
node scripts/aggregator/forward-statements-registry.js read \
  --status open \
  --electoral-mode \
  --horizon-from "$TODAY" \
  --horizon-to "$HORIZON_END" \
  > "${ANALYSIS_DIR}/data/forward-statements-open.json"
```

**Multi-day foreseen activities fan-out (mandatory — all plenary session days in the electoral-window window):**

For each upcoming plenary session in the next EP-election window ±6 months, identify the session
start date (Monday for Strasbourg 4-day, Wednesday for Brussels 2-day mini)
and call `get_meeting_foreseen_activities` for every day:
- Full session: `MTG-PL-<Mon>`, `MTG-PL-<Tue>`, `MTG-PL-<Wed>`, `MTG-PL-<Thu>`
- Mini-session: `MTG-PL-<Wed>`, `MTG-PL-<Thu>`

Each call uses `limit: 20`. Save results per day to
`${ANALYSIS_DIR}/data/foreseen-activities-<YYYY-MM-DD>.json`.

### Stage B — Analysis (Ref: 02 §"Re-run improve/extend rule" — never no-op)

**If `${ANALYSIS_DIR}/manifest.json` already exists with non-empty `history[]`
from a prior run today, the re-run is *never* a no-op — apply the re-run
improve/extend rule from `02-analysis-protocol.md`:**

1. Always run `npm run prior-run-diff -- "${ANALYSIS_DIR}"` (always-on; the
   helper no longer reads `ENABLE_PRIOR_RUN_MERGE`). Persist the plan to
   `${ANALYSIS_DIR}/runs/prior-run-diff.json`. The plan classifies every
   prior artifact as a must-extend target (`carryForward[]`) with
   `priorLines` + `extendFloor` exposed, or a below-floor target
   (`rewrite[]`).
2. For every `carryForward[]` entry, **extend & deepen** the artifact —
   skip-writes are forbidden. Each must reach its `extendFloor`
   (`= max(threshold floor, priorLines + 20)`) AND add at least one of:
   a new section, ≥3 new evidence citations, or ≥1 new chart/diagram.
   Log one line per extended artifact:
   `[EXTEND-FROM-PRIOR: <relativePath> prior=<priorLines>L → new=<newLines>L (+<delta>)]`.
3. For every `rewrite[]` entry, write a stronger version (overwriting the
   prior file) sized to the catalog floor.
4. Append a new entry to `manifest.json.history[]` (written automatically
   by `runAnalysisStage` via `mergeManifestHistory`). On a re-run,
   `manifest.pass2.rewriteCount` MUST equal the total artifact count —
   `rewriteCount === 0` on a re-run is a Stage-C hard RED.

**Pass 1 (~60% of analysis time):** Apply every methodology and template
(`analysis/methodologies/` + `analysis/templates/`) to every downloaded
data file. Write every mandatory artifact. Populate `manifest.json` with
top-level `articleType: election-cycle` and every produced file under `files.*`.

**Pass 2 (~40% of analysis time):** Read every file you wrote, end to end.
Expand shallow sections, add evidence citations, add 🟢/🟡/🔴 confidence
labels, add cross-references. No `[AI_ANALYSIS_REQUIRED]` markers may
remain.

Emit before Stage C:

```
PREFLIGHT_ATTESTATION: read N/N artifacts from ${ANALYSIS_DIR} (LINES lines, FRAMEWORKS frameworks)
```

### Stage C — Completeness Gate (Ref: 03) — **BLOCKING**

Read every manifest-listed artifact and compare it with `reference-quality-thresholds.json`, the artifact catalog, and the IMF/SEO rules in prompts 01, 03, and 04. Emit exactly one gate line:

```text
STAGE_C_GATE: GREEN articleType=${ARTICLE_TYPE_SLUG} artifacts=<N> lines=<L> imf=<pass|not_required>
STAGE_C_GATE: ANALYSIS_ONLY articleType=${ARTICLE_TYPE_SLUG} reason="<why no article render>"
STAGE_C_GATE: RED articleType=${ARTICLE_TYPE_SLUG} missing=<N> short=<N> placeholders=<N>
```

- **GREEN** → set `GATE_RESULT=GREEN` and proceed to Stage D.
- **RED (first)** → run Pass 3 on the named artifacts, re-run Stage C.
- **RED (second)** → set `GATE_RESULT=ANALYSIS_ONLY`, skip full article render, and ship analysis-only in the single PR.

> **⏱️ Elapsed-Time Tripwire (election-cycle specific)**: At the top of
> every Stage C iteration, compute the elapsed minutes (mirror the safe
> two-step pattern from `news-translate.md` — no nested expansions):
>
> ```bash
> NOW_EPOCH=$(date -u +%s)
> ELAPSED_MIN=$(( (NOW_EPOCH - WORKFLOW_START_EPOCH) / 60 ))
> ```
>
> **Look up the slug-specific Stage C exit tripwire in
> `src/config/article-horizons.ts`** — short/mid prospective &
> retrospective slugs trip at **minute 36**, long-horizon
> prospective/retrospective slugs at **minute 39**, electoral-overlay
> slugs at **minute 42**. **If `ELAPSED_MIN ≥ tripwire`, immediately
> set `GATE_RESULT=ANALYSIS_ONLY` — even if Stage C has just emitted
> GREEN.** Stage D + E need ≥ 4 min of budget before the PR-call
> deadline at minute ≤ 45 (electoral: ≤ 47). Emit the gate line as a
> single unbroken record (note the mandatory `articleType=` field —
> required by the contract above and by
> `scripts/validate-analysis-completeness.js`):
>
> ```text
> STAGE_C_GATE: ANALYSIS_ONLY articleType=${ARTICLE_TYPE_SLUG} reason="elapsed-time tripwire at minute ${ELAPSED_MIN}; reserve remaining budget for Stage D+E PR-call deadline"
> ```
>
> Then skip Pass 3 and **all** Stage D render attempts and proceed
> straight to Stage E. Shipping ANALYSIS_ONLY at the tripwire is
> strictly better than blowing the 60-min `timeout-minutes` cap.
> The 55-min `engine.mcp.session-timeout` (gh-aw v0.71.3+) keeps the
> safeoutputs HTTP session alive for the full run, but the workflow
> still hard-caps at 60 minutes. See [`09-troubleshooting.md`](../prompts/09-troubleshooting.md) §5
> for run #24963129839 (`session not found` at minute 29 under the
> old 45-min schedule) — historical context for the new design.

### Stage D — Deterministic Article Render (Refs: 04-article-generation + Article-Generation.md)

**Agents do not write article prose.** Stage D is a deterministic CLI
that aggregates the committed `analysis/**` artifacts into one canonical
markdown document, then renders it to localized HTML article(s).

```bash
source scripts/mcp-setup.sh
export USE_EP_MCP=true


# Deterministic article rendering from the committed analysis artifacts.
#    Emits news/<TODAY>-election-cycle.en.md (canonical aggregated markdown) plus
#    news/<TODAY>-election-cycle-en.html (rendered article). Always
#    regenerates article.md + HTML on every run (never no-op): the renderer
#    overwrites byte-for-byte from the freshly extended/rewritten Stage-B
#    analysis artifacts.
npm run generate-article -- --run "${ANALYSIS_DIR}"
```

The renderer is bounded to ≤ 2 min on a typical run. If the gate result is
`ANALYSIS_ONLY`, the renderer emits a short placeholder article documenting
the missing artifacts rather than a full prose article.

### Stage E — Single PR (Ref: 06)

Emit to stdout immediately before the single PR call:

```
SINGLE_PR_ATTESTATION: about to emit the only PR of this run at elapsed=<N>m with <X> analysis files + <Y> news files staged (gateResult=<GREEN|ANALYSIS_ONLY>)
```

Then invoke `safeoutputs___create_pull_request` **exactly once** with:

- `base: "main"`
- `head: "news/${TODAY}-election-cycle-${RUN_ID}"`
- `title: "[news] election-cycle — ${TODAY} (run ${RUN_ID})"` *(append `(analysis-only)` suffix when `GATE_RESULT=ANALYSIS_ONLY`)*
- `body:` summarize the completeness-gate result, list produced
  analysis artifacts and emitted news files, diff vs. the prior same-day
  run if `manifest.json.history[].length > 1`. Cite every analysis file
  the rendered article consumed via the manifest. Do **not** author
  article prose in the PR body — that's the renderer's job.

> **Banned patterns**: see `06-pr-and-safe-outputs.md` §4. The repo CI
> lint (`scripts/lint-prompts.js`) fails the build if any banned
> pattern appears in this workflow. **Never** call the single-PR tool
> more than once per run.

## 🚫 Never

- Never invoke the single-PR tool more than once per run.
- Never author article prose — the deterministic renderer owns Stage D.
  Agent edits to `news/<date>-election-cycle.en.md` after `npm run generate-article`
  exits are forbidden.
- Never edit anything under `news/**` outside of `npm run generate-article`.
- Never dispatch another workflow except via the `dispatch-workflow:`
  safe output (`news-translate`, exactly once after merge).
- See `00-scope-and-ground-rules.md` for the full list.
