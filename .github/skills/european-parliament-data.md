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

### European Parliament MCP Server Tools

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `get_meps` | Fetch Members of European Parliament | `country`, `party`, `committee` |
| `get_plenary_sessions` | Retrieve plenary session info | `startDate`, `endDate` |
| `search_documents` | Search EP documents | `query`, `type`, `date` |
| `get_parliamentary_questions` | Get parliamentary questions | `author`, `topic` |
| `get_committee_info` | Get committee information | `committeeId` |
| `get_voting_records` | Get voting records | `sessionId`, `date` |

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
  'en', 'fr', 'de', 'es', 'it', 'pt',
  'nl', 'el', 'pl', 'ro', 'sv', 'da', 'fi', 'cs'
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
