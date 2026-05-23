<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Consequence Trees — EU Parliament Month in Review: March 27 – April 26, 2026

**Framework:** Event Tree Analysis + Fault Tree Analysis  
**Focus:** Two primary scenario pathways from March 2026 legislative decisions  
**Confidence:** 🟡 Medium  

---

## Tree 1: Banking Union Package Consequence Chain

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9"}}}%%
flowchart TD
    E0[BRRD3/SRMR3/DGSD2\nAdopted March 2026]
    E0 --> E1A[Member states transpose\non schedule 2027]
    E0 --> E1B[Member states delay\ntransposition]
    E1A --> E2A[Banking CRE stress\nevent occurs 2026-2027]
    E1A --> E2B[No major banking\nstress event]
    E1B --> E2C[Banking stress event\noccurs pre-transposition]
    E2A --> E3A[BRRD3 early intervention\nsuccessfully applied]
    E2A --> E3B[BRRD3 inadequate;\ncrisis escalates]
    E2B --> E4A[Uneventful implementation;\nbasis for DGSD3 review]
    E2C --> E3C[Old BRRD2 framework\napplied; partial resolution]
    E3A --> E5A[Banking Union\ndemonstrated effective\n✅ HIGH VALUE]
    E3B --> E5B[Emergency Council\nmeeting; EDIS demand revived]
    E4A --> E5C[Stable baseline;\nBanking Union complete as designed]
    E3C --> E5D[Non-transposing state\nfaces infringement + political cost]
```

**Most Likely Path (55%):** E0 → E1A → E2B → E4A → E5C (Stable implementation, no major stress event)  
**Second Most Likely (25%):** E0 → E1A → E2A → E3A → E5A (Banking stress; BRRD3 proves effective)  
**Worst Case (10%):** E0 → E1B → E2C → E3C → E5D (Delay + stress = avoidable crisis)

---

## Tree 2: AI Governance Consequence Chain

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9"}}}%%
flowchart TD
    A0[AI Act Omnibus + CoE\nConvention March 2026]
    A0 --> A1A[EU AI Office\nfully resourced by Q3 2026]
    A0 --> A1B[EU AI Office\nunderstaffed/delayed]
    A1A --> A2A[First AI Act enforcement\ncase 2026-2027]
    A1A --> A2B[No enforcement case\nwithin 12 months]
    A1B --> A2C[Regulatory vacuum\ndespite legal framework]
    A2A --> A3A[Enforcement landmark;\nBrussels Effect demonstrated]
    A2A --> A3B[CJEU challenge;\nlegal uncertainty]
    A2B --> A3C[Deterrence sufficient;\ncompliance without enforcement]
    A2C --> A3D[AI harm incident\nstresses non-enforced regime]
    A3A --> A4A[EU AI governance model\nglobal standard ✅]
    A3B --> A4B[Years of legal uncertainty;\ncompetitiveness loss]
    A3D --> A4C[Emergency revision;\nEP emergency session]
```

**Most Likely Path (45%):** A0 → A1B → A2C → A3C (Underfunded but not tested; compliance without enforcement)  
**Second Most Likely (30%):** A0 → A1A → A2A → A3A → A4A (Effective enforcement; Brussels Effect)  
**Risk path (15%):** A0 → A1B → A2C → A3D → A4C (Enforcement gap + incident = crisis)

---

## Cross-Consequence Interdependencies

The banking and AI consequence trees are not independent. A German banking CRE crisis (Banking Tree worst case) would create political conditions making AI Act enforcement much harder — German CDU MEPs would prioritize economic crisis response over AI Office resourcing.

**Correlation risk**: If Germany economic crisis intensifies (+Tree 1 worst case probability), simultaneously reduces AI Act enforcement capacity (+Tree 2 risk path probability). These should be modeled as correlated, not independent, events.

**Assessment**: The probability of both bad paths occurring simultaneously is roughly 5-8% — low probability but institutional preparation should account for concurrent crisis management.
