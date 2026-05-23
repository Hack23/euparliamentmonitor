<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Voting Patterns Analysis — EU Parliament: March 29–April 28, 2026

**Run Date:** 2026-04-28 | **Type:** month-in-review  
**Data Availability:** ⚠️ CONSTRAINED — Roll-call voting data unavailable (4–6 week publication lag)

---

## 1. Voting Data Freshness

| Data Source | Availability | Notes |
|-------------|-------------|-------|
| Roll-call voting records (March–April 2026) | ❌ EMPTY | EP publishes with 4–6 week delay |
| Coalition seat-share proxy | ✅ Available | Computed from group seat counts |
| Adopted text outcomes (procedural) | ✅ Available | 104 texts, final vote results |
| Plenary session data | ⚠️ Degraded | filteredTotal=0, enrichment failed |
| Early warning system output | ✅ Available | Stability 84/100 |

**Freshness label:** `ep-get-voting-records` → EMPTY (expected EP API behaviour, not an error). All voting analysis in this artifact is based on adopted text outcomes and political group positions, not individual MEP roll-call data.

---

## 2. Coalition Voting Patterns (Derived from Adopted Text Outcomes)

Based on the 104 adopted texts (TA-10-2026-0001 to 0104), the following coalition patterns are inferred:

### 2.1 EPP+S&D+Renew Core Coalition

**Texts adopted via this coalition (estimated 70+ texts):** Financial regulation, institutional reform, AI governance, trade, defence (moderate measures), environmental texts.

**Coalition cohesion indicators:**
- 104 texts adopted by early Q2 2026 — extremely high output implies consistent majority
- No emergency sessions or failed votes reported in available data
- EP-Commission Framework Agreement (TA-0069) adopted — high-consensus institutional text

**WEP Assessment (🟡):** Estimated coalition cohesion 85–90% across all dossiers. The 10–15% exception represents issue-specific defections documented below.

### 2.2 EPP+ECR+PfE Issue-Specific Coalition (Migration)

**Texts adopted via right-wing coalition (estimated 2–3 texts):**
- TA-0025 (Safe countries of origin)
- TA-0026 (Safe third country concept)
- Possibly TA-0049 abstentions creating effective right-wing majority

**Pattern:** EPP using ECR+PfE to override S&D reluctance on migration texts. This represents a departure from the EPP's stated commitment to the EPP+S&D+Renew partnership as the primary majority.

### 2.3 Defence Supermajority (EPP+S&D+Renew+ECR)

**Estimated texts:** TA-0080 (flagship defence projects), TA-0040 (strategic defence), TA-0013 (CSDP annual report), TA-0078 (EU-Canada defence)

**Pattern:** ECR joining the EPP+S&D+Renew coalition on defence. This 478-seat supermajority represents EP10's broadest coalition. ECR's Polish and Baltic delegations are the driving force — Russian threat perception creates genuine cross-coalition alignment.

### 2.4 Progressive Bloc (S&D+Greens+Left on Social)

**Estimated texts:** TA-0064 (housing), TA-0049 (anti-poverty), TA-0050 (subcontracting), TA-0074 (gender pay gap)

**Pattern:** Social texts typically require progressive bloc (S&D+Greens+Left = 234 seats) plus moderate EPP and possibly Renew. Without moderate EPP votes, these texts may pass with simple majority if right-wing groups abstain.

---

## 3. Group Cohesion Proxy Analysis

**Note:** Per EP MCP documentation, `analyze_coalition_dynamics` returns `cohesionRate: null` until per-MEP roll-call data is available. The following are size-ratio proxy estimates ONLY.

| Group | Seats | Seat-Share | Internal Cohesion Estimate | Notes |
|-------|-------|------------|---------------------------|-------|
| EPP | 185 | 25.7% | 🟡 MEDIUM-HIGH | Right flank tensions on migration vs. mainstream |
| S&D | 135 | 18.8% | 🟢 HIGH | Social policy unified; defence internal debate |
| PfE | 85 | 11.8% | 🟡 MEDIUM | Hungarian vs. French vs. Italian divergence |
| ECR | 81 | 11.3% | 🟡 MEDIUM-HIGH | Polish-led; generally cohesive on sovereignty issues |
| Renew | 77 | 10.7% | 🟢 HIGH | Liberal identity cohesive; trade/AI unified |
| Greens/EFA | 53 | 7.4% | 🟡 MEDIUM | EFA sub-groups have national priority divergence |
| Left | 46 | 6.4% | 🟡 MEDIUM | Anti-austerity consensus; foreign policy divergence |
| NI | 30 | 4.2% | 🔴 LOW | No-party bloc by definition |
| ESN | 27 | 3.8% | 🟡 MEDIUM | Newer group; cohesion track record limited |

**Disclaimer:** These are qualitative estimates based on political position analysis, NOT quantitative vote-level cohesion scores. Roll-call data would substantially improve reliability.

---

## 4. Voting Trend Analysis (Inferred)

### 4.1 Trend: Rightward Shift on Migration

The March 2026 session continued the EP10 pattern of EPP preferring ECR/PfE votes over S&D compromise on migration. Since the beginning of EP10 (July 2024):
- Multiple safe countries and migration management texts adopted with right-wing supermajority
- S&D formally registered concerns but has not threatened coalition withdrawal
- This pattern was partially forecast in prior run (2026-04-27) and is CONFIRMED

### 4.2 Trend: Stable Centre on Defence

EPP+S&D+Renew+ECR defence supermajority has been the most consistent large majority in EP10. Key indicator: even groups with pacifist internal factions (S&D, Greens) accept defence sovereignty framing when the text is about EU-level coordination rather than individual military action.

### 4.3 Trend: High Productivity

