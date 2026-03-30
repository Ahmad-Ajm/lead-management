<?php

namespace App\Listeners;

use App\Events\LeadAssigned;
use App\Models\LeadActivity;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class LogLeadAssignedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(LeadAssigned $event): void
    {
        $lead = $event->lead;

        Log::info('Lead assigned event handled.', [
            'lead_id' => $lead->id,
            'assigned_to' => $lead->assigned_to,
        ]);

        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'api_sync',
            'description' => "Lead assigned to user ID {$lead->assigned_to}",
            'performed_by' => null,
            'created_at' => now(),
        ]);
    }
}