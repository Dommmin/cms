<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin CartItem
 */
class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var CartItem $item */
        $item = $this->resource;
        $variant = $item->variant;
        $product = $variant?->product;

        return [
            'id' => $item->id,
            'variant_id' => $item->variant_id,
            'quantity' => $item->quantity,
            'unit_price' => $variant?->price ?? 0,
            'subtotal' => $item->subtotal(),
            'variant' => $variant ? [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'price' => $variant->price,
                'compare_at_price' => $variant->compare_at_price,
                'stock_quantity' => $variant->stock_quantity,
                'is_available' => $variant->isInStock(),
                'attributes' => [],
            ] : null,
            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'thumbnail' => null,
            ] : null,
        ];
    }
}
