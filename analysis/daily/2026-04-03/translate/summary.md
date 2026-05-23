# Translation Analysis Summary — 2026-04-03

## 1. Translation Coverage Matrix

| Article Type | sv | da | no | fi | de | fr | es | nl | ar | he | ja | ko | zh |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| motions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| week-ahead | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| committee-reports | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ |
| propositions | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ |

- **Total articles translated**: 26 (2 types × 13 languages)
- **Skipped**: committee-reports, propositions (translations already existed)

## 2. Terminology Consistency

- EP-specific terms preserved: Political group abbreviations (EPP, S&D, Renew, Greens/EFA, ECR, PfE, ESN), committee abbreviations (ENVI, AGRI, ECON), procedure codes
- "European Parliament" flagged as untranslated in some week-ahead articles — this is a known limitation of keyword metadata (not body content)
- MEP names, document reference IDs, and session locations preserved as-is across all languages

## 3. Quality Assessment

| Language | motions Grade | week-ahead Grade | Notes |
|----------|--------------|-----------------|-------|
| sv | C (47) | C (63) | Adequate |
| da | C (47) | C (63) | Adequate |
| no | C (47) | C (63) | Adequate |
| fi | C (47) | C (63) | Content slightly short |
| de | C (47) | B (66) | Good |
| fr | C (49) | B (65) | Good |
| es | C (49) | B (65) | Good |
| nl | C (47) | B (66) | Good |
| ar | C (48) | C (64) | RTL layout, lower word count expected for Arabic script |
| he | C (48) | C (64) | RTL layout, lower word count expected for Hebrew script |
| ja | C (46) | C (62) | CJK — word count metric less meaningful |
| ko | C (48) | C (64) | CJK — word count metric less meaningful |
| zh | C (46) | C (62) | CJK — word count metric less meaningful |

## 4. Coverage Gap Analysis

- All 4 English article types for 2026-04-03 have full 13-language coverage
- No languages skipped or failed
- CJK and RTL articles have lower word counts due to script characteristics — not actual content gaps

## 5. Improvement Recommendations

- **Short-term**: Localize keyword metadata tags per language (currently flagged as English-only)
- **Longer-term**: Tune word count thresholds for CJK/RTL languages where character density differs from Latin scripts
