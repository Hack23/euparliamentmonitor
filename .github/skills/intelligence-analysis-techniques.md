---
name: intelligence-analysis-techniques
description: Structured analytic techniques for EU Parliament legislative analysis, competing hypotheses, and data-driven news article generation
license: Apache-2.0
---

# 🧠 Intelligence Analysis Techniques Skill

## Purpose

Apply structured analytic techniques to European Parliament data for producing rigorous, evidence-based news articles. Provides frameworks for evaluating legislative outcomes, assessing policy impacts, and avoiding cognitive biases in EU Parliament journalism across 14 languages.

## When to Use

✅ Evaluating competing explanations for MEP voting behavior
✅ Assessing likelihood of legislative procedure outcomes
✅ Identifying key factors in committee and plenary decisions
✅ Red-teaming news article conclusions before publication
✅ Structuring analysis for complex multi-party negotiations
✅ Generating balanced, evidence-based reporting

❌ Generating opinion pieces or editorial positions
❌ Predicting individual MEP actions without data
❌ Classified intelligence operations
❌ Analysis outside EU Parliament scope

## Core Framework

### Structured Analytic Techniques (SATs) for EU Parliament

#### 1. Analysis of Competing Hypotheses (ACH)

Use when multiple explanations exist for parliamentary behavior.

```
Step 1: Identify all plausible hypotheses
Step 2: List evidence from MCP data (voting records, documents, questions)
Step 3: Assess each hypothesis against each piece of evidence
Step 4: Refine — reject hypotheses inconsistent with evidence
Step 5: Assess sensitivity — how much depends on key assumptions
Step 6: Report conclusions with confidence levels
```

**Example: Why did a political group break cohesion on a vote?**

| Evidence (MCP Source) | H1: Policy disagreement | H2: National interest | H3: Tactical vote | H4: Leadership split |
|----------------------|:-:|:-:|:-:|:-:|
| Voting record split by country (`get_voting_records`) | − | ++ | − | − |
| Pre-vote questions by dissenters (`get_parliamentary_questions`) | + | ++ | − | − |
| Committee position vs plenary vote (`get_committee_info`) | + | − | ++ | − |
| Historical pattern (`analyze_voting_patterns`) | − | + | + | + |

Key: `++` strongly supports, `+` supports, `−` inconsistent, `−−` strongly inconsistent

#### 2. SWOT Analysis for Legislative Proposals

```javascript
function analyzeLegislativeProposal(procedureId) {
  return {
    strengths: [
      'Broad committee support',
      'Cross-party rapporteur backing',
      'Commission alignment'
    ],
    weaknesses: [
      'Limited time for readings',
      'Complex amendment landscape',
      'Member state opposition signals'
    ],
    opportunities: [
      'Political group coalition potential',
      'Public opinion momentum',
      'Presidency priority alignment'
    ],
    threats: [
      'Council blocking minority',
      'Trilogue deadlock risk',
      'Election cycle interference'
    ]
  };
}
```

#### 3. Devil's Advocacy

Challenge the dominant narrative in EU Parliament coverage:

```
1. State the prevailing interpretation
   → "The EPP and S&D will form a grand coalition on this directive"

2. Assemble counter-evidence from MCP data
   → Committee vote splits, dissenting questions, historical precedents

3. Construct the strongest possible counter-argument
   → "National delegations within both groups face domestic pressure"

4. Evaluate: Does the counter-argument hold under scrutiny?
   → Check voting pattern analysis, country-specific breakdowns

5. Integrate findings into balanced reporting
   → Present both interpretations with evidence weights
```

#### 4. Key Assumptions Check

Before publishing any analytical article:

| Assumption | Evidence For | Evidence Against | Confidence |
|-----------|-------------|-----------------|------------|
| Political groups will vote as blocs | Historical cohesion data | Recent dissent on similar topics | Medium |
| Committee position predicts plenary outcome | 85% correlation historically | Notable exceptions exist | High |
| National delegations override group line | Specific country voting patterns | Group loyalty data | Low–Medium |

### Decision Framework for Article Analysis Depth

```
Simple Vote Report (1 SAT):
└── Descriptive statistics + voting breakdown
    → Use: get_voting_records, get_plenary_sessions

Standard Legislative Analysis (2-3 SATs):
├── ACH for explaining vote outcomes
├── Key Assumptions Check
└── Historical comparison
    → Use: analyze_voting_patterns, track_legislation, search_documents

Deep Investigative Analysis (4+ SATs):
├── ACH for competing explanations
├── Devil's Advocacy on dominant narrative
├── SWOT for legislative outlook
├── Red Team analysis for policy impact
└── Sensitivity analysis on key evidence
    → Use: All MCP tools + generate_report
```

