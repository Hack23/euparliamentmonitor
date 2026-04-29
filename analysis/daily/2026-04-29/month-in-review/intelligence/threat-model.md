<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Threat Model — EU Parliament Month in Review: April 2026

**Framework:** Political Threat Framework v4.0 — Integrated 5-framework approach  
**Coverage:** 2026-03-30 to 2026-04-29  
**Confidence:** 🟡 Medium

*Note: STRIDE, DREAD, and PASTA are software-security frameworks and are explicitly rejected for political analysis. This model uses the integrated Political Threat Framework v4.0 incorporating: (1) 6-dimension Political Threat Landscape, (2) Attack Trees, (3) Political Kill Chain (7 stages), (4) Diamond Model, and (5) Threat Actor Profiling (ICO).*

---

## 1. Political Threat Landscape (6-Dimension Model)

### Dimension 1: Coalition Shifts

**Threat Level:** 🟡 MEDIUM

The EPP's flexible coalition model is a structural vulnerability: each legislative vote requires fresh coalition assembly. In April 2026, the housing resolution showed EPP-S&D-Greens alignment; trade defense showed EPP-ECR-PfE alignment. These coalitions are not durable — a single high-salience vote (automotive tariffs, Ukraine conditionality) could reveal coalition incompatibility.

**Attack Vector:** US automotive tariff announcement → EPP internal fracture (German CDU/CSU vs. southern European EPP) → loss of budget majority.

**Mitigation:** EPP leadership's demonstrated agility; procedural tools (committee gating, rapporteur selection) to manage coalition fragility.

### Dimension 2: Transparency Deficit

**Threat Level:** 🟡 MEDIUM

The EP's roll-call voting data has a 4–6 week publication delay, creating a transparency gap. Coalition positions on the March-April window votes cannot be confirmed from open data. This opacity is structurally exploited by groups that want to maintain ambiguity on contested votes.

**Attack Vector:** Far-right narratives claiming EU democracy is opaque; MEP accountability gaps during recess periods; Braun immunity situation highlighted the limits of quick accountability.

**Mitigation:** EP transparency register, financial declarations (TA-10-2026-0119 review), MEP declaration system.

### Dimension 3: Policy Reversal

**Threat Level:** 🟡 MEDIUM

The HGV emissions amendment (TA-10-2026-0084) and the safe third country text (TA-10-2026-0026) represent incremental Green Deal and asylum policy recalibrations. Not rollbacks, but precedent-setting for future reversals.

**Key Risk:** If 2027 budget negotiations redirect climate spending to defence, the Green Deal's financial architecture is weakened structurally.

### Dimension 4: Institutional Pressure

**Threat Level:** 🟡 MEDIUM

PfE's 84 seats and ECR's 79 seats create a combined 163-seat institutional pressure bloc that can obstruct but not dictate. Their real leverage is agenda-shaping through media visibility and veto threats on specific votes.

The Orbán dimension (PfE member) creates an institutional bridge between EP obstruction and Council blocking — a threat vector that cannot be addressed by EP action alone.

### Dimension 5: Legislative Obstruction

**Threat Level:** 🟢 LOW-MEDIUM

The EU-Mercosur compatibility request (TA-10-2026-0008) is the most sophisticated legislative obstruction tool deployed in the period — using EP's Article 218(11) rights to generate an 18-month delay without technically opposing the agreement. This sets a precedent for using legal mechanisms to obstruct agreements.

### Dimension 6: Democratic Erosion

**Threat Level:** 🟡 MEDIUM

The Lithuania (TA-10-2026-0024) and Georgia (TA-10-2026-0083) resolutions indicate that democratic erosion at the EU periphery remains an active threat. EP is monitoring but cannot enforce. The Braun immunity situation (TA-10-2026-0088) shows that MEP accountability faces institutional friction.

---

## 2. Attack Trees

### Attack Tree 1: Undermining Ukraine Support

```
Goal: Prevent continued EU financial support for Ukraine

Root: Block Ukraine loan disbursements
├── Branch A: Council veto (Orbán/Hungary)
│   ├── Trigger: Rule-of-law conditionality attached
│   ├── Escalation: Budget agreement delayed
│   └── Success condition: EU summit deadlock
├── Branch B: EP majority fracture
│   ├── Trigger: PfE anti-war narrative gains traction
│   ├── ECR conditional support withdrawn
│   └── Success condition: EP fails to adopt future Ukraine texts
└── Branch C: Legal challenge
    ├── Trigger: Court of Justice challenge to loan mechanism
    └── Success condition: Legal uncertainty freezes disbursements
```

**Current Status:** All three branches are partially activated. Hungary Council veto threat is ongoing; PfE parliamentary abstentions documented in January text.

### Attack Tree 2: Blocking Trade Defense

