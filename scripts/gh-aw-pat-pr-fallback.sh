#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

log() {
  printf 'gh-aw-pat-pr-fallback: %s\n' "$*"
}

read_gate_result() {
  manifest_path="$1"
  node - "$manifest_path" <<'NODE_GATE_RESULT'
const fs = require('fs');

const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const history = Array.isArray(manifest.history) ? manifest.history : [];
const lastHistory = history.length > 0 ? history[history.length - 1] : {};

console.log(lastHistory.gateResult || manifest.gateResult || 'UNKNOWN');
NODE_GATE_RESULT
}

stdio_log="/tmp/gh-aw/agent-stdio.log"
if [ -n "${GH_AW_PAT_FALLBACK_STDIO_LOG:-}" ]; then
  stdio_log="$GH_AW_PAT_FALLBACK_STDIO_LOG"
fi

if [ ! -f "$stdio_log" ]; then
  log "agent stdio log not found; fallback skipped"
  exit 0
fi

if ! grep -qi 'session not found' "$stdio_log"; then
  log "safeoutputs session expiry not detected; fallback skipped"
  exit 0
fi

safe_outputs_file=""
if [ -n "${GH_AW_SAFE_OUTPUTS:-}" ]; then
  safe_outputs_file="$GH_AW_SAFE_OUTPUTS"
fi

if [ -n "$safe_outputs_file" ] && [ -f "$safe_outputs_file" ]; then
  if grep -q 'create_pull_request' "$safe_outputs_file"; then
    log "create_pull_request safeoutput exists; fallback skipped"
    exit 0
  fi
fi

if [ -f /tmp/gh-aw/safeoutputs.jsonl ]; then
  if grep -q 'create_pull_request' /tmp/gh-aw/safeoutputs.jsonl; then
    log "create_pull_request safeoutput copy exists; fallback skipped"
    exit 0
  fi
fi

token=""
if [ -n "${GH_AW_PAT_PR_FALLBACK_TOKEN:-}" ]; then
  token="$GH_AW_PAT_PR_FALLBACK_TOKEN"
elif [ -n "${GH_TOKEN:-}" ]; then
  token="$GH_TOKEN"
fi

if [ -z "$token" ]; then
  log "no fallback token available; fallback skipped"
  exit 0
fi

printf '::add-mask::%s\n' "$token"
export GH_TOKEN="$token"

slug=""
if [ -n "${GH_AW_PAT_FALLBACK_SLUG:-}" ]; then
  slug="$GH_AW_PAT_FALLBACK_SLUG"
elif [ -n "${ARTICLE_TYPE_SLUG:-}" ]; then
  slug="$ARTICLE_TYPE_SLUG"
fi

if [ -z "$slug" ]; then
  log "article slug unavailable; fallback skipped"
  exit 0
fi

today=""
if [ -n "${TODAY:-}" ]; then
  today="$TODAY"
else
  today=$(date -u +%Y-%m-%d)
fi

repo=""
if [ -n "${GITHUB_REPOSITORY:-}" ]; then
  repo="$GITHUB_REPOSITORY"
else
  log "GITHUB_REPOSITORY unavailable; fallback skipped"
  exit 0
fi

server_url="https://github.com"
if [ -n "${GITHUB_SERVER_URL:-}" ]; then
  server_url="$GITHUB_SERVER_URL"
fi

case "$server_url" in
  http://*|https://*)
    ;;
  *)
    log "GITHUB_SERVER_URL must include http:// or https://; fallback skipped"
    exit 0
    ;;
esac

server_host="$server_url"
server_host="${server_host#https://}"
server_host="${server_host#http://}"

branch="news/$today-$slug"
analysis_dir="analysis/daily/$today/$slug"
workflow_name="$slug"
if [ -n "${GH_AW_PAT_FALLBACK_WORKFLOW_NAME:-}" ]; then
  workflow_name="$GH_AW_PAT_FALLBACK_WORKFLOW_NAME"
fi

