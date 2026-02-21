---
name: data-science-for-intelligence
description: Statistical analysis, NLP, and network analysis techniques for EU Parliament voting patterns, political trends, and data-driven journalism
license: Apache-2.0
---

# 📊 Data Science for Intelligence Skill

## Purpose

Apply data science methodologies to European Parliament MCP data for producing quantitative, evidence-based journalism. Covers statistical analysis of voting patterns, time series analysis for political trends, network analysis for alliance mapping, and NLP for document analysis across 14 EU languages.

## When to Use

✅ Analyzing MEP voting pattern statistics and group cohesion
✅ Detecting trends in legislative activity over time
✅ Mapping political group alliance networks
✅ Processing multilingual parliamentary documents
✅ Building data visualizations for news articles
✅ Quantitative comparison of MEP or committee performance

❌ Real-time streaming analytics (static site architecture)
❌ Machine learning model training in production
❌ Personal data profiling beyond public parliamentary records
❌ Predictive modeling presented as fact

## Core Framework

### Statistical Analysis of Voting Patterns

#### Cohesion Metrics

```javascript
/**
 * Calculate Agreement Index (AI) for a political group.
 * AI = max(Y, N, A) / (Y + N + A) where Y=for, N=against, A=abstain.
 *
 * @param {Object} groupVotes - Aggregated group voting data
 * @returns {number} Agreement index between 0 and 1
 */
function agreementIndex(groupVotes) {
  const { votesFor, votesAgainst, abstentions } = groupVotes;
  const total = votesFor + votesAgainst + abstentions;
  if (total === 0) return 0;
  return Math.max(votesFor, votesAgainst, abstentions) / total;
}

/**
 * Calculate loyalty rate of an MEP to their political group.
 *
 * @param {string} mepId - MEP identifier
 * @param {Array} votes - Array of vote records
 * @param {Object} groupPositions - Group majority positions per vote
 * @returns {number} Loyalty rate between 0 and 1
 */
function loyaltyRate(mepId, votes, groupPositions) {
  let aligned = 0;
  let total = 0;
  for (const vote of votes) {
    const mepVote = vote.mepPositions?.[mepId];
    const groupPosition = groupPositions[vote.id];
    if (mepVote && groupPosition) {
      total++;
      if (mepVote === groupPosition) aligned++;
    }
  }
  return total > 0 ? aligned / total : 0;
}
```

#### Descriptive Statistics for Reporting

```javascript
function votingStatistics(records) {
  const values = records.map(r => r.margin);
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  return {
    count: n,
    mean: values.reduce((s, v) => s + v, 0) / n,
    median: n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)],
    standardDeviation: Math.sqrt(
      values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1)
    ),
    min: sorted[0],
    max: sorted[n - 1]
  };
}
```

### Time Series Analysis for Political Trends

#### Trend Detection

```javascript
/**
 * Detect trend in MEP activity or voting over time.
 * Uses simple linear regression on time-indexed data.
 *
 * @param {Array<{date: string, value: number}>} dataPoints
 * @returns {Object} Trend analysis result
 */
function detectTrend(dataPoints) {
  const n = dataPoints.length;
  if (n < 3) return { trend: 'insufficient_data', slope: 0 };

  const xs = dataPoints.map((_, i) => i);
  const ys = dataPoints.map(d => d.value);
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = ys.reduce((s, y) => s + y, 0) / n;

  const slope = xs.reduce((s, x, i) =>
    s + (x - meanX) * (ys[i] - meanY), 0
  ) / xs.reduce((s, x) => s + (x - meanX) ** 2, 0);

  return {
    trend: slope > 0.05 ? 'increasing' : slope < -0.05 ? 'decreasing' : 'stable',
    slope: Math.round(slope * 1000) / 1000,
    startValue: ys[0],
    endValue: ys[n - 1],
    periodCovered: {
      from: dataPoints[0].date,
      to: dataPoints[n - 1].date
    }
  };
}
```

#### Seasonal Patterns in Parliamentary Activity

