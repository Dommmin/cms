<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'provider' => fake()->randomElement(PaymentProviderEnum::cases()),
            'provider_transaction_id' => mb_strtoupper(fake()->bothify('PAY-####??')),
            'status' => PaymentStatusEnum::PENDING,
            'amount' => fake()->numberBetween(1000, 100000),
            'currency_code' => 'PLN',
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => PaymentStatusEnum::PENDING,
        ]);
    }

    public function authorized(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => PaymentStatusEnum::AUTHORIZED,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => PaymentStatusEnum::COMPLETED,
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => PaymentStatusEnum::FAILED,
        ]);
    }

    public function refunded(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => PaymentStatusEnum::REFUNDED,
        ]);
    }

    public function payu(): static
    {
        return $this->state(fn (array $attributes): array => [
            'provider' => PaymentProviderEnum::PAYU,
        ]);
    }

    public function p24(): static
    {
        return $this->state(fn (array $attributes): array => [
            'provider' => PaymentProviderEnum::P24,
        ]);
    }

    public function stripe(): static
    {
        return $this->state(fn (array $attributes): array => [
            'provider' => PaymentProviderEnum::STRIPE,
        ]);
    }
}
