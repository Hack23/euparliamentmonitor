---
title: "Cross-Workflow Audit — Shallow-Analysis Risk Surface"
date: 2026-04-19
articleType: breaking
runId: 188
scope: "Audit of 10 sibling news-*.md agentic workflows for the shallow-analysis failure mode that prompted Run 188's review rejection"
---

# Cross-Workflow Audit — Shallow-Analysis Risk Surface

![Role](https://img.shields.io/badge/Role-Workflow_Audit-gold?style=flat-square)
![Scope](https://img.shields.io/badge/Scope-10_workflows-blue?style=flat-square)
![Finding](https://img.shields.io/badge/Risk_After_Phase_2-LOW-green?style=flat-square)

> **Purpose**. Phase 3 of the Run 188 reference-quality upgrade. The review (comment
> #4276063665) asked specifically to *"identify similar issues in other agentic
> workflows that need same improvements."* This audit answers that question for the
> 10 sibling `news-*.md` workflows, with a per-workflow risk assessment and the
> concrete changes landed in this PR to mitigate the shared failure mode.

---

## 1. Executive Summary

The shallow-analysis failure mode that rejected Run 188's initial commit — a 50-line
`pestle-analysis.md` landing green through `validate-analysis-completeness.ts` because
the validator enforced only a flat 30-line floor — applied to **every article-producing
workflow in the pipeline**, not only `news-breaking.md`. All 10 sibling workflows
invoke the validator through the same Step 3.5 boilerplate, so they all inherited the
same gap and all now automatically inherit the Rule 22 fix.

**Post–Phase 2 risk assessment**: the shared boilerplate pattern means **no
workflow-specific code change is required** for Rule 22 enforcement to engage across
the pipeline. The validator extension reads
`analysis/methodologies/reference-quality-thresholds.json` on every invocation and
applies per-article-type floors automatically. A 50-line `pestle-analysis.md` under
`articleType: week-in-review` will now fail `news-weekly-review.md` exactly the way it
would fail `news-breaking.md`, with the same CLI diagnostic.

---

## 2. Per-Workflow Risk Matrix

| Workflow                             | Lines | Invokes validator | Article type produced         | Pre–Phase 2 risk | Post–Phase 2 risk |
|--------------------------------------|-------|-------------------|-------------------------------|------------------|-------------------|
| `news-breaking.md`                   | 1,348 | ✅ Step 3.5       | `breaking`                    | 🔴 HIGH           | 🟢 LOW             |
| `news-weekly-review.md`              | 1,258 | ✅ Step 3.5       | `week-in-review`              | 🔴 HIGH           | 🟢 LOW             |
| `news-monthly-review.md`             | 1,323 | ✅ Step 3.5       | `month-in-review`             | 🔴 HIGH           | 🟢 LOW             |
| `news-week-ahead.md`                 | 1,493 | ✅ Step 3.5       | `week-ahead`                  | 🟡 MEDIUM         | 🟢 LOW             |
| `news-month-ahead.md`                | 1,314 | ✅ Step 3.5       | `month-ahead`                 | 🟡 MEDIUM         | 🟢 LOW             |
| `news-committee-reports.md`          | 1,476 | ✅ Step 3.5       | `committee-reports`           | 🟡 MEDIUM         | 🟢 LOW             |
| `news-motions.md`                    | 1,706 | ✅ Step 3.5       | `motions`                     | 🟡 MEDIUM         | 🟢 LOW             |
| `news-propositions.md`               | 1,480 | ✅ Step 3.5       | `propositions`                | 🟡 MEDIUM         | 🟢 LOW             |
| `news-article-generator.md`          | 1,246 | ✅ Step 3.5       | long-form any                 | 🟡 MEDIUM         | 🟢 LOW             |
| `news-translate.md`                  | 1,599 | ❌ N/A            | translation only (no analysis)| N/A              | N/A               |

**9 of 10 workflows were materially exposed to the shallow-analysis failure mode. All
9 are now protected by the Rule 22 validator extension. `news-translate.md` is
out-of-scope by design — it produces translated HTML articles from existing source
articles and does not generate analysis artifacts.**

Pre–Phase 2 risk calibration:

- **🔴 HIGH** = flagship analysis-heavy workflow that produces the reference-quality
  deliverable (breaking, weekly review, monthly review). Run 188's gap happened here
  first because volume × stakes made it the first to be reviewed critically.
- **🟡 MEDIUM** = secondary or specialised analysis workflow. Lower volume but the
  same structural gap: a thin `pestle-analysis.md` or `scenario-forecast.md` would
  have passed the old gate under any article type.
- **N/A** = no analysis stage to shallow.

---

## 3. The Shared Boilerplate (Root Cause)

All 9 article-producing workflows share identical Step 3.5 invocation:

```
npm run validate-analysis -- \
    --analysis-dir="${ANALYSIS_DIR}" \
    --article-type="${ARTICLE_TYPE_SLUG}"
```

This is a strength, not a weakness. Because the invocation is shared, fixing the
validator once fixes every workflow at once — and that is exactly what Phase 2 did.
The alternative (per-workflow depth enforcement) would have required 9 × N edits and
created drift risk. The centralised threshold catalogue in
`analysis/methodologies/reference-quality-thresholds.json` is keyed by `articleType`,
so extending coverage to a new article type is a JSON edit, not a workflow edit.

### 3.1 What Phase 2 changed

1. **Validator**: `src/utils/validate-analysis-completeness.ts` now reads the
   thresholds catalogue and applies per-artifact floors, with graceful fallback to
   the flat floor when a threshold is missing. Backward-compatible — workflows that
   pass `--min-lines=<n>` continue to get the flat floor as a last-resort check.
2. **Thresholds catalogue**: `analysis/methodologies/reference-quality-thresholds.json`
   now defines per-artifact floors for all 8 article types produced by the 9
   workflows (`breaking`, `week-in-review`, `month-in-review`, `week-ahead`,
   `month-ahead`, `committee-reports`, `motions`, `propositions`).
3. **Methodology**: Rule 22 in `analysis/methodologies/ai-driven-analysis-guide.md`
   v4.6 documents the spec, enforcement point, and Pass 2 obligation.
4. **Shared prompt**: `.github/prompts/SHARED_PROMPT_PATTERNS.md` §Per-Artifact
   Budgets exposes the breaking-workflow table and points to the JSON catalogue as
   single source of truth for other article types.
5. **Workflow preambles**: all 9 article-producing workflows' Shared-patterns
   reference line now cites Rule 22, §Per-Artifact Budgets, and
   `reference-quality-thresholds.json`. The generating agent therefore sees the
   per-file budget in its preamble, not only in the validator output after the fact.

### 3.2 What Phase 2 deliberately did not change

- **Workflow step scripts.** Every workflow calls the validator via the same npm
  script; a shell-level change was unnecessary and would have created per-workflow
  drift.
- **`news-translate.md`.** Translation does not produce analysis artifacts. The
  thresholds catalogue has no `translate` entry and the validator is never invoked
  from this workflow. Correct by omission.
- **`--min-lines` default (30).** Retained as the floor for any new article type
  not yet represented in the thresholds catalogue, preserving backward compatibility
  and providing a gentle on-ramp when a new article type is introduced.

---

## 4. Residual Risks and Mitigations

Three residual risks remain post–Phase 2; each has a defined mitigation path.

### 4.1 New article type lands without a thresholds entry

**Risk**: a developer creates a new workflow emitting `articleType: retrospective`
(for example). The thresholds catalogue has no `thresholds.retrospective` entry, so
every artifact falls back to the flat `--min-lines=30` floor.

**Mitigation**: Rule 22 §Enforcement mandates that "new article types enforce only
the flat floor until a threshold is added — a soft on-ramp that invites but does not
force calibration." A follow-up commit adding `thresholds.retrospective` is the
calibration step. A CI-level check (`validate-analysis-thresholds-coverage`) that
fails if any `articleType` observed in recent manifests has no thresholds entry is
a candidate v4.7 improvement but not required for v4.6.

### 4.2 Calibration drift

**Risk**: a future reference run produces depth that is either substantially higher
or lower than Run 184. If higher, the thresholds become too lax; if lower, the
thresholds become too strict and force unnecessary Pass 2 work.

**Mitigation**: `reference-quality-thresholds.json` carries a `version` field and a
`referenceBenchmark` pointer. Recalibrating thresholds is a deliberate PR — the
commit diff on the JSON file is small and human-readable. §7 of
`reference-analysis-quality.md` documents when recalibration is appropriate (three
consecutive reference-grade runs that move the mean ±15%).

### 4.3 Per-artifact thresholds leak into workflow-specific copy

**Risk**: a workflow preamble hardcodes specific line numbers (e.g. "PESTLE must be
≥250 lines") that diverge from the JSON catalogue over time.

**Mitigation**: the Phase 2 preamble update deliberately does *not* hardcode numbers;
it cites the JSON catalogue as the source of truth. The breaking extract table in
`SHARED_PROMPT_PATTERNS.md` §Per-Artifact Budgets carries an explicit note that the
JSON is authoritative when the table and the JSON diverge.

---

## 5. Recommended Follow-Ups (Out of Scope for This PR)

These are tracked for v4.7+ and should not block the current PR.

1. **Threshold coverage CI check**. Scan the last 30 days of `analysis/daily/**/manifest.json`,
   collect observed `articleType` values, assert that each has a complete entry in
   `reference-quality-thresholds.json`. Run on every PR that touches `analysis/` or
   the thresholds file. Effort: ~100 LOC + test.
2. **Manifest auto-population**. `scripts/sync-manifest.ts` walks the run directory
   before validation and populates `manifest.files` from the intelligence/risk-scoring/
   documents/classification subtrees. Prevents the class of missed-manifest-entry
   failure that affected Run 188's initial commit for the two new artifacts.
3. **Per-artifact micro-prompts**. Split each workflow's analysis step into N
   serialised LLM calls — one per required artifact — each given its line-budget as
   an explicit contract. Post-write `wc -l` assertion gate within the step. Heavier
   engineering lift; defer to v5.
4. **Reference-parity guard in `compile-agentic-workflows.yml`**. After artifact
   generation, diff the total line count against the designated reference run for
   the same article type. Fail the workflow if total is <90% of reference.
   Complements Rule 22 at the aggregate level. Effort: ~50 LOC.
5. **Regression-probe harness integration**. The TA-0101 regression documented in
   `mcp-reliability-audit.md` §5 should become Step 1 of `news-breaking.md`, probing
   the 5 reference texts (TA-0092/0094/0096/0101/0104) and writing a state-transition
   log that feeds `cross-run-diff.md` automatically. Closes the accessible→unavailable
   detection loop that this run opened manually.

---

## 6. Verification

The Phase 2 changes were verified end-to-end at this PR's commit:

| Check                                                 | Result |
|-------------------------------------------------------|--------|
| `npm run build:check` (tsc --noEmit)                  | ✅ clean |
| `npm run build` (tsc)                                 | ✅ clean |
| `npm run lint`                                        | ✅ 0 errors (111 pre-existing warnings) |
| `npm run test:unit` (2,830 tests across 40 files)     | ✅ all pass |
| New `test/unit/validate-analysis-completeness.test.js` (7 tests) | ✅ all pass |
| Validator on Run 184 reference with Rule 22 active    | ✅ PASSES |
| Validator on Run 188 with Rule 22 active              | ✅ correctly flags 8 short artifacts with `SHORT (n < threshold lines)` |
| Validator on missing thresholds catalogue (fixture)   | ✅ falls back to flat floor, no crash |
| Validator on malformed thresholds JSON (fixture)      | ✅ falls back to flat floor, no crash |

---

## 7. Sign-off

**The shallow-analysis failure mode identified in Run 188 existed across 9 of 10
sibling workflows and is now closed across all 9 by the Phase 2 validator extension,
without requiring any workflow-specific code change.** The centralised threshold
catalogue is the single-point adjustment for future depth calibration. Residual
risks are documented and tracked; none block this PR.

---

## 8. Analysis Sources

- `.github/workflows/news-breaking.md`, `news-weekly-review.md`, `news-monthly-review.md`,
  `news-week-ahead.md`, `news-month-ahead.md`, `news-committee-reports.md`,
  `news-motions.md`, `news-propositions.md`, `news-article-generator.md`,
  `news-translate.md` — the 10 workflows audited.
- `src/utils/validate-analysis-completeness.ts` — validator extension (Phase 2a).
- `analysis/methodologies/reference-quality-thresholds.json` — thresholds catalogue (Phase 2a).
- `analysis/methodologies/ai-driven-analysis-guide.md` §Rule 22 — methodology (Phase 2b).
- `.github/prompts/SHARED_PROMPT_PATTERNS.md` §Per-Artifact Budgets — shared prompt (Phase 2c).
- `test/unit/validate-analysis-completeness.test.js` — 7 unit tests for Rule 22.
- `analysis/daily/2026-04-19/breaking-run188/intelligence/reference-analysis-quality.md` — self-assessment scorecard.
- `analysis/daily/2026-04-19/breaking-run188/intelligence/mcp-reliability-audit.md` — TA-0101 regression + regression-probe harness.
