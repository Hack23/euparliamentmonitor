<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EU Parliament Breaking News, April 28, 2026

**Date:** 2026-04-29 | **Run ID:** breaking-run-1777424088 | **Article Type:** breaking

---

## Overview

This index provides a navigational map of all analysis artifacts produced for the April 28, 2026 breaking news run. Read this index first to understand which artifacts to consult for specific intelligence questions.

---

## Tier 1 — Core Intelligence (Read First)

| Artifact | File | Purpose | Lines | Floor |
|----------|------|---------|-------|-------|
| Executive Brief | `executive-brief.md` | Quick-scan: top stories, significance, action items | 169 | 180 |
| Synthesis Summary | `intelligence/synthesis-summary.md` | Full political intelligence narrative | 168 | 205 |
| Scenario Forecast | `intelligence/scenario-forecast.md` | 3 scenarios: Optimistic/Base/Pessimistic with WEP | 206 | 280 |
| Stakeholder Map | `intelligence/stakeholder-map.md` | Key actors, interests, influence vectors | 201 | 305 |
| Significance Classification | `classification/significance-classification.md` | Tier 1-4 significance for each document | 110 | 105 |

---

## Tier 2 — Analytical Deep Dives

| Artifact | File | Purpose | Lines | Floor |
|----------|------|---------|-------|-------|
| PESTLE Analysis | `intelligence/pestle-analysis.md` | Political/Economic/Social/Tech/Legal/Environmental | 166 | 250 |
| Coalition Dynamics | `intelligence/coalition-dynamics.md` | Group composition, coalition viability analysis | 129 | 135 |
| Threat Model | `intelligence/threat-model.md` | Structured threat assessment by category | 166 | 250 |
| Wildcards & Black Swans | `intelligence/wildcards-blackswans.md` | Low-probability high-impact scenarios | 225 | 275 |
| Economic Context | `intelligence/economic-context.md` | IMF macroeconomic baseline and sectoral analysis | 185 | 185 |
| Risk Matrix | `risk-scoring/risk-matrix.md` | 5×5 risk matrix, 7 risks with scores | 155 | 150 |
| Quantitative SWOT | `risk-scoring/quantitative-swot.md` | Weighted SWOT with scores and strategy matrix | 145 | 140 |

---

## Tier 3 — Supporting Documentation

| Artifact | File | Purpose | Lines | Floor |
|----------|------|---------|-------|-------|
| Document Analysis Index | `documents/document-analysis-index.md` | All EP documents analysed: TA-10-2026-0105 to 0123 | 148 | 95 |
| MCP Reliability Audit | `intelligence/mcp-reliability-audit.md` | Tool invocation log, data quality, fallbacks used | 200 | 385 |
| Significance Scoring | `intelligence/significance-scoring.md` | Per-item significance scores (quantitative) | — | 105 |
| Voting Patterns | `intelligence/voting-patterns.md` | Vote alignment (proxy — roll-call unavailable) | — | 150 |

---

## Key Analytical Findings (Cross-Artifact Summary)

### Finding 1: MFF 2028–2034 — Parliament Claims Ambitious Role

The April 28 interim report (TA-10-2026-0111) establishes Parliament's baseline at €1.2–1.4 trillion with three new own resources. Historical precedent (2013, 2020 MFF negotiations) suggests Council will attempt 15–25% downward revision. The key question is whether Parliament can maintain coalition unity through the negotiation cycle.

**Supporting artifacts:** synthesis-summary.md, scenario-forecast.md, quantitative-swot.md, risk-matrix.md (R-01)

### Finding 2: Six Simultaneous Immunity Waivers — Democratic Accountability Signal

The unprecedented six-waiver session (ECR ×4, NI ×2) reflects the accountability pressures facing the far-right in the 10th legislature. The pro-EU majority's consistent support for all six waivers demonstrates institutional cohesion on rule-of-law norms.

**Supporting artifacts:** coalition-dynamics.md, stakeholder-map.md, threat-model.md (T2.1–2.3), significance-classification.md

### Finding 3: Social Rights — High Visibility, Low Implementation Guarantee

Consent legislation resolution (TA-10-2026-0120) passed with strong majority but no binding mechanism. The gap between parliamentary aspiration and legal enforcement capacity is the central vulnerability of Parliament's progressive social rights agenda.

**Supporting artifacts:** synthesis-summary.md, pestle-analysis.md, wildcards-blackswans.md (W4.1)

---

## Data Sources

| Source | File | Quality |
|--------|------|---------|
| April 28 adopted texts (19 items) | `data/adopted-texts-2026-04-28.json` | 🟢 COMPLETE |
| Political landscape (9 groups, 719 MEPs) | `data/political-landscape.json` | 🟢 COMPLETE |
| Coalition analysis (similarity scores) | Embedded in coalition-dynamics.md | 🟡 PROXY |
| IMF WEO April 2026 | Economic-context.md | 🟢 AUTHORITATIVE |
| EP voting records April 28 | ❌ UNAVAILABLE (API delay) | 🟡 EXPECTED |

---

## Manifest Reference

Full artifact registry with line counts and gate results is in `manifest.json` (root of analysis directory).

---

*EU Parliament Monitor | Analysis Index | 2026-04-29 | breaking-run-1777424088*
