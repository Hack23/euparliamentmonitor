// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Drift-guard test for the executive-brief translation contract.
 *
 * The `news-translate.md` workflow is the canonical orchestrator for the
 * scheduled 3×/day translation pipeline. It MUST hold a specific shape so
 * that operators, reviewers, and future agents can reason about it without
 * reading the entire 300-line workflow body.
 *
 * If any assertion here fails, EITHER the workflow has regressed and must be
 * restored, OR the contract has intentionally evolved and this test should
 * be updated together with `analysis/methodologies/executive-brief-translation-guide.md`
 * and `.github/workflows/README.md`'s "Translation cadence" section.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WORKFLOW_FILE = path.join(
  REPO_ROOT,
  '.github',
  'workflows',
  'news-translate.md',
);
const GUIDE_FILE = path.join(
  REPO_ROOT,
  'analysis',
  'methodologies',
  'executive-brief-translation-guide.md',
);
const TEMPLATE_FILE = path.join(
  REPO_ROOT,
  'analysis',
  'templates',
  'executive-brief-translation-template.md',
);
const DISCOVERY_SCRIPT = path.join(
  REPO_ROOT,
  'scripts',
  'discover-untranslated-briefs.js',
);
const VALIDATOR_SCRIPT = path.join(
  REPO_ROOT,
  'scripts',
  'validate-brief-translations.js',
);

