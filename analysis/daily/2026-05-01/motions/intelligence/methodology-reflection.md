<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Methodology Reflection — EP Motions, 2026-05-01

**Step 10.5 of the AI-Driven Analysis Protocol**
**Classification:** UNCLASSIFIED // EU PUBLIC

---

## Reflection Framework

Per `analysis/methodologies/ai-driven-analysis-guide.md` Step 10.5, this artifact documents:
1. What methodology was applied
2. Where the analysis was strongest and weakest
3. What would change with better data
4. Confidence calibration for downstream consumers

---

## Methodology Applied

This analysis followed the 10-step AI-Driven Analysis Protocol:

**Steps 1–3 (Data collection):** EP MCP tools were called in Stage A, with priority on `get_adopted_texts(year:2026)`, `generate_political_landscape()`, `get_speeches()`, `track_legislation("2025/2171(IMM)")`, and `early_warning_system()`. IMF probe failed (network firewall); degraded mode activated.

**Steps 4–7 (Multi-framework analysis):** Produced artifacts covering significance classification (EP scoring framework), actor mapping (OSINT with interest/power matrix), forces analysis (Five Forces), impact matrix (multi-dimensional), PESTLE, coalition dynamics (ENP + Laakso-Taagepera), SWOT (evidence-scored ≥80 words/item), risk matrix (5×5), stakeholder mapping (mandatory motions artifact), stakeholder impact (mandatory, ≥150 words/perspective), scenario forecast (3 scenarios, 6-month horizon), and threat assessment (STRIDE-adapted political model).

**Steps 8–9 (Synthesis and confidence labelling):** All artifacts include 🟢/🟡/🔴 confidence labels. MCP reliability audit documents all tool invocations and data gaps.

**Step 10 (Iterative improvement — Pass 2):** At minute 17, Pass 1 complete with 22 artifacts. Pass 2 readback confirms artifacts are substantive and evidence-grounded; key deepen targets identified below.

---

## Strength Areas

**Strongest artifact:** `risk-scoring/quantitative-swot.md` — each item exceeds 80-word floor with specific evidence citations (seat counts, historical cohesion rates, procedure references). The Laakso-Taagepera ENP calculation in `intelligence/coalition-dynamics.md` provides a precise, verifiable quantitative anchor that differentiates this analysis from qualitative-only assessments.

**Strongest evidence chain:** Jaki immunity waiver — procedure 2025/2171(IMM) verified via `track_legislation()`, committee recommendation date confirmed (April 23), plenary vote date confirmed (April 28). This is the analysis's most data-grounded component.

**Most valuable synthesis:** `intelligence/synthesis-summary.md` Signal 3 (grand coalition stronger than expected on geopolitics) — counter-intuitive finding backed by voting trend data (70.9% → 74.3% Ukraine support across EP10 sessions) that challenges the dominant "Ukraine fatigue" narrative.

---

## Weakness Areas

**Data limitation 1:** Voting records unavailable (4-6 week delay). All vote margin estimates are structural inference. Confidence on MEP-level analysis is 🔴 LOW. This is the most material data gap — it means every vote breakdown table in this analysis is an educated estimate, not an empirical fact.

**Data limitation 2:** Full text of April 28-30 adopted texts unavailable (TA-10-2026-0105 through -0162). Motion content analysis relies on titles, subject codes, and procedure metadata. Specific amendment language, voting split within resolutions (not just for/against the whole text), and minority opinions are unknown.

**Data limitation 3:** IMF data unavailable (network firewall). Economic impact analysis for DMA/budget motions is qualitative only. The DMA trade war risk (R2, scored 🔴 RED) cannot be quantified with confidence.

---

## What Would Change With Better Data

**If roll-call voting data were available:**
- Vote margin tables would be confirmed vs. estimated
- MEP-level defection analysis would replace group-level structural inference
- ECR cohesion would be precisely measured rather than estimated at 65%
- The "grand coalition stronger than expected" thesis would be confirmed or refuted

**If IMF data were available:**
- DMA trade war economic impact would have a specific €-value estimate
- Budget guidelines fiscal impact would be quantified
- EU-US bilateral trade exposure would have precise figures
- Economic confidence would upgrade from 🔴 LIMITED to 🟡 MEDIUM

**If full text of April 28-30 adopted texts were available:**
- Amendment-level analysis would replace holistic text inference
- Specific legislative language (actionable vs. hortatory) would be assessed
- Minority opinions would reveal coalition fracture lines within votes

---

## Confidence Calibration

| Analysis Dimension | Confidence | Key Limitation |
|-------------------|:----------:|----------------|
| Political landscape (composition) | 🟢 HIGH | Direct EP API data |
| Coalition mathematics | 🟢 HIGH | Seat counts confirmed |
| Jaki procedure timeline | 🟢 HIGH | Procedure tracking confirmed |
| Historical cohesion rates | 🟢 HIGH | EP historical data |
| Vote outcome estimates (all motions) | 🟡 MEDIUM | Structural inference only |
| Motion content analysis | 🟡 MEDIUM | Metadata/title only |
| Threat actor profiles | 🟡 MEDIUM | Political pattern analysis |
| Economic impact | 🔴 LIMITED | IMF unavailable |
| MEP-level voting behaviour | 🔴 LOW | No roll-call data |

**Overall analysis confidence: 🟡 MEDIUM-HIGH**

The structural political analysis (coalition mathematics, significance classification, actor mapping) achieves 🟢 HIGH confidence. The content-dependent analysis (vote margins, motion substance, economic impact) is 🟡 MEDIUM or 🔴 LIMITED. This is appropriate for a run conducted within 4-6 weeks of the events being analysed.

---

## Pass 2 Rewrite Log

Pass 2 conducted at minute 17. Key deepening actions:
- `quantitative-swot.md`: All items verified to exceed 80-word floor; evidence citations confirmed
- `stakeholder-impact.md`: All perspectives verified ≥150 words with specific evidence chains
- `synthesis-summary.md`: Three key signals added with cross-artifact evidence chains
- `coalition-dynamics.md`: Laakso-Taagepera ENP calculation added (precise quantification)
- `risk-matrix.md`: IMF degraded-mode flag added to economic quantification note
- `voting-patterns.md`: Voting data freshness table added; EP tool name documented

**Rewrite count (Pass 2):** 6 artifacts reviewed and confirmed; no placeholder text identified; all 🔴 IMF UNAVAILABLE markers present where required.

---

*Step 10.5 — Final artifact per `ai-driven-analysis-guide.md` Rules 1–22 | Run: 2026-05-01 motions*
