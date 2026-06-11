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
use Illuminate\Support\Facades\Lang;
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

        // 1. Check if the message is a direct key under admin
        if (str_contains($message, '.') && Lang::has('admin.'.$message)) {
            return __('admin.'.$message);
        }

        if (Lang::has('admin.misc.'.$message)) {
            return __('admin.misc.'.$message);
        }

        // 2. Check if the message has a direct translation in flash group (e.g. 'flash.Settings saved')
        if (Lang::has('flash.'.$message)) {
            return __('flash.'.$message);
        }

        // 3. Dynamic Entity Pattern: "Entity created/updated/deleted [successfully]"
        if (preg_match('/^([A-Za-z\s]+) (created|updated|deleted)(?:\ssuccessfully)?\.?$/i', $message, $matches)) {
            $entity = mb_trim($matches[1]);
            $action = mb_strtolower($matches[2]);

            // Load translated entity from flash translations if available
            $translatedEntity = __('flash.entities.'.$entity);

            // If we found a valid translation (meaning it's not returning the key name)
            if ($translatedEntity !== 'flash.entities.'.$entity) {
                $locale = app()->getLocale();
                if ($locale === 'pl') {
                    $actionPl = [
                        'created' => 'został pomyślnie utworzony',
                        'updated' => 'został pomyślnie zaktualizowany',
                        'deleted' => 'został pomyślnie usunięty',
                    ];

                    // Gender adjustments for Polish
                    if (in_array($entity, ['Brand', 'Role', 'Currency', 'Shipping method'], true)) {
                        $actionPl = [
                            'created' => 'została pomyślnie utworzona',
                            'updated' => 'została pomyślnie zaktualizowana',
                            'deleted' => 'została pomyślnie usunięta',
                        ];
                    } elseif (in_array($entity, ['Order', 'Menu'], true)) {
                        $actionPl = [
                            'created' => 'zostało pomyślnie utworzone',
                            'updated' => 'zostało pomyślnie zaktualizowane',
                            'deleted' => 'zostało pomyślnie usunięte',
                        ];
                    }

                    return sprintf('%s %s.', $translatedEntity, $actionPl[$action]);
                }

                // For other locales (e.g. English), construct the standard string
                return sprintf('%s %s.', $translatedEntity, $action);
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
