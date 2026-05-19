// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/imf/types
 * @description TypeScript interfaces for IMF SDMX 3.0 response shapes and client options.
 */

import type { MCPClientOptions } from '../../types/index.js';

/**
 * Options accepted by `IMFMCPClient`. Shape intentionally matches
 * {@link MCPClientOptions} for historical compatibility — fields unused by
 * the native HTTP transport (`serverPath`, `gatewayUrl`, `gatewayApiKey`,
 * `maxConnectionAttempts`, `connectionRetryDelay`) are accepted and
 * silently ignored so existing call-sites do not break.
 */
export interface IMFClientOptions extends MCPClientOptions {
  /** Override the IMF REST base URL (default: `DEFAULT_IMF_API_BASE_URL`). */
  apiBaseUrl?: string;
  /** Per-request timeout in milliseconds (default: `DEFAULT_IMF_API_TIMEOUT_MS`). */
  timeoutMs?: number;
  /** Optional `fetch` implementation injection for testing. */
  fetchImpl?: typeof fetch;
  /** MCP fetch-proxy gateway URL (bypasses AWF Squid proxy). */
  fetchProxyGatewayUrl?: string;
  /** API key for the MCP gateway. */
  fetchProxyApiKey?: string;
}

export interface SDMXCategoryReference {
  id?: string;
  name?: string | Record<string, string>;
  description?: string | Record<string, string>;
  agencyID?: string;
  version?: string;
}

export interface SDMXDataflowListResponse {
  data?: {
    dataflows?: SDMXCategoryReference[];
  };
}

export interface SDMXDimensionValue {
  id: string;
  name?: string | Record<string, string>;
}

export interface SDMXDimension {
  id: string;
  name?: string | Record<string, string>;
  conceptIdentity?: string;
  localRepresentation?: {
    enumeration?: string;
  };
  values?: SDMXDimensionValue[];
}

export interface SDMXConcept {
  id?: string;
  name?: string | Record<string, string>;
  coreRepresentation?: { enumeration?: string };
}

export interface SDMXConceptScheme {
  id?: string;
  agencyID?: string;
  concepts?: SDMXConcept[];
}

export interface SDMXDataStructureResponse {
  data?: {
    dataStructures?: Array<{
      id?: string;
      dataStructureComponents?: {
        dimensionList?: { dimensions?: SDMXDimension[] };
      };
    }>;
    conceptSchemes?: SDMXConceptScheme[];
    codelists?: Array<{
      id?: string;
      agencyID?: string;
      codes?: SDMXDimensionValue[];
    }>;
  };
}

export interface SDMXObservationSeries {
  observations?: Record<string, unknown>;
}

export interface SDMXObservationDataSet {
  observations?: Record<string, unknown>;
  series?: Record<string, SDMXObservationSeries>;
}

export interface SDMXObservationPayload {
  data?: {
    dataSets?: SDMXObservationDataSet[];
  };
}
