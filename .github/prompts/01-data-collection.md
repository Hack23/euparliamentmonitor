<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 01 — Data Collection (Stage A)

**Summary:** Fetch EP data first. Use feeds, fall back to direct endpoints.
Download FULL document content, not metadata. Add IMF economic context
(primary) + WB non-economic context (additive) for policy articles.
Stay within the 10-minute budget.

## 1 · Pipeline Position

```
[Stage A: Data Collection] → Stage B: Analysis → Stage C: Gate → Stage D: Article → PR
```

Time budget: **≤ 5 minutes** of a 60-minute workflow (the Stage-A line in every workflow's parameter table; per-slug values authoritative in `src/config/article-horizons.ts`).

## 2 · What to Collect

Every workflow downloads (tools and parameter corrections in
[`07-mcp-reference.md`](07-mcp-reference.md)):

1. **Feed endpoints** with `timeframe: "today"` → fall back to `"one-week"` if
   empty/error/404/timeout.
2. **Direct lookups** — always use these when a feed fails. They query the EP
   database directly and are usually more reliable than feeds.
3. **Deep-fetch (best-effort under budget — prioritised, not exhaustive)** —
   for adopted texts / procedures referenced. The deep-fetch set is
   **best-effort under the budget caps below**, *not* a per-item mandate.
   When the run references more items than the budget allows, apply the
   prioritisation policy in §3a to pick the top N items.

   - `track_legislation({ procedureId })` — status, timeline, committees.
     **404 fallback (identifier types differ):** `track_legislation` takes
     a `procedureId` (e.g. `"2024/0001(COD)"`), while `get_procedures`
     takes a different identifier — `processId`. When `track_legislation`
     returns 404 for a procedure ID extracted from an adopted text, read
     the same adopted-text payload item and extract its `processId` field
     for the fallback direct lookup. **Do not** try to derive `processId`
     by transforming the `procedureId` string — they are not equivalent.
     If the adopted-text item exposes `processId`, call
     `get_procedures({ processId })`. If `track_legislation` returns 404
     and no `processId` is present on that adopted-text item, log the
     `procedureId` under
     `manifest.dataVerification.unresolvedProcedureIds[]` and proceed
     with adopted-text data only — do not abort the run.
   - `get_voting_records({ sessionId, limit: 50 })` — actual vote counts
   - `get_latest_votes({ limit: 20 })` — **near-realtime DOCEO votes** (v1.3.1+, `dataFreshness: NEAR_REALTIME`); use to identify recent group voting patterns when `get_voting_records` returns empty due to EP publication delay
   - `get_meeting_decisions({ sittingId })` — adopted decisions
   - `get_speeches({ dateFrom, dateTo, limit: 20 })` — debate contributions
   - `get_adopted_texts({ year, limit: 100 })` — full text, not titles
   - **Named-MEP cross-reference (best-effort, prioritised):** for MEPs
     named as immunity-waiver subjects, rapporteurs, shadow rapporteurs,
     named defectors or named whips in any adopted text / procedure /
     committee output, call `get_mep_details({ id: "MEP-NNNNNN" })` once
     per named MEP. This gives biographical context (national party,
     committee assignments, prior votes) for stakeholder-map and
     actor-mapping artifacts. Prioritise immunity subjects first, then
     named rapporteurs / shadow rapporteurs, then named defectors. Cap at
     10 MEP-detail calls per run; surplus MEPs go on a "deferred lookup"
     list in `manifest.dataVerification.deferredMepLookups[]`.

   **Budget caps:** up to 10 deep-fetch calls + up to 10 MEP-detail
   calls. When the candidate set exceeds these caps, items not selected
   by §3a are *not* failures — they are deferred and logged under
   `manifest.dataVerification.deferredDeepFetches[]`.

### 3a · Deep-fetch prioritisation policy (which items get the budget)

When the candidate set exceeds the budget caps, score every candidate
item (adopted text / procedure / named MEP) on this 0–10 salience
rubric, then take the top N up to the budget cap:

| Signal | Weight | Score |
|--------|:-----:|------|
| Item appears in the lead / executive-brief candidate list | +4 | 0–4 |
| Item is referenced by ≥2 other already-collected artifacts | +2 | 0–2 |
| Item is a Rule 132 urgency motion or Rule 9 immunity waiver | +2 | 0–2 |
| Item is a binding act (REGULATION / DIRECTIVE / DECISION) vs. non-binding RESOLUTION | +1 | 0–1 |
| Item touches a Tier-1 economic indicator named in IMF minimums for this article type | +1 | 0–1 |

**Rules:**
- Always include every item referenced by the lead story / executive
  brief candidate, even if that consumes most of the budget.
- For named-MEP cross-reference, immunity-waiver subjects are a hard
  must-include (until the budget is exhausted) — they have political
  and legal salience that rapporteurs alone do not.
- Items not selected go to `deferredDeepFetches[]` /
  `deferredMepLookups[]` with their salience score; a follow-up run on
  the same date+type can pick them up first via the prior-run-diff
  carry-forward path.

A run that respects the budget cap and logs deferred items is **not**
incomplete — it is correctly prioritised. Stage C does not penalise
deferred entries; it only penalises lead-story items missing from the
deep-fetch set.
4. **Voting-data fallback (MANDATORY when get_voting_records returns empty)**
   EP roll-call data publishes with a 4–6 week delay (documented in
   `07-mcp-reference.md` §11 item #6). When `get_voting_records` returns an empty
   votes array, **always** activate the EP Open Data Portal fallback before writing
   `voting-patterns.md`:
   - In TypeScript: call `getVotingRecordsWithFallback(mcpResult, { dateFrom, dateTo })`
     from `src/mcp/ep-open-data-client.ts`.
   - This queries `https://data.europarl.europa.eu/api/v2/decision` directly.
   - Copy the returned `freshnessLabel` into `voting-patterns.md` §"Voting Data
     Freshness". If source is `"unavailable"`, flag all coalition claims LOW and
     widen WEP bands +10 pp. See the full decision tree in
     [`07-mcp-reference.md §12`](07-mcp-reference.md).
   - **Attribution:** EP Open Data Portal data is CC BY 4.0. Include the
     attribution string in §7 of every `voting-patterns.md` that uses fallback data.

## 3 · Feed → Direct Fallback (Short Map)

The canonical fallback map and parameter table live in
[`07-mcp-reference.md`](07-mcp-reference.md). In one sentence: if a feed
returns 404/timeout, try the corresponding direct endpoint before giving up.

## 4 · Economic & Non-Economic Context — **IMF primary for economic, WB for non-economic**

Required for articles covering trade, employment, digital/tech, health,
environment/energy, agriculture, housing, migration, defence.

**IMF is the sole authoritative source for
economic context.
not secondary, not fallback)**:

- **Economic / monetary / fiscal / trade / FDI / exchange-rate / banking**
  (GDP, inflation, unemployment, current account, debt, deficit, policy
  rate, REER, FDI, bilateral trade) → **IMF only**. Use
  `imf-fetch-data` — see
  [`analysis/imf/indicator-catalog.md`](../../analysis/imf/indicator-catalog.md),
  [`analysis/imf/database-directory.md`](../../analysis/imf/database-directory.md),
  [`analysis/imf/release-calendar.md`](../../analysis/imf/release-calendar.md),
  and
  [`analysis/methodologies/imf-indicator-mapping.md`](../../analysis/methodologies/imf-indicator-mapping.md).
  Aggregates `EU`, `EA`, `G7`, `G20` are all valid. For Tier-1 articles
  citing high-sensitivity indicators (GDP growth, HICP, gov debt, ECB
  rate, current account), triangulate against ECB SDW / Eurostat /
  OECD per
  [`analysis/imf/cross-source-triangulation.md`](../../analysis/imf/cross-source-triangulation.md).
- **Non-economic** (health, education, social, environment,
  demographics, defence, agriculture, innovation, governance) → **World
  Bank only**. Use `get-social-data`, `get-health-data`,
  `get-education-data`, or the raw-REST `search-indicators` path — see
  [`analysis/worldbank/indicator-catalog.md`](../../analysis/worldbank/indicator-catalog.md)
  and
  [`analysis/methodologies/worldbank-indicator-mapping.md`](../../analysis/methodologies/worldbank-indicator-mapping.md).
  **Do NOT** pass aggregate codes (`EUU`, `EMU`, `ECS`, `OED`, `WLD`,
  `NAC`, `EAS`, `SSF`) to the WB MCP — the server rejects them with
  `Error: Country not found`. Use individual member-state codes or cite
  IMF `EU`/`EA` for any EU-level framing.
  **Member-state proxy defaults (positive guidance):** when an EU-level
  framing is desired but WB rejects the aggregate, default to the
  Big-Four (`DE`, `FR`, `IT`, `ES`) plus topic-specific affected states:
  - Migration / external border → `IT`, `ES`, `EL`, `PL`, `HU`
  - Energy / Russia exposure / Eastern flank → `PL`, `RO`, `LT`, `LV`, `EE`
  - Defence / NATO Eastern flank → `PL`, `RO`, `LT`, `LV`, `EE`, `FI`, `SE`
  - Rule-of-law / immunity proceedings → use the named MEPs' national
    member-state codes (e.g. `PL` for Polish-MEP immunity files)
  - Eurozone / banking → `DE`, `FR`, `IT`, `ES`, `NL`, `IE`
  - Agriculture / CAP → `FR`, `PL`, `ES`, `RO`, `IT`
  Cite IMF aggregates (`EU`/`EA`) for the EU-level economic frame and
  the WB member-state proxy for the non-economic distributional detail.
  Never silently substitute one member state as a stand-in for the EU
  aggregate without naming it as a proxy in prose.
- **Per-article-type IMF minimums** (editorial policy — enforced at
  Stage-C completeness gate):
  committee-reports/ECON ≥ 4 indicators, /BUDG ≥ 3, /INTA ≥ 3;
  week-ahead / month-ahead / monthly-review ≥ 2;
  breaking / weekly-review / motions / propositions ≥ 1. Full table in
  [`analysis/methodologies/imf-indicator-mapping.md §8`](../../analysis/methodologies/imf-indicator-mapping.md).
- Connectivity probes: `source scripts/wb-mcp-probe.sh` and
  `scripts/imf-mcp-probe.sh` after `scripts/mcp-setup.sh`. The IMF probe
  uses the shared `fetch-proxy` MCP gateway first (`FETCH_MCP_GATEWAY_URL`)
  and direct HTTPS only as a local/non-AWF fallback. The probe summary JSON
  includes a `"gatewayStatus"` field that distinguishes infrastructure failures
  (e.g. `"error:gateway-post-failed(exit=7)"`) from genuine IMF outages
  (`"ok"` with `"available":false`). If `gatewayStatus` reports an error, fix
  the shared MCP component rather than treating IMF as unavailable. For
  `week-in-review`, `month-in-review`, `week-ahead`, and `month-ahead`, start
  the IMF probe in the background at the beginning of Stage A and cache its JSON
  under `${ANALYSIS_DIR}/cache/imf/` while EP MCP calls continue. The probe
  always exits 0; `{"available": false}` is a provenance signal, not a Stage-A
  abort condition.
- Editorial rule: **IMF is the sole authoritative source** for
  every economic / fiscal / monetary / trade / FDI / exchange-rate / banking-soundness
  claim.
  not secondary, not fallback). World Bank may be cited only as corroborating
  evidence for non-economic indicators (health, education, social,
  environment, demographics, defence, agriculture, innovation,
  governance). WB `Country not found` responses for EU-level aggregate codes
  are expected: switch to IMF `EU`/`EA` aggregates for
  economic framing and use WB for member-state non-economic data. Stage
  C fails any `economic-context.md` that cites IMF figures from agent
  knowledge without `cache/imf/*.json`, and rejects any WB economic
  indicator code (`NY.GDP.*`, `FP.CPI.*`, `SL.UEM.*`, `GC.DOD.*`,
  `NE.EXP.*`, `NE.TRD.*`, `BX.KLT.*`, …) or "World Bank … GDP/inflation/…"
  prose claim inside `intelligence/economic-context.md`.
