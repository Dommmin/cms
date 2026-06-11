<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Locale;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $flashSuccess = $this->translateFlashMessage($request->session()->get('success'));
        $flashError = $this->translateFlashMessage($request->session()->get('error'));
        $activeTheme = Theme::query()
            ->where('is_active', true)
            ->first(['id', 'slug', 'tokens', 'typography', 'spacing', 'buttons', 'containers']);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'can' => [
                'manageUsers' => Gate::allows('viewAny', User::class),
            ],
            'flash' => [
                'success' => $flashSuccess,
                'error' => $flashError,
                'nonce' => ($flashSuccess || $flashError) ? Str::uuid()->toString() : null,
            ],
            'activeTheme' => $activeTheme ? [
                'id' => $activeTheme->id,
                'slug' => $activeTheme->slug,
                'tokens' => $activeTheme->tokens,
                'typography' => $activeTheme->typography,
                'spacing' => $activeTheme->spacing,
                'buttons' => $activeTheme->buttons,
                'containers' => $activeTheme->containers,
            ] : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'frontendUrl' => config('app.frontend_url', 'http://localhost:3000'),
            'locales' => Locale::getLocales(),
            'adminTranslations' => $this->loadAdminTranslations(),
            'modules' => config('modules'),
        ];
    }

    private function translateFlashMessage(?string $message): ?string
    {
        if (! $message) {
            return null;
        }

        // If the message is a direct key (contains dot or is defined as key)
        if (str_contains($message, '.') && \Illuminate\Support\Facades\Lang::has('admin.' . $message)) {
            return __('admin.' . $message);
        }
        
        if (\Illuminate\Support\Facades\Lang::has('admin.misc.' . $message)) {
            return __('admin.misc.' . $message);
        }

        // Exact match mapping
        $map = [
            'Settings saved' => 'admin.settings.saved',
            'Failed to save settings' => 'admin.settings.save_failed',
            'Category created' => 'admin.misc.category_created',
            'Category updated' => 'admin.misc.category_updated',
            'Category deleted' => 'admin.misc.category_deleted',
            'Blog category created successfully' => 'admin.misc.category_created',
            'Blog category updated successfully' => 'admin.misc.category_updated',
            'Blog category deleted successfully' => 'admin.misc.category_deleted',
            'Blog created successfully' => 'admin.misc.blog_post_created',
            'Blog updated successfully' => 'admin.misc.blog_post_updated',
            'Blog deleted successfully' => 'admin.misc.blog_post_deleted',
            'Blog post created successfully' => 'admin.misc.blog_post_created',
            'Blog post updated successfully' => 'admin.misc.blog_post_updated',
            'Blog post deleted successfully' => 'admin.misc.blog_post_deleted',
            'Draft saved successfully' => 'admin.misc.blog_post_saved',
            'Blog post published successfully' => 'admin.misc.blog_post_published',
            'Blog post unpublished successfully' => 'admin.misc.blog_post_unpublished',
            'Theme created successfully' => 'admin.misc.theme_created',
            'Theme updated successfully' => 'admin.misc.theme_updated',
            'Theme deleted successfully' => 'admin.misc.theme_deleted',
            'Theme activated' => 'admin.misc.theme_activated',
            'Custom theme disabled' => 'admin.misc.theme_disabled',
            'Theme duplicated' => 'admin.misc.theme_duplicated',
            'Translation created' => 'admin.misc.translation_created',
            'Translation updated' => 'admin.misc.translation_updated',
            'Translation deleted' => 'admin.misc.translation_deleted',
            'Translations synced from frontend files' => 'admin.misc.translations_synced',
            'Affiliate code created successfully.' => 'admin.misc.affiliate_code_created',
            'Affiliate code updated successfully.' => 'admin.misc.affiliate_code_updated',
            'Affiliate code deleted.' => 'admin.misc.affiliate_code_deleted',
            'Code activated.' => 'admin.misc.code_activated',
            'Code deactivated.' => 'admin.misc.code_deactivated',
        ];

        if (isset($map[$message])) {
            return __($map[$message]);
        }

        // Dynamic Entity Pattern: "Entity created/updated/deleted [successfully]"
        if (preg_match('/^([A-Za-z\s]+) (created|updated|deleted)(?:\ssuccessfully)?\.?$/i', $message, $matches)) {
            $entity = trim($matches[1]);
            $action = strtolower($matches[2]);

            $entitiesPl = [
                'Product' => 'Produkt',
                'Brand' => 'Marka',
                'Discount' => 'Rabat',
                'Store' => 'Sklep',
                'FAQ' => 'FAQ',
                'Role' => 'Rola',
                'User' => 'Użytkownik',
                'Currency' => 'Waluta',
                'Tax rate' => 'Stawka VAT',
                'Shipping method' => 'Metoda dostawy',
                'Exchange rate' => 'Kurs waluty',
                'Customer' => 'Klient',
                'Order' => 'Zamówienie',
                'Menu' => 'Menu',
                'Global block' => 'Blok globalny',
                'Slot' => 'Slot',
            ];

            $locale = app()->getLocale();
            if ($locale === 'pl' && isset($entitiesPl[$entity])) {
                $translatedEntity = $entitiesPl[$entity];
                
                $actionPl = [
                    'created' => 'został pomyślnie utworzony',
                    'updated' => 'został pomyślnie zaktualizowany',
                    'deleted' => 'został pomyślnie usunięty',
                ];

                // Gender adjustments for Polish
                if (in_array($entity, ['Brand', 'Role', 'Currency', 'Shipping method'])) {
                    $actionPl = [
                        'created' => 'została pomyślnie utworzona',
                        'updated' => 'została pomyślnie zaktualizowana',
                        'deleted' => 'została pomyślnie usunięta',
                    ];
                } elseif (in_array($entity, ['Order', 'Menu'])) {
                    $actionPl = [
                        'created' => 'zostało pomyślnie utworzone',
                        'updated' => 'zostało pomyślnie zaktualizowane',
                        'deleted' => 'zostało pomyślnie usunięte',
                    ];
                }

                return sprintf('%s %s.', $translatedEntity, $actionPl[$action]);
            }
        }

        return $message;
    }

    private function loadAdminTranslations(): array
    {
        return Cache::remember('admin_translations_v2', 3600, function (): array {
            $result = [];

            foreach (glob(lang_path('*/admin.php')) ?: [] as $file) {
                $locale = basename(dirname($file));
                $translations = require $file;
                $result[$locale] = Arr::dot($translations);
            }

            return $result;
        });
    }
}
