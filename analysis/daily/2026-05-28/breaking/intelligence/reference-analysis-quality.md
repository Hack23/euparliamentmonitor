# Reference Analysis Quality Assessment
**Date:** 2026-05-28 | **SATs:** Quality of Information Check, Key Assumptions Check

---

## Source Quality Matrix — Breaking News Run 2026-05-28

### Primary Sources (A-Grade)

#### European Parliament Open Data Portal — Adopted Texts
- **URL:** https://data.europarl.europa.eu/api/v2/adopted-texts
- **Access:** Direct API (year=2026 filter); returned 71+ texts
- **Reliability:** A2 — official EP institutional publication; data integrity confirmed; legally authoritative record of EP legislative output
- **Currency:** Last updated through 2026-05-21 (most recent text TA-10-2026-0186)
- **Limitations:** Title and metadata only; full text PDFs not parsed in this run; committee/rapporteur data unavailable via this endpoint
- **Admiralty Grade:** A2 (very reliable source, confirmed information)

#### European Parliament MEPs Feed
- **URL:** Pre-fetched to data/meps-feed.json (7.0MB)
- **Reliability:** A2 — official EP current membership data
- **Currency:** Current as of 2026-05-28 (MEPs with active mandates)
- **Limitations:** MEP feed provides group affiliation and basic biography; voting records not included
- **Admiralty Grade:** A2

#### Adopted Texts Feed (one-week window)
- **URL:** /api/v2/adopted-texts/feed (one-week)
- **Reliability:** A2 — official feed, same source as direct endpoint
- **Currency:** One-week window confirmed active
- **Additional value:** Confirms week's texts independently from direct endpoint query
- **Admiralty Grade:** A2

### Secondary Sources (B-Grade)

#### EP Plenary Session Dates (Inferred)
- **Source:** Timestamps on adopted texts (11 texts bearing May 19–21 dates)
- **Reliability:** B2 — authoritative record of adoption dates; session existence confirmed
- **Limitation:** Plenary session endpoint returned 0 filtered results (API indexing lag); compensated by text timestamp analysis
- **Admiralty Grade:** B2

#### Coalition Analysis (Historical Pattern)
- **Source:** Historical EP voting pattern analysis + current seat distribution
- **Reliability:** C2 — analyst inference; methodology documented; validated against EP9 patterns
- **Limitation:** No current plenary vote data; DOCEO lag ~2–4 weeks
- **Admiralty Grade:** C2

#### IMF World Economic Outlook April 2026
- **Source:** IMF official publication (authoritative)
- **Reliability:** A1 — premier international economic institution; peer-reviewed methodology
- **Currency:** April 2026 (latest available; July 2026 WEO will be next update)
- **Admiralty Grade:** A1

### Degraded/Unavailable Sources

#### Procedures Feed (404 Error)
- **Grade:** N/A (unavailable)
- **Compensation:** Adopted texts procedureReference fields provide procedure IDs for targeted follow-up

#### Events Feed (404 Error)
- **Grade:** N/A (unavailable)
- **Compensation:** Session dates inferred from adopted text timestamps

#### DOCEO Roll-Call Votes (Publication Lag)
- **Grade:** N/A (expected lag, not a failure)
- **Expected availability:** ~June 5–15, 2026
- **Compensation:** Coalition inference from seat distribution and historical patterns

---

## Information Gaps and Analytical Implications

### Critical Gaps

**Gap 1: Vote-by-vote breakdown for May 19–21 plenary**
- **Impact:** Cannot confirm coalition hypotheses; cannot identify individual MEP defections
- **Severity:** MEDIUM — coalition hypotheses are robust based on historical data; specific margins uncertain
- **Remediation:** Monitor DOCEO data availability from June 5, 2026

**Gap 2: Rapporteur identification for TA-10-2026-0183 and TA-10-2026-0186**
- **Impact:** Cannot attribute political authorship; cannot assess rapporteur's committee position
- **Severity:** LOW-MEDIUM — title and procedureReference provide sufficient context for significance assessment
- **Remediation:** Access procedures endpoint when API restored; or check EP Legislative Observatory

**Gap 3: Committee report texts**
- **Impact:** Cannot verify specific amendment content; cannot assess legislative compromises
- **Severity:** MEDIUM for detailed analysis; LOW for breaking news significance assessment
- **Remediation:** Committee documents feed restoration; direct EP website access

### Analytical Mitigation Strategy

The degraded data environment is compensated by:
1. High-quality primary source (71+ adopted texts, A2 grade) providing authoritative record of EP output
2. IMF WEO (A1 grade) providing economic context independent of EP API availability
3. Historical institutional knowledge of EP procedures and coalition dynamics
4. Adopted text titles, dates, and procedure references providing sufficient metadata for significance assessment

**Overall analysis quality under degraded conditions:** MODERATE-HIGH for strategic intelligence; MODERATE for tactical vote analysis.

---

## Source Cross-Referencing

| Claim | Source | Grade | Cross-Reference |
|---|---|---|---|
| EP adopted 0183 on May 20 | EP Adopted Texts API | A2 | Adopted Texts Feed confirms |
| EP adopted 0186 on May 21 | EP Adopted Texts API | A2 | Adopted Texts Feed confirms |
| 720 total EP seats, EPP 188 | MEPs Feed | A2 | Historical consistency |
| EU GDP 1.6% forecast 2026 | IMF WEO April 2026 | A1 | N/A (primary) |
| AI adds 0.5–1.5% EU GDP by 2030 | IMF WP Feb 2026 | B1 | IMF WEO consistent |
| 8 prior EP Afghanistan resolutions | EP historical analysis | B2 | Adopted texts EP9/EP10 |
| SAFE Instrument €800bn | EU official documents | B2 | European Commission press releases |

---

*QoIC applied | Source grades documented | Information gaps mapped | 2026-05-28*
