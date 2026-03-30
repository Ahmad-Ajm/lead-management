<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Services\LeadEnrichmentService;
use Illuminate\Http\JsonResponse;

class LeadEnrichmentController extends Controller
{
    public function __invoke(Lead $lead, LeadEnrichmentService $service): JsonResponse
    {
        if (!$lead->email) {
            return response()->json([
                'message' => 'Lead must have an email to enrich.',
            ], 422);
        }

        $result = $service->enrich($lead->email);

        // حفظ داخل metadata
        $metadata = $lead->metadata ?? [];
        $metadata['enrichment'] = $result;

        $lead->update([
            'metadata' => $metadata,
        ]);

        // تسجيل activity
        $lead->activities()->create([
            'type' => 'api_sync',
            'description' => 'Lead enriched via external API',
            'performed_by' => null,
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Lead enriched successfully.',
            'data' => $result,
        ]);
    }
}