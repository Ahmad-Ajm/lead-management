<?php

namespace App\Services\Ingestion\Normalizers;

use App\Services\Ingestion\Contracts\LeadNormalizerInterface;
use Illuminate\Validation\ValidationException;

class FacebookLeadNormalizer implements LeadNormalizerInterface
{
    public function normalize(array $payload): array
    {
        $entry = $payload['entry'][0] ?? null;
        $change = $entry['changes'][0] ?? null;
        $value = $change['value'] ?? null;
        $fieldData = $value['field_data'] ?? [];

        if (! $value || ! is_array($fieldData)) {
            throw ValidationException::withMessages([
                'payload' => ['Invalid Facebook webhook payload.'],
            ]);
        }

        $mapped = [];

        foreach ($fieldData as $item) {
            $name = $item['name'] ?? null;
            $val = $item['values'][0] ?? null;

            if ($name) {
                $mapped[$name] = $val;
            }
        }

        return [
            'name' => $mapped['full_name'] ?? 'Unknown Facebook Lead',
            'email' => $mapped['email'] ?? null,
            'phone' => $mapped['phone_number'] ?? null,
            'source' => 'facebook',
            'stage' => 'new',
            'assigned_to' => null,
            'notes' => 'Imported from Facebook lead webhook',
            'metadata' => [
                'raw_payload' => $payload,
                'normalized' => [
                    'form_id' => $value['form_id'] ?? null,
                    'leadgen_id' => $value['leadgen_id'] ?? null,
                    'created_time' => $value['created_time'] ?? null,
                ],
            ],
        ];
    }
}