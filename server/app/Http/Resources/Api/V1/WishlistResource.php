<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Wishlist;
use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Wishlist
 */
class WishlistResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Wishlist $wishlist */
        $wishlist = $this->resource;

        return [
            'id' => $wishlist->id,
            'name' => $wishlist->name,
            'token' => $wishlist->session_token,
            'items_count' => $wishlist->items->count(),
            'items' => $wishlist->items->map(fn (WishlistItem $item): array => [
                'id' => $item->id,
                'variant_id' => $item->product_variant_id,
                'notes' => $item->notes,
                'product' => ($variant = $item->variant)->relationLoaded('product') && $variant->product ? [
                    'id' => $variant->product->id,
                    'name' => $variant->product->name,
                    'slug' => $variant->product->slug,
                    'thumbnail' => null,
                ] : null,
                'variant' => (function () use ($variant): array {
                    $isOnSale = $variant->compare_at_price && $variant->compare_at_price > $variant->price;

                    return [
                        'id' => $variant->id,
                        'sku' => $variant->sku,
                        'price' => $variant->price,
                        'compare_at_price' => $isOnSale ? $variant->compare_at_price : null,
                        'omnibus_price' => $isOnSale ? $variant->lowestPriceInLast30Days() : null,
                        'is_on_sale' => $isOnSale,
                        'in_stock' => $variant->isInStock(),
                        'attributes' => $variant->relationLoaded('attributeValues') ? $variant->attributeValues->mapWithKeys(fn ($av): array => [($av->attribute->name ?? '') => ($av->attributeValue->value ?? '')])->all() : [],
                    ];
                })(),
            ]),
        ];
    }
}
