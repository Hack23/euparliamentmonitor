// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Templates/Icons
 * @description Inline SVG icon set used by the shared site header / footer
 * to upgrade visual consistency across browsers (emoji rendering varies
 * wildly between Windows, macOS, Android and Linux).
 *
 * Every icon is a 24×24 outline glyph that inherits `currentColor`. SVGs
 * are emitted with `aria-hidden="true"` and `focusable="false"` so they
 * stay decorative — call sites should keep their existing emoji span
 * (also `aria-hidden`) so the visual diff is small while progressively
 * enhancing the chrome.
 *
 * Returning `<span aria-hidden="true">` (empty) for unknown names keeps
 * call sites safe even if a future caller passes a typo'd name.
 */

/** Identifiers for the icons exported from this module. */
export type IconName =
  | 'sponsor'
  | 'security'
  | 'rss'
  | 'github'
  | 'sitemap'
  | 'pi'
  | 'install'
  | 'refresh'
  | 'close';

export interface IconOptions {
  /** Pixel size for both width and height (default 18). */
  readonly size?: number;
}

const PATHS: Record<IconName, string> = {
  // Heart-in-circle for "Sponsor".
  sponsor:
    '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  // Shield + checkmark.
  security:
    '<path d="M12 3 4.5 6v6a8 8 0 0 0 7.5 8 8 8 0 0 0 7.5-8V6L12 3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  rss: '<path d="M5 5a14 14 0 0 1 14 14M5 11a8 8 0 0 1 8 8M6 17.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  github:
    '<path d="M12 3a9 9 0 0 0-2.85 17.54c.45.08.62-.2.62-.43v-1.5c-2.5.55-3.04-1.06-3.04-1.06-.4-1.05-1-1.32-1-1.32-.83-.57.06-.55.06-.55.92.07 1.4.94 1.4.94.81 1.4 2.13 1 2.65.76.08-.6.32-1 .58-1.23-2-.23-4.1-1-4.1-4.4 0-.97.34-1.77.9-2.4-.1-.23-.4-1.13.08-2.36 0 0 .73-.23 2.4.92a8.3 8.3 0 0 1 4.36 0c1.66-1.15 2.4-.92 2.4-.92.48 1.23.18 2.13.08 2.36.56.63.9 1.43.9 2.4 0 3.4-2.1 4.16-4.1 4.39.32.28.62.84.62 1.7v2.52c0 .24.17.52.62.43A9 9 0 0 0 12 3Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  sitemap:
    '<path d="M12 4v4M12 12v4M6 16v4M18 16v4M6 16h12M9 8h6v4H9V8ZM4 18h4v3H4v-3ZM16 18h4v3h-4v-3Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  // Compass for "Political Intelligence".
  pi: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m9 15 2-6 6-2-2 6-6 2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  install:
    '<path d="M12 3v12m0 0-4-4m4 4 4-4M5 19h14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  refresh:
    '<path d="M21 12a9 9 0 1 1-3.5-7M21 4v5h-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  close:
    '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
};

/**
 * Render an inline SVG icon.
 *
 * @param name - One of the {@link IconName} values.
 * @param opts - Optional overrides (currently size only).
 * @returns SVG markup string, or an empty `<span aria-hidden>` for unknown names.
 */
export function icon(name: IconName, opts: IconOptions = {}): string {
  const path = PATHS[name];
  if (!path) {
    return '<span class="icon icon-inline" aria-hidden="true"></span>';
  }
  const size = typeof opts.size === 'number' && opts.size > 0 ? opts.size : 18;
  return `<svg class="icon icon-inline" width="${size}" height="${size}" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">${path}</svg>`;
}
