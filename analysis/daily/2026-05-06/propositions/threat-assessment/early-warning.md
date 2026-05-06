<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Early Warning System — EU Parliament Propositions
**Date:** 2026-05-06

---

## Early Warning Signal Registry

| Signal ID | Signal | Threshold | Urgency | Action Trigger |
|-----------|--------|-----------|:-------:|----------------|
| EW-01 | EPP adopts "technology neutrality" as formal position on CBAM | Official EPP press release | 🔴 CRITICAL | Activate MT-02 bilateral immediately |
| EW-02 | S&D Group formally registers CBAM red line | S&D Group statement | 🔴 CRITICAL | Activate MT-02; escalate to Group Chairs |
| EW-03 | ECR tables amendment removing CBAM carbon floor | EP amendment system | 🔴 CRITICAL | Activate MT-01 insurance coalition |
| EW-04 | EPP national delegation defection >15 MEPs on CBAM pre-vote | Committee vote | 🟡 HIGH | Activate MT-03 Eastern delegation briefings |
| EW-05 | EDIS Council working party stalls (no progress in 4 weeks) | Polish Presidency report | 🟡 HIGH | Activate MT-04 Nordic coalition |
| EW-06 | ECJ EDIS preliminary reference filed | ECJ Curia register | 🟡 HIGH | Commission legal service emergency response |
| EW-07 | AI Act scrutiny timer extension request | EP JURI/IMCO statement | 🟢 MEDIUM | Fast-track alternative scheduling |
| EW-08 | EP API outage extends >72 hours | EP Open Data Portal status | 🟢 MEDIUM | Activate alternative data collection protocols |

---

## Current Signal Status (2026-05-06)

⚠️ **MONITORING DEGRADED**: EP API is unavailable, limiting real-time signal detection capability.

| Signal | Current Status | Last Check | Confidence |
|--------|:-------------:|:----------:|:----------:|
| EW-01 (EPP position) | 🟢 No signal | Structural knowledge | 🟡 MEDIUM |
| EW-02 (S&D red line) | 🟢 No signal | Structural knowledge | 🟡 MEDIUM |
| EW-03 (ECR CBAM amendment) | 🟡 Suspected forming | Structural analysis | 🟡 MEDIUM |
| EW-04 (EPP defection) | 🟢 No evidence | Structural | 🟡 LOW |
| EW-05 (EDIS stall) | 🟢 No signal | Structural | 🟡 LOW |
| EW-06 (ECJ reference) | 🟢 No signal | Public knowledge | 🟢 HIGH |
| EW-07 (AI Act extension) | 🟢 No signal | Structural | 🟡 MEDIUM |
| EW-08 (EP API) | 🔴 ACTIVE — EP API down | This run | 🟢 HIGH |

---

## Monitoring Cadence Recommendations

| Priority | Signal Group | Check Frequency | Data Source |
|----------|-------------|:--------------:|-------------|
| Daily | EW-01, EW-02, EW-03 (CBAM political) | Daily | EP API + press monitoring |
| Per-plenary | EW-04 (EPP defection) | Per plenary week | DOCEO XML roll-call |
| Weekly | EW-05, EW-06 (EDIS) | Weekly | Council register + ECJ Curia |
| Per-run | EW-08 (EP API health) | Every run | get_server_health |

---

## Escalation Protocol

```
Signal Detected (CRITICAL/HIGH)
  → Log to intelligence/workflow-audit.md
    → Alert in executive-brief.md forward monitors section
      → Include in article "Watch" section
        → Tag in PR body for reviewer attention
```

**Current active EW**: EW-08 (EP API outage) — logged in mcp-reliability-audit.md and executive-brief.md.
