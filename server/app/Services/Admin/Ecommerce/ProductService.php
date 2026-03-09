<?php

declare(strict_types=1);

namespace App\Services\Admin\Ecommerce;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function createProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $product = Product::create([
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

            return $product;
        });
    }

    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
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

            return $product->fresh(['category', 'categories', 'images', 'defaultVariant']);
        });
    }

    public function deleteProduct(Product $product): void
    {
        $product->delete();
    }

    private function createVariant(Product $product, array $variantData): ProductVariant
    {
        return $product->variants()->create([
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
    }

    private function updateOrCreateVariant(Product $product, array $variantData): ProductVariant
    {
        $defaultVariant = $product->getDefaultVariant();

        if ($defaultVariant) {
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
            $image = is_array($imageData) ? $imageData : json_decode($imageData, true);

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
}
