<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Document Analysis Index — EU Parliament Motions April 2026

---

## 📄 Source Document Inventory

| Document ID | Title/Description | Source | Available? | Key Content |
|-------------|------------------|--------|:----------:|------------|
| T10-0161/2026 | Ukraine: accountability, Russian war crimes | EP Adopted Texts (DOCEO) | ✅ | Special Tribunal demand, 17th sanctions package, accession |
| T10-0162/2026 | Armenia: democratic resilience, EU integration | EP Adopted Texts (DOCEO) | ✅ | Association agreement, Azeri prisoner releases, EU family |
| T10-0163/2026 | Cyberbullying of children | EP Adopted Texts (DOCEO) | ✅ | DSA extension, platform liability, school protocols |
| T10-0160/2026 | Digital Markets Act enforcement (Google/Apple) | EP Adopted Texts (DOCEO) | ✅ | DMA Article 5/6 compliance, structural remedies |
| T10-0151/2026 | Haiti: human trafficking, gang control | EP Adopted Texts (DOCEO) | ✅ | Emergency aid, targeted sanctions, diplomatic coordination |
| T10-0112/2026 | 2027 EU Budget guidelines | EP Adopted Texts (DOCEO) | ✅ | ReArm EU, cohesion, climate 30% |
| T10-0105/2026 | Immunity waiver: Zbigniew Jaki (MEP) | EP Adopted Texts (DOCEO) | ✅ | MEP immunity waiver for Polish proceedings |
| T10-0115/2026 | Dog and cat welfare | EP Adopted Texts (DOCEO) | ✅ | Animal companion regulation mandate |
| T10-0119/2026 | EIB 2025 annual report | EP Adopted Texts (DOCEO) | ✅ | EIB lending, climate alignment, governance |
| T10-0122/2026 | Performance instruments | EP Adopted Texts (DOCEO) | ✅ | Results-based funding accountability |
| T10-0132/2026 | Discharge: CoR 2024 budget | EP Adopted Texts (DOCEO) | ✅ | CoR financial oversight |
| T10-0142/2026 | EU-Iceland PNR Agreement | EP Adopted Texts (DOCEO) | ✅ | Passenger data security, data protection |
| T10-0157/2026 | Livestock/animal welfare regulation | EP Adopted Texts (DOCEO) | ✅ | Farm-to-Fork recalibration, transport rules |
| ROLL-CALL-2026-04 | April 2026 roll-call voting records | EP DOCEO | ❌ DELAYED | Vote margins, individual MEP records |
| DOCEO-SPEECHES-04-2026 | Plenary debate speeches April 28-30 | EP DOCEO | ❌ DELAYED | Debate record, floor leaders |

---

## ⚠️ Data Availability Gaps

**Roll-call voting records:** Publication delayed 4–6 weeks from plenary session. April 28-30 records expected ~June 2026. All vote margin analysis in this run is estimate-quality.

**Plenary debate transcripts:** Available with similar delay. Quote integration not possible in this run.

**Procedure files:** Individual procedure documents (legislative procedure, committee reports, amendments) are theoretically available via `/api/v2/procedures/{id}` but procedure feed returned empty — direct procedure ID lookups were not performed due to Stage A MCP call budget constraint.

---

## 🗂️ Document Utilization for Analysis Artifacts

| Analysis Artifact | Primary Source Documents |
|------------------|--------------------------|
| executive-brief.md | T10-0161, T10-0112, T10-0162, T10-0160, T10-0151 |
| intelligence/stakeholder-map.md | T10-0161, T10-0162, T10-0160, meps-feed.json |
| intelligence/voting-patterns.md | T10-0161 (estimates), meps-feed.json (group sizes) |
| intelligence/economic-context.md | T10-0112, IMF WEO April 2026 |
| classification/significance-classification.md | All 13 texts |
| risk-scoring/risk-matrix.md | T10-0161, T10-0112, T10-0162, T10-0160 |
| existing/deep-analysis.md | All 13 texts (primary) |
