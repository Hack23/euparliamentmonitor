// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/MCP/Client
 * @description Transport / connection types for the MCP (Model Context
 * Protocol) client — client options, JSON-RPC request/response envelopes,
 * tool-result content items, and the pending-request handler shape.
 *
 * Tool-specific option interfaces live in {@link ./ep-tools.ts}.
 * Report-generation option interfaces live in {@link ./reports.ts}.
 */

/** MCP client options */
export interface MCPClientOptions {
  serverPath?: string | undefined;
  maxConnectionAttempts?: number | undefined;
  connectionRetryDelay?: number | undefined;
  /** Maximum retries for callToolWithRetry() (default: 2) */
  maxRetries?: number | undefined;
  /** MCP Gateway URL for HTTP transport (e.g., http://host.docker.internal:80/mcp/european-parliament) */
  gatewayUrl?: string | undefined;
  /** API key for MCP Gateway authentication */
  gatewayApiKey?: string | undefined;
  /** Human-readable server name used in operational log messages (default: 'European Parliament MCP Server') */
  serverLabel?: string | undefined;
  /**
   * Path to the pending-documents sidecar JSON file used for UPSTREAM_404
   * indexing-lag retry scheduling.  Defaults to `<cwd>/data/pending-documents.json`.
   * Override for test isolation or custom deployment layouts.
   */
  pendingDocumentsStorePath?: string | undefined;
}

/** MCP tool call result content item */
export interface MCPContentItem {
  type: string;
  text: string;
}

/** MCP tool call result */
export interface MCPToolResult {
  content?: MCPContentItem[] | undefined;
  /** Set to `true` by the MCP server when the tool invocation produced an error response */
  isError?: boolean | undefined;
}

/** JSON-RPC 2.0 request */
export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: Record<string, unknown>;
}

/** JSON-RPC 2.0 response */
export interface JSONRPCResponse {
  jsonrpc: '2.0';
  id?: number | undefined;
  method?: string | undefined;
  result?: unknown | undefined;
  error?: {
    code: number;
    message: string;
    data?: unknown | undefined;
  };
}

/** Pending request handler */
export interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}
