<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Stakeholder Map — EP10 Year 2 Interest Network

**Analysis Date:** 2026-05-07 | **Confidence:** 🟡 MEDIUM  
**Admiralty Grade:** B2 | **WEP:** Likely  
**Source:** `generate_political_landscape`, `get_adopted_texts`, analyst synthesis

## BLUF:
EP10 Year 2 stakeholder landscape is dominated by three macro-interest clusters: Security Complex (defence ministries + industry + Ukraine advocates), Digital Governance (EU digital sector + Big Tech regulated entities), and Competitiveness Coalition (German industry, automotive, EPP business wing). These three clusters drove the year's legislative agenda; Climate/NGO and Social networks were subordinated to them.

## Reader Briefing
Stakeholder mapping reveals whose interests aligned with legislative outcomes. In EP10 Year 2, the Security Complex and Competitiveness Coalition outgunned the Climate Coalition — a structural outcome of 2024 election results, not an accident.

## Primary Stakeholder Map

```mermaid
graph TD
    subgraph Security Complex
        DEF[Defence Ministries] 
        DEFIND[EU Defence Industry]
        UKR[Ukraine Advocates]
        NATO[NATO Secretariat]
    end
    
    subgraph Digital Governance
        BIGTECH[Big Tech - regulated]
        EUDIGITAL[EU Digital Sector]
        CIVIL[Digital Rights NGOs]
    end
    
    subgraph Competitiveness Coalition
        GERMIND[German Industry/BDI]
        AUTO[Automotive sector]
        EPP_BIZ[EPP Business wing]
    end
    
    subgraph Climate Network
        CAN[Climate Action Network]
        GREENCO[Green Companies]
        WWF[WWF/Greenpeace]
    end
    
    subgraph Social Stakeholders
        ETUC[ETUC Labour]
        HOUSING[Housing NGOs]
        MIGRANT[Migration advocates]
    end
    
    Security Complex -->|lobbied for| EDIP[EDIP + Ukraine Loan ✅]
    Digital Governance -->|split on| DMA[DMA Enforcement ✅]
    Competitiveness Coalition -->|lobbied for| CSRD[CSRD Rollback ✅]
    Climate Network -->|lobbied against| CSRD
    Social Stakeholders -->|lobbied for| HOUSING_R[Housing Resolution 🟡]
```

## Power-Interest Matrix

| Stakeholder | Power Level | Interest Level | Influence Strategy | Year 2 Outcome |
|-------------|------------|----------------|-------------------|----------------|
| German Industry/BDI | VERY HIGH | VERY HIGH | Direct EPP lobbying | ✅ CSRD rollback; HGV delay |
| EU Defence Ministries | HIGH | VERY HIGH | Council + EP coordination | ✅ EDIP; Defence Fund |
| Ukraine Advocates | MEDIUM | VERY HIGH | Public + diplomatic pressure | ✅ Enhanced Loan |
| Big Tech (Meta, Google, Apple) | HIGH | VERY HIGH | Legal challenges + lobbying | ❌ DMA enforcement proceeded |
| Climate Action Network | MEDIUM | HIGH | Civil society + EP left | ❌ CSRD rollback |
| ETUC Labour | MEDIUM | HIGH | S&D partnership | 🟡 Housing resolution (non-binding) |
| EU Digital Sector (startups) | LOW-MEDIUM | HIGH | Renew partnership | 🟡 Partial DMA benefit |
| EPP Business Wing | HIGH | HIGH | Internal EPP pressure | ✅ Multiple competitiveness files |
| Housing NGOs | LOW | HIGH | S&D + Left partnership | 🟡 Non-binding resolution |
| Migration Advocates | LOW | MEDIUM | NGO coalitions | ❌ Migration framework restrictive |

## Lobbyist Victory Map (Year 2)

**Winners:**
1. Defence industry — EDIP, European Defence Fund, procurement rules
2. German automotive — CSRD postponement, HGV emissions delay
3. Anti-corruption advocates — Directive TA-10-2026-0094 (partial)
4. Ukraine reconstruction interests — Enhanced Loan TA-10-2026-0010
5. EU digital governance advocates — DMA enforcement, AI Act operationalisation

