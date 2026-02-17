---
name: mcp-server-integration
description: MCP server integration patterns with tool discovery, multi-server orchestration, custom server development, and performance optimization
tools: []
---

# Skill: MCP Server Integration Patterns

## MCP Protocol Fundamentals

**Model Context Protocol (MCP)** is a standard protocol for AI agents to interact with external tools and data sources through JSON-RPC 2.0 over stdio or HTTP.

## Core Integration Skills

### 1. MCP Server Types

**Stdio Transport (Container-based)**
- Communication via standard input/output streams
- Launched as Docker containers by MCP gateway
- Session-based connection pooling
- Best for: Sandboxed environments, GitHub Actions

**HTTP Transport (Remote)**
- RESTful JSON-RPC 2.0 endpoints
- Direct HTTP connections
- Stateless or session-based
- Best for: Existing services, microservices

### 2. Tool Discovery and Invocation

**Tool Discovery Flow**:
```
1. Agent → Gateway: {"method": "tools/list"}
2. Gateway → Backend: Forward request
3. Backend → Gateway: Return tool catalog
4. Gateway → Agent: Aggregated tools from all backends
```

**Tool Invocation Flow**:
```
1. Agent → Gateway: {"method": "tools/call", "params": {"name": "search_code", "arguments": {...}}}
2. Gateway → Backend: Route to appropriate MCP server
3. Backend → External API: Execute tool
4. Backend → Gateway: Return response
5. Gateway → Agent: Process payload (disk storage if large)
```

### 3. Session Management

**Session Lifecycle**:
- Session ID extracted from Authorization header
- Persistent connections per session
- Backend processes reused across requests
- Automatic cleanup on session end

**Benefits**:
- Reduced startup latency
- Stateful interactions
- Connection pooling efficiency

## MCP Server Configuration Patterns

### GitHub MCP Server

```json
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
```

**Available Tools**:
- `search_code`: Search code across repositories
- `get_file_contents`: Read file contents
- `create_issue`: Create GitHub issues
- `create_pull_request`: Create pull requests
- `list_pull_requests`: List PRs
- `get_pull_request`: Get PR details
- Many more...

### European Parliament MCP Server

```json
{
  "mcpServers": {
    "european-parliament": {
      "type": "stdio",
      "container": "ghcr.io/hack23/european-parliament-mcp-server:latest",
      "env": {
        "EP_API_KEY": "${EP_API_KEY}",
        "EP_CACHE_DIR": "/tmp/ep-cache"
      },
      "mounts": [
        "/host/cache:/tmp/ep-cache:rw"
      ]
    }
  }
}
```

**Available Tools**:
- `get_plenary_sessions`: Fetch plenary session data
- `search_documents`: Search parliamentary documents
- `get_parliamentary_questions`: Get parliamentary questions
- `get_committee_info`: Get committee information
- `get_mep_details`: Get MEP (Member of European Parliament) details

### Filesystem MCP Server

```json
{
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "container": "ghcr.io/modelcontextprotocol/filesystem-server:latest",
      "mounts": [
        "/workspace:/workspace:rw",
        "/data:/data:ro"
      ]
    }
  }
}
```

**Available Tools**:
- `read_file`: Read file contents
- `write_file`: Write to files
- `list_directory`: List directory contents
- `create_directory`: Create directories
- `delete_file`: Delete files
- `move_file`: Move/rename files

### Memory MCP Server

```json
{
  "mcpServers": {
    "memory": {
      "type": "stdio",
      "container": "ghcr.io/modelcontextprotocol/server-memory:latest"
    }
  }
}
```

**Available Tools**:
- `create_entities`: Create knowledge graph entities
- `create_relations`: Create entity relations
- `add_observations`: Add observations to entities
- `search_nodes`: Search knowledge graph
- `open_nodes`: Retrieve specific nodes

## Multi-Server Orchestration

### Tool Routing Pattern

