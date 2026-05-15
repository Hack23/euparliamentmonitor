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
#   - Exits 0 even when all feeds fail. The script writes a canonical
#     unavailable-envelope placeholder for every failed feed, exports
#     ANALYSIS_DIR, and lets the agent decide how to proceed (MCP fallback,
#     prior-run data, etc.). This preserves the workflow's recovery contract:
#     the news-*.md workflows have no `continue-on-error: true` on the
#     prefetch step (drift-guarded in
#     `test/unit/agentic-workflows-threat-detection.test.js`), so exit-1
#     on transient upstream outages would block the agent from starting.
#
# Retry policy:
#   - Readiness probe: HEAD to EP API root before the first fetch.
#     The probe is ADVISORY — a failed probe logs a warning and proceeds
#     with per-feed GET retries (HEAD can fail independently, e.g. 405).
#     Per-feed `fetch_with_retry` is the authoritative reachability check.
#   - Per-feed retry: up to 3 retries with exponential backoff.
#     Backoff delays: 5s (retry 1), 15s (retry 2), 45s (retry 3).
#   - Always exits 0 on completion regardless of fetched/placeholder ratio
#     (downstream handles placeholders via the `status === "unavailable"`
#     contract). The summary line reports the counts for triage.
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
#   - Backoff delay uses `case` statement — no array indirect expansion
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

# ---------------------------------------------------------------------------
# EP API readiness probe — HEAD request before the first feed fetch.
# Returns 0 if the API root is reachable, 1 otherwise.
# Using --head so we get a cheap connectivity signal without downloading data.
# Output redirection (>/dev/null 2>&1) is OUTSIDE $(…) — shell-safety OK.
# ---------------------------------------------------------------------------
ep_api_probe() {
  curl -fsS --head --max-time 10 \
    "${EP_API}/meps?limit=1&format=application%2Fld%2Bjson" \
    >/dev/null 2>&1
}

# ---------------------------------------------------------------------------
# Retry-aware feed fetch.
# Shell-safety: delay values looked up with `case` — no array/indirect expansion.
# Args: $1=feed_name  $2=out_file  $3=feed_timeout_seconds
# Returns: 0 on success, 1 after all retries exhausted.
# ---------------------------------------------------------------------------
fetch_with_retry() {
  local feed_name="$1"
  local out_file="$2"
  local feed_to="$3"
  local attempt=0
  local delay=0

  while [ "$attempt" -le 3 ]; do
    if [ "$attempt" -gt 0 ]; then
      # Shell-safety: use case for delay lookup (no array indirect expansion).
      case "$attempt" in
        1) delay=5 ;;
        2) delay=15 ;;
        *) delay=45 ;;
      esac
      echo "⏳ ${feed_name}: retry ${attempt}/3 — waiting ${delay}s ..." >&2
      sleep "$delay"
    fi

    if curl -s --max-time "$feed_to" --fail \
         -H "$ACCEPT_HDR" \
         "${EP_API}/${feed_name}/feed" \
         -o "$out_file" 2>/dev/null; then
      return 0
    fi

    attempt=$((attempt + 1))
  done
  return 1
}

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

# ---------------------------------------------------------------------------
# Pre-flight readiness probe — ADVISORY ONLY. A failed HEAD probe logs a
# warning and proceeds with per-feed GET retries (fetch_with_retry is the
# authoritative reachability check; HEAD can 405 independently of GET).
# ---------------------------------------------------------------------------
if ! ep_api_probe; then
  echo "⚠️  EP API readiness probe failed (advisory) — proceeding with per-feed retries" >&2
fi

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

  if fetch_with_retry "$feed" "$out_file" "$feed_to"; then
    echo "✅ ${feed}-feed fetched (timeout=${feed_to}s)"
    FETCHED=$((FETCHED + 1))
  else
    write_unavailable_placeholder "$out_file" "$feed"
    # Print a loud DEGRADED warning to stderr so CI step output makes the
    # failure visible to the agent at Stage A (fail loudly after all retries).
    echo "❌ DEGRADED: ${feed}-feed unavailable after retries — unavailable-envelope placeholder written (timeout=${feed_to}s)" >&2
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

# Always exit 0 — placeholders preserve the workflow's recovery contract.
# When ALL feeds fail (FETCHED=0), log a clear warning so triage can flag
# the run as data-degraded, but do NOT block the agent from starting:
# downstream can use MCP fallback or prior-run analysis data.
if [ "$FETCHED" -eq 0 ] && [ "$PLACEHOLDERS" -gt 0 ]; then
  echo "⚠️  All ${PLACEHOLDERS} feed(s) failed — agent will proceed with placeholders (data-degraded run)" >&2
fi
