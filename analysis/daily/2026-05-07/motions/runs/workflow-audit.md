<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Workflow Audit — EP Motions April 28–30, 2026
**Date:** 2026-05-07 | **Article Type:** motions | **Run ID:** motions-run540-1778167043
**Workflow:** news-motions.md (unified, Stages A → E)

## Run Parameters

| Parameter | Value |
|-----------|-------|
| Workflow | news-motions.md |
| Run ID | motions-run540-1778167043 |
| Started (epoch) | 1778167043 |
| Analysis Dir | analysis/daily/2026-05-07/motions |
| TODAY | 2026-05-07 |
| LAST_WEEK | 2026-04-30 |
| Article Type Slug | motions |
| Stage C Tripwire | Minute 36 elapsed |
| PR Deadline | Minute ≤ 45 (target ≤ 42) |

---

## Stage Timeline

| Stage | Started (approx) | Completed (approx) | Duration | Status |
|-------|-----------------|-------------------|----------|--------|
| Prompt reading | Minute 0 | Minute 2 | ~2 min | ✅ COMPLETE |
| Stage A: Data Collection | Minute 2 | Minute 5 | ~3 min | ✅ COMPLETE |
| Stage B Pass 1: Analysis Artifacts | Minute 5 | Minute ~28 | ~23 min | ✅ COMPLETE |
| Stage B Pass 2: Read-back + Rewrite | TBD | TBD | Target ≥ 4 min | PENDING |
| Stage C: Completeness Gate | TBD | TBD | ≤ 4 min | PENDING |
| Stage D: Article Render | TBD | TBD | ≤ 2 min | PENDING |
| Stage E: PR Creation | TBD | TBD | ≤ 2 min | PENDING |

---

## Data Collection Quality Assessment

| Tool Category | Status | Impact on Analysis |
|---------------|--------|-------------------|
| Political landscape | FULL ✅ | Coalition math accurate |
| Vote-level data | UNAVAILABLE ⚠️ | Cohesion analysis structural only |
| Text content | UNAVAILABLE ⚠️ | Content inferred from speech records |
| Speech records | FULL ✅ | Debate topics confirmed |
| IMF economic data | FAILED ❌ | Economic context at low confidence |
| Coalition dynamics | PARTIAL ⚠️ | Structure only |
| EP statistics | FULL ✅ | Historical context strong |

**Overall data quality: ADEQUATE for analysis with noted limitations**

---

## Artifacts Produced — Pass 1 Inventory

### Root Level
- [x] `executive-brief.md` — BLUF/60-second read

### intelligence/
- [x] `synthesis-summary.md`
- [x] `pestle-analysis.md`
- [x] `stakeholder-map.md`
- [x] `scenario-forecast.md`
- [x] `historical-baseline.md`
- [x] `economic-context.md` — 🔴 IMF unavailable marker
- [x] `wildcards-blackswans.md`
- [x] `coalition-dynamics.md`
- [x] `mcp-reliability-audit.md`
- [ ] `analysis-index.md` — TO BE WRITTEN

### classification/
- [x] `significance-classification.md`
- [x] `actor-mapping.md`
- [x] `forces-analysis.md`
- [x] `impact-matrix.md`

### risk-scoring/
- [x] `risk-matrix.md`
- [x] `quantitative-swot.md`
- [x] `political-capital-risk.md`
- [x] `legislative-velocity-risk.md`

### threat-assessment/
- [x] `political-threat-landscape.md`
- [x] `actor-threat-profiles.md`
- [x] `consequence-trees.md`
- [x] `legislative-disruption.md`

### existing/
- [ ] Mirror artifacts — TO BE CREATED

### runs/
- [x] `workflow-audit.md` (this file)
- [ ] `methodology-reflection.md` — TO BE WRITTEN LAST

### Root (final)
- [ ] `manifest.json` — TO BE CREATED

---

## Compliance Checks

### Protocol Compliance
- [x] Read required prompt files (00-scope, 08-infrastructure, 01-data-collection, 02-analysis-protocol, 07-mcp-reference)
- [x] Stage A: Date guard used (TODAY/LAST_WEEK derived, not hardcoded)
- [x] IMF probe executed (`scripts/imf-mcp-probe.sh`)
- [x] IMF degraded mode protocol followed (🔴 markers, minimums waived)
- [x] No article prose written by agent (Stage D is deterministic CLI)
- [x] Bash safety: No heredocs for political language; used file Create tool
- [x] No `push_repo_memory` tool call (not available in this run)

### Stage B Compliance
- [x] Pass 1 artifacts: All mandatory artifact categories attempted
- [ ] Pass 2: Read-back and rewrite (to be performed)
- [ ] pass2.{startedAt, endedAt, rewriteCount} to be logged in manifest.json

### Time Budget Compliance
- ✅ Stage A: ~3 minutes (≤ 4-5 min budget)
- ✅ Stage B Pass 1: ~23 minutes (well within budget given 27 min elapsed)
- Current elapsed: ~27 minutes
- Stage C tripwire: minute 36
- Remaining before tripwire: ~9 minutes

---

## Quality Flags

| Flag | Type | Notes |
|------|------|-------|
| Vote-level data unavailable | DATA_LIMITATION | All coalitional scoring is structural; confidences downgraded |
| Text content UPSTREAM_404 | DATA_LIMITATION | Content inferred from speech records; medium confidence |
| IMF FAILED | DATA_FAILURE | 🔴 markers applied; economic minimums waived |
| Some motion titles missing | DATA_GAP | 6 texts have TA numbers but no available titles |

---

## Shell Safety Compliance

All bash commands in this run used:
- `date -u +%Y-%m-%d` (simple single-level expansion)
- `scripts/resolve-analysis-dir.sh` (pre-audited helper)
- `scripts/imf-mcp-probe.sh` (pre-audited helper)
- No `eval`, no nested expansions, no `${!var}`, no `${var@P}`

---

## Pass 2 Pre-check

Artifacts to prioritize in Pass 2 review:
1. `executive-brief.md` — verify all 13 motions mentioned + key political signals
2. `intelligence/synthesis-summary.md` — verify cross-references to classification/risk artifacts
3. `risk-scoring/quantitative-swot.md` — verify scoring arithmetic
4. `classification/significance-classification.md` — verify Tier 1 assignments are justified
5. `threat-assessment/political-threat-landscape.md` — verify threat levels consistent with coalition dynamics

---

## Post-Run Signaling

### For Stage C (Completeness Gate)
Required artifacts checklist will be evaluated against:
1. Per-artifact line floors in `reference-quality-thresholds.json`
2. Agent-side readback of key artifacts
3. IMF probe result acknowledgment (stage C does not RED on missing IMF)

### For Stage D (Article Generation)
```bash
npm run generate-article -- --run "${ANALYSIS_DIR}"
```
Expected output: `news/2026-05-07-motions.html` (or equivalent output path)

### For Stage E (PR)
Git branch: `news/2026-05-07-motions-motions-run540-1778167043`
Files to commit:
1. All artifacts under `analysis/daily/2026-05-07/motions/`
2. Generated article HTML (from Stage D)
PR created via `safeoutputs create_pull_request` (exactly once)

---

## Sources

1. Workflow prompt (news-motions.md)
2. Runtime observations (this run)
3. gh-aw Stage Contract (analysis-agent.md)
4. `src/config/article-horizons.ts` (stage budget reference)
