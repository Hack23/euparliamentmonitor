---
method: api-outage-diagnostic
date: 2026-04-13
articleType: motions
confidence: high
generated: 2026-04-13T18:10:00Z
runId: 39
---

# 🔴 EP API Outage Diagnostic — Motions Run 39 (2026-04-13)

## 📋 Diagnostic Summary

| Field | Value |
|-------|-------|
| **Run ID** | 39 |
| **Timestamp** | 2026-04-13T18:10:00Z |
| **Article Type** | motions |
| **EP API Status** | 🔴 UNREACHABLE (HTTP 000 — connection timeout) |
| **MCP Server** | v1.2.5 — unhealthy, all 13 feeds UNKNOWN |
| **Node.js** | v20.20.2 (runner) — incompatible with EP MCP binary (requires v25) |
| **Precomputed Stats** | ✅ Available (61 KB, 23 years 2004-2026) |

## 🔍 Health Gate Attempts (3/3 Failed)

| Attempt | Tool | Result | Timestamp |
|:-------:|------|--------|-----------|
| 1 | `get_plenary_sessions(limit: 1)` | TIMEOUT (90s) | 17:58:04Z |
| 2 | `get_plenary_sessions(limit: 1, year: 2026)` | TIMEOUT (90s) | 18:00:15Z |
| 3 | `get_plenary_sessions(dateFrom, dateTo, limit: 1)` | TIMEOUT (90s) | 18:02:25Z |

## 📡 Feed Endpoint Failures (6/6 Timed Out)

| Feed | Status | Timestamp |
|------|--------|-----------|
| `get_adopted_texts_feed` (one-week) | TIMEOUT | 18:04:05Z |
| `get_parliamentary_questions_feed` (one-week) | TIMEOUT | 18:05:45Z |
| `get_procedures_feed` (one-week) | TIMEOUT | 18:05:45Z |
| `get_voting_records` (Mar 20 to Apr 13) | TIMEOUT | 18:05:45Z |
| `detect_voting_anomalies` | UPSTREAM_TIMEOUT | 18:07:31Z |
| `generate_political_landscape` | TIMEOUT | 18:07:31Z |

## 🌐 Network Diagnostic

| Check | Result |
|-------|--------|
| DNS Resolution | ✅ data.europarl.europa.eu resolves to 34.251.207.80 |
| Direct HTTPS (curl, 90s timeout) | ❌ HTTP 000 — connection timeout |
| EP API Direct v2 GET | ❌ No response within 90s |
| github.com | ✅ Reachable |

## 🔬 Root Cause Analysis

**Primary cause**: The European Parliament API (data.europarl.europa.eu) is experiencing a sustained outage. DNS resolves correctly to 34.251.207.80, but HTTPS connections time out after 90 seconds. This is NOT an AWF firewall issue — DNS resolution succeeds, and the timeout pattern indicates the EP API server is not responding to TCP connections.

**Contributing factor**: The runner Node.js v20.20.2 is incompatible with the EP MCP server binary (which requires Node.js v25). The MCP server crashes on startup with undici markAsUncloneable error. Even if the EP API were responding, the MCP server would not function in stdio mode on this runner.

**Context**: Easter recess Day 18 of 18 (final day). Parliament resumes April 14. This is the 12th+ consecutive degraded/failed run across all news workflows since April 11. Prior successful runs (committee-reports run 47 on April 13) used a direct curl workaround when the EP API was briefly responsive.

## ✅ What Worked

| Component | Status |
|-----------|--------|
| `get_all_generated_stats` | ✅ 61 KB precomputed stats (2004-2026) |
| `get_server_health` | ✅ Returns diagnostic (unhealthy, 0/13 feeds) |
| `analyze_coalition_dynamics` | Partial — structure returned but all data UNAVAILABLE |
| Prior analysis cross-reference | ✅ Propositions run 41, Motions Apr 10 synthesis available |

## 📊 Precomputed Stats Summary (2026 Q1)

From `get_all_generated_stats`:
- **Plenary sessions**: 54 (calendar year, 10 sittings completed Jan-Feb)
- **Legislative acts adopted**: 114 (projected, +46.2% vs 2025)
- **Roll-call votes**: 567 (projected)
- **Resolutions**: 180 (projected)
- **Adopted texts**: 104 (actual Q1)
- **Parliamentary questions**: 6,147 (projected, +24.4% vs 2025)
- **Fragmentation index**: 6.59 (8 groups + NI)
- **Right bloc**: 52.3% | **Left bloc**: 32.6% | **Centre**: 10.6%

## 🔮 Resolution Hints

1. **EP API outage**: Monitor data.europarl.europa.eu — likely maintenance or infrastructure issue coinciding with Easter recess end
2. **Node.js v20**: Workflow runner needs Node.js v25 for EP MCP server stdio mode. Gateway mode works when EP API is responsive.
3. **Next retry**: Suggest running again April 14 when Parliament resumes and EP API infrastructure may be restored
