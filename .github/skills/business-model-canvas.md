---
name: business-model-canvas
description: Business Model Canvas for EU Parliament Monitor — mission-driven open source transparency platform with ISMS/GDPR-compliant revenue models
license: Apache-2.0
---

# 💼 Business Model Canvas Skill

## Purpose

Provide a structured Business Model Canvas framework adapted for the EU Parliament Monitor — an open source, mission-driven platform delivering European Parliament transparency in 14 EU languages. Guides strategic decisions on value delivery, sustainability, and ISMS-compliant operations.

## When to Use

✅ Planning new features or language expansion for the platform
✅ Evaluating partnership opportunities with EU institutions or NGOs
✅ Assessing funding models (grants, consulting, sponsorship)
✅ Aligning product roadmap with democratic transparency mission
✅ Reviewing cost structure for hosting, data, and content generation
✅ Communicating project value to stakeholders or funders

❌ Detailed financial accounting or budgeting
❌ Internal HR or team management decisions
❌ Technical architecture decisions (use ARCHITECTURE.md instead)
❌ Security threat modeling (use THREAT_MODEL.md instead)

## Core Framework

### EU Parliament Monitor Business Model Canvas

```
┌──────────────────┬──────────────────┬──────────────────┐
│  KEY PARTNERS    │  KEY ACTIVITIES  │ VALUE PROPOSITION│
│                  │                  │                  │
│ • European       │ • Daily news     │ • Real-time EP   │
│   Parliament     │   generation     │   transparency   │
│   (open data)    │   (14 langs)     │   in 14 languages│
│ • Hack23 org     │ • EP MCP data    │ • Data-driven    │
│   repositories   │   integration    │   parliamentary  │
│ • EP MCP Server  │ • SEO/sitemap    │   journalism     │
│ • Open data      │   optimization   │ • WCAG 2.1 AA    │
│   providers      │ • Security &     │   accessible     │
│ • GitHub         │   compliance     │ • GDPR-compliant │
│   (hosting)      │ • Quality        │   (no tracking)  │
│ • EU democracy   │   assurance      │ • Open source &  │
│   foundations    │ • Community      │   auditable      │
│                  │   engagement     │                  │
├──────────────────┼──────────────────┼──────────────────┤
│  KEY RESOURCES   │                  │ CUSTOMER         │
│                  │  CHANNELS        │ RELATIONSHIPS    │
│ • EP MCP Server  │                  │                  │
│   (data source)  │ • GitHub Pages   │ • Self-service   │
│ • Multi-language │   (S3/CDN)       │   (open access)  │
│   content engine │ • Social media   │ • Community      │
│ • ISMS-compliant │   (X, LinkedIn)  │   (GitHub issues)│
│   infrastructure │ • EU institution │ • Automated      │
│ • 8 specialized  │   partnerships   │   content        │
│   Copilot agents │ • Search engines │   delivery       │
│ • Vitest/        │   (SEO/organic)  │ • RSS feeds      │
│   Playwright     │ • RSS/Atom feeds │ • Newsletter     │
│   test suite     │ • Direct links   │   (future)       │
│ • SPDX-compliant │   from EP docs   │                  │
│   codebase       │                  │                  │
├──────────────────┼──────────────────┼──────────────────┤
│  COST STRUCTURE                    │ REVENUE STREAMS  │
│                                    │                  │
│ • AWS hosting (S3, CloudFront)     │ • Open source    │
│ • Domain registration              │   (free access)  │
│ • Development time                 │ • EU grants      │
│ • Content generation (AI compute)  │   (Horizon,      │
│ • CI/CD pipeline (GitHub Actions)  │    democracy)    │
│ • Security tooling (CodeQL, etc.)  │ • Consulting     │
│ • Accessibility testing            │   services       │
│                                    │ • Sponsorship    │
│ Mission: Democratic transparency,  │ • Foundation     │
│ not profit maximization            │   funding        │
└────────────────────────────────────┴──────────────────┘
```

### Customer Segments

```
Customer Segments:
│
├─ 1. EU Citizens (Primary)
│     ├─ Need: Understand what their MEPs are doing
│     ├─ Language: Content in their native language
│     ├─ Access: Free, no registration required
│     └─ Value: Democratic accountability
│
├─ 2. Journalists & Media
│     ├─ Need: Data-driven EU Parliament coverage
│     ├─ Language: Multi-language source material
│     ├─ Access: Structured data, embeddable content
│     └─ Value: Reliable, up-to-date EP intelligence
│
├─ 3. Researchers & Academics
│     ├─ Need: Voting patterns, legislative tracking
│     ├─ Language: EN primary, cross-language analysis
│     ├─ Access: Open data, API via MCP
│     └─ Value: Systematic parliamentary data
│
├─ 4. NGOs & Civil Society
│     ├─ Need: Monitor policy areas (environment, trade)
│     ├─ Language: Local language for advocacy
│     ├─ Access: Topic-filtered content, alerts
│     └─ Value: Evidence-based advocacy
│
└─ 5. MEP Offices & EU Institutions
      ├─ Need: Track own/peer activity and coverage
      ├─ Language: Working languages (EN/FR/DE)
      ├─ Access: Direct integration, reporting
      └─ Value: Public accountability metrics
```

