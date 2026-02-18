# Security Policy

## Supported Versions

This project is under active development, and we provide security updates for the latest version only. Please ensure you're using the latest version of the project to receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Security Architecture

For comprehensive information about the security architecture, threat model, and security controls implemented in EU Parliament Monitor, please refer to:

- **[Security Architecture](SECURITY_ARCHITECTURE.md)** - Complete security implementation overview with C4 diagrams, threat model (STRIDE analysis), and compliance mapping
- **[Future Security Architecture](FUTURE_SECURITY_ARCHITECTURE.md)** - Security enhancement roadmap (2026-2027)
- **[Hack23 ISMS Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)** - Organization-wide secure development standards

## Reporting a Vulnerability

We take the security of the EU Parliament Monitor project seriously. If you have found a potential security vulnerability, we kindly ask you to report it privately, so that we can assess and address the issue before it becomes publicly known.

### What Constitutes a Vulnerability

A vulnerability is a weakness or flaw in the project that can be exploited to compromise the security, integrity, or availability of the system or its data. Examples of vulnerabilities include, but are not limited to:

- Cross-site scripting (XSS) attacks
- HTML injection vulnerabilities
- Insecure dependencies or supply chain attacks
- Exposure of sensitive data
- Insecure defaults or configurations
- Insufficient input validation
- Content Security Policy bypasses

### How to Privately Report a Vulnerability using GitHub

Please follow these steps to privately report a security vulnerability:

1. On GitHub.com, navigate to the main page of the [euparliamentmonitor repository](https://github.com/Hack23/euparliamentmonitor).
2. Under the repository name, click **Security**. If you cannot see the "Security" tab, select the dropdown menu, and then click **Security**.
3. In the left sidebar, under "Reporting", click **Advisories**.
4. Click **Report a vulnerability** to open the advisory form.
5. Fill in the advisory details form. Provide as much information as possible to help us understand and reproduce the issue, including:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested mitigation (if known)
6. At the bottom of the form, click **Submit report**.

After you submit the report, the maintainers of the euparliamentmonitor repository will be notified. They will review the report, validate the vulnerability, and take necessary actions to address the issue. You will be added as a collaborator and credited for the security advisory.

### Alternative Reporting Methods

If you prefer not to use GitHub's security advisory system, you can also report vulnerabilities via:

- **Email**: security@hack23.com
- **Subject**: [SECURITY] EU Parliament Monitor - [Brief Description]

### Disclosure Timeline

Upon receipt of a vulnerability report, our team will:

1. **Acknowledge** the report within **48 hours**
2. **Validate** the vulnerability within **7 days**
3. **Develop and release** a patch or mitigation within **30 days** for critical/high severity issues, depending on complexity
4. **Publish** a security advisory with a detailed description of the vulnerability and the fix

**Severity-Based SLAs** (per [Hack23 ISMS Vulnerability Management Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md)):

| Severity | Remediation SLA | Description |
|----------|----------------|-------------|
| Critical (CVSS 9.0-10.0) | 7 days | Immediate threat, active exploitation possible |
| High (CVSS 7.0-8.9) | 30 days | Significant security impact |
| Medium (CVSS 4.0-6.9) | 90 days | Moderate security impact |
| Low (CVSS 0.1-3.9) | Best effort | Minimal security impact |

### Security Testing

We employ multiple layers of security testing:

- **SAST**: CodeQL scanning (automated, weekly + PR triggers)
- **SCA**: Dependabot dependency scanning (daily)
- **Manual Testing**: Security-focused unit tests (≥80% coverage)
- **Vulnerability Scanning**: npm audit (automated in CI/CD)

See [SECURITY_ARCHITECTURE.md - Security Testing](SECURITY_ARCHITECTURE.md#-security-testing) for details.

### Scope

**In Scope**:
- News generation scripts (scripts/)
- HTML templates and output
- MCP client integration
- GitHub Actions workflows
- Dependencies and supply chain

**Out of Scope**:
- Third-party services (GitHub, European Parliament APIs)
- Infrastructure (GitHub Pages hosting)
- Client-side browser vulnerabilities (not controlled by this project)

### Recognition and Anonymity

We appreciate your effort in helping us maintain a secure and reliable project. If your report results in a confirmed security fix, we will recognize your contribution in:

- Release notes
- Security advisory acknowledgment
- Public GitHub recognition (unless you request to remain anonymous)

Contributors who help improve our security posture may also be considered for our Security Hall of Fame.

## Security Compliance

EU Parliament Monitor aligns with:

- **ISO 27001**: Information security management (see [SECURITY_ARCHITECTURE.md - Compliance Matrix](SECURITY_ARCHITECTURE.md#-compliance-matrix))
- **GDPR**: Data protection and privacy (European Parliament open data is public)
- **NIS2**: Network and information security (Article 20, 21 compliance)
- **EU Cyber Resilience Act**: Software supply chain security (SBOM, vulnerability disclosure)
- **NIST Cybersecurity Framework 2.0**: Identify, Protect, Detect, Respond, Recover
- **CIS Controls v8.1**: Critical security controls implementation
- **OWASP Top 10**: Web application security best practices

## Security Metrics

Current security posture (updated monthly):

- **Zero** known vulnerabilities (npm audit clean)
- **82%+** code coverage with security tests
- **100%** dependency scanning coverage
- **0** CodeQL critical/high findings
- **OpenSSF Scorecard**: Target ≥7.0 (in progress)

See [SECURITY_ARCHITECTURE.md - Security Metrics](SECURITY_ARCHITECTURE.md#-security-metrics) for detailed metrics.

## Security Resources

- **Threat Model**: [SECURITY_ARCHITECTURE.md - Threat Model](SECURITY_ARCHITECTURE.md#-threat-model)
- **Security Controls**: [SECURITY_ARCHITECTURE.md - Security Controls](SECURITY_ARCHITECTURE.md#-security-controls)
- **Incident Response**: [Hack23 ISMS Incident Response Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md)
- **Vulnerability Management**: [Hack23 ISMS Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md)

## Contact

For non-security issues, please use:
- **GitHub Issues**: https://github.com/Hack23/euparliamentmonitor/issues
- **General Inquiries**: info@hack23.com

---

Thank you for helping us keep the EU Parliament Monitor project and its users safe. Your contributions to our security posture are greatly appreciated!
