<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 07 — MCP Reference

**Summary:** Single source of truth for EP / World Bank / IMF tool signatures,
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

## 8 · World Bank (`worldbank-mcp@1.0.1`)

All tools respond in < 5 s; 10 s HTTP timeout per call.

> ### ⚡ Scope (Wave 2)
>
> WB serves **non-economic** indicators only: health, education, social,
> environment, demographics, defence, agriculture, innovation,
> governance. **Economic context → IMF (§9 below).**

| Tool | Parameters |
|------|-----------|
| `search-indicators` | `keyword` |
| `get-countries` | `region`, `incomeLevel` |
| `get-country-info` | `countryCode` (ISO2/alpha-3, **individual countries only** — aggregates rejected) |
| `get-economic-data` ⚠️ | `countryCode`, `indicator`, `years` (GDP, GDP_GROWTH, GDP_PER_CAPITA, GNI, GNI_PER_CAPITA, EXPORTS_GDP, FDI_NET, INFLATION, UNEMPLOYMENT) — **⚠️ Economic context moved to IMF (§9). Retained for legacy mode only.** |
| `get-social-data` | `countryCode`, `indicator`, `years` (POPULATION, LIFE_EXPECTANCY, BIRTH_RATE, DEATH_RATE, INTERNET_USERS) |
| `get-education-data` | `countryCode`, `indicator`, `years` (LITERACY_RATE, SCHOOL_ENROLLMENT, SCHOOL_COMPLETION, TEACHERS_PRIMARY, EDUCATION_EXPENDITURE) |
| `get-health-data` | `countryCode`, `indicator`, `years` (HEALTH_EXPENDITURE, PHYSICIANS, HOSPITAL_BEDS, IMMUNIZATION, HIV_PREVALENCE, MALNUTRITION, TUBERCULOSIS) |

**⚠️ Country-code guard:** WB MCP rejects aggregate codes (`EUU`,
`EMU`, `ECS`, `OED`, `WLD`, `NAC`, `EAS`, `SSF`) and the informal `UK`
alias. Call `isMCPSupportedWBCountryCode()` from
`src/utils/world-bank-data.ts` before every MCP invocation — see
[`analysis/worldbank/eu-country-mapping.md`](../../analysis/worldbank/eu-country-mapping.md).
For EU-level economic context, use IMF `EU`/`EA` aggregates (§9 below).

Max 3 data calls per 60-min workflow (search-indicators exempt). Failures are
skipped, not retried.

## 9 · IMF (native TypeScript client, not MCP)

**Scope:** the authoritative source for all **economic** context —
GDP, inflation, unemployment, fiscal balance, debt, trade, FDI,
monetary, exchange rates — per the Wave-2 WB↔IMF split (see §8).

Client: `src/mcp/imf-mcp-client.ts` (class `IMFMCPClient` kept for compat).
Transport: direct REST to `https://dataservices.imf.org/REST/SDMX_3.0/` via
`fetch`. Env vars: `IMF_API_BASE_URL`, `IMF_API_TIMEOUT_MS`. Probe:
`scripts/imf-mcp-probe.sh`. Indicator map:
[`imf-indicator-mapping.md`](../../analysis/methodologies/imf-indicator-mapping.md).
Country codes: [`analysis/imf/eu-country-mapping.md`](../../analysis/imf/eu-country-mapping.md)
(aggregates `EU`, `EA`, `G7`, `G20` all accepted, unlike WB MCP).

## 10 · Health Gate (standard sequence)

1. `get_server_health({})` — confirms MCP server alive
2. `get_plenary_sessions({ limit:1 })` — confirms EP API reachable (NO date filters)
3. `get_adopted_texts_feed({ timeframe:"one-week" })` — confirms feed layer
4. Fallback if step 2 fails: `get_current_meps({ limit:1 })`
5. Fallback if both fail: `get_all_generated_stats({ category:"all" })` → MCP
   server works but EP API is down → ship analysis-only PR with precomputed
   stats instead of noop.
