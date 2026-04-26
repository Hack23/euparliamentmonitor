---
name: "News: EU Parliament Breaking News — Unified"
description: Generates a single PR containing analysis artifacts and the rendered breaking-news article (Stages A → B → C → D → E in one workflow).
strict: false
on:
  schedule:
    - cron: "0 */6 * * *"  # every 6 hours
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

# Hard safety cap. Active-work budget is 22–27 min before the single
# safe-outputs create_pull_request call (see safeoutputs TTL note in the
# prompt body). The remaining minutes cover npm setup + git push.
timeout-minutes: 75

features:
  mcp-gateway: true

sandbox:
  agent: awf
  mcp:
    port: 8080
    keepalive-interval: 300

imports:
  - .github/agents/news-generation.agent.md
  - shared/mcp/news-mcp-servers.md

concurrency:
  group: "news-breaking"
  cancel-in-progress: false

runtimes:
  node:
    version: "25"

network:
  allowed:
    - node
    - github.com
    - api.github.com
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
    - defaults

tools:
  timeout: 300  # 5 min per-tool-call cap (bash, MCP, etc.) — guards against hung tool calls
  github:
    toolsets:
      - all
  bash: true
  agentic-workflows: true
  repo-memory:
    branch-name: memory/news-generation
    allowed-extensions: [".md", ".json"]
    max-file-size: 51200
    max-file-count: 50
    max-patch-size: 51200

safe-outputs:
  allowed-domains:
    - data.europarl.europa.eu
    - www.europarl.europa.eu
    - github.com
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
  create-pull-request:
    title-prefix: "[news] "
    labels: [agentic-news, analysis-data, "type:breaking"]
    draft: false
    expires: 14d
    allowed-base-branches: ["main"]
    max: 1
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

engine:
  id: copilot
  model: claude-opus-4.7
  # max-continuations: 1 tells gh-aw NOT to enable autopilot mode — when this
  # equals 1 the compiler omits --autopilot from the Copilot CLI invocation so
  # the agent runs exactly once with no restarts.  Within-session runaway
  # protection is provided by tools.timeout (per-call cap) + timeout-minutes.
  max-continuations: 1
---
# 📰 EU Parliament Breaking News — Unified Workflow

> **🚨 HARD TIMING CONSTRAINT — READ BEFORE ANYTHING ELSE**
>
> The safeoutputs MCP HTTP session (`localhost:3001`) expires after **~28–30
> minutes** of no safeoutputs tool calls. Agent activity on other tools (EP
> MCP, bash, `create`, `edit`) does **NOT** refresh it. You **MUST** call
> the safeoutputs PR tool before the PR_DEADLINE_EPOCH printed in
> the first bash block. **Aim for ≤ 22 min from agent start.**
>
> - Stage A CEILING: **≤ 4 min**
> - Stage B CEILING: **≤ 14 min total** (Pass 1 ≤ 8 min; Pass 2 ≤ 6 min)
> - Stage C CEILING: **≤ 2 min**
> - Stage D CEILING: **≤ 2 min**
> - **Total CEILING: ≤ 22 min from agent start to the single PR call**
>
> If you are past 14 min elapsed and have not started Stage C, **skip Stage B
> Pass 2 entirely** and proceed directly to Stage C → Stage D → Stage E.
> If you are past 20 min elapsed and have not started Stage E, **proceed
> directly to Stage E with whatever analysis is complete** (ANALYSIS_ONLY).
> See [`09-troubleshooting.md`](../prompts/09-troubleshooting.md) §5a.

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
| `ARTICLE_TYPE_SLUG` | `breaking` |
| Family | **Unified** (Stages A → B → C → D → E in one workflow) |
| Data window | today (last 12 h); fallback one-week |
| Primary feeds | `get_adopted_texts_feed`, `get_events_feed`, `get_procedures_feed`, `get_meps_feed` with `timeframe: "today"`; fall back to `"one-week"` per endpoint if empty/error. |
| Stage A budget | ≤ 4 min **ceiling** |
| Stage B budget (2 passes) | ≤ 14 min **hard ceiling** (Pass 1 ≤ 8 min; Pass 2 ≤ 6 min — skip Pass 2 if elapsed > 14 min) |
| Stage C budget | ≤ 2 min **ceiling** |
| Stage D budget | ≤ 2 min (deterministic) |
| **Total wall-clock from agent start** | **≤ 22 min** to the single safe-outputs `create_pull_request` call |
| Hard safety cap | 75-min `timeout-minutes` |
| PR rule | **Exactly one** `[news]` PR at end of run |

