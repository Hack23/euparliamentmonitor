<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📋 Shared Prompt Patterns for EU Parliament Monitor Agentic Workflows

**📋 Document Owner:** CEO | **📄 Version:** 1.3 | **📅 Last Updated:** 2026-04-18 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-06-30
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

This document defines **shared prompt patterns, rules, and tool references** used by all 10 EU Parliament Monitor agentic workflows. Individual workflow `.md` files reference this document to avoid duplication and ensure consistency.

**Authoritative references:**
- **Analysis protocol:** `analysis/methodologies/ai-driven-analysis-guide.md` (Rules 1–21; v4.5+ Mandatory Pre-Flight Reading + Analysis-Sources Footer)
- **⭐ Depth reference:** `analysis/daily/2026-04-18/breaking-run184/` — **17-artifact / 13-framework / 3600+-line gold-standard exemplar**. See `intelligence/reference-analysis-quality.md` for quality gates.
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
| `test/` | ⚠️ CONDITIONAL — modify ONLY when required by an accompanying `src/`/`scripts/` fix (see below) | Unit test files |
| `e2e/` | ⚠️ CONDITIONAL — modify ONLY when required by an accompanying `src/`/`scripts/` fix (see below) | End-to-end test files |

### Minor TypeScript/Script Corrections (CONDITIONAL ALLOW)

> **Policy change (v1.1, 2026-04-17):** Agentic workflows MAY make **minor, targeted corrections** to `src/` and `scripts/` files **only when the correction is necessary to complete the workflow's primary mission** (news generation or translation). When such a correction changes behaviour covered by tests, the workflow **MUST also update the corresponding `test/` or `e2e/` tests in the same PR** so the suite stays green. This supersedes the prior v1.0 rule that blanket-banned test modifications.

**ALLOWED minor corrections:**
- ✅ Fix a TypeScript compilation error that blocks `npm run build` (e.g., missing import, type mismatch)
- ✅ Fix a runtime error in a generator script that prevents article generation
- ✅ Add a missing constant or enum value that causes the pipeline to fail
- ✅ Correct a data mapping error (e.g., wrong language code, incorrect URL pattern)
- ✅ Update `test/` or `e2e/` tests **when and only when** they are required to reflect an accompanying `src/`/`scripts/` fix

**STILL FORBIDDEN:**
- ❌ Refactoring or restructuring code beyond the minimum fix
- ❌ Adding new features, functions, or files to `src/` unrelated to the fix
- ❌ Standalone test-only edits (renaming, restructuring, "improving" tests that are already passing)
- ❌ Deleting tests or weakening assertions to make a broken fix pass
- ❌ Changing `package.json` dependencies
- ❌ Writing custom Python/Ruby/Perl scripts — use ONLY the Node.js/TypeScript toolchain
- ❌ Creating new standalone helper scripts (`.js`, `.py`, `.sh`)

**Constraints on minor corrections:**
1. **Maximum 20 lines changed** across all `src/` and `scripts/` files combined, plus up to **30 lines** across all `test/`/`e2e/` files strictly needed to cover the fix
2. **Must include a short explanation** for each code change or edited file explaining why the fix is needed, either as a comment near the changed block or in the PR body; use a concise format such as `Fix: [description] — gh-aw workflow correction`
3. **Must keep the test suite green** — `npm run test` MUST pass after the fix; if the fix would require more than 30 lines of test changes, skip the fix and log the error instead
4. **Must update tests in the SAME PR** as the `src/`/`scripts/` change — never push a code fix that leaves tests broken "to be fixed later"
5. **Must run `npm run build` AND `npm run test`** after the correction and report both results in the PR body
6. **AI analysis and content creation MUST still use AI prompts** — script corrections are ONLY for infrastructure/toolchain fixes

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

**Server:** `european-parliament-mcp-server@1.2.9`

### Feed Endpoints (Primary Data Source)

These endpoints use the `timeframe` parameter with supported values: `"today"`, `"one-day"`, `"one-week"`, `"one-month"`, and `"custom"`. When `timeframe` is `"custom"`, a `startDate` parameter (YYYY-MM-DD) is required.

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
| `get_plenary_sessions` | Plenary sessions | `dateFrom`/`dateTo`, `year`, `eventId`, `location`, `limit` | *(no dedicated sessions feed; use `get_plenary_session_documents_feed` for session documents when appropriate, or use dateFrom/dateTo for date range queries)* |
| `get_events` | EP events | `eventId`, `limit` | `get_events_feed` |
| `get_procedures` | Legislative procedures | `processId`, `limit` | `get_procedures_feed` |
| `get_adopted_texts` | Adopted texts | `year`, `docId`, `limit` | `get_adopted_texts_feed` |
| `get_plenary_documents` | Plenary documents | `year`, `docId`, `limit` | `get_plenary_documents_feed` |
| `get_committee_documents` | Committee documents | `docId`, `limit` | `get_committee_documents_feed` |
| `get_speeches` | Plenary speeches | `dateFrom`/`dateTo`, `speechId`, `limit` | *(no feed equivalent)* |
| `get_parliamentary_questions` | Parliamentary questions | `type`, `dateFrom`/`dateTo`, `author`, `topic`, `status`, `docId`, `limit` | `get_parliamentary_questions_feed` |
| `get_mep_details` | Specific MEP info | `id` (e.g., "MEP-124810") | — |
| `get_mep_declarations` | MEP financial declarations | `year`, `docId` | `get_mep_declarations_feed` |
| `get_committee_info` | Committee details | `abbreviation`, `id`, `showCurrent` (e.g., "ENVI") | — |
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

6. **Committee activity**: Use `get_committee_documents({ limit: 50 })` when committee document feeds fail (v1.2.9: `year` param removed — EP API ignores it).

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
| `get_events_feed` (404) | `get_events({ limit: 50 })` | Pagination only (v1.2.9: no date filtering for events) |
| `get_procedures_feed` (404) | `get_procedures({ limit: 50 })` | Pagination only (v1.2.9: `year` removed) |
| `get_committee_documents_feed` (timeout) | `get_committee_documents({ limit: 50 })` | Pagination only (v1.2.9: `year` removed) |
| `get_plenary_documents_feed` (timeout) | `get_plenary_documents({ year: YYYY, limit: 50 })` | Current year |
| `get_parliamentary_questions_feed` (timeout) | `get_parliamentary_questions({ type: "WRITTEN", limit: 20 })` | Recent questions |
| `get_adopted_texts_feed` (error) | `get_adopted_texts({ year: YYYY, limit: 100 })` | Current year |

> **⚠️ DO NOT SKIP DATA COLLECTION**: A feed returning 404 does NOT mean the data is unavailable. The underlying EP API often works fine — only the feed aggregation layer is degraded. ALWAYS try direct endpoints before concluding data is unavailable.

### Cross-Run Data Consistency

> **⚠️ SEAT COUNT NORMALIZATION**: When citing political group seat counts, use the SAME data source within a single analysis run. Get seat counts from `analyze_coalition_dynamics` OR from `get_meps_feed` — do NOT mix sources. Record the source in the analysis metadata. Inconsistent seat counts across same-day runs (e.g., EPP=185 vs EPP=188) undermine analytical credibility.

### 🔬 MCP Data-Quality Rules (empirical — basis: Runs 179–184)

Observations from the Easter 2026 recess series revealed persistent EP MCP server data-reliability defects. The canonical audit is
[`analysis/daily/2026-04-18/breaking-run184/intelligence/mcp-reliability-audit.md`](../../analysis/daily/2026-04-18/breaking-run184/intelligence/mcp-reliability-audit.md);
every news workflow MUST apply the following defensive rules when consuming MCP responses:

1. **`coalition_dynamics.cohesion` is not a political-alignment signal when `sharedVotes === null`.** Classify such scores as *"size-ratio artifacts"* and emit a data-quality warning. The Renew-ECR 0.95 figure is the reference example — do not treat as alliance evidence. **v1.2.9 update (PR #373):** the server now relabels `coalitionPairs[].cohesionScore` as `sizeSimilarityScore` and nulls out `cohesion`/`trend` until per-MEP roll-call data lands; treat any non-null `cohesion`/`trend` as legacy and continue applying the size-ratio-artifact warning.
2. **Never trust `get_server_health` alone.** Always cross-validate by probing at least one concrete feed (`get_adopted_texts_feed` is cheapest). **v1.2.9 update (PR #371):** `get_server_health` now distinguishes `Unknown` (cache empty / never probed) from `Unavailable`; an `Unknown` overall level MUST NOT be interpreted as outage — issue at least one feed probe before treating the server as down. If `server_health` reports 0/13 but a probe returns data, treat the server as DEGRADED, not UNAVAILABLE.
3. **Empty-string field responses = missing content.** When `get_adopted_texts({docId})` returns `{"id":"","title":"",...}` (every string field empty), treat as `CONTENT_PENDING` — do not render blanks in articles; do not quote them as data. **v1.2.9 update (PR #374):** the server now returns an explicit content-pending response shape for these documents; defensive empty-string detection is retained as belt-and-braces.
4. **Sum political-group `memberCount` before running coalition mathematics.** If the total is under 600 (EP10 ≈ 720 seats), emit a data-quality warning and cap coalition-probability estimates at 0.70 × raw_probability. **v1.2.9 update (PR #372):** the EPP / Greens-EFA / PfE / ESN `memberCount=0` bug is fixed for EP10 groups; the defensive sum-check remains mandatory in case of regressions.
   **v1.2.9 update (PR #375):** All `*_feed` endpoints now share a unified response envelope — fallback handlers can rely on a consistent shape, but the per-feed reliability matrix below still applies for latency.
5. **During API-degraded windows, produce an `intelligence/mcp-reliability-audit.md` file** alongside the normal artifact set whenever new defects are observed. This audit file is part of the analysis payload and feeds upstream issue tracking on `Hack23/European-Parliament-MCP-Server`.

### ⭐ Reference-Quality Depth Requirements (empirical — basis: Run 184)

The project's designated reference-quality run is
[`analysis/daily/2026-04-18/breaking-run184/`](../../analysis/daily/2026-04-18/breaking-run184/)
(17 artifacts · 3600+ lines · 13 analytical frameworks · zero placeholder markers).
When a workflow's analysis phase finishes, compare the output to the Mandatory
Analytical Dimension Matrix in
[`analysis/methodologies/ai-driven-analysis-guide.md`](../../analysis/methodologies/ai-driven-analysis-guide.md)
§Reference Analyses. If any **mandatory** artifact for the current article type is
missing or thin, execute a dedicated Pass 2 on that artifact before claiming
reference-quality. The seven deep-intelligence artifacts that distinguish Run 184:

1. `intelligence/pestle-analysis.md` — 6-dimension macro-environment scan (political /
   economic / social / technological / legal / environmental) with cross-dimensional
   coupling analysis.
2. `intelligence/stakeholder-map.md` — Mendelow power × interest quadrant chart for
   ≥12 stakeholders + position matrix on each key decision.
3. `intelligence/scenario-forecast.md` — ≥3 probability-weighted scenarios on a 2×2
   axes selected from the two most uncertain PESTLE drivers, plus decision tree and
   per-scenario early-warning indicators.
4. `intelligence/threat-model.md` — Diamond Model + Attack Trees + Kill Chain applied
   to the top severity-4+ threats from the risk matrix. Minimum: 3 threats modelled.
5. `intelligence/historical-baseline.md` — EP10 vs EP8/EP9 comparative baseline per
   Rule 17. Required for weekly and monthly reviews; recommended for breaking during
   plenary-return windows.
6. `intelligence/economic-context.md` — World Bank-sourced macro indicators for the
   member states materially affected by the current dossier, plus
   economic-political risk coupling matrix. Always include explicit data-age notes.
7. `intelligence/wildcards-blackswans.md` — ≥6 low-probability high-impact events plus
   a residual 5% Black Swan reserve. Essential for epistemic humility; prevents main
   scenario probabilities over-claiming.

Every artifact must carry an explicit **confidence level** (🟢 High / 🟡 Medium /
🔴 Low) on its aggregate findings and anchor claims to evidence (dated events, numeric
indicators, cited frameworks).

### 📋 Article Generation Pre-Flight Checklist (MANDATORY — Rules 19, 20, 21 of AI guide v4.5)

**Before drafting any article sentence**, an article-generation workflow MUST complete
every step of this checklist. Emit a `PREFLIGHT_ATTESTATION:` log line confirming
completion before article generation begins.

#### Step 1 — Read the index first

- [ ] Open `${ANALYSIS_DIR}/intelligence/analysis-index.md` and read it in full.
- [ ] If the file does not exist, generate it from `manifest.json` before proceeding
      (use the Run 184 index as a structural template: [`analysis/daily/2026-04-18/breaking-run184/intelligence/analysis-index.md`](../../analysis/daily/2026-04-18/breaking-run184/intelligence/analysis-index.md)).

#### Step 2 — Read `manifest.json`

- [ ] Load `${ANALYSIS_DIR}/manifest.json`.
- [ ] Record `artifactStats.totalFiles` and `analyticalFrameworksApplied.count`.
- [ ] Enumerate every path in `files.classification[]`, `files.risk_scoring[]`,
      `files.intelligence[]`, `files.documents[]` — this is the mandatory-read set.

#### Step 3 — Read every artifact in the mandatory-read set

- [ ] For each artifact in the set, read the entire file (not just the header).
- [ ] If any artifact is under 30 lines or contains `[AI_ANALYSIS_REQUIRED]` / `TBD` /
      placeholder text, **abort article drafting** and execute an analysis Pass 2 to
      extend the artifact before proceeding.
- [ ] Verify file-by-file that each artifact in the file system is listed in
      `manifest.json` — orphaned analysis files are a contamination risk.

#### Step 4 — Emit the attestation

Before writing any article HTML, print to workflow stdout a line matching this
format (substitute your actual counts):

```
PREFLIGHT_ATTESTATION: read 17/17 artifacts from analysis/daily/2026-04-18/breaking-run184/ (3632 lines, 13 frameworks)
```

#### Step 5 — Consume the finding-level cross-reference map

`analysis-index.md` contains a table mapping article sections (headline, lede, risk
paragraph, historical-comparison paragraph, etc.) to the specific analysis artifacts
that should be consulted when drafting each section. Use it.

#### Step 6 — Render the mandatory Analysis-Sources footer

- [ ] Call `renderAnalysisTransparencySection(date, slug, lang, analysisDir, analysisFiles)`
      where `analysisFiles` is a `ReadonlyArray<AnalysisFileEntry>` — one entry
      `{ method, outputFile }` per artifact listed under `manifest.json.files.*`.
      `method` is the canonical analysis method name (e.g. `significance-classification`,
      `risk-matrix`, `pestle-analysis`), and `outputFile` is the relative path inside
      the run directory (e.g. `classification/significance-scoring.md`). The function
      is in `src/templates/article-template.ts` and `AnalysisFileEntry` is defined in
      `src/types/generation.ts`. This call exists precisely to enforce Rule 20; if
      `analysisFiles` is omitted, the helper falls back to a hardcoded default set
      and will NOT link every manifest artifact.
- [ ] Verify the rendered HTML contains a `<section class="analysis-transparency">`
      block with one `<li>` entry per analysis artifact.
- [ ] Run `npx tsx src/utils/validate-articles.ts --date=$TODAY --quality --strict`
      before the safe output — non-zero exit blocks PR creation.
      **Note:** The current `validate-articles.ts` does NOT yet assert the presence
      of `<section class="analysis-transparency">`; enforcement of the footer today
      comes from the template path (`renderAnalysisTransparencySection` in
      `src/templates/article-template.ts`) and, for pre-existing articles, from
      `src/utils/retrofit-analysis-links.ts`. A validator-level assertion is
      planned as a follow-up; until that lands, the bullets above (render + verify)
      are the authoritative enforcement points.

#### Step 7 — Verify the Analysis-Article Read Ratio (Rule 21)

After drafting, count artifacts cited (inline and in footer) and compare to article
word count:

- Breaking / weekly / monthly: target ≥ 1 artifact per 150 words
- Article-generator long form: target ≥ 1 artifact per 100 words

If the ratio is below target, execute Pass 2 to add specific artifact-anchored
citations inline in prose.

### Analytical Tools (AI-Powered Analysis)

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `get_voting_records` | Aggregate plenary votes | `sessionId`, `mepId`, `topic`, `dateFrom`/`dateTo`, `limit`, `offset` |
| `analyze_voting_patterns` | MEP voting behaviour | `mepId`, `dateFrom`/`dateTo`, `compareWithGroup` |
| `analyze_coalition_dynamics` | Political group alliances | `groupIds`, `dateFrom`/`dateTo`, `minimumCohesion` |
| `detect_voting_anomalies` | Unusual voting patterns | `groupId`, `mepId`, `dateFrom`/`dateTo`, `sensitivityThreshold` |
| `compare_political_groups` | Multi-dimension comparison | `groupIds` (min 2), `dimensions`, `dateFrom`/`dateTo` |
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
| `get_plenary_sessions({ startDate: "2026-01-01", endDate: "2026-12-31" })` | `get_plenary_sessions({ dateFrom: "2026-01-01", dateTo: "2026-12-31" })` | v1.2.9 uses `dateFrom`/`dateTo`, also supports `year` param |
| `get_parliamentary_questions({ startDate: "2026-01-01" })` | `get_parliamentary_questions({ dateFrom: "2026-01-01" })` | v1.2.9 uses `dateFrom`/`dateTo` |
| `search_documents({ query: "climate" })` | `search_documents({ keyword: "climate" })` | v1.2.9 uses `keyword`, not `query`; also supports `documentType`, `docId` |
| `get_adopted_texts_feed({ timeframe: "three-months" })` | `get_adopted_texts_feed({ timeframe: "one-month" })` | Valid timeframes: `today`, `one-day`, `one-week`, `one-month`, `custom` |
| `compare_political_groups({ groups: ["EPP", "S&D"] })` | `compare_political_groups({ groupIds: ["EPP", "S&D"] })` | v1.2.9 uses `groupIds`, not `groups` |
| `get_voting_records({ topic: "climate" })` *(unbounded)* | `get_voting_records({ sessionId: "...", limit: 50 })` or `get_voting_records({ topic: "climate", dateFrom: "...", dateTo: "...", limit: 50 })` | `topic` is supported but always combine with `sessionId` or `dateFrom`/`dateTo` to bound results |
| `get_mep_details({ name: "Weber" })` | `get_mep_details({ id: "MEP-124810" })` | Must use MEP ID, not name |
| `get_events({ year: 2026, dateFrom: "...", dateTo: "..." })` | `get_events({ limit: 50 })` | v1.2.9: EP API `/events` has NO date filtering — `year`/`dateFrom`/`dateTo` removed |
| `get_procedures({ year: 2026 })` | `get_procedures({ limit: 50 })` | v1.2.9: EP API ignores `year` for `/procedures` — param removed |
| `get_speeches({ year: 2026 })` | `get_speeches({ dateFrom: "2026-01-01", dateTo: "2026-12-31" })` | v1.2.9: `year` removed — use `dateFrom`/`dateTo` (maps to `sitting-date`/`sitting-date-end`) |
| `get_committee_documents({ year: 2026 })` | `get_committee_documents({ limit: 50 })` | v1.2.9: EP API ignores `year` for `/committee-documents` — param removed |
| `get_external_documents({ year: 2026 })` | `get_external_documents({ limit: 50 })` | v1.2.9: EP API ignores `year` for `/external-documents` — param removed |

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

| Step | Action | Time Budget | Reference |
|------|--------|:------------:|-----------|
| 1. **Download** | Fetch EP feed data via MCP tools; if feeds fail, use direct endpoint fallbacks | ≤10 min | Feed endpoints + Direct Lookup fallbacks above |
| 2. **Deep-Fetch** | For every adopted text/procedure cited: fetch `track_legislation`, `get_voting_records`, `get_meeting_decisions`, `get_speeches` (max 10 deep-fetch calls) | included in ≤10 min | Mandatory Deep Data Collection section above |
| 3. **Analyze** | AI reads ALL 6 methodology docs + 8 templates, applies to every data file. **Analysis MUST NOT start until Download + Deep-Fetch are complete.** | 15-25 min | `ai-driven-analysis-guide.md` Rules 2-4, 7 |
| 4. **Evaluate** | AI evaluates analysis artifacts for newsworthiness | — | `ai-driven-analysis-guide.md` Rule 5 |
| 5. **Generate** | Generate article with AI-driven title/description. **Generation MUST NOT start until Analyze is complete.** | — | `ai-driven-analysis-guide.md` Rules 8-9, 12 |
| 6. **PR** | Create PR with articles AND analysis artifacts | — | `ai-driven-analysis-guide.md` Rule 5 |

### EP MCP Tool Response Times (from API_USAGE_GUIDE.md)

Most EP MCP tools respond in **<10 seconds**. Only slow feed endpoints take 30-120+ seconds. Plan call budgets accordingly — you can make many more calls than the old "30+ seconds per call" guidance suggested.

| Tool Category | Response Time | Examples |
|--------------|:------------:|---------|
| **Fast endpoint tools** (with `year` filter where supported) | <5 s | `get_adopted_texts`, `get_plenary_sessions`, `get_plenary_documents`, `get_controlled_vocabularies` |
| **Fast feed tools** | ~1 s | `get_adopted_texts_feed`, `get_mep_declarations_feed`, `get_external_documents_feed` |
| **Medium feed tools** | ~9 s | `get_meps_feed` |
| **OSINT/analysis tools** (cached) | <5 s | `analyze_coalition_dynamics`, `generate_political_landscape`, `early_warning_system`, `get_all_generated_stats` |
| **Deep-fetch tools** | 5-30 s | `track_legislation`, `get_voting_records`, `get_speeches`, `get_meeting_decisions` |
| **Slow feed tools** | 30-120+ s ⚠️ | `get_events_feed`, `get_procedures_feed`, `get_documents_feed`, `get_plenary_documents_feed`, `get_committee_documents_feed`, `get_corporate_bodies_feed` |

> **Rate limits:** EP API allows 500 requests per 5 minutes. MCP server caches responses (<200ms for cached). The 10-minute data retrieval budget allows 40+ tool calls comfortably.

### World Bank MCP Tool Reference

The `worldbank-mcp@1.0.1` server provides **7 tools**. All respond in <5 seconds:

| Tool | Parameters | Valid Indicators |
|------|-----------|-----------------|
| `search-indicators` | `keyword` (string) | — |
| `get-countries` | `region`, `incomeLevel` (optional) | — |
| `get-country-info` | `countryCode` (ISO2) | — |
| `get-economic-data` | `countryCode`, `indicator`, `years` (default 10) | GDP, GDP_GROWTH, GDP_PER_CAPITA, GNI, GNI_PER_CAPITA, EXPORTS_GDP, FDI_NET, INFLATION, UNEMPLOYMENT |
| `get-social-data` | `countryCode`, `indicator`, `years` (default 10) | POPULATION, LIFE_EXPECTANCY, BIRTH_RATE, DEATH_RATE, INTERNET_USERS |
| `get-education-data` | `countryCode`, `indicator`, `years` (default 10) | LITERACY_RATE, SCHOOL_ENROLLMENT, SCHOOL_COMPLETION, TEACHERS_PRIMARY, EDUCATION_EXPENDITURE |
| `get-health-data` | `countryCode`, `indicator`, `years` (default 10) | HEALTH_EXPENDITURE, PHYSICIANS, HOSPITAL_BEDS, IMMUNIZATION, HIV_PREVALENCE, MALNUTRITION, TUBERCULOSIS |

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
1. `ai-driven-analysis-guide.md` — Master protocol (Rules 1-21)
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
- ✅ **Alternative:** Use `get_procedures({ limit: 50 })` as fallback to get actual pipeline data (v1.2.9: `year` param removed)

**General rule:** Any metric that equals exactly 0 from an analytical tool should be verified against feed data before rendering. Zero often means "no data returned" not "zero activity".

---

## 📊 Article Content Depth Gates (Mandatory for All Workflows)

> **⚠️ ROOT CAUSE OF QUALITY REGRESSIONS**: Articles that read like "shallow code-generated lists" rather than deep political intelligence fail these gates. The AI MUST synthesize its analysis artifacts (SWOT, stakeholder impact, coalition dynamics, risk assessment) INTO the article prose — not just reference them. Every article must read like a publication from The Economist's political intelligence unit, not a data dump.

### 🔤 Prose-First Writing Structure (MANDATORY)

> **ABSOLUTE RULE**: Articles are **analytical essays**, not bullet-point reports. The AI agent (Opus 4.7) must write substantive prose paragraphs that synthesize political intelligence from the completed analysis phase.

| Gate | Requirement | Validation |
|------|-------------|------------|
| **Prose ratio** | ≥60% of article body text (by character count) must be in `<p>` paragraph tags, not `<li>` list items | Count chars in `<p>` vs `<li>` tags (HTML stripped) |
| **Paragraph depth** | Each analytical section must contain ≥3 paragraphs of ≥50 words each | Count paragraphs per `<section>` |
| **Lede paragraph** | Opening paragraph must be ≥80 words of analytical narrative, not a summary list | Word count of first `<p class="lede">` |
| **No orphan lists** | Bullet lists must always follow an analytical paragraph that provides context | Every `<ul>`/`<ol>` preceded by a `<p>` |
| **Analysis synthesis** | Each section must weave findings from the analysis phase into the narrative | Reference specific analysis artifacts |

**Anti-patterns that FAIL this gate:**
- ❌ Section heading → bullet list of items with one-line descriptions
- ❌ Section heading → single paragraph → long bullet list
- ❌ "Here are the key developments:" followed by a list (write analytical paragraphs instead)
- ❌ SWOT/stakeholder sections with only 1-2 sentences per item
- ❌ Coalition analysis that merely names groups without explaining motivations and strategy

**Required pattern for EVERY analytical section:**
1. **Opening analytical paragraph** (≥60 words) — synthesize the key finding with political context
2. **Evidence paragraph** (≥50 words) — cite specific EP data (document IDs, vote counts, dates)
3. **Implication paragraph** (≥50 words) — explain consequences, stakeholder impact, scenarios
4. **Supporting details** (optional) — if needed, a brief list of ≤5 items with ≥20 words each

### 🔬 Deep Political Intelligence Requirements (MANDATORY)

> **These requirements transform shallow summaries into Economist-quality analysis.** The AI must demonstrate genuine political understanding, not just data recitation.

#### SWOT Analysis Depth
- Each SWOT quadrant (Strengths, Weaknesses, Opportunities, Threats) must contain **≥3 items**
- Each SWOT item must have **≥80 words** of analytical prose explaining WHY it matters politically
- SWOT must cover **both political AND economic/regulatory dimensions**
- SWOT must reference **specific actors** (MEPs, committees, political groups) with evidence
- SWOT must include **confidence levels** (🟢 High / 🟡 Medium / 🔴 Low) on each assessment
- **⚠️ SWOT sections with only generic one-liners FAIL validation** — rewrite with evidence-based analysis

#### Stakeholder Impact Depth
- Minimum **4 stakeholder perspectives** per key development (from the 6-lens model)
- Each stakeholder perspective must have **≥150 words** of analytical narrative
- Must explain **specific mechanisms** through which stakeholders are affected (not just "positive/negative")
- Must identify **winners and losers** with evidence chains (e.g., "EMPL's Talent Pool directive benefits tech sector recruitment by streamlining cross-border hiring — but Eastern EU states lose workforce to Western job markets, as evidenced by...")
- Must include **stakeholder response scenarios** (what they're likely to do next)

#### Coalition Dynamics Depth
- Name **specific MEPs** who led or opposed each development
- Explain **group voting motivations** in political-strategic terms (not just "EPP voted for")
- Identify **coalition shifts** — is this vote consistent with or divergent from recent patterns?
- Quantify where possible — vote margins, abstention rates, defections
- Compare with **historical voting patterns** on similar issues (use precomputed stats for context)

#### Risk Assessment Integration
- Every article must include a **risk outlook** section with ≥200 words
- Identify **2-3 political risks** from the developments covered, with probability labels
- Include **institutional risks** (e.g., Council pushback, implementation failures, legal challenges)
- Reference **specific evidence** for each risk (not generic "there are risks")

### 📈 Mandatory World Bank Economic Context (CONDITIONAL)

> **RULE**: When the article covers ANY policy area with measurable economic impact (trade, employment, digital economy, health, environment, energy, agriculture, housing, migration), the AI MUST include World Bank economic context.

> **📘 Canonical indicator→article-type mapping**: See
> [`analysis/methodologies/worldbank-indicator-mapping.md`](../../analysis/methodologies/worldbank-indicator-mapping.md).
> That file is the single source of truth for which indicators to pick per
> article type and per committee. Always cite it by relative path from
> workflow prompts so the AI reads it at runtime.

> **🔌 Connectivity probe**: Workflows SHOULD source
> `scripts/wb-mcp-probe.sh` immediately after `scripts/mcp-setup.sh` and
> branch on `$WB_MCP_OK`:
>   - `WB_MCP_OK=true`  → World Bank gate is **mandatory** (full rule below).
>   - `WB_MCP_OK=false` → World Bank gate degrades to **best-effort**: still
>     include the phrase "World Bank" + a one-sentence degradation note in
>     the article footer so the validator's evidence check passes.

**When World Bank data is MANDATORY** (not optional — see the mapping file for the full list):
- Articles about employment/labour legislation → `UNEMPLOYMENT`, `GDP_GROWTH` for affected countries
- Articles about trade policy (tariffs, Mercosur, WTO) → `EXPORTS_GDP`, `FDI_NET`, `GDP_GROWTH`
- Articles about health legislation → `HEALTH_EXPENDITURE`, `PHYSICIANS`, `LIFE_EXPECTANCY`
- Articles about digital/tech policy → `INTERNET_USERS`, `GDP_PER_CAPITA`
- Articles about environment/energy → search for `renewable energy`, `CO2 emissions` indicators
- Articles about education/skills → `EDUCATION_EXPENDITURE`, `SCHOOL_ENROLLMENT`
- Articles about housing/social policy → `GDP_PER_CAPITA`, `POPULATION`, search for `housing`
- Articles about agriculture → search for `agriculture`, `food security` indicators
- Articles about defence → search for `military expenditure` indicators

**Integration requirements:**
1. Call `search-indicators` first to discover the best indicator for the specific topic
2. Fetch data for ≥2 relevant EU countries using Big Four or affected member states
3. Include the data as **context within analytical paragraphs** (not as a separate data dump)
4. Generate a Chart.js visualization using `buildDashboardSection()` to display the data
5. Write ≥1 paragraph (≥60 words) interpreting the economic data in the context of the legislation

### 📊 Mandatory Chart/Dashboard Generation (ALL Article Types)

> **RULE**: Every article MUST include at least one data visualization. Articles without charts feel like text-only reports rather than data-driven intelligence.

**Minimum visualization requirements per article:**
| Visualization | Requirement | How |
|---------------|-------------|-----|
| **Dashboard metrics** | ≥1 dashboard panel with real data | Pass `DashboardConfig` to `buildDashboardSection()` |
| **Chart** | ≥1 Chart.js chart (bar, line, pie, or radar) with real data | Include `chart` property in dashboard panel |
| **SWOT grid** | Full 4-quadrant SWOT with ≥3 items per quadrant | Pass SWOT data to `buildSwotSection()` |

**Chart data MUST be real** — not placeholder `[0,0,0]` arrays. Sources for chart data:
- EP MCP analytical tools (coalition dynamics, legislative pipeline, committee activity)
- World Bank economic indicators
- Precomputed statistics (as background context)

**Anti-patterns:**
- ❌ Article with zero `<canvas>` elements → FAILS validation
- ❌ Dashboard with all metrics showing 0 or "N/A" → omit or explain
- ❌ Chart with only 1 data point → use at least 3 data points

### 🔗 Analysis-to-Article Synthesis (MANDATORY)

> **⚠️ THE CRITICAL GAP**: Analysis artifacts (SWOT, risk assessment, stakeholder impact, significance scoring) are being created but NOT synthesized into article prose. This must stop.

**Requirements:**
1. **Every analysis artifact** written during the analysis phase MUST be referenced in the article
2. **SWOT findings** must be woven into relevant sections (not isolated in a SWOT-only section)
3. **Stakeholder perspectives** must appear throughout the article, not just in one dedicated section
4. **Risk assessment findings** must inform the outlook/scenarios section
5. **Significance scoring** must determine section ordering (highest-scored items first)
6. **Coalition dynamics** must be discussed in the context of specific votes/decisions, not abstractly

**Validation checklist before PR creation:**

> **⚠️ BLOCKING GATE**: The CLI validator below is authoritative. It must be
> run and must pass before emitting the `create-pull-request` safe output.
> The inline shell loop that follows it is informational/diagnostic only.

```bash
# Authoritative quality gate — fails on missing charts, missing World Bank
# evidence (for policy article types), hand-written HTML fingerprints
# (language-switcher count <14, missing .footer-content), and all pre-existing
# structural checks. Non-zero exit MUST block PR creation.
npx tsx src/utils/validate-articles.ts --date="$TODAY" --quality --strict
VALIDATOR_EXIT=$?
if [ "$VALIDATOR_EXIT" -ne 0 ]; then
  echo "❌ BLOCKING: validate-articles failed (exit $VALIDATOR_EXIT). Fix the reported issues and re-run before PR." >&2
  exit 1
fi
```

```bash
# Diagnostic loop — prints prose ratio and chart count per article. The
# blocking check above already covers these rules; this loop exists so a
# human reader of the workflow log can see per-article metrics at a glance.
for f in news/${TODAY}-*-en.html; do
  [ -f "$f" ] || continue
  METRICS=$(FILE="$f" node -e "const fs = require('node:fs'); const html = fs.readFileSync(process.env.FILE, 'utf8'); const stripTags = (value) => value.replace(/<[^>]+>/g, ''); const sumChars = (regex) => Array.from(html.matchAll(regex)).reduce((total, match) => total + stripTags(match[1]).length, 0); process.stdout.write(String(sumChars(/<p[^>]*>([\s\S]*?)<\/p>/gi)) + ' ' + String(sumChars(/<li[^>]*>([\s\S]*?)<\/li>/gi)));" 2>/dev/null || echo "0 0")
  set -- $METRICS
  PARA_CHARS=$1
  LI_CHARS=$2
  TOTAL=$((PARA_CHARS + LI_CHARS))
  if [ "$TOTAL" -gt 0 ]; then
    RATIO=$((PARA_CHARS * 100 / TOTAL))
    echo "$f: prose ratio ${RATIO}% (target: ≥60%)"
  fi
  CHARTS=$(grep -c '<canvas' "$f" 2>/dev/null || echo 0)
  echo "$f: charts=$CHARTS (target: ≥1)"
done
```

---

## 🔄 4-Pass AI Refinement Cycle (All Workflows)

> **⚠️ MANDATORY**: Every article MUST go through all 4 passes. Each pass adds depth. Skipping passes produces the shallow, list-like articles that fail the Economist Test.

| Pass | Action | Minimum Output |
|------|--------|----------------|
| **1. Initial Assessment** | Gather baseline data, identify key actors/actions/outcomes. Write initial analysis prose. | ≥200 words per key development |
| **2. Stakeholder Challenge** | Re-examine from ≥4 stakeholder perspectives, find blind spots, add dissenting views. Write stakeholder impact narratives. | ≥150 words per stakeholder perspective |
| **3. Evidence Cross-Validation** | Cross-check claims against EP data (document IDs, vote counts, procedure references). Add confidence indicators (🟢/🟡/🔴). Remove unsupported claims. | Every claim has an evidence citation |
| **4. Synthesis & Scenarios** | Multi-perspective conclusions, 2-3 forward-looking scenarios with probability labels, risk outlook with institutional risks. Weave SWOT, stakeholder, and risk findings into the narrative. | ≥200 words risk outlook, ≥2 named scenarios |

> **Pass 4 is where analysis becomes journalism**: The synthesis pass transforms structured analysis into flowing prose. After Pass 4, every section should read like a paragraph from The Economist, not a template output.

---

## 🔁 MANDATORY Iterative Improvement Protocol (All Workflows)

> **⚠️ ABSOLUTE RULE — NON-NEGOTIABLE**: One pass is NEVER sufficient. Every piece of content — analysis markdown, article HTML, SWOT, stakeholder sections — MUST go through at least **2 complete improvement iterations**. The AI MUST spend the FULL allocated time on each phase. Completing early with low-quality output is a VIOLATION.

### Why This Exists

Today's workflow runs complete in 24-30 minutes out of 60-minute budgets. The AI rushes through phases, produces shallow first-draft content, and moves on. This produces articles that read like code-generated summaries rather than Economist-quality political intelligence. **This stops now.**

### 🛑 NO SHORTCUTS / NO EARLY COMPLETION Rules

1. **NEVER complete a phase early** — If the time budget says "15-20 minutes for analysis," you MUST work for the FULL 15-20 minutes. Use every minute for iterative improvement.
2. **NEVER produce first-draft quality** — A first pass is a starting point. You MUST read it back completely, identify gaps, and rewrite/extend before moving on.
3. **NEVER skip the read-back step** — After writing any content, you MUST read the ENTIRE output, then improve it.
4. **ALWAYS use the full workflow timeout** — If the workflow has a 60-minute budget, you should be actively working for ≥45 minutes. Finishing in 25 minutes means you rushed.
5. **ALWAYS iterate until excellent** — "Good enough" is NOT acceptable. Every output must be the best possible quality achievable within the time budget.

### 📋 Mandatory 2-Pass Improvement Cycle (Analysis Phase)

| Step | Action | Time |
|------|--------|------|
| **Pass 1: Initial Analysis** | Write all analysis markdown files (SWOT, stakeholder, coalition, risk, significance scoring). Apply all methodology guides and templates to every downloaded MCP data file. | ~60% of analysis time |
| **Pass 2: Complete Read-Back & Improvement** | Read EVERY analysis file you wrote — completely, word by word. For each file: (1) identify shallow sections, (2) add missing evidence/citations, (3) expand one-liners into full paragraphs, (4) add confidence levels where missing, (5) add cross-references between analysis files, (6) ensure every SWOT item has ≥80 words with evidence. Rewrite any section that doesn't meet the Economist Test. | ~40% of analysis time |

> **⚠️ Pass 2 verification**: After Pass 2, every analysis file must have: ≥400 lines, evidence citations in ≥80% of paragraphs, no placeholder text, no `[AI_ANALYSIS_REQUIRED]` markers, and cross-references to other analysis files.

### 📋 Mandatory 2-Pass Improvement Cycle (Article Generation Phase)

| Step | Action | Time |
|------|--------|------|
| **Pass 1: Initial Article Generation** | Run the TypeScript generator, replace all `[AI_ANALYSIS_REQUIRED]` markers with substantive AI analysis. Write all sections with proper prose (≥60% paragraph ratio). | ~50% of article time |
| **Pass 2: Complete Article Read-Back & Improvement** | Read the ENTIRE generated article — every section, every paragraph, every SWOT item, every stakeholder perspective. For each section: (1) is it ≥3 analytical paragraphs of ≥50 words? (2) does it cite specific EP data? (3) does it name specific actors/MEPs? (4) does it explain WHY not just WHAT? (5) is it prose, not a bullet list? Rewrite any section that fails. Add World Bank economic context if missing. Verify ≥1 Chart.js visualization exists. Run the prose ratio validation script. | ~50% of article time |

> **⚠️ Pass 2 article verification checklist** (MUST complete ALL before PR creation):
> - [ ] Read entire article from top to bottom
> - [ ] Every section has ≥3 prose paragraphs (not bullet lists)
> - [ ] Every SWOT item has ≥80 words with evidence and confidence level
> - [ ] Every stakeholder perspective has ≥150 words with evidence chain
> - [ ] Risk outlook is ≥200 words with probability-labelled scenarios
> - [ ] World Bank economic data included where policy has economic dimension — rendered in ≥1 `<canvas data-chart-config="…">` block AND discussed in ≥1 analytical paragraph of ≥60 words. Indicator selection MUST follow [`analysis/methodologies/worldbank-indicator-mapping.md`](../../analysis/methodologies/worldbank-indicator-mapping.md)
> - [ ] ≥1 Chart.js canvas with supported type (`bar`/`line`/`pie`/`doughnut`/`radar`/`polarArea`/`scatter`/`bubble`) and ≥3 data points — the validator's `articleHasChart()` rejects single-point canvases
> - [ ] Standard language switcher emits all 14 `.lang-link` entries (hand-written HTML that skips the template is blocked by `countLanguageSwitcherLinks`)
> - [ ] Footer includes BOTH `.footer-content` and `.footer-bottom` blocks (ditto)
> - [ ] No inline `<script>` blocks in article body (CSP is fixed at `script-src 'self'`; all runtime JS lives in `js/article-runtime.js` / `js/chart-init.js`)
> - [ ] Zero `[AI_ANALYSIS_REQUIRED]` markers remain
> - [ ] Article passes the Economist Test — reads like analytical journalism
> - [ ] Prose ratio ≥60% (run validation script)
> - [ ] `npx tsx src/utils/validate-articles.ts --date=$TODAY --quality --strict` exits 0

### ⏱️ Time Enforcement Rules

| Workflow Type | Total Budget | Min Active Work | Analysis Phase | Article Phase | Validation |
|---------------|-------------|-----------------|---------------|--------------|------------|
| Breaking news | 60 min | ≥45 min | ≥20 min (Pass 1: 12m + Pass 2: 8m) | ≥15 min (Pass 1: 8m + Pass 2: 7m) | 5 min |
| Committee reports | 60 min | ≥45 min | ≥20 min (Pass 1: 12m + Pass 2: 8m) | ≥15 min (Pass 1: 8m + Pass 2: 7m) | 5 min |
| Propositions | 60 min | ≥45 min | ≥20 min (Pass 1: 12m + Pass 2: 8m) | ≥15 min (Pass 1: 8m + Pass 2: 7m) | 5 min |
| Motions | 60 min | ≥45 min | ≥20 min (Pass 1: 12m + Pass 2: 8m) | ≥15 min (Pass 1: 8m + Pass 2: 7m) | 5 min |
| Week ahead | 60 min | ≥45 min | ≥20 min (Pass 1: 12m + Pass 2: 8m) | ≥15 min (Pass 1: 8m + Pass 2: 7m) | 5 min |
| Weekly review | 60 min | ≥45 min | ≥25 min (Pass 1: 15m + Pass 2: 10m) | ≥15 min (Pass 1: 8m + Pass 2: 7m) | 5 min |
| Month ahead | 60 min | ≥45 min | ≥20 min (Pass 1: 12m + Pass 2: 8m) | ≥15 min (Pass 1: 8m + Pass 2: 7m) | 5 min |
| Monthly review | 60 min | ≥45 min | ≥25 min (Pass 1: 15m + Pass 2: 10m) | ≥15 min (Pass 1: 8m + Pass 2: 7m) | 5 min |
| Article generator | 120 min | ≥90 min | ≥15 min × types | ≥15 min × types | 10 min |

> **🚫 VIOLATION**: Completing a 60-minute workflow in under 45 minutes. If you find yourself about to create the PR before minute 45, STOP — go back and improve your analysis and articles. Read everything again. Add more depth. Every additional minute of improvement produces higher quality.

### 📋 Mandatory Analysis-Only 4-Pass Protocol (When No Article Is Generated)

> **⚠️ NON-NEGOTIABLE**: The ≥45-minute active-work requirement applies **equally** to analysis-only runs (when the newsworthiness gate fails or Parliament is in recess and no article is produced). An agent that determines "no breaking news" at minute 15 and immediately creates the analysis-only PR is in **VIOLATION** — the time saved by skipping article generation MUST be reinvested into deeper analysis.
>
> **Root cause this rule addresses**: Analysis-only runs historically short-circuit at minute ~20, produce 🟡 Medium-quality output, and waste 30+ minutes of the 60-minute budget. See PR #1223 / run 24541203743 (19-minute agent run).

**Replace the normal article phase (minutes 35–45) with an Extended Analysis Phase when no article is generated:**

| Step | Action | Time |
|------|--------|------|
| **Minutes 15–27 — Pass 1 (initial analysis)** | Write all analysis markdown files across the 5 categories (classification, threat assessment, risk scoring, intelligence, documents). | ~12 min |
| **Minutes 27–35 — Pass 2 (read-back & improvement)** | Read every analysis file completely, expand shallow sections, add evidence citations and confidence labels, cross-reference files. | ~8 min |
| **Minutes 35–40 — Pass 3 (cross-run diff + scenario stress)** | Locate the latest prior analysis folder by listing `analysis/daily/*/{type}-run*/` (excluding the current run's folder) and selecting the most recent earlier folder; if none exists within the last 7 days, consult repo-memory editorial context instead. Write `intelligence/cross-run-diff.md` documenting: what changed since prior run, what is new incremental intelligence, what hypotheses are now confirmed/refuted, what scenario probabilities have shifted. Stress-test each coalition/risk scenario with ≥1 alternate-probability scenario. | ~5 min |
| **Minutes 40–45 — Pass 4 (forward-monitoring extension)** | Extend the synthesis file with a **Forward Monitoring Priorities** section listing ≥5 specific, dated, observable indicators to watch before the next scheduled run. Append **Data-Quality Delta** notes documenting any API feed degradation vs prior runs. | ~5 min |
| **Minutes 45–48** | Validate analysis files (line counts, confidence labels present, zero placeholders remain). | 3 min |
| **Minutes 48–50** | Create analysis-only PR via `safeoutputs___create_pull_request`. | 2 min |

**Quality gates for analysis-only PRs (all MUST be met before PR creation):**
- [ ] ≥7 analysis files written (classification/significance-scoring, risk-scoring/risk-matrix, threat-assessment/political-threat-landscape, intelligence/quantitative-swot, intelligence/coalition-dynamics, documents/document-analysis-index, intelligence/synthesis-summary)
- [ ] `intelligence/cross-run-diff.md` present comparing against the latest prior run (if one exists within 7 days)
- [ ] Every SWOT quadrant has ≥3 entries of ≥80 words each with evidence and confidence label
- [ ] ≥5 forward monitoring priorities with concrete observable triggers
- [ ] Data-quality delta documented for any feed that returned 404/empty/timeout
- [ ] Zero `[AI_ANALYSIS_REQUIRED]` markers in any analysis file
- [ ] Total agent active runtime ≥45 minutes (record `ELAPSED_MINUTES` in synthesis footer)

> **🚫 ANALYSIS-ONLY EARLY-EXIT VIOLATION**: Creating an analysis-only PR before minute 45 of elapsed agent time. If you reach minute 30 with all 7 files written and quality gates met, **do not stop** — proceed to Pass 3 (cross-run diff) and Pass 4 (forward monitoring). There is always more depth to add.

---

## ⏰ HARD DEADLINE — Session Expiry Prevention (All Workflows — NON-NEGOTIABLE)

> **⚠️ ABSOLUTE RULE**: The workflow MUST produce a safe output (`safeoutputs___create_pull_request` or `safeoutputs___noop`) BEFORE the session expires. A workflow that runs the full timeout without calling any safe output tool is a **TOTAL FAILURE** — worse than a noop, because it wastes compute and produces zero observable output.

### 🚨 HARD DEADLINE (10 minutes before workflow timeout)

**The hard deadline is 10 minutes before the workflow's `timeout-minutes`:**
- **60-minute workflows**: Hard deadline at **minute 50**
- **120-minute workflows**: Hard deadline at **minute 100**

**At the hard deadline, you MUST:**

1. **STOP all analysis, article generation, and quality improvement immediately**
2. **If article files exist in `news/`**: Call `safeoutputs___create_pull_request` with whatever content you have — partial content in a PR is infinitely better than no PR at all
3. **If no article files exist but analysis files exist**: Call `safeoutputs___create_pull_request` with analysis artifacts only (per Rule 5: no workflow run should be wasted)
4. **If no files of any kind exist**: Call `safeoutputs___noop` with full diagnostics
5. **If a checkpoint PR was already created** (e.g., news-motions creates one at minute ~3): The hard deadline is already satisfied — finalize remaining work without calling safeoutputs again

> **⚠️ OVERRIDE RULE**: This hard deadline **supersedes** any later time-budget or minute-by-minute plan entries that schedule PR creation after the deadline (e.g., "Minutes 57–60: Create PR"). Those later schedule entries must be treated as compressed into the deadline window. After the deadline, the only valid actions are immediate `safeoutputs___create_pull_request` or `safeoutputs___noop`.

### 🔄 Periodic Clock Checks (MANDATORY)

**Check elapsed time at EVERY phase transition:**
- After data retrieval phase → check clock
- After analysis Pass 1 → check clock
- After analysis Pass 2 → check clock
- After article generation Pass 1 → check clock
- After article generation Pass 2 → check clock
- After validation → check clock

**Initialize `WORKFLOW_START_EPOCH` once at workflow start** (in the first bash block or Date Context Establishment), then persist it across blocks via `$GITHUB_ENV` or a temp file:

```bash
# --- Run ONCE at workflow start (e.g., Date Context Establishment) ---
WORKFLOW_START_EPOCH=$(date -u +%s)
echo "WORKFLOW_START_EPOCH=$WORKFLOW_START_EPOCH" >> "$GITHUB_ENV"
echo "$WORKFLOW_START_EPOCH" > /tmp/workflow_start_epoch

# --- Run at EVERY phase transition to check elapsed time ---
# Read the persisted start time (GITHUB_ENV or temp file fallback)
WORKFLOW_START_EPOCH="${WORKFLOW_START_EPOCH:-$(cat /tmp/workflow_start_epoch 2>/dev/null || date -u +%s)}"
# HARD_DEADLINE_MINUTES MUST be set explicitly by each workflow:
#   60-minute workflows:  HARD_DEADLINE_MINUTES=50
#   120-minute workflows: HARD_DEADLINE_MINUTES=100
# If not set, this snippet will ERROR to prevent silent misconfiguration.
if [ -z "${HARD_DEADLINE_MINUTES:-}" ]; then
  echo "❌ ERROR: HARD_DEADLINE_MINUTES not set. Set to 50 (60-min) or 100 (120-min)."
  HARD_DEADLINE_MINUTES=50  # safe fallback for 60-min workflows
fi
ELAPSED_MINUTES=$(( ($(date -u +%s) - WORKFLOW_START_EPOCH) / 60 ))
echo "⏰ Elapsed: ${ELAPSED_MINUTES} minutes (hard deadline: ${HARD_DEADLINE_MINUTES})"
if [ "$ELAPSED_MINUTES" -ge "$HARD_DEADLINE_MINUTES" ]; then
  echo "🚨 HARD DEADLINE REACHED — must create PR or noop NOW"
fi
```

### 🛑 Avoid Starting Slow Calls Near Deadline

**After minute 40 (60-min workflows) or minute 90 (120-min workflows):**
- Do NOT initiate new slow feed endpoint calls (events, procedures, documents, committee_docs — these take 30-120+ seconds)
- Do NOT start new deep-fetch calls (`track_legislation`, `get_meeting_decisions`, `get_speeches`)
- Complete any in-progress generation/validation, then proceed to PR creation
- Fast tools (<10s response) are still OK to call if they support the current phase

### ⚡ Progressive Safe Output Strategy

To prevent session expiry from losing all work:
1. **Create analysis-only PR at minute 35** (60-min) or **minute 70** (120-min) if article generation hasn't started — preserve analysis artifacts
2. **Create PR with partial content at the hard deadline** — even a single English article is valuable
3. **Never delay PR creation for "one more improvement"** after the hard deadline — the risk of losing everything outweighs the benefit of marginal improvement

> **⚠️ CHECKPOINT PR PATTERN** (used by news-motions): If a workflow creates a checkpoint PR early (~minute 3), all subsequent file changes are automatically captured. In this case, the hard deadline requirement is already satisfied — do NOT call safeoutputs again. Just finalize work and stop.

### World Bank MCP Timeout Handling

The `worldbank-mcp@1.0.1` server uses a 10-second HTTP timeout for World Bank API requests (hardcoded `axios` timeout in the server source code). This is separate from the EP MCP `EP_REQUEST_TIMEOUT_MS` setting. If a World Bank call fails or times out:
1. **Skip it and continue** — World Bank data is supplementary context, never primary content
2. **Do NOT retry** failed World Bank calls — they count against your time budget
3. **Maximum 3 World Bank data calls** per 60-minute workflow (search-indicators calls are exempt)
4. **If ALL World Bank calls fail**, proceed without economic context — this is acceptable

---

## 🎭 Stakeholder Perspectives (6-Lens Model)

For every major parliamentary action, analyze from **≥4** of these 6 perspectives (minimum ≥150 words per perspective):

1. **EP Political Groups** — Group dynamics, coalition implications, voting motivations, named MEP positions
2. **Civil Society & NGOs** — Citizens' rights, transparency, democratic participation, specific organization responses
3. **Industry & Business** — Regulatory impact, market effects, compliance burden, sector-specific consequences
4. **National Governments** — Subsidiarity concerns, implementation challenges, diverging national interests with specific countries named
5. **EU Citizens** — Daily life impact, rights, services, representation — make it concrete (e.g., "a Polish nurse seeking work in Germany")
6. **EU Institutions** — Commission/Council/ECB/CJEU inter-institutional dynamics, power shifts, institutional precedent

> **⚠️ DEPTH REQUIREMENT**: Each stakeholder perspective must include: (1) the specific mechanism of impact, (2) evidence from EP data, (3) the stakeholder's likely response or next move. One-sentence perspectives FAIL the quality gate.

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
    npm install --no-save european-parliament-mcp-server@1.2.9
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
MCP Server: european-parliament-mcp-server@1.2.9

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
| `INTERNAL_ERROR` | MCP server internal failure — verify `european-parliament-mcp-server@1.2.9` is installed, check DNS resolution for `data.europarl.europa.eu` |
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
    entrypointArgs: ["-y", "european-parliament-mcp-server@1.2.9", "--timeout", "120000"]
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

> **Note:** All news workflows use `EP_REQUEST_TIMEOUT_MS: "120000"` (120 seconds) to handle slow EP API feed endpoints. Other contexts (e.g., `copilot-setup-steps.yml`, `copilot-mcp.json`) may use shorter timeouts such as 90 seconds. Most EP MCP tools respond in <10 seconds — only slow feed endpoints (events, procedures, documents, committee docs) take 30-120+ seconds. See the [EP MCP Tool Response Times](#ep-mcp-tool-response-times-from-api_usage_guidemd) table in the Pipeline Steps section for detailed timings.

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
3. If still failing → use direct lookup with dateFrom/dateTo or year filter (where supported — see v1.2.9 parameter table)
```

### Direct Endpoint Fallback

```
1. Try get_events_feed({ timeframe: "one-week" })
2. If timeout → get_events({ limit: 20 })  (v1.2.9: no date filtering for events)
```

### Health Gate (Breaking News)

At workflow start, probe EP server health:
1. Call `get_server_health` — check feed availability
2. Call `get_plenary_sessions({ limit: 1 })` — connectivity probe (**⚠️ use `limit: 1` WITHOUT date filters** — date-filtered calls are much slower and may timeout)
3. If DEGRADED → skip `today` timeframe, go straight to `one-week`

---

## 🔌 MCP Tool Reliability Matrix (Verified April 2026)

> **Based on live testing against `european-parliament-mcp-server@1.2.9`**. The EP API at `data.europarl.europa.eu` has inherent latency — feed endpoints (`/feed` path) are consistently slower than direct lookup endpoints. This matrix guides health gate design and fallback escalation.

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
| `get_procedures_feed` | `get_procedures` | `{ limit: 20 }` (v1.2.9: `year` removed) |
| `get_events_feed` | `get_events` | `{ limit: 20 }` (v1.2.9: no date filtering) |
| `get_documents_feed` | `get_plenary_documents` | `{ year: CURRENT_YEAR, limit: 20 }` |
| `get_parliamentary_questions_feed` | `get_parliamentary_questions` | `{ type: "WRITTEN", dateFrom: "YYYY-MM-DD", limit: 20 }` |
| `get_plenary_documents_feed` | `get_plenary_documents` | `{ year: CURRENT_YEAR, limit: 20 }` |
| `get_committee_documents_feed` | `get_committee_documents` | `{ limit: 20 }` (v1.2.9: `year` removed) |
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
| MCP binary not found | `npx -y european-parliament-mcp-server@1.2.9` failed | Ensure `node` is in `network.allowed` (for npm registry) |
| Timeout after 60s | EP API slow + default timeout too low | Verify `EP_REQUEST_TIMEOUT_MS: "120000"` in `mcp-servers` env |
| Timeout after 120s | EP API exceptionally slow (feed endpoints) | Use direct endpoint fallback (see Reliability Matrix) |
| `get_server_health` fails | MCP server process didn't start | Check `npx` output, verify Node.js version ≥18 |
| All tools fail with "connection closed" | MCP stdio transport broken | Restart workflow, check process limits |

---

## 🔗 Cross-References

| Document | Path | Purpose |
|----------|------|---------|
| AI Analysis Guide | `analysis/methodologies/ai-driven-analysis-guide.md` | Master analysis protocol (Rules 1-21) |
| Analysis Templates | `analysis/templates/` | 8 structured output templates |
| Methodology Guides | `analysis/methodologies/` | 6 analytical frameworks |
| Skills Library | `.github/skills/` | Agent skill definitions |
| gh-aw Architecture | `.github/skills/gh-aw-architecture.md` | Workflow compilation guide |
| gh-aw Sandbox | `.github/skills/gh-aw-sandbox.md` | Security model |
| EP Data Skill | `.github/skills/european-parliament-data.md` | EP data reference |
| MCP Integration | `.github/skills/mcp-server-integration.md` | MCP tool usage |
