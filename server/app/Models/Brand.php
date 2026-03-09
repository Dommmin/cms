<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Brand extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'brands';

    protected $fillable = [
        'name', 'slug', 'description', 'logo_path', 'is_active', 'position',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public static function active(): Builder
    {
        return self::query()->where('is_active', true);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
