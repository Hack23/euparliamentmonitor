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
#       WORLD_BANK_MCP_SERVER_URL, FETCH_MCP_GATEWAY_URL,
#       IMF_API_BASE_URL, IMF_API_TIMEOUT_MS
#
# Gateway address resolution priority:
#   1. gateway.port + gateway.domain from MCP config JSON (gh-aw writes these)
#   2. Defaults: host.docker.internal:8080 (gh-aw v0.69.0+ canonical port)
#
# Token extraction priority:
#   1. gateway.apiKey (legacy)
#   2. mcpServers['european-parliament'].headers.Authorization (raw API key)
#
# @author Hack23 AB
# @license Apache-2.0

# Route through MCP gateway (direct HTTPS fails in AWF sandbox).
#
# gh-aw v0.69.0 runs the MCP gateway on port 8080 by default (see the
# "Added --allow-host-ports to AWF command for MCP gateway port 8080"
# release note). Older gh-aw versions used port 80. We resolve the
# actual port + domain dynamically from the gh-aw MCP config JSON
# further down (`gateway.port` + `gateway.domain`), and fall back to
# 8080/host.docker.internal here so non-agentic callers still work.
MCP_GATEWAY_DOMAIN_DEFAULT="host.docker.internal"
MCP_GATEWAY_PORT_DEFAULT="8080"
export EP_MCP_GATEWAY_URL="http://${MCP_GATEWAY_DOMAIN_DEFAULT}:${MCP_GATEWAY_PORT_DEFAULT}/mcp/european-parliament"

# World Bank MCP server also available through the same gateway
export WORLD_BANK_MCP_SERVER_URL="http://${MCP_GATEWAY_DOMAIN_DEFAULT}:${MCP_GATEWAY_PORT_DEFAULT}/mcp/world-bank"

# Fetch proxy MCP server — routes HTTP calls through an MCP container that
# bypasses the AWF Squid proxy. Used by the IMF client and probe script
# when direct HTTPS is blocked by the sandbox firewall.
export FETCH_MCP_GATEWAY_URL="http://${MCP_GATEWAY_DOMAIN_DEFAULT}:${MCP_GATEWAY_PORT_DEFAULT}/mcp/fetch-proxy"

# IMF Data — native TypeScript SDMX 3.0 REST client.
# Primary transport: MCP fetch-proxy gateway (bypasses AWF Squid proxy).
# Fallback: direct HTTPS to https://dataservices.imf.org/ (works outside AWF).
# Export the base URL so `scripts/imf-mcp-probe.sh` and any ad-hoc curl
# calls in workflow bash blocks target the same endpoint the client
# resolves at runtime. Override via `IMF_API_BASE_URL` if mirroring.
export IMF_API_BASE_URL="${IMF_API_BASE_URL:-https://dataservices.imf.org/REST/SDMX_3.0}"

# Extract auth token + gateway address (port/domain) using node
# (repo runtime — no python3 dependency). gh-aw writes the actual
# gateway port/domain into the MCP config JSON's `gateway` object,
# so reading them here keeps us correct across gh-aw versions
# (v0.69.0 uses 8080; earlier versions used 80).
_MCP_CONFIG_PATH="${GH_AW_MCP_CONFIG:-/home/runner/.copilot/mcp-config.json}"
if [ -f "$_MCP_CONFIG_PATH" ]; then
  _MCP_GATEWAY_FIELDS=$(node -e "
    try {
      const c = JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'));
      // Priority 1: gateway.apiKey (legacy path)
      const gw = c.gateway || {};
      let key = gw.apiKey || '';
      // Priority 2: mcpServers['european-parliament'].headers.Authorization
      if (!key) {
        const ep = ((c.mcpServers || {})['european-parliament']) || {};
        key = (ep.headers || {})['Authorization'] || '';
      }
      const port = (gw.port != null && gw.port !== '') ? String(gw.port) : '';
      const domain = (gw.domain || '').toString();
      // Tab-separated: key<TAB>port<TAB>domain (tabs never appear in any of these values)
      process.stdout.write(key + '\t' + port + '\t' + domain);
    } catch(e) { process.stderr.write('MCP config parse error: ' + e.message + '\n'); process.stdout.write('\t\t'); }
  " -- "$_MCP_CONFIG_PATH" 2>/dev/null || printf '\t\t')
  GW_KEY="${_MCP_GATEWAY_FIELDS%%	*}"
  _MCP_GATEWAY_REST="${_MCP_GATEWAY_FIELDS#*	}"
  GW_PORT="${_MCP_GATEWAY_REST%%	*}"
  GW_DOMAIN="${_MCP_GATEWAY_REST#*	}"
  if [ -z "$GW_KEY" ]; then
    echo "⚠️  WARNING: MCP config file exists but MCP auth token is missing or invalid"
  else
    # Strip legacy "Bearer " prefix (case-insensitive) — gateway expects raw API key
    export EP_MCP_GATEWAY_API_KEY="$(printf '%s' "$GW_KEY" | sed 's/^[Bb][Ee][Aa][Rr][Ee][Rr][[:space:]]*//')"
  fi
  # Rebuild gateway URLs from the config if it advertises port/domain, so
  # we always match whatever gh-aw is actually running (80 on old versions,
  # 8080 on v0.69.0+). Falls back to the defaults exported above otherwise.
  if [ -n "$GW_PORT" ] && [ -n "$GW_DOMAIN" ]; then
    export EP_MCP_GATEWAY_URL="http://${GW_DOMAIN}:${GW_PORT}/mcp/european-parliament"
    export WORLD_BANK_MCP_SERVER_URL="http://${GW_DOMAIN}:${GW_PORT}/mcp/world-bank"
    export FETCH_MCP_GATEWAY_URL="http://${GW_DOMAIN}:${GW_PORT}/mcp/fetch-proxy"
  fi
  unset _MCP_GATEWAY_FIELDS _MCP_GATEWAY_REST GW_KEY GW_PORT GW_DOMAIN
fi

# EP API slow response timeout (180 s — some EP MCP tools need 60-180 s)
export MCP_CLIENT_TIMEOUT_MS=180000

# IMF API timeout — generous default for AWF proxy overhead (120 s).
# The native TS client respects IMF_API_TIMEOUT_MS; the probe script uses
# curl --max-time. Both should be aligned.
export IMF_API_TIMEOUT_MS="${IMF_API_TIMEOUT_MS:-120000}"
