// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Visualization/Charts
 * @description Chart.js-aligned dataset / configuration types used by
 * dashboard panels and standalone chart renderers.
 */

/**
 * A single point in a scatter dataset.
 */
export interface ScatterPoint {
  /** X-axis value */
  readonly x: number;
  /** Y-axis value */
  readonly y: number;
}

/**
 * A single point in a bubble dataset.
 */
export interface BubblePoint {
  /** X-axis value */
  readonly x: number;
  /** Y-axis value */
  readonly y: number;
  /** Bubble radius in pixels */
  readonly r: number;
}

/**
 * A single dataset within a chart.
 * For bar/line/pie/doughnut/radar/polarArea charts, `data` is `number[]`.
 * For scatter charts, `data` is `ScatterPoint[]`.
 * For bubble charts, `data` is `BubblePoint[]`.
 * Maps to Chart.js dataset configuration.
 */
export interface ChartDataset {
  /** Dataset label (shown in legend) */
  readonly label: string;
  /** Data points — numbers for most chart types, point objects for scatter/bubble */
  readonly data: readonly number[] | readonly ScatterPoint[] | readonly BubblePoint[];
  /** Background color(s) — single color or array for per-point colors */
  readonly backgroundColor?: string | readonly string[] | undefined;
  /** Border color(s) — single color or array for per-point colors */
  readonly borderColor?: string | readonly string[] | undefined;
}

/**
 * Chart data configuration.
 * Maps to Chart.js data structure.
 */
export interface ChartData {
  /** Category labels for the x-axis or pie segments */
  readonly labels: readonly string[];
  /** One or more datasets to plot */
  readonly datasets: readonly ChartDataset[];
}

/**
 * Chart configuration for dashboard visualizations.
 * Generates a `<canvas>` element with embedded JSON configuration
 * that can be hydrated by Chart.js on the client side.
 */
export interface ChartConfig {
  /** Chart type — matches Chart.js chart types */
  readonly type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble';
  /** Chart title displayed above the chart */
  readonly title?: string | undefined;
  /** Chart data (labels + datasets) */
  readonly data: ChartData;
  /** Optional Chart.js options override (scales, plugins, annotation, etc.) */
  readonly options?: Record<string, unknown> | undefined;
}
