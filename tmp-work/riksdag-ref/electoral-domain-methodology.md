<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📕 Electoral & Domain Methodology</h1>

<p align="center">
  <strong>📊 Family D — Lens-Specific Analytical Depth</strong><br>
  <em>🎯 Election 2026 · Voter Segmentation · Coalition Mathematics · Historical Parallels · Media Framing · Implementation Feasibility · Forward Indicators</em>
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
| **F3EAD Stage** | **ANALYZE → DISSEMINATE** | This methodology applies domain lenses (electoral, historical, media, implementation, forward-watch) to enrich intelligence products |
| **PIRs Served** | election-2026.md serves PIR-6 (Election Integrity); coalition-mathematics.md serves PIR-1 (Coalition Stability); implementation-feasibility.md serves PIR-5 (Fiscal Trajectory), PIR-7 (Democratic Norms) | See [`political-style-guide.md` §PIR/EEI Catalog](political-style-guide.md#-priority-intelligence-requirements-pir--essential-elements-of-information-eei) |
| **Admiralty Floor** | Polling data requires ≥[B2] (named pollster, date, sample); historical parallels require ≥[A1] (official records from Riksdag archive) | See [`political-style-guide.md` §Admiralty Code](political-style-guide.md#-admiralty-source-reliability-code-nato-stanag-2022) |
| **WEP Requirement** | election-2026.md seat projections with WEP probability; forward-indicators.md triggers with WEP likelihood; scenario probabilities must sum to 100% | See [`political-style-guide.md` §WEP + ODNI](political-style-guide.md#-words-of-estimative-probability-wep--odni-confidence-overlay) |
| **ICD 203 Gate** | Standard 5 (customer relevance — forward indicators), 6 (logical argumentation — coalition mathematics), 9 (visual information — all files) | See [`political-style-guide.md` §ICD 203](political-style-guide.md#-icd-203-analytic-tradecraft-standards-mapping) |
| **SAT(s)** | Morphological (election-2026, coalition-mathematics); Outside-In Thinking (historical-parallels, voter-segmentation, media-framing); Premortem Analysis (implementation-feasibility); Indicators and Signposts (forward-indicators) | See [`political-style-guide.md` §SATs](political-style-guide.md#-structured-analytic-techniques-sats-catalog) |

---

## 🎯 Purpose

Family D supplies **issue-specific analytical lenses** that sharpen every workflow across electoral cycles, voter segments, coalition arithmetic, historical echoes, the media environment, delivery questions, and forward watch-lists.

These products are **core — every run produces all 7**. The output set is stable across morning, evening, realtime, weekly, and monthly workflows. What adapts per run is item-level depth (tier L1 → L3) and the substance inside each file — not whether the file exists.

### Core — every run produces all 7

| Template | Behaviour on a light-event day | Behaviour on a P0-dense day |
|----------|-------------------------------|-----------------------------|
| `election-2026-analysis.md` | Seat-projection delta vs. last poll + which parties crossed the 4 % threshold; until 2026-09 it tracks the campaign; post-2026 it tracks the new government-formation context | Full seat projection + coalition viability + campaign-phase alignment of every P0 to the election cycle |
| `voter-segmentation.md` | Baseline segment positions (5 axes: age, geography, education, income, incumbency) | Per-document segment impact table with ≥5 cohorts and quantified swing estimates |
| `coalition-mathematics.md` | Current seat map + pivotal-vote reference + confidence-vote arithmetic | Scenario branching: each contested vote run through Sainte-Laguë, pivotal-actor detection, SD-Tidöbloc-opposition matrix |
| `historical-parallels.md` (variant: `historical-baseline.md`) | Closest baseline precedent ≤ 40 years with similarity score, or explicit "no-precedent" finding | Full parallel with outcome, stakeholder behaviour, and Bayesian base-rate update |
| `media-framing-analysis.md` | Per-party + per-press-quadrant framing of the day's lead story, plus longitudinal-frame delta | Per-document frame audit with quoted examples and platform-by-platform amplification scores |
| `implementation-feasibility.md` | Audit of in-flight delivery backlog (IT, budget, regulatory, workforce) when no new bill lands | Full RACI + milestone + risk-register for each new delivery obligation |
| `forward-indicators.md` | ≥10 indicators across 4 horizons (72 h / week / month / election) refreshed every run | Indicators + thresholds + trigger-to-hypothesis mapping for every P0/P1 |

```mermaid
flowchart LR
    classDef core fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    classDef electoral fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    classDef historical fill:#FFF8E1,stroke:#FFC107,color:#3E2723
    classDef media fill:#F3E5F5,stroke:#7B1FA2,color:#311B92
    classDef impl fill:#E8F5E9,stroke:#4CAF50,color:#1B5E20
    classDef fwd fill:#FFF3E0,stroke:#FF9800,color:#BF360C

    T[Family A/B complete<br/>→ Family D core run]:::core

    D1[election-2026-analysis.md]:::electoral
    D2[voter-segmentation.md]:::electoral
    D3[coalition-mathematics.md]:::electoral
    D4[historical-parallels.md]:::historical
    D5[media-framing-analysis.md]:::media
    D6[implementation-feasibility.md]:::impl
    D7[forward-indicators.md]:::fwd

    T --> D1
    T --> D2
    T --> D3
    T --> D4
    T --> D5
    T --> D6
    T --> D7
```

---

## 🗳️ Part 1 — Election 2026 Analysis (`election-2026-analysis.md`)

**Filename variant:** `election-2026-implications.md` — identical structure.

### Purpose
Translate today's policy activity into **electoral consequences** for the September 2026 Riksdag vote: seat trajectories, bloc viability, mandate strength, and pre-election narrative positioning.

### Input
- synthesis-summary.md (current events)
- Opinion polling (SIFO, Novus, Demoskop, Sentio) — use only published, dated figures
- 2018 + 2022 election results (for baseline trajectory)
- Seat-allocation rules (Sainte-Laguë modified + 4 % threshold + 12 % regional)

### Output — required structure

1. **Bloc standing table** — for Tidöavtalet (M, KD, L, SD) vs Opposition (S, V, MP, C) vs cross-bloc:
   - Current poll average · 30-day change · 90-day change · Last election
2. **Seat-projection table** — per party, showing polling-average seat translation with 4 % threshold risk flag
3. **Threshold-risk watch** — any party within ±1.0 pp of 4 %
4. **Narrative positioning** — how today's event helps / hurts each party's election narrative
5. **Mobilisation implications** — turnout implications (young-voter, first-time, non-voter)
6. **Seat-projection Mermaid** — color-coded bar by party
7. **Bloc-standing Mermaid** — color-coded stacked bar

### Required Mermaid — bloc standing

```mermaid
graph LR
    classDef tido fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    classDef opp fill:#D32F2F,stroke:#B71C1C,color:#FFFFFF
    classDef cross fill:#FFC107,stroke:#F57F17,color:#3E2723

    M[M<br/>19.1 %<br/>🟦 Tidö]:::tido
    SD[SD<br/>18.4 %<br/>🟦 Tidö]:::tido
    KD[KD<br/>4.8 %<br/>🟦 Tidö]:::tido
    L[L<br/>3.9 %<br/>⚠️ threshold]:::tido
    S[S<br/>31.2 %<br/>🟥 opposition]:::opp
    V[V<br/>7.1 %<br/>🟥 opposition]:::opp
    MP[MP<br/>4.6 %<br/>🟥 opposition]:::opp
    C[C<br/>7.3 %<br/>🟧 cross-bloc]:::cross
```

### Quality gate
- [ ] All 8 parties covered
- [ ] Threshold risk explicit for any party <5 %
- [ ] Polling averages cite ≥2 pollsters with dates
- [ ] Seat math uses Sainte-Laguë modified
- [ ] Narrative-positioning section neutral (equal depth across parties)

---

## 👥 Part 2 — Voter Segmentation (`voter-segmentation.md`)

### Purpose
Identify which **voter segments** are materially affected by today's events and how each segment's pre-existing political alignment interacts with the new signal.

### Input
- SCB demographic microdata (age × region × income × education × sector)
- Polling cross-tabs (published segment-level data only)
- Prior election turnout + vote-by-segment data (SCB Statistiska Meddelanden)

### Output — required structure

1. **Segment panel** — for each of: Young-urban (18–34, storstad), Mid-career family (35–54), Retired (65+), Rural / glesbygd, High-income (top quintile), Low-income (bottom quintile), Secondary-sector workers, Public-sector workers:
   - Current political alignment · Policy exposure to today's events · Likely response
2. **Segment-issue Mermaid** — color-coded quadrant (alignment × exposure)
3. **Mobilisation index** — which segments are most "move-able" given the current evidence
4. **Disaggregation notes** — where SCB data permits further cuts (e.g. foreign-born, women 35–44, etc.)

### Required Mermaid — segment quadrant

```mermaid
quadrantChart
    title Segment alignment vs policy exposure
    x-axis "Low policy exposure" --> "High policy exposure"
    y-axis "Left-bloc leaning" --> "Right-bloc leaning"
    quadrant-1 "High-exposure right"
    quadrant-2 "High-exposure left"
    quadrant-3 "Low-exposure left"
    quadrant-4 "Low-exposure right"
    "Young-urban 18-34": [0.72, 0.28]
    "Retired 65+": [0.65, 0.71]
    "Rural / glesbygd": [0.41, 0.68]
    "Public-sector": [0.78, 0.35]
```

### Quality gate
- [ ] ≥8 segments covered
- [ ] Every segment has SCB-cited demographic magnitude
- [ ] Segment-issue quadrant includes all covered segments
- [ ] Mobilisation index explains movability with evidence
- [ ] Privacy rule: no segment drawn to <1000 persons to avoid re-identification

---

## 🧮 Part 3 — Coalition Mathematics (`coalition-mathematics.md`)

### Purpose
Compute the **arithmetic of government formation, confidence, and policy coalition** — which combinations clear 175 seats, which survive a misstatement of confidence, and which emerge as issue-specific coalitions for today's vote.

### Input
- Latest Riksdag seat distribution (349 seats)
- Current government composition
- Party-platform compatibility matrix (based on voting history from `search_voteringar`)
- Today's vote results when applicable

### Output — required structure

1. **Seat-count table** — per party, current seats
2. **Majority viability matrix** — all plausible 3–5 party coalitions with seat totals, tolerance to loss of 1 party, ideological coherence score
3. **Confidence arithmetic** — who can block a confidence vote, who can trigger it
4. **Issue-specific coalitions** — for today's top 3 items, which coalition actually materialised (from voting data)
5. **Cohesion indicators** — party vote-split percentages on today's items
6. **Coalition-viability Mermaid** — color-coded by viability status

### Required Mermaid — coalition viability

```mermaid
graph TB
    classDef maj fill:#4CAF50,stroke:#1B5E20,color:#FFFFFF
    classDef min fill:#FFC107,stroke:#F57F17,color:#3E2723
    classDef blocked fill:#D32F2F,stroke:#B71C1C,color:#FFFFFF
    classDef hypo fill:#9E9E9E,stroke:#424242,color:#FFFFFF

    C1[M+SD+KD+L<br/>175 seats · current]:::maj
    C2[S+V+MP+C<br/>158 seats]:::min
    C3[S+C+MP<br/>132 seats]:::min
    C4[M+S grand coalition<br/>186 seats · hypothetical]:::hypo
    C5[M+SD only<br/>140 seats · blocked by L/KD exit]:::blocked
```

### Quality gate
- [ ] All coalitions summed to exact seat counts
- [ ] Tolerance-to-defection column filled per coalition
- [ ] Issue-specific coalitions cite `dok_id` and vote counts from `search_voteringar`
- [ ] Cohesion indicators include numeric vote-split percentages
- [ ] Hypothetical coalitions clearly labelled

---

## 📜 Part 4 — Historical Parallels (`historical-parallels.md`)

**Filename variant:** `historical-baseline.md` — identical structure.

### Purpose
Locate today's event within a **named prior episode** (≤40 years back) and learn from what happened next last time.

### Input
- Riksdag archive (`search_dokument` with historical `rm` parameters)
- SOU (Statens offentliga utredningar) archive
- Academic political-history references where applicable

### Output — required structure

1. **Prior-episode cards** — ≥3 named parallels; per card:
   - Name + date · Actors · Policy domain · Outcome · Duration · Source
   - Similarity score (1–10) with justification
   - Difference callouts — what is not analogous
2. **Timeline Mermaid** — color-coded timeline of prior episodes
3. **Lesson-extraction table** — which lessons transfer, which do not
4. **Base-rate note** — based on prior parallels, prior probability of each scenario outcome

### Required Mermaid — timeline

```mermaid
timeline
    title Historical parallels for today's event
    section 1990s
        1994 : Maastricht pre-accession debate
        1999 : EMU referendum prep
    section 2000s
        2003 : Euro referendum
        2008 : Financial-crisis emergency budget
    section 2010s
        2013 : RUT-expansion opposition coordination
        2018 : Post-election 134-day formation crisis
    section 2020s
        2022 : Tidöavtalet ratification
        2024 : NATO ratification package
```

### Quality gate
- [ ] ≥3 named parallels with dates and sources
- [ ] Similarity score present with justification
- [ ] Difference callouts explicit (not every lesson transfers)
- [ ] Base-rate note quantifies prior-probability observation
- [ ] Timeline Mermaid covers full spread

---

## 📢 Part 5 — Media Framing Analysis (`media-framing-analysis.md`)

### Purpose
Document the **frames** being used by each actor and major media outlet so readers can separate substantive content from strategic communication.

### Input
- Official press releases from Regeringskansliet, party press offices
- Major outlet coverage (DN, SvD, Aftonbladet, Expressen, SR/SVT) — use public coverage only
- Actor-statement corpus from `search_anforanden`

### Output — required structure

1. **Frame inventory** — the 3–7 frames currently dominant; per frame:
   - Frame name · Carrier (which actor / outlet) · Keyword markers · Strategic function · First-use date
2. **Frame-actor matrix** — who uses which frame and with what intensity
3. **Narrative shift detection** — any frame that has gained/lost prominence in last 7 / 30 days
4. **Counter-frames** — opposition frames with their evidentiary basis
5. **Citizen-clarity score** — qualitative assessment of whether the public dialogue is tractable or obscured
6. **Frame-competition Mermaid** — color-coded by frame dominance

### Required Mermaid — frame competition

```mermaid
graph LR
    classDef gov fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    classDef opp fill:#D32F2F,stroke:#B71C1C,color:#FFFFFF
    classDef indep fill:#FFC107,stroke:#F57F17,color:#3E2723
    classDef niche fill:#7B1FA2,stroke:#4A148C,color:#FFFFFF

    F1[Government frame<br/>'fiscal responsibility'<br/>dominant]:::gov
    F2[Opposition frame<br/>'welfare erosion']:::opp
    F3[Independent-media frame<br/>'neutral fiscal'<br/>moderate]:::indep
    F4[Niche frame<br/>'constitutional concern'<br/>low prevalence]:::niche

    F1 -.contests.- F2
    F3 -.synthesises.- F1
    F3 -.synthesises.- F2
    F4 -.emergent.- F1
```

### Quality gate
- [ ] ≥3 frames identified with keyword markers
- [ ] Every frame has ≥1 carrier citation (URL, `dok_id`, anförande)
- [ ] Narrative-shift section compares 7-day and 30-day windows
- [ ] Counter-frames represented with equal analytical depth
- [ ] Neutrality: government and opposition frames receive equal coverage

---

## 🛠️ Part 6 — Implementation Feasibility (`implementation-feasibility.md`)

### Purpose
Assess whether a proposed policy can **actually be delivered** given constitutional, legal, administrative, financial, and operational constraints.

### Input
- The target `dok_id` and its implementing-agency identification
- Myndighet (government agency) capacity indicators — staffing, budget, prior delivery record
- Riksrevisionen prior audits of the same agency / policy area
- EU-law and ECHR compatibility constraints

### Output — required structure

1. **Delivery-path table** — which agency owns delivery, legal basis, budget source, first-effect date, steady-state date
2. **Feasibility scorecard** — five dimensions × 0–10 score × evidence × confidence:
   - Legal feasibility · Administrative feasibility · Financial feasibility · Political feasibility · Operational feasibility
3. **Risk register** — ≥5 delivery risks, each with likelihood × impact × mitigation
4. **Capacity gap analysis** — staffing, IT, legal, training gaps identified
5. **Historical-delivery comparison** — against a prior similar policy (e.g. RUT, ROT, A-kassa reform)
6. **Feasibility Mermaid** — color-coded scorecard bar

### Required Mermaid — feasibility scorecard

```mermaid
graph TB
    classDef high fill:#4CAF50,stroke:#1B5E20,color:#FFFFFF
    classDef med fill:#FFC107,stroke:#F57F17,color:#3E2723
    classDef low fill:#FF9800,stroke:#E65100,color:#FFFFFF
    classDef crit fill:#D32F2F,stroke:#B71C1C,color:#FFFFFF

    Legal[Legal feasibility<br/>8/10<br/>🟩 HIGH]:::high
    Admin[Administrative feasibility<br/>5/10<br/>🟧 MEDIUM]:::med
    Fin[Financial feasibility<br/>7/10<br/>🟩 HIGH]:::high
    Pol[Political feasibility<br/>4/10<br/>🟥 LOW]:::low
    Ops[Operational feasibility<br/>3/10<br/>⬛ VERY LOW<br/>bottleneck]:::crit
```

### Quality gate
- [ ] Delivery-path table identifies a specific myndighet
- [ ] Scorecard scores are evidenced, not asserted
- [ ] Risk register ≥5 rows with mitigations
- [ ] Capacity-gap analysis quantified (FTEs, SEK, or time)
- [ ] Historical-delivery comparison present with sources

---

## 🔭 Part 7 — Forward Indicators (`forward-indicators.md`)

### Purpose
Pre-register **observable indicators** whose materialisation (or non-materialisation) will confirm or refute the current intelligence picture. This file is the platform's honesty mechanism — tomorrow's reality checks today's analysis.

### Input
- synthesis-summary.md · scenario-analysis.md · intelligence-assessment.md
- Committee calendars (motionstider, utskottsmöten) from Riksdag calendar
- Known government decision points over next 7 / 30 / 90 / 180 days

### Output — required structure

1. **Indicator table** — ≥10 indicators; per row:
   - Indicator · Horizon (7d / 30d / 90d / 180d) · Observation method · Trigger threshold · Confirms/refutes hypothesis · Confidence in prediction
2. **Time-horizon Mermaid** — Gantt / timeline of expected signal dates
3. **Hypothesis-mapping table** — which indicator maps to which ACH hypothesis from `devils-advocate.md`
4. **Null-hypothesis indicators** — ≥3 indicators whose non-appearance carries signal
5. **Reliability-of-prediction note** — how well previous forward-indicators files have scored (scoring is automated across runs)

### Required Mermaid — forward timeline

```mermaid
gantt
    dateFormat YYYY-MM-DD
    title Forward indicators — next 180 days
    section 7-day
    Committee vote on prop 108 :crit, a1, 2026-04-22, 3d
    Opposition response filing  :a2, 2026-04-24, 4d
    section 30-day
    Myndighet report deadline   :b1, 2026-05-05, 7d
    Coalition meeting signal    :b2, 2026-05-10, 3d
    section 90-day
    Budget motion window open   :c1, 2026-06-15, 14d
    section 180-day
    Pre-election kickoff        :milestone, 2026-10-01, 1d
```

### Quality gate
- [ ] ≥10 indicators across all four horizons
- [ ] Every indicator has an observation method (named source)
- [ ] Observation thresholds are concrete (numeric or named event)
- [ ] Null-hypothesis indicators present
- [ ] Hypothesis mapping links back to devils-advocate.md

---

## 🛠️ Production Workflow — step-by-step

```mermaid
flowchart TD
    classDef core fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    classDef step fill:#E8F5E9,stroke:#4CAF50,color:#1B5E20
    classDef gate fill:#FFF8E1,stroke:#FFC107,color:#3E2723
    classDef out fill:#F3E5F5,stroke:#7B1FA2,color:#311B92

    TC[Family A + B complete<br/>→ produce all 7 Family D files]:::core

    E1[election-2026-analysis]:::step
    E2[voter-segmentation]:::step
    E3[coalition-mathematics]:::step
    H[historical-parallels]:::step
    MF[media-framing-analysis]:::step
    IF[implementation-feasibility]:::step
    FI[forward-indicators]:::step

    G{Quality-gate<br/>per-template}:::gate
    O[Family D complete]:::out

    TC --> E1
    TC --> E2
    TC --> E3
    TC --> H
    TC --> MF
    TC --> IF
    TC --> FI

    E1 --> G
    E2 --> G
    E3 --> G
    H --> G
    MF --> G
    IF --> G
    FI --> G
    G -->|pass| O
    G -->|fail| TC
```

---

## ✅ Family-D Completion Checklist

- [ ] All 7 Family D templates produced this run
- [ ] All 8 parties covered where applicable
- [ ] Polling, seat-math, and coalition-math use verifiable primary data
- [ ] Historical parallels have similarity scores and difference callouts (or an explicit "no-precedent" finding with reasoning)
- [ ] Media frames covered with equal depth across government/opposition
- [ ] Implementation feasibility names a delivery agency
- [ ] Forward indicators include null-hypothesis observations and ≥10 total
- [ ] All outputs use canonical color palette and 5-level confidence scale
- [ ] GDPR data-minimisation observed in voter-segmentation (no sub-1000 cohorts)

---

## 🔗 Template bindings

| Template | Methodology section |
|----------|--------------------|
| `analysis/templates/election-2026-analysis.md` | Part 1 above |
| `analysis/templates/voter-segmentation.md` | Part 2 above |
| `analysis/templates/coalition-mathematics.md` | Part 3 above |
| `analysis/templates/historical-parallels.md` | Part 4 above |
| `analysis/templates/media-framing-analysis.md` | Part 5 above |
| `analysis/templates/implementation-feasibility.md` | Part 6 above |
| `analysis/templates/forward-indicators.md` | Part 7 above |

---

## 📐 Cross-references to other methodology layers

- **Upstream:** [synthesis-methodology.md](./synthesis-methodology.md) (Family A)
- **Parallel:** [strategic-extensions-methodology.md](./strategic-extensions-methodology.md) (Family C)
- **Frameworks:** [political-swot-framework.md](./political-swot-framework.md) · [political-risk-methodology.md](./political-risk-methodology.md)
- **Style:** [political-style-guide.md](./political-style-guide.md)
- **Master protocol:** [ai-driven-analysis-guide.md](./ai-driven-analysis-guide.md)

---

## 🔐 ISMS Alignment

| Control | How this methodology satisfies it |
|---------|----------------------------------|
| ISO 27001 A.5.23 + A.5.34 | Voter-segmentation respects GDPR Art. 9 (political-opinion data) + re-identification threshold |
| ISO 27001 A.5.7 | Forward-indicators constitutes structured threat-intelligence horizon |
| NIST CSF ID.RA-6 (Risk responses) | Implementation-feasibility lists mitigations |
| NIST CSF DE.CM-8 | Forward indicators = continuous monitoring definition |
| CIS 17.3 (Policy reviews) | Historical-parallels maps prior policy cycles |
| GDPR Art. 9(2)(e)/(g) | Political-opinion data processed on public-interest basis |
| NIS2 Art. 21 | Implementation-feasibility considers resilience |

---

## 📄 Document Control

**Owner:** CEO (Intelligence Program) · **Reviewer:** CISO + Chief Analyst · **Review Cycle:** Quarterly
**Next Review:** 2026-07-21 · **Related:** [ai-driven-analysis-guide.md](./ai-driven-analysis-guide.md), [strategic-extensions-methodology.md](./strategic-extensions-methodology.md), [synthesis-methodology.md](./synthesis-methodology.md)

---

*Generated following Riksdagsmonitor Electoral & Domain Methodology v1.0 — Family D Lens-Specific Layer.*
