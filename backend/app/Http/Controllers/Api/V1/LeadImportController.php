<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportLeadsRequest;
use App\Services\LeadImportService;
use Illuminate\Http\JsonResponse;

class LeadImportController extends Controller
{
    public function __invoke(ImportLeadsRequest $request, LeadImportService $leadImportService): JsonResponse
    {
        $result = $leadImportService->import($request->file('file'));

        return response()->json([
            'message' => 'CSV import completed.',
            'summary' => $result,
        ]);
    }
}