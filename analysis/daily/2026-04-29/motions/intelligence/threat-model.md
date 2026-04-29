<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🕵️ Threat Model
## EP Motions — April 28, 2026 | EP Democratic Integrity

**Classification:** PUBLIC | **Article Type:** motions | **Run Date:** 2026-04-29
**Methodology:** STRIDE threat model adapted for political/institutional context; CIA threat taxonomy

---

## 1. Threat Model Scope

**Protected assets:**
- EP institutional independence (immunity, legislative autonomy)
- EU rule-of-law mechanisms (conditionality, Article 7, JURI process)
- Media pluralism in EU member states
- EP transparency and accountability processes
- Citizens' access to democratic information

**Threat actors:**
- Authoritarian-populist domestic political movements (PiS, PfE-aligned parties)
- External state actors seeking to weaken EU institutions (Russia, China — indirect)
- Capture actors (media owners, corporate interests aligned with political power)
- Far-right extremist networks (in EP and national parliaments)

---

## 2. STRIDE Threat Analysis

### Spoofing (Identity/Authority)

**T-SPO-01: ECR "Rule of Law" Narrative Capture (MEDIUM)**
Threat: ECR/PfE actors reframe the Jaki/Obajtek immunity cases as "political persecution," spoofing the rule-of-law narrative to undermine genuine rule-of-law enforcement.
- Likelihood: HIGH (80%+ — ECR leadership already uses this framing)
- Impact: MEDIUM (erodes public understanding of rule-of-law; may affect domestic politics in Poland/Romania)
- Mitigation: Clear EP JURI committee communication on legal basis for waivers; Venice Commission engagement

**T-SPO-02: False Equivalence — EU Rule of Law vs. National Sovereignty (MEDIUM)**
Threat: Actors conflate EU rule-of-law monitoring with sovereignty infringement, spoofing EP's role as a neutral arbiter.
- Likelihood: HIGH
- Impact: MEDIUM — reduces EP's soft-power influence
- Mitigation: Consistent messaging; Commission annual rule-of-law reports; ECJ case law citation

---

### Tampering (Data/Process)

**T-TAM-01: Roll-Call Vote Data Integrity (LOW)**
Threat: Technical tampering with EP roll-call vote publication systems to delay, modify, or suppress inconvenient voting records.
- Likelihood: LOW (EP IT systems are robust; political motivation to tamper is higher than technical capability)
- Impact: HIGH (if vote records were suppressed, accountability gap is severe)
- Mitigation: Multiple official record sources; Oeil/EP portal redundancy; civil society verification

**T-TAM-02: JURI Committee Process Manipulation (LOW)**
Threat: Political actors attempt to influence JURI committee composition or procedure to prevent immunity waivers from reaching plenary.
- Likelihood: LOW (JURI has established legal procedure; plenary override possible)
- Impact: HIGH if successful
- Mitigation: Transparent JURI procedure; independent legal assessment; EP Rules of Procedure (Art. 8-10)

---

### Repudiation (Non-accountability)

**T-REP-01: MEP Non-Accountability via Immunity Abuse (HIGH)**
Threat: MEPs use EP immunity systematically to avoid accountability for pre-mandate actions, with groups protecting colleagues from legitimate prosecution.
- Likelihood: MEDIUM-HIGH (has occurred historically; Obajtek/Jaki cases are current examples)
- Impact: HIGH — institutional legitimacy damage
- Mitigation: JURI's active waiver process; clear fumus persecutionis standard; EP Rules of Procedure reform if abuse patterns persist
- **Current status:** April 28 demonstrates mitigation is WORKING — four waivers adopted

**T-REP-02: Diplomatic Non-Accountability (MEDIUM)**
Threat: Member states avoid implementing CJEU judgments or Commission rule-of-law recommendations using diplomatic immunity-equivalent political cover.
- Likelihood: MEDIUM (Hungary, historically Poland)
- Impact: HIGH — erodes EU legal supremacy
- Mitigation: Financial conditionality; Article 7 proceedings; Article 260 TFEU infringement sanctions

---

### Information Disclosure

**T-INF-01: EP Voting Opacity (CONFIRMED — STRUCTURAL FLAW)**
Threat: EP's 4–6 week delay in publishing roll-call vote data creates an extended information blackout on how MEPs voted.
- Likelihood: CERTAIN (structural)
- Impact: MEDIUM — accountability gap; analysts and voters cannot assess MEP voting behaviour in real time
- Mitigation: Technical upgrade to same-day publication; EP Rules of Procedure amendment
- **Status:** 🔴 ACTIVE THREAT — needs structural remedy

**T-INF-02: State Media Capture Information Distortion (HIGH)**
Threat: State-captured media (as with Polska Press/PiS model) creates systematic information distortion in affected member states, undermining informed democratic participation.
- Likelihood: ONGOING in Hungary (Fidesz-controlled media); being remedied in Poland (post-Obajtek)
- Impact: CRITICAL — democracy requires informed citizenry
- Mitigation: EU media pluralism monitoring; DSA media provisions; EP pressure on Commission to enforce; Obajtek prosecution as deterrent

