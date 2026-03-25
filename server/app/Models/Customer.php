<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\OrderStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'customers';

    protected $fillable = [
        'user_id', 'first_name', 'last_name', 'email',
        'phone', 'company_name', 'tax_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function defaultAddress(): ?Address
    {
        return $this->addresses()->where('is_default', true)->first();
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

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
}