run_url="$server_url/$repo/actions/runs/${GITHUB_RUN_ID:-}"
if [ -n "${GH_AW_PAT_FALLBACK_RUN_URL:-}" ]; then
  run_url="$GH_AW_PAT_FALLBACK_RUN_URL"
fi

all_changed=$(mktemp)
eligible_changed=$(mktemp)
disallowed_changed=$(mktemp)
body_file=$(mktemp)
stat_file=$(mktemp)

git diff --name-only > "$all_changed"
git ls-files --others --exclude-standard >> "$all_changed"
sort -u "$all_changed" -o "$all_changed"

while IFS= read -r file; do
  if [ -z "$file" ]; then
    continue
  fi

  case "$file" in
    analysis/daily/*|news/*)
      case "$file" in
        *.lock|.github/*|.github/workflows/*.lock.yml|node_modules/*)
          printf '%s\n' "$file" >> "$disallowed_changed"
          ;;
        *)
          printf '%s\n' "$file" >> "$eligible_changed"
          ;;
      esac
      ;;
    *)
      printf '%s\n' "$file" >> "$disallowed_changed"
      ;;
  esac
done < "$all_changed"

if [ ! -s "$eligible_changed" ]; then
  log "no eligible analysis/news changes found; fallback skipped"
  exit 0
fi

if [ -s "$disallowed_changed" ]; then
  log "leaving non-eligible workspace changes unstaged:"
  sed 's/^/  - /' "$disallowed_changed"
fi

git config --global user.email "github-actions[bot]@users.noreply.github.com"
git config --global user.name "github-actions[bot]"
git config --global am.keepcr true
git remote set-url origin "https://x-access-token:${token}@${server_host}/${repo}.git"

if git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
  git fetch origin "$branch" >/dev/null 2>&1 || true
fi

git checkout -B "$branch"
git reset --mixed --quiet
while IFS= read -r file; do
  git add -- "$file"
done < "$eligible_changed"

if git diff --cached --quiet; then
  log "eligible changes produced an empty staged diff; fallback skipped"
  exit 0
fi

git diff --cached --stat > "$stat_file"

gate_result="UNKNOWN"
manifest="$analysis_dir/manifest.json"
if [ -f "$manifest" ]; then
  gate_result=$(read_gate_result "$manifest" 2>/dev/null || printf 'UNKNOWN\n')
fi

headline=""
article_md="$analysis_dir/article.md"
if [ -f "$article_md" ]; then
  headline=$(awk '/^# / { sub(/^# /, ""); print; exit }' "$article_md")
fi

if [ -z "$headline" ]; then
  headline="EU Parliament $slug update for $today"
fi

title="[news] $headline"

cat > "$body_file" <<EOF_BODY
Host-side PAT fallback created this PR after the normal gh-aw safeoutputs PR creation path reported an expired MCP session.

- Workflow: $workflow_name
- Run: $run_url
- Branch: $branch
- Article type: $slug
- Analysis directory: $analysis_dir
- Gate result: $gate_result
- Fallback reason: safeoutputs MCP session expired with \`session not found\`
- Fallback credential: \`COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN\` from the host workflow environment

Changed file summary:

\`\`\`
$(cat "$stat_file")
\`\`\`

The fallback stages only eligible \`analysis/daily/**\` and \`news/**\` paths, leaves protected paths unstaged, and reuses an existing open PR for this branch when present.
EOF_BODY

git commit -m "news: publish $slug fallback output for $today"
git push --force-with-lease origin "$branch"

existing_pr=$(gh pr list --repo "$repo" --head "$branch" --state open --json number --jq '.[0].number // ""')
if [ -n "$existing_pr" ]; then
  log "open PR #$existing_pr already exists for $branch; updating body only"
  gh pr edit "$existing_pr" --repo "$repo" --title "$title" --body-file "$body_file"
  exit 0
fi

gh pr create \
  --repo "$repo" \
  --base main \
  --head "$branch" \
  --title "$title" \
  --body-file "$body_file"

log "fallback PR created for $branch"
