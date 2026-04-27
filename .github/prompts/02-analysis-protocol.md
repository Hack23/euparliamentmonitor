<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 02 — Analysis Protocol (Stage B)

**Summary:** Read every methodology and template. Apply them to the data from
Stage A. Write all mandatory artifacts. **Mandatory 2-pass improvement.** No
article drafting until Stage C (completeness gate) exits 0.

## 1 · Authoritative References

- **Protocol:** [`analysis/methodologies/ai-driven-analysis-guide.md`](../../analysis/methodologies/ai-driven-analysis-guide.md) (10-step protocol, Rules 1–22) — **canonical guide**, read in full every run
- **Master artifact map:** [`analysis/methodologies/artifact-catalog.md`](../../analysis/methodologies/artifact-catalog.md) — every artifact → methodology + template + depth floor + Mermaid type
- **Per-artifact construction rules:** [`analysis/methodologies/per-artifact-methodologies.md`](../../analysis/methodologies/per-artifact-methodologies.md) — one `### section` per artifact type
- **Reference run:** `analysis/daily/2026-04-18/breaking-run184/` — 17 artifacts, 3600+ lines, 13 frameworks
- **Methodology guides:** [`analysis/methodologies/`](../../analysis/methodologies/) (classification, threat, SWOT, risk, style, OSINT tradecraft, WB/IMF indicator mappings)
- **Templates (39 total):** [`analysis/templates/`](../../analysis/templates/) — 6 framework + 14 agentic-workflow + 25 per-artifact templates, indexed in [`analysis/templates/README.md`](../../analysis/templates/README.md)
- **Per-artifact line floors:** [`analysis/methodologies/reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json) (keyed by `articleType × relativePath`) — enforced by the Stage-C agent-side readback; there is no standalone runtime validator in the aggregator era.
- **Article pipeline reference:** [`Article-Generation.md`](../../Article-Generation.md) — end-to-end contract for `article.md`, SEO metadata, UI/UX export, and static-site render outputs.

## 1b · Analysis Artifacts to Produce (39-template catalog)

Every run produces the per-run subset of these 39+ templates. The **article-type-specific required set** is defined by `reference-quality-thresholds.json` and enforced at Stage C. Group by artifact catalog:

| Group | Templates | Owner skills / methodologies |
|-------|-----------|------------------------------|
| **Classification** (6) | `significance-classification`, `significance-scoring`, `actor-mapping`, `forces-analysis`, `impact-matrix`, `political-classification` | `political-classification-guide.md`, intelligence-analysis-techniques |
| **Threat assessment** (5) | `political-threat-landscape`, `actor-threat-profiles`, `consequence-trees`, `legislative-disruption`, `threat-analysis` | `political-threat-framework.md` (5-framework integrated), threat-modeling |
| **Risk scoring** (5) | `risk-matrix`, `risk-assessment`, `quantitative-swot`, `political-capital-risk`, `legislative-velocity-risk` | `political-risk-methodology.md`, `political-swot-framework.md`, risk-assessment-frameworks |
| **Intelligence** (reference-quality 7 + extended) | `pestle-analysis`, `stakeholder-map`, `scenario-forecast`, `threat-model`, `historical-baseline`, `economic-context`, `wildcards-blackswans`, `synthesis-summary`, `analysis-index`, `coalition-dynamics`, `mcp-reliability-audit`, `per-file-political-intelligence`, `reference-analysis-quality`, `imf-vintage-audit` (optional — Wave-3) | OSINT, political-science, intelligence-analysis-techniques, electoral-analysis, behavioral-analysis |
| **Executive reader layer** | `executive-brief.md` at run root (mandatory first article artifact; `extended/executive-brief.md` accepted only for legacy runs) | `synthesis-methodology.md`, ICD 203 BLUF, Riksdagsmonitor article pattern |
| **Strategic extensions** (Family C) | `devils-advocate-analysis`, `historical-parallels`, `forward-indicators`, `intelligence-assessment`, `comparative-international` | `strategic-extensions-methodology.md`, ACH, ICF/ODNI standards |
| **Domain-specific** (Family D) | `coalition-mathematics`, `implementation-feasibility`, `media-framing-analysis`, `voter-segmentation` | `electoral-domain-methodology.md`, coalition analysis, electoral forecasting |
| **Provenance** (Family B) | `cross-reference-map`, `data-download-manifest` | `structural-metadata-methodology.md`, GDPR audit, citation provenance |
| **Existing / cross-run** | `deep-analysis`, `stakeholder-impact`, `voting-patterns`, `cross-session-intelligence`, `cross-run-diff`, `session-baseline` | legislative-monitoring, behavioral-analysis |
| **Documents** | `document-analysis-index` | OSINT |
| **Workflow self-audit (last)** | `workflow-audit`, `methodology-reflection` | ai-first-quality, process hygiene |

`methodology-reflection.md` is the **final** artifact of every run (after `workflow-audit.md`) — see `ai-driven-analysis-guide.md` Step 10.5.

## 2 · Analysis Directory Structure

Every analysis run writes to the **canonical stable same-day folder**:

```
analysis/daily/{YYYY-MM-DD}/{article-type-slug}/
├── classification/    (significance-classification, actor-mapping, forces-analysis, impact-matrix)
├── executive-brief.md (mandatory BLUF / 60-second read / top trigger)
├── threat-assessment/ (political-threat-landscape, actor-threat-profiling, consequence-trees, legislative-disruption)
├── risk-scoring/      (risk-matrix, quantitative-swot, political-capital-risk, legislative-velocity-risk, agent-risk-workflow)
├── intelligence/      (pestle-analysis, stakeholder-map, scenario-forecast, threat-model, historical-baseline, economic-context, wildcards-blackswans, synthesis-summary, analysis-index, coalition-dynamics, mcp-reliability-audit)
├── existing/          (deep-analysis, stakeholder-impact, coalition-dynamics, voting-patterns, cross-session-intelligence, synthesis-summary)
├── documents/         (document-analysis-index)
├── data/              (raw MCP data — may be excluded from PR)
├── runs/              (per-attempt diagnostics: prompt, preflight log, pass-3 notes)
└── manifest.json      (top-level articleType, files.*, artifactStats, history[])
```

**No `-run<NN>` suffix.** Repeated analysis runs on the same date+type reuse
this folder and append to `manifest.json.history[]`. The article workflow
reads this exact path from `HEAD` of `main` after the analysis PR merges.

**`manifest.json.history[]` — per-attempt audit entry (see
[`src/utils/file-utils.ts`](../../src/utils/file-utils.ts)
`AnalysisManifestHistoryEntry`):**

```json
{
  "runId": "breaking-run-100-1729876543",
  "startedAt": "2026-04-22T10:00:00Z",
  "finishedAt": "2026-04-22T10:42:00Z",
  "commit": "a1b2c3d",
  "gateResult": "GREEN",
  "filesWritten": ["intelligence/synthesis-summary.md", "..."]
}
```

**`manifest.json.pass2` — Pass 2 phase audit log (top-level, written by the
agent when Stage B2 begins and ends):**

```json
{
  "pass2": {
    "startedAt": "2026-04-22T10:18:00Z",
    "endedAt":   "2026-04-22T10:24:00Z",
    "rewriteCount": 4
  }
}
```

- `startedAt`: ISO-8601 timestamp when the agent began Pass 2 (the
  minute-16 tripwire fires or Pass 1 finishes early, whichever comes
  first).
- `endedAt`: ISO-8601 timestamp when Pass 2 ended (before Stage C).
- `rewriteCount`: number of artifacts whose content was changed during
  Pass 2 (not merely re-read). A `rewriteCount` of `0` is valid **only**
  when all artifacts were already above their line floors from a prior
  same-day run. The Stage-C validator warns when `rewriteCount === 0`
  and any artifact sits at exactly its floor.

**Re-run merge rule (§1 of the plan):**

1. Load existing `manifest.json` — if present, treat the folder as a resume
   candidate, not a conflict.
2. Run Stage-B Pass 1 + Pass 2 producing every mandatory artifact.
3. For each artifact already at or above its
   `reference-quality-thresholds.json` floor, **carry forward** the existing
   content unless Stage A produced new substantive data that changes its
   conclusions.
4. For artifacts below threshold, write a stronger version (overwriting the
   prior file).
5. Run Stage C — if GREEN, append a history entry with `gateResult: "GREEN"`.

> **Canonical paths:** `synthesis-summary.md` lives under `intelligence/` (the
> canonical location, as enforced by `reference-quality-thresholds.json`).
> Older `motions-*` and review runs may additionally **mirror** it (and a few
> other intelligence artifacts) into `existing/` — see
> [`artifact-catalog.md` "Mirror artifacts"](../../analysis/methodologies/artifact-catalog.md).
> There is no top-level `synthesis/` or `risk/` directory; use
> `intelligence/synthesis-summary.md` and `risk-scoring/risk-matrix.md`.

### 2a · How to Write Analysis Artifacts (use the native file tool)

**Always use the Copilot CLI native `create` / `Write` file tool** (the one that appears as `● Create <path> +N` in the run log, not prefixed with `(shell)`) to write every analysis artifact and every article `.md` file. It bypasses the bash safety filter and is the pattern used by the reference-quality [run 24805100070](https://github.com/Hack23/euparliamentmonitor/actions/runs/24805100070) that produced 10 artifacts in ~10 minutes.

**Never use `cat > file << 'EOF' … EOF` heredocs to write analysis prose or SWOT/stakeholder/risk content.** The Copilot CLI bash-safety filter scans the heredoc body and rejects writes whose content contains bare-command tokens — most notably the word *"kill"*, which is endemic in political analysis (*"motion to kill the bill"*, *"amendment killed in committee"*, *"kill switch clause"*). The rejection surfaces as the misleading error `"Command not executed. The 'kill' command must specify at least one numeric PID."` and costs ~60 seconds per attempt. See [`09-troubleshooting.md` §5](09-troubleshooting.md) for the full failure mode.

`cat > file` and `cat > file << EOF` **are** still safe for:
- Short housekeeping files without natural-language content (`manifest.json` via `jq`, SPDX-only stubs, short configs)
- `cp` / mirror copies of already-written artifacts into `existing/`
- Files written from a shell variable whose content was produced by a tool, not by the agent

## 3 · Minimum Analysis Time

| Workflow family | Stage B1→B2 tripwire | Stage C exit tripwire | PR-call deadline |
|----------|:------------------------------------:|:--------------------:|:----------------:|
| Every unified `news-<type>.md` (all article types — today, 7-day, and 30-day windows) | **minute 16** — stop Pass 1, begin Pass 2 even if Pass 1 is incomplete; degraded artifacts > skipped Pass 2 | **minute 22** | **≤ minute 25** (target ≤ 22) |
| Translation helper (`news-translate.md`) | No Stage B | N/A (multi-call flush, exempt from single-PR rule) | N/A |

### Stage B Sub-stage Budget (Pass 1 / Pass 2 split)

**Timing convention:** Absolute **workflow elapsed minutes** are authoritative.
Relative phrases such as "from Stage A end" are descriptive only and MUST NOT
override the absolute tripwires above.

| Sub-stage | Label | Budget / window |
|-----------|-------|:---------------:|
| **B1** | Pass 1 — Initial Analysis | From **Stage A completion** until the **absolute minute-16 tripwire**. If Stage A ends by minute 4, this yields **≤ 12 min** for B1. |
| **B2** | Pass 2 — Read-back & Rewrite | Fixed absolute window: **minute 16 → minute 20** (**≥ 4 min**) before Stage C must run. |
| **C** | Completeness Gate | Fixed absolute window: **minute 20 → minute 22** (**≤ 2 min**) before the Stage C exit tripwire. |

**Hard tripwire at minute 16:** At the start of each B1 artifact-write loop
iteration, the agent MUST check elapsed workflow time. If elapsed ≥ 16
minutes, stop writing new Pass 1 artifacts and transition immediately to
Pass 2. Pass 2 then occupies the minute-16 → minute-20 window, after which
Stage C must run and exit by minute 22. An incomplete artifact set with a
genuine Pass 2 rewrite is higher quality than a complete artifact set
where "Pass 2" was only inline checks during Pass 1.

**Pass 2 log in `manifest.json`:** When Pass 2 starts and ends, the agent
MUST write a top-level `pass2` block to `manifest.json`:

```json
{
  "pass2": {
    "startedAt": "2026-04-22T10:18:00Z",
    "endedAt":   "2026-04-22T10:24:00Z",
    "rewriteCount": 4
  }
}
```

`rewriteCount` is the number of artifacts rewritten (content changed, not
merely re-read) and MUST be a non-negative integer. `startedAt` and
`endedAt` MUST be non-empty ISO-8601 strings. A `rewriteCount` of `0` is
valid only when every artifact was already above its
`reference-quality-thresholds.json` floor coming into Pass 2 (e.g. a re-run
that carries forward prior-run content). The Stage-C validator emits a
`WARN pass2-skipped-heuristic` when `rewriteCount === 0` (or the `pass2`
block is missing/malformed) and any artifact sits exactly at its floor line
count; malformed schema additionally produces a `WARN manifest.pass2
invalid schema` line listing each invalid field.

> **Why one budget for all unified workflows?** The previous 7-day-window
> 25 / ≤28 split sat on the edge of the observed 28–30 min safeoutputs
> session TTL. Run [#24963129839](https://github.com/Hack23/euparliamentmonitor/actions/runs/24963129839)
> (`news-week-in-review`) hit it: Stage B suffered two context
> compactions, the elapsed-time tripwire fired at minute 28, and the
> single `safeoutputs___create_pull_request` call landed at minute 29 →
> `session not found` HTTP 404 → zero safe outputs shipped. The
> tightened 22 / ≤25 budget — already proven for the 30-day workflows
> after #1444 and #24957585804 — gives a 3–5 min margin below the
> failure window and absorbs Stage B compaction overruns. The
> per-stage ceilings in the 7-day workflows shrink to **A ≤ 4, B
> 12–15 (B1 minutes 4→16, B2 minutes 16→20), C ≤ 2 (minutes 20→22) = 22 min** to match.

The schedule is built around **three distinct deadlines** in every unified
news workflow (see #1444 for the original rationale and the failure mode
that motivated the explicit ceilings):

1. **Stage B1 → B2 tripwire (minute 16)** — regardless of Pass 1
   completeness, Pass 2 begins at minute 16. The agent logs
   `pass2.startedAt` to `manifest.json` at this point.
2. **Stage C exit tripwire** — elapsed-time backstop that fires
   regardless of GREEN/RED. The agent computes elapsed minutes at the
   top of every Stage C iteration and forces `GATE_RESULT=ANALYSIS_ONLY`
   when the threshold is reached, even if Stage C has just emitted
   GREEN. This guarantees Stage D + E retain budget before the PR call.
3. **safe-outputs `create_pull_request` deadline** — must land by the
   stricter of (a) the per-workflow PR-call deadline above or (b) the
   ~28–30 min observed safeoutputs MCP HTTP session TTL. Once the
   session is reaped, the analysis branch exists locally but cannot be
   pushed via safeoutputs and the run ships zero safe outputs.

30-day workflows (`news-month-in-review`, `news-month-ahead`) and 7-day
workflows now share the tighter 22 / ≤25 split — see
[`09-troubleshooting.md`](09-troubleshooting.md) §5 for the underlying
TTL and recovery rules. Stage A ≤ 4 min, Stage D ≤ 2 min (deterministic
render), and Stage E ≤ 1–2 min are common to every article-generating
workflow.

Stage D is deterministic rendering, not a prose pass. Spend the active-work
budget in Stage B/C so the artifacts already contain the article-quality
analysis before the aggregator writes `${ANALYSIS_DIR}/article.md` and `news/**`.

## 4 · Mandatory 2-Pass Improvement (NON-NEGOTIABLE)

| Pass | Action | Time |
|------|--------|:----:|
| **1 · Initial Analysis** | Apply every methodology + template to every Stage A data file. Write every mandatory artifact. | ~60% |
| **2 · Read-back & Improve** | Read every file you wrote, end to end. Expand shallow sections, add evidence citations, add confidence levels, add cross-refs between files. Rewrite anything that fails the Economist Test. | ~40% |

**Quality gates (Pass 2 exit criteria):**
- Every mandatory artifact ≥ 30 lines and above its threshold in
  `reference-quality-thresholds.json`.
- No `[AI_ANALYSIS_REQUIRED]`, `AI_ANALYSIS_PENDING`, `[TBD]`, `TODO:` markers.
- Evidence citations in ≥ 80 % of paragraphs.
- Confidence level (🟢/🟡/🔴) on every aggregate finding.
- Cross-references between artifacts.

## 5 · Reference-Quality Depth (seven deep-intelligence artifacts)

Compare Pass 2 output to Run 184. These seven artifacts distinguish
reference-quality:

1. `intelligence/pestle-analysis.md`
2. `intelligence/stakeholder-map.md`
3. `intelligence/scenario-forecast.md`
4. `intelligence/threat-model.md`
5. `intelligence/historical-baseline.md` (mandatory for weekly/monthly review)
6. `intelligence/economic-context.md`
7. `intelligence/wildcards-blackswans.md`

## 6 · Per-Artifact Budget Enforcement (Rule 22)

Stage C applies per-artifact floors from
[`reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json)
during the agent-side readback. When a file is SHORT, run a targeted Pass 2 on
THAT file — do not pad, write substantive prose with evidence anchors. Count
lines the same way the thresholds are defined: `text.split('\n').length`, not a
shell-only `wc -l` shortcut.

## 7 · Analytical Frameworks

| Framework | Use for |
|-----------|---------|
| ACH (Analysis of Competing Hypotheses) | Alternative explanations for voting shifts |
| SWOT | Political group strategic positions |
| PESTLE | Political / Economic / Social / Technological / Legal / Environmental |
| Stakeholder mapping (Mendelow power × interest) | Interest + influence on legislation |
| Red team / devil's advocacy | Stress-test consensus narratives |

## 8 · Stakeholder 6-Lens Model

Every major parliamentary action gets analysed from ≥ 4 of these, ≥ 150 words
per perspective:

1. EP Political Groups
2. Civil Society & NGOs
3. Industry & Business
4. National Governments
5. EU Citizens (make concrete — e.g. "a Polish nurse seeking work in Germany")
6. EU Institutions (Commission / Council / ECB / CJEU)

Each perspective must state: (1) mechanism of impact, (2) EP-data evidence,
(3) likely response.

## 9 · Exit Criteria (hand-off to Stage C)

- Every mandatory file listed in manifest `files.*`.
- No orphan files on disk.
- `manifest.json` carries top-level `articleType`.
- For shared-folder re-runs: `manifest.json.history[]` has an entry for this
  run (started, not yet finished).
- `manifest.json` carries a top-level `pass2` block with `startedAt`,
  `endedAt`, and `rewriteCount` (see §3 for schema). Omitting this block
  triggers a `WARN pass2-skipped-heuristic` at Stage C when any artifact
  sits exactly at its line floor.
- Pass 2 verification complete (read every artifact end-to-end, rewrote
  shallow sections).
- Now run the completeness gate:
  [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md).

After Stage C is green in a unified `news-<type>.md` workflow: proceed directly
to Stage D, run `npm run generate-article -- --run "$ANALYSIS_DIR"`, read the
generated `${ANALYSIS_DIR}/article.md` for obvious metadata/provenance issues,
then ship the single combined PR (see
[`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) §3).

## 10 · Persistence & Session Reliability

- Treat `${ANALYSIS_DIR}` as the canonical durable workspace for Stages A–D.
- Keep every analysis artifact and manifest update on disk in real time; do not
  defer writes until stage end.
- Do **not** use per-phase repo-memory checkpoint or heartbeat patterns.
- Rely on workflow-level MCP gateway keepalive (`sandbox.mcp.keepalive-interval`)
  plus the single end-of-run PR snapshot in
  [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md).
