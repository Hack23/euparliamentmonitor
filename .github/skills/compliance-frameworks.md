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
- [Cryptography Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md)
