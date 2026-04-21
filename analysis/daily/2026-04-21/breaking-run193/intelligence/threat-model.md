---
articleType: breaking
runId: 193
date: 2026-04-21
---

# 🛡️ Threat Model — Run 193 (2026-04-21)

![Threat Level](https://img.shields.io/badge/Threat_Level-MEDIUM-orange)
![Stability](https://img.shields.io/badge/Stability-87%2F100-green)

## STRIDE Threat Analysis for EU Parliament (April 2026)

### T1: Trade War Escalation Disrupting Legislative Calendar
- **Likelihood**: 3/5 (Possible, 21-40%)
- **Impact**: 4/5 (Major — emergency legislative procedure)
- **Score**: 12/25 (MEDIUM)
- **Evidence**: Trump's April 2 "Liberation Day" tariffs triggered EU counter-tariff consultation. Parliament adopted anti-tariff texts March 26. If US escalates post-90-day pause, emergency legislative session would disrupt April 27-30 agenda. 🟡 MEDIUM confidence.
- **Mitigation**: March 26 texts (TA-0097, TA-0096) provide Commission the legal toolkit to respond without emergency legislative procedure. The tariff non-application instrument is already in force.

### T2: EP API Outage Extending Beyond Parliament Return (April 27)
- **Likelihood**: 2/5 (Unlikely, 5-20%; now 28% probability from Run 193 update)
- **Impact**: 3/5 (Significant — delayed public access to legislative records)
- **Score**: 6/25 (LOW-MEDIUM)
- **Evidence**: Phase 2 began today but bodies still 404. If restoration extends beyond April 27, the first post-recess plenary votes will be conducted without the standard public roll-call publication accompanying them. This creates a transparency deficit at a politically sensitive moment. 🟢 HIGH confidence.
- **Mitigation**: EP Communications team has existing protocols for delayed publication. Offline access via EU Monitor (external service) remains available.

### T3: ECR Coalition Fracture — Braun Immunity Fallout
- **Likelihood**: 2/5 (Unlikely, 5-20%)
- **Impact**: 3/5 (Significant — realignment of 81-seat group)
- **Score**: 6/25 (LOW-MEDIUM)
- **Evidence**: The adoption of two separate Braun immunity waivers (TA-0087, TA-0088) on March 26 exposes the ECR to increasing pressure over its extreme-right members. With Braun facing multiple criminal proceedings in Poland, ECR leadership (Adam Bielan) must decide whether to distance the group or continue tolerating the political cost. If Braun is expelled or withdraws, ECR may also lose other far-right Polish members. 🟡 MEDIUM confidence.
- **Mitigation**: ECR has previously survived similar controversies (see MEP conduct scandals EP9). The group's cohesion is driven by shared euroscepticism rather than personal loyalty to individual members.

### T4: Banking Union Reform Implementation Risk
- **Likelihood**: 3/5 (Possible)
- **Impact**: 3/5 (Significant — financial stability)
- **Score**: 9/25 (MEDIUM)
- **Evidence**: DGSD2 and BRRD3 adoption on March 26 triggers a 2-year transposition deadline for member states. Given the concurrent trade war stress on financial markets (import-dependent sectors, supply chain disruption, currency volatility), the timing between legislative adoption and implementation is compressed. Slower transposers (Italy, Hungary) may face infringement risk. 🟡 MEDIUM confidence.

### T5: USTR Section 301 Trigger — AI Act Compliance Risk
- **Likelihood**: 2/5 (Unlikely; 20% probability)
- **Impact**: 4/5 (Major — US market access for EU tech companies, WTO dispute)
- **Score**: 8/25 (MEDIUM)
- **Evidence**: If USTR formally opens a Section 301 investigation into the EU AI Act (citing US tech company compliance burden), the Digital Omnibus AI simplification (TA-0098) adopted March 26 would need to be reassessed. The text was designed to simplify AI Act compliance for companies already subject to harmonised rules — but US negotiators might argue it still discriminates against non-EU AI providers. 🔴 LOW confidence (speculative scenario based on USTR interest).

## Correlated Threat Clusters

**Cluster A (Trade-Financial)**: T1 (trade escalation) + T4 (banking implementation) — a trade war shock that triggers financial market stress simultaneously tests both the EU's trade response toolkit AND the banking resolution framework adopted March 26. This is the highest-severity correlated risk.

**Cluster B (Transparency-Governance)**: T2 (API outage) + T3 (Braun fallout) — if the API remains down when Braun proceedings advance, public scrutiny of how Parliament handled the immunity waivers is reduced. This creates a perception risk even if both are unrelated technically.
