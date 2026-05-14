#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# prefetch-ep-feeds.sh — Deterministic pre-agent fetch of European Parliament
# Open Data feeds, used by every news-*.md article workflow to reduce the
# agent's data-gathering invocations and stay under the Copilot CAPI 100-
# invocation hard cap.
#
# Background: gh-aw audit of run 25799686522 (news-propositions) showed the
# agent hit `CAPIError: 429 Maximum LLM invocations exceeded (100/100)`.
# ~50% of invocations were spent on EP MCP data-gathering. Moving the
# feed fetches into a deterministic pre-agent step saves ~10-15 invocations
# per workflow run, leaving more budget for Stage B artifact writing.
# See `.github/prompts/09-troubleshooting.md` §5 (run 25799686522 row).
#
# Usage:
#   bash scripts/prefetch-ep-feeds.sh <slug> <feed1> [<feed2> ...]
#
# Positional args:
#   1. slug    — article-type slug (passed to resolve-analysis-dir.sh)
#   2..N feeds — canonical EP API feed names (one per call). Allowed:
#       procedures, documents, external-documents, committee-documents,
#       events, adopted-texts, meps, meps-declarations,
#       parliamentary-questions, plenary-documents, plenary-session-documents,
#       controlled-vocabularies, corporate-bodies
#
# Output:
#   - Writes one JSON file per feed to ${ANALYSIS_DIR}/data/<feed>-feed.json
#   - On fetch failure, writes a canonical "feed unavailable" envelope
#     (status:"unavailable", items:[], itemCount:0, generatedAt:<ISO>)
#     matching the EP MCP feed-status contract, so downstream analysis
#     can use a single `status === "unavailable"` check
#   - Exports ANALYSIS_DIR and TODAY to $GITHUB_ENV for subsequent steps
#   - Echoes a summary line with file count
#   - Exits 2 (fail-fast) on unknown feed names — typos in workflow slug
#     /feed lists would otherwise silently disable prefetch
#
# Per-feed timeouts:
#   - `events`  → 120s (EP API is documented as slow for this feed)
#   - default   → 60s
#
# Safety notes (AWF shell-safety filter compliance):
#   - No nested parameter expansion, no indirect expansion, no `${var@P}`
#   - No nested command substitution, no `$(cmd < file)` redirection
#   - All positional args quoted; all expansions single-level
#
# Drift-guarded by test/unit/shell-safety.test.js.

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "usage: $0 <slug> <feed1> [<feed2> ...]" >&2
  exit 2
fi

SLUG="$1"
shift

EP_API="https://data.europarl.europa.eu/api/v2"
ACCEPT_HDR="Accept: application/ld+json"

# Per-feed connection timeouts (seconds). `events` is documented as slow
# (often 30–120s+ — see .github/prompts/09-troubleshooting.md and the EP
# MCP `get_events_feed` tool description). Procedure and document feeds
# return quickly. Defaults below leave enough head-room that placeholders
# are only written for true upstream outages, not transient slowness.
TIMEOUT_EVENTS=120
TIMEOUT_DEFAULT=60

feed_timeout() {
  case "$1" in
    events) printf '%s' "$TIMEOUT_EVENTS" ;;
    *)      printf '%s' "$TIMEOUT_DEFAULT" ;;
  esac
}

TODAY=$(date -u +%Y-%m-%d)
NOW_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
SCRIPT_DIR=$(dirname -- "$0")
ANALYSIS_DIR=$(bash "$SCRIPT_DIR/resolve-analysis-dir.sh" "$TODAY" "$SLUG")

# Allow-list of canonical EP API feed names. Maps 1:1 to the EP API path
# (just append `/feed`). Locked to prevent typos that would silently miss
# the upstream endpoint.
is_allowed_feed() {
  case "$1" in
    procedures|documents|external-documents|committee-documents|\
events|adopted-texts|meps|meps-declarations|\
parliamentary-questions|plenary-documents|plenary-session-documents|\
controlled-vocabularies|corporate-bodies)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# Write the canonical "feed unavailable" envelope. Matches the shape the
# EP MCP client surfaces when an upstream feed returns no data (see
# `.github/workflows/shared/mcp/news-mcp-servers.md` feed-status contract):
#   { "status": "unavailable", "items": [], "itemCount": 0, "generatedAt": <ISO> }
# Keeping the same shape means downstream analysis prompts can use a
# single `status === "unavailable"` check without per-source schema branches.
#
# The `source: "prefetch-ep-feeds.sh"` field distinguishes prefetch-generated
# placeholders from EP MCP-generated unavailable responses, so downstream
# analysis (and post-mortem audits) can identify which layer produced the
# placeholder — useful when triaging why a feed showed up unavailable.
write_unavailable_placeholder() {
  local out_file="$1"
  local feed_name="$2"
  printf '{"status":"unavailable","items":[],"itemCount":0,"generatedAt":"%s","feed":"%s","source":"prefetch-ep-feeds.sh"}\n' \
    "$NOW_ISO" "$feed_name" > "$out_file"
}

