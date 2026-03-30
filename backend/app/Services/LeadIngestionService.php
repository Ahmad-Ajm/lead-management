<?php

namespace App\Services;

use App\Models\Lead;
use App\Services\Ingestion\Factories\LeadNormalizerFactory;
use Carbon\Carbon;

class LeadIngestionService
{
    public function __construct(
        protected LeadNormalizerFactory $factory
    ) {
    }

    public function ingest(string $source, array $payload): array
    {
        $normalizer = $this->factory->make($source);
        $normalized = $normalizer->normalize($payload);

        $lead = $this->findDuplicateLead($normalized);

        if ($lead) {
            $existingMetadata = $lead->metadata ?? [];
            $incomingMetadata = $normalized['metadata'] ?? [];

            $lead->update([
                'name' => $normalized['name'],
                'email' => $normalized['email'],
                'phone' => $normalized['phone'],
                'notes' => $normalized['notes'],
                'metadata' => array_merge($existingMetadata, $incomingMetadata),
            ]);

            $lead->activities()->create([
                'type' => 'api_sync',
                'description' => "Lead updated from {$source} webhook",
                'performed_by' => null,
                'created_at' => now(),
            ]);

            return [
                'status' => 'updated',
                'lead' => $lead->fresh(['assignedUser', 'activities']),
            ];
        }

        $lead = Lead::create($normalized);

        $lead->activities()->create([
            'type' => 'api_sync',
            'description' => "Lead created from {$source} webhook",
            'performed_by' => null,
            'created_at' => now(),
        ]);

        return [
            'status' => 'created',
            'lead' => $lead->fresh(['assignedUser', 'activities']),
        ];
    }

    protected function findDuplicateLead(array $normalized): ?Lead
    {
        $since = Carbon::now()->subDay();

        return Lead::query()
            ->where('source', $normalized['source'])
            ->where('created_at', '>=', $since)
            ->where(function ($query) use ($normalized) {
                $hasCondition = false;
            
                if (! empty($normalized['email'])) {
                    $query->where('email', $normalized['email']);
                    $hasCondition = true;
                }
            
                if (! empty($normalized['phone'])) {
                    if ($hasCondition) {
                        $query->orWhere('phone', $normalized['phone']);
                    } else {
                        $query->where('phone', $normalized['phone']);
                        $hasCondition = true;
                    }
                }
            
                if (! $hasCondition) {
                    $query->whereRaw('1 = 0');
                }
            })
            ->latest('id')
            ->first();
    }
}