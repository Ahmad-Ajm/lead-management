# Lead Management Backend Documentation

This documentation covers **the backend only** for the current project in this repository.

A frontend application also exists in the repository, but this README and the `docs/` directory intentionally document only the Laravel backend API and backend-side flows.

## Overview

This project is a Laravel API for lead management, covering the following areas:

- lead management through a REST API
- filtering, searching, sorting, and pagination
- soft deletes
- lead detail retrieval with an activity timeline
- stage changes through a dedicated endpoint
- dashboard statistics by stage and source
- CSV lead import
- lead enrichment through a dedicated service
- multi-channel lead ingestion through webhooks
- webhook signature verification using HMAC-SHA256
- duplicate detection within 24 hours for the same source
- automatic activity logging when the stage changes and during some asynchronous operations

## Technology Used

- PHP 8.2+
- Laravel 12
- Eloquent ORM
- SQLite/MySQL-compatible application structure
- Queueable listener for asynchronous event handling

## Short Project Structure


app/
  Console/Commands/           # Custom Artisan commands
  Events/                     # Events
  Http/
    Controllers/Api/V1/       # API controllers
    Middleware/               # Middleware such as webhook signature verification
    Requests/                 # Form Requests for validation
    Resources/                # API Resources for response formatting
  Listeners/                  # Event listeners
  Models/                     # Models and relationships
  Observers/                  # Observers for automatic activity creation
  Services/                   # Business logic and helper services
    Ingestion/
      Contracts/              # Contracts
      Factories/              # Factory for selecting the correct normalizer
      Normalizers/            # Convert different payloads into one normalized structure
bootstrap/
  app.php                     # Routing + middleware alias + exception rendering
config/
  webhooks.php                # Webhook secret configuration
routes/
  api.php                     # All API v1 routes
database/
  migrations/                 # Schema
  factories/                  # Fake data generation
  seeders/                    # Seeders


## Local Run

> The following commands are enough to understand and run the backend in a standard prepared Laravel local environment.

```bash
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

To run the queue listener for asynchronous events:

php artisan queue:listen --tries=1 --timeout=0


## Important Commands During Development

Run the webhook simulation command:


php artisan leads:simulate facebook
php artisan leads:simulate whatsapp
php artisan leads:simulate zapier

## What Files Document In Docs/back end

- `docs/01-overview-and-setup.md`
  General project overview, modules, and startup information.
- `docs/02-architecture-and-data-flow.md`
  Internal architecture, services, observer, and events.
- `docs/03-api-reference.md`
  Endpoint reference with request/response examples.
- `docs/04-webhooks-csv-enrichment.md`
  Ingestion flow, normalizers, duplicate handling, CSV import, and enrichment.
- `docs/05-architectural-decisions.md`
  Main architectural decisions behind the current backend implementation and the trade-offs behind them.

## Important Notes About the Current Implementation

- The current repository documents **the backend only**.
- The current enrichment service is present and connected to the API, but in the current implementation it returns a **mock response** inside `LeadEnrichmentService` instead of calling a real external provider.
- An event/listener flow is implemented when `assigned_to` changes, and the listener runs through the queue and adds an activity log.
- JSON API error responses were customized inside `bootstrap/app.php` for validation errors, 404 responses, and some server-side failures.
