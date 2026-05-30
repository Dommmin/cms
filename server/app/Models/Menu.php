<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MenuLocationEnum;
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
 * @property MenuLocationEnum|null $location
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, MenuItem> $allItems
 * @property-read int|null $all_items_count
 * @property-read Collection<int, MenuItem> $items
 * @property-read int|null $items_count
 *
 * @method static Builder<static>|Menu newModelQuery()
 * @method static Builder<static>|Menu newQuery()
 * @method static Builder<static>|Menu query()
 * @method static Builder<static>|Menu whereCreatedAt($value)
 * @method static Builder<static>|Menu whereId($value)
 * @method static Builder<static>|Menu whereIsActive($value)
 * @method static Builder<static>|Menu whereLocation($value)
 * @method static Builder<static>|Menu whereName($value)
 * @method static Builder<static>|Menu whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name', 'location', 'is_active',
])]
#[Table(name: 'menus')]
class Menu extends Model
{
    use HasFactory;

    protected $casts = [
        'location' => MenuLocationEnum::class,
        'is_active' => 'boolean',
    ];

    public static function byLocation(MenuLocationEnum $location): ?self
    {
        return self::query()->where('location', $location->value)->where('is_active', true)->first();
    }

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class)->whereNull('parent_id')->orderBy('position');
    }

    public function allItems(): HasMany
    {
        return $this->hasMany(MenuItem::class)->orderBy('position');
    }
}
