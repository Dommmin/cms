<?php

declare(strict_types=1);

namespace App\Providers;

use App\Modules\Core\Domain\Models\Setting;
use App\Modules\Ecommerce\Domain\Models\Cart;
use App\Modules\Ecommerce\Domain\Models\Category;
use App\Modules\Ecommerce\Domain\Models\Order;
use App\Modules\Ecommerce\Domain\Models\Product;
use App\Modules\Ecommerce\Domain\Models\ReturnRequest;
use App\Modules\Ecommerce\Domain\Models\Wishlist;
use App\Modules\Newsletter\Domain\Models\NewsletterSubscriber;
use App\Modules\Reviews\Domain\Models\ProductReview;
use App\Policies\CartPolicy;
use App\Policies\CategoryPolicy;
use App\Policies\NewsletterPolicy;
use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use App\Policies\ReturnPolicy;
use App\Policies\ReviewPolicy;
use App\Policies\SettingsPolicy;
use App\Policies\WishlistPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

final class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Product::class => ProductPolicy::class,
        Category::class => CategoryPolicy::class,
        Order::class => OrderPolicy::class,
        Cart::class => CartPolicy::class,
        ProductReview::class => ReviewPolicy::class,
        ReturnRequest::class => ReturnPolicy::class,
        Wishlist::class => WishlistPolicy::class,
        NewsletterSubscriber::class => NewsletterPolicy::class,
        Setting::class => SettingsPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}
