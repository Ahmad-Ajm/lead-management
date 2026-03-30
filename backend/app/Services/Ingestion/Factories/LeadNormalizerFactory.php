<?php

namespace App\Services\Ingestion\Factories;

use App\Services\Ingestion\Contracts\LeadNormalizerInterface;
use App\Services\Ingestion\Normalizers\FacebookLeadNormalizer;
use App\Services\Ingestion\Normalizers\WhatsAppLeadNormalizer;
use App\Services\Ingestion\Normalizers\ZapierLeadNormalizer;
use InvalidArgumentException;

class LeadNormalizerFactory
{
    public function make(string $source): LeadNormalizerInterface
    {
        return match ($source) {
            'facebook' => new FacebookLeadNormalizer(),
            'whatsapp' => new WhatsAppLeadNormalizer(),
            'zapier' => new ZapierLeadNormalizer(),
            default => throw new InvalidArgumentException("Unsupported webhook source: {$source}"),
        };
    }
}