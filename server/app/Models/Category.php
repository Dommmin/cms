<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasMetafields;
use App\Concerns\HasTags;
use App\Concerns\HasVersions;
use App\Traits\HasSeoMetadata;
use Carbon\CarbonImmutable;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection as SupportCollection;
use Laravel\Scout\Searchable;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
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
 * @property int|null $product_type_id
 * @property array<array-key, mixed>|null $rules
 * @property string $rules_match
 * @property int $position
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property string|null $canonical_url
 * @property string $meta_robots
 * @property string|null $og_image
 * @property bool $sitemap_exclude
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, Category> $allChildren
 * @property-read int|null $all_children_count
 * @property-read Collection<int, Category> $children
 * @property-read int|null $children_count
 * @property-read Collection<int, CategoryAttributeSchema> $attributeSchemas
 * @property-read int|null $attribute_schemas_count
 * @property-read Collection<int, Attribute> $schemaAttributes
 * @property-read int|null $schema_attributes_count
 * @property-read array $translatable_columns_from
 * @property-read Collection<int, Metafield> $metafields
 * @property-read int|null $metafields_count
 * @property-read Category|null $parent
 * @property-read ProductType|null $productType
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 * @property-read Collection<int, Tag> $tags
 * @property-read int|null $tags_count
 * @property-read TaxRate|null $taxRate
 * @property-read mixed $translations
 * @property-read Collection<int, ModelVersion> $versions
 * @property-read int|null $versions_count
 *
 * @method static CategoryFactory factory($count = null, $state = [])
 * @method static Builder<static>|Category newModelQuery()
 * @method static Builder<static>|Category newQuery()
 * @method static Builder<static>|Category query()
 * @method static Builder<static>|Category whereCanonicalUrl($value)
 * @method static Builder<static>|Category whereCollectionType($value)
 * @method static Builder<static>|Category whereCreatedAt($value)
 * @method static Builder<static>|Category whereDescription($value)
 * @method static Builder<static>|Category whereId($value)
 * @method static Builder<static>|Category whereImagePath($value)
 * @method static Builder<static>|Category whereIsActive($value)
 * @method static Builder<static>|Category whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Category whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Category whereLocale(string $column, string $locale)
 * @method static Builder<static>|Category whereLocales(string $column, array $locales)
 * @method static Builder<static>|Category whereMetaRobots($value)
 * @method static Builder<static>|Category whereName($value)
 * @method static Builder<static>|Category whereOgImage($value)
 * @method static Builder<static>|Category whereParentId($value)
 * @method static Builder<static>|Category wherePosition($value)
 * @method static Builder<static>|Category whereProductTypeId($value)
 * @method static Builder<static>|Category whereRules($value)
 * @method static Builder<static>|Category whereRulesMatch($value)
 * @method static Builder<static>|Category whereSeoDescription($value)
 * @method static Builder<static>|Category whereSeoTitle($value)
 * @method static Builder<static>|Category whereSitemapExclude($value)
 * @method static Builder<static>|Category whereSlug($value)
 * @method static Builder<static>|Category whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Guarded(['id'])]
#[Table(name: 'categories')]
class Category extends Model
{
    use HasFactory;
    use HasMetafields;
    use HasSeoMetadata;
    use HasTags;
    use HasTranslations;
    use HasVersions;
    use LogsActivity;
    use Searchable;

    /** @var array<int, string> */
    public array $translatable = ['name', 'slug', 'description', 'seo_title', 'seo_description'];

    /** @var array<int, string> */
    protected array $versionedAttributes = ['name', 'slug', 'description', 'is_active', 'parent_id'];

    protected int $maxVersions = 30;

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
            ->dontLogEmptyChanges()
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

    public function attributeSchemas(): HasMany
    {
        return $this->hasMany(CategoryAttributeSchema::class)->orderBy('position');
    }

    public function schemaAttributes(): BelongsToMany
    {
        return $this->belongsToMany(Attribute::class, 'category_attribute_schemas')
            ->withPivot(['is_required', 'position'])
            ->orderBy('category_attribute_schemas.position');
    }

    public function resolvedAttributeSchemas(): SupportCollection
    {
        $this->loadMissing('parent');

        $resolvedSchemas = $this->parent
            ? $this->parent->resolvedAttributeSchemas()
                ->map(
                    function (CategoryAttributeSchema $schema): CategoryAttributeSchema {
                        $inheritedSchema = clone $schema;
                        $inheritedSchema->setAttribute('is_inherited', true);

                        return $inheritedSchema;
                    }
                )
                ->keyBy('attribute_id')
            : collect();

        $directSchemas = $this->attributeSchemas()
            ->with('attribute')
            ->get()
            ->map(function ($schema): CategoryAttributeSchema {
                /** @var CategoryAttributeSchema $schema */
                $schema->setAttribute('is_inherited', false);
                $schema->setAttribute('schema_owner_category_id', $schema->category_id);

                return $schema;
            })
            ->keyBy('attribute_id');

        foreach ($directSchemas as $attributeId => $schema) {
            $resolvedSchemas->put($attributeId, $schema);
        }

        return $resolvedSchemas
            ->sortBy(fn (CategoryAttributeSchema $schema): string => mb_str_pad((string) $schema->position, 3, '0', STR_PAD_LEFT).'-'.$schema->attribute->name)
            ->values();
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
        $this->loadMissing('parent');

        $path = [];
        $current = $this;

        while ($current) {
            array_unshift($path, $current);
            $current = $current->parent;
        }

        return $path;
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sitemap_exclude' => 'boolean',
            'rules' => 'array',
        ];
    }
}
