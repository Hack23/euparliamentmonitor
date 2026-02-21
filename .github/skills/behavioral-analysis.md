---
name: behavioral-analysis
description: MEP behavioral analysis for voting loyalty, cognitive biases, leadership profiling, and cross-group collaboration patterns
license: Apache-2.0
---

# 🧠 Behavioral Analysis Skill

## Purpose

Apply behavioral analysis frameworks to understand MEP decision-making patterns, political group loyalty, leadership dynamics, and cross-party collaboration within the European Parliament. Supports data-driven journalism that explains *why* MEPs vote and act as they do.

## When to Use

✅ Analyzing MEP voting behavior relative to political group position
✅ Identifying cognitive biases in EU legislative debates
✅ Profiling committee chairs and rapporteur leadership styles
✅ Detecting cross-group collaboration or conflict patterns
✅ Generating behavioral insights for news articles
✅ Assessing political group internal cohesion

❌ Psychoanalyzing individual MEPs without behavioral data
❌ Making personal character judgments
❌ Predicting individual behavior without evidence
❌ Violating GDPR through excessive personal data processing

## Core Framework

### MEP Voting Behavior Analysis

#### Group Loyalty Score

```javascript
/**
 * Calculate MEP loyalty to political group voting position.
 * Uses MCP analyze_voting_patterns for comprehensive data.
 *
 * @param {string} mepId - MEP identifier
 * @param {string} dateFrom - Analysis start date
 * @param {string} dateTo - Analysis end date
 * @returns {Promise<Object>} Loyalty analysis
 */
async function calculateGroupLoyalty(mepId, dateFrom, dateTo) {
  const patterns = await mcpClient.callTool('analyze_voting_patterns', {
    mepId,
    dateFrom,
    dateTo,
    compareWithGroup: true
  });

  return {
    mepId,
    alignmentRate: patterns.groupAlignment,
    dissents: patterns.dissentingVotes,
    absences: patterns.missedVotes,
    loyaltyCategory: categorize(patterns.groupAlignment)
  };
}

function categorize(alignment) {
  if (alignment >= 0.95) return 'STRONG_LOYALIST';
  if (alignment >= 0.85) return 'RELIABLE';
  if (alignment >= 0.70) return 'MODERATE';
  if (alignment >= 0.50) return 'INDEPENDENT';
  return 'FREQUENT_DISSENTER';
}
```

#### Dissent Pattern Classification

```
MEP Dissent Taxonomy:
│
├─ Policy Dissent
│  └─ MEP disagrees on substance (e.g., environmental vote)
│  └─ Indicator: Consistent across related dossiers
│
├─ National Interest Dissent
│  └─ MEP follows national party line over EU group
│  └─ Indicator: Country-clustered voting splits
│
├─ Strategic Dissent
│  └─ MEP signals position for negotiation leverage
│  └─ Indicator: Dissent on amendments, loyalty on final vote
│
├─ Conscience Dissent
│  └─ Ethical/moral objection (e.g., bioethics, rights)
│  └─ Indicator: Rare, across otherwise loyal MEPs
│
└─ Protest Dissent
   └─ Signaling dissatisfaction with group leadership
   └─ Indicator: Sudden shift, social media amplification
```

### Cognitive Biases in EU Legislative Decision-Making

| Bias | EU Parliament Manifestation | Detection Method |
|------|-----------------------------|------------------|
| **Anchoring** | First draft sets negotiation range | Compare final text to Commission proposal |
| **Groupthink** | Political group suppresses internal debate | Low amendment count from group members |
| **Status Quo** | Resistance to changing existing directives | Voting pattern on revision vs new legislation |
| **Availability** | Recent crises dominate agenda disproportionately | Topic frequency vs long-term trends |
| **Bandwagon** | Following majority to avoid isolation | Late vote-switching towards winning side |
| **Framing** | How rapporteur frames issue shapes outcome | Compare neutral summary vs rapporteur language |
| **Sunk Cost** | Continuing failed legislative paths | Duration analysis of stalled procedures |
| **Confirmation** | Selective use of expert hearings | Witness selection diversity in committees |

### Bias Detection Workflow

```
1. Collect voting data via MCP (get_voting_records)
2. Map expected group position from political manifesto
3. Identify deviations from expected behavior
4. Cross-reference with:
   ├─ Parliamentary questions (get_parliamentary_questions)
   ├─ Committee amendments (search_documents)
   └─ Plenary speech patterns
5. Classify deviation using dissent taxonomy
6. Assess whether cognitive bias explains the pattern
7. Report findings with confidence level
```

### Leadership Style Profiling

#### Committee Chair Profiles

```
Leadership Style Matrix:
│
├─ Consensus Builder
│  ├─ High cross-group amendment acceptance
│  ├─ Extended deliberation timelines
│  └─ Balanced hearing witness selection
│
├─ Partisan Leader
│  ├─ Group-aligned amendment prioritization
│  ├─ Procedural advantage for own group
│  └─ Contested chair decisions
│
├─ Technical Expert
│  ├─ Detailed amendment drafting
│  ├─ Expert hearing emphasis
│  └─ Policy substance over political dynamics
│
└─ Mediator
   ├─ Active trilogue facilitation
   ├─ Compromise amendment brokering
   └─ Cross-institutional relationship building
```

