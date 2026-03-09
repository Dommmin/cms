<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductFlag;
use App\Models\ProductVariant;

it('seeds realistic ecommerce demo data set', function () {
    $this->seed(Database\Seeders\ProductTypeSeeder::class);
    $this->seed(Database\Seeders\EcommerceDemoSeeder::class);

    expect(Product::query()->count())->toBeGreaterThanOrEqual(10)
        ->and(Category::query()->count())->toBeGreaterThanOrEqual(5)
        ->and(ProductFlag::query()->count())->toBeGreaterThanOrEqual(4)
        ->and(ProductVariant::query()->count())->toBeGreaterThanOrEqual(12);

    $essentialTee = Product::query()->where('name->en', 'Essential Cotton Tee')->first();

    expect($essentialTee)->not->toBeNull();
    expect($essentialTee?->flags()->count())->toBeGreaterThan(0);
});
