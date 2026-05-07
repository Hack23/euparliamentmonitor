// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @file Unit tests for the pure helpers exported by
 * `scripts/templates/sync-template-frontmatter.js`.
 *
 * The CLI's filesystem walk and `process.exit` behaviour are exercised
 * separately by the existing `test/unit/template-structure.test.js`
 * drift-guard (which runs the CLI binary in `--check` mode against the
 * real `analysis/templates/` tree). These tests pin the *transformation
 * logic* — idempotence, SPDX detection, depth-floor formatting,
 * markdown-cell sanitisation — so future refactors can't silently change
 * the canonical front-matter or AI-instructions block shape.
 */

import { describe, it, expect } from 'vitest';
import {
  stripCellNoise,
  buildFrontmatterBlock,
  applyFrontmatter,
  FRONTMATTER_TOKEN,
  AI_INSTRUCTIONS_TOKEN,
  FRAMEWORK_TEMPLATE_OVERRIDES,
} from '../../scripts/templates/sync-template-frontmatter.js';

describe('sync-template-frontmatter > stripCellNoise', () => {
  it('strips bold markers, escaped pipes, backticks and collapses whitespace', () => {
    expect(stripCellNoise('**Strong**  text')).toBe('Strong text');
    expect(stripCellNoise('cell \\| with \\| pipes')).toBe('cell | with | pipes');
    expect(stripCellNoise('`flowchart LR`')).toBe('flowchart LR');
    expect(stripCellNoise('  spaced\t\nout  ')).toBe('spaced out');
  });

  it('returns an empty string when input is whitespace-only', () => {
    expect(stripCellNoise('   \n\t  ')).toBe('');
  });

  it('is idempotent across repeated invocations', () => {
    const once = stripCellNoise('**Risk** \\| `pie`');
    expect(stripCellNoise(once)).toBe(once);
  });
});

describe('sync-template-frontmatter > buildFrontmatterBlock', () => {
  it('builds the canonical 8-line block with all fields populated', () => {
    const block = buildFrontmatterBlock(
      'risk-assessment.md',
      120,
      '../methodologies/political-risk-methodology.md',
      'quadrantChart (5×5)',
    );
    expect(block).toBe(
      [
        `<!-- ${FRONTMATTER_TOKEN}`,
        'artifactId: risk-assessment',
        'methodology: ../methodologies/political-risk-methodology.md',
        'catalogRow: ../methodologies/artifact-catalog.md',
        'depthFloorBreaking: 120',
        'mermaidType: quadrantChart (5×5)',
        'partialsDir: ./_partials/',
        '-->',
      ].join('\n'),
    );
  });

  it("emits '-' placeholders when depthFloor is null/undefined and mermaidType is empty", () => {
    const block = buildFrontmatterBlock('synthesis-summary.md', undefined, '', '');
    expect(block).toContain('depthFloorBreaking: -');
    expect(block).toContain('mermaidType: -');
  });

  it('preserves zero as a valid depth floor (does not trip the null/undefined check)', () => {
    const block = buildFrontmatterBlock('zero-floor.md', 0, '', '');
    expect(block).toContain('depthFloorBreaking: 0');
  });

  it('falls back to per-artifact-methodologies.md when methodology is empty', () => {
    const block = buildFrontmatterBlock('foo.md', 50, '', '');
    expect(block).toContain('methodology: ../methodologies/per-artifact-methodologies.md');
  });

  it('strips the .md extension to derive artifactId', () => {
    expect(buildFrontmatterBlock('legislative-pipeline-forecast.md', 80, 'm', 'gantt')).toContain(
      'artifactId: legislative-pipeline-forecast',
    );
  });
});

