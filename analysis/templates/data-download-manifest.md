<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📥 Data Download Manifest Template

**Template Purpose:** Comprehensive log of all EP MCP tool calls and external data retrievals during a workflow run — enables reproducibility, debugging, and GDPR Article 30 compliance.

**Methodology:** [structural-metadata-methodology.md §Part 3](../methodologies/structural-metadata-methodology.md#part-3--data-download-manifestmd-structure)

**Min Lines:** 160

---

## 📋 Header Block

```markdown
# Data Download Manifest: {RUN ID}

**Classification:** PUBLIC
**Date:** {ISO date}
**Run ID:** {article-type}-{date}-run{NN}
**Workflow:** {news-*.md workflow name}
**Total API Calls:** {Count}
**Total Data Volume:** {Size}
**Processing Purpose:** Analysis for EU Parliament Monitor article generation

---
```

## 🎯 Section 1 — Purpose Statement

**Required:** Explain manifest function for GDPR compliance.

```markdown
## Purpose

This manifest documents all data collection activities for GDPR Article 30 compliance:

- **Processing Activity:** Automated analysis of European Parliament public data
- **Legal Basis:** Legitimate interest in democratic transparency (Art. 6(1)(f) GDPR)
- **Data Categories:** Public parliamentary records, MEP public activities, voting records
- **Data Subjects:** Members of European Parliament (public officials in their public role)
- **Retention:** Analysis artifacts retained indefinitely; raw data cached 30 days
```

## 📊 Section 2 — EP MCP Tool Call Log

**Required:** Detailed log of all EP MCP tool invocations.

```markdown
## EP MCP Tool Call Log

| # | Timestamp (UTC) | Tool | Parameters | Items | Duration | Status |
|---|-----------------|------|------------|-------|----------|--------|
| 1 | {ISO timestamp} | `get_adopted_texts` | `year=2026, limit=50` | 47 | 1.2s | ✅ 200 |
| 2 | {timestamp} | `get_procedures` | `limit=100, offset=0` | 100 | 2.1s | ✅ 200 |
| 3 | {timestamp} | `get_meps` | `country=DE, active=true` | 96 | 0.8s | ✅ 200 |
| 4 | {timestamp} | `get_voting_records` | `dateFrom=2026-04-01, dateTo=2026-04-21` | 23 | 1.5s | ✅ 200 |
| 5 | {timestamp} | `analyze_coalition_dynamics` | `dateFrom=2026-01-01` | 1 | 3.2s | ✅ 200 |
| 6 | {timestamp} | `get_parliamentary_questions` | `type=WRITTEN, limit=50` | 34 | 1.1s | ✅ 200 |
| 7 | {timestamp} | `detect_voting_anomalies` | `sensitivityThreshold=0.3` | 1 | 2.8s | ✅ 200 |
| 8 | {timestamp} | `compare_political_groups` | `groupIds=["EPP","S&D","Renew"]` | 1 | 2.1s | ✅ 200 |
| 9 | {timestamp} | `track_mep_attendance` | `dateFrom=2026-01-01, limit=100` | 100 | 1.9s | ✅ 200 |
| 10 | {timestamp} | `early_warning_system` | `sensitivity=medium` | 1 | 3.5s | ✅ 200 |

### Call Summary

| Tool Category | Call Count | Total Items | Total Duration |
|---------------|------------|-------------|----------------|
| Data Retrieval | {N} | {items} | {seconds}s |
| Analysis Tools | {N} | {items} | {seconds}s |
| Feed Tools | {N} | {items} | {seconds}s |
| **TOTAL** | **{N}** | **{items}** | **{seconds}s** |
```

## 📈 Section 3 — Data Volume Summary

**Required:** Quantify data retrieved.

```markdown
## Data Volume Summary

| Data Type | Items | Total Size | Avg Size/Item | Format |
|-----------|-------|------------|---------------|--------|
| Adopted Texts | 47 | 2.3 MB | 49 KB | JSON/Markdown |
| Procedures | 100 | 1.8 MB | 18 KB | JSON |
| MEP Records | 96 | 0.4 MB | 4 KB | JSON |
| Voting Records | 23 | 0.9 MB | 39 KB | JSON |
| Questions | 34 | 0.6 MB | 18 KB | JSON |
| Analysis Results | 5 | 0.2 MB | 40 KB | JSON |
| **TOTAL** | **305** | **6.2 MB** | **20 KB** | |

### Retrieval Efficiency

| Metric | Value |
|--------|-------|
| Total API calls | {N} |
| Total data retrieved | {Size} |
| Average call duration | {seconds}s |
| Cache hit rate | {%}% |
| Retry count | {N} |
```

## 🔄 Section 4 — API Response Codes

**Required:** Document HTTP response patterns.

```markdown
## API Response Codes

| Tool | HTTP 200 | HTTP 4xx | HTTP 5xx | Retries | Final Status |
|------|----------|----------|----------|---------|--------------|
| get_adopted_texts | 1 | 0 | 0 | 0 | ✅ Success |
| get_procedures | 1 | 0 | 0 | 0 | ✅ Success |
| get_meps | 3 | 0 | 1 | 1 | ✅ Success (retry) |
| get_voting_records | 1 | 0 | 0 | 0 | ✅ Success |
| analyze_coalition_dynamics | 1 | 0 | 0 | 0 | ✅ Success |
| ... | ... | ... | ... | ... | ... |

### Error Handling

| Error Type | Count | Resolution |
|------------|-------|------------|
| Timeout (504) | {N} | Retry with exponential backoff |
| Rate limit (429) | {N} | Wait and retry |
| Not found (404) | {N} | Skip item, log warning |
| Server error (5xx) | {N} | Retry up to 3 times |
```

## 🔐 Section 5 — Content Hash Inventory

**Required:** SHA-256 hashes for content integrity verification.

```markdown
## Content Hash Inventory

| Item ID | Type | SHA-256 (first 16 chars) | Size | Verification |
|---------|------|--------------------------|------|--------------|
| TA(2026)0123 | Adopted Text | `abc123def456gh78` | 52 KB | ✅ Match |
| TA(2026)0124 | Adopted Text | `789xyz012abcde34` | 48 KB | ✅ Match |
| A9-0045/2026 | Committee Report | `fedcba9876543210` | 89 KB | ✅ Match |
| 2025/0123(COD) | Procedure | `0123456789abcdef` | 23 KB | ✅ Match |
| MEP-124810 | MEP Record | `abcd1234efgh5678` | 4 KB | ✅ Match |
| ... | ... | ... | ... | ... |

### Integrity Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Verified | {N} | {%}% |
| ⚠️ Mismatch | {N} | {%}% |
| ❌ Missing | {N} | {%}% |
```

## 🌐 Section 6 — External Data Sources

**Required:** Document non-EP data sources.

```markdown
## External Data Sources

| Source | Tool/API | Parameters | Items | Admiralty |
|--------|----------|------------|-------|-----------|
| World Bank | `get_economic_data` | `indicator=GDP_GROWTH, countries=[DE,FR,IT]` | 30 | B2 |
| World Bank | `get_social_data` | `indicator=POPULATION, countries=[EU27]` | 27 | B2 |
| IMF WEO | Direct API | `2024 October forecast` | 1 | B2 |
| Eurostat | Web fetch | `nama_10_gdp` | 27 | A2 |

### External Source Attribution

| Source | Purpose | License | Retention |
|--------|---------|---------|-----------|
| World Bank | Economic context | CC-BY 4.0 | 30 days |
| IMF | Fiscal forecasts | IMF Copyright | 30 days |
| Eurostat | EU statistics | Eurostat terms | 30 days |
```

## ⏱️ Section 7 — Timing Analysis

**Required:** Performance metrics.

```markdown
## Timing Analysis

### Call Duration Distribution

| Duration Range | Count | Percentage |
|----------------|-------|------------|
| <1s | {N} | {%}% |
| 1-2s | {N} | {%}% |
| 2-5s | {N} | {%}% |
| 5-10s | {N} | {%}% |
| >10s | {N} | {%}% |

### Sequential vs Parallel

| Phase | Calls | Duration | Type |
|-------|-------|----------|------|
| Data retrieval | {N} | {time} | Parallel |
| Analysis tools | {N} | {time} | Sequential |
| External sources | {N} | {time} | Parallel |

### Total Wall-Clock Time

| Stage | Start | End | Duration |
|-------|-------|-----|----------|
| Data collection | {timestamp} | {timestamp} | {duration} |
| Analysis | {timestamp} | {timestamp} | {duration} |
| Artifact generation | {timestamp} | {timestamp} | {duration} |
| **Total** | {start} | {end} | **{total}** |
```

## 📋 Section 8 — Reproducibility Instructions

**Required:** How to reproduce this data collection.

````markdown
## Reproducibility Instructions

To reproduce this data collection:

### Environment
```bash
EP_MCP_GATEWAY_URL=http://host.docker.internal:8080/mcp/european-parliament
EP_REQUEST_TIMEOUT_MS=120000
```

### Tool Calls (in order)
```typescript
// 1. Adopted texts
await ep.get_adopted_texts({ year: 2026, limit: 50 });

// 2. Procedures  
await ep.get_procedures({ limit: 100, offset: 0 });

// 3. MEPs by country
for (const country of ['DE', 'FR', 'IT', 'ES', 'PL']) {
  await ep.get_meps({ country, active: true });
}

// ... additional calls as logged above
```

### Verification
- Compare content hashes against inventory above
- Expected data volume: {size}
- Expected item count: {count}
````

## ✅ Quality Checklist

- [ ] All EP MCP tool calls logged with timestamps
- [ ] Parameters recorded for each call
- [ ] Response codes and retry counts documented
- [ ] Data volume summary populated
- [ ] Content hash inventory for key documents
- [ ] External data sources listed with Admiralty grades
- [ ] Timing analysis complete
- [ ] GDPR purpose statement included
- [ ] Reproducibility instructions provided

---

*Template version 1.0 — EU Parliament Monitor Data Download Manifest*
