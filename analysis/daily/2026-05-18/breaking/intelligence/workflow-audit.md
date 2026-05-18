<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Workflow Audit — breaking-run268
**Date:** 2026-05-18 | **Article Type:** breaking
**Run ID:** breaking-run268-1779092389

---

## 1. Run Configuration Audit

| Parameter | Value | Status |
|-----------|-------|--------|
| Article type slug | breaking | ✅ |
| Stage C tripwire | minute 36 | ✅ configured |
| PR deadline | minute ≤ 45 | ✅ |
| dataMode | degraded-feeds | ✅ declared |
| lineFloorFactor | 0.80 | ✅ applied |
| EP MCP calls (Stage A) | 4 (≤5 budget) | ✅ within budget |
| Prior run | breaking-run262 | ✅ detected |
| Re-run merge rule | applied | ✅ |
| Invocation cap | ≤100 (discipline applied) | ✅ |

---

## 2. Stage Timeline

| Stage | Start Min | Duration | Status |
|-------|-----------|----------|--------|
| Stage A (Data) | ~0 | ~6 min | ✅ COMPLETE |
| Stage B Pass 1 | ~6 | ~20 min | ✅ COMPLETE (43 artifacts) |
| Stage B Pass 2 | ~26 | ~8 min | IN PROGRESS |
| Stage C Gate | ~36 | ≤4 min | PENDING |
| Stage D Render | ~40 | ≤2 min | PENDING |
| Stage E PR | ~42 | ≤3 min | PENDING |

---

## 3. Data Source Audit

| Feed | Status | Rows | Note |
|------|--------|------|------|
| events-feed | ❌ 404 | 0 | Known recurring failure |
| procedures-feed | ⚠️ STALENESS_WARNING | degraded | Historical-tail ordering |
| adopted-texts-feed | ✅ | 116 items | One-week window |
| adopted-texts (direct) | ✅ | 20 full texts | Primary source |
| meps-feed | ✅ | OK | |
| get_latest_votes | ⚠️ | 0 | Non-plenary week; no data |
| IMF API | ❌ unavailable | 0 | Fallback to WEO April 2026 |

---

## 4. Artifact Compliance

| Category | Required | Produced | Pass Rate |
|----------|----------|----------|-----------|
| Core intelligence/ | 22 | 22 | 100% |
| Extended/ | 12 | 12 | 100% |
| Risk-scoring/ | 2 | 2 | 100% |
| Classification/ | 4 | 4 | 100% |
| Documents/ | 1 | 1 | 100% |
| Root-level | 2 | 2 | 100% |
| **Total** | **43** | **43** | **100%** |

---

## 5. Anomalies and Exceptions

1. `events-feed` HTTP 404 — consistent failure; no impact on analysis (content derived from adopted texts)
2. `procedures-feed` STALENESS_WARNING — all procedure references inferred; logged in procedures-proxy.md
3. `get_latest_votes` no data — expected; May 18 is non-plenary; April roll-call data has 3–5 week lag; logged in voting-patterns.degraded.md
4. IMF API unavailable — fallback activated; economic-context.fallback.md produced
5. Prior run `invocationCapException=true` on breaking-run262 — this run disciplined to ≤5 EP MCP calls

---

## 6. Run Classification

**Run quality:** GOOD with DATA_GAPS
**Article render recommendation:** FULL ARTICLE (subject to Stage C GREEN gate)

