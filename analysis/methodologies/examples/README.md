<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📚 Worked Examples — Methodology in Practice

This directory holds **illustrative "good output" excerpts** that show what an Economist-grade analysis artifact looks like when the methodology library is followed correctly. Each example demonstrates full artifact structure — all four SWOT quadrants with TOWS, all four stakeholder-map quadrant narratives, three complete scenarios — compressed from a production-length artifact to a teaching-length excerpt (~100–150 lines) that an AI agent can read as inline reference without inflating context.

> ⚠️ **Illustrative, not authoritative.** Numbers, MEP names, and procedure
> IDs in these excerpts are taken from real EP runs but compressed for
> teaching purposes. They are **not** fresh intelligence and **must not** be
> copy-pasted into a live article. The purpose is to show *shape, evidence
> density, and confidence-level discipline* — not to provide content.

## Index

| Example | Companion methodology | Companion template | Key quality signal demonstrated |
|---|---|---|---|
| [`swot-good-output.md`](swot-good-output.md) | [`political-swot-framework.md`](../political-swot-framework.md) | [`quantitative-swot.md`](../../templates/quantitative-swot.md) | ≥80 words per quadrant cell, evidence + confidence label on every item, TOWS strategy paired with each cross-quadrant pair |
| [`stakeholder-map-good-output.md`](stakeholder-map-good-output.md) | [`per-artifact-methodologies.md §stakeholder-map`](../per-artifact-methodologies.md#stakeholder-map) | [`stakeholder-map.md`](../../templates/stakeholder-map.md) | ≥150 words per quadrant narrative, cited power score, cited alignment score, movement-since-prior-period entry |
| [`risk-matrix-good-output.md`](risk-matrix-good-output.md) | [`political-risk-methodology.md`](../political-risk-methodology.md) | [`risk-matrix.md`](../../templates/risk-matrix.md) | Likelihood × Impact justified per cell, trigger event date-bounded, monitoring cadence stated, residual risk after mitigation |
| [`scenario-forecast-good-output.md`](scenario-forecast-good-output.md) | [`per-artifact-methodologies.md §scenario-forecast`](../per-artifact-methodologies.md#scenario-forecast) | [`scenario-forecast.md`](../../templates/scenario-forecast.md) | WEP band + horizon per scenario, ≥3 indicators per scenario, probabilities sum to 100, primary SAT named (Pre-Mortem) |

## How to use these examples

1. **Read once at the start of a Stage-B writing session** — they re-anchor the agent on what "good" looks like before Pass 1 begins.
2. **Diff against your draft during Pass 2** — if the example shows three indicators per scenario and your draft has one, you have a Pass-2 task.
3. **Do not copy verbatim** — every artifact in `analysis/daily/<date>/<slug>/` must source evidence via the European Parliament MCP tools or, where the methodology permits, extend validated evidence from a prior run via `manifest.json` `artifactSources` / `extend-from-prior` semantics. Economic-context claims additionally require IMF data (primary). Not every artifact type uses IMF or World Bank sources.

## Anti-patterns these examples deliberately reject

- **Bullet-only output** — analysis paragraphs are prose with embedded citations, not stripped lists.
- **Soft language** — phrases like "could potentially", "may possibly", "broadly speaking" are replaced with WEP bands ("Likely", "Roughly even chance") and explicit confidence levels (High / Moderate / Low).
- **Unnamed actors** — every stake, every coalition pair, every threat names the specific MEP, group, committee, or DG involved.
- **Dateless triggers** — every monitoring trigger and indicator has a calendar date or named procedural milestone.
- **Unsupported probability claims** — probability estimates that are not grounded in cited evidence (vote arithmetic, committee records, coalition math) and not expressed with a WEP band. Single-source scoring is permitted where only one MCP data source is available, provided the source is cited and the confidence label is set to Low or Moderate accordingly.

## Adding a new example

When a new artifact graduates to "high-frequency" status (used in ≥4 of the eight unified `news-<type>.md` workflows), add a worked example here:

1. Pick the artifact's canonical methodology section in [`per-artifact-methodologies.md`](../per-artifact-methodologies.md).
2. Write a 100–250 line excerpt following exactly the section's required structure.
3. Mark every fictionalised number with the inline marker `*illustrative*`.
4. Add a row to the index table above with the methodology + template companions and the key quality signal demonstrated.
5. Cross-link from the methodology section using `> 📎 Worked example: [name](examples/name.md)`.

## Document control

- **Path:** `/analysis/methodologies/examples/`
- **Classification:** Public
- **Owner:** CEO
- **Effective:** 2026-05-03
- **Next review:** 2026-08-03 (quarterly with parent methodology library)
