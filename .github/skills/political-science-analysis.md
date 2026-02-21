---
name: political-science-analysis
description: Political science frameworks for analyzing EU Parliament MEP behavior, voting patterns, political groups, and legislative procedures
license: Apache-2.0
---

# 🏛️ Political Science Analysis Skill

## Purpose

Provide structured political science frameworks for analyzing European Parliament activity, MEP behavior, political group dynamics, and legislative outcomes. Enables data-driven journalism across 14 EU languages using European Parliament MCP server data.

## When to Use

✅ Analyzing MEP voting patterns and political group cohesion
✅ Evaluating legislative procedure outcomes (ordinary, special, consent)
✅ Comparing political group positions on policy areas
✅ Generating multi-language news articles on EU Parliament activity
✅ Assessing committee influence on legislation
✅ Tracking cross-party coalition building

❌ National parliament analysis (use riksdagsmonitor for Sweden)
❌ European Council or Council of the EU analysis
❌ European Commission internal operations
❌ Non-parliamentary EU bodies

## Core Framework

### EU Parliament Analytical Dimensions

| Dimension | Description | MCP Tool | Key Indicators |
|-----------|-------------|----------|----------------|
| **MEP Behavior** | Individual voting, attendance, questions | `get_meps`, `get_voting_records` | Loyalty rate, attendance %, questions filed |
| **Group Cohesion** | Political group voting alignment | `analyze_voting_patterns` | Cohesion index, dissent rate |
| **Committee Influence** | Committee role in legislation | `get_committee_info` | Reports adopted, amendments accepted |
| **Legislative Outcomes** | Procedure success/failure | `track_legislation` | Pass rate, amendment survival |
| **Plenary Dynamics** | Floor voting and debates | `get_plenary_sessions` | Turnout, vote margins |

### Political Group Analysis Framework

```
EU Parliament Political Groups (10th term):
├── EPP (European People's Party) — Centre-right
├── S&D (Progressive Alliance) — Centre-left
├── Renew Europe — Liberal/centrist
├── Greens/EFA — Green/regionalist
├── ECR (European Conservatives) — Right
├── ID (Identity and Democracy) — Right-wing
├── The Left (GUE/NGL) — Left-wing
└── NI (Non-Inscritti) — Non-attached
```

### Comparative Politics Decision Tree

```
1. Define research question
   ├── MEP-level → Individual behavior analysis
   │   ├── Voting loyalty → compare with group median
   │   ├── Activity level → questions, reports, speeches
   │   └── Committee work → rapporteurships, shadows
   ├── Group-level → Cohesion and coalition analysis
   │   ├── Internal cohesion → Rice index calculation
   │   ├── Coalition patterns → cross-group voting alignment
   │   └── Policy positioning → left-right, EU integration axes
   └── Procedure-level → Legislative outcome analysis
       ├── Success factors → committee support, group backing
       ├── Amendment analysis → survival rate through readings
       └── Inter-institutional → Parliament vs Council positions
```

### Political Behavior Metrics

#### MEP Activity Score

```javascript
function calculateMEPActivityScore(mepData) {
  const weights = {
    votingAttendance: 0.25,
    questionsAsked: 0.20,
    reportsAuthored: 0.20,
    speechesMade: 0.15,
    amendmentsTabled: 0.20
  };

  return Object.entries(weights).reduce((score, [metric, weight]) => {
    const normalized = normalizeMetric(mepData[metric], metric);
    return score + (normalized * weight);
  }, 0);
}
```

#### Group Cohesion Index (Rice Index)

```javascript
function calculateRiceIndex(votingRecord) {
  const { votesFor, votesAgainst, abstentions } = votingRecord;
  const total = votesFor + votesAgainst + abstentions;
  if (total === 0) return 0;
  const maxVote = Math.max(votesFor, votesAgainst, abstentions);
  return (maxVote - (total - maxVote)) / total;
}
```

### EU Legislative Procedures

| Procedure | Treaty Basis | Parliament Role | Analysis Focus |
|-----------|-------------|-----------------|----------------|
| **Ordinary (COD)** | Art. 294 TFEU | Co-legislator | Amendment power, trilogue outcomes |
| **Consultation (CNS)** | Various TFEU | Advisory | Opinion influence on Council |
| **Consent (APP)** | Art. 218 TFEU | Veto power | Accept/reject dynamics |
| **Budget (BUD)** | Art. 314 TFEU | Co-authority | Allocation priorities |

### MCP Data Integration Pattern

```javascript
async function analyzePoliticalGroup(groupId, dateRange) {
  const [meps, votes, sessions] = await Promise.all([
    mcpClient.callTool('get_meps', { group: groupId, active: true }),
    mcpClient.callTool('get_voting_records', {
      dateFrom: dateRange.start,
      dateTo: dateRange.end
    }),
    mcpClient.callTool('get_plenary_sessions', {
      dateFrom: dateRange.start,
      dateTo: dateRange.end
    })
  ]);

  return {
    memberCount: meps.length,
    cohesionIndex: calculateGroupCohesion(meps, votes),
    attendanceRate: calculateAttendance(meps, sessions),
    keyVotes: identifyKeyVotes(votes, groupId)
  };
}
```

### Multi-Language Journalism Application

When generating articles about political analysis:

| Language | Political Term Considerations |
|----------|------------------------------|
| EN/FR/DE | Standard EU terminology |
| ES/IT/PT | Romance language political traditions |
| PL/RO | Post-enlargement political context |
| SV/DA/FI | Nordic political culture references |
| EL | Greek political terminology specifics |
| NL | Benelux consensus-building context |
| HU | Central European political framing |

### Article Generation Checklist

- [ ] Source all claims from MCP data (voting records, MEP profiles)
- [ ] Include quantitative metrics (cohesion %, attendance rates)
- [ ] Provide political group context for each MEP mentioned
- [ ] Compare with historical baselines where available
- [ ] Adapt political framing for target language audience
- [ ] Cross-reference committee and plenary data
- [ ] Verify data freshness (check session dates)

## ISMS Compliance Mapping

| ISO 27001 Control | NIST CSF | CIS Control | Implementation |
|-------------------|----------|-------------|----------------|
| A.5.12 Classification | GV.OC-1 | CIS-3.1 | Public parliamentary data classification |
| A.8.10 Information deletion | PR.DS-3 | CIS-3.4 | Data retention for analysis artifacts |
| A.8.25 Secure SDLC | PR.IP-2 | CIS-16 | Validated analytical pipelines |
| A.5.34 Privacy | GV.OC-3 | CIS-3.7 | GDPR compliance for MEP public data |

## Hack23 ISMS Policy References

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md)

## References

- [European Parliament Rules of Procedure](https://www.europarl.europa.eu/rules)
- [EU Legislative Procedures](https://www.europarl.europa.eu/about-parliament/en/powers-and-procedures)
- [European Parliament MCP Server](https://github.com/Hack23/European-Parliament-MCP-Server)
- [EU Parliament Open Data Portal](https://data.europarl.europa.eu/)
- [VoteWatch Europe Methodology](https://www.votewatch.eu/)