#### Rapporteur Effectiveness Assessment

```javascript
/**
 * Assess rapporteur effectiveness on a legislative file.
 *
 * @param {string} mepId - Rapporteur MEP ID
 * @param {string} procedureId - Legislative procedure reference
 * @returns {Object} Effectiveness metrics
 */
async function assessRapporteur(mepId, procedureId) {
  const mepDetails = await mcpClient.callTool('get_mep_details', {
    id: mepId
  });

  const legislation = await mcpClient.callTool('track_legislation', {
    procedureId
  });

  return {
    rapporteur: mepDetails.name,
    procedure: procedureId,
    metrics: {
      amendmentsAccepted: legislation.amendments?.accepted || 0,
      amendmentsTotal: legislation.amendments?.total || 0,
      timeToFirstReading: calculateDuration(legislation.timeline),
      crossGroupSupport: assessCrossGroupVotes(legislation.votes),
      trilogueOutcome: legislation.trilogueStatus
    }
  };
}
```

### Group Dynamics Analysis

#### Political Group Cohesion Indicators

```
Cohesion Assessment Dimensions:
│
├─ Voting Cohesion (quantitative)
│  ├─ Agreement Index (AI): % voting same way
│  ├─ Rice Index: |%Yes - %No| / (%Yes + %No)
│  └─ MCP source: analyze_voting_patterns
│
├─ Procedural Cohesion (behavioral)
│  ├─ Joint question submissions
│  ├─ Co-signed amendments
│  └─ MCP source: get_parliamentary_questions
│
├─ Narrative Cohesion (discursive)
│  ├─ Consistent messaging across languages
│  ├─ Shared framing of key issues
│  └─ Source: plenary debate analysis
│
└─ Structural Cohesion (organizational)
   ├─ Leadership stability
   ├─ National delegation integration
   └─ Committee coordination
```

### Cross-Group Collaboration Detection

```javascript
/**
 * Identify cross-group voting alliances on specific topics.
 *
 * @param {string} topic - Legislative topic keyword
 * @param {string} dateFrom - Start date
 * @param {string} dateTo - End date
 * @returns {Promise<Object>} Collaboration patterns
 */
async function detectCrossGroupAlliances(topic, dateFrom, dateTo) {
  const votes = await mcpClient.callTool('get_voting_records', {
    topic,
    dateFrom,
    dateTo,
    limit: 50
  });

  const alliances = {};
  for (const vote of votes) {
    const votingBlocs = identifyBlocs(vote.breakdown);
    for (const bloc of votingBlocs) {
      const key = bloc.groups.sort().join('+');
      alliances[key] = (alliances[key] || 0) + 1;
    }
  }

  return {
    topic,
    period: { dateFrom, dateTo },
    frequentAlliances: Object.entries(alliances)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  };
}
```

### Behavioral Indicators for News Articles

```
Article Enrichment Checklist:
□ Include MEP loyalty score when reporting dissent
□ Contextualize voting behavior with group average
□ Note attendance rate for MEPs discussed
□ Flag unusual cross-group alliances
□ Identify rapporteur leadership style context
□ Mention cognitive bias risks in coverage framing
□ Use data visualizations for voting pattern articles
□ Provide historical comparison (previous term behavior)
```

### GDPR-Compliant Behavioral Analysis

```
Data Processing Principles:
├─ Purpose limitation: Only for parliamentary monitoring
├─ Data minimization: Aggregate where possible
├─ Public data basis: Art. 6(1)(e) GDPR (public interest)
├─ No special categories: Avoid inferring political opinions
│  beyond publicly cast votes
├─ Transparency: Cite data sources in articles
└─ Retention: Delete analysis after publication cycle
```

## ISMS Compliance Mapping

| Framework | Control | Application |
|-----------|---------|-------------|
| ISO 27001 | A.5.34 | Privacy and PII protection in MEP analysis |
| ISO 27001 | A.8.11 | Data masking for non-public behavioral data |
| NIST CSF | PR.DS-5 | Protect against data leaks in behavioral profiles |
| NIST CSF | ID.RA-1 | Risk assessment for personal data processing |
| CIS Controls | v8.1-3.12 | Sensitive data handling procedures |
| GDPR | Art. 5 | Data processing principles for MEP analysis |
| GDPR | Art. 6(1)(e) | Public interest legal basis |

## Hack23 ISMS Policy References

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) — Data handling for behavioral analysis
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md) — Classification of MEP behavioral profiles
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md) — Responsible AI in behavioral pattern detection
- [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) — Access restrictions for sensitive analysis

## References

- [European Parliament Rules of Procedure](https://www.europarl.europa.eu/doceo/document/RULES-9-2024-09-16_EN.html)
- [EU Parliament MCP Server](https://github.com/Hack23/European-Parliament-MCP-Server)
- [VoteWatch Europe — Methodology](https://www.votewatch.eu/)
- [GDPR — Regulation (EU) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
