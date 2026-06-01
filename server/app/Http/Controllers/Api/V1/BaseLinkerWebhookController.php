<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatusEnum;
use App\Http\Controllers\Api\ApiController;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BaseLinkerWebhookController extends ApiController
{
    /**
     * Handle incoming webhooks from BaseLinker (e.g., order status change).
     * Needs to verify token for security.
     */
    public function handle(Request $request): JsonResponse
    {
        $password = $request->header('X-BL-Pass', $request->input('bl_pass'));
        $expectedToken = config('services.baselinker.webhook_token');

        if (! $expectedToken || $password !== $expectedToken) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $action = $request->input('action');
        if ($action !== 'status') {
            return $this->ok([]);
        }

        $blOrderId = $request->input('order_id');
        $statusId = (int) $request->input('status_id');

        $order = Order::query()->where('baselinker_order_id', $blOrderId)->first();

        if (! $order) {
            Log::warning('BaseLinker webhook: Order not found locally', ['baselinker_id' => $blOrderId]);

            return $this->ok([]);
        }

        // Map BaseLinker status IDs to local statuses.
        // In a real scenario, these mappings should be configurable via settings.
        // For demonstration, we just log it or apply some hardcoded mappings.
        $statusMap = config('services.baselinker.status_map', []);

        if (isset($statusMap[$statusId])) {
            $newStatus = OrderStatusEnum::tryFrom($statusMap[$statusId]);
            if ($newStatus && $order->status->getValue() !== $newStatus->value) {
                $order->changeStatus($newStatus, 'baselinker', 'Status changed to BaseLinker ID '.$statusId);
            }
        }

        return $this->ok([]);
    }
}
