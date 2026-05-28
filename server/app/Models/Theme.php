<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * Theme model representing UI/themes configuration stored in the database.
 *
 * @property array<string, mixed>|null $tokens
 * @property array<string, mixed>|null $typography
 * @property array<string, mixed>|null $spacing
 * @property array<string, mixed>|null $buttons
 * @property array<string, mixed>|null $containers
 * @property array<string, mixed>|null $settings
 * @property bool $is_active
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string|null $preview_image
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Page> $pages
 * @property-read int|null $pages_count
 * @method static \Database\Factories\ThemeFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereButtons($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereContainers($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme wherePreviewImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereSettings($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereSpacing($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereTokens($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereTypography($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Theme whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'name',
    'slug',
    'description',
    'tokens',
    'typography',
    'spacing',
    'buttons',
    'containers',
    'settings',
    'preview_image',
    'is_active',
])]
#[Table(name: 'themes')]
class Theme extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $casts = [
        'tokens' => 'array',
        'typography' => 'array',
        'spacing' => 'array',
        'buttons' => 'array',
        'containers' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('theme');
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class, 'theme_id');
    }
}
