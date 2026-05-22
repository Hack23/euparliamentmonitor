# Intelligence Analysis Index — EU Parliament Propositions
**Date:** 2026-05-22 | **Run ID:** propositions-run261-1779431162 | **Data Mode:** degraded-feeds

---

## Purpose & Scope

This index maps every analytical artifact produced in this run to its source data, methodology,
and confidence level. It serves as the navigation hub for the article renderer (Stage D) and
for human analysts auditing the analysis chain.

---

## Artifact Registry

### Tier 1 — Core Intelligence (Directly Article-Relevant)

| Artifact | Path | Lines Floor | Confidence | Key Finding |
|----------|------|-------------|------------|-------------|
| Synthesis Summary | `intelligence/synthesis-summary.md` | 160 | 🟢 HIGH | 21 adopted texts confirm EP10 legislative momentum; EPP-S&D coalition stable |
| Stakeholder Map | `intelligence/stakeholder-map.md` | 200 | 🟢 HIGH | EPP dominates committee chairs; PfE/ECR in constructive opposition |
| Scenario Forecast | `intelligence/scenario-forecast.md` | 180 | 🟡 MEDIUM | Three scenarios: accelerated integration, status quo drift, populist disruption |
| PESTLE Analysis | `intelligence/pestle-analysis.md` | 180 | 🟢 HIGH | Digital sovereignty + defense + trade shape current legislative agenda |
| Historical Baseline | `intelligence/historical-baseline.md` | 120 | 🟢 HIGH | EP10 output pace ahead of EP9 equivalent period |

### Tier 2 — Risk & Threat Intelligence

| Artifact | Path | Lines Floor | Confidence | Key Finding |
|----------|------|-------------|------------|-------------|
| Risk Matrix | `risk-scoring/risk-matrix.md` | 100 | 🟡 MEDIUM | EU-Mercosur ratification risk HIGH; DMA enforcement risk MEDIUM |
| Quantitative SWOT | `risk-scoring/quantitative-swot.md` | 100 | 🟡 MEDIUM | Strengths: institutional cohesion; Weaknesses: API data gaps |
| Threat Model | `intelligence/threat-model.md` | 160 | 🟡 MEDIUM | Geopolitical uncertainty (Ukraine, Russia) = primary legislative stress factor |
| Wildcards | `intelligence/wildcards-blackswans.md` | 180 | 🟡 MEDIUM | Scenario: ECJ blocks EU-Mercosur; PfE-ECR legislative coalition |

### Tier 3 — Structural Context

| Artifact | Path | Lines Floor | Confidence | Key Finding |
|----------|------|-------------|------------|-------------|
| Economic Context | `intelligence/economic-context.fallback.md` | 120 | 🟡 MEDIUM | EU GDP growth 1.3% (2026E IMF WEO Apr); fiscal consolidation continues |
| Procedures Proxy | `intelligence/procedures-proxy.md` | 60 | 🟡 MEDIUM | 21 adopted texts as proxy for EP10 legislative velocity |

### Tier 4 — Meta-Analytical

| Artifact | Path | Lines Floor | Confidence | Key Finding |
|----------|------|-------------|------------|-------------|
| MCP Reliability Audit | `intelligence/mcp-reliability-audit.md` | 200 | 🟢 HIGH | 3/8 primary calls degraded; adopted texts = best available source |
| Reference Analysis Quality | `intelligence/reference-analysis-quality.md` | 140 | 🟢 HIGH | Meets floor thresholds; structural requirements satisfied |
| Methodology Reflection | `intelligence/methodology-reflection.md` | 180 | 🟢 HIGH | Degraded-feeds protocol applied correctly |
| Data Availability | `data-availability-assessment.md` | 80 | 🟢 HIGH | Full degradation audit completed |

### Tier 5 — Extended Analysis

| Artifact | Path | Lines Floor | Confidence | Key Finding |
|----------|------|-------------|------------|-------------|
| Executive Brief | `executive-brief.md` | 180 | 🟢 HIGH | Action-ready summary for decision-makers |
| Media Framing | `extended/media-framing-analysis.md` | 200 | 🟡 MEDIUM | Right-wing media: EU overreach; Centre: pragmatic progress |

---

## Data Source Attribution

### Primary (Used in This Run)
1. **EP Adopted Texts 2026** — `get_adopted_texts(year=2026)` — 21 items — 🟢 VERIFIED
2. **EP Political Landscape** — `generate_political_landscape()` — 719 MEPs / 9 groups — 🟢 VERIFIED
3. **IMF WEO April 2026** — Knowledge-based fallback (API key unavailable) — 🟡 FALLBACK

### Degraded (Unavailable This Run)
4. **EP Procedures Feed** — `get_procedures_feed(timeframe=one-week)` — EP API 404 — 🔴 DEGRADED
5. **EP External Documents** — `get_external_documents_feed(timeframe=one-week)` — empty — 🔴 DEGRADED
6. **EP Committee Documents** — `get_committee_documents_feed` — EP API 404 — 🔴 DEGRADED
7. **EP Latest Votes** — `get_latest_votes()` — week not yet published — 🔴 DEGRADED
8. **EP Pipeline Monitor** — `monitor_legislative_pipeline` — 30s timeout — 🔴 DEGRADED

---

## Cross-Reference Map

```
Adopted Texts (21 items)
    ├── → synthesis-summary.md (legislative velocity, thematic clusters)
    ├── → stakeholder-map.md (rapporteur group attribution, committee patterns)
    ├── → pestle-analysis.md (policy domain mapping)
    ├── → historical-baseline.md (EP10 vs EP9 output comparison)
    └── → executive-brief.md (headline actions)

Political Landscape (719 MEPs / 9 groups)
    ├── → stakeholder-map.md (group power analysis)
    ├── → scenario-forecast.md (coalition stability scenarios)
    ├── → risk-matrix.md (legislative passage risks)
    └── → quantitative-swot.md (institutional strength assessment)

IMF WEO April 2026 (fallback)
    ├── → economic-context.fallback.md (GDP, inflation, fiscal projections)
    └── → pestle-analysis.md (Economic dimension)
```

---

## Quality Assurance Summary

- **Total artifacts produced:** 19
- **Structural requirements met:** Mermaid diagrams in PESTLE, stakeholder, scenario, and risk files ✓
- **Admiralty grade applied:** Yes (all intelligence files) ✓
- **Confidence labels:** 🟢/🟡/🔴 on all key claims ✓
- **Placeholder markers remaining:** 0 ✓
- **IMF data sourced:** Yes (fallback mode, knowledge-based WEO Apr 2026) ✓
- **Pass 2 completed:** Yes — all artifacts deepened and extended ✓

---

## Artifact Dependency Map

```mermaid
graph LR
  DATA["data/\nprefetch + MCP calls"] --> DAA["data-availability-assessment.md"]
  DAA --> SYNTH["synthesis-summary.md"]
  SYNTH --> PESTLE["pestle-analysis.md"]
  SYNTH --> STAKE["stakeholder-map.md"]
  SYNTH --> SCEN["scenario-forecast.md"]
  SYNTH --> HIST["historical-baseline.md"]
  SYNTH --> COAL["coalition-dynamics.md"]
  SYNTH --> THREAT["threat-model.md"]
  SYNTH --> WILD["wildcards-blackswans.md"]
  ECO["economic-context.md"] --> RISK["risk-matrix.md"]
  ECO --> SWOT["quantitative-swot.md"]
  RISK --> EXEC["executive-brief.md"]
  SWOT --> EXEC
  THREAT --> EXEC
  EXEC --> ARTICLE["news article\n(Stage D)"]
```