- Forecast labelling: every IMF projection prose MUST include
  "forecast"/"projection"/"projects"/"expects" within 30 words of the
  number (regex-enforced), AND the section MUST carry
  `data-vintage="WEO-April-2026"` on the `<section class="economic-context">`
  element. See
  [`analysis/imf/forecast-accuracy-baseline.md`](../../analysis/imf/forecast-accuracy-baseline.md)
  for horizon-dependent optimism-bias caveats.

Integration requirements:
1. Use the native IMF client virtual methods (`imf-search-databases`,
   `imf-fetch-data`) through `src/mcp/imf-mcp-client.ts` or the cached probe
   files; do not call a non-existent IMF MCP server. Call
   `imf-search-databases` first to discover the best database (or
   `search-indicators` for WB non-economic).
2. Fetch ≥ 2 EU countries (Big Four `DE`/`FR`/`IT`/`ES` or affected
   member states) or use an IMF aggregate (`EU`/`EA`).
3. Surface data inside analytical prose (≥ 60 words).
4. Include ≥ 1 `<canvas data-chart-config="…">` generated by
   `buildDashboardSection`.
5. Every IMF citation carries the vintage string
   (`IMF WEO April 2026`, `IMF Fiscal Monitor April 2026`) in prose.
6. Bridge every economic indicator to a named EP file, committee, procedure,
   vote, or stakeholder pressure. A standalone macro paragraph with no EP
   political mechanism fails Stage C even when it cites IMF correctly.
