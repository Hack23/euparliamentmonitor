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
#   - On fetch failure, writes a `{"items":[]}` placeholder so the agent
#     can detect "feed unavailable" without retrying via MCP
#   - Exports ANALYSIS_DIR and TODAY to $GITHUB_ENV for subsequent steps
#   - Echoes a summary line with file count
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
TIMEOUT_SECS=30

TODAY=$(date -u +%Y-%m-%d)
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

FETCHED=0
PLACEHOLDERS=0
for feed in "$@"; do
  if ! is_allowed_feed "$feed"; then
    echo "❌ unknown feed name: $feed (skipping)" >&2
    continue
  fi
  out_file="${ANALYSIS_DIR}/data/${feed}-feed.json"
  if curl -s --max-time "$TIMEOUT_SECS" --fail \
       -H "$ACCEPT_HDR" \
       "${EP_API}/${feed}/feed" \
       -o "$out_file" 2>/dev/null; then
    echo "✅ ${feed}-feed fetched"
    FETCHED=$((FETCHED + 1))
  else
    echo '{"items":[]}' > "$out_file"
    echo "⚠️  ${feed}-feed unavailable — empty placeholder written"
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
