<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasMetafields;
use App\Concerns\HasTags;
use App\Concerns\HasVersions;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Translatable\HasTranslations;

/**
 * Category Model
 * Moved to Ecommerce module
 */
#[Guarded(['id'])]
#[Table(name: 'categories')]
class Category extends Model
{
    use HasFactory;
    use HasMetafields;
    use HasTags;
    use HasTranslations;
    use HasVersions;
    use LogsActivity;

    /** @var array<int, string> */
    public array $translatable = ['name', 'description'];

    /** @var array<int, string> */
    protected array $versionedAttributes = ['name', 'slug', 'description', 'is_active', 'parent_id'];

    protected int $maxVersions = 30;

    protected $casts = [
        'is_active' => 'boolean',
        'sitemap_exclude' => 'boolean',
        'rules' => 'array',
    ];

    public static function roots()
    {
        return self::query()->where('parent_id')->orderBy('position')->get();
    }

    public function isSmartCollection(): bool
    {
        return $this->collection_type === 'smart';
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'slug', 'is_active', 'parent_id'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('category');
    }

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
}
