---
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# Shared `safe-outputs` head block (`threat-detection` and the
# bundle-prerequisite fetch `steps:`) for the 14 unified `news-*.md` article
# workflows. These two fields are byte-identical across all 14 sources
# (verified via `md5sum`), so extracting them here is purely a
# deduplication step — no semantic change to the compiled `.lock.yml`.
#
# NOTE: `safe-outputs.max-patch-size` does NOT propagate via gh-aw v0.74.1
# imports (the scalar is silently reset to the gh-aw default of 1024 in the
# compiled lock). It must stay inline in each importing workflow.
#
# The shared file contributes ONLY these `safe-outputs.*` keys:
#   - threat-detection.continue-on-error
#   - steps (one-step bundle-prerequisite fetch)
#
# Importing workflows still own:
#   - safe-outputs.max-patch-size        (kept inline due to merge limitation)
#   - safe-outputs.create-pull-request   (per-slug title-prefix / labels / etc.)
#   - safe-outputs.dispatch-workflow     (per-slug dispatched workflow list)
#   - safe-outputs.allowed-domains       (inherited from news-safe-outputs-domains.md)
#
# gh-aw merges nested maps shallowly, so this file's keys merge into the
# importing workflow's `safe-outputs:` map without clobbering other entries
# — except `max-patch-size`, which has the documented limitation above.
safe-outputs:
  threat-detection:
    continue-on-error: true
  # The safe_outputs job checks out the current branch tip with fetch-depth:1.
  # When another news PR merges between the agent job and safe-output bundle
  # application, the bundle may require the older triggering commit as a
  # prerequisite. Fetch that commit explicitly so bundle apply does not fail
  # with "Repository lacks these prerequisite commits".
  steps:
    - name: Fetch triggering commit for bundle prerequisites
      if: contains(needs.agent.outputs.output_types, 'create_pull_request')
      shell: bash
      run: |
        if [ -n "${GITHUB_SHA:-}" ] && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
          if ! git fetch --no-tags origin "$GITHUB_SHA"; then
            branch_name="$GITHUB_REF_NAME"
            if [ -z "$branch_name" ]; then
              branch_name=main
            fi
            if git rev-parse --is-shallow-repository | grep -qx true; then
              git fetch --unshallow --no-tags origin "$branch_name"
            else
              git fetch --no-tags origin "$branch_name"
            fi
          fi
        fi
---
