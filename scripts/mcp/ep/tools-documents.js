// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/ep/tools-documents
 * @description Document, event, and intelligence method mixins for
 * {@link EuropeanParliamentMCPClient}. Augments the class prototype with
 * getEvents, getMeeting*, document retrieval, and analysis intelligence methods.
 */
import { EuropeanParliamentMCPClient } from './client.js';
import { MEPS_FALLBACK, DOCUMENTS_FALLBACK, EVENTS_FALLBACK, ACTIVITIES_FALLBACK, ITEMS_FALLBACK, INTELLIGENCE_FALLBACK, STATS_FALLBACK, } from './fallbacks.js';
function _self(client) {
    return client;
}
// \u2500\u2500\u2500 Prototype method implementations \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
EuropeanParliamentMCPClient.prototype.getEvents = async function (options = {}) {
    return _self(this).safeCallTool('get_events', options, EVENTS_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getMeetingActivities = async function (options) {
    if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
        console.warn('get_meeting_activities called without valid sittingId (non-empty string required)');
        return { content: [{ type: 'text', text: ACTIVITIES_FALLBACK }] };
    }
    return _self(this).safeCallTool('get_meeting_activities', { ...options, sittingId: options.sittingId.trim() }, ACTIVITIES_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getMeetingDecisions = async function (options) {
    if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
        console.warn('get_meeting_decisions called without valid sittingId (non-empty string required)');
        return { content: [{ type: 'text', text: '{"decisions": []}' }] };
    }
    return _self(this).safeCallTool('get_meeting_decisions', { ...options, sittingId: options.sittingId.trim() }, '{"decisions": []}');
};
EuropeanParliamentMCPClient.prototype.getMEPDeclarations = async function (options = {}) {
    return _self(this).safeCallTool('get_mep_declarations', options, '{"declarations": []}');
};
EuropeanParliamentMCPClient.prototype.getIncomingMEPs = async function (options = {}) {
    return _self(this).safeCallTool('get_incoming_meps', options, MEPS_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getOutgoingMEPs = async function (options = {}) {
    return _self(this).safeCallTool('get_outgoing_meps', options, MEPS_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getHomonymMEPs = async function (options = {}) {
    return _self(this).safeCallTool('get_homonym_meps', options, MEPS_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getLatestVotes = async function (options = {}) {
    return _self(this).safeCallToolWithReliabilityTimeout('get_latest_votes', options, '{"votes": [], "dataFreshness": "NEAR_REALTIME"}');
};
EuropeanParliamentMCPClient.prototype.getPlenaryDocuments = async function (options = {}) {
    return _self(this).safeCallTool('get_plenary_documents', options, DOCUMENTS_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getCommitteeDocuments = async function (options = {}) {
    return _self(this).safeCallTool('get_committee_documents', options, DOCUMENTS_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getPlenarySessionDocuments = async function (options = {}) {
    return _self(this).safeCallTool('get_plenary_session_documents', options, DOCUMENTS_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getPlenarySessionDocumentItems = async function (options = {}) {
    return _self(this).safeCallTool('get_plenary_session_document_items', options, ITEMS_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getControlledVocabularies = async function (options = {}) {
    return _self(this).safeCallTool('get_controlled_vocabularies', options, '{"vocabularies": []}');
};
EuropeanParliamentMCPClient.prototype.getExternalDocuments = async function (options = {}) {
    return _self(this).safeCallTool('get_external_documents', options, DOCUMENTS_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getMeetingForeseenActivities = async function (options) {
    if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
        console.warn('get_meeting_foreseen_activities called without valid sittingId (non-empty string required)');
        return { content: [{ type: 'text', text: ACTIVITIES_FALLBACK }] };
    }
    return _self(this).safeCallTool('get_meeting_foreseen_activities', { ...options, sittingId: options.sittingId.trim() }, ACTIVITIES_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getProcedureEvents = async function (options) {
    if (typeof options.processId !== 'string' || options.processId.trim().length === 0) {
        console.warn('get_procedure_events called without valid processId (non-empty string required)');
        return { content: [{ type: 'text', text: EVENTS_FALLBACK }] };
    }
    return _self(this).safeCallTool('get_procedure_events', { ...options, processId: options.processId.trim() }, EVENTS_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getMeetingPlenarySessionDocuments = async function (options) {
    if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
        console.warn('get_meeting_plenary_session_documents called without valid sittingId (non-empty string required)');
        return { content: [{ type: 'text', text: DOCUMENTS_FALLBACK }] };
    }
    return _self(this).safeCallTool('get_meeting_plenary_session_documents', { ...options, sittingId: options.sittingId.trim() }, DOCUMENTS_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getMeetingPlenarySessionDocumentItems = async function (options) {
    if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
        console.warn('get_meeting_plenary_session_document_items called without valid sittingId (non-empty string required)');
        return { content: [{ type: 'text', text: ITEMS_FALLBACK }] };
    }
    return _self(this).safeCallTool('get_meeting_plenary_session_document_items', { ...options, sittingId: options.sittingId.trim() }, ITEMS_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.networkAnalysis = async function (options = {}) {
    return _self(this).safeCallTool('network_analysis', options, INTELLIGENCE_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.sentimentTracker = async function (options = {}) {
    return _self(this).safeCallTool('sentiment_tracker', options, INTELLIGENCE_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.earlyWarningSystem = async function (options = {}) {
    return _self(this).safeCallTool('early_warning_system', options, INTELLIGENCE_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.comparativeIntelligence = async function (options) {
    if (!Array.isArray(options.mepIds) || options.mepIds.length < 2) {
        console.warn('comparative_intelligence called without valid mepIds (array of at least 2 required)');
        return { content: [{ type: 'text', text: INTELLIGENCE_FALLBACK }] };
    }
    return _self(this).safeCallTool('comparative_intelligence', options, INTELLIGENCE_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.correlateIntelligence = async function (options) {
    if (!Array.isArray(options.mepIds) || options.mepIds.length === 0) {
        console.warn('correlate_intelligence called without valid mepIds (non-empty string array required)');
        return { content: [{ type: 'text', text: INTELLIGENCE_FALLBACK }] };
    }
    return _self(this).safeCallTool('correlate_intelligence', options, INTELLIGENCE_FALLBACK);
};
EuropeanParliamentMCPClient.prototype.getAllGeneratedStats = async function (options = {}) {
    return _self(this).safeCallTool('get_all_generated_stats', options, STATS_FALLBACK);
};
//# sourceMappingURL=tools-documents.js.map