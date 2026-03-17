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
            'items' => $wishlist->items->map(fn (WishlistItem $item) => [
                'id' => $item->id,
                'variant_id' => $item->product_variant_id,
                'notes' => $item->notes,
                'product' => $item->relationLoaded('variant') && $item->variant?->relationLoaded('product') && $item->variant->product ? [
                    'id' => $item->variant->product->id,
                    'name' => $item->variant->product->name,
                    'slug' => $item->variant->product->slug,
                    'thumbnail' => null,
                ] : null,
                'variant' => $item->relationLoaded('variant') && $item->variant ? [
                    'id' => $item->variant->id,
                    'sku' => $item->variant->sku,
                    'price' => $item->variant->price,
                    'in_stock' => $item->variant->isInStock(),
                    'attributes' => $item->variant->attributes ?? [],
                ] : null,
            ]),
        ];
    }
}
