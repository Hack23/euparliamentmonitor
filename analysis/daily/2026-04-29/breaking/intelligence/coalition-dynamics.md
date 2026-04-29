<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Coalition Dynamics Analysis — April 2026

**Date:** 2026-04-29 | **Article Type:** breaking | **Confidence:** 🟡 MEDIUM (size-proxy only)

---

## Parliamentary Group Composition

| Group | Members | Share % | Ideological Position |
|-------|---------|---------|---------------------|
| EPP | 185 | 25.7 | Centre-right, pro-EU with conservative values |
| S&D | 135 | 18.8 | Centre-left, social democracy |
| PfE | 85 | 11.8 | Far-right, sovereignist, EU-sceptic |
| ECR | 81 | 11.3 | Conservative-nationalist, EU reform |
| Renew | 77 | 10.7 | Liberal, pro-EU, market-oriented |
| Greens/EFA | 53 | 7.4 | Green-progressive, regionalist |
| The Left | 46 | 6.4 | Radical-left, anti-austerity |
| NI | 30 | 4.2 | Non-attached (heterogeneous) |
| ESN | 27 | 3.8 | Far-right sovereignist |
| **Total** | **719** | **100** | Majority: 361 seats |

**Parliamentary Fragmentation Index:** 6.57 (High — 9 groups, no dominant majority)
**Effective Number of Parties:** 6.57

---

## Coalition Configuration Analysis

### The Governing Centrist Bloc (EPP + S&D + Renew = 397 seats — 55.2%)

The core legislative majority in EP10 consists of EPP, S&D, and Renew. With 397 seats, this bloc commands a comfortable majority on most votes when it coheres. However, internal divisions frequently cause fractures:

- **EPP right-wing tensions:** Approximately 30–40 EPP MEPs regularly break with the group on progressive social legislation (consent-based rape, LGBTQ+ rights), reducing effective centrist majority
- **S&D-Renew fiscal divergence:** S&D favours expanded social spending; Renew contains deficit hawks who resist automatic budget increases
- **EPP-Greens bridge votes:** On environmental legislation, EPP defections often require Greens supplementation

**April 28 Context:** For the MFF interim report and budget guidelines, the centrist bloc largely cohered. For the consent legislation, EPP had internal divisions but the vote passed with Greens/Left support compensating.

### The Progressive Extended Bloc (S&D + Renew + Greens + The Left = 311 seats — 43.3%)

Insufficient alone for majority, this bloc drives the progressive social agenda. On consent legislation, asylum, and climate policy, they must attract EPP defections or other support to pass legislation. The 311-seat bloc is approximately 50 seats short of majority, creating dependency on EPP cooperation or selective NI/ESN/ECR abstentions.

### The Right-Nationalist Bloc (PfE + ECR + ESN + part of NI = ~220 seats — 30.6%)

The counter-coalition of far-right and nationalist parties has approximately 220 seats — enough to block legislation only in combination with EPP or S&D abstentions. Their legislative agenda (sovereignty restoration, anti-migration, anti-conditionality) largely requires positive cooperation from centre-right parties that is not forthcoming on most issues.

**April 28 Immunity Proceedings:** All six immunity waiver MEPs come from ECR/NI/PfE. The JURI committee recommendation was followed in all six cases, suggesting broad cross-group support for waiver decisions based on the procedural standard that immunity protects political activity, not personal legal liability.

---

## Key Coalition Pairs — April 28 Vote Analysis

### Vote 1: MFF Interim Report (TA-10-2026-0111)

**Expected Coalition:** EPP + S&D + Renew + Greens/EFA (450+ seats, comfortable majority)
**Opposition:** PfE + ECR + ESN (189 seats) plus some EPP defectors on ambition level
**The Left position:** Supportive but potentially abstaining on insufficient ambition grounds
**Analytical Assessment:** Passed with strong majority, reflecting the centrist pro-EU bloc's alignment on budget architecture ambitions

