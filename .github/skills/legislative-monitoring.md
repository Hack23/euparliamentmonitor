---
name: legislative-monitoring
description: EU Parliament legislative procedure monitoring for OLP tracking, trilogue analysis, amendment patterns, and plenary voting
license: Apache-2.0
---

# ⚖️ Legislative Monitoring Skill

## Purpose

Provide comprehensive frameworks for monitoring EU Parliament legislative procedures, including the ordinary legislative procedure (OLP), committee work, amendment tracking, trilogue negotiations, and plenary voting analysis. Enables systematic, data-driven journalism on EU lawmaking using MCP server integration.

## When to Use

✅ Tracking progress of legislation through EU Parliament stages
✅ Analyzing committee rapporteur and shadow rapporteur activity
✅ Monitoring amendment volumes and voting patterns
✅ Following trilogue negotiations and inter-institutional deals
✅ Generating plenary session voting analysis articles
✅ Detecting legislative urgency and fast-track procedures

❌ Tracking national parliament legislation
❌ Monitoring European Court of Justice proceedings
❌ Analyzing international treaty negotiations outside EP scope
❌ Tracking Commission internal decision-making

## Core Framework

### Ordinary Legislative Procedure (OLP) Stages

```
OLP Flow (Art. 294 TFEU):
│
├─ 1. Commission Proposal
│     └─ Legal basis, impact assessment, subsidiarity check
│
├─ 2. First Reading — Parliament
│     ├─ Committee referral (lead + opinion committees)
│     ├─ Rapporteur appointed
│     ├─ Shadow rapporteurs from other groups
│     ├─ Committee amendments + vote
│     └─ Plenary vote on committee report
│
├─ 3. First Reading — Council
│     ├─ Council working party examination
│     ├─ COREPER discussion
│     └─ Council common position adopted
│
├─ 4. Trilogue (informal)
│     ├─ Parliament: rapporteur + shadows + committee chair
│     ├─ Council: Presidency + working party
│     ├─ Commission: mediator role
│     └─ Goal: First-reading agreement (~80% of legislation)
│
├─ 5. Second Reading (if no first-reading agreement)
│     ├─ Parliament: 3-month deadline (extendable by 1 month)
│     ├─ Amendments require absolute majority (361 votes)
│     └─ Council: 3-month deadline
│
├─ 6. Conciliation (if disagreement persists)
│     ├─ Joint committee: equal EP + Council delegations
│     ├─ 6-week deadline (extendable by 2 weeks)
│     └─ Final text or procedure fails
│
└─ 7. Third Reading
      ├─ Parliament: simple majority
      ├─ Council: qualified majority
      └─ Publication in Official Journal → Entry into force
```

### MCP-Powered Legislative Tracking

```javascript
/**
 * Track a legislative procedure through all stages.
 * Uses MCP track_legislation for comprehensive status.
 *
 * @param {string} procedureId - EU procedure reference (e.g., "2024/0001(COD)")
 * @returns {Promise<Object>} Procedure status and timeline
 */
async function trackProcedure(procedureId) {
  const legislation = await mcpClient.callTool('track_legislation', {
    procedureId
  });

  return {
    procedureId,
    title: legislation.title,
    currentStage: legislation.currentStage,
    timeline: legislation.timeline,
    committees: {
      lead: legislation.leadCommittee,
      opinions: legislation.opinionCommittees
    },
    rapporteur: legislation.rapporteur,
    nextSteps: legislation.nextSteps,
    urgency: assessUrgency(legislation)
  };
}
```

### Committee Analysis

#### Rapporteur and Shadow Rapporteur Tracking

```
Committee Report Workflow:
│
├─ Rapporteur Appointed
│  ├─ Allocated by group (points system / D'Hondt)
│  ├─ Drafts committee report with amendments
│  └─ MCP: get_committee_info, get_mep_details
│
├─ Shadow Rapporteurs
│  ├─ One per political group
│  ├─ Negotiate compromise amendments
│  └─ Signal group's position to rapporteur
│
├─ Committee Deliberation
│  ├─ Expert hearings (stakeholder input)
│  ├─ Amendment deadline
│  ├─ Compromise amendment negotiation
│  └─ Committee vote
│
├─ Opinion Committees
│  ├─ Provide formal opinion to lead committee
│  ├─ Own rapporteur and amendments
│  └─ May be associated under Rule 57
│
└─ Plenary Submission
   ├─ Committee report tabled for plenary
   ├─ Plenary amendments possible
   └─ Final vote
```

