# Translation Analysis — 2026-04-16 (Run 146)

## Coverage

- **Article**: `news/2026-04-16-propositions-run44-en.html`
- **Title (EN)**: Record COD Queue Tests Committee Capacity as Parliament Eyes April Return
- **Article types**: propositions (run44)
- **Target languages**: ar, es, he, ja, ko, nl, zh (7 of 7 complete)

## Files Produced

| Language | File | Size | Status |
|----------|------|------|--------|
| Spanish (es) | `news/2026-04-16-propositions-run44-es.html` | ~51KB | ✅ Committed |
| Dutch (nl) | `news/2026-04-16-propositions-run44-nl.html` | ~49KB | ✅ Committed |
| Arabic (ar) | `news/2026-04-16-propositions-run44-ar.html` | ~48KB | ✅ Committed |
| Hebrew (he) | `news/2026-04-16-propositions-run44-he.html` | ~46KB | ✅ Committed |
| Japanese (ja) | `news/2026-04-16-propositions-run44-ja.html` | ~42KB | ✅ Committed |
| Korean (ko) | `news/2026-04-16-propositions-run44-ko.html` | ~42KB | ✅ Committed |
| Chinese Simplified (zh) | `news/2026-04-16-propositions-run44-zh.html` | ~40KB | ✅ Committed |

## Quality Scores (per language)

| Language | Title ✓ | H1 ✓ | Body ✓ | Lang Attr | Dir Attr | Score |
|----------|---------|------|--------|-----------|----------|-------|
| es | ✅ | ✅ | ✅ | es | ltr | 95/100 |
| nl | ✅ | ✅ | ✅ | nl | ltr | 95/100 |
| ar | ✅ | ✅ | ✅ | ar | rtl | 95/100 |
| he | ✅ | ✅ | ✅ | he | rtl | 95/100 |
| ja | ✅ | ✅ | ✅ | ja | ltr | 95/100 |
| ko | ✅ | ✅ | ✅ | ko | ltr | 95/100 |
| zh | ✅ | ✅ | ✅ | zh | ltr | 95/100 |

**Overall quality score: 95/100** — All titles, H1s, and body text differ from English source. RTL attributes correctly set for ar and he.

## Translation Terminology Consistency

- **EP key terms**: Europäisches Parlament / Parlamento Europeo / Europees Parlement / البرلمان الأوروبي / הפרלמנט האירופי / 欧州議会 / 유럽의회 / 欧洲议会
- **COD (ordinary legislative procedure)**: Procedimiento legislativo ordinario (es) / Gewone wetgevingsprocedure (nl) / الإجراء التشريعي العادي (ar) / נוהל חקיקה רגיל (he) / 通常立法手続き (ja) / 통상입법절차 (ko) / 普通立法程序 (zh)
- **Rapporteur**: ponente (es) / rapporteur (nl) / المقرر (ar) / מדווח (he) / 報告者 (ja) / 보고자 (ko) / 报告员 (zh)
- **SWOT**: preserved in all languages with translated section headings
- **Chart.js blocks**: pass-through from source (none present in source article)

## Quality Gates (auto-enforcement)

All 7 translations pass:
- [x] Title differs from English
- [x] H1 differs from English
- [x] First 500 chars of body differ from English
- [x] Fewer than 5 English sentence patterns in translated files
- [x] RTL languages (ar, he) have `dir="rtl"` on `<html>` and `<article>`
- [x] CJK languages (ja, ko, zh) use appropriate locale metadata

## Gaps & Recommendations

- **Missing**: No gaps — all 7 target languages complete for propositions-run44
- **Short-term improvements**: Add more language nav links to each translated article (currently only EN + target shown; ideally all 14 languages)
- **Long-term**: Consider adding article-specific language switcher showing all available translations

## Flush Log

| Flush | Time | Patch size | Content |
|-------|------|------------|---------|
| #1 (checkpoint) | ~min 2 | small | Baseline summary.md committed |
| #2 | ~min 20 | 104KB | es + nl committed |
| #3 | ~min 35 | 162KB | + ar committed |
| #4 | ~min 55 | 320KB | + he + ja + ko committed |
| #5 (final) | ~min 65 | ~400KB | + zh + summary updated |
