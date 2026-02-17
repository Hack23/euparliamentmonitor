---
name: mcp-gateway-troubleshooting
description: MCP Gateway troubleshooting and debugging with log analysis, debug mode, issue resolution, and performance diagnostics
tools: []
---

# MCP Gateway Troubleshooting Skill

## Skill: MCP Gateway Troubleshooting & Debugging

**Repository**: https://github.com/github/gh-aw-mcpg

### Core Troubleshooting Competencies

1. **Log Analysis**
   - Reading unified and per-server logs
   - Understanding log categories and levels
   - Tracing requests across log files

2. **Debug Logging**
   - Using DEBUG environment variable
   - Pattern matching for specific components
   - Analyzing time diffs and performance

3. **Common Issues Resolution**
   - Docker connectivity problems
   - Backend startup timeouts
   - Authentication failures
   - Configuration validation errors

4. **Performance Diagnostics**
   - Identifying bottlenecks
   - Monitoring resource usage
   - Optimizing configuration

### Log File Analysis

#### Understanding Log Structure

**Unified Log** (`mcp-gateway.log`):
```
[2026-01-08T23:00:00Z] [INFO] [startup] Starting MCPG with config: config.toml, listen: 127.0.0.1:3000
[2026-01-08T23:00:01Z] [INFO] [backend] Launching MCP backend server: github, command=docker
[2026-01-08T23:00:02Z] [INFO] [client] New MCP client connection, remote=127.0.0.1:54321, session=abc123
[2026-01-08T23:00:03Z] [ERROR] [auth] Authentication failed: invalid API key, remote=127.0.0.1:54322
```

**Per-Server Log** (`github.log`):
```
[2026-01-08T23:00:01Z] [INFO] [backend] Launching server 'github'
[2026-01-08T23:00:01Z] [DEBUG] [backend] Command: docker run --rm -i ghcr.io/github/github-mcp-server:latest
[2026-01-08T23:00:02Z] [INFO] [backend] Server 'github' started successfully
[2026-01-08T23:00:10Z] [INFO] [backend] Tool call: search_code, session=abc123
```

#### Log Categories

| Category | Purpose | Example Events |
|----------|---------|----------------|
| `startup` | Gateway initialization | Config loading, port binding, server readiness |
| `shutdown` | Graceful termination | Cleanup, connection closing, exit status |
| `client` | Client interactions | New connections, requests, responses |
| `backend` | Backend operations | Server launches, tool calls, errors |
| `auth` | Authentication | Success/failure, invalid keys, session IDs |

#### Analyzing Request Flow

**Tracing a Single Request**:
```bash
# Get session ID from request
SESSION_ID="abc123"

# Find all log entries for this session
grep "session=$SESSION_ID" /tmp/gh-aw/mcp-logs/*.log

# Or use per-server logs
grep "$SESSION_ID" /tmp/gh-aw/mcp-logs/github.log
```

**Example Output**:
```
mcp-gateway.log:[INFO] [client] New connection, session=abc123
github.log:[INFO] [backend] Initialize request, session=abc123
github.log:[DEBUG] [backend] Tools list request, session=abc123
github.log:[INFO] [backend] Returned 15 tools, session=abc123
mcp-gateway.log:[INFO] [client] Request completed, session=abc123, duration=250ms
```

### Debug Logging

#### Enabling Debug Mode

**All Debug Output**:
```bash
DEBUG=* ./awmg --config config.toml
```

**Specific Components**:
```bash
# Server and launcher only
DEBUG=server:*,launcher:* ./awmg --config config.toml

# Exclude specific loggers
DEBUG=*,-launcher:test ./awmg --config config.toml
```

**With Color Control**:
```bash
# Force colors on
DEBUG_COLORS=1 DEBUG=* ./awmg --config config.toml

# Force colors off (useful for piping)
DEBUG_COLORS=0 DEBUG=* ./awmg --config config.toml > debug.log 2>&1
```

#### Understanding Debug Output

**Format**:
```
server:routed +0ms Starting routed server on 127.0.0.1:3000
launcher:docker +50ms Launching container ghcr.io/github/github-mcp-server:latest
launcher:docker +2.5s Container started successfully
server:routed +2.6s Backend 'github' ready
```

**Key Elements**:
- **Namespace**: Component identifier (e.g., `server:routed`, `launcher:docker`)
- **Time Diff**: Elapsed time since last log (`+50ms`, `+2.5s`)
- **Message**: Debug information

