<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use App\Modules\Core\Domain\Models\Customer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

final class Wishlist extends Model
{
    protected $table = 'wishlists';

    protected $fillable = [
        'customer_id', 'name', 'token', 'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }

    /** Auto-generuj token przy creacji */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $wishlist) {
            $wishlist->token ??= Str::random(32);
        });
    }
}

