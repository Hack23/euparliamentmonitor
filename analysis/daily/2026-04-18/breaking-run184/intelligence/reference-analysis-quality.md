---
title: "⭐ Reference Analysis Quality Benchmark — Run 184 as Gold Standard"
date: 2026-04-18
articleType: breaking
runId: 184
scope: "Benchmark for AI guides, prompts, templates, and all agentic workflows"
---

# ⭐ Reference Analysis Quality Benchmark — Run 184

![Role](https://img.shields.io/badge/Role-Reference_Analysis-gold?style=flat-square)
![Mode](https://img.shields.io/badge/Mode-Analysis_Only-grey?style=flat-square)
![Passes](https://img.shields.io/badge/AI_Passes-2-blue?style=flat-square)
![Files](https://img.shields.io/badge/Artifacts-9-green?style=flat-square)

> **Purpose**: This document designates Run 184 as the **reference analysis** for the
> EU Parliament Monitor project. AI guides, prompt patterns, templates, and agentic
> workflow instructions should treat the 9 artifacts of Run 184 as the illustrative
> example of expected analytical depth, structural rigour, and data-quality candour.
>
> When a future workflow is uncertain what "good enough" looks like, the answer is:
> **produce an output of comparable depth to Run 184**. If the output is thinner, the
> workflow should execute another improvement pass rather than ship.

---

## 1. Why Run 184 Qualifies as the Reference

Run 184 is designated the reference analysis on the basis of four properties that the
six-run Easter-recess series (Runs 179–184) allowed it to develop but that no single
prior analysis run had simultaneously achieved:

1. **Depth without padding** — 1000+ lines of substantive prose across 9 artifacts with
   zero boilerplate, zero `[AI_ANALYSIS_REQUIRED]` markers, and zero sections below the
   minimum evidence-density threshold (80 words per SWOT item, 150 words per stakeholder
   perspective per `.github/skills/ai-first-quality.md`).
2. **Intellectual honesty about data quality** — every assessment carries an explicit
   confidence level (🟢 High / 🟡 Medium / 🔴 Low) and a specific evidence anchor. Where
   the EP MCP data is incomplete (e.g., EPP `memberCount=0`), the analysis documents the
   gap rather than silently working around it.
3. **Cumulative intelligence build** — Run 184 does not restate Run 183; its
   `cross-run-diff.md` explicitly enumerates the 3 incremental findings (API recovery
   signal, TA-0099–0104 confirmation, server-health reporting lag) that the run adds.
4. **Forward-monitoring actionability** — the 6 forward-monitoring priorities each
   specify (a) what to watch, (b) an observable trigger, (c) a threshold that
   distinguishes outcomes, and (d) a probability estimate with confidence level. This
   structure is directly executable by the next run's prompt.

Together, these four properties are what "Economist-quality political intelligence"
(per the core AI-First Quality principle) looks like when an analysis-only run is
performed during a data-degraded window. Future runs — especially those operating under
similar constraints (recess periods, API maintenance windows, weekend coverage) — should
match or exceed this reference.

---

## 2. Quality Gate Checklist (Reference Specification)

A workflow output qualifies as reference-quality only when *all* of the following hold:

### 2.1 Structural gates

- [x] `manifest.json` present with `articleType`, `runId`, `mode`, `newsworthiness`,
      `scores`, and `forwardMonitoring` keys populated
- [x] `classification/significance-scoring.md` — newsworthiness gate + incremental score
- [x] `risk-scoring/risk-matrix.md` — ≥5 named risk vectors with 5×5 Likelihood × Impact
- [x] `risk-scoring/quantitative-swot.md` — 3+3+3+3 items, each ≥80 words with
      evidence + confidence
- [x] `intelligence/coalition-dynamics.md` — with data-quality warnings where applicable
- [x] `intelligence/cross-run-diff.md` — documents ≥3 new findings vs the previous run
- [x] `intelligence/synthesis-summary.md` — consolidated picture + ≥6 forward triggers
- [x] `documents/document-analysis-index.md` — status table + structural inference
      framework for inaccessible items
- [x] (Recommended when applicable) `intelligence/mcp-reliability-audit.md` — data-quality
      defects observed during the run, with remediation recommendations

### 2.2 Content gates

- [x] Zero `[AI_ANALYSIS_REQUIRED]` / `[PLACEHOLDER]` / "TBD" markers in any file
- [x] Every SWOT item carries an explicit confidence level (🟢/🟡/🔴)
- [x] Every SWOT item anchors at least one numeric or dated evidence point
- [x] Every forward-monitoring priority has: trigger, threshold, deadline, probability
- [x] Cross-run diff documents hypothesis status transitions (CONFIRMED / UPDATED /
      UNCHANGED) for the prior run's open hypotheses
- [x] Coalition-pair claims are tagged as vote-derived OR size-artifact — never left
      ambiguous
- [x] Composite risk score is computed explicitly (not just asserted) and compared
      against the prior run

### 2.3 Process gates

- [x] 2-pass protocol: Pass 1 writes the initial artifact set; Pass 2 reads every file
      end-to-end and extends thin sections. Pass 2 must add material (it is not a
      proofread).
- [x] Active workflow time ≥45 minutes for a 60-minute slot
- [x] Newsworthiness gate evaluated explicitly — a "FAIL" verdict is acceptable and
      triggers the analysis-only path (Rule 5 of `ai-driven-analysis-guide.md`)
- [x] No news HTML files modified on an analysis-only run

---

## 3. Depth Calibration — Minimum Prose Volume by Artifact

Based on Run 184's actual output, the following volumes are the minimum calibration for
reference-quality analysis. Workflows producing less should execute another improvement
pass before submitting:

| Artifact | Run 184 lines | Minimum for reference-quality |
|----------|:-------------:|:-----------------------------:|
| `significance-scoring.md` | 118 | ≥ 90 lines |
| `risk-matrix.md` | 144 | ≥ 120 lines |
| `quantitative-swot.md` | 159 | ≥ 140 lines |
| `coalition-dynamics.md` | 150 | ≥ 120 lines |
| `cross-run-diff.md` | 112 | ≥ 90 lines |
| `synthesis-summary.md` | 176 | ≥ 140 lines |
| `document-analysis-index.md` | 109 | ≥ 90 lines |
| `mcp-reliability-audit.md` | (new — ~260) | ≥ 150 lines (when applicable) |
| `reference-analysis-quality.md` | (this file) | ≥ 90 lines (optional) |

**Line counts are a floor, not a target.** Verbosity without substance fails the
anti-boilerplate rules in `analysis/methodologies/ai-driven-analysis-guide.md`. The
operative quality measure is: *every paragraph either adds a fact, an inference, or a
constraint — no paragraph exists purely to meet a length quota*.

---

## 4. Anti-Patterns Rejected by Run 184

These anti-patterns were actively avoided in Run 184 and must remain rejected in any
analysis claiming reference-quality status:

| Anti-pattern | Why rejected | Run 184 example of the correct approach |
|--------------|--------------|----------------------------------------|
| Restating prior run without marking it as restatement | Inflates apparent depth; hides staleness | `cross-run-diff.md` explicitly enumerates only the 3 new findings vs Run 183 |
| Reporting API output as fact when API is incomplete | Propagates data defects downstream | `coalition-dynamics.md` flags EPP `memberCount=0` and estimates real composition |
| Generic risk entries ("geopolitical uncertainty") | No observable trigger → unactionable | Every risk vector has a specific observable trigger with a deadline |
| SWOT items without evidence anchors | Indistinguishable from opinion | Every SWOT item cites numeric or dated evidence (e.g., "114 legislative acts by April 16") |
| Publishing breaking news when gate fails | Violates newsworthiness discipline | Run 184 explicitly FAILS the newsworthiness gate and produces an analysis-only PR |
| Claiming "confirmed" for inferred findings | Erodes the confidence taxonomy | `document-analysis-index.md` distinguishes "confirmed in feed" from "content accessible" |
| Ignoring data-quality defects as "not our problem" | Blocks upstream improvement | `mcp-reliability-audit.md` enumerates 7 defects and files 5 upstream issues |

---

## 5. How to Use This Reference in New Workflows

When authoring or upgrading a gh-aw workflow (any file in `.github/workflows/news-*.md`),
follow this integration protocol:

1. **Read Run 184 artifacts end-to-end** — `analysis/daily/2026-04-18/breaking-run184/`.
   This is the current quality bar.
2. **Compare your draft output against Section 2 gates** above. If any gate fails,
   execute a dedicated Pass 2 on the failing artifact before submitting.
3. **Cite Run 184 in your workflow's prompt** when instructing the AI about expected
   depth: the prompt should include the phrase *"Target output depth: comparable to
   `analysis/daily/2026-04-18/breaking-run184/` artifacts"*.
4. **When producing a cross-run diff, consume the prior run's `manifest.json`** rather
   than its prose — this is how Run 184 derives its incremental-intelligence delta.
5. **When API is degraded, create `intelligence/mcp-reliability-audit.md`** rather than
   suppressing the observation. The audit file is part of the analysis payload.

---

## 6. Review Cadence

This reference designation should be re-evaluated when *any* of the following occurs:

- Another run produces artifacts of comparable or greater depth across all 9 files
- Methodology documents (e.g., `ai-driven-analysis-guide.md`) receive a version bump
  that invalidates Run 184's structure
- The EP MCP server ships remediation for the defects documented in
  `mcp-reliability-audit.md` (the data-degraded-window framing of Run 184 becomes less
  illustrative of normal operation)

When the reference is superseded, update this file's header and link to the new
reference run.

---

*Document compiled: April 18, 2026 | Run 184 | Role: reference-analysis designation*
*Next review: July 2026 (post-summer-recess series) or when methodology v4.3 ships*
