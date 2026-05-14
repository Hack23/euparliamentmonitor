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
#   - On fetch failure (after retries), writes a canonical "feed unavailable"
#     envelope (status:"unavailable", items:[], itemCount:0, generatedAt:<ISO>)
#     matching the EP MCP feed-status contract, so downstream analysis
#     can use a single `status === "unavailable"` check
#   - Writes ${ANALYSIS_DIR}/data/prefetch-status.json summarising the run
#     with a `prefetchMode` field (green / degraded-feeds / minimal) that
#     Stage A can read to set manifest.dataMode
#   - Exports ANALYSIS_DIR, TODAY, and PREFETCH_DATA_MODE to $GITHUB_ENV
#   - Echoes a summary line with file count
#   - Exits 2 (fail-fast) on unknown feed names — typos in workflow slug
#     /feed lists would otherwise silently disable prefetch
#
# Retry behaviour:
#   - Each feed is attempted up to MAX_RETRIES+1 times (default 3 total)
#   - Backoff delays: RETRY_DELAY_1=5s, RETRY_DELAY_2=15s, RETRY_DELAY_3=45s
#   - After all attempts are exhausted a DEGRADED message is printed to stderr
#     so the failure is clearly visible in the step output (fail loudly)
#   - The step still exits 0 so the workflow continues — the agent reads
#     the prefetch-status.json to determine data mode
#
# Per-feed timeouts:
#   - `events`  → 120s (EP API is documented as slow for this feed)
#   - default   → 60s
#
# Safety notes (AWF shell-safety filter compliance):
#   - No nested parameter expansion, no indirect expansion, no `${var@P}`
#   - No nested command substitution, no `$(cmd < file)` redirection
#   - All positional args quoted; all expansions single-level
#   - Retry delays use plain variables (no nested default-with-command-sub)
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

# Retry configuration. Each feed is attempted up to (MAX_RETRIES+1) = 3
# total times before the unavailable-envelope placeholder is written.
# Delays follow an exponential backoff: 5s → 15s → 45s.
MAX_RETRIES=2
RETRY_DELAY_1=5
RETRY_DELAY_2=15
RETRY_DELAY_3=45

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

  # Attempt the fetch with exponential-backoff retry. Up to (MAX_RETRIES+1)
  # total attempts: delays between attempts are RETRY_DELAY_1, RETRY_DELAY_2,
  # RETRY_DELAY_3 seconds respectively (5 → 15 → 45 s). Single-level variable
  # refs only — no nested expansion (shell-safety compliance).
  attempt=0
  feed_success=0
  next_delay="$RETRY_DELAY_1"
  while [ "$attempt" -le "$MAX_RETRIES" ]; do
    if curl -s --max-time "$feed_to" --fail \
         -H "$ACCEPT_HDR" \
         "${EP_API}/${feed}/feed" \
         -o "$out_file" 2>/dev/null; then
      feed_success=1
      break
    fi
    attempt=$((attempt + 1))
    if [ "$attempt" -le "$MAX_RETRIES" ]; then
      echo "⟳  ${feed}-feed attempt ${attempt}/$((MAX_RETRIES + 1)) failed — retrying in ${next_delay}s (timeout=${feed_to}s)"
      sleep "$next_delay"
      # Advance to the next backoff delay. Use case to avoid nested expansion.
      case "$next_delay" in
        "$RETRY_DELAY_1") next_delay="$RETRY_DELAY_2" ;;
        "$RETRY_DELAY_2") next_delay="$RETRY_DELAY_3" ;;
        *)                next_delay="$RETRY_DELAY_3" ;;
      esac
    fi
  done

  if [ "$feed_success" -eq 1 ]; then
    echo "✅ ${feed}-feed fetched (timeout=${feed_to}s, attempts=$((attempt + 1)))"
    FETCHED=$((FETCHED + 1))
  else
    write_unavailable_placeholder "$out_file" "$feed"
    # Print a loud degraded warning so CI step output makes the failure
    # visible to the agent at Stage A (fail loudly after all retries).
    echo "❌ DEGRADED: ${feed}-feed unavailable after $((MAX_RETRIES + 1)) attempts — unavailable-envelope placeholder written (timeout=${feed_to}s)" >&2
    PLACEHOLDERS=$((PLACEHOLDERS + 1))
  fi
done

# Determine the data mode from the prefetch results:
#   green         — all feeds fetched successfully (0 placeholders)
#   degraded-feeds — 1+ feeds unavailable after retries, but some succeeded
#   minimal        — every feed was unavailable after retries
if [ "$PLACEHOLDERS" -eq 0 ]; then
  PREFETCH_DATA_MODE="green"
elif [ "$FETCHED" -eq 0 ]; then
  PREFETCH_DATA_MODE="minimal"
else
  PREFETCH_DATA_MODE="degraded-feeds"
fi

TOTAL_FEEDS=$((FETCHED + PLACEHOLDERS))

# Write prefetch-status.json so the agent can read the degraded-mode signal
# at Stage A without parsing the step output log.
printf '{"prefetchMode":"%s","fetched":%d,"placeholders":%d,"total":%d,"generatedAt":"%s","source":"prefetch-ep-feeds.sh"}\n' \
  "$PREFETCH_DATA_MODE" "$FETCHED" "$PLACEHOLDERS" "$TOTAL_FEEDS" "$NOW_ISO" \
  > "${ANALYSIS_DIR}/data/prefetch-status.json"
echo "prefetch-status.json written: mode=${PREFETCH_DATA_MODE}, fetched=${FETCHED}, placeholders=${PLACEHOLDERS}"

# Surface env to subsequent workflow steps. Only write when running inside
# GitHub Actions (GITHUB_ENV present); harmless to skip in local invocations.
if [ -n "${GITHUB_ENV:-}" ] && [ -w "${GITHUB_ENV:-/dev/null}" ]; then
  {
    echo "ANALYSIS_DIR=${ANALYSIS_DIR}"
    echo "TODAY=${TODAY}"
    echo "PREFETCH_DATA_MODE=${PREFETCH_DATA_MODE}"
  } >> "$GITHUB_ENV"
fi

FILE_COUNT=$(find "${ANALYSIS_DIR}/data/" -maxdepth 1 -type f | wc -l)
echo "Pre-fetch complete: ${FETCHED} fetched, ${PLACEHOLDERS} placeholders, ${FILE_COUNT} total files in ${ANALYSIS_DIR}/data/"
