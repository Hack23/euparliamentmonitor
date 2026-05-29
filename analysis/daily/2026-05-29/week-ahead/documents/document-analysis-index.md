<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📑 Document Analysis Index — Week Ahead
## Window: 1–5 June 2026 | Produced: 2026-05-29

Index of EP documents and adopted texts consulted this run, mapped to the week-ahead storylines they support. Source endpoints: `get_adopted_texts(year=2026)` (A2), `get_committee_documents` (B3), `get_meeting_foreseen_activities` (B3).

---

## 📚 Adopted Texts Consulted (selection of 41)

| Ref (TA-10-2026-) | Subject | Committee lead | Week-ahead relevance |
|---|---|---|---|
| 0112 | Guidelines for the 2027 Budget — Section III | BUDG | Anchors the dominant June budget storyline |
| 0183 | AI strategy for EU trade | INTA | Competitiveness / trade-tech axis |
| 0160 | Digital Markets Act enforcement | IMCO | Platform-regulation follow-through |
| 0096 | Customs adjustment re US tariffs | INTA | Trade-defence backdrop |
| 0034 | ECB Annual Report 2025 | ECON | Monetary scrutiny continuity |
| 0060 | Appointment of ECB Vice-President | ECON | Institutional-appointments trail |
| 0174 | EU–Uzbekistan Enhanced PCA | AFET/INTA | External-action treaty pipeline |
| 0177 | EU–Lebanon Eurojust cooperation | LIBE | JHA external dimension |
| 0178 | SFPA São Tomé & Príncipe | PECH | Routine fisheries consent |
| 0179 | SFPA Cook Islands | PECH | Routine fisheries consent |
| 0182 | Priorities for UNGA 81st session | AFET | Multilateral positioning |

## 🏛️ Committee Documents

`get_committee_documents` returned 41 AFCO-cluster opinion references (PE-prefixed) without titles or dates — a known limitation of the committee-documents endpoint. They confirm constitutional-affairs activity but cannot be mapped to specific files. Treated as a presence indicator only (Admiralty B3).

## 🗓️ Foreseen Activities (15–18 June plenary)

`get_meeting_foreseen_activities(MTG-PL-2026-06-15)` returned 8 items: 4 untitled debate slots plus meeting-part structure markers. The absence of titles confirms the June agenda is **not yet finalised** as of 2026-05-29 — itself an analytically useful datum (the week ahead is agenda-setting, not agenda-executing).

## 🔗 Provenance

Every document above is traceable to a committed capture under `analysis/daily/2026-05-29/week-ahead/data/`. No document title or reference in this index was inferred; untitled items are explicitly flagged as such.
