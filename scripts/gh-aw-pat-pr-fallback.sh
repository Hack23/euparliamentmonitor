#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

log() {
  printf 'gh-aw-pat-pr-fallback: %s\n' "$*"
}

gh_aw_dir="/tmp/gh-aw"
if [ -n "${GH_AW_DIR:-}" ]; then
  gh_aw_dir="$GH_AW_DIR"
fi

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

stdio_log="$gh_aw_dir/agent-stdio.log"
if [ -n "${GH_AW_PAT_FALLBACK_STDIO_LOG:-}" ]; then
  stdio_log="$GH_AW_PAT_FALLBACK_STDIO_LOG"
fi

# Check if a recovery patch was captured by gh-aw-capture-agent-patch.sh.
# A recovery patch indicates the agent committed work that the safe_outputs
# bundle-apply step may not have successfully applied (e.g. due to a
# shallow-clone race where a concurrent push to main moved HEAD ahead of the
# commit the agent branched from, making the bundle's prerequisite commit
# unavailable in the safe_outputs runner's fetch-depth:1 checkout).
recovery_patch="$gh_aw_dir/aw-agent-recovery.patch"
has_recovery_patch=false
if [ -f "$recovery_patch" ] && [ -s "$recovery_patch" ]; then
  has_recovery_patch=true
fi

has_safeoutputs_patch=false
shopt -s nullglob
safeoutputs_patches=("$gh_aw_dir"/aw-*.patch)
shopt -u nullglob
if [ "${#safeoutputs_patches[@]}" -gt 0 ]; then
  has_safeoutputs_patch=true
fi

has_safeoutputs_bundle=false
shopt -s nullglob
safeoutputs_bundles=("$gh_aw_dir"/aw-*.bundle)
shopt -u nullglob
if [ "${#safeoutputs_bundles[@]}" -gt 0 ]; then
  has_safeoutputs_bundle=true
fi

safe_outputs_failed=false
case "${GH_AW_SAFE_OUTPUTS_RESULT:-}" in
  failure|cancelled|timed_out)
    safe_outputs_failed=true
    ;;
esac

if [ ! -f "$stdio_log" ]; then
  if [ "$has_recovery_patch" = false ] && { [ "$safe_outputs_failed" = false ] || [ "$has_safeoutputs_patch" = false ]; } && \
     { [ "$safe_outputs_failed" = false ] || [ "$has_safeoutputs_bundle" = false ]; }; then
    log "agent stdio log not found and no recovery/failed-safeoutputs patch; fallback skipped"
    exit 0
  fi
fi

# Trigger 1 (classic): safeoutputs MCP session expired ('session not found').
session_not_found=false
if [ -f "$stdio_log" ] && grep -qi 'session not found' "$stdio_log"; then
  session_not_found=true
fi

# Trigger 2: agent committed work but safe_outputs did not emit a usable patch.
# Trigger 3: safe_outputs failed after emitting its own patch (for example, a
# bundle prerequisite race in the create_pull_request write job).
# Trigger 4: safe_outputs failed and a bundle artifact exists (bundle-only case
# where gh-aw did not generate a separate patch; recovery comes from
# aw-agent-recovery.patch written by gh-aw-capture-agent-patch.sh).
# Activate when any trigger condition is met.
should_run=false
if [ "$session_not_found" = true ]; then
  should_run=true
elif [ "$has_recovery_patch" = true ]; then
  should_run=true
elif [ "$safe_outputs_failed" = true ] && [ "$has_safeoutputs_patch" = true ]; then
  should_run=true
elif [ "$safe_outputs_failed" = true ] && [ "$has_safeoutputs_bundle" = true ]; then
  should_run=true
fi

if [ "$should_run" = false ]; then
  log "no session expiry, recovery patch, or failed safe_outputs patch/bundle artifact; fallback skipped"
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

