<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\PriceHistory;
use App\Models\ProductVariant;

class ProductVariantPriceObserver
{
    public function created(ProductVariant $productVariant): void
    {
        $this->recordPrice($productVariant);
    }

    public function updated(ProductVariant $productVariant): void
    {
        if ($productVariant->isDirty('price')) {
            $this->recordPrice($productVariant);
        }
    }

    private function recordPrice(ProductVariant $productVariant): void
    {
        PriceHistory::query()->create([
            'product_variant_id' => $productVariant->id,
            'price' => $productVariant->price,
            'recorded_at' => now(),
        ]);
    }
}
