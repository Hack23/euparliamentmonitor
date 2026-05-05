#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# resolve-analysis-dir.sh — echo the canonical stable same-day analysis folder
# for a given date + article-type slug, and ensure the expected subdirectories
# exist.
#
# Usage:
#   scripts/resolve-analysis-dir.sh <date> <article-type-slug>
#
# Positional args:
#   1. date                 — ISO date in YYYY-MM-DD form (e.g. 2026-04-22)
#   2. article-type-slug    — one of: breaking | committee-reports |
#                             propositions | motions | week-ahead |
#                             month-ahead | week-in-review | month-in-review |
#                             quarter-in-review | quarter-ahead |
#                             year-in-review | year-ahead |
#                             election-cycle | deep-analysis | term-outlook
#
# Output:
#   Echoes the absolute folder path, e.g.
#     /repo/analysis/daily/2026-04-22/breaking
#   and creates the standard subdirs (data, documents, existing,
#   classification, threat-assessment, risk-scoring, intelligence, runs).
#
# Safety notes (AWF shell-safety filter compliance):
#   - No nested parameter expansion like "${var#${other}/}".
#   - No nested command substitution like "$(cmd $(inner))".
#   - No indirect expansion, no "${var@P}", no eval.
#   - All positional arguments are quoted; all expansions are single-level.
#
# Drift-guarded by test/unit/shell-safety.test.js.

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "usage: $0 <date> <article-type-slug>" >&2
  exit 2
fi

DATE="$1"
SLUG="$2"

# Validate date: YYYY-MM-DD
case "$DATE" in
  [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]) : ;;
  *)
    echo "error: date must match YYYY-MM-DD (got: $DATE)" >&2
    exit 2
    ;;
esac

# Validate slug against the closed article-type allow-list.
case "$SLUG" in
  breaking|committee-reports|propositions|motions|\
week-ahead|month-ahead|week-in-review|month-in-review|\
quarter-in-review|quarter-ahead|year-in-review|year-ahead|\
election-cycle|deep-analysis|\
term-outlook) : ;;
  *)
    echo "error: unknown article-type slug: $SLUG" >&2
    echo "       allowed: breaking, committee-reports, propositions, motions," >&2
    echo "                week-ahead, month-ahead, week-in-review, month-in-review," >&2
    echo "                quarter-in-review, quarter-ahead, year-in-review, year-ahead," >&2
    echo "                election-cycle, deep-analysis, term-outlook" >&2
    exit 2
    ;;
esac

# Resolve repository root:
#   1. GITHUB_WORKSPACE when set (the canonical path in GitHub Actions).
#   2. Otherwise compute repo root as the parent of the directory holding
#      this script. This guarantees correctness when the script is invoked
#      from a subdirectory (e.g. `cd scripts && ./resolve-analysis-dir.sh`).
#   3. Fall back to $(pwd) only if the script path heuristic fails.
#
# NOTE: two single-level $() calls — AWF shell-safety filter forbids
# nested `$(cmd $(inner))`.
REPO_ROOT="${GITHUB_WORKSPACE:-}"
if [ -z "$REPO_ROOT" ]; then
  SCRIPT_PATH_DIR=$(dirname -- "$0")
  SCRIPT_DIR=$(cd -- "$SCRIPT_PATH_DIR" >/dev/null 2>&1 && pwd)
  if [ -n "$SCRIPT_DIR" ] && [ -d "$SCRIPT_DIR/.." ]; then
    REPO_ROOT=$(cd -- "$SCRIPT_DIR/.." >/dev/null 2>&1 && pwd)
  fi
fi
if [ -z "$REPO_ROOT" ]; then
  REPO_ROOT=$(pwd)
fi

# Single-level $() assignments, joined via printf (no nested expansion).
DIR_BASE="$REPO_ROOT/analysis/daily/$DATE"
DIR_ROOT="$DIR_BASE/$SLUG"

mkdir -p \
  "$DIR_ROOT/data" \
  "$DIR_ROOT/documents" \
  "$DIR_ROOT/existing" \
  "$DIR_ROOT/classification" \
  "$DIR_ROOT/threat-assessment" \
  "$DIR_ROOT/risk-scoring" \
  "$DIR_ROOT/intelligence" \
  "$DIR_ROOT/runs"

# Echo the resolved path on stdout. Consumers capture this with
#   ANALYSIS_DIR=$(scripts/resolve-analysis-dir.sh "$TODAY" "$SLUG")
echo "$DIR_ROOT"
