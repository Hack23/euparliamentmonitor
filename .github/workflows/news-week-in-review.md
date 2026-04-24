---
name: "News: EU Parliament Week in Review — Unified"
description: Generates a single PR containing analysis artifacts and the rendered week-in-review article (Stages A → B → C → D → E in one workflow).
strict: false
on:
  schedule:
    - cron: "0 9 * * 6"  # Saturdays around 09:00 UTC
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
  group: "news-week-in-review"
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
    title-prefix: "[news] "
    labels: [agentic-news, analysis-data, "type:week-in-review"]
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
---
# 📰 EU Parliament Week in Review — Unified Workflow

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
7. [`.github/prompts/04-article-assembly.md`](../prompts/04-article-assembly.md) — Stage D (deterministic CLI; agents do not author prose) *(landed in PR 3)*
8. [`.github/prompts/06-pr-and-safe-outputs.md`](../prompts/06-pr-and-safe-outputs.md) — **single-PR rule**, unified-workflow PR contract
9. On error → [`.github/prompts/09-troubleshooting.md`](../prompts/09-troubleshooting.md)

> **Until PR 3 lands**: `04-article-assembly.md` may not yet exist — the
> Stage D bash block in this workflow is fully self-contained and does
> not require that prompt to be present to run correctly.

## 🔖 Workflow Parameters

| Parameter | Value |
|-----------|-------|
| `ARTICLE_TYPE_SLUG` | `week-in-review` |
| Family | **Unified** (Stages A → B → C → D → E in one workflow) |
| Data window | last 7 days |
| Primary feeds | `get_adopted_texts_feed`, `get_events_feed`, `get_procedures_feed` with `timeframe: "one-week"`. |
| Stage A budget | ≤ 5 min |
| Stage B budget (2 passes) | ≥ 18 min |
| Stage D budget | ≤ 2 min (deterministic) |
| **Total active-work budget** | **22–27 min** before the single safe-outputs `create_pull_request` call |
| Hard safety cap | 75-min `timeout-minutes` |
| PR rule | **Exactly one** `[news]` PR at end of run |

> **⚠️ safeoutputs Session TTL**: The safeoutputs MCP HTTP session on
> `localhost:3001` has been observed to fail after roughly **28–30
> minutes** with no safeoutputs tool calls (agent activity on other
> tools does **not** refresh it). The Stage A (≤ 5 min) + Stage B (≥ 18
> min) + Stage C + Stage D (≤ 2 min) sequence below is sized to fit
> the 22–27 min aim. As soon as Stage C is GREEN (or ANALYSIS_ONLY on
> second-failure fallback), run Stage D (`npm run generate-article`)
> and the wrap-up immediately, then call the single PR without delay.
> See [`09-troubleshooting.md`](../prompts/09-troubleshooting.md) §5.

## 🎯 Article-Type Specifics

- Cross-reference prior week-ahead predictions — confirm or refute forward statements.
- Include `intelligence/historical-baseline.md` + `risk-scoring/risk-matrix.md` in the analysis set.

## 🗓️ Date Context + Stable Folder Resolution (MANDATORY — first bash block)

```bash
TODAY=$(date -u +%Y-%m-%d)
LAST_WEEK=$(date -u -d '7 days ago' +%Y-%m-%d)
LAST_MONTH=$(date -u -d '30 days ago' +%Y-%m-%d)
RUN_EPOCH=$(date -u +%s)
RUN_ID="week-in-review-run$$-$RUN_EPOCH"
# Canonical stable folder — no -run<NN> suffix. Repeated runs on the same
# date share this dir and append to manifest.json.history[].
ANALYSIS_DIR=$(scripts/resolve-analysis-dir.sh "$TODAY" week-in-review)
WORKFLOW_START_EPOCH=$RUN_EPOCH
echo "ARTICLE_TYPE_SLUG=week-in-review"                  >> "$GITHUB_ENV"
echo "TODAY=$TODAY"                               >> "$GITHUB_ENV"
echo "RUN_ID=$RUN_ID"                             >> "$GITHUB_ENV"
echo "ANALYSIS_DIR=$ANALYSIS_DIR"                 >> "$GITHUB_ENV"
echo "WORKFLOW_START_EPOCH=$WORKFLOW_START_EPOCH" >> "$GITHUB_ENV"
```

