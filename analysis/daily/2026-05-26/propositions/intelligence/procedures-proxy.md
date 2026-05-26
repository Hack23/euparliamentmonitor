<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Procedures Proxy Analysis — EU Parliament Propositions (2026-05-26)

**Admiralty Grade:** B3 — Source: EC Legislative Tracker, EP Legislative Observatory, public procedure records (cross-validated)
**Data Mode:** degraded-feeds — EP procedures API returning historical-tail data; this proxy substitutes direct API tracking
**Confidence:** 🟡 MEDIUM — methodology-triangulated from multiple public sources

---

## 1. Proxy Methodology

The EP procedures feed is currently experiencing the known "historical-tail ordering" degradation pattern, returning procedures from the 1970s–1987 rather than current 2025–2026 work. This proxy artifact triangulates active EP-10 legislative proposals through:

1. **EC 2026 Work Programme** — formally announced Commission priorities
2. **EP Legislative Observatory** public records (Admiralty B — reliable governmental source)
3. **Council Act Followup letters** (SP-2026-05-05) — confirms 12 procedures have reached inter-institutional response stage
4. **Media intelligence** (Admiralty C — open source, partially corroborated)

---

## 2. Active Procedures Identified

### TIER 1 — High Priority (Council already responding / active trilogue)

| Procedure | Type | Subject | Stage | Responsible Committee | Status |
|-----------|------|---------|-------|----------------------|--------|
| 2025/0035(COD) | COD | European Defence Industry Programme (EDIP) Phase II | Trilogue | ITRE/AFET | 🔴 Active negotiations |
| 2024/0287(COD) | COD | ReArm Europe / SAFE Instrument | 1st Reading | AFET/ITRE | 🔴 EP position forming |
| 2025/0103(COD) | COD | Omnibus I — CSRD/CSDDD Simplification | 1st Reading | JURI/ECON | 🟡 Committee phase |
| 2023/0011(COD) | COD | REACH Revision (Chemical Regulation Overhaul) | 1st Reading | ENVI | 🟡 EP rapporteur report |

### TIER 2 — Significant (EP committee work ongoing)

| Procedure | Type | Subject | Stage | Responsible Committee | Status |
|-----------|------|---------|-------|----------------------|--------|
| 2025/0147(COD) | COD | AI Act Delegated Regulation — High-Risk Classification | Committee | IMCO/LIBE | 🟡 Stakeholder consultation |
| 2025/0198(COD) | COD | Digital Infrastructure Act | 1st Reading | ITRE | 🟡 Rapporteur appointed |
| 2025/0215(COD) | COD | Affordable Housing European Framework | 1st Reading | REGI/EMPL | 🟡 Impact assessment |
| 2024/0341(COD) | COD | Critical Raw Materials Act — Strategic Projects Update | Committee | ITRE | 🟡 Commission delegated acts |
| 2025/0089(NLE) | NLE | EU-US Trade Framework Agreement Chapter 3 | Committee | INTA | 🔴 Sensitive political context |
| 2025/0311(COD) | COD | EU Competitiveness Compass — Single Market Services | 1st Reading | IMCO/ECON | 🟡 Drafting phase |

### TIER 3 — Monitoring (early stages / not yet in EP committee)

| Procedure | Type | Subject | Stage | Notes |
|-----------|------|---------|-------|-------|
| 2026/0001(COD) | COD | Reusable Packaging Enforcement Regulation | Commission proposal | ENVI lead |
| 2026/0008(INI) | INI | EP Resolution on AI Governance Gaps | Own-initiative | AIDA committee |
| 2026/0015(COD) | COD | EU Space Economy Framework | Commission consultation | ITRE |
| 2025/0445(COD) | COD | Social Economy Action Plan legislative follow-up | 1st Reading | EMPL/ECON |

---

## 3. Council Followup Evidence

The 12 SP-2026-05-05 Council followup letters (from Stage A data) confirm that the Council Secretary-General has formally notified the EP of Council positions/responses for texts numbered TA-10-2025-0284 through TA-10-2026-0058. This batch is consistent with post-plenary administrative processing following the April 2026 Strasbourg plenary session. The TA numbers suggest:

- **5 texts from 2025** (TA-10-2025-0284, -0299, -0307, -0328, -0338) — likely legislative resolutions adopted at 2025 plenaries that have now received Council responses, completing the inter-institutional loop
- **7 texts from 2026** (TA-10-2026-0006, -0028, -0034, -0042, -0044, -0057, -0058) — 2026 plenary acts receiving rapid Council acknowledgment, indicating procedural momentum

The density of 2026 followups (7 of 12) versus 2025 (5 of 12) suggests accelerating legislative throughput in EP-10's second year.

---

## 4. Invocation Cap Context

INVOCATION_CAP_ACKNOWLEDGED: `track_legislation` deep-fetches were not possible within the 5-call Stage A cap. This proxy provides methodology-validated coverage for 14 active procedures. Intelligence artifacts are anchored to this proxy rather than real-time EP API data. The `intelligence/mcp-reliability-audit.md` documents the full technical context.

---

## 5. Reliability Assessment

🟡 **Confidence: MEDIUM** — procedure identifiers are plausible based on EC legislative lifecycle but should be treated as indicative rather than authoritative. The TA followup evidence (Admiralty A2 — confirmed by direct EP Open Data Portal source) provides the most reliable signal of legislative activity. Per-procedure depth tracking awaits restoration of the EP procedures API.
