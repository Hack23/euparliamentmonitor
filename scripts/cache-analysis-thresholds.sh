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
#   - .defaults         — global default floors (fallback when per-type entry absent)
#   - .perArticleType   — entry keyed to the active slug only (omitted if not present)
#   - .tradecraftQualitySignals — structural signal arrays from the source JSON
#   - .filteredForArticleType — slug for provenance / debugging
#   - .cachedAt         — ISO timestamp
#   - .version          — schema version from the source file
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
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

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

// Copy global defaults if present.
if (raw.defaults !== undefined) {
  out.defaults = raw.defaults;
}

// Copy tradecraftQualitySignals for structural-check references.
if (raw.tradecraftQualitySignals !== undefined) {
  out.tradecraftQualitySignals = raw.tradecraftQualitySignals;
}

// Copy only the entry for the active article type from thresholds[].
// The thresholds array contains objects with an `articleType` field.
if (Array.isArray(raw.thresholds)) {
  const entry = raw.thresholds.find((t) => t.articleType === articleType);
  if (entry) {
    out.thresholds = [entry];
  } else {
    // No per-type entry: write an empty array so callers can distinguish
    // "filtered but absent" from "JSON read error".
    out.thresholds = [];
  }
}

try {
  fs.writeFileSync(dst, JSON.stringify(out, null, 2) + '\n');
} catch (err) {
  process.stderr.write('cache-analysis-thresholds: failed to write cache: ' + err.message + '\n');
  process.exit(1);
}
NODE_EOF

echo "thresholds cached: article-type='${ARTICLE_TYPE}' → ${CACHE_FILE}"
