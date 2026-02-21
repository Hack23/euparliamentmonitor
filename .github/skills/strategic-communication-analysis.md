---
name: strategic-communication-analysis
description: EU Parliament communication analysis for narrative framing, media bias detection, and multi-language discourse assessment
license: Apache-2.0
---

# 📡 Strategic Communication Analysis Skill

## Purpose

Provide frameworks for analyzing communication strategies within the European Parliament, including narrative framing in debates, media bias detection, parliamentary question discourse analysis, and multi-language messaging coordination. Supports high-quality, balanced EU affairs journalism.

## When to Use

✅ Detecting narrative framing in EU Parliament debates and resolutions
✅ Identifying media bias in EU political coverage
✅ Analyzing parliamentary question rhetoric and intent
✅ Assessing MEP communication effectiveness across channels
✅ Mapping information ecosystems around EU legislative topics
✅ Coordinating multi-language content with consistent messaging

❌ Creating propaganda or biased narratives
❌ Manipulating public opinion
❌ Analyzing classified or non-public communications
❌ Personal social media monitoring of MEPs beyond official capacity

## Core Framework

### Narrative Framing Analysis

#### Framing Detection in EU Parliament Debates

```
Framing Categories in EU Parliament:
│
├─ Economic Frame
│  └─ Focus: costs, competitiveness, jobs, growth
│  └─ Indicators: GDP references, impact assessments, SME mentions
│
├─ Rights Frame
│  └─ Focus: fundamental rights, freedoms, democracy
│  └─ Indicators: Charter references, ECHR citations, rule of law
│
├─ Security Frame
│  └─ Focus: threats, protection, resilience, sovereignty
│  └─ Indicators: Defence language, border mentions, strategic autonomy
│
├─ Environmental Frame
│  └─ Focus: climate, sustainability, biodiversity
│  └─ Indicators: Green Deal references, emission targets, IPCC citations
│
├─ Social Frame
│  └─ Focus: equality, inclusion, welfare, workers
│  └─ Indicators: Social pillar references, poverty statistics, gender
│
└─ Sovereignty Frame
   └─ Focus: subsidiarity, national competence, overreach
   └─ Indicators: Treaty base challenges, proportionality objections
```

#### Frame Detection Algorithm

```javascript
/**
 * Detect dominant framing in a parliamentary document.
 * Uses MCP search_documents to retrieve document text.
 *
 * @param {string} keyword - Document search keyword
 * @param {string} documentType - Type filter (RESOLUTION, REPORT, etc.)
 * @returns {Promise<Object>} Frame analysis results
 */
async function detectFraming(keyword, documentType) {
  const documents = await mcpClient.callTool('search_documents', {
    keyword,
    documentType,
    limit: 10
  });

  const frameIndicators = {
    economic: ['competitiveness', 'GDP', 'market', 'trade', 'budget', 'cost'],
    rights: ['fundamental rights', 'Charter', 'democracy', 'freedom', 'rule of law'],
    security: ['security', 'defence', 'threat', 'resilience', 'sovereignty'],
    environmental: ['climate', 'Green Deal', 'emission', 'biodiversity', 'sustainable'],
    social: ['equality', 'workers', 'inclusion', 'poverty', 'social pillar'],
    sovereignty: ['subsidiarity', 'national competence', 'proportionality']
  };

  return documents.map(doc => ({
    title: doc.title,
    dominantFrame: identifyDominantFrame(doc.text, frameIndicators),
    frameDistribution: calculateFrameDistribution(doc.text, frameIndicators)
  }));
}
```

### Media Bias Detection

#### EU Political Coverage Bias Taxonomy

