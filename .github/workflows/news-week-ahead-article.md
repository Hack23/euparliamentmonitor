---
name: "News: EU Parliament Week Ahead — Article"
description: Generates the EU Parliament week ahead English article once the paired analysis PR is merged. Stage D only. Reads committed analysis from main, optional bounded Stage-A top-up, single article PR.
strict: false
on:
  # ⚠️ DISABLED — this split workflow was superseded by the unified
  # news-<type>.md workflow in PR #1278 (analysis-artifact-driven
  # pipeline). The file is retained for two weeks as a regression
  # safety net. Final deletion happens in PR 7. Manual dispatch only;
  # no schedule, no PR-merge trigger.
  workflow_dispatch:

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
  group: "news-article-week-ahead"
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
    labels: [agentic-news, "type:week-ahead"]
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

engine:
  id: copilot
  model: claude-opus-4.7
---
# 📰 EU Parliament Week Ahead — Article Workflow

> ## ⚠️ DISABLED — Superseded by the unified news-<type>.md workflow
>
> This split workflow has been **disabled** as part of the
> analysis-artifact-driven pipeline migration. The unified
> `news-<unified-slug>.md` workflow now runs Stages A → B → C → D → E
> in a single agent session, producing one PR containing both
> analysis artifacts and the deterministically-rendered article.
>
> The file is retained on disk for a two-week regression window;
> final deletion happens in PR 7. **Manual dispatch only** — no
> schedule, no PR-merge auto-trigger.


You are the **News Journalist Agent** for EU Parliament Monitor. This
workflow runs **Stage D only** (article drafting + PR). The analysis has
already been produced and committed to `main` by the paired
`news-week-ahead-analysis.md` workflow.

## 🚦 Trigger Gate (MANDATORY — first bash block)

This workflow fires on every `pull_request: closed` event. Exit early unless
all of the following are true:

1. The PR was **merged** (`github.event.pull_request.merged == true`).
2. The PR carries the `agentic-analysis` label.
3. The PR carries the `type:week-ahead` label.

On `workflow_dispatch` these conditions are skipped and the manual input
`analysis_date` (default today) selects the folder.

```bash
# Derive the analysis date + article-type slug from the merged PR, or from
# workflow_dispatch inputs when running manually. No nested expansion.
TODAY=$(date -u +%Y-%m-%d)
ANALYSIS_DATE_INPUT="${INPUT_ANALYSIS_DATE:-}"
if [ -n "$ANALYSIS_DATE_INPUT" ]; then
  ANALYSIS_DATE="$ANALYSIS_DATE_INPUT"
else
  ANALYSIS_DATE="$TODAY"
fi
ARTICLE_TYPE_SLUG=week-ahead
ANALYSIS_DIR=$(scripts/resolve-analysis-dir.sh "$ANALYSIS_DATE" "$ARTICLE_TYPE_SLUG")
RUN_EPOCH=$(date -u +%s)
RUN_ID="week-ahead-article-run$$-$RUN_EPOCH"
echo "TODAY=$TODAY"                           >> "$GITHUB_ENV"
echo "ANALYSIS_DATE=$ANALYSIS_DATE"           >> "$GITHUB_ENV"
echo "ARTICLE_TYPE_SLUG=$ARTICLE_TYPE_SLUG"   >> "$GITHUB_ENV"
echo "ANALYSIS_DIR=$ANALYSIS_DIR"             >> "$GITHUB_ENV"
echo "RUN_ID=$RUN_ID"                         >> "$GITHUB_ENV"
```

## 🔎 Stage 0 — Verify the committed analysis is GREEN

The paired analysis workflow records a `gateResult` in the **last** entry of
`${ANALYSIS_DIR}/manifest.json.history[]`. Use the `readLatestGateResult`
helper from [`src/utils/file-utils.ts`](../../src/utils/file-utils.ts) to
read it defensively, then act per the table in
[`04-article-generation.md`](../prompts/04-article-generation.md) §1:

```bash
if [ ! -f "$ANALYSIS_DIR/manifest.json" ]; then
  echo "noop: analysis manifest missing at $ANALYSIS_DIR — paired analysis PR not merged yet."
  exit 0
fi
GATE=$(node --input-type=module -e "
import { readLatestGateResult } from './scripts/utils/file-utils.js';
process.stdout.write(readLatestGateResult(process.env.ANALYSIS_DIR + '/manifest.json'));
")
echo "gateResult=$GATE"
case "$GATE" in
  GREEN) : ;;
  GREEN_WITH_WARNINGS|ANALYSIS_ONLY|PENDING)
    echo "noop: analysis gate is $GATE — no article will be generated for $ANALYSIS_DATE/$ARTICLE_TYPE_SLUG."
    exit 0
    ;;
  *)
    echo "noop: unrecognized gateResult=$GATE; exiting safely."
    exit 0
    ;;
esac
```

If the guard returns non-`GREEN`, end the workflow silently. Do **not**
invoke the single-PR tool — exit cleanly.

## 📚 Required Reading (read in this order, once per run)

