<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔄 EU Parliament Monitor — Business Continuity Plan</h1>

<p align="center">
  <strong>🛡️ Classification-Driven Business Resilience for European Parliament Intelligence</strong><br>
  <em>🎯 Systematic Recovery Planning Through AWS S3 + CloudFront Static Site Architecture</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-2.1-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--20-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Semi_Annual-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 2.1 | **📅 Last Updated:** 2026-04-20 (UTC) | **🏷️ Platform Release:** v0.8.40  
**🔄 Review Cycle:** Semi-Annual | **⏰ Next Review:** 2026-10-20

---

## 📚 Architecture Documentation Map

<div class="documentation-map">

| Document                                                            | Focus           | Description                                    | Documentation Link                                                                                     |
| ------------------------------------------------------------------- | --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **[Architecture](ARCHITECTURE.md)**                                 | 🏛️ Architecture | C4 model showing current system structure      | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/ARCHITECTURE.md)                 |
| **[Future Architecture](FUTURE_ARCHITECTURE.md)**                   | 🏛️ Architecture | C4 model showing future system structure       | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_ARCHITECTURE.md)          |
| **[Mindmaps](MINDMAP.md)**                                          | 🧠 Concept      | Current system component relationships         | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/MINDMAP.md)                      |
| **[Future Mindmaps](FUTURE_MINDMAP.md)**                            | 🧠 Concept      | Future capability evolution                    | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_MINDMAP.md)               |
| **[SWOT Analysis](SWOT.md)**                                        | 💼 Business     | Current strategic assessment                   | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/SWOT.md)                         |
| **[Future SWOT Analysis](FUTURE_SWOT.md)**                          | 💼 Business     | Future strategic opportunities                 | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_SWOT.md)                  |
| **[Data Model](DATA_MODEL.md)**                                     | 📊 Data         | Current data structures and relationships      | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/DATA_MODEL.md)                   |
| **[Future Data Model](FUTURE_DATA_MODEL.md)**                       | 📊 Data         | Enhanced European Parliament data architecture | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_DATA_MODEL.md)            |
| **[Flowcharts](FLOWCHART.md)**                                      | 🔄 Process      | Current data processing workflows              | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FLOWCHART.md)                    |
| **[Future Flowcharts](FUTURE_FLOWCHART.md)**                        | 🔄 Process      | Enhanced AI-driven workflows                   | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_FLOWCHART.md)             |
| **[State Diagrams](STATEDIAGRAM.md)**                               | 🔄 Behavior     | Current system state transitions               | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/STATEDIAGRAM.md)                 |
| **[Future State Diagrams](FUTURE_STATEDIAGRAM.md)**                 | 🔄 Behavior     | Enhanced adaptive state transitions            | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_STATEDIAGRAM.md)          |
| **[Security Architecture](SECURITY_ARCHITECTURE.md)**               | 🛡️ Security     | Current security implementation                | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/SECURITY_ARCHITECTURE.md)        |
| **[Future Security Architecture](FUTURE_SECURITY_ARCHITECTURE.md)** | 🛡️ Security     | Security enhancement roadmap                   | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_SECURITY_ARCHITECTURE.md) |
| **[Threat Model](THREAT_MODEL.md)**                                 | 🎯 Security     | STRIDE threat analysis                         | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/THREAT_MODEL.md)                 |
| **[Classification](CLASSIFICATION.md)**                             | 🏷️ Governance   | CIA classification & BCP                       | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/CLASSIFICATION.md)               |
| **[CRA Assessment](CRA-ASSESSMENT.md)**                             | 🛡️ Compliance   | Cyber Resilience Act                           | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/CRA-ASSESSMENT.md)               |
| **[Workflows](WORKFLOWS.md)**                                       | ⚙️ DevOps       | CI/CD documentation                            | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/WORKFLOWS.md)                    |
| **[Future Workflows](FUTURE_WORKFLOWS.md)**                         | 🚀 DevOps       | Planned CI/CD enhancements                     | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_WORKFLOWS.md)             |
| **[Business Continuity Plan](BCPPlan.md)**                          | 🔄 Resilience   | Recovery planning                              | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/BCPPlan.md)                      |
| **[Financial Security Plan](FinancialSecurityPlan.md)**             | 💰 Financial    | Cost & security analysis                       | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FinancialSecurityPlan.md)        |
| **[End-of-Life Strategy](End-of-Life-Strategy.md)**                 | 📦 Lifecycle    | Technology EOL planning                        | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/End-of-Life-Strategy.md)         |
| **[Unit Test Plan](UnitTestPlan.md)**                               | 🧪 Testing      | Unit testing strategy                          | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/UnitTestPlan.md)                 |
| **[E2E Test Plan](E2ETestPlan.md)**                                 | 🔍 Testing      | End-to-end testing                             | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/E2ETestPlan.md)                  |
| **[Performance Testing](performance-testing.md)**                   | ⚡ Performance  | Performance benchmarks                         | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/performance-testing.md)          |
| **[Security Policy](SECURITY.md)**                                  | 🔒 Security     | Vulnerability reporting & security policy      | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/SECURITY.md)                     |

</div>

---

## 🎯 Purpose Statement

**EU Parliament Monitor's** business continuity framework demonstrates how **systematic recovery planning directly enables both operational resilience and democratic transparency excellence.** Our classification-driven continuity approach serves as both operational necessity and demonstration of enterprise-grade practices for an open-source European Parliament Intelligence Platform.

