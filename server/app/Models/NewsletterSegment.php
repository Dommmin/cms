<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property array<array-key, mixed>|null $rules
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, NewsletterCampaign> $campaigns
 * @property-read int|null $campaigns_count
 *
 * @method static Builder<static>|NewsletterSegment newModelQuery()
 * @method static Builder<static>|NewsletterSegment newQuery()
 * @method static Builder<static>|NewsletterSegment query()
 * @method static Builder<static>|NewsletterSegment whereCreatedAt($value)
 * @method static Builder<static>|NewsletterSegment whereDescription($value)
 * @method static Builder<static>|NewsletterSegment whereId($value)
 * @method static Builder<static>|NewsletterSegment whereIsActive($value)
 * @method static Builder<static>|NewsletterSegment whereName($value)
 * @method static Builder<static>|NewsletterSegment whereRules($value)
 * @method static Builder<static>|NewsletterSegment whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name', 'description', 'rules', 'is_active',
])]
#[Table(name: 'newsletter_segments')]
class NewsletterSegment extends Model
{
    use HasFactory;

    public function campaigns(): HasMany
    {
        return $this->hasMany(NewsletterCampaign::class);
    }

    protected function casts(): array
    {
        return [
            'rules' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
