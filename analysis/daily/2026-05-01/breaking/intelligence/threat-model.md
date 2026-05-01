<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Threat Model — EP Breaking: DMA Enforcement & Ukraine Accountability
**Date:** 2026-05-01 | **Article Type:** breaking | **Confidence:** 🟢 HIGH

---

## Threat Modeling Framework

This analysis applies the STRIDE-E threat modeling methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege, + Evasion) adapted for political/legislative threats, complemented by ATT&CK-inspired kill chain analysis for legislative and institutional threats.

**Scope:** Political and institutional threats to the implementation of EP's April 28–30 decisions, focusing on DMA enforcement (TA-10-2026-0160) and Ukraine accountability (TA-10-2026-0161).

---

## Threat Category 1: Regulatory Evasion (Tech Platforms)

### T1-A: DMA Compliance Theatre
**Actor:** Major tech platform operators (Apple, Google, Meta, Amazon, ByteDance, Microsoft)
**Threat type:** Evasion
**Description:** Platforms implement minimal-viable compliance measures that technically satisfy DMA letter while preserving economic effects of restricted competition.

**Attack vectors:**
- **V1:** Interoperability implemented with degraded UX (technically compliant but practically unusable)
- **V2:** Data portability offered but in proprietary format that requires conversion (friction = non-use)
- **V3:** Self-preferencing removed in search results but reintroduced through advertising placement (semantic gap in DMA Article 5)
- **V4:** Sideloading permitted but with warning screens calibrated to maximise fear/friction ("this app is from outside the App Store — your device may be compromised")

**Likelihood:** 🟢 HIGH (Apple has already deployed friction-maximising warning screens in preliminary implementation)
**Impact on EP resolution:** EP enforcement demand will face "but they technically complied" counterargument from Commission; weakens accountability narrative
**Mitigation available:** EP can demand stricter interpretation from Commission; refer to DMA Article 8 "effectiveness" standard

### T1-B: Regulatory Forum Shopping
**Actor:** Tech platforms' legal teams
**Threat type:** Evasion
**Description:** Simultaneous challenges in multiple jurisdictions to paralyse a single coherent enforcement action.

**Attack vectors:**
- Challenge DMA gatekeeper designation at CJEU (Apple ongoing)
- Parallel challenge in WTO on market access grounds
- National court challenges in member states with most tech-friendly judiciaries (Luxembourg, Germany)
- Lobbying parallel legislative processes (US Congress, UK CMA) to create contradictory regulatory requirements

**Likelihood:** 🟡 MEDIUM-HIGH (Apple already pursuing CJEU challenge)
**Timeframe:** 2–4 years for full legal resolution
**Mitigation:** Commission must seek interim enforcement measures pending CJEU ruling; EP should push for provisional application standard

---

## Threat Category 2: Political Obstruction (Institutional)

### T2-A: Council Blocking — Hungary Veto
**Actor:** Hungarian government (Viktor Orbán administration)
**Threat type:** Denial of Service (legislative)
**Description:** Hungary systematically blocks Council decisions requiring unanimity on Ukraine-related measures; uses QMV thresholds strategically to extract concessions.

**Attack vectors:**
- **V1:** Unanimity veto on asset recovery regulation (if categorised as requiring unanimous Council decision under TFEU Article 311)
- **V2:** Procedural challenges delaying Council vote scheduling
- **V3:** Conditional support ("horse-trading") — demanding removal of EU rule of law conditionalities on Hungarian cohesion funds in exchange for Ukraine support
- **V4:** Leaking negotiating positions to undermine EU credibility with Russia

**Likelihood:** 🟢 HIGH (Hungary has used all four vectors in 2022–2025)
**Impact on EP resolution:** EP's Ukraine accountability text formally endorsed; Council implementation blocked
**Mitigation:** Enhanced cooperation mechanism (Treaty Article 20); QMV reclassification of legal basis; EP can support Commission Article 7 TEU proceedings

### T2-B: Commission Dilution
**Actor:** European Commission (institutional risk)
**Threat type:** Tampering (normative)
**Description:** Commission interprets EP's DMA enforcement demand as non-binding political signal and proceeds at its own timetable, without incorporating EP's specific accountability milestones.

