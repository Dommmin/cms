<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Page;
use App\Observers\PageObserver;
use App\Services\PushNotificationService;
use Carbon\CarbonImmutable;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Throwable;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Push notifications — registered here as it is a cross-cutting concern
        // used by both ecommerce and newsletter modules.
        $this->app->singleton(PushNotificationService::class, fn (): PushNotificationService => new PushNotificationService(
            publicKey: config('services.vapid.public_key', ''),
            privateKey: config('services.vapid.private_key', ''),
        ));

        // ── Domain module providers ─────────────────────────────────────────
        // Each provider self-registers its routes, observers, and bindings.
        // Disable modules via MODULE_* env variables (see config/modules.php).

        if (config('modules.ecommerce')) {
            $this->app->register(EcommerceServiceProvider::class);
        }

        if (config('modules.newsletter')) {
            $this->app->register(NewsletterServiceProvider::class);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (App::environment('local')) {
            Model::shouldBeStrict();
        }

        Vite::prefetch(concurrency: 3);

        $this->configureDefaults();
        $this->configureRateLimiting();
        $this->configureScramble();
        $this->configureMailFromSettings();
        $this->configureIntegrationsFromSettings();
        $this->registerObservers();
    }

    protected function registerObservers(): void
    {
        // Core CMS observers only — ecommerce and newsletter observers
        // are registered by their respective ServiceProviders.
        Page::observe(PageObserver::class);
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api.strict', fn (Request $r) => Limit::perMinute(10)->by($r->ip())
            ->response(fn () => response()->json(['message' => 'Too many attempts. Please wait.'], 429))
        );

        RateLimiter::for('api.public', fn (Request $r) => Limit::perMinute(60)->by($r->ip()));

        RateLimiter::for('api.auth', fn (Request $r) => Limit::perMinute(300)->by($r->user()?->id ?: $r->ip()));
    }

    protected function configureScramble(): void
    {
        Scramble::configure()
            ->withDocumentTransformers(function (OpenApi $openApi): void {
                $openApi->secure(SecurityScheme::http('bearer'));
            });
    }

    /**
     * Override mail config with values stored in the admin panel settings.
     * Cached in Redis/cache for 1 hour to avoid a DB hit on every request.
     * The cache is flushed automatically when settings are saved.
     */
    protected function configureMailFromSettings(): void
    {
        try {
            $rows = cache()->remember('settings.mail', now()->addHour(), fn () => DB::table('settings')
                ->where('group', 'mail')
                ->pluck('value', 'key')
                ->toArray());

            if (empty($rows)) {
                return;
            }

            $decode = fn (?string $v): mixed => $v !== null ? json_decode($v, true) : null;

            $driver = $decode($rows['mail_driver'] ?? null);
            $host = $decode($rows['mail_host'] ?? null);
            $port = $decode($rows['mail_port'] ?? null);
            $encryption = $decode($rows['mail_encryption'] ?? null);
            $username = $decode($rows['mail_username'] ?? null);
            $password = $decode($rows['mail_password'] ?? null);
            $fromAddress = $decode($rows['mail_from_address'] ?? null);
            $fromName = $decode($rows['mail_from_name'] ?? null);

            if ($password) {
                try {
                    $password = Crypt::decryptString($password);
                } catch (Throwable) {
                    $password = null;
                }
            }

            if ($driver) {
                config(['mail.default' => $driver]);
            }

            // Only apply SMTP settings when using an SMTP-based driver
            if ($driver && ! in_array($driver, ['log', 'array', 'null'], true)) {
                if ($host) {
                    config(['mail.mailers.smtp.host' => $host]);
                }

                if ($port) {
                    config(['mail.mailers.smtp.port' => $port]);
                }

                if ($encryption !== null) {
                    config(['mail.mailers.smtp.encryption' => $encryption ?: null]);
                }

                if ($username) {
                    config(['mail.mailers.smtp.username' => $username]);
                }

                if ($password) {
                    config(['mail.mailers.smtp.password' => $password]);
                }
            }

            if ($fromAddress) {
                config(['mail.from.address' => $fromAddress]);
            }

            if ($fromName) {
                config(['mail.from.name' => $fromName]);
            }
        } catch (Throwable) {
            // Graceful degradation — DB unavailable during artisan migrate etc.
        }
    }

    /**
     * Override third-party integrations config with values stored in admin panel settings.
     * Cached for 1 hour; flushed automatically when settings are saved.
     */
    protected function configureIntegrationsFromSettings(): void
    {
        try {
            $rows = cache()->remember('settings.integrations', now()->addHour(), fn () => DB::table('settings')
                ->where('group', 'integrations')
                ->pluck('value', 'key')
                ->toArray());

            if (empty($rows)) {
                return;
            }

            $decode = fn (?string $v): mixed => $v !== null ? json_decode($v, true) : null;
            $decrypt = function (?string $v): ?string {
                if (! $v) {
                    return null;
                }

                try {
                    return Crypt::decryptString($v);
                } catch (Throwable) {
                    return null;
                }
            };

            // Google OAuth (Socialite)
            if ($v = $decode($rows['google_client_id'] ?? null)) {
                config(['services.google.client_id' => $v]);
            }

            if ($v = $decrypt($decode($rows['google_client_secret'] ?? null))) {
                config(['services.google.client_secret' => $v]);
            }

            // GitHub OAuth (Socialite)
            if ($v = $decode($rows['github_client_id'] ?? null)) {
                config(['services.github.client_id' => $v]);
            }

            if ($v = $decrypt($decode($rows['github_client_secret'] ?? null))) {
                config(['services.github.client_secret' => $v]);
            }

            // Cloudflare Turnstile
            if ($v = $decrypt($decode($rows['cloudflare_turnstile_secret_key'] ?? null))) {
                config(['services.cloudflare.turnstile_secret' => $v]);
            }

            if ($v = $decrypt($decode($rows['cloudflare_turnstile_site_key'] ?? null))) {
                config(['services.cloudflare.turnstile_site' => $v]);
            }

            // Stripe
            if ($v = $decode($rows['stripe_public_key'] ?? null)) {
                config(['services.stripe.key' => $v]);
            }

            if ($v = $decrypt($decode($rows['stripe_secret_key'] ?? null))) {
                config(['services.stripe.secret' => $v]);
            }

            if ($v = $decrypt($decode($rows['stripe_webhook_secret'] ?? null))) {
                config(['services.stripe.webhook_secret' => $v]);
            }

            // MailerLite
            if ($v = $decrypt($decode($rows['mailerlite_api_key'] ?? null))) {
                config(['services.mailerlite.api_key' => $v]);
            }

            if ($v = $decode($rows['mailerlite_group_id'] ?? null)) {
                config(['services.mailerlite.group_id' => $v]);
            }
        } catch (Throwable) {
            // Graceful degradation — DB unavailable during artisan migrate etc.
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        JsonResource::withoutWrapping();

        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
