<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🗂️ Analysis Artifact Catalog</h1>

<p align="center">
  <strong>📊 Master Map of Every Analysis Markdown File Produced by EU Parliament Monitor Workflows</strong><br>
  <em>🎯 One Row per Artifact · Methodology + Template + Depth Floor + Mermaid Type</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.2-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--25-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.2 | **📅 Last Updated:** 2026-04-25 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-07-31
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

This catalog is the **single source of truth** for every markdown artifact an agentic workflow produces under `analysis/daily/{date}/{article-type}-run{N}/`. For every artifact it names:

- the **methodology** the AI agent applies when writing it,
- the **template** that defines its output shape,
- the **minimum line floor** enforced by `src/utils/validate-analysis-completeness.ts`,
- the **mandatory color-coded Mermaid diagram** type, and
- the **EP MCP data sources** feeding it.

Agents read this catalog once at the start of a run and treat it as the index into the rest of the methodology library.

---

## 🗺️ Artifact Groups

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
flowchart LR
    subgraph INPUT["📥 Run Root"]
        R["analysis/daily/{date}/{type}-run{N}/"]
    end
    subgraph INTEL["🧠 intelligence/ — 19 artifacts"]
        I1["synthesis-summary"]
        I2["stakeholder-map"]
        I3["scenario-forecast"]
        I4["pestle-analysis"]
        I5["threat-model"]
        I6["voting-patterns"]
        I7["workflow-audit"]
        I8["cross-session-intel"]
        I9["+11 more"]
    end
    subgraph CLASS["🏷️ classification/ — 4 artifacts"]
        C1["significance-classification"]
        C2["actor-mapping"]
        C3["forces-analysis"]
        C4["impact-matrix"]
    end
    subgraph RISK["⚠️ risk-scoring/ — 4 artifacts"]
        K1["risk-matrix"]
        K2["quantitative-swot"]
        K3["political-capital-risk"]
        K4["legislative-velocity-risk"]
    end
    subgraph THREAT["🎭 threat-assessment/ — 4 artifacts"]
        T1["political-threat-landscape"]
        T2["actor-threat-profiles"]
        T3["consequence-trees"]
        T4["legislative-disruption"]
    end
    subgraph DOCS["📄 documents/ — 1 artifact"]
        D1["document-analysis-index"]
    end
    subgraph LEG["📜 existing/ — 2 long-form + mirrors"]
        L1["deep-analysis"]
        L2["session-baseline"]
    end
    subgraph META["📒 manifest"]
        M1["manifest.json"]
    end

    R --> INTEL
    R --> CLASS
    R --> RISK
    R --> THREAT
    R --> DOCS
    R --> LEG
    R --> META

    style INPUT fill:#1565C0,color:#ffffff
    style INTEL fill:#7B1FA2,color:#ffffff
    style CLASS fill:#2E7D32,color:#ffffff
    style RISK fill:#FF9800,color:#000000
    style THREAT fill:#D32F2F,color:#ffffff
    style LEG fill:#FFC107,color:#000000
    style DOCS fill:#0288D1,color:#ffffff
    style META fill:#FFC107,color:#000000
```

**Color legend (used consistently across all diagrams in the analysis library):**

| Color | Hex | Semantic Meaning |
|-------|-----|------------------|
| 🔵 Blue | `#1565C0` | Input / scope / primary pipeline |
| 🟣 Purple | `#7B1FA2` | Intelligence synthesis (highest cognitive layer) |
| 🟢 Green | `#2E7D32` | Classification / safe state / approved |
| 🟠 Orange | `#FF9800` | Risk / caution / elevated attention |
| 🔴 Red | `#D32F2F` | Threat / critical / rejected |
| 🟡 Yellow | `#FFC107` | Metadata / notes / pending |
| 🔷 Light-Blue | `#0288D1` | Documents / reference / read-only |

---

## 📐 Catalog Schema

Every row in the catalog below answers these six questions about one artifact:

