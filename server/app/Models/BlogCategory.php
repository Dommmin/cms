<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property int|null $parent_id
 * @property bool $is_active
 * @property int $position
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, BlogCategory> $children
 * @property-read int|null $children_count
 * @property-read BlogCategory|null $parent
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BlogPost> $posts
 * @property-read int|null $posts_count
 * @method static Builder<static>|BlogCategory active()
 * @method static \Database\Factories\BlogCategoryFactory factory($count = null, $state = [])
 * @method static Builder<static>|BlogCategory newModelQuery()
 * @method static Builder<static>|BlogCategory newQuery()
 * @method static Builder<static>|BlogCategory query()
 * @method static Builder<static>|BlogCategory roots()
 * @method static Builder<static>|BlogCategory whereCreatedAt($value)
 * @method static Builder<static>|BlogCategory whereDescription($value)
 * @method static Builder<static>|BlogCategory whereId($value)
 * @method static Builder<static>|BlogCategory whereIsActive($value)
 * @method static Builder<static>|BlogCategory whereName($value)
 * @method static Builder<static>|BlogCategory whereParentId($value)
 * @method static Builder<static>|BlogCategory wherePosition($value)
 * @method static Builder<static>|BlogCategory whereSlug($value)
 * @method static Builder<static>|BlogCategory whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'name',
    'slug',
    'description',
    'parent_id',
    'is_active',
    'position',
])]
class BlogCategory extends Model
{
    use HasFactory;

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(BlogPost::class);
    }

    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    #[Scope]
    protected function roots(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'position' => 'integer',
        ];
    }
}
