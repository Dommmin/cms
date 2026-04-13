<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AddressController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\EmailVerificationController;
use App\Http\Controllers\Api\V1\Auth\SocialLoginController;
use App\Http\Controllers\Api\V1\Blog\BlogCategoryController as ApiBlogCategoryController;
use App\Http\Controllers\Api\V1\Blog\BlogCommentController as ApiBlogCommentController;
use App\Http\Controllers\Api\V1\Blog\BlogPostController as ApiBlogPostController;
use App\Http\Controllers\Api\V1\ConsentController;
use App\Http\Controllers\Api\V1\FaqController;
use App\Http\Controllers\Api\V1\FormController;
use App\Http\Controllers\Api\V1\LocaleController as ApiLocaleController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\NotificationCenterController;
use App\Http\Controllers\Api\V1\NotificationPreferenceController;
use App\Http\Controllers\Api\V1\PageController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\StoreController as ApiStoreController;
use App\Http\Controllers\Api\V1\SupportController;
use App\Http\Controllers\Api\V1\TranslationController;
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
        Route::get('faqs', [FaqController::class, 'index'])->name('faqs.index');
        Route::get('stores', new ApiStoreController()->index(...))->name('stores.index');
        Route::get('stores/{store}', new ApiStoreController()->show(...))->name('stores.show');

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
        Route::get('consent', [ConsentController::class, 'index'])->name('consent.index');
        Route::post('consent', [ConsentController::class, 'store'])->name('consent.store');
        Route::delete('consent/{category}', [ConsentController::class, 'withdraw'])->name('consent.withdraw');
    });

    // ── Authenticated core ───────────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:api.auth'])->group(function (): void {

        // Profile & GDPR
        Route::prefix('profile')->name('profile.')->group(function (): void {
            Route::get('/', [ProfileController::class, 'show'])->name('show');
            Route::put('/', [ProfileController::class, 'update'])->name('update');
            Route::put('password', [ProfileController::class, 'updatePassword'])->name('password');
            Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
            Route::get('export', [ProfileController::class, 'exportData'])->name('export');
            Route::post('restrict-processing', [ProfileController::class, 'restrictProcessing'])->name('restrict-processing');
            Route::delete('restrict-processing', [ProfileController::class, 'liftProcessingRestriction'])->name('lift-processing-restriction');
        });

        // Addresses
        Route::apiResource('addresses', AddressController::class);
        Route::post('addresses/{address}/default', [AddressController::class, 'setDefault'])->name('addresses.default');

        // Blog comments + votes (auth required)
        Route::post('blog/posts/{slug}/comments', new ApiBlogCommentController()->store(...))->name('blog.posts.comments.store');
        Route::post('blog/posts/{slug}/vote', new ApiBlogPostController()->vote(...))->name('blog.posts.vote');

        // Notification center (in-app notifications)
        Route::prefix('notifications')->name('notifications.')->group(function (): void {
            Route::get('/', [NotificationCenterController::class, 'index'])->name('index');
            Route::get('unread-count', [NotificationCenterController::class, 'unreadCount'])->name('unread-count');
            Route::post('read-all', [NotificationCenterController::class, 'markAllRead'])->name('read-all');
            Route::post('{notification}/read', [NotificationCenterController::class, 'markRead'])->name('read');
        });

        // Notification preferences
        Route::get('notification-preferences', [NotificationPreferenceController::class, 'index'])->name('notification-preferences.index');
        Route::put('notification-preferences', [NotificationPreferenceController::class, 'update'])->name('notification-preferences.update');
    });

    // ── Support (public + optional auth) ────────────────────────────────────
    Route::prefix('support')->name('support.')->group(function (): void {
        Route::post('conversations', [SupportController::class, 'store'])->name('conversations.store');
        Route::get('conversations/{token}', [SupportController::class, 'show'])->name('conversations.show');
        Route::post('conversations/{token}/messages', [SupportController::class, 'addMessage'])->name('conversations.messages.store');
    });
});
