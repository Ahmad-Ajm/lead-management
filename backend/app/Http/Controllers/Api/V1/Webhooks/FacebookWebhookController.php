<?php

namespace App\Http\Controllers\Api\V1\Webhooks;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeadResource;
use App\Services\LeadIngestionService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FacebookWebhookController extends Controller
{
    public function __invoke(Request $request, LeadIngestionService $service)
    {
        try {
            $result = $service->ingest('facebook', $request->all());

            return (new LeadResource($result['lead']))
                ->additional(['message' => 'Facebook webhook processed successfully.'])
                ->response()
                ->setStatusCode($result['status'] === 'created' ? 201 : 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        }
    }
}