**Attack vectors:**
- Commission responds formally but generically to EP resolution (Rule 233 response lacks specific commitments)
- DG COMP cites "ongoing proceedings" to avoid disclosing enforcement timetable
- Commission Commissioner for Competition meets US tech companies' CEOs bilaterally; signals "proportionate enforcement"
- Commission uses "better regulation" framework to demand additional impact assessment before enforcement actions

**Likelihood:** 🟡 MEDIUM (Commission has historically been protective of enforcement autonomy)
**Impact on EP resolution:** EP enforcement demand effectively ignored institutionally
**Mitigation:** EP IMCO committee demands formal hearing with Commissioner on enforcement timetable; EP uses budgetary leverage (discharge power)

### T2-C: Interinstitutional Normative Contest
**Actor:** Commission/Council institutional complex
**Threat type:** Repudiation
**Description:** Council and Commission jointly repudiate EP's accountability demands as exceeding Parliament's treaty-based role in enforcement matters.

**Legal basis of threat:** DMA Article 26 obligates Commission to report to EP but does not grant EP co-decision or enforcement co-authority
**Likelihood:** 🔴 LOW as explicit action; 🟡 MEDIUM as passive non-compliance
**Mitigation:** EP can use its budgetary discharge powers; Rule 233 parliamentary questions; holding hearings to publicly shame non-compliance

---

## Threat Category 3: Foreign State Actors

### T3-A: Russian Information Operations Against EP Accountability Framework
**Actor:** Russian state actors (FSB, GRU information operations)
**Threat type:** Spoofing / Information Disclosure (disinformation)
**Description:** Russia conducts information operations to undermine EU public support for Ukraine accountability framework and weaken EP political consensus.

**Attack vectors:**
- **V1:** Amplify EU "peace party" voices (PfE, ESN, useful idiots in ECR) through social media coordination
- **V2:** Leak selective documents showing EU financial benefits from frozen asset management to suggest improper motives
- **V3:** Sponsor academic/think tank analysis questioning legal basis of asset seizure
- **V4:** Target MEPs with personalised influence operations (documented tactic in 2024 elections)

**Likelihood:** 🟢 HIGH (Russia has ongoing documented information operations targeting EU institutions)
**Impact on EP resolution:** Gradual erosion of political consensus; creates narrative that EP acted illegally or improperly
**Mitigation:** EP's ENCO (European Parliament European Network of Contact Points) + EDMO (European Digital Media Observatory) fact-checking; EP security services (CERT-EU)

### T3-B: Chinese Regulatory Arbitrage on DMA
**Actor:** Chinese tech companies (ByteDance/TikTok, Alibaba/AliExpress)
**Threat type:** Evasion
**Description:** Chinese-headquartered gatekeepers exploit diplomatic dynamics (EU-China trade relationship management) to receive less aggressive enforcement than US counterparts.

**Attack vectors:**
- EU-China Trade and Investment negotiations create diplomatic soft-pressure on enforcement sequence
- Chinese government implies consequences for EU companies' market access in China if DMA enforcement prioritises Chinese platforms
- Commission risk-weights DMA enforcement sequence to avoid EU-China trade escalation

**Likelihood:** 🟡 MEDIUM (TikTok already receiving distinct treatment from Meta/Google in some respects)
**Impact:** "DMA = anti-US regulation in disguise" narrative undermined; but creates perception of selective enforcement
**Mitigation:** Commission must publicly commit to technology-neutral enforcement sequence

### T3-C: US Executive Pressure on DMA Enforcement Sequencing
**Actor:** US administration (executive branch)
**Threat type:** Elevation of Privilege (diplomatic)
**Description:** US administration uses executive-level diplomatic pressure to influence Commission's enforcement prioritisation, suggesting US platform fines would be treated as trade barriers.

**Attack vectors:**
- US Trade Representative issues formal "Section 301 review" of DMA enforcement
- US-EU TTC agenda dominated by DMA enforcement discussions; Commission signals accommodation
- US executive memos categorise DMA fines as elements of "unfair trade practices"
- US Secretary of State calls EU High Representative to raise DMA enforcement concerns

