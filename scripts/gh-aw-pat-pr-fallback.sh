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

# Primary authoritative guard: when the safe_outputs job explicitly reported
# success, the PR was created via the gh-aw bundle path and no host-side
# recovery is needed. Skip the fallback unconditionally — even when a
# recovery patch is present.
#
# Background: gh-aw-capture-agent-patch.sh (post-step) writes
# /tmp/gh-aw/aw-agent-recovery.patch on every run where the agent committed
# to a news/* branch, regardless of whether safe_outputs subsequently
# succeeded. Without this guard, the recovery-patch trigger below would
# activate the fallback after a successful safe_outputs run, creating a
# duplicate PR (canonical example: PR #1902 succeeded, PR #1903 was
# created anyway because the recovery patch was present and the
# downstream branch-pattern API check at lines ~179-194 missed the
# bundle PR due to a salt-format drift). The safe_outputs job result is
# the authoritative success signal — when it reports success, no
# recovery is needed full stop.
#
# Exception 1 (regression run #26015261142): safe_outputs reports job-level
# success even when the internal git push for create_pull_request fails
# and the safe_outputs handler creates a fallback review issue instead.
# In that case it emits the GraphQL/exec failure to its log and bumps
# its `code_push_failure_count` job output (wired in by gh-aw as the
# GH_AW_CODE_PUSH_FAILURE_COUNT env on this fallback step). When that
# count is > 0 we must NOT short-circuit — the bundle path did not
# actually publish a PR, and the downstream branch-pattern API check at
# lines ~200-219 will verify on GitHub whether a PR exists before
# proceeding with recovery.
#
# Exception 2 (regression runs #26019545674 motions / #26017383773
# propositions, both 2026-05-18): safe_outputs reports job-level success
# AND code_push_failure_count is 0 even when the internal create_pull_request
# git push failed and fell back to a review issue. gh-aw treats the
# successful issue-fallback as a non-failure for counting purposes, so
# code_push_failure_count stays at 0. The reliable signal is gh-aw's
# `created_pr_number` job output (wired here as GH_AW_CREATED_PR_NUMBER):
# it is populated only when an actual PR was created on GitHub; it is empty
# when the bundle push fell back to an issue. Treat success + empty
# created_pr_number + a bundle/patch artifact on disk as a silent push
# failure and run the fallback.
code_push_failure_count=0
case "${GH_AW_CODE_PUSH_FAILURE_COUNT:-}" in
  ''|0) code_push_failure_count=0 ;;
  *[!0-9]*) code_push_failure_count=0 ;;
  *) code_push_failure_count="${GH_AW_CODE_PUSH_FAILURE_COUNT}" ;;
esac

# Strip surrounding whitespace from created_pr_number — GitHub Actions can
# render numeric outputs with leading/trailing whitespace when the safe_outputs
# step uses `core.setOutput`. An empty value means the bundle path did not
# publish a PR (either it fell back to a review issue, or safe_outputs never
# ran the create_pull_request handler).
created_pr_number=""
if [ -n "${GH_AW_CREATED_PR_NUMBER:-}" ]; then
  created_pr_number=$(printf '%s' "${GH_AW_CREATED_PR_NUMBER}" | tr -d '[:space:]')
fi

silent_push_failure=false
has_recoverable_artifact=false
if [ "$has_safeoutputs_patch" = true ] || [ "$has_safeoutputs_bundle" = true ] || [ "$has_recovery_patch" = true ]; then
  has_recoverable_artifact=true
fi
if [ "${GH_AW_SAFE_OUTPUTS_RESULT:-}" = "success" ] && \
   [ "$code_push_failure_count" -eq 0 ] && \
   [ -z "$created_pr_number" ] && \
   [ "$has_recoverable_artifact" = true ]; then
  silent_push_failure=true
fi

