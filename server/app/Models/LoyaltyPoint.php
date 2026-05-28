<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $balance
 * @property int $total_earned
 * @property int $total_spent
 * @property int $id
 * @property int $customer_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Customer|null $customer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LoyaltyTransaction> $transactions
 * @property-read int|null $transactions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyPoint newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyPoint newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyPoint query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyPoint whereBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyPoint whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyPoint whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyPoint whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyPoint whereTotalEarned($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyPoint whereTotalSpent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyaltyPoint whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'customer_id',
    'balance',
    'total_earned',
    'total_spent',
])]
class LoyaltyPoint extends Model
{
    use HasFactory;

    protected $casts = [
        'balance' => 'integer',
        'total_earned' => 'integer',
        'total_spent' => 'integer',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(LoyaltyTransaction::class, 'customer_id');
    }
}
