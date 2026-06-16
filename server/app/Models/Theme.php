<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\ThemeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * Theme model representing UI/themes configuration stored in the database.
 *
 * @property array<string, mixed>|null $tokens
 * @property array<string, mixed>|null $dark_tokens
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
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, Page> $pages
 * @property-read int|null $pages_count
 *
 * @method static ThemeFactory factory($count = null, $state = [])
 * @method static Builder<static>|Theme newModelQuery()
 * @method static Builder<static>|Theme newQuery()
 * @method static Builder<static>|Theme query()
 * @method static Builder<static>|Theme whereButtons($value)
 * @method static Builder<static>|Theme whereContainers($value)
 * @method static Builder<static>|Theme whereCreatedAt($value)
 * @method static Builder<static>|Theme whereDescription($value)
 * @method static Builder<static>|Theme whereId($value)
 * @method static Builder<static>|Theme whereIsActive($value)
 * @method static Builder<static>|Theme whereName($value)
 * @method static Builder<static>|Theme wherePreviewImage($value)
 * @method static Builder<static>|Theme whereSettings($value)
 * @method static Builder<static>|Theme whereSlug($value)
 * @method static Builder<static>|Theme whereSpacing($value)
 * @method static Builder<static>|Theme whereTokens($value)
 * @method static Builder<static>|Theme whereTypography($value)
 * @method static Builder<static>|Theme whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name',
    'slug',
    'description',
    'tokens',
    'dark_tokens',
    'draft_tokens',
    'typography',
    'font_sources',
    'spacing',
    'buttons',
    'containers',
    'branding',
    'settings',
    'preview_image',
    'is_active',
])]
#[Table(name: 'themes')]
class Theme extends Model
{
    use HasFactory;
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'is_active'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('theme');
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class, 'theme_id');
    }

    protected function casts(): array
    {
        return [
            'tokens' => 'array',
            'dark_tokens' => 'array',
            'draft_tokens' => 'array',
            'typography' => 'array',
            'font_sources' => 'array',
            'spacing' => 'array',
            'buttons' => 'array',
            'containers' => 'array',
            'branding' => 'array',
            'settings' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
