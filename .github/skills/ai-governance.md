---
name: ai-governance
description: AI governance for EU Parliament journalism — EU AI Act compliance, OWASP LLM security, bias detection, and responsible content generation
license: Apache-2.0
---

# 🤖 AI Governance Skill

## Purpose

Establish governance frameworks for AI-assisted journalism in the EU Parliament Monitor. Covers EU AI Act compliance, OWASP LLM Top 10 mitigations, bias detection in parliamentary reporting, human oversight requirements, and secure integration of GitHub Copilot agents and EP MCP Server data pipelines.

## When to Use

✅ Generating multi-language news articles with AI assistance
✅ Configuring GitHub Copilot agent workflows (.github/agents/)
✅ Reviewing AI-generated content for bias or hallucination
✅ Processing EP MCP Server data through AI pipelines
✅ Labeling AI-generated or AI-assisted content
✅ Assessing EU AI Act obligations for the platform

❌ General software development without AI involvement
❌ Manual editorial decisions without AI tools
❌ EU AI Act compliance for other organizations
❌ AI model training or fine-tuning (not in scope)

## Core Framework

### AI Governance Decision Tree

```
AI Usage Decision:
│
├─ Is AI generating or modifying public-facing content?
│   ├─ YES → Apply full AI governance framework
│   │   ├─ Human review required before publication
│   │   ├─ AI involvement must be labeled
│   │   ├─ Bias check must be performed
│   │   └─ Source data must be verifiable (EP MCP)
│   └─ NO → Is AI assisting internal development?
│       ├─ YES → Apply development AI controls
│       │   ├─ Code review required (human + CodeQL)
│       │   ├─ Security scanning on AI-generated code
│       │   └─ Follow Hack23 AI Policy
│       └─ NO → Standard development practices
│
├─ EU AI Act Risk Classification
│   ├─ UNACCEPTABLE → Not applicable (no social scoring, etc.)
│   ├─ HIGH RISK → Not applicable (no biometric, hiring, etc.)
│   ├─ LIMITED RISK → ⚠️ AI-generated news content
│   │   ├─ Transparency obligation: label AI involvement
│   │   ├─ Users must know content is AI-assisted
│   │   └─ Clear disclosure in article metadata
│   └─ MINIMAL RISK → Development tooling (Copilot, linters)
│       └─ No specific obligations, but follow best practices
```

### EU AI Act Compliance for News Content

```
EU AI Act — Limited Risk Obligations:
│
├─ Article 50: Transparency Requirements
│   ├─ Disclose AI-generated content to users
│   ├─ Label articles as "AI-assisted" or "AI-generated"
│   └─ Provide clear attribution methodology
│
├─ Implementation in EU Parliament Monitor
│   ├─ HTML meta tag: <meta name="ai-generated" content="assisted">
│   ├─ Visible label: "This article was generated with AI assistance"
│   ├─ Footer disclosure: "Content verified against EP open data"
│   └─ Schema.org: "creativeWorkStatus": "AI-assisted"
│
└─ Exemptions
    ├─ AI used only for development tooling → minimal risk
    ├─ Human-edited content with minor AI suggestions → disclose
    └─ Fully human-written content → no AI label needed
```

### AI Content Labeling

```html
<!-- Required AI disclosure in article template -->
<article itemscope itemtype="https://schema.org/NewsArticle">
  <meta itemprop="creativeWorkStatus" content="AI-assisted">

  <!-- Visible disclosure -->
  <footer class="article-meta">
    <p class="ai-disclosure">
      📝 This article was generated with AI assistance using
      European Parliament open data. All facts are verified against
      official EP records via the
      <a href="https://github.com/Hack23/European-Parliament-MCP-Server">
        EP MCP Server</a>.
    </p>
  </footer>
</article>
```

### OWASP LLM Top 10 Mitigations

