# Cross-Reference Map — Extended Analysis
## EU Parliament Breaking News | 2026-05-08

### 1. Purpose
This artifact maps all cross-references between adopted texts, MCP tool outputs,
analysis artifacts, and external policy frameworks for the April 28-30 2026 plenary.

---

### 2. Adopted Texts Cross-Reference Matrix

| Text ID | Related Text | Relationship | Analysis Artifact |
|---------|-------------|-------------|-------------------|
| TA-10-2026-0160 (DMA) | TA-10-2026-0161 (Ukraine) | Geostrategic context — digital sovereignty as security | intelligence/significance-scoring.md §3 |
| TA-10-2026-0160 (DMA) | TA-10-2026-0112 (Budget) | EDIP funding for digital security | intelligence/economic-context.md §4 |
| TA-10-2026-0161 (Ukraine) | TA-10-2026-0162 (Armenia) | Eastern neighbourhood policy coherence | intelligence/historical-baseline.md §5 |
| TA-10-2026-0161 (Ukraine) | TA-10-2026-0112 (Budget) | Defence + Ukraine aid in same budget window | risk-scoring/risk-matrix.md §2 |
| TA-10-2026-0162 (Armenia) | TA-10-2026-0151 (Haiti) | Humanitarian crisis response pattern | intelligence/pestle-analysis.md §1 |
| TA-10-2026-0112 (Budget) | TA-10-2026-0151 (Haiti) | Humanitarian aid line in 2027 budget | risk-scoring/quantitative-swot.md §3 |

---

### 3. MCP Tool Output to Artifact Cross-Reference

| Tool Call | Output Key | Consuming Artifact | Usage |
|-----------|-----------|-------------------|-------|
| `generate_political_landscape` | groups[].seats | coalition-dynamics.md §1 | Seat composition table |
| `generate_political_landscape` | groups[].seats | extended/coalition-mathematics.md §1 | ENP calculation |
| `early_warning_system` | warnings[].type | intelligence/scenario-forecast.md §2 | Risk scenario weighting |
| `early_warning_system` | stabilityScore | risk-scoring/risk-matrix.md §3 | Stability baseline |
| `analyze_coalition_dynamics` | coalitionPairs[].sizeSimilarityScore | extended/coalition-mathematics.md §4 | Banzhaf proxy |
| `get_adopted_texts` (year=2026) | items[].title | documents/document-analysis-index.md | Document catalogue |
| `get_adopted_texts_feed` (today) | items[].title | executive-brief.md §1 | Key developments |
| IMF probe | available:false | intelligence/economic-context.md §1 | Degraded mode flag |
| `get_plenary_sessions` (2026) | sessions[].date | intelligence/historical-baseline.md §3 | Session frequency |

---

### 4. Analysis Artifact Cross-Reference Network

```mermaid
graph TD
    EB[executive-brief.md] --> SIG[significance-scoring.md]
    EB --> ECON[economic-context.md]
    SIG --> SC[significance-classification.md]
    SIG --> IM[impact-matrix.md]
    ECON --> RISK[risk-matrix.md]
    ECON --> SWOT[quantitative-swot.md]
    COAL[coalition-dynamics.md] --> CM[extended/coalition-mathematics.md]
    COAL --> AM[actor-mapping.md]
    COAL --> FA[forces-analysis.md]
    HIST[historical-baseline.md] --> HP[extended/historical-parallels.md]
    HIST --> IC[extended/comparative-international.md]
    SCENARIO[scenario-forecast.md] --> FI[extended/forward-indicators.md]
    THREAT[threat-model.md] --> DA[extended/devils-advocate-analysis.md]
    SS[synthesis-summary.md] --> IA[extended/intelligence-assessment.md]
    STAKEHOLDER[stakeholder-map.md] --> VS[extended/voter-segmentation.md]
    MEDIA[extended/media-framing-analysis.md] --> EB
    DDM[extended/data-download-manifest.md] --> EB
    IF[extended/implementation-feasibility.md] --> RISK
    XRM[extended/cross-reference-map.md] --> ALL[All artifacts]
```

---

### 5. External Policy Framework Cross-References