```
Goal: Prevent EU reciprocal trade measures against US

Root: Create political/legal barriers to trade defense
├── Branch A: Agricultural sector lobbying against retaliation
│   ├── Trigger: US market access for EU agricultural exports threatened
│   └── Success condition: EPP agriculture members block tariff regulation
├── Branch B: Transatlantic business lobby resistance
│   ├── Trigger: EU multinationals fear US market retaliation
│   └── Success condition: Commission softens proposed measures
└── Branch C: WTO legal challenge
    └── Success condition: WTO dispute panel delays implementation
```

**Current Status:** Trade defense regulation was adopted (Branch A/B failed). Branch C is the remaining risk.

---

## 3. Political Kill Chain (7-Stage Threat Progression)

### Stage 1: Reconnaissance
US Treasury/USTR identifies EU sectoral vulnerabilities (automotive most exposed). EP agriculture committee identifies Mercosur ratification timeline as pressure point.

### Stage 2: Weaponization
US tariff announcement (steel, aluminum, agricultural products) creates reciprocal pressure. PfE deploys "EU bureaucracy vs. national interest" narrative on housing intervention.

### Stage 3: Delivery
Tariff measures take effect; PfE/ECR table amendments to housing resolution to weaken intervention mechanisms; PfE tables alternative Ukraine amendment with conditionality provisions.

### Stage 4: Exploitation
EPP forced to choose between agricultural protection (Mercosur delay) and trade liberalization (Mercosur completion). Coalition cracks on agricultural vs. digital sector priorities.

### Stage 5: Installation
US tariff adjustment adopted (TA-10-2026-0096) — EU installs retaliatory mechanism. Mercosur compatibility request installed as delay tool (TA-10-2026-0008).

### Stage 6: Command and Control
EPP coalition manager coordinates across INTA, AGRI, BUDG committees. Trade defense narrative frames monthly legislative agenda.

### Stage 7: Actions on Objective
Two actions completed: (1) Tariff adjustment regulation adopted; (2) Mercosur ratification delayed via legal mechanism. Third action pending: Commission trade defense regulation implementation.

---

## 4. Diamond Model

| Element | Description |
|---------|-------------|
| **Adversary** | US administration (trade confrontation); Orbán/Hungary (EU institutional threat); Far-right transnational networks (democratic erosion) |
| **Capability** | US: economic sanctions, tariff measures; Orbán: Council veto, institutional blockade; Far-right: MEP obstruction, media narratives |
| **Infrastructure** | US Commerce Department/USTR; Hungarian government machinery; PfE parliamentary group coordination; ECR Meloni bridge to Council |
| **Victim** | EU single market (trade); EP legislative efficiency; Democratic governance standards at periphery |

---

## 5. Threat Actor Profiling (ICO: Intent × Capability × Opportunity)

### Actor 1: US Trump Administration
- **Intent:** 🔴 HIGH (stated tariff policy objectives)
- **Capability:** 🔴 HIGH (world's largest economy; sanctions authority)
- **Opportunity:** 🔴 HIGH (EU-US trade imbalance provides legal cover under WTO Article XXI)
- **ICO Score:** 🔴 HIGH THREAT
- **Trajectory:** Escalation likely if EU retaliation confirms domestic US narrative of "unfair trade partners"

### Actor 2: Orbán/Hungary
- **Intent:** 🔴 HIGH (documented EU blocking behavior; Ukraine fund veto history)
- **Capability:** 🟡 MEDIUM (Council veto, but Article 7 vote could eventually strip)
- **Opportunity:** 🟡 MEDIUM (requires Council unanimity; QMV reforms reduce leverage)
- **ICO Score:** 🟡 MEDIUM-HIGH THREAT
- **Trajectory:** Stable threat — Orbán's incentive structure unchanged

### Actor 3: PfE Parliamentary Group
- **Intent:** 🟡 MEDIUM (disrupt but not destroy EU — electoral calculus requires partial EU acceptance)
- **Capability:** 🟡 MEDIUM (84 seats — obstruct not determine)
- **Opportunity:** 🟡 MEDIUM (specific votes where coalition arithmetic is tight)
- **ICO Score:** 🟡 MEDIUM THREAT
- **Trajectory:** Growing if French national elections shift Le Pen toward EP10 mid-term realignment

---

## Threat Summary

| Threat | Framework | Severity | Probability | Priority |
|--------|-----------|----------|-------------|----------|
| US automotive tariff escalation | Kill Chain Stage 7 | 🔴 HIGH | 25% | 1 |
| Hungary Council blocking | Diamond Model | 🟡 MEDIUM | 40% | 2 |
| Green Deal budget erosion | Dim. 3 Policy Reversal | 🟡 MEDIUM | 50% | 3 |
| EP coalition fragility | Dim. 1 Coalition Shifts | 🟡 MEDIUM | 60% | 4 |
| Democratic backsliding (east) | Dim. 6 Democratic Erosion | 🟡 MEDIUM | 30% | 5 |
| Trade policy obstruction (legal) | Attack Tree 2 Branch C | 🟢 LOW | 25% | 6 |
