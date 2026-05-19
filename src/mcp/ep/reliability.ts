// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/ep/reliability
 * @description Per-tool reliability timeout constants for high-latency EP MCP calls.
 */

/** Per-tool reliability timeout for selected high-latency EP MCP calls (milliseconds). */
export const TOOL_RELIABILITY_TIMEOUT_MS = 15_000;

/** Number of retries for selected high-latency EP MCP calls when timeout is detected. */
export const TOOL_RELIABILITY_TIMEOUT_RETRIES = 1;
