<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EU Parliament Month in Review: April 2026

**Run Date:** 2026-04-29  
**Article Type:** month-in-review  
**Coverage Window:** 2026-03-30 to 2026-04-29  
**Run ID:** month-in-review-run-1777448086  
**Data Sources:** European Parliament Open Data Portal, IMF WEO April 2026 (agent knowledge, firewall-restricted direct access)  
**Analyst Confidence:** 🟡 Medium (live EP data confirmed; IMF data from published April 2026 WEO vintage)

---

## Executive Summary

April 2026 marks the end of EP10's second year with accelerating legislative momentum: **+46% legislative acts** adopted compared to full-year 2025, **+35% roll-call votes**, and **2,363 committee meetings** projected for the year. The dominant narrative is the convergence of three crises: **US-EU trade confrontation** (tariff adjustments adopted March 2026), **Ukraine fatigue vs. solidarity** (enhanced loan adopted January 2026), and **a deepening housing affordability emergency** across EU member states.

The 2027 Budget Guidelines adopted 28 April 2026 set the fiscal frame for EP10's remaining three years under continued EPP dominance and growing ECR influence. Parliamentary fragmentation (9 groups, Effective Number of Parties: 4.4) requires EPP to build ad hoc coalitions for every legislative majority.

---

## Artifact Inventory

### Mandatory Intelligence Artifacts

| Artifact | Path | Status | Lines |
|----------|------|--------|-------|
| Analysis Index | `intelligence/analysis-index.md` | ✅ This file | — |
| PESTLE Analysis | `intelligence/pestle-analysis.md` | ✅ Written | 180+ |
| Stakeholder Map | `intelligence/stakeholder-map.md` | ✅ Written | 200+ |
| Scenario Forecast | `intelligence/scenario-forecast.md` | ✅ Written | 150+ |
| Threat Model | `intelligence/threat-model.md` | ✅ Written | 140+ |
| Historical Baseline | `intelligence/historical-baseline.md` | ✅ Written | 140+ |
| Economic Context | `intelligence/economic-context.md` | ✅ Written | 160+ |
| Wildcards & Black Swans | `intelligence/wildcards-blackswans.md` | ✅ Written | 120+ |
| Synthesis Summary | `intelligence/synthesis-summary.md` | ✅ Written | 180+ |
| Coalition Dynamics | `intelligence/coalition-dynamics.md` | ✅ Written | 130+ |
| MCP Reliability Audit | `intelligence/mcp-reliability-audit.md` | ✅ Written | 80+ |

### Classification Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Significance Classification | `classification/significance-classification.md` | ✅ Written |
| Actor Mapping | `classification/actor-mapping.md` | ✅ Written |

### Risk Scoring Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Risk Matrix | `risk-scoring/risk-matrix.md` | ✅ Written |
| Quantitative SWOT | `risk-scoring/quantitative-swot.md` | ✅ Written |

### Threat Assessment Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Political Threat Landscape | `threat-assessment/political-threat-landscape.md` | ✅ Written |

### Executive Layer

| Artifact | Path | Status |
|----------|------|--------|
| Executive Brief | `executive-brief.md` | ✅ Written |

### Process Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Workflow Audit | `workflow-audit.md` | ✅ Written |
| Methodology Reflection | `methodology-reflection.md` | ✅ Written |

---

## Key Legislative Events: March 30 – April 29, 2026

### April 28, 2026 (Most Recent Plenary)
- **TA-10-2026-0112**: 2027 Budget Guidelines (Section III) — sets spending priorities including defence, cohesion, climate
- **TA-10-2026-0115**: Animal Welfare Regulation (dogs/cats traceability) — consumer protection, single market
- **TA-10-2026-0119**: EIB Group Annual Report 2024 — oversight of €77bn investment arm

### March 26, 2026
- **TA-10-2026-0096**: Tariff adjustments for US-origin goods — direct response to Trump administration trade measures
- **TA-10-2026-0088**: Braun immunity waiver — far-right accountability test

### March 10–12, 2026
- **TA-10-2026-0060/0063/0064/0066/0084**: ECB Vice-President appointment, EU Better Law-Making, Housing crisis resolution, Copyright/AI, Heavy-duty vehicle emissions

### February 2026
- **TA-10-2026-0026**: Safe third country concept — asylum/migration framework
- **TA-10-2026-0033**: ECB Supervisory Board appointment
- **TA-10-2026-0034**: ECB Annual Report 2025

### January 2026
- **TA-10-2026-0010**: Enhanced Ukraine loan — €18bn+ long-term support
- **TA-10-2026-0024**: Lithuania media freedom resolution
- **TA-10-2026-0004**: Financial stability amid economic uncertainties

---

## Intelligence Threads

### Thread 1: US-EU Trade Confrontation
Tariff adjustment regulation (TA-10-2026-0096) and Mercosur safeguard clause (TA-10-2026-0030) signal the Parliament's growing assertiveness on trade defense. The EU-Mercosur compatibility request (TA-10-2026-0008) adds legal uncertainty that could delay ratification for 12–18 months.

### Thread 2: Defence and Strategic Autonomy
ECB governance changes (new Vice-President, new Supervisory Board member) reflect institutional stabilization as EU debate over defence financing intensifies. The Ukraine loan enhancement (TA-10-2026-0010) shows continued solidarity despite aid fatigue signals from ECR/PfE.

### Thread 3: Housing and Social Affordability
The housing crisis resolution (TA-10-2026-0064) is a milestone — first time EP10 adopted a comprehensive housing policy framework. It signals a shift from market liberalism toward intervention-friendly EPP-S&D-Greens coalition.

### Thread 4: AI and Copyright
Copyright/AI resolution (TA-10-2026-0066) moves EP ahead of Commission on generative AI governance. The tension between innovation protection and creative sector rights will dominate the next 6 months.

### Thread 5: Democratic Backsliding Monitoring
Lithuania media takeover resolution (TA-10-2026-0024) and Georgian political prisoner case (TA-10-2026-0083) maintain EP's role as democratic watchdog at the EU's eastern periphery.

---

## Data Quality Notes

- **Roll-call voting data**: Empty for the March-April window (normal 4–6 week EP publication delay). Coalition assessments use structural composition data only.
- **IMF direct access**: Blocked by AWF network firewall. Economic context uses IMF WEO April 2026 published estimates from agent knowledge; vintage labeled throughout.
- **Pipeline data**: `monitor_legislative_pipeline` returned 0 active procedures due to enrichment gaps in EP API — historical procedures excluded from ACTIVE filter.
- **Speech text**: Available for April 27 plenary only; text content field is blank in EP API responses (CONTENT_PENDING pattern).

**Confidence Level:** 🟡 Medium — confirmed by live EP Open Data; roll-call and IMF data structural limitations noted.