#### Common Debug Patterns

**Backend Launch Issues**:
```bash
DEBUG=launcher:* ./awmg --config config.toml
```

**Request Routing Problems**:
```bash
DEBUG=server:* ./awmg --config config.toml
```

**Configuration Loading**:
```bash
DEBUG=config:* ./awmg --config config.toml
```

**Session Management**:
```bash
DEBUG=launcher:pool ./awmg --config config.toml
```

### Common Issues & Solutions

#### Issue 1: Docker Daemon Connection Failed

**Symptoms**:
```
[ERROR] [launcher] Failed to start backend server 'github'
Error: Cannot connect to Docker daemon at unix:///var/run/docker.sock
```

**Diagnostics**:
```bash
# Check Docker daemon status
docker info

# Verify Docker socket exists and is accessible
ls -la /var/run/docker.sock

# Check permissions
stat /var/run/docker.sock

# Test Docker connectivity
docker ps
```

**Solutions**:

1. **Start Docker daemon** (if not running):
   ```bash
   # Linux/systemd
   sudo systemctl start docker
   
   # macOS
   open -a Docker
   ```

2. **Fix socket permissions**:
   ```bash
   sudo chmod 666 /var/run/docker.sock
   ```

3. **Add user to docker group** (Linux):
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker  # Or logout/login
   ```

4. **In containers, mount socket**:
   ```bash
   docker run -v /var/run/docker.sock:/var/run/docker.sock ...
   ```

#### Issue 2: Backend Startup Timeout

**Symptoms**:
```
[ERROR] [backend] Server 'github' failed to start within timeout (60s)
```

**Diagnostics**:
```bash
# Check if container image exists locally
docker images | grep github-mcp-server

# Try pulling image manually
docker pull ghcr.io/github/github-mcp-server:latest

# Test container startup directly
time docker run --rm -i ghcr.io/github/github-mcp-server:latest <<EOF
{"jsonrpc": "2.0", "method": "initialize", "params": {}, "id": 1}
EOF
```

**Solutions**:

1. **Increase startup timeout**:
   ```bash
   export MCP_GATEWAY_STARTUP_TIMEOUT=90
   ```
   
   Or in config:
   ```json
   {"gateway": {"startupTimeout": 90}}
   ```

2. **Pull image before starting gateway**:
   ```bash
   docker pull ghcr.io/github/github-mcp-server:latest
   ./awmg --config config.toml
   ```

3. **Check network connectivity**:
   ```bash
   # Test GitHub Container Registry access
   curl -I https://ghcr.io
   ```

4. **Review container logs**:
   ```bash
   # Find container ID
   docker ps -a | grep github-mcp-server
   
   # View logs
   docker logs <container-id>
   ```

#### Issue 3: Authentication Failed

**Symptoms**:
```
HTTP 401 Unauthorized
[ERROR] [auth] Authentication failed: invalid API key
```

**Diagnostics**:
```bash
# Check API key is set
echo $MCP_GATEWAY_API_KEY

# Test with correct key
curl -X POST http://localhost:8000/mcp/github \
  -H "Authorization: $MCP_GATEWAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'

# Check authentication logs
grep -i "auth" /tmp/gh-aw/mcp-logs/mcp-gateway.log | tail -n 20
```

**Solutions**:

1. **Verify header format** (plain API key, not Bearer):
   ```bash
   # ✅ Correct
   curl -H "Authorization: my-api-key" ...
   
   # ❌ Wrong
   curl -H "Authorization: Bearer my-api-key" ...
   ```

2. **Check API key matches config**:
   ```bash
   # Compare
   echo "Configured: $MCP_GATEWAY_API_KEY"
   echo "Sent in request: <check request header>"
   ```

3. **Verify authentication is enabled**:
   ```bash
   # If MCP_GATEWAY_API_KEY not set, authentication is disabled
   if [ -z "$MCP_GATEWAY_API_KEY" ]; then
     echo "Authentication is DISABLED"
   else
     echo "Authentication is ENABLED"
   fi
   ```

#### Issue 4: Environment Variable Not Expanded

**Symptoms**:
```
Error: environment variable 'GITHUB_CONFIG_DIR' is not defined
```

**Diagnostics**:
```bash
# Check if variable is set
env | grep GITHUB_CONFIG_DIR

# Check if it's exported
export -p | grep GITHUB_CONFIG_DIR

