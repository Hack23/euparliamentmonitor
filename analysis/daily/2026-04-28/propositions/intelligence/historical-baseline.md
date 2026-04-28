<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Historical Baseline — EU Parliament Propositions
## Reference Context for EP10 Legislative Activity

**Admiralty Grade:** B2 | **Run Date:** 2026-04-28

---

## 1. Legislative Activity Benchmarks

### EP9 (2019–2024) Reference Data

The 9th European Parliament (2019–2024) adopted:
- **Ordinary legislative procedure (COD/CNS)**: ~550 texts across 5 years
- **Non-legislative resolutions**: ~1,200 texts
- **Average adopted texts per year**: ~350 (combined legislative + non-legislative)

**Q1 2026 vs historical average**: 104 texts in 14 weeks represents a **pace of ~386/year annualised** — approximately 10% above EP9 average. However, comparison is complicated by the high proportion of non-controversial texts (GMO objections, EGF applications, international agreements) in the EP10 count.

### Banking Union Legislation Timeline

| Milestone | Date | Significance |
|-----------|------|-------------|
| Banking Union established | 2012–2014 | SSM, SRM, BRRD1 |
| BRRD2 adopted | 2019 | EP9 |
| SRMR2 adopted | 2019 | EP9 |
| DGSD2 proposal | 2023 | Commission |
| SRMR3 proposal | 2023 | Commission |
| BRRD3 proposal | 2023 | Commission |
| Trilogue agreement | 2025 (est.) | EP10 committee phase |
| SRMR3/BRRD3/DGSD2 adopted | March 26, 2026 | ✅ EP10 |

The 12-year journey to completing the Banking Union prudential framework reflects the political complexity of financial integration — each reform required unanimous or qualified majority in Council while EP pushed for stronger depositor protection.

### Immigration Legislation Trajectory

| Package | EP Term | Date | Status |
|---------|---------|------|--------|
| Dublin III | EP7 | 2013 | Implemented |
| Reception Conditions Directive | EP7 | 2013 | Implemented |
| Pact on Migration and Asylum (10 acts) | EP9 | 2024 | Transposition ongoing |
| Safe Third Country Revision | EP10 | Feb 2026 | ✅ Adopted |
| Safe Countries of Origin (EU list) | EP10 | Feb 2026 | ✅ Adopted |

---

## 2. Political Group Historical Baselines

### EP10 vs EP9 Group Sizes (Directional Comparison)

| Group | EP9 Start (2019) | EP10 Start (2024) | April 2026 (sample) |
|-------|-----------------|------------------|---------------------|
| EPP | 182 | ~188 | 75 (200 sample) |
| S&D | 154 | ~136 | 41 (200 sample) |
| Renew | 108 | ~77 | 14 (200 sample) |
| Greens/EFA | 74 | ~53 | 16 (200 sample) |
| ECR | 62 | ~78 | 14 (200 sample) |
| ID/PfE | 73 | ~84 | 21 (200 sample) |
| The Left | 39 | ~46 | 10 (200 sample) |
| NI | ~57 | ~45 | 7 (200 sample) |
| ESN | n/a | ~25 | 2 (200 sample) |

*Note: EP10 full composition = ~720 MEPs; 200-MEP sample from Open Data Portal as of April 28, 2026. Sample proportions directionally reliable. Full EP9 figures from official EP records.*

### Historical Coalition Patterns

The dominant legislative coalition in EP9 was the **"cordon sanitaire" coalition** (EPP+S&D+Renew+Greens), which held ~70% of seats. This coalition frayed in EP10:
- Renew Europe fragmented (lost ~28% of EP9 seats)
- Greens/EFA declined (lost ~28% of EP9 seats)
- Right-wing groups (ECR, PfE/ID) grew significantly

The EP10 "working majority" has shifted to a **flexible EPP-anchored coalition** that varies by policy area — conservative coalition with ECR/PfE on migration/security; progressive coalition with S&D/Renew on digital/climate.

---

## 3. Procedural Baseline

### Ordinary Legislative Procedure Timing (Historical Average)

| Stage | Average Duration | Min | Max |
|-------|-----------------|-----|-----|
| Commission proposal → EP first reading | 18 months | 3 months | 48 months |
| Trilogue negotiation | 6–12 months | 2 months | 36 months |
| Adoption to transposition deadline | 24 months (typical) | 12 months | 36 months |
| Full implementation | 36–60 months | 24 months | 84 months |

The Banking Union Trilogy (proposed 2023, adopted March 2026 = **30 months**) represents a notably fast track for complex financial regulation, reflecting high political priority and pre-negotiated Council-EP positions from the 2023 Commission proposal.

---

## 4. April Mini-Plenary Historical Pattern

April mini-plenaries in Strasbourg have historically been used for:
- **First-reading votes** on files where committee work was completed before Easter recess
- **Current affairs resolutions** on geopolitical developments
- **Budgetary amendments** requiring urgent adoption
- **Institutional appointments** (consent procedures)

The April 27–30, 2026 session falls within this pattern. The gap since the last session (March 26) is unusually long (32 days), potentially reflecting negotiations continuing through Easter on sensitive pending dossiers.

---

## 5. MCP Data Reliability Historical Context

The EP Open Data Portal procedures feed has shown **STALENESS_WARNING / RECESS_MODE** behaviour on multiple prior analysis runs. This is a documented upstream pattern (not an error in this analysis) where the feed returns historical archive data during low-activity periods. The pattern was observed in:
- Post-summer recess periods (August–September)
- Post-European elections period (July 2024)
- Inter-session periods longer than ~3 weeks

Mitigation: This analysis uses the direct `/adopted-texts` endpoint (which always returns current data) as the primary data source for legislative activity.

---

*Generated: 2026-04-28 | propositions-run-1777356258*
