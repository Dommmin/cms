<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AdminSearchController;
use App\Http\Controllers\Admin\AffiliateCodeController;
use App\Http\Controllers\Admin\AppNotificationController;
use App\Http\Controllers\Admin\BlockRelationController;
use App\Http\Controllers\Admin\CookieConsentController;
use App\Http\Controllers\Admin\CurrencyController;
use App\Http\Controllers\Admin\CustomReportController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DashboardWidgetController;
use App\Http\Controllers\Admin\Ecommerce\AddressController;
use App\Http\Controllers\Admin\Ecommerce\CartController;
use App\Http\Controllers\Admin\Ecommerce\WishlistController;
use App\Http\Controllers\Admin\ExchangeRateController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\FormController;
use App\Http\Controllers\Admin\FormSubmissionController;
use App\Http\Controllers\Admin\LocaleController;
use App\Http\Controllers\Admin\Marketing\AutomationController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\ModelVersionController;
use App\Http\Controllers\Admin\NewsletterCampaignController;
use App\Http\Controllers\Admin\NewsletterSegmentController;
use App\Http\Controllers\Admin\NewsletterSubscriberController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PreviewController;
use App\Http\Controllers\Admin\ReferralController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SearchAnalyticsController;
use App\Http\Controllers\Admin\SearchSynonymController;
use App\Http\Controllers\Admin\SectionTemplateController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\StoreController;
use App\Http\Controllers\Admin\SupportCannedResponseController;
use App\Http\Controllers\Admin\SupportConversationController;
use App\Http\Controllers\Admin\ThemeController;
use App\Http\Controllers\Admin\TranslationController as AdminTranslationController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WebhookController;
use App\Http\Middleware\AdminSessionTimeout;
use Illuminate\Support\Facades\Route;

