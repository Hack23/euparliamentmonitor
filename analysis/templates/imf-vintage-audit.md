<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📅 IMF Vintage Audit — Optional Artifact Template

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/intelligence/imf-vintage-audit.md` when the run consumes IMF data that spans multiple vintages, or when the article vintage differs from the generation date (e.g. a late article drafted using analysis produced under a prior vintage). Optional artifact — only required when vintage drift or pre-release embargoes apply.

> **🎯 Purpose:** Document which IMF vintages were consumed, confirm the HTML `data-vintage` attribute matches the analysis-time vintage (not the generation date), and record any vintage-drift reconciliation. Feeds the manifest and the article's source-attribution footnote.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Run ID** | `[REQUIRED: YYYY-MM-DD-<type>-run<NN>]` |
| **Article Type** | `[REQUIRED]` |
| **Analysis Vintage (authoritative)** | `[REQUIRED: e.g. WEO-April-2026]` |
| **Article Generation Date** | `[REQUIRED: YYYY-MM-DD]` |
| **Article Publication Window** | `[REQUIRED: Tier-1 ≤ 48h from generation / Tier-2 ≤ 7 days / Tier-3 ≤ 14 days]` |
| **Vintage Drift?** | `[REQUIRED: Yes/No — Yes when analysis vintage < current live vintage]` |
| **Confidence** | `[REQUIRED: 🟢 consistent / 🟡 drift documented / 🔴 drift unresolved]` |

---

## 1️⃣ Vintage Inventory

List every IMF vintage consumed by this run, one row per
database-vintage pair.

| Database | Vintage ID | Release date | Fetch timestamp | Series count | Records |
|----------|:----------:|:------------:|:---------------:|:------------:|:-------:|
| `WEO` | `April 2026` | 2026-04-16 | `[REQUIRED: ISO-8601]` | `[#]` | `[#]` |
| `FM` | `April 2026` | 2026-04-16 | `[REQUIRED]` | `[#]` | `[#]` |
| `IFS` | `monthly-2026-03` | 2026-04-08 | `[REQUIRED]` | `[#]` | `[#]` |
| `CPI` | `monthly-2026-03` | 2026-04-05 | `[REQUIRED]` | `[#]` | `[#]` |
| `[OPTIONAL]` | `[vintage]` | `[date]` | `[ts]` | `[#]` | `[#]` |

**Inventory narrative:**

`[REQUIRED: ≥80 words. Explain which vintages were used for which editorial claims. Cite the authoritative vintage used for the article's data-vintage HTML attribute.]`

---

## 2️⃣ HTML Vintage Attribute Validation

The article MUST carry `data-vintage="<VINTAGE_ID>"` on every
`<section class="economic-context imf-economic-context">` element.

| HTML section | Expected `data-vintage` | Actual | Match? |
|--------------|:----------------------:|:------:|:------:|
| `economic-context` | `[REQUIRED: authoritative vintage]` | `[REQUIRED]` | `[✅/❌]` |
| `scenario-forecast` | `[REQUIRED]` | `[REQUIRED]` | `[✅/❌]` |
| `[OPTIONAL: other IMF-anchored section]` | `[REQUIRED]` | `[REQUIRED]` | `[✅/❌]` |

**Validation status:** `[REQUIRED: ALL-MATCH / DRIFT-DETECTED / MISSING-ATTRIBUTES]`

If `DRIFT-DETECTED`, document the reconciliation in §4 below and fix
the article before PR creation.

---

## 3️⃣ Forecast-Marker Compliance

Every IMF forecast citation must include a forecast marker within 30
words of the number, checked at Stage-C editorial review per
[`../methodologies/imf-indicator-mapping.md §5`](../methodologies/imf-indicator-mapping.md#5-forecast-labelling-rule).
The legacy regex helper `validateIMFForecastMarker` in
`src/utils/imf-data.ts` was purged in the April-2026 aggregator-pipeline
migration.

| Article section | Indicator cited | Forecast marker present? | Marker phrase |
|-----------------|-----------------|:------------------------:|---------------|
| `[REQUIRED]` | `[SDMX code]` | `[✅/❌]` | `[e.g. "IMF projects"]` |
| `[REQUIRED]` | `[SDMX code]` | `[✅/❌]` | `[phrase]` |

**Status:** `[REQUIRED: ALL-COMPLIANT / GAPS-IDENTIFIED]`

---

## 4️⃣ Vintage-Drift Reconciliation

Required only when vintage drift is detected (analysis vintage ≠
article's published vintage).

| Section | Analysis vintage | Article vintage | Reconciliation decision |
|---------|:----------------:|:---------------:|-------------------------|
| `[section]` | `[WEO-April-2026]` | `[WEO-October-2025]` | `[UPGRADED to analysis vintage / KEPT article vintage with footnote / REDRAFTED to match new vintage]` |

**Reconciliation narrative:**

`[REQUIRED when drift exists: ≥100 words. Explain the drift, the decision, and the user-facing consequence. Prefer upgrading to the analysis vintage when feasible; when not, add an explicit footnote to the article pointing to this audit.]`

---

## 5️⃣ Pre-release / Embargo Check

Verify no IMF data was fetched before embargo lift.

| Vintage | Embargo lift (UTC) | Earliest fetch (UTC) | Within embargo? |
|---------|:------------------:|:--------------------:|:---------------:|
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[✅ / ❌ ESCALATE]` |

If `❌`, escalate to the workflow runner — this is a tradecraft
violation and the article MUST be held until embargo lifts.

---

## 6️⃣ Cross-Source Triangulation Record (summary)

| Indicator | IMF value | Cross-source | Cross-source value | Delta pp | Decision |
|-----------|:--------:|--------------|:------------------:|:--------:|:--------:|
| `[OPTIONAL for Tier-1 only]` | `[val]` | `[Eurostat/ECB/OECD]` | `[val]` | `[±val]` | `[consistent / material]` |

Cross-references [`../imf/cross-source-triangulation.md`](../imf/cross-source-triangulation.md).

---

## 7️⃣ Machine-Readable Summary (manifest delta)

Emit the following JSON into `manifest.json` `imfVintageAudit` block:

```json
{
  "imfVintageAudit": {
    "authoritativeVintage": "WEO-April-2026",
    "driftDetected": false,
    "htmlAttributeValidation": "ALL-MATCH",
    "forecastMarkerCompliance": "ALL-COMPLIANT",
    "embargoCompliance": "OK",
    "vintagesConsumed": ["WEO-April-2026", "FM-April-2026", "IFS-monthly-2026-03"]
  }
}
```

---

## 9️⃣ EP MCP Tool Inputs (n/a — IMF audit, but cross-checks against EP delivery context)

| EP MCP tool | Used for which section | Notes |
|-------------|------------------------|-------|
| `get_adopted_texts` | §3 Article-evidence cross-check | Confirms whether IMF figure is cited in adopted-text recitals. |
| `get_speeches` | §3 Article-evidence cross-check | Detects MEP misquoting of IMF vintages (e.g. citing WEO-Oct against article tagged WEO-Apr). |
| `get_procedures` | §4 Vintage-context binding | Procedure dossiers reference IMF Country Report vintage; audit must match. |
| `track_legislation` | §6 Forecast-horizon alignment | EP procedure timeline vs. IMF forecast horizon (often 1-3y mismatch). |

(Audit primarily cross-checks IMF-portal vintages; EP MCP only used for citation-discipline checks.)

---

## 🔟 Worked Pass-1 → Pass-2 Example (April-2026 WEO audit)

**❌ Pass-1 (thin, 19 words):**
> "All IMF figures match WEO April 2026. No drift detected. Article cites correct numbers. Audit passed."

**✅ Pass-2 (compliant, 88 words):**
> 5 of 5 IMF indicators carry the authoritative WEO-April-2026 vintage in HTML `data-imf-vintage="WEO-April-2026"` attributes. Forecast-horizon discipline: euro-area-2026-real-GDP cited as +1.2 % at 8-month horizon (within IMF April-WEO accuracy band of ±0.4 pp per `forecast-accuracy-baseline.md`). One borderline case: euro-area headline-CPI-2027 (+1.9 %) is a 20-month forecast, requiring ⚠️ FORECAST marker per `imf-indicator-mapping.md §5` — present in article. No FM-April-2026 figures mixed with WEO-April-2026 (cross-source isolation OK). Audit verdict: **PASS** with one observation — strengthen forecast horizon-disclosure prose for the 2027 CPI claim.

---

## 1️⃣1️⃣ Worked Audit Table — 5 IMF Indicators

| # | Indicator | SDMX code | Vintage date | Forecast horizon | Article evidence | Audit verdict |
|:-:|-----------|-----------|--------------|:----------------:|------------------|:-------------:|
| 1 | Euro-area Real GDP growth (2026) | `IMF.RES.WEO/A.U2.NGDP_RPCH` | WEO-April-2026 (16-Apr-2026) | +8 months | Article §3 ¶2: "+1.2 % per IMF (WEO Apr-2026)" with `data-imf-vintage` attr | ✅ PASS |
| 2 | Euro-area Headline CPI (2027) | `IMF.RES.WEO/A.U2.PCPIPCH` | WEO-April-2026 | +20 months | Article §4 ¶1: "+1.9 % (forecast)" with ⚠️ FORECAST marker | ✅ PASS |
| 3 | DE General Govt. Debt-to-GDP (2025e) | `IMF.FAD.FM/A.DE.GGXWDG_NGDP` | FM-April-2026 (10-Apr-2026) | -3 months (estimate) | Article §6 ¶3: "62.4 % (FM Apr-2026)" | ✅ PASS |
| 4 | FR Primary Balance (2026) | `IMF.FAD.FM/A.FR.GGXONLB_NGDP` | FM-April-2026 | +6 months | Article §6 ¶4 — vintage attribute MISSING in HTML | ⚠️ OBSERVATION |
| 5 | IT Reserves (M03 2026) | `IMF.STA.IFS/M.IT.AIR_USD` | IFS-monthly-2026-03 (28-Mar-2026) | -1 month (lagged) | Article §7 ¶1 with `data-imf-vintage="IFS-monthly-2026-03"` | ✅ PASS |

**Net audit:** 4/5 PASS · 1/5 OBSERVATION (missing HTML vintage attribute on FR primary balance — fix in Pass-2 article rewrite).

---

## 1️⃣2️⃣ Anti-patterns — REJECT on Pass-2 Review

| # | Banned pattern | Why it fails |
|:-:|---------------|--------------|
| 1 | Mixing WEO-April with WEO-October figures in same article without explicit cross-source-triangulation note | Vintages drift; mixing creates false comparability. |
| 2 | Forecast figure (>6 months out) without ⚠️ FORECAST marker per `imf-indicator-mapping.md §5` | Reader cannot distinguish nowcast from outlook. |
| 3 | HTML `data-imf-vintage` attribute missing on rendered figures | Validator (`validate-imf-vintages.js`) fails CI. |
| 4 | Audit verdict "PASS" with no SDMX codes cited per indicator | Untraceable; reviewer cannot reproduce. |
| 5 | Citing IMF figure without consulting `release-calendar.md` for embargo status | May expose pre-release data; embargo-compliance check is mandatory. |
| 6 | Optimism-bias claim without comparing to `forecast-accuracy-baseline.md` band | "IMF too optimistic" is a tradecraft claim requiring baseline anchor. |

---

## 1️⃣3️⃣ Cross-References — Controlling Methodology

- [`../methodologies/imf-indicator-mapping.md §5,7,8`](../methodologies/imf-indicator-mapping.md) — forecast-marker rules + vintage tracking + audit checklist (§8 is authoritative).
- [`../imf/release-calendar.md`](../imf/release-calendar.md) — vintage SLAs and embargo windows.
- [`../imf/forecast-accuracy-baseline.md`](../imf/forecast-accuracy-baseline.md) — optimism-bias bands per indicator.
- [`../imf/cross-source-triangulation.md`](../imf/cross-source-triangulation.md) — WEO×FM×IFS triangulation matrix.
- [`../methodologies/osint-tradecraft-standards.md`](../methodologies/osint-tradecraft-standards.md) — Admiralty A-1/A-2 grading for IMF data; B-2 if interpolated.
- `scripts/validate-imf-vintages.js` — CI validator (mirrors §11 audit table logic).

---

## 1️⃣4️⃣ Stage-C Completeness Signals

`scripts/validate-analysis-completeness.js` + `validate-imf-vintages.js` check for this artifact:

| Check | Threshold | Source |
|-------|-----------|--------|
| Line floor | ≥120 lines (default), 230+ for full-audit runs | `reference-quality-thresholds.json` |
| Required H2 substrings | "Vintage", "Forecast", "Audit Verdict" | structural contract |
| Mermaid block | optional (timeline if multi-vintage drift detected) | template visual contract |
| Tradecraft markers | Admiralty grade A-1 / A-2 on every IMF source; ⚠️ FORECAST on every >6-month figure | `imf-indicator-mapping.md §5` |
| Audit-table coverage | ≥5 indicators audited; SDMX code per row | per-artifact rule |
| HTML vintage attribute | 100 % of rendered article figures carry `data-imf-vintage="..."` | `validate-imf-vintages.js` |

---

## 1️⃣5️⃣ Worked Drift-Detection Output (multi-vintage scenario)

When two vintages overlap (e.g. WEO-October-2025 still cited in March 2026 articles after WEO-April-2026 publication 16-Apr-2026):

| Indicator | Old vintage figure | New vintage figure | Drift (pp) | Auditor action |
|-----------|:------------------:|:------------------:|:----------:|----------------|
| Euro-area Real GDP 2026 | +1.4 % (WEO-Oct-2025) | +1.2 % (WEO-Apr-2026) | -0.2 pp | UPDATE article; flag forecast revision in §3 |
| DE Debt-to-GDP 2025e | 63.1 % (FM-Oct-2025) | 62.4 % (FM-Apr-2026) | -0.7 pp | UPDATE; cross-check `data-imf-vintage` attribute |
| Euro-area CPI 2027 | +1.7 % (WEO-Oct-2025) | +1.9 % (WEO-Apr-2026) | +0.2 pp | UPDATE; FORECAST marker stays |

**Drift-rule:** any |Δ| ≥ 0.3 pp triggers article-revision PR; any |Δ| ≥ 0.5 pp also triggers cross-source-triangulation re-check per `cross-source-triangulation.md`.

---

**Document Control:** Template v1.2 · Depth floor: 230 lines.
