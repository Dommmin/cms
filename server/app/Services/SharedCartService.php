<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SharedCart;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Stringable;

class SharedCartService
{
    public const DEFAULT_TTL_DAYS = 30;

    public function createFromCart(Cart $cart, ?string $locale = null, ?int $expiresInDays = null): SharedCart
    {
        $cart->loadMissing('customer', 'items.variant.product');

        $snapshotItems = $cart->items
            ->map(function (CartItem $item): array {
                $variant = $item->variant;
                $product = $variant->product;

                return [
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'shared_unit_price' => $item->unitPrice(),
                    'product_name' => $product ? $this->stringValue($product->name) : null,
                    'product_slug' => $product?->slug,
                    'product_thumbnail' => null,
                    'variant_name' => $this->stringValue($variant->name),
                    'sku' => $variant->sku,
                ];
            })
            ->values()
            ->all();

        $days = $expiresInDays ?? self::DEFAULT_TTL_DAYS;

        return SharedCart::query()->create([
            'source_cart_id' => $cart->id,
            'customer_id' => $cart->customer_id,
            'public_token' => Str::random(64),
            'currency_code' => 'PLN',
            'locale' => $locale,
            'discount_code' => $cart->discount_code,
            'snapshot' => [
                'items' => $snapshotItems,
                'item_count' => $cart->itemCount(),
                'subtotal' => $cart->subtotal(),
            ],
            'expires_at' => now()->addDays($days),
            'is_active' => true,
        ]);
    }

    public function findByToken(string $token): ?SharedCart
    {
        return SharedCart::query()->where('public_token', $token)->first();
    }

