---
name: ai-first-quality
description: AI-First Quality Principle — mandatory iterative improvement, 2-pass analysis/article cycles, and time-budget enforcement for all AI-generated content
license: Apache-2.0
---

# 🧠 AI-First Quality Principle Skill

## Purpose

Codify the **AI-First Quality Principle** — the foundational standard that ALL AI-generated content (analysis, articles, intelligence products, documentation) MUST go through mandatory iterative improvement cycles. One pass is NEVER sufficient. This skill prevents quality regressions by embedding iterative improvement requirements into every agent and workflow.

## When to Use

✅ Every news article generation workflow (breaking, committee, motions, propositions, week-ahead, weekly-review, month-ahead, monthly-review)
✅ Every intelligence analysis product (SWOT, stakeholder, coalition, risk, significance)
✅ Every documentation generation task
✅ Every content review or quality gate evaluation
✅ Any task where AI writes prose, analysis, or structured content

❌ Pure code generation (TypeScript, HTML templates — handled by code quality)
❌ Infrastructure/DevOps tasks with no content output
❌ Data pipeline plumbing with no analytical output

## Core Principle

> **AI-FIRST QUALITY PRINCIPLE**: The AI is the primary author of ALL analysis and article content. TypeScript code only handles HTML structure and data formatting. The AI MUST produce Economist-quality political intelligence — not shallow code-generated summaries. Every piece of AI-generated content MUST go through at least 2 complete improvement iterations before it is considered acceptable.

## 🛑 Mandatory Rules (NON-NEGOTIABLE)

### Rule 1: Iterative Improvement — 2-Pass Minimum

Every piece of content MUST go through at least **2 complete passes**:

| Pass | What Happens | Time Allocation |
|------|-------------|-----------------|
| **Pass 1: Initial Creation** | Write the full content — analysis, prose, SWOT, stakeholders, risk assessments. Apply methodology guides and templates. | ~60% of phase time |
| **Pass 2: Complete Read-Back & Improvement** | Read the ENTIRE output word-by-word. Identify shallow sections, missing evidence, placeholder text, weak analysis. Rewrite and extend every section that doesn't meet quality gates. | ~40% of phase time |

> **⚠️ Pass 1 is a STARTING POINT, not a finished product.** Pass 2 is where quality is achieved. Skipping Pass 2 is a VIOLATION.

### Rule 2: No Early Completion

- If the time budget says "20 minutes for analysis," you MUST work for the FULL 20 minutes.
- Every article-generating workflow has a 60-minute workflow timeout, but the single safe-outputs PR call must still happen on time (target minute ≤ 42, hard deadline minute ≤ 45). Treat minute 0 through ≤ 45 as the full pre-PR execution window: all substantive AI work (Stage A data collection, Stage B 2-pass analysis), Stage C completeness gate, Stage D deterministic render (`npm run generate-article`, ≤ 2 min), validators, and push/snapshot preparation must all complete inside that window so the PR call lands inside the 60-min `timeout-minutes` cap. (Note: the per-workflow `engine.mcp.session-timeout` knob advertised in gh-aw v0.71.3 is currently non-functional — bundled gateway v0.3.1 rejects it; the MCP gateway uses its upstream default session lifetime.)
- The remaining workflow time after the PR call is operational slack for GitHub Actions/job overhead and completion, not extra drafting time and not a period in which required pre-PR steps can be deferred.
- Finishing the pre-PR work early = rushed = low quality = VIOLATION.
- If you finish Pass 2 early, do a **Pass 3** — there is ALWAYS more depth to add.

### Rule 3: Complete Read-Back

After writing ANY content (analysis files, article sections, SWOT items, stakeholder perspectives):
1. **Read the ENTIRE output** — not a sample, not the first paragraph. ALL of it.
2. **Identify gaps** — shallow sections, missing evidence, placeholder text, unsupported claims.
3. **Rewrite and extend** — expand one-liners into full paragraphs, add evidence citations, add confidence levels.
4. **Cross-reference** — ensure analysis files reference each other, articles cite specific EP data.

### Rule 4: Quality Gates (Content Depth)

| Content Type | Minimum Requirement |
|-------------|-------------------|
| SWOT items | ≥80 words per item with evidence and confidence level |
| Stakeholder perspectives | ≥150 words per perspective with evidence chain |
| Risk outlook | ≥200 words with probability-labelled scenarios |
| Analysis files | ≥400 lines with evidence citations in ≥80% of paragraphs |
| Article sections | ≥3 analytical prose paragraphs (not bullet lists) |
| Prose ratio | ≥60% paragraphs (not bullet lists) |
| Chart.js visualizations | ≥1 per article with real EP data |
| IMF economic data (sole authoritative) | Mandatory for every economic dimension in policy articles — SDMX code + vintage + forecast marker + `IMF Source: live` or `cache` backed by `analysis/daily/<date>/<slug>/cache/imf/*.json` |
| World Bank data (non-economic) | Use for health, education, social, environment, demographics, defence, agriculture, innovation, governance |

### Rule 5: The Economist Test

