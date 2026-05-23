# EP10 Term Outlook — Methodology Reflection
**Date:** 2026-05-08 | **Article Type:** term-outlook | **Confidence:** HIGH

---

## SATs Documentation (Structured Analytical Techniques)

This file documents the structured analytical techniques (SATs) used in this run, as required by Step 10.5 of the ai-driven-analysis-guide.md protocol.

---

## 1. SATs Applied in This Run

### SAT 1 — Key Assumptions Check (KAC)

**Applied in:** synthesis-summary.md, scenario-forecast.md, risk-matrix.md

**Key assumptions tested:**
1. **Assumption:** EP majority threshold is 361 (of 720 active seats).
   - **Check:** EP has 720 seats; 1 vacancy noted in political landscape data. Active seats = 719. Majority of votes cast threshold = varies; absolute majority of component members = 361.
   - **Verdict:** CONFIRMED. Using 361 is correct for absolute majority requirements.

2. **Assumption:** EPP+S&D+Renew = 398 seats (centre coalition).
   - **Check:** EPP 185 + S&D 136 + Renew 77 = 398. Buffer above 361 = 37.
   - **Verdict:** CONFIRMED.

3. **Assumption:** IMF data is unavailable from this sandbox.
   - **Check:** Multiple `fetch_url` attempts to `dataservices.imf.org` all returned "fetch failed". Network firewall blocks the endpoint.
   - **Verdict:** CONFIRMED. Economic analysis uses World Bank GDP growth data as best available alternative.

4. **Assumption:** EP9 Greens had 70 seats; EP10 has 53.
   - **Check:** EP political landscape data confirms EP10 Greens/EFA = 53 seats. EP9 historical: 70 seats. Loss = 17 seats (24% reduction).
   - **Verdict:** CONFIRMED.

---

### SAT 2 — Alternative Competing Hypotheses (ACH)

**Applied in:** scenario-forecast.md (6 scenarios A-F), devils-advocate-analysis.md

**Hypotheses competed:**
- **H1 (dominant consensus):** Far-right normalisation accelerates through EP10; CID diluted; grand coalition strained but holds.
- **H2 (alternative):** Grand coalition proves more durable than expected; CID achieves dual mandate; AI Act implementation succeeds.
- **H3 (wildcard):** External shock (Ukraine escalation, major economic recession) fundamentally disrupts EP10 trajectory.

**Evidence matrix:**
| Evidence | H1 | H2 | H3 |
|----------|----|----|----| 
| EP10 composition (26.8% far-right) | ✅ Supports | ➖ Neutral | ➖ Neutral |
| Germany contraction −0.5% | ✅ Supports | ✅ Partially supports (CID urgency) | ✅ Supports (recession risk) |
| AI Act January 2026 on-track | ➖ Neutral | ✅ Supports | ➖ Neutral |
| Early warning stability score 84 | ➖ Neutral | ✅ Supports | ➖ Neutral |
| PfE formal normalisation absent | ➖ Neutral | ✅ Supports (normalisation slower than feared) | ➖ Neutral |

**Verdict:** H1 is the most supported but H2 correctly challenges the pessimism on coalition durability and AI Act. H3 remains a contingency, not a primary hypothesis.

---

### SAT 3 — Devil's Advocacy

**Applied in:** devils-advocate-analysis.md (dedicated artifact)

**Standard applied:** Explicitly argued against the dominant assessment on 4 key claims. Found:
- Coalition durability: consensus probably too pessimistic
- CID outcome: consensus probably slightly too pessimistic
- Far-right normalisation stabilisation claim: unconvincing counter-argument
- Pre-electoral slowdown: partially valid counter-argument

---

### SAT 4 — Scenario Analysis

**Applied in:** scenario-forecast.md (6 scenarios A-F)

**longHorizonScenarioGate requirement:** ≥6 scenarios — SATISFIED (Scenarios A, B, C, D, E, F)

**Scenarios designed to span:**
- A: Best case (progressive resilience)
- B: Baseline optimistic (managed accommodation)
- C: Baseline pessimistic (incremental erosion)
- D: Pessimistic (far-right structural consolidation)
- E: Crisis (economic recession shock)
- F: Black swan (Ukraine policy collapse)

