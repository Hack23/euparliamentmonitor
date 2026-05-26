<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Availability Assessment — EU Parliament Propositions (2026-05-26)

**Run Date:** 2026-05-26 | **Article Type:** propositions | **Data Mode:** degraded-feeds
**Admiralty Source Grade:** B2 (EP Open Data Portal — known staleness issues; cross-validated with EC legislative tracker)
**Assessment Confidence:** MEDIUM — sufficient for deep analytical framework, limited by feed staleness

---

## 1. Pre-Fetch Status

| Feed | Status | Items | Notes |
|------|--------|-------|-------|
| `procedures-feed.json` | ❌ STALE | 0 current | Returns 1970s–1980s historical data (STALENESS_WARNING pattern); EP API pagination tail |
| `external-documents-feed.json` | ✅ PARTIAL | 12 items | SP followup letters (Council responses to EP texts); all from 2026-05-05 |
| `committee-documents-feed.json` | ❌ EMPTY | 0 items | Fixed-window feed returning no results — likely EP backend cache miss |
| `prefetch-status.json` | ⚠️ MISLEADING | mode=full | Pre-fetch script counted 3 feeds fetched but content is stale/empty |

**Prefetch Mode Declared:** `full` — **Actual Mode:** `degraded-feeds`
*The pre-fetch script succeeded in HTTP terms but received stale/empty payload content. This is a known EP API degradation pattern (see `intelligence/procedures-proxy.md`).*

---

## 2. Live Stage A Probe Results

| Tool Call | Result | Notes |
|-----------|--------|-------|
| `get_procedures_feed(one-week)` | 0 current items | Historical tail (1972–1987 procedures) |
| `get_procedures_feed(one-month)` | 0 current items | Same historical tail pattern |
| `get_procedures(limit=20)` | 20 historical items | 1972–1987 procedures; all empty metadata |
| `monitor_legislative_pipeline` | TIMEOUT | EP API unreachable within 30s window |
| `get_external_documents_feed(one-month)` | 12 items | SP Act Followup documents — Council formal responses |

**Total EP MCP calls consumed:** 5 (cap reached — Stage A complete)

---

## 3. Available Data Summary

### 3a. Council Act Followup Documents (SP-2026-05-05)

The external documents feed returned 12 Council Secretary-General letters dated 2026-05-05, providing formal Council responses to EP adopted texts. Reference codes confirm Council has responded to the following EP acts:

| EP Adopted Text Reference | Interpretation |
|--------------------------|----------------|
| TA-10-2025-0284 | EP 10th term adopted text #284 from 2025 |
| TA-10-2025-0299 | EP 10th term adopted text #299 from 2025 |
| TA-10-2025-0307 | EP 10th term adopted text #307 from 2025 |
| TA-10-2025-0328 | EP 10th term adopted text #328 from 2025 |
| TA-10-2025-0338 | EP 10th term adopted text #338 from 2025 |
| TA-10-2026-0006 | EP 10th term adopted text #6 from 2026 |
| TA-10-2026-0028 | EP 10th term adopted text #28 from 2026 |
| TA-10-2026-0034 | EP 10th term adopted text #34 from 2026 |
| TA-10-2026-0042 | EP 10th term adopted text #42 from 2026 |
| TA-10-2026-0044 | EP 10th term adopted text #44 from 2026 |
| TA-10-2026-0057 | EP 10th term adopted text #57 from 2026 |
| TA-10-2026-0058 | EP 10th term adopted text #58 from 2026 |

*These 12 followup documents indicate active legislative inter-institutional dialogue. The Council batch-sending 12 followup letters on the same date (2026-05-05) suggests a systematic catch-up following the May plenary session.*

### 3b. Known Active Legislative Proposals (from EC Legislative Tracker, Admiralty B2)

Based on the EC's 2025–2026 Work Programme and publicly confirmed procedure opens:

1. **Omnibus I Simplification Package** (2025/0103(COD) et al.) — Commission proposal to amend CSRD, CSDDD, EU Taxonomy, and several other regulatory frameworks; currently in EP committee phase
2. **European Defence Industry Programme (EDIP)** (2025/0035(COD)) — trilogue negotiations
3. **ReArm Europe/SAFE Instrument** — high-value defence industrial base proposals
4. **AI Act Implementing Regulations** — delegated acts for high-risk AI system classification
5. **REACH Revision** (2023/0011(COD)) — ENVI committee position under development
6. **Affordable Housing Package** — new Commission initiative for May 2026
7. **EU Competitiveness Compass follow-up legislation** — Draghi Report response package
8. **Critical Raw Materials Delegated Regulations** — strategic projects list update

---

## 4. Data Mode Determination

**Applied Data Mode: `degraded-feeds`**

**Trigger condition:** "1+ feeds unavailable (after 3 retries)" — the procedures feed independently fails to return current-week data; this trigger applies on its own merits without composing with other degradations.

**Line-floor factor: 0.80** — applied by `npm run validate-analysis` via `manifest.dataMode`

**IMF Status:** Not queried (Stage A cap reached) — economic context will use available EC/Eurostat data with `degraded-imf` acknowledgment in `intelligence/economic-context.md`

---

## 5. Analytical Viability Assessment

Despite the degraded feeds, sufficient analytical material exists for a substantive propositions analysis:

- 🟢 **Council inter-institutional activity** confirmed via 12 SP followup letters (May 2026)
- 🟡 **Active procedures** derivable from EC legislative tracker and public sources (Admiralty B2)
- 🟡 **Political dynamics** assessable from coalition data and known EP-10 voting blocs
- 🔴 **Per-procedure real-time tracking** unavailable (track_legislation not called — invocation cap)
- 🔴 **Recent plenary voting records** unavailable (API timeout)

**Overall viability:** MEDIUM — adequate for strategic intelligence assessment, insufficient for procedure-by-procedure granular tracking.

---

## 6. INVOCATION_CAP_ACKNOWLEDGED

*Stage A consumed the full 5-call budget. No `track_legislation` deep-fetches were possible. The `intelligence/procedures-proxy.md` artifact documents this constraint and provides methodology-triangulated procedure coverage. Intelligence artifacts use Admiralty-graded secondary sources to compensate.*
