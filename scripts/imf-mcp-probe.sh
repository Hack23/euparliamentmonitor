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
# refer to "IMF MCP" data. In gh-aw/AWF runs the primary transport is the
# repo-local fetch-proxy MCP server, constrained to the public IMF SDMX 3.0
# REST endpoint; direct HTTPS remains the fallback for local/non-AWF runs.
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
export IMF_MCP_GATEWAY_STATUS="not-attempted"

if [ -z "${IMF_API_BASE_URL:-}" ]; then
  IMF_API_BASE_URL="https://api.imf.org/external/sdmx/3.0"
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
# Auth mode reflects which subscription key the probe carried — useful for
# diagnosing the Sept-2025 IMF Data Portal migration that gated all SDMX
# feeds behind Azure-APIM subscription keys.
if [ -n "${IMF_API_PRIMARY_KEY:-}" ]; then
  _IMF_AUTH_MODE="primary"
elif [ -n "${IMF_API_SECONDARY_KEY:-}" ]; then
  _IMF_AUTH_MODE="secondary"
else
  _IMF_AUTH_MODE="none"
fi
_IMF_DATAFLOW_QUERY="structure/dataflow"
_IMF_WEO_QUERY="data/dataflow/IMF.RES/WEO/+/EA+DEU+FRA+ITA.NGDP_RPCH+PCPIPCH+GGXCNL_NGDP.A?startPeriod=2025&endPeriod=2026&format=jsondata"

