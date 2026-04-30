// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * EU Parliament Monitor — same-origin PWA registration + freshness
 * polling. Loaded from every generator-emitted `<head>` via
 *   `<script src="…/js/pwa-register.js" defer></script>`
 * (CSP `script-src 'self'`).
 *
 * Responsibilities:
 *
 *   1. Register the same-origin service worker (`sw.js`) — derives the
 *      correct relative URL from the page path (root pages use `./`,
 *      `news/*.html` pages use `../`).
 *   2. Poll `build-info.json` on visibility-change and every 5 minutes
 *      while the document is visible. When the published `buildId`
 *      differs from the embedded `<meta name="build-id">`, surface a
 *      polite toast offering an instant refresh.
 *   3. Listen for SW `controllerchange` and `updatefound` events and
 *      offer the same toast.
 *   4. Localise relative timestamps on `<time data-relative-time>`
 *      elements via `Intl.RelativeTimeFormat` using the page `lang`.
 *
 * No inline scripts, no third-party origins, no module imports — plain
 * IIFE matching `js/index-runtime.js` and `js/article-runtime.js`.
 */

(function () {
  'use strict';

  /** Read a meta tag's content attribute, returning '' when missing. */
  function metaContent(name) {
    var el = document.querySelector('meta[name="' + name + '"]');
    return el ? String(el.getAttribute('content') || '') : '';
  }

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

  var EMBEDDED_BUILD_ID = metaContent('build-id');
  var I18N_UPDATE_TEXT = metaContent('ep-i18n-update-text') || 'Updated content available';
  var I18N_UPDATE_CTA = metaContent('ep-i18n-update-cta') || 'Refresh';
  var I18N_UPDATE_DISMISS = metaContent('ep-i18n-dismiss') || 'Dismiss';

  var BUILD_INFO_URL = resolveRootAssetHref('build-info.json');
  var SW_URL = BUILD_INFO_URL.replace(/build-info\.json$/, 'sw.js');
  var SW_SCOPE = SW_URL.replace(/sw\.js$/, '');

  /* ── Update toast ────────────────────────────────────────────────── */

  var toastShown = false;
  var toastEl = null;
  var idleTimer = null;

  function dismissToast() {
    if (toastEl && toastEl.parentNode) {
      toastEl.parentNode.removeChild(toastEl);
    }
    toastEl = null;
    toastShown = false;
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  }

  function performRefresh() {
    try {
      window.location.reload();
    } catch (_err) {
      /* noop */
    }
  }

  function showUpdateToast() {
    if (toastShown) return;
    toastShown = true;

    toastEl = document.createElement('div');
    toastEl.className = 'ep-update-toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');

    var icon = document.createElement('span');
    icon.className = 'ep-update-toast__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '✨';

    var msg = document.createElement('span');
    msg.className = 'ep-update-toast__msg';
    msg.textContent = I18N_UPDATE_TEXT;

    var refreshBtn = document.createElement('button');
    refreshBtn.type = 'button';
    refreshBtn.className = 'ep-update-toast__refresh';
    refreshBtn.textContent = I18N_UPDATE_CTA;
    refreshBtn.addEventListener('click', performRefresh);

    var dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'ep-update-toast__dismiss';
    dismissBtn.setAttribute('aria-label', I18N_UPDATE_DISMISS);
    dismissBtn.textContent = '×';
    dismissBtn.addEventListener('click', dismissToast);

    toastEl.appendChild(icon);
    toastEl.appendChild(msg);
    toastEl.appendChild(refreshBtn);
    toastEl.appendChild(dismissBtn);
    document.body.appendChild(toastEl);

    // Auto-reload after 30s of toast visible if no interaction.
    idleTimer = setTimeout(function () {
      if (toastShown) {
        performRefresh();
      }
    }, 30000);
  }

  /* ── Build-info polling ──────────────────────────────────────────── */

  var POLL_INTERVAL_MS = 5 * 60 * 1000;
  var pollTimer = null;
  var inFlight = false;

  function checkBuildInfo() {
    if (inFlight || toastShown) return;
    if (!EMBEDDED_BUILD_ID) return;
    if (!('fetch' in window)) return;
    inFlight = true;
    fetch(BUILD_INFO_URL, { cache: 'no-store', credentials: 'same-origin' })
      .then(function (resp) {
        if (!resp || !resp.ok) return null;
        return resp.json();
      })
      .then(function (data) {
        inFlight = false;
        if (!data || typeof data.buildId !== 'string') return;
        if (data.buildId && data.buildId !== EMBEDDED_BUILD_ID) {
          showUpdateToast();
        }
      })
      .catch(function () {
        inFlight = false;
        /* network error — try again next interval */
      });
  }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(function () {
      if (document.visibilityState === 'visible') {
        checkBuildInfo();
      }
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      checkBuildInfo();
      startPolling();
    } else {
      stopPolling();
    }
  });

  /* ── Service worker registration ─────────────────────────────────── */

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    try {
      navigator.serviceWorker
        .register(SW_URL, { scope: SW_SCOPE || '/' })
        .then(function (reg) {
          if (!reg) return;
          reg.addEventListener('updatefound', function () {
            var nw = reg.installing;
            if (!nw) return;
            nw.addEventListener('statechange', function () {
              if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateToast();
              }
            });
          });
        })
        .catch(function () {
          /* registration failed — site still works without SW */
        });

      navigator.serviceWorker.addEventListener('controllerchange', function () {
        // A new SW took control — nothing to do unless toast already
        // dismissed without reload (we don't auto-reload here to avoid
        // surprise navigations during form input).
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

  // First poll happens after a short delay so it doesn't compete with
  // the initial page load.
  setTimeout(checkBuildInfo, 15000);
  startPolling();

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
