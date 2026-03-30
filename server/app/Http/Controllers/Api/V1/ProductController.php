<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Filters\CategoryFilter;
use App\Filters\InStockFilter;
use App\Filters\MaxPriceFilter;
use App\Filters\MinPriceFilter;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ProductCollection;
use App\Models\Category;
use App\Models\Product;
use App\Sorts\RatingSort;
use App\Sorts\VariantPriceSort;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $locale = app()->getLocale();

        $products = QueryBuilder::for(Product::available())
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
            ->defaultSort('name')
            ->with(['thumbnail', 'category', 'brand', 'activeVariants:id,product_id,price,compare_at_price', 'activeVariants.priceHistory'])
            ->paginate(24)
            ->withQueryString();

        return new ProductCollection($products)->response();
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
            ])
            ->firstOrFail();

        $range = $product->priceRange();
        $product->setAttribute('price_min', $range['min']);
        $product->setAttribute('price_max', $range['max']);

        return response()->json([
            'data' => [
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
            ],
        ]);
    }

    public function compare(Request $request): JsonResponse
    {
        $ids = $request->query('ids', []);

        if (! is_array($ids) || count($ids) < 2 || count($ids) > 4) {
            return response()->json([
                'message' => 'You must provide between 2 and 4 product IDs to compare.',
            ], 422);
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

        if ($products->count() < 2) {
            return response()->json(['message' => 'No products found.'], 404);
        }

        $productTypeIds = $products->pluck('product_type_id')->unique();

        if ($productTypeIds->count() > 1) {
            return response()->json([
                'message' => 'All products must be of the same product type for comparison.',
            ], 422);
        }

        $data = $products->map(fn (Product $product): array => [
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
        ]);

        return response()->json(['data' => $data]);
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

        return new ProductCollection($related)->response();
    }

    public function byCategory(string $slug): JsonResponse
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

        return new ProductCollection($products)->response();
    }
}
