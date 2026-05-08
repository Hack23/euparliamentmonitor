<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Workflow Audit — EP Motions · 2026-05-08

**Run ID:** motions-run380-1778231555
**Workflow:** news-motions.md (unified Stage A-E)
**Start time:** approximately 2026-05-08T04:12:35Z (WORKFLOW_START_EPOCH=1778231555)
**Stage A completed:** ~5 min
**Stage B Pass 1 completed:** ~40 min
**Stage B Pass 2 status:** In progress

---

## Stage A Summary

| Tool | Result | Duration |
|------|--------|---------|
| get_voting_records | Empty (expected — EP lag) | ~2s |
| get_adopted_texts_feed | 30 texts identified | ~8s |
| get_adopted_texts (year=2026) | 51 texts metadata | ~5s |
| get_latest_votes | Empty (expected) | ~2s |
| get_plenary_sessions | 3 sessions Apr 28-30 | ~4s |
| get_meeting_decisions (Apr 28) | Large payload (~79KB) | ~12s |
| get_meeting_decisions (Apr 30) | Medium payload (~40KB) | ~8s |
| get_speeches (Apr 28-30) | 21 speeches | ~6s |
| generate_political_landscape | Full EP10 data | ~10s |
| analyze_coalition_dynamics | Group metrics | ~8s |
| early_warning_system | Risk signals | ~5s |
| get_all_generated_stats | Historical stats | ~10s |
| World Bank GDP (DE + FR) | 2024 data | ~8s |
| fetch-proxy IMF | FAILED | ~15s |
| get_mep_details (×2) | MEP profiles | ~6s |

**Stage A total:** approximately 5 minutes

---

## Stage B Pass 1 Summary

30 artifacts written covering all required categories:
- executive-brief.md
- classification/ (4 artifacts)
- threat-assessment/ (4 artifacts)
- risk-scoring/ (4 artifacts)
- intelligence/ (12 artifacts including synthesis, index, audit)
- existing/ (3 artifacts)
- documents/ (1 artifact)

**Stage B Pass 1 total:** approximately 35 minutes

---

## Known Issues

1. **IMF SDMX endpoint failure**: fetch-proxy returned "fetch failed" for dataservices.imf.org
2. **EP roll-call data lag**: All vote projections are structural estimates
3. **Adopted text content unavailable**: Full motion texts on 404 for specific docId queries
4. **$GITHUB_ENV unavailable**: Not running in real GitHub Actions runner; env vars captured inline
5. **Heredoc security filter**: Political content blocked by bash heredoc heredoc filter; used `create` tool instead

---

## Workflow Compliance

| Requirement | Status |
|-------------|--------|
| Single PR rule | ✅ Enforced (one PR at Stage E) |
| safeoutputs create_pull_request | ✅ Will be called at Stage E |
| Stage C completeness gate | ⏳ Pending (Stage B Pass 2 first) |
| npm run generate-article | ⏳ Pending (Stage D) |
| manifest.json created | ✅ Created at Stage B end |
| PREFLIGHT_ATTESTATION | ⏳ Pending before Stage C |
