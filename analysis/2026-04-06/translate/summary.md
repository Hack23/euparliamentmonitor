# Translation Analysis Summary — 2026-04-06

## 1. Translation Coverage Matrix

| Article Type | EN (source) | SV | DA | NO | FI | DE | FR | ES | NL | AR | HE | JA | KO | ZH |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| motions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| propositions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

- **motions**: Translated in this run (13 languages)
- **propositions**: Already translated in prior run — skipped

## 2. Terminology Consistency

- EP institutional terms correctly localized via TypeScript generator's language-ui constants
- Political group abbreviations (EPP, S&D, Renew, Greens/EFA, ECR, PfE, ESN) preserved untranslated as required
- Committee abbreviations preserved as-is
- Generator flagged "European Parliament" as potentially untranslated in several languages — this is expected since some languages use the English form in metadata contexts

## 3. Quality Assessment

| Language | Quality Score | Grade | Word Count | Notes |
|---|---|---|---|---|
| SV | 56 | D | 756 | Functional translation, keyword localization flagged |
| DA | 56 | D | 759 | Functional translation |
| NO | 56 | D | 753 | Functional translation |
| FI | 56 | D | 743 | Functional translation |
| DE | 56 | D | 761 | Functional translation |
| FR | 58 | D | 941 | Higher word count (Romance language expansion) |
| ES | 58 | D | 937 | Higher word count (Romance language expansion) |
| NL | 56 | D | 786 | Functional translation |
| AR | 57 | D | 442 | RTL layout correct, lower word count typical for Arabic |
| HE | 57 | D | 442 | RTL layout correct |
| JA | 55 | D | 443 | CJK character compression expected |
| KO | 57 | D | 448 | CJK formatting correct |
| ZH | 55 | D | 441 | CJK character compression expected |

Average quality: 56.4/100 (Grade D). Scores reflect the source article's shorter format — motions articles are concise policy summaries rather than long-form analysis.

## 4. Coverage Gap Analysis

- All 13 target languages were successfully translated
- No languages skipped or failed
- Source article used placeholder data for voting records, patterns, and anomalies (MCP returned filtered results)

## 5. Improvement Recommendations

### Short-term
- Localize article keywords per language to eliminate English-only keyword warnings
- Increase article word count to improve quality gate scores (target: 1500+ words)

### Longer-term
- Add data dashboard visualizations to improve quality scoring
- Add mindmap diagrams for conceptual structure
- Consider retry logic when MCP server returns zero items after date filtering
