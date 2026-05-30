<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\PromotionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string $type
 * @property numeric|null $value
 * @property numeric|null $min_value
 * @property numeric|null $max_discount
 * @property string $apply_to
 * @property bool $is_active
 * @property bool $is_stackable
 * @property int $priority
 * @property CarbonImmutable|null $starts_at
 * @property CarbonImmutable|null $ends_at
 * @property array<array-key, mixed>|null $metadata
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, Category> $categories
 * @property-read int|null $categories_count
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 *
 * @method static Builder<static>|Promotion active()
 * @method static PromotionFactory factory($count = null, $state = [])
 * @method static Builder<static>|Promotion newModelQuery()
 * @method static Builder<static>|Promotion newQuery()
 * @method static Builder<static>|Promotion ordered()
 * @method static Builder<static>|Promotion query()
 * @method static Builder<static>|Promotion whereApplyTo($value)
 * @method static Builder<static>|Promotion whereCreatedAt($value)
 * @method static Builder<static>|Promotion whereDescription($value)
 * @method static Builder<static>|Promotion whereEndsAt($value)
 * @method static Builder<static>|Promotion whereId($value)
 * @method static Builder<static>|Promotion whereIsActive($value)
 * @method static Builder<static>|Promotion whereIsStackable($value)
 * @method static Builder<static>|Promotion whereMaxDiscount($value)
 * @method static Builder<static>|Promotion whereMetadata($value)
 * @method static Builder<static>|Promotion whereMinValue($value)
 * @method static Builder<static>|Promotion whereName($value)
 * @method static Builder<static>|Promotion wherePriority($value)
 * @method static Builder<static>|Promotion whereSlug($value)
 * @method static Builder<static>|Promotion whereStartsAt($value)
 * @method static Builder<static>|Promotion whereType($value)
 * @method static Builder<static>|Promotion whereUpdatedAt($value)
 * @method static Builder<static>|Promotion whereValue($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name', 'slug', 'description', 'type', 'value', 'min_value', 'max_discount',
    'apply_to', 'is_active', 'is_stackable', 'priority', 'starts_at', 'ends_at', 'metadata',
])]
#[Table(name: 'promotions')]
class Promotion extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $casts = [
        'is_active' => 'boolean',
        'is_stackable' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'type', 'value', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('promotion');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'promotion_products')
            ->withPivot('discount_value', 'discount_type')
            ->withTimestamps();
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'promotion_categories')
            ->withPivot('discount_value', 'discount_type')
            ->withTimestamps();
    }

    public function getApplicableProducts()
    {
        if ($this->apply_to === 'all') {
            return Product::query();
        }

        if ($this->apply_to === 'specific_products') {
            return $this->products();
        }

        if ($this->apply_to === 'specific_categories') {
            return Product::query()->whereHas('categories', function ($query): void {
                $query->whereIn('categories.id', $this->categories()->pluck('categories.id'));
            });
        }

        return Product::query()->whereRaw('1 = 0');
    }

    public function calculateDiscount($product, $quantity = 1, $originalPrice = null)
    {
        $price = $originalPrice ?? $product->price;
        $discountValue = 0;

        switch ($this->type) {
            case 'percentage':
                $discountValue = $price * ($this->value / 100) * $quantity;
                break;

            case 'fixed_amount':
                $discountValue = min($this->value, $price * $quantity);
                break;

            case 'buy_x_get_y':
                $buyQty = $this->metadata['buy_quantity'] ?? 1;
                $getQty = $this->metadata['get_quantity'] ?? 1;
                $discountPercent = $this->metadata['discount_percentage'] ?? 100;

                $eligibleSets = intdiv($quantity, $buyQty);
                $freeItems = min($eligibleSets * $getQty, $quantity);
                $discountValue = ($price * $discountPercent / 100) * $freeItems;
                break;

            case 'free_shipping':
                $discountValue = $product->shipping_cost ?? 0;
                break;
        }

        if ($this->max_discount && $discountValue > $this->max_discount) {
            $discountValue = $this->max_discount;
        }

        if ($this->min_value && $price * $quantity < $this->min_value) {
            return 0;
        }

        return $discountValue;
    }

    #[Scope]
    protected function active($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q): void {
                $q->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q): void {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', now());
            });
    }

    #[Scope]
    protected function ordered($query)
    {
        return $query->orderBy('priority')->orderBy('name');
    }
}
