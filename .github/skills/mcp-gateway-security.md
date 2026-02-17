---
name: mcp-gateway-security
description: MCP Gateway security patterns with MCP spec 7.1 authentication, secrets management, container isolation, and session security
tools: []
---

# MCP Gateway Security Skill

## Skill: MCP Gateway Security & Authentication

**Repository**: https://github.com/github/gh-aw-mcpg

### Core Security Competencies

1. **MCP Specification 7.1 Authentication**
   - Plain API key format (NOT Bearer scheme)
   - Authorization header structure
   - Session ID extraction from auth header

2. **Container Isolation**
   - Docker-based backend execution
   - No direct command execution support
   - Resource isolation and limits

3. **Secrets Management**
   - Environment variable passthrough
   - No hardcoded credentials
   - Variable expansion with validation

4. **Session Security**
   - Session-based connection pooling
   - Session-specific payload storage
   - Isolated backend processes per session

### Authentication Implementation

#### MCP Spec 7.1 Compliance

**Header Format**:
```
Authorization: <api-key>
```

**NOT** Bearer scheme:
```
Authorization: Bearer <api-key>  ❌ WRONG
```

**Configuration**:
```bash
# Set via environment variable
export MCP_GATEWAY_API_KEY="your-secret-api-key"

# Or in JSON config
{
  "gateway": {
    "apiKey": "your-secret-api-key"
  }
}
```

**Behavior**:
- When `apiKey` configured: all endpoints except `/health` require authentication
- When NOT configured: authentication disabled (development only)

#### Example Authenticated Request

```bash
curl -X POST http://localhost:8000/mcp/github \
  -H "Authorization: my-secret-api-key-123" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

#### Example Authentication Failure

**Request**:
```bash
curl -X POST http://localhost:8000/mcp/github \
  -H "Authorization: wrong-key" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

**Response**:
```
HTTP 401 Unauthorized
{"error": "authentication failed: invalid API key"}
```

**Log Entry**:
```
[2026-01-08T23:00:03Z] [ERROR] [auth] Authentication failed: invalid API key, remote=127.0.0.1:54322, path=/mcp/github
```

### Container Security

#### Docker-in-Docker Pattern

**Architecture**:
```
Host Machine
└── Gateway Container
    ├── MCP Gateway Process
    └── Docker Socket Mount
        └── Backend MCP Containers (siblings on host)
```

**Required Mount**:
```bash
docker run -v /var/run/docker.sock:/var/run/docker.sock ...
```

**Why This is Secure**:
- Gateway doesn't execute arbitrary commands
- All backend servers run in isolated Docker containers
- Standard Docker security features apply
- Resource limits can be enforced per container

#### Backend Isolation

**Each backend MCP server runs in its own container**:
```bash
# Gateway spawns backend containers like this:
docker run --rm -i ghcr.io/github/github-mcp-server:latest
docker run --rm -i ghcr.io/example/slack-mcp-server:latest
```

**Security Benefits**:
- Filesystem isolation
- Network isolation (unless explicitly configured)
- Resource limits (CPU, memory)
- No direct host access

#### Resource Limits

Apply Docker resource limits to backend containers:

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "container": "ghcr.io/github/github-mcp-server:latest",
      "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": ""}
    }
  }
}
```

**Note**: Resource limits are applied via Docker's `docker run` command. Configure via Docker daemon settings or custom entrypoints.

### Secrets Management

#### Environment Variable Passthrough

**Best Practice**: Pass secrets from host environment, never hardcode

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "container": "ghcr.io/github/github-mcp-server:latest",
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "",
        "OTHER_SECRET": ""
      }
    }
  }
}
```

**Runtime**:
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_secret123"
export OTHER_SECRET="secret-value"

docker run -i \
  -e GITHUB_PERSONAL_ACCESS_TOKEN \
  -e OTHER_SECRET \
  -e MCP_GATEWAY_API_KEY="gateway-key" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 8000:8000 \
  ghcr.io/github/gh-aw-mcpg:latest < config.json
