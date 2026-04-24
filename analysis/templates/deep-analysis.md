<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📜 Deep Political Analysis Template — Long-Form Economist-Style

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/existing/deep-analysis.md` (the `existing/` folder is the canonical location for long-form prose artifacts used by `motions`, `propositions`, and `month-in-review` workflows). See [methodologies/per-artifact-methodologies.md §deep-analysis](../methodologies/per-artifact-methodologies.md#deep-analysis).

> **🎯 Purpose:** Long-form political intelligence prose (4 000–10 000 words) in the style of *The Economist*'s "Charlemagne" column or *The Financial Times*' Brussels Briefing. Where `synthesis-summary.md` gives the 5-minute read, `deep-analysis.md` gives the 30-minute read — the reader wants narrative depth, procedural colour, coalition dynamics, and the political why.

> **🖋️ Voice:** Confident but evidence-anchored; analytical, not partisan; names specific actors, procedures, and dates; favours declarative sentences over hedging. Every paragraph earns its place by advancing the argument or presenting a named piece of evidence.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report Title** | `[REQUIRED: specific headline — the political thesis, not a generic label]` |
| **Date** | `[REQUIRED: YYYY-MM-DD]` |
| **Workflow** | `[REQUIRED: e.g. motions-run46]` |
| **Analysis Period** | `[REQUIRED: e.g. 2026-01-01 to 2026-04-16]` |
| **Confidence** | `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW — explain in body]` |
| **Method** | `[REQUIRED: e.g. DEGRADED MODE (individual text content unavailable) vs. FULL DATA]` |
| **Target length** | `[REQUIRED: 4 000 / 6 000 / 10 000 words]` |

---

## Executive Summary

A single paragraph of **≥200 words** that states the political thesis of the period and names the evidence base. The paragraph:

- Names the institution (European Parliament) and the period.
- States the single most important political claim the analysis makes — expressed as a **WEP estimative-probability band** with an explicit time horizon (per [`osint-tradecraft-standards.md` §3.1](../methodologies/osint-tradecraft-standards.md)) — e.g. *"The grand coalition is **Likely** (55–80%) to hold through the June plenary…"*
- Opens with an ICD 203 BLUF sentence in the form: `[analytic judgement] [WEP band] [time horizon] [confidence: HIGH/MEDIUM/LOW] because [one-clause rationale].`
- Cites two or three numeric anchors (seat share, RCV count, resolution count) with Admiralty-grade source references (§2) — e.g. `[A1]` for EP roll-call records.
- Names the dominant coalition and its approximate cohesion.
- Signals the forward implication.

Example opening: *"The European Parliament's first quarter of 2026 produced an unprecedented 567 roll-call votes and 180 resolutions — both records that, when set against the corresponding 2025 figures [A1], reveal a parliamentary body operating at roughly triple its prior-year cadence; the grand coalition is **Likely** to sustain this pace through Q2 (HIGH confidence)…"*

---

## 1️⃣ Structural Thesis

**Section length**: ≥400 words.

State the period's dominant political structure and explain why it matters. Name the clusters of activity (e.g. geopolitical assertion + social contract renewal + trade countermeasures) and show that they constitute an integrated programme rather than coincidental adjacencies.

Requirements:
- ≥3 named policy clusters with ≥2 named texts per cluster.
- Coalition footprint (which coalition carried this programme) with a cohesion %.
- ≥1 historical comparison (prior term / prior year).
- ≥1 Mermaid diagram or structured table grounding the thesis.

---

## 2️⃣ Crystallisation Moment — The Session That Defined the Period

**Section length**: ≥500 words.

Every politically productive period has a single session, vote, or decision that crystallised its character. Identify it explicitly and write a narrative-rich analysis:

Requirements:
- Name the session with its dates, location, and format (strasbourg / brussels mini-plenary / extraordinary).
- Count the texts adopted and RCVs held.
- Cover the **architectural** political argument: which policy domains were spanned simultaneously.
- Cover the **procedural** angle: Article references (TFEU), rapporteur selection, committee routing, trilogue status.
- Cover the **coalition** angle: who voted with whom, what was the margin, what defections were notable.
- ≥3 adopted-text IDs (`TA-10-YYYY-NNNN`) cited inline.
- ≥2 roll-call vote IDs cited inline.

### Sub-section 1 — `[REQUIRED: named cluster]`

`[REQUIRED: ≥300 words named-text-by-named-text narrative]`

### Sub-section 2 — `[REQUIRED: named cluster]`

`[REQUIRED: ≥300 words]`

*(add sub-sections per cluster)*

---

## 3️⃣ Coalition Dynamics — The Grand Centre's Q/Period Performance

**Section length**: ≥500 words.

Track the Grand Centre (EPP + S&D + Renew) or the dominant coalition of the period. For every claim about cohesion, cite the RCV evidence or note the roll-call data delay.

Requirements:
- Per-group cohesion table with evidence.
- ≥2 named MEPs whose defections were politically consequential.
- Cross-coalition pattern (where EPP cooperated with ECR / PfE, where Greens-EFA bridged).
- Explicit confidence caveat where EP roll-call data is not yet published.

---

## 4️⃣ Policy Dimensions

Walk each major policy dimension of the period in its own sub-section. For every dimension: committee, rapporteur, adopted text(s), coalition behaviour, and political meaning.

### 4.1 `[REQUIRED: Trade / Defence / Digital / Environment / etc.]`
`[REQUIRED: ≥300 words]`

### 4.2 `[REQUIRED]`
`[REQUIRED: ≥300 words]`

### 4.3 `[REQUIRED]`
`[REQUIRED: ≥300 words]`

*(≥4 sub-sections; most months will have 4–6)*

---

## 5️⃣ Institutional Dynamics

**Section length**: ≥400 words.

The EP does not operate in a vacuum. Analyse the institutional triangle for the period:

Requirements:
- EP ↔ Commission: which proposals did the EP accept, amend, reject?
- EP ↔ Council: which trilogues stalled, advanced, concluded?
- EP internal: which rules changes, procedural adjustments, committee restructurings?
- ≥2 named Commission proposals cited.
- ≥1 Council position cited.

---

## 6️⃣ Geopolitical Context

**Section length**: ≥400 words.

Ground the period's parliamentary politics in the geopolitical environment. **IMF** (primary source for macro / fiscal / monetary / trade indicators — Wave-3 policy) plus optional World Bank (non-economic domains only), transatlantic context, enlargement dynamics, energy posture.

Requirements:
- ≥2 external events that shaped EP behaviour in the period.
- ≥1 macro indicator (inflation / GDP / trade balance) with source.
- A closing paragraph linking external context back to a specific EP vote or resolution.

---

## 7️⃣ Forward Trajectory

**Section length**: ≥400 words.

What the next period brings, which procedures are entering critical phases, where coalition stress-points will emerge.

Requirements:
- ≥5 specific forward monitors (date + event + indicator).
- ≥2 probability-weighted scenarios (reuse weights from the run's sibling [`../intelligence/scenario-forecast.md`](../intelligence/scenario-forecast.md); methodology: [per-artifact-methodologies.md §scenario-forecast](../methodologies/per-artifact-methodologies.md#scenario-forecast)).
- Named vulnerabilities in the dominant coalition.

---

## 8️⃣ Confidence & Method Note

**Section length**: ≥150 words.

Close by explaining how the analysis was built: which EP MCP endpoints succeeded, which failed, how the data-source bridge was constructed, what would change the assessment. Link to the run's sibling [`../intelligence/mcp-reliability-audit.md`](../intelligence/mcp-reliability-audit.md) (methodology: [per-artifact-methodologies.md §mcp-reliability-audit](../methodologies/per-artifact-methodologies.md#mcp-reliability-audit)).

---

## ✅ Quality Gate (self-check before commit)

- [ ] Total length ≥ target (4 000 / 6 000 / 10 000 words depending on article type)
- [ ] ≥15 named procedures / adopted texts / RCVs cited inline
- [ ] ≥3 Mermaid diagrams or structured tables with evidence anchors
- [ ] ≥2 historical comparisons (prior term / prior year)
- [ ] Named coalitions with explicit cohesion percentages
- [ ] Method note and confidence statement present
- [ ] No partisan conclusions — analytical neutrality preserved
- [ ] Every paragraph earns its place — no filler, no generic observations

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/existing/deep-analysis.md` · Template v1.0 · Depth floor: per article-type minimum defined in [`reference-quality-thresholds.json`](../methodologies/reference-quality-thresholds.json) (authoritative — e.g. motions 400, month-in-review 300, week-in-review 200).