```
OWASP LLM Top 10 — EU Parliament Monitor Controls:
│
├─ LLM01: Prompt Injection
│   ├─ Risk: Malicious input manipulates article generation
│   ├─ Mitigation: EP MCP data is read-only, validated source
│   ├─ Control: Input sanitization before prompt construction
│   └─ Status: LOW risk (no user-supplied prompts in production)
│
├─ LLM02: Insecure Output Handling
│   ├─ Risk: AI output contains XSS, malformed HTML
│   ├─ Mitigation: HTML sanitization on all AI output
│   ├─ Control: escapeHtml() applied before rendering
│   └─ Status: MEDIUM risk — enforce output validation
│
├─ LLM03: Training Data Poisoning
│   ├─ Risk: Not applicable (no model training)
│   └─ Status: NOT APPLICABLE
│
├─ LLM04: Model Denial of Service
│   ├─ Risk: Excessive API calls to AI services
│   ├─ Mitigation: Rate limiting, budget caps
│   └─ Status: LOW risk (batch generation, not real-time)
│
├─ LLM05: Supply Chain Vulnerabilities
│   ├─ Risk: Compromised AI dependencies or models
│   ├─ Mitigation: Pin dependencies, npm audit, CodeQL
│   ├─ Control: SBOM generation, SLSA attestations
│   └─ Status: MEDIUM risk — monitor continuously
│
├─ LLM06: Sensitive Information Disclosure
│   ├─ Risk: AI leaks internal data in generated content
│   ├─ Mitigation: No secrets in prompts, data classification
│   ├─ Control: Output review for PII/internal references
│   └─ Status: LOW risk (EP data is public)
│
├─ LLM07: Insecure Plugin Design
│   ├─ Risk: MCP server integration vulnerabilities
│   ├─ Mitigation: Validate all MCP responses, least privilege
│   ├─ Control: Schema validation on MCP tool results
│   └─ Status: MEDIUM risk — validate MCP integration
│
├─ LLM08: Excessive Agency
│   ├─ Risk: AI agents perform unauthorized actions
│   ├─ Mitigation: Read-only MCP access, no write operations
│   ├─ Control: Agent permissions defined in .github/agents/
│   └─ Status: LOW risk (static site, no server-side execution)
│
├─ LLM09: Overreliance
│   ├─ Risk: Publishing AI content without verification
│   ├─ Mitigation: Human review required before merge
│   ├─ Control: PR review gates, editorial checklist
│   └─ Status: MEDIUM risk — enforce review workflow
│
└─ LLM10: Model Theft
    ├─ Risk: Not applicable (no proprietary models)
    └─ Status: NOT APPLICABLE
```

### Bias Detection in EU Parliament Reporting

```javascript
/**
 * Check article content for potential bias indicators.
 * Flags disproportionate coverage or loaded language.
 *
 * @param {Object} article - Generated article content
 * @param {string} article.text - Article body text
 * @param {string[]} article.mepsmentioned - MEPs referenced
 * @param {string[]} article.groupsMentioned - Political groups referenced
 * @returns {Object} Bias assessment with flags and recommendations
 */
function assessBias(article) {
  const flags = [];

  // Check political group balance
  const groupCount = {};
  for (const group of article.groupsMentioned) {
    groupCount[group] = (groupCount[group] || 0) + 1;
  }
  const maxMentions = Math.max(...Object.values(groupCount));
  const minMentions = Math.min(...Object.values(groupCount));
  if (maxMentions > minMentions * 3) {
    flags.push({
      type: 'DISPROPORTIONATE_COVERAGE',
      detail: 'One political group mentioned 3x+ more than others',
      groups: groupCount
    });
  }

  // Check for loaded language
  const loadedTerms = [
    'radical', 'extreme', 'dangerous', 'shocking',
    'unprecedented crisis', 'power grab', 'elite'
  ];
  for (const term of loadedTerms) {
    if (article.text.toLowerCase().includes(term)) {
      flags.push({
        type: 'LOADED_LANGUAGE',
        detail: `Contains potentially loaded term: "${term}"`,
        recommendation: 'Replace with neutral factual language'
      });
    }
  }

  // Check country balance in cross-country articles
  if (article.mepsMentioned && article.mepsMentioned.length > 5) {
    const countries = new Set(article.mepsMentioned.map(m => m.country));
    if (countries.size < 3) {
      flags.push({
        type: 'GEOGRAPHIC_BIAS',
        detail: 'Article mentions MEPs from fewer than 3 countries',
        recommendation: 'Include perspectives from more member states'
      });
    }
  }

  return {
    hasBiasFlags: flags.length > 0,
    flags,
    overallRisk: flags.length === 0 ? 'LOW' : flags.length <= 2 ? 'MEDIUM' : 'HIGH'
  };
}
```

### GitHub Copilot Agent Security

