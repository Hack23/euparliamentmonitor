<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Consequence Trees — EP Committee Reports Week 28 April–5 May 2026

**Analysis Date:** 2026-05-05 | **Methodology:** Decision tree analysis + consequence mapping
**Confidence:** 🟡 Medium

---

## Consequence Tree Framework

Consequence trees map the branching pathways from current decisions to medium-term outcomes, modelling both intended and unintended consequences through 2–3 decision nodes.

---

## Tree 1: DMA Enforcement Demand (TA-10-2026-0160)

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9"}}}%%
flowchart TD
    ROOT["EP demands 3 binding DMA decisions\n[TA-10-2026-0160, April 29 2026]"]
    
    ROOT --> D1A["Commission accelerates:\n3 binding decisions within 12 months\n[Probability: 35%]"]
    ROOT --> D1B["Commission partial response:\n1-2 decisions; delays rest\n[Probability: 45%]"]
    ROOT --> D1C["Commission non-response:\nEnforcement 'ongoing review'\n[Probability: 20%]"]
    
    D1A --> D2A1["Digital markets become\nmore competitive in EU\nSME benefit signal"]
    D1A --> D2A2["US-EU trade friction:\nUS govt objects DMA\ndiscriminatory vs. US firms"]
    
    D1B --> D2B1["Parliament escalates:\nnew resolution + DG COMP hearing\nDecember 2026"]
    D1B --> D2B2["Partial compliance normalised:\nselective DMA enforcement\nbecomes standard pattern"]
    
    D1C --> D2C1["Parliament credibility crisis:\n'toothless resolutions'\nnarrative amplified by PfE/ECR"]
    D1C --> D2C2["Renew/Greens/Left joint motion\nfor Commission confidence vote?\n[extreme escalation, low probability]"]
```

**Key consequence:**
- **Probability-weighted outcome**: Most likely path (45% partial + 35% full) leads to SOME enforcement acceleration — Parliament's pressure has real effect
- **Tail risk** (20% non-response): Serious credibility damage to Parliament's institutional authority in digital governance
- **Unintended consequence**: US-EU trade friction arising from aggressive enforcement against US-based platforms

---

## Tree 2: 2027 Budget Guidelines (TA-10-2026-0112)

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9"}}}%%
flowchart TD
    ROOT2["EP budget guidelines adopted\n(Parliament's maximal position)\n[TA-10-2026-0112, April 28 2026]"]
    
    ROOT2 --> B1A["Council counterproposal:\n-18% cuts from EP baseline\n[July 2026, probability: 85%]"]
    ROOT2 --> B1B["Council broadly accepts EP baseline\n[July 2026, probability: 15%]"]
    
    B1A --> B2A1["Conciliation compromise:\nEP gets +8% from Council baseline\n(implies ~-10% from EP guidelines)"]
    B1A --> B2A2["Conciliation failure:\nProvisional 2027 rule activated\n[December 2026]"]
    
    B2A1 --> B3A1["Adopted 2027 budget:\nbelow EP aspirations\nbut above Council minimum\nInstitutionally normal outcome"]
    B2A2 --> B3B1["Provisional rule impact:\nNew commitments frozen\nPolitically damaging signal"]
    
    B1B --> B2C1["Streamlined conciliation:\nminor modifications\nBudget adopted by Dec 5 2026"]
```

**Key consequence:**
- Budget conciliation failure (~8% probability given historical record) would be institutionally embarrassing
- The provisional budget rule (1/12th per month) would freeze new programme commitments, damaging EU credibility with beneficiaries
- The most likely outcome (compromise ~10% below EP maximum) is institutionally normal

---

## Tree 3: Armenia EU Integration Resolution (TA-10-2026-0162)

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9"}}}%%
flowchart TD
    ROOT3["EP supports Armenia EU integration\n[TA-10-2026-0162, April 30 2026]"]
    
    ROOT3 --> ARM1["Armenia-EU AA/DCFTA negotiations\naccelerated: 18-month negotiation\n[Probability: 55%]"]
    ROOT3 --> ARM2["Armenia negotiations stalled:\n(domestic politics / Russian pressure)\n[Probability: 35%]"]
    ROOT3 --> ARM3["Armenia reverses course:\nRussian inducement package\n[Probability: 10%]"]
    
    ARM1 --> ARM1A["AA/DCFTA initialled 2028\nEP consent vote 2028–29\nNew Eastern Partnership model"]
    ARM1 --> ARM1B["Russian countermeasures:\nenergy/gas supply leverage\nArmenia economy stress"]
    
    ARM2 --> ARM2A["EP resolution creates\nfalse expectations: Armenia public\nthen disappointed by non-delivery"]
    ARM2 --> ARM2B["EP credibility limited:\nresolution 'forgotten' within 12 months\nstandard INI fate"]
    
    ARM3 --> ARM3A["Significant diplomatic embarrassment\nfor EU's Eastern Partnership strategy\nReinforces 'EU overreach' narrative"]
