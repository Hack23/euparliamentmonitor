// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import {
  hasPlaceholders,
  hasMermaid,
  hasWepBand,
  hasAdmiraltyGrade,
  hasBluf,
  hasReaderBlock,
  countSatBullets,
  hasSourceDiversityEvidence,
  hasImfFigureClaim,
  findWbEconomicIndicator,
  hasWbEconomicClaim,
  computeEffectiveMinLines,
  resolveDataModeReduction,
  requiresMermaid,
  createEmptyResult,
} from '../../scripts/workflows/completeness-gate/validators.js';

describe('completeness-gate/validators', () => {
  describe('hasPlaceholders', () => {
    it('should detect [AI_ANALYSIS_REQUIRED] marker', () => {
      expect(hasPlaceholders('Some text [AI_ANALYSIS_REQUIRED] here')).toBe(true);
    });

    it('should detect AI_ANALYSIS_PENDING marker', () => {
      expect(hasPlaceholders('AI_ANALYSIS_PENDING section')).toBe(true);
    });

    it('should detect [TO BE FILLED] marker', () => {
      expect(hasPlaceholders('[TO BE FILLED]')).toBe(true);
    });

    it('should detect [TBD] marker (case-insensitive)', () => {
      expect(hasPlaceholders('[tbd]')).toBe(true);
      expect(hasPlaceholders('[TBD]')).toBe(true);
    });

    it('should detect TODO: at start of line', () => {
      expect(hasPlaceholders('TODO: implement this')).toBe(true);
    });

    it('should return false for clean content', () => {
      expect(hasPlaceholders('This is fully written analysis content.')).toBe(false);
    });

    it('should exempt meta-doc contexts (template instructions)', () => {
      expect(hasPlaceholders('template-instructions: [AI_ANALYSIS_REQUIRED]')).toBe(false);
    });
  });

  describe('hasMermaid', () => {
    it('should detect mermaid fenced block', () => {
      expect(hasMermaid('```mermaid\nflowchart LR\nA --> B\n```')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(hasMermaid('```Mermaid\nsequenceDiagram\n```')).toBe(true);
    });

    it('should return false when no mermaid block', () => {
      expect(hasMermaid('```javascript\nconsole.log("hi")\n```')).toBe(false);
    });
  });

  describe('hasWepBand', () => {
    it('should detect "Almost Certain"', () => {
      expect(hasWepBand('Almost Certain (WEP: 95%+)')).toBe(true);
    });

    it('should detect "Likely"', () => {
      expect(hasWepBand('This outcome is Likely.')).toBe(true);
    });

    it('should detect "WEP:" prefix followed by word', () => {
      expect(hasWepBand('WEP:high confidence assessment')).toBe(true);
    });

    it('should detect "Even Chance"', () => {
      expect(hasWepBand('Even Chance of success')).toBe(true);
    });

    it('should return false when no WEP band', () => {
      expect(hasWepBand('No probability assessment here')).toBe(false);
    });
  });

  describe('hasAdmiraltyGrade', () => {
    it('should detect Admiralty grade in table row', () => {
      expect(hasAdmiraltyGrade('| Source | A1 | EP plenary record |')).toBe(true);
    });

    it('should detect grade B2 with spacing', () => {
      expect(hasAdmiraltyGrade('The source is rated B2 by analysts')).toBe(true);
    });

    it('should not match arbitrary alphanumeric (e.g. G7)', () => {
      expect(hasAdmiraltyGrade('The G7 summit discussed climate')).toBe(false);
    });

    it('should return false when no Admiralty grade', () => {
      expect(hasAdmiraltyGrade('No grading in this text')).toBe(false);
    });
  });

  describe('hasBluf', () => {
    it('should detect "BLUF:" marker', () => {
      expect(hasBluf('BLUF: The key finding is...')).toBe(true);
    });

    it('should detect "BLUF." marker', () => {
      expect(hasBluf('BLUF. Summary goes here')).toBe(true);
    });

    it('should return false without BLUF marker', () => {
      expect(hasBluf('This is a summary paragraph')).toBe(false);
    });
  });

  describe('hasReaderBlock', () => {
    it('should detect "## Reader" heading', () => {
      expect(hasReaderBlock('## Reader\n\nThis section...')).toBe(true);
    });

    it('should detect "## For Citizens" heading', () => {
      expect(hasReaderBlock('## For Citizens\n\nKey takeaways...')).toBe(true);
    });

    it('should detect "## What This Means" heading', () => {
      expect(hasReaderBlock('## What This Means\n\nExplanation...')).toBe(true);
    });

    it('should detect "### Reader Briefing" heading', () => {
      expect(hasReaderBlock('### Reader Briefing\n\nDetails...')).toBe(true);
    });

    it('should return false without reader block', () => {
      expect(hasReaderBlock('## Technical Analysis\n\nData...')).toBe(false);
    });
  });

  describe('countSatBullets', () => {
    it('should count bullet items', () => {
      const content = `
- SAT 1: Analysis of Competing Hypotheses
- SAT 2: Key Assumptions Check
- SAT 3: Indicators Validation
      `.trim();
      expect(countSatBullets(content)).toBe(3);
    });

    it('should count numbered items', () => {
      const content = '1. First\n2. Second\n3. Third';
      expect(countSatBullets(content)).toBe(3);
    });

    it('should return 0 for no bullets', () => {
      expect(countSatBullets('Just a paragraph without any list items.')).toBe(0);
    });
  });

  describe('hasSourceDiversityEvidence', () => {
    it('should detect MCP tool reference', () => {
      expect(hasSourceDiversityEvidence('Used get_procedures to fetch legislative data')).toBe(true);
    });

    it('should detect analyze_ tool reference', () => {
      expect(hasSourceDiversityEvidence('analyze_voting_patterns revealed...')).toBe(true);
    });

    it('should detect structured evidence table with Source header, separator, and data row', () => {
      const tableContent =
        '| Source | Date | Finding |\n|--------|------|----------|\n| IMF WEO | 2026 | GDP 1.1% |';
      expect(hasSourceDiversityEvidence(tableContent)).toBe(true);
    });

    it('should reject a header-only table (no data rows after separator)', () => {
      // Header + separator only — no data rows should not satisfy the check
      expect(hasSourceDiversityEvidence('| Source | Date | Finding |\n|--------|------|----------|')).toBe(false);
    });

    it('should reject a table without Source/Evidence/Reference header', () => {
      // A plain markdown table without the required header keywords is not evidence
      expect(hasSourceDiversityEvidence('| Country | Year | Value |\n|---------|------|-------|\n| DE | 2025 | 5 |')).toBe(false);
    });

    it('should reject a single table row without header', () => {
      // A lone pipe-row with no header is not sufficient
      expect(hasSourceDiversityEvidence('| Some | Data | Here |')).toBe(false);
    });

    it('should return false without evidence', () => {
      expect(hasSourceDiversityEvidence('Generic analysis without tool references.')).toBe(false);
    });
  });

  describe('hasImfFigureClaim', () => {
    it('should detect IMF with numeric figure', () => {
      expect(hasImfFigureClaim('IMF WEO April 2026 reports Germany at 1.1% GDP growth')).toBe(true);
    });

    it('should detect IMF with billion units', () => {
      expect(hasImfFigureClaim('The IMF estimates 250 billion EUR in fiscal transfers')).toBe(true);
    });

    it('should return false without IMF figure claim', () => {
      expect(hasImfFigureClaim('The IMF published a new report on governance')).toBe(false);
    });
  });

  describe('findWbEconomicIndicator', () => {
    it('should detect NY.GDP codes', () => {
      expect(findWbEconomicIndicator('Data from NY.GDP.MKTP.CD shows...')).toBe('NY.GDP.MKTP.CD');
    });

    it('should detect FP.CPI codes', () => {
      expect(findWbEconomicIndicator('Using FP.CPI.TOTL.ZG indicator')).toBe('FP.CPI.TOTL.ZG');
    });

    it('should return null for clean content', () => {
      expect(findWbEconomicIndicator('No WB codes here')).toBeNull();
    });
  });

  describe('hasWbEconomicClaim', () => {
    it('should detect WB GDP claim', () => {
      expect(hasWbEconomicClaim('World Bank data shows GDP growth of 2.1%')).toBe(true);
    });

    it('should detect WB inflation claim', () => {
      expect(hasWbEconomicClaim('World Bank estimates inflation at 3.5%')).toBe(true);
    });

    it('should return false for non-economic WB reference', () => {
      expect(hasWbEconomicClaim('World Bank WGI governance index improved significantly for the country in 2025')).toBe(false);
    });
  });

  describe('computeEffectiveMinLines', () => {
    const rules = {
      defaultMinLines: 30,
      minLines: { 'intelligence/synthesis-summary.md': 80 },
    };

    it('should use per-artifact override when available', () => {
      expect(computeEffectiveMinLines('intelligence/synthesis-summary.md', rules, 1.0)).toBe(80);
    });

    it('should fall back to defaultMinLines', () => {
      expect(computeEffectiveMinLines('intelligence/unknown.md', rules, 1.0)).toBe(30);
    });

    it('should apply data-mode reduction (uses Math.floor, not Math.ceil)', () => {
      // 80 * 0.75 = 60.0 → floor = 60
      expect(computeEffectiveMinLines('intelligence/synthesis-summary.md', rules, 0.75)).toBe(60);
      // 30 * 0.75 = 22.5 → floor = 22 (not Math.ceil = 23)
      expect(computeEffectiveMinLines('intelligence/unknown.md', rules, 0.75)).toBe(22);
    });

    it('should clamp to at least 1 in minimal mode', () => {
      const narrowRules = { defaultMinLines: 1 };
      // 1 * 0.65 = 0.65 → floor = 0, clamped to 1
      expect(computeEffectiveMinLines('any.md', narrowRules, 0.65)).toBe(1);
    });

    it('should use explicit minLines when higher', () => {
      expect(computeEffectiveMinLines('intelligence/unknown.md', rules, 1.0, 50)).toBe(50);
    });

    it('should not lower with explicit minLines', () => {
      expect(computeEffectiveMinLines('intelligence/synthesis-summary.md', rules, 1.0, 20)).toBe(80);
    });
  });

  describe('resolveDataModeReduction', () => {
    it('should return 1.0 for undefined (full mode)', () => {
      expect(resolveDataModeReduction(undefined)).toBe(1.0);
    });

    it('should return 1.0 for "full"', () => {
      expect(resolveDataModeReduction('full')).toBe(1.0);
    });

    it('should return 0.75 for "title-only"', () => {
      expect(resolveDataModeReduction('title-only')).toBe(0.75);
    });

    it('should return 0.85 for "degraded-imf"', () => {
      expect(resolveDataModeReduction('degraded-imf')).toBe(0.85);
    });

    it('should return 0.65 for "minimal"', () => {
      expect(resolveDataModeReduction('minimal')).toBe(0.65);
    });
  });

  describe('requiresMermaid', () => {
    it('should return true for explicitly listed path', () => {
      const rules = { mermaidRequired: ['intelligence/scenario-forecast.md'] };
      expect(requiresMermaid('intelligence/scenario-forecast.md', rules)).toBe(true);
    });

    it('should return true for intelligence/ directory path', () => {
      const rules = {};
      expect(requiresMermaid('intelligence/anything.md', rules)).toBe(true);
    });

    it('should return true for classification/ directory path', () => {
      const rules = {};
      expect(requiresMermaid('classification/forces-analysis.md', rules)).toBe(true);
    });

    it('should return false for extended/ directory path', () => {
      const rules = {};
      expect(requiresMermaid('extended/executive-brief.md', rules)).toBe(false);
    });
  });

  describe('createEmptyResult', () => {
    it('should create result with correct path', () => {
      const result = createEmptyResult('intelligence/synthesis-summary.md');
      expect(result.relativePath).toBe('intelligence/synthesis-summary.md');
      expect(result.lines).toBe(0);
      expect(result.issues).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });
});