1. [`.github/prompts/00-scope-and-ground-rules.md`](../prompts/00-scope-and-ground-rules.md) — split-workflow scope; only `news/**` edits allowed (plus append-only manifest updates)
2. [`.github/prompts/08-infrastructure.md`](../prompts/08-infrastructure.md) — frontmatter + MCP gateway + stable folder layout
3. [`.github/prompts/04-article-generation.md`](../prompts/04-article-generation.md) — Stage D (2 passes); §1 split-family precondition
4. [`.github/prompts/05-analysis-to-article-contract.md`](../prompts/05-analysis-to-article-contract.md) — §0 cross-workflow contract + AI-First contract
5. [`.github/prompts/06-pr-and-safe-outputs.md`](../prompts/06-pr-and-safe-outputs.md) — single-PR rule, §3b article-PR outcomes
6. [`.github/prompts/07-mcp-reference.md`](../prompts/07-mcp-reference.md) — canonical tool tables (needed only for optional Stage-A top-up)
7. On error → [`.github/prompts/09-troubleshooting.md`](../prompts/09-troubleshooting.md)

## 🔖 Workflow Parameters

| Parameter | Value |
|-----------|-------|
| `ARTICLE_TYPE_SLUG` | `week-ahead` |
| Family | Split: **article-only** (consumes analysis from `news-week-ahead-analysis.md`) |
| Total active-work budget | ≤ 30 minutes (well below the 45-minute timeout) |
| Optional Stage-A top-up | ≤ 5 min, skipped if analysis PR is < 6 h old |
| PR rule | **Exactly one** `[news]` PR at end of run (see `06-pr-and-safe-outputs.md` §3b) |

## 🎯 Article-Type Specifics

- Mine prior-run forward statements (per `01-data-collection.md` §8) and carry ≥ 3 forward statements forward with status updates. Include `intelligence/scenario-forecast.md` in the analysis set; render probability-labelled scenario cards.

## 🔁 Stage Order (absolute)

```
Stage 0 · Gate check (above)
  → Optional Stage-A freshness top-up
    → Stage D · Article Generation (Pass 1 + Pass 2)
      → Validators (validate-analysis-completeness + validate-articles)
        → Single news PR (exactly once)
```

### Optional Stage-A freshness top-up (≤ 5 min)

If the analysis PR merged > 6 h ago, run a bounded data refresh against EP
feeds with appropriate timeframe and append anything new to
`${ANALYSIS_DIR}/data/`. Skip entirely otherwise. This is append-only — do
not rewrite Stage-B artifacts.

### Stage D — Article Generation (Ref: 04, 05)

```bash
source scripts/mcp-setup.sh
export USE_EP_MCP=true
npx tsx src/generators/news-enhanced.ts \
  --types=week-ahead \
  --title="AI-generated headline" \
  --description="AI-generated meta description" \
  --analysis \
  --analysis-methods=all \
  --analysis-dir="${ANALYSIS_DIR}" \
  --run-id="${RUN_ID}"
```

Do Pass 1 (initial draft + replace every `[AI_ANALYSIS_REQUIRED]`) then Pass 2
(full read-back + rewrite shallow sections). Depth floors and quality rules
live in `04-article-generation.md` §4. Per-type AI-authored sections live in
`05-analysis-to-article-contract.md` §4.

### Validators (both must exit 0)

```bash
ARTICLE_HTML=$(ls -t "news/${ANALYSIS_DATE}-week-ahead"*"-en.html" 2>/dev/null | head -1)
[ -n "$ARTICLE_HTML" ] && \
  node scripts/utils/validate-analysis-completeness.js --article-html="$ARTICLE_HTML"
npx tsx src/utils/validate-articles.ts --date="$ANALYSIS_DATE" --quality --strict
```

### Single Article PR (Ref: 06 §3b)

Emit to stdout immediately before the single PR call:

```
SINGLE_PR_ATTESTATION: about to emit the only article PR of this run at elapsed=<N>m with <Y> article files staged (consuming analysis ${ANALYSIS_DIR})
```

Then invoke `safeoutputs___create_pull_request` **exactly once** with:

- `base: "main"`
- `head: "news/${ANALYSIS_DATE}-week-ahead-${RUN_ID}"`
- `title: "[news] <AI-generated headline>"`
- `body:` summarize the article + link back to the merged analysis PR +
  note any optional Stage-A top-up additions. Cite every analysis file the
  article consumed per `04-article-generation.md` §7.1.

> **Banned patterns**: see `06-pr-and-safe-outputs.md` §4. Do not emit a
> mid-run interim PR. The repo CI lint (`scripts/lint-prompts.js`)
> fails the build if any banned pattern appears in this workflow.

## 🚫 Never

- Never invoke the single-PR tool more than once per run.
- Never re-run Stage B — the analysis is already GREEN and committed.
- Never edit anything under `analysis/**` except append-only
  `manifest.json.history[]` entries (written by `runAnalysisStage`) and the
  optional Stage-A top-up under `data/`.
- See `00-scope-and-ground-rules.md` for the full list.
