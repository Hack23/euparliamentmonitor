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
  model: claude-sonnet-4
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

> **⏱️ MCP session lifetime**: `engine.mcp.session-timeout` is
> NOT set — the gh-aw v0.71.3 compiler advertises the field but
> the bundled gateway image `ghcr.io/github/gh-aw-mcpg:v0.3.1`
> rejects it (`additionalProperties 'sessionTimeout' not
> allowed`, run #25275823699 fingerprint). The MCP gateway uses
> the upstream default session lifetime; the workflow's
> The MCP gateway pings backends at the upstream default interval so
> EP / IMF / world-bank / memory sessions stay warm
> across the 60-min run. The Stage C exit tripwire still fires
> at the slug-specific elapsed-minute mark in
> `src/config/article-horizons.ts` so Stage D + E retain enough
> budget to land the single PR call by minute ≤ 45. See
> [`09-troubleshooting.md`](../prompts/09-troubleshooting.md) §5
> for run #24963129839 historical context.

## 🎯 Article-Type Specifics

- Economic context (**IMF only** for macro/fiscal/monetary/trade) is mandatory — quarterly retrospectives always touch macro/policy.
- Long-horizon stage helpers: see [`.github/prompts/10-horizon-stage-helpers.md`](../prompts/10-horizon-stage-helpers.md) for the registry-driven Stage-A/B/C contract.
- Roll-call publication delay: the `0 8 5 * *` schedule (5th of the month) waits for EP roll-call data publication; the data window is **D-95 → D-5** for stable analysis.
- Mandatory artifacts: `mandate-fulfilment-scorecard.md` (per group), `legislative-pipeline-forecast.md` (retrospective transit times for the trailing quarter).
- Mine prior-run forward statements (per `01-data-collection.md` §8); resolve any expired carry-forward statements per [`forward-projection-methodology.md` §6](../../analysis/methodologies/forward-projection-methodology.md#6-carry-forward--forward-statement-quality-gate).

## 🗓️ Date Context + Stable Folder Resolution (MANDATORY — first bash block)

```bash
TODAY=$(date -u +%Y-%m-%d)
LAST_WEEK=$(date -u -d '7 days ago' +%Y-%m-%d)
QUARTER_BACK=$(date -u -d 'trailing 90 days ago' +%Y-%m-%d)
RUN_EPOCH=$(date -u +%s)
RUN_ID="quarter-in-review-run$$-$RUN_EPOCH"
# Canonical stable folder — no -run<NN> suffix. Repeated runs on the same
# date share this dir and append to manifest.json.history[].
ANALYSIS_DIR=$(scripts/resolve-analysis-dir.sh "$TODAY" quarter-in-review)
WORKFLOW_START_EPOCH=$RUN_EPOCH
echo "ARTICLE_TYPE_SLUG=quarter-in-review"                  >> "$GITHUB_ENV"
echo "TODAY=$TODAY"                               >> "$GITHUB_ENV"
echo "RUN_ID=$RUN_ID"                             >> "$GITHUB_ENV"
echo "ANALYSIS_DIR=$ANALYSIS_DIR"                 >> "$GITHUB_ENV"
echo "WORKFLOW_START_EPOCH=$WORKFLOW_START_EPOCH" >> "$GITHUB_ENV"
```

> **⚠️ DATE GUARD**: When passing `dateFrom`/`dateTo` to any MCP tool,
> always derive dates from `$TODAY` / `$LAST_WEEK` / `$QUARTER_BACK`. Never
> hard-code a year.

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
top-level `articleType: quarter-in-review` and every produced file under `files.*`.

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

> **⏱️ Elapsed-Time Tripwire (quarter-in-review specific)**: At the top of
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
> prospective slugs at **minute 39**, long-horizon retrospective
> slugs at **minute 38**, electoral-overlay slugs at **minute 42**. **If `ELAPSED_MIN ≥ tripwire`, immediately
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
> The MCP gateway uses upstream default session lifetime
> (`engine.mcp.session-timeout` is not set due to an upstream
> gh-aw v0.71.3 / gateway-v0.3.1 schema bug — see frontmatter
> comment); the workflow hard-caps at 60 minutes regardless. See [`09-troubleshooting.md`](../prompts/09-troubleshooting.md) §5
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
#    Emits news/<TODAY>-quarter-in-review.en.md (canonical aggregated markdown) plus
#    news/<TODAY>-quarter-in-review-en.html (rendered article). Always
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
- `head: "news/${TODAY}-quarter-in-review-${RUN_ID}"`
- `title: "[news] quarter-in-review — ${TODAY} (run ${RUN_ID})"` *(append `(analysis-only)` suffix when `GATE_RESULT=ANALYSIS_ONLY`)*
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
  Agent edits to `news/<date>-quarter-in-review.en.md` after `npm run generate-article`
  exits are forbidden.
- Never edit anything under `news/**` outside of `npm run generate-article`.
- Never dispatch another workflow except via the `dispatch-workflow:`
  safe output (`news-translate`, exactly once after merge).
- See `00-scope-and-ground-rules.md` for the full list.
