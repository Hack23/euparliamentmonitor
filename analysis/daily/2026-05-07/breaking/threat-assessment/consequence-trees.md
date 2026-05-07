<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Consequence Trees — EU Parliament Breaking News: 7 May 2026

**Framework:** Consequence Tree Analysis (fault tree + event tree)  
**Subject:** Potential cascading consequences from April 2026 EP legislative outputs  
**Date:** 2026-05-07  
**Confidence:** 🟡 Medium

---

## 1 · DMA Enforcement Resolution — Consequence Tree

```mermaid
flowchart TD
    ROOT["EP DMA Enforcement Resolution\n(TA-10-2026-0160, 30 April)"]
    
    ROOT --> A["Commission acts on EP pressure"]
    ROOT --> B["Commission delays enforcement"]
    
    A --> A1["Formal investigation + fine Q3 2026"]
    A --> A2["Structural remedy investigation Q4 2026"]
    
    A1 --> A1a["Gatekeeper accepts + compliance\n→ DMA success model"]
    A1 --> A1b["Gatekeeper files CJEU interim measures\n→ 12-24 month delay"]
    
    A1b --> A1b1["CJEU grants interim measures\n→ Commission enforcement embarrassment"]
    A1b --> A1b2["CJEU denies interim measures\n→ Enforcement proceeds"]
    
    A2 --> A2a["Structural remedy imposed\n→ Digital market restructuring"]
    A2 --> A2b["Structural remedy challenged\n→ US diplomatic escalation"]
    
    B --> B1["EP escalates: IMCO committee scrutiny"]
    B --> B2["EP tables follow-up resolution (H2 2026)"]
    B --> B3["US trade pressure 'rewarded'\n→ DMA credibility damage"]
```

---

## 2 · Ukraine Accountability — Consequence Tree

```mermaid
flowchart TD
    ROOT2["Ukraine Accountability Resolution\n(TA-10-2026-0161, 30 April)"]
    
    ROOT2 --> C["Special Tribunal negotiation proceeds"]
    ROOT2 --> D["Geopolitical obstacle blocks tribunal"]
    
    C --> C1["UN General Assembly resolution (support majority)"]
    C --> C2["Council of Europe Enlarged Agreement"]
    
    C1 --> C1a["Tribunal established by 2027-2028"]
    C1 --> C1b["Russia veto at UNSC blocks momentum"]
    
    C1a --> C1a1["First prosecutions 2029-2030\n→ International law precedent"]
    
    D --> D1["Ukraine ceasefire with amnesty provisions\n→ accountability track frozen"]
    D --> D2["US withdrawal from accountability coalition\n→ EP isolated"]
    
    D1 --> D1a["EP forced into damage limitation\n→ political cost to accountability advocates"]
```

---

## 3 · Budget Guidelines — Consequence Tree

```mermaid
flowchart TD
    ROOT3["2027 Budget Guidelines\n(TA-10-2026-0112, 28 April)"]
    
    ROOT3 --> E["Council accepts EP priorities"]
    ROOT3 --> F["Council rejects key EP priorities"]
    
    E --> E1["Budget adopted Dec 2026\n→ EU programmes start on time"]
    
    F --> F1["Conciliation Committee convened Nov 2026"]
    F1 --> F1a["Agreement in 21-day window\n→ Late budget (Jan 2027)"]
    F1 --> F1b["Conciliation fails\n→ Provisional twelfths (first since 1988)"]
    
    F1b --> F1b1["Programme disbursement delays\n→ Member state political crisis"]
    F1b --> F1b2["New negotiations under time pressure\n→ EP leverage maximum, Council under fire"]
```

---

## 4 · PfE Commission Challenge — Consequence Tree

```mermaid
flowchart TD
    ROOT4["PfE Rule 169 Debate\n(29 April)"]
    
    ROOT4 --> G["Debate contained (current trajectory)"]
    ROOT4 --> H["External event triggers escalation"]
    
    G --> G1["Media cycle ends, no institutional consequence\n→ PfE tries next mechanism in 2-3 months"]
    
    H --> H1["Commission scandal or legal exposure"]
    H --> H2["Von der Leyen political misstep"]
    
    H1 --> H1a["PfE files motion of censure"]
    H2 --> H2a["PfE files motion of censure"]
    
    H1a --> H1a1["Motion fails (~161 for vs 558 against)\n→ PfE demonstrates limits of strategy"]
    H2a --> H2a1["ECR partially co-signs\n→ Higher vote count, still fails\n→ Institutional damage to Commission"]
```

