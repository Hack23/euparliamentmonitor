#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# AWF firewall diagnostic — produces the bash output used in noop messages.
# Referenced from .github/prompts/09-troubleshooting.md and
# .github/prompts/06-pr-and-safe-outputs.md.

set -u

echo "=== AWF FIREWALL DIAGNOSTIC ==="
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 1. DNS resolution
echo "--- DNS Resolution ---"
if command -v getent >/dev/null 2>&1; then
  DNS_OUT=$(getent hosts data.europarl.europa.eu 2>/dev/null | head -5)
  if [ -n "$DNS_OUT" ]; then
    printf '%s\n' "$DNS_OUT"
  else
    echo "DNS FAILED (getent)"
  fi
elif command -v nslookup >/dev/null 2>&1; then
  NS_OUT=$(nslookup data.europarl.europa.eu 2>&1 | head -5)
  if [ -n "$NS_OUT" ]; then
    printf '%s\n' "$NS_OUT"
  else
    echo "DNS FAILED (nslookup)"
  fi
else
  echo "DNS FAILED: no resolver tool available"
fi

# 2. MCP gateway connectivity
echo "--- MCP Gateway Connectivity ---"
if [ -f "scripts/mcp-setup.sh" ]; then
  # shellcheck disable=SC1091
  source scripts/mcp-setup.sh >/dev/null 2>&1 || true
fi
if [ -n "${EP_MCP_GATEWAY_URL:-}" ]; then
  AUTH_HEADER=()
  if [ -n "${EP_MCP_GATEWAY_API_KEY:-}" ]; then
    # Mirror the auth-header behavior of src/mcp/mcp-connection.ts
    # (_buildAuthorizationHeader): pass pre-prefixed keys (e.g. "Bearer …")
    # through unchanged, otherwise prepend EP_MCP_GATEWAY_AUTH_SCHEME if set
    # to a valid RFC 7235 token, else send the raw key.
    _auth_key="${EP_MCP_GATEWAY_API_KEY}"
    # Strip leading/trailing whitespace
    _auth_key="${_auth_key#"${_auth_key%%[![:space:]]*}"}"
    _auth_key="${_auth_key%"${_auth_key##*[![:space:]]}"}"
    _auth_value="${_auth_key}"
    if [ -n "${_auth_key}" ]; then
      _first_token="${_auth_key%% *}"
      if [ "${_first_token}" != "${_auth_key}" ] && \
         printf '%s' "${_first_token}" | grep -Eq "^[!#\$%&'*+.^_\`|~0-9A-Za-z-]+$"; then
        # Already scheme-prefixed (e.g. "Bearer xyz") — pass through unchanged
        _auth_value="${_auth_key}"
      elif [ -n "${EP_MCP_GATEWAY_AUTH_SCHEME:-}" ] && \
           printf '%s' "${EP_MCP_GATEWAY_AUTH_SCHEME}" | \
           grep -Eq "^[!#\$%&'*+.^_\`|~0-9A-Za-z-]+$"; then
        _auth_value="${EP_MCP_GATEWAY_AUTH_SCHEME} ${_auth_key}"
      fi
    fi
    AUTH_HEADER=(-H "Authorization: ${_auth_value}")
  fi
  GW_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 \
    -H "Content-Type: application/json" \
    "${AUTH_HEADER[@]}" \
    -X POST -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl-diag","version":"1.0.0"}}}' \
    "${EP_MCP_GATEWAY_URL}" 2>/dev/null)
  GW_EXIT=$?
  echo "MCP Gateway: HTTP ${GW_STATUS:-000} (curl exit ${GW_EXIT})"
  echo "MCP Gateway URL: ${EP_MCP_GATEWAY_URL}"
  if [ -n "${EP_MCP_GATEWAY_API_KEY:-}" ]; then
    echo "MCP Gateway Auth: SET"
  else
    echo "MCP Gateway Auth: NOT SET"
  fi
  echo "MCP Client Timeout: ${MCP_CLIENT_TIMEOUT_MS:-NOT SET}ms"
else
  echo "⚠️ EP_MCP_GATEWAY_URL not set — mcp-setup.sh may have failed"
fi

# 3. Direct EP API HTTP
echo "--- EP API Direct HTTP ---"
EP_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" \
  --connect-timeout 10 --max-time 120 \
  "https://data.europarl.europa.eu/api/v2/meps?format=application%2Fld%2Bjson&offset=0&limit=1" 2>/dev/null)
EP_EXIT=$?
case "$EP_EXIT" in
  0)  echo "EP API HTTP Status: ${EP_STATUS:-000}" ;;
  6)  echo "EP API HTTP Status: ${EP_STATUS:-000} (curl exit 6: DNS resolution failed)" ;;
  7)  echo "EP API HTTP Status: ${EP_STATUS:-000} (curl exit 7: connection failed)" ;;
  28) echo "EP API HTTP Status: ${EP_STATUS:-000} (curl exit 28: operation timed out)" ;;
  *)  echo "EP API HTTP Status: ${EP_STATUS:-000} (curl exit ${EP_EXIT}: transport/TLS error)" ;;
esac

# 4. MCP server binary
echo "--- MCP Server Binary ---"
if command -v european-parliament-mcp-server >/dev/null 2>&1; then
  command -v european-parliament-mcp-server
elif [ -f "node_modules/.bin/european-parliament-mcp-server" ]; then
  echo "node_modules/.bin/european-parliament-mcp-server"
else
  echo "MCP binary NOT FOUND — npx will install it"
fi

# 5. TCP reachability
echo "--- Network Connectivity ---"
for host in data.europarl.europa.eu github.com api.github.com; do
  if timeout 5 bash -c "echo >/dev/tcp/$host/443" 2>/dev/null; then
    echo "$host:443 REACHABLE"
  else
    echo "$host:443 UNREACHABLE (AWF firewall?)"
  fi
done

# 6. Environment
echo "--- MCP Environment ---"
echo "EP_REQUEST_TIMEOUT_MS=${EP_REQUEST_TIMEOUT_MS:-NOT SET (default 180000; see src/mcp/mcp-connection.ts DEFAULT_REQUEST_TIMEOUT_MS)}"
echo "NODE_ENV=${NODE_ENV:-not set}"
