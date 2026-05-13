---
name: "News: EU Parliament Motions — Unified"
description: Generates a single PR containing analysis artifacts and the rendered motions article (Stages A → B → C → D → E in one workflow).
strict: false
on:
  schedule:
    - cron: "0 6 * * 1-5"  # weekdays around 06:00 UTC
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
#      The agent must complete the analysis and ship the PR within the
#      60-minute `timeout-minutes` cap. The bundled MCP gateway image
#      (ghcr.io/github/gh-aw-mcpg:v0.3.1, shipped with gh-aw v0.71.3)
#      currently rejects `engine.mcp.session-timeout` (schema bug — the
#      field is advertised by the v0.71.3 compiler but absent from the
#      gateway schema), so we do not set it here. See
#      `.github/prompts/02-analysis-protocol.md` §3 for stage budgets.
timeout-minutes: 60


imports:
  - .github/agents/news-generation.agent.md
  - shared/config/news-common-settings.md
  - shared/config/news-safe-outputs-domains.md
  - shared/config/news-safe-outputs-head.md
  - shared/mcp/news-mcp-servers.md
  - shared/prompts/news-unified-runtime.md

concurrency:
  group: "news-motions"
  cancel-in-progress: false

# Tools — all available read/edit/web/memory tools the agent needs for a
# resilient 60-min news-generation session. See upstream reference/tools.md
# and reference/github-tools.md.
tools:
  timeout: 180            # per-tool-call cap (bash, MCP, github, edit, web-fetch)
  startup-timeout: 180    # MCP server boot (npx package install) — covers
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
    key: news-motions-${{ github.repository_owner }}
    retention-days: 7
    allowed-extensions: [".md", ".json", ".jsonl", ".txt", ".html"]
safe-outputs:
  # Analysis artifacts can exceed the 1024 KB default patch limit; raise to
  # 10 MB (max allowed) to prevent legitimate analysis-only
  # patches from being rejected.
  max-patch-size: 10240
  # `threat-detection` and the bundle-prerequisite `steps:` block are
  # inherited from .github/workflows/shared/config/news-safe-outputs-head.md.
  # `allowed-domains` is inherited from
  # .github/workflows/shared/config/news-safe-outputs-domains.md.
  # Both blocks are identical across the 14 unified article workflows.
  # `safe-outputs.allowed-domains` is inherited from
  # .github/workflows/shared/config/news-safe-outputs-domains.md (identical
  # across all 14 unified article workflows). Add domains there to apply
  # the change globally; declare slug-specific overrides here only if needed.
  create-pull-request:
    title-prefix: "[news] "
    labels: [agentic-news, analysis-data, "type:motions"]
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
    run: bash scripts/prefetch-ep-feeds.sh motions adopted-texts meps documents procedures

# Post-execution recovery: when the agent commits Stage E output to a local
# news/* branch but the safeoutputs MCP create_pull_request path later fails
# (session TTL expiry, or a bundle prerequisite race in the write job), the
# agent commits live only on the agent runner filesystem and are otherwise
# lost when the runner is reaped. This post-step writes
# /tmp/gh-aw/aw-agent-recovery.patch from the news/* branch when gh-aw has not
# emitted its own aw-*.patch artifact. The host-side pat-pr-fallback job runs
# after safe_outputs, verifies no bundle-path PR exists, and applies eligible
# analysis/news changes via scripts/gh-aw-pat-pr-fallback.sh. Originated from
# run #25028873034 (week-in-review) and extended after run #25541403260
# (motions) exposed a bundle prerequisite failure after the fallback job had
# already skipped.
post-steps:
  - name: Capture agent recovery patch
    if: always()
    continue-on-error: true
    run: bash scripts/gh-aw-capture-agent-patch.sh

jobs:
  pat-pr-fallback:
    name: Host-side PAT PR fallback
    needs: [agent, detection, safe_outputs]
    if: >
      always() && needs.agent.result != 'skipped' &&
      (needs.detection.result == 'success' || needs.detection.result == 'skipped')
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
          GH_AW_PAT_FALLBACK_SLUG: motions
          GH_AW_SAFE_OUTPUTS_RESULT: ${{ needs.safe_outputs.result }}
          GH_AW_PAT_FALLBACK_WORKFLOW_NAME: "News: EU Parliament Motions — Unified"
          GH_AW_PAT_FALLBACK_RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        run: bash scripts/gh-aw-pat-pr-fallback.sh

engine:
  id: copilot
  model: claude-sonnet-4.6
---
# 📰 EU Parliament Motions — Unified Workflow

## 🔖 Workflow Parameters

