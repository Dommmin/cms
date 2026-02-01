<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use App\Modules\Core\Presentation\Http\Controllers\SettingsController;
use App\Modules\Ecommerce\Presentation\Http\Controllers\CartController;
use App\Modules\Ecommerce\Presentation\Http\Controllers\CategoryController;
use App\Modules\Ecommerce\Presentation\Http\Controllers\MediaController;
use App\Modules\Ecommerce\Presentation\Http\Controllers\OrderController;
use App\Modules\Ecommerce\Presentation\Http\Controllers\ProductController;
use App\Modules\Ecommerce\Presentation\Http\Controllers\ReturnController;
use App\Modules\Ecommerce\Presentation\Http\Controllers\SearchController;
use App\Modules\Ecommerce\Presentation\Http\Controllers\WishlistController;
use App\Modules\Newsletter\Presentation\Http\Controllers\NewsletterController;
use App\Modules\Reviews\Presentation\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API V1 Routes
|--------------------------------------------------------------------------
|
| Routes for API version 1.
|
*/

// Public routes with auth rate limiter (5/min - brute force protection)
Route::middleware('throttle:auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register'])->name('api.v1.register');
    Route::post('login', [AuthController::class, 'login'])->name('api.v1.login');
});

// Protected routes with authenticated rate limiter (120/min)
Route::middleware(['auth:sanctum', 'throttle:authenticated'])->group(function (): void {
    Route::post('logout', [AuthController::class, 'logout'])->name('api.v1.logout');
    Route::get('me', [AuthController::class, 'me'])->name('api.v1.me');

    // Email verification
    Route::post('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware('signed')
        ->name('verification.verify');
    Route::post('email/resend', [AuthController::class, 'resendVerificationEmail'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
});

// Password reset routes (public with rate limiting)
Route::middleware('throttle:6,1')->group(function (): void {
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])
        ->name('password.email');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])
        ->name('password.reset');
});

// ─── E-commerce Routes (with feature flag) ────────────────────────────────
Route::middleware(['feature:ecommerce'])->group(function (): void {
    // Categories (public)
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category:slug}', [CategoryController::class, 'show']);

    // Products (public)
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product:slug}', [ProductController::class, 'show']);

    // Search (public)
    Route::get('search', [SearchController::class, 'search']);

    // Cart (authenticated)
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('cart', [CartController::class, 'show']);
        Route::post('cart/items', [CartController::class, 'addItem']);
        Route::put('cart/items/{cartItem}', [CartController::class, 'updateItem']);
        Route::delete('cart/items/{cartItem}', [CartController::class, 'removeItem']);
        Route::delete('cart', [CartController::class, 'clear']);

        // Orders (authenticated)
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);

        // Returns (authenticated)
        Route::get('returns', [ReturnController::class, 'index']);
        Route::post('returns', [ReturnController::class, 'store']);

        // Wishlists (authenticated)
        Route::get('wishlists', [WishlistController::class, 'index']);
        Route::post('wishlists', [WishlistController::class, 'store']);
        Route::post('wishlists/{wishlist}/items', [WishlistController::class, 'addItem']);
        Route::delete('wishlists/{wishlist}/items/{wishlistItem}', [WishlistController::class, 'removeItem']);

        // Reviews (authenticated - write)
        Route::post('reviews', [ReviewController::class, 'store']);
        Route::post('reviews/{review}/helpful', [ReviewController::class, 'vote']);
    });

    // Reviews (public - read)
    Route::get('reviews', [ReviewController::class, 'index']);
});

// ─── Media Routes ──────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('media/upload', [MediaController::class, 'upload']);
    Route::delete('media/{path}', [MediaController::class, 'delete']);
});

// ─── Newsletter Routes (public) ───────────────────────────────────────────
Route::post('newsletter/subscribe', [NewsletterController::class, 'subscribe']);
Route::post('newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe']);
Route::get('newsletter/track/open/{campaignId}/{token}', [NewsletterController::class, 'trackOpen']);
Route::get('newsletter/track/click/{trackingToken}', [NewsletterController::class, 'trackClick']);

// ─── Settings Routes (public) ────────────────────────────────────────────
Route::get('settings', [SettingsController::class, 'index']);

// ─── AI Routes ────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function (): void {
    Route::prefix('ai')->group(function (): void {
        Route::post('generate-content', [\App\Modules\AI\Presentation\Http\Controllers\AIController::class, 'generateContent']);
        Route::post('generate-module', [\App\Modules\AI\Presentation\Http\Controllers\AIController::class, 'generateModule']);
        Route::post('generate-product-description', [\App\Modules\AI\Presentation\Http\Controllers\AIController::class, 'generateProductDescription']);
        Route::post('generate-policy', [\App\Modules\AI\Presentation\Http\Controllers\AIController::class, 'generatePolicy']);
    });
});
