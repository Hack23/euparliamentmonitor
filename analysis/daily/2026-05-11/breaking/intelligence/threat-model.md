<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Threat Model — EP Breaking News, 2026-05-11

**Methodology:** STRIDE threat model applied to political intelligence context  
**Article Type:** breaking  
**Confidence:** 🟡 Medium

---

## Threat Model Scope

**System Under Analysis:** EU Parliament institutional authority, Claims Commission implementation path, ETS2 governance architecture, MEP immunity enforcement system

**Trust Boundaries:**
1. EP Internal (Council of the EU, Commission, MEPs, JURI) — HIGH TRUST
2. EU Member States — VARIABLE TRUST (Hungary LOW; Poland, Baltic states HIGH)
3. International Partners — MEDIUM TRUST (Council of Europe, ICJ, ICC)
4. Adversarial State Actors — LOW/NO TRUST (Russia, Belarus)
5. Non-State Actors — VARIABLE (NGOs HIGH; disinformation networks NONE)

---

## STRIDE Analysis

### S — Spoofing (Identity/Source Deception)

| Threat ID | Description | Actor | Likelihood | Impact |
|-----------|-------------|-------|-----------|--------|
| S-01 | Russian state media presenting PfE/ECR MEP statements as representative "European opinion" against Claims Commission | Russia (RT/Sputnik/proxy networks) | HIGH | MEDIUM |
| S-02 | Far-right MEPs claiming their immunity waiver is politically motivated "persecution" (identity as victim vs. actor) | Braun, Şoşoacă | HIGH | MEDIUM |
| S-03 | False attribution of EP vote outcomes to specific political groups without evidence | Social media/tabloids | MEDIUM | LOW |

**Mitigations:** EP official adopted texts (TA-10-2026 series) provide authoritative source; roll-call data (when available, 3–5 week delay) will confirm individual MEP positions.

---

### T — Tampering (Data/Process Integrity)

| Threat ID | Description | Actor | Likelihood | Impact |
|-----------|-------------|-------|-----------|--------|
| T-01 | Legal challenge to Euroclear frozen asset administration — contest asset-use records | Russia/proxy legal firms | MEDIUM | HIGH |
| T-02 | Member state non-implementation of ETS2 registry creating factual gaps in carbon accounting | Non-compliant member states | LOW | HIGH |
| T-03 | Manipulation of EP attendance/vote records by malicious actor (cyber) | State-level APT (Russia, China) | VERY LOW | CATASTROPHIC |

**Mitigations:** Euroclear operates under Belgian and EU law with multiple audit layers; ETS2 registry has EU-level compliance monitoring; EP ICT systems are under ENISA framework.

---

### R — Repudiation (Non-Acknowledgment)

| Threat ID | Description | Actor | Likelihood | Impact |
|-----------|-------------|-------|-----------|--------|
| R-01 | Hungary repudiates Council commitment to Claims Commission ratification after signing | Hungary (Orbán) | MEDIUM | HIGH |
| R-02 | Braun/Şoşoacă claim no knowledge of immunity waiver process (procedural challenge) | Individual MEPs | MEDIUM | MEDIUM |
| R-03 | Russia denies legal personality of Claims Commission — refuses to participate or acknowledge | Russian state | CERTAIN | MEDIUM |

