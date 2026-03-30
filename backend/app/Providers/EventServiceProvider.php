<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

use App\Events\LeadAssigned;
use App\Listeners\LogLeadAssignedNotification;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        LeadAssigned::class => [
            LogLeadAssignedNotification::class,
        ],
    ];

    public function boot(): void
    {
        //
    }
}