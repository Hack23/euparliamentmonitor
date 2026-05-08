<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Document Analysis Index — April 2026 EP Plenary
## European Parliament | 2026-05-08

**Purpose:** Catalogue all adopted texts and documents identified in this breaking news run

---

## 1. ADOPTED TEXTS — APRIL 28-30, 2026 STRASBOURG PLENARY

### 1.1 Tier-1 Documents

| Document ID | Title | Date | Status | Analysis |
|------------|-------|------|--------|---------|
| TA-10-2026-0160 | Digital Markets Act Enforcement Resolution | 2026-04-30 | ✅ Adopted | See executive-brief.md §1.1 |
| TA-10-2026-0161 | Ukraine/Russia Accountability Framework | 2026-04-30 | ✅ Adopted | See executive-brief.md §1.2 |
| TA-10-2026-0112 | Budget 2027 General Guidelines | 2026-04-29 | ✅ Adopted | See executive-brief.md §1.3 |
| TA-10-2026-04-30-ANN01 | EP Budget Estimates 2027 | 2026-04-30 | ✅ Adopted | See executive-brief.md §1.4 |
| TA-10-2026-0162 | Armenia Democratic Resilience Partnership | 2026-04-30 | ✅ Adopted | See executive-brief.md §1.5 |

### 1.2 Tier-2 Documents

| Document ID | Title | Date | Status | Notes |
|------------|-------|------|--------|-------|
| (MEP immunity) | MEP Jaki (Poland) Immunity Waiver | 2026-04-29 | ✅ Adopted | Polish court proceedings |
| (livestock) | Livestock Sector Sustainable Transition | 2026-04-28 | ✅ Adopted | Animal welfare + methane |
| (EU-Iceland) | EU-Iceland PNR Agreement | 2026-04-28 | ✅ Adopted | Data transfer protocol |
| (Haiti) | Haiti Human Trafficking Resolution | 2026-04-28 | ✅ Adopted | Humanitarian |
| (cybercrime) | Cybercrime Convention Implementation | 2026-04-29 | ✅ Adopted | Budapest Convention update |

### 1.3 Data Availability Note

All Tier-1 documents returned HTTP 404 on direct content lookup — typical 2-4 week EP API delay post-adoption. Analysis is based on document titles, feed metadata, and contextual intelligence. Full text expected to be available via EP API in approximately 2-4 weeks.

---

## 2. SOURCE PROVENANCE

| Source | Items | Quality |
|--------|-------|---------|
| `get_adopted_texts_feed` (year=2026 fallback) | 50 | 🟡 MEDIUM |
| `get_plenary_sessions` (April 2026) | Found April 28-30 sessions | 🟢 HIGH |
| EP Open Data Portal (direct lookups) | HTTP 404 for specific texts | 🔴 UNAVAILABLE |

---

## 3. PROCEDURE REFERENCES

Legislative procedures associated with adopted texts (from `get_procedures_feed`):
- DMA enforcement: Linked to existing DMA monitoring procedure (EP10 oversight)
- Ukraine accountability: Linked to Ukraine support legislative track (ongoing since 2022)
- Budget 2027: Linked to MFF 2021-2027 and preliminary MFF 2028-2034 discussions
- Armenia: Linked to Eastern Partnership monitoring procedure

*Source: European Parliament Open Data Portal | Document analysis methodology | 2026-05-08*

## 4. DOCUMENT ANALYSIS METHODOLOGY

**Source prioritization:**
1. EP adopted texts (TA-10-2026-XXXX) — highest authority, final decisions
2. EP committee reports — committee-stage intelligence
3. EP plenary session documents — procedural context
4. External documents (Commission proposals, Council positions) — context

**Analysis limitations:**
- Adopted text content unavailable via EP API (HTTP 404 for document bodies)
- Analysis limited to metadata: reference numbers, titles, dates, vote counts
- Full text available at EUR-Lex (eur-lex.europa.eu/legal-content/)

## 5. DOCUMENT PIPELINE STATUS

```mermaid
graph LR
    Feed["Adopted Texts Feed"] -->|FRESHNESS_FALLBACK| Meta["Metadata Available"]
    Meta -->|404 on content| NoBody["Body Unavailable"]
    EurLex["EUR-Lex"] -->|external| Body["Full Text Available"]
    NoBody -.->|manual lookup| Body
```

**Status:** 5 Tier-1 documents identified and analysed by metadata. Full-text analysis would require EUR-Lex lookups (outside MCP scope). Metadata-only analysis sufficient for breaking news significance assessment.

## 4. DOCUMENT INDEX UPDATE — RE-RUN (2026-05-08)

**New documents from re-run data extraction:**

| Document ID | Title (short) | Source | Date |
|------------|---------------|--------|------|
| TA-10-2026-04-30-ANN01 | EP Estimates 2027 | Adopted texts feed | 2026-04-30 |
| TA-10-2026-0142 | EU-Iceland PNR agreement | Adopted texts API | 2026-04-29 |
| TA-10-2026-0115 | Dogs and cats welfare | Adopted texts API | 2026-04-28 |
| TA-10-2026-0119 | EIB Group annual report 2024 | Adopted texts API | 2026-04-28 |

**Document coverage assessment:**
- Total adopted texts identified: 21 (from API, year=2026 extraction)
- Tier-1 texts (significance ≥7.5): 5
- Tier-2 texts (significance 6.0–7.4): 4 (EIB oversight, Iceland PNR, subcontracting chains, ECB Vice-President appointment)
- Background texts (significance <6.0): 12

**Note on EP estimates (ANN01):**
The EP Estimates document (TA-10-2026-04-30-ANN01) is classified as BUDGET_EP_DRAFT rather than TEXT_ADOPTED in the API, indicating it is the Parliament's own budget estimate submitted to the Council per Article 314 TFEU. Estimated amount: ~€2.4bn for EP institutional operations in 2027. This is distinct from the EU general budget guidelines (TA-10-2026-0112).

*Source: Document analysis index | EP Open Data | 2026-05-08 (re-run extended)*
