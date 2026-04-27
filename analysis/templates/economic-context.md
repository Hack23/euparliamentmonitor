<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 💹 Economic Context Template — IMF Primary Anchor + World Bank Non-Economic Cross-Refs

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/intelligence/economic-context.md`. Anchor EP policy topics in **IMF** macro/fiscal/trade/monetary data as the primary source (Wave-4 policy). Use **World Bank** only for non-economic cross-refs (health, education, social, environment, demographics). See [methodologies/per-artifact-methodologies.md §economic-context](../methodologies/per-artifact-methodologies.md#economic-context).

> **🎯 Purpose:** Bridge EP legislative activity to real-economy fundamentals using IMF indicators (WEO / Fiscal Monitor / IFS / BOP / ER / PCPS / GFSR / EREO / FSI / GFS / DOT). Under the **Wave-4 IMF-primary editorial policy** IMF is the required primary source for every economic claim; WB is additive for non-economic context only. Enforced at Stage-C editorial review per [`.github/prompts/04-article-generation.md §5`](../../.github/prompts/04-article-generation.md) — the legacy runtime gates (`articlePolicyHasEconomicContext` / `articlePolicyHasIMFEconomicEvidence` in `src/utils/content-validator.ts`, surrounded by `src/utils/validate-articles.ts`) were purged in the April-2026 aggregator-pipeline migration.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: EC-YYYY-MM-DD-runNN]` |
| **Analysis Period** | `[REQUIRED: YYYY-MM-DD to YYYY-MM-DD]` |
| **Primary Data Source** | `IMF (vintage: [REQUIRED: e.g. WEO-April-2026])` |
| **IMF Source** | `[REQUIRED: live | cache | knowledge-only]` |
| **Secondary (non-economic)** | `[REQUIRED: World Bank or "None"]` |
| **IMF Indicators Cited** | `[REQUIRED: count — must meet article-type floor from imf-indicator-mapping.md §8]` |
| **Forecast Horizon** | `[REQUIRED: current / t+1 / t+3 / t+5 — sizes the optimism-bias caveat per forecast-accuracy-baseline.md]` |
| **Triangulation Performed** | `[REQUIRED: Yes/No — required for Tier-1 + high-sensitivity indicators per cross-source-triangulation.md]` |
| **Confidence** | `[REQUIRED: 🟢/🟡/🔴]` |

---

## 1️⃣ Topic-to-Indicator Mapping

| EP Policy Topic | IMF Indicator (primary) | IMF Database | WB Indicator (non-economic cross-ref only) | Latest Value | Vintage Date |
|-----------------|-------------------------|:-------------|--------------------------------------------|:------------:|:------------:|
| `[REQUIRED: e.g. Green Deal / Digital Single Market]` | `[REQUIRED: SDMX code + name]` | `[REQUIRED: WEO/FM/IFS/etc.]` | `[OPTIONAL: WB code for non-economic only, or "N/A"]` | `[REQUIRED: value + unit]` | `[REQUIRED: YYYY-MM-DD]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[OPTIONAL]` | `[REQUIRED]` | `[REQUIRED]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[OPTIONAL]` | `[REQUIRED]` | `[REQUIRED]` |

**Mapping rationale:**

`[REQUIRED: ≥100 words explaining why these IMF indicators were chosen for these policy topics. Cite imf-indicator-mapping.md per-type floors. Where a WB indicator appears, justify it is non-economic (health/education/social/env/demographics/defence/agriculture/innovation/governance only).]`

---

## 2️⃣ EU-27 Headline Indicators

**Primary indicator:** `[REQUIRED: name, e.g. "GDP growth rate (annual %)"]`

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
xychart-beta
    title "EU-27 [INDICATOR NAME] — 5-Year Trend"
    x-axis [2020, 2021, 2022, 2023, 2024]
    y-axis "[UNIT]" 0 --> 10
    line [[value], [value], [value], [value], [value]]