```javascript
// Agent determines which server to use based on tool name
const toolMapping = {
  "search_code": "github",
  "get_plenary_sessions": "european-parliament",
  "read_file": "filesystem"
};

// Gateway routes based on server ID in request path
// POST /mcp/github → github MCP server
// POST /mcp/european-parliament → EP MCP server
```

### Cross-Server Workflows

```yaml
workflow:
  name: EU Parliament Monitoring
  
  steps:
    - id: fetch-sessions
      server: european-parliament
      tool: get_plenary_sessions
      params:
        start_date: "2026-02-01"
        end_date: "2026-02-28"
    
    - id: search-documents
      server: european-parliament
      tool: search_documents
      params:
        query: "climate policy"
        limit: 50
    
    - id: write-analysis
      server: filesystem
      tool: write_file
      params:
        path: "/workspace/analysis.md"
        content: "${analysis_result}"
    
    - id: create-issue
      server: github
      tool: create_issue
      params:
        owner: "Hack23"
        repo: "euparliamentmonitor"
        title: "EU Parliament Activity - February 2026"
        body: "${file:///workspace/analysis.md}"
```

## Custom MCP Server Development

### Server Interface Contract

```typescript
interface MCPServer {
  // Required: List available tools
  listTools(): Promise<Tool[]>;
  
  // Required: Execute tool
  callTool(name: string, args: object): Promise<any>;
  
  // Optional: Initialize with config
  initialize?(config: object): Promise<void>;
  
  // Optional: Cleanup
  shutdown?(): Promise<void>;
}

interface Tool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}
```

### Example: Custom Data Source MCP Server

```typescript
// custom-data-mcp-server.ts
class CustomDataMCPServer {
  async listTools() {
    return [
      {
        name: "query_database",
        description: "Query custom database",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            limit: { type: "number", default: 100 }
          },
          required: ["query"]
        }
      }
    ];
  }
  
  async callTool(name: string, args: any) {
    if (name === "query_database") {
      const results = await this.database.query(args.query, args.limit);
      return { results };
    }
    throw new Error(`Unknown tool: ${name}`);
  }
}

// Start server
const server = new CustomDataMCPServer();
process.stdin.pipe(new MCPStdioTransport(server));
```

### Deployment Configuration

```json
{
  "mcpServers": {
    "custom-data": {
      "type": "stdio",
      "container": "ghcr.io/your-org/custom-data-mcp-server:latest",
      "env": {
        "DATABASE_URL": "${DB_URL}",
        "API_KEY": ""
      }
    }
  }
}
```

## Error Handling Patterns

### Backend Error Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "Tool execution failed",
    "data": {
      "tool": "search_code",
      "reason": "API rate limit exceeded",
      "retry_after": 60
    }
  }
}
```

### Gateway Error Handling

```javascript
try {
  const response = await mcpGateway.callTool("github", "search_code", params);
  return response;
} catch (error) {
  if (error.code === -32000 && error.data.retry_after) {
    // Implement exponential backoff
    await sleep(error.data.retry_after * 1000);
    return mcpGateway.callTool("github", "search_code", params);
  }
  throw error;
}
```

### Circuit Breaker Pattern

```yaml
circuitBreaker:
  enabled: true
  threshold: 5           # Failures before opening
  timeout: 30s           # Time in open state
  halfOpenRequests: 3    # Test requests in half-open state
```

## Performance Optimization

### Response Caching

```yaml
caching:
  enabled: true
  
  strategies:
    - server: european-parliament
      tools: ["get_plenary_sessions"]
      ttl: 3600  # 1 hour
      keyPattern: "${tool}:${params}"
    
    - server: github
      tools: ["get_file_contents"]
      ttl: 300   # 5 minutes
      invalidateOn: ["push", "pull_request"]
```

### Payload Optimization

```yaml
payloadHandling:
  threshold: 10240  # 10KB
  compression: gzip
  
  strategies:
    small: inline        # < threshold: return inline
    medium: compress     # < 100KB: compress
    large: disk          # >= 100KB: store to disk
