<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property int $customer_id
 * @property string $type
 * @property int $points
 * @property string $description
 * @property string $source_type
 * @property int $source_id
 * @property int $balance_after
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Customer|null $customer
 * @property-read Model|\Eloquent $source
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction whereBalanceAfter($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction wherePoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction whereSourceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction whereSourceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyTransaction whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'customer_id',
    'type',
    'points',
    'description',
    'source_type',
    'source_id',
    'balance_after',
])]
class LoyaltyTransaction extends Model
{
    use HasFactory;

    protected $casts = [
        'points' => 'integer',
        'balance_after' => 'integer',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }
}
