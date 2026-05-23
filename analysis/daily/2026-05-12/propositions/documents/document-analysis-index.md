<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Document Analysis Index — EU Parliament Propositions
**Date:** 2026-05-12 | **Run ID:** propositions-run270-1778566185

---

## Primary Legislative Documents Analysed

### 1. Anti-Corruption Directive — `2023/0135(COD)`
**OJ Publication:** 2026-05-11
**Document type:** Directive (binding; requires transposition by all MS)
**Legal basis:** TFEU Art. 83(1) — "particularly serious crime with a cross-border dimension"
**Key provisions analysed:**
- 8 harmonised criminal offences (active/passive corruption, trading in influence, abuse of functions, obstruction of justice, misappropriation, money laundering, incitement/aiding)
- Corporate liability: minimum 15% global annual turnover
- Transposition deadline: 2 years from entry into force (approximately June 2028)
- Relation to EPPO Regulation: definitional harmonisation expands EPPO practical scope
**Source:** EP track_legislation API result for 2023/0135(COD) — OJ published confirmed

### 2. SRMR3 — `2023/0111(COD)`
**OJ Publication:** 2026-04-20
**Document type:** Regulation (directly applicable; no transposition required)
**Legal basis:** TFEU Art. 114 (internal market) + Art. 127 (monetary policy — ECB coordination)
**Key provisions analysed:**
- Amended early intervention triggers (ECB → SRB handoff clarified)
- Expanded SRF deployment conditions
- Bail-in hierarchy revision (senior preferred debt treatment)
- Scope extension to midsize banks (€10bn+)
**Source:** EP track_legislation API result for 2023/0111(COD) — OJ published confirmed

### 3. Companion Animal Welfare Regulation — `2023/0447(COD)`
**Adopted:** 2026-04-28
**Document type:** Regulation (directly applicable)
**Legal basis:** TFEU Art. 43(2) (agriculture/fisheries) + Art. 114 (internal market)
**Key provisions analysed:**
- Mandatory microchipping and EU-harmonised traceability database
- Breed-specific welfare requirements (brachycephalic restrictions)
- Online sale transparency requirements
- 12 trilogue rounds; broad coalition support
**Source:** EP track_legislation API result for 2023/0447(COD) — adopted plenary confirmed

### 4. DMA Enforcement Resolution — `2026/2596(RSP)`
**Adopted:** 2026-04-30
**Document type:** Non-binding resolution (RSP = resolution pursuant to political group request)
**Key provisions analysed:**
- Calls on Commission to accelerate gatekeeper enforcement under DMA
- Identifies Apple, Google, Meta, Amazon as priority targets
- Requests Commission report on enforcement timeline by Q3 2026
- EPP+S&D+Renew+Greens coalition signal
**Source:** EP get_adopted_texts API result

### 5. Budget 2027 Guidelines — `2025/2246`
**Adopted:** 2026-04-28
**Document type:** Resolution (EP opening position for budget negotiations)
**Key provisions analysed:**
- EP's spending priorities for EU Budget 2027
- Defence (EDIP) spending increase request
- Cohesion fund protection
- Digital and climate transition priorities
- MFF 2021–2027 transition provisions
**Source:** EP get_adopted_texts API result

---

## External Documents Analysed

### Council ACT_FOLLOWUP Batch — SP-2026-05-05
**Document count:** 12
**Document type:** Council follow-up letters to EP adopted positions
**Coverage period:** April 2026 EP plenary positions
**Key documents identified (from metadata):**
- Financial stability follow-up (likely SRMR3-related)
- Middle East crisis response follow-up
- EU institutional reform follow-up
- Democracy protection follow-up
- Trade measures follow-up
**Limitation:** Full document text not available from external documents feed (metadata only)
**Source:** EP get_external_documents_feed API result

---

## IMF Documents Analysed

### IMF WEO September 2025 SDMX Data
**Document type:** Machine-readable economic data (SDMX 3.0)
**Dataflow:** `IMF.RES/WEO` v9.0.0
**Indicators retrieved:**
- `GGXCNL_NGDP`: General Government Net Lending/Borrowing (% of GDP)
- `NGDP_RPCH`: Real GDP Growth (%)
- `PCPIPCH`: CPI Inflation (%)
**Countries:** DEU (Germany), FRA (France), ITA (Italy)
**Time periods:** 2024, 2025F, 2026F (annual)
**Records:** 449 total (all available from SDMX endpoint)
**Source:** IMF SDMX API via fetch-proxy (live retrieval confirmed)

---

## Documents Not Available (Data Gaps)

| Document Type | Attempted | Status | Reason |
|---------------|:---------:|:------:|--------|
| Committee working documents (LIBE, ECON, AGRI) | ✅ | ❌ UNAVAILABLE | get_committee_documents_feed API error |
| EP Roll-call vote records (April 2026) | ✅ | ⚠️ EMPTY | EP DOCEO publication delay (4–6 weeks) |
| Full text of Council follow-up letters | ✅ | ⚠️ METADATA ONLY | Feed returns metadata; full text requires individual document retrieval |
| Current procedures (filed last 7 days) | ✅ | ⚠️ HISTORICAL | get_procedures_feed returns 1972+ records; current filtering not working |
| EP legislative pipeline monitor | ✅ | ⚠️ EMPTY | monitor_legislative_pipeline returned no results |
| IMF April 2026 WEO update | ✅ | ⚠️ NOT RETRIEVED | September 2025 vintage is latest available via SDMX 3.0 endpoint |

---

## Document Quality Rating

| Document Set | Completeness | Timeliness | Reliability |
|--------------|:---:|:---:|:---:|
| Core EP legislative texts | 🟢 HIGH | 🟢 HIGH | 🟢 HIGH |
| Council follow-up batch | 🟡 MEDIUM (metadata only) | 🟢 HIGH | 🟡 MEDIUM |
| IMF WEO economic data | 🟢 HIGH | 🟡 MEDIUM (7.5 months old) | 🟢 HIGH |
| Political landscape/coalition | 🟢 HIGH | 🟢 HIGH | 🟡 MEDIUM (no vote data) |
| Committee documents | 🔴 UNAVAILABLE | — | — |

*Document index compiled from EP Open Data Portal API retrievals and IMF SDMX. Run: propositions-run270-1778566185.*
