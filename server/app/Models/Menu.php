<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MenuLocationEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    use HasFactory;

    protected $table = 'menus';

    protected $fillable = [
        'name', 'location', 'is_active',
    ];

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
