# Phase 3 Enhancements Documentation

## 1. Admin Impersonation

### Backend

```php
// app/Http/Controllers/Admin/Ecommerce/CustomerController.php

public function impersonate(Customer $customer)
{
    $user = auth()->user();

    if (!$user->can('customers.impersonate')) {
        abort(403, 'Unauthorized');
    }

    $customerUser = $customer->user;

    if (!$customerUser) {
        return back()->with('error', 'Customer has no user account');
    }

    session()->put('impersonator_id', $user->id);
    session()->put('impersonating_customer', true);

    auth()->login($customerUser);

    return redirect()->route('account.index');
}

public function stopImpersonating()
{
    $impersonatorId = session()->pull('impersonator_id');
    session()->forget('impersonating_customer');

    if ($impersonatorId) {
        $admin = User::find($impersonatorId);
        auth()->login($admin);
    }

    return redirect()->route('admin.ecommerce.customers.index');
}
```

### Frontend

Add "Impersonate" button in customer list:

```tsx
// server/resources/js/pages/admin/ecommerce/customers/index.tsx

<Button
    onClick={() => handleImpersonate(customer.id)}
    variant="ghost"
    size="sm"
>
    <UserCircle className="h-4 w-4" />
    Impersonate
</Button>
```

### Routes

```php
// routes/admin.php
Route::post('customers/{customer}/impersonate', [CustomerController::class, 'impersonate'])
    ->middleware('can:customers.impersonate');
Route::post('stop-impersonating', [CustomerController::class, 'stopImpersonating']);
```

## 2. Product Bundles

### Database Schema

```php
Schema::create('product_bundles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->text('description')->nullable();
    $table->integer('discount_percentage')->default(0); // e.g., 10 = 10% off
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

Schema::create('product_bundle_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_bundle_id')->constrained()->cascadeOnDelete();
    $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
    $table->unsignedInteger('quantity')->default(1);
    $table->timestamps();
});
```

### Usage

```php
// Create bundle
$bundle = ProductBundle::create([
    'product_id' => $mainProduct->id,
    'name' => 'Summer Bundle',
    'discount_percentage' => 15, // 15% off
]);

// Add items
$bundle->items()->attach([
    $variant1->id => ['quantity' => 1],
    $variant2->id => ['quantity' => 2],
]);

// Calculate price
$bundlePrice = $bundle->calculateBundlePrice();
```

## 3. Loyalty Program

### Database Schema

```php
Schema::create('loyalty_points', function (Blueprint $table) {
    $table->id();
    $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
    $table->unsignedInteger('balance')->default(0);
    $table->unsignedInteger('total_earned')->default(0);
    $table->unsignedInteger('total_spent')->default(0);
    $table->timestamps();
});

Schema::create('loyalty_transactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('customer_id')->constrained();
    $table->enum('type', ['earn', 'spend', 'expire', 'adjustment']);
    $table->unsignedInteger('points');
    $table->string('description');
    $table->morphs('source'); // Order, Review, Manual
    $table->unsignedInteger('balance_after');
    $table->timestamps();
});
```

### Configuration

```php
// config/loyalty.php
return [
    'earn_rate' => 1, // 1 point per zł spent
    'redemption_rate' => 100, // 100 points = 1 zł value
    'min_redemption' => 100, // Minimum points to redeem
    'expiry_days' => 365, // Points expire after 1 year
];
```

### Usage

```php
use App\Services\LoyaltyService;

// Earn points from order
$loyaltyService = app(LoyaltyService::class);
$points = $loyaltyService->calculatePointsForOrder($order);
$loyaltyService->earnFromOrder($order, $points);

// Redeem points
$discount = $loyaltyService->spendPoints($customer, 500, 'Redeemed for order');

// Calculate discount value
$discountValue = $loyaltyService->calculateDiscountValue(500); // Returns cents
```

## 4. Flash Sales

Flash sales are supported through the existing Promotion model with time-limited discounts:

```php
// Create flash sale
$promotion = Promotion::create([
    'name' => 'Flash Sale - Summer 50% Off',
    'slug' => 'flash-summer-50',
    'type' => 'percentage',
    'value' => 50, // 50% off
    'starts_at' => '2026-06-01 10:00:00',
    'ends_at' => '2026-06-01 14:00:00', // 4-hour flash
    'is_active' => true,
]);
```

