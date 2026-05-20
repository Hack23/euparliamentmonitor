// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/imf/lifecycle
 * @description Singleton lifecycle for the IMF MCP client — extracted from
 * `client.ts` so the main client implementation file stays under 600 LOC.
 *
 * Re-exported from `client.ts` for backward compatibility; callers should
 * continue to import `getIMFMCPClient` / `closeIMFMCPClient` from
 * `'./client.js'`.
 */

import type { IMFClientOptions } from './types.js';
import { IMFMCPClient } from './client.js';

/** Singleton instance, created lazily by {@link getIMFMCPClient}. */
let imfClientInstance: IMFMCPClient | null = null;

/**
 * Get or create the singleton IMF client, validating the base URL on
 * first use. Subsequent calls return the cached instance.
 *
 * @param options - Client options (override env vars and defaults).
 * @returns Connected singleton client.
 * @throws When the base URL is malformed (e.g. missing protocol).
 */
export async function getIMFMCPClient(options: IMFClientOptions = {}): Promise<IMFMCPClient> {
  if (!imfClientInstance) {
    const client = new IMFMCPClient(options);
    try {
      await client.connect();
      imfClientInstance = client;
    } catch (error) {
      imfClientInstance = null;
      throw error;
    }
  }
  return imfClientInstance;
}

/** Close and clear the singleton instance (idempotent). */
export async function closeIMFMCPClient(): Promise<void> {
  if (imfClientInstance) {
    imfClientInstance.disconnect();
    imfClientInstance = null;
  }
}
