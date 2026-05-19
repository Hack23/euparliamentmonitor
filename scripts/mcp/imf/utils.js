// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { DEFAULT_IMF_API_BASE_URL, DEFAULT_IMF_API_TIMEOUT_MS } from './config.js';
/**
 * Resolve the IMF base URL and per-request timeout from constructor options
 * and environment variables.
 * @param options - Client constructor options (may be empty `{}`).
 * @returns Resolved `base` URL string and `timeout` in milliseconds.
 * @internal
 */
export function readBaseAndTimeout(options) {
    const envBase = process.env['IMF_API_BASE_URL'];
    const envTimeout = process.env['IMF_API_TIMEOUT_MS'];
    const parsedEnvTimeout = envTimeout !== undefined && envTimeout !== '' ? Number.parseInt(envTimeout, 10) : Number.NaN;
    const base = options.apiBaseUrl ?? (envBase && envBase !== '' ? envBase : DEFAULT_IMF_API_BASE_URL);
    let timeout;
    if (options.timeoutMs !== undefined &&
        Number.isFinite(options.timeoutMs) &&
        options.timeoutMs > 0) {
        timeout = options.timeoutMs;
    }
    else if (Number.isFinite(parsedEnvTimeout) && parsedEnvTimeout > 0) {
        timeout = parsedEnvTimeout;
    }
    else {
        timeout = DEFAULT_IMF_API_TIMEOUT_MS;
    }
    return { base, timeout };
}
/**
 * Strip trailing slashes without using a regex, so the CodeQL polynomial-
 * ReDoS detector has nothing to flag. Single linear pass from the right.
 * @param s - Input URL or path string.
 * @returns The string with all trailing `/` characters removed.
 * @internal
 */
export function stripTrailingSlashes(s) {
    let end = s.length;
    while (end > 0 && s.charCodeAt(end - 1) === 47) {
        end -= 1;
    }
    return end === s.length ? s : s.slice(0, end);
}
/**
 * Read IMF Azure-APIM subscription keys from the environment, in priority
 * order (primary, then secondary). Empty / unset / duplicate keys are
 * filtered out so the returned array is `[]` only when no key is set at all.
 *
 * @returns Ordered list of candidate API keys (length 0–2).
 */
export function readImfSubscriptionKeysFromEnv() {
    const candidates = [process.env['IMF_API_PRIMARY_KEY'], process.env['IMF_API_SECONDARY_KEY']];
    const keys = [];
    for (const k of candidates) {
        if (typeof k === 'string' && k.length > 0 && !keys.includes(k))
            keys.push(k);
    }
    return keys;
}
//# sourceMappingURL=utils.js.map