---
name: electoral-analysis
description: EU Parliament electoral analysis for seat distribution, political group formation, and voter engagement across 27 member states
license: Apache-2.0
---

# 🗳️ Electoral Analysis Skill

## Purpose

Provide structured frameworks for analyzing European Parliament elections, including seat distribution across 27 member states, political group formation dynamics, Spitzenkandidaten process, and electoral participation trends. Supports evidence-based journalism on democratic engagement in the EU.

## When to Use

✅ Analyzing EU Parliament election results and seat allocations
✅ Tracking political group formation after elections
✅ Assessing Spitzenkandidaten process and Commission president selection
✅ Comparing electoral participation across member states
✅ Generating multi-language election coverage articles
✅ Evaluating proportional representation outcomes

❌ National parliament elections (use country-specific tools)
❌ Predicting future election outcomes without data
❌ Partisan advocacy or campaigning
❌ Analysis outside EU Parliament electoral scope

## 🧠 Produced / Consumed Analysis Artifacts

- `existing/voting-patterns.md` — plenary vote outcomes
- `intelligence/historical-baseline.md` — cross-term electoral comparisons
- `classification/forces-analysis.md` — group seat balance
- Inputs to `synthesis-summary.md`

Protocol: [`ai-driven-analysis-guide.md`](../../analysis/methodologies/ai-driven-analysis-guide.md). Catalog: [`artifact-catalog.md`](../../analysis/methodologies/artifact-catalog.md).

## Core Framework

### EU Parliament Electoral System

The European Parliament uses proportional representation with national seat allocations based on degressive proportionality (Treaty of Lisbon, Art. 14 TEU).

```
Key Parameters:
- Total seats: 720 (2024-2029 term)
- Minimum per state: 6 seats (e.g., Malta, Luxembourg, Cyprus)
- Maximum per state: 96 seats (Germany)
- Election cycle: 5-year terms
- Electoral threshold: Varies by member state (0-5%)
- Voting age: 16-18 depending on member state
```

### Seat Distribution Analysis

```javascript
/**
 * Analyze seat distribution by country and political group.
 * Uses MCP get_meps to retrieve current composition.
 *
 * @param {string} country - ISO 3166-1 alpha-2 code
 * @returns {Promise<Object>} Seat distribution breakdown
 */
async function analyzeCountrySeats(country) {
  const meps = await mcpClient.callTool('get_meps', {
    country,
    active: true,
    limit: 100
  });

  const byGroup = {};
  for (const mep of meps) {
    const group = mep.politicalGroup || 'NI';
    byGroup[group] = (byGroup[group] || 0) + 1;
  }

  return {
    country,
    totalSeats: meps.length,
    distribution: byGroup,
    dominantGroup: Object.entries(byGroup)
      .sort(([, a], [, b]) => b - a)[0]?.[0]
  };
}
```

### Political Group Formation Decision Tree

```
After EU elections:
│
├─ National parties receive seats via PR
│  └─ MEPs form/join political groups
│
├─ Minimum group requirements:
│  └─ 23 MEPs from at least 7 member states
│
├─ Group formation timeline:
│  ├─ Election day → Results certified
│  ├─ 2-4 weeks → Group negotiations
│  ├─ Constitutive session → Groups declared
│  └─ Committee seats allocated proportionally (D'Hondt)
│
└─ Non-attached (NI):
   └─ MEPs not meeting group requirements
```

### Current Political Groups (10th Parliament)

| Group | Abbreviation | Political Family |
|-------|-------------|-----------------|
| European People's Party | EPP | Centre-right |
| Progressive Alliance of S&D | S&D | Centre-left |
| Renew Europe | RE | Liberal |
| Greens/European Free Alliance | Greens/EFA | Green/Regionalist |
| European Conservatives and Reformists | ECR | Conservative |
| Identity and Democracy | ID | Right-wing |
| The Left in the EP | GUE/NGL | Left-wing |
| Patriots for Europe | PfE | National-conservative |
| Europe of Sovereign Nations | ESN | Sovereigntist |
| Non-attached | NI | Various |

### Spitzenkandidaten Process Analysis

```
Commission President Selection Flow:
│
├─ 1. Political groups nominate lead candidates
│     └─ Each group's Spitzenkandidat campaigns EU-wide
│
├─ 2. Elections held across 27 member states
│     └─ Largest group traditionally claims presidency
│
├─ 3. European Council proposes candidate (QMV)
│     └─ Must "take into account" election results (Art. 17.7 TEU)
│
├─ 4. Parliament votes (absolute majority: 361/720)
│     └─ Coalition building across groups required
│
└─ 5. Commission formation
      └─ Each member state nominates a Commissioner
```

