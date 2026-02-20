# 📚 Documentation Standards Skill

## Purpose

Ensure all documentation follows Hack23 standards for quality, completeness, consistency, and ISMS compliance. This includes architecture docs, API docs, and user-facing documentation.

## Rules

### MUST (Critical)
1. MUST include document control metadata (owner, version, classification)
2. MUST use Mermaid diagrams for architecture visualization
3. MUST maintain both current and future state documentation
4. MUST update documentation when code changes affect behavior
5. MUST follow REUSE 3.3 compliance with SPDX headers
6. MUST NOT create new markdown files unless explicitly requested

### Document Control Header

```markdown
| 📋 Metadata | Details |
|---|---|
| **Document** | [Document Name] |
| **Owner** | James Pether Sörling, CEO Hack23 AB |
| **Version** | X.Y |
| **Classification** | PUBLIC |
| **Last Review** | YYYY-MM-DD |
| **Next Review** | YYYY-MM-DD |
```

### README.md Structure

Every Hack23 repository README must include:
1. **Header** with Hack23 branding and metadata badges
2. **Status Badges** (CI/CD, coverage, security, OpenSSF Scorecard)
3. **Project Description** with clear purpose statement
4. **Documentation Hub** linking to all architecture docs
5. **Features** section with capabilities
6. **Quick Start** with prerequisites and setup
7. **Architecture** overview with C4 diagrams
8. **Security & Compliance** with ISMS badges
9. **License** (Apache-2.0)
10. **Contributing** guidelines

### API Documentation

- Use JSDoc for JavaScript/Node.js code
- Generate API docs with `npm run docs:generate`
- Include parameter types, return values, and examples
- Document error cases and edge conditions

```javascript
/**
 * Fetches plenary session data from the European Parliament MCP server.
 * @param {Object} options - Query options
 * @param {string} [options.startDate] - Filter sessions from date (ISO 8601)
 * @param {string} [options.endDate] - Filter sessions until date (ISO 8601)
 * @returns {Promise<Array<PlenarySession>>} Array of plenary session objects
 * @throws {Error} If MCP server is unavailable
 * @example
 * const sessions = await getPlenarySessions({ startDate: '2026-01-01' });
 */
```

### Mermaid Diagram Guidelines

- Maximum 15-20 nodes per diagram
- Use clear, descriptive labels
- Include technology annotations
- Consistent color schemes
- Add legends for complex diagrams

### SPDX License Headers

All files MUST include:
```
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
```

## Related Policies
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