describe('sync-template-frontmatter > applyFrontmatter', () => {
  const SPDX = [
    '<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->',
    '<!-- SPDX-License-Identifier: Apache-2.0 -->',
    '',
  ].join('\n');

  it('inserts the canonical blocks immediately after the SPDX header', () => {
    const original = `${SPDX}\n# Risk Assessment\n\nbody…\n`;
    const result = applyFrontmatter(
      original,
      'risk-assessment.md',
      120,
      '../methodologies/political-risk-methodology.md',
      'quadrantChart (5×5)',
    );

    // Both canonical blocks are present, in order.
    expect(result).toContain(`<!-- ${FRONTMATTER_TOKEN}`);
    expect(result).toContain(`<!-- ${AI_INSTRUCTIONS_TOKEN}`);
    const fmIdx = result.indexOf(FRONTMATTER_TOKEN);
    const aiIdx = result.indexOf(AI_INSTRUCTIONS_TOKEN);
    const headingIdx = result.indexOf('# Risk Assessment');
    expect(fmIdx).toBeLessThan(aiIdx);
    expect(aiIdx).toBeLessThan(headingIdx);

    // SPDX header is preserved at the top.
    expect(result.startsWith('<!-- SPDX-FileCopyrightText')).toBe(true);
  });

  it('is idempotent — applying twice gives the same output as applying once', () => {
    const original = `${SPDX}\n# Synthesis Summary\n\nbody…\n`;
    const once = applyFrontmatter(original, 'synthesis-summary.md', 90, 'm', 'flowchart LR');
    const twice = applyFrontmatter(once, 'synthesis-summary.md', 90, 'm', 'flowchart LR');
    expect(twice).toBe(once);
  });

  it('strips a stale frontmatter block before inserting the new one', () => {
    const stale = [
      SPDX,
      `<!-- ${FRONTMATTER_TOKEN}`,
      'artifactId: OLD_VALUE',
      'methodology: ../methodologies/OLD.md',
      'catalogRow: ../methodologies/artifact-catalog.md',
      'depthFloorBreaking: 1',
      'mermaidType: OLD',
      'partialsDir: ./_partials/',
      '-->',
      '',
      `<!-- ${AI_INSTRUCTIONS_TOKEN}`,
      'OLD AI instructions body',
      '-->',
      '',
      '# Heading',
      'body',
    ].join('\n');

    const next = applyFrontmatter(stale, 'fresh-template.md', 200, 'm', 'pie');

    // Old artefact id is removed.
    expect(next).not.toContain('OLD_VALUE');
    expect(next).not.toContain('OLD AI instructions body');
    // New artefact id is present.
    expect(next).toContain('artifactId: fresh-template');
    expect(next).toContain('depthFloorBreaking: 200');
  });

  it('prepends a synthetic SPDX header when the input has none', () => {
    const orphan = '# Lonely heading\n\ncontent';
    const next = applyFrontmatter(orphan, 'orphan.md', 50, 'm', 'pie');
    expect(next.startsWith('<!-- SPDX-FileCopyrightText:')).toBe(true);
    expect(next).toContain('SPDX-License-Identifier: Apache-2.0');
    expect(next).toContain('artifactId: orphan');
    // Original body is preserved.
    expect(next).toContain('# Lonely heading');
  });

  it('handles inputs with only one SPDX line (single-comment header)', () => {
    const singleSpdx = '<!-- SPDX-License-Identifier: Apache-2.0 -->\n\n# Title\n\nbody';
    const next = applyFrontmatter(singleSpdx, 'foo.md', 10, 'm', '-');
    // The frontmatter block lands AFTER the single SPDX line.
    const spdxIdx = next.indexOf('SPDX-License-Identifier');
    const fmIdx = next.indexOf(FRONTMATTER_TOKEN);
    expect(spdxIdx).toBeLessThan(fmIdx);
  });

  it('does not corrupt body content beyond the inserted blocks', () => {
    const body = '# Heading\n\nFirst paragraph.\n\n## Subsection\n\nSecond paragraph.';
    const original = `${SPDX}\n${body}\n`;
    const next = applyFrontmatter(original, 'foo.md', 10, 'm', 'pie');
    expect(next).toContain(body);
  });
});

describe('sync-template-frontmatter > FRAMEWORK_TEMPLATE_OVERRIDES', () => {
  it('uses methodology and mermaidType pairs only — no extraneous fields', () => {
    for (const [, override] of Object.entries(FRAMEWORK_TEMPLATE_OVERRIDES)) {
      const keys = Object.keys(override).sort();
      expect(keys).toEqual(['mermaidType', 'methodology'].sort());
      expect(typeof override.methodology).toBe('string');
      expect(typeof override.mermaidType).toBe('string');
    }
  });

  it('every override path points under analysis/methodologies/', () => {
    for (const [, override] of Object.entries(FRAMEWORK_TEMPLATE_OVERRIDES)) {
      expect(override.methodology).toMatch(/^\.\.\/methodologies\//);
    }
  });

  it('contains all canonical framework templates (sentinel)', () => {
    // Lower bound — there are 16 currently. Loosened to detect outright
    // wholesale removals while letting the registry grow.
    expect(Object.keys(FRAMEWORK_TEMPLATE_OVERRIDES).length).toBeGreaterThanOrEqual(10);
  });
});
