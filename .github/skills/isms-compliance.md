# 🛡️ ISMS Compliance Skill

## Purpose

Ensure all development activities comply with Hack23's Information Security Management System (ISMS) based on ISO 27001:2022, with mappings to NIST CSF 2.0, CIS Controls v8.1, GDPR, NIS2, and EU CRA.

## Rules

### MUST (Critical)
1. MUST align all changes with ISMS policies
2. MUST update SECURITY_ARCHITECTURE.md when security controls change
3. MUST update THREAT_MODEL.md when new threats are identified
4. MUST maintain security evidence for audits
5. MUST follow classification requirements for all data handling

### ISMS Policy References

| Policy | Purpose | Link |
|--------|---------|------|
| Information Security | Overall security strategy | [Link](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) |
| Secure Development | SDLC security requirements | [Link](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| Open Source | OSS governance and compliance | [Link](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) |
| Classification | Data classification levels | [Link](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md) |
| AI Policy | AI usage governance | [Link](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md) |
| Access Control | Identity and access management | [Link](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) |
| Cryptography | Encryption and key management | [Link](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md) |
| Incident Response | Security incident handling | [Link](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md) |
| Business Continuity | Continuity and recovery | [Link](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Business_Continuity_Plan.md) |
| Third Party Management | Vendor security assessment | [Link](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Third_Party_Management.md) |

### Classification Levels

| Level | Description | Handling |
|-------|-------------|----------|
| **PUBLIC** | Open to public | No restrictions |
| **INTERNAL** | Organization use only | Access control required |
| **CONFIDENTIAL** | Limited distribution | Encryption required |
| **RESTRICTED** | Highly sensitive | MFA + encryption required |

### EU Parliament Monitor Classification
- **Data Classification**: PUBLIC (open parliamentary data)
- **Confidentiality**: Public
- **Integrity**: Medium (data accuracy important)
- **Availability**: Medium (24hr RTO)

### Evidence Requirements

For each security control, maintain:
1. **Policy**: Link to ISMS policy document
2. **Implementation**: Code/config demonstrating compliance
3. **Testing**: Test results validating control effectiveness
4. **Review**: Date of last review and next scheduled review

### Compliance Framework Mapping

| ISO 27001 Control | NIST CSF | CIS Control | Implementation |
|-------------------|----------|-------------|----------------|
| A.8.25 Secure SDLC | PR.IP-2 | CIS-16 | CodeQL, ESLint, Vitest |
| A.8.28 Secure coding | PR.DS-6 | CIS-16.12 | Input validation, output encoding |
| A.8.8 Vuln management | DE.CM-8 | CIS-7 | Dependabot, npm audit |
| A.8.9 Config management | PR.IP-1 | CIS-4 | Security headers, CSP |

### Security Architecture References

All Hack23 repositories maintain security architecture documentation:

| Repository | Security Architecture | Future Architecture |
|-----------|----------------------|-------------------|
| [cia](https://github.com/Hack23/cia) | [Current](https://github.com/Hack23/cia/blob/master/SECURITY_ARCHITECTURE.md) | [Future](https://github.com/Hack23/cia/blob/master/FUTURE_SECURITY_ARCHITECTURE.md) |
| [blacktrigram](https://github.com/Hack23/blacktrigram) | [Current](https://github.com/Hack23/blacktrigram/blob/master/SECURITY_ARCHITECTURE.md) | [Future](https://github.com/Hack23/blacktrigram/blob/master/FUTURE_SECURITY_ARCHITECTURE.md) |
| [cia-compliance-manager](https://github.com/Hack23/cia-compliance-manager) | [Current](https://github.com/Hack23/cia-compliance-manager/blob/main/SECURITY_ARCHITECTURE.md) | [Future](https://github.com/Hack23/cia-compliance-manager/blob/main/FUTURE_SECURITY_ARCHITECTURE.md) |
| [European-Parliament-MCP-Server](https://github.com/Hack23/European-Parliament-MCP-Server) | [Current](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/SECURITY_ARCHITECTURE.md) | [Future](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/FUTURE_SECURITY_ARCHITECTURE.md) |
| [riksdagsmonitor](https://github.com/Hack23/riksdagsmonitor) | [Current](https://github.com/Hack23/riksdagsmonitor/blob/main/SECURITY_ARCHITECTURE.md) | [Future](https://github.com/Hack23/riksdagsmonitor/blob/main/FUTURE_SECURITY_ARCHITECTURE.md) |
| [ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC) | [Current](https://github.com/Hack23/ISMS-PUBLIC/blob/main/SECURITY_ARCHITECTURE.md) | - |

## Related Resources
- [Compliance Checklist](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Compliance_Checklist.md)
- [Risk Register](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Register.md)
