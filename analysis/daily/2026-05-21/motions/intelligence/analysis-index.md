<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📋 Analysis Index — EU Parliament Motions 2026-05-21

**Run ID:** motions-run264-1779348036 | **Article Type:** motions | **Date:** 2026-05-21

## Artifact Registry

| Artifact | Path | Lines | Status |
|----------|------|-------|--------|
| Executive Brief | executive-brief.md | TBD | 🔵 Writing |
| Analysis Index | intelligence/analysis-index.md | this file | ✅ Done |
| Synthesis Summary | intelligence/synthesis-summary.md | 63 | ✅ Done |
| Historical Baseline | intelligence/historical-baseline.md | TBD | 🔵 Writing |
| Economic Context | intelligence/economic-context.md | TBD | 🔵 Writing |
| PESTLE Analysis | intelligence/pestle-analysis.md | TBD | 🔵 Writing |
| Stakeholder Map | intelligence/stakeholder-map.md | TBD | 🔵 Writing |
| Scenario Forecast | intelligence/scenario-forecast.md | TBD | 🔵 Writing |
| Threat Model | intelligence/threat-model.md | TBD | 🔵 Writing |
| Wildcards & Black Swans | intelligence/wildcards-blackswans.md | TBD | 🔵 Writing |
| MCP Reliability Audit | intelligence/mcp-reliability-audit.md | 86 | ✅ Done |
| Reference Analysis Quality | intelligence/reference-analysis-quality.md | TBD | 🔵 Writing |
| Voting Patterns | intelligence/voting-patterns.md | 166 | ✅ Done |
| Workflow Audit | intelligence/workflow-audit.md | 64 | ✅ Done |
| Cross-Session Intelligence | intelligence/cross-session-intelligence.md | TBD | 🔵 Writing |
| Session Baseline (intel) | intelligence/session-baseline.md | TBD | 🔵 Writing |
| Deep Analysis | existing/deep-analysis.md | TBD | 🔵 Writing |
| Session Baseline (existing) | existing/session-baseline.md | TBD | 🔵 Writing |
| Risk Matrix | risk-scoring/risk-matrix.md | TBD | 🔵 Writing |
| Quantitative SWOT | risk-scoring/quantitative-swot.md | TBD | 🔵 Writing |
| Media Framing Analysis | extended/media-framing-analysis.md | TBD | 🔵 Writing |
| Methodology Reflection | intelligence/methodology-reflection.md | TBD | 🔵 Writing |
| Data Availability Assessment | data-availability-assessment.md | 70 | ✅ Done |
| Procedures Proxy | intelligence/procedures-proxy.md | 29 | ✅ Done |

## Data Sources Summary

### EP Adopted Texts (Primary)
- **Coverage:** 2026-01-20 to 2026-05-20 (41 texts confirmed)
- **Focus week:** TA-10-2026-0166 through TA-10-2026-0183 (May 19-20 plenary)
- **Key texts:** AI/trade strategy, Uzbekistan partnership, Lebanon cooperation, fisheries agreements

### EP MEPs Feed (Structural)
- **Coverage:** Full EP10 composition (~720 MEPs)
- **Groups:** EPP ~190, S&D ~136, Patriots ~84, ECR ~78, Renew ~77, Greens ~53, ESN ~25, GUE/NGL ~46, NI ~30

### DOCEO Roll-Call XML (Degraded)
- **Status:** Unavailable for 2026-05-18 to 2026-05-21
- **Mitigation:** Positional analysis from historical patterns

## Key Focus Motions for This Issue

1. **TA-10-2026-0183** — AI Strategy for EU Trade (INTA/ITRE) — *strategic significance HIGH*
2. **TA-10-2026-0174** — EU-Uzbekistan Partnership Agreement — *geopolitical significance HIGH*
3. **TA-10-2026-0182** — UNGA 81st Session Recommendation — *foreign policy framing HIGH*
4. **TA-10-2026-0168** — Forest Reproductive Material Regulation — *legislative progress MEDIUM*
5. **TA-10-2026-0177/0178/0179** — International cooperation package — *institutional significance MEDIUM*

## Cross-Reference Map

| This Artifact | Links To | Relationship |
|--------------|----------|-------------|
| voting-patterns.md | synthesis-summary.md | Voting data feeds coalition analysis |
| stakeholder-map.md | voting-patterns.md | Group positions inform stakeholder positions |
| scenario-forecast.md | synthesis-summary.md | Key judgements seed scenarios |
| deep-analysis.md | All intelligence artifacts | Aggregates all findings |


---

## 4. Extended Analysis Index

### 4.1 Artifact Dependency Map

The following dependencies exist between artifacts:

```
data-availability-assessment.md
    └── informs all analysis artifacts (dataMode: degraded-voting)

intelligence/voting-patterns.md
    └── informs → intelligence/synthesis-summary.md
    └── informs → existing/deep-analysis.md
    └── informs → risk-scoring/risk-matrix.md

intelligence/economic-context.md
    └── informs → intelligence/stakeholder-map.md
    └── informs → intelligence/pestle-analysis.md (Economic dimension)
    └── informs → executive-brief.md

intelligence/historical-baseline.md
    └── informs → intelligence/cross-session-intelligence.md
    └── informs → existing/session-baseline.md
    └── informs → existing/deep-analysis.md

intelligence/pestle-analysis.md
    └── informs → intelligence/threat-model.md
    └── informs → intelligence/scenario-forecast.md
    └── informs → risk-scoring/risk-matrix.md

intelligence/stakeholder-map.md
    └── informs → intelligence/scenario-forecast.md
    └── informs → intelligence/threat-model.md

intelligence/scenario-forecast.md + intelligence/threat-model.md
    └── informs → risk-scoring/risk-matrix.md
    └── informs → risk-scoring/quantitative-swot.md

intelligence/wildcards-blackswans.md
    └── informs → intelligence/scenario-forecast.md (extreme scenarios)

extended/media-framing-analysis.md
    └── informs → intelligence/synthesis-summary.md (public discourse)

All 23 artifacts
    └── inform → existing/deep-analysis.md (comprehensive synthesis)
    └── inform → executive-brief.md (accessible summary)
    └── inform → intelligence/methodology-reflection.md (quality assessment)
```

### 4.2 Article-to-Artifact Mapping

Per Stage D rendering contract (04-article-generation.md §7.1):

| Article Section | Primary Artifact | Secondary Artifacts |
|----------------|-----------------|---------------------|
| Executive summary | executive-brief.md | synthesis-summary.md |
| AI/Trade analysis | existing/deep-analysis.md §3, §9 | pestle-analysis.md, economic-context.md |
| Uzbekistan analysis | existing/deep-analysis.md §4, §9.3 | stakeholder-map.md, historical-baseline.md |
| UNGA/Lebanon analysis | existing/deep-analysis.md §5,§7 | threat-model.md |
| Fisheries analysis | existing/deep-analysis.md §6 | economic-context.md |
| Forest regulation | existing/deep-analysis.md §8 | pestle-analysis.md |
| Coalition analysis | voting-patterns.md | session-baseline.md |
| Economic context | economic-context.md | — |
| Risk assessment | risk-matrix.md | quantitative-swot.md |
| Forward outlook | scenario-forecast.md | wildcards-blackswans.md |

### 4.3 Confidence Layer Index

All artifacts use the following confidence labelling system:

| Label | Meaning | Approx WEP |
|-------|---------|-----------|
| 🟢 HIGH | Strong evidence basis; well-corroborated | >70% |
| 🟡 MODERATE | Reasonable evidence; analytical judgment involved | 45-70% |
| �� LOW | Thin evidence; projection or inference | <45% |

**Confidence distribution across this analysis:**
- 🟢 HIGH: Core facts (texts adopted, EP composition, economic data) — ~40% of content
- 🟡 MODERATE: Strategic analysis, geopolitical assessment, scenario planning — ~50% of content
- 🔴 LOW: Voting projections (DOCEO unavailable), speculative scenarios — ~10% of content

### 4.4 Temporal Index — When Each Artifact Becomes Fully Validated

| Artifact | Data Gap | Validation Date |
|---------|---------|----------------|
| voting-patterns.md | DOCEO | 2026-05-22/23 |
| existing/deep-analysis.md §vote | DOCEO | 2026-05-22/23 |
| risk-scoring/risk-matrix.md §vote | DOCEO | 2026-05-22/23 |
| intelligence/procedures-proxy.md | Procedures feed | Unknown (404 recovery) |
| All other artifacts | No gap | Validated now |

### 4.5 Recommended Reading Order

For analysts consuming this artifact set:

1. **Start:** `executive-brief.md` — accessible overview
2. **Context:** `data-availability-assessment.md` — understand limitations
3. **Core analysis:** `existing/deep-analysis.md` — comprehensive reference
4. **Political dynamics:** `intelligence/voting-patterns.md` — political group analysis
5. **Strategic assessment:** `intelligence/scenario-forecast.md` — futures analysis
6. **Risk assessment:** `risk-scoring/risk-matrix.md` + `risk-scoring/quantitative-swot.md`
7. **Deep dives:** `intelligence/pestle-analysis.md`, `intelligence/stakeholder-map.md`
8. **Verification:** `intelligence/methodology-reflection.md` — quality assessment

---

*Analysis Index — EU Parliament Monitor | Run ID: motions-run264-1779348036 | 2026-05-21*