### Electoral Participation Metrics

```javascript
/**
 * Assess voter turnout trends across member states.
 *
 * @param {Array<Object>} electionData - Historical turnout data
 * @returns {Object} Participation analysis
 */
function analyzeParticipation(electionData) {
  const metrics = {
    euAverage: calculateMean(electionData.map(d => d.turnout)),
    highestTurnout: findMax(electionData, 'turnout'),
    lowestTurnout: findMin(electionData, 'turnout'),
    trendDirection: calculateTrend(electionData),
    compulsoryVoting: electionData
      .filter(d => d.compulsory)
      .map(d => d.country)
  };
  return metrics;
}
```

### Turnout Analysis by Region

```
Member states with compulsory voting:
  Belgium, Luxembourg, Greece (higher baseline turnout)

Typical turnout ranges:
  High (>60%): Belgium, Luxembourg, Germany, Austria
  Medium (40-60%): France, Spain, Italy, Netherlands
  Low (<40%): Slovakia, Croatia, Czech Republic, Slovenia

Factors affecting turnout:
  - Concurrent national/local elections
  - Electoral threshold visibility
  - EU salience in national discourse
  - Voting age (16 in Austria, Belgium, Germany, Malta)
```

### Coalition Analysis Framework

```
Majority coalition scenarios (361/720 needed):

Scenario 1 — Grand Coalition:
  EPP + S&D + RE = traditional majority
  Assessment: Check group sizes, policy overlap

Scenario 2 — Centre-Right:
  EPP + ECR + RE = conservative majority
  Assessment: Evaluate ECR compatibility, red lines

Scenario 3 — Broad Centre:
  EPP + S&D + RE + Greens/EFA = supermajority
  Assessment: Policy dilution risk, Green demands

Scenario 4 — Issue-Based:
  Variable coalitions per legislative dossier
  Assessment: Use voting pattern analysis per topic
```

### MCP Integration for Electoral Data

```javascript
// Retrieve full Parliament composition
const allMeps = await mcpClient.callTool('get_meps', {
  active: true,
  limit: 100
});

// Generate country-level report
const report = await mcpClient.callTool('generate_report', {
  reportType: 'VOTING_STATISTICS',
  dateFrom: '2024-07-16',
  dateTo: '2025-01-01'
});
```

### Journalism Application Checklist

```
□ Verify seat counts against official EP sources
□ Include turnout context for any seat distribution analysis
□ Note coalition arithmetic when discussing majorities
□ Mention Spitzenkandidaten outcome if discussing Commission
□ Compare with previous term composition
□ Provide multi-language article variants for affected states
□ Use gender-balanced language in all 14 languages
□ Cite MCP data sources transparently
```

## ISMS Compliance Mapping

| Framework | Control | Application |
|-----------|---------|-------------|
| ISO 27001 | A.5.1 | Electoral data classification (PUBLIC) |
| ISO 27001 | A.8.10 | Data deletion after electoral cycle analysis |
| NIST CSF | ID.AM-5 | Asset management for electoral datasets |
| NIST CSF | PR.DS-1 | Data-at-rest protection for cached results |
| CIS Controls | v8.1-3.1 | Data inventory for electoral data sources |
| GDPR | Art. 6(1)(e) | Public interest basis for electoral analysis |

## Hack23 ISMS Policy References

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) — Data classification for electoral content
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md) — All electoral data treated as PUBLIC
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md) — AI-assisted analysis transparency requirements
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) — Open data usage compliance

## References

- [European Parliament: How elections work](https://www.europarl.europa.eu/about-parliament/en/in-the-past/previous-elections)
- [EU Parliament MCP Server](https://github.com/Hack23/European-Parliament-MCP-Server)
- [Treaty on European Union, Art. 14 & 17](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:12012M/TXT)
- [EU Open Data Portal — Elections](https://data.europa.eu/en)

---

## 🧠 AI-First Quality Integration

> **All outputs from this skill MUST follow the [AI-First Quality Principle](ai-first-quality.md)**:
> - **Mandatory 2-pass iterative improvement** for all analysis content
> - **Complete read-back** of all output before finalizing
> - **No early completion** — use the FULL allocated time
> - **Quality gates**: ≥80 words/SWOT item, ≥150 words/stakeholder perspective, evidence citations in ≥80% of paragraphs
