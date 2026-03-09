<?php

declare(strict_types=1);

use App\Http\Controllers\BlogFeedController;
use Illuminate\Support\Facades\Route;

Route::get('/feed', BlogFeedController::class)->name('blog.feed');

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
