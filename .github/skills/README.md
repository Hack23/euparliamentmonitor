# EU Parliament Monitor - Skills Library

## Purpose

Skills are reusable knowledge units that encode Hack23's security policies, architecture patterns, quality standards, intelligence analysis methodologies, business strategy, and compliance requirements. Each skill provides explicit, actionable rules that GitHub Copilot applies during development.

**Skills auto-load via GitHub Copilot.** Reference specific skills when working in relevant areas.

## 🗂️ Role Index (analysis-producer / analysis-consumer / gh-aw-infrastructure)

| Role | Skills |
|---|---|
| **Analysis producers** (own artifacts under `analysis/daily/<run>/`) | `intelligence-analysis-techniques`, `political-science-analysis`, `osint-methodologies`, `behavioral-analysis`, `electoral-analysis`, `strategic-communication-analysis`, `risk-assessment-frameworks`, `data-science-for-intelligence` |
| **Analysis consumers** (read artifacts, render to content) | `ai-first-quality` (contract owner), `seo-best-practices`, `accessibility-excellence`, `business-model-canvas` |
| **Data / pipeline** (Stage A inputs) | `european-parliament-data`, `european-political-system`, `legislative-monitoring`, `mcp-server-integration`, `imf-data-integration` |
| **gh-aw infrastructure** (authoritative upstream docs pinned at top of each file) | `github-agentic-workflows`, `gh-aw-architecture`, `gh-aw-firewall`, `gh-aw-sandbox`, `mcp-gateway-configuration`, `mcp-gateway-security`, `mcp-gateway-troubleshooting` |
| **Compliance / security** | `compliance-frameworks`, `isms-compliance`, `sdlc-security-integration`, `security-by-design`, `threat-modeling`, `data-protection`, `open-source-governance`, `ai-governance` |
| **Quality / docs** | `testing-strategy`, `code-quality-excellence`, `documentation-standards`, `performance-optimization`, `c4-architecture-documentation` |