```javascript
/**
 * Retrieve committee composition and rapporteur details.
 *
 * @param {string} abbreviation - Committee abbreviation (e.g., "ENVI")
 * @returns {Promise<Object>} Committee details
 */
async function getCommitteeDetails(abbreviation) {
  const committee = await mcpClient.callTool('get_committee_info', {
    abbreviation
  });

  return {
    name: committee.name,
    abbreviation,
    chair: committee.chair,
    viceChairs: committee.viceChairs,
    memberCount: committee.members?.length || 0,
    responsibilities: committee.responsibilities,
    meetingSchedule: committee.meetingSchedule
  };
}
```

### Amendment Tracking and Analysis

```
Amendment Classification:
│
├─ Technical Amendments
│  └─ Clarifying language, cross-references, definitions
│  └─ Usually non-controversial, high adoption rate
│
├─ Substantive Amendments
│  └─ Change policy direction or scope
│  └─ Often split along political group lines
│
├─ Compromise Amendments
│  └─ Negotiated between rapporteur and shadows
│  └─ Replace multiple competing amendments
│  └─ High adoption rate when all shadows agree
│
├─ Plenary Amendments
│  └─ Submitted after committee stage
│  └─ Require political group or 1/20 of MEPs
│  └─ Often signal unresolved disagreements
│
└─ Split Vote Requests
   └─ Request to vote on parts of amendment separately
   └─ Indicates contested provisions within an amendment
```

#### Amendment Volume Indicators

```javascript
/**
 * Analyze amendment patterns for a legislative document.
 *
 * @param {string} keyword - Document search term
 * @param {string} committee - Committee abbreviation
 * @returns {Promise<Object>} Amendment analysis
 */
async function analyzeAmendments(keyword, committee) {
  const documents = await mcpClient.callTool('search_documents', {
    keyword,
    committee,
    documentType: 'AMENDMENT',
    limit: 50
  });

  return {
    totalAmendments: documents.length,
    byType: classifyAmendments(documents),
    contentionLevel: assessContention(documents),
    interpretation: interpretAmendmentVolume(documents.length)
  };
}

function interpretAmendmentVolume(count) {
  if (count > 500) return 'HIGHLY_CONTESTED — Major political disagreement';
  if (count > 200) return 'CONTESTED — Significant policy debate';
  if (count > 50) return 'MODERATE — Standard legislative process';
  return 'LOW — Broad consensus or technical file';
}
```

### Trilogue Monitoring

```
Trilogue Analysis Framework:
│
├─ Pre-Trilogue Assessment
│  ├─ Parliament mandate: Committee report + plenary amendments
│  ├─ Council mandate: General approach
│  ├─ Commission position: Original proposal + opinions
│  └─ Gap analysis: Key points of divergence
│
├─ Trilogue Progress Indicators
│  ├─ Number of trilogue rounds (typical: 3-8)
│  ├─ Political trilogues vs technical meetings
│  ├─ Provisional agreement announcements
│  └─ Corrigendum or statement requests
│
├─ Outcome Assessment
│  ├─ Parliament concessions (% of amendments dropped)
│  ├─ Council concessions (changes to general approach)
│  ├─ Commission broker effectiveness
│  └─ Recitals added to explain compromises
│
└─ Post-Trilogue
   ├─ Lawyer-linguist verification (all 24 languages)
   ├─ Committee confirmation vote
   ├─ Plenary confirmation vote
   └─ Council formal adoption
```

### Plenary Session Voting Analysis