describe('news-translate workflow contract', () => {
  let workflow;

  it('workflow file exists and is non-trivial', () => {
    expect(fs.existsSync(WORKFLOW_FILE)).toBe(true);
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    // The new contract is intentionally lean (~300 lines). The drift-guard
    // ensures we never accidentally re-bloat it back to the legacy 1.7K-line
    // HTML-translation behemoth. Cap raised from 42 KB → 45 KB to admit
    // the largeSource 2-phase strategy section added after the cancelled
    // run #26181499722 (discovery flag + agent prompt guidance). Cap raised
    // again from 45 KB → 46 KB to admit per-language IMF/WEO fixed-token
    // examples for the Nordic + EU-core Latin-script languages after
    // failing run #26219157670 (Norwegian executive-brief_no.md missing
    // 2 of 4 `IMF` tokens — gate #5 fixed-token-preservation). Cap raised
    // again 46 KB → 47 KB to admit the `target_brief` operator-override
    // workflow_dispatch input + the TARGET_BRIEF env wiring + the env
    // comment block explaining its security model. Cap raised 47 KB →
    // 55 KB to admit (a) the skeleton-marker contract added to Phase A
    // after the skeleton-cascade failure #26235374860, (b) the Python-
    // heredoc ban and edit-recovery guidance, (c) the 60-min Time Budget
    // table with the transient-API-error mitigation strategy paragraph.
    expect(workflow.length).toBeGreaterThan(2000);
    expect(workflow.length).toBeLessThan(55000);
  });

  it('runs 3×/day on cron and is workflow_dispatch-enabled', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/cron:\s*"30 6 \* \* \*"/);
    expect(workflow).toMatch(/cron:\s*"30 12 \* \* \*"/);
    expect(workflow).toMatch(/cron:\s*"30 18 \* \* \*"/);
    expect(workflow).toMatch(/workflow_dispatch:/);
  });

  it('exposes max_briefs / max_age_days / include_extended / mode / max_source_lines / target_brief dispatch inputs', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/\bmax_briefs:/);
    expect(workflow).toMatch(/\bmax_age_days:/);
    expect(workflow).toMatch(/\binclude_extended:/);
    expect(workflow).toMatch(/\bmode:/);
    // Regression guard: `max_source_lines` is consumed by the discovery
    // env block (`MAX_SOURCE_LINES: ${{ github.event.inputs.max_source_lines || '300' }}`),
    // so it MUST be declared as a workflow_dispatch input — otherwise the
    // GitHub Actions UI cannot override the 300-line default on a catch-up
    // run and the env block always falls back. See the
    // "parameter wired end-to-end" audit in the PR that introduced this
    // assertion.
    expect(workflow).toMatch(/\bmax_source_lines:/);
    // Regression guard: `target_brief` lets operators (re)translate one
    // specific brief on demand without waiting for the scheduled cadence
    // to pick it up. The discovery script's queue must be filtered to the
    // single brief at parse time so the env block, the CLI flag, and the
    // dispatch UI all stay in sync. See parseTargetBriefSpec in
    // scripts/discover-untranslated-briefs.js.
    expect(workflow).toMatch(/\btarget_brief:/);
  });

  it('keeps the 60-minute hard cap', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    // The 60-min cap is the fleet default for all news-*.md workflows.
    // Better time management (prepare to commit at 40 min) and root-cause
    // fixes for transient-API errors remove the need for a longer cap.
    // Step 4b's emergency-flush guard fires at ≥ 40 elapsed / ≤ 20 remaining.
    expect(workflow).toMatch(/^timeout-minutes:\s*60$/m);
  });

  it('uses claude-sonnet-4.6 as the engine (per approved allow-list)', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/\n  model:\s*claude-sonnet-4\.6\b/);
  });

  it('limits max-continuations to 1 to prevent post-flush engine timeout', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/max-continuations:\s*1\b/);
  });

  it('includes a graceful termination section to prevent engine timeout after PR creation', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/Graceful Termination/i);
    expect(workflow).toMatch(/STOP/);
    expect(workflow).toMatch(/Do NOT start any new translation work/);
  });

  it('delegates discovery to scripts/discover-untranslated-briefs.js', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(
      /node scripts\/discover-untranslated-briefs\.js/,
    );
    expect(workflow).toMatch(/--mode "\$DISCOVERY_MODE"/);
    expect(workflow).toMatch(/--run-number "\$RUN_NUMBER"/);
    // Plan A — pass MAX_SOURCE_LINES so briefs whose source exceeds the
    // threshold are flagged `largeSource: true` in the queue. The agent
    // then switches to the 2-phase skeleton-then-edit strategy below.
    expect(workflow).toMatch(/--max-source-lines "\$MAX_SOURCE_LINES"/);
    expect(workflow).toMatch(/MAX_SOURCE_LINES:/);
    // The queue is consumed from a deterministic temp path.
    expect(workflow).toMatch(/\/tmp\/gh-aw\/discovery\/queue\.json/);
  });

  it('documents the largeSource 2-phase translation strategy in the prompt body', () => {
    // Regression hardening for run #26181499722 — cancelled after 5×
    // transient-API-error loops on the first translation `create` for a
    // 385-line source brief. When `largeSource: true` is set on a
    // queue entry, the agent MUST switch to a skeleton-then-edit
    // strategy that bounds each inference call's output size.
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/largeSource/);
    expect(workflow).toMatch(/sourceLineCount/);
    // The strategy is described in the prompt body so the agent
    // actually applies it (the discovery flag alone is invisible to
    // the LLM otherwise).
    expect(workflow).toMatch(/skeleton/i);
    expect(workflow).toMatch(/Phase A/);
    expect(workflow).toMatch(/Phase B/);
  });

  it('runs the validator as a post-step against the produced translations', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/node scripts\/validate-brief-translations\.js/);
    expect(workflow).toMatch(/Validate brief translations/);
    const validatorBlock = workflow.match(/- name: Validate brief translations[\s\S]*?\n\nengine:/)?.[0] ?? '';
    expect(validatorBlock).not.toMatch(/--no-fail/);
    expect(validatorBlock).not.toMatch(/\|\|\s*true/);
  });

  it('scopes the post-step validator to the current run\'s discovery queue', () => {
    // Regression hardening for the failure pattern in runs #206, #207, #208,
    // #209, #210, #214, #219, #220, #221, #223: the validator was invoked
    // with no --paths argument and therefore scanned every translation in
    // the repo, including older briefs whose source H2 layout was extended
    // AFTER the translations were merged. The translation agent has bounded
    // scope and cannot fix those legacy defects, so they MUST NOT fail a
    // current run. The post-step now derives sibling globs from the
    // discovery queue (one per brief THIS run was asked to translate) and
    // passes them via --paths.
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    const validatorBlock = workflow.match(/- name: Validate brief translations[\s\S]*?\n\nengine:/)?.[0] ?? '';
    expect(validatorBlock).toMatch(/\/tmp\/gh-aw\/discovery\/queue\.json/);
    // The validator is invoked with --paths populated from the queue, not
    // with the repo-wide default fallback (findAllTranslations).
    expect(validatorBlock).toMatch(/--paths "\$\{glob_args\[@\]\}"/);
    // Sibling glob shape: every brief's `executive-brief.md` source maps
    // to its `executive-brief_*.md` sibling translations.
    expect(validatorBlock).toMatch(/executive-brief_\*\.md/);
    // Empty-queue defensive: if the queue is empty/missing, skip validation
    // cleanly rather than running unscoped against the whole repo.
    expect(validatorBlock).toMatch(/skipping validator/);
  });

  it('surfaces the discovery sourceH2Titles / sourceFixedTokens fields in the prompt body', () => {
    // Regression hardening for run #25983007788 — the prompt MUST tell
    // the translator agent to read these queue fields, otherwise it
    // will silently collapse duplicate-titled H2 sections (the failure
    // mode that produced 13 broken sibling translations of
    // 2026-05-16/breaking/executive-brief.md).
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toContain('sourceH2Titles');
    expect(workflow).toContain('sourceFixedTokens');
    expect(workflow).toMatch(/distinct sections/i);
  });

  it('bans shell heredocs for translation output in the Never section', () => {
    // Regression hardening for run #25994653245 — the agent used
    // `cat > file << 'EOF'` heredocs which silently truncate at context
    // limits, dropping the last H2 section(s). The "Never" section MUST
    // explicitly prohibit this pattern so future agents cannot repeat it.
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    // The workflow must mention heredoc in the Never / forbidden section.
    expect(workflow).toMatch(/heredoc/i);
    // Must direct the agent to use the create tool exclusively.
    expect(workflow).toMatch(/create[\s\S]*?tool[\s\S]*?exclusively|exclusively[\s\S]*?create[\s\S]*?tool/i);
  });

  it('requires a per-language H2 spot-check immediately after each file creation', () => {
    // Regression hardening for run #25994653245 — the agent systematically
    // dropped the last H2 (`## IMF Economic Context — May 2026 Update`) in
    // all 13 sibling translations before the final self-validate caught it.
    // The prompt MUST include an inline bash spot-check that fires after
    // EACH individual language file is created so the error is caught
    // before moving to the next language (not after all 13 are done).
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    // A per-language H2 count check bash block must be present.
    expect(workflow).toMatch(/H2 spot.check/i);
    // The variables src_h2 and out_h2 must be populated via grep for ## headings.
    // Allow for optional whitespace between grep flags/pattern components.
    expect(workflow).toMatch(/src_h2\s*=.*grep.*\^\s*##/s);
    expect(workflow).toMatch(/out_h2\s*=.*grep.*\^\s*##/s);
    // The check must compare source vs translation count.
    expect(workflow).toMatch(/src_h2.*out_h2|out_h2.*src_h2/s);
  });

  it('makes the in-agent self-validator a hard pre-flush gate', () => {
    // Regression hardening: in run #25983007788 the agent flushed a PR
    // without re-running the validator on the brief it had just
    // written, and the post-step validator caught 26 violations after
    // the fact. The prompt must enforce a `set -euo pipefail`-style
    // gate that exits non-zero if the validator reports any
    // violations BEFORE the agent calls safeoutputs.
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/hard gate/i);
    expect(workflow).toMatch(/validator-clean/i);
    // The bash gate must explicitly bail (`exit 1`) when the
    // validator returns non-zero so the agent cannot accidentally
    // flush an invalid brief.
    const selfValidateBlock = workflow.match(/Self-validate[\s\S]*?(?=\n\d+\.\s+\*\*Flush)/)?.[0] ?? '';
    expect(selfValidateBlock).toContain('node scripts/validate-brief-translations.js');
    expect(selfValidateBlock).toContain('exit 1');
  });

  it('diagnostic node -e helper uses process.argv[2] not process.argv[1]', () => {
    // Regression guard: for `node -e 'script' arg1`, Node sets process.argv[1]
    // to '[eval]', so require(process.argv[1]) throws "Cannot find module '[eval]'"
    // every time the validator fails — exactly when the diagnostic is most needed.
    // The correct index is process.argv[2].
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).not.toMatch(/process\.argv\[1\]/);
    const selfValidateBlock = workflow.match(/Self-validate[\s\S]*?(?=\n\d+\.\s+\*\*Flush)/)?.[0] ?? '';
    expect(selfValidateBlock).toContain('process.argv[2]');
  });

  it('imports the shared common-settings and MCP-servers configs', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/- shared\/config\/news-common-settings\.md/);
    expect(workflow).toMatch(/- shared\/mcp\/news-mcp-servers\.md/);
  });

  it('declares safe-outputs.threat-detection continue-on-error: true', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(
      /threat-detection:\s*\n\s+continue-on-error:\s+true/,
    );
  });

  it('inlines safe-outputs.max-patch-size (does not propagate via imports)', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    // 4096 KB headroom for catch-up days with max_briefs=4.
    expect(workflow).toMatch(/max-patch-size:\s*4096\b/);
  });

  it('cites the canonical translator guide and template by basename', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toContain('executive-brief-translation-guide.md');
    expect(workflow).toContain('executive-brief-translation-template.md');
  });

  it('bans scripted-substitution shortcuts in the prompt body', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/(scripted dictionary substitution|sed.*awk|No scripted substitution)/i);
  });

  it('keys the PR branch by run date, not by run id', () => {
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/news\/translate-briefs-/);
    expect(workflow).toMatch(/job-discriminator:\s*translate-briefs\b/);
    // Must NOT include ${RUN_ID} in the branch name (legacy regression).
    expect(workflow).not.toMatch(/news\/translate-briefs-\$\{RUN_ID\}/);
    expect(workflow).not.toMatch(/github\.run_attempt/);
  });

  it('Step 0 does not declare a shell BRANCH variable that misleads the agent', () => {
    // Regression hardening for run #26260612873 — Step 0 declared
    // `BRANCH="news/translate-briefs-${RUN_DATE}"` and then echoed it.
    // The agent interpreted the echo as an instruction and ran
    // `git checkout -b "$BRANCH"` after exploratory `git status` and
    // `git log` calls, bloating the conversation context until the
    // Copilot inference call returned "Response was interrupted due to
    // a server error" and the run abandoned before writing a single
    // translation. The PR branch is created automatically by
    // safeoutputs___create_pull_request from staged file changes; the
    // shell prompt must not declare or echo a BRANCH variable that
    // would suggest manual git work.
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).not.toMatch(/^\s*BRANCH=/m);
    expect(workflow).not.toMatch(/echo "Branch:\s+\$\{BRANCH\}"/);
  });

  it('Never section bans manual git operations from the agent bash tool', () => {
    // Companion to the Step 0 fix above: even with BRANCH removed,
    // explicit prohibition of manual git work in the Never section
    // closes the door on the agent re-introducing the same waste
    // pattern (git status / git log / git checkout) on its own.
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/No manual git operations/);
    expect(workflow).toMatch(/git checkout/);
    expect(workflow).toMatch(/git branch/);
    expect(workflow).toMatch(/git status/);
  });

  it('records WORKFLOW_START_EPOCH for wall-clock budget tracking', () => {
    // Regression hardening for run #26002434035 — the copilot engine
    // terminated unexpectedly after writing 10/13 sibling translations
    // (ar, he done; ja, ko, zh missing) and NO safe-output PR was
    // emitted, losing ~25 minutes of translation work. Step 0 MUST
    // anchor an epoch that later bash blocks can read to fire an
    // emergency partial flush before the 60-min cap.
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    // Must contain the exact bash assignment that records the epoch value.
    expect(workflow).toMatch(/WORKFLOW_START_EPOCH=\$\(date -u \+%s\)/);
    // Must redirect the epoch value into the temp file, not just mention the path.
    expect(workflow).toMatch(/echo "\$\{WORKFLOW_START_EPOCH\}" > \/tmp\/gh-aw\/workflow-start-epoch/);
  });

  it('contains a pre-write existence check to break transient-API-error retry loops', () => {
    // Regression hardening for run #26166719293 (and similar runs
    // #26148044780, #26033025615, #26030252646, #26027101797): the agent
    // repeatedly re-announced "I'll write Swedish first" and hit the same
    // transient API error on every retry, making zero progress.
    //
    // The root cause: when gh-aw retries the inference call after a
    // transient API error, the agent's model state rewinds to just before
    // the `create` tool call — it has no memory of whether the file was
    // actually written. Without an explicit on-disk existence check the
    // agent enters an infinite retry loop producing zero output.
    //
    // The fix: a per-language pre-write bash block that checks if the
    // target file already exists on disk before calling `create`. If it
    // does, the agent skips the `create` call and proceeds to the H2
    // spot-check. This breaks the loop on any retry.
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    // The workflow must instruct the agent to check for an existing file
    // before calling the create tool — using the exact heading from the
    // workflow so this cannot silently pass on an unrelated substring.
    expect(workflow).toContain('Per-language pre-write check');
    // The bash block must reference the exact target file path so it actually
    // guards the right file (not just any markdown).
    expect(workflow).toMatch(/executive-brief_.*\.md/);
    // The check must tell the agent to skip the create call when the file is
    // already on disk — match the explicit echo written in the bash block.
    expect(workflow).toContain('skip_create=true');
    // There must also be a brief-level pre-loop scan that surfaces already-
    // written siblings so the agent can resume mid-brief after a retry.
    // Match the exact heading text from the workflow.
    expect(workflow).toContain('Pre-loop: scan existing translations');
  });

  it('contains an emergency partial-flush safety net (Step 4b wall-clock guard)', () => {
    // Same regression: the workflow MUST instruct the agent to flush
    // whatever is on disk when wall-clock budget is exhausted, even if
    // the current brief is only partially translated. A partial-brief
    // PR is always preferable to a zero-PR engine termination.
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    // The bash block MUST contain the exact conditional that compares elapsed
    // and remaining minutes before triggering the emergency flush. Checking
    // individual tokens (ELAPSED_MIN, -ge, 50) is insufficient — a regression
    // that removes the `||` branch or rearranges the test would still satisfy
    // token-only assertions. Thresholds: 40 min elapsed / 20 min remaining
    // (prepare to commit at minute 40 of the 60-min cap).
    expect(workflow).toMatch(
      /if \[ "\$\{ELAPSED_MIN\}" -ge 40 \] \|\| \[ "\$\{REMAINING_MIN\}" -le 20 \]/,
    );
    // The bash block MUST write the emergency-flush marker file so later
    // post-step diagnostics can detect the early flush.
    expect(workflow).toMatch(/emergency-flush-\$\{RUN_ID\}\.marker/);
    // The prompt body must explicitly authorize partial-progress flushes
    // (cancelling the legacy "Never flush before 13 langs complete" rule).
    expect(workflow).toMatch(/emergency partial flush|emergency-flush|EMERGENCY FLUSH/i);
    expect(workflow).toMatch(/partial[- ]progress/i);
    // The legacy "Never flush before all 13 languages" rule must be gone.
    expect(workflow).not.toMatch(
      /\*\*Never\*\* call `safeoutputs___create_pull_request` before at least one\s*brief has all 13 languages/,
    );
  });

  it('requires the Phase A skeleton marker contract for largeSource briefs', () => {
    // Regression guard for run #26235374860: the 2-phase largeSource
    // strategy wrote skeleton files into the canonical
    // analysis/daily/<date>/<slug>/executive-brief_<lang>.md location
    // with no machine-readable marker. The Step 4b emergency partial
    // flush then committed 10 unfilled skeletons alongside 3 real
    // translations, and the post-step validator's length-floor /
    // fixed-token / heading-parity / mermaid-parity gates flagged
    // 50+ cascading violations across the 10 skeletons, marking the
    // job as `failure` even though the partial-rescue PR succeeded.
    // The fix is a contract between the workflow and
    // scripts/validate-brief-translations.js: Phase A files MUST
    // declare themselves with a `<!-- translation-skeleton: ... -->`
    // marker so the validator can emit a single non-blocking advisory
    // instead of cascading violations.
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/<!-- translation-skeleton:\s*lang=/);
    expect(workflow).toMatch(/phase=A/);
    // The prompt must also instruct the agent to REMOVE the marker
    // after the last Phase B edit so the file is treated as a real
    // translation and gets strict validation.
    expect(workflow).toMatch(/remove the skeleton marker/i);
  });

  it('bans Python heredocs as a fallback for translation output', () => {
    // Regression guard for run #26235374860: when the Norwegian
    // Phase B `edit` returned "No match found", the agent fell back
    // to `python3 << 'PYEOF'` to rewrite the file. Heredocs of any
    // language silently truncate at the context-window boundary —
    // the existing rule banned only shell heredocs (`cat >>`). The
    // §"🚫 Never" section must explicitly call out Python heredocs
    // too and document the approved recovery path (re-read with
    // `view`, retry `edit`, or rewrite with `create`).
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/python3 << 'PYEOF'/);
    expect(workflow).toMatch(/Never.*heredoc|heredoc.*banned|heredocs of any/i);
  });

  it('declares a transient-API-error mitigation strategy', () => {
    // Regression guard for run #26235374860: the agent had no documented
    // strategy for the gh-aw harness's transient-API-error retry loops.
    // Rather than budgeting extra time (which led to the 90-min cap
    // experiment), the workflow now documents detection heuristics (two
    // consecutive edit calls > 5 min = retry loop) and triggers Step 4b
    // immediately. The §"⏱️ Time Budget" section must explicitly call out
    // transient-API-error handling so the agent can respond defensively.
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(/transient[- ]?API[- ]?error/i);
    expect(workflow).toMatch(/retry.loop/i);
  });

  it('imports shared/config/news-pat-pr-fallback.md with translate-briefs slug', () => {
    // Regression guard for run #26005838669: safe_outputs git push was
    // rejected ("refusing to allow a GitHub App to create or update workflow
    // `.github/workflows/agentics-maintenance.yml` without `workflows`
    // permission") because main advanced during the 60-min run and the
    // bundle's parent commit had stale workflow files. fallback-as-issue
    // then created an issue instead of a PR. The host-side PAT fallback
    // mechanism that the 14 article workflows use must also cover
    // news-translate so a future push rejection recovers automatically.
    workflow = fs.readFileSync(WORKFLOW_FILE, 'utf8');
    expect(workflow).toMatch(
      /-\s+uses:\s+shared\/config\/news-pat-pr-fallback\.md\b/,
    );
    expect(workflow).toMatch(/slug:\s+translate-briefs\b/);
    expect(workflow).toMatch(
      /workflowName:\s+"News:\s+Translate Executive Briefs"/,
    );
    // The duplicate "Capture agent recovery patch" post-step that used to
    // live inline must be removed — the shared import provides it. A
    // duplicate would cause two recovery patches to be written and ship
    // contradictory artifacts to the fallback job. The assertion targets
    // an actual `- name:` step declaration, not the explanatory comment
    // that documents why the inline copy was removed.
    const postSteps = workflow.split('post-steps:')[1] ?? '';
    expect(
      postSteps.match(/^\s*-\s+name:\s+Capture agent recovery patch/gm) ?? [],
    ).toHaveLength(0);
  });
});