Every paragraph must pass this test:
- Does it explain **WHY**, not just **WHAT**?
- Does it name **specific actors** (MEPs, political groups, committees)?
- Does it cite **specific evidence** (vote counts, document IDs, dates)?
- Does it read like **analytical journalism**, not a data dump?
- Would The Economist publish this paragraph? If not, rewrite it.

### Rule 6: No Shortcuts

- ❌ Never produce first-draft quality and move on
- ❌ Never skip the read-back step
- ❌ Never leave `[AI_ANALYSIS_REQUIRED]` markers in final output
- ❌ Never use placeholder text ("Analysis pending", "TBD", "See data")
- ❌ Never produce bullet-list articles instead of prose
- ❌ Never accept shallow one-sentence SWOT items or stakeholder perspectives
- ❌ Never finish a 60-minute unified workflow before the Stage E safe-outputs PR call (target minute ≤ 42, hard deadline minute ≤ 45)
- ❌ Never cite IMF figures from agent memory. `IMF Source: knowledge-only`
  is an explicit failure marker and Stage C must block publication until a live
  IMF probe or same-day cache backs the economic claim.

### Pass 2 Enforcement

Pass 2 is enforced at three levels so it cannot silently degenerate into "inline checks during Pass 1":

#### 1 · Minute-16 Hard Tripwire (workflow level)

At **minute 16** of every `news-<type>.md` run, the agent MUST stop writing
new Pass 1 artifacts and begin Pass 2 — even if Pass 1 is not complete.
The rationale: an incomplete artifact set with genuine rewrite depth is more
valuable than a full artifact set where Pass 2 was skipped.

#### 2 · `manifest.json.pass2` Audit Log (agent level)

When Pass 2 starts and ends, the agent writes a `pass2` block to
`manifest.json`:

```json
{
  "pass2": {
    "startedAt": "2026-04-22T10:18:00Z",
    "endedAt":   "2026-04-22T10:24:00Z",
    "rewriteCount": 4
  }
}
```

`rewriteCount` is the number of artifacts whose content was changed during
Pass 2. A zero count is only valid when every artifact was already above its
`reference-quality-thresholds.json` floor from a prior same-day run.

#### 3 · Stage C Validator Heuristic (script level)

`scripts/validate-analysis-completeness.js` emits a `WARN
pass2-skipped-heuristic` when:

- `manifest.json` has no `pass2` block, `pass2.rewriteCount === 0`, **or**
  the `pass2` block is malformed (non-integer / negative / missing
  `rewriteCount`, or missing/non-string `startedAt`/`endedAt`), **AND**
- At least one artifact sits at exactly its per-artifact line floor.

A malformed `pass2` block also emits a separate `WARN manifest.pass2 invalid
schema` line listing each invalid field. The heuristic does not block Stage
C (it is a `WARN`, not a `RED`), but it is surfaced in the gate output so
operators can identify runs where Pass 2 discipline broke down or where the
Pass 2 audit-log data is invalid.

#### Prior-Run Merge Rule (re-run exemption)

When a same-day re-run carries forward artifacts already at or above their
floors, `rewriteCount` may legitimately be `0`. In that case the agent should
write `pass2.rewriteCount: 0` and, where helpful for operators, annotate in
`manifest.json` why (e.g. `"pass2Note": "all artifacts above floor from prior
run — no rewrites required"`). The validator does not require `pass2Note` and
will not warn when all artifacts are strictly above their floors.

## Time Budget Enforcement

| Workflow Type | Total Budget | Min Active Work | Stage A (Data) | Stage B (Analysis, 2-pass) | Stage D (Article render) |
|---------------|--------------|-----------------|----------------|----------------------------|--------------------------|
| **Unified `news-<type>.md`** (all 8 article workflows) | 60 min | Until PR call by minute ≤ 45 (target ≤ 42) | ≤ 5 min | ≥ 18 min (Pass 1 ~60% / Pass 2 ~40%) + Stage C completeness gate | ≤ 2 min — deterministic render via `npm run generate-article -- --run "${ANALYSIS_DIR}"` before the single Stage E PR call |
| **`news-translate.md`** (multi-call flush) | 60 min | Until final flush ≤ 45 min | N/A — translation only | N/A | First productive flush at ~minute 14 (≥ 3 translated HTML files), periodic flushes every +3 files, final flush ≤ minute 45 |
| **Analysis-only run** (newsworthiness gate fails inside a unified `news-<type>.md`) | 60 min | Until minute ≤ 45 (4-pass) | ≤ 5 min | Pass 1 + Pass 2 (≥ 18 min) **+ Pass 3 (cross-run diff, ≥ 4 min) + Pass 4 (forward monitoring, ≥ 4 min)** | N/A — no article rendered; PR contains analysis artifacts only |

> **Analysis-only runs MUST NOT short-circuit**. When the newsworthiness gate fails, the time saved by skipping article generation MUST be reinvested into Pass 3 (cross-run diff) and Pass 4 (forward monitoring extension). See § Mandatory Analysis-Only 4-Pass Protocol in this skill. Early exit before the safe-outputs PR call (minute ≤ 45) is a VIOLATION. Reference incident: PR #1223 / run 24541203743 (19-minute agent run).