> **🚨 safeoutputs Session TTL — HARD LIMIT**: The safeoutputs MCP HTTP
> session on `localhost:3001` expires after roughly **28–30 minutes** of no
> safeoutputs tool calls. Agent activity on **any other tool does NOT refresh
> it**. Your `PR_DEADLINE_EPOCH` is printed in the first bash block — **stop
> analysis immediately and go to Stage E the moment you cross that deadline**.
> `sandbox.mcp.keepalive-interval: 300` does NOT prevent session expiry.
> See [`09-troubleshooting.md`](../prompts/09-troubleshooting.md) §5a.

## 🎯 Article-Type Specifics

- Every document/event reference MUST include its publish date. Items without a recent date are not breaking news.
- If no new developments exist today, still ship a PR marked `gateResult=ANALYSIS_ONLY` in `manifest.json.history[]` — the deterministic renderer will then emit a noop placeholder rather than a full article.
- Include `intelligence/coalition-dynamics.md` and `intelligence/mcp-reliability-audit.md` in the analysis set (per `reference-quality-thresholds.json`).

## 🗓️ Date Context + Stable Folder Resolution (MANDATORY — first bash block)

```bash
TODAY=$(date -u +%Y-%m-%d)
LAST_WEEK=$(date -u -d '7 days ago' +%Y-%m-%d)
LAST_MONTH=$(date -u -d '30 days ago' +%Y-%m-%d)
RUN_EPOCH=$(date -u +%s)
RUN_ID="breaking-run$$-$RUN_EPOCH"
# Canonical stable folder — no -run<NN> suffix. Repeated runs on the same
# date share this dir and append to manifest.json.history[].
ANALYSIS_DIR=$(scripts/resolve-analysis-dir.sh "$TODAY" breaking)
WORKFLOW_START_EPOCH=$RUN_EPOCH
# Hard deadline: safeoutputs session expires ~28-30 min after agent start.
# Must call the safeoutputs PR tool BEFORE this epoch.
PR_DEADLINE_EPOCH=$((RUN_EPOCH + 1320))  # 22 min from agent start
PR_DEADLINE_ISO=$(date -u -d "@$PR_DEADLINE_EPOCH" +%Y-%m-%dT%H:%M:%SZ)
echo "ARTICLE_TYPE_SLUG=breaking"                  >> "$GITHUB_ENV"
echo "TODAY=$TODAY"                               >> "$GITHUB_ENV"
echo "RUN_ID=$RUN_ID"                             >> "$GITHUB_ENV"
echo "ANALYSIS_DIR=$ANALYSIS_DIR"                 >> "$GITHUB_ENV"
echo "WORKFLOW_START_EPOCH=$WORKFLOW_START_EPOCH" >> "$GITHUB_ENV"
echo "PR_DEADLINE_EPOCH=$PR_DEADLINE_EPOCH"       >> "$GITHUB_ENV"
echo ""
echo "=== CRITICAL DEADLINE ==="
echo "Agent start : $(date -u -d "@$RUN_EPOCH" +%Y-%m-%dT%H:%M:%SZ)"
echo "PR deadline : $PR_DEADLINE_ISO  (22 min from now)"
echo "safeoutputs session expires ~28-30 min from start — DO NOT exceed PR deadline"
echo "========================="
```

> **⚠️ DATE GUARD**: When passing `dateFrom`/`dateTo` to any MCP tool,
> always derive dates from `$TODAY` / `$LAST_WEEK` / `$LAST_MONTH`. Never
> hard-code a year.

## 🔁 Stage Order (absolute)

