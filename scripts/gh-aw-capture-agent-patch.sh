#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# Capture any commits made by the agent inside the sandbox as a recovery
# patch under /tmp/gh-aw/aw-agent-recovery.patch.
#
# Background
# ----------
# News workflows run the agent inside an AWF Docker sandbox with the host
# workspace bind-mounted at /home/runner/work/euparliamentmonitor/euparliamentmonitor:rw.
# When the agent does `git checkout -b news/<...>` and `git commit` inside the
# sandbox, the resulting branch + commits live in the host's `.git` directory
# and persist into post-execution steps of the same job.
#
# When `safeoutputs___create_pull_request` succeeds, gh-aw uses
# `git format-patch` to ship the changes and emits its own
# `/tmp/gh-aw/aw-create-pull-request.patch` artifact. When the safeoutputs MCP
# session expires (well-known failure mode — see prompts/09-troubleshooting.md
# §"safeoutputs MCP session TTL expiry"), no patch is written and the
# subsequent host-side `gh-aw-pat-pr-fallback.sh` job (which runs on a fresh
# runner with a fresh `main` checkout) finds no changes to apply.
#
# This script closes that gap: it walks every `refs/heads/news/*` branch ahead
# of `origin/main`, picks the most recent one, and writes a single
# diff-format patch that `gh-aw-pat-pr-fallback.sh` can `git apply` verbatim
# (the existing fallback already iterates `/tmp/gh-aw/aw-*.patch`).
#
# The script is idempotent and best-effort: it never fails the workflow.
# When there are no agent commits to recover (success path, agent did nothing,
# fallback already wrote a patch), it exits 0 silently.

set -euo pipefail

log() {
  printf 'gh-aw-capture-agent-patch: %s\n' "$*"
}

workspace="${GH_AW_AGENT_WORKSPACE:-}"
if [ -z "$workspace" ]; then
  workspace="${GITHUB_WORKSPACE:-}"
fi
if [ -z "$workspace" ]; then
  workspace="/home/runner/work/euparliamentmonitor/euparliamentmonitor"
fi
out_dir="${GH_AW_PATCH_OUT_DIR:-/tmp/gh-aw}"
out_file="${GH_AW_PATCH_OUT_FILE:-}"
if [ -z "$out_file" ]; then
  out_file="$out_dir/aw-agent-recovery.patch"
fi

if [ ! -d "$workspace/.git" ]; then
  log "no .git in workspace ($workspace); nothing to capture"
  exit 0
fi

cd "$workspace"

# Skip only when aw-agent-recovery.patch (our own output) already exists to
# prevent duplicate work on repeated invocations.  If gh-aw / safeoutputs
# emitted its own aw-<branch>.patch alongside a bundle, we still produce
# aw-agent-recovery.patch as a backup: the gh-aw patch may not apply cleanly
# when main has advanced since the agent run started (bundle-prerequisite race,
# e.g. run #25653736742), whereas a pure git-diff recovery patch has no
# prerequisite-commit constraint and applies to any checkout of main.
if [ -f "$out_file" ] && [ -s "$out_file" ]; then
  log "recovery patch already present at $out_file; skipping duplicate capture"
  exit 0
fi

# Resolve the base ref: prefer origin/main (always present on news workflows),
# fall back to the workflow's base ref env when origin is unavailable.
base_ref=""
if git rev-parse --verify --quiet refs/remotes/origin/main >/dev/null 2>&1; then
  base_ref="refs/remotes/origin/main"
elif [ -n "${GITHUB_BASE_REF:-}" ] && git rev-parse --verify --quiet "refs/remotes/origin/$GITHUB_BASE_REF" >/dev/null 2>&1; then
  base_ref="refs/remotes/origin/$GITHUB_BASE_REF"
else
  log "no origin/main reference available; cannot compute recovery diff"
  exit 0
fi

# Find the newest news/* branch with commits ahead of base_ref. The agent
# typically commits to a single branch named news/<date>-<slug>-<runid>; if
# multiple exist we pick the most recently committed one. We rely on git's
# own `--sort=-committerdate` (descending) for determinism — manual unix-ts
# comparison can tie at 1-second granularity when the agent commits to
# multiple branches in the same second (caught by
# test/unit/gh-aw-capture-agent-patch.test.js).
candidate=""
while IFS= read -r ref; do
  [ -z "$ref" ] && continue
  ahead=$(git rev-list --count "$base_ref..$ref" 2>/dev/null || printf '0')
  if [ "$ahead" -gt 0 ]; then
    candidate="$ref"
    break
  fi
done < <(git for-each-ref --sort=-refname --sort=-committerdate --format='%(refname)' refs/heads/news/)