### Cognitive Bias Mitigation

| Bias | Risk in EU Parliament Reporting | Mitigation |
|------|-------------------------------|------------|
| **Confirmation bias** | Seeking data that supports initial narrative | ACH forces evaluation of all hypotheses |
| **Anchoring** | Over-relying on first data point found | Start with broad MCP collection, then narrow |
| **Availability bias** | Emphasizing recent or dramatic votes | Historical comparison via `analyze_voting_patterns` |
| **Groupthink** | Following media consensus on outcomes | Devil's Advocacy on prevailing interpretation |
| **Hindsight bias** | Making past outcomes seem obvious | Document predictions before checking results |
| **National bias** | Over-emphasizing home country MEPs | Ensure proportional coverage across 27 member states |

### Confidence Assessment Scale

Use when reporting analytical conclusions:

| Level | Label | Description | Article Language |
|-------|-------|-------------|-----------------|
| **5** | Almost certain | 95%+ probability, multiple confirmed sources | "The data confirms..." |
| **4** | Highly likely | 80-95%, strong evidence with minor gaps | "Evidence strongly suggests..." |
| **3** | Likely | 55-80%, preponderance of evidence | "The data indicates..." |
| **2** | Even chance | 45-55%, balanced evidence | "The outcome remains uncertain..." |
| **1** | Unlikely | Below 45%, limited supporting evidence | "Despite some indications..." |

### MCP-Powered Analysis Template

```javascript
async function structuredAnalysis(topic, dateRange) {
  // Collect evidence
  const evidence = await collectEvidence(topic, dateRange);

  // Generate hypotheses
  const hypotheses = generateHypotheses(evidence);

  // Score hypotheses against evidence (ACH)
  const scored = scoreHypotheses(hypotheses, evidence);

  // Check key assumptions
  const assumptions = identifyAssumptions(scored);
  const validated = await validateAssumptions(assumptions);

  // Apply Devil's Advocacy
  const challenged = challengeTopHypothesis(scored[0], evidence);

  // Produce conclusion with confidence
  return {
    topHypothesis: scored[0],
    confidence: calculateConfidence(scored, validated, challenged),
    evidenceSummary: summarizeEvidence(evidence),
    alternativeExplanations: scored.slice(1, 3),
    keyAssumptions: validated,
    caveats: challenged.validCounterPoints
  };
}
```

### Article Quality Checklist

- [ ] At least 2 competing explanations considered
- [ ] All claims backed by MCP data with tool attribution
- [ ] Confidence level stated for analytical conclusions
- [ ] Key assumptions identified and checked
- [ ] Counter-arguments addressed or acknowledged
- [ ] Historical context provided via `analyze_voting_patterns`
- [ ] No single-source conclusions without corroboration
- [ ] Adapted for cultural context of target language audience

## ISMS Compliance Mapping

| ISO 27001 Control | NIST CSF | CIS Control | Implementation |
|-------------------|----------|-------------|----------------|
| A.5.12 Classification | GV.OC-1 | CIS-3.1 | Analysis products classified as PUBLIC |
| A.8.25 Secure SDLC | PR.IP-2 | CIS-16 | Validated analytical pipelines |
| A.5.34 Privacy | GV.OC-3 | CIS-3.7 | Public official data only |
| A.8.9 Configuration | PR.IP-1 | CIS-4 | Reproducible analysis configurations |

## Hack23 ISMS Policy References

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md)
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)

## References

- [Richards Heuer — Psychology of Intelligence Analysis](https://www.cia.gov/resources/csi/books-monographs/psychology-of-intelligence-analysis-2/)
- [Structured Analytic Techniques for Intelligence Analysis](https://us.sagepub.com/en-us/nam/structured-analytic-techniques-for-intelligence-analysis/book266549)
- [European Parliament MCP Server](https://github.com/Hack23/European-Parliament-MCP-Server)
- [EU Parliament Open Data Portal](https://data.europarl.europa.eu/)

---

## 🧠 AI-First Quality Integration

> **All outputs from this skill MUST follow the [AI-First Quality Principle](ai-first-quality.md)**:
> - **Mandatory 2-pass iterative improvement** for all analysis content
> - **Complete read-back** of all output before finalizing
> - **No early completion** — use the FULL allocated time
> - **Quality gates**: ≥80 words/SWOT item, ≥150 words/stakeholder perspective, evidence citations in ≥80% of paragraphs
