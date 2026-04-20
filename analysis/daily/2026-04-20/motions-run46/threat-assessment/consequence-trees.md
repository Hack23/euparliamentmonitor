<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Consequence Tree Analysis — EP10 Q1 2026 Key Decision Nodes

## Executive Summary

This document applies consequence tree methodology to four critical decision nodes emerging from Q1 2026 EP10 legislative activity. Each decision node represents a binary or multi-path choice point where institutional action (or inaction) cascades into divergent political, economic, and institutional outcomes. Probability assignments are derived from historical precedent analysis, current political dynamics assessment, and structural constraint evaluation.

**Analytical framework:** 3-level deep consequence branching with probability assignments at each node, calibrated against 567 roll-call votes and 104 adopted texts from Q1 2026.

---

## Decision Node 1: US Tariff Countermeasures Deployment (TA-0096)

### Context

EP adopted TA-0096 mandating Commission preparation of countermeasure instruments against US Section 301/232 tariffs. The decision node occurs when the Commission must choose deployment timing and scope following confirmed US tariff escalation in Q2 2026.

```mermaid
graph TD
    DN1["DECISION NODE<br/>Deploy EU Countermeasures?<br/>Q2 2026"]

    DN1 -->|"P=0.45"| A1["IMMEDIATE DEPLOYMENT<br/>Full retaliation package<br/>within 30 days"]
    DN1 -->|"P=0.35"| A2["GRADUATED RESPONSE<br/>Partial measures +<br/>negotiation window"]
    DN1 -->|"P=0.15"| A3["DELAY/DEFER<br/>Pursue bilateral<br/>negotiations first"]
    DN1 -->|"P=0.05"| A4["CAPITULATION<br/>Withdraw countermeasure<br/>threat entirely"]

    A1 -->|"P=0.60"| B1["US ESCALATION<br/>Additional tariff rounds<br/>targeting services"]
    A1 -->|"P=0.30"| B2["STALEMATE<br/>Mutual tariffs persist<br/>WTO proceedings"]
    A1 -->|"P=0.10"| B3["US DE-ESCALATION<br/>Tariff rollback<br/>within 6 months"]

    A2 -->|"P=0.50"| B4["NEGOTIATION SUCCESS<br/>Managed trade agreement<br/>partial rollback"]
    A2 -->|"P=0.30"| B5["ESCALATION ANYWAY<br/>US views gradualism<br/>as weakness"]
    A2 -->|"P=0.20"| B6["INTERNAL FRACTURE<br/>Member states pursue<br/>bilateral deals"]

    A3 -->|"P=0.40"| B7["CREDIBILITY LOSS<br/>EP authority undermined<br/>Commission independence questioned"]
    A3 -->|"P=0.35"| B8["DIPLOMATIC SOLUTION<br/>US-EU summit produces<br/>framework agreement"]
    A3 -->|"P=0.25"| B9["PROLONGED UNCERTAINTY<br/>Business investment<br/>freezes for 12+ months"]

    B1 -->|"P=0.55"| C1["TRADE WAR<br/>GDP impact -0.8-1.2%<br/>2027 recession risk"]
    B1 -->|"P=0.45"| C2["ALLIED COALITION<br/>Japan/Korea/UK join EU<br/>multilateral pressure"]

    B4 -->|"P=0.65"| C3["MANAGED DECOUPLING<br/>Sectoral agreements<br/>strategic autonomy advance"]
    B4 -->|"P=0.35"| C4["TEMPORARY FIX<br/>Agreement collapses<br/>within 18 months"]

    B7 -->|"P=0.70"| C5["INSTITUTIONAL DAMAGE<br/>EP legislative relevance<br/>diminished for term"]
    B7 -->|"P=0.30"| C6["COURSE CORRECTION<br/>Commission forced to act<br/>by member state pressure"]

    style DN1 fill:#e03131,color:#fff
    style C1 fill:#ff6b6b,color:#fff
    style C3 fill:#51cf66,color:#fff
    style C5 fill:#ff6b6b,color:#fff
```

### Probability-Weighted Impact Assessment

