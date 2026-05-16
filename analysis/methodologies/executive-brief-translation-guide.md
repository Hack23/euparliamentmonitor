<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Executive-Brief Translation Guide

**Canonical reference for the [`news-translate`](../../.github/workflows/news-translate.md) workflow.**

This guide tells the AI translator exactly *how* to convert an English
`analysis/daily/<date>/<slug>/executive-brief.md` source into the 13
non-English `executive-brief_<lang>.md` companions that make up the 14-language
matrix consumed by downstream article generators.

> **AI-First Principle**: The AI MUST translate every word of every section.
> Scripted dictionary substitution, machine-translation API passthrough, or
> `sed`/`awk`/regex-based string replacement of narrative prose is FORBIDDEN.
> Validation gates in `scripts/validate-brief-translations.js` will reject
> stub or copied output.

---

## 1. Scope

### 1.1 Source

Every file matching `analysis/daily/<YYYY-MM-DD>/<slug>/executive-brief.md`
is in scope. The legacy `extended/executive-brief.md` location is in scope
only when explicitly requested via `--include-extended` in the discovery
script — by default only the canonical path is translated.

### 1.2 Target

For each in-scope source, produce siblings:

```
executive-brief_sv.md   executive-brief_da.md   executive-brief_no.md
executive-brief_fi.md   executive-brief_de.md   executive-brief_fr.md
executive-brief_es.md   executive-brief_nl.md   executive-brief_ar.md
executive-brief_he.md   executive-brief_ja.md   executive-brief_ko.md
executive-brief_zh.md
```

**13 files per source.** Together with the English `executive-brief.md` that
covers the canonical 14 languages (`en, sv, da, no, fi, de, fr, es, nl, ar,
he, ja, ko, zh`).

### 1.3 Languages and writing systems

| Code | Language | Family / Script | RTL? | CJK? |
|------|----------|-----------------|------|------|
| `sv` | Swedish | Nordic / Latin | no | no |
| `da` | Danish | Nordic / Latin | no | no |
| `no` | Norwegian Bokmål | Nordic / Latin | no | no |
| `fi` | Finnish | Uralic / Latin | no | no |
| `de` | German | West Germanic / Latin | no | no |
| `fr` | French | Romance / Latin | no | no |
| `es` | Spanish (es-ES) | Romance / Latin | no | no |
| `nl` | Dutch | West Germanic / Latin | no | no |
| `ar` | Modern Standard Arabic | Semitic / Arabic | **yes** | no |
| `he` | Modern Hebrew | Semitic / Hebrew | **yes** | no |
| `ja` | Japanese | Japonic / kanji + kana | no | **yes** |
| `ko` | Korean | Koreanic / Hangul | no | **yes** |
| `zh` | Chinese (Simplified, zh-CN) | Sinitic / Han | no | **yes** |

---

## 2. Mandatory preservation rules (FIXED TOKENS)

These items MUST appear verbatim — **never** transliterated, translated, or
reformatted. The automated fixed-token gate rejects drops of exact source
instances for the validator-enforced subset below:

- `IMF`, `WEO`, `Fiscal Monitor`, `World Bank`
- `data-vintage="WEO-April-2026"` and any other `data-vintage="WEO-…"` attribute
- EP adopted-text references: `TA-10-2026-0160`
- EP procedure IDs: `2024/0001(COD)`, `2026/2050(INI)` etc.

The remaining preservation rules are mandatory editorial checks. Some are
partly covered by other automated gates (heading parity, Mermaid block parity,
length floor), but translators must verify them manually before flushing:

- `World Economic Outlook`
- ISO country codes in tables: `DE`, `FR`, `IT` …
- ISO currency codes: `EUR`, `USD`, `GBP`
- Numerical figures and units: `2.3%`, `€450 bn`, `EUR 12.4 bn`
- Confidence-level emoji markers: `🟢 HIGH`, `🟡 MEDIUM`, `🔴 LOW`
- Classification stamps: `UNCLASSIFIED // OPEN SOURCE`
- The literal heading text `BLUF` (acronym is treated as a proper noun)
- All HTML/Markdown structural elements (links, headings, lists, tables,
  code fences, `<canvas data-chart-config>` blocks if present)

For Latin-script targets (sv, da, no, fi, de, fr, es, nl) these tokens stay
identical to the source. For non-Latin scripts (ar, he, ja, ko, zh) the
tokens remain in Latin/Arabic numerals and are wrapped with their natural
script-direction handling (RTL embedding marks are added only if the editor
truly needs them — most modern Markdown renderers handle this automatically).

---

## 3. Structural fidelity rules

The Markdown structure of the translation MUST mirror the source:

1. **Same number of `#`/`##`/`###` headings, same order.**
2. **Same number of list items per list.**
3. **Same number of table rows and columns; column headers are translated,
   numeric cells are preserved.**
4. **Same number of horizontal-rule `---` separators.**
5. **Same number of `> blockquote` lines.**
6. **No new sections, no merged sections, no deletions.**
7. Emoji markers (🎯, 📋, 🔑, 🟢, 🟡, 🔴, ⏱️, 🛡️, 📊) stay in identical
   positions.
