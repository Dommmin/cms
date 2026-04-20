<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\States\Order\DraftState;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminDraftOrderService
{
    /**
     * Create a draft order on behalf of a customer.
     *
     * @param  array{
     *   customer_id: int,
     *   items: array<int, array{variant_id: int, quantity: int}>,
     *   billing_address_id?: int|null,
     *   shipping_address_id?: int|null,
     *   notes?: string|null,
     *   currency_code?: string,
     * }  $data
     */
    public function createDraft(array $data): Order
    {
        return DB::transaction(function () use ($data): Order {
            $items = $this->resolveItems($data['items']);

            $subtotal = collect($items)->sum(fn ($i): int => $i['unit_price'] * $i['quantity']);

            $order = Order::query()->create([
                'reference_number' => Order::generateReferenceNumber(),
                'customer_id' => $data['customer_id'],
                'status' => OrderStatusEnum::DRAFT->value,
                'subtotal' => $subtotal,
                'discount_amount' => 0,
                'shipping_cost' => 0,
                'tax_amount' => 0,
                'total' => $subtotal,
                'currency_code' => $data['currency_code'] ?? 'PLN',
                'exchange_rate' => 1,
                'notes' => $data['notes'] ?? null,
                'billing_address_id' => $data['billing_address_id'] ?? null,
                'shipping_address_id' => $data['shipping_address_id'] ?? null,
            ]);

            foreach ($items as $item) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'variant_id' => $item['variant_id'],
                    'product_name' => $item['product_name'],
                    'variant_name' => $item['variant_name'],
                    'sku' => $item['sku'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['unit_price'] * $item['quantity'],
                ]);
            }

            /** @var \App\Models\User|null $admin */
            $admin = Auth::user();
            activity('order')
                ->causedBy($admin)
                ->performedOn($order)
                ->withProperties(['customer_id' => $data['customer_id']])
                ->log('draft_created');

            return $order->load(['items', 'customer']);
        });
    }

    /**
     * Update items and recalculate totals for a draft order.
     *
     * @param  array<int, array{variant_id: int, quantity: int}>  $items
     */
    public function updateDraftItems(Order $order, array $items): Order
    {
        $this->assertDraft($order);

        return DB::transaction(function () use ($order, $items): Order {
            $order->items()->delete();

            $resolved = $this->resolveItems($items);
            $subtotal = collect($resolved)->sum(fn ($i): int => $i['unit_price'] * $i['quantity']);

            foreach ($resolved as $item) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'variant_id' => $item['variant_id'],
                    'product_name' => $item['product_name'],
                    'variant_name' => $item['variant_name'],
                    'sku' => $item['sku'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['unit_price'] * $item['quantity'],
                ]);
            }

            $order->update([
                'subtotal' => $subtotal,
                'total' => $subtotal + $order->shipping_cost + $order->tax_amount - $order->discount_amount,
            ]);

            return $order->load(['items', 'customer']);
        });
    }

    /**
     * Confirm draft → pending (send to customer / submit).
     */
    public function confirmDraft(Order $order): Order
    {
        $this->assertDraft($order);

        $order->changeStatus(OrderStatusEnum::PENDING, changedBy: 'admin', notes: 'Draft confirmed by admin');

        /** @var \App\Models\User|null $admin */
        $admin = Auth::user();
        activity('order')
            ->causedBy($admin)
            ->performedOn($order)
            ->log('draft_confirmed');

        return $order;
    }

    private function assertDraft(Order $order): void
    {
        abort_unless($order->status instanceof DraftState, 422, 'Order is not a draft.');
    }

    /**
     * @param  array<int, array{variant_id: int, quantity: int}>  $rawItems
     * @return array<int, array{variant_id: int, product_name: string, variant_name: string|null, sku: string, quantity: int, unit_price: int}>
     */
    private function resolveItems(array $rawItems): array
    {
        return collect($rawItems)->map(function (mixed $item): array {
            /** @var array{variant_id: int, quantity: int} $item */
            $variant = ProductVariant::with('product:id,name')->findOrFail($item['variant_id']);

            return [
                'variant_id' => $variant->id,
                'product_name' => $variant->product->name,
                'variant_name' => $variant->name,
                'sku' => $variant->sku,
                'quantity' => $item['quantity'],
                'unit_price' => $variant->price,
            ];
        })->all();
    }
}
