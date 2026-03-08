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

  /* ── EU Parliament colour palette ────────────────────────────────── */

  var EU_COLORS = [
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

  var GRID_COLOR = 'rgba(0, 0, 0, 0.06)';
  var TICK_COLOR = '#6c757d';
  var FONT_FAMILY = "'Segoe UI', system-ui, -apple-system, sans-serif";

  /* ── Chart.js global defaults ────────────────────────────────────── */

  function applyGlobalDefaults() {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.font.family = FONT_FAMILY;
    Chart.defaults.font.size = 12;
    Chart.defaults.color = TICK_COLOR;
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = true;
    Chart.defaults.animation = { duration: 600, easing: 'easeOutQuart' };

    /* Register annotation plugin if available */
    if (typeof window.ChartAnnotation !== 'undefined') {
      Chart.register(window.ChartAnnotation);
    } else if (
      typeof chartjsPluginAnnotation !== 'undefined' &&
      chartjsPluginAnnotation.default
    ) {
      Chart.register(chartjsPluginAnnotation.default);
    }
  }

  /* ── Theme helper ────────────────────────────────────────────────── */

  function assignColors(datasets) {
    if (!datasets || !datasets.length) return;
    for (var i = 0; i < datasets.length; i++) {
      var ds = datasets[i];
      if (!ds.backgroundColor) {
        if (
          datasets.length === 1 &&
          ds.data &&
          ds.data.length <= EU_COLORS.length
        ) {
          /* Per-segment colours for pie / doughnut / polar */
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
    var opts = Object.assign({}, userOpts || {});

    /* Scale defaults for cartesian charts */
    if (type === 'bar' || type === 'line' || type === 'scatter') {
      if (!opts.scales) opts.scales = {};
      if (!opts.scales.x) opts.scales.x = {};
      if (!opts.scales.y) opts.scales.y = {};
      opts.scales.x.grid = Object.assign(
        { color: GRID_COLOR },
        opts.scales.x.grid
      );
      opts.scales.y.grid = Object.assign(
        { color: GRID_COLOR },
        opts.scales.y.grid
      );
      opts.scales.x.ticks = Object.assign(
        { color: TICK_COLOR, font: { size: 11 } },
        opts.scales.x.ticks
      );
      opts.scales.y.ticks = Object.assign(
        { color: TICK_COLOR, font: { size: 11 } },
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

  /* ── Hydration ───────────────────────────────────────────────────── */

  function hydrateCharts() {
    if (typeof Chart === 'undefined') return;

    var canvases = document.querySelectorAll('canvas[data-chart-config]');
    for (var i = 0; i < canvases.length; i++) {
      var canvas = canvases[i];
      if (canvas._chartInstance) continue; /* already initialised */

      var raw = canvas.getAttribute('data-chart-config');
      if (!raw) continue;

      try {
        /* The attribute value is HTML-entity-encoded JSON */
        var decoded = raw
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        var config = JSON.parse(decoded);
        if (!config || !config.type || !config.data) continue;

        assignColors(config.data.datasets);
        var options = buildOptions(config.type, config.options);

        var instance = new Chart(canvas, {
          type: config.type,
          data: config.data,
          options: options,
        });
        canvas._chartInstance = instance;

        /* Hide the noscript fallback table sibling (already hidden by browser,
           but mark for clarity) */
        var noscript = canvas.parentNode
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

  /* ── Bootstrap ───────────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyGlobalDefaults();
      hydrateCharts();
    });
  } else {
    applyGlobalDefaults();
    hydrateCharts();
  }
})();
