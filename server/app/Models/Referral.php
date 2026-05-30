<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
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
 * @property CarbonImmutable|null $paid_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read AffiliateCode $affiliateCode
 * @property-read Order|null $order
 * @property-read User|null $referredUser
 *
 * @method static Builder<static>|Referral newModelQuery()
 * @method static Builder<static>|Referral newQuery()
 * @method static Builder<static>|Referral query()
 * @method static Builder<static>|Referral whereAffiliateCodeId($value)
 * @method static Builder<static>|Referral whereCommissionAmount($value)
 * @method static Builder<static>|Referral whereCreatedAt($value)
 * @method static Builder<static>|Referral whereId($value)
 * @method static Builder<static>|Referral whereOrderId($value)
 * @method static Builder<static>|Referral whereOrderTotal($value)
 * @method static Builder<static>|Referral wherePaidAt($value)
 * @method static Builder<static>|Referral whereReferredUserId($value)
 * @method static Builder<static>|Referral whereStatus($value)
 * @method static Builder<static>|Referral whereUpdatedAt($value)
 *
 * @mixin Model
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