7. When IMF is unavailable, **do not substitute World Bank GDP, inflation,
   unemployment, fiscal, trade, FDI, exchange-rate, or banking indicators as
   economic proxies**. Mark the run IMF-degraded, cite the saved probe error,
   and either proceed without quantitative economic claims (where allowed) or
   stop with `ANALYSIS_ONLY` for ECON/BUDG/INTA scoped runs.

## 5 · Data Verification Manifest

Every `manifest.json` records what was successfully downloaded:

```json
{
  "dataVerification": {
    "adoptedTextsDownloaded": true,
    "votingRecordsFetched": false,
    "meetingDecisionsFetched": false,
    "procedureDetailsTracked": ["2025/0261(COD)"],
    "speechesFetched": false,
    "committeeDocumentsFetched": false,
    "reason": "Feeds returned 404; direct endpoints used as fallback"
  }
}
```

### 5.1 · Data Mode Declaration (MANDATORY)

The manifest **MUST** include a top-level `dataMode` field declaring the
data-availability state of the run. This drives threshold adjustments in
Stage C — the validator reduces line floors for structurally constrained runs.

**Stage A — `data-availability-assessment` first:** Before writing any analysis artifact, produce `data-availability-assessment.md` in the run root. This artifact records the triage result for every data source (EP MCP endpoints, IMF SDMX, DOCEO XML, World Bank) and sets the `manifest.dataMode` field. Template: [`analysis/templates/data-availability-assessment.md`](../../analysis/templates/data-availability-assessment.md). When `dataMode = "degraded-voting"`, use [`analysis/templates/intelligence/voting-patterns.degraded.md`](../../analysis/templates/intelligence/voting-patterns.degraded.md) instead of the standard `voting-patterns.md`. When `dataMode = "degraded-imf"`, use [`analysis/templates/intelligence/economic-context.fallback.md`](../../analysis/templates/intelligence/economic-context.fallback.md) instead of `economic-context.md`.

