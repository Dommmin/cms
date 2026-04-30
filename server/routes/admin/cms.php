<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\Cms\PageApprovalController;
use App\Http\Controllers\Admin\Cms\PageBuilderController;
use App\Http\Controllers\Admin\Cms\PageController;
use App\Http\Controllers\Admin\Cms\ReusableBlockController;
use App\Http\Controllers\Admin\Cms\SectionTemplateController;
use Illuminate\Support\Facades\Route;

Route::prefix('cms')->name('cms.')->group(function (): void {
    Route::post('pages/clone-site', [PageController::class, 'cloneSite'])->name('pages.clone-site');
    Route::resource('pages', PageController::class)->except(['show'])
        ->names([
            'create' => 'pages.create',
            'edit' => 'pages.edit',
        ]);
    Route::post('pages/{page}/duplicate', [PageController::class, 'duplicate'])->name('pages.duplicate');
    Route::post('pages/{page}/publish', [PageController::class, 'publish'])->name('pages.publish');
    Route::post('pages/{page}/unpublish', [PageController::class, 'unpublish'])->name('pages.unpublish');
    Route::post('pages/{page}/submit-for-review', [PageApprovalController::class, 'submitForReview'])->name('pages.submit-for-review');
    Route::post('pages/{page}/approve', [PageApprovalController::class, 'approve'])->name('pages.approve');
    Route::post('pages/{page}/reject', [PageApprovalController::class, 'reject'])->name('pages.reject');

    // Reusable (Global) Blocks
    Route::get('reusable-blocks/library', [ReusableBlockController::class, 'library'])->name('reusable-blocks.library');
    Route::resource('reusable-blocks', ReusableBlockController::class)->except(['create', 'edit', 'show'])
        ->names([
            'index' => 'reusable-blocks.index',
            'store' => 'reusable-blocks.store',
            'update' => 'reusable-blocks.update',
            'destroy' => 'reusable-blocks.destroy',
        ]);
    Route::get('reusable-blocks/{reusableBlock}', [ReusableBlockController::class, 'show'])->name('reusable-blocks.show');

    // Page Builder
    Route::get('pages/{page}/preview-url', [PageBuilderController::class, 'previewUrl'])->name('pages.builder.preview-url');
    Route::get('pages/{page}/builder', [PageBuilderController::class, 'show'])->name('pages.builder');
    Route::put('pages/{page}/builder', [PageBuilderController::class, 'update'])->name('pages.builder.update');
    Route::put('pages/{page}/builder/schedule', [PageBuilderController::class, 'schedule'])->name('pages.builder.schedule');
    Route::get('pages/{page}/builder/export', [PageBuilderController::class, 'export'])->name('pages.builder.export');
    Route::post('pages/{page}/builder/import', [PageBuilderController::class, 'import'])->name('pages.builder.import');
    Route::post('pages/{page}/builder/sections', [PageBuilderController::class, 'addSection'])->name('pages.builder.sections.add');
    Route::put('pages/{page}/builder/sections/{section}', [PageBuilderController::class, 'updateSection'])->name('pages.builder.sections.update');
    Route::delete('pages/{page}/builder/sections/{section}', [PageBuilderController::class, 'deleteSection'])->name('pages.builder.sections.delete');
    Route::post('pages/{page}/builder/sections/{section}/blocks', [PageBuilderController::class, 'addBlock'])->name('pages.builder.blocks.add');
    Route::put('pages/{page}/builder/sections/{section}/blocks/{block}', [PageBuilderController::class, 'updateBlock'])->name('pages.builder.blocks.update');
    Route::delete('pages/{page}/builder/sections/{section}/blocks/{block}', [PageBuilderController::class, 'deleteBlock'])->name('pages.builder.blocks.delete');

    // Section Templates
    Route::get('section-templates', [SectionTemplateController::class, 'index'])->name('section-templates.index');
    Route::post('section-templates', [SectionTemplateController::class, 'store'])->name('section-templates.store');
    Route::delete('section-templates/{sectionTemplate}', [SectionTemplateController::class, 'destroy'])->name('section-templates.destroy');
    Route::post('section-templates/{sectionTemplate}/use', [SectionTemplateController::class, 'incrementUsage'])->name('section-templates.use');
});
