# Week-Ahead Generator Data Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   generateWeekAhead()                            │
│                                                                  │
│  1. Get date range (next 7 days)                                │
│  2. Call fetchWeekAheadData(dateRange) ──────┐                  │
│  3. Generate HTML for each language          │                  │
│  4. Write article files                      │                  │
└──────────────────────────────────────────────┼──────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              fetchWeekAheadData(dateRange)                       │
│                                                                  │
│  Promise.allSettled([                                           │
│    ┌─────────────────────────────────────────────────┐          │
│    │  1. getPlenarySessions()                        │          │
│    │     • Fetches parliamentary session schedule    │          │
│    │     • Returns: sessions array                   │          │
│    └─────────────────────────────────────────────────┘          │
│    ┌─────────────────────────────────────────────────┐          │
│    │  2. getCommitteeInfo()                          │◄─── NEW  │
│    │     • Fetches committee meeting schedule        │          │
│    │     • Returns: committees array with agenda     │          │
│    └─────────────────────────────────────────────────┘          │
│    ┌─────────────────────────────────────────────────┐          │
│    │  3. searchDocuments()                           │          │
│    │     • Searches legislative documents            │          │
│    │     • Returns: documents array                  │          │
│    └─────────────────────────────────────────────────┘          │
│    ┌─────────────────────────────────────────────────┐          │
│    │  4. monitorLegislativePipeline()                │◄─── NEW  │
│    │     • Tracks legislative procedures             │          │
│    │     • Returns: procedures array                 │          │
│    └─────────────────────────────────────────────────┘          │
│    ┌─────────────────────────────────────────────────┐          │
│    │  5. getParliamentaryQuestions()                 │          │
│    │     • Fetches Q&A schedule                      │          │
│    │     • Returns: questions array                  │          │
│    └─────────────────────────────────────────────────┘          │
│  ])                                                              │
│                                                                  │
│  ▼ Graceful Degradation                                         │
│  • Each call independent (no blocking)                          │
│  • Partial failures handled                                     │
│  • Fallback to empty arrays                                     │
│  • Detailed console logging                                     │
└──────────────────────────────────────────────────────────────────┘

## Data Structures

### WeekAheadData (Aggregated Result)
```typescript
{
  events: ParliamentEvent[]        // Plenary sessions
  committees: CommitteeMeeting[]   // Committee meetings
  documents: LegislativeDocument[] // Legislative docs
  pipeline: LegislativeProcedure[] // Pipeline status
  questions: ParliamentaryQuestion[] // Q&A schedule
}
```

### CommitteeMeeting (NEW)
```typescript
{
  id?: string
  committee: string              // e.g., "ENVI"
  committeeName?: string         // e.g., "Environment Committee"
  date: string                   // ISO date
  time?: string                  // e.g., "14:00"
  location?: string              // e.g., "Brussels"
  agenda?: Array<{
    item?: number
    title: string
    type?: string
  }>
}
```

### LegislativeDocument
```typescript
{
  id?: string
  type?: string                  // e.g., "REPORT", "RESOLUTION"
  title: string
  date?: string
  status?: string                // e.g., "PENDING", "ADOPTED"
  committee?: string
  rapporteur?: string
}
```

### LegislativeProcedure (NEW)
```typescript
{
  id?: string
  title: string
  stage?: string                 // e.g., "Committee", "Plenary"
  committee?: string
  status?: string                // e.g., "ACTIVE", "STALLED"
  bottleneck?: boolean           // ⚠️ Indicator
}
```

### ParliamentaryQuestion
```typescript
{
  id?: string
  type?: string                  // e.g., "WRITTEN", "ORAL"
  author?: string                // MEP name
  subject: string
  date?: string
  status?: string                // e.g., "PENDING", "ANSWERED"
}
```

## HTML Output Structure

```html
<article>
  <section class="lede">
    Overview paragraph with date range
  </section>

  <section class="plenary-schedule">
    <h2>Plenary Sessions</h2>
    <!-- Always shown, fallback message if empty -->
    <div class="event-item">...</div>
  </section>

  <section class="committee-calendar">        <!-- NEW -->
    <h2>Committee Meetings</h2>
    <div class="committee-item">
      <div class="committee-date">...</div>
      <div class="committee-details">
        <h3>Committee Name</h3>
        <ul class="agenda-list">
          <li>Agenda item 1</li>
          <li>Agenda item 2</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="legislative-documents">     <!-- NEW -->
    <h2>Upcoming Legislative Documents</h2>
    <ul class="document-list">
      <li>Document title (TYPE) — Committee [STATUS]</li>
    </ul>
  </section>

  <section class="legislative-pipeline">      <!-- NEW -->
    <h2>Legislative Pipeline</h2>
    <ul class="pipeline-list">
      <li class="pipeline-item">
        Procedure title STAGE — Committee ⚠️ Bottleneck
      </li>
    </ul>
  </section>

  <section class="qa-schedule">               <!-- NEW -->
    <h2>Parliamentary Questions</h2>
    <ul class="qa-list">
      <li>Question subject (TYPE) — Author</li>
    </ul>
  </section>
</article>
```

## Security Features

### XSS Prevention
- **ALL** external data escaped: `escapeHTML(value)`
- Applied to: dates, titles, names, descriptions, types, etc.
- No raw string interpolation in HTML

### Examples:
```typescript
// ✅ CORRECT
`<h3>${escapeHTML(meeting.committeeName)}</h3>`

// ❌ WRONG (would be vulnerable)
`<h3>${meeting.committeeName}</h3>`
```

## Resilience Features

### 1. Parallel Execution
- All 5 MCP calls run simultaneously
- No sequential blocking
- Faster overall response time

### 2. Independent Error Handling
```typescript
Promise.allSettled([...]) // Never throws!

// Each result is either:
{ status: 'fulfilled', value: MCPToolResult }
{ status: 'rejected', reason: Error }
```

### 3. Graceful Degradation
- MCP unavailable → Use placeholder data
- Single tool fails → Show available data
- All tools fail → Show minimal content
- Never crash the generation process

### 4. Fallback Logic
```typescript
if (result.events.length === 0) {
  // Provide placeholder plenary session
  result.events = [{ ... }]
}
```

## Test Coverage

### Unit Tests (ep-mcp-client.test.js)
- ✅ getCommitteeInfo() success
- ✅ getCommitteeInfo() error handling
- ✅ monitorLegislativePipeline() success
- ✅ monitorLegislativePipeline() error handling

### Integration Tests (week-ahead-data.test.js)
- ✅ Parallel fetching all 5 sources
- ✅ Partial failure handling
- ✅ Data aggregation across sources
- ✅ Complete fallback behavior

**Total: 230 tests passing, including 8 new tests**

## Benefits

### Before (Simple)
- Single data source (plenary sessions only)
- Sequential fetching
- Limited content richness
- Basic HTML structure

### After (Enhanced)
- **5 data sources** (comprehensive coverage)
- **Parallel fetching** (faster)
- **Rich content** (committees, docs, pipeline, Q&A)
- **Detailed HTML** (multiple sections)
- **Better SEO** (dynamic keywords from all sources)
- **Resilient** (graceful degradation)
- **Secure** (XSS prevention)

---
**Version**: 1.0
**Last Updated**: 2026-02-22
**Issue**: #84