```

| Indicator | Code | Latest | EU-27 Avg | Delta vs. Avg | 5Y Trend |
|-----------|------|:------:|:---------:|:-------------:|:--------:|
| `[REQUIRED: indicator 1]` | `[WB/IMF code]` | `[value]` | `[value]` | `[±value]` | `[↑ / → / ↓]` |
| `[REQUIRED: indicator 2]` | `[code]` | `[value]` | `[value]` | `[±value]` | `[↑ / → / ↓]` |
| `[REQUIRED: indicator 3]` | `[code]` | `[value]` | `[value]` | `[±value]` | `[↑ / → / ↓]` |

**Headline narrative:**

`[REQUIRED: ≥100 words interpreting the headline indicators. What do these numbers tell us about the EU-27 economic state? What pressures do they create for EP legislative priorities?]`

---

## 3️⃣ Affected Member-State Focus

**Member states most exposed to the period's dominant policy:**

### Member State 1: `[REQUIRED: ISO 2-letter code + name]`

| Indicator | Value | EU-27 Avg | Delta | Exposure Level |
|-----------|:-----:|:---------:|:-----:|:--------------:|
| `[REQUIRED: indicator 1]` | `[value]` | `[value]` | `[±value]` | `[🟢 Low / 🟡 Medium / 🔴 High]` |
| `[REQUIRED: indicator 2]` | `[value]` | `[value]` | `[±value]` | `[...]` |

**Exposure narrative:** `[REQUIRED: ≥80 words explaining why this member state is particularly exposed. What makes their position unique or vulnerable?]`

---

### Member State 2: `[REQUIRED]`

*(repeat structure)*

---

### Member State 3: `[REQUIRED]`

*(repeat structure)*

---

## 4️⃣ Forward Outlook

**IMF WEO / Fiscal Monitor projections (+5 years):**

| Indicator | 2025 | 2026 | 2027 | 2028 | 2029 | Trajectory | Horizon confidence |
|-----------|:----:|:----:|:----:|:----:|:----:|:----------:|:------------------:|
| `[REQUIRED: indicator 1]` | `[value]` | `[value]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` | `[🟢 t / 🟡 t+1-2 / 🔴 t+3+]` |
| `[REQUIRED: indicator 2]` | `[value]` | `[value]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` | `[🟢/🟡/🔴]` |

**Projection narrative:**

`[REQUIRED: ≥100 words interpreting forward projections. What do these forecasts imply for EP legislative timeline and priorities? Where are divergences vs. consensus?]`

**Forecast marker:** `[REQUIRED: confirm each forecast number is within 30 words of "forecast"/"projection"/"projects"/"expects" — validator regex-enforced]`

**Caveats:**

`[REQUIRED: for horizons ≥3y, include optimism-bias acknowledgement sized per analysis/imf/forecast-accuracy-baseline.md — typical MAE 1.8–2.4pp for GDP at t+3, 4–6pp for debt/GDP at t+3. Cite the vintage explicitly.]`

---

## 5️⃣ Analytical Bridge to Political Reading

**How macro data shapes political assessment:**

`[REQUIRED: ≥150 words connecting economic indicators to EP political dynamics. Examples:
- "Rising unemployment in Southern member states (ES, IT, GR) increases pressure on S&D to prioritize social policy over fiscal consolidation"
- "IMF forecast of 2.1% EU growth creates fiscal headroom for Green Deal investment, reducing EPP-Greens tension on budget constraints"
- "Widening GDP-per-capita gaps between North/South strengthen nationalist narratives, complicating EPP-Renew coalition on single-market deepening"

Cite specific indicators and explain political mechanism.]`

---

## 6️⃣ SEO / Editorial Evidence Bridge

| Search-intent term | Evidence source | Safe use in title/description? | Rationale |
|--------------------|-----------------|:------------------------------:|-----------|
| `[REQUIRED: committee acronym / policy file]` | `[REQUIRED: EP artifact + IMF code]` | `[✅/❌]` | `[REQUIRED: why this term accurately reflects the evidence]` |
| `[REQUIRED: affected stakeholder]` | `[REQUIRED]` | `[✅/❌]` | `[REQUIRED]` |
| `[OPTIONAL: procedure / vote reference]` | `[REQUIRED]` | `[✅/❌]` | `[REQUIRED]` |

**Editorial bridge paragraph:** `[REQUIRED: 80–120 words naming the exact
economic pressure that may appear in the article title or meta description. It
must include one IMF vintage, one SDMX code, one EP policy topic, and one named
stakeholder impact. Do not write marketing copy; write an evidence-backed source
sentence the Stage-B agent can reuse safely.]`

---

## 7️⃣ Data-Source Bridge

**Wave-4 IMF-primary status:**

| Source | Available? | Records Retrieved | Used in This Run? | Role |
|--------|:----------:|:-----------------:|:------------------:|------|
| IMF SDMX REST (primary economic) | `[✅/❌]` | `[#]` | `[✅/❌]` | **Primary** — Wave-4 mandatory for economic context |
| World Bank MCP (non-economic only) | `[✅/❌]` | `[#]` | `[✅/❌]` | Additive — health/edu/social/env/demographics/defence/agri/innov/gov only |

**Cross-source triangulation** (required for Tier-1 articles citing high-sensitivity indicators):

| Indicator | IMF value | Cross-source | Cross-source value | Delta (pp) | Decision | Reconciliation note |
|-----------|:--------:|--------------|:------------------:|:----------:|----------|---------------------|
| `[REQUIRED or "N/A — not Tier-1"]` | `[value]` | `[Eurostat/ECB/OECD/BIS]` | `[value]` | `[±value]` | `[consistent/material-delta]` | `[≥30 words when material]` |

**Bridge narrative:**

`[REQUIRED: explain the IMF source selection (vintage + database) and whether the run used live IMF REST or same-day cache/imf JSON. "knowledge-only" is allowed only as an explicit failure marker and fails Stage C. If WB non-economic data is included, explain which non-economic domain and why. Treat WB EU-aggregate "Country not found" responses as the expected trigger to use IMF EU/EA aggregates, not as a data defect. If triangulation was performed, cite the outcome. If neither source was available, explain fallback (prior-run cache, Eurostat, manual sourcing).]`

**Indicator mapping references:**
- `[REQUIRED: cite imf-indicator-mapping.md §2 per-type floor satisfaction]`
- `[OPTIONAL: cite worldbank-indicator-mapping.md only for non-economic cross-refs, or note "N/A"]`

---

## 8️⃣ Confidence Assessment

**Overall confidence:** `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW]`

**Confidence by data source:**

| Source | Confidence | Rationale |
|--------|:----------:|-----------|
| World Bank | `[🟢/🟡/🔴]` | `[REQUIRED: data vintage, completeness, relevance]` |
| IMF | `[🟢/🟡/🔴]` | `[REQUIRED]` |
| Member-state data | `[🟢/🟡/🔴]` | `[REQUIRED]` |

---

## 🛠️ Worked Pass-1 → Pass-2 example

### Pass-1 (thin)

> *The EU economy grew. Inflation is high. Some member states have
> high debt.*

### Pass-2 (Economist-quality)

> The euro area economy expanded by **1.3% in 2025** (IMF WEO Apr 2026,
> Admiralty A2), accelerating to a projected **1.6% in 2026** with risks
> tilted to the downside given trade-policy headwinds (🟡 moderate
> confidence). HICP inflation moderated to **2.4% y/y** in March 2026
> (IFS Mar 2026, A2), within the ECB's tolerance corridor but above the
> 2% target. General-government gross debt remains elevated in IT (133%
> GDP), GR (148%) and FR (113%) — three of these four exceed the
> Stability and Growth Pact 60% reference value by ≥50 pp (FM Oct 2025,
> A2). The fiscal gap, combined with ECB's policy-rate sequencing, frames
> the policy stakes for the Critical Raw Materials Act (`COM(2025)0474`)
> debate.

**What changed**: vintages cited, Admiralty grades attached, specific
country values, link to procedure, confidence labelled.

## 🚫 Anti-patterns — economic-context failures

| Anti-pattern | Why it fails | Correct approach |
|---|---|---|
| Single-year point with no trend | Loses context | 5-year actual + 3-year forecast |
| "About 2%" / "around 1%" | Imprecision | Cite to 0.1 pp with vintage |
| WB cited for GDP/inflation | Wave-4 source split | IMF for economic; WB for non-economic only |
| `EUU` aggregate | Banned by WB MCP | Use IMF `EU` or `EA` |
| Mixing actual + projection without label | Misleads | "1.3% (2025 actual)", "1.6% (2026 projection)" |
| No Admiralty grade | Tradecraft fail | A2 default for IMF/Eurostat; B2 for staff estimates |
| No bridge to article subject | Floating context | One sentence linking each indicator to a procedure or stakeholder |
| Vintage older than freshness floor | Stale data | See `worldbank-indicator-mapping.md §8` floors |
| No triangulation for Tier-1 | High-stakes claim unverified | IMF + Eurostat (or ECB SDW for monetary) |
| `IMF Source: knowledge-only` | Unverified agent memory | Run `scripts/imf-mcp-probe.sh` and cite `cache/imf/*.json` (`live` or `cache`) |
| Indicator without unit | Numerics ambiguous | "1.3% real GDP growth", "133% of GDP" |

## 🎯 EP MCP tool inputs and complementary data sources

| Source | Domain | Tool / dataflow |
|---|---|---|
| IMF MCP | Economic / fiscal / monetary | `imf-fetch-data` `WEO`, `FM`, `IFS`, `BOP`, `ER`, `PCPS` |
| WB MCP (non-economic only) | Health, education, social, environment, defence | `worldbank-mcp/get-*-data`, `raw-rest` |
| Eurostat (cross-source) | EU-27 official statistics | manual; cite as A2 |
| ECB SDW (monetary triangulation) | Policy rate, M3, REER | manual; cite as A1 |
| OECD (cross-source) | OECD members; well-being | manual; cite as A2 |
| `analyze_committee_activity` | EP committee context (ECON, ITRE, ENVI) | EP MCP |

## 🔗 Controlling methodology cross-references

- [`../methodologies/imf-indicator-mapping.md`](../methodologies/imf-indicator-mapping.md) (mandatory for economic)
- [`../methodologies/worldbank-indicator-mapping.md`](../methodologies/worldbank-indicator-mapping.md) (non-economic)
- [`../methodologies/strategic-extensions-methodology.md`](../methodologies/strategic-extensions-methodology.md) §Economic Context
- [`imf-vintage-audit.md`](imf-vintage-audit.md) (Tier-1 cross-source audit)

## ✅ Stage-C completeness signals

- Line floor: 185 lines
- ≥ 1 IMF indicator with vintage cited (Wave-2 OR-gate)
- For Tier-1 articles: ≥ 1 cross-source triangulation row in §7 with
  reconciliation note when delta ≥ 0.2 pp
- Confidence assessment present (🟢/🟡/🔴 per source)
- All numerics carry units (%, pp, EUR bn, etc.)

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/intelligence/economic-context.md` · Template v1.2 · Depth floor: 185 lines.
