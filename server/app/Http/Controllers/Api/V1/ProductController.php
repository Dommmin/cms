<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Filters\CategoryFilter;
use App\Filters\InStockFilter;
use App\Filters\MaxPriceFilter;
use App\Filters\MinPriceFilter;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\ProductCollection;
use App\Http\Resources\Api\V1\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\FlashSale;
use App\Models\Product;
use App\Sorts\RatingSort;
use App\Sorts\VariantPriceSort;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class ProductController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();

        $query = QueryBuilder::for(Product::available())
            ->allowedFilters([
                AllowedFilter::callback('name', function ($query, string $value) use ($locale): void {
                    $query->whereJsonContainsLocale('name', $locale, '%'.$value.'%', 'like');
                }),
                AllowedFilter::callback('description', function ($query, string $value) use ($locale): void {
                    $query->whereJsonContainsLocale('description', $locale, '%'.$value.'%', 'like');
                }),
                AllowedFilter::exact('brand_id'),
                AllowedFilter::custom('category', new CategoryFilter),
                AllowedFilter::custom('min_price', new MinPriceFilter),
                AllowedFilter::custom('max_price', new MaxPriceFilter),
                AllowedFilter::custom('in_stock', new InStockFilter),
            ])
            ->allowedSorts([
                'name',
                'created_at',
                AllowedSort::custom('price', new VariantPriceSort),
                AllowedSort::custom('rating', new RatingSort),
            ])
            ->defaultSort('name');

        $this->applyAttributeFilters($query, $request->input('filter.attributes', []));

        $availableFilters = $this->buildAvailableFilters(clone $query);

        $products = $query
            ->with([
                'thumbnail',
                'category',
                'brand',
                'activeVariants:id,product_id,price,compare_at_price,stock_quantity,is_active',
                'activeVariants.priceHistory',
                'activeVariants.attributeValues.attribute',
                'activeVariants.attributeValues.attributeValue',
                'promotions' => fn ($q) => $q->active()->select('promotions.id', 'promotions.name', 'promotions.type'),
            ])
            ->paginate(24)
            ->withQueryString();

        return new ProductCollection($products)
            ->additional(['available_filters' => $availableFilters])
            ->response();
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::query()
            ->available()
            ->where('slug', $slug)
            ->with([
                'category',
                'brand',
                'thumbnail.media',
                'images.media',
                'activeVariants.attributeValues.attribute',
                'activeVariants.attributeValues.attributeValue',
                'activeVariants.priceHistory',
                'reviews' => fn ($q) => $q->where('status', 'approved')->with('customer')->limit(10),
                'promotions' => fn ($q) => $q->active()->select('promotions.id', 'promotions.name', 'promotions.type'),
            ])
            ->firstOrFail();

        $range = $product->priceRange();
        $product->setAttribute('price_min', $range['min']);
        $product->setAttribute('price_max', $range['max']);

        return $this->ok([
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'is_active' => (bool) $product->is_active,
            'description' => $product->description,
            'short_description' => $product->short_description,
            'price_min' => $range['min'],
            'price_max' => $range['max'],
            'thumbnail' => $product->thumbnail ? [
                'id' => $product->thumbnail->id,
                'url' => $product->thumbnail->media?->getUrl() ?? '',
                'thumb_url' => $product->thumbnail->media?->getUrl() ?? '',
                'alt' => $product->thumbnail->media?->name ?? $product->name,
                'position' => $product->thumbnail->position,
            ] : null,
            'images' => $product->images->map(fn ($img): array => [
                'id' => $img->id,
                'url' => $img->media?->getUrl() ?? '',
                'thumb_url' => $img->media?->getUrl() ?? '',
                'alt' => $img->media?->name ?? $product->name,
                'position' => $img->position,
            ])->values()->all(),
            'average_rating' => $product->averageRating(),
            'reviews_count' => $product->reviews->count(),
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
                'description' => null,
                'image_url' => null,
                'parent_id' => $product->category->parent_id,
            ] : null,
            'brand' => $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
                'slug' => $product->brand->slug,
                'logo_url' => null,
            ] : null,
            'attributes' => [],
            'created_at' => $product->created_at?->toIso8601String(),
            'seo_title' => $product->seo_title,
            'seo_description' => $product->seo_description,
            'meta_robots' => $product->meta_robots ?? 'index, follow',
            'og_image' => $product->og_image,
            'sitemap_exclude' => (bool) $product->sitemap_exclude,
            'variants' => $product->activeVariants->map(fn ($variant): array => [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'price' => $variant->price,
                'compare_at_price' => $variant->compare_at_price,
                'stock_quantity' => $variant->stock_quantity,
                'is_available' => $variant->isInStock(),
                'is_default' => $variant->is_default,
                'attributes' => $variant->attributeValues->mapWithKeys(
                    fn ($av): array => [$av->attribute->name => $av->attributeValue->value]
                )->all(),
                'omnibus_price' => $variant->lowestPriceInLast30Days(),
            ]),
            'flash_sale' => $this->resolveFlashSale($product->id),
        ]);
    }

    public function compare(Request $request): JsonResponse
    {
        $ids = $request->query('ids', []);

        if (! is_array($ids) || count($ids) < 2 || count($ids) > 4) {
            throw ValidationException::withMessages([
                'ids' => ['You must provide between 2 and 4 product IDs to compare.'],
            ]);
        }

        $ids = array_map(intval(...), $ids);

        $products = Product::query()
            ->available()
            ->whereIn('id', $ids)
            ->with([
                'thumbnail',
                'category',
                'brand',
                'activeVariants.attributeValues.attribute',
                'activeVariants.attributeValues.attributeValue',
            ])
            ->get();

        abort_if($products->count() < 2, 404, 'No products found.');

        // Build per-product attribute map: { "RAM" => ["16 GB", "32 GB"], "Storage" => ["512 GB"] }
        // Values are aggregated (unique) across all active variants of each product.
        $productAttributeMaps = $products->map(function (Product $product): array {
            $map = [];
            foreach ($product->activeVariants as $variant) {
                foreach ($variant->attributeValues as $av) {
                    $key = $av->attribute->name;
                    $val = $av->attributeValue->value;
                    if (! isset($map[$key])) {
                        $map[$key] = [];
                    }

                    if (! in_array($val, $map[$key], true)) {
                        $map[$key][] = $val;
                    }
                }
            }

            return $map;
        });

        // Union of all attribute keys across all products — preserves insertion order
        $allAttributeKeys = $productAttributeMaps
            ->flatMap(fn (array $map): array => array_keys($map))
            ->unique()
            ->values()
            ->all();

        $data = $products->mapWithKeys(fn (Product $product, int $index): array => [$index => [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'is_active' => $product->is_active,
            'short_description' => $product->short_description,
            'price_min' => $product->priceRange()['min'],
            'price_max' => $product->priceRange()['max'],
            'thumbnail' => $product->thumbnail ? [
                'url' => $product->thumbnail->getUrl(),
                'alt' => $product->thumbnail->name,
            ] : null,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'brand' => $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
            ] : null,
            // Aggregated attribute map for this product
            'attribute_map' => $productAttributeMaps[$index],
            // Keep variants for add-to-cart
            'variants' => $product->activeVariants->map(fn ($variant): array => [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'price' => $variant->price,
                'stock_quantity' => $variant->stock_quantity,
                'is_available' => $variant->isInStock(),
                'is_default' => $variant->is_default,
                'attributes' => $variant->attributeValues->mapWithKeys(
                    fn ($av): array => [$av->attribute->name => $av->attributeValue->value]
                )->all(),
            ]),
        ]])->values();

        return $this->ok([
            'data' => $data,
            'meta' => ['attribute_keys' => $allAttributeKeys],
        ]);
    }

    public function related(string $slug): JsonResponse
    {
        $product = Product::query()->available()->where('slug', $slug)->firstOrFail();

        $related = Product::query()
            ->available()
            ->where('id', '!=', $product->id)
            ->where(function ($q) use ($product): void {
                if ($product->category_id !== null) {
                    $q->orWhere('category_id', $product->category_id);
                }

                if ($product->brand_id !== null) {
                    $q->orWhere('brand_id', $product->brand_id);
                }
            })
            ->with(['thumbnail', 'brand', 'activeVariants:id,product_id,price,compare_at_price'])
            ->inRandomOrder()
            ->limit(8)
            ->get();

        return $this->ok(ProductResource::collection($related));
    }

    public function byCategory(string $slug): AnonymousResourceCollection
    {
        $category = Category::query()->where('slug', $slug)->where('is_active', true)->firstOrFail();

        $products = QueryBuilder::for(Product::available()->whereHas('categories', fn ($q) => $q->where('categories.id', $category->id)))
            ->allowedFilters([
                AllowedFilter::partial('name'),
                AllowedFilter::custom('min_price', new MinPriceFilter),
                AllowedFilter::custom('max_price', new MaxPriceFilter),
            ])
            ->allowedSorts([
                'name',
                'created_at',
                AllowedSort::custom('price', new VariantPriceSort),
            ])
            ->defaultSort('name')
            ->with(['thumbnail', 'brand'])
            ->paginate(24)
            ->withQueryString();

        return $this->collection(ProductResource::collection($products));
    }

    /**
     * @return array{id: int, name: string, sale_price: int, ends_at: string}|null
     */
    private function resolveFlashSale(int $productId): ?array
    {
        $flashSale = FlashSale::query()
            ->active()
            ->where('product_id', $productId)
            ->first();

        if ($flashSale === null) {
            return null;
        }

        return [
            'id' => $flashSale->id,
            'name' => $flashSale->name,
            'sale_price' => $flashSale->sale_price,
            'ends_at' => $flashSale->ends_at->toIso8601String(),
            'stock_remaining' => $flashSale->stockRemaining(),
            'variant_id' => $flashSale->variant_id,
        ];
    }

    private function applyAttributeFilters(QueryBuilder $query, mixed $attributeFilters): void
    {
        if (! is_array($attributeFilters)) {
            return;
        }

        foreach ($attributeFilters as $attributeSlug => $rawValues) {
            if (! is_string($attributeSlug)) {
                continue;
            }

            $values = collect(is_array($rawValues) ? $rawValues : explode(',', (string) $rawValues))
                ->map(fn (mixed $value): string => mb_trim((string) $value))
                ->filter()
                ->values()
                ->all();

            if ($values === []) {
                continue;
            }

            $query->whereHas('activeVariants.attributeValues', function (Builder $builder) use ($attributeSlug, $values): void {
                $builder
                    ->whereHas('attribute', fn (Builder $attributeQuery): Builder => $attributeQuery->where('slug', $attributeSlug))
                    ->whereHas('attributeValue', fn (Builder $valueQuery): Builder => $valueQuery->whereIn('slug', $values));
            });
        }
    }

    private function buildAvailableFilters(QueryBuilder $query): array
    {
        $products = $query
            ->with([
                'brand:id,name,slug',
                'activeVariants.attributeValues.attribute:id,name,slug,is_filterable,position',
                'activeVariants.attributeValues.attributeValue:id,attribute_id,value,slug,position',
            ])
            ->get(['products.id', 'products.brand_id']);

        $brandBuckets = [];
        $attributeBuckets = [];

        foreach ($products as $product) {
            if ($product->brand instanceof Brand) {
                $brandId = $product->brand->id;

                if (! isset($brandBuckets[$brandId])) {
                    $brandBuckets[$brandId] = [
                        'id' => $brandId,
                        'slug' => $product->brand->slug,
                        'label' => $product->brand->name,
                        'count' => 0,
                        'product_ids' => [],
                    ];
                }

                if (! in_array($product->id, $brandBuckets[$brandId]['product_ids'], true)) {
                    $brandBuckets[$brandId]['product_ids'][] = $product->id;
                    $brandBuckets[$brandId]['count']++;
                }
            }

            foreach ($product->activeVariants as $variant) {
                foreach ($variant->attributeValues as $attributeValuePivot) {
                    $attribute = $attributeValuePivot->attribute;
                    $attributeValue = $attributeValuePivot->attributeValue;
                    if (! $attribute) {
                        continue;
                    }

                    if (! $attributeValue) {
                        continue;
                    }

                    if (! $attribute->is_filterable) {
                        continue;
                    }

                    $attributeSlug = $attribute->slug;
                    $valueSlug = $attributeValue->slug;

                    if (! isset($attributeBuckets[$attributeSlug])) {
                        $attributeBuckets[$attributeSlug] = [
                            'slug' => $attributeSlug,
                            'label' => $attribute->name,
                            'position' => $attribute->position,
                            'values' => [],
                        ];
                    }

                    if (! isset($attributeBuckets[$attributeSlug]['values'][$valueSlug])) {
                        $attributeBuckets[$attributeSlug]['values'][$valueSlug] = [
                            'slug' => $valueSlug,
                            'label' => $attributeValue->value,
                            'position' => $attributeValue->position,
                            'count' => 0,
                            'product_ids' => [],
                        ];
                    }

                    if (! in_array($product->id, $attributeBuckets[$attributeSlug]['values'][$valueSlug]['product_ids'], true)) {
                        $attributeBuckets[$attributeSlug]['values'][$valueSlug]['product_ids'][] = $product->id;
                        $attributeBuckets[$attributeSlug]['values'][$valueSlug]['count']++;
                    }
                }
            }
        }

        usort($brandBuckets, function (array $left, array $right): int {
            $countComparison = $right['count'] <=> $left['count'];

            if ($countComparison !== 0) {
                return $countComparison;
            }

            return $left['label'] <=> $right['label'];
        });
        $brands = array_map(fn (array $brand): array => [
            'id' => $brand['id'],
            'slug' => $brand['slug'],
            'label' => $brand['label'],
            'count' => $brand['count'],
        ], $brandBuckets);

        usort($attributeBuckets, fn (array $left, array $right): int => [$left['position'], $left['label']] <=> [$right['position'], $right['label']]);
        $attributes = array_map(function (array $attribute): array {
            $values = array_values($attribute['values']);
            usort($values, fn (array $left, array $right): int => [$left['position'], $left['label']] <=> [$right['position'], $right['label']]);

            return [
                'slug' => $attribute['slug'],
                'label' => $attribute['label'],
                'values' => array_map(fn (array $value): array => [
                    'slug' => $value['slug'],
                    'label' => $value['label'],
                    'count' => $value['count'],
                ], $values),
            ];
        }, $attributeBuckets);

        return [
            'brands' => $brands,
            'attributes' => $attributes,
        ];
    }
}
