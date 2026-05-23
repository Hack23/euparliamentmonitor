# Document Analysis Index — EP Breaking News 2026-05-15
**Article Type:** Breaking | **Run:** breaking-run-001 | **Date:** 2026-05-15

---

## 📚 Document Registry

This index catalogues all source documents analysed in this breaking news run, with metadata, content summary, and cross-reference to consuming artifacts.

---

### Primary Documents: EP Adopted Texts (April 28–30, 2026)

| Document ID | Title | Adopted | Type | Significance |
|------------|-------|---------|------|-------------|
| TA-10-2026-0112 | Guidelines for the 2027 budget — Section III | 2026-04-28 | Budget | 🟢 HIGH |
| TA-10-2026-0115 | Welfare of dogs and cats and their traceability | 2026-04-28 | Regulation | 🟡 MEDIUM |
| TA-10-2026-0119 | Control of EIB financial activities — annual report 2024 | 2026-04-28 | Report | 🟡 MEDIUM |
| TA-10-2026-0142 | EU-Iceland PNR agreement | 2026-04-29 | Agreement | 🟡 MEDIUM |
| TA-10-2026-0151 | Escalating trafficking in Haiti | 2026-04-30 | Resolution | 🟡 MEDIUM |
| TA-10-2026-0160 | Enforcement of the Digital Markets Act | 2026-04-30 | Resolution | 🟢 HIGH |
| TA-10-2026-0161 | Russia's attacks / Ukraine civilian accountability | 2026-04-30 | Resolution | 🟢 HIGH |
| TA-10-2026-0162 | Supporting democratic resilience in Armenia | 2026-04-30 | Resolution | 🟡 MEDIUM |
| TA-10-2026-0163 | Cyberbullying and online harassment criminal provisions | 2026-04-30 | Resolution | 🟡 MEDIUM |
| TA-10-2026-04-30-ANN01 | EP Budget Estimates FY2027 | 2026-04-30 | Budget | 🟢 HIGH |

---

### Secondary Documents: Earlier April 2026 Context

| Document ID | Title | Adopted | Relevance |
|------------|-------|---------|-----------|
| TA-10-2026-0096 | US tariff quotas adjustment | 2026-03-26 | Trade context for DMA geopolitics |
| TA-10-2026-0088 | Waiver of immunity — Grzegorz Braun | 2026-03-26 | Rule-of-law/PRIV context |
| TA-10-2026-0083 | Elene Khoshtaria / Georgian Dream political prisoners | 2026-03-12 | Eastern Partnership baseline |
| TA-10-2026-0060 | ECB Vice-President appointment | 2026-03-10 | Economic governance context |

---

### Data Sources: EP Open Data Portal

| Feed | Items Retrieved | Freshness | Quality |
|------|----------------|-----------|---------|
| `get_adopted_texts(year=2026)` | 31 items | Live API | 🟢 HIGH |
| Pre-fetched adopted-texts-feed | 500 items | Pre-fetched | 🟡 MEDIUM (no dates in feed) |
| Pre-fetched meps-feed | 637 MEPs | Pre-fetched | 🟢 HIGH |
| `get_latest_votes` | 0 items (no plenary this week) | Live API | N/A |
| `get_voting_records` | 0 items (EP publication delay) | Live API | 🔴 UNAVAILABLE |
| `get_plenary_sessions(2026-04-28/05-01)` | 0 (API limitation) | Live API | 🔴 UNAVAILABLE |

**Note on data quality:** The EP Open Data Portal's voting records have a multi-week publication delay. The April 30 adopted texts (0160–0163) are indexed but full content not yet available via API (HTTP 404 on document fetch). Titles and procedural references are confirmed from the `get_adopted_texts` endpoint. Analysis is based on procedural metadata, subject matter codes, and institutional context.

---

### Document Classification by Policy Area

| Policy Area | Documents | Key Texts |
|------------|-----------|-----------|
| Digital/Tech Regulation | 2 | 0160, 0163 |
| Foreign Policy/Security | 3 | 0161, 0162, 0151 |
| Fiscal/Budget | 2 | 0112, ANN01 |
| Internal Market | 1 | 0115 |
| Financial Oversight | 1 | 0119 |
| External Agreements | 1 | 0142 |

---

*Source: EP Open Data Portal API | MCP tools: get_adopted_texts, get_latest_votes, get_voting_records | Confidence: 🟢 HIGH for confirmed texts, 🟡 MEDIUM for procedural context*