This plan ensures European Parliament monitoring and multi-language news generation (14 languages) can continue during and after disruptive events, based on the [Classification Framework](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) impact analysis and recovery requirements.

*— James Pether Sörling, CEO/Founder*

---

## 📊 Business Impact-Driven Recovery Framework

### 🎯 Business Impact Analysis Integration

Our business continuity planning is directly driven by the [Classification Framework](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) business impact analysis matrix:

```mermaid
graph TB
    subgraph BIA["📊 Business Impact Analysis"]
        DEMOCRATIC[🏛️ Democratic Impact<br/>Transparency Disruption]
        OPERATIONAL[⚙️ Operational Impact<br/>Platform Availability]
        REPUTATIONAL[🤝 Reputational Impact<br/>Public Trust]
        TECHNICAL[💻 Technical Impact<br/>Service Degradation]
    end
    
    subgraph RECOVERY["🔄 Recovery Prioritization"]
        CRITICAL[🔴 Critical Recovery<br/>RTO ≤ 2 hours]
        HIGH[🟠 High Priority<br/>RTO 2-4 hours]
        MEDIUM[🟡 Medium Priority<br/>RTO 4-24 hours]
        STANDARD[🟢 Standard Recovery<br/>RTO > 24 hours]
    end
    
    subgraph BUSINESS["🏢 Platform Functions"]
        CORE[🏗️ Core Platform<br/>Static Site Serving]
        NEWS[📰 News Generation<br/>14-Language Pipeline]
        DATA[📡 EP Data Integration<br/>MCP Server Connection]
        CI[⚙️ CI/CD Pipeline<br/>Build & Deploy]
    end
    
    DEMOCRATIC --> CRITICAL
    OPERATIONAL --> HIGH
    REPUTATIONAL --> MEDIUM
    TECHNICAL --> HIGH
    
    CRITICAL --> CORE
    HIGH --> CORE
    HIGH --> NEWS
    MEDIUM --> DATA
    STANDARD --> CI
    
    style BIA fill:#1565C0,color:#fff
    style RECOVERY fill:#FF9800,color:#fff
    style BUSINESS fill:#4CAF50,color:#fff
```

### 📈 Business Impact Thresholds

| Business Function | 🏛️ Democratic Impact | ⚙️ Operational Impact | 🤝 Reputational Impact | 💻 Technical Impact | 🎯 Recovery Priority |
|-------------------|-------------------|----------------------|----------------------|--------------------|--------------------|
| **🌐 Static Site Serving** | High — Citizens lose access to EP intelligence | Critical — Complete outage | High — Public trust impact | Critical — Full failure | 🔴 Critical (RTO: 2h) |
| **📰 News Generation** | High — Multi-language coverage halted | High — No new content | Medium — Stale content | High — Pipeline failure | 🟠 High (RTO: 4h) |
| **📡 EP Data Integration** | Medium — Existing content still available | Medium — No fresh data | Low — Limited visibility | Medium — API connection lost | 🟡 Medium (RTO: 24h) |
| **⚙️ CI/CD Pipeline** | Low — Existing site unaffected | Medium — Delayed updates | Low — Internal only | Medium — Build delays | 🟢 Standard (RTO: 72h) |

### 📊 Classification-Based Recovery Requirements

Based on [CLASSIFICATION.md](CLASSIFICATION.md) analysis:

| 🏷️ **Dimension** | 📊 **Level** | 📋 **Justification** |
|-------------------|-------------|----------------------|
| **Confidentiality** | 🟢 Public | All EP data is publicly available open data |
| **Integrity** | 🟡 Moderate | News content accuracy matters for democratic transparency |
| **Availability** | 🟡 Standard | Static site with CDN caching provides inherent resilience |

### ⏱️ Recovery Targets

Recovery targets are defined per **asset class** since the platform decomposes cleanly into independent static/publish assets.

| 🎯 **Asset** | **RTO** | **RPO** | 📋 **Rationale** |
|--------------|---------|---------|-------------------|
| **Static site (AWS S3 + CloudFront)** | 1 hour | 0 (versioned S3 bucket) | `deploy-s3.yml` re-run from `main` rebuilds the site; versioned bucket preserves point-in-time content |
| **npm package (`@hack23/euparliamentmonitor`)** | 4 hours | 0 (immutable publish) | Republishable from git tag via `release` workflow; npm provenance + SLSA 3 attestations are re-generatable |
| **News generation pipeline** | 24 hours | 24 hours | Next scheduled agentic run (breaking / week / month / committee / motions / propositions) recovers output; stale analysis replaced on next cadence |
| **Source repository (GitHub)** | 15 minutes | 0 (distributed VCS) | GitHub-native availability + mirrors on every contributor clone |
| **GitHub Pages fallback path** | 2 hours | 0 | Documented failover runbook; `main` already serves the identical static artifacts |

### ⏱️ Aggregate Platform Targets

| 🎯 **Metric** | 📊 **Target** | 📋 **Rationale** |
|---------------|--------------|-------------------|
| **RTO (aggregate platform)** | 2 hours | Primary static-serving restoration bound — critical BIA threshold |
| **RPO (aggregate platform)** | 0 minutes | Git repository + versioned S3 preserve full history |
| **MTTR (Mean Time to Repair)** | 2 hours | Automated CI/CD pipeline rebuild via `deploy-s3.yml` |
| **MTPD (Max Tolerable Period of Disruption)** | 72 hours | After 3 days, democratic monitoring impact becomes significant |
| **SDO (Service Delivery Objective)** | 95% availability | Monthly target for AWS S3 + CloudFront service |
| **WRT (Work Recovery Time)** | 30 minutes | Time to validate restored content integrity across 14 languages |
| **NBD (Normal Business Day)** | N/A (24/7 operations) | No business-day distinction; recovery procedures identical at all times |

