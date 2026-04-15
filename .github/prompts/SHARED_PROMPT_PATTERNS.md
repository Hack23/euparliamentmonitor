<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📋 Shared Prompt Patterns for EU Parliament Monitor Agentic Workflows

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-04-12 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-06-30
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

This document defines **shared prompt patterns, rules, and tool references** used by all 10 EU Parliament Monitor agentic workflows. Individual workflow `.md` files reference this document to avoid duplication and ensure consistency.

**Authoritative references:**
- **Analysis protocol:** `analysis/methodologies/ai-driven-analysis-guide.md` (Rules 1–12)
- **Analysis templates:** `analysis/templates/` (8 structured templates)
- **Methodology guides:** `analysis/methodologies/` (6 framework documents)
- **gh-aw documentation:** https://github.github.com/gh-aw/

---

## 🚫 Scope Restrictions & Allowed Modifications

### Primary Output Directories

All news generation workflows write ONLY to these directories (with one narrow exception for minor `src/`/`scripts/` fixes — see [Conditional Allow](#minor-typescriptscript-corrections-conditional-allow) below):

| Directory | Purpose | All Workflows |
|-----------|---------|:-------------:|
| `news/` | Article HTML files | ✅ Create/modify |
| `analysis/daily/` | Analysis artifacts (.md, manifest.json) | ✅ Create/modify |
| `/tmp/gh-aw/repo-memory/default/memory/news-generation/` | Cross-run editorial memory | ✅ Create/modify |

### FORBIDDEN Modifications (All Workflows)

These restrictions prevent patch conflicts and workflow failures:

| Path | Rule | Rationale |
|------|------|-----------|
| `.github/` | ❌ NEVER modify | Workflow configuration files |
| `index*.html` | ❌ NEVER modify | Index pages (generated separately) |
| `package.json` / `package-lock.json` | ❌ NEVER modify | Dependency files |
| `test/` | ❌ NEVER modify | Unit test files |
| `e2e/` | ❌ NEVER modify | End-to-end test files |

### Minor TypeScript/Script Corrections (CONDITIONAL ALLOW)

> **Policy change (v1.0, 2026-04-12):** Agentic workflows MAY make **minor, targeted corrections** to `src/` and `scripts/` files **only when the correction is necessary to complete the workflow's primary mission** (news generation or translation). This replaces the previous blanket ban.

**ALLOWED minor corrections:**
- ✅ Fix a TypeScript compilation error that blocks `npm run build` (e.g., missing import, type mismatch)
- ✅ Fix a runtime error in a generator script that prevents article generation
- ✅ Add a missing constant or enum value that causes the pipeline to fail
- ✅ Correct a data mapping error (e.g., wrong language code, incorrect URL pattern)

**STILL FORBIDDEN:**
- ❌ Refactoring or restructuring code beyond the minimum fix
- ❌ Adding new features, functions, or files to `src/`
- ❌ Modifying test files or test expectations
- ❌ Changing package.json dependencies
- ❌ Writing custom Python/Ruby/Perl scripts — use ONLY the Node.js/TypeScript toolchain
- ❌ Creating new standalone helper scripts (`.js`, `.py`, `.sh`)

**Constraints on minor corrections:**
1. **Maximum 20 lines changed** across all `src/` and `scripts/` files combined
2. **Must include a comment** explaining why the fix is needed: `// Fix: [description] — gh-aw workflow correction`
3. **Must not break existing tests** — if the fix would require test changes, skip it and log the error
4. **Must run `npm run build`** after the correction to verify it compiles
5. **AI analysis and content creation MUST still use AI prompts** — script corrections are ONLY for infrastructure/toolchain fixes

### FORBIDDEN Practices (All Workflows)

| Practice | Why Forbidden |
|----------|--------------|
| Writing custom Python/Ruby/Perl scripts | Use ONLY the Node.js/TypeScript toolchain |
| Dangerous shell expansion (`${var@P}`, `${!var}`, `eval`, nested `$($(..))`, `${var:+...${#other}...}`) | Blocked by sandbox security — use `if/else` blocks instead |
| Input redirection inside command substitution (`$(cmd < file)`) | Blocked by sandbox — use `cmd file` or pipe with `cat file` instead |
| Ad-hoc data processing scripts | Use existing `scripts/generate-news-enhanced.js` pipeline |
| Metadata-only analysis | MUST download and store COMPLETE EP documents — use `track_legislation`, `get_voting_records`, `get_meeting_decisions`, `get_speeches` to get full content beyond titles and TA numbers |
| Workarounds for existing tools | Log errors and continue; do not reimplement |
| Deciding article topic before analysis is complete | Finish ALL analysis first, then decide based on significance scoring |
| `safeoutputs___noop` when analysis artifacts exist | Create analysis-only PR instead (Rule 5) |

---

## 🧠 Memory & Reasoning Tools

### Repo Memory — Cross-Run Editorial Context

Persistent repo memory at `/tmp/gh-aw/repo-memory/default/` maintains editorial context across runs.

**At workflow START:**
```bash
cat /tmp/gh-aw/repo-memory/default/memory/news-generation/article-log.json 2>/dev/null || echo '[]'
cat /tmp/gh-aw/repo-memory/default/memory/news-generation/editorial-context.md 2>/dev/null || echo 'No prior context'
```

**At workflow END** — update (max 50KB per file):
1. **`article-log.json`** — Append today's generated article metadata. Keep last 30 entries.
2. **`editorial-context.md`** — Brief summary of key findings, ongoing stories, topics covered.

**Use repo memory to:**
- Avoid duplicate articles on the same topic
- Reference prior coverage for continuity
- Track ongoing legislative stories across runs
- Skip EP documents already covered in recent articles

> ⚠️ Repo memory is best-effort. Proceed normally if files are missing.

### Memory MCP — In-Run Knowledge Graph

The `memory` MCP server provides a session-scoped knowledge graph for cross-document intelligence within a single run.

**Tools:**
| Tool | Purpose |
|------|---------|
| `create_entities` | Store entities (MEPs, committees, legislative files, political groups) |
| `create_relations` | Link entities (e.g., "MEP-123 rapporteur-of PROC-2026/0042") |
| `search_nodes` / `open_nodes` | Query the graph for connections |

### Sequential Thinking — Structured Reasoning

The `sequential-thinking` MCP server enables step-by-step analytical reasoning.

**When to use:**
- SWOT analysis of legislative impact
- Multi-factor risk assessment
- Coalition dynamics analysis
- Weighing contradictory evidence
- Evaluating news significance against historical context

**How to use:**
Call `sequentialthinking` with structured thought chains — each step builds on the previous, allowing revision and branching.

---

## 🔗 European Parliament MCP Server Tools Reference

**Server:** `european-parliament-mcp-server@1.2.6`

### Feed Endpoints (Primary Data Source)

These endpoints use the `timeframe` parameter with supported values: `"today"`, `"one-day"`, `"one-week"`, `"one-month"`, `"three-months"`, and `"one-year"`. Where supported, `startDate` can be provided as an override alongside `timeframe`; it is not a separate `"custom"` timeframe mode.

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `get_adopted_texts_feed` | Recently adopted legislative texts | `timeframe`, `workType` |
| `get_events_feed` | Recent EP events | `timeframe`, `activityType` |
| `get_procedures_feed` | Recently updated procedures | `timeframe`, `processType` |
| `get_meps_feed` | Recently updated MEP profiles | `timeframe` |
| `get_documents_feed` | Recently updated documents | `timeframe` |
| `get_plenary_documents_feed` | Recent plenary documents | `timeframe` |
| `get_committee_documents_feed` | Recent committee documents | `timeframe` |
| `get_parliamentary_questions_feed` | Recent parliamentary questions | `timeframe` |
| `get_plenary_session_documents_feed` | Recent plenary session documents | `timeframe` |
| `get_external_documents_feed` | Non-EP documents (Commission, Council) | `timeframe` |
| `get_corporate_bodies_feed` | Committee/delegation updates | `timeframe` |
| `get_mep_declarations_feed` | MEP financial declarations | `timeframe` |

### Direct Lookup Endpoints (CRITICAL FALLBACKS)

> **⚠️ DEGRADED MODE FALLBACK STRATEGY**: When feed endpoints return 404 or timeout, these direct endpoints are your primary data source. They query the underlying EP database directly and are typically MORE reliable than feeds. **ALWAYS use these as fallback — do not skip data collection because feeds are down.**

| Tool | Purpose | Key Parameters | Feed Fallback For |
|------|---------|----------------|-------------------|
| `get_plenary_sessions` | Plenary sessions | `dateFrom`/`dateTo`, `location`, `limit` (⚠️ NO `year` param) | `get_events_feed` |
| `get_events` | EP events | `dateFrom`/`dateTo`, `limit` (⚠️ NO `year` param) | `get_events_feed` |
| `get_procedures` | Legislative procedures | `year`, `limit` | `get_procedures_feed` |
| `get_adopted_texts` | Adopted texts | `year`, `limit` | `get_adopted_texts_feed` |
| `get_plenary_documents` | Plenary documents | `year`, `limit` | `get_plenary_documents_feed` |
| `get_committee_documents` | Committee documents | `year`, `limit` | `get_committee_documents_feed` |
| `get_speeches` | Plenary speeches | `dateFrom`/`dateTo`, `limit` | *(no feed equivalent)* |
| `get_parliamentary_questions` | Parliamentary questions | `type`, `startDate`, `limit` | `get_parliamentary_questions_feed` |
| `get_mep_details` | Specific MEP info | `id` (e.g., "MEP-124810") | — |
| `get_mep_declarations` | MEP financial declarations | `year`, `docId` | `get_mep_declarations_feed` |
| `get_committee_info` | Committee details | `committeeId` or `abbreviation` (e.g., "ENVI") | — |
| `search_documents` | Search EP documents | `keyword`, `documentType`, `committee`, `dateFrom`/`dateTo` | — |
| `track_legislation` | Legislative procedure progress | `procedureId` (e.g., "2024/0001(COD)") | — |
| `get_procedure_events` | Events for a procedure | `processId` | — |
| `get_meeting_decisions` | Plenary sitting decisions | `sittingId` | — |
| `get_meeting_activities` | Plenary sitting activities | `sittingId` | — |

### 🔴 MANDATORY Deep Data Collection (All Workflows)

> **Anti-Pattern**: Fetching only metadata (titles, TA numbers, procedure IDs) without downloading full document content, voting records, or meeting decisions. This produces shallow analysis that asserts political positions without evidence.

**Every workflow MUST attempt these deep data collection steps:**

1. **Full document content**: Use `search_documents` with `keyword` to find documents by topic. Use `get_adopted_texts({ year: YYYY, limit: 100 })` to get full adopted text details, not just titles.

2. **Voting records for specific sessions**: Use `get_voting_records({ sessionId: "...", limit: 50 })` for EACH plenary session discussed in analysis. This provides actual vote counts (for/against/abstain) to support coalition claims.

3. **Meeting decisions for plenary sittings**: Use `get_meeting_decisions({ sittingId: "..." })` for recent plenary sittings to get adopted decisions and voting outcomes.

4. **Procedure details for cited legislation**: Use `track_legislation({ procedureId: "YYYY/NNNN(COD)" })` for EACH procedure referenced in analysis to get current status, timeline, and committee assignments.

5. **Speeches from key debates**: Use `get_speeches({ dateFrom: "...", dateTo: "...", limit: 20 })` to get actual debate contributions for color and direct quotes.

6. **Committee activity**: Use `get_committee_documents({ year: YYYY, limit: 50 })` when committee document feeds fail to still get committee output.

**Data Verification Checklist** (include in every manifest.json):
```json
{
  "dataVerification": {
    "adoptedTextsDownloaded": true,
    "votingRecordsFetched": false,
    "meetingDecisionsFetched": false,
    "procedureDetailsTracked": ["2025/0261(COD)", "2023/0115(COD)"],
    "speechesFetched": false,
    "committeeDocumentsFetched": false,
    "reason": "Feeds returned 404; direct endpoints used as fallback"
  }
}
```

### 🔄 Feed → Direct Endpoint Fallback Chain

When a feed endpoint fails (404/timeout/error), IMMEDIATELY try the corresponding direct endpoint:

| Failed Feed | Direct Fallback | Fallback Parameters |
|------------|----------------|---------------------|
| `get_events_feed` (404) | `get_events({ dateFrom: "YYYY-MM-DD", dateTo: "YYYY-MM-DD", limit: 50 })` | Use last 7 days |
| `get_procedures_feed` (404) | `get_procedures({ year: YYYY, limit: 50 })` | Current year |
| `get_committee_documents_feed` (timeout) | `get_committee_documents({ year: YYYY, limit: 50 })` | Current year |
| `get_plenary_documents_feed` (timeout) | `get_plenary_documents({ year: YYYY, limit: 50 })` | Current year |
| `get_parliamentary_questions_feed` (timeout) | `get_parliamentary_questions({ type: "WRITTEN", limit: 20 })` | Recent questions |
| `get_adopted_texts_feed` (error) | `get_adopted_texts({ year: YYYY, limit: 100 })` | Current year |

> **⚠️ DO NOT SKIP DATA COLLECTION**: A feed returning 404 does NOT mean the data is unavailable. The underlying EP API often works fine — only the feed aggregation layer is degraded. ALWAYS try direct endpoints before concluding data is unavailable.

### Cross-Run Data Consistency

> **⚠️ SEAT COUNT NORMALIZATION**: When citing political group seat counts, use the SAME data source within a single analysis run. Get seat counts from `analyze_coalition_dynamics` OR from `get_meps_feed` — do NOT mix sources. Record the source in the analysis metadata. Inconsistent seat counts across same-day runs (e.g., EPP=185 vs EPP=188) undermine analytical credibility.

### Analytical Tools (AI-Powered Analysis)

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `get_voting_records` | Aggregate plenary votes | `sessionId`, `mepId`, `limit` |
| `analyze_voting_patterns` | MEP voting behavior | `mepId`, `dateFrom`/`dateTo`, `compareWithGroup` |
| `analyze_coalition_dynamics` | Political group alliances | `politicalGroups`, `dateFrom`/`dateTo` |
| `detect_voting_anomalies` | Unusual voting patterns | `politicalGroup`, `mepId`, `dateFrom` |
| `compare_political_groups` | Multi-dimension comparison | `groups` (min 2), `metrics`, `dateFrom` |
| `assess_mep_influence` | MEP influence scoring | `mepId`, `includeDetails`, `dateFrom`/`dateTo` |
| `analyze_legislative_effectiveness` | MEP/committee productivity | `subjectType` ("MEP"/"COMMITTEE"), `subjectId` |
| `generate_political_landscape` | Full political overview | `dateFrom`/`dateTo` |
| `early_warning_system` | Emerging shifts detection | `sensitivity`, `focusArea` |
| `get_all_generated_stats` | Precomputed statistics (2004-2026) | `category`, `yearFrom`/`yearTo` |

### Specialized Tools

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `analyze_country_delegation` | Country delegation analysis | `country` (ISO 3166-1 alpha-2) |
| `track_mep_attendance` | Attendance patterns | `mepId`, `country`, `groupId` |
| `analyze_committee_activity` | Committee workload | `committeeId` |
| `monitor_legislative_pipeline` | Pipeline bottleneck detection | `committee`, `status` |
| `network_analysis` | MEP relationship mapping | `mepId`, `analysisType` |
| `correlate_intelligence` | Cross-tool OSINT | `mepIds[]`, `groups[]`, `sensitivityLevel` |
| `sentiment_tracker` | Group positioning scores | `groupId`, `timeframe` |
| `comparative_intelligence` | Cross-MEP comparison | `mepIds[]` (2-10), `dimensions[]` |

### ⚠️ Common Parameter Mistakes

| ❌ Wrong | ✅ Correct | Notes |
|----------|-----------|-------|
| `get_plenary_sessions({ year: 2026 })` | `get_plenary_sessions({ dateFrom: "2026-01-01", dateTo: "2026-12-31" })` | No `year` param on plenary sessions |
| `get_events({ year: 2026 })` | `get_events({ dateFrom: "2026-01-01", dateTo: "2026-12-31" })` | No `year` param on events |
| `get_adopted_texts_feed({ startDate: "2026-04-01" })` | `get_adopted_texts_feed({ timeframe: "one-week" })` | Feed endpoints use `timeframe`; `startDate` is an optional override, not a standalone param |
| `get_voting_records({ topic: "climate" })` | `get_voting_records({ sessionId: "...", limit: 50 })` | No `topic`/`dateFrom`/`dateTo` — use `sessionId`, `mepId`, `limit` |
| `get_mep_details({ name: "Weber" })` | `get_mep_details({ id: "MEP-124810" })` | Must use MEP ID, not name |

### World Bank MCP Tools (Economic Context Enrichment)

**Server:** `worldbank-mcp@1.0.1`

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `get-economic-data` | GDP, inflation, trade indicators | `countryCode`, `indicator`, `years` |
| `get-social-data` | Population, life expectancy | `countryCode`, `indicator`, `years` |
| `get-country-info` | Country profile | `countryCode` |

**When to use:** Month-ahead and month-in-review articles for EU economic context. NOT used for daily/breaking news.

---

## 📐 Analysis-First Pipeline (Mandatory for All News Workflows)

All news generation workflows follow this mandatory pipeline defined in `ai-driven-analysis-guide.md`:

### Pipeline Steps

```
1. DOWNLOAD → 2. DEEP-FETCH → 3. ANALYZE → 4. EVALUATE → 5. GENERATE → 6. PR
```

| Step | Action | Minimum Time | Reference |
|------|--------|:------------:|-----------|
| 1. **Download** | Fetch EP feed data via MCP tools; if feeds fail, use direct endpoint fallbacks | — | Feed endpoints + Direct Lookup fallbacks above |
| 2. **Deep-Fetch** | For every adopted text/procedure cited: fetch `track_legislation`, `get_voting_records`, `get_meeting_decisions`, `get_speeches` | — | Mandatory Deep Data Collection section above |
| 3. **Analyze** | AI reads ALL 6 methodology docs + 8 templates, applies to every data file | 15-25 min | `ai-driven-analysis-guide.md` Rules 2-4, 7 |
| 4. **Evaluate** | AI evaluates analysis artifacts for newsworthiness | — | `ai-driven-analysis-guide.md` Rule 5 |
| 5. **Generate** | Generate article with AI-driven title/description | — | `ai-driven-analysis-guide.md` Rules 8-9, 12 |
| 6. **PR** | Create PR with articles AND analysis artifacts | — | `ai-driven-analysis-guide.md` Rule 5 |

### Minimum AI Analysis Time per Workflow

| Workflow | Minimum Time | Article Type Slug |
|----------|:------------:|-------------------|
| Breaking news | 15 min | `breaking` |
| Committee reports | 15 min | `committee-reports` |
| Propositions | 15 min | `propositions` |
| Motions | 15 min | `motions` |
| Week ahead | 15 min | `week-ahead` |
| Month ahead | 15 min | `month-ahead` |
| Week in review | 20 min | `week-in-review` |
| Month in review | 25 min | `month-in-review` |

### Mandatory Analysis Methods

Every workflow MUST read and apply:

**Methodology guides** (`analysis/methodologies/`):
1. `ai-driven-analysis-guide.md` — Master protocol (Rules 1-12)
2. `political-classification-guide.md` — 7-dimension classification
3. `political-risk-methodology.md` — 5×5 Likelihood × Impact matrix
4. `political-threat-framework.md` — Multi-framework threat analysis
5. `political-swot-framework.md` — Evidence-based SWOT
6. `political-style-guide.md` — Writing standards

**Structured templates** (`analysis/templates/`):
1. `per-file-political-intelligence.md` — Per-document wrapper (MOST USED)
2. `political-classification.md` — 7-dimension classification output
3. `risk-assessment.md` — Risk register + heat map
4. `threat-analysis.md` — 6-dimension threat assessment
5. `swot-analysis.md` — 4-quadrant strategic assessment
6. `stakeholder-impact.md` — 6-lens stakeholder analysis
7. `significance-scoring.md` — Composite publication priority score
8. `synthesis-summary.md` — Cross-document intelligence synthesis

### Analysis Directory Structure

Per `ai-driven-analysis-guide.md` Rule 1:
```
analysis/daily/{YYYY-MM-DD}/{article-type-slug}/
├── classification/
│   ├── significance-classification.md
│   ├── actor-mapping.md
│   ├── forces-analysis.md
│   └── impact-matrix.md
├── threat-assessment/
│   ├── political-threat-landscape.md
│   ├── actor-threat-profiling.md
│   ├── consequence-trees.md
│   └── legislative-disruption.md
├── risk-scoring/
│   ├── risk-matrix.md
│   ├── quantitative-swot.md
│   ├── political-capital-risk.md
│   ├── legislative-velocity-risk.md
│   └── agent-risk-workflow.md
├── existing/
│   ├── deep-analysis.md
│   ├── stakeholder-impact.md
│   ├── coalition-dynamics.md
│   ├── voting-patterns.md
│   ├── cross-session-intelligence.md
│   └── synthesis-summary.md
├── documents/
│   └── document-analysis-index.md
├── data/          # Raw MCP data (may be excluded from PR)
└── manifest.json
```

### AI-Driven Headlines (Rule 9)

**ABSOLUTE PROHIBITION:** Titles and descriptions MUST NEVER be code-generated.

The AI agent MUST:
1. Complete ALL analysis methods first
2. Read the completed analysis artifacts
3. Identify the most politically significant finding
4. Write headline (max 70 chars, active voice, names actors)
5. Write description (150-160 chars, political significance)
6. Pass via `--title="..."` and `--description="..."` CLI flags

### Analysis-Only PR Rule (Rule 5)

Every workflow run MUST produce output:
- **Article generated:** Include analysis artifacts in PR alongside `news/` files
- **No article (quiet period):** Create analysis-only PR with `safeoutputs___create_pull_request`
- **`safeoutputs___noop`:** ONLY when MCP server is completely unavailable and zero data collected — MUST include full diagnostics (see [Mandatory Noop Diagnostics](#mandatory-noop-diagnostics-all-workflows))

---

## 📋 Article Quality Gates (Mandatory for All Workflows)

All generated articles MUST pass these quality gates before publication. These rules prevent recurring quality issues observed in production runs.

### Keywords Quality Rules

Article `<meta name="keywords">` MUST contain **only policy-relevant terms**:

| ✅ Good Keywords | ❌ Banned Keywords |
|---|---|
| Policy terms: `anti-corruption directive`, `banking reform` | Section headings: `Deep Political Analysis`, `What Happened` |
| Committee names: `ECON`, `LIBE`, `ENVI` | Navigation labels: `Key Actors`, `Timeline`, `Why It Matters` |
| Document IDs: `TA-10-2026-0090`, `2025/0042(COD)` | Template artifacts: `Legislative Pipeline Overview`, `Impact Assessment` |
| Political groups: `EPP`, `S&D`, `ECR`, `Renew` | Generic fillers: `European Parliament`, `EU legislation` |
| Specific topics: `tariff response`, `digital markets` | Internal headings: `Actions → Consequences`, `Stakeholder Impact` |

**Rule:** If a keyword matches a section heading from the article template, it MUST be removed.

### Title Quality Rules

Article `<title>` and `<h1>` MUST be:
- ✅ **AI-generated from political content analysis** — names specific actors, legislation, outcomes
- ✅ **Active voice, max 70 characters** — reads like a newspaper headline
- ❌ **NEVER** contain raw metrics: `Pipeline 0%`, `Health Score 45`, `Fragmentation 6.59`
- ❌ **NEVER** contain article type labels: `Weekly Review:`, `Committee Reports:`, `Propositions:`
- ❌ **NEVER** use date-centric format: `EU Parliament Monitor — 2026-04-15`

**Good examples:**
- `ECR Breaks Ranks on Tariff Response as Grand Coalition Holds on Banking Reform`
- `Parliament Adopts Anti-Corruption Directive Despite PfE Opposition`

**Bad examples:**
- `Legislative Procedures: European Parliament Monitor — Pipeline 0%`
- `Weekly Review: European Parliament Activity 2026-04-15`

### Description Quality Rules

Article `<meta name="description">` MUST be:
- ✅ **150-160 characters**, names the most significant item + outcome + coalition dynamics
- ❌ **NEVER** use boilerplate: `Comprehensive analysis of European Parliament legislative activity`
- ❌ **NEVER** repeat the title verbatim
- ❌ **NEVER** contain placeholder text: `data unavailable`, `analysis pending`

### Minimum Publication Threshold

**Do NOT publish an article when:**
- ALL feed endpoints returned empty/error AND no adopted texts exist for the time period
- Analysis contains ONLY precomputed stats with zero feed-sourced data points
- Article body would consist entirely of historical context paragraphs with no news

**Instead:** Create an analysis-only PR per Rule 5 — analysis artifacts are still valuable.

### Dashboard & Metric Rendering Rules

When `monitor_legislative_pipeline` returns `health: 0%` and `throughput: 0`:
- This means **NO DATA was available** — NOT that the pipeline scored 0%
- ❌ **NEVER** render a dashboard showing `0%` health, `0` throughput as real metrics
- ✅ **Instead:** Omit the pipeline dashboard entirely, or show "Data unavailable for this period"
- ✅ **Alternative:** Use `get_procedures(year=YYYY)` as fallback to get actual pipeline data

**General rule:** Any metric that equals exactly 0 from an analytical tool should be verified against feed data before rendering. Zero often means "no data returned" not "zero activity".

---

## 🔄 4-Pass AI Refinement Cycle (All Workflows)

| Pass | Action |
|------|--------|
| **1. Initial Assessment** | Gather baseline data, identify key actors/actions/outcomes |
| **2. Stakeholder Challenge** | Re-examine from each stakeholder perspective, find blind spots |
| **3. Evidence Cross-Validation** | Cross-check claims against EP data, add confidence indicators (🟢/🟡/🔴) |
| **4. Synthesis & Scenarios** | Multi-perspective conclusions, 2-3 forward-looking scenarios |

---

## 🎭 Stakeholder Perspectives (6-Lens Model)

For every major parliamentary action, analyze from ≥3 of these 6 perspectives:

1. **EP Political Groups** — Group dynamics, coalition implications
2. **Civil Society & NGOs** — Citizens' rights, transparency, democratic participation
3. **Industry & Business** — Regulatory impact, market effects, compliance burden
4. **National Governments** — Subsidiarity, implementation, diverging interests
5. **EU Citizens** — Daily life impact, rights, services, representation
6. **EU Institutions** — Commission/Council/ECB/CJEU inter-institutional dynamics

---

## 🔌 MCP Gateway Setup Script

All agentic workflows that run generation scripts use `scripts/mcp-setup.sh` to configure gateway connectivity. **Always `source` this script in the same bash block as generation commands** (env vars don't persist across blocks).

### `scripts/mcp-setup.sh` — What It Does

```bash
# Route through MCP gateway (direct HTTPS fails in AWF sandbox)
source scripts/mcp-setup.sh
# Sets:
#   EP_MCP_GATEWAY_URL=http://host.docker.internal:80/mcp/european-parliament
#   EP_MCP_GATEWAY_API_KEY=<extracted from MCP config JSON via node -e>
#   WORLD_BANK_MCP_SERVER_URL=http://host.docker.internal:80/mcp/world-bank
#   MCP_CLIENT_TIMEOUT_MS=120000
```

The script extracts auth tokens from `/home/runner/.copilot/mcp-config.json` using `node -e` (no `jq` dependency). Token priority: `gateway.apiKey` → `mcpServers['european-parliament'].headers.Authorization`.

### Canonical Gateway + Generation Block Pattern

```bash
# ⚠️ CRITICAL: mcp-setup.sh, generation script, and USE_EP_MCP MUST be in the same bash block
source scripts/mcp-setup.sh

# Fallback: verify binary for stdio mode
if [ -z "${EP_MCP_GATEWAY_URL:-}" ]; then
  if [ -f "node_modules/.bin/european-parliament-mcp-server" ]; then
    echo "✅ EP MCP server binary found for stdio mode"
  else
    npm install --no-save european-parliament-mcp-server@1.2.6
  fi
fi

export USE_EP_MCP=true
npx tsx src/generators/news-enhanced.ts --types=breaking ...
```

---

## 🏗️ EP MCP TypeScript Client (`src/mcp/ep-mcp-client.ts`)

The TypeScript source for the EP MCP client lives at `src/mcp/ep-mcp-client.ts` (compiled to `scripts/mcp/ep-mcp-client.js`).

### Connection Modes

| Mode | When Used | How Activated |
|------|-----------|---------------|
| **Gateway (HTTP)** | AWF sandbox / agentic workflows | `EP_MCP_GATEWAY_URL` env var or `gatewayUrl` constructor option |
| **Stdio** | Local development / standard CI | Default when `EP_MCP_GATEWAY_URL` is unset |

### Gateway Mode Activation

```typescript
// Automatic via env var (set by scripts/mcp-setup.sh):
//   EP_MCP_GATEWAY_URL=http://host.docker.internal:80/mcp/european-parliament
//   EP_MCP_GATEWAY_API_KEY=<raw-api-key>
import { EuropeanParliamentMCPClient } from './mcp/ep-mcp-client.js';
const client = new EuropeanParliamentMCPClient(); // reads env vars automatically
```

### Key Env Vars Read by the Client

| Variable | Purpose | Default |
|----------|---------|---------|
| `EP_MCP_GATEWAY_URL` | HTTP gateway URL (set by mcp-setup.sh) | — (stdio mode if unset) |
| `EP_MCP_GATEWAY_API_KEY` | Gateway authentication (set by mcp-setup.sh) | — |
| `EP_REQUEST_TIMEOUT_MS` | Per-request timeout in milliseconds | `120000` (set in MCP server frontmatter) |
| `MCP_CLIENT_TIMEOUT_MS` | Client-level timeout (set by mcp-setup.sh) | `120000` |
| `EP_MCP_SERVER_PATH` | Override binary path (stdio mode only) | `european-parliament-mcp-server` |

---

## 📰 Article Generation Commands

### News Enhanced Generator

```bash
npx tsx src/generators/news-enhanced.ts \
  --types={article-type} \
  --title="AI-generated headline" \
  --description="AI-generated meta description" \
  --analysis \
  --analysis-methods=all \
  --analysis-dir="${ANALYSIS_DIR}"
```

### Article Type Slugs

| Slug | Workflow |
|------|----------|
| `breaking` | news-breaking.md |
| `committee-reports` | news-committee-reports.md |
| `propositions` | news-propositions.md |
| `motions` | news-motions.md |
| `week-ahead` | news-week-ahead.md |
| `month-ahead` | news-month-ahead.md |
| `week-in-review` | news-weekly-review.md |
| `month-in-review` | news-monthly-review.md |

---

## 🔒 Safe Outputs Configuration

All news workflows use the same safe output configuration:

```yaml
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
```

### Safe Output Tools

| Tool | Purpose |
|------|---------|
| `safeoutputs___create_pull_request` | Create PR with article + analysis files |
| `safeoutputs___add_comment` | Post workflow summary comment |
| `safeoutputs___noop` | No-op (ONLY when zero data collected) |

### 🔍 Mandatory Noop Diagnostics (All Workflows)

> **⚠️ CRITICAL**: Every `safeoutputs___noop` call MUST include a detailed diagnostic message following this template. A bare "MCP server unavailable" message is NOT acceptable — include ALL available connectivity details so operators can diagnose and fix the root cause.

**Required noop message template:**

```
MCP CONNECTIVITY DIAGNOSTIC — {workflow-name}
Timestamp: {ISO-8601 UTC timestamp}
MCP Server: european-parliament-mcp-server@1.2.6

AWF Firewall Check:
  DNS Resolution: {PASS/FAIL} — nslookup data.europarl.europa.eu
  EP API Direct HTTP: {HTTP status code} — curl https://data.europarl.europa.eu/api/v2/meps?format=application%2Fld%2Bjson&offset=0&limit=1
  Network Reachability: data.europarl.europa.eu:443 {REACHABLE/UNREACHABLE}
  MCP Binary: {FOUND at path / NOT FOUND}
  EP_REQUEST_TIMEOUT_MS: {value or "NOT SET (default 60000)"}

MCP Health Gate:
  get_server_health: {PASS/FAIL} — {version + status or error message}
  get_plenary_sessions({ limit: 1 }): {PASS/FAIL} — {data summary or error + category}
  get_current_meps({ limit: 1 }): {PASS/FAIL} — {data summary or error + category}
  get_adopted_texts_feed({ timeframe: "one-week" }): {PASS/FAIL} — {item count or error + category}
  get_all_generated_stats({ category: "all" }): {PASS/FAIL} — {stats available or error}
  Error Category: {TIMEOUT/SERVER_ERROR/INTERNAL_ERROR/RATE_LIMIT/NOT_FOUND/DNS_FAILURE/CONNECTION_REFUSED/UNKNOWN}

Individual Tool Results:
  Reliable tools tested: {count passed}/{count attempted}
  Feed tools tested: {count passed}/{count attempted} — {list of timed-out feeds}
  Analytical tools: {count passed}/{count attempted}

Recovery Attempts:
  1. get_server_health: {result summary}
  2. get_all_generated_stats: {PASS — precomputed data available / FAIL — reason}
  3. Analysis-only PR possible: {YES — precomputed stats available / NO — MCP server unreachable}

Resolution Hints:
  - {Specific actionable suggestion based on error category and AWF check results}
  - If curl exit 6 (DNS failure): Add "data.europarl.europa.eu" and "*.europa.eu" to network.allowed
  - If curl exit 7 (connection refused): AWF firewall blocking HTTPS — verify network.allowed includes required domains
  - If curl exit 28 (timeout): EP API slow, NOT a firewall issue — use direct endpoint fallbacks (see MCP Tool Reliability Matrix)
  - If HTTP 000 with other curl exit: Transport/TLS error — check network.allowed and TLS connectivity
  - If TIMEOUT: Use direct endpoint fallbacks (see MCP Tool Reliability Matrix in SHARED_PROMPT_PATTERNS.md)
  - Check EP API status: https://data.europarl.europa.eu/api/v2/meps?format=application%2Fld%2Bjson&offset=0&limit=1
  - MCP server docs: https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/API_USAGE_GUIDE.md
```

**Error-category-specific resolution hints:**

| Error Category | Resolution Hints |
|---------------|-----------------|
| `TIMEOUT` | EP API is slow — use direct endpoint fallbacks from Reliability Matrix, increase `EP_REQUEST_TIMEOUT_MS` to `"120000"`, try `timeframe: "one-week"` instead of `"today"` |
| `SERVER_ERROR` | EP API returning 5xx — likely maintenance/outage, retry in 1-2 hours, then rerun the direct probe URL `https://data.europarl.europa.eu/api/v2/meps?format=application%2Fld%2Bjson&offset=0&limit=1` to confirm whether the EP API is responding again |
| `INTERNAL_ERROR` | MCP server internal failure — verify `european-parliament-mcp-server@1.2.6` is installed, check DNS resolution for `data.europarl.europa.eu` |
| `RATE_LIMIT` | Too many requests — reduce MCP call frequency, wait 5+ minutes before retry |
| `NOT_FOUND` | Endpoint not found — verify tool name and parameters match API_USAGE_GUIDE.md |
| `UNKNOWN` | Unclassified error — check AWF firewall (see diagnostic checklist below), network connectivity, MCP server logs |
| `DNS_FAILURE` | AWF firewall blocking DNS — add `data.europarl.europa.eu` and `"*.europa.eu"` to `network.allowed` |
| `CONNECTION_REFUSED` | AWF firewall blocking HTTPS — add `data.europarl.europa.eu` to `network.allowed`, verify `node` is in allowlist |

**Before calling noop, ALWAYS attempt these recovery steps:**
1. Run the **AWF Firewall Diagnostic** bash block (see section below) — include output in noop message
2. Call `european_parliament___get_server_health({})` for server-side diagnostics
3. Call `european_parliament___get_all_generated_stats({ category: "all" })` — this uses precomputed data (no live EP API needed) and can confirm MCP server is running even if EP API is down
4. If `get_all_generated_stats` succeeds, the MCP server IS working — the issue is EP API availability, not MCP connectivity. **Create an analysis-only PR with precomputed stats instead of noop**
5. Test at least 2 additional reliable tools from the Reliability Matrix (e.g., `get_current_meps`, `get_adopted_texts`) — if ANY direct endpoint works, the EP API is partially available and noop should be avoided

---

## 🛡️ MCP Server Configuration

### Node.js Runtime

All news workflows MUST include the `runtimes:` field to ensure Node.js 25 is used on the runner:

```yaml
runtimes:
  node:
    version: "25"
```

This ensures the GitHub Actions runner uses Node.js 25 for all scripts, builds, and tool execution. MCP server containers independently use `node:25-alpine` images.

### MCP Server Stack

All news workflows use the same MCP server stack:

```yaml
mcp-servers:
  european-parliament:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "european-parliament-mcp-server@1.2.6", "--timeout", "120000"]
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
```

> **Note:** Do NOT add `allowed: ["*"]` to MCP server definitions. The MCP gateway (awmg) treats `*` as a literal tool name, not a wildcard, causing 0 tools to be exposed. Omitting `allowed` allows all tools through by default.

> **Note:** All workflows now use `EP_REQUEST_TIMEOUT_MS: "120000"` to handle slow EP API response times (60-120 seconds for some tools).

### MCP Server Inspection

Use `gh aw mcp inspect` to analyze and debug MCP servers in workflows:

```bash
# List workflows with MCP configurations
gh aw mcp inspect

# Inspect MCP servers in a specific workflow
gh aw mcp inspect news-breaking

# Filter to a specific MCP server
gh aw mcp inspect news-breaking --server european-parliament

# Show detailed information about a specific tool
gh aw mcp inspect news-breaking --server european-parliament --tool get_plenary_sessions
```

The `--tool` flag provides: tool name, title, description, input schema, whether the tool is allowed in the workflow configuration, and annotations. Requires the `--server` flag.

### Required Frontmatter Fields for All Workflows

Every news workflow `.md` file MUST include these fields in the YAML frontmatter:

| Field | Required Value | Purpose |
|-------|---------------|---------|
| `runtimes.node.version` | `"25"` | Ensures Node.js 25 runtime on the runner |
| `network.allowed` | See domains list below | AWF firewall domain allowlist |
| `mcp-servers` | See MCP server stack above | MCP server definitions with `container/entrypoint/entrypointArgs/allowed` format |
| `tools.github.toolsets` | `[all]` | Full GitHub API access |
| `tools.bash` | `true` | Shell access for diagnostics and scripts |
| `tools.agentic-workflows` | `true` | Workflow/MCP introspection support |
| `tools.repo-memory` | See config | Cross-run editorial memory |

---

## 📊 EP MCP Timeout & Fallback Strategy

EP API calls can be slow (30-90s per call). Use these strategies:

### Feed Endpoint Fallback

```
1. Try timeframe: "today" (for daily workflows)
2. If empty/error/timeout → retry with timeframe: "one-week"
3. If still failing → use direct lookup with dateFrom/dateTo or year filter
```

### Direct Endpoint Fallback

```
1. Try get_events_feed({ timeframe: "one-week" })
2. If timeout → get_events({ dateFrom: "...", dateTo: "...", limit: 20 })
```

### Health Gate (Breaking News)

At workflow start, probe EP server health:
1. Call `get_server_health` — check feed availability
2. Call `get_plenary_sessions({ limit: 1 })` — connectivity probe (**⚠️ use `limit: 1` WITHOUT date filters** — date-filtered calls are much slower and may timeout)
3. If DEGRADED → skip `today` timeframe, go straight to `one-week`

---

## 🔌 MCP Tool Reliability Matrix (Verified April 2026)

> **Based on live testing against `european-parliament-mcp-server@1.2.6`**. The EP API at `data.europarl.europa.eu` has inherent latency — feed endpoints (`/feed` path) are consistently slower than direct lookup endpoints. This matrix guides health gate design and fallback escalation.

### ✅ Reliable Tools (respond within 30s)

| Tool | Parameters | Notes |
|------|-----------|-------|
| `get_server_health` | `{}` | ALWAYS call first — confirms MCP server is running |
| `get_all_generated_stats` | `{ category: "all" }` | Precomputed data, NO live EP API call — always works |
| `get_current_meps` | `{ limit: 1 }` | Fast lightweight probe |
| `get_plenary_sessions` | `{ limit: 1 }` | ⚠️ **ONLY without date filters** — adding `dateFrom`/`dateTo` causes timeouts |
| `get_adopted_texts` | `{ year: CURRENT_YEAR, limit: 3 }` | Direct lookup with year filter — reliable |
| `get_adopted_texts_feed` | `{ timeframe: "one-week" }` | **Only feed that reliably responds** |
| `get_meps_feed` | `{ timeframe: "one-week" }` | Large response but reliable |
| `get_speeches` | `{ dateFrom, dateTo, limit: 3 }` | Direct lookup — reliable |
| `generate_political_landscape` | `{}` | Analytical — uses cached structural data |
| `analyze_coalition_dynamics` | `{}` | Analytical — uses cached structural data |
| `early_warning_system` | `{ focusArea: "all" }` | Analytical — uses cached structural data |

### ⏱️ Frequently Timing Out (>60s — use fallbacks)

| Feed Tool (Slow) | Fallback Direct Tool | Fallback Parameters |
|-------------------|---------------------|-------------------|
| `get_procedures_feed` | `get_procedures` | `{ year: CURRENT_YEAR, limit: 20 }` |
| `get_events_feed` | `get_events` | `{ dateFrom: "YYYY-MM-01", dateTo: "YYYY-MM-DD", limit: 20 }` |
| `get_documents_feed` | `get_plenary_documents` | `{ year: CURRENT_YEAR, limit: 20 }` |
| `get_parliamentary_questions_feed` | `get_parliamentary_questions` | `{ type: "WRITTEN", startDate: "YYYY-MM-DD", limit: 20 }` |
| `get_plenary_documents_feed` | `get_plenary_documents` | `{ year: CURRENT_YEAR, limit: 20 }` |
| `get_committee_documents_feed` | `get_committee_documents` | `{ year: CURRENT_YEAR, limit: 20 }` |
| `get_plenary_sessions` (with dates) | `get_plenary_sessions` | `{ limit: 5 }` (no date filters!) |

### ⚠️ Health Gate Best Practice

```
1. get_server_health({}) → confirms MCP server running
2. get_plenary_sessions({ limit: 1 }) → confirms EP API reachable (NO date filters)
3. get_adopted_texts_feed({ timeframe: "one-week" }) → confirms feed layer working
4. If step 2 fails: get_current_meps({ limit: 1 }) → alternative EP API probe
5. If steps 2+4 fail: get_all_generated_stats({ category: "all" }) → MCP server works but EP API is down
```

> **Key insight**: If `get_server_health` succeeds but `get_plenary_sessions` fails, the MCP server is running but cannot reach the EP API. Check AWF firewall rules, DNS resolution, and EP API status. If `get_all_generated_stats` succeeds, create an analysis-only PR with precomputed stats instead of noop.

---

## 🛡️ gh-aw AWF Firewall Diagnostic Checklist

> The Agent Workflow Firewall (AWF) restricts network access in gh-aw sandboxed workflows. If MCP tools fail with connection errors (not timeouts), the AWF firewall is the most likely cause.

### Required `network.allowed` Domains

Every news workflow `.md` file MUST include these domains in the `network:` section:

```yaml
network:
  allowed:
    - node                           # Required: npm/npx package installation
    - github.com                     # Required: GitHub API, safe outputs
    - api.github.com                 # Required: GitHub REST API
    - data.europarl.europa.eu        # Required: EP Open Data API (primary)
    - "*.europa.eu"                  # Required: EP API subdomains
    - api.worldbank.org              # Optional: World Bank economic data
    - defaults                       # Required: GitHub Actions runtime infrastructure
```

### Firewall Diagnostic Steps (Include in Noop)

When a noop is triggered, the noop message MUST include results from this bash diagnostic block:

```bash
echo "=== AWF FIREWALL DIAGNOSTIC ==="
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 1. DNS resolution check
echo "--- DNS Resolution ---"
if command -v getent >/dev/null 2>&1; then
  DNS_EXIT=0
  DNS_OUTPUT=$(set -o pipefail; getent hosts data.europarl.europa.eu | head -5) || DNS_EXIT=$?
  if [ $DNS_EXIT -eq 0 ] && [ -n "$DNS_OUTPUT" ]; then
    printf '%s\n' "$DNS_OUTPUT"
  else
    echo "DNS FAILED"
  fi
elif command -v nslookup >/dev/null 2>&1; then
  DNS_EXIT=0
  DNS_OUTPUT=$(set -o pipefail; nslookup data.europarl.europa.eu 2>&1 | head -5) || DNS_EXIT=$?
  if [ $DNS_EXIT -eq 0 ] && [ -n "$DNS_OUTPUT" ]; then
    printf '%s\n' "$DNS_OUTPUT"
  else
    echo "DNS FAILED"
  fi
else
  echo "DNS FAILED: neither getent nor nslookup is available"
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
if EP_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" \
  --connect-timeout 10 \
  --max-time 120 \
  "https://data.europarl.europa.eu/api/v2/meps?format=application%2Fld%2Bjson&offset=0&limit=1" 2>/dev/null); then
  EP_CURL_EXIT=0
else
  EP_CURL_EXIT=$?
fi
EP_STATUS="${EP_STATUS:-000}"
case "$EP_CURL_EXIT" in
  0)
    echo "EP API HTTP Status: $EP_STATUS"
    ;;
  6)
    echo "EP API HTTP Status: $EP_STATUS (curl exit $EP_CURL_EXIT: DNS resolution failed)"
    ;;
  7)
    echo "EP API HTTP Status: $EP_STATUS (curl exit $EP_CURL_EXIT: connection failed)"
    ;;
  28)
    echo "EP API HTTP Status: $EP_STATUS (curl exit $EP_CURL_EXIT: operation timed out)"
    ;;
  *)
    echo "EP API HTTP Status: $EP_STATUS (curl exit $EP_CURL_EXIT: transport/TLS/other client error)"
    ;;
esac

# 4. MCP server binary check
echo "--- MCP Server Binary ---"
which european-parliament-mcp-server 2>/dev/null || \
  ls node_modules/.bin/european-parliament-mcp-server 2>/dev/null || \
  echo "MCP binary NOT FOUND — npx may need to install it"

# 5. Network connectivity to key hosts
echo "--- Network Connectivity ---"
for host in data.europarl.europa.eu github.com api.github.com; do
  timeout 5 bash -c "echo >/dev/tcp/$host/443" 2>/dev/null && \
    echo "$host:443 REACHABLE" || echo "$host:443 UNREACHABLE (AWF firewall?)"
done

# 6. Environment variables
echo "--- MCP Environment ---"
echo "EP_REQUEST_TIMEOUT_MS=${EP_REQUEST_TIMEOUT_MS:-NOT SET (default 60000)}"
echo "NODE_ENV=${NODE_ENV:-not set}"
```

### Error Pattern → Root Cause Mapping

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| `curl` exit 6 with HTTP 000 | DNS resolution failure for EP API host | AWF blocking DNS — add `data.europarl.europa.eu` and `"*.europa.eu"` to `network.allowed` |
| `curl` exit 7 with HTTP 000 and `/dev/tcp` unreachable | TCP connect failure/refused; AWF blocking HTTPS | Add `data.europarl.europa.eu` to `network.allowed` |
| `curl` exit 28 with HTTP 000 and `/dev/tcp` reachable | Network path exists but request timed out; EP API slow | NOT a firewall issue — increase `EP_REQUEST_TIMEOUT_MS`, use direct endpoint fallbacks |
| HTTP 000 with other `curl` exit code | Transport/TLS/other client error | Check `curl` exit code and `/dev/tcp` reachability probe; may be TLS or proxy issue |
| HTTP 5xx from EP API | EP API maintenance/outage | Retry in 1-2 hours; use `get_all_generated_stats` for precomputed data |
| MCP binary not found | `npx -y european-parliament-mcp-server@1.2.6` failed | Ensure `node` is in `network.allowed` (for npm registry) |
| Timeout after 60s | EP API slow + default timeout too low | Verify `EP_REQUEST_TIMEOUT_MS: "120000"` in `mcp-servers` env |
| Timeout after 120s | EP API exceptionally slow (feed endpoints) | Use direct endpoint fallback (see Reliability Matrix) |
| `get_server_health` fails | MCP server process didn't start | Check `npx` output, verify Node.js version ≥18 |
| All tools fail with "connection closed" | MCP stdio transport broken | Restart workflow, check process limits |

---

## 🔗 Cross-References

| Document | Path | Purpose |
|----------|------|---------|
| AI Analysis Guide | `analysis/methodologies/ai-driven-analysis-guide.md` | Master analysis protocol (Rules 1-12) |
| Analysis Templates | `analysis/templates/` | 8 structured output templates |
| Methodology Guides | `analysis/methodologies/` | 6 analytical frameworks |
| Skills Library | `.github/skills/` | Agent skill definitions |
| gh-aw Architecture | `.github/skills/gh-aw-architecture.md` | Workflow compilation guide |
| gh-aw Sandbox | `.github/skills/gh-aw-sandbox.md` | Security model |
| EP Data Skill | `.github/skills/european-parliament-data.md` | EP data reference |
| MCP Integration | `.github/skills/mcp-server-integration.md` | MCP tool usage |
