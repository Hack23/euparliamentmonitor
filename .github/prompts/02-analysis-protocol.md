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
| **Intelligence** (reference-quality 7 + extended) | `pestle-analysis`, `stakeholder-map`, `scenario-forecast`, `threat-model`, `historical-baseline`, `economic-context`, `wildcards-blackswans`, `synthesis-summary`, `analysis-index`, `coalition-dynamics`, `mcp-reliability-audit`, `per-file-political-intelligence`, `reference-analysis-quality`, `imf-vintage-audit` (optional) | OSINT, political-science, intelligence-analysis-techniques, electoral-analysis, behavioral-analysis |
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
  Pass 2 (not merely re-read). On a **re-run** (`manifest.json.history[]`
  non-empty before this run started), `rewriteCount` MUST equal the total
  artifact count — re-runs always extend or rewrite every artifact (see
  §"Re-run improve/extend rule" below). On a **first run** of the day,
  `rewriteCount === 0` is valid only when every artifact already met its
  floor on the first Pass 1 write. The Stage-C validator emits a hard RED
  on `rewriteCount === 0` for re-runs and warns on first runs when any
  artifact sits at exactly its floor.

**Re-run improve/extend rule (§1 of the plan) — never no-op:**

When `${ANALYSIS_DIR}/manifest.json` already exists with a non-empty
`history[]`, every re-run MUST **detect** the prior analysis (and any
already-rendered article under `news/`) and **deepen** it. Re-running a
workflow on the same date+type is **never** a no-op: every artifact is
either *extended* (raised in line count, evidence, or new sections) or
*rewritten*. Article markdown and HTML are always regenerated from the
updated analysis.

1. Load existing `manifest.json` — treat the folder as a resume candidate,
   not a conflict.
2. Always run the prior-run diff helper (no env flag, always-on):
   ```bash
   npm run prior-run-diff -- "${ANALYSIS_DIR}"
   ```
   The helper emits a `priorRunDiff` plan with `mode: "improve-and-extend"`:
   - `carryForward[]` — artifacts already at/above floor in the prior run.
     **These are must-extend targets, not skip-write targets.** Each entry
     exposes `priorLines` (current on-disk size from the prior run) and
     `extendFloor` (= `max(threshold floor, priorLines + 20)`). Stage B
     MUST raise each artifact past `extendFloor` AND add at least one of:
     a new section, ≥3 new evidence citations, or ≥1 new chart/diagram.
   - `rewrite[]` — artifacts below floor or missing. Write a stronger
     version from scratch, sized to the catalog floor.

   Persist the plan to `${ANALYSIS_DIR}/runs/prior-run-diff.json` for
   Stage C.
3. Run Stage-B Pass 1 + Pass 2 producing every mandatory artifact. For
   each carry-forward entry, log a single line per artifact when it is
   re-written so the Stage-C reviewer can see the delta:
   ```text
   [EXTEND-FROM-PRIOR: <relativePath> prior=<priorLines>L → new=<newLines>L (+<delta>)]
   ```
   Skip-writes (`[CARRY-FORWARD: …]`) are forbidden — emitting one is a
   Stage-C RED.
4. For artifacts in `rewrite[]`, write a stronger version (overwriting
   the prior file) sized to the catalog floor.
5. Run Stage C — if GREEN, append a history entry with
   `gateResult: "GREEN"`. Stage C validates every artifact via
   `npm run validate-analysis` and additionally checks each
   carry-forward artifact's new line count exceeds its `extendFloor`.

> **Always-on.** The legacy `ENABLE_PRIOR_RUN_MERGE` env flag is no longer
> read by `scripts/aggregator/prior-run-diff.js`. The helper runs
> unconditionally so re-runs cannot accidentally regress to the
> pre-2026-05 skip-write behaviour. Do not gate this rule on any env
> variable in workflow `env:` blocks.