Canonical analysis anchors — every skill on the news critical path points to these:
[`ai-driven-analysis-guide.md`](../../analysis/methodologies/ai-driven-analysis-guide.md),
[`artifact-catalog.md`](../../analysis/methodologies/artifact-catalog.md),
[`per-artifact-methodologies.md`](../../analysis/methodologies/per-artifact-methodologies.md),
[`analysis/templates/README.md`](../../analysis/templates/README.md),
[`reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json).

## Skills Catalog

### 🏛️ Architecture Skills
- **[C4 Architecture Documentation](c4-architecture-documentation.md)** — C4 models, Mermaid diagrams, documentation portfolio requirements

### 🔒 Security Skills
- **[Security by Design](security-by-design.md)** — Defense-in-depth, CSP headers, input validation, STRIDE, SSDLC phase activities
- **[Threat Modeling](threat-modeling.md)** — STRIDE analysis, risk assessment, attack surface analysis
- **[Data Protection](data-protection.md)** — GDPR compliance, data classification, sanitization

### ✅ Compliance Skills
- **[Compliance Frameworks](compliance-frameworks.md)** — ISO 27001, NIST CSF 2.0, CIS Controls, GDPR, NIS2, EU CRA, Info Security Policy alignment
- **[ISMS Compliance](isms-compliance.md)** — ISMS policy references, CIA triad, evidence requirements, framework mapping
- **[SDLC Security Integration](sdlc-security-integration.md)** — Information Security Policy + Secure Development Policy + Open Source Policy consolidated into per-phase SSDLC gates, vulnerability SLA, dependency intake, contribution workflow, PR checklist

### 🧪 Quality Skills
- **[Testing Strategy](testing-strategy.md)** — Vitest unit tests, Playwright E2E, coverage requirements
- **[Code Quality Excellence](code-quality-excellence.md)** — ESLint, HTMLHint, JavaScript/HTML/CSS standards
- **[Accessibility Excellence](accessibility-excellence.md)** — WCAG 2.1 AA, keyboard navigation, screen readers
- **[AI-First Quality](ai-first-quality.md)** — Mandatory 2-pass iterative improvement for all AI-generated content, time-budget enforcement, quality gates

### ⚡ Performance Skills
- **[Performance Optimization](performance-optimization.md)** — Core Web Vitals, caching, asset optimization

### 📚 Documentation Skills
- **[Documentation Standards](documentation-standards.md)** — Document control, JSDoc, REUSE compliance

### 📜 Governance Skills
- **[Open Source Governance](open-source-governance.md)** — Apache-2.0, REUSE 3.3, SBOM, SLSA, OpenSSF

### 🇪🇺 Data Integration Skills
- **[European Parliament Data](european-parliament-data.md)** — EP MCP server tools, data validation, caching, fallback
- **[Legislative Monitoring](legislative-monitoring.md)** — OLP tracking, trilogue analysis, amendment patterns, plenary voting
- **[IMF Data Integration](imf-data-integration.md)** — IMF macroeconomic indicators, SDR/quota data, sovereign-risk signals for economic-context analysis

### 🔍 Intelligence & OSINT Skills
- **[Political Science Analysis](political-science-analysis.md)** — Comparative politics, MEP behavior, EU legislative procedures, democratic accountability
- **[OSINT Methodologies](osint-methodologies.md)** — OSINT collection, source evaluation, data integration, verification for EU Parliament data
- **[Intelligence Analysis Techniques](intelligence-analysis-techniques.md)** — ACH, SWOT, Devil's Advocacy, Red Team, structured analytics for EU analysis
- **[European Political System](european-political-system.md)** — EU Parliament structure, political groups, OLP, trilogue, committee system
- **[Data Science for Intelligence](data-science-for-intelligence.md)** — Statistical analysis, ML, NLP, time series, network analysis for political data
- **[Electoral Analysis](electoral-analysis.md)** — EU Parliament elections, seat distribution, political group formation, Spitzenkandidaten
- **[Behavioral Analysis](behavioral-analysis.md)** — MEP voting loyalty, cognitive biases, leadership profiling, cross-group collaboration
- **[Strategic Communication Analysis](strategic-communication-analysis.md)** — Narrative framing, media bias detection, discourse analysis, multi-language messaging
- **[Risk Assessment Frameworks](risk-assessment-frameworks.md)** — Democratic health, cohesion risk, legislative bottlenecks, early warning systems

### 💼 Business Strategy
- **[Business Model Canvas](business-model-canvas.md)** — Value proposition, customer segments, revenue streams, mission-aligned business model design

### 📢 Marketing & Growth
- **[SEO Best Practices](seo-best-practices.md)** — On-page SEO, technical SEO, keyword research, multi-language content optimization

### 🤖 AI & MCP Skills
- **[AI Governance](ai-governance.md)** — EU AI Act compliance, OWASP LLM security, responsible AI practices for content generation
- **[GitHub Agentic Workflows](github-agentic-workflows.md)** — Copilot coding agent, stacked PRs, agent selection
- **[MCP Server Integration](mcp-server-integration.md)** — MCP protocol, multi-server orchestration

### 🛡️ Infrastructure Skills
- **[GH AW Architecture](gh-aw-architecture.md)** — Layered security model (Sandbox → Gateway → Firewall)
- **[GH AW Firewall](gh-aw-firewall.md)** — Domain filtering, request sanitization, compliance
- **[GH AW Sandbox](gh-aw-sandbox.md)** — Resource isolation, secrets injection
- **[MCP Gateway Configuration](mcp-gateway-configuration.md)** — TOML/JSON config patterns

### 🔧 Operations Skills
- **[MCP Gateway Security](mcp-gateway-security.md)** — Authentication, container isolation
- **[MCP Gateway Troubleshooting](mcp-gateway-troubleshooting.md)** — Debug logging, issue resolution

## Skills Statistics

For the authoritative list, `ls .github/skills/*.md` is the source of truth. Categories above group every file currently in the directory.

## Agent Cross-Reference

The skills library supports the [custom agent catalogue](../agents/README.md). Each agent references relevant skills for their domain:

| Agent | Primary Skills | Supporting Skills |
|-------|---------------|-------------------|
| **news-journalist** | **ai-first-quality**, european-parliament-data, strategic-communication-analysis, political-science-analysis | behavioral-analysis, risk-assessment-frameworks, seo-best-practices, data-protection, sdlc-security-integration |
| **intelligence-operative** | **ai-first-quality**, political-science-analysis, osint-methodologies, intelligence-analysis-techniques, european-political-system, data-science-for-intelligence | electoral-analysis, behavioral-analysis, strategic-communication-analysis, legislative-monitoring, risk-assessment-frameworks, imf-data-integration, sdlc-security-integration |
| **business-development-specialist** | **ai-first-quality**, business-model-canvas, european-parliament-data, seo-best-practices | compliance-frameworks, data-protection, isms-compliance, sdlc-security-integration |
| **marketing-specialist** | **ai-first-quality**, seo-best-practices, strategic-communication-analysis, business-model-canvas | data-protection, european-parliament-data, accessibility-excellence, sdlc-security-integration |
| **data-pipeline-specialist** | **ai-first-quality**, european-parliament-data, legislative-monitoring, mcp-server-integration, sdlc-security-integration | performance-optimization, testing-strategy, data-science-for-intelligence, imf-data-integration, security-by-design |
| **frontend-specialist** | **ai-first-quality**, accessibility-excellence, code-quality-excellence, seo-best-practices, sdlc-security-integration | performance-optimization, security-by-design |
| **quality-engineer** | **ai-first-quality**, testing-strategy, code-quality-excellence, sdlc-security-integration | accessibility-excellence, performance-optimization, security-by-design |
| **documentation-architect** | **ai-first-quality**, c4-architecture-documentation, documentation-standards, sdlc-security-integration | isms-compliance, compliance-frameworks, european-political-system, security-by-design |
| **devops-engineer** | **ai-first-quality**, github-agentic-workflows, open-source-governance, sdlc-security-integration | gh-aw-architecture, gh-aw-firewall, gh-aw-sandbox, mcp-gateway-configuration, mcp-gateway-security, mcp-gateway-troubleshooting, security-by-design |
| **product-task-agent** | **ai-first-quality**, compliance-frameworks, isms-compliance, business-model-canvas, sdlc-security-integration | github-agentic-workflows, testing-strategy, risk-assessment-frameworks |
| _Security expertise_ (distributed — no standalone agent) | **security-by-design**, threat-modeling, isms-compliance, ai-governance, sdlc-security-integration | compliance-frameworks, data-protection, open-source-governance |

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

- **[Copilot Instructions](../copilot-instructions.md)** — Project-wide Copilot configuration
- **[Agent Catalog](../agents/README.md)** — specialized custom agents
- **[ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC)** — Hack23 security policies
- **[Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)** — SDLC security requirements

## License

All skills are licensed under Apache-2.0, consistent with Hack23's open-source commitment.
