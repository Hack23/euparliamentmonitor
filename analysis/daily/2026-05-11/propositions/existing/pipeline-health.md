<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Pipeline Health — EU Parliament Legislative Propositions
**Date:** 2026-05-11 | **Run ID:** propositions-run251-1778480471

---

## 🏥 Pipeline Overview

| Component | Status | Notes |
|-----------|--------|-------|
| EP MCP Server | 🟡 PARTIAL | See mcp-reliability-audit.md |
| IMF API | 🔴 UNAVAILABLE | Key not configured |
| World Bank | 🟡 NOT CALLED | Not required for propositions primary analysis |
| Analysis artifact production | 🟡 IN PROGRESS | 11/16 artifacts complete at time of writing |
| Stage A (Data Collection) | ✅ COMPLETE | Degraded — see audit |
| Stage B Pass 1 | 🟡 IN PROGRESS | Near completion |
| Stage B Pass 2 | ⏳ PENDING | |
| Stage C (Gate) | ⏳ PENDING | |
| Stage D (Generate Article) | ⏳ PENDING | |
| Stage E (PR Creation) | ⏳ PENDING | |

---

## 🗂️ Data Mode

**`dataMode: "degraded-imf"`** — Stage C validation applies 0.85 floor reduction factor on all numeric quality thresholds.

---

## 📅 Time Budget Status

Workflow started at approximately 2026-05-11T06:21:31Z.
- Stage C exit tripwire: minute 36 elapsed
- Hard PR deadline: minute ≤ 45 elapsed

---

## ✅ Key Procedures Confirmed

- 2024/0311(COD) — Methamphetamine Interdiction Decision (MID): adopted
- 2023/0111(COD) — SRMR3: adopted
- 2023/0447(COD) — Dog & Cat Welfare Regulation: adopted
- 2025/0322(COD) — EU-Mercosur Safeguard: adopted

All four procedures confirmed complete. Analysis reflects post-adoption phase.