# NOTE: The /tmp/gh-aw/safeoutputs.jsonl check is deferred until after
# slug/today/repo are computed so we can verify via the GitHub API whether
# the PR was actually created on GitHub (not just requested by the agent).
# The old eager check caused false-positive skips when the agent wrote a
# create_pull_request safeoutput but safe_outputs failed to apply the bundle.

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

# Deferred safeoutputs.jsonl check: verify via GitHub API whether the
# safe_outputs bundle path actually created an open PR.
#
# The old eager check (`grep create_pull_request /tmp/gh-aw/safeoutputs.jsonl
# → skip`) was a false positive for bundle apply failures: the agent writes
# the request to safeoutputs.jsonl before the safe_outputs job runs, so the
# file always contains create_pull_request even when the bundle apply fails
# with "Repository lacks prerequisite commits" (shallow-clone race condition).
#
# safe_outputs creates branches with format "news/<slug>-<date>-<salt>".
# Our fallback creates "news/<date>-<slug>" (no salt, different order).
# A successful safe_outputs run will have an open PR for the salted branch;
# absence of that PR is a reliable signal that the bundle apply failed.
if [ -f "$gh_aw_dir/safeoutputs.jsonl" ] && grep -q 'create_pull_request' "$gh_aw_dir/safeoutputs.jsonl"; then
  gh_stderr=$(mktemp)
  bundle_pr=$(gh pr list --repo "$repo" --state open \
    --json number,headRefName \
    --jq "[.[] | select(.headRefName | startswith(\"news/${slug}-${today}-\"))] | .[0].number // \"\"" \
    2>"$gh_stderr" || true)
  if [ -s "$gh_stderr" ]; then
    log "gh pr list error (will proceed with fallback): $(cat "$gh_stderr")"
  fi
  rm -f "$gh_stderr"
  if [ -n "$bundle_pr" ]; then
    log "safe_outputs created open PR #${bundle_pr} via bundle (news/${slug}-${today}-*); fallback skipped"
    exit 0
  fi
  log "agent wrote create_pull_request but no open bundle-path PR found on GitHub; proceeding with fallback"
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

if [ -z "$(git status --porcelain)" ]; then
  for patch_file in "$gh_aw_dir"/aw-*.patch; do
    if [ ! -e "$patch_file" ]; then
      continue
    fi
    log "applying agent patch artifact $patch_file"
    if git apply --whitespace=nowarn "$patch_file"; then
      break
    fi
    log "patch artifact did not apply cleanly: $patch_file"
  done
fi

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
  git add -A -- "$file"
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

fallback_reason="safeoutputs MCP session expired with \`session not found\`"
if [ "$session_not_found" = false ] && [ "$has_recovery_patch" = true ]; then
  fallback_reason="safe_outputs bundle apply failed (recovery patch present but no open bundle-path PR found; possible race condition between agent run and concurrent commits to main)"
elif [ "$session_not_found" = false ] && [ "$safe_outputs_failed" = true ] && [ "$has_safeoutputs_patch" = true ]; then
  fallback_reason="safe_outputs create_pull_request failed after emitting a patch (no open bundle-path PR found; likely bundle prerequisite race with concurrent commits to main)"
elif [ "$session_not_found" = false ] && [ "$safe_outputs_failed" = true ] && [ "$has_safeoutputs_bundle" = true ] && [ "$has_safeoutputs_patch" = false ]; then
  fallback_reason="safe_outputs create_pull_request failed with bundle only and no patch (bundle prerequisite race; applying aw-agent-recovery.patch from workspace git diff)"
fi

cat > "$body_file" <<EOF_BODY
Host-side PAT fallback created this PR after the normal gh-aw safeoutputs PR creation path failed.

- Workflow: $workflow_name
- Run: $run_url
- Branch: $branch
- Article type: $slug
- Analysis directory: $analysis_dir
- Gate result: $gate_result
- Fallback reason: $fallback_reason
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
