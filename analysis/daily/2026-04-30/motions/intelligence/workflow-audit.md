<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Workflow Audit — EP Motions: April 28–29, 2026 Strasbourg Plenary

**Article Type:** motions | **Run Date:** 2026-04-30 | **Run ID:** motions-run-1777531962

---

## Stage A — Data Collection

| Tool | Status | Notes |
|------|--------|-------|
| get_voting_records | 🔴 Empty | EP 4–6 week delay — expected |
| get_adopted_texts_feed (one-week) | ✅ Success | 52.8KB payload |
| generate_political_landscape | ✅ Success | 719 MEPs, 9 groups |
| get_adopted_texts (year 2026) | ✅ Success | 51 texts, 12 key |
| analyze_coalition_dynamics | ✅ Structural | Fragmentation 6.57 |
| get_plenary_sessions (2026) | ✅ Success | April 27-28-29 sessions found |
| get_meeting_decisions (Apr 28) | ✅ Success | 79.6KB |
| get_meeting_decisions (Apr 29) | ✅ Success | 117.1KB |
| get_speeches (dateFrom Apr 27) | ✅ Success | Debate topics retrieved |
| early_warning_system | ✅ Success | Stability 84, MEDIUM risk |
| world-bank GDP Poland | ✅ Success | 3.03% (2024) |
| compare_political_groups | 🟡 Limited | Null performance data (voting unavailable) |
| get_current_meps (30) | ✅ Success | Sample retrieved |

**Stage A result:** ✅ COMPLETED | Duration: ~2 min

---

## Stage B — Analysis Artifacts

**Pass 1 artifacts produced:**

| Artifact | Path | Lines | Status |
|----------|------|-------|--------|
| synthesis-summary | intelligence/ | ~180 | ✅ |
| stakeholder-map | intelligence/ | ~160 | ✅ |
| voting-patterns | intelligence/ | ~120 | ✅ |
| scenario-forecast | intelligence/ | ~130 | ✅ |
| pestle-analysis | intelligence/ | ~170 | ✅ |
| threat-model | intelligence/ | ~110 | ✅ |
| impact-matrix | classification/ | ~140 | ✅ |
| forces-analysis | classification/ | ~150 | ✅ |
| actor-mapping | classification/ | ~150 | ✅ |
| significance-classification | classification/ | ~80 | ✅ |
| risk-matrix | risk-scoring/ | ~100 | ✅ |
| political-capital-risk | risk-scoring/ | ~120 | ✅ |
| quantitative-swot | risk-scoring/ | ~180 | ✅ |
| legislative-velocity-risk | risk-scoring/ | ~120 | ✅ |
| actor-threat-profiles | threat-assessment/ | ~150 | ✅ |
| legislative-disruption | threat-assessment/ | ~130 | ✅ |
| consequence-trees | threat-assessment/ | ~120 | ✅ |
| political-threat-landscape | threat-assessment/ | ~80 | ✅ |
| deep-analysis | existing/ | ~170 | ✅ |
| session-baseline | existing/ | ~80 | ✅ |
| document-analysis-index | documents/ | ~80 | ✅ |

**Artifacts pending Pass 2 / not yet created:**
- cross-session-intelligence
- wildcards-blackswans
- workflow-audit (this file)
- methodology-reflection (final — must be last)
- cross-run-diff (N/A — first run today)
- manifest.json

---

## MCP Tool Performance

| Tool | Calls | Successes | Failures |
|------|-------|----------|---------|
| european-parliament | 10+ | 9 | 1 (get_voting_records empty — expected) |
| world-bank | 1 | 1 | 0 |
| track_legislation | 1 | 0 | 1 (404 — fallback to adopted texts) |

---

## Quality Flags

| Flag | Status | Notes |
|------|--------|-------|
| Voting data available | 🔴 No | EP publication delay — structural inference only |
| IMF data | 🟡 Partial | WB Poland GDP; IMF WEO forecast cited in SWOT |
| Mermaid diagrams | ✅ Present | impact-matrix, actor-mapping, political-capital-risk, legislative-velocity-risk, actor-threat-profiles, legislative-disruption, consequence-trees (7 of 8 required) |
| Reader Briefings | ✅ Present | impact-matrix, forces-analysis, actor-mapping, political-capital-risk, legislative-velocity-risk, actor-threat-profiles, legislative-disruption, consequence-trees |
| AI_ANALYSIS_REQUIRED markers | ✅ None | All sections populated |

---

**Run completed:** 2026-04-30 | Stage B Pass 1 complete | WORKFLOW_START_EPOCH: 1777531962
