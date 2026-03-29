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
        // تحديث المرحلة فقط
        $lead->update([
            'stage' => $request->validated()['stage'],
        ]);

        // تحميل activities 
        $lead = $lead->fresh()->load('activities');

        return new LeadResource($lead);
    }
}