if [ -z "$candidate" ]; then
  log "no news/* branch ahead of $base_ref; checking for uncommitted analysis artifacts"

  # Crash-recovery fallback: agent wrote files to analysis/daily/ or news/
  # but crashed (or was reaped) before running `git checkout -b news/...` or
  # `git commit`. Without this fallback, the workspace artifacts are lost
  # entirely when the runner is reclaimed.
  #
  # Restrict to specific path globs so we never capture stray edits made by
  # a non-agent step. The agent's only authoritative output locations are
  # `analysis/daily/**` (Stage B artifacts) and `news/**` (Stage D rendered
  # articles, untracked until staged). Tracked changes elsewhere are
  # ignored — they're almost certainly the runner's own bookkeeping (build
  # output, lock-file regeneration, etc.) and committing them as
  # "agent recovery" would be misleading.
  recovery_globs="analysis/daily/ news/"

  # Translate workflows never produce HTML files — they only create
  # per-language Markdown executive briefs. If `npm run build` updated the
  # SEO metadata resolver, pre-existing HTML files under news/ will appear
  # modified in the workspace but must NOT be captured as agent artifacts.
  # Regression: PR #2290 shipped 87 unrelated HTML files via this path.
  _slug="${GH_AW_PAT_FALLBACK_SLUG:-${ARTICLE_TYPE_SLUG:-}}"
  is_translate_capture=false
  case "$_slug" in
   translate-briefs|translate) is_translate_capture=true ;;
  esac

  # Stage ONLY the recovery globs (never `git add .` — that would catch any
  # incidental dirty file in the workspace). `git add` silently no-ops on
  # missing paths via 2>/dev/null, and recursively adds untracked files
  # under tracked directories — exactly what we need.
  for prefix in $recovery_globs; do
   git add -- "$prefix" 2>/dev/null || true
  done

  # For translate workflows, unstage any HTML files that were captured
  # under news/ — they are stale pre-existing articles, not agent output.
  if [ "$is_translate_capture" = true ]; then
   html_unstaged=$(git diff --cached --name-only -- 'news/*.html' 'news/**/*.html' 2>/dev/null | wc -l)
   if [ "$html_unstaged" -gt 0 ]; then
     log "translate workflow: unstaging $html_unstaged pre-existing HTML file(s) from news/"
     git reset -q -- 'news/*.html' 'news/**/*.html' 2>/dev/null || true
   fi
  fi

  # Detect whether anything actually got staged. `git diff --cached --quiet`
  # exits 0 when there is NO staged diff, non-zero otherwise. We invert.
  if git diff --cached --quiet "$base_ref" -- $recovery_globs 2>/dev/null; then
    log "no news/* branch and no uncommitted analysis/daily/ or news/ artifacts; nothing to capture"
    # Reset any stray staging the add may have applied so the post-step
    # leaves the workspace state untouched for subsequent steps/tests.
    for prefix in $recovery_globs; do
      git reset -q -- "$prefix" 2>/dev/null || true
    done
    exit 0
  fi

  log "found uncommitted recovery artifacts; emitting synthetic crash-recovery patch"

  # Build the patch from the staged index against base_ref. We deliberately
  # do NOT create a synthetic commit — the host-side fallback only needs the
  # diff, and skipping the commit step avoids polluting the local branch
  # state (which the next post-step or test may inspect).
  mkdir -p "$out_dir"
  if git diff --binary --cached "$base_ref" -- $recovery_globs > "$out_file" 2>/dev/null; then
    size=$(stat -c '%s' "$out_file" 2>/dev/null || stat -f '%z' "$out_file" 2>/dev/null || printf '0')
    if [ "$size" -gt 0 ]; then
      log "captured crash-recovery patch from uncommitted artifacts -> $out_file ($size bytes)"
      {
        printf 'branch=<uncommitted>\n'
        printf 'base_ref=%s\n' "$base_ref"
        printf 'commits_ahead=0\n'
        printf 'recovery_kind=crash-recovery\n'
        printf 'capture_run_id=%s\n' "${GITHUB_RUN_ID:-unknown}"
      } > "$out_file.meta"
    else
      log "staged diff was empty (likely deletes only); removing zero-byte patch"
      rm -f "$out_file"
    fi
  else
    log "git diff --cached failed; crash-recovery patch not written"
    rm -f "$out_file"
  fi

  # Unstage what we just staged so the workspace state matches what the
  # rest of the post-steps (and tests) expect: dirty-but-unstaged.
  for prefix in $recovery_globs; do
    git reset -q -- "$prefix" 2>/dev/null || true
  done
  exit 0
fi

mkdir -p "$out_dir"

# `git apply` consumes diff format (what `git diff` emits). format-patch
# produces mbox which `git apply` parses too, but diff is the simpler contract
# and matches what gh-aw-pat-pr-fallback.sh already uses.
if git diff --binary "$base_ref..$candidate" > "$out_file"; then
  size=$(stat -c '%s' "$out_file" 2>/dev/null || stat -f '%z' "$out_file" 2>/dev/null || printf '0')
  if [ "$size" -gt 0 ]; then
    log "captured recovery patch from $candidate -> $out_file ($size bytes)"
    # Also drop a sibling metadata file so debug-agentic-workflows can identify
    # the source branch when triaging.
    {
      printf 'branch=%s\n' "$candidate"
      printf 'base_ref=%s\n' "$base_ref"
      printf 'commits_ahead=%s\n' "$(git rev-list --count "$base_ref..$candidate")"
      printf 'capture_run_id=%s\n' "${GITHUB_RUN_ID:-unknown}"
    } > "$out_file.meta"
  else
    log "diff was empty; removing zero-byte patch"
    rm -f "$out_file"
  fi
else
  log "git diff failed for $candidate; recovery patch not written"
  rm -f "$out_file"
fi