    /**
     * @return array<string, mixed>
     */
    public function buildPreview(SharedCart $sharedCart): array
    {
        $snapshotItems = $this->snapshotItems($sharedCart);
        $variants = $this->variantsForSnapshot($snapshotItems);

        $items = [];
        $sharedSubtotal = 0;
        $estimatedSubtotal = 0;
        $availableItems = 0;
        $partialItems = 0;
        $unavailableItems = 0;

        foreach ($snapshotItems as $snapshotItem) {
            $requestedQuantity = (int) ($snapshotItem['quantity'] ?? 0);
            $sharedUnitPrice = (int) ($snapshotItem['shared_unit_price'] ?? 0);
            $sharedSubtotal += $sharedUnitPrice * $requestedQuantity;

            $availability = $this->availabilityForSnapshotItem($snapshotItem, $variants);

            if ($availability['status'] === 'available') {
                $availableItems++;
            } elseif ($availability['status'] === 'partial') {
                $partialItems++;
            } else {
                $unavailableItems++;
            }

            $estimatedSubtotal += $availability['current_unit_price'] * $availability['import_quantity'];

            $items[] = [
                'variant_id' => (int) ($snapshotItem['variant_id'] ?? 0),
                'requested_quantity' => $requestedQuantity,
                'import_quantity' => $availability['import_quantity'],
                'available_quantity' => $availability['available_quantity'],
                'status' => $availability['status'],
                'status_message' => $availability['status_message'],
                'shared_unit_price' => $sharedUnitPrice,
                'current_unit_price' => $availability['current_unit_price'],
                'product' => [
                    'name' => $availability['product_name'] ?? $snapshotItem['product_name'] ?? 'Unavailable product',
                    'slug' => $availability['product_slug'] ?? $snapshotItem['product_slug'],
                    'thumbnail' => $snapshotItem['product_thumbnail'],
                ],
                'variant' => [
                    'name' => $availability['variant_name'] ?? $snapshotItem['variant_name'],
                    'sku' => $availability['sku'] ?? $snapshotItem['sku'],
                ],
            ];
        }

        return [
            'token' => $sharedCart->public_token,
            'currency' => $sharedCart->currency_code,
            'locale' => $sharedCart->locale,
            'discount_code' => $sharedCart->discount_code,
            'expires_at' => $sharedCart->expires_at?->toIso8601String(),
            'is_active' => $sharedCart->is_active,
            'items_count' => count($items),
            'shared_subtotal' => $sharedSubtotal,
            'estimated_subtotal' => $estimatedSubtotal,
            'available_items' => $availableItems,
            'partial_items' => $partialItems,
            'unavailable_items' => $unavailableItems,
            'items' => $items,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function importIntoCart(SharedCart $sharedCart, Cart $targetCart, string $mode = 'merge'): array
    {
        $snapshotItems = $this->snapshotItems($sharedCart);
        $variants = $this->variantsForSnapshot($snapshotItems);

        $targetCart->load('items.variant.product');
        $targetCart->update(['discount_code' => null]);

        if ($mode === 'replace') {
            $targetCart->items()->delete();
            $targetCart->unsetRelation('items');
            $targetCart->setRelation('items', new EloquentCollection());
        }

        /** @var Collection<int, CartItem> $currentItems */
        $currentItems = $targetCart->items;

        $addedItems = 0;
        $mergedItems = 0;
        $skippedItems = 0;
        $partialItems = 0;
        $importedQuantity = 0;

        foreach ($snapshotItems as $snapshotItem) {
            $availability = $this->availabilityForSnapshotItem($snapshotItem, $variants);
            $variantId = (int) ($snapshotItem['variant_id'] ?? 0);
            $requestedQuantity = (int) ($snapshotItem['quantity'] ?? 0);
            $importQuantity = $availability['import_quantity'];

            if ($importQuantity <= 0) {
                $skippedItems++;

                continue;
            }

            if ($importQuantity < $requestedQuantity) {
                $partialItems++;
            }

            $existing = $mode === 'merge'
                ? $currentItems->firstWhere('variant_id', $variantId)
                : null;

            if ($existing instanceof CartItem) {
                $existingQuantity = $existing->quantity;
                $newQuantity = min(
                    $availability['available_quantity'],
                    $existingQuantity + $importQuantity,
                );

                if ($newQuantity <= $existingQuantity) {
                    $skippedItems++;

                    continue;
                }

                if (($newQuantity - $existingQuantity) < $importQuantity) {
                    $partialItems++;
                }

                $existing->update(['quantity' => $newQuantity]);
                $mergedItems++;
                $importedQuantity += $newQuantity - $existingQuantity;

                continue;
            }

            /** @var CartItem $createdItem */
            $createdItem = $targetCart->items()->create([
                'variant_id' => $variantId,
                'quantity' => $importQuantity,
            ]);

            $currentItems->push($createdItem);
            $addedItems++;
            $importedQuantity += $importQuantity;
        }

        $sharedCart->increment('uses_count');
        $sharedCart->update(['last_used_at' => now()]);

        $targetCart->refresh()->load('items.variant.product');

        return [
            'mode' => $mode,
            'added_items' => $addedItems,
            'merged_items' => $mergedItems,
            'skipped_items' => $skippedItems,
            'partial_items' => $partialItems,
            'imported_quantity' => $importedQuantity,
            'discount_cleared' => true,
            'cart' => $targetCart,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $snapshotItems
     * @return Collection<int, ProductVariant>
     */
    private function variantsForSnapshot(array $snapshotItems): Collection
    {
        $variantIds = collect($snapshotItems)
            ->pluck('variant_id')
            ->filter(fn (mixed $variantId): bool => is_numeric($variantId))
            ->map(fn (mixed $variantId): int => (int) $variantId)
            ->values();

        return ProductVariant::query()
            ->with('product')
            ->whereIn('id', $variantIds)
            ->get()
            ->keyBy('id');
    }

    /**
     * @param  array<string, mixed>  $snapshotItem
     * @param  Collection<int, ProductVariant>  $variants
     * @return array<string, int|string|null>
     */
    private function availabilityForSnapshotItem(array $snapshotItem, Collection $variants): array
    {
        $variantId = (int) ($snapshotItem['variant_id'] ?? 0);
        $requestedQuantity = max(0, (int) ($snapshotItem['quantity'] ?? 0));
        /** @var ProductVariant|null $variant */
        $variant = $variants->get($variantId);

        if (! $variant instanceof ProductVariant) {
            return [
                'available_quantity' => 0,
                'import_quantity' => 0,
                'current_unit_price' => 0,
                'status' => 'unavailable',
                'status_message' => 'This variant no longer exists.',
                'product_name' => null,
                'product_slug' => null,
                'variant_name' => null,
                'sku' => null,
            ];
        }

        $product = $variant->product;

        if (! $product instanceof Product || ! $product->is_active || ! $product->is_saleable || ! $variant->is_active) {
            return [
                'available_quantity' => 0,
                'import_quantity' => 0,
                'current_unit_price' => 0,
                'status' => 'unavailable',
                'status_message' => 'This item is no longer available.',
                'product_name' => $product ? $this->stringValue($product->name) : null,
                'product_slug' => $product?->slug,
                'variant_name' => $this->stringValue($variant->name),
                'sku' => $variant->sku,
            ];
        }

        $availableQuantity = max(0, $variant->stock_quantity);
        $importQuantity = min($requestedQuantity, $availableQuantity);
        $currentUnitPrice = $variant->getPriceForQuantity(max(1, $importQuantity));

        if ($importQuantity <= 0) {
            return [
                'available_quantity' => $availableQuantity,
                'import_quantity' => 0,
                'current_unit_price' => $currentUnitPrice,
                'status' => 'unavailable',
                'status_message' => 'Currently out of stock.',
                'product_name' => $this->stringValue($product->name),
                'product_slug' => $product->slug,
                'variant_name' => $this->stringValue($variant->name),
                'sku' => $variant->sku,
            ];
        }

        if ($importQuantity < $requestedQuantity) {
            return [
                'available_quantity' => $availableQuantity,
                'import_quantity' => $importQuantity,
                'current_unit_price' => $currentUnitPrice,
                'status' => 'partial',
                'status_message' => sprintf('Only %d unit(s) are available right now.', $importQuantity),
                'product_name' => $this->stringValue($product->name),
                'product_slug' => $product->slug,
                'variant_name' => $this->stringValue($variant->name),
                'sku' => $variant->sku,
            ];
        }

        return [
            'available_quantity' => $availableQuantity,
            'import_quantity' => $importQuantity,
            'current_unit_price' => $currentUnitPrice,
            'status' => 'available',
            'status_message' => 'Ready to import.',
            'product_name' => $this->stringValue($product->name),
            'product_slug' => $product->slug,
            'variant_name' => $this->stringValue($variant->name),
            'sku' => $variant->sku,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function snapshotItems(SharedCart $sharedCart): array
    {
        $snapshot = $sharedCart->snapshot;
        $items = $snapshot['items'] ?? [];

        return is_array($items) ? $items : [];
    }

    private function stringValue(mixed $value): ?string
    {
        if (is_string($value)) {
            return $value;
        }

        if (is_array($value)) {
            $firstValue = collect($value)
                ->first(fn (mixed $item): bool => is_string($item) && $item !== '');

            return is_string($firstValue) ? $firstValue : null;
        }

        if ($value instanceof Stringable) {
            return (string) $value;
        }

        return null;
    }
}
