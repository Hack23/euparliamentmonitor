// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Test setup file
 * Runs before all tests
 */

// Global test utilities
global.testUtils = {
  /**
   * Create a mock date that's consistent across tests
   */
  getMockDate() {
    return new Date('2025-01-15T12:00:00Z');
  },
  
  /**
   * Suppress console output during tests
   */
  suppressConsole() {
    const originalConsole = { ...console };
    console.log = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    return originalConsole;
  },
  
  /**
   * Restore console output
   */
  restoreConsole(originalConsole) {
    Object.assign(console, originalConsole);
  },
};

// Set consistent timezone for tests
process.env.TZ = 'UTC';

// Disable MCP by default in tests
process.env.USE_EP_MCP = 'false';
