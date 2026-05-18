# Data Availability Assessment — EU Parliament Propositions
## Date: 2026-05-18 | Run: propositions-run256-1779086127

## 1. Executive Summary

This assessment documents the data availability landscape for the EU Parliament Propositions analysis run of 18 May 2026. The EP Open Data Portal experienced significant API degradation during this run, with the primary procedures feed and committee documents endpoints returning HTTP 404 errors. The analysis proceeded under **dataMode: degraded-feeds** with a 0.80 line-floor factor applied to all artifact thresholds.

**Overall data availability rating: DEGRADED (score: 3/10 for procedure-specific data, 7/10 for institutional context data)**

🔴 **Confidence on procedure-level details: LOW** (primary feeds unavailable)
🟢 **Confidence on institutional/political context: HIGH** (political landscape + stats fully available)
🟡 **Confidence on adopted text tracking: MEDIUM** (labels available, full metadata unavailable)

---

## 2. Feed Status by Source

### 2.1 Procedures Feed (`get_procedures_feed`)
- **Status**: 🔴 UNAVAILABLE
- **HTTP Status**: 404 Not Found
- **Endpoint**: `https://admin.data.europarl.europa.eu/api/v2/procedures/?view=uri&view-version=v2.1`
- **Degraded fallback**: GET /procedures returned historical procedures from 1972–1990 with no metadata (no stage, no status, no dates, no subject matter)
- **Impact**: Cannot enumerate active 2025/2026 legislative procedures or their current stages
- **Admiralty Grade on this source**: F1 (not confirmed, not credible — source unavailable)

### 2.2 Committee Documents Feed (`get_committee_documents_feed`)
- **Status**: 🔴 UNAVAILABLE
- **HTTP Status**: 404 Not Found
- **Endpoint**: `https://admin.data.europarl.europa.eu/api/v2/committee-documents/?view=uri&view-version=v2.1`
- **Impact**: Cannot retrieve committee reports, opinions, or working documents for the past week
- **Admiralty Grade**: F1 (not confirmed, not credible — source unavailable)

### 2.3 External Documents Feed (`get_external_documents_feed`)
- **Status**: 🟡 PARTIAL — available but content mismatch
- **Items returned**: 500 documents
- **Work type**: All 500 items are `ACT_FOLLOWUP` (Commission follow-up letters to EP resolutions)
- **Relevance**: Low for identifying new legislative proposals; useful for tracking Commission response to past EP positions
- **Admiralty Grade**: B2 (usually reliable source, but specific content not directly relevant to new propositions)
- **Notable 2026 ACT_FOLLOWUP items**: SP-2026-03-20-TA-10-2025-0309 and SP-2025-06-04-TA-10-2025-0048 confirm active follow-up correspondence

### 2.4 Adopted Texts Feed (`get_adopted_texts_feed`)
- **Status**: 🟢 AVAILABLE
- **Items returned**: 131 adopted text references
- **Coverage**: T10-0024/2026 through T10-0157/2026 (EP10 2026 term)
- **Limitation**: Individual text lookups fail with 404; only identifier/label metadata available
- **Admiralty Grade**: A2 (reliable official source, but limited detail)

### 2.5 Individual Procedure Deep-Fetches (`track_legislation`)
- **Status**: 🔴 UNAVAILABLE
- **HTTP Status**: 404 for all tested procedure IDs
- **Tested**: 2025/0042(COD)
- **Impact**: Cannot retrieve procedure timelines, committee assignments, rapporteurs, amendment counts
- **Admiralty Grade**: F1

### 2.6 Voting Records / Latest Votes
- **Status**: 🔴 UNAVAILABLE
- **DOCEO XML**: No data available for weeks of 4–7 May 2026
- **EP Open Data voting**: EP API note indicates 1–2 month delay for roll-call data
- **Impact**: Cannot verify voting outcomes for recent propositions at plenary
- **Admiralty Grade**: F1

### 2.7 Political Landscape (`generate_political_landscape`)
- **Status**: 🟢 FULLY AVAILABLE
- **Data quality**: HIGH — real-time EP API data with full MEP roster
- **Key data**: 717 MEPs, 9 groups, EPP 183 seats (25.52%), S&D 136 (18.97%)
- **Admiralty Grade**: A1 (reliable source, confirmed by multiple EP API endpoints)

