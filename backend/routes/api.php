<?php

use App\Http\Controllers\Api\V1\LeadController;
use App\Http\Controllers\Api\V1\LeadStageController;
use App\Http\Controllers\Api\V1\LeadStatsController;
use App\Http\Controllers\Api\V1\LeadImportController;
use App\Http\Controllers\Api\V1\LeadEnrichmentController;
use App\Http\Controllers\Api\V1\Webhooks\FacebookWebhookController;
use App\Http\Controllers\Api\V1\Webhooks\WhatsAppWebhookController;
use App\Http\Controllers\Api\V1\Webhooks\ZapierWebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/leads/stats', [LeadStatsController::class, 'index']);
    Route::post('/leads/import', LeadImportController::class);
    Route::patch('/leads/{lead}/stage', [LeadStageController::class, 'update']);
    Route::apiResource('leads', LeadController::class);
    Route::post('/leads/{lead}/enrich', LeadEnrichmentController::class);
    Route::post('/facebook', FacebookWebhookController::class);
    Route::post('/whatsapp', WhatsAppWebhookController::class);
    Route::post('/zapier', ZapierWebhookController::class);
});