```

**Key consequence:**
- The 35% probability of stalled negotiations means Parliament's enthusiastic resolution creates a significant expectation management risk
- Unintended consequence: Russian energy leverage on Armenia is the most likely blocking mechanism — not analysed in Parliament's resolution but the dominant geopolitical variable

---

## Tree 4: Livestock Sector Strategy (TA-10-2026-0157)

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9"}}}%%
flowchart TD
    ROOT4["EP demands EU Livestock Sector Strategy\n[TA-10-2026-0157, April 29 2026]"]
    
    ROOT4 --> LV1["Commission proposes strategy:\nAugust 2026 response\n[Probability: 50%]"]
    ROOT4 --> LV2["Commission defers:\n'Will consider in CAP 2027 context'\n[Probability: 40%]"]
    ROOT4 --> LV3["Commission rejects:\n'Existing CAP framework sufficient'\n[Probability: 10%]"]
    
    LV1 --> LV1A["Strategy published: Q1 2027\nLegislative proposal if needed: 2028\nCAP reform informed by strategy"]
    LV1 --> LV1B["Green Deal critics amplify:\n'EU abandons green transition'\nEnvironmental groups mobilise"]
    
    LV2 --> LV2A["CAP 2027 delayed consultation:\nLivestock gets specific workstream\nSlow resolution"]
    LV2 --> LV2B["Farm sector frustration:\nDemonstrations in Brussels\n(repeat of 2024 farm crisis protests)"]
    
    LV3 --> LV3A["EPP/ECR political backlash:\nAGRI committee formal hearing\nof relevant Commissioner"]
```

**Key consequence:**
- Commission deferral (40% probability) is the most likely non-answer — absorbing Parliament's demand into existing CAP structures without new commitment
- Farm protest recurrence (conditional on deferral/rejection) is a real political risk — EU agricultural communities have demonstrated willingness to mobilise since 2024

---

## Cross-Tree Interdependencies

The four consequence trees are not independent. Critical interdependencies:

1. **Budget × DMA**: If Commission delivers DMA enforcement success, it has more political credit to defend its July budget counterproposal. Budget conciliation dynamics are influenced by Commission's overall political standing.

2. **Armenia × Budget**: Armenia's integration pathway requires pre-accession funding commitments. If 2027 budget conciliation results in cuts to neighbourhood/external action lines, Armenia's integration resources are constrained.

3. **Livestock × Green Deal**: DG AGRI's response to the livestock strategy demand directly conflicts with DG CLIM's and DG ENV's Green Deal implementation objectives. The Commission's internal coherence is tested by simultaneously satisfying Parliament's livestock (economic viability) and environmental (transition) demands.

---

*Consequence trees use probabilistic branch weighting based on historical EP-Commission-Council interaction patterns. Probabilities are analytical estimates, not models.*

---

## Threat Roster

Primary threats to EP legislative objectives from this week's texts:
1. Commission non-delivery on DMA enforcement
2. Council budget conciliation failure
3. Armenia geopolitical reversal (Russian pressure)
4. Cyberbullying legislative stall
5. Livestock strategy Commission deferral

## Consequence Tree Summary

*See main body consequence tree diagrams above.* Four primary consequence trees mapped: DMA enforcement (branching from Commission accelerates/partial/non-response), Budget (compromise/failure), Armenia (negotiations continue/stall/reversal), Livestock (Commission proposes/defers/rejects). Probability-weighted outcomes: DMA partial/full response likely (80%); budget compromise likely (92%); Armenia stall/continuation split (90/10 for reversal); livestock Commission absorption likely (40%).

## Convergence Analysis

**Where multiple trees converge on common outcomes:**

1. **Budget credibility + DMA credibility**: If Commission simultaneously underdelivers on both DMA enforcement AND budget commitments, Parliament's institutional credibility faces a compound erosion. This convergence scenario (15% probability) would be the worst outcome for EP's political capital.

2. **Armenia + Ukraine accountability**: Both foreign policy texts share a dependency on geopolitical stability. A major escalation in either theatre would disrupt both consequence trees simultaneously.

3. **Agricultural + Green Deal tension**: Livestock strategy deferral scenario AND microplastics science delay scenario AND pesticide regulation revision (forthcoming) could converge on a perception of systematic Commission foot-dragging on EP agricultural-environmental balance.

## Intervention Points

Critical intervention opportunities that could shift consequence tree outcomes:
- **Weeks 1–4**: Parliament IMCO committee informally signals DG COMP on "binding decisions" definition to prevent compliance theatre
- **Month 2–3**: Armenia Partnership Council meeting — formal signal of AA/DCFTA negotiation start
- **Month 3**: Commission formal response to livestock INI — watch language carefully (substantive vs. deferral)
- **Month 4–6**: Commission draft 2027 budget — pre-conciliation informal dialogue determines range

## Reader Briefing

**What this means for citizens**: Think of EU Parliament resolutions like letters sent to government departments — they set expectations, but the real outcome depends on whether the department actually responds. This analysis maps four key decision points in the next 12 months where the EU Commission and Council will either deliver on Parliament's demands or disappoint. Citizens who care about digital market fairness, agricultural policy, or EU-Ukraine-Armenia relations should watch these specific milestones.
