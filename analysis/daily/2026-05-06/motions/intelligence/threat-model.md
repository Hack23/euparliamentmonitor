<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Threat Model — EP Motions
**Article type:** motions | **Date:** 2026-05-06 | **Confidence:** 🟡 Medium

> **Methodology note:** Applying the 5-framework integrated political threat analysis per `political-threat-framework.md` v4.0 (NOT STRIDE — STRIDE is a software security framework and is explicitly rejected for political analysis). Frameworks applied: (1) Political Threat Landscape 6-dimension model, (2) Attack Trees, (3) Political Kill Chain, (4) Diamond Model, (5) Threat Actor Profiling (ICO).

---

## 1. Political Threat Landscape (6-Dimension Model)

### Dimension 1: Coalition Shifts
**Threat level:** 🟡 MEDIUM  
**Pattern:** EPP's simultaneous maintenance of EPP-ECR coalition (defence/migration) and EPP-S&D coalition (rights/social) creates a systemic coalition instability risk. On any given week, ECR's hardening on migration can trigger S&D walkout; S&D's social demands can trigger ECR walkout.

**Specific threat for this week:** AMMR solidarity motion — if EPP tries to satisfy ECR by weakening the text, S&D will oppose; if EPP accepts S&D's strong text, ECR will oppose. Mathematical risk: motion fails if either coalition arm defects.

### Dimension 2: Transparency Deficit
**Threat level:** 🟡 MEDIUM  
**Pattern:** ECR's growing role as shadow rapporteur on EDIS and competitiveness files without proportional committee leadership positions creates a "quiet capture" phenomenon — ECR influence is increasing faster than their visible institutional profile suggests. PfE's procedural obstruction tactics (tabling hundreds of amendments to slow deliberation) are documented but not well-understood by public audiences.

### Dimension 3: Policy Reversal
**Threat level:** 🔴 HIGH  
**Pattern:** The Green Deal retreat is the clearest live example of EP policy reversal. Nature Restoration Law near-defeat (EP9 2024), CID weakening (EP10 2025-2026), and biodiversity target implementation delays represent a systematic reversal of EP9's environmental commitments. This is not just marginal dilution — it is directional reversal.

### Dimension 4: Institutional Pressure
**Threat level:** 🟡 MEDIUM  
**Pattern:** Polish Presidency (Jan–Jun 2026) is actively shaping EP10 legislative agenda toward Council priorities (security, migration, competitiveness). This is normal interinstitutional dynamics but the alignment between Polish Presidency ECR-adjacent positions and EP's growing ECR bloc creates unusual institutional convergence that marginalizes Commission as agenda-setter.

### Dimension 5: Legislative Obstruction
**Threat level:** 🟡 MEDIUM  
**Pattern:** PfE's systematic obstruction through procedural motions, amendment floods, and quorum challenges. ECR's more targeted obstruction on files where they extract concessions. ESN's consistent anti-European bloc voting.

**Specific obstruction risk this week:** If PfE tables 300+ amendments to CID text (as they did on Nature Restoration Law), procedural management could delay the vote by weeks, giving industry lobbyists more time to erode EPP support.

### Dimension 6: Democratic Erosion
**Threat level:** 🔴 HIGH  
**Pattern:** The normalization of far-right parties (ECR, PfE) in mainstream EP coalition mathematics represents the most significant democratic erosion risk. When EPP negotiates with ECR on migration text, ECR's framing of asylum seekers as a "threat" rather than "people with rights" migrates into official EP resolution language. The incremental laundering of extremist discourse into mainstream legislative text is a documented long-term threat.

---

## 2. Attack Trees

### Attack Tree 1: Defeating CID Implementing Regulations

```
Goal: CID implementing regulations fail or are fundamentally diluted

Branch A: Amendment avalanche strategy
├── PfE/ECR table 200+ amendments (P=80% — procedural right)
│   ├── Committee unable to process in time → delay (P=30%)
│   └── Plenary vote stretched over 2+ days → coalition management fails (P=20%)
└── Single destructive amendment passes
    ├── "Coal industry permanent exemption" from ETS2 (P=25%)
    │   └── Supported by ECR + PfE + ESN + German EPP (coal regions)
    └── "National energy security override" clause (P=35%)
        └── Supported by ECR + PfE + some RE (energy security frame)

Branch B: EPP internal fracture
├── German EPP industry faction (Weber, Ferber) under domestic pressure
│   └── Key EPP votes for industry exemption amendments (P=20%)
└── Bavarian CSU delegation breaks group discipline (P=10%)

Branch C: S&D demands deadlock
├── S&D Just Transition Fund demand exceeds EPP red line
│   └── S&D votes against, coalition falls below 361 (P=15%)
```

