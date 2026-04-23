<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📘 Synthesis & Scoring Methodology</h1>

<p align="center">
  <strong>📊 Family A — Core Synthesis Layer</strong><br>
  <em>🎯 Significance Scoring · Synthesis Summary · Executive Brief · Stakeholder Perspectives · Stakeholder Impact</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.1-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--21-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.1 | **📅 Last Updated:** 2026-04-21 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-07-21
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🔄 Tradecraft Anchors

| Element | Value | Reference |
|---------|-------|-----------|
| **F3EAD Stage** | **ANALYZE → DISSEMINATE** | This methodology covers the synthesis and dissemination phases of the intelligence cycle |
| **PIRs Served** | PIR-1 (Coalition Stability), PIR-5 (Fiscal Trajectory), PIR-7 (Democratic Norms) — all PIRs inform synthesis | See [`political-style-guide.md` §PIR/EEI Catalog](political-style-guide.md#-priority-intelligence-requirements-pir--essential-elements-of-information-eei) |
| **Admiralty Floor** | Evidence must reach **[B2]** or higher for inclusion in executive brief | See [`political-style-guide.md` §Admiralty Code](political-style-guide.md#-admiralty-source-reliability-code-nato-stanag-2022) |
| **WEP Requirement** | All forward-looking claims use WEP probability language | See [`political-style-guide.md` §WEP + ODNI](political-style-guide.md#-words-of-estimative-probability-wep--odni-confidence-overlay) |
| **ICD 203 Gate** | Standards 5 (customer relevance), 6 (logical argumentation), 8 (accurate judgments) | See [`political-style-guide.md` §ICD 203](political-style-guide.md#-icd-203-analytic-tradecraft-standards-mapping) |
| **SAT(s)** | Key Assumptions Check (synthesis-summary), Brainstorming (stakeholder-perspectives) | See [`political-style-guide.md` §SATs](political-style-guide.md#-structured-analytic-techniques-sats-catalog) |

---

## 🎯 Purpose

This methodology governs the **Family A — Core Synthesis layer** of every Riksdagsmonitor analysis workflow. The synthesis layer turns raw per-document evidence (Family E) and structural metadata (Family B) into **decision-ready intelligence products** that answer four questions:

1. **What happened today?** (synthesis-summary.md)
2. **Which items matter most?** (significance-scoring.md)
3. **Who is affected and how?** (stakeholder-perspectives.md + stakeholder-impact.md)
4. **What should a decision-maker do in ≤90 seconds of reading?** (executive-brief.md)

Every output in this family is produced for every daily workflow — no exceptions.

```mermaid
flowchart LR
    classDef evidence fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    classDef scoring fill:#FFF8E1,stroke:#FFC107,color:#3E2723
    classDef synthesis fill:#E8F5E9,stroke:#4CAF50,color:#1B5E20
    classDef brief fill:#F3E5F5,stroke:#7B1FA2,color:#311B92
    classDef stakeholder fill:#FFF3E0,stroke:#FF9800,color:#BF360C

    E[Family E<br/>per-document analyses]:::evidence
    B[Family B<br/>manifest + xref map]:::evidence
    S1[significance-scoring.md<br/>📊 rank + DIW]:::scoring
    S2[synthesis-summary.md<br/>📋 narrative synthesis]:::synthesis
    S3[stakeholder-perspectives.md<br/>🎭 party-by-party view]:::stakeholder
    S4[stakeholder-impact.md<br/>💥 who wins / who loses]:::stakeholder
    S5[executive-brief.md<br/>⚡ ≤90s decision brief]:::brief

    E --> S1
    B --> S1
    S1 --> S2
    S1 --> S3
    S3 --> S4
    S2 --> S5
    S4 --> S5
```

---

## 📐 Evidence & Confidence Standards

All outputs in this family inherit the platform-wide rules:

| Rule | Applied To |
|------|-----------|
| Every claim cites a `dok_id`, named actor with party, vote count, `rm` session, or primary-source URL | All five outputs |
| 5-level confidence scale — 🟦 VERY HIGH / 🟩 HIGH / 🟧 MEDIUM / 🟥 LOW / ⬛ VERY LOW | Required per scored row |
| Color-coded Mermaid using the canonical palette from the AI-Driven Analysis Guide | ≥1 per output |
| Swedish policy terms glossed on first use (e.g. *jobbskatteavdrag* — earned-income tax credit) | Synthesis + executive brief |
| Party neutrality — equal analytical depth for S, M, SD, C, V, KD, MP, L when evidence supports coverage | All outputs |

---

## 🔢 Part 1 — Significance Scoring (`significance-scoring.md`)

### Purpose
Rank every document processed in the workflow so downstream products (synthesis, executive brief) can focus attention where it matters. Significance scoring is the **single source of truth** for document priority across Family A, C, and D products.

### Input
- All Family E per-document analyses produced during the workflow
- Family B cross-reference-map.md (to detect bundle / coordinated activity multipliers)
- Voting data for each document (when applicable)

### Output — required structure

1. **Scoring matrix table** — one row per document, columns:
   - `Rank` · `dok_id` · `Title (short)` · `Doctype` · `Democratic-Impact Weight (DIW)` · `Tier` · `Confidence` · `Top rationale (≤15 words)`
2. **Tier distribution summary** — count of P0 / P1 / P2 / P3 documents
3. **DIW color-coded distribution** — horizontal bar Mermaid using the canonical palette
4. **Drivers of top-ranked items** — bulleted rationale for every P0 + P1 entry with `dok_id` citations

### DIW formula — canonical

Democratic-Impact Weight (DIW) is scored 0.0 – 10.0 along six dimensions, each 0.0 – 1.0 normalised, summed, then multiplied by 10 ÷ 6 for the final 0–10 scale:

| Dimension | Weight | Example high-score indicator |
|-----------|:------:|-------------------------------|
| 🏛️ Institutional reach | 1.0 | Constitutional change, election-law amendment, agency mandate |
| ⚖️ Rights & freedoms impact | 1.0 | GDPR article 9 data, speech, assembly, due process |
| 💰 Fiscal magnitude | 1.0 | ≥1% of statsbudget or ≥50 000 direct beneficiaries |
| 🗳️ Electoral salience | 1.0 | Pre-election window + top-10 voter-priority issue |
| 🔀 Coalition pressure | 1.0 | Forces deviation from Tidöavtalet or opposition red line |
| 📡 Media resonance | 1.0 | Coordinated opposition response or government flagship announcement |

### Tier mapping
- **P0 (Critical, DIW ≥ 8.0)** → triggers every Family C + D template
- **P1 (High, 6.0 ≤ DIW < 8.0)** → triggers scenario, devils-advocate, stakeholder-impact
- **P2 (Medium, 4.0 ≤ DIW < 6.0)** → synthesised only
- **P3 (Low, DIW < 4.0)** → listed in manifest, not narrated

### Quality gate
- [ ] Every document has a DIW in [0.0, 10.0]
- [ ] DIW cross-checks against Family E per-doc significance — ≤1.0 variance or reconciled
- [ ] Tier counts reconcile with Family B manifest total document count
- [ ] Top three rationales each cite ≥1 `dok_id` and ≥1 named actor

---

## 📋 Part 2 — Synthesis Summary (`synthesis-summary.md`)

### Purpose
Produce the **canonical narrative** of the day/week/cycle. Every other Family A product derives its headline from this file.

### Input
- significance-scoring.md (drives ordering)
- All Family E analyses (drives substance)
- Family B cross-reference-map.md (drives "bundle" and "pattern" callouts)
- Previous 5 workdays' synthesis-summary files (drives trend narration)

### Output — required structure

1. **Executive summary** — 3 paragraphs, inverted-pyramid, each opening sentence citing a `dok_id` or named vote
2. **Strategic finding cards** — 3–7 cards, one per major theme; each card contains:
   - Finding (≤40 words) · Evidence (≥2 `dok_id` or votes) · Confidence label · Dissenting view · Forward indicator
3. **Pattern table** — coordinated filings, cross-party agreement, government flagship clusters
4. **Mermaid thematic graph** — color-coded nodes by theme, edges by cross-reference strength
5. **Links** to: executive-brief.md, stakeholder-perspectives.md, scenario-analysis.md (always produced, Family C), Family E index
6. **Methodology footer** — models used, sources, cutoff time

### Required Mermaid — thematic graph example

```mermaid
graph TB
    classDef fiscal fill:#FFF8E1,stroke:#FFC107,color:#3E2723
    classDef security fill:#FFEBEE,stroke:#D32F2F,color:#B71C1C
    classDef climate fill:#E8F5E9,stroke:#4CAF50,color:#1B5E20
    classDef rights fill:#F3E5F5,stroke:#7B1FA2,color:#311B92
    classDef institutional fill:#E3F2FD,stroke:#1565C0,color:#0D47A1

    T1[Theme: Fiscal policy<br/>3 docs · DIW 7.4]:::fiscal
    T2[Theme: National security<br/>2 docs · DIW 8.1]:::security
    T3[Theme: Climate & energy<br/>4 docs · DIW 6.8]:::climate
    T4[Theme: Rights & rule of law<br/>1 doc · DIW 9.2]:::rights
    T5[Theme: Institutional reform<br/>2 docs · DIW 5.9]:::institutional

    T1 -->|shared sponsor M+KD| T3
    T2 -->|trade-off| T1
    T4 -->|constitutional| T5
    T3 -->|jurisdiction| T5
```

### Quality gate
- [ ] Top-ranked P0/P1 items from significance-scoring appear in the first 5 strategic finding cards
- [ ] Every card cites ≥2 primary sources
- [ ] Confidence labels distributed realistically (not every card "HIGH")
- [ ] Swedish terms glossed on first use
- [ ] Thematic Mermaid includes all themes mentioned in cards

---

## 🎭 Part 3 — Stakeholder Perspectives (`stakeholder-perspectives.md`)

### Purpose
Document **how every actor with material stake** interprets the day's findings — from their documented position, not the analyst's projection.

### Input
- significance-scoring.md (drives which items to cover)
- search_anforanden + search_dokument output per party for the covered `rm`
- Family E per-doc analyses (carry party statements)
- SCB / Opinionsläget polling (where identity of affected group matters)

### Output — required structure

1. **Actor × Issue matrix** — rows: actors (8 Riksdag parties + government + key myndigheter + EU + external); columns: top 5 issues from significance-scoring
   - Cell contents: stance glyph (✅ support · 🟧 conditional · 🟥 oppose · ⬜ silent) + 1-line rationale with source
2. **Deep profiles** — one per tier-1 actor (government + each of the 8 parties) with:
   - Documented position (`dok_id`, anförande quote, press release URL)
   - Strategic rationale (why they hold this position — supported by voting history)
   - Internal tension indicators (where party cohesion is stressed)
   - Forward move (likely next action in 7–30 days, labelled with confidence)
3. **Cross-actor alignment Mermaid** — color-coded edges (green = alignment, red = conflict, yellow = partial)
4. **Links** to stakeholder-impact.md (material consequences) and synthesis-summary.md

### Required Mermaid — actor alignment

```mermaid
graph LR
    classDef gov fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    classDef oppleft fill:#FFEBEE,stroke:#D32F2F,color:#B71C1C
    classDef oppright fill:#FFF8E1,stroke:#FFC107,color:#3E2723
    classDef ext fill:#F3E5F5,stroke:#7B1FA2,color:#311B92

    M[Moderaterna]:::gov
    KD[Kristdemokraterna]:::gov
    L[Liberalerna]:::gov
    SD[Sverigedemokraterna]:::gov
    S[Socialdemokraterna]:::oppleft
    V[Vänsterpartiet]:::oppleft
    MP[Miljöpartiet]:::oppleft
    C[Centerpartiet]:::oppright
    EU[EU Commission]:::ext

    M ---|aligned| KD
    M ---|aligned| L
    M ---|Tidö| SD
    S ---|aligned| V
    S -.partial.- MP
    C -.issue-based.- S
    EU ---|directive pressure| M
```

### Quality gate
- [ ] All 8 Riksdag parties covered (even if "silent" with rationale)
- [ ] Every stance has a source citation
- [ ] Internal tension section present for any party whose vote split >5% on this cycle's items
- [ ] Forward-move predictions include confidence labels and time windows

---

## 💥 Part 4 — Stakeholder Impact (`stakeholder-impact.md`)

### Purpose
Translate political positions into **material consequences** for citizens, sectors, and institutions. Where stakeholder-perspectives answers "who thinks what", stakeholder-impact answers **"who wins, who loses, by how much, when"**.

### Input
- stakeholder-perspectives.md (actor list)
- significance-scoring.md (which documents have measurable impact)
- SCB microdata, World Bank, IMF for quantitative scale
- Family E per-document implementation feasibility sections

### Output — required structure

1. **Impact matrix** — rows: affected group; columns: magnitude · direction · timeline · reversibility · affected count · confidence
2. **Winners & losers panel** — top 5 winners, top 5 losers, with:
   - Quantified benefit/loss (SEK, beneficiary count, service-level change)
   - Evidence (SCB, Riksrevisionen, budget-proposition math)
   - Confidence label
3. **Sector heat map** — Mermaid with color-coded impact intensity
4. **Equity lens** — impact disaggregated by income quintile, region (storstad/glesbygd), age group, gender where data allows
5. **Mitigations / compensations** — government-offered offsets with `dok_id`
6. **Links** to implementation-feasibility.md (Family D, always produced)

### Required Mermaid — sector heat map

```mermaid
graph TB
    classDef critneg fill:#D32F2F,stroke:#B71C1C,color:#FFFFFF
    classDef highneg fill:#FF9800,stroke:#E65100,color:#FFFFFF
    classDef neutral fill:#9E9E9E,stroke:#424242,color:#FFFFFF
    classDef highpos fill:#4CAF50,stroke:#1B5E20,color:#FFFFFF
    classDef critpos fill:#1565C0,stroke:#0D47A1,color:#FFFFFF

    Health[Healthcare<br/>+2.3B SEK · 12mo]:::highpos
    Defence[Defence industry<br/>+8.1B SEK · 36mo]:::critpos
    Agri[Agriculture<br/>−450M SEK · 6mo]:::highneg
    Culture[Cultural grants<br/>−890M SEK · 12mo]:::critneg
    Edu[Primary education<br/>neutral · pending]:::neutral
```

### Quality gate
- [ ] ≥1 quantitative figure per winner/loser row
- [ ] ≥1 equity-lens cut where SCB data exists
- [ ] Reversibility assessed (one-shot / ongoing / multi-cycle)
- [ ] Mitigations cited with `dok_id` or confirmed absence

---

## ⚡ Part 5 — Executive Brief (`executive-brief.md`)

### Purpose
Deliver a **≤90-second read** that gives a decision-maker the day's intelligence takeaway. If a reader only reads one file, this is it.

### Input
- synthesis-summary.md (for the canonical narrative)
- significance-scoring.md (for the ranked items)
- stakeholder-impact.md (for the consequence line)
- Family C scenario-analysis.md (always produced) for futures paragraph

### Output — required structure (strict 400–600 word budget)

1. **Top line** — single-sentence headline of the day (≤25 words)
2. **Three bullets — the only three things that matter** — each ≤30 words, each citing a `dok_id` or named vote
3. **So what? paragraph** — consequences for the next 7–30 days
4. **Watch-list** — 3–5 forward indicators (from Family D `forward-indicators.md` when present) with dates
5. **One chart** — a single Mermaid diagram (color-coded) — usually a quadrant or a short timeline
6. **Links** to: synthesis-summary.md, significance-scoring.md, stakeholder-impact.md, scenario-analysis.md

### Required Mermaid — decision quadrant example

```mermaid
quadrantChart
    title Decision-weighting quadrant — today's items
    x-axis "Low fiscal magnitude" --> "High fiscal magnitude"
    y-axis "Low political salience" --> "High political salience"
    quadrant-1 "⚡ Act now"
    quadrant-2 "🔍 Watch closely"
    quadrant-3 "📎 File"
    quadrant-4 "📊 Analyse"
    "prop 2025/26:108": [0.82, 0.78]
    "mot 2025/26:3412": [0.34, 0.71]
    "bet FiU2": [0.91, 0.52]
    "SOU 2026:18": [0.58, 0.31]
```

### Quality gate
- [ ] Word count within 400–600
- [ ] Every bullet has a primary-source citation
- [ ] No claim without a corresponding entry in synthesis-summary.md
- [ ] Mermaid diagram readable at a glance (≤10 nodes)
- [ ] Watch-list items have ISO dates

---

## 🛠️ Production Workflow — step-by-step

```mermaid
flowchart TD
    classDef input fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    classDef step fill:#E8F5E9,stroke:#4CAF50,color:#1B5E20
    classDef gate fill:#FFF8E1,stroke:#FFC107,color:#3E2723
    classDef output fill:#F3E5F5,stroke:#7B1FA2,color:#311B92

    I1[Family E per-doc analyses]:::input
    I2[Family B manifest + xref]:::input

    S1[Step 1 — Compute DIW per doc<br/>→ significance-scoring.md]:::step
    G1{Gate 1 — DIW reconciles<br/>with per-doc Family E?}:::gate
    S2[Step 2 — Narrate synthesis<br/>→ synthesis-summary.md]:::step
    S3[Step 3 — Build actor matrix<br/>→ stakeholder-perspectives.md]:::step
    S4[Step 4 — Quantify consequences<br/>→ stakeholder-impact.md]:::step
    G2{Gate 2 — Every claim cites<br/>primary source?}:::gate
    S5[Step 5 — Distill to 400-600 words<br/>→ executive-brief.md]:::step
    G3{Gate 3 — Brief readable<br/>in ≤90s?}:::gate

    O[Family A complete<br/>5/5 outputs]:::output

    I1 --> S1
    I2 --> S1
    S1 --> G1
    G1 -->|pass| S2
    G1 -->|fail| S1
    S2 --> S3
    S3 --> S4
    S4 --> G2
    G2 -->|pass| S5
    G2 -->|fail| S2
    S5 --> G3
    G3 -->|pass| O
    G3 -->|fail| S5
```

### Typical time budget (automated workflow, single day)
| Step | Share of Family A runtime |
|------|:-------------------------:|
| Step 1 — Significance scoring | 20 % |
| Step 2 — Synthesis summary | 35 % |
| Step 3 — Stakeholder perspectives | 15 % |
| Step 4 — Stakeholder impact | 15 % |
| Step 5 — Executive brief | 15 % |

---

## ✅ Family-A Completion Checklist

- [ ] `significance-scoring.md` — matrix · distribution chart · tiers · rationale per P0/P1
- [ ] `synthesis-summary.md` — 3-paragraph exec summary · 3–7 finding cards · pattern table · thematic Mermaid
- [ ] `stakeholder-perspectives.md` — actor × issue matrix · deep profile per tier-1 actor · alignment Mermaid
- [ ] `stakeholder-impact.md` — impact matrix · winners/losers · sector heat-map Mermaid · equity lens
- [ ] `executive-brief.md` — 400–600 words · 3 bullets · so-what · watch-list · 1 Mermaid
- [ ] Every file passes evidence gate (primary-source citations)
- [ ] Every file passes confidence-label gate (5-level scale)
- [ ] Every file uses canonical color palette
- [ ] All 5 files cross-linked to each other and back to Family B/E

---

## 🔗 Template bindings

| Template | Methodology section |
|----------|--------------------|
| `analysis/templates/significance-scoring.md` | Part 1 above |
| `analysis/templates/synthesis-summary.md` | Part 2 above |
| `analysis/templates/stakeholder-impact.md` | Part 4 above (also covers `stakeholder-perspectives.md`) |
| `analysis/templates/executive-brief.md` | Part 5 above |

---

## 📐 Cross-references to other methodology layers

- **Upstream (inputs):** [per-document-methodology.md](./per-document-methodology.md) (Family E) · [structural-metadata-methodology.md](./structural-metadata-methodology.md) (Family B)
- **Downstream (always produced on every run):** [strategic-extensions-methodology.md](./strategic-extensions-methodology.md) (Family C) · [electoral-domain-methodology.md](./electoral-domain-methodology.md) (Family D)
- **Style & voice:** [political-style-guide.md](./political-style-guide.md)
- **Master protocol:** [ai-driven-analysis-guide.md](./ai-driven-analysis-guide.md)

---

## 🔐 ISMS Alignment

| Control | How this methodology satisfies it |
|---------|----------------------------------|
| ISO 27001 A.5.23 (Information security for use of cloud services) | All sources are public cloud APIs with documented endpoints in manifest |
| ISO 27001 A.5.34 (Privacy and PII protection) | Stakeholder profiles handle political-opinion data under GDPR Art. 9(2)(e)/(g); data minimisation enforced |
| NIST CSF ID.RA-4 | Significance scoring = continuous risk assessment of institutional activities |
| NIST CSF DE.AE-3 | Cross-party alignment Mermaid supports anomaly detection |
| CIS 3.1 Data management process | Provenance enforced via Family B manifest linkage |

---

## 📄 Document Control

**Owner:** CEO (Intelligence Program) · **Reviewer:** CISO + Editorial Lead · **Review Cycle:** Quarterly
**Next Review:** 2026-07-21 · **Related:** [ai-driven-analysis-guide.md](./ai-driven-analysis-guide.md), [political-style-guide.md](./political-style-guide.md)

---

*Generated following Riksdagsmonitor Synthesis & Scoring Methodology v1.0 — Family A Core Synthesis Layer.*