---

## 🏗️ Architecture Resilience

### Static Site Architecture Advantages

EU Parliament Monitor's **static site architecture** (HTML5/CSS3 on AWS S3 + CloudFront, per [ADR-002](ARCHITECTURE.md)) provides inherent business continuity advantages:

```mermaid
graph TB
    subgraph "Primary Infrastructure (AWS)"
        GH[GitHub Repository] --> GA[GitHub Actions CI/CD]
        GA -->|S3 Sync + CF Invalidation| AWS[AWS S3 + CloudFront CDN]
        AWS --> U[End Users — 14 Languages]
    end
    
    subgraph "Data Sources"
        EP[European Parliament MCP Server] --> GA
        EP --> |Public API| NS[News Generation Scripts]
        NS --> GH
    end
    
    subgraph "Recovery Options"
        GH --> |git clone| LB[Local Backup]
        GH --> |fork| FR[Fork Recovery]
        AWS --> |CDN Cache| CC[Cached Content]
        GH --> |deploy| ALT[Alternative Hosting<br/>GitHub Pages/Cloudflare/Netlify]
    end
    
    style GH fill:#e3f2fd
    style AWS fill:#c8e6c9
    style CC fill:#fff9c4
    style ALT fill:#f3e5f5
```

| 🛡️ **Resilience Feature** | 📋 **Implementation** | ✅ **Status** |
|---------------------------|----------------------|--------------|
| **No Server Dependencies** | Pure static HTML/CSS/JS | ✅ Active |
| **Git-Based Backup** | Full history in distributed VCS | ✅ Active |
| **CDN Distribution** | AWS CloudFront global CDN | ✅ Active |
| **Automated Rebuild** | GitHub Actions CI/CD pipeline | ✅ Active |
| **Multi-Language Content** | 14 languages pre-generated | ✅ Active |
| **Portable Artifacts** | Static files deployable to any host | ✅ Active |

---

## 🔍 Critical Function Identification

```mermaid
graph TB
    subgraph "Democratic Transparency Functions"
        A[EU Parliament Monitor] --> B[Multi-Language News]
        A --> C[MEP Activity Tracking]
        A --> D[Committee Reports]
        A --> E[Voting Records]
        A --> F[Legislative Pipeline]
        A --> G[Breaking News]
    end

    subgraph "Technical Components"
        B -.-> B1["AWS S3 + CloudFront Hosting - Primary"]
        B -.-> B2[14-Language HTML Generation]
        B -.-> B3["GitHub Pages Hosting - Fallback"]
        C -.-> C1[EP MCP Server Integration]
        C -.-> C2[Data Processing Pipeline]
        D -.-> D1[Committee Document Fetching]
        E -.-> E1[Roll-Call Vote Analysis]
        F -.-> F1[Procedure Tracking]
        G -.-> G1[Feed Data Processing]
    end

    subgraph "Criticality Ranking"
        B1 -.-> CR1[Critical: Platform availability]
        B2 -.-> CR2[High: Content generation]
        C1 -.-> CR3[Medium: Data freshness]
        D1 -.-> CR4[Medium: Report updates]
        E1 -.-> CR5[Medium: Vote analysis]
        G1 -.-> CR6[High: Breaking coverage]
    end

    classDef critical fill:#D32F2F,stroke:#B71C1C,stroke-width:2px,color:#ffffff
    classDef high fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#000000
    classDef medium fill:#FFC107,stroke:#FFA000,stroke-width:2px,color:#000000

    class B1,CR1 critical
    class B2,G1,CR2,CR6 high
    class C1,D1,E1,CR3,CR4,CR5 medium
```

---

## 📊 Business Impact-Driven Decision Matrix

```mermaid
flowchart TD
    INCIDENT[🚨 Service Disruption<br/>Event Detected] --> ASSESS[📊 Business Impact<br/>Assessment]
    
    ASSESS --> DEMOCRATIC{🏛️ Democratic<br/>Impact Level?}
    ASSESS --> OPERATIONAL{⚙️ Operational<br/>Impact Level?}
    ASSESS --> TECHNICAL{💻 Technical<br/>Impact Level?}
    
    DEMOCRATIC -->|Critical/High| IMMEDIATE[⚡ Immediate Response<br/>≤ 30 minutes]
    OPERATIONAL -->|Critical| IMMEDIATE
    TECHNICAL -->|Critical| IMMEDIATE
    
    DEMOCRATIC -->|Medium| URGENT[🔄 Urgent Response<br/>≤ 4 hours]
    OPERATIONAL -->|High| URGENT
    TECHNICAL -->|High| URGENT
    
    OPERATIONAL -->|Medium/Low| STANDARD[📅 Standard Response<br/>≤ 24 hours]
    TECHNICAL -->|Low| STANDARD
    
    IMMEDIATE --> CRITICAL_RECOVERY[🔴 Critical Recovery<br/>Full Resources<br/>AWS S3 + CF Rebuild]
    URGENT --> HIGH_RECOVERY[🟠 High Priority Recovery<br/>Debug & Fix Pipeline]
    STANDARD --> NORMAL_RECOVERY[🟢 Normal Recovery<br/>Scheduled Maintenance]

    classDef incident fill:#D32F2F,stroke:#B71C1C,stroke-width:3px,color:#ffffff
    classDef assessment fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#ffffff
    classDef decision fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#ffffff
    classDef immediate fill:#D32F2F,stroke:#B71C1C,stroke-width:2px,color:#ffffff
    classDef urgent fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#ffffff
    classDef standard fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#ffffff

    class INCIDENT incident
    class ASSESS assessment
    class DEMOCRATIC,OPERATIONAL,TECHNICAL decision
    class IMMEDIATE immediate
    class URGENT urgent
    class STANDARD standard
    class CRITICAL_RECOVERY,HIGH_RECOVERY,NORMAL_RECOVERY standard
```