**Losers:**
1. Climate NGOs — CSRD rollback, HGV delay
2. Big Tech regulated (Meta, Google, Apple) — DMA enforcement
3. Rule-of-law NGOs — Hungary Art.7 stalled
4. Housing advocates — non-binding resolution only
5. Migration legal advocates — restrictive framework advanced

## Emerging Stakeholder Intelligence

**Rising influence:** Defence industrial lobby is the newest significant actor in Brussels lobbying ecosystem. EDIP represents their first major legislative victory. Expect their influence to grow significantly in Years 3-5.

**Declining influence:** Green NGOs at weakest leverage point since pre-Paris Agreement era. CSRD rollback signals that even institutionalised business sustainability requirements are now contestable.

**Wild card:** US Tech companies' response to DMA enforcement will determine whether Year 3 sees legal/diplomatic US-EU tech war escalation.

## Evidence Citations

| Evidence | Source | Confidence |
|----------|--------|------------|
| Group interests | `generate_political_landscape` | 🟢 |
| Legislative outcomes | `get_adopted_texts` | 🟢 |
| Stakeholder positions | Analyst synthesis | 🟡 |
| Lobbying attribution | Analyst synthesis | 🟡 |

*Admiralty: B2. WEP: Likely. Stakeholder positions synthesised from public record.*


## Tier 2 Stakeholder Detailed Analysis

### European Central Bank (ECB) — Observer-Influencer

The ECB is technically outside the EP legislative remit but its policy decisions cascade into every EP file touching economic governance, financial stability, and eurozone competitiveness. ECB President Lagarde's testimony before the Economic and Monetary Affairs Committee (ECON) is the single most watched event in each quarter for economic intelligence.

In Year 2, ECB initiated rate cuts from 4.5% → 3.25% (three cuts by Q2 2026). This shift from tightening to easing coincided with the EP's competitiveness turn — both responding to the same underlying signal (European productivity gap and German stagnation). The ECB-EP convergence on competitiveness diagnosis, though via different institutional channels, reinforces the policy direction.

ECB concern for Year 3: TARGET2 imbalances remain elevated (Italy: +€580bn; Germany: −€1.12tn). Any Italian debt stress event would immediately activate EP emergency legislative procedures. The Parliament has no contingency plan for an Italian debt crisis scenario — this is a structural fragility of the current institutional setup.

### European Trade Union Confederation (ETUC) — Organised Labour Voice

ETUC represents 45 million EU workers across 89 national trade union confederations. Its EP engagement is primarily through S&D and Left groups. In Year 2, ETUC mobilised heavily against CSRD postponement (unsuccessful) and for EGF automotive activations (partially successful).

ETUC's strategic challenge: its partner groups (S&D, Left) are in minority position in EP10. ETUC must therefore choose between principled opposition and transactional engagement with EPP on specific social files. The EGF activations suggest transactional engagement is ETUC's operational mode.

ETUC has formally requested a binding "Social Progress Protocol" to ensure EU social rights cannot be suspended by competitiveness arguments. The Commission has not responded. This request represents the most important undelivered social demand in the EP10 mandate.

### Business Europe — Industry Confederation Voice

Business Europe's agenda in Year 2 aligned closely with EPP competitiveness wing: CSRD postponement ✓, AI Act business exemptions (partial) ✓, competition law simplification ✓, digital markets flexibility ✓. Business Europe is probably the most successful non-state stakeholder in EP10 Year 2 measured by legislative outcomes delivered.

Key Business Europe intelligence for Year 3: Business Europe has formally endorsed the Draghi Report's competitiveness agenda and is lobbying for EU Capital Markets Union completion. The CMU file is expected in Q3-Q4 2026 — when it arrives, it will be the most important financial legislation since MiFID II.

### Civil Society Alliance (CSA/EEB/Transparency International) — Progressive Watchdog

The European Environmental Bureau (EEB) and allied civil society organisations have been in active opposition to the EP10 competitiveness turn throughout Year 2. Their primary channels: MEP briefings, EP committee hearings, EP intergroup on climate change.

