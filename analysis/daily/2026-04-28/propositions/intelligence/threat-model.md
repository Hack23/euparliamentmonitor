<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Threat Model — EU Parliament Propositions
## April 28, 2026 | Legislative Threat Assessment

**Admiralty Grade:** B2 | **WEP Bands Applied** | **Run Date:** 2026-04-28

---

## 1. Threat Framing

This threat model identifies actors, dynamics, and conditions that could disrupt or significantly alter the EU legislative agenda as visible from the EP propositions dataset (April 2026). Threats are assessed at the legislative (not security) level — i.e., risks to the Parliament's ability to deliver its legislative agenda and maintain institutional integrity.

---

## 2. Threat Category 1 — Institutional Cohesion Threats

### T1.1: EPP Coalition Fragmentation

**Threat description**: The EPP's ability to build majorities depends on shifting alliances that may fracture under pressure. If EPP must simultaneously satisfy ECR/PfE (on migration) and S&D/Renew (on climate/budget), the resulting internal contradictions could paralyse key committees and produce gridlock on cross-cutting files.

**WEP Assessment**: 30–40% (Equiprobable) that at least one major file is delayed 3+ months due to EPP coalition indecision in H2 2026.

**Indicators**: 
- 🟡 Early warning system raised DOMINANT_GROUP_RISK flag in current run
- High fragmentation index (9 groups, no group above 37.5%)
- Historical: no EP term has completed without at least one major coalition realignment

### T1.2: Voting Boycott / Quorum Crisis

**Threat description**: Far-right groups (PfE/ESN) could use quorum rules strategically — refusing to participate in votes where they lack a blocking majority — forcing postponement of key decisions.

**WEP Assessment**: 15–20% (Unlikely) for a sustained quorum strategy; 50–60% that incidental quorum failures delay at least one vote.

**Indicators**:
- 🔴 Early warning system raised small group quorum risk flag
- Current EP has 9 groups; smallest groups (ESN=2 in sample) could be weaponised

---

## 3. Threat Category 2 — External Political Threats

### T2.1: US-EU Trade War Escalation

**Threat description**: The current US tariff dispute (EU retaliation authorised, TA-10-2026-0096) could escalate into a comprehensive trade war that forces emergency EP legislative sessions and disrupts the normal work programme.

**WEP Assessment**: 25–35% (Unlikely) that trade dispute escalates to the point of requiring emergency EP action in H2 2026; 65–75% that current tensions persist without full resolution.

**Impact if materialises**:
- Emergency EP session on trade measures
- Disruption to planned legislative calendar
- Agriculture sector retaliation measures requiring fast-track adoption

### T2.2: Eastern European Security Escalation

**Threat description**: Deterioration of security situation on EU's eastern border (Ukraine conflict, Moldova, Georgia) could trigger emergency EP responses that crowd out planned legislative activity.

**WEP Assessment**: 20–30% (Unlikely) that security events require EP emergency response in H2 2026; but 55–65% that Ukraine support financing will require at least one additional EP vote.

**Indicators**:
- Ukraine Support Loan (TA-10-2026-0035) already adopted — suggests ongoing financial support pipeline
- Polish Presidency has defence as top priority
- EU-NATO coordination increasingly institutionalised

---

## 4. Threat Category 3 — Legislative Process Threats

### T3.1: Court of Justice (CJEU) Judicial Review

**Threat description**: Multiple recently adopted texts face potential CJEU challenge:
- **Safe Countries of Origin regulation**: Hungary and Poland may have standing to challenge; civil society organisations likely to challenge via national courts
- **AI Act Omnibus**: Risk categorisation could be challenged by affected industry
- **Banking Union DGSD2**: Extension to payment institutions faces legal uncertainty under deposit guarantee directive framework

**WEP Assessment**: 50–60% (Probable) that at least one Q1 2026 text faces formal CJEU challenge within 18 months.

**Impact**: CJEU annulment/limitation would force Commission re-proposal; legislative gap while remedy legislation processed (typically 18–36 months).

### T3.2: Council Blocking Minority on Implementing Acts

**Threat description**: For legislation adopted by qualified majority in Council, implementing acts (requiring same QMV) can fail if a blocking minority of member states opposes specific regulatory choices.

**WEP Assessment**: 40–50% (Equiprobable) that Banking Union Level 2 implementing acts face significant Council resistance from at least one member state bloc.

**Indicators**:
- Italy sensitive to UniCredit/banking sector implications of SRMR3
- Hungary consistently opposes financial integration measures
- Central/Eastern European states resistant to higher MREL requirements for their banks

---

## 5. Threat Category 4 — Data and Intelligence Threats

### T4.1: EP Open Data Portal Reliability

**Threat description**: The procedures feed is in RECESS_MODE — returning 1972–1990 historical data only. This limits the ability of automated monitoring systems to track active procedures in real time.

**WEP Assessment**: 85–90% (Highly Probable) that the procedures feed continues in RECESS_MODE through the next 14 days based on historical inter-session pattern.

**Impact on analysis quality**: 🔴 HIGH — the primary data source for procedure tracking is unavailable. Analysis based on adopted texts (lagging indicator) rather than active procedures (leading indicator).

**Mitigation applied**: Direct `/adopted-texts` endpoint provides comprehensive record of completed legislation; parliamentary questions feed provides some forward-looking signals.

### T4.2: Voting Record Publication Delay

**Threat description**: EP publishes roll-call voting data with 4–6 week delay. No voting data available for March–April 2026, making it impossible to assess MEP-level voting patterns or group discipline for recent major votes.

**WEP Assessment**: 95% that voting data for March 26, 2026 Banking Union votes will not be available via API until late May 2026.

**Impact**: Cannot verify coalition stability claims with voting evidence; relying on group position analysis (less reliable than voting data).

---

## 6. Threat Summary Matrix

| Threat | Probability | Impact | Priority |
|--------|------------|--------|----------|
| T1.1: EPP coalition fragmentation | 30–40% | HIGH | 🔴 Monitor |
| T1.2: Quorum crisis | 50–60% (single vote) | LOW-MEDIUM | 🟡 Watch |
| T2.1: US-EU trade escalation | 25–35% | HIGH | 🔴 Monitor |
| T2.2: Eastern security escalation | 55–65% (Ukraine financing) | MEDIUM | 🟡 Watch |
| T3.1: CJEU judicial review | 50–60% | HIGH | 🔴 Monitor |
| T3.2: Council blocking minority | 40–50% | MEDIUM | 🟡 Watch |
| T4.1: Data portal reliability | 85–90% | LOW (intelligence quality) | 🟢 Known |
| T4.2: Voting delay | 95% | LOW (intelligence quality) | 🟢 Known |

**Overall legislative environment threat level**: 🟡 MEDIUM  
*Institutional threats are real but manageable; no single-point failure risk visible in current data.*

---

*Generated: 2026-04-28 | propositions-run-1777356258*
