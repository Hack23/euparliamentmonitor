<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 03 — Analysis Completeness Gate (Stage C)

**Summary:** Stage C is the **blocking agent-side readback gate** between
analysis and article render. GREEN ⇒ proceed to Stage D. RED ⇒ run Pass 3 on
missing or shallow artifacts; retry once; on a second failure, produce an
**analysis-only PR** and skip article rendering entirely. Never ship an article
without a green gate.

## 1 · Invocation

The repository now ships an authoritative validator at
[`scripts/validate-analysis-completeness.js`](../../scripts/validate-analysis-completeness.js)
exposed as `npm run validate-analysis -- <runDir>`. Stage C MUST shell out to
this script before emitting the gate line — never hand-eyeball the catalog when
a script can enforce it.

```bash
npm run validate-analysis -- analysis/daily/<date>/<article-type>
```

Exit codes:
- `0` ⇒ GREEN. Echo the validator's final `STAGE_C_GATE: GREEN …` line verbatim
  and proceed to Stage D.
- `1` ⇒ RED. Echo the validator's final `STAGE_C_GATE: RED …` line, run Pass 3
  on the artifacts the validator listed (mermaid:missing, short:N<floor,
  admiralty:missing, etc.), and re-run the validator. On a second RED, produce
  an **analysis-only PR** and skip article render — never ship an article
  without a green gate.
- `2` ⇒ tooling error (bad CLI args). Stop and ask for help.

Use `--json` for machine-readable output if downstream automation needs it.

```text
STAGE_C_GATE: GREEN articleType=<type> artifacts=<N> lines=<L>
STAGE_C_GATE: ANALYSIS_ONLY articleType=<type> reason="<why no article render>"
STAGE_C_GATE: RED articleType=<type> missing=<N> short=<N> placeholders=<N> mermaid_missing=<N> other=<N>
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

### Mandatory reader layer — `executive-brief.md`

Every GREEN article run MUST include root-level `${ANALYSIS_DIR}/executive-brief.md`.
It is the first rendered artifact in `article.md` and must contain a BLUF, three
decisions, 60-second read, top documents/procedures table, Mermaid risk snapshot,
and top forward trigger. `extended/executive-brief.md` is accepted only as a
legacy fallback when improving an older run; new runs write the root artifact.

### Optional — `extended/` artifacts (not required by default)

Artifacts written to `${ANALYSIS_DIR}/extended/` are **not required** for a
green gate by default. They are recommended for long-form review workflows and
crisis / breaking deep runs. Produce them only after every mandatory artifact
above has passed. If you register them in `manifest.files.extended[]` and they
have entries in
[`reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json),
the validator may enforce the corresponding checks (including per-artifact line
floors).

The 11 extended artifacts are: `devils-advocate-analysis`,
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

### 6b · Resuming a Same-Day Folder (repeated analysis runs — never no-op)

When the canonical folder `analysis/daily/${DATE}/${TYPE}/` already contains
a `manifest.json` from a prior run today, every re-run MUST **detect** the
prior analysis and **deepen** it. Re-running on the same date+type is never
a no-op: every artifact is either *extended* (raised in line count, evidence,
or new sections) or *rewritten*, and `news/<date>-<type>*.md` + HTML are
always regenerated by Stage D.

1. **Do not** trigger a `-run<NN>` or `-2` suffix — the shared folder is the
   single source of truth.
2. Stage A always produces `${ANALYSIS_DIR}/runs/prior-run-diff.json`
   (helper is unconditional — no env flag). Read it. Every artifact listed
   in `carryForward[]` is a **must-extend** target with `priorLines` and
   `extendFloor` exposed. Stage B is required to raise each one past its
   `extendFloor` (= `max(threshold floor, priorLines + 20)`) and to add at
   least one of: a new section, ≥3 new evidence citations, ≥1 new chart.
   Skip-writes (no `[EXTEND-FROM-PRIOR: …]` log line for a carry-forward
   artifact) are forbidden and surface here as RED `extend:skipped`.
3. The **validator runs on all artifacts** — including the
   carry-forward / extended ones. Stage C does not grant any exemptions:
   if an extended artifact still fails (new line count below the catalog
   floor, missing mermaid, placeholders), it surfaces as RED just like any
   freshly written artifact.
4. When the validator lists a carried-forward artifact as `short:N<floor`,
   annotate the Pass 3 target with
   `[FLOOR-RAISED: current floor <newFloor>; prior run validated under a lower floor]`
   so the reviewer understands why it regressed. The current
   `prior-run-diff.json` only exposes the current floor value, so an exact
   `<oldFloor>→<newFloor>` pair is not derivable without reading the prior
   run's threshold snapshot.
5. Load prior `manifest.json` and inspect every artifact's line count vs.
   `reference-quality-thresholds.json` floors AND the `extendFloor` from
   `prior-run-diff.json`.
6. Artifacts at/above floor in the prior run: **must be extended** —
   never skipped. Each must reach its `extendFloor` and add at least one
   of: a new section / ≥3 new evidence citations / ≥1 new chart. Stage C
   verifies `manifest.pass2.rewriteCount === <total artifact count>` on
   re-runs (a `rewriteCount` of `0` on a re-run is a hard RED).
7. Artifacts below floor or missing: write a stronger version (overwrite).
8. Append a new entry to `manifest.json.history[]` with this run's `runId`,
   timestamps, and `gateResult`.
9. Run the validator as normal. GREEN → single PR with the freshly
   regenerated `news/${DATE}-${TYPE}*.md` + HTML committed alongside the
   extended analysis.

See `02-analysis-protocol.md` §"Re-run improve/extend rule" for the full
contract.

## 7 · Stage-C Output Discipline (both outcomes)

Whether the gate exits 0 or routes to analysis-only, ensure the validated
artifact set remains complete in `${ANALYSIS_DIR}` and `manifest.json` is
current before moving on. Do not run per-phase repo-memory checkpoint commands.