## Mandatory Analysis-Only 4-Pass Protocol

When a workflow determines that no publishable article should be produced, the run does **not** end after the normal 2-pass analysis cycle. The saved article-writing time MUST be redirected into two additional analysis passes so the output still meets the minimum active-work requirement and produces durable intelligence value.

- **Pass 1 — Initial analysis draft**: collect the evidence, explain why the newsworthiness threshold was not met, and document the core analytical judgment with clear supporting facts.
- **Pass 2 — Full read-through and rewrite**: read the entire analysis word-by-word, strengthen weak sections, add missing context, and remove shallow or placeholder language.
- **Pass 3 — Cross-run diff**: compare the current output with recent related runs, identify what has changed, what has not changed, and whether the signal is strengthening, weakening, or remaining stable.
- **Pass 4 — Forward monitoring extension**: define what to watch next — which upcoming meetings, votes, amendments, speeches, or data releases could change the assessment, and when the topic should be revisited.

Analysis-only runs are compliant only when all four passes are completed and the total active work still reaches the required minimum. Skipping article generation is never a reason for an early exit.

## Tests Policy Alignment (v1.1)

Under the v1.1 scope policy, agentic workflows MAY update `test/` and `e2e/` tests **only when required by an accompanying `src/`/`scripts/` fix**. Both `npm run build` AND `npm run test` MUST pass before PR creation, and both results MUST be reported in the PR body. Standalone test edits, refactors, or weakened assertions remain FORBIDDEN. See [`.github/prompts/00-scope-and-ground-rules.md` § 3 — Conditional Allow — Minor `src/`/`scripts/` Fixes](../prompts/00-scope-and-ground-rules.md#3--conditional-allow--minor-srcscripts-fixes) for the full policy.

## Application Per Agent Role

### News Journalist
- **Pass 1**: Generate article with AI analysis, replace all markers, write prose sections
- **Pass 2**: Read entire article top-to-bottom, verify every section meets quality gates, add IMF economic evidence (sole authoritative) + optional World Bank non-economic cross-refs, verify Chart.js visualization, verify `data-vintage` HTML attribute + forecast markers on every projected number, ensure prose ratio ≥60%

### Intelligence Operative
- **Pass 1**: Write all analysis markdown (SWOT, stakeholder, coalition, risk, significance scoring)
- **Pass 2**: Read every analysis file word-by-word, expand shallow sections, add evidence citations, add confidence levels, cross-reference between files

### Data Pipeline Specialist
- **Pass 1**: Fetch and structure EP data, validate completeness
- **Pass 2**: Review data quality, verify all required fields populated, check for anomalies

### Documentation Architect
- **Pass 1**: Write documentation with proper structure and content
- **Pass 2**: Read entire document, verify accuracy, add missing cross-references, improve clarity

### Quality Engineer
- **Pass 1**: Run validation checks and identify issues
- **Pass 2**: Re-validate all fixes, verify no regressions, confirm all quality gates pass

### All Other Agents
- Apply the 2-pass minimum to ANY content output
- No agent is exempt from the iterative improvement requirement

## Integration with the Prompt Library

This skill is the authoritative source for the Iterative Improvement Protocol (see §§ *Mandatory Rules* — Rules 1–6 — and *Time Budget Enforcement* above). Workflow `.md` files and the prompt library under [`.github/prompts/`](../prompts/README.md) reference these time budgets and quality gates rather than redefining them. This skill ensures consistency across all agents.

The 2-pass / 4-pass protocols in this skill are the agentic-workflow realisation of the **10-step AI-Driven Analysis Guide** ([`analysis/methodologies/ai-driven-analysis-guide.md`](../../analysis/methodologies/ai-driven-analysis-guide.md), Step 9 = *Pass 2 improve everything*). Pass 1 produces the baseline artifact set catalogued in [`analysis/methodologies/artifact-catalog.md`](../../analysis/methodologies/artifact-catalog.md) and backed by the 39 templates in [`analysis/templates/`](../../analysis/templates/); Pass 2 rewrites every one of those artifacts against the per-artifact line floors in [`reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json) and the `### section` rules in [`per-artifact-methodologies.md`](../../analysis/methodologies/per-artifact-methodologies.md). `methodology-reflection.md` is the final artifact of every run (Step 10.5).

## ISMS Compliance

| Framework | Control | Application |
|-----------|---------|-------------|
| ISO 27001 | A.5.10 | Quality assurance of AI-generated content |
| ISO 27001 | A.8.28 | Secure, validated content generation |
| NIST CSF | PR.DS-1 | Data integrity in analytical outputs |
| EU AI Act | Art. 52 | Transparency in AI-generated content quality |

## Related Skills

- **[AI Governance](ai-governance.md)** — EU AI Act compliance, OWASP LLM security
- **[Intelligence Analysis Techniques](intelligence-analysis-techniques.md)** — Structured analytic techniques
- **[European Parliament Data](european-parliament-data.md)** — EP MCP data validation
- **[Code Quality Excellence](code-quality-excellence.md)** — Code-level quality standards

---

**Last Updated**: 2026-04-17
**Version**: 1.1
**Maintained by**: Hack23 AB
