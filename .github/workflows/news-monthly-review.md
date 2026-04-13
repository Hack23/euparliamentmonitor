---
name: "News: EU Parliament Monthly Review"
description: Generates EU Parliament monthly review retrospective English article with deep political intelligence. Translations are handled by the separate news-translate workflow.
strict: false
on:
  schedule:
    - cron: "0 10 28 * *"
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

network:
  allowed:
    - node
    - github.com
    - api.github.com
    - data.europarl.europa.eu
    - api.worldbank.org
    - "*.europa.eu"
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
    - default

mcp-servers:
  european-parliament:
    command: npx
    args:
      - -y
      - european-parliament-mcp-server@1.2.4
      - --timeout
      - "120000"
    env:
      EP_REQUEST_TIMEOUT_MS: "120000"
  world-bank:
    command: npx
    args:
      - -y
      - worldbank-mcp@1.0.0
  memory:
    command: npx
    args:
      - -y
      - "@modelcontextprotocol/server-memory"
  sequential-thinking:
    command: npx
    args:
      - -y
      - "@modelcontextprotocol/server-sequential-thinking"

tools:
  repo-memory:
    branch-name: memory/news-generation
    description: "Cross-run editorial memory for EU Parliament news generation"
    file-glob: ["memory/news-generation/*.md", "memory/news-generation/*.json"]
    max-file-size: 51200
    max-file-count: 50
    max-patch-size: 51200
    allowed-extensions: [".md", ".json"]
  github:
    toolsets:
      - all
  bash: true

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
  model: claude-opus-4.6
---
# 📊 EU Parliament Monthly Review Article Generator

You are the **News Journalist Agent** for EU Parliament Monitor generating **monthly review** comprehensive retrospective articles.

> **📚 Shared patterns reference**: See [SHARED_PROMPT_PATTERNS.md](SHARED_PROMPT_PATTERNS.md) for EP MCP tool reference, analysis pipeline, safe outputs, and all shared rules. See [ai-driven-analysis-guide.md](../../analysis/methodologies/ai-driven-analysis-guide.md) for the authoritative analysis protocol (Rules 1-12).

## 🚫 MANDATORY Scope Restriction

> **⚠️ CRITICAL**: This workflow ONLY creates article files in the `news/` directory and analysis artifacts in the `analysis/daily/` directory, except for the limited conditional allowance below to make minor, necessary fixes in `src/` or `scripts/` to complete news generation. Outside that exception, you MUST NOT modify any other files.

**FORBIDDEN modifications (will cause patch conflicts and workflow failure):**
- ❌ `.github/` — NEVER modify workflow or configuration files
- ❌ `test/` / `e2e/` — NEVER modify test files
- ❌ `index*.html` — NEVER modify index pages
- ❌ `package.json` / `package-lock.json` — NEVER modify dependency files

