#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# @module imf-mcp-probe
# @description Non-blocking connectivity and cache probe for the IMF SDMX 3.0
# REST API used by the native TypeScript IMF client.
#
# Usage (in workflow bash blocks, after `source scripts/mcp-setup.sh`):
#
#   scripts/imf-mcp-probe.sh
#
# The historical filename is retained for compatibility with prompts that
# refer to "IMF MCP" data. The transport is direct HTTPS to the public IMF
# SDMX 3.0 REST endpoint; no API key is required and no MCP gateway is used.
#
# Sets when sourced:
#   IMF_MCP_OK — "true" on success or cache hit, "false" otherwise.
#   IMF_MCP_PROBE_ERROR — diagnostic string when IMF_MCP_OK=false.
#   IMF_MCP_CACHE_DIR — cache directory used by the probe.
#   IMF_MCP_RECORDS — parsed observation count from the canonical WEO slice.
#
# Output:
#   Always emits a single JSON object and exits/returns 0. Failure is reported
#   as {"available":false}; Stage A must never abort because IMF is slow.

export IMF_MCP_OK="false"
export IMF_MCP_PROBE_ERROR=""
export IMF_MCP_RECORDS="0"

if [ -z "${IMF_API_BASE_URL:-}" ]; then
  IMF_API_BASE_URL="https://dataservices.imf.org/REST/SDMX_3.0"
fi
export IMF_API_BASE_URL

if [ -n "${ANALYSIS_DIR:-}" ]; then
  _IMF_CACHE_DIR="$ANALYSIS_DIR/cache/imf"
elif [ -n "${TODAY:-}" ] && [ -n "${ARTICLE_TYPE_SLUG:-}" ]; then
  _IMF_CACHE_DIR="analysis/daily/$TODAY/$ARTICLE_TYPE_SLUG/cache/imf"
else
  _IMF_CACHE_DIR=$(mktemp -d)
fi
export IMF_MCP_CACHE_DIR="$_IMF_CACHE_DIR"

mkdir -p "$_IMF_CACHE_DIR" 2>/dev/null || true

_IMF_DATAFLOW_FILE="$_IMF_CACHE_DIR/dataflow-imf.json"
_IMF_WEO_FILE="$_IMF_CACHE_DIR/weo-ea-deu-fra-ita-gdp-inflation-fiscal.json"
_IMF_SUMMARY_FILE="$_IMF_CACHE_DIR/imf-probe-summary.json"
_IMF_AUTH_MODE="none"
_IMF_DATAFLOW_QUERY="dataflow/IMF"
_IMF_WEO_QUERY="data/WEO/EA+DEU+FRA+ITA.NGDP_RPCH+PCPIPCH+GGXCNL_NGDP.A?startPeriod=2025&endPeriod=2026&format=jsondata"

_IMF_CURL_OPTS=(--silent --show-error --fail --max-time 15 --connect-timeout 5 \
  -H 'Accept: application/json')

_imf_json_string() {
  node -e 'process.stdout.write(JSON.stringify(process.argv[1] || ""));' -- "$1" 2>/dev/null \
    || printf '""'
}

_imf_count_observations() {
  local file_path="$1"
  node -e '
const fs = require("fs");
let count = 0;
try {
  const payload = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const dataSets = payload && payload.data && Array.isArray(payload.data.dataSets)
    ? payload.data.dataSets
    : [];
  for (const dataSet of dataSets) {
    if (dataSet && dataSet.observations && typeof dataSet.observations === "object") {
      count += Object.keys(dataSet.observations).length;
    }
    const series = dataSet && dataSet.series && typeof dataSet.series === "object"
      ? dataSet.series
      : {};
    for (const row of Object.values(series)) {
      if (row && row.observations && typeof row.observations === "object") {
        count += Object.keys(row.observations).length;
      }
    }
  }
} catch {
  count = 0;
}
process.stdout.write(String(count));
' -- "$file_path" 2>/dev/null || printf '0'
}

