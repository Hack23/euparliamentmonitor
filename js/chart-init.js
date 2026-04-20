// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Chart.js hydration script for EU Parliament Monitor dashboards.
 *
 * Finds all <canvas> elements with a `data-chart-config` attribute,
 * parses the embedded JSON, and initialises Chart.js instances with
 * the EU Parliament Monitor professional theme.
 *
 * Dependencies (loaded before this script):
 *   - Chart.js UMD bundle (js/vendor/chart.umd.min.js)
 *   - chartjs-plugin-annotation (js/vendor/chartjs-plugin-annotation.min.js)
 */

(function () {
  'use strict';

  /* ── EU Parliament color palette ─────────────────────────────────── */

  const EU_COLORS = [
    '#003399', // EU blue
    '#FFD700', // EU gold
    '#E63946', // red
    '#2A9D8F', // teal
    '#6A4C93', // purple
    '#E76F51', // coral
    '#264653', // dark teal
    '#F4A261', // sandy
    '#457B9D', // steel blue
    '#A8DADC', // light teal
  ];

  const FONT_FAMILY = "'Segoe UI', system-ui, -apple-system, sans-serif";

  /* ── Theme-aware colour helper ───────────────────────────────────── */

  /**
   * Returns grid and tick colours that are legible in the current colour
   * scheme.  Reads `document.documentElement.dataset.theme` first, then
   * falls back to the `prefers-color-scheme` media query.
   *
   * @returns {{ gridColor: string, tickColor: string }}
   */
  function getThemeColors() {
    var isDark = false;
    var themeAttr = document.documentElement.dataset
      ? document.documentElement.dataset.theme
      : undefined;
    if (themeAttr === 'dark') {
      isDark = true;
    } else if (themeAttr !== 'light' && typeof window !== 'undefined' &&
               window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isDark = true;
    }
    return isDark
      ? { gridColor: 'rgba(255, 255, 255, 0.10)', tickColor: '#adb5bd' }
      : { gridColor: 'rgba(0, 0, 0, 0.08)',       tickColor: '#6c757d' };
  }

  /* ── Chart.js global defaults ────────────────────────────────────── */

  function applyGlobalDefaults() {
    if (typeof Chart === 'undefined') return;

    var colors = getThemeColors();

    Chart.defaults.font.family = FONT_FAMILY;
    Chart.defaults.font.size = 12;
    Chart.defaults.color = colors.tickColor;
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = true;
    Chart.defaults.animation = { duration: 600, easing: 'easeOutQuart' };

    /* The annotation plugin UMD bundle self-registers with Chart.js
       when both are loaded — no manual registration needed. */
  }

  /* ── Theme helper ────────────────────────────────────────────────── */

  /** Chart types that use per-segment (per-slice) coloring */
  const SEGMENT_TYPES = { pie: 1, doughnut: 1, polarArea: 1 };

  function assignColors(datasets, chartType) {
    if (!datasets || !datasets.length) return;
    for (let i = 0; i < datasets.length; i++) {
      const ds = datasets[i];
      if (!ds.backgroundColor) {
        if (
          SEGMENT_TYPES[chartType] &&
          datasets.length === 1 &&
          ds.data &&
          ds.data.length <= EU_COLORS.length
        ) {
          /* Per-segment colors for pie / doughnut / polarArea */
          ds.backgroundColor = ds.data.map(function (_, j) {
            return EU_COLORS[j % EU_COLORS.length] + 'CC'; /* 80% opacity */
          });
          ds.borderColor = ds.data.map(function (_, j) {
            return EU_COLORS[j % EU_COLORS.length];
          });
        } else {
          ds.backgroundColor = EU_COLORS[i % EU_COLORS.length] + '99';
          ds.borderColor = EU_COLORS[i % EU_COLORS.length];
        }
      }
      if (ds.borderWidth === undefined) ds.borderWidth = 2;
    }
  }

  function buildOptions(type, userOpts) {
    var colors = getThemeColors();
    var gridColor = colors.gridColor;
    var tickColor = colors.tickColor;
    const opts = Object.assign({}, userOpts || {});

    /* Scale defaults for cartesian charts */
    if (type === 'bar' || type === 'line' || type === 'scatter') {
      if (!opts.scales) opts.scales = {};
      if (!opts.scales.x) opts.scales.x = {};
      if (!opts.scales.y) opts.scales.y = {};
      opts.scales.x.grid = Object.assign(
        { color: gridColor },
        opts.scales.x.grid
      );
      opts.scales.y.grid = Object.assign(
        { color: gridColor },
        opts.scales.y.grid
      );
      opts.scales.x.ticks = Object.assign(
        { color: tickColor, font: { size: 11 } },
        opts.scales.x.ticks
      );
      opts.scales.y.ticks = Object.assign(
        { color: tickColor, font: { size: 11 } },
        opts.scales.y.ticks
      );
      if (type === 'bar') {
        opts.scales.y.beginAtZero =
          opts.scales.y.beginAtZero !== undefined
            ? opts.scales.y.beginAtZero
            : true;
      }
    }

    /* Plugin defaults */
    if (!opts.plugins) opts.plugins = {};
    if (!opts.plugins.legend) opts.plugins.legend = {};
    opts.plugins.legend.labels = Object.assign(
      { usePointStyle: true, padding: 14, font: { size: 12 } },
      opts.plugins.legend.labels
    );

    if (!opts.plugins.tooltip) opts.plugins.tooltip = {};
    opts.plugins.tooltip = Object.assign(
      {
        backgroundColor: 'rgba(26, 26, 46, 0.92)',
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        cornerRadius: 6,
        padding: 10,
      },
      opts.plugins.tooltip
    );

    return opts;
  }

  /**
   * Decode the five HTML entities produced by the server-side escapeHTML()
   * helper: &amp; &lt; &gt; &quot; &#39;.
   *
   * Uses pure string replacement instead of DOM innerHTML to avoid
   * CodeQL security warnings and potential XSS vectors.
   *
   * @param {string} str - HTML-entity-encoded string
   * @returns {string} Decoded string
   */
  function decodeHTMLEntities(str) {
    return str
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&');
  }

  /* ── Hydration ───────────────────────────────────────────────────── */

  function hydrateCharts() {
    if (typeof Chart === 'undefined') return;

    const canvases = document.querySelectorAll('canvas[data-chart-config]');
    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];
      if (canvas._chartInstance) continue; /* already initialised */

      const raw = canvas.getAttribute('data-chart-config');
      if (!raw) continue;

      try {
        const decoded = decodeHTMLEntities(raw);
        const config = JSON.parse(decoded);
        if (!config || !config.type || !config.data) continue;

        assignColors(config.data.datasets, config.type);
        const options = buildOptions(config.type, config.options);

        const instance = new Chart(canvas, {
          type: config.type,
          data: config.data,
          options: options,
        });
        canvas._chartInstance = instance;

        /* Hide the noscript fallback table sibling (already hidden by browser,
           but mark for clarity) */
        const noscript = canvas.parentNode
          ? canvas.parentNode.querySelector('noscript')
          : null;
        if (noscript) noscript.setAttribute('aria-hidden', 'true');
      } catch (e) {
        /* Fail silently – the noscript fallback table is still visible */
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[chart-init] Failed to hydrate chart:', e);
        }
      }
    }
  }

  /* ── Theme-change observer ───────────────────────────────────────── */

  /**
   * Re-apply scale/tick colours to every existing Chart instance when the
   * `data-theme` attribute changes on <html>.
   */
  function onThemeChange() {
    applyGlobalDefaults();
    if (typeof Chart === 'undefined' || !Chart.instances) return;
    var colors = getThemeColors();
    var instances = Object.values(Chart.instances);
    for (var i = 0; i < instances.length; i++) {
      var chart = instances[i];
      if (!chart || !chart.options) continue;
      var scales = chart.options.scales;
      if (scales) {
        var scaleKeys = Object.keys(scales);
        for (var k = 0; k < scaleKeys.length; k++) {
          var scale = scales[scaleKeys[k]];
          if (scale.grid) scale.grid.color = colors.gridColor;
          if (scale.ticks) scale.ticks.color = colors.tickColor;
        }
      }
      chart.update('none');
    }
  }

  /* ── Bootstrap ───────────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyGlobalDefaults();
      hydrateCharts();
      if (typeof MutationObserver !== 'undefined') {
        new MutationObserver(function (mutations) {
          for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].attributeName === 'data-theme') {
              onThemeChange();
              break;
            }
          }
        }).observe(document.documentElement, { attributes: true });
      }
    });
  } else {
    applyGlobalDefaults();
    hydrateCharts();
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].attributeName === 'data-theme') {
            onThemeChange();
            break;
          }
        }
      }).observe(document.documentElement, { attributes: true });
    }
  }
})();
