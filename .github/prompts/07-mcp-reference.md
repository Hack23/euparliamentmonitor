<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 07 — MCP Reference

**Summary:** Single source of truth for EP / IMF / World Bank tool signatures,
parameter corrections, reliability matrix, and timeout strategy. Workflows
**link** here; they never copy these tables.

**Server:** `european-parliament-mcp-server@1.2.13`

## 1 · EP Feed Endpoints

Timeframes: `"today"`, `"one-day"`, `"one-week"`, `"one-month"`, `"custom"`
(`"custom"` requires `startDate: YYYY-MM-DD`).

| Tool | Purpose | Key parameters |
|------|---------|----------------|
| `get_adopted_texts_feed` | Adopted legislative texts | `timeframe`, `workType` |
| `get_events_feed` | EP events | `timeframe`, `activityType` |
| `get_procedures_feed` | Procedures | `timeframe`, `processType` |
| `get_meps_feed` | MEP profile updates | `timeframe` |
| `get_documents_feed` | Document updates | `timeframe` |
| `get_plenary_documents_feed` | Plenary documents | `timeframe` |
| `get_committee_documents_feed` | Committee documents | `timeframe` |
| `get_parliamentary_questions_feed` | Parliamentary questions | `timeframe` |
| `get_plenary_session_documents_feed` | Plenary session documents | `timeframe` |
| `get_external_documents_feed` | Non-EP docs (Commission, Council) | `timeframe` |
| `get_corporate_bodies_feed` | Committee/delegation updates | `timeframe` |
| `get_mep_declarations_feed` | MEP financial declarations | `timeframe` |

## 2 · EP Direct-Lookup Endpoints (fallback when a feed fails)

| Tool | Parameters | Fallback for |
|------|-----------|--------------|
| `get_plenary_sessions` | `dateFrom/dateTo`, `year`, `eventId`, `location`, `limit` | (no dedicated feed) |
| `get_events` | `eventId`, `limit` | `get_events_feed` |
| `get_procedures` | `processId`, `limit` | `get_procedures_feed` |
| `get_adopted_texts` | `year`, `docId`, `limit` | `get_adopted_texts_feed` |
| `get_plenary_documents` | `year`, `docId`, `limit` | `get_plenary_documents_feed` |
| `get_committee_documents` | `docId`, `limit` | `get_committee_documents_feed` |
| `get_speeches` | `dateFrom/dateTo`, `speechId`, `limit` | (no feed) |
| `get_parliamentary_questions` | `type`, `dateFrom/dateTo`, `author`, `topic`, `status`, `docId`, `limit` | `get_parliamentary_questions_feed` |
| `get_mep_details` | `id` (e.g., `"MEP-124810"`) | — |
| `get_meps` | `country`, `group`, `committee`, `active`, `limit`, `offset` | `get_meps_feed` |
| `get_mep_declarations` | `year`, `docId` | `get_mep_declarations_feed` |
| `get_committee_info` | `abbreviation`, `id`, `showCurrent` | — |
| `search_documents` | `keyword`, `documentType`, `committee`, `dateFrom/dateTo` | — |
| `track_legislation` | `procedureId` (e.g., `"2024/0001(COD)"`) | — |
| `get_procedure_events` | `processId` | — |
| `get_procedure_event_by_id` | `processId`, `eventId` | — |
| `get_meeting_decisions` | `sittingId` | — |
| `get_meeting_activities` | `sittingId` | — |
| `get_meeting_foreseen_activities` | `sittingId` | — |
| `get_meeting_plenary_session_documents` | `sittingId` | — |
| `get_meeting_plenary_session_document_items` | `sittingId` | — |
| `get_plenary_session_documents` | `docId`, `limit` | `get_plenary_session_documents_feed` |
| `get_plenary_session_document_items` | `limit`, `offset` | — |
| `get_external_documents` | `docId`, `limit` | `get_external_documents_feed` |
| `get_controlled_vocabularies` | `vocId`, `limit` | `get_controlled_vocabularies_feed` |
| `get_current_meps` | `limit`, `offset` | — |
| `get_incoming_meps` | `limit`, `offset` | — |
| `get_outgoing_meps` | `limit`, `offset` | — |
| `get_homonym_meps` | `limit`, `offset` | — |

