<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# ✅ Canonical Quality Checklist

> **Used as the closing section of every analytical template.** The
> sync script does not append this checklist automatically — templates that
> need it inline the snippet below verbatim. The drift-guard test does not
> require its presence (some templates such as `analysis-index.md` are pure
> indices and do not need a self-grade).

```markdown
## ✅ Self-Quality Checklist (fill before commit)

- [ ] **Depth floor met** — line count ≥ `depthFloorBreaking` from front-matter
- [ ] **Two passes done** — Pass-2 expansion log noted in `methodology-reflection.md`
- [ ] **Evidence on every claim** — every paragraph cites EP MCP, procedure ID, or `data/` path
- [ ] **Admiralty grade on every external source** — A1 (EP plenary record) → F6 (unverified)
- [ ] **WEP band + horizon on every headline judgement** — Kent / ICD 203 phrasing
- [ ] **Confidence (🟢 / 🟡 / 🔴) tracked separately from probability**
- [ ] **No `[REQUIRED]` / `[AI_ANALYSIS_REQUIRED]` / `TBD` / `TODO` placeholders left**
- [ ] **Mandatory Mermaid block(s) present** — type per front-matter `mermaidType`
- [ ] **Reader Briefing / "For Citizens" section present** if listed in `readerBlockRequired`
- [ ] **Cross-references to sibling artifacts** — link to ≥1 other artifact in this run
- [ ] **Methodology link in front-matter resolves** — the per-artifact-methodologies anchor exists
- [ ] **No prompt-injection vectors** in cited evidence
```