**Mitigations:** Claims Commission designed to operate ex parte (Russia's refusal anticipated in Convention design); EP JURI procedures are formally documented; Council conclusions are binding.

---

### I — Information Disclosure (Data Leakage)

| Threat ID | Description | Actor | Likelihood | Impact |
|-----------|-------------|-------|-----------|--------|
| I-01 | Leak of JURI internal deliberations on immunity waivers before official publication | Unknown internal source | LOW | MEDIUM |
| I-02 | Exfiltration of Claims Commission negotiating positions by Russia-linked actors | Russia GRU/SVR | LOW | HIGH |
| I-03 | Disclosure of MEP personal financial data from declarations (GDPR breach) | Malicious actor, scraper | LOW | MEDIUM |

---

### D — Denial of Service (Disruption)

| Threat ID | Description | Actor | Likelihood | Impact |
|-----------|-------------|-------|-----------|--------|
| D-01 | DDoS attack on EP website/voting infrastructure during May 18–22 plenary | Russia-linked hacktivist groups (NoName057, KillNet) | LOW | MEDIUM |
| D-02 | Physical disruption of EP session by protest/security incident | Non-state extremist actor | VERY LOW | HIGH |
| D-03 | Cyber disruption of Euroclear's frozen asset management systems | Russia APT (Sandworm, Fancy Bear) | LOW | CATASTROPHIC |

**Mitigations:** EP has dedicated cybersecurity team under CERT-EU umbrella; Euroclear has DORA-compliant cybersecurity architecture (as of 2025 implementation).

---

### E — Elevation of Privilege (Authority/Power Expansion)

| Threat ID | Description | Actor | Likelihood | Impact |
|-----------|-------------|-------|-----------|--------|
| E-01 | PfE/ECR bloc uses procedural rules to force unexpected votes or block agendas | PfE/ECR MEP leadership | MEDIUM | MEDIUM |
| E-02 | Hungarian/Slovak governments use Council Presidency (if applicable) to delay Claims Commission ratification scheduling | Hungary/Slovakia | MEDIUM | HIGH |
| E-03 | EP President overruled on immunity waiver by ECHR interim measures | ECHR (external jurisdiction) | LOW | HIGH |

---

## Risk Summary Table

| STRIDE Category | Highest Risk Threat | Risk Level |
|----------------|--------------------|-----------| 
| Spoofing | S-01: Russian identity spoofing of European opinion | 🟡 MEDIUM |
| Tampering | T-01: Euroclear asset record contestation | 🟡 MEDIUM |
| Repudiation | R-01: Hungary repudiates ratification commitment | 🟡 MEDIUM |
| Information Disclosure | I-02: Claims Commission negotiating position exfiltration | 🟡 MEDIUM |
| Denial of Service | D-03: Euroclear cyber disruption | 🔴 HIGH (low probability, extreme impact) |
| Elevation of Privilege | E-02: Council Presidency procedural obstruction | 🟡 MEDIUM |

**Overall Threat Level:** 🟡 MEDIUM  
**Critical Monitoring Signal:** ECJ opinion on frozen asset legal basis — publication expected Q2–Q3 2026; determines T-01 and R-03 materialisation

---

## Source Attribution

- STRIDE framework: Microsoft threat modeling methodology adapted for political intelligence context
- EP Adopted Texts: data.europarl.europa.eu (April 28–30, 2026)
- Cybersecurity threat landscape: ENISA Threat Landscape 2025; EU East StratCom; CERT-EU advisories
- Coalition/actor data: EP MCP tools (generate_political_landscape, analyze_coalition_dynamics)

---

## Extended Threat Analysis

### Geopolitical Threat Actors — Full Profiles

#### Russia (Primary Adversary State)
**Threat classification:** APT (Advanced Persistent Threat) — state-level  
**Capability assessment:** VERY HIGH — Russia maintains one of the world's most capable intelligence and cyber warfare apparatuses (GRU, FSB, SVR)  
**Motivation:** Maximum resistance to Claims Commission; delegitimisation of EU institutional authority; fracture of EU-Ukraine solidarity

**Active threat channels:**
1. **Legal/diplomatic:** Russian Ministry of Foreign Affairs has already stated the frozen asset seizure constitutes "theft" under international law; will file ICJ and ECHR challenges through proxy governments
2. **Information operations:** RT (banned in EU, accessible via VPN); Sputnik; coordinated inauthentic behaviour on X/Telegram; state-funded MEP friendly organisations
3. **Cyber operations:** GRU Unit 74455 (Sandworm), GRU Unit 26165 (Fancy Bear), SVR APT29 (Cozy Bear) — all documented active in EU targets as of 2025 ENISA report
4. **Proxy political actors:** PfE-affiliated MEPs with documented Russian-adjacent funding (multiple EP INGE investigations); Orbán government in Hungary

**Most plausible near-term action:** Legal challenge through Belarus, Serbia, or another non-EU ally state at ICJ against frozen asset operationalisation — timed to coincide with Claims Commission ratification debate to create maximum legal uncertainty

#### Hungary (Adversarial Member State)
**Threat classification:** Internal spoiler — EU member state acting in adversarial alignment with Russian interests  
**Capability assessment:** HIGH within EU institutional framework — Council veto (if unanimity applies); EP bloc via PfE/affiliated MEPs; European Council blocking minority (if other states join)  
**Motivation:** Orbán government's strategic alignment with Russia; domestic political calculation (energy dependency on Russia); ideological opposition to Ukraine accountability framework

**Active threat channels:**
1. **Council procedure:** Blocking ratification; demanding "consultations"; procedural delay tactics (calling for extended impact assessments)
2. **EP procedure:** PfE/ECR coalition attempts to reopen EP discussion; request for urgent committee hearing; media pressure against EPP MEPs who voted for Claims Commission
3. **Bilateral pressure:** Hungary uses energy transit leverage (TurkStream gas pipeline) to pressure Slovakia, Austria, and other energy-dependent member states

**Most plausible near-term action:** Official government statement calling for "proper international legal process" (code for delay/derailment) — expected within 30 days of EP vote

---

### Threat Probability-Impact Heatmap (Quantified)

| Threat | Probability Score | Impact Score | Combined Threat Score |
|--------|-------------------|--------------|----------------------|
| S-01: Russian media identity spoofing | 0.85 | 5/10 | **4.25** |
| T-01: Euroclear legal contestation | 0.35 | 8/10 | **2.80** |
| R-01: Hungary Council repudiation | 0.30 | 9/10 | **2.70** |
| E-02: Council Presidency obstruction | 0.30 | 7/10 | **2.10** |
| R-04: MEP ECHR challenge | 0.35 | 6/10 | **2.10** |
| D-03: Euroclear cyber disruption | 0.05 | 10/10 | **0.50 (catastrophic tail)** |
| E-01: PfE/ECR procedural blocking | 0.25 | 5/10 | **1.25** |
| I-02: Claims Commission data exfiltration | 0.10 | 7/10 | **0.70** |

**Highest combined threat:** S-01 (Russian media identity spoofing) — high probability, moderate impact  
**Highest tail risk:** D-03 (Euroclear cyber disruption) — low probability, catastrophic impact

---

### Threat Timeline (30–180 Days)

**Days 1–30 (Immediate):**
- S-01 (information operations) — ACTIVE NOW; ongoing Russian framing of Claims Commission as "theft"
- R-01 (Hungary repudiation signal) — EXPECTED within 30 days; Orbán government statement

**Days 31–90 (Near-term):**
- T-01 (Euroclear legal contestation) — ECJ challenge filing expected within 90 days of EP vote
- R-04 (MEP ECHR challenge) — Braun/Şoşoacă legal teams typically file within 60 days of waiver

**Days 91–180 (Medium-term):**
- E-02 (Council obstruction) — Council ratification debate begins; obstruction at this stage
- E-01 (PfE/ECR procedural blocking) — Escalation during May–July EP plenaries

**Long-term (180+ days):**
- D-03 (Euroclear cyber) — Persistent background risk; no specific timeline indicator; dependent on Russian decision calculus on sanctions escalation

---

### Defensive Measures Assessment

**EP Institutional Defences:**
| Defence | Strength | Assessment |
|---------|----------|-----------|
| JURI enforcement of immunity rules | STRONG | Four waivers demonstrate JURI's willingness to act consistently |
| EP cybersecurity (CERT-EU) | MEDIUM | Shared EU-wide infrastructure; covers EP ICT but not Euroclear |
| EP Rules of Procedure (decorum enforcement) | MEDIUM | Action against Braun precedent but enforcement is reactive |
| Coalition arithmetic (396-seat majority) | STRONG | 36-seat buffer provides meaningful redundancy |
| NIS2 Article 23 incident notification | MEDIUM | Obligatory reporting improves response speed; does not prevent attacks |

**Gap analysis:** EP's defences are strongest against internal political threats (coalition cohesion, immunity enforcement). External cyber threats targeting financial infrastructure (Euroclear) are outside EP's direct control — dependent on Euroclear's DORA compliance and CERT-EU intelligence sharing.

---

## Source Attribution (Expanded)

- STRIDE threat framework: adapted for EU institutional political intelligence context
- Threat actor profiling: ENISA Threat Landscape 2025 (Russia APT capabilities); EU East StratCom reports (2024–2025)
- EP institutional defences: EP Annual Report on Security; CERT-EU Annual Activity Report 2025
- Adopted texts (threat anchors): TA-10-2026-0154, -0108/0109/0106/0107 (April 28–30, 2026)
- Coalition data: generate_political_landscape (717 MEPs, EP10); analyze_coalition_dynamics (April 1–May 11)
- Historical threat precedent: Russia APT operations documented in FireEye/Mandiant reports (2020–2025); NCSC UK advisories
