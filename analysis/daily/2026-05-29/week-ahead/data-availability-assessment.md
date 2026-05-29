<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🗂️ Data-Availability Assessment — EU Parliament Week Ahead
## Window: 1–5 June 2026 | Produced: 2026-05-29 | Run: week-ahead-run1780043323

**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Declared data mode:** `degraded-feeds` (line-floor factor 0.80)
**Overall collection grade:** B2 — reliable primary endpoints recovered after two named feeds failed

---

## 📊 Source-by-Source Availability Matrix

| Source / Endpoint | Status | Records | Admiralty | Fallback used | Notes |
|---|---|---|---|---|---|
| `prefetch-ep-feeds.sh` (pre-agent) | ⚠️ degraded | 2/3 fetched | B3 | n/a | `prefetchMode=degraded-feeds` |
| `events-feed.json` | 🔴 HTTP 404 | 0 | F | `get_plenary_sessions` | `/events/?view-version=v2.1` rejected upstream |
| `procedures-feed.json` | 🔴 HTTP 404 | 0 | F | `get_adopted_texts(year=2026)` | `/procedures/?view-version=v2.1` rejected upstream |
| `documents-feed.json` | 🔴 unavailable | 0 | F | `get_committee_documents` | enrichment layer returned `{status:"unavailable"}` |
| `get_plenary_sessions(2026)` | 🟢 OK | 54 sittings | A2 | — | full-year calendar recovered; authoritative |
| `get_plenary_sessions(D→D+14)` | 🟢 OK (empty) | 0 in window | A2 | — | confirms no plenary in the 7-day horizon |
| `get_adopted_texts(year=2026)` | 🟢 OK | 41 texts | A2 | — | highest-reliability EP endpoint (per Rule 2a) |
| `get_meeting_foreseen_activities(MTG-PL-2026-06-15)` | 🟢 OK | 8 items | B3 | — | placeholder titles — agenda not yet published |
| `get_committee_documents` | 🟢 OK | 41 (AFCO) | B3 | — | reference-only opinions, no titles/dates |
| `monitor_legislative_pipeline(ACTIVE)` | 🟡 cold cache | 0 | C3 | — | `forecastBasis=NOT_APPLICABLE`; lifecycle corpus cold |
| `generate_political_landscape` | 🔴 timeout | 0 | F | static EP10 composition | 100 s upstream timeout |
| IMF WEO (`api.imf.org` SDMX 3.0) | 🟢 OK | 449 obs | A1 | — | DEU/FRA/ITA GDP, inflation, fiscal 2024–2027 |
| forward-statements registry | 🟢 OK (empty) | 0 open | B2 | — | no open forward statements in horizon |

---

## 🧭 Impact on Analytical Confidence

The two feed-level 404s (`events`, `procedures`) and the `documents` enrichment failure are the **persistently degraded feeds** documented in the May-2026 known-issues table; none is a novel outage. The Rule 2a fallbacks — `get_adopted_texts(year=2026)` and `get_plenary_sessions` — recovered the full analytical floor. The single most consequential datum (the EP plenary calendar) was obtained at **A2** grade, which is sufficient to anchor every forward judgement in this brief with HIGH confidence.

The principal residual gaps are:

1. **No published agenda for the 1–5 June committee week.** Committee-level agendas are not exposed through the EP Open Data Portal feeds; the 8 placeholder items returned for the 15 June plenary confirm that even the *next* plenary's order of business is not yet finalised. Forward judgements about specific committee votes therefore carry MEDIUM confidence and lean on the structural rhythm of the EP calendar rather than on confirmed scheduling.
2. **Cold legislative-pipeline cache.** `monitor_legislative_pipeline` returned `INSUFFICIENT_DATA`, so dwell-time bottleneck forecasting is unavailable this run. We substitute the adopted-texts trail as a proxy for legislative throughput (see `intelligence/procedures-proxy.md`).
3. **Political-landscape timeout.** The composite landscape tool timed out; we fall back to the structurally stable EP10 seat distribution (719 MEPs, nine groups), which changes only on by-elections and is safe to treat as constant within a 7-day horizon.

## 🔁 Reproducibility

All raw captures are committed under `analysis/daily/2026-05-29/week-ahead/data/` and `…/cache/imf/`. The IMF query string and record count are recorded in `cache/imf/probe-summary.json`; the parsed big-three macro table is in `cache/imf/weo-parsed.json`. Re-running the same endpoints on a future date will reproduce the calendar and adopted-texts captures deterministically; the feed 404s are expected to persist until the upstream `view-version=v2.1` regression is resolved.

**Bottom line:** Data sufficiency is **adequate for a full forward analysis** at the `degraded-feeds` floor. No artifact in this run is blocked for lack of data.

---

## 🧪 Collection-Confidence Scorecard

| Dimension | Score | Rationale |
|---|---|---|
| Calendar certainty | 🟢 HIGH | Plenary schedule at A2; no-plenary thesis confirmed |
| Procedural substance | 🟢 HIGH | 41 adopted texts at A2 |
| Committee-agenda detail | 🟡 MEDIUM | No published agendas; placeholders only |
| Legislative-flow metrics | 🔴 LOW | Cold pipeline cache; proxy only |
| Macro-economic context | 🟢 HIGH | Live IMF WEO at A1 |
| Group-composition baseline | 🟢 HIGH | Static EP10 distribution, invariant in horizon |

## 📌 Decision Rules Applied

- **Rule 2a (fallback chain):** triggered for all three failed feeds; each routed to a higher-or-equal-grade `get_*` tool.
- **Rule 4 (declare data mode):** `degraded-feeds` declared in `manifest.json`, applying the 0.80 line-floor factor.
- **Rule 7 (no fabrication):** untitled committee documents and placeholder agenda items are flagged as such; no titles or dates were inferred.
- **Rule 9 (single economic source):** all macro figures sourced exclusively from IMF WEO.

## 🔭 What Would Upgrade This Assessment

1. Restoration of the `v2.1` `events`/`procedures`/`documents` feeds → would lift committee-agenda detail from MEDIUM to HIGH.
2. A warm lifecycle cache → would restore dwell-time and bottleneck forecasting (currently LOW).
3. Publication of the 15–18 June plenary agenda → would convert the placeholder foreseen-activities into concrete forward anchors.

Until then, this run stands on the two highest-grade sources available — the EP plenary calendar (A2) and IMF WEO (A1) — which is sufficient to support every HIGH-confidence judgement made downstream.
