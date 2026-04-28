<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Threat Model — EU Parliament Breaking News — 2026-04-28

**Run:** breaking-run1777360024 | **Date:** 2026-04-28 | **Session:** Strasbourg April 27-30, 2026
**Methodology:** STRIDE threat modeling + political intelligence threat framework

---

## Overview

Structured threat model for EU Parliament and the EU legislative system, covering political, legal, informational, and institutional threat vectors as of April 2026. Integrates STRIDE framework adapted for political-institutional threat analysis.

---

## 1. Threat Landscape Summary

**WEP 60-70%:** At least one HIGH-level political threat vector materialises within 6 months.
**Admiralty:** B-2 (confirmed source, probably true — intelligence community consensus on multiple vectors)

### Threat Level Assessment

| Domain | Level | Trend |
|--------|-------|-------|
| Institutional integrity | MEDIUM | STABLE |
| Coalition stability | MEDIUM | ELEVATED |
| Trade/Economic coercion | HIGH | INCREASING |
| Disinformation | HIGH | PERSISTENT |
| Foreign interference | HIGH | PERSISTENT |
| Rule-of-law erosion | MEDIUM | IMPROVING |

---

## 2. STRIDE Analysis — Political Institutional Threats

### S — Spoofing (Identity/Authority Threats)

**Threat:** Manipulation of MEP mandates through forged communications, impersonation, or fraudulent representation.

**Current Instance:** Braun immunity waiver (TA-10-2026-0088) — demonstrates vulnerability of parliamentary immunity to political interference. Braun incident involved antisemitic disruption of plenary session (22 January 2025).

**Risk Level:** LOW-MEDIUM for institutional spoofing; HIGH for disinformation posing as official communications.

**WEP 25-35%:** A significant spoofing/impersonation incident targeting EP institutional processes within 12 months.

---

### T — Tampering (Integrity Threats)

**Threat:** Alteration of legislative texts, voting records, or EP data systems.

**Current Threat Vectors:**
- Russian state actors historically target EU institutional systems (APT28, Cozy Bear documented activity vs EU targets)
- Chinese APTs targeting EU trade policy information
- Insider threat risk from national delegations with divided loyalties

**EP Protective Measures:**
- EP IT security framework (CERT-EU cooperation)
- Blockchain-based voting integrity considered but not yet implemented
- Classification system for sensitive legislative documents

**Risk Level:** MEDIUM (mitigation measures in place; persistent adversary capability)

**WEP 20-30%:** Confirmed tampering incident affecting EP digital infrastructure within 24 months.

---

### R — Repudiation (Accountability Threats)

**Threat:** Actors denying actions, votes, or commitments in legislative process.

**Current Instance:** PfE internal confusion on US tariff stance — some members publicly contradict group voting line. Creates accountability ambiguity.

**Institutional Risk:** Vote manipulation allegations in contested electoral scenarios (2029 elections approaching).

**Risk Level:** LOW-MEDIUM for current session; MEDIUM for 2029 election cycle.

---

### I — Information Disclosure (Confidentiality Threats)

**Threat:** Leaking of confidential legislative negotiations, compromise positions, or personal MEP data.

**Current Threat Vectors:**
- Trilogue (informal trialogue) leaks to lobbying interests
- Foreign intelligence interception of MEP communications
- GDPR violations in EP data handling

**High-Value Intelligence Targets:**
- EU-US trade negotiation positions (extremely sensitive given ongoing tariff dispute)
- EU-Ukraine aid quantum and conditionality details
- Banking union compromise texts during SRMR3 negotiations

**Risk Level:** HIGH (persistent; historically well-documented leak vectors)

**WEP 70-80%:** At least one significant confidential legislative position leaked to external interests within 12 months.

---

### D — Denial of Service (Availability Threats)

**Threat:** Disruption of EP legislative processes through parliamentary procedure abuse, cyberattacks, or political blocking.

**Current Instance — Procedural:**
- Hungary threatens to block Council decisions on Ukraine and rule-of-law (ongoing 2024-2026)
- Far-right groups using EP procedural rules to delay votes (vote splitting, 11th-hour amendments)

**Current Instance — Cyber:**
- DDoS attacks against EP website (documented — 2022 pro-Russian Killnet attack)
- Phishing campaigns targeting MEP staff accounts

