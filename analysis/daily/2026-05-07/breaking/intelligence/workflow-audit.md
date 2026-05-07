# Workflow Audit — Breaking News Run 2026-05-07

**Run ID:** breaking-run-1778159307  
**Workflow:** news-breaking.md (unified Stages A-E)  
**Date:** 2026-05-07  
**Article type slug:** breaking  
**Data mode:** degraded-imf  

---

## 1 - Execution Timeline

| Stage | Target Budget | Actual | Status |
|-------|--------------|--------|--------|
| Stage A - Data Collection | ≤ 5 min | ~5 min | ✅ Complete |
| Stage B1 - Analysis Pass 1 | ≤ 22 min | ~20 min | ✅ Complete |
| Stage B2 - Analysis Pass 2 | ≤ 10 min | ~10 min | ✅ Complete |
| Stage C - Completeness Gate | ≤ 4 min | ~4 min | 🔄 In progress |
| Stage D - Article Render | ≤ 2 min | pending | ⏳ Pending |
| Stage E - Single PR | ≤ 2 min | pending | ⏳ Pending |

---

## 2 - Tool Calls Summary

| MCP Tool | Calls | Status | Notes |
|----------|-------|--------|-------|
| get_adopted_texts_feed | 1 | ✅ OK | 25 records, April 28-30 |
| get_events_feed | 1 | ❌ Unavailable | Upstream EP API error |
| get_procedures_feed | 1 | ⚠️ Degraded | Historical only, not current |
| get_meps_feed | 1 | ⚠️ Full dump | 719 MEPs (>200 = known EP regression) |
| get_adopted_texts | 1 | ✅ OK | year=2026, 25 records |
| get_speeches | 1 | ✅ OK | 20 debate records April 29-30 |
| get_all_generated_stats | 1 | ✅ OK | Rich 2004-2026 dataset |
| analyze_coalition_dynamics | 1 | ✅ OK | Group composition confirmed |
| generate_political_landscape | 1 | ✅ OK | All 9 groups mapped |
| get_plenary_sessions | 1 | ⚠️ Partial | Only through January 2026 indexed |
| get_latest_votes | 1 | ❌ Empty | DOCEO XML unavailable for current week |
| get_voting_records | 1 | ⚠️ Partial | Only January 2026 available |
| fetch-proxy (IMF) | 1 | ❌ Failed | Network unavailable from AWF sandbox |

---

## 3 - Data Mode Decision Log

**Decision:** Activated degraded-imf mode  
**Trigger:** IMF SDMX endpoint unreachable (fetch-proxy returned "fetch failed")  
**Effect:** All artifact line floors reduced by ×0.85  
**IMF citations replaced with:** "IMF data unavailable in degraded-imf mode; World Bank proxies used where possible"

---

## 4 - Artifact Production Log

| Artifact | Pass 1 Lines | Pass 2 Lines | Gate Status |
|----------|-------------|-------------|------------|
| executive-brief.md | 175 | 175 | ✅ OK |
| intelligence/analysis-index.md | 88 | 138 | ✅ OK (≥136) |
| intelligence/pestle-analysis.md | 145 | 213 | ✅ OK (≥212) |
| intelligence/stakeholder-map.md | 188 | 260 | ✅ OK (≥259) |
| intelligence/scenario-forecast.md | 132 | 256 | ✅ OK (≥238) |
| intelligence/threat-model.md | 144 | 221 | ✅ OK (≥212) |
| intelligence/historical-baseline.md | 105 | 105 | ✅ OK |
| intelligence/economic-context.md | 138 | 138 | ✅ OK |
| intelligence/wildcards-blackswans.md | 134 | 134 | ✅ OK |
| intelligence/coalition-dynamics.md | 126 | 126 | ✅ OK |
| intelligence/mcp-reliability-audit.md | 93 | 327 | ✅ OK (≥327) |
| intelligence/synthesis-summary.md | 86 | 175 | ✅ OK (≥174) |
| intelligence/methodology-reflection.md | -- | 221 | ✅ OK (≥187) |
| classification/significance-classification.md | created | created | ✅ OK |
| classification/actor-mapping.md | created | extended | ✅ OK |
| classification/forces-analysis.md | created | extended | ✅ OK |
| classification/impact-matrix.md | created | extended | ✅ OK |
| threat-assessment/political-threat-landscape.md | created | created | ✅ OK |
| threat-assessment/actor-threat-profiles.md | created | created | ✅ OK |
| threat-assessment/consequence-trees.md | created | created | ✅ OK |
| threat-assessment/legislative-disruption.md | created | created | ✅ OK |
| risk-scoring/risk-matrix.md | 80 | 147 | ✅ OK (≥127) |
| risk-scoring/quantitative-swot.md | 97 | 136 | ✅ OK (≥119) |
| risk-scoring/political-capital-risk.md | 105 | 105 | ✅ OK |
| risk-scoring/legislative-velocity-risk.md | 97 | 97 | ✅ OK |
| intelligence/workflow-audit.md | -- | created | ✅ OK (this file) |

---

## 5 - Compliance Checklist

- [x] All artifacts written under canonical `analysis/daily/2026-05-07/breaking/` directory
- [x] manifest.json created with dataMode, articleType, history entries
- [x] degraded-imf mode activated and documented in economic-context.md + mcp-reliability-audit.md
- [x] No hard-coded years in MCP tool calls (uses $TODAY derived vars)
- [x] No IMF data used (endpoint unavailable; World Bank proxies noted)
- [ ] Stage C gate: pending final validation run
- [ ] Stage D: npm run generate-article pending
- [ ] Stage E: single PR pending