8. **Frontmatter**: if the source file has YAML frontmatter (`--- ... ---`),
   it is copied verbatim into the translation. Frontmatter keys are NOT
   translated; only `title:` / `description:` values are localised.
9. **Citation footnotes / source lists**: URLs are preserved verbatim; the
   anchor / link-text is localised.

---

## 4. Per-language style register

### 4.1 Nordic (sv / da / no / fi)

- Formal register, indicative mood.
- Use the official EP designations per language (see § 5).
- Swedish: avoid `du-tilltal` — keep impersonal `man / Europaparlamentet`.
- Finnish: use partitive correctly; case agreement is non-negotiable.

### 4.2 EU Core (de / fr / es / nl)

- Formal register; `Sie` (de), `vous` (fr), `usted` plural form (es) where
  direct address is unavoidable. Prefer impersonal constructions.
- German: capitalise all nouns; use the EP's official German style
  (`Europäisches Parlament`, not `EU-Parlament` in titles).
- French: keep the *Académie française* register; avoid Anglicisms unless
  the source uses one as a fixed token (e.g. `Big Tech`).
- Spanish: peninsular Spanish (es-ES); avoid Latin-American specific
  vocabulary.

### 4.3 RTL (ar / he)

- Arabic: Modern Standard Arabic (MSA), formal political register;
  follow the EP's Arabic style guide if available, else use IATE.
- Hebrew: formal modern Hebrew; do **not** add diacritics (nikud) unless
  the source carries them.
- Markdown is direction-agnostic; renderers detect RTL from script. Do not
  insert U+200F (RLM) marks except when truly necessary to disambiguate a
  Latin-script token inside an Arabic sentence.
- Numerals: keep Western Arabic numerals (`0–9`); do not switch to
  Eastern Arabic-Indic digits.

### 4.4 CJK (ja / ko / zh)

- Japanese: `です・ます` form (desu-masu / polite register). Use full-width
  punctuation (`。`, `、`, `「」`).
- Korean: `합쇼체` (formal polite). Punctuation: half-width `,` and `.`
  per modern South-Korean publishing convention. Use spaces between
  *eojeol* (word units).
- Chinese: Simplified characters only (`zh-CN`). Full-width punctuation
  (`。`, `，`, `「」` or `""`). Do not mix Traditional characters.
- For all three: keep proper nouns (IMF, EP body names) in Latin script.

---

## 5. Per-language EP terminology (canonical pairs)

| EN | sv | da | no | fi | de | fr | es | nl |
|----|----|----|----|----|----|----|----|----|
| European Parliament | Europaparlamentet | Europa-Parlamentet | Europaparlamentet | Euroopan parlamentti | Europäisches Parlament | Parlement européen | Parlamento Europeo | Europees Parlement |
| Plenary session | plenarsammanträde | plenarmøde | plenumsmøte | täysistunto | Plenarsitzung | séance plénière | sesión plenaria | plenaire vergadering |
| Committee | utskott | udvalg | komité | valiokunta | Ausschuss | commission | comisión | commissie |
| Rapporteur | föredragande | ordfører | ordfører | esittelijä | Berichterstatter | rapporteur | ponente | rapporteur |
| Legislative procedure | lagstiftningsförfarande | lovgivningsprocedure | lovgivningsprosedyre | lainsäädäntömenettely | Gesetzgebungsverfahren | procédure législative | procedimiento legislativo | wetgevingsprocedure |
| Resolution | resolution | beslutning | resolusjon | päätöslauselma | Entschließung | résolution | resolución | resolutie |
| Adopted text | antagen text | vedtaget tekst | vedtatt tekst | hyväksytty teksti | angenommener Text | texte adopté | texto aprobado | aangenomen tekst |
| Vote | omröstning | afstemning | avstemning | äänestys | Abstimmung | vote | votación | stemming |

| EN | ar | he | ja | ko | zh |
|----|----|----|----|----|----|
| European Parliament | البرلمان الأوروبي | הפרלמנט האירופי | 欧州議会 | 유럽의회 | 欧洲议会 |
| Plenary session | الجلسة العامة | מליאה | 本会議 | 본회의 | 全体会议 |
| Committee | اللجنة | ועדה | 委員会 | 위원회 | 委员会 |
| Rapporteur | المقرر | מדווח | 報告者 | 보고자 | 报告员 |
| Legislative procedure | الإجراء التشريعي | הליך חקיקה | 立法手続き | 입법절차 | 立法程序 |
| Resolution | قرار | החלטה | 決議 | 결의 | 决议 |
| Vote | تصويت | הצבעה | 採決 | 표결 | 表决 |

