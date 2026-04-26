<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Threat Model — EU Parliament Week-in-Review
**Period:** 2026-04-19 to 2026-04-26
**Methodology:** Political Threat Framework v4.0 (5-framework integrated approach)
**NOT STRIDE — STRIDE is a software-security framework, rejected for political analysis**

---

## Framework: 5 Integrated Political Threat Dimensions

### Dimension 1: Political Threat Landscape (6-dimension model)

| Threat Dimension | Severity | Current Evidence | Trend |
|-----------------|----------|-----------------|-------|
| **Coalition Shifts** | 🔴 HIGH | EPP progressively accommodating ECR on migration/deregulation | ↗ Increasing |
| **Transparency Deficit** | 🟡 MEDIUM | Anti-corruption directive adopted but implementation gap | → Stable |
| **Policy Reversal** | 🟡 MEDIUM | Green Deal rollback via emissions flexibility; housing stall risk | ↗ Increasing |
| **Institutional Pressure** | 🟡 MEDIUM | EP used as check on Commission (Mercosur opinion request) | → Stable |
| **Legislative Obstruction** | 🟢 LOW | High legislative output (114 acts) contradicts obstruction | ↘ Declining |
| **Democratic Erosion** | 🟡 MEDIUM | Lithuania media, Georgia prisoners, Braun immunity | → Stable |

---

### Dimension 2: Attack Trees — How Threats Succeed

#### Attack Tree 1: EU Legislative Drift to Far-Right

**Goal:** Far-right parties (PfE + ECR) shift EP10 legislative output away from rule-of-law and social protection toward nationalist and deregulatory agenda.

```
Root: Systematic legislative drift to far-right
├── Branch A: EPP abandons centrist coalition
│   ├── Leaf: CDU/CSU electoral pressure from AfD/CSU hard wing
│   ├── Leaf: EPP fears losing 2029 voters to ECR
│   └── Leaf: Short-term coalition math favours EPP + ECR + PfE
├── Branch B: S&D and Greens weakened
│   ├── Leaf: Greens' -21 seats in EP10 election removes kingmaker role
│   ├── Leaf: S&D internal divisions (national vs European interests)
│   └── Leaf: Renew fragmented by national election losses
└── Branch C: External pressure reinforces drift
    ├── Leaf: US tariff pressure reinforces economic nationalism narrative
    ├── Leaf: Immigration spikes create political crisis
    └── Leaf: Far-right street mobilisation in France/Germany/Italy
```

**🔴 Current probability:** 35% (Scenario 2 in scenario-forecast.md)
**Key evidence this week:** Migration hardening (TA-10-2026-0025/0026) demonstrates Branch A activation

#### Attack Tree 2: EU–US Trade War Escalation

**Goal:** Escalation of tariff conflict destroys the transatlantic trade relationship, with knock-on effects on EU legislative priorities.

```
Root: Full EU-US trade war
├── Branch A: US escalates automotive tariffs to 25%
│   ├── Leaf: Section 232 national security framing applied to automotive
│   ├── Leaf: EU retaliatory escalation (TA-10-2026-0096 phase 2)
│   └── Leaf: German automotive sector job losses trigger political crisis
├── Branch B: EU internal unity fractures
│   ├── Leaf: Germany negotiates bilateral with US (undermining EU position)
│   ├── Leaf: France and Germany clash on Mercosur linkage strategy
│   └── Leaf: Eastern EU members prioritise NATO over trade leverage
└── Branch C: Wider economic cascade
    ├── Leaf: ECB forced to cut rates more aggressively (capital flight risk)
    ├── Leaf: EU banking sector stress (exposed to US markets)
    └── Leaf: Productivity shock deepens Germany's recession
```

**🟡 Current probability:** 25% for full escalation; 70% for partial escalation with limited deal
**Key evidence:** TA-10-2026-0096 (EU countermeasures already adopted) signals EU is serious

---

### Dimension 3: Political Kill Chain — Threat Progression (7 stages)

Applied to the "Right Bloc Advance" threat scenario:

