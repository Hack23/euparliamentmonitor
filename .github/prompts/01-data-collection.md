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

Time budget: **≤ 5 minutes** of a 45-minute workflow (the Stage-A line in every workflow's parameter table).

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
  `scripts/imf-mcp-probe.sh` after `scripts/mcp-setup.sh`. For
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
1. Call `imf-search-databases` first to discover the best database (or
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
   `get_events_feed` API errors and `get_procedures_feed` `RECESS_MODE`
   responses are **structural**, not transient. After **one** failed
   call, immediately pivot to the documented compensating source — do
   not retry the same feed multiple times within Stage A. Compensating
   sources:
   - `get_events_feed` failure → `get_adopted_texts_feed` (today/one-week)
     + `get_meeting_decisions({ sittingId })` for the in-window plenary
     sittings.
   - `get_procedures_feed` `RECESS_MODE` → `get_procedures({ processId })`
     for procedure IDs harvested from adopted texts; for forward-looking
     workflows use `get_meeting_foreseen_activities({ sittingId })`
     fan-out (see §8b).
   - `get_voting_records` empty → EP Open Data Portal fallback (§2 item 4).
   Log the pivot decision in `intelligence/mcp-reliability-audit.md`
   with timestamp and the compensating source used.
8. **Roll-call follow-up forward statement (MANDATORY).** EP publishes
   roll-call records 4–6 weeks after the session date. When
   `getVotingRecordsWithFallback` returns `unavailable` or `empty` for
   the in-window plenary, append a forward statement to
   `/tmp/new-forward-statements.json` (per §8a) of the form:
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

## 8a · Forward-Statements Registry Seed (week-ahead / month-ahead)

For `week-ahead` and `month-ahead` workflows, Stage A **must** read the
persistent forward-statements registry and seed the synthesis with any open
items in scope:

```bash
TODAY=$(date -u +%Y-%m-%d)
# week-ahead: 7-day horizon; month-ahead: 30-day horizon
if [ "${ARTICLE_TYPE_SLUG}" = "week-ahead" ]; then
  HORIZON_DAYS=7
else
  HORIZON_DAYS=30
fi
HORIZON_END=$(date -u -d "${HORIZON_DAYS} days" +%Y-%m-%d)
node scripts/aggregator/forward-statements-registry.js read \
  --status open \
  --horizon-from "$TODAY" \
  --horizon-to "$HORIZON_END" \
  > "${ANALYSIS_DIR}/data/forward-statements-open.json"
echo "FORWARD_STATEMENTS_OPEN=$(cat "${ANALYSIS_DIR}/data/forward-statements-open.json" | wc -c)" >> "$GITHUB_ENV"
```

After Stage B, for each open item in `data/forward-statements-open.json`:
- If confirmed delivered: `node scripts/aggregator/forward-statements-registry.js update --id <id> --status implemented --evidence <ref>`
- If superseded by new analysis: `node scripts/aggregator/forward-statements-registry.js update --id <id> --status superseded`
- If carried forward unchanged: update `lastObservedDate` by re-running the registry update with `--status open`

At the end of Stage B, append new forward statements produced by this run:

```bash
node scripts/aggregator/forward-statements-registry.js append --file /tmp/new-forward-statements.json
```

## 8b · Multi-Day Foreseen Activities Fan-Out (week-ahead / month-ahead)

For `week-ahead` and `month-ahead` workflows, Stage A **must** call
`get_meeting_foreseen_activities` for **every** session day in the coverage
window — not just day 1. EP plenary sessions run Monday through Thursday in
Strasbourg (4 days) and Wednesday/Thursday in Brussels mini-sessions (2 days).

**Fan-out pattern (Strasbourg full session):**

Call `get_meeting_foreseen_activities` for each sitting ID:
- `sittingId: "MTG-PL-<YYYY-MM-DD>"` for Mon (day 1)
- `sittingId: "MTG-PL-<YYYY-MM-DD+1>"` for Tue (day 2)
- `sittingId: "MTG-PL-<YYYY-MM-DD+2>"` for Wed (day 3)
- `sittingId: "MTG-PL-<YYYY-MM-DD+3>"` for Thu (day 4)

Each call should use `limit: 20`. Collect all results and merge into
`${ANALYSIS_DIR}/data/foreseen-activities-<YYYY-MM-DD>.json` per day.

If any day's call returns 0 items or a 404, log the failure but continue with
remaining days — partial coverage is better than no coverage.

**Budget:** These are light calls (each typically < 2 s). Four calls fit
comfortably within the ≤ 4 min Stage A budget.

## 8c · Monday Urgency Motion Sweep

When a `week-ahead` run executes on a **Monday** (the first day of an EP
session week), Stage A **must** perform a brief urgency motion sweep
*before* confirming any agenda-specific predictions:

```bash
TODAY=$(date -u +%Y-%m-%d)
DOW=$(date -u -d "$TODAY" +%u)  # 1=Mon … 7=Sun
if [ "$DOW" = "1" ]; then
  # Monday urgency motion sweep — Rule 132 motions are filed Monday morning
  echo "URGENCY_SWEEP=true" >> "$GITHUB_ENV"
fi
```

When `URGENCY_SWEEP=true`, Stage A additionally:
1. Calls `get_adopted_texts_feed` with `timeframe: "today"` to capture any
   Rule 132 urgency motions adopted or tabled that morning.
2. Calls `get_procedures_feed` with `timeframe: "today"` to detect newly
   registered urgency procedures.
3. Writes results to `${ANALYSIS_DIR}/data/urgency-motions-<TODAY>.json`.
4. Logs a note in `manifest.json` under `dataVerification.urgencyMotionSweep`
   with timestamp and item count.

This 60-second sweep ensures the article's agenda predictions reflect the
Monday morning Rule 132 filings and are not locked to Sunday's pre-session
state.

## 8d · Quarter+ Horizon Fan-Out (≥90-day horizons)

For article types with a data window ≥ 90 days (`quarter-ahead`,
`quarter-in-review`, `year-ahead`, `year-in-review`, `term-outlook`,
`election-cycle`, `deep-analysis`), Stage A **must** fan out EP data
collection per-month and pull institutional-calendar context:

**Per-month plenary session fan-out:**

The fan-out loop iterates over the article's `dataWindow` (days + direction)
from `src/config/article-horizons.ts`, NOT the `forwardStatementsHorizonDays`
value (which may be 0 for retrospective horizons). For prospective articles,
iterate forward from today; for retrospective articles, iterate backward.

```bash
TODAY=$(date -u +%Y-%m-%d)
# Use dataWindow.days from the article-horizons registry (NOT FORWARD_HORIZON_DAYS)
HORIZON_DAYS="${DATA_WINDOW_DAYS:-90}"
if [ "${HORIZON_DAYS}" -ge 90 ]; then
  MONTHS_TO_COVER=$(( (HORIZON_DAYS + 29) / 30 ))
  # direction: +N months for prospective, -N months for retrospective
  DIRECTION="${DATA_WINDOW_DIRECTION:-forward}"
  for i in $(seq 0 "$MONTHS_TO_COVER"); do
    if [ "$DIRECTION" = "backward" ]; then
      MONTH_START=$(date -u -d "$TODAY -${i} months" +%Y-%m-01)
    else
      MONTH_START=$(date -u -d "$TODAY +${i} months" +%Y-%m-01)
    fi
    MONTH_END=$(date -u -d "$MONTH_START +1 month -1 day" +%Y-%m-%d)
    echo "Fetching plenary sessions: $MONTH_START → $MONTH_END"
  done
fi
```

For each month in the window, call `get_plenary_sessions({ dateFrom:
<month-start>, dateTo: <month-end>, limit: 20 })`. Merge results into
`${ANALYSIS_DIR}/data/plenary-sessions-horizon.json`.

**Commission Work Programme & Council Presidency (external documents):**

For horizons ≥ 90 days, additionally pull:
1. `get_external_documents_feed({ timeframe: "one-month" })` — captures
   Commission proposals and Council Presidency programme documents.
2. `get_external_documents({ limit: 50 })` — fallback if feed is empty;
   scan for Commission Work Programme (CWP) and Trio Presidency programme.

Write results to `${ANALYSIS_DIR}/data/external-docs-horizon.json`.

**Election calendar context:**

When `ELECTORAL_OVERLAY=true` (per `src/config/article-horizons.ts`),
derive EP-term anchors and days-to-next-election from the fallback guidance
in [`electoral-cycle-methodology.md`](../../analysis/methodologies/electoral-cycle-methodology.md)
using the documented term anchors (EP9: 2019-07-02 → 2024-07-15; EP10:
2024-07-16 → 2029-06; next EP election = second Sunday of June per Council
Decision 2018/767). Reference
[`12-electoral-cycle.md`](12-electoral-cycle.md) §5 for auto-trigger
thresholds (T-180 / T-90 / T-30).

**Budget:** Per-month fan-out adds ~2 s per month; a 12-month horizon adds
~24 s. External-docs feed is < 2 s. Total overhead stays within the ≤ 5 min
Stage A budget for prospective horizons (per `src/config/article-horizons.ts`
`PROSPECTIVE_BUDGETS.A = 5`).

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
