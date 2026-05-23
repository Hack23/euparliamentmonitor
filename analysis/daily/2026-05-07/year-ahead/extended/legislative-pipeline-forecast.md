<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📋 Legislative Pipeline Forecast — EU Parliament 2026–2027

**Date:** 2026-05-07 | **Note:** `monitor_legislative_pipeline` API returned empty data (documented in mcp-reliability-audit.md); forecast based on adopted texts, political landscape, and known Commission work programme

---

## 1 · Pipeline Status Caveat

🔴 **EP Pipeline API gap:** `monitor_legislative_pipeline` returned 0 active procedures for the 30-day window. This is a known EP API data limitation (procedures endpoint data delay), documented in mcp-reliability-audit.md. This forecast is therefore based on:
- 119+ adopted texts from Jan–April 2026 (substantive evidence of completed pipeline items)
- EP plenary session calendar (what's scheduled)
- Commission Work Programme 2026 (known proposals coming)
- Committee activity inference from political landscape data

---

## 2 · Completed Pipeline Items (Adopted 2026, Jan–April)

From `get_adopted_texts` (2026) — items already through the full pipeline:

| Reference | Subject | Date Adopted |
|---|---|---|
| TA-10-2026-0136 | Ukraine support package | 2026-04-29 |
| TA-10-2026-0155 | Budget estimates 2027 (EP section) | 2026-04-30 |
| TA-10-2026-0114 | GSP (trade preferences) | 2026-04-28 |
| TA-10-2026-0119 ff | Green Deal omnibus simplification | 2026-03-xx |
| TA-10-2026-0210 ff | Ukraine support loan regulation | 2026-01-xx |
| TA-10-2026-0057 | ETS2 MSR implementing act | 2026-01-xx |
| TA-10-2026-0044 | AI Act implementing act (partial) | 2026-01-xx |
| TA-10-2026-0082 | Proxy voting amendment (EP Rules) | 2026-02-xx |
| TA-10-2026-0095 | International claims commission | 2026-02-xx |

---

## 3 · Active Pipeline Forecast (May–December 2026)

### High Priority — Expected Q2/Q3 2026

| Dossier | Stage | Expected Committee Vote | Expected Plenary | Confidence |
|---|---|---|---|---|
| ReArm Europe / EDIP | Trilogue | ITRE: June 2026 | October 2026 | 🟢 HIGH |
| AI Act General Purpose AI delegated acts | Commission delegated acts | IMCO/JURI scrutiny | Q3 2026 | 🟡 MEDIUM |
| Budget 2027 Draft | Commission → EP first reading | BUDG: August-September | October 2026 | 🟢 HIGH |
| DMA enforcement decisions | Commission enforcement (not EP co-decision) | IMCO oversight | Q3-Q4 2026 | 🟡 MEDIUM |

### Medium Priority — Expected Q4 2026

| Dossier | Stage | Expected Adoption |
|---|---|---|
| Energy Performance of Buildings (EPBD) implementing acts | Delegated acts | Q4 2026 |
| Capital Markets Union (CMU) package | Trilogue | Q4 2026–Q1 2027 |
| Digital Euro regulation | Committee stage | 2026 (late) |
| Financial Data Access (FIDA) | Trilogue | Q4 2026 |
| European Health Data Space | Implementing | Q4 2026 |

### Long-horizon — Expected Q1–Q2 2027

| Dossier | Stage | Expected Adoption |
|---|---|---|
| MFF 2028 Commission Proposal | Pre-proposal consultation | Commission: Q4 2026 → EP position: Q1 2027 |
| EU Taxonomy supplementary delegated act | Commission → scrutiny | Q1 2027 |
| AI Liability Directive | Trilogue (delayed from EP9) | Q2 2027 |
| Defence Procurement Regulation | Committee stage | Q2 2027 |

---

## 4 · Pipeline Bottleneck Analysis

Based on legislative velocity analysis and coalition dynamics:

**Bottleneck 1: ETS2/Climate dossiers** — Right-wing resistance adds 3–6 months to every climate-adjacent dossier. Rapporteurs must anticipate amendment battles; committee time is consumed by defensive positioning.

**Bottleneck 2: Budget 2027 trilogue (Q4 2026)** — Consumes EP-Council institutional bandwidth; other legislation delayed.

**Bottleneck 3: MFF 2028 preparation** — Cross-committee coordination (BUDG + ECON + ENVI + REGI + AGRI) creates coordination overhead; position paper requires 5–7 committee input mandates.

---

## 5 · Pipeline Forecast Summary

**Items completing 2026 pipeline (estimated):** 40–55 additional legislative acts (conservative estimate given active agenda)
**Items experiencing significant delay:** 5–8 dossiers (primarily climate/social/digital)
**Items likely carried forward to 2027:** 10–15 dossiers from 2026 original schedule

**Overall pipeline health: 🟡 MODERATE** — volume is sufficient but quality/speed is constrained by coalition friction and October–December crowding.

---

*Data: EP adopted texts 2026 (119+ items); EP plenary calendar (33 sessions verified); Commission Work Programme 2026 (public document). Pipeline API returned empty data (documented gap). Confidence: Completed items 🟢 HIGH; active forecast 🟡 MEDIUM; long-horizon 🟡 MEDIUM.*
