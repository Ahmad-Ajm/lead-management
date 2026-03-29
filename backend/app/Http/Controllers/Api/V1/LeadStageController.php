<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateLeadStageRequest;
use App\Http\Resources\LeadResource;
use App\Models\Lead;

class LeadStageController extends Controller
{
    public function update(UpdateLeadStageRequest $request, Lead $lead)
    {
        $lead->update([
            'stage' => $request->validated()['stage'],
        ]);

        $lead = $lead->fresh()->load([
            'assignedUser',
            'activities' => function ($query) {
                $query->latest('created_at');
            }
        ]);

        return new LeadResource($lead);
    }
}