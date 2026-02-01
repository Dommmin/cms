<?php

declare(strict_types=1);

namespace App\Modules\Core\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

final class Customer extends Model
{
    protected $table = 'customers';

    protected $fillable = [
        'user_id', 'first_name', 'last_name', 'email',
        'phone', 'company_name', 'tax_id',
    ];

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
        return $this->hasMany(\App\Modules\Ecommerce\Domain\Models\Order::class);
    }

    public function cart(): HasOne
    {
        return $this->hasOne(\App\Modules\Ecommerce\Domain\Models\Cart::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(\App\Modules\Ecommerce\Domain\Models\Wishlist::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(\App\Modules\Reviews\Domain\Models\ProductReview::class);
    }

    public function newsletterSubscriber(): HasOne
    {
        return $this->hasOne(\App\Modules\Newsletter\Domain\Models\NewsletterSubscriber::class);
    }

    public function fullName(): string
    {
        return trim("$this->first_name $this->last_name");
    }

    /** Total spent (grosze) */
    public function totalSpent(): int
    {
        return (int) $this->orders()
            ->where('status', \App\Enums\OrderStatus::Delivered->value)
            ->sum('total');
    }
}

