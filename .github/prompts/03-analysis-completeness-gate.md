<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 03 — Analysis Completeness Gate (Stage C)

**Summary:** Stage C is the **blocking agent-side readback gate** between
analysis and article render. GREEN ⇒ proceed to Stage D. RED ⇒ run Pass 3 on
missing or shallow artifacts; retry once; on a second failure, produce an
**analysis-only PR** and skip article rendering entirely. Never ship an article
without a green gate.

## 1 · Invocation

There is no standalone `npm run validate-analysis` command in the current
aggregator-era repository. The agent performs the gate by reading every
manifest-listed artifact and comparing it against the catalog, thresholds, and
quality signals below. Emit one of these exact lines before Stage D:

```text
STAGE_C_GATE: GREEN articleType=<type> artifacts=<N> lines=<L> imf=<pass|not_required>
STAGE_C_GATE: ANALYSIS_ONLY articleType=<type> reason="<why no article render>"
STAGE_C_GATE: RED articleType=<type> missing=<N> short=<N> placeholders=<N>
```

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

### Optional — `extended/` artifacts (not required by default)

Artifacts written to `${ANALYSIS_DIR}/extended/` are **not required** for a
green gate by default. They are recommended for long-form review workflows and
crisis / breaking deep runs. Produce them only after every mandatory artifact
above has passed. If you register them in `manifest.files.extended[]` and they
have entries in
[`reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json),
the validator may enforce the corresponding checks (including per-artifact line
floors).

The 12 extended artifacts are: `executive-brief`, `devils-advocate-analysis`,
`historical-parallels`, `coalition-mathematics`, `forward-indicators`,
`intelligence-assessment`, `implementation-feasibility`, `media-framing-analysis`,
`comparative-international`, `cross-reference-map`, `data-download-manifest`,
`voter-segmentation`. Construction rules: see
[`per-artifact-methodologies.md §extended`](../../analysis/methodologies/per-artifact-methodologies.md)
and the dedicated methodologies
([synthesis](../../analysis/methodologies/synthesis-methodology.md),
[strategic-extensions](../../analysis/methodologies/strategic-extensions-methodology.md),
[per-document](../../analysis/methodologies/per-document-methodology.md),
[structural-metadata](../../analysis/methodologies/structural-metadata-methodology.md),
[electoral-domain](../../analysis/methodologies/electoral-domain-methodology.md)).

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
3. If RED:
   a. Read the SHORT/MISSING/PLACEHOLDER report you just produced.
   b. Run Pass 3 targeting only the named artifacts.
   c. Re-run the Stage-C readback.
4. If the second Stage-C readback is still RED → produce an ANALYSIS-ONLY PR
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

In the current unified `news-<type>.md` workflows, Stage C GREEN is the inline
hand-off to Stage D. Next read
[`04-article-generation.md`](04-article-generation.md) and
[`Article-Generation.md`](../../Article-Generation.md), then invoke the
deterministic aggregator. There is no paired article workflow and no AI-authored
HTML prose pass.

## 6b · Resuming a Same-Day Folder (repeated analysis runs)

When the canonical folder `analysis/daily/${DATE}/${TYPE}/` already contains
a `manifest.json` from a prior run today:

1. **Do not** trigger a `-run<NN>` or `-2` suffix — the shared folder is the
   single source of truth.
2. Load prior `manifest.json` and inspect every artifact's line count vs.
   `reference-quality-thresholds.json` floors.
3. Artifacts at/above floor: **carry forward** (do not rewrite) unless new
   Stage-A data materially changes their conclusions.
4. Artifacts below floor or missing: write a stronger version (overwrite).
5. Append a new entry to `manifest.json.history[]` with this run's `runId`,
   timestamps, and `gateResult`.
6. Run the validator as normal. GREEN → single analysis PR; the paired
   article workflow consumes whatever is at `HEAD` of `main` after merge.

See `02-analysis-protocol.md` §2 for the full re-run merge rule.

## 7 · Stage-C Output Discipline (both outcomes)

Whether the gate exits 0 or routes to analysis-only, ensure the validated
artifact set remains complete in `${ANALYSIS_DIR}` and `manifest.json` is
current before moving on. Do not run per-phase repo-memory checkpoint commands.
