<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<!-- ANALYSIS-TEMPLATE-FRONTMATTER:v1
artifactId: executive-brief-translation-template
methodology: ../methodologies/executive-brief-translation-guide.md
catalogRow: ../methodologies/artifact-catalog.md
depthFloorBreaking: 0
mermaidType: none
partialsDir: ./_partials/
sourceArtifact: ./executive-brief.md
-->

<!-- AI-INSTRUCTIONS:v1
ROLE          : You are the Translation Agent for the news-translate workflow.
                Your output is a `executive-brief_<lang>.md` companion to an
                existing English `executive-brief.md`, consumed verbatim by
                downstream language-tagged article generators.
GUIDE         : Read ../methodologies/executive-brief-translation-guide.md
                BEFORE producing any translation. It is the canonical contract.
TWO-PASS      : Pass 1 (~60% of time) — translate every section once, end to end.
                Pass 2 (~40%) — re-read the entire output, compare against the
                source, expand cramped passages, fix terminology drift, verify
                every FIXED TOKEN is present.
STRUCTURE     : Mirror the source 1:1 — same headings, same list counts, same
                table rows, same blockquote count, same emoji-marker positions.
FIXED TOKENS  : IMF, WEO, World Bank, Fiscal Monitor, data-vintage="WEO-…",
                TA-NN-YYYY-NNNN, YYYY/NNNN(COD|INI|NLE), ISO country/currency
                codes, numerical figures, classification stamps — ALL VERBATIM.
DEPTH FLOOR   : depthFloorBreaking is 0 because the translated artifact's depth
                is dictated by the source brief, not by the validator's line
                floor. Length parity is instead enforced by the 50% byte-floor
                gate in scripts/validate-brief-translations.js.
LENGTH FLOOR  : Translated byte size must be ≥ 50% of source size. For CJK
                this typically lands around 70%; below 50% is auto-rejected.
NO PLACEHOLDERS: [TODO], [TBD], "(to be filled)", or any sentinel from the
                English authoring template — none may appear in the committed
                translation.
VALIDATION    : scripts/validate-brief-translations.js runs in the
                news-translate workflow post-step and after every PR push.
                A failure rejects the file from the PR.
-->

<!--
  WORKFLOW INSTRUCTIONS — DELETE EVERYTHING ABOVE THIS LINE WHEN COMMITTING.
  The committed `executive-brief_<lang>.md` MUST start with the translated `#` title
  (the section below). The frontmatter / instruction blocks are scaffolding for
  the AI translator only.
-->

# {{ TRANSLATED_TITLE }}

**{{ DATE_LABEL }}:** {{ DATE_VALUE }} | **{{ ARTICLE_TYPE_LABEL }}:** {{ ARTICLE_TYPE_VALUE }} | **{{ RUN_LABEL }}:** {{ RUN_VALUE }}
**{{ CLASSIFICATION_LABEL }}:** UNCLASSIFIED // OPEN SOURCE

---

## 🎯 {{ BLUF_HEADING }}

{{ BLUF_PARAGRAPH }}

**{{ CONFIDENCE_LABEL }}: 🟢 {{ CONFIDENCE_LEVEL }}** — {{ CONFIDENCE_RATIONALE }}

---

## 📋 {{ SIXTY_SECOND_READ_HEADING }}

**{{ KEY_FACTS_LABEL }}:**
1. {{ KEY_FACT_1 }}
2. {{ KEY_FACT_2 }}
3. {{ KEY_FACT_3 }}
4. {{ KEY_FACT_4 }}
5. {{ KEY_FACT_5 }}

---

## 🔑 {{ TOP_TRIGGER_EVENTS_HEADING }}

### {{ TRIGGER_LABEL }} 1: {{ TRIGGER_1_TITLE }}
- **{{ SIGNIFICANCE_LABEL }}:** 🟢 {{ SIGNIFICANCE_VALUE_1 }}
- **{{ POLITICAL_CONTEXT_LABEL }}:** {{ POLITICAL_CONTEXT_1 }}
- **{{ KEY_DEMAND_LABEL }}:** {{ KEY_DEMAND_1 }}
- **{{ COALITION_LABEL }}:** {{ COALITION_1 }}

### {{ TRIGGER_LABEL }} 2: {{ TRIGGER_2_TITLE }}
- **{{ SIGNIFICANCE_LABEL }}:** 🟢 {{ SIGNIFICANCE_VALUE_2 }}
- **{{ POLITICAL_CONTEXT_LABEL }}:** {{ POLITICAL_CONTEXT_2 }}
- **{{ KEY_DEMAND_LABEL }}:** {{ KEY_DEMAND_2 }}

### {{ TRIGGER_LABEL }} 3: {{ TRIGGER_3_TITLE }}
- **{{ SIGNIFICANCE_LABEL }}:** 🟡 {{ SIGNIFICANCE_VALUE_3 }}
- **{{ POLITICAL_CONTEXT_LABEL }}:** {{ POLITICAL_CONTEXT_3 }}

<!--
  REPLICATE the remaining sections from the source executive-brief.md exactly:
  - Same heading levels
  - Same list counts (every numbered item preserved)
  - Same number of horizontal rules (`---`)
  - Same number of `> blockquote` lines
  - Same emoji markers in the same positions
  - ALL FIXED TOKENS verbatim (IMF, WEO, TA-IDs, procedure IDs, data-vintage,
    confidence emoji, classification stamps, ISO country/currency codes)

  Then validate locally:
    node scripts/validate-brief-translations.js \
      --paths analysis/daily/<date>/<slug>/executive-brief_<lang>.md
-->
