<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Threat Model — EU Parliament Propositions 2026-05-01

**Framework:** MITRE ATT&CK (adapted for legislative/political context) | Cyber Threat Intelligence + Political Threat Matrix  
**Scope:** Threats to EP legislative agenda and EU governance from April 28–30 plenary outputs  
**WEP bands:** Worded Estimate of Probability applied throughout  

---

## THREAT CATEGORY 1: LEGISLATIVE IMPLEMENTATION THREATS

### TH-01: Anti-Corruption Regulation Capture Risk

**Threat Actor:** Corrupt incumbent elites in member states with weak rule-of-law environments  
**Mechanism:** Transposition legislation drafted to technically comply while functionally neutralising enforcement:  
- Narrow prosecutorial discretion definitions that limit when charges can be brought  
- Asset recovery procedures requiring evidentiary standards higher than criminal conviction  
- Conflict-of-interest definitions with carve-outs for "customary political practices"

**WEP Assessment:** Likely (WEP 60%) that at least two member states adopt transposition legislation that the Commission's DG JUST assesses as non-compliant within 2 years of the transposition deadline.  
**Impact:** HIGH — undermines the regulation's core deterrence function in the countries where it matters most  
**Mitigation:** Commission early-warning review mechanism; GRECO monitoring; EP LIBE committee oversight hearings

### TH-02: DMA Enforcement Obstruction via Procedural Delay

**Threat Actor:** Large platform companies (designated gatekeepers) using legitimate legal channels to delay compliance  
**Mechanism:**  
- Extraordinary appeal to CJEU against Commission non-compliance decisions (suspensive effect if interim measures granted)  
- Technical compliance plans that meet the letter but not the spirit of DMA obligations  
- Lobbying for legislative revision to weaken remedies

**WEP Assessment:** Almost Certain (WEP 85%) that at least one gatekeeper will appeal any formal Commission non-compliance decision to the CJEU General Court, triggering 18–36 month review process.  
**Impact:** MEDIUM — delays effective enforcement but does not permanently block  
**Mitigation:** Commission request for interim measures pending appeal; parallel competition enforcement under TFEU Article 102

### TH-03: SRMR3 Gaming via Regulatory Arbitrage

**Threat Actor:** Banking institutions seeking to structure liabilities to minimise bail-in eligibility  
**Mechanism:**  
- Issuance of hybrid instruments with contractual features designed to complicate MREL classification  
- Cross-border restructuring to shift senior liabilities to jurisdictions with less stringent recognition of EU bail-in actions  
- Regulatory arbitrage between EU and UK post-Brexit frameworks on resolution financing

**WEP Assessment:** Possible (WEP 40%) that within 2 years, EBA identifies at least one institution with MREL structuring concerns under the new SRMR3 framework.  
**Impact:** MEDIUM — structured liabilities could increase actual resolution costs beyond SRF backstop  
**Mitigation:** EBA technical standards; resolution college review process; SRB supervisory engagement

---

## THREAT CATEGORY 2: POLITICAL SYSTEM THREATS

### TH-04: Coalition Fragmentation Risk in EP10

**Threat Actor:** PfE (Patriots for Europe) group — 85 MEPs, growth trajectory  
**Mechanism:**  
- Blocking minority formation on specific legislative files with PfE + ECR + potentially right-leaning EPP votes  
- Procedural obstruction (quorum challenges, referrals back to committee)  
- Selective de-cohabitation: PfE votes with the coalition on defence/security but against it on climate/social

**WEP Assessment:** Likely (WEP 65%) that at least one major piece of EP legislation (anticipated: Nature Restoration Law implementing rules, Digital Infrastructure Act, new EU fiscal rules) will fail to achieve majority within the next 6 months due to centre-right fragmentation.  
**Impact:** HIGH — PE10's policy output capacity is structurally more constrained than PE9  
**Mitigation:** EPP-S&D-Renew consolidation; selective ECR co-optation on specific votes; Greens/EFA as swing vote on technical matters

### TH-05: External Interference in EP Deliberations

**Threat Actor:** Russian state and Russian-aligned information operations  
**Mechanism:**  
- Amplification of PfE pro-Russia narratives through state media (RT via social media, Telegram channels)  
- Financial flows to MEP-aligned political foundations (an area of ongoing OLAF investigation)  
- Targeted disinformation campaigns timed to coincide with Ukraine urgency resolutions

