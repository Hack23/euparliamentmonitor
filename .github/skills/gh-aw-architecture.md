---
name: gh-aw-architecture
description: GitHub Agentic Workflows architecture patterns, layered security model, component integration, and deployment strategies for AI agent systems
tools: []
---

# Skill: GitHub Agentic Workflows Architecture

## Component Overview

**Repository**: https://github.com/github/gh-aw

GitHub Agentic Workflows (gh-aw) is a comprehensive framework for building, deploying, and managing AI agent systems with secure access to external resources through standardized protocols.

## Core Components

### 1. MCP Gateway (gh-aw-mcpg)
**Purpose**: Proxy server for Model Context Protocol (MCP) backends

**Key Skills**:
- Multi-server routing (routed vs unified modes)
- Session-based connection pooling
- Docker container management for backends
- Large payload handling and disk storage
- Per-server logging and debugging

### 2. Firewall (gh-aw-firewall)
**Purpose**: Security layer for agent-initiated network requests

**Key Skills**:
- Domain allowlist/blocklist management
- Request inspection and sanitization
- Rate limiting and quota enforcement
- Audit logging and compliance

### 3. Sandbox Environment
**Purpose**: Isolated execution environment for agents

**Key Skills**:
- Container orchestration
- Resource isolation (CPU, memory, disk)
- Network segmentation
- Secrets management
- Filesystem access control

## Architecture Patterns

### Layered Security Model

```
┌─────────────────────────────────────────┐
│          Agent Orchestration             │
│    (GitHub Actions, Custom Runtime)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Sandbox Environment              │
│  (Container, Resource Limits, Network)   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│           MCP Gateway                    │
│  (Multi-server routing, Session pool)    │
└──────┬────────────┬──────────────────────┘
       │            │
   ┌───▼───┐    ┌──▼────┐
   │  FW   │    │  FW   │
   │ Check │    │ Check │
   └───┬───┘    └──┬────┘
       │            │
   ┌───▼────┐   ┌──▼────────┐
   │Backend │   │ Backend   │
   │  MCP   │   │   MCP     │
   │Server 1│   │ Server 2  │
   └────────┘   └───────────┘
```

### Request Flow Pattern

1. **Agent** → Initiates tool call
2. **Sandbox** → Validates request within resource limits
3. **MCP Gateway** → Routes to appropriate backend server
4. **Firewall** → Checks domain/policy before external call
5. **Backend MCP** → Executes tool and returns response
6. **MCP Gateway** → Processes response (payload handling)
7. **Sandbox** → Returns sanitized response to agent

## Configuration Patterns

### Complete Stack Configuration

```yaml
# sandbox.mcp (agent configuration)
sandbox:
  mcp:
    gateway:
      url: "http://mcp-gateway:8000"
      apiKey: "${MCP_GATEWAY_API_KEY}"
      timeout: 120s
    
    firewall:
      enabled: true
      mode: enforce
      url: "http://firewall:8080"
    
    servers:
      - id: github
        capabilities:
          - repositories
          - issues
          - pull_requests
      
      - id: european-parliament
        capabilities:
          - plenary_sessions
          - documents
          - committees

# gateway configuration (JSON stdin)
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "container": "ghcr.io/github/github-mcp-server:latest",
      "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": ""}
    },
    "european-parliament": {
      "type": "stdio",
      "container": "ghcr.io/hack23/european-parliament-mcp-server:latest",
      "env": {"EP_API_KEY": ""}
    }
  },
  "gateway": {
    "port": 8000,
    "apiKey": "gateway-key",
    "payloadDir": "/tmp/payloads"
  }
}

# firewall configuration
firewall:
  allowlist:
    - "api.github.com"
    - "*.github.com"
    - "data.europa.eu"
    - "op.europa.eu"
  
  policies:
    - name: github-api
      domains: ["api.github.com"]
      rateLimit: 100
    
    - name: eu-open-data
      domains: ["*.europa.eu"]
      caching: true
```

### Deployment Pattern (Docker Compose)

```yaml
services:
  mcp-gateway:
    image: ghcr.io/github/gh-aw-mcpg:latest
    environment:
      - MCP_GATEWAY_PORT=8000
      - MCP_GATEWAY_API_KEY=${GATEWAY_KEY}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./logs:/tmp/gh-aw/mcp-logs
    ports:
      - "8000:8000"
    networks:
      - agent-network
  
  firewall:
    image: ghcr.io/github/gh-aw-firewall:latest
    environment:
      - FIREWALL_MODE=enforce
    volumes:
      - ./firewall-config.yaml:/config/firewall.yaml
    ports:
      - "8080:8080"
    networks:
      - agent-network
  
  agent-sandbox:
    image: ghcr.io/github/gh-aw-sandbox:latest
    environment:
      - MCP_GATEWAY_URL=http://mcp-gateway:8000
      - FIREWALL_URL=http://firewall:8080
    volumes:
      - ./workspace:/workspace:rw
    depends_on:
      - mcp-gateway
      - firewall
    networks:
      - agent-network

networks:
  agent-network:
    driver: bridge
```

## Integration Patterns

### GitHub Actions Integration

```yaml
name: Agentic Workflow

on:
  workflow_dispatch:
    inputs:
      task:
        description: 'Task for agent'
        required: true

jobs:
  execute-agent:
    runs-on: ubuntu-latest
    
    services:
      mcp-gateway:
        image: ghcr.io/github/gh-aw-mcpg:latest
        env:
          MCP_GATEWAY_PORT: 8000
          MCP_GATEWAY_API_KEY: ${{ secrets.GATEWAY_KEY }}
        options: >-
          --health-cmd "curl -f http://localhost:8000/health"
          --health-interval 10s
      
      firewall:
        image: ghcr.io/github/gh-aw-firewall:latest
        env:
          FIREWALL_MODE: enforce
    
    steps:
      - name: Setup Sandbox
        run: |
          docker run -d --name agent-sandbox \
            --network ${{ job.services.network }} \
            -e MCP_GATEWAY_URL=http://mcp-gateway:8000 \
            -e FIREWALL_URL=http://firewall:8080 \
            ghcr.io/github/gh-aw-sandbox:latest
      
      - name: Execute Agent Task
        run: |
          docker exec agent-sandbox agent-cli execute \
            --task "${{ inputs.task }}" \
            --mcp-gateway http://mcp-gateway:8000
      
      - name: Collect Logs
        if: always()
        run: |
          docker logs mcp-gateway > gateway.log
          docker logs firewall > firewall.log
          docker logs agent-sandbox > agent.log
      
      - name: Upload Artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: agent-logs
          path: "*.log"
```

### European Parliament Workflow Pattern

```yaml
europeanParliament:
  agent:
    task: "Monitor EU Parliament activity"
    
    mcp:
      servers:
        - github  # For issue creation
        - european-parliament  # For data fetching
      
      workflow:
        - name: fetch-plenary-sessions
          tool: european-parliament/get_plenary_sessions
          params:
            start_date: "2026-02-01"
            end_date: "2026-02-28"
        
        - name: analyze-documents
          tool: european-parliament/search_documents
          params:
            query: "climate policy"
            limit: 50
        
        - name: create-summary
          tool: github/create_issue
          params:
            title: "EU Parliament Activity - February 2026"
            body: "${analysis_result}"
```

## Security Patterns

### Principle of Least Privilege
- **Per-Agent Credentials**: Unique API keys per agent/workflow
- **Scoped Permissions**: Minimum required MCP server access
- **Time-Limited Tokens**: Short-lived credentials with refresh
- **Audit All Access**: Complete logging of agent actions

### Defense in Depth
- **Layer 1 (Sandbox)**: Resource limits, filesystem isolation
- **Layer 2 (Gateway)**: Session management, payload validation
- **Layer 3 (Firewall)**: Domain filtering, rate limiting
- **Layer 4 (Backend)**: API-specific authentication and authorization

### Secrets Management
```yaml
secrets:
  # Stored in GitHub Secrets
  - MCP_GATEWAY_API_KEY
  - GITHUB_PERSONAL_ACCESS_TOKEN
  - EP_API_KEY
  - FIREWALL_ADMIN_KEY

  # Injected at runtime
  injection:
    method: environment_variables
    prefix: COPILOT_MCP_
    validation: required

  # Never in code
  prohibited:
    - Hardcoded API keys
    - Committed tokens
    - Configuration files with secrets
```

## Monitoring and Observability

### Metrics Collection
```bash
# Gateway metrics
curl http://mcp-gateway:9090/metrics | jq '.servers[] | {id, requests, errors, latency}'

# Firewall metrics
curl http://firewall:9090/metrics | jq '{allowed, blocked, rate_limited}'

# Agent metrics
curl http://sandbox:9090/metrics | jq '{tasks_executed, success_rate, avg_duration}'
```

### Logging Pattern
```json
{
  "timestamp": "2026-02-16T23:00:00Z",
  "component": "mcp-gateway",
  "level": "info",
  "event": "tool_call",
  "session": "abc123",
  "server": "github",
  "tool": "search_code",
  "duration_ms": 250,
  "status": "success"
}
```

### Alerting Rules
```yaml
alerts:
  - name: high_error_rate
    condition: errors > 10% over 5m
    severity: warning
    notify: ["slack", "email"]
  
  - name: firewall_blocks_spike
    condition: blocked_requests > 100 over 1m
    severity: critical
    notify: ["pagerduty", "slack"]
  
  - name: gateway_latency_high
    condition: p95_latency > 2s over 5m
    severity: warning
    notify: ["slack"]
```

## Troubleshooting Patterns

### Component Health Checks
```bash
# Check all components
curl http://mcp-gateway:8000/health
curl http://firewall:8080/health
curl http://sandbox:9090/health

# Detailed status
curl http://mcp-gateway:8000/api/status | jq '.'
```

### Debug Mode
```bash
# Enable debug on all components
export DEBUG="*"
export LOG_LEVEL="debug"

# Gateway debug
DEBUG=server:*,launcher:* docker-compose up mcp-gateway

# Firewall debug
FIREWALL_LOG_LEVEL=debug docker-compose up firewall
```

### Common Issues

**Issue: Agent can't reach MCP server**
1. Check gateway health: `curl http://mcp-gateway:8000/health`
2. Verify network: `docker network inspect agent-network`
3. Check logs: `docker logs mcp-gateway | grep error`
4. Test directly: `curl -X POST http://mcp-gateway:8000/mcp/github -H "Authorization: key" -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'`

**Issue: Firewall blocking legitimate requests**
1. Check firewall logs: `curl http://firewall:8080/api/logs?level=block`
2. Verify allowlist: `curl http://firewall:8080/api/allowlist`
3. Add domain: `curl -X POST http://firewall:8080/api/allowlist -d '{"domain":"api.example.com"}'`

**Issue: Slow agent responses**
1. Check latency: Gateway → Firewall → Backend
2. Review payload sizes: Large responses trigger disk storage
3. Monitor rate limits: Check if hitting limits
4. Scale components: Add more gateway instances

## Best Practices

### Development
1. **Start with Mock Servers**: Test agent logic before real APIs
2. **Use Staging Environment**: Validate changes before production
3. **Version Control Configs**: Track all configuration changes
4. **Automated Testing**: Test firewall rules and gateway configs
5. **Documentation**: Document custom policies and integrations

### Production
1. **High Availability**: Run multiple instances of each component
2. **Load Balancing**: Distribute requests across gateway instances
3. **Monitoring**: Comprehensive metrics and alerting
4. **Backup Configs**: Regular backups of firewall rules
5. **Disaster Recovery**: Documented procedures for component failures

### Security
1. **Regular Audits**: Review firewall logs and access patterns
2. **Rotate Secrets**: Regular credential rotation
3. **Update Components**: Keep all images up to date
4. **Incident Response**: Clear procedures for security events
5. **Compliance**: Regular compliance checks (GDPR, SOC2, ISO27001)

## Resources

- **gh-aw Main**: https://github.com/github/gh-aw
- **MCP Gateway**: https://github.com/github/gh-aw-mcpg
- **Firewall**: https://github.com/github/gh-aw-firewall
- **MCP Spec**: https://github.com/modelcontextprotocol
- **Skills**: See other .github/skills/ files for component-specific details
