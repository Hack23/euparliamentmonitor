#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# checkpoint-analysis-to-memory.sh — persist an analysis-run checkpoint to the
# gh-aw repo-memory workspace so the work survives a late-stage failure or the
# 60-minute engine timeout.
#
# Usage:
#   scripts/checkpoint-analysis-to-memory.sh <analysis-dir> <run-id> <phase> [article-type-slug]
#
# Positional args:
#   1. analysis-dir        — absolute or repo-relative path to the run dir
#                            (e.g. analysis/daily/2026-04-22/committee-reports-run-1776853275)
#   2. run-id              — stable identifier used as the checkpoint file stem
#                            (e.g. committee-reports-run-1776853275)
#   3. phase               — one of: data | analysis | gate | article | final
#                            (one snapshot per completed phase of the news workflow)
#   4. article-type-slug   — optional article-type slug recorded in the index
#
# Output:
#   /tmp/gh-aw/repo-memory/default/memory/news-generation/analysis-runs/
#     <run-id>.<phase>.manifest.json   (copy of analysis-dir/manifest.json, if present)
#     <run-id>.<phase>.index.md        (compact artifact index: relative path + line count)
#
# Safety notes:
#   - No nested parameter expansion ( ${var#${other}/} ) or command substitution
#     inside command substitution. These constructs have tripped the agent's
#     shell-safety filter in the past. We use awk + a simple while-read loop
#     instead.
#   - All user-provided paths are quoted. No `eval`. No `-exec bash -c`.
#   - The repo-memory workspace is always allowed by the `repo-memory` tool
#     config on news workflows; writing here does NOT invoke safe-outputs.

set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "usage: $0 <analysis-dir> <run-id> <phase> [article-type-slug]" >&2
  exit 2
fi

ANALYSIS_DIR="$1"
RUN_ID="$2"
PHASE="$3"
ARTICLE_TYPE_SLUG="${4:-unknown}"

# Validate phase against an allow-list.
case "$PHASE" in
  data|analysis|gate|article|final) : ;;
  *)
    echo "error: phase must be one of: data, analysis, gate, article, final (got: $PHASE)" >&2
    exit 2
    ;;
esac

# Validate run-id: disallow path separators and whitespace (including spaces)
# so the file names stay anchored to the intended directory.
case "$RUN_ID" in
  */*|*"\\"*|*[[:space:]]*|"")
    echo "error: run-id must not contain path separators, whitespace, or be empty" >&2
    exit 2
    ;;
esac

if [ ! -d "$ANALYSIS_DIR" ]; then
  echo "warn: analysis-dir does not exist: $ANALYSIS_DIR — skipping checkpoint" >&2
  exit 0
fi

MEM_RUNS_DIR="/tmp/gh-aw/repo-memory/default/memory/news-generation/analysis-runs"
mkdir -p "$MEM_RUNS_DIR"

MANIFEST_SRC="$ANALYSIS_DIR/manifest.json"
MANIFEST_DST="$MEM_RUNS_DIR/$RUN_ID.$PHASE.manifest.json"
INDEX_DST="$MEM_RUNS_DIR/$RUN_ID.$PHASE.index.md"

# Copy manifest verbatim when present. Skip silently otherwise (Stage A may
# checkpoint before Stage B writes the manifest).
if [ -f "$MANIFEST_SRC" ]; then
  cp "$MANIFEST_SRC" "$MANIFEST_DST"
fi

# Resolve a short git SHA if available. No nested command substitution.
GIT_SHA="unknown"
if git rev-parse --short HEAD >/dev/null 2>&1; then
  GIT_SHA=$(git rev-parse --short HEAD)
fi

TODAY=$(date -u +%Y-%m-%d)

# Build the compact artifact index. Use `awk` to strip the leading
# "<analysis-dir>/" prefix from each path — this avoids the
# ${f#${ANALYSIS_DIR}/} nested-expansion pattern that the shell-safety filter
# rejects. Line counts come from `wc -l <path> | awk '{print $1}'` — no input
# redirection inside command substitution (which is also a blocked pattern).
{
  printf '# %s (phase: %s)\n\n' "$RUN_ID" "$PHASE"
  printf -- '- article-type: %s\n' "$ARTICLE_TYPE_SLUG"
  printf -- '- date: %s\n' "$TODAY"
  printf -- '- analysis-dir: %s\n' "$ANALYSIS_DIR"
  printf -- '- git-sha: %s\n' "$GIT_SHA"
  printf -- '- phase: %s\n\n' "$PHASE"
  printf '## Artifacts\n\n'

  # List all .md files under analysis-dir, stripping the leading dir prefix
  # with awk (no nested expansion) and appending a line count.
  find "$ANALYSIS_DIR" -type f -name '*.md' -print 2>/dev/null \
    | LC_ALL=C sort \
    | while IFS= read -r artifact_path; do
        rel=$(printf '%s\n' "$artifact_path" | awk -v prefix="$ANALYSIS_DIR/" '
          {
            if (index($0, prefix) == 1) { print substr($0, length(prefix) + 1) }
            else                        { print $0 }
          }
        ')
        lines=$(wc -l "$artifact_path" | awk '{print $1}')
        printf -- '- %s (%s lines)\n' "$rel" "$lines"
      done
} > "$INDEX_DST"

echo "checkpoint written: $INDEX_DST"
if [ -f "$MANIFEST_DST" ]; then
  echo "checkpoint written: $MANIFEST_DST"
fi
