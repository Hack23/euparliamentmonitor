#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowsDir = path.join(repoRoot, '.github', 'workflows');

const articleWorkflows = [
  'news-breaking',
  'news-committee-reports',
  'news-month-ahead',
  'news-month-in-review',
  'news-motions',
  'news-propositions',
  'news-week-ahead',
  'news-week-in-review',
];

function readWorkflowName(workflowId) {
  const sourcePath = path.join(workflowsDir, `${workflowId}.md`);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const match = source.match(/^name:\s*"([^"]+)"/mu);
  if (!match) {
    throw new Error(`Unable to find workflow name in ${sourcePath}`);
  }
  return match[1];
}

function slugFromWorkflowId(workflowId) {
  return workflowId.replace(/^news-/u, '');
}

function fallbackStep(workflowId) {
  const slug = slugFromWorkflowId(workflowId);
  const workflowName = readWorkflowName(workflowId);
  return `      - name: Host-side PAT PR fallback
        if: always()
        env:
          GH_TOKEN: \${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
          GH_AW_PAT_PR_FALLBACK_TOKEN: \${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
          GH_AW_PAT_FALLBACK_SLUG: ${slug}
          GH_AW_PAT_FALLBACK_WORKFLOW_NAME: "${workflowName}"
          GH_AW_PAT_FALLBACK_RUN_URL: \${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}
          GH_AW_SAFE_OUTPUTS: \${{ steps.set-runtime-paths.outputs.GH_AW_SAFE_OUTPUTS }}
        run: bash scripts/gh-aw-pat-pr-fallback.sh
`;
}

function patchLockFile(workflowId) {
  const lockPath = path.join(workflowsDir, `${workflowId}.lock.yml`);
  let lock = fs.readFileSync(lockPath, 'utf8');
  const marker = '      - name: Host-side PAT PR fallback\n';
  if (lock.includes(marker)) {
    const start = lock.indexOf(marker);
    const nextStep = lock.indexOf('\n      - name: ', start + marker.length);
    if (nextStep === -1) {
      throw new Error(`Unable to find step boundary after existing fallback in ${lockPath}`);
    }
    lock = `${lock.slice(0, start)}${fallbackStep(workflowId)}${lock.slice(nextStep + 1)}`;
    fs.writeFileSync(lockPath, lock);
    return;
  }

  const detectStep =
    '      - name: Detect Copilot errors\n' +
    '        id: detect-copilot-errors\n' +
    '        if: always()\n' +
    '        continue-on-error: true\n' +
    '        run: node "${RUNNER_TEMP}/gh-aw/actions/detect_copilot_errors.cjs"\n';

  if (!lock.includes(detectStep)) {
    throw new Error(`Unable to find Detect Copilot errors step in ${lockPath}`);
  }

  lock = lock.replace(detectStep, `${detectStep}${fallbackStep(workflowId)}`);
  fs.writeFileSync(lockPath, lock);
}

for (const workflowId of articleWorkflows) {
  patchLockFile(workflowId);
}

console.log(`patch-gh-aw-pat-pr-fallback: patched ${articleWorkflows.length} article workflow lock files`);
