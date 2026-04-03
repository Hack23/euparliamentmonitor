# Translation Analysis Summary — 2026-04-03

## 1. Translation Coverage Matrix

| Article Type | sv | da | no | fi | de | fr | es | nl | ar | he | ja | ko | zh |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| committee-reports | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| propositions | P | P | P | P | P | P | P | P | P | P | P | P | P |

Y = translated this run, P = already existed prior to this run

- **Article types translated this run**: committee-reports (13 languages)
- **Article types skipped**: propositions (all translations already existed)
- **Languages covered**: sv, da, no, fi, de, fr, es, nl, ar, he, ja, ko, zh

## 2. Terminology Consistency

- EP committee names use official designations across all languages via the localization system
- Political group abbreviations (EPP, S&D, Renew, Greens/EFA, ECR, PfE, ESN) preserved untranslated
- Committee abbreviations (ENVI, ECON, AFET, LIBE, AGRI) preserved as-is across all translations
- UI strings localized via language-ui.ts and language-articles.ts static dictionaries

## 3. Quality Assessment

| Language | Score | Grade | Word Count | Notes |
|---|---|---|---|---|
| sv | 30/100 | D | 1033 | Functional; article depth below A-grade threshold |
| da | 30/100 | D | 1036 | Functional; article depth below A-grade threshold |
| no | 30/100 | D | 1041 | Functional; article depth below A-grade threshold |
| fi | 30/100 | D | 1023 | Functional; article depth below A-grade threshold |
| de | 31/100 | D | 1053 | Functional; article depth below A-grade threshold |
| fr | 32/100 | D | 1249 | Highest word count among European languages |
| es | 32/100 | D | 1273 | Highest word count overall |
| nl | 31/100 | D | 1092 | Functional; article depth below A-grade threshold |
| ar | 31/100 | D | 759 | RTL layout applied; lower word count due to morphology |
| he | 31/100 | D | 769 | RTL layout applied; lower word count due to morphology |
| ja | 29/100 | D | 767 | CJK punctuation applied; ASCII ratio expected for EP terms |
| ko | 31/100 | D | 771 | CJK formatting applied |
| zh | 28/100 | D | 752 | Simplified Chinese; lowest word count due to CJK density |

Quality gate note: All articles received Grade D due to article depth below the 1500-word A-grade threshold
and absence of SWOT/dashboard sections. These limitations are inherent to the committee-reports strategy,
not translation quality issues.

## 4. Coverage Gap Analysis

- No coverage gaps for committee-reports -- all 13 target languages translated
- Propositions already fully translated from a prior workflow run
- EP API intermittently unavailable; pre-fetched MCP data used as fallback

## 5. Data Source Notes

- Primary MCP gateway succeeded but EP API returned placeholder data for committee endpoints
- Fallback: MCP tools fetched adopted texts (236 items), MEP updates (737), declarations (498)
- Feed data assembled into JSON and loaded via EP_FEED_DATA_FILE environment variable
- Committee data (ENVI, ECON, AFET, LIBE, AGRI) loaded via EP_COMMITTEE_DATA_FILE

## 6. Improvement Recommendations

### Short-term
- Monitor EP API committee endpoint availability for member/chair data enrichment
- Add localized keyword dictionaries to resolve English-only keywords warning

### Longer-term
- SWOT and data dashboard sections would increase quality grades from D to B/A
- Cache successful MCP data fetches for fallback in subsequent translation runs
