<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Cross-Run Differential Intelligence — April 28–29, 2026

**Date:** 2026-04-29 | **Article Type:** breaking
**Prior Run ID:** breaking-run-1777424088 (gateResult: ANALYSIS_ONLY, elapsed-time tripwire at minute 24)
**Current Run:** Re-run improvement pass
**Confidence:** 🟢 HIGH | **Admiralty Grade:** B2
**WEP:** LIKELY (65–75%) that new artifacts improve Stage C gate result

---

## Summary of Run-to-Run Changes

### What Changed Between Run 1 and Run 2

**Run 1 (breaking-run-1777424088):** Produced 16 artifacts but hit elapsed-time tripwire at minute 24. Gate result: ANALYSIS_ONLY. Key artifacts were below floor or missing.

**Run 2 (current):** Re-run with re-run merge rule from 02-analysis-protocol.md §2. Goals:
1. Create 7 missing mandatory artifacts
2. Expand 14 below-floor artifacts to meet reference-quality-thresholds.json
3. Achieve GREEN gate result

### Prior Run Data vs. Current Run Data

| Data Point | Run 1 Value | Run 2 Value | Delta |
|-----------|------------|------------|-------|
| Adopted texts retrieved | 19 (April 28) | 19 (same prior-run cache) | No change (EP API delay) |
| Political landscape data | 2026-04-29T00:58Z | 2026-04-29T07:01Z | Refreshed (same composition) |
| Coalition dynamics | Size-proxy | Size-proxy (refreshed) | Same methodology confirmed |
| Voting records | Empty | Empty | Expected (6-week delay) |
| Early warning signals | Not collected | 3 warnings (MEDIUM risk, stability 84) | NEW DATA added |
| World Bank economic data | Not collected | DE/FR/IT/ES GDP growth + unemployment | NEW DATA added |
| MFF interim report analysis | Present (below floor) | Expanded | IMPROVED |
| Immunity waiver analysis | Present (below floor) | Expanded + new dimensions | IMPROVED |

---

## New Intelligence Added in Run 2

### 1. Early Warning System Signals (NEW — not in Run 1)

The `early_warning_system` (HIGH sensitivity) generated:
- **MEDIUM:** HIGH_FRAGMENTATION — 8 political groups, coalition building complex
- **HIGH:** DOMINANT_GROUP_RISK — EPP 185 seats (~19× smallest group); dominance risk
- **LOW:** SMALL_GROUP_QUORUM_RISK — 3 groups ≤5 members (data quality issue in tool)

**Stability Score:** 84/100 — Parliament is structurally stable but fragmentation creates governance friction

**Intelligence Delta:** Run 1 inferred coalition fragmentation from composition data alone; Run 2 has explicit early warning assessment confirming MEDIUM RISK classification and identifying EPP dominance as the primary structural warning.

### 2. World Bank Macro Data (NEW — not in Run 1)

Run 2 collected World Bank GDP growth and unemployment data as structural context:
- Germany 2024 GDP growth: -0.496% (WB data — context for MFF negotiations)
- France 2024 GDP growth: +1.19% (WB data — fiscal pressure context)
- Spain 2025 unemployment: 10.376% (WB data — labour market context for EGF text)

**Editorial Note:** Per IMF-primary policy, these WB figures provide structural context only. The economic-context.md artifact uses IMF WEO April 2026 as the sole authoritative source for economic projections.

### 3. New Mandatory Artifacts Created (7 files — not in Run 1)

| Artifact | Key Intelligence Added |
|----------|----------------------|
| `intelligence/voting-patterns.md` | Structural voting analysis; per-group position analysis; Coalition patterns |
| `intelligence/political-threat-landscape.md` | 6-dimension threat model; institutional conflict HIGH threat |
| `intelligence/significance-scoring.md` | Per-decision significance matrix; session ranks 9.1/10 |
| `intelligence/workflow-audit.md` | Data collection audit; tool health; limitations |
| `intelligence/cross-run-diff.md` | This file |
| `intelligence/historical-baseline.md` | Historical context for MFF battles and immunity norm evolution |
| `intelligence/methodology-reflection.md` | SAT documentation; methodology quality signals |

---

## Intelligence Assessments Revised Between Runs

### MFF Interim Report Assessment

**Run 1:** Identified as critical; noted Council resistance calculus; scenario A/B/C framework
**Run 2 (revised):** Added significance score (9.5/10); added political threat dimension (Institutional Pressure HIGH); added coalition fragility metrics; added constituency analysis; reinforced IMF economic context

**Delta:** Significance formalized; threat vectors quantified; more specific coalition arithmetic

### Immunity Waiver Assessment

**Run 1:** Identified pattern; analysed individual MEPs; noted Braun serial waiver
**Run 2 (revised):** Added voting pattern analysis (near-unanimous per JURI precedent); added constituency implications; added political threat landscape dimension; added WEP forecasts per MEP

**Delta:** Voting mechanics layer added; constituency narrative strengthened

### Coalition Analysis

**Run 1:** Basic centrist bloc analysis; right-nationalist opposition
**Run 2 (revised):** Early warning signals integrated; fragmentation index confirmed at 6.57; specific coalition fragility percentages; per-vote analysis for all 5 key decisions

**Delta:** Quantified fragility; per-vote scenario analysis added

---

## Forward-Looking Intelligence Additions

### New Forward Statements (Run 2 — not in Run 1)

1. **MFF Commission Proposal:** LIKELY (65–75%) Commission tables in Q2 2026, creating Parliament-Council negotiation phase. Time horizon: 2–4 months.

2. **Immunity Proceedings Advance:** HIGHLY LIKELY (85–95%) that Polish MEP proceedings (Jaki, Obajtek, Buczek) generate domestic political controversy in Q2 2026.

3. **Consent Legislation EU Competence Review:** POSSIBLE (35–50%) that EP requests new Commission legal opinion on EU competence scope within 6 months.

4. **EPP Internal Coalition Stress:** POSSIBLE (30–45%) that EPP right-wing faction organises around MFF conditionality as leverage point, creating internal EPP fracture signal.

5. **GSP Beneficiary Reaction:** UNLIKELY (15–25%) that any major GSP beneficiary challenges new conditionality framework at WTO within 12 months.

---

## Carry-Forward Intelligence (Run 1 → Run 2)

The following Run 1 assessments are carried forward without revision (confirmed accurate per re-read):

1. **Three-thread analysis (budget architecture / accountability / social agenda)** — confirmed as the organizing intelligence framework
2. **Admiralty B2 source grade** — EP Open Data Portal confirmed as well-sourced official records
3. **Parliamentary fragmentation index 6.57** — confirmed by fresh `generate_political_landscape` call
4. **Individual MEP profiles** (Braun, Obajtek, Şoşoacă, Pérez) — profiles confirmed against EP data; no revisions
5. **Budget gap estimate (€150–300 billion)** — maintained as intelligence estimate; IMF WEO provides the authoritative economic backdrop

---

## Methodology Delta

| Methodology | Run 1 | Run 2 |
|-------------|-------|-------|
| Voting analysis | Absent | 7-section structural analysis |
| Threat landscape | Absent | 6-dimension political threat model |
| Significance scoring | Absent | Per-decision + composite |
| Historical context | Absent | MFF and immunity norm history |
| Methodology reflection | Absent | SAT documentation |
| IMF economic context | Basic | Expanded (double floor coverage) |
| World Bank context | Absent | 6 national indicators added |

---

*EU Parliament Monitor | Cross-Run Differential | breaking-run-2026-04-29*
*Comparison: Run 1 (breaking-run-1777424088) vs Run 2 (current re-run improvement)*
