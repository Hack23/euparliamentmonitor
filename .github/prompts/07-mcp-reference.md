<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 07 — MCP Reference

**Summary:** Single source of truth for EP / IMF / World Bank tool signatures,
parameter corrections, reliability matrix, and timeout strategy. Workflows
**link** here; they never copy these tables.

**Server:** `european-parliament-mcp-server@1.2.19`

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
| `track_legislation` | `procedureId` (e.g., `"2024/0001(COD)"`) | No same-identifier fallback. `get_procedures` requires `processId` (a different identifier, not derivable from `procedureId`); use it as a fallback only when the adopted-text payload exposes `processId` — see [`01-data-collection.md` §3](01-data-collection.md). |
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

> **⚠️ `monitor_legislative_pipeline` period default (Defect #6 — v1.2.13):**
> When invoked **without** `dateFrom`/`dateTo`, v1.2.13 reports
> `period: { from: "2024-01-01", to: "2024-12-31" }` and returns an empty
> pipeline for virtually every call because calendar-2024 procedures are no
> longer active. **Always supply explicit dates in Stage-A calls:**
>
> ```
> monitor_legislative_pipeline({ dateFrom: $LAST_MONTH, dateTo: $TODAY, status: "ACTIVE", limit: 20 })
> ```
>
> For `week-ahead` / `month-ahead` workflows that need a forward-looking window,
> use the next-week or next-month date span instead. The v1.2.14+ upstream fix
> defaults to a rolling last-30-days window and is installed (gateway is
> pinned to `v1.2.19`); explicit dates remain the required Stage-A pattern
> for deterministic reproducibility.

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
| `monitor_legislative_pipeline({})` *(v1.2.13 omitting dates returns 2024 period, empty pipeline)* | `monitor_legislative_pipeline({ dateFrom: $LAST_MONTH, dateTo: $TODAY, status: "ACTIVE", limit: 20 })` |

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

## 8 · IMF (native TypeScript client — sole authoritative economic-context source)

> ### ⚡ Scope
>
> IMF is the **sole authoritative source** for all **economic** context
> — GDP, inflation, unemployment, fiscal balance, debt, trade, FDI,
> monetary, exchange rates, banking soundness. Enforcement is
> editorial/agent-side at Stage-C completeness review.

Client: `src/mcp/imf-mcp-client.ts` (class `IMFMCPClient`).
Transport: direct REST to `https://dataservices.imf.org/REST/SDMX_3.0/`
via `fetch` (no Python MCP dependency). Env vars:
`IMF_API_BASE_URL`, `IMF_API_TIMEOUT_MS`. Probe:
`scripts/imf-mcp-probe.sh`.

| Virtual tool | Method | REST endpoint | Purpose |
|--------------|--------|---------------|---------|
| `imf-list-databases` | `listDatabases` | `GET /dataflow/IMF` | List ~155 SDMX dataflows |
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

## 9 · World Bank (`worldbank-mcp@1.0.1`) — NON-ECONOMIC ONLY

All tools respond in < 5 s; 10 s HTTP timeout per call.

> ### ⚡ Scope
>
> WB serves **non-economic** indicators: health, education,
> social, environment, demographics, defence, agriculture, innovation,
> governance. **Economic context → IMF (§8 above) is the sole
> authoritative source.**
> economic / fiscal / monetary / trade / FDI / exchange-rate / banking
> claim — The legacy
> `get-economic-data` endpoint listed below is retained in the MCP
> server for backward compatibility with old test fixtures only and
> **MUST NOT** be called from new article code paths or analysis
> artifacts. Stage-C `validate-analysis-completeness.js` rejects WB
> economic indicator codes (`NY.GDP.*`, `FP.CPI.*`, `SL.UEM.*`,
> `GC.DOD.*`, `NE.EXP.*`, `NE.TRD.*`, `BX.KLT.*`, …) and "World Bank
> … GDP/inflation/…" prose claims inside `intelligence/economic-
> context.md`.

| Tool | Parameters |
|------|-----------|
| `search-indicators` | `keyword` |
| `get-countries` | `region`, `incomeLevel` |
| `get-country-info` | `countryCode` (ISO2/alpha-3, **individual countries only** — aggregates rejected) |
| `get-economic-data` 🚫 | **Forbidden. **NEVER** call from any new article code path or analysis artifact. Economic context → IMF (§8 above). |
| `get-social-data` | `countryCode`, `indicator`, `years` (POPULATION, LIFE_EXPECTANCY, BIRTH_RATE, DEATH_RATE, INTERNET_USERS) |
| `get-education-data` | `countryCode`, `indicator`, `years` (LITERACY_RATE, SCHOOL_ENROLLMENT, SCHOOL_COMPLETION, TEACHERS_PRIMARY, EDUCATION_EXPENDITURE) |
| `get-health-data` | `countryCode`, `indicator`, `years` (HEALTH_EXPENDITURE, PHYSICIANS, HOSPITAL_BEDS, IMMUNIZATION, HIV_PREVALENCE, MALNUTRITION, TUBERCULOSIS) |

**⚠️ Country-code guard:** WB MCP rejects aggregate codes (`EUU`,
`EMU`, `ECS`, `OED`, `WLD`, `NAC`, `EAS`, `SSF`) and the informal `UK`
alias. Use only the ISO-3166 codes listed in
[`analysis/worldbank/eu-country-mapping.md`](../../analysis/worldbank/eu-country-mapping.md).
The allow-list is enforced as an editorial rule at Stage A. For
EU-level economic context, use IMF `EU`/`EA` aggregates (§8 above).

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

## 11 · Audit-Recurring Items — Triage Table (consult BEFORE filing a defect)

> **Why this exists.** The 2026-04-26 reliability audits (`week-ahead`,
> `week-in-review`, `month-ahead`, `month-in-review`) re-surfaced the same
> 9 EP/WB tool behaviours as "defects". Cross-referencing against the
> `european-parliament-mcp-server` source and `API_USAGE_GUIDE.md`, **only
> 1 of the 9 was a real server bug** (item #1 — `generate_political_landscape`
> 100-MEP sample, fixed upstream in v1.2.15+) — the other 8 are documented
> upstream limitations or consumer-side calling-pattern errors. Authors
> of `intelligence/mcp-reliability-audit.md` (Stage-B artifact) MUST
> consult this table **before** classifying any tool finding as a
> "defect" — items in categories 🟢 LIMITATION or 🔵 CALLING-PATTERN
> are explicitly NOT defects and must be reported as "documented
> behaviour" with the listed mitigation.

| # | Symptom | Tool(s) | Category | Disposition / Calling-pattern fix |
|---|---------|---------|:--------:|-----------------------------------|
| 1 | `generate_political_landscape` returns `totalMEPs: 100` (sampling artifact); seat shares approximate | `generate_political_landscape` | 🔴 REAL BUG | **Fixed upstream in [Hack23/European-Parliament-MCP-Server#405](https://github.com/Hack23/European-Parliament-MCP-Server/pull/405)** — full ~720-MEP roster via `fetchAllCurrentMEPs`, ships in **v1.2.15+** (gateway is pinned to `v1.2.19`). Cross-reference seat shares with `get_all_generated_stats({ category:"political_groups" })` for full-roster validation; the historical ±2 pp drift no longer applies. Do NOT re-file. |
| 2 | `analyze_coalition_dynamics` reports `EPP memberCount: 0`; group appears as `"PPE"` (French) elsewhere; same group split across `EPP`/`PPE`/`Verts-ALE`/`Greens/EFA`/legacy `ID`/`PfE` | `analyze_coalition_dynamics`, `compare_political_groups`, `generate_political_landscape` | 🔵 CALLING-PATTERN | **Treat as a calling-pattern issue for triage purposes.** Always pass canonical English short codes — `["EPP","S&D","Renew","Greens/EFA","ECR","PfE","Left","NI"]`. Never pass `"PPE"`, `"Verts-ALE"`, `"ID"`, or full group names. **Historical note:** alias normalization was also fixed upstream in [#405](https://github.com/Hack23/European-Parliament-MCP-Server/pull/405) via `normalizePoliticalGroup` in `aggregateByGroup` (collapses `PPE → EPP`, `Verts-ALE → Greens/EFA`, legacy `ID → PfE`), shipping in **v1.2.15+**. Do NOT re-file. |
| 3 | `analyze_coalition_dynamics` returns `cohesionRate: null`, `defectionRate: null`, `sharedVotes: null` — only `sizeSimilarityScore` populated | `analyze_coalition_dynamics`, `compare_political_groups` | 🟢 LIMITATION | **Documented EP API limitation** — per-MEP roll-call data is not exposed by the EP Open Data Portal. Tool returns size-ratio proxy only. Already in tool schema description. Stage-A guard: emit `coalition_dynamics.cohesion=null` data-quality warning per [`01-data-collection.md` §6 rule 1](01-data-collection.md). Do NOT classify as a defect; classify as `"documented limitation — size-similarity proxy used"`. |
| 4 | `monitor_legislative_pipeline` returns empty pipeline | `monitor_legislative_pipeline` | 🔵 CALLING-PATTERN | **Historical v1.2.13 default-period bug + consumer fix.** Pre-v1.2.14, when invoked **without** `dateFrom`/`dateTo`, the server reported `period: 2024-01-01..2024-12-31` (empty for current procedures). **Always pass explicit dates:** `monitor_legislative_pipeline({ dateFrom: $LAST_MONTH, dateTo: $TODAY, status: "ACTIVE", limit: 20 })`. Forward-looking workflows use the next-week/next-month window. v1.2.14+ defaults to rolling-30-days; gateway is pinned to `v1.2.19`, but explicit dates remain the required calling pattern for reproducibility. Already documented in §4 above + [`01-data-collection.md` §6 rule 6](01-data-collection.md). |
| 5 | `get_procedures` / `get_procedures_feed` return 1972–1990 historical procedures with no current-year content | `get_procedures`, `get_procedures_feed` | 🟢 LIMITATION | **Documented EP API behaviour** — these endpoints serve the historical archive in ID order, not chronological. The feed has no server-side date filter. **MCP client mitigation (v0.8.47+):** `getProceduresFeed` now detects the historical-only response (all items ≤ 1995) and automatically adds `recessMode: true` and a `RECESS_MODE: …` entry to `dataQualityWarnings[]`; Stage-A consumers should check for this flag and fall back to `get_adopted_texts({ year: $YEAR, limit: 100 })`. **Additional mitigation:** use `track_legislation({ procedureId: "YYYY/NNNN(COD)" })` for individual procedures by known ID. Already in §7 reliability matrix. Do NOT file. |
| 6 | `get_voting_records` returns empty for last 1–2 months; `get_speeches` returns empty for last 1–2 months | `get_voting_records`, `get_speeches` | 🟢 LIMITATION | **Documented EP publication delay** — roll-call data publishes 4–6 weeks late, plenary speeches similarly. Already in tool schema description ("expected EP API behavior, not an error"). **Mitigation:** broaden `dateFrom` to D-60 minimum; use `get_adopted_texts` metadata for vote outcomes; use `get_plenary_documents` as proxy for debate content. Do NOT file. |
| 7 | `get_meeting_foreseen_activities` returns rows with empty `title` strings for future sessions | `get_meeting_foreseen_activities` | 🟢 LIMITATION | **Documented EP API behaviour** — OJQ agenda documents return 404 until publication date for future sessions; activity type and metadata available but titles are populated post-session. **Reliability audit note:** this 🟢-classified behaviour is **excluded from the success-rate denominator** per `analysis/templates/mcp-reliability-audit.md` §5 denominator-exclusion rule (only 🔴 REAL BUG rows count against the score). **Mitigation:** treat as "scheduled count only" data; use plenary calendar + topic context for forward-looking agenda framing. Do NOT file. |
| 8 | `get_events_feed` times out / returns "EP API upstream error" | `get_events_feed` | 🟢 LIMITATION | **Documented slow feed** (30–120s+, see §7 latency table). Tool schema warns: `"events/feed endpoint is significantly slower than other feeds"`. **MCP client mitigation (v0.8.47+):** `getEventsFeed` now downgrades timeout errors to 🟡 `SLOW_FEED_WARNING` — the timeout is recorded in `getSlowFeedWarnings` (not in `getFailedTools`), excluded from the success-rate denominator, and a fallback `{ "feed": [], "slowFeedWarning": true }` is returned so Stage-A consumers can detect the condition and fall back to `get_plenary_sessions({ year })`. **Additional mitigation:** raise `EP_REQUEST_TIMEOUT_MS=120000` for the call. Already in §7. Do NOT file unless timeout exceeds 180 s with `EP_REQUEST_TIMEOUT_MS=120000` set. |
| 9 | `world-bank get-country-info({ countryCode: "EU" })` returns `"Country not found"`; aggregates `EUU`/`EMU`/`ECS`/`OED`/`WLD` rejected | `worldbank-mcp` (any tool with `countryCode`) | 🟢 LIMITATION | **Documented WB MCP limitation** — aggregates not supported. Already in §9 above + [`01-data-collection.md` §4](01-data-collection.md). **Mitigation:** for EU-level economic context use **IMF** `EU`/`EA`/`G7`/`G20` aggregates (§8 — IMF is  primary economic source); for non-economic indicators use individual member-state codes (Big Four: `DE`/`FR`/`IT`/`ES`). Do NOT file. |

**How to use this table in Stage B (`mcp-reliability-audit.md`):**

1. Build the per-tool scoreboard normally (every tool called gets a row).
2. For every row marked degraded/failed, look it up in this table.
3. If the row matches a 🟢 LIMITATION or 🔵 CALLING-PATTERN entry, set `Defect ID` to `"documented behaviour — see 07-mcp-reference.md §11 #N"` and skip the "Issues needing creation" subsection for that finding.
4. **Denominator exclusion:** 🟢/🔵-classified items are **excluded from both numerator and denominator** when computing the success-rate component of the Reliability Index (§5 of `mcp-reliability-audit.md`). Similarly, 🟡 `SLOW_FEED_WARNING` entries for `get_events_feed` are excluded (timeout downgraded to warning by the MCP client — not a reliability failure).
5. Only 🔴 REAL BUG findings (or new symptoms not in this table) appear in §3 "Upstream Issues" with a fileable bug profile.
6. Re-classify obsolete findings: item #1 is **resolved upstream in v1.2.15+** — the gateway is now pinned to v1.2.19, so it should no longer surface in audits. Item #2's alias-fragmentation symptom is similarly suppressed in v1.2.15+ but the canonical-short-code consumer rule remains the primary triage answer at every gateway version.

## 12 · Voting-Data Fallback Decision Tree (D-02)

> **Why this section exists.** All four 2026-04-26 methodology-reflections identified `get_voting_records` returning empty as Defect D-02 — the single largest confidence-grade limiter. Investigation confirmed this is the documented EP publication delay (item #6 above, 🟢 LIMITATION — NOT a server bug). The fix is a fallback to the EP Open Data Portal. The tree below is the canonical calling pattern for every news workflow.

### Decision tree (copy into Stage A for every article type)

```
1. Call get_voting_records({ dateFrom: D-90, dateTo: TODAY, limit: 50 })
   ├── votes array non-empty  →  use MCP result
   │       freshnessLabel = "🟢 MCP (D-90 → TODAY)"
   │
   └── votes array empty (EP publication delay)
           │
           2. Call ep-get-voting-records via getVotingRecordsWithFallback()
              (src/mcp/ep-open-data-client.ts → /api/v2/decision?date-of-vote-start=…)
              ├── Portal has data  →  use Portal result
              │       freshnessLabel = "🟡 EP Open Data Portal fallback (…→…)"
              │       MUST add CC BY 4.0 attribution in §7 of voting-patterns.md
              │       MUST widen WEP bands +5 pp (less uncertainty than both-empty)
              │
              └── Portal also empty (window within 4–6 week delay AND no published data)
                      use 🔴 unavailability marker
                      freshnessLabel = "🔴 voting data unavailable for window …→…"
                      MUST flag every coalition cohesion claim LOW per
                      osint-tradecraft-standards.md §3.1
                      MUST widen WEP bands +10 pp
```

### How to invoke the fallback in a workflow bash block

```bash
# Stage A — always run this after get_voting_records returns
# (no shell expansion patterns — use explicit if/else, not ${VAR:-$(cmd)})
MCP_VOTES=$(get_voting_records_result)
if [ -z "$MCP_VOTES" ] || echo "$MCP_VOTES" | grep -Eq '"votes"[[:space:]]*:[[:space:]]*\[[[:space:]]*\]'; then
  # Activate EP Open Data Portal fallback
  # In TypeScript: call getVotingRecordsWithFallback(mcpResult, { dateFrom, dateTo })
  FALLBACK_ACTIVE=true
fi
```

### Per-artifact freshness row format (paste into voting-patterns.md §7)

| Field | Value when MCP ok | Value when fallback active | Value when both empty |
|-------|-------------------|---------------------------|----------------------|
| Data source | `mcp` | `ep-open-data-portal` | `unavailable` |
| Freshness label | `🟢 MCP (D-90→TODAY)` | `🟡 EP Open Data Portal fallback (D-90→TODAY)` | `🔴 voting data unavailable for window D-90→TODAY` |
| Attribution | — | CC BY 4.0 (EP Open Data Portal) | — |
| Confidence adj. | none | Admiralty grade C → D for portal data; WEP +5 pp | LOW on all coalition claims; WEP +10 pp |

**Triage classification:** item #6 in the audit-recurring table (🟢 LIMITATION). Activating the fallback is the correct mitigation. Do NOT file upstream against `Hack23/European-Parliament-MCP-Server` — the EP API itself publishes with a delay; the MCP server faithfully reflects that. The fallback path (`EPOpenDataClient`, `getVotingRecordsWithFallback`) lives in `src/mcp/ep-open-data-client.ts`.
