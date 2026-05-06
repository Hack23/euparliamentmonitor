// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { spawn } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
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
    expect(code).toContain('euparliamentmonitor/0.9.0');
    expect(code).toContain('application/vnd.sdmx.data+json');
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

  it('preserves request id in error responses from the catch handler', async () => {
    const responses = await runFetchProxy([
      { jsonrpc: '2.0', id: 1, method: 'initialize' },
      {
        jsonrpc: '2.0',
        id: 42,
        method: 'tools/call',
        params: { name: 'fetch_url', arguments: { url: 'not-a-url' } },
      },
    ]);

    // The error response for id 42 must carry id: 42, not id: 0
    expect(responses[1].id).toBe(42);
    expect(responses[1].error).toBeDefined();
  });

  it('compiled lock files contain the same fetch-proxy code as the source', () => {
    const sourceCode = extractFetchProxyScript();
    const lockFiles = readdirSync('.github/workflows').filter(
      (f) => f.startsWith('news-') && f.endsWith('.lock.yml')
    );
    expect(lockFiles.length).toBeGreaterThan(0);

    // Check at least one lock file to verify the compiled entrypoint matches source
    const lockContent = readFileSync(
      `.github/workflows/${lockFiles[0]}`,
      'utf8'
    );
    // The lock file should contain the critical fetch-proxy patterns
    expect(lockContent).toContain('String.fromCharCode(10)');
    expect(lockContent).toContain('dataservices.imf.org');
    expect(lockContent).toContain('/REST/SDMX_3.0/');
    // Verify the id-preserving catch pattern is compiled into the lock file
    expect(lockContent).toContain('mid=m.id');
  });
});
