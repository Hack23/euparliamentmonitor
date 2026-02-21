---
name: risk-assessment-frameworks
description: EU Parliament democratic health and political risk assessment for cohesion analysis, legislative bottlenecks, and governance crisis detection
license: Apache-2.0
---

# 🛡️ Risk Assessment Frameworks Skill

## Purpose

Provide structured risk assessment frameworks tailored to the European Parliament, covering democratic health indicators, political group cohesion risks, legislative bottlenecks, MEP engagement risks, polarization measurement, and early warning systems for governance crises. Supports proactive, analytical journalism on EU democratic resilience.

## When to Use

✅ Assessing democratic health of EU Parliament processes
✅ Measuring political group cohesion and fragmentation risk
✅ Identifying legislative bottlenecks and stalled procedures
✅ Evaluating MEP attendance and engagement risks
✅ Detecting cross-group polarization trends
✅ Building early warning indicators for governance crises

❌ Predicting specific political outcomes
❌ Generating alarmist coverage without data support
❌ Assessing risks outside EU Parliament institutional scope
❌ Making normative judgments about democratic legitimacy

## Core Framework

### Democratic Health Assessment

#### EU Parliament Health Index

```
Democratic Health Dimensions:
│
├─ Participation Health
│  ├─ Voter turnout in last election
│  ├─ Plenary attendance rates
│  ├─ Committee meeting attendance
│  ├─ Voting participation rates
│  └─ MCP: get_mep_details, get_plenary_sessions
│
├─ Representation Health
│  ├─ Gender balance (MEPs, committee chairs, rapporteurs)
│  ├─ Geographic diversity in leadership positions
│  ├─ Political group pluralism (effective number of groups)
│  ├─ Age distribution of MEPs
│  └─ MCP: get_meps, get_committee_info
│
├─ Deliberation Health
│  ├─ Committee hearing frequency
│  ├─ Amendment diversity (proposals from multiple groups)
│  ├─ Debate time allocation balance
│  ├─ Parliamentary question volume and response rate
│  └─ MCP: get_parliamentary_questions, search_documents
│
├─ Accountability Health
│  ├─ Roll-call vote frequency (vs show of hands)
│  ├─ Transparency of trilogue outcomes
│  ├─ Declaration of interests compliance
│  ├─ Lobbyist register participation
│  └─ MCP: get_voting_records
│
└─ Output Health
   ├─ Legislative output rate (adopted texts per session)
   ├─ Time-to-adoption for priority files
   ├─ Implementation compliance of adopted legislation
   ├─ Inter-institutional agreement success rate
   └─ MCP: track_legislation, generate_report
```

#### Health Score Calculation

```javascript
/**
 * Calculate EU Parliament democratic health score.
 * Uses multiple MCP data sources for comprehensive assessment.
 *
 * @param {string} dateFrom - Assessment period start
 * @param {string} dateTo - Assessment period end
 * @returns {Promise<Object>} Health assessment
 */
async function assessDemocraticHealth(dateFrom, dateTo) {
  // MCP API pagination limits: max 100 results per call
  const [sessions, votes, questions] = await Promise.all([
    mcpClient.callTool('get_plenary_sessions', { dateFrom, dateTo, limit: 50 }),
    mcpClient.callTool('get_voting_records', { dateFrom, dateTo, limit: 100 }),
    mcpClient.callTool('get_parliamentary_questions', { dateFrom, dateTo, limit: 100 })
  ]);

  return {
    period: { dateFrom, dateTo },
    participation: {
      averageAttendance: calculateAverageAttendance(sessions),
      votingParticipation: calculateVotingRate(votes),
      score: normalizeScore(/* calculation */)
    },
    deliberation: {
      questionVolume: questions.length,
      responseRate: questions.filter(q => q.status === 'ANSWERED').length / questions.length,
      score: normalizeScore(/* calculation */)
    },
    output: {
      adoptedTexts: votes.filter(v => v.result === 'ADOPTED').length,
      rejectedTexts: votes.filter(v => v.result === 'REJECTED').length,
      score: normalizeScore(/* calculation */)
    },
    overallScore: calculateOverallHealth(/* dimensions */)
  };
}
```

### Political Group Cohesion Risk

#### Cohesion Risk Matrix

```
Risk Level Assessment:
│
├─ LOW RISK (Cohesion > 85%)
│  ├─ Group votes together on >85% of roll calls
│  ├─ No significant national delegation splits
│  ├─ Stable leadership, no public dissent
│  └─ Action: Monitor normally
│
├─ MODERATE RISK (Cohesion 70-85%)
│  ├─ Periodic splits on contentious dossiers
│  ├─ One or two national delegations diverging
│  ├─ Leadership challenges discussed internally
│  └─ Action: Increased monitoring, track specific dossiers
│
├─ HIGH RISK (Cohesion 50-70%)
│  ├─ Frequent splits across multiple topics
│  ├─ Multiple national delegations voting independently
│  ├─ Public leadership disputes
│  └─ Action: Close monitoring, assess split probability
│
└─ CRITICAL RISK (Cohesion < 50%)
   ├─ Group effectively non-functional as voting bloc
   ├─ National delegations forming ad hoc alliances
   ├─ Defection or expulsion discussions
   └─ Action: Report on fragmentation, assess group viability
```

