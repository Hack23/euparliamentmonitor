// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests: IMF SDMX helper functions.
 *
 * Verifies vintage dataflow normalization for both resolveAgency and
 * defaultFrequency, ensuring WEO_VINTAGE_2026_04 resolves to the same
 * agency and default frequency as WEO.
 */

import { describe, it, expect } from 'vitest';
import {
  resolveAgency,
  defaultFrequency,
  withDefaultFrequency,
} from '../../scripts/mcp/imf-mcp-client.js';

describe('resolveAgency', () => {
  it('resolves WEO to IMF.RES', () => {
    expect(resolveAgency('WEO')).toBe('IMF.RES');
  });

  it('resolves WEO_VINTAGE_2026_04 to same agency as WEO (IMF.RES)', () => {
    expect(resolveAgency('WEO_VINTAGE_2026_04')).toBe('IMF.RES');
  });

  it('resolves PCPS_VINTAGE_2025_01 to same agency as PCPS', () => {
    const base = resolveAgency('PCPS');
    expect(resolveAgency('PCPS_VINTAGE_2025_01')).toBe(base);
  });

  it('resolves IFS to IMF.STA', () => {
    expect(resolveAgency('IFS')).toBe('IMF.STA');
  });

  it('returns default agency for unknown dataflow', () => {
    expect(resolveAgency('UNKNOWN_DATAFLOW_XYZ')).toBe('IMF.STA');
  });
});

describe('defaultFrequency', () => {
  it('returns A for WEO', () => {
    expect(defaultFrequency('WEO')).toBe('A');
  });

  it('returns A for WEO_VINTAGE_2026_04 (vintage normalization)', () => {
    expect(defaultFrequency('WEO_VINTAGE_2026_04')).toBe('A');
  });

  it('returns M for PCPS', () => {
    expect(defaultFrequency('PCPS')).toBe('M');
  });

  it('returns M for PCPS_VINTAGE_2025_01 (vintage normalization)', () => {
    expect(defaultFrequency('PCPS_VINTAGE_2025_01')).toBe('M');
  });

  it('returns Q for FSI', () => {
    expect(defaultFrequency('FSI')).toBe('Q');
  });

  it('returns undefined for unknown dataflow', () => {
    expect(defaultFrequency('UNKNOWN_DB')).toBeUndefined();
  });

  it('is case-insensitive', () => {
    expect(defaultFrequency('weo')).toBe('A');
    expect(defaultFrequency('Weo_Vintage_2026_04')).toBe('A');
  });
});

describe('withDefaultFrequency', () => {
  it('adds FREQUENCY for WEO when caller omits it', () => {
    const result = withDefaultFrequency('WEO', { COUNTRY: ['US'] });
    expect(result.FREQUENCY).toEqual(['A']);
  });

  it('adds FREQUENCY for WEO_VINTAGE_2026_04 same as WEO', () => {
    const result = withDefaultFrequency('WEO_VINTAGE_2026_04', { COUNTRY: ['DEU'], INDICATOR: ['NGDP_RPCH'] });
    expect(result.FREQUENCY).toEqual(['A']);
  });

  it('does not overwrite existing FREQUENCY', () => {
    const result = withDefaultFrequency('WEO', { COUNTRY: ['US'], FREQUENCY: ['Q'] });
    expect(result.FREQUENCY).toEqual(['Q']);
  });
});
