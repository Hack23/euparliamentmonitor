---
mcp-servers:
  european-parliament:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "european-parliament-mcp-server@1.2.21", "--timeout", "180000"]
    env:
      EP_REQUEST_TIMEOUT_MS: "180000"
  world-bank:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "worldbank-mcp@1.0.1"]
  fetch-proxy:
    container: "node:25-alpine"
    entrypoint: "node"
    entrypointArgs: ["-e", "const r=require,rl=r('readline').createInterface({input:process.stdin}),nl=String.fromCharCode(10),send=o=>process.stdout.write(JSON.stringify(o)+nl),fail=(id,e)=>send({jsonrpc:'2.0',id:id||0,error:{code:-1,message:String(e&&e.message||e)}}),allowed=u=>{try{const x=new URL(u);return x.protocol==='https:'&&x.hostname==='dataservices.imf.org'&&x.pathname.startsWith('/REST/SDMX_3.0/')}catch{return false}};rl.on('line',async l=>{let mid=0;try{const m=JSON.parse(l);mid=m.id||0;if(m.method==='initialize')send({jsonrpc:'2.0',id:m.id,result:{protocolVersion:'2024-11-05',capabilities:{tools:{}}}});else if(m.method==='notifications/initialized');else if(m.method==='tools/list')send({jsonrpc:'2.0',id:m.id,result:{tools:[{name:'fetch_url',description:'Fetch an IMF SDMX URL and return its content',inputSchema:{type:'object',properties:{url:{type:'string',description:'IMF SDMX URL to fetch'}},required:['url']}}]}});else if(m.method==='tools/call'&&m.params&&m.params.name==='fetch_url'){const u=m.params.arguments&&m.params.arguments.url;if(!allowed(u))return fail(m.id,'fetch_url only allows https://dataservices.imf.org/REST/SDMX_3.0/ URLs');const res=await fetch(u,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(180000)});const t=await res.text();if(!res.ok)return fail(m.id,'HTTP '+res.status+' '+res.statusText);send({jsonrpc:'2.0',id:m.id,result:{content:[{type:'text',text:t}]}})}else send({jsonrpc:'2.0',id:m.id,result:{content:[{type:'text',text:'unknown method'}]}})}catch(e){fail(mid,e)}})"]
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
| `european-parliament` | `european-parliament-mcp-server@1.2.21` | 62 EP tools (see `.github/prompts/07-mcp-reference.md`) |
| `world-bank` | `worldbank-mcp@1.0.1` | **Non-economic** indicators — health, education, social, environment, demographics, defence (military expenditure), agriculture, innovation, governance (WGI). |
| `fetch-proxy` | inline Node.js MCP server | IMF-only HTTPS fetch proxy — bypasses AWF Squid proxy for `dataservices.imf.org/REST/SDMX_3.0/` calls. Exposes `fetch_url` tool. |
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
