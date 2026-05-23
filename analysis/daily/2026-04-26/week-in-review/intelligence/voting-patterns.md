<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Voting Patterns — EU Parliament Week-in-Review
**Period:** 2026-04-19 to 2026-04-26
**Constraint:** Individual MEP roll-call data unavailable due to EP publication delay (2–4 week lag)
**Methodology:** Structural group cohesion analysis using seat-share, historical analogues, and adopted text analysis

---

## Section 1: Voting Data Availability Assessment

**Raw data status:**
- `get_voting_records` (dateFrom: 2026-04-19, dateTo: 2026-04-26): **EMPTY** — EP publication delay
- `detect_voting_anomalies`: Cannot run without voting records
- `analyze_voting_patterns` (MEP-level): Cannot run without voting records

**Available proxies:**
1. Adopted texts corpus (147 items from `get_adopted_texts_feed`) — aggregate pass/fail outcomes
2. Political landscape data — group seat shares and fragmentation index
3. Coalition dynamics — size-ratio structural proxy
4. Historical cohesion data from EP9 patterns (via `get_all_generated_stats`)
5. Structural group positions from stakeholder-map and scenario analysis

---

## Section 2: Aggregate Vote Outcome Analysis (from Adopted Texts)

The 147 adopted texts feed items from the past week represent votes that PASSED (i.e., they were adopted). Analysing their content against known group positions allows inference about coalition patterns:

### Category 1: High-Consensus Votes (likely 80%+ support)
Based on topic type and historical patterns:

| Category | Count (est.) | Evidence |
|----------|-------------|----------|
| Oral question resolutions (non-binding) | ~40–50 | Low controversy; cross-coalition consensus common |
| Procedural and non-legislative | ~20–30 | Administrative; near-unanimous |
| Country-specific human rights resolutions | ~10–15 | EPP + S&D + Renew consensus typical |
| ECB appointments (TA-10-2026-0088 etc.) | ~5 | Technical economic appointments: high consensus |

### Category 2: Contested Votes (likely 50–65% support)
Based on legislative topic sensitivity:

| Category | Count (est.) | Evidence |
|----------|-------------|----------|
| Migration and asylum (TA-10-2026-0025/0026) | 2 | Likely EPP + ECR + PfE vs. S&D + Greens + Left |
| Trade countermeasures (TA-10-2026-0096) | 1 | EPP + S&D + Renew vs. ECR + PfE (nationalist fringe) |
| Anti-corruption directive (TA-10-2026-0094) | 1 | EPP + S&D vs. PfE abstentions/opposition |
| Housing policy (TA-10-2026-0012) | 1 | S&D + Renew + Greens vs. ECR + PfE |

### Category 3: High-Controversy (narrower majority inferred)
Items where EP's vote reflects the EPP swing-vote role:

| Item | Inferred Coalition | Notes |
|------|-------------------|-------|
| Migration safe country list (TA-10-2026-0026) | EPP + ECR + PfE | EPP's most significant right-wing accommodation this week |
| EU-Mercosur CJEU opinion request (TA-10-2026-0008) | EPP + S&D + Renew vs. ECR | Agriculture bloc opposed; environment bloc divided |
| ReArm Europe defence | Broad cross-coalition | National interest convergence overrides left-right axis |

---

## Section 3: Structural Group Cohesion Estimates (Size-Ratio Proxy)

Using `analyze_coalition_dynamics` sizeSimilarityScore data (note: vote-based cohesion data unavailable):

| Political Group | Seats | Size-Ratio (self/EPP) | Structural Position | Estimated Cohesion |
|----------------|-------|----------------------|--------------------|--------------------|
| EPP | 189 | 1.00 (anchor) | Centre-right; pivot | 🟢 HIGH (disciplined, governing party logic) |
| S&D | 136 | 0.72 | Centre-left | 🟡 MEDIUM (national party divergence on migration) |
| ECR | 78 | 0.41 | Right-conservative | 🟡 MEDIUM (FdI vs. PiS tensions) |
| Renew | 77 | 0.41 | Liberal-centrist | 🟡 MEDIUM (national party fragmentation post-2024) |
| PfE | 84 | 0.44 | Nationalist | 🟡 MEDIUM (Fidesz vs. RN on Ukraine) |
| Greens/EFA | 53 | 0.28 | Green-left | 🟢 HIGH (ideologically cohesive; small) |
| Left (GUE/NGL) | 46 | 0.24 | Left | 🟢 HIGH (small; disciplined) |
| ESN | 25 | 0.13 | Far-right | 🟢 HIGH (small; disciplined) |

---

## Section 4: Coalition Pattern Analysis (Inferred)

### The EPP Swing-Vote Pattern

EP10's most important structural voting dynamic is EPP's ability to choose which coalition forms a majority on any given vote:

- **Centrist coalition** (EPP 189 + S&D 136 + Renew 77 = 402 of 720 = 55.8%): Mathematically strong; used for economic, rule-of-law, and pro-European integration votes.
- **Right-wing coalition** (EPP 189 + ECR 78 + PfE 84 = 351 of 720 = 48.8%): Just below majority alone; needs NI/other cooperation or Renew/Left abstentions to cross 361.
- **Hybrid** (EPP + ECR, EPP + S&D + ECR): Used for specific migration or deregulation votes.

**This week's inferred pattern:** EPP used centrist coalition for banking/trade/anti-corruption (TA-10-2026-0092, 0094, 0096) and right coalition for migration hardening (0025, 0026). This dual-key strategy is consistent with our stakeholder and scenario analysis.

---

## Section 5: Forward Voting Intelligence

**Upcoming high-stakes votes to monitor (next 2–4 weeks):**
1. **Clean Industrial Deal first reading** — will test whether EPP accommodates deregulation demands from ECR/PfE or holds environmental floor with S&D/Greens
2. **EU-Mercosur** — if CJEU declines opinion referral, full ratification vote will trigger agriculture vs. industry divide
3. **AI Act implementation delegated acts** — technical but commercially significant; industry lobbying at peak
4. **Digital Markets Act enforcement** — IMCO committee vote expected; EPP-Renew alignment anticipated
