<?php

declare(strict_types=1);

use App\Enums\ReviewStatusEnum;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\User;
use Illuminate\Support\Str;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function reviewableProduct(): Product
{
    $type = ProductType::query()->firstOrCreate(
        ['slug' => 'simple'],
        ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true]
    );

    $cat = Category::query()->firstOrCreate(
        ['slug' => 'review-cat'],
        ['name' => 'Review Category', 'is_active' => true]
    );

    return Product::query()->create([
        'name' => 'Reviewable Product '.Str::random(4),
        'slug' => 'reviewable-'.Str::random(8),
        'product_type_id' => $type->id,
        'category_id' => $cat->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);
}

// ---------------------------------------------------------------------------
// Listing reviews
// ---------------------------------------------------------------------------

describe('Reviews – listing', function () {
    it('returns approved reviews for a product', function () {
        $product = reviewableProduct();

        $user = User::factory()->create();
        $customer = Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
        ]);

        $product->reviews()->create([
            'customer_id' => $customer->id,
            'rating' => 5,
            'title' => 'Great!',
            'body' => 'Loved it.',
            'status' => ReviewStatusEnum::Approved->value,
            'is_verified_purchase' => false,
            'helpful_count' => 0,
        ]);

        $this->getJson("/api/v1/products/{$product->slug}/reviews")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('does not return pending reviews in the public listing', function () {
        $product = reviewableProduct();

        $user = User::factory()->create();
        $customer = Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
        ]);

        $product->reviews()->create([
            'customer_id' => $customer->id,
            'rating' => 4,
            'status' => ReviewStatusEnum::Pending->value,
            'is_verified_purchase' => false,
            'helpful_count' => 0,
        ]);

        $this->getJson("/api/v1/products/{$product->slug}/reviews")
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });
});

// ---------------------------------------------------------------------------
// Submitting reviews
// ---------------------------------------------------------------------------

describe('Reviews – submission', function () {
    it('authenticated user with a customer profile can submit a review', function () {
        $product = reviewableProduct();
        $user = User::factory()->create();
        Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/products/{$product->slug}/reviews", [
                'rating' => 5,
                'title' => 'Excellent product',
                'body' => 'Would buy again.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.rating', 5);

        // ReviewResource does not expose status; verify via DB
        $this->assertDatabaseHas('product_reviews', [
            'product_id' => $product->id,
            'rating' => 5,
            'status' => ReviewStatusEnum::Pending->value,
        ]);
    });

    it('new review starts in pending status (not immediately approved)', function () {
        $product = reviewableProduct();
        $user = User::factory()->create();
        Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/products/{$product->slug}/reviews", [
                'rating' => 3,
                'body' => 'Average.',
            ])->assertStatus(201);

        // Verify pending status via DB (ReviewResource intentionally omits status)
        $this->assertDatabaseHas('product_reviews', [
            'product_id' => $product->id,
            'status' => ReviewStatusEnum::Pending->value,
        ]);
    });

    it('user cannot submit two reviews for the same product', function () {
        $product = reviewableProduct();
        $user = User::factory()->create();
        Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/products/{$product->slug}/reviews", [
                'rating' => 5,
                'body' => 'First review.',
            ])->assertStatus(201);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/products/{$product->slug}/reviews", [
                'rating' => 1,
                'body' => 'Second review attempt.',
            ])->assertUnprocessable();
    });

    it('guest cannot submit a review — requires authentication', function () {
        $product = reviewableProduct();

        $this->postJson("/api/v1/products/{$product->slug}/reviews", [
            'rating' => 5,
            'body' => 'Should not work.',
        ])->assertUnauthorized();
    });

    it('rejects rating below 1', function () {
        $product = reviewableProduct();
        $user = User::factory()->create();
        Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/products/{$product->slug}/reviews", [
                'rating' => 0,
            ])->assertUnprocessable();
    });

    it('rejects rating above 5', function () {
        $product = reviewableProduct();
        $user = User::factory()->create();
        Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/products/{$product->slug}/reviews", [
                'rating' => 6,
            ])->assertUnprocessable();
    });
});

// ---------------------------------------------------------------------------
// Helpful votes
// ---------------------------------------------------------------------------

describe('Reviews – helpful votes', function () {
    it('authenticated user can vote helpful on a review', function () {
        $product = reviewableProduct();

        $authorUser = User::factory()->create();
        $author = Customer::query()->create([
            'user_id' => $authorUser->id,
            'email' => $authorUser->email,
            'first_name' => $authorUser->name,
        ]);

        $review = $product->reviews()->create([
            'customer_id' => $author->id,
            'rating' => 4,
            'status' => ReviewStatusEnum::Approved->value,
            'is_verified_purchase' => false,
            'helpful_count' => 0,
        ]);

        $voter = User::factory()->create();
        Customer::query()->create([
            'user_id' => $voter->id,
            'email' => $voter->email,
            'first_name' => $voter->name,
        ]);

        $this->actingAs($voter, 'sanctum')
            ->postJson("/api/v1/reviews/{$review->id}/helpful")
            ->assertOk()
            ->assertJsonPath('voted', true)
            ->assertJsonPath('helpful_count', 1);
    });

    it('voting helpful twice removes the vote (toggle behaviour)', function () {
        $product = reviewableProduct();

        $authorUser = User::factory()->create();
        $author = Customer::query()->create([
            'user_id' => $authorUser->id,
            'email' => $authorUser->email,
            'first_name' => $authorUser->name,
        ]);

        $review = $product->reviews()->create([
            'customer_id' => $author->id,
            'rating' => 4,
            'status' => ReviewStatusEnum::Approved->value,
            'is_verified_purchase' => false,
            'helpful_count' => 0,
        ]);

        $voter = User::factory()->create();
        $voterCustomer = Customer::query()->create([
            'user_id' => $voter->id,
            'email' => $voter->email,
            'first_name' => $voter->name,
        ]);

        $this->actingAs($voter, 'sanctum')
            ->postJson("/api/v1/reviews/{$review->id}/helpful");

        $this->actingAs($voter->fresh(), 'sanctum')
            ->postJson("/api/v1/reviews/{$review->id}/helpful")
            ->assertOk()
            ->assertJsonPath('voted', false)
            ->assertJsonPath('helpful_count', 0);
    });
});
