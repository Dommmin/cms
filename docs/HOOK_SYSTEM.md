# Hook & Filter System — Developer Guide

> **Version:** 1.0 (MVP)  
> **Location:** `server/app/Services/Hooks/`

---

## Overview

The CMS includes a typed hook/filter system inspired by WordPress `do_action()` / `apply_filters()`, designed as the foundation for platform extensibility — similar to Shopify's webhooks or WP's plugin API.

It lets first-party code (services, resources, observers) emit **named extension points**, and lets any subscriber (package, feature module, or future plugin) react to them — without tight coupling.

There are two primitives:

| Primitive | Purpose | Mutates data? |
|-----------|---------|--------------|
| **Action** | Notify listeners that something happened | No |
| **Filter** | Pass data through a pipeline to modify it | Yes |

---

## Core Classes

| Class | Path | Role |
|-------|------|------|
| `HookManager` | `app/Services/Hooks/HookManager.php` | Singleton that holds all listeners and dispatches hooks |
| `Hook` | `app/Services/Hooks/Facades/Hook.php` | Laravel Facade for ergonomic access to `HookManager` |
| `HookServiceProvider` | `app/Providers/HookServiceProvider.php` | Binds `HookManager` into the container as `hook.manager` |

---

## API Reference

### Registering a Listener

```php
use App\Services\Hooks\Facades\Hook;
use App\Services\Hooks\Pricing\ProductPriceFilter;

// Closure listener (priority defaults to 10)
Hook::listen(ProductPriceFilter::class, function (ProductPriceFilter $filter): void {
    $filter->price = (int) round($filter->price * 0.9); // 10% off
});

// Class-based listener (resolved via the container — DI is supported)
Hook::listen(ProductPriceFilter::class, PremiumMemberPriceListener::class, priority: 5);

// Explicit priority (lower = runs first)
Hook::listen(ShippingCostFilter::class, FreeShippingCampaignListener::class, priority: 1);
```

### Dispatching an Action

```php
use App\Services\Hooks\Facades\Hook;
use App\Services\Hooks\Checkout\CheckoutCompletedAction;

Hook::action(new CheckoutCompletedAction($order));
// All registered listeners receive the same $order object
```

### Applying a Filter

```php
use App\Services\Hooks\Facades\Hook;
use App\Services\Hooks\Pricing\ProductPriceFilter;

$filter = Hook::filter(new ProductPriceFilter(
    price: $variant->price,
    variant: $variant,
    quantity: $qty,
));

$finalPrice = $filter->price; // possibly modified by listeners
```

> **Filter objects are mutable.** Listeners receive the same object and mutate its public properties. The filter object is returned by `Hook::filter()` for convenient chaining.

---

## Priority System

Listeners run in **ascending priority order** (lower number = runs first). The default priority is `10`.

```php
Hook::listen(SeoMetadataFilter::class, SlowListener::class, priority: 100); // last
Hook::listen(SeoMetadataFilter::class, FastListener::class, priority: 1);   // first
```

Listeners at the same priority run in registration order.

---

## Built-in Hook Points (MVP)

### Checkout

| Class | File | Type | When |
|-------|------|------|------|
| `CheckoutCreatingFilter` | `Hooks/Checkout/CheckoutCreatingFilter.php` | Filter | Before order is persisted; exposes `$orderData`, `$cart` |
| `CheckoutCompletedAction` | `Hooks/Checkout/CheckoutCompletedAction.php` | Action | After order is created and paid; exposes `$order` |

### Pricing

| Class | File | Type | When |
|-------|------|------|------|
| `ProductPriceFilter` | `Hooks/Pricing/ProductPriceFilter.php` | Filter | During `ProductVariant::getPriceForQuantity()`; exposes `$price`, `$variant`, `$quantity` |

### Shipping

| Class | File | Type | When |
|-------|------|------|------|
| `ShippingCostFilter` | `Hooks/Shipping/ShippingCostFilter.php` | Filter | During `ShippingMethod::calculateCost()`; exposes `$cost`, `$method`, `$weight`, `$orderTotal` |

