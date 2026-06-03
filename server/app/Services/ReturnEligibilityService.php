<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\ReturnRequest;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class ReturnEligibilityService
{
    private const int RETURN_WINDOW_DAYS = 30;

    private const int EXCHANGE_WINDOW_DAYS = 30;

    private const int COMPLAINT_WINDOW_DAYS = 730;

    /**
     * @return array{
     *     delivered_at: string|null,
     *     eligible_types: array<int, string>,
     *     blocked_reasons: array<int, string>,
     *     policy: array{return_window_days: int, exchange_window_days: int, complaint_window_days: int},
     *     items: array<int, array{
     *         order_item_id: int,
     *         ordered_quantity: int,
     *         already_requested_quantity: int,
     *         eligible_quantity: int,
     *         is_eligible: bool,
     *         reasons: array<int, string>
     *     }>
     * }
     */
    public function buildForOrder(Order $order): array
    {
        $order->loadMissing(['items', 'returns.items', 'statusHistory']);

        $deliveredAt = $this->resolveDeliveredAt($order);
        $blockedReasons = $this->resolveOrderBlockedReasons($order, $deliveredAt);

        $items = $order->items->map(
            fn (OrderItem $item): array => $this->buildItemEligibility($order, $item),
        )->values()->all();

        $hasEligibleItems = collect($items)->contains(
            fn (array $item): bool => $item['eligible_quantity'] > 0,
        );

        $eligibleTypes = [];
        if ($blockedReasons === [] && $hasEligibleItems) {
            $eligibleTypes = ['return', 'exchange', 'complaint'];
        } elseif ($deliveredAt instanceof CarbonImmutable && $hasEligibleItems) {
            if ($this->withinWindow($deliveredAt, self::COMPLAINT_WINDOW_DAYS)) {
                $eligibleTypes[] = 'complaint';
            }
        }

        return [
            'delivered_at' => $deliveredAt?->toIso8601String(),
            'eligible_types' => $eligibleTypes,
            'blocked_reasons' => $blockedReasons,
            'policy' => [
                'return_window_days' => self::RETURN_WINDOW_DAYS,
                'exchange_window_days' => self::EXCHANGE_WINDOW_DAYS,
                'complaint_window_days' => self::COMPLAINT_WINDOW_DAYS,
            ],
            'items' => $items,
        ];
    }

    public function assertOrderEligible(Order $order, string $type): void
    {
        $eligibility = $this->buildForOrder($order);

        if (! in_array($type, $eligibility['eligible_types'], true)) {
            throw ValidationException::withMessages([
                'type' => [$this->messageForType($type, $eligibility['blocked_reasons'])],
            ]);
        }
    }

    public function eligibleQuantity(Order $order, int $orderItemId): int
    {
        $eligibility = $this->buildForOrder($order);

        $item = collect($eligibility['items'])
            ->firstWhere('order_item_id', $orderItemId);

        return (int) ($item['eligible_quantity'] ?? 0);
    }

    private function resolveDeliveredAt(Order $order): ?CarbonImmutable
    {
        $historyEntry = $order->statusHistory
            ->first(fn (OrderStatusHistory $history): bool => (string) $history->new_status === OrderStatusEnum::DELIVERED->value);

        if ($historyEntry !== null) {
            return $historyEntry->changed_at;
        }

        if ((string) $order->status === OrderStatusEnum::DELIVERED->value) {
            return $order->updated_at instanceof CarbonImmutable
                ? $order->updated_at
                : CarbonImmutable::parse((string) $order->updated_at);
        }

        return null;
    }

    /**
     * @return array<int, string>
     */
    private function resolveOrderBlockedReasons(Order $order, ?CarbonImmutable $deliveredAt): array
    {
        $reasons = [];

        if (OrderStatusEnum::from((string) $order->status) !== OrderStatusEnum::DELIVERED) {
            $reasons[] = 'order_not_delivered';
        }

        if (! $deliveredAt instanceof CarbonImmutable) {
            $reasons[] = 'delivery_date_unknown';

            return array_values(array_unique($reasons));
        }

        if (! $this->withinWindow($deliveredAt, self::RETURN_WINDOW_DAYS)) {
            $reasons[] = 'return_window_expired';
        }

        return array_values(array_unique($reasons));
    }

    /**
     * @return array{
     *     order_item_id: int,
     *     ordered_quantity: int,
     *     already_requested_quantity: int,
     *     eligible_quantity: int,
     *     is_eligible: bool,
     *     reasons: array<int, string>
     * }
     */
    private function buildItemEligibility(Order $order, OrderItem $item): array
    {
        $alreadyRequestedQuantity = $this->requestedQuantityForItem(
            $order->returns,
            $item->id,
        );
        $eligibleQuantity = max(0, (int) $item->quantity - $alreadyRequestedQuantity);
        $reasons = [];

        if ($eligibleQuantity < 1) {
            $reasons[] = 'quantity_already_requested';
        }

        return [
            'order_item_id' => $item->id,
            'ordered_quantity' => (int) $item->quantity,
            'already_requested_quantity' => $alreadyRequestedQuantity,
            'eligible_quantity' => $eligibleQuantity,
            'is_eligible' => $eligibleQuantity > 0,
            'reasons' => $reasons,
        ];
    }

    /**
     * @param  Collection<int, ReturnRequest>  $returns
     */
    private function requestedQuantityForItem(Collection $returns, int $orderItemId): int
    {
        return (int) $returns
            ->where('status', '!=', 'rejected')
            ->flatMap(fn (ReturnRequest $returnRequest) => $returnRequest->items)
            ->where('order_item_id', $orderItemId)
            ->sum('quantity');
    }

    private function withinWindow(CarbonImmutable $deliveredAt, int $days): bool
    {
        return $deliveredAt->addDays($days)->endOfDay()->greaterThanOrEqualTo(now());
    }

    /**
     * @param  array<int, string>  $blockedReasons
     */
    private function messageForType(string $type, array $blockedReasons): string
    {
        if ($type === 'complaint') {
            return 'Complaint request is not eligible for this order.';
        }

        if (in_array('return_window_expired', $blockedReasons, true)) {
            return 'Return window has expired for this order.';
        }

        return 'This order is not eligible for a return request.';
    }
}
