<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatusEnum;
use App\Http\Controllers\Api\ApiController;
use App\Models\Order;
use App\Services\Webhooks\BaseLinkerIncomingWebhookVerifier;
use App\Services\Webhooks\IncomingWebhookHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BaseLinkerWebhookController extends ApiController
{
    /**
     * Handle incoming webhooks from BaseLinker (e.g., order status change).
     * Needs to verify token for security.
     */
    public function handle(
        Request $request,
        IncomingWebhookHandler $handler,
        BaseLinkerIncomingWebhookVerifier $verifier,
    ): JsonResponse {
        return $handler->handle(
            $request,
            $verifier,
            function (array $payload): void {
                $action = $payload['action'] ?? null;

                if ($action !== 'status') {
                    return;
                }

                $blOrderId = $payload['order_id'] ?? null;
                $statusId = (int) ($payload['status_id'] ?? 0);

                if (! is_string($blOrderId) || $blOrderId === '') {
                    return;
                }

                $order = Order::query()->where('baselinker_order_id', $blOrderId)->first();

                if (! $order) {
                    Log::warning('BaseLinker webhook: Order not found locally', ['baselinker_id' => $blOrderId]);

                    return;
                }

                /** @var array<int, string> $statusMap */
                $statusMap = config('services.baselinker.status_map', []);

                if (isset($statusMap[$statusId])) {
                    $newStatus = OrderStatusEnum::tryFrom($statusMap[$statusId]);
                    if ($newStatus && $order->status->getValue() !== $newStatus->value) {
                        $order->changeStatus($newStatus, 'system', 'Status changed to BaseLinker ID '.$statusId);
                    }
                }
            },
            [],
        );
    }
}
