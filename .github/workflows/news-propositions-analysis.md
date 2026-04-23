---
name: "News: EU Parliament Propositions — Analysis"
description: Produces a single analysis-only PR for EU Parliament propositions. Stages A + B + C only. Paired with news-propositions-article.md, which runs Stage D when this PR merges.
strict: false
on:
  schedule: daily around 5:00 on weekdays
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

timeout-minutes: 45

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
  group: "news-analysis-propositions"
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
    - api.worldbank.org
    - dataservices.imf.org
    - "*.europa.eu"
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
    - defaults

tools:
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
    title-prefix: "[analysis] "
    labels: [agentic-analysis, analysis-data, "type:propositions"]
    draft: false
    expires: 14d
    allowed-base-branches: ["main"]
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

engine:
  id: copilot
  model: claude-opus-4.7
---
# 🔬 EU Parliament Propositions — Analysis-Only Workflow

You are the **Analysis Agent** for EU Parliament Monitor. This workflow is
**Stages A + B + C only**. You produce a single analysis-only PR. Stage D
(article drafting) happens in the paired `news-propositions-article.md` workflow
when this PR merges to `main`.

## 📚 Required Reading (read in this order, once per run)

1. [`.github/prompts/00-scope-and-ground-rules.md`](../prompts/00-scope-and-ground-rules.md) — split-workflow scope; only `analysis/**` edits allowed
2. [`.github/prompts/08-infrastructure.md`](../prompts/08-infrastructure.md) — frontmatter, MCP gateway, stable folder layout, `--analysis-only` flag
3. [`.github/prompts/01-data-collection.md`](../prompts/01-data-collection.md) — Stage A
4. [`.github/prompts/07-mcp-reference.md`](../prompts/07-mcp-reference.md) — canonical tool tables
5. [`.github/prompts/02-analysis-protocol.md`](../prompts/02-analysis-protocol.md) — Stage B (2 passes; §2 re-run merge rule; §3 time budgets)
6. [`.github/prompts/03-analysis-completeness-gate.md`](../prompts/03-analysis-completeness-gate.md) — Stage C (blocking); §6b resuming a same-day folder
7. [`.github/prompts/06-pr-and-safe-outputs.md`](../prompts/06-pr-and-safe-outputs.md) — **single-PR rule**, §3a analysis-PR outcomes
8. On error → [`.github/prompts/09-troubleshooting.md`](../prompts/09-troubleshooting.md)

You do **not** read `04-article-generation.md` or `05-analysis-to-article-contract.md` in this workflow — those belong to the paired article workflow.

## 🔖 Workflow Parameters

| Parameter | Value |
|-----------|-------|
| `ARTICLE_TYPE_SLUG` | `propositions` |
| Family | Split: **analysis-only** (paired with `news-propositions-article.md`) |
| Data window | Per article type; derive from `$TODAY` / `$LAST_WEEK` / `$LAST_MONTH` |
| Primary feeds | EP feeds via `get_*_feed` with appropriate timeframe; fall back per endpoint if empty/error. |
| Minimum analysis time (Stage B, 2 passes) | ≥ 20 minutes |
| Total wall-clock budget | 22–27 minutes (well below the safeoutputs session TTL — see note below) |
| PR rule | **Exactly one** `[analysis]` PR at end of run (see `06-pr-and-safe-outputs.md` §3a) |

