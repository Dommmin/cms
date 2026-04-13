<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class FlashSaleController extends ApiController
{
    public function index(): JsonResponse
    {
        $flashSales = FlashSale::query()
            ->active()
            ->with([
                'product:id,name,slug',
                'variant:id,product_id,sku',
            ])
            ->get();

        $data = $flashSales->map(fn (FlashSale $sale): array => [
            'id' => $sale->id,
            'name' => $sale->name,
            'product_id' => $sale->product_id,
            'variant_id' => $sale->variant_id,
            'sale_price' => $sale->sale_price,
            'ends_at' => $sale->ends_at->toIso8601String(),
            'stock_remaining' => $sale->stockRemaining(),
            'product' => $sale->product ? [
                'id' => $sale->product->id,
                'name' => $sale->product->name,
                'slug' => $sale->product->slug,
            ] : null,
            'variant' => $sale->variant ? [
                'id' => $sale->variant->id,
                'sku' => $sale->variant->sku,
            ] : null,
        ])->values()->all();

        return $this->ok(['data' => $data]);
    }

    public function forProduct(string $slug): JsonResponse
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->firstOrFail();

        $flashSale = FlashSale::query()
            ->active()
            ->where('product_id', $product->id)
            ->first();

        if ($flashSale === null) {
            return $this->ok([]);
        }

        return $this->ok([
            'id' => $flashSale->id,
            'name' => $flashSale->name,
            'product_id' => $flashSale->product_id,
            'variant_id' => $flashSale->variant_id,
            'sale_price' => $flashSale->sale_price,
            'ends_at' => $flashSale->ends_at->toIso8601String(),
            'stock_remaining' => $flashSale->stockRemaining(),
        ]);
    }
}
