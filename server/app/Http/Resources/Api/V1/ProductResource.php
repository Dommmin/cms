<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Data\ProductData;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $product = $this->resource;
        if ($product instanceof Product) {
            if (! $product->getAttributeValue('price_min') && ! $product->getAttributeValue('price_max')) {
                $range = $product->priceRange();
                $product->setAttribute('price_min', $range['min']);
                $product->setAttribute('price_max', $range['max']);
            }

            $isOnSale = $product->relationLoaded('activeVariants')
                ? $product->activeVariants->some(fn ($v): bool => $v->compare_at_price && $v->compare_at_price > $v->price)
                : false;
            $product->setAttribute('is_on_sale', $isOnSale);

            $maxDiscount = $product->relationLoaded('activeVariants')
                ? $product->activeVariants->map(fn ($v): ?int => $v->compare_at_price && $v->price
                    ? (int) round((1 - $v->price / $v->compare_at_price) * 100)
                    : null
                )->filter()->max()
                : null;
            $product->setAttribute('discount_percentage', $maxDiscount ?: null);

            $data = ProductData::from($product)->toArray();

            if ($product->relationLoaded('activeVariants')) {
                $variants = $product->activeVariants;
                $data['variants'] = $variants->map(fn ($v): array => [
                    'id' => $v->id,
                    'price' => $v->price,
                    'compare_at_price' => $v->compare_at_price,
                ])->values()->all();

                $cheapestOnSale = $variants
                    ->filter(fn ($v): bool => $v->compare_at_price && $v->compare_at_price > $v->price)
                    ->sortBy('price')
                    ->first();
                $data['compare_at_price_min'] = $cheapestOnSale?->compare_at_price;
                $data['omnibus_price_min'] = $cheapestOnSale?->lowestPriceInLast30Days();
            } else {
                $data['variants'] = [];
                $data['compare_at_price_min'] = null;
                $data['omnibus_price_min'] = null;
            }

            return $data;
        }

        return (array) $product;
    }
}