### Attack Tree 2: Reversing AMMR Solidarity

```
Goal: AMMR solidarity mechanism motion fails

Branch A: National delegation cross-pressure
├── Polish ECR abstains (P=60%)
│   └── If Hungarian EPP equivalent existed they would too; but NI block from Hungary votes AGAINST
├── Eastern EPP delegation (PL, CZ, SK, HU-linked) votes AGAINST (P=35%)
│   └── Margin slips below 361
└── Italian S&D (PD) abstains under Meloni domestic pressure (P=20%)

Branch B: PfE procedural strategy
├── Quorum challenge in committee (P=40%)
└── Plenary vote postponed
```

---

## 3. Political Kill Chain

Applying the 7-stage Political Kill Chain to the threat of "ECR normalization accelerates":

| Stage | Actor | Action | Observable signal |
|-------|-------|--------|------------------|
| 1. Reconnaissance | ECR leadership | Identify EP10 committee rapporteurships available | ECR shadow rapporteur appointments on EDIS, ITRE |
| 2. Weaponization | ECR + EPP coordination | Agree coalition terms for EDIS support in exchange for ECR shadow roles | Committee vote outcomes aligning ECR positions |
| 3. Delivery | ECR MEPs | Enter committee deliberations with technical amendments | ECR MEPs appearing in committee debates as experts |
| 4. Exploitation | ECR influence | Shape motion text to include national flexibility provisions | Legislative text language shifts |
| 5. Installation | Normalization | ECR provisions survive plenary unchanged | Final text includes ECR amendments |
| 6. Command | ECR → EPP | ECR signals price for next motion support | New ECR demands on subsequent legislation |
| 7. Actions on Objective | Policy shift | EU policy officially moves in ECR-preferred direction | Adopted regulation contains far-right provisions |

**Current stage:** Stage 4-5 (exploitation/installation). ECR normalization is already underway; the threat has partially materialized.

---

## 4. Diamond Model Analysis

| Vertex | Description | Actor (ECR normalization threat) |
|--------|-------------|--------------------------------|
| Adversary | Who is acting | ECR (institutional expansion); PfE (obstruction) |
| Capability | What they can do | Shadow rapporteur roles, amendment strategy, coalition leverage |
| Infrastructure | How they operate | EP committee positions, national government backing (IT, PL Presidencies) |
| Victim | Who is affected | Moderate EP consensus; EP institutional credibility with pro-European voters |

**Diamond Model assessment:** The Adversary has growing Capability (more committee positions) and improving Infrastructure (Italian government bilateral coordination with ECR EP delegation). The Victim is diffuse — not a single actor but the EP's historical moderate-consensus identity.

---

## 5. Threat Actor Profiling (ICO: Intent × Capability × Opportunity)

| Actor | Intent | Capability | Opportunity | ICO Score | Threat Level |
|-------|--------|-----------|-------------|-----------|-------------|
| PfE (Orbán/Le Pen) | Undermine EU integration | HIGH (84 seats, procedural expertise) | HIGH (EP10 structural fragmentation) | 8/10 | 🔴 HIGH |
| ECR (Meloni) | Expand ECR influence in mainstream | HIGH (selective integration strategy) | HIGH (EPP needs ECR for defence) | 8/10 | 🔴 HIGH (long-term) |
| ESN (Maximalist nationalism) | Obstruct EU legislation | MEDIUM (28 seats) | MEDIUM (tactical votes) | 5/10 | 🟡 MEDIUM |
| NI (various) | Represent national interests | MEDIUM (33 seats, fractured) | LOW (no group discipline) | 3/10 | 🟢 LOW |

---

## 6. Threat Priority Matrix

| Threat | Probability | Impact | Risk Score |
|--------|------------|--------|------------|
| AMMR solidarity motion fails | HIGH | MEDIUM (legislative setback) | 🔴 HIGH |
| CID implementing regs diluted beyond recognition | HIGH | HIGH (Green Deal credibility) | 🔴 HIGH |
| ECR normalization accelerates | CONFIRMED (ongoing) | HIGH (long-term democratic) | 🔴 HIGH |
| AI Act biometric exceptions expanded | MEDIUM | MEDIUM (rights architecture) | 🟡 MEDIUM |
| EDIS motion fails | LOW | HIGH (security credibility) | 🟡 MEDIUM |

*Generated: 2026-05-06T20:12Z | Run: motions-run431-1778097237*
