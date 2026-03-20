<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class TurnstileService
{
    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    /**
     * Verify a Cloudflare Turnstile token.
     *
     * Returns true if verification succeeds OR if no secret key is configured
     * (allows development without Cloudflare credentials).
     */
    public function verify(string $token, ?string $ip = null): bool
    {
        $secret = config('services.cloudflare.turnstile_secret');

        if (empty($secret)) {
            return true;
        }

        if (empty($token)) {
            return false;
        }

        try {
            $payload = ['secret' => $secret, 'response' => $token];

            if ($ip) {
                $payload['remoteip'] = $ip;
            }

            $response = Http::asForm()
                ->timeout(5)
                ->post(self::VERIFY_URL, $payload);

            return $response->successful() && $response->json('success') === true;
        } catch (Throwable $e) {
            Log::warning('Turnstile verification error', ['error' => $e->getMessage()]);

            return false;
        }
    }
}
