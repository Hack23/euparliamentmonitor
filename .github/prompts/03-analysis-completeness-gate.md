<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 03 — Analysis Completeness Gate (Stage C)

**Summary:** `validate-analysis-completeness` is the **blocking** gate between
analysis and article. Zero exit ⇒ proceed to Stage D. Non-zero exit ⇒ run Pass 3
on missing artifacts; retry once; on a second failure, produce an **analysis-only
PR** and skip article drafting entirely. Never ship an article without a green
gate.

## 1 · Invocation

```bash
npm run validate-analysis -- \
  --analysis-dir="${ANALYSIS_DIR}" \
  --article-type="${ARTICLE_TYPE_SLUG}"
# 0 = green; 1 = failed (run Pass 3); 2 = usage error
```

Do **not** pass `--warn-only` — that flag downgrades failures to warnings and
is disallowed in any workflow invocation.

## 2 · What the Validator Enforces

The **authoritative per-article-type required-artifact list** lives in
[`analysis/methodologies/reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json)
(keyed by `articleType × relativePath`) and the master map in
[`analysis/methodologies/artifact-catalog.md`](../../analysis/methodologies/artifact-catalog.md).
Do **not** hard-code artifact lists in workflow bodies — consult the JSON and
catalog. The validator enforces:

1. `intelligence/analysis-index.md` exists (Rule 19 read-me-first entry).
2. The seven reference-quality intelligence artifacts exist:
   `pestle-analysis`, `stakeholder-map`, `scenario-forecast`, `threat-model`,
   `historical-baseline`, `economic-context`, `wildcards-blackswans`.
3. `intelligence/synthesis-summary.md` composes the artifacts above.
4. Article-type-specific extras per `reference-quality-thresholds.json`
   (e.g. `coalition-dynamics.md` for breaking).
5. Every mandatory artifact ≥ its per-artifact line floor in the JSON (fallback ≥ 30 lines).
6. No `[AI_ANALYSIS_REQUIRED]`, `AI_ANALYSIS_PENDING`, `[TO BE FILLED]`,
   `[TBD]`, `TODO:` markers outside meta-documentation contexts.
7. Every mandatory artifact listed under `manifest.files.*` (no orphans).
8. `manifest.json` carries top-level `articleType` (Rule 6).
9. Per-artifact line floors from
   [`reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json)
   (keyed by `articleType × relativePath`).
10. `workflow-audit.md` and `methodology-reflection.md` are present as the
    final two artifacts of the run (see `ai-driven-analysis-guide.md` Step 10.5).

## 3 · Pre-Flight Checklist (one-shot)

Before calling the validator:

- [ ] `${ANALYSIS_DIR}/intelligence/analysis-index.md` exists and is read in full
- [ ] `${ANALYSIS_DIR}/manifest.json` lists every artifact on disk
- [ ] `artifactStats.totalFiles` and `analyticalFrameworksApplied.count` recorded
- [ ] Every `files.classification[]`, `files.risk_scoring[]`,
      `files.intelligence[]`, `files.documents[]` entry exists on disk and is
      ≥ 30 lines with no placeholder markers
- [ ] No orphan `.md` files in the run directory

Emit to stdout before running the validator:

```
PREFLIGHT_ATTESTATION: read N/N artifacts from ${ANALYSIS_DIR} (LINES lines, FRAMEWORKS frameworks)
```

## 4 · Failure Handling (Pass 3 loop)

```
1. Run validator.
2. If exit 0 → continue to Stage D.
3. If exit 1:
   a. Read the validator's SHORT/MISSING/PLACEHOLDER report.
   b. Run Pass 3 targeting only the named artifacts.
   c. Re-run the validator.
4. If second exit is non-zero → produce an ANALYSIS-ONLY PR
   (see 06-pr-and-safe-outputs.md §3). Do NOT draft an article.
```

You get at most **two** validator runs before committing to analysis-only. Do
not loop more than that — analysis-only output is valuable (Rule 5).

## 5 · Analysis-Only Exit (when gate ultimately fails)

If the gate does not go green after Pass 3, the agent SHIPS whatever analysis
exists as a single PR (still one PR — never two). Cross-run diff, forward
monitoring, and data-quality delta go into the same PR. See
[`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) §3.

## 6 · After a Green Gate

Next file to read: [`04-article-generation.md`](04-article-generation.md).
Article drafting begins only after this gate exits 0.

## 7 · Repo-Memory Checkpoint (MANDATORY, both outcomes)

Whether the gate exits 0 or routes to the analysis-only exit, **checkpoint
Stage C state to repo-memory** so a later crash in Stage D or the PR call
does not lose the validated artifact set:

```bash
scripts/checkpoint-analysis-to-memory.sh \
  "${ANALYSIS_DIR}" "${RUN_ID}" gate "${ARTICLE_TYPE_SLUG}"
```

Full per-phase protocol in [`02-analysis-protocol.md`](02-analysis-protocol.md) §10.
