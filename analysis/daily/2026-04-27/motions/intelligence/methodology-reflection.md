# Methodology Reflection: EU Parliament Motions — April 2026

**Step 10.5 | Final Artifact | SAT Documentation**  
**Date:** 2026-04-27 | **Article Type:** motions | **Run ID:** motions-run-1777278029

---

## Structured Analytic Technique (SAT) Documentation

This artifact documents the analytical techniques applied, assumptions made, and limitations acknowledged in this run's analysis — per the 10-step protocol requirement (Step 10.5).

---

## Techniques Applied

### 1. WEP (Words Expressing Probability) Calibration
All probability assessments use standardized WEP language: "almost certain" (>95%), "likely" (60–85%), "roughly even" (40–60%), "unlikely" (15–40%), "improbable" (<15%). Every probability assessment in this run is accompanied by a confidence indicator (🟢/🟡/🔴).

**Applied in:** executive-brief.md, risk-matrix.md, scenario-forecast.md, wildcards-blackswans.md

### 2. Admiralty Grading System
Source reliability (A–F) and information credibility (1–6) applied to all major assessments:
- **A-B:** Mostly reliable sources (EP Open Data Portal — verified institutional dataset)
- **C:** Fairly reliable (political landscape analysis from EP API tools)
- **D:** Cannot be judged (geopolitical assessments without confirming sources)
- **1–3:** Information confirmed or probably true
- **4–6:** Doubtful to improbable

**Applied in:** executive-brief.md, intelligence/synthesis-summary.md, threat-model.md

### 3. ICD-203 Standards Compliance
All analytical judgments include:
- Source citations
- Confidence indicators
- Logic chain from evidence to conclusion
- Acknowledgment of intelligence gaps
- Alternative interpretations where applicable

**Applied in:** existing/deep-analysis.md, intelligence/synthesis-summary.md

### 4. Forces Analysis (Field Theory Model)
Driving and restraining forces mapped using Lewin's force field analysis adaptation. Each force quantified by strength indicator and political alignment.

**Applied in:** classification/forces-analysis.md

### 5. Impact Matrix (Multi-Stakeholder Assessment)
Five-dimension impact matrix across: citizenry, industry, sovereign states, international actors, civil society. Each dimension assessed for: impact type, severity, timeframe, confidence.

**Applied in:** classification/impact-matrix.md, existing/stakeholder-impact.md

### 6. Actor Network Mapping
Stakeholder identification using PMESII (Political, Military, Economic, Social, Information, Infrastructure) categorization adapted for EP legislative context.

**Applied in:** classification/actor-mapping.md, intelligence/stakeholder-map.md

### 7. Consequence Tree Analysis
First, second, and third-order consequence mapping using causal chain logic. Each branch includes probability and impact assessment.

**Applied in:** threat-assessment/consequence-trees.md

### 8. Scenario Forecasting (Three-Scenario Method)
Structured three-scenario framework: best case (50%), base case (40%), worst case (10%) based on coalition arithmetic and historical patterns.

**Applied in:** intelligence/scenario-forecast.md

---

## Assumptions Made

1. **EP composition data accuracy:** Political landscape data from EP API (719 seats, 9 groups) is assumed accurate as of 2026-04-27. Recent by-elections or group changes not reflected in today's data would alter margins.

2. **Coalition stability assumption:** EPP-S&D-Renew coalition assumed stable at 397 seats. No evidence of imminent defections or coalition breakdown. Assessment: valid.

3. **Historical voting pattern applicability:** Coalition estimates extrapolated from historical patterns. EP9 is a new parliament with different composition than EP8; historical extrapolation has higher uncertainty than same-period comparisons.

4. **Procedures feed recess mode acknowledged:** `get_procedures_feed` returned historical archive (known §11 behavior). Procedures data not available for current session. No mitigation possible.

5. **Roll-call vote delay known limitation:** `get_voting_records` returns empty for recent 7-day window (known EP API behavior). All coalition estimates are structural, not empirical.

---

## Key Intelligence Gaps

| Gap | Significance | Mitigation |
|-----|-------------|------------|
| ECR final position on EDIP EU-preference clause | HIGH — affects defence vote margin | Back-channel monitoring; not available from EP API |
| April 27–30 actual voting list (titles blank) | MEDIUM — limits text-specific analysis | Scheduled foreseen activities known; titles unpublished |
| Roll-call vote data (4–6 week lag) | HIGH — prevents empirical coalition verification | Structural analysis only; acknowledged in all assessments |
| Coalition cohesion metrics (null from API) | MEDIUM — per-MEP voting stats unavailable | Group-size proxies used; acknowledged |

---

## Limitations and Caveats

1. **No live voting data:** This analysis was conducted without access to real-time voting data. All vote margin estimates carry 🟡 Medium or 🔴 Low confidence accordingly.

2. **Blank activity titles:** EP foreseen activities for April 27–30 have blank titles in the API data. Motion-specific text analysis is not possible; analysis is based on motion cluster types and historical context.

3. **First-run baseline:** No prior same-date run exists for cross-run comparison. Cross-run-diff.md documents the baseline rather than differences.

4. **Data window edge effects:** Adopted texts Q1 2026 most recent from 2026-03-26; no adopted text data for April 2026 plenary available at time of analysis (texts published post-adoption with delay).

---

## Analytical Quality Self-Assessment

| Artifact | Completeness | Depth | Confidence |
|----------|-------------|-------|------------|
| executive-brief.md | 🟢 High | 🟡 Medium-High | 🟡 Medium |
| existing/deep-analysis.md | 🟢 High | 🟢 High | 🟡 Medium |
| existing/stakeholder-impact.md | 🟢 High | 🟡 Medium-High | 🟡 Medium |
| classification/impact-matrix.md | 🟢 High | 🟡 Medium-High | 🟡 Medium |
| classification/forces-analysis.md | 🟢 High | 🟢 High | 🟡 Medium |
| classification/actor-mapping.md | 🟢 High | 🟡 Medium-High | 🟡 Medium |
| risk-scoring/risk-matrix.md | 🟢 High | 🟡 Medium-High | 🟡 Medium |
| intelligence/synthesis-summary.md | 🟢 High | 🟢 High | 🟡 Medium |
| intelligence/scenario-forecast.md | 🟢 High | 🟡 Medium-High | 🟡 Medium |
| intelligence/stakeholder-map.md | 🟢 High | 🟢 High | 🟡 Medium |

**Overall run quality:** 🟡 Medium-High. Analysis is comprehensive and structured but constrained by absence of live voting data. All major analytical artifacts produced with appropriate depth given data limitations.

---

## Improvement Recommendations for Future Runs

1. **Run when roll-call data is available:** A run 5–6 weeks post-session would have actual vote counts — enabling empirical coalition verification.
2. **Monitor ECR floor negotiation outcomes:** Back-channel reporting on ECR-rapporteur text negotiations would significantly improve defence motion confidence.
3. **Integrate IMF economic indicators:** For trade/tariff motions, World Bank GDP growth data and IMF trade balance projections would enhance economic impact analysis.

*This artifact satisfies Step 10.5 of the 10-step analytical protocol.*
