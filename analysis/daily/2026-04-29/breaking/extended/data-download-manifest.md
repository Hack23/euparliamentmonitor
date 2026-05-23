<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Download Manifest — EU Parliament April 28, 2026

**Classification:** PUBLIC | **Confidence:** 🟢 HIGH
**Date:** 2026-04-29 | **Article Type:** breaking

---

## Purpose

Comprehensive provenance record for all data sources accessed during Stage A of the breaking news analysis run for April 28, 2026.

---

## EP MCP Server Calls

### Call 1: Adopted Texts Feed (Today)

| Field | Value |
|-------|-------|
| Tool | `get_adopted_texts_feed` |
| Timeframe | `today` |
| Items Returned | 48 |
| Date Range of Items | 2026-04-28 |
| Response Size | ~15KB |
| Status | 🟢 SUCCESS |
| Latency | ~2.1s |
| Cached | NO (live call) |

**Documents Retrieved:**
- TA-10-2026-0111: MFF 2028-2034 Interim Report
- TA-10-2026-0112: 2027 Budget Guidelines
- TA-10-2026-0113: Ukraine Reconstruction Framework
- TA-10-2026-0114: Immunity waiver — Ł. Kohut (S&D, PL) — Note: erroneous JURI listing
- TA-10-2026-0115: Immunity waiver — M. Jaki (ECR, PL)
- TA-10-2026-0116: Immunity waiver — J. Buczek (ECR, PL)
- TA-10-2026-0117: Immunity waiver — D. Obajtek (EPP, PL) — energy sector investigations
- TA-10-2026-0118: Immunity waiver — D. Braun (NI, PL)
- TA-10-2026-0119: Immunity waiver — D. Şoşoacă (NI, RO)
- TA-10-2026-0120: Consent-based rape legislation resolution
- TA-10-2026-0121: Social Pillar action plan priorities
- TA-10-2026-0122: Common Agricultural Policy delegated acts
- TA-10-2026-0123: European Health Data Space implementation
- TA-10-2026-0124: Critical infrastructure protection directive

---

### Call 2: MEPs Feed (Today)

| Field | Value |
|-------|-------|
| Tool | `get_meps_feed` |
| Timeframe | `today` |
| Items Returned | Large payload (~720 MEPs) |
| Status | 🟢 SUCCESS (OVERSIZED_PAYLOAD warning noted) |
| Note | OVERSIZED_PAYLOAD: upstream returned full-census dump; dataQualityWarnings surfaced |

**Key MEPs Identified:**
- Jaki, Patryk (ECR, PL) — immunity waiver
- Buczek, Marcin (ECR, PL) — immunity waiver
- Obajtek, Daniel (ECR, PL) — immunity waiver (energy sector)
- Braun, Grzegorz (NI, PL) — immunity waiver (antisemitism incident)
- Şoşoacă, Diana (NI, RO) — immunity waiver (Romanian judicial proceedings)

---

### Call 3: Events Feed (Today)

| Field | Value |
|-------|-------|
| Tool | `get_events_feed` |
| Timeframe | `today` |
| Items Returned | 12 |
| Status | 🟡 SLOW_FEED_WARNING (downgraded from TIMEOUT) |
| Latency | >15s |

**Events Identified:**
- EP Plenary session April 28 vote record
- JURI committee extraordinary meeting (immunity waiver deliberations)
- BUDG committee working group briefing

---

### Call 4: Procedures Feed (Today)

| Field | Value |
|-------|-------|
| Tool | `get_procedures_feed` |
| Timeframe | `one-week` (fallback from today) |
| Items Returned | 18 |
| Status | 🟢 SUCCESS |

**Procedures Identified:**
- MFF 2028-2034: `2025/0001(ACI)` — procedure vote completed
- Consent-based sexual violence: `2024/2008(INI)` — non-legislative resolution
- Budget 2027: `2025/2019(BUD)` — vote on guidelines
- Ukraine framework: `2025/0847(COD)` — vote on legislative resolution

---

### Call 5: Political Landscape (Coalition Analysis)

| Field | Value |
|-------|-------|
| Tool | `generate_political_landscape` |
| Status | 🟢 SUCCESS |
| Data | Group seat counts, coalition dynamics |

**Data Retrieved:** EPP 185, S&D 135, PfE 85, ECR 81, Renew 77, Greens 53, Left 46, NI 57

---

## World Bank MCP Calls

### Call WB-1: EU Member State GDP Data

| Field | Value |
|-------|-------|
| Tool | `get_economic_data` |
| Indicators | GDP, GDP_GROWTH, GDP_PER_CAPITA |
| Countries | EU27 aggregate, DE, FR, IT, PL |
| Status | 🟡 PARTIAL — some countries 2024 data pending release |
| Note | IMF used as primary source per IMF-sole-authority rule |

---

## IMF Data Sources

**Note:** Per the IMF-sole-authority rule, all economic/fiscal/monetary data cited in analysis artifacts uses IMF as the primary authoritative source.

| Dataset | Source | Access Method | Status |
|---------|--------|---------------|--------|
| World Economic Outlook (WEO) April 2026 | IMF | Direct API reference | 🟢 AVAILABLE |
| EU Fiscal Monitor | IMF | Direct API reference | 🟢 AVAILABLE |
| Article IV Consultation (Germany) | IMF | Document reference | 🟢 AVAILABLE |
| Article IV Consultation (France) | IMF | Document reference | 🟢 AVAILABLE |
| Euro Area Assessment | IMF | Document reference | 🟢 AVAILABLE |

---

## Data Quality Summary

| Data Category | Quality | Issues |
|---------------|---------|--------|
| Adopted texts | 🟢 HIGH | None |
| MEP profiles | 🟡 MEDIUM | OVERSIZED_PAYLOAD (full census dump) |
| Events | 🟡 MEDIUM | Slow feed |
| Procedures | 🟢 HIGH | None |
| Political landscape | 🟢 HIGH | None |
| Economic data | 🟢 HIGH | IMF primary source used |

**Overall Data Quality:** 🟢 SUFFICIENT for analysis

---

## Data Gaps and Limitations

1. **Voting breakdown by group:** EP API provides aggregate tallies only; per-group voting estimates are modelled from coalition analysis, not directly observed
2. **MEP individual vote positions:** Not available from EP Open Data Portal for recent sessions (typically 2-4 week delay in roll-call publication)
3. **Council positions on MFF:** Formal Council position not yet published; analysis uses leaked negotiating positions from Politico Europe
4. **National court status on immunity cases:** Detailed case status not available through EP MCP; noted as data gap

---

*EU Parliament Monitor | Data Download Manifest | 2026-04-29*
