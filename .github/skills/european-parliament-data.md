# 🇪🇺 European Parliament Data Integration Skill

## Purpose

Ensure reliable integration with European Parliament open data via the MCP (Model Context Protocol) server, including proper data validation, caching, error handling, and graceful degradation.

## Rules

### MUST (Critical)
1. MUST validate all MCP server responses before use
2. MUST implement graceful degradation when MCP unavailable
3. MUST cache data with appropriate TTL (30 minutes default)
4. MUST sanitize data before rendering in HTML
5. MUST handle rate limiting and retry with exponential backoff

### European Parliament MCP Server Tools (46 tools)

#### MEP Tools (7)
| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `get_meps` | Fetch Members of European Parliament | `country`, `group`, `committee`, `active`, `limit` |
| `get_mep_details` | Get detailed MEP information | `id` |
| `get_current_meps` | Get currently active MEPs | `limit`, `offset` |
| `get_incoming_meps` | Get incoming MEPs for current term | `limit`, `offset` |
| `get_outgoing_meps` | Get outgoing MEPs for current term | `limit`, `offset` |
| `get_homonym_meps` | Get MEPs with identical names | `limit`, `offset` |
| `get_mep_declarations` | Get MEP financial interest declarations | `docId`, `year`, `limit` |

#### Plenary & Meeting Tools (9)
| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `get_plenary_sessions` | Retrieve plenary session info | `startDate`, `endDate`, `location`, `limit` |
| `get_speeches` | Get plenary speeches and debates | `speechId`, `dateFrom`, `dateTo`, `limit` |
| `get_events` | Get EP events (hearings, conferences) | `eventId`, `dateFrom`, `dateTo`, `limit` |
| `get_meeting_activities` | Get activities for a plenary sitting | `sittingId`, `limit` |
| `get_meeting_decisions` | Get decisions for a plenary sitting | `sittingId`, `limit` |
| `get_meeting_foreseen_activities` | Get planned activities for a sitting | `sittingId`, `limit` |
| `get_meeting_plenary_session_documents` | Get session documents for a meeting | `sittingId`, `limit` |
| `get_meeting_plenary_session_document_items` | Get session document items for a meeting | `sittingId`, `limit` |
| `get_voting_records` | Get voting records | `sessionId`, `mepId`, `topic`, `limit` |

#### Committee Tools (2)
| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `get_committee_info` | Get committee information | `committeeId`, `abbreviation`, `showCurrent` |
| `get_parliamentary_questions` | Get parliamentary questions | `type`, `author`, `topic`, `status` |

#### Document Tools (7)
| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `search_documents` | Search EP documents | `keyword`, `documentType`, `committee`, `dateFrom` |
| `get_plenary_documents` | Get plenary documents | `docId`, `year`, `limit` |
| `get_committee_documents` | Get committee documents | `docId`, `year`, `limit` |
| `get_plenary_session_documents` | Get session documents (agendas, minutes) | `docId`, `limit` |
| `get_plenary_session_document_items` | Get session document items | `limit`, `offset` |
| `get_external_documents` | Get non-EP documents (Council, Commission) | `docId`, `year`, `limit` |
| `get_controlled_vocabularies` | Get standardized classification terms | `vocId`, `limit` |

#### Legislative Tools (3)
| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `get_procedures` | Get legislative procedures | `processId`, `year`, `limit` |
| `get_adopted_texts` | Get adopted texts and resolutions | `docId`, `year`, `limit` |
| `get_procedure_events` | Get events for a legislative procedure | `processId`, `limit` |

#### Advanced Analysis Tools (3)
| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `track_legislation` | Track legislative procedure progress | `procedureId` |
| `monitor_legislative_pipeline` | Monitor pipeline with bottleneck detection | `committee`, `status`, `dateFrom` |
| `generate_report` | Generate analytical reports | `reportType`, `subjectId`, `dateFrom` |

