<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🧪 EU Parliament Monitor — Unit Test Plan</h1>

<p align="center">
  <strong>Comprehensive Unit Testing Strategy for European Parliament Intelligence</strong><br>
  <em>🔬 Vitest Framework • 📊 Coverage Tracking • 🔐 Security Validation</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--02--20-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-02-20 (UTC)  
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-05-20

---

## 📋 Executive Summary

This Unit Test Plan provides the comprehensive unit testing strategy for the EU Parliament Monitor platform, ensuring all critical components — news generation, multi-language support, and content validation — function correctly and maintain quality standards.

**🔐 ISMS Alignment:** This unit test plan implements [Hack23 Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) Section 4.3.1 — Unit Testing Requirements.

### ISMS Compliance Requirements

| 🎯 **Requirement** | 📊 **Target** | ✅ **Status** | 📋 **ISMS Reference** |
|-------------------|-------------|--------------|---------------------|
| **Line Coverage** | ≥80% | ✅ Tracked | Section 4.3.1.1 |
| **Branch Coverage** | ≥70% | ✅ Tracked | Section 4.3.1.2 |
| **Test Execution** | Every commit | ✅ Automated | Section 4.3.1.3 |
| **Public Reporting** | Required | ✅ Published | Section 4.3.1.4 |

**Evidence Links:**
- [![Tests](https://github.com/Hack23/euparliamentmonitor/actions/workflows/main.yml/badge.svg)](https://github.com/Hack23/euparliamentmonitor/actions/workflows/main.yml)
- [Coverage Reports](https://hack23.github.io/euparliamentmonitor/)

**See Also:**
- [E2E Test Plan](E2ETestPlan.md)
- [Performance Testing](performance-testing.md)
- [Architecture](ARCHITECTURE.md)

---

## 🔧 Testing Framework

### Core Testing Stack

| **Component** | **Technology** | **Purpose** |
|---------------|---------------|-------------|
| **Unit Testing** | Vitest | Modern, fast unit test runner |
| **Coverage Tool** | @vitest/coverage-v8 | V8-based code coverage |
| **Assertions** | Vitest built-in | expect() API |
| **Mocking** | Vitest vi.mock | Module and function mocking |
| **Environment** | Node.js 24 | Runtime environment |

### Configuration

Coverage thresholds and reporting configured in `vitest.config.js`:

```javascript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
    },
  },
});
```

---

## 🧩 Test Organization

### File Structure

```
test/
├── unit/
│   ├── news-generator.test.js       # News generation logic
│   ├── template-engine.test.js      # HTML template processing
│   └── language-utils.test.js       # Multi-language utilities
├── integration/
│   ├── multi-language.test.js       # Multi-language integration
│   └── news-generation.test.js      # Full news pipeline
├── fixtures/
│   ├── sample-news.json             # Test news data
│   └── test-template.html           # Test HTML template
└── README.md
```

### Test Categories

| **Category** | **Purpose** | **Coverage Target** |
|-------------|-------------|-------------------|
| **Unit Tests** | Individual function validation | ≥80% line coverage |
| **Integration Tests** | Multi-component workflows | Key pipeline paths |
| **Fixture Tests** | Template and data validation | All templates |

---

## 🧪 Test Execution

### Development Commands

| **Command** | **Purpose** |
|------------|-------------|
| `npm run test` | Run all tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test -- --watch` | Watch mode for development |

### CI/CD Integration

Tests run automatically on every push and pull request via GitHub Actions:

```yaml
- name: Run tests
  run: npm run test
- name: Run tests with coverage
  run: npm run test:coverage
```

---

## 📊 Coverage Requirements

### Overall Targets

Per ISMS Secure Development Policy:

| **Metric** | **Policy Minimum** | **Status** |
|-----------|-------------------|-----------|
| **Line Coverage** | 80% | ✅ Tracked |
| **Branch Coverage** | 70% | ✅ Tracked |
| **Function Coverage** | 75% | ✅ Tracked |
| **Statement Coverage** | 80% | ✅ Tracked |

### Component Coverage

| **Component** | **Target** | **Priority** |
|-------------|-----------|-------------|
| **News Generation Scripts** | 80%+ | ✅ High |
| **Template Engine** | 80%+ | ✅ High |
| **Language Utilities** | 90%+ | ✅ High |
| **Content Validation** | 80%+ | ⚠️ Medium |
| **HTML Generation** | 70%+ | ⚠️ Medium |

---

## 📋 Testing Standards

### Test Structure — AAA Pattern

All tests follow the **Arrange-Act-Assert** pattern:

```javascript
import { describe, it, expect } from 'vitest';

describe('NewsGenerator', () => {
  it('should generate articles in all supported languages', () => {
    // Arrange
    const languages = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'el', 'pl', 'ro', 'sv', 'da', 'fi', 'cs'];
    
    // Act
    const articles = generateNewsForLanguages(languages);
    
    // Assert
    expect(articles).toHaveLength(14);
    languages.forEach(lang => {
      expect(articles.find(a => a.language === lang)).toBeDefined();
    });
  });
});
```

### Edge Case Testing

Every function must test:
- ✅ Happy path (expected input)
- ✅ Boundary conditions (empty arrays, max lengths)
- ✅ Invalid input (null, undefined, malformed data)
- ✅ Error handling and recovery

---

## 🎯 Compliance Mapping

### ISO 27001 Alignment

| Control | Requirement | Implementation |
|---------|-------------|----------------|
| **A.8.9** | Configuration Management | Version-controlled test plans |
| **A.14.2** | Testing in Development | Automated unit testing |
| **A.14.3** | Test Data Protection | Sanitized test data only |

### NIST CSF Alignment

| Function | Category | Implementation |
|----------|----------|----------------|
| **PR.IP-1** | Baseline Configuration | Vitest config management |
| **PR.IP-2** | SDLC Integration | Unit tests in CI/CD pipeline |

### CIS Controls Alignment

| Control | Description | Implementation |
|---------|-------------|----------------|
| **16.9** | Automated Testing | Unit test automation |
| **16.10** | Test Environment | Isolated test execution |

---

## 🔗 Related Documentation

- [🔍 E2E Test Plan](E2ETestPlan.md) — End-to-end testing
- [⚡ Performance Testing](performance-testing.md) — Performance benchmarks
- [🏛️ Architecture](ARCHITECTURE.md) — System design
- [🛡️ Security Architecture](SECURITY_ARCHITECTURE.md) — Security controls
- [⚙️ Workflows](WORKFLOWS.md) — CI/CD documentation
- [🛡️ CRA Assessment](CRA-ASSESSMENT.md) — Testing evidence for CRA

---

**📋 Document Control:**  
**✅ Approved by:** James Pether Sörling, CEO  
**📤 Distribution:** Public  
**🏷️ Classification:** [![Confidentiality: Public](https://img.shields.io/badge/C-Public-lightgrey?style=flat-square&logo=shield&logoColor=black)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#confidentiality-levels) [![Integrity: Moderate](https://img.shields.io/badge/I-Moderate-yellow?style=flat-square&logo=check-circle&logoColor=black)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#integrity-levels) [![Availability: Standard](https://img.shields.io/badge/A-Standard-lightgreen?style=flat-square&logo=server&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#availability-levels)  
**🎯 Framework Compliance:** [![ISO 27001](https://img.shields.io/badge/ISO_27001-2022_Aligned-blue?style=flat-square&logo=iso&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![NIST CSF 2.0](https://img.shields.io/badge/NIST_CSF-2.0_Aligned-green?style=flat-square&logo=nist&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![CIS Controls](https://img.shields.io/badge/CIS_Controls-v8.1_Aligned-orange?style=flat-square&logo=cisecurity&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md)
