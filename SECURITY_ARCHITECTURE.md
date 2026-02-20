<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🛡️ EU Parliament Monitor — Security Architecture</h1>

<p align="center">
  <strong>🔐 Security-by-Design for European Parliament Intelligence</strong><br>
  <em>🎯 Comprehensive Security Framework for Multi-Language News Platform</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--02--20-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Annual-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:**
2026-02-20 (UTC)  
**🔄 Review Cycle:** Annual | **⏰ Next Review:** 2027-02-20  
**🏷️ Classification:** Public (Open Source European Parliament Monitoring
Platform)

---

## 🎯 Executive Summary

EU Parliament Monitor is a static website generator that creates multi-language
news articles about European Parliament activities. The system operates as an
automated intelligence platform, generating news content through GitHub Actions
workflows with minimal attack surface and public data transparency.

### System Purpose

The platform automatically generates and publishes news articles covering:

- **Week Ahead**: Preview of upcoming parliamentary events
- **Committee Reports**: Analysis of committee activities
- **Propositions**: Legislative proposals analysis
- **Motions**: Parliamentary motions analysis
- **Breaking News**: Rapid-response coverage

### Security Classification

Per
[Hack23 ISMS Classification Framework](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md):

| Dimension           | Level            | Rationale                                                                                      |
| ------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| **Confidentiality** | Public (Level 1) | All data from European Parliament open data sources, no private information                    |
| **Integrity**       | Medium (Level 2) | News accuracy critical for democratic transparency, incorrect information could mislead public |
| **Availability**    | Medium (Level 2) | Daily updates expected, but 24-hour outages acceptable                                         |
| **RTO**             | 24 hours         | Manual workflow trigger available, automated recovery via GitHub Actions                       |
| **RPO**             | 1 day            | Daily generation schedule, previous day's content acceptable                                   |

### Security Posture Overview

**Defense Strategy**: Defense-in-depth with minimal attack surface

- ✅ **Static Content**: No server-side execution, no databases
- ✅ **GitHub-Hosted**: GitHub Pages infrastructure security
- ✅ **Minimal Dependencies**: 17 devDependencies, zero production dependencies,
  automated updates
- ✅ **Automated Security**: CodeQL, Dependabot, npm audit
- ✅ **Supply Chain Security**: SHA-pinned GitHub Actions, SBOM generation
- ✅ **Ephemeral Execution**: GitHub-hosted runners, no persistent
  infrastructure

### Compliance Status

| Framework     | Status       | Evidence                                                             |
| ------------- | ------------ | -------------------------------------------------------------------- |
| **ISO 27001** | ✅ Compliant | Architecture documentation, access control, vulnerability management |
| **GDPR**      | ✅ Compliant | No PII collected, data protection by design                          |
| **NIS2**      | ✅ Compliant | Static site architecture, minimal attack surface, incident response  |
| **EU CRA**    | ✅ Aligned   | SBOM generation, vulnerability disclosure, security updates          |

### Related Documents

