<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\BlogCategoryController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\BlogPostController;
use Illuminate\Support\Facades\Route;

Route::resource('blogs', BlogController::class)->except(['show']);

Route::prefix('blog')->name('blog.')->group(function (): void {
    Route::resource('posts', BlogPostController::class)->except(['show']);
    Route::post('posts/{post}/publish', [BlogPostController::class, 'publish'])->name('posts.publish');
    Route::post('posts/{post}/unpublish', [BlogPostController::class, 'unpublish'])->name('posts.unpublish');
    Route::post('posts/{post}/toggle-featured', [BlogPostController::class, 'toggleFeatured'])->name('posts.toggle-featured');

    Route::resource('categories', BlogCategoryController::class)->except(['show']);
});