| Scenario Path | Cumulative Probability | GDP Impact | Institutional Impact |
|---------------|----------------------|-----------|---------------------|
| Immediate → Escalation → Trade War | 0.45 × 0.60 × 0.55 = **14.9%** | -0.8 to -1.2% | HIGH — crisis governance activation |
| Immediate → Escalation → Allied Coalition | 0.45 × 0.60 × 0.45 = **12.2%** | -0.3 to -0.5% | POSITIVE — strategic autonomy validated |
| Graduated → Negotiation → Managed Decoupling | 0.35 × 0.50 × 0.65 = **11.4%** | -0.1 to -0.3% | MODERATE — pragmatic outcome |
| Delay → Credibility Loss → Institutional Damage | 0.15 × 0.40 × 0.70 = **4.2%** | -0.2% | CRITICAL — EP legitimacy crisis |

**Most likely outcome (26.3% combined):** Graduated response followed by either successful negotiation or escalation, resulting in managed trade friction with -0.2 to -0.5% GDP impact and preserved but tested institutional credibility.

---

## Decision Node 2: Enlargement Accession Chapter Opening (TA-0077)

### Context

TA-0077 established EP position supporting opening of accession negotiation chapters for Ukraine and Moldova. The decision node occurs at the European Council where unanimity is required, with Hungary's confirmed opposition creating a structural veto threat.

```mermaid
graph TD
    DN2["DECISION NODE<br/>Open Accession Chapters?<br/>June 2026 European Council"]

    DN2 -->|"P=0.30"| E1["FULL OPENING<br/>All requested chapters<br/>opened simultaneously"]
    DN2 -->|"P=0.40"| E2["PARTIAL OPENING<br/>2-3 technical chapters<br/>political deferred"]
    DN2 -->|"P=0.20"| E3["DELAYED<br/>Postponed to<br/>December 2026"]
    DN2 -->|"P=0.10"| E4["BLOCKED<br/>Hungarian veto<br/>no chapters opened"]

    E1 -->|"P=0.40"| F1["ACCELERATED INTEGRATION<br/>Ukraine reforms<br/>momentum sustained"]
    E1 -->|"P=0.35"| F2["ABSORPTION STRAIN<br/>EU institutional capacity<br/>stressed"]
    E1 -->|"P=0.25"| F3["BACKLASH<br/>Populist parties gain<br/>on anti-enlargement"]

    E2 -->|"P=0.55"| F4["INCREMENTAL PROGRESS<br/>Build political consensus<br/>for further chapters"]
    E2 -->|"P=0.25"| F5["FRUSTRATION<br/>Ukraine perceives<br/>insufficient commitment"]
    E2 -->|"P=0.20"| F6["PRECEDENT SET<br/>Graduated approach<br/>becomes template"]

    E3 -->|"P=0.45"| F7["GEOPOLITICAL RISK<br/>Russia exploits delay<br/>narrative of EU weakness"]
    E3 -->|"P=0.30"| F8["DIPLOMATIC RESET<br/>New conditions package<br/>Hungary accommodation"]
    E3 -->|"P=0.25"| F9["REFORM FATIGUE<br/>Ukraine reform momentum<br/>diminishes"]

    E4 -->|"P=0.50"| F10["CONSTITUTIONAL MOMENT<br/>Reform of unanimity<br/>rule gains urgency"]
    E4 -->|"P=0.30"| F11["BILATERAL WORKAROUND<br/>Individual state agreements<br/>outside EU framework"]
    E4 -->|"P=0.20"| F12["STRATEGIC FAILURE<br/>Enlargement policy<br/>abandoned de facto"]

    F1 -->|"P=0.60"| G1["2030 ACCESSION TARGET<br/>Realistic timeline<br/>institutional preparation"]
    F1 -->|"P=0.40"| G2["OVERCOMMITMENT<br/>Resources diverted from<br/>existing programmes"]

    F4 -->|"P=0.70"| G3["SUSTAINABLE PACE<br/>Broad political buy-in<br/>for gradual expansion"]
    F4 -->|"P=0.30"| G4["STAGNATION RISK<br/>Incrementalism becomes<br/>permanent postponement"]

    F10 -->|"P=0.55"| G5["TREATY CHANGE DEBATE<br/>2029 IGC momentum<br/>qualified majority push"]
    F10 -->|"P=0.45"| G6["INSTITUTIONAL PARALYSIS<br/>Veto preserved<br/>reform blocked"]

    style DN2 fill:#1971c2,color:#fff
    style G1 fill:#51cf66,color:#fff
    style G3 fill:#51cf66,color:#fff
    style G5 fill:#fcc419,color:#000
    style G6 fill:#ff6b6b,color:#fff
```

