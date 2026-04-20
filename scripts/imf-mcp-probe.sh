#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# @module imf-mcp-probe
# @description Connectivity probe for the IMF SDMX 3.0 REST API used by
# the native TypeScript IMF client (`src/mcp/imf-mcp-client.ts`). No MCP
# server is involved — the probe curls the IMF endpoint directly, in
# the same way the TypeScript client does at runtime.
#
# The script keeps its historical "imf-mcp-probe" filename so the ten
# agentic-workflow prompts that already `source scripts/imf-mcp-probe.sh`
# (and read `IMF_MCP_OK` / `IMF_MCP_PROBE_ERROR` afterwards) do not
# change contract. The only change is the transport: upstream is now
# IMF REST, not MCP/JSON-RPC.
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
# Budget: max 2 outbound HTTP calls (dataflow list + a 1-cell WEO
# fetch). The probe honours `IMF_API_BASE_URL` exported by
# `mcp-setup.sh`. IMF SDMX 3.0 is an unauthenticated public endpoint —
# no API key is sent.

export IMF_MCP_OK="false"
export IMF_MCP_PROBE_ERROR=""

IMF_API_BASE_URL="${IMF_API_BASE_URL:-https://dataservices.imf.org/REST/SDMX_3.0}"

# Use curl with a short connect timeout so the probe cannot block the
# workflow. Per-call budget: 15 s. Two calls → max 30 s wall-clock.
_IMF_CURL_OPTS=(--silent --show-error --fail --max-time 15 --connect-timeout 5 \
  -H 'Accept: application/json')

_imf_probe_url() {
  local url="$1" stderr_log
  stderr_log=$(curl "${_IMF_CURL_OPTS[@]}" -X GET "$url" -o /dev/null 2>&1)
  local status=$?
  if [ $status -ne 0 ]; then
    IMF_MCP_PROBE_ERROR="GET $url failed (exit $status): ${stderr_log%%$'\n'*}"
    return $status
  fi
  return 0
}

# Probe 1: dataflow list (cheap — under 20 KB).
if ! _imf_probe_url "$IMF_API_BASE_URL/dataflow/IMF"; then
  [ -n "$IMF_MCP_PROBE_ERROR" ] || IMF_MCP_PROBE_ERROR="dataflow/IMF probe failed"
  echo "IMF_MCP_OK=false  # $IMF_MCP_PROBE_ERROR"
  return 0 2>/dev/null || exit 0
fi

# Probe 2: single WEO real-GDP-growth cell for Germany in 2025. A
# single-cell fetch exercises the full URL / SDMX-JSON path without
# stressing the IMF rate limiter.
if ! _imf_probe_url \
  "$IMF_API_BASE_URL/data/WEO/DEU.NGDP_RPCH.A?startPeriod=2025&endPeriod=2025&format=jsondata"; then
  [ -n "$IMF_MCP_PROBE_ERROR" ] || IMF_MCP_PROBE_ERROR="WEO fetch probe failed"
  echo "IMF_MCP_OK=false  # $IMF_MCP_PROBE_ERROR"
  return 0 2>/dev/null || exit 0
fi

export IMF_MCP_OK="true"
echo "IMF_MCP_OK=true"