```javascript
/**
 * Assess political group cohesion risk using voting patterns.
 *
 * @param {string} groupName - Political group abbreviation
 * @param {string} dateFrom - Analysis period start
 * @param {string} dateTo - Analysis period end
 * @returns {Promise<Object>} Cohesion risk assessment
 */
async function assessGroupCohesion(groupName, dateFrom, dateTo) {
  const meps = await mcpClient.callTool('get_meps', {
    group: groupName,
    active: true,
    limit: 100
  });

  const report = await mcpClient.callTool('generate_report', {
    reportType: 'VOTING_STATISTICS',
    dateFrom,
    dateTo
  });

  return {
    group: groupName,
    memberCount: meps.length,
    countriesRepresented: new Set(meps.map(m => m.country)).size,
    cohesionMetrics: {
      overallCohesion: report.groupCohesion?.[groupName] || null,
      riskLevel: classifyCohesionRisk(report.groupCohesion?.[groupName]),
      splitsIdentified: report.significantSplits || []
    }
  };
}

function classifyCohesionRisk(cohesion) {
  if (cohesion === null) return 'UNKNOWN';
  if (cohesion >= 0.85) return 'LOW';
  if (cohesion >= 0.70) return 'MODERATE';
  if (cohesion >= 0.50) return 'HIGH';
  return 'CRITICAL';
}
```

### Legislative Bottleneck Identification

```
Bottleneck Detection Framework:
│
├─ Procedure Duration Analysis
│  ├─ Normal: 12-18 months (first-reading agreement)
│  ├─ Extended: 18-36 months (second reading needed)
│  ├─ Stalled: >36 months without progress
│  └─ MCP: track_legislation (timeline analysis)
│
├─ Committee Bottleneck Indicators
│  ├─ Rapporteur report delayed beyond deadline
│  ├─ Opinion committees blocking lead committee
│  ├─ High amendment volume (>500) without compromise
│  ├─ Multiple postponements of committee vote
│  └─ MCP: get_committee_info, search_documents
│
├─ Trilogue Bottleneck Indicators
│  ├─ >8 trilogue rounds without provisional agreement
│  ├─ Technical meetings substituting political trilogues
│  ├─ Presidency change without handover continuity
│  ├─ Commission withdrawal threat
│  └─ MCP: track_legislation
│
└─ Plenary Bottleneck Indicators
   ├─ Referral back to committee
   ├─ Split plenary vote (separate parts)
   ├─ Postponement from agenda
   ├─ Rejection of committee mandate for trilogue
   └─ MCP: get_plenary_sessions, get_voting_records
```

### MEP Attendance and Engagement Risk

```javascript
/**
 * Assess MEP engagement risk based on activity data.
 *
 * @param {string} mepId - MEP identifier
 * @returns {Promise<Object>} Engagement risk assessment
 */
async function assessMepEngagement(mepId) {
  const details = await mcpClient.callTool('get_mep_details', { id: mepId });

  const report = await mcpClient.callTool('generate_report', {
    reportType: 'MEP_ACTIVITY',
    subjectId: mepId
  });

  return {
    mep: details.name,
    engagementMetrics: {
      attendanceRate: report.attendance,
      votingParticipation: report.votingRate,
      questionsSubmitted: report.questions,
      committeesActive: report.activeCommittees,
      rapporteurships: report.rapporteurships
    },
    riskLevel: classifyEngagementRisk(report),
    recommendations: generateEngagementRecommendations(report)
  };
}

function classifyEngagementRisk(report) {
  const score = (
    (report.attendance || 0) * 0.3 +
    (report.votingRate || 0) * 0.3 +
    Math.min((report.questions || 0) / 10, 1) * 0.2 +
    Math.min((report.rapporteurships || 0) / 3, 1) * 0.2
  );
  if (score >= 0.8) return 'LOW';
  if (score >= 0.6) return 'MODERATE';
  if (score >= 0.4) return 'HIGH';
  return 'CRITICAL';
}
```

### Cross-Group Polarization Measurement