**Risk Level:** MEDIUM-HIGH (procedural blocking has higher current impact than cyber DoS)

**WEP 60-70%:** Significant procedural blocking attempt on at least one major legislative act within 6 months.

---

### E — Elevation of Privilege (Authorization Threats)

**Threat:** Actors gaining influence or access beyond their legitimate mandate.

**Current Instances:**
- Lobbying interests securing inappropriate access to rapporteur amendment processes
- Foreign-funded think tanks providing MEPs with biased legislative analysis
- Braun case — extremist actor used parliamentary privilege to commit hate crimes

**Risk Level:** MEDIUM (persistent; EP transparency register partially mitigates)

---

## 3. Political Threat Vectors — Detailed Assessment

### Vector A: Trade War Escalation

**Description:** US administration escalates tariffs beyond current TA-10-2026-0096 scope; EU forced into full trade war.

**Threat Actors:** US Trump administration; US domestic steel/automotive lobby
**Probability:** WEP 40-50% (escalation to full trade war); WEP 80-90% (continued friction below full war threshold)
**Impact:** CRITICAL — potential 0.5-1.5% EU GDP impact; political pressure on coalition
**Admiralty:** B-2

**EU Countermeasures:**
- TA-10-2026-0096 graduated countermeasures (passed)
- WTO dispute filing (planned)
- EU-Canada CETA+ (TA-10-2026-0078) as alternative supply chain

---

### Vector B: Russian Disinformation Campaign

**Description:** Coordinated Russian state disinformation targeting EP legitimacy, EU-Ukraine solidarity, and anti-corruption agenda.

**Threat Actors:** GRU, FSB, Russian state media (RT, Sputnik), front organisations
**Probability:** WEP 90%+ (campaigns are ongoing, not hypothetical)
**Impact:** HIGH — erodes public trust in EU institutions; amplified by PfE/ESN MEPs repeating narratives
**Admiralty:** A-1 (documented, beyond reasonable doubt)

**EU Countermeasures:**
- East StratCom Task Force
- EDMO (European Digital Media Observatory)
- EP media literacy campaigns

---

### Vector C: Internal Coalition Fracture

**Description:** EPP-S&D-Renew majority fractures on a major vote (most likely trigger: migration or budget).

**Threat Actors:** Internal — PfE opportunism, far-right mobilisation; External — Russian/Chinese information operations targeting coalition gaps
**Probability:** WEP 35-45% (full coalition fracture); WEP 65-75% (significant disagreement requiring emergency management)
**Impact:** HIGH — legislative paralysis on Commission agenda
**Admiralty:** B-2

---

### Vector D: Rule of Law Backsliding

**Description:** One or more member states (most likely Hungary, but also growing concern for Italy) reverse rule-of-law progress, creating EP-Council deadlock.

**Probability:** WEP 50-60% (significant rule-of-law incident within 12 months)
**Impact:** HIGH — undermines anti-corruption directive implementation; challenges EU treaty architecture
**Admiralty:** B-2

---

## 4. Threat Mitigation Map

| Threat Vector | Current Mitigation | Residual Risk | Priority Action |
|--------------|-------------------|---------------|-----------------|
| Trade escalation | TA-10-2026-0096 passed | HIGH | WTO filing; US diplomatic channel |
| Disinformation | StratCom + EDMO | HIGH (ongoing) | Increase EP media literacy budget |
| Coalition fracture | Commission coordination | MEDIUM | Renew-S&D dialogue on trade |
| Rule-of-law erosion | Anti-corruption directive | MEDIUM | Council QMV reform proposal |
| Cyber threats | CERT-EU cooperation | MEDIUM | EP-specific cyber resilience law |
| Parliamentary privilege abuse | Braun immunity waiver | LOW | Clarify immunity scope in Rules |

---

## Data Sources

| Source | Tool | Reliability |
|--------|------|-------------|
| EP Open Data Portal | get_adopted_texts | B-1 |
| EP Open Data Portal | early_warning_system | B-2 |
| EP Open Data Portal | generate_political_landscape | B-1 |
| Open source intelligence | - | B-3 |

**Attribution:** European Parliament Open Data Portal (data.europarl.europa.eu) — CC BY 4.0
