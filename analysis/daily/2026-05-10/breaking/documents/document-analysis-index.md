# Document Analysis Index — EU Parliament Breaking News
## 2026-05-10

**Confidence:** 🟢 HIGH (direct API data) | **Data source:** EP Open Data Portal

---

## 📑 PRIMARY DOCUMENTS IDENTIFIED

### Adopted Texts — April 28-30, 2026 Strasbourg Plenary

| Reference | Title | Classification | Content Available |
|-----------|-------|----------------|-------------------|
| TA-10-2026-0112 | Budget 2027 — General Guidelines | BUDGET | ✅ Title confirmed |
| TA-10-2026-0112-ANN01 | Budget 2027 — Annex (Section-by-section priorities) | BUDGET | ✅ Title confirmed |
| TA-10-2026-0115 | [Additional April 28 resolution — title TBD] | RESOLUTION | ✅ Identifier confirmed |
| TA-10-2026-0119 | [Additional April 28 resolution] | RESOLUTION | ✅ Identifier confirmed |
| TA-10-2026-0142 | [April 29 resolution] | RESOLUTION | ✅ Identifier confirmed |
| TA-10-2026-0151 | Human trafficking in Haiti | HUMANITARIAN | ✅ Title confirmed |
| TA-10-2026-0160 | Digital Markets Act — enforcement acceleration | DIGITAL/COMPETITION | ✅ Title confirmed |
| TA-10-2026-0161 | Ukraine war crimes accountability + ICPA | FOREIGN POLICY/JUSTICE | ✅ Title confirmed |
| TA-10-2026-0162 | Armenia democratic resilience and EU integration | FOREIGN POLICY | ✅ Title confirmed |

**Full text status:** HTTP 404 for April 30 items (TA-10-2026-0151, 0160, 0161, 0162) — indexed but content not yet published by EP. Available: Titles and identifiers only.

---

## 📊 DOCUMENT SOURCE ANALYSIS

### Primary Sources Used
1. `get_adopted_texts(year=2026)` — 21 items; April 28-30 resolutions confirmed
2. `get_adopted_texts_feed(timeframe="one-week")` — 258 items including April metadata
3. `generate_political_landscape()` — EP composition data
4. `analyze_coalition_dynamics()` — coalition structure

### Limitations
- No legislative procedure texts available (procedures feed degraded)
- No committee reports available for these resolutions (committee documents feed not queried)
- No plenary debate transcripts available (speeches API not queried for this plenary date)
- Amendment history unknown (EP roll-call data not available yet)

---

## 🔍 DOCUMENT AUTHENTICITY ASSESSMENT

All documents retrieved directly from EP Open Data Portal via authenticated MCP gateway. No third-party sources used. The EP Open Data Portal is authoritative for EP institutional output.

**Confidence in document identification:** 🟢 HIGH
**Confidence in full document content:** 🔴 LOW (texts not available)
**Confidence in political context analysis:** 🟡 MEDIUM-HIGH (inferred from structure + history)

---

*Document Analysis Index | EU Parliament Monitor | 2026-05-10*