> **Article render is always re-rendered on re-runs.** Stage D
> (`npm run generate-article`) is invoked on every workflow run regardless
> of analysis mtime; the renderer is byte-for-byte deterministic so an
> unchanged analysis still produces an identical, freshly written
> `article.md` + localized HTML files. Skipping Stage D on the basis of
> "no changes" is forbidden — see `04-article-generation.md`.

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
| Standard prospective / retrospective unified `news-<type>.md` (today, 7-day, 30-day windows) | **minute 22** — stop Pass 1, begin Pass 2 even if Pass 1 is incomplete; degraded artifacts > skipped Pass 2 | **minute 36** | **≤ minute 45** (target ≤ 42) |
| Long-horizon prospective (`quarter-ahead`, `year-ahead`, `term-outlook`) | **minute 25** — extended B1 for larger artifact sets | **minute 39** | **≤ minute 45** (target ≤ 42) |
| Long-horizon retrospective (`quarter-in-review`, `year-in-review`) | **minute 24** — slightly extended for cross-term analysis | **minute 38** | **≤ minute 45** (target ≤ 42) |
| Electoral-overlay (`election-cycle`) | **minute 28** — maximum B1 budget (B = 28 min per registry) | **minute 42** | **≤ minute 47** (target ≤ 44) |
| Translation helper (`news-translate.md`) | No Stage B | N/A (multi-call flush, exempt from single-PR rule) | N/A |

### Multi-Horizon Stage Budget Summary (`src/config/article-horizons.ts` is authoritative)

Exact per-slug stage budgets are defined in the `article-horizons.ts`
registry and MUST be treated as the source of truth. The table below is an
approximate planning summary only; if any row conflicts with the registry,
follow the registry for the specific slug.

| Representative budget pattern | Stage A | Stage B | Stage C | Stage D | Stage E | Total |
|-------------------------------|:-------:|:-------:|:-------:|:-------:|:-------:|:-----:|
| **Standard prospective examples** (`week-ahead`, `month-ahead`) | 5 | 22 | 4 | 2 | 2 | 35 |
| **Standard retrospective examples** (`week-in-review`, `month-in-review`) | 4 | 22 | 4 | 2 | 2 | 34 |
| **Extended prospective examples** (`quarter-ahead`, `year-ahead`, `term-outlook`) | 5 | 24–26 | 4 | 2 | 2 | 37–39 |
| **Extended analysis / overlay examples** (`election-cycle`, deep dives) | 5 | 28 | 4 | 2 | 2 | 41 |

All workflows enforce a hard **60-minute** `timeout-minutes` cap (raised
from 45 min in the gh-aw v0.71.3 refactor) with all stages targeted to
complete by **minute ≤ 45**, leaving a 15-minute buffer for sandbox
setup, MCP gateway boot, deterministic article render, and git push.
The MCP gateway uses its upstream default session lifetime (the
advertised `engine.mcp.session-timeout` field is currently broken: the
gh-aw v0.71.3 compiler emits `sessionTimeout` but the bundled gateway
image `ghcr.io/github/gh-aw-mcpg:v0.3.1` rejects it with
`additionalProperties 'sessionTimeout' not allowed`, run #25275823699
fingerprint). Backend MCP sessions are kept warm by
The MCP gateway uses its upstream default keepalive. The agent must
therefore land the single safe-outputs PR call within the 60-min
`timeout-minutes` cap regardless. Unused budget is NOT redistributed —
the agent exits cleanly after shipping the PR. Long-horizon or
deep-analysis workflows get extended B1 windows because they produce
additional mandatory artifacts (see §1b Family-D + forward-projection
set). Always verify the exact slug budget in
`src/config/article-horizons.ts` before treating a grouped example as exact.

### Stage B Sub-stage Budget (Pass 1 / Pass 2 split)

**Timing convention:** Absolute **workflow elapsed minutes** are authoritative.
Relative phrases such as "from Stage A end" are descriptive only and MUST NOT
override the absolute tripwires above.

| Sub-stage | Label | Budget / window (standard prospective example) |
|-----------|-------|:----------------------------------------------:|
| **B1** | Pass 1 — Initial Analysis | From **Stage A completion** until the **per-family B1→B2 tripwire** in the table above. For standard slugs (Stage A end ≈ minute 5, tripwire = minute 22) this yields **~17 min** for B1. |
| **B2** | Pass 2 — Read-back & Rewrite | Fixed absolute window: **B1→B2 tripwire → Stage C exit tripwire − 4 min** (e.g. minute 22 → minute 32 for standard slugs, **≥ 10 min**) before Stage C must run. |
| **C** | Completeness Gate | Fixed absolute window: **last 4 min before Stage C exit tripwire** (e.g. minute 32 → minute 36 for standard slugs). |