### Probability-Weighted Impact Assessment

| Scenario Path | Cumulative Probability | Geopolitical Impact | Institutional Impact |
|---------------|----------------------|--------------------|--------------------|
| Partial → Incremental → Sustainable | 0.40 × 0.55 × 0.70 = **15.4%** | POSITIVE — credible process | MODERATE — managed expectations |
| Full → Accelerated → 2030 Target | 0.30 × 0.40 × 0.60 = **7.2%** | VERY POSITIVE — strategic win | HIGH — institutional adaptation required |
| Delayed → Geopolitical Risk | 0.20 × 0.45 = **9.0%** | NEGATIVE — credibility gap | MODERATE — demonstrates institutional weakness |
| Blocked → Constitutional Moment → Treaty Change | 0.10 × 0.50 × 0.55 = **2.8%** | MIXED — short-term loss, long-term gain | TRANSFORMATIVE — if reform succeeds |

**Most likely outcome (15.4%):** Partial chapter opening followed by incremental progress, achieving sustainable pace with broad political consensus. This represents the EU's institutional preference for gradualism under constraint.

---

## Decision Node 3: Housing Action Plan Commission Response (TA-0064)

### Context

TA-0064 called on the Commission to develop a comprehensive EU Housing Action Plan addressing affordability, social housing investment, and short-term rental regulation. The decision node occurs when the Commission determines response scope, given housing policy's traditionally national competence character.

```mermaid
graph TD
    DN3["DECISION NODE<br/>Commission Housing<br/>Action Plan Scope<br/>Q3 2026"]

    DN3 -->|"P=0.25"| H1["AMBITIOUS PLAN<br/>Legislative proposals +<br/>EU funding instrument"]
    DN3 -->|"P=0.45"| H2["MODERATE PLAN<br/>Recommendation + existing<br/>fund reorientation"]
    DN3 -->|"P=0.25"| H3["MINIMAL RESPONSE<br/>Communication only<br/>no binding elements"]
    DN3 -->|"P=0.05"| H4["REJECTION<br/>Subsidiarity argument<br/>no action"]

    H1 -->|"P=0.30"| I1["SUBSIDIARITY CHALLENGE<br/>5+ member states<br/>invoke Protocol 2"]
    H1 -->|"P=0.40"| I2["PARTIAL IMPLEMENTATION<br/>Fund accepted, legislation<br/>watered down in Council"]
    H1 -->|"P=0.30"| I3["TRANSFORMATIVE OUTCOME<br/>EU housing policy<br/>paradigm shift"]

    H2 -->|"P=0.50"| I4["SOFT LAW IMPACT<br/>Best practice exchange<br/>modest harmonization"]
    H2 -->|"P=0.30"| I5["INSUFFICIENT<br/>EP demands further<br/>action; credibility gap"]
    H2 -->|"P=0.20"| I6["FUND LEVERAGE<br/>Cohesion fund conditionality<br/>drives national reform"]

    H3 -->|"P=0.45"| I7["EP FRUSTRATION<br/>Inter-institutional<br/>conflict escalation"]
    H3 -->|"P=0.35"| I8["DOMESTIC OWNERSHIP<br/>Member states develop<br/>own solutions"]
    H3 -->|"P=0.20"| I9["POLITICAL COST<br/>S&D/Greens challenge<br/>VDL2 mandate delivery"]

    I1 -->|"P=0.60"| J1["CJEU REFERRAL<br/>Competence boundaries<br/>clarified in 2028"]
    I1 -->|"P=0.40"| J2["POLITICAL COMPROMISE<br/>Scope reduction secures<br/>legal certainty"]

    I3 -->|"P=0.50"| J3["POLICY INNOVATION<br/>EU becomes housing<br/>policy actor"]
    I3 -->|"P=0.50"| J4["IMPLEMENTATION GAP<br/>Ambitious law poorly<br/>transposed nationally"]

    I7 -->|"P=0.55"| J5["GOVERNANCE CRISIS<br/>EP uses budget/discharge<br/>as leverage"]
    I7 -->|"P=0.45"| J6["MANAGED DISAPPOINTMENT<br/>Issue returns next term"]

    style DN3 fill:#2f9e44,color:#fff
    style J3 fill:#51cf66,color:#fff
    style J5 fill:#ff6b6b,color:#fff
    style J1 fill:#fcc419,color:#000
```

