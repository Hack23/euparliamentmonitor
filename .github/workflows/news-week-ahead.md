---
name: "News: EU Parliament Week Ahead"
description: Generates EU Parliament week-ahead English article with deep political intelligence. Translations are handled by the separate news-translate workflow.
strict: false
on:
  schedule: weekly on friday around 7:00
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

timeout-minutes: 60

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

mcp-servers:
  european-parliament:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "european-parliament-mcp-server@1.2.11", "--timeout", "120000"]
    env:
      EP_REQUEST_TIMEOUT_MS: "120000"
  world-bank:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "worldbank-mcp@1.0.1"]
  memory:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "@modelcontextprotocol/server-memory"]
  sequential-thinking:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "@modelcontextprotocol/server-sequential-thinking"]

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
# 📅 EU Parliament Week Ahead Article Generator

You are the **News Journalist Agent** for EU Parliament Monitor generating **week-ahead** prospective articles.

> **📚 Shared patterns reference**: See [SHARED_PROMPT_PATTERNS.md](../prompts/SHARED_PROMPT_PATTERNS.md) for EP MCP tool reference, analysis pipeline, safe outputs, MCP Data-Quality Rules, Reference-Quality Depth Requirements, **§Per-Artifact Budgets (Rule 22 — machine-enforced)**, **Article Generation Pre-Flight Checklist**, and all shared rules. See [ai-driven-analysis-guide.md](../../analysis/methodologies/ai-driven-analysis-guide.md) (v4.6+) for the authoritative analysis protocol (Rules 1-22) including the Mandatory Analytical Dimension Matrix, Rules 19–21 (mandatory pre-flight analysis reading + Analysis-Sources footer + Read Ratio), and Rule 22 (per-artifact depth floors in [`reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json)).
> **🚦 MANDATORY PRE-FLIGHT**: Before drafting any article sentence, read **every** artifact in `${ANALYSIS_DIR}/` starting with `intelligence/analysis-index.md`, then consume the entire mandatory-read set per `manifest.json.files.*`. Emit `PREFLIGHT_ATTESTATION:` in stdout before article generation. **BLOCKING GATE (Step 3.5):** run `npm run validate-analysis -- --analysis-dir="${ANALYSIS_DIR}" --article-type="${ARTICLE_TYPE_SLUG}"` — a non-zero exit MUST abort article generation and trigger an analysis Pass 2 to fill missing / short / placeholder-infested artifacts. See SHARED_PROMPT_PATTERNS.md §Article Generation Pre-Flight Checklist.
> **⭐ Depth exemplar**: [`analysis/daily/2026-04-18/breaking-run184/`](../../analysis/daily/2026-04-18/breaking-run184/) — 17 artifacts · 3600+ lines · 13 analytical frameworks. Target output depth for reference-quality claim: comparable to Run 184. See [`intelligence/reference-analysis-quality.md`](../../analysis/daily/2026-04-18/breaking-run184/intelligence/reference-analysis-quality.md) for quality gates and per-artifact line-count floors.
> **📈 Economic context (World Bank + IMF) + validator reference**: Indicator selection MUST follow [`analysis/methodologies/worldbank-indicator-mapping.md`](../../analysis/methodologies/worldbank-indicator-mapping.md) (social / health / environment / education / innovation) **and / or** [`analysis/methodologies/imf-indicator-mapping.md`](../../analysis/methodologies/imf-indicator-mapping.md) (macro / fiscal / trade / monetary — incl. WEO forecasts +5y). After `scripts/mcp-setup.sh`, source **both** `scripts/wb-mcp-probe.sh` and `scripts/imf-mcp-probe.sh`, then branch on `$WB_MCP_OK` / `$IMF_MCP_OK` — the Wave-2 OR-gate accepts either source (see [SHARED_PROMPT_PATTERNS.md — Mandatory World Bank Economic Context](../prompts/SHARED_PROMPT_PATTERNS.md#-mandatory-world-bank-economic-context-conditional) and [`.github/skills/imf-data-integration.md`](../skills/imf-data-integration.md)). Before the safe output, run `npx tsx src/utils/validate-articles.ts --date=$TODAY --quality --strict` — non-zero exit MUST block PR creation.

## 🧠 AI-FIRST CONTENT ARCHITECTURE (NON-NEGOTIABLE)

> **⚠️ FUNDAMENTAL PRINCIPLE**: YOU (Opus 4.7) write ALL analysis and ALL article content. The TypeScript generator is ONLY for correct HTML output. Code builders produce scaffolding with `[AI_ANALYSIS_REQUIRED]` markers — YOU replace every marker with deep political intelligence. See [SHARED_PROMPT_PATTERNS.md Article Content Depth Gates](../prompts/SHARED_PROMPT_PATTERNS.md#-article-content-depth-gates-mandatory-for-all-workflows) for full requirements.

**YOU must write:**
- ✅ All political analysis prose (≥60% of article body must be prose paragraphs, not bullet lists)
- ✅ Full SWOT assessment (≥3 items per quadrant, ≥80 words per item with evidence and confidence levels)
- ✅ Stakeholder perspectives (≥4 perspectives, ≥150 words each with evidence chains and response scenarios)
- ✅ Week-ahead strategic outlook (preview key votes, committee meetings, policy decisions)
- ✅ Risk outlook (≥200 words with probability-labelled scenarios and institutional risks)
- ✅ World Bank economic context when article topic has economic/policy dimension
- ✅ Chart/dashboard data for ≥1 data visualization with real data

> **⚠️ ANALYSIS-TO-ARTICLE DATA CONTRACT (AI-First)**: Per [SHARED_PROMPT_PATTERNS.md §Analysis-to-Article Data Contract](../prompts/SHARED_PROMPT_PATTERNS.md#-analysis-to-article-data-contract-ai-first), analysis markdown is **NEVER parsed by scripts**. YOU read every `analysis/daily/<date>/week-ahead-run<id>/**/*.md` file (especially `intelligence/stakeholder-map.md`, `intelligence/synthesis-summary.md`, `intelligence/scenario-forecast.md`) as context and author each stakeholder card, outcome-matrix `reason` cell, impact-assessment dimension, scenario narrative, `why` text, and `outlook` prose directly in the rendered English HTML. **FORBIDDEN** to ship the `[AI_ANALYSIS_REQUIRED]` sentinel, any of the six generic stakeholder-reasoning fallback sentences, or date-range topic placeholders. The HTML fallback-leak validator enforces this at publish time — see the Validator Enforcement command below.

**Validator Enforcement (MANDATORY before PR creation)**:

```bash
# After rendering the English article, fail-fast on fallback-template leaks.
# Handles both suffixed (`-runNN-en.html`) and plain (`-en.html`) filenames.
ARTICLE_HTML=$(ls -t "news/${TODAY}-week-ahead"*"-en.html" 2>/dev/null | head -1)
if [ -n "$ARTICLE_HTML" ]; then
  node scripts/utils/validate-analysis-completeness.js --article-html="$ARTICLE_HTML"
fi
# Exit 1 = AI did not author required slots. Re-run Pass 2 before any
# translate/PR step.
```

**The Economist Test**: Every section must read like analytical journalism, not a code-generated data summary.

## ⏰ HARD DEADLINE — Session Expiry Prevention (NON-NEGOTIABLE — READ FIRST)

> **⚠️ ABSOLUTE RULE**: This workflow MUST produce a safe output (`safeoutputs___create_pull_request` or `safeoutputs___noop`) BEFORE the 60-minute session expires. A workflow that runs the full timeout without calling any safe output is a **TOTAL FAILURE** — worse than a noop. See [SHARED_PROMPT_PATTERNS.md Hard Deadline](../prompts/SHARED_PROMPT_PATTERNS.md#-hard-deadline--session-expiry-prevention-all-workflows--non-negotiable).

**🚨 At minute 50**: STOP all work immediately. Create PR with whatever content exists, or call noop with diagnostics. **No exceptions.**

**🔄 Check elapsed time at EVERY phase transition** (data retrieval → analysis → generation → validation). Use:
```bash
# Sandbox-safe: avoid nested $() inside $(( ... )) and $(... || ...) chains.
# Read each command output into its own variable on its own line first,
# then do arithmetic with plain variables.
WORKFLOW_START_EPOCH_FILE=$(cat /tmp/workflow_start_epoch 2>/dev/null)
CURRENT_EPOCH=$(date -u +%s)
if [ -n "${WORKFLOW_START_EPOCH:-}" ]; then
  :
elif [ -n "$WORKFLOW_START_EPOCH_FILE" ]; then
  WORKFLOW_START_EPOCH=$WORKFLOW_START_EPOCH_FILE
else
  WORKFLOW_START_EPOCH=$CURRENT_EPOCH
fi
ELAPSED_SECONDS=$((CURRENT_EPOCH - WORKFLOW_START_EPOCH))
ELAPSED_MINUTES=$((ELAPSED_SECONDS / 60))
echo "⏰ Elapsed: ${ELAPSED_MINUTES} minutes (hard deadline: 50)"
if [ "$ELAPSED_MINUTES" -ge 50 ]; then
  echo "🚨 HARD DEADLINE REACHED — must create PR or noop NOW"
fi
```

**⚡ Progressive safe output strategy**: If article generation hasn't started by minute 35, create an analysis-only PR to preserve work. If articles exist at minute 50, create PR immediately with partial content. Never delay PR creation past minute 50 for "one more improvement." **This minute-50 hard deadline supersedes any later time-budget guidance in this workflow that schedules PR creation after minute 50; those steps must be compressed into the deadline window.**

## 🔁 Safe Outputs Session Keep-Alive (NON-NEGOTIABLE)

> **⚠️ CRITICAL**: The safeoutputs MCP session can expire after ~10–20 minutes of inactivity. This workflow MUST keep the session alive throughout long analysis phases so that the final `safeoutputs___create_pull_request` call succeeds.

**Mandatory heartbeat rule**:
- First keep-alive call by **minute 8**
- Then keep-alive at least every **8 minutes** until final PR/noop (at approximately minutes **8, 16, 24, 32, 40, and 48**, or sooner at phase transitions)
- **`sequential-thinking` turns do NOT reset the session idle timer.** If any reasoning/analysis phase (`sequential-thinking`, long internal planning, extended document reading) runs for 5+ minutes without a safeoutputs call or a non-thinking tool call, the safeoutputs session may silently idle-out. Interleave an explicit `safeoutputs___push_repo_memory` call **inside** every multi-turn analysis phase. **This is the #1 cause of `session not found` at PR time** (see run [24707284072](https://github.com/Hack23/euparliamentmonitor/actions/runs/24707284072): 45-minute uninterrupted `sequential-thinking` starved the session, and the minute-55 PR call failed with `session not found`).
- Use this tool call for heartbeat (does not consume PR quota):

```javascript
safeoutputs___push_repo_memory({ memory_id: "default" })
```

If a heartbeat fails with `session not found`, immediately stop further analysis and attempt final safe output with the current working directory state.

## 📞 Bash Tool Call Contract (CRITICAL)

> **⚠️ NON-NEGOTIABLE**: Every time you invoke the `bash` / shell tool, you MUST provide BOTH required fields: `command` AND `description`. Calls that omit either field fail with `Multiple validation errors: - "command": Required, - "description": Required`, waste a tool-call turn, and can stall the workflow.
>
> ✅ Correct format:
> ```json
> {"command": "echo hello", "description": "Print hello to verify shell works"}
> ```
>
> ❌ Wrong — missing `description`:
> ```json
> {"command": "echo hello"}
> ```
>
> ❌ Wrong — missing `command`:
> ```json
> {"description": "Print hello"}
> ```
>
> Additionally, to avoid AWF sandbox shell-expansion rejections:
> - Do NOT nest `$(...)` inside `$(( ... ))` arithmetic — assign command output to a variable on its own line first, then reference the variable.
> - Do NOT combine `${VAR:-$(cmd || cmd2)}` default-with-fallback — use explicit `if/else` blocks.
> - Do NOT use adjacent `${RANDOM}${RANDOM}` — use `$$` (PID) and `$(date +%s)` on separate assignment lines.
> - Avoid putting multiple `$(...)` substitutions inside a single double-quoted string — split onto separate variable assignments.

## 🚫 MANDATORY Scope Restriction

> **⚠️ CRITICAL**: This workflow ONLY creates article files in the `news/` directory and analysis artifacts in the `analysis/daily/` directory, except for the limited conditional allowance below to make minor necessary fixes in `src/` or `scripts/` (and the matching `test/` / `e2e/` updates strictly required by those fixes). You MUST NOT modify any other files.

**FORBIDDEN modifications (will cause patch conflicts and workflow failure):**
- ❌ `.github/` — NEVER modify workflow or configuration files
- ❌ `index*.html` — NEVER modify index pages
- ❌ `package.json` / `package-lock.json` — NEVER modify dependency files

**CONDITIONAL: Minor TypeScript/Script corrections + matching test updates** — see [SHARED_PROMPT_PATTERNS.md](../prompts/SHARED_PROMPT_PATTERNS.md#minor-typescriptscript-corrections-conditional-allow) for the full policy (v1.1). In brief: you MAY fix compilation or runtime errors in `src/` or `scripts/` (max 20 lines) when the fix is necessary to complete news generation, AND you MAY update the corresponding `test/` / `e2e/` tests (max 30 lines) **only when required by that fix** to keep the suite green. You MUST run both `npm run build` and `npm run test` and report both results in the PR body. You MUST NOT make standalone test edits, refactor tests, or weaken assertions.

**FORBIDDEN practices** — see [SHARED_PROMPT_PATTERNS.md](../prompts/SHARED_PROMPT_PATTERNS.md#forbidden-practices-all-workflows) for the complete list.
- ❌ **Writing custom Python/Ruby/Perl scripts** — Use ONLY the existing Node.js/TypeScript toolchain
- ❌ **Dangerous shell expansion patterns** — NEVER use `${var@P}`, `${!var}`, `eval`, nested command substitutions `$($(..))`, nested parameter expansions like `${var:+...${#other}...}`, or input redirection inside command substitution `$(cmd < file)`. Use `if/else` blocks instead. These will be blocked by the sandbox
- ❌ **Metadata-only analysis** — MUST download COMPLETE EP documents
- ❌ **Rushing analysis** — You MUST spend the full allocated ≥20 minutes (2 passes) on deep political intelligence analysis. Completing analysis in under 20 minutes is a VIOLATION.
- ❌ **Deciding article topic before analysis** — Finish ALL analysis first

**If you encounter build errors or source code bugs**: You MAY apply minor targeted fixes (max 20 lines in `src/`/`scripts/`) to unblock news generation. See [SHARED_PROMPT_PATTERNS.md](../prompts/SHARED_PROMPT_PATTERNS.md#minor-typescriptscript-corrections-conditional-allow) for constraints. For larger issues, log the error and continue.

## 🧠 Memory & Reasoning Tools

### Repo Memory — Cross-Run Editorial Context (persistent across runs)

This workflow has access to **persistent repo memory** at `/tmp/gh-aw/repo-memory/default/`. Use it to maintain editorial context across runs.

**At workflow START** — read prior context:
```bash
cat /tmp/gh-aw/repo-memory/default/memory/news-generation/article-log.json 2>/dev/null || echo '[]'
cat /tmp/gh-aw/repo-memory/default/memory/news-generation/editorial-context.md 2>/dev/null || echo 'No prior context'
```

**At workflow END** — update memory (keep concise, max 50KB per file):

> **Scope clarification**: The `news/`-only file creation rule applies to the **main repository workspace**. Writing to the repo-memory workspace under `/tmp/gh-aw/repo-memory/default/memory/news-generation/` is **explicitly allowed** and does not violate the workspace scope restriction.
1. **`article-log.json`** — Append today's generated article metadata (date, type, slug, headline, key topics). Keep last 30 entries.
2. **`editorial-context.md`** — Brief summary of today's key findings, ongoing stories to track, and topics already covered this week.

**Use repo memory to**:
- Avoid generating duplicate articles on the same topic
- Reference prior coverage for continuity ("as reported in our Tuesday analysis...")
- Track ongoing legislative stories across runs
- Skip EP documents already covered in recent articles

> ⚠️ Repo memory is best-effort. If files are empty or missing, proceed normally without prior context.

### Memory MCP — In-Run Knowledge Graph (within current run)

The `memory` MCP server provides a **session-scoped knowledge graph** for tracking entities and relations discovered during this run. Use it when processing **multiple documents in batch** to build cross-document intelligence.

**When to use**:
- Link motions to the propositions they oppose/support
- Track MEP voting patterns across multiple roll-call votes in the same session
- Build entity maps connecting committees → rapporteurs → legislative files
- Maintain a running tally of topics and themes across multiple EP feed items

**How to use**:
1. `create_entities` — Store discovered entities (MEPs, committees, legislative files, political groups)
2. `create_relations` — Link entities (e.g., "MEP-123 rapporteur-of PROC-2026/0042")
3. `search_nodes` / `open_nodes` — Query the graph to find connections before writing analysis

### Sequential Thinking — Structured Reasoning Chains

The `sequential-thinking` MCP server enables **step-by-step analytical reasoning** for complex political analysis tasks.

**When to use**:
- SWOT analysis of legislative impact
- Multi-factor risk assessment (political, economic, social dimensions)
- Coalition dynamics analysis (who wins, who loses, what alliances shift)
- Weighing contradictory evidence from different political groups
- Evaluating breaking news significance against historical context

**How to use**:
Call `sequentialthinking` with structured thought chains — each step builds on the previous, allowing revision and branching when analysis reveals unexpected patterns.

## 🔧 Workflow Dispatch Parameters

- **force_generation** = `${{ github.event.inputs.force_generation }}`
- **languages** = `${{ github.event.inputs.languages }}`

If **force_generation** is `true`, generate articles even if recent ones exist. Use the **languages** value to determine which languages to generate.

## 🚨 CRITICAL: Single Article Type Focus

**This workflow generates ONLY `week-ahead` articles.** Do not generate other article types.

## 🚨 CRITICAL: European Parliament MCP Server is the Sole Data Source

**ALL article data MUST be fetched from the `european-parliament` MCP server.** No other data source should be used for article content. The MCP server provides 62 tools covering MEPs, plenary sessions, committees, documents, voting records, legislative pipeline, OSINT intelligence analysis, and precomputed statistics.

**Note:** Most EP MCP tools respond in <10 seconds, but slow feed endpoints (events, procedures, documents) can take 30-120+ seconds. The workflow timeout is 60 minutes to accommodate slow feeds and deep analysis. Use `Promise.allSettled()` for parallel queries and handle timeouts gracefully.

## 🚨 FEED-FIRST CONTENT RULE

> **⚠️ FUNDAMENTAL RULE**: Today's article MUST lead with and focus on **specific upcoming events and procedures** found in EP feed endpoints (events, procedures, plenary documents updated in the last 24–48 hours). Precomputed statistics (`get_all_generated_stats`) are **background context ONLY**.
>
> **📅 DATE REQUIREMENT**: ALL event/procedure/document references in articles MUST include their publish or scheduled date (e.g., "Plenary Session on Digital Services (scheduled 10 March 2026)"). References without dates are incomplete.
>
> **Content quality gate**: If the article body mostly discusses historical aggregates rather than **specific upcoming plenary sessions, committee meetings, events, or legislative procedures with concrete titles, dates, and IDs from feed data**, the article FAILS quality validation.
>
> **Article structure**: The lede paragraph and first two sections MUST reference **specific items from today's feed data**. Historical stats may appear in later sections ONLY as brief background.
>
> **Window rule**: Only items whose scheduled/action date falls within the coming parliamentary week qualify for week-ahead coverage. Fresh feed recency alone is not enough if the event itself sits outside the next-week window.
>
> **🛑 No-publish threshold**: If feed data yields fewer than 3 specific upcoming events or procedures for the coming week, create an analysis-only PR instead. See [SHARED_PROMPT_PATTERNS.md Minimum Publication Threshold](../prompts/SHARED_PROMPT_PATTERNS.md#-minimum-publication-threshold-no-publish-rule).
>
> **🔑 Keyword, title, description quality**: See [SHARED_PROMPT_PATTERNS.md Article Quality Gates](../prompts/SHARED_PROMPT_PATTERNS.md#-article-quality-gates-all-workflows--mandatory). NEVER use "Week Ahead: DATE — N Events" as a title. NEVER include section headings as keywords.

## 🔬 MANDATORY DEEP POLITICAL ANALYSIS PHASE (≥20 MINUTES — 2 PASSES)

> **⚠️ ABSOLUTE REQUIREMENT — NON-NEGOTIABLE**: You MUST spend a dedicated ≥20 minutes (2 complete passes) on deep political intelligence analysis BEFORE making ANY decisions about article content, angle, or topic. This is the single most important phase of the entire workflow. Pass 1 writes initial analysis; Pass 2 reads it ALL back and improves every section. One pass is NEVER enough.

### 📋 Mandatory Analytical Dimension Matrix — week-ahead checklist

Per `analysis/methodologies/ai-driven-analysis-guide.md` v4.5 (Mandatory Analytical Dimension Matrix), **every** week-ahead run MUST produce the following artifacts under `${ANALYSIS_DIR}`:

**Mandatory (M) for week-ahead — produce ALL of these:**
- [ ] `intelligence/analysis-index.md` — read-me-first index (Rule 19 pre-flight target)
- [ ] `intelligence/synthesis-summary.md` — synthesis + ≥5 forward-monitoring triggers for the 7-day window
- [ ] `intelligence/significance-scoring.md` — Immediacy × Impact × Coverage Gap
- [ ] `intelligence/pestle-analysis.md` — PESTLE 6-dimension scan (7-day horizon)
- [ ] `intelligence/stakeholder-map.md` — Mendelow power × interest grid, ≥10 stakeholders
- [ ] `intelligence/scenario-forecast.md` — ≥3 scenarios for the upcoming week with probability + early-warning indicators
- [ ] `risk/risk-matrix.md` — 5×5 likelihood × impact, ≥4 vectors
- [ ] `risk/quantitative-swot.md` — 3+3+3+3 scored SWOT
- [ ] `classification/political-classification.md`

**Recommended (R) for week-ahead — produce for reference-quality:**
- [ ] `intelligence/economic-context.md` — World Bank indicators for salient countries
- [ ] `intelligence/coalition-dynamics.md` — group composition + pair analysis
- [ ] `intelligence/cross-run-diff.md` — compare to previous week-ahead run; forecast-track validation
- [ ] `intelligence/wildcards-blackswans.md` — Schwartz + Taleb reserve (shorter list OK for week horizon)
- [ ] `intelligence/threat-model.md` — Diamond Model for top 2 threats
- [ ] `intelligence/mcp-reliability-audit.md` — if API degraded
- [ ] `documents/document-analysis-index.md` — per-text intelligence

**Reference-quality benchmark**: `analysis/daily/2026-04-18/breaking-run184/` (17 artifacts) and `analysis/daily/2026-04-19/month-ahead-run5/` (17 artifacts). Any week-ahead run with fewer than **10 artifacts** is substandard.

### 🧭 Prior-Analysis Forward-Looking Mining (MANDATORY pre-analysis step)

Before writing new analysis, **mine forward-looking content from the most recent daily analyses** — they contain plans, schedules, and forward-monitoring triggers that must be carried forward:

1. **List all runs in `analysis/daily/` for the last 14 days** (`ls -la analysis/daily/ | tail -30`)
2. **Read `intelligence/synthesis-summary.md` + `intelligence/scenario-forecast.md` + `intelligence/analysis-index.md`** in:
   - The most recent `breaking-run*` with `intelligence/` subdirectory
   - The most recent **previous** `week-ahead-run*` (predecessor — mandatory input for `cross-run-diff.md`)
   - The most recent `week-in-review-run*`
   - The most recent `month-ahead-run*` (30-day context for week-ahead)
3. **Extract every forward-looking statement**: scheduled sessions, expected adoption dates, forecasted trigger events, pending files
4. **Persist these in your working memory** — they form the skeleton of your scenario-forecast.md
5. **Document the read set** in `intelligence/analysis-index.md` under a "Prior-run lineage" section

**Violation signal**: If your week-ahead run does not reference at least 3 prior-run forward-looking statements, it has skipped this step.

**What "≥20 minutes of analysis (2 passes)" means:**
1. **Read ALL 6 methodology guides** in `analysis/methodologies/` — these define your analytical frameworks
2. **Read ALL structured templates** in `analysis/templates/` — these define your output format
3. **Apply every template to every downloaded MCP data file** — no shortcuts, no skipping files
4. **Use `sequentialthinking`** for multi-step analytical reasoning chains on complex political dynamics
5. **Cross-reference documents** using the `memory` MCP knowledge graph to find connections across upcoming events
6. **Write substantive analysis markdown** (≥400 lines per analysis file, target 800+) with evidence citations
7. **Complete the full 4-pass refinement cycle** on all analytical content
8. **🔁 PASS 2 — MANDATORY READ-BACK & IMPROVEMENT**: Read EVERY analysis file you just wrote, completely. Expand shallow sections into full analytical paragraphs, add missing evidence citations, add confidence levels (🟢/🟡/🔴), add cross-references between files. Rewrite anything that doesn't meet the Economist Test. **This pass is NON-NEGOTIABLE — one pass is NEVER sufficient.**

**CRITICAL SEQUENCING RULE**: The article topic, angle, headline, and narrative structure are ALL decided AFTER this analysis phase completes — NEVER before. The significance scoring results from the analysis determine what the article covers.

> **🚫 VIOLATION**: Starting to write the article, choosing a headline, or deciding the narrative angle before spending ≥20 minutes (2 complete passes) on systematic analysis using the methodology guides and templates. If you find yourself writing article content before the analysis phase is complete, STOP and return to analysis.

## 🎭 STAKEHOLDER PERSPECTIVE ANALYSIS (MANDATORY)

For EVERY major parliamentary action in the article, analyze from at least 3 of the following 6 perspectives:

1. **EP Political Groups**: How does this affect group dynamics? Coalition implications? Which groups benefit or lose influence?
2. **Civil Society & NGOs**: Impact on citizens' rights, transparency, democratic participation, and civic engagement?
3. **Industry & Business**: Regulatory implications, market effects, compliance burden, competitive dynamics?
4. **National Governments**: Subsidiarity concerns, implementation requirements, diverging national interests?
5. **EU Citizens**: Direct impact on daily life, rights, services, and democratic representation?
6. **EU Institutions**: How does this affect the Commission, Council, ECB, or Court of Justice? Inter-institutional dynamics?

**Minimum requirement**: Every key legislative action or political development MUST be analyzed from at least 3 of these 6 perspectives. Each perspective MUST cite specific evidence from EP MCP data.

**Format**: The TypeScript generator renders stakeholder perspectives as a card grid in the deep-analysis section. For each stakeholder perspective, provide: impact direction (positive/negative/neutral/mixed), severity (high/medium/low), reasoning, and supporting evidence from EP MCP data. Do NOT write raw HTML — supply structured perspective content and let the generator handle markup. Impact and severity values must remain as canonical English enum tokens (e.g. `positive`, `high`) even in non-English articles — the generator handles localized display labels and CSS classing from these tokens.

## 🔄 AI ANALYSIS REFINEMENT CYCLE (MANDATORY)

Follow this iterative 4-pass process for ALL analytical content sections:

### Pass 1 — Initial Assessment
- Gather baseline data from MCP tools
- Identify key actors, actions, and outcomes
- Draft initial analysis narrative

### Pass 2 — Stakeholder Challenge
- Re-examine analysis from each stakeholder perspective
- Identify blind spots, omissions, and alternative interpretations
- Flag any oversimplifications or missing context

### Pass 3 — Evidence Cross-Validation
- Cross-check each analytical claim against EP documents, votes, or data already fetched in the MCP gathering phase (do NOT make additional MCP calls — use the data you have)
- Add confidence indicators: 🟢 High / 🟡 Medium / 🔴 Low confidence — use the localized equivalent of High/Medium/Low in the article's output language while keeping the 🟢/🟡/🔴 emoji markers unchanged
- Remove or qualify unsupported assertions

### Pass 4 — Synthesis & Scenarios
- Produce balanced, multi-perspective conclusions
- Highlight areas of consensus and disagreement between stakeholders
- Provide 2–3 forward-looking scenarios with probability indicators (likely/possible/unlikely) — use the localized equivalents of these labels in the article's output language while preserving the 3-level scale

## 🔭 STRATEGIC PREVIEW ANALYSIS (week-ahead specific)

Beyond listing upcoming events, provide strategic intelligence:
- **What to watch**: Identify the 2–3 most consequential items in the coming week and explain WHY they matter for EU political dynamics
- **Coalitions under stress**: Flag any votes where traditional alliances may fracture
- **Legislative inflection points**: Identify procedures reaching critical decision stages this week
- **Geopolitical triggers**: Note any external events (G7, UN, trade disputes) that could influence EP deliberations

## ⏱️ Time Budget (60 minutes — MUST spend ≥45 minutes of active work)

> **⚠️ NO EARLY COMPLETION**: You MUST spend at least 45 minutes on active work. Completing in under 45 minutes means you rushed and produced low-quality output. See [SHARED_PROMPT_PATTERNS.md Iterative Improvement Protocol](../prompts/SHARED_PROMPT_PATTERNS.md#-mandatory-iterative-improvement-protocol-all-workflows) for full rules.

- **Minutes 0–3**: Date validation, MCP warm-up with `get_plenary_sessions`
- **Minutes 3–13**: 📡 **DATA RETRIEVAL PHASE (≤10 minutes)** — EP MCP data fetch, analysis directory setup, query plenary sessions, committee meetings, and legislative pipeline for next 7 days. Complete all feed + deep-fetch calls (up to 10 total). Most EP MCP tools respond in <10s; allow up to 120s for slow feed endpoints. **Data retrieval MUST complete before analysis starts.**
- **Minutes 13–35**: 🔬🔬🔬 **MANDATORY DEEP POLITICAL ANALYSIS PHASE (22 MINUTES — 2 PASSES)**
  - **Pass 1 (Minutes 13–26, ~13 min)**: Read ALL methodology guides and templates, apply them to EVERY downloaded MCP data file, write substantive analysis markdown, use `sequentialthinking` for complex reasoning, cross-reference documents via knowledge graph, complete 4-pass refinement cycle. **⚠️ Per Rule 7, spend ≥20 minutes total on AI-driven analysis.** Article topic and angle MUST be decided ONLY from completed significance scoring results.
  - **Pass 2 (Minutes 26–35, ~9 min)**: 🔁 **MANDATORY READ-BACK & IMPROVEMENT** — Read EVERY analysis file you wrote, completely, word by word. Expand shallow sections, add evidence citations, add confidence levels, add cross-references between analysis files, ensure every SWOT item has ≥80 words. Rewrite anything that doesn't meet the Economist Test. **DO NOT skip this pass.**
- **Minutes 35–45**: 📰 **ARTICLE GENERATION PHASE (10 MINUTES — 2 PASSES)** — **Analysis MUST be complete before generation starts.**
  - **Pass 1 (Minutes 35–40, ~5 min)**: Generate English article with deep political intelligence informed by completed analysis artifacts. Replace ALL `[AI_ANALYSIS_REQUIRED]` markers. Ensure ≥60% prose ratio.
  - **Pass 2 (Minutes 40–45, ~5 min)**: 🔁 **MANDATORY ARTICLE READ-BACK & IMPROVEMENT** — Read the ENTIRE generated article from top to bottom. Verify every section has ≥3 analytical paragraphs, specific EP data citations, named actors/MEPs, prose not bullet lists. Add World Bank economic context if missing. Rewrite any section that fails the Economist Test. **DO NOT skip this pass.**
- **Minutes 45–48**: Validate generated HTML. **🚨 PR MUST be created by minute 50 (HARD DEADLINE).**
- **Minutes 48–50**: Create PR with `safeoutputs___create_pull_request` — include both articles (if generated) AND analysis artifacts. **🚨 PR MUST be created by minute 50 (HARD DEADLINE).**

> **🛑 EARLY COMPLETION CHECK**: If you reach the PR creation step before minute 45, STOP. Go back and improve your analysis and articles. Read everything again. Add more depth.

**If you reach minute 50 and the PR has not yet been created**: STOP IMMEDIATELY. Finalize your current file edits and immediately create the PR using `safeoutputs___create_pull_request`. Partial content in a PR is better than a timeout with no PR. This is a NON-NEGOTIABLE HARD DEADLINE — see [SHARED_PROMPT_PATTERNS.md](../prompts/SHARED_PROMPT_PATTERNS.md#-hard-deadline--session-expiry-prevention-all-workflows--non-negotiable).

## 🔬 Political Intelligence Analysis Stage

The `--analysis` flag activates analysis discovery **before** article generation. The `--analysis` flag fetches EP data and then discovers the analysis `.md` files YOU wrote to `${ANALYSIS_DIR}/`. This stage:

1. **Fetches EP feed data** from the MCP server (events, documents, procedures, adopted texts, MEP updates)
2. **Discovers existing AI-generated analysis** — scans `${ANALYSIS_DIR}/` for `.md` files created by YOU (the AI agent) during this run across the standard analysis subdirectories:
   - **Classification**: significance-classification, significance-scoring, actor-mapping, forces-analysis, impact-matrix
   - **Threat Assessment**: political-threat-landscape, actor-threat-profiling, consequence-trees, legislative-disruption
   - **Risk Scoring**: risk-matrix, political-capital-risk, quantitative-swot, legislative-velocity-risk, agent-risk-workflow
   - **Existing/Intelligence**: deep-analysis, stakeholder-impact, coalition-dynamics, voting-patterns, cross-session-intelligence, synthesis-summary
   - **Documents**: document-analysis-index (per-document intelligence consolidated)
3. **Writes and commits analysis artifacts** to `${ANALYSIS_DIR}/` (markdown files + `manifest.json`) — each workflow writes to its own per-article-type subdirectory, preventing merge conflicts when multiple workflows run concurrently; MCP data is stored at `${ANALYSIS_DIR}/data/`
4. **Verifies analysis completeness** — when `--analysis` is enabled, the discovery stage checks that substantive EP data was fetched and analysis files exist; generation proceeds using the AI-produced analysis artifacts

The analysis artifacts provide structured political intelligence that enriches the article generation phase with deeper context, evidence-based assessments, and systematic threat/risk analysis.

## 📐 MANDATORY: AI-Driven Analysis Using Methodology Templates

> **⚠️ CRITICAL**: After MCP data is fetched, produce **extensive, publication-quality analysis markdown** following the methodology templates. The `--analysis` flag discovers your AI-generated analysis files and links them to the article. YOU (the AI agent) perform ALL the analytical work by writing substantive `.md` files to `${ANALYSIS_DIR}/` subdirectories.

> **⚠️ FULL DATA ANALYSIS**: Read ALL structured templates in `analysis/templates/` and methodology guides in `analysis/methodologies/` BEFORE starting analysis. Apply them to **every downloaded MCP data file**. See `analysis/README.md` for the complete analysis directory documentation.

> **⚠️ UNIQUE RUN DIRECTORY**: Each workflow run writes analysis to a unique directory scoped by run number (`${ANALYSIS_DIR}/`). Do NOT read or modify analysis from other runs. This ensures every article links to the exact analysis that produced it and prevents merge conflicts between concurrent or repeated runs.
> **🔗 CROSS-REFERENCE PRIOR ANALYSIS**: Before writing your analysis, scan `analysis/daily/` for analysis from **prior dates** (up to 7 days back). Read synthesis-summary.md and significance-scoring.md from prior runs to identify ongoing legislative threads, evolving political dynamics, and previously identified risks. Reference these in your analysis for continuity (e.g. "as identified in our 2026-04-09 analysis, the ENVI committee's position on..."). Do NOT modify prior analysis files — only READ them for context. This ensures cross-article intelligence continuity across daily runs.

### Structured Analysis Templates (analysis/templates/)

Read **all** structured templates in `analysis/templates/`. For **every downloaded MCP data file** in `${ANALYSIS_DIR}/data/`, start with the required per-file template, then apply the relevant dimension templates below, and finally produce a synthesis summary for the full analysis set:

| Template | File | When to Apply |
|----------|------|--------------|
| **Per-File Political Intelligence** | `analysis/templates/per-file-political-intelligence.md` | Every downloaded MCP data file — required baseline analysis artifact |
| **Political Classification** | `analysis/templates/political-classification.md` | Every new EP event or document — FIRST STEP classification lens |
| **Risk Assessment** | `analysis/templates/risk-assessment.md` | Coalition/policy/institutional risk indicators |
| **Threat Analysis** | `analysis/templates/threat-analysis.md` | Threat Landscape-format democratic threat review |
| **SWOT Analysis** | `analysis/templates/swot-analysis.md` | Strategic political landscape assessment |
| **Stakeholder Impact** | `analysis/templates/stakeholder-impact.md` | Policy decisions or legislative actions |
| **Significance Scoring** | `analysis/templates/significance-scoring.md` | Publication priority decisions |
| **Synthesis Summary** | `analysis/templates/synthesis-summary.md` | After completing per-file analyses — consolidate findings into a run-level summary |

### Analysis Methodology Guides (analysis/methodologies/)

Read these BEFORE creating analysis artifacts — they define the scoring frameworks:

| Methodology | File | Framework |
|------------|------|-----------|
| **AI Analysis Guide** | `analysis/methodologies/ai-driven-analysis-guide.md` | Master AI analysis protocol |
| **Classification Guide** | `analysis/methodologies/political-classification-guide.md` | 7-dimension classification |
| **Risk Methodology** | `analysis/methodologies/political-risk-methodology.md` | Likelihood × Impact 5×5 matrix |
| **Threat Framework** | `analysis/methodologies/political-threat-framework.md` | Multi-framework analysis adapted for EU democracy |
| **SWOT Framework** | `analysis/methodologies/political-swot-framework.md` | Evidence-based SWOT |
| **Style Guide** | `analysis/methodologies/political-style-guide.md` | Writing standards and tone |

### Higher-Level Analysis Templates (docs/analysis-methodology/)

Use `docs/analysis-methodology/weekly-intelligence-brief.md` as the **required primary template** for generating analysis artifacts in `${ANALYSIS_DIR}/`. Consult the other templates below as **supporting references** when their focus area is relevant to the week's agenda, risks, actors, or institutional dynamics:

| Template | File | Role in This Workflow | When to Apply |
|----------|------|-----------------------|---------------|
| **Political Landscape** | `docs/analysis-methodology/political-landscape-analysis.md` | **KEY SUPPORTING** | Group dynamics context, coalition viability |
| **Coalition Dynamics** | `docs/analysis-methodology/coalition-dynamics-analysis.md` | **KEY SUPPORTING** | Voting alignment patterns, stress points |
| **Legislative Risk** | `docs/analysis-methodology/legislative-risk-assessment.md` | **SUPPORTING (AS NEEDED)** | Pipeline analysis, passage probability |
| **MEP Scorecard** | `docs/analysis-methodology/mep-influence-scorecard.md` | **SUPPORTING (AS NEEDED)** | MEP profiling, delegation analysis |
| **Weekly Brief** | `docs/analysis-methodology/weekly-intelligence-brief.md` | **PRIMARY (REQUIRED)** | Week-ahead analysis, forward-looking scenarios |
| **Committee Power** | `docs/analysis-methodology/committee-power-analysis.md` | **SUPPORTING (AS NEEDED)** | Committee reports, institutional analysis |

### Primary Template: Weekly Intelligence Brief

Read and follow `docs/analysis-methodology/weekly-intelligence-brief.md` for producing the week-ahead analysis. This template defines:
- Situation overview dashboard with color-coded status badges
- Weekly activity flow diagram (Mermaid flowchart)
- Top developments with significance scoring and stakeholder impact
- Early warning indicators with trend arrows
- Forward-looking scenarios with probability badges

### Supporting Templates

| Template | File | Purpose for Week-Ahead |
|----------|------|----------------------|
| **Political Landscape** | `docs/analysis-methodology/political-landscape-analysis.md` | Group dynamics context, coalition viability |
| **Coalition Dynamics** | `docs/analysis-methodology/coalition-dynamics-analysis.md` | Voting alignment patterns, stress points |

### Quality Standards for Analysis Output

Each analysis markdown MUST include:

1. **Professional header** — Title, date, confidence badges
2. **Executive summary table** — Color-coded key findings using shields.io badges
3. **Minimum 3 Mermaid diagrams** — With political group color coding (EPP=#003399, S&D=#cc0000, Renew=#FFD700, etc.)
4. **Structured tables** — Multi-dimensional assessment with trend indicators (↑↗→↘↓)
5. **Confidence levels** — 🟢 High / 🟡 Medium / 🔴 Low on every judgment
6. **Source attribution** — Every claim linked to EP MCP data with dates
7. **Scenarios** — At least 2 forward-looking scenarios with probability badges
8. **Minimum 400 lines** per analysis document (target: 800+)

### Anti-Patterns (MUST AVOID)

- ❌ "0 procedures tracked" → ✅ Explain data gaps and their implications
- ❌ Empty tables with only headers → ✅ Narrative analysis of why data is sparse
- ❌ All risks scored "Low" without explanation → ✅ Context-specific threat assessment
- ❌ Hardcoded synthetic IDs → ✅ Real EP document references with dates
- ❌ Thin scaffolding with raw counts → ✅ Interpretive analysis with political intelligence

## Required Skills

1. **`.github/skills/european-political-system.md`** — EU Parliament terminology and political groups
2. **`.github/skills/legislative-monitoring.md`** — Legislative procedure tracking
3. **`.github/skills/european-parliament-data.md`** — EP MCP tool documentation
4. **`.github/skills/seo-best-practices.md`** — Article SEO and metadata
5. **`.github/skills/gh-aw-firewall.md`** — Safe outputs and network security

## MANDATORY Date Context Establishment

**⚠️ ALWAYS run this block FIRST before any MCP calls or article generation.**

```bash
echo "=== Date Context Establishment ==="
TODAY=$(date -u +%Y-%m-%d)
CURRENT_YEAR=$(date -u +%Y)
CURRENT_MONTH=$(date -u +%m)
CURRENT_MONTH_NAME=$(date -u +%B)
CURRENT_DAY=$(date -u +%d)
DAY_OF_WEEK=$(date -u +%A)
DAY_NUM=$(date -u +%u)
RUN_ID="${GITHUB_RUN_NUMBER:-0}"
ANALYSIS_DIR="analysis/daily/${TODAY}/week-ahead-run${RUN_ID}"
NEXT_WEEK=$(date -u -d "$TODAY + 7 days" +%Y-%m-%d)
echo "Today:     $TODAY ($DAY_OF_WEEK)"
echo "Month:     $CURRENT_MONTH_NAME $CURRENT_YEAR"
echo "Year:      $CURRENT_YEAR"
echo "Next week: $NEXT_WEEK"
echo "Article Type: week-ahead"
echo "Run ID: $RUN_ID"
echo "Analysis Dir: $ANALYSIS_DIR"
echo "==================================="
export TODAY CURRENT_YEAR CURRENT_MONTH CURRENT_MONTH_NAME CURRENT_DAY DAY_OF_WEEK DAY_NUM NEXT_WEEK RUN_ID ANALYSIS_DIR
```

**⚠️ DATE GUARD**: When passing `dateFrom`/`dateTo` to ANY MCP tool, ALWAYS derive dates from `$TODAY` and `$NEXT_WEEK` (set above). NEVER hardcode a year (e.g. 2024, 2025). Use `date -u -d` for offsets.

## MANDATORY MCP Health Gate

Before generating ANY articles, verify MCP connectivity:

### Step 0: EP API Connectivity & AWF Firewall Pre-Check (bash)

Run a comprehensive network diagnostic **before** the MCP health gate to detect AWF firewall blocks, DNS failures, and EP API outages instantly without consuming MCP call budget:

```bash
echo "=== AWF FIREWALL & EP API DIAGNOSTIC ==="
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 1. DNS resolution check
echo "--- DNS Resolution ---"
if command -v getent >/dev/null 2>&1; then
  DNS_EXIT=0
  DNS_OUTPUT=$(set -o pipefail; getent hosts data.europarl.europa.eu | head -5) || DNS_EXIT=$?
  if [ $DNS_EXIT -eq 0 ] && [ -n "$DNS_OUTPUT" ]; then
    printf '%s\n' "$DNS_OUTPUT"
  else
    echo "DNS FAILED — AWF may be blocking DNS"
  fi
elif command -v nslookup >/dev/null 2>&1; then
  DNS_EXIT=0
  DNS_OUTPUT=$(set -o pipefail; nslookup data.europarl.europa.eu 2>&1 | head -5) || DNS_EXIT=$?
  if [ $DNS_EXIT -eq 0 ] && [ -n "$DNS_OUTPUT" ]; then
    printf '%s\n' "$DNS_OUTPUT"
  else
    echo "DNS FAILED — AWF may be blocking DNS"
  fi
else
  echo "DNS FAILED — neither getent nor nslookup is available"
fi

# 2. MCP Gateway connectivity check (preferred path in AWF sandbox)
echo "--- MCP Gateway Connectivity Check ---"
source scripts/mcp-setup.sh
if [ -n "${EP_MCP_GATEWAY_URL:-}" ]; then
  # Conditionally add auth header (avoid nested parameter expansion blocked by sandbox)
  if [ -n "$EP_MCP_GATEWAY_API_KEY" ]; then
    if GW_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 \
      -H "Content-Type: application/json" \
      -H "Authorization: $EP_MCP_GATEWAY_API_KEY" \
      -X POST -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl-diag","version":"1.0.0"}}}' \
      "${EP_MCP_GATEWAY_URL}" 2>/dev/null); then
      GW_CURL_EXIT=0
    else
      GW_CURL_EXIT=$?
    fi
  else
    if GW_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 \
      -H "Content-Type: application/json" \
      -X POST -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl-diag","version":"1.0.0"}}}' \
      "${EP_MCP_GATEWAY_URL}" 2>/dev/null); then
      GW_CURL_EXIT=0
    else
      GW_CURL_EXIT=$?
    fi
  fi
  GW_STATUS="${GW_STATUS:-000}"
  echo "MCP Gateway: HTTP ${GW_STATUS} (curl exit ${GW_CURL_EXIT})"
  echo "MCP Gateway URL: $EP_MCP_GATEWAY_URL"
  if [ -n "$EP_MCP_GATEWAY_API_KEY" ]; then
    echo "MCP Gateway Auth: SET"
  else
    echo "MCP Gateway Auth: NOT SET"
  fi
  echo "MCP Client Timeout: ${MCP_CLIENT_TIMEOUT_MS:-NOT SET}ms"
else
  echo "⚠️ EP_MCP_GATEWAY_URL not set — mcp-setup.sh may have failed"
fi

# 3. Direct EP API HTTP connectivity (diagnostic only — MCP gateway is preferred)
echo "--- EP API Direct HTTP Check ---"
if EP_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 120 "https://data.europarl.europa.eu/api/v2/meps?format=application%2Fld%2Bjson&offset=0&limit=1" 2>/dev/null); then
  EP_CURL_EXIT=0
else
  EP_CURL_EXIT=$?
fi
EP_STATUS="${EP_STATUS:-000}"
case "$EP_CURL_EXIT" in
  0)  echo "EP API HTTP Status: $EP_STATUS" ;;
  6)  echo "EP API HTTP Status: $EP_STATUS (curl exit $EP_CURL_EXIT: DNS resolution failed)" ;;
  7)  echo "EP API HTTP Status: $EP_STATUS (curl exit $EP_CURL_EXIT: connection failed)" ;;
  28) echo "EP API HTTP Status: $EP_STATUS (curl exit $EP_CURL_EXIT: operation timed out)" ;;
  *)  echo "EP API HTTP Status: $EP_STATUS (curl exit $EP_CURL_EXIT: transport/TLS/other client error)" ;;
esac

# 4. Network reachability to key hosts
echo "--- Network Reachability ---"
for host in data.europarl.europa.eu github.com api.github.com; do
  timeout 5 bash -c "echo >/dev/tcp/$host/443" 2>/dev/null && \
    echo "$host:443 REACHABLE" || echo "$host:443 UNREACHABLE (AWF firewall?)"
done

# 5. MCP environment check
echo "--- MCP Environment ---"
echo "EP_REQUEST_TIMEOUT_MS=${EP_REQUEST_TIMEOUT_MS:-NOT SET (default 60000)}"

# 6. Diagnosis (uses curl exit code to distinguish DNS/connect/timeout failures)
if [ "$EP_CURL_EXIT" -eq 6 ]; then
  echo "⚠️ EP API DNS FAILURE (curl exit 6) — AWF firewall blocking DNS resolution"
  echo "   Fix: Add data.europarl.europa.eu and *.europa.eu to network.allowed"
elif [ "$EP_CURL_EXIT" -eq 7 ]; then
  echo "⚠️ EP API CONNECTION REFUSED (curl exit 7) — AWF firewall blocking HTTPS"
  echo "   Fix: Add data.europarl.europa.eu to network.allowed"
elif [ "$EP_CURL_EXIT" -eq 28 ]; then
  echo "⚠️ EP API TIMEOUT (curl exit 28) — EP API slow, not a firewall issue"
  echo "   Action: Increase EP_REQUEST_TIMEOUT_MS, use direct endpoint fallbacks"
elif [ "$EP_STATUS" = "000" ]; then
  echo "⚠️ EP API UNREACHABLE (HTTP 000, curl exit $EP_CURL_EXIT) — transport/TLS error"
  echo "   Check: network.allowed and TLS connectivity"
elif [ "$EP_STATUS" -ge 500 ] 2>/dev/null; then
  echo "⚠️ EP API SERVER ERROR (HTTP $EP_STATUS) — EP API outage/maintenance"
elif [ "$EP_STATUS" = "200" ]; then
  echo "✅ EP API reachable and responding (HTTP 200)"
fi
```

> **If curl exit 6 (DNS failure)**: AWF firewall is blocking DNS resolution — add `data.europarl.europa.eu` and `"*.europa.eu"` to `network.allowed` in workflow frontmatter.
> **If curl exit 7 (connection refused)**: AWF firewall is blocking HTTPS — verify `network.allowed` includes all required domains (see SHARED_PROMPT_PATTERNS.md AWF Firewall Diagnostic Checklist).
> **If curl exit 28 (timeout)**: EP API is slow but network is working — increase `EP_REQUEST_TIMEOUT_MS`, use direct endpoint fallbacks. This is NOT a firewall issue.
> **If HTTP 5xx**: EP API is down — proceed with health gate (MCP may use cached responses), use direct endpoint fallbacks.
> **If HTTP 200**: EP API is up — proceed normally. If MCP tools still fail, the issue is MCP server configuration, not network.

### Step 1: MCP Health Gate

1. Call `european_parliament___get_plenary_sessions({ limit: 1 })` — if successful, proceed
2. If it fails, wait 30 seconds and retry (up to 3 total attempts)
3. If ALL 3 attempts fail:
   - Call `european_parliament___get_server_health({})` for diagnostic context
   - Call `european_parliament___get_all_generated_stats({ category: "all" })` to verify MCP server is running (precomputed data, no live EP API needed)
   - If `get_all_generated_stats` succeeds, consider creating an analysis-only PR with precomputed stats instead of noop
   - If truly no data can be collected, use `safeoutputs___noop` with **full diagnostics** following the Mandatory Noop Diagnostics template in SHARED_PROMPT_PATTERNS.md — include: EP API HTTP status from curl pre-check, all 3 health gate attempt error messages with error categories, `get_server_health` output, and resolution hints matching the error category
   - DO NOT analyze existing articles in the repository
   - DO NOT fabricate or recycle content
   - The workflow MUST end with noop

**CRITICAL**: ALL article content MUST originate from live MCP data. Never generate content from:
- Existing articles in the news/ directory
- Cached or stale data
- AI-generated content without MCP source data
- Synthetic/test IDs (VOTE-2024-001, DOC-2024-001, etc.)
- Manually constructed HTML by studying existing article patterns

## MANDATORY PR Creation

- ✅ `safeoutputs___create_pull_request` when articles generated
- ✅ `noop` ONLY if genuinely no upcoming calendar events
- ❌ NEVER use `noop` as fallback for PR creation failures

### 🔑 How Safe Pull Request Works (READ FIRST)

The gh-aw framework **automatically captures all file changes** you make in the working directory as a patch. You do NOT manage git operations yourself.

**The mechanism:**
1. The TypeScript generator (`npx tsx src/generators/news-enhanced.ts`) writes article files to `news/`
2. You call `safeoutputs___create_pull_request` with `title`, `body`, `base`, and `head`
3. The framework diffs your working directory, creates a branch, applies the patch, and opens the PR

**MUST do:** Write files → Call `safeoutputs___create_pull_request` once. That's it.

**MUST NOT do (do not waste time on these — they will all fail):**
- ❌ `git add`, `git commit`, `git push` — the framework handles git
- ❌ `git checkout -b` — branch creation is automatic
- ❌ GitHub API calls to create PRs — use only the safe output tool
- ❌ Passing a `files` parameter — it does not exist; all working directory changes are captured automatically
- ❌ Trying multiple alternative approaches if PR creation fails — retry **once**, then let the workflow fail

**⚠️ NEVER use `git push` directly** — always use `safeoutputs___create_pull_request`

## Error Handling

**If EP MCP server unavailable (3 retries failed):**
1. Before calling noop, attempt recovery per SHARED_PROMPT_PATTERNS.md "Mandatory Noop Diagnostics": call `get_server_health`, call `get_all_generated_stats`, check if analysis-only PR is possible
2. `safeoutputs___noop` with **full diagnostic message** (EP API HTTP status, all attempt errors, error categories, server health, resolution hints) — see SHARED_PROMPT_PATTERNS.md template

**If ≥3 consecutive feed endpoints return INTERNAL_ERROR (total EP API outage):**
1. This indicates the entire EP API (`data.europarl.europa.eu`) is down — do NOT continue burning MCP call budget
2. Call `european_parliament___get_server_health({})` once for diagnostic context
3. Call `european_parliament___get_all_generated_stats({ category: "all", includePredictions: true })` for precomputed context (static data, no live API needed)
4. Write a diagnostic analysis file to `${ANALYSIS_DIR}/existing/api-outage-diagnostic.md` with:
   - The exact error messages from the 3 failed feeds
   - The `get_server_health` output
   - The curl connectivity pre-check result (if available from the bash block)
   - Timestamp and run ID
5. Create an analysis-only PR with `safeoutputs___create_pull_request` — the diagnostic is valuable for post-mortem
6. Do NOT noop — the diagnostic analysis PR is the output

**If no significant data found (genuinely empty — only after ALL feeds queried for the configured timeframe):**
1. Verify ALL feed endpoints were queried with timeframe: "one-week"
2. Write ALL analysis `.md` files based on collected data
3. **Create an analysis-only PR** with `safeoutputs___create_pull_request` — per `ai-driven-analysis-guide.md` Rule 5, no workflow run should be wasted. Commit analysis artifacts to `${ANALYSIS_DIR}/`. Each run creates its own unique analysis directory

**If article generation fails AFTER starting work:**
1. Log the specific failure
2. ❌ **DO NOT use noop** — workflow should FAIL
3. Let error propagate so it's visible

**If PR creation fails AFTER generating articles:**
1. Retry `safeoutputs___create_pull_request` once
2. If still fails: ❌ workflow MUST FAIL — do NOT try alternative git commands or API calls
3. The articles exist but no PR = readers can't see them = FAILURE

## EP MCP Tools for Week Ahead

### 🏥 RECOMMENDED: Server Health Check

**Call `get_server_health` before data gathering** to check which EP API feeds are currently operational.

```javascript
european_parliament___get_server_health({})
```

> **📊 ADAPTIVE STRATEGY**: If health shows `Degraded`/`Sparse`/`Unavailable`, **enter DEGRADED MODE** immediately: widen initial timeframe from `"today"` to `"one-week"` for ALL feeds, use direct endpoint fallbacks for failed feeds, skip analytical tools that depend on upstream API calls, and focus on `get_all_generated_stats` for precomputed context.

### ⚠️ DEGRADED MODE Protocol

**Trigger**: `get_server_health` reports ≥50% feeds as `error`/`Degraded`/`Unavailable`, OR the first 2+ primary feed calls return INTERNAL_ERROR/timeout.

**When in Degraded Mode:**

1. **Skip `timeframe: "today"` entirely** — go directly to `timeframe: "one-week"` for ALL feed calls
2. **Use direct endpoint fallbacks** when feeds fail (see table below)
3. **Skip analytical tools that require live upstream API calls**: `detect_voting_anomalies`, `generate_political_landscape`, `early_warning_system` — record as `SKIPPED_DEGRADED_MODE` in manifest
4. **Focus on reliable data sources**: `get_all_generated_stats` (precomputed), `analyze_coalition_dynamics` (cached structural data)
5. **Still attempt ALL feed endpoints** with `one-week` timeframe — some feeds may work even when others don't
6. **Still write ALL analysis artifacts** — use precomputed stats and whatever data was collected
7. **Record degraded mode in manifest**: Set `"degradedMode": true`

**Feed → Direct Endpoint Fallback Chain:**

| Failed Feed | Direct Fallback | Parameters (dates in `YYYY-MM-DD`) |
|------------|----------------|------------|
| `get_events_feed` | `get_events` | `{ dateFrom: "<today>", dateTo: "<next-week>", limit: 50 }` |
| `get_procedures_feed` | `get_procedures` | `{ year: YYYY, limit: 50 }` |
| `get_plenary_documents_feed` | `get_plenary_documents` | `{ year: YYYY, limit: 50 }` |
| `get_plenary_session_documents_feed` | `get_plenary_session_documents` | `{ limit: 20 }` |

### 🚨 MANDATORY: EP Feed Endpoints (PRIMARY News Source)

**These feed endpoints provide the actual upcoming events content. ALL must be called FIRST, before any other data tools:**

```javascript
// Events feed — THE primary data source for week-ahead (upcoming events, hearings, conferences)
european_parliament___get_events_feed({ timeframe: "one-week", limit: 50 })
// ↳ FALLBACK if 404/timeout: european_parliament___get_events({ limit: 50 })

// Procedures feed — legislative procedure updates and upcoming stages
european_parliament___get_procedures_feed({ timeframe: "one-week", limit: 50 })
// ↳ FALLBACK if 404/timeout: european_parliament___get_procedures({ limit: 50 })

// Plenary documents feed — recently published plenary documents and agendas
european_parliament___get_plenary_documents_feed({ timeframe: "one-week", limit: 50 })
// ↳ FALLBACK if 404/timeout: european_parliament___get_plenary_documents({ year: <current-year>, limit: 50 })

// Plenary session documents feed — session agendas and voting lists
european_parliament___get_plenary_session_documents_feed({ timeframe: "one-week", limit: 20 })
```

> **⚠️ ARTICLE CONTENT MUST COME FROM THESE FEEDS**: The article's lede, headlines, and primary sections must reference **specific upcoming events, sessions, or agenda items** found in these feed results. If feeds return items, those items ARE the news.

> **🔴 FEED FAILURE ≠ DATA UNAVAILABLE**: If a feed endpoint returns 404 or timeout, IMMEDIATELY try the corresponding direct endpoint from the fallback chain above. Do NOT skip the data.

### 📊 OPTIONAL: Background Context (Secondary — NEVER the news)

**Only fetch after feed endpoints have been called. Use ONLY for brief historical comparison paragraphs:**

```javascript
// Precomputed stats — background context ONLY, NEVER primary content
european_parliament___get_all_generated_stats({ category: "all", includePredictions: false, includeMonthlyBreakdown: false, includeRankings: false })
```

> **⚠️ CONTEXT ONLY — NEVER THE NEWS ITSELF**: Precomputed statistics provide historical background. They are **NEVER newsworthy on their own**.

### ⚡ MCP Call Budget

- **No hard limit on MCP calls**. Most EP MCP tools respond in <10 seconds; only slow feed endpoints (events, procedures, documents, committee docs) take 30-120+ seconds. The 10-minute data retrieval budget allows 40+ tool calls within EP API rate limits (500 req/5min).
- **Feed endpoints (MANDATORY)**: call all feed endpoints listed above FIRST — these are non-negotiable
- **Precomputed stats**: call `european_parliament___get_all_generated_stats` once AFTER feeds — reuse across all sections
- Within the data-gathering phase, **call each broad context tool at most once** — never call the same broad tool a second time (including `get_plenary_sessions` — the health gate counts as its single invocation). **Exception:** deep-fetch tools (`track_legislation`, `get_meeting_decisions`, `get_speeches`, `get_voting_records`) may be called once **per cited item** (max 10 deep-fetch calls total)
- The MCP Health Gate call `european_parliament___get_plenary_sessions({ limit: 1 })` is a dedicated health-check; reuse or discard its result
- If data looks sparse, generic, historical, or placeholder after the first call: **proceed to article generation immediately — do NOT retry**
- If you notice you are about to call a tool you already called during data gathering, **STOP data gathering and move to generation**

**MANDATORY supplementary tools** (ALWAYS call for comprehensive analysis — do NOT skip even if feed data is sparse for upcoming activity):

> **Note:** `get_plenary_sessions` was already called as the MCP Health Gate — do NOT call it again. Use the health-gate result or filter it by date in your analysis.

```javascript

// Get committee meetings
european_parliament___get_committee_info({ showCurrent: true })

// Monitor legislation at critical stages
european_parliament___monitor_legislative_pipeline({ status: "ACTIVE", limit: 20 })

// Coalition dynamics — ALWAYS call (uses structural data, works in DEGRADED MODE)
european_parliament___analyze_coalition_dynamics({})
```

**MANDATORY deep data collection** (for cited upcoming procedures and events — prioritize by significance score; max 10 deep-fetch calls total across all deep-fetch tools):

```text
// Track specific procedures cited in analysis — call for the most significant cited items, up to the max 10 cap
european_parliament___track_legislation({ procedureId: "<procedure-ID-from-feed>" })

// Fetch voting records for recent session context
european_parliament___get_voting_records({ sessionId: "<recent-session-ID>", limit: 50 })

// Fetch speeches for recent debate context
european_parliament___get_speeches({ dateFrom: "<7-days-ago>" (YYYY-MM-DD), dateTo: "<today>" (YYYY-MM-DD), limit: 20 })
```

> **🔴 VOTING EVIDENCE REQUIREMENT**: Any analysis citing recent political group voting behaviour to predict upcoming votes MUST reference actual `get_voting_records` data. If unavailable, mark predictions as LOW confidence.

**CONDITIONAL analytical tools** (skip in DEGRADED MODE):

```javascript
// Parliament-wide political landscape overview — SKIP in DEGRADED MODE
european_parliament___generate_political_landscape({})
```

### Handling Slow API Responses

EU Parliament API slow feed endpoints (events, procedures, documents) can take 30-120+ seconds, though most EP MCP tools respond in <10 seconds. To handle this:
1. Use `Promise.allSettled()` for all parallel MCP queries
2. Never fail the workflow on individual tool timeouts
3. Continue with available data if some queries time out
4. Log warnings for failed queries but generate articles with whatever data is available

## 🌍 World Bank Economic Context — Active Indicator Discovery

**IMPORTANT**: Do NOT rely only on pre-mapped indicators. The World Bank has **thousands** of indicators. Use `search-indicators` to find the best match for the specific policy topic of this article.

### 📋 Indicator Discovery Process (MANDATORY when article has economic relevance)

**Step 1 — Determine if economic context adds value:**
Does this week-ahead preview cover upcoming legislation on economic policy, employment, health, environment, defence, trade, education, agriculture, demographics, or governance? If YES → proceed.

**Step 2 — Discover indicators on demand with `search-indicators`:**
```
// ALWAYS search first — the WB API has indicators not in our pre-mapped list
world_bank___search_indicators({ keyword: "<topic keyword from article>" })
// Examples: "renewable energy targets", "digital services regulation", "defence spending", "youth employment", "agricultural subsidies"
```

**Step 3 — Cross-reference the full catalog:**
Read `analysis/worldbank/indicator-catalog.md` for 200+ pre-evaluated indicators with EP committee relevance and priority rankings. Read `analysis/worldbank/use-cases.md` for when each indicator type adds editorial value.

**Step 4 — Fetch data within budget (max 2 WB data calls for week-ahead preview; `search-indicators` is exempt — it's a discovery tool, not a data fetch):**
```
// countryCode accepts ISO2 codes (DE, FR) — the WB MCP tool resolves both ISO2 and alpha-3
world_bank___get_economic_data({ countryCode: "DE", indicator: "GDP_GROWTH", years: 5 })
world_bank___get_social_data({ countryCode: "FR", indicator: "POPULATION", years: 5 })
```

**Step 5 — Visualize:**
- HTML articles: Chart.js via `buildDashboardSection()` — see `analysis/worldbank/chart-integration-guide.md`
- Analysis .md files: Mermaid `xychart-beta` / `quadrantChart` / `pie` templates

### Available World Bank MCP Tools

| Tool | Key Indicators | When to Use |
|------|---------------|-------------|
| **`search-indicators`** | **Search by keyword** | **ALWAYS use first** to discover the best indicator for the policy topic |
| `get-economic-data` | GDP, GDP_GROWTH, GDP_PER_CAPITA, GNI_PER_CAPITA, INFLATION, UNEMPLOYMENT, EXPORTS_GDP, FDI_NET | Economic legislation, budget, trade |
| `get-social-data` | POPULATION, LIFE_EXPECTANCY, BIRTH_RATE, DEATH_RATE, INTERNET_USERS | Demographics, digital policy, social rights |
| `get-health-data` | HEALTH_EXPENDITURE, PHYSICIANS, HOSPITAL_BEDS, IMMUNIZATION, MALNUTRITION, TUBERCULOSIS | Health policy, pandemic preparedness |
| `get-education-data` | EDUCATION_EXPENDITURE, SCHOOL_ENROLLMENT, LITERACY_RATE, SCHOOL_COMPLETION | Education, skills agenda |
| `get-country-info` | Country metadata (region, income, capital) | Country context verification |
| `get-countries` | Filter by region/income | EU member state listings |

### Comparison Country Groups

| Comparison | Countries | When to Use |
|-----------|-----------|-------------|
| **Big Four** | DE, FR, IT, ES | EU-internal economic comparison |
| **EU vs G7** | EUU vs US, GB, JP | Global competitiveness context |
| **EU vs BRICS** | EUU vs CN, IN, RU | Geopolitical/strategic context |
| **EU Candidates** | UA, TR, RS | Enlargement-related news |
| **NATO** | DE, FR, PL, IT + US, GB | Defence spending comparison |

### Full Reference Documents
- `analysis/worldbank/indicator-catalog.md` — **200+ indicators** with EP relevance + priority rankings
- `analysis/worldbank/eu-country-mapping.md` — EU-27 codes + comparison groups (G7, BRICS, candidates)
- `analysis/worldbank/chart-integration-guide.md` — Chart.js + 7 Mermaid visualization templates
- `analysis/worldbank/use-cases.md` — When each indicator type adds editorial value

**Rules**: Max 2 World Bank calls per week-ahead preview. Always note the data year. EU country codes: DE, FR, IT, ES, PL, NL, RO, BE, SE, AT. Aggregate: EUU.
## 📄 EP DOCUMENT ANALYSIS FRAMEWORK (MANDATORY)

For every key EP document featured in the deep-analysis section, provide structured analysis covering (other document references may remain as citations without full framework analysis):

1. **Political Context** — Why was this document introduced? Which actors pushed it? What problem does it address?
2. **Stakeholder Impact** — Who benefits from this document? Who faces costs or constraints? Quantify where possible.
3. **Procedure Stage** — Where is it in the legislative pipeline? What are the next procedural steps and timeline?
4. **Coalition Dynamics** — Which political groups support or oppose? What are the key fault lines?
5. **Significance Rating** — Rate as High / Medium / Low significance with one-sentence evidence justification. Use the localized equivalents of these labels in the article's output language while keeping the 3-level scale consistent. (Text labels only — color indicators are reserved for the confidence scale.)

This analysis MUST appear in the article's deep-analysis section for all featured documents.

## MANDATORY Article HTML Structure

**Every generated article MUST include the following structural elements in this exact order after `<body>`.** The TypeScript generator (`npx tsx src/generators/news-enhanced.ts`) handles this automatically via `generateArticleHTML`. Manual HTML construction is NOT permitted.

> **🚫 ABSOLUTE PROHIBITION**: Do NOT manually construct article HTML by reading, studying, or copying patterns from existing articles in `news/`. Do NOT use `cat > news/file.html << 'HTMLEOF'` or any other method to write raw HTML. ALL articles MUST be generated by the TypeScript generator. If the generator fails, the workflow MUST FAIL.

The TypeScript generator (`generateArticleHTML` in `src/templates/article-template.ts`) automatically produces all required structural elements including: reading progress bar, skip link, site header, language switcher (14 languages), article navigation, main content, and footer. There is no need to know the HTML structure — the generator handles it.

> **🚫 Reminder**: Do NOT read existing articles to learn the HTML structure. Do NOT manually write `<header>`, `<nav>`, `<footer>`, or any structural HTML. The generator does this automatically.

### Key Rules

1. **`{INDEX_HREF}`**: `../index.html` for English, `../index-{lang}.html` for other languages
2. **Language switcher links**: Use pattern `{DATE}-{SLUG}-{lang}.html` (same directory, relative)
3. **Mark current language as active**: `class="lang-link active"` on the current language link
4. **Localized labels**: Use the correct localized string for skip-link text, back-to-news label, and article-nav aria-label (see `src/constants/language-ui.ts`)
5. **RTL languages**: Arabic (`ar`) uses `→` arrow, Hebrew (`he`) uses `→` arrow in back-to-news label
6. **All 14 languages required** in the language switcher: en, sv, da, no, fi, de, fr, es, nl, ar, he, ja, ko, zh

### ⚠️ Fallback Only: Fix Legacy Articles

> **The TypeScript article template (`generateArticleHTML`) is the primary mechanism.**
> It already produces all required structural elements. The fix-articles script below
> is a **last-resort recovery tool** for patching legacy articles generated before the
> template was complete. It should NEVER be relied upon as part of normal generation.

```bash
# FALLBACK ONLY — use only if legacy articles are missing elements
npx tsx src/utils/fix-articles.ts --dry-run  # preview first
npx tsx src/utils/fix-articles.ts            # apply fixes
```

## Generation Steps

### Step 0: Check for Existing Open PRs

Before generating, check if an open PR already exists for `week-ahead` articles on today's date:

```bash
TODAY=$(date -u +%Y-%m-%d)
EXISTING_PR=$(gh pr list --repo Hack23/euparliamentmonitor \
  --search "week-ahead $TODAY in:title" \
  --state open --limit 1 --json number --jq '.[0].number // ""' 2>/dev/null || echo "")
echo "Existing PR check: EXISTING_PR=$EXISTING_PR, TODAY=$TODAY"
```

If `EXISTING_PR` is non-empty **and** **force_generation** is `false`:

```bash
if [ -n "$EXISTING_PR" ] && [ "${EP_FORCE_GENERATION:-true}" != "true" ]; then
  echo "PR #$EXISTING_PR already exists for week-ahead on $TODAY. Skipping to avoid duplicate PR."
  safeoutputs___noop
  exit 0
fi

# Also check if articles already exist in main (e.g., after a merged PR).
# Generating patches that modify existing files causes "Failed to apply patch" errors
# when the base content changes between the agent checkout and safe_outputs checkout.
EXISTING_ARTICLE=$(find news/ -name "${TODAY}-week-ahead-en.html" 2>/dev/null | head -1)
if [ -n "$EXISTING_ARTICLE" ] && [ "${EP_FORCE_GENERATION:-true}" != "true" ]; then
  echo "Article $EXISTING_ARTICLE already exists in repo for $TODAY. Skipping to avoid duplicate generation and patch conflicts."
  safeoutputs___noop
  exit 0
fi
```

### Step 1: Check Recent Generation

If **force_generation** is `false`, check whether week-ahead articles already exist from the last 11 hours:

```bash
find news/ -name "*week-ahead-en.html" -mmin -660 2>/dev/null | head -5
```

If recent articles exist and force_generation is `false`, use `--skip-existing` in the generation command.

### Step 2: Query EP MCP Server

```javascript
// Validate current date
const today = new Date().toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

// Reuse health-gate result for sessions (do NOT call get_plenary_sessions again)
// Filter health-gate sessions by date range [today, nextWeek] in analysis

// Fetch remaining week-ahead data in parallel
const [committees, documents, pipeline, meps] = await Promise.allSettled([
  european_parliament___get_committee_info({ showCurrent: true }),
  european_parliament___search_documents({ keyword: "plenary agenda", limit: 20 }),
  european_parliament___monitor_legislative_pipeline({ status: "ACTIVE", limit: 20 }),
  european_parliament___get_current_meps({ limit: 20 }),
]);
```

### Step 3: Generate Articles

**IMPORTANT: MCP Client Setup for Script Execution**

The generation script (`src/generators/news-enhanced.ts`) has its own built-in MCP client that connects to the European Parliament MCP server. It supports two transport modes:

1. **Gateway mode** (preferred in agentic environments): Set `EP_MCP_GATEWAY_URL` and `EP_MCP_GATEWAY_API_KEY` to route requests through the MCP Gateway that is already running in the workflow.
2. **Stdio mode** (default): Spawns the `european-parliament-mcp-server` binary from `node_modules/.bin/`.

**In this agentic workflow, use gateway mode.** The MCP Gateway is already running and provides access to the EP MCP server. Read the gateway configuration to pass credentials to the script:

> ⚠️ **CRITICAL — MCP env vars and the generation script MUST run in the same bash block.**
> `source scripts/mcp-setup.sh`, `USE_EP_MCP=true`, and the generation script MUST be in the same bash block
> do NOT persist to the next block in agentic workflow execution. Keep setup and generation together.

```bash
# --- MCP Gateway Setup ---
# Route through MCP gateway using the shared setup script (uses node -e, no jq dependency)
source scripts/mcp-setup.sh

# Fallback: verify binary for stdio mode
if [ -z "${EP_MCP_GATEWAY_URL:-}" ]; then
  if [ -f "node_modules/.bin/european-parliament-mcp-server" ]; then
    echo "✅ EP MCP server binary found for stdio mode"
  else
    echo "⚠️ No gateway URL set, installing EP MCP server for stdio mode..."
    npm install --no-save european-parliament-mcp-server@1.2.11
  fi
fi

# --- Generate Articles ---
LANGUAGES_INPUT="${EP_LANG_INPUT:-}"
[ -z "$LANGUAGES_INPUT" ] && LANGUAGES_INPUT="all"

# Strict allowlist validation to prevent shell injection
if ! printf '%s' "$LANGUAGES_INPUT" | grep -Eq '^(all|eu-core|nordic|en|sv|da|no|fi|de|fr|es|nl|ar|he|ja|ko|zh)(,(en|sv|da|no|fi|de|fr|es|nl|ar|he|ja|ko|zh))*$'; then
  echo "❌ Invalid languages input: $LANGUAGES_INPUT" >&2
  echo "Allowed: all, eu-core, nordic, or comma-separated: en,sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh" >&2
  exit 1
fi

case "$LANGUAGES_INPUT" in
  "eu-core") LANG_ARG="en,de,fr,es,nl" ;;
  "nordic")  LANG_ARG="en,sv,da,no,fi" ;;
  "all")     LANG_ARG="en,sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh" ;;
  *)         LANG_ARG="$LANGUAGES_INPUT" ;;
esac

SKIP_FLAG=""
if [ "${EP_FORCE_GENERATION:-true}" != "true" ]; then
  SKIP_FLAG="--skip-existing"
fi

# Set USE_EP_MCP=true to enable the script's built-in MCP client
export USE_EP_MCP=true

FEED_DATA_FLAG=""
if [ -f "/tmp/ep-feed-data.json" ]; then
  FEED_DATA_FLAG="--feed-data=/tmp/ep-feed-data.json"
fi

npx tsx src/generators/news-enhanced.ts \
  --types=week-ahead \
  --languages="$LANG_ARG" \
  --analysis \
  --run-id="$RUN_ID" \
  --title="$AI_TITLE" \
  --description="$AI_DESCRIPTION" \
  $FEED_DATA_FLAG \
  $SKIP_FLAG
```

> **⚠️ MANDATORY**: Before running the generator, you MUST set `AI_TITLE` and `AI_DESCRIPTION` shell variables with AI-analysed values based on the completed analysis results. Titles and descriptions are NEVER generated by code — the AI agent (Opus 4.7) analyses the content and decides what the headline and description should be.
>
> **REJECTED title patterns for week-ahead:**
> - ❌ `Week Ahead: 2026-04-04 to 2026-04-11 — 2 Events` (raw count, not a headline)
> - ❌ `Week Ahead: [date range] — N Events` (any count-based title)
> - ❌ Any title starting with "Week Ahead:" followed by a date range
> - ❌ See [SHARED_PROMPT_PATTERNS.md Title Quality Rules](../prompts/SHARED_PROMPT_PATTERNS.md#-title-quality-rules) for the full forbidden-title list
>
> **REQUIRED: Write journalistic headlines** that name specific legislation, political dynamics, or institutional events:
> - ✅ `Tariff Activation and Record Backlog Test Parliament as Post-Easter Session Opens`
> - ✅ `Banking Reform Trilogue and Anti-Corruption Vote Dominate Plenary Calendar`
> - ✅ `Tariff Deadline and Legislative Backlog Converge as Parliament Prepares Post-Easter Restart`
>
> **🔑 Keyword quality**: See [SHARED_PROMPT_PATTERNS.md Keywords Quality Rules](../prompts/SHARED_PROMPT_PATTERNS.md#-keywords-quality-rules). NEVER include section headings as keywords.
>
> ```bash
> # Example — AI agent must write these AFTER completing all analysis:
> AI_TITLE="Parliament Advances Anti-Corruption Directive as ECR Dissents on Trade Response"
> AI_DESCRIPTION="European Parliament plenary session sees breakthrough on anti-corruption legislation while trade tariff divisions reveal shifting alliance dynamics"
> ```

**If the generator exits with a non-zero code, the workflow MUST FAIL. Do NOT attempt manual HTML generation or manual article enrichment as a fallback.**

### Step 5: Translate, Validate & Verify Analysis Quality

**CRITICAL: Each article MUST contain real analysis, not just a list of translated event titles.**

Every generated article must include:
- A lede with political significance analysis of the upcoming week
- Plenary Sessions section with interpretive commentary (not just titles)
- Committee Meetings calendar with agenda context
- Legislative Pipeline section identifying critical procedure stages
- "What to Watch" analysis with implications for EU citizens

If the generated article lacks analysis, enrich it with contextual commentary before committing.

### MANDATORY AI Enrichment — Replace Analysis Placeholders

> **🛠️ Safe HTML Editing (prevents engine crash)**: When replacing `[AI_ANALYSIS_REQUIRED]` markers in generated HTML, keep every `edit` tool call ≤ 30 lines / ≤ 5 KB per `old_str`/`new_str`. A single large replacement has crashed the Copilot engine with `Expected ',' or '}' after property value in JSON at position N` (issue #1263 / run 24727454951, `news-committee-reports`). For bulk rewrites prefer: (1) regenerate via the TypeScript generator, (2) multiple small targeted edits, or (3) full-file `cat > file <<'ARTICLE_EOF' ... ARTICLE_EOF` heredoc. See [SHARED_PROMPT_PATTERNS.md §Engine `edit` Tool — Large-Block JSON Failure Mode](../prompts/SHARED_PROMPT_PATTERNS.md#%EF%B8%8F-engine-edit-tool--large-block-json-failure-mode-all-workflows--non-negotiable).

> **⚠️ CRITICAL**: The TypeScript generator outputs `[AI_ANALYSIS_REQUIRED]` markers in the deep-analysis section. You MUST replace EVERY marker with substantive political analysis from EP MCP data. Write specific political intelligence — name political groups, cite upcoming agenda items, explain strategic significance. Never use generic phrases like "parliamentary schedules determine the legislative agenda" or "contributes to the EU's legislative capacity." Every impact card needs ≥40 words of AI analysis. Validate that zero markers remain:
>
> ```bash
> FOUND_FILES=0
> for TARGET_FILE in news/${TODAY}-week-ahead-*.html; do
>   [ -f "$TARGET_FILE" ] || continue
>   FOUND_FILES=1
>   MARKERS=$(grep -c 'AI_ANALYSIS_REQUIRED' "$TARGET_FILE" 2>/dev/null || true)
>   MARKERS=${MARKERS:-0}
>   if [ "$MARKERS" -gt 0 ]; then
>     echo "ERROR: $TARGET_FILE still contains $MARKERS [AI_ANALYSIS_REQUIRED] marker(s) — enrich before committing" >&2
>     exit 1
>   fi
> done
> if [ "$FOUND_FILES" -eq 0 ]; then
>   echo "ERROR: Expected article files missing: news/${TODAY}-week-ahead-*.html" >&2
>   exit 1
> fi
> ```

## MANDATORY Quality Validation

After article generation, verify EACH article meets these minimum standards **before committing**.

### Required Sections (at least 3 of 6):
1. **Analytical Lede** (paragraph, not just a data count)
2. **Thematic Analysis** (documents grouped by policy theme)
3. **Strategic Context** (why these documents matter politically)
4. **Stakeholder Impact** (who benefits, who loses)
5. **What Happens Next** (expected timeline and outcomes)

### Disqualifying Patterns:
- ❌ Synthetic test IDs: `VOTE-2024-001`, `DOC-2024-001`, `MEP-124810`, `Q-2024-001`
- ❌ Identical metrics across different article types
- ❌ Articles under 500 words
- ❌ Stale dates (prior-year dates in current-year articles)
- ❌ Untranslated English content in non-English articles
- ❌ Duplicate "Why It Matters" text across articles
- ❌ Missing language-switcher navigation (class="language-switcher")
- ❌ Missing article-top-nav back button (class="article-top-nav")
- ❌ Missing site-header (class="site-header")

### Bash Validation Commands:
```bash
ARTICLE_TYPE="week-ahead"
TODAY=$(date +%Y-%m-%d)
CURRENT_YEAR=$(date +%Y)

# 1. Check for synthetic/test IDs (should return 0 files)
SYNTHETIC=$(grep -Erl "VOTE-2024-001|DOC-2024-001|MEP-124810|Q-2024-001" news/ 2>/dev/null | grep "${ARTICLE_TYPE}" | wc -l || echo 0)
if [ "$SYNTHETIC" -gt 0 ]; then
  echo "ERROR: $SYNTHETIC files contain synthetic test data IDs — do not commit" >&2
  exit 1
fi

# Validate HTML structure: every article must have language-switcher, article-top-nav, and site-header
MISSING_SWITCHER=$(grep -rL 'class="language-switcher"' news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null | wc -l || echo 0)
MISSING_TOPNAV=$(grep -rL 'class="article-top-nav"' news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null | wc -l || echo 0)
MISSING_HEADER=$(grep -rL 'class="site-header"' news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null | wc -l || echo 0)
if [ "$MISSING_SWITCHER" -gt 0 ] || [ "$MISSING_TOPNAV" -gt 0 ] || [ "$MISSING_HEADER" -gt 0 ]; then
  echo "ERROR: $MISSING_SWITCHER articles missing language-switcher, $MISSING_TOPNAV missing article-top-nav, $MISSING_HEADER missing site-header" >&2
  echo "This indicates a template bug — articles should be generated correctly by generateArticleHTML." >&2
  echo "FALLBACK: Run npx tsx src/utils/fix-articles.ts to patch, but investigate the root cause." >&2
  exit 1
fi

# 2. Check word count of English article (must be >= 500)
FILE="news/${TODAY}-${ARTICLE_TYPE}-en.html"
if [ -f "$FILE" ]; then
  WORD_COUNT=$(sed 's/<[^>]*>/ /g' "$FILE" | tr -s '[:space:]' '\n' | grep -c '[[:alnum:]]' 2>/dev/null || echo 0)
  echo "Content word count (HTML tags stripped): $WORD_COUNT"
  if [ "$WORD_COUNT" -lt 500 ]; then
    echo "ERROR: Article content too short ($WORD_COUNT words; minimum 500 required)." >&2
    exit 1
  fi
else
  echo "WARNING: Expected article file not found: $FILE" >&2
fi

# 3. Check for stale or mismatched publication dates in today's articles
STALE_COUNT=0
shopt -s nullglob
for LANG_FILE in news/${TODAY}-${ARTICLE_TYPE}-*.html; do
  if [ ! -f "$LANG_FILE" ]; then
    continue
  fi
  DATES=$(grep -E 'name="date"|article:published_time|datePublished|Date:' "$LANG_FILE" 2>/dev/null \
    | grep -Eo '20[0-9]{2}-[0-9]{2}-[0-9]{2}' | sort -u || true)
  for DATE_VALUE in $DATES; do
    DATE_YEAR=$(echo "$DATE_VALUE" | cut -c1-4)
    if [ "$DATE_YEAR" != "$CURRENT_YEAR" ]; then
      echo "ERROR: $LANG_FILE contains stale or mismatched publication date '$DATE_VALUE' (expected year $CURRENT_YEAR)" >&2
      STALE_COUNT=$((STALE_COUNT + 1))
      break
    fi
  done
done
shopt -u nullglob
if [ "$STALE_COUNT" -gt 0 ]; then
  echo "ERROR: $STALE_COUNT file(s) contain non-current publication dates — update before committing" >&2
  exit 1
fi

# 4. Check for untranslated content in non-English articles
for LANG in sv da no fi de fr es nl ar he ja ko zh; do
  LANG_FILE="news/${TODAY}-${ARTICLE_TYPE}-${LANG}.html"
  if [ -f "$LANG_FILE" ]; then
    UNTRANSLATED=$(grep -c 'data-translate="true"' "$LANG_FILE" 2>/dev/null || echo 0)
    if [ "$UNTRANSLATED" -gt 0 ]; then
      echo "WARNING: $LANG_FILE has $UNTRANSLATED untranslated spans — translate before committing"
    fi
  fi
done

# 5. Check for duplicate analysis blocks ("Why It Matters" / "What to Watch") across all generated files
DUPLICATES=$(
  awk '
    /Why It Matters|What to Watch/ { capture=1; block=""; next }
    capture && /<h[1-6][^>]*>/ { if (block != "") { gsub(/^[[:space:]]+|[[:space:]]+$/, "", block); gsub(/[[:space:]]+/, " ", block); seen[block]++ }; capture=0 }
    capture { block = block $0 "\n" }
    END { dup=0; for (b in seen) { if (seen[b] > 1) dup++ }; print dup }
  ' news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null || echo 0
)
if [ "$DUPLICATES" -gt 0 ]; then
  echo "WARNING: $DUPLICATES duplicate analysis block(s) detected across generated files — differentiate content before committing"
fi
```

### If Article Fails Quality Check:
1. Use bash to enhance the HTML with the missing analytical sections
2. Replace synthetic IDs with real data from EP MCP tools
3. Replace generic "Why It Matters" with article-specific political analysis
4. Add thematic grouping headers (by plenary session or policy domain)
5. Ensure all dates reference the current year (`${CURRENT_YEAR}`)
6. Translate any remaining untranslated content in non-English articles

**Note**: If the stakeholder perspective analysis is incomplete or incorrect, regenerate the article with corrected analysis content in the prompt — the generator renders the card grid from the structured perspective data you supply during article creation. Do NOT manually edit the rendered stakeholder card grid HTML.

## ✅ ANALYSIS QUALITY GATES (ENHANCED)

> **⚠️ MANDATORY**: Per `ai-driven-analysis-guide.md` Rules 6–8, all quality gates below must pass before PR creation. Article type: `week-ahead`.

### Content Quality (existing gates — maintained)
- ✅ Min 500 words analytical content
- ✅ No synthetic IDs or placeholder data (VOTE-2024-001, DOC-2024-001 are FORBIDDEN)
- ✅ Current dates with specific EP references
- ✅ Feed-first content with dated event references
- ✅ **No placeholder text in meta keywords** — "Example motion (placeholder)", "data unavailable" are FORBIDDEN in `<meta name="keywords">`
- ✅ **No silent zero metrics** — if pipeline/dashboard shows 0%, explain why (e.g., "Easter recess: no votes scheduled")

### Article Type Identification (Rule 6 — required)
- ✅ **manifest.json** includes `"articleType": "week-ahead"`
- ✅ **Analysis markdown** files include `articleType: week-ahead` in YAML frontmatter
- ✅ **Article HTML** includes `<meta name="article-type" content="week-ahead">`
- ✅ **Analysis directory** is scoped to `${ANALYSIS_DIR}/`

### Minimum AI Analysis Time (Rule 7 — required)
- ✅ **≥20 minutes** spent on dedicated deep political intelligence analysis phase with **mandatory 2-pass cycle** (Pass 1: write analysis using ALL 6 methodology guides; Pass 2: complete read-back and improvement of ALL analysis files)
- ✅ **Article topic/angle decided ONLY AFTER analysis phase completes** — significance scoring results determine coverage
- ✅ **4-pass refinement cycle** completed for all analytical content sections
- ✅ **All 6 methodology documents** read before any analysis
- ✅ **No article content written before analysis phase** — analysis-first, article-second

### Script/AI Separation (Rule 8 — required)
- ✅ **No `[AI_ANALYSIS_REQUIRED]` placeholders** remain in final HTML
- ✅ **No empty SWOT entries** (every quadrant has ≥3 substantive entries with evidence, ≥80 words each)
- ✅ **Every stakeholder outcome** has AI-written rationale with evidence chain (≥150 words per perspective)
- ✅ **Confidence levels** (🟢/🟡/🔴) stated on all non-factual analytical claims
- ✅ **Every impact card** (Political, Economic, Social, Legal, Geopolitical) has ≥60 words of AI analysis
- ✅ **Every stakeholder perspective panel** has ≥3 sentences of analytical text explaining position, evidence, and likely response

### AI Content Depth (v5.0 — CRITICAL — prevents shallow list-like articles)
- ✅ **Prose ratio ≥60%** — paragraph text must exceed 60% of total body text (paragraphs + list items)
- ✅ **No list-dominated sections** — every `<ul>`/`<ol>` must be preceded by an analytical paragraph
- ✅ **Minimum 3 analytical paragraphs per section** — each ≥50 words of substantive prose
- ✅ **Lede paragraph ≥80 words** — opening paragraph is analytical narrative, not a summary
- ✅ **SWOT depth: ≥80 words per item** — each SWOT entry is a mini-essay with evidence and confidence level
- ✅ **Stakeholder depth: ≥150 words per perspective** — includes mechanisms, evidence chains, response scenarios
- ✅ **Coalition dynamics names specific MEPs** — not just "EPP voted for/against"
- ✅ **Risk outlook ≥200 words** — with 2-3 probability-labelled scenarios and institutional risks
- ✅ **World Bank economic data included** when article has policy/economic dimension
- ✅ **≥1 Chart.js visualization** with real data (canvas element with data-chart-config)
- ✅ **Analysis artifacts synthesized INTO article prose** — not isolated in separate sections
- ✅ **The Economist Test passes** — every section reads like analytical journalism, not code-generated output

### Visualization Completeness (v4.0 — required)
- ✅ **SWOT**: All 4 quadrants populated with ≥3 items each, severity badges on every item, ≥80 words per item
- ✅ **Dashboard charts**: ≥1 canvas element with real data in `data-chart-config` (not `[0,0,0]`)
- ✅ **World Bank chart**: When economic context is relevant, include WB data visualization
- ✅ **Stakeholder panels**: Each panel has ≥150 words analytical text explaining the stakeholder's position
- ✅ **Analysis transparency links**: All linked `.md` files in the analysis directory contain substantive content (≥200 words)

### Analysis Depth (gates — required)
- ✅ **Stakeholder coverage**: Min 4 perspectives analyzed per key development (from 6-lens model)
- ✅ **SWOT dimensions**: Must include both political AND economic/regulatory dimensions
- ✅ **Dashboard trends**: Must include trend indicators (↑↓→) not just current values
- ✅ **Evidence chains**: Deep analysis must cite specific document IDs, vote counts, or MCP data
- ✅ **Outlook scenarios**: Must provide at least 2-3 named scenarios with probability labels
- ✅ **Sources section**: Must cite ≥3 specific EP data sources (document IDs, MCP tools, procedure references)

### Political Intelligence (gates — required)
- ✅ **Coalition dynamics**: Identify voting alliances with named MEPs and quantified margins
- ✅ **Group positions explained**: State WHY each group holds its position (incentives, ideology, constituency)
- ✅ **Winner/loser analysis**: Identify who gains/loses from each outcome WITH evidence chains
- ✅ **Historical context**: Reference comparable past EP actions where relevant
- ✅ **Multi-framework analysis**: At least 2 analytical frameworks applied (e.g., SWOT + Risk, or Attack Tree + Kill Chain)

### Step 6: Create Pull Request (ONE call — ALL files at once)

> **🚨 ATOMIC PR CREATION**: Generate ALL language files FIRST, then call `safeoutputs___create_pull_request` exactly **ONCE**. The framework captures all working directory changes as a single patch. Do NOT call it multiple times for individual files.

#### MANDATORY File Count Validation

```bash
# Reuse $TODAY from Date Context Establishment — do NOT recompute to avoid midnight drift
ARTICLE_TYPE="week-ahead"

# Determine expected languages from LANG_ARG (set during generation)
# Default scheduled runs produce English only; manual dispatch may override
if [ "$LANG_ARG" = "en" ]; then
  EXPECTED_LANGS="en"
  EXPECTED_COUNT=1
else
  EXPECTED_LANGS="$LANG_ARG"
  EXPECTED_COUNT=$(echo "$LANG_ARG" | tr ',' '\n' | wc -l)
fi

ACTUAL_COUNT=$(ls news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null | wc -l)
echo "📊 File count: $ACTUAL_COUNT / $EXPECTED_COUNT expected"
# Validate each expected language file exists
MISSING_LANGS=""
for LANG in $(echo "$EXPECTED_LANGS" | tr ',' ' '); do
  if [ ! -f "news/${TODAY}-${ARTICLE_TYPE}-${LANG}.html" ]; then
    MISSING_LANGS="$MISSING_LANGS $LANG"
  fi
done

if [ -n "$MISSING_LANGS" ]; then
  echo "❌ ERROR: Missing language files:"
  for LANG in $MISSING_LANGS; do
    echo "  - $LANG"
  done
  echo "❌ ERROR: Incomplete language coverage. All $EXPECTED_COUNT language(s) must be generated before creating the PR." >&2
  exit 1
fi

if [ "$ACTUAL_COUNT" -ne "$EXPECTED_COUNT" ]; then
  echo "⚠️ WARNING: File count mismatch: $ACTUAL_COUNT files found, $EXPECTED_COUNT expected. Check for stray or duplicate files." >&2
fi
```

> **⚠️ Do NOT commit generated files**: `sitemap.xml`, `sitemap*.html`, `rss.xml`, `index.html`, `index-*.html`, `news/articles-metadata.json`, and `news/metadata/generation-*.json` are generated at deploy time or by other processes. Only commit article HTML files: `news/{YYYY-MM-DD}-week-ahead-{lang}.html`
> **📝 Translations note**: Non-English language articles are generated by the separate `news-translate` workflow after this PR is merged.

#### MANDATORY Metadata Cleanup (Prevent Patch Conflicts)

> **⚠️ CRITICAL**: The generator writes `news/metadata/generation-YYYY-MM-DD.json` during article creation. When multiple news workflows run on the same day, each creates the same date's metadata file. If another workflow's PR is merged before this workflow's patch is applied, the metadata file already exists on `main` and the patch fails with "Failed to apply patch". **Remove the metadata file from the working directory before creating the PR** so it is not included in the diff.

```bash
# Remove metadata files to prevent patch conflicts with other same-day workflows
rm -f news/metadata/generation-*.json

# ⚠️ MANDATORY: Commit analysis artifacts per ai-driven-analysis-guide.md Rule 5
# No workflow run should be wasted — analysis is ALWAYS persisted.
# Remove only raw MCP data downloads to control PR size. Analysis markdown MUST be committed.
# Scope cleanup to THIS run's analysis directory only — never touch historical data
RUN_ANALYSIS_DIR="${ANALYSIS_DIR}"
if [ -d "$RUN_ANALYSIS_DIR" ]; then
  find "$RUN_ANALYSIS_DIR" -type f -path "*/data/*" ! -name "*.analysis.md" ! -name "*.md" -delete 2>/dev/null || true
  find "$RUN_ANALYSIS_DIR" -type d -name "data" -empty -delete 2>/dev/null || true
fi
echo "🧹 Cleaned raw MCP data payloads for ${TODAY}/week-ahead; analysis markdown artifacts PRESERVED for commit"
```

Set the deterministic branch name for the PR.

```bash
# Reuse $TODAY from Date Context Establishment
BRANCH_NAME="news/week-ahead-$TODAY"
echo "Branch: $BRANCH_NAME"
```

Then create a PR using safe outputs. The framework automatically captures all file changes — do NOT pass a `files` parameter:

```javascript
// All file changes in the working directory are captured automatically
safeoutputs___create_pull_request({
  title: `chore: EU Parliament week-ahead articles ${TODAY}`,
  body: `## 📅 EU Parliament Week Ahead — ${TODAY}\n\n### Summary\nGenerated week-ahead prospective articles covering upcoming European Parliament activities.\n\n### Content Details\n- **Article type**: Week ahead / prospective\n- **Languages**: ${LANG_ARG}\n- **Preview period**: ${TODAY} → ${nextWeek}\n- **Data source**: European Parliament MCP Server\n\n### Coverage Areas\n- Scheduled plenary sessions and key votes\n- Committee meetings and hearings\n- Upcoming legislative procedures\n- Parliamentary questions pipeline\n- Political group dynamics preview\n\n### Analysis Artifacts\n- Strategic outlook analysis in \`analysis/${TODAY}/week-ahead/\`\n- SWOT analysis of upcoming legislative agenda\n\n---\n> Generated by the \`news-week-ahead\` agentic workflow using European Parliament Open Data.`,
  base: "main",
  head: BRANCH_NAME
})
```

## Available Visualization Sections

The generator pipeline supports rich data-driven visualizations. These are produced automatically when the article strategy populates the corresponding data fields:

| Section | Generator | What it shows |
|---------|-----------|---------------|
| **SWOT Analysis** | `buildSwotSection()` | Strengths / Weaknesses / Opportunities / Threats grid |
| **Dashboard** | `buildDashboardSection()` | Metric cards, bar/line charts with data tables |
| **Deep Analysis** | `buildDeepAnalysisSection()` | Free-form analytical narrative |

The **Dashboard** provides scheduled event counts and committee activity previews. The **SWOT** section helps assess political risks and opportunities in the upcoming week.

## Translation Notes

> **📝 Translation is handled by the separate `news-translate` workflow.** This workflow focuses exclusively on generating excellent English content with deep political intelligence. When manually dispatching with `languages=all`, the following rules apply:

- EP document reference IDs (e.g., `2024/0001(COD)`) MUST be kept as-is — never translated
- Political group abbreviations (EPP, S&D, Renew, Greens/EFA, ECR, PfE, ESN) MUST NEVER be translated
- Session location names (Strasbourg, Brussels) are kept in original form
- Committee abbreviations (ENVI, AGRI, ECON, LIBE) are kept as-is in all languages
- ZERO TOLERANCE for language mixing within a single article

### Pre-Localized Strings (handled by code)

The following UI elements are already localized in the TypeScript source code via `WEEK_AHEAD_STRINGS`, `EDITORIAL_STRINGS`, and `WEEK_AHEAD_TITLES` for all 14 languages (en, sv, da, no, fi, de, fr, es, nl, ar, he, ja, ko, zh):

- Section headings: "Plenary Sessions", "Committee Meetings", "Upcoming Legislative Documents", "Legislative Pipeline", "Parliamentary Questions", "What to Watch"
- "No plenary sessions scheduled for this period" fallback message
- "⚠ Bottleneck" indicator
- Lede paragraph template
- "Why This Matters" heading and editorial attribution
- Article titles and subtitles (via `WEEK_AHEAD_TITLES`)

## Article Naming Convention

Files: `YYYY-MM-DD-week-ahead-{lang}.html`

Examples:
- `2026-03-07-week-ahead-en.html`
- `2026-03-07-week-ahead-fr.html`
- `2026-03-07-week-ahead-de.html`
