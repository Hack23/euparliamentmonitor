#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# @module wb-mcp-probe
# @description Transparent World Bank MCP connectivity probe for agentic
# workflows. Performs up to 3 cheap calls through the MCP gateway and
# prints a one-line status flag that workflow prompts can read to decide
# whether the World Bank quality gate is "mandatory" or "best-effort".
#
# Usage (in workflow .md bash blocks, AFTER `source scripts/mcp-setup.sh`):
#
#   source scripts/mcp-setup.sh
#   source scripts/wb-mcp-probe.sh
#   echo "WB_MCP_OK=$WB_MCP_OK"
#
# Sets (exports):
#   WB_MCP_OK — "true" on success, "false" when any probe call fails.
#   WB_MCP_PROBE_ERROR — free-form error string when WB_MCP_OK=false.
#
# Budget: max 3 outbound HTTP calls (search-indicators, get-country-info,
# get-economic-data). The probe respects the `WORLD_BANK_MCP_SERVER_URL`
# variable exported by `mcp-setup.sh`. Authentication: sends the same
# `Authorization: Bearer <key>` header used by `MCPConnection` in the
# TypeScript client, reading `WB_MCP_GATEWAY_API_KEY` first and falling
# back to `EP_MCP_GATEWAY_API_KEY` (both gateways share the same auth in
# the current deployment). The key is passed through a CLI arg rather
# than an env-interpolated curl `-H` string so it never reaches the
# process table in shared runners.

export WB_MCP_OK="false"
export WB_MCP_PROBE_ERROR=""

if [ -z "${WORLD_BANK_MCP_SERVER_URL:-}" ]; then
  WB_MCP_PROBE_ERROR="WORLD_BANK_MCP_SERVER_URL is not set; did you source scripts/mcp-setup.sh?"
  echo "WB_MCP_OK=false  # $WB_MCP_PROBE_ERROR"
  # `return` works when the script is sourced (typical workflow usage);
  # `exit` is the fallback when the script is executed directly.
  return 0 2>/dev/null || exit 0
fi

# Resolve the gateway API key with the same precedence as the TypeScript
# client: WB-specific override wins, otherwise reuse the EP gateway key
# (both route through the same gateway in the default deployment).
# Use an explicit if/else instead of nested default expansion
# `${A:-${B:-}}` — that pattern is rejected by the shell-safety filter
# (see .github/prompts/00-scope-and-ground-rules.md §47).
if [ -n "${WB_MCP_GATEWAY_API_KEY:-}" ]; then
  _WB_MCP_PROBE_KEY="$WB_MCP_GATEWAY_API_KEY"
elif [ -n "${EP_MCP_GATEWAY_API_KEY:-}" ]; then
  _WB_MCP_PROBE_KEY="$EP_MCP_GATEWAY_API_KEY"
else
  _WB_MCP_PROBE_KEY=""
fi

# Use curl with a generous timeout to tolerate AWF Squid proxy overhead.
# Total per-call budget: 60 s. Three calls → max 180 s wall-clock.
# The probe is non-blocking (always exits 0) so Stage A continues regardless.
_WB_CURL_OPTS=(--silent --show-error --fail --max-time 60 --connect-timeout 20 \
  -H 'Content-Type: application/json' -H 'Accept: application/json')

# Add the Authorization header only when a key is actually available.
# `_buildAuthorizationHeader` in `mcp-connection.ts` prepends `Bearer `
# when the key is not already a complete Authorization value; mirror that
# so the probe talks to the gateway the same way the TypeScript client
# does.
if [ -n "$_WB_MCP_PROBE_KEY" ]; then
  case "$_WB_MCP_PROBE_KEY" in
    [Bb]earer\ *|[Bb]asic\ *) _WB_AUTH_VALUE="$_WB_MCP_PROBE_KEY" ;;
    *) _WB_AUTH_VALUE="Bearer $_WB_MCP_PROBE_KEY" ;;
  esac
  _WB_CURL_OPTS+=(-H "Authorization: $_WB_AUTH_VALUE")
fi

# JSON-RPC 2.0 envelope expected by MCP servers. All three calls use
# `tools/call`; payloads are minimal. Capture curl's stderr into a temp
# variable (rather than discarding it) so the workflow can surface a
# diagnostic on failure instead of reporting only "probe failed".
_probe_call() {
  local tool="$1" args_json="$2" stderr_log
  stderr_log=$(curl "${_WB_CURL_OPTS[@]}" \
    -X POST "$WORLD_BANK_MCP_SERVER_URL" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"$tool\",\"arguments\":$args_json}}" \
    -o /dev/null 2>&1)
  local status=$?
  if [ $status -ne 0 ]; then
    # Preserve the first line of curl's error output for downstream logs.
    WB_MCP_PROBE_ERROR="$tool probe failed (exit $status): ${stderr_log%%$'\n'*}"
    return $status
  fi
  return 0
}

if ! _probe_call "search-indicators" '{"keyword":"GDP"}'; then
  [ -n "$WB_MCP_PROBE_ERROR" ] || WB_MCP_PROBE_ERROR="search-indicators probe failed"
  echo "WB_MCP_OK=false  # $WB_MCP_PROBE_ERROR"
  return 0 2>/dev/null || exit 0
fi

if ! _probe_call "get-country-info" '{"countryCode":"DE"}'; then
  [ -n "$WB_MCP_PROBE_ERROR" ] || WB_MCP_PROBE_ERROR="get-country-info probe failed"
  echo "WB_MCP_OK=false  # $WB_MCP_PROBE_ERROR"
  return 0 2>/dev/null || exit 0
fi

if ! _probe_call "get-economic-data" '{"countryCode":"DE","indicator":"GDP_GROWTH","years":5}'; then
  [ -n "$WB_MCP_PROBE_ERROR" ] || WB_MCP_PROBE_ERROR="get-economic-data probe failed"
  echo "WB_MCP_OK=false  # $WB_MCP_PROBE_ERROR"
  return 0 2>/dev/null || exit 0
fi

export WB_MCP_OK="true"
echo "WB_MCP_OK=true"