```
Stage A · Data Collection (≤ 4 min ceiling)
  → Stage B · Analysis (Pass 1 ≤ 8 min + Pass 2 ≤ 6 min = ≤ 14 min ceiling)
    → Stage C · Completeness Gate (≤ 2 min ceiling) — BLOCKING
      → Stage D · Article Render (npm run generate-article — deterministic, ≤ 2 min)
        → Stage E · Single PR (exactly once, immediately after Stage D)
```

> **⏱️ Deadline check at each stage transition**:
> ```bash
> NOW=$(date -u +%s)
> ELAPSED=$(( NOW - WORKFLOW_START_EPOCH ))
> REMAINING=$(( PR_DEADLINE_EPOCH - NOW ))
> echo "Elapsed=${ELAPSED}s  Remaining=${REMAINING}s  Deadline=${PR_DEADLINE_EPOCH}"
> ```
> - After Stage A: if ELAPSED > 480 (8 min), proceed with reduced Stage B scope.
> - Before Stage B Pass 2: if REMAINING < 480 (8 min), **skip Pass 2 entirely**.
> - Before Stage C: if REMAINING < 300 (5 min), accept ANALYSIS_ONLY immediately.
> - Before Stage E: if REMAINING < 120 (2 min), **call Stage E NOW** regardless of Stage C result.

### Stage A — Data Collection (Ref: 01, 07)

Run the canonical gateway block from `08-infrastructure.md` §4. Source
`scripts/mcp-setup.sh`, then `scripts/wb-mcp-probe.sh` and
`scripts/imf-mcp-probe.sh`. Collect EP feed data first; fall back to
direct endpoints on failure. Deep-fetch up to 5 procedures / voting
records / meeting decisions into `${ANALYSIS_DIR}/data/`. **Ceiling: ≤ 4 min.**

### Stage B — Analysis (Ref: 02 §2 re-run merge rule)

> **⏱️ Check deadline before starting Stage B**:
> ```bash
> NOW=$(date -u +%s)
> ELAPSED=$(( NOW - WORKFLOW_START_EPOCH ))
> REMAINING=$(( PR_DEADLINE_EPOCH - NOW ))
> echo "Stage B start: elapsed=${ELAPSED}s remaining=${REMAINING}s"
> ```
> If ELAPSED > 480 (8 min), proceed with a **reduced** Stage B: write only the
> mandatory breaking-news artifacts (executive-brief, coalition-dynamics,
> mcp-reliability-audit, significance-classification, risk-matrix,
> synthesis-summary). Do NOT spend time on optional templates.

**If `${ANALYSIS_DIR}/manifest.json` already exists from a prior run today,
do NOT rewrite it — apply the re-run merge rule from `02-analysis-protocol.md`
§2:**

1. Load prior `manifest.json` and inspect every artifact's line count vs.
   `reference-quality-thresholds.json` floor.
2. Carry forward at/above-floor artifacts unless new Stage-A data changes
   their conclusions.
3. Rewrite below-floor or missing artifacts with Pass 1 + Pass 2 output.
4. Append a new entry to `manifest.json.history[]` (written automatically
   by `runAnalysisStage` via `mergeManifestHistory`).

**Pass 1 (≤ 8 min ceiling):** Apply the breaking-news artifact set to every
downloaded data file. Write every mandatory artifact. Populate `manifest.json`
with top-level `articleType: breaking` and every produced file under `files.*`.

**Pass 2 (≤ 6 min ceiling — skip entirely if REMAINING < 480 s)**:

> ```bash
> NOW=$(date -u +%s)
> REMAINING=$(( PR_DEADLINE_EPOCH - NOW ))
> echo "Before Pass 2: remaining=${REMAINING}s"
> ```
> **If REMAINING < 480, skip Pass 2 and proceed directly to Stage C.**

Otherwise, read every file you wrote. Expand shallow sections, add evidence
citations, add 🟢/🟡/🔴 confidence labels, add cross-references. No
`[AI_ANALYSIS_REQUIRED]` markers may remain.

Emit before Stage C:

