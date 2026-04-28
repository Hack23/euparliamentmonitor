<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Methodology Reflection — EU Parliament Propositions
## April 28, 2026 | SAT-Compliant Analytical Reflection

**Admiralty Grade:** B2 | **Run Date:** 2026-04-28

---

## 1. Structured Analytic Technique (SAT) Documentation

This artifact completes the 10-step analysis protocol (`ai-driven-analysis-guide.md` Step 10.5). It documents which SATs were applied, their outputs, and potential analytical failures.

---

## 2. SATs Applied in This Analysis

### SAT 1: Key Assumptions Check (KAC)

**Applied in**: synthesis-summary.md, scenario-forecast.md, threat-model.md  
**Key assumptions checked**:

| Assumption | Status | Risk if wrong |
|-----------|--------|---------------|
| EP10 political landscape based on 200 MEP sample is representative | 🟡 PARTIAL (sample bias possible) | Coalition math could be off by ±5-10% |
| Procedures feed RECESS_MODE reflects real pipeline, not just API failure | 🟢 CONFIRMED (documented pattern) | If API failure only: many active procedures unanalysed |
| Q1 2026 adopted texts are comprehensive (no missing texts) | 🟢 LIKELY (paginated 3 pages, 104 texts) | If incomplete: undercount of legislative output |
| Political group positions inferred from voting record patterns (not direct voting data) | 🟡 PARTIAL (EP9 patterns + EP10 signals) | Group discipline may have changed in EP10 |

### SAT 2: Analysis of Competing Hypotheses (ACH)

**Applied in**: scenario-forecast.md  
**Competing hypotheses tested**:
1. Baseline (incremental integration): Evidence weight 🟢 HIGH
2. Accelerated right-wing pivot: Evidence weight 🟡 MEDIUM (some signals)
3. Progressive resurgence: Evidence weight 🔴 LOW (few enabling conditions)
4. Institutional crisis: Evidence weight 🔴 LOW (no active trigger)

**Diagnostic evidence that would change rankings**: 
- Major migration crisis (H1) → would elevate hypothesis 2
- Banking crisis before BRRD3 → would elevate hypothesis 4

### SAT 3: Devil's Advocacy

**Applied in**: wildcards-blackswans.md  
**Contrarian positions explored**:
- EP10 productivity numbers may reflect low-quality/routine texts rather than genuine legislative achievement
- Banking Union "completion" masks Level 2 implementation challenges that could take 5+ years
- Climate ambition maintained on paper but operationally impossible given coal-dependent Eastern European states

### SAT 4: Red Team Analysis

**Applied in**: threat-model.md, actor-threat-profiles.md  
**Red team actors identified**: PfE/Orbán, CJEU, US tech lobby, Russia (hybrid)  
**Red team finding**: The most dangerous adversary for EP10 legislative agenda is **not** external — it is the internal coalition fragmentation that the 9-group landscape creates. No external actor can deliver as much disruption as an EPP decision to change coalition partners on a major file.

### SAT 5: Pre-Mortem

**Applied in**: consequence-trees.md  
**Question**: "Assume all key legislative achievements of Q1 2026 have been reversed by 2030. What happened?"

**Most plausible failure scenario**:
1. CJEU annuls Safe Countries regulation → political crisis → EPP pivots to hard-right coalition
2. Hard-right coalition undermines Climate 2040 implementing acts → 2040 target becomes hollow
3. Banking Union Level 2 delayed by Council → BRRD3 not operational when next banking crisis hits
4. New Commission (post-2029 elections) under far-right influence rolls back AI Act

**Probability of full reversal**: 10–15% (Highly Unlikely) but individual elements: 30–50% each

---

## 3. Data Source Assessment

| Source | Reliability | Completeness | Notes |
|--------|------------|-------------|-------|
| EP adopted texts (year=2026) | 🟢 HIGH | 🟢 HIGH | Primary data source; 104 texts confirmed |
| EP plenary sessions | 🟢 HIGH | 🟢 HIGH | 21 sessions 2026; current session confirmed |
| EP political landscape | 🟡 MEDIUM | 🟡 PARTIAL | 200 MEP sample; directionally reliable |
| EP procedures feed | 🔴 UNAVAILABLE | 🔴 UNAVAILABLE | RECESS_MODE; 1972-1990 archive only |
| EP voting records | 🔴 UNAVAILABLE | 🔴 UNAVAILABLE | 4-6 week publication delay |
| EP committee documents | 🔴 UNAVAILABLE | 🔴 UNAVAILABLE | Upstream API error |
| EP external documents | 🟡 MEDIUM | 🟡 PARTIAL | 6 Council SP responses only |
| World Bank / IMF | 🔵 NOT_REQUIRED | 🔵 N/A | IMF IMF requirement: not_required for this run |

**Data quality overall**: 🟡 MODERATE — primary data source (adopted texts) is reliable and comprehensive; secondary sources (active procedures, voting patterns) significantly constrained.

---

## 4. Analytical Limitations

1. **Lagging indicator bias**: All EP data available in this run is completed/historical legislation. No forward-looking active procedure data available (RECESS_MODE). Analysis describes what has been done, not what is being done.

2. **Coalition inference without voting evidence**: Group positions are inferred from policy record and historical patterns, not from actual EP10 voting data for the most recent major votes (March 26 package).

3. **Sample-based political landscape**: The 200 MEP sample is directionally reliable but may not precisely reflect the full 720 MEP EP10 composition, particularly for smaller groups (NI, ESN).

4. **No committee-level intelligence**: Committee stage proceedings (where real legislative battles happen) are invisible without the procedures feed. This analysis describes floor votes only.

---

## 5. Confidence Assessment Summary

| Artifact | Overall Confidence | Key Limitation |
|----------|------------------|----------------|
| executive-brief.md | 🟢 HIGH | Based on confirmed adopted texts |
| synthesis-summary.md | 🟡 MEDIUM | Coalition math inferred, not measured |
| scenario-forecast.md | 🟡 MEDIUM | Historical patterns; no live pipeline data |
| threat-model.md | 🟡 MEDIUM | Threats identified; probabilities estimated |
| stakeholder-map.md | 🟡 MEDIUM | Group positions inferred; no MEP-level data |
| economic-context.md | 🟡 MEDIUM | Derived from legislative signals; no macro stats |
| mcp-reliability-audit.md | 🟢 HIGH | Direct tool observation; fully documented |

---

## 6. Improvement Recommendations for Next Run

1. **Time the run after May 9** when March 26 voting records become available — significantly improves coalition analysis precision
2. **Retry committee documents feed** — intermittent upstream error may have resolved
3. **Build larger MEP sample** via multiple `get_meps` calls to improve political landscape precision
4. **Scan parliamentary questions** with enriched metadata when available — better forward indicator

---

*Generated: 2026-04-28 | propositions-run-1777356258 | Step 10.5 SAT documentation complete*
