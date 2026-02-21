# EU Parliament Monitor - Skills Library

## Purpose

Skills are reusable knowledge units that encode Hack23's security policies, architecture patterns, quality standards, intelligence analysis methodologies, business strategy, and compliance requirements. Each skill provides explicit, actionable rules that GitHub Copilot applies during development.

**Skills auto-load via GitHub Copilot.** Reference specific skills when working in relevant areas.

## Skills Catalog

### 🏛️ Architecture Skills (1 skill)
- **[C4 Architecture Documentation](c4-architecture-documentation.md)** — C4 models, Mermaid diagrams, documentation portfolio requirements

### 🔒 Security Skills (3 skills)
- **[Security by Design](security-by-design.md)** — Defense-in-depth, CSP headers, input validation, STRIDE
- **[Threat Modeling](threat-modeling.md)** — STRIDE analysis, risk assessment, attack surface analysis
- **[Data Protection](data-protection.md)** — GDPR compliance, data classification, sanitization

### ✅ Compliance Skills (2 skills)
- **[Compliance Frameworks](compliance-frameworks.md)** — ISO 27001, NIST CSF 2.0, CIS Controls, GDPR, NIS2, EU CRA
- **[ISMS Compliance](isms-compliance.md)** — ISMS policy references, evidence requirements, framework mapping

### 🧪 Quality Skills (3 skills)
- **[Testing Strategy](testing-strategy.md)** — Vitest unit tests, Playwright E2E, coverage requirements
- **[Code Quality Excellence](code-quality-excellence.md)** — ESLint, HTMLHint, JavaScript/HTML/CSS standards
- **[Accessibility Excellence](accessibility-excellence.md)** — WCAG 2.1 AA, keyboard navigation, screen readers

### ⚡ Performance Skills (1 skill)
- **[Performance Optimization](performance-optimization.md)** — Core Web Vitals, caching, asset optimization

### 📚 Documentation Skills (1 skill)
- **[Documentation Standards](documentation-standards.md)** — Document control, JSDoc, REUSE compliance

### 📜 Governance Skills (1 skill)
- **[Open Source Governance](open-source-governance.md)** — Apache-2.0, REUSE 3.3, SBOM, SLSA, OpenSSF

### 🇪🇺 Data Integration Skills (2 skills)
- **[European Parliament Data](european-parliament-data.md)** — EP MCP server tools, data validation, caching, fallback
- **[Legislative Monitoring](legislative-monitoring.md)** — OLP tracking, trilogue analysis, amendment patterns, plenary voting

### 🔍 Intelligence & OSINT Skills (10 skills)
- **[Political Science Analysis](political-science-analysis.md)** — Comparative politics, MEP behavior, EU legislative procedures, democratic accountability
- **[OSINT Methodologies](osint-methodologies.md)** — OSINT collection, source evaluation, data integration, verification for EU Parliament data
- **[Intelligence Analysis Techniques](intelligence-analysis-techniques.md)** — ACH, SWOT, Devil's Advocacy, Red Team, structured analytics for EU analysis
- **[European Political System](european-political-system.md)** — EU Parliament structure, political groups, OLP, trilogue, committee system
- **[Data Science for Intelligence](data-science-for-intelligence.md)** — Statistical analysis, ML, NLP, time series, network analysis for political data
- **[Electoral Analysis](electoral-analysis.md)** — EU Parliament elections, seat distribution, political group formation, Spitzenkandidaten
- **[Behavioral Analysis](behavioral-analysis.md)** — MEP voting loyalty, cognitive biases, leadership profiling, cross-group collaboration
- **[Strategic Communication Analysis](strategic-communication-analysis.md)** — Narrative framing, media bias detection, discourse analysis, multi-language messaging
- **[Risk Assessment Frameworks](risk-assessment-frameworks.md)** — Democratic health, cohesion risk, legislative bottlenecks, early warning systems

### 💼 Business Strategy (1 skill)
- **[Business Model Canvas](business-model-canvas.md)** — Value proposition, customer segments, revenue streams, mission-aligned business model design

### 📢 Marketing & Growth (1 skill)
- **[SEO Best Practices](seo-best-practices.md)** — On-page SEO, technical SEO, keyword research, multi-language content optimization

### 🤖 AI & MCP Skills (3 skills)
- **[AI Governance](ai-governance.md)** — EU AI Act compliance, OWASP LLM security, responsible AI practices for content generation
- **[GitHub Agentic Workflows](github-agentic-workflows.md)** — Copilot coding agent, stacked PRs, agent selection
- **[MCP Server Integration](mcp-server-integration.md)** — MCP protocol, multi-server orchestration

