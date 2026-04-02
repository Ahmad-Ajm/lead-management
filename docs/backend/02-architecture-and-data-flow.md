# 02) Architecture and Data Flow

## Main Layers

The backend follows Laravel’s standard application structure and separates responsibilities across the framework’s usual layers:

- **Models**: represent data, relationships, and query scopes
- **Form Requests**: validate incoming input
- **Controllers**: coordinate requests and responses, then delegate to services
- **Resources**: unify JSON response structure
- **Services**: hold business logic that should not live inside controllers
- **Observer**: watches `Lead` model changes and generates activities or events automatically
- **Events / Listeners**: execute asynchronous behavior for selected changes
- **Middleware**: verifies webhook signatures before a request reaches the controller

## Data Model

## Lead

The `Lead` model uses:
- `HasFactory`
- `SoftDeletes`

### Fillable fields
- `name`
- `email`
- `phone`
- `source`
- `stage`
- `assigned_to`
- `notes`
- `metadata`

### casts
- `metadata => array`

### relationships
- `activities(): HasMany`
- `assignedUser(): BelongsTo`

### scopes
- `scopeOfStage($query, ?string $stage)`
- `scopeFromSource($query, ?string $source)`
- `scopeSearch($query, ?string $term)`
- `scopeBetweenDates($query, ?string $from, ?string $to)`

These scopes are the core of the filtering logic inside `LeadController@index`.

## LeadActivity

The `LeadActivity` model:
- does not use Laravel’s default timestamps (`$timestamps = false`)
- relies on `created_at` only

### relationships
- `lead(): BelongsTo`
- `performedBy(): BelongsTo`

## Controllers

## LeadController

Responsible for the main CRUD flow.

### `index()`
Builds the query in the following order:
1. defines the allowed sortable columns
2. reads `sort_by` and `sort_dir`
3. applies a safe fallback if the client sends a disallowed sort field
4. starts with `Lead::query()`
5. eager loads `assignedUser`
6. applies `search()`
7. applies `ofStage()`
8. applies `fromSource()`
9. applies `betweenDates()`
10. applies `orderBy()`
11. runs `paginate(20)`
12. returns `LeadResource::collection(...)`

### `store()`
- accepts `StoreLeadRequest`
- creates the lead from validated data
- loads `assignedUser`
- returns `LeadResource` with HTTP 201

### `show()`
- loads `assignedUser`
- loads `activities` in reverse chronological order using `latest('created_at')`
- returns `LeadResource`

### `update()`
- uses `UpdateLeadRequest`
- updates the record
- reloads relationships and activities
- returns `LeadResource`

### `destroy()`
- performs a soft delete
- returns a simple JSON success message

## LeadStageController

This controller is small and intentionally focused:
- accepts only `stage`
- updates only the stage
- returns the updated lead with relations and activities

Architectural benefit of this split:
- a clear endpoint for a Kanban-style UI
- narrower validation rules
- less logic and no need to send a full update body when only the stage changes

## LeadStatsController

Collects statistics directly from the database:
- `total`
- `by_stage`
- `by_source`

It uses `groupBy` and `pluck` to build a simple dashboard-friendly response.

## LeadImportController

A single-responsibility invokable controller that passes the uploaded file to `LeadImportService` and returns the import summary.

## LeadEnrichmentController

Also an invokable controller. Its flow is:
1. verify that the lead has an email
2. call `LeadEnrichmentService`
3. merge the result into `metadata`
4. add an `api_sync` activity
5. return the enrichment result as JSON

## Webhook Controllers

There are three separate controllers:
- `FacebookWebhookController`
- `WhatsAppWebhookController`
- `ZapierWebhookController`

Each one:
- receives the request after signature verification in middleware
- sends the payload to `LeadIngestionService` with the source name
- catches `ValidationException`
- returns `LeadResource` with HTTP 201 or 200 depending on whether the record was created or updated

## Resources

## LeadResource

