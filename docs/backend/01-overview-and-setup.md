# 01) Overview and Setup

## Backend Goal

The backend provides a REST API for managing the lead lifecycle, starting from manual creation or ingestion from an external webhook, all the way to tracking the lead across different stages while maintaining a timeline of important activities.

The core entity is `Lead`, and its tracked activity entity is `LeadActivity`.

## Main Features

### 1. Lead Management

This includes:
- creating a new lead
- listing leads with pagination
- searching by name, email, or phone
- filtering by stage and source
- filtering by date range
- sorting by selected columns
- showing a single lead with activities
- updating a lead
- soft deleting a lead

### 2. Stage Management

There is a dedicated endpoint for changing the stage only:
- suitable for a Kanban UI or any interface that needs fast lead movement between stages
- keeps stage-change logic simple and isolated
- automatically creates an activity through `LeadObserver`

### 3. Statistics

One endpoint provides aggregated statistics for:
- total leads
- counts by stage
- counts by source

This is suitable for dashboard cards or frontend charts.

### 4. CSV Import

The backend accepts a CSV file, reads its header, matches columns, and validates each row. Valid rows are imported, while invalid rows are skipped with a summarized error report.

### 5. Enrichment

When a lead has an email address, the enrichment endpoint can be called to:
- execute a dedicated service
- store the result under `metadata['enrichment']`
- add a `LeadActivity` of type `api_sync`

### 6. Multi-channel Ingestion

The project accepts payloads from different sources in different formats:
- Facebook Lead Ads
- WhatsApp / Generic Chat
- Zapier-style generic webhook

It then normalizes all of them into a unified structure compatible with the `Lead` model.

## Project Setup and Run

```bash
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

To enable the asynchronous listener:

```bash
php artisan queue:listen --tries=1 --timeout=0
```

## Seed Data

When running:

```bash
php artisan migrate:fresh --seed
```

The application will:
- create a default user: `test@example.com`
- run `LeadSeeder`
- generate 50 leads through `LeadFactory`

The factory generates varied sample data including:
- names
- email values that may be nullable
- phone numbers that may be nullable
- random `source` values from the supported set
- random `stage` values from the supported set
- `assigned_to` values that may be nullable
- sample `metadata`

## Supported System Values

### source
- `facebook`
- `whatsapp`
- `website`
- `manual`

### stage
- `new`
- `contacted`
- `follow_up`
- `assigned`
- `converted`
- `lost`

### activity type
- `stage_change`
- `note_added`
- `email_sent`
- `api_sync`

## How a Request Starts Inside Laravel

The general request flow is:

1. The request enters Laravel through `public/index.php`
2. The application is bootstrapped from `bootstrap/app.php`
3. The request passes through routing and middleware
4. It reaches the matching controller inside `app/Http/Controllers/Api/V1`
5. If a Form Request exists, input is validated first
6. The controller logic runs or delegates to a specialized service
7. A response is returned either as a `JsonResponse` or an `API Resource`

## Unified Error Handling

Inside `bootstrap/app.php`, API errors were customized as follows:

- validation errors return a consistent JSON structure with `message` and `errors`
- missing routes return `Resource not found.` with HTTP 404
- internal failures return `Server error.` with HTTP 500 when debug is disabled

This improves frontend API consumption and prevents default HTML error pages from leaking into API responses.
