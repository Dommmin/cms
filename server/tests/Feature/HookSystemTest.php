<?php

declare(strict_types=1);

use App\Models\Cart;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Services\Hooks\Checkout\CheckoutCompletedAction;
use App\Services\Hooks\Checkout\CheckoutCreatingFilter;
use App\Services\Hooks\Cms\PagePublishedAction;
use App\Services\Hooks\Cms\PageRenderFilter;
use App\Services\Hooks\Customer\CustomerRegisteredAction;
use App\Services\Hooks\Facades\Hook;
use App\Services\Hooks\HookManager;
use App\Services\Hooks\Pricing\ProductPriceFilter;
use App\Services\Hooks\Seo\SeoMetadataFilter;
use App\Services\Hooks\Shipping\ShippingCostFilter;

// ──────────────────────────────────────────────────────────────────
// HookManager unit tests
// ──────────────────────────────────────────────────────────────────

describe('HookManager – action', function (): void {
    it('calls registered listener with the action object', function (): void {
        $called = false;

        Hook::listen(CheckoutCompletedAction::class, function (CheckoutCompletedAction $action) use (&$called): void {
            $called = true;
        });

        $order = Order::factory()->make();
        Hook::action(new CheckoutCompletedAction($order));

        expect($called)->toBeTrue();
    });

    it('executes listeners in ascending priority order', function (): void {
        $log = [];

        Hook::listen(CustomerRegisteredAction::class, function () use (&$log): void {
            $log[] = 'low-20';
        }, 20);

        Hook::listen(CustomerRegisteredAction::class, function () use (&$log): void {
            $log[] = 'high-5';
        }, 5);

        Hook::listen(CustomerRegisteredAction::class, function () use (&$log): void {
            $log[] = 'default-10';
        }, 10);

        $customer = Customer::factory()->make();
        Hook::action(new CustomerRegisteredAction($customer));

        expect($log)->toBe(['high-5', 'default-10', 'low-20']);
    });

    it('does nothing when no listeners are registered for an action', function (): void {
        expect(fn () => Hook::action(new PagePublishedAction(Page::factory()->make())))->not->toThrow(Throwable::class);
    });

    it('supports multiple listeners at the same priority', function (): void {
        $count = 0;

        Hook::listen(CustomerRegisteredAction::class, function () use (&$count): void {
            $count++;
        }, 10);
        Hook::listen(CustomerRegisteredAction::class, function () use (&$count): void {
            $count++;
        }, 10);

        Hook::action(new CustomerRegisteredAction(Customer::factory()->make()));

        expect($count)->toBe(2);
    });
});

describe('HookManager – filter (object-based)', function (): void {
    it('allows mutating filter object properties', function (): void {
        Hook::listen(ProductPriceFilter::class, function (ProductPriceFilter $f): void {
            $f->price = 1;  // override to 1 cent
        });

        $variant = ProductVariant::factory()->make(['price' => 5000]);
        $filter = Hook::filter(new ProductPriceFilter(5000, $variant, 1));

        expect($filter->price)->toBe(1);
    });

    it('chains multiple listeners in priority order', function (): void {
        Hook::listen(ShippingCostFilter::class, function (ShippingCostFilter $f): void {
            $f->cost = (int) round($f->cost * 0.9); // 10% off
        }, 10);

        Hook::listen(ShippingCostFilter::class, function (ShippingCostFilter $f): void {
            $f->cost -= 100; // subtract 1 PLN in grosze
        }, 20);

        $method = ShippingMethod::factory()->make();
        $filter = Hook::filter(new ShippingCostFilter(1000, $method, 1.5, 5000));

        // 1000 * 0.9 = 900, then 900 - 100 = 800
        expect($filter->cost)->toBe(800);
    });

    it('returns unmodified filter when no listeners registered', function (): void {
        // Use a fresh HookManager to ensure no listeners
        $manager = new HookManager(app());
        $variant = ProductVariant::factory()->make(['price' => 2500]);
        $filter = $manager->filter(new ProductPriceFilter(2500, $variant, 1));

        expect($filter->price)->toBe(2500);
    });

    it('passes page render data through listeners', function (): void {
        Hook::listen(PageRenderFilter::class, function (PageRenderFilter $f): void {
            $f->pageData['custom_flag'] = true;
        });

        $page = Page::factory()->make();
        $filter = Hook::filter(new PageRenderFilter(['id' => 1], $page));

        expect($filter->pageData)->toHaveKey('custom_flag');
        expect($filter->pageData['custom_flag'])->toBeTrue();
    });
});