---

## 🔄 Business Continuity Scenarios

### Scenario 1: AWS S3 + CloudFront Outage

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | Site temporarily unavailable across all 14 languages |
| **Probability** | Low (99.9% SLA) |
| **Recovery** | Automatic upon AWS service restoration; GitHub Pages as fallback |
| **Mitigation** | CDN caching preserves recent content; deploy to alternative host if extended |

### Scenario 2: CI/CD Pipeline Failure

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | News generation paused; existing content remains served |
| **Probability** | Medium |
| **Recovery** | Debug workflow, trigger manual rebuild |
| **Mitigation** | Existing content remains available; manual deployment as fallback |

### Scenario 3: European Parliament Data Source Unavailable

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | New content generation paused |
| **Probability** | Low |
| **Recovery** | Resume when EP API/MCP Server restored |
| **Mitigation** | Existing news articles remain accessible in all 14 languages |

### Scenario 4: Repository Corruption

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | Source code unavailable |
| **Probability** | Very Low |
| **Recovery** | Restore from forks, local clones, or GitHub support |
| **Mitigation** | Distributed Git provides multiple copies; static site still served |

### Scenario 5: Security Incident (Supply Chain Attack)

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | Compromised dependency introduced to build |
| **Probability** | Low |
| **Recovery** | Roll back to known-good commit; audit dependencies |
| **Mitigation** | SHA-pinned GitHub Actions; Dependabot security alerts; CodeQL scanning |

### Scenario 6: EP MCP Server Breaking Change

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | News generation produces errors or empty content |
| **Probability** | Low (Hack23-maintained) |
| **Recovery** | Update EP MCP client code to match new API; server reports uniform `{status:"unavailable", items:[]}` envelope allowing graceful skip |
| **Mitigation** | MCP abstraction layer (`src/mcp/ep-mcp-client.ts`); `mcp-retry.ts` exponential backoff; uniform unavailable envelope |

### Scenario 7: IMF Economic Data Outage

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | IMF is the **sole authoritative source** for economic / fiscal / monetary / trade / FDI / exchange-rate / banking-soundness context. When `dataservices.imf.org` is unavailable, the agent must (a) attempt the cached `analysis/daily/<date>/<run>/cache/imf/*.json` path first, (b) if no cache exists, mark the economic-context artifact as `IMF Source: knowledge-only` (which Stage-C blocks), and (c) defer the article to a later run when IMF recovers. |
| **Probability** | Low–Medium (IMF SDMX 3.0 is generally stable; transient SDMX-XML 503s are observed during scheduled IMF maintenance windows) |
| **Recovery** | Automatic on IMF recovery — re-run the workflow; the cached probe JSON is reused for back-fill on subsequent same-day runs. Stage-C `imf-cache:missing` / `imf-source:knowledge-only` issues block article PR creation until IMF data is present. The legacy WB IMF requirement fallback is **retired**. |
| **Mitigation** | (a) Single-source IMF surface (`IMFMCPClient` SDMX 3.0 with WEO + FM 5-year forecasts) with per-call cache writes to `cache/imf/*.json`; (b) per-source `IMF_API_BASE_URL` / `IMF_API_TIMEOUT_MS` overrides; (c) `analysis/methodologies/imf-indicator-mapping.md §7` vintage rules so an article can use last-known-good cached data with explicit vintage; (d) Stage-C `validate-analysis-completeness.js` enforces IMF presence and rejects WB economic indicator codes (`NY.GDP.*`, `FP.CPI.*`, `SL.UEM.*`, …) and "World Bank … GDP/inflation/…" prose claims inside `intelligence/economic-context.md`. |

### Scenario 8: GitHub Actions / Agentic Runner Outage

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | All 10 agentic news workflows blocked (breaking, weekly/monthly reviews, week/month-ahead, committee-reports, motions, propositions, article-generator multi-type, translate fan-out); deployment paused |
| **Probability** | Low |
| **Recovery** | Manual local runs possible via `npm run generate-news` + `npm run generate-news-indexes`; push generated artifacts directly to `main` for `deploy-s3.yml` to pick up when runners recover |
| **Mitigation** | 10 agentic workflows compiled into deterministic `.lock.yml` via `gh aw compile --validate` (pinned `GH_AW_VERSION: v0.69.0`) — locally reproducible; static build fully scriptable |

### Scenario 9: Copilot / Claude / Codex Quota Exhaustion

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | AI-First 2-pass analysis + article authorship stalls; pre-translation gate (`validate-analysis-completeness.js`) blocks fan-out |
| **Probability** | Medium (metered Copilot billing) |
| **Recovery** | Swap `engine:` field in workflow frontmatter (Copilot ↔ Claude ↔ Codex); if all AI engines unavailable, human-author English source and trigger `news-translate` directly |
| **Mitigation** | Engine-agnostic gh-aw frontmatter; quality thresholds in `analysis/methodologies/reference-quality-thresholds.json` enforce minimums regardless of engine |