**Hard tripwire at the per-family minute mark:** At the start of each B1
artifact-write loop iteration, the agent MUST check elapsed workflow time.
If elapsed ≥ B1→B2 tripwire (table above), stop writing new Pass 1
artifacts and transition immediately to Pass 2. Pass 2 then occupies the
window to (Stage C exit − 4 min), after which Stage C must run and exit
by its tripwire. An incomplete artifact set with a genuine Pass 2 rewrite
is higher quality than a complete artifact set where "Pass 2" was only
inline checks during Pass 1.

**Pass 2 log in `manifest.json`:** When Pass 2 starts and ends, the agent
MUST write a top-level `pass2` block to `manifest.json`:

```json
{
  "pass2": {
    "startedAt": "2026-04-22T10:18:00Z",
    "endedAt":   "2026-04-22T10:32:00Z",
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

> **Why widen the budget?** gh-aw v0.71.3 raised the workflow
> `timeout-minutes` cap from 45 to 60 minutes. Note that the
> per-workflow `engine.mcp.session-timeout` knob advertised in v0.71.3
> is currently non-functional — the bundled gateway image v0.3.1
> rejects the field (run #25275823699). The MCP gateway falls back to
> its upstream default session lifetime, and
> The MCP gateway default keepalive keeps backend sessions warm.
> The 60-min `timeout-minutes` cap (vs the prior 45-min schedule) is
> what gives Pass 2 a ≥ 10-min absolute window (vs the prior 4-min
> floor) for genuine read-back-and-rewrite quality work — see run
> [#24963129839](https://github.com/Hack23/euparliamentmonitor/actions/runs/24963129839)
> (`news-week-in-review`, Stage B suffered two context compactions, the
> elapsed-time tripwire fired at minute 28, single
> `safeoutputs___create_pull_request` call landed at minute 29 →
> `session not found` HTTP 404 → zero safe outputs shipped) for the
> historical motivation behind the explicit ceilings.

The schedule is built around **three distinct deadlines** in every unified
news workflow (see #1444 and run #24963129839 for the original rationale
that motivated the explicit ceilings):

1. **Stage B1 → B2 tripwire** — regardless of Pass 1 completeness, Pass 2
   begins at the per-family tripwire (table above). The agent logs
   `pass2.startedAt` to `manifest.json` at this point.
2. **Stage C exit tripwire** — elapsed-time backstop that fires
   regardless of GREEN/RED. The agent computes elapsed minutes at the
   top of every Stage C iteration and forces `GATE_RESULT=ANALYSIS_ONLY`
   when the threshold is reached, even if Stage C has just emitted
   GREEN. This guarantees Stage D + E retain budget before the PR call.
3. **safe-outputs `create_pull_request` deadline** — must land by the
   per-workflow PR-call deadline above (≤ minute 45 for standard slugs;
   ≤ minute 47 for electoral). The MCP gateway uses its upstream
   default session lifetime (`engine.mcp.session-timeout` is currently
   non-functional, see preceding note); the gateway's default keepalive
   keeps backends warm. The PR-call deadline is governed by
   `timeout-minutes` and Stage E budget.

Per-slug values live in `src/config/article-horizons.ts`
(`stageBudgets`) — see [`09-troubleshooting.md`](09-troubleshooting.md) §5
for the historical TTL recovery rules. Stage A ≤ 4–5 min, Stage D ≤ 2
min (deterministic render), and Stage E ≤ 2 min are common to every
article-generating workflow.

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

### Pass 2 Explicit Checklist (what Pass 2 MUST do)

Pass 2 is NOT optional — it is the phase where quality is achieved. The
agent MUST execute every item below during Pass 2:

1. **Re-read every artifact end-to-end** — do not skim. Read the full text
   of every file written in Pass 1 to identify shallow, generic, or
   placeholder content.
2. **Fill all placeholder markers** — search for `[AI_ANALYSIS_REQUIRED]`,
   `[TBD]`, `TODO:`, `PLACEHOLDER`, `INSERT`, and replace with substantive
   political-intelligence content.
3. **Cite evidence in every paragraph** — each analytical paragraph must
   reference a specific data source (EP MCP feed result, IMF indicator,
   committee vote outcome, MEP statement). Generic claims without evidence
   are rewritten.
4. **Deduplicate cross-artifact content** — if the same finding appears in
   `pestle-analysis.md` and `synthesis-summary.md`, the synthesis must cite
   the PESTLE file and add value (not repeat it).
5. **Expand SWOT items** — every SWOT item must be ≥ 80 words with
   specific actors, dates, and measurable impacts. One-liners are rewritten.
6. **Expand stakeholder perspectives** — every stakeholder entry must be
   ≥ 150 words with position rationale, coalition alignment, and
   influence-pathway analysis. Shallow entries are rewritten.
7. **Verify IMF data context** — economic/fiscal/monetary claims MUST cite
   IMF as the sole authoritative source (not World Bank for economic
   indicators). Cross-check that indicator codes and vintage dates are
   present.
8. **Lift forward-looking analysis** — scenario forecasts, forward
   projections, and risk matrices must contain horizon-specific probability
   bands (WEP decay), structural-break triggers, and at least one
   quantified outcome per scenario branch.

### Pass-2 Readback Rules for Long-Horizon Scenarios (≥90-day horizons)

When the article type has a data window ≥ 90 days (per
`src/config/article-horizons.ts`), Pass 2 readback applies additional gates:

1. **Scenario floor enforcement:** `intelligence/scenario-forecast.md` MUST
   contain **≥ 6 distinct scenarios** for `term-outlook` and `election-cycle`
   article types: 1 mainline scenario + 2 adjacent scenarios + 1
   regime-change branch + 2 wildcard/black-swan scenarios (= 6 minimum).
   Fewer than 6 on a long-horizon run triggers a Pass 2 rewrite of the
   scenario artifact.

2. **Structural-break section non-empty:** For any horizon ≥ 12 months,
   `intelligence/scenario-forecast.md` MUST have a non-empty
   `## Structural-Break Detection` section listing at least one tripwire
   evaluation (even if all tripwires are currently inactive). See
   [`forward-projection-methodology.md` §4](../../analysis/methodologies/forward-projection-methodology.md).

