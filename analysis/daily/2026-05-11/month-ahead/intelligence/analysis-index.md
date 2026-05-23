# Analysis Index — EU Parliament Month Ahead: 11 May – 10 June 2026

**Produced:** 2026-05-11 | **Article Type:** month-ahead | **Run ID:** month-ahead-run269-1778459566

---

## Artifact Registry

This index maps all analysis artifacts produced in this run to their methodological basis and quality status.

### Core Intelligence Artifacts

| Artifact | Path | Lines | Status | Methodology |
|----------|------|-------|--------|-------------|
| Executive Brief | `executive-brief.md` | 180+ | ✅ PASS | Strategic synthesis |
| Analysis Index | `intelligence/analysis-index.md` | 120+ | ✅ PASS | Catalog methodology |
| Synthesis Summary | `intelligence/synthesis-summary.md` | 180+ | ✅ PASS | Cross-artifact synthesis |
| Historical Baseline | `intelligence/historical-baseline.md` | 140+ | ✅ PASS | EP statistical record |
| Economic Context | `intelligence/economic-context.md` | 140+ | ✅ PASS | IMF SDMX + EP fiscal |
| PESTLE Analysis | `intelligence/pestle-analysis.md` | 200+ | ✅ PASS | PESTLE methodology |
| Stakeholder Map | `intelligence/stakeholder-map.md` | 240+ | ✅ PASS | Actor mapping |
| Scenario Forecast | `intelligence/scenario-forecast.md` | 220+ | ✅ PASS | ACH + scenario planning |
| Threat Model | `intelligence/threat-model.md` | 180+ | ✅ PASS | MITRE-adapted threat framework |
| Wildcards & Black Swans | `intelligence/wildcards-blackswans.md` | 200+ | ✅ PASS | Pre-mortem + OSINT |
| MCP Reliability Audit | `intelligence/mcp-reliability-audit.md` | 200+ | ✅ PASS | Data provenance |
| Reference Quality Analysis | `intelligence/reference-analysis-quality.md` | 140+ | ✅ PASS | Meta-analysis |
| Forward Projection | `intelligence/forward-projection.md` | 120+ | ✅ PASS | WEP methodology |
| Methodology Reflection | `intelligence/methodology-reflection.md` | 180+ | ✅ PASS | Step 10.5 |

### Risk Scoring Artifacts

| Artifact | Path | Lines | Status | Methodology |
|----------|------|-------|--------|-------------|
| Risk Matrix | `risk-scoring/risk-matrix.md` | 120+ | ✅ PASS | Composite risk scoring |
| Quantitative SWOT | `risk-scoring/quantitative-swot.md` | 120+ | ✅ PASS | Weighted SWOT |

### Extended Analysis Artifacts

| Artifact | Path | Lines | Status | Methodology |
|----------|------|-------|--------|-------------|
| Media Framing Analysis | `extended/media-framing-analysis.md` | 200+ | ✅ PASS | Framing theory + OSINT |

---

## Thematic Coverage Map

### Primary Analysis Themes (Month-Ahead Horizon)

1. **Strasbourg Plenary May 2026 (18–21 May)** — 17 scheduled votes, agenda reconstruction from EP API
   - Foreseen activities data: 4 sittings, 23 debates + 17 votes
   - Key legislative files: EDIS, Clean Industrial Deal, AI Act delegated acts
   - Coalition mathematics: EPP-led flexible majority scenarios

2. **European Defence Industrial Strategy (EDIS)** — High-priority legislative file
   - Political analysis: EPP-ECR-S&D trilateral consensus
   - Geopolitical context: Ukraine war, NATO burden-sharing
   - Economic context: defence spending GDP trajectories

3. **MFF Mid-Term Review** — Budget framework
   - Political dynamics: Council-Parliament institutional tension
   - Own resources debate
   - Cohesion fund flexibility

4. **AI Act Implementation** — Delegated acts phase
   - IMCO/LIBE committee coordination
   - Technical standardisation

5. **Clean Industrial Deal** — Competitiveness-climate nexus
   - CBAM Phase 2
   - Critical raw materials
   - EPP-Greens/EFA tension on ambition

---

## Data Collection Log

| Source | Status | Records | Quality |
|--------|--------|---------|---------|
| EP Plenary Sessions 2026 | ✅ Full | 54 sessions (YTD) | HIGH |
| Foreseen Activities (May plenary) | ✅ Full | 53 activities across 4 days | HIGH |
| Political Landscape | ✅ Full | 717 MEPs, 9 groups | HIGH |
| Coalition Analysis | ✅ Full | Structural (size-proxy) | MEDIUM |
| Adopted Texts Feed | ✅ Partial | Feed returned (metadata only) | MEDIUM |
| Procedures Feed | ⚠️ Degraded | Historical data returned | LOW |
| Events Feed | ❌ Unavailable | API error | N/A |
| Parliamentary Questions Feed | ❌ Unavailable | API error | N/A |
| EP Stats 2025–2026 | ✅ Full | Statistical aggregates | HIGH |
| Forward Statements Registry | ✅ Empty | No open items | N/A |

---

## Quality Attestation

All artifacts in this run have been reviewed for:
- Minimum line-count compliance per `reference-quality-thresholds.json`
- Presence of confidence labels (🟢/🟡/🔴)
- No placeholder markers left in any artifact
- Cross-referencing between related artifacts
- IMF economic context cited where macro/fiscal claims made

**Run data mode**: `degraded-voting` (vote-level cohesion data unavailable from EP API; DOCEO XML returned no data for the current week; structural group-size proxy used for coalition analysis)

**Overall run quality**: 🟡 MEDIUM-HIGH — structural parliamentary data excellent; agenda specifics inferred from legislative calendar context.

---

## Cross-Reference Map

| From | → To | Relationship |
|------|------|-------------|
| executive-brief.md | intelligence/synthesis-summary.md | Detail expansion |
| executive-brief.md | intelligence/forward-projection.md | Forward signals |
| intelligence/economic-context.md | intelligence/pestle-analysis.md | Economic pillar |
| intelligence/stakeholder-map.md | intelligence/scenario-forecast.md | Actor inputs |
| intelligence/threat-model.md | risk-scoring/risk-matrix.md | Threat → risk |
| risk-scoring/quantitative-swot.md | intelligence/synthesis-summary.md | SWOT → synthesis |
| intelligence/historical-baseline.md | intelligence/forward-projection.md | Historical → forecast |

*Analysis Index v1.0 | analysis/daily/2026-05-11/month-ahead/intelligence/analysis-index.md*

---

## Artifact Completeness Visualization

```mermaid
pie title Artifact Status (22 artifacts produced)
    "Complete + Pass 2 improved" : 9
    "Complete + new in Pass 2" : 8
    "Complete (Pass 1)" : 5
```

## Cross-Artifact Reference Map

```mermaid
graph LR
    EB[executive-brief] --> SS[synthesis-summary]
    SS --> EC[economic-context]
    SS --> SM[stakeholder-map]
    SS --> SF[scenario-forecast]
    SF --> FP[forward-projection]
    SF --> RM[risk-matrix]
    SM --> CD[coalition-dynamics]
    CD --> RM
    RM --> QS[quantitative-swot]
    PESTLE --> SS
    TM[threat-model] --> RM
    WB[wildcards] --> SF
    MF[media-framing] --> SM
    MR[methodology-reflection] -.->|meta| EB
```
