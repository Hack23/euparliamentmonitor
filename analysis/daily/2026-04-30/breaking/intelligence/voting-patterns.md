<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Voting Patterns Analysis — EP Breaking News: April 28–30, 2026

**Generated:** 2026-04-30T07:23:00Z | **Run:** breaking-2026-04-30  
**Classification:** PUBLIC | **Confidence:** 🟡 MEDIUM (roll-call data 4–6 week delay)

---

## Data Availability Status

### §7 Voting Data Freshness

| Tool | Status | Notes |
|------|--------|-------|
| `get_voting_records` (Apr 23–30) | 🔴 UNAVAILABLE | Returns 0 items — expected EP API roll-call delay of 4–6 weeks |
| `get_meeting_decisions` (MTG-PL-2026-04-28) | 🟡 PARTIAL | 440 decisions returned but without vote breakdown per MEP |
| `get_voting_records` (year data) | 🟡 PROXY ONLY | 2025 records available but not current-week |
| ep-get-voting-records fallback | 🔴 UNAVAILABLE | EP Open Data /api/v2/decision did not return April 28 data within 24 hours of plenary |

**Freshness label:** `PROXY_ANALYSIS_ONLY — roll-call data for April 28-30, 2026 not yet published by EP API`  
**Estimated availability:** May 12–21, 2026 (based on historical 4–6 week EP API roll-call publication delay)

---

## Inferred Voting Patterns (Based on Speeches + Political Context)

Without roll-call data, voting patterns are inferred from:
1. Speech content from `get_speeches` (April 28 plenary, 10 speeches retrieved)
2. Political group composition and historical alignment
3. The nature of adopted texts (procedural vs. contentious)

---

### 2027 Budget Guidelines (TA-10-2026-0112)

**Inferred vote:** Strong majority adoption (~530+ votes)  
**Coalition:** EPP + S&D + Renew + Greens + smaller groups  
**Dissenters:** PfE + ECR + ESN (right-nationalist bloc, ~193 seats) likely voted against on principle  
**Abstentions:** Possible from some ECR members who supported specific social provisions  
**Confidence:** 🟡 MEDIUM (budget resolutions routinely pass with 500+ votes in EP10)

---

### Dog/Cat Welfare Regulation (TA-10-2026-0115)

**Inferred vote:** Very strong majority (~580+ votes)  
**Coalition:** Cross-party including EPP, S&D, Renew, Greens, ID, possibly ECR on animal welfare  
**Dissenters:** Limited — some right-nationalist MEPs may have opposed on subsidiarity grounds  
**Confidence:** 🟡 MEDIUM (animal welfare typically generates cross-party consensus)

---

### Jaki Immunity Waiver (TA-10-2026-0105)

**Inferred vote:** Close but majority passage (~400–430 votes)  
**Coalition:** EPP + S&D + Renew — immunity waivers follow JURI committee recommendation  
**Dissenters:** ECR/PfE bloc defending Jaki on partisan grounds  
**Abstentions:** Some Greens/EFA MEPs who oppose immunity waivers on principled grounds  
**Confidence:** 🟡 MEDIUM

---

### EU-Iceland PNR Agreement (TA-10-2026-0142)

**Inferred vote:** Strong majority (~480+ votes)  
**Coalition:** EPP + S&D + Renew + ECR/PfE on security grounds  
**Dissenters:** Greens/EFA and The Left on data protection grounds  
**Confidence:** 🟡 MEDIUM (PNR agreements typically win security-majority coalitions)

---

## EP10 Voting Pattern Trends

**Group Cohesion Estimates (EP10, 2024–2026 period, proxy based on seat-share methodology):**

| Group | Seats | Cohesion Score (Proxy) | Trend |
|-------|-------|----------------------|-------|
| EPP | 185 | 0.78 | Stable-declining |
| S&D | 135 | 0.81 | Stable |
| PfE | 84 | 0.88 | High (disciplined opposition) |
| ECR | 78 | 0.72 | Moderate |
| Renew | 77 | 0.75 | Moderate |
| Greens/EFA | 53 | 0.79 | Stable |
| The Left | 46 | 0.83 | Stable |
| ESN | 31 | 0.85 | High (disciplined opposition) |
| Non-attached | 30 | N/A | |

**Note:** Cohesion scores use the size-similarity proxy methodology (seats × group uniformity estimate) — not direct vote-level cohesion data, which is unavailable for April 28–30 votes.

---

## Coalition Vote Outcome Predictions (Roll-Call Data Available ~May 2026)

When April 28 roll-call data becomes available, the following hypotheses should be tested:

1. **H1:** Budget Guidelines passed with EPP/S&D/Renew core majority (>361) — predicted YES
2. **H2:** Dog/cat welfare passed with cross-party majority including some ECR/PfE — predicted YES
3. **H3:** Jaki waiver passed with centrist majority, ECR/PfE against — predicted YES
4. **H4:** PNR agreement passed with EPP/S&D/Renew/ECR coalition — predicted YES

---

## IMF Economic Voting Context

IMF WEO April 2026 projects EU growth at 1.3% for 2026, fiscal deficit pressure from defence spending mandates. This economic context creates coalition pressure:
- **Budget hawks** (EPP right, PfE/ECR): Want lower commitments, more conditionality
- **Investment advocates** (S&D, Greens, some EPP): Want higher appropriations for climate and social programmes
- **Competitiveness advocates** (Renew, EPP centre): Want digital and defence investment

These tensions will manifest in MFF 2028-2034 voting when Commission proposal lands (Q3 2026).

---

*Source: EP Open Data Portal — group composition (719 MEPs confirmed), speech metadata. Roll-call data pending EP API publication. Classification: PUBLIC.*