```

#### Variable Expansion with Validation

**Pattern**:
```json
{
  "env": {
    "CONFIG_PATH": "${SECRET_DIR}/config.json",
    "DATA_DIR": "${WORKSPACE}/data"
  }
}
```

**Security Feature**: Fails immediately if variable undefined
```
Error: environment variable 'SECRET_DIR' is not defined
```

**Why This is Secure**:
- Prevents misconfiguration
- Catches missing secrets early
- No silent failures with undefined variables

#### Secrets in GitHub Actions

**Best Practice**:
```yaml
- name: Start MCP Gateway
  env:
    GITHUB_PERSONAL_ACCESS_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    MCP_GATEWAY_API_KEY: ${{ secrets.MCP_API_KEY }}
  run: |
    cat > config.json <<EOF
    {
      "mcpServers": {
        "github": {
          "type": "stdio",
          "container": "ghcr.io/github/github-mcp-server:latest",
          "env": {
            "GITHUB_PERSONAL_ACCESS_TOKEN": ""
          }
        }
      }
    }
    EOF
    
    docker run -i \
      -e GITHUB_PERSONAL_ACCESS_TOKEN \
      -e MCP_GATEWAY_API_KEY \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -p 8000:8000 \
      ghcr.io/github/gh-aw-mcpg:latest < config.json
```

**What NOT to do**:
```yaml
# ❌ WRONG: Hardcoding secrets in config
run: |
  cat > config.json <<EOF
  {
    "mcpServers": {
      "github": {
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "${{ secrets.GITHUB_TOKEN }}"
        }
      }
    }
  }
  EOF
```

### Session Security

#### Session ID Extraction

**How It Works**:
1. Gateway extracts session ID from Authorization header value
2. Uses session ID for connection pooling
3. Maintains separate backend connections per session
4. Cleans up on session end

**Example**:
```
Authorization: session-abc123-key456
```
Session ID: `session-abc123-key456`

#### Session-Specific Payload Storage

**Directory Structure**:
```
/tmp/jq-payloads/
├── session-abc123/
│   ├── query-001/
│   │   └── payload.json
│   └── query-002/
│       └── payload.json
└── session-xyz789/
    └── query-001/
        └── payload.json
```

**Security Benefit**: Sessions cannot access each other's payloads

**Mounting for Agents**:
```yaml
volumes:
  - /tmp/jq-payloads/${SESSION_ID}:/app/payloads:ro
```

**Why This is Secure**:
- Each session only sees its own payloads
- Read-only mount prevents modification
- Automatic cleanup on session end

#### Backend Process Isolation

**Per-Session Backend Connections**:
```
Session abc123:
  ├── github backend (Docker container 1)
  ├── slack backend (Docker container 2)
  └── filesystem backend (Docker container 3)

Session xyz789:
  ├── github backend (Docker container 4)
  ├── slack backend (Docker container 5)
  └── filesystem backend (Docker container 6)
```

**Security Benefits**:
- No shared state between sessions
- Isolated backend processes
- Independent authentication per session

### Security Best Practices

#### 1. API Key Management

✅ **DO**:
- Use strong, randomly generated API keys
- Rotate keys regularly
- Store in secure secret management system
- Use different keys for development and production
- Monitor authentication failures in logs

❌ **DON'T**:
- Hardcode API keys in configuration files
- Commit API keys to version control
- Reuse keys across environments
- Share keys between services
- Use weak or predictable keys

#### 2. Secret Storage

✅ **DO**:
- Use environment variable passthrough (`""`)
- Use GitHub Secrets for CI/CD
- Use HashiCorp Vault or similar for production
- Validate all secrets are provided before starting
- Use variable expansion with validation

❌ **DON'T**:
- Put secrets directly in JSON/TOML configs
- Log secret values
- Store secrets in plain text files
- Skip validation (let undefined variables pass)

#### 3. Container Security

✅ **DO**:
- Use official MCP server container images
- Pin container versions (not `latest` in production)
- Apply resource limits via Docker
- Use readonly mounts when possible
- Monitor container resource usage

❌ **DON'T**:
- Use unverified container images
- Run containers with privileged mode
- Give unnecessary host access
- Skip container security scanning

#### 4. Network Security

✅ **DO**:
- Use HTTPS in production (reverse proxy)
- Implement rate limiting
- Use firewall rules
- Monitor for suspicious traffic patterns
- Log all authentication attempts

❌ **DON'T**:
- Expose gateway directly to internet without proxy
- Skip TLS/SSL encryption
- Ignore authentication failures
- Allow unlimited request rates

#### 5. Monitoring & Auditing

✅ **DO**:
- Monitor authentication logs:
  ```bash
  grep -i "auth" /tmp/gh-aw/mcp-logs/mcp-gateway.log
  ```
- Track failed authentication attempts
- Monitor per-server logs for anomalies
- Set up alerts for authentication failures
- Review RPC message logs periodically

❌ **DON'T**:
- Ignore authentication failure logs
- Skip regular security audits
- Allow unlimited failed authentication attempts
- Forget to rotate credentials

### Security Validation Checklist

Before deploying to production:

- [ ] API key authentication enabled (`MCP_GATEWAY_API_KEY` set)
- [ ] Strong API key generated (minimum 32 characters, random)
- [ ] No secrets hardcoded in configuration files
- [ ] All secrets passed via environment variables
- [ ] Variable expansion validated (no undefined variables)
- [ ] Container images pinned to specific versions (not `latest`)
- [ ] Docker socket properly mounted (`/var/run/docker.sock`)
- [ ] Payload directory has appropriate permissions
- [ ] Log directory has appropriate permissions
- [ ] Health check endpoint tested
- [ ] Authentication tested with valid and invalid keys
- [ ] Per-session isolation verified
- [ ] Resource limits configured (if needed)
- [ ] Monitoring and alerting configured
- [ ] Security audit logs reviewed

### Common Security Mistakes

#### Mistake 1: Bearer Token Format

❌ **WRONG**:
```bash
curl -H "Authorization: Bearer my-api-key" ...
```

✅ **CORRECT**:
```bash
curl -H "Authorization: my-api-key" ...
```

#### Mistake 2: Hardcoded Secrets

❌ **WRONG**:
```json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_hardcoded_secret"
      }
    }
  }
}
```

✅ **CORRECT**:
```json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": ""
      }
    }
  }
}
```

#### Mistake 3: Exposing Without Authentication

❌ **WRONG**:
```bash
# No API key set, anyone can access
docker run -p 8000:8000 ghcr.io/github/gh-aw-mcpg:latest < config.json
```

✅ **CORRECT**:
```bash
# API key required for access
docker run \
  -e MCP_GATEWAY_API_KEY="strong-random-key-123" \
  -p 8000:8000 \
  ghcr.io/github/gh-aw-mcpg:latest < config.json
```

### Security Monitoring

#### Authentication Failure Detection

```bash
# Monitor authentication failures
tail -f /tmp/gh-aw/mcp-logs/mcp-gateway.log | grep -i "auth.*failed"

# Count failed auth attempts
grep -c "Authentication failed" /tmp/gh-aw/mcp-logs/mcp-gateway.log
```

#### Automated Security Checks

```bash
#!/bin/bash
# security-check.sh

# Check API key is set
if [ -z "$MCP_GATEWAY_API_KEY" ]; then
  echo "ERROR: MCP_GATEWAY_API_KEY not set"
  exit 1
fi

# Verify API key strength (minimum 32 characters)
if [ ${#MCP_GATEWAY_API_KEY} -lt 32 ]; then
  echo "WARNING: API key is weak (< 32 characters)"
fi

# Check for hardcoded secrets in config
if grep -r "ghp_\|sk-\|secret" config.json 2>/dev/null; then
  echo "ERROR: Potential hardcoded secrets found in config"
  exit 1
fi

# Verify Docker socket permissions
if [ ! -w /var/run/docker.sock ]; then
  echo "ERROR: Cannot write to Docker socket"
  exit 1
fi

echo "Security checks passed"
```

### Resources

- **MCP Specification**: https://github.com/modelcontextprotocol (Section 7.1 Authentication)
- **Docker Security**: https://docs.docker.com/engine/security/
- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **HashiCorp Vault**: https://www.vaultproject.io/