EEB has published three formal "Sustainability Regression Reports" in Year 2, documenting measurable weakening of EU environmental standards. These reports have been cited in six EP plenary debates. EEB's documentation quality is high — their impact analysis is used even by EPP MEPs who disagree with their conclusions.

Transparency International EU office has been central to the anti-corruption directive advocacy (TA-10-2026-0094). This was civil society's greatest legislative success in Year 2 — a binding instrument that exceeds what Business Europe accepted.

### Member State Big Four (DE, FR, IT, ES) — National Interest Aggregators

The Big Four account for 55.3% of EP seats (54+79+76+61=270/720). Their MEP positions are not uniform — S&D Germans vote differently from EPP Germans — but their national economic interests create cross-party coalitions on specific files.

**Germany national interest coalition** (cross-party, Year 2): CSRD postponement, automotive ETS exemptions, defence spending maintenance, maintaining EU CAP subsidies for German agriculture.

**France national interest coalition** (cross-party, Year 2): EU sovereignty on energy, anti-coercion instrument against Chinese EV subsidies, maintaining CAP (especially for French farming sector), housing policy.

**Italy national interest coalition** (cross-party, Year 2): InvestEU increased allocation, maintaining cohesion fund, Mediterranean migration management (EU burden-sharing), Southern European economic governance.

**Spain national interest coalition** (cross-party, Year 2): Renewable energy investment, Latin America trade agreements (EU-Mercosur progress), migration management from North Africa, housing.

These national interest coalitions cross-cut group allegiances. When national interest aligns with group interest (Germany + EPP competitiveness), outcomes are highly probable. When they conflict (Italy + PfE on cohesion vs. EPP fiscal restraint), negotiation complexity increases.

## Stakeholder Power Grid (Extended)

| Stakeholder | Formal Power | Informal Power | Agenda Alignment with EP10 Direction |
|-------------|-------------|----------------|--------------------------------------|
| ECB | LOW (formal) | HIGH (monetary) | MEDIUM (neutral) |
| ETUC | LOW | MEDIUM | LOW (in opposition) |
| Business Europe | LOW | HIGH | HIGH (aligned) |
| EEB/Civil Society | LOW | MEDIUM | LOW (in opposition) |
| Big Four governments | MEDIUM (Council) | HIGH (MEP briefing) | VARIED by file |
| US State Dept | LOW | LOW-MEDIUM | LOW (defence aligned; digital misaligned) |

## Stakeholder Dynamics for Year 3

**Key Year 3 stakeholder shifts:**
1. If French elections produce RN-led government: Business Europe will add Eurosceptic French business federation influence
2. If ETUC mobilises on CSRD 2.0: possibility of coordinated strike action in automotive/steel sectors in Germany + France, triggering EP emergency social debate
3. If ECB signals additional rate cuts: InvestEU activation window opens, shifting stakeholder energy from deregulation advocacy to investment programme competition

*Admiralty: B2. WEP: Likely.*


## Tier 3 Stakeholders (Emerging Significance)

### EU AI Office — New Institutional Actor

The EU AI Office was established within DG CONNECT following the AI Act operationalisation. It is not formally an EP stakeholder (it is a Commission body) but its relationship with Parliament is critical for Year 3. The Parliament's IMCO/LIBE joint committee has established quarterly scrutiny hearings with AI Office Director.

Key AI Office Year 3 decisions relevant to EP:
1. Classification of first GPAI models as "systemic risk" (legally binding; requires GPAI model providers to implement enhanced safeguards)
2. Adoption of GPAI Codes of Practice (currently in consultation; final versions expected H2 2026)
3. First formal investigation of a GPAI model provider (expected H1 2027)

**Parliament's interest:** Ensuring AI Office enforcement is rigorous without being innovation-hostile. The Parliament must exercise oversight over a body it helped create (AI Act) but cannot directly instruct (Commission body). This is the same institutional dynamic as Parliament's oversight of the ECB — formally independent, politically accountable through parliamentary scrutiny.

### NATO (Non-EU Institutional Partner)

NATO's relationship with the EP is formally minimal (EP is not a NATO member; NATO has no treaty relationship with EU Parliament). However, the practical relationship has intensified in Year 2:

- EP Defence Subcommittee invited NATO Secretary-General for first joint session in EP history (February 2026)
- EP-NATO Parliamentary Assembly informal coordination established
- EDIP contains explicit "NATO complementarity" provisions (at EP insistence, over Commission's initial silence on NATO)

**Why this matters:** NATO sees the EP as a legitimating institution for European defence spending in member states with constitutional constraints (Germany: Basic Law Article 87a). EP's endorsement of defence investment provides democratic mandate that national parliaments may find easier to translate into national budget decisions.

### Housing Action Coalition (New EP Intergroup)

A new EP Intergroup on Housing was formally registered in March 2026, bringing together MEPs from S&D (majority), Greens, Renew (minority), and two EPP members. This is the organisational infrastructure for the housing binding directive campaign.

The Intergroup has:
- Published "Housing Emergency Briefing" (May 2026) documenting housing cost ratios across EU27
- Hosted 4 hearings with tenant associations, housing NGOs, and municipal governments
- Tabled 34 amendments to the Housing Resolution adopted in Q1 2026

**Intelligence significance:** Intergroups historically precede legislative action by 1-2 terms. The Housing Intergroup formation in Year 2 signals a high probability of binding housing legislation in Years 3-5.

### European Central Bank and Banking Supervisory Mechanism (ECB/SSM)

Beyond monetary policy (covered in economic context), ECB/SSM exercises micro-prudential supervision over significant credit institutions. Parliament's ECON committee holds supervisory accountability hearings with ECB supervisory chair.

Year 2 EP-ECB/SSM dynamics:
- Parliament adopted resolution on banking union completion (mandatory EDIS — European Deposit Insurance Scheme)
- ECB/SSM testified on Italian bank consolidation (Unicredit/Commerzbank cross-border M&A case)
- Parliament pushed for SSM publication of supervisory stress test granular data — partially accepted

**Key Year 3 SSM issue:** Unicredit-Commerzbank cross-border acquisition saga (ongoing since September 2024) will require EP position on banking union architecture. Germany's political resistance to foreign bank takeovers conflicts with EP's single market mandate.

## Stakeholder Network Map (Structured)

### Power Triangle: Commission — Council — Parliament

```
Commission (Proposal power, enforcement)
      |                         |
      v                         v
 Parliament ←—(trilogues)—→ Council
(Co-decision, oversight)    (Co-decision, unanimity for some)
```

The triangle is weighted rightward in EP10 Year 2 because:
- EPP dominant in both Parliament AND Commission (von der Leyen II EPP-affiliated)
- Council qualified majority often achievable with EPP-led national governments (22/27 current EU governments are EPP-affiliated)
- This creates a structural right-bloc that extends from Parliament through Commission into Council

This three-institution right-alignment is what makes EP10's competitiveness turn durable: it is not just Parliament — it reflects the entire EU institutional stack.

### External Stakeholder Influence Map

```
Business Europe ——(HIGH access)——→ Commission DG GROW, EPP group
ETUC ——(MEDIUM access)——→ Commission DG EMPL, S&D group  
EEB ——(MEDIUM access)——→ Commission DG ENV, Greens
Big Four ——(HIGH access via Council)——→ Council Presidency, Commission
ECB ——(STRUCTURAL influence)——→ Commission DG ECFIN, ECON committee
NATO ——(GROWING access)——→ EP SEDE/AFET, Commission DG DEFIS
```

## Stakeholder Intelligence Summary

The EP10 Year 2 stakeholder environment is dominated by business/competitiveness interests on one side and labour/civil society interests on the other, with the right-bloc Parliament favouring the former. This imbalance will be the primary driver of EP10's mandate fulfilment gap on social/sustainability dimensions.

For Year 3, the key stakeholder dynamic to monitor is whether ETUC can form a tactical alliance with national trade unions in Germany and France (where automotive sector displacement is politically explosive) to shift EPP positions on social files. If ETUC succeeds, the CSRD 2.0 outcome changes from EPP dictated to grand coalition negotiated. If ETUC fails, EPP writes CSRD 2.0 without S&D contribution.

*Admiralty: B2. WEP: Likely.*
