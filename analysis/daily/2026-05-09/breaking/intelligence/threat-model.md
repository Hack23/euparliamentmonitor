<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- analysis/daily/2026-05-09/breaking/intelligence/threat-model.md -->
<!-- Generated: 2026-05-09 | Stage B Pass 1 -->

# Threat Model — Breaking News 2026-05-09

## Framework: STRIDE Applied to EU Parliamentary Institutions

This threat model identifies threat actors and vectors relevant to the April 28–30, 2026 EP plenary legislative cluster. Threats are classified by type (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) and assessed by actor motivation, capability, and current activity level.

---

## Primary Threat Actors

### TA-1: Russian State (FSB/GRU/SVR) — ACTIVE

**Motivation:** Undermine EU institutional credibility; delay/dilute Ukraine accountability mechanisms; destabilize democratic institutions supporting Ukraine.

**Current activation:** HIGH — April 30 Ukraine accountability resolution directly targets Russian leadership accountability (TA-10-2026-0161). FSB/GRU interest in disrupting accountability mechanisms is well-documented (attempted poisoning of investigators; disinformation campaigns).

**Relevant threat vectors:**

| Vector | Type | Likelihood | Mechanism |
|--------|------|------------|-----------|
| Legislative process disinformation | Spoofing/Tampering | HIGH | Create false narratives about resolution content/effect; impersonate MEP/Commission statements |
| MEP lobbying/corruption | Elevation of Privilege | MEDIUM | Financial influence on MEPs in Baltic/Eastern states to weaken Ukraine stance |
| Cyber intrusion — EP IT systems | Information Disclosure | MEDIUM | Exfiltrate EP negotiating positions on Ukraine support packages |
| Influence operation — "Commission interference" amplification | Spoofing | HIGH | Amplify PfE's Commission interference narrative as it aligns with Russian destabilization goals |

**Current evidence of activity:** Russian state media consistently amplified PfE-aligned "EU sovereignty" narratives in April 2026. The Commission interference debate on April 29 received disproportionate Russian media coverage, suggesting coordination or opportunistic amplification.

---

### TA-2: Chinese State (MSS) — LATENT

**Motivation:** Monitor EU tech regulation trajectory (DMA enforcement impacts Chinese platform access); gather intelligence on EU political divisions.

**Current activation:** MEDIUM — DMA enforcement (TA-10-2026-0160) could affect Chinese platform expansion in EU markets. EP division between sovereigntist and mainstream blocs is of intelligence interest.

**Relevant threat vectors:**

| Vector | Type | Likelihood | Mechanism |
|--------|------|------------|-----------|
| Industrial espionage — DMA compliance documents | Information Disclosure | LOW-MEDIUM | Exfiltrate Commission compliance assessment documents |
| Influence on regulatory debate | Elevation of Privilege | LOW | Cultivate MEP contacts who support lighter-touch platform regulation |

---

### TA-3: PfE/Sovereigntist Movement — INSTITUTIONAL

**Motivation:** Delegitimize mainstream EU institutions; build political capital through confrontation; establish "Commission interference" as dominant EP10 narrative.

**Current activation:** ACTIVE — April 29 Commission interference debate is direct institutional confrontation. PfE is exercising procedural rights under EP rules but pushing the institutional norms of those rules to their limits.

**Threat vectors:**

| Vector | Type | Likelihood | Mechanism |
|--------|------|------------|-----------|
| Procedural destabilization | Denial of Service (institutional) | MEDIUM | Mass points of order, procedural challenges, roll-call vote delays |
| Information warfare — EP legitimacy | Spoofing | HIGH | False or misleading claims about EP procedures, Commission actions |
| MEP defection cultivation | Elevation of Privilege | MEDIUM | Encourage EPP/ECR border-MEPs to vote with PfE on symbolic resolutions |
| Budget blackmail | Denial of Service | LOW | Threaten to block budget procedure unless conditions met |

**Key distinction:** PfE operates through legitimate democratic procedures. This is not a security threat in the traditional sense but an institutional threat to the functioning of the mainstream coalition. The threat model includes it because its effects on EU governance can be severe.

---

### TA-4: Far-Right Disinformation Networks — OPERATIONAL

