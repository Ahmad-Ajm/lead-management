<?php

use App\Http\Controllers\Api\V1\LeadController;
use App\Http\Controllers\Api\V1\LeadStageController;
use App\Http\Controllers\Api\V1\LeadStatsController;
use App\Http\Controllers\Api\V1\LeadImportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/leads/stats', [LeadStatsController::class, 'index']);
    Route::post('/leads/import', LeadImportController::class);
    Route::patch('/leads/{lead}/stage', [LeadStageController::class, 'update']);
    Route::apiResource('leads', LeadController::class);
});