if [ "${GH_AW_SAFE_OUTPUTS_RESULT:-}" = "success" ] && \
   [ "$code_push_failure_count" -eq 0 ] && \
   [ "$silent_push_failure" = false ]; then
  log "safe_outputs job reported success; fallback skipped (no recovery needed)"
  exit 0
fi

if [ "${GH_AW_SAFE_OUTPUTS_RESULT:-}" = "success" ] && [ "$code_push_failure_count" -gt 0 ]; then
  log "safe_outputs job reported success but code_push_failure_count=${code_push_failure_count}; proceeding with fallback (bundle push fell back to review issue)"
fi

if [ "$silent_push_failure" = true ]; then
  log "safe_outputs job reported success but created_pr_number is empty and a safeoutputs/recovery artifact is on disk; proceeding with fallback (silent bundle push failure — see runs #26019545674 motions and #26017383773 propositions 2026-05-18)"
fi

if [ ! -f "$stdio_log" ]; then
  if [ "$has_recovery_patch" = false ] && { [ "$safe_outputs_failed" = false ] || [ "$has_safeoutputs_patch" = false ]; } && \
     { [ "$safe_outputs_failed" = false ] || [ "$has_safeoutputs_bundle" = false ]; } && \
     { [ "$code_push_failure_count" -eq 0 ] || { [ "$has_safeoutputs_patch" = false ] && [ "$has_safeoutputs_bundle" = false ]; }; } && \
     [ "$silent_push_failure" = false ]; then
    log "agent stdio log not found and no recovery/failed-safeoutputs patch or bundle; fallback skipped"
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
# Trigger 5: safe_outputs reported success but its internal create_pull_request
# git push failed (code_push_failure_count > 0) and fell back to a review issue
# — same regression that motivated the exception in the primary guard above
# (run #26015261142). When this happens with a safeoutputs patch or bundle on
# disk, treat it as a recoverable bundle/patch failure even though the job
# reported success at the JobResult level.
# Trigger 6: safe_outputs reported success AND code_push_failure_count is 0
# but created_pr_number is empty and a safeoutputs/recovery artifact is on
# disk — i.e. gh-aw silently fell back to a review issue without bumping
# the counter (regression runs #26019545674 motions / #26017383773
# propositions, both 2026-05-18). The empty created_pr_number is the
# authoritative signal that the bundle path never published a PR.
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
elif [ "$code_push_failure_count" -gt 0 ] && [ "$has_safeoutputs_patch" = true ]; then
  should_run=true
elif [ "$code_push_failure_count" -gt 0 ] && [ "$has_safeoutputs_bundle" = true ]; then
  should_run=true
elif [ "$silent_push_failure" = true ]; then
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
  # safe_outputs branch pattern is "news/<slug>-<date>-<salt>" for article
  # workflows and "news/translate-briefs-<date>-<salt>" for news-translate.
  # Both happen to be covered by "news/${slug}-${today}-*" because the
  # translate workflow passes slug="translate-briefs".
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

# The news-translate workflow does not have a per-slug analysis directory or
# article.md — it writes per-language translation files alongside each source
# brief and a run summary under analysis/translation-runs/<date>/. Override
# the article-workflow defaults so the fallback's path filter, manifest probe,
# and headline lookup all behave correctly for translate-briefs.
is_translate_slug=false
case "$slug" in
  translate-briefs|translate)
    is_translate_slug=true
    branch="news/translate-briefs-$today"
    analysis_dir="analysis/translation-runs/$today"
    ;;
