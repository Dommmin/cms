<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\MetafieldController as AdminMetafieldController;
use App\Http\Controllers\Admin\MetafieldDefinitionController;
use Illuminate\Support\Facades\Route;

Route::resource('metafield-definitions', MetafieldDefinitionController::class)->except(['show']);
Route::post('metafields/{type}/{id}/sync', new AdminMetafieldController()->sync(...))->name('metafields.sync');
