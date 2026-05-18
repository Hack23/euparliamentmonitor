<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Reference Analysis Quality — Breaking News
**Date:** 2026-05-18 | **Article Type:** breaking
**SAT Applied:** Quality of Information Check, Key Assumptions Check

---

## 1. Overall Quality Assessment

**Run quality rating: ADEQUATE (62/100)** — suitable for MEDIUM-confidence breaking news analysis; insufficient for HIGH-confidence institutional intelligence.

---

## 2. Source Quality by Domain

### 2.1 Legislative Data Quality

**EP Adopted Texts (primary source):**
- Reliability: HIGH (official EP institutional data)
- Completeness: MEDIUM (titles + dates + subject codes; no full text)
- Freshness: MEDIUM-HIGH (most recent texts: April 30, 2026 = 18 days lag)
- Admiralty grade: A2 (completely reliable source, probably true — slight uncertainty from publication lag)
- Data gap: Full text of resolutions unavailable; operative paragraph analysis not possible

**EP Procedures (secondary source):**
- Reliability: EXPECTED HIGH but DELIVERED: VERY LOW
- The procedures feed returned only 1972-1980s historical stubs without meaningful metadata
- Effectively useless for this run
- Admiralty grade: E4 (cannot be judged, doubtful reliability given degraded data)

### 2.2 Economic Data Quality

**IMF WEO April 2026:**
- Reliability: HIGH (authoritative international institution)
- Accessibility: INDIRECT (not directly API-queried; drawn from public releases)
- Freshness: HIGH (April 2026 data is current)
- Admiralty grade: B2 (reliable source, probably true — indirect access)
- Limitation: Specific sectoral figures (digital economy, defence spending) are estimates, not direct IMF API data

### 2.3 Political Intelligence Quality

**Coalition dynamics (inferred):**
- Reliability: MEDIUM (based on known group positions and historical patterns)
- No roll-call data available — all positions probabilistic
- Admiralty grade: C3 (source not fully verified, possibly true)
- Limitation: Any specific vote count could be wrong by ±10-20%

**Historical parallels:**
- Reliability: MEDIUM-HIGH (EP institutional memory well documented)
- Freshness: VARIABLE (some data from EP9 period, some from EP10 records)
- Admiralty grade: B2-B3

---

## 3. Data Gap Impact Matrix

| Gap | Severity | Impact on Analysis | Mitigation Applied |
|-----|---------|-------------------|-------------------|
| No roll-call vote data | HIGH | Coalition analysis is probabilistic | ACH applied; WEP bands on all coalition claims |
| No full resolution text | MEDIUM-HIGH | Operative paragraph detail missing | Subject codes + titles provide adequate classification |
| Events feed unavailable | MEDIUM | Cannot identify related committee/stakeholder events | EP calendar context from general knowledge |
| Procedures feed stale | LOW | Cannot trace legislative history of adopted texts | Historical timeline constructed from EP9/EP10 milestones |
| IMF API not queried | LOW-MEDIUM | Economic data from public source, not direct query | IMF WEO April 2026 public data is reliable and current |
| DOCEO XML unavailable | HIGH | No current week voting data | Degraded voting patterns analysis applied |

---

## 4. Analytical Reliability Matrix

| Artifact | Reliability | Confidence Level |
|---------|------------|-----------------|
| Executive brief | HIGH (strong adopted text basis) | MEDIUM-HIGH |
| Synthesis summary | MEDIUM-HIGH (good theme analysis) | MEDIUM |
| Coalition dynamics | MEDIUM (no roll-call) | MEDIUM |
| Stakeholder map | HIGH (well-documented actors) | HIGH |
| PESTLE analysis | MEDIUM-HIGH | MEDIUM-HIGH |
| Scenario forecast | MEDIUM (WEP bands applied) | MEDIUM |
| Threat model | MEDIUM-HIGH | MEDIUM-HIGH |
| Economic context | MEDIUM (indirect IMF) | MEDIUM |
| Historical baseline | HIGH (EP institutional record) | HIGH |
| Voting patterns (degraded) | LOW-MEDIUM (inferred) | LOW-MEDIUM |

---

## 5. Improvement Recommendations for Next Run

1. Access full resolution text for top Tier 1 texts
2. Query DOCEO XML when roll-call data becomes available (typically 2-3 weeks post-session)
3. Direct IMF API query for EU macro data
4. Deep-fetch 2-3 procedure references to trace legislative history of April texts
5. Query MEP declarations of financial interests for DMA-relevant MEPs

*Generated: 2026-05-18 | Run: breaking-run262-1779068047*
