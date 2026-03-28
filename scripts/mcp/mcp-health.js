// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { CircuitBreaker } from './mcp-retry.js';
/**
 * Monitors circuit breaker health across multiple MCP tools.
 *
 * Each tool is backed by its own {@link CircuitBreaker} instance; the monitor
 * provides both per-tool access and aggregated health snapshots.
 */
export class MCPHealthMonitor {
  breakers = new Map();
  defaultOptions;
  /**
   * Create a new health monitor.
   *
   * @param defaultOptions - Default circuit breaker options applied when
   *   registering a new tool without explicit options
   */
  constructor(defaultOptions = {}) {
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
  getBreaker(toolName) {
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
  getHealthSnapshot() {
    let openCircuits = 0;
    let halfOpenCircuits = 0;
    let closedCircuits = 0;
    const tools = new Map();
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
  getRegisteredTools() {
    return [...this.breakers.keys()];
  }
}
//# sourceMappingURL=mcp-health.js.map
