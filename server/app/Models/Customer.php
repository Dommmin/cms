<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\OrderStatusEnum;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property Carbon|null $birth_date
 * @property User|null $user
 * @property int $user_id
 * @property string|null $first_name
 * @property string|null $last_name
 * @property string|null $company_name
 * @property string|null $tax_id
 * @property string|null $notes
 * @property array<array-key, mixed>|null $tags
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property CarbonImmutable|null $deleted_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, Address> $addresses
 * @property-read int|null $addresses_count
 * @property-read Cart|null $cart
 * @property-read NewsletterSubscriber|null $newsletterSubscriber
 * @property-read Collection<int, Order> $orders
 * @property-read int|null $orders_count
 * @property-read Collection<int, ProductReview> $reviews
 * @property-read int|null $reviews_count
 * @property-read Collection<int, Wishlist> $wishlists
 * @property-read int|null $wishlists_count
 *
 * @method static CustomerFactory factory($count = null, $state = [])
 * @method static Builder<static>|Customer newModelQuery()
 * @method static Builder<static>|Customer newQuery()
 * @method static Builder<static>|Customer onlyTrashed()
 * @method static Builder<static>|Customer query()
 * @method static Builder<static>|Customer whereCompanyName($value)
 * @method static Builder<static>|Customer whereCreatedAt($value)
 * @method static Builder<static>|Customer whereDeletedAt($value)
 * @method static Builder<static>|Customer whereEmail($value)
 * @method static Builder<static>|Customer whereFirstName($value)
 * @method static Builder<static>|Customer whereId($value)
 * @method static Builder<static>|Customer whereIsActive($value)
 * @method static Builder<static>|Customer whereLastName($value)
 * @method static Builder<static>|Customer whereNotes($value)
 * @method static Builder<static>|Customer wherePhone($value)
 * @method static Builder<static>|Customer whereTags($value)
 * @method static Builder<static>|Customer whereTaxId($value)
 * @method static Builder<static>|Customer whereUpdatedAt($value)
 * @method static Builder<static>|Customer whereUserId($value)
 * @method static Builder<static>|Customer withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|Customer withoutTrashed()
 *
 * @mixin Model
 */
#[Fillable([
    'user_id', 'first_name', 'last_name', 'email',
    'phone', 'company_name', 'tax_id', 'notes', 'is_active', 'tags',
])]
#[Table(name: 'customers')]
class Customer extends Model
{
    use HasFactory;
    use LogsActivity;
    use SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['first_name', 'last_name', 'email', 'phone', 'is_active', 'notes'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('customer');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Address, $this>
     */
    /**
     * @return HasMany<Address, $this>
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function defaultAddress(): ?Address
    {
        return $this->addresses()->where('is_default', true)->first();
    }

    /**
     * @return HasMany<Order, $this>
     */
    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * @return HasOne<Cart, $this>
     */
    /**
     * @return HasOne<Cart, $this>
     */
    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    /**
     * @return HasMany<Wishlist, $this>
     */
    /**
     * @return HasMany<Wishlist, $this>
     */
    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * @return HasMany<ProductReview, $this>
     */
    /**
     * @return HasMany<ProductReview, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    /**
     * @return HasOne<NewsletterSubscriber, $this>
     */
    /**
     * @return HasOne<NewsletterSubscriber, $this>
     */
    public function newsletterSubscriber(): HasOne
    {
        return $this->hasOne(NewsletterSubscriber::class);
    }

    public function fullName(): string
    {
        return mb_trim(sprintf('%s %s', $this->first_name, $this->last_name));
    }

    /** Total spent (grosze) */
    public function totalSpent(): int
    {
        return (int) $this->orders()
            ->where('status', OrderStatusEnum::DELIVERED->value)
            ->sum('total');
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'tags' => 'array',
        ];
    }
}