```
Monthly Activity Patterns:
├── Jan–Feb: Post-recess legislative push
├── Mar–Apr: Pre-Easter intensive period
├── May: EP election years — reduced activity
├── Jun–Jul: End-of-term legislative sprint
├── Aug: Summer recess (minimal activity)
├── Sep: Budget debates, Commission hearings
├── Oct–Nov: Peak legislative period
└── Dec: Budget adoption, year-end votes

→ Normalize time series data against these seasonal patterns
→ Flag anomalies deviating >2σ from seasonal baseline
```

### Network Analysis for Political Alliances

#### Co-voting Network Construction

```javascript
/**
 * Build co-voting network from voting records.
 * Edges weighted by voting alignment frequency.
 *
 * @param {Array} votingRecords - Records from get_voting_records
 * @param {Array} meps - MEP list from get_meps
 * @returns {Object} Network graph with nodes and edges
 */
function buildCoVotingNetwork(votingRecords, meps) {
  const groups = [...new Set(meps.map(m => m.politicalGroup))];
  const alignment = {};

  // Calculate pairwise group alignment
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const key = `${groups[i]}|${groups[j]}`;
      alignment[key] = calculateGroupAlignment(
        groups[i], groups[j], votingRecords
      );
    }
  }

  return {
    nodes: groups.map(g => ({
      id: g,
      size: meps.filter(m => m.politicalGroup === g).length,
      type: 'political_group'
    })),
    edges: Object.entries(alignment).map(([key, weight]) => ({
      source: key.split('|')[0],
      target: key.split('|')[1],
      weight,
      label: weight > 0.7 ? 'strong_alignment' :
             weight > 0.5 ? 'moderate_alignment' : 'weak_alignment'
    }))
  };
}
```

#### Network Metrics for Journalism

| Metric | Description | Journalistic Application |
|--------|-------------|------------------------|
| **Degree centrality** | Number of alliance connections | "Most connected political group" |
| **Betweenness centrality** | Bridge role between clusters | "Kingmaker in coalition votes" |
| **Clustering coefficient** | Tightness of alliance clusters | "Stable bloc vs fluid alliances" |
| **Community detection** | Natural groupings beyond formal groups | "Voting blocs that cross party lines" |

### NLP for Parliamentary Document Analysis

#### Multi-Language Document Processing

```javascript
const SUPPORTED_LANGUAGES = [
  'en', 'fr', 'de', 'es', 'it', 'pt',
  'nl', 'el', 'pl', 'ro', 'sv', 'da', 'fi', 'cs'
];

/**
 * Extract key topics from parliamentary documents.
 *
 * @param {Array} documents - Documents from search_documents
 * @returns {Array<{topic: string, frequency: number, documents: Array}>}
 */
function extractTopics(documents) {
  const topicFrequency = {};

  for (const doc of documents) {
    const topics = doc.topics || [];
    for (const topic of topics) {
      if (!topicFrequency[topic]) {
        topicFrequency[topic] = { count: 0, documents: [] };
      }
      topicFrequency[topic].count++;
      topicFrequency[topic].documents.push(doc.id);
    }
  }

  return Object.entries(topicFrequency)
    .map(([topic, data]) => ({
      topic,
      frequency: data.count,
      documents: data.documents
    }))
    .sort((a, b) => b.frequency - a.frequency);
}
```

#### Keyword Extraction for Article Tagging

```javascript
function extractKeywords(text, language) {
  // Language-specific stop words
  const stopWords = getStopWords(language);

  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  const frequency = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
}
```

### Pattern Recognition in Legislative Voting

#### Anomaly Detection