**Likelihood:** 🟡 MEDIUM-HIGH (consistent with new US administration's posture on European tech regulation)
**Mitigation:** EP resolution creates domestic EU political cost for Commission to accommodate US pressure; EP INTA committee to monitor

---

## Threat Category 4: Procedural and Legal Threats

### T4-A: DMA Legal Uncertainty Loophole Exploitation
**Actor:** Platform legal teams + compliant academic voices
**Threat type:** Spoofing (normative)
**Description:** "Grey zone" interpretations of DMA obligations proliferate, allowing platforms to claim compliance while avoiding substantive change.

**Attack vectors:**
- DMA "effectiveness" standard (Article 8) interpreted narrowly — only technical compliance required
- "Justification" mechanism (Article 8(3)) weaponised: platforms provide lengthy but unacceptable justification documents to delay enforcement
- DMA Article 12 interoperability implementation plans submitted late with intentional incompleteness

**Likelihood:** 🟢 HIGH (already observed in preliminary implementation phase)
**Mitigation:** Commission must adopt stricter "outcome-based" effectiveness standard; EP oversight of enforcement methodology

### T4-B: Asset Recovery Legal Challenges — Sovereignty Arguments
**Actor:** Russia (through legal representatives), sympathetic international law scholars
**Threat type:** Repudiation
**Description:** Russia mounts parallel international legal challenge to windfall profits transfer and any principal confiscation, using international law sovereignty arguments to create legal uncertainty.

**Attack vectors:**
- Vienna Convention argument: state property immune from confiscation under international law
- Bilateral investment treaty (BIT) claims by Russian state enterprises
- Permanent Court of Arbitration (PCA) procedural challenge
- Third-party states (China, India, Turkey) issue statements supporting Russian sovereignty arguments — eroding international legal consensus

**Likelihood:** 🟢 HIGH (already in progress — Russian legal teams actively pursuing multiple venues)
**Impact on EP resolution:** Legal uncertainty creates political space for EU member states to delay asset confiscation pending "legal clarity"
**Mitigation:** EP resolution calls for CJEU advisory opinion to provide EU legal certainty; strengthen ICC cooperation

---

## Threat Priority Matrix

| Threat | Likelihood | Impact | Priority | Recommended Response |
|--------|-----------|--------|----------|---------------------|
| T1-A: DMA compliance theatre | HIGH | HIGH | 🔴 CRITICAL | EP demand outcome-based effectiveness standard |
| T2-A: Hungary Council veto | HIGH | HIGH | 🔴 CRITICAL | Enhanced cooperation mechanism; Article 7 proceedings |
| T3-A: Russian info ops | HIGH | MEDIUM | 🔴 HIGH | EDMO + CERT-EU activation; MEP security briefings |
| T3-C: US pressure on DMA | MEDIUM-HIGH | HIGH | 🟡 HIGH | EP resolution provides domestic political cost |
| T2-B: Commission dilution | MEDIUM | HIGH | 🟡 HIGH | IMCO committee oversight; Rule 233 questions |
| T4-B: Asset seizure legal challenges | HIGH | MEDIUM | 🟡 HIGH | CJEU advisory opinion; ICC cooperation |
| T1-B: Forum shopping | MEDIUM-HIGH | MEDIUM | 🟡 MEDIUM | Commission interim enforcement measures |
| T3-B: China DMA arbitrage | MEDIUM | MEDIUM | 🟡 MEDIUM | Technology-neutral enforcement sequencing |
| T4-A: DMA legal loophole | HIGH | MEDIUM | 🟡 MEDIUM | Outcome-based effectiveness standard |
| T2-C: Interinstitutional repudiation | LOW | HIGH | 🟢 MEDIUM | Budgetary leverage; discharge power |

---

## Data Sources & Provenance

| Source | Tool | Date | Admiralty Grade |
|--------|------|------|-----------------|
| EP Adopted Texts | european-parliament-get_adopted_texts | 2026-05-01 | A1 |
| Coalition Dynamics | european-parliament-analyze_coalition_dynamics | 2026-05-01 | A1 |
| Political Landscape | european-parliament-generate_political_landscape | 2026-05-01 | A1 |
| EP10 Statistics | european-parliament-get_all_generated_stats | 2026-04-27 | A1 |