### Scenario 10: AWS S3 / CloudFront Extended Outage (Primary Hosting)

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | Primary euparliamentmonitor.com CDN unavailable |
| **Probability** | Very Low (99.9% AWS SLA) |
| **Recovery** | Activate GitHub Pages fallback per [`runbooks/github-pages-failover.md`](runbooks/github-pages-failover.md); repoint DNS CNAME if extended |
| **Mitigation** | Static artifacts in `main` are host-agnostic; GitHub Pages deploy path preserved; identical content served |

### Scenario 11: gh-aw Toolchain Break (v0.69.0 Incompatibility)

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | `.lock.yml` compilation fails or produces incorrect runtime; agentic workflows error during compile-gate |
| **Probability** | Low |
| **Recovery** | Pin to known-good `GH_AW_VERSION` in `.github/workflows/compile-agentic-workflows.yml`; rollback via git revert; if rollback insufficient, convert affected workflow to traditional YAML with human-author mode |
| **Mitigation** | Pinned version in infra workflow; `.lock.yml` artifacts versioned in git; sibling repos (`Hack23/cia`, `Hack23/homepage`) provide cross-reference for upgrade regression |

### Scenario 12: npm Registry Outage or Package Tampering

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | Consumers of `@hack23/euparliamentmonitor` npm package blocked; or dependency install fails in CI |
| **Probability** | Very Low |
| **Recovery** | GitHub Packages mirror available via package namespace; verify SLSA Level 3 provenance attestation via `gh attestation verify`; if tampering suspected, rotate publishing OIDC identity and republish from tag |
| **Mitigation** | Published with provenance + SLSA 3 attestations; `npm ci` + `package-lock.json` locks dependency graph; Dependabot surfaces supply-chain alerts |

### Scenario 13: Compromised Maintainer Credential

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | Potential unauthorized push, workflow edit, or release |
| **Probability** | Low |
| **Recovery** | Revoke compromised token; review audit log; rotate OIDC trust relationships (AWS S3 deploy role); revert any suspicious commits |
| **Mitigation** | Branch protection + required reviews on `main`; OIDC federation (no long-lived AWS keys); GitHub 2FA mandatory; SHA-pinned actions |

### Scenario 14: MCP-Borne Data Poisoning

| 📋 **Aspect** | 📊 **Detail** |
|---------------|--------------|
| **Impact** | Hostile EP MCP response injects misleading content or tries to bypass validator gates |
| **Probability** | Very Low (Hack23-maintained) |
| **Recovery** | `scanHtmlForFallbackLeaks` + `FALLBACK_TEMPLATE_PATTERNS` gate in `validate-analysis-completeness.js` aborts the PR; reference thresholds (`intelligence/mcp-reliability-audit.md` ≥200 words / breaking ≥385) catch low-signal content; human review on every agentic PR |
| **Mitigation** | Pre-translation validator gate scans all EN sources before fan-out; reference quality thresholds in `analysis/methodologies/reference-quality-thresholds.json`; 5-layer gh-aw security (AWF firewall, Docker sandbox, safe-output constraints, JSONL audit, lock file compilation) |

---

## 🚨 Incident Response Procedures

### Phase 1: Immediate Response (0-30 minutes)

**Assessment and Safety:**
1. **🛡️ Safety First**: Ensure no security compromise in progress
2. **📊 Impact Assessment**: Determine scope using criticality matrix above
3. **🚨 Alert**: Create GitHub Issue tagged `incident`
4. **📋 Documentation**: Begin incident logging with timestamps

