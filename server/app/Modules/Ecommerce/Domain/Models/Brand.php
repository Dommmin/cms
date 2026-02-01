<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Brand extends Model
{
    use SoftDeletes;

    protected $table = 'brands';

    protected $fillable = [
        'name', 'slug', 'description', 'logo_path', 'is_active', 'position',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public static function active(): \Illuminate\Database\Eloquent\Builder
    {
        return static::where('is_active', true);
    }
}

