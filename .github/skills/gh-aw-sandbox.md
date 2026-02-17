---
name: gh-aw-sandbox
description: Sandbox configuration for isolated agent execution with resource limits, filesystem control, network segmentation, and secrets management
tools: []
---

# Skill: Sandbox Configuration for Agentic Workflows

## Sandbox Overview

The sandbox provides isolated execution environments for AI agents with controlled access to resources, MCP servers, and external APIs through the firewall.

## Core Competencies

### 1. Resource Isolation
- **CPU Limits**: Control compute resources per agent
- **Memory Limits**: Prevent OOM and resource exhaustion
- **Disk Quotas**: Limit filesystem usage
- **Network Segmentation**: Isolate agent network traffic
- **Process Isolation**: Container-based separation

### 2. Filesystem Access Control
- **Read-Only Mounts**: Immutable base filesystem
- **Read-Write Workspaces**: Isolated agent working directories
- **Temporary Storage**: Ephemeral `/tmp` directories
- **Volume Management**: Persistent data when needed
- **Path Restrictions**: Prevent access outside workspace

### 3. Network Configuration
- **Bridge Networks**: Isolated network per agent/workflow
- **Service Discovery**: Access to MCP gateway and firewall
- **DNS Configuration**: Controlled name resolution
- **Egress Rules**: All external access via firewall
- **No Direct Internet**: Mandatory gateway routing

### 4. Secrets Injection
- **Environment Variables**: Secure secret passing
- **File-Based Secrets**: Mounted secret files
- **Secret Rotation**: Support for credential updates
- **Scope Limitation**: Secrets only to required agents
- **Audit Logging**: Track secret access

## Configuration Patterns

### Basic Sandbox Configuration

```yaml
# sandbox.yaml
sandbox:
  runtime: docker
  image: ghcr.io/github/gh-aw-sandbox:latest
  
  resources:
    cpu: "2"          # 2 CPU cores
    memory: "4Gi"     # 4GB RAM
    diskQuota: "10Gi" # 10GB disk
    
  timeout:
    execution: 3600   # 1 hour max
    idle: 300         # 5 min idle timeout
  
  network:
    mode: bridge
    isolation: true
    gateway: "http://mcp-gateway:8000"
    firewall: "http://firewall:8080"
  
  filesystem:
    workspace: "/workspace"
    readOnly: ["/app", "/lib", "/usr"]
    readWrite: ["/workspace", "/tmp"]
```

### Advanced Resource Configuration

```yaml
resources:
  limits:
    cpu: "4"
    memory: "8Gi"
    storage: "20Gi"
    processes: 100
    fileDescriptors: 1024
    
  reservations:
    cpu: "1"
    memory: "2Gi"
  
  monitoring:
    enabled: true
    metrics:
      - cpu_usage
      - memory_usage
      - disk_io
      - network_io
    interval: 10s
```

### Security Configuration

```yaml
security:
  runAsUser: 1000
  runAsGroup: 1000
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  
  capabilities:
    drop: ["ALL"]
    add: []
  
  seccomp:
    type: RuntimeDefault
  
  apparmor:
    type: runtime/default
```

## MCP Integration Patterns

### Sandbox MCP Configuration

```yaml
# sandbox.mcp
mcp:
  gateway:
    url: "http://mcp-gateway:8000"
    apiKey: "${MCP_GATEWAY_API_KEY}"
    timeout: 120
    retries: 3
  
  servers:
    github:
      enabled: true
      tools:
        - search_code
        - get_file_contents
        - create_issue
        - create_pull_request
    
    european-parliament:
      enabled: true
      tools:
        - get_plenary_sessions
        - search_documents
        - get_committee_info
    
    filesystem:
      enabled: true
      rootPath: "/workspace"
      tools:
        - read_file
        - write_file
        - list_directory
```

### Environment Variable Injection

```yaml
environment:
  # Gateway credentials
  - name: MCP_GATEWAY_URL
    value: "http://mcp-gateway:8000"
  
  - name: MCP_GATEWAY_API_KEY
    valueFrom:
      secretKeyRef:
        name: mcp-credentials
        key: gateway-api-key
  
  # Backend tokens (passed through to MCP servers)
  - name: GITHUB_PERSONAL_ACCESS_TOKEN
    valueFrom:
      secretKeyRef:
        name: github-credentials
        key: pat
  
  - name: EP_API_KEY
    valueFrom:
      secretKeyRef:
        name: ep-credentials
        key: api-key
  
  # Agent configuration
  - name: AGENT_LOG_LEVEL
    value: "info"
  
  - name: AGENT_WORKSPACE
    value: "/workspace"
```

## Lifecycle Management

### Sandbox Lifecycle States

```
┌─────────┐
│ Created │ - Initial state
└────┬────┘
     │
┌────▼────┐
│Starting │ - Resource allocation
└────┬────┘
     │
┌────▼────┐
│ Running │ - Agent execution
└────┬────┘
     │
┌────▼────┐
│Stopping │ - Cleanup
└────┬────┘
     │
┌────▼─────┐
│Terminated│ - Completed
└──────────┘
```

### Lifecycle Hooks

```yaml
lifecycle:
  postStart:
    exec:
      command: ["/bin/sh", "-c", "echo Starting agent"]
  
  preStop:
    exec:
      command: ["/bin/sh", "-c", "echo Stopping agent; cleanup.sh"]
  
  healthCheck:
    httpGet:
      path: /health
      port: 9090
    initialDelaySeconds: 5
    periodSeconds: 10
```

## Workspace Management

### Workspace Structure

```
/workspace/
├── input/          # Read-only input data
├── output/         # Agent output
├── tmp/            # Temporary files
├── cache/          # Persistent cache
└── logs/           # Agent logs
```

### Volume Configuration

```yaml
volumes:
  - name: workspace
    emptyDir:
      sizeLimit: "10Gi"
  
  - name: input-data
    hostPath:
      path: /data/input
      type: Directory
  
  - name: cache
    persistentVolumeClaim:
      claimName: agent-cache
  
  - name: secrets
    secret:
      secretName: agent-secrets
      defaultMode: 0400

volumeMounts:
  - name: workspace
    mountPath: /workspace
  
  - name: input-data
    mountPath: /workspace/input
    readOnly: true
  
  - name: cache
    mountPath: /workspace/cache
  
  - name: secrets
    mountPath: /secrets
    readOnly: true
```

## GitHub Actions Integration

### Sandbox as GitHub Actions Service

```yaml
jobs:
  agent-task:
    runs-on: ubuntu-latest
    
    services:
      sandbox:
        image: ghcr.io/github/gh-aw-sandbox:latest
        env:
          MCP_GATEWAY_URL: http://mcp-gateway:8000
          MCP_GATEWAY_API_KEY: ${{ secrets.MCP_KEY }}
        options: >-
          --cpus 2
          --memory 4g
          --network agent-network
    
    steps:
      - name: Execute Agent
        run: |
          docker exec ${{ job.services.sandbox.id }} \
            agent-cli execute --task "Monitor EU Parliament"
```

### Sandbox with Docker Compose

```yaml
# docker-compose.yml
services:
  sandbox:
    image: ghcr.io/github/gh-aw-sandbox:latest
    environment:
      - MCP_GATEWAY_URL=http://mcp-gateway:8000
      - MCP_GATEWAY_API_KEY=${MCP_KEY}
      - GITHUB_PERSONAL_ACCESS_TOKEN=${GITHUB_TOKEN}
    volumes:
      - ./workspace:/workspace:rw
      - ./input:/workspace/input:ro
    networks:
      - agent-network
    depends_on:
      - mcp-gateway
      - firewall
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

## Monitoring and Debugging

### Resource Monitoring

```bash
# Monitor resource usage
docker stats sandbox-container

# Get detailed metrics
curl http://sandbox:9090/metrics | jq '{
  cpu: .cpu_percent,
  memory: .memory_used_mb,
  disk: .disk_used_gb
}'

# Check process list
docker exec sandbox ps aux

# View network connections
docker exec sandbox netstat -tuln
```

### Debug Access

```bash
# Access sandbox shell
docker exec -it sandbox /bin/bash

# View agent logs
docker exec sandbox cat /workspace/logs/agent.log

# Check environment
docker exec sandbox env | grep MCP

# Test MCP connectivity
docker exec sandbox curl http://mcp-gateway:8000/health
```

### Log Collection

```bash
# Stream logs
docker logs -f sandbox-container

# Export logs
docker logs sandbox-container > sandbox.log

# Get structured logs
docker exec sandbox cat /var/log/agent.jsonl | jq '.'
```

## Security Best Practices

### 1. Principle of Least Privilege
- Minimal capabilities
- Non-root user (UID 1000)
- Read-only root filesystem
- Drop all Linux capabilities

### 2. Network Isolation
- No direct internet access
- All external requests via MCP gateway + firewall
- Private bridge network
- No host network mode

### 3. Resource Limits
- Always set CPU/memory limits
- Enforce disk quotas
- Limit process count
- Timeout long-running tasks

### 4. Secret Management
- Never hardcode secrets
- Use secret management (GitHub Secrets, Vault)
- Environment variable injection only
- Audit secret access

### 5. Filesystem Security
- Read-only base filesystem
- Separate workspace directory
- No access to host filesystem
- Clean up after execution

## Troubleshooting

### Common Issues

**Issue: Sandbox fails to start**
```bash
# Check resource availability
docker system df

# Verify image exists
docker images | grep gh-aw-sandbox

# Check logs
docker logs sandbox-container

# Test with minimal config
docker run --rm -it ghcr.io/github/gh-aw-sandbox:latest /bin/bash
```

**Issue: Can't reach MCP gateway**
```bash
# Check network
docker network inspect agent-network

# Test connectivity
docker exec sandbox curl http://mcp-gateway:8000/health

# Verify DNS
docker exec sandbox nslookup mcp-gateway
```

**Issue: Out of resources**
```bash
# Check limits
docker inspect sandbox-container | jq '.[0].HostConfig.Memory'

# Monitor usage
docker stats sandbox-container

# Increase limits in config
resources:
  limits:
    cpu: "4"
    memory: "8Gi"
```

**Issue: Permission denied**
```bash
# Check user
docker exec sandbox id

# Verify file permissions
docker exec sandbox ls -la /workspace

# Fix ownership
docker exec sandbox chown -R 1000:1000 /workspace
```

## European Parliament Integration Example

```yaml
europeanParliament:
  sandbox:
    image: ghcr.io/github/gh-aw-sandbox:latest
    
    environment:
      MCP_GATEWAY_URL: "http://mcp-gateway:8000"
      MCP_GATEWAY_API_KEY: "${MCP_KEY}"
      EP_API_KEY: "${EP_KEY}"
      AGENT_TASK: "monitor-parliament"
    
    volumes:
      - ./articles:/workspace/output:rw
      - ./cache:/workspace/cache:rw
    
    mcp:
      servers:
        - european-parliament
        - github
        - filesystem
    
    workflow:
      - fetch: plenary_sessions
      - analyze: documents
      - generate: articles
      - publish: to_github
```

## Resources

- **Sandbox Documentation**: See gh-aw repository
- **MCP Integration**: See mcp-gateway-configuration.md
- **Security**: See gh-aw-firewall.md and mcp-gateway-security.md
- **Monitoring**: See gh-aw-architecture.md
