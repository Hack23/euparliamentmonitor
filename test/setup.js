// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Test setup file
 * Runs before all tests
 */

/**
 * @typedef {Object} TestUtilsType
 * @property {() => Date} getMockDate
 * @property {() => typeof console} suppressConsole
 * @property {(originalConsole: typeof console) => void} restoreConsole
 */

// Augment globalThis for testUtils
/** @type {TestUtilsType} */
const testUtils = {
  /**
   * Create a mock date that's consistent across tests
   * @returns {Date}
   */
  getMockDate() {
    return new Date('2025-01-15T12:00:00Z');
  },

  /**
   * Suppress console output during tests
   * @returns {typeof console}
   */
  suppressConsole() {
    const originalConsole = { ...console };
    console.log = /** @type {typeof console.log} */ (vi.fn());
    console.info = /** @type {typeof console.info} */ (vi.fn());
    console.warn = /** @type {typeof console.warn} */ (vi.fn());
    console.error = /** @type {typeof console.error} */ (vi.fn());
    return originalConsole;
  },

  /**
   * Restore console output
   * @param {typeof console} originalConsole - Original console methods
   * @returns {void}
   */
  restoreConsole(originalConsole) {
    Object.assign(console, originalConsole);
  },
};

/** @type {Record<string, unknown>} */ (globalThis).testUtils = testUtils;

// Set consistent timezone for tests
process.env.TZ = 'UTC';

// Disable MCP by default in tests
process.env.USE_EP_MCP = 'false';
