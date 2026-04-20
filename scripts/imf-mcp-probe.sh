#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# @module imf-mcp-probe
# @description Transparent IMF MCP connectivity probe for agentic
# workflows. Performs up to 2 cheap calls through the MCP gateway and
# prints a one-line status flag that workflow prompts can read to
# decide whether IMF data is available for article enrichment.
#
# Usage (in workflow .md bash blocks, AFTER `source scripts/mcp-setup.sh`):
#
#   source scripts/mcp-setup.sh
#   source scripts/imf-mcp-probe.sh
#   echo "IMF_MCP_OK=$IMF_MCP_OK"
#
# Sets (exports):
#   IMF_MCP_OK — "true" on success, "false" when any probe call fails.
#   IMF_MCP_PROBE_ERROR — free-form error string when IMF_MCP_OK=false.
#
# Budget: max 2 outbound HTTP calls (imf-list-databases, imf-fetch-data
# for a tiny slice). The probe respects the `IMF_MCP_SERVER_URL`
# variable exported by `mcp-setup.sh`. Authentication: sends the same
# Authorization header used by `MCPConnection` in the TypeScript
# client, reading `IMF_MCP_GATEWAY_API_KEY` first and falling back to
# `EP_MCP_GATEWAY_API_KEY` (both gateways share the same auth in the
# current deployment). The key is passed through a CLI arg rather than
# an env-interpolated curl `-H` string so it never reaches the process
# table in shared runners.

export IMF_MCP_OK="false"
export IMF_MCP_PROBE_ERROR=""

if [ -z "${IMF_MCP_SERVER_URL:-}" ]; then
  IMF_MCP_PROBE_ERROR="IMF_MCP_SERVER_URL is not set; did you source scripts/mcp-setup.sh?"
  echo "IMF_MCP_OK=false  # $IMF_MCP_PROBE_ERROR"
  # `return` works when sourced (typical workflow usage); `exit` fallback for direct execution.
  return 0 2>/dev/null || exit 0
fi

# Resolve the gateway API key with the same precedence as the TypeScript
# client: IMF-specific override wins, otherwise reuse the EP gateway key.
_IMF_MCP_PROBE_KEY="${IMF_MCP_GATEWAY_API_KEY:-${EP_MCP_GATEWAY_API_KEY:-}}"

# Use curl with a short connect timeout so the probe cannot block the
# workflow. Total per-call budget: 15 s. Two calls → max 30 s wall-clock.
_IMF_CURL_OPTS=(--silent --show-error --fail --max-time 15 --connect-timeout 5 \
  -H 'Content-Type: application/json' -H 'Accept: application/json')

# Add the Authorization header only when a key is actually available.
# Mirror `_buildAuthorizationHeader` in `mcp-connection.ts`: prepend
# `Bearer ` only when the key is not already a complete auth value.
if [ -n "$_IMF_MCP_PROBE_KEY" ]; then
  case "$_IMF_MCP_PROBE_KEY" in
    [Bb]earer\ *|[Bb]asic\ *) _IMF_AUTH_VALUE="$_IMF_MCP_PROBE_KEY" ;;
    *) _IMF_AUTH_VALUE="Bearer $_IMF_MCP_PROBE_KEY" ;;
  esac
  _IMF_CURL_OPTS+=(-H "Authorization: $_IMF_AUTH_VALUE")
fi

# JSON-RPC 2.0 envelope expected by MCP servers. Both calls use
# `tools/call`. Payloads are intentionally minimal so the probe is cheap.
_imf_probe_call() {
  local tool="$1" args_json="$2" stderr_log
  stderr_log=$(curl "${_IMF_CURL_OPTS[@]}" \
    -X POST "$IMF_MCP_SERVER_URL" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"$tool\",\"arguments\":$args_json}}" \
    -o /dev/null 2>&1)
  local status=$?
  if [ $status -ne 0 ]; then
    IMF_MCP_PROBE_ERROR="$tool probe failed (exit $status): ${stderr_log%%$'\n'*}"
    return $status
  fi
  return 0
}

# Probe 1: list databases (no arguments, very cheap)
if ! _imf_probe_call "imf-list-databases" '{}'; then
  [ -n "$IMF_MCP_PROBE_ERROR" ] || IMF_MCP_PROBE_ERROR="imf-list-databases probe failed"
  echo "IMF_MCP_OK=false  # $IMF_MCP_PROBE_ERROR"
  return 0 2>/dev/null || exit 0
fi

# Probe 2: fetch a single WEO real-GDP-growth observation for Germany,
# 2025 only. A single-cell fetch exercises the full discovery → fetch
# flow without stressing the SDMX rate limit (10 rps / 5 s).
if ! _imf_probe_call "imf-fetch-data" \
  '{"database_id":"WEO","start_year":2025,"end_year":2025,"filters":{"country":["DEU"],"indicator":["NGDP_RPCH"]}}'; then
  [ -n "$IMF_MCP_PROBE_ERROR" ] || IMF_MCP_PROBE_ERROR="imf-fetch-data probe failed"
  echo "IMF_MCP_OK=false  # $IMF_MCP_PROBE_ERROR"
  return 0 2>/dev/null || exit 0
fi

export IMF_MCP_OK="true"
echo "IMF_MCP_OK=true"
