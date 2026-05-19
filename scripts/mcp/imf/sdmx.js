// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { IMF_DATAFLOW_AGENCY, DEFAULT_IMF_AGENCY } from './config.js';
/**
 * Parse an SDMX URN into its three salient parts:
 * agency (optional), id, and concept-id (only present for Concept URNs).
 * @param urn - SDMX URN string (e.g. `urn:sdmx:org.sdmx.infomodel.codelist.Codelist=IMF:CL_AREA(1.0)`).
 * @returns Object with `agency`, `id`, and `conceptId` (may be empty strings).
 * @internal
 */
export function parseSDMXUrn(urn) {
    const eqIdx = urn.indexOf('=');
    const body = eqIdx >= 0 ? urn.slice(eqIdx + 1) : urn;
    const parenIdx = body.indexOf('(');
    const head = parenIdx >= 0 ? body.slice(0, parenIdx) : body;
    let tail = '';
    if (parenIdx >= 0) {
        const closeIdx = body.indexOf(')', parenIdx);
        if (closeIdx >= 0)
            tail = body.slice(closeIdx + 1);
    }
    const conceptId = tail.startsWith('.') ? tail.slice(1) : '';
    const colonIdx = head.indexOf(':');
    const agency = colonIdx >= 0 ? head.slice(0, colonIdx) : '';
    const id = colonIdx >= 0 ? head.slice(colonIdx + 1) : head;
    return { agency, id, conceptId };
}
/**
 * Resolve the codelist URN for a single dimension by walking the SDMX
 * 3.0 dimension → concept → codelist binding chain.
 * @param dim - SDMX dimension descriptor from the data-structure response.
 * @param conceptSchemes - Concept scheme array from the same response.
 * @returns Codelist URN string, or `undefined` when not found.
 * @internal
 */
export function resolveCodelistUrn(dim, conceptSchemes) {
    const direct = dim.localRepresentation?.enumeration;
    if (direct)
        return direct;
    if (!dim.conceptIdentity)
        return undefined;
    const { agency, id, conceptId } = parseSDMXUrn(dim.conceptIdentity);
    if (!conceptId)
        return undefined;
    const cs = conceptSchemes.find((s) => s.id === id && (agency === '' || s.agencyID === agency));
    const concept = cs?.concepts?.find((c) => c.id === conceptId);
    return concept?.coreRepresentation?.enumeration;
}
/**
 * Resolve the actual list of codes for a single dimension.
 * @param dim - SDMX dimension descriptor.
 * @param payload - The `data` section of the SDMX data-structure response.
 * @returns Array of code objects with `id` and optional `name`.
 * @internal
 */
export function resolveCodelistCodes(dim, payload) {
    if (dim.values && dim.values.length > 0)
        return dim.values;
    const urn = resolveCodelistUrn(dim, payload.conceptSchemes ?? []);
    if (!urn)
        return [];
    const { agency, id } = parseSDMXUrn(urn);
    if (!id)
        return [];
    const cls = payload.codelists ?? [];
    const exact = cls.find((c) => c.id === id && (!agency || c.agencyID === agency));
    const cl = exact ?? cls.find((c) => c.id === id);
    return cl?.codes ?? [];
}
/**
 * Resolve the SDMX agency for a dataflow.
 * @param databaseId - IMF dataflow identifier (e.g. `"WEO"`, `"IFS"`).
 * @returns SDMX agency string (e.g. `"IMF"`, `"OECD.SDD.STES"`).
 * @internal
 */
export function resolveAgency(databaseId) {
    const upper = databaseId.toUpperCase();
    const direct = Object.entries(IMF_DATAFLOW_AGENCY).find(([k]) => k === upper)?.[1];
    if (direct)
        return direct;
    const vintageIdx = upper.indexOf('_VINTAGE');
    if (vintageIdx > 0) {
        const baseId = upper.slice(0, vintageIdx);
        if (baseId) {
            const fromBase = Object.entries(IMF_DATAFLOW_AGENCY).find(([k]) => k === baseId)?.[1];
            if (fromBase)
                return fromBase;
        }
    }
    return DEFAULT_IMF_AGENCY;
}
/**
 * Simple value-encoder for SDMX URL dimension components.
 * @param codes - Array of dimension code strings to encode.
 * @returns URL-encoded codes joined with `+`.
 * @internal
 */
export function encodeSDMXDimension(codes) {
    return codes.map((c) => encodeURIComponent(c)).join('+');
}
/**
 * Build an SDMX key from a filters map + declared dimension order.
 * @param dimensions - Ordered list of dimension names for the dataflow.
 * @param filters - Map from dimension name to array of filter codes.
 * @returns SDMX key string (dot-separated, `*` for unfiltered dimensions).
 * @internal
 */
