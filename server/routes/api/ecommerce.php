<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\BrandController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\FlashSaleController;
use App\Http\Controllers\Api\V1\GusController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PickupPointsController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\PromotionController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\Api\V1\WishlistController;
use Illuminate\Support\Facades\Route;

// ── Payment webhooks (public, no auth, no throttle) ─────────────────────────
Route::prefix('v1/webhooks')->name('api.v1.webhooks.')->group(function (): void {
    Route::post('payu', [WebhookController::class, 'payu'])->name('payu');
    Route::post('p24', [WebhookController::class, 'p24'])->name('p24');
});

Route::prefix('v1')->name('api.v1.')->group(function (): void {

    // ── Public e-commerce ────────────────────────────────────────────────────
    Route::middleware('throttle:api.public')->group(function (): void {

        Route::prefix('products')->name('products.')->group(function (): void {
            Route::get('/', [ProductController::class, 'index'])->name('index');
            Route::get('compare', [ProductController::class, 'compare'])->name('compare');
            Route::get('{slug}', [ProductController::class, 'show'])->name('show');
            Route::get('{slug}/related', [ProductController::class, 'related'])->name('related');
            Route::get('{slug}/reviews', [ReviewController::class, 'index'])->name('reviews.index');
        });

        Route::prefix('categories')->name('categories.')->group(function (): void {
            Route::get('/', [CategoryController::class, 'index'])->name('index');
            Route::get('{slug}', [CategoryController::class, 'show'])->name('show');
            Route::get('{slug}/products', [ProductController::class, 'byCategory'])->name('products');
        });

        Route::get('brands', [BrandController::class, 'index'])->name('brands.index');
        Route::get('promotions', [PromotionController::class, 'index'])->name('promotions.index');

        // Flash Sales
        Route::get('flash-sales', [FlashSaleController::class, 'index'])->name('flash-sales.index');
        Route::get('products/{slug}/flash-sale', [FlashSaleController::class, 'forProduct'])->name('flash-sales.for-product');

        // Search
        Route::get('search', SearchController::class)->name('search');
        Route::get('search/autocomplete', [SearchController::class, 'autocomplete'])->name('search.autocomplete');

        // Checkout (public — no auth required)
        Route::get('checkout/shipping-methods', [CheckoutController::class, 'shippingMethods'])->name('checkout.shipping-methods');
        Route::get('checkout/payment-methods', [CheckoutController::class, 'paymentMethods'])->name('checkout.payment-methods');
        Route::get('checkout/pickup-points', [PickupPointsController::class, 'index'])->name('checkout.pickup-points');
        Route::post('checkout', [CheckoutController::class, 'checkout'])->middleware('idempotent')->name('checkout');
    });

    // ── Cart (guest + auth) ──────────────────────────────────────────────────
    Route::prefix('cart')->name('cart.')->middleware('throttle:api.public')->group(function (): void {
        Route::get('/', [CartController::class, 'show'])->name('show');
        Route::post('items', [CartController::class, 'addItem'])->middleware('idempotent')->name('items.store');
        Route::put('items/{cartItem}', [CartController::class, 'updateItem'])->name('items.update');
        Route::delete('items/{cartItem}', [CartController::class, 'removeItem'])->name('items.destroy');
        Route::delete('/', [CartController::class, 'clear'])->name('clear');
        Route::post('discount', [CartController::class, 'applyDiscount'])->name('discount.apply');
        Route::delete('discount', [CartController::class, 'removeDiscount'])->name('discount.remove');
    });

    // ── Authenticated e-commerce ─────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:api.auth'])->group(function (): void {

        // Wishlist
        Route::prefix('wishlist')->name('wishlist.')->group(function (): void {
            Route::get('/', [WishlistController::class, 'show'])->name('show');
            Route::post('items', [WishlistController::class, 'addItem'])->name('items.store');
            Route::delete('items/{variantId}', [WishlistController::class, 'removeItem'])->name('items.destroy');
        });

        // Payments
        Route::get('payments/{payment}/status', [PaymentController::class, 'status'])->name('payments.status');
        Route::post('payments/apple-pay/validate-merchant', [PaymentController::class, 'validateApplePayMerchant'])->name('payments.apple-pay.validate');

        // Orders
        Route::prefix('orders')->name('orders.')->group(function (): void {
            Route::get('/', [OrderController::class, 'index'])->name('index');
            Route::get('{reference}', [OrderController::class, 'show'])->name('show');
            Route::get('{reference}/invoice', [OrderController::class, 'invoice'])->name('invoice');
            Route::post('{reference}/cancel', [OrderController::class, 'cancel'])->middleware('idempotent')->name('cancel');
            Route::post('{reference}/return', [OrderController::class, 'requestReturn'])->name('return');
            Route::post('{reference}/reorder', [OrderController::class, 'reorder'])->name('reorder');
        });

        // Reviews
        Route::post('products/{slug}/reviews', [ReviewController::class, 'store'])->name('products.reviews.store');
        Route::post('reviews/{review}/helpful', [ReviewController::class, 'markHelpful'])->name('reviews.helpful');

        // GUS / REGON company lookup
        Route::get('gus/nip/{nip}', [GusController::class, 'lookupByNip'])
            ->middleware('throttle:api.strict')
            ->name('gus.nip');
    });
});
