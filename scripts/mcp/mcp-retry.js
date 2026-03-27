// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * Circuit breaker preventing cascading MCP failures.
 *
 * - **CLOSED** — normal operation; all requests pass through.
 * - **OPEN** — fast-fail; requests are rejected for `resetTimeoutMs` ms.
 * - **HALF_OPEN** — probe state; one request is allowed to test recovery.
 */
export class CircuitBreaker {
  state = 'CLOSED';
  consecutiveFailures = 0;
  nextAttemptAt = 0;
  halfOpenProbeInFlight = false;
  failureThreshold;
  resetTimeoutMs;
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold ?? 3;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 60_000;
  }
  /**
   * Whether a request may proceed given the current circuit state.
   *
   * In HALF_OPEN state only a single probe is allowed at a time; subsequent
   * calls return `false` until the in-flight probe records success or failure.
   *
   * @returns `true` when the circuit is CLOSED, or HALF_OPEN with no probe in flight
   */
  canRequest() {
    if (this.state === 'CLOSED') return true;
    if (this.state === 'OPEN') {
      if (Date.now() >= this.nextAttemptAt) {
        this.state = 'HALF_OPEN';
        this.halfOpenProbeInFlight = false;
        // Fall through to HALF_OPEN probe logic below
      } else {
        return false;
      }
    }
    // HALF_OPEN: allow exactly one probe in flight at a time
    if (this.halfOpenProbeInFlight) return false;
    this.halfOpenProbeInFlight = true;
    return true;
  }
  /** Record a successful request and close the circuit */
  recordSuccess() {
    this.consecutiveFailures = 0;
    this.halfOpenProbeInFlight = false;
    this.state = 'CLOSED';
  }
  /**
   * Record a failed request.
   *
   * - When in **HALF_OPEN** the circuit re-opens immediately (the probe failed).
   * - When in **CLOSED** the circuit opens only once the failure threshold is reached.
   */
  recordFailure() {
    this.halfOpenProbeInFlight = false;
    if (this.state === 'HALF_OPEN') {
      // Probe failed — immediately re-open and back off again
      this.state = 'OPEN';
      this.nextAttemptAt = Date.now() + this.resetTimeoutMs;
      console.warn('⚡ Circuit breaker re-OPEN after HALF_OPEN probe failure');
      return;
    }
    this.consecutiveFailures++;
    if (this.consecutiveFailures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptAt = Date.now() + this.resetTimeoutMs;
      console.warn(
        `⚡ Circuit breaker OPEN after ${this.consecutiveFailures} consecutive failures`
      );
    }
  }
  /**
   * Return the current circuit state.
   *
   * @returns Current circuit state
   */
  getState() {
    return this.state;
  }
  /**
   * Return current statistics for observability.
   *
   * @returns Snapshot of state and consecutive failure count
   */
  getStats() {
    return { state: this.state, consecutiveFailures: this.consecutiveFailures };
  }
}
/** Default retry policy values */
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 1_000;
const DEFAULT_MAX_DELAY_MS = 30_000;
/**
 * Execute an async function with retry and exponential backoff.
 *
 * Retries up to `policy.maxRetries` times with capped exponential delay:
 * `min(baseDelayMs * 2^attempt, maxDelayMs)`.
 *
 * @param fn - Async factory that performs the operation
 * @param policy - Retry configuration (merged with defaults)
 * @returns Result of `fn` on first success
 * @throws The last error when all retries are exhausted
 */
export async function withRetry(fn, policy = {}) {
  const maxRetries = policy.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelayMs = policy.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const maxDelayMs = policy.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}
//# sourceMappingURL=mcp-retry.js.map
