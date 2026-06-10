<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
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
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @property-read Collection<int, LoyaltyTransaction> $transactions
 * @property-read int|null $transactions_count
 *
 * @method static Builder<static>|LoyaltyPoint newModelQuery()
 * @method static Builder<static>|LoyaltyPoint newQuery()
 * @method static Builder<static>|LoyaltyPoint query()
 * @method static Builder<static>|LoyaltyPoint whereBalance($value)
 * @method static Builder<static>|LoyaltyPoint whereCreatedAt($value)
 * @method static Builder<static>|LoyaltyPoint whereCustomerId($value)
 * @method static Builder<static>|LoyaltyPoint whereId($value)
 * @method static Builder<static>|LoyaltyPoint whereTotalEarned($value)
 * @method static Builder<static>|LoyaltyPoint whereTotalSpent($value)
 * @method static Builder<static>|LoyaltyPoint whereUpdatedAt($value)
 *
 * @mixin Model
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

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(LoyaltyTransaction::class, 'customer_id');
    }

    protected function casts(): array
    {
        return [
            'balance' => 'integer',
            'total_earned' => 'integer',
            'total_spent' => 'integer',
        ];
    }
}