---

## 5 · Consequence Severity Matrix

| Event | Probability | Severity | Expected Value |
|-------|-------------|----------|---------------|
| Gatekeeper CJEU interim measures | 25% | High | 0.25 × 4 = 1.0 |
| Ukraine accountability track frozen by ceasefire | 20% | Very High | 0.20 × 5 = 1.0 |
| Budget provisional twelfths | 7% | Very High | 0.07 × 5 = 0.35 |
| PfE motion of censure filed | 15% | Moderate | 0.15 × 3 = 0.45 |
| Armenia military escalation | 8% | High | 0.08 × 4 = 0.32 |
| DMA enforcement success (positive consequence) | 45% | High | 0.45 × 4 = 1.8 |

**Highest expected value events:** DMA enforcement success (positive) and Ukraine accountability/DMA judicial challenge (negative) are the most consequential probable scenarios.

---

*Methodology: Fault tree analysis (IEC 61025); event tree analysis (probabilistic safety assessment); consequence trees based on actor-mapping.md and scenario-forecast.md.*

---

## Threat Roster

| Threat | Type | Initiator | Probability | Consequence Severity |
|--------|------|-----------|------------|---------------------|
| DMA enforcement blocked | Regulatory | US Government + Big Tech | Medium | High |
| Ukraine accountability stalled | Diplomatic | Russia | Medium | High |
| Budget failure | Institutional | EP-Council deadlock | Low | Very High |
| PfE institutional disruption | Political | PfE/ECR | Low | Low |
| CJEU DMA suspension | Legal | Big Tech | Low-Medium | High |

---

## Convergence

Where multiple threat vectors converge to amplify consequences:

**Convergence Point 1: DMA + Trade War**
If US government escalates DMA pressure to formal trade threat AND Big Tech files CJEU interim measures simultaneously, the Commission faces a two-front challenge: political pressure from the US and legal freezing from the courts. The convergence makes enforcement significantly harder.

**Convergence Point 2: Ukraine accountability + Ceasefire ambiguity**
If a US-Russia ceasefire is proposed that does not include clear accountability provisions, AND Russia's disinformation campaign successfully frames the tribunal as a "peace obstacle," the political space for accountability mechanisms narrows dramatically. Member states that prefer a quick peace over accountability could use this framing.

**Convergence Point 3: Budget + Defence spending**
If EP-Council budget conciliation fails AND NATO allies are demanding increased EU defence spending simultaneously, the pressure to cut cohesion spending to fund defence creates a political crisis within the centrist coalition (left wing of S&D would resist).

---

## Intervention

**Optimal intervention points to break consequence chains:**

| Threat | Intervention Point | Actor | Intervention Type |
|--------|-------------------|-------|------------------|
| DMA blocked | Commission formal investigation launch (Q2 2026) | Commission | Proceed on schedule; don't delay |
| Ukraine accountability stalled | Council of Europe Enlarged Agreement (July 2026) | EU member states | Sign agreement; provide technical support |
| Budget failure | Conciliation committee composition (October 2026) | EP + Council | Nominate experienced negotiators; pre-negotiate red lines |
| CJEU DMA freeze | Legal defense preparation (ongoing) | Commission lawyers | Prepare strong CJEU defense; monitor filing deadlines |

---

## Reader Briefing

**For citizens:** Consequence trees show what happens downstream if a threat materialises.

The most important consequence tree for ordinary citizens is the DMA one: if the US successfully pressures the Commission to slow DMA enforcement, you continue to pay app store commissions at current rates (15-30%), and the promise of cheaper apps and more interoperability is delayed by years.

The Ukraine accountability tree matters for citizens who care about international law precedent: if Russia successfully blocks the tribunal, it signals to future aggressors that invasions carry no legal accountability consequences.

```mermaid
graph TD
    DMA_THREAT["US DMA Pressure\n+ CJEU Challenge"]
    DMA_DELAY["Commission delays\nenforcement"]
    APP_PRICES["App prices stay high\nInteroperability blocked"]
    PREC["DMA enforcement\ncredibility damaged"]

    UA_THREAT["Russia blocking\n+ Ceasefire ambiguity"]
    UA_STALL["Tribunal establishment\ndelayed"]
    IMPUNITY["Impunity precedent\nfor aggression"]

    DMA_THREAT --> DMA_DELAY --> APP_PRICES & PREC
    UA_THREAT --> UA_STALL --> IMPUNITY
```

*Consequence trees v2.0 | Run: breaking-run-1778159307*
