<?php

declare(strict_types=1);

namespace App\Providers;

use App\Enums\PaymentProviderEnum;
use App\Enums\ShippingCarrierEnum;
use App\Events\OrderShipped;
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
use App\Listeners\SendShippingNotification;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Wishlist;
use App\Observers\CategoryObserver;
use App\Observers\ProductObserver;
use App\Observers\ProductVariantPriceObserver;
use App\Observers\WishlistObserver;
use App\Services\PaymentGatewayManager;
use App\Services\ShippingCarrierManager;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Throwable;

class EcommerceServiceProvider extends ServiceProvider
{
    /**
     * Register payment and shipping bindings.
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

        $this->app->singleton(fn ($app): ShippingCarrierManager => new ShippingCarrierManager([
            ShippingCarrierEnum::DPD->value => new FurgonetkaCarrier($app->make(FurgonetkaClient::class), 'dpd_classic'),
            ShippingCarrierEnum::DPD_PICKUP->value => new FurgonetkaCarrier($app->make(FurgonetkaClient::class), 'dpd_pickup'),
            ShippingCarrierEnum::DHL->value => new FurgonetkaCarrier($app->make(FurgonetkaClient::class), 'dhl_parcel'),
            ShippingCarrierEnum::DHL_SERVICEPOINT->value => new FurgonetkaCarrier($app->make(FurgonetkaClient::class), 'dhl_servicepoint'),
            ShippingCarrierEnum::GLS->value => new FurgonetkaCarrier($app->make(FurgonetkaClient::class), 'gls_business'),
            ShippingCarrierEnum::INPOST->value => new FurgonetkaCarrier($app->make(FurgonetkaClient::class), 'inpost_kurier'),
            ShippingCarrierEnum::INPOST_LOCKER->value => $app->make(InPostLockerCarrier::class),
            ShippingCarrierEnum::PICKUP->value => new PickupCarrier(),
        ]));

        $this->app->singleton(fn ($app): PaymentGatewayManager => new PaymentGatewayManager([
            PaymentProviderEnum::P24->value => $app->make(P24Gateway::class),
            PaymentProviderEnum::PAYU->value => $app->make(PayUGateway::class),
            PaymentProviderEnum::CASH_ON_DELIVERY->value => new CashOnDeliveryGateway(),
            PaymentProviderEnum::BANK_TRANSFER->value => new BankTransferGateway(),
        ]));
    }

    /**
     * Bootstrap e-commerce observers, event listeners, settings and routes.
     */
    public function boot(): void
    {
        $this->registerObservers();
        $this->registerEventListeners();
        $this->configurePaymentsFromSettings();
        $this->configureShippingFromSettings();
        $this->loadRoutes();
    }

    protected function registerObservers(): void
    {
        Product::observe(ProductObserver::class);
        ProductVariant::observe(ProductVariantPriceObserver::class);
        Category::observe(CategoryObserver::class);
        Wishlist::observe(WishlistObserver::class);
    }

    protected function registerEventListeners(): void
    {
        Event::listen(OrderShipped::class, SendShippingNotification::class);
    }

    protected function loadRoutes(): void
    {
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api/ecommerce.php'));
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
            foreach (['name', 'email', 'phone', 'street', 'city', 'postal_code', 'country_code'] as $field) {
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
}