## 3 · EP Analytical Tools (AI-powered)

| Tool | Parameters |
|------|-----------|
| `get_voting_records` | `sessionId`, `mepId`, `topic`, `dateFrom/dateTo`, `limit`, `offset` |
| `analyze_voting_patterns` | `mepId`, `dateFrom/dateTo`, `compareWithGroup` |
| `analyze_coalition_dynamics` | `groupIds`, `dateFrom/dateTo`, `minimumCohesion` |
| `detect_voting_anomalies` | `groupId`, `mepId`, `dateFrom/dateTo`, `sensitivityThreshold` |
| `compare_political_groups` | `groupIds` (min 2), `dimensions`, `dateFrom/dateTo` |
| `assess_mep_influence` | `mepId`, `includeDetails`, `dateFrom/dateTo` |
| `analyze_legislative_effectiveness` | `subjectType`, `subjectId` |
| `generate_political_landscape` | `dateFrom/dateTo` |
| `early_warning_system` | `sensitivity`, `focusArea` |
| `get_all_generated_stats` | `category`, `yearFrom/yearTo` (precomputed — no live EP call) |

## 4 · EP Specialized Tools

`analyze_country_delegation`, `track_mep_attendance`, `analyze_committee_activity`,
`monitor_legislative_pipeline`, `network_analysis`, `correlate_intelligence`,
`sentiment_tracker`, `comparative_intelligence`, `generate_report`
(MEP activity / committee performance / voting / legislation reports).

## 5 · Common Parameter Mistakes (v1.2.13)

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `get_plenary_sessions({ startDate, endDate })` | `get_plenary_sessions({ dateFrom, dateTo })` |
| `get_parliamentary_questions({ startDate })` | `get_parliamentary_questions({ dateFrom })` |
| `search_documents({ query: "climate" })` | `search_documents({ keyword: "climate" })` |
| `get_adopted_texts_feed({ timeframe: "three-months" })` | Use `"one-month"` |
| `compare_political_groups({ groups: […] })` | `compare_political_groups({ groupIds: […] })` |
| `get_voting_records({ topic })` (unbounded) | `get_voting_records({ sessionId, limit: 50 })` or add `dateFrom/dateTo` |
| `get_mep_details({ name: "Weber" })` | `get_mep_details({ id: "MEP-124810" })` |
| `get_events({ year, dateFrom, dateTo })` | `get_events({ limit: 50 })` (EP API removed date filters) |
| `get_procedures({ year })` | `get_procedures({ limit: 50 })` |
| `get_speeches({ year })` | `get_speeches({ dateFrom, dateTo })` |
| `get_committee_documents({ year })` | `get_committee_documents({ limit: 50 })` |
| `get_external_documents({ year })` | `get_external_documents({ limit: 50 })` |

## 6 · EP Reliability Matrix

**✅ Reliable (< 30s, use as health probes):** `get_server_health({})`,
`get_all_generated_stats({ category:"all" })`, `get_current_meps({ limit:1 })`,
`get_plenary_sessions({ limit:1 })` (no date filters!),
`get_adopted_texts({ year, limit:3 })`, `get_adopted_texts_feed({ timeframe:"one-week" })`,
`get_meps_feed({ timeframe:"one-week" })`,
`get_speeches({ dateFrom, dateTo, limit:3 })`, `generate_political_landscape({})`,
`analyze_coalition_dynamics({})`, `early_warning_system({ focusArea:"all" })`.

