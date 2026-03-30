<?php

namespace App\Services\Ingestion\Normalizers;

use App\Services\Ingestion\Contracts\LeadNormalizerInterface;
use Illuminate\Validation\ValidationException;

class ZapierLeadNormalizer implements LeadNormalizerInterface
{
    public function normalize(array $payload): array
    {
        if (! isset($payload['name']) || ! isset($payload['source'])) {
            throw ValidationException::withMessages([
                'payload' => ['Invalid Zapier webhook payload.'],
            ]);
        }

        $allowedSources = ['facebook', 'whatsapp', 'website', 'manual'];

        $source = in_array($payload['source'], $allowedSources, true)
            ? $payload['source']
            : 'manual';

        return [
            'name' => $payload['name'],
            'email' => $payload['email'] ?? null,
            'phone' => $payload['phone'] ?? null,
            'source' => $source,
            'stage' => 'new',
            'assigned_to' => null,
            'notes' => 'Imported from Zapier webhook',
            'metadata' => [
                'raw_payload' => $payload,
                'normalized' => [
                    'extra' => $payload['extra'] ?? [],
                ],
            ],
        ];
    }
}