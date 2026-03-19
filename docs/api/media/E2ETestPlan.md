<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔍 EU Parliament Monitor — End-to-End Test Plan</h1>

<p align="center">
  <strong>Comprehensive E2E Testing for European Parliament Intelligence Platform</strong><br>
  <em>🧪 Playwright Browser Testing • 🌐 Multi-Language Validation • ♿ Accessibility Compliance</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--02--20-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:**
2026-02-20 (UTC)  
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-05-20

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

## 📋 Executive Summary

This End-to-End (E2E) Test Plan provides comprehensive testing coverage for the
EU Parliament Monitor platform, ensuring all critical user journeys,
multi-language content, and accessibility requirements function correctly across
browsers and screen sizes.

**🔐 ISMS Alignment:** This E2E test plan implements
[Hack23 Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
Section 4.3.3 — End-to-End Testing Requirements.

### ISMS Compliance Requirements

| 🎯 **Requirement**           | 📊 **Implementation**                       | ✅ **Status**  | 📋 **ISMS Reference** |
| ---------------------------- | ------------------------------------------- | -------------- | --------------------- |
| **Critical Path Coverage**   | Navigation, language switching, news access | ✅ Implemented | Section 4.3.3.1       |
| **Browser Testing**          | Chromium via Playwright                     | ✅ Validated   | Section 4.3.3.2       |
| **Automated Execution**      | Every PR via GitHub Actions                 | ✅ Active      | Section 4.3.3.3       |
| **Public Reporting**         | Playwright HTML reports                     | ✅ Published   | Section 4.3.3.4       |
| **Accessibility Assertions** | WCAG 2.1 AA via axe-core                    | ✅ Tracked     | Section 4.3.3.5       |

**Evidence Links:**

- [![E2E Tests](https://github.com/Hack23/euparliamentmonitor/actions/workflows/main.yml/badge.svg)](https://github.com/Hack23/euparliamentmonitor/actions/workflows/main.yml)
- [E2E Test Reports](https://hack23.github.io/euparliamentmonitor/)

**See Also:**

- [Unit Test Plan](UnitTestPlan.md)
- [Performance Testing](performance-testing.md)
- [Architecture](ARCHITECTURE.md)

---

## 🎯 Testing Objectives

- **🌐 Validate Multi-Language Content**: Verify all 14 language versions
  render correctly
- **📰 Verify News Article Access**: Test news article navigation and content
  display
- **♿ Confirm Accessibility**: WCAG 2.1 AA compliance across all pages
- **📱 Responsive Design**: Validate layout on desktop, tablet, and mobile
  viewports
- **🔗 Link Integrity**: Verify all internal and external links function
  correctly
- **🏛️ Navigation Flows**: Test primary user journeys through the platform

## 🧩 Test Categories

### 1. 🏛️ Core Navigation

| Journey                                        | Priority  | Status      |
| ---------------------------------------------- | --------- | ----------- |
| Homepage → Language selector → Localized index | ✅ High   | Implemented |
| Homepage → News articles listing               | ✅ High   | Implemented |
| Navigation across all 14 language versions     | ✅ High   | Implemented |
| Footer links and external references           | ⚠️ Medium | Implemented |

### 2. 🌐 Multi-Language Validation

**Supported Languages (14):**

| Language   | Code | Index Page      | News Content |
| ---------- | ---- | --------------- | ------------ |
| English    | EN   | `index.html` | ✅ Generated |
| Swedish    | SV   | `index-sv.html` | ✅ Generated |
| Danish     | DA   | `index-da.html` | ✅ Generated |
| Norwegian  | NO   | `index-no.html` | ✅ Generated |
| Finnish    | FI   | `index-fi.html` | ✅ Generated |
| German     | DE   | `index-de.html` | ✅ Generated |
| French     | FR   | `index-fr.html` | ✅ Generated |
| Spanish    | ES   | `index-es.html` | ✅ Generated |
| Dutch      | NL   | `index-nl.html` | ✅ Generated |
| Arabic     | AR   | `index-ar.html` | ✅ Generated |
| Hebrew     | HE   | `index-he.html` | ✅ Generated |
| Japanese   | JA   | `index-ja.html` | ✅ Generated |
| Korean     | KO   | `index-ko.html` | ✅ Generated |
| Chinese    | ZH   | `index-zh.html` | ✅ Generated |

### 3. ♿ Accessibility Testing

| Standard                | Target                        | Implementation                     |
| ----------------------- | ----------------------------- | ---------------------------------- |
| **WCAG 2.1 AA**         | Full compliance               | axe-core integration in Playwright |
| **Keyboard Navigation** | All interactive elements      | Tab order validation               |
| **Screen Reader**       | ARIA labels and semantic HTML | Automated checks                   |
| **Color Contrast**      | 4.5:1 minimum ratio           | Lighthouse audit                   |

### 4. 📱 Responsive Design

| Viewport   | Width  | Priority  |
| ---------- | ------ | --------- |
| Desktop HD | 1280px | ✅ High   |
| Tablet     | 768px  | ⚠️ Medium |
| Mobile     | 375px  | ⚠️ Medium |

---

## 🧪 Test Implementation with Playwright

### Test Structure

```
e2e/
├── tests/
│   ├── accessibility.spec.js    # WCAG 2.1 AA validation
│   ├── homepage.spec.js         # Homepage functionality
│   ├── i18n.spec.js             # Multi-language testing
│   ├── navigation.spec.js      # Navigation flow testing
│   ├── news-articles.spec.js   # News article rendering
│   └── seo.spec.js             # SEO validation
├── fixtures/
│   └── test-data.html           # Test data fixtures
└── README.md                    # E2E test documentation
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npx playwright test --ui

# Run specific test file
npx playwright test e2e/tests/accessibility.spec.js

# Generate HTML report
npx playwright show-report
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

E2E tests run automatically on every push and pull request:

```yaml
- name: Run E2E tests
  run: npm run test:e2e
```

**Environment:** Ubuntu Latest, Node.js 25, Playwright Chromium

---

## 📊 Success Criteria

| Metric                    | Target          | Status       |
| ------------------------- | --------------- | ------------ |
| **Test Pass Rate**        | 100%            | ✅ Monitored |
| **Accessibility Score**   | WCAG 2.1 AA     | ✅ Validated |
| **Language Coverage**     | 14/14 languages | ✅ Complete  |
| **Browser Compatibility** | Chromium-based  | ✅ Tested    |

---

## 🎯 Compliance Mapping

### ISO 27001 Alignment

| Control    | Requirement              | Implementation                |
| ---------- | ------------------------ | ----------------------------- |
| **A.8.9**  | Configuration Management | Version-controlled test plans |
| **A.14.2** | Testing in Development   | Automated E2E testing         |
| **A.14.3** | Test Data Protection     | Public test data only         |

### NIST CSF Alignment

| Function    | Category               | Implementation               |
| ----------- | ---------------------- | ---------------------------- |
| **PR.IP-1** | Baseline Configuration | Playwright config management |
| **PR.IP-2** | SDLC Integration       | E2E tests in CI/CD pipeline  |

---

## 🔗 Related Documentation

- [🧪 Unit Test Plan](UnitTestPlan.md) — Unit testing strategy
- [⚡ Performance Testing](performance-testing.md) — Performance benchmarks
- [🏛️ Architecture](ARCHITECTURE.md) — System design
- [🛡️ Security Architecture](SECURITY_ARCHITECTURE.md) — Security controls
- [🔄 Business Continuity Plan](BCPPlan.md) — Recovery planning
- [⚙️ Workflows](WORKFLOWS.md) — CI/CD documentation

---

**📋 Document Control:**  
**✅ Approved by:** James Pether Sörling, CEO  
**📤 Distribution:** Public  
**🏷️ Classification:**
[![Confidentiality: Public](https://img.shields.io/badge/C-Public-lightgrey?style=flat-square&logo=shield&logoColor=black)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#confidentiality-levels)
[![Integrity: Moderate](https://img.shields.io/badge/I-Moderate-yellow?style=flat-square&logo=check-circle&logoColor=black)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#integrity-levels)
[![Availability: Standard](https://img.shields.io/badge/A-Standard-lightgreen?style=flat-square&logo=server&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#availability-levels)  
**🎯
Framework Compliance:**
[![ISO 27001](https://img.shields.io/badge/ISO_27001-2022_Aligned-blue?style=flat-square&logo=iso&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md)
[![NIST CSF 2.0](https://img.shields.io/badge/NIST_CSF-2.0_Aligned-green?style=flat-square&logo=nist&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md)
[![CIS Controls](https://img.shields.io/badge/CIS_Controls-v8.1_Aligned-orange?style=flat-square&logo=cisecurity&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md)
