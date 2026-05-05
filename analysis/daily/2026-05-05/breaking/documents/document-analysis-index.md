<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Document Analysis Index — Breaking News | 2026-05-05

**Classification:** Public | **Confidence:** 🟡 Medium | **Produced:** 2026-05-05T01:26Z
**Scope:** All documents collected and analyzed for April 28–30, 2026 session

---

## 1. Primary Documents (Adopted Texts Feed)

### High Priority (Score 80+)

| Ref | Title | Date | Session | Status | Analysis |
|-----|-------|------|---------|--------|---------|
| TA-10-2026-0160 | Digital Markets Act — Accelerated Enforcement Against Designated Gatekeepers | ~2026-04-30 | April 28–30 Strasbourg | Adopted ✅ | 🔴 CRITICAL — Full analysis in significance-scoring.md, stakeholder-map.md, threat-model.md |
| TA-10-2026-0161 | Accountability for Crimes Committed in Occupied Ukrainian Territories | ~2026-04-30 | April 28–30 Strasbourg | Adopted ✅ | 🔴 CRITICAL — Full analysis in significance-scoring.md, scenario-forecast.md |

### High Priority (Score 70–79)

| Ref | Title | Date | Session | Status | Analysis |
|-----|-------|------|---------|--------|---------|
| TA-10-2026-0112 | Budget 2027 — Parliament's Guidelines | ~2026-04-29 | April 28–30 Strasbourg | Adopted ✅ | 🟡 HIGH — Budget analysis in executive-brief.md, risk-matrix.md |
| TA-10-2026-04-30-ANN01 | EP Estimates 2027 (Annex to budget guidelines) | ~2026-04-30 | April 28–30 Strasbourg | Adopted ✅ | 🟡 HIGH — Linked to budget guidelines |
| TA-10-2026-0163 | Digital Platforms' Criminal Liability for Cyberbullying and Online Harassment | ~2026-04-30 | April 28–30 Strasbourg | Adopted ✅ | 🟡 HIGH — Novel Article 83 TFEU direction; stakeholder-map.md §3 |

### Medium Priority (Score 50–69)

| Ref | Title | Date | Session | Status | Analysis |
|-----|-------|------|---------|--------|---------|
| TA-10-2026-0162 | EU Democracy Support for Armenia and EU-Armenia Association Perspective | ~2026-04-30 | April 28–30 Strasbourg | Adopted ✅ | 🟢 MEDIUM — Geopolitical signal; stakeholder-map.md §4.3 |
| TA-10-2026-0131 | Immunity Waiver — Patryk Jaki (ECR/Poland) | ~2026-04-28 | April 28–30 Strasbourg | Adopted ✅ | 🟢 MEDIUM — Historical baseline §5; rule of law signal |
| TA-10-2026-0157 | European Livestock Sector Food Security and Disease Resilience | ~2026-04-29 | April 28–30 Strasbourg | Adopted ✅ | 🟢 MEDIUM — Agricultural policy; limited breaking news value |

---

## 2. Supporting Documents (EP Institutional Data)

| Source | Tool Used | Data Type | Quality | Notes |
|--------|-----------|-----------|---------|-------|
| EP Political Landscape | `generate_political_landscape` | 719 MEPs, 9 groups composition | 🟢 HIGH | Primary composition source |
| Coalition Dynamics | `analyze_coalition_dynamics` | 9 groups, 36 pairs | 🟢 HIGH | Voting coalition baseline |
| Early Warning System | `early_warning_system` | 3 warnings | 🟢 HIGH | Risk signal data |
| EP10 Statistics | `get_all_generated_stats` | Roll-call votes, legislative acts 2025–2026 | 🟢 HIGH | Historical output data |

---

## 3. Economic Data Documents

| Source | Tool Used | Data | Quality | Notes |
|--------|-----------|------|---------|-------|
| Germany GDP Growth | `world-bank-get-economic-data` | 2023: −0.87%, 2024: −0.50% | 🟢 HIGH | Primary macro data |
| IMF data | IMF SDMX API via `fetch_url` | UNAVAILABLE | ❌ DEGRADED | Probe returned unavailable; World Bank fallback used |

---

## 4. Data Quality Ledger

| Document Category | Items Collected | Quality | Limitation |
|-------------------|----------------|---------|-----------|
| Adopted texts (feed) | 50 items (14 from April session) | 🟡 MEDIUM | Title-only; full text 404 for all April items |
| Adopted texts (direct) | 0 of 6 tested | ❌ FAILED | All return 404 (3–7 day publication delay) |
| EP events | 0 (UNAVAILABLE) | ❌ FAILED | Endpoint unavailable |
| EP procedures | Historical-tail data (1972–1980s) | ❌ STALE | Not usable for breaking news |
| MEPs feed | OVERSIZED_PAYLOAD | ⚠️ DEGRADED | Used political-landscape instead |
| Plenary sessions | 0 (April not published) | ❌ FAILED | Not yet in system |
| Parliamentary questions | 10 items, placeholder content | ⚠️ DEGRADED | Not usable for breaking news |
| IMF economic data | UNAVAILABLE | ❌ FAILED | World Bank fallback applied |
| World Bank data | Germany GDP 2015–2024 | 🟢 HIGH | Successfully obtained |
| Coalition/political landscape | Full 719-MEP analysis | 🟢 HIGH | Primary political data source |

---

## 5. Document Coverage Assessment

**Breaking news coverage**: 8 of 14 feed items from April 28–30 session analyzed with varying depth. All items listed in analysis-index.md with titles. Full-text analysis unavailable for all — title-only analysis with contextual inference.

**Overall document quality**: 🟡 MEDIUM — Primary breaking news items identified and prioritized. Data limitations (full-text unavailability, events unavailability) acknowledged throughout. Analysis is robust given constraints.

---

## 6. Second Run Update (2026-05-05T07:05Z)

This document updated in run 2 to reflect improved data availability:

**Adopted texts feed status**: 41 items now confirmed available in feed (up from 0 direct-lookup successes in run 1). April 28–30 texts are indexed with labels (T10-0105/2026 through T10-0163/2026).

**April 28–30 session coverage completeness**: 14 priority items analyzed. All items now confirmed as adopted by the April 28–30 Strasbourg session. Key items:
- `TA-10-2026-0160`: Digital Markets Act enforcement — CONFIRMED ADOPTED April 30
- `TA-10-2026-0161`: Russia/Ukraine accountability — CONFIRMED ADOPTED April 30
- `TA-10-2026-0162`: Armenia democratic resilience — CONFIRMED ADOPTED April 30
- `TA-10-2026-04-30-ANN01`: EP 2027 budget estimates — CONFIRMED ADOPTED April 30
- `TA-10-2026-0142`: EU-Iceland PNR agreement — CONFIRMED ADOPTED April 29
- `TA-10-2026-0115`: Dog and cat welfare regulation — CONFIRMED ADOPTED April 28
- `TA-10-2026-0112`: 2027 budget guidelines — CONFIRMED ADOPTED April 28
- `TA-10-2026-0119`: EIB Group financial control — CONFIRMED ADOPTED April 28

**Data freshness upgrade**: Feed data collected at 07:02Z on 2026-05-05 — approximately 6 days after plenary adoption. Text is now indexed (feed confirmed) but full Official Journal text may still have a 1–3 day lag.

*Document index revised in run 2. Full-text documents available via EP Official Journal at eur-lex.europa.eu. Produced: 2026-05-05T07:05Z.*