export function buildSDMXKey(dimensions, filters) {
    const lowercasedFilters = Object.entries(filters).map(([key, value]) => [key.toLowerCase(), value]);
    return dimensions
        .map((dim) => {
        const dimLc = dim.toLowerCase();
        const codes = lowercasedFilters.find(([key]) => key === dimLc)?.[1];
        return Array.isArray(codes) && codes.length > 0 ? encodeSDMXDimension(codes) : '*';
    })
        .join('.');
}
/**
 * Infer the dimension order for a given dataflow.
 * @param databaseId - IMF dataflow identifier (e.g. `"WEO"`, `"CPI"`).
 * @returns Ordered array of dimension name strings.
 * @internal
 */
export function defaultDimensionOrder(databaseId) {
    switch (databaseId.toUpperCase()) {
        case 'WEO':
        case 'FM':
        case 'IFS':
        case 'BOP_AGG':
            return ['COUNTRY', 'INDICATOR', 'FREQUENCY'];
        case 'CPI':
        case 'CPI_WCA':
            return ['COUNTRY', 'INDEX_TYPE', 'COICOP_1999', 'TYPE_OF_TRANSFORMATION', 'FREQUENCY'];
        case 'BOP':
            return ['COUNTRY', 'BOP_ACCOUNTING_ENTRY', 'INDICATOR', 'UNIT', 'FREQUENCY'];
        case 'ER':
            return ['COUNTRY', 'INDICATOR', 'TYPE_OF_TRANSFORMATION', 'FREQUENCY'];
        case 'PCPS':
            return ['COUNTRY', 'INDICATOR', 'DATA_TRANSFORMATION', 'FREQUENCY'];
        case 'DOT':
            return ['COUNTRY', 'COUNTERPART_AREA', 'INDICATOR', 'FREQUENCY'];
        case 'CDIS':
            return ['COUNTRY', 'COUNTERPART_AREA', 'SECTOR', 'INDICATOR', 'FREQUENCY'];
        case 'CPIS':
            return ['COUNTRY', 'COUNTERPART_AREA', 'INSTRUMENT', 'INDICATOR', 'FREQUENCY'];
        case 'FSI':
            return ['COUNTRY', 'INDICATOR', 'SECTOR', 'FREQUENCY'];
        case 'GFSR':
            return ['COUNTRY', 'INDICATOR', 'SECTOR', 'FREQUENCY'];
        case 'GFS':
        case 'GFS_SOO':
        case 'GFS_BS':
        case 'GFS_COFOG':
        case 'GFS_SSUC':
        case 'GFS_SOEF':
        case 'GFS_SFCP':
            return ['COUNTRY', 'SECTOR', 'UNIT', 'INDICATOR', 'FREQUENCY'];
        default:
            return ['COUNTRY', 'INDICATOR', 'FREQUENCY'];
    }
}
/**
 * Infer the natural frequency for IMF dataflows whose editorial use is stable.
 * @param databaseId - IMF dataflow identifier.
 * @returns SDMX frequency code (`"A"`, `"Q"`, `"M"`) or `undefined` when dataflow-specific default is unknown.
 * @internal
 */
export function defaultFrequency(databaseId) {
    // Normalize vintage dataflows (e.g. WEO_VINTAGE_2026_04 → WEO) so they
    // inherit the same default frequency as their base dataflow.
    let normalized = databaseId.toUpperCase();
    const vintageIdx = normalized.indexOf('_VINTAGE');
    if (vintageIdx > 0) {
        normalized = normalized.slice(0, vintageIdx);
    }
    switch (normalized) {
        case 'WEO':
        case 'FM':
        case 'DOT':
        case 'CDIS':
        case 'CPIS':
        case 'GFSR':
            return 'A';
        case 'BOP_AGG':
        case 'FSI':
        case 'GFS':
            return 'Q';
        case 'IFS':
        case 'CPI':
        case 'ER':
        case 'PCPS':
            return 'M';
        default:
            return undefined;
    }
}
/**
 * Add a dataflow-specific default frequency when the caller omitted one,
 * and normalise the legacy `freq` alias to the SDMX 3.0 `FREQUENCY` dimension name.
 * @param databaseId - IMF dataflow identifier used to look up the default frequency.
 * @param filters - Caller-supplied dimension filter map (may include `freq` or `FREQUENCY`).
 * @returns Normalised filter map with `FREQUENCY` populated if it was absent.
 * @internal
 */
export function withDefaultFrequency(databaseId, filters) {
    let freqCodes;
    const passthrough = {};
    for (const [key, value] of Object.entries(filters)) {
        const k = key.toLowerCase();
        if (k === 'frequency' || k === 'freq') {
            if (Array.isArray(value) && value.length > 0 && freqCodes === undefined) {
                freqCodes = value;
            }
        }
        else {
            passthrough[key] = value;
        }
    }
    const fallback = freqCodes ??
        (() => {
            const f = defaultFrequency(databaseId);
            return f ? [f] : undefined;
        })();
    return fallback ? { ...passthrough, FREQUENCY: fallback } : filters;
}
//# sourceMappingURL=sdmx.js.map