> **⚠️ safeoutputs Session TTL**: The safeoutputs MCP HTTP session on
> `localhost:3001` has been observed to fail after roughly **28–30
> minutes** with no safeoutputs tool calls (agent activity on other
> tools does **not** refresh it). [Run
> 24818921747](https://github.com/Hack23/euparliamentmonitor/actions/runs/24818921747)
> failed with `Streamable HTTP error: session not found` after Stage B
> ran ~28 min with zero safeoutputs calls. Keep total wall-clock from
> agent start to the single end-of-run PR call **under 28 minutes**
> (the 22–27 min budget above leaves a ~1–6 min safety margin below the
> observed failure window). Commit the branch and call the single PR
> as soon as Stage C is GREEN — do not append further manifest edits.
> See [`09-troubleshooting.md`](../prompts/09-troubleshooting.md) §5.

## 🎯 Article-Type Specifics

- Every procedure mentioned MUST carry its full identifier (`2025/0042(COD)` etc.) and current stage. Include `existing/pipeline-health.md` in the analysis set. Render an Action → Consequence table with AI-authored `reason` cells (per `05-analysis-to-article-contract.md`).

## 🗓️ Date Context + Stable Folder Resolution (MANDATORY — first bash block)

```bash
TODAY=$(date -u +%Y-%m-%d)
TODAY_YEAR=$(date -u +%Y)
LAST_WEEK=$(date -u -d '7 days ago' +%Y-%m-%d)
LAST_MONTH=$(date -u -d '30 days ago' +%Y-%m-%d)
RUN_EPOCH=$(date -u +%s)
RUN_ID="propositions-run$$-$RUN_EPOCH"
# Canonical stable folder — no -run<NN> suffix. Repeated runs on the same
# date share this dir and append to manifest.json.history[].
ANALYSIS_DIR=$(scripts/resolve-analysis-dir.sh "$TODAY" propositions)
WORKFLOW_START_EPOCH=$RUN_EPOCH
echo "ARTICLE_TYPE_SLUG=propositions"                   >> "$GITHUB_ENV"
echo "TODAY=$TODAY"                               >> "$GITHUB_ENV"
echo "RUN_ID=$RUN_ID"                             >> "$GITHUB_ENV"
echo "ANALYSIS_DIR=$ANALYSIS_DIR"                 >> "$GITHUB_ENV"
echo "WORKFLOW_START_EPOCH=$WORKFLOW_START_EPOCH" >> "$GITHUB_ENV"
```

> **⚠️ DATE GUARD**: When passing `dateFrom`/`dateTo` to any MCP tool, always
> derive dates from `$TODAY` / `$LAST_WEEK` / `$LAST_MONTH`. Never hard-code
> a year.

## 🔁 Stage Order (absolute)

```
Stage A · Data Collection
  → Stage B · Analysis (Pass 1 + Pass 2, ≥ 20 min)
    → Stage C · Completeness Gate (validate-analysis) — BLOCKING
      → Single analysis PR (exactly once)
```

Stage D happens in the paired `news-propositions-article.md` workflow.

### Stage A — Data Collection (Ref: 01, 07)

Run the canonical gateway block from `08-infrastructure.md` §4. Source
`scripts/mcp-setup.sh`, then `scripts/wb-mcp-probe.sh` and
`scripts/imf-mcp-probe.sh`. Collect EP feed data first; fall back to direct
endpoints on failure. Deep-fetch up to 10 procedures / voting records /
meeting decisions into `${ANALYSIS_DIR}/data/`. Target: ≤ 10 min.

### Stage B — Analysis (Ref: 02 §2 re-run merge rule)

**If `${ANALYSIS_DIR}/manifest.json` already exists from a prior run today,
do NOT rewrite it — apply the re-run merge rule from `02-analysis-protocol.md`
§2:**

1. Load prior `manifest.json` and inspect every artifact's line count vs.
   `reference-quality-thresholds.json` floor.
2. Carry forward at/above-floor artifacts unless new Stage-A data changes
   their conclusions.
3. Rewrite below-floor or missing artifacts with Pass 1 + Pass 2 output.
4. Append a new entry to `manifest.json.history[]` (written automatically by
   `runAnalysisStage` via `mergeManifestHistory`).

**Pass 1 (~60% of analysis time):** Apply every methodology and template
(`analysis/methodologies/` + `analysis/templates/`) to every downloaded
data file. Write every mandatory artifact. Populate `manifest.json` with
top-level `articleType: propositions` and every produced file under `files.*`.

**Pass 2 (~40% of analysis time):** Read every file you wrote, end to end.
Expand shallow sections, add evidence citations, add 🟢/🟡/🔴 confidence
labels, add cross-references. No `[AI_ANALYSIS_REQUIRED]` markers may remain.

Emit before Stage C:

```
PREFLIGHT_ATTESTATION: read N/N artifacts from ${ANALYSIS_DIR} (LINES lines, FRAMEWORKS frameworks)
```

### Stage C — Completeness Gate (Ref: 03) — **BLOCKING**

```bash
npm run validate-analysis -- \
  --analysis-dir="${ANALYSIS_DIR}" \
  --article-type="${ARTICLE_TYPE_SLUG}"
```

- **Exit 0** → record `gateResult: "GREEN"` in the new history entry (use `--analysis-only` below, which writes this via `runAnalysisStage`) and proceed to Single PR.
- **Exit 1 (first)** → run Pass 3 on the named artifacts, re-run validator.
- **Exit 1 (second)** → record `gateResult: "ANALYSIS_ONLY"` and still ship the single analysis PR; the paired article workflow will exit noop on merge.

Never use `--warn-only`.

### Finalize manifest — `--analysis-only` pipeline wrap-up

```bash
source scripts/mcp-setup.sh
export USE_EP_MCP=true
npx tsx src/generators/news-enhanced.ts \
  --types=propositions \
  --analysis \
  --analysis-methods=all \
  --analysis-dir="${ANALYSIS_DIR}" \
  --analysis-only \
  --run-id="${RUN_ID}"
```

This invocation exits after Stage C without generating any HTML. It also
writes the new `manifest.json.history[]` entry via `mergeManifestHistory`
(see [`src/utils/file-utils.ts`](../../src/utils/file-utils.ts)).

### Single Analysis PR (Ref: 06 §3a)

Emit to stdout immediately before the single PR call:

```
SINGLE_PR_ATTESTATION: about to emit the only analysis PR of this run at elapsed=<N>m with <X> analysis files staged (gateResult=<GREEN|ANALYSIS_ONLY>)
```

Then invoke `safeoutputs___create_pull_request` **exactly once** with:

- `base: "main"`
- `head: "analysis/${TODAY}-propositions-${RUN_ID}"`
- `title: "[analysis] propositions — ${TODAY} (run ${RUN_ID})"`
- `body:` summarize the completeness-gate result, list produced artifacts,
  diff vs. the prior same-day run if `manifest.json.history[].length > 1`,
  and reference forward-monitoring pointers. Do **not** generate article
  prose in the PR body — that's the article workflow's job.

> **Banned patterns**: see `06-pr-and-safe-outputs.md` §4. The repo CI
> lint (`scripts/lint-prompts.js`) fails the build if any banned pattern
> appears in this workflow.

## 🚫 Never

- Never invoke the single-PR tool more than once per run.
- Never edit anything under `news/**` — that is the article workflow's scope.
- Never run Stage D (no HTML generation) in this workflow.
- Never dispatch another workflow — the paired article workflow triggers on
  `pull_request: closed + merged`.
- See `00-scope-and-ground-rules.md` for the full list.