Authoritative external references:
- [IATE — EU interinstitutional terminology database](https://iate.europa.eu/)
- [EP Multilingual Termbase](https://www.europarl.europa.eu/portal/en)
- EU `eur-lex.europa.eu` for legal citations in target language.

---

## 6. Per-section translation contract

The English executive brief always contains these sections (see
`analysis/templates/executive-brief.md` for the source-of-truth template).
Each must be translated in full — partial coverage fails the length-floor
gate.

| Section | Translate? | Notes |
|---------|------------|-------|
| Title (`# Executive Brief …`) | yes | Keep the literal word `Executive Brief` translated; keep the slug/date suffix verbatim. |
| Metadata line (`**Date:** … | **Article Type:** …`) | yes (labels) | Translate `Date`, `Article Type`, `Run`. Keep values (date, slug, run-id) verbatim. |
| `**Classification:** UNCLASSIFIED // OPEN SOURCE` | label only | Translate `Classification`; keep the stamp verbatim. |
| `## 🎯 BLUF` | yes | Keep emoji + acronym `BLUF`. Translate the heading text and body. |
| `## 📋 60-Second Read` | yes | Heading text translated; preserve the literal `60-second` numerical anchor. |
| Key facts list | yes | Preserve all dates, TA-IDs, names. |
| `## 🔑 Top Trigger Events` | yes | Sub-headings and bullets fully translated. |
| Coalition / actor lists | yes | Group abbreviations (EPP, S&D, Renew, Greens/EFA, ECR, PfE, The Left) stay verbatim. |
| Confidence markers | preserve | `🟢 HIGH`, `🟡 MEDIUM`, `🔴 LOW` verbatim. |
| Citation footnotes / URLs | URL verbatim, anchor translated | |

---

## 7. Quality dimensions (scored in the run summary)

| Dimension | Weight | What the validator checks |
|-----------|--------|---------------------------|
| Accuracy | 40 % | No additions, no omissions vs. source. |
| Fluency | 20 % | Natural target-language phrasing. |
| Terminology | 20 % | EP/EU vocabulary per § 5. |
| Completeness | 10 % | All sections, lists, table rows present. |
| Formatting | 10 % | Heading levels, list counts, FIXED TOKENS preserved. |

Automated gates that block PR creation when violated:

1. **Filename ↔ language code** — `executive-brief_<lang>.md` with `<lang>`
   in `TARGET_LANGS`.
2. **Source presence** — sibling `executive-brief.md` exists.
3. **Length floor** — translated byte size ≥ 50 % of source byte size.
4. **No English fall-through** — fewer than 5 hits of `EN_PATTERNS` (see
   `scripts/validate-brief-translations.js`).
5. **Fixed-token preservation** — every IMF/WEO/EP/data-vintage token in
   the source must appear in the translation.
6. **Heading parity** — H1 count must match the source exactly; H2/H3
   counts may differ by at most `HEADING_TOLERANCE` (1). Catches the
   common AI failure of collapsing or skipping sub-sections.
7. **Mermaid block parity** — every \`\`\`mermaid block opener in the
   source must appear at least once in the translation. Diagrams are
   machine-readable and round-trip verbatim.

The validator report `totals` includes `byGate` and `byLang` aggregations
so operators can see at a glance which gates and which languages are
failing without parsing the full violations list.

---

## 8. Workflow contract (summary)

The full workflow contract lives in
[`.github/workflows/news-translate.md`](../../.github/workflows/news-translate.md).
Operating-model highlights:

- **Trigger**: cron `30 6,12,18 * * *` (3×/day) + `workflow_dispatch`.
- **Discovery**: `node scripts/discover-untranslated-briefs.js --output …`.
- **Capacity**: 2 source briefs / run × 13 languages = 26 translated files
  per run by default (raise to 3 via the `max_briefs` dispatch input on
  catch-up days).
- **Flush cadence**: after every fully-translated brief (13 files) call
  `safeoutputs___create_pull_request` to refresh the PR — typical run is
  2 flushes + 1 final.
- **Single PR per run-date**: branch `news/translate-briefs-<YYYY-MM-DD>`;
  the same branch is reused across the 3 daily runs on the same date.

---

## 9. Anti-patterns (the validator will catch these)

| Anti-pattern | Why it fails |
|--------------|--------------|
| Copying the English source and changing only the language tag | English fall-through gate |
| Producing a 30-line stub when the source is 150 lines | Length-floor gate |
| Translating `IMF` to `FMI` (Spanish/French) | Fixed-token preservation gate |
| Translating EP adopted-text IDs (`TA-10-2026-0160`) | Fixed-token preservation gate |
| Localising `data-vintage="WEO-April-2026"` to `data-vintage="WEO-abril-2026"` | Fixed-token preservation gate |
| Dropping 3 of 4 `## Section` headings or merging them into prose | Heading-parity gate |
| Omitting a ```` ```mermaid ```` diagram or replacing it with a prose summary | Mermaid block parity gate |
| Reorganising section order | Structural fidelity rule § 3.1 |
| Adding a new section ("Translator's note") | Structural fidelity rule § 3.6 |
| Using machine-translation passthrough without quality review | Manual review / language register checks |

---

## 10. Related references

- `analysis/methodologies/synthesis-methodology.md` § executive-brief — source
  template authoring guide.
- `analysis/templates/executive-brief.md` — source template.
- `analysis/templates/executive-brief-translation-template.md` — empty
  target-language shell.
- `scripts/discover-untranslated-briefs.js` — queue builder.
- `scripts/validate-brief-translations.js` — automated quality gate.
- `.github/workflows/news-translate.md` — workflow that orchestrates the run.