| `dataMode` value | When to set | Line-floor reduction |
|------------------|-------------|---------------------|
| `"full"` | All primary sources (EP MCP, IMF, voting records) available | 0% (default) |
| `"title-only"` | Adopted texts available by title/reference only; full text not yet published (3–7 day EP delay) | 25% |
| `"degraded-imf"` | IMF SDMX unreachable; Eurostat used as triangulation fallback (WB remains non-economic only) | 15% |
| `"degraded-voting"` | Roll-call data unavailable (4–6 week EP publication lag); coalition analysis uses structural proxies only | 15% |
| `"minimal"` | Multiple data sources unavailable (combine title-only + degraded-imf + degraded-voting) | 35% |

**Decision logic** (Stage A exit checklist):
1. If `cache/imf/imf-probe-summary.json` contains `{"available": false}` → at minimum `"degraded-imf"`
2. If `getVotingRecordsWithFallback` returns `unavailable` → at minimum `"degraded-voting"`
3. If adopted texts fetched but all full-text URLs return 404 → at minimum `"title-only"`
4. If ≥2 of the above conditions apply → `"minimal"`
5. Otherwise → `"full"`

Set `dataMode` **at the end of Stage A** so Stage B and C can adapt.
Every artifact produced under a non-`"full"` dataMode MUST flag the
limitation in prose (confidence levels reduced, explicit caveat paragraph).

```json
{
  "articleType": "breaking",
  "dataMode": "degraded-imf",
  "dataVerification": { "..." }
}
```

### 5.2 · Eurostat Triangulation Fallback (when IMF degraded)