FETCHED=0
PLACEHOLDERS=0

# Maximum feed file size in KB. Files larger than this are truncated to
# prevent the agent from ingesting oversized JSON into its context window,
# which inflates effective-token consumption and triggers org-level ET rate
# limits (e.g. run 25844831888: 98.1M ET with claude-sonnet-4.6 at 9× multiplier).
# 200 KB per feed × 4 feeds = ~800 KB total — well within the context budget.
MAX_FEED_SIZE_KB=200

# Truncate oversized feed files to MAX_FEED_SIZE_KB. Cuts at a line boundary
# and closes the JSON array so the file remains parseable (best-effort).
truncate_if_oversized() {
  local file="$1"
  local feed_name="$2"
  if [ ! -f "$file" ]; then
    return
  fi
  local size_kb
  size_kb=$(du -k "$file" | cut -f1)
  if [ "$size_kb" -gt "$MAX_FEED_SIZE_KB" ]; then
    local orig_size_kb="$size_kb"
    # Keep first MAX_FEED_SIZE_KB * 1024 bytes, cut at last newline
    head -c "$((MAX_FEED_SIZE_KB * 1024))" "$file" > "${file}.tmp"
    # Best-effort JSON closure: if the truncated content ends mid-array,
    # append a closing bracket so downstream JSON.parse doesn't hard-fail.
    # This is acceptable because the agent only needs a representative
    # sample of feed items, not the complete set.
    if grep -q '^\[' "${file}.tmp" 2>/dev/null || grep -q '"items"' "${file}.tmp" 2>/dev/null; then
      printf '\n]\n}\n' >> "${file}.tmp"
    fi
    mv "${file}.tmp" "$file"
    echo "✂️  ${feed_name}-feed truncated: ${orig_size_kb} KB → ≤${MAX_FEED_SIZE_KB} KB (ET budget protection)"
  fi
}

for feed in "$@"; do
  if ! is_allowed_feed "$feed"; then
    # Fail fast on unknown feed name: this is a workflow configuration bug
    # (typo in the slug/feed list) and silently skipping would reintroduce
    # the invocation-cap problem this script exists to solve. Exit 2 so
    # the calling step fails loudly (continue-on-error is intentionally
    # NOT set on the prefetch step in any article workflow).
    echo "❌ unknown feed name: $feed" >&2
    exit 2
  fi
  out_file="${ANALYSIS_DIR}/data/${feed}-feed.json"
  feed_to=$(feed_timeout "$feed")
  if curl -s --max-time "$feed_to" --fail \
       -H "$ACCEPT_HDR" \
       "${EP_API}/${feed}/feed" \
       -o "$out_file" 2>/dev/null; then
    echo "✅ ${feed}-feed fetched (timeout=${feed_to}s)"
    truncate_if_oversized "$out_file" "$feed"
    FETCHED=$((FETCHED + 1))
  else
    write_unavailable_placeholder "$out_file" "$feed"
    echo "⚠️  ${feed}-feed unavailable — unavailable-envelope placeholder written (timeout=${feed_to}s)"
    PLACEHOLDERS=$((PLACEHOLDERS + 1))
  fi
done

# Surface env to subsequent workflow steps. Only write when running inside
# GitHub Actions (GITHUB_ENV present); harmless to skip in local invocations.
if [ -n "${GITHUB_ENV:-}" ] && [ -w "${GITHUB_ENV:-/dev/null}" ]; then
  {
    echo "ANALYSIS_DIR=${ANALYSIS_DIR}"
    echo "TODAY=${TODAY}"
  } >> "$GITHUB_ENV"
fi

FILE_COUNT=$(find "${ANALYSIS_DIR}/data/" -maxdepth 1 -type f | wc -l)
echo "Pre-fetch complete: ${FETCHED} fetched, ${PLACEHOLDERS} placeholders, ${FILE_COUNT} total files in ${ANALYSIS_DIR}/data/"