| Stage | Status | Indicators | EP Response |
|-------|--------|-----------|------------|
| 1. Reconnaissance | ✅ Active | ECR mapped EPP vulnerabilities: German CDU/CSU under pressure | Limited |
| 2. Initial Access | ✅ Active | ECR/PfE won migration votes (TA-10-2026-0025/0026); safe country list adopted | Anti-corruption directive as counterweight |
| 3. Establishment | 🟡 Partial | Regular EPP-ECR coordination on deregulation dossiers | Centrist bloc maintains cohesion on rule-of-law |
| 4. Lateral Movement | ⚠️ Risk | ECR seeking ITRE rapporteurships for Clean Industrial Deal | EPP committee coordinators resistance |
| 5. Privilege Escalation | 🔴 Risk | If ECR obtains committee chairmanship in major economic committee | Conference of Presidents EPP dominance |
| 6. Exfiltration | 🔴 Risk | EPP adopts ECR language on sovereignty and deregulation in official positions | Renew and S&D alarm bells |
| 7. Actions on Objective | 🔴 Risk | Treaty change proposal framing EU as "sovereignty union not regulatory state" | Constitutional majority threshold protects core |

---

### Dimension 4: Diamond Model — Adversary Analysis

Applied to the "Legislative Sovereignty Threat" (erosion of EU institutional integrity by far-right populist forces):

```
        Adversary (ECR/PfE leadership)
             /         \
     Capability         Intent
(Legal, institutional    (Treaty reform,
 knowledge; MEP         deregulation,
 positions in LIBE,     migration reversal,
 INTA committees)       rule-of-law dilution)
             \         /
           Infrastructure
      (Political coordination via
       national parties in power;
       media ecosystems; external
       support from Russia-aligned
       information operations)
                 |
              Victim
      (EU institutional integrity;
       rule-of-law in member states;
       civil society protections;
       asylum seekers; minority rights)
```

**Diamond Model Assessment:**
- **Adversary:** ECR/PfE leadership (Meloni network, Le Pen/Jordan Bardella, Orbán/Fidesz) — sophisticated, experienced, well-resourced
- **Capability:** Institutional knowledge of EP procedures; coalition-building skills; national government connections
- **Intent:** Reform EU from within (ECR) or weaken EU institutions from within (PfE/Fidesz)
- **Infrastructure:** 29% combined seat share; national governments in IT, HU, AT; aligned media (Tucker Carlson-amplified messaging); suspected Russia information operations (Belgium CSSD warning)
- **Victim:** Progressive legislative agenda; rule-of-law framework; democratic accountability institutions

---

### Dimension 5: Threat Actor Profiling (ICO: Intent × Capability × Opportunity)

| Actor | Intent | Capability | Opportunity | Overall Score | Threat Level |
|-------|--------|-----------|------------|---------------|--------------|
| ECR (Meloni aligned) | Moderate (institutional reform) | HIGH (government connections) | HIGH (29% bloc) | 🔴 High | Active threat to progressive agenda |
| PfE (RN + FPÖ + Fidesz) | High (EU dilution) | HIGH (national gov positions) | MEDIUM (internal divisions) | 🟡 Medium-High | Constrained by Fidesz divisions |
| US administration (tariff pressure) | HIGH (trade leverage) | HIGH (economic dominance) | HIGH (EU economic vulnerability) | 🔴 High | External economic threat |
| Russia (information operations) | HIGH (EU fragmentation) | MEDIUM (sanctions degraded) | MEDIUM (democratic backsliding countries) | 🟡 Medium | Persistent; degraded capability |
| Chinese state actors (tech competition) | HIGH (tech sovereignty challenge) | HIGH (industrial capacity) | HIGH (EU tech dependency) | 🔴 High | Long-term structural threat |

---

## Political Threat Summary (EP Week-in-Review)

**Primary Threat:** Internal coalition erosion — EPP's rightward drift enabled by fragmented arithmetic creates risk of progressive legislative agenda being systematically undermined over EP10's term. Current probability: 35% (moderate-high).

**Secondary Threat:** EU–US transatlantic fracture — economic and geopolitical pressure from Trump 2.0 threatens EU's rules-based multilateral framework and creates economic vulnerability exploited by nationalist forces domestically.

**Tertiary Threat:** Democratic backsliding in peripheral EU states — Lithuania broadcaster episode, Georgian prisoners, Hungarian Fidesz behaviour. Pattern suggests EU's democratic conditionality tools are insufficient without binding enforcement.

**Countervailing forces (why EP10 has not already shifted far-right):**
1. Anti-corruption directive (TA-10-2026-0094) passed with EPP-S&D support — EPP not fully captured
2. ECB Vice-President appointment and SRMR3 passed — economic mainstream prevails on financial dossiers
3. EU Magnitsky Act extension — cross-coalition consensus on human rights tools persists
4. High legislative output — gridlock/obstruction threat is low

**Overall Threat Level: 🟡 MEDIUM** — Parliament functioning but under structural stress from rightward coalition arithmetic.
