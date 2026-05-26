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
use Illuminate\Support\Carbon;
use Laravel\Scout\Searchable;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Translatable\HasTranslations;

/**
 * Category Model
 * Moved to Ecommerce module
 *
 * @property int $id
 * @property array<string, string>|string $name
 * @property array<string, string>|string $slug
 * @property array<string, string>|string|null $description
 * @property bool $is_active
 * @property string|null $collection_type
 * @property int|null $parent_id
 * @property string|null $image_path
 * @property Carbon|null $created_at
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
    use Searchable;

    /** @var array<int, string> */
    public array $translatable = ['name', 'slug', 'description'];

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

    public function searchableAs(): string
    {
        return 'categories';
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => (string) $this->id,
            'name' => is_array($this->name) ? ($this->name[app()->getLocale()] ?? reset($this->name)) : (string) $this->name,
            'slug' => is_array($this->slug) ? ($this->slug[app()->getLocale()] ?? reset($this->slug)) : (string) $this->slug,
            'description' => is_array($this->description) ? strip_tags((string) ($this->description[app()->getLocale()] ?? reset($this->description))) : strip_tags((string) $this->description),
            'is_active' => $this->is_active,
            'parent_id' => $this->parent_id ? (string) $this->parent_id : null,
            'thumbnail' => $this->image_path ?: null,
            'products_count' => $this->products()->count(),
            'created_at' => $this->created_at?->timestamp,
        ];
    }

    public function shouldBeSearchable(): bool
    {
        return $this->is_active
            && (bool) Setting::get('search', 'index_categories', true);
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
