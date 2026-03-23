// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/MCPHealth
 * @description Aggregated health monitoring for MCP tools.
 *
 * The {@link MCPHealthMonitor} tracks per-tool circuit breaker state and
 * provides a consolidated health snapshot for observability dashboards
 * and operational alerting.
 *
 * @see {@link https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md | Secure Development Policy}
 */

import type { CircuitState } from './mcp-retry.js';
import { CircuitBreaker } from './mcp-retry.js';
import type { CircuitBreakerOptions } from './mcp-retry.js';

/**
 * Per-tool health snapshot returned by {@link MCPHealthMonitor.getHealthSnapshot}.
 */
export interface ToolHealthEntry {
  /** Current circuit breaker state for the tool */
  state: CircuitState;
  /** Number of consecutive failures recorded */
  consecutiveFailures: number;
}

/**
 * Aggregated health snapshot across all registered MCP tools.
 */
export interface HealthSnapshot {
  /** Per-tool health status keyed by tool name */
  tools: ReadonlyMap<string, ToolHealthEntry>;
  /** Count of tools with circuit in OPEN state */
  openCircuits: number;
  /** Count of tools with circuit in HALF_OPEN state */
  halfOpenCircuits: number;
  /** Count of tools with circuit in CLOSED state */
  closedCircuits: number;
}

/**
 * Monitors circuit breaker health across multiple MCP tools.
 *
 * Each tool is backed by its own {@link CircuitBreaker} instance; the monitor
 * provides both per-tool access and aggregated health snapshots.
 */
export class MCPHealthMonitor {
  private readonly breakers = new Map<string, CircuitBreaker>();
  private readonly defaultOptions: CircuitBreakerOptions;

  /**
   * Create a new health monitor.
   *
   * @param defaultOptions - Default circuit breaker options applied when
   *   registering a new tool without explicit options
   */
  constructor(defaultOptions: CircuitBreakerOptions = {}) {
    this.defaultOptions = defaultOptions;
  }

  /**
   * Get or create the {@link CircuitBreaker} for the named tool.
   *
   * If the tool has not been registered yet a new breaker is created with the
   * monitor's default options.
   *
   * @param toolName - Unique identifier for the MCP tool
   * @returns The circuit breaker instance for the tool
   */
  getBreaker(toolName: string): CircuitBreaker {
    let breaker = this.breakers.get(toolName);
    if (!breaker) {
      breaker = new CircuitBreaker(this.defaultOptions);
      this.breakers.set(toolName, breaker);
    }
    return breaker;
  }

  /**
   * Return an aggregated health snapshot across all registered tools.
   *
   * @returns Snapshot with per-tool state and aggregate counters
   */
  getHealthSnapshot(): HealthSnapshot {
    let openCircuits = 0;
    let halfOpenCircuits = 0;
    let closedCircuits = 0;
    const tools = new Map<string, ToolHealthEntry>();

    for (const [name, breaker] of this.breakers) {
      const stats = breaker.getStats();
      tools.set(name, {
        state: stats.state,
        consecutiveFailures: stats.consecutiveFailures,
      });
      switch (stats.state) {
        case 'OPEN':
          openCircuits++;
          break;
        case 'HALF_OPEN':
          halfOpenCircuits++;
          break;
        case 'CLOSED':
          closedCircuits++;
          break;
      }
    }

    return { tools, openCircuits, halfOpenCircuits, closedCircuits };
  }

  /**
   * Return the names of all registered tools.
   *
   * @returns Array of tool names
   */
  getRegisteredTools(): readonly string[] {
    return [...this.breakers.keys()];
  }
}
