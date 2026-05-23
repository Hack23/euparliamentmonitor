<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Cross-Session Intelligence — EP Motions
**Article type:** motions | **Date:** 2026-05-06 | **Confidence:** 🟡 Medium

---

## Purpose

This artifact documents persistent intelligence patterns across multiple analysis sessions for the EU Parliament Monitor motions article type. It captures durable findings, evolving trends, and how this run's analysis builds on or contradicts prior sessions.

---

## 1. Persistent Intelligence Patterns (Durable Across Sessions)

### Pattern CS-1: EP API Degradation Is Structural (Confirmed Across Multiple Runs)

Every EP Monitor motions analysis run has encountered EP API live-feed degradation. The pattern is consistent:
- `get_voting_records`: Returns empty or 502
- `get_adopted_texts_feed`: Returns 502 or sparse data
- `get_meps_feed`: Pagination failures
- `get_plenary_sessions`: 502 or stale data

**Durable finding:** The EP Open Data Portal live feeds are structurally unreliable for near-real-time analysis. The `get_all_generated_stats` precomputed pathway is consistently reliable. Any analysis workflow MUST include a fallback to precomputed stats when live feeds fail.

**Cross-session implication:** Analysis quality floor for motions articles is set by the reliability of precomputed stats (EP6-EP10, weekly refresh), not the availability of live feeds. This is a known limitation, not an acute crisis.

---

### Pattern CS-2: EPP Coalition Arithmetic Is EP10's Defining Dynamic

Across all motions analysis sessions, the EPP's dual-coalition management (ECR on defence/migration; S&D on rights/social) has been the central structural reality. This pattern:
- Was established in EP10's opening sessions (July 2024)
- Has intensified through EP10 Year 1 and Year 2 as ECR expanded committee presence
- Shows no signs of resolution through single-bloc dominance

**Durable finding:** EPP coalition arithmetic is NOT a short-term tactical pattern — it is the structural architecture of EP10. Articles that treat each vote as a fresh coalition negotiation are systematically under-analyzing the institutional context.

---

### Pattern CS-3: German Economic Context Is Disproportionately Important

World Bank data collected across sessions consistently shows Germany as the outlier in EU large-economy performance (-0.5% GDP 2024 = 2nd consecutive contraction). This German economic distress:
- Drives EPP industrial exceptions demands on CID
- Weakens EPP's ability to defend Green Deal timelines to domestic constituents
- Shapes Eastern EPP delegations' solidarity reluctance (economic anxiety narrative)

**Durable finding:** German economic trajectory is a leading indicator for EP motions outcomes on industrial and climate files. This connection is underdocumented in most EP analysis.

---

### Pattern CS-4: Defence Consensus Hardening While Social Cohesion Weakens

Analysis across sessions shows a consistent divergence:
- **Hardening:** Defence/security consensus (EDIS, Ukraine solidarity) is becoming MORE durable, not less
- **Weakening:** Social cohesion (solidarity mechanisms, rights protections, Green Deal) is becoming LESS durable

**Durable finding:** EP10 is producing a structural bifurcation: security/defence integration accelerating while social/environmental integration retreating. This is not a temporary trade-off but a multi-year trajectory.

---

## 2. New Intelligence — This Session vs. Prior Sessions

### New in This Session

1. **EDIS Second Package as Test Case:** The EDIS second package vote is the first major post-first-package test of defence coalition durability. Prior sessions analyzed the first package; this session analyzes the second package as a potential inflection point.

2. **AI Act Biometric Delegated Acts:** This specific delegation decision is a new legislative milestone — not analyzed in prior sessions. The AI Act originally passed in EP9; this is EP10's first major implementing act governance decision.

3. **AMMR Solidarity Enforcement:** AMMR was agreed in principle in EP9; this session's motions are about enforcement in a different political environment. Prior sessions analyzed the agreement; this session analyzes the implementation challenge.

### Contradicts Prior Sessions

1. **IMF Data Availability:** Prior sessions noted IMF data as "expected but slow" — this session's IMF fetch-proxy failure is more complete than previous runs. The IMF economic context is now structural missing data, not occasional gap. **Consequence:** Economic analysis relies solely on WB data; risk of analytical blind spots in monetary/trade dimensions.

---

## 3. Intelligence from EP10 First Year — What Carried Forward

**What carried from EP10 Year 1 to Year 2:**

- Coalition agreements confirmed (not just provisional alliances)
- Committee chair distribution locked in
- EP10 legislative programme priorities confirmed
- ECR's integration strategy moving from "prove legitimacy" to "extract concessions"
- PfE's obstruction tactics becoming more systematic (no longer improvised)

**EP10 Year 2 evolution:**

- ECR is now a reliable (if not enthusiastic) coalition partner on specific files
- PfE has developed an amendment-flood playbook that is now predictably deployed
- S&D's red lines are clearer: will trade Green Deal ambitions for social rights (workers in supply chains)
- RE (Renew Europe) has become the pivotal bloc on AI/digital files

---

## 4. Historical Pattern Comparison (EP8 → EP9 → EP10)

| Dimension | EP8 (2014-2019) | EP9 (2019-2024) | EP10 (2024-2029) |
|-----------|----------------|----------------|----------------|
| Dominant coalition | EPP-S&D bilateral | EPP-S&D-RE trilateral | EPP-ECR-RE (defence) + EPP-S&D-RE (rights) |
| Far-right integration | Excluded | Marginally included | Actively integrated on specific files |
| Defence motions ambition | Low | Rising (post-2022) | High (EDIS mainstream) |
| Green Deal direction | Pre-Green Deal | Green Deal launch/peak | Green Deal retreat |
| Migration solidarity | Contested (Dublin III) | Agreed in principle (AMMR) | Enforcement contested |
| ENP (fragmentation) | ~5.5 | ~5.3 | 6.59 (record high) |

---

## 5. Forward Cross-Session Intelligence

**What future sessions should track:**

1. **ECR shadow rapporteur conversion rate** — are ECR shadow rapporteur positions converting to substantive influence on final text? (Need committee document feed for tracking.)

2. **AMMR national derogation requests** — following any solidarity motion, which member states file derogation requests, and does EP respond with enforcement motions or acquiescence?

3. **German economic trajectory** — if Germany exits recession (first positive GDP quarter), does EPP Green Deal position begin to soften?

4. **PfE-ECR coordination formalization** — any formal inter-group cooperation agreement would be a structural EP10 shift, not just tactical vote alignment.

*Generated: 2026-05-06T20:22Z | Run: motions-run431-1778097237*
