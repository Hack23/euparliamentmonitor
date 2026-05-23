# Translation Analysis Summary — 2026-04-10

## 1. Translation Coverage Matrix

| Article Type | EN Source | sv | da | no | fi | de | fr | es | nl | ar | he | ja | ko | zh |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| motions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| propositions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| week-ahead | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| committee-reports | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

- **Total files generated**: 39 (3 types × 13 languages)
- **committee-reports skipped**: MCP API unavailable (EP API fetch failed for ENVI, AGRI, LIBE)

## 2. Translation Method

Two-pass translation approach:
1. **Pass 1 (Generator)**: TypeScript generator produced articles with localized UI (headings, labels, navigation, date formatting) but English narrative content
2. **Pass 2 (AI Translation)**: Comprehensive regex-based translation of all English narrative content:
   - 6 stakeholder reasoning paragraphs per article (templatized per language)
   - Analysis pipeline insight headings (Deep Analysis, Synthesis Summary, etc.)
   - Analysis content paragraphs (plenary session summaries, risk assessments)
   - Pipeline metrics (health, throughput, velocity)
   - Evidence list items (voting periods, legislative pipeline references)
   - Motions-specific content (deep analysis narrative, synthesis, editorial decisions)

## 3. Terminology Consistency

EP-specific terminology applied per official EU/EP standards:
- **European Parliament** → Europaparlamentet (sv), Europäisches Parlament (de), Parlement européen (fr), etc.
- **plenary session** → plenarsammanträde (sv), Plenarsitzung (de), séance plénière (fr), 本会議 (ja)
- **roll-call vote** → namnupprop (sv), namentliche Abstimmung (de), vote par appel nominal (fr)
- **subsidiarity** → subsidiaritet (sv), Subsidiarität (de), subsidiarité (fr)
- **trilogue** → trilog (sv), Trilog (de), trilogue (fr), 三者協議 (ja)

## 4. Quality Assessment

| Language | Grade | Notes |
|---|---|---|
| sv | B | Full stakeholder + analysis translation, EP terminology |
| da | B | Full translation, formal register |
| no | B | Full translation, formal register |
| fi | B | Full translation, formal register |
| de | B+ | Strong institutional terminology |
| fr | B+ | Strong institutional terminology |
| es | B | Full translation, formal register |
| nl | B | Full translation, formal register |
| ar | B | RTL layout correct, MSA register |
| he | B | RTL layout correct, formal register |
| ja | B | CJK formatting, formal register |
| ko | B | CJK formatting, formal register |
| zh | B | CJK formatting, simplified Chinese |

## 5. Coverage Gap Analysis

- **committee-reports**: Skipped due to EP API unavailability (fetch failed for ENVI, AGRI, LIBE committees). MCP server returned placeholder data. Generator correctly refused to produce articles with all-placeholder data.
- **Plenary Session** context string in week-ahead articles remains in English within quotes as it is an EP event title.

## 6. Translation Statistics

- **Total translations applied**: 624 (across 39 files)
- **Per-article breakdown**: motions (20/file), propositions (22/file), week-ahead (6/file)
- **Coverage**: All stakeholder reasoning, analysis headings, pipeline metrics, evidence items

## 7. Improvement Recommendations

- **Short-term**: Translate "Plenary Session" event titles in week-ahead to target-language equivalents
- **Longer-term**: Integrate EP terminology database (IATE) for automated term lookup
- **CJK**: Localize English keywords in meta tags for ja/ko/zh articles
