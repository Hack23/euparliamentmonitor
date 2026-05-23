# Analysis Index — Propositions — 2026-04-24 (propositions-run-1777009560)

**Classification**: PUBLIC · OSINT-only · EP Open Data Portal + World Bank
**Article type**: `propositions`
**Window**: 2026-03-25 → 2026-04-24 (30-day propositions horizon)
**Run ID**: `propositions-run-1777009560`
**Mode**: ANALYSIS_ONLY (Stages A + B + C only; article drafted in paired `news-propositions-article.md` when this PR merges)

## 1 · Purpose

This analysis set snapshots the European Parliament **legislative-propositions
pipeline** over the last 30 days, assessing which files, which stages, which
rapporteurs, and which political-group coalitions are most likely to shape
law within the 6-month window ending 2026-04-10-24. The focus is on
*propositions-in-motion* — ordinary legislative procedure (COD), consultation
procedure (CNS), consent procedure (APP/NLE), own-initiative reports (INI)
not on already-adopted acts, which are the scope of the `adopted-texts`
breaking workflow.

## 2 · Artifact Map (14 mandatory files)

| # | Artifact | Methodology | Line-floor | Depth |
|---|----------|-------------|-----------:|:-----:|
| 1 | `intelligence/analysis-index.md` | per-artifact §1 | 100 | 🟢 |
| 2 | `intelligence/synthesis-summary.md` | OSINT tradecraft · ICD-203 BLUF | 160 | 🟢 |
| 3 | `intelligence/historical-baseline.md` | longitudinal baselining | 120 | 🟢 |
| 4 | `intelligence/economic-context.md` | IMF policy policy framing | 120 | 🟢 |
| 5 | `intelligence/pestle-analysis.md` | PESTLE framework | 180 | 🟢 |
| 6 | `intelligence/stakeholder-map.md` | stakeholder-mapping standard | 200 | 🟢 |
| 7 | `intelligence/scenario-forecast.md` | WEP-band scenario forecasting | 180 | 🟢 |
| 8 | `intelligence/threat-model.md` | STRIDE+ / threat-model methodology | 160 | 🟢 |
| 9 | `intelligence/wildcards-blackswans.md` | Taleb wildcards, WEP bands | 180 | 🟢 |
| 10 | `intelligence/mcp-reliability-audit.md` | MCP reliability audit standard | 200 | 🟢 |
| 11 | `intelligence/reference-analysis-quality.md` | reference benchmarking (Run 184) | 140 | 🟢 |
| 12 | `risk-scoring/risk-matrix.md` | 5×5 impact×likelihood | 100 | 🟢 |
| 13 | `risk-scoring/quantitative-swot.md` | quantitative SWOT (AHP) | 100 | 🟢 |
| 14 | `intelligence/methodology-reflection.md` | SAT attestation (Step 10.5) | 180 | 🟢 |

Per-artifact line floors are enforced at Stage C by `npm run validate-analysis`
against `analysis/methodologies/reference-quality-thresholds.json §thresholds.propositions`.

## 3 · Dataset Summary

- **Primary feeds** (Stage A):
  - `get_procedures_feed` (one-month): 50 items; legacy-ID skew (1972–1987 range)
    known EP API limitation where the feed returns historical procedure IDs
    with empty metadata fields (`stage`, `status`, `subjectMatter`,
    `dateInitiated`, `dateLastActivity`, `responsibleCommittee`, `rapporteur`
    all blank). Data-quality signal: **UNRELIABLE for proposition enumeration**.
  - `get_adopted_texts_feed` (one-month): 280 items; 104 TA-10-2026 identifiers
    indexed, with highest numbered text `TA-10-2026-0104`. No body content
    available for any probed identifier (13 deep-fetch attempts, all returned
    `UPSTREAM_404 / document indexed but content not yet available`).
  - `get_committee_documents_feed`: returned `status: unavailable` with
    `EP API returned an error-in-body response`. Not usable this run.
- **Derivative analytics** (also Stage A):
  - `generate_political_landscape`: 100-MEP snapshot (PPE 38, S&D 22, PfE 11,
    Verts/ALE 10, ECR 8, Renew 5, NI 4, The Left 2) — small-sample proxy;
    fragmentation index `HIGH`, majority type `MULTI_COALITION_REQUIRED`.
  - `analyze_coalition_dynamics` (2026-03-25 → 2026-04-24): all 9 groups with
    `internalCohesion: null` (per-MEP voting data not available from EP API);
    dominant sized-based alliance signal on Renew↔ECR (0.95), ECR↔PfE (0.95),
    Greens/EFA↔The Left (0.87), ESN↔NI (0.90).
  - `get_all_generated_stats` (2024–2026): EP10 Year-2 structural picture
    935 procedures projected for 2026, ENP 6.59, HHI 0.1515, right-bloc 52.3%.
