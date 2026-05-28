<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🔁 Cross-Run Diff — EU Parliament Breaking News
**Date:** 2026-05-28 | **Article Type:** Breaking | **Run ID:** breaking-run264-1779957632

---

## 📋 Cross-Run Diff Status

**This is the FIRST run for 2026-05-28/breaking.** No prior run exists for today's date and article type.

### Prior Run History
- `manifest.json` did not exist at workflow start
- `runs/prior-run-diff.json` not applicable (first run)
- No `history[]` entries to diff against

### Re-run Rule Compliance
- No `carryForward[]` entries (no prior artifacts)
- No `rewrite[]` entries (no prior artifacts)
- Stage B Pass 2 applied as standard deepening pass, not as re-run extend pass
- `manifest.pass2.rewriteCount === 0` is valid for a first run (re-run rule does NOT apply)

---

## 📊 Baseline Established This Run

This run establishes the **2026-05-28/breaking** baseline:

| Metric | Value |
|--------|-------|
| Total artifacts | ~30 (see manifest.json) |
| Total lines | 3000+ |
| Data sources used | 4 MCP calls (adopted texts primary) |
| Data mode | degraded-feeds (0.80 factor) |
| Primary story | EU-Canada SAFE + AI/Trade (May 20, 2026 plenary) |
| Gate result | TBD at Stage C |

---

## 🔮 Expected Changes in Future Same-Day Re-Runs

If this workflow is re-triggered today (2026-05-28), the re-run improve/extend rule activates:

1. All `carryForward[]` artifacts must be extended to `extendFloor = max(thresholdFloor, priorLines + 20)`
2. `mcp-reliability-audit.md` would be a likely rewrite target if its line count is below floor
3. Any artifacts added between runs would be new entries with no prior baseline

---

## ✅ Cross-Run Diff Quality

- **Applicability:** N/A (first run today)
- **Confidence:** 🟢 HIGH (confirmed no prior manifest)
- **Rule compliance:** ✅ Re-run rule correctly not applied to first run

---

## 📊 First Run Baseline

```mermaid
graph LR
    A[First Run Today] --> B[Establishes Baseline]
    B --> C[No Prior Artifacts to Diff]
    C --> D[Re-run Rule N/A]
```