### Frontend Countdown Timer

```tsx
// client/components/flash-sale-countdown.tsx
'use client';

import { useState, useEffect } from 'react';

export function FlashSaleCountdown({ endsAt }: { endsAt: string }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endsAt));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(endsAt));
        }, 1000);
        return () => clearInterval(timer);
    }, [endsAt]);

    if (timeLeft.total <= 0) {
        return <div>Sale ended!</div>;
    }

    return (
        <div className="flex gap-2">
            <div>{timeLeft.hours}h</div>
            <div>{timeLeft.minutes}m</div>
            <div>{timeLeft.seconds}s</div>
        </div>
    );
}

function calculateTimeLeft(endsAt: string) {
    const diff = new Date(endsAt).getTime() - Date.now();
    return {
        total: diff,
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}
```

## 5. Content Approval Workflow

Add status field to BlogPost and Page:

```php
// Migration
$table->enum('status', ['draft', 'review', 'published', 'rejected'])
    ->default('draft');

// Model
public function isPublishable(): bool
{
    return $this->status === 'review' &&
        !empty($this->title) &&
        !empty($this->content);
}

public function submitForReview(): void
{
    if ($this->isPublishable()) {
        $this->update(['status' => 'review']);
    }
}

public function approve(): void
{
    $this->update([
        'status' => 'published',
        'published_at' => now(),
    ]);
}

public function reject(string $reason): void
{
    $this->update([
        'status' => 'rejected',
        'rejection_reason' => $reason,
    ]);
}
```

### Admin UI

Add workflow buttons in admin:

```tsx
// BlogPost actions
{post.status === 'draft' && (
    <Button onClick={() => submitForReview(post.id)}>
        Submit for Review
    </Button>
)}

{post.status === 'review' && user.can('posts.publish') && (
    <>
        <Button onClick={() => approve(post.id)}>Approve</Button>
        <Button onClick={() => reject(post.id)}>Reject</Button>
    </>
)}
```

## 6. Canary Deployments (Kubernetes)

```yaml
# k8s/canary-deployment.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: cms-canary
spec:
  replicas: 3
  strategy:
    canary:
      steps:
        - setWeight: 10
        - pause: {duration: 10m}
        - setWeight: 30
        - pause: {duration: 10m}
        - setWeight: 50
        - pause: {duration: 10m}
  selector:
    matchLabels:
      app: cms
  template:
    spec:
      containers:
        - name: cms
          image: cms:latest
          ports:
            - containerPort: 80
```

## 7. A/B Testing

```php
// app/Services/ABTestService.php
class ABTestService
{
    public function assignVariant(string $experiment, User $user): string
    {
        $variants = config("ab_tests.{$experiment}.variants", ['control']);
        $hash = crc32($user->id . $experiment);
        $index = $hash % count($variants);

        return $variants[$index];
    }

    public function trackConversion(string $experiment, User $user): void
    {
        // Track conversion in analytics
        event(new ABTestConversion($experiment, $user));
    }
}
```

### Configuration

```php
// config/ab_tests.php
return [
    'homepage_hero' => [
        'variants' => ['control', 'video_background', 'carousel'],
        'traffic_allocation' => 100, // %
        'start_date' => '2026-04-01',
        'end_date' => '2026-04-30',
    ],
];
```

## 8. GraphQL API (Optional)

```bash
composer require rebing/graphql-laravel
```

```php
// config/graphql.php
'schemas' => [
    'default' => [
        'query' => [
            'products' => App\GraphQL\Queries\ProductsQuery::class,
            'orders' => App\GraphQL\Queries\OrdersQuery::class,
        ],
        'mutation' => [
            'createOrder' => App\GraphQL\Mutations\CreateOrderMutation::class,
        ],
    ],
],
```

```php
// app/GraphQL/Queries/ProductsQuery.php
class ProductsQuery extends Query
{
    protected $attributes = [
        'name' => 'products',
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Product'));
    }

    public function resolve($root, array $args)
    {
        return Product::with('variants', 'category')->get();
    }
}
```

---

*Last Updated: 2026-04-03*