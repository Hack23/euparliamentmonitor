#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# cache-analysis-thresholds.sh — Write a single filtered snapshot of
# analysis/methodologies/reference-quality-thresholds.json for the active
# article-type slug to ${ANALYSIS_DIR}/runs/thresholds-cache.json.
#
# Background: Run 25799686522 post-mortem showed agents were re-reading
# reference-quality-thresholds.json before every individual artifact write
# ("read threshold → write artifact" loop), wasting 2+ invocations per
# artifact. Calling this script once at Stage B start and reading the
# per-slug cache for the rest of the run saves 38+ invocations across a
# full 39-artifact pass. See news-unified-runtime.md Rule 3 and
# .github/prompts/09-troubleshooting.md §5 (run 25799686522 row).
#
# Usage:
#   bash scripts/cache-analysis-thresholds.sh <analysis-dir> <article-type-slug>
#
# Positional args:
#   1. analysis-dir       — path to the run directory (e.g. analysis/daily/2026-05-14/breaking)
#   2. article-type-slug  — article-type key matching reference-quality-thresholds.json
#                           (e.g. breaking, propositions, committee-reports)
#
# Output:
#   ${ANALYSIS_DIR}/runs/thresholds-cache.json  — filtered thresholds for the slug
#
# The output file contains:
#   - .thresholds       — object keyed by the active article-type slug only
#                         (e.g. { "breaking": { "executive-brief.md": 180, ... } }).
#                         Empty object when the source has no entry for the slug.
#   - .tradecraftQualitySignals — structural signal arrays from the source JSON
#   - .filteredForArticleType — slug for provenance / debugging
#   - .cachedAt         — ISO timestamp
#   - .version          — schema version from the source file
#
# Note: the source `reference-quality-thresholds.json` has no top-level
# `defaults` key — the global fallback when a per-artifact entry is absent
# is the validator's `--min-lines` CLI flag (DEFAULT_MIN_LINES = 30 in
# scripts/validate-analysis-completeness.js), not a JSON field.
#
# Safety notes (AWF shell-safety filter compliance):
#   - No nested parameter expansion, no indirect expansion, no `${var@P}`
#   - No nested command substitution, no `$(cmd < file)` redirection
#   - Node.js handles JSON parsing to avoid jq dependency and unsafe bash
#     string manipulation
#
# Drift-guarded by test/unit/shell-safety.test.js.

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "usage: $0 <analysis-dir> <article-type-slug>" >&2
  exit 2
fi

ANALYSIS_DIR="$1"
ARTICLE_TYPE="$2"

# Validate article-type-slug: disallow path separators and whitespace to keep
# the output file anchored within the intended directory.
case "$ARTICLE_TYPE" in
  */*|*"\\"*|*[[:space:]]*|"")
    echo "error: article-type-slug must not contain path separators, whitespace, or be empty" >&2
    exit 2
    ;;
esac

# Locate the repository root via git; fall back to the working directory so
# the script works in sandbox test environments that initialise a bare repo.
SCRIPT_DIR=$(dirname "$0")
REPO_ROOT=$(cd "$SCRIPT_DIR/.." 2>/dev/null && pwd)
if [ ! -d "$REPO_ROOT" ]; then
  REPO_ROOT=$(pwd)
fi

THRESHOLDS_SRC="${REPO_ROOT}/analysis/methodologies/reference-quality-thresholds.json"
if [ ! -f "$THRESHOLDS_SRC" ]; then
  echo "error: thresholds source not found: $THRESHOLDS_SRC" >&2
  exit 1
fi

mkdir -p "${ANALYSIS_DIR}/runs"
CACHE_FILE="${ANALYSIS_DIR}/runs/thresholds-cache.json"

# Delegate JSON filtering to Node.js. The heredoc uses a single-quoted
# delimiter (<<'NODE_EOF') so the shell does not expand any $ inside the
# script body — safe per AWF shell-safety rule for heredocs.
node - "$THRESHOLDS_SRC" "$ARTICLE_TYPE" "$CACHE_FILE" <<'NODE_EOF'
// NOTE: Inline scripts passed to `node -` via heredoc do not inherit the
// package.json "type":"module" setting and always execute as CommonJS.
// Using require() here is correct and intentional; do NOT convert to ESM
// import/export syntax as that would break the heredoc invocation pattern.
const [, , src, articleType, dst] = process.argv;
const fs = require('node:fs');

let raw;
try {
  raw = JSON.parse(fs.readFileSync(src, 'utf8'));
} catch (err) {
  process.stderr.write('cache-analysis-thresholds: failed to parse source JSON: ' + err.message + '\n');
  process.exit(1);
}

const out = {
  version: raw.version || '1.0.0',
  filteredForArticleType: articleType,
  cachedAt: new Date().toISOString(),
};

// Copy tradecraftQualitySignals for structural-check references.
if (raw.tradecraftQualitySignals !== undefined) {
  out.tradecraftQualitySignals = raw.tradecraftQualitySignals;
}

// Filter `thresholds` to only the active article-type slug.
// The source schema keys `thresholds` by article-type slug (object), e.g.
//   { "breaking": { "executive-brief.md": 180, ... }, "week-in-review": {...} }
// We emit a single-entry object so consumers can read
// `cache.thresholds[articleType]` with the same shape as the source file.
if (raw.thresholds && typeof raw.thresholds === 'object' && !Array.isArray(raw.thresholds)) {
  const entry = raw.thresholds[articleType];
  if (entry && typeof entry === 'object') {
    out.thresholds = { [articleType]: entry };
  } else {
    // No per-type entry: write an empty object so callers can distinguish
    // "filtered but absent" from "JSON read error". Downstream consumers
    // fall back to the validator's --min-lines CLI default.
    out.thresholds = {};
  }
} else {
  out.thresholds = {};
}

try {
  fs.writeFileSync(dst, JSON.stringify(out, null, 2) + '\n');
} catch (err) {
  process.stderr.write('cache-analysis-thresholds: failed to write cache: ' + err.message + '\n');
  process.exit(1);
}
NODE_EOF

echo "thresholds cached: article-type='${ARTICLE_TYPE}' → ${CACHE_FILE}"