```
Agent Security Controls (.github/agents/):
│
├─ Agent Inventory (8 specialized agents)
│   ├─ news-journalist — content generation
│   ├─ data-pipeline-specialist — MCP integration
│   ├─ frontend-specialist — HTML/CSS/accessibility
│   ├─ quality-engineer — testing and validation
│   ├─ security-architect — security controls
│   ├─ documentation-architect — documentation
│   ├─ devops-engineer — CI/CD pipelines
│   └─ product-task-agent — issue management
│
├─ Security Principles
│   ├─ Least privilege: agents access only required tools
│   ├─ Separation of duties: no single agent has full control
│   ├─ Audit trail: all agent actions logged via Git history
│   ├─ Human gate: PR review required for all agent output
│   └─ No secrets: agents never handle credentials directly
│
├─ Content Generation Controls
│   ├─ news-journalist: EP MCP data only (no external sources)
│   ├─ Output must pass HTMLHint + axe-core validation
│   ├─ Multi-language output must match source data
│   └─ AI disclosure label required on all generated articles
│
└─ MCP Integration Security
    ├─ EP MCP Server: read-only access to public EP data
    ├─ Schema validation on all MCP tool responses
    ├─ Rate limiting to prevent excessive API calls
    └─ No PII extraction from parliamentary data
```

### Human Oversight Requirements

```
Human Oversight Workflow:
│
├─ Level 1: Automated Checks (CI/CD)
│   ├─ HTMLHint validation
│   ├─ axe-core accessibility check
│   ├─ JSON-LD schema validation
│   ├─ Hreflang completeness check
│   └─ Bias detection (automated flags)
│
├─ Level 2: Peer Review (PR Review)
│   ├─ Factual accuracy against EP source data
│   ├─ Political neutrality assessment
│   ├─ Language quality (native speaker review)
│   ├─ AI disclosure label present
│   └─ No hallucinated data or statistics
│
├─ Level 3: Editorial Oversight
│   ├─ Cross-article consistency check
│   ├─ Topic balance across political spectrum
│   ├─ Sensitive topic escalation
│   └─ Final publication approval
│
└─ Escalation Triggers
    ├─ Bias flags detected (auto-escalate to Level 2)
    ├─ Factual discrepancy with EP data (block publication)
    ├─ Controversial political topic (escalate to Level 3)
    └─ Data unavailable from MCP (flag for manual research)
```

### AI Governance Checklist

| Check | Requirement | Responsible |
|-------|------------|-------------|
| AI disclosure | Label present on all AI-assisted content | news-journalist agent |
| Bias review | Automated bias detection passed | CI/CD pipeline |
| Fact verification | Data matches EP MCP source records | Human reviewer |
| Language quality | Native-level quality in target language | Human reviewer |
| PII protection | No personal data beyond public records | Data pipeline |
| Output sanitization | HTML escaped, no XSS vectors | Frontend validation |
| Agent permissions | Least privilege enforced | security-architect |
| Audit trail | All changes tracked in Git history | Git + GitHub |
| EU AI Act | Transparency obligations met | Editorial team |
| OWASP LLM | Top 10 mitigations applied | security-architect |

## ISMS Compliance Mapping

### ISO 27001:2022
- **A.5.1**: Information security policies — AI governance policy documented
- **A.5.8**: Information security in project management — AI risk assessment
- **A.5.23**: Cloud service security — AI service provider controls
- **A.8.25**: Secure development lifecycle — AI code review gates
- **A.8.28**: Secure coding — input/output validation for AI pipelines

### NIST CSF 2.0
- **GV.OC-03**: Legal and regulatory requirements (EU AI Act)
- **GV.RM-02**: Risk appetite for AI-generated content defined
- **PR.DS-01**: Data protection for AI-processed parliamentary data
- **DE.CM-01**: Monitoring AI output quality and bias
- **RS.AN-01**: Incident analysis for AI content errors

### CIS Controls v8.1
- **CIS-2**: Software asset inventory — AI tools and models tracked
- **CIS-7**: Vulnerability management — AI dependency scanning
- **CIS-16**: Application security — AI output validation
- **CIS-17**: Incident response — AI content error handling

### GDPR
- **Article 5**: Data minimization in AI processing
- **Article 13**: Information provision (AI transparency)
- **Article 22**: Automated decision-making safeguards
- **Article 25**: Data protection by design in AI pipelines
- **Article 35**: DPIA for high-risk AI processing (if applicable)

### EU AI Act
- **Article 50**: Transparency for AI-generated content
- **Article 52**: Obligations for limited-risk AI systems
- **Annex III**: High-risk classification assessment (not applicable)

## Hack23 ISMS Policy References

- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md)
- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)

## References

- [EU AI Act Official Text](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [NIST AI Risk Management Framework](https://www.nist.gov/artificial-intelligence/ai-risk-management-framework)
- [Hack23 AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md)
- [GitHub Copilot Trust Center](https://resources.github.com/copilot-trust-center/)
- [European Parliament Open Data](https://data.europarl.europa.eu/)
- [EU AI Act Impact Assessment Guide](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)
