<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🎨 Mermaid Color Palette — EU Parliament Monitor

> **🎯 Purpose:** Canonical color tokens and per-diagram-type recipes that
> every analysis-template Mermaid block must use so the generated HTML
> renders consistently across the 14 language variants and matches the
> semantic key documented in [`Article-Generation.md`](../../../Article-Generation.md).
>
> The aggregator preserves Mermaid bodies byte-for-byte (only deduplicating
> identical bodies). Whatever color tokens you write here will be visible
> in the rendered article HTML.

---

## 🎯 Semantic color key

Every diagram in an EU Parliament Monitor analysis artifact uses the same
semantic palette so a reader who learned the meaning in one article can
re-apply it everywhere:

| Token | Hex | Semantic meaning |
|---|---|---|
| 🔵 Blue | `#1565C0` | Input, scope, MCP collection, baseline data |
| 🟣 Purple | `#7B1FA2` | Political-intelligence synthesis, AI-authored layer |
| 🟢 Green | `#2E7D32` | Approved, deterministic, deployable, low risk |
| 🟠 Orange | `#FF9800` | Risk, operational caution, generated indexes, medium risk |
| 🔴 Red | `#D32F2F` | Threat, rejection, missing-gate condition, high risk / opposed |
| 🟡 Yellow | `#FFC107` | Gate, note, metadata, pending state |
| 🔷 Light-blue | `#0288D1` | Reference, source Markdown, read-only artifact |
| ⚫ Grey | `#9E9E9E` | Neutral, abstaining, unknown |
| 🌑 Dark | `#1e1e1e` | Background, plot canvas |

Edge / text on dark backgrounds: `#ffffff`. Edge / text on light backgrounds
(`#FFC107`, `#FF9800`): `#000000`.

---

## 🧱 Canonical `%%{init}` block

Every Mermaid block in a Stage-B artifact MUST begin with the canonical
themeVariables initialiser. Copy the line below verbatim — it covers
flowchart / graph, pie, xyChart, gitGraph, quadrantChart, mindmap, gantt,
timeline, sequenceDiagram, and `cScale*` palettes in one shot:

```text
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}%%
```

This single line is a **prefix**, not a wrapper — append the diagram type
(`flowchart TD`, `timeline`, `quadrantChart`, …) on the next line.

---

## 🧩 Per-node coloring (`style`) — `flowchart` / `graph`

Mermaid's themeVariables only theme the chart frame. To convey semantic
meaning per node (e.g. APPROVE vs REJECT, SUPPORT vs OPPOSE, OPEN vs
CLOSED) you must add a `style` line per node **after** the diagram body:

```text
flowchart LR
    A["📥 Input"] --> B["🔬 Analysis"]
    B --> C{"✅ Gate"}
    C -->|Pass| D["🟢 Approve"]
    C -->|Fail| E["🔴 Reject"]

    style A fill:#1565C0,color:#ffffff,stroke:#0A3F7F,stroke-width:2px
    style B fill:#7B1FA2,color:#ffffff,stroke:#4A148C,stroke-width:2px
    style C fill:#FFC107,color:#000000,stroke:#7F6000,stroke-width:2px
    style D fill:#2E7D32,color:#ffffff,stroke:#0F3F00,stroke-width:3px
    style E fill:#D32F2F,color:#ffffff,stroke:#7F0000,stroke-width:3px
```

When you have many nodes that share the same role, prefer `classDef` plus
`class A,B,C role` — the diagram stays readable and the palette stays
consistent:

```text
flowchart LR
    EPP["EPP"] --> COAL["Coalition"]
    SD["S&D"] --> COAL
    RE["Renew"] --> COAL
    GREENS["Greens"] --> SWING["Swing"]
    ECR["ECR"] --> OPP["Opposition"]
    ID["ID"] --> OPP

    classDef supporter fill:#2E7D32,color:#ffffff,stroke:#0F3F00,stroke-width:2px
    classDef swing fill:#FFC107,color:#000000,stroke:#7F6000,stroke-width:2px
    classDef opposition fill:#D32F2F,color:#ffffff,stroke:#7F0000,stroke-width:2px
    classDef outcome fill:#1565C0,color:#ffffff,stroke:#0A3F7F,stroke-width:3px

    class EPP,SD,RE supporter
    class GREENS swing
    class ECR,ID opposition
    class COAL,SWING,OPP outcome
```

---

## 📊 Per-diagram-type recipes

| Diagram type | Color mechanism | Notes |
|---|---|---|
| `flowchart` / `graph` | `style` per node + `classDef` for groups | Use `classDef` when ≥3 nodes share a role |
| `quadrantChart` | `quadrant1Fill` … `quadrant4Fill` in `themeVariables` | The four quadrants map to Blue / Green / Orange / Red by convention |
| `pie` | `pie1` … `pie12` in `themeVariables` | Slices follow the semantic palette in declaration order |
| `xyChart` | `xyChart.plotColorPalette` (comma-separated hexes) | Series follow the palette in declaration order |
| `timeline` | `cScale0` … `cScale7` in `themeVariables` | Timeline sections cycle through `cScale*` |
| `mindmap` | `cScale0` … `cScale7` in `themeVariables` | Branches cycle through `cScale*` |
| `gantt` | `taskBkgColor`, `activeTaskBkgColor`, `doneTaskBkgColor`, `critBkgColor` in `themeVariables` | Default theme tokens already line up with the palette |
| `sequenceDiagram` | `actorBkg`, `actorTextColor`, `signalColor` in `themeVariables` | Actors theme automatically from `primaryColor` |
| `gitGraph` | `git0` … `git3` + `gitBranchLabel0` … in `themeVariables` | Branches map Blue / Green / Orange / Red by convention |

---

## ✅ Drift-guard — Stage-C validator

`scripts/validate-analysis-completeness.js` enforces that every artifact
under `intelligence/`, `classification/`, `risk-scoring/`, or
`threat-assessment/` has at least one Mermaid block. The completeness
gate does **not** validate color tokens — it is the template author's
responsibility to apply the palette above.

The integration test
[`test/integration/article-mermaid-pipeline.test.js`](../../../test/integration/article-mermaid-pipeline.test.js)
asserts mermaid count parity (artifacts → `article.md` → rendered HTML)
**and** that color tokens (`%%{init}`, `classDef`, `style`, `fill:#`)
flow through the pipeline after deduplication: byte-for-byte preserved
in `article.md`, and preserved as text inside `<pre class="mermaid">`
in the rendered HTML (HTML-special characters such as `"` and `>` are
escaped, but every hex token and color directive remains intact).

---

## ♿ Accessibility note

The article HTML wraps every Mermaid block in
`<figure class="mermaid-figure" role="img" aria-label="Mermaid diagram N">`.
The body is preserved as readable text inside `<pre class="mermaid">` so
that:

1. Screen readers announce the diagram label and skip the body.
2. Readers without JavaScript see the source as a code block (color
   tokens are visible in plain text — no information is lost).
3. The vendored client-side `mermaid.esm.min.mjs` upgrades the `<pre>`
   to an SVG diagram with the colors above.

Always include emoji icons in node labels (e.g. `📥 Input`, `🔴 Reject`)
so colorblind readers and screen readers also receive a non-color cue.
