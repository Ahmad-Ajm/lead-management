# 03) API Reference

All routes are under the following prefix:

```text
/api/v1
```

## 1. Get dashboard stats

**GET** `/api/v1/leads/stats`

### Response 200

```json
{
  "total": 50,
  "by_stage": {
    "new": 10,
    "contacted": 7,
    "follow_up": 8,
    "assigned": 6,
    "converted": 12,
    "lost": 7
  },
  "by_source": {
    "facebook": 11,
    "whatsapp": 14,
    "website": 12,
    "manual": 13
  }
}
```

## 2. List leads

**GET** `/api/v1/leads`

### Query parameters

- `search`
- `stage`
- `source`
- `date_from`
- `date_to`
- `sort_by` = `id | name | source | stage | created_at`
- `sort_dir` = `asc | desc`
- `page`

### Example

```http
GET /api/v1/leads?search=ahmed&stage=new&source=facebook&sort_by=created_at&sort_dir=desc&page=1
```

### Response 200

> The real response is a Laravel paginated resource collection, so it includes `data`, `links`, and `meta`.

```json
{
  "data": [
    {
      "id": 1,
      "name": "Ahmed Ali",
      "email": "ahmed@example.com",
      "phone": "+971500000000",
      "source": "facebook",
      "stage": "new",
      "assigned_to": null,
      "assigned_user": null,
      "notes": null,
      "metadata": {
        "imported": true,
        "tag": "demo"
      },
      "created_at": "2026-03-29T20:00:00.000000Z",
      "updated_at": "2026-03-29T20:00:00.000000Z",
      "activities": []
    }
  ],
  "links": {},
  "meta": {}
}
```

## 3. Create lead

**POST** `/api/v1/leads`

### Request body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+31612345678",
  "source": "manual",
  "stage": "new",
  "assigned_to": null,
  "notes": "Created from admin panel",
  "metadata": {
    "tag": "vip"
  }
}
```

### Response 201

```json
{
  "data": {
    "id": 51,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+31612345678",
    "source": "manual",
    "stage": "new",
    "assigned_to": null,
    "assigned_user": null,
    "notes": "Created from admin panel",
    "metadata": {
      "tag": "vip"
    },
    "created_at": "2026-03-29T21:00:00.000000Z",
    "updated_at": "2026-03-29T21:00:00.000000Z",
    "activities": []
  }
}
```

### Validation rules

- `name`: required
- `email`: nullable, email, unique
- `phone`: nullable
- `source`: required, enum
- `stage`: required, enum
- `assigned_to`: nullable, must exist in users
- `notes`: nullable string
- `metadata`: nullable array

## 4. Get single lead

**GET** `/api/v1/leads/{lead}`

Loads:
- `assignedUser`
- `activities` ordered descending by `created_at`

### Response 200

```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+31612345678",
    "source": "manual",
    "stage": "contacted",
    "assigned_to": 1,
    "assigned_user": {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com"
    },
    "notes": "Interested in pricing",
    "metadata": {
      "tag": "vip"
    },
    "created_at": "2026-03-29T21:00:00.000000Z",
    "updated_at": "2026-03-29T21:15:00.000000Z",
    "activities": [
      {
        "id": 10,
        "lead_id": 1,
        "type": "stage_change",
        "description": "Stage changed from new to contacted",
        "performed_by": null,
        "created_at": "2026-03-29T21:15:00.000000Z"
      }
    ]
  }
}
```

## 5. Update lead

**PUT** `/api/v1/leads/{lead}`

### Request body

Same fields as the create request.

### Response 200

Returns `LeadResource` after updating the record and reloading relations.

## 6. Delete lead

**DELETE** `/api/v1/leads/{lead}`

### Response 200

```json
{
  "message": "Lead deleted successfully."
}
```

> This is a soft delete, not a permanent delete.

## 7. Update stage only

**PATCH** `/api/v1/leads/{lead}/stage`

### Request body

```json
{
  "stage": "converted"
}
```

### Response 200

Returns `LeadResource` after the update.

> When the update succeeds, `LeadObserver` automatically adds a `stage_change` activity.

## 8. Import leads from CSV

**POST** `/api/v1/leads/import`

### Request type

`multipart/form-data`

### Required field
- `file`

### Example response 200

```json
{
  "message": "CSV import completed.",
  "summary": {
    "total_rows": 10,
    "imported_count": 8,
    "skipped_count": 2,
    "errors": [
      {
        "row": 4,
        "message": "The email has already been taken."
      }
    ]
  }
}
```

### Expected CSV columns

The service reads the header directly, so the preferred format is:

```text
name,email,phone,source,stage,assigned_to,notes
```

## 9. Enrich lead

**POST** `/api/v1/leads/{lead}/enrich`

### Behavior
- requires the lead to have an `email`
- calls `LeadEnrichmentService`
- stores the result in `metadata.enrichment`
- adds an `api_sync` activity

### Response 200

```json
{
  "message": "Lead enriched successfully.",
  "data": {
    "email": "john@example.com",
    "is_valid": true,
    "deliverability": "DELIVERABLE",
    "quality_score": 91,
    "provider": "gmail"
  }
}
```

### Response 422 when the lead has no email

```json
{
  "message": "Lead must have an email to enrich."
}
```

## General API Errors

### Validation error

```json
{
  "message": "Validation failed.",
  "errors": {
    "email": [
      "The email field must be a valid email address."
    ]
  }
}
```

### Not found

```json
{
  "message": "Resource not found."
}
```

### Server error

```json
{
  "message": "Server error."
}
```
