<?php

declare(strict_types=1);

namespace App\Services\Admin\Ecommerce;

use App\Enums\AttributeTypeEnum;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function createProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $product = Product::query()->create([
                'name' => $data['name'],
                'slug' => $data['slug'],
                'description' => $data['description'] ?? null,
                'short_description' => $data['short_description'] ?? null,
                'sku_prefix' => $data['sku_prefix'] ?? null,
                'product_type_id' => $data['product_type_id'],
                'category_id' => $data['category_id'],
                'brand_id' => $data['brand_id'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'is_saleable' => $data['is_saleable'] ?? true,
                'is_featured' => $data['is_featured'] ?? false,
                'seo_title' => $data['seo_title'] ?? null,
                'seo_description' => $data['seo_description'] ?? null,
                'available_from' => $data['available_from'] ?? null,
                'available_until' => $data['available_until'] ?? null,
            ]);

            if (! empty($data['categories'])) {
                $product->categories()->sync($data['categories']);
            }

            if (array_key_exists('flags', $data)) {
                $product->flags()->sync($data['flags']);
            }

            if (! empty($data['variant'])) {
                $this->createVariant($product, $data['variant']);
            }

            if (! empty($data['images'])) {
                $this->attachImages($product, $data['images']);
            }

            $this->syncProductAttributeValues($product, $data['attribute_values'] ?? []);

            return $product;
        });
    }

    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $originalCategoryId = (int) $product->category_id;

            $product->update([
                'name' => $data['name'],
                'slug' => $data['slug'],
                'description' => $data['description'] ?? null,
                'short_description' => $data['short_description'] ?? null,
                'sku_prefix' => $data['sku_prefix'] ?? null,
                'product_type_id' => $data['product_type_id'],
                'category_id' => $data['category_id'],
                'brand_id' => $data['brand_id'] ?? null,
                'is_active' => $data['is_active'] ?? $product->is_active,
                'is_saleable' => $data['is_saleable'] ?? $product->is_saleable,
                'is_search_promoted' => $data['is_search_promoted'] ?? $product->is_search_promoted,
                'is_featured' => $data['is_featured'] ?? $product->is_featured,
                'seo_title' => $data['seo_title'] ?? null,
                'seo_description' => $data['seo_description'] ?? null,
                'available_from' => $data['available_from'] ?? null,
                'available_until' => $data['available_until'] ?? null,
            ]);

            if (isset($data['categories'])) {
                $product->categories()->sync($data['categories']);
            }

            if (array_key_exists('flags', $data)) {
                $product->flags()->sync($data['flags']);
            }

            if (isset($data['variant'])) {
                $this->updateOrCreateVariant($product, $data['variant']);
            }

            if (isset($data['images'])) {
                $this->syncImages($product, $data['images']);
            }

            if (array_key_exists('attribute_values', $data) || $originalCategoryId !== (int) $product->category_id) {
                $this->syncProductAttributeValues($product, $data['attribute_values'] ?? []);

                if (! $product->wasChanged()) {
                    $product->touch();
                }
            }

            return $product->fresh(['category', 'categories', 'images', 'defaultVariant', 'attributeValues']);
        });
    }

    public function deleteProduct(Product $product): void
    {
        $product->delete();
    }

    private function createVariant(Product $product, array $variantData): ProductVariant
    {
        $variant = $product->variants()->create([
            'sku' => $variantData['sku'],
            'name' => $variantData['name'] ?? $product->name,
            'price' => $variantData['price'] ?? 0,
            'cost_price' => $variantData['cost_price'] ?? 0,
            'compare_at_price' => $variantData['compare_at_price'] ?? null,
            'weight' => $variantData['weight'] ?? 0,
            'stock_quantity' => $variantData['stock_quantity'] ?? 0,
            'stock_threshold' => $variantData['stock_threshold'] ?? 5,
            'is_active' => $variantData['is_active'] ?? true,
            'is_default' => true,
            'position' => 0,
        ]);

        return $variant instanceof ProductVariant ? $variant : new ProductVariant();
    }

    private function updateOrCreateVariant(Product $product, array $variantData): ProductVariant
    {
        $defaultVariant = $product->getDefaultVariant();

        if ($defaultVariant instanceof ProductVariant) {
            $defaultVariant->update([
                'sku' => $variantData['sku'],
                'name' => $variantData['name'] ?? $product->name,
                'price' => $variantData['price'] ?? 0,
                'cost_price' => $variantData['cost_price'] ?? 0,
                'compare_at_price' => $variantData['compare_at_price'] ?? null,
                'weight' => $variantData['weight'] ?? 0,
                'stock_quantity' => $variantData['stock_quantity'] ?? 0,
                'stock_threshold' => $variantData['stock_threshold'] ?? 5,
                'is_active' => $variantData['is_active'] ?? true,
            ]);

            return $defaultVariant;
        }

        return $this->createVariant($product, $variantData);
    }

    private function attachImages(Product $product, array $images): void
    {
        $normalizedImages = $this->normalizeImagesPayload($images);
        $hasThumbnail = collect($normalizedImages)->contains(
            fn (array $image): bool => $image['is_thumbnail'] === true
        );

        foreach ($normalizedImages as $index => $imageData) {
            $image = is_array($imageData) ? $imageData : json_decode((string) $imageData, true);

            if ($image) {
                $product->images()->create([
                    'media_id' => $image['media_id'] ?? $image['id'] ?? null,
                    'is_thumbnail' => $hasThumbnail ? (bool) ($image['is_thumbnail'] ?? false) : $index === 0,
                    'position' => $image['position'] ?? $index,
                ]);
            }
        }
    }

    private function syncImages(Product $product, array $images): void
    {
        $product->images()->delete();

        $this->attachImages($product, $images);
    }

    private function normalizeImagesPayload(array $images): array
    {
        $normalizedImages = [];

        foreach ($images as $index => $imageData) {
            $image = is_array($imageData) ? $imageData : json_decode((string) $imageData, true);

            if (! is_array($image)) {
                continue;
            }

            $mediaId = $image['media_id'] ?? $image['id'] ?? null;

            if (! is_numeric($mediaId)) {
                continue;
            }

            $normalizedImages[] = [
                'media_id' => (int) $mediaId,
                'is_thumbnail' => filter_var($image['is_thumbnail'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'position' => is_numeric($image['position'] ?? null) ? (int) $image['position'] : $index,
            ];
        }

        return $normalizedImages;
    }

    /**
     * @param  array<int, array<string, mixed>>  $attributeValues
     */
    private function syncProductAttributeValues(Product $product, array $attributeValues): void
    {
        $category = Category::query()->find($product->category_id);
        if (! $category instanceof Category) {
            $product->attributeValues()->delete();

            return;
        }

        $resolvedSchema = $category->resolvedAttributeSchemas()->keyBy('attribute_id');
        $allowedAttributeIds = $resolvedSchema->keys()->all();
        $submittedValues = collect($attributeValues)
            ->filter(fn (array $item): bool => is_numeric($item['attribute_id'] ?? null))
            ->keyBy(fn (array $item): int => (int) $item['attribute_id']);

        $product->attributeValues()
            ->whereNotIn('attribute_id', $allowedAttributeIds === [] ? [0] : $allowedAttributeIds)
            ->delete();

        if ($allowedAttributeIds === []) {
            $product->attributeValues()->delete();

            return;
        }

        foreach ($resolvedSchema as $attributeId => $schemaItem) {
            $entry = $submittedValues->get($attributeId);
            if (! is_array($entry) || ! $this->hasMeaningfulSubmittedAttributeValue($schemaItem->attribute->type, $entry)) {
                $product->attributeValues()->where('attribute_id', $attributeId)->delete();

                continue;
            }

            $payload = $this->buildAttributeValuePayload($schemaItem->attribute->type, $entry);

            $product->attributeValues()->updateOrCreate(
                ['attribute_id' => $attributeId],
                $payload
            );
        }
    }

    /**
     * @param  array<string, mixed>  $entry
     */
    private function hasMeaningfulSubmittedAttributeValue(AttributeTypeEnum $type, array $entry): bool
    {
        return match ($type) {
            AttributeTypeEnum::TEXT,
            AttributeTypeEnum::NUMERIC,
            AttributeTypeEnum::COLOR,
            AttributeTypeEnum::DATE,
            AttributeTypeEnum::BOOLEAN => isset($entry['value']) && $entry['value'] !== '',
            AttributeTypeEnum::SELECT => is_numeric($entry['option_id'] ?? null),
            AttributeTypeEnum::MULTISELECT => collect($entry['option_ids'] ?? [])->isNotEmpty(),
        };
    }

    /**
     * @param  array<string, mixed>  $entry
     * @return array<string, mixed>
     */
    private function buildAttributeValuePayload(AttributeTypeEnum $type, array $entry): array
    {
        $payload = [
            'attribute_value_id' => null,
            'value_text' => null,
            'value_numeric' => null,
            'value_boolean' => null,
            'value_date' => null,
            'value_json' => null,
        ];

        return match ($type) {
            AttributeTypeEnum::TEXT => array_merge($payload, [
                'value_text' => (string) $entry['value'],
            ]),
            AttributeTypeEnum::NUMERIC => array_merge($payload, [
                'value_numeric' => round((float) $entry['value'], 4),
            ]),
            AttributeTypeEnum::BOOLEAN => array_merge($payload, [
                'value_boolean' => in_array($entry['value'], ['1', 'true', true], true),
            ]),
            AttributeTypeEnum::COLOR => array_merge($payload, [
                'value_text' => mb_strtolower((string) $entry['value']),
            ]),
            AttributeTypeEnum::DATE => array_merge($payload, [
                'value_date' => (string) $entry['value'],
            ]),
            AttributeTypeEnum::SELECT => array_merge($payload, [
                'attribute_value_id' => (int) $entry['option_id'],
            ]),
            AttributeTypeEnum::MULTISELECT => array_merge($payload, [
                'value_json' => collect($entry['option_ids'] ?? [])
                    ->filter(fn (mixed $optionId): bool => is_numeric($optionId))
                    ->map(fn (mixed $optionId): int => (int) $optionId)
                    ->values()
                    ->all(),
            ]),
        };
    }
}
