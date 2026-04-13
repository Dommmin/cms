<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\NewsletterController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->middleware('throttle:api.public')->group(function (): void {
    Route::post('newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
    Route::post('newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');
    Route::get('newsletter/confirm/{token}', [NewsletterController::class, 'confirmSubscription'])->name('newsletter.confirm');
    Route::get('newsletter/unsubscribe/{token}', [NewsletterController::class, 'unsubscribeByToken'])->name('newsletter.unsubscribe.token');
});
