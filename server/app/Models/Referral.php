<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $affiliate_code_id
 * @property int|null $order_id
 * @property int|null $referred_user_id
 * @property int $order_total Order total in cents at time of referral
 * @property int $commission_amount Commission in cents
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $paid_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\AffiliateCode $affiliateCode
 * @property-read \App\Models\Order|null $order
 * @property-read \App\Models\User|null $referredUser
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereAffiliateCodeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereCommissionAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereOrderTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral wherePaidAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereReferredUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
