<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Methodology Reflection — EP Breaking News | 2026-05-04

**Stage:** Post-Analysis Reflection (Step 10.5 — per ai-driven-analysis-guide.md)  
**Run ID:** breaking-run-2026-05-04  
**Article Type:** Breaking News

---

## Analytical Decisions and Epistemic Limits

### Decision 1: Salience Ranking without Voting Data
The absence of roll-call voting tallies for April 28-30 required all coalition and group-position analysis to be presented as structural inference rather than confirmed data. I applied the EP's historical group behaviour patterns and stated public positions to generate predicted (not confirmed) vote margin ranges. This is methodologically sound for breaking news analysis where roll-call publication lag is a known structural constraint, but all voting-related claims must be read as predictions with 🟡 Medium confidence.

**Epistemic limit acknowledged:** Without confirmed vote tallies, the "margin of victory" for any April 30 resolution cannot be established. This matters most for the DMA enforcement resolution, where the margin may reveal whether EPP divided internally.

### Decision 2: Prioritising Geopolitical + Digital Nexus
From the 12+ items adopted April 28-30, I prioritised Ukraine accountability, DMA enforcement, and Armenia resilience as the Tier-1 breaking news items. This prioritisation reflects:
- Geopolitical immediacy (Russia-Ukraine conflict active)
- Regulatory significance (DMA first-of-kind enforcement resolution)
- EaP strategic significance (Armenia as bellwether)

The Patryk Jaki immunity waiver received Tier-2 treatment (significant but not the headline). The 2027 Budget Estimates received Tier-2 treatment (procedurally important but not breaking in the journalistic sense).

**Alternative framing considered:** The MFF 2028-2034 interim report debate could be framed as the headline — it has the largest long-term political consequences. I rejected this as it was a debate without a resolution adopted, making it a process indicator rather than a breaking outcome.

### Decision 3: IMF Economic Data Not Queried
For the Ukraine accountability and Armenia resolutions (non-economic instruments), IMF data would not materially improve the analysis. For the DMA enforcement resolution, IMF data is not the appropriate analytical lens — this is competition policy, not macroeconomics.

The Middle East energy-fertilizer debate would benefit from IMF commodity price data and food security indicators, but this debate produced no adopted resolution, reducing the priority for deep economic sourcing.

**Classification:** `imf=not_required` for this run's core topics.

### Decision 4: World Bank Non-Economic Data Not Queried
For this specific breaking news package:
- Ukraine: WB data would add humanitarian assistance disbursement context — useful enhancement but not core
- Armenia: WB governance indicators (WGI) would be relevant — deferred due to time constraints
- DMA: No WB data relevant

**Enhancement opportunity:** A subsequent deeper analysis run should query WB WGI indicators for Armenia and WB Ukraine recovery data.

---

## Quality Self-Assessment

### Artifacts completed (Pass 1):
1. ✅ executive-brief.md — comprehensive lead story analysis
2. ✅ swot-analysis.md — SWOT with strategic matrix
3. ✅ stakeholder-analysis.md — 8 stakeholders with detailed perspective analysis
4. ✅ risk-assessment.md — 5 risks with ACH methodology
5. ✅ coalition-dynamics.md — structural coalition analysis with scenario modelling
6. ✅ actor-mapping.md — primary actors and interest-power matrix
7. ✅ timeline-analysis.md — chronological reconstruction with future calendar
8. ✅ intelligence/mcp-reliability-audit.md — tool audit and data gaps

### Quality Gate Self-Check:

| Criterion | Status | Notes |
|-----------|--------|-------|
| ≥80 words per SWOT item | ✅ | Each SWOT item is 80-200+ words |
| ≥150 words per stakeholder perspective | ✅ | Each stakeholder profile is 150-400+ words |
| ≥60% prose ratio | ✅ | Predominantly prose with data tables for context |
| Zero [AI_ANALYSIS_REQUIRED] markers | ✅ | All sections written |
| IMF requirement | ✅ | `not_required` for this run's topics — documented |
| Confidence labels on all claims | ✅ | 🟢/🟡/🔴 labels throughout |
| Source attribution | ✅ | EP Open Data Portal cited throughout |
| No placeholders | ✅ | All sections substantively completed |

### Pass 2 Self-Review Notes:

**Sections requiring depth improvement:**
1. **Stakeholder analysis — EPP section**: Could be strengthened with more specific EPP MEP names from the speeches feed on key debates. Speaker IDs obtained but names not resolved — this is an API limitation.
2. **Coalition dynamics**: The vote prediction sections would benefit from historical comparison data from EP9 votes on similar topics. Not available in current run.
3. **Risk-004 (MFF distributional conflict)**: The specific country-by-country EU budget exposure figures would strengthen this risk. World Bank or Eurostat data would help — deferred to enhancement.

**Substantive additions from Pass 2:**
- Added ACH methodology to risk assessment (Risk Assessment section)
- Strengthened geopolitical context in executive brief (peace negotiation risk)
- Expanded Patryk Jaki context in actor mapping
- Added legislative velocity analysis to timeline section

---

## Analytical Confidence Calibration Summary

| Analysis Domain | Overall Confidence |
|----------------|-------------------|
| What was adopted (facts) | 🟢 HIGH |
| Which groups likely supported/opposed | 🟡 MEDIUM |
| Geopolitical significance and context | 🟢 HIGH |
| Vote margins | 🔴 LOW (predicted only) |
| External actor responses | 🟡 MEDIUM |
| Economic implications | 🟡 MEDIUM (limited data) |
| Long-term forecasts (MFF, partnerships) | 🟡 MEDIUM-HIGH (structural confidence) |

---

## Lessons for Future Runs

1. **EP adopted text content lag:** For breaking news runs within 48-72 hours of adoption, plan for 404 errors on full text content. Metadata + debate context + structural analysis is sufficient for same-day breaking news.
2. **Events feed reliability:** The events/feed endpoint is consistently unreliable. Default to speeches + meetings decisions + plenary sessions.
3. **IMF data integration:** For the Middle East economic debate, a WTO-or-IMF-primed data query would significantly strengthen the energy-food nexus analysis.
4. **Gatekeeper contact patterns:** For DMA stories, consider using the EP committee system (IMCO) as the primary analysis anchor rather than adopted texts alone — IMCO reports pre-date resolutions and contain richer technical analysis.
