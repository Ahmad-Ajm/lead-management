# 05) Architectural Decisions

This file explains the main architectural decisions reflected in the current backend implementation and why they are reasonable for this project.

## 1. Keeping the backend API-focused and separated from the frontend

### Decision
The repository is documented as a backend-only Laravel API rather than as a full-stack application.

### Why
The implemented code in this repository is centered around API concerns:
- lead CRUD endpoints
- statistics
- CSV import
- enrichment
- webhook ingestion
- activity tracking

The backend is therefore treated as a standalone service with clear JSON contracts.

### Benefit
- easier to test independently
- easier to connect later to a Next.js frontend or any other client
- clearer boundaries between server-side business logic and presentation logic

### Trade-off
Frontend behavior and UI assumptions are outside the scope of this repository and documentation.

## 2. Using dedicated controllers instead of one oversized controller

### Decision
The implementation splits responsibilities across multiple controllers instead of placing everything inside a single `LeadController`.

Examples:
- `LeadController` for CRUD
- `LeadStageController` for stage-only updates
- `LeadStatsController` for dashboard statistics
- `LeadImportController` for CSV import
- `LeadEnrichmentController` for enrichment
- dedicated webhook controllers per source

### Why
Different operations have different validation rules, different response shapes, and different business flows.

### Benefit
- smaller methods
- easier maintenance
- clearer routing and intent
- easier future refactoring or testing per feature

### Trade-off
There are more classes to navigate, but the structure is cleaner and scales better.

## 3. Isolating validation in Form Requests

### Decision
Validation rules are placed in dedicated Form Request classes rather than embedded directly inside controller methods.

### Why
Validation is a separate concern from persistence and response formatting.

### Benefit
- cleaner controllers
- reusable validation logic
- easier future testing of request rules
- consistent request handling before business logic runs

### Trade-off
This adds a few more files, but they keep controller code shorter and easier to reason about.

## 4. Using API Resources for response consistency

### Decision
Responses are formatted through `LeadResource` and `LeadActivityResource`.

### Why
The project needs predictable JSON structures for frontend consumption and webhook responses.

### Benefit
- stable API output
- one place to shape response fields
- easy inclusion of nested relations only when loaded
- less duplication across controllers

### Trade-off
There is an extra abstraction layer, but it pays off quickly as the API grows.

## 5. Keeping filtering logic close to the model through Eloquent scopes

### Decision
Search and filter logic is expressed as model scopes such as:
- `ofStage()`
- `fromSource()`
- `search()`
- `betweenDates()`

### Why
This keeps query rules close to the `Lead` model rather than scattering them across controllers.

### Benefit
- readable query composition
- reusable filtering logic
- controllers stay focused on orchestration instead of query details

### Trade-off
Very large search systems may later require query objects or repositories, but scopes are a strong fit for the current size of the project.

## 6. Using a dedicated stage endpoint instead of overloading full updates

### Decision
A separate endpoint exists for changing a lead’s stage: `PATCH /api/v1/leads/{lead}/stage`.

### Why
Stage changes are a frequent and narrow operation, especially for Kanban-style workflows.

### Benefit
- smaller payloads
- narrower validation
- lower coupling between general updates and stage movement
- clearer behavior for UI clients

### Trade-off
It creates one more endpoint to maintain, but the separation is worth it because stage movement is a first-class workflow in this project.

## 7. Using an Observer to record stage changes automatically

### Decision
`LeadObserver` watches model updates and creates activities when `stage` changes.

### Why
Stage-change logging is a domain rule, not just a controller concern. The same rule should apply regardless of where the update originates.

### Benefit
- avoids duplicating activity creation logic in multiple places
- keeps the audit trail tied to the model lifecycle
- preserves behavior even if future code paths update leads from other services or commands

### Trade-off
Observers add hidden behavior for developers unfamiliar with the project, so they must be documented clearly.

## 8. Using Events and a Queueable Listener for assignment behavior

### Decision
When `assigned_to` changes, the observer dispatches `LeadAssigned`, which is handled by `LogLeadAssignedNotification` through the queue.

### Why
Assignment-related side effects should not block the main request flow unnecessarily.

### Benefit
- better separation between the core update and side effects
- easier to extend later with real notifications, emails, or third-party integrations
- keeps the controller and observer focused on the main domain action

### Trade-off
This requires a running queue listener to fully observe the asynchronous side effects during development.

## 9. Using Strategy + Factory for multi-source webhook ingestion

### Decision
Webhook ingestion is built around:
- `LeadNormalizerInterface`
- one normalizer per source
- `LeadNormalizerFactory`
- `LeadIngestionService` working on normalized data

### Why
Each source sends a different payload structure, but the domain model expects one unified lead shape.

### Benefit
- source-specific parsing stays isolated
- adding a new source is straightforward
- the core ingestion service remains cleaner
- avoids long conditional blocks based on source type

### Trade-off
This introduces more classes than a quick inline implementation, but it greatly improves extensibility and readability.

## 10. Verifying webhook signatures in middleware

### Decision
Signature verification is handled in `VerifyWebhookSignature` middleware before webhook controllers run.

### Why
Signature verification is a transport/security concern, not business logic.

### Benefit
- controllers can assume trusted requests
- shared verification logic for all webhook sources
- cleaner and more reusable security handling

### Trade-off
Middleware configuration must stay synchronized with route definitions and webhook secrets.

## 11. Using a 24-hour duplicate window for webhook ingestion

### Decision
Webhook ingestion treats leads as duplicates only when:
- the source matches
- the lead was created within the last 24 hours
- email or phone matches

### Why
Webhook-based systems often resend or replay similar data in a short time window. A bounded duplicate window reduces accidental duplication without aggressively merging unrelated historical leads.

### Benefit
- practical protection against repeated webhook submissions
- less noisy lead data
- keeps the merge rule understandable

### Trade-off
A 24-hour window is a business assumption. In another system it might need to be shorter, longer, or configurable.

## 12. Returning consistent JSON API errors from bootstrap level

### Decision
Validation, not-found, and server errors are normalized into JSON responses at the application bootstrap level.

### Why
APIs should not leak HTML error pages or inconsistent response formats.

### Benefit
- predictable frontend integration
- simpler client-side error handling
- cleaner contract for all API consumers

### Trade-off
Centralized error handling must stay aligned with framework changes and project conventions.

## 13. Keeping enrichment behind a service even though the current implementation is mocked

### Decision
Enrichment is wrapped in `LeadEnrichmentService` even though the current implementation returns mocked data.

### Why
The integration boundary is already separated from controllers, which makes future replacement with a real provider straightforward.

### Benefit
- preserves clean architecture now
- reduces future refactoring cost
- keeps external integration logic out of controllers

### Trade-off
The service abstraction is slightly heavier than directly returning mock data from the controller, but it is the better long-term structure.

## Summary

The current backend architecture favors:
- separation of concerns
- predictable API responses
- extensibility for new lead sources
- auditability through activities
- minimal coupling between request handling and side effects

The design is intentionally more structured than a quick prototype, while still remaining simple enough for a small-to-medium Laravel backend.
