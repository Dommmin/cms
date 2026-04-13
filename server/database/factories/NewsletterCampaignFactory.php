<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\AudienceTypeEnum;
use App\Enums\CampaignStatusEnum;
use App\Enums\CampaignTypeEnum;
use App\Models\NewsletterCampaign;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NewsletterCampaign>
 */
final class NewsletterCampaignFactory extends Factory
{
    protected $model = NewsletterCampaign::class;

    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'subject' => fake()->sentence(4),
            'preview_text' => fake()->sentence(6),
            'sender_name' => fake()->name(),
            'sender_email' => fake()->email(),
            'html_content' => '<p>'.fake()->paragraph().'</p>',
            'plain_text_content' => fake()->paragraph(),
            'audience_type' => AudienceTypeEnum::All,
            'type' => CampaignTypeEnum::Broadcast,
            'status' => CampaignStatusEnum::Draft,
        ];
    }

    public function automated(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => CampaignTypeEnum::Automated,
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CampaignStatusEnum::Active,
        ]);
    }
}
