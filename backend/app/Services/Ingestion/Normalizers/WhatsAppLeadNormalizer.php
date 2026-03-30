<?php

namespace App\Services\Ingestion\Normalizers;

use App\Services\Ingestion\Contracts\LeadNormalizerInterface;
use Illuminate\Validation\ValidationException;

class WhatsAppLeadNormalizer implements LeadNormalizerInterface
{
    public function normalize(array $payload): array
    {
        $contact = $payload['contact'] ?? null;

        if (! $contact || ! is_array($contact)) {
            throw ValidationException::withMessages([
                'payload' => ['Invalid WhatsApp webhook payload.'],
            ]);
        }

        return [
            'name' => $contact['name'] ?? 'Unknown WhatsApp Contact',
            'email' => null,
            'phone' => $contact['phone'] ?? null,
            'source' => 'whatsapp',
            'stage' => 'new',
            'assigned_to' => null,
            'notes' => $payload['message'] ?? 'Imported from WhatsApp webhook',
            'metadata' => [
                'raw_payload' => $payload,
                'normalized' => [
                    'wa_id' => $contact['wa_id'] ?? null,
                    'timestamp' => $payload['timestamp'] ?? null,
                ],
            ],
        ];
    }
}