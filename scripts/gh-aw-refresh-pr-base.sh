#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# Refresh the current news/* branch onto the latest origin/main immediately
# before a gh-aw safe-output PR call. This keeps the bundle prerequisites in
# the shallow safe_outputs checkout and avoids "Repository lacks prerequisite
# commits" when main advances while the agent is still generating analysis.

set -euo pipefail

log() {
  printf 'gh-aw-refresh-pr-base: %s\n' "$*"
}

remote="origin"
if [ -n "${GH_AW_PR_REMOTE:-}" ]; then
  remote="$GH_AW_PR_REMOTE"
fi

base_branch="main"
if [ -n "${GH_AW_PR_BASE_BRANCH:-}" ]; then
  base_branch="$GH_AW_PR_BASE_BRANCH"
fi

base_ref="refs/remotes/$remote/$base_branch"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  log "not inside a git work tree; skipped"
  exit 0
fi

current_branch=$(git branch --show-current)
case "$current_branch" in
  news/*)
    ;;
  *)
    log "current branch is not news/* (${current_branch:-detached}); skipped"
    exit 0
    ;;
esac

if [ -n "$(git status --porcelain)" ]; then
  log "working tree is dirty; commit or discard changes before rebasing"
  exit 1
fi

log "fetching $remote $base_branch"
git fetch --quiet "$remote" "$base_branch"

if ! git rev-parse --verify --quiet "$base_ref" >/dev/null; then
  log "base ref $base_ref not found after fetch"
  exit 1
fi

if git merge-base --is-ancestor "$base_ref" HEAD; then
  log "$current_branch already contains $base_ref"
  exit 0
fi

log "rebasing $current_branch onto $base_ref"
if git rebase --quiet "$base_ref"; then
  log "rebased $current_branch onto $base_ref"
else
  git rebase --abort >/dev/null 2>&1 || true
  log "rebase failed; aborted rebase so the branch remains on its previous base"
  exit 1
fi
