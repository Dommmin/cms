<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'affiliate_code_id',
    'order_id',
    'referred_user_id',
    'order_total',
    'commission_amount',
    'status',
    'paid_at',
])]
class Referral extends Model
{
    use HasFactory;

    public function affiliateCode(): BelongsTo
    {
        return $this->belongsTo(AffiliateCode::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function referredUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }

    protected function casts(): array
    {
        return [
            'order_total' => 'integer',
            'commission_amount' => 'integer',
            'paid_at' => 'datetime',
        ];
    }
}
