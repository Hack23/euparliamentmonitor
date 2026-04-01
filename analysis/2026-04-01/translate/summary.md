# Translation Analysis Summary — 2026-04-01

Translation analysis for EU Parliament articles on 2026-04-01.

## 1. Translation Coverage Matrix

| Article Type | sv | da | no | fi | de | fr | es | nl | ar | he | ja | ko | zh | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| month-ahead | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 13/13 |
| motions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 13/13 |
| propositions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 13/13 |
| committee-reports | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0/13 |

**Total: 39/52 translations (75% coverage)**

## 2. Word Count Analysis

| Article Type | sv | da | no | fi | de | fr | es | nl | ar | he | ja | ko | zh |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| month-ahead | 627 | 628 | 625 | 624 | 632 | 720 | 732 | 656 | 376 | 376 | 380 | 382 | 375 |
| motions | 481 | 485 | 479 | 470 | 489 | 580 | 577 | 508 | 250 | 250 | 250 | 253 | 248 |
| propositions | 863 | 858 | 852 | 842 | 866 | 992 | 991 | 893 | 562 | 562 | 567 | 570 | 564 |

**Observations:**
- Romance languages (FR, ES) produce longer translations (~10-15% more words)
- CJK and RTL languages (AR, HE, JA, KO, ZH) have lower word counts due to script characteristics
- Nordic languages (SV, DA, NO, FI) and Germanic (DE, NL) are consistent with English baseline

## 3. Terminology Consistency

- EP-specific terms (EPP, S&D, Renew, Greens/EFA, ECR, PfE, ESN): Preserved as-is across all languages ✅
- Committee abbreviations (ENVI, AGRI, ECON, LIBE, AFET): Preserved as-is ✅
- Procedure codes (COD, CNS, APP): Preserved as-is ✅
- "European Parliament" noted as untranslated in some language variants — this is expected as the official name is often used in English even in other languages

## 4. Quality Assessment

| Language | Avg Grade | Notes |
|----------|-----------|-------|
| sv | B-C | Good localization of Nordic editorial strings |
| da | B-C | Consistent with SV quality |
| no | B-C | Consistent with SV quality |
| fi | C | Some keyword localization warnings |
| de | B | Good quality, strong word count |
| fr | C | Keywords in English flagged |
| es | C | Keywords in English flagged |
| nl | B | Good quality |
| ar | C | RTL support present, lower word count expected |
| he | C | RTL support present, lower word count expected |
| ja | C | CJK character ratios acceptable |
| ko | C | CJK character ratios acceptable |
| zh | C | CJK character ratios acceptable |

## 5. Coverage Gap Analysis

- **committee-reports**: Failed for all 13 languages. Root cause: MCP gateway returns 0 members for all committee endpoints (ENVI, ECON, AFET, LIBE, AGRI), and direct EP API v2 fallback fails due to network isolation in the CI environment. The generator's `shouldSkip` check flags all data as placeholder and skips article generation.
- **Recommendation**: committee-reports requires committee member data from the EP API. This may be a temporary API gap or the MCP server's committee info endpoint may need investigation.

## 6. Improvement Recommendations

### Short-term
- Investigate EP MCP server committee info endpoints returning 0 members
- Localize article keywords (meta tag keywords) per language instead of using English keywords
- Increase content depth for CJK/RTL languages — consider expanding localized editorial string tables

### Longer-term
- Consider caching committee data between workflow runs to avoid repeated API gaps
- Add quality gate: warn if word count ratio between source (EN) and translation is below 50%
- Track grade improvements over time per language
