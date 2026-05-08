# EP10 Term Outlook — Session Baseline
**Date:** 2026-05-08 | **Article Type:** term-outlook | **Confidence:** HIGH

---

## Run Metadata

| Field | Value |
|-------|-------|
| Run date | 2026-05-08 |
| Run ID | term-outlook-run444-1778232545 |
| Workflow start epoch | 1778232531 |
| Article type slug | term-outlook |
| Analysis directory | `analysis/daily/2026-05-08/term-outlook` |
| Data mode | **degraded-imf** |
| IMF data | UNAVAILABLE (network firewall blocks `dataservices.imf.org`) |
| EP API voting data | UNAVAILABLE (per-MEP stats not exposed via EP Open Data API) |

---

## EP10 Composition Snapshot (May 2026)

| Group | Seats (active) | % | Alliance |
|-------|----------------|---|---------|
| EPP | 185 | 25.7% | Centre coalition anchor |
| S&D | 136 | 18.9% | Centre coalition |
| PfE | 85 | 11.8% | Right bloc |
| ECR | 81 | 11.3% | Right bloc |
| Renew | 77 | 10.7% | Centre coalition |
| Greens/EFA | 53 | 7.4% | Progressive |
| The Left | 45 | 6.3% | Progressive |
| ESN | 27 | 3.8% | Right bloc |
| NI | 30 | 4.2% | Non-attached |
| **Total** | **719** | **100%** | |

**Majority threshold: 361**
**Centre coalition (EPP+S&D+Renew): 398 (buffer: +37)**
**Right bloc (PfE+ECR+ESN): 193**
**Progressive bloc (S&D+Renew+Greens+Left): 311**

---

## Data Sources Used

| Source | Tool | Data Quality | Notes |
|--------|------|-------------|-------|
| EP political landscape | `generate_political_landscape` | HIGH | Seat composition verified |
| EP plenary sessions 2026 | `get_plenary_sessions` (year=2026) | HIGH | 51 sessions returned |
| EP adopted texts 2026 | `get_adopted_texts` (year=2026) | HIGH | 30+ texts; January 2026 session |
| EP voting records 2026 | `get_voting_records` (dateFrom/To 2026) | MEDIUM | 11 records from Jan 2026 |
| EP procedures feed | `get_procedures_feed` (one-month) | MEDIUM | Large dataset |
| EP early warning system | `early_warning_system` | MEDIUM | Stability score 84; DOMINANT_GROUP_RISK |
| EP all-generated stats | `get_all_generated_stats` | HIGH | Comprehensive EP6-EP10 data |
| EP latest votes | `get_latest_votes` | LOW | Empty for May 5-8, 2026 |
| EP sentiment tracker | `sentiment_tracker` | MEDIUM | Proxy scores only |
| World Bank GDP growth | `get_economic_data` (GDP_GROWTH) | HIGH | 2024 actuals: DE -0.5%, FR +1.2%, IT +0.7%, ES +3.5%, PL +3.0% |
| IMF economic data | `fetch_url` | **FAILED** | Network firewall blocks endpoint |

---

## Key EP Statistics (from `get_all_generated_stats`, 2025-2026)

- **Roll-call votes in EP10 (2024 partial):** Data returned
- **Plenary sessions count:** 51 sessions confirmed in 2026
- **Legislative output trajectory:** Consistent with EP9 baseline, early AI Act implementation contributing to high volume
- **MEP attendance rate:** Baseline 85-90% estimated (EP9 average reference)
- **Committee meeting frequency:** All 23 committees active

---

## Stability Indicators

| Indicator | Value | Source | Assessment |
|-----------|-------|--------|-----------|
| Parliament stability score | 84/100 | early_warning_system | GOOD — above average |
| Primary risk flag | DOMINANT_GROUP_RISK | early_warning_system | EPP dominance structural |
| Risk level | MEDIUM | early_warning_system | Expected for EP10 composition |
| Coalition surplus | +37 seats | Structural analysis | Adequate but not large |

---

## Prior Run Detection

No prior `term-outlook` analysis was found in `analysis/daily/2026-05-08/term-outlook/` at run start. This is the **first run for this date and article type**. Manifest created fresh. No merge or append operation required.

---
*This baseline file is a factual record of the run's data environment, not an analytical product. Confidence: HIGH for metadata; MEDIUM for interpretive notes.*
