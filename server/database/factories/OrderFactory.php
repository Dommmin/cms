<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Address;
use App\Models\Customer;
use App\Models\Order;
use App\States\Order\AwaitingPaymentState;
use App\States\Order\CancelledState;
use App\States\Order\DeliveredState;
use App\States\Order\PaidState;
use App\States\Order\PendingState;
use App\States\Order\ProcessingState;
use App\States\Order\RefundedState;
use App\States\Order\ShippedState;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'reference_number' => 'ORD-'.mb_strtoupper(fake()->bothify('????####')),
            'billing_address_id' => Address::factory(),
            'shipping_address_id' => Address::factory(),
            'status' => PendingState::class,
            'subtotal' => fake()->numberBetween(1000, 100000),
            'discount_amount' => 0,
            'shipping_cost' => fake()->numberBetween(0, 5000),
            'tax_amount' => fake()->numberBetween(0, 20000),
            'total' => fake()->numberBetween(1000, 150000),
            'currency_code' => 'PLN',
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function awaitingPayment(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => AwaitingPaymentState::class,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => PendingState::class,
        ]);
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => PaidState::class,
        ]);
    }

    public function processing(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => ProcessingState::class,
        ]);
    }

    public function shipped(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => ShippedState::class,
        ]);
    }

    public function delivered(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => DeliveredState::class,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => CancelledState::class,
        ]);
    }

    public function refunded(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => RefundedState::class,
        ]);
    }
}
