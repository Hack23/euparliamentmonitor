# Security Policy

## 🛡️ Security Overview

EU Parliament Monitor takes security seriously. This document outlines our
security practices, vulnerability disclosure process, and how to report security
issues.

**Security Architecture**: For comprehensive security implementation details,
see [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md).

**ISMS Compliance**: This project follows
[Hack23 ISMS Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
and
[Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md).

## Supported Versions

We provide security updates for the following versions:

| Version | Supported |
| ------- | --------- |
| 1.x.x   | ✅ Yes    |
| < 1.0   | ❌ No     |

**Note**: We strongly recommend always using the latest stable release to
benefit from the most recent security updates.

## Reporting Security Issues

### ⚠️ Please DO NOT Report Security Vulnerabilities Through Public GitHub Issues

If you discover a security vulnerability, please report it responsibly through
one of the following channels:

### 🔒 Preferred Method: GitHub Security Advisories

1. Navigate to the
   [euparliamentmonitor repository](https://github.com/Hack23/euparliamentmonitor)
2. Click on the **Security** tab
3. In the left sidebar, under "Reporting", click **Advisories**
4. Click **Report a vulnerability** to open the advisory form
5. Fill in the advisory details form with as much information as possible
6. Click **Submit report**

**Benefits of using GitHub Security Advisories**:

- Secure, private disclosure channel
- Automatic CVE assignment (if applicable)
- Coordinated disclosure timeline
- Recognition in security advisory

### 📧 Alternative Method: Email

Send vulnerability reports to:
**[security@hack23.com](mailto:security@hack23.com)**

**For sensitive information, use PGP encryption**:

- PGP Key: Available at
  [https://hack23.com/pgp-key.asc](https://hack23.com/pgp-key.asc)
- Key Fingerprint: (to be added)

## What to Include in Your Report

To help us understand and address the issue quickly, please include:

### Required Information

- **Vulnerability Type**: (e.g., XSS, injection, authorization bypass)
- **Affected Component**: Which file, function, or feature is affected
- **Attack Vector**: How can the vulnerability be exploited
- **Impact**: What is the potential security impact
- **Steps to Reproduce**: Detailed steps to reproduce the vulnerability
- **Proof of Concept**: Code, screenshots, or commands demonstrating the issue

### Optional But Helpful

- **Suggested Fix**: If you have ideas on how to fix the issue
- **Related Issues**: Links to similar vulnerabilities or related security
  concerns
- **CVE References**: If the issue is related to known CVEs
- **CVSS Score**: If you've calculated a severity score

### Example Report Template

```
**Vulnerability Type**: Cross-Site Scripting (XSS)

**Affected Component**: scripts/article-template.js, line 123

**Attack Vector**: User-controlled data from MCP server is not sanitized before being inserted into HTML.

**Impact**: An attacker with control over MCP server data could inject malicious JavaScript that executes in users' browsers.

**Steps to Reproduce**:
1. Set up malicious MCP server that returns payload: <script>alert('XSS')</script>
2. Run news generation with: npm run generate-news
3. Open generated article in browser
4. Observe alert dialog

**Proof of Concept**:
[Include code or screenshot]

**Suggested Fix**: Use DOMPurify or implement stricter HTML sanitization in sanitizeUserInput().
```

## Response Timeline

We are committed to responding to security vulnerabilities promptly:

| Phase                   | Timeline                                   |
| ----------------------- | ------------------------------------------ |
| **Initial Response**    | Within 48 hours of report submission       |
| **Validation & Triage** | Within 7 days                              |
| **Fix Development**     | Based on severity (see below)              |
| **Security Advisory**   | Published after fix is deployed            |
| **CVE Assignment**      | If applicable, coordinated with disclosure |

### Fix Timeline by Severity

| Severity     | Description                                  | Fix Timeline |
| ------------ | -------------------------------------------- | ------------ |
| **Critical** | Remote code execution, authentication bypass | 7 days       |
| **High**     | XSS, injection, significant data exposure    | 14 days      |
| **Medium**   | CSRF, information disclosure, DoS            | 30 days      |
| **Low**      | Minor security improvements                  | 90 days      |

**Note**: Complex fixes may require additional time. We will keep you informed
throughout the process.

## Security Update Process

Once a vulnerability is confirmed, we follow this process:

1. **Acknowledgment**: We acknowledge receipt of your report within 48 hours
2. **Validation**: Our security team validates the vulnerability within 7 days
3. **Fix Development**: We develop and test a fix according to severity
   timelines
4. **Security Advisory**: We prepare a GitHub Security Advisory (private draft)
5. **Fix Deployment**: We release the fix in a new version
6. **Public Disclosure**: We publish the security advisory and credit the
   reporter
7. **Notification**: We notify users through GitHub releases and security tab

### Example Security Advisory

When we publish a security advisory, it includes:

- **CVE Number**: (if assigned)
- **Severity**: CVSS score and severity level
- **Affected Versions**: Which versions are vulnerable
- **Fixed Versions**: Which versions include the fix
- **Attack Vector**: How the vulnerability can be exploited
- **Mitigation**: Steps users can take to protect themselves
- **Credits**: Recognition of the security researcher who reported the issue

## Security Best Practices for Users

To maintain a secure deployment of EU Parliament Monitor:

### Keep Dependencies Updated

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Update to latest stable version
git pull origin main
npm install
```

### Enable Security Features

1. **Dependabot Alerts**: Enable in GitHub repository settings
2. **CodeQL Scanning**: Automatically enabled for all forks
3. **Secret Scanning**: Monitor for accidentally committed secrets

### Monitor Security Advisories

- Watch the repository for security announcements
- Subscribe to
  [GitHub Security Advisories](https://github.com/Hack23/euparliamentmonitor/security/advisories)
- Check the
  [Security tab](https://github.com/Hack23/euparliamentmonitor/security)
  regularly

### Follow Secure Development Practices

When contributing to the project:

- Read [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) for security
  controls
- Follow
  [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- Review security section in [CONTRIBUTING.md](CONTRIBUTING.md)
- Run security tests before submitting PRs:
  ```bash
  npm audit
  npm run lint
  npm test
  ```

## Security Features

EU Parliament Monitor implements multiple layers of security:

### Static Site Security

- ✅ **No Server-Side Execution**: Pure static HTML/CSS/JS
- ✅ **No Database**: Eliminates SQL injection and database vulnerabilities
- ✅ **No User Input**: No forms or user-generated content
- ✅ **HTTPS Only**: All content served over secure connections
- ✅ **Content Security Policy**: Restrictive CSP headers

### Supply Chain Security

- ✅ **Zero Runtime Dependencies**: No production dependencies
- ✅ **SHA-Pinned Actions**: All GitHub Actions pinned to commit SHAs
- ✅ **Dependabot**: Automated dependency updates
- ✅ **npm Audit**: Regular vulnerability scanning
- ✅ **SBOM Generation**: Software Bill of Materials for transparency

### Development Security

- ✅ **CodeQL Analysis**: Automated security code scanning (SAST)
- ✅ **ESLint Security Rules**: Security-focused linting
- ✅ **Pre-commit Hooks**: Automated security checks before commit
- ✅ **Security Tests**: Dedicated security test suite
- ✅ **Input Validation**: Multi-layer XSS prevention

### Infrastructure Security

- ✅ **GitHub-Hosted Runners**: Ephemeral, isolated build environments
- ✅ **Least Privilege**: Minimal required permissions for workflows
- ✅ **Secrets Management**: Secure handling of credentials
- ✅ **Audit Logging**: Complete audit trail via Git history

For detailed information, see
[SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md).

## Security Testing

We maintain comprehensive security testing:

### Automated Security Scanning

```bash
# SAST (Static Application Security Testing)
# Runs automatically via CodeQL on every push and PR

# Dependency Scanning
npm audit

# Linting with security rules
npm run lint

# Run security-focused tests
npm run test:unit -- --grep="security|xss|injection|sanitize"
```

### Manual Security Testing

Before releases, we conduct:

- Threat model review (see [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md))
- Dependency vulnerability assessment
- Code review focusing on security-critical paths
- XSS and injection testing
- Supply chain security verification

## Known Security Considerations

### Current Security Posture

**Classification** (per
[ISMS Classification Framework](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md)):

- **Confidentiality**: Public (Level 1) - European Parliament open data
- **Integrity**: Medium (Level 2) - News accuracy critical
- **Availability**: Medium (Level 2) - Daily updates expected

**Risk Assessment**:

- **P1 (Medium Risk)**: Data integrity issues if MCP server compromised or
  returns malicious data
  - **Mitigation**: Multi-layer input validation and sanitization
  - **Status**: Additional automated content verification planned (Q3 2026)
- **P2 (Low Risk)**: Supply chain attacks via dependencies
  - **Mitigation**: Zero production dependencies, SHA-pinned actions, Dependabot
  - **Status**: Continuously monitored
- **P3-P5 (Low Risk)**: Other threats have robust controls (see
  [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md))

### Known False Positives

**ajv ReDoS Vulnerability (GHSA-2g4f-4pwh-qvx6)**

- **Status**: False Positive (Not Exploitable) - Upgrade Blocked by Plugin
  Compatibility
- **Affected Package**: ajv < 8.18.0 (transitive dependency via @eslint/eslintrc
  in ESLint 9.x)
- **Severity**: Moderate (CVSS: N/A)
- **Description**: ReDoS vulnerability when using `$data` option in ajv schema
  validation
- **Analysis**:
  - ESLint and @eslint/eslintrc do not use the `$data` option in their ajv
    configurations
  - The vulnerability cannot be exploited in our usage context
  - Review of dependency code confirms no use of vulnerable feature
- **Resolution Path**:
  - **ESLint 10 Status**: Released (10.0.0) on 2026-02-17 but still uses ajv 6.x
    internally
  - **Blocker**: ESLint plugins not yet updated for ESLint 10 API changes:
    - `eslint-plugin-security@3.0.1`: Uses deprecated `context.getSourceCode()`
      API
    - `eslint-plugin-sonarjs@3.0.7`: Peer dependency limited to
      `^8.0.0 || ^9.0.0`
    - `eslint-plugin-jsdoc@62.5.5`: Peer dependency limited to
      `^7.0.0 || ^8.0.0 || ^9.0.0`
  - **Action Required**: Monitor plugin updates for ESLint 10 compatibility
  - **Timeline**: Expected Q2-Q3 2026 as plugin ecosystem catches up
- **Monitoring**:
  - Track plugin releases monthly
  - Test ESLint 10 compatibility when plugins release updates
  - Re-evaluated 2026-02-17
- **Risk Level**: Accepted (No exploitable attack vector in current
  implementation)
- **CI/CD Handling**: The CI security check workflow has been configured to
  allow this documented false positive while still failing on new or
  undocumented vulnerabilities. The workflow validates that only known false
  positives (GHSA-2g4f-4pwh-qvx6) are present and fails if any high/critical or
  undocumented moderate vulnerabilities are detected.
- **Last Reviewed**: 2026-02-17

### Limitations

As a static site generator:

- No runtime authentication/authorization mechanisms
- Content integrity depends on MCP server trustworthiness
- Limited real-time threat detection (relies on GitHub security features)

## Hall of Fame

We recognize security researchers who have responsibly disclosed
vulnerabilities:

<!-- This section will be populated as security reports are received and fixed -->

_No security vulnerabilities have been reported to date._

To be added to the Hall of Fame:

1. Report a valid security vulnerability
2. Follow responsible disclosure practices
3. Allow us to fix the issue before public disclosure
4. Optionally provide your name/handle and link

Recognition includes:

- Public acknowledgment in this file
- Credit in security advisory
- Link to your GitHub profile or website (optional)
- Mention in release notes

## Compliance & Standards

EU Parliament Monitor security practices align with:

- ✅ **ISO 27001**: Information Security Management (A.16.1 - Vulnerability
  Management)
- ✅ **GDPR**: Data protection by design and default
- ✅ **NIS2**: Network and information security requirements
- ✅ **EU Cyber Resilience Act**: Coordinated vulnerability disclosure
- ✅ **NIST CSF 2.0**: Identify, Protect, Detect, Respond, Recover
- ✅ **CIS Controls v8.1**: Continuous vulnerability management

For detailed compliance mapping, see
[SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md).

## Security Metrics

Current security posture:

- ✅ **Zero Known Vulnerabilities**: npm audit clean
- ✅ **82%+ Code Coverage**: Including security tests
- ✅ **100% Dependency Scanning**: All dependencies monitored
- ✅ **0 CodeQL Findings**: No critical/high security issues
- ✅ **Daily Scans**: Automated security scanning

## Additional Resources

### Documentation

- [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) - Complete security
  architecture
- [FUTURE_SECURITY_ARCHITECTURE.md](FUTURE_SECURITY_ARCHITECTURE.md) - Security
  roadmap
- [CONTRIBUTING.md](CONTRIBUTING.md) - Security section for contributors
- [Hack23 ISMS](https://github.com/Hack23/ISMS-PUBLIC) - Organization security
  policies

### Security Tools

- [GitHub Security Advisories](https://github.com/Hack23/euparliamentmonitor/security/advisories)
- [Dependabot Alerts](https://github.com/Hack23/euparliamentmonitor/security/dependabot)
- [CodeQL Results](https://github.com/Hack23/euparliamentmonitor/security/code-scanning)
- [Security Policy](https://github.com/Hack23/euparliamentmonitor/security/policy)

### Contact

- **Security Issues**: [security@hack23.com](mailto:security@hack23.com)
- **General Questions**:
  [GitHub Discussions](https://github.com/Hack23/euparliamentmonitor/discussions)
- **Bug Reports**:
  [GitHub Issues](https://github.com/Hack23/euparliamentmonitor/issues)
  (non-security)

## Updates to This Policy

This security policy is reviewed and updated regularly. Last updated: 2026-02-17

Changes to this policy will be communicated through:

- Git commit history
- GitHub release notes
- Security tab updates

---

**Thank you for helping keep EU Parliament Monitor and its users safe!** 🛡️

_For questions about this security policy, contact
[security@hack23.com](mailto:security@hack23.com)_