3. **WEP decay compliance:** Every forward-looking probability judgment in
   `intelligence/forward-projection.md` must carry a WEP band appropriate to
   its horizon (per the canonical decay table in
   [`forward-projection-methodology.md` §3](../../analysis/methodologies/forward-projection-methodology.md)).
   Pass 2 must verify no evasion to "About even" at short horizons where
   tighter bands are required.

4. **Carry-forward hygiene:** For re-runs on the same day/type, every
   forward-statement carried from a prior run must be resolved as
   `implemented`, `superseded`, `stale`, or explicitly `extended`. More than
   2 unresolved expired items on a ≥ 90-day horizon requires Pass-2 cleanup
   and, if still present after readback, must be called out as maintainer
   hygiene for manual Stage-C review rather than assumed as an automatic RED
   validator gate.

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
- Rely on the MCP gateway default keepalive behavior
  plus the single end-of-run PR snapshot in
  [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md).

### 10a · Context-Compaction Defensive Pattern

The Copilot CLI compacts agent context once it exceeds a model-dependent
threshold (typically after 8–12 large artifacts in Stage B). Compacted
content is summarised, not preserved verbatim, which limits Pass 2's
ability to read-back early artifacts in full. Defensive pattern:

1. **Write artifacts to disk as they are produced.** Pass 1 writes are
   the authoritative copy — never hold a finished artifact in chat
   context "to extend later." Once written, the disk file survives
   compaction.
2. **Pass 2 reads from disk, not from chat memory.** Open every
   artifact path explicitly via the file-read tool at Pass 2 start;
   do not rely on the agent remembering the prose it wrote 12 minutes
   earlier.
3. **Order Pass 1 writes by depth-floor, not by analytical convenience.**
   Write the highest-floor artifacts (`synthesis-summary`, `pestle-analysis`,
   `threat-model`, `scenario-forecast`) first, while context is freshest.
   Lower-floor artifacts (`analysis-index`, `methodology-reflection`)
   tolerate compaction-summarised inputs better.
4. **Log `[COMPACTION-SURVIVED: <relativePath>]`** in Pass 2 for every
   artifact that Pass 2 explicitly re-opens from disk via the file-read
   tool, so the Stage-C reviewer can see which artifacts were verified
   from durable storage rather than relied on from in-context chat. This
   is unconditional — the agent does not need to detect when a
   compaction event occurred; the log line is emitted for every
   disk-reopened artifact during Pass 2.

This pattern was raised in the 2026-04-30 breaking-news methodology
reflection — the run hit a compaction event after 8 artifacts and Pass 2
depth on the first batch was structurally limited.