### SEO / Metadata

| Class | File | Type | When |
|-------|------|------|------|
| `SeoMetadataFilter` | `Hooks/Seo/SeoMetadataFilter.php` | Filter | During `HasSeoMetadata::getSeoMetadata()`; exposes `$metadata`, `$model` |

Models supporting SEO hooks: `Page`, `BlogPost`, `Product`, `Category` (via the `HasSeoMetadata` trait).

### CMS / Page Rendering

| Class | File | Type | When |
|-------|------|------|------|
| `PageRenderFilter` | `Hooks/Cms/PageRenderFilter.php` | Filter | Inside API resources (`PageResource`, `BlogPostResource`) before serialization; exposes `$pageData`, `$page` |
| `PagePublishedAction` | `Hooks/Cms/PagePublishedAction.php` | Action | After `PagePublicationWebhookService::dispatchPublished()`; exposes `$page` |

### Customer Lifecycle

| Class | File | Type | When |
|-------|------|------|------|
| `CustomerRegisteredAction` | `Hooks/Customer/CustomerRegisteredAction.php` | Action | Dispatched by `CustomerObserver::created()`; exposes `$customer` |

---

## Adding a New Hook Point

### 1. Create the action or filter class

```php
// app/Services/Hooks/Orders/OrderRefundedAction.php
<?php

declare(strict_types=1);

namespace App\Services\Hooks\Orders;

use App\Models\Order;

final class OrderRefundedAction
{
    public function __construct(
        public readonly Order $order,
        public readonly int $refundAmountInGrosze,
    ) {}
}
```

### 2. Dispatch it at the right moment

```php
// Inside your service
use App\Services\Hooks\Facades\Hook;
use App\Services\Hooks\Orders\OrderRefundedAction;

Hook::action(new OrderRefundedAction($order, $refundAmount));
```

### 3. Register a listener (wherever appropriate — typically a ServiceProvider)

```php
Hook::listen(OrderRefundedAction::class, function (OrderRefundedAction $action): void {
    // send email, update analytics, etc.
});
```

### 4. Document the new hook in this file.

---

## Using Class-Based Listeners

The `HookManager` resolves class-based listeners via the Laravel service container. This means constructor injection works:

```php
final class FreeShippingForVipListener
{
    public function __construct(
        private readonly MembershipService $membership,
    ) {}

    public function __invoke(ShippingCostFilter $filter): void
    {
        if ($this->membership->isVip($filter->method->customer)) {
            $filter->cost = 0;
        }
    }
}

// Register in a ServiceProvider:
Hook::listen(ShippingCostFilter::class, FreeShippingForVipListener::class);
```

---

## Testing Hooks

Register hooks inside the test itself (they are local to each test thanks to `HookManager` being a per-request singleton that is reset between tests via `RefreshDatabase`):

```php
use App\Services\Hooks\Facades\Hook;
use App\Services\Hooks\Pricing\ProductPriceFilter;

it('applies 10% discount via hook', function (): void {
    Hook::listen(ProductPriceFilter::class, function (ProductPriceFilter $f): void {
        $f->price = (int) round($f->price * 0.9);
    });

    $variant = ProductVariant::factory()->create(['price' => 10000]);

    expect($variant->getPriceForQuantity(1))->toBe(9000);
});
```

See `tests/Feature/HookSystemTest.php` for the full reference test suite (19 tests, 23 assertions).

---

## Architecture Notes

- **No global state / magic strings** — every hook is a typed PHP class (IDE-friendly, statically analysable).
- **No auto-discovery** — listeners are registered explicitly in `ServiceProvider::boot()` or equivalent. This keeps the system deterministic.
- **Priorities** — fully supported; the default is `10`, lower runs first.
- **Filters are mutable objects** — no functional FP-style pipeline; listeners mutate public properties of the filter object.
- **Actions are fire-and-forget** — listeners run synchronously in the current request.
- **Future extensibility** — async action dispatch (queued listeners) can be added to `HookManager` without changing the public API.