```
PREFLIGHT_ATTESTATION: read N/N artifacts from ${ANALYSIS_DIR} (LINES lines, FRAMEWORKS frameworks)
```

### Stage C — Completeness Gate (Ref: 03) — **BLOCKING**

> **⏱️ Check deadline before Stage C**:
> ```bash
> NOW=$(date -u +%s)
> REMAINING=$(( PR_DEADLINE_EPOCH - NOW ))
> echo "Stage C start: remaining=${REMAINING}s"
> ```
> **If REMAINING < 300 (5 min), emit `STAGE_C_GATE: ANALYSIS_ONLY` immediately
> and skip full validation — proceed to Stage D then Stage E without delay.**

Read every manifest-listed artifact and compare it with `reference-quality-thresholds.json`, the artifact catalog, and the IMF/SEO rules in prompts 01, 03, and 04. Emit exactly one gate line:

```text
STAGE_C_GATE: GREEN articleType=${ARTICLE_TYPE_SLUG} artifacts=<N> lines=<L> imf=<pass|not_required>
STAGE_C_GATE: ANALYSIS_ONLY articleType=${ARTICLE_TYPE_SLUG} reason="<why no article render>"
STAGE_C_GATE: RED articleType=${ARTICLE_TYPE_SLUG} missing=<N> short=<N> placeholders=<N>
```

- **GREEN** → set `GATE_RESULT=GREEN` and proceed to Stage D.
- **RED (first)** → run Pass 3 on the named artifacts, re-run Stage C.
- **RED (second)** → set `GATE_RESULT=ANALYSIS_ONLY`, skip full article render, and ship analysis-only in the single PR.

### Stage D — Deterministic Article Render (Refs: 04-article-generation + Article-Generation.md)

**Agents do not write article prose.** Stage D is a deterministic CLI
that aggregates the committed `analysis/**` artifacts into one canonical
markdown document, then renders it to localized HTML article(s).

```bash
source scripts/mcp-setup.sh
export USE_EP_MCP=true


# Deterministic article rendering from the committed analysis artifacts.
#    Emits news/<TODAY>-breaking.en.md (canonical aggregated markdown) plus
#    news/<TODAY>-breaking-en.html (rendered article). Idempotent — skips
#    writes when target mtime ≥ all source artifacts.
npm run generate-article -- --run "${ANALYSIS_DIR}"
```

The renderer is bounded to ≤ 2 min on a typical run. If the gate result is
`ANALYSIS_ONLY`, the renderer emits a short placeholder article documenting
the missing artifacts rather than a full prose article.

### Stage E — Single PR (Ref: 06)

> **⏱️ Deadline check before Stage E**:
> ```bash
> NOW=$(date -u +%s)
> ELAPSED=$(( NOW - WORKFLOW_START_EPOCH ))
> REMAINING=$(( PR_DEADLINE_EPOCH - NOW ))
> echo "Stage E: elapsed=${ELAPSED}s remaining=${REMAINING}s"
> ```
> If REMAINING < 0, the PR_DEADLINE has already passed — the safeoutputs
> session may have expired. Attempt the call anyway (it may still succeed
> within the 28-30 min TTL window). This is the last possible action.

Emit to stdout immediately before the single PR call:

```
SINGLE_PR_ATTESTATION: about to emit the only PR of this run at elapsed=<N>m with <X> analysis files + <Y> news files staged (gateResult=<GREEN|ANALYSIS_ONLY>)
```

Then invoke `safeoutputs___create_pull_request` **exactly once** with:

- `base: "main"`
- `head: "news/${TODAY}-breaking-${RUN_ID}"`
- `title: "[news] breaking — ${TODAY} (run ${RUN_ID})"` *(append `(analysis-only)` suffix when `GATE_RESULT=ANALYSIS_ONLY`)*
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
  Agent edits to `news/<date>-breaking.en.md` after `npm run generate-article`
  exits are forbidden.
- Never edit anything under `news/**` outside of `npm run generate-article`.
- Never dispatch another workflow except via the `dispatch-workflow:`
  safe output (`news-translate`, exactly once after merge).
- See `00-scope-and-ground-rules.md` for the full list.
