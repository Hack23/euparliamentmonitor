#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# @module mcp-setup
# @description Sourceable shell script that configures MCP environment variables
# for agentic workflow scripts. Replaces inline python3 JSON parsing with node -e.
#
# Usage (in workflow .md bash blocks):
#   source scripts/mcp-setup.sh
#   npx tsx scripts/generate-news-enhanced.ts --types=committee-reports ...
#
# Sets: EP_MCP_GATEWAY_URL, EP_MCP_GATEWAY_API_KEY, MCP_CLIENT_TIMEOUT_MS,
#       WORLD_BANK_MCP_SERVER_URL
#
# Token extraction priority:
#   1. gateway.apiKey (legacy)
#   2. mcpServers['european-parliament'].headers.Authorization (raw API key)
#
# @author Hack23 AB
# @license Apache-2.0

# Route through MCP gateway (direct HTTPS fails in AWF sandbox)
export EP_MCP_GATEWAY_URL="http://host.docker.internal:80/mcp/european-parliament"

# World Bank MCP server also available through gateway
export WORLD_BANK_MCP_SERVER_URL="http://host.docker.internal:80/mcp/world-bank"

# IMF Data — native TypeScript SDMX 3.0 REST client.
# No MCP server / gateway required — the client in
# src/mcp/imf-mcp-client.ts calls https://dataservices.imf.org/ directly.
# Export the base URL so `scripts/imf-mcp-probe.sh` and any ad-hoc curl
# calls in workflow bash blocks target the same endpoint the client
# resolves at runtime. Override via `IMF_API_BASE_URL` if mirroring.
# Introduced in Wave 1 of the IMF migration (see
# analysis/methodologies/imf-indicator-mapping.md). Historical
# gateway-style `IMF_MCP_SERVER_URL` is intentionally no longer exported
# — the Python upstream is not used anywhere in the stack.
export IMF_API_BASE_URL="${IMF_API_BASE_URL:-https://dataservices.imf.org/REST/SDMX_3.0}"

# Extract auth token using node (repo runtime — no python3 dependency)
_MCP_CONFIG_PATH="${GH_AW_MCP_CONFIG:-/home/runner/.copilot/mcp-config.json}"
if [ -f "$_MCP_CONFIG_PATH" ]; then
  GW_KEY=$(node -e "
    try {
      const c = JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'));
      // Priority 1: gateway.apiKey (legacy path)
      const gwKey = (c.gateway || {}).apiKey || '';
      if (gwKey) { process.stdout.write(gwKey); process.exit(0); }
      // Priority 2: mcpServers['european-parliament'].headers.Authorization
      const ep = ((c.mcpServers || {})['european-parliament']) || {};
      const auth = (ep.headers || {})['Authorization'] || '';
      process.stdout.write(auth);
    } catch(e) { process.stderr.write('MCP config parse error: ' + e.message + '\n'); process.stdout.write(''); }
  " -- "$_MCP_CONFIG_PATH" 2>/dev/null || echo "")
  if [ -z "$GW_KEY" ]; then
    echo "⚠️  WARNING: MCP config file exists but MCP auth token is missing or invalid"
  else
    # Strip legacy "Bearer " prefix (case-insensitive) — gateway expects raw API key
    export EP_MCP_GATEWAY_API_KEY="$(printf '%s' "$GW_KEY" | sed 's/^[Bb][Ee][Aa][Rr][Ee][Rr][[:space:]]*//')"
  fi
fi

# EP API slow response timeout (120 s — some EP MCP tools need 60-120 s)
export MCP_CLIENT_TIMEOUT_MS=120000