**WEP Assessment:** Highly Likely (WEP 80%) that Russian state information operations will attempt to influence EP political discourse on Ukraine-related votes through at least one coordinated social media campaign within the next 6 months.  
**Impact:** MEDIUM — does not change vote outcomes in EP majorities but shapes political environment and public opinion in targeted member states  
**Mitigation:** EP Services cybersecurity measures; EEAS East StratCom Task Force; Meta/X cooperation under DSA transparency obligations

### TH-06: MEP Ethics and Corruption Vulnerabilities

**Threat Actor:** Foreign states (Qatar, Morocco, in the QatarGate precedent; now: Russia, Azerbaijan, China as assessed vectors) seeking to influence EP positions  
**Mechanism:**  
- Cash payments or in-kind benefits to MEPs or their assistants in exchange for votes, written questions, or procedural influence  
- Employment of MEP family members or associates in entities linked to foreign states  
- Funding of MEP study tours, conferences, or political foundations

**WEP Assessment:** Possible (WEP 35%) that at least one new MEP ethics investigation involving foreign-state influence (beyond QatarGate proceedings) is publicly announced in the next 6 months.  
**Impact:** CRITICAL — further ethics scandals would severely damage EP institutional legitimacy and public trust  
**Mitigation:** IPEX (Independent Ethics Body) — entered into force January 2024; Transparency Register enforcement; OLAF and EU anti-fraud co-investigation

---

## THREAT CATEGORY 3: IMPLEMENTATION COMPLEXITY THREATS

### TH-07: Interoperability Mandate Technical Failure

**Threat Actor:** Engineering complexity of DMA interoperability requirements  
**Mechanism:**  
- End-to-end encryption (E2EE) is technically incompatible with "dumb" message routing required for seamless interoperability with non-E2EE platforms  
- Key management architecture for cross-platform E2EE is an unsolved research problem at scale  
- WhatsApp/Signal's implementation of Matrix federation creates security surface expansion

**WEP Assessment:** Likely (WEP 65%) that at least one designated gatekeeper's interoperability implementation will be assessed as technically inadequate within 18 months of the DMA compliance deadline, requiring revised technical measures.  
**Impact:** MEDIUM — delays competition benefits of interoperability but does not permanently block  
**Mitigation:** DMA Article 7 expert group; ENISA standards development; Commission implementing act specifying technical formats

### TH-08: Beneficial Ownership Registry Incompleteness Undermining Anti-Corruption Enforcement

**Threat Actor:** Legal/structural gaps in EU beneficial ownership data architecture  
**Mechanism:**  
- EU-wide beneficial ownership data mandated under 4th and 5th AMLD remains incomplete in 8+ member states  
- Trust structures, foundations, and nominee arrangements not fully captured  
- Non-EU holding structures (particularly Channel Islands, UK since Brexit) provide opacity for assets subject to anti-corruption recovery

**WEP Assessment:** Likely (WEP 70%) that DG JUST's first annual anti-corruption implementation report (expected 12 months post-entry into force) will flag beneficial ownership data gaps as a primary implementation constraint.  
**Impact:** HIGH — limits asset recovery effectiveness, which is the regulation's most innovative enforcement tool  
**Mitigation:** AMLA (Anti-Money Laundering Authority, operational from 2025) can mandate data improvements; FATF pressure on member state registers

---

## THREAT MATRIX SUMMARY

| Threat ID | Actor | WEP | Impact | Priority |
|-----------|-------|-----|--------|----------|
| TH-01 | Corrupt elites (capture risk) | 60% | HIGH | 🔴 Critical |
| TH-05 | Russian information ops | 80% | MEDIUM | 🔴 High |
| TH-04 | PfE coalition fragmentation | 65% | HIGH | 🔴 High |
| TH-08 | Beneficial ownership gaps | 70% | HIGH | 🔴 High |
| TH-06 | MEP ethics/foreign corruption | 35% | CRITICAL | 🟡 Monitor |
| TH-02 | DMA legal appeals | 85% | MEDIUM | 🟡 Watch |
| TH-07 | Interoperability tech failure | 65% | MEDIUM | 🟡 Watch |
| TH-03 | SRMR3 regulatory arbitrage | 40% | MEDIUM | 🟢 Low |

**Admiralty Grade: B/2** — Well-established threat categories based on documented precedent; probability assessments reflect informed analyst judgment.