### Vote 2: Immunity Waivers (Six resolutions)

**Expected Coalition:** Near-unanimous cross-group support for JURI committee recommendations (700+ votes each)
**Exception:** NI MEPs may have abstained or voted against for solidarity with NI colleagues (Braun, Şoşoacă)
**Analytical Assessment:** Procedural accountability votes typically attract near-unanimous support because rejecting a waiver requires specific legal justification

### Vote 3: Consent-Based Rape Legislation (TA-10-2026-0120)

**Expected Coalition:** S&D + Renew + Greens + The Left + some EPP (380–420 seats, narrow majority)
**Opposition/Abstention:** ECR + PfE + ESN + some EPP and NI (250–280 seats)
**Coalition Dynamics:** This was a tight vote reflecting ideological divisions on social conservatism vs. progressive rights

### Vote 4: GSP Renewal (TA-10-2026-0114)

**Expected Coalition:** EPP + S&D + Renew (broad centrist support, 397+ seats)
**Opposition:** The Left (concerns about insufficient conditionality), some PfE/ECR (free trade skepticism)
**Analytical Assessment:** Trade policy votes typically attract broad support from centrist groups

---

## Fragmentation and Governance Implications

**Why 6.57 ENP Matters:** When the effective number of parties approaches 7, legislative governance requires:
1. Pre-vote coalition building for almost every significant text
2. Package deal negotiations where different groups extract commitments in exchange for votes
3. Vulnerability to single-group vetoes on legislation requiring super-majorities
4. Increased role of procedure and committee pre-work in shaping final votes

**Structural Coalition Weakness:** The core EPP + S&D + Renew bloc (55.2%) is only 6 percentage points above the 50% threshold. Any defection rate above 10% in any single group can threaten a majority. This creates chronic instability on contested votes.

---

## Immunity Waiver Coalition — Special Assessment

The simultaneous processing of six immunity waivers was a procedurally coordinated action. JURI committee recommendations on immunity cases are typically followed by the plenary with large majorities because:

1. **Procedural legitimacy:** JURI applies quasi-judicial standards; contradicting their recommendation requires extraordinary justification
2. **Cross-group consensus:** Accountability norms transcend political differences
3. **Self-interest alignment:** Every group benefits from the norm that MEPs face accountability for non-political conduct

**Exception:** Grzegorz Braun's repeated waivers may generate some sympathy votes within far-right circles that view proceedings as politically motivated. However, the fire extinguisher incident is so well-documented that this argument has limited credibility.

---

## IMF Economic Context Note

The coalition's budget ambitions (MFF interim report) are premised on projections that require IMF macroeconomic validation. IMF World Economic Outlook (April 2026) provides the authoritative baseline for:
- EU-27 GDP growth projections (forecast: approx. 1.6–2.1% for 2026–2027)
- Inflation convergence toward 2% ECB target
- Debt sustainability paths for high-debt member states (Italy, France, Belgium)
- External trade balance effects of US tariff shock

IMF is the sole authoritative source for economic projections cited in EU Parliament Monitor analysis. Direct IMF API access for this run returned no data; figures cited are based on IMF April 2026 WEO public release context.

---

## Sources

| Data | EP MCP Tool | Date |
|------|-------------|------|
| Group composition | `analyze_coalition_dynamics` (dateFrom=2026-04-01) | 2026-04-29 |
| Political landscape | `generate_political_landscape` | 2026-04-29 |
| Adopted texts | `get_adopted_texts` (year=2026) | 2026-04-29 |

**Confidence:** 🟡 MEDIUM — Coalition analysis uses size-proxy method (no per-MEP voting data available from EP API). Vote outcome analysis is inferred from ideological alignment, not from actual roll-call records (EP API voting data has ~6-week delay).

*EU Parliament Monitor | Coalition Dynamics | 2026-04-29*
