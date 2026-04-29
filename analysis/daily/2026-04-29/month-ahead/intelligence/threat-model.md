<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Political Threat Model — EU Parliament: April 29 – May 29, 2026

**Framework:** Political Threat Framework v4.0 — 5-framework integrated approach
*(NOT STRIDE/DREAD/PASTA — those are software security frameworks, rejected for political analysis)*

**Threat frameworks applied:**
1. Political Threat Landscape (6-dimension model)
2. Attack Trees (goal decomposition)
3. Political Kill Chain (7-stage threat progression)
4. Diamond Model (adversary/capability/infrastructure/victim)
5. Threat Actor Profiling (ICO: Intent × Capability × Opportunity)

---

## 1. Political Threat Landscape (6-Dimension Model)

### Dimension 1: Coalition Shifts 🟡 MEDIUM

**Threat:** EPP's inability to maintain consistent multi-group coalitions leads to legislative gridlock on key files in the May session.

**Current state:** The EP10 requires minimum 3-group coalitions for every majority. EPP (185) + S&D (135) + Renew (77) = 397 seats — a sufficient majority. But this coalition is unstable on specific files where S&D and Renew diverge (e.g., on fiscal consolidation intensity, where Renew is more hawkish; on workers' rights, where S&D is more interventionist).

**Active indicators:**
- Budget 2027 guidelines adopted April 28 suggests coalition can align on fiscal frames
- US tariff response adopted March 26 with broad support — coalition is functional
- SRMR3 adoption March 26 demonstrates technical consensus capacity

**Severity:** MEDIUM — structural fragmentation (fragmentation index 6.59) creates friction but not paralysis.

### Dimension 2: Transparency Deficit 🟡 MEDIUM

**Threat:** Decision-making on Budget 2027 framework and US-EU trade response increasingly shifts to informal trilogue processes and Commission-Council bilaterals, reducing EP's legislative oversight role.

**Current state:** The EP's Budget Guidelines (TA-10-2026-0112) establish its position but Council's response will be determined in negotiations where transparency is lower. The TA-10-2026-0096 tariff adjustment was adopted under delegated procedure provisions that limit EP visibility.

**Severity:** MEDIUM — procedural, not acute.

### Dimension 3: Policy Reversal 🟡 MEDIUM

**Threat:** Progress on Clean Industrial Deal, housing crisis response, and anti-corruption measures could be reversed by future Council blocking minority or member state non-transposition.

**Current state:** All recently adopted texts require member state transposition (e.g., anti-corruption directive) or Commission implementing acts (AI Act, CID measures). The risk is "legislative adoption without implementation" — a persistent EU governance challenge.

**Severity:** MEDIUM for the 30-day window (no immediate reversal expected); HIGH over 12-month horizon.

### Dimension 4: Institutional Pressure 🟢 LOW–MEDIUM

**Threat:** The ECB, Commission, or Council exert pressure on EP to modify its positions on banking regulation (SRMR3 implementation) or fiscal policy (Budget 2027).

**Current state:** The ECB Vice-President appointment (TA-10-2026-0060, TA-10-2026-0033) was uncontroversial — no indication of significant EP-ECB tension. The Commission-EP relationship on trade is managed through Art. 218(10) consultation; no acute conflict.

**Severity:** LOW — institutional relationships appear functional.

### Dimension 5: Legislative Obstruction 🟢 LOW

**Threat:** PfE/ESN minority bloc uses procedural mechanisms to obstruct May session legislative agenda.

**Current state:** PfE + ESN = 112 seats — well below any procedural blocking threshold (usually requiring 25% of MEPs to request referral, i.e., ~180 MEPs). ECR would need to join obstruction attempts, which is unlikely on most mainstream legislative files.

**Severity:** LOW — structural opposition but no blocking capacity.

### Dimension 6: Democratic Erosion 🟡 MEDIUM

**Threat:** EU-level democratic institutions face populist pressure, particularly on rule of law enforcement (Hungary/Poland legacy files), MEP immunity controversies, and European Electoral Act implementation challenges (TA-10-2026-0006 noted implementation hurdles).

**Current state:** The attempted takeover of Lithuania's public broadcaster (TA-10-2026-0024) represents a concerning media freedom signal in an EU member state. Georgia political prisoners (TA-10-2026-0083) demonstrate threats to democratic values in candidate countries. The EP's active adoption of resolutions on these issues reflects institutional responsiveness.

**Severity:** MEDIUM — monitoring signal rather than acute crisis in the 30-day window.

---

## 2. Attack Trees (Goal Decomposition)

### Attack Tree A: Blocking Climate Ambition

**Goal:** Reduce Clean Industrial Deal ambition and delay implementation
- **Branch A1:** ECR + PfE form blocking coalition on ENVI committee → delay committee opinion
  - **Sub-branch A1.1:** Mobilise industry lobbies (BusinessEurope, automotive) to pressure EPP
  - **Sub-branch A1.2:** Link CID to competitiveness debate to reframe as economic necessity
- **Branch A2:** Member state pressure → Council blocking
  - **Sub-branch A2.1:** German automotive industry pressure on German EPP MEPs
  - **Sub-branch A2.2:** Eastern European coal-dependent countries form blocking minority

**Current probability:** MEDIUM — the ECR/PfE coalition has successfully slowed Green Deal in EP10; CID faces modification risk on specific industrial targets.

### Attack Tree B: Weakening Ukraine Support

**Goal:** Reduce or end EU Parliament support for Ukraine
- **Branch B1:** PfE + ESN mobilise anti-Ukraine majority → impossible (they have only 112 seats)
- **Branch B2:** Exploit fiscal fatigue narrative → create conditional support with excessive strings
  - **Sub-branch B2.1:** Link Ukraine support to migration concessions (PfE demand)
  - **Sub-branch B2.2:** Demand reform conditionality reviews that delay disbursement
- **Branch B3:** External pressure (US withdrawal from NATO) → legitimises PfE narrative space

**Current probability:** LOW — Ukraine coalition (>430 seats) is resilient; B3 is the most credible vector.

---

## 3. Political Kill Chain (7-Stage Threat Progression)

**Applied to: US-EU Trade Escalation Threat**

| Stage | Description | Current Status |
|-------|------------|----------------|
| 1. Reconnaissance | US identifies EU trade vulnerabilities | ✅ Completed (automotive, pharma, agri) |
| 2. Weaponisation | US develops tariff measures | ✅ In progress (TA-10-2026-0096 is EU response) |
| 3. Delivery | US announces new tariff rounds | 🟡 ACTIVE THREAT — automotive tariffs repeatedly signalled |
| 4. Exploitation | EU export losses materialise | 🔴 Not yet at scale (IMF 0.2-0.4 pp projection) |
| 5. Installation | Structural trade reorientation | 🔴 Future risk |
| 6. Command & Control | Sustained US tariff pressure maintained | 🟡 Ongoing |
| 7. Actions on Objective | EU industrial relocation or capitulation | 🔴 Future risk |

**Kill chain interdiction:** The EP's adopted tariff adjustments (TA-10-2026-0096) and the INTA committee's ongoing trade oversight represent Stage 2-3 interdiction. The EU's counter-leverage includes: access to EU Single Market (largest consumer market globally), EU regulatory standards as a de facto global norm, and multilateral coalition-building (EU + UK + Japan + Canada).

---

## 4. Diamond Model — US-EU Trade Threat Actor

| Vertex | Content |
|--------|---------|
| **Adversary** | US Trump administration / USTR — pursuing maximum leverage trade strategy |
| **Capability** | Executive tariff authority under Section 232/301; market access denial |
| **Infrastructure** | US Treasury, USTR, bilateral diplomatic channels, media narrative |
| **Victim** | EU exporters (automotive DE, pharma FR, agri IT/FR/ES), EU workers in exposed sectors |

**Diamond analysis:** The adversary has high capability and infrastructure. Victim exposure is concentrated in a few sectors/countries, creating asymmetric pressure on specific EPP/ECR member delegations. The EU's countermeasure infrastructure (TER, WTO challenge, WTO MC14 Yaoundé) is functional but slow-moving relative to US executive action speed.

---

## 5. Threat Actor Profiling (ICO Framework)

### Threat Actor: Far-Right Bloc (PfE + ESN)

| ICO Dimension | Assessment |
|--------------|------------|
| **Intent** | Anti-EU federalism, soft Russia/Trump alignment, populist domestic signalling |
| **Capability** | 112 seats — procedural disruption only; cannot form majority |
| **Opportunity** | Trade crisis, Ukraine fatigue, budget controversy create narrative space |

**ICO Score:** MEDIUM-LOW threat level — high intent, low structural capability, moderate opportunity windows.

### Threat Actor: ECR (Selective Opposition)

| ICO Dimension | Assessment |
|--------------|------------|
| **Intent** | Selective — pro-EU on trade/defence, anti-EU on migration/rule of law |
| **Capability** | 81 seats — can tilt majority on close votes; potential veto partner with EPP |
| **Opportunity** | Industrial policy debates, migration, budget allocation debates |

**ICO Score:** MEDIUM threat level — moderate intent, moderate capability, high opportunity on specific files.

---

## Threat Summary

| Threat | Framework | Severity | Likelihood | Priority |
|--------|-----------|---------|-----------|---------|
| Coalition fragmentation on CID | Threat Landscape | MEDIUM | MEDIUM | WATCH |
| US tariff escalation (automotive) | Kill Chain | HIGH | MEDIUM | ACTIVE |
| Ukraine support erosion | Attack Tree | LOW | LOW | MONITOR |
| Democratic erosion (media freedom) | Threat Landscape | MEDIUM | MEDIUM | WATCH |
| MEP immunity controversies | Threat Landscape | LOW | LOW | ROUTINE |
| EU-Mercosur ratification risk | Attack Tree | MEDIUM | MEDIUM | WATCH |
| Budget 2027 breakdown | Threat Landscape | LOW | LOW | ROUTINE |