```

### Connection Pooling

```yaml
connectionPool:
  minSize: 2
  maxSize: 10
  idleTimeout: 300s
  connectionTimeout: 30s
  healthCheckInterval: 60s
```

## Testing MCP Servers

### Unit Testing Tools

```bash
# Test tool discovery
curl -X POST http://mcp-gateway:8000/mcp/github \
  -H "Authorization: test-key" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'

# Test specific tool
curl -X POST http://mcp-gateway:8000/mcp/github \
  -H "Authorization: test-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_code",
      "arguments": {"query": "function main", "repo": "test/repo"}
    },
    "id": 2
  }'
```

### Integration Testing

```yaml
# test-workflow.yaml
tests:
  - name: test-github-integration
    servers: [github]
    steps:
      - tool: search_code
        params: {query: "test"}
        expect: {status: "success"}
      
      - tool: get_file_contents
        params: {path: "README.md", repo: "test/repo"}
        expect: {status: "success", content_includes: "# Test"}
  
  - name: test-eu-parliament-integration
    servers: [european-parliament]
    steps:
      - tool: get_plenary_sessions
        params: {start_date: "2026-01-01"}
        expect: {status: "success", sessions_count: {gt: 0}}
```

### Mock MCP Server

```typescript
// mock-mcp-server.ts
class MockMCPServer {
  private mockResponses = new Map();
  
  addMockTool(name: string, response: any) {
    this.mockResponses.set(name, response);
  }
  
  async callTool(name: string, args: any) {
    const response = this.mockResponses.get(name);
    if (!response) throw new Error(`No mock for tool: ${name}`);
    return typeof response === 'function' ? response(args) : response;
  }
}

// Usage in tests
const mock = new MockMCPServer();
mock.addMockTool("search_code", {
  results: [{file: "test.js", line: 10, content: "function test()"}]
});
```

## Security Considerations

### Authentication Flow

```
Agent → Gateway (API Key) → Backend (Pass-through token)
```

**Best Practices**:
- Unique API keys per agent/session
- Backend tokens passed via environment variables
- No hardcoded credentials
- Token rotation support

### Input Validation

```typescript
function validateToolCall(tool: string, args: any) {
  const schema = getToolSchema(tool);
  const errors = validate(args, schema);
  if (errors.length > 0) {
    throw new ValidationError("Invalid arguments", errors);
  }
}
```

### Output Sanitization

```typescript
function sanitizeToolResponse(response: any) {
  // Remove sensitive fields
  delete response.internalDetails;
  delete response.apiKey;
  
  // Truncate large responses
  if (JSON.stringify(response).length > MAX_SIZE) {
    return {
      ...response,
      data: truncate(response.data),
      _truncated: true
    };
  }
  
  return response;
}
```

## Monitoring MCP Servers

### Health Checks

```bash
# Check each MCP server health
for server in github european-parliament filesystem; do
  echo "Checking $server..."
  curl -X POST "http://mcp-gateway:8000/mcp/$server" \
    -H "Authorization: key" \
    -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' \
    | jq '.result.tools | length'
done
```

### Performance Metrics

```bash
# Gateway metrics per server
curl http://mcp-gateway:9090/metrics | jq '.servers[] | {
  id,
  requests_total,
  errors_total,
  avg_latency_ms,
  p95_latency_ms
}'
```

### Tool Usage Analytics

```bash
# Most used tools
curl http://mcp-gateway:9090/api/analytics/tools | jq '.tools | sort_by(.count) | reverse | .[0:10]'

# Tool success rates
curl http://mcp-gateway:9090/api/analytics/success-rates | jq '.'
```

## Resources

- **MCP Specification**: https://github.com/modelcontextprotocol
- **GitHub MCP Server**: https://github.com/github/github-mcp-server
- **European Parliament MCP**: https://github.com/Hack23/European-Parliament-MCP-Server
- **Gateway Configuration**: See mcp-gateway-configuration.md
- **Security**: See mcp-gateway-security.md
- **Architecture**: See gh-aw-architecture.md