_imf_write_summary() {
  local available="$1" source="$2" error_message="$3" records="$4"
  local endpoint_json cache_json dataflow_json weo_json error_json
  endpoint_json=$(_imf_json_string "$IMF_API_BASE_URL")
  cache_json=$(_imf_json_string "$_IMF_CACHE_DIR")
  dataflow_json=$(_imf_json_string "$_IMF_DATAFLOW_FILE")
  weo_json=$(_imf_json_string "$_IMF_WEO_FILE")
  error_json=$(_imf_json_string "$error_message")
  cat > "$_IMF_SUMMARY_FILE" <<EOF
{"available":$available,"source":"$source","endpoint":$endpoint_json,"auth":"$_IMF_AUTH_MODE","records":$records,"queries":["$_IMF_DATAFLOW_QUERY","$_IMF_WEO_QUERY"],"cacheDir":$cache_json,"files":{"dataflow":$dataflow_json,"weo":$weo_json},"error":$error_json}
EOF
  cat "$_IMF_SUMMARY_FILE"
}

_imf_finish() {
  local ok="$1" source="$2" error_message="$3" records="$4"
  IMF_MCP_RECORDS="$records"
  export IMF_MCP_RECORDS
  if [ "$ok" = "true" ]; then
    IMF_MCP_OK="true"
    export IMF_MCP_OK
    _imf_write_summary "true" "$source" "" "$records"
  else
    IMF_MCP_OK="false"
    IMF_MCP_PROBE_ERROR="$error_message"
    export IMF_MCP_OK IMF_MCP_PROBE_ERROR
    _imf_write_summary "false" "$source" "$error_message" "$records"
  fi
}

_imf_fetch_to_file() {
  local url="$1" out="$2" stderr_log status tmp_out
  tmp_out="$out.$$"
  stderr_log=$(curl "${_IMF_CURL_OPTS[@]}" -X GET "$url" -o "$tmp_out" 2>&1)
  status=$?
  if [ $status -ne 0 ]; then
    rm -f "$tmp_out"
    IMF_MCP_PROBE_ERROR="GET $url failed (exit $status): ${stderr_log%%$'\n'*}"
    return $status
  fi
  mv "$tmp_out" "$out"
  return 0
}

if [ -s "$_IMF_DATAFLOW_FILE" ] && [ -s "$_IMF_WEO_FILE" ]; then
  _IMF_RECORDS=$(_imf_count_observations "$_IMF_WEO_FILE")
  if [ "$_IMF_RECORDS" -gt 0 ] 2>/dev/null; then
    _imf_finish "true" "cache" "" "$_IMF_RECORDS"
    return 0 2>/dev/null || exit 0
  fi
fi

if ! _imf_fetch_to_file "$IMF_API_BASE_URL/$_IMF_DATAFLOW_QUERY" "$_IMF_DATAFLOW_FILE"; then
  _IMF_ERROR="$IMF_MCP_PROBE_ERROR"
  if [ -z "$_IMF_ERROR" ]; then
    _IMF_ERROR="dataflow/IMF probe failed"
  fi
  _imf_finish "false" "live" "$_IMF_ERROR" "0"
  return 0 2>/dev/null || exit 0
fi

if ! _imf_fetch_to_file "$IMF_API_BASE_URL/$_IMF_WEO_QUERY" "$_IMF_WEO_FILE"; then
  _IMF_ERROR="$IMF_MCP_PROBE_ERROR"
  if [ -z "$_IMF_ERROR" ]; then
    _IMF_ERROR="canonical WEO fetch probe failed"
  fi
  _imf_finish "false" "live" "$_IMF_ERROR" "0"
  return 0 2>/dev/null || exit 0
fi

_IMF_RECORDS=$(_imf_count_observations "$_IMF_WEO_FILE")
if [ "$_IMF_RECORDS" -gt 0 ] 2>/dev/null; then
  _imf_finish "true" "live" "" "$_IMF_RECORDS"
  return 0 2>/dev/null || exit 0
fi

_imf_finish "false" "live" "canonical WEO fetch returned no observations" "0"
return 0 2>/dev/null || exit 0