**Motivation:** Advance sovereigntist political agenda; undermine trust in EU institutions.

**Current activation:** HIGH — The Commission interference debate is precisely the narrative these networks amplify. Coordination with TA-1 (Russian state media) is well-documented.

**Threat vectors:**
- Social media amplification of PfE "Commission interference" claims
- Fabricated MEP quotes shared across Telegram/X networks
- Viral content misrepresenting legislative texts (especially dogs/cats regulation framing as "EU surveillance")

---

## Specific Threats to April 28–30 Legislative Cluster

### Threat 1: Ukraine Accountability Resolution Narrative Attack

**Target:** TA-10-2026-0161 (Ukraine accountability)
**Actor:** TA-1 + TA-4
**Vector:** Disinformation

**Mechanism:** Russian state media + far-right networks claim the accountability resolution is "escalatory war-mongering" or "implicates EU members in weapons supply crimes." Goals: delegitimize accountability mechanism; discourage member states from supporting accountability structures.

**Likelihood:** HIGH | **Impact:** MEDIUM | **Mitigation:** Clear EP communication about resolution scope; member state foreign affairs committee briefings.

---

### Threat 2: Dogs/Cats Regulation "Surveillance State" Framing

**Target:** TA-10-2026-0115 (Traceability regulation)
**Actor:** TA-4 (domestic EU far-right)
**Vector:** Disinformation/Spoofing

**Mechanism:** Reframe pet traceability database as a government surveillance tool ("EU will track your pets, next they'll track you"). Exploit real privacy concerns about TRACES database to oppose regulation entirely.

**Likelihood:** MEDIUM | **Impact:** LOW (regulation already adopted; threat is to implementation) | **Mitigation:** DG SANTE public communication emphasizing animal welfare benefit; GDPR compliance transparency.

---

### Threat 3: DMA Enforcement Chilling via Regulatory Capture

**Target:** DMA enforcement process
**Actor:** Major platforms (Alphabet, Meta, Apple) — corporate, not state, threat actor
**Vector:** Regulatory capture through lobbying, litigation, and selective compliance

**Mechanism:** Platforms use DMA compliance "good faith" engagement to slow enforcement, generate litigation delay, and identify enforcement weakness. Not a cyber threat — a regulatory process threat.

**Likelihood:** HIGH | **Impact:** HIGH | **Mitigation:** EP oversight of Commission DMA enforcement; independent technical expertise in enforcement bodies.

---

## EP Institutional Security Posture Assessment

### Physical Security: 🟢 HIGH
Post-Brussels attack era (2016), EP security protocols are robust. Physical disruption scenarios are low probability.

### Cyber Security: 🟡 MEDIUM
EP IT systems are high-value targets. The EP experienced cyberattacks in 2022 (DDoS, claimed by pro-Russian group Killnet). EP's CERT-EU partnership provides baseline protection.

### Information Security: 🟡 MEDIUM
MEP personal devices and communications remain a vulnerability. Credential phishing targeting MEPs is a documented ongoing threat.

### Institutional Integrity: 🟡 MEDIUM
The Qatargate corruption scandal (2022–2023) exposed vulnerabilities in how financial influence could compromise EP decision-making. Reforms introduced (MEP asset disclosure, interest register) partially address but do not eliminate the threat.

### Legislative Process Integrity: 🟢 HIGH
The April 28–30 legislative process ran normally with 13 texts adopted. No credible evidence of compromise of vote results. The threat to legislative process integrity comes primarily from TA-3 (institutional procedural challenges), not from external actors.

---

## Threat Summary Matrix

```mermaid
graph LR
    TA1[Russian State TA-1] -->|Disinformation| UA[Ukraine Accountability]
    TA1 -->|Amplification| COM[Commission Interference Narrative]
    TA4[Far-Right Networks TA-4] -->|Reframing| DOG[Dogs/Cats Regulation]
    TA4 -->|Amplification| COM
    TA2[Chinese State TA-2] -->|Monitoring| DMA[DMA Enforcement]
    TA3[PfE Institutional TA-3] -->|Procedural Challenge| COM
    TA3 -->|Budget Leverage| BUD[2027 Budget]
    CORP[Platform Corporations] -->|Regulatory Capture| DMA
```
