---
mcp-servers:
  european-parliament:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "european-parliament-mcp-server@1.2.20", "--timeout", "180000"]
    env:
      EP_REQUEST_TIMEOUT_MS: "180000"
  world-bank:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "worldbank-mcp@1.0.1"]
  fetch-proxy:
    container: "node:25-alpine"
    entrypoint: "node"
    entrypointArgs: ["-e", "const r=require,rl=r('readline').createInterface({input:process.stdin});rl.on('line',async l=>{try{const m=JSON.parse(l);if(m.method==='initialize')process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result:{protocolVersion:'2024-11-05',capabilities:{tools:{}}}})+'\\n');else if(m.method==='notifications/initialized');else if(m.method==='tools/list')process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result:{tools:[{name:'fetch_url',description:'Fetch a URL and return its content',inputSchema:{type:'object',properties:{url:{type:'string',description:'URL to fetch'},headers:{type:'object',description:'Optional headers'}},required:['url']}}]}})+'\\n');else if(m.method==='tools/call'&&m.params?.name==='fetch_url'){const u=m.params.arguments?.url,h=m.params.arguments?.headers||{Accept:'application/json'};const res=await fetch(u,{headers:h,signal:AbortSignal.timeout(120000)});const t=await res.text();process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result:{content:[{type:'text',text:t}]}})+'\\n')}else process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result:{content:[{type:'text',text:'unknown method'}]}})+'\\n')}catch(e){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:0,error:{code:-1,message:String(e)}})+'\\n')}})"]
  memory:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "@modelcontextprotocol/server-memory"]
  sequential-thinking:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "@modelcontextprotocol/server-sequential-thinking"]
---

<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Shared MCP server block for EU Parliament Monitor news workflows

This file is a gh-aw **shared workflow component** (no `on:` field, so it is
never compiled to a standalone GitHub Actions workflow — only imported
into news-*.md workflows via the `imports:` field).

It mounts the five MCP servers every article-generating workflow needs:

| Server | Version | Purpose |
|---|---|---|
| `european-parliament` | `european-parliament-mcp-server@1.2.20` | 62 EP tools (see `.github/prompts/07-mcp-reference.md`) |
| `world-bank` | `worldbank-mcp@1.0.1` | **Non-economic** indicators — health, education, social, environment, demographics, defence (military expenditure), agriculture, innovation, governance (WGI). |
| `fetch-proxy` | inline Node.js MCP server | HTTP fetch proxy — bypasses AWF Squid proxy for direct API calls (IMF SDMX, etc.). Exposes `fetch_url` tool. |
| `memory` | `@modelcontextprotocol/server-memory` | Run-scoped scratch memory |
| `sequential-thinking` | `@modelcontextprotocol/server-sequential-thinking` | Structured reasoning tool |

Do **not** add `tools: ["*"]` / `allowed: ["*"]` to any server above — the
gh-aw MCP gateway (`awmg`) treats `*` as a literal tool name. Omit the
`tools` field entirely. See `.github/prompts/08-infrastructure.md` §2 for
the canonical rule.

Importing workflows keep their own `tools:` block (bash / github /
agentic-workflows / repo-memory configuration), `network:`, `safe-outputs:`,
`permissions:`, `runtimes:`, `steps:`, and `engine:` entries — `imports:`
does not merge those fields.