# Build curl base options. The Ocp-Apim-Subscription-Key header is added per-
# request inside the direct-curl loop below from $IMF_API_PRIMARY_KEY (and
# $IMF_API_SECONDARY_KEY on 401/403 retry).
_IMF_CURL_OPTS=(--silent --show-error --fail --max-time 30 --connect-timeout 10 \
  -H 'User-Agent: euparliamentmonitor/0.9.0 (+https://github.com/Hack23/euparliamentmonitor)' \
  -H 'Accept: application/json, application/vnd.sdmx.data+json, */*;q=0.8' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Cache-Control: no-cache')

# Use the repo-standard Node runtime for JSON escaping instead of adding a jq
# dependency to workflow containers.
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
  local endpoint_json cache_json dataflow_json weo_json error_json gw_json
  endpoint_json=$(_imf_json_string "$IMF_API_BASE_URL")
  cache_json=$(_imf_json_string "$_IMF_CACHE_DIR")
  dataflow_json=$(_imf_json_string "$_IMF_DATAFLOW_FILE")
  weo_json=$(_imf_json_string "$_IMF_WEO_FILE")
  error_json=$(_imf_json_string "$error_message")
  gw_json=$(_imf_json_string "$IMF_MCP_GATEWAY_STATUS")
  cat > "$_IMF_SUMMARY_FILE" <<EOF
{"available":$available,"source":"$source","endpoint":$endpoint_json,"auth":"$_IMF_AUTH_MODE","records":$records,"gatewayStatus":$gw_json,"queries":["$_IMF_DATAFLOW_QUERY","$_IMF_WEO_QUERY"],"cacheDir":$cache_json,"files":{"dataflow":$dataflow_json,"weo":$weo_json},"error":$error_json}
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

  # Strategy 1: Route through MCP fetch-proxy gateway (bypasses AWF Squid proxy).
  # The fetch-proxy MCP server runs in a container with direct network access.
  # EP_MCP_GATEWAY_API_KEY is optional — the gateway header is added only when
  # the key is non-empty. Requiring the key caused IMF degraded mode whenever
  # the key extraction from mcp-config.json failed silently.
  if [ -n "${FETCH_MCP_GATEWAY_URL:-}" ]; then
    tmp_out="$out.$$"
    local rpc_body
    rpc_body=$(node -e "process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'fetch_url',arguments:{url:process.argv[1]}}}))" -- "$url" 2>/dev/null)
    if [ -n "$rpc_body" ]; then
      # Build curl args — add Authorization header only when API key is available
      local _curl_auth_args=()
      if [ -n "${EP_MCP_GATEWAY_API_KEY:-}" ]; then
        _curl_auth_args=(-H "Authorization: Bearer $EP_MCP_GATEWAY_API_KEY")
      fi
      stderr_log=$(curl --silent --show-error --max-time 30 --connect-timeout 10 \
        -X POST "$FETCH_MCP_GATEWAY_URL" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json, text/event-stream" \
        "${_curl_auth_args[@]}" \
        -d "$rpc_body" \
        -o "$tmp_out" 2>&1)
      status=$?
      if [ $status -eq 0 ] && [ -s "$tmp_out" ]; then
        # Extract the text content from the JSON-RPC response
        node -e "
          const fs = require('fs');
          try {
            let raw = fs.readFileSync(process.argv[1], 'utf8').trim();
            // Handle SSE format (data: lines)
            if (raw.startsWith('data:')) {
              const lines = raw.split('\n').filter(l => l.startsWith('data:'));
              raw = lines.map(l => l.slice(5).trim()).join('');
            }
            const resp = JSON.parse(raw);
            const text = resp?.result?.content?.[0]?.text || '';
            if (text) { fs.writeFileSync(process.argv[2], text); process.exit(0); }
            else { process.exit(1); }
          } catch(e) { process.exit(1); }
        " -- "$tmp_out" "$out" 2>/dev/null
        if [ $? -eq 0 ] && [ -s "$out" ]; then
          rm -f "$tmp_out"
          IMF_MCP_GATEWAY_STATUS="ok"
          export IMF_MCP_GATEWAY_STATUS
          return 0
        fi
        # Gateway responded but content extraction failed — infrastructure issue
        IMF_MCP_GATEWAY_STATUS="error:content-extraction-failed"
        export IMF_MCP_GATEWAY_STATUS
      else
        # Gateway POST itself failed — infrastructure issue (not IMF outage)
        IMF_MCP_GATEWAY_STATUS="error:gateway-post-failed(exit=$status)"
        export IMF_MCP_GATEWAY_STATUS
      fi
      rm -f "$tmp_out"
    else
      IMF_MCP_GATEWAY_STATUS="error:rpc-body-construction-failed"
      export IMF_MCP_GATEWAY_STATUS
    fi
  fi

  # Strategy 2: Direct curl (works outside AWF sandbox or if proxy allowlist resolves).
  # Tries the primary subscription key first, falling back to the secondary
  # on 401/403 so live IMF key rotation never breaks an in-flight run.
  local _imf_keys=()
  if [ -n "${IMF_API_PRIMARY_KEY:-}" ]; then
    _imf_keys+=("$IMF_API_PRIMARY_KEY")
  fi
  if [ -n "${IMF_API_SECONDARY_KEY:-}" ] \
    && [ "${IMF_API_SECONDARY_KEY:-}" != "${IMF_API_PRIMARY_KEY:-}" ]; then
    _imf_keys+=("$IMF_API_SECONDARY_KEY")
  fi
  if [ ${#_imf_keys[@]} -eq 0 ]; then
    _imf_keys+=("")
  fi
  local _imf_attempt
  local _imf_http_status
  for _imf_attempt in "${_imf_keys[@]}"; do
    tmp_out="$out.$$"
    local _key_args=()
    if [ -n "$_imf_attempt" ]; then
      _key_args=(-H "Ocp-Apim-Subscription-Key: $_imf_attempt")
    fi
    # `--fail` returns exit 22 for 4xx/5xx; capture %{http_code} via -w so
    # we can tell auth-class failures (401/403) from other errors and only
    # retry on the former.
    _imf_http_status=$(curl --silent --show-error --max-time 30 --connect-timeout 10 \
      -H 'User-Agent: euparliamentmonitor/0.9.0 (+https://github.com/Hack23/euparliamentmonitor)' \
      -H 'Accept: application/json, application/vnd.sdmx.data+json, */*;q=0.8' \
      -H 'Accept-Language: en-US,en;q=0.9' \
      -H 'Cache-Control: no-cache' \
      "${_key_args[@]}" \
      -o "$tmp_out" -w '%{http_code}' \
      -X GET "$url" 2>/dev/null) || _imf_http_status="000"
    if [ "$_imf_http_status" = "200" ] && [ -s "$tmp_out" ]; then
      mv "$tmp_out" "$out"
      return 0
    fi
    rm -f "$tmp_out"
    if [ "$_imf_http_status" = "401" ] || [ "$_imf_http_status" = "403" ]; then
      # Auth-class — retry with the next configured key (if any).
      continue
    fi
    break
  done
  IMF_MCP_PROBE_ERROR="GET $url failed (HTTP $_imf_http_status)"
  return 1
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