---

### Denial of Service

**T-DOS-01: Legislative Obstruction via Minority Blocking (MEDIUM)**
Threat: ECR+PfE+ESN far-right bloc (193 seats) systematically attempts to delay or block EP legislative majority through procedural motions, filibustering, and committee blocking.
- Likelihood: MEDIUM-HIGH (standard opposition tactics)
- Impact: LOW-MEDIUM (grand coalition majority still functional; procedural delays are manageable)
- Mitigation: EP majority procedures; time allocation rules; conference of presidents oversight

**T-DOS-02: safeoutputs MCP Session TTL (OPERATIONAL THREAT)**
Threat: Safeoutputs MCP server session TTL (~28–30 min) causes workflow runs to lose the PR creation call if analysis phases run too long.
- Likelihood: HIGH (demonstrated in run #24963129839)
- Impact: HIGH — entire run output lost; no PR created
- Mitigation: Strict time budgets; minute-22 ANALYSIS_ONLY tripwire; PR call by minute ≤25

---

### Elevation of Privilege

**T-EOP-01: Immunity as Privilege Escalation (CONFIRMED — MITIGATED)**
Threat: MEPs use parliamentary immunity as privilege escalation to avoid criminal accountability available to all citizens.
- Likelihood: CONFIRMED (Jaki, Obajtek, Şoşoacă cases)
- Impact: HIGH — rule-of-law erosion
- Mitigation: 🟢 ACTIVE — JURI committee process is functioning; April 28 waivers demonstrate mitigation working

**T-EOP-02: State Corporate Power for Political Ends (HIGH)**
Threat: State-owned enterprises (SOEs) used as instruments of political power — media acquisitions (Orlen/Polska Press), political appointments, politically motivated contracts.
- Likelihood: HIGH in certain member states (Poland 2015-2023 proven; Hungary ongoing; Romania intermittent)
- Impact: CRITICAL — SOEs represent trillion-euro assets; political weaponisation distorts EU single market and democratic competition
- Mitigation: EU SOE transparency directive; DG COMP state aid enforcement; corporate governance reforms; Obajtek prosecution as deterrent

---

## 3. Threat Priority Matrix

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#B71C1C","primaryTextColor":"#ffffff","lineColor":"#EF9A9A"}}}%%
quadrantChart
    title Threat Priority Matrix
    x-axis Low Likelihood --> High Likelihood
    y-axis Low Impact --> High Impact
    quadrant-1 Critical
    quadrant-2 Monitor and Mitigate
    quadrant-3 Accept
    quadrant-4 Prevent
    "State media capture (T-INF-02)": [0.8, 0.9]
    "Voting opacity (T-INF-01)": [1.0, 0.65]
    "SOE power abuse (T-EOP-02)": [0.7, 0.85]
    "MEP immunity abuse (T-REP-01)": [0.65, 0.8]
    "ECR narrative capture (T-SPO-01)": [0.85, 0.5]
    "Legislative obstruction (T-DOS-01)": [0.75, 0.4]
    "JURI manipulation (T-TAM-02)": [0.2, 0.85]
```

---

## 4. Threat Mitigation Effectiveness

| Threat | Severity | Mitigation | Effectiveness | Residual Risk |
|--------|---------|-----------|--------------|--------------|
| State media capture | 🔴 CRITICAL | Immunity waivers + prosecution | 🟡 PARTIAL | 🟠 HIGH |
| Voting opacity | 🟠 HIGH | None (structural) | 🔴 NONE | 🟠 HIGH |
| SOE power abuse | 🔴 CRITICAL | Prosecution + SOE governance | 🟡 PARTIAL | 🟠 HIGH |
| MEP immunity abuse | 🟠 HIGH | JURI process (ACTIVE) | 🟢 GOOD | 🟡 MEDIUM |
| ECR narrative capture | 🟡 MEDIUM | Institutional messaging | 🟡 PARTIAL | 🟡 MEDIUM |
| Legislative obstruction | 🟡 MEDIUM | Coalition majority | 🟢 GOOD | 🟡 LOW |
| JURI manipulation | 🟠 HIGH | Rules of Procedure | 🟢 GOOD | 🟢 LOW |

---

## 5. Key Threat Observations

**Highest priority threats needing structural remedy:**
1. **Voting opacity** (T-INF-01) — structural technology/governance flaw with no current mitigation
2. **State media capture** (T-INF-02) — Obajtek prosecution is the primary deterrent; effectiveness uncertain pending trial outcome
3. **SOE political weaponisation** (T-EOP-02) — needs EU-level SOE governance directive; currently only national-level remedies available

**Threats where EP is actively mitigating successfully:**
- MEP immunity abuse via JURI process (April 28 waivers demonstrate working mitigation)
- Legislative obstruction via stable grand coalition majority

**Confidence:** 🟡 MEDIUM overall; exact threat probability calibration requires more data
