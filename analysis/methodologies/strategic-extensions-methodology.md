<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📙 Strategic Extensions Methodology</h1>

<p align="center">
  <strong>📊 Family C — Depth Layer for High-Significance European Parliament Events</strong><br>
  <em>🎯 Scenario Analysis · Comparative International · Devil's Advocate (ACH) · Intelligence Assessment · Methodology Reflection</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.1-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--25-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.1 | **📅 Last Updated:** 2026-04-25 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-07-31
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🔄 Tradecraft Anchors

| Element | Value | Reference |
|---------|-------|-----------|
| **F3EAD Stage** | **ANALYZE** | This methodology covers deep analytical processing — competing hypotheses, alternative futures, cross-country comparison |
| **PIRs Served** | Per-file: intelligence-assessment.md declares served PIRs; devils-advocate challenges PIR-relevant hypotheses; comparative-international benchmarks fiscal and regulatory dimensions | See [`political-style-guide.md` §PIR/EEI Catalog](political-style-guide.md#-priority-intelligence-requirements-pir--essential-elements-of-information-eei) |
| **Admiralty Floor** | devils-advocate.md requires ≥[B2] evidence per hypothesis; intelligence-assessment.md Key Judgments require ≥[A1] or ≥2×[B2] | See [`political-style-guide.md` §Admiralty Code](political-style-guide.md#-admiralty-source-reliability-code-nato-stanag-2022) |
| **WEP Requirement** | scenario-analysis.md probabilities in WEP language; intelligence-assessment.md Key Judgments with WEP + ODNI confidence | See [`political-style-guide.md` §WEP + ODNI](political-style-guide.md#-words-of-estimative-probability-wep--odni-confidence-overlay) |
| **ICD 203 Gate** | Standard 2 (uncertainties), 3 (judgments vs assumptions), 4 (alternative analysis), 7 (explain changes) | See [`political-style-guide.md` §ICD 203](political-style-guide.md#-icd-203-analytic-tradecraft-standards-mapping) |
| **SAT(s)** | ACH, Red Team, Devil's Advocacy (devils-advocate.md); What If?, Morphological (scenario-analysis.md); Outside-In Thinking (comparative-international.md); Key Assumptions Check, Quality of Information Check (methodology-reflection.md) | See [`political-style-guide.md` §SATs](political-style-guide.md#-structured-analytic-techniques-sats-catalog) |

---

## 🎯 Purpose

Family C delivers **analytic depth** when the European Parliament event set warrants it. Where Family A narrates *what happened*, Family C answers:

- **What could happen next?** (scenario-forecast)
- **How does this compare internationally?** (comparative-international)
- **What are we getting wrong?** (devils-advocate-analysis — ACH)
- **What does this mean at the intelligence level?** (intelligence-assessment)
- **Was our process sound?** (methodology-reflection)

### Core — every run produces all 5

Family C files are **always produced on every workflow run**. They are not trigger-driven. Depth per file adapts to the day's DIW distribution, but the output set is stable: every folder ships `scenario-forecast.md`, `comparative-international.md`, `devils-advocate-analysis.md`, `intelligence-assessment.md`, and `methodology-reflection.md`.

| File | Behaviour on a light EP day | Behaviour on a P0-dense day |
|------|-------------------------------|-----------------------------|
| `scenario-forecast.md` | Three scenarios converge on a narrow-band consensus; file documents why branching is low | Three divergent scenarios with probability-weighted indicators |
| `comparative-international.md` | Compares EU policy position to ≥5 peer jurisdictions (27 member states, US, UK) | Peer-country reform response with deep causal analysis |
| `devils-advocate-analysis.md` | ACH on the day's #1 ranked document with ≥3 competing hypotheses | Full ACH on every P0 + red-team hypothesis + Bayesian base-rate check |
| `intelligence-assessment.md` | 3 Key Judgments tied to PIRs for the next 72 h | 5–7 Key Judgments with confidence + warning indicators + OSINT cross-checks |
| ⭐ `methodology-reflection.md` | **Vital run-audit gate.** Evidence sufficiency, confidence distribution, source diversity, political-group-neutrality arithmetic, ≥3 concrete methodology improvements for the next cycle | Same structure; skipping the file breaks the self-correction loop and fails the quality gate |

> ⭐ **`methodology-reflection.md` is vital.** It is the only file that audits the run itself. Treat a missing or stub `methodology-reflection.md` as a broken workflow and revise before commit. The Pass-2 rewrite in the AI-Driven Guide Step 9 reads this file before revising every other file.

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
flowchart LR
    classDef famA fill:#E8F5E9,stroke:#4CAF50,color:#1B5E20
    classDef scenario fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    classDef ach fill:#FFEBEE,stroke:#D32F2F,color:#B71C1C
    classDef intl fill:#FFF8E1,stroke:#FFC107,color:#3E2723
    classDef intel fill:#F3E5F5,stroke:#7B1FA2,color:#311B92
    classDef reflect fill:#FFF3E0,stroke:#FF9800,color:#BF360C,stroke-width:3px

    A[Family A<br/>synthesis + impact]:::famA
    C1[scenario-forecast.md<br/>🔮 plausible futures]:::scenario
    C2[comparative-international.md<br/>🌍 EU/MS parallels]:::intl
    C3[devils-advocate-analysis.md<br/>⚔️ ACH + Red Team]:::ach
    C4[intelligence-assessment.md<br/>🎯 strategic bottom line]:::intel
    C5[⭐ methodology-reflection.md<br/>🔬 VITAL run-audit gate]:::reflect

    A --> C1
    A --> C2
    A --> C3
    C1 --> C4
    C3 --> C4
    C2 --> C4
    C4 --> C5
```

---

## 🔮 Part 1 — Scenario Forecast (`scenario-forecast.md`)

### Purpose
Explore **≥3 plausible forward paths** for the top P0/P1 items over a 30–180 day horizon, each evidenced and each with pre-declared indicators so analysts can track which path materialises.

### Input
- significance-scoring.md (which items to scenario)
- synthesis-summary.md (current narrative baseline)
- stakeholder-map.md (actor positions that drive branching)
- Historical baseline (Family D `historical-parallels.md` when available)

### EP MCP Tools
- `get_meps` — identify key MEPs driving scenarios
- `analyze_voting_patterns` — establish voting baseline for scenario triggers
- `monitor_legislative_pipeline` — track legislative bottlenecks
- `analyze_coalition_dynamics` — coalition stability signals
- `get_procedures` — procedural timelines for scenario milestones
- `detect_voting_anomalies` — early warning signals

### Output — required structure

1. **Baseline (expected)** — the path implied by current stated positions + prior revealed preferences
2. **Upside** — a plausible path more favourable to democratic accountability / institutional strength
3. **Downside** — a plausible path more hostile to the status quo
4. **Wildcard** — low-probability / high-impact branch (≤10 % probability)
5. For **each** scenario:
   - Narrative (≤120 words)
   - Triggering events (≥3 concrete, each with a source or dated leading indicator)
   - Blocking events (what would make this scenario fail)
   - Probability (with 5-level confidence label)
   - Consequence summary (actor-by-actor, institution-by-institution)
   - Early-warning indicators (observable within 14 days)
6. **Scenario-probability Mermaid** — color-coded probability bar
7. **Branching decision Mermaid** — color-coded flowchart of key forks
8. **Cross-scenario comparison table** — impact × probability × reversibility

### Required Mermaid — branching paths

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff"}}}%%
flowchart TD
    classDef base fill:#9E9E9E,stroke:#424242,color:#FFFFFF
    classDef upside fill:#4CAF50,stroke:#1B5E20,color:#FFFFFF
    classDef downside fill:#FF9800,stroke:#E65100,color:#FFFFFF
    classDef wild fill:#D32F2F,stroke:#B71C1C,color:#FFFFFF
    classDef fork fill:#FFC107,stroke:#F57F17,color:#3E2723

    T0[Today — P0 procedure filed]:::base
    F1{Fork 1<br/>Committee vote ≤14d}:::fork
    F2{Fork 2<br/>Political group cohesion}:::fork

    S_base[Baseline<br/>orderly passage · 55 %]:::base
    S_up[Upside<br/>cross-group compromise · 20 %]:::upside
    S_down[Downside<br/>group fracture · 20 %]:::downside
    S_wild[Wildcard<br/>Commission censure trigger · 5 %]:::wild

    T0 --> F1
    F1 -->|pass| F2
    F1 -->|block| S_down
    F2 -->|unified| S_base
    F2 -->|split| S_up
    F1 -->|escalation| S_wild
```

### Quality gate
- [ ] Probabilities sum to 100 %
- [ ] Each scenario has ≥3 named triggering events with sources
- [ ] Each scenario has ≥2 early-warning indicators with ISO dates
- [ ] Wildcard probability ≤10 %
- [ ] Blocking events named and sourced
- [ ] Cross-scenario table present

---

## 🌍 Part 2 — Comparative International (`comparative-international.md`)

### Purpose
Place the European Parliament political event in **international context** so readers understand precedent, best practice, and likely interactions with EU member states, US, UK, and other peer jurisdictions.

### Input
- synthesis-summary.md (current events)
- IMF (sole authoritative economic source) WEO / FM / IFS + World Bank WGI indicators (non-economic — governance, social, demographics), Eurostat cross-country comparables
- Legislative databases from peer parliaments (where EU law or policy intersects)
- Named peer countries (default set: DE, FR, IT, ES, PL, NL for large-MS benchmark; US, UK, JP for global comparators)

### EP MCP Tools
- `analyze_country_delegation` — per-country MEP delegation analysis
- `compare_political_groups` — cross-group comparison data
- `get_adopted_texts` — adopted legislation for comparison
- `get_external_documents` — Commission/Council positions from third parties
- IMF MCP (sole authoritative economic source — `imf-fetch-data` for WEO/FM/IFS/BOP/ER/PCPS/GFSR/EREO/FSI/GFS/DOT) + World Bank MCP tools (non-economic — governance WGI, social, health, education, environment, agriculture, innovation)
- IMF MCP tools — fiscal forecasts

### Output — required structure

1. **Issue framing** — ≤80 words: what is the EU/EP question being compared?
2. **Peer-country evidence table** — for each peer country:
   - Country · Approach (brief) · Outcome (quantified) · Source · Applicability to EU
3. **Best-practice extraction** — three elements worth importing, with sources
4. **Incompatibility notes** — three elements that do not travel well, with reasons
5. **EU-law intersection** — directives, regulations, and open infringement procedures that apply
6. **Comparative Mermaid** — color-coded country grid on the chosen axis (e.g. policy permissiveness)
7. **Benchmark trend chart** — quantitative time-series Mermaid where IMF data exists (sole authoritative economic source); World Bank cross-refs for non-economic dimensions

### Required Mermaid — peer grid

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff"}}}%%
graph LR
    classDef high fill:#4CAF50,stroke:#1B5E20,color:#FFFFFF
    classDef med fill:#FFC107,stroke:#F57F17,color:#3E2723
    classDef low fill:#FF9800,stroke:#E65100,color:#FFFFFF
    classDef crit fill:#D32F2F,stroke:#B71C1C,color:#FFFFFF
    classDef eu fill:#1565C0,stroke:#0D47A1,color:#FFFFFF

    EU[European Union<br/>current EP position]:::eu
    DE[Germany<br/>high-integration approach]:::high
    FR[France<br/>medium-integration approach]:::med
    IT[Italy<br/>medium-integration approach]:::med
    PL[Poland<br/>divergent approach]:::low
    HU[Hungary<br/>critical outlier]:::crit
    US[United States<br/>external comparator]:::low

    EU -.benchmark.- DE
    EU -.benchmark.- FR
    EU -.benchmark.- IT
    EU -.benchmark.- PL
    EU -.benchmark.- HU
    EU -.benchmark.- US
```

### Quality gate
- [ ] ≥5 peer countries included (default EU large-MS set is acceptable)
- [ ] Every peer row has a quantified outcome and a source URL
- [ ] Applicability column distinguishes constitutional, institutional, and operational transferability
- [ ] EU-law intersection lists specific directive/regulation numbers
- [ ] Benchmark chart included when IMF data exists (primary) or WB non-economic data is relevant

---

## ⚔️ Part 3 — Devil's Advocate (`devils-advocate-analysis.md`)

### Purpose
Apply the **Analysis of Competing Hypotheses (ACH)** technique to stress-test the dominant interpretation of the day's events. Surfaces alternative explanations, red-teams the narrative, and quantifies residual uncertainty.

### Input
- synthesis-summary.md (candidate narrative)
- stakeholder-map.md (declared positions)
- Family B cross-reference-map.md (coordinated-activity patterns)
- Open-source intelligence (OSINT) on actor history

### EP MCP Tools
- `get_mep_details` — actor background for ACH
- `analyze_voting_patterns` — historical voting consistency
- `detect_voting_anomalies` — anomalous behaviour signals
- `get_parliamentary_questions` — written/oral question patterns
- `correlate_intelligence` — cross-tool intelligence correlation

### Output — required structure

1. **Dominant hypothesis (H1)** — the synthesis's main interpretation, stated in ≤40 words
2. **Alternative hypotheses (H2, H3, … Hn, n ≥ 3)** — each a genuinely different interpretation
3. **Evidence matrix** — rows: observable evidence items; columns: each hypothesis; cells: Supports (+), Contradicts (−), Ambiguous (~)
4. **Diagnostic value analysis** — each piece of evidence scored by how much it discriminates between hypotheses
5. **Residual uncertainty statement** — what would have to be true to flip the ranking
6. **Red-team section** — a maximally adversarial interpretation from the POV of a hostile actor
7. **Confidence summary** — per-hypothesis confidence label
8. **ACH Mermaid** — color-coded outcome network

### Required Mermaid — ACH outcome

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff"}}}%%
graph TB
    classDef win fill:#4CAF50,stroke:#1B5E20,color:#FFFFFF
    classDef lose fill:#D32F2F,stroke:#B71C1C,color:#FFFFFF
    classDef neutral fill:#9E9E9E,stroke:#424242,color:#FFFFFF
    classDef red fill:#C2185B,stroke:#880E4F,color:#FFFFFF

    H1[H1 — dominant<br/>policy continuity<br/>🟩 HIGH confidence]:::win
    H2[H2 — alternative<br/>pre-election signalling<br/>🟧 MEDIUM]:::neutral
    H3[H3 — alternative<br/>coalition renegotiation<br/>🟧 MEDIUM]:::neutral
    H4[H4 — red-team<br/>deliberate misdirection<br/>🟥 LOW]:::red
    H5[H5 — rejected<br/>uncoordinated noise<br/>⬛ VERY LOW]:::lose

    Evidence[Observable evidence set] --> H1
    Evidence --> H2
    Evidence --> H3
    Evidence --> H4
    Evidence --> H5
```

### ACH scoring rules — positive-voice
- Produce an evidence matrix with at least 5 rows of diagnostic evidence
- Rank hypotheses by inconsistency score (fewer − cells wins)
- Call out the evidence item whose removal would flip the top-2 ranking — that's the "fragility point"
- Include a hypothesis that a hostile actor would push (Red Team H_n)
- Pre-declare a disconfirming observation that would reverse the assessment

### Quality gate
- [ ] n ≥ 3 alternative hypotheses, each substantively different
- [ ] Evidence matrix ≥5 rows × ≥4 hypothesis columns
- [ ] Fragility point identified
- [ ] Red-team hypothesis present with explicit "this is adversarial framing" label
- [ ] Residual uncertainty statement quantified

---

## 🎯 Part 4 — Intelligence Assessment (`intelligence-assessment.md`)

### Purpose
Deliver the **strategic bottom line** at intelligence-community quality: single assessment paragraph per question, confidence label, alternative view, and collection gap. Compliant with ICD 203 standards.

### Input
- synthesis-summary.md · stakeholder-map.md · scenario-forecast.md · devils-advocate-analysis.md
- Behavioral-analysis insights (actor history, cognitive biases)
- Prior intelligence-assessment.md files from the last 30 days (for continuity)

### EP MCP Tools
- `correlate_intelligence` — cross-tool OSINT correlation
- `assess_mep_influence` — influence scoring for key actors
- `early_warning_system` — political shift detection
- `generate_report` — structured analytical reports
- `generate_political_landscape` — political landscape overview

### Output — required structure

1. **Key Judgments (KJs)** — 3–7 numbered paragraphs, each with:
   - Assertion (≤60 words)
   - Confidence label (5-level scale)
   - Key evidence (≥2 citations)
   - Alternative view (one sentence)
2. **Strategic implications** — 3 bullets on what this means for decision-makers over 30–180 days
3. **Collection gaps** — 3 explicit questions the evidence base does not answer
4. **Priority intelligence requirements (PIR)** — 3 things the next cycle should prioritise
5. **Tradecraft note** — which analytic techniques were applied (ACH, SWOT, PESTLE, Network, etc.)
6. **Intelligence Mermaid** — color-coded confidence bar per KJ

### Required Mermaid — KJ confidence

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff"}}}%%
graph LR
    classDef vh fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    classDef h fill:#4CAF50,stroke:#1B5E20,color:#FFFFFF
    classDef m fill:#FFC107,stroke:#F57F17,color:#3E2723
    classDef l fill:#FF9800,stroke:#E65100,color:#FFFFFF
    classDef vl fill:#D32F2F,stroke:#B71C1C,color:#FFFFFF

    KJ1[KJ1 — grand coalition holds<br/>🟦 VERY HIGH]:::vh
    KJ2[KJ2 — directive passes plenary<br/>🟩 HIGH]:::h
    KJ3[KJ3 — ECR-PfE coordination weakens<br/>🟧 MEDIUM]:::m
    KJ4[KJ4 — Commission censure risk<br/>🟥 LOW]:::l
    KJ5[KJ5 — snap resignation trigger<br/>⬛ VERY LOW]:::vl
```

### Quality gate
- [ ] 3–7 Key Judgments
- [ ] Confidence labels distributed realistically (not all HIGH)
- [ ] Every KJ has ≥2 citations
- [ ] 3 collection gaps named
- [ ] 3 PIRs formatted as answerable questions
- [ ] Tradecraft note lists techniques explicitly

---

## 🔬 Part 5 — Methodology Reflection (`methodology-reflection.md`)

### Purpose
Transparent **analytic audit** of the workflow run — what worked, what didn't, what the next cycle must fix. This file is the platform's self-correction mechanism.

### Input
- All other outputs from the workflow
- Comparison with prior day's equivalent outputs
- Tool-call logs from the workflow runner
- Confidence-label distribution across outputs

### Output — required structure

1. **Evidence sufficiency audit** — for each Family A output, was evidence sufficient? (yes/no with reason)
2. **Confidence distribution** — histogram Mermaid of confidence labels across the workflow
3. **Source diversity** — percentage of claims from EP API vs Commission vs Council vs external
4. **Bias audit** — were all 8 political groups given fair analytical depth given their evidence footprint? Quantify.
5. **Tradecraft audit** — which techniques were applied; which were skipped and why
6. **Forward methodology adjustments** — 3 concrete improvements for next cycle, each actionable
7. **Prior-period comparison** — what has the methodology done better / worse vs last workflow?

### Required Mermaid — confidence distribution

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff"}}}%%
pie showData
    title Confidence label distribution across this workflow
    "🟦 VERY HIGH" : 12
    "🟩 HIGH" : 34
    "🟧 MEDIUM" : 38
    "🟥 LOW" : 12
    "⬛ VERY LOW" : 4
```

### Positive-voice bias audit rule
Produce a table of political groups × claims-about-them × depth-score (words + citations) so a reader can see neutrality arithmetically. Acceptable outcome: no group's depth deviates from the evidence-weighted average by more than 25 %.

### Quality gate
- [ ] Evidence sufficiency assessed per Family A output
- [ ] Confidence distribution Mermaid present
- [ ] Source diversity percentages sum to 100 %
- [ ] Bias audit quantified with specific numbers
- [ ] ≥3 concrete methodology adjustments named for next cycle

---

## 🛠️ Production Workflow — step-by-step

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff"}}}%%
flowchart TD
    classDef trig fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    classDef step fill:#E8F5E9,stroke:#4CAF50,color:#1B5E20
    classDef gate fill:#FFF8E1,stroke:#FFC107,color:#3E2723
    classDef out fill:#F3E5F5,stroke:#7B1FA2,color:#311B92
    classDef vital fill:#FFF3E0,stroke:#FF9800,color:#BF360C,stroke-width:3px

    Trig[Family A + B complete<br/>→ Family C begins]:::trig

    S1[Step 1 — Branch paths<br/>→ scenario-forecast.md]:::step
    S2[Step 2 — International framing<br/>→ comparative-international.md]:::step
    S3[Step 3 — ACH + Red Team<br/>→ devils-advocate-analysis.md]:::step
    S4[Step 4 — Strategic bottom line<br/>→ intelligence-assessment.md]:::step
    S5[⭐ Step 5 — VITAL run-audit<br/>→ methodology-reflection.md]:::vital

    G{Gate — all 5 files<br/>produced + quality-gated?}:::gate

    O[Family C complete]:::out

    Trig --> S1
    Trig --> S2
    Trig --> S3
    S1 --> S4
    S2 --> S4
    S3 --> S4
    S4 --> S5
    S5 --> G
    G -->|pass| O
    G -->|fail| S1
```

---

## ✅ Family-C Completion Checklist

- [ ] `scenario-forecast.md` — ≥4 scenarios · probabilities sum to 100 % · branching Mermaid · early-warning indicators with ISO dates
- [ ] `comparative-international.md` — ≥5 peer countries · quantified outcomes · EU-law section · benchmark chart
- [ ] `devils-advocate-analysis.md` — n ≥ 3 hypotheses · evidence matrix ≥5 rows · fragility point · red-team hypothesis
- [ ] `intelligence-assessment.md` — 3–7 KJs · confidence labels · collection gaps · PIRs · tradecraft note
- [ ] `methodology-reflection.md` — evidence audit · confidence distribution · bias audit · forward adjustments
- [ ] All files use canonical color palette and 5-level confidence scale
- [ ] All files cross-link to Family A and Family B inputs

---

## 🔗 Template bindings

| Template | Methodology section |
|----------|--------------------|
| `analysis/templates/scenario-forecast.md` | Part 1 above |
| `analysis/templates/comparative-international.md` | Part 2 above |
| `analysis/templates/devils-advocate-analysis.md` | Part 3 above |
| `analysis/templates/intelligence-assessment.md` | Part 4 above |
| `analysis/templates/methodology-reflection.md` | Part 5 above |

---

## 📐 Cross-references to other methodology layers

- **Upstream:** [synthesis-methodology.md](./synthesis-methodology.md) (Family A) · [structural-metadata-methodology.md](./structural-metadata-methodology.md) (Family B)
- **Downstream / parallel:** [electoral-domain-methodology.md](./electoral-domain-methodology.md) (Family D — lens-specific extensions)
- **Frameworks:** [political-swot-framework.md](./political-swot-framework.md) · [political-risk-methodology.md](./political-risk-methodology.md) · [political-threat-framework.md](./political-threat-framework.md)
- **Master protocol:** [ai-driven-analysis-guide.md](./ai-driven-analysis-guide.md)

---

## 🔐 ISMS Alignment

| Control | How this methodology satisfies it |
|---------|----------------------------------|
| ISO 27001 A.5.7 (Threat intelligence) | Scenario + devils-advocate + intelligence-assessment constitute structured threat intelligence |
| ISO 27001 A.5.31 (Legal, regulatory) | Comparative-international maps EU-law intersection and TEU/TFEU constraints |
| NIST CSF ID.RA-3 (Threats identified) | ACH surfaces alternative threat interpretations |
| NIST CSF ID.RA-5 (Risks prioritised) | Scenario probabilities + impact enable risk ranking |
| CIS 17.5 (Incident response plan — decision support) | Intelligence-assessment maps to decision-support doctrine |
| GDPR Art. 35 DPIA methodology | Methodology-reflection provides audit trail |
| NIS2 Art. 21 | Scenario analysis supports resilience planning |

---

## 📄 Document Control

**Owner:** CEO (Intelligence Program) · **Reviewer:** CISO + Chief Analyst · **Review Cycle:** Quarterly
**Next Review:** 2026-07-31 · **Related:** [ai-driven-analysis-guide.md](./ai-driven-analysis-guide.md), [synthesis-methodology.md](./synthesis-methodology.md), [electoral-domain-methodology.md](./electoral-domain-methodology.md)

---

*Generated following EU Parliament Monitor Strategic Extensions Methodology v1.0 — Family C Depth Layer.*
