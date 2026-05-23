<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Methodology Reflection — EP Motions | April 28–30, 2026

**Subject:** Step 10.5 final artifact — methodology reflection and analytical confidence assessment  
**Date:** 2026-05-05  
**Note:** This is the mandatory final artifact per `analysis/methodologies/ai-driven-analysis-guide.md` Step 10.5

---

## Analysis Quality Self-Assessment

### Data Availability Assessment

| Data Source | Status | Impact on Analysis Quality |
|------------|--------|--------------------------|
| EP adopted texts feed (273 items) | ✅ Available | High — provided breadth of session output |
| EP voting records (April 28–30) | 🟡 Partially available — 4-6 week lag | Medium — inferred from coalition patterns |
| EP plenary sessions API | ✅ Available | High — confirmed session dates, structure |
| EP MEPs feed | ✅ Available | High — current composition confirmed |
| EP political landscape | ✅ Available | High — EP10 composition confirmed (719 seats) |
| EP parliamentary questions | ✅ Available | Medium — supplementary context |
| IMF SDMX API | 🔴 Unavailable — timeout | Medium — economic context limited to WB/EU data |
| World Bank API | ✅ Available (not called this run) | Low — directional context from prior knowledge |
| Adopted text full content | 🔴 Unavailable — 404s for recent docs | Medium — title-level analysis only |

**Overall data completeness:** ~65–70% of ideal. The 4–6 week EP roll-call lag and IMF unavailability are the two primary constraints.

---

### Analytical Confidence by Motion

| Motion | Confidence Level | Limiting Factor |
|--------|-----------------|----------------|
| Jaki immunity waiver | 🟢 High (85%) | JURI procedure well-documented; political context clear |
| Braun immunity waiver | 🟢 High (80%) | Facts are public record; procedural context established |
| DMA enforcement resolution | 🟡 Medium-High (70%) | Commission enforcement calendar not public; EP vote margins inferred |
| Ukraine accountability | 🟡 Medium-High (72%) | Tribunal legal status genuinely uncertain; EP coalition stable |
| Armenia democratic resilience | 🟡 Medium (65%) | Armenia-Azerbaijan dynamics complex; EU monitoring mission status unclear |
| Haiti urgency | 🟡 Medium (60%) | Humanitarian conditions on-the-ground not directly verifiable |
| 2027 budget guidelines | 🟡 Medium-High (70%) | EP position clear; Council response unknown |

**Overall analytical confidence:** ~72% weighted average. Sufficient for political intelligence publication with appropriate caveats.

---

### Methodological Choices and Justifications

**1. Coalition inference over voting record reliance**
Because EP roll-call voting data for April 28–30 was not yet published (4–6 week lag), I inferred coalition sizes from historical EP10 patterns and political intelligence. This is an established methodology in legislative analytics — coalition stability in EP10 is high enough (EPP-S&D-Renew averaging ~397 seats with <10% defection rates on institutional integrity votes) that inference from historical patterns produces reliable estimates.

*Confidence in inference methodology: 75%*

**2. Title-level adopted text analysis**
The full text of April 28–30 adopted texts (TA-10-2026-0105 through TA-10-2026-0162) was not available via EP Open Data API (404 responses for recent documents — known EP API behavior). Analysis relied on:
- Document titles and reference numbers
- Committee provenance (where known from the adopted texts feed)
- Cross-referencing with EP plenary sessions data
- Political context (what issues were on the April Strasbourg agenda based on JURI/IMCO/AFET committee work patterns)

*Risk: a motion's actual text may include provisions not captured by title-level analysis. Mitigation: the executive-brief and other artifacts note this limitation and avoid over-specific claims about resolution text.*

**3. EP10 composition as coalition model**
The analysis uses the EP10 composition confirmed via `generate_political_landscape` (EPP 185, S&D 135, PfE 85, ECR 81, Renew 77, Greens 53, Left 46, NI 30, ESN 27 = 719 total) as the foundation for all coalition analysis. This is the most reliable available data point.

**4. IMF economic context waived**
Per the IMF probe failure, all economic context avoids IMF figures. The 🔴 UNAVAILABLE marker is placed at the top of the economic-context artifact. No quantitative economic figures dependent on IMF SDMX data are cited anywhere in this artifact set.

---

### Pass 2 Read-back Summary

Pass 2 was performed across the following artifacts in order:
1. `executive-brief.md` — extended threat signals section; added nuance on Braun vs. Jaki differences
2. `intelligence/swot-analysis.md` — added 5th threat (legitimacy erosion); expanded opportunities section
3. `intelligence/stakeholder-map.md` — added secondary stakeholders (EU Commission DG COMP, Armenian government)
4. `intelligence/political-context.md` — expanded EP10 coalition mathematics with specific seat counts
5. `intelligence/risk-assessment.md` — added R-07 (majority erosion) and R-08 (Haiti symbolism)
6. `intelligence/economic-context.md` — added magnitudes for DMA penalties and Ukraine Facility
7. `intelligence/voting-analysis.md` — added historical baseline comparison table
8. `intelligence/stakeholder-map.md` — reviewed; no further changes needed
9. `classification/impact-matrix.md` — added interaction effects section
10. `threat-assessment/threat-landscape.md` — added Dimension 6 (legitimacy erosion)

**Rewrite count:** 4 major rewrites (executive-brief threat signals, swot threats, risk assessment R-07/R-08, impact matrix interaction effects)

---

### Limitations and Caveats

1. **Voting record lag:** All vote margin estimates are inferences from historical coalition patterns, not actual roll-call data. Actual margins will be available from EP Open Data ~6 weeks post-vote.

2. **Adopted text content unavailability:** The analysis of what specific resolutions "say" is based on title-level data and political intelligence context. Nuances in resolution language that could shift interpretation are not available.

3. **IMF economic data unavailable:** Economic analysis is directional rather than quantitative for fiscal, growth, and trade impact assessments.

4. **No direct interview/source material:** This analysis is based entirely on EP Open Data, EU Commission public documents, and political intelligence context. No background source interviews or non-public information were used.

5. **Temporal scope:** Analysis is current as of 2026-05-05. Post-publication developments (Commission responses, court decisions, additional EP statements) may require update.

---

### Analyst Notes for Article Generation

**Strongest evidence base:** Immunity procedure analysis (JURI procedures well-documented in EP rules and case law), EP10 composition (confirmed via API), DMA enforcement timeline (Commission press releases publicly available).

**Weakest evidence base:** Haiti humanitarian conditions on-the-ground, economic magnitudes for DMA gatekeeper revenues (partially available from company filings but not systematically cited), Armenia-Azerbaijan current negotiation status.

**Recommended article emphasis:** Lead with Jaki immunity waiver (strong evidence, high salience); DMA enforcement as second story (strong EP political context); Ukraine accountability and Armenia as solidarity signals (standard framing); Haiti as urgency signal; 2027 budget as forward-looking fiscal context.
