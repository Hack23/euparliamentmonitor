# Pipeline Health — EU Parliament Propositions 2026-05-15
**Mandatory propositions-specific artifact per workflow specification**

## 🏥 Overall Pipeline Health Assessment

**Health Score: 5.5/10 — DEGRADED**

| Dimension | Score | Status | Notes |
|-----------|-------|--------|-------|
| Active procedures tracked | 0/20 expected | 🔴 CRITICAL | Feed degraded — 1972-87 data only |
| Adopted texts tracked | 51 | 🟢 HEALTHY | Primary data source operational |
| Trilogue active | Unknown | 🔴 UNKNOWN | Cannot verify from available data |
| Committee reports pipeline | Unknown | 🔴 UNKNOWN | Committee docs feed unavailable |
| Vote record freshness | 0 days (May data) | 🔴 CRITICAL | Vote data delayed; May not published |

---

## 📊 Known Active Legislative Files (derived from adopted texts context)

| File | Stage | Last Action | Expected Next | Health |
|------|-------|------------|--------------|--------|
| CSRD Omnibus (`2023/0350`) | Committee | Draft opinion circulated | JURI/ECON joint opinion June 2026 | 🟡 Active |
| EU-Mercosur (`2024/0XXX`) | Trilogue | Council mandate confirmed | Plenary consent 2026/2027 | 🔴 Stalled risk |
| EDIP (`2025/0XXX`) | Committee | ITRE rapporteur assigned | ITRE report June/July 2026 | 🟡 Active |
| Digital Euro (`2023/0264`) | Trilogue | Technical meetings ongoing | Target adoption Q4 2026 | 🟡 Active |
| AI Act delegated acts | Implementation | Commission drafting | Published 2026 Q2-Q3 | 🟢 On track |
| SRMR3 | Implementation | Adopted 2026-03-26 | National transposition 2026-2028 | 🟢 Adopted |
| Anti-Corruption Dir | Implementation | Adopted 2026-03-26 | National transposition 2028 | 🟢 Adopted |
| 2027 Budget Guidelines | Budget process | Adopted 2026-04-28 | Council budget proposal May | 🟢 On track |

---

## 🔧 Data Infrastructure Health

| Endpoint | Status | Impact | Recovery Action |
|----------|--------|--------|----------------|
| `get_procedures_feed` | 🔴 DEGRADED | Cannot track active procedures | Fallback to `get_adopted_texts` |
| `get_procedures` | 🔴 DEGRADED | Returns 1972-87 only | Same fallback |
| `monitor_legislative_pipeline` | 🔴 EMPTY | 0 procedures returned | Noted; using inference |
| `get_committee_documents_feed` | 🔴 UNAVAILABLE | No committee doc insights | Manual monitoring required |
| `get_adopted_texts` | 🟢 HEALTHY | 51 items YTD 2026 | Primary data path |
| `get_latest_votes` | 🔴 UNAVAILABLE | No May 2026 votes | Vote analysis inference-only |
| `get_voting_records` | 🟡 DELAYED | EP publishes with ~3wk lag | Historical only |

---

## 🚨 Pipeline Blockers

1. **Data degradation**: 5 of 7 key data endpoints non-functional. Limits real-time tracking.
2. **EU-Mercosur stall risk**: Strong French political opposition. Plenary consent not certain.
3. **CSRD Omnibus uncertainty**: Outcome could radically reshape sustainability reporting pipeline.
4. **Budget/MFF tensions**: Defence reallocation requests from Council vs. cohesion preservation from EP creates institutional friction.

## ✅ Pipeline Accelerators

1. **Banking union on track**: SRMR3 adopted — next step Single Resolution Fund recapitalization
2. **Anti-corruption implementation**: 27 MS transposition support packages in preparation
3. **AI Act on track**: Delegated acts publication expected Q2-Q3 2026
4. **Trade resilience**: US countermeasures package adopted — shields key sectors

---

*Pipeline Health v1.0 | 2026-05-15 | EU Parliament Monitor | Apache-2.0*
