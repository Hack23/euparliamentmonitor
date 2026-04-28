<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Workflow Audit — EU Parliament Month in Review: 2026-04-27

**Run Date:** 2026-04-27 | **Type:** month-in-review | **Workflow:** news-month-in-review unified

---

## Execution Timeline

| Stage | Target Duration | Actual | Status |
|-------|----------------|--------|--------|
| Stage A (Data Collection) | ≤4 min | ~3 min | ✅ On schedule |
| Stage B Pass 1 | ≤12 min (minute 4–16) | ~12 min | ✅ On schedule |
| Stage B Pass 2 | ≥4 min | Pending | 🔄 |
| Stage C (Gate) | ≤3 min | Pending | 🔄 |
| Stage D (Article) | ≤2 min | Pending | 🔄 |
| Stage E (PR) | ≤1–2 min | Pending | 🔄 |
| **Hard PR deadline** | **≤minute 25** | - | 🔄 |

---

## Workflow Contract Compliance

### Stage A Compliance
- ✅ `source scripts/mcp-setup.sh` — EP MCP gateway configured
- ✅ Date context established: TODAY, LAST_MONTH, WORKFLOW_START_EPOCH
- ✅ `scripts/resolve-analysis-dir.sh` used for stable folder path
- ✅ `ANALYSIS_DIR` set to canonical path (no -runNN suffix)
- ✅ EP feeds collected: `get_adopted_texts_feed`, `get_adopted_texts`, `analyze_coalition_dynamics`, `generate_political_landscape`
- ✅ World Bank economic data collected (DE, FR)
- ✅ Degraded tools (procedures feed, voting records) properly handled and documented
- ✅ Data saved to `${ANALYSIS_DIR}/data/`

### Stage B Pass 1 Compliance
- ✅ All started artifacts use templates from `analysis/templates/`
- ✅ All started artifacts have per-artifact methodology applied
- ✅ Confidence labels applied (🟢/🟡/🔴) consistently
- ✅ Mermaid diagrams included in visualisation-required artifacts
- ✅ No `[AI_ANALYSIS_REQUIRED]` placeholder markers in completed artifacts
- ✅ Evidence citations use specific document references (TA-10-2026-xxxx)
- ✅ IMF institutional knowledge applied with vintage labelling (data-vintage="WEO-April-2026")
- ✅ Shell-safety compliance: no nested `$`, no `${var@P}`, no `${!var}` in any bash block

### Tripwire Monitoring
- **Minute 16 tripwire:** Pass 2 must begin at or before minute 16
- **Minute 22 tripwire:** Force GATE_RESULT=ANALYSIS_ONLY regardless of gate result
- **Minute 25 deadline:** Hard PR call deadline

---

## Data Quality Log

| Issue | Classification | Mitigation Applied |
|-------|---------------|-------------------|
| `get_procedures_feed` recess mode | 🟡 Known issue §11 row #5 | Used direct `get_procedures` endpoint |
| `get_voting_records` empty | 🔵 Expected behavior | WEP bands widened +10pp; freshnessLabel applied |
| `get_speeches` empty | 🔵 Expected behavior | Noted; analysis proceeds without speech data |
| World Bank EU codes rejected | 🟡 Known limitation | Used DE, FR; IMF EA context applied |

---

## Shell-Safety Compliance Log

All bash blocks in this run used:
- Single-level `$(cmd)` without nested substitutions
- `if/elif/else` for defaults instead of `${VAR:-$(cmd)}`
- `NOW_EPOCH=$(date -u +%s)` + explicit arithmetic for elapsed time
- No `eval`, `${!var}`, or `${var@P}` patterns
- Compliance verified against test/unit/shell-safety.test.js patterns

**Shell-safety status: ✅ COMPLIANT**

---

## Completion Checklist

- [x] Stage A complete
- [x] Stage B Pass 1 artifacts: 12 of 21 written at workflow audit time
- [ ] Stage B Pass 1 complete (remaining: cross-session-intel, analysis-index, deep-analysis, session-baselines ×2, methodology-reflection)
- [ ] Stage B Pass 2 complete (readback + rewrite; pass2.rewriteCount > 0)
- [ ] manifest.json created with history[], pass2.* fields
- [ ] Stage C gate emitted (STAGE_C_GATE: GREEN/ANALYSIS_ONLY/RED)
- [ ] Stage D `npm run generate-article -- --run "${ANALYSIS_DIR}"` executed
- [ ] Stage E single PR created via `safeoutputs___create_pull_request`
