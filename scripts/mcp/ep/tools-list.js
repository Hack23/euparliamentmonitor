// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/ep/tools-list
 * @description Canonical list of European Parliament MCP tool identifiers.
 * Used for drift-guard validation, probe tooling, and barrel re-exports.
 *
 * Extracted from `client.ts` to keep individual file sizes under 400 LOC.
 */
/**
 * Canonical list of every tool exposed by the European Parliament MCP server.
 * Drift-guarded by `test/integration/mcp/ep-mcp.test.js`.
 */
export const EP_MCP_TOOLS = [
    'analyze_coalition_dynamics',
    'analyze_committee_activity',
    'analyze_country_delegation',
    'analyze_legislative_effectiveness',
    'analyze_voting_patterns',
    'assess_mep_influence',
    'comparative_intelligence',
    'compare_political_groups',
    'correlate_intelligence',
    'detect_voting_anomalies',
    'early_warning_system',
    'generate_political_landscape',
    'generate_report',
    'get_adopted_texts',
    'get_adopted_texts_feed',
    'get_all_generated_stats',
    'get_committee_documents',
    'get_committee_documents_feed',
    'get_committee_info',
    'get_controlled_vocabularies',
    'get_controlled_vocabularies_feed',
    'get_corporate_bodies_feed',
    'get_current_meps',
    'get_documents_feed',
    'get_events',
    'get_events_feed',
    'get_external_documents',
    'get_external_documents_feed',
    'get_homonym_meps',
    'get_incoming_meps',
    'get_latest_votes',
    'get_meeting_activities',
    'get_meeting_decisions',
    'get_meeting_foreseen_activities',
    'get_meeting_plenary_session_document_items',
    'get_meeting_plenary_session_documents',
    'get_mep_declarations',
    'get_mep_declarations_feed',
    'get_mep_details',
    'get_meps',
    'get_meps_feed',
    'get_outgoing_meps',
    'get_parliamentary_questions',
    'get_parliamentary_questions_feed',
    'get_plenary_documents',
    'get_plenary_documents_feed',
    'get_plenary_session_document_items',
    'get_plenary_session_documents',
    'get_plenary_session_documents_feed',
    'get_plenary_sessions',
    'get_procedure_event_by_id',
    'get_procedure_events',
    'get_procedures',
    'get_procedures_feed',
    'get_server_health',
    'get_speeches',
    'get_voting_records',
    'monitor_legislative_pipeline',
    'network_analysis',
    'search_documents',
    'sentiment_tracker',
    'track_legislation',
    'track_mep_attendance',
];
//# sourceMappingURL=tools-list.js.map