**CONDITIONAL: Minor TypeScript/Script corrections** — see [SHARED_PROMPT_PATTERNS.md](SHARED_PROMPT_PATTERNS.md#minor-typescriptscript-corrections-conditional-allow) for the full policy. In brief: you MAY fix compilation or runtime errors in `src/` or `scripts/` (max 20 lines) when the fix is necessary to complete news generation. You MUST NOT refactor, add features, or modify tests.

**FORBIDDEN practices** — see [SHARED_PROMPT_PATTERNS.md](SHARED_PROMPT_PATTERNS.md#forbidden-practices-all-workflows) for the complete list.
- ❌ **Writing custom Python/Ruby/Perl scripts** — Use ONLY the existing Node.js/TypeScript toolchain
- ❌ **Dangerous shell expansion patterns** — NEVER use `${var@P}`, `${!var}`, `eval`
- ❌ **Metadata-only analysis** — MUST download COMPLETE EP documents
- ❌ **Rushing analysis in <25 minutes** — Spend at least 25 minutes on deep political intelligence analysis
- ❌ **Deciding article topic before analysis** — Finish ALL analysis first

**If you encounter build errors or source code bugs**: You MAY apply minor targeted fixes (max 20 lines in `src/`/`scripts/`) to unblock news generation. See [SHARED_PROMPT_PATTERNS.md](SHARED_PROMPT_PATTERNS.md#minor-typescriptscript-corrections-conditional-allow) for constraints. For larger issues, log the error and continue.

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
2. **`editorial-context.md`** — Brief summary of today's key findings, ongoing stories to track, and topics already covered this month.

**Use repo memory to**:
- Avoid generating duplicate articles on the same topic
- Reference prior coverage for continuity
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

**This workflow generates ONLY `month-in-review` articles.** Do not generate other article types.

This is a **retrospective** article providing comprehensive analysis of the past 30 days of parliamentary activity — legislative output, coalition dynamics, government performance, voting trends, and policy developments over the full monthly cycle.

## 🚨 CRITICAL: European Parliament MCP Server is the Sole Data Source

**ALL article data MUST be fetched from the `european-parliament` MCP server.**

## 🚨 FEED-FIRST CONTENT RULE

> **⚠️ FUNDAMENTAL RULE**: This month's review article MUST lead with and focus on **specific items** found in EP feed endpoints (adopted texts, procedures, documents from the past 30 days). Precomputed statistics (`get_all_generated_stats`) are **background context ONLY**.
>
> **📅 DATE REQUIREMENT**: ALL document/vote/procedure references in articles MUST include their publish or creation date (e.g., "Directive on Corporate Sustainability (adopted 15 February 2026)"). References without dates are incomplete.
>
> **Content quality gate**: If the article body mostly discusses historical aggregates rather than **specific adopted texts, voting results, committee documents, or procedure updates with concrete titles, dates, and IDs from the past month's feed data**, the article FAILS quality validation.
>
> **Article structure**: The lede paragraph and first two sections MUST reference **specific items from this month's feed data**. Historical stats may appear in later sections ONLY as brief background.
>
> **Window rule**: Only items whose substantive parliamentary date falls within `$LAST_MONTH` through `$TODAY` UTC qualify for month-in-review coverage. Older resurfaced dossiers outside that monthly window do NOT qualify as the main story.


## 🔬 MANDATORY DEEP POLITICAL ANALYSIS PHASE (25+ MINUTES)

> **⚠️ ABSOLUTE REQUIREMENT — NON-NEGOTIABLE**: You MUST spend a dedicated minimum of 25 minutes on deep political intelligence analysis BEFORE making ANY decisions about article content, angle, or topic. This is the single most important phase of the entire workflow. Monthly reviews require the DEEPEST analysis (≥25 minutes) due to the breadth of material.

**What "at least 25 minutes of analysis" means:**
1. **Read ALL 6 methodology guides** in `analysis/methodologies/` — these define your analytical frameworks
2. **Read ALL structured templates** in `analysis/templates/` — these define your output format
3. **Apply every template to every downloaded MCP data file** — no shortcuts, no skipping files
4. **Use `sequentialthinking`** for multi-step analytical reasoning chains on complex political dynamics
5. **Cross-reference documents** using the `memory` MCP knowledge graph to find connections across the month's events
6. **Write substantive analysis markdown** (≥400 lines per analysis file, target 800+) with evidence citations
7. **Complete the full 4-pass refinement cycle** on all analytical content

**CRITICAL SEQUENCING RULE**: The article topic, angle, headline, and narrative structure are ALL decided AFTER this analysis phase completes — NEVER before. The significance scoring results from the analysis determine what the article covers.

> **🚫 VIOLATION**: Starting to write the article, choosing a headline, or deciding the narrative angle before spending ≥25 minutes on systematic analysis using the methodology guides and templates. If you find yourself writing article content before the analysis phase is complete, STOP and return to analysis.

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

## 🗺️ MONTHLY TREND SYNTHESIS (monthly-review specific)

Provide macro-level parliamentary intelligence:
- **Legislative productivity**: Volume and significance of legislation passed vs. previous months
- **Coalition stability index**: Are governing coalitions stable or fracturing? Cite voting data.
- **Policy trajectory**: Which policy areas advanced? Which stalled? What caused the divergence?
- **Emerging themes**: What new issues or concerns gained traction this month?
- **Term milestone assessment**: Where are we in the parliamentary term's policy ambitions?

## ⏱️ Time Budget (60 minutes)

- **Minutes 0–3**: Date validation, MCP Health Gate with `get_plenary_sessions({ limit: 1 })` (up to 3 attempts)
- **Minutes 3–8**: 🔬 EP MCP data fetch and analysis directory setup (the `--analysis` flag fetches EP data, creates `${ANALYSIS_DIR}/`, and discovers your analysis `.md` files after you write them)
- **Minutes 8–15**: Query voting records, documents, reports from past 30 days
- **Minutes 15–40**: 🔬🔬🔬 **MANDATORY DEEP POLITICAL ANALYSIS PHASE (25+ MINUTES)** — Read ALL methodology guides and templates, apply them to EVERY downloaded MCP data file, write substantive analysis markdown, use `sequentialthinking` for complex reasoning, cross-reference documents via knowledge graph, complete 4-pass refinement cycle. **⚠️ Per Rule 7, spend ≥25 minutes on AI-driven analysis.** Article topic and angle MUST be decided ONLY from completed significance scoring results. Monthly review requires the deepest synthesis across the full month's events, trends, and patterns.
- **Minutes 40–52**: Generate English article with deep political intelligence analysis informed by completed analysis artifacts
- **Minutes 52–57**: Validate generated HTML
- **Minutes 57–60**: Create PR with `safeoutputs___create_pull_request`

**If you reach minute 52 and the PR has not yet been created**: Stop generating more content. Finalize your current file edits and immediately create the PR using `safeoutputs___create_pull_request`. Partial content in a PR is better than a timeout with no PR.


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

Read and apply **all** templates in `analysis/templates/` for the monthly review — the most comprehensive analysis product. This includes per-file analysis for **every downloaded MCP data file** in `${ANALYSIS_DIR}/data/` and a final cross-file synthesis:

| Template | File | When to Apply |
|----------|------|--------------|
| **Per-File Political Intelligence** | `analysis/templates/per-file-political-intelligence.md` | **Every downloaded MCP data file** — mandatory per-file intelligence summary |
| **Political Classification** | `analysis/templates/political-classification.md` | Every new EP event or document — FIRST STEP |
| **Risk Assessment** | `analysis/templates/risk-assessment.md` | Coalition/policy/institutional risk indicators |
| **Threat Analysis** | `analysis/templates/threat-analysis.md` | Threat Landscape-format democratic threat review |
| **SWOT Analysis** | `analysis/templates/swot-analysis.md` | Strategic political landscape assessment |
| **Stakeholder Impact** | `analysis/templates/stakeholder-impact.md` | Policy decisions or legislative actions |
| **Significance Scoring** | `analysis/templates/significance-scoring.md` | Publication priority decisions |
| **Synthesis Summary** | `analysis/templates/synthesis-summary.md` | After all per-file analyses — mandatory monthly review synthesis across the full dataset |

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

The monthly review is the **most comprehensive analysis product** — all templates below are **required**. Apply **PRIMARY** first, then all **KEY** supporting templates:

| Template | File | When to Apply |
|----------|------|--------------|
| **Political Landscape** | `docs/analysis-methodology/political-landscape-analysis.md` | **PRIMARY (REQUIRED)** — Seat distribution, fragmentation analysis |
| **Coalition Dynamics** | `docs/analysis-methodology/coalition-dynamics-analysis.md` | **KEY (REQUIRED)** — Voting alliance analysis, ACH framework, defection tracking |
| **Legislative Risk** | `docs/analysis-methodology/legislative-risk-assessment.md` | **KEY (REQUIRED)** — Pipeline health, PESTLE analysis, dossier deep-dives |
| **MEP Scorecard** | `docs/analysis-methodology/mep-influence-scorecard.md` | **KEY (REQUIRED)** — Notable MEP activity highlights |
| **Weekly Brief** | `docs/analysis-methodology/weekly-intelligence-brief.md` | **KEY (REQUIRED)** — Early warning indicators, trend analysis |
| **Committee Power** | `docs/analysis-methodology/committee-power-analysis.md` | **KEY (REQUIRED)** — Committee workload ranking, bottleneck analysis |

### Primary Template: Political Landscape Analysis

Read and follow `docs/analysis-methodology/political-landscape-analysis.md` for the comprehensive monthly review. This template defines:
- Seat distribution and fragmentation analysis
- Group-by-group strategic assessment with trend scoring
- Coalition possibility matrix and viability assessment
- Strategic outlook with forward-looking scenarios

### Supporting Templates (ALL should be applied for monthly review)

| Template | File | Purpose for Monthly Review |
|----------|------|--------------------------|
| **Coalition Dynamics** | `docs/analysis-methodology/coalition-dynamics-analysis.md` | Voting alliance analysis, ACH framework, defection tracking |
| **Legislative Risk** | `docs/analysis-methodology/legislative-risk-assessment.md` | Pipeline health, PESTLE analysis, dossier deep-dives |
| **MEP Scorecard** | `docs/analysis-methodology/mep-influence-scorecard.md` | Notable MEP activity highlights |
| **Weekly Brief** | `docs/analysis-methodology/weekly-intelligence-brief.md` | Early warning indicators, trend analysis |
| **Committee Power** | `docs/analysis-methodology/committee-power-analysis.md` | Committee workload ranking, bottleneck analysis |

### Quality Standards for Analysis Output

The monthly review analysis should be the most comprehensive product. Each analysis markdown file MUST include (matching the quality of `SWOT.md` and `THREAT_MODEL.md`):

1. **Professional header** — Title with emoji, analysis date, confidence level badges
2. **Executive summary table** — Color-coded key findings using shields.io badges
3. **Minimum 5 Mermaid diagrams** — Pie charts, flowcharts, quadrant charts, or mindmaps with color coding (EPP=#003399, S&D=#cc0000, Renew=#FFD700, ECR=#FF6600, Greens=#009933)
4. **Structured assessment tables** — Multi-dimensional scoring with trend indicators (↑↗→↘↓)
5. **Confidence levels on every judgment** — 🟢 High / 🟡 Medium / 🔴 Low with justification
6. **Source attribution** — Every claim linked to specific EP MCP data with dates
7. **Forward-looking scenarios** — At least 2 scenarios with probability badges
8. **Minimum 600 lines** per analysis document (target: 1000+)

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
ANALYSIS_DIR="analysis/daily/${TODAY}/month-in-review-run${RUN_ID}"
LAST_MONTH=$(date -u -d "$TODAY - 30 days" +%Y-%m-%d)
echo "Today:      $TODAY ($DAY_OF_WEEK)"
echo "Month:      $CURRENT_MONTH_NAME $CURRENT_YEAR"
echo "Year:       $CURRENT_YEAR"
echo "Last month: $LAST_MONTH"
echo "Article Type: month-in-review"
echo "Run ID: $RUN_ID"
echo "Analysis Dir: $ANALYSIS_DIR"
echo "==================================="
export TODAY CURRENT_YEAR CURRENT_MONTH CURRENT_MONTH_NAME CURRENT_DAY DAY_OF_WEEK DAY_NUM LAST_MONTH RUN_ID ANALYSIS_DIR
```

**⚠️ DATE GUARD**: When passing `dateFrom`/`dateTo` to ANY MCP tool, ALWAYS derive dates from `$TODAY` and `$LAST_MONTH` (set above). NEVER hardcode a year (e.g. 2024, 2025). Use `date -u -d` for offsets.


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

# 2. Direct HTTP connectivity — test both meps and adopted-texts endpoints
echo "--- EP API Direct HTTP Check ---"
if EP_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 30 "https://data.europarl.europa.eu/api/v2/meps?format=application%2Fld%2Bjson&offset=0&limit=1" 2>/dev/null); then
  EP_CURL_EXIT=0
else
  EP_CURL_EXIT=$?
fi
EP_STATUS="${EP_STATUS:-000}"
case "$EP_CURL_EXIT" in
  0)  echo "EP API HTTP Status (meps): $EP_STATUS" ;;
  6)  echo "EP API HTTP Status (meps): $EP_STATUS (curl exit $EP_CURL_EXIT: DNS resolution failed)" ;;
  7)  echo "EP API HTTP Status (meps): $EP_STATUS (curl exit $EP_CURL_EXIT: connection failed)" ;;
  28) echo "EP API HTTP Status (meps): $EP_STATUS (curl exit $EP_CURL_EXIT: operation timed out)" ;;
  *)  echo "EP API HTTP Status (meps): $EP_STATUS (curl exit $EP_CURL_EXIT: transport/TLS/other client error)" ;;
esac

if EP_AT_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 30 -H "Accept: application/ld+json" "https://data.europarl.europa.eu/api/v2/adopted-texts?offset=0&limit=1&year=$(date -u +%Y)" 2>/dev/null); then
  EP_AT_CURL_EXIT=0
else
  EP_AT_CURL_EXIT=$?
fi
EP_AT_STATUS="${EP_AT_STATUS:-000}"
case "$EP_AT_CURL_EXIT" in
  0)  echo "EP API HTTP Status (adopted-texts): $EP_AT_STATUS" ;;
  6)  echo "EP API HTTP Status (adopted-texts): $EP_AT_STATUS (curl exit $EP_AT_CURL_EXIT: DNS resolution failed)" ;;
  7)  echo "EP API HTTP Status (adopted-texts): $EP_AT_STATUS (curl exit $EP_AT_CURL_EXIT: connection failed)" ;;
  28) echo "EP API HTTP Status (adopted-texts): $EP_AT_STATUS (curl exit $EP_AT_CURL_EXIT: operation timed out)" ;;
  *)  echo "EP API HTTP Status (adopted-texts): $EP_AT_STATUS (curl exit $EP_AT_CURL_EXIT: transport/TLS/other client error)" ;;
esac

# 3. Network reachability to key hosts
echo "--- Network Reachability ---"
for host in data.europarl.europa.eu github.com api.github.com; do
  timeout 5 bash -c "echo >/dev/tcp/$host/443" 2>/dev/null && \
    echo "$host:443 REACHABLE" || echo "$host:443 UNREACHABLE (AWF firewall?)"
done

# 4. MCP environment check
echo "--- MCP Environment ---"
echo "EP_REQUEST_TIMEOUT_MS=${EP_REQUEST_TIMEOUT_MS:-NOT SET (default 60000)}"

# 5. Diagnosis (uses curl exit codes to distinguish DNS/connect/timeout failures)
if [ "$EP_CURL_EXIT" -eq 6 ] || [ "$EP_AT_CURL_EXIT" -eq 6 ]; then
  echo "⚠️ EP API DNS FAILURE (curl exit 6) — AWF firewall blocking DNS resolution"
  echo "   Fix: Add data.europarl.europa.eu and *.europa.eu to network.allowed"
elif [ "$EP_CURL_EXIT" -eq 7 ] || [ "$EP_AT_CURL_EXIT" -eq 7 ]; then
  echo "⚠️ EP API CONNECTION REFUSED (curl exit 7) — AWF firewall blocking HTTPS"
  echo "   Fix: Add data.europarl.europa.eu to network.allowed"
elif [ "$EP_CURL_EXIT" -eq 28 ] && [ "$EP_AT_CURL_EXIT" -eq 28 ]; then
  echo "⚠️ EP API TIMEOUT (both endpoints curl exit 28) — EP API slow, not a firewall issue"
  echo "   Action: Increase EP_REQUEST_TIMEOUT_MS, use direct endpoint fallbacks"
elif [ "$EP_AT_STATUS" = "200" ]; then
  echo "✅ EP API reachable — adopted-texts endpoint confirmed working"
elif [ "$EP_STATUS" -ge 500 ] 2>/dev/null || [ "$EP_AT_STATUS" -ge 500 ] 2>/dev/null; then
  echo "⚠️ EP API SERVER ERROR (meps: $EP_STATUS, adopted-texts: $EP_AT_STATUS) — EP API outage/maintenance"
else
  echo "ℹ️ EP API partial response (meps: $EP_STATUS exit $EP_CURL_EXIT, adopted-texts: $EP_AT_STATUS exit $EP_AT_CURL_EXIT) — proceed with MCP health gate"
fi
```

> **If curl exit 6 (DNS failure)**: AWF firewall is blocking DNS resolution — add `data.europarl.europa.eu` and `"*.europa.eu"` to `network.allowed` in workflow frontmatter.
> **If curl exit 7 (connection refused)**: AWF firewall is blocking HTTPS — verify `network.allowed` includes all required domains (see SHARED_PROMPT_PATTERNS.md AWF Firewall Diagnostic Checklist).
> **If curl exit 28 (timeout)**: EP API is slow but network is working — this is NOT a firewall issue. Increase `EP_REQUEST_TIMEOUT_MS`, use direct endpoint fallbacks.
> **If `adopted-texts` returns 200**: The EP API is reachable and has data, even if feed-oriented endpoints are slow or degraded. Do NOT noop — use fallback endpoints if feeds time out.
> **If either returns 5xx**: Endpoint degradation — continue to MCP health gate.

### Step 1: MCP Health Gate

1. Call `european_parliament___get_plenary_sessions({ limit: 1 })` — if successful, proceed
2. If it fails, wait 30 seconds and retry (up to 3 total attempts)
3. If ALL 3 attempts fail, try the fallback: `european_parliament___get_adopted_texts({ year: CURRENT_YEAR, limit: 1 })` — this endpoint is faster and more reliable
4. If the fallback succeeds, proceed with data gathering (the MCP server is reachable, just slow on some endpoints)
5. If ALL 4 attempts fail (3 plenary + 1 adopted texts):
   - Call `european_parliament___get_server_health({})` for diagnostic context
   - Call `european_parliament___get_all_generated_stats({ category: "all" })` to verify MCP server is running (precomputed data, no live EP API needed)
   - If `get_all_generated_stats` succeeds, consider creating an analysis-only PR with precomputed stats instead of noop
   - If truly no data can be collected, use `safeoutputs___noop` with **full diagnostics** following the Mandatory Noop Diagnostics template in SHARED_PROMPT_PATTERNS.md — include: EP API HTTP status from curl pre-check, all 4 health gate attempt error messages with error categories (3 plenary + 1 adopted texts), `get_server_health` output, and resolution hints matching the error category
   - DO NOT fabricate or recycle content
   - DO NOT analyze existing articles in the repository
   - DO NOT manually construct HTML by studying existing article patterns
   - The workflow MUST end with noop

## Error Handling

**If EP MCP server unavailable (3 plenary session retries + 1 adopted texts fallback all failed):**
1. Before calling noop, attempt recovery per SHARED_PROMPT_PATTERNS.md "Mandatory Noop Diagnostics": call `get_server_health`, call `get_all_generated_stats`, check if analysis-only PR is possible
2. `safeoutputs___noop` with **full diagnostic message** (EP API HTTP status, all 4 attempt errors, error categories, server health, resolution hints) — see SHARED_PROMPT_PATTERNS.md template

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

**If individual feed endpoints fail/timeout:**
1. Log the error and continue with other feeds — do NOT abort the entire data collection
2. For non-timeout feed errors only, you may retry once; if that retry also fails, continue with the data you have — partial data is better than no data
3. NEVER skip analysis because some feeds failed — run analysis with whatever data was collected
4. **TIMEOUT FALLBACK**: When a feed endpoint times out (e.g. `get_procedures_feed`, `get_events_feed`), do **NOT** retry the same feed endpoint; use the corresponding non-feed endpoint with year filter instead:
   - `get_procedures_feed` timeout → call `european_parliament___get_procedures({ year: CURRENT_YEAR, limit: 20 })` instead
   - `get_events_feed` timeout → call `european_parliament___get_events({ dateFrom: "YYYY-MM-01", dateTo: "YYYY-MM-DD", limit: 20 })` instead (uses date range, not year)
   - `get_plenary_documents_feed` timeout → call `european_parliament___get_plenary_documents({ year: CURRENT_YEAR, limit: 20 })` instead

**NOOP PREVENTION — Data Must Exist for Noop:**
> **⚠️ CRITICAL**: Before emitting `safeoutputs___noop`, you MUST verify that ALL of the following checks are empty:
> 1. `european_parliament___get_adopted_texts_feed({ timeframe: "one-month" })` — adopted texts
> 2. `european_parliament___get_adopted_texts({ year: CURRENT_YEAR, limit: 5 })` — year-based fallback
> 3. The earlier health-gate `get_plenary_sessions({ limit: 1 })` result — plenary sessions; if that health-gate call succeeded and returned data, reuse that result here and do **NOT** call `get_plenary_sessions` again
> 4. `european_parliament___get_plenary_documents({ year: CURRENT_YEAR, limit: 5 })` — plenary documents
>
> If ANY of these checks return data, there IS parliamentary activity. Proceed with article generation using whatever data is available. **Noop is ONLY legitimate when the EP API is completely down (health gate fails) or genuinely zero parliamentary activity occurred in the review period.**

**If article generation fails AFTER starting work:**
1. Log the specific failure
2. ❌ **DO NOT use noop** — workflow should FAIL
3. Let error propagate so it's visible

**If PR creation fails AFTER generating articles:**
1. Retry `safeoutputs___create_pull_request` once
2. If still fails: ❌ workflow MUST FAIL — do NOT try alternative git commands or API calls
3. The articles exist but no PR = readers can't see them = FAILURE

## MANDATORY PR Creation

- ✅ `safeoutputs___create_pull_request` when articles generated
- ✅ `noop` ONLY if genuinely no parliamentary activity in the past month AND all 4 fallback checks in "NOOP PREVENTION" above returned empty
- ❌ NEVER use `noop` as fallback for PR creation failures
- ❌ NEVER use `noop` when `get_adopted_texts_feed` or `get_adopted_texts` returned data
- ❌ NEVER use `noop` because some feed endpoints timed out — use year-based fallbacks first

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

## EP MCP Tools for Monthly Review

### 🏥 RECOMMENDED: Server Health Check

**Call `get_server_health` before data gathering** to check which EP API feeds are currently operational.

```javascript
european_parliament___get_server_health({})
```

> **📊 ADAPTIVE STRATEGY**: If health shows `Degraded`/`Sparse`/`Unavailable`, widen initial timeframe for ALL feeds and focus on `get_all_generated_stats` for precomputed context.

### 🚨 MANDATORY: EP Feed Endpoints (PRIMARY News Source)

**These feed endpoints provide this month's actual news content. ALL must be called FIRST, before any other data tools:**

```javascript
// Adopted texts feed — always include for monthly review (one-month timeframe)
european_parliament___get_adopted_texts_feed({ timeframe: "one-month", limit: 50 })

// Procedures feed — legislative procedure updates this month
european_parliament___get_procedures_feed({ timeframe: "one-month", limit: 50 })

// Plenary documents feed — recently published plenary documents
european_parliament___get_plenary_documents_feed({ timeframe: "one-month", limit: 50 })

// Parliamentary questions feed — recent questions and interpellations
european_parliament___get_parliamentary_questions_feed({ timeframe: "one-month", limit: 20 })
```

> **⚠️ TIMEOUT FALLBACK STRATEGY**: Some EP feed endpoints (`get_procedures_feed`, `get_events_feed`) frequently time out even with 120s timeout because the upstream EP API is slow. When a feed endpoint times out or returns `"timedOut": true`:
> 1. **Do NOT retry the same feed** — it will time out again
> 2. **Use the corresponding year-based endpoint instead**:
>    ```javascript
>    // If get_procedures_feed times out:
>    european_parliament___get_procedures({ year: CURRENT_YEAR, limit: 20 })
>    // If get_events_feed times out:
>    european_parliament___get_events({ dateFrom: "YYYY-MM-01", dateTo: "YYYY-MM-DD", limit: 20 })
>    // If get_plenary_documents_feed times out:
>    european_parliament___get_plenary_documents({ year: CURRENT_YEAR, limit: 20 })
>    ```
> 3. **Year-based endpoints are faster** because they query a pre-indexed dataset rather than computing a time window; `get_events` uses `dateFrom`/`dateTo` (no `year` parameter) so pass the review period dates directly
> 4. **Filter results by date in your analysis** — year-based endpoints return the full year, so filter to the past 30 days when writing the article

> **⚠️ RELIABLE ENDPOINTS**: The following tools consistently return data and should ALWAYS be called:
> - `european_parliament___get_adopted_texts_feed({ timeframe: "one-month" })` — **most reliable feed**, rarely times out
> - `european_parliament___get_adopted_texts({ year: CURRENT_YEAR, limit: 20 })` — **always works** with year filter
> - `european_parliament___get_plenary_sessions({ year: CURRENT_YEAR, limit: 10 })` — **always works** with year filter

> **⚠️ ARTICLE CONTENT MUST COME FROM THESE FEEDS**: The article's lede, headlines, and primary sections must reference **specific adopted texts, voting results, or procedure updates** found in these feed results. If feeds return items, those items ARE the news.

### 📊 OPTIONAL: Background Context (Secondary — NEVER the news)

**Only fetch after feed endpoints have been called. Use ONLY for brief historical comparison paragraphs:**

```javascript
// Precomputed stats — background context ONLY, NEVER primary content
european_parliament___get_all_generated_stats({ category: "all", includePredictions: false, includeMonthlyBreakdown: false, includeRankings: false })
```

> **⚠️ CONTEXT ONLY — NEVER THE NEWS ITSELF**: Precomputed statistics provide historical background. They are **NEVER newsworthy on their own**.

### ⚡ MCP Call Budget

- **No hard limit on MCP calls**, but expect each call to take 30+ seconds. Plan time budget accordingly.
- **Feed endpoints (MANDATORY)**: call all feed endpoints listed above FIRST — these are non-negotiable
- **Precomputed stats**: call `european_parliament___get_all_generated_stats` once AFTER feeds — reuse across all sections
- **Health-gate connectivity check**: call `european_parliament___get_plenary_sessions({ limit: 1 })` at the start to verify MCP health (up to 3 attempts with 30-second delays); must **not** be repeated after it succeeds
- **Per-tool limit (no retries)**: each MCP tool may be called **at most once per workflow run** — never call the same tool a second time
- If data from a tool looks sparse, generic, historical, or placeholder after its first call, **proceed to article generation immediately — do NOT retry that tool**

**ALWAYS call `european_parliament___get_plenary_sessions` FIRST as the mandatory MCP Health Gate / warm-up and connectivity check (up to 3 attempts). Do not call it again after it succeeds.**

**MANDATORY supplementary tools** (ALWAYS call for comprehensive analysis — do NOT skip even if feed data is sparse for activity this month):

```javascript
const lastMonth = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];

// Select at most 3 from below:
european_parliament___get_voting_records({ dateFrom: lastMonth, dateTo: today, limit: 30 })
european_parliament___detect_voting_anomalies({ dateFrom: lastMonth, dateTo: today })
european_parliament___analyze_coalition_dynamics({ dateFrom: lastMonth, dateTo: today })
european_parliament___generate_political_landscape({})
```

> **⚠️ NOTE**: `get_voting_records` frequently returns empty for recent date ranges because the EP publishes roll-call voting data with a delay. If voting records are empty, this is NORMAL — proceed with adopted texts, procedures, and plenary session data. Do NOT treat empty voting records as evidence of "no parliamentary activity".


## 🌍 World Bank Economic Context — Active Indicator Discovery

**IMPORTANT**: Do NOT rely only on pre-mapped indicators. The World Bank has **thousands** of indicators. Use `search-indicators` to find the best match for the specific policy topic of this article.

### 📋 Indicator Discovery Process (MANDATORY when article has economic relevance)

**Step 1 — Determine if economic context adds value:**
Does this monthly review cover legislative outcomes with economic, social, environmental, defence, trade, or governance implications? If YES → proceed.

**Step 2 — Discover indicators on demand with `search-indicators`:**
```
// ALWAYS search first — the WB API has indicators not in our pre-mapped list
world_bank___search_indicators({ keyword: "<topic keyword from article>" })
// Examples: "inflation trends", "renewable energy share", "unemployment rate", "military spending", "research expenditure"
```

**Step 3 — Cross-reference the full catalog:**
Read `analysis/worldbank/indicator-catalog.md` for 200+ pre-evaluated indicators with EP committee relevance and priority rankings. Read `analysis/worldbank/use-cases.md` for when each indicator type adds editorial value.

**Step 4 — Fetch data within budget (max 3 WB data calls for monthly review; `search-indicators` is exempt — it's a discovery tool, not a data fetch):**
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

**Rules**: Max 3 World Bank calls per monthly review. Always note the data year. EU country codes: DE, FR, IT, ES, PL, NL, RO, BE, SE, AT. Aggregate: EUU.
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

```bash
TODAY=$(date -u +%Y-%m-%d)
EXISTING_PR=$(gh pr list --repo Hack23/euparliamentmonitor \
  --search "month-in-review $TODAY in:title" \
  --state open --limit 1 --json number --jq '.[0].number // ""' 2>/dev/null || echo "")

if [ -n "$EXISTING_PR" ] && [ "${EP_FORCE_GENERATION:-true}" != "true" ]; then
  echo "PR #$EXISTING_PR already exists for month-in-review on $TODAY. Skipping."
  safeoutputs___noop
  exit 0
fi

EXISTING_ARTICLE=$(find news/ -name "${TODAY}-month-in-review-en.html" 2>/dev/null | head -1)
if [ -n "$EXISTING_ARTICLE" ] && [ "${EP_FORCE_GENERATION:-true}" != "true" ]; then
  echo "Article already exists. Skipping."
  safeoutputs___noop
  exit 0
fi
```

### Step 1: Setup MCP Gateway & Generate Articles

> ⚠️ **CRITICAL — MCP env vars and the generation script MUST run in the same bash block.**
> Environment variables (`EP_MCP_GATEWAY_URL`, `USE_EP_MCP`) set via `export` in one bash block
> do NOT persist to the next block in agentic workflow execution. Keep setup and generation together.

```bash
# --- MCP Gateway Setup ---
MCP_CONFIG="${GH_AW_MCP_CONFIG:-/home/runner/.copilot/mcp-config.json}"

if [ -f "$MCP_CONFIG" ]; then
  echo "✅ MCP gateway config found at $MCP_CONFIG"
  if command -v jq >/dev/null 2>&1; then
    GATEWAY_PORT=$(jq -r '.gateway.port // empty' "$MCP_CONFIG")
    GATEWAY_DOMAIN=$(jq -r '.gateway.domain // empty' "$MCP_CONFIG")
    GATEWAY_API_KEY=$(jq -r '.gateway.apiKey // empty' "$MCP_CONFIG")
  else
    GATEWAY_PORT=$(cat "$MCP_CONFIG" | grep -o '"port":[^,}]*' | head -1 | grep -o '[0-9]*')
    GATEWAY_DOMAIN=$(cat "$MCP_CONFIG" | grep -o '"domain":"[^"]*"' | head -1 | sed 's/"domain":"//;s/"//')
    GATEWAY_API_KEY=$(cat "$MCP_CONFIG" | grep -o '"apiKey":"[^"]*"' | head -1 | sed 's/"apiKey":"//;s/"//')
  fi

  if [ -n "${GATEWAY_PORT:-}" ] && [ -n "${GATEWAY_DOMAIN:-}" ]; then
    case "$GATEWAY_DOMAIN" in
      localhost|127.0.0.1|::1|host.docker.internal)
        GATEWAY_SCHEME="http"
        ;;
      *)
        GATEWAY_SCHEME="https"
        ;;
    esac
    export EP_MCP_GATEWAY_URL="${GATEWAY_SCHEME}://${GATEWAY_DOMAIN}:${GATEWAY_PORT}/mcp/european-parliament"
    export EP_MCP_GATEWAY_API_KEY="${GATEWAY_API_KEY:-}"
    echo "✅ Gateway mode: EP_MCP_GATEWAY_URL=$EP_MCP_GATEWAY_URL"
  fi
else
  echo "ℹ️ No gateway config found, will use stdio mode"
fi

if [ -z "${EP_MCP_GATEWAY_URL:-}" ]; then
  if [ ! -f "node_modules/.bin/european-parliament-mcp-server" ]; then
    npm install --no-save european-parliament-mcp-server@1.2.4
  fi
fi

# --- Generate Articles ---
LANGUAGES_INPUT="${EP_LANG_INPUT:-}"
[ -z "$LANGUAGES_INPUT" ] && LANGUAGES_INPUT="all"

if ! printf '%s' "$LANGUAGES_INPUT" | grep -Eq '^(all|eu-core|nordic|en|sv|da|no|fi|de|fr|es|nl|ar|he|ja|ko|zh)(,(en|sv|da|no|fi|de|fr|es|nl|ar|he|ja|ko|zh))*$'; then
  echo "❌ Invalid languages input: $LANGUAGES_INPUT" >&2
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

export USE_EP_MCP=true

FEED_DATA_FLAG=""
if [ -f "/tmp/ep-feed-data.json" ]; then
  FEED_DATA_FLAG="--feed-data=/tmp/ep-feed-data.json"
fi

npx tsx src/generators/news-enhanced.ts \
  --types=month-in-review \
  --languages="$LANG_ARG" \
  --analysis \
  --run-id="$RUN_ID" \
  --title="$AI_TITLE" \
  --description="$AI_DESCRIPTION" \
  $FEED_DATA_FLAG \
  $SKIP_FLAG
```

> **⚠️ MANDATORY**: Before running the generator, you MUST set `AI_TITLE` and `AI_DESCRIPTION` shell variables with AI-analysed values based on the completed analysis results. Titles and descriptions are NEVER generated by code — the AI agent (Opus 4.6) analyses the content and decides what the headline and description should be.
>
> ```bash
> # Example — AI agent must write these AFTER completing all analysis:
> AI_TITLE="Parliament Advances Anti-Corruption Directive as ECR Dissents on Trade Response"
> AI_DESCRIPTION="European Parliament plenary session sees breakthrough on anti-corruption legislation while trade tariff divisions reveal shifting alliance dynamics"
> ```



**If the generator exits with a non-zero code, the workflow MUST FAIL. Do NOT attempt manual HTML generation as a fallback.**

### MANDATORY AI Enrichment — Replace Analysis Placeholders

> **⚠️ CRITICAL**: The TypeScript generator outputs `[AI_ANALYSIS_REQUIRED]` markers in the deep-analysis section. You MUST replace EVERY marker with substantive political analysis from EP MCP data. Write specific political intelligence — cite legislative outcomes, name key actors, explain policy consequences. Never use generic phrases like "limited legislative output reduces immediate legal framework impact" or "contributes to the bloc's institutional credibility." Every impact card needs ≥40 words of AI analysis. Validate that zero markers remain:
>
> ```bash
> FOUND_FILES=0
> for TARGET_FILE in news/${TODAY}-month-in-review-*.html; do
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
>   echo "ERROR: Expected article files missing: news/${TODAY}-month-in-review-*.html" >&2
>   exit 1
> fi
> ```

### Step 3: Validate & Verify Analysis Quality

**CRITICAL: Each article MUST contain real analysis, not just vote totals.**
Every generated article must include:
- **Month in Numbers**: Key legislative statistics
- **Legislative Output**: Major legislation enacted or debated
- **Coalition Dynamics**: Cross-party cooperation, voting discipline trends
- **Committee Highlights**: Most significant committee reports and recommendations
- **Policy Trends**: Emerging patterns in EU policy priorities
- **Month's Most Consequential**: Deep analysis of the defining development
- **Looking Ahead**: Preview of next month's parliamentary calendar

**HTML Structure Validation:**
```bash
ARTICLE_TYPE="month-in-review"
TODAY=$(date +%Y-%m-%d)
MISSING_SWITCHER=$(grep -rL 'class="language-switcher"' news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null | wc -l || echo 0)
MISSING_TOPNAV=$(grep -rL 'class="article-top-nav"' news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null | wc -l || echo 0)
MISSING_HEADER=$(grep -rL 'class="site-header"' news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null | wc -l || echo 0)
if [ "$MISSING_SWITCHER" -gt 0 ] || [ "$MISSING_TOPNAV" -gt 0 ] || [ "$MISSING_HEADER" -gt 0 ]; then
  echo "ERROR: $MISSING_SWITCHER articles missing language-switcher, $MISSING_TOPNAV missing article-top-nav, $MISSING_HEADER missing site-header" >&2
  echo "This indicates a template bug — articles should be generated correctly by generateArticleHTML." >&2
  echo "FALLBACK: Run npx tsx src/utils/fix-articles.ts to patch, but investigate the root cause." >&2
  exit 1
fi
```


## ✅ ANALYSIS QUALITY GATES (ENHANCED)

> **⚠️ MANDATORY**: Per `ai-driven-analysis-guide.md` Rules 6–8, all quality gates below must pass before PR creation. Article type: `month-in-review`.

### Content Quality (existing gates — maintained)
- ✅ Min 500 words analytical content
- ✅ No synthetic IDs or placeholder data (VOTE-2024-001, DOC-2024-001 are FORBIDDEN)
- ✅ Current dates with specific EP references
- ✅ Feed-first content with dated event references
- ✅ **No placeholder text in meta keywords** — "Example motion (placeholder)", "data unavailable" are FORBIDDEN in `<meta name="keywords">`
- ✅ **No silent zero metrics** — if pipeline/dashboard shows 0%, explain why (e.g., "Easter recess: no votes scheduled")

### Article Type Identification (Rule 6 — required)
- ✅ **manifest.json** includes `"articleType": "month-in-review"`
- ✅ **Analysis markdown** files include `articleType: month-in-review` in YAML frontmatter
- ✅ **Article HTML** includes `<meta name="article-type" content="month-in-review">`
- ✅ **Analysis directory** is scoped to `${ANALYSIS_DIR}/`

### Minimum AI Analysis Time (Rule 7 — required)
- ✅ **≥25 minutes** spent on dedicated deep political intelligence analysis phase (reading ALL 6 methodology guides, querying MCP, applying templates to every data file, writing original analytical prose) — monthly review requires the most analysis time
- ✅ **Article topic/angle decided ONLY AFTER analysis phase completes** — significance scoring results determine coverage
- ✅ **4-pass refinement cycle** completed for all analytical content sections
- ✅ **All 6 methodology documents** read before any analysis
- ✅ **No article content written before analysis phase** — analysis-first, article-second

### Script/AI Separation (Rule 8 — required)
- ✅ **No `[AI_ANALYSIS_REQUIRED]` placeholders** remain in final HTML
- ✅ **No empty SWOT entries** (every quadrant has ≥2 substantive entries with evidence)
- ✅ **Every stakeholder outcome** has AI-written rationale (not just Winner/Loser labels)
- ✅ **Confidence levels** stated on all non-factual analytical claims
- ✅ **Every impact card** (Political, Economic, Social, Legal, Geopolitical) has ≥40 words of AI analysis
- ✅ **Every stakeholder perspective panel** has ≥2 sentences of analytical text (not empty)

### Visualization Completeness (v4.0 — required)
- ✅ **SWOT**: All 4 quadrants populated with ≥2 items each, severity badges on every item
- ✅ **Dashboard charts**: Canvas elements have real data in `data-chart-config` (not `[0,0,0]`)
- ✅ **Stakeholder panels**: Each panel has analytical text explaining the stakeholder's position
- ✅ **Analysis transparency links**: All linked `.md` files in the analysis directory contain substantive content (≥200 words)

### Analysis Depth (gates — required)
- ✅ **Stakeholder coverage**: Min 3 perspectives analyzed per key development
- ✅ **SWOT dimensions**: Must include both political AND economic/regulatory dimensions
- ✅ **Dashboard trends**: Must include trend indicators (↑↓→) not just current values
- ✅ **Evidence chains**: Deep analysis must cite specific document IDs, vote counts, or MCP data
- ✅ **Outlook scenarios**: Must provide at least 2 named scenarios with probability labels
- ✅ **Sources section**: Must cite ≥3 specific EP data sources (document IDs, MCP tools, procedure references)

### Political Intelligence (gates — required)
- ✅ **Coalition dynamics**: Identify voting alliances for key items (not just "EPP and S&D voted together")
- ✅ **Group positions explained**: State WHY each group holds its position (incentives, ideology, constituency)
- ✅ **Winner/loser analysis**: Identify who gains/loses from each outcome WITH evidence
- ✅ **Historical context**: Reference comparable past EP actions where relevant
- ✅ **Multi-framework analysis**: At least 2 analytical frameworks applied (e.g., SWOT + Risk, or Attack Tree + Kill Chain)

### Step 4: Create PR (ONE call — ALL files at once)

> **🚨 ATOMIC PR CREATION**: Generate ALL language files FIRST, then call `safeoutputs___create_pull_request` exactly **ONCE**. The framework captures all working directory changes as a single patch. Do NOT call it multiple times for individual files.

#### MANDATORY File Count Validation

```bash
# Reuse $TODAY from Date Context Establishment — do NOT recompute to avoid midnight drift
ARTICLE_TYPE="month-in-review"

# Determine expected languages from LANG_ARG (set during generation)
if [ "$LANG_ARG" = "en" ]; then
  EXPECTED_LANGS="en"
  EXPECTED_COUNT=1
else
  EXPECTED_LANGS="$LANG_ARG"
  EXPECTED_COUNT=$(echo "$LANG_ARG" | tr ',' '\n' | wc -l)
fi

ACTUAL_COUNT=$(ls news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null | wc -l)
echo "📊 File count: $ACTUAL_COUNT / $EXPECTED_COUNT expected"
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

> **⚠️ Do NOT commit generated files**: `sitemap.xml`, `sitemap*.html`, `rss.xml`, `index.html`, `index-*.html`, `news/articles-metadata.json`, and `news/metadata/generation-*.json` are generated at deploy time or by other processes. Only commit article HTML files: `news/{YYYY-MM-DD}-month-in-review-{lang}.html`
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
echo "🧹 Cleaned raw MCP data payloads for ${TODAY}/month-in-review; analysis markdown artifacts PRESERVED for commit"
```

```bash
# Reuse $TODAY from Date Context Establishment
BRANCH_NAME="news/month-in-review-$TODAY"
```

```javascript
// All file changes in the working directory are captured automatically
safeoutputs___create_pull_request({
  title: `chore: EU Parliament month-in-review articles ${TODAY}`,
  body: `## 📊 EU Parliament Monthly Review — ${TODAY}\n\n### Summary\nGenerated month-in-review comprehensive analysis articles covering the past 30 days of European Parliament activity.\n\n### Content Details\n- **Article type**: Monthly review / retrospective analysis\n- **Languages**: ${LANG_ARG}\n- **Review period**: Past 30 days\n- **Data source**: European Parliament MCP Server + World Bank economic data\n\n### Coverage Areas\n- Legislative output statistics (votes, adopted texts, resolutions)\n- Coalition dynamics and voting discipline trends\n- Committee productivity and key reports\n- Political group performance comparison\n- Economic context and policy impact assessment\n\n### Analysis Artifacts\n- Monthly review analysis in \`analysis/${TODAY}/monthly-review/\`\n- Comprehensive political intelligence assessment\n\n---\n> Generated by the \`news-monthly-review\` agentic workflow using European Parliament Open Data.`,
  base: "main",
  head: BRANCH_NAME
})
```

## Article Content Structure

Monthly review articles should include:
1. **Month in Numbers**: Key legislative statistics (votes held, documents adopted, questions filed)
2. **Legislative Output**: Major legislation enacted or debated
3. **Coalition Dynamics**: Voting discipline, cross-party alliances, defection rates
4. **Committee Highlights**: Most significant committee reports and recommendations
5. **Opposition Activity**: Key motions, parliamentary questions, government scrutiny
6. **Policy Trends**: Emerging patterns in EU policy priorities
7. **Month's Most Consequential**: Deep analysis of the month's defining development
8. **Looking Ahead**: Preview of next month's parliamentary calendar

### Available Visualization Sections

The generator pipeline supports rich data-driven visualizations. These are produced automatically when the article strategy populates the corresponding data fields:

| Section | Generator | What it shows |
|---------|-----------|---------------|
| **SWOT Analysis** | `buildSwotSection()` | Strengths / Weaknesses / Opportunities / Threats grid |
| **Dashboard** | `buildDashboardSection()` | Metric cards, bar/line charts with data tables |
| **Deep Analysis** | `buildDeepAnalysisSection()` | Free-form analytical narrative |

The **SWOT** section is ideal for monthly reviews to assess political strengths and risks. The **Dashboard** section visualises legislative output metrics and committee activity.

## Translation Notes

> **📝 Translation is handled by the separate `news-translate` workflow.** This workflow focuses exclusively on generating excellent English monthly review content with deep political intelligence.

- Political group abbreviations MUST NEVER be translated
- Committee abbreviations kept as-is
- MEP names are NEVER translated
- EP document reference IDs are NEVER translated
- ZERO TOLERANCE for language mixing

### Pre-Localized Strings (handled by code)

Section headings and editorial strings are localized via `EDITORIAL_STRINGS` and `MONTHLY_REVIEW_TITLES` for all 14 languages. The `lang` parameter must be passed to content generators.

## Article Naming Convention
Files: `YYYY-MM-DD-month-in-review-{lang}.html`