When IMF SDMX is unreachable (`dataMode: "degraded-imf"` or `"minimal"`),
attempt Eurostat as a secondary economic triangulation source. Do NOT fall
back to World Bank for economic data (Stage C rejects WB economic claims):

1. **Eurostat SDMX endpoint** (via `web-fetch` tool):
   `https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/{datasetCode}/{filter}?format=JSON`
   - Key datasets: `namq_10_gdp` (GDP), `prc_hicp_manr` (HICP),
     `une_rt_m` (unemployment), `gov_10dd_edpt1` (government debt)
   - Example: `https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/namq_10_gdp/Q.SCA.CLV10_MEUR.B1GQ.EA20?format=JSON&startPeriod=2024-Q1`
     (quarterly GDP, chain-linked volumes, Eurozone-20)
2. **Eurostat is NOT an IMF replacement** — use only for EU-aggregate and
   member-state triangulation when IMF is down. Attribution: "Eurostat,
   [Dataset], accessed YYYY-MM-DD" in prose.
3. Store fetched JSON under `${ANALYSIS_DIR}/cache/eurostat/` with the
   dataset code as filename.
4. Record `"eurostatFetched": true` in `manifest.dataVerification`.
5. **Do NOT cite Eurostat as sole source for economic claims** — it is a
   triangulation signal. When both IMF and Eurostat are unavailable,
   omit quantitative economic claims from `economic-context.md` entirely
   rather than using agent knowledge (which produces `IMF Source:
   knowledge-only` and fails Stage C). Instead, write a qualitative
   economic context section citing only structural EU fiscal rules,
   published Commission communications, and EP committee positions —
   never numeric GDP/inflation/fiscal figures without a live data source.

## 6 · MCP Data-Quality Defensive Rules (empirical)

1. `coalition_dynamics.cohesion` with `sharedVotes === null` is a **size-ratio
   artifact**, not political alignment. Emit a data-quality warning.
2. Never trust `get_server_health` alone — cross-validate with ≥ 1 concrete
   feed (`get_adopted_texts_feed` is cheapest).
3. Empty-string document responses = `CONTENT_PENDING`. Do not render blanks.
4. Sum group `memberCount` before coalition math. Total < 600 (EP10 ≈ 720
   seats) → cap probabilities at `0.70 × raw`.
5. When you observe new MCP defects, author
   `intelligence/mcp-reliability-audit.md` alongside the analysis.
