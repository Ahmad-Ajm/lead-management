<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $allowedSorts = ['id', 'name', 'source', 'stage', 'created_at'];
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');

        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        if (! in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }

        $leads = Lead::query()
            ->with('assignedUser')
            ->search($request->get('search'))
            ->ofStage($request->get('stage'))
            ->fromSource($request->get('source'))
            ->betweenDates(
                $request->get('date_from'),
                $request->get('date_to')
            )
            ->orderBy($sortBy, $sortDir)
            ->paginate(20)
            ->withQueryString();

        return LeadResource::collection($leads);
    }   

    public function store(StoreLeadRequest $request)
    {
        $lead = Lead::create($request->validated());

        $lead->load('assignedUser');

        return (new LeadResource($lead))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Lead $lead)
    {
        $lead->load([
            'assignedUser',
            'activities' => function ($query) {
                $query->latest('created_at');
            }
        ]);

        return new LeadResource($lead);
    }

    public function update(UpdateLeadRequest $request, Lead $lead)
    {
        $lead->update($request->validated());

        $lead = $lead->fresh()->load([
            'assignedUser',
            'activities' => function ($query) {
                $query->latest('created_at');
            }
        ]);

        return new LeadResource($lead);
    }
    
    
    public function destroy(Lead $lead): JsonResponse
    {
        $lead->delete();

        return response()->json([
            'message' => 'Lead deleted successfully.',
        ]);
    }
}