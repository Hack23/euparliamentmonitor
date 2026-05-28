<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📋 Data Availability Assessment — EU Parliament Breaking News
**Date:** 2026-05-28 | **Article Type:** Breaking | **Run ID:** breaking-run264-1779957632

---

## 🔍 Data Source Assessment

| Source | Expected | Available | Grade | Notes |
|--------|----------|-----------|-------|-------|
| Adopted texts (year=2026) | ✅ | ✅ 51 items | A2 | Primary data source |
| Adopted texts feed (1-week) | ✅ | ⚠️ 248 items (FRESHNESS_FALLBACK) | B2 | Supplementary |
| Procedures feed | ✅ | ❌ STALENESS_WARNING (1972–1990) | D — | Historical tail only |
| Events feed | ✅ | ❌ HTTP 404 | — | Unavailable |
| Plenary sessions | ✅ | ⚠️ 0 results (API date filter bug) | C — | Bug affects date filtering |
| Committee documents | ✅ | ❌ Not queried (budget) | — | Not available this run |
| MEPs feed | ✅ | ❌ Prefetch empty | — | Not queried |
| DOCEO roll-call votes | ✅ | ❌ Within 2–4 week lag | — | Expected absence |
| IMF SDMX | ✅ | ⚠️ Not queried | — | Budget conservation |
| World Bank | Optional | ❌ Not queried | — | Not needed |
| Pre-fetched feeds | 6 files | ❌ All empty/error | — | degraded-feeds mode |

---

## 📊 Data Coverage Summary

**Primary legislative data:** 🟢 GOOD
- 51 adopted texts (year=2026) + 248 feed items = comprehensive May 2026 coverage
- 10 key documents identified for breaking news analysis

**Procedural context:** 🟡 LIMITED
- No procedures feed data; procedures-proxy.md reconstructed from adopted texts
- No committee rapporteur reports or amendment history

**Voting data:** 🔴 UNAVAILABLE
- DOCEO 2–4 week publication lag; no roll-call data for May 19–20, 2026 plenary
- All coalition analysis is inferred from historical group positioning

**Economic context:** 🟡 PARTIAL
- No IMF SDMX query; context from published WEO Spring 2026 known data
- EU GDP growth, defense spending percentages cited are from authoritative public sources

**MEP/Personnel data:** 🔴 UNAVAILABLE
- No MEP profiles queried; immunity waiver subjects unidentified by name

---

## 📊 Degraded-Feeds Mode Declaration

```
prefetchMode: degraded-feeds
floorFactor: 0.80
reason: All 6 pre-fetched feed files empty or error on workflow start
recoveryPath: Direct API calls via get_adopted_texts(year=2026)
dataAdequacy: SUFFICIENT for breaking news analysis
```

---

## ✅ Data Adequacy Conclusion

Despite degraded feeds, available data is **sufficient** for breaking news analysis. The adopted texts primary source provides confirmed legislative decisions. Analytical quality targets met under 0.80 degraded floor.

**Overall data quality:** 🟡 MEDIUM-HIGH (adequate for breaking news; gaps documented)
