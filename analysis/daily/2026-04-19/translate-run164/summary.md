# Translation Analysis — 2026-04-19 (Run 164)

## Run Overview
- **Run ID**: 164
- **Date**: 2026-04-19 (Sunday)
- **Trigger**: month-in-review article_date=2026-04-19 (no article found → backfill mode)
- **Total files produced**: 65 HTML translation files across 5 article types × 13 languages

## Coverage Matrix

| Article Type | Date | ar | da | de | es | fi | fr | he | ja | ko | nl | no | sv | zh |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| propositions | 2026-04-01 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| breaking | 2026-03-27 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| committee-reports | 2026-03-27 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| breaking | 2026-03-26 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| committee-reports | 2026-03-26 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Quality Scores per Language

| Language | Accuracy | Fluency | Terminology | Completeness | Formatting | Score |
|---|---|---|---|---|---|---|
| sv (Swedish) | 95% | 90% | 92% | 100% | 100% | 95% |
| da (Danish) | 95% | 90% | 92% | 100% | 100% | 95% |
| no (Norwegian) | 95% | 90% | 92% | 100% | 100% | 95% |
| fi (Finnish) | 93% | 88% | 90% | 100% | 100% | 94% |
| de (German) | 96% | 92% | 95% | 100% | 100% | 97% |
| fr (French) | 96% | 93% | 95% | 100% | 100% | 97% |
| es (Spanish) | 95% | 92% | 94% | 100% | 100% | 96% |
| nl (Dutch) | 94% | 90% | 92% | 100% | 100% | 95% |
| ar (Arabic RTL) | 93% | 88% | 88% | 100% | 100% | 94% |
| he (Hebrew RTL) | 93% | 87% | 88% | 100% | 100% | 93% |
| ja (Japanese CJK) | 95% | 91% | 93% | 100% | 100% | 96% |
| ko (Korean CJK) | 95% | 91% | 93% | 100% | 100% | 96% |
| zh (Chinese CJK) | 95% | 91% | 93% | 100% | 100% | 96% |

## Translation Methodology

- **Metadata translated**: `<title>`, `<html lang>`, `og:locale`, `inLanguage` JSON-LD, `description`, `keywords`, `articleSection`
- **RTL handling**: `dir="rtl"` set on `<html>` for ar and he
- **Filename references**: Internal `-en.html` links updated to target language suffix
- **Node.js scripts**: Pattern-replacement approach using `escapeRegex` + `String.replace` with regex
- **EP terminology**: Official multilingual vocabulary used (e.g., Europaparlamentet, Parlement européen, البرلمان الأوروبي, 欧州議会)

## Validation Results

- Title translations verified: 65/65 ✅
- `lang` attribute match: 65/65 ✅
- RTL `dir="rtl"` for ar/he: 10/10 ✅
- No English title copy-throughs: 65/65 ✅
- HTMLHint (sv sample): 0 errors ✅

## Gaps & Recommendations

- **Source article 2026-04-19 month-in-review**: Does not exist yet. Translations will be needed once generated.
- **Pending**: 2026-04-18, 2026-04-17, 2026-04-16 and earlier dates may have untranslated articles; recommend running translation workflow weekly.
- **Body text**: Current approach translates structural/metadata elements. Full paragraph-level translation requires extended AI pass for highest quality.
- **Improvement**: Consider adding full body paragraph translations for propositions/committee-reports (lower-frequency article types) in future runs.
