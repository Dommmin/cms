<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\PayU;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class PayUClient
{
    public function __construct(
        private readonly PayUTokenService $tokenService
    ) {}

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function createOrder(array $data): array
    {
        return $this->request('POST', '/api/v2_1/orders', $data);
    }

    /**
     * @return array<string, mixed>
     */
    public function getOrder(string $orderId): array
    {
        return $this->request('GET', '/api/v2_1/orders/'.$orderId);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function createRefund(string $orderId, array $data): array
    {
        return $this->request('POST', sprintf('/api/v2_1/orders/%s/refunds', $orderId), $data);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function request(string $method, string $path, array $data = []): array
    {
        $response = $this->sendRequest($method, $path, $data);

        // On 401 — refresh token and retry once
        if ($response->status() === 401) {
            $this->tokenService->invalidate();
            $response = $this->sendRequest($method, $path, $data);
        }

        // PayU returns 302 for order creation (follow is disabled to capture orderId + redirect)
        if (! $response->successful() && $response->status() !== 302) {
            throw new RuntimeException(sprintf('PayU API error [%s]: ', $response->status()).$response->body());
        }

        return $response->json() ?? [];
    }

    private function sendRequest(string $method, string $path, array $data): Response
    {
        $baseUrl = config('services.payu.base_url');
        $token = $this->tokenService->getToken();

        $client = Http::withToken($token)
            ->withoutRedirecting()
            ->acceptJson();

        return match (mb_strtoupper($method)) {
            'POST' => $client->post($baseUrl.$path, $data),
            'GET' => $client->get($baseUrl.$path),
            default => throw new RuntimeException('Unsupported HTTP method: '.$method),
        };
    }
}
