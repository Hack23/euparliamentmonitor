#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# Workflow elapsed-time helper.
#
# Reads WORKFLOW_START_EPOCH (set at Stage A by
# .github/workflows/shared/prompts/news-unified-stages.md) and a hard cap
# WORKFLOW_TIMEOUT_MIN (defaults to 60 — the news-*.md `timeout-minutes:`
# value) and emits one of three outputs the agent can consume from any
# bash block.
#
# Modes
# -----
#   env       (default) — print eval-able shell assignments:
#                   ELAPSED_MIN=<int>
#                   REMAINING_MIN=<int>
#                   WORKFLOW_TIMEOUT_MIN=<int>
#                 Suitable for `eval "$(bash scripts/gh-aw-workflow-elapsed.sh)"`.
#
#   status    — print one structured human-readable log line:
#                   TIME_STATUS: elapsed=<N>m remaining=<N>m timeout=<N>m
#                                stage=<STAGE> tripwire=<NAME>:<MIN>m budget=<DELTA>m
#                 Intended for stdout breadcrumbs the agent emits between
#                 long operations so the run log shows time pressure.
#
#   guard     — exit 0 if the named tripwire has NOT been crossed yet,
#               exit 1 if it has. Used to short-circuit slow operations:
#                   bash scripts/gh-aw-workflow-elapsed.sh guard --tripwire 36 \
#                     || { echo "Stage C tripwire crossed — skip Pass 3"; ... }
#
# Inputs
# ------
#   WORKFLOW_START_EPOCH  — Unix epoch seconds, set at Stage A. If unset,
#                           the script falls back to `date -u +%s` at first
#                           invocation (cached to /tmp/gh-aw/workflow-start-epoch),
#                           which is correct for the news-translate flow that
#                           writes that file itself, and a safe lower bound
#                           for any caller that forgets to export.
#   WORKFLOW_TIMEOUT_MIN  — Hard cap in minutes; default 60.
#
# Inputs (status / guard mode only)
# ---------------------------------
#   --stage <name>      — Optional stage label echoed back in status output
#                         (e.g. "B1", "B2", "C", "D", "E"). Defaults to "?".
#   --tripwire <minutes> — Per-stage elapsed-minute tripwire (required by
#                          `guard`, optional for `status`). For `guard`,
#                          exits non-zero when ELAPSED_MIN >= tripwire.
#   --name <label>      — Optional human label for the tripwire (e.g.
#                          "stage-c-exit", "pr-deadline"). Echoed in status.
#
# This script is intentionally side-effect-free:
#   - Never writes to $GITHUB_ENV (Stage A already owns that).
#   - Never exits non-zero in env / status mode.
#   - guard mode exits non-zero ONLY when the tripwire is genuinely crossed.
#
# Shell-safety: no nested ${…${…}} expansions, no eval, no $(cmd <file).
# See .github/prompts/00-scope-and-ground-rules.md §47.

set -euo pipefail

MODE="${1:-env}"
case "$MODE" in
  env|status|guard) shift || true ;;
  -h|--help)
    sed -n '2,55p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
    ;;
  *) MODE="env" ;;
esac

STAGE="?"
TRIPWIRE=""
TRIP_NAME=""
while [ $# -gt 0 ]; do
  case "$1" in
    --stage)    STAGE="${2:-?}"; shift 2 ;;
    --tripwire) TRIPWIRE="${2:-}"; shift 2 ;;
    --name)     TRIP_NAME="${2:-}"; shift 2 ;;
    *) shift ;;
  esac
done

# Establish start epoch. Stage A's news-unified-stages.md exports
# WORKFLOW_START_EPOCH into $GITHUB_ENV, which GitHub Actions re-imports
# into every subsequent step. The fallback below is for ad-hoc invocations
# (tests, news-translate which writes its own /tmp file).
START_EPOCH="${WORKFLOW_START_EPOCH:-}"
START_FILE="${GH_AW_WORKFLOW_START_FILE:-/tmp/gh-aw/workflow-start-epoch}"
if [ -z "$START_EPOCH" ] && [ -r "$START_FILE" ]; then
  # Read first non-whitespace line of the cache file. We pipe through `cat`
  # rather than using `$(head -n1 < "$START_FILE")` because input redirection
  # inside `$(...)` is blocked by the AWF sandbox shell-safety filter
  # (`scripts/gh-aw-workflow-elapsed.sh` is invoked from agentic-workflow
  # post-steps that run under the same filter). See
  # `.github/prompts/00-scope-and-ground-rules.md` §47.
  START_EPOCH=$(cat "$START_FILE" 2>/dev/null | head -n1 | tr -d '[:space:]')
fi
if [ -z "$START_EPOCH" ]; then
  # Best-effort lower bound: assume "now" is the start. Caller still gets
  # ELAPSED_MIN=0 / REMAINING_MIN=$WORKFLOW_TIMEOUT_MIN, which is safe.
  START_EPOCH=$(date -u +%s)
  mkdir -p "$(dirname "$START_FILE")" 2>/dev/null || true
  printf '%s\n' "$START_EPOCH" > "$START_FILE" 2>/dev/null || true
fi

# Numeric guards: anything non-integer collapses to 0 / 60 rather than
# blowing up the agent's bash block.
case "$START_EPOCH" in
  ''|*[!0-9]*) START_EPOCH=$(date -u +%s) ;;
esac
TIMEOUT_MIN="${WORKFLOW_TIMEOUT_MIN:-60}"
case "$TIMEOUT_MIN" in
  ''|*[!0-9]*) TIMEOUT_MIN=60 ;;
esac

NOW_EPOCH=$(date -u +%s)
ELAPSED_SEC=$(( NOW_EPOCH - START_EPOCH ))
[ "$ELAPSED_SEC" -lt 0 ] && ELAPSED_SEC=0
ELAPSED_MIN=$(( ELAPSED_SEC / 60 ))
REMAINING_MIN=$(( TIMEOUT_MIN - ELAPSED_MIN ))
[ "$REMAINING_MIN" -lt 0 ] && REMAINING_MIN=0

# Validate optional --tripwire as a non-negative integer.
TRIPWIRE_OK=""
case "$TRIPWIRE" in
  '') TRIPWIRE_OK="" ;;
  *[!0-9]*) TRIPWIRE_OK="" ;;
  *) TRIPWIRE_OK="1" ;;
esac

emit_env() {
  printf 'ELAPSED_MIN=%d\n' "$ELAPSED_MIN"
  printf 'REMAINING_MIN=%d\n' "$REMAINING_MIN"
  printf 'WORKFLOW_TIMEOUT_MIN=%d\n' "$TIMEOUT_MIN"
}

emit_status() {
  if [ -n "$TRIPWIRE_OK" ]; then
    BUDGET=$(( TRIPWIRE - ELAPSED_MIN ))
    LABEL="${TRIP_NAME:-tripwire}"
    printf 'TIME_STATUS: elapsed=%dm remaining=%dm timeout=%dm stage=%s tripwire=%s:%dm budget=%dm\n' \
      "$ELAPSED_MIN" "$REMAINING_MIN" "$TIMEOUT_MIN" "$STAGE" "$LABEL" "$TRIPWIRE" "$BUDGET"
  else
    printf 'TIME_STATUS: elapsed=%dm remaining=%dm timeout=%dm stage=%s\n' \
      "$ELAPSED_MIN" "$REMAINING_MIN" "$TIMEOUT_MIN" "$STAGE"
  fi
}

case "$MODE" in
  env)    emit_env ;;
  status) emit_status ;;
  guard)
    if [ -z "$TRIPWIRE_OK" ]; then
      echo "gh-aw-workflow-elapsed: guard mode requires --tripwire <minutes>" >&2
      exit 2
    fi
    if [ "$ELAPSED_MIN" -ge "$TRIPWIRE" ]; then
      LABEL="${TRIP_NAME:-tripwire}"
      printf 'TIME_TRIPWIRE_CROSSED: %s at elapsed=%dm tripwire=%dm remaining=%dm\n' \
        "$LABEL" "$ELAPSED_MIN" "$TRIPWIRE" "$REMAINING_MIN" >&2
      exit 1
    fi
    exit 0
    ;;
esac
