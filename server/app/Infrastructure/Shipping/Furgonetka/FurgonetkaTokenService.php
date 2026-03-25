<?php

declare(strict_types=1);

namespace App\Infrastructure\Shipping\Furgonetka;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class FurgonetkaTokenService
{
    private const string CACHE_KEY = 'furgonetka_access_token';

    private const int TTL_SECONDS = 3_600; // 1 hour

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
            config('services.furgonetka.oauth_url').'/oauth/token',
            [
                'grant_type' => 'client_credentials',
                'client_id' => config('services.furgonetka.client_id'),
                'client_secret' => config('services.furgonetka.client_secret'),
                'scope' => 'api',
            ]
        );

        if (! $response->successful()) {
            throw new RuntimeException('Furgonetka OAuth failed: '.$response->body());
        }

        $token = $response->json('access_token');

        throw_if(! is_string($token) || $token === '', RuntimeException::class, 'Furgonetka OAuth returned empty access_token');

        return $token;
    }
}