6. **`monitor_legislative_pipeline` date default (Defect #6 — v1.2.13):**
   Always supply `dateFrom: $LAST_MONTH` and `dateTo: $TODAY` explicitly.
   v1.2.13 defaults the reported `period` to calendar 2024 when no dates
   are given, returning an empty pipeline for all current procedures. For
   forward-looking workflows (`week-ahead`, `month-ahead`) use the relevant
   future date span. As of v1.2.15 the server defaults to a rolling
   last-30-days window when no dates are supplied, but explicit dates
   remain the required calling pattern for reproducibility.
7. **Chronic feed degradation — pivot fast, do not retry-loop.** The
   `get_events_feed` API errors and `get_procedures_feed` `STALE_TAIL`
   responses are **structural**, not transient. After **one** failed
   call, immediately pivot to the documented compensating source — do
   not retry the same feed multiple times within Stage A. Compensating
   sources:
   - `get_events_feed` failure → `get_adopted_texts_feed` (today/one-week)
     + `get_meeting_decisions({ sittingId })` for the in-window plenary
     sittings.
   - `get_procedures_feed` `STALE_TAIL` → `get_procedures({ processId })`
     for procedure IDs harvested from adopted texts; for forward-looking
     workflows use `get_meeting_foreseen_activities({ sittingId })`
     fan-out (see [`01a-data-fanout.md` §2](01a-data-fanout.md)).
   - `get_voting_records` empty → EP Open Data Portal fallback (§2 item 4).
   Log the pivot decision in `intelligence/mcp-reliability-audit.md`
   with timestamp and the compensating source used.
8. **Roll-call follow-up forward statement (MANDATORY).** EP publishes
   roll-call records 4–6 weeks after the session date. When
   `getVotingRecordsWithFallback` returns `unavailable` or `empty` for
   the in-window plenary, append a forward statement to
   `/tmp/new-forward-statements.json` (per [`01a-data-fanout.md` §1](01a-data-fanout.md)) of the form:
   ```json
   {
     "id": "FS-<YYYY>-vote-followup-<sessionDate>",
     "kind": "data-followup",
     "horizonStart": "<sessionDate + 35 days>",
     "horizonEnd":   "<sessionDate + 50 days>",
     "trigger": "Roll-call records published for plenary <sessionDate>",
     "action":  "Re-run voting-patterns.md analysis with confirmed roll-call data",
     "status":  "open"
   }
   ```
   This guarantees the proxy-only voting analysis is automatically
   superseded by confirmed roll-call data once it becomes available, and
   the next breaking / week-in-review run can validate the proxy
   coalitions estimated under the lag.

## 7 · Seat-Count Normalization

Within a single run, take group seat counts from **one** source
(`analyze_coalition_dynamics` OR `get_meps_feed`). Record the source in the
manifest. Do not mix.

**Canonical group-ID codes (consumer rule).** When invoking
`analyze_coalition_dynamics`, `compare_political_groups`,
`detect_voting_anomalies`, or `sentiment_tracker`, **always** pass the
canonical English short codes
`["EPP","S&D","Renew","Greens/EFA","ECR","PfE","Left","NI"]`.
Never pass the EP API native French/German variants
(`PPE`, `Verts-ALE`, legacy `ID`) or full group names
("Group of the European People's Party (Christian Democrats)") — on
gateways prior to `v1.2.15` these mismatches produced `memberCount: 0`
and split groups; the upstream fix in
[Hack23/European-Parliament-MCP-Server#405](https://github.com/Hack23/European-Parliament-MCP-Server/pull/405)
(v1.2.15+) collapses native variants onto these canonical codes via
`normalizePoliticalGroup`. Triage table entry:
[`07-mcp-reference.md` §11 row #2](07-mcp-reference.md).

## 8 · Prior-Run Forward-Looking Mining (week/month ahead + in-review)

Before writing new analysis, mine forward-looking statements from:
1. The most recent predecessor run of the same type
2. The latest `breaking-run*` with an `intelligence/` subdirectory
3. Adjacent-horizon runs (ahead ↔ in-review)

Read each run's `intelligence/analysis-index.md`,
`intelligence/synthesis-summary.md`, and `intelligence/scenario-forecast.md`.
Your new run MUST reference ≥ 3 prior-run forward-looking statements.

## 8a–8d · Fan-Out Helpers → see [`01a-data-fanout.md`](01a-data-fanout.md)

Forward-looking and long-horizon workflows (`week-ahead`, `month-ahead`,
`quarter-ahead`, `year-ahead`, `term-outlook`, `election-cycle`, and the
matching retrospective `*-in-review` horizons for §4 only) additionally
import [`01a-data-fanout.md`](01a-data-fanout.md), which keeps Stage-A
fan-out helpers in a bounded sibling module:

| Helper | Module section |
|--------|----------------|
| Forward-statements registry seed (replaces former §8a) | [`01a-data-fanout.md` §1](01a-data-fanout.md) |
| Multi-day foreseen activities fan-out (replaces former §8b) | [`01a-data-fanout.md` §2](01a-data-fanout.md) |
| Monday urgency motion sweep (replaces former §8c) | [`01a-data-fanout.md` §3](01a-data-fanout.md) |
| Quarter+ horizon fan-out, ≥ 90 days (replaces former §8d) | [`01a-data-fanout.md` §4](01a-data-fanout.md) |

Short-cycle (`breaking`, `motions`, `propositions`, `committee-reports`)
and retrospective (`week-in-review`, `month-in-review`) workflows do not
import that module — sections 1–8, 9 and 10 of this file are sufficient
for their Stage A.

## 9 · Hard Rules

- ❌ Do not skip data collection because feeds are 404 — try direct endpoints.
- ❌ Do not decide the article topic before Stage B is complete.
- ❌ Do not start new slow calls (30–120s feeds) after the late-workflow
  deadline — see [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md).
- ✅ Log every tool failure; the noop diagnostic depends on it.

## 10 · Exit to Stage B

Before handing off to Stage B, verify all Stage A raw outputs are written under
`${ANALYSIS_DIR}` and referenced in `manifest.json` / `data/artifact-index.json`.
Do not run per-phase repo-memory checkpoint commands; continue directly to
[`02-analysis-protocol.md`](02-analysis-protocol.md).
