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
- **Per-artifact line floors:** [`analysis/methodologies/reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json) (keyed by `articleType × relativePath`) — enforced by `npm run validate-analysis`

## 1b · Analysis Artifacts to Produce (39-template catalog)

Every run produces the per-run subset of these 39 templates. The **article-type-specific required set** is defined by `reference-quality-thresholds.json` and enforced at Stage C. Group by artifact catalog:

| Group | Templates | Owner skills / methodologies |
|-------|-----------|------------------------------|
| **Classification** (6) | `significance-classification`, `significance-scoring`, `actor-mapping`, `forces-analysis`, `impact-matrix`, `political-classification` | `political-classification-guide.md`, intelligence-analysis-techniques |
| **Threat assessment** (6) | `political-threat-landscape`, `actor-threat-profiles`, `consequence-trees`, `legislative-disruption`, `threat-analysis`, `political-stride-assessment` | `political-threat-framework.md`, threat-modeling |
| **Risk scoring** (5) | `risk-matrix`, `risk-assessment`, `quantitative-swot`, `political-capital-risk`, `legislative-velocity-risk` | `political-risk-methodology.md`, `political-swot-framework.md`, risk-assessment-frameworks |
| **Intelligence** (reference-quality 7 + extended) | `pestle-analysis`, `stakeholder-map`, `scenario-forecast`, `threat-model`, `historical-baseline`, `economic-context`, `wildcards-blackswans`, `synthesis-summary`, `analysis-index`, `coalition-dynamics`, `mcp-reliability-audit`, `per-file-political-intelligence`, `reference-analysis-quality` | OSINT, political-science, intelligence-analysis-techniques, electoral-analysis, behavioral-analysis |
| **Existing / cross-run** | `deep-analysis`, `stakeholder-impact`, `voting-patterns`, `cross-session-intelligence`, `cross-run-diff`, `session-baseline` | legislative-monitoring, behavioral-analysis |
| **Documents** | `document-analysis-index` | OSINT |
| **Workflow self-audit (last)** | `workflow-audit`, `methodology-reflection` | ai-first-quality, process hygiene |

`methodology-reflection.md` is the **final** artifact of every run (after `workflow-audit.md`) — see `ai-driven-analysis-guide.md` Step 10.5.

## 2 · Analysis Directory Structure

```
analysis/daily/{YYYY-MM-DD}/{article-type-slug}-run{NN}/
├── classification/    (significance-classification, actor-mapping, forces-analysis, impact-matrix)
├── threat-assessment/ (political-threat-landscape, actor-threat-profiling, consequence-trees, legislative-disruption)
├── risk-scoring/      (risk-matrix, quantitative-swot, political-capital-risk, legislative-velocity-risk, agent-risk-workflow)
├── intelligence/      (pestle-analysis, stakeholder-map, scenario-forecast, threat-model, historical-baseline, economic-context, wildcards-blackswans, synthesis-summary, analysis-index, coalition-dynamics, mcp-reliability-audit)
├── existing/          (deep-analysis, stakeholder-impact, coalition-dynamics, voting-patterns, cross-session-intelligence, synthesis-summary)
├── documents/         (document-analysis-index)
├── data/              (raw MCP data — may be excluded from PR)
└── manifest.json      (top-level articleType, files.*, artifactStats)
```

> **Canonical paths:** `synthesis-summary.md` lives under `intelligence/` (the
> canonical location, as enforced by `reference-quality-thresholds.json`).
> Older `motions-*` and review runs may additionally **mirror** it (and a few
> other intelligence artifacts) into `existing/` — see
> [`artifact-catalog.md` "Mirror artifacts"](../../analysis/methodologies/artifact-catalog.md).
> There is no top-level `synthesis/` or `risk/` directory; use
> `intelligence/synthesis-summary.md` and `risk-scoring/risk-matrix.md`.

## 3 · Minimum Analysis Time

| Workflow | Minimum Total | Pass 1 | Pass 2 |
|----------|:-------------:|:------:|:------:|
| Breaking / committee-reports / propositions / motions / week-ahead / month-ahead | 20 min | 12 min | 8 min |
| Weekly / monthly review | 25 min | 15 min | 10 min |
| Article generator | 15 min per type | 9 min | 6 min |

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

`npm run validate-analysis` applies per-artifact floors from
[`reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json).
When a file is SHORT, run a targeted Pass 2 on THAT file — do not pad, write
substantive prose with evidence anchors. Line counting must match the
validator's `text.split('\n').length` (not `wc -l`).

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
- Pass 2 verification complete.
- Now run the completeness gate:
  [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md).