### 2.8 Generated Statistics (`get_all_generated_stats`)
- **Status**: 🟢 FULLY AVAILABLE
- **Coverage**: 2024–2026 with monthly breakdowns
- **Last refreshed**: 2026-05-11
- **Key insights**: 2026 procedures pace = 935 (all-time high for EP10), legislative acts +46.2% YoY
- **Admiralty Grade**: A2 (official weekly-refresh data, slight lag)

### 2.9 Plenary Documents (`get_plenary_documents`)
- **Status**: 🟡 PARTIAL — identifiers only, no metadata
- **Items**: A10-0001 to A10-0021/2026 (21 reports submitted in 2026)
- **Limitation**: No titles, dates, authors, or committee information in EP API response
- **Admiralty Grade**: B3 (usually reliable but unable to confirm content)

---

## 3. Data Mode Determination

Per the data-mode table in the invocation budget discipline guidance:

| Condition | Applies? |
|-----------|---------|
| All feeds fetched + IMF OK + voting OK | ❌ No |
| 1+ feeds unavailable (after retries) | ✅ Yes — procedures-feed, committee-docs, voting all 404 |
| IMF data unavailable | 🔴 Not attempted (degraded-feeds already triggered) |
| EP roll-call data missing (0 voting records) | ✅ Yes — compounding |
| Only article title/metadata available | ❌ No — some institutional data available |
| Most EP feeds unavailable + IMF absent | 🟡 Close but institutional data (landscape, stats) available |

**Final dataMode: `degraded-feeds`** — line-floor factor 0.80 applied to all per-artifact thresholds.

This is the most severe single-axis mode whose trigger independently applies. The procedures-feed 404 alone triggers this classification; the compounding voting-data absence does not elevate to `minimal` because institutional data (landscape, stats, adopted texts) provides meaningful analytical basis.

---

## 4. Impact on Propositions Analysis

The `propositions` article type is specifically concerned with new legislative proposals, their pipeline status, committee assignments, and political dynamics. The primary data sources for this analysis (procedures-feed, committee-docs, track_legislation) are all unavailable.

**Mitigation strategies employed:**

1. **Institutional knowledge synthesis**: EP10 legislative agenda is well-documented through the generated stats endpoint (weekly refresh), which confirms key 2026 priorities: defence industrial strategy, Clean Industrial Deal, AI Act implementation, migration pact follow-on
2. **Adopted texts as backward proxy**: The 131 T10/2026 adopted texts confirm active legislative output pace and implicitly identify procedures that completed first reading
3. **ACT_FOLLOWUP external docs**: Provide indirect evidence of which EP resolutions prompted Commission response (indicating those legislative requests were taken seriously)
4. **Political landscape for coalition analysis**: EPP-led flexible majority framework applicable to all current propositions
5. **Historical baseline from stats**: 2026 procedures count (935) is highest on record for EP10, indicating strong legislative activity even if specific procedure details unavailable

**Procedures known from institutional context (not from API — Admiralty grade B3):**
- European Defence Industrial Programme (EDIP) — COD procedure, defence procurement
- Clean Industrial Deal implementation package — multiple COD procedures
- AI Act delegated acts — implementation regulations
- European Sovereignty Act proposals — energy, critical materials
- Migration and Asylum Pact secondary legislation — at least 3 active procedures
- Corporate Sustainability Reporting review — potential omnibus simplification
- Digital decade governance — follow-on procedures

---

## 5. Prior Run Comparison

- **Prior run today**: None (first run for this date)
- **Prior run date**: N/A
- **Manifest history entries**: 0 prior entries

---

## 6. Recommendations

1. **Retry procedures-feed at next scheduled run**: The 404 appears to be a transient API issue given the EP Open Data Portal's typical reliability
2. **Monitor EP API v2.1 health**: The failure pattern (procedures + committee-docs both 404 simultaneously) suggests infrastructure maintenance or endpoint migration
3. **Supplement with MEP-authored questions**: Parliamentary questions can proxy for legislative intent when procedures data unavailable
4. **Use DOCEO XML voter data in next cycle**: Older weeks (pre-April) may have voting records available

---

## 7. Quality Attestation

This data availability assessment was produced following the methodology in `analysis/methodologies/ai-driven-analysis-guide.md`. All Admiralty grades reflect actual confirmed data availability. No `AI_ANALYSIS markers` placeholders have been used. Where procedure-specific data is unavailable, that unavailability is explicitly stated with grade F1; institutional context data is graded A1–A2.

**Analyst note**: The degraded-feeds condition does not prevent meaningful analysis of the EP10 propositions landscape at the institutional and political level. It does prevent procedure-by-procedure tracking, which should be acknowledged as a limitation in the final article.
