<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CustomReport;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CustomReport>
 */
final class CustomReportFactory extends Factory
{
    protected $model = CustomReport::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->sentence(3),
            'description' => fake()->sentence(),
            'data_source' => 'orders',
            'metrics' => ['count', 'revenue'],
            'dimensions' => [],
            'filters' => [],
            'group_by' => [],
            'chart_type' => 'table',
            'is_public' => false,
        ];
    }
}