```javascript
/**
 * Detect voting anomalies — unexpected breaks from historical patterns.
 *
 * @param {Object} currentVote - Current vote result
 * @param {Array} historicalVotes - Historical votes on similar topics
 * @returns {Object} Anomaly assessment
 */
function detectVotingAnomaly(currentVote, historicalVotes) {
  if (historicalVotes.length < 5) {
    return { isAnomaly: false, reason: 'insufficient_history' };
  }

  const historicalMargins = historicalVotes.map(v =>
    (v.votesFor - v.votesAgainst) / (v.votesFor + v.votesAgainst + v.abstentions)
  );

  const mean = historicalMargins.reduce((s, v) => s + v, 0) / historicalMargins.length;
  const std = Math.sqrt(
    historicalMargins.reduce((s, v) => s + (v - mean) ** 2, 0) /
    (historicalMargins.length - 1)
  );

  const currentMargin = (currentVote.votesFor - currentVote.votesAgainst) /
    (currentVote.votesFor + currentVote.votesAgainst + currentVote.abstentions);

  const zScore = (currentMargin - mean) / std;

  return {
    isAnomaly: Math.abs(zScore) > 2,
    zScore: Math.round(zScore * 100) / 100,
    direction: zScore > 0 ? 'unusually_strong_support' : 'unusually_strong_opposition',
    historicalMean: Math.round(mean * 100) / 100,
    currentMargin: Math.round(currentMargin * 100) / 100
  };
}
```

### Data Visualization Guidelines for Articles

| Chart Type | Use Case | Data Source |
|-----------|----------|------------|
| **Bar chart** | Comparing group votes on a proposal | `get_voting_records` |
| **Line chart** | MEP activity trends over time | `analyze_voting_patterns` |
| **Heatmap** | Cross-group voting alignment matrix | `get_voting_records` aggregate |
| **Network graph** | Political alliance visualization | Co-voting network analysis |
| **Pie/donut chart** | Vote outcome breakdown | `get_voting_records` |
| **Table** | Committee composition, MEP rankings | `get_committee_info`, `get_meps` |

### MCP Data Pipeline for Analysis

```javascript
async function analyticalPipeline(analysisType, params) {
  // Step 1: Collect raw data
  const rawData = await collectFromMCP(analysisType, params);

  // Step 2: Validate and clean
  const cleanData = validateAndClean(rawData);

  // Step 3: Apply statistical analysis
  const statistics = computeStatistics(cleanData, analysisType);

  // Step 4: Detect patterns and anomalies
  const patterns = detectPatterns(statistics);

  // Step 5: Generate narrative insights
  const insights = generateInsights(patterns, params.language);

  // Step 6: Format for article integration
  return {
    statistics,
    patterns,
    insights,
    visualizationData: prepareVisualizationData(statistics),
    confidence: assessDataConfidence(cleanData)
  };
}
```

### Reporting Standards for Data Journalism

- [ ] Report sample size alongside all statistics
- [ ] Include confidence intervals for estimated quantities
- [ ] State time period covered by analysis
- [ ] Disclose data gaps or missing records
- [ ] Use appropriate precision (no false precision)
- [ ] Compare findings with relevant historical baselines
- [ ] Attribute all data to specific MCP tool calls
- [ ] Note any data cleaning or filtering applied

## ISMS Compliance Mapping

| ISO 27001 Control | NIST CSF | CIS Control | Implementation |
|-------------------|----------|-------------|----------------|
| A.5.12 Classification | GV.OC-1 | CIS-3.1 | PUBLIC analytical output classification |
| A.8.25 Secure SDLC | PR.IP-2 | CIS-16 | Validated statistical pipelines |
| A.5.34 Privacy | GV.OC-3 | CIS-3.7 | Aggregate statistics, no personal profiling |
| A.8.11 Data masking | PR.DS-5 | CIS-3.12 | Anonymize when below minimum group size |
| A.8.28 Secure coding | PR.DS-6 | CIS-16.12 | Input validation for all MCP data |

## Hack23 ISMS Policy References

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md)
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)

## References

- [European Parliament MCP Server](https://github.com/Hack23/European-Parliament-MCP-Server)
- [EU Parliament Open Data Portal](https://data.europarl.europa.eu/)
- [VoteWatch Europe — Methodology](https://www.votewatch.eu/)
- [Hix, Noury, Roland — Democratic Politics in the European Parliament](https://doi.org/10.1017/CBO9780511491955)
- [Data Journalism Handbook](https://datajournalism.com/read/handbook/one)