```
Bias Types in EU Parliament Reporting:
│
├─ Selection Bias
│  ├─ Which votes/debates are covered?
│  ├─ Which MEPs are quoted?
│  └─ Detection: Compare coverage vs full agenda
│
├─ Framing Bias
│  ├─ How is the legislative outcome presented?
│  ├─ Winner/loser narrative vs process analysis
│  └─ Detection: Frame analysis (see above)
│
├─ National Bias
│  ├─ Overemphasis on own country's MEPs
│  ├─ National interest perspective on EU legislation
│  └─ Detection: Country mention frequency vs relevance
│
├─ Ideological Bias
│  ├─ Favorable coverage of aligned political groups
│  ├─ Asymmetric criticism patterns
│  └─ Detection: Sentiment analysis by political group
│
├─ Complexity Bias
│  ├─ Oversimplification of legislative procedures
│  ├─ Ignoring committee stage, focusing only on plenary
│  └─ Detection: Procedure stage coverage completeness
│
└─ Temporal Bias
   ├─ Event-driven coverage ignoring ongoing processes
   ├─ Ignoring trilogues and inter-institutional work
   └─ Detection: Coverage continuity across procedure stages
```

#### Bias Assessment Scorecard

```
For each news article about EU Parliament:
                                           Score (1-5)
1. Source diversity                          ___
   (Multiple political groups cited?)
2. Procedure completeness                    ___
   (Committee + plenary + trilogue context?)
3. National balance                          ___
   (Beyond single-country perspective?)
4. Framing transparency                      ___
   (Acknowledged competing interpretations?)
5. Data citation                             ___
   (Voting records, attendance, sources?)

Total: ___/25
Rating: 20-25 Excellent | 15-19 Good | 10-14 Fair | <10 Poor
```

### Parliamentary Question Discourse Analysis

```javascript
/**
 * Analyze parliamentary question patterns for communication strategy.
 * Uses MCP get_parliamentary_questions.
 *
 * @param {string} topic - Topic to analyze
 * @param {string} dateFrom - Start date
 * @param {string} dateTo - End date
 * @returns {Promise<Object>} Discourse analysis
 */
async function analyzeQuestionDiscourse(topic, dateFrom, dateTo) {
  const questions = await mcpClient.callTool('get_parliamentary_questions', {
    topic,
    dateFrom,
    dateTo,
    limit: 50
  });

  return {
    topic,
    totalQuestions: questions.length,
    byType: groupBy(questions, 'type'),
    byStatus: groupBy(questions, 'status'),
    topAuthors: countAuthors(questions).slice(0, 10),
    rhetoricalPatterns: {
      informationSeeking: questions.filter(q => isInformationSeeking(q)),
      accountability: questions.filter(q => isAccountability(q)),
      agenda: questions.filter(q => isAgendaSetting(q)),
      signaling: questions.filter(q => isSignaling(q))
    }
  };
}
```

#### Question Intent Classification

```
Parliamentary Question Intents:
│
├─ Information Seeking
│  └─ Genuine request for Commission/Council data
│  └─ Indicators: Specific data requests, statistics, timelines
│
├─ Accountability
│  └─ Holding Commission/Council to account
│  └─ Indicators: "Why has the Commission not...", deadline references
│
├─ Agenda Setting
│  └─ Raising new topics for public discourse
│  └─ Indicators: Novel topics, media timing, press release follow-up
│
├─ Position Signaling
│  └─ Declaring stance for political group or constituents
│  └─ Indicators: Rhetorical questions, value-laden language
│
└─ Constituency Service
   └─ Addressing national/regional concerns at EU level
   └─ Indicators: Geographic specificity, local impact references
```

### MEP Communication Effectiveness

```
Effectiveness Dimensions:
│
├─ Parliamentary Influence
│  ├─ Rapporteurships secured
│  ├─ Amendments adopted
│  ├─ Questions generating Commission action
│  └─ MCP: get_mep_details, generate_report(MEP_ACTIVITY)
│
├─ Cross-Group Reach
│  ├─ Co-signatures from other groups
│  ├─ Cross-group amendment support
│  ├─ Coalition building success
│  └─ MCP: analyze_voting_patterns
│
├─ Media Visibility
│  ├─ Press conference frequency
│  ├─ News article mentions
│  ├─ Multi-language coverage
│  └─ Source: External media monitoring
│
└─ Constituent Engagement
   ├─ Question volume on national issues
   ├─ Committee attendance on relevant dossiers
   └─ MCP: get_parliamentary_questions, get_mep_details
```

