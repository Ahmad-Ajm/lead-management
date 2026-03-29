<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;

class LeadStatsController extends Controller
{
    public function index(): JsonResponse
    {
        // العدد الكلي
        $total = Lead::count();

        // العدد حسب stage
        $byStage = Lead::query()
            ->selectRaw('stage, COUNT(*) as count')
            ->groupBy('stage')
            ->pluck('count', 'stage');

        // عدد leads حسب source
        $bySource = Lead::query()
            ->selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->pluck('count', 'source');

        return response()->json([
            'total' => $total,
            'by_stage' => $byStage,
            'by_source' => $bySource,
        ]);
    }
}