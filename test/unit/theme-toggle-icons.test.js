// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Drift-guard for the theme-toggle button.
 *
 * `createThemeToggleButton()` in `src/constants/config.ts` inlines the
 * `moon` and `sun` SVG path data rather than importing it from
 * `src/templates/icons.ts`, to keep the `constants/` layer free of
 * template-layer dependencies. This test fails if the path data
 * diverges between the two modules — manual synchronisation is
 * required when either icon is updated.
 */

import { describe, it, expect } from 'vitest';
import { createThemeToggleButton } from '../../scripts/constants/config.js';
import { icon } from '../../scripts/templates/icons.js';

/**
 * Extract the inner `<path …/>` markup from a single SVG element.
 *
 * @param {string} svg - A full `<svg …>…</svg>` string.
 * @returns {string} The concatenated child-element markup.
 */
function innerSvg(svg) {
  const match = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  return match ? match[1].trim() : '';
}

describe('theme-toggle icon parity', () => {
  it('button moon glyph has the same path data as templates/icons moon', () => {
    const html = createThemeToggleButton('Toggle theme');
    const moonMatch = html.match(/<svg[^>]*theme-toggle__svg--light[^>]*>[\s\S]*?<\/svg>/);
    expect(moonMatch, 'button must contain a moon SVG').not.toBeNull();
    const buttonMoon = innerSvg(moonMatch[0]);
    const iconMoon = innerSvg(icon('moon'));
    expect(buttonMoon).toBe(iconMoon);
  });

  it('button sun glyph has the same path data as templates/icons sun', () => {
    const html = createThemeToggleButton('Toggle theme');
    const sunMatch = html.match(/<svg[^>]*theme-toggle__svg--dark[^>]*>[\s\S]*?<\/svg>/);
    expect(sunMatch, 'button must contain a sun SVG').not.toBeNull();
    const buttonSun = innerSvg(sunMatch[0]);
    const iconSun = innerSvg(icon('sun'));
    expect(buttonSun).toBe(iconSun);
  });

  it('button announces toggle state via aria-pressed', () => {
    const html = createThemeToggleButton('Toggle theme');
    expect(html).toContain('aria-pressed="false"');
  });

  it('preserves emoji fallback spans for non-SVG environments', () => {
    const html = createThemeToggleButton('Toggle theme');
    expect(html).toContain('🌙');
    expect(html).toContain('☀️');
    expect(html).toContain('theme-toggle__emoji');
  });

  it('uses the localised label as both aria-label and title', () => {
    const html = createThemeToggleButton('Växla mörkt/ljust tema');
    expect(html).toContain('aria-label="Växla mörkt/ljust tema"');
    expect(html).toContain('title="Växla mörkt/ljust tema"');
  });
});
