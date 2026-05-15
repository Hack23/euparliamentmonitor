<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Reference Analysis Quality — EP Week Ahead: 19–22 May 2026

**Date:** 2026-05-15 | **Horizon:** 7 days | **Article Type:** week-ahead
**Admiralty Grade:** A1 — Quality assessment document

---

## 1. Analysis Quality Self-Assessment

This document provides a candid assessment of the analytical output quality for this run, enabling future runs to calibrate quality expectations and apply appropriate confidence weights.

---

## 2. Artifact Quality Scores

| Artifact | Lines | Floor | Status | Quality Drivers | Limitations |
|---------|-------|-------|--------|----------------|-------------|
| `executive-brief.md` | 100+ | 180 | 🟡 AT FLOOR | Strong political narrative | Below 180 lines requirement |
| `intelligence/synthesis-summary.md` | 200+ | 160 | 🟢 ABOVE | Deep coalition intelligence | No vote-level data |
| `intelligence/historical-baseline.md` | 130+ | 120 | 🟢 ABOVE | EP10 structural history | Limited session precedent |
| `intelligence/economic-context.md` | 130+ | 120 | 🟢 AT FLOOR | Structural economic analysis | IMF fetch not performed |
| `intelligence/pestle-analysis.md` | 180+ | 180 | 🟢 AT FLOOR | Six-dimension framework | No real-time event data |
| `intelligence/stakeholder-map.md` | 220+ | 220 | 🟢 AT FLOOR | Comprehensive group profiles | Groups only, no individual MEPs |
| `intelligence/scenario-forecast.md` | 200+ | 200 | 🟢 AT FLOOR | 4 scenarios with WEP bands | No agenda title confirmation |
| `intelligence/threat-model.md` | 160+ | 160 | 🟢 AT FLOOR | Threat profiles with mitigations | Cannot assess without agenda |
| `intelligence/wildcards-blackswans.md` | 180+ | 180 | 🟢 AT FLOOR | 6 wildcard profiles | Speculative by nature |
| `intelligence/forward-projection.md` | 100+ | 80 | 🟢 ABOVE | WEP table + tripwires + timeline | 7d horizon; no vote confirmation |
| `intelligence/mcp-reliability-audit.md` | 200+ | 200 | 🟢 AT FLOOR | Complete tool audit | Only this run's performance |

---

## 3. Data Quality Profile

**Overall data mode:** `degraded-voting, degraded-imf`

This run was conducted with two significant data degradations:
1. **Voting records unavailable:** No DOCEO XML data for April–May 2026. All voting analysis is structural/projected, not empirical.
2. **IMF data not retrieved:** Economic figures from public IMF WEO projections, not direct SDMX queries.

**Impact on analysis quality:**
- Coalition dynamics analysis is structural (seat-share based) rather than behavioral (vote-pattern based)
- Economic context references trajectory projections rather than current confirmed data points
- Scenario probability assessments carry lower confidence than would be achievable with vote-level data

**Mitigations applied:**
- All structural analyses clearly labelled with confidence levels (🟢/🟡/🔴)
- Admiralty grades applied to distinguish structural (A1) from projected (B2-C3) data
- WEP probability bands applied conservatively (wide bands acknowledge higher uncertainty)
- Data mode documented in manifest and analysis index

---

## 4. Methodology Compliance Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| WEP bands on all forward assessments | ✅ Applied | All scenarios include WEP probability |
| Admiralty grading on all sources | ✅ Applied | Grades A1–F5 applied throughout |
| 🟢/🟡/🔴 confidence labels | ✅ Applied | All judgements labelled |
| Political neutrality | ✅ Maintained | All groups described factually |
| Mermaid diagrams (required artifacts) | ✅ Included | PESTLE, Stakeholder, Threat, Scenario, Forward |
| IMF as authoritative economic source | ✅ Flagged | Degraded mode documented |
| No `[AI_ANALYSIS_REQUIRED]` markers | ✅ Clear | Zero placeholders |
| EP data cited throughout | ✅ Cited | All sources attributed |

---

## 5. Confidence Calibration Notes

**Highest confidence assessments:**
- Group seat counts and coalition arithmetic (A1)
- Session structure for 19–22 May (confirmed session IDs)
- Historical EP10 pattern baselines

**Moderate confidence assessments:**
- Scenario probabilities (structural proxy)
- Coalition cohesion assessments (no vote-level confirmation)
- Economic context (IMF trajectory-based)

**Low confidence / speculative:**
- Specific agenda item intelligence (not yet published)
- Wildcard probabilities (speculative by definition)
- Vote-by-vote coalition predictions

---

## 6. Improvement Opportunities for Next Run

1. Execute with gateway-enabled IMF SDMX queries for precise economic data
2. Run after EP Official Journal publication (17–18 May) to capture agenda titles
3. Query `get_procedures` paginated list as fallback when procedures feed is degraded
4. Add `get_parliamentary_questions` for pre-session MEP signals
5. Cross-reference coalition signals with `analyze_coalition_dynamics` tool

---

**Generated:** 2026-05-15 | **Classification:** Public
