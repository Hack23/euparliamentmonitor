<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Consequence Trees — EU Parliament Motions · 2026-05-15

**Framework:** Decision Tree / Consequence Analysis
**Coverage:** Primary and secondary consequences of April 2026 motions

---

## 1. DMA Enforcement — Consequence Tree

```mermaid
flowchart TD
    START["EP DMA Enforcement Motion\nAdopted 449-178-28"] -->|Commission response| DECISION1{"Commission\nenforcement posture"}
    DECISION1 -->|"Accelerates (60%)"| ACC["DMA enforcement\nacceleration"]
    DECISION1 -->|"Delays (40%)"| DELAY["DMA enforcement\ndelay"]
    
    ACC -->|"Apple challenge"| CJEU{"CJEU review"}
    ACC -->|"No challenge"| FINE["DMA fine issued\n(€5-20B range)"]
    CJEU -->|"CJEU upholds (65%)"| FINE
    CJEU -->|"CJEU annuls (35%)"| PARTIAL["Partial enforcement\nreduced scope"]
    
    FINE -->|"Global signal"| GLOBAL_REG["Global regulatory\ntemplating (UK, Australia, Japan)"]
    FINE -->|"US reaction"| US_TARIFF{"US trade\nretaliation?"}
    US_TARIFF -->|"Yes (30%)"| TRADE_WAR["EU-US tech\ntrade dispute"]
    US_TARIFF -->|"No (70%)"| STABLE["DMA-trade\nequilibrium"]
    
    DELAY -->|"EP escalates"| EP_ESCALATE["EP accountability hearing\n(Commissioner)"]
    EP_ESCALATE -->|"Political pressure produces\nenforcement commitment"| ACC
    EP_ESCALATE -->|"Commission resists"| REPUTATIONAL["EP-Commission\nrelationship deterioration"]
```

### Secondary Consequences (DMA)
- **If DMA enforcement succeeds and CJEU upholds**: App store market opens to competitors; EU developer ecosystem gains; EU SME investment in digital services increases; global regulatory tipping point established
- **If DMA enforcement delayed**: EP10's "Digital Sovereignty" narrative weakens; Renew's trade-concern wing vindicated; EP's enforcement mandate credibility eroded for future dossiers
- **If US trade retaliation**: EU-US trade framework negotiation accelerated under duress; EU car industry, agriculture lobby mobilise to pressure Commission for DMA "truce"; German government (automotive) breaks with EP majority narrative

---

## 2. Ukraine Tribunal — Consequence Tree

```mermaid
flowchart TD
    START2["EP Ukraine Tribunal Motion\n~490 votes"] -->|Council action| COUNCIL{"Council\naction?"}
    COUNCIL -->|"Poland circulates draft\n(60%)"| DRAFT["Draft Regulation\nin Council (June 2026)"]
    COUNCIL -->|"No draft before Denmark\n(40%)"| DELAY2["Deferred to\nDenmark Presidency (July+)"]
    
    DRAFT -->|"Hungary veto"| STALL{"Instrument\nstalled"}
    DRAFT -->|"Hungary concession"| ADOPT["Tribunal Regulation\nadopted — RARE"]
    
    STALL -->|"Legal workaround found"| QMV["QMV-based\nalternative mechanism"]
    STALL -->|"No workaround"| INDEF_BLOCK["Indefinite Council\nblocking"]
    
    QMV -->|"CJEU challenge by Hungary"| QMV_RISK["Legal uncertainty\n(1-3 years)"]
    QMV -->|"No challenge"| TRIBUNAL_EST["Tribunal\nestablished (2027+)"]
    
    INDEF_BLOCK -->|"Bilateral track (EU + allies)"| ALLIED["Allied-country tribunal\noutside EU framework"]
    INDEF_BLOCK -->|"ICC alternative"| ICC_TRACK["ICC aggression\ncase strengthened"]
```

### Secondary Consequences (Ukraine Tribunal)
- **If Tribunal established**: Historic precedent for EU criminal justice institution; Russia-Ukraine peace settlement must accommodate it; accountability norm strengthened globally
- **If indefinitely blocked**: Hungary's veto power demonstrated to have no cost — strategic encouragement of veto politics; EP accountability motions lose deterrent value; ICC becomes the de facto only pathway

---

## 3. Armenia Candidacy — Consequence Tree

```mermaid
flowchart TD
    START3["EP Armenia Candidacy Motion\n~480 votes"] -->|Commission review| COMM_REV{"Commission\ncandidacy decision"}
    COMM_REV -->|"Potential candidate (6-9 months)"| CAND["Armenia: EU potential\ncandidate status"]
    COMM_REV -->|"Deferred (25%)"| DEFER["Deferred pending\npolitical assessment"]
    
    CAND -->|"Association Agreement\nnegotiation"| ASSOC{"Council\nmandate for Agreement"}
    ASSOC -->|"Hungary veto on mandate"| PARTIAL_ASSOC["Sub-unanimity bilateral\npartnership deepening"]
    ASSOC -->|"QMV on trade/partnership\ncomponents"| ASSOC_PROG["Association Agreement\nnegotiations open"]
    
    PARTIAL_ASSOC -->|"Georgia model: bilateral first"| PRECEDENT["South Caucasus\nintegration model established"]
    ASSOC_PROG -->|"Negotiations complete (2028+)"| SIGNATURE["Association Agreement\nsigned (2028-2030)"]
```

---

## 4. Reader Briefing

The consequence tree analysis reveals that the April 2026 motions cluster creates three structurally independent consequence pathways that share one common bottleneck: the Hungary Council veto. The DMA pathway bypasses this bottleneck entirely (Commission-only enforcement) and has the most credible immediate consequence trajectory. The Ukraine Tribunal and Armenia pathways both hit the Hungary veto as their critical decision node, and the most important analytical question is which workaround mechanism (QMV architecture, bilateral track, allied-country tribunal) is both legally viable and politically available.

Readers should track three specific indicators in the next 90 days:
1. Commission response to DMA accountability motion (July 2026 deadline)
2. Polish Presidency's Council progress on Ukraine Tribunal before June 30, 2026
3. Commission "potential candidate" decision for Armenia (Q3/Q4 2026)

These three indicators will determine whether the April 2026 session's consequence trees follow the optimistic or pessimistic branch at each decision node.

**sourceDiversity**: Consequence tree probabilities from: scenario-forecast.md (this analysis set); forces-analysis.md; risk-matrix.md; actor-threat-profiles.md; TFEU legal framework analysis; CJEU DMA case history; Poland Council Presidency official programme; Commission DG NEAR Armenia reports (public).
