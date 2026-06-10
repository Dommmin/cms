<?php

declare(strict_types=1);

namespace App\Services\Webhooks;

use App\Interfaces\IncomingWebhookVerifierInterface;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class IncomingWebhookHandler
{
    /**
     * @param  Closure(array<string, mixed>): void  $onVerified
     * @param  array<string, mixed>  $successPayload
     */
    public function handle(
        Request $request,
        IncomingWebhookVerifierInterface $verifier,
        Closure $onVerified,
        array $successPayload = ['message' => 'OK'],
        int $successStatus = 200,
    ): JsonResponse {
        $result = $verifier->verify($request);

        if (! $result->valid) {
            return response()->json(['message' => $result->message], $result->status);
        }

        $onVerified($result->payload);

        return response()->json($successPayload, $successStatus);
    }
}