Route::middleware(['admin', AdminSessionTimeout::class])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('dashboard/widgets', [DashboardWidgetController::class, 'store'])->name('dashboard.widgets.store');
    Route::patch('dashboard/widgets/{dashboardWidget}', [DashboardWidgetController::class, 'update'])->name('dashboard.widgets.update');
    Route::delete('dashboard/widgets/{dashboardWidget}', [DashboardWidgetController::class, 'destroy'])->name('dashboard.widgets.destroy');
    Route::post('dashboard/widgets/reset', [DashboardWidgetController::class, 'reset'])->name('dashboard.widgets.reset');

    // Custom Reports
    Route::resource('reports', CustomReportController::class);
    Route::get('reports/{report}/export', [CustomReportController::class, 'export'])->name('reports.export');
    Route::get('reports/{report}/export/excel', [CustomReportController::class, 'exportExcel'])->name('reports.export.excel');
    Route::get('reports/{report}/export/pdf', [CustomReportController::class, 'exportPdf'])->name('reports.export.pdf');
    Route::get('reports/filters/{dataSource}', [CustomReportController::class, 'getFilters'])->name('reports.filters');

    Route::get('/search', AdminSearchController::class)->name('search');
    Route::get('search/analytics', [SearchAnalyticsController::class, 'index'])->name('search.analytics');
    Route::resource('search/synonyms', SearchSynonymController::class)->names('search.synonyms')->parameters(['synonyms' => 'synonym']);
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/stream', [NotificationController::class, 'stream'])->name('notifications.stream');
    Route::get('/activity-log', [ActivityLogController::class, 'index'])->middleware('role:admin')->name('activity-log.index');
    Route::get('/preview', PreviewController::class)->name('preview');

    // Model Versioning
    Route::prefix('versions/{type}/{id}')->name('versions.')->group(function (): void {
        Route::get('/', [ModelVersionController::class, 'index'])->name('index');
        Route::get('/compare/{versionA}/{versionB}', [ModelVersionController::class, 'compare'])->name('compare');
        Route::post('/{versionNumber}/restore', [ModelVersionController::class, 'restore'])->name('restore');
    });

    // CMS admin routes
    require __DIR__.'/admin/cms.php';

    // Blog admin routes
    require __DIR__.'/admin/blog.php';

    // Ecommerce admin routes
    require __DIR__.'/admin/ecommerce.php';

    // Newsletter routes
    Route::prefix('newsletter')->name('newsletter.')->group(function (): void {
        Route::resource('subscribers', NewsletterSubscriberController::class)->except(['show']);
        Route::post('subscribers/bulk-activate', [NewsletterSubscriberController::class, 'bulkActivate'])->name('subscribers.bulk-activate');
        Route::post('subscribers/bulk-deactivate', [NewsletterSubscriberController::class, 'bulkDeactivate'])->name('subscribers.bulk-deactivate');
        Route::post('subscribers/bulk-delete', [NewsletterSubscriberController::class, 'bulkDelete'])->name('subscribers.bulk-delete');

        Route::resource('segments', NewsletterSegmentController::class)->except(['show']);
        Route::post('segments/bulk-activate', [NewsletterSegmentController::class, 'bulkActivate'])->name('segments.bulk-activate');
        Route::post('segments/bulk-deactivate', [NewsletterSegmentController::class, 'bulkDeactivate'])->name('segments.bulk-deactivate');

        Route::resource('campaigns', NewsletterCampaignController::class)->except(['show']);
        Route::post('campaigns/{campaign}/send', [NewsletterCampaignController::class, 'send'])->name('campaigns.send');
        Route::post('campaigns/{campaign}/schedule', [NewsletterCampaignController::class, 'schedule'])->name('campaigns.schedule');
        Route::post('campaigns/{campaign}/duplicate', [NewsletterCampaignController::class, 'duplicate'])->name('campaigns.duplicate');
    });

    // Marketing Automation
    Route::prefix('marketing')->name('marketing.')->group(function (): void {
        Route::get('automations', [AutomationController::class, 'index'])->name('automations.index');
        Route::get('automations/create', [AutomationController::class, 'create'])->name('automations.create');
        Route::post('automations', [AutomationController::class, 'store'])->name('automations.store');
        Route::get('automations/{automation}/edit', [AutomationController::class, 'edit'])->name('automations.edit');
        Route::put('automations/{automation}', [AutomationController::class, 'update'])->name('automations.update');
        Route::delete('automations/{automation}', [AutomationController::class, 'destroy'])->name('automations.destroy');
        Route::post('automations/{automation}/toggle', [AutomationController::class, 'toggle'])->name('automations.toggle');
    });

    // Currency & Exchange Rates (admin only)
    Route::middleware('role:admin')->group(function (): void {
        Route::resource('currencies', CurrencyController::class)->except(['show']);
        Route::resource('exchange-rates', ExchangeRateController::class)->except(['show']);
    });

    // Ważne - CMS & System
    Route::resource('menus', MenuController::class);
    Route::post('menus/{menu}/duplicate', [MenuController::class, 'duplicate'])->name('menus.duplicate');

    Route::resource('themes', ThemeController::class);
    Route::post('themes/{theme}/activate', [ThemeController::class, 'activate'])->name('themes.activate');
    Route::post('themes/disable', [ThemeController::class, 'disable'])->name('themes.disable');
    Route::post('themes/{theme}/duplicate', [ThemeController::class, 'duplicate'])->name('themes.duplicate');

    Route::resource('notifications', AppNotificationController::class)->only(['index', 'show', 'create', 'store', 'destroy']);
    Route::post('notifications/bulk-delete', [AppNotificationController::class, 'bulkDelete'])->name('notifications.bulk-delete');
    Route::post('notifications/{notification}/resend', [AppNotificationController::class, 'resend'])->name('notifications.resend');

    Route::resource('stores', StoreController::class)->except(['show']);
    Route::post('stores/{store}/toggle-active', [StoreController::class, 'toggleActive'])->name('stores.toggle-active');

    Route::resource('faqs', FaqController::class)->except(['show']);
    Route::post('faqs/{faq}/toggle-active', [FaqController::class, 'toggleActive'])->name('faqs.toggle-active');
    Route::post('faqs/reorder', [FaqController::class, 'reorder'])->name('faqs.reorder');

    Route::resource('section-templates', SectionTemplateController::class)->except(['show']);
    Route::post('section-templates/{sectionTemplate}/duplicate', [SectionTemplateController::class, 'duplicate'])->name('section-templates.duplicate');

    // Opcjonalne - Read only / relacje
    Route::prefix('ecommerce')->name('ecommerce.')->group(function (): void {
        // Carts (read-only)
        Route::resource('carts', CartController::class)->only(['index', 'show']);

        // Wishlists (read-only)
        Route::resource('wishlists', WishlistController::class)->only(['index', 'show']);

        // Customer Addresses (nested)
        Route::resource('customers.addresses', AddressController::class)->except(['show']);
        Route::post('customers/{customer}/addresses/{address}/set-default', [AddressController::class, 'setDefault'])->name('customers.addresses.set-default');
    });

    // Cookie Consents (read-only, admin only)
    Route::resource('cookie-consents', CookieConsentController::class)->only(['index', 'show'])->middleware('role:admin');

    // Users (admin only)
    Route::middleware('role:admin')->group(function (): void {
        Route::resource('users', UserController::class)
            ->except(['show'])
            ->names([
                'create' => 'users.create',
                'edit' => 'users.edit',
            ]);
        Route::prefix('users')->name('users.')->group(function (): void {
            Route::get('trashed', [UserController::class, 'trashed'])->name('trashed');
            Route::post('{user}/restore', [UserController::class, 'restore'])
                ->name('restore')->withTrashed();
            Route::delete('{user}/force-delete', [UserController::class, 'forceDelete'])
                ->name('force-delete')->withTrashed();
        });

        Route::resource('roles', RoleController::class)->only(['index', 'edit', 'update']);
    });
    Route::resource('media', MediaController::class)
        ->except(['show', 'edit'])
        ->names([
            'create' => 'media.create',
            'edit' => 'media.edit',
        ]);

    Route::get('media/search', [MediaController::class, 'search'])
        ->name('media.search');

    Route::post('media/upload', [MediaController::class, 'upload'])
        ->name('media.upload');

    Route::get('block-relations/search', [BlockRelationController::class, 'search'])
        ->name('block-relations.search');

    Route::resource('forms', FormController::class)
        ->except(['show'])
        ->names([
            'create' => 'forms.create',
            'edit' => 'forms.edit',
        ]);

    Route::get('forms/{form}/submissions', [FormSubmissionController::class, 'index'])->name('forms.submissions.index');
    Route::get('forms/{form}/submissions/{submission}', [FormSubmissionController::class, 'show'])->name('forms.submissions.show');
    Route::delete('forms/{form}/submissions/{submission}', [FormSubmissionController::class, 'destroy'])->name('forms.submissions.destroy');

    // Settings (admin only)
    Route::middleware('role:admin')->group(function (): void {
        Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::put('settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::post('settings/mail/test', [SettingsController::class, 'testMail'])->name('settings.mail.test');
    });

    // i18n — Locales & Translations
    Route::resource('locales', LocaleController::class)->except(['show', 'create', 'edit']);
    Route::post('locales/{locale}/set-default', [LocaleController::class, 'setDefault'])->name('locales.set-default');
    Route::post('translations/sync', new AdminTranslationController()->sync(...))->name('translations.sync');
    Route::resource('translations', AdminTranslationController::class)->except(['show', 'create', 'edit']);

    // Affiliates & Referrals (admin only)
    Route::prefix('affiliates')->name('affiliates.')->middleware('role:admin')->group(function (): void {
        Route::resource('codes', AffiliateCodeController::class)->except(['show']);
        Route::post('codes/{code}/toggle-active', [AffiliateCodeController::class, 'toggleActive'])->name('codes.toggle-active');

        Route::get('referrals', [ReferralController::class, 'index'])->name('referrals.index');
        Route::post('referrals/{referral}/approve', [ReferralController::class, 'approve'])->name('referrals.approve');
        Route::post('referrals/{referral}/mark-paid', [ReferralController::class, 'markPaid'])->name('referrals.mark-paid');
        Route::post('referrals/{referral}/cancel', [ReferralController::class, 'cancel'])->name('referrals.cancel');
        Route::post('referrals/bulk-mark-paid', [ReferralController::class, 'bulkMarkPaid'])->name('referrals.bulk-mark-paid');
    });

    // Outgoing Webhooks
    Route::resource('webhooks', WebhookController::class)->except(['show']);
    Route::get('webhooks/{webhook}/deliveries', [WebhookController::class, 'deliveries'])->name('webhooks.deliveries');
    Route::post('webhooks/{webhook}/test', [WebhookController::class, 'test'])->name('webhooks.test');

    // Editor playground
    Route::get('editor', fn () => inertia('admin/editor'))->name('editor');

    // Support
    Route::prefix('support')->name('support.')->group(function (): void {
        Route::get('/', [SupportConversationController::class, 'index'])->name('index');

        Route::resource('canned-responses', SupportCannedResponseController::class)
            ->except(['show'])
            ->names([
                'index' => 'canned-responses.index',
                'create' => 'canned-responses.create',
                'store' => 'canned-responses.store',
                'edit' => 'canned-responses.edit',
                'update' => 'canned-responses.update',
                'destroy' => 'canned-responses.destroy',
            ]);

        Route::get('{conversation}', [SupportConversationController::class, 'show'])->name('show');
        Route::post('{conversation}/reply', [SupportConversationController::class, 'reply'])->name('reply');
        Route::post('{conversation}/assign', [SupportConversationController::class, 'assign'])->name('assign');
        Route::post('{conversation}/status', [SupportConversationController::class, 'changeStatus'])->name('status');
        Route::delete('{conversation}', [SupportConversationController::class, 'destroy'])->name('destroy');
    });
});
