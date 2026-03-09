<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\Ecommerce\AttributeController;
use App\Http\Controllers\Admin\Ecommerce\BrandController;
use App\Http\Controllers\Admin\Ecommerce\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\Ecommerce\CustomerController;
use App\Http\Controllers\Admin\Ecommerce\DiscountController;
use App\Http\Controllers\Admin\Ecommerce\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\Ecommerce\ProductController as AdminProductController;
use App\Http\Controllers\Admin\Ecommerce\ProductFlagController;
use App\Http\Controllers\Admin\Ecommerce\ProductTypeController;
use App\Http\Controllers\Admin\Ecommerce\ProductVariantController;
use App\Http\Controllers\Admin\Ecommerce\PromotionController;
use App\Http\Controllers\Admin\Ecommerce\ReturnRequestController;
use App\Http\Controllers\Admin\Ecommerce\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\Ecommerce\ShippingMethodController;
use App\Http\Controllers\Admin\Ecommerce\TaxRateController;
use Illuminate\Support\Facades\Route;

Route::prefix('ecommerce')->name('ecommerce.')->group(function () {
    Route::resource('categories', AdminCategoryController::class)
        ->except(['show'])
        ->names(['create' => 'ecommerce.categories.create', 'edit' => 'ecommerce.categories.edit']);
    Route::get('products/export', [AdminProductController::class, 'export'])->name('products.export');
    Route::post('products/import', [AdminProductController::class, 'import'])->name('products.import');
    Route::resource('products', AdminProductController::class)
        ->except(['show'])
        ->names(['create' => 'ecommerce.products.create', 'edit' => 'ecommerce.products.edit']);
    Route::get('products/{product}', fn (App\Models\Product $product) => redirect()->route('admin.ecommerce.ecommerce.products.edit', $product));
    Route::get('orders/export', [AdminOrderController::class, 'export'])->name('orders.export');
    Route::get('orders/{order}/invoice', [AdminOrderController::class, 'invoice'])->name('orders.invoice');
    Route::resource('orders', AdminOrderController::class)
        ->only(['index', 'show'])
        ->names(['create' => 'ecommerce.orders.create', 'edit' => 'ecommerce.orders.edit']);
    Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('ecommerce.orders.update-status');
    Route::get('customers/export', [CustomerController::class, 'export'])->name('customers.export');
    Route::resource('reviews', AdminReviewController::class)
        ->only(['index', 'show', 'update', 'destroy'])
        ->names(['create' => 'ecommerce.reviews.create', 'edit' => 'ecommerce.reviews.edit']);

    Route::resource('brands', BrandController::class)->except(['show']);
    Route::post('brands/bulk-destroy', [BrandController::class, 'bulkDestroy'])->name('brands.bulk-destroy');

    Route::resource('product-types', ProductTypeController::class)->except(['show']);

    Route::resource('attributes', AttributeController::class)->except(['show']);

    Route::resource('product-flags', ProductFlagController::class)->except(['show']);
    Route::post('product-flags/reorder', [ProductFlagController::class, 'reorder'])->name('product-flags.reorder');

    Route::resource('customers', CustomerController::class)->only(['index', 'show', 'edit', 'update', 'destroy']);

    Route::resource('discounts', DiscountController::class)->except(['show']);
    Route::post('discounts/{discount}/toggle-active', [DiscountController::class, 'toggleActive'])->name('discounts.toggle-active');

    Route::resource('promotions', PromotionController::class)->except(['show']);
    Route::post('promotions/{promotion}/toggle', [PromotionController::class, 'toggle'])->name('promotions.toggle');

    Route::resource('tax-rates', TaxRateController::class)->except(['show']);

    Route::resource('shipping-methods', ShippingMethodController::class)->except(['show']);
    Route::post('shipping-methods/{shippingMethod}/toggle-active', [ShippingMethodController::class, 'toggleActive'])->name('shipping-methods.toggle-active');

    // Product Variants (nested under products)
    Route::resource('products.variants', ProductVariantController::class)->except(['show']);
    Route::post('products/{product}/variants/{variant}/update-stock', [ProductVariantController::class, 'updateStock'])->name('products.variants.update-stock');

    // Return Requests
    Route::resource('returns', ReturnRequestController::class)->except(['create', 'store']);
    Route::post('returns/{return}/approve', [ReturnRequestController::class, 'approve'])->name('returns.approve');
    Route::post('returns/{return}/reject', [ReturnRequestController::class, 'reject'])->name('returns.reject');
    Route::post('returns/{return}/process-refund', [ReturnRequestController::class, 'processRefund'])->name('returns.process-refund');
});