esac

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
  # Apply gh-aw's own safeoutputs patch artifacts first (aw-<branch>.patch,
  # aw-create-pull-request.patch, etc.) — these embed authoritative base-commit
  # context from the agent run. Only fall back to aw-agent-recovery.patch (the
  # diff-format backup written by gh-aw-capture-agent-patch.sh) when none of
  # the gh-aw patches apply cleanly. This preserves the "gh-aw primary,
  # recovery backup" precedence even though the recovery patch sorts first
  # lexicographically (aw-agent-recovery.patch < aw-create-pull-request.patch).
  primary_applied=false
  shopt -s nullglob
  for patch_file in "$gh_aw_dir"/aw-*.patch; do
    if [ "$patch_file" = "$recovery_patch" ]; then
      continue
    fi
    log "applying agent patch artifact $patch_file"
    if git apply --whitespace=nowarn "$patch_file"; then
      primary_applied=true
      break
    fi
    log "patch artifact did not apply cleanly: $patch_file"
  done
  shopt -u nullglob
  if [ "$primary_applied" = false ] && [ -f "$recovery_patch" ] && [ -s "$recovery_patch" ]; then
    log "applying recovery patch artifact $recovery_patch (gh-aw patches absent or unapplicable)"
    if git apply --whitespace=nowarn "$recovery_patch"; then
      :
    else
      log "recovery patch did not apply cleanly: $recovery_patch"
    fi
  fi
fi

git diff --name-only > "$all_changed"
git ls-files --others --exclude-standard >> "$all_changed"
sort -u "$all_changed" -o "$all_changed"

