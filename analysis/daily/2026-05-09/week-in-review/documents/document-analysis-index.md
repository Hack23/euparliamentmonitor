<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Document Analysis Index — Week in Review (3 Apr – 1 May 2026)

**Purpose:** Catalogue of all documents, sources, and references used in this analysis. Provides auditability and source transparency.

---

## EP Adopted Texts Analysed

| Reference | Title (abbreviated) | Source | Confidence |
|---|---|---|---|
| TA-10-2026-0096 | US tariff retaliation framework | EP feed metadata | 🟡 Medium (content not retrieved) |
| TA-10-2026-0092 | SRMR3 — Single Resolution Mechanism Regulation reform | EP year=2026 listing | 🟡 Medium |
| TA-10-2026-0094 | Anti-corruption/OLAF reform | EP year=2026 listing | 🟡 Medium |
| TA-10-2026-0088 | MEP immunity waiver — Alexander Braun | EP year=2026 listing | 🟢 HIGH (clear from title) |
| TA-10-2026-0105 | MEP immunity waiver — Patryk Jaki | EP year=2026 listing | 🟢 HIGH (clear from title) |
| TA-10-2026-0115 | Animal welfare — long-distance transport | EP year=2026 listing | 🟡 Medium |
| TA-10-2026-0119 | EIB oversight and control | EP year=2026 listing | 🟡 Medium |
| TA-10-2026-0157 | Livestock sustainability — agricultural | EP year=2026 listing | 🟡 Medium |
| TA-10-2026-0160 | DMA enforcement resolution | EP feed metadata | 🟡 Medium (content 404) |
| TA-10-2026-0161 | Ukraine accountability framework | EP feed metadata | 🟡 Medium (content 404) |
| TA-10-2026-0162 | Armenia democratic resilience | EP feed metadata | 🟡 Medium (content 404) |
| TA-10-2026-04-30-ANN01 | Budget 2027 preliminary framework | EP feed metadata | 🟡 Medium |
| TA-10-2026-0084 | HDV emissions credits | EP year=2026 listing | 🟡 Medium |

**Content retrieval limitation:** All April 28-30 Strasbourg session texts (0160-0165) returned 404 DATA_UNAVAILABLE when queried by docId. Content analysis based on title metadata and EP speech records.

---

## EP MCP Data Sources

| Source | Tool Called | Data Retrieved | Quality |
|---|---|---|---|
| Adopted texts feed | `get_adopted_texts_feed(one-month)` | 430 texts (titles/metadata) | 🟢 GOOD |
| Adopted texts year | `get_adopted_texts(year=2026, limit=50)` | 51 texts | 🟢 GOOD |
| Plenary sessions | `get_plenary_sessions(year=2026)` | Limited session list | 🟡 MEDIUM |
| Speeches April 2026 | `get_speeches(dateFrom=2026-04-27, dateTo=2026-04-27)` | 30 speeches | 🟢 GOOD |
| Coalition dynamics | `analyze_coalition_dynamics()` | Full group data | 🟢 GOOD |
| Political landscape | `generate_political_landscape()` | 717 MEPs, 9 groups | 🟢 GOOD |
| Early warning | `early_warning_system(high)` | Stability=84, MEDIUM risk | 🟢 GOOD |
| Procedures feed | `get_procedures_feed(one-month)` | Large dataset | 🟡 MEDIUM |
| Voting records | `get_voting_records(dateFrom/dateTo)` | Empty — EP lag | 🔴 NOT AVAILABLE |
| Latest votes | `get_latest_votes()` | Empty — DOCEO lag | 🔴 NOT AVAILABLE |

---

## External Reference Sources

| Source | Type | Used For |
|---|---|---|
| IMF World Economic Outlook April 2026 | Published report | EU/Eurozone GDP growth, inflation forecasts |
| IMF Fiscal Monitor 2026 | Published report | Banking stress, CRE risk quantification |
| IMF FSAP 2025 EU | Published report | EU banking system capital ratios |
| IMF Climate Investment Report 2025 | Published report | Climate investment gap quantification |
| ECB Monetary Policy Account April 2026 | Published report | ECB rate decisions, financial conditions |
| World Bank WDI | Database | Non-economic indicators (background) |
| EP Press release archive | Public EP website | Plenary session context (indirect) |
| NATO Hague 2026 communiqué | Anticipated | Defence spending target (expected) |

---

## Analysis Artifact Set — This Run

| Artifact | Path | Status | Quality Assessment |
|---|---|---|---|
| executive-brief.md | intelligence/ | ✅ Complete | 🟢 GOOD |
| significance-classification.md | classification/ | ✅ Complete | 🟢 GOOD |
| actor-mapping.md | classification/ | ✅ Complete | 🟢 GOOD |
| pestle-analysis.md | intelligence/ | ✅ Complete | 🟢 GOOD |
| stakeholder-map.md | intelligence/ | ✅ Complete | 🟢 GOOD |
| scenario-forecast.md | intelligence/ | ✅ Complete | 🟢 GOOD |
| coalition-dynamics.md | intelligence/ | ✅ Complete | 🟢 GOOD |
| historical-baseline.md | intelligence/ | ✅ Complete | 🟢 GOOD |
| risk-matrix.md | risk-scoring/ | ✅ Complete | 🟢 GOOD |
| quantitative-swot.md | risk-scoring/ | ✅ Complete | 🟢 GOOD |
| political-threat-landscape.md | threat-assessment/ | ✅ Complete | 🟢 GOOD |
| wildcards-blackswans.md | intelligence/ | ✅ Complete | 🟢 GOOD |
| forces-analysis.md | classification/ | ✅ Complete | 🟢 GOOD |
| impact-matrix.md | classification/ | ✅ Complete | 🟢 GOOD |
| synthesis-summary.md | intelligence/ | ✅ Complete | 🟢 GOOD |
| economic-context.md | intelligence/ | ✅ Complete | 🟡 MEDIUM (IMF API unverified) |
| mcp-reliability-audit.md | intelligence/ | ✅ Complete | 🟢 GOOD |
| political-capital-risk.md | risk-scoring/ | ✅ Complete | 🟢 GOOD |
| legislative-velocity-risk.md | risk-scoring/ | ✅ Complete | 🟢 GOOD |
| document-analysis-index.md | documents/ | ✅ Complete | 🟢 GOOD |
| methodology-reflection.md | (pending) | ⏳ Pending | — |
| manifest.json | (root) | ⏳ Pending | — |

---

## Missing Data Registry

| Data Type | Reason Missing | Impact | Mitigation |
|---|---|---|---|
| TA-10-2026-0160 to 0165 full text | EP API 404 (publication lag) | MEDIUM | Title/metadata analysis used |
| Roll-call voting records April 2026 | EP publication lag 2–6 weeks | HIGH | Coalition inference from structural data |
| Plenary session date-filtered list | EP API bug (dateFrom/dateTo) | LOW | Year filter + client-side date filter |
| IMF real-time SDMX data | API connectivity unverified | LOW | Published IMF reports used |
| MEP individual attendance records | Not queried in Stage A | LOW | Not required for week-in-review theme |

*Source: EP Open Data Portal | EP MCP Server v1.3.1 | Document Index Methodology*