### 🛡️ Infrastructure Skills (4 skills)
- **[GH AW Architecture](gh-aw-architecture.md)** — Layered security model (Sandbox → Gateway → Firewall)
- **[GH AW Firewall](gh-aw-firewall.md)** — Domain filtering, request sanitization, compliance
- **[GH AW Sandbox](gh-aw-sandbox.md)** — Resource isolation, secrets injection
- **[MCP Gateway Configuration](mcp-gateway-configuration.md)** — TOML/JSON config patterns

### 🔧 Operations Skills (2 skills)
- **[MCP Gateway Security](mcp-gateway-security.md)** — Authentication, container isolation
- **[MCP Gateway Troubleshooting](mcp-gateway-troubleshooting.md)** — Debug logging, issue resolution

## Skills Statistics

**Total Skills**: 34 skills across 14 categories

| Category | Count | Focus |
|----------|-------|-------|
| Architecture | 1 | C4 models, documentation portfolio |
| Security | 3 | Defense-in-depth, threat modeling, data protection |
| Compliance | 2 | ISO 27001, NIST CSF, CIS, GDPR, NIS2 |
| Quality | 3 | Testing, code quality, accessibility |
| Performance | 1 | Core Web Vitals, caching |
| Documentation | 1 | Standards, REUSE compliance |
| Governance | 1 | Open source, supply chain |
| Data Integration | 2 | European Parliament MCP, legislative monitoring |
| Intelligence & OSINT | 10 | Political science, OSINT, intelligence analysis, electoral, behavioral, communication, risk |
| Business Strategy | 1 | Business model canvas, revenue streams |
| Marketing & Growth | 1 | SEO, multi-language content optimization |
| AI & MCP | 3 | AI governance, agentic workflows, MCP protocol |
| Infrastructure | 4 | AW architecture, firewall, sandbox, gateway |
| Operations | 2 | Gateway security, troubleshooting |

## Agent Cross-Reference

The skills library supports 11 specialized agents. Each agent references relevant skills for their domain:

| Agent | Primary Skills | Supporting Skills |
|-------|---------------|-------------------|
| **news-journalist** | european-parliament-data, strategic-communication-analysis, political-science-analysis | behavioral-analysis, risk-assessment-frameworks, seo-best-practices, data-protection |
| **intelligence-operative** | political-science-analysis, osint-methodologies, intelligence-analysis-techniques, european-political-system, data-science-for-intelligence | electoral-analysis, behavioral-analysis, strategic-communication-analysis, legislative-monitoring, risk-assessment-frameworks |
| **business-development-specialist** | business-model-canvas, european-parliament-data, seo-best-practices | compliance-frameworks, data-protection, isms-compliance |
| **marketing-specialist** | seo-best-practices, strategic-communication-analysis, business-model-canvas | data-protection, european-parliament-data, accessibility-excellence |
| **data-pipeline-specialist** | european-parliament-data, legislative-monitoring, mcp-server-integration | performance-optimization, testing-strategy, data-science-for-intelligence |
| **frontend-specialist** | accessibility-excellence, code-quality-excellence, seo-best-practices | performance-optimization, security-by-design |
| **quality-engineer** | testing-strategy, code-quality-excellence | accessibility-excellence, performance-optimization |
| **security-architect** | security-by-design, threat-modeling, isms-compliance, ai-governance | compliance-frameworks, data-protection |
| **documentation-architect** | c4-architecture-documentation, documentation-standards | isms-compliance, compliance-frameworks, european-political-system |
| **devops-engineer** | github-agentic-workflows, open-source-governance | gh-aw-architecture, mcp-gateway-security |
| **product-task-agent** | compliance-frameworks, isms-compliance, business-model-canvas | github-agentic-workflows, testing-strategy, risk-assessment-frameworks |

## How to Use Skills

### For GitHub Copilot
Skills auto-load when working in Hack23 repositories. Copilot references these skills to generate secure, compliant, accessible code.

### For Developers
1. **Reference skills** before starting new work
2. **Follow MUST rules** — these are non-negotiable
3. **Apply patterns** from examples in each skill
4. **Update skills** when policies or standards change

### For Custom Agents
Agents document which skills they leverage. See each agent's "Skills Reference" section.

## Related Resources

- **[Copilot Instructions](../.github/copilot-instructions.md)** — Project-wide Copilot configuration
- **[Agent Catalog](../agents/README.md)** — 11 specialized custom agents
- **[ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC)** — Hack23 security policies
- **[Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)** — SDLC security requirements

## License

All skills are licensed under Apache-2.0, consistent with Hack23's open-source commitment.
