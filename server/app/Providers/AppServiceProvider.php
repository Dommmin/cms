<?php

declare(strict_types=1);

namespace App\Providers;

use App\Enums\PaymentProviderEnum;
use App\Enums\ShippingCarrierEnum;
use App\Infrastructure\Payments\BankTransferGateway;
use App\Infrastructure\Payments\CashOnDeliveryGateway;
use App\Infrastructure\Payments\P24\P24Client;
use App\Infrastructure\Payments\P24\P24Gateway;
use App\Infrastructure\Payments\P24\P24SignatureService;
use App\Infrastructure\Payments\PayU\PayUClient;
use App\Infrastructure\Payments\PayU\PayUGateway;
use App\Infrastructure\Payments\PayU\PayUTokenService;
use App\Infrastructure\Payments\PayU\PayUWebhookVerifier;
use App\Infrastructure\Shipping\Furgonetka\FurgonetkaCarrier;
use App\Infrastructure\Shipping\Furgonetka\FurgonetkaClient;
use App\Infrastructure\Shipping\Furgonetka\FurgonetkaTokenService;
use App\Infrastructure\Shipping\InPost\InPostClient;
use App\Infrastructure\Shipping\InPost\InPostLockerCarrier;
use App\Infrastructure\Shipping\PickupCarrier;
use App\Models\Category;
use App\Models\NewsletterClick;
use App\Models\NewsletterSubscriber;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Wishlist;
use App\Observers\CategoryObserver;
use App\Observers\NewsletterClickObserver;
use App\Observers\NewsletterSubscriberObserver;
use App\Observers\PageObserver;
use App\Observers\ProductObserver;
use App\Observers\ProductVariantPriceObserver;
use App\Observers\WishlistObserver;
use App\Services\PaymentGatewayManager;
use App\Services\ShippingCarrierManager;
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
        $this->app->singleton(PayUTokenService::class);
        $this->app->singleton(PayUClient::class);
        $this->app->singleton(PayUWebhookVerifier::class);
        $this->app->singleton(PayUGateway::class);
        $this->app->singleton(P24SignatureService::class);
        $this->app->singleton(P24Client::class);
        $this->app->singleton(P24Gateway::class);

        $this->app->singleton(FurgonetkaTokenService::class);
        $this->app->singleton(FurgonetkaClient::class);
        $this->app->singleton(InPostClient::class);
        $this->app->singleton(InPostLockerCarrier::class);

        $this->app->singleton(function ($app): ShippingCarrierManager {
            $furgonetka = $app->make(FurgonetkaClient::class);

            return new ShippingCarrierManager([
                ShippingCarrierEnum::DPD->value => new FurgonetkaCarrier($furgonetka, 'dpd_classic'),
                ShippingCarrierEnum::DPD_PICKUP->value => new FurgonetkaCarrier($furgonetka, 'dpd_pickup'),
                ShippingCarrierEnum::DHL->value => new FurgonetkaCarrier($furgonetka, 'dhl_parcel'),
                ShippingCarrierEnum::DHL_SERVICEPOINT->value => new FurgonetkaCarrier($furgonetka, 'dhl_servicepoint'),
                ShippingCarrierEnum::GLS->value => new FurgonetkaCarrier($furgonetka, 'gls_business'),
                ShippingCarrierEnum::INPOST->value => new FurgonetkaCarrier($furgonetka, 'inpost_kurier'),
                ShippingCarrierEnum::INPOST_LOCKER->value => $app->make(InPostLockerCarrier::class),
                ShippingCarrierEnum::PICKUP->value => new PickupCarrier(),
            ]);
        });

        $this->app->singleton(fn ($app): PaymentGatewayManager => new PaymentGatewayManager([
            PaymentProviderEnum::P24->value => $app->make(P24Gateway::class),
            PaymentProviderEnum::PAYU->value => $app->make(PayUGateway::class),
            PaymentProviderEnum::CASH_ON_DELIVERY->value => new CashOnDeliveryGateway(),
            PaymentProviderEnum::BANK_TRANSFER->value => new BankTransferGateway(),
        ]));
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
        $this->configurePaymentsFromSettings();
        $this->configureShippingFromSettings();
        $this->configureIntegrationsFromSettings();
        $this->registerObservers();
    }

    protected function registerObservers(): void
    {
        Product::observe(ProductObserver::class);
        ProductVariant::observe(ProductVariantPriceObserver::class);
        Category::observe(CategoryObserver::class);
        Page::observe(PageObserver::class);
        Wishlist::observe(WishlistObserver::class);
        NewsletterSubscriber::observe(NewsletterSubscriberObserver::class);
        NewsletterClick::observe(NewsletterClickObserver::class);
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
     * Override payment gateway config with values stored in admin panel settings.
     * Cached for 1 hour; flushed automatically when settings are saved.
     */
    protected function configurePaymentsFromSettings(): void
    {
        try {
            $rows = cache()->remember('settings.payments', now()->addHour(), fn () => DB::table('settings')
                ->where('group', 'payments')
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

            // PayU
            if ($v = $decode($rows['payu_client_id'] ?? null)) {
                config(['services.payu.client_id' => $v]);
            }

            if ($v = $decrypt($decode($rows['payu_client_secret'] ?? null))) {
                config(['services.payu.client_secret' => $v]);
            }

            if ($v = $decode($rows['payu_pos_id'] ?? null)) {
                config(['services.payu.pos_id' => $v]);
            }

            if ($v = $decrypt($decode($rows['payu_md5_key'] ?? null))) {
                config(['services.payu.md5_key' => $v]);
            }

            $payuSandbox = $decode($rows['payu_sandbox'] ?? null) ?? true;
            config([
                'services.payu.base_url' => $payuSandbox ? 'https://sandbox.snd.payu.com' : 'https://secure.payu.com',
                'services.payu.oauth_url' => $payuSandbox ? 'https://secure.snd.payu.com' : 'https://secure.payu.com',
            ]);

            // P24
            if ($v = $decode($rows['p24_merchant_id'] ?? null)) {
                config(['services.p24.merchant_id' => $v]);
            }

            if ($v = $decode($rows['p24_pos_id'] ?? null)) {
                config(['services.p24.pos_id' => $v]);
            }

            if ($v = $decrypt($decode($rows['p24_crc'] ?? null))) {
                config(['services.p24.crc' => $v]);
            }

            if ($v = $decrypt($decode($rows['p24_api_key'] ?? null))) {
                config(['services.p24.api_key' => $v]);
            }

            $p24Sandbox = $decode($rows['p24_sandbox'] ?? null) ?? true;
            config(['services.p24.base_url' => $p24Sandbox ? 'https://sandbox.przelewy24.pl' : 'https://secure.przelewy24.pl']);

            // Bank Transfer
            foreach (['account_name', 'iban', 'swift', 'bank_name'] as $field) {
                if ($v = $decode($rows['bank_transfer_'.$field] ?? null)) {
                    config(['services.bank_transfer.'.$field => $v]);
                }
            }
        } catch (Throwable) {
            // Graceful degradation — DB unavailable during artisan migrate etc.
        }
    }

    /**
     * Override shipping carrier config with values stored in admin panel settings.
     * Cached for 1 hour; flushed automatically when settings are saved.
     */
    protected function configureShippingFromSettings(): void
    {
        try {
            $rows = cache()->remember('settings.shipping', now()->addHour(), fn () => DB::table('settings')
                ->where('group', 'shipping')
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

            // Furgonetka credentials
            if ($v = $decode($rows['furgonetka_client_id'] ?? null)) {
                config(['services.furgonetka.client_id' => $v]);
            }

            if ($v = $decrypt($decode($rows['furgonetka_client_secret'] ?? null))) {
                config(['services.furgonetka.client_secret' => $v]);
            }

            // Furgonetka sender details
            $senderFields = ['name', 'email', 'phone', 'street', 'city', 'postal_code', 'country_code'];
            foreach ($senderFields as $field) {
                if ($v = $decode($rows['furgonetka_sender_'.$field] ?? null)) {
                    config(['services.furgonetka.sender_'.$field => $v]);
                }
            }

            // InPost
            if ($v = $decrypt($decode($rows['inpost_shipx_token'] ?? null))) {
                config(['services.inpost_shipx.token' => $v]);
            }

            if ($v = $decode($rows['inpost_shipx_organization_id'] ?? null)) {
                config(['services.inpost_shipx.organization_id' => $v]);
            }

            if ($v = $decode($rows['inpost_geowidget_token'] ?? null)) {
                config(['services.inpost_shipx.geowidget_token' => $v]);
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
