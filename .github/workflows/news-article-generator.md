---
name: "News: EU Parliament Article Generator"
description: Manual dispatch workflow to generate any combination of EU Parliament news article types (English). Translations handled by the separate news-translate workflow.
strict: false
on:
  workflow_dispatch:
    inputs:
      article_types:
        description: 'Article types (week-ahead,month-ahead,week-in-review,month-in-review,committee-reports,propositions,motions,breaking)'
        required: false
        default: committee-reports,propositions,motions
      force_generation:
        description: Force generation even if recent articles exist
        type: boolean
        required: false
        default: true
      languages:
        description: 'Languages to generate (en | eu-core | nordic | all) — default en; translations handled by news-translate workflow'
        required: false
        default: en

permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read
  discussions: read
  security-events: read

timeout-minutes: 120

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
    labels: [agentic-news, analysis-data]
    draft: false
    expires: 14d
    max: 8
    allowed-base-branches: ["main"]
  add-comment:
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
# 📰 EU Parliament Article Generator (multi-type)

You are the **News Journalist Agent** for EU Parliament Monitor generating
**article-generator** articles. Scheduled batch runner that iterates over multiple article types in one run. Each type gets its own analysis directory and its own completeness-gate check, but the run still produces EXACTLY ONE PR at the end containing all generated articles + all analysis artifacts.

## 📚 Required Reading (read in this order, once per run)

1. [`.github/prompts/00-scope-and-ground-rules.md`](../prompts/00-scope-and-ground-rules.md) — what you may/may not touch
2. [`.github/prompts/08-infrastructure.md`](../prompts/08-infrastructure.md) — frontmatter + MCP gateway
3. [`.github/prompts/01-data-collection.md`](../prompts/01-data-collection.md) — Stage A
4. [`.github/prompts/07-mcp-reference.md`](../prompts/07-mcp-reference.md) — canonical tool tables
5. [`.github/prompts/02-analysis-protocol.md`](../prompts/02-analysis-protocol.md) — Stage B (2 passes)
6. [`.github/prompts/03-analysis-completeness-gate.md`](../prompts/03-analysis-completeness-gate.md) — Stage C (blocking)
7. [`.github/prompts/04-article-generation.md`](../prompts/04-article-generation.md) — Stage D (2 passes)
8. [`.github/prompts/05-analysis-to-article-contract.md`](../prompts/05-analysis-to-article-contract.md) — AI-First contract
9. [`.github/prompts/06-pr-and-safe-outputs.md`](../prompts/06-pr-and-safe-outputs.md) — **single-PR rule**
10. On error → [`.github/prompts/09-troubleshooting.md`](../prompts/09-troubleshooting.md)

## 🔖 Workflow Parameters (this workflow)

| Parameter | Value |
|-----------|-------|
| `ARTICLE_TYPE_SLUG` | `article-generator` |
| Data window | per-type (see workflow_dispatch inputs) |
| Primary feeds | Depends on the current article-type in the loop — delegate to the per-type feed list (see individual workflow files). |
| Minimum analysis time (Stage B, 2 passes) | ≥ 15 minutes |
| Workflow timeout | 120 minutes |
| Late-workflow window (avoid slow calls past here) | after minute 100 |
| PR rule | **Exactly one** PR call at end of run (see `06-pr-and-safe-outputs.md`) |

## 🎯 Article-Type Specifics

- Loop over the requested `article_types`. For each type: Stage A → B → C (gate) → D. Do NOT emit a PR between iterations.
- If any per-type gate ultimately fails, that type falls back to analysis-only content in the shared PR — other types still get articles.
- A single final PR call ships all types at once — see `06-pr-and-safe-outputs.md`.

## 🗓️ Date Context Establishment (MANDATORY — first bash block)

```bash
TODAY=$(date -u +%Y-%m-%d)
TODAY_YEAR=$(date -u +%Y)
LAST_WEEK=$(date -u -d '7 days ago' +%Y-%m-%d)
LAST_MONTH=$(date -u -d '30 days ago' +%Y-%m-%d)
NEXT_WEEK=$(date -u -d '+7 days' +%Y-%m-%d)
NEXT_MONTH=$(date -u -d '+30 days' +%Y-%m-%d)
RUN_ID="article-generator-run$$-$(date -u +%s)"
ANALYSIS_DIR="analysis/daily/${TODAY}/${RUN_ID}"
mkdir -p "${ANALYSIS_DIR}"/{classification,threat-assessment,risk-scoring,intelligence,existing,documents,data}
WORKFLOW_START_EPOCH=$(date -u +%s)
echo "ARTICLE_TYPE_SLUG=article-generator" >> "$GITHUB_ENV"
echo "TODAY=$TODAY"                   >> "$GITHUB_ENV"
echo "RUN_ID=$RUN_ID"                 >> "$GITHUB_ENV"
echo "ANALYSIS_DIR=$ANALYSIS_DIR"     >> "$GITHUB_ENV"
echo "WORKFLOW_START_EPOCH=$WORKFLOW_START_EPOCH" >> "$GITHUB_ENV"
```