This resource normalizes lead output into a stable response shape containing:
- the main lead fields
- `assigned_to`
- `assigned_user` when the relation is loaded
- `notes`
- `metadata`
- `created_at`
- `updated_at`
- `activities` when loaded

Keeping both `assigned_to` and `assigned_user` is useful for the frontend:
- `assigned_to` is useful for quick programmatic actions
- `assigned_user` is useful for display without requiring another request

## LeadActivityResource

Returns:
- `id`
- `lead_id`
- `type`
- `description`
- `performed_by`
- `created_at`

## Form Requests

### StoreLeadRequest
Used for full lead creation with validation for:
- required name
- nullable + valid + unique email
- nullable phone
- source within the supported values
- stage within the supported values
- `assigned_to` must exist in `users` if provided
- `metadata` must be an array if provided

### UpdateLeadRequest
Same as create, except the email uniqueness rule ignores the current record.

### UpdateLeadStageRequest
Validates `stage` only.

### ImportLeadsRequest
Validates:
- file presence
- that it is an actual uploaded file
- csv/txt extension
- maximum size of 2MB

## Observer + Event + Listener

## LeadObserver

The observer is registered inside `AppServiceProvider` through:

```php
Lead::observe(LeadObserver::class);
```

Inside `updated()`, it contains two important behaviors.

### 1. Watching stage changes
If `stage` changed:
- it reads the old stage via `getOriginal('stage')`
- it reads the new stage from the current model state
- it creates a `LeadActivity` of type `stage_change`

### 2. Watching assignment changes
If `assigned_to` changed and now has a value:
- it dispatches the `LeadAssigned` event

## LeadAssigned Event

A small event object that simply carries the `Lead` instance.

## LogLeadAssignedNotification Listener

This listener:
- implements `ShouldQueue`
- runs outside the main request when the queue listener is active
- writes to the Laravel log
- adds an activity of type `api_sync` describing the assignment

> Note: the activity type used here is `api_sync` even though the business meaning is assignment-related, because the current `lead_activities.type` enum does not include a dedicated value such as `assignment`.

## Middleware

## VerifyWebhookSignature

This middleware verifies:
1. that a secret exists for the source in `config/webhooks.php`
2. that the request contains the `X-Webhook-Signature` header
3. that an HMAC-SHA256 hash of the raw request body can be calculated
4. that the calculated signature matches the incoming one using `hash_equals`

If any condition fails, it returns an appropriate JSON response:
- HTTP 500 when the source secret is missing in configuration
- HTTP 401 when the signature header is missing
- HTTP 401 when the signature is invalid

The middleware alias is registered inside `bootstrap/app.php`:

```php
'webhook.signature' => VerifyWebhookSignature::class,
```

## Important Project Flows

## Manual lead creation flow

1. The client sends `POST /api/v1/leads`
2. `StoreLeadRequest` validates the payload
3. `LeadController@store` creates the record
4. The response is returned through `LeadResource`

## Stage update flow

1. The client sends `PATCH /api/v1/leads/{lead}/stage`
2. `UpdateLeadStageRequest` validates `stage`
3. `LeadStageController@update` updates the record
4. `LeadObserver@updated` detects the stage change
5. A `LeadActivity` is created
6. The updated lead is returned in the response

## Assignment flow

1. A lead is updated and `assigned_to` changes
2. `LeadObserver@updated` detects the change
3. `LeadAssigned` is dispatched
4. `LogLeadAssignedNotification` handles the event
5. A log entry is written and an activity is created

## Webhook flow

1. The request reaches a webhook route
2. `VerifyWebhookSignature` validates the signature
3. The controller sends the payload to `LeadIngestionService`
4. The service requests the proper normalizer from `LeadNormalizerFactory`
5. The normalizer converts the payload into one unified structure
6. The system searches for duplicates within the last 24 hours for the same source
7. It either updates an existing lead or creates a new one
8. It creates an `api_sync` activity
9. The response returns HTTP 201 or 200
