<?php

declare(strict_types=1);

namespace App\Modules\Core\Domain\Models;

use App\Enums\MenuLocation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Menu extends Model
{
    protected $table = 'menus';

    protected $fillable = [
        'name', 'location', 'is_active',
    ];

    protected $casts = [
        'location'  => MenuLocation::class,
        'is_active' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class)->where('parent_id', null)->orderBy('position');
    }

    public function allItems(): HasMany
    {
        return $this->hasMany(MenuItem::class)->orderBy('position');
    }

    public static function byLocation(MenuLocation $location): ?self
    {
        return self::where('location', $location->value)->where('is_active', true)->first();
    }
}

