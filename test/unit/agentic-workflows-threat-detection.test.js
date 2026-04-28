// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WORKFLOWS_DIR = path.join(ROOT, '.github', 'workflows');

describe('agentic workflow threat detection policy', () => {
  it('keeps safe-output threat detection warning-only for every news workflow', () => {
    const workflows = fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) => name.startsWith('news-') && name.endsWith('.md'))
      .sort();

    expect(workflows.length).toBeGreaterThan(0);

    for (const workflow of workflows) {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8');
      expect(content, workflow).toMatch(
        /^safe-outputs:\n(?:  .*\n)*?  threat-detection:\n    continue-on-error: true$/m,
      );
    }
  });
});
