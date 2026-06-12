<?php

declare(strict_types=1);

use App\Http\Controllers\BlogFeedController;
use App\Http\Controllers\HealthCheckController;
use Illuminate\Support\Facades\Route;

Route::get('/debug-glitchtip', function (): void {
    abort_unless(app()->environment('local', 'testing', 'staging'), 404);

    throw new Exception('Test GlitchTip error!');
});

Route::get('/feed', BlogFeedController::class)->name('blog.feed');
Route::get('/health', HealthCheckController::class)->name('health');

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
