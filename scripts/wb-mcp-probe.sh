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
# Budget: max 3 outbound HTTP calls (search-indicators, get-countries,
# get-economic-data). The probe respects the `WORLD_BANK_MCP_SERVER_URL`
# variable exported by `mcp-setup.sh`.

export WB_MCP_OK="false"
export WB_MCP_PROBE_ERROR=""

if [ -z "${WORLD_BANK_MCP_SERVER_URL:-}" ]; then
  WB_MCP_PROBE_ERROR="WORLD_BANK_MCP_SERVER_URL is not set; did you source scripts/mcp-setup.sh?"
  echo "WB_MCP_OK=false  # $WB_MCP_PROBE_ERROR"
  # `return` works when the script is sourced (typical workflow usage);
  # `exit` is the fallback when the script is executed directly.
  return 0 2>/dev/null || exit 0
fi

# Use curl with a short connect timeout so the probe cannot block the
# workflow. Total per-call budget: 15 s. Three calls → max 45 s wall-clock.
_WB_CURL_OPTS=(--silent --show-error --fail --max-time 15 --connect-timeout 5 \
  -H 'Content-Type: application/json' -H 'Accept: application/json')

# JSON-RPC 2.0 envelope expected by MCP servers. All three calls use
# `tools/call`; payloads are minimal.
_probe_call() {
  local tool="$1" args_json="$2"
  curl "${_WB_CURL_OPTS[@]}" \
    -X POST "$WORLD_BANK_MCP_SERVER_URL" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"$tool\",\"arguments\":$args_json}}" \
    >/dev/null 2>&1
}

if ! _probe_call "search-indicators" '{"keyword":"GDP"}'; then
  WB_MCP_PROBE_ERROR="search-indicators probe failed"
  echo "WB_MCP_OK=false  # $WB_MCP_PROBE_ERROR"
  return 0 2>/dev/null || exit 0
fi

if ! _probe_call "get-country-info" '{"countryCode":"DE"}'; then
  WB_MCP_PROBE_ERROR="get-country-info probe failed"
  echo "WB_MCP_OK=false  # $WB_MCP_PROBE_ERROR"
  return 0 2>/dev/null || exit 0
fi

if ! _probe_call "get-economic-data" '{"countryCode":"DE","indicator":"GDP_GROWTH","years":5}'; then
  WB_MCP_PROBE_ERROR="get-economic-data probe failed"
  echo "WB_MCP_OK=false  # $WB_MCP_PROBE_ERROR"
  return 0 2>/dev/null || exit 0
fi

export WB_MCP_OK="true"
echo "WB_MCP_OK=true"
