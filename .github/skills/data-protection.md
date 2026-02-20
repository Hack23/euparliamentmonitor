# 🔐 Data Protection Skill

## Purpose

Ensure proper handling of European Parliament public data with GDPR compliance, data classification, and privacy-by-design principles.

## Rules

### MUST (Critical)
1. MUST classify all data per Hack23 Classification Policy
2. MUST not collect or store personal data unnecessarily
3. MUST sanitize all data before rendering in HTML
4. MUST implement privacy-by-design principles
5. MUST document data flows in DATA_MODEL.md

### Data Classification for EU Parliament Monitor

| Data Type | Classification | Handling |
|-----------|---------------|----------|
| Plenary sessions | PUBLIC | Open access, cache freely |
| MEP profiles | PUBLIC | Open data, validate before display |
| Voting records | PUBLIC | Open data, verify integrity |
| Committee info | PUBLIC | Open data, standard caching |
| Documents/reports | PUBLIC | Open data, respect copyright |
| Generated articles | PUBLIC | No PII, standard publishing |

### GDPR Considerations for Public Data

Even with public data, ensure:
- **Transparency**: Clearly cite data sources
- **Accuracy**: Validate data before publishing
- **Purpose limitation**: Use data only for parliamentary monitoring
- **Data minimization**: Don't collect more than needed
- **Storage limitation**: Cache only what's necessary

### Data Sanitization

```javascript
// ✅ GOOD: Sanitize before rendering
function sanitizeForHTML(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ✅ GOOD: Validate URL before use
function isValidURL(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

### Data Flow Documentation

All data flows must be documented in DATA_MODEL.md:
1. **Source**: Where data originates (EP Open Data Portal)
2. **Transport**: How data is transmitted (MCP Protocol over HTTPS)
3. **Processing**: How data is transformed (validation, sanitization)
4. **Storage**: How data is cached (LRU cache, 30min TTL)
5. **Output**: How data is presented (static HTML pages)

## Related Policies
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)
- [Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md)
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md)
