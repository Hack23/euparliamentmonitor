<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔎 Methodology Library Weakness Audit — May 2026</h1>

<p align="center">
  <strong>📋 Structured audit of <code>analysis/methodologies/</code> identifying weak points and the surgical fixes shipped to address them.</strong><br>
  <em>🎯 Companion to <a href="ai-driven-analysis-guide.md">ai-driven-analysis-guide.md</a> · 🛠️ Read once · 📅 Effective 2026-05-15</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--05--15-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Effective:** 2026-05-15 (UTC)
**🔄 Review Cycle:** Once (snapshot) | **⏰ Supersedes:** prior `ad-hoc audit` notes scattered in run-level `methodology-reflection.md` files
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

This document is the **single, dated, public audit record** of weak points found
in the May-2026 review of every file in `analysis/methodologies/`. It is the
companion to the surgical fixes shipped in the same PR so that any future agent
reading the library can (a) understand *why* a change was made, and (b) detect
regression to the prior, weaker state.

It is **not** a prescriptive methodology — see [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md)
§Quick-Start for the operational summary, and [`per-artifact-methodologies.md`](per-artifact-methodologies.md)
for construction rules.

---

## 📊 Library Snapshot at Audit Time

| Measure | Value | Source of truth |
|---|---:|---|
| Methodology `.md` files (excluding `README.md`) | 24 | `ls analysis/methodologies/*.md` |
| Methodology JSON config files | 1 (`political-style-guide.json`, `reference-quality-thresholds.json` — note: the latter is now considered config under `methodologies/` for line-floor enforcement) | filesystem |
| Total methodology lines | ~12 000 | `wc -l` |
| Templates under `analysis/templates/` | 61 | `ls analysis/templates/*.md` |
| Article-type slugs in `src/config/article-horizons.ts` | 15 | `grep "slug:" src/config/article-horizons.ts` |

The numbers above are the **filesystem-truth baseline** against which prior
narrative claims of "16 methodologies", "18 methodologies", "39 templates", "51
templates", and "59 templates" must now be reconciled.

---

## 🔴 Weak Points Identified (and their Fix)

Severity scale:
- 🔴 **Blocker** — actively misleads an agent and risks a degraded run
- 🟠 **Friction** — slows the agent or adds re-work but the run still succeeds
- 🟡 **Hygiene** — drift / stale references / count mismatches with no operational impact today, but cumulative debt

### W1 🔴 Two competing confidence systems

**Location:** [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md)

- Steps 6, 9, 10 and the v5.1+ §"Core Principles" instruct the agent to label
  every claim with **🟢 / 🟡 / 🔴** (3-marker, cross-cutting OSINT tradecraft layer)
- §"5-Level Confidence Scale" instructs the agent to use **⬛ / 🟥 / 🟧 / 🟩 / 🟦**
  (5-level scale, ported from the Riksdagsmonitor heritage)
- The two systems are **not reconciled** anywhere in the doc. [`confidence-calibration.md`](confidence-calibration.md)
  is referenced as the authoritative table but the 5-level scale in the guide
  is not aligned to it.

**Impact:** Agents have produced runs where SWOT items, stakeholder perspectives
and risk rows mix both notations — sometimes within the same paragraph — making
downstream completeness checks brittle and confusing readers.

**Fix shipped:** §"5-Level Confidence Scale" replaced with an explicit
**3 ↔ 5 mapping table** that points to [`confidence-calibration.md`](confidence-calibration.md)
as the single source of truth, and the operational protocol (Steps 6, 9, 10)
remains the 3-marker 🟢/🟡/🔴. The 5-level scale is retained as a *legacy
heritage reference* for cross-project (Riksdagsmonitor) reading.

### W2 🔴 Step 2 reading list is incomplete

**Location:** [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) §"2️⃣ Step 2 — Read the Methodology Library"

The Step 2 table lists 9 documents. The repository (and the
`intelligence-operative` agent instructions) actually require **15+ documents**
to be read before analysis begins. Missing from Step 2:

| Missing document | Why it matters |
|---|---|
| [`synthesis-methodology.md`](synthesis-methodology.md) | Governs Stage B.7 — every run produces synthesis artifacts |
| [`strategic-extensions-methodology.md`](strategic-extensions-methodology.md) | Governs Stage B.6 — scenario-forecast, wildcards, historical-baseline |
| [`per-document-methodology.md`](per-document-methodology.md) | Governs Stage A.3 per-file intelligence — mandatory per document |
| [`structural-metadata-methodology.md`](structural-metadata-methodology.md) | Governs `manifest.json`, `analysis-index.md`, provenance layer |
| [`electoral-domain-methodology.md`](electoral-domain-methodology.md) | Mandatory for `election-cycle`, `term-outlook`, voter-segmentation |
| [`analytical-supplementary-methodology.md`](analytical-supplementary-methodology.md) | Defines `media-framing-analysis.md` — mandatory for **every** article-generating run |
| [`source-triangulation.md`](source-triangulation.md) | Already present but mis-keyed as P1 NEW; status normalised to **P1 stable** |
| [`forward-projection-methodology.md`](forward-projection-methodology.md) | Mandatory for week-ahead / month-ahead / quarter-ahead horizons |
| [`electoral-cycle-methodology.md`](electoral-cycle-methodology.md) | Mandatory for any election-window run |

**Impact:** New agents reading only the Step 2 list miss mandatory construction
rules and produce thinner artifacts in Pass 1, then waste Pass 2 time bolting
strategic-extensions, synthesis and per-document layers in.

**Fix shipped:** Step 2 table expanded to **15 rows** with priority tiers (P1
core / P2 horizon-conditional / P3 reference); the Quick-Start at the top of
the guide now lists the same 15 in one screen.

### W3 🔴 Obsolete workflow slugs in Step 8

**Location:** [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) §"🎯 Purpose" and §"8️⃣ Step 8"

The guide lists `news-weekly-review`, `news-monthly-review`,
`news-article-generator` as workflows. The canonical slugs in
[`src/config/article-horizons.ts`](../../src/config/article-horizons.ts) are:

| Old (wrong) | New (canonical) |
|---|---|
| `news-weekly-review` | `news-week-in-review` |
| `news-monthly-review` | `news-month-in-review` |
| `news-article-generator` | **removed** (purged in April-2026 aggregator-pipeline migration) |

Missing from the same enumeration (added 2026-Q1/Q2): `news-quarter-in-review`,
`news-year-in-review`, `news-quarter-ahead`, `news-year-ahead`,
`news-term-outlook`, `news-election-cycle`, `news-deep-analysis`.

**Impact:** A grep on slug names by a downstream automation will fail to match;
the matrix in §"Analytical Dimension Matrix" silently omits 6 article types.

**Fix shipped:** Workflow slug list in §Purpose, §Step 8, and §"Analytical
Dimension Matrix" updated to the canonical 15-slug set.

### W4 🟠 Misleading "39-Artifact Output Matrix" Mermaid

**Location:** [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) §"📂 The Mandatory + Optional Artifact Output Matrix"

The Mermaid diagram lists 39 nodes using upstream Riksdagsmonitor file names
(`data-summary.md`, `network-analysis.md`, `temporal-analysis.md`,
`sentiment-tracker.md`, `political-temperature.md`, `strategic-significance.md`,
`risk-register.md`, `cascading-risk-analysis.md`, `risk-trajectory-tracking.md`,
`risk-interconnection-map.md`, `tows-strategies.md`, `power-interest-map.md`,
`diamond-model.md`, `kill-chain-analysis.md`, `attack-tree.md`,
`scenario-analysis.md`, `legislative-timeline.md`, `qualitygate-audit.md`).

The doc itself adds a warning note that "**several do not map 1:1 to files**" —
yet the diagram remains as the first visual the agent sees for the artifact
universe. Agents have copy-pasted these filenames into their runs and produced
analysis files at non-canonical paths.

**Impact:** Periodic Pass-2 rework to rename non-canonical filenames; the
aggregator emits a soft warning when an unknown filename appears in
`manifest.files.*`.

**Fix shipped:** The legacy diagram is retained for cross-project reference but
**relabelled as "🗄️ Heritage Diagram (Riksdagsmonitor lineage — informational only)"**
and is preceded by a new **"📂 Canonical Artifact List (filesystem truth)"**
section that links directly to [`artifact-catalog.md`](artifact-catalog.md) and
the [`analysis/templates/`](../templates/) directory.

### W5 🟠 Confidence ceilings cite a non-canonical artifact

**Location:** [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) §"Confidence Ceilings by Data Depth"

