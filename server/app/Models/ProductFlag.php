<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $color
 * @property string|null $description
 * @property bool $is_active
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 *
 * @method static Builder<static>|ProductFlag active()
 * @method static Builder<static>|ProductFlag newModelQuery()
 * @method static Builder<static>|ProductFlag newQuery()
 * @method static Builder<static>|ProductFlag ordered()
 * @method static Builder<static>|ProductFlag query()
 * @method static Builder<static>|ProductFlag whereColor($value)
 * @method static Builder<static>|ProductFlag whereCreatedAt($value)
 * @method static Builder<static>|ProductFlag whereDescription($value)
 * @method static Builder<static>|ProductFlag whereId($value)
 * @method static Builder<static>|ProductFlag whereIsActive($value)
 * @method static Builder<static>|ProductFlag whereName($value)
 * @method static Builder<static>|ProductFlag wherePosition($value)
 * @method static Builder<static>|ProductFlag whereSlug($value)
 * @method static Builder<static>|ProductFlag whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name',
    'slug',
    'color',
    'description',
    'is_active',
    'position',
])]
#[Table(name: 'product_flags')]
class ProductFlag extends Model
{
    use HasFactory;

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_flag_product')
            ->withTimestamps()
            ->orderBy('position');
    }

    #[Scope]
    protected function active($query)
    {
        return $query->where('is_active', true);
    }

    #[Scope]
    protected function ordered($query)
    {
        return $query->orderBy('position')->orderBy('name');
    }
}
