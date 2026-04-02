# 04) Webhooks, CSV Import, and Enrichment

## Webhook Endpoints

- **POST** `/api/v1/webhooks/facebook`
- **POST** `/api/v1/webhooks/whatsapp`
- **POST** `/api/v1/webhooks/zapier`

All of these routes are protected by middleware:

```php
->middleware('webhook.signature:{source}')
```

## Signature Verification

Required header:

```text
X-Webhook-Signature: sha256=<hash>
```

How the signature is computed:
- take the raw request body as-is
- apply `hash_hmac('sha256', $rawBody, $secret)`
- prefix the result with `sha256=`

If the signature is missing or invalid, the API returns HTTP 401.

## Strategy / Factory Pattern in Ingestion

The project uses the following pattern:

1. the controller identifies the source name (`facebook`, `whatsapp`, `zapier`)
2. `LeadIngestionService` requests the correct normalizer from `LeadNormalizerFactory`
3. the factory returns an object that implements `LeadNormalizerInterface`
4. each normalizer converts a source-specific payload into one unified structure

The purpose of this design is:
- to separate payload parsing rules by source
- to make it easy to add new sources later
- to let `LeadIngestionService` work with one normalized structure instead of many source-specific branches

## LeadNormalizerInterface

The contract is intentionally simple:

```php
public function normalize(array $payload): array;
```

Any new source only needs a new class implementing this contract, plus registration inside the factory.

## FacebookLeadNormalizer

Expected payload shape:

```json
{
  "entry": [{
    "changes": [{
      "field": "leadgen",
      "value": {
        "form_id": "fb_form_12345",
        "leadgen_id": "lead_98765",
        "created_time": 1740300000,
        "field_data": [
          { "name": "full_name", "values": ["John Doe"] },
          { "name": "email", "values": ["john@example.com"] },
          { "name": "phone_number", "values": ["+31612345678"] }
        ]
      }
    }]
  }]
}
```

The normalizer converts it into:
- `name`
- `email`
- `phone`
- `source=facebook`
- `stage=new`
- `notes=Imported from Facebook lead webhook`
- `metadata.raw_payload`
- `metadata.normalized` containing `form_id`, `leadgen_id`, and `created_time`

If the structure is invalid, it throws `ValidationException`.

## WhatsAppLeadNormalizer

Expected payload shape:

```json
{
  "contact": {
    "name": "Ahmed",
    "phone": "+971501234567",
    "wa_id": "971501234567"
  },
  "message": "I'm interested in your services",
  "timestamp": "2026-02-23T10:00:00Z"
}
```

It converts the payload into a lead with:
- `source=whatsapp`
- `notes` taken from `message`
- `metadata.normalized.wa_id`
- `metadata.normalized.timestamp`

## ZapierLeadNormalizer

Expected payload shape:

```json
{
  "source": "website",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+31687654321",
  "extra": {
    "campaign": "Spring 2026",
    "ad_id": "tt_ad_555"
  }
}
```

If the incoming `source` is unsupported, it is converted to `manual` instead of rejecting the request.

## Duplicate Detection

Inside `LeadIngestionService::findDuplicateLead()`, the system looks for an existing lead that matches:

- the same `source`
- created within the last 24 hours
- matching **email or phone** when either value is available

If neither email nor phone exists in the normalized payload:
- duplicate matching is intentionally disabled via `whereRaw('1 = 0')`
- therefore the operation is not treated as a duplicate

## What Happens When a Duplicate Exists?

If the system finds a matching lead:
- `name` is updated
- `email` is updated
- `phone` is updated
- `notes` are updated
- new `metadata` is merged into the old one using `array_merge`
- an activity is created: `Lead updated from {source} webhook`
- the response returns status `updated` with HTTP 200

## What Happens When No Duplicate Exists?

- the system creates a new lead
- it adds an activity: `Lead created from {source} webhook`
- the response returns status `created` with HTTP 201

## Webhook Response Examples

### Created

```json
{
  "data": {
    "id": 90,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+31612345678",
    "source": "facebook",
    "stage": "new",
    "assigned_to": null,
    "assigned_user": null,
    "notes": "Imported from Facebook lead webhook",
    "metadata": {
      "raw_payload": {},
      "normalized": {
        "form_id": "fb_form_12345",
        "leadgen_id": "lead_98765",
        "created_time": 1740300000
      }
    },
    "created_at": "2026-03-29T22:00:00.000000Z",
    "updated_at": "2026-03-29T22:00:00.000000Z",
    "activities": [
      {
        "id": 101,
        "lead_id": 90,
        "type": "api_sync",
        "description": "Lead created from facebook webhook",
        "performed_by": null,
        "created_at": "2026-03-29T22:00:00.000000Z"
      }
    ]
  },
  "message": "Facebook webhook processed successfully."
}
```

### Validation failed

```json
{
  "message": "Validation failed.",
  "errors": {
    "payload": [
      "Invalid Facebook webhook payload."
    ]
  }
}
```

### Invalid signature

```json
{
  "message": "Invalid webhook signature."
}
```

## Testing Webhooks From Inside the Project

A dedicated Artisan command exists:

```bash
php artisan leads:simulate facebook
php artisan leads:simulate whatsapp
php artisan leads:simulate zapier
```

The command does the following:
1. builds a valid sample payload for the selected source
2. encodes the JSON body
3. computes the HMAC-SHA256 signature exactly like the middleware
4. sends the request to `http://127.0.0.1:8000/api/v1/webhooks/{source}`
5. prints the status code and full response body

This makes quick reviewer testing possible without needing Postman.

## CSV Import in Detail

### LeadImportService

The service reads the file row by row:

1. open the file
2. read the first row as the header
3. initialize counters:
   - `total_rows`
   - `imported_count`
   - `skipped_count`
   - `errors`
4. skip empty rows
5. match each row against the header column names
6. normalize empty values to `null`
7. apply internal validation to every row
8. create a valid lead with metadata indicating it was imported via CSV
9. return the full summary at the end

### Validation rules per row
- `name` required
- `email` nullable + email + unique
- `phone` nullable
- `source` enum
- `stage` enum
- `assigned_to` nullable integer + exists in users
- `notes` nullable

### Preferred CSV example

```csv
name,email,phone,source,stage,assigned_to,notes
John Doe,john@example.com,+31612345678,manual,new,,Imported manually
Ahmed Ali,,+971500000000,whatsapp,contacted,1,Called once
```

## Enrichment in Detail

### LeadEnrichmentService

The current implementation returns a **mock response** from inside the code with fields such as:

- `email`
- `is_valid`
- `deliverability`
- `quality_score`
- `provider`

There is also a commented example in the file showing how a real external API could later be connected through `Http::timeout(10)->get(...)`, but that integration is not active in the current repository.

### What Happens During Enrichment?

1. the controller verifies that the lead has an email
2. it calls the service
3. it reads the current `metadata` or starts with an empty array
4. it stores the result under `metadata['enrichment']`
5. it saves the lead
6. it adds an `api_sync` activity
7. it returns the result in the response

## Reasonable Future Extensions

These are not part of the current implementation, but they are natural extensions of the current design:
- add more normalizers for additional lead sources
- add rate limiting to webhook routes
- add more precise activity types such as `assignment` or `enriched`
- convert `LeadNormalizerFactory` into a container-based factory if the number of sources grows
- connect a real enrichment API instead of the current mock
- add feature and unit tests for webhooks and import flows