while IFS= read -r file; do
  if [ -z "$file" ]; then
    continue
  fi

  case "$file" in
    analysis/daily/*|news/*|analysis/translation-runs/*)
      case "$file" in
        # Protected / never-eligible paths:
        #   * lock files — must never be force-pushed
        #   * .github/** — workflow drift would be invisible
        #   * gh-aw compiled locks
        #   * vendored deps
        #   * Pre-fetched EP Open Data Portal feed JSONs under
        #     analysis/<date>/<slug>/data/ — they are large
        #     (meps-feed.json alone is ≈8 MB), gitignored, and pushed
        #     them up the bundle path past the 10 MB safe-outputs cap,
        #     which is the original reason the PAT fallback fires.
        #     Re-staging them here would just recreate the bloat.
        *.lock|.github/*|.github/workflows/*.lock.yml|node_modules/*|analysis/daily/*/data/*|analysis/daily/*/*/data/*)
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
  if [ "$is_translate_slug" = true ]; then
    # Count translation files actually staged for the PR so the headline
    # reflects the real recovery payload rather than a generic placeholder.
    translation_count=$(grep -cE '^analysis/daily/.+/executive-brief_[a-z]+\.md$' "$eligible_changed" || true)
    headline="Translate executive briefs ($translation_count files) for $today"
  else
    headline="EU Parliament $slug update for $today"
  fi
fi

# Slug → emoji icon. Keep this aligned with the
# news-unified-stages.md Stage E spec so the bundle path and the PAT
# fallback path produce identical-looking PRs.
case "$slug" in
  breaking)        slug_icon="📰" ;;
  motions)         slug_icon="🗳️" ;;
  week-ahead)      slug_icon="📅" ;;
  forecasts)       slug_icon="🔮" ;;
  digest)          slug_icon="📋" ;;
  committees)      slug_icon="🏛️" ;;
  questions)       slug_icon="❓" ;;
  declarations)    slug_icon="📑" ;;
  delegations)     slug_icon="🌍" ;;
  procedures)      slug_icon="⚖️" ;;
  propositions)    slug_icon="💡" ;;
  voting-rcv)      slug_icon="🗳️" ;;
  political-groups) slug_icon="🤝" ;;
  events)          slug_icon="📆" ;;
  translate)       slug_icon="🌐" ;;
  *)               slug_icon="📰" ;;
esac

case "$gate_result" in
  PASS|pass|Pass) gate_icon="✅" ;;
  WARN|warn|Warn) gate_icon="⚠️" ;;
  FAIL|fail|Fail) gate_icon="❌" ;;
  *)              gate_icon="❔" ;;
esac

title="${slug_icon} [news/${slug}] ${headline}"

fallback_reason="safeoutputs MCP session expired with \`session not found\`"
if [ "$session_not_found" = false ] && [ "$has_recovery_patch" = true ]; then
  fallback_reason="safe_outputs bundle apply failed (recovery patch present but no open bundle-path PR found; possible race condition between agent run and concurrent commits to main)"
elif [ "$session_not_found" = false ] && [ "$safe_outputs_failed" = true ] && [ "$has_safeoutputs_patch" = true ]; then
  fallback_reason="safe_outputs create_pull_request failed after emitting a patch (no open bundle-path PR found; likely bundle prerequisite race with concurrent commits to main)"
elif [ "$session_not_found" = false ] && [ "$safe_outputs_failed" = true ] && [ "$has_safeoutputs_bundle" = true ] && [ "$has_safeoutputs_patch" = false ]; then
  fallback_reason="safe_outputs create_pull_request failed with bundle only and no patch (bundle prerequisite race; applying aw-agent-recovery.patch from workspace git diff)"
fi

# Inventory of what was staged, for the body summary.
eligible_total=$(wc -l "$eligible_changed" | awk '{print $1}')
disallowed_total=0
if [ -s "$disallowed_changed" ]; then
  disallowed_total=$(wc -l "$disallowed_changed" | awk '{print $1}')
fi
article_files=$(grep -cE '^(analysis/daily/[^/]+/[^/]+/article(\.[a-z]+)?\.md|news/.+\.md)$' "$eligible_changed" || true)
analysis_files=$(grep -cE '^analysis/daily/[^/]+/[^/]+/(intelligence|classification|risk-scoring|threat-assessment|economic-context|stage-[a-e]|manifest)\.' "$eligible_changed" || true)
translation_files=$(grep -cE '^analysis/daily/.+/executive-brief_[a-z]+\.md$' "$eligible_changed" || true)

cat > "$body_file" <<EOF_BODY
# ${slug_icon} ${headline}

> **Host-side PAT fallback** — this PR was created by \`scripts/gh-aw-pat-pr-fallback.sh\` because the normal gh-aw \`safe_outputs.create_pull_request\` path could not land the bundle. The eligible workspace diff was rescued and pushed via the host PAT so the run is not lost.

## 📊 Summary

| Field | Value |
| --- | --- |
| Article type | \`${slug}\` ${slug_icon} |
| Date | \`${today}\` |
| Gate result | ${gate_icon} \`${gate_result}\` |
| Analysis directory | \`${analysis_dir}\` |
| Branch | \`${branch}\` |
| Workflow | \`${workflow_name}\` |
| Run | [${GITHUB_RUN_ID:-unknown}](${run_url}) |
| Created by | Host-side PAT fallback (\`COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN\`) |

## 🛟 Fallback reason

${fallback_reason}

## 📁 Staged paths

- Eligible files staged: **${eligible_total}**
- Analysis artifacts: **${analysis_files}**
- Article / news Markdown: **${article_files}**
- Translation files: **${translation_files}**
- Disallowed paths left unstaged: **${disallowed_total}** (lock files, \`.github/**\`, \`analysis/**/data/**\`, \`node_modules/**\`, …)

\`\`\`
$(cat "$stat_file")
\`\`\`

## 🔎 What the fallback does

The fallback stages only eligible \`analysis/daily/**\`, \`analysis/translation-runs/**\`, and \`news/**\` paths (Markdown + manifest sidecars). It explicitly skips:

- compiled gh-aw lock files (\`.github/workflows/*.lock.yml\`)
- anything under \`.github/**\` (workflow drift would be invisible)
- pre-fetched EP Open Data Portal feed JSONs under \`analysis/**/data/**\` (large raw API dumps that previously pushed patches over the gh-aw 10 MB cap)
- \`node_modules/**\` and other vendored dirs

When an open PR already exists for this branch it is reused — only the title and body are refreshed.

---

<sub>🤖 Generated by \`scripts/gh-aw-pat-pr-fallback.sh\` · Stability docs: \`.github/workflows/shared/config/news-pat-pr-fallback.md\`</sub>
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
