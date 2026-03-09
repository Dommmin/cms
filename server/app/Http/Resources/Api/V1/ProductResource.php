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
                ? $product->activeVariants->some(fn ($v) => $v->compare_at_price && $v->compare_at_price > $v->price)
                : false;
            $product->setAttribute('is_on_sale', $isOnSale);

            $maxDiscount = $product->relationLoaded('activeVariants')
                ? $product->activeVariants->map(fn ($v) => $v->compare_at_price && $v->price
                    ? (int) round((1 - $v->price / $v->compare_at_price) * 100)
                    : null
                )->filter()->max()
                : null;
            $product->setAttribute('discount_percentage', $maxDiscount ?: null);

            return ProductData::from($product)->toArray();
        }

        return (array) $product;
    }
}
