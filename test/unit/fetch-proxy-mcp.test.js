// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const SHARED_MCP_PATH = '.github/workflows/shared/mcp/news-mcp-servers.md';

function extractFetchProxyScript() {
  const shared = readFileSync(SHARED_MCP_PATH, 'utf8');
  const match = shared.match(/entrypointArgs: \["-e", "([^"]+)"\]/);
  if (!match) {
    throw new Error('fetch-proxy entrypointArgs not found');
  }
  return match[1];
}

function runFetchProxy(messages) {
  const code = extractFetchProxyScript();
  const child = spawn(process.execPath, ['-e', code], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  for (const message of messages) {
    child.stdin.write(`${JSON.stringify(message)}\n`);
  }
  child.stdin.end();
  return new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`fetch-proxy exited ${code}: ${stderr}`));
        return;
      }
      resolve(
        stdout
          .trim()
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line))
      );
    });
  });
}

describe('shared fetch-proxy MCP server', () => {
  it('uses newline-safe JavaScript in the gh-aw entrypoint', () => {
    const code = extractFetchProxyScript();
    expect(code).toContain('String.fromCharCode(10)');
    expect(code).not.toContain("+'\\n'");
    expect(() => new Function(code)).not.toThrow();
  });

  it('registers fetch_url and rejects non-IMF URLs without network access', async () => {
    const responses = await runFetchProxy([
      { jsonrpc: '2.0', id: 1, method: 'initialize' },
      { jsonrpc: '2.0', id: 2, method: 'tools/list' },
      {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'fetch_url', arguments: { url: 'https://example.com/' } },
      },
    ]);

    expect(responses[0].result.capabilities.tools).toEqual({});
    expect(responses[1].result.tools[0].name).toBe('fetch_url');
    expect(responses[2].error.message).toContain('dataservices.imf.org');
  });
});
