# Translation Analysis Summary — 2026-04-09

## Run Outcome

- **Date**: 2026-04-09
- **Run timestamp**: 2026-04-09T12:18Z
- **English articles found**: 2 (committee-reports, propositions)
- **Articles needing translation**: 1 (committee-reports)
- **Articles already translated**: 1 (propositions — 13/13 languages)
- **Translations produced**: 0
- **Result**: committee-reports translation blocked by EP data gap

## 1. Translation Coverage Matrix

| Article Type | EN (source) | Translation Status | Languages |
|---|---|---|---|
| committee-reports | ✅ 28.7KB | ❌ Blocked — data gap | 0/13 |
| propositions | ✅ exists | ✅ Complete (prior run) | 13/13 |

### Coverage by Language (committee-reports)

| Language | Status | Reason |
|---|---|---|
| sv, da, no, fi | ❌ Not generated | Generator shouldSkip=true |
| de, fr, es, nl | ❌ Not generated | Generator shouldSkip=true |
| ar, he | ❌ Not generated | Generator shouldSkip=true |
| ja, ko, zh | ❌ Not generated | Generator shouldSkip=true |

## 2. Terminology Consistency

No new translations produced — no terminology to evaluate.

Previous run (2026-04-09 09:27Z) completed propositions translations with Grade C (75-78).
CJK keyword localization flagged in prior runs for ko/zh.

## 3. Quality Assessment

N/A — no translation files generated in this run.

## 4. Root Cause Analysis — Committee Reports Data Gap

### MCP Gateway Connection
- **Status**: ✅ Successfully connected via HTTP gateway
- **URL**: host.docker.internal:80/mcp/european-parliament

### Committee Data Retrieved (all 5 featured committees)
| Committee | Name | Members | Chair | Documents |
|---|---|---|---|---|
| ENVI | Committee on the Environment, Climate and Food Safety | 0 | N/A | 0 |
| ECON | Committee on Economic and Monetary Affairs | 0 | N/A | 0 |
| AFET | Committee on Foreign Affairs | 0 | N/A | 0 |
| LIBE | Committee on Civil Liberties, Justice and Home Affairs | 0 | N/A | 0 |
| AGRI | Committee on Agriculture and Rural Development | 0 | N/A | 0 |

### Feed Data Filtering Results
| Feed Endpoint | Raw Items | Filtered (30-day window) |
|---|---|---|
| Adopted texts | 216 | 0 |
| MEP updates | 737 | 0 |
| External documents | 33 | 0 |
| Declarations | 496 | 0 |
| Committee documents | timeout | 0 |
| Other feeds | various | 0 |

### Why shouldSkip Returns True
The `isPlaceholderCommitteeData()` check in `src/generators/strategies/committee-reports-strategy.ts:576` returns `true` because:
1. All 5 committees have `chair === 'N/A'` and `members === 0` and `documents.length === 0`
2. Feed data filters to 0 items within the 2026-03-10..2026-04-09 rolling window
3. Without feed items to override, the placeholder detection triggers skip

### EP v2 API Direct Fallback
The generator attempted direct EP API calls as fallback, which failed with `fetch failed` — the sandbox network firewall blocks outbound connections to europarl.europa.eu.

## 5. Coverage Gap Analysis

- **committee-reports**: Blocked by empty committee member data from EP MCP server and 0 feed items after date-range filtering
- **Recurring issue**: This is the same gap documented in the 2026-04-09 09:27Z run ("Committee-reports skipped (MCP data gap)")

## 6. Improvement Recommendations

### Short-term
- Investigate why adopted texts (216 items) all filter to 0 within the 30-day window — possible date format mismatch in the rolling date range filter
- Consider relaxing `shouldSkip` to allow generation when English source already exists and only translations are needed

### Longer-term
- Add a "translate-only" mode to the generator that reads existing English HTML and produces translations without requiring fresh MCP data
- Populate committee member data in the EP MCP server (currently returns 0 members for all committees)
- Cache previous successful MCP data fetches to use when live data is unavailable

---
_Analysis produced per ai-driven-analysis-guide.md Rule 5 — no workflow run wasted._
