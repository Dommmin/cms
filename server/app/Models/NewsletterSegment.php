<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property array<array-key, mixed>|null $rules
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\NewsletterCampaign> $campaigns
 * @property-read int|null $campaigns_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSegment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSegment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSegment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSegment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSegment whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSegment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSegment whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSegment whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSegment whereRules($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSegment whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'name', 'description', 'rules', 'is_active',
])]
#[Table(name: 'newsletter_segments')]
class NewsletterSegment extends Model
{
    use HasFactory;

    protected $casts = [
        'rules' => 'array',
        'is_active' => 'boolean',
    ];

    public function campaigns(): HasMany
    {
        return $this->hasMany(NewsletterCampaign::class);
    }
}