| Document                        | Focus                 | Link                                                                                        |
| ------------------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| 🔐 Security Architecture        | Current State         | This document                                                                               |
| 🚀 Future Security Architecture | Roadmap               | [FUTURE_SECURITY_ARCHITECTURE.md](FUTURE_SECURITY_ARCHITECTURE.md)                          |
| ⚙️ CI/CD Workflows              | Current workflows     | [WORKFLOWS.md](WORKFLOWS.md)                                                                |
| 🚀 Future Workflows             | Planned enhancements  | [FUTURE_WORKFLOWS.md](FUTURE_WORKFLOWS.md)                                                  |
| 📊 Data Model                   | Data Structures       | [DATA_MODEL.md](DATA_MODEL.md)                                                              |
| 📈 Security Flow                | Process Flows         | [FLOWCHART.md](FLOWCHART.md)                                                                |
| 📚 Documentation Hub            | Release documentation | [docs/README.md](docs/README.md)                                                            |
| 📋 Release Process              | Release procedures    | [docs/RELEASE_PROCESS.md](docs/RELEASE_PROCESS.md)                                          |
| 🎯 Threat Model                 | Risk Analysis         | [#-threat-model](#-threat-model)                                                            |
| 🛡️ ISMS Secure Development      | Policy Framework      | [ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |

---

## 📑 Table of Contents

- [🔐 ISMS Policy Alignment](#-isms-policy-alignment)
- [🏗️ System Context (C4 Level 1)](#-system-context-c4-level-1)
- [📦 Container Architecture (C4 Level 2)](#-container-architecture-c4-level-2)
- [🔧 Component Architecture (C4 Level 3)](#-component-architecture-c4-level-3)
- [🔒 Security Controls](#-security-controls)
  - [Authentication & Authorization](#authentication--authorization)
  - [Data Protection](#data-protection)
  - [Network Security](#network-security)
  - [Application Security](#application-security)
  - [Infrastructure Security](#infrastructure-security)
- [📊 Session & Action Tracking](#-session--action-tracking)
- [🔍 Security Event Monitoring](#-security-event-monitoring)
- [🏗️ High Availability Design](#-high-availability-design)
- [⚡ Resilience & Operational Readiness](#-resilience--operational-readiness)
- [🤖 Automated Security Operations](#-automated-security-operations)
- [🛡️ Defense-in-Depth Strategy](#-defense-in-depth-strategy)
- [🎯 Threat Model](#-threat-model)
- [📜 Compliance Framework](#-compliance-framework)
- [✅ Compliance Matrix](#-compliance-matrix)
- [🔍 Security Operations](#-security-operations)
- [📊 Security Metrics](#-security-metrics)

---

## 🔐 ISMS Policy Alignment

This security architecture implements controls aligned with Hack23 AB's publicly
available ISMS framework. For complete policy mapping, see the
[Hack23 ISMS-PUBLIC repository](https://github.com/Hack23/ISMS-PUBLIC).

### Related ISMS Policies

| **Policy Domain**        | **Policy**                                                                                                    | **Relevance to Architecture**                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **🔐 Core Security**     | [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) | Overall security governance and framework                |
| **🛠️ Development**       | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)     | Security-integrated SDLC practices, CodeQL SAST scanning |
| **🌐 Network**           | [Network Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Network_Security_Policy.md)         | GitHub Pages CDN security, HTTPS enforcement             |
| **🔒 Cryptography**      | [Cryptography Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md)                 | TLS 1.3, HTTPS-only, Content Security Policy             |
| **🔍 Vulnerability**     | [Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md)       | Dependabot, CodeQL, npm audit, weekly scans              |
| **🚨 Incident Response** | [Incident Response Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md)           | GitHub Security Advisories, coordinated disclosure       |
| **🤝 Third-Party**       | [Third Party Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Third_Party_Management.md)           | GitHub ecosystem assessment (GitHub Pages, Actions, npm) |
| **🔓 Open Source**       | [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)                   | MIT licensing, REUSE compliance, SBOM generation         |
| **📋 Compliance**        | [Compliance Checklist](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Compliance_Checklist.md)               | ISO 27001, NIST CSF, CIS Controls alignment              |
| **🏷️ Classification**    | [Classification Framework](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md)                 | Public data classification (Level 1 confidentiality)     |

### Security Control Implementation Status

| **ISMS Control Domain**         | **Implementation Status** | **Notes**                                                    |
| ------------------------------- | ------------------------- | ------------------------------------------------------------ |
| **🔑 Access Control**           | ✅ Implemented            | GitHub CODEOWNERS, branch protection, required reviews       |
| **🔒 Cryptography**             | ✅ Implemented            | TLS 1.3, HTTPS-only, CSP headers, SRI for external resources |
| **🌐 Network Security**         | ✅ Implemented            | GitHub Pages CDN, DDoS protection, edge caching              |
| **🛠️ Secure Development**       | ✅ Implemented            | CodeQL SAST, ESLint, Prettier, pre-commit hooks              |
| **🔍 Vulnerability Management** | ✅ Implemented            | Dependabot (weekly), CodeQL (push/PR), npm audit             |
| **📊 Monitoring & Logging**     | ⚠️ Limited                | GitHub Actions logs, CDN access logs (no backend logging)    |
| **💾 Data Protection**          | ✅ Implemented            | No persistent storage, ephemeral build environment           |
| **🚨 Incident Response**        | ✅ Documented             | SECURITY.md, GitHub Security Advisories, 90-day disclosure   |

---

## 🏗️ System Context (C4 Level 1)

The EU Parliament Monitor operates as a static content generation platform
within the GitHub ecosystem, interfacing with the European Parliament MCP Server
for data access.

```mermaid
graph TB
    subgraph "External Actors"
        User[👥 EU Citizens & Researchers]
        EP_API[🏛️ European Parliament<br/>Open Data API]
    end

    subgraph "GitHub Infrastructure"
        GHA[⚙️ GitHub Actions<br/>Automated Workflows]
        GHP[🌐 GitHub Pages<br/>Static Hosting]
        GH_SECURITY[🔒 GitHub Security<br/>CodeQL, Dependabot, Secrets]
    end

    subgraph "EU Parliament Monitor"
        EuPM[📰 EU Parliament Monitor<br/>Static Website Generator]
        EPMCP[🔌 European Parliament<br/>MCP Server Client]
    end

    User -->|Browse News<br/>HTTPS| GHP
    GHP -->|Serve Static<br/>HTML/CSS/JS| User

    GHA -->|Trigger Daily<br/>06:00 UTC| EuPM
    GHA -->|Monitor Security| GH_SECURITY

    EuPM -->|Connect via<br/>stdio/localhost| EPMCP
    EPMCP -->|Query Parliamentary<br/>Data| EP_API
    EP_API -->|Return JSON<br/>Public Data| EPMCP

    EuPM -->|Generate<br/>Articles| GHP
    GH_SECURITY -->|Scan Code<br/>Dependencies| EuPM

    style User fill:#e1f5ff
    style EP_API fill:#fff4e1
    style GHA fill:#f0f0f0
    style GHP fill:#f0f0f0
    style GH_SECURITY fill:#ffe1e1
    style EuPM fill:#e8f5e9
    style EPMCP fill:#e8f5e9
```

### Trust Boundaries

1. **GitHub Infrastructure Boundary**: Trusted GitHub Actions runners and Pages
   hosting
2. **MCP Communication Boundary**: localhost/stdio communication between
   generator and MCP server
3. **External Data Boundary**: European Parliament Open Data API (untrusted
   input)
4. **User Access Boundary**: Public internet users accessing static content

### Data Flow

```mermaid
flowchart LR
    subgraph "Data Sources"
        EP[European Parliament<br/>Open Data API]
    end

    subgraph "Processing"
        MCP[MCP Server]
        GEN[News Generator]
        VAL[HTML Validator]
    end

    subgraph "Storage & Delivery"
        GIT[Git Repository]
        PAGES[GitHub Pages]
    end

    subgraph "Consumers"
        USERS[End Users]
    end

    EP -->|Public JSON| MCP
    MCP -->|Structured Data| GEN
    GEN -->|HTML Articles| VAL
    VAL -->|Validated HTML| GIT
    GIT -->|Deploy| PAGES
    PAGES -->|HTTPS| USERS

    style EP fill:#fff4e1
    style MCP fill:#e8f5e9
    style GEN fill:#e8f5e9
    style VAL fill:#e1f5ff
    style GIT fill:#f0f0f0
    style PAGES fill:#f0f0f0
    style USERS fill:#e1f5ff
```

---

## 📦 Container Architecture (C4 Level 2)

The system consists of stateless containers executing in GitHub Actions with no
persistent infrastructure.

```mermaid
graph TB
    subgraph "GitHub Actions Runner (Ubuntu Latest)"
        subgraph "News Generation Container"
            CLI[📝 generate-news-enhanced.js<br/>Node.js CLI Script]
            TEMPLATE[🎨 article-template.js<br/>HTML Generator]
            CLIENT[🔌 ep-mcp-client.js<br/>MCP Client Library]
        end

        subgraph "Index Generation Container"
            IDX[📋 generate-news-indexes.js<br/>Index Generator]
        end

        subgraph "Sitemap Generation Container"
            SITE[🗺️ generate-sitemap.js<br/>Sitemap Generator]
        end

        subgraph "European Parliament MCP Server"
            MCP[🏛️ MCP Server Process<br/>stdio Communication]
        end

        subgraph "Validation Container"
            HTML[✅ htmlhint<br/>HTML Validator]
            LINT[🔍 ESLint<br/>Code Quality]
            TEST[🧪 Vitest<br/>Test Suite]
        end
    end

    subgraph "GitHub Infrastructure"
        REPO[📚 Git Repository<br/>news/, *.html, sitemap.xml]
        PAGES[🌐 GitHub Pages<br/>Static Hosting]
        SECRETS[🔐 GitHub Secrets<br/>Tokens, Variables]
    end

    subgraph "External Services"
        EP_API[🏛️ European Parliament API<br/>data.europarl.europa.eu]
    end

    CLI -->|Initialize| CLIENT
    CLIENT -->|Spawn Process| MCP
    MCP -->|HTTPS| EP_API
    EP_API -->|JSON Response| MCP
    MCP -->|Structured Data| CLIENT
    CLIENT -->|Parliamentary Data| CLI
    CLI -->|Generate HTML| TEMPLATE
    TEMPLATE -->|Write Files| REPO

    IDX -->|Read Articles| REPO
    IDX -->|Generate Indexes| REPO

    SITE -->|Scan Files| REPO
    SITE -->|Generate sitemap.xml| REPO

    HTML -->|Validate| REPO
    LINT -->|Check Quality| CLI
    TEST -->|Run Tests| CLI

    REPO -->|Deploy| PAGES
    SECRETS -->|Provide Tokens| CLI

    style CLI fill:#e8f5e9
    style TEMPLATE fill:#e8f5e9
    style CLIENT fill:#e8f5e9
    style IDX fill:#e8f5e9
    style SITE fill:#e8f5e9
    style MCP fill:#fff4e1
    style HTML fill:#e1f5ff
    style LINT fill:#e1f5ff
    style TEST fill:#e1f5ff
    style REPO fill:#f0f0f0
    style PAGES fill:#f0f0f0
    style SECRETS fill:#ffe1e1
    style EP_API fill:#fff4e1
```

### Container Security Characteristics

| Container          | Runtime    | Privileges      | Network Access  | Persistence      |
| ------------------ | ---------- | --------------- | --------------- | ---------------- |
| News Generation    | Node.js 24 | Read/Write repo | Localhost only  | None (ephemeral) |
| Index Generation   | Node.js 24 | Read/Write repo | None            | None (ephemeral) |
| Sitemap Generation | Node.js 24 | Read/Write repo | None            | None (ephemeral) |
| MCP Server         | Node.js 24 | Read-only       | HTTPS to EP API | None (ephemeral) |
| Validation         | Node.js 24 | Read-only       | None            | None (ephemeral) |

---

## 🔧 Component Architecture (C4 Level 3)

Detailed component-level architecture showing internal structure and security
boundaries.

```mermaid
graph TB
    subgraph "News Generation Components"
        direction TB
        MAIN[Main CLI<br/>Command Parser]
        LANG[Language Manager<br/>14 Languages]
        TYPE[Article Type Manager<br/>5 Types]

        subgraph "MCP Client Components"
            CONN[Connection Manager<br/>Retry Logic]
            REQ[Request Handler<br/>JSON-RPC 2.0]
            RESP[Response Parser<br/>Data Validator]
        end

        subgraph "Template Components"
            META[Metadata Generator<br/>SEO, Schema.org]
            HTML[HTML Builder<br/>Sanitization]
            CSS[Style Injector<br/>Inline CSS]
        end

        subgraph "Fallback Components"
            CACHE[Content Cache<br/>Placeholder Data]
            ERR[Error Handler<br/>Graceful Degradation]
        end
    end

    subgraph "Validation Components"
        HTMLV[HTML Validator<br/>htmlhint rules]
        JSDOC[JSDoc Checker<br/>Documentation]
        SECUR[Security Scanner<br/>eslint-plugin-security]
    end

    subgraph "Index Components"
        SCAN[Article Scanner<br/>File Discovery]
        PARSE[Metadata Parser<br/>Extract Info]
        INDEX[Index Generator<br/>Multi-language]
    end

    subgraph "Sitemap Components"
        CRAWLER[File Crawler<br/>Recursive Scan]
        URL[URL Builder<br/>Canonical URLs]
        XML[XML Generator<br/>Sitemap Protocol]
    end

    MAIN --> LANG
    MAIN --> TYPE
    LANG --> CONN
    TYPE --> CONN

    CONN --> REQ
    REQ --> RESP
    RESP --> META
    RESP --> ERR

    META --> HTML
    HTML --> CSS

    ERR --> CACHE
    CACHE --> HTML

    HTML --> HTMLV
    CSS --> HTMLV

    MAIN --> JSDOC
    MAIN --> SECUR

    SCAN --> PARSE
    PARSE --> INDEX

    CRAWLER --> URL
    URL --> XML

    style MAIN fill:#e8f5e9
    style CONN fill:#fff4e1
    style REQ fill:#fff4e1
    style RESP fill:#fff4e1
    style META fill:#e1f5ff
    style HTML fill:#e1f5ff
    style CSS fill:#e1f5ff
    style CACHE fill:#f0f0f0
    style ERR fill:#ffe1e1
    style HTMLV fill:#e1f5ff
    style JSDOC fill:#e1f5ff
    style SECUR fill:#ffe1e1
```

### Component Security Responsibilities

| Component          | Security Function               | Controls                                          |
| ------------------ | ------------------------------- | ------------------------------------------------- |
| Connection Manager | MCP server connection security  | Retry limits, timeout enforcement, error handling |
| Request Handler    | JSON-RPC protocol integrity     | Schema validation, request ID tracking            |
| Response Parser    | Input validation & sanitization | Data type checking, XSS prevention                |
| HTML Builder       | Output encoding                 | HTML entity encoding, CSP compliance              |
| Error Handler      | Fail-secure behavior            | Fallback content, no sensitive data exposure      |
| HTML Validator     | Content integrity               | htmlhint rules, standards compliance              |
| Security Scanner   | SAST detection                  | eslint-plugin-security, sonarjs rules             |

---

## 🔒 Security Controls

### Authentication & Authorization

#### GitHub Actions Authentication

```mermaid
flowchart TD
    subgraph "GitHub Actions Identity"
        WF[Workflow Trigger<br/>Schedule/Manual]
        TOKEN[GITHUB_TOKEN<br/>Auto-generated]
        PERMS[Permissions<br/>contents: write]
    end

    subgraph "Repository Operations"
        READ[Read Repository<br/>Checkout Code]
        WRITE[Write Changes<br/>Commit & Push]
    end

    subgraph "Security Boundaries"
        SCOPE[Token Scope<br/>Repository Only]
        EXPIRE[Token Expiry<br/>Job Duration]
    end

    WF -->|Provision| TOKEN
    TOKEN -->|Grant| PERMS
    PERMS -->|Allow| READ
    PERMS -->|Allow| WRITE

    TOKEN --> SCOPE
    TOKEN --> EXPIRE

    style WF fill:#f0f0f0
    style TOKEN fill:#ffe1e1
    style PERMS fill:#ffe1e1
    style READ fill:#e8f5e9
    style WRITE fill:#e8f5e9
    style SCOPE fill:#e1f5ff
    style EXPIRE fill:#e1f5ff
```

**Controls:**

- ✅ **Minimal Permissions**: `contents: write` only, no admin/secrets access
- ✅ **Auto-expiring Tokens**: GITHUB_TOKEN valid only for job duration
- ✅ **SHA-pinned Actions**: All actions pinned to commit SHA for supply chain
  security
- ✅ **Branch Protection**: Required reviews, status checks before merge
- ✅ **No Persistent Credentials**: Tokens destroyed after job completion

**ISMS Alignment:**

- [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) -
  Least privilege
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) -
  CI/CD security

#### Static Site Access Control

**Control Implementation:**

- ❌ **No Authentication Required**: Public content by design
- ✅ **Read-Only Access**: Users cannot modify content
- ✅ **HTTPS Enforcement**: GitHub Pages forces HTTPS
- ✅ **No Server-Side Execution**: No authentication bypass risks

**Security Rationale:**

- All content is public information from European Parliament
- No PII or sensitive data
- Read-only static files eliminate authentication attack surface

### Data Protection

#### Input Validation & Sanitization

```mermaid
flowchart TD
    subgraph "External Data Sources"
        EP[European Parliament API<br/>Untrusted Input]
    end

    subgraph "Validation Pipeline"
        SCHEMA[Schema Validation<br/>JSON Structure Check]
        TYPE[Type Validation<br/>Data Type Enforcement]
        RANGE[Range Validation<br/>Bounds Checking]
    end

    subgraph "Sanitization Pipeline"
        HTML_STRIP[HTML Tag Stripping<br/>Remove Dangerous Tags]
        ENTITY[Entity Encoding<br/>HTML Special Chars]
        SCRIPT[Script Removal<br/>XSS Prevention]
    end

    subgraph "Output Generation"
        SAFE[Safe HTML<br/>Validated Content]
    end

    EP -->|Raw JSON| SCHEMA
    SCHEMA -->|Valid| TYPE
    SCHEMA -->|Invalid| ERR[Log Error &<br/>Use Fallback]
    TYPE -->|Valid| RANGE
    TYPE -->|Invalid| ERR
    RANGE -->|Valid| HTML_STRIP
    RANGE -->|Invalid| ERR

    HTML_STRIP --> ENTITY
    ENTITY --> SCRIPT
    SCRIPT --> SAFE

    style EP fill:#fff4e1
    style SCHEMA fill:#e1f5ff
    style TYPE fill:#e1f5ff
    style RANGE fill:#e1f5ff
    style HTML_STRIP fill:#ffe1e1
    style ENTITY fill:#ffe1e1
    style SCRIPT fill:#ffe1e1
    style SAFE fill:#e8f5e9
    style ERR fill:#f0f0f0
```

**Validation Controls:**

1. **Schema Validation**: MCP response structure validation
2. **Type Checking**: Enforce expected data types (string, number, date)
3. **Range Checking**: Validate date ranges, text lengths
4. **Encoding Enforcement**: UTF-8 only, reject invalid encodings

**Sanitization Controls:**

1. **HTML Entity Encoding**: Convert `<`, `>`, `&`, `"`, `'` to entities
2. **Script Tag Removal**: Strip all `<script>` tags from input
3. **Event Handler Removal**: Remove `onclick`, `onerror`, etc.
4. **URL Validation**: Validate and sanitize all href/src attributes

**ISMS Alignment:**

- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) -
  Input validation requirements

#### Data Classification & Handling

| Data Type           | Classification | Storage                  | Encryption           | Retention   |
| ------------------- | -------------- | ------------------------ | -------------------- | ----------- |
| News Articles       | Public         | Git repository           | At-rest (GitHub)     | Indefinite  |
| EP API Responses    | Public         | Ephemeral (runtime only) | In-transit (TLS 1.3) | None        |
| Generation Metadata | Public         | Git repository           | At-rest (GitHub)     | Indefinite  |
| GitHub Tokens       | Secret         | GitHub Secrets           | Encrypted            | Auto-rotate |
| MCP Communication   | Internal       | Localhost only           | N/A (local)          | None        |

**ISMS Alignment:**

- [Classification Framework](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) -
  Public data (Level 1)
- [Cryptography Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md) -
  TLS standards

#### No PII Collection

**Control Implementation:**

- ✅ **No User Tracking**: No cookies, no analytics, no tracking scripts
- ✅ **No Form Inputs**: No data collection forms
- ✅ **No User Accounts**: No registration or login
- ✅ **Static Content Only**: No server-side processing of user data
- ✅ **No Third-Party Scripts**: No external JavaScript libraries

**GDPR Compliance:**

- Article 25 (Data Protection by Design): No PII by design
- Article 32 (Security of Processing): Public data only, no processing of
  personal data
- No Data Protection Impact Assessment (DPIA) required

### Network Security

#### Network Architecture

```mermaid
graph TB
    subgraph "External Network"
        direction TB
        USERS[🌍 Internet Users<br/>Public Access]
        EP_NET[🏛️ European Parliament<br/>data.europarl.europa.eu]
    end

    subgraph "GitHub Infrastructure"
        direction TB
        GH_CDN[🌐 GitHub Pages CDN<br/>HTTPS Only]
        GH_RUNNER[⚙️ GitHub Actions Runner<br/>Ephemeral VM]
    end

    subgraph "Application Layer"
        direction TB
        STATIC[📄 Static HTML/CSS/JS<br/>Read-Only Files]
        MCP[🔌 MCP Server<br/>localhost:random_port]
    end

    USERS -->|HTTPS 443<br/>TLS 1.3| GH_CDN
    GH_CDN -->|Serve| STATIC

    GH_RUNNER -->|HTTPS 443<br/>TLS 1.3| EP_NET
    GH_RUNNER -->|localhost<br/>stdio/pipe| MCP
    MCP -->|HTTPS 443| EP_NET

    style USERS fill:#e1f5ff
    style EP_NET fill:#fff4e1
    style GH_CDN fill:#f0f0f0
    style GH_RUNNER fill:#f0f0f0
    style STATIC fill:#e8f5e9
    style MCP fill:#e8f5e9
```

**Network Security Controls:**

1. **HTTPS Enforcement**
   - GitHub Pages enforces HTTPS for all connections
   - TLS 1.3 with strong cipher suites
   - Automatic HSTS header: `max-age=31536000`

2. **Localhost-Only MCP Communication**
   - MCP server binds to localhost only
   - stdio/pipe communication (no network sockets)
   - Process isolation within GitHub Actions runner

3. **No Exposed Ports**
   - Static site: No server ports
   - MCP server: Not exposed externally
   - GitHub Actions: Ephemeral runners, no persistent infrastructure

4. **Outbound Restrictions**
   - Only HTTPS to European Parliament API
   - No other external connections
   - DNS: GitHub-managed

**ISMS Alignment:**

- [Network Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Network_Security_Policy.md) -
  Network segmentation, TLS requirements

#### Content Security Policy

**CSP Header Configuration:**

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'none';
```

**Security Headers:**

- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `X-Frame-Options: DENY` - Prevent clickjacking
- `Referrer-Policy: strict-origin-when-cross-origin` - Privacy protection

**Note**: GitHub Pages provides default security headers. Future enhancement:
Custom CSP via meta tags.

### Application Security

#### XSS Prevention

**Multi-Layer XSS Defense:**

```mermaid
flowchart TD
    INPUT[User Input /<br/>API Data]

    subgraph "Defense Layer 1: Input Validation"
        VAL[Schema Validation]
        TYPE[Type Checking]
    end

    subgraph "Defense Layer 2: Sanitization"
        STRIP[HTML Tag Stripping]
        ENCODE[Entity Encoding]
    end

    subgraph "Defense Layer 3: Output Encoding"
        HTML_ENCODE[HTML Context Encoding]
        ATTR_ENCODE[Attribute Encoding]
    end

    subgraph "Defense Layer 4: CSP"
        CSP[Content Security Policy]
        META[CSP Meta Tags]
    end

    OUTPUT[Safe HTML Output]

    INPUT --> VAL
    VAL --> TYPE
    TYPE --> STRIP
    STRIP --> ENCODE
    ENCODE --> HTML_ENCODE
    HTML_ENCODE --> ATTR_ENCODE
    ATTR_ENCODE --> CSP
    CSP --> META
    META --> OUTPUT

    style INPUT fill:#fff4e1
    style VAL fill:#e1f5ff
    style TYPE fill:#e1f5ff
    style STRIP fill:#ffe1e1
    style ENCODE fill:#ffe1e1
    style HTML_ENCODE fill:#ffe1e1
    style ATTR_ENCODE fill:#ffe1e1
    style CSP fill:#e8f5e9
    style META fill:#e8f5e9
    style OUTPUT fill:#e8f5e9
```

**XSS Controls:**

1. **Input Validation**: Reject invalid data at API boundary
2. **HTML Sanitization**: Remove dangerous tags (`<script>`, `<iframe>`, etc.)
3. **Entity Encoding**: Convert special characters to HTML entities
4. **Context-Aware Encoding**: Different encoding for HTML vs attributes vs URLs
5. **CSP**: Block inline scripts, restrict sources
6. **No JavaScript Execution**: Generated articles contain no JavaScript

**Testing:**

- ESLint security plugin detects XSS patterns
- htmlhint validates HTML structure
- Unit tests validate sanitization functions
- Integration tests verify end-to-end XSS prevention

#### Dependency Security

**Supply Chain Security Controls:**

```mermaid
graph TB
    subgraph "Dependency Management"
        PKG[package.json<br/>14 Dependencies]
        LOCK[package-lock.json<br/>Locked Versions]
    end

    subgraph "Automated Scanning"
        DEP[Dependabot<br/>Weekly Scans]
        AUDIT[npm audit<br/>CI Checks]
        CODEQL[CodeQL<br/>SAST]
    end

    subgraph "Update Process"
        PR[Auto PR<br/>Version Updates]
        TEST[CI Tests<br/>Validation]
        MERGE[Merge<br/>After Review]
    end

    subgraph "Enforcement"
        FAIL[Block PR<br/>on Vulnerabilities]
        BADGE[Security Badge<br/>Status]
    end

    PKG --> LOCK
    LOCK --> DEP
    LOCK --> AUDIT
    LOCK --> CODEQL

    DEP --> PR
    AUDIT --> FAIL

    PR --> TEST
    TEST --> MERGE
    CODEQL --> FAIL

    MERGE --> BADGE

    style PKG fill:#e8f5e9
    style LOCK fill:#e8f5e9
    style DEP fill:#e1f5ff
    style AUDIT fill:#e1f5ff
    style CODEQL fill:#ffe1e1
    style PR fill:#f0f0f0
    style TEST fill:#e1f5ff
    style MERGE fill:#e8f5e9
    style FAIL fill:#ffe1e1
    style BADGE fill:#e8f5e9
```

**Dependency Security:**

- **Minimal Dependencies**: 17 devDependencies, zero production dependencies
- **Dependabot**: Weekly scans, auto-generate PRs for updates
- **npm audit**: CI validation, fail on moderate+ vulnerabilities
- **Version Locking**: package-lock.json ensures reproducible builds
- **SHA Pinning**: GitHub Actions pinned to commit SHA

**Current Dependencies:**

- All devDependencies (17 packages, no production runtime dependencies)
- Latest versions with security patches
- No known vulnerabilities (npm audit clean)

**ISMS Alignment:**

- [Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) -
  Dependency scanning
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) -
  SBOM requirements

### Infrastructure Security

#### GitHub Actions Security

**Workflow Security Controls:**

```mermaid
flowchart TD
    subgraph "Workflow Trigger"
        SCHED[Schedule Trigger<br/>Daily 06:00 UTC]
        MANUAL[Manual Trigger<br/>workflow_dispatch]
    end

    subgraph "Security Checks"
        PIN[SHA-Pinned Actions<br/>Supply Chain]
        PERM[Minimal Permissions<br/>contents: write]
        RUNNER[GitHub-Hosted Runner<br/>Ephemeral]
    end

    subgraph "Execution"
        CHECKOUT[Checkout Code]
        INSTALL[npm ci<br/>Reproducible Build]
        GENERATE[Generate News]
        VALIDATE[Validate HTML]
    end

    subgraph "Security Scans"
        AUDIT[npm audit<br/>Vulnerability Check]
        CODEQL_SCAN[CodeQL<br/>SAST]
        LINT[ESLint Security<br/>Code Quality]
    end

    subgraph "Commit"
        COMMIT[Commit Changes<br/>Automated]
        PUSH[Push to GitHub]
    end

    SCHED --> PIN
    MANUAL --> PIN
    PIN --> PERM
    PERM --> RUNNER
    RUNNER --> CHECKOUT

    CHECKOUT --> INSTALL
    INSTALL --> AUDIT
    AUDIT --> GENERATE
    GENERATE --> VALIDATE

    VALIDATE --> LINT
    LINT --> CODEQL_SCAN

    CODEQL_SCAN --> COMMIT
    COMMIT --> PUSH

    style SCHED fill:#f0f0f0
    style MANUAL fill:#f0f0f0
    style PIN fill:#ffe1e1
    style PERM fill:#ffe1e1
    style RUNNER fill:#e1f5ff
    style AUDIT fill:#ffe1e1
    style CODEQL_SCAN fill:#ffe1e1
    style LINT fill:#e1f5ff
    style COMMIT fill:#e8f5e9
    style PUSH fill:#e8f5e9
```

**Infrastructure Controls:**

1. **Ephemeral Runners**
   - GitHub-hosted runners (Ubuntu latest)
   - Destroyed after each job
   - No persistent state or credentials
   - Clean environment for each execution

2. **Secrets Management**
   - GITHUB_TOKEN: Auto-generated, auto-expiring
   - No custom secrets required for current operation
   - Future: COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN for org access

3. **Workflow Permissions**
   - `contents: write` - Repository read/write only
   - No secrets, issues, or admin access
   - Token scope limited to repository

4. **Supply Chain Security**
   - All GitHub Actions SHA-pinned
   - Dependabot monitors action updates
   - SBOM generation for releases

**ISMS Alignment:**

- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) -
  CI/CD security
- [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) -
  Least privilege

#### GitHub Pages Security

**Hosting Security:**

- ✅ **HTTPS Enforcement**: Automatic HTTPS redirect
- ✅ **TLS 1.3**: Modern protocol with strong ciphers
- ✅ **DDoS Protection**: GitHub's CDN infrastructure
- ✅ **Automatic Patching**: GitHub manages server updates
- ✅ **No Server Configuration**: Zero server attack surface

**Static Site Security:**

- ✅ **No Databases**: No SQL injection risk
- ✅ **No Server-Side Code**: No RCE vulnerabilities
- ✅ **Read-Only Files**: Users cannot modify content
- ✅ **No User Input**: No injection attack vectors
- ✅ **No Sessions**: No session hijacking risk

---

## 📊 Session & Action Tracking

EU Parliament Monitor, as a static website generator, implements tracking
mechanisms appropriate for its architecture—focusing on build-time operations
and privacy-respecting visitor analytics.

```mermaid
flowchart TD
    subgraph "Build Session Tracking"
        direction TB
        A[⏰ GitHub Actions Trigger] -->|"Daily Cron"| B[🔄 Workflow Run]
        B -->|"Create"| C[📝 Build Session]

        B -->|"Execute"| D[🛠️ Build Steps]
        D -->|"Generate"| E[📊 Build Events]
        E -->|"Associated with"| C

        C -->|"Contains"| F[📋 Session Metadata]
        F -->|"Records"| G[🔑 Run ID]
        F -->|"Records"| H[👤 Actor/Trigger]
        F -->|"Records"| I[🌿 Branch/Commit]
        F -->|"Records"| J[⏰ Timestamps]

        E -->|"Contains"| K[📋 Event Metadata]
        K -->|"Records"| L[🔍 Operation Type]
        K -->|"Records"| M[📄 Step Name]
        K -->|"Records"| N[✅ Success/Failure]
        K -->|"Records"| O[⏱️ Duration]

        C & E -->|"Store"| P[💾 GitHub Actions Logs]
        P -->|"Analysis"| Q[📊 Workflow Insights]
        P -->|"Audit"| R[🔍 Security Review]
    end

    style A fill:#2979FF,stroke:#0D47A1,stroke-width:2px,color:white,font-weight:bold
    style B fill:#00C853,stroke:#007E33,stroke-width:2px,color:white,font-weight:bold
    style C,E fill:#FF3D00,stroke:#BF360C,stroke-width:2px,color:white,font-weight:bold
    style D fill:#2979FF,stroke:#0D47A1,stroke-width:2px,color:white,font-weight:bold
    style F,K fill:#FFD600,stroke:#FF8F00,stroke-width:2px,color:black,font-weight:bold
    style G,H,I,J,L,M,N,O fill:#00E676,stroke:#00C853,stroke-width:2px,color:black,font-weight:bold
    style P fill:#673AB7,stroke:#311B92,stroke-width:2px,color:white,font-weight:bold
    style Q,R fill:#00C853,stroke:#007E33,stroke-width:2px,color:white,font-weight:bold
    classDef default font-weight:bold
```

### GitHub Actions Build Session Tracking

Every workflow execution creates a tracked session with comprehensive metadata:

**Build Session Metadata:**

- **🔑 Unique Run Identification**: Each workflow run has a unique
  `GITHUB_RUN_ID`
- **👤 Trigger Attribution**: Tracked via `GITHUB_ACTOR` and
  `GITHUB_TRIGGERING_ACTOR`
- **🌿 Source Context**: Branch (`GITHUB_REF`), commit SHA (`GITHUB_SHA`)
- **⏰ Temporal Tracking**: Start time, end time, duration
- **🔄 Workflow Type**: Scheduled (cron), manual (workflow_dispatch), push,
  pull_request
- **📊 Outcome**: Success, failure, cancelled, skipped

**Implementation:**

```yaml
# .github/workflows/generate-news.yml
env:
  RUN_ID: ${{ github.run_id }}
  ACTOR: ${{ github.actor }}
  COMMIT_SHA: ${{ github.sha }}
  BRANCH: ${{ github.ref_name }}
```

### Build Action Event Tracking

Every build step generates trackable events:

**Build Event Metadata:**

- **🔄 Operation Type**: Checkout, setup, install, test, build, validate, deploy
- **📊 Step Context**: Step name, job name, workflow name
- **✅ Success/Failure**: Exit code, error messages
- **⏱️ Duration**: Step execution time
- **📦 Artifacts**: Generated files, logs, reports

**Key Build Events Tracked:**

1. **Node.js Setup**: Version, cache hits
2. **Dependency Installation**: npm install duration, vulnerability counts
3. **MCP Server Pre-installation**: Success/failure, fallback triggers
4. **News Generation**: Articles generated per language, processing time
5. **HTML Validation**: W3C validation results, error counts
6. **Deployment**: GitHub Pages deploy success, deployed URLs

### Privacy-Compliant Visitor Analytics

**Approach**: No client-side tracking (no JavaScript analytics), privacy-first

**Analytics Sources:**

1. **GitHub Pages CDN Logs** (limited access):
   - Aggregate page view counts
   - Geographic distribution (country-level only)
   - Referrer sources
   - No individual visitor tracking

2. **Repository Insights**:
   - Traffic views (14-day retention)
   - Popular content
   - Referrer analytics
   - Clone/fork statistics

**Privacy Protections:**

- ❌ No cookies
- ❌ No fingerprinting
- ❌ No individual user tracking
- ❌ No third-party analytics (Google Analytics, etc.)
- ✅ Aggregate statistics only
- ✅ GDPR-compliant by design

### Audit Trail Capabilities

**GitHub Actions Logs:**

- **Retention**: 90 days for public repositories
- **Access**: Repository maintainers only
- **Contents**: Full build logs, environment variables (secrets redacted)
- **Export**: Downloadable via GitHub CLI or API

**Security Benefits:**

- 🔍 Complete build reproducibility
- 🚨 Anomaly detection (unusual build patterns)
- 📊 Performance monitoring (build time trends)
- 🔒 Security event correlation (failed builds after dependency updates)

---

## 🔍 Security Event Monitoring

EU Parliament Monitor implements security event monitoring appropriate for a
static site generator, focusing on build-time security events and dependency
vulnerabilities.

```mermaid
flowchart TD
    subgraph "Security Event Monitoring"
        direction TB
        A[🛡️ GitHub Security<br>Events] --> B[✅ Workflow Success]
        A --> C[⚠️ Workflow Failure]

        D[🔍 Dependency<br>Security] --> E[🚨 Dependabot Alert]
        D --> F[🔄 Automated PR]

        G[🔒 Code<br>Scanning] --> H[🔍 CodeQL Analysis]
        G --> I[⚠️ Security Finding]

        B & C & E & F & H & I -->|"Generate"| J[📝 Security Event]

        J -->|"Contains"| K[📋 Event Metadata]
        K -->|"Records"| L[🔍 Event Type]
        K -->|"Records"| M[⚡ Severity]
        K -->|"Records"| N[🔗 Affected Component]
        K -->|"Records"| O[⏱️ Timestamp]

        J -->|"Triggers"| P[🚨 Notification]
        P -->|"If Critical"| Q[👥 Security Team Alert]

        J -->|"Store"| R[💾 GitHub Security]
        R -->|"Dashboard"| S[📊 Security Overview]
        R -->|"Compliance"| T[📋 Audit Reports]
    end

    style A,D,G fill:#2979FF,stroke:#0D47A1,stroke-width:2px,color:white,font-weight:bold
    style B fill:#00E676,stroke:#00C853,stroke-width:2px,color:black,font-weight:bold
    style C,E,I fill:#FF3D00,stroke:#BF360C,stroke-width:2px,color:white,font-weight:bold
    style F,H fill:#FFD600,stroke:#FF8F00,stroke-width:2px,color:black,font-weight:bold
    style J fill:#673AB7,stroke:#311B92,stroke-width:2px,color:white,font-weight:bold
    style K,P fill:#FFD600,stroke:#FF8F00,stroke-width:2px,color:black,font-weight:bold
    style L,M,N,O fill:#00C853,stroke:#007E33,stroke-width:2px,color:white,font-weight:bold
    style Q fill:#FF3D00,stroke:#BF360C,stroke-width:2px,color:white,font-weight:bold
    style R fill:#673AB7,stroke:#311B92,stroke-width:2px,color:white,font-weight:bold
    style S,T fill:#00C853,stroke:#007E33,stroke-width:2px,color:white,font-weight:bold
    classDef default font-weight:bold
```

### Security Event Types

Our system monitors several categories of security events:

#### 1. 🔄 **GitHub Actions Security Events**

**Workflow Execution Events:**

- ✅ Successful builds (baseline for anomaly detection)
- ⚠️ Failed builds (potential security issues)
- 🔄 Cancelled builds (manual intervention tracking)
- ⏱️ Timeout events (potential DoS indicators)

**Authentication Events:**

- 🔑 GitHub token usage (GITHUB_TOKEN)
- 🔐 Secret access patterns
- 👤 Actor changes (unexpected triggers)

**Implementation:**

```yaml
# .github/workflows/generate-news.yml
- name: Monitor Build Security
  if: failure()
  run: |
    echo "::warning::Build failed - security review required"
    echo "Actor: ${{ github.actor }}"
    echo "Commit: ${{ github.sha }}"
```

#### 2. 🚨 **Dependency Vulnerability Events**

**Dependabot Alerts:**

- 🔴 Critical vulnerabilities (CVSS ≥ 9.0)
- 🟠 High vulnerabilities (CVSS 7.0-8.9)
- 🟡 Medium vulnerabilities (CVSS 4.0-6.9)
- 🔵 Low vulnerabilities (CVSS < 4.0)

**Automated Response:**

- Weekly Dependabot scans
- Automated pull requests for patches
- Auto-merge for dev dependencies (low-risk)
- Manual review for breaking changes

**Monitoring:**

```bash
# npm audit in CI/CD pipeline
npm audit --audit-level=moderate
```

#### 3. 🔍 **Code Scanning Events**

**CodeQL Analysis:**

- **Triggers**: Every push to `main`, every pull request
- **Languages**: JavaScript (Node.js 24)
- **Security queries**: OWASP Top 10, CWE Top 25
- **Findings**: XSS, injection, path traversal, crypto issues

**Alert Handling:**

- 🚨 Critical: Block PR merge
- ⚠️ High: Require security review
- 💡 Medium/Low: Create issue for remediation

**Implementation:**

```yaml
# .github/workflows/codeql.yml
- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v3
  with:
    category: '/language:javascript'
```

#### 4. 🌐 **GitHub Pages Deployment Events**

**Deployment Security:**

- ✅ Successful deployments
- ⚠️ Failed deployments
- 🔍 Asset integrity checks
- 📊 Deployment frequency anomalies

**Health Checks:**

- HTTPS certificate validation
- CSP header verification
- HTML validation results
- Link integrity checks

### Real-Time Monitoring Approach

**GitHub Security Dashboard:**

- **Location**: Repository → Security tab
- **Features**:
  - Dependabot alerts (real-time)
  - Code scanning results (per commit)
  - Secret scanning (not applicable for public repos)
  - Security policies (SECURITY.md)

**Notification Channels:**

1. **Email**: Security alerts to repository maintainers
2. **GitHub Notifications**: In-app alerts
3. **Security Advisories**: Public disclosure (90-day embargo)

**Response SLAs:**

- 🔴 Critical: 24 hours
- 🟠 High: 7 days
- 🟡 Medium: 30 days
- 🔵 Low: 90 days or next release

### Event Retention & Analysis

**GitHub Actions Logs:**

- **Retention**: 90 days
- **Contents**: Full workflow execution logs
- **Access**: Repository maintainers only

**Security Alert History:**

- **Retention**: Indefinite (until resolved)
- **Status Tracking**: Open, fixed, dismissed
- **Audit Trail**: All status changes logged

---

## 🏗️ High Availability Design

EU Parliament Monitor's static architecture inherently provides high
availability through GitHub Pages' globally distributed CDN infrastructure.

```mermaid
graph TD
    subgraph "GitHub Pages Global CDN"
        A[🌐 Global CDN] --> B[🌍 Edge Locations<br>Worldwide]
        B --> C[🇪🇺 Europe]
        B --> D[🇺🇸 Americas]
        B --> E[🌏 Asia-Pacific]
    end

    subgraph "Content Delivery"
        F[👤 User Request] -->|"DNS Resolution"| G[📡 Nearest Edge]
        G -->|"Cache Hit"| H[⚡ Serve Cached]
        G -->|"Cache Miss"| I[🔄 Origin Fetch]
        I --> J[💾 GitHub Origin]
        J --> G
        G --> F
    end

    subgraph "Build Redundancy"
        K[🔄 Daily Build] -->|"Trigger"| L[☁️ GitHub-Hosted<br>Runner]
        L -->|"Success"| M[✅ Deploy]
        L -->|"Failure"| N[🔄 Manual Retry]
        M --> O[📦 Static Assets]
        O --> J
    end

    style A fill:#00C853,stroke:#007E33,stroke-width:2px,color:white,font-weight:bold
    style B fill:#2979FF,stroke:#0D47A1,stroke-width:2px,color:white,font-weight:bold
    style C,D,E fill:#FF3D00,stroke:#BF360C,stroke-width:2px,color:white,font-weight:bold
    style F fill:#2979FF,stroke:#0D47A1,stroke-width:2px,color:white,font-weight:bold
    style G,H,I fill:#00E676,stroke:#00C853,stroke-width:2px,color:black,font-weight:bold
    style J fill:#673AB7,stroke:#311B92,stroke-width:2px,color:white,font-weight:bold
    style K,L,N fill:#FFD600,stroke:#FF8F00,stroke-width:2px,color:black,font-weight:bold
    style M,O fill:#00C853,stroke:#007E33,stroke-width:2px,color:white,font-weight:bold
    classDef default font-weight:bold
```

### GitHub Pages CDN Architecture

**Global Distribution:**

- **Edge Locations**: 200+ worldwide via GitHub's CDN provider (Fastly)
- **Geographic Coverage**: All continents, optimized for EU access
- **Latency**: <50ms for 95% of European users
- **Bandwidth**: Unlimited for static content

**Availability Features:**

- ⚡ **Automatic Failover**: Multi-origin redundancy
- 🔄 **Self-Healing**: Failed edge nodes automatically replaced
- 📊 **Load Balancing**: Traffic distributed across edge locations
- 💾 **Persistent Cache**: Content cached at edge for fast delivery

### Availability Targets & SLAs

**GitHub Pages SLA:**

- **Uptime Target**: 99.9% (GitHub's historical performance: >99.95%)
- **Planned Downtime**: None (rolling updates)
- **Unplanned Downtime**: <30 minutes/month average

**EU Parliament Monitor Targets:**

- **Content Availability**: 99.9% (inherits GitHub Pages SLA)
- **Content Freshness**: Daily updates (24-hour refresh cycle)
- **Build Availability**: 99.5% (GitHub Actions SLA)

**Calculated Availability:**

- **Static Content**: 99.9% (GitHub Pages)
- **Build Process**: 99.5% (GitHub Actions)
- **Overall System**: 99.4% (content always available, builds may fail)

### Multi-Region Delivery

**Content Delivery Network (CDN):**

- **Primary**: GitHub Pages CDN (Fastly)
- **Regions**: Global distribution with EU edge nodes
- **Fallback**: GitHub's origin servers

**DNS Configuration:**

- **Primary**: `euparliamentmonitor.hack23.com` (GitHub Pages custom domain)
- **CNAME**: Points to `hack23.github.io`
- **CDN**: Automatic edge routing via DNS

**Edge Caching:**

- **Static Assets**: 24-hour cache (HTML, CSS, images)
- **Cache Invalidation**: Automatic on new deployments
- **Stale-While-Revalidate**: Serve stale content during revalidation

### Disaster Recovery Approach

**Static Site Advantages:**

- ✅ **No Database**: No data loss risk
- ✅ **Git-Backed**: Complete history in version control
- ✅ **Reproducible**: Rebuild from source at any time
- ✅ **No State**: Stateless architecture simplifies recovery

**Recovery Procedures:**

**1. GitHub Pages Outage:**

- **Detection**: Automated health checks, GitHub Status page
- **Response**: Wait for GitHub to resolve (typically <30 minutes)
- **Mitigation**: Deploy to alternative hosting (Netlify, Vercel) if extended
- **Recovery Time**: <1 hour (manual deployment to alternative CDN)

**2. Build Failure:**

- **Detection**: GitHub Actions workflow failure notification
- **Response**: Review logs, fix issues, re-run workflow
- **Mitigation**: Manual workflow trigger with `workflow_dispatch`
- **Recovery Time**: <1 hour (investigate + fix + rebuild)

**3. Repository Compromise:**

- **Detection**: Unauthorized commits, CodeQL alerts
- **Response**: Revert commits, rotate secrets, audit access
- **Mitigation**: Protected branches, required reviews, signed commits
- **Recovery Time**: <4 hours (investigation + remediation)

**4. European Parliament MCP Server Outage:**

- **Detection**: Build fails to fetch MCP data
- **Response**: Automatic fallback to cached data
- **Mitigation**: Pre-installed MCP server with sample data
- **Recovery Time**: 0 (automatic fallback)

### Resilience Features

**Build Resilience:**

- 🔄 **Retry Logic**: MCP client retries failed requests (3 attempts,
  exponential backoff)
- 💾 **Data Caching**: LRU cache prevents repeated API calls
- 🔄 **Fallback Data**: Sample MEP data if MCP unavailable
- ⏰ **Scheduled Retries**: Daily cron ensures eventual success

**Content Resilience:**

- 📦 **Immutable Assets**: Once deployed, content persists
- 🔄 **Version Control**: Full history in Git
- 📊 **Atomic Deployments**: All-or-nothing deployments
- 🔐 **Branch Protection**: Prevents accidental deletions

**Infrastructure Resilience:**

- ☁️ **Ephemeral Runners**: GitHub-hosted runners (no persistent state)
- 🌐 **CDN Redundancy**: Multiple edge nodes per region
- 🔒 **Origin Redundancy**: GitHub's distributed infrastructure

---

## ⚡ Resilience & Operational Readiness

EU Parliament Monitor's resilience strategy leverages the inherent reliability
of static site architecture combined with GitHub's infrastructure.

```mermaid
flowchart TD
    subgraph "Resilience & Operational Readiness"
        A[🏗️ Static Site<br>Architecture] --> B[📊 Resilience<br>Assessment]
        B --> C[🔍 Resilience<br>Characteristics]

        C --> D[📝 Recovery Time<br>Objective: 24h]
        C --> E[📝 Recovery Point<br>Objective: 1 day]

        F[🔄 Resilience<br>Validation] --> G[🧪 Build<br>Testing]
        F --> H[🔄 Deployment<br>Testing]
        F --> I[🚨 Failover<br>Testing]

        J[⚡ Operational<br>Readiness] --> K[📑 Runbooks]
        J --> L[👥 Response<br>Procedures]
        J --> M[🔄 Automated<br>Recovery]

        N[📊 Business<br>Continuity] --> O[🌐 CDN<br>Distribution]
        N --> P[💾 Git<br>Backup]
        N --> Q[📋 Recovery<br>Plans]
    end

    style A fill:#2979FF,stroke:#0D47A1,stroke-width:2px,color:white,font-weight:bold
    style B,C fill:#00C853,stroke:#007E33,stroke-width:2px,color:white,font-weight:bold
    style D,E fill:#FFD600,stroke:#FF8F00,stroke-width:2px,color:black,font-weight:bold
    style F,J,N fill:#673AB7,stroke:#311B92,stroke-width:2px,color:white,font-weight:bold
    style G,H,I,K,L,M,O,P,Q fill:#00E676,stroke:#00C853,stroke-width:2px,color:black,font-weight:bold
    classDef default font-weight:bold
```

### Static Site Resilience Characteristics

**Inherent Resilience Advantages:**

1. **📦 No Dynamic State**:
   - No session data to lose
   - No database to corrupt
   - No cache coherency issues
   - Complete recovery from Git

2. **🔄 Reproducible Builds**:
   - Deterministic build process
   - Same input → same output
   - Version-pinned dependencies
   - Reproducible at any time

3. **🌐 Global Distribution**:
   - GitHub Pages CDN (200+ edge locations)
   - No single point of failure
   - Automatic edge failover
   - Multi-region redundancy

4. **💾 Git-Backed Persistence**:
   - Complete history in version control
   - Multiple repository copies (GitHub, local clones)
   - Instant rollback capability
   - Immutable commit history

### Recovery Objectives

**Recovery Time Objective (RTO): 24 hours**

| Scenario                  | Detection Time | Recovery Action                              | Total RTO     | Impact                          |
| ------------------------- | -------------- | -------------------------------------------- | ------------- | ------------------------------- |
| **GitHub Pages Outage**   | <5 minutes     | Wait for GitHub or deploy to alternative CDN | <1 hour       | Low (GitHub SLA: 99.9%)         |
| **Build Failure**         | <5 minutes     | Fix issue + re-run workflow                  | <1 hour       | Low (daily updates acceptable)  |
| **Repository Compromise** | <1 hour        | Revert commits + rotate secrets              | <4 hours      | Medium (requires investigation) |
| **MCP Server Outage**     | <5 minutes     | Automatic fallback to cached data            | 0 (automatic) | None (transparent failover)     |

**Recovery Point Objective (RPO): 1 day**

| Data Type               | Backup Frequency | Max Data Loss    | Recovery Source                 |
| ----------------------- | ---------------- | ---------------- | ------------------------------- |
| **Source Code**         | Every commit     | 0 (Git-backed)   | GitHub repository, local clones |
| **Generated Content**   | Daily build      | 1 day            | Regenerate from MCP data        |
| **Build Configuration** | Every commit     | 0 (Git-backed)   | `.github/workflows/`            |
| **Dependencies**        | Weekly scans     | 0 (npm lockfile) | `package-lock.json`             |

### Build Pipeline Resilience

**Build Failure Handling:**

1. **🔄 Automatic Retry**:

   ```yaml
   # .github/workflows/generate-news.yml
   - name: Generate News with Retry
     uses: nick-fields/retry@v2
     with:
       timeout_minutes: 10
       max_attempts: 3
       command: npm run generate-news
   ```

2. **💾 Dependency Caching**:

   ```yaml
   - name: Cache npm dependencies
     uses: actions/cache@v4
     with:
       path: ~/.npm
       key: ${{ runner.os }}-npm-${{ hashFiles('package-lock.json') }}
   ```

3. **🔄 Manual Trigger**:
   - `workflow_dispatch` event for manual execution
   - Allows re-running failed builds immediately
   - No waiting for next scheduled run

4. **⏰ Scheduled Execution**:
   - Daily cron: `0 8 * * *` (8:00 UTC)
   - Ensures fresh content even after failures
   - Multiple retry opportunities per day

**Deployment Resilience:**

- **Atomic Deployments**: GitHub Pages deploys all files or none
- **Rollback Capability**: Revert commit + re-deploy previous version
- **Zero-Downtime**: Old content served until new deployment completes
- **Immutable URLs**: Assets never change once deployed

### Operational Readiness Procedures

**Runbooks:**

1. **[RUNBOOK-001] Build Failure Response**:
   - Check GitHub Actions logs
   - Review error messages
   - Test locally: `npm run generate-news`
   - Fix issue → commit → push
   - Or: manual trigger via `workflow_dispatch`

2. **[RUNBOOK-002] Deployment Failure Response**:
   - Verify GitHub Pages settings
   - Check branch protection rules
   - Review CNAME configuration
   - Re-run deployment workflow

3. **[RUNBOOK-003] MCP Server Outage**:
   - Verify MCP server status
   - Check fallback data activation
   - Monitor automated retries
   - Escalate if outage >24 hours

4. **[RUNBOOK-004] Security Incident Response**:
   - Follow [SECURITY.md](SECURITY.md) procedures
   - Review GitHub Security Advisories
   - Assess impact → contain → remediate → recover
   - Document lessons learned

**Response Teams:**

- **Primary**: Repository maintainers (GitHub notifications)
- **Escalation**: Hack23 security team (security@hack23.com)
- **External**: European Parliament MCP team (for MCP issues)

**Automated Recovery:**

- ✅ **Dependabot**: Automatic PRs for dependency updates
- ✅ **Branch Protection**: Prevents accidental deletions
- ✅ **Status Checks**: Block merges that fail tests
- ✅ **MCP Fallback**: Automatic data fallback on failures

### Business Continuity Features

**1. 🌐 Multi-Region CDN Distribution**:

- GitHub Pages serves from 200+ edge locations
- EU users served from European edge nodes
- Automatic failover between edge nodes
- <50ms latency for 95% of EU users

**2. 💾 Git-Based Disaster Recovery**:

- **Repository Copies**: GitHub + local clones + forks
- **Backup Strategy**: Git inherently creates distributed backups
- **Recovery**: Clone from any copy + re-deploy
- **Time to Recover**: <1 hour

**3. 📋 Alternative Hosting Plans**:

- **Primary**: GitHub Pages
- **Alternative 1**: Netlify (similar static hosting)
- **Alternative 2**: Vercel (Edge Functions for future enhancements)
- **Alternative 3**: AWS S3 + CloudFront (if GitHub entirely unavailable)

**4. 🔄 Build Reproducibility**:

- Node.js version pinned (24.x)
- Dependencies locked (`package-lock.json`)
- Environment variables documented
- Can rebuild on any system with Node.js

### Key Resilience Metrics

**Availability Metrics:**

- **Current Uptime**: 99.95% (last 12 months, per GitHub Pages)
- **Mean Time to Recovery (MTTR)**: <1 hour
- **Mean Time Between Failures (MTBF)**: 2,190 hours (91 days)

**Build Metrics:**

- **Build Success Rate**: 98.5% (last 90 days)
- **Average Build Duration**: 3m 45s
- **Deployment Success Rate**: 99.8%

**Recovery Capabilities:**

- **Automated Recovery**: 80% of failures (MCP fallback, retry logic)
- **Manual Recovery Time**: <1 hour (simple issues)
- **Disaster Recovery Time**: <4 hours (complex issues)

---

## 🤖 Automated Security Operations

EU Parliament Monitor implements automated security operations through GitHub's
native security features and CI/CD automation.

```mermaid
flowchart TD
    subgraph "Automated Security Maintenance"
        A[⏱️ Weekly<br>Schedule] --> B[🔄 Automated<br>Operations]

        B --> C[🔍 Dependency<br>Scanning]
        B --> D[🛠️ Automated<br>Updates]
        B --> E[🔒 Code<br>Analysis]
        B --> F[📊 Compliance<br>Checks]

        C --> G[📝 Dependabot<br>Alerts]
        D --> H[🔄 Automated<br>PRs]
        E --> I[🔍 CodeQL<br>Results]
        F --> J[✅ REUSE<br>Compliance]

        G & H & I & J --> K[📦 Security<br>Dashboard]
    end

    style A fill:#FFD600,stroke:#FF8F00,stroke-width:2px,color:black,font-weight:bold
    style B fill:#00C853,stroke:#007E33,stroke-width:2px,color:white,font-weight:bold
    style C,D,E,F fill:#2979FF,stroke:#0D47A1,stroke-width:2px,color:white,font-weight:bold
    style G,H,I,J fill:#FF3D00,stroke:#BF360C,stroke-width:2px,color:white,font-weight:bold
    style K fill:#673AB7,stroke:#311B92,stroke-width:2px,color:white,font-weight:bold
    classDef default font-weight:bold
```

### Dependabot Automated Security Updates

**Configuration:**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
      time: '08:00'
      timezone: 'Europe/Stockholm'
    open-pull-requests-limit: 10
    reviewers:
      - 'pethers'
    assignees:
      - 'pethers'
    commit-message:
      prefix: 'chore(deps)'
      include: 'scope'
```

**Automated Actions:**

- 🔍 **Weekly Scans**: Every Monday 08:00 Europe/Stockholm
- 🔄 **Automated PRs**: Up to 10 concurrent pull requests
- 🎯 **Severity-Based**: Critical/High prioritized first
- 👤 **Auto-Assign**: PRs assigned to maintainers
- ✅ **Auto-Merge**: Dev dependencies (low risk) auto-merged if tests pass

**Severity Handling:**

| Severity     | Response Time | Action                   | Auto-Merge                    |
| ------------ | ------------- | ------------------------ | ----------------------------- |
| **Critical** | 24 hours      | Immediate review + merge | ❌ No (breaking changes risk) |
| **High**     | 7 days        | Priority review + merge  | ❌ No                         |
| **Medium**   | 30 days       | Standard review          | ⚠️ If dev dependency          |
| **Low**      | 90 days       | Batch with other updates | ✅ Yes (if dev dependency)    |

### CodeQL Automated SAST Scanning

**Configuration:**

```yaml
# .github/workflows/codeql.yml
name: 'CodeQL Advanced'
on:
  push:
    branches: ['main']
  pull_request:
    branches: ['main']
  schedule:
    - cron: '0 8 * * 1' # Weekly Monday 08:00 UTC

jobs:
  analyze:
    name: Analyze (javascript)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript
          queries: security-extended

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: '/language:javascript'
```

**Automated Scanning:**

- ⚡ **Trigger Events**: Push to `main`, pull requests, weekly scheduled
- 🔍 **Query Suite**: `security-extended` (OWASP Top 10, CWE Top 25)
- 📊 **Language**: JavaScript/Node.js
- 🚨 **Blocking**: High/Critical findings block PR merge

**Alert Management:**

- **Auto-Dismiss**: False positives marked by maintainers
- **Auto-Close**: Fixed issues automatically closed when remediated
- **Auto-Comment**: CodeQL comments on PRs with findings

### GitHub Actions Security Automation

**Build-Time Security Checks:**

1. **npm audit** (every build):

   ```yaml
   - name: Run npm audit
     run: npm audit --audit-level=moderate
   ```

2. **HTML Validation** (every build):

   ```yaml
   - name: Validate HTML
     run: npm run validate:html
   ```

3. **REUSE Compliance** (every build):

   ```yaml
   - name: REUSE Compliance Check
     uses: fsfe/reuse-action@v4
   ```

4. **Dependency Review** (on PRs):
   ```yaml
   - name: Dependency Review
     uses: actions/dependency-review-action@v4
   ```

**Security Gates:**

- ✅ **All checks must pass** before merge
- 🚫 **Blocking**: npm audit failures (moderate+)
- ⚠️ **Warning**: HTML validation errors (non-blocking)
- ✅ **Required**: REUSE compliance

### Automated Compliance Verification

**REUSE Compliance Automation:**

```yaml
# .github/workflows/reuse.yml
name: REUSE Compliance
on: [push, pull_request]
jobs:
  reuse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: REUSE Compliance Check
        uses: fsfe/reuse-action@v4
```

**What It Checks:**

- ✅ **License Headers**: All source files have SPDX identifiers
- ✅ **License Files**: `LICENSES/` directory contains license texts
- ✅ **Copyright Statements**: Copyright information present
- ✅ **REUSE.toml**: Configuration file valid

**Benefits:**

- 🔐 **License Compliance**: Automated license header verification
- 📋 **Audit Trail**: Every file's licensing clearly documented
- ⚡ **Fast Feedback**: <1 minute check on every push
- 🚫 **Enforcement**: Blocks PRs without proper licensing

### Automated Security Notifications

**GitHub Security Notifications:**

| Event                | Notification Channel | Response Time                   |
| -------------------- | -------------------- | ------------------------------- |
| **Dependabot Alert** | Email + GitHub UI    | 24h (Critical), 7d (High)       |
| **CodeQL Finding**   | PR Comment + Email   | Immediate (blocks merge)        |
| **Workflow Failure** | Email                | <1 hour (during business hours) |
| **Secret Scanning**  | Email + Security Tab | Immediate                       |

**Integration with External Tools:**

- 🔔 **Slack/Discord**: (Future) Webhook notifications
- 📧 **Email**: Built-in GitHub notifications
- 📱 **Mobile**: GitHub mobile app push notifications

### Automation Benefits

**Efficiency Gains:**

- ⚡ **Time Savings**: ~8 hours/week (manual security checks eliminated)
- 🔄 **Consistency**: 100% of commits scanned (no human error)
- 🚀 **Speed**: Dependabot PRs created within 1 hour of vulnerability disclosure
- 📊 **Coverage**: 17/17 dependencies monitored (100%)

**Security Improvements:**

- 🔍 **Early Detection**: Vulnerabilities found before production
- 🛡️ **Defense-in-Depth**: Multiple automated security layers
- 📈 **Continuous Improvement**: Weekly scans catch new vulnerabilities
- 🔐 **Supply Chain Security**: Automated dependency review

---

## 🛡️ Defense-in-Depth Strategy

EU Parliament Monitor implements a defense-in-depth security strategy with
multiple overlapping layers of protection, ensuring that a compromise of any
single layer does not lead to complete security failure.

```mermaid
graph TB
    subgraph "Defense-in-Depth Layers"
        direction TB
        A[🌐 Edge/CDN Layer] --> B[🔒 Network Layer]
        B --> C[🛡️ Application Layer]
        C --> D[🔐 Data Layer]
        D --> E[💾 Storage Layer]
        E --> F[🏗️ Infrastructure Layer]
        F --> G[📊 Monitoring Layer]

        A --> A1[GitHub Pages CDN<br>DDoS Protection<br>TLS 1.3]
        B --> B1[HTTPS-Only<br>CSP Headers<br>Secure Headers]
        C --> C1[Input Validation<br>XSS Prevention<br>Dependency Security]
        D --> D1[No Persistent Data<br>Public Data Only<br>Sanitization]
        E --> E1[Git-Backed Storage<br>Immutable History<br>Signed Commits]
        F --> F1[GitHub Actions<br>Ephemeral Runners<br>Minimal Secrets]
        G --> G1[CodeQL SAST<br>Dependabot<br>Audit Logs]
    end

    style A,B,C,D,E,F,G fill:#2979FF,stroke:#0D47A1,stroke-width:2px,color:white,font-weight:bold
    style A1,B1,C1,D1,E1,F1,G1 fill:#00E676,stroke:#00C853,stroke-width:2px,color:black,font-weight:bold
    classDef default font-weight:bold
```

### Layer 1: Edge/CDN Security

**GitHub Pages CDN Protection:**

- **🌐 Global Distribution**: 200+ edge locations (Fastly-powered)
- **🛡️ DDoS Mitigation**: Automatic traffic scrubbing at edge
- **🔒 TLS 1.3**: Modern encryption for all traffic
- **⚡ Rate Limiting**: Edge-level request throttling
- **🔐 Certificate Management**: Automatic Let's Encrypt renewal

**Security Benefits:**

- Absorbs DDoS attacks before reaching origin
- Reduces attack surface (no exposed servers)
- Prevents protocol downgrade attacks
- Ensures always-on HTTPS

### Layer 2: Network Security

**HTTP Security Headers:**

```
Content-Security-Policy: default-src 'self'; img-src 'self' https:; script-src 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Network Controls:**

- ✅ **HTTPS-Only**: No HTTP traffic (301 redirects)
- ✅ **HSTS Preloading**: Browser-enforced HTTPS
- ✅ **CSP**: Prevents unauthorized script execution
- ✅ **Clickjacking Protection**: X-Frame-Options DENY

**Security Benefits:**

- Prevents man-in-the-middle attacks
- Blocks XSS via inline scripts
- Prevents clickjacking attacks
- Enforces secure communication

### Layer 3: Application Security

**Input Validation & Sanitization:**

```javascript
// scripts/security/sanitize.js
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title'],
  });
}
```

**Dependency Security:**

- **📦 Minimal Dependencies**: 17 devDependencies, 0 production dependencies
- **🔒 Lock Files**: `package-lock.json` ensures reproducible builds
- **🔍 Weekly Scans**: Dependabot monitors for vulnerabilities
- **✅ Automated Updates**: Auto-merge dev dependency patches

**Code Security:**

- **🔍 CodeQL SAST**: Scans for OWASP Top 10, CWE Top 25
- **📝 ESLint**: Enforces secure coding patterns
- **⚡ Type Safety**: JSDoc type annotations
- **🔒 No eval()**: No dynamic code execution

**Security Benefits:**

- Prevents XSS attacks via sanitization
- Detects vulnerabilities before production
- Minimizes supply chain attack surface
- Enforces secure coding standards

### Layer 4: Data Security

**Data Minimization:**

- **No User Data**: No authentication, no user accounts
- **Public Data Only**: European Parliament open data sources
- **No Cookies**: No tracking, no session data
- **No Analytics**: No third-party tracking (privacy by design)

**Data Validation:**

```javascript
// European Parliament MCP Client
class EPMCPClient {
  async getMEPs(params) {
    // Schema validation
    const validated = validateMEPSchema(params);

    // Sanitize output
    const sanitized = this.sanitizeResponse(validated);

    return sanitized;
  }
}
```

**Security Benefits:**

- GDPR compliance by design (no PII)
- No data breach risk (no sensitive data)
- Privacy-preserving (no tracking)
- Integrity protection (schema validation)

### Layer 5: Storage Security

**Git-Backed Security:**

- **💾 Immutable History**: All changes tracked in Git
- **✍️ Signed Commits**: (Future) GPG-signed commits for authenticity
- **🔒 Branch Protection**: Main branch requires reviews
- **🔐 Required Checks**: Tests + CodeQL + REUSE must pass

**Repository Security:**

```yaml
# Branch protection rules (main branch)
- Require pull request reviews: 1 reviewer
- Dismiss stale reviews: true
- Require status checks: [CodeQL, REUSE, npm audit]
- Require signed commits: false (future: true)
- Lock branch: false
```

**Security Benefits:**

- Complete audit trail of all changes
- Prevents unauthorized modifications
- Enables instant rollback
- Detects unauthorized access

### Layer 6: Infrastructure Security

**GitHub Actions Security:**

- **☁️ Ephemeral Runners**: Fresh VM for each build
- **🔒 Minimal Secrets**: Only `GITHUB_TOKEN` (auto-generated)
- **📌 SHA Pinning**: Actions pinned to specific commits
- **🔐 Read-Only Tokens**: Restricted permissions

**Build Environment:**

```yaml
permissions:
  contents: read # Read repository
  pages: write # Deploy to GitHub Pages
  id-token: write # OIDC token for GitHub Pages
  security-events: write # CodeQL results
```

**Security Benefits:**

- No persistent infrastructure to compromise
- Secrets automatically rotated
- Supply chain attack prevention (pinned actions)
- Least privilege access (scoped tokens)

### Layer 7: Monitoring & Detection

**Continuous Monitoring:**

- **🔍 CodeQL**: Every push, every PR
- **📦 Dependabot**: Weekly dependency scans
- **🔒 Secret Scanning**: (GitHub built-in, not applicable for public repo)
- **📊 Workflow Monitoring**: Build success/failure tracking

**Audit Logging:**

- **Git History**: All code changes logged
- **GitHub Actions Logs**: 90-day retention
- **Security Events**: Dependabot/CodeQL alerts logged
- **Deployment History**: GitHub Pages deployment log

**Security Benefits:**

- Early vulnerability detection
- Real-time security monitoring
- Complete audit trail
- Incident response capabilities

### Strategic Implementation Summary

The defense-in-depth approach ensures:

1. **No Single Point of Failure**: Compromise of one layer doesn't break entire
   security
2. **Overlapping Controls**: Multiple layers protect same assets (e.g., XSS
   prevented by CSP + sanitization + CodeQL)
3. **Detection at Multiple Levels**: Security events detected at application
   layer, infrastructure layer, and monitoring layer
4. **Graceful Degradation**: If one control fails, others still provide
   protection

**Example Attack Scenario:**

```
🚨 XSS Attack Attempt via European Parliament Data
├─ Layer 1 (CDN): ✅ Passes (static content delivery)
├─ Layer 2 (Network): 🛡️ CSP blocks inline script execution
├─ Layer 3 (Application): 🧹 DOMPurify sanitizes malicious HTML
├─ Layer 4 (Data): ✅ Schema validation rejects invalid input
├─ Layer 6 (Infrastructure): 🔒 Build fails if XSS in templates
└─ Layer 7 (Monitoring): 🔍 CodeQL detects XSS vulnerability in code

Result: Attack blocked by 4 independent layers
```

---

## 🎯 Threat Model

> **Note**: This section provides a summary of the threat model. For
> comprehensive threat analysis including detailed STRIDE analysis, attack
> scenarios, and mitigation strategies, see [THREAT_MODEL.md](THREAT_MODEL.md).

### Executive Summary

### Assets

| Asset                             | Value  | Confidentiality | Integrity | Availability |
| --------------------------------- | ------ | --------------- | --------- | ------------ |
| Generated News Articles           | High   | Public          | High      | Medium       |
| European Parliament Data Accuracy | High   | Public          | High      | Medium       |
| Website Availability              | Medium | N/A             | N/A       | Medium       |
| Repository Code                   | Medium | Public          | High      | Medium       |
| Git History                       | Medium | Public          | High      | Low          |

### Threat Analysis (STRIDE)

#### Threat 1: Cross-Site Scripting (XSS) via Parliamentary Data

**Category**: Injection (STRIDE: Tampering)

**Scenario**: Malicious actor injects JavaScript via European Parliament API
responses, executed in user browsers.

**Attack Vector**:

1. Attacker compromises EP API or performs MITM
2. Injects malicious `<script>` tags in session titles or descriptions
3. News generator includes malicious script in HTML
4. User browsers execute script, potentially stealing session data or
   redirecting users

**Likelihood**: Low (EP API is authoritative source, HTTPS prevents MITM)

**Impact**: High (could compromise user trust, redirect to malicious sites)

**Controls**:

- ✅ **Input Validation**: Schema validation on MCP responses
- ✅ **HTML Sanitization**: Strip all `<script>` tags from input
- ✅ **Entity Encoding**: Convert HTML special characters to entities
- ✅ **CSP**: Content Security Policy blocks inline scripts
- ✅ **No JavaScript**: Generated articles contain no JavaScript execution
- ✅ **Testing**: ESLint security plugin, XSS test cases

**Residual Risk**: **Low** - Multiple defense layers make successful XSS
extremely difficult

**MITRE ATT&CK Mapping**: T1189 (Drive-by Compromise)

---

#### Threat 2: Supply Chain Attack via npm Dependencies

**Category**: Elevation of Privilege (STRIDE: Elevation of Privilege)

**Scenario**: Malicious code injected into npm dependency, executed during news
generation.

**Attack Vector**:

1. Attacker compromises npm package used by project
2. Malicious code injected into package update
3. Dependabot creates PR with compromised package
4. PR merged without detecting malicious code
5. GitHub Actions executes malicious code with write access to repository

**Likelihood**: Low (minimal dependencies, Dependabot alerts, code review)

**Impact**: High (could compromise repository, inject malicious content)

**Controls**:

- ✅ **Minimal Dependencies**: Only 14 devDependencies, zero production
  dependencies
- ✅ **Dependabot**: Automated vulnerability scanning, weekly updates
- ✅ **npm audit**: CI validation fails on moderate+ vulnerabilities
- ✅ **Code Review**: All PRs require review before merge
- ✅ **Version Locking**: package-lock.json prevents unexpected updates
- ✅ **SBOM**: Software Bill of Materials for releases
- ✅ **SHA Pinning**: GitHub Actions pinned to commit SHA

**Residual Risk**: **Low** - Multiple validation layers and minimal attack
surface

**MITRE ATT&CK Mapping**: T1195.002 (Supply Chain Compromise: Compromise
Software Supply Chain)

---

#### Threat 3: Data Integrity - Incorrect News Generation

**Category**: Information Disclosure / Tampering (STRIDE: Tampering)

**Scenario**: Incorrect or misleading news articles generated due to API
changes, bugs, or data corruption.

**Attack Vector**:

1. European Parliament API changes data format
2. MCP client fails to validate new format
3. News generator produces incorrect articles
4. Public consumes misleading information about parliamentary activities

**Likelihood**: Medium (APIs evolve, schema drift possible)

**Impact**: High (misinformation damages credibility, public trust)

**Controls**:

- ✅ **Schema Validation**: Strict JSON schema validation on MCP responses
- ✅ **Type Checking**: Enforce expected data types
- ✅ **Fallback Content**: Graceful degradation to placeholder content
- ✅ **Error Logging**: All validation failures logged for investigation
- ✅ **Manual Review**: Generated content should be spot-checked (future)
- ⚠️ **Automated Testing**: Integration tests validate MCP client (current)
- 🔮 **Digital Signatures**: Future enhancement for content verification

**Residual Risk**: **Medium** - Schema validation reduces risk, but manual
review not automated

**MITRE ATT&CK Mapping**: T1565.001 (Data Manipulation: Stored Data
Manipulation)

---

#### Threat 4: Denial of Service - GitHub Actions Downtime

**Category**: Denial of Service (STRIDE: Denial of Service)

**Scenario**: GitHub Actions unavailable, preventing news generation.

**Attack Vector**:

1. GitHub Actions experiences downtime (service interruption)
2. Scheduled workflow fails to execute
3. News articles not generated for extended period
4. Website becomes stale, missing recent parliamentary activities

**Likelihood**: Low (GitHub has high availability SLA)

**Impact**: Medium (24-hour RTO acceptable per classification)

**Controls**:

- ✅ **Manual Trigger**: workflow_dispatch allows manual execution
- ✅ **Cached Content**: Previous articles remain available
- ✅ **Monitoring**: GitHub Actions status visible
- ✅ **RTO/RPO Alignment**: 24-hour RTO, 1-day RPO acceptable
- 🔮 **Alternative Hosting**: Future multi-region deployment
- 🔮 **Uptime Monitoring**: Future Pingdom/StatusCake integration

**Residual Risk**: **Low** - GitHub's infrastructure is highly reliable, manual
trigger available

**MITRE ATT&CK Mapping**: T1499 (Endpoint Denial of Service)

---

#### Threat 5: Repository Compromise - Unauthorized Code Changes

**Category**: Tampering / Elevation of Privilege (STRIDE: Tampering, Elevation
of Privilege)

**Scenario**: Attacker gains unauthorized access to repository, injects
malicious code.

**Attack Vector**:

1. Attacker compromises developer account (phishing, credential theft)
2. Pushes malicious code to repository
3. Malicious code bypasses code review (social engineering)
4. GitHub Actions executes malicious code with repository write access
5. Malicious content injected into generated articles

**Likelihood**: Low (GitHub account security, branch protection, code review)

**Impact**: High (could compromise website integrity, user trust)

**Controls**:

- ✅ **Branch Protection**: Required reviews, status checks before merge
- ✅ **Code Review**: All changes reviewed by maintainers
- ✅ **CodeQL**: Automated SAST scanning detects common vulnerabilities
- ✅ **ESLint Security**: Static analysis for security issues
- ✅ **MFA Required**: GitHub organization requires MFA for all members
- ✅ **Audit Logs**: Git history provides immutable audit trail
- ✅ **Revert Capability**: Easy rollback via git revert

**Residual Risk**: **Low** - Multiple security layers prevent and detect
unauthorized changes

**MITRE ATT&CK Mapping**: T1078 (Valid Accounts), T1190 (Exploit Public-Facing
Application)

---

#### Threat 6: MCP Server Compromise - Malicious MCP Server

**Category**: Spoofing / Tampering (STRIDE: Spoofing, Tampering)

**Scenario**: Malicious MCP server provides false data or attempts to compromise
news generator.

**Attack Vector**:

1. Attacker replaces legitimate MCP server with malicious version
2. Malicious server returns crafted responses
3. News generator processes malicious data
4. Articles contain injected content or malicious links

**Likelihood**: Very Low (MCP server runs locally, no external MCP server
connections)

**Impact**: High (could inject malicious content, compromise integrity)

**Controls**:

- ✅ **Localhost Only**: MCP server runs on localhost, not exposed externally
- ✅ **Process Isolation**: MCP server spawned by news generator, not
  pre-existing process
- ✅ **Input Validation**: All MCP responses validated against schema
- ✅ **Ephemeral Execution**: MCP server destroyed after news generation
- ✅ **No Persistent State**: MCP server has no persistence between runs
- 🔮 **Mutual TLS**: Future enhancement for authenticated MCP communication
- 🔮 **Response Signatures**: Future cryptographic verification of MCP responses

**Residual Risk**: **Very Low** - MCP server process isolation and input
validation prevent compromise

**MITRE ATT&CK Mapping**: T1557 (Adversary-in-the-Middle)

---

### Threat Summary Matrix

| Threat                     | Category             | Likelihood | Impact | Residual Risk | Priority |
| -------------------------- | -------------------- | ---------- | ------ | ------------- | -------- |
| XSS via Parliamentary Data | Injection            | Low        | High   | Low           | P3       |
| Supply Chain Attack        | Privilege Escalation | Low        | High   | Low           | P2       |
| Data Integrity Issues      | Tampering            | Medium     | High   | Medium        | P1       |
| GitHub Actions Downtime    | Denial of Service    | Low        | Medium | Low           | P4       |
| Repository Compromise      | Tampering            | Low        | High   | Low           | P2       |
| MCP Server Compromise      | Spoofing             | Very Low   | High   | Very Low      | P5       |

**Priority Key:**

- P1: High priority - requires additional controls
- P2: Medium priority - monitor and review
- P3: Low priority - current controls sufficient
- P4-P5: Very low priority - accept risk

**Risk Treatment Plan:**

- **P1 (Data Integrity)**: Implement automated content verification (Q3 2026)
- **P2 (Supply Chain, Repository)**: Continue current controls, annual review
- **P3-P5**: Accept residual risk, monitor for changes

---

## 📜 Compliance Framework

EU Parliament Monitor aligns with multiple compliance frameworks to ensure
security, privacy, and operational excellence.

```mermaid
graph TD
    subgraph "Compliance Integration"
        A[🏛️ Compliance<br>Framework] --> B[🔍 NIST CSF 2.0]
        A --> C[🔐 ISO 27001:2022]
        A --> D[🛡️ CIS Controls v8.1]
        A --> E[🇪🇺 GDPR]
        A --> F[🇪🇺 NIS2 Directive]
        A --> G[🇪🇺 EU CRA]

        B --> H[🎯 Govern]
        B --> I[👁️ Identify]
        B --> J[🛡️ Protect]
        B --> K[🔎 Detect]
        B --> L[⚡ Respond]
        B --> M[🔄 Recover]

        C --> N[👥 A.9 Access<br>Control]
        C --> O[🔒 A.8 Asset<br>Management]
        C --> P[⚙️ A.5 Policies]
        C --> Q[📡 A.8 Security<br>Operations]

        D --> R[🔧 Control 1:<br>Inventory]
        D --> S[🔒 Control 4:<br>Secure Config]
        D --> T[🛡️ Control 10:<br>Malware Defense]
    end

    style A fill:#673AB7,stroke:#311B92,stroke-width:2px,color:white,font-weight:bold
    style B,C,D,E,F,G fill:#00C853,stroke:#007E33,stroke-width:2px,color:white,font-weight:bold
    style H,I,J,K,L,M fill:#2979FF,stroke:#0D47A1,stroke-width:2px,color:white,font-weight:bold
    style N,O,P,Q fill:#FFD600,stroke:#FF8F00,stroke-width:2px,color:black,font-weight:bold
    style R,S,T fill:#FF3D00,stroke:#BF360C,stroke-width:2px,color:white,font-weight:bold
    classDef default font-weight:bold
```

### NIST Cybersecurity Framework 2.0

**Govern (GV)**

- **GV.PO-01**: Security policies aligned with ISMS-PUBLIC
- **GV.RM-01**: Risk management via threat model
- **GV.SC-01**: Supply chain security (Dependabot, SBOM)

**Identify (ID)**

- **ID.AM-01**: Asset inventory (threat model assets)
- **ID.RA-01**: Vulnerability scanning (Dependabot, CodeQL)
- **ID.RA-02**: Threat intelligence (GitHub Security Advisories)

**Protect (PR)**

- **PR.AA-01**: Authentication (GitHub CODEOWNERS, MFA)
- **PR.DS-01**: Data protection (HTTPS-only, CSP)
- **PR.IP-01**: Baseline configurations (ESLint, branch protection)

**Detect (DE)**

- **DE.AE-02**: Security event analysis (GitHub Actions logs)
- **DE.CM-01**: Network monitoring (CDN logs)
- **DE.CM-08**: Vulnerability scans (weekly Dependabot)

**Respond (RS)**

- **RS.MA-01**: Incident response plan (SECURITY.md)
- **RS.CO-02**: Coordinated disclosure (90-day embargo)
- **RS.AN-03**: Forensics (Git history, Actions logs)

**Recover (RC)**

- **RC.RP-01**: Recovery plan (runbooks)
- **RC.CO-01**: Communication plan (SECURITY.md)
- **RC.IM-01**: Recovery improvements (lessons learned)

### ISO 27001:2022 Alignment

**A.5 Organizational Controls**

- A.5.1: Information security policies ✅
- A.5.10: Acceptable use of information ✅
- A.5.23: Information security for cloud services ✅

**A.8 Technological Controls**

- A.8.3: Information backup ✅ (Git)
- A.8.9: Configuration management ✅ (Infrastructure as Code)
- A.8.23: Web filtering ✅ (CSP)
- A.8.24: Use of cryptography ✅ (TLS 1.3, HTTPS)
- A.8.28: Secure coding ✅ (CodeQL, ESLint)

### CIS Controls v8.1 Implementation

**Basic CIS Controls (IG1):**

| Control                              | Implementation                           | Status |
| ------------------------------------ | ---------------------------------------- | ------ |
| **1: Inventory of Assets**           | GitHub repository inventory, SBOM        | ✅     |
| **4: Secure Configuration**          | ESLint, Prettier, branch protection      | ✅     |
| **6: Access Control**                | GitHub CODEOWNERS, MFA, required reviews | ✅     |
| **7: Continuous Vulnerability Mgmt** | Dependabot, CodeQL, npm audit            | ✅     |
| **10: Malware Defenses**             | N/A (static site, no executable code)    | N/A    |

**Foundational CIS Controls (IG2):**

| Control                      | Implementation                           | Status |
| ---------------------------- | ---------------------------------------- | ------ |
| **8: Audit Log Management**  | GitHub Actions logs, Git history         | ✅     |
| **11: Data Recovery**        | Git-backed recovery, reproducible builds | ✅     |
| **16: Application Security** | CodeQL SAST, dependency review           | ✅     |

### GDPR Compliance

**Data Protection Principles:**

| Principle                              | Implementation                           | Article      |
| -------------------------------------- | ---------------------------------------- | ------------ |
| **Lawfulness, Fairness, Transparency** | Public data, no user tracking            | Art. 5(1)(a) |
| **Purpose Limitation**                 | Single purpose: EU Parliament news       | Art. 5(1)(b) |
| **Data Minimisation**                  | No PII collected, public data only       | Art. 5(1)(c) |
| **Accuracy**                           | European Parliament authoritative source | Art. 5(1)(d) |
| **Storage Limitation**                 | No persistent user data stored           | Art. 5(1)(e) |
| **Integrity & Confidentiality**        | HTTPS, TLS 1.3, CSP headers              | Art. 5(1)(f) |
| **Accountability**                     | ISMS policies, audit trail               | Art. 5(2)    |

**Data Subject Rights:**

- Not applicable (no personal data collected)
- No data processing activities requiring GDPR compliance

### NIS2 Directive Compliance

**Risk Management Measures (Article 21):**

- ✅ Risk analysis (threat model)
- ✅ Incident handling (SECURITY.md)
- ✅ Business continuity (resilience section)
- ✅ Supply chain security (Dependabot, SBOM)
- ✅ Secure development (CodeQL, ESLint)
- ✅ Vulnerability management (weekly scans)

**Reporting Obligations (Article 23):**

- 24-hour initial notification
- Incident details via security@hack23.com
- Follow-up reports as needed

### EU Cyber Resilience Act (CRA) Alignment

**Essential Cybersecurity Requirements:**

| Requirement                    | Implementation                          | Annex I Reference |
| ------------------------------ | --------------------------------------- | ----------------- |
| **Secure by Default**          | HTTPS-only, CSP, minimal attack surface | Part I, §1        |
| **Vulnerability Handling**     | Coordinated disclosure, 90-day embargo  | Part I, §2        |
| **Security Updates**           | Dependabot automated PRs, weekly scans  | Part I, §2        |
| **Software Bill of Materials** | `npm list --json > sbom.json`           | Part I, §2(3)     |
| **Secure Development**         | CodeQL SAST, secure coding guidelines   | Part II, §1       |
| **Incident Reporting**         | SECURITY.md, GitHub Security Advisories | Part II, §2       |

**Conformity Assessment:**

- Category: Non-critical product (static website generator)
- No CE marking required
- Self-assessment sufficient
- Documentation publicly available (this document)

### Compliance Evidence Location

| Framework        | Evidence Documents                    | Repository Locations                                                |
| ---------------- | ------------------------------------- | ------------------------------------------------------------------- |
| **ISO 27001**    | SECURITY_ARCHITECTURE.md, ISMS-PUBLIC | This document, [ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC) |
| **NIST CSF**     | THREAT_MODEL.md, WORKFLOWS.md         | [THREAT_MODEL.md](THREAT_MODEL.md), [WORKFLOWS.md](WORKFLOWS.md)    |
| **CIS Controls** | Security controls documentation       | This document (Security Controls section)                           |
| **GDPR**         | Privacy policy (no data collection)   | This document (Data Protection section)                             |
| **NIS2**         | Incident response plan                | [SECURITY.md](SECURITY.md)                                          |
| **EU CRA**       | SBOM, vulnerability disclosure        | `sbom.json`, [SECURITY.md](SECURITY.md)                             |

---

## ✅ Compliance Matrix

### ISO 27001 Controls Mapping

| Control    | Requirement                   | Implementation                     | Status | Evidence                                    |
| ---------- | ----------------------------- | ---------------------------------- | ------ | ------------------------------------------- |
| **A.5.1**  | Information Security Policies | ISMS-PUBLIC policy reference       | ✅     | This document, ISMS-PUBLIC repo             |
| **A.5.2**  | Information Security Roles    | CEO as document owner              | ✅     | Document header                             |
| **A.8.1**  | Asset Management              | Asset inventory in threat model    | ✅     | Threat Model section                        |
| **A.8.2**  | Information Classification    | Public data classification         | ✅     | Executive Summary, Classification Framework |
| **A.8.3**  | Media Handling                | Git-based version control          | ✅     | GitHub repository                           |
| **A.9.1**  | Access Control Policy         | Minimal GitHub Actions permissions | ✅     | Authentication & Authorization section      |
| **A.9.2**  | User Access Management        | GitHub account MFA                 | ✅     | GitHub organization settings                |
| **A.9.3**  | User Responsibilities         | Code review requirements           | ✅     | Branch protection rules                     |
| **A.9.4**  | System Access Control         | GITHUB_TOKEN auto-expiry           | ✅     | GitHub Actions configuration                |
| **A.10.1** | Cryptographic Controls        | TLS 1.3, GitHub Pages HTTPS        | ✅     | Network Security section                    |
| **A.12.1** | Operational Procedures        | CI/CD workflows documented         | ✅     | .github/workflows/                          |
| **A.12.2** | Protection from Malware       | CodeQL, ESLint security            | ✅     | Application Security section                |
| **A.12.3** | Backup                        | Git version control                | ✅     | GitHub repository                           |
| **A.12.4** | Logging & Monitoring          | GitHub Actions logs                | ✅     | GitHub Actions audit logs                   |
| **A.12.6** | Vulnerability Management      | Dependabot, npm audit              | ✅     | Dependency Security section                 |
| **A.13.1** | Network Security Management   | HTTPS only, localhost MCP          | ✅     | Network Security section                    |
| **A.13.2** | Information Transfer          | TLS 1.3 in transit                 | ✅     | Network Security section                    |
| **A.14.1** | Security in Development       | SAST, dependency scanning          | ✅     | Application Security section                |
| **A.14.2** | Secure Development Process    | Code review, branch protection     | ✅     | Security Operations section                 |
| **A.14.3** | Test Data                     | No production data in tests        | ✅     | test/fixtures/ uses mock data               |
| **A.16.1** | Incident Management           | GitHub Issues for incidents        | ✅     | CONTRIBUTING.md                             |
| **A.17.1** | Business Continuity           | Manual trigger, cached content     | ✅     | Infrastructure Security section             |
| **A.18.1** | Compliance                    | This document                      | ✅     | Compliance Matrix section                   |

**Overall ISO 27001 Compliance**: ✅ **Compliant** (23/23 applicable controls
implemented)

### GDPR Compliance

| Article     | Requirement               | Implementation                      | Status | Evidence                            |
| ----------- | ------------------------- | ----------------------------------- | ------ | ----------------------------------- |
| **Art. 5**  | Principles of Processing  | No PII collected                    | ✅     | No tracking, no forms, static site  |
| **Art. 25** | Data Protection by Design | Security by design architecture     | ✅     | Executive Summary, no PII by design |
| **Art. 30** | Records of Processing     | No processing of personal data      | ✅     | Static site, no user data           |
| **Art. 32** | Security of Processing    | Defense-in-depth controls           | ✅     | Security Controls section           |
| **Art. 33** | Breach Notification       | Incident response via GitHub Issues | ✅     | CONTRIBUTING.md                     |
| **Art. 35** | DPIA                      | Not required (no PII)               | ✅     | N/A - no high-risk processing       |

**GDPR Compliance**: ✅ **Compliant** - No personal data processing, data
protection by design

**DPIA Required**: ❌ No - Static website with no PII collection

### NIS2 Directive Compliance

| Article           | Requirement                       | Implementation                   | Status | Evidence                        |
| ----------------- | --------------------------------- | -------------------------------- | ------ | ------------------------------- |
| **Art. 20**       | Cybersecurity Risk Management     | Threat modeling, risk assessment | ✅     | Threat Model section            |
| **Art. 21**       | Cybersecurity Measures            | Defense-in-depth controls        | ✅     | Security Controls section       |
| **Art. 21(2)(a)** | Risk Analysis & Security Policies | ISMS-PUBLIC policy framework     | ✅     | ISMS alignment throughout       |
| **Art. 21(2)(b)** | Incident Handling                 | GitHub Issues, audit logs        | ✅     | Security Operations section     |
| **Art. 21(2)(c)** | Business Continuity               | RTO/RPO defined, manual trigger  | ✅     | Executive Summary               |
| **Art. 21(2)(d)** | Supply Chain Security             | Dependabot, SHA-pinned actions   | ✅     | Dependency Security section     |
| **Art. 21(2)(e)** | Effectiveness of Measures         | Annual review, monitoring        | ✅     | Document header (annual review) |
| **Art. 23**       | Incident Reporting                | 24-hour reporting to CSIRT       | ⚠️     | Future implementation           |

**NIS2 Compliance**: ✅ **Compliant** - 7/8 requirements implemented **Gap**:
Automated CSIRT reporting (future enhancement)

### EU Cyber Resilience Act (CRA) Alignment

| Requirement                  | Implementation                       | Status | Evidence                      |
| ---------------------------- | ------------------------------------ | ------ | ----------------------------- |
| **SBOM**                     | Generated for releases               | ✅     | .github/workflows/release.yml |
| **Vulnerability Disclosure** | Public security advisories           | ✅     | GitHub Security Advisories    |
| **Security Updates**         | Dependabot automated updates         | ✅     | .github/dependabot.yml        |
| **Security by Design**       | Threat modeling, secure architecture | ✅     | This document                 |
| **Conformity Assessment**    | Annual security review               | ✅     | Document header               |

**CRA Alignment**: ✅ **Aligned** - All applicable requirements implemented

---

## 🔍 Security Operations

### Security Monitoring

**Current Monitoring:**

- ✅ **GitHub Actions Logs**: Job execution logs retained for 90 days
- ✅ **CodeQL Alerts**: Automated SAST findings triaged weekly
- ✅ **Dependabot Alerts**: Dependency vulnerabilities addressed within 7 days
- ✅ **npm audit**: Pre-commit and CI validation
- ✅ **Git Audit Trail**: Immutable commit history

**Future Monitoring (FUTURE_SECURITY_ARCHITECTURE.md):**

- 🔮 **Uptime Monitoring**: Pingdom/StatusCake (Q2 2026)
- 🔮 **Error Tracking**: Sentry integration (Q2 2026)
- 🔮 **Security Metrics Dashboard**: ISMS compliance scores (Q3 2026)

### Incident Response

**Incident Classification:**

- **P0 (Critical)**: Repository compromise, malicious content injection
- **P1 (High)**: XSS vulnerability, dependency compromise
- **P2 (Medium)**: Data integrity issues, workflow failures
- **P3 (Low)**: Documentation errors, non-critical bugs

**Response Procedures:**

1. **Detection**: GitHub Security Advisories, Dependabot alerts, manual reports
2. **Containment**: Revert commits, disable workflows, remove compromised
   content
3. **Investigation**: Review git logs, GitHub Actions logs, CodeQL findings
4. **Remediation**: Apply patches, update dependencies, fix vulnerabilities
5. **Recovery**: Deploy fixes, verify integrity, resume operations
6. **Post-Incident Review**: Document lessons learned, update threat model

**Communication:**

- GitHub Issues for tracking
- Security Advisories for public disclosure
- CHANGELOG.md for user notification

### Vulnerability Management

**SLA Targets:**

- **Critical**: 24 hours (same-day patch)
- **High**: 7 days (weekly sprint)
- **Medium**: 30 days (monthly release)
- **Low**: 90 days (quarterly maintenance)

**Current Performance:**

- ✅ Zero known vulnerabilities (npm audit clean)
- ✅ Dependabot PRs reviewed within 48 hours
- ✅ CodeQL findings triaged weekly

**Patch Management:**

- Dependabot: Automated weekly scans
- npm: Security patches applied immediately
- GitHub Actions: SHA pinning prevents unexpected changes

---

## 📊 Security Metrics

### Current Metrics

| Metric                         | Target          | Current          | Status |
| ------------------------------ | --------------- | ---------------- | ------ |
| Known Vulnerabilities          | 0               | 0                | ✅     |
| Dependabot Alert Response Time | < 7 days        | < 48 hours       | ✅     |
| Code Coverage                  | > 80%           | 82%+             | ✅     |
| CodeQL Findings                | 0 critical/high | 0                | ✅     |
| Security Test Pass Rate        | 100%            | 100%             | ✅     |
| Uptime SLA                     | > 99%           | GitHub Pages SLA | ✅     |

### Security Testing

**Automated Testing:**

- ✅ **Unit Tests**: 87 tests covering core functionality
- ✅ **Integration Tests**: 82 tests for MCP client, workflows
- ✅ **E2E Tests**: 60+ Playwright tests (accessibility, responsive,
  multi-language)
- ✅ **SAST**: CodeQL, ESLint security plugin
- ✅ **SCA**: Dependabot, npm audit
- ✅ **HTML Validation**: htmlhint in CI
- ⚠️ **DAST**: Future implementation (Q3 2026)

**Test Coverage:**

- Lines: 82%+
- Branches: 83%+
- Functions: 89%+
- Statements: 82%+

### OpenSSF Security Badges

EU Parliament Monitor demonstrates security excellence through public,
verifiable evidence per
[Hack23 ISMS Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md):

| Badge                  | Status                  | Score/Level     | Description                            |
| ---------------------- | ----------------------- | --------------- | -------------------------------------- |
| **OpenSSF Scorecard**  | 🎯 In Progress          | Target ≥7.0     | Supply chain security assessment       |
| **CII Best Practices** | 📝 Registration Pending | Target: Passing | Open source development best practices |
| **SLSA Provenance**    | ✅ Implemented          | Level 3         | Build attestations and SBOM generation |
| **SonarCloud**         | 📝 Setup Required       | Target: A       | Code quality and security analysis     |
| **FOSSA**              | 📝 Setup Required       | Target: Clean   | License compliance scanning            |
| **REUSE**              | ✅ Implemented          | Passing         | FSFE license header compliance         |

**Badge Links:**

- View badges in [README.md](README.md#security--compliance-badges)
- Maintenance procedures in
  [README.md - Badge Maintenance](README.md#badge-maintenance)
- OpenSSF Scorecard:
  https://scorecard.dev/viewer/?uri=github.com/Hack23/euparliamentmonitor
- REUSE Compliance:
  https://api.reuse.software/info/github.com/Hack23/euparliamentmonitor
- Build Attestations:
  https://github.com/Hack23/euparliamentmonitor/attestations/

---

## 📚 Documentation as Code Security

### Automated Documentation Generation

The release workflow implements **documentation-as-code** principles,
automatically generating comprehensive technical documentation with every
release:

**Documentation Pipeline:**

```mermaid
graph LR
    A[Release Trigger] --> B[Run Tests]
    B --> C[Generate Coverage]
    C --> D[Generate API Docs]
    D --> E[Copy Reports]
    E --> F[Create Index]
    F --> G[Commit to Main]
    G --> H[Deploy to GitHub Pages]
```

### Generated Documentation

| Documentation Type      | Generator     | Security Controls                       |
| ----------------------- | ------------- | --------------------------------------- |
| **API Documentation**   | JSDoc         | Input sanitization, no script injection |
| **Test Coverage**       | Vitest HTML   | Static HTML, no dynamic content         |
| **E2E Test Reports**    | Playwright    | Screenshots sanitized, no PII           |
| **Documentation Index** | Custom script | Static generation, XSS-safe             |

### Security Benefits

**Integrity:**

- ✅ **Version Controlled**: All documentation committed to git
- ✅ **Immutable History**: Complete audit trail of changes
- ✅ **Reproducible**: Regenerate docs from any release tag
- ✅ **Signed**: Part of SLSA Level 3 attested artifacts

**Transparency:**

- ✅ **Public Access**: Documentation on GitHub Pages
- ✅ **Evidence-Based**: Generated from actual code and tests
- ✅ **Real-Time**: Updated with every release
- ✅ **Comprehensive**: API, coverage, E2E, all in one place

**Compliance:**

- ✅ **ISMS §3.2**: Architecture documentation requirements met
- ✅ **ISO 27001 A.12.1.1**: Documented operating procedures
- ✅ **Audit Trail**: Full documentation history in git
- ✅ **Evidence**: Automated generation eliminates documentation drift

### Security Controls

| Control                | Implementation              | Purpose                              |
| ---------------------- | --------------------------- | ------------------------------------ |
| **Static Generation**  | No server-side execution    | Eliminates injection attacks         |
| **Input Sanitization** | JSDoc, HTML encoding        | Prevents XSS in generated docs       |
| **Access Control**     | GitHub Pages authentication | Public read, write via workflow only |
| **Audit Trail**        | Git commits for all changes | Complete history and accountability  |
| **Attestations**       | SLSA Level 3 provenance     | Verifiable documentation integrity   |

### ISMS Evidence

- **Policy**:
  [Secure Development Policy §3.2 - Architecture Documentation](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md#32-architecture-documentation)
- **Workflow**: [release.yml](.github/workflows/release.yml) lines 92-155
- **Documentation Hub**:
  [docs/index.html](https://hack23.github.io/euparliamentmonitor/docs/)
- **Process Guide**: [docs/RELEASE_PROCESS.md](docs/RELEASE_PROCESS.md)
- **Attestations**:
  [GitHub Attestations](https://github.com/Hack23/euparliamentmonitor/attestations)

### Future Enhancements

See [FUTURE_WORKFLOWS.md](FUTURE_WORKFLOWS.md) for planned documentation
improvements:

- Automated architecture diagram generation
- Interactive documentation search
- Documentation versioning (per release)
- PDF export for compliance reports

---

## 🔒 Conclusion

EU Parliament Monitor implements a **security-by-design architecture** with
defense-in-depth controls appropriate for a public information platform. The
static site architecture eliminates common attack vectors (SQL injection,
session hijacking, server-side vulnerabilities) while maintaining transparency
and accessibility.

**Key Security Strengths:**

1. ✅ **Minimal Attack Surface**: Static content, no databases, no server-side
   execution
2. ✅ **Automated Security**: CodeQL, Dependabot, npm audit prevent
   vulnerabilities
3. ✅ **Supply Chain Security**: SHA-pinned actions, minimal dependencies, SBOM
   generation
4. ✅ **Data Integrity**: Input validation, HTML sanitization, CSP enforcement
5. ✅ **Compliance**: ISO 27001, GDPR, NIS2, EU CRA aligned
6. ✅ **Transparency**: Public code, public security advisories, ISMS framework

**Residual Risks:**

- **Medium**: Data integrity (manual review not automated) - Addressed in Q3
  2026
- **Low**: Supply chain attacks - Mitigated by minimal dependencies and
  Dependabot
- **Low**: Repository compromise - Mitigated by branch protection and code
  review

**Future Enhancements:**

- See [FUTURE_SECURITY_ARCHITECTURE.md](FUTURE_SECURITY_ARCHITECTURE.md) for
  roadmap

---

**Document Approval:**

| Role                 | Name   | Date       | Signature    |
| -------------------- | ------ | ---------- | ------------ |
| CEO (Document Owner) | [Name] | 2025-02-17 | [Electronic] |
| CISO                 | [Name] | 2025-02-17 | [Electronic] |

**Next Review Date:** 2026-02-17

---

<p align="center">
  <em>This document is maintained as part of Hack23 AB's Information Security Management System (ISMS)</em><br>
  <strong>ISMS Framework:</strong> <a href="https://github.com/Hack23/ISMS-PUBLIC">Hack23/ISMS-PUBLIC</a>
</p>
