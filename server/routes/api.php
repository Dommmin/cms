<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AddressController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\EmailVerificationController;
use App\Http\Controllers\Api\V1\Auth\SocialLoginController;
use App\Http\Controllers\Api\V1\Blog\BlogCategoryController as ApiBlogCategoryController;
use App\Http\Controllers\Api\V1\Blog\BlogCommentController as ApiBlogCommentController;
use App\Http\Controllers\Api\V1\Blog\BlogPostController as ApiBlogPostController;
use App\Http\Controllers\Api\V1\BrandController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\ConsentController;
use App\Http\Controllers\Api\V1\Dashboard\DashboardController;
use App\Http\Controllers\Api\V1\FaqController;
use App\Http\Controllers\Api\V1\FormController;
use App\Http\Controllers\Api\V1\GusController;
use App\Http\Controllers\Api\V1\LocaleController as ApiLocaleController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\NewsletterController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PageController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PickupPointsController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\PromotionController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\StoreController as ApiStoreController;
use App\Http\Controllers\Api\V1\SupportController;
use App\Http\Controllers\Api\V1\TranslationController;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\Api\V1\WishlistController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Spatie\Health\Commands\RunHealthChecksCommand;
use Spatie\Health\ResultStores\ResultStore;

// ── Health check (public, no auth) ──────────────────────────────────────────
Route::get('health', function (ResultStore $resultStore) {
    if (request()->has('fresh')) {
        Artisan::call(RunHealthChecksCommand::class);
    }

    $checkResults = $resultStore->latestResults();

    return response()->json($checkResults);
})->name('api.health');

// ── Payment webhooks (public, no auth, no throttle) ─────────────────────────
Route::prefix('v1/webhooks')->name('api.v1.webhooks.')->group(function (): void {
    Route::post('payu', [WebhookController::class, 'payu'])->name('payu');
    Route::post('p24', [WebhookController::class, 'p24'])->name('p24');
});

