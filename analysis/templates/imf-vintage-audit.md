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
The legacy regex helper `validateIMFForecastMarker()` in
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

## 8️⃣ References

- [`../imf/release-calendar.md`](../imf/release-calendar.md) — vintage SLAs
- [`../imf/forecast-accuracy-baseline.md`](../imf/forecast-accuracy-baseline.md) — optimism-bias bands
- [`../imf/cross-source-triangulation.md`](../imf/cross-source-triangulation.md) — triangulation matrix
- [`../methodologies/imf-indicator-mapping.md §5,7`](../methodologies/imf-indicator-mapping.md) — forecast labelling + vintage tracking
