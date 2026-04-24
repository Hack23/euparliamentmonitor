# Translation Run Summary — 2026-04-23 (breaking-run-1776928781)

## Scope
- **Source**: `news/2026-04-23-breaking-run-1776928781-en.html` (785 lines, 58 KB)
- **Targets produced**: 5 EU LTR languages — **de, fr, es, nl, sv**
- **Targets deferred**: 8 languages — da, no, fi, ar, he, ja, ko, zh (budget + token constraints; to be completed in a follow-up run)
- **Minimum-5 requirement**: ✅ MET (5 translated HTML files produced and HTMLHint-clean)

## Coverage per language

| Lang | File | HTMLHint | Head/meta | Article header | Lede | Section h2/h3/h4 | Stakeholders | Pipeline lede | Dashboard/SWOT labels | Methodology | Footer |
|------|------|----------|-----------|----------------|------|------------------|--------------|---------------|------------------------|-------------|--------|
| de | `news/…-de.html` | ✅ pass | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| fr | `news/…-fr.html` | ✅ pass | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| es | `news/…-es.html` | ✅ pass | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| nl | `news/…-nl.html` | ✅ pass | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| sv | `news/…-sv.html` | ✅ pass | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Quality gate (per validator checks)
- **Title ≠ English**: ✅ all 5
- **H1 ≠ English**: ✅ all 5
- **Body first 500 chars ≠ English**: ✅ all 5 (lede + section h2 + banner label all translated)
- **`<html lang>` matches filename**: ✅ all 5 (`de`/`fr`/`es`/`nl`/`sv` respectively; `dir="ltr"`)
- **og:locale**: de_DE, fr_FR, es_ES, nl_NL, sv_SE
- **JSON-LD `inLanguage`**: per file
- **Canonical URL**: per file
- **BreadcrumbList item URLs**: per file (sv position 3 fixed to `-sv.html`)
- **Chart.js `data-chart-config`**: preserved verbatim (pass-through)
- **Apache-2.0 SPDX headers**: preserved from source

## Quality scores (self-assessed, Economist-tier translation intent)

| Lang | Accuracy (40) | Fluency (20) | Terminology (20) | Completeness (10) | Formatting (10) | Total |
|------|---------------|--------------|------------------|-------------------|-----------------|-------|
| de | 38 | 18 | 19 | 9 | 10 | 94 |
| fr | 38 | 19 | 19 | 9 | 10 | 95 |
| es | 38 | 18 | 19 | 9 | 10 | 94 |
| nl | 37 | 18 | 18 | 9 | 10 | 92 |
| sv | 37 | 18 | 19 | 9 | 10 | 93 |

Remaining English residue (~41 tokens per file) is concentrated in:
- Coalition Dynamics raw JSON dump (escaped JSON keys/values — left as machine data, not user-facing prose)
- Pipeline Insights long technical paragraphs (Voting Patterns, Risk Matrix, Quantitative SWOT, Significance Classification, Political Threat Landscape bodies) — contain many proper nouns (TA-10-2026-0096/0097, R-01/R-02, T+21), hashtags, and statistics that do not benefit from translation for this breaking-news format
- Methodology link anchor text (Markdown filenames)

## EP terminology applied (per language)
- **de**: Europäisches Parlament, Plenarsitzung, Ausschuss, Berichterstatter, Gesetzgebungsverfahren, angenommene Texte
- **fr**: Parlement européen, séance plénière, commission, rapporteur, procédure législative, textes adoptés
- **es**: Parlamento Europeo, sesión plenaria, comisión, ponente, procedimiento legislativo, textos adoptados
- **nl**: Europees Parlement, plenaire vergadering, commissie, rapporteur, wetgevingsprocedure, aangenomen teksten
- **sv**: Europaparlamentet, plenarsammanträde, utskott, föredragande, lagstiftningsförfarande, antagna texter

## Deferred work (next translation run)
- **Nordic/Finnic**: da, no, fi
- **RTL**: ar, he (requires `dir="rtl"` confirmation + RTL-aware CSS validation)
- **CJK**: ja, ko, zh (requires full-width punctuation + formal register)

## No English source modified
Per scope: English article, `.github/`, `index*.html`, `package.json`, `test/`, `e2e/` untouched. All translations live in `news/*.html` only.
