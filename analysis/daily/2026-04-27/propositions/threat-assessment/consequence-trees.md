<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Consequence Trees — EU Parliament Propositions
**Date:** 2026-04-27 | **Framework:** Consequence/Event Tree Analysis

---

## Reader Briefing

Consequence trees trace the downstream effects of key legislative outcomes in the EP's April 2026 propositions pipeline. Each tree starts from a key decision point and maps the cascade of institutional, political, and social consequences. For strategic planners, the Anti-Corruption Directive failure tree has the most branching negative consequences — it is the highest-leverage single decision point in the current pipeline.

---

## Tree 1: Anti-Corruption Directive Adoption vs. Failure

```mermaid
flowchart TD
    VOTE[Anti-Corruption Directive] --> ADOPT[ADOPTED ✅]
    VOTE --> FAIL[FAILED ❌ — Hungary emergency brake]
    
    ADOPT --> EPPO_EXPAND[EPPO jurisdiction expanded]
    ADOPT --> CRIM_STANDARDS[Minimum criminal standards 27 MS]
    ADOPT --> EP_CRED[EP institutional credibility ↑]
    ADOPT --> NEXT_DOSSIERS[Enables: AI Liability, Social Rights Directive]
    EPPO_EXPAND --> PROSECUTIONS[More corrupt official prosecutions]
    CRIM_STANDARDS --> DETERRENCE[Cross-border corruption deterrence]
    
    FAIL --> HUNGARY_EMPOWERED[Hungary veto capacity demonstrated]
    FAIL --> RULEOLAW_CHILL[Rule of law legislation chilled]
    FAIL --> EP_CRED_DAMAGE[EP credibility damage]
    FAIL --> ENHANCED_COOP[Enhanced cooperation: 9 MS proceed without HU]
    FAIL --> INFRINGEMENT[Commission infringement proceedings alternative]
    HUNGARY_EMPOWERED --> ORBÁN_LEVERAGE[Orbán leverage in budget negotiations ↑]
    RULEOLAW_CHILL --> NEXT_DOSSIERS_DELAYED[AI Liability, Social Rights delayed]
    ENHANCED_COOP --> PARTIAL_ADOPTION[Directive applies to 9-20 MS only]
```

---

## Tree 2: US Tariff Counter-measures — Outcomes

```mermaid
flowchart TD
    TRILOGUE[US Tariffs Trilogue 2025/0261] --> AGREE[Agreement — Regulation Adopted ✅]
    TRILOGUE --> STALL[Stalled Trilogue]
    
    AGREE --> LEVERAGE_TOOL[Commission has flexible counter-measure tool]
    AGREE --> US_NEGOTIATION[EU-US bilateral trade framework likely]
    AGREE --> RENEW_CREDIT[Renew claims negotiation framing victory]
    LEVERAGE_TOOL --> TRADE_STABILITY[EU trade stability ↑]
    US_NEGOTIATION --> G7_DEAL[G7 bilateral agreement possible]
    
    STALL --> TPR_FALLBACK[Commission uses TPR Regulation fallback]
    STALL --> EP_IRRELEVANT[EP marginalized on trade response]
    STALL --> ESCALATION_RISK[US tariff escalation without EU legal response]
    TPR_FALLBACK --> NARROWER_RESPONSE[Narrower/less flexible EU measures]
    ESCALATION_RISK --> GERMANY_GDP[German GDP further decline]
    GERMANY_GDP --> RECESSION_DEEPEN[EU-wide recession risk ↑]
```

---

## Tree 3: SRMR3 Transposition — Success vs. Gap

```mermaid
flowchart TD
    SRMR3_PUB[SRMR3 Published OJ April 20, 2026] --> TRANSPOSE[All 27 MS transpose on schedule]
    SRMR3_PUB --> PARTIAL_TRANSPOSE[5+ MS miss deadline]
    
    TRANSPOSE --> RESOLUTION_READY[EU-wide resolution capacity operational]
    TRANSPOSE --> BANKING_UNION[Banking Union architecture complete]
    RESOLUTION_READY --> NEXT_BANKING_CRISIS[Next banking crisis handled via SRMR3]
    BANKING_UNION --> CMU_MOMENTUM[Capital Markets Union momentum ↑]
    
    PARTIAL_TRANSPOSE --> RESOLUTION_GAP[Legal gaps in 5+ member states]
    RESOLUTION_GAP --> STRESS_RISK[Banking stress event hits non-transposing state]
    STRESS_RISK --> NATIONAL_RESOLUTION[National ad-hoc resolution — less predictable]
    NATIONAL_RESOLUTION --> CONTAGION[Cross-border contagion risk ↑]
    PARTIAL_TRANSPOSE --> INFRINGEMENT[Commission infringement vs. 5+ MS]
```

---

## Summary Consequence Assessment

| Decision Point | Best Case Consequence | Worst Case Consequence | Probability Best |
|---------------|----------------------|----------------------|-----------------|
| Anti-Corruption adopted | EPPO expansion; rule of law strengthened | — | 55–65% |
| Anti-Corruption fails | — | Hungary veto demonstrated; legislation chilled | 35–45% |
| US Tariff Reg adopted | EU-US bilateral framework; trade stability | — | 65–75% |
| US Tariff Reg stalls | — | Commission TPR fallback; EP marginalized | 25–35% |
| SRMR3 full transposition | Banking Union complete; CMU momentum | — | 75–85% |
| SRMR3 partial transposition | — | Resolution gaps; contagion risk | 15–25% |

---

*Consequence Trees: 2026-04-27 | Framework: Event/Consequence tree analysis*
