---
name: mcp-gateway-configuration
description: MCP Gateway configuration mastery with TOML/JSON formats, server setup, environment variables, and validation rules
tools: []
---

# MCP Gateway Configuration Skill

## Skill: MCP Gateway Configuration Mastery

**Repository**: https://github.com/github/gh-aw-mcpg

### Core Competencies

1. **Configuration Format Expertise**
   - TOML file-based configuration with `command` and `args`
   - JSON stdin dynamic configuration with `container` field
   - Understanding when to use each format

2. **Server Configuration**
   - Stdio transport via Docker containers
   - HTTP transport for remote servers
   - Environment variable passthrough and expansion `${VAR_NAME}`
   - Custom entrypoints and entrypoint arguments
   - Volume mounts with ro/rw modes

3. **Gateway Settings**
   - Port, API key, domain configuration
   - Startup and tool timeouts
   - Payload directory and size threshold
   - Routed vs unified mode selection

4. **Validation Understanding**
   - Required fields: `container` for stdio, `url` for http
   - Variable expansion validation (fails if undefined)
   - Type normalization (local → stdio)
   - Mount format validation (source:dest:mode)

### Configuration Patterns

#### Basic TOML Configuration
```toml
[gateway]
port = 3000
api_key = "your-api-key"

[servers.github]
command = "docker"
args = ["run", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "-i", "ghcr.io/github/github-mcp-server:latest"]
```

#### Advanced JSON Configuration
```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "container": "ghcr.io/github/github-mcp-server:latest",
      "entrypoint": "/custom/entrypoint.sh",
      "entrypointArgs": ["--verbose"],
      "mounts": [
        "/host/config:/app/config:ro",
        "/host/data:/app/data:rw"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "",
        "CONFIG_PATH": "${MY_HOME}/config"
      }
    }
  },
  "gateway": {
    "port": 8080,
    "apiKey": "your-api-key",
    "domain": "localhost",
    "startupTimeout": 30,
    "toolTimeout": 60,
    "payloadDir": "/tmp/jq-payloads"
  }
}
```

#### HTTP Server Configuration
```json
{
  "mcpServers": {
    "remote-service": {
      "type": "http",
      "url": "https://mcp-server.example.com:8080"
    }
  }
}
```

### Environment Variable Patterns

#### Passthrough Pattern
```json
{
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": ""
  }
}
```
*Empty string passes through from host environment*

#### Expansion Pattern
```json
{
  "env": {
    "CONFIG_PATH": "${HOME}/.config/mcp",
    "DATA_DIR": "${MCP_DATA_ROOT}/storage"
  }
}
```
*Fails immediately if variable undefined*

### Validation Checklist

When configuring MCP Gateway:
- [ ] Choose appropriate format (TOML vs JSON stdin)
- [ ] Specify required fields (`container` for stdio, `url` for http)
- [ ] Set environment variables (passthrough with `""` or expansion with `${VAR}`)
- [ ] Configure mounts if needed (format: `source:dest:mode`)
- [ ] Set appropriate timeouts for backend startup and tool execution
- [ ] Configure payload directory for large response handling
- [ ] Choose routing mode (routed for multiple servers, unified for single server)
- [ ] Set API key for authentication in production
- [ ] Validate configuration before deployment (gateway provides detailed errors)

### Common Mistakes to Avoid

❌ **Using `command` field in JSON stdin format**
```json
{
  "mcpServers": {
    "github": {
      "command": "docker",  // NOT SUPPORTED in JSON
      "args": ["run", ...]
    }
  }
}
```
✅ **Use `container` instead**
```json
{
  "mcpServers": {
    "github": {
      "container": "ghcr.io/github/github-mcp-server:latest"
    }
  }
}
```

❌ **Bearer token format for authentication**
```
Authorization: Bearer my-api-key
```
✅ **Plain API key per MCP spec 7.1**
```
Authorization: my-api-key
```

❌ **Hardcoding secrets in configuration**
```json
{
  "env": {
    "API_KEY": "hardcoded-secret-key"
  }
}
```
✅ **Use passthrough or expansion**
```json
{
  "env": {
    "API_KEY": "",  // Passthrough
    "CONFIG": "${SECRET_PATH}/config"  // Expansion
  }
}
```

### Configuration Scenarios

#### Scenario 1: GitHub Actions Workflow
Use JSON stdin for dynamic configuration:
```yaml
- name: Generate MCP Config
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

- name: Start Gateway
  run: |
    docker run -i \
      -e MCP_GATEWAY_PORT=8000 \
      -e MCP_GATEWAY_API_KEY=${{ secrets.MCP_API_KEY }} \
      -e GITHUB_PERSONAL_ACCESS_TOKEN=${{ secrets.GITHUB_TOKEN }} \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -p 8000:8000 \
      ghcr.io/github/gh-aw-mcpg:latest < config.json
```

#### Scenario 2: Local Development
Use TOML file for static configuration:
```toml
[gateway]
port = 3000

[servers.github]
command = "docker"
args = ["run", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "-i", "ghcr.io/github/github-mcp-server:latest"]

[servers.filesystem]
command = "node"
args = ["/path/to/filesystem-server.js"]
```

Run with:
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="your-token"
./awmg --config config.toml
```

#### Scenario 3: Multi-Server Production
```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "container": "ghcr.io/github/github-mcp-server:latest",
      "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": ""}
    },
    "slack": {
      "type": "stdio",
      "container": "ghcr.io/example/slack-mcp-server:latest",
      "env": {"SLACK_TOKEN": "${SLACK_BOT_TOKEN}"}
    },
    "remote-api": {
      "type": "http",
      "url": "https://mcp.example.com:8080"
    }
  },
  "gateway": {
    "port": 8000,
    "apiKey": "production-api-key",
    "startupTimeout": 45,
    "toolTimeout": 90,
    "payloadDir": "/var/lib/mcp-payloads"
  }
}
```

### Testing Configuration

**Test TOML Config**:
```bash
./awmg --config config.toml --validate-env
```

**Test JSON Stdin Config**:
```bash
cat config.json | ./awmg --config-stdin --validate-env
```

**Verify Gateway Health**:
```bash
curl http://localhost:8000/health
```

**Test Backend Connection**:
```bash
curl -X POST http://localhost:8000/mcp/github \
  -H "Authorization: api-key" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

### Resources

- **Configuration Specification**: [MCP Gateway Reference](https://github.com/github/gh-aw/blob/main/docs/src/content/docs/reference/mcp-gateway.md)
- **Example Configurations**: See `examples/` directory
- **Validation Documentation**: README.md - Configuration Validation section
