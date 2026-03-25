<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductFlag extends Model
{
    use HasFactory;

    protected $table = 'product_flags';

    protected $fillable = [
        'name',
        'slug',
        'color',
        'description',
        'is_active',
        'position',
    ];

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
