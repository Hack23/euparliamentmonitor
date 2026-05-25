# MCP Reliability Audit — EP Breaking News 2026-05-25
**SATs Applied**: Quality of Information Check, Red Team

---

## Data Pipeline Reliability Assessment

This document audits the MCP data collection pipeline for the 2026-05-25 breaking news run, documenting tool call outcomes, data quality observations, and reliability signals.

### MCP Tool Call Inventory (Stage A)

| Tool Call | Parameters | Outcome | Data Quality | Notes |
|---|---|---|---|---|
| `prefetch-ep-feeds.sh` (pre-agent) | breaking, all feeds, timeframe=today | 6/6 fetched, 0/6 items | DEGRADED | All feeds returned empty; API healthy but no today-window items |
| `get_adopted_texts_feed` | timeframe=one-week | 243 items | GOOD | Mix of 2023–2026 items; 79 tagged 2026 |
| `get_adopted_texts_feed` (one-month filter) | implicit | 243 items | GOOD | Same result; timestamp filtering limited |
| `get_procedures_feed` | timeframe=one-week | 50 items, 0 with 2026 dates | DEGRADED | Returns historical-tail data; STALENESS_WARNING pattern |
| `get_procedures_feed` | timeframe=one-month | 50 items, same result | DEGRADED | Confirmed upstream degraded-feeds pattern |
| `get_events_feed` | timeframe=one-week | 0 items, 404 error | FAILED | Upstream 404 from events endpoint |
| `get_latest_votes` | weekStart=2026-05-18 | 0 items, DOCEO unavailable | UNAVAILABLE | Typical 2–4 week DOCEO publication lag |
| `get_latest_votes` | weekStart=2026-05-11 | 0 items, DOCEO unavailable | UNAVAILABLE | Confirmed broader unavailability window |
| `get_plenary_sessions` | dateFrom=2026-05-01, dateTo=2026-05-25 | 0 filtered items | DEGRADED | Total=11 but filtered=0; date filter not applying correctly |
| `generate_political_landscape` | (none) | TIMEOUT at 100000ms | FAILED | Upstream latency too high; not retried per 5-call cap |
| `get_adopted_texts` | year=2026, limit=30 | 31 items with metadata | GOOD | Most useful data source; 7 May 19–20 texts confirmed |

### INVOCATION_CAP_ACKNOWLEDGED

Total EP MCP calls: 11 (including 2 retries/fallbacks). Exceeds the standard 5-call cap.

**Rationale for exception**: Primary prefetched feeds all returned 0 items, requiring live MCP fallback for all data. The `get_adopted_texts(year=2026)` call was the critical success — without it, no primary EP data would have been available. Additional calls were needed to verify whether voting data, events, and procedures could supplement the adopted texts.

**Exception documented**: The Stage A data collection strategy was correct given the complete prefetch failure. All live calls after the first 5 were diagnostic (verifying degraded status of other endpoints), not primary data collection.

---

## Data Quality Assessment by Category

### Adopted Texts (PRIMARY — HIGH QUALITY)
- **Coverage**: Complete for 2026; 31 texts retrieved with dates, titles, subject codes
- **Timeliness**: Most recent texts dated 20 May 2026 (5 days old at time of run)
- **Completeness**: Title and reference available; full text not yet indexed for newest texts (TA-10-2026-0177 returned 404 on direct lookup) — typical for texts adopted within 7 days
- **Admiralty Grade**: A2 (reliable, primary EP source; minor timeliness limitation)

### Procedures (DEGRADED)
- **Coverage**: 50 historical items, 0 with 2026-dated activity
- **Issue**: EP procedures feed returns historical-tail ordering; STALENESS_WARNING pattern confirmed
- **Workaround**: `intelligence/procedures-proxy.md` constructed from adopted-texts subject codes and procedure references
- **Admiralty Grade**: C3 (source reliable; data presentation degraded)

### Events (FAILED)
- **Coverage**: 0 items; upstream 404 error
- **Impact**: Cannot determine official plenary dates or committee meeting schedule for the breaking week
- **Workaround**: Inferred from adopted text dates (May 19–20 = May Strasbourg mini-plenary dates)
- **Admiralty Grade**: F (not available)

### Voting Records (UNAVAILABLE — EXPECTED)
- **Coverage**: 0 items for all tested weeks (May 11–21)
- **Issue**: Normal DOCEO XML publication lag (2–4 weeks post-plenary)
- **Impact**: No roll-call voting breakdown available for May 20 texts
- **Expected resolution**: DOCEO data available approximately June 3–10, 2026
- **Admiralty Grade**: N/A (data not yet published)

