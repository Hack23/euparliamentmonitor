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

# If gh-aw / safeoutputs already wrote a recovery-style patch, do not clobber
# it — the upstream patch is more authoritative.
shopt -s nullglob
existing=("$out_dir"/aw-*.patch)
shopt -u nullglob
if [ "${#existing[@]}" -gt 0 ]; then
  log "existing patch artifact(s) already present; skipping capture: ${existing[*]}"
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
  log "no news/* branch ahead of $base_ref; nothing to capture"
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
