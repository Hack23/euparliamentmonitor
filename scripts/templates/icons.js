// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
const PATHS = {
    // Heart-in-circle for "Sponsor".
    sponsor: '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    // Shield + checkmark.
    security: '<path d="M12 3 4.5 6v6a8 8 0 0 0 7.5 8 8 8 0 0 0 7.5-8V6L12 3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    rss: '<path d="M5 5a14 14 0 0 1 14 14M5 11a8 8 0 0 1 8 8M6 17.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    github: '<path d="M12 3a9 9 0 0 0-2.85 17.54c.45.08.62-.2.62-.43v-1.5c-2.5.55-3.04-1.06-3.04-1.06-.4-1.05-1-1.32-1-1.32-.83-.57.06-.55.06-.55.92.07 1.4.94 1.4.94.81 1.4 2.13 1 2.65.76.08-.6.32-1 .58-1.23-2-.23-4.1-1-4.1-4.4 0-.97.34-1.77.9-2.4-.1-.23-.4-1.13.08-2.36 0 0 .73-.23 2.4.92a8.3 8.3 0 0 1 4.36 0c1.66-1.15 2.4-.92 2.4-.92.48 1.23.18 2.13.08 2.36.56.63.9 1.43.9 2.4 0 3.4-2.1 4.16-4.1 4.39.32.28.62.84.62 1.7v2.52c0 .24.17.52.62.43A9 9 0 0 0 12 3Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
    sitemap: '<path d="M12 4v4M12 12v4M6 16v4M18 16v4M6 16h12M9 8h6v4H9V8ZM4 18h4v3H4v-3ZM16 18h4v3h-4v-3Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    // Compass for "Political Intelligence".
    pi: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m9 15 2-6 6-2-2 6-6 2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    install: '<path d="M12 3v12m0 0-4-4m4 4 4-4M5 19h14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3.5-7M21 4v5h-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    close: '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    // Sun (light-mode indicator) — central disc + 8 rays.
    sun: '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    // Crescent moon (dark-mode indicator).
    moon: '<path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    // House for "Home".
    home: '<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    // Newspaper for "News".
    news: '<path d="M4 5h13a2 2 0 0 1 2 2v11a1 1 0 0 0 1-1V8M4 5v13a1 1 0 0 0 1 1h14M7 9h7M7 13h7M7 17h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>',
    // Magnifying glass over a document = analysis & reports.
    analysis: '<path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="11" cy="13" r="2.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m13 15 2.2 2.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    // Dashboard / gauge.
    dashboard: '<path d="M3 12a9 9 0 0 1 18 0v6H3v-6Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m12 12 4-3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    // Book / API docs.
    book: '<path d="M5 4h9a4 4 0 0 1 4 4v12H8a3 3 0 0 0-3 3V4Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 20a3 3 0 0 1 3-3h10" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    // External-link arrow.
    external: '<path d="M14 5h5v5M19 5l-9 9M11 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    // Envelope for "Contact".
    mail: '<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m4 8 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    // LinkedIn glyph.
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 10v7M7 7.2v.1M11 17v-4.5a2.5 2.5 0 0 1 5 0V17M11 10v7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    // Bar-chart icon.
    chart: '<path d="M4 19h16M7 16V10M12 16V6M17 16v-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    // Globe / world for "Languages".
    lang: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    // Right-arrow.
    'arrow-right': '<path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    // Solid-stroke heart (alt to sponsor).
    heart: '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" fill="currentColor"/>',
    // Shield with star — "Commitment to Transparency and Security" CTA.
    'shield-star': '<path d="M12 3 4.5 6v6a8 8 0 0 0 7.5 8 8 8 0 0 0 7.5-8V6L12 3Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m12 9 1.1 2.3 2.5.3-1.8 1.7.5 2.5L12 14.6l-2.3 1.2.5-2.5-1.8-1.7 2.5-.3L12 9Z" fill="currentColor" stroke="none"/>',
};
/**
 * Render an inline SVG icon.
 *
 * @param name - One of the {@link IconName} values.
 * @param opts - Optional overrides (currently size only).
 * @returns SVG markup string, or an empty `<span aria-hidden>` for unknown names.
 */
export function icon(name, opts = {}) {
    const path = PATHS[name];
    if (!path) {
        return '<span class="icon icon-inline" aria-hidden="true"></span>';
    }
    const size = typeof opts.size === 'number' && opts.size > 0 ? opts.size : 18;
    const extra = typeof opts.className === 'string' && opts.className.length > 0 ? ` ${opts.className}` : '';
    return `<svg class="icon icon-inline${extra}" width="${size}" height="${size}" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">${path}</svg>`;
}
//# sourceMappingURL=icons.js.map