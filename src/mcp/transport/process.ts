// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/transport/process
 * @description Stdio process spawn / teardown helpers and JSON-RPC message routing
 * for the MCPConnection stdio transport.
 *
 * Extracted from `connection.ts` to keep individual file sizes under 400 LOC.
 * Operates on an explicit {@link SpawnContext} adapter rather than `this`.
 */

import { spawn, type ChildProcess } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { JSONRPCResponse, PendingRequest } from '../../types/index.js';

// ─── Binary path constants ────────────────────────────────────────────────────

/** npm binary name for the European Parliament MCP server */
export const BINARY_NAME = 'european-parliament-mcp-server';

/** Platform-specific binary filename (Windows uses .cmd shim) */
export const BINARY_FILE = process.platform === 'win32' ? `${BINARY_NAME}.cmd` : BINARY_NAME;

/** Default binary resolved from node_modules/.bin relative to this file's compiled location */
export const DEFAULT_SERVER_BINARY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  `../../../node_modules/.bin/${BINARY_FILE}`
);

/** Default request timeout in milliseconds — EU Parliament API responses commonly take 30-120+ seconds for large datasets */
export const DEFAULT_REQUEST_TIMEOUT_MS = 180_000;

/**
 * Effective request timeout, configurable via `EP_REQUEST_TIMEOUT_MS` env var.
 * This keeps the client-side timeout aligned with the MCP server timeout set
 * in workflow configs and copilot-mcp.json.
 */
export const REQUEST_TIMEOUT_MS: number = (() => {
  const envVal = process.env['EP_REQUEST_TIMEOUT_MS'];
  if (envVal) {
    const parsed = Number(envVal);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_REQUEST_TIMEOUT_MS;
})();

/** Connection startup delay in milliseconds */
export const CONNECTION_STARTUP_DELAY_MS = 500;

// ─── Context interface ────────────────────────────────────────────────────────

/**
 * Adapter passed by {@link MCPConnection} to stdio spawn helpers.
 * Lets the helpers read the few connection-level fields they need and
 * mutate process state without pulling in the whole connection class.
 */
export interface SpawnContext {
  /** Resolved path to the server binary or JS entry-point */
  readonly serverPath: string;
  /** Human-readable label for log messages */
  readonly serverLabel: string;
  /** Per-request timeout (milliseconds) */
  readonly requestTimeoutMs: number;
  /** Store or clear the spawned child process */
  readonly setProcess: (p: ChildProcess | null) => void;
  /** Mark the connection as (dis)connected */
  readonly setConnected: (v: boolean) => void;
  /** Route an incoming newline-delimited JSON-RPC message line */
  readonly onMessage: (line: string) => void;
  /** Reject and clear all in-flight pending requests with an error */
  readonly rejectAllPending: (message: string) => void;
}

// ─── Exported helpers ─────────────────────────────────────────────────────────

/**
 * Attempt a single connection via stdio (spawns server binary).
 *
 * @param ctx - Spawn context adapter from MCPConnection
 */
export async function attemptStdioConnection(ctx: SpawnContext): Promise<void> {
  try {
    const isJavaScriptFile: boolean = ctx.serverPath.toLowerCase().endsWith('.js');
    const command: string = isJavaScriptFile ? process.execPath : ctx.serverPath;
    const args: string[] = isJavaScriptFile ? [ctx.serverPath] : [];

    const childEnv = { ...process.env };
    const envVal = childEnv['EP_REQUEST_TIMEOUT_MS'];
    let effectiveTimeoutMs = ctx.requestTimeoutMs;
    if (envVal !== undefined && envVal !== '') {
      const parsed = Number(envVal);
      if (Number.isFinite(parsed) && parsed > 0) {
        effectiveTimeoutMs = parsed;
      } else {
        console.warn(
          `Invalid EP_REQUEST_TIMEOUT_MS value (non-finite or ≤0); falling back to ${ctx.requestTimeoutMs}ms`
        );
      }
    }
    childEnv['EP_REQUEST_TIMEOUT_MS'] = String(effectiveTimeoutMs);

    if (!isJavaScriptFile) {
      args.push('--timeout', String(effectiveTimeoutMs));
    }

    const child = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: childEnv,
    });

    ctx.setProcess(child);

    let buffer = '';
    let startupError: Error | null = null;

    child.stdout?.on('data', (data: Buffer) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.trim()) {
          ctx.onMessage(line);
        }
      }
    });

    child.stderr?.on('data', (data: Buffer) => {
      const message = data.toString().trim();
      if (message) {
        console.error(`MCP Server: ${message}`);
      }
    });

    child.on('close', (code: number | null) => {
      console.log(`MCP Server exited with code ${code}`);
      ctx.setConnected(false);
      ctx.rejectAllPending('MCP server connection closed');
    });

    child.on('error', (err: Error) => {
      startupError = err;
      ctx.setConnected(false);
    });

    await new Promise((resolve) => setTimeout(resolve, CONNECTION_STARTUP_DELAY_MS));

    if (startupError) {
      throw startupError;
    }

    ctx.setConnected(true);
    console.log(`✅ Connected to ${ctx.serverLabel}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to spawn MCP server:', message);
    throw error;
  }
}

/**
 * Handle an incoming newline-delimited JSON-RPC message from the server.
 * Routes responses to matching in-flight pending requests; logs notifications.
 *
 * @param line - Single JSON-RPC message line (no trailing newline)
 * @param pending - In-flight request map maintained by {@link MCPConnection}
 */
export function handleIncomingMessage(line: string, pending: Map<number, PendingRequest>): void {
  try {
    const message = JSON.parse(line) as JSONRPCResponse;

    if (message.id !== null && message.id !== undefined && pending.has(message.id)) {
      const req = pending.get(message.id);
      if (req) {
        pending.delete(message.id);
        if (message.error) {
          req.reject(new Error(message.error.message ?? 'MCP server error'));
        } else {
          req.resolve(message.result);
        }
      } else {
        pending.delete(message.id);
        console.error(`MCP pending request ${String(message.id)} vanished before handling`);
      }
    } else if ((message.id === null || message.id === undefined) && message.method) {
      console.log(`MCP Notification: ${message.method}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error parsing MCP message:', errorMessage);
    console.error('Problematic line:', line);
  }
}
