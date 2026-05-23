<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Methodology Reflection — EP Motions · 2026-05-08

**Run ID:** motions-run380-1778231555
**Methodology:** 10-step AI-driven analysis protocol (per `ai-driven-analysis-guide.md`)

---

## Step 10.5 Reflection: This Run's Methodological Performance

### What worked well

1. **Coalition mathematics:** The ENP calculation (6.58) and per-motion vote projections provided concrete analytical grounding despite the absence of actual roll-call data.

2. **Multi-dossier synthesis:** The synthesis-summary successfully identified the non-obvious connection between DMA enforcement and democratic resilience — the structural argument that Big Tech platform power enables far-right funding and disinformation, making DMA a democratic governance tool, not just a consumer protection instrument.

3. **Historical baseline:** The four comparative cases (GDPR, Ukraine resolutions, EP agricultural motions, Rule 169 pattern) provide robust contextual anchoring that prevents the analysis from being static snapshot reporting.

4. **Economic context:** Despite IMF SDMX failure, the combination of World Bank direct API data (Germany -0.50%, France +1.19%) and publicly documented IMF WEO April 2026 projections provided adequate economic grounding for the analysis.

5. **Threat actor profiling:** The distinction between PfE as "institutional attrition" actor (not trying to win today but accumulating narrative capital for 2029) is analytically novel and validates the 3-scenario structure.

### What was constrained

1. **Actual vote margins unavailable:** The 4-6 week EP roll-call lag means all vote projections are structural estimates, not confirmed data. This is the single most significant analytical gap — actual margins might reveal unexpected coalition behaviours.

2. **Full motion text unavailable:** Analysis is based on titles and EP institutional context, not actual motion language. Specific amendment battles and rapporteur negotiations invisible.

3. **IMF direct data unavailable:** EU-level economic indicators from IMF WEO public publication rather than SDMX API. Confidence reduced on monetary/fiscal projections.

4. **Time pressure on Pass 2:** The 60-minute budget means Pass 2 quality review will be constrained. Priority: synthesis-summary, pestle-analysis, and quantitative-swot (highest analytical value artifacts).

### Methodological Improvements for Next Run

1. **Pre-fetch DOCEO XML separately:** The get_latest_votes tool should be called for earlier dates (4-6 weeks ago) to get actual vote data for the PREVIOUS plenary session while collecting data for the current one.

2. **Committee documents first:** For motions-type analysis, getting committee reports (get_committee_documents) before plenary decisions would provide rapporteur positions and amendment history.

3. **IMF fallback earlier:** If SDMX unavailable, World Bank data retrieval should be expanded immediately — the GDP data retrieved (Germany + France) should be expanded to all 6 major EU economies.

### Confidence Calibration

Overall analysis confidence: 🟡 MEDIUM-HIGH

- Structural/institutional analysis: 🟢 HIGH (coalition math, historical patterns)
- Economic analysis: 🟡 MEDIUM (World Bank confirmed; IMF WEO not via API)
- Vote projections: 🟡 MEDIUM (structural estimates only)
- Scenario probabilities: 🟡 MEDIUM (analytical judgments)
- Threat assessments: 🟡 MEDIUM-HIGH (observable behaviours)

### Pass 2 Actions Required

Before PREFLIGHT_ATTESTATION:
- Re-read pestle-analysis.md → verify depth of political/economic/social dimensions
- Re-read quantitative-swot.md → verify all items ≥80 words
- Re-read stakeholder-map.md → verify all perspectives ≥150 words
- Re-read executive-brief.md → ensure BLUF is crisp and accurate
- Check for any `[AI_ANALYSIS_REQUIRED]` markers → zero tolerance