```javascript
/**
 * Analyze voting records for a plenary session.
 * Uses MCP get_voting_records and get_plenary_sessions.
 *
 * @param {string} dateFrom - Session start date
 * @param {string} dateTo - Session end date
 * @returns {Promise<Object>} Session voting analysis
 */
async function analyzePlenaryVoting(dateFrom, dateTo) {
  const sessions = await mcpClient.callTool('get_plenary_sessions', {
    dateFrom,
    dateTo,
    limit: 10
  });

  const votes = await mcpClient.callTool('get_voting_records', {
    dateFrom,
    dateTo,
    limit: 100
  });

  return {
    period: { dateFrom, dateTo },
    sessionsCount: sessions.length,
    totalVotes: votes.length,
    adoptedTexts: votes.filter(v => v.result === 'ADOPTED').length,
    rejectedTexts: votes.filter(v => v.result === 'REJECTED').length,
    closestVotes: findClosestVotes(votes, 5),
    highestTurnout: findHighestTurnout(votes),
    groupCohesion: calculateGroupCohesion(votes)
  };
}
```

### Legislative Urgency Detection

```
Urgency Indicators:
│
├─ Formal Urgency Procedure (Rule 163)
│  └─ Parliament votes to apply urgent procedure
│  └─ Skips committee stage, goes directly to plenary
│
├─ Fast-Track Signals
│  ├─ Commission "urgent" label on proposal
│  ├─ Council requesting accelerated timetable
│  ├─ Shortened amendment deadlines
│  └─ Multiple committee meetings per week on single file
│
├─ Political Urgency
│  ├─ External crisis driving legislation (pandemic, war, energy)
│  ├─ End-of-term legislative rush
│  ├─ Presidency priority with expiring mandate
│  └─ Inter-institutional agreement on fast-tracking
│
└─ Detection via MCP
   ├─ track_legislation: Check timeline compression
   ├─ get_plenary_sessions: Unscheduled debate additions
   ├─ search_documents: Urgency procedure motions
   └─ get_voting_records: Roll-call frequency increase
```

### Special Legislative Procedures

```
Non-OLP Procedures:
│
├─ Consent Procedure
│  ├─ Parliament approves or rejects (no amendment)
│  ├─ Used for: International agreements, accession treaties
│  └─ Absolute majority required
│
├─ Consultation Procedure
│  ├─ Parliament gives opinion (non-binding)
│  ├─ Used for: Taxation, competition, some justice matters
│  └─ Council decides alone
│
├─ Budget Procedure
│  ├─ Special rules under Art. 314 TFEU
│  ├─ Conciliation between EP and Council
│  └─ EP has final say on non-compulsory expenditure
│
└─ Own-Initiative Reports
   ├─ Parliament sets own agenda (no legislative power)
   ├─ Used for: Policy recommendations, institutional reform
   └─ Political signaling function
```

### Monitoring Dashboard Metrics

```
Key Legislative Indicators:
□ Active procedures in committee stage
□ Procedures awaiting plenary vote
□ Trilogues in progress
□ Time-to-adoption for completed procedures
□ Amendment adoption rates by committee
□ Cross-group voting patterns on final texts
□ Urgency procedure invocations this term
□ Consent procedure pending files
```

## ISMS Compliance Mapping

| Framework | Control | Application |
|-----------|---------|-------------|
| ISO 27001 | A.5.1 | Legislative data classification (PUBLIC) |
| ISO 27001 | A.8.9 | Configuration management for data pipelines |
| NIST CSF | ID.AM-3 | Data flow mapping for legislative tracking |
| NIST CSF | PR.DS-1 | Data protection for cached legislative data |
| CIS Controls | v8.1-3.1 | Data inventory for EP legislative sources |
| CIS Controls | v8.1-3.14 | Log sensitive data access for audit trail |

## Hack23 ISMS Policy References

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) — Data handling for legislative monitoring
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — Secure coding for MCP integration
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md) — All legislative data treated as PUBLIC
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) — Open data compliance for EU sources

## References

- [European Parliament Legislative Observatory](https://oeil.secure.europarl.europa.eu/)
- [EU Parliament MCP Server](https://github.com/Hack23/European-Parliament-MCP-Server)
- [TFEU Art. 289-294 — Legislative Procedures](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:12012E/TXT)
- [EP Rules of Procedure](https://www.europarl.europa.eu/doceo/document/RULES-9-2024-09-16_EN.html)
- [Codecision and Conciliation Guide](https://www.europarl.europa.eu/code/about/about_en.htm)