**⏱️ Frequently slow (> 60s — use fallbacks):** `get_procedures_feed` →
`get_procedures({ limit:20 })`; `get_events_feed` → `get_events({ limit:20 })`;
`get_documents_feed` → `get_plenary_documents({ year, limit:20 })`;
`get_parliamentary_questions_feed` → `get_parliamentary_questions({ type:"WRITTEN", dateFrom, limit:20 })`;
`get_plenary_documents_feed` → `get_plenary_documents({ year, limit:20 })`;
`get_committee_documents_feed` → `get_committee_documents({ limit:20 })`;
`get_plenary_sessions` (with dates) → same tool without date filters.

## 7 · Response-Time Guide

| Category | Latency | Examples |
|----------|---------|----------|
| Fast endpoint | < 5 s | `get_adopted_texts`, `get_plenary_sessions` (no dates), `get_controlled_vocabularies` |
| Fast feed | ~ 1 s | `get_adopted_texts_feed`, `get_mep_declarations_feed`, `get_external_documents_feed` |
| Medium feed | ~ 9 s | `get_meps_feed` |
| OSINT / analysis (cached) | < 5 s | `analyze_coalition_dynamics`, `generate_political_landscape`, `early_warning_system`, `get_all_generated_stats` |
| Deep-fetch | 5–30 s | `track_legislation`, `get_voting_records`, `get_speeches`, `get_meeting_decisions` |
| Slow feed | 30–120+ s ⚠️ | `get_events_feed`, `get_procedures_feed`, `get_documents_feed`, `get_plenary_documents_feed`, `get_committee_documents_feed`, `get_corporate_bodies_feed` |

Rate limit: 500 req / 5 min. Cached responses < 200 ms.

## 8 · IMF (native TypeScript client — PRIMARY economic-context source, Wave-3)

> ### ⚡ Scope (Wave-3)
>
> IMF is the **sole authoritative source** for all **economic** context
> — GDP, inflation, unemployment, fiscal balance, debt, trade, FDI,
> monetary, exchange rates, banking soundness. Enforcement is
> editorial/agent-side (Stage-C completeness review); the legacy
> runtime gate in `src/utils/content-validator.ts` was purged in the
> April-2026 aggregator-pipeline migration.

Client: `src/mcp/imf-mcp-client.ts` (class `IMFMCPClient`).
Transport: direct REST to `https://dataservices.imf.org/REST/SDMX_3.0/`
via `fetch` (no Python MCP dependency). Env vars:
`IMF_API_BASE_URL`, `IMF_API_TIMEOUT_MS`. Probe:
`scripts/imf-mcp-probe.sh`.

| Virtual tool | Method | REST endpoint | Purpose |
|--------------|--------|---------------|---------|
| `imf-list-databases` | `listDatabases()` | `GET /dataflow/IMF` | List ~155 SDMX dataflows |
| `imf-search-databases` | `searchDatabases(keyword)` | dataflow list + filter | Find a database by keyword |
| `imf-get-parameter-defs` | `getParameterDefs(dbId)` | `GET /datastructure/{id}` | SDMX data-structure definition |
| `imf-get-parameter-codes` | `getParameterCodes(db, dim, search?)` | `GET /datastructure/{id}?references=codelist` | Codelist for a dimension |
| `imf-fetch-data` | `fetchData({ databaseId, startYear, endYear, filters })` | `GET /data/{df}/{key}` | Fetch a time series |

**Scope references:**
- [`analysis/imf/database-directory.md`](../../analysis/imf/database-directory.md) — full 155-database relevance map
- [`analysis/imf/indicator-catalog.md`](../../analysis/imf/indicator-catalog.md) — 80 indicators by domain
- [`analysis/imf/sdmx-dimensions-reference.md`](../../analysis/imf/sdmx-dimensions-reference.md) — SDMX 3.0 dimensions
- [`analysis/imf/release-calendar.md`](../../analysis/imf/release-calendar.md) — vintage SLAs
- [`analysis/imf/forecast-accuracy-baseline.md`](../../analysis/imf/forecast-accuracy-baseline.md) — optimism-bias bands
- [`analysis/imf/cross-source-triangulation.md`](../../analysis/imf/cross-source-triangulation.md) — ECB/Eurostat/OECD cross-checks
- [`analysis/methodologies/imf-indicator-mapping.md`](../../analysis/methodologies/imf-indicator-mapping.md) — validator wiring, per-type indicator floors