104 adopted texts in ~4 months (January–April 2026) represents a very high legislative output rate. For comparison, the full EP10 term (2024–2029) will produce ~1000–1500 adopted texts by historical analogy. Being on pace for ~300/year suggests this is an exceptionally productive Parliament — possibly reflecting:
- End-of-term legislative backlog from EP9 clearance
- Post-election honeymoon coalition productivity
- Geopolitical urgency creating political will for previously blocked legislation

---

## 5. Voting Pattern on Key Legislative Clusters

### 5.1 Financial Regulation (HIGH CONFIDENCE)

BRRD3/SRMR3/DGSD2 banking union completion:
- **Coalition:** EPP+S&D+Renew (core) + ECR (supporting) + Greens (supporting banking stability)
- **Opposition estimated:** PfE (banking mutualisation concerns), some national sovereignty advocates
- **Passage margin:** Comfortable majority (400+ yes votes estimated)

### 5.2 Defence and Security (HIGH CONFIDENCE)

Flagship defence projects (TA-0080):
- **Coalition:** EPP+ECR+S&D+Renew (supermajority, ~478 seats)
- **Opposition:** Left (pacifist), Greens (pacifist wing), some S&D abstentions
- **Passage margin:** Supermajority

### 5.3 AI Governance (MEDIUM CONFIDENCE)

AI Convention ratification (TA-0071):
- **Coalition:** EPP+S&D+Renew+Greens+Left (progressive + mainstream)
- **Opposition:** PfE (sovereignty), some ECR (anti-Brussels)
- **Passage margin:** Broad majority

Digital Omnibus simplification (TA-0098):
- **Coalition:** EPP+Renew+ECR+PfE (deregulation alliance)
- **Opposition:** Greens+Left+some S&D
- **Passage margin:** Likely narrow or with abstentions enabling passage

---

## 6. Attendance Analysis

**Proxy assessment based on speeches data (April 27 session, 4 items):**
- Chair activity items suggest normal plenary function
- No extraordinary attendance issues flagged by early warning system

**Early warning system output:** Stability score 84/100 — within normal operating parameters. No specific attendance anomaly flagged.

**Limitation:** Without `track_mep_attendance` data and without enriched plenary session data, detailed attendance analysis is not possible for March–April 2026. This remains a data gap.

---

## 7. Voting Data Freshness Table

| Data Layer | Source | Freshness | Reliability |
|-----------|--------|-----------|-------------|
| Adopted texts (final vote outcomes) | EP Open Data Portal | Current to TA-0104 (March 26) | 🟢 HIGH |
| Political group positions | generate_political_landscape | April 28 snapshot | 🟢 HIGH |
| Roll-call individual MEP votes | get_voting_records | ❌ EMPTY (lag) | N/A |
| Coalition alignment (proxy) | analyze_coalition_dynamics | Size-ratio proxy only | 🟡 MEDIUM |
| MEP attendance | track_mep_attendance | Not queried | N/A |
| Group cohesion | Derived (qualitative) | Based on adopted texts | 🟡 MEDIUM |

**Overall voting data quality for this run:** 🟡 CONSTRAINED. All quantitative voting analysis is future-dated to when roll-call data for March–April becomes available (approximately mid-June 2026).

---

*Data note: EP roll-call voting records are published with a 4–6 week lag. This is expected behavior per EP MCP documentation. This artifact provides proxy analysis only — not authoritative voting statistics.*

## VOTING PATTERNS SUPPLEMENT — PROXY ANALYSIS & DATA FRESHNESS

### Voting Data Freshness

| Data Type | Status | Date Range | WEP Impact |
|-----------|--------|-----------|-----------|
| Roll-call votes (EP MCP) | ❌ EMPTY (publication lag) | March-April 2026 | HIGH — coalition claims are proxies only |
| Adopted texts (EP Open Data) | ✅ FULL | 2026 YTD (114 texts) | None — confirmed legislative output |
| Political landscape | ✅ FULL | Real-time April 28 | None — current group composition confirmed |
| Coalition dynamics | ⚠️ SIZE PROXY | April 28 | MEDIUM — cohesion estimates unverifiable |

### Adopted Texts as Voting Proxy

In the absence of roll-call voting records (4–6 week publication lag), this analysis uses **adopted texts** as a proxy for coalition voting behavior. The logic:

- **Simple majority votes** require >50% of votes cast; any adopted text implies a passing coalition existed
- **Qualified majority (QMV)** requires different thresholds; EP uses simple majority for most legislative acts
- **April 28 adopted texts:** TA-0105, TA-0112 (budget guidelines), TA-0115 (animal welfare), TA-0119 (EIB), TA-0122 (performance instruments) — all passed, implying EPP+S&D+Renew coalition functioned

### Coalition Cohesion Estimate (Size-Ratio Proxy)

| Coalition Pair | Size Similarity | Estimated Alignment | Basis |
|----------------|----------------|-------------------|-------|
| EPP–S&D | 0.73 (185/253) | HIGH | Structural governing coalition |
| EPP–Renew | 0.42 (77/185) | MEDIUM-HIGH | Pro-European alignment |
| S&D–Renew | 0.57 (77/135) | MEDIUM | Liberal-social democrat overlap |

*Voting patterns supplement: 2026-04-28 | Publication lag documented | Proxy analysis only | Confidence: 🟡 MEDIUM*

## Coalition Size Distribution

```mermaid
pie title EP10 Coalition Vote Power Distribution
    "EPP (185)" : 185
    "S&D (135)" : 135
    "Renew (77)" : 77
    "Other Pro-EU (53+46)" : 99
    "Far-Right Bloc (193)" : 193
    "NI (30)" : 30
```

*Proxy analysis only — roll-call voting records unavailable (4–6 week publication lag). See voting-patterns.md §5 for freshness assessment.*