| Column | Meaning |
|--------|---------|
| **Artifact** | Relative path under the run root (`{folder}/{file}.md`) |
| **Purpose (1 line)** | The single sentence of analytical value the file delivers |
| **Methodology** | The methodology document the AI reads to produce this artifact |
| **Template** | The template the file's shape is derived from |
| **Min lines (breaking)** | Depth floor for `breaking` article type (from [`reference-quality-thresholds.json`](reference-quality-thresholds.json)) |
| **Mermaid type** | Mandatory diagram shape (using the 7-color Hack23 palette above) |

---

## 🧠 `intelligence/` — 19 Artifacts

The analytical core. This section catalogs the full set of `intelligence/` artifacts that may be produced across EU Parliament Monitor workflows. The required subset varies by article type and scope; follow [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) for per-workflow requirements, including cases where `cross-session-intelligence.md` is only required for weekly/monthly/quarterly scopes (not for breaking news). Per-artifact depth floors are keyed by article type in [`reference-quality-thresholds.json`](reference-quality-thresholds.json).

| Artifact | Purpose (1 line) | Methodology | Template | Min lines (breaking) | Mermaid type |
|---|---|---|---|:---:|---|
| `intelligence/analysis-index.md` | Read-me-first index naming every artifact in this run and the recommended reading order. | [per-artifact-methodologies.md §analysis-index](per-artifact-methodologies.md#analysis-index) | [analysis-index.md](../templates/analysis-index.md) | 160 | flowchart LR |
| `intelligence/synthesis-summary.md` | The run's intelligence executive summary — top findings, confidence, forward monitors. | [per-artifact-methodologies.md §synthesis-summary](per-artifact-methodologies.md#synthesis-summary) | [synthesis-summary.md](../templates/synthesis-summary.md) | 205 | mindmap + flowchart |
| `intelligence/stakeholder-map.md` | Power × Alignment map of ≥12 named stakeholders on the period's dominant issue. | [per-artifact-methodologies.md §stakeholder-map](per-artifact-methodologies.md#stakeholder-map) | [stakeholder-map.md](../templates/stakeholder-map.md) | 305 | quadrantChart |
| `intelligence/scenario-forecast.md` | ≥3 probability-weighted scenarios with early-warning indicators and trigger events. | [per-artifact-methodologies.md §scenario-forecast](per-artifact-methodologies.md#scenario-forecast) | [scenario-forecast.md](../templates/scenario-forecast.md) | 280 | flowchart TD (branching) |
| `intelligence/pestle-analysis.md` | Political / Economic / Social / Technological / Legal / Environmental scan of the period. | [per-artifact-methodologies.md §pestle-analysis](per-artifact-methodologies.md#pestle-analysis) | [pestle-analysis.md](../templates/pestle-analysis.md) | 250 | mindmap (6 branches) |
| `intelligence/threat-model.md` | Multi-framework (Diamond + Attack Trees + Kill Chain) view of the period's top threats. | [per-artifact-methodologies.md §threat-model](per-artifact-methodologies.md#threat-model) + [political-threat-framework.md](political-threat-framework.md) | [threat-model.md](../templates/threat-model.md) | 250 | graph TD (attack tree) |
| `intelligence/coalition-dynamics.md` | Group cohesion + cross-party alliance pairs on the period's named votes/positions. | [per-artifact-methodologies.md §coalition-dynamics](per-artifact-methodologies.md#coalition-dynamics) | [coalition-dynamics.md](../templates/coalition-dynamics.md) | 135 | graph LR (group pairs) |
| `intelligence/cross-run-diff.md` | Bayesian delta vs. the previous run for this article type (what changed, what upgraded). | [per-artifact-methodologies.md §cross-run-diff](per-artifact-methodologies.md#cross-run-diff) | [cross-run-diff.md](../templates/cross-run-diff.md) | 100 | flowchart LR (prior → evidence → posterior) |
| `intelligence/economic-context.md` | **IMF** (primary economic — Wave-3) macro/fiscal/trade/monetary/exchange-rate/banking data + optional World Bank non-economic cross-refs, anchored to the period's policy topics. | [per-artifact-methodologies.md §economic-context](per-artifact-methodologies.md#economic-context) + [imf-indicator-mapping.md](imf-indicator-mapping.md) (primary) + [worldbank-indicator-mapping.md](worldbank-indicator-mapping.md) (non-economic) | [economic-context.md](../templates/economic-context.md) | 185 | xyChart + flowchart |
| `intelligence/historical-baseline.md` | Every current score / metric anchored to the 30-day and 90-day comparable baseline. | [per-artifact-methodologies.md §historical-baseline](per-artifact-methodologies.md#historical-baseline) | [historical-baseline.md](../templates/historical-baseline.md) | 190 | timeline / xyChart |
| `intelligence/mcp-reliability-audit.md` | EP MCP endpoint-by-endpoint reliability record + upstream issues filed. | [per-artifact-methodologies.md §mcp-reliability-audit](per-artifact-methodologies.md#mcp-reliability-audit) | [mcp-reliability-audit.md](../templates/mcp-reliability-audit.md) | 385 | flowchart LR (endpoint status) |
| `intelligence/significance-scoring.md` | 5-dimension composite score per candidate item, with publish decision. | [per-artifact-methodologies.md §significance-scoring](per-artifact-methodologies.md#significance-scoring) | [significance-scoring.md](../templates/significance-scoring.md) | 105 | pie + bar |
| `intelligence/political-threat-landscape.md` | Threat Landscape view of the period — 6 purpose-built dimensions for EP democracy. | [per-artifact-methodologies.md §political-threat-landscape](per-artifact-methodologies.md#political-threat-landscape) | [political-threat-landscape.md](../templates/political-threat-landscape.md) | 90 | graph TD (landscape) |
| `intelligence/wildcards-blackswans.md` | Low-probability / high-impact reserve watchlist with trigger conditions. | [per-artifact-methodologies.md §wildcards-blackswans](per-artifact-methodologies.md#wildcards-blackswans) | [wildcards-blackswans.md](../templates/wildcards-blackswans.md) | 275 | quadrantChart (prob × impact) |
| `intelligence/reference-analysis-quality.md` | Self-score of this run against the reference benchmark + gaps + Pass-2 plan. | [per-artifact-methodologies.md §reference-analysis-quality](per-artifact-methodologies.md#reference-analysis-quality) | [reference-analysis-quality.md](../templates/reference-analysis-quality.md) | 190 | flowchart (pass1 → pass2) |
| `intelligence/voting-patterns.md` | Group-by-group bloc behaviour for the period: cohesion per group, observed coalitions, win-rate per bloc, outlier votes, forward-vote forecasts. | [per-artifact-methodologies.md §voting-patterns](per-artifact-methodologies.md#voting-patterns) | [voting-patterns.md](../templates/voting-patterns.md) | 150 | graph LR (group agreement network) |
| `intelligence/workflow-audit.md` | End-of-run self-audit — phases completed, MCP tools called, Core Principles compliance, time budget, issues and next-run recommendations. | [per-artifact-methodologies.md §workflow-audit](per-artifact-methodologies.md#workflow-audit) | [workflow-audit.md](../templates/workflow-audit.md) | 100 | flowchart LR (6-phase execution) |
| `intelligence/methodology-reflection.md` | Analytic-quality retrospective — SATs applied, AI-FIRST iteration log, strengths, limitations, lessons, biases and mitigations, update plan. Produced as the **final** artifact of every run. | [per-artifact-methodologies.md §methodology-reflection](per-artifact-methodologies.md#methodology-reflection) | [methodology-reflection.md](../templates/methodology-reflection.md) | 220 (breaking) / 180 (other) | graph TD (pipeline) |
| `intelligence/cross-session-intelligence.md` | Session-over-session narrative across plenary sessions within a period — crystallisation moment, momentum indicators, cross-session themes. | [per-artifact-methodologies.md §cross-session-intelligence](per-artifact-methodologies.md#cross-session-intelligence) | [cross-session-intelligence.md](../templates/cross-session-intelligence.md) | See `reference-quality-thresholds.json` (per article type; not required for breaking) | timeline + flowchart |

---

## 🏷️ `classification/` — 4 Artifacts

The fact layer. What kind of events are in this run, who acted, what forces are in play, what does each event impact?

| Artifact | Purpose (1 line) | Methodology | Template | Min lines (breaking) | Mermaid type |
|---|---|---|---|:---:|---|
| `classification/significance-classification.md` | 5-dimension significance rubric per event + publish / withhold decision. | [per-artifact-methodologies.md §significance-classification](per-artifact-methodologies.md#significance-classification) + [political-classification-guide.md](political-classification-guide.md) | [significance-classification.md](../templates/significance-classification.md) | 105 | pie (dimension weights) |
| `classification/actor-mapping.md` | Named actors (MEPs, groups, committees, Commission, Council) with influence weights. | [per-artifact-methodologies.md §actor-mapping](per-artifact-methodologies.md#actor-mapping) | [actor-mapping.md](../templates/actor-mapping.md) | *flat 30* | graph LR (actor network) |
| `classification/forces-analysis.md` | Driving forces vs. restraining forces on the period's dominant issue (Lewin). | [per-artifact-methodologies.md §forces-analysis](per-artifact-methodologies.md#forces-analysis) | [forces-analysis.md](../templates/forces-analysis.md) | *flat 30* | flowchart LR (force field) |
| `classification/impact-matrix.md` | Event × stakeholder × dimension matrix showing who is affected and how. | [per-artifact-methodologies.md §impact-matrix](per-artifact-methodologies.md#impact-matrix) | [impact-matrix.md](../templates/impact-matrix.md) | *flat 30* | heatmap (via table) |

---

## ⚠️ `risk-scoring/` — 4 Artifacts

The quantification layer. Every qualitative finding in `intelligence/` must be anchored here in numbers.

| Artifact | Purpose (1 line) | Methodology | Template | Min lines (breaking) | Mermaid type |
|---|---|---|---|:---:|---|
| `risk-scoring/risk-matrix.md` | 5×5 Likelihood × Impact with ≥5 named risks positioned + monitoring triggers. | [per-artifact-methodologies.md §risk-matrix](per-artifact-methodologies.md#risk-matrix) + [political-risk-methodology.md](political-risk-methodology.md) | [risk-matrix.md](../templates/risk-matrix.md) | 150 | quadrantChart (5×5) |
| `risk-scoring/quantitative-swot.md` | 3+3+3+3 SWOT with numeric scores + TOWS cross-quadrant strategies. | [per-artifact-methodologies.md §quantitative-swot](per-artifact-methodologies.md#quantitative-swot) + [political-swot-framework.md](political-swot-framework.md) | [quantitative-swot.md](../templates/quantitative-swot.md) | 140 | quadrantChart (SWOT) |
| `risk-scoring/political-capital-risk.md` | Rapporteur / chair / group-leader capital at stake per named position. | [per-artifact-methodologies.md §political-capital-risk](per-artifact-methodologies.md#political-capital-risk) | [political-capital-risk.md](../templates/political-capital-risk.md) | *flat 30* | graph LR (capital flow) |
| `risk-scoring/legislative-velocity-risk.md` | Pipeline throughput, stalled procedures, deadline exposure vs. term end. | [per-artifact-methodologies.md §legislative-velocity-risk](per-artifact-methodologies.md#legislative-velocity-risk) | [legislative-velocity-risk.md](../templates/legislative-velocity-risk.md) | *flat 30* | gantt or flowchart LR (procedure timeline / bottleneck map) |

---

## 🎭 `threat-assessment/` — 5 Artifacts

Produced for runs that emphasise democratic-threat or integrity-threat angles (typically `motions`, `propositions`, and long-form reviews). For runs that consolidate threat content into `intelligence/threat-model.md`, this folder may be empty.

| Artifact | Purpose (1 line) | Methodology | Template | Min lines (breaking) | Mermaid type |
|---|---|---|---|:---:|---|
| `threat-assessment/political-threat-landscape.md` | Threat Landscape view — 6 purpose-built dimensions (same content as the `intelligence/` twin, emphasised for threat-heavy runs). | [per-artifact-methodologies.md §political-threat-landscape](per-artifact-methodologies.md#political-threat-landscape) + [political-threat-framework.md §Landscape](political-threat-framework.md) | [political-threat-landscape.md](../templates/political-threat-landscape.md) | *flat 30* | graph TD |
| `threat-assessment/actor-threat-profiles.md` | Per-actor threat profile: intent, capability, opportunity, attack surface. | [per-artifact-methodologies.md §actor-threat-profiles](per-artifact-methodologies.md#actor-threat-profiles) + [political-threat-framework.md §Diamond](political-threat-framework.md) | [actor-threat-profiles.md](../templates/actor-threat-profiles.md) | *flat 30* | graph LR (actor × asset) |
| `threat-assessment/consequence-trees.md` | Consequence tree per threat: action → first-order → second-order → democratic outcome. | [per-artifact-methodologies.md §consequence-trees](per-artifact-methodologies.md#consequence-trees) | [consequence-trees.md](../templates/consequence-trees.md) | *flat 30* | graph TD (tree) |
| `threat-assessment/legislative-disruption.md` | How adversarial pressure could stall, redirect, or capture specific procedures. | [per-artifact-methodologies.md §legislative-disruption](per-artifact-methodologies.md#legislative-disruption) | [legislative-disruption.md](../templates/legislative-disruption.md) | *flat 30* | flowchart LR (procedure + disruptor) |

---

## 📄 `documents/` — 1 Artifact

| Artifact | Purpose (1 line) | Methodology | Template | Min lines (breaking) | Mermaid type |
|---|---|---|---|:---:|---|
| `documents/document-analysis-index.md` | One row per downloaded EP document with its per-file analysis path + status. | [per-artifact-methodologies.md §document-analysis-index](per-artifact-methodologies.md#document-analysis-index) | [per-file-political-intelligence.md](../templates/per-file-political-intelligence.md) | 95 | flowchart LR (feed → analysis) |

---

## 📜 `existing/` — Legacy Long-Form Layout (2 Artifacts + Mirrors)

Used by `motions`, `propositions`, and long-form quarter / month-in-review workflows when the content does not fit any of the 5 standard folders. Newer runs may place the same content under `intelligence/` — both locations are valid.

| Artifact | Purpose (1 line) | Methodology | Template | Min lines (motions) | Mermaid type |
|---|---|---|---|:---:|---|
| `existing/deep-analysis.md` | Long-form (4 000–10 000 word) Economist-style political intelligence prose — the 30-minute read. | [per-artifact-methodologies.md §deep-analysis](per-artifact-methodologies.md#deep-analysis) | [deep-analysis.md](../templates/deep-analysis.md) | 400 | ≥3 diagrams (structural thesis + coalition + forward trajectory) |
| `existing/session-baseline.md` | Structured calendar + adopted-texts roster for every plenary session in scope. | [per-artifact-methodologies.md §session-baseline](per-artifact-methodologies.md#session-baseline) | [session-baseline.md](../templates/session-baseline.md) | 200 | gantt (Strasbourg / Brussels timeline) |

**Mirror artifacts** — older `motions-*` runs also mirror `intelligence/coalition-dynamics.md`, `intelligence/stakeholder-impact.md`, and `intelligence/synthesis-summary.md` into `existing/` alongside the two artifacts above. Construction rules are identical to the `intelligence/` counterparts.

### Folder Variants

| Canonical folder | Historical variant | Treatment |
|------------------|--------------------|-----------|
| `risk-scoring/` | `risk/` | Both accepted. New runs **must** write to `risk-scoring/`. |
| `intelligence/` | `existing/` (for long-form + mirrors) | Both accepted. New runs may use either; `intelligence/` is preferred. |

---

## 🧭 `extended/` — Optional Deep-Intelligence Artifacts (12 Artifacts)

Optional artifacts introduced by the riksdagsmonitor port (2026-04-23). These artifacts are **not mandatory** for completeness-gate passing but are **strongly recommended** for long-form workflows (month-in-review, quarter-in-review, propositions, trilogue-endgame). An agent that produces any of these must register the artifact in `manifest.files.extended[]`. Back-compat note: these are additive — no existing workflow is required to produce them.

| Artifact | Purpose (1 line) | Methodology | Template | Min lines (reco) | Mermaid type |
|---|---|---|---|:---:|---|
| `executive-brief.md` | ≤90-second decision brief for senior readers (BLUF + key judgments + 3 actions). This is the first rendered article artifact. | [synthesis-methodology.md §executive-brief](synthesis-methodology.md) | [executive-brief.md](../templates/executive-brief.md) | 180 | flowchart LR (BLUF → judgments → actions) |
| `extended/executive-brief.md` | Backwards-compatible legacy location for the same brief; use only when an older run already wrote it there. | [synthesis-methodology.md §executive-brief](synthesis-methodology.md) | [executive-brief.md](../templates/executive-brief.md) | 180 | flowchart LR (BLUF → judgments → actions) |
| `extended/devils-advocate-analysis.md` | Adversarial challenge to the run's consensus view (ACH + Red Team). | [osint-tradecraft-standards.md §Red Team + ACH](osint-tradecraft-standards.md) | [devils-advocate-analysis.md](../templates/devils-advocate-analysis.md) | 240 | graph TD (hypothesis × evidence) |
| `extended/historical-parallels.md` | ≥3 EU historical precedents with parallel mechanisms + divergence points. | [strategic-extensions-methodology.md §historical-parallels](strategic-extensions-methodology.md) | [historical-parallels.md](../templates/historical-parallels.md) | 230 | timeline |
| `extended/coalition-mathematics.md` | Vote-math for the period's contested files — 361-seat threshold analysis. | [synthesis-methodology.md §coalition + 720-seat math](synthesis-methodology.md) | [coalition-mathematics.md](../templates/coalition-mathematics.md) | 280 | graph LR (group arithmetic) |
| `extended/forward-indicators.md` | Early-warning signposts with WEP bands and monitoring cadence. | [osint-tradecraft-standards.md §Indicators & Signposts SAT](osint-tradecraft-standards.md) | [forward-indicators.md](../templates/forward-indicators.md) | 250 | flowchart LR (signpost → alert → action) |
| `extended/intelligence-assessment.md` | ICD 203 compliant IC-style assessment (BLUF + key judgments + confidence). | [osint-tradecraft-standards.md §ICD 203 Mapping](osint-tradecraft-standards.md) | [intelligence-assessment.md](../templates/intelligence-assessment.md) | 270 | flowchart LR (evidence → judgment → confidence) |
| `extended/implementation-feasibility.md` | 27-MS implementation feasibility of proposed legislation (legal / admin / fiscal). | [strategic-extensions-methodology.md §feasibility](strategic-extensions-methodology.md) | [implementation-feasibility.md](../templates/implementation-feasibility.md) | 290 | heatmap (MS × dimension) |
| `extended/media-framing-analysis.md` | Dominant narrative frames across EU-wide + national press (Politico, Euractiv, FT, etc.). | [strategic-extensions-methodology.md §media-framing](strategic-extensions-methodology.md) | [media-framing-analysis.md](../templates/media-framing-analysis.md) | 270 | graph LR (outlet × frame) |
| `extended/comparative-international.md` | Cross-jurisdictional comparison (EP vs US / UK / G7 / Council of Europe). | [strategic-extensions-methodology.md §comparative-international](strategic-extensions-methodology.md) | [comparative-international.md](../templates/comparative-international.md) | 270 | heatmap (jurisdiction × mechanism) |
| `extended/cross-reference-map.md` | Inter-artifact citation map for this run (who cites whom, evidence provenance). | [structural-metadata-methodology.md §cross-reference-map](structural-metadata-methodology.md) | [cross-reference-map.md](../templates/cross-reference-map.md) | 260 | graph LR (citation network) |
| `extended/data-download-manifest.md` | Stage-A inventory of every EP MCP call made + raw artifact paths + Admiralty grades. | [structural-metadata-methodology.md §data-download-manifest](structural-metadata-methodology.md) | [data-download-manifest.md](../templates/data-download-manifest.md) | 250 | flowchart LR (MCP call → artifact) |
| `extended/voter-segmentation.md` | EU electorate segmentation across 27 MS (Europhile / Euroskeptic / regional blocs). | [electoral-domain-methodology.md §voter-segmentation](electoral-domain-methodology.md) | [voter-segmentation.md](../templates/voter-segmentation.md) | 300 | quadrantChart (engagement × trust) |

**When to produce these**: Long-form review workflows (`month-in-review`, `quarter-in-review`, `propositions`), crisis / breaking-news depth runs, and any run where a decision-maker briefing (`executive-brief`) adds value. Short-form runs (`breaking`, `weekly-digest`) typically skip this folder.

---

## 📒 `manifest.json`

Machine-readable index of everything above. Generated by the workflow before PR creation. Every AI agent **must** append its artifact paths to `manifest.files.{group}[]` (`intelligence`, `classification`, `risk_scoring`, `threat_assessment`, `documents`, `existing`). The article-generation footer (`renderAnalysisTransparencySection`) reads this manifest to produce the Analysis Sources section in every published article. See [ai-driven-analysis-guide.md §Step 10](ai-driven-analysis-guide.md) for the exact schema.

---

## ✅ Read Order for Agents (Standard)

An agent starting a run reads this catalog, then proceeds through the 10-step protocol in [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md). The canonical reading order is:

1. This catalog → know *what* to produce.
2. [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) → know *how* to produce it.
3. [`per-artifact-methodologies.md`](per-artifact-methodologies.md) → look up *per-artifact* construction rules as needed.
4. The five framework methodologies ([SWOT](political-swot-framework.md), [Risk](political-risk-methodology.md), [Threat](political-threat-framework.md), [Classification](political-classification-guide.md), [Style](political-style-guide.md)) → apply the relevant framework when the protocol step calls for it.
5. The 39 templates under [`../templates/`](../templates/README.md) — one per unique artifact, plus the six framework templates (political-classification, risk-assessment, swot-analysis, threat-analysis, stakeholder-impact, per-file-political-intelligence) → copy the shape into the artifact file and fill it with analysis.

---

## 🔗 Related Documents

- [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) — 10-step analysis protocol (authoritative)
- [`per-artifact-methodologies.md`](per-artifact-methodologies.md) — one section per artifact type with construction rules
- [`reference-quality-thresholds.json`](reference-quality-thresholds.json) — machine-enforced per-artifact depth floors
- [`README.md`](README.md) — methodologies index
- [`../templates/README.md`](../templates/README.md) — templates index
- [`../README.md`](../README.md) — analysis directory overview

---

**Document Control:**
- **Path:** `/analysis/methodologies/artifact-catalog.md`
- **Classification:** Public
- **Version:** 1.1 — Added `extended/` folder (12 optional deep-intelligence artifacts) from riksdagsmonitor port (2026-04-23); v1.0 was initial extraction from Run 184 benchmark and 2026-04-20 / 2026-04-21 daily runs.
- **Next Review:** 2026-06-30
