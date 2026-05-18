<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Workflow Audit — Breaking News Run
**Date:** 2026-05-18 | **Run ID:** breaking-run262-1779068047

---

## Stage Timing Log

| Stage | Start (approx.) | End (approx.) | Duration | Status |
|-------|---------------|-------------|---------|--------|
| Pre-agent prefetch | ~01:31 | ~01:31 | ~30s | ✅ Complete |
| Setup + date context | ~01:33 | ~01:34 | ~1m | ✅ Complete |
| Stage A (data collection) | ~01:34 | ~01:36 | ~2m | ✅ Complete |
| Stage B Pass 1 (analysis) | ~01:37 | ongoing | ~ongoing | 🔄 In progress |

---

## Invocation Tracking

| Phase | Tool calls | EP MCP calls | Notes |
|-------|-----------|-------------|-------|
| Stage A | 6 EP MCP + 1 prefetch script | 6 | Cap: 5 standard + 1 acknowledged exception |
| Stage B | File writes (no new MCP) | 0 | Writing from existing data |
| Stage C | validate-analysis script | 0 | |

---

## Data Mode: degraded-feeds

- Prefetch: full (6/6 files, all empty)
- Events feed: UNAVAILABLE (404)
- Voting data: UNAVAILABLE (no DOCEO XML for week)
- Adopted texts: AVAILABLE (direct endpoint, 31 texts)
- Line floor factor: 0.80

---

## Artifacts Written (Pass 1 progress)

1. ✅ executive-brief.md
2. ✅ intelligence/synthesis-summary.md
3. ✅ intelligence/analysis-index.md
4. ✅ intelligence/mcp-reliability-audit.md
5. ✅ intelligence/coalition-dynamics.md
6. ✅ intelligence/stakeholder-map.md
7. ✅ intelligence/pestle-analysis.md
8. ✅ intelligence/scenario-forecast.md
9. ✅ intelligence/wildcards-blackswans.md
10. ✅ intelligence/threat-model.md
11. ✅ intelligence/economic-context.md
12. ✅ intelligence/historical-baseline.md
13. ✅ intelligence/political-threat-landscape.md
14. ✅ intelligence/significance-scoring.md
15. ✅ intelligence/cross-run-diff.md
16. ✅ intelligence/cross-session-intelligence.md
17. ✅ intelligence/reference-analysis-quality.md
18. ✅ intelligence/voting-patterns.degraded.md
19. ✅ risk-scoring/risk-matrix.md
20. ✅ risk-scoring/quantitative-swot.md
21. ✅ classification/significance-classification.md
22. ✅ documents/document-analysis-index.md
23. ✅ intelligence/workflow-audit.md (this file)
24. ⏳ intelligence/methodology-reflection.md
25. ⏳ data-availability-assessment.md
26. ⏳ intelligence/procedures-proxy.md
27. ⏳ extended/* (13 extended artifacts)
28. ⏳ manifest.json

*Generated: 2026-05-18 | Run: breaking-run262-1779068047*
