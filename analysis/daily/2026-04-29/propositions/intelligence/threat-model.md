<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Threat Model — EU Parliament Propositions
**Date:** 2026-04-29 | **Session:** Strasbourg April 28–29, 2026

## Framework: CIA Threat Assessment (5 frameworks)

### Framework 1: STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation)
Applied to EP democratic process integrity threats.

| Threat | Vector | Likelihood | Impact |
|--------|--------|-----------|--------|
| **S** Spoofing (disinformation) | PfE/ESN campaigns misrepresenting legislative content | 🔴 HIGH | 🟠 Medium (affects public legitimacy) |
| **T** Tampering (procedural obstruction) | Filibuster, amendment flooding on MFF vote | 🟡 MEDIUM | 🟠 Medium |
| **R** Repudiation (immunity abuse) | MEPs claiming immunity to avoid accountability | 🟢 LOW (waiver process working) | 🟡 Low |
| **I** Information Disclosure (premature leak) | Council/EP position leaks during MFF trilogue | 🟡 MEDIUM | 🟡 Low-Medium |
| **D** Denial of Service (political) | Blocking minority formation on budget | 🟡 MEDIUM | 🔴 HIGH |
| **E** Elevation (institutional overreach) | Commission challenging Rule 135 amendment | 🟢 LOW | 🟡 Medium |

### Framework 2: PASTA (Process for Attack Simulation and Threat Analysis)
Applied to legislative pipeline health threats.

**Stage 1 — Define Objectives:** Secure adoption of MFF 2028-2034, GSP reform, social legislation, animal welfare regulation.

**Stage 2 — Define Technical Scope:** EP plenary, BUDG/INTA/AGRI/JURI committees, Council, Commission.

**Stage 3 — Application Decomposition:** Procedure lifecycle (Commission proposal → committee → plenary → trilogue → adoption).

**Stage 4 — Threat Analysis:**
- Procedural delay: Referral back to committee on MFF if grand coalition fractures
- Substantive weakening: Council trilogue dilutes GSP conditionality
- Political blockage: Member state opposition prevents consent-based rape directive

**Stage 5 — Vulnerability and Weakness Analysis:**
- EP's MFF position lacks binding force until first reading vote (late 2027)
- EP coalition on social legislation is fragile (requires EPP liberal wing)
- Rule of Law conditionality has been weakened by CJEU interpretation in 2024-2025

**Stage 6 — Attack Enumeration:**
- Hungary/Poland Council blocking minority on Rule of Law conditionality in MFF
- EPP conservative faction defecting from consent legislation majority
- US trade pressure forcing INTA committee to compromise on GSP conditionality

**Stage 7 — Risk and Impact Analysis:**
- MFF stall: 55% probability → +12-18 month delay in EU programme implementation
- Social legislation block: 40% probability → symbolic victory only
- GSP weakening: 25% probability → reduced human rights leverage

### Framework 3: Attack Trees
Key attack paths against EP10 legislative agenda.

```
[Goal: Block MFF 2028-2034 high-ambition outcome]
├── Fracture EPP internally on defence spending
│   ├── Eastern EPP (Poland/Hungary) demand higher defence envelope
│   └── German EPP demand lower headline ceiling
├── Build Council blocking minority (Netherlands + Sweden + Denmark + Austria)
│   └── Frame MFF ceiling as exceeding net contributor capacity
└── Invoke BVerfG challenge on off-budget defence instrument
    └── Legal delay creates political vacuum; Council defaults to lower ceiling
```

**Assessment:** The attack tree reveals that the most effective path to blocking EP's MFF ambition runs through Council, not through EP itself. The EP coalition is more stable than Council arithmetic.

### Framework 4: LINDDUN (Privacy/Linkability threat framework)
Applied to MEP data and parliamentary transparency.

- **Linkability threat:** MEP immunity waiver data linked to domestic criminal proceedings creates privacy risks for Polish/Romanian MEPs' families and associates (not an EP responsibility but a downstream risk from transparency)
- **Non-repudiation:** EP's roll-call vote publication system (delayed by 4-6 weeks) creates a repudiation window during which MEPs can deny voting positions — this reduces political accountability during the critical post-session news cycle
- **Recommended mitigation:** Accelerated roll-call publication (within 48 hours of session) — an ongoing AFCO committee reform discussion

### Framework 5: FAIR (Factor Analysis of Information Risk)
Applied to strategic intelligence risk.

| Asset | Threat Event | Threat Capability | Vulnerability | Loss Magnitude |
|-------|-------------|-----------------|--------------|----------------|
| EP MFF position | Council undermining | HIGH (QMV blocking) | MEDIUM (EP position not yet binding) | HIGH (programme delays, funding gaps) |
| GSP conditionality | Lobbying by beneficiary governments | MEDIUM | LOW (strong EP consensus) | MEDIUM (reduced human rights leverage) |
| EP democratic legitimacy | Disinformation about legislative outcomes | HIGH (PfE/ESN capacity) | MEDIUM (public awareness low) | MEDIUM (electoral accountability impact) |

## Aggregate Threat Level: 🟡 ELEVATED

The dominant threat to the propositions agenda is not external interference or procedural obstruction but the structural challenge of maintaining the EP's high-ambition MFF position through 18+ months of negotiations with a Council that has strong fiscal hawks (Germany, Netherlands, Sweden) and a Commission under pressure from multiple competing priorities. The immunity waivers, animal welfare, and social resolutions face lower threat levels but signal EP's commitment to maintaining the full scope of its institutional agenda.

*Source: Structural analysis | EP Open Data Portal | Run: propositions-run-1777442543 | 2026-04-29*
