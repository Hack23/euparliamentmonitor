---
title: "🔬 MCP Server Data-Reliability Audit — Month-Ahead Run 5 (Degraded Mode)"
date: 2026-04-19
articleType: month-ahead
runId: month-ahead-run5
confidence: HIGH
scope: "European Parliament MCP Server (european-parliament-mcp-server@1.2.9)"
series: "Easter Recess 2026 (Runs 179–187) + Month-Ahead Run 5"
---

# 🔬 MCP Server Data-Reliability Audit — Month-Ahead Run 5

![Scope](https://img.shields.io/badge/Scope-EP_MCP_Server_1.2.9-blue?style=flat-square)
![Empirical_Basis](https://img.shields.io/badge/Empirical_Basis-Runs_179--187_+_Run_5-green?style=flat-square)
![Confidence](https://img.shields.io/badge/Audit_Confidence-HIGH-brightgreen?style=flat-square)
![Issues](https://img.shields.io/badge/Defects_Identified-7-red?style=flat-square)

> **Scope**: This audit applies Run 184's 7-defect inventory (the canonical EP MCP
> reliability record for this Easter recess) to the month-ahead Run 5 analytical frame.
> Its purpose is (a) to document which defects continued to affect Run 5's data
> collection, (b) surface any new defects observed in the month-ahead execution, and
> (c) establish the analytical confidence adjustments needed for the forward-looking
> 30-day horizon.

---

## Defect Carry-Over from Run 184

All 7 defects identified in Run 184's `intelligence/mcp-reliability-audit.md` remain active at Run 5 execution:

| # | Defect | Run 184 Severity | Run 5 Status | Upstream Issue |
|:-:|--------|:----------------:|:-------------:|:--------------:|
| 1 | `get_server_health` underreports availability (0/13 when 2/13 operational) | 🔴 HIGH | ❌ Still active | [#366](https://github.com/Hack23/European-Parliament-MCP-Server/issues/366) |
| 2 | `coalition_dynamics` returns `memberCount=0` for EPP / Greens-EFA / PfE / ESN | 🔴 HIGH | ❌ Still active | [#367](https://github.com/Hack23/European-Parliament-MCP-Server/issues/367) |
| 3 | Coalition `cohesion` field is a size-ratio artifact, not vote-level alignment | 🟠 MEDIUM | ❌ Still active | [#368](https://github.com/Hack23/European-Parliament-MCP-Server/issues/368) |
| 4 | `get_adopted_texts({docId})` returns empty-string fields instead of 404 / null | 🟠 MEDIUM | ❌ Still active | [#369](https://github.com/Hack23/European-Parliament-MCP-Server/issues/369) |
| 5 | Inconsistent error signalling across feeds (404 / empty array / error string) | 🟠 MEDIUM | ❌ Still active | [#370](https://github.com/Hack23/European-Parliament-MCP-Server/issues/370) |
| 6 | `analytics.effectiveNumberOfParties` computed over incomplete group data | 🟡 LOW | ❌ Still active (covered by #367) | — |
| 7 | Feed responses lack `lastModified` / `ETag` / `itemCount` metadata | 🟡 LOW | ❌ Still active (backlog) | — |

**Impact on Run 5 analysis**: Defect #2 (EPP `memberCount=0`) remains the single most damaging — it renders the Parliament's largest political group (~187 seats, 26% of chamber) analytically invisible in coalition mathematics. Every coalition scenario in `intelligence/scenario-forecast.md` and every coalition assessment in `intelligence/coalition-dynamics.md` carries a LOW vote-level confidence stamp.

---

## Feed Availability — Run 5 Snapshot (2026-04-19)

| Feed | Run 5 Status | Tier | Notes |
|------|:-------------:|:----:|-------|
| `get_server_health` | ⚠️ Reports 0/13 | — | Defect #1 continues |
| `get_adopted_texts_feed` | ✅ Operational (159+ items) | 1 | Core data source for Run 5 |
| `get_meps_feed` | ✅ Operational | 1 | Political group register |
| `get_meps` | ✅ Operational | 1 | Individual MEP lookups |
| `get_events_feed` | ❌ 404 | 2 | Tier-2 still down |
| `get_procedures_feed` | ❌ 404 | 2 | Tier-2 still down |
| `get_plenary_sessions` | ❌ Empty | 2 | Tier-2 still down |
| `get_adopted_texts({docId})` | ⚠️ Empty-string | 3 | Defect #4 — content layer down |
| `get_committee_documents_feed` | ❌ Empty | 3 | Tier-3 still down |
| `get_documents_feed` | ❌ Empty | 3 | Tier-3 still down |
| `get_parliamentary_questions_feed` | ❌ Empty | 3 | Tier-3 still down |
| `get_speeches` | ❌ Empty | 3 | Tier-3 still down |
| `analytics` endpoints | ⚠️ Partial | Mixed | Defects #2, #3, #6 affect coalition computation |

**Operational count**: **2/13 direct-test operational** (consistent with Run 184). Run 5 relies entirely on Tier-1 adopted-texts and MEP data, supplemented by editorial inference and prior-run content.

---

## Tier Recovery Tracking

Per Run 184's tiered-recovery model:

| Tier | Run 184 Projection | Run 5 Current Status | Days Since Outage Start |
|------|--------------------|-----------------------|:----------------------:|
| Tier 1 (adopted texts, MEPs) | Operational | ✅ Operational | — (never down) |
| Tier 2 (events, procedures) | April 21–23 projected | ❌ Still down Day 8 | 8 |
| Tier 3 (enriched content) | April 25–27 projected | ❌ Still down Day 8 | 8 |

**Projection validation**: Run 184's tiered model remains the best-available forecast. Tier 2 is projected to restore **2–4 days after Run 5** (April 21–23). Tier 3 projected 6–8 days after Run 5 (April 25–27). This means **the April 28–30 plenary could open with full data restoration** — a critical precondition for authoritative post-recess analysis.

**Run 6 trigger**: If Tier 2 has not restored by April 23, that falsifies Run 184's model and should prompt upstream issue escalation.

---

## Analytical Confidence Adjustments — Run 5

| Artifact | Nominal Confidence | Adjusted for Defects | Rationale |
|----------|:------------------:|:--------------------:|-----------|
| synthesis-summary.md | HIGH | 🟡 MEDIUM | Legislative calendar relies on Tier-2 (defect impact) |
| pestle-analysis.md | HIGH | 🟡 MEDIUM | Political dimension downgraded (procedural visibility limited) |
| stakeholder-map.md | MEDIUM | 🟡 MEDIUM | Unaffected — based on MEP register + manifestos |
| scenario-forecast.md | MEDIUM | 🟡 MEDIUM | Base case unaffected |
| coalition-dynamics.md | MEDIUM | 🔴 LOW | Defects #2, #3 directly affect |
| quantitative-swot.md | HIGH | 🟡 MEDIUM | W1 explicitly documents the defect impact |
| economic-context.md | HIGH | 🟢 HIGH | Unaffected — World Bank data independent |
| wildcards-blackswans.md | LOW | 🔴 LOW | By design |
| historical-baseline.md | HIGH | 🟢 HIGH | Unaffected — precomputed stats via static endpoint |
| cross-run-diff.md | MEDIUM | 🟡 MEDIUM | Unaffected methodologically |
| threat-model.md | MEDIUM | 🟡 MEDIUM | Base threats observable externally |
| document-analysis-index.md | LOW | 🔴 LOW | Defect #4 directly affects |

**Aggregate adjustment**: Run 5's claimed confidence should be read as MEDIUM aggregate, with the coalition-dynamics artifact explicitly at LOW vote-level confidence. The economic and historical artifacts remain HIGH confidence.

---

## Upstream Issue Tracking

| Issue | Filed | Status | Resolution Path |
|-------|-------|--------|-----------------|
| #366 (get_server_health underreport) | Pre-Run 184 | OPEN | MCP server patch |
| #367 (coalition memberCount=0) | Pre-Run 184 | OPEN | MCP mapping fix — **highest analytical priority** |
| #368 (cohesion semantic) | Pre-Run 184 | OPEN | MCP field rename + documentation |
| #369 (empty-string vs null) | Pre-Run 184 | OPEN | MCP error-shaping fix |
| #370 (error signalling) | Pre-Run 184 | OPEN | MCP error-pattern standardisation |

**Recommended escalation for Run 5**: no new issues filed; existing issues linked in Run 5 coalition-dynamics.md and document-analysis-index.md for traceability.

---

## Editorial Compensations Applied in Run 5

Run 5 applies the following editorial mitigations to defect impacts:

1. **Coalition seat counts**: Use inferred `~187 EPP` based on MEP register cross-reference; explicitly flag as inference
2. **Effective Number of Parties**: Report API value (4.04) with explicit note that corrected value ~6.5
3. **TA-10-2026-0099–0104 content**: Document as inaccessible in `documents/document-analysis-index.md`; avoid editorial inference of content
4. **Confidence stamps**: Every artifact declares nominal and adjusted confidence in front-matter
5. **Upstream issue references**: All affected artifacts cite the specific issue number

---

## Sources

- Run 184 `intelligence/mcp-reliability-audit.md` (canonical defect inventory)
- Direct MCP endpoint testing on 2026-04-19 (validating all 7 defects remain active)
- [Hack23/European-Parliament-MCP-Server #366–#370](https://github.com/Hack23/European-Parliament-MCP-Server/issues)
- Methodology: `analysis/methodologies/ai-driven-analysis-guide.md` v4.5 (MCP reliability audit = R when API degraded)

**Confidence**: 🟢 HIGH on defect enumeration (empirical, repeatable); HIGH on impact assessment (directly observable); MEDIUM on recovery projection (inherently forward-looking).