```
Polarization Assessment Framework:
│
├─ Voting Polarization Index
│  ├─ Measure: Distance between group voting positions
│  ├─ High polarization: Groups vote as opposing blocs
│  ├─ Low polarization: Cross-group coalitions common
│  └─ MCP: get_voting_records, analyze_voting_patterns
│
├─ Rhetorical Polarization
│  ├─ Language intensity in parliamentary questions
│  ├─ Ad hominem or group-targeting rhetoric
│  ├─ Procedural challenge frequency (points of order)
│  └─ MCP: get_parliamentary_questions
│
├─ Structural Polarization
│  ├─ Committee cooperation patterns
│  ├─ Cross-group amendment co-signatures declining
│  ├─ Separate voting lists (no compromise amendments)
│  └─ MCP: search_documents
│
└─ Trend Analysis
   ├─ Compare current term vs previous term
   ├─ Identify accelerating/decelerating polarization
   ├─ Topic-specific polarization hotspots
   └─ MCP: generate_report(VOTING_STATISTICS)
```

### Early Warning System for Governance Crises

```
Crisis Warning Indicators:
│
├─ LEVEL 1 — Watch (Low probability, monitor)
│  ├─ Increased procedural objections in plenary
│  ├─ Political group cohesion drops below 80%
│  ├─ Unusual amendment volumes on institutional files
│  └─ Action: Flag in weekly monitoring report
│
├─ LEVEL 2 — Alert (Moderate probability)
│  ├─ Formal censure motion filed against Commission
│  ├─ Multiple groups demanding extraordinary debate
│  ├─ Art. 7 TEU rule of law procedure advancement
│  ├─ Budget discharge refusal signals
│  └─ Action: Dedicated analysis article, increase monitoring
│
├─ LEVEL 3 — Warning (High probability)
│  ├─ Commission censure vote scheduled
│  ├─ Parliament-Council institutional dispute escalation
│  ├─ Majority coalition collapse on key legislation
│  ├─ President of Parliament facing no-confidence
│  └─ Action: Priority coverage, multi-language alerts
│
└─ LEVEL 4 — Crisis (Active)
   ├─ Commission resignation or censure passed
   ├─ Institutional deadlock halting legislation
   ├─ Democratic backsliding proceedings (Art. 7)
   ├─ Treaty change demands from multiple groups
   └─ Action: Continuous coverage, breaking news in all languages
```

### Risk Reporting Template

```
EU Parliament Risk Assessment Report:
│
├─ Executive Summary
│  └─ Overall risk level with key findings
│
├─ Democratic Health Scorecard
│  ├─ Participation: [score/5]
│  ├─ Representation: [score/5]
│  ├─ Deliberation: [score/5]
│  ├─ Accountability: [score/5]
│  └─ Output: [score/5]
│
├─ Group Cohesion Dashboard
│  └─ Risk level per political group with trend arrows
│
├─ Legislative Pipeline Status
│  ├─ Active procedures: [count]
│  ├─ Bottlenecked procedures: [count]
│  └─ At-risk deadlines: [list]
│
├─ Polarization Trends
│  └─ Topic-specific polarization with historical comparison
│
└─ Early Warning Status
   └─ Current warning level with triggering indicators
```

### Journalism Application

```
Risk-Based Article Prioritization:
□ High cohesion risk → Political group analysis piece
□ Legislative bottleneck → Procedure deep-dive article
□ Low MEP engagement → Accountability reporting
□ Rising polarization → Political dynamics coverage
□ Early warning triggered → Breaking news potential
□ Democratic health decline → Investigative journalism
□ All findings → Include data citations from MCP
□ Multi-language → Prioritize affected member states
```

## ISMS Compliance Mapping

| Framework | Control | Application |
|-----------|---------|-------------|
| ISO 27001 | A.5.7 | Threat intelligence for governance risks |
| ISO 27001 | A.8.8 | Technical vulnerability management of data sources |
| NIST CSF | ID.RA-1 | Risk identification for democratic processes |
| NIST CSF | ID.RA-5 | Risk prioritization for editorial decisions |
| NIST CSF | RS.AN-5 | Incident analysis for governance crises |
| CIS Controls | v8.1-17.2 | Incident response for crisis detection |
| CIS Controls | v8.1-17.3 | Incident reporting for governance events |

## Hack23 ISMS Policy References

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) — Risk assessment methodology alignment
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — Secure coding for risk analysis tools
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md) — Risk assessment output classification
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md) — AI in risk detection and early warning

## References

- [European Parliament Legislative Observatory](https://oeil.secure.europarl.europa.eu/)
- [EU Parliament MCP Server](https://github.com/Hack23/European-Parliament-MCP-Server)
- [Rule of Law Framework — Art. 7 TEU](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:12012M007)
- [EP Rules of Procedure — Censure Motion](https://www.europarl.europa.eu/doceo/document/RULES-9-2024-09-16_EN.html)
- [Democracy Index — Economist Intelligence Unit](https://www.eiu.com/n/campaigns/democracy-index-2024/)