### Value Proposition Design

```javascript
/**
 * Evaluate value proposition strength for a customer segment.
 *
 * @param {string} segment - Customer segment identifier
 * @param {Object} features - Available platform features
 * @returns {Object} Value proposition assessment
 */
function assessValueProposition(segment, features) {
  const propositions = {
    citizens: {
      gains: ['Native language access', 'No cost', 'No tracking'],
      pains: ['Complex EU procedures', 'Language barriers', 'Information overload'],
      fitScore: features.languages >= 14 && features.gdprCompliant ? 'HIGH' : 'MEDIUM'
    },
    journalists: {
      gains: ['Structured data', 'Cross-reference tools', 'Voting analysis'],
      pains: ['Manual EP data gathering', 'Translation costs', 'Deadline pressure'],
      fitScore: features.mcpIntegration && features.seoOptimized ? 'HIGH' : 'MEDIUM'
    },
    researchers: {
      gains: ['Systematic data', 'Historical records', 'Pattern analysis'],
      pains: ['Scattered EP data sources', 'API complexity', 'Data cleaning'],
      fitScore: features.mcpIntegration && features.openData ? 'HIGH' : 'MEDIUM'
    }
  };
  return propositions[segment] || { fitScore: 'UNKNOWN' };
}
```

### Funding Model Decision Tree

```
Funding Evaluation:
│
├─ Is the opportunity aligned with democratic transparency?
│   ├─ NO → Decline
│   └─ YES ↓
│
├─ Does it require compromising GDPR compliance?
│   ├─ YES → Decline
│   └─ NO ↓
│
├─ Does it require adding user tracking?
│   ├─ YES → Decline (violates privacy-by-design)
│   └─ NO ↓
│
├─ Type of funding?
│   ├─ EU Grant (Horizon, democracy programs)
│   │   └─ ✅ Accept — mission-aligned, sustainability
│   ├─ Open Source Sponsorship (GitHub Sponsors, FOSS funds)
│   │   └─ ✅ Accept — community-driven
│   ├─ Consulting/Custom Development
│   │   └─ ✅ Accept if deliverables are open source
│   ├─ Corporate Sponsorship
│   │   └─ ⚠️ Evaluate: editorial independence preserved?
│   └─ Advertising
│       └─ ❌ Decline — conflicts with no-tracking policy
```

### Key Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Language coverage | 14 EU languages | Automated check |
| Content freshness | Daily updates | CI/CD pipeline |
| WCAG compliance | AA level | axe-core testing |
| Page load time | < 2s (LCP) | Lighthouse CI |
| Uptime | 99.9% | GitHub Pages SLA |
| Security posture | Zero critical CVEs | npm audit + CodeQL |
| SEO visibility | Top 3 for EP queries | Search Console |
| Community engagement | Monthly contributors | GitHub metrics |

## ISMS Compliance Mapping

### ISO 27001:2022
- **A.5.1**: Information security policies — document business model risks
- **A.5.10**: Acceptable use — define acceptable funding sources
- **A.5.23**: Information security for cloud services — GitHub Pages controls
- **A.6.1**: Screening — vet partnership organizations

### NIST CSF 2.0
- **GV.OC-01**: Organizational context understood (mission-driven model)
- **GV.RM-01**: Risk management objectives established
- **GV.SC-01**: Supply chain risk management (EP MCP, GitHub, AWS)
- **ID.AM-01**: Asset inventory (content, data, infrastructure)

### CIS Controls v8.1
- **CIS-1**: Inventory of enterprise assets (hosting infrastructure)
- **CIS-2**: Inventory of software assets (dependencies, MCP server)
- **CIS-15**: Service provider management (GitHub, AWS, EP data)

### GDPR Considerations for Business Model
- No personal data collection from visitors
- No tracking cookies or analytics pixels
- Privacy-by-design in all revenue models
- Data minimization in EP data processing
- Lawful basis: legitimate interest (democratic transparency)

## Hack23 ISMS Policy References

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md)
- [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md)

## References

- [Business Model Canvas — Strategyzer](https://www.strategyzer.com/business-model-canvas)
- [EU Horizon Europe Funding](https://ec.europa.eu/info/funding-tenders/opportunities/portal/)
- [European Parliament Open Data Portal](https://data.europarl.europa.eu/)
- [GitHub Sponsors](https://github.com/sponsors)
- [EU Parliament MCP Server](https://github.com/Hack23/European-Parliament-MCP-Server)
- [GDPR Official Text](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
