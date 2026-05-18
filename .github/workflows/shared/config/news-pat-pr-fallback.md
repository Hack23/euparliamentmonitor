---
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# Shared `post-steps:` + `jobs.pat-pr-fallback` definition for the 14 unified
# `news-*.md` article workflows. Structurally identical across all 14
# (verified via `md5sum` of the trimmed-comment YAML); the only per-slug
# values are the 2 env vars `GH_AW_PAT_FALLBACK_SLUG` and
# `GH_AW_PAT_FALLBACK_WORKFLOW_NAME`. Those are now parameterized via the
# gh-aw `import-schema:` mechanism — callers pass them via `with:`.
#
# Contributes to the importing workflow's frontmatter:
#   - post-steps[]                 — agent-patch capture (identical, no params)
#   - jobs.pat-pr-fallback         — host-side PAT recovery job (parameterized)
#
# The PAT recovery contract: `scripts/gh-aw-pat-pr-fallback.sh` exits early
# when `GH_AW_SAFE_OUTPUTS_RESULT=success` (plumbed as
# `${{ needs.safe_outputs.result }}` below). The fallback runs ONLY when
# safe_outputs failed. See `.github/prompts/09-troubleshooting.md` row
# "Duplicate fallback PR after a successful safe_outputs PR" and PR #1902 /
# #1903 forensic history for why this guard is load-bearing.
#
# To call this shared file from an article workflow, add to `imports:`:
#   - uses: shared/config/news-pat-pr-fallback.md
#     with:
#       slug: <article-type-slug>           # e.g. "breaking"
#       workflowName: "<Full workflow name>" # e.g. "News: EU Parliament Breaking News — Unified"
#
# Drift-guard: test/unit/agentic-workflows-threat-detection.test.js asserts
# every article workflow imports this file and does not re-inline the
# pat-pr-fallback job.

import-schema:
  slug:
    type: string
    required: true
    description: Article-type slug (e.g. "breaking", "motions"). Plumbed into the GH_AW_PAT_FALLBACK_SLUG env var of the recovery job so emitted PR titles, branch names, and recovery logs are slug-tagged.
  workflowName:
    type: string
    required: true
    description: Human-readable workflow name as it appears in the GitHub Actions UI. Plumbed into the GH_AW_PAT_FALLBACK_WORKFLOW_NAME env var; surfaced in recovery commit messages and PR descriptions.

# Post-step: captures `/tmp/gh-aw/aw-agent-recovery.patch` from the news/*
# branch on every run where the agent committed work. gh-aw's safe-outputs
# `aw-*.patch` is only emitted for successful PR-bundle runs; analyses
# completed but uncommitted by safe-outputs would otherwise be silently lost
# when the runner is reaped. The host-side pat-pr-fallback job below
# downloads this patch artifact and only applies it when safe_outputs
# explicitly failed (the script short-circuits on
# GH_AW_SAFE_OUTPUTS_RESULT=success). Originated from run #25028873034
# (week-in-review) and extended after run #25541403260 (motions) exposed a
# bundle prerequisite failure after the fallback job had already skipped.
post-steps:
  - name: Capture agent recovery patch
    if: always()
    continue-on-error: true
    run: bash scripts/gh-aw-capture-agent-patch.sh

jobs:
  pat-pr-fallback:
    name: Host-side PAT PR fallback
    needs: [agent, detection, safe_outputs]
    if: >
      always() && needs.agent.result != 'skipped' &&
      (needs.detection.result == 'success' || needs.detection.result == 'skipped')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          ref: ${{ github.base_ref || github.event.pull_request.base.ref || github.ref_name || github.event.repository.default_branch }}
          token: ${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
          persist-credentials: false
          # Quoted to prevent gh-aw's parameterized-import YAML re-serializer
          # from emitting `1.0` for this integer (causes spurious lock-file
          # diffs even though GitHub Actions accepts both).
          fetch-depth: "1"

      - name: Download agent artifact
        uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8.0.1
        with:
          name: agent
          path: /tmp/gh-aw/

      - name: Run host-side PAT PR fallback
        env:
          GH_TOKEN: ${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
          GH_AW_PAT_PR_FALLBACK_TOKEN: ${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
          GH_AW_PAT_FALLBACK_SLUG: "${{ github.aw.import-inputs.slug }}"
          GH_AW_SAFE_OUTPUTS_RESULT: ${{ needs.safe_outputs.result }}
          # Wire safe_outputs job outputs so the fallback can detect the case
          # where safe_outputs reports job-level success but its internal
          # create_pull_request push failed and fell back to a review issue
          # (gh-aw bumps code_push_failure_count). Without this env wiring the
          # script defaults the count to 0 and short-circuits on
          # GH_AW_SAFE_OUTPUTS_RESULT=success, leaving the bundle stranded in
          # an issue comment — root cause of regression run #26017383773
          # (propositions 2026-05-18) where the bundle push failed but the
          # PAT fallback never ran because this env var was missing.
          GH_AW_CODE_PUSH_FAILURE_COUNT: ${{ needs.safe_outputs.outputs.code_push_failure_count }}
          GH_AW_CODE_PUSH_FAILURE_ERRORS: ${{ needs.safe_outputs.outputs.code_push_failure_errors }}
          GH_AW_PAT_FALLBACK_WORKFLOW_NAME: "${{ github.aw.import-inputs.workflowName }}"
          GH_AW_PAT_FALLBACK_RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        run: bash scripts/gh-aw-pat-pr-fallback.sh
---
