# ✅ Compliance Frameworks Skill

## Purpose

Ensure all development aligns with applicable regulatory and compliance frameworks: ISO 27001:2022, NIST CSF 2.0, CIS Controls v8.1, GDPR, NIS2 Directive, and EU Cyber Resilience Act.

## Rules

### MUST (Critical)
1. Security features MUST be mapped to applicable compliance frameworks
2. GDPR data protection principles MUST be followed for all PII handling
3. Critical/high vulnerabilities MUST be remediated per SLA
4. Compliance documentation MUST be kept current

### SHOULD (High Priority)
1. Map features to NIST CSF 2.0 functions
2. Document NIS2 compliance measures
3. Maintain CIS Controls implementation evidence
4. Conduct quarterly compliance reviews

## ISO 27001:2022 Controls

### Key Technological Controls
- **A.8.5**: Secure authentication
- **A.8.8**: Management of technical vulnerabilities
- **A.8.9**: Configuration management
- **A.8.24**: Use of cryptography
- **A.8.25**: Secure development life cycle
- **A.8.26**: Application security requirements
- **A.8.28**: Secure coding
- **A.8.32**: Change management

## NIST Cybersecurity Framework 2.0

### Six Core Functions
1. **Govern (GV)**: Establish cybersecurity risk management strategy
2. **Identify (ID)**: Understand cybersecurity risks to assets
3. **Protect (PR)**: Implement safeguards (TLS 1.3, CSP headers, SRI)
4. **Detect (DE)**: Identify cybersecurity events (CodeQL, Dependabot)
5. **Respond (RS)**: Take action on incidents
6. **Recover (RC)**: Restore capabilities

## CIS Controls v8.1

### Implementation Groups
- **IG1**: Basic cyber hygiene (software inventory, vulnerability scanning)
- **IG2**: Additional controls (security event alerting, log management)
- **IG3**: Advanced controls (penetration testing, incident response)

### Key Controls for Static Sites
- **CIS-2**: Inventory and control of software assets (package.json, npm audit)
- **CIS-4**: Secure configuration (security headers, CSP)
- **CIS-7**: Continuous vulnerability management (Dependabot, CodeQL)
- **CIS-16**: Application software security (SAST, code review)

## GDPR Compliance

### Key Principles
- **Data minimization**: Collect only necessary data
- **Privacy by design**: Build privacy into systems from the start
- **Right to erasure**: Support data deletion requests
- **Lawful basis**: Document legal basis for processing

### Static Site Considerations
- No cookies without consent
- No tracking without disclosure
- Privacy policy accessible
- Contact information available

## NIS2 Directive

### Cybersecurity Measures (Article 21)
- Risk analysis and information security policies
- Incident handling procedures
- Supply chain security
- Cryptography and encryption usage
- Access control and asset management

## EU Cyber Resilience Act

### Essential Requirements
- Products delivered without known exploitable vulnerabilities
- Secure by default configuration
- Vulnerability disclosure policy published
- Support period defined

## Evidence References
- [Compliance Checklist](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Compliance_Checklist.md)
- [CRA Conformity Assessment](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CRA_Conformity_Assessment_Process.md)
- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
- [Cryptography Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md)

## Information Security Policy Alignment

The Hack23 Information Security Policy is the umbrella under which every other compliance framework is implemented. It sets organisation-wide direction that every agent and change applies:

| InfoSec Policy Directive | Concrete Implementation in EU Parliament Monitor |
|--------------------------|--------------------------------------------------|
| CIA triad as primary decision lens | Classification in ISMS skill; validated at design & review gates |
| Risk-based decisions | Threat model + Risk Register; quantified severity drives SLA |
| Defense in depth | Sandbox → AWF firewall → MCP gateway → app → CSP layers |
| Least privilege | Fine-grained GitHub tokens, minimal workflow `permissions:`, scoped MCP tools |
| Segregation of duties | Protected branches; author cannot self-merge security-sensitive changes |
| Continuous improvement | Quarterly SECURITY_ARCHITECTURE review; dependency refresh via Dependabot |
| Accountability | Named owners for each control; incident post-mortem after every P1/P2 |

## Cross-Framework Mapping (Hack23 baseline)

| Control Area | ISO 27001:2022 | NIST CSF 2.0 | CIS v8.1 | Implementation |
|--------------|----------------|--------------|----------|----------------|
| Governance | A.5.1, A.5.2 | GV.PO, GV.RR | CIS-14 | ISMS-PUBLIC repo, policy ownership |
| Risk assessment | A.5.7 | ID.RA | CIS-13 | Risk_Register.md, threat model in PRs |
| Asset inventory | A.5.9, A.5.10 | ID.AM | CIS-1, CIS-2 | package.json, SBOM, ARCHITECTURE.md |
| Access control | A.5.15–A.5.18, A.8.2–A.8.5 | PR.AA | CIS-5, CIS-6 | Access_Control_Policy.md, GH org roles |
| Cryptography | A.8.24 | PR.DS-2 | CIS-3.10 | Cryptography_Policy.md, TLS 1.3 only |
| Secure development | A.8.25, A.8.28 | PR.IP-2 | CIS-16 | SSDLC gates, CodeQL, ESLint |
| Vulnerability management | A.8.8 | DE.CM-8 | CIS-7 | Dependabot, GHSA, SLA tracking |
| Monitoring | A.8.16 | DE.CM | CIS-8 | GitHub audit log, CI run history |
| Incident response | A.5.24–A.5.27 | RS | CIS-17 | Incident_Response_Plan.md |
| Supplier | A.5.19–A.5.22 | ID.SC, PR.AT | CIS-15 | Third_Party_Management.md, SBOM |
| Change management | A.8.32 | PR.IP-3 | CIS-4.7 | PR review, protected branches |

## Related Skills

- [sdlc-security-integration](sdlc-security-integration.md) — Actionable SSDLC gates + evidence matrix
- [isms-compliance](isms-compliance.md) — ISMS policy references + evidence
- [security-by-design](security-by-design.md) — Defense-in-depth patterns
- [open-source-governance](open-source-governance.md) — OSS intake + release
- [ai-governance](ai-governance.md) — EU AI Act + OWASP LLM
