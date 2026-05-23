---
articleType: breaking
runId: 188
date: 2026-04-19
analysisPhase: cross-run-diff
confidence: HIGH
---

# 🔄 Cross-Run Differential Analysis — Run 187 → Run 188

**Prior run**: analysis/daily/2026-04-19/breaking-run187
**Current run**: analysis/daily/2026-04-19/breaking-run188
**Elapsed between runs**: ~2 hours (same day, Easter Sunday April 19)

---

## What Changed (Net New Intelligence)

### 1. Official Titles Confirmed for Four Landmark Texts (🟢 HIGH confidence — definitive)

**THIS IS THE PRIMARY FINDING OF RUN 188.**

The four texts that have been DATA_UNAVAILABLE for content since their March 26, 2026 adoption — representing the highest-significance legislative output of EP10's first year — now have confirmed official titles via the metadata/index endpoint:

| Text ID | Run 187 Status | Run 188 Title Confirmed |
|---------|---------------|------------------------|
| TA-10-2026-0092 | DATA_UNAVAILABLE, purpose inferred | "Early intervention measures, conditions for resolution and funding of resolution action (SRMR3)" |
| TA-10-2026-0094 | DATA_UNAVAILABLE, purpose inferred | "Combating corruption" |
| TA-10-2026-0096 | DATA_UNAVAILABLE, purpose inferred | "Adjustment of customs duties and opening of tariff quotas for the import of certain goods originating in the United States of America" |
| TA-10-2026-0104 | DATA_UNAVAILABLE, purpose inferred | "Global Gateway — past impacts and future orientation" |

**Significance**: Prior runs (179-187) inferred these texts' content from their procedure reference numbers and subject matter codes. Run 188 provides the first CONFIRMED official legislative titles. This is not a trivial distinction: for example, TA-10-2026-0096's full title reveals it uses BOTH customs duty adjustments AND tariff rate quota opening — a nuanced dual-instrument approach that was not evident from the procedure reference (2025-0261) alone. Similarly, TA-10-2026-0094's subject matter code COJP (civil and criminal justice) now aligns with the confirmed title "Combating corruption."

**Method of discovery**: The year-filter endpoint `get_adopted_texts(year:2026)` exposes the metadata/index layer of the EP API, which maintains titles independent of the full-content review pipeline. This methodological discovery — the dual-layer architecture — is itself a Run 188 intelligence contribution.

### 2. TA-10-2026-0101 Regression (🟢 HIGH confidence — observed)

In Run 187, TA-10-2026-0101 (EU-China TRQ agreement) was accessible and returned full content. In Run 188, it returns DATA_UNAVAILABLE.

**This is the first content regression observed in 10 monitoring runs.** Prior runs tracked only "not yet accessible" → "accessible" transitions. The reverse transition was not anticipated.

**Interpretation**: The most likely explanation is that the EP's legal-linguistic review team returned the text for final corrections after it was briefly published. This is standard EP procedure for complex multilingual legal acts. The WTO legal terminology in the TRQ agreement (which involves precise customs nomenclature in 24 languages) makes it a prime candidate for post-publication corrections.

**Intelligence implication**: The TA-0101 regression does NOT invalidate Run 187's finding that the EU-China TRQ was adopted on March 26. It confirms a known text ID and date. It only means the full text has temporarily reverted to unavailable status. Expected re-publication: 3-7 days.

### 3. Feed Index Shows 159 Texts (vs 61 Content-Accessible)

The one-week adopted texts feed (index layer) shows 159 entries when queried with the broader filter. This compares to approximately 61 texts accessible via direct content lookup in Run 187. The gap of ~98 texts represents the "indexed but content-pending review" population.

**New information**: The feed index appears to be much larger than the content-accessible population, meaning the EP is processing a large backlog. The 159 index entries likely include texts from EP8 and EP9 that are being migrated into the new EP API v2 system, not just EP10 texts. Several EP8/EP9 texts (TA-8-2019-..., TA-10-2025-...) appeared in the index alongside the March 26, 2026 texts.

### 4. MEP Feed: 738 MEPs (Stable)

The MEP feed shows 738 active MEPs. No significant changes from Run 187. No new MEP appointments or replacements confirmed during Easter recess. The MEP feed showing 738 MEPs on Easter Sunday suggests routine directory maintenance continues during recess.

---

## What Was Confirmed (No Change from Run 187)

| Finding | Status | Confidence |
|---------|--------|------------|
| Tier 2 API (events, procedures) offline | CONFIRMED | 🟢 HIGH |
| Parliament in Easter recess until April 26 | CONFIRMED | 🟢 HIGH |
| Grand Centre coalition stable | CONFIRMED | 🟢 HIGH |
| No breaking news today (Easter Sunday) | CONFIRMED | 🟢 HIGH |
| Four March 26 texts content unavailable | CONFIRMED | 🟢 HIGH |
| Early warning stability score ~84/100 | CONFIRMED | 🟡 MEDIUM |

---

## What Was Refuted / Adjusted

| Prior Hypothesis | Run 188 Finding | Confidence |
|-----------------|----------------|------------|
| "Content restoration is monotonically increasing" | **REFUTED**: TA-0101 regression shows non-linear restoration | 🟢 HIGH |
| "Titles can be inferred from procedure codes" | **SUPERSEDED**: Official titles now confirmed directly | 🟢 HIGH |
| "TA-0096 title suggests bilateral sanctions" | **NUANCED**: Full title shows TRQ opening alongside duty adjustments — calibrated not punitive | 🟡 MEDIUM |

---

## Scenario Probability Updates

| Scenario | Run 187 Probability | Run 188 Probability | Rationale |
|----------|---------------------|---------------------|-----------|
| Full content release April 21-23 | 70% | 65% | TA-0101 regression reduces confidence in clean restoration |
| USTR Section 301 announcement | 20% | 25% | Window opens April 21-24; no new signals but timing approaches |
| Coalition fracture April 28-30 | 5% | 5% | No change — 84/100 stability score |
| EP emergency resolution on trade | 15% | 18% | Slightly elevated due to USTR window |
| Banking Union Council delay | 20% | 22% | German Bundesrat signals due; SRMR3 title confirmed |

---

## Pass 2 Refinements — Delta Framework Formalisation

Run 188's cross-run-differential exposes three categories of inter-run intelligence
transition that should be tracked formally in subsequent runs:

1. **Positive restoration transitions** (DATA_UNAVAILABLE → accessible): Historical
   baseline across Runs 179–187 showed this as the expected monotonic pattern.
2. **Negative restoration transitions** (accessible → DATA_UNAVAILABLE): Run 188's
   TA-0101 regression is the first observation in this category. If more than one
   such transition is observed in Run 189–191, the non-deterministic-restoration
   hypothesis upgrades from 🟡 Medium to 🟢 High confidence.
3. **Metadata-layer revelations** (title-unknown → title-confirmed): The four
   Run 188 title confirmations represent a qualitatively different transition
   not content restoration but metadata-endpoint discovery.

For Run 189 cross-run-diff.md, track:
- TA-0101 re-accessibility (Category 1, recovery from regression)
- TA-0092/0094/0096/0104 content-layer unlock (Category 1)
- Any new text regressions (Category 2)
- Titles confirmed for TA-0093/0097/0102 (Category 3)

**Composite delta-confidence for Run 188**: 🟢 HIGH — four independent verifiable
observations (4 title confirmations, 1 regression, 159-vs-61 gap quantification,
738 MEP stability). No findings rely on single-source inference.
