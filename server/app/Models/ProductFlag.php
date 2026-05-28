<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
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
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
 * @property-read int|null $products_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag ordered()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductFlag whereUpdatedAt($value)
 * @mixin \Eloquent
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
