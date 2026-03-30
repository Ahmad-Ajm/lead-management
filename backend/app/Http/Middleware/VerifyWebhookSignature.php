<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSignature
{
    public function handle(Request $request, Closure $next, string $source): Response
    {
        $secret = config("webhooks.{$source}.secret");

        if (! $secret) {
            return response()->json([
                'message' => 'Webhook secret is not configured.',
            ], 500);
        }

        $signatureHeader = $request->header('X-Webhook-Signature');

        if (! $signatureHeader) {
            return response()->json([
                'message' => 'Missing webhook signature.',
            ], 401);
        }

        $rawBody = $request->getContent();
        $expectedHash = hash_hmac('sha256', $rawBody, $secret);
        $expectedSignature = 'sha256=' . $expectedHash;

        if (! hash_equals($expectedSignature, $signatureHeader)) {
            return response()->json([
                'message' => 'Invalid webhook signature.',
            ], 401);
        }

        return $next($request);
    }
}