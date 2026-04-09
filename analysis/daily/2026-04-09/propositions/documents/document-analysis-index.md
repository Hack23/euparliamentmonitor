---
method: document-analysis
date: 2026-04-09
confidence: medium
generated: 2026-04-09T05:53:47.643Z
source: pipeline
---

# Per-Document Intelligence Analysis Index

## Executive Summary

Full per-document political intelligence analysis for 15 unique documents
across 8 feed categories.  Each document has been individually
analyzed from fetched European Parliament data with comprehensive significance assessment,
SWOT analysis, and threat profiling.

- **Total Documents Analyzed**: 15
- **Feed Categories Scanned**: 8
- **Duplicates Deduplicated**: 0
- **Date**: 2026-04-09

## Document Analysis Index

| Document ID | Title | Category | Analysis File |
|-------------|-------|----------|---------------|
| eli/dl/doc/TA-10-2025-0185 | T10-0185/2025 | adoptedTexts | [adoptedtexts-eli-dl-doc-ta-10-2025-0185-analysis.md](adoptedtexts-eli-dl-doc-ta-10-2025-0185-analysis.md) |
| eli/dl/doc/TA-10-2025-0313 | T10-0313/2025 | adoptedTexts | [adoptedtexts-eli-dl-doc-ta-10-2025-0313-analysis.md](adoptedtexts-eli-dl-doc-ta-10-2025-0313-analysis.md) |
| eli/dl/doc/TA-10-2026-0016 | T10-0016/2026 | adoptedTexts | [adoptedtexts-eli-dl-doc-ta-10-2026-0016-analysis.md](adoptedtexts-eli-dl-doc-ta-10-2026-0016-analysis.md) |
| eli/dl/doc/TA-10-2026-0017 | T10-0017/2026 | adoptedTexts | [adoptedtexts-eli-dl-doc-ta-10-2026-0017-analysis.md](adoptedtexts-eli-dl-doc-ta-10-2026-0017-analysis.md) |
| eli/dl/doc/TA-10-2026-0018 | T10-0018/2026 | adoptedTexts | [adoptedtexts-eli-dl-doc-ta-10-2026-0018-analysis.md](adoptedtexts-eli-dl-doc-ta-10-2026-0018-analysis.md) |
| eli/dl/doc/TA-10-2026-0019 | T10-0019/2026 | adoptedTexts | [adoptedtexts-eli-dl-doc-ta-10-2026-0019-analysis.md](adoptedtexts-eli-dl-doc-ta-10-2026-0019-analysis.md) |
| eli/dl/doc/TA-10-2026-0020 | T10-0020/2026 | adoptedTexts | [adoptedtexts-eli-dl-doc-ta-10-2026-0020-analysis.md](adoptedtexts-eli-dl-doc-ta-10-2026-0020-analysis.md) |
| eli/dl/doc/TA-10-2026-0021 | T10-0021/2026 | adoptedTexts | [adoptedtexts-eli-dl-doc-ta-10-2026-0021-analysis.md](adoptedtexts-eli-dl-doc-ta-10-2026-0021-analysis.md) |
| eli/dl/doc/TA-10-2026-0022 | T10-0022/2026 | adoptedTexts | [adoptedtexts-eli-dl-doc-ta-10-2026-0022-analysis.md](adoptedtexts-eli-dl-doc-ta-10-2026-0022-analysis.md) |
| eli/dl/doc/TA-10-2026-0023 | T10-0023/2026 | adoptedTexts | [adoptedtexts-eli-dl-doc-ta-10-2026-0023-analysis.md](adoptedtexts-eli-dl-doc-ta-10-2026-0023-analysis.md) |
| eli/dl/doc/TA-10-2026-0024 | T10-0024/2026 | adoptedTexts | [adoptedtexts-eli-dl-doc-ta-10-2026-0024-analysis.md](adoptedtexts-eli-dl-doc-ta-10-2026-0024-analysis.md) |
| eli/dl/doc/TA-10-2026-0030 | T10-0030/2026 | adoptedTexts | [adoptedtexts-eli-dl-doc-ta-10-2026-0030-analysis.md](adoptedtexts-eli-dl-doc-ta-10-2026-0030-analysis.md) |
| eli/dl/doc/SP-2026-03-26-TA-10-2025-0185 | SP(2026)03-26 | externalDocuments | [externaldocuments-eli-dl-doc-sp-2026-03-26-ta-10-2025-0185-analysis.md](externaldocuments-eli-dl-doc-sp-2026-03-26-ta-10-2025-0185-analysis.md) |
| eli/dl/doc/SP-2026-03-26-TA-10-2025-0313 | SP(2026)03-26 | externalDocuments | [externaldocuments-eli-dl-doc-sp-2026-03-26-ta-10-2025-0313-analysis.md](externaldocuments-eli-dl-doc-sp-2026-03-26-ta-10-2025-0313-analysis.md) |
| eli/dl/doc/SP-2026-03-26-TA-10-2026-0030 | SP(2026)03-26 | externalDocuments | [externaldocuments-eli-dl-doc-sp-2026-03-26-ta-10-2026-0030-analysis.md](externaldocuments-eli-dl-doc-sp-2026-03-26-ta-10-2026-0030-analysis.md) |

## Category Breakdown

- **adoptedTexts**: 12 items (12 unique analyzed)
- **procedures**: 0 items (0 unique analyzed)
- **documents**: 0 items (0 unique analyzed)
- **plenaryDocuments**: 0 items (0 unique analyzed)
- **committeeDocuments**: 0 items (0 unique analyzed)
- **plenarySessionDocuments**: 0 items (0 unique analyzed)
- **externalDocuments**: 3 items (3 unique analyzed)
- **events**: 0 items (0 unique analyzed)

## Methodology

Each document receives:
1. **Raw Data Storage** — Full document JSON stored in `documents/raw-data/` for complete data preservation
2. **Significance Classification** — Political importance on 5-level scale
3. **SWOT Assessment** — Strengths, weaknesses, opportunities, threats specific to the document
4. **Threat Profiling** — Political threat landscape analysis for disruption potential
5. **Stakeholder Impact** — Projected effects on key stakeholder groups
6. **Intelligence Summary** — Key findings and actionable insights

## Document Storage

All 15 documents have been stored in their entirety:
- **Analysis files**: `documents/{category}-{id}-analysis.md`
- **Raw JSON data**: `documents/raw-data/{category}-{id}-raw.json`
- **Deduplication**: Documents appearing in multiple feed categories are stored once with primary category reference

## Date: 2026-04-09