| Parameter | Value |
|-----------|-------|
| `ARTICLE_TYPE_SLUG` | `motions` |
| Family | **Unified** (Stages A → B → C → D → E in one workflow) |
| Data window | last 7 days |
| Primary feeds | `get_voting_records`, `get_adopted_texts_feed`, `get_meps_feed`, `get_meeting_decisions` with `timeframe: "one-week"`. |
| Stage A budget | ≤ 4–5 min (per `article-horizons.ts`) |
| Stage B budget (2 passes) | **22–28 min — HARD CEILING per `article-horizons.ts`** (do **not** exceed the per-slug ceiling on Stage B even if Pass 2 still has shallow sections; force `GATE_RESULT=ANALYSIS_ONLY` instead) |
| Stage C budget (gate + optional Pass 3) | ≤ 4 min |
| Stage D budget | ≤ 2 min (deterministic) |
| Stage E budget (commit + single PR) | ≤ 2 min |
| **Stage C exit tripwire** | **minute 36 elapsed** (long-horizon prospective: 39; long-horizon retrospective: 38; electoral: 42) — the **decision threshold** for forcing `GATE_RESULT=ANALYSIS_ONLY` and (if late) skipping Stage D so the run can still reach the PR call. Per-slug stage ceilings live in `src/config/article-horizons.ts`; the tripwire backstops any per-stage overrun. **Note:** Stage D + E run *after* this tripwire, between the Stage C exit and the PR-call deadline. |
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

- Long-horizon stage helpers: see [`.github/prompts/10-horizon-stage-helpers.md`](../prompts/10-horizon-stage-helpers.md) for the registry-driven Stage-A/B/C contract.
- Name specific MEPs + groups on leading/opposing votes — never describe 'the EPP voted for' without naming a shadow rapporteur or floor leader. Quantify margins, abstentions, defections.
- Include `existing/stakeholder-impact.md`, `classification/impact-matrix.md`, `intelligence/stakeholder-map.md` in the analysis set.

## 🗓️ Date Context + Stable Folder Resolution (MANDATORY — first bash block)

```bash
TODAY=$(date -u +%Y-%m-%d)
LAST_WEEK=$(date -u -d '7 days ago' +%Y-%m-%d)
LAST_MONTH=$(date -u -d '30 days ago' +%Y-%m-%d)
RUN_EPOCH=$(date -u +%s)
RUN_ID="motions-run$$-$RUN_EPOCH"
# Canonical stable folder — no -run<NN> suffix. Repeated runs on the same
# date share this dir and append to manifest.json.history[].
ANALYSIS_DIR=$(scripts/resolve-analysis-dir.sh "$TODAY" motions)
WORKFLOW_START_EPOCH=$RUN_EPOCH
echo "ARTICLE_TYPE_SLUG=motions"                  >> "$GITHUB_ENV"
echo "TODAY=$TODAY"                               >> "$GITHUB_ENV"
echo "RUN_ID=$RUN_ID"                             >> "$GITHUB_ENV"
echo "ANALYSIS_DIR=$ANALYSIS_DIR"                 >> "$GITHUB_ENV"
echo "WORKFLOW_START_EPOCH=$WORKFLOW_START_EPOCH" >> "$GITHUB_ENV"
```

> **⚠️ DATE GUARD**: When passing `dateFrom`/`dateTo` to any MCP tool,
> always derive dates from `$TODAY` / `$LAST_WEEK` / `$LAST_MONTH`. Never
> hard-code a year.

### Stage A — Data Collection (Ref: 01, 07)

Run the canonical gateway block from `08-infrastructure.md` §4. Source
`scripts/mcp-setup.sh`, then `scripts/wb-mcp-probe.sh` and
`scripts/imf-mcp-probe.sh`. Collect EP feed data first; fall back to
direct endpoints on failure. Deep-fetch up to 10 procedures / voting
records / meeting decisions into `${ANALYSIS_DIR}/data/`. Target ≤ 4 min.

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
top-level `articleType: motions` and every produced file under `files.*`.

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

> **⏱️ Elapsed-Time Tripwire**: At the top of every Stage C iteration,
> compute the elapsed minutes (mirror the safe two-step pattern from
> `news-translate.md` — no nested expansions):
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
> deadline at minute ≤ 45. Emit the gate line as a single unbroken
> record (note the mandatory `articleType=` field — required by the
> contract above and by `scripts/validate-analysis-completeness.js`):
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
#    Emits news/<TODAY>-motions.en.md (canonical aggregated markdown) plus
#    news/<TODAY>-motions-en.html (rendered article). Always
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
- `head: "news/${TODAY}-motions-${RUN_ID}"`
- `title: "[news] motions — ${TODAY} (run ${RUN_ID})"` *(append `(analysis-only)` suffix when `GATE_RESULT=ANALYSIS_ONLY`)*
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
  Agent edits to `news/<date>-motions.en.md` after `npm run generate-article`
  exits are forbidden.
- Never edit anything under `news/**` outside of `npm run generate-article`.
- Never dispatch another workflow except via the `dispatch-workflow:`
  safe output (`news-translate`, exactly once after merge).
- See `00-scope-and-ground-rules.md` for the full list.
