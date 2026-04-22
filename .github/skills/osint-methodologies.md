---
name: osint-methodologies
description: Open source intelligence collection and verification techniques for European Parliament open data via MCP server integration
license: Apache-2.0
---

# 🔍 OSINT Methodologies Skill

## Purpose

Define structured approaches for collecting, validating, and analyzing open source intelligence from European Parliament data sources. Focuses on MCP server integration, data verification techniques, and GDPR-compliant processing of EU public official information for multi-language journalism.

## 🧠 Produced / Consumed Analysis Artifacts

This skill feeds the following per-run artifacts under
`analysis/daily/<run>/` (templates in
[`analysis/templates/`](../../analysis/templates/), rules in
[`per-artifact-methodologies.md`](../../analysis/methodologies/per-artifact-methodologies.md)):

- `documents/document-analysis-index.md` — OSINT document index
- `intelligence/mcp-reliability-audit.md` — source reliability & Admiralty grading
- Source-grade inputs to `synthesis-summary.md`, `deep-analysis.md`, `per-file-political-intelligence.md`

Canonical tradecraft standard:
[`analysis/methodologies/osint-tradecraft-standards.md`](../../analysis/methodologies/osint-tradecraft-standards.md)
(ICD 203 · Admiralty source grades · Kent/WEP probability bands · SAT catalog ·
OSINT ethics). 10-step protocol:
[`ai-driven-analysis-guide.md`](../../analysis/methodologies/ai-driven-analysis-guide.md).

## When to Use

✅ Collecting MEP activity data from European Parliament MCP server
✅ Cross-referencing parliamentary records across multiple data sources
✅ Verifying voting records and legislative document accuracy
✅ Building data pipelines for EU Parliament monitoring
✅ Evaluating source reliability for news article generation
✅ GDPR-compliant processing of public parliamentary data

❌ Classified or restricted intelligence operations
❌ Personal data collection beyond public official capacity
❌ Social media surveillance or private communications monitoring
❌ Covert data gathering from non-public sources

## Core Framework

### OSINT Collection Hierarchy for EU Parliament

```
Priority 1 (Primary Sources — MCP Server):
├── get_meps — MEP profiles, contact info, committee membership
├── get_voting_records — Roll-call votes, positions, results
├── get_plenary_sessions — Session agendas, dates, locations
├── get_committee_info — Committee composition, responsibilities
├── search_documents — Legislative documents, reports, opinions
├── get_parliamentary_questions — Written/oral questions, answers
├── track_legislation — Procedure progress, timeline, status
├── analyze_voting_patterns — Behavioral analysis, group alignment
└── generate_report — Analytical reports, statistics

Priority 2 (Supplementary Open Sources):
├── European Parliament website (europarl.europa.eu)
├── EU Open Data Portal (data.europa.eu)
├── EUR-Lex (legislative texts)
└── Legislative Observatory (OEIL)

Priority 3 (Contextual Sources):
├── Official press releases
├── Committee meeting minutes
└── Published research and analysis
```

### Source Evaluation Matrix (Admiralty System Adapted)

| Reliability | Description | EU Parliament Application |
|-------------|-------------|--------------------------|
| **A — Completely Reliable** | Official EP MCP data, verified roll-call votes | MCP `get_voting_records` results |
| **B — Usually Reliable** | EP official publications, committee reports | MCP `search_documents` results |
| **C — Fairly Reliable** | MEP self-reported data, press releases | MCP `get_meps` profile data |
| **D — Not Usually Reliable** | Secondary analysis, media reports | External contextual sources |
| **E — Unreliable** | Unverified social media, rumors | Never use as sole source |

| Credibility | Description | Verification Method |
|-------------|-------------|-------------------|
| **1 — Confirmed** | Cross-referenced with multiple MCP tools | Multi-tool validation |
| **2 — Probably True** | Consistent with known patterns | Historical comparison |
| **3 — Possibly True** | Plausible but unverified | Flag for confirmation |
| **4 — Doubtful** | Inconsistent with other data | Requires investigation |
| **5 — Improbable** | Contradicts confirmed data | Reject or escalate |

### MCP Data Integration Patterns

#### Standard Collection Pipeline

```javascript
async function collectParliamentaryOSINT(topic, dateRange) {
  // Phase 1: Broad collection
  const [documents, votes, questions] = await Promise.all([
    mcpClient.callTool('search_documents', {
      keyword: topic,
      dateFrom: dateRange.start,
      dateTo: dateRange.end
    }),
    mcpClient.callTool('get_voting_records', {
      topic: topic,
      dateFrom: dateRange.start,
      dateTo: dateRange.end
    }),
    mcpClient.callTool('get_parliamentary_questions', {
      topic: topic,
      dateFrom: dateRange.start,
      dateTo: dateRange.end
    })
  ]);

  // Phase 2: Enrich with MEP details
  const mepIds = extractUniqueMEPIds(documents, votes, questions);
  const mepDetails = await enrichMEPProfiles(mepIds);

  // Phase 3: Cross-reference and validate
  return crossReferenceData({
    documents: validateDocuments(documents),
    votes: validateVotingRecords(votes),
    questions: validateQuestions(questions),
    meps: mepDetails
  });
}
```

#### Data Verification Pattern

```javascript
function verifyVotingRecord(record) {
  const checks = {
    dateValid: isValidSessionDate(record.date),
    totalsConsistent: (record.votesFor + record.votesAgainst
      + record.abstentions) <= 720,
    resultLogical: record.result === determineResult(
      record.votesFor, record.votesAgainst
    ),
    sessionExists: record.sessionId != null,
    topicPresent: record.topic?.length > 0
  };

  const confidence = Object.values(checks)
    .filter(Boolean).length / Object.values(checks).length;

  return { ...record, verified: confidence >= 0.8, confidence, checks };
}
```

### GDPR Compliance for EU Public Official Data

| Data Category | Legal Basis | Processing Rules |
|--------------|-------------|-----------------|
| **Voting records** | Public interest (Art. 6(1)(e)) | Freely processable, public record |
| **MEP contact info** | Legitimate interest (Art. 6(1)(f)) | Official capacity only |
| **Committee membership** | Public interest (Art. 6(1)(e)) | Freely processable |
| **Parliamentary questions** | Public interest (Art. 6(1)(e)) | Freely processable, public record |
| **MEP biographical data** | Legitimate interest (Art. 6(1)(f)) | Proportionality assessment needed |
| **Personal opinions/social** | Consent required (Art. 6(1)(a)) | Do NOT collect without consent |

### Data Quality Checklist

```
For each MCP data point, verify:
□ Temporal accuracy — Does the date match a known plenary session?
□ Structural integrity — Are required fields present and typed correctly?
□ Referential consistency — Do MEP IDs resolve to valid MEP records?
□ Logical consistency — Do vote totals align with known MEP count?
□ Source attribution — Can data be traced to specific EP proceedings?
□ Freshness — Is data within acceptable staleness window (30min cache)?
```

### Collection Workflow

```
1. PLAN: Define intelligence requirements
   └── What question does the news article need to answer?

2. COLLECT: Gather data via MCP tools
   └── Use parallel requests for efficiency

3. PROCESS: Clean and normalize data
   ├── Validate MCP response schemas
   ├── Sanitize strings for HTML rendering
   └── Deduplicate across data sources

4. ANALYZE: Apply analytical frameworks
   ├── Cross-reference voting records with documents
   ├── Identify patterns using statistical methods
   └── Compare with historical baselines

5. PRODUCE: Generate intelligence products
   ├── Multi-language news articles (14 languages)
   ├── Data visualizations and charts
   └── Structured data for static site rendering

6. EVALUATE: Assess collection effectiveness
   ├── Data completeness metrics
   ├── Source reliability tracking
   └── Article accuracy feedback loops
```

### MCP Server Connectivity

```javascript
// MCP communication via JSON-RPC over stdio
const MCP_TOOLS = {
  primary: [
    'get_meps', 'get_voting_records', 'get_plenary_sessions',
    'get_committee_info', 'search_documents',
    'get_parliamentary_questions'
  ],
  analytical: [
    'analyze_voting_patterns', 'track_legislation', 'generate_report'
  ]
};

// Fallback strategy when MCP unavailable
const FALLBACK_PRIORITY = [
  'cached_data',       // Serve stale cache
  'placeholder_data',  // Clearly marked placeholders
  'reduced_output'     // Generate article with available data only
];
```

## ISMS Compliance Mapping

| ISO 27001 Control | NIST CSF | CIS Control | Implementation |
|-------------------|----------|-------------|----------------|
| A.5.12 Classification | GV.OC-1 | CIS-3.1 | PUBLIC classification for EP data |
| A.5.34 Privacy/PII | GV.OC-3 | CIS-3.7 | GDPR-compliant MEP data processing |
| A.8.10 Information deletion | PR.DS-3 | CIS-3.4 | Cache TTL and data retention |
| A.8.25 Secure SDLC | PR.IP-2 | CIS-16 | Validated data pipelines |
| A.8.28 Secure coding | PR.DS-6 | CIS-16.12 | Input validation for MCP responses |

## Hack23 ISMS Policy References

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md)

## References

- [European Parliament Open Data Portal](https://data.europarl.europa.eu/)
- [European Parliament MCP Server](https://github.com/Hack23/European-Parliament-MCP-Server)
- [GDPR — Official Text](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [EU Open Data Directive](https://eur-lex.europa.eu/eli/dir/2019/1024/oj)
- [NATO OSINT Handbook](https://www.nato.int/cps/en/natohq/topics_68372.htm)

---

## 🧠 AI-First Quality Integration

> **All outputs from this skill MUST follow the [AI-First Quality Principle](ai-first-quality.md)**:
> - **Mandatory 2-pass iterative improvement** for all analysis content
> - **Complete read-back** of all output before finalizing
> - **No early completion** — use the FULL allocated time
> - **Quality gates**: ≥80 words/SWOT item, ≥150 words/stakeholder perspective, evidence citations in ≥80% of paragraphs
