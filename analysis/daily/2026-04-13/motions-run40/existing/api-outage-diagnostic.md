---
method: api-outage-diagnostic
date: 2026-04-13
articleType: motions
confidence: high
generated: 2026-04-13T21:19:00Z
runId: 40
---

# EP API Outage Diagnostic — Motions Run 40 (2026-04-13)

## Diagnostic Summary

| Field | Value |
|-------|-------|
| **Run ID** | 40 |
| **Timestamp** | 2026-04-13T21:19:00Z |
| **Article Type** | motions |
| **EP API Status** | UNREACHABLE (HTTP 000 — TCP connection timeout) |
| **MCP Server** | v1.2.6 — unhealthy, 0/13 feeds operational |
| **Precomputed Stats** | Available (85 KB, 23 years 2004-2026) |
| **Prior Run Today** | Run 39 (analysis-only PR, same EP API outage) |

## Health Gate Attempts (3/3 Failed)

| Attempt | Tool | Parameters | Result | Timestamp |
|:-------:|------|-----------|--------|-----------|
| 1 | get_plenary_sessions | limit: 1, year: 2026 | TIMEOUT (90s) | 21:09:30Z |
| 2 | get_plenary_sessions | limit: 1 | TIMEOUT (90s) | 21:11:08Z |
| 3 | get_plenary_sessions | dateFrom, dateTo, limit: 1, year: 2026 | TIMEOUT (90s) | 21:12:42Z |

## Feed Endpoint Failures (4/4 Timed Out)

| Feed | Timeframe | Status | Timestamp |
|------|-----------|--------|-----------|
| get_adopted_texts_feed | one-week | TIMEOUT (90s) | 21:14:18Z |
| get_parliamentary_questions_feed | one-week | TIMEOUT (90s) | 21:14:18Z |
| get_procedures_feed | one-week | TIMEOUT (90s) | 21:14:18Z |
| get_meps_feed | one-week | TIMEOUT (90s) | 21:14:18Z |

## Supplementary Tool Failures (3 timeout + 1 null data)

| Tool | Result | Error Category | Detail |
|------|--------|---------------|--------|
| detect_voting_anomalies | UPSTREAM_TIMEOUT | TIMEOUT | MEP endpoint timed out after 90s |
| generate_political_landscape | TIMEOUT | TIMEOUT | 90s timeout |
| get_adopted_texts (year=2026) | TIMEOUT | TIMEOUT | 90s timeout |
| analyze_coalition_dynamics | NULL_DATA | PARTIAL | Returned structure but all metrics null — MEP pagination failed at offset 0 |

## Network Diagnostic

| Check | Result |
|-------|--------|
| DNS Resolution | data.europarl.europa.eu resolves to 34.251.207.80 |
| Direct HTTP (curl, 30s timeout) | HTTP 000 — TCP connection timeout |
| github.com HTTPS | Reachable |
| api.github.com HTTPS | Reachable |
| AWF Firewall | Not blocking — DNS resolution succeeds |

## Root Cause Analysis

**Primary cause**: European Parliament API (data.europarl.europa.eu) is experiencing a sustained multi-hour outage. DNS resolves correctly to 34.251.207.80, indicating the hostname is valid and AWF firewall is not interfering with DNS. However, TCP connections to port 443 time out after the configured timeout (30-90 seconds), indicating the EP API server is either down or not accepting connections.

**Pattern**: This outage has persisted since at least April 11, with intermittent partial recovery windows. Run 168 (breaking, earlier today at ~18:44Z) successfully retrieved 51 adopted texts and 737 MEP records, indicating the API is intermittently responsive. The current outage at 21:19Z may represent an evening maintenance window or load-related degradation.

**Context**:
- Easter recess Day 18 of 18 (final day)
- Parliament officially resumes April 14 (Monday)
- 12th+ consecutive degraded/failed run across news workflows since April 11
- Run 39 (motions, earlier today at ~18:10Z) experienced identical outage

## Server Health Summary

Server version 1.2.6, status unhealthy, uptime 94 seconds.
Availability: 0/13 feeds operational, level Unavailable.

## What Worked

| Component | Status |
|-----------|--------|
| Precomputed stats (get_all_generated_stats) | 85 KB — full 2004-2026 data |
| analyze_coalition_dynamics (partial) | Returned structure, all metrics null |
| Cross-session intelligence | 5 prior analysis runs available |
| MCP server startup | Server responds (v1.2.6) |

## Recovery Outlook

| Scenario | Probability | Timeframe |
|----------|:-----------:|-----------|
| API restores for April 14 return | 70% | 8-12 hours |
| API remains intermittent through April 14 | 20% | 12-24 hours |
| Extended outage into April 15+ | 10% | 24-48 hours |

**Recommendation**: Schedule next motions workflow run for April 14 morning (06:00-08:00 UTC) to capture post-recess restart data. Parliament sitting at 17:00 CET (15:00 UTC) — schedule second run for 19:00 UTC to capture first day proceedings.