- **Economic context** (World Bank IMF requirement):
  - Eurozone aggregates (`EUU`, `EMU`) not resolvable by the World Bank MCP
    fell back to DE + FR bilaterals. DE 2024 GDP growth `-0.496%`, FR `+1.19%`,
    DE CPI `+2.256%`.

## 4 · Stage Execution

| Stage | Scope | Status |
|-------|-------|--------|
| **A** — Data collection | feeds + 13 deep probes + landscape + coalitions + WB | ✅ complete (≤ 5 min) |
| **B** — Analysis (2 passes) | 14 artifacts below | ✅ complete (Pass 1 + Pass 2) |
| **C** — Completeness gate | `npm run validate-analysis -- --article-type=propositions` | ⏳ pending (blocking) |
| **D** — Article generation | **SKIPPED in this workflow** — paired `news-propositions-article.md` runs on merged analysis PR | n/a |

## 5 · Cross-Run Context

- Most recent same-day propositions run (stable folder): this is **run 1** of
  `analysis/daily/2026-04-24/propositions/`; no prior `manifest.json.history[]`
  entry exists, so no re-run merge was applied.
- Most recent prior propositions runs (different day): `2026-04-17/propositions-run45`,
  `2026-04-16/propositions-run44`, `2026-04-15/propositions-run43`. Those runs
  predate the artifact-catalog reorganization and use the older folder layout
  (`existing/`, `threat-assessment/`) rather than the canonical
  `intelligence/` + `risk-scoring/` tree this workflow emits.

## 6 · Reader Index

1. Start with `intelligence/synthesis-summary.md` — BLUF, confidence, WEP bands.
2. `risk-scoring/risk-matrix.md` + `quantitative-swot.md` for decision framing.
3. `intelligence/scenario-forecast.md` + `wildcards-blackswans.md` for horizon.
4. `intelligence/stakeholder-map.md` + `pestle-analysis.md` for actor / factor.
5. `intelligence/mcp-reliability-audit.md` for data-provenance audit trail.
6. `intelligence/methodology-reflection.md` for SAT ledger and caveats.

## 7 · Confidence & Provenance

- **Overall confidence**: 🟡 **MEDIUM-LOW** — the 104 TA-10-2026 proposition
  texts are indexed but not body-available; enumeration-level intelligence is
  strong, document-level intelligence is blocked by upstream indexing lag.
- **WEP**: All headline judgements carry a `WEP band` (see individual artifacts).
- **Admiralty**: EP Open Data Portal graded `B2` (usually reliable, probably true);
  World Bank graded `A2`. No commercial open-source feeds used this run.
- **Source list**: `data/procedures-feed.json`, `data/adopted-texts-feed.json`,
  `data/collection-summary.json`, live MCP tool outputs (World Bank, coalition
  dynamics, political landscape, EP aggregate stats).

## 8 · Change Log (this run)

- Initial analysis set for `2026-04-24` propositions window.
- Flagged two new upstream defects for the European Parliament MCP Server
  issue tracker (see `intelligence/mcp-reliability-audit.md §Defects`):
  1. `get_procedures_feed` returns legacy-ID skew for `timeframe=one-month`.
  2. `get_committee_documents_feed` returned `status: unavailable` with
     error-in-body; reproducible this run.

## 9 · Limitations (see Methodology Reflection §4 for full list)

- **No body content** for TA-10-2026-* adopted texts → no per-document
  rapporteur / margin / subject analysis possible for the 104 items indexed.
- **No vote-level coalition data** → coalition alliance signals rely on
  size-similarity proxy only (documented in methodology).
- **Eurozone aggregate unavailable from WB MCP** → economic context uses
  DE + FR bilaterals as proxies (documented in economic-context.md).

---

*File lives at `/home/runner/work/euparliamentmonitor/euparliamentmonitor/analysis/daily/2026-04-24/propositions/intelligence/analysis-index.md`. Regenerate with
`npx tsx src/generators/news-enhanced.ts --types=propositions --analysis
--analysis-methods=all --analysis-only --run-id=propositions-run-1777009560`.*
