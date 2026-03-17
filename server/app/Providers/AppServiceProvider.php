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

        $this->app->singleton(ShippingCarrierManager::class, function ($app) {
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

        $this->app->singleton(PaymentGatewayManager::class, function ($app) {
            return new PaymentGatewayManager([
                PaymentProviderEnum::P24->value => $app->make(P24Gateway::class),
                PaymentProviderEnum::PAYU->value => $app->make(PayUGateway::class),
                PaymentProviderEnum::CASH_ON_DELIVERY->value => new CashOnDeliveryGateway(),
                PaymentProviderEnum::BANK_TRANSFER->value => new BankTransferGateway(),
            ]);
        });
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
            $rows = cache()->remember('settings.mail', now()->addHour(), function () {
                return DB::table('settings')
                    ->where('group', 'mail')
                    ->pluck('value', 'key')
                    ->toArray();
            });

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
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
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
