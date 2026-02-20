# 🏛️ C4 Architecture Documentation Skill

## Purpose

Ensure all architecture documentation follows the C4 model (Context, Container, Component, Code) with Mermaid diagram syntax, maintaining both current and future state documentation.

## Rules

### MUST (Critical)
1. MUST maintain complete C4 architecture models for the system
2. MUST use Mermaid syntax for all architecture diagrams
3. MUST maintain both current state and future state documentation
4. MUST include document control metadata (owner, version, classification, review date)
5. MUST update architecture docs when system design changes

### Required Documentation Files

**Current State:**
- `ARCHITECTURE.md` — C4 models (Context, Container, Component)
- `DATA_MODEL.md` — Data structures, entities, relationships
- `FLOWCHART.md` — Business process and data flows
- `STATEDIAGRAM.md` — State transitions and lifecycles
- `MINDMAP.md` — Conceptual relationships
- `SWOT.md` — Strategic analysis
- `SECURITY_ARCHITECTURE.md` — Security design and controls
- `THREAT_MODEL.md` — STRIDE threat analysis

**Future State:**
- `FUTURE_ARCHITECTURE.md` — Evolution roadmap
- `FUTURE_DATA_MODEL.md` — Enhanced data plans
- `FUTURE_FLOWCHART.md` — Improved workflows
- `FUTURE_STATEDIAGRAM.md` — Advanced state management
- `FUTURE_MINDMAP.md` — Capability expansion
- `FUTURE_SWOT.md` — Future opportunities
- `FUTURE_SECURITY_ARCHITECTURE.md` — Security improvements

### C4 Model Levels

**Level 1 - System Context:**
```mermaid
graph TB
    User[👤 User/Citizen] -->|Views articles| EPM[EU Parliament Monitor]
    EPM -->|Fetches data| EPMCP[European Parliament MCP Server]
    EPMCP -->|Queries| EPOD[EP Open Data Portal]
    EPM -->|Deployed to| GHP[GitHub Pages]
```

**Level 2 - Container:**
```mermaid
graph TB
    subgraph "EU Parliament Monitor"
        NG[News Generator<br/>Node.js Scripts] -->|generates| HTML[Static HTML Pages<br/>14 Languages]
        NG -->|uses| MCP[MCP Client<br/>ep-mcp-client.js]
        MCP -->|connects to| EPMS[EP MCP Server]
        HTML -->|deployed to| GHP[GitHub Pages]
    end
```

**Level 3 - Component:**
```mermaid
graph TB
    subgraph "News Generator"
        GNE[generate-news-enhanced.js] -->|uses| EMCP[ep-mcp-client.js]
        GNE -->|uses| TMPL[Article Templates]
        GNE -->|outputs| ARTS[HTML Articles]
        EMCP -->|caches| LRU[LRU Cache]
        EMCP -->|validates| VALID[Data Validator]
    end
```

### Document Control Header

Every architecture document MUST include:
```markdown
| 📋 Metadata | Details |
|---|---|
| **Document** | Architecture Documentation |
| **Owner** | James Pether Sörling, CEO Hack23 AB |
| **Version** | X.Y |
| **Classification** | PUBLIC |
| **Last Review** | YYYY-MM-DD |
| **Next Review** | YYYY-MM-DD |
```

### Mermaid Diagram Standards

- Use clear, descriptive labels
- Include technology annotations in containers
- Use consistent color schemes
- Add legends when diagrams are complex
- Keep diagrams focused (max 15-20 nodes)

## Examples

### Security Architecture Pattern
```mermaid
graph TB
    subgraph "Security Controls"
        CSP[Content Security Policy]
        HSTS[HTTP Strict Transport Security]
        SRI[Subresource Integrity]
        XFO[X-Frame-Options]
    end
    subgraph "CI/CD Security"
        CodeQL[CodeQL Analysis]
        Dep[Dependabot Alerts]
        Sec[Secret Scanning]
        SLSA[SLSA Level 3]
    end
```

## Related Policies
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)

## Related Documentation
- [CIA Architecture](https://github.com/Hack23/cia/blob/master/ARCHITECTURE.md)
- [Black Trigram Architecture](https://github.com/Hack23/blacktrigram/blob/master/ARCHITECTURE.md)
- [CIA Compliance Manager Architecture](https://github.com/Hack23/cia-compliance-manager/blob/main/ARCHITECTURE.md)
