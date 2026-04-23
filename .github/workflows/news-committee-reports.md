---
name: "News: EU Parliament Committee Activity"
description: Generates EU Parliament committee activity English analysis article with deep political intelligence. Translations are handled by the separate news-translate workflow.
strict: false
on:
  # Manual debug / repro only — NOT for production generation.
  # The end-to-end monolithic run (Stages A–D + validators + PR emit)
  # typically exceeds the safeoutputs MCP HTTP session-expiry window, so
  # the final `create_pull_request` call frequently fails with
  # "session not found" and no safe outputs are produced. This applies to
  # `workflow_dispatch` runs as well — manual invocation is no more likely
  # to succeed than the removed cron trigger was.
  # For production / scheduled generation, use the paired split workflows
  # `news-committee-reports-analysis.md` and `news-committee-reports-article.md`
  # (each capped at 45 min), which stay safely inside the session-expiry
  # window and reliably emit safe outputs.
  workflow_dispatch:
    inputs:
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

timeout-minutes: 90

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
  group: "news-article-generation"
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
    labels: [agentic-news, analysis-data]
    draft: false
    expires: 14d
    allowed-base-branches: ["main"]
  add-comment:
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
# 📰 EU Parliament Committee Activity

You are the **News Journalist Agent** for EU Parliament Monitor generating
**committee-reports** articles. Weekly committee activity — new committee documents, draft reports, amendments, rapporteur appointments.

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
| `ARTICLE_TYPE_SLUG` | `committee-reports` |
| Data window | last 7 days |
| Primary feeds | `get_committee_documents_feed`, `get_committee_documents`, `get_procedures`, `analyze_committee_activity` across the last week. |
| Minimum analysis time (Stage B, 2 passes) | ≥ 20 minutes |
| Workflow timeout | 60 minutes |
| Late-workflow window (avoid slow calls past here) | after minute 50 |
| PR rule | **Exactly one** PR call at end of run (see `06-pr-and-safe-outputs.md`) |

## 🎯 Article-Type Specifics

- Ground every claim in a named committee + document ID (e.g. ENVI draft report on directive 2025/0042(COD)).
- Include `existing/committee-productivity.md` in the analysis set.

## 🗓️ Date Context Establishment (MANDATORY — first bash block)

```bash
TODAY=$(date -u +%Y-%m-%d)
TODAY_YEAR=$(date -u +%Y)
LAST_WEEK=$(date -u -d '7 days ago' +%Y-%m-%d)
LAST_MONTH=$(date -u -d '30 days ago' +%Y-%m-%d)
NEXT_WEEK=$(date -u -d '+7 days' +%Y-%m-%d)
NEXT_MONTH=$(date -u -d '+30 days' +%Y-%m-%d)
RUN_ID="committee-reports-run$$-$(date -u +%s)"
ANALYSIS_DIR="analysis/daily/${TODAY}/${RUN_ID}"
mkdir -p "${ANALYSIS_DIR}"/{classification,threat-assessment,risk-scoring,intelligence,existing,documents,data}
WORKFLOW_START_EPOCH=$(date -u +%s)
echo "ARTICLE_TYPE_SLUG=committee-reports" >> "$GITHUB_ENV"
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
  → Stage B · Analysis (Pass 1 + Pass 2, ≥ 20 min)
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
top-level `articleType: committee-reports` and every produced file under `files.*`.

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

### Stage D — Article Generation (Ref: 04, 05)

Only after Stage C exits 0:

```bash
source scripts/mcp-setup.sh
export USE_EP_MCP=true
npx tsx src/generators/news-enhanced.ts \
  --types=committee-reports \
  --title="AI-generated headline" \
  --description="AI-generated meta description" \
  --analysis \
  --analysis-methods=all \
  --analysis-dir="${ANALYSIS_DIR}"
```

Do Pass 1 (initial draft + replace every `[AI_ANALYSIS_REQUIRED]`) then Pass 2
(full read-back + rewrite shallow sections). Depth floors and quality rules
live in `04-article-generation.md` §4. Per-type AI-authored sections live in
`05-analysis-to-article-contract.md` §4.

### Validators (both must exit 0)

```bash
ARTICLE_HTML=$(ls -t "news/${TODAY}-committee-reports"*"-en.html" 2>/dev/null | head -1)
[ -n "$ARTICLE_HTML" ] && \
  node scripts/utils/validate-analysis-completeness.js --article-html="$ARTICLE_HTML"
npx tsx src/utils/validate-articles.ts --date="$TODAY" --quality --strict
```

### Single PR (Ref: 06)

Emit to stdout immediately before the call:

```
SINGLE_PR_ATTESTATION: about to emit the only PR of this run at elapsed=<N>m with <X> analysis files + <Y> article files staged
```

Then call `safeoutputs___create_pull_request` **exactly once** with:
- `base: "main"`
- `head: "news/${TODAY}-committee-reports-${RUN_ID}"`
- `title: "[news] <AI-generated headline>"`
- `body: <PR body summarising analysis + article + any fixes per 00-scope §3>`

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