describe('HookManager – filter (SEO metadata)', function (): void {
    it('allows overriding SEO title via filter', function (): void {
        Hook::listen(SeoMetadataFilter::class, function (SeoMetadataFilter $f): void {
            $f->metadata['title'] = 'Overridden Title | Site';
        });

        $product = Product::factory()->make(['seo_title' => 'Original']);
        $seo = $product->getSeoMetadata();

        expect($seo['title'])->toBe('Overridden Title | Site');
    });

    it('returns original SEO values when no listener is registered', function (): void {
        $page = Page::factory()->make([
            'seo_title' => 'My Page Title',
            'seo_description' => 'My description',
            'meta_robots' => 'index, follow',
        ]);
        $seo = $page->getSeoMetadata();

        expect($seo['title'])->toBe('My Page Title');
        expect($seo['description'])->toBe('My description');
        expect($seo['robots'])->toBe('index, follow');
    });
});

// ──────────────────────────────────────────────────────────────────
// Integration: ProductPriceFilter in ProductVariant::getPriceForQuantity
// ──────────────────────────────────────────────────────────────────

describe('ProductPriceFilter – getPriceForQuantity integration', function (): void {
    it('applies registered price filter', function (): void {
        Hook::listen(ProductPriceFilter::class, function (ProductPriceFilter $f): void {
            if ($f->quantity >= 10) {
                $f->price = (int) round($f->price * 0.8); // 20% bulk discount
            }
        });

        $variant = ProductVariant::factory()->create(['price' => 10000]);

        expect($variant->getPriceForQuantity(1))->toBe(10000);
        expect($variant->getPriceForQuantity(10))->toBe(8000);
    });
});

// ──────────────────────────────────────────────────────────────────
// Integration: ShippingCostFilter in ShippingMethod::calculateCost
// ──────────────────────────────────────────────────────────────────

describe('ShippingCostFilter – calculateCost integration', function (): void {
    it('applies registered shipping cost filter', function (): void {
        Hook::listen(ShippingCostFilter::class, function (ShippingCostFilter $f): void {
            $f->cost = 0; // free shipping for everyone!
        });

        $method = ShippingMethod::factory()->create([
            'base_price' => 1500,
            'price_per_kg' => 0,
            'free_shipping_threshold' => null,
        ]);

        expect($method->calculateCost(1.0, 5000))->toBe(0);
    });

    it('still applies free shipping threshold before filter', function (): void {
        $captured = null;

        Hook::listen(ShippingCostFilter::class, function (ShippingCostFilter $f) use (&$captured): void {
            $captured = $f->cost; // capture the cost passed into the filter
        });

        $method = ShippingMethod::factory()->create([
            'base_price' => 1500,
            'price_per_kg' => 0,
            'free_shipping_threshold' => 10000,
        ]);

        $method->calculateCost(1.0, 15000); // above threshold

        expect($captured)->toBe(0); // filter receives 0 from threshold logic
    });
});

// ──────────────────────────────────────────────────────────────────
// Integration: CustomerObserver dispatches CustomerRegisteredAction
// ──────────────────────────────────────────────────────────────────

describe('CustomerRegisteredAction – observer integration', function (): void {
    it('fires when a customer is created', function (): void {
        $fired = false;

        Hook::listen(CustomerRegisteredAction::class, function (CustomerRegisteredAction $a) use (&$fired): void {
            $fired = true;
        });

        Customer::factory()->create();

        expect($fired)->toBeTrue();
    });

    it('receives the correct customer model', function (): void {
        $capturedId = null;

        Hook::listen(CustomerRegisteredAction::class, function (CustomerRegisteredAction $a) use (&$capturedId): void {
            $capturedId = $a->customer->id;
        });

        $customer = Customer::factory()->create();

        expect($capturedId)->toBe($customer->id);
    });
});

// ──────────────────────────────────────────────────────────────────
// Integration: CheckoutCreatingFilter modifies order data
// ──────────────────────────────────────────────────────────────────

describe('CheckoutCreatingFilter – filter object', function (): void {
    it('allows modifying order data array before persisting', function (): void {
        Hook::listen(CheckoutCreatingFilter::class, function (CheckoutCreatingFilter $f): void {
            $f->orderData['notes'] = 'Auto-added by hook';
        });

        $cart = Cart::factory()->make();
        $orderData = ['notes' => null, 'total' => 5000];

        $filter = Hook::filter(new CheckoutCreatingFilter($orderData, $cart));

        expect($filter->orderData['notes'])->toBe('Auto-added by hook');
    });

    it('receives the cart reference', function (): void {
        $capturedCart = null;

        Hook::listen(CheckoutCreatingFilter::class, function (CheckoutCreatingFilter $f) use (&$capturedCart): void {
            $capturedCart = $f->cart;
        });

        $cart = Cart::factory()->make();
        Hook::filter(new CheckoutCreatingFilter(['total' => 0], $cart));

        expect($capturedCart)->toBeInstanceOf(Cart::class);
    });
});

// ──────────────────────────────────────────────────────────────────
// Hook Facade resolves correctly
// ──────────────────────────────────────────────────────────────────

describe('Hook Facade', function (): void {
    it('resolves the HookManager singleton', function (): void {
        expect(resolve('hook.manager'))->toBeInstanceOf(HookManager::class);
    });

    it('is the same singleton instance across calls', function (): void {
        expect(resolve('hook.manager'))->toBe(resolve('hook.manager'));
    });
});
