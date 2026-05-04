// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * EU Parliament Monitor — same-origin PWA registration + relative time
 * formatting. Loaded from every generator-emitted `<head>` via
 *   `<script src="…/js/pwa-register.js" defer></script>`
 * (CSP `script-src 'self'`).
 *
 * Responsibilities:
 *
 *   1. Register the same-origin service worker (`sw.js`) — derives the
 *      correct relative URL from the page path (root pages use `./`,
 *      `news/*.html` pages use `../`).
 *   2. Localise relative timestamps on `<time data-relative-time>`
 *      elements via `Intl.RelativeTimeFormat` using the page `lang`.
 *
 * No inline scripts, no third-party origins, no module imports — plain
 * IIFE matching `js/index-runtime.js` and `js/article-runtime.js`.
 */

(function () {
  'use strict';

  /**
   * Resolve a same-origin root asset URL for root and `news/*.html` pages.
   * Detects the parent directory (segment before the filename) so it works
   * for both bare `/news/<page>.html` and base-path deployments such as
   * `/euparliamentmonitor/news/<page>.html` (GitHub Pages failover).
   */
  function resolveRootAssetHref(file) {
    var segments = window.location.pathname.split('/');
    // Drop trailing empty segment (e.g. for `/news/` directory URLs) so the
    // last entry is always the filename and segments[length - 2] is its
    // parent directory.
    if (segments.length > 0 && segments[segments.length - 1] === '') {
      segments.pop();
    }
    var parent = segments.length >= 2 ? segments[segments.length - 2] : '';
    if (parent === 'news') return '../' + file;
    return './' + file;
  }

  var SW_URL = resolveRootAssetHref('sw.js');
  var SW_SCOPE = SW_URL.replace(/sw\.js$/, '');

  /* ── Service worker registration ─────────────────────────────────── */

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    try {
      navigator.serviceWorker
        .register(SW_URL, { scope: SW_SCOPE || '/' })
        .catch(function () {
          /* registration failed — site still works without SW */
        });
    } catch (_err) {
      /* old browsers / locked-down contexts — silently skip */
    }
  }

  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }

  /* ── Localised relative timestamps ───────────────────────────────── */

  function relativeTimeFormatter() {
    if (typeof Intl === 'undefined' || typeof Intl.RelativeTimeFormat !== 'function') {
      return null;
    }
    var lang = (document.documentElement && document.documentElement.lang) || 'en';
    try {
      return new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
    } catch (_err) {
      try {
        return new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      } catch (_err2) {
        return null;
      }
    }
  }

  function formatRelative(rtf, dt) {
    var diffSec = (dt.getTime() - Date.now()) / 1000;
    var abs = Math.abs(diffSec);
    if (abs < 60) return rtf.format(Math.round(diffSec), 'second');
    if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
    if (abs < 86400 * 30) return rtf.format(Math.round(diffSec / 86400), 'day');
    if (abs < 86400 * 365) return rtf.format(Math.round(diffSec / (86400 * 30)), 'month');
    return rtf.format(Math.round(diffSec / (86400 * 365)), 'year');
  }

  function updateRelativeTimes() {
    var rtf = relativeTimeFormatter();
    if (!rtf) return;
    var nodes = document.querySelectorAll('time[data-relative-time]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var iso = el.getAttribute('datetime') || el.textContent;
      var dt = new Date(iso);
      if (isNaN(dt.getTime())) continue;
      var rendered = formatRelative(rtf, dt);
      if (!el.getAttribute('title')) {
        el.setAttribute('title', el.textContent || '');
      }
      el.textContent = rendered;
    }
  }

  if (document.readyState !== 'loading') {
    updateRelativeTimes();
  } else {
    document.addEventListener('DOMContentLoaded', updateRelativeTimes);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      updateRelativeTimes();
    }
  });
})();
