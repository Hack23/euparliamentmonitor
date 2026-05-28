<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📑 Document Analysis Index — EP Motions May 2026
**Date:** 2026-05-28 | **Article Type:** motions | **Framework:** Document Intelligence

---

## 🎯 Index Purpose

This index catalogues all documents collected and processed during the Stage A data collection phase. It provides a structured audit trail of data provenance for this motions run.

---

## 📋 Documents Inventory

### Primary Data Sources

| Source | Type | Items | Status | Notes |
|--------|------|-------|--------|-------|
| EP Adopted Texts API (year=2026) | JSON/API | 51 items | ✅ Complete | Primary source |
| meps-feed.json (pre-fetched) | JSON | ~720 MEPs | ✅ Complete | Pre-fetched cache |
| adopted-texts-feed.json (pre-fetched) | JSON | 500 IDs | ⚠️ IDs only | No metadata |
| procedures-feed.json (pre-fetched) | JSON | 0 items | ❌ 404 error | Unavailable |
| documents-feed.json (pre-fetched) | JSON | 0 items | ❌ Empty | Unavailable |

### API Call Log

| Call | Tool | Parameters | Result | Items |
|------|------|-----------|--------|-------|
| A1 | get_adopted_texts | year=2026, limit=50 | ✅ | 51 texts |
| A2 | get_voting_records | May 21–28 2026 | ❌ | 0 (DOCEO lag) |
| A3 | get_plenary_sessions | May 21–28 2026 | ⚠️ | 0 (inter-sessional) |
| A4 | get_latest_votes | limit=30 | ❌ | 0 (DOCEO lag) |

**Total API calls:** 4/5 (within Stage A budget)

---

## 📊 Key Documents Processed

### Group A: Immunity Waiver Documents

| Document ID | Title | Date | Processing |
|-------------|-------|------|-----------|
| TA-10-2026-0164 | Vilimsky immunity waiver | 2026-05-19 | ✅ Full analysis |
| TA-10-2026-0166 | Pappas immunity waiver | 2026-05-19 | ✅ Full analysis |

**Document type:** PRIV decisions. Both decisions processed in significance-classification.md, actor-mapping.md, synthesis-summary.md.

### Group B: External Relations

| Document ID | Title | Date | Processing |
|-------------|-------|------|-----------|
| TA-10-2026-0174 | EU-Uzbekistan EPCA | 2026-05-20 | ✅ Full analysis |
| TA-10-2026-0177 | EU-Lebanon Eurojust | 2026-05-20 | ✅ Standard analysis |
| TA-10-2026-0182 | UNGA 81 recommendation | 2026-05-20 | ✅ Standard analysis |

### Group C: Defence/Trade

| Document ID | Title | Date | Processing |
|-------------|-------|------|-----------|
| TA-10-2026-0180 | SAFE-Canada Instrument | 2026-05-20 | ✅ Full analysis |
| TA-10-2026-0183 | AI trade strategy | 2026-05-20 | ✅ Full analysis |

### Group D: Fisheries/Environment

| Document ID | Title | Date | Processing |
|-------------|-------|------|-----------|
| TA-10-2026-0168 | Forest materials regulation | 2026-05-19 | ✅ Standard analysis |
| TA-10-2026-0178 | São Tomé fisheries | 2026-05-20 | ✅ Standard analysis |
| TA-10-2026-0179 | Cook Islands fisheries | 2026-05-20 | ✅ Standard analysis |

---

## 🗄️ Saved Artifacts

| File | Location | Size Estimate | Purpose |
|------|----------|--------------|---------|
| adopted-texts-2026.json | data/ | ~50KB | Primary data JSON |
| manifest.json | root | ~5KB | Run manifest |
| runs/thresholds-cache.json | runs/ | ~3KB | Size thresholds |

---

*Document index generated manually from API call logs. All documents are publicly available via EP Open Data Portal.*
