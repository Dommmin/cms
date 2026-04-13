<?php

declare(strict_types=1);

use App\Http\Controllers\BlogFeedController;
use App\Http\Controllers\HealthCheckController;
use App\Http\Controllers\SeoController;
use Illuminate\Support\Facades\Route;

Route::get('/feed', BlogFeedController::class)->name('blog.feed');
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('robots.txt');
Route::get('/health', HealthCheckController::class)->name('health');

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
