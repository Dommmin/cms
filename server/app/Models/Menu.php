<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MenuLocationEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
