# Data Availability Assessment
**Date**: 2026-05-17 | **Article Type**: breaking | **Data Mode**: degraded-feeds

## Summary
Multiple EP API endpoints returned 404 errors during the pre-fetch phase (01:28 UTC) and Stage A MCP calls. The adopted texts feed and MEPs feed were operational; all other feeds failed.

## Feed Status

| Feed | Status | Items Available | Notes |
|------|--------|-----------------|-------|
| adopted-texts-feed | ✅ OK | 500 items (131 via feed, 120 from 2026) | Primary data source |
| adopted-texts (direct, year=2026) | ✅ OK | 21 items with titles | Supplement to feed |
| meps-feed | ✅ OK (partial) | 608 MEP records | IDs and basic metadata only; no names/groups |
| events-feed | ❌ ERROR 404 | 0 | EP API endpoint unavailable |
| procedures-feed | ⚠️ DEGRADED | 50 items (degraded-fallback) | Historical procedures, no recent activity dates |
| committee-documents-feed | ❌ ERROR 404 | 0 | EP API endpoint unavailable |
| documents-feed | ❌ ERROR 404 | 0 | EP API endpoint unavailable |
| latest-votes (DOCEO XML) | ⚠️ NO DATA | 0 | No plenary votes this week (May 11–14 dates unavailable) |
| parliamentary-questions-feed | ❌ ERROR | 0 | EP API error-in-body response |

## Data Mode Determination
**Selected mode**: `degraded-feeds`

Rationale: Multiple feeds (events, committee docs, documents, parliamentary questions) returned hard 404 errors. The procedures feed fell back to a degraded mode returning historical procedures without recent activity data. This meets the `degraded-feeds` criterion ("1+ feeds unavailable after 3 retries"). The degraded floor factor of **0.80** applies to all per-artifact line minimums.

## Impact on Analysis
1. Voting record analysis is unavailable for this plenary period (voting-patterns.degraded.md produced instead of voting-patterns.md)
2. Committee deliberation detail unavailable; procedural context inferred from adopted text titles only
3. Parliamentary debate transcripts unavailable
4. MEP attribution for resolutions unavailable at individual level

## Mitigation
- Adopted text titles provide sufficient basis for significance scoring and policy analysis
- IMF World Economic Outlook (April 2026) data provides independent economic context
- Historical EP political group data (EPP 188, S&D 136, Patriots 84, ECR 78, Renew 77, Greens/EFA 53, Left 46, ESN 25, non-attached 27) enables coalition analysis
- EP public record for the 10th term provides institutional context for all resolutions adopted
