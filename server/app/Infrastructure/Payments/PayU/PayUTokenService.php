<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\PayU;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class PayUTokenService
{
    private const string CACHE_KEY = 'payu_access_token';

    private const int TTL_SECONDS = 39_600; // 11 hours (token valid 43199s)

    public function getToken(): string
    {
        return Cache::remember(self::CACHE_KEY, self::TTL_SECONDS, fn (): string => $this->fetchToken());
    }

    public function invalidate(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    private function fetchToken(): string
    {
        $response = Http::asForm()->post(
            config('services.payu.oauth_url').'/pl/standard/user/oauth/authorize',
            [
                'grant_type' => 'client_credentials',
                'client_id' => config('services.payu.client_id'),
                'client_secret' => config('services.payu.client_secret'),
            ]
        );

        if (! $response->successful()) {
            throw new RuntimeException('PayU OAuth failed: '.$response->body());
        }

        $token = $response->json('access_token');

        throw_if(! is_string($token) || $token === '', RuntimeException::class, 'PayU OAuth returned empty access_token');

        return $token;
    }
}
