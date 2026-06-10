<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Promotion;
use DateTimeImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Promotion>
 */
class PromotionFactory extends Factory
{
    protected $model = Promotion::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping'];
        $applyTo = ['all', 'specific_products', 'specific_categories'];

        $type = fake()->randomElement($types);
        $applyToType = fake()->randomElement($applyTo);

        $data = [
            'name' => fake()->words(3, true),
            'slug' => fake()->slug(),
            'description' => fake()->sentence(),
            'type' => $type,
            'apply_to' => $applyToType,
            'is_active' => fake()->boolean(80), // 80% chance of being active
            'is_stackable' => fake()->boolean(30), // 30% chance of being stackable
            'priority' => fake()->numberBetween(0, 100),
            'starts_at' => fake()->optional(0.3)->dateTimeBetween('-1 month', '+1 month'),
            'ends_at' => fake()->optional(0.4)->dateTimeBetween('+1 week', '+6 months'),
            'metadata' => null,
        ];

        // Add value based on type
        switch ($type) {
            case 'percentage':
                $data['value'] = fake()->numberBetween(5, 50);
                break;
            case 'fixed_amount':
                $data['value'] = fake()->numberBetween(10, 200);
                break;
            case 'buy_x_get_y':
                $data['metadata'] = [
                    'buy_quantity' => fake()->numberBetween(1, 3),
                    'get_quantity' => fake()->numberBetween(1, 2),
                    'discount_percentage' => fake()->randomElement([50, 75, 100]),
                ];
                $data['value'] = null;
                break;
            case 'free_shipping':
                $data['value'] = null;
                break;
        }

        // Add optional constraints
        if (fake()->boolean(30)) {
            $data['min_value'] = fake()->numberBetween(50, 500);
        }

        if (fake()->boolean(20)) {
            $data['max_discount'] = fake()->numberBetween(100, 1000);
        }

        return $data;
    }

    /**
     * Indicate that the promotion is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => true,
            'starts_at' => now()->subDays(1),
            'ends_at' => now()->addDays(30),
        ]);
    }

    /**
     * Indicate that the promotion is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a percentage-based promotion.
     */
    public function percentage(?int $percentage = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'percentage',
            'value' => $percentage ?? fake()->numberBetween(5, 50),
            'metadata' => null,
        ]);
    }

    /**
     * Create a fixed amount promotion.
     */
    public function fixedAmount(?int $amount = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'fixed_amount',
            'value' => $amount ?? fake()->numberBetween(10, 200),
            'metadata' => null,
        ]);
    }

    /**
     * Create a buy X get Y promotion.
     */
    public function buyXGetY(int $buyQuantity = 2, int $getQuantity = 1, int $discountPercentage = 100): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'buy_x_get_y',
            'value' => null,
            'metadata' => [
                'buy_quantity' => $buyQuantity,
                'get_quantity' => $getQuantity,
                'discount_percentage' => $discountPercentage,
            ],
        ]);
    }

    /**
     * Create a free shipping promotion.
     */
    public function freeShipping(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'free_shipping',
            'value' => null,
            'metadata' => null,
        ]);
    }

    /**
     * Apply to all products.
     */
    public function applyToAll(): static
    {
        return $this->state(fn (array $attributes): array => [
            'apply_to' => 'all',
        ]);
    }

    /**
     * Apply to specific products.
     */
    public function applyToSpecificProducts(): static
    {
        return $this->state(fn (array $attributes): array => [
            'apply_to' => 'specific_products',
        ]);
    }

    /**
     * Apply to specific categories.
     */
    public function applyToSpecificCategories(): static
    {
        return $this->state(fn (array $attributes): array => [
            'apply_to' => 'specific_categories',
        ]);
    }

    /**
     * Make the promotion stackable.
     */
    public function stackable(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_stackable' => true,
        ]);
    }

    /**
     * Make the promotion non-stackable.
     */
    public function notStackable(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_stackable' => false,
        ]);
    }

    /**
     * Set a specific priority.
     */
    public function priority(int $priority): static
    {
        return $this->state(fn (array $attributes): array => [
            'priority' => $priority,
        ]);
    }

    /**
     * Create a promotion with date constraints.
     */
    public function withDates(?DateTimeImmutable $startsAt = null, ?DateTimeImmutable $endsAt = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'starts_at' => $startsAt ?? fake()->dateTimeBetween('-1 month', '+1 month'),
            'ends_at' => $endsAt ?? fake()->dateTimeBetween('+1 week', '+6 months'),
        ]);
    }

    /**
     * Create a promotion with minimum order value.
     */
    public function withMinValue(float $minValue): static
    {
        return $this->state(fn (array $attributes): array => [
            'min_value' => $minValue,
        ]);
    }

    /**
     * Create a promotion with maximum discount limit.
     */
    public function withMaxDiscount(float $maxDiscount): static
    {
        return $this->state(fn (array $attributes): array => [
            'max_discount' => $maxDiscount,
        ]);
    }
}
