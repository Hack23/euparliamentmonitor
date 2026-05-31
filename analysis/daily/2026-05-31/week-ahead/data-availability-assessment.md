<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data-Availability Assessment — Week Ahead (2026-05-31)

**Article type:** `week-ahead` · **Horizon:** 2026-06-01 → 2026-06-07 (7 days)
**Run:** `week-ahead-run275-1780209976` · **Data mode:** `degraded-feeds` (line-floor factor 0.80)

## 1 · Executive Statement

This run was conducted under a **degraded-feeds** posture. The three EP Open Data
Portal *feed* endpoints that the pre-agent prefetch normally fills — `procedures-feed`,
`events-feed` and `documents-feed` — all returned **HTTP 404** from the
`admin.data.europarl.europa.eu/api/v2/.../?view-version=v2.1` enrichment layer.
The analytical floor was recovered by falling back to the highest-reliability
**paginated, non-feed** endpoints (`get_adopted_texts`, `get_plenary_sessions`,
`get_meeting_foreseen_activities`), consistent with the May-2026 known-issues table
in `01a-data-fanout.md` Rule 2a. Net effect: the **forward-looking agenda signal**
for the June II Strasbourg part-session (15–18 June) was successfully reconstructed;
only the *real-time delta feeds* were lost, which is immaterial to a 7-day
prospective article anchored on the next part-session.

## 2 · Source Inventory (Admiralty grading)

| Source | Endpoint | Status | Admiralty grade | Role in this run |
|--------|----------|--------|:---------------:|------------------|
| Adopted texts 2026 | `get_adopted_texts(year=2026)` | ✅ 41 records | **A2** | Legislative-momentum baseline; procedures-feed fallback |
| Plenary calendar 2026 | `get_plenary_sessions(year=2026)` | ✅ 31 sitting-days | **A2** | Identifies next part-session (15–18 Jun); events-feed fallback |
| June 17 draft agenda | `get_meeting_foreseen_activities(MTG-PL-2026-06-17)` | ✅ 21 items | **B3** | Forward agenda structure (5 debates + 13 votes) |
| IMF WEO (EA/DE/FR/IT) | IMF SDMX 3.0 live | ✅ 449 records | **A1** | Economic backdrop for 2027-budget / ECB threads |
| Forward-statements registry | `forward-statements-registry.js` | ✅ empty `[]` | **A1** | No open carried items in horizon window |
| `procedures-feed` | prefetch `v2.1` | ❌ 404 | **F6** | Unavailable — recovered via adopted-texts |
| `events-feed` | prefetch `v2.1` | ❌ 404 | **F6** | Unavailable — recovered via plenary-sessions |
| `documents-feed` | prefetch `v2.1` | ❌ 404 | **F6** | Unavailable — recovered via adopted-texts |
| World Bank MCP | `wb-mcp-probe.sh` | ⚠️ not configured | **F6** | Not used; IMF is sole economic authority |
| `generate_political_landscape` | analytic tool | ⚠️ timeout (100 s) | **F6** | Not used; landscape reconstructed from primary feeds |

Admiralty scale: letter = source reliability (A completely reliable → F unreliable),
numeral = information credibility (1 confirmed → 6 cannot be judged).

## 3 · Coverage by Analytical Need

| Analytical need | Covered? | Confidence | Notes |
|-----------------|:--------:|:----------:|-------|
| Next part-session date | ✅ | 🟢 High | 15–18 June 2026, Strasbourg, confirmed in calendar |
| Draft June agenda structure | ✅ | 🟡 Medium | 5 debates + 13 votes on 17 Jun; titles not yet upstream |
| Specific file subjects for June votes | ❌ | 🔴 Low | `title` fields empty in foreseen-activities payload |
| Committee-week (1–5 Jun) activity | ⚠️ | 🔴 Low | committee-documents feed degraded; inferred from momentum |
| Legislative momentum (Jan–May) | ✅ | 🟢 High | 41 adopted texts, full subject coverage |
| Economic backdrop | ✅ | 🟢 High | IMF WEO live, EA/DE/FR/IT growth/inflation/fiscal |
| Roll-call voting (last 4 wks) | ❌ | n/a | Expected DOCEO publication lag — not a failure |

## 4 · Data-Mode Justification

Per the single-axis selection rule in the runtime contract: feeds are degraded
(`1+ feeds unavailable` trigger independently applies → factor 0.80) **and** the
World Bank probe is unconfigured, but IMF is live so the `degraded-imf` axis does
**not** trigger. We therefore declare the single most-severe independently-applicable
mode: **`degraded-feeds` (0.80)**. We do **not** compose modes or escalate to
`minimal`, whose trigger ("most EP feeds unavailable + IMF absent") does not apply —
the three highest-reliability paginated endpoints all returned full payloads.

## 5 · Residual Risk to Analytical Integrity

- 🟡 **Medium** — Subject-level specificity for the 17 June votes is unavailable;
  the article must describe the agenda **structurally** (counts, debate/vote split)
  and label any subject inference 🔴 Low.
- 🟢 **Low** — Momentum and economic baselines are A-grade; directional conclusions
  about the EP's June policy posture are well-supported.
- 🟢 **Low** — The lost feeds carry *delta* signal only; for a 7-day prospective
  article anchored on a fixed part-session date, their absence does not degrade
  the core forecast.

## 6 · Recommended Reader Caveat

> Readers should treat all **specific** June-17 vote subjects as provisional. The
> agenda *shape* (a heavy single-day voting block plus five debates) is firm; the
> *content* will be confirmed when the EP publishes the final order of business in
> the week of 8 June. This article forecasts **posture and structure**, not outcomes.

## Data-Mode Summary

| Dimension | Status |
|-----------|--------|
| Mode | Degraded-feeds (factor 0.80) |
| EP feeds 404 | 3 (procedures, events, documents) |
| EP feeds OK | 2 (adopted-texts A2, plenary-sessions A2) |
| Foreseen-activities | Counts only (titles empty, B3) |
| IMF WEO | 449 records (A1) |
| Structural requirements | Unreduced |

Degraded mode widens the uncertainty band on file-level forecasts but does **not** reduce
structural requirements. This article forecasts **posture and structure**, not outcomes.