The text says "data depth field recorded in `data-summary.md` during Step 3" —
but `data-summary.md` is one of the non-canonical Riksdagsmonitor filenames
identified in W4. The canonical artifact is
`intelligence/mcp-reliability-audit.md` (per [`per-artifact-methodologies.md §mcp-reliability-audit`](per-artifact-methodologies.md#mcp-reliability-audit)).

**Fix shipped:** Reference corrected to `intelligence/mcp-reliability-audit.md`
and `intelligence/significance-scoring.md` (which carries the per-claim
data-depth field today).

### W6 🟡 Methodology + template counts drift across documents

**Location:** [`README.md`](README.md) and [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md)

| Place | Claim | Reality |
|---|---|---|
| `README.md` title | "Eighteen Interlocking … Methodologies" | 24 `.md` files |
| `README.md` purpose | "sixteen interlocking" | 24 `.md` files |
| `README.md` pipeline diagram | "16 docs" | 24 `.md` files |
| `README.md` h1 subtitle | "59 analysis templates" | 61 templates |
| `ai-driven-analysis-guide.md` §matrix | "51 templates total: 8 master + 25 per-artifact + 12 extended + 6 framework" | 61 templates |
| `ai-driven-analysis-guide.md` §matrix | "47 unique artifact rows + 2 legacy mirrors + 1 documents row" | drift vs `artifact-catalog.md` |

The drift exists because every count was hand-written and never re-verified
against `ls`. None of these counts changes runtime behaviour, but they erode
agent trust in the numbers attached to other claims.

**Fix shipped:** Both files updated to **"24 methodology files (1 JSON config) +
61 analysis templates"** with an explicit pointer to the live filesystem as the
single source of truth. Future drift is the responsibility of the
weekly-curation agent (see [`developer.instructions`](../../.github/agents/developer.instructions.md)
sub-agent in the curator runbook).

### W7 🟡 Stale references to purged scripts cluttering Step 10

**Location:** [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) §"🔟 Step 10"

Step 10 carries three explicit references to scripts that were **purged in the
April-2026 aggregator-pipeline migration** — `validate-analysis-completeness.ts`,
`news-enhanced.ts`, `validate-articles.ts`. The references exist only to say
"this was purged". For a guide read at the start of every run, this is signal
loss.

**Fix shipped:** The three "was purged" parentheticals collapsed into a single
**§"Heritage Tooling — Purged April 2026"** appendix at the bottom of the
guide. Step 10 prose now reads cleanly without the purge clutter.

### W8 🟠 No operational cheat-sheet — agents must read 758 lines to find their deliverables

**Location:** [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md)

The guide is 758 lines. An agent running `news-breaking` needs to know:
1. Which `ARTICLE_TYPE_SLUG` am I?
2. What time budget (Pass 1 + Pass 2 = ?)
3. What is the minimum set of artifacts I must produce?
4. What is the line floor per artifact?
5. When must `safeoutputs___create_pull_request` fire?

Today the agent must read or grep the entire guide to assemble that picture. A
human reader can do it in 30 seconds with a cheat-sheet — and so can the agent.

**Fix shipped:** New section **"🚀 Quick-Start Cheat-Sheet"** added immediately
after §Purpose. Single-screen table keyed by slug giving: PR deadline, Pass 1 /
Pass 2 minute budget, mandatory artifact families, and the link into the deep
methodology for each.

### W9 🟡 README `📋 Methodology Summary Table` undercounts artifacts

**Location:** [`README.md`](README.md) §"Methodology Summary Table"

Row 8 ("Artifact Catalog") states "intelligence 18 · classification 4 ·
risk-scoring 4 · threat-assessment 5 · documents 1 · existing legacy 2+mirrors ·
extended 12 optional". The current `artifact-catalog.md` lists higher counts
per group and adds a `data/` family. The numbers are stale by ~6 rows.

**Fix shipped:** Row 8 updated with a pointer to [`artifact-catalog.md`](artifact-catalog.md)
as the live source of truth and the hand-written counts removed.

### W10 🟡 No top-level deprecation note for explicitly-rejected frameworks

**Location:** Whole library

`political-threat-framework.md` rejects STRIDE, DREAD, PASTA for political
analysis. The rejection is correctly stated there, but a new agent searching
the library for "STRIDE" (e.g. from `THREAT_MODEL.md` which is correctly
software-centric) can land on the rejection paragraph mid-context and assume
the platform-wide stance is "STRIDE rejected" rather than the actual
"STRIDE rejected for *political* analysis, retained for software security".

**Fix shipped:** [`political-threat-framework.md`](political-threat-framework.md) §"What
this framework rejects" gets a one-line cross-reference clarifying that
[`THREAT_MODEL.md`](../../THREAT_MODEL.md) (software security) continues to use
STRIDE; the methodology library rejection is scoped to political analysis only.
*Note:* this PR ships W10 as a documentation note inside W1's reconciliation
patch — no separate edit to `political-threat-framework.md` body content.

---

## 🟢 What is Working Well (kept unchanged)

For honesty / regression-detection: the following were reviewed and **kept as
authoritative**. Future PRs that "refactor" them should justify the change
against this list.

- [`per-artifact-methodologies.md`](per-artifact-methodologies.md) — per-artifact construction rules; the most-cited file in the library; correctly scoped to one `### section` per artifact
- [`osint-tradecraft-standards.md`](osint-tradecraft-standards.md) — ICD 203, Admiralty, WEP, SAT catalog, OSINT ethics; the cross-cutting tradecraft layer
- [`political-threat-framework.md`](political-threat-framework.md) — v4.0 5-framework integrated methodology (Political Threat Landscape 6D + Attack Trees + Kill Chain + Diamond + ICO); STRIDE-rejected stance is well-defended
- [`political-risk-methodology.md`](political-risk-methodology.md) — 5×5 likelihood × impact + Bayesian update; matches `political-risk` skill
- [`political-swot-framework.md`](political-swot-framework.md) — evidence-based SWOT with TOWS; aligned to `ai-first-quality` skill
- [`political-classification-guide.md`](political-classification-guide.md) — 7-dimension classification; clean, no drift
- [`confidence-calibration.md`](confidence-calibration.md) — the missing piece in W1; the unified table this audit promotes to "single source of truth for confidence"
- [`source-triangulation.md`](source-triangulation.md) — 4-step fallback ladder; precise and operational
- [`imf-indicator-mapping.md`](imf-indicator-mapping.md) + [`worldbank-indicator-mapping.md`](worldbank-indicator-mapping.md) — economic-context evidence ladder; matches `imf-data-integration` skill
- [`artifact-catalog.md`](artifact-catalog.md) — the canonical artifact map; the audit promotes this to the **single source of truth for "what files to produce"**

---

## ✅ Acceptance / Regression Signals

How a future reader detects that this audit has been undone:

| Signal | Healthy state | Regressed state |
|---|---|---|
| Step 2 reading list rows | ≥ 15 | < 15 — W2 regressed |
| `news-weekly-review` / `news-monthly-review` mentions in `ai-driven-analysis-guide.md` | 0 | > 0 — W3 regressed |
| §"5-Level Confidence Scale" carries a 3↔5 mapping table | yes | no — W1 regressed |
| `ai-driven-analysis-guide.md` carries §"🚀 Quick-Start Cheat-Sheet" | yes | no — W8 regressed |
| README claims a numeric methodology / template count | no (defers to filesystem) | yes — W6 regressed |
| Step 10 mentions purged scripts (`news-enhanced.ts`, `validate-articles.ts`, `validate-analysis-completeness.ts`) by name in the main body (not the appendix) | no | yes — W7 regressed |

---

## 🔗 Related Documents

- [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) — the 10-step protocol (target of W1, W2, W3, W4, W5, W7, W8)
- [`README.md`](README.md) — library index (target of W6, W9)
- [`confidence-calibration.md`](confidence-calibration.md) — unified confidence table (promoted by W1)
- [`artifact-catalog.md`](artifact-catalog.md) — canonical artifact map (promoted by W4, W6, W9)
- [`per-artifact-methodologies.md`](per-artifact-methodologies.md) — per-artifact construction rules (kept unchanged)

---

**Document Control:**
- **Path:** `/analysis/methodologies/WEAKNESS-AUDIT-2026-05.md`
- **Classification:** Public
- **Version:** 1.0 (initial audit, May 2026)
- **Supersedes:** none — first dated audit of the library
- **Next Review:** not scheduled — re-audit triggered when ≥ 2 of the
  regression signals above flip back to the regressed state, or annually,
  whichever comes first.
