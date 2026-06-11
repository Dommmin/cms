<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Data\ProductData;
use App\Models\Product;
use App\Services\StorefrontPathService;
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

            $isOnSale = $product->relationLoaded('activeVariants') && $product->activeVariants->contains(fn ($v): bool => $v->compare_at_price && $v->compare_at_price > $v->price);
            $product->setAttribute('is_on_sale', $isOnSale);

            $maxDiscount = $product->relationLoaded('activeVariants')
                ? $product->activeVariants->map(fn ($v): ?int => $v->compare_at_price && $v->price
                    ? (int) round((1 - $v->price / $v->compare_at_price) * 100)
                    : null
                )->filter()->max()
                : null;
            $product->setAttribute('discount_percentage', $maxDiscount ?: null);

            $data = ProductData::from($product)->toArray();
            $data['public_url'] = resolve(StorefrontPathService::class)->productPath($product);

            /** @var int|null $categoryId */
            $categoryId = $product->category_id;
            if ($product->relationLoaded('category') && $categoryId !== null) {
                $data['category']['public_url'] = resolve(StorefrontPathService::class)->categoryPath($product->category);
            }

            if ($product->relationLoaded('brand') && $product->brand !== null) {
                $data['brand']['public_url'] = resolve(StorefrontPathService::class)->brandPath($product->brand);
            }

            // Override thumbnail to match the ProductImage TS interface (url/alt/thumb_url)
            // ProductData maps to ProductImageData which uses path/alt_text — wrong shape for the frontend.
            if ($product->thumbnail) {
                $url = $product->thumbnail->path; // getPathAttribute() returns media URL
                $data['thumbnail'] = [
                    'id' => $product->thumbnail->id,
                    'url' => $url,
                    'thumb_url' => $url,
                    'alt' => $product->thumbnail->alt_text ?? $product->name,
                    'position' => $product->thumbnail->position,
                ];
            } else {
                $data['thumbnail'] = null;
            }

            if ($product->relationLoaded('activeVariants')) {
                $variants = $product->activeVariants;
                $data['variants'] = $variants->map(fn ($v): array => [
                    'id' => $v->id,
                    'price' => $v->price,
                    'compare_at_price' => $v->compare_at_price,
                    'is_available' => $v->isInStock(),
                    'backorder_allowed' => (bool) $v->backorder_allowed,
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

            // Build attribute_map: { "RAM" => ["16 GB","32 GB"], "Color" => ["Black"] }
            // Only populated when attributeValues are eager-loaded.
            $attributeMap = [];
            if ($product->relationLoaded('activeVariants')) {
                foreach ($product->activeVariants as $variant) {
                    if (! $variant->relationLoaded('attributeValues')) {
                        continue;
                    }

                    foreach ($variant->attributeValues as $av) {
                        if (! $av->relationLoaded('attribute')) {
                            continue;
                        }

                        if (! $av->relationLoaded('attributeValue')) {
                            continue;
                        }

                        $key = $av->attribute->name;
                        $val = $av->attributeValue->value;
                        if (! isset($attributeMap[$key])) {
                            $attributeMap[$key] = [];
                        }

                        if (! in_array($val, $attributeMap[$key], true)) {
                            $attributeMap[$key][] = $val;
                        }
                    }
                }
            }

            $data['attribute_map'] = $attributeMap;

            // Active promotions (only when loaded)
            if ($product->relationLoaded('promotions')) {
                $data['active_promotions'] = $product->promotions
                    ->map(fn ($p): array => ['id' => $p->id, 'name' => $p->name, 'type' => $p->type])
                    ->values()
                    ->all();
            }

            return $data;
        }

        return (array) $product;
    }
}