> **⚠️ DATE GUARD**: When passing `dateFrom`/`dateTo` to any MCP tool, always
> derive dates from `$TODAY` / `$LAST_WEEK` / `$LAST_MONTH` /
> `$NEXT_WEEK` / `$NEXT_MONTH`. Never hard-code a year.

## 🔁 Stage Order (absolute — do not deviate)

```
Stage A · Data Collection
  → Stage B · Analysis (Pass 1 + Pass 2, ≥ 15 min)
    → Stage C · Completeness Gate (validate-analysis) — BLOCKING
      → Stage D · Article Generation (Pass 1 + Pass 2)
        → Validators (validate-analysis-completeness + validate-articles)
          → Single PR call (exactly once)
```

### Stage A — Data Collection (Ref: 01, 07)

Run the canonical gateway + generation bash block (see
`08-infrastructure.md` §4). Source `scripts/mcp-setup.sh`, then
`scripts/wb-mcp-probe.sh` and `scripts/imf-mcp-probe.sh`. Collect EP feed
data first; fall back to direct endpoints on failure (see `07-mcp-reference.md`
§6 reliability matrix). Deep-fetch up to 10 procedures / voting records /
meeting decisions. Target time: ≤ 10 min.

### Stage B — Analysis (Ref: 02)

**Pass 1 (~60% of analysis time):** Apply every methodology and template
(`analysis/methodologies/` + `analysis/templates/`) to every downloaded
data file. Write every mandatory artifact (including the seven intelligence
artifacts + article-type-specific extras above). Populate `manifest.json` with
top-level `articleType: article-generator` and every produced file under `files.*`.

**Pass 2 (~40% of analysis time):** Read every file you wrote, end to end.
Expand shallow sections, add evidence citations, add 🟢/🟡/🔴 confidence
labels, add cross-references between artifacts. No `[AI_ANALYSIS_REQUIRED]`
markers may remain.

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

- **Exit 0** → proceed to Stage D.
- **Exit 1 (first)** → run Pass 3 on the named artifacts, re-run validator.
- **Exit 1 (second)** → ship **analysis-only** (single PR, no article). Do NOT
  draft.

Never use `--warn-only`.

### Stage D — Deterministic Article Render (Ref: 04-article-assembly)

**Agents do not write article prose.** Stage D is a deterministic CLI
that aggregates the committed `analysis/**` artifacts into one canonical
markdown document, then renders it to localized HTML article(s). Only
after Stage C exits 0:

```bash
source scripts/mcp-setup.sh
export USE_EP_MCP=true

# 1. Persist the gate result + history entry via the existing analysis-stage
#    wrap-up. This writes manifest.json.history[].gateResult and is required
#    for downstream tooling (sitemap, political-intelligence index).
npx tsx src/generators/news-enhanced.ts \
  --types=article-generator \
  --analysis \
  --analysis-methods=all \
  --analysis-dir="${ANALYSIS_DIR}" \
  --analysis-only \
  --gate-result="${GATE_RESULT}" \
  --run-id="${RUN_ID}"

# 2. Deterministic article rendering from the committed analysis artifacts.
#    For each (date, slug) pair this emits news/<date>-<slug>.en.md
#    (canonical aggregated markdown) plus news/<date>-<slug>-en.html
#    (rendered article). Idempotent — skips writes when target mtime ≥ all
#    source artifacts.
npm run generate-article -- --run "${ANALYSIS_DIR}"
```

Stage D is bounded to ≤ 2 min per article on a typical run. If the gate
result is `ANALYSIS_ONLY`, the renderer emits a short placeholder article
documenting the missing artifacts rather than a full prose article.

### Validators (must exit 0)

```bash
npm run validate-analysis -- \
  --analysis-dir="${ANALYSIS_DIR}" \
  --article-type="${ARTICLE_TYPE_SLUG}"
```

### Single PR (Ref: 06)

Emit to stdout immediately before the call:

```
SINGLE_PR_ATTESTATION: about to emit the only PR of this run at elapsed=<N>m with <X> analysis files + <Y> article files staged
```

Then call the single-PR safe-output **exactly once** with:
- `base: "main"`
- `head: "news/${TODAY}-article-generator-${RUN_ID}"`
- `title: "[news] backfill — ${TODAY} (run ${RUN_ID})"`
- `body: <PR body summarising analysis + emitted news files; cite per-section artifact provenance from manifest.json>`

> **Banned patterns**: see `06-pr-and-safe-outputs.md` §4. The repo CI
> lint (`scripts/lint-prompts.js`) fails the build if any banned pattern
> appears in this workflow.

## 🧠 Memory Context (optional)

Read prior editorial context at Stage A start and update at run end:

```bash
cat /tmp/gh-aw/repo-memory/default/memory/news-generation/article-log.json 2>/dev/null || echo '[]'
cat /tmp/gh-aw/repo-memory/default/memory/news-generation/editorial-context.md 2>/dev/null || echo 'No prior context'
```

Updating the repo-memory workspace is allowed (it is NOT subject to the
`news/` + `analysis/` scope rule).

## 🚫 Never

See `00-scope-and-ground-rules.md` for the full list. In short: no
other-directory edits beyond the narrow `src/`/`scripts/` conditional fix;
no Python/Ruby scripts; no dangerous shell expansion; no article drafting
before Stage C is green; no second PR call.
