<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🧩 `analysis/templates/_partials/` — Shared Template Building Blocks

> **🎯 Purpose:** Centralised reusable chunks that are referenced from every
> template under [`analysis/templates/`](../README.md). When a chunk needs to
> change, edit it here once instead of editing 50+ template files.

These partials are **not** standalone artifacts. They are referenced from
templates and from the methodology library (`analysis/methodologies/`) so an
AI agent reading any single template still gets the canonical phrasing for
common contracts (citation pattern, evidence-table shape, IMF authority
callout, AI-instructions block, quality checklist).

## Inventory

| Partial | Purpose | Embedded in |
|---|---|---|
| [`ai-instructions.md`](./ai-instructions.md) | Canonical AI-facing instructions block — Pass-1/Pass-2 contract, depth floor, no placeholders | All 39 mandatory analysis templates |
| [`quality-checklist.md`](./quality-checklist.md) | Canonical 12-item quality checklist used at end of every template | All probabilistic / analytical templates |
| [`citation-pattern.md`](./citation-pattern.md) | Admiralty source grade + Kent/WEP probability + EP MCP citation pattern | Every artifact making external claims |
| [`evidence-table.md`](./evidence-table.md) | Canonical evidence-table column shape (Source · Grade · Confidence · Reference) | Stakeholder, threat, and risk artifacts |
| [`imf-callout.md`](./imf-callout.md) | IMF-as-sole-authoritative-economic-source contract | `economic-context.md` and any artifact citing macro/fiscal data |

## How to use

Templates reference these partials by relative path inside their AI
instructions block, e.g. `<!-- AI: see ../_partials/imf-callout.md -->`.
Agents and reviewers click through to the partial for the canonical
wording — there is no build step that inlines them.

## How to update

1. Edit the partial in place.
2. Run `npm run sync:templates` — the script updates the front-matter
   block in every template (it does **not** rewrite body content, so
   partial edits propagate via the link, not via copy).
3. Commit both the partial change and any front-matter delta in one PR.

## Front-matter contract (drift-guarded)

`scripts/templates/sync-template-frontmatter.js` ensures every template has
a canonical front-matter HTML comment block of the form:

```markdown
<!-- ANALYSIS-TEMPLATE-FRONTMATTER:v1
artifactId: <basename>
methodology: ../methodologies/per-artifact-methodologies.md#<basename>
catalogRow: ../methodologies/artifact-catalog.md
depthFloorBreaking: <number or - >
mermaidType: <type>
partialsDir: ./_partials/
-->
```

`test/unit/template-structure.test.js` fails CI if any template is missing
this block or the AI-instructions block.