# Test in shell
echo $GITHUB_CONFIG_DIR
```

**Solutions**:

1. **Export the variable**:
   ```bash
   export GITHUB_CONFIG_DIR="/path/to/config"
   ```

2. **Use passthrough if optional**:
   ```json
   {
     "env": {
       "GITHUB_CONFIG_DIR": ""
     }
   }
   ```

3. **Provide default value**:
   ```bash
   export GITHUB_CONFIG_DIR="${GITHUB_CONFIG_DIR:-/default/path}"
   ```

4. **Remove expansion if not needed**:
   ```json
   {
     "env": {
       "CONFIG_PATH": "/fixed/path/config"
     }
   }
   ```

#### Issue 5: Configuration Parse Error

**Symptoms**:
```
Error: failed to parse TOML at line 5, column 12: expected '=' but got ':'
```

**Diagnostics**:
```bash
# Validate TOML syntax
cat config.toml | toml-validate  # If available

# Check line and column mentioned in error
sed -n '5p' config.toml

# Look for common mistakes
grep -n ":" config.toml  # TOML uses = not :
```

**Solutions**:

1. **Fix TOML syntax** (use `=` not `:`):
   ```toml
   # ❌ Wrong
   port: 3000
   
   # ✅ Correct
   port = 3000
   ```

2. **Check array syntax**:
   ```toml
   # ✅ Correct
   args = ["run", "--rm", "-i", "image:latest"]
   ```

3. **Quote strings with spaces**:
   ```toml
   # ✅ Correct
   command = "docker"
   description = "A description with spaces"
   ```

#### Issue 6: Unknown Configuration Key Warning

**Symptoms**:
```
[WARN] [config] Unknown configuration key 'gateway.prot' - check for typos
```

**Diagnostics**:
```bash
# Review configuration for typos
cat config.toml | grep -i "prot"

# Check against documentation
# port vs prot
# startup_timeout vs startup_timout
```

**Solutions**:

1. **Fix typo**:
   ```toml
   # ❌ Wrong
   prot = 3000
   startup_timout = 60
   
   # ✅ Correct
   port = 3000
   startup_timeout = 60
   ```

2. **Remove deprecated keys**:
   ```bash
   # Check documentation for current key names
   ./awmg --help
   ```

### Performance Diagnostics

#### Identifying Slow Requests

**Enable debug with timing**:
```bash
DEBUG=* ./awmg --config config.toml
```

**Look for large time diffs**:
```
server:routed +0ms Request received
launcher:pool +5ms Getting connection
launcher:pool +2.5s Connection established  # ⚠️ Slow!
server:routed +2.6s Request completed
```

**Check per-server logs**:
```bash
# Look for slow tool calls
grep -i "duration" /tmp/gh-aw/mcp-logs/github.log
```

#### Monitoring Resource Usage

**Docker stats**:
```bash
# Watch resource usage of backend containers
docker stats

# Filter to MCP servers only
docker stats $(docker ps --filter "name=mcp" --format "{{.Names}}")
```

**Gateway process**:
```bash
# Monitor gateway process
top -p $(pgrep awmg)

# Or with htop
htop -p $(pgrep awmg)
```

#### Optimizing Configuration

**Timeout Tuning**:
```json
{
  "gateway": {
    "startupTimeout": 45,    // Reduce if servers start quickly
    "toolTimeout": 120       // Increase for slow tools
  }
}
```

**Payload Threshold**:
```bash
# Increase for less disk I/O, decrease for less memory usage
export MCP_GATEWAY_PAYLOAD_SIZE_THRESHOLD=20480  # 20KB
```

**Connection Pooling**:
- Gateway automatically reuses connections per session
- Ensure sessions are properly maintained
- Monitor pool with: `DEBUG=launcher:pool ./awmg ...`

### Health Check Monitoring

#### Basic Health Check Script

```bash
#!/bin/bash
# health-check.sh

GATEWAY_URL="http://localhost:8000"
API_KEY="your-api-key"

# Check health endpoint
if ! curl -f "$GATEWAY_URL/health" > /dev/null 2>&1; then
  echo "ERROR: Health endpoint failed"
  exit 1
fi