#### OSINT Intelligence Tools (15)
| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `assess_mep_influence` | MEP influence scoring (5-dimension model) | `mepId`, `dateFrom`, `dateTo` |
| `analyze_coalition_dynamics` | Coalition cohesion & stress analysis | `groupIds`, `dateFrom`, `dateTo` |
| `detect_voting_anomalies` | Party defection & anomaly detection | `mepId`, `groupId`, `dateFrom` |
| `compare_political_groups` | Cross-group comparative analysis | `groupIds`, `dimensions`, `dateFrom` |
| `analyze_legislative_effectiveness` | MEP/committee legislative scoring | `subjectType`, `subjectId`, `dateFrom` |
| `analyze_committee_activity` | Committee workload & engagement | `committeeId`, `dateFrom`, `dateTo` |
| `track_mep_attendance` | MEP attendance patterns & trends | `mepId`, `country`, `groupId` |
| `analyze_country_delegation` | Country delegation voting & composition | `country`, `dateFrom`, `dateTo` |
| `analyze_voting_patterns` | MEP voting behavior analysis | `mepId`, `dateFrom`, `compareWithGroup` |
| `generate_political_landscape` | Parliament-wide political landscape | `dateFrom`, `dateTo` |
| `network_analysis` | MEP relationship network mapping | `mepId`, `analysisType`, `depth` |
| `sentiment_tracker` | Political group institutional sentiment | `groupId`, `timeframe` |
| `early_warning_system` | Emerging political shift detection | `sensitivity`, `focusArea` |
| `comparative_intelligence` | Cross-reference MEP multi-dimensional profiling | `mepIds`, `dimensions` |
| `correlate_intelligence` | Cross-tool OSINT intelligence correlation | `mepId`, `correlationScenarios` |

### MCP Client Pattern

```javascript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 30 });

async function fetchFromMCP(tool, params) {
  const cacheKey = `${tool}:${JSON.stringify(params)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  try {
    const result = await mcpClient.callTool(tool, params);
    const validated = validateResponse(tool, result);
    if (validated) cache.set(cacheKey, validated);
    return validated;
  } catch (error) {
    console.warn(`MCP ${tool} failed, using fallback:`, error.message);
    return getFallbackData(tool, params);
  }
}
```

### Data Validation

```javascript
function validateMEP(data) {
  if (!data || typeof data !== 'object') return null;
  return {
    id: String(data.id || ''),
    name: escapeHtml(String(data.name || 'Unknown')),
    country: /^[A-Z]{2}$/.test(data.country) ? data.country : 'XX',
    party: escapeHtml(String(data.party || 'Independent')),
    politicalGroup: escapeHtml(String(data.politicalGroup || '')),
  };
}
```

### Error Handling Strategy

```
Retry Policy:
1. First retry: 1 second delay
2. Second retry: 3 seconds delay
3. Third retry: 10 seconds delay
4. After 3 failures: Use fallback/placeholder data

Circuit Breaker:
- Open after 5 consecutive failures
- Half-open after 60 seconds
- Close on first success in half-open state
```

### Multi-Language Article Generation

```javascript
const SUPPORTED_LANGUAGES = [
  'en', 'sv', 'da', 'no', 'fi', 'de', 'fr',
  'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'
];

async function generateMultiLanguageArticles(sessionData) {
  const articles = {};
  for (const lang of SUPPORTED_LANGUAGES) {
    articles[lang] = await generateArticle(sessionData, lang);
  }
  return articles;
}
```

### Fallback Strategy

When MCP server is unavailable:
1. Serve cached data if available (even stale)
2. Use placeholder content clearly marked as "[Placeholder]"
3. Log warning for monitoring
4. Continue generating articles with available data

## Related Documentation
- [European Parliament MCP Server](https://github.com/Hack23/European-Parliament-MCP-Server)
- [EU Parliament Open Data](https://data.europarl.europa.eu/)
