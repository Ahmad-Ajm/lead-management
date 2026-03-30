<?php

namespace App\Services\Ingestion\Contracts;

interface LeadNormalizerInterface
{
    public function normalize(array $payload): array;
}