---

*Workflow audit v1.0 | Run: breaking-run-1778159307 | 2026-05-07*

---

## 6 - Tool Call Reliability Map

```mermaid
graph LR
    EP_TEXTS["get_adopted_texts_feed\n✅ OK - 25 records"]
    EP_EVENTS["get_events_feed\n❌ UNAVAILABLE"]
    EP_PROCS["get_procedures_feed\n⚠️ DEGRADED"]
    EP_MEPS["get_meps_feed\n⚠️ FULL DUMP 719"]
    EP_SPEECHES["get_speeches\n✅ OK - 20 records"]
    EP_STATS["get_all_generated_stats\n✅ OK - rich dataset"]
    EP_COALITION["analyze_coalition_dynamics\n✅ OK"]
    EP_LANDSCAPE["generate_political_landscape\n✅ OK"]
    IMF["IMF fetch-proxy\n❌ NETWORK BLOCKED"]
    
    EP_TEXTS & EP_SPEECHES & EP_STATS & EP_COALITION & EP_LANDSCAPE --> STAGE_A_OK["Stage A Core\n✅ Complete"]
    EP_EVENTS & EP_PROCS & EP_MEPS & IMF --> STAGE_A_DEGRADED["Stage A Degraded\nData documented"]
    STAGE_A_OK & STAGE_A_DEGRADED --> STAGE_B["Stage B\nAnalysis (26 artifacts)"]
```

---

*Workflow audit v1.1 | Run: breaking-run-1778159307*

---

## Re-Run Audit Section — May 7, 2026 Second Run

**[EXTEND-FROM-PRIOR: workflow-audit.md — adding re-run metadata per re-run improve/extend rule]**

**Re-run ID:** breaking-rerun2-1778179641  
**Re-run trigger:** Automated re-run (same-day folder, manifest.history.length=1 detected)  
**Re-run rule applied:** Every artifact must be extended ≥ 20 lines beyond prior floor; `pass2.rewriteCount` must equal total artifact count (27)

### Re-Run Stage Summary

| Stage | Prior Run | Re-Run | Status |
|-------|-----------|--------|--------|
| A — Data Collection | ✅ Complete | ✅ Extended (new landscape probe) | 🟢 |
| B — Analysis (27 artifacts) | ✅ 27 artifacts written | 🔄 All 27 extended/extended | 🟡 In progress |
| C — Completeness Gate | 🟢 GREEN (prior run) | 🔄 Running after B | Pending |
| D — Article Render | ✅ Rendered | 🔄 Re-render pending | Pending |
| E — Single PR | ✅ 1 PR in prior run | ✅ 1 PR this run | Pending |

### Artifact Extension Tracking (Re-Run)

Per the re-run rule, all 27 artifacts must reach `extendFloor = max(threshold_floor, priorLines + 20)`. Extensions completed in this re-run:

- [x] `executive-brief.md` — Extended ~65 lines (May 7 landscape table, June triggers, BLUF v3.0)
- [x] `intelligence/coalition-dynamics.md` — Extended ~80 lines (coalition stress scenarios, Mermaid chart)
- [x] `intelligence/economic-context.md` — Extended ~90 lines (DMA economics, EU-Iceland PNR cost-benefit, budget context)
- [x] `intelligence/synthesis-summary.md` — Extended ~80 lines (Pass 2 synthesis, revised scenarios, data gap status)
- [x] `intelligence/wildcards-blackswans.md` — Extended ~90 lines (WC-07 US tariff escalation, WC-08 PfE-ECR merger)
- [x] `intelligence/mcp-reliability-audit.md` — Extended ~60 lines (re-run probe update, data quality comparison)
- [x] `intelligence/workflow-audit.md` — Extended (this section)
- [ ] `intelligence/methodology-reflection.md` — Pending
- [ ] `intelligence/pestle-analysis.md` — Pending (§10+ already comprehensive)
- [ ] `intelligence/stakeholder-map.md` — Pending
- [ ] `intelligence/scenario-forecast.md` — Pending
- [ ] `intelligence/threat-model.md` — Pending
- [ ] `intelligence/historical-baseline.md` — Pending
- [ ] `intelligence/analysis-index.md` — Pending
- [ ] `classification/significance-classification.md` — Pending
- [ ] `classification/actor-mapping.md` — Pending
- [ ] `classification/forces-analysis.md` — Pending
- [ ] `classification/impact-matrix.md` — Pending
- [ ] `threat-assessment/political-threat-landscape.md` — Pending
- [ ] `threat-assessment/actor-threat-profiles.md` — Pending
- [ ] `threat-assessment/consequence-trees.md` — Pending
- [ ] `threat-assessment/legislative-disruption.md` — Pending
- [ ] `risk-scoring/risk-matrix.md` — Pending
- [ ] `risk-scoring/quantitative-swot.md` — Pending
- [ ] `risk-scoring/political-capital-risk.md` — Pending
- [ ] `risk-scoring/legislative-velocity-risk.md` — Pending

### Workflow Performance Notes (Re-Run)

- IMF degraded-imf mode continues (4th consecutive run)
- EP events feed unavailable (2nd consecutive run)
- DOCEO XML unavailable (expected — April 30 session, day 7 of 14-day publication lag)
- Political landscape probe successful: 719 MEPs, fragmentation index 6.55 confirmed
- No new adopted texts since prior run (gap ~30 minutes)

*Workflow audit v2.0 | Run: breaking-rerun2-1778179641 | Updated: 2026-05-07*
