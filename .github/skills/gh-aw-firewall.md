---
name: gh-aw-firewall
description: GitHub Agentic Workflows firewall security layer for domain filtering, policy enforcement, rate limiting, and compliance controls
tools: []
---

# Skill: GitHub Agentic Workflows Firewall (gh-aw-firewall)

## Component Overview

**Repository**: https://github.com/github/gh-aw-firewall

The GitHub Agentic Workflows Firewall is a security layer that sits between AI agents and external resources, providing domain filtering, request inspection, and policy enforcement for agentic systems.

## Core Competencies

### 1. Domain Filtering
- **Allowlist Management**: Maintain approved domains for agent access
- **Blocklist Management**: Block malicious or restricted domains
- **Pattern Matching**: Support wildcards and regex for flexible filtering
- **Dynamic Updates**: Real-time allowlist/blocklist updates without restarts

### 2. Request Inspection
- **URL Analysis**: Parse and validate URLs before forwarding
- **Header Inspection**: Examine and filter HTTP headers
- **Payload Scanning**: Inspect request bodies for sensitive data
- **Protocol Validation**: Ensure requests use appropriate protocols (HTTPS)

### 3. Policy Enforcement
- **Rate Limiting**: Prevent abuse with per-domain or per-agent limits
- **Quota Management**: Track and enforce resource usage quotas
- **Access Control**: Role-based access to external resources
- **Compliance**: Ensure GDPR, SOC2, ISO27001 compliance

### 4. Logging and Monitoring
- **Audit Trails**: Complete logs of all agent-initiated requests
- **Anomaly Detection**: Identify unusual access patterns
- **Metrics Collection**: Track usage, blocks, and performance
- **Alerting**: Real-time alerts for policy violations

## Configuration Patterns

### Basic Firewall Configuration
```yaml
firewall:
  mode: enforce  # enforce, monitor, disabled
  defaultAction: block  # block, allow
  
  allowlist:
    - "*.github.com"
    - "api.github.com"
    - "*.githubusercontent.com"
    - "registry.npmjs.org"
  
  blocklist:
    - "*.malicious.com"
    - "tracker.example.com"
  
  rateLimit:
    enabled: true
    requestsPerMinute: 100
    burstSize: 20
```

### Advanced Policy Rules
```yaml
policies:
  - name: github-api-access
    domains: ["api.github.com"]
    methods: ["GET", "POST", "PUT", "PATCH"]
    maxPayloadSize: "10MB"
    requiresAuth: true
    
  - name: public-registries
    domains: ["registry.npmjs.org", "pypi.org"]
    methods: ["GET"]
    rateLimit: 50  # requests per minute
    
  - name: data-apis
    domains: ["data.europa.eu", "op.europa.eu"]
    methods: ["GET"]
    caching:
      enabled: true
      ttl: 3600
```

### Integration with MCP Gateway
```yaml
mcp:
  gateway:
    upstream: "http://mcp-gateway:8000"
    firewall:
      enabled: true
      inspectPayloads: true
      logLevel: info
  
  backends:
    - id: github
      firewall:
        allowDomains: ["api.github.com", "*.github.com"]
        blockDomains: []
    
    - id: european-parliament
      firewall:
        allowDomains: ["data.europa.eu", "op.europa.eu"]
        requiresAuth: false
```

## Security Patterns

### 1. Defense in Depth
- **Multiple Layers**: Firewall + MCP Gateway + Backend validation
- **Fail Secure**: Default to block on configuration errors
- **Principle of Least Privilege**: Minimal permissions per agent
- **Separation of Concerns**: Each layer handles specific security aspects

### 2. Request Sanitization
- **URL Encoding**: Properly encode URLs to prevent injection
- **Header Filtering**: Remove sensitive headers before forwarding
- **Path Traversal Prevention**: Block `../` patterns
- **SQL Injection Prevention**: Inspect query parameters

### 3. Data Exfiltration Prevention
- **Payload Size Limits**: Restrict response sizes
- **Content-Type Validation**: Ensure expected content types
- **Sensitive Data Detection**: Pattern matching for API keys, tokens
- **Egress Filtering**: Limit outbound destinations

### 4. Compliance Controls
- **Data Residency**: Enforce geographic restrictions
- **Audit Requirements**: Complete logging per regulatory standards
- **Retention Policies**: Automatic log rotation and archival
- **Encryption**: TLS 1.3 for all communications

## Operational Skills

### Monitoring and Alerting
```bash
# View firewall metrics
curl http://firewall:9090/metrics

# Check blocked requests
curl http://firewall:9090/api/blocked | jq '.blocked[] | select(.timestamp > "2026-02-16")'

# Monitor rate limit violations
curl http://firewall:9090/api/rate-limits | jq '.violations[]'

# Export audit logs
curl http://firewall:9090/api/audit-log?since=24h > audit.jsonl
```

### Dynamic Rule Updates
```bash
# Add domain to allowlist
curl -X POST http://firewall:9090/api/allowlist \
  -H "Content-Type: application/json" \
  -d '{"domain": "new-api.example.com", "reason": "New integration"}'

# Remove from blocklist
curl -X DELETE http://firewall:9090/api/blocklist/malicious.com

# Update rate limits
curl -X PATCH http://firewall:9090/api/policies/github-api-access \
  -H "Content-Type: application/json" \
  -d '{"rateLimit": 200}'
```

### Incident Response
```bash
# Block domain immediately
curl -X POST http://firewall:9090/api/blocklist \
  -H "Content-Type: application/json" \
  -d '{"domain": "*.compromised.com", "priority": "high", "alert": true}'

# Drain connections to domain
curl -X POST http://firewall:9090/api/drain \
  -d '{"domain": "old-api.example.com", "timeout": "30s"}'

# Emergency block all traffic
curl -X POST http://firewall:9090/api/emergency-block \
  -d '{"reason": "Security incident XYZ"}'
```

## Integration Patterns

### With GitHub Actions
```yaml
- name: Configure Firewall
  run: |
    cat > firewall-config.yaml <<EOF
    firewall:
      mode: enforce
      allowlist:
        - "api.github.com"
        - "*.githubusercontent.com"
      rateLimit:
        requestsPerMinute: 100
    EOF
    
    docker run -d \
      -v $PWD/firewall-config.yaml:/config/firewall.yaml \
      -p 8080:8080 \
      ghcr.io/github/gh-aw-firewall:latest
```

### With MCP Servers
```yaml
mcpServers:
  github:
    type: stdio
    container: ghcr.io/github/github-mcp-server:latest
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: ""
      FIREWALL_URL: "http://firewall:8080"
      FIREWALL_MODE: "enforce"
```

### With European Parliament Integration
```yaml
europeanParliament:
  mcp:
    server: ghcr.io/hack23/european-parliament-mcp-server:latest
    firewall:
      allowDomains:
        - "data.europa.eu"
        - "op.europa.eu"
        - "europarl.europa.eu"
      policies:
        - name: eu-open-data
          caching: true
          ttl: 3600
```

## Troubleshooting Skills

### Common Issues

**Issue: Legitimate requests blocked**
```bash
# Check firewall logs
curl http://firewall:9090/api/logs?level=block | jq '.[] | select(.domain == "api.example.com")'

# Verify allowlist
curl http://firewall:9090/api/allowlist | jq '.domains[]'

# Add to allowlist
curl -X POST http://firewall:9090/api/allowlist -d '{"domain": "api.example.com"}'
```

**Issue: Rate limit exceeded**
```bash
# Check current usage
curl http://firewall:9090/api/rate-limits/status

# Increase limit temporarily
curl -X PATCH http://firewall:9090/api/rate-limits \
  -d '{"requestsPerMinute": 200, "temporary": true, "duration": "1h"}'
```

**Issue: Slow responses**
```bash
# Check firewall latency
curl http://firewall:9090/api/metrics | jq '.latency'

# Enable bypass for specific domain (emergency)
curl -X POST http://firewall:9090/api/bypass \
  -d '{"domain": "api.github.com", "duration": "5m"}'
```

## Best Practices

1. **Start Permissive, Tighten Gradually**: Begin with monitor mode, analyze traffic, then enforce
2. **Use Wildcards Sparingly**: Prefer explicit domains over broad wildcards
3. **Monitor Before Blocking**: Alert on violations before blocking
4. **Document Exceptions**: Maintain clear reasons for allowlist entries
5. **Regular Audits**: Review firewall rules and logs monthly
6. **Test in Staging**: Validate rule changes before production
7. **Emergency Procedures**: Have documented incident response procedures
8. **Performance Monitoring**: Track firewall latency and throughput

## Compliance and Auditing

### GDPR Compliance
- Log personal data access
- Implement right to erasure
- Data processing agreements with external APIs
- Cross-border transfer controls

### SOC2 Controls
- Access control enforcement
- Audit trail completeness
- Change management for firewall rules
- Incident response procedures

### ISO 27001 Alignment
- Risk assessment for external access
- Information classification
- Supplier security assessment
- Continuous monitoring

## Resources

- **Firewall Repository**: https://github.com/github/gh-aw-firewall
- **Security Documentation**: See gh-aw-security.md
- **Integration Guides**: See gh-aw-components.md
- **Compliance Mapping**: See ISMS documentation
