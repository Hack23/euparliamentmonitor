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

- **🌐 Validate Multi-Language Content**: Verify all 14 EU language versions
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
| English    | EN   | `index-en.html` | ✅ Generated |
| German     | DE   | `index-de.html` | ✅ Generated |
| French     | FR   | `index-fr.html` | ✅ Generated |
| Spanish    | ES   | `index-es.html` | ✅ Generated |
| Italian    | IT   | `index-it.html` | ✅ Generated |
| Dutch      | NL   | `index-nl.html` | ✅ Generated |
| Polish     | PL   | `index-pl.html` | ✅ Generated |
| Portuguese | PT   | `index-pt.html` | ✅ Generated |
| Romanian   | RO   | `index-ro.html` | ✅ Generated |
| Swedish    | SV   | `index-sv.html` | ✅ Generated |
| Danish     | DA   | `index-da.html` | ✅ Generated |
| Finnish    | FI   | `index-fi.html` | ✅ Generated |
| Greek      | EL   | `index-el.html` | ✅ Generated |
| Hungarian  | HU   | `index-hu.html` | ✅ Generated |

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

**Environment:** Ubuntu Latest, Node.js 24, Playwright Chromium

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