Route::prefix('v1')->name('api.v1.')->group(function (): void {

    // ── Authentication ──────────────────────────────────────────────────────
    Route::prefix('auth')->name('auth.')->middleware('throttle:api.strict')->group(function (): void {
        Route::post('register', [AuthController::class, 'register'])->name('register');
        Route::post('login', [AuthController::class, 'login'])->name('login');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('password.forgot');
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');

        // Social login
        Route::get('social/{provider}/redirect', [SocialLoginController::class, 'redirect'])->name('social.redirect');
        Route::post('social/{provider}/callback', [SocialLoginController::class, 'callback'])->name('social.callback');

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::post('logout', [AuthController::class, 'logout'])->name('logout');
            Route::get('me', [AuthController::class, 'me'])->name('me');
            Route::post('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
                ->middleware('signed')
                ->name('email.verify');
            Route::post('email/resend', [EmailVerificationController::class, 'resend'])->name('email.resend');
        });
    });

    // ── Public ───────────────────────────────────────────────────────────────
    Route::middleware('throttle:api.public')->group(function (): void {
        Route::get('locales', new ApiLocaleController()->index(...))->name('locales.index');
        Route::get('translations/{locale}', [TranslationController::class, 'show'])->name('translations.show');
        Route::get('pages/{slug}', [PageController::class, 'show'])->where('slug', '.*')->name('pages.show');
        Route::get('menus/{location}', [MenuController::class, 'show'])->name('menus.show');
        Route::get('settings/public', [ProfileController::class, 'publicSettings'])->name('settings.public');

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
        Route::get('faqs', [FaqController::class, 'index'])->name('faqs.index');
        Route::get('stores', new ApiStoreController()->index(...))->name('stores.index');
        Route::get('stores/{store}', new ApiStoreController()->show(...))->name('stores.show');
        Route::get('promotions', [PromotionController::class, 'index'])->name('promotions.index');

        // Blog
        Route::prefix('blog')->name('blog.')->group(function (): void {
            Route::get('posts', new ApiBlogPostController()->index(...))->name('posts.index');
            Route::get('posts/{slug}', new ApiBlogPostController()->show(...))->name('posts.show');
            Route::post('posts/{slug}/view', new ApiBlogPostController()->recordView(...))->name('posts.view');
            Route::get('posts/{slug}/comments', new ApiBlogCommentController()->index(...))->name('posts.comments.index');
            Route::get('categories', new ApiBlogCategoryController()->index(...))->name('categories.index');
            Route::get('categories/{slug}/posts', new ApiBlogPostController()->byCategory(...))->name('categories.posts');
        });
        Route::post('forms/{id}/submit', [FormController::class, 'submit'])->name('forms.submit');
        Route::post('consent', [ConsentController::class, 'store'])->name('consent.store');
        Route::post('newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
        Route::post('newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');
        Route::get('newsletter/confirm/{token}', [NewsletterController::class, 'confirmSubscription'])->name('newsletter.confirm');
        Route::get('newsletter/unsubscribe/{token}', [NewsletterController::class, 'unsubscribeByToken'])->name('newsletter.unsubscribe.token');
        Route::get('checkout/shipping-methods', [CheckoutController::class, 'shippingMethods'])->name('checkout.shipping-methods');
        Route::get('checkout/payment-methods', [CheckoutController::class, 'paymentMethods'])->name('checkout.payment-methods');
        Route::get('checkout/pickup-points', [PickupPointsController::class, 'index'])->name('checkout.pickup-points');
        Route::post('checkout', [CheckoutController::class, 'checkout'])->middleware('idempotent')->name('checkout');

        // Search
        Route::get('search', [SearchController::class, '__invoke'])->name('search');
        Route::get('search/autocomplete', [SearchController::class, 'autocomplete'])->name('search.autocomplete');
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

    // ── Authenticated ────────────────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:api.auth'])->group(function (): void {

        // Profile & GDPR
        Route::prefix('profile')->name('profile.')->group(function (): void {
            Route::get('/', [ProfileController::class, 'show'])->name('show');
            Route::put('/', [ProfileController::class, 'update'])->name('update');
            Route::put('password', [ProfileController::class, 'updatePassword'])->name('password');
            Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
            Route::get('export', [ProfileController::class, 'exportData'])->name('export');
        });

        // Addresses
        Route::apiResource('addresses', AddressController::class);
        Route::post('addresses/{address}/default', [AddressController::class, 'setDefault'])->name('addresses.default');

        // Wishlist
        Route::prefix('wishlist')->name('wishlist.')->group(function (): void {
            Route::get('/', [WishlistController::class, 'show'])->name('show');
            Route::post('items', [WishlistController::class, 'addItem'])->name('items.store');
            Route::delete('items/{variantId}', [WishlistController::class, 'removeItem'])->name('items.destroy');
        });

        // (checkout moved to public group below)

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
        });

        // Reviews
        Route::post('products/{slug}/reviews', [ReviewController::class, 'store'])->name('products.reviews.store');
        Route::post('reviews/{review}/helpful', [ReviewController::class, 'markHelpful'])->name('reviews.helpful');

        // Dashboard
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        // Blog comments + votes (auth required)
        Route::post('blog/posts/{slug}/comments', new ApiBlogCommentController()->store(...))->name('blog.posts.comments.store');
        Route::post('blog/posts/{slug}/vote', new ApiBlogPostController()->vote(...))->name('blog.posts.vote');

        // GUS / REGON company lookup
        Route::get('gus/nip/{nip}', [GusController::class, 'lookupByNip'])
            ->middleware('throttle:api.strict')
            ->name('gus.nip');
    });

    // ── Support (public + optional auth) ────────────────────────────────────
    Route::prefix('support')->name('support.')->group(function (): void {
        Route::post('conversations', [SupportController::class, 'store'])->name('conversations.store');
        Route::get('conversations/{token}', [SupportController::class, 'show'])->name('conversations.show');
        Route::post('conversations/{token}/messages', [SupportController::class, 'addMessage'])->name('conversations.messages.store');
    });
});
