<?php

declare(strict_types=1);

use App\Models\Cart;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'customer']);
});

function authMergeVariant(): ProductVariant
{
    $type = ProductType::query()->firstOrCreate(
        ['slug' => 'simple'],
        ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true]
    );

    $category = Category::query()->firstOrCreate(
        ['slug' => 'auth-merge-cat'],
        ['name' => 'Auth Merge Category', 'is_active' => true]
    );

    $product = Product::query()->create([
        'name' => 'Auth Merge Product '.Str::random(4),
        'slug' => 'auth-merge-product-'.Str::random(8),
        'product_type_id' => $type->id,
        'category_id' => $category->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    return ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'AM-'.Str::random(6),
        'name' => 'Default',
        'price' => 1000,
        'stock_quantity' => 10,
        'is_active' => true,
    ]);
}

describe('Registration', function (): void {
    it('registers a new user successfully', function (): void {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
        ]);

        $user = User::query()->where('email', 'john@example.com')->first();
        expect(Hash::check('Password123!', $user->password))->toBeTrue();
    });

    it('creates sanctum token on registration', function (): void {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertCreated();

        $user = User::query()->where('email', 'jane@example.com')->first();
        expect($user->tokens)->toHaveCount(1);
    });

    it('requires name on registration', function (): void {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    });

    it('requires valid email on registration', function (): void {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    });

    it('requires password confirmation to match', function (): void {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'DifferentPassword!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    });

    it('rejects password shorter than 8 characters', function (): void {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    });

    it('rejects duplicate email', function (): void {
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    });
});

describe('Login', function (): void {
    it('logs in user successfully', function (): void {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email'],
                'token',
            ]);

        expect($user->tokens)->toHaveCount(1);
    });

    it('rejects invalid credentials', function (): void {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    });

    it('rejects non-existent user', function (): void {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    });

    it('requires email', function (): void {
        $response = $this->postJson('/api/v1/auth/login', [
            'password' => 'Password123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    });

    it('requires password', function (): void {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    });

    it('creates new token on each login', function (): void {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'Password123!',
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'Password123!',
        ]);

        expect($user->fresh()->tokens)->toHaveCount(2);
    });

    it('merges guest cart and wishlist on the first authenticated fetch after login', function (): void {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('Password123!'),
        ]);
        $variant = authMergeVariant();
        $cartToken = 'guest-cart-token';
        $wishlistToken = 'guest-wishlist-token';

        $this->withHeaders(['X-Cart-Token' => $cartToken])
            ->postJson('/api/v1/cart/items', [
                'variant_id' => $variant->id,
                'quantity' => 2,
            ])
            ->assertOk();

        $this->withHeaders(['X-Wishlist-Token' => $wishlistToken])
            ->postJson('/api/v1/wishlist/items', [
                'variant_id' => $variant->id,
            ])
            ->assertOk();

        $token = $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'Password123!',
            'cart_token' => $cartToken,
            'wishlist_token' => $wishlistToken,
        ])->assertOk()->json('token');

        $this->withToken($token)
            ->withHeaders(['X-Cart-Token' => $cartToken])
            ->getJson('/api/v1/cart')
            ->assertOk()
            ->assertJsonPath('items_count', 2)
            ->assertJsonPath('items.0.variant_id', $variant->id);

        $this->withToken($token)
            ->withHeaders(['X-Wishlist-Token' => $wishlistToken])
            ->getJson('/api/v1/wishlist')
            ->assertOk()
            ->assertJsonPath('items_count', 1)
            ->assertJsonPath('items.0.variant_id', $variant->id);

        $customer = Customer::query()->where('user_id', $user->id)->first();

        expect($customer)->not->toBeNull();
        expect(Cart::query()->where('customer_id', $customer?->id)->exists())->toBeTrue();
        expect(Wishlist::query()->where('customer_id', $customer?->id)->exists())->toBeTrue();
    });

    it('returns the merged customer cart when the customer existed before login but had no cart', function (): void {
        $user = User::factory()->create([
            'email' => 'existing-customer@example.com',
            'password' => Hash::make('Password123!'),
        ]);
        Customer::factory()->create([
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        $variant = authMergeVariant();
        $cartToken = 'existing-customer-guest-cart-token';

        $this->withHeaders(['X-Cart-Token' => $cartToken])
            ->postJson('/api/v1/cart/items', [
                'variant_id' => $variant->id,
                'quantity' => 1,
            ])
            ->assertOk();

        $token = $this->postJson('/api/v1/auth/login', [
            'email' => 'existing-customer@example.com',
            'password' => 'Password123!',
            'cart_token' => $cartToken,
        ])->assertOk()->json('token');

        $this->withToken($token)
            ->withHeaders(['X-Cart-Token' => $cartToken])
            ->getJson('/api/v1/cart')
            ->assertOk()
            ->assertJsonPath('items_count', 1)
            ->assertJsonPath('items.0.variant_id', $variant->id);

        expect(Cart::query()->where('customer_id', $user->customer->id)->count())->toBe(1);
    });
});

describe('Logout', function (): void {
    it('logs out user successfully', function (): void {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson('/api/v1/auth/logout');

        $response->assertOk()
            ->assertJson(['message' => 'Logged out successfully']);

        expect($user->fresh()->tokens)->toHaveCount(0);
    });

    it('requires authentication', function (): void {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(401);
    });
});

describe('Get Current User', function (): void {
    it('returns authenticated user', function (): void {
        $user = User::factory()->create();
        $customer = Customer::factory()->create(['user_id' => $user->id]);
        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v1/auth/me');

        $response->assertOk()
            ->assertJsonStructure([
                'id',
                'name',
                'email',
                'customer' => ['id'],
            ]);
    });

    it('requires authentication', function (): void {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    });
});