**Country codes**: aggregates `EU`, `EA`, `G7`, `G20` all accepted
(unlike WB MCP). See
[`analysis/imf/eu-country-mapping.md`](../../analysis/imf/eu-country-mapping.md).

**Per-article-type indicator minimums** (editorial policy — Stage-C
completeness review): committee-reports/ECON ≥ 4, /BUDG ≥ 3,
/INTA ≥ 3; week-ahead/month-ahead/monthly-review ≥ 2; breaking /
weekly-review / motions / propositions ≥ 1.

## 9 · World Bank (`worldbank-mcp@1.0.1`) — NON-ECONOMIC only (Wave-3)

All tools respond in < 5 s; 10 s HTTP timeout per call.

> ### ⚡ Scope (Wave-3)
>
> WB serves **non-economic** indicators only: health, education,
> social, environment, demographics, defence, agriculture, innovation,
> governance. **Economic context → IMF (§9 below) is mandatory
> primary.** Wave-3 retains the WB economic endpoints in MCP but marks
> them legacy; Wave-4 will remove them from the policy-required
> article code path.

| Tool | Parameters |
|------|-----------|
| `search-indicators` | `keyword` |
| `get-countries` | `region`, `incomeLevel` |
| `get-country-info` | `countryCode` (ISO2/alpha-3, **individual countries only** — aggregates rejected) |
| `get-economic-data` ⚠️ | **Wave-3 legacy** — retained for test fixtures only; do NOT call from new article code paths (economic context → IMF). |
| `get-social-data` | `countryCode`, `indicator`, `years` (POPULATION, LIFE_EXPECTANCY, BIRTH_RATE, DEATH_RATE, INTERNET_USERS) |
| `get-education-data` | `countryCode`, `indicator`, `years` (LITERACY_RATE, SCHOOL_ENROLLMENT, SCHOOL_COMPLETION, TEACHERS_PRIMARY, EDUCATION_EXPENDITURE) |
| `get-health-data` | `countryCode`, `indicator`, `years` (HEALTH_EXPENDITURE, PHYSICIANS, HOSPITAL_BEDS, IMMUNIZATION, HIV_PREVALENCE, MALNUTRITION, TUBERCULOSIS) |

**⚠️ Country-code guard:** WB MCP rejects aggregate codes (`EUU`,
`EMU`, `ECS`, `OED`, `WLD`, `NAC`, `EAS`, `SSF`) and the informal `UK`
alias. Call `isMCPSupportedWBCountryCode()` from
`src/utils/world-bank-data.ts` before every MCP invocation — see
[`analysis/worldbank/eu-country-mapping.md`](../../analysis/worldbank/eu-country-mapping.md).
For EU-level economic context, use IMF `EU`/`EA` aggregates (§8
above).

Max 3 data calls per 60-min workflow (search-indicators exempt).
Failures are skipped, not retried.

## 10 · Health Gate (standard sequence)

1. `get_server_health({})` — confirms MCP server alive
2. `get_plenary_sessions({ limit:1 })` — confirms EP API reachable (NO date filters)
3. `get_adopted_texts_feed({ timeframe:"one-week" })` — confirms feed layer
4. Fallback if step 2 fails: `get_current_meps({ limit:1 })`
5. Fallback if both fail: `get_all_generated_stats({ category:"all" })` → MCP
   server works but EP API is down → ship analysis-only PR with precomputed
   stats instead of noop.