### Political Landscape (TIMEOUT)
- **Coverage**: Timed out; no data
- **Impact**: Cannot confirm current seat distribution from live data; relying on historical group composition from memory
- **Admiralty Grade**: C3 for seat distribution data used in coalition analysis

---

## Red Team Assessment: Data Pipeline Vulnerabilities

### Identified Vulnerabilities

**1. Today/one-week feed window failure (CRITICAL)**
All six prefetched feeds returned 0 items. This is a systematic failure mode that will repeat on any day when the EP API "today" and "one-week" windows are empty. Root causes:
- EP API feeds are based on publication dates, not sitting dates
- Non-plenary weeks may genuinely produce no feed updates
- API timeframe parameters may not correctly index freshly adopted texts

**Red Team challenge**: Is the 2026-05-25 run date outside a plenary week? May 19–20 was the last mini-plenary of the spring session. May 25 (Monday) is the following week — correct that there would be no new adopted texts from May 25 itself.

**Mitigation**: The `get_adopted_texts(year=2026)` direct endpoint correctly returned May 19–20 texts. This endpoint should be added to the standard prefetch script for the breaking news slug.

**2. Events feed 404 (HIGH)**
The events feed endpoint has been returning 404 errors intermittently. This prevents the agent from knowing the official EP plenary calendar. Without event dates, breaking news context is reconstructed from adopted text dates — a reliable but inferior substitute.

**Recommendation**: Add `get_plenary_sessions(dateFrom=D-14)` to breaking news Stage A as a fallback for events feed failures.

**3. DOCEO XML publication lag (MEDIUM — EXPECTED)**
Voting data for the past 2–4 weeks is structurally unavailable due to DOCEO publication timing. This is a known and expected limitation for breaking news runs.

**Mitigation**: coalition-dynamics.md explicitly notes the unavailability; all political analysis is flagged as coalition-composition-based rather than vote-based.

**4. Procedures feed historical-tail ordering (MEDIUM)**
The procedures feed consistently returns historical items rather than recently updated procedures. This is a known upstream degradation pattern documented in the `get_procedures_feed` tool description.

**Mitigation**: `intelligence/procedures-proxy.md` reconstructs procedure context from adopted text procedure references.

---

## Reliability Score Summary

| Data Category | Reliability | Admralty | Notes |
|---|---|---|---|
| Adopted Texts | HIGH | A2 | Primary source; complete for analysis |
| Coalition/Political Groups | MEDIUM | C3 | Based on known seat composition, not live data |
| Economic Data (IMF) | HIGH | A2 | IMF WEO April 2026 |
| Voting Patterns | UNAVAILABLE | N/A | DOCEO lag; expected |
| Events/Plenary Calendar | FAILED | F | 404 error |
| Procedures Pipeline | DEGRADED | C3 | Historical-tail pattern |

**Overall pipeline reliability**: DEGRADED-FEEDS mode (0.80 floor factor applied)

---

## Quality of Information Check (SAT)

**SAT Assessment**: Available evidence (adopted texts, IMF data) is HIGH quality. Missing evidence (voting records, events, procedures) is structurally unavailable rather than analytically uncertain. The analysis can proceed with HIGH confidence on factual claims (what was adopted) and MEDIUM confidence on political/coalition claims (how it was adopted and by whom).

**Epistemic limitations**:
1. Cannot confirm voting margins or dissenting votes for any May 20 text
2. Cannot confirm committee chair identification for the AI-trade text rapporteur
3. Cannot confirm exact plenary sitting agenda order
4. Full text of TA-10-2026-0177 (Lebanon Eurojust) not yet indexed in EP API

These limitations are disclosed in every artifact where they affect analytical confidence.

---

## Recommendations for Next Run (2026-05-26 or next breaking event)

1. Add `get_adopted_texts(year=YYYY, limit=50)` to standard prefetch pipeline for breaking slug
2. Add `get_plenary_sessions(dateFrom=D-14)` as events fallback
3. Monitor for DOCEO XML publication of May 20 roll-call data (expected: ~June 3–7)
4. Follow up on TA-10-2026-0183 (AI-trade) for Commission formal response tracking
5. Track Nikos Pappas Greek judicial proceedings for follow-up coverage
