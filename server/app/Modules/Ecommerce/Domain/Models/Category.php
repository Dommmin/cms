<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use App\Modules\Ecommerce\Domain\Models\ProductType;
use App\Modules\Ecommerce\Domain\Models\TaxRate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Category Model
 * Moved to Ecommerce module
 */
final class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = [
        'parent_id', 'product_type_id', 'name', 'slug', 'description',
        'image_path', 'is_active', 'position', 'seo_title', 'seo_description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('position');
    }

    public function productType(): BelongsTo
    {
        return $this->belongsTo(ProductType::class);
    }

    public function taxRate(): BelongsTo
    {
        return $this->belongsTo(TaxRate::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Recursively get all child categories
     */
    public function allChildren(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')
            ->with('allChildren');
    }

    /**
     * Breadcrumb path from root to this category
     */
    public function breadcrumb(): array
    {
        $path = [];
        $current = $this;

        while ($current) {
            array_unshift($path, $current);
            $current = $current->parent;
        }

        return $path;
    }

    public static function roots()
    {
        return static::where('parent_id', null)->orderBy('position')->get();
    }
}

