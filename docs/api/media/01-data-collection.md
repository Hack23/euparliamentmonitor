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

Time budget: **≤ 10 minutes** of a 60-minute workflow.

## 2 · What to Collect

Every workflow downloads (tools and parameter corrections in
[`07-mcp-reference.md`](07-mcp-reference.md)):

1. **Feed endpoints** with `timeframe: "today"` → fall back to `"one-week"` if
   empty/error/404/timeout.
2. **Direct lookups** — always use these when a feed fails. They query the EP
   database directly and are usually more reliable than feeds.
3. **Deep-fetch (MANDATORY)** — for every adopted text / procedure referenced:
   - `track_legislation({ procedureId })` — status, timeline, committees
   - `get_voting_records({ sessionId, limit: 50 })` — actual vote counts
   - `get_meeting_decisions({ sittingId })` — adopted decisions
   - `get_speeches({ dateFrom, dateTo, limit: 20 })` — debate contributions
   - `get_adopted_texts({ year, limit: 100 })` — full text, not titles
   Budget: up to 10 deep-fetch calls.

## 3 · Feed → Direct Fallback (Short Map)

The canonical fallback map and parameter table live in
[`07-mcp-reference.md`](07-mcp-reference.md). In one sentence: if a feed
returns 404/timeout, try the corresponding direct endpoint before giving up.

## 4 · Economic & Non-Economic Context — **IMF primary for economic, WB for non-economic only** (Wave-4 policy)

Required for articles covering trade, employment, digital/tech, health,
environment/energy, agriculture, housing, migration, defence.

**Wave-3 split (April 2026) — IMF is the sole authoritative source for
economic context**:

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
- **Per-article-type IMF minimums** (editorial policy — enforced at
  Stage-C completeness gate):
  committee-reports/ECON ≥ 4 indicators, /BUDG ≥ 3, /INTA ≥ 3;
  week-ahead / month-ahead / monthly-review ≥ 2;
  breaking / weekly-review / motions / propositions ≥ 1. Full table in
  [`analysis/methodologies/imf-indicator-mapping.md §8`](../../analysis/methodologies/imf-indicator-mapping.md).
- Connectivity probes: `source scripts/wb-mcp-probe.sh` and
  `source scripts/imf-mcp-probe.sh` after `scripts/mcp-setup.sh`.
- Editorial rule (Wave-3+): **IMF is the required primary source** for
  every economic claim; World Bank may be cited as corroborating
  evidence for non-economic indicators (health, education, social,
  environment, demographics, defence, agriculture, innovation,
  governance). The legacy TypeScript validators that enforced this at
  runtime were purged in April 2026 along with the rest of the
  article-generation pipeline; enforcement is now agent-side during
  Stage C completeness review.
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
   `buildDashboardSection()`.
5. Every IMF citation carries the vintage string
   (`IMF WEO April 2026`, `IMF Fiscal Monitor April 2026`) in prose.

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

## 7 · Seat-Count Normalization

Within a single run, take group seat counts from **one** source
(`analyze_coalition_dynamics` OR `get_meps_feed`). Record the source in the
manifest. Do not mix.

## 8 · Prior-Run Forward-Looking Mining (week/month ahead + in-review)

Before writing new analysis, mine forward-looking statements from:
1. The most recent predecessor run of the same type
2. The latest `breaking-run*` with an `intelligence/` subdirectory
3. Adjacent-horizon runs (ahead ↔ in-review)

Read each run's `intelligence/analysis-index.md`,
`intelligence/synthesis-summary.md`, and `intelligence/scenario-forecast.md`.
Your new run MUST reference ≥ 3 prior-run forward-looking statements.

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