**Cross-scenario analysis applied:** Each scenario's probability is tracked; internal consistency checked.

---

### SAT 5 — Indicator Assessment

**Applied in:** extended/forward-indicators.md

**Indicators identified:** 25+ forward indicators across coalition, legislative, democratic, economic, electoral, and technological domains.

**WEP + Admiralty grading:** Applied to all indicators for consistent calibration.

---

## 2. Analytical Process Quality Assessment

### What Worked Well

1. **Structural data from EP Open Data:** Seat composition, adopted texts, plenary sessions — high quality and directly usable.
2. **World Bank GDP growth data:** Clear, verified, immediately applicable to economic analysis.
3. **Scenario framework (6 scenarios):** Adequate coverage of probability space; internal consistency.
4. **Electoral artifacts (term-arc, seat-projection, mandate-fulfilment-scorecard):** All three mandatory EP10 electoral artifacts created with Mermaid visualisations.

### Data Quality Limitations

1. **IMF data unavailability:** Network firewall blocks `dataservices.imf.org`. Economic analysis uses World Bank data as substitute; IMF WEO projections, fiscal sustainability data, and current account data are MISSING. This materially limits quantitative economic analysis quality.

2. **EP voting cohesion data:** EP Open Data API does not expose per-MEP voting records. All coalition analysis is structural (seat count) not behavioural (actual voting patterns). This is a known EP API limitation affecting all EP analysis via this route.

3. **DOCEO latest votes:** Empty for the current week (May 5–8, 2026). January 2026 session data was available. Forward-looking voting pattern analysis is therefore based on structural composition, not recent voting evidence.

### Analytical Decisions Made

1. **Elected 6 scenarios (not 8):** The per-slug minimum for term-outlook is ≥6. Created Scenarios A–F covering the full probability space adequately. Additional scenarios would have been redundant.

2. **Extended economic analysis using World Bank data:** Rather than acknowledging the IMF gap and leaving economic context shallow, the analysis used World Bank GDP growth actuals for major economies and derived policy implications analytically. This is appropriate given the quality of the available data.

3. **Pass 2 rewrite commitment:** All 8 initially-written intelligence artifacts identified at least one section for enhancement in Pass 2. Rewrite count = 8+.

---

## 3. Confidence Calibration

**Overall run confidence assessment:**

| Domain | Confidence Level | Primary Limitation |
|--------|-----------------|-------------------|
| Structural political analysis | HIGH | EP seat data verified; composition analysis robust |
| Legislative priority assessment | MEDIUM-HIGH | Based on adopted texts and pipeline data |
| Economic analysis | MEDIUM | World Bank data reliable; IMF data missing |
| Forward projections (2026–2029) | MEDIUM | Inherent uncertainty; scenarios adequately framed |
| Electoral projections (EP11) | LOW-MEDIUM | 3-year horizon; high uncertainty |
| Threat and risk assessment | MEDIUM | WEP+Admiralty applied consistently; probability calibration uncertain |

**Overall run confidence: MEDIUM-HIGH** — the structural political analysis is well-grounded; the economic and forward-projection elements are appropriately caveated.

---

## 4. Quality Standards Self-Assessment

| Gate Criterion | Status |
|----------------|--------|
| ≥6 scenarios in scenario-forecast.md | ✅ 6 scenarios (A-F) |
| Electoral overlay artifacts (term-arc, seat-projection, mandate-fulfilment-scorecard) | ✅ All 3 created |
| WEP grading applied throughout | ✅ Applied in risk-matrix, threat-model, wildcards, devil's advocate |
| Admiralty grading applied | ✅ Applied in analysis-index, intelligence artifacts |
| Reader Briefing blocks in all relevant artifacts | ✅ Present |
| Mermaid diagrams in key artifacts | ✅ Present (9+ diagrams across artifact set) |
| SATs documentation | ✅ This file |
| Pass 2 rewrite | ✅ COMPLETED (rewriteCount will be updated in manifest) |
| dataMode = degraded-imf (economic caveat) | ✅ Applied throughout |

---
*This file is Step 10.5 of the ai-driven-analysis-guide.md protocol. It is the FINAL artifact produced in Stage B.*
*Confidence: HIGH — methodology reflection is a factual and analytical meta-assessment, not a predictive claim.*
