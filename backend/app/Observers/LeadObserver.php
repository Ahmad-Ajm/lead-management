<?php

namespace App\Observers;

use App\Models\Lead;
use App\Events\LeadAssigned;


class LeadObserver
{
    /**
     * Handle the Lead "created" event.
     */
    public function created(Lead $lead): void
    {
        //
    }

    /**
     * Handle the Lead "updated" event.
     */
    public function updated(Lead $lead): void
    {
        // stage change
        if ($lead->wasChanged('stage')) {
            $oldStage = $lead->getOriginal('stage');
            $newStage = $lead->stage;

            \App\Models\LeadActivity::create([
                'lead_id' => $lead->id,
                'type' => 'stage_change',
                'description' => "Stage changed from {$oldStage} to {$newStage}",
                'performed_by' => null,
                'created_at' => now(),
            ]);
        }

        // assignment change
        if ($lead->wasChanged('assigned_to') && $lead->assigned_to) {
            event(new LeadAssigned($lead));
        }
    }

    /**
     * Handle the Lead "deleted" event.
     */
    public function deleted(Lead $lead): void
    {
        //
    }

    /**
     * Handle the Lead "restored" event.
     */
    public function restored(Lead $lead): void
    {
        //
    }

    /**
     * Handle the Lead "force deleted" event.
     */
    public function forceDeleted(Lead $lead): void
    {
        //
    }
}