# Test tools/list for each backend
for server in github slack filesystem; do
  response=$(curl -s -X POST "$GATEWAY_URL/mcp/$server" \
    -H "Authorization: $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}')
  
  if ! echo "$response" | jq -e '.result.tools | length > 0' > /dev/null 2>&1; then
    echo "ERROR: Server '$server' has no tools or failed"
    exit 1
  fi
done

echo "All health checks passed"
exit 0
```

#### Continuous Monitoring

```bash
# Run health checks every 30 seconds
watch -n 30 ./health-check.sh

# Or with logging
while true; do
  if ./health-check.sh >> health-check.log 2>&1; then
    echo "$(date): OK" >> health-check.log
  else
    echo "$(date): FAILED" >> health-check.log
    # Send alert here
  fi
  sleep 30
done
```

### Troubleshooting Workflow

When encountering an issue, follow this workflow:

1. **Identify the Issue**
   - [ ] Check error message in terminal
   - [ ] Review unified log: `tail -f /tmp/gh-aw/mcp-logs/mcp-gateway.log`
   - [ ] Check per-server logs if backend-specific

2. **Gather Diagnostics**
   - [ ] Enable debug logging: `DEBUG=* ./awmg ...`
   - [ ] Check Docker status: `docker info && docker ps`
   - [ ] Verify environment variables: `env | grep MCP_GATEWAY`
   - [ ] Test configuration: `./awmg --config config.toml --validate-env`

3. **Isolate the Problem**
   - [ ] Test health endpoint: `curl http://localhost:8000/health`
   - [ ] Test backend directly: `docker run -i <container> ...`
   - [ ] Check authentication: Verify API key format
   - [ ] Review configuration: Look for typos and validation errors

4. **Apply Solution**
   - [ ] Fix identified issue
   - [ ] Restart gateway
   - [ ] Verify fix: Run health checks and test requests
   - [ ] Monitor logs for recurring issues

5. **Document & Prevent**
   - [ ] Document the issue and solution
   - [ ] Update configuration or deployment scripts
   - [ ] Add monitoring for similar issues
   - [ ] Share knowledge with team

### Advanced Debugging

#### RPC Message Analysis

**Review RPC messages**:
```bash
# View RPC message log
cat /tmp/gh-aw/mcp-logs/rpc-messages.jsonl | jq .

# Filter by method
cat /tmp/gh-aw/mcp-logs/rpc-messages.jsonl | \
  jq 'select(.method == "tools/call")'

# Filter by session
cat /tmp/gh-aw/mcp-logs/rpc-messages.jsonl | \
  jq 'select(.session == "abc123")'
```

#### Tools Catalog Review

**Check available tools**:
```bash
# View all tools
cat /tmp/gh-aw/mcp-logs/tools.json | jq .

# Check specific server
cat /tmp/gh-aw/mcp-logs/tools.json | jq '.servers.github'

# Count tools per server
cat /tmp/gh-aw/mcp-logs/tools.json | \
  jq '.servers | to_entries | map({server: .key, count: (.value | length)})'
```

#### Payload Analysis

**Inspect large payloads**:
```bash
# List all payload files
find /tmp/jq-payloads -name "payload.json"

# View payload structure
cat /tmp/jq-payloads/session-abc123/query-001/payload.json | jq 'keys'

# Check payload sizes
du -sh /tmp/jq-payloads/*/
```

### Quick Reference Commands

```bash
# View logs
tail -f /tmp/gh-aw/mcp-logs/mcp-gateway.log
tail -f /tmp/gh-aw/mcp-logs/github.log

# Enable debug
DEBUG=* ./awmg --config config.toml

# Check health
curl http://localhost:8000/health

# Test backend
curl -X POST http://localhost:8000/mcp/github \
  -H "Authorization: api-key" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'

# Monitor Docker
docker ps
docker stats

# Check environment
env | grep MCP_GATEWAY
export -p | grep MCP_GATEWAY

# Validate config
./awmg --config config.toml --validate-env

# View RPC messages
cat /tmp/gh-aw/mcp-logs/rpc-messages.jsonl | jq .

# Check tools catalog
cat /tmp/gh-aw/mcp-logs/tools.json | jq .

# Monitor authentication
grep -i "auth" /tmp/gh-aw/mcp-logs/mcp-gateway.log | tail -n 20
```

### Resources

- **Repository**: https://github.com/github/gh-aw-mcpg
- **Issues**: https://github.com/github/gh-aw-mcpg/issues
- **Discussions**: https://github.com/github/gh-aw-mcpg/discussions
- **Docker Docs**: https://docs.docker.com/engine/reference/commandline/docker/