> **⚠️ DATE GUARD**: When passing `dateFrom`/`dateTo` to any MCP tool,
> always derive dates from `$TODAY` / `$LAST_WEEK` / `$LAST_MONTH`. Never
> hard-code a year.

## 🔁 Stage Order (absolute)

```
Stage A · Data Collection (≤ 5 min)
  → Stage B · Analysis (Pass 1 + Pass 2, ≥ 18 min)
    → Stage C · Completeness Gate (validate-analysis) — BLOCKING
      → Stage D · Article Render (npm run generate-article — deterministic, ≤ 2 min)
        → Stage E · Single PR (exactly once)
```

### Stage A — Data Collection (Ref: 01, 07)

Run the canonical gateway block from `08-infrastructure.md` §4. Source
`scripts/mcp-setup.sh`, then `scripts/wb-mcp-probe.sh` and
`scripts/imf-mcp-probe.sh`. Collect EP feed data first; fall back to
direct endpoints on failure. Deep-fetch up to 10 procedures / voting
records / meeting decisions into `${ANALYSIS_DIR}/data/`. Target ≤ 5 min.

### Stage B — Analysis (Ref: 02 §2 re-run merge rule)

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

**Pass 1 (~60% of analysis time):** Apply every methodology and template
(`analysis/methodologies/` + `analysis/templates/`) to every downloaded
data file. Write every mandatory artifact. Populate `manifest.json` with
top-level `articleType: week-in-review` and every produced file under `files.*`.

**Pass 2 (~40% of analysis time):** Read every file you wrote, end to end.
Expand shallow sections, add evidence citations, add 🟢/🟡/🔴 confidence
labels, add cross-references. No `[AI_ANALYSIS_REQUIRED]` markers may
remain.

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

- **Exit 0** → set `GATE_RESULT=GREEN` and proceed to Stage D.
- **Exit 1 (first)** → run Pass 3 on the named artifacts, re-run validator.
- **Exit 1 (second)** → set `GATE_RESULT=ANALYSIS_ONLY` and proceed to
  Stage D anyway. The deterministic renderer will emit a placeholder
  article documenting the gap (rather than no article at all), and the
  PR title will be marked accordingly.

Never use `--warn-only`.

### Stage D — Deterministic Article Render (Ref: 04-article-assembly)

**Agents do not write article prose.** Stage D is a deterministic CLI
that aggregates the committed `analysis/**` artifacts into one canonical
markdown document, then renders it to localized HTML article(s).

```bash
source scripts/mcp-setup.sh
export USE_EP_MCP=true

# 1. Persist the gate result + history entry via the existing analysis-stage
#    wrap-up. This writes manifest.json.history[].gateResult and is required
#    for downstream tooling (sitemap, political-intelligence index).
npx tsx src/generators/news-enhanced.ts \
  --types=week-in-review \
  --analysis \
  --analysis-methods=all \
  --analysis-dir="${ANALYSIS_DIR}" \
  --analysis-only \
  --gate-result="${GATE_RESULT}" \
  --run-id="${RUN_ID}"

# 2. Deterministic article rendering from the committed analysis artifacts.
#    Emits news/<TODAY>-week-in-review.en.md (canonical aggregated markdown) plus
#    news/<TODAY>-week-in-review-en.html (rendered article). Idempotent — skips
#    writes when target mtime ≥ all source artifacts.
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
- `head: "news/${TODAY}-week-in-review-${RUN_ID}"`
- `title: "[news] week-in-review — ${TODAY} (run ${RUN_ID})"` *(append `(analysis-only)` suffix when `GATE_RESULT=ANALYSIS_ONLY`)*
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
  Agent edits to `news/<date>-week-in-review.en.md` after `npm run generate-article`
  exits are forbidden.
- Never edit anything under `news/**` outside of `npm run generate-article`.
- Never dispatch another workflow except via the `dispatch-workflow:`
  safe output (`news-translate`, exactly once after merge).
- See `00-scope-and-ground-rules.md` for the full list.
