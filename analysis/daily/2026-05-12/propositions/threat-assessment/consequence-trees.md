<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Consequence Trees — EU Parliament Propositions
**Date:** 2026-05-12 | **Methodology:** Fault Tree Analysis (FTA) + Consequence Mapping

---

## Consequence Tree 1: Anti-Corruption Directive Implementation Failure

**Root event:** Anti-Corruption Directive fails to achieve harmonised enforcement by 2030

### Branch A: Constitutional Challenge Path
```
BVerfG receives ultra vires complaint on Art. 83(1) [P=15%]
  └─► BVerfG issues preliminary reference to ECJ [P=60% if complaint filed]
      └─► ECJ delays ruling 2–3 years [P=80%]
          └─► German transposition suspended pending ruling [P=90%]
              └─► Other MS cite "legal uncertainty" for delay [P=50%]
                  └─► Harmonisation fails in practice; 27 different implementations [P=60%]
                      └─► OUTCOME: Anti-Corruption Directive becomes "paper law" for 5+ years
```
**Branch A probability:** 15% × 60% × 80% × 90% × 50% × 60% ≈ **1.9%**

### Branch B: Political Non-Compliance Path
```
Hungary formally refuses transposition [P=55%]
  └─► Commission initiates Article 258 infringement [P=100%]
      └─► Hungary delays compliance through ECJ proceedings (2–4 years) [P=80%]
          ├─► Italy adopts minimalist transposition [P=35%]
          │   └─► Poland (outside EPPO) adopts similar minimalism [P=40%]
          │       └─► 3+ major MS with hollow implementation [P=55%]
          │           └─► OUTCOME: Patchwork enforcement; Directive achieves 40-50% intended effect
          └─► Commission accepts compromise transposition to avoid ECJ escalation [P=20%]
              └─► OUTCOME: Weakened Directive but formally compliant
```
**Branch B most likely outcome probability:** ~12%

### Consequence Severity Assessment
| Scenario | Probability | Economic Loss | Institutional Cost |
|----------|:-----------:|:---:|:---:|
| Full harmonisation achieved (2028) | 60% | Low | Low |
| Partial harmonisation (2030) | 28% | Medium | Medium |
| Effective failure (paper law) | 12% | High (corruption costs continue) | Very High |

---

## Consequence Tree 2: SRMR3 Stress Event During Implementation Window

**Root event:** Major European bank requires early intervention under SRMR3 before SRB full implementation guidance (2026 window)

### Sequence analysis:
```
Eurozone growth undershoots IMF forecast (+0.6%) [P=25%]
  └─► Credit stress in Italian/French banking sector [P=30% if growth miss]
      └─► Major bank (assets €10–100bn) NPL spike triggers ECB early intervention threshold [P=20%]
          ├─► SRMR3 new rules applied (clarity achieved) [P=60%]
          │   └─► OUTCOME: Test passes; SRMR3 credibility enhanced
          └─► SRMR3 implementation gaps create legal uncertainty [P=40%]
              └─► SRB relies on pre-SRMR3 procedures [P=70%]
                  └─► Legal challenge to resolution decision [P=50%]
                      └─► OUTCOME: Crisis manageable but SRMR3 credibility weakened
```
**Crisis with credibility damage probability:** 25% × 30% × 20% × 40% × 70% × 50% ≈ **0.4%**
**Crisis occurs at all probability:** ~1.5% (within 12 months)

### Economic consequence modelling:
- **Contained crisis (SRF deployed):** €5–15bn SRF cost; negligible macro impact
- **Uncontained crisis (contagion):** €50–200bn total system cost; GDP impact -0.3 to -0.8% eurozone
- **Systemic crisis (2008-scale):** €2.3 trillion (historical baseline); GPD -4% to -8%

---

## Consequence Tree 3: Budget 2027 Institutional Collapse

**Root event:** Budget 2027 conciliation fails; EU enters provisional twelfths

### Sequence:
```
Council tables 15% real-terms cohesion cut [P=30%]
  └─► EP BUDG committee votes to reject [P=90% if cut >10%]
      └─► Conciliation committee convened [P=100%]
          ├─► Compromise reached within 21-day period [P=70%]
          │   └─► OUTCOME: Budget adopted with partial EP concessions
          └─► Conciliation fails; no agreement [P=30%]
              └─► EU enters provisional twelfths from Jan 2027 [P=100%]
                  └─► Programme disbursements frozen [P=100%]
                      ├─► Cohesion fund projects halted in 12 MS [HIGH]
                      ├─► Agricultural direct payments delayed [MEDIUM]
                      └─► HORIZON successor research funding paused [MEDIUM]
```
**Provisional twelfths probability:** 30% × 30% ≈ **9%** (within FY2026–2027 cycle)

### Consequence severity:
- **Cohesion fund halt (3 months):** €12–15bn frozen; ~50,000 project implementation delays
- **Agricultural halt (3 months):** €3–4bn delayed; farm cash flow stress particularly in CEE
- **Research funding halt:** ~€2bn; researcher contract uncertainty

---

## Meta-Consequence: EP10 Electoral Legacy Damage

**Trigger:** Any of the above consequence chains materialising before 2029 elections

**Consequence chain:**
```
Landmark legislation fails (Anti-Corruption OR Budget collapse) [P=~15-20% combined]
  └─► EP10 "achievement narrative" undermined [HIGH]
      └─► Far-right 2029 campaign: "EU promises don't deliver" [CERTAIN]
          └─► EPP further pressure to accommodate PfE platform [P=40%]
              └─► 2029 election result: PfE/ECR gains; Coalition Alpha majority potentially lost [P=30%]
                  └─► OUTCOME: EP11 requires formal EPP-PfE coalition for majority
```
**EP11 far-right coalition probability:** Very low unconditionally (~10%), elevated to ~25% if EP10 implementation failures accumulate

---

## Consequence Mitigation Priorities

| Consequence Tree | Mitigation Priority | Key Action |
|-----------------|:---:|------------|
| CT-1: Anti-Corruption failure | HIGH | Commission preemptive Art. 83 legal brief; GRECO monitoring |
| CT-2: SRMR3 stress | MEDIUM | SRB fast-track implementation guidance; ECB stress test prep |
| CT-3: Budget collapse | HIGH | Commission mediation; early trilogue informal talks Q2 2026 |
| CT-Meta: EP10 legacy | HIGH | Proactive communication on legislative achievements |

*Fault tree analysis based on publicly available institutional information and EP legislative records. Probabilities are analyst judgements using ICD 203 methodology. Run: propositions-run270-1778566185.*