describe('translation pipeline foundation', () => {
  it('translator guide is committed and non-trivial', () => {
    expect(fs.existsSync(GUIDE_FILE)).toBe(true);
    const guide = fs.readFileSync(GUIDE_FILE, 'utf8');
    expect(guide.length).toBeGreaterThan(5000);
    // Must enumerate FIXED TOKEN preservation rules.
    expect(guide).toContain('IMF');
    expect(guide).toContain('WEO');
    expect(guide).toContain('data-vintage=');
    expect(guide).toMatch(/TA-NN-YYYY-NNNN|TA-\d/);
  });

  it('translation template is committed and references the guide', () => {
    expect(fs.existsSync(TEMPLATE_FILE)).toBe(true);
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
    expect(template).toContain('executive-brief-translation-guide.md');
  });

  it('discovery and validator scripts exist and export their public API', () => {
    expect(fs.existsSync(DISCOVERY_SCRIPT)).toBe(true);
    expect(fs.existsSync(VALIDATOR_SCRIPT)).toBe(true);

    const discovery = fs.readFileSync(DISCOVERY_SCRIPT, 'utf8');
    expect(discovery).toMatch(/export const TARGET_LANGS\b/);
    expect(discovery).toMatch(/export function buildQueue\b/);

    const validator = fs.readFileSync(VALIDATOR_SCRIPT, 'utf8');
    expect(validator).toMatch(/export function validateTranslation\b/);
    expect(validator).toMatch(/export const LENGTH_FLOOR_RATIO\b/);
    expect(validator).toMatch(/export const FIXED_TOKEN_PATTERNS\b/);
  });

  it('package.json wires npm-run-script entries for discovery and validation', () => {
    const pkgPath = path.join(REPO_ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.scripts['discover:untranslated-briefs']).toBe(
      'node scripts/discover-untranslated-briefs.js',
    );
    expect(pkg.scripts['validate:translations']).toBe(
      'node scripts/validate-brief-translations.js',
    );
  });
});