**Initial Actions:**
- Check [GitHub Status](https://www.githubstatus.com/) for platform issues
- Verify repository integrity (`git log`, branch protection status)
- Verify AWS S3 sync and CloudFront invalidation status (`deploy-s3` workflow)
- Check GitHub Pages fallback deployment status
- Assess which of the 14 language versions are affected

### Phase 2: Short-Term Recovery (30 min – 2 hours for critical static-site serving; up to 4 hours for non-critical/high-priority functions)

For **critical static-site availability (primary S3/CloudFront or GitHub Pages fallback)**, full restoration **must occur within 2 hours** (the documented RTO). The broader 2–4 hour window applies only to **non-critical or high-priority supporting functions** (e.g., news content generation, auxiliary automation).

**Operational Continuity:**
1. **🌐 If AWS S3/CloudFront**: Check S3 bucket status, CloudFront distribution health; failover to GitHub Pages fallback
2. **⚙️ If CI/CD**: Debug and fix the workflow, then redeploy by rerunning the last successful `deploy-s3` workflow run from the GitHub Actions UI or by pushing a no-op commit to the `main` branch in accordance with change-control rules
3. **📡 If Data Source**: Existing content serves users, monitor EP API status
4. **📦 If Repository**: Restore from fork or local clone
5. **🔒 If Security**: Isolate affected components, roll back to known-good state

**Critical System Procedures:**
- Static site: If AWS S3 + CloudFront experiences an extended outage (>30 minutes), perform a **GitHub Pages fallback** using the current static site layout, or deploy from local build to an alternative CDN, following the dedicated runbook: [`GitHub Pages Failover`](runbooks/github-pages-failover.md).
- Build pipeline: Run `npm run build` locally, push static assets directly
- Source repository: Restore from contributor forks (distributed backup)

### Phase 3: Full Recovery (4-24 hours)

**Sustained Operations:**
1. ✅ Verify all 14 language versions are serving correctly (1,894 HTML articles in `news/`)
2. 🧪 Run full test suite (`npm run lint && npm run test`) — 3,061+ Vitest tests across 52 test files
3. 📰 Re-run affected agentic workflows to regenerate news + indexes + sitemap (`npm run build` / `npm run generate-news` / `npm run generate-news-indexes`)
4. 🔍 Validate E2E tests pass (`npm run test:e2e`) — Playwright + axe-core WCAG 2.1 AA
5. 📋 Document incident and lessons learned in GitHub Issue

### Phase 4: Recovery Normalization (24-72 hours)

**Return to Normal Operations:**
1. ✅ System fully restored and validated
2. 📊 Post-incident review conducted
3. 📋 BCP updated with improvements
4. 🧪 Schedule follow-up testing
5. 📢 Communicate resolution to stakeholders

---

## 🛡️ Supplier Dependency Matrix

| **Supplier/Service**        | **Service Type**      | **Criticality** | **Backup Strategy**                | **Recovery Time** |
| --------------------------- | --------------------- | --------------- | ---------------------------------- | ----------------- |
| **AWS S3 + CloudFront**     | Static Site Hosting   | Critical        | GitHub Pages fallback; alternative CDN (Cloudflare/Netlify) | 1–2 hours |
| **GitHub Repository**       | Source Code Storage   | Critical        | Local clones, contributor forks    | 15 minutes |
| **GitHub Actions**          | CI/CD + gh-aw Runtime | High            | Manual local build + deploy        | 4 hours |
| **GitHub Copilot Business** | AI inference via `gh aw` | High         | Engine switch (Claude / Codex) in workflow frontmatter; human fallback | 30 minutes |
| **EP MCP Server (`european-parliament-mcp-server@1.2.18`)** | EU Parliament Data | High | Uniform unavailable envelope + `mcp-retry.ts` backoff; existing articles continue to serve | N/A (graceful degrade) |
| **World Bank MCP (`worldbank-mcp@1.0.1`)** | Biannual WDI data — **non-economic indicators** (health, education, social, environment, demographics, defence, agriculture, innovation, governance) | Medium | Article continues without WB cross-refs; non-economic claims relax to "data unavailable for current vintage" with explicit caveat | N/A (graceful degrade) |
| **IMF REST (SDMX 3.0, native `IMFMCPClient`)** | WEO + FM forecasts (sole authoritative economic source) | High | Cached `cache/imf/*.json` reused on transient outage; if no cache and live IMF down, Stage-C blocks article (`imf-cache:missing`); `IMF_API_TIMEOUT_MS` configurable. | Defer article to next run |
| **npm Registry**            | Dependency + Publish  | High            | GitHub Packages mirror; npm cache + `npm ci`; SLSA 3 attestations verifiable | 2 hours |
| **gh-aw toolchain (v0.69.0)** | Agentic workflow compiler | High         | Pinned version; rollback via git; sibling repos as cross-reference | 4 hours |
| **GitHub Dependabot**       | Security Scanning     | Medium          | Manual `npm audit`; CodeQL          | Low priority |
| **GitHub CodeQL**           | SAST Scanning         | Medium          | ESLint security plugin fallback    | Low priority |

---

## 💾 Data Backup Strategy

**Source Code Backup:**
- GitHub repository with full commit history
- Contributor forks provide distributed backup
- Local development clones on team workstations
- Git shallow clones recoverable via `git fetch --unshallow`

**Generated Content Backup:**
- All generated HTML in `news/` directory committed to Git
- 14-language article archive in repository
- AWS CloudFront caches the primary static site path (S3-backed)
- GitHub Pages CDN caches fallback deployment if activated
- Static files portable to any alternative host

**Configuration Backup:**
- All CI/CD configuration version-controlled (`.github/workflows/`)
- MCP configuration in `.github/copilot-mcp.json`
- Build configuration in `package.json`, `tsconfig.json`, `eslint.config.js`
- No secrets in repository — all via GitHub Secrets/Environment

**Infrastructure as Code:**
- Primary: AWS S3 + CloudFront static hosting managed via GitHub Actions (`deploy-s3` workflow)
- CloudFront distribution, S3 bucket policies and DNS managed via code/automation (no unmanaged click-ops)
- Fallback: GitHub Pages deployment path reserved as a secondary publishing option; if activated, the configuration and procedure MUST be documented and, when automated, expressed as a version-controlled workflow in `.github/workflows/`
- Emergency exception: If GitHub Pages **Settings → Pages** configuration must be changed manually during an incident, the change MUST be documented in the incident log (who/when/what/why) and, after resolution, either codified into automation or reverted back to the documented default configuration (primary S3 + CloudFront path)
- All steady-state infrastructure and CI/CD configuration is declarative and version-controlled; any emergency console changes are temporary and either codified or rolled back

---

## 🧪 DR Testing & Runbooks

### Recovery Runbook Index

Runbooks live in [`runbooks/`](runbooks/) and are invoked by the Incident Response Procedures above. All runbooks are version-controlled, Markdown-only, and executable by any maintainer with standard repository push + AWS OIDC access.

| Runbook | Trigger | Target Asset |
|---------|---------|--------------|
| `runbooks/github-pages-failover.md` | AWS S3/CloudFront outage >30 min (Scenario 10) | Static site |
| `runbooks/agentic-workflow-rollback.md` *(planned)* | gh-aw toolchain break (Scenario 11) | Workflow runtime |
| `runbooks/ai-engine-switch.md` *(planned)* | Copilot/Claude/Codex quota exhaustion (Scenario 9) | AI inference |
| `runbooks/mcp-degraded-mode.md` *(planned)* | EP / WB / IMF outage (Scenarios 3, 6, 7) | Data pipeline |
| `runbooks/npm-republish.md` *(planned)* | npm tampering or attestation failure (Scenario 12) | Package supply chain |

### DR Drill Schedule

Quarterly exercises validate recovery procedures without production impact:

| Quarter | Drill | Success Criterion |
|---------|-------|-------------------|
| **Q1 each year** | GitHub Pages failover dry-run (Scenario 10) | Fallback site live within 2 h; all 14 languages verified |
| **Q2 each year** | Local build + deploy without GitHub Actions (Scenarios 8 + 11) | Full site rebuilt locally; artifacts match CI output |
| **Q3 each year** | MCP degraded-mode test (Scenarios 3 + 6 + 7) | Agentic workflow completes with fallback economic context via WB↔IMF IMF requirement |
| **Q4 each year** | npm republish + provenance verification (Scenario 12) | `gh attestation verify` succeeds; SLSA 3 attestation validated |

### Responsibility & Escalation

| Role | Primary | Backup | Escalation |
|------|---------|--------|------------|
| **Incident Commander** | Maintainer on-call | CEO (James Pether Sörling) | Hack23 AB CEO |
| **Recovery Executor** | Maintainer with AWS OIDC + GitHub write | CEO | — |
| **Communications** | CEO | Maintainer | Public GitHub Status / Issues |
| **Post-Mortem Owner** | Incident Commander | CEO | Security reviews documented in ISMS |

---

## 📣 Communication Plan

| Stakeholder         | Notification Method            | Timeframe         |
|--------------------|-------------------------------|-------------------|
| CEO                | GitHub Issue @mention, Email  | Immediate         |
| Development Team   | GitHub Issue, PR comments     | Within 15 minutes |
| Contributors       | GitHub Issue (public)         | Within 1 hour     |
| Users/Public       | GitHub Status, Repository README | As needed     |

---

## 🧪 Testing & Maintenance

| Activity | Frequency | Method |
|----------|-----------|--------|
| **BCP Review** | Semi-annually (or after major incident) | Document review and update |
| **Recovery Validation** | Monthly | GitHub Actions pipeline validates full rebuild |
| **Backup Verification** | Monthly | Verify `git clone` produces working site |
| **Contact Verification** | Quarterly | Verify all contact information current |
| **Test Suite Health** | Per commit | Automated via CI (3,061+ Vitest unit/integration tests across 52 files + Playwright+axe-core E2E) |
| **Dependency Security** | Daily | Automated via Dependabot + CodeQL |

---

## 📋 ISO 22301:2019 Business Continuity Management Alignment

EU Parliament Monitor BCP aligns with ISO 22301:2019 (Business Continuity Management) key clauses:

| ISO 22301 Clause | Requirement | Implementation | Status |
|-----------------|-------------|----------------|--------|
| **4.1** | Understanding organizational context | Democratic transparency mission, GitHub-hosted | ✅ |
| **4.2** | Interested parties needs | European citizens, researchers, MEPs, media | ✅ |
| **5.1** | Leadership commitment | CEO document ownership and approval | ✅ |
| **6.1** | Risk assessment | THREAT_MODEL.md STRIDE analysis | ✅ |
| **6.2** | Business continuity objectives | RTO ≤ 2h, RPO = 0, MTPD ≤ 72h | ✅ |
| **7.5** | Documented information | This BCP, SECURITY_ARCHITECTURE.md, WORKFLOWS.md | ✅ |
| **8.2** | Business impact analysis (BIA) | CLASSIFICATION.md CIA triad analysis + impact matrix | ✅ |
| **8.3** | Business continuity strategy | Static site + Git backup + CDN + alternative hosting | ✅ |
| **8.4** | Business continuity plans and procedures | This document + recovery runbooks | ✅ |
| **8.5** | Exercise and testing | GitHub Actions pipeline validates recovery monthly | ✅ |
| **8.6** | Evaluation of business continuity docs | Semi-annual review cycle | ✅ |
| **9.1** | Monitoring, measurement, analysis | AWS CloudFront + S3 health monitoring; GitHub Pages fallback monitoring | ✅ |
| **10.1** | Nonconformity and corrective action | GitHub Issues for incident tracking | ✅ |
| **10.2** | Continual improvement | Quarterly threat model review | ✅ |

**ISO 22301 Alignment**: ✅ **Substantially Compliant** — All 14 applicable clauses addressed

---

## 🔄 NIST CSF 2.0 Recovery Function Alignment

| Subcategory | Description | Implementation | Status |
|-------------|-------------|----------------|--------|
| **RC.RP-01** | Recovery plan executed per plan | GitHub Actions manual trigger + runbooks | ✅ |
| **RC.RP-02** | Recovery plan validated before incident | Monthly pipeline test runs | ✅ |
| **RC.RP-03** | Recovery activities meet recovery objectives | RTO/RPO validated in test exercises | ✅ |
| **RC.RP-04** | Critical functions restored per RTO | < 4h rebuild validated via CI timing | ✅ |
| **RC.RP-05** | Integrity of restored assets verified | HTML validation + test suite post-recovery | ✅ |
| **RC.CO-03** | Recovery activities communicated | GitHub Issues, SECURITY.md procedures | ✅ |
| **RC.CO-04** | Lessons learned from incidents documented | Post-incident review requirement | ✅ |
| **RC.IM-01** | Recovery plans updated after exercises | BCP semi-annual review cycle | ✅ |
| **RC.IM-02** | Incident management improvements | GitHub Issues retrospective process | ✅ |

**NIST CSF 2.0 RC Function**: ✅ **9/9 subcategories addressed**

---

## 📊 Framework Compliance Summary

| Framework | Standard | BCP Alignment | Evidence |
|-----------|----------|---------------|---------|
| **ISO 22301:2019** | Business Continuity Management | 14/14 clauses | This document |
| **ISO 27001:2022 A.5.29** | Information security during disruption | Recovery procedures | SECURITY_ARCHITECTURE.md |
| **ISO 27001:2022 A.5.30** | ICT readiness for business continuity | Static site + Git | This document |
| **NIST CSF 2.0 RC** | Recover function | 9/9 subcategories | This document |
| **CIS Controls v8.1 #11** | Data recovery | Git-based backup strategy | BCPPlan.md + WORKFLOWS.md |
| **NIS2 Art.21(2)(c)** | Business continuity | RTO/RPO defined | This document |
| **GDPR Art.32** | Availability of systems | AWS S3 + CloudFront high-availability SLA | Architecture design |
| **EU CRA Annex I §2** | Security update capability | Automated CI/CD pipeline | WORKFLOWS.md |

---

## 📈 BCP Maturity Roadmap

```mermaid
gantt
    title EU Parliament Monitor BCP Maturity Roadmap
    dateFormat YYYY-MM
    section Phase 1: Foundation (Complete)
    BCP Documentation                   :done, 2025-01, 2025-03
    AWS S3 + CloudFront Pilot Setup (pre-ADR eval) :done, 2025-01, 2025-02
    Automated CI/CD Pipeline            :done, 2025-02, 2025-03
    
    section Phase 2: Enhancement (Complete)
    Multi-Language Content (14 langs)  :done, 2025-03, 2025-06
    Comprehensive Test Suite (3061+ tests) :done, 2025-06, 2026-01
    Security Scanning Integration      :done, 2025-09, 2026-01
    Enhanced BCP v2.0                  :done, 2026-02, 2026-04
    
    section Phase 3: Optimization (Current)
    Alternative Hosting Runbook        :done, 2026-02, 2026-03
    gh-aw Agentic Workflows (10 news)  :done, 2026-02, 2026-04
    Dual Economic Data (WB + IMF)      :done, 2026-03, 2026-04
    Quarterly DR Drills                :active, 2026-04, 2026-12
    Automated Recovery Testing         :2026-06, 2026-09
    
    section Phase 4: Maturity
    Multi-CDN Failover Configuration   :2026-10, 2027-01
    Continuous Resilience Monitoring   :2027-01, 2027-06
    Annual BCP Audit & Improvement     :2027-06, 2027-09
```

---

## 🔗 Related Documentation

### 🔐 ISMS Policies
- [🛠️ Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [💾 Backup & Recovery Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Backup_Recovery_Policy.md)
- [🚨 Incident Response Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md)
- [🏷️ Classification Framework](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md)
- [📋 Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [📊 Risk Assessment Methodology](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Assessment_Methodology.md)
- [🌐 ISMS Transparency Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/ISMS_Transparency_Plan.md)
- [🔍 Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md)
- [🆘 Disaster Recovery Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Disaster_Recovery_Plan.md)
- [📝 Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md)
- [🤝 Third Party Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Third_Party_Management.md)

### 🏛️ Project Documentation
- [🏛️ Architecture](ARCHITECTURE.md) — System design
- [🛡️ Security Architecture](SECURITY_ARCHITECTURE.md) — Security controls
- [🏷️ Classification](CLASSIFICATION.md) — CIA classification
- [📊 Data Model](DATA_MODEL.md) — Data structures
- [⚙️ Workflows](WORKFLOWS.md) — CI/CD documentation
- [🔮 Future Workflows](FUTURE_WORKFLOWS.md) — Planned enhancements
- [📦 End-of-Life Strategy](End-of-Life-Strategy.md) — Technology lifecycle
- [💰 Financial Security Plan](FinancialSecurityPlan.md) — Cost analysis
- [🎯 Threat Model](THREAT_MODEL.md) — STRIDE threat analysis

---

**📋 Document Control:**  
**✅ Approved by:** James Pether Sörling, CEO  
**📤 Distribution:** Public  
**🏷️ Classification:** [![Confidentiality: Public](https://img.shields.io/badge/C-Public-lightgrey?style=flat-square&logo=shield&logoColor=black)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#confidentiality-levels) [![Integrity: Moderate](https://img.shields.io/badge/I-Moderate-yellow?style=flat-square&logo=check-circle&logoColor=black)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#integrity-levels) [![Availability: Standard](https://img.shields.io/badge/A-Standard-lightgreen?style=flat-square&logo=server&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#availability-levels)  
**🎯 Framework Compliance:** [![ISO 27001](https://img.shields.io/badge/ISO_27001-2022_Aligned-blue?style=flat-square&logo=iso&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![NIST CSF 2.0](https://img.shields.io/badge/NIST_CSF-2.0_Aligned-green?style=flat-square&logo=nist&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![CIS Controls](https://img.shields.io/badge/CIS_Controls-v8.1_Aligned-orange?style=flat-square&logo=cisecurity&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md)
