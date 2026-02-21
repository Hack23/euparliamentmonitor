# EU Parliament Monitor - Skills Library

## Purpose

Skills are reusable knowledge units that encode Hack23's security policies, architecture patterns, quality standards, and compliance requirements. Each skill provides explicit, actionable rules that GitHub Copilot applies during development.

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

### 🤖 Agentic Workflow Skills (2 skills)
- **[GitHub Agentic Workflows](github-agentic-workflows.md)** — Copilot coding agent, stacked PRs, agent selection
- **[MCP Server Integration](mcp-server-integration.md)** — MCP protocol, multi-server orchestration

### 🛡️ Infrastructure Skills (4 skills)
- **[GH AW Architecture](gh-aw-architecture.md)** — Layered security model (Sandbox → Gateway → Firewall)
- **[GH AW Firewall](gh-aw-firewall.md)** — Domain filtering, request sanitization, compliance
- **[GH AW Sandbox](gh-aw-sandbox.md)** — Resource isolation, secrets injection
- **[MCP Gateway Configuration](mcp-gateway-configuration.md)** — TOML/JSON config patterns

### 🧠 Analysis Skills (4 skills)
- **[Electoral Analysis](electoral-analysis.md)** — EU Parliament elections, seat distribution, political group formation, Spitzenkandidaten
- **[Behavioral Analysis](behavioral-analysis.md)** — MEP voting loyalty, cognitive biases, leadership profiling, cross-group collaboration
- **[Strategic Communication Analysis](strategic-communication-analysis.md)** — Narrative framing, media bias detection, discourse analysis, multi-language messaging
- **[Risk Assessment Frameworks](risk-assessment-frameworks.md)** — Democratic health, cohesion risk, legislative bottlenecks, early warning systems

### 🔧 Operations Skills (2 skills)
- **[MCP Gateway Security](mcp-gateway-security.md)** — Authentication, container isolation
- **[MCP Gateway Troubleshooting](mcp-gateway-troubleshooting.md)** — Debug logging, issue resolution

## Skills Statistics

**Total Skills**: 26 skills across 11 categories

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
| Analysis | 4 | Electoral, behavioral, communication, risk assessment |
| Agentic Workflows | 2 | Copilot agents, MCP protocol |
| Infrastructure | 4 | AW architecture, firewall, sandbox, gateway |
| Operations | 2 | Gateway security, troubleshooting |

## Skills by Agent

| Agent | Primary Skills | Supporting Skills |
|-------|---------------|-------------------|
| **news-journalist** | european-parliament-data, electoral-analysis, strategic-communication-analysis | behavioral-analysis, risk-assessment-frameworks, data-protection |
| **data-pipeline-specialist** | european-parliament-data, legislative-monitoring, mcp-server-integration | performance-optimization, testing-strategy |
| **frontend-specialist** | accessibility-excellence, code-quality-excellence | performance-optimization, security-by-design |
| **quality-engineer** | testing-strategy, code-quality-excellence | accessibility-excellence, performance-optimization |
| **security-architect** | security-by-design, threat-modeling, isms-compliance | compliance-frameworks, data-protection |
| **documentation-architect** | c4-architecture-documentation, documentation-standards | isms-compliance, compliance-frameworks |
| **devops-engineer** | github-agentic-workflows, open-source-governance | gh-aw-architecture, mcp-gateway-security |
| **product-task-agent** | compliance-frameworks, isms-compliance | github-agentic-workflows, testing-strategy |

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
- **[Agent Catalog](../agents/README.md)** — 8 specialized custom agents
- **[ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC)** — Hack23 security policies
- **[Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)** — SDLC security requirements

## License

All skills are licensed under Apache-2.0, consistent with Hack23's open-source commitment.