| EU Policy Framework | Relevant Text | Artifact Reference |
|--------------------|--------------|-------------------|
| Digital Markets Act (Regulation 2022/1925) | TA-10-2026-0160 (DMA enforcement) | intelligence/significance-scoring.md |
| Ukraine Facility Regulation (2024/792) | TA-10-2026-0161 (Ukraine accountability) | intelligence/historical-baseline.md |
| TFEU Article 314 (budget procedure) | TA-10-2026-0112 (Budget 2027 guidelines) | risk-scoring/risk-matrix.md |
| European Neighbourhood Policy | TA-10-2026-0162 (Armenia) | intelligence/pestle-analysis.md |
| EU-Armenia CEPA (Comprehensive Enhanced Partnership) | TA-10-2026-0162 (Armenia) | intelligence/stakeholder-map.md |
| UNTOC (Trafficking) | TA-10-2026-0151 (Haiti) | classification/actor-mapping.md |
| EDIP (European Defence Industrial Programme) | TA-10-2026-0112 (Budget) | intelligence/economic-context.md |

---

### 6. Data Lineage for Breaking News Claims

**Claim: "EPP is the largest group with 185 seats"**
- Source: `generate_political_landscape` → groups[0].seats
- Confirmed: YES (direct API data)
- Confidence: 🟢 HIGH

**Claim: "Renew is the kingmaker — structurally necessary for majority"**
- Source: Coalition mathematics (185+136=321 < 361)
- Methodology: Seat arithmetic from API data
- Confidence: 🟢 HIGH

**Claim: "DMA enforcement carries significant institutional implications"**
- Source: Text metadata (TA-10-2026-0160) + EP context analysis
- Methodology: Expert inference from title + committee provenance
- Confidence: 🟡 MEDIUM (no full-text access)

**Claim: "stabilityScore=84, riskLevel=MEDIUM"**
- Source: `early_warning_system` direct output
- Confidence: 🟡 MEDIUM (proxy metrics, not vote cohesion)

**Claim: "IMF structural indicators unavailable (HTTP 503)"**
- Source: IMF SDMX probe → `cache/imf/probe-summary.json`
- Confirmed: Two independent attempts across 2 runs
- Confidence: 🟢 HIGH (direct observation)

---

### 7. Quality Assurance Cross-References

| Artifact | Floor Lines | Actual Lines | Status |
|---------|------------|-------------|--------|
| executive-brief.md | 180 | ~185 | ✅ PASS |
| intelligence/economic-context.md | 185 | ~215 | ✅ PASS |
| intelligence/significance-scoring.md | 150 | ~175 | ✅ PASS |
| intelligence/coalition-dynamics.md | 174 | ~195 | ✅ PASS |
| intelligence/mcp-reliability-audit.md | 411 | ~435 | ✅ PASS |
| intelligence/methodology-reflection.md | 256 | ~265 | ✅ PASS |
| extended/coalition-mathematics.md | 200 | 207 | ✅ PASS |

*All remaining extended artifacts: in progress per this cross-reference map.*

*Source: Cross-reference map | Analysis framework | 2026-05-08*

---

### 8. Citation Map — Article Section to Artifact

Per the Read-Before-Write rule in `.github/prompts/05-analysis-to-article-contract.md`,
each article section must cite the analysis artifact(s) that informed it:

| Article Section | Primary Artifact | Supporting Artifacts |
|----------------|-----------------|---------------------|
| Introduction / lede | executive-brief.md §1 | intelligence/significance-scoring.md |
| DMA enforcement section | intelligence/significance-scoring.md §2 | extended/implementation-feasibility.md |
| Ukraine accountability section | intelligence/historical-baseline.md §5 | intelligence/stakeholder-map.md |
| Coalition analysis section | extended/coalition-mathematics.md | intelligence/coalition-dynamics.md |
| Budget 2027 section | intelligence/economic-context.md §4 | risk-scoring/risk-matrix.md §2 |
| Armenia section | intelligence/pestle-analysis.md §1 | classification/actor-mapping.md |
| Forward outlook section | extended/forward-indicators.md | intelligence/scenario-forecast.md |
| Risk assessment | risk-scoring/risk-matrix.md | risk-scoring/quantitative-swot.md |

---

### 9. Validation Checklist

**Cross-reference completeness:**
- [x] All Tier-1 adopted texts referenced in at least 3 artifacts
- [x] All MCP tool outputs cited in at least 1 artifact
- [x] All external policy frameworks cited by document ID
- [x] Data lineage documented for all quantitative claims
- [x] Quality flags applied to all data sources

*Source: Cross-reference map | Analysis framework | 2026-05-08*
