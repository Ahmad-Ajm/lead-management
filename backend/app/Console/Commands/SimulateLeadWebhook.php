<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;

class SimulateLeadWebhook extends Command
{
    protected $signature = 'leads:simulate {source}';
    protected $description = 'Send a signed test webhook for facebook, whatsapp, or zapier';

    public function handle(): int
    {
        $source = $this->argument('source');

        try {
            $payload = $this->payloadFor($source);
            $url = $this->urlFor($source);
            $secret = config("webhooks.{$source}.secret");

            if (! $secret) {
                $this->error("Missing secret for source: {$source}");
                return self::FAILURE;
            }

            $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

            if ($json === false) {
                $this->error('Failed to encode webhook payload.');
                return self::FAILURE;
            }

            $signature = 'sha256=' . hash_hmac('sha256', $json, $secret);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-Webhook-Signature' => $signature,
            ])->withBody($json, 'application/json')->post($url);

            $this->info("Webhook sent to {$url}");
            $this->line("HTTP Status: {$response->status()}");
            $this->line("Response:");
            $this->line($response->body());

            return $response->successful() ? self::SUCCESS : self::FAILURE;
        } catch (InvalidArgumentException $e) {
            $this->error($e->getMessage());
            return self::FAILURE;
        } catch (\Throwable $e) {
            $this->error($e->getMessage());
            return self::FAILURE;
        }
    }

    protected function urlFor(string $source): string
    {
        return match ($source) {
            'facebook' => 'http://127.0.0.1:8000/api/v1/webhooks/facebook',
            'whatsapp' => 'http://127.0.0.1:8000/api/v1/webhooks/whatsapp',
            'zapier' => 'http://127.0.0.1:8000/api/v1/webhooks/zapier',
            default => throw new InvalidArgumentException("Unsupported source: {$source}"),
        };
    }

    protected function payloadFor(string $source): array
    {
        return match ($source) {
            'facebook' => [
                'entry' => [[
                    'changes' => [[
                        'field' => 'leadgen',
                        'value' => [
                            'form_id' => 'fb_form_12345',
                            'leadgen_id' => 'lead_98765',
                            'created_time' => 1740300000,
                            'field_data' => [
                                ['name' => 'full_name', 'values' => ['John Doe']],
                                ['name' => 'email', 'values' => ['john@example.com']],
                                ['name' => 'phone_number', 'values' => ['+31612345678']],
                            ],
                        ],
                    ]],
                ]],
            ],
            'whatsapp' => [
                'contact' => [
                    'name' => 'Ahmed',
                    'phone' => '+971501234567',
                    'wa_id' => '971501234567',
                ],
                'message' => "I'm interested in your services",
                'timestamp' => '2026-02-23T10:00:00Z',
            ],
            'zapier' => [
                'source' => 'website',
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'phone' => '+31687654321',
                'extra' => [
                    'campaign' => 'Spring 2026',
                    'ad_id' => 'tt_ad_555',
                ],
            ],
            default => throw new InvalidArgumentException("Unsupported source: {$source}"),
        };
    }
}