### Probability-Weighted Impact Assessment

| Scenario Path | Cumulative Probability | Social Impact | Institutional Impact |
|---------------|----------------------|--------------|---------------------|
| Moderate → Soft Law Impact | 0.45 × 0.50 = **22.5%** | LOW-MODERATE — incremental improvement | LOW — status quo preserved |
| Moderate → Fund Leverage | 0.45 × 0.20 = **9.0%** | MODERATE — indirect reform pressure | MODERATE — innovative governance tool |
| Ambitious → Partial Implementation | 0.25 × 0.40 = **10.0%** | MODERATE — visible EU action | MODERATE — demonstrates ambition-delivery gap |
| Ambitious → Subsidiarity Challenge → CJEU | 0.25 × 0.30 × 0.60 = **4.5%** | DELAYED — 2+ year legal uncertainty | HIGH — competence boundaries redefined |
| Minimal → EP Frustration → Governance Crisis | 0.25 × 0.45 × 0.55 = **6.2%** | NEGATIVE — citizen expectations unmet | HIGH — inter-institutional conflict |

**Most likely outcome (22.5%):** Moderate Commission response producing soft law impact through best practice exchange and modest harmonization. This reflects institutional caution on competence boundaries but delivers below EP ambition level.

---

## Decision Node 4: SRMR3 Banking Union Transposition (TA-0092)

### Context

TA-0092 represents the third revision of the Single Resolution Mechanism Regulation, expanding the scope of resolution tools and burden-sharing arrangements. The decision node occurs during member state transposition/implementation, where national banking authorities must operationalize expanded resolution powers.

```mermaid
graph TD
    DN4["DECISION NODE<br/>SRMR3 National<br/>Transposition Approach<br/>Q3 2026 - Q2 2027"]

    DN4 -->|"P=0.35"| K1["FULL COMPLIANCE<br/>All member states<br/>transpose on schedule"]
    DN4 -->|"P=0.40"| K2["PARTIAL COMPLIANCE<br/>5-8 states delayed<br/>technical challenges cited"]
    DN4 -->|"P=0.20"| K3["SELECTIVE RESISTANCE<br/>2-3 states challenge<br/>burden-sharing provisions"]
    DN4 -->|"P=0.05"| K4["SYSTEMIC REJECTION<br/>Banking lobby captures<br/>national transposition"]

    K1 -->|"P=0.55"| L1["BANKING UNION<br/>COMPLETION<br/>EDIS path opens"]
    K1 -->|"P=0.30"| L2["MARKET CONFIDENCE<br/>Bank CDS spreads<br/>compress 15-25bps"]
    K1 -->|"P=0.15"| L3["MORAL HAZARD<br/>Banks increase risk<br/>knowing resolution exists"]

    K2 -->|"P=0.50"| L4["INFRINGEMENT<br/>PROCEEDINGS<br/>Commission enforcement"]
    K2 -->|"P=0.30"| L5["REGULATORY FRAGMENTATION<br/>Two-speed banking union<br/>emerges"]
    K2 -->|"P=0.20"| L6["EXTENDED DEADLINE<br/>Delegated act provides<br/>flexibility"]

    K3 -->|"P=0.45"| L7["CONSTITUTIONAL<br/>CHALLENGE<br/>Budgetary sovereignty claims"]
    K3 -->|"P=0.35"| L8["POLITICAL NEGOTIATION<br/>Side-letters/derogations<br/>secure compliance"]
    K3 -->|"P=0.20"| L9["MARKET REACTION<br/>Sovereign spreads widen<br/>in resisting states"]

    L1 -->|"P=0.40"| M1["EDIS PROPOSAL 2027<br/>Deposit insurance<br/>completing third pillar"]
    L1 -->|"P=0.60"| M2["CAUTIOUS ADVANCE<br/>EDIS deferred to<br/>2028-2029 mandate"]

    L4 -->|"P=0.65"| M3["COMPLIANCE WITHIN<br/>18 MONTHS<br/>Standard EU enforcement"]
    L4 -->|"P=0.35"| M4["PROLONGED NON-COMPLIANCE<br/>Financial stability<br/>risk accumulates"]

    L7 -->|"P=0.50"| M5["CJEU RULING<br/>Competence confirmed<br/>2028"]
    L7 -->|"P=0.50"| M6["COMPROMISE<br/>Modified burden-sharing<br/>formula"]

    style DN4 fill:#7048e8,color:#fff
    style M1 fill:#51cf66,color:#fff
    style M4 fill:#ff6b6b,color:#fff
    style L9 fill:#ffa94d,color:#fff
```

### Probability-Weighted Impact Assessment

| Scenario Path | Cumulative Probability | Financial Stability Impact | Institutional Impact |
|---------------|----------------------|---------------------------|---------------------|
| Full Compliance → Banking Union Completion → EDIS | 0.35 × 0.55 × 0.40 = **7.7%** | VERY POSITIVE — systemic risk reduction | TRANSFORMATIVE — third pillar achieved |
| Full Compliance → Banking Union Completion → Cautious | 0.35 × 0.55 × 0.60 = **11.6%** | POSITIVE — framework strengthened | MODERATE — incremental progress |
| Partial → Infringement → Compliance | 0.40 × 0.50 × 0.65 = **13.0%** | MODERATE — delayed but achieved | LOW — standard enforcement cycle |
| Selective Resistance → Constitutional → CJEU | 0.20 × 0.45 × 0.50 = **4.5%** | NEGATIVE — uncertainty period | HIGH — fundamental questions reopened |
| Partial → Fragmentation | 0.40 × 0.30 = **12.0%** | NEGATIVE — two-speed risk | HIGH — undermines single market integrity |

**Most likely outcome (13.0%):** Partial initial compliance followed by infringement proceedings leading to eventual compliance within 18 months. This reflects the standard EU enforcement dynamic where political resistance eventually yields to legal pressure, but with meaningful delays.

---

## Cross-Decision Node Interaction Matrix

```mermaid
graph LR
    subgraph Decision Nodes
        DN1["US Tariffs<br/>TA-0096"]
        DN2["Enlargement<br/>TA-0077"]
        DN3["Housing<br/>TA-0064"]
        DN4["SRMR3<br/>TA-0092"]
    end

    subgraph Interaction Effects
        IE1["Trade-Finance<br/>Nexus"]
        IE2["Sovereignty<br/>Nexus"]
        IE3["Resource<br/>Competition"]
    end

    DN1 -->|"Market stress<br/>amplifies"| IE1
    DN4 -->|"Banking stability<br/>affects"| IE1
    DN2 -->|"Sovereignty<br/>concerns feed"| IE2
    DN3 -->|"Competence<br/>debate feeds"| IE2
    DN1 -->|"GDP impact<br/>constrains"| IE3
    DN2 -->|"Budget needs<br/>compete"| IE3
    DN3 -->|"Funding<br/>demands"| IE3
    DN4 -->|"Capital<br/>requirements"| IE3

    IE1 -->|"Combined P=0.18"| NEG1["Financial System<br/>Stress Scenario"]
    IE2 -->|"Combined P=0.22"| NEG2["Sovereignty<br/>Backlash Wave"]
    IE3 -->|"Combined P=0.31"| NEG3["Fiscal Capacity<br/>Exhaustion"]

    style NEG1 fill:#ff6b6b,color:#fff
    style NEG2 fill:#ffa94d,color:#fff
    style NEG3 fill:#fcc419,color:#000
```

## Aggregate Risk Assessment

| Combined Scenario | Joint Probability | Systemic Impact | Recovery Timeline |
|-------------------|-------------------|-----------------|-------------------|
| Trade war + Banking fragmentation | 14.9% × 12.0% = **1.8%** | SYSTEMIC — 2008-style risk | 24-36 months |
| Enlargement blocked + Housing rejected | 10.0% × 6.2% = **0.6%** | INSTITUTIONAL — legitimacy crisis | 12-18 months |
| All four adverse outcomes simultaneously | <0.1% | CATASTROPHIC — EU governance failure | 36+ months |
| All four positive outcomes simultaneously | ~1.2% | TRANSFORMATIVE — integration leap | N/A (sustained benefit) |

**Central forecast:** Mixed outcomes across decision nodes, with 65-70% probability of at least one major adverse development and 85-90% probability of at least one positive outcome. The EU institutional framework's resilience is tested but not broken in the modal scenario.

---

*Assessment prepared: 2026-04-20 | Methodology: Multi-level consequence tree with Bayesian probability assignment*
*Data sources: EP Open Data Portal, ECB Financial Stability Review, Council voting records*