### Multi-Language Messaging Analysis

```javascript
const SUPPORTED_LANGUAGES = [
  'en', 'fr', 'de', 'es', 'it', 'pt',
  'nl', 'el', 'pl', 'ro', 'sv', 'da', 'fi', 'cs'
];

/**
 * Analyze messaging consistency across languages.
 *
 * @param {string} topic - Topic keyword
 * @param {Array<string>} groups - Political groups to compare
 * @returns {Object} Multi-language messaging analysis
 */
function analyzeMultiLanguageMessaging(topic, groups) {
  return {
    topic,
    consistency: {
      keyTermTranslation: 'Check EU terminology consistency across languages',
      framingAlignment: 'Verify same frame used in all language versions',
      culturalAdaptation: 'Identify culturally adapted messaging',
      factualConsistency: 'Ensure statistics match across all versions'
    },
    qualityChecks: [
      'Official EU terminology (IATE database) used consistently',
      'No conflicting claims across language versions',
      'Cultural references appropriate per target audience',
      'Legal terminology matches EU legal language conventions'
    ]
  };
}
```

### Information Ecosystem Mapping

```
EU Affairs Information Ecosystem:
│
├─ Primary Sources
│  ├─ European Parliament official publications
│  ├─ Committee reports and opinions
│  ├─ Plenary minutes and voting records
│  └─ MCP Server (authoritative data)
│
├─ Secondary Sources
│  ├─ EU-focused media (Euractiv, Politico Europe, EUobserver)
│  ├─ National media EU correspondents
│  ├─ Think tanks (Bruegel, CEPS, EPC)
│  └─ Academic journals on EU politics
│
├─ Institutional Sources
│  ├─ European Commission press releases
│  ├─ Council of the EU conclusions
│  ├─ European Council statements
│  └─ EU Agency publications
│
└─ Civil Society Sources
   ├─ NGO position papers
   ├─ Industry association briefings
   ├─ Trade union communications
   └─ Citizen feedback platforms
```

### Article Quality Framework

```
EU Parliament Monitor Article Standards:
□ Lead with data from MCP (voting records, attendance)
□ Include at least 2 political group perspectives
□ Reference specific articles/recitals when discussing legislation
□ Provide legislative procedure context (OLP stage, timeline)
□ Link to primary EP sources
□ Maintain consistent terminology across 14 language versions
□ Flag opinion vs fact clearly in article structure
□ Include counter-arguments to dominant narrative
```

## ISMS Compliance Mapping

| Framework | Control | Application |
|-----------|---------|-------------|
| ISO 27001 | A.5.1 | Information security for media analysis data |
| ISO 27001 | A.5.10 | Acceptable use of communication monitoring tools |
| NIST CSF | PR.AT-1 | Awareness training for bias detection |
| NIST CSF | DE.CM-7 | Monitoring for disinformation indicators |
| CIS Controls | v8.1-14.1 | Security awareness for media analysis |
| GDPR | Art. 85 | Freedom of expression and journalism exemption |

## Hack23 ISMS Policy References

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) — Secure handling of media analysis
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md) — Public data classification for communications
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md) — AI in discourse and sentiment analysis
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) — Open data usage in journalism

## References

- [European Parliament Multimedia Centre](https://multimedia.europarl.europa.eu/)
- [EU Parliament MCP Server](https://github.com/Hack23/European-Parliament-MCP-Server)
- [IATE — EU Terminology Database](https://iate.europa.eu/)
- [EUR-Lex — EU Law](https://eur-lex.europa.eu/)
- [EU Media Literacy Guidelines](https://digital-strategy.ec.europa.eu/en/policies/media-literacy)
