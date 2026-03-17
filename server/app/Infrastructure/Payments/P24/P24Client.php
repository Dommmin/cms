<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\P24;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class P24Client
{
    private function baseUrl(): string
    {
        return (string) config('services.p24.base_url');
    }

    private function client(): \Illuminate\Http\Client\PendingRequest
    {
        return Http::withBasicAuth(
            (string) config('services.p24.pos_id'),
            (string) config('services.p24.api_key'),
        )->acceptJson();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function registerTransaction(array $data): array
    {
        $response = $this->client()->post($this->baseUrl().'/api/v1/transaction/register', $data);

        if (! $response->successful()) {
            throw new RuntimeException('P24 register failed: '.$response->body());
        }

        return $response->json() ?? [];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function verifyTransaction(array $data): array
    {
        $response = $this->client()->put($this->baseUrl().'/api/v1/transaction/verify', $data);

        if (! $response->successful()) {
            throw new RuntimeException('P24 verify failed: '.$response->body());
        }

        return $response->json() ?? [];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function createRefund(array $data): array
    {
        $response = $this->client()->post($this->baseUrl().'/api/v1/transaction/refund', $data);

        if (! $response->successful()) {
            throw new RuntimeException('P24 refund failed: '.$response->body());
        }

        return $response->json() ?? [];
    }
}
