# Translation Analysis Summary — 2026-04-10

Run ID: 86 | Run date: 2026-04-11 | Article date: 2026-04-11

## 1. Translation Coverage Matrix

| Article Type | nl | ar | he | ja | ko | zh |
|---|---|---|---|---|---|---|
| motions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| propositions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| week-ahead | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| committee-reports | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

- **Total files generated**: 18
- **committee-reports skipped**: EP MCP API unavailable (all committee data was placeholder)

## 2. Terminology Consistency

- EP-specific terms translated per official terminology standards
- Key terms: Trilogue → 三者協議 (JA), 삼자협의 (KO), 三方对话 (ZH), triloog (NL), الحوار الثلاثي (AR), טרילוג (HE)
- Subsidiarity → 補完性原則 (JA), 보충성 원칙 (KO), 辅助性原则 (ZH), subsidiariteit (NL), التبعية (AR), סובסידיאריות (HE)

## 3. Quality Assessment

| Language | Grade | Notes |
|---|---|---|
| nl | B | Full stakeholder translation, natural Dutch |
| ar | B | RTL layout verified, formal MSA register |
| he | B | RTL layout verified, formal register |
| ja | B | CJK characters verified (1879+ chars), EP terminology |
| ko | B | CJK characters verified (1630+ chars), EP terminology |
| zh | B | CJK characters verified (1336+ chars), simplified Chinese |

## 4. Coverage Gap Analysis

- **committee-reports**: EP MCP Server returned placeholder data for all committees (ENVI, LIBE, ECON, AFET, AGRI). EP API direct fallback also failed (network blocked).
- All 3 available article types fully translated to all 6 target languages.

## 5. Improvement Recommendations

- **Short-term**: Retry committee-reports when EP MCP connectivity restored
- **Longer-term**: Pre-cache committee data to avoid single point of failure
- Previous run (86) completed sv/da/no/fi/de/fr/es; this run completes nl/ar/he/ja/ko/zh
