<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Procedures Proxy Analysis — Propositions
**Date:** 2026-05-21 | **DataMode:** degraded-feeds

## 1. Proxy Methodology

With the EP procedures feed returning 404 and no usable pipeline data available,
this artifact uses adopted texts as a **reverse proxy** for active legislative procedures.
Every adopted text corresponds to a completed or advancing procedure, and the subject
matter codes provide procedure classification signals.

**Proxy confidence: 🟡 MEDIUM** — Admiralty B3 (Usually Reliable / Possibly True)

## 2. Adopted Texts as Procedure Proxy (May 2026)

### 2.1 Week of 2026-05-19 to 2026-05-20 (7 texts)

| Reference | Title | Subject Codes | Procedure Type |
|-----------|-------|---------------|----------------|
| TA-10-2026-0166 | Immunity waiver: Nikos Pappas | PRIV | Immunity (INI) |
| TA-10-2026-0168 | Forest reproductive material | SILV, SEME | Ordinary legislative (COD) |
| TA-10-2026-0174 | EU–Uzbekistan Enhanced Partnership | (External) | Consent (NLE) |
| TA-10-2026-0177 | EU–Lebanon Eurojust cooperation | (Criminal) | Consent (NLE) |
| TA-10-2026-0178 | EC–São Tomé Fisheries Partnership 2025-29 | (External) | Consent (NLE) |
| TA-10-2026-0179 | EU–Cook Islands Fisheries Partnership 2025-32 | (External) | Consent (NLE) |
| TA-10-2026-0182 | UNGA 81st session recommendation | (External) | INI |
| TA-10-2026-0183 | AI strategy for EU trade | PROT, MARI | INI/Own-initiative |

### 2.2 April 2026 Legislative Output (Selected)

| Reference | Title | Significance |
|-----------|-------|-------------|
| TA-10-2026-0160 | Enforcement of Digital Markets Act | High — enforcement resolution |
| TA-10-2026-0163 | Cyberbullying/online harassment criminal law | Medium — calls for new directives |
| TA-10-2026-0157 | EU livestock sector sustainability | Medium — agricultural policy signal |
| TA-10-2026-0115 | Dog and cat welfare and traceability | Medium — animal welfare legislation |
| TA-10-2026-0112 | Guidelines for 2027 budget | High — procedural/budgetary |
| TA-10-2026-0122 | Control/transparency of performance instruments | Medium — financial regulation |

## 3. Procedure Type Distribution (Proxy Estimate)

Based on adopted texts pattern (2026 YTD, n=51):

```
Consent (NLE) - International agreements:   ~35% (18 texts)
Own-initiative (INI) - Resolutions:         ~30% (15 texts)
Ordinary legislative (COD):                 ~20% (10 texts)
Discharge/Budget (DEC/BUD):                 ~10% (5 texts)
Other (immunity, special):                  ~5%  (3 texts)
```

## 4. Active Legislative Procedure Signals

Based on the "calls on Commission" language typical in EP resolutions, the following
**new Commission proposals are being demanded** by recent adopted texts:

1. **AI/Trade Regulation** (from TA-10-2026-0183) — EP calls for Commission proposal
   on EU AI governance framework specifically addressing trade competitiveness

2. **Cybercrime Directive revision** (from TA-10-2026-0163) — EP demands criminal
   law harmonisation covering cyberbullying; likely triggers Commission legislative
   proposal in H2 2026

3. **Digital Markets Act enforcement regulation** (from TA-10-2026-0160) — EP
   calls for stronger enforcement mechanisms; signals upcoming secondary legislation

4. **Animal Welfare Regulation update** (from TA-10-2026-0115) — dogs/cats regulation
   adopted, likely followed by implementing acts

5. **Forest Reproductive Material Regulation** (TA-10-2026-0168) — formal legislative
   revision of Directive 1999/105/EC; implementing regulations expected

## 5. Proxy Reliability Assessment

| Source | Reliability | Coverage Gap |
|--------|-------------|-------------|
| Adopted texts (EP API) | HIGH (A1) | Missing: proposals under committee consideration |
| External docs feed | LOW (E4) | Missing: Commission legislative proposals |
| Procedures pipeline | NONE (—) | Complete gap: no procedure-level data |
| Committee documents | NONE (—) | Complete gap: no draft reports |

**Net coverage:** EP output visible; EP input (proposals under consideration) invisible.

## 6. Proxy Confidence Attestation

🟡 **MEDIUM confidence** in this proxy approach:
- Adopted texts reliably represent finalised legislative work
- Forward signals (what's being proposed/considered) are speculative based on resolution language
- No procedure-level evidence